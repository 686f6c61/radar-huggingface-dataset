# Luni/Nanbeige-4.3-33B-Heretic

## Resumen

Nanbeige-4.3-33B-Heretic es un ajuste comunitario de [Nanbeige/Nanbeige4.3-33B](https://huggingface.co/Nanbeige/Nanbeige4.3-33B), publicado por el usuario Luni en HuggingFace. Se trata de los pesos BF16 del modelo original de Nanbeige Team (33.118.977.024 parametros) sometidos a un proceso de "abliteracion direccional" con la herramienta Heretic, que elimina los vectores de rechazo (refusals) y el tono moralizante del alineamiento, manteniendo intacta la capacidad de razonamiento. Ademas, el autor aplica un "anti-slop" (de-slop) para reducir los patrones de lenguaje repetitivos tipicos de los modelos alineados, y corrige un bug de doble token BOS en el tokenizer.

El modelo base es un LM causal denso de 52 capas con atencion completa (full attention) y una ventana de contexto nativa de 262.144 tokens, con razonamiento chain-of-thought nativo mediante etiquetas `<think>`. Su relevancia actual radica en que ofrece, bajo licencia Apache-2.0, un modelo de razonamiento sin restricciones de rechazo, util para investigacion de alineamiento, red teaming y casos de uso donde los refusals estorban. El repo principal pesa 66,3 GB en safetensors BF16, y el autor publica suites de cuantizacion EXL3 y GGUF derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM causal denso tipo Llama, 52 capas, full attention |
| Parametros totales | 33.118.977.024 (~33,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (repo principal); EXL3 2,25-5,00 bpw y GGUF IQ1_S-Q8_0 en repos derivados del mismo autor |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF y EXL3 en repos derivados |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de 52 capas con mecanismo de atencion completa (sin sliding window ni hibridos SSM), etiquetado como arquitectura tipo `llama` en HuggingFace. Incorpora razonamiento chain-of-thought nativo mediante tokens especiales `<think>`, lo que permite al modelo desplegar un proceso de deliberacion interno antes de emitir la respuesta final. La ventana de contexto nativa de 262.144 tokens lo situa en el rango de contextos extra largos.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no hay datos publicados en la informacion disponible. Lo que si documenta la model card es el post-procesado aplicado por Luni: abliteracion direccional con Heretic (Trial #40, seleccionado como ganador Pareto, con una reduccion del 65,4 % en la tasa de refusals) conservando el 100 % de la profundidad de razonamiento matematico, algoritmico y analitico segun el autor; de-slop para eliminar patrones verbales repetitivos; y un parche en `tokenizer_config.json` (`"add_bos_token": false`) que corrige la emision duplicada del token BOS `<|im_start|>` al aplicar chat templates.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con estilo de-slopped (menos relleno y frases hechas).
- Razonamiento chain-of-thought nativo mediante el circuito interno `<think>`, que permanece operativo tras la abliteracion.
- Razonamiento matematico, algoritmico y analitico, que el autor declara preservado al 100 % tras el proceso Heretic.
- Sin refusals: el modelo no emite rechazos de seguridad ni sermones morales (uncensored).
- Contexto de 262.144 tokens para documentos y conversaciones muy largas.
- Compatibilidad con la libreria `transformers` y con los formatos de inferencia EXL3 y GGUF (llama.cpp, TabbyAPI, etc.).
- No hay informacion sobre soporte nativo de tool calling, vision ni audio en la informacion disponible.

## Casos de uso

- Escritura tecnica sin censura: generacion de documentacion y analisis profundos (por ejemplo, el propio ejemplo de la model card sobre colas lock-free en C++20) donde el modelo puede abordar temas sensibles sin interrumpir con refusals.
- Investigacion en alineamiento y seguridad: al ser una version abliterada con reduccion documentada del 65,4 % en refusals, sirve como sujeto de estudio para red teaming y evaluacion de robustez de alineamientos.
- Asistente de programacion local: con 262k de contexto puede ingerir repos o ficheros grandes completos y razonar sobre ellos paso a paso con `<think>`.
- Procesamiento de documentos extensos: analisis, resumen y consulta sobre contratos, informes o corpus academicos de hasta 262.144 tokens en una sola pasada.
- Roleplay y escritura creativa: la combinacion de de-slop y ausencia de sermones morales lo hace adecuado para narrativa interactiva de larga duracion en local.
- Despliegue en entornos locales privados: las suites GGUF (hasta IQ1_S) y EXL3 permiten ajustar el compromiso calidad/VRAM para estaciones de trabajo sin salida a la nube, util para datos sensibles.
- Experimentacion con razonamiento en chino e ingles: el soporte bilingue permite comparar el comportamiento del circuito `<think>` entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma cualitativamente que se preserva el 100 % de la profundidad de razonamiento matematico, algoritmico y analitico tras la abliteracion, sin aportar numeros verificables.

## Requisitos de hardware

- BF16 (repo principal): ~66,3 GB de pesos, lo que exige aproximadamente 70 GB de VRAM o memoria unificada; dos RTX 3090/4090 (48 GB combinados) no bastan, se requiere al menos un A100/H100 de 80 GB, 2x A6000 (96 GB) o Mac Studio con 96 GB+ de memoria unificada.
- Con cuantizaciones derivadas: la suite EXL3 a 4,00 bpw ronda los ~17-18 GB (cabe en una RTX 4090 de 24 GB con contexto moderado); a 5,00 bpw ~21-22 GB; las variantes SC de 2,25-3,50 bpw bajan de ~10 a ~15 GB, viables en RTX 3090/4090 y 5080/5090.
- GGUF: los formatos Q8_0 requieren ~35 GB (2x 24 GB o 48 GB de RAM+offload), mientras que IQ2/IQ1_S pueden funcionar en 8-16 GB de RAM con CPU o GPU modesta, a costa notable de calidad.
- Despliegue soportado: `transformers` (codigo de ejemplo incluido), llama.cpp y Ollama via GGUF, TabbyAPI/ExLlamaV2 via EXL3, y HuggingFace Inference Endpoints (tag `text-generation-inference`).
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic | 33,1B (denso) | 262.144 | Apache-2.0 | Abliterado + de-slop, `<think>` nativo |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B (denso) | 262.144 | Apache-2.0 | Version original con alineamiento estandar |
| Qwen3-32B | 32,8B (denso) | ~131.072 | Apache-2.0 | Razonamiento hibrido thinking/non-thinking, multilingue amplio |

Nota: los datos de Qwen3-32B son de caracter general y no provienen de la busqueda web proporcionada (que no arrojó resultados relevantes para este modelo); verificalos antes de tomar decisiones.

## Limitaciones y advertencias

- Modelo deliberadamente uncensored: no emite refusals ni salvaguardas de seguridad. Su uso con prompts peligrosos puede generar contenido daniño; no es adecuado para entornos de produccion expuestos a usuarios finales sin capas de moderacion externas.
- La afirmacion de "100 % de razonamiento preservado" procede del autor del merge y no esta verificada con benchmarks independientes; la abliteracion puede degradar sutilmente otras capacidades.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion tipico de LLM, agravado por la ausencia de mecanismos de rechazo que al menos senalen contenido problematico.
- El doble BOS fix esta aplicado en este repo; si se usan los pesos base o repos derivados, verificar que incluyen el parche para evitar degradacion silenciosa en la generacion.
- Licencia Apache-2.0 sin restricciones comerciales, pero el modelo hereda los terminos del base model y de Heretic; revisar los avisos de uso de Nanbeige Team.
- Repositorio comunitario con pocas descargas (601) y 2 likes: escaso historial de validacion por la comunidad.

## Enlaces

- Modelo: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Suite EXL3 stock: https://huggingface.co/Luni/Nanbeige-4.3-33B-EXL3
- Suite EXL3 Heretic: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3
- EXL3-SC dedicado: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC
- Suite GGUF: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GGUF
