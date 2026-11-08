# elifnuraygun/iu-cxr-report-lora

## Resumen

IU-CXR Report LoRA es un conjunto de tres adaptadores LoRA de tipo PEFT para UNet, entrenados sobre Stable Diffusion 1.5 con el objetivo de generar radiografías de tórax frontales sintéticas a partir de un informe radiológico completo en inglés. Lo desarrolla la usuaria de Hugging Face elifnuraygun y se publica como release candidate 0.1.0rc1. La particularidad principal es que la condicionamiento se hace con el texto completo del informe, no con un prompt corto: cada salida queda condicionada por el informe y no se requiere ninguna radiografía de origen en el momento de la inferencia.

El modelo no es un generador de informes a partir de imágenes, sino el sentido inverso: texto (informe) a imagen (radiografía sintética). Se apoya en el codificador CLIP congelado de Stable Diffusion 1.5 y solo entrena proyecciones de atención del UNet (to_q, to_k, to_v, to_out.0), con rango 32 y alpha 32, lo que da 6.377.472 parámetros entrenables por adaptador. La ventana de contexto de CLIP se explota empaquetando el informe completo en múltiples ventanas de 75 tokens de contenido, cada una rellenada a 77 posiciones y concatenada para la atención cruzada del UNet.

Es relevante ahora porque aborda un problema poco cubierto: la generación de datos sintéticos de radiología condicionados por informes clínicos completos, con un protocolo reproducible, verificación de software y licencia heredada de CreativeML Open RAIL-M. Su orientación es exclusivamente investigadora y no clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre UNet de Stable Diffusion 1.5; codificador CLIP congelado |
| Parametros totales | 6.377.472 parámetros entrenables por adaptador (3 adaptadores: seeds 42, 1337, 2026) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Informe completo empaquetado en ventanas CLIP de 75 tokens de contenido (77 posiciones con padding); se concatenan varias ventanas; el exceso sobre el límite explícito se rechaza |
| Tipos de cuantizacion | no disponible (el release distribuye adaptadores en FP32; el UNet/CLIP se ejecutan en BF16 y el VAE en FP32) |
| Idiomas soportados | en (inglés); el turco no se traduce |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M); el código de inferencia tiene licencia MIT separada |
| Formato de pesos | safetensors (256 tensores FP32 por checkpoint); adaptadores PEFT/LoRA |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de rango 32 y alpha 32 aplicado a las proyecciones de atención del UNet de Stable Diffusion 1.5 (to_q, to_k, to_v, to_out.0). El codificador de texto CLIP permanece congelado, con cero parámetros entrenables en el text encoder. Cada uno de los tres checkpoints (seeds de entrenamiento 42, 1337 y 2026) tiene 6.377.472 parámetros y 256 tensores FP32 en safetensors, tras 3.140 actualizaciones finales. El seed 42 es el predeterminado fijo, no seleccionado como el mejor.

El entrenamiento usó únicamente el dataset IU X-Ray, con 2.512 muestras de casos de entrenamiento por época y cinco épocas. No se distribuye continuación entrenada con MIMIC, ni informes/radiografías de pacientes fuente, ni listas de partición a nivel de paciente, ni respuestas de lectores. El release es de inferencia con una receta de entrenamiento parcial: no se reclama reproducción completa del entrenamiento extremo a extremo. La innovación técnica destacable es el empaquetado sin pérdida de informes completos en ventanas CLIP de 75 tokens de contenido, cada una rellenada a 77 posiciones y codificada por separado, concatenando sus representaciones para la atención cruzada del UNet; la condicionamiento incondicional usa el mismo número de ventanas vacías. Las llamadas genéricas a StableDiffusionPipeline con prompts cortos no son equivalentes.

## Capacidades

- Generación texto-a-imagen de radiografías de tórax frontales sintéticas condicionadas por un informe radiológico completo en inglés.
- Condicionamiento por informe completo mediante múltiples ventanas CLIP concatenadas, sin truncamiento silencioso del texto.
- Generación sin radiografía de origen: no se necesita imagen de entrada en inferencia.
- Tres adaptadores independientes seleccionables por seed de entrenamiento (42, 1337, 2026).
- Control de la semilla de generación (ruido gaussiano inicial) independiente de la semilla de entrenamiento.
- Rechazo explícito de entradas que exceden el límite de ventanas CLIP.
- No soporta traducción: la entrada en turco no se traduce.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No soporta visión, audio ni modo thinking.

## Casos de uso

