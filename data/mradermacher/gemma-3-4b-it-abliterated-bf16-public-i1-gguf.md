# mradermacher/Gemma-3-4b-it-abliterated-bf16-public-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF (formato i1, con imatrix/weighted quants) del modelo **Gemma-3-4b-it-abliterated-bf16-public**, originalmente publicado por el usuario ashwin-sreedhar. Se trata de una versión "abliterated" de Gemma 3 4B Instruct, el modelo instruccional de 4 mil millones de parámetros de Google DeepMind, al que se le ha aplicado un proceso de abliteración (una técnica que neutraliza las direcciones de rechazo en las activaciones del modelo) para eliminar los comportamientos de negación y hacer que el modelo responda a cualquier petición sin filtros de seguridad. La versión cuantizada ha sido generada por mradermacher, un colaborador muy conocido en la comunidad por producir cuantizaciones imatrix de alta calidad de multitud de modelos.

El modelo base, Gemma 3 4B, es un transformer denso multilingüe con ventana de contexto de 128K tokens y capacidades multimodales (texto e imágenes). La variante abliterated conserva esas capacidades pero elimina los rechazos, lo que la hace relevante para usuarios que necesitan control total sobre el comportamiento del modelo en entornos locales, investigación de seguridad o casos de uso donde los filtros corporativos resultan excesivamente restrictivos.

Este repositorio concreto ofrece el modelo en formato GGUF, lo que permite ejecutarlo en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio y herramientas compatibles. Es importante señalar que se trata de un modelo derivado sin filtros, con las implicaciones éticas y legales que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3), multimodal texto+visión |
| Parametros totales | 1.709.078 (dato del repo, aparentemente incorrecto o parcial; el modelo base es Gemma 3 4B, ~4.000 millones de parámetros) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 128K tokens (heredado de Gemma 3 4B; no confirmado en el repo) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_M, IQ2_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible (Gemma 3 soporta oficialmente más de 140 idiomas) |
| Licencia | no disponible en el repo (el modelo base Gemma 3 se distribuye bajo Gemma Terms of Use) |
| Formato de pesos | GGUF (imatrix/weighted quants) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B, un transformer denso de la familia Gemma 3 de Google DeepMind, con arquitectura multimodal que incorpora un codificador de visión (SigLIP) para procesar imágenes junto con texto. Gemma 3 destaca por ampliar la ventana de contexto hasta 128K tokens y por usar atención local e global intercalada para gestionar secuencias largas de forma eficiente. No obstante, este repositorio solo contiene los pesos cuantizados del componente de lenguaje en GGUF; el archivo mmproj (proyector multimodal) no se menciona explícitamente en la model card, por lo que la funcionalidad de visión en las cuantizaciones no está confirmada.

La abliteración se aplica sobre el modelo ya afinado con instrucciones (Gemma-3-4b-it). Esta técnica identifica las direcciones latentes responsables de los rechazos y las anula mediante intervención en las activaciones, sin necesidad de reentrenamiento. El resultado conserva las capacidades lingüísticas del modelo original pero responde a instrucciones que el modelo original rechazaría. Las cuantizaciones de este repo usan imatrix (matriz de importancia) calculada sobre datos de calibración, lo que reduce la pérdida de calidad frente a cuantizaciones ingenuas, especialmente en niveles bajos como IQ2 o IQ3.

## Capacidades

- Generación de texto conversacional multi-turno siguiendo instrucciones (heredado de Gemma-3-4b-it).
- Razonamiento general, redacción, resumen y tareas de procesamiento del lenguaje natural.
- Generación y comprensión de código a nivel competente para su tamaño (4B), aunque por debajo de modelos especializados.
- Capacidades multimodales de visión del modelo base (no confirmada en estas cuantizaciones por ausencia de información sobre mmproj).
- Ausencia de rechazos de seguridad: responde a peticiones que el modelo original filtraría, al haber sido abliterated.
- Soporte multilingüe amplio (la familia Gemma 3 cubre más de 140 idiomas, aunque no está confirmado para esta variante).
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y derivados.
- No hay información sobre soporte nativo de tool calling o function calling en la model card.

## Casos de uso

- **Ejecución local en hardware de consumo:** las cuantizaciones IQ4_XS o Q4_K_M ocupan en torno a 2,5-3 GB, lo que permite ejecutar el modelo en portátiles con 8 GB de RAM o GPUs de 4-6 GB de VRAM mediante llama.cpp u Ollama.
- **Investigación de seguridad y alineación:** al tratarse de una variante abliterated, es útil para estudiar mecanismos de rechazo, evaluar robustez de filtros y analizar comportamiento sin moderación en entornos controlados.
- **Escritura creativa sin restricciones:** autores que usan herramientas locales (SillyTavern, KoboldCpp) para ficción con contenido que los modelos comerciales rechazan pueden aprovechar la ausencia de filtros.
- **Asistente conversacional offline:** con contexto de 128K tokens, puede gestionar conversaciones largas y resumir documentos extensos en local, sin enviar datos a terceros.
- **Prototipado de agentes ligeros:** su pequeño tamaño permite orquestar múltiples instancias en paralelo en una sola GPU para experimentos de agentes multi-step, aunque sin garantías de tool calling nativo.
- **Despliegue en edge y dispositivos embebidos:** las cuantizaciones IQ1_S/IQ2_XXS (por debajo de 1,5 GB) hacen viable su ejecución en dispositivos con recursos muy limitados, aceptando una pérdida de calidad notable.
- **Generación de datos sintéticos sin negaciones:** pipelines que requieren que el modelo no se niegue a tareas legítimas pero sensibles (por ejemplo, análisis de contenido tóxico para moderación) pueden beneficiarse de la variante abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La abliteración y la cuantización pueden degradar el rendimiento respecto a Gemma-3-4b-it original; no hay mediciones comparativas publicadas en este repositorio.

