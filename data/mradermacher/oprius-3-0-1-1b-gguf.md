# mradermacher/Oprius-3.0-1.1B-GGUF

## Resumen

Oprius 3.0 1.1B es un modelo de lenguaje conversacional de pequeño tamaño (1,1 mil millones de parámetros) desarrollado por zzzekryo, basado en la arquitectura TinyLlama. El modelo está orientado a conversación general y asistencia de propósito general ("general_help"), entrenado sobre el dataset zzzekryo/conversation-and-web-examples-ForOprius, que combina ejemplos de conversación con texto web.

La ficha que se presenta aquí corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su uso con llama.cpp y derivados. Esta versión incluye cuantizaciones desde Q2_K (0,5 GB) hasta f16 (2,3 GB), además de variantes imatrix disponibles en un repositorio aparte.

Su relevancia radica en la posibilidad de ejecutar un modelo conversacional en hardware muy modesto, incluso sin GPU dedicada, gracias a su tamaño reducido y a la amplia gama de cuantizaciones disponibles. Al estar bajo licencia Apache 2.0, permite uso comercial sin restricciones significativas. No obstante, se trata de un modelo de comunidad con poca documentación pública: no hay model card técnica detallada del modelo base ni benchmarks publicados, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en TinyLlama, según tags del repositorio) |
| Parametros totales | 1.100.048.384 (~1,1B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base está disponible en safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base, zzzekryo/Oprius-3.0-1.1B, se etiqueta con "tinyllama", lo que apunta a una arquitectura transformer derivada de TinyLlama, la familia compacta de 1,1B parámetros que emplea una configuración similar a Llama 2 7B pero reducida (GQA, RoPE y normalización RMSNorm son habituales en esta familia, aunque el repositorio no lo detalla explícitamente). El modelo base está distribuido en safetensors y es compatible con la librería transformers de Hugging Face.

El entrenamiento se realizó sobre el dataset zzzekryo/conversation-and-web-examples-ForOprius, un dataset de autor que mezcla ejemplos conversacionales con texto procedente de la web. No hay información disponible sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre el uso de técnicas de alineación como RLHF o DPO. Tampoco consta el uso de técnicas de inferencia avanzadas como decodificación especulativa o attention lineal.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado para "conversation", "general_conversation" y "general_help", indicando que su foco es el diálogo de propósito general.
- Respuesta a preguntas generales: la etiqueta "general_help" sugiere entrenamiento orientado a asistencia tipo asistente.
- Contenido multilingüe: no disponible; el único idioma declarado es inglés, por lo que su rendimiento en castellano es desconocido y probablemente limitado.
- Tool calling / function calling: no disponible, no hay evidencia de soporte.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Chatbots ligeros en inglés: el modelo puede servir como motor de diálogo en aplicaciones donde el coste computacional prima sobre la calidad, ejecutándose incluso en portátiles sin GPU gracias a cuants de 0,5-0,8 GB.
- Prototipado rápido de agentes conversacionales: su pequeño tamaño permite iterar rápidamente en local con llama.cpp u Ollama antes de escalar a modelos mayores.
- Integración en dispositivos edge: los cuants Q2_K y Q3_K ocupan menos de 1 GB, adecuados para Raspberry Pi, móviles o microservicios con memoria muy limitada.
- Pruebas de infraestructura de inferencia: útil como modelo de carga ligera para testear pipelines de servidores (llama.cpp server, vLLM con soporte GGUF, etc.) sin consumir recursos significativos.
- Asistente embebido en aplicaciones de escritorio: al requerir solo 1-2 GB de RAM en cuants medios, puede integrarse en software local que ofrezca ayuda conversacional sin conexión.
- Experimentación educativa: por su tamaño y licencia permisiva, es adecuado para aprender sobre cuantización GGUF, ajuste de parámetros de inferencia y comparación de niveles de cuant en un entorno de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base no incluye evaluaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar, y la model card del cuantizador solo aporta un gráfico comparativo genérico de perplejidad entre tipos de cuantización (sin datos numéricos específicos de este modelo).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K) y 2,3 GB (f16) solo de pesos; añadiendo contexto y overhead, se recomienda disponer de 1-4 GB de memoria según el cuant elegido.
- GPU recomendadas: no es necesario usar GPU. Si se desea aceleración, cualquier GPU con 2-4 GB de VRAM basta (por ejemplo, GTX 1650, RTX 3050 o superiores).
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU moderna; también funciona por CPU pura en equipos con 4 GB de RAM o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. El modelo base en safetensors funciona con transformers de Hugging Face.
- Latencia y throughput: no disponibles como datos oficiales; por su tamaño de 1,1B parámetros, es esperable una generación fluida incluso en CPU (decenas de tokens por segundo en CPUs de escritorio recientes), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Oprius 3.0 1.1B | 1,1B | no disponible | Apache 2.0 | Conversación general en inglés, poca documentación |
| TinyLlama 1.1B Chat | 1,1B | 2.048 tokens | Apache 2.0 | Base arquitectónica aparente; bien documentado y amplio soporte |
| Qwen2.5 1.5B Instruct | 1,5B | 32.768 tokens (128K con YaRN) | Apache 2.0 | Multilingüe (29+ idiomas), benchmarks publicados, tool calling |
| Llama 3.2 1B Instruct | 1,24B | 131.072 tokens | Licencia Llama 3.2 | Fuerte soporte de Meta, multilingüe (8 idiomas), benchmarks publicados |

La comparativa sugiere que Oprius 3.0 1.1B compite en la categoría de modelos compactos conversacionales, pero frente a alternativas consolidadas ofrece menos contexto documentado, sin benchmarks públicos y con soporte limitado al inglés.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con datos web y de conversación sin detalles públicos, deben asumirse sesgos típicos de datos de internet sin filtrar.
- Riesgo de alucinación: elevado, como es habitual en modelos de ~1B parámetros, especialmente en preguntas fácticas y razonamiento; no hay estudios de evaluación que cuantifiquen este riesgo.
- Limitaciones de idioma: el modelo declara únicamente soporte de inglés; su comportamiento en castellano es desconocido y probablemente deficiente.
- Longitud de contexto: no publicada, lo que impide planificar cargas con documentos largos; verificar empíricamente antes de usar en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la procedencia del dataset de entrenamiento, cuya licencia y composición no están documentadas.
- Procedencia poco verificable: el modelo base carece de model card técnica detallada y de benchmarks, por lo que se recomienda evaluación interna exhaustiva antes de cualquier despliegue serio.
- Calidad según cuantización: los cuants Q2_K y Q3_K degradan notablemente la calidad; se recomiendan Q4_K_M o superiores para uso real.

## Enlaces

- Repositorio cuantizado (GGUF estáticos): https://huggingface.co/mradermacher/Oprius-3.0-1.1B-GGUF
- Repositorio cuantizado (GGUF imatrix/weighted): https://huggingface.co/mradermacher/Oprius-3.0-1.1B-i1-GGUF
- Modelo base: https://huggingface.co/zzzekryo/Oprius-3.0-1.1B
- Dataset de entrenamiento: https://huggingface.co/datasets/zzzekryo/conversation-and-web-examples-ForOprius
- Página de descargas resumida (mradermacher): https://hf.tst.eu/model#Oprius-3.0-1.1B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
