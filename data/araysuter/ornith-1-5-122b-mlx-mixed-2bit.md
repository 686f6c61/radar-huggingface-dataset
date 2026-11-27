# araysuter/Ornith-1.5-122B-MLX-mixed-2bit

## Resumen

Ornith-1.5-122B-MLX-mixed-2bit es una conversion experimental a formato MLX del modelo Ornith-1.5-122B (desarrollado por ornith-ai), realizada por el usuario araysuter. Se trata de una cuantizacion de precision mixta que combina expertos enrutados a 2 bits con otras proyecciones a 4 bits y routers a 8 bits, reduciendo el checkpoint original en BF16 hasta un payload de pesos de 40,62 GB. El modelo base es un transformer de tipo MoE (mezcla de expertos) con capacidades multimodales de imagen-texto, orientado a generacion conversacional, razonamiento y codigo.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de 122.562.817.776 parametros en hardware Apple Silicon mediante MLX, un ecosistema historicamente limitado a modelos de menor tamano. La cuantizacion agresiva a 2 bits en los expertos enrutados permite reducir el peso a practicamente un tercio del que tendria en BF16, a costa de una perdida de calidad que el autor reconoce explicitamente como no medida frente al modelo original.

El checkpoint incluye pesos de vision y assets del procesador, aunque la inferencia de imagen no ha sido validada en este experimento. Ademas, se excluyen los tensores MTP (multi-token prediction) del modelo fuente, por lo que no se dispone de los pesos de drafting originales. La licencia es MIT, lo que facilita su uso comercial, aunque las limitaciones tecnicas de la conversion deben tenerse en cuenta en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) multimodal imagen-texto |
| Parametros totales | 122.562.817.776 (122,56 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (probado por el autor; sin garantia de encaje en todos los perfiles) |
| Tipos de cuantizacion | Mixta: 2 bits (expertos enrutados, group size 64), 4 bits (otras proyecciones cuantizadas, group size 64), 8 bits (routers y gates de expertos compartidos, group size 64), BF16 (tensores no cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), payload de 40.621.228.512 bytes (40,62 GB / 37,83 GiB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B emplea una arquitectura de transformer con mezcla de expertos (MoE), identificada en los tags como `qwen3_5_moe`, lo que sugiere una variante de la familia Qwen 3.5 con enrutamiento de expertos. La conversion a MLX preserva la estructura MoE pero aplica una politica de cuantizacion diferenciada por tipo de tensor: los expertos enrutados (la mayor parte del peso) se cuantizan a 2 bits con grupo de 64, mientras que las proyecciones restantes se mantienen a 4 bits y los routers y gates de expertos compartidos a 8 bits para preservar la precision del enrutamiento. Los tensores no cuantizados permanecen en BF16 tras las transformaciones del loader.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original, ya que la model card de esta conversion no los detalla. La innovacion tecnica principal de esta ficha es la propia estrategia de cuantizacion mixta: al mantener los routers a 8 bits y las proyecciones no expertas a 4 bits, se intenta mitigar el dano tipico de la cuantizacion extrema a 2 bits, que afecta especialmente a las decisiones de enrutamiento. El autor excluye los tensores MTP del modelo fuente, por lo que esta conversion no ofrece decodificacion especulativa nativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat y modo thinking desactivable.
- Razonamiento y resolucion de problemas matematicos (evaluado en GSM8K con 24/25 en el subconjunto de prueba).
- Generacion de codigo (evaluado en HumanEval con 17/20 en el subconjunto de prueba, incluyendo adaptacion a chat y pruebas unitarias en sandbox).
- Seguimiento de instrucciones estrictas (evaluado en IFEval strict con 16/25).
- Capacidades multimodales imagen-texto: el checkpoint incluye pesos de vision y assets del procesador, pero la inferencia de imagen no ha sido validada en este experimento.
- Procesamiento de contexto largo: se probo una ventana de 128K tokens, con 282,54 segundos hasta el primer texto visible y 44,0 tokens/s de generacion reportados por el runtime.
- Soporte multilingue: no disponible (no se especifican idiomas en la informacion).
- Tool calling y function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el autor menciona comparaciones con Terminal-Bench 4.0 de modelos comerciales pero no ejecuto dicha prueba.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede desplegarse con `mlx-vlm` en un Mac con suficiente memoria unificada, gestionando conversaciones multi-turno con contexto de hasta 128K tokens. Es adecuado para entornos donde la privacidad impide usar APIs en la nube y se dispone de hardware Apple de gama alta.
- Generacion de codigo en pipelines de desarrollo: con un 85% de acierto en el subconjunto de HumanEval (17/20), puede integrarse como asistente de autocompletado o generacion de funciones en editores y herramientas de CI/CD, aunque requiere validacion humana por la cuantizacion agresiva.
- Razonamiento matematico y resolucion de problemas: el 96% en GSM8K (24/25) en el subconjunto probado lo hace util para tutoria automatizada o verificacion de calculos en entornos educativos, siempre con supervision.
- Procesamiento de documentos largos: la ventana de 128K permite resumir o extraer informacion de contratos, informes o articulos extensos, aunque el autor advierte que la prueba de 128K fue una sonda de completado crudo y no una evaluacion general de calidad en contexto largo.
- Experimentacion e investigacion en cuantizacion: el repositorio incluye manifiestos de conversion, hashes SHA-256 de shards, errores de reconstruccion muestreados y resultados de validacion, lo que lo convierte en una referencia para estudiar el impacto de la cuantizacion mixta 2/4/8 bits en modelos MoE.
- Despliegue en entornos con restricciones de memoria: con 40,62 GB de pesos, es una opcion para equipos Apple con 64 GB o mas de memoria unificada que no pueden alojar el checkpoint BF16 completo, sacrificando precision por viabilidad.
- Evaluacion comparativa de backends: util para comparar el rendimiento de MLX/VLM frente a otros backends (como TensorFold con DFlash2) en tareas de generacion y contexto largo, tal como hizo el autor en su comparativa con Swift-1.5.

## Benchmarks y rendimiento

Los datos disponibles provienen de una suite fija de 120 preguntas con respuestas greedy, prompts zero-shot, thinking desactivado y presupuestos de prompt/output identicos. El autor advierte que son subconjuntos pequenos y no establecen puntuaciones completas de benchmark.

| Modelo | Peso (GB) | ARC (50) | GSM8K (25) | HumanEval (20) | IFEval strict (25) |
|---|---:|---:|---:|---:|---:|
| Ornith 2-bit g64 (esta ficha) | 40,62 | 47/50 (94%) | 24/25 (96%) | 17/20 (85%) | 16/25 (64%) |
| Ornith 2-bit + 3-bit down | 45,45 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 21/25 (84%) |
| Ornith 2-bit g32 | 47,87 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 18/25 (72%) |
| Swift-1.5 4-bit + DFlash2 | 15,83 | 47/50 (94%) | 25/25 (100%) | 20/20 (100%) | 19/25 (76%) |

En rendimiento de inferencia con 20K tokens de entrada no cacheados, el perfil base de Ornith tardo 17,64 segundos hasta el primer texto visible y genero aproximadamente 66,8 tokens/s despues; Swift-1.5 tardo 21,81 segundos y genero unos 121,0 tokens/s. En la prueba de 128K, solo el perfil base completo: 282,54 segundos hasta el primer texto visible, 44,0 tokens/s reportados y 49,95 GB de asignacion pico en MLX. El autor no dispone de una ejecucion del modelo base en precision completa, por lo que la perdida de calidad respecto a BF16 es desconocida.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el payload de pesos es de 40,62 GB; la prueba a 128K registro 49,95 GB de asignacion pico en MLX, excluyendo otra memoria del sistema. Se requiere memoria unificada suficiente para pesos, cache KV, buffers temporales y el sistema operativo.
- GPU recomendadas: el modelo esta en formato MLX, disenado para Apple Silicon. No se dispone de informacion sobre ejecucion en GPUs NVIDIA (A100, H100, RTX 4090) con este checkpoint concreto.
- Compatibilidad con consumer GPU: no aplica directamente al ser MLX; en Apple Silicon se necesita un equipo con memoria unificada de al menos 64 GB para el perfil base, y mas para contexto largo. El autor observo uso de swap de macOS durante las pruebas.
- Opciones de despliegue: `mlx-vlm` (validado con `mlx==0.32.4`, `mlx-vlm==0.7.9`, `mlx-lm==0.32.0` en Apple Silicon). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: 17,64 s hasta el primer texto visible y ~66,8 tokens/s con 20K tokens de entrada; 282,54 s hasta el primer texto visible y 44,0 tokens/s en la prueba de 128K. Son intentos unicos en una sola maquina, no estimaciones repetidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Peso | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B-MLX-mixed-2bit (esta ficha) | 122,56 B (MoE) | 128K | MIT | MLX safetensors | 40,62 GB | Cuantizacion mixta 2/4/8 bits; sin MTP; vision no validada |
| Ornith-1.5-122B-MLX-4bit (BobClawblaw) | 122,56 B (MoE) | no disponible | MIT (heredada) | MLX safetensors | no disponible | Checkpoint MLX 4-bit de referencia citado por el autor |
| Swift-1.5 4-bit + DFlash2 | no disponible | no disponible | no disponible | TensorFold nativo | 15,83 GB | Usado como baseline comparativo; mejor throughput y HumanEval en la muestra |
| Ornith-1.5-122B (original BF16) | 122,56 B (MoE) | no disponible | MIT | safetensors BF16 | no disponible | Modelo fuente; puntuaciones de benchmarks no atribuibles a la conversion |

## Limitaciones y advertencias

- La cuantizacion agresiva a 2 bits en los expertos enrutados puede reducir la precision; el autor no dispone de una ejecucion en BF16 del modelo base, por lo que la perdida de calidad real es desconocida.
- Los benchmarks presentados son subconjuntos pequenos (50, 25 y 20 preguntas) y no constituyen puntuaciones completas de leaderboard; no deben atribuirse al modelo original.
- La inferencia de imagen no ha sido validada, pese a que el checkpoint incluye pesos de vision y assets del procesador.
- Se excluyen los tensores MTP del modelo fuente, por lo que no hay pesos de drafting para decodificacion especulativa.
- La prueba de 128K fue una sonda de completado crudo con fallo de coincidencia exacta por razonamiento adicional; no es una evaluacion general de calidad en contexto largo y no se garantiza que los perfiles mayores encajen en 128K.
- El modelo esta disenado para MLX en Apple Silicon; no hay evidencia de funcionamiento en GPUs NVIDIA ni en otros backends.
- Se observo asignacion de swap de macOS durante las pruebas, lo que indica presion de memoria en el equipo de validacion.
- No se especifican idiomas soportados ni sesgos conocidos; el riesgo de alucinacion no se ha medido en esta conversion.
- La licencia MIT permite uso comercial, pero las limitaciones tecnicas de la cuantizacion y la falta de validacion multimodal deben evaluarse antes de desplegar en produccion.
- El modelo es experimental y de un unico autor; no hay garantia de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Checkpoint MLX 4-bit de referencia: https://huggingface.co/BobClawblaw/Ornith-1.5-122B-MLX-4bit/tree/e5eccbc52ed3572157e40e761e040b84284
- Referencia comercial citada (Anthropic Claude Haiku 5.5): https://www.anthropic.com/claude-haiku-5-5
