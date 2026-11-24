# hojinlab/ai-read-forest-voice-cnn

## Resumen

`ai-read-forest-voice-cnn` es una red neuronal convolucional (CNN) de tamano minimo (15.353 parametros, 61 KB en float32) desarrollada por `hojinlab` que clasifica fragmentos de audio de 3 segundos como voz masculina o femenina. No es un modelo de lenguaje ni un sistema de reconocimiento de habla: es un clasificador binario de audio que opera sobre representaciones de espectrograma de mel. Su proposito original es didactico: sirve como demo interactiva en la pagina de un curso universitario no comercial ("AI로 읽는 숲", equipo 상어) que explica paso a paso como BirdNET convierte sonido en etiquetas, permitiendo al visitante grabar su voz y ver la misma cadena de procesamiento (forma de onda → espectrograma → convolucion → vector → sigmoide) ejecutarse en el navegador.

El modelo consume espectrogramas de 96 × 511 generados en JavaScript replicando la banda baja de BirdNET V2.4 (3 s a 48 kHz, ventana Hann periodica de 2048 muestras, hop 278, potencia |X|², 96 bandas mel de 0 a 3000 Hz con escala TF/HTK, exponente 0,22952409). La arquitectura es una pila de cuatro convoluciones con stride 2, normalizacion por lotes plegada en los pesos, pooling global promedio y una capa lineal con activacion sigmoide que devuelve P(voz masculina).

Es relevante unicamente como pieza educativa y como ejemplo de despliegue de inferencia en JavaScript puro sin dependencias de framework. No esta pensado para produccion, identificacion de personas ni perfilado. Su licencia CC BY 4.0 permite reutilizacion con atribucion, pero sus limitaciones (entrenado solo con ingles leido de audiolibros, no probado en otros idiomas ni en condiciones acusticas reales) restringen severamente cualquier uso fuera del aula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (4 convoluciones + global average pooling + lineal + sigmoide) |
| Parametros totales | 15.353 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de clips fijos de 3 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ingles (entrenado solo con ingles leido) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La red recibe un tensor de entrada de 1 × 96 × 511 (canal unico, 96 bandas mel, 511 frames temporales) y aplica cuatro bloques convolucionales con ReLU y stride 2: conv 4×8 → 8 × 48 × 256; conv 3×3 → 16 × 24 × 128; conv 3×3 → 32 × 12 × 64; conv 3×3 → 32 × 6 × 32. Tras un global average pooling se obtiene un vector de 32 dimensiones que alimenta una capa lineal con sigmoide, produciendo P(voz masculina). La normalizacion por lotes esta plegada en las convoluciones dentro de `model.safetensors` para simplificar la inferencia en JavaScript. El `config.json` documenta los ajustes exactos de features y capas.

El entrenamiento usa LibriSpeech (Panayotov et al., 2015, CC BY 4.0), audiolibros en ingles, a traves de la copia `openslr/librispeech_asr`. La etiqueta de sexo proviene de `SPEAKERS.TXT` (F/M) y los hablantes nunca se solapan entre splits. Conjuntos: train-clean-100 con hasta 40 utterances por lector (251 hablantes, 125 F / 126 M, 10.341 utterances); dev-clean para seleccion de modelo (40 hablantes, 20/20, 2.703 utterances); test-clean reservado (40 hablantes, 20/20, 2.620 utterances). Se aplico aumento de datos con recortes aleatorios de 3 s, ruido anadido en la mitad de los recortes (5–40 dB SNR), desplazamientos temporales aleatorios y enmascaramiento temporal. No se reporta uso de RLHF ni DPO, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de audio: devuelve P(voz masculina) para un clip de 3 segundos de habla en ingles.
- Procesamiento de espectrogramas de mel con la configuracion de banda baja de BirdNET V2.4 (96 bandas, 0–3000 Hz).
- Inferencia en JavaScript puro en el navegador, sin dependencias de framework, lo que permite dibujar cada capa del modelo con fines didacticos.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: no disponible; solo se entreno y evaluo con ingles.
- Capacidad especial: ninguna mas alla de la clasificacion binaria; no hay modo thinking, audio generativo ni multimodalidad.

## Casos de uso

