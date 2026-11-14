# caikybaldo999/zyvideo-1.2

## Resumen

ZYVIDEO 1.2 es un modelo de generacion de video a partir de texto (text-to-video) desarrollado por el usuario caikybaldo999, publicado bajo licencia Apache 2.0. Se trata de un fine-tune del modelo ZYVIDEO 1.1, que a su vez se construye sobre el modelo de imagen ZYI-256 Flash. El modelo genera clips de 256x256 pixeles de 16 o 32 fotogramas a 8 fps, e incorpora un modo de encadenamiento de segmentos (`pipe.long(...)`) para producir videos de mayor duracion (hasta aproximadamente 10 segundos con 3 segmentos).

La arquitectura combina un backbone espacial de 343M de parametros procedente de ZYI-256 Flash con un modulo temporal de 147M de parametros, sumando un total de 490M de parametros. Utiliza un objetivo de rectified flow sobre latentes DC-AE (f32c32, 8x8x32 por fotograma, es decir, 64 tokens por frame) y un codificador de texto flan-T5-base congelado que solo acepta prompts en ingles.

Es relevante por su tamano reducido (490M de parametros) y por su enfoque en la mejora de anatomia humana y animal mediante el entrenamiento conjunto con imagenes de alta calidad de FLUX-Reason-6M. El modelo esta pensado para experimentacion e investigacion en generacion de video a baja resolucion, no para produccion comercial de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con backbone espacial de ZYI-256 Flash + modulo temporal; objetivo rectified flow |
| Parametros totales | 490M (343M espaciales + 147M temporales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (texto: flan-T5-base congelado; no se especifica limite de tokens de prompt) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (prompts); no se especifican otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (el repo incluye `etapa1/` con pesos de la etapa 1) |
| Resolucion de video | 256x256 |
| Fotogramas | 16 o 32 por clip; encadenamiento para videos largos |
| FPS | 8 |
| Latente | DC-AE f32c32 por fotograma (8x8x32, 64 tokens por frame) |
| Codificador de texto | flan-T5-base (congelado) |
| Tamano del repo | 11.8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) con un diseno de dos componentes: un backbone espacial de 343M de parametros heredado de ZYI-256 Flash y un modulo temporal de 147M de parametros que aporta la dimension de movimiento. La representacion latente se obtiene con un autoencoder DC-AE (f32c32) que comprime cada fotograma a un tensor de 8x8x32, es decir, 64 tokens por fotograma. El codificador de texto es flan-T5-base, que permanece congelado durante el entrenamiento.

El entrenamiento utiliza un objetivo de rectified flow con muestreo logit-normal de t y un shift de 2.0, al que se anade una perdida adicional de 0.5x sobre las diferencias entre fotogramas consecutivos para favorecer la coherencia temporal. Los datos provienen de OpenVid-1M (filtrado por "quality", con 16.890 clips unicos) y de 146.944 muestras de imagen de FLUX-Reason-6M, con enfasis en personas y animales. El fine-tune de la version 1.2 anade 1.148 pasos sobre ZYVIDEO 1.1 (que ya acumulaba 31.584 videos), realizado en una sola RTX PRO 6000 durante una sesion de 90 minutos. La perdida de validacion en imagenes de personas y animales baja de 3,1844 (version 1.1) a 1,1663, y el movimiento medio de las muestras se reduce de 11,65 a 9,33 (escala 0-255).

## Capacidades

