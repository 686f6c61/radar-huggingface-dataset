# NikitaLazarev/Qwen3.5-4B-SMS-SoftMoE

## Resumen

Qwen3.5-4B-SMS-SoftMoE es una variante del modelo denso Qwen/Qwen3.5-4B (4.659.865.088 parametros segun los safetensors del repositorio) publicada por el usuario NikitaLazarev. No se trata de un fine-tuning convencional: el autor lo describe como un "experto MoE suave" (soft MoE) obtenido mediante *weight-space steering*, es decir, una modificacion directa de los pesos sin entrenamiento por gradientes. El objetivo es especializar el modelo en un dominio concreto, en este caso seguridad de vuelo y aviacion (corpus ICAO, "СУБП / авиация" en la model card), y enrutar hacia esta variante las consultas de ese dominio.

La tecnica consiste en extraer una direccion de dominio en el espacio de activaciones (diferencia de medias de hidden states entre prompts del dominio y prompts de contraste) e incorporarla a las matrices de salida de un conjunto de capas mediante un parche de rango uno. Segun la model card, se aplica en modo `steer` con alpha = 0.2 sobre las capas 19, 21, 22, 23, 24, 26, 27, 28, 29, 30 y 31, y un router en espacio de embeddings (margen coseno) decide cuando usar esta variante en lugar del modelo base.

Es relevante ahora porque ejemplifica una linea de trabajo emergente (weight-space programming, inspirada en Takeyama et al., MIT CSAIL, 2026) que permite crear especializaciones de dominio sin coste de entrenamiento y desplegables donde los hooks de inferencia no estan disponibles. La contrapartida es que se trata de un experimento piloto con evaluacion limitada: el autor indica que la evaluacion se omitio por falta de GPU suficiente (4 GB) y que no hay datos de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) con parche de steering de rango uno; pipeline image-text-to-text |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no aplica (modelo denso; el termino "soft MoE" se refiere al enrutado entre variantes, no a expertos dispersos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (la model card esta en ruso e ingles; no se declara cobertura linguistica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso multimodal (pipeline image-text-to-text) de aproximadamente 4,66 mil millones de parametros. Sobre esa base no se realiza entrenamiento: el autor aplica *weight-space steering*, una tecnica que modifica directamente los pesos. Primero se ejecuta un escaneo de activaciones con 30 prompts del dominio y 30 de contraste para estimar la direccion de dominio d̂ como la diferencia de medias de los hidden states; despues se inyecta esa direccion como un parche de rango uno en las matrices de salida (down_proj, o_proj, out_proj) de las capas 19, 21, 22, 23, 24, 26, 27, 28, 29, 30 y 31, con intensidad alpha = 0.2.

El autor reporta que el escaneo supera una puerta de calidad con AUC = 1.0 y que el router (basado en embeddings y margen coseno) selecciona correctamente esta variante en el 100 % de los casos de prueba. La evaluacion de calidad se realizo con 10 prompts de dominio y 10 de contraste, y segun la model card la evaluacion completa se omitio por limitaciones de hardware (GPU de 4 GB). No se documentan datos de entrenamiento adicionales, numero de tokens, RLHF/DPO ni innovaciones como decodificacion especulativa. La inspiracion metodologica declarada es Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026), con una extension de la lab Ivanna que invierte la operacion habitual: en lugar de ablacionar un comportamiento, amplifica una direccion de dominio dentro de los pesos.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado en los metadatos).
- Especializacion inducida en dominio de seguridad de vuelo y aviacion (corpus ICAO): el parche de steering desplaza las respuestas hacia terminologia y patrones de ese dominio.
- Enrutado por dominio: un router en espacio de embeddings (margen coseno) decide si se usa esta variante o el modelo base.
- Capacidades de razonamiento, codigo, matematicas y tool calling: no documentadas en la informacion disponible; se heredarian del modelo base en la medida en que el steering no las degrade, algo que no se ha verificado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistencia documental en seguridad aerea: el modelo puede redactar y resumir informes de sucesos basandose en la terminologia del dominio inducida por el steering (СУБП, TO BC, СМК), lo que resulta adecuado para prototipos de consulta sobre normativa ICAO.
- Clasificacion y triaje de narrativas de incidentes: al estar desplazado hacia el vocabulario de seguridad de vuelo, puede etiquetar y priorizar descripciones de sucesos antes de pasarlas a un sistema de gestion de seguridad.
- Generacion de borradores de procedimientos: util para producir primeras versiones de listas de comprobacion o procedimientos tecnicos que luego revisa un especialista humano, aprovechando la direccion de dominio inyectada en las capas altas.
- Enrutado de consultas en un sistema multi-modelo: el router por embeddings permite derivar solo las preguntas de aviacion a esta variante y el resto al Qwen3.5-4B base, reduciendo el coste de especializacion frente a un fine-tuning.
- Investigacion sobre weight-space steering: sirve como caso reproducible para estudiar como un parche de rango uno con alpha = 0.2 altera las respuestas y que capas concentran la senal de dominio.
- Despliegue en entornos con restricciones de hooks: al estar el efecto incorporado en los pesos, funciona en runtimes de inferencia que no permiten interceptar activaciones, a diferencia de las tecnicas basadas en hooks.
- Prototipado multimodal de bajo coste: al conservar el pipeline image-text-to-text del base, puede usarse para experimentos que combinen imagenes tecnicas (por ejemplo, documentacion de aeronaves) con texto del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas del proceso de construccion: AUC del escaneo de dominio = 1.0 y acierto del router del 100 % sobre un conjunto de evaluacion de 10 prompts de dominio y 10 de contraste. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 9,3 GB en safetensors (probablemente bf16/fp16 para 4,66 B de parametros); en bf16 se necesitarian del orden de 10-12 GB de VRAM contando overhead, y en cuantizacion de 8 bits o 4 bits (no publicada en el repo) el requisito bajaria aproximadamente a 5-7 GB y 3-4 GB respectivamente.
- GPU recomendadas: no documentadas por el autor; por tamano, una RTX 4090 (24 GB), A100 o H100 permitirian inferencia en bf16 sin problemas. El autor menciona haber trabajado con una GPU de 4 GB, insuficiente para evaluar el modelo completo.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16, o en 8 GB con cuantizacion (que habria que generar el mismo, ya que no se publican pesos GGUF).
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan documentados ni se proporcionan artefactos para ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-SMS-SoftMoE | 4,66 B | no disponible | Aviacion/seguridad de vuelo via weight steering | no disponible | Hugging Face (0 descargas al consultar) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | Generalista, multimodal | no disponible en esta ficha | Hugging Face |
| Fine-tuning de dominio convencional sobre Qwen3.5-4B | ~4 B | el del base | Depende del dataset | la del base | Requiere entrenamiento propio |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada; la comparativa se limita a parametros, enfoque y disponibilidad.

