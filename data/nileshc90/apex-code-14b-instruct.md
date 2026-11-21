# nileshc90/apex-code-14b-instruct

## Resumen

ApexCode-14B-Instruct es un modelo de generacion de codigo desarrollado por Nilesh Chakraborty (usuario `nileshc90` en Hugging Face) a partir de un ajuste fino del modelo base Qwen/Qwen2.5-Coder-14B-Instruct. Se presenta como un modelo "nativamente fusionado" con una tecnica propietaria denominada Compact Invariant Distillation (CID), que segun el autor le permite realizar razonamiento matematico invariante acotado sobre algoritmos complejos sin necesidad de adaptadores externos o modos separados. El modelo esta disenado especificamente para estaciones de trabajo de desarrollador y equipos Apple Silicon con 36 GB de RAM unificada.

La propuesta de valor del modelo gira en torno a la eficiencia en hardware de consumo: el autor reporta un footprint de memoria de 20,60 GB sobre 36 GB disponibles y cero swapping en un Apple M4 Max. Incluye pesos en safetensors y GGUF, y ofrece integracion directa con MLX, Ollama y llama.cpp, ademas de un endpoint compatible con la API de OpenAI mediante `mlx_lm.server`.

El modelo se distribuye bajo licencia MIT y esta orientado exclusivamente al ingles. Su relevancia actual radica en la promesa de un rendimiento competitivo en benchmarks de generacion de codigo (LiveCodeBench, HumanEval) en un formato que cabe en hardware de consumo, aunque las cifras reportadas por el autor deben interpretarse con cautela dado que no se han publicado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-14B) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; se reporta una prueba needle-in-haystack a 10K tokens con 100% de acierto |
| Tipos de cuantizacion | 4-bit (tag del repo); pesos safetensors y GGUF disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-14B-Instruct, con 14,77 mil millones de parametros. El autor afirma que todos los pesos del repositorio estan "nativamente fusionados" con Compact Invariant Distillation (CID), una tecnica que, segun la model card, integra capacidades de razonamiento matematico invariante directamente en los pesos en lugar de mediante adaptadores LoRA o modulos sidecar. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Entre las innovaciones tecnicas declaradas destacan la fusion nativa de CID, el soporte de decodificacion especulativa (tag `speculative-decoding`) y una "induccion matematica" orientada a algoritmos. El autor tambien menciona una "Adaptive Routing & Tool-Call Repair" en su pipeline de evaluacion, pero no queda claro si forma parte del modelo o del arnes de evaluacion. No se dispone de informacion sobre la composicion exacta del corpus de ajuste fino ni sobre el proceso de destilacion.

## Capacidades

- Generacion de codigo en produccion con tipado y anotaciones de tipo, segun los ejemplos de la model card (AST valido al 100% en una prueba con clases de concurrencia y locks).
- Razonamiento matematico y algoritmico, incluyendo deteccion de falacias logicas (se cita la falacia del termino medio no distribuido).
- Generacion de codigo en un solo paso (single-pass) sin bucles de feedback de tests, segun la evaluacion reportada en LiveCodeBench.
- Recuperacion en contexto profundo (needle-in-haystack a 10K tokens con 100% de acierto reportado).
- Soporte de tool calling y reparacion de llamadas a herramientas mediante linter externo (mencionado en el pipeline de evaluacion).
- Sintesis multi-archivo de repositorios con extraccion de simbolos AST (reportado 100% de exito en la prueba del autor).
- Capacidades conversacionales (tag `conversational`).
- No se menciona soporte de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistencia de codigo en estaciones de trabajo Apple Silicon: el modelo cabe en 36 GB de RAM unificada con 20,60 GB de footprint y cero swapping en M4 Max, lo que permite ejecutarlo localmente junto al IDE sin degradar el sistema.
- Generacion de codigo en pipelines de CI/CD: su capacidad de generar codigo en un solo paso sin bucles de feedback lo hace adecuado para tareas de autocompletado y generacion de parches donde no se dispone de ejecucion de tests.
- Resolucion de problemas algoritmicos competitivos: el autor reporta 80,0% Pass@1 en LiveCodeBench en modo single-pass, lo que lo situaria como candidato para entornos de evaluacion de algoritmos.
- Sintesis de repositorios multi-archivo: la extraccion de simbolos AST con menos de 500 tokens y cero interfaces alucinadas reportada lo orienta a tareas de scaffolding y refactorizacion entre ficheros.
- Servicio local compatible con OpenAI: mediante `mlx_lm.server` se puede exponer un endpoint compatible con la API de OpenAI para integrarlo en herramientas que ya consumen ese formato.
- Razonamiento logico y verificacion: la deteccion de falacias y el razonamiento matematico invariante lo hacen util para tareas de revision de argumentos y validacion de algoritmos.
- Despliegue en hardware legacy: el autor reporta funcionamiento en una estacion Intel Core i9-9880H con AMD Navi 14 GDDR6 a 18-26,4 tok/s, lo que amplia el rango de hardware compatible.

