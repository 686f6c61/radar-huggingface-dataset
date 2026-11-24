# alkove-ai/alkove-timbre-1-preview

## Resumen

alkove-timbre-1-preview es un modelo de verificación de hablante (speaker verification) y extracción de embeddings de voz desarrollado por Alkove, un SDK de voz on-device. El modelo convierte una ventana de audio de 16 kHz en dos vectores unitarios de 192 dimensiones: un `embedding` que consume alkove-focus para seguir a una persona concreta y un `id` para determinar si dos ventanas corresponden a la misma voz mediante producto escalar. Forma parte de un conjunto de herramientas de voz (aislamiento, wake word, voiceprint, detección de actividad vocal y pronunciación) que se ejecutan íntegramente en el navegador o en el teléfono, sin enviar audio a ningún servidor.

El modelo es extremadamente compacto: 0,74 MB con pesos int8 en formato `.alk`, diseñado para ejecutarse en un solo hilo de CPU, tanto de forma nativa como en WebAssembly. Su relevancia radica en que ofrece verificación biométrica de voz con un EER de 2,95 % en el escenario de impresión de ~12 s contra ventana de 1,5 s, con un tamaño dos órdenes de magnitud menor que alternativas como CAM++. Esta versión es un preview que ha sido reemplazada por alkove-timbre-1 en Alkove 0.5, cuyas impresiones no son comparables con las de esta versión; se mantiene para compatibilidad con Alkove 0.4 y anteriores.

La licencia es Apache-2.0 y el modelo está pensado exclusivamente como filtro de conveniencia on-device (por ejemplo, para que solo la voz del propietario active o interrumpa un asistente), no como mecanismo de autenticación o control de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings de hablante, salida de dos vectores de 192 dimensiones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 280 a 24 000 muestras (1,5 s recomendado) |
| Tipos de cuantizacion | int8 (pesos del archivo `.alk`) |
| Idiomas soportados | no disponible como lista cerrada; evaluado en 7 idiomas (frances, ingles, espanol, italiano, portugues, catalan, rumano) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propietario documentado del motor Alkove); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de red, capas, atencion) ni el volumen o composicion del dataset de entrenamiento. Lo que si se especifica es el contrato de entrada/salida: audio float32 `[1, samples]` a 16 kHz mono en rango -1..1, con ventanas de 280 a 24 000 muestras, y dos salidas float32 `[1, 192]` con norma unitaria (`embedding` e `id`). El modelo se ejecuta sobre el motor Alkove (Rust, Apache-2.0), nativo o en WebAssembly, en un solo hilo.

El modelo fue evaluado sobre los conjuntos de test de Common Voice en 7 idiomas, con 2 029 hablantes no vistos en entrenamiento y 4 clips por hablante (8 057 clips). No se indica si hubo RLHF/DPO ni tecnicas de aumento de datos, aunque la evaluacion en condiciones de ruido, musica y otra voz (protocolo con MUSAN, DNS Challenge y RIRS_NOISES) sugiere que el entrenamiento contempla condiciones adversas. La innovacion principal es la compresion extrema (0,74 MB) manteniendo un EER competitivo, junto con la doble salida especializada (`embedding` para Focus, `id` para comparacion de voces).

## Capacidades

- Extraccion de voiceprint (huella de voz) a partir de audio de 16 kHz mono.
- Verificacion de hablante: comparacion de dos ventanas mediante producto escalar de los vectores `id`.
- Generacion de embeddings para seguimiento de hablante (consumidos por alkove-focus).
- Enrollment sin pantalla dedicada: se puede aprender la impresion mientras el usuario habla, promediando y renormalizando varios vectores.
- Ejecucion on-device en CPU, un hilo, sin servidor, sin clave y sin telemetria.
- Compatibilidad nativa (Rust, Python) y en WebAssembly (navegador), Android (SDK) e iOS (Swift package).
- No soporta tool calling, agentes, vision, audio generation ni razonamiento multi-paso; es un modelo de extraccion de caracteristicas de audio.

## Casos de uso

- Despertar o interrumpir un asistente solo con la voz del propietario: se enrola la impresion del usuario y se compara cada ventana de 1,5 s contra ella mediante el vector `id`; adecuado por su baja latencia (2,0 ms por ventana en un Galaxy Z Fold8) y su ejecucion local.
- Seguimiento de hablante en llamadas o reuniones: el vector `embedding` alimenta a alkove-focus para aislar a una persona concreta del resto de voces y del ruido de fondo.
- Identificacion de quien habla entre las voces conocidas por la app: comparando el `id` de la ventana entrante contra las impresiones registradas y eligiendo el maximo producto escalar.
- Filtro de conveniencia en asistentes de voz en el navegador: integrado via el SDK de npm, permite decidir si la voz que habla es la del usuario sin enviar audio a un servidor.
- Enrollment progresivo en aplicaciones moviles: aprendizaje de la impresion del usuario mientras este usa la app, sin pantalla de registro, usando el SDK de Android o el paquete Swift.
- Preprocesado en pipelines de voz en Python: el paquete `alkove` de PyPI permite generar impresiones y compararlas nativamente en CPU para tareas de diarizacion ligera o segmentacion por hablante.
- Deteccion de voz no autorizada en entornos de hogar: comparar ventanas de 1,5 s contra la impresion del propietario para distinguir voces ajenas (con las limitaciones de EER en condiciones ruidosas).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en Common Voice, 7 idiomas, 2 029 hablantes no vistos en entrenamiento:

