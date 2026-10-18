# alkove-ai/alkove-timbre-1-preview

## Resumen

alkove-timbre-1-preview es un modelo de verificación e identificación de locutor (speaker verification / speaker embedding) publicado por alkove-ai. Convierte una ventana de voz de 16 kHz en dos vectores unitarios de 192 dimensiones: `embedding`, pensado para alimentar al modelo complementario alkove-focus-1-preview y seguir a una persona concreta, e `id`, pensado para decidir por producto escalar si dos ventanas corresponden a la misma voz. Forma parte de Alkove, un SDK de voz que se ejecuta íntegramente en el dispositivo (navegador o teléfono), sin enviar audio a ningún servidor.

El modelo se distribuye como un único fichero ONNX de 0,87 MB en int8 (opset 17) y se ejecuta con onnxruntime u onnxruntime-web 1.30 o superior, ya que emplea el operador estándar `DFT`. Su interés práctico está en la relación entre tamaño y precisión: en la comparativa publicada por el autor alcanza un EER del 2,95 % en el protocolo de huella de unos 12 s contra una ventana de 1,5 s, frente al 1,72 % de CAM++ con un fichero 32 veces mayor (28 MB).

Se trata de una versión preview: el autor advierte de que los pesos y la interfaz pueden cambiar antes de la versión 1. No está pensado para autenticación ni control de acceso, sino como filtro de conveniencia ("¿es mi usuario?") y para condicionar wake word o interrupciones por voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (extractor de embeddings de locutor; entrada de audio en ventanas, dos salidas de 192 dimensiones con norma unitaria) |
| Parametros totales | No disponible (el fichero int8 publicado ocupa 0,87 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de ventana de audio: minimo 280 muestras; 1,5 s / 24.000 muestras recomendadas a 16 kHz) |
| Tipos de cuantizacion | int8 (fichero publicado); el autor indica que el int8 esta a menos de 0,05 puntos del modelo float32 |
| Idiomas soportados | No disponible como lista oficial; los benchmarks cubren 7 idiomas (frances, ingles, espanol, italiano, portugues, catalan y rumano) |
| Licencia | Apache-2.0 (copyright 2026 Eddy Bordi) |
| Formato de pesos | ONNX (opset 17), int8, acompanado de un manifiesto JSON con sha256, tamanos, entradas y salidas |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (no se especifica si es una CNN tipo ECAPA/TDNN, un transformer o un modelo hibrido). Lo documentado es la interfaz: entrada `audio` de tipo float32 con forma `[1, samples]` (mono, 16 kHz, rango -1..1) y dos salidas float32 de forma `[1, 192]` con norma unitaria, `embedding` e `id`. El modelo se exporta a ONNX opset 17 y se cuantiza a int8; el uso del operador `DFT` es lo que obliga a onnxruntime y onnxruntime-web 1.30 o superior.

Tampoco se documentan el volumen ni la composicion del corpus de entrenamiento, ni si hubo fases de RLHF/DPO (no aplicables en un modelo de embeddings). Lo que si se detalla es la evaluacion: los conjuntos de test de Common Voice en 7 idiomas, con 2.029 locutores (4 clips por locutor, 8.057 clips) que, segun el autor, nunca fueron vistos en entrenamiento. El enrolamiento se realiza promediando los vectores de varias ventanas de la misma voz y renormalizando el resultado, de modo que la huella puede aprenderse mientras el usuario habla, sin pantalla de registro.

## Capacidades

- Extraccion de huella de voz (voiceprint) a partir de ventanas de 16 kHz, con dos representaciones de 192 dimensiones y norma unitaria.
- Verificacion de locutor mediante producto escalar entre vectores `id` (misma voz o no).
- Enrolamiento incremental: media de varias ventanas y renormalizacion, sin fase de registro dedicada.
- Generacion de la huella que consume alkove-focus-1-preview para aislar la voz de una persona concreta.
- Ejecucion en navegador mediante WebAssembly (onnxruntime-web) y en dispositivo, sin envio de audio a servidores.
- Modelo pequeno (0,87 MB) apto para movil y para inicializacion rapida en cliente.
- No incluye generacion de texto, codigo, vision, tool calling ni razonamiento multi-paso; es un extractor de caracteristicas de audio.

