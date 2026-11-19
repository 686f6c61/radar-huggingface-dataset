# ricursiveAI/Ripple-65B-Preview-NVFP4

## Resumen

Ripple-65B Preview NVFP4 es la versión cuantizada del checkpoint instruction-tuned de Ripple-65B Preview, un modelo Transformer denso de 65.000 millones de parámetros desarrollado por Ricursive Intelligence. El modelo se ha preentrenado sobre 12 billones de tokens y declara soporte para longitudes de contexto de hasta 1 millón de tokens, aunque la configuración de despliegue incluida en el repositorio limita la ventana a 131.072 tokens. Esta variante concreta aplica cuantización NVFP4 a las capas MLP manteniendo la atención en BF16, lo que reduce el peso del repositorio a 101 GB frente al checkpoint BF16 completo.

El interés del modelo reside en su enfoque hacia tareas de codificación agéntica: el autor reporta 80,52 en TerminalBench 2.1 para la versión BF16 y 76,0 para esta NVFP4, además de 76,5 en SWE-bench Verified y 61,06 en SWE-bench Pro v1.0. Con 65B parámetros densos, compite en la misma franja de rendimiento que modelos MoE mucho mayores (entre 500B y 975B parámetros totales) en varios benchmarks de agente y código, lo que lo convierte en una opción relevante para despliegues con restricciones de memoria.

La relevancia inmediata está en su empaquetado para hardware de consumo profesional: el repositorio incluye scripts para servir el modelo en una única DGX Spark (GB10, 128 GB de memoria unificada) mediante SGLang 0.5.19 sin modificaciones, con decodificación especulativa por árbol y una tasa reportada de aproximadamente 19,5 tok/s por petición y 48 tok/s agregados con cuatro peticiones concurrentes. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (dense), con decodificación especulativa por árbol en la configuración de inferencia incluida |
| Parametros totales | 65B según model card; 39.616.865.360 parámetros reales en los safetensors del repositorio (dato no coherente con la denominación comercial) |
| Parametros activos | No aplica (modelo denso); la model card indica 65B activos |
| Longitud de contexto | Hasta 1M tokens declarados; 131.072 tokens en la configuración de despliegue incluida (entrada máxima 131.065) |
| Tipos de cuantizacion | NVFP4 en capas MLP, atención en BF16; existe checkpoint BF16 separado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, modelopt, custom_code) |

## Arquitectura y entrenamiento

Ripple-65B Preview es un Transformer denso de 65B parámetros preentrenado sobre 12 billones de tokens. A diferencia de los modelos comparables citados en la model card (Nemotron 3 Ultra 550B, Inkling 975B, Muse Spark Open 816B y Reflection Beam 501B), que emplean arquitecturas MoE con entre 23B y 55B parámetros activos, Ripple mantiene activos los 65B parámetros en cada paso de inferencia. No se detalla en la información disponible la composición del dataset de preentrenamiento, el uso de RLHF o DPO, ni innovaciones de atención más allá de la ventana de contexto declarada.

La variante NVFP4 aplica una cuantización conservadora: las capas MLP se almacenan en FP4 de NVIDIA mientras la atención permanece en BF16, lo que preserva la calidad en los mecanismos de atención a costa de un ahorro de memoria parcial. El repositorio incluye un draft model separado (Ripple-65B-Preview-DFlash2) para decodificación especulativa y kernels Triton deterministas para atención. La configuración por defecto usa decodificación especulativa por árbol con 32 nodos de verificación a partir de un draft de 16 tokens, marcada como experimental; existe una alternativa de especulación en cadena con kernels estándar de SGLang.

## Capacidades

