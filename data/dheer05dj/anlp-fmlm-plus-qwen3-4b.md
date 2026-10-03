# dheer05dj/anlp-fmlm-plus-qwen3-4b

## Resumen

`dheer05dj/anlp-fmlm-plus-qwen3-4b` es un **drafter de decodificacion especulativa** para el modelo objetivo `Qwen/Qwen3-4B`, entrenado con el objetivo **FMLM+** (variante de "flow maps" de orden arbitrario). No es un modelo de lenguaje autonomo: su funcion es proponer bloques de tokens candidatos que Qwen3-4B verifica despues, reduciendo el numero de pasos secuenciales necesarios para generar texto. Lo publica el usuario dheer05dj como parte del proyecto ANLP, que compara este drafter con la alternativa DFlash.

El diseno reutiliza la misma red que el drafter DFlash e incorpora dos modificaciones: los 15 slots de adivinacion arrancan como ruido aleatorio en lugar de un marcador en blanco fijo, y la red recibe dos marcas temporales (el tiempo de partida s y el tiempo de destino t). En inferencia realiza **un unico salto desde ruido (s=0) hasta la respuesta (t=1)**, con el mismo coste por pasada que DFlash. Se entreno desde pesos aleatorios (no por destilacion desde un drafter previo) sobre 98.999 respuestas greedy generadas por Qwen3-4B.

Es relevante porque documenta de forma transparente un resultado negativo: **FMLM+ no supera a DFlash-100K** (queda 0,60 tokens por ronda por detras en el conjunto de test completo), y el propio autor lo atribuye en parte al arranque desde ruido y en parte a un entrenamiento con ~6,5 veces menos pasos. La licencia es MIT y el repositorio ocupa 2,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de drafting tipo transformer basada en la del drafter DFlash, con flow maps de orden arbitrario (FMLM+). Modelo objetivo: Qwen/Qwen3-4B (revision 1cfa9a7208912126459214e8b04321603b3df60c) |
| Parametros totales | 537.427.200 (segun safetensors en HuggingFace); la model card indica ~591M usados para el drafting, mas una tabla de tokens `E_in` de 389M que el cargador descarta |
| Longitud de contexto | No definida por el drafter (la gestiona el modelo objetivo Qwen3-4B); la evaluacion usa hasta 2048 tokens nuevos |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `flow.safetensors`) |

## Arquitectura y entrenamiento

El drafter usa la misma red que DFlash, ampliada con dos piezas propias de FMLM+: un **arranque ruidoso** en el que los 15 slots de adivinacion se inicializan con ruido aleatorio en lugar de un token en blanco, y una **inyeccion de dos tiempos** (embeddings de tiempo s y t) que indica a la red desde donde parte y a donde debe saltar. En inferencia se ejecuta un unico salto de s=0 a t=1, por lo que el coste por pasada es identico al de DFlash. Los ficheros incluyen `dflash.py`, `modeling_dflash.py`, `utils.py` y el wrapper FMLM+ (`code/flow.py`, `code/common.py`), que se carga con `flow.load_export(...)` y se activa con `flow.set_mode(fd, "onejump")`.

El entrenamiento partio de **pesos aleatorios**, sin inicializacion desde otro drafter. Los datos son 98.999 respuestas greedy del propio Qwen3-4B (con 1.000 reservadas para validacion). Se realizaron **6 epocas y 17.156 pasos sobre 8x H100** (batch 4 por GPU), con learning rate 6e-4 y schedule coseno. Cada paso combina al 50 % denoising y al 50 % auto-destilacion. La model card senala que este regimen implica ~6,5 veces menos pasos que DFlash-100K, lo que explica parte de la brecha de rendimiento.

## Capacidades

- **Drafting de tokens especulativo**: propone bloques de hasta 15 tokens candidatos que Qwen3-4B verifica en una sola pasada, sustituyendo varios pasos de decodificacion autoregresiva.
- **Salto unico ruido-a-respuesta**: modo `onejump`, que genera la propuesta en una sola pasada del drafter con el mismo coste que DFlash.
- **No genera texto de forma autonoma**: no es un modelo de chat ni de instrucciones; su salida solo tiene sentido como propuesta verificada por el modelo objetivo.
- **Capacidades heredadas del sistema**: en produccion, el rendimiento funcional (razonamiento, codigo, matematicas, multilingue, tool calling) lo aporta Qwen3-4B, no el drafter.
- **No se declaran** modos de pensamiento, vision, audio, tool calling propio ni capacidades de agente en el drafter.

## Casos de uso

- **Reduccion de latencia en chat interactivo**: integrado con Qwen3-4B, el sistema puede generar hasta ~3x mas rapido en H100 (2,99x con `onejump`), lo que reduce el tiempo hasta el primer bloque de respuesta en asistentes conversacionales.
- **Servicio de inferencia con requisitos de tiempo real**: para APIs que sirven Qwen3-4B y necesitan cumplir presupuestos de latencia estrictos, el drafter permite aumentar el throughput por GPU al reducir pasadas secuenciales.
- **Despliegue en una sola GPU**: al sumar pocos cientos de MB al modelo base, el par drafter + Qwen3-4B puede servirse en hardware de una sola tarjeta (por ejemplo, una RTX 4090 de 24 GB), abaratando el coste por consulta.
- **Aplicaciones de codigo con generacion larga**: si el modelo objetivo se usa como asistente de codigo, la decodificacion especulativa acelera la emision de bloques completos de codigo en lugar de token a token.
- **Pipelines de agentes con multiples llamadas**: en flujos de multi-step reasoning donde el modelo se invoca decenas de veces, el ahorro por invocacion se acumula y reduce el coste total del pipeline.
- **Investigacion sobre decodificacion especulativa**: sirve como referencia reproducible para comparar FMLM+ frente a DFlash, ya que el repositorio incluye codigo, configuracion y resultados de ambos metodos.
- **Generacion por lotes (batch serving)**: en cargas con muchas peticiones concurrentes, el aumento de tokens por ronda (τ) mejora la utilizacion de la GPU para Qwen3-4B.

