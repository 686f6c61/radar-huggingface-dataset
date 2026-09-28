# caikybaldo999/ZYI-1.5-TINY-ReasonFast

## Resumen

ZYI 1.5 TINY ReasonFast es un modelo de difusión texto a imagen de tamano muy reducido publicado por el usuario caikybaldo999 en Hugging Face. Se trata de un diffusion transformer (DiT) de 59,2 millones de parametros entrenado con rectified flow, que genera imagenes de 256x256 pixeles condicionadas por texto mediante el codificador FLAN-T5-base y decodificadas con el VAE stabilityai/sd-vae-ft-mse. Su interes principal es la escala: con menos de 100 M de parametros en el generador cabe en cualquier GPU de consumo e incluso en CPU, lo que lo hace util para prototipado rapido, generacion masiva de imagenes de baja resolucion y experimentacion con recetas modernas de difusion sin presupuesto de computo elevado.

El modelo se presenta como un ajuste fino continuado de caikybaldo999/ZYI-1.4-TINY-ReasonFast sobre 300.000 muestras: 250.000 procedentes de LucasFang/FLUX-Reason-6M (filtradas por claridad y estructura de imagen) y 50.000 de pixparse/cc3m-wds. Las caracteristicas se precalcularon como latentes del VAE y embeddings de FLAN-T5, con una tasa de aprendizaje de 3e-05 y 10 epocas configuradas.