- Generación de texto y razonamiento general, con resultados declarados de 89,2 en MMLU y 83,7 en MMLU-Pro para esta variante NVFP4.
- Razonamiento matemático de competición: 97,1 en AIME 2024, 97,9 en AIME 2025, 95,8 en AIME 2026 y 89,4 en HMMT Feb 2026.
- Codificación y tareas agénticas de terminal: 76,0 en Terminal-Bench 2.1, 76,5 en SWE-bench Verified, 61,06 en SWE-bench Pro v1.0 y 77,8 en SWE-bench Pro v2.0 Hard.
- Soporte de tool calling y function calling, expuesto a través del servidor compatible con OpenAI de SGLang incluido en el repositorio.
- Soporte de razonamiento multi-paso y agentes, con benchmarks específicos como MCP Atlas (73,27), AutomationBench (36,3) y τ³-bench banking (29,90).
- Modo de razonamiento explícito mediante el campo `reasoning_content` en la API compatible con OpenAI.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Automatización de tareas de terminal y línea de comandos: el modelo puede operar sobre entornos shell para resolver tareas de varios pasos, respaldado por sus resultados en Terminal-Bench 2.1 y SWE-bench Pro v2.0 Hard, adecuado para pipelines de agentes de CI/CD que necesiten ejecutar y verificar comandos.
- Resolución de issues en repositorios de código: con 76,5 en SWE-bench Verified, puede integrarse en flujos de trabajo que reciban un issue, localicen los ficheros relevantes y propongan un parche verificable mediante tests.
- Asistentes de programación con contexto largo: la ventana de 131.072 tokens en la configuración incluida permite cargar repositorios medianos o múltiples ficheros y mantener conversaciones multi-turno con caché de prefijo activada.
- Agentes con tool calling en producción: el servidor SGLang incluido expone una API compatible con OpenAI con soporte de streaming, tool calls y `reasoning_content`, lo que facilita la integración en orquestadores de agentes existentes.
- Razonamiento matemático y científico asistido: los resultados en AIME y HMMT lo hacen adecuado para tutoría avanzada, verificación de demostraciones o generación de problemas con solución, aunque requiere validación humana por riesgo de alucinación.
- Despliegue en hardware de borde profesional: el empaquetado para DGX Spark con 128 GB de memoria unificada permite ejecutar el modelo en una única máquina de sobremesa de gama alta, útil para prototipado local de agentes sin depender de clústeres GPU.
- Evaluación de seguridad y robustez: los benchmarks FORTRESS (83,2 adversarial, 95,5 benign) y StrongREJECT (95,9) permiten usar el modelo en estudios comparativos de alineación y rechazo de peticiones dañinas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (NVFP4 frente a BF16 y modelos comparables):

| Benchmark | Ripple NVFP4 | Ripple BF16 | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|---|
| MMLU | 89,2 | 89,6 | 92,0 | 91,3 | 92,6 | 92,4 |
| MMLU-Pro | 83,7 | 84,2 | 86,8 | 87,3 | 87,9 | 76,5 |
| GPQA Diamond | 83,3 | 85,2 | 87,0 | 87,2 | 89,0 | 90,6 |
| AIME 2024 | 97,1 | 97,1 | 94,2 | 97,5 | 97,9 | 96,7 |
| AIME 2025 | 97,9 | 98,3 | 94,2 | 91,7 | 100,0 | 99,6 |
| AIME 2026 | 95,8 | 95,0 | 95,4 | 97,1 | 98,3 | 97,7 |
| HMMT Feb 2026 | 89,4 | 90,5 | 80,3 | 86,3 | 93,9 | 93,9 |
| Terminal-Bench 2.1 (self-reported) | 76,0 | 80,5 | 56,4 | 63,8 | 76,4 | 80,1 |
| Terminal-Bench 2.1 (Terminus 2) | 76,0 | 80,5 | 55,1 | 56,2 | 78,7 | 70,8 |
| SWE-bench Verified | 76,5 | 76,5 | 71,9 | 77,6 | 78,7 | 81,6 |
| SWE-bench Pro v1.0 | 61,06 | 61,42 | 46,9 | 54,3 | 58,2 | 66,1 |
| SWE-bench Pro v2.0 Hard | 77,8 | 79,1 | 30,7 | 39,6 | 72,4 | 76,5 |
| DeepSWE 1.1 | 40,3 | 44,3 | 0,2 | 1,8 | 60,0 | 43,3 |
| SciCode (Inspect AI) | 39,5 | 39,4 | 44,6 | 46,1 | 58,5 | 49,2 |
| τ³-bench banking | 29,90 | 31,27 | 22,6 | 23,7 | 14,4 | 36,1 |
| AutomationBench (Public) | 36,3 | 36,4 | 8,4 | 14,6 | 42,4 | 39,3 |
| MCP Atlas | 73,27 | 71,67 | 62,2 | 76,0 | 89,2 | 80,8 |
| FORTRESS Adversarial | 83,2 | 83,8 | 79,3 | 78,0 | 94,2 | 92,1 |
| FORTRESS Benign | 95,5 | 95,5 | 89,1 | 95,9 | 82,6 | 86,4 |
| StrongREJECT | 95,9 | 97,5 | 98,2 | 98,6 | 94,7 | 95,8 |