## Benchmarks y rendimiento

Resultados declarados por el autor (greedy, thinking desactivado, hasta 2048 tokens nuevos; DFlash-100K medido en la misma ejecucion). τ es el numero de tokens producidos por ronda de adivinacion y verificacion; cuanto mayor, mejor.

| Modo de drafting | τ (20 prompts/conjunto) | Aceleracion (H100) | τ (2.320 prompts de test) |
|---|---:|---:|---:|
| `onejump` (el metodo) | 4,30 | 2,99x | 4,21 |
| `onejump_zero` (mismo salto desde ruido cero) | 4,77 | 3,35x | 4,67 |
| `denoise0` (denoiser puro en ruido puro) | 4,71 | 3,29x | 4,59 |
| DFlash-100K (referencia) | 4,93 | 3,56x | 4,81 |

El autor indica explicitamente que **FMLM+ no supera a DFlash-100K**: en los conjuntos de test completos, `onejump` queda por detras en −0,60 ± 0,01 tokens por ronda. Aproximadamente 0,4 de esa diferencia proviene de arrancar el salto desde ruido aleatorio; el resto, de un modelo base mas debil (entrenado desde pesos aleatorios y con ~6,5 veces menos pasos). No se aportan cifras de MMLU, HumanEval, GSM8K u otros benchmarks de calidad, ya que el drafter no genera respuestas evaluables por si mismo.

## Requisitos de hardware

- **Entrenamiento**: 8x H100 (batch 4 por GPU), 17.156 pasos, 6 epocas.
- **VRAM estimada para inferencia**: el drafter anade unos 1,2 GB en BF16 sobre Qwen3-4B. En BF16, Qwen3-4B (~8 GB) + drafter queda en torno a 10-11 GB; con el modelo base cuantizado en Q4 (~2,5 GB), el conjunto puede caber en torno a 4-5 GB. Estimaciones orientativas, no publicadas por el autor.
- **GPU recomendadas**: H100 (medido de forma directa). A100 y GPU de 24 GB o mas son opciones razonables por encima de la VRAM estimada. Cabe en consumer de gama alta (RTX 4090, 24 GB) en BF16, y en GPU con menos VRAM si se cuantiza el modelo base.
- **Opciones de despliegue**: requiere codigo personalizado (`custom_code`) y el paquete upstream `dflash`. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: aceleracion de 2,99x (`onejump`) y 3,35x (`onejump_zero`) sobre H100; 4,21-4,67 tokens por ronda en el conjunto completo de test.
- **Aviso de rendimiento**: en H100 con torch 2.13 es necesario ejecutar `torch.backends.cuda.enable_cudnn_sdp(False)` antes de decodificar; de lo contrario, la atencion de cuDNN hace la decodificacion ~10 veces mas lenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (τ / aceleracion H100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FMLM+ (este modelo) | Drafter FMLM+ para Qwen3-4B | 537M-591M | Definida por Qwen3-4B | 4,30 / 2,99x (`onejump`) | MIT | HuggingFace, requiere codigo custom |
| DFlash-100K | Drafter DFlash para Qwen3-4B | no disponible | Definida por Qwen3-4B | 4,93 / 3,56x | no disponible | Repositorio companero `anlp-dflash-100k-qwen3-4b` |
| Otros drafters para Qwen3-4B (EAGLE, Medusa, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros drafters comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **No supera a DFlash-100K**: es un resultado experimental con brecha declarada de −0,60 ± 0,01 tokens por ronda en el conjunto de test completo.
- **Entrenado desde pesos aleatorios con pocos pasos**: ~6,5 veces menos pasos que DFlash-100K, lo que el autor identifica como causa de parte de la perdida de rendimiento.
- **No es un modelo autonomo**: no genera respuestas de calidad por si mismo; depende siempre de Qwen3-4B para verificar y producir la salida final.
- **Integracion compleja**: exige el paquete upstream `dflash` y codigo con `custom_code`; no hay soporte estandar en frameworks de servido ampliamente usados.
- **Problema conocido de atencion en cuDNN**: sin desactivar `cudnn_sdp` en torch 2.13, la decodificacion se ralentiza ~10 veces.
- **Sin datos de sesgo ni de alucinacion**: al ser un drafter, el riesgo de alucinacion y los sesgos dependen del modelo objetivo Qwen3-4B, no evaluados en esta ficha.
- **Cobertura idiomatica no documentada**: los idiomas soportados dependen de Qwen3-4B y no se detallan.
- **Adopcion practicamente nula**: 0 descargas y 0 "likes" en el momento de la consulta; no hay validacion externa independiente.
- **Licencia permisiva (MIT)**: permite uso comercial del drafter, pero el uso del modelo objetivo Qwen3-4B queda sujeto a su propia licencia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/dheer05dj/anlp-fmlm-plus-qwen3-4b
- Modelo objetivo Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper FMLM+ (*Posterior Refinement: Fast Language Generation via Any-Order Flow Maps*): https://arxiv.org/abs/2606.24773
- Codigo del metodo FMLM+: https://github.com/david3684/flm
- Repositorio companero DFlash-100K: `anlp-dflash-100k-qwen3-4b` (referenciado en la model card)
