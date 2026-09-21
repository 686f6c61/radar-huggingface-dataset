# gijl/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parametros (27.854.794.240 parametros reales en los safetensors del repositorio derivado) desarrollado por Meta Superintelligence Lab y publicado, segun su model card, en agosto de 2026 bajo licencia Apache 2.0. Se trata de un modelo multimodal de entrada (texto e imagen) y salida de texto, con un encoder de percepcion dedicado de unos 1,8 mil millones de parametros (ViT-G/14), disenado especificamente para tareas agenticas autonomas que deben ejecutarse en hardware de consumo, sin depender de infraestructura en la nube ni de acceso a red.

El repositorio analizado, `gijl/Muse-Glimmer-30B-GGUF`, es una redistribucion en formato GGUF del modelo base `meta-models/Muse-Glimmer-30B`, generada con las cuantizaciones Unsloth Dynamic 2.0 y orientada a su ejecucion local mediante llama.cpp, Ollama o Unsloth. El modelo declara una ventana de contexto de 131.072 tokens o mas, patron de atencion hibrido local/global con ventana deslizante de 2.048 tokens, atencion con puerta (gated attention) y GQA con ratio 16:1.

Su relevancia actual radica en la combinacion de tres factores poco frecuentes en un mismo modelo: capacidades agenticas completas (uso fiable de herramientas, razonamiento multi-paso, recuperacion ante fallos), percepcion visual integrada y un diseno explicitamente optimizado para caber en GPUs de 24 GB o 32 GB mediante cuantizacion a 4 bits con degradacion declarada de entre el 0,2 % y el 1,0 % en tareas agenticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14); patron de atencion [Local, Local, Local, Global] repetido |
| Parametros totales | 27.854.794.240 segun safetensors del repo GGUF; la model card declara ~29,6B incluyendo el encoder de vision (encoder ~1,8B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 2.0: FP completa (64 GB VRAM), K-Quant-Dynamic (32 GB VRAM, 0,2 % de degradacion declarada), K-Quant-17GB (24 GB VRAM, 1,0 % de degradacion declarada) |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas segun la model card; la ficha de HuggingFace no publica listado concreto |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio analizado); origen en safetensors (modelo base) |

Datos adicionales de arquitectura: dimension oculta 6.656, 52 capas, ventana deslizante 2.048, cabezas de atencion 32 Q / 2 KV (GQA 16:1), dimension de cabeza 128, FFN SwiGLU con dimension intermedia 19.968, RoPE con theta 500.000 aplicado solo en capas locales. Vocabulario de 202.048 entradas (200.000 tokens BPE + 2.048 tokens especiales). Maximo de 4.096 tokens visuales por imagen. Fecha de corte de conocimiento: 4 de enero de 2026.

## Arquitectura y entrenamiento

Muse Glimmer 30B es un transformer causal denso con una innovacion estructural concreta: la capa de atencion alterna tres capas de atencion local (ventana deslizante de 2.048 tokens) por cada capa de atencion global, siguiendo el patron [Local, Local, Local, Global]. Esta combinacion reduce el coste computacional y de memoria de la KV cache en secuencias largas, algo critico para un modelo que se pretende ejecutar en 24-32 GB de VRAM con contexto de 131.072 tokens. Ademas incorpora atencion con puerta (gated attention) y solo aplica RoPE (theta 500.000) en las capas locales. El componente de vision es un encoder ViT-G/14 de ~1,8B parametros, 50 capas, anchura 1.536 y patch de 14, referenciado en el paper arXiv:2504.13181, que permite intercalar texto e imagenes en la entrada.