La model card no documenta resultados de benchmarks ni comparaciones con alternativas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta (publicado y actualizado el 2026-09-27), por lo que se trata de una publicacion reciente y sin validacion independiente conocida. Existe ademas una discrepancia entre el identificador del repositorio (1.5) y el titulo interno de la model card (1.3), detallada en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con rectified flow; 59,2 M de parametros |
| Parametros totales | 59,2 M en el generador (ZYI-DiT); no incluye el codificador de texto ni el VAE |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-imagen; el condicionamiento de texto se realiza con FLAN-T5-base, sin ventana de contexto conversacional) |
| Tipos de cuantizacion | no disponible (la model card no menciona fp16, int8 ni formatos GGUF/ONNX) |
| Idiomas soportados | no disponible (la model card no declara cobertura idiomatica; FLAN-T5-base es multilingue, pero no se especifica el alcance real del condicionamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado en la model card; el repositorio esta etiquetado como PyTorch |
| Resolucion de salida | 256x256 pixeles |
| Condicionamiento de texto | FLAN-T5-base |
| VAE | stabilityai/sd-vae-ft-mse |
| Tamano del repositorio | 2,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion / ultima actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

El componente generativo es un DiT, es decir, un transformer que opera sobre la representacion latente de la imagen en lugar de sobre pixeles. La model card indica 59,2 M de parametros para este bloque y el uso de rectified flow, una formulacion que aprende un campo de velocidad entre la distribucion de ruido y la de datos para producir trayectorias mas rectas y permitir, en teoria, muestreo con menos pasos que los modelos de difusion DDPM convencionales. La condicion de texto se obtiene con FLAN-T5-base y la decodificacion final del latente con el VAE de estabilidad sd-vae-ft-mse. La model card no detalla como se inyecta el condicionamiento de texto en el transformer (cross-attention, adaLN u otro mecanismo), ni el numero de bloques, la dimension oculta o el numero de cabezas de atencion.

El entrenamiento descrito es un ajuste fino continuado desde caikybaldo999/ZYI-1.4-TINY-ReasonFast sobre 300.000 muestras: 250.000 de LucasFang/FLUX-Reason-6M y 50.000 de pixparse/cc3m-wds. El subconjunto de FLUX-Reason se filtro por claridad y estructura de imagen, y las caracteristicas de entrenamiento se precalcularon como latentes del VAE y embeddings de FLAN-T5, con una tasa de aprendizaje de 3e-05 y 10 epocas configuradas. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineacion por preferencias, algo poco habitual en modelos de difusion y que aqui no se menciona.

## Capacidades

- Generacion de imagenes de 256x256 pixeles a partir de una descripcion textual, mediante muestreo de rectified flow sobre un DiT de 59,2 M de parametros.
- Condicionamiento de texto arbitrario gracias a FLAN-T5-base, lo que permite describir escenas, objetos o estilos en lenguaje natural (sin garantia de fidelidad mas alla de lo que el tamano del modelo permite).
- Modelo extremadamente ligero: el generador ocupa alrededor de 118 MB en fp16 y unos 237 MB en fp32, sin contar el codificador de texto ni el VAE.
- Entrenado sobre una mezcla de datos filtrados por calidad estructural (FLUX-Reason-6M filtrado) y datos de captions genericos (CC3M), lo que sugiere cobertura de escenas y objetos comunes.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; no es un modelo de lenguaje.
- No se documenta modo "thinking", ni capacidades de vision de entrada, audio o video.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting ni control de estructura (pose, profundidad, bordes).
- No se documentan pasos de muestreo, guia (guidance scale) ni programadores recomendados.

## Casos de uso

- Generacion masiva de imagenes de baja resolucion para enriquecer datasets sinteticos de clasificacion o deteccion: al ser tan ligero, se pueden producir cientos de miles de muestras de 256x256 con un unico acelerador, algo inviable con modelos de miles de millones de parametros.
- Miniaturas y avatares generados en el servidor: el modelo cabe en una GPU de consumo y permite crear imagenes de 256x256 etiquetadas por prompt para galerias, foros o perfiles sin depender de APIs externas.
- Placeholders visuales para interfaces: generar una imagen aproximada a partir del titulo o la descripcion de un articulo mientras se carga el contenido real, evitando recurrir a bancos de imagenes.
- Prototipado de producto y pruebas de concepto: validar rapidamente si un pipeline de difusion (preprocesado de prompts, extraccion de latentes, decodificacion con VAE) funciona de extremo a extremo antes de invertir en modelos grandes.
- Pruebas de carga e infraestructura: al tener un coste de inferencia minimo, sirve como carga sintetica para medir throughput de servidores de inferencia, colas de trabajos o sistemas de cache sin saturar el hardware.
- Investigacion y docencia sobre rectified flow y DiT: permite reproducir el entrenamiento completo de un generador de difusion en una sola GPU, algo factible con 59,2 M de parametros y caracteristicas precalculadas.
- Despliegue en entornos con recursos limitados: CPU de portatiles, Apple Silicon o dispositivos embebidos con unos pocos cientos de MB de memoria disponible, donde un modelo de difusion convencional no cabe.
- Generacion de assets de baja resolucion para videojuegos o prototipos: sprites, iconos o texturas de 256x256 que luego se pueden escalar o retocar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, Inception Score, ni comparaciones cuantitativas con otros modelos. Tampoco se documentan curvas de perdida, muestras cualitativas ni evaluaciones humanas.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros declarado (no proporcionadas por el autor; incluyen el generador, el codificador de texto y el VAE):

- Generador ZYI-DiT (59,2 M de parametros): unos 237 MB en fp32, 118 MB en fp16/bf16 y 59 MB en int8.
- Codificador de texto FLAN-T5-base (~250 M de parametros): aproximadamente 1,0 GB en fp32 y 500 MB en fp16.
- VAE sd-vae-ft-mse (~83,7 M de parametros): aproximadamente 335 MB en fp32 y 167 MB en fp16.
- Total de pesos en fp16: alrededor de 0,8 GB. En fp32: alrededor de 1,6 GB. A esto hay que sumar activaciones y el coste del decodificador del VAE, que domina en memoria de pico.
- El repositorio ocupa 2,4 GB, mas de lo que suma la estimacion en fp32, lo que sugiere la presencia de checkpoints adicionales o de estados del entrenamiento; la model card no detalla su contenido.
- VRAM estimada para inferencia: 2-3 GB es suficiente en la mayoria de configuraciones; con precision reducida puede operar por debajo de 2 GB.
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060, RTX 4090, asi como en iGPU recientes y en Apple Silicon (M1 en adelante). Tambien es viable en CPU x86 para generacion no interactiva.
- GPU de datacenter (A100, H100) no son necesarias; se pueden usar para generar lotes muy grandes en paralelo, pero el modelo no las aprovecha por si mismo.
- Opciones de despliegue: la model card solo indica PyTorch. No se documenta compatibilidad con diffusers, vLLM (no aplicable), llama.cpp (no aplicable), Ollama, TGI, ONNX Runtime, TensorRT ni CoreML. Cualquier integracion de este tipo habria que construirla o verificarla por cuenta propia.
- Latencia y throughput: no disponible. La model card no indica numero de pasos de muestreo ni tiempos medidos.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas. La siguiente tabla se basa en conocimiento general de estos modelos y no en datos aportados por el autor; conviene verificar licencias y cifras en las fuentes oficiales. No existen benchmarks comparativos publicados para ZYI 1.5 TINY ReasonFast.

| Modelo | Parametros | Resolucion | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZYI 1.5 TINY ReasonFast | 59,2 M (generador) + FLAN-T5-base + VAE | 256x256 | DiT con rectified flow | Apache-2.0 | Hugging Face, 0 descargas, sin validacion externa |
| DiT-XL/2 (Peebles y Xie) | 675 M | 256x256 (ImageNet, condicionado por clase) | DiT con difusion DDPM | no verificada en la informacion disponible | Pesos y codigo publicos (facebookresearch/DiT) |
| Stable Diffusion 1.5 | 860 M (UNet) + 123 M (CLIP ViT-L/14) + VAE | 512x512 | UNet con cross-attention, difusion latente | CreativeML OpenRAIL-M | Ampliamente disponible, gran ecosistema |
| SD-Turbo | 860 M (UNet) + CLIP + VAE | 512x512 | UNet con destilacion para 1-4 pasos | Stability AI Non-Commercial Research Community License | Hugging Face |

Diferencias clave: ZYI 1.5 TINY ReasonFast es entre 10 y 15 veces mas pequeno que cualquiera de las alternativas, lo que se traduce en menor fidelidad y detalle a igual resolucion, pero tambien en un coste de inferencia y de memoria mucho menor. Frente a DiT-XL/2, la diferencia de tarea es relevante: DiT-XL/2 esta entrenado para generacion condicionada por clase en ImageNet, mientras que ZYI esta condicionado por texto. Frente a SD 1.5 y SD-Turbo, la desventaja principal es la resolucion (256x256 frente a 512x512) y la ausencia de un ecosistema de herramientas (LoRA, ControlNet, schedulers) documentado.

## Limitaciones y advertencias

- Ambiguedad de version: el repositorio se identifica como ZYI-1.5-TINY-ReasonFast, pero el titulo de la model card dice "ZYI 1.3 TINY ReasonFast" y el ajuste fino declarado parte de ZYI-1.4-TINY-ReasonFast. No queda claro si la 1.5 es una version nueva o si la model card esta desactualizada.
- Sin validacion externa: 0 descargas y 0 likes, sin benchmarks, sin muestras publicadas ni evaluaciones de terceros. Cualquier uso en produccion exige una evaluacion propia previa.
- Resolucion limitada a 256x256, insuficiente para la mayoria de casos de uso comerciales (impresion, e-commerce, publicidad) sin un escalado posterior que puede introducir artefactos.
- Riesgo elevado de alucinacion visual: con 59,2 M de parametros, es esperable que el modelo falle en composiciones complejas, conteo de objetos, texto dentro de la imagen, manos y anatomias, y relaciones espaciales finas. No se documenta ningun mecanismo de mitigacion.
- Sesgos potenciales heredados de CC3M y de FLUX-Reason-6M: los datasets de captions web tienden a sobrerrepresentar determinadas culturas, idiomas y estereotipos de genero y etnia. No se documenta ningun filtrado de sesgos ni evaluacion al respecto.
- Cobertura idiomatica no declarada: aunque FLAN-T5-base es multilingue, no se especifica si el modelo responde igual de bien a prompts en castellano que en ingles. Es razonable esperar un rendimiento inferior fuera del ingles, dado el origen de los datos de entrenamiento.
- Licencia Apache-2.0 en el repositorio: permite uso comercial y modificacion, pero el autor no aclara si los pesos derivados de FLUX-Reason-6M o de CC3M arrastran restricciones adicionales. Conviene revisar las licencias de los datasets y de stabilityai/sd-vae-ft-mse antes de un uso comercial.
- Uso de FLAN-T5-base y sd-vae-ft-mse: ambos tienen sus propias licencias (Apache-2.0 y CreativeML OpenRAIL-M respectivamente, segun sus repositorios de origen); quien despliegue el modelo completo debe cumplirlas.
- Ausencia de documentacion operativa: no se indican pasos de muestreo, guidance scale, scheduler ni formato exacto de pesos, lo que aumenta el trabajo de integracion.
- Repositorio de 2,4 GB sin inventario de ficheros: hay que inspeccionarlo antes de asumir que contiene unicamente el modelo en un formato concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caikybaldo999/ZYI-1.5-TINY-ReasonFast
- Version anterior citada como base del ajuste fino: https://huggingface.co/caikybaldo999/ZYI-1.4-TINY-ReasonFast
- Dataset LucasFang/FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset pixparse/cc3m-wds: https://huggingface.co/datasets/pixparse/cc3m-wds
- Codificador de texto FLAN-T5-base: https://huggingface.co/google/flan-t5-base
- VAE stabilityai/sd-vae-ft-mse: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Referencia general sobre rectified flow (no citada por el autor): https://arxiv.org/abs/2209.03003
- Referencia general sobre Diffusion Transformers (no citada por el autor): https://arxiv.org/abs/2212.09748
- Repositorio de referencia de DiT, usado en la comparativa (no citado por el autor): https://github.com/facebookresearch/DiT
