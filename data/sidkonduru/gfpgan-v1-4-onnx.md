# sidkonduru/gfpgan-v1.4-onnx

## Resumen

GFPGAN v1.4 (ONNX) es una conversión al formato ONNX del modelo de restauración facial GFPGAN v1.4, desarrollado originalmente por TencentARC. El repositorio, mantenido por el usuario sidkonduru en Hugging Face, ofrece los pesos en precisión media (half precision, FP16) listos para ejecutarse directamente en navegador o en entornos sin PyTorch, reduciendo el tamaño del modelo de 340 MB a 170 MB.

El modelo resuelve el problema de restaurar rostros antiguos, desenfocados o dañados en fotografías: dada una imagen recortada de un rostro de baja calidad, genera una versión de 512x512 con detalles faciales reconstruidos. GFPGAN combina un generador estilo GAN (basado en la arquitectura de StyleGAN2) con información previa de identidad facial mediante módulos de limpieza facial (Face Restore Degradation Module y componentes de ArcFace), lo que permite recuperar rasgos realistas sin perder la identidad de la persona.

Su relevancia actual radica en la portabilidad: al estar en ONNX y con ruido fijo (determinista), puede integrarse en aplicaciones web con WebAssembly/WebGPU, pipelines de procesamiento de imágenes o servicios de inferencia ligeros, sin depender del ecosistema PyTorch. Es una herramienta complementaria habitual en flujos de trabajo con Stable Diffusion y upscalers como Real-ESRGAN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN basado en StyleGAN2 con modulos de restauracion facial (GFPGAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | FP16 (pesos almacenados en half precision; entradas y salidas en float32) |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (170 MB, convertido desde GFPGANv1.4.pth) |

Detalles adicionales de la interfaz del modelo:

| Elemento | Valor |
|---|---|
| Entrada | tensor `input`, float32, forma `[1, 3, 512, 512]`, RGB en rango -1 a 1, un recorte de rostro |
| Salida | tensor `output`, float32, forma `[1, 3, 512, 512]`, RGB en rango -1 a 1 |
| Determinismo | ruido fijo (no aleatorio): el mismo rostro produce siempre el mismo resultado |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

GFPGAN (Generative Facial Prior GAN) emplea como generador una red basada en StyleGAN2 preentrenada, cuyas capas intermedias actuan como "prior generativo facial": contienen conocimiento rico sobre la estructura y los detalles de los rostros humanos. El modelo incorpora un modulo de degradacion-restauracion que utiliza caracteristicas de una red de reconocimiento facial (basada en ArcFace) para inyectar informacion de identidad, junto con componentes U-Net que combinan las caracteristicas de la imagen degradada con el prior generativo. Esto permite restaurar detalles de alta frecuencia (ojos, boca, piel) preservando la fidelidad a la persona original.

El modelo fue entrenado sobre el dataset FFHQ (Flickr-Faces-HQ), un conjunto de rostros humanos de alta resolucion. La version v1.4 refina el equilibrio entre fidelidad (identidad) y calidad visual respecto a versiones anteriores. Los pesos publicados corresponden a `params_ema` (medias moviles exponenciales de los pesos) de la release v1.3.0 del proyecto original. La conversion a ONNX fue verificada contra el modelo PyTorch original: la version en precision completa difiere como maximo 0,0000024 y la version en half precision como maximo 0,007 (sobre la escala -1 a 1) en un rostro de prueba. No se dispone de informacion sobre el numero exacto de pasos de entrenamiento ni tecnicas de ajuste adicionales.

## Capacidades

- Restauracion facial image-to-image: recibe un recorte de rostro degradado (antiguo, borroso, con dano por compresion o ruido) y devuelve una version de 512x512 con detalles reconstruidos.
- Preservacion de identidad: gracias a los componentes de prior facial e informacion de identidad, mantiene los rasgos del sujeto mientras mejora la calidad.
- Salida determinista: el ruido es fijo, por lo que el mismo rostro de entrada produce siempre la misma salida, util para reproducibilidad en pipelines.
- Ejecucion portable: formato ONNX compatible con ONNX Runtime, onnxruntime-web (navegador con WebAssembly/WebGPU) y otros runtimes sin dependencia de PyTorch.
- Huella reducida: 170 MB en half precision, adecuado para despliegues en cliente o dispositivos con recursos limitados.
- No realiza otras tareas: no genera texto, no procesa audio, no hace deteccion ni alineacion de rostros (esas etapas deben gestionarse externamente, por ejemplo con RetinaFace o el propio pipeline de GFPGAN).

## Casos de uso

- Restauracion de fotografias antiguas: aplicacion web que permite a usuarios subir fotos familiares antiguas, recorta los rostros detectados y los restaura en el navegador con onnxruntime-web, sin enviar datos a un servidor.
- Mejora de avatares y retratos generados por IA: como etapa post-proceso tras Stable Diffusion o cualquier generador de retratos, para corregir rostros con artefactos o baja resolucion.
- Restauracion de fotogramas de video: pipeline de restauracion de video antiguo donde cada fotograma se detectan rostros, se restauran con GFPGAN y se recomponen; el determinismo del ruido evita parpadeos entre fotogramas.
- Procesamiento por lotes en servidor ligero: servicio en la nube con ONNX Runtime (CPU o GPU) para restaurar millones de rostros en archivos digitales, bibliotecas o hemerotecas.
- Aplicaciones moviles offline: integracion en apps iOS/Android mediante ONNX Runtime Mobile para restaurar fotos de la galeria sin conexion.
- Preprocesado para reconocimiento facial: mejora de rostros de baja calidad antes de pasarlos a sistemas de reconocimiento o verificacion de identidad, aumentando la calidad de las incrustaciones (embeddings).
- Compresion y optimizacion de imagenes historicas: restauracion de rostros en archivos digitalizados con escaneos de baja resolucion antes de su publicacion en museos o archivos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de calidad aportada es la verificacion numerica de la conversion: diferencia maxima de 0,0000024 (FP32) y 0,007 (FP16) respecto al modelo PyTorch original sobre la escala -1 a 1. El repositorio original de GFPGAN reporta comparativas visuales y metricas de fidelidad/calidad (como LPIPS y Consistency) en su documentacion, pero no se incluyen cifras concretas en la model card de esta conversion.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 170 MB en half precision con entrada de 512x512, la inferencia en GPU requiere del orden de 1-2 GB de VRAM (estimacion; dato exacto no disponible).
- CPU: el modelo es lo bastante ligero para ejecutarse en CPU moderna con ONNX Runtime; el tiempo por rostro esta en el orden de segundos (estimacion; dato exacto no disponible).
- Consumer GPU: cabe sin problemas en GPUs de gama media y baja (por ejemplo, GTX 1650, RTX 3060, RTX 4090); el requisito es minimo comparado con LLMs.
- Navegador: ejecutable en navegador via onnxruntime-web (WebAssembly o WebGPU), sin GPU dedicada obligatoria.
- Despliegue: ONNX Runtime (Python, C++, web, mobile), compatible con cualquier runtime ONNX; no requiere vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Tamano aproximado | Entrada | Licencia | Formato |
|---|---|---|---|---|---|
| GFPGAN v1.4 (ONNX, este modelo) | Restauracion facial | 170 MB (FP16) | Recorte de rostro 512x512 | Apache-2.0 | ONNX |
| GFPGAN v1.4 (original, TencentARC) | Restauracion facial | 340 MB (FP32) | Recorte de rostro 512x512 | Apache-2.0 (con nota sobre FFHQ) | PyTorch (.pth) |
| CodeFormer (sczhou) | Restauracion facial | no disponible | Recorte de rostro | no disponible (revisar repo) | PyTorch |
| RestoreFormer | Restauracion facial | no disponible | Recorte de rostro | no disponible | PyTorch |

Notas comparativas: frente al original PyTorch, esta conversion ONNX ofrece la mitad de tamano, ejecucion sin PyTorch y salida determinista, a cambio de una perdida numerica maxima de 0,007. Frente a CodeFormer, GFPGAN tiende a priorizar la fidelidad al original, mientras que CodeFormer ofrece un peso ajustable entre fidelidad y calidad; no hay cifras comparativas publicadas en la informacion disponible.

## Limitaciones y advertencias

- Solo procesa un recorte de rostro por pasada: la deteccion, alineacion y segmentacion de rostros debe realizarse externamente (por ejemplo, con facexlib o RetinaFace).
- Resolucion fija de 512x512: las imagenes de entrada deben redimensionarse a ese tamano y normalizarse al rango -1 a 1; no acepta entradas de otra forma.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede inventar detalles faciales no presentes en la foto original (dientes, arrugas, texturas), lo que es relevante en contextos forenses, historicos o de identidad.
- Datos de entrenamiento: el modelo fue entrenado con FFHQ (rostros mayoritariamente occidentales de Flickr); puede tener rendimiento desigual en rostros de otras etnias, edades extremas o condiciones no representadas en el dataset.
- Licencia y uso comercial: los pesos se publican bajo Apache-2.0, pero la model card advierte de revisar los terminos del dataset FFHQ antes de usar el modelo en un producto comercial.
- Precision half: la version FP16 introduce una diferencia maxima de 0,007 respecto al original; para aplicaciones que exijan maxima fidelidad numerica puede considerarse una conversion FP32.
- Descargas del repositorio muy bajas (0 en el momento de la ficha): es una conversion comunitaria sin soporte oficial de TencentARC; verificar la calidad de la conversion en el propio caso de uso antes de produccion.
- No restaura la imagen completa ni el fondo: esta disenado exclusivamente para rostros; para escenas completas combinar con Real-ESRGAN u otro upscaler.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sidkonduru/gfpgan-v1.4-onnx
- Repositorio original y codigo de GFPGAN (TencentARC): https://github.com/TencentARC/GFPGAN
- Dataset de entrenamiento FFHQ: https://github.com/NVlabs/ffhq-dataset
- Demos, papers y otros enlaces: no disponibles en la informacion proporcionada.
