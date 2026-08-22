# Navyaforaa/LitGram-1.5B-LoRA-v1.3

## Resumen

LitGram-1.5B-LoRA-v1.3 es un adaptador LoRA de corrección puntual desarrollado por Navyaforaa para el modelo base LitGram-1.5B, un LLM de 1.500 millones de parámetros basado en la arquitectura Qwen2. Este adaptador, publicado bajo licencia Apache 2.0, se ha entrenado con un dataset correctivo verificado de pequeño tamaño para subsanar errores concretos de atribución literaria, escansión métrica y fabricación de citas, en lugar de ampliar capacidades generales del modelo.

La relevancia de esta pieza radica en su enfoque quirúrgico: en lugar de un fine-tuning masivo, el adaptador interviene sobre cinco problemas específicos de precisión literaria, como la atribución correcta de la cita de Milton en *Paradise Lost* o la distinción entre las ediciones de 1667 y 1674 de la obra. El repositorio ocupa solo 0,1 GB, lo que permite integrarlo sobre el modelo base con la librería PEFT sin reentrenar el modelo completo. Está pensado para desarrolladores que necesitan corregir comportamientos concretos en un LLM ya existente con un coste computacional mínimo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen2 (base: Navyaforaa/LitGram-1.5B) |
| Parametros totales | Adapter: 0,1 GB (repo); base: 1,5 B |
| Parametros activos | no disponible |
| Longitud de contexto | 32K tokens (segun web) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset de entrenamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se carga mediante `PeftModel.from_pretrained` sobre el modelo base NavyaFor/LitGram-1.5B, que a su vez utiliza la arquitectura Qwen2. Segun la informacion disponible, el modelo base se entreno con las librerias Unsloth y TRL de HuggingFace, lo que indica un pipeline de entrenamiento optimizado. El adaptador v1.3, por su parte, se entreno sobre un dataset correctivo "pequeño y verificado" (sin cifras exactas publicadas) que aborda cinco objetivos: moderacion en afirmaciones sobre creadores e instituciones no verificadas, atribucion correcta de la cita de Milton a Satan en *Paradise Lost*, distincion entre las ediciones de 1667 (diez libros) y 1674 (doce libros), escansion regular en pentametro yambico del soneto "Shall I compare thee to a summer's day?", y rechazo a fabricar citas literarias.

No se han publicado detalles sobre el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni el uso de tecnicas como RLHF o DPO. La validacion consistio en cinco comprobaciones parafraseadas de retencion que pasaron tras el entrenamiento.

## Capacidades

- Correccion de atribucion literaria: asigna correctamente la cita "Better to reign in Hell, than serve in Heav'n." a Satan en *Paradise Lost*, Book I, linea 263.
- Precision editorial: distingue correctamente entre las ediciones de 1667 (diez libros) y 1674 (once libros) de *Paradise Lost*.
- Escansion metrica: reconoce el pentametro yambico regular en el soneto de Shakespeare "Shall I compare thee to a summer's day?".
- Rechazo de fabricacion de citas: se niega a generar citas literarias inventadas o no verificadas.
- Moderacion de afirmaciones: evita hacer aseveraciones no verificadas sobre creadores, instituciones, entrenamiento y citaciones.
- Compatibilidad PEFT: se integra como adaptador LoRA con la libreria PEFT sobre el modelo base.

## Casos de uso

- Verificacion de citas en entornos editoriales: un editor puede usar el modelo base con este adaptador para comprobar si una cita literaria esta atribuida correctamente antes de publicarla, reduciendo el riesgo de errores en textos academicos.
- Asistente de docencia en literatura inglesa: el adaptador permite a un profesor generar ejercicios de analisis metrico (pentatmetro yambico) con seguridad de que la escansion propuesta es correcta.
- Pipeline de curaduria de contenidos: en plataformas que agregan contenido literario, el adaptador puede filtrar afirmaciones no verificadas sobre autores y obras antes de que lleguen al usuario final.
- Chatbot de referencia bibliografica: un chatbot academico puede integrar este adaptador para responder con precision sobre la historia editorial de *Paradise Lost* sin fabricar detalles.
- Evaluacion de calidad de LLMs en tareas de citacion: el adaptador sirve como componente de prueba en sistemas de evaluacion automatica que comprueban la fiabilidad de modelos generativos en tareas literarias.
- Micro-ajuste de modelos en produccion: desarrolladores pueden aplicar este adaptador sobre LitGram-1.5B en despliegues existentes con vLLM u Ollama para corregir comportamientos especificos sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La validacion reportada por el autor consiste en cinco comprobaciones de retencion parafraseadas que pasaron tras el entrenamiento, cubriendo las cinco areas correctivas del adaptador. No se dispone de datos comparativos cuantitativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: 3,1 GB para el modelo base LitGram-1.5B en inferencia, segun la entrada en LLM Explorer. El adaptador LoRA anade una sobrecarga minima (repo de 0,1 GB).
- GPU recomendadas: cabe en tarjetas de consumo con al menos 4 GB de VRAM, como GTX 1650 Super, RTX 3050 o superiores. En entornos profesionales, una RTX 4090 o A10 ofrecerian margen para batch.
- Opciones de despliegue: al ser un modelo base Qwen2 de 1,5 B con adaptador PEFT, puede desplegarse con vLLM, TGI, Ollama o llama.cpp (previo merge del adaptador con el base).
- Latencia: no disponible; por el tamano del modelo, se espera una latencia en el rango de decenas de milisegundos por token en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| LitGram-1.5B + LoRA v1.3 | 1,5 B + adapter | 32K | Correccion literaria especifica | Apache 2.0 |
| Qwen2-1.5B (base) | 1,5 B | 32K | LLM general | Apache 2.0 |
| TinyLlama-1.1B | 1,1 B | 2K | LLM general compacto | Apache 2.0 |
| SmolLM-1.7B | 1,7 B | 8K | LLM general compacto | Apache 2.0 |

La comparativa se limita a modelos de tamano similar; no se conocen alternativas especificamente orientadas a la correccion de citas literarias con el mismo enfoque de adaptador LoRA. El modelo base LitGram-1.5B comparte arquitectura Qwen2, por lo que hereda su capacidad de contexto de 32K.

## Limitaciones y advertencias

- El adaptador es un parche correctivo estrecho, no un benchmark general de literatura. Su eficacia se limita a los cinco casos de entrenamiento.
- Puede seguir cometiendo errores en otras tareas literarias o de citacion fuera de su dominio de entrenamiento.
- No se ha publicado informacion sobre sesgos potenciales del modelo base o del adaptador.
- El riesgo de alucinacion persiste en areas fuera de las cubiertas por el adaptador; se recomienda verificar citas y afirmaciones academicas con fuentes fiables.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (LitGram-1.5B) y el adaptador deben ser revisados para verificar que el dataset de entrenamiento cumple con las condiciones de la licencia.
- El modelo base se ha entrenado con Unsloth y TRL, pero no se detalla si el adaptador ha sido evaluado en entornos de produccion reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Navyaforaa/LitGram-1.5B-LoRA-v1.3
- Version anterior (v1.2): https://huggingface.co/Navyaforaa/LitGram-1.5B-LoRA-v1.2
- Modelo base: https://huggingface.co/Navyaforaa/LitGram-1.5B
- Entrada en LLM Explorer (LitGram-1.5B): https://llm-explorer.com/model/Navyaforaa%2FLitGram-1.5B,5cMH42EdltenZvdLUdpCpB
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Navyaforaa/LitGram-1.5B
