# MK4-Research/Alkus-3.1-27B-Abliterated-GGUF

## Resumen

Alkus 3.1 27B Abliterated es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B, desarrollado por MK4-Research, orientado a razonamiento compacto, honesto y persistente. Se presenta como el hermano "puro de razonamiento" de Mizar 3.0 (centrado en uso de herramientas y agentes), y ambos parten de una base Qwen3.8-27B sometida a un proceso de *abliteration*, es decir, la eliminación o atenuación de los mecanismos de rechazo alineados del modelo original. El modelo se distribuye exclusivamente en formato GGUF, cuantizado en Q4_K_M, con un tamano de repositorio de 16,5 GB.

El modelo cuenta con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y declara una ventana de contexto de hasta 131.072 tokens. Su propuesta diferencial no es el rendimiento bruto, sino el estilo de razonamiento: cadenas de pensamiento compactas y telegráficas, con autoverificación explícita, y una preferencia declarada por admitir desconocimiento antes que fabricar una respuesta. Está pensado como asistente de investigación para tareas de razonamiento multi-paso.

Es relevante ahora porque combina tres tendencias del ecosistema open source: los fine-tunes de razonamiento sobre bases Qwen3, la distribución en GGUF para inferencia local y los modelos "abliterated" que eliminan restricciones de rechazo. No obstante, se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con una licencia Apache 2.0 que no exime de los riesgos propios de un modelo sin alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (~15,8 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.8-27B, que a su vez es una base Qwen3 previamente sometida a *abliteration*. El ajuste se realizó mediante QLoRA con rango 16 y alpha 32 durante 2 épocas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card describe el registro de salida como "compacto y telegráfico", con autoverificación explícita, lo que sugiere un dataset de entrenamiento orientado a cadenas de razonamiento breves y verificables, aunque esta composición no se detalla.

La innovación técnica declarada no reside en la arquitectura, sino en el comportamiento inducido por el ajuste: autocorrección y preferencia por la incertidumbre honesta frente a la respuesta fabricada. El autor recomienda Flash Attention activada, caché K/V en Q8_0 y un máximo de una petición concurrente, lo que apunta a un despliegue de un solo usuario o de investigación más que a serving de alta concurrencia.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento multi-paso con cadenas de pensamiento compactas y autoverificación explícita.
- Autocorrección: el modelo está ajustado para revisar y corregir sus propios pasos.
- Honestidad calibrada: preferencia declarada por admitir desconocimiento en lugar de inventar.
- Capacidad de razonamiento heredada de la base Qwen3 (matemáticas, lógica, código), aunque no se documentan evaluaciones específicas.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado para este modelo (esa función se atribuye al modelo hermano Mizar 3.0).
- Capacidades de agente y multi-step reasoning: el razonamiento multi-paso está en el núcleo del ajuste, pero no se documenta integración con frameworks de agentes.
- Modo *thinking*: no se detalla un modo explícito; el razonamiento se describe como parte del registro de salida.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente de investigación en razonamiento multi-paso: el modelo está entrenado para descomponer problemas y verificar cada paso, lo que encaja en entornos de investigación donde se prioriza la trazabilidad del razonamiento sobre la velocidad de respuesta.
- Revisión de argumentos y detección de errores lógicos: su sesgo hacia la autoverificación permite usarlo como segundo revisor de cadenas de razonamiento generadas por otros modelos o por humanos.
- Análisis de documentos largos: con 131.072 tokens de contexto puede procesar informes, papers o expedientes completos y razonar sobre ellos sin truncar el material.
- Prototipado de asistentes que deben declarar incertidumbre: útil en dominios donde una respuesta inventada es más costosa que un "no lo sé", como auditoría interna o verificación de datos.
- Inferencia local en estación de trabajo: al distribuirse en GGUF Q4_K_M (~15,8 GB), puede ejecutarse con llama.cpp u Ollama en una GPU de consumo de gama alta con suficiente VRAM.
- Experimentación en seguridad y alineación: al ser un modelo abliterated, sirve como caso de estudio para investigar el comportamiento de modelos sin mecanismos de rechazo y diseñar mitigaciones externas.
- Generación de borradores de razonamiento para pipelines de verificación: puede producir cadenas de pensamiento que luego se validan con herramientas deterministas o con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB para la cuantización Q4_K_M (~15,8 GB de pesos) más la caché K/V; con contexto largo la caché crece de forma significativa, por lo que se recomienda reservar margen adicional.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 24 GB de VRAM (RTX 4090, RTX 3090, A10G) permite cargar el modelo en Q4_K_M con contexto moderado; para contexto cercano a 131.072 tokens se necesitan GPUs de 40-80 GB (A100 40/80 GB, H100).
- Cabe en GPU de consumo: sí, en GPUs de 24 GB con la cuantización Q4_K_M y contexto limitado; en GPUs de 16 GB el margen es muy ajustado o insuficiente.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no están confirmados para este repositorio GGUF.
- Latencia y throughput estimados: no disponibles. El autor recomienda un máximo de una petición concurrente, lo que indica que no está optimizado para serving concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Alkus 3.1 27B Abliterated | ~26,9 B | 131.072 | GGUF Q4_K_M | Apache 2.0 | Fine-tune QLoRA de Qwen3.8-27B abliterated; sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible en esta ficha | safetensors | según modelo base | Modelo original con alineación intacta; referencia directa |
| Mizar 3.0 | no disponible | no disponible | no disponible | no disponible | Modelo hermano del mismo autor, orientado a uso de herramientas y agentes |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está pensado para producción sin revisión humana.
- Riesgo de alucinación: puede producir detalles concretos y seguros pero incorrectos (constantes numéricas, hashes de commits, nombres de API) cuando no puede verificar los hechos desde el contexto.
- Abliteration: al haberse eliminado los mecanismos de rechazo de la base, el modelo puede generar contenido que el Qwen3.8-27B original rechazaría; requiere filtros y moderación externos en cualquier despliegue.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe fiable sin evaluación.
- Contexto largo: aunque declara 131.072 tokens, no hay evaluación publicada de la degradación del rendimiento a esa longitud.
- Serving: el autor recomienda una sola petición concurrente, lo que limita su uso en entornos de alta carga.
- Licencia Apache 2.0: permite uso comercial, pero la licencia no cubre los riesgos de seguridad derivados del contenido generado ni garantiza el cumplimiento de las condiciones del modelo base.
- Sin benchmarks ni adopción verificable: cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MK4-Research/Alkus-3.1-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Imagen de presentación del modelo: https://cdn-uploads.huggingface.co/production/uploads/692c9b3b93121a11649cec08/RGNh5KrWxN8kztzwzpD6m.png
