# IFM/K2-Horizon-0.9B-GGUF

## Resumen

K2-Horizon-0.9B es un modelo de lenguaje compacto, denso y de tipo decoder-only, desarrollado por IFM (en colaboración con MBZUAI-IFM) como miembro de la familia K2-Horizon. Está diseñado para tareas de razonamiento, matemáticas, código, ciencia y uso de herramientas, con un enfoque en investigación de modelos de base transparente y despliegue práctico. Este repositorio concreto contiene las versiones GGUF del modelo para su uso con llama.cpp, manteniendo los tensores en precisión BF16 original e incluyendo el tokenizador y la plantilla de chat compatible.

El modelo destaca por su ventana de contexto de 128K tokens (131.072) gracias a escalado YaRN RoPE, y por haber sido entrenado mediante destilación multi-profesor con especialistas en matemáticas/código, STEM y seguimiento de instrucciones. Con aproximadamente 1.078 millones de parámetros (clase 0.9B), se posiciona como una opción ligera para experimentación local, aunque su licencia es de uso interno exclusivo. Su relevancia actual radica en ofrecer capacidades de razonamiento en un tamaño reducido, comparable a modelos como Qwen3.5-0.8B o OpenBMB-1B, aunque con una ventana de contexto notablemente mayor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 1.078.285.824 (≈1,08B, clase 0.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) con escalado YaRN RoPE |
| Tipos de cuantizacion | No especificados en la información disponible; los archivos GGUF mantienen tensores en BF16 original |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | internal-only (license: other) |
| Formato de pesos | GGUF (con tensores BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, sin componentes de mezcla de expertos (MoE). Su principal innovación es el uso de destilación multi-profesor: se entrenó utilizando profesores especializados en dominios distintos —matemáticas y código, STEM en general, y seguimiento de instrucciones— para transferir capacidades de razonamiento a un modelo compacto de 0.9B. La ventana de contexto de 128K se logra mediante escalado posicional YaRN sobre RoPE, lo que permite procesar documentos largos sin necesidad de entrenamiento adicional en longitudes extremas. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento es descrito como "totalmente abierto" en cuanto a que se publicarán los datos, la receta y el código de entrenamiento, aunque estos materiales no están disponibles en el repositorio actual.

## Capacidades

- Generación de texto y razonamiento multi-step, con evaluación en benchmarks de matemáticas, código, ciencia y uso de herramientas.
- Ventana de contexto de 128K tokens, adecuada para tareas que requieren memoria a largo plazo o procesamiento de documentos extensos.
- Soporte de tool-use (evaluado en benchmarks específicos), aunque no se confirma explícitamente si implementa function calling nativo.
- Capacidades multilingües en inglés y chino, con plantilla de chat compatible con llama.cpp.
- Naturaleza conversacional (etiquetado como "conversational"), apta para diálogos multi-turno.
- No se mencionan capacidades de visión, audio ni modo de pensamiento explícito (thinking mode).

## Casos de uso

- Asistente de código en local: con su tamaño compacto, puede integrarse en entornos de desarrollo sin GPU dedicada, ayudando en generación de fragmentos, depuración y explicación de código, especialmente en Python y lenguajes populares.
- Tutor de matemáticas y ciencia: su entrenamiento con profesores especializados en STEM lo hace adecuado para resolver problemas matemáticos paso a paso y explicar conceptos científicos en inglés o chino.
- Análisis de documentos largos: la ventana de 128K permite procesar contratos, artículos de investigación o libros completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas sobre el contenido.
- Chatbot bilingüe en/zh: puede desplegarse como agente conversacional en aplicaciones de atención al cliente o asistentes personales que requieran soporte en ambos idiomas.
- Prototipado rápido de agentes con herramientas: dado su soporte de tool-use, sirve para experimentar con pipelines de agentes que llaman APIs o ejecutan acciones simples, en entornos de desarrollo con recursos limitados.
- Edge computing y dispositivos de baja potencia: al ser un modelo de ~1B, cabe en dispositivos con 4-8 GB de RAM, permitiendo inferencia en local sin conexión a la nube, por ejemplo en portátiles o mini-PCs.
- Fine-tuning para tareas específicas: aunque no se documenta explícitamente, al ser un modelo denso pequeño, es factible ajustarlo con datasets propios para dominios concretos (legal, médico, etc.), siempre que la licencia lo permita.

## Benchmarks y rendimiento

La model card incluye una figura con resultados comparativos frente a modelos de referencia como Qwen3.5-0.8B, OpenBMB-1B y Qwen3.5-2B, pero no se han proporcionado valores numéricos en la información disponible. La tabla mostrada en el README está truncada y solo recoge parámetros y arquitectura, sin métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.). Por tanto, no se pueden presentar datos cuantitativos verificables en esta ficha. Se recomienda consultar la imagen de benchmarks en el repositorio original para obtener los resultados visuales.