## Requisitos de hardware

- **VRAM/RAM estimada:** varía según la cuantización elegida. Aproximadamente: IQ1_S/IQ1_M ~1-1,3 GB; IQ2_M ~1,5-1,8 GB; Q3_K_M ~2-2,3 GB; Q4_K_M ~2,5-2,8 GB; Q5_K_M ~2,9-3,2 GB; Q6_K ~3,3-3,6 GB (más el contexto y overhead del runtime). Son estimaciones basadas en el tamaño típico de un modelo de 4B, no cifras publicadas en el repo.
- **GPU recomendadas:** cualquier GPU moderna con 4-6 GB de VRAM (RTX 3060, RTX 4060) ejecuta cómodamente las cuantizaciones Q4/Q5 con descarga parcial o total. Para niveles bajos (IQ2/IQ3) basta incluso una GPU de 4 GB o solo CPU.
- **Consumer GPUs:** sí, cabe en prácticamente cualquier GPU de consumo actual; también es plenamente ejecutable en CPU con RAM de 8 GB.
- **Opciones de despliegue:** llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, Jan, GPT4All y cualquier runtime compatible con GGUF.
- **Latencia y throughput:** no disponible; al ser un modelo de 4B cuantizado, se espera generación rápida incluso en CPU moderna (del orden de decenas de tokens/segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Filtros | Licencia |
|---|---|---|---|---|---|
| Gemma-3-4b-it-abliterated (este repo, GGUF) | ~4B | 128K (base) | GGUF imatrix | Sin abliterar rechazos | no disponible (base: Gemma Terms of Use) |
| Gemma-3-4b-it (Google, oficial) | ~4B | 128K | safetensors / GGUF oficial | Con filtros de seguridad | Gemma Terms of Use |
| Llama-3.2-3B-Instruct | ~3B | 128K | safetensors / GGUF | Con filtros | Llama 3.2 Community License |
| Qwen2.5-3B-Instruct | ~3B | 32K | safetensors / GGUF | Con filtros (parcialmente alineado) | Apache 2.0 / Qwen license |

Frente a las alternativas, este modelo ofrece la particularidad de la abliteración y el amplio catálogo de cuantizaciones imatrix de mradermacher, a costa de carecer de garantías de licencia explícitas en el repo y de posibles degradaciones por cuantización extrema.

## Limitaciones y advertencias

- **Modelo sin filtros de seguridad:** al ser abliterated, no rechazará peticiones dañinas. Su uso para generar contenido ilegal, perjudicial o no ético es responsabilidad exclusiva del usuario. No apto para entornos de producción orientados a público general.
- **Riesgo de alucinación:** inherente a cualquier LLM de 4B; la abliteración puede agravarlo al eliminar comportamientos de cautela.
- **Degradación por cuantización:** las cuantizaciones IQ1 e IQ2 sufren pérdidas de calidad significativas; se recomienda Q4_K_M o superior para uso general.
- **Parámetros declarados incoherentes:** el repo indica 1.709.078 parámetros, un dato claramente erróneo o parcial para un modelo de 4B; conviene verificar los archivos reales.
- **Licencia no especificada en el repo:** el modelo base está sujeto a Gemma Terms of Use de Google, que imponen condiciones de uso y restricciones; la variante abliterated hereda esa licencia aunque no se declare explícitamente. Revisar antes de cualquier uso comercial.
- **Capacidad multimodal no confirmada:** no hay información sobre si las cuantizaciones incluyen el proyector de visión (mmproj); la funcionalidad de imágenes podría no estar disponible.
- **Contexto real en GGUF:** ejecutar 128K de contexto en local requiere gestión de memoria KV considerable; en la práctica puede ser necesario limitar el contexto según el hardware.

## Enlaces

- Repositorio del modelo (cuantizaciones GGUF): https://huggingface.co/mradermacher/Gemma-3-4b-it-abliterated-bf16-public-i1-GGUF
- Modelo original abliterated (base de estas cuantizaciones): https://huggingface.co/ashwin-sreedhar/Gemma-3-4b-it-abliterated-bf16-public
- Modelo base oficial: https://huggingface.co/google/gemma-3-4b-it
- Página de la familia Gemma 3: https://huggingface.co/google
- Informe técnico de Gemma 3: no disponible en la informacion proporcionada
