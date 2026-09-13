# 0xA50C1A1/Muse-Glimmer-30B-abliterix

## Resumen

Muse-Glimmer-30B-abliterix es una variante "descencerada" (abliterated) del modelo Muse-Glimmer-30B desarrollado por Meta Superintelligence Lab, publicada por el usuario 0xA50C1A1. Se trata de un modelo causal denso de aproximadamente 29,6 mil millones de parametros que incorpora un encoder de percepcion dedicado de ~1,8B parametros (ViT-G/14), lo que le permite aceptar entradas intercaladas de texto e imagen y producir salida exclusivamente de texto (pipeline image-text-to-text).

El modelo original esta disenado especificamente para tareas agenticas autonomcas ejecutadas en hardware de consumo, sin necesidad de infraestructura en la nube ni acceso a red. Integra razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion ante fallos en un unico modelo. La version abliterix se ha generado aplicando la herramienta Abliterix v1.12.2, que modifica los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj` por capa para reducir la tasa de rechazos (refusals) de 98/100 a 10/100, con una divergencia KL de 0,0094 respecto al modelo original.

La relevancia de esta ficha radica en que combina tres elementos poco frecuentes: capacidades agenticas de largo horizonte, entrada multimodal en un modelo de ~30B y una ventana de contexto de 131.072+ tokens, todo ello con licencia Apache 2.0 y optimizacion declarada para ejecutarse en GPUs de 24 GB o 32 GB mediante cuantizacion a ~4 bits. La fecha de corte de conocimiento declarada es el 4 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B, incluyendo el encoder de vision) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic, K-Quant-17GB (~4 bits); no se confirma disponibilidad de GGUF |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas (lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 6656 |
| Numero de capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] repetido, ventana deslizante de 2048 |
| Cabezas de atencion (Q/KV) | 32 / 2 (GQA con ratio 16:1), dimension de cabeza 128 |
| FFN | SwiGLU, dimension intermedia 19.968 |
| Codificacion posicional | RoPE (theta = 500.000), solo en capas locales |
| Vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Encoder de percepcion | ViT-G/14 de ~1,8B parametros, 50 capas, ancho 1536, patch 14 |
| Tokens visuales maximos por imagen | 4096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Fecha de corte de conocimiento | 4 de enero de 2026 |
| Tamano del repositorio | 59,6 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal denso con atencion agrupada por consultas (GQA) en una proporcion 16:1 y un patron de atencion hibrido local/global que repite la secuencia [Local, Local, Local, Global]. Las capas locales emplean una ventana deslizante de 2048 tokens y son las unicas que aplican RoPE con theta 500.000, mientras que el FFN usa SwiGLU con dimension intermedia de 19.968 y una dimension oculta de 6656 a lo largo de 52 capas. Se incorpora atencion con compuertas (gated attention). A esto se anade un encoder de percepcion ViT-G/14 de aproximadamente 1,8B parametros con 50 capas, ancho 1536 y patch de tamano 14, capaz de procesar hasta 4096 tokens visuales por imagen.

Segun la model card, el modelo se destila a partir de Muse Spark y se ha entrenado con contenido multimodal procedente de datos publicos, datos de terceros e informacion de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. La model card no especifica el numero exacto de tokens de entrenamiento ni detalla si se aplicaron etapas de RLHF o DPO. Entre las innovaciones tecnicas documentadas destacan dos: la decodificacion especulativa mediante un modelo "drafter" ligero basado en DFlash, que predice bloques de 16 tokens en una sola pasada y cuya propuesta verifica el modelo principal en paralelo; y la optimizacion para despliegue local, con compresion a ~4 bits que reduce el modelo por debajo de 20 GB y deja margen para la cache KV, el encoder de percepcion y el drafter dentro de un presupuesto de 24 GB o 32 GB de VRAM.

Sobre la variante abliterix: se ha generado con Abliterix v1.12.2 y emplea un vector de direccion por capa (`vector_index: per layer`). Los parametros de steering reportados son `attn.o_proj.max_weight` 3,69 en la posicion 32,35, `attn.o_proj.min_weight` 0,45 a distancia 30,02, `mlp.down_proj.max_weight` 2,54 en la posicion 40,92 y `mlp.down_proj.min_weight` 1,23 a distancia 12,85. El resultado declarado es una tasa de rechazos de 10/100 frente a 98/100 del modelo original, con una divergencia KL de 0,0094.

## Capacidades

- Generacion de texto y razonamiento multi-paso de largo horizonte, con mantenimiento de planes coherentes en flujos de trabajo extensos.
- Comprension multimodal de entrada: acepta texto e imagenes intercaladas (capturas de pantalla, graficos, documentos) mediante el encoder de percepcion.
- Ejecucion de tareas agenticas de extremo a extremo dentro de scaffolds, incluyendo escritura y depuracion de codigo.
- Uso fiable de herramientas y function calling, con invocacion de herramientas mediante esquemas precisos a lo largo de flujos prolongados.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Compatibilidad con patrones de orquestacion agentica como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable: permite seleccionar distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Decodificacion especulativa integrada mediante el drafter DFlash para acelerar la generacion.
- Modo "uncensored"/abliterated: tasa de rechazos reducida de 98/100 a 10/100 respecto al modelo original.

## Casos de uso

- Agentes autonomos de busqueda profunda: el modelo esta evaluado en DeepSearch QA, por lo que puede planificar y ejecutar busquedas multi-paso, encadenar consultas a herramientas y sintetizar resultados dentro de un contexto de 131.072+ tokens.
- Automatizacion de ingenieria de software: con soporte para SWE-Bench, puede escribir, ejecutar y depurar codigo dentro de un scaffold, integrandose en pipelines de CI/CD mediante tool calling y recuperacion de errores cuando una prueba falla.
- Operacion de agentes sobre protocolos de herramientas: al estar evaluado en MCP-Atlas, encaja en flujos que invocan servidores MCP con esquemas de funciones estrictos a lo largo de cadenas largas de llamadas.
- Interaccion multi-turno con interfaz grafica: gracias al encoder de percepcion y a los 4096 tokens visuales por imagen, puede interpretar capturas de pantalla, formularios y paneles de control para ejecutar tareas de automatizacion de escritorio.
- Analisis de documentos y graficos: puede recibir imagenes de tablas, diagramas o informes junto con texto de acompanamiento y razonar sobre ambos de forma conjunta, util para extraccion y resumen de informes financieros o tecnicos.
- Asistentes conversacionales multilingues: con datos de entrenamiento en mas de 100 idiomas, sirve para atencion al usuario en varios idiomas manteniendo contexto largo de conversacion.
- Despliegue local en estacion de trabajo: al caber en 24 GB o 32 GB de VRAM con cuantizacion K-Quant, es viable como asistente de codigo o agente personal en una estacion con una unica GPU de consumo alta, sin conexion a red.
- Recuperacion autonoma de flujos de trabajo: en orquestaciones del tipo tau3-Bench, el modelo puede retomar tareas multi-turno interrumpidas por respuestas inesperadas de herramientas y completarlas sin intervencion humana.

## Benchmarks y rendimiento

La model card menciona que el modelo ha sido entrenado y evaluado en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no proporciona cifras numericas de ninguno de ellos en la informacion disponible. No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Los unicos datos cuantitativos publicados corresponden a la comparacion entre esta variante abliterada y el modelo original:

| Metrica | Este modelo (abliterix) | Modelo original (Muse-Glimmer-30B) |
|---|---|---|
| Divergencia KL | 0,0094 | 0 (por definicion) |
| Rechazos | 10/100 | 98/100 |

Ademas, la model card del modelo base reporta el impacto de la cuantizacion sobre la precision media agregada de 15 benchmarks comunes:

| Configuracion | Precision completa | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion | - | 0,2% | 1,0% |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

## Requisitos de hardware

- VRAM estimada: 64 GB para precision completa; 32 GB con cuantizacion K-Quant-Dynamic (degradacion declarada del 0,2%); 24 GB con K-Quant-17GB (degradacion declarada del 1,0%).
- Presupuesto de memoria: la model card indica que la cuantizacion a ~4 bits deja el modelo de lenguaje por debajo de 20 GB, dejando margen para la cache KV, el encoder de percepcion y el drafter de decodificacion especulativa dentro de un envelope de 24 GB o 32 GB.
- GPUs recomendadas: no se listan modelos concretos en la informacion disponible. Por presupuesto de VRAM, encajan tarjetas profesionales tipo A100 40/80 GB, H100 o L40S en configuraciones de 24-64 GB, y GPUs de consumo de gama alta con 24 GB o 32 GB para las variantes cuantizadas.
- Cabe en GPU de consumo: si, en las variantes cuantizadas K-Quant-17GB (24 GB) y K-Quant-Dynamic (32 GB), segun los objetivos de hardware declarados por el autor del modelo base.
- Opciones de despliegue: la libreria declarada es transformers con pesos en safetensors y el repositorio esta marcado como `endpoints_compatible`. No se confirma soporte explicito para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. La model card afirma que la decodificacion especulativa con el drafter DFlash (bloques de 16 tokens por pasada) acelera la generacion frente a la decodificacion estandar token a token, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar de forma directa con el modelo base del que deriva esta variante. No se dispone de datos de rendimiento de terceros que permitan una comparacion cuantitativa con otras familias.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterix (este) | ~29,6B (dato real en safetensors: 29.776.626.688) | 131.072+ | Apache 2.0 | HuggingFace, transformers, safetensors | Variante abliterada, rechazos 10/100, KL 0,0094 |
| meta-models/Muse-Glimmer-30B | ~29,6B (incluye encoder de vision) | 131.072+ | Apache 2.0 | HuggingFace | Modelo original con alineacion intacta, rechazos 98/100 |
| Otras alternativas de ~30B con vision y capacidad agentica | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteracion reduce deliberadamente los rechazos, lo que implica que el modelo puede generar contenido que el modelo original bloquearia. Es responsabilidad del desplegador establecer filtros y politicas de uso adecuadas.
- La modificacion de pesos introduce una divergencia respecto al modelo original (KL 0,0094), lo que puede traducirse en degradacion en tareas no medidas por los 15 benchmarks usados por el autor del modelo base.
- No se han publicado resultados numericos de benchmarks para esta variante concreta; la comparacion con el original se limita a divergencia KL y tasa de rechazos.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad en la informacion disponible.
- La model card no especifica la lista completa de idiomas soportados, solo que el entrenamiento cubre mas de 100 idiomas. El rendimiento real por idioma no esta cuantificado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 13 de septiembre de 2026. No hay validacion independiente de la comunidad ni informes de terceros.
- El modelo esta optimizado para despliegue local y tareas agenticas; el autor advierte que busca funcionar sin infraestructura de nube ni acceso a red, lo que limita escenarios que requieran conocimiento posterior al 4 de enero de 2026.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento del modelo base y de la herramienta Abliterix antes de un despliegue en produccion.
- La informacion no aclara si la cuantizacion K-Quant empleada por el autor esta disponible como artefactos publicados o si el usuario debe aplicarla.
- Los enlaces de la busqueda web devuelta no contienen informacion relacionada con el modelo (corresponden a YouTube y a un fabricante de bicicletas), por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xA50C1A1/Muse-Glimmer-30B-abliterix
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio de Abliterix: https://github.com/wuwangzhang1216/abliterix
- Paper del encoder de percepcion (referenciado en la model card): https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificacion especulativa por difusion de bloques): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