Los datos son autodeclarados por el autor y no se han verificado de forma independiente en la información disponible. La cuantización NVFP4 degrada de forma notable Terminal-Bench 2.1 (de 80,5 a 76,0), DeepSWE 1.1 (de 44,3 a 40,3) y SWE-bench Pro v2.0 Hard (de 79,1 a 77,8), mientras que en matemáticas y conocimiento general las diferencias son pequeñas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 101 GB en safetensors, por lo que la inferencia requiere al menos 101 GB de memoria disponible para pesos, más espacio para KV cache y buffers. La configuración de referencia usa 128 GB de memoria unificada en una DGX Spark (GB10).
- GPU recomendadas: DGX Spark GB10 (128 GB unificados) es la plataforma validada por el autor. Para GPUs discretas se necesitan al menos 128 GB de VRAM agregada; no se documenta una configuración multi-GPU concreta.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en GPUs consumer convencionales. Solo es viable en sistemas con memoria unificada grande o configuraciones multi-GPU profesionales (A100 80 GB, H100 80 GB, H200) combinando varias unidades, sin datos de rendimiento publicados para esas configuraciones.
- Opciones de despliegue: SGLang 0.5.19 estándar y sin modificar, con los scripts `inference/local/spark.py` y `ripple.ipynb` incluidos en el repositorio. Requiere Python 3.12, CUDA 13 y `python3.12-dev`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en DGX Spark con temperatura 1,0 y salidas de 128 tokens, aproximadamente 19,5 tok/s con una petición y 48 tok/s agregados con cuatro peticiones concurrentes. La concurrencia máxima configurada es de 4 peticiones.
- Contexto operativo: 131.072 tokens con caché de prefijo activada; la ventana de 1M declarada no está habilitada en la configuración incluida.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros totales / activos | Contexto | Terminal-Bench 2.1 | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|---|
| Ripple-65B Preview NVFP4 | Densa | 65B / 65B | 1M declarado; 131K configurado | 76,0 | 76,5 | Apache 2.0 |
| Reflection Beam 501B | MoE | 501B / 23B | No disponible | 80,1 | 81,6 | No disponible |
| Muse Spark Open 816B | MoE | 816B / 42B | No disponible | 76,4 | 78,7 | No disponible |
| Nemotron 3 Ultra 550B | MoE | 550B / 55B | No disponible | 56,4 | 71,9 | No disponible |

Ripple compite con modelos MoE de 500B a 975B parámetros totales manteniendo solo 65B activos, lo que reduce los requisitos de memoria frente a alternativas MoE de mayor tamaño pero no frente a sus parámetros activos. En Terminal-Bench 2.1 supera a Nemotron 3 Ultra 550B e Inkling 975B según los datos del autor, y queda por debajo de Reflection Beam 501B en SWE-bench Verified. La licencia Apache 2.0 es una ventaja frente a alternativas cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- La model card etiqueta el modelo como "Experimental" y "Preview"; no se garantiza estabilidad de API ni de comportamiento entre versiones.
- Existe una discrepancia entre los 65B declarados y los 39.616.865.360 parámetros reales de los safetensors; conviene verificar el conteo exacto antes de dimensionar infraestructura.
- La decodificación especulativa por árbol está marcada como experimental; puede producir resultados distintos a la especulación en cadena estándar.
- La cuantización NVFP4 degrada el rendimiento en tareas agénticas y de código (Terminal-Bench 2.1 cae 4,5 puntos y DeepSWE 1.1 cae 4,0 puntos frente a BF16); para producción sensible a calidad conviene evaluar el checkpoint BF16.
- Los benchmarks son autodeclarados por el autor y no se han verificado de forma independiente en la información disponible.
- No se documentan idiomas soportados ni evaluación multilingüe; el comportamiento fuera del inglés es desconocido.
- La ventana de 1M tokens no está habilitada en la configuración de referencia, limitada a 131.072 tokens; el rendimiento más allá de esa longitud no está documentado.
- No se detallan sesgos conocidos, composición del dataset ni proceso de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de alucinación y sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incluye `custom_code` y depende de kernels Triton y SGLang 0.5.19; la compatibilidad futura con otras versiones no está garantizada.
- La concurrencia máxima de 4 peticiones en la configuración incluida limita el throughput en cargas de producción reales.

## Enlaces

- Modelo en Hugging Face (NVFP4): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo BF16: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Draft model para decodificación especulativa: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