| Metrica | alkove-timbre `id` (0,74 MB) | CAM++ (28 MB) |
|---|---|---|
| EER, impresion de ~12 s contra ventana de 1,5 s | 2,95 % | 1,72 % |
| EER, mismo escenario, impostores con tono cercano (±2 semitonos) | 4,11 % | 2,32 % |
| EER, clip contra clip, clips completos (~4 s) | 4,42 % | 2,61 % |
| EER, clip contra clip, 3 s | 4,90 % | 3,02 % |
| EER, clip contra clip, 1,5 s | 7,14 % | 4,75 % |

EER por idioma (impresion contra ventana de 1,5 s): frances 2,68 %, ingles 3,20 %, espanol 2,79 %, italiano 2,57 %, portugues 4,28 %, catalan 2,83 %, rumano 2,30 % (solo 30 hablantes).

Protocolo mas dificil (1 424 ventanas con ruido, musica u otra voz):

| EER | Microfono crudo | Tras Focus, con impresion | Tras Focus, sin impresion |
|---|---|---|---|
| `id`, ventanas de 1,5 s | 11,9 % | 10,1 % | 11,6 % |
| `id`, ventanas de 1 s | 14,4 % | 14,2 % | 13,4 % |
| `embedding`, ventanas de 1,5 s | 15,7 % | 18,6 % | 19,1 % |

Rendimiento de inferencia declarado: 2,0 ms por ventana de 1,5 s en Galaxy Z Fold8 (Android 17, 1 hilo) y 2,9 ms por ventana de 1,5 s en Apple M1 Max (macOS, 1 hilo).

## Requisitos de hardware

- VRAM: no aplica; el modelo corre en CPU. El archivo pesa 0,74 MB en int8.
- GPU: no requerida ni soportada segun la informacion disponible.
- Cabe en cualquier CPU moderna, incluidos telefonos moviles; no necesita GPU de consumo.
- Despliegue: motor Alkove (Rust) nativo o WebAssembly; SDK de npm para navegador; paquete `alkove` de PyPI para Python; SDK de Android y paquete Swift para iOS.
- Latencia: 2,0 ms por ventana de 1,5 s en Galaxy Z Fold8 y 2,9 ms en Apple M1 Max, un hilo.
- Throughput: no disponible mas alla de la latencia por ventana.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto / ventana | EER (impresion ~12 s vs 1,5 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkove-timbre-1-preview | 0,74 MB (int8) | ventana de hasta 1,5 s en el archivo publicado | 2,95 % | Apache-2.0 | Hugging Face, motor Alkove |
| CAM++ (`speech_campplus_sv_zh_en_16k-common_advanced`) | 28 MB | no disponible | 1,72 % | Apache-2.0 | ModelScope / repositorios abiertos |
| alkove-timbre-1 | no disponible | no disponible | no disponible | Apache-2.0 (segun repositorio del autor) | Hugging Face (sustituye a este preview) |

La comparativa se limita a CAM++ porque es la referencia que el propio autor incluye en la model card. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite audio de 16 kHz; otras frecuencias de muestreo no estan soportadas.
- Ventanas inferiores a 1 s son menos fiables (EER de 14,4 % en `id` con 1 s en condiciones ruidosas frente a 11,9 % con 1,5 s).
- El vector `embedding` esta disenado para Focus; para comparar voces debe usarse `id`.
- No es apto para autenticacion ni control de acceso: con ~3 % de EER es un filtro de conveniencia, no una verificacion de seguridad.
- No apto para comparacion forense de hablantes.
- El EER se degrada notablemente en condiciones reales con ruido, musica u otras voces (hasta 11,9 % en microfono crudo).
- Es una version preview: los pesos y la interfaz pueden cambiar antes de la version 1; de hecho, alkove-timbre-1 los sustituye y sus impresiones no son comparables con las de este preview.
- No se detallan sesgos por idioma, genero o acento; la evaluacion por idioma incluye rumano con solo 30 hablantes, lo que limita la fiabilidad de esa cifra.
- Licencia Apache-2.0 permite uso comercial, pero el formato `.alk` y el motor Alkove condicionan el despliegue.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos/negativos en la verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Version sustituta: https://huggingface.co/alkove-ai/alkove-timbre-1
- Modelo relacionado (Focus): https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Sitio de Alkove: https://alkove.ai
- Motor Alkove (Rust): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK de Android: https://github.com/alkove-ai/alkove/tree/main/android
- Paquete Swift (iOS): https://github.com/alkove-ai/alkove/tree/main/ios
- SDK de npm: https://www.npmjs.com/package/alkove
- Paquete de Python: https://pypi.org/project/alkove/
