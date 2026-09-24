# rubenbalbastre/r2warmup_qwen_qwen2_5_0_5b_instruct_john_d_rockefeller

## Resumen

`rubenbalbastre/r2warmup_qwen_qwen2_5_0_5b_instruct_john_d_rockefeller` es un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT, con la librería TRL) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo completo con pesos propios: se distribuye únicamente el delta de pesos en formato safetensors y requiere cargar el modelo base por separado para su uso. El repositorio ocupa 0,2 GB y la model card es la plantilla por defecto de HuggingFace, sin ningún campo completado por el autor.

El identificador del adaptador lo sitúa dentro de una línea de trabajo de *machine unlearning*: la etiqueta `base_model:adapter` apunta a la ruta local `/storage/scratch/lv13/lv13594/machine-unlearning-llm/outputs/model/Qwen--Qwen2.5-0.5B-Instruct`, lo que sugiere que forma parte de un *pipeline* experimental de desaprendizaje o de calentamiento previo (*warmup*) asociado a ese proyecto. El sufijo `john_d_rockefeller` indica que el ajuste incorpora una persona o personaje concreto, aunque no hay documentación que lo confirme.

Por su tamaño (0,5 B de parámetros del modelo base) y su licencia sin declarar, se trata de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta, no de un modelo orientado a producción. Es relevante como ejemplo reproducible de adaptación ligera y de publicación de adaptadores LoRA, y como punto de partida para quien quiera replicar el flujo con TRL y PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la del modelo base Qwen2.5-0.5B-Instruct); este repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | Aproximadamente 0,49 B en el modelo base (segun documentacion publica de Qwen2.5); numero de parametros del adaptador: no disponible |
| Longitud de contexto | No especificada en la model card; la del modelo base es de 32.768 tokens segun su documentacion publica |
| Tipos de cuantizacion | No disponible (no se han publicado cuantizaciones del adaptador) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 declara soporte para 29 idiomas segun su documentacion publica |
| Licencia | No disponible (la model card deja el campo como "[More Information Needed]"; el modelo base se publica bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio tambien incluye la configuracion de PEFT, con version de framework PEFT 0.19.1 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y *embeddings* atados. Según la información disponible, el entrenamiento se realizó con SFT empleando la librería TRL y se empaquetó con PEFT 0.19.1, lo que implica un ajuste de bajo rango sobre las matrices de atención y/o proyecciones del modelo base congelado. La model card no documenta el rango del adaptador, el *alpha*, el *dropout*, la tasa de aprendizaje, el número de pasos ni la composición del dataset, todos ellos marcados como "[More Information Needed]".

Tampoco se declara si hubo una fase de RLHF, DPO u optimización posterior al SFT, ni si se aplicaron técnicas de desaprendizaje selectivo pese a que la ruta interna del proyecto se denomina `machine-unlearning-llm`. No hay información sobre el número de tokens de entrenamiento, la mezcla de datos ni el hardware utilizado. La única referencia externa es un identificador de arXiv (`2608.17804`) incluido en las etiquetas del repositorio, cuya correspondencia con el entrenamiento de este adaptador no puede verificarse con los datos disponibles.

## Capacidades

- Generación de texto conversacional: heredada del modelo base Qwen2.5-0.5B-Instruct, ajustada con SFT sobre diálogo.
- Seguimiento de instrucciones: la etiqueta `sft` y el pipeline `text-generation` indican ajuste supervisado sobre pares instrucción-respuesta, aunque no se detalla el conjunto de datos.
- Razonamiento básico y matemáticas elementales: capacidades propias del modelo base de 0,5 B, sin métricas publicadas para este adaptador.
- Generación de código: posible en el modelo base de la familia Qwen2.5, pero sin evaluación documentada tras el ajuste.
- Tool calling / function calling: no confirmado en la model card; el modelo base Qwen2.5-0.5B-Instruct no incluye plantilla de *tool calling* en su versión de 0,5 B según la documentación pública de Qwen.
- Uso como agente y razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento específico para flujos agénticos.
- Capacidades multilingües: no declaradas para el adaptador; el modelo base soporta 29 idiomas según su documentación.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; el modelo base es exclusivamente de texto.
- Personalización de estilo o persona: el sufijo `john_d_rockefeller` del identificador sugiere un ajuste de estilo o personaje, pero no hay documentación que describa su comportamiento real.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el adaptador se puede cargar sobre Qwen2.5-0.5B-Instruct con `transformers` y `peft` para validar flujos de diálogo en local antes de escalar a modelos mayores, con un coste de cómputo mínimo.
- Experimentación académica en *machine unlearning*: dado el contexto del proyecto (`machine-unlearning-llm`), sirve como artefacto de comparación entre un modelo base y su versión ajustada para medir deriva de comportamiento o pérdida de conocimiento.
- Estudio de adaptadores LoRA: con solo 0,2 GB de repositorio, es un caso práctico para analizar cómo se estructura un adaptador PEFT, qué archivos de configuración incluye y cómo se fusiona con el modelo base.
- Generación de texto en entornos con recursos muy limitados: el modelo fusionado en cuantización de 4 bits ocupa menos de 0,5 GB, por lo que puede ejecutarse en CPU, portátiles sin GPU dedicada o dispositivos embebidos con pocos requisitos.
- Pruebas de personalización de estilo o personaje: si el ajuste realmente codifica una persona concreta, puede emplearse para evaluar hasta qué punto un LoRA de bajo rango modifica el registro lingüístico de un modelo pequeño.
- Docencia y talleres sobre TRL y PEFT: el flujo completo (modelo base + SFT + publicación de adaptador) es reproducible en una GPU de gama media y sirve como ejemplo didáctico de extremo a extremo.
- Evaluación de riesgos de modelos sin documentación: útil como caso de estudio sobre por qué la ausencia de model card, licencia e idiomas declarados bloquea su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye la sección de evaluación completada y no se han encontrado métricas de MMLU, GSM8K, HumanEval ni de ninguna otra prueba en los datos proporcionados. Tampoco se dispone de resultados comparativos frente al modelo base sin ajustar, por lo que no es posible cuantificar el efecto del entrenamiento SFT.

## Requisitos de hardware

- Espacio en disco del adaptador: 0,2 GB (tamaño del repositorio en HuggingFace).
- Pesos del modelo base en fp16: aproximadamente 1 GB, a los que se suman los del adaptador.
- VRAM estimada en fp16 o bf16: en torno a 1,5-2,5 GB incluyendo caché KV para contextos moderados.
- VRAM estimada en cuantización de 4 bits (por ejemplo, Q4_K_M tras fusionar y convertir): menos de 1 GB de pesos.
- GPU compatibles: cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3050, GTX 1650 4 GB, RTX 4060, etc.); también tarjetas profesionales como A100 o H100, aunque muy sobredimensionadas para este tamaño.
- Ejecución sin GPU: viable en CPU con llama.cpp u Ollama tras fusionar el adaptador y convertir los pesos a GGUF.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; `vLLM` y `TGI` admiten adaptadores LoRA, aunque sin garantía para un adaptador sin validar; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (r2warmup sobre Qwen2.5-0.5B-Instruct) | Adaptador LoRA sobre 0,49 B | No declarado (base: 32.768) | No disponible | safetensors (PEFT) | No disponible |
| Qwen2.5-0.5B-Instruct (modelo base) | 0,49 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | No disponible en la informacion proporcionada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | No disponible en la informacion proporcionada |
| SmolLM2-360M-Instruct | 0,36 B | 8.192 tokens | Apache-2.0 | safetensors, GGUF | No disponible en la informacion proporcionada |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache-2.0 | safetensors, GGUF | No disponible en la informacion proporcionada |