## Casos de uso

- Wake word restringida al propietario: se calcula la huella del usuario y se compara cada ventana previa a la activacion con su `id`, de forma que solo su voz active o interrumpa el asistente. La latencia de 4,7 ms por ventana de 1,5 s en un Galaxy Z Fold8 permite hacerlo en el propio dispositivo.
- Aislamiento de voz en llamadas o notas de voz: la salida `embedding` se pasa a alkove-focus-1-preview para seguir a un interlocutor concreto y atenuar el resto, todo en el navegador.
- Personalizacion de asistentes web: el SDK aprende la huella mientras el usuario habla y adapta respuestas o turnos al locutor habitual, sin formulario de registro.
- Control de calidad de corpus de voz: en un pipeline de datos se verifica por producto escalar que todos los clips etiquetados como un mismo locutor lo son realmente, filtrando muestras mal etiquetadas antes del entrenamiento.
- Transcripcion con distincion del usuario en apps de reunion o dictado: se compara cada segmento con la huella enrolada para separar "mi usuario" del resto de participantes y organizar la salida por hablante conocido.
- Confirmacion de comandos cotidianos: antes de ejecutar acciones no criticas (reproducir musica, abrir una nota), se comprueba que la orden procede del usuario habitual, como filtro de conveniencia y no como medida de seguridad.
- Procesamiento offline con privacidad por diseno: aplicaciones en navegador o movil donde el audio no puede salir del dispositivo por requisitos normativos o de producto, gracias a un modelo de menos de 1 MB.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (`verified: false`, no verificados de forma independiente). Metrica: equal error rate (EER), menor es mejor. Protocolo: test sets de Common Voice en 7 idiomas, 2.029 locutores no vistos en entrenamiento, 4 clips por locutor (8.057 clips).

| EER | alkove-timbre `id` (0,87 MB) | CAM++ (28 MB) |
|---|---|---|
| Huella de unos 12 s (3 clips) contra ventana de 1,5 s | 2,95 % | 1,72 % |
| Igual, solo impostores con tono cercano (+-2 semitonos) | 4,08 % | 2,32 % |
| Clip contra clip, clips completos (unos 4 s) | 4,46 % | 2,61 % |
| Clip contra clip, 3 s | 4,95 % | 3,02 % |
| Clip contra clip, 1,5 s | 7,19 % | 4,75 % |

EER por idioma en el protocolo huella contra ventana de 1,5 s: frances 2,68 %, ingles 3,27 %, espanol 2,71 %, italiano 2,65 %, portugues 4,16 %, catalan 2,84 %, rumano 2,37 % (solo 30 locutores). Media de los 7 idiomas.

Protocolo mas dificil, con ruido, musica u otra voz (1.424 ventanas, mas proximo a una llamada real; margen aproximado de +-1 punto):

| EER | Microfono directo | Tras Focus, con huella | Tras Focus, sin huella |
|---|---|---|---|
| `id`, ventanas de 1,5 s | 11,9 % | 9,9 % | 10,8 % |
| `id`, ventanas de 1 s | 14,2 % | 14,0 % | 12,5 % |
| `embedding`, ventanas de 1,5 s | 15,9 % | 18,8 % | 19,3 % |

Datos de evaluacion citados: Common Voice French dev (CC0), Multilingual LibriSpeech French dev (CC BY 4.0), LibriTTS-R dev-clean (CC BY 4.0); ruido y musica de MUSAN (CC BY 4.0), DNS Challenge (CC BY 4.0) y RIRS_NOISES (Apache-2.0).