## Limitaciones y advertencias

- Evaluacion practicamente inexistente: el autor omitio la evaluacion completa por falta de GPU (4 GB) y no publica benchmarks; el AUC = 1.0 y el 100 % del router proceden de conjuntos muy pequenos (30+30 de escaneo, 10+10 de evaluacion), por lo que no son evidencia solida de calidad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del modelo base Qwen3.5-4B condiciona cualquier uso derivado y debe verificarse por separado.
- Riesgo de degradacion colateral: un parche de steering en 11 capas puede alterar respuestas fuera del dominio de aviacion; el enrutado por router mitiga pero no elimina este riesgo si el margen coseno falla.
- Riesgo de alucinacion: igual que el modelo base, y potencialmente agravado en el dominio si el steering empuja al modelo a producir terminologia tecnica con seguridad aparente sin fundamento.
- Idiomas no declarados: la model card esta en ruso e ingles y el dominio se define sobre corpus ICAO; no hay garantia de comportamiento en castellano ni en otros idiomas.
- Contexto no documentado: se desconoce la ventana efectiva, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones no publicadas: no hay GGUF ni pesos de 8/4 bits, lo que limita el despliegue en hardware modesto sin trabajo adicional.
- Proyecto experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento.
- El termino "soft MoE" puede inducir a confusion: no es una arquitectura Mixture-of-Experts con parametros activos dispersos, sino un esquema de enrutado entre variantes de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-4B-SMS-SoftMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ivanna Lab (herramienta citada por el autor): https://github.com/wiskeone/ivanna-lab
- Paper de referencia citado (Weight-Space Programming, Takeyama et al., MIT CSAIL, 2026): no disponible como enlace en la informacion proporcionada.