- Generación de datos sintéticos para investigación en radiología: se parte de informes clínicos reales o ficticios y se generan radiografías frontales sintéticas para aumentar datasets de entrenamiento o evaluar robustez de modelos de visión médica, con la ventaja de no requerir imágenes de origen.
- Evaluación reproducible de pipelines texto-a-imagen médicos: el protocolo fija revisiones inmutables de pesos base y adaptadores, hashes y seeds, lo que permite repetir experimentos y comparar configuraciones de muestreo (DDIM 30 pasos, CFG 7.5, eta 0).
- Estudio de fidelidad informe-imagen: al conservar los tokens del informe en la condicionamiento, se puede analizar si las patologías descritas aparecen en la imagen generada, aunque el autor advierte que retener los tokens no garantiza fidelidad de hallazgos.
- Aumento de datos para tareas de detección de patología: generar pares informe-radiografía sintéticos etiquetados por construcción para preentrenar o ajustar clasificadores de cardiomegalia, derrame pleural u otras condiciones descritas en el informe.
- Docencia y simulación no clínica: producir ejemplos visuales de radiografías con hallazgos concretos descritos en texto para material formativo, siempre etiquetados como sintéticos y fuera de uso diagnóstico.
- Investigación en privacidad y memorización: el release permite estudiar riesgos de memorización y membership inference en modelos generativos médicos, aunque el autor no garantiza la ausencia de estos riesgos.
- Reproducción de experimentos académicos: con el repositorio de inferencia fijado a la revisión 707c31975e992170d768f5c66c859aa6bf1c1728 y los manifiestos de release, se pueden replicar resultados en GPU con soporte BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones de software: catorce tests unitarios pasados en GitHub Actions en la revisión indicada, una ejecución de aceptación en Colab con Tesla T4 y tensores BF16 (sin evaluar aceleración nativa BF16), y comparación de hashes PNG idénticos entre muestreadores empaquetado y preservado para la seed 42 con un fixture ficticio de 203 tokens (cuatro ventanas CLIP) y otro de 30 tokens (una ventana). Estos controles establecen comportamiento del software, no rendimiento clínico, privacidad, velocidad ni equivalencia bit a bit entre hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutar Stable Diffusion 1.5 en BF16 con VAE en FP32, se requiere una GPU con soporte BF16 y memoria suficiente para el pipeline completo (orientativamente en el rango de 8-16 GB en BF16, aunque el autor no publica cifras).
- GPU recomendadas: el autor indica usar una GPU CUDA con capacidad BF16; la prueba de aceptación se realizó en Tesla T4. No se especifican A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no confirmado por el autor; una T4 (16 GB) ejecutó la aceptación, lo que sugiere que GPU consumer con soporte BF16 y memoria similar podrían funcionar, pero no se valida.
- Opciones de despliegue: el paquete de inferencia propio `iu_cxr.pipeline.IUReportGenerator` instalado desde el repositorio GitHub fijado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles. Configuración por defecto: 512x512, DDIM 30 pasos, CFG 7.5, eta 0, ruido inicial FP32 en CPU, UNet/CLIP en BF16, adaptadores y decodificación VAE en FP32. Existen modos de compatibilidad explícitos CPU FP32 y GPU FP16.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IU-CXR Report LoRA | LoRA sobre SD 1.5, texto-a-imagen | 6.377.472 entrenables por adaptador | Informe completo en ventanas CLIP de 75 tokens | CreativeML Open RAIL-M | Hugging Face + GitHub |
| Stable Diffusion 1.5 (base) | Difusión texto-a-imagen | no disponible en la informacion | 77 tokens CLIP | CreativeML Open RAIL-M | Hugging Face |
| CXR-ReportGen | Imagen-a-texto (generación de informes) | LoRA rank 8, <1.5M entrenables sobre BioGPT + EfficientNet-B3 | no disponible | no disponible | GitHub |

La comparación con CXR-ReportGen es inversa en la tarea: aquel genera informes a partir de radiografías, mientras que IU-CXR Report LoRA genera radiografías a partir de informes. No se dispone de benchmarks comparativos entre ambos ni con otros adaptadores de difusión médicos en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente investigador: no apto para diagnóstico, manejo de pacientes ni consejo médico.
- Las salidas pueden contener anatomía incorrecta, patología ausente o inventada y sesgos del dominio de origen (IU X-Ray).
- Retener los tokens del informe no garantiza fidelidad de los hallazgos descritos; no hay evaluación clínica publicada.
- No se garantiza ausencia de memorización ni de riesgo de membership inference.
- El modelo solo acepta inglés; la entrada en turco no se traduce y el exceso de texto sobre el límite de ventanas se rechaza.
- El condicionamiento requiere el pipeline de inferencia específico; una llamada genérica a StableDiffusionPipeline con prompt corto no es equivalente.
- Licencia CreativeML Open RAIL-M con restricciones de uso; el código de inferencia es MIT, pero los derechos sobre los datos fuente son independientes y deben obtenerse del proveedor original.
- Release candidate (0.1.0rc1) con receta de entrenamiento parcial: no se reclama reproducción completa del entrenamiento.
- No se han verificado velocidad, privacidad ni equivalencia bit a bit entre hardware; la aceleración nativa BF16 no fue evaluada.
- Las salidas deben etiquetarse siempre como sintéticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elifnuraygun/iu-cxr-report-lora
- Repositorio de inferencia: https://github.com/elfnrkck/iu-cxr-report-lora
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Artículo del dataset IU X-Ray (Demner-Fushman et al., JAMIA 2016): https://doi.org/10.1093/jamia/ocv080
- Proyecto comparable CXR-ReportGen: https://github.com/Lalitaditya-tickoo/CXR-ReportGen
