# nileshc90/apex-code-14b-instruct

## Resumen

ApexCode-14B-Instruct es una distribución optimizada para inferencia local del modelo Qwen2.5-Coder-14B-Instruct, publicada por el desarrollador independiente Nilesh Chakraborty (nileshc90) en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados en GGUF (Q5_K_M y Q4_K_M) junto con un modelo borrador (draft) de 0,5B en Q8_0 para decodificación especulativa, orientado a estaciones de trabajo con 36 GB de RAM y a Macs con Apple Silicon.

El objetivo declarado es ofrecer una experiencia de generación de código con velocidades de 45–65 tokens por segundo y una ventana de contexto de 32.768 tokens, dejando más de 22 GB de RAM libres para el sistema operativo, el IDE y contenedores Docker. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-Coder, con atención de escala completa y un total de 14.700 millones de parámetros en el modelo base (según la ficha del modelo original de Qwen).

Es relevante ahora porque propone un flujo de despliegue reproducible con Ollama y llama.cpp, incluyendo un Modelfile de 32k de contexto y un comando de servidor con parámetros afinados de decodificación especulativa y cuantización de KV-cache en Q8_0. Sin embargo, la model card mezcla datos del modelo base con métricas del empaquetado, por lo que conviene tratar sus cifras de benchmarks con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-14B-Instruct) |
| Parámetros totales | 14.700 millones (modelo base); el repositorio declara 494.032.768 tensores safetensors publicados, dato inconsistente con el modelo base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el Modelfile); 65.536 tokens sugeridos con Q4_K_M |
| Tipos de cuantización | Q5_K_M (por defecto), Q4_K_M, Q8_0 (modelo borrador 0,5B); KV-cache en Q8_0 |
| Idiomas soportados | inglés (declarado); el modelo base Qwen2.5-Coder soporta multilingüe, pero esta ficha solo declara `en` |
| Licencia | MIT |
| Formato de pesos | GGUF (transformers como librería declarada; safetensors parciales en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct es un transformer decoder-only denso con 14.700 millones de parámetros, entrenado por el equipo Qwen sobre un corpus masivo de código y texto, con fases de preentrenamiento, ajuste supervisado y optimización por preferencias (RLHF/DPO según la documentación pública de Qwen). ApexCode no añade entrenamiento propio: su aportación es la cuantización GGUF y la configuración de servicio.

La innovación técnica del empaquetado es la decodificación especulativa: se empareja el modelo principal de 14B con un modelo borrador Qwen2.5-Coder-0.5B-Instruct en Q8_0, con parámetros `--draft-max 6`, `--draft-min 2` y `--draft-p-min 0.75` en llama.cpp. Además se activa `--flash-attn` y cuantización de KV-cache en Q8_0 (`--cache-type-k q8_0 --cache-type-v q8_0`) para reducir la huella de memoria del contexto de 32k. El autor afirma hasta 2x de aceleración en throughput sin pérdida de calidad, aunque no se aportan mediciones reproducibles más allá de las cifras de la model card.

## Capacidades

- Generación de código en múltiples lenguajes, heredada de Qwen2.5-Coder-14B-Instruct (Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, etc.).
- Razonamiento algorítmico y resolución de problemas de programación de varios pasos.
- Relleno de código (fill-in-the-middle) y autocompletado en IDE, gracias a la integración documentada con Continue.dev, Cursor y VS Code.
- Conversación multi-turno con contexto de hasta 32.768 tokens, adecuada para trabajar sobre repositorios o archivos largos.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-Coder-Instruct (no documentado de forma explícita en esta model card, pero presente en el modelo original).
- Despliegue local con Ollama (`ollama run hf.co/nileshc90/apex-code-14b-instruct:Q5_K_M`) y con llama.cpp mediante `llama-server`.
- Modo de decodificación especulativa para acelerar la generación en hardware con memoria unificada.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Autocompletado y generación de código en el IDE: el modelo se integra en Continue.dev o Cursor mediante Ollama y ofrece respuestas con TTFT de ~156 ms según el autor, lo que permite sugerencias casi instantáneas mientras se escribe.
- Asistente de refactorización sobre archivos grandes: con 32.768 tokens de contexto se pueden pasar módulos completos o varios archivos y pedir reescrituras, extracción de funciones o migraciones de API sin truncar el código.
- Generación de tests unitarios: el modelo puede producir suites de pruebas a partir de funciones existentes; su rendimiento en HumanEval+ (87,2% según la model card) sugiere robustez ante casos límite.
- Explicación y documentación de código legacy: se le puede alimentar un repositorio o un conjunto de archivos y solicitar docstrings, comentarios y resúmenes arquitectónicos en una sola pasada de contexto.
- Automatización de tareas de CI/CD asistidas por LLM: desplegado con `llama-server` en un runner con GPU o Apple Silicon, puede generar parches, revisar diffs o redactar mensajes de commit en pipelines internos.
- Entornos con recursos limitados o air-gapped: al ejecutarse en local con 36 GB de RAM y dejar 22+ GB libres, es viable en portátiles de desarrollo y en máquinas sin acceso a APIs en la nube, útil para código propietario o regulado.
- Prototipado rápido de agentes de código: el soporte de tool calling del modelo base permite construir agentes que invoquen linters, compiladores o intérpretes en bucles de varios pasos.

## Benchmarks y rendimiento

| Benchmark | Puntuación | Contexto comparativo (según el autor) |
|---|---|---|
| HumanEval (base) | 89,6% | Comparable a GPT-4o (90,2%) y superior a CodeStral-22B (81,1%) |
| HumanEval+ (EvalPlus) | 87,2% | Robustez frente a 80x casos límite |
| MBPP+ (EvalPlus) | 72,8% | Tareas algorítmicas multi-paso |
| Velocidad de generación (Apple Silicon M4 Max) | ~36–55 tok/s | Sin swap en 36 GB de memoria unificada |
| TTFT medio | ~156 ms | Respuesta casi instantánea |

Advertencia: estas cifras proceden de la model card del autor y no se acompañan de scripts de reproducción ni de comparaciones controladas. Los valores de HumanEval y HumanEval+ son coherentes con los publicados por Qwen para el modelo base, pero deben verificarse de forma independiente antes de usarlos en decisiones de producción.

## Requisitos de hardware

- VRAM/RAM estimada: ~12,8 GB para Q5_K_M con KV-cache de 32k en Q8_0; ~11,2 GB para Q4_K_M (permite contexto de 64k según el autor); ~0,6 GB adicionales para el modelo borrador de 0,5B.
- RAM total recomendada: 36 GB en sistemas con memoria unificada (Apple Silicon M-series) o en estaciones x86 con GPU dedicada.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) con Q4_K_M, A100 y H100. En Apple Silicon se cita explícitamente un M4 Max.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (~8,8 GB de pesos) entra en GPUs de 12–16 GB; Q5_K_M requiere 16 GB o más para dejar margen al contexto.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp (`llama-server` con decodificación especulativa), y potencialmente vLLM o TGI si se usan los pesos safetensors del modelo base (no documentado en esta ficha).
- Latencia y throughput: 36–55 tok/s y TTFT ~156 ms en M4 Max según el autor; hasta 2x de aceleración con decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ApexCode-14B-Instruct | 14,7B (base) | 32.768 | MIT | GGUF en HF, Ollama | Empaquetado optimizado con draft model |
| Qwen2.5-Coder-14B-Instruct | 14,7B | 32.768 (hasta 128k en el base) | Apache 2.0 (modelo original) | Safetensors y GGUF oficiales | Modelo de referencia; sin optimización de serving |
| CodeStral-22B | 22B | 32.768 | Apache 2.0 | Safetensors y GGUF | Citado por el autor con HumanEval 81,1% |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (2,4B activos, MoE) | 128k | DeepSeek License | Safetensors y GGUF | Alternativa MoE con mayor contexto |

