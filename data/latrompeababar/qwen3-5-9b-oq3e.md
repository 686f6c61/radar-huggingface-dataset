# latrompeababar/Qwen3.5-9B-oQ3e

## Resumen

Qwen3.5-9B-oQ3e es una cuantización de precisión mixta del modelo Qwen3.5-9B, publicada por el usuario latrompeababar en HuggingFace. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica distintos niveles de precisión (3, 4, 5, 6 y 8 bits, además de BF16) a distintos tensores del modelo según su sensibilidad, logrando un promedio efectivo de 4,477 bits por peso sobre el checkpoint completo. El resultado es un artefacto de 5,3 GB (4,904 GiB de pesos) que conserva los 9.409.813.744 parámetros lógicos del modelo original.

El modelo base, Qwen3.5-9B, es un modelo de la familia Qwen de Alibaba con capacidad multimodal: la model card desglosa 8,954 mil millones de parámetros en el modelo de lenguaje y 456 millones en el componente de visión. Al tratarse de una cuantización, este repositorio no aporta información propia sobre arquitectura, datos de entrenamiento o benchmarks; toda la documentación disponible se limita al esquema de cuantización y al desglose de almacenamiento.

La relevancia de esta ficha radica en que el formato es específicamente MLX (Apple Silicon), lo que permite ejecutar un modelo de 9B con capacidades de visión en equipos con memoria unificada de gama alta, a costa de una degradación de precisión concentrada en los tensores menos sensibles. Es un artefacto orientado a inferencia local en macOS, no a despliegue en servidores con CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; el repo solo documenta la cuantización) |
| Parametros totales | 9.409.813.744 (8,954B en el modelo de lenguaje + 0,456B en visión) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta afín con grupo de 64: 3, 4, 5, 6 y 8 bits, más tensores en BF16; promedio efectivo 4,477 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

Desglose de la cuantización según la model card:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 3 bits, grupo 64 | 6,520B | 69,290% | 2,657 GiB | 3,50 |
| Afín 4 bits, grupo 64 | 1,487B | 15,801% | 0,779 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 0,844B | 8,973% | 0,541 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 0,101B | 1,070% | 0,076 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 0,001B | 0,008% | 0,001 GiB | 8,50 |
| BF16 | 0,457B | 4,857% | 0,851 GiB | 16,00 |
| **Total** | **9,410B** | **100%** | **4,904 GiB** | **4,477** |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. La model card de esta cuantización únicamente describe el proceso de cuantización: oQ (oMLX v0.7.3) aplica precisión mixta asignando 3 bits a la mayor parte de los pesos (69,29% de los parámetros lógicos), 4 bits al 15,80%, 5 bits al 8,97% y reserva 6 y 8 bits para fracciones menores. El 4,857% de los pesos (0,457B) se mantiene en BF16, lo que sugiere que corresponde a capas o tensores considerados críticos para la calidad (posiblemente embeddings, cabezas de salida o componentes de visión).

El desglose de almacenamiento confirma que el componente de visión (0,456B de parámetros) se almacena en 0,912 GB, es decir, aproximadamente 16 bits por peso, manteniéndose íntegramente en BF16. El modelo de lenguaje (8,954B) ocupa 4,354 GB, lo que refleja la cuantización agresiva aplicada al transformer. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan en esta ficha.
- Procesamiento de visión: el checkpoint incluye 0,456B de parámetros dedicados a visión, lo que indica capacidad multimodal de entrada de imágenes.
- Tool calling y function calling: no disponible en la documentación proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la documentación proporcionada.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 5,3 GB permiten cargar el modelo en un Mac con memoria unificada de 16 GB o superior, dejando margen para el contexto y el runtime. Es el caso de uso principal del artefacto.
- Análisis de imágenes en local: el componente de visión conservado en BF16 permite tareas de descripción de imágenes, extracción de texto (OCR) o respuesta a preguntas visuales sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado rápido en macOS: investigadores que desarrollan con MLX pueden validar pipelines multimodales con un modelo de 9B sin necesidad de GPU dedicada.
- Evaluación de cuantización: sirve como referencia para medir la degradación de calidad de una cuantización mixta de 4,477 bits frente al modelo original en tareas de texto y visión.
- Asistentes de escritorio offline: integrable en aplicaciones nativas de macOS que requieran generación de texto y comprensión de capturas de pantalla sin conexión.
- Docencia y experimentación: permite a estudiantes ejecutar un modelo multimodal de 9B en hardware de consumo, con un consumo de almacenamiento contenido (5,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 4,904 GiB; con overhead de runtime MLX y caché KV para contexto moderado, se recomienda un mínimo de 8 GB de memoria unificada, siendo 16 GB el valor cómodo para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no es compatible con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con 16 GB o más de memoria unificada; en configuraciones de 8 GB solo con contextos muy cortos.
- Opciones de despliegue: MLX (librería `mlx`), oMLX y herramientas compatibles con MLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, salvo conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ3e | 9,41B | no disponible | Mixta 3-8 bits + BF16 (4,477 bits/peso) | no disponible | MLX safetensors |
| Qwen3.5-9B (original) | 9,41B | no disponible | BF16 | no disponible | safetensors |
| Cuantizaciones GGUF de Qwen3.5-9B (Q4_K_M, Q5_K_M) | 9,41B | no disponible | 4-5 bits uniformes | no disponible | GGUF |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La diferencia principal frente a una cuantización GGUF uniforme es la asignación no uniforme de bits y la dependencia del ecosistema MLX.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en producción.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la calidad de la cuantización.
- Degradación por cuantización: el 69,29% de los pesos está a 3 bits, lo que puede provocar pérdida de calidad en tareas sensibles a la precisión numérica, como matemáticas o generación de código.
- Compatibilidad restringida: el formato MLX limita su uso a Apple Silicon; no es desplegable en infraestructura CUDA sin conversión.
- Sin información sobre sesgos, alucinación o comportamiento multilingüe: la model card no documenta ninguno de estos aspectos.
- Fecha de creación anómala (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Sin garantías del autor: no se documentan evaluaciones de perplejidad ni comparaciones con el modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/latrompeababar/Qwen3.5-9B-oQ3e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