## Benchmarks y rendimiento

Los siguientes datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | Resultado reportado | Contexto |
|---|---|---|
| LiveCodeBench Pass@1 (single-pass, 50 problemas) | 80,0% (40/50) | Facil 88,9%, Medio 78,3%, Dificil 66,7% |
| LiveCodeBench Pass@1 (zero-shot estandar) | 46,0% (23/50) | Baseline con prompt vanilla |
| LiveCodeBench Pass@1 (pipeline unificado) | 62,0% (31/50) | Pipeline de investigacion |
| LiveCodeBench Pass@1 (routing adaptativo + reparacion) | 78,0% (39/50) | Routing adaptativo + linter externo |
| HumanEval (base) | 89,6% | Comparado con GPT-4o (90,2%) y CodeStral-22B (81,1%) |
| HumanEval+ (EvalPlus) | 87,2% | Robustez ante casos limite |
| MBPP+ (EvalPlus) | 72,8% | Sintesis de tareas algoritmicas |
| Needle-in-haystack 10K | 100% | Recuperacion en contexto profundo |
| Velocidad pico de generacion | 37,45 tok/s | Apple M4 Max, Metal |
| Throughput sostenido | 35,43 tok/s | Prueba de 1.023 tokens |
| TTFT medio | 156 ms | Apple M4 Max |

## Requisitos de hardware

- VRAM/RAM estimada: 20,60 GB de footprint reportado en cuantizacion 4-bit sobre 36 GB de RAM unificada (Apple M4 Max).
- GPU recomendadas: Apple Silicon M4 Max con 36 GB (referencia del autor); AMD Navi 14 GDDR6 en configuracion legacy (18-26,4 tok/s reportados); no se especifican GPUs NVIDIA en la informacion disponible.
- Cabe en GPU de consumo: si, en configuracion 4-bit; el tag `36gb-ram` sugiere que el objetivo es equipos con 36 GB de memoria unificada.
- Opciones de despliegue: MLX (`mlx_lm.generate`, `mlx_lm.server`), Ollama (`ollama run hf.co/nileshc90/apex-code-14b-instruct`), llama.cpp (tag), transformers, text-generation-inference (tag), endpoints compatibles con OpenAI.
- Latencia y throughput: TTFT medio de 156 ms y throughput sostenido de 35,43 tok/s en M4 Max; 18-26,4 tok/s en la configuracion AMD Navi 14.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ApexCode-14B-Instruct | 14,77 B | no disponible | 80,0% Pass@1 (reportado por el autor) | MIT | Hugging Face, GGUF, MLX, Ollama |
| Qwen2.5-Coder-14B-Instruct (base) | 14,77 B | 128K (segun Qwen) | 33,3% en slice dificil (reportado por el autor) | Apache 2.0 (segun Qwen) | Hugging Face |
| GPT-4o | no disponible | no disponible | no disponible en esta ficha | Propietaria | API |
| CodeStral-22B | 22 B | no disponible | no disponible en esta ficha | no disponible | no disponible |

Nota: los datos de Qwen2.5-Coder-14B-Instruct y CodeStral-22B provienen de la propia model card de ApexCode y no se han contrastado con fuentes independientes. Los datos de contexto de Qwen se indican como referencia general y no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Las cifras de benchmarks (80,0% en LiveCodeBench, 89,6% en HumanEval) provienen exclusivamente del autor y no han sido verificadas de forma independiente; deben tratarse con escepticismo.
- El modelo se presenta como "nativamente fusionado" con una tecnica propietaria (CID) sin publicacion de paper ni detalle tecnico verificable en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de generacion de codigo; el autor reporta cero interfaces alucinadas en su prueba de sintesis multi-archivo, pero es una metrica autoevaluada.
- La longitud de contexto no se declara de forma explicita; solo se aporta una prueba needle-in-haystack a 10K tokens.
- El tag `4-bit` sugiere que los pesos principales distribuidos estan cuantizados, lo que puede afectar a la calidad frente al modelo base en precision completa.
- Aunque la licencia es MIT, el modelo base Qwen2.5-Coder-14B-Instruct tiene su propia licencia (Apache 2.0 segun Qwen); conviene verificar la compatibilidad para uso comercial.
- El repositorio tiene 0 likes y 986 descargas en el momento de la consulta, lo que indica una adopcion limitada y ausencia de validacion por la comunidad.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nileshc90/apex-code-14b-instruct
- Space de demostracion: https://huggingface.co/spaces/nileshc90/apex-code-space
- Repositorio GitHub: https://github.com/nileshchakraborty/apex-code-14b-instruct
- LiveCodeBench: https://livecodebench.github.io/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