Rendimiento del autor: 4,7 ms por ventana de 1,5 s en CPU de Galaxy Z Fold8 con Chrome, WebAssembly y un solo hilo (implica del orden de 200 ventanas por segundo, unas 300 veces tiempo real en ese dispositivo).

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos ocupan 0,87 MB en int8 y la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; no se documenta backend GPU para este modelo.
- GPU de consumo: irrelevante; el modelo cabe en cualquier dispositivo con onnxruntime, incluido un telefono.
- Despliegue: onnxruntime (Python, C++, JS) y onnxruntime-web 1.30 o superior con WebAssembly; integrable en aplicaciones moviles y de navegador. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia: 4,7 ms por ventana de 1,5 s (1 hilo, WebAssembly, Galaxy Z Fold8). No se publican datos de throughput en otras plataformas.
- Memoria de trabajo y coste de inicializacion de la sesion ONNX: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | EER huella 12 s vs 1,5 s | EER clip vs clip | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| alkove-timbre-1-preview | 0,87 MB (int8) | 2,95 % | 4,46 % | Apache-2.0 | Si (onnxruntime-web, WebAssembly) |
| 3D-Speaker CAM++ (`speech_campplus_sv_zh_en_16k-common_advanced`) | 28 MB | 1,72 % | 2,61 % | Apache-2.0 | No documentado en la informacion disponible |
| alkove-focus-1-preview | No disponible | No aplica (modelo de separacion/aislamiento, no de verificacion) | No aplica | No disponible en la informacion proporcionada | No disponible |

CAM++ obtiene mejor EER en todos los protocolos publicados (aproximadamente 1,2-1,8 puntos de ventaja en huella contra ventana y 1,8-2,4 puntos en clip contra clip), a cambio de un fichero 32 veces mayor y sin datos publicos de ejecucion en WebAssembly. No se dispone de resultados de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite audio a 16 kHz; no se documenta remuestreo interno.
- Ventanas cortas (menos de 1 s) son poco fiables: el EER sube al 7,19 % a 1,5 s y al 14,2 % a 1 s en el protocolo con ruido.
- En condiciones reales (ruido, musica, otra voz) el EER se situa entre el 9,9 % y el 19,3 %, muy por encima de las cifras de laboratorio.
- No debe usarse para autenticacion ni control de acceso: con un EER cercano al 3 % es un filtro de conveniencia, no una comprobacion de seguridad.
- Fuera de alcance: identificacion o seguimiento de personas y comparacion forense de locutores.
- `embedding` esta disenado para alkove-focus-1-preview; para comparar voces debe usarse `id`.
- Sesgos demograficos y de acento: no documentados. La evaluacion cubre 7 idiomas, con solo 30 locutores en rumano y sin desglose por edad, genero o canal de grabacion.
- Riesgo de falsos positivos y falsos negativos inherente a la tarea; no hay modo de calibracion por umbral documentado mas alla del producto escalar.
- El modelo es una preview: pesos e interfaz pueden cambiar antes de la version 1, lo que desaconseja fijar contratos de produccion sobre el fichero actual.
- Licencia Apache-2.0: permite uso comercial, con obligacion de conservar avisos de copyright y el fichero NOTICE; no concede derechos de marca.
- Los resultados del model-index estan marcados como no verificados (`verified: false`); proceden del autor.
- No se documentan datos de entrenamiento, por lo que no puede evaluarse el solapamiento con dominios o locutores concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Modelo complementario alkove-focus-1-preview: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Sitio del proyecto Alkove: https://alkove.ai
- Modelo de referencia CAM++ citado en la model card: `speech_campplus_sv_zh_en_16k-common_advanced` (3D-Speaker, Apache-2.0); no se proporciona URL en la informacion disponible.
- Conjuntos de evaluacion citados: Common Voice (CC0), Multilingual LibriSpeech (CC BY 4.0), LibriTTS-R (CC BY 4.0), MUSAN (CC BY 4.0), DNS Challenge (CC BY 4.0), RIRS_NOISES (Apache-2.0); no se proporcionan URL en la informacion disponible.
- La busqueda web realizada no devolvio enlaces relevantes al modelo (resultados no relacionados).
