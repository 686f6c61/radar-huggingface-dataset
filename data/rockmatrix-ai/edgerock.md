# rockmatrix-ai/EdgeRock

## Resumen

EdgeRock-4B es el primer modelo abierto de la familia EdgeRock de Rock Matrix, una arquitectura híbrida disenada para mantener un razonamiento fuerte con memoria constante. A diferencia de los transformers clasicos, cuyo KV cache crece linealmente con la longitud de contexto, EdgeRock combina un estado recurrente que resume el contexto, atencion local para informacion reciente y Rock Memory Anchors (RMA) para preservar detalles lejanos seleccionados. El resultado es un historial persistente de capacidad fija que libera VRAM para peticiones concurrentes.

El modelo tiene 4.578.061.568 parametros (aproximadamente 4,6 mil millones), pesos en safetensors, y soporta entrada de texto e imagen con salida de texto. Esta orientado a razonamiento, generacion de codigo y flujos de agentes, con soporte declarado para ingles y chino. Su propuesta de valor es economica: en contexto de 256K, el KV de atencion en BF16 es un 99,1% menor que el de Qwen3.5-4B, y en una GPU Hopper de 80 GB sostiene 233,7 tokens/s de decodificacion con 128K de entrada y 128K de salida.

La relevancia actual reside en que la mayoria de modelos de razonamiento de 4B escalan su coste de memoria con la longitud de contexto, lo que encarece el despliegue de agentes de larga duracion. EdgeRock propone una via alternativa basada en estado acotado, con resultados declarados de 82,9% de pass@1 medio en AIME 2024-2026 frente al 18,8% de RWKV-7 G1j (clase 14B) como mejor baseline de estado acotado evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: estado recurrente + atencion local + Rock Memory Anchors (RMA) |
| Parametros totales | 4.578.061.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K (se reportan resultados a 256K) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; runtime BF16/FP16/FP32 segun componente) |
| Idiomas soportados | en, zh |
| Licencia | edgerock-model-license-1.0 (tag `license:other`, tag `commercial-use`) |
| Formato de pesos | safetensors (repo de 18,6 GB; incluye codigo custom y wheels de transformers 5.7.0.dev0) |

## Arquitectura y entrenamiento

EdgeRock-4B no es un transformer denso convencional. Su diseno combina tres piezas: un estado recurrente que resume el contexto acumulado, una ventana de atencion local que procesa la informacion reciente y los Rock Memory Anchors (RMA), que retienen detalles distantes seleccionados. El estado persistente tiene capacidad fija, de modo que el coste de memoria no crece con la longitud de la peticion. Segun la model card, el modelo usa actualizaciones GDN (gated delta network, por las siglas que aparecen en el texto) en FP32, y almacena el estado GDN en FP32 con batch size 1 y en FP16 para batches mayores. El runtime incluye un backend portable en PyTorch para CPU y CUDA y una ruta CUDA optimizada para Hopper.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se especifica la innovacion de decodificacion especulativa. La innovacion principal declarada es el almacenamiento KV de capacidad fija: 72 MiB de KV de atencion por secuencia y 97,76 MiB de historial persistente total en el runtime por batch, incluyendo matrices recurrentes en FP16 y estado auxiliar. El modelo se distribuye con codigo custom (`custom-code`, `custom_code`) y requiere instalar un wheel propio de transformers 5.7.0.dev0.

## Capacidades

- Generacion de texto con razonamiento multi-paso, orientado a problemas de matematicas y logica.
- Generacion y comprension de codigo en flujos de razonamiento.
- Entrada de imagen y salida de texto (`image-text-to-text`), con resultados declarados en seis benchmarks visuales.
- Soporte de contexto largo: hasta 256K tokens con KV de atencion de capacidad fija.
- Flujos de agentes y razonamiento multi-paso, segun la descripcion del autor.
- Capacidades multilingues limitadas a ingles y chino.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Audio: no disponible.

## Casos de uso