El modelo se describe como destilado de Muse Spark y entrenado con contenido multimodal procedente de datos publicos, datos de terceros y datos de productos y servicios de Meta, curados y enriquecidos por redes de proveedores externos y personal de Meta. La model card no especifica el numero de tokens de entrenamiento ni detalla si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento. Entre las capacidades declaradas destacan el ajuste de esfuerzo de razonamiento ("controllable effort"), lo que permite seleccionar el equilibrio entre calidad y velocidad, y la compatibilidad con andamiajes de agentes como OpenClaw o Hermes Agent. El repositorio GGUF de Unsloth permite activar o desactivar el modo de pensamiento (thinking) desde la interfaz.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extensos.
- Uso fiable de herramientas y function calling: invocacion de funciones con esquemas precisos a lo largo de flujos prolongados. La documentacion de Unsloth muestra ejecuciones de mas de 100 llamadas a herramientas con la cuantizacion de 2 bits.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Comprension multimodal: acepta texto e imagenes intercalados mediante el encoder de percepcion, lo que permite interpretar capturas de pantalla, graficos y documentos junto a la conversacion.
- Completado de tareas agenticas de extremo a extremo, con evaluacion declarada en DeepSearch QA, MCP-Atlas, τ³-Bench y SWE-Bench.
- Razonamiento sobre codigo y depuracion dentro de andamiajes de agentes.
- Capacidades multilingues: entrenado con datos de mas de 100 idiomas.
- Ajuste de esfuerzo de razonamiento (distintos niveles de "thinking") para equilibrar calidad y latencia.
- Compatibilidad con patrones de orquestacion agentica como OpenClaw y Hermes Agent.
- No se declaran capacidades de audio ni de generacion de imagenes: la salida es unicamente texto.

## Casos de uso

- Agentes autonomos de automatizacion de escritorio: el modelo puede interpretar capturas de pantalla mediante el encoder de percepcion y encadenar llamadas a herramientas durante cientos de pasos, lo que lo hace adecuado para flujos de trabajo tipo RPA moderno ejecutados en local.
- Atencion al cliente multi-turno con contexto largo: con 131.072 tokens de ventana puede mantener el historial completo de una conversacion extensa junto a documentacion adjunta sin truncar informacion.
- Depuracion y resolucion de incidencias de codigo: su evaluacion declarada en SWE-Bench apunta a uso dentro de andamiajes que leen repositorios, ejecutan pruebas y aplican parches de forma iterativa.
- Analisis de documentos y graficos: al aceptar imagenes intercaladas con texto, puede procesar informes escaneados, diagramas y tablas donde el OCR tradicional pierde estructura.
- Asistentes locales con requisitos de privacidad: al ejecutarse sin acceso a red en GPUs de 24-32 GB, permite desplegar agentes sobre datos sensibles en equipos controlados por la organizacion.
- Pipelines de agentes con herramientas empresariales: su soporte de function calling con esquemas estrictos facilita la integracion con APIs internas, bases de datos y sistemas de tickets.
- Investigacion en agentes: la posibilidad de ajustar el esfuerzo de razonamiento lo convierte en una plataforma util para comparar estrategias de planificacion y recuperacion de errores con distinto presupuesto de computo.
- Busqueda profunda y sintesis de informacion (DeepSearch): combinado con herramientas de recuperacion, puede planificar consultas sucesivas y consolidar hallazgos con trazabilidad de las fuentes.

## Benchmarks y rendimiento

La model card menciona que el modelo se entrena y evalua en DeepSearch QA, MCP-Atlas, τ³-Bench y SWE-Bench, pero no publica cifras concretas en la informacion disponible. Tampoco se han facilitado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en el repositorio analizado.

| Benchmark | Muse Glimmer 30B | Comparativas |
|---|---|---|
| DeepSearch QA | No disponible (sin cifra) | No disponible |
| MCP-Atlas | No disponible (sin cifra) | No disponible |
| τ³-Bench | No disponible (sin cifra) | No disponible |
| SWE-Bench | No disponible (sin cifra) | No disponible |

Unico dato cuantitativo declarado: el impacto de la cuantizacion sobre tareas agenticas, medido como porcentaje de degradacion respecto a precision completa.

| Variante | Precision completa | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion declarada | - | 0,2 % | 1,0 % |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

## Requisitos de hardware