- Demo educativa en el aula: la pagina del curso graba la voz del visitante, calcula el espectrograma en JavaScript y ejecuta la CNN capa por capa para mostrar como BirdNET transforma sonido en etiqueta. Es el caso de uso para el que fue disenado y el unico plenamente validado.
- Ensenanza de fundamentos de deep learning: al ser una red de 15.353 parametros con pesos legibles en safetensors y un `train.py` incluido, sirve para explicar convoluciones, stride, pooling global y activacion sigmoide sin distracciones de escala.
- Ejemplo de despliegue de inferencia en el navegador: el codigo `js/voice.js` del repositorio del sitio demuestra como portar una CNN pequena a JavaScript para ejecucion cliente-side, util como referencia para proyectos de edge computing didacticos.
- Prototipado de pipelines de audio: sirve como bloque de prueba para validar la cadena forma de onda → espectrograma mel → clasificador antes de escalar a modelos mayores, aunque sus resultados no son extrapolables a produccion.
- Demostracion de aumento de datos: el `train.py` documenta recortes aleatorios, ruido a distintos SNR, desplazamientos y enmascaramiento temporal, lo que lo convierte en material de clase para explicar tecnicas de regularizacion en audio.
- Comparacion conceptual con BirdNET: al replicar su banda baja y su esquema de espectrograma, permite ilustrar las diferencias entre un clasificador de especies de aves y uno de voz humana sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre hablantes no vistos (test-clean):

| Metrica | Valor |
|---|---|
| Precision por clip de 3 s | 94,8% (4.600 clips) |
| Clips femeninos correctos | 95,1% |
| Clips masculinos correctos | 94,4% |
| Precision por hablante (mayoria de clips) | 100,0% (40 hablantes) |
| Precision por clip en validacion (dev-clean) | 93,9% |
| Precision por hablante en validacion (dev-clean) | 97,5% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en float32 (15.353 parametros × 4 bytes ≈ 61 KB de pesos), mas el tensor de entrada de 96 × 511 floats (≈ 196 KB). Cabe en cualquier dispositivo.
- GPU recomendadas: no requiere GPU; la inferencia en JavaScript se ejecuta en CPU del navegador. Cualquier GPU (A100, H100, RTX 4090, integradas) es sobredimensionada.
- Cabe en GPU de consumo: si, en cualquiera, e incluso en microcontroladores y navegadores moviles.
- Opciones de despliegue: JavaScript puro en el navegador (`js/voice.js` del repositorio del sitio); PyTorch para cargar `model.safetensors` y ejecutar `train.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tamano.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por el tamano del modelo, la latencia en navegador sera del orden de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros clasificadores de sexo de voz en la informacion proporcionada. Como referencia cualitativa de la categoria:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-read-forest-voice-cnn | 15.353 | no aplica (clips de 3 s) | 94,8% accuracy por clip en test-clean | CC BY 4.0 | Hugging Face |
| BirdNET V2.4 (referencia de diseno) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Clasificadores de sexo de voz genericos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen alternativas directamente comparables en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con habla leida en ingles de audiolibros; no probado con hablantes de coreano, ninos, canto, susurros, microfonos de telefono en salas ruidosas ni otros idiomas.
- El modelo infiere a partir de senales acusticas como el tono de voz; las voces no se mapean limpiamente a dos clases y las etiquetas son metadatos F/M del corpus. La salida indica como suena una voz para este modelo pequeno, no la identidad de genero de una persona, y puede equivocarse.
- Las puntuaciones no son probabilidades calibradas; no deben interpretarse como confianza real.
- Uso previsto: demo de aula. No debe emplearse para identificar ni perfilar personas.
- La entrada muy silenciosa se amplifica con el escalado por clip a −1…1; la pagina rechaza grabaciones por debajo de aproximadamente −50 dBFS.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero las limitaciones tecnicas desaconsejan cualquier aplicacion en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de clasificacion erronea en dominios fuera de distribucion.
- Sesgos conocidos: no documentados explicitamente, aunque la dependencia del tono y el sesgo del corpus (audiolibros en ingles) son fuentes previsibles de error.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hojinlab/ai-read-forest-voice-cnn
- Pagina del curso "AI로 읽는 숲" (equipo 상어): https://ai-read-forest.github.io/
- Dataset LibriSpeech (OpenSLR): https://www.openslr.org/12
- Copia del dataset en Hugging Face: https://huggingface.co/datasets/openslr/librispeech_asr
- Paper de LibriSpeech: Panayotov, V., Chen, G., Povey, D., & Khudanpur, S. (2015). Librispeech: An ASR corpus based on public domain audio books. ICASSP 2015, 5206–5210. https://doi.org/10.1109/ICASSP.2015.7178964