- Agentes de larga duracion: el estado persistente de capacidad fija (97,76 MiB por batch) permite mantener sesiones de agente con historial extenso sin que la VRAM crezca con cada turno, lo que abarata el despliegue de agentes que operan durante horas.
- Razonamiento matematico en produccion: con 82,9% de pass@1 medio en AIME 2024-2026, es adecuado para pipelines de resolucion de problemas cuantitativos donde se requiere justificar el razonamiento paso a paso.
- Procesamiento de documentos largos con imagenes: al aceptar entrada image-text-to-text y contexto de hasta 256K, puede extraer y razonar sobre informacion de informes escaneados, capturas o diagramas combinados con texto extenso.
- Generacion de codigo asistida: integrable en asistentes de IDE o pipelines de CI/CD que necesiten explicar cambios y razonar sobre repositorios, aunque el soporte de tool calling no esta confirmado en la documentacion disponible.
- Analisis visual de documentos tecnicos: con 84,9% de precision media a nivel de respuesta en seis benchmarks visuales, sirve para tareas de VQA tecnica donde el coste de memoria es critico.
- Despliegue en una sola GPU Hopper: con 233,7 tokens/s de decodificacion a batch 1 y contexto 128K/128K, encaja en servicios de inferencia que necesitan sostener generaciones largas en un unico acelerador de 80 GB.
- Atencion al cliente multilingue (en/zh): conversaciones multi-turno con contexto largo en ingles y chino, aprovechando el historial de capacidad fija para no degradar el throughput al crecer la sesion.

## Benchmarks y rendimiento

Resultados declarados en la model card (no verificados de forma independiente):

| Benchmark | EdgeRock-4B | Referencia comparada |
|---|---|---|
| AIME 2024-2026 (pass@1 medio) | 82,9% | RWKV-7 G1j (clase 14B): 18,8% |
| Benchmarks visuales (6 tareas, precision media a nivel de respuesta) | 84,9% | Qwen3.5-4B: retiene el 95,3% de su precision media |
| KV de atencion BF16 a 256K | 72 MiB por secuencia | Qwen3.5-4B: 99,1% mayor |
| Throughput de decodificacion (Hopper 80GB, batch 1, 128K in / 128K out) | 233,7 tokens/s | no disponible |
| Throughput extremo a extremo (32K in / 32K out, mejor batch medido) | 6,42x el de Qwen3.5-4B | Qwen3.5-4B: linea base |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K. Las cifras de throughput cuentan solo tokens de salida e incluyen prefill en el tiempo extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 18,6 GB en safetensors. El estado persistente ocupa 97,76 MiB por batch y el KV de atencion 72 MiB por secuencia.
- GPU recomendadas: Hopper 80GB (H100) para la ruta CUDA optimizada; el backend portable funciona en CPU y CUDA.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el backend portable en CUDA sugiere que podria ejecutarse en GPU consumer, pero no se aportan cifras de VRAM ni pruebas.
- Opciones de despliegue: runtime propio con `run.py` y wheel de transformers 5.7.0.dev0; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 233,7 tokens/s de decodificacion a batch 1 con 128K/128K en una Hopper 80GB; 6,42x el throughput extremo a extremo de Qwen3.5-4B a 32K/32K con el mejor batch medido de cada modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeRock-4B | 4,58B | hasta 256K | KV fijo (72 MiB/seq) | edgerock-model-license-1.0 (commercial-use) | Hugging Face, ModelScope, GitHub |
| Qwen3.5-4B | no disponible | no disponible | KV crece con contexto | no disponible | no disponible |
| RWKV-7 G1j (clase 14B) | clase 14B | no disponible | estado acotado | no disponible | no disponible |

La model card solo aporta comparaciones puntuales frente a Qwen3.5-4B (memoria y throughput) y RWKV-7 G1j (razonamiento). No se dispone de datos suficientes para una comparativa completa de parametros, contexto y rendimiento del resto de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de 4B orientado a razonamiento, requiere verificacion en produccion.
- Idiomas: solo ingles y chino; no hay soporte declarado de castellano.
- Licencia: `edgerock-model-license-1.0` con tag `commercial-use`, pero es una licencia propia (`license:other`); es imprescindible revisar el archivo LICENSE antes de un uso comercial.
- Dependencia de codigo custom: requiere el wheel transformers 5.7.0.dev0 y el runtime propio; la integracion con stacks estandar (vLLM, TGI) no esta documentada.
- Cifras no verificadas: los benchmarks y datos de throughput provienen de la model card del autor y no de evaluaciones independientes.
- Contexto largo: aunque se reportan resultados a 256K, el rendimiento en tareas de recuperacion exacta a esa distancia no se detalla.
- Tool calling y modo thinking: no confirmados en la documentacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/rockmatrix-ai/EdgeRock
- Model card en chino: https://huggingface.co/rockmatrix-ai/EdgeRock/blob/main/README_zh-CN.md
- Paper (arXiv): https://arxiv.org/abs/2610.10118
- Whitepaper (PDF): https://rockmatrix.ai/documents/rock-matrix-whitepaper-en.pdf
- Web de investigacion: https://rockmatrix.ai/research/#whitepaper
- GitHub: https://github.com/rockmatrix-ai/EdgeRock
- ModelScope: https://modelscope.cn/models/rockmatrix/EdgeRock
- Web del autor: https://rockmatrix.ai