La comparación se limita a tamaño, contexto declarado, licencia y formato, ya que no se han publicado métricas de rendimiento para el adaptador ni se dispone de resultados verificables de los alternativas en la información proporcionada. La diferencia clave frente a los demás es que este repositorio no contiene un modelo autónomo, sino un delta de pesos que exige el modelo base para funcionar.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, evaluación, impacto ambiental) aparecen como "[More Information Needed]", lo que impide auditar el modelo.
- Licencia no declarada: la ausencia de licencia explícita en el adaptador bloquea su uso comercial con garantías, aunque el modelo base Qwen2.5-0.5B-Instruct se publique bajo Apache-2.0.
- Sin evaluación: no hay ningún benchmark publicado que permita estimar la calidad del ajuste ni si este degrada capacidades del modelo base.
- Riesgo de alucinación elevado: con 0,49 B de parámetros en el modelo subyacente, la tasa de fabricación de hechos es alta incluso sin ajuste adicional.
- Posible pérdida de conocimiento deliberada: el contexto del proyecto (`machine-unlearning-llm`) sugiere que el entrenamiento puede tener como objetivo borrar información concreta, lo que haría que el modelo fallase en dominios que el base sí cubre.
- Idiomas no declarados: no se puede asumir que el ajuste SFT haya preservado el multilingüismo del modelo base.
- Contexto no revalidado: los 32.768 tokens corresponden al modelo base; no hay evidencia de que el adaptador haya sido entrenado con secuencias largas.
- Metadatos inconsistentes: la fecha de creación (2026-09-24) y el identificador de arXiv (`2608.17804`) son posteriores a la fecha actual, lo que impide verificar la referencia.
- Sin tracción ni validación comunitaria: 0 descargas y 0 *likes*, sin issues ni discusiones que permitan contrastar su comportamiento.
- No apto para producción: sin versión cuantizada, sin pruebas de latencia y sin garantías de licencia, su uso se restringe a experimentación controlada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_0_5b_instruct_john_d_rockefeller
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Referencia de paper citada en las etiquetas: https://arxiv.org/abs/2608.17804
- Ruta local del proyecto de desaprendizaje referenciada en la etiqueta `base_model:adapter`: `/storage/scratch/lv13/lv13594/machine-unlearning-llm/outputs/model/Qwen--Qwen2.5-0.5B-Instruct` (no accesible públicamente)
