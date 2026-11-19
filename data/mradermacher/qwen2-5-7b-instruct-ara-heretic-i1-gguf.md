# mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF

## Resumen

Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-ARA-heretic, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del conocido Qwen2.5-7B-Instruct de Alibaba, en la que se ha eliminado (o reducido sustancialmente) el comportamiento de rechazo aprendido durante el ajuste fino por alineación. El resultado es un modelo de chat de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) que responde a peticiones que el modelo original rechazaría.

La relevancia de esta ficha radica en dos aspectos. Por un lado, mradermacher es uno de los cuantizadores más prolíficos del ecosistema GGUF y sus publicaciones permiten ejecutar modelos en hardware de consumo mediante llama.cpp y derivados. Por otro, las técnicas de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) producen modelos con un perfil de comportamiento muy distinto al original, lo que exige advertencias claras sobre sesgos, seguridad y uso responsable.

El repositorio ocupa 89,0 GB e incluye un conjunto amplio de cuantizaciones i1 (imatrix) desde IQ1_S hasta Q6_K, además del fichero imatrix para generar cuantizaciones propias. La licencia declarada es Apache 2.0, heredada del modelo base Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para esta variante) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (lista parcial; el repositorio incluye mas) |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 es multilingue, pero esta variante declara solo ingles |
| Licencia | Apache 2.0 (con tags adicionales openrail++ en los metadatos) |
| Formato de pesos | GGUF (cuantizaciones) + fichero imatrix |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención completa, RoPE, normalización RMSNorm y sesgos QKV, entrenado originalmente por Alibaba sobre un corpus multilingüe de gran escala (del orden de billones de tokens, con datos de código, matemáticas y texto general) y posteriormente ajustado con instrucciones y preferencias (SFT y optimización de preferencias). Sobre esa base, richardyoung aplicó una técnica de abliteration que identifica y sustrae la dirección de activación asociada al rechazo, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones.

mradermacher no reentrena el modelo: genera cuantizaciones GGUF con la herramienta de cuantización de llama.cpp usando un fichero imatrix (importance matrix) calculado sobre el propio modelo. El sufijo "i1" indica que las cuantizaciones son de primera generación con imatrix, lo que en la práctica mejora la calidad respecto a las cuantizaciones estáticas a igual tamaño. No se dispone de información sobre el dataset exacto usado para calcular la imatrix ni sobre el proceso concreto de abliteration (capas afectadas, magnitud de la proyección).

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat de Qwen2.5.
- Razonamiento general y respuesta a instrucciones, heredado del ajuste fino de Qwen2.5-7B-Instruct.
- Generación de código y matemáticas a nivel de un modelo de 7B, aunque sin garantías de paridad con el original tras la abliteration.
- Comportamiento "uncensored": responde a peticiones que el modelo alineado rechazaría, lo que incluye contenido sensible o potencialmente dañino.
- Soporte de plantilla de chat de Qwen2.5 (system/user/assistant) a través de llama.cpp y servidores compatibles con la API de OpenAI (tag endpoints_compatible).
- Capacidades multilingües limitadas según la model card (solo se declara inglés), aunque el modelo base es multilingüe.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en esta variante; dichas capacidades dependen del modelo base y no están confirmadas tras la abliteration.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con abliteration y cómo afecta a la calidad general, comparándolo con el Qwen2.5-7B-Instruct original en tareas controladas.
- Red teaming y evaluación de filtros: sirve como generador de prompts y respuestas adversarias para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (4,8 GB) o i1-Q5_K_M (5,5 GB) caben en GPUs de 8-12 GB de VRAM y permiten ejecutar un chat de 7B en local con llama.cpp u Ollama.
- Generación creativa sin restricciones de estilo: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas, donde el modelo alineado introduce negativas no deseadas.
- Experimentación con cuantizaciones imatrix: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y comparar la degradación de calidad entre niveles IQ y Q.
- Fine-tuning posterior sobre la variante abliterated: como punto de partida para ajustes específicos de dominio donde el comportamiento de rechazo del modelo original interfiere con la tarea (por ejemplo, análisis de contenido sensible en investigación social).
- Servicio de inferencia compatible con OpenAI: gracias al tag endpoints_compatible, puede desplegarse tras un servidor llama.cpp con API compatible y sustituir al modelo alineado en prototipos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada según cuantización: i1-IQ1_S ≈ 2,0 GB; i1-IQ2_M ≈ 2,9 GB; i1-IQ3_M ≈ 3,7 GB; i1-IQ4_XS ≈ 4,3 GB; i1-Q4_K_M ≈ 4,8 GB; i1-Q5_K_M ≈ 5,5 GB; i1-Q6_K (tamaño no listado en el extracto, típicamente ≈ 6,2 GB).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. Las cuantizaciones IQ4_XS o Q4_K_M caben incluso en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) con contexto moderado.
- GPU de datacenter: A100, H100 y L40S ejecutan el modelo sin problema, aunque están sobredimensionadas para 7B; su utilidad aquí es el throughput en batch.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores derivados (llama-cpp-python, llama-server con API OpenAI-compatible). vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar los safetensors del modelo base richardyoung/Qwen2.5-7B-Instruct-ARA-heretic.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF | 7,6 B | no disponible | GGUF (multiples quants) | Apache 2.0 | Variante abliterated cuantizada con imatrix |
| richardyoung/Qwen2.5-7B-Instruct-ARA-heretic | 7,6 B | no disponible | safetensors | Apache 2.0 | Modelo origen de la cuantización |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (nativo) | safetensors, GGUF (oficial) | Apache 2.0 | Modelo alineado original, con rechazo activo |
| mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-GGUF | 7,6 B | no disponible | GGUF (quants estaticos) | Apache 2.0 | Misma base, cuantizaciones sin imatrix |

La comparación con otras familias (Llama 3.1 8B Instruct, Mistral 7B Instruct) no está respaldada por datos de benchmark en la información disponible, por lo que no se incluye valoración de rendimiento relativo.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, pero no garantiza la ausencia de contenido dañino ni mejora la veracidad: el riesgo de alucinación sigue siendo el de un 7B y puede aumentar al perderse respuestas de cautela.
- Sesgos: el modelo hereda los sesgos del corpus de entrenamiento de Qwen2.5 y, al desactivar el rechazo, puede expresar estereotipos o contenido ofensivo con mayor facilidad.
- Idiomas: la model card declara solo inglés; el rendimiento en castellano no está verificado y podría degradarse respecto al Qwen2.5 original.
- Contexto: no se confirma la longitud de contexto efectiva de esta variante; conviene validarla empíricamente antes de usarla en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero los metadatos incluyen también el tag openrail++ y el enlace a la licencia del Qwen2.5 original; conviene revisar ambas antes de un despliegue en producción.
- Calidad de cuantización: las cuantizaciones por debajo de IQ3 (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- Uso responsable: no debe desplegarse en aplicaciones orientadas al público sin filtros externos de contenido y sin evaluación previa de seguridad.
- Reproducibilidad: el autor etiqueta el modelo como "reproducible", pero no se documenta la configuración exacta de la imatrix ni el proceso de abliteration, lo que limita la replicación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-GGUF
- Página de resumen de descargas del autor: https://hf.tst.eu/model#Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