- Generacion de video a partir de texto en ingles, con resolucion de 256x256 y 8 fps.
- Generacion de clips de 16 fotogramas (por defecto) o 32 fotogramas mediante el parametro `frames=32`.
- Generacion de videos largos mediante encadenamiento de segmentos con `pipe.long(...)` (por ejemplo, 3 segmentos para unos 10 segundos).
- Mejora especifica de anatomia humana y animal gracias al entrenamiento con imagenes de FLUX-Reason-6M.
- Control de semilla (`seed`) para reproducibilidad.
- Exportacion a MP4 mediante la funcion `save_mp4`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Prototipado rapido de video generativo: el modelo permite generar clips de 16 o 32 fotogramas en una sola GPU, lo que lo hace adecuado para experimentar con pipelines de difusion de video sin grandes infraestructuras.
- Investigacion en coherencia temporal: la perdida adicional sobre diferencias entre fotogramas y el modo de encadenamiento permiten estudiar la deriva temporal en modelos de difusion pequenos.
- Generacion de storyboards animados: a partir de prompts en ingles se pueden producir secuencias cortas de personas o animales en movimiento para previsualizacion de escenas.
- Pruebas de concepto en publicidad y redes sociales: clips de baja resolucion (256x256, 8 fps) utiles para maquetas o animaticos antes de producir video final.
- Fine-tuning sobre dominios especificos: al ser un modelo de 490M de parametros con licencia Apache 2.0, es viable reentrenarlo con datos propios en una sola GPU profesional.
- Educacion y demos de difusion: su tamano contenido y su codigo de inferencia simple (`ZyVideoPipeline`) lo hacen util para ensenar el funcionamiento de rectified flow en video.
- Generacion de videos largos encadenados: el modo `pipe.long(...)` permite crear secuencias de aproximadamente 10 segundos para pruebas de continuidad narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, VBench, etc.) en la informacion disponible. La model card unicamente reporta metricas internas de validacion:

| Metrica | ZYVIDEO 1.2 | ZYVIDEO 1.1 |
|---|---|---|
| Perdida de validacion en imagenes de personas/animales | 1,1663 | 3,1844 |
| Movimiento medio de las muestras (escala 0-255) | 9,33 | 11,65 |
| Perdida de validacion en videos | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 11,8 GB y el modelo tiene 490M de parametros, por lo que en fp32 los pesos ocuparian aproximadamente 2 GB, mas el autoencoder DC-AE y el codificador flan-T5-base. Se estima un consumo moderado, pero no se confirma en la model card.
- GPU recomendadas: el entrenamiento se realizo en una RTX PRO 6000; para inferencia es probable que baste con GPU consumer de gama media-alta, aunque no se especifica.
- Cabe en GPU consumer: no confirmado; por tamano de parametros es plausible en tarjetas con 8-16 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el codigo de inferencia propio (`ZyVideoPipeline`) requiere `torch`, `diffusers`, `transformers`, `safetensors`, `huggingface_hub`, `imageio` e `imageio-ffmpeg`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZYVIDEO 1.2 | 490M | 256x256, 8 fps | 16-32 frames; encadenable a ~10 s | Apache 2.0 | Hugging Face |
| ZYVIDEO 1.1 | No disponible (misma arquitectura) | 256x256, 8 fps | 16 frames | Apache 2.0 | Hugging Face |
| ZYI-256 Flash | 343M (espacial) | 256x256 (imagen) | No aplica (text-to-image) | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de text-to-video de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Resolucion muy baja (256x256): cada token latente cubre 32x32 pixeles, por lo que manos, caras pequenas y texto siguen siendo dificiles de generar correctamente.
- Los videos largos encadenados pueden sufrir deriva (drift) tras varios segmentos.
- Solo acepta prompts en ingles; no se documenta soporte multilingue.
- El modelo es un fine-tune experimental con solo 89 descargas y 0 likes; no hay evidencia de validacion externa ni benchmarks publicos.
- Riesgo de alucinacion visual y artefactos en anatomia, a pesar de la mejora reportada en la perdida de validacion.
- No se documentan sesgos conocidos, pero al entrenarse con OpenVid-1M y FLUX-Reason-6M puede heredar sesgos de esos datasets.
- Licencia Apache 2.0 permite uso comercial, pero la calidad a 256x256 y 8 fps limita su aplicacion en produccion.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caikybaldo999/zyvideo-1.2
- Modelo base ZYVIDEO 1.1: https://huggingface.co/caikybaldo999/zyvideo-1.1
- Modelo ZYI-256 Flash: https://huggingface.co/caikybaldo999/zyi-256-flash
- Dataset OpenVid-1M (referenciado, sin enlace directo en la model card)
- Dataset FLUX-Reason-6M (referenciado, sin enlace directo en la model card)
- No se proporcionan enlaces a papers, blogs, repositorios ni demos adicionales en la informacion disponible.