La comparación con CodeStral-22B procede del propio autor; el resto de datos se basan en las fichas públicas de cada modelo. La ventaja principal de ApexCode frente a Qwen2.5-Coder-14B-Instruct es el empaquetado listo para Ollama con decodificación especulativa; la desventaja es que la licencia MIT del empaquetado no altera la del modelo base, que es Apache 2.0.

## Limitaciones y advertencias

- La model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior al de modelos multilingües específicos.
- El repositorio declara 494.032.768 parámetros en safetensors, cifra incompatible con un modelo de 14B; esto sugiere que el repo contiene solo algunos tensores o metadatos inconsistentes, y que los pesos reales están en los GGUF.
- Los benchmarks publicados no incluyen scripts de reproducción ni comparaciones controladas; trátalos como orientativos.
- Riesgo de alucinación inherente al modelo base, especialmente en APIs recientes o librerías poco representadas en el corpus de entrenamiento.
- La decodificación especulativa depende de llama.cpp y de parámetros concretos (`--draft-max`, `--draft-min`, `--draft-p-min`); variaciones en la versión de llama.cpp pueden alterar el rendimiento.
- El contexto de 32k con KV-cache Q8_0 consume memoria significativa; en sistemas con menos de 36 GB puede provocar swap y degradar la latencia.
- La licencia MIT del empaquetado no sustituye a la licencia del modelo base (Apache 2.0 para Qwen2.5-Coder); verifica las obligaciones de atribución antes de un uso comercial.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de mantenimiento ni de comunidad.
- No se documentan evaluaciones de seguridad, sesgos ni filtros de contenido.

## Enlaces

- HuggingFace: https://huggingface.co/nileshc90/apex-code-14b-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio de optimización y serving: https://github.com/nileshchakraborty/apex-code-36gb
- Documentación de Ollama para modelos de HuggingFace: https://ollama.com/blog/ollama-models-on-hugging-face
- llama.cpp (decodificación especulativa): https://github.com/ggerganov/llama.cpp
- Continue.dev: https://continue.dev