## Requisitos de hardware

- El tamaño del repositorio es de 2,2 GB, lo que sugiere que los archivos GGUF incluyen varias cuantizaciones (posiblemente Q4, Q5, Q8, etc.), aunque no se especifican.
- Con los pesos en BF16 (~2,2 GB), se requiere al menos 4 GB de VRAM para inferencia con contexto moderado (por ejemplo, 8K tokens).
- Para aprovechar la ventana completa de 128K tokens, la memoria de la caché KV puede superar los 4 GB adicionales, por lo que se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, etc.) o el uso de cuantizaciones más agresivas.
- Compatible con llama.cpp, pero requiere una versión con soporte para la arquitectura K2 Horizon; el fork oficial de MBZUAI-IFM está disponible en GitHub.
- También es compatible con vLLM según las recetas oficiales (recipes.vllm.ai), lo que permite despliegue en producción con alto throughput.
- En CPU, con cuantización Q4, podría ejecutarse en equipos con 8 GB de RAM, aunque con latencia mayor (no se dispone de datos de throughput).

## Comparativa con modelos similares

No se dispone de información completa sobre los modelos de referencia mencionados (Qwen3.5-0.8B, OpenBMB-1B, Qwen3.5-2B) en cuanto a contexto, licencia y rendimiento. La siguiente tabla resume lo conocido:

| Modelo | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-0.9B | 1,08B | 128K | internal-only | GGUF, safetensors |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | no disponible |
| OpenBMB-1B | 1B | no disponible | no disponible | no disponible |
| Qwen3.5-2B | 2B | no disponible | no disponible | no disponible |

Dado que no se han publicado métricas numéricas, no es posible realizar una comparativa de rendimiento objetiva. La licencia internal-only de K2-Horizon-0.9B es una desventaja frente a alternativas de código abierto con permisos comerciales.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "internal-only" impide el uso comercial o la redistribución, limitando su aplicación a entornos internos de investigación.
- Idiomas limitados: solo inglés y chino; no hay soporte para español ni otros idiomas.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos por el entrenamiento.
- Falta de transparencia en el entrenamiento: no se han publicado detalles sobre tokens de entrenamiento, composición del dataset ni metodología de destilación, a pesar de la promesa de apertura.
- Dependencia de infraestructura específica: requiere un fork de llama.cpp con soporte para la arquitectura K2 Horizon, lo que puede dificultar su integración en entornos estándar.
- La fecha de creación (2026) sugiere que es un modelo muy reciente; su ecosistema de herramientas aún está en desarrollo (PR de soporte en llama.cpp en curso).

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/K2-Horizon-0.9B-GGUF
- Modelo original (safetensors): https://huggingface.co/IFM/K2-Horizon-0.9B
- Recetas vLLM: https://recipes.vllm.ai/IFM/K2-Horizon-0.9B
- Fork de llama.cpp con soporte K2 Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Familia K2 en HuggingFace: https://huggingface.co/IFM/K2
