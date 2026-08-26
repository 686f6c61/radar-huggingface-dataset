# Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO

## Resumen

Triton VX Qwen3.5 2B (DPO) es un modelo de lenguaje pequeño (SLM) de 2.000 millones de parámetros desarrollado por Fabrix AI Inc. para recuperación de conocimiento y citación de documentación técnica dentro de la plataforma Fabrix.ai / RDAF. El modelo parte de la base `unsloth/Qwen3.5-2B` (una variante de la familia Qwen3.5) y se ha sometido a un proceso de alineación en dos etapas: primero un ajuste fino supervisado (SFT) sobre documentación técnica, esquemas y formatos de citación de Fabrix, y después una optimización por preferencias directas (DPO) con pares de preferencias curados para eliminar citas multi-línea y forzar citas de tarjeta única (`kb/cards/*.md`).

El modelo está diseñado específicamente para responder con rutas de archivo relativas al repositorio de conocimiento de Fabrix, sin prosa ni formato adicional. Su relevancia radica en que aborda un problema concreto de recuperación de información en entornos empresariales de IT, donde los modelos generalistas suelen fallar al citar documentación interna. La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo de lenguaje multimodal (aunque aquí se usa solo para texto), con pesos en precisión fp16 y formato safetensors. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, usado solo para texto) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, merged standalone) |

## Arquitectura y entrenamiento

La arquitectura base es `Qwen3_5ForConditionalGeneration`, un transformer multimodal de la familia Qwen3.5 que integra vision y lenguaje mediante fusion temprana. En este modelo concreto, la parte de vision no se utiliza; se emplea exclusivamente como generador de texto. El entrenamiento se realizo en dos etapas:

1. **SFT (Supervised Fine-Tuning)**: ajuste fino sobre documentacion tecnica de Fabrix, esquemas de datos y formatos de citacion. El objetivo era ensenar al modelo a mapear consultas de usuario a rutas de archivo dentro del repositorio de conocimiento.
2. **DPO (Direct Preference Optimization)**: optimizacion con pares de preferencias curados para corregir el comportamiento del SFT. Se elimino la tendencia a generar multiples citas de directorios tematicos y se forzo la citacion de tarjetas individuales (`kb/cards/*.md`). El resultado es una tasa de citacion precisa del 95,5% (21/22) frente al 40,9% del baseline SFT.

El entrenamiento se realizo con el framework Unsloth y Hugging Face Transformers / TRL. No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre el numero de tokens procesados.

## Capacidades

- Recuperacion de conocimiento especifico de dominio: responde con rutas relativas a archivos dentro del repositorio de Fabrix (por ejemplo, `kb/cards/widget-filters.md`).
- Citacion de tarjetas individuales: prefiere citar `kb/cards/*.md` sobre archivos de directorios tematicos (`kb/pstreams/`, `kb/widgets/`, `kb/dashboards/`, `kb/ux/`, `kb/entry/`).
- Formato de salida estricto: genera solo rutas de archivo, una por linea, sin prosa, HTML, numeros de linea ni ejemplos de codigo.
- Manejo de consultas de usuario en lenguaje natural sobre configuracion de dashboards, widgets, filtros y pipelines.
- Capacidad de indicar "cero rutas" cuando ninguna entrada del repositorio es aplicable.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera de su tarea de citacion.
- Multilingue: solo ingles (segun la model card).

## Casos de uso

- Asistente de documentacion interna para equipos de IT: un desarrollador pregunta "como anado un filtro de grupo en un dashboard" y el modelo responde con la ruta exacta del archivo de documentacion relevante, ahorrando tiempo de busqueda en repositorios extensos.
- Integracion en chatbots de soporte tecnico: el modelo puede conectarse a un sistema de tickets para sugerir la documentacion adecuada ante incidencias de configuracion, reduciendo la escalada a humanos.
- Generacion de enlaces de ayuda contextual en aplicaciones SaaS: al detectar una accion del usuario (por ejemplo, configurar un widget), el modelo devuelve la ruta del articulo de ayuda correspondiente para mostrarlo en un panel lateral.
- Automatizacion de respuestas en foros internos o Slack: ante preguntas frecuentes sobre la plataforma Fabrix, el modelo proporciona la cita correcta sin necesidad de intervencion manual.
- Validacion de cobertura documental: al consultar al modelo sobre multiples funcionalidades, se puede detectar que areas carecen de tarjetas de documentacion (cuando responde con cero rutas), ayudando a priorizar la creacion de contenido.
- Pipeline de RAG (Retrieval-Augmented Generation): el modelo actua como modulo de recuperacion de rutas, alimentando a un LLM generalista con las referencias correctas para generar respuestas completas.

## Benchmarks y rendimiento

La model card incluye una evaluacion especifica sobre el benchmark de preferencias de citacion de Fabrix. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | SFT Baseline (ckpt-300) | Modelo DPO (este modelo) |
|---|---|---|
| Precision de preferencia DPO | 50,0% | 100,0% |
| Margen de preferencia log-prob | -0,15 | +0,53 |
| Coincidencia exacta en citas preferidas | 4,5% | 90,9% (20/22) |
| Tasa de citacion de tarjeta precisa (`kb/cards/*`) | 40,9% | 95,5% (21/22) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4-5 GB (modelo de 2B con pesos en fp16, mas overhead de atencion y cache). Cabe en GPUs de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o superiores.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16; para mayor velocidad, una RTX 4090 o A10G.
- Opciones de despliegue: al ser un modelo de transformers estandar, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se exporta). El ejemplo de uso de la model card usa `transformers` con `device_map="auto"`.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 2B en una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar en la informacion proporcionada. Como referencia cualitativa, se puede comparar con modelos generalistas de 2B como Qwen2.5-1.5B o Llama-3.2-1B, pero estos no estan especializados en recuperacion de documentacion interna y no ofrecen el mismo formato de salida. La especializacion de Triton VX lo hace mas adecuado para su tarea concreta, aunque carece de las capacidades generales de razonamiento o generacion de codigo de los modelos generalistas. No se dispone de datos cuantitativos para una comparacion rigurosa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo es util para recuperar rutas de documentacion de Fabrix; fuera de ese dominio, su salida no tiene sentido.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- No genera texto explicativo ni conversacional; su salida se limita a rutas de archivo.
- Riesgo de alucinacion en consultas ambiguas o fuera del alcance de la documentacion; el modelo puede devolver rutas incorrectas si no hay una tarjeta adecuada.
- No se ha evaluado en benchmarks generales de razonamiento, codigo o matematicas; su rendimiento en tareas generales es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de la documentacion interna de Fabrix; su utilidad fuera de ese ecosistema es limitada.
- No se proporcionan datos sobre sesgos, pero al estar entrenado sobre documentacion tecnica especifica, podria reflejar sesgos de esa documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fabrix-AI-Inc/Triton-VX-Qwen3.5-2B-DPO
- Blog de Fabrix sobre la familia Triton: https://fabrix.ai/blog/introducing-triton-specialized-ai-models-for-enterprise-it-operations/
- Blog general de Fabrix: https://fabrix.ai/blog/
- Repositorio de kernels Triton para Qwen3.5 (no oficial, referencia de la familia): https://github.com/RightNow-AI/qwen3.5-triton
- Repositorio de la serie Qwen3.5 (referencia de la familia): https://github.com/ABDtmx/Qwen3.5
