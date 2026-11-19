# orcarouter/Qwen3.8-27B-Uncensored-FP8

## Resumen

Qwen3.8-27B-Uncensored-FP8 es una compilación abliterada (dirección de rechazo eliminada) y cuantizada a block-FP8 del modelo denso Qwen3.8-27B de Qwen (Alibaba), publicada por orcarouter. Se trata de un modelo nativo visión-lenguaje de 27.781.427.952 parámetros (aproximadamente 27,8 B) con atención híbrida (Gated DeltaNet lineal combinada con atención completa), control flexible de razonamiento, soporte de tool calling y una cabeza de decodificación especulativa MTP. El contexto declarado alcanza los 262K tokens.

El interés técnico de esta build es doble. Por un lado, elimina la dirección de rechazo del flujo residual mediante abliteración, de modo que el modelo deja de negarse a peticiones que el original rechazaría. Por otro, se recuantiza siguiendo el esquema FP8 exacto del checkpoint oficial Qwen/Qwen3.8-27B-FP8, lo que permite servirlo con la misma ruta de kernels de vLLM y conservar contexto, herramientas, razonamiento y MTP. El repositorio ocupa 30,9 GB y acumula más de 54.000 descargas y 1.900 likes.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: builds de investigación sin alineación de seguridad para interpretabilidad y red teaming, cuantización FP8 con bloques para despliegue eficiente en vLLM, y modelos densos multimodales de tamaño medio con contexto muy largo. El acceso está restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: Gated DeltaNet (atención lineal) + atención completa; cabeza MTP de decodificación especulativa |
| Parámetros totales | 27.781.427.952 (≈27,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | Block-FP8 E4M3 (esquema idéntico al de Qwen/Qwen3.8-27B-FP8); no se documentan otras variantes en esta build |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 27,8 B de parámetros que sustituye parte de las capas de atención por Gated DeltaNet, un mecanismo de atención lineal con estado recurrente con compuertas, manteniendo capas de atención completa. Esta hibridación reduce el coste de memoria y cómputo en contextos largos (hasta 262K tokens) frente a un transformer de atención completa puro. Incluye además una cabeza MTP (multi-token prediction) que actúa como decodificador especulativo, acelerando la generación al proponer varios tokens por paso y verificarlos en paralelo. El pipeline declarado es image-text-to-text, es decir, el modelo procesa imágenes y texto de forma nativa.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Respecto a esta build concreta, la innovación documentada es el proceso de abliteración (ortogonalización de la dirección de rechazo en el flujo residual) seguido de una recuantización a block-FP8 E4M3 que replica el esquema del checkpoint FP8 oficial, con el objetivo de mantener la misma ruta de kernels en vLLM y preservar las capacidades de herramientas, razonamiento y decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) controlable de forma flexible.
- Comprensión de imágenes y texto (image-text-to-text): descripción, extracción de información y razonamiento sobre contenido visual.
- Generación de código y matemáticas, con soporte de razonamiento multi-paso.
- Tool calling / function calling para integración en pipelines y agentes.
- Decodificación especulativa MTP, que acelera la inferencia en despliegues compatibles con vLLM.
- Multilingüe limitado a inglés y chino según la model card.
- Capacidad de cumplir peticiones que el modelo base rechazaría, como consecuencia directa de la abliteración.
- Contexto largo de 262K tokens para conversaciones y documentos extensos.

## Casos de uso

- Investigación en interpretabilidad y mecanismos de rechazo: comparar las activaciones y respuestas del modelo abliterado frente al Qwen3.8-27B original para localizar y caracterizar la dirección de rechazo en el flujo residual.
- Red teaming y evaluación de robustez: generar intentos de jailbreak, prompts adversarios y contenido dañino controlado para entrenar y validar clasificadores de moderación y filtros de seguridad propios.
- Análisis de documentos largos con imágenes: informes, contratos o expedientes de hasta 262K tokens combinando OCR implícito y razonamiento sobre tablas y figuras, gracias a la ventana de contexto y a la entrada multimodal.
- Agentes con tool calling en entornos aislados: prototipos de automatización que encadenan llamadas a funciones y razonamiento multi-paso, servidos con vLLM aprovechando la ruta de kernels FP8 y la cabeza MTP.
- Evaluación de cuantización FP8: medir la degradación de calidad y el throughput de block-FP8 E4M3 frente al checkpoint en BF16 en tareas de razonamiento, código y visión.
- Generación de datos sintéticos para investigación: producir corpus de texto e imagen-texto sin las restricciones de rechazo del modelo original, siempre en entornos controlados y con revisión posterior.
- Estudio comparativo de decodificación especulativa: cuantificar la ganancia de latencia de la cabeza MTP con distintos tamaños de lote y longitudes de contexto en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos block-FP8 E4M3, el peso del modelo ronda los 28 GB; el repositorio completo ocupa 30,9 GB. Añadiendo caché KV para contexto largo, un despliegue práctico requiere del orden de 40-48 GB de VRAM en configuraciones conservadoras, y más si se busca el contexto máximo de 262K tokens.
- GPU recomendadas: H100 (80 GB) y A100 (80 GB) para contexto largo y lotes grandes; L40S (48 GB) o A6000 Ada (48 GB) para despliegues con contexto moderado.
- GPU de consumo: una RTX 4090 (24 GB) no permite cargar los pesos FP8 completos en una sola tarjeta; sería necesario repartir el modelo entre varias GPU o recurrir a cuantizaciones adicionales no documentadas en esta build.
- Opciones de despliegue: vLLM es la vía prevista, al replicar el esquema FP8 del checkpoint oficial y conservar la ruta de kernels; la librería declarada es transformers. No se documentan integraciones con llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP está pensada para reducir la latencia de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | ≈27,8 B (denso) | 262K | Imagen-texto | Apache 2.0 | Gated | Abliterado, block-FP8 E4M3, MTP |
| Qwen/Qwen3.8-27B | ≈27,8 B (denso) | 262K | Imagen-texto | Apache 2.0 | No disponible en la información | Modelo base con alineación de seguridad intacta |
| Qwen/Qwen3.8-27B-FP8 | ≈27,8 B (denso) | 262K | Imagen-texto | Apache 2.0 | No disponible en la información | Cuantización FP8 oficial; mismo esquema de kernels |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La alineación de seguridad ha sido sustancialmente eliminada: el modelo cumplirá peticiones dañinas, ilegales u ofensivas que el original rechazaría, y no tiene salvaguardas integradas significativas.
- Riesgo elevado de usos indebidos: la propia model card restringe su uso a investigación legítima (interpretabilidad, seguridad de IA, red teaming, evaluación de robustez) y desaconseja explícitamente el despliegue a usuarios finales o en producción sin capas propias de moderación.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad, especialmente en contexto largo.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia: Apache 2.0 permite uso comercial, pero esa permisividad no exime de responsabilidad legal ni de las obligaciones de moderación aplicables al despliegue.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que añade fricción a pipelines automatizados.
- Sesgos: no se documentan análisis de sesgo; la abliteración puede alterar también comportamientos no relacionados con el rechazo, y no se aportan evaluaciones de regresión de capacidades.
- Compatibilidad: al fijarse al esquema FP8 del checkpoint oficial, el rendimiento óptimo depende de vLLM; otras rutas de inferencia no están documentadas y podrían no soportar la arquitectura híbrida o la cabeza MTP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización FP8 oficial del base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos: https://www.orcarouter.ai/models
- Ficha del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- GitHub de la organización: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
