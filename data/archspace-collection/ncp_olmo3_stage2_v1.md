# ArchSpace-Collection/NCP_Olmo3_Stage2_v1

## Resumen

El modelo `ArchSpace-Collection/NCP_Olmo3_Stage2_v1` es un checkpoint intermedio del proyecto ConceptLM, publicado por el colectivo ArchSpace-Collection. Se trata de un artefacto de liberación que contiene un conjunto compartido de pesos en formato SafeTensors con claves de proyección estándar de Hugging Face (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), diseñado para cargarse mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` o a través del backend vLLM de ConceptLM, sin necesidad de copiar pesos nativos de Megatron. El nombre sugiere una relación con la familia Olmo 3, aunque no se confirma explícitamente en la información disponible.

Con 8.938.363.792 parámetros (aproximadamente 8,9 mil millones), este checkpoint se enmarca en la escala de modelos de 7-9B, orientado a la exploración de arquitecturas dentro del proyecto ArchSpace, una iniciativa abierta de InternLM para probar hipótesis arquitectónicas de forma transparente y reproducible. El repositorio incluye manifiestos de conversión y validación (`conversion_manifest.json` y `release_validation_manifest.json`) que documentan el origen y la verificación de los pesos. La relevancia actual radica en su carácter de experimento abierto: permite a investigadores y desarrolladores inspeccionar un checkpoint intermedio de un pipeline de entrenamiento en varias etapas, con trazabilidad completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente derivada de Olmo 3, sin confirmar) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona bfloat16 en los tags de otros checkpoints de la serie) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con claves de proyección Hugging Face estándar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre "NCP_Olmo3" y los tags `ncp_olmo3` y `conceptlm` sugieren que se trata de una variante o adaptación de la familia Olmo 3, que según el paper arXiv 2512.13961 es una familia de modelos totalmente abiertos de 7B y 32B parámetros, entrenados para razonamiento de contexto largo, function calling, codificación, seguimiento de instrucciones, chat general y recuperación de conocimiento. Sin embargo, no se confirma que este checkpoint concreto siga exactamente esa arquitectura.

El proyecto ArchSpace, del que forma parte este lanzamiento, se describe como un experimento abierto para la innovación en arquitecturas de LLM, donde las hipótesis propuestas por la comunidad se integran en flujos de entrenamiento y evaluación transparentes, trazables y reproducibles. El checkpoint corresponde a la "Stage2" (etapa 2) de un proceso de entrenamiento por fases, y se publica como un artefacto puro de Hugging Face, lo que implica que los pesos ya han sido convertidos a un formato compatible con el ecosistema estándar. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto causal: el modelo está etiquetado como `causal-lm`, por lo que es capaz de generar texto autoregresivamente.
- Carga mediante `trust_remote_code=True`: requiere código personalizado para su correcta instanciación, lo que indica que puede tener componentes arquitectónicos no estándar.
- Compatibilidad con vLLM de ConceptLM: puede desplegarse en el backend de inferencia de ConceptLM, lo que sugiere soporte para inferencia optimizada.
- Capacidades específicas (razonamiento, código, function calling, etc.): no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

Dado que la información pública es limitada, los casos de uso se infieren de la naturaleza del proyecto y de la familia Olmo 3, pero deben considerarse como hipótesis razonables, no como capacidades confirmadas:

- Investigación en arquitecturas de LLM: este checkpoint sirve como punto de referencia intermedio para estudiar el comportamiento de una arquitectura experimental en una etapa concreta del entrenamiento, permitiendo comparar la evolución de métricas entre etapas (Stage1, Stage2, etc.).
- Reproducibilidad de experimentos: al incluir manifiestos de conversión y validación, los investigadores pueden verificar la integridad de los pesos y reproducir los resultados publicados por el proyecto ArchSpace.
- Desarrollo de variantes de Olmo 3: si la arquitectura deriva de Olmo 3, podría utilizarse como base para fine-tuning en tareas específicas de generación de texto, razonamiento o codificación, aunque esto no está confirmado.
- Evaluación de técnicas de conversión de pesos: el checkpoint demuestra un flujo de conversión de claves Megatron a claves Hugging Face, útil para equipos que trabajan con modelos entrenados en infraestructuras no estándar.
- Pruebas de integración con vLLM: los desarrolladores de ConceptLM o de vLLM pueden usar este artefacto para validar la compatibilidad del backend con arquitecturas personalizadas.
- Análisis de seguridad y sesgos en modelos intermedios: al ser un checkpoint de una etapa temprana, permite estudiar cómo evolucionan los sesgos y comportamientos indeseados a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este checkpoint concreto.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este modelo. Sin embargo, dado que tiene aproximadamente 8,9 mil millones de parámetros y los pesos están en bfloat16 (según los tags de otros checkpoints de la serie), se puede estimar:

- VRAM estimada para inferencia en bf16: alrededor de 18 GB solo para los pesos (8,9B × 2 bytes), más overhead de activaciones y KV cache. En la práctica, se necesitarían al menos 24 GB de VRAM para una inferencia cómoda.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría ser suficiente para inferencia con cuantización, mientras que para bf16 completo se recomendaría una A100 (40 GB o 80 GB) o H100.
- En consumer GPU: podría caber en una RTX 4090 con cuantización de 4 bits (aproximadamente 5-6 GB de pesos), pero no hay confirmación de cuantizaciones disponibles.
- Opciones de despliegue: vLLM (backend de ConceptLM), Transformers con `trust_remote_code=True`. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo parece pertenecer a la familia Olmo 3, pero al ser un checkpoint experimental intermedio, no se conocen sus métricas de rendimiento. Como referencia, los modelos Olmo 3 de 7B y 32B son totalmente abiertos y están orientados a razonamiento de contexto largo, function calling y codificación, pero este checkpoint concreto no ha sido evaluado públicamente. Alternativas comparables en tamaño (7-9B) podrían ser Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B, pero no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un modelo entrenado sobre datos de internet (posiblemente Dolma 3, según los tags de otros checkpoints de la serie), es probable que herede sesgos presentes en esos datos.
- Riesgo de alucinación: no evaluado públicamente; se recomienda precaución en aplicaciones de producción que requieran veracidad factual.
- Limitaciones de contexto e idioma: desconocidas; no se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no está indicada, lo que impide su uso comercial sin aclaración previa. Se debe contactar con el autor antes de cualquier uso productivo.
- Carga con código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Se recomienda auditar el código antes de ejecutarlo en entornos sensibles.
- Naturaleza experimental: al ser un checkpoint de una etapa intermedia (Stage2), no se garantiza que el modelo sea funcional o seguro para tareas del mundo real. Es un artefacto de investigación.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage2_v1
- Checkpoint Stage1_Step100000: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step100000
- Checkpoint Stage1_StepLast: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_StepLast
- Proyecto ArchSpace en GitHub: https://github.com/InternLM/archspace
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Scripts oficiales de entrenamiento de Olmo 3: https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