- Precision completa: ~64 GB de VRAM (estimacion declarada por el fabricante). Requiere GPU de clase profesional como A100 80 GB o H100 80 GB, o multiples GPUs.
- K-Quant-Dynamic (Unsloth Dynamic 2.0): entorno objetivo de 32 GB de VRAM, suficiente para pesos (~menos de 20 GB para el modelo de lenguaje), KV cache, encoder de percepcion y drafter de decodificacion especulativa. Encaja en RTX 5090 (32 GB), V100 32 GB, A100 40 GB o A6000 48 GB.
- K-Quant-17GB: entorno objetivo de 24 GB de VRAM. Cabe en RTX 4090, RTX 3090, L4 (24 GB) o A10G 24 GB.
- Cuantizaciones de 2 bits: citadas en la documentacion de Unsloth como capaces de ejecutar mas de 100 llamadas a herramientas; no se especifica VRAM minima en la informacion disponible.
- Tamano del repositorio: 317,0 GB, ya que agrupa todos los niveles de cuantizacion; solo hay que descargar el archivo GGUF concreto que se vaya a usar.
- Opciones de despliegue: llama.cpp, Ollama y Unsloth para los pesos GGUF; transformers para el modelo base en safetensors. No se confirma en la informacion disponible soporte especifico de vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles. La model card solo indica que el diseno busca velocidades practicas en hardware de consumo y que se usa un drafter de decodificacion especulativa, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Muse Glimmer 30B | ~29,6B (27,85B en safetensors) | 131.072+ | Apache 2.0 | Entrada texto + imagen | Si (Unsloth Dynamic 2.0) |
| Gemma 3 27B | 27B | 128.000 | Licencia Gemma (no Apache) | Entrada texto + imagen | Si, en el ecosistema de llama.cpp |
| Qwen2.5-VL-32B | 32B | 128.000 | Apache 2.0 | Entrada texto + imagen | Si, en el ecosistema de llama.cpp |
| Mistral Small 3.1 24B | 24B | 128.000 | Apache 2.0 | Entrada texto + imagen | Si, en el ecosistema de llama.cpp |

No se dispone de resultados de benchmarks comparativos verificados en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y modalidad. Los datos de los modelos alternativos proceden de sus especificaciones publicas conocidas y no de la busqueda realizada, que no devolvio resultados tecnicos relevantes.

## Limitaciones y advertencias

- No se han publicado cifras de benchmarks en la informacion disponible: es imposible verificar de forma independiente el rendimiento real en DeepSearch QA, MCP-Atlas, τ³-Bench o SWE-Bench.
- Riesgo de alucinacion: no se documentan en la model card medidas especificas de mitigacion, tasas de alucinacion ni evaluaciones de veracidad.
- Sesgos: no se detallan analisis de sesgo, composicion del dataset ni auditorias de equidad. El entrenamiento incluye datos de productos y servicios de Meta, lo que puede introducir sesgos de dominio no declarados.
- Soporte de idiomas: aunque se afirma entrenamiento en mas de 100 idiomas, no se especifica la lista ni la calidad relativa por idioma; el rendimiento en castellano no esta cuantificado.
- Multimodalidad asimetrica: solo acepta imagenes como entrada; no genera imagenes ni procesa audio.
- Fecha de corte de conocimiento: 4 de enero de 2026, por lo que no conoce eventos posteriores.
- Datos inconsistentes entre fuentes: la model card declara ~29,6B parametros incluyendo el encoder de vision, mientras que los safetensors del repo GGUF suman 27.854.794.240 parametros; conviene verificar la cifra exacta antes de dimensionar hardware.
- El repositorio GGUF analizado tiene 0 likes y 1.340 descargas, y fue creado el 21 de septiembre de 2026: es una redistribucion de terceros, no una publicacion oficial de Meta, por lo que la integridad de las cuantizaciones debe validarse antes de usarlas en produccion.
- Entorno de ejecucion: se declara que funciona sin acceso a red, pero las tareas agenticas que dependan de herramientas externas requeriran conectividad y las correspondientes salvaguardas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de una evaluacion de seguridad publicada traslada al integrador la responsabilidad de las salvaguardas.
- No hay informacion sobre latencia, throughput ni coste energetico real en el hardware objetivo.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/gijl/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guia de ejecucion de Muse Glimmer (Unsloth): https://unsloth.ai/docs/models/muse-glimmer
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Paper del encoder de percepcion (arXiv:2504.13181): https://arxiv.org/abs/2504.13181
- Referencia arXiv citada en los tags del repositorio (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
