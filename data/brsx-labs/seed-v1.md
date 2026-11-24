# brsx-labs/seed-v1

## Resumen

Seed V1 Instruct es un modelo de lenguaje de tipo decoder-only desarrollado por BRSX Labs, derivado de Seed V1 Base mediante ajuste fino supervisado (SFT). Con aproximadamente 100 millones de parametros, se posiciona en la categoria de small language models, un segmento orientado a experimentacion, despliegue en hardware modesto y fine-tuning adicional. Su entrenamiento previo se centro principalmente en contenido de programacion y desarrollo de software, complementado con material de otras tematicas.

El modelo emplea una arquitectura transformer de 12 capas con un tamano oculto de 768 y atencion Grouped-Query (GQA) con 12 cabezas de consulta y 4 de clave/valor, una eleccion que reduce el coste de memoria en la cache KV frente a la atencion multi-cabeza tradicional. La longitud de contexto es de 2.048 tokens y el modelo fue preentrenado sobre 6.000 millones de tokens, seguido de un ajuste fino supervisado con 150.000 ejemplos.

Su relevancia actual reside en su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales, y en su tamano reducido, que facilita la inferencia en CPU y en GPUs de consumo. Esta especializado en ingles y en tareas de generacion de texto e instrucciones, con enfasis declarado en codigo y texto tecnico, lo que lo hace util como banco de pruebas para pipelines de fine-tuning y para prototipos de asistentes tecnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer con Grouped-Query Attention (GQA) |
| Parametros totales | Aproximadamente 100 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no especificado en la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 0,4 GB, libreria transformers; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

Seed V1 Instruct es un transformer decoder-only de 12 capas con `d_model` de 768. La capa de atencion utiliza Grouped-Query Attention con 12 cabezas de consulta y 4 cabezas de clave/valor, lo que reduce el tamano de la cache KV en un factor de 3 respecto a una configuracion multi-cabeza con el mismo numero de cabezas de consulta. El contexto maximo es de 2.048 tokens.

El preentrenamiento del modelo base consumio 6.000 millones de tokens, con una composicion dominada por contenido de programacion y software, complementada con texto de otras tematicas. Sobre esa base se aplico un ajuste fino supervisado (SFT) con 150.000 ejemplos para adaptar el modelo a respuestas de estilo asistente y seguimiento de instrucciones. La model card no especifica hiperparametros de entrenamiento, composicion detallada del dataset, ni si se emplearon tecnicas de RLHF o DPO; tampoco documenta innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles con estilo de asistente tras el ajuste SFT.
- Seguimiento de instrucciones en ingles, orientado a tareas de un solo turno y conversaciones cortas.
- Generacion de codigo y ejemplos de programacion, dado el enfasis del preentrenamiento en contenido software.
- Trabajo con texto tecnico y documentacion de desarrollo.
- Generacion de texto general sobre otras tematicas, aunque con menor especializacion declarada.
- Base para fine-tuning adicional y experimentacion con modelos pequenos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Prototipado de asistentes tecnicos: el modelo puede generar explicaciones y fragmentos de codigo en ingles dentro de una ventana de 2.048 tokens, suficiente para interacciones de un solo turno o conversaciones breves en herramientas internas de desarrollo.
- Generacion de ejemplos de codigo en documentacion: dado su preentrenamiento centrado en programacion, es adecuado para producir snippets ilustrativos y ejemplos de API que luego se revisan manualmente antes de publicarse.
- Banco de pruebas para pipelines de fine-tuning: con 100 millones de parametros y licencia Apache-2.0, sirve para validar flujos de SFT, evaluacion y despliegue antes de escalar a modelos mayores.
- Educacion y experimentacion: util en cursos y laboratorios donde se necesita un modelo pequeno que quepa en hardware de consumo y permita inspeccionar el comportamiento de un transformer entrenado con SFT.
- Clasificacion y transformacion de texto tecnico: puede emplearse para reformatear, resumir o reescribir fragmentos de documentacion y mensajes de error en ingles dentro de herramientas internas.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en CPU o en GPUs de gama baja para demos, pruebas de integracion y servicios de baja concurrencia donde no se justifica un modelo mayor.
- Generacion de texto asistida en editores: integrable como autocompletado o sugerencia de texto tecnico en ingles, con validacion posterior por parte del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se especifican resultados de evaluacion y advierte que los recuentos de parametros y tokens no garantizan rendimiento en ninguna tarea concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los aproximadamente 100 millones de parametros ocupan en torno a 0,4 GB; en fp16, alrededor de 0,2 GB; en cuantizaciones de 8 bits o 4 bits, por debajo de 0,15 GB. Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060 o superiores no presentan limitacion alguna. Tambien es viable en GPUs de datacenter (A100, H100) aunque sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser compatible con la libreria transformers, puede servirse con vLLM, TGI o Text Generation Inference si se convierte a los formatos soportados; para CPU, llama.cpp u Ollama requeririan una conversion a GGUF que no se documenta en el repositorio. El despliegue nativo via transformers es la via directamente soportada.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Seed V1 Instruct | ~100 M | 2.048 | Ingles | Apache-2.0 | Preentrenado con enfasis en codigo; SFT con 150.000 ejemplos |
| GPT-2 small (referencia) | 124 M | 1.024 | Ingles | MIT | Sin ajuste instructivo oficial; base historica de comparacion |
| TinyLlama 1.1B (referencia) | 1.100 M | 2.048 | Ingles | Apache-2.0 | Mayor capacidad pero mayor coste de inferencia |
| Qwen2.5-0.5B Instruct (referencia) | 494 M | 32.768 | Multilingue | Apache-2.0 | Contexto muy superior y soporte multilingue |

No se dispone de datos de benchmarks de Seed V1 Instruct que permitan una comparacion cuantitativa con estas alternativas; la tabla recoge solo diferencias de especificaciones.

## Limitaciones y advertencias

- Modelo pequeno: puede producir respuestas incorrectas, incompletas o inconsistentes, especialmente en razonamiento complejo, matematicas avanzadas y conversaciones largas.
- El codigo generado y las afirmaciones facticas deben verificarse antes de usarse en aplicaciones criticas.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se documentan sesgos especificos, pero al ser un modelo entrenado principalmente con contenido de programacion en ingles, es previsible un sesgo hacia ese dominio y hacia perspectivas presentes en los datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; la model card no reporta mitigaciones especificas.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar la licencia del repositorio y los terminos de los datos de entrenamiento antes de redistribuir el modelo.
- No se documentan formatos de cuantizacion ni pesos GGUF, lo que puede requerir conversion manual para despliegues en CPU con llama.cpp u Ollama.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento estructurado, lo que limita su uso en pipelines agenticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brsx-labs/seed-v1
- Modelo base: https://huggingface.co/brsx-labs/Seed-v1-base
- Demo interactiva: https://seed.brsxlabs.com
- Sitio del desarrollador: https://brsxlabs.com
