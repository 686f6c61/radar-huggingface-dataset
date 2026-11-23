# PeetPedro/quantal-classroom-1.6

## Resumen

quantal-classroom-1.6 es un modelo de generacion de texto derivado de Qwen/Qwen2.5-0.5B, publicado por el autor PeetPedro dentro de la familia de entrenamiento "8b.is AI". Se trata de un fine-tune orientado a la experimentacion con cuantizacion ternaria (formato b1.58, en la linea de BitNet) sobre un transformer denso de 0,5 mil millones de parametros, empaquetado en formato MLX para su ejecucion en hardware Apple Silicon. El modelo se distribuye con licencia Apache 2.0 y declara soporte para ingles y hungaro.

El interes tecnico del modelo no reside en su capacidad bruta —es un modelo de 0,5B, muy por debajo de los estandares actuales— sino en su propuesta de eficiencia: el autor reporta un peso ternario de 0,42 GB frente a 3,4 GB en FP16, con un incremento de throughput de 28 a 118 tokens por segundo en Apple Silicon y movil, lo que supone unas 4,2 veces mas velocidad. El pipeline de entrenamiento combina destilacion desde un "consejo" de profesores (Qwen3-8B y Qwen3-14B) con exportacion ternaria y verificacion de integridad mediante hash.

La relevancia actual del modelo es acotada y de nicho: sirve como banco de pruebas reproducible para investigacion en cuantizacion extrema y destilacion multi-profesor en dispositivos de consumo, no como alternativa a modelos de proposito general. El propio autor advierte que las cifras presentadas no son benchmarks externos salvo que se indique lo contrario, y que la evaluacion se realizo sobre particiones del mismo fichero de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-0.5B), con exportacion ternaria b1.58 |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la evaluacion declarada usa ctx 256) |
| Tipos de cuantizacion | Ternaria b1.58 (peso de 0,42 GB); pesos safetensors en formato MLX |
| Idiomas soportados | ingles, hungaro |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 8 ficheros, repo de 3,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B, un transformer denso decoder-only de 0,5B parametros con tokenizer de vocabulario 151.643. Sobre esa base se aplica un proceso de destilacion descrito como "council of elders": un consenso por divergencia KL entre dos profesores, Qwen3-8B y Qwen3-14B, frente a una variante de profesor unico (Qwen3-14B) y una ablacion de entrenamiento solo con entropia cruzada. Los datos de entrenamiento provienen de los corpus PeetPedro/ultrawhale-dogfood y PeetPedro/cogitoergosumma-corpus.

La innovacion principal es la exportacion ternaria en el esquema b1.58, que reduce el peso del artefacto a 0,42 GB frente a 3,4 GB en FP16. El autor declara verificacion del worktree mediante restricciones AST (100% AST-constrained, sin reward hacking) y un gate de paridad entre un runner en Rust y el forward de referencia, ademas de un control de hash posterior al push (`checkpoint_sha256`) para garantizar que el artefacto publicado coincide con el declarado en el manifiesto. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y hungaro.
- Razonamiento basico y continuacion de texto dentro de la ventana de contexto evaluada (256 tokens en la validacion declarada).
- Ejecucion local en Apple Silicon y dispositivos moviles gracias al formato MLX y a los pesos ternarios.
- Destilacion multi-profesor como tecnica reproducible (el modelo es tambien un artefacto de investigacion sobre el metodo).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se declara capacidad multilingue mas alla de ingles y hungaro.

## Casos de uso

- Experimentacion en cuantizacion ternaria: el modelo sirve como referencia reproducible para medir el impacto de b1.58 sobre perplejidad y throughput en un transformer de 0,5B, comparando con la base FP16.
- Inferencia en dispositivos de consumo Apple: con 0,42 GB de pesos ternarios y MLX, es viable ejecutarlo en portatiles y moviles con memoria unificada limitada, a 118 tok/s segun el autor.
- Prototipado de asistentes conversacionales ligeros en ingles o hungaro: util para demos offline donde no se requiere alta calidad linguistica pero si baja latencia y ausencia de red.
- Investigacion en destilacion multi-profesor: el protocolo de consenso KL entre Qwen3-8B y Qwen3-14B puede replicarse sobre otras bases pequenas usando este modelo como caso de estudio.
- Verificacion de pipelines de integridad de artefactos: el esquema de hash gate y paridad Rust/referencia documentado es reutilizable en despliegues que exigen trazabilidad de pesos.
- Educacion y docencia: el tag "classroom" y el enfoque local-first lo hacen adecuado para talleres sobre cuantizacion, MLX y entrenamiento reproducible en hardware propio.

## Benchmarks y rendimiento

Los datos siguientes son los declarados por el autor en la model card. Corresponden a perplejidad (cross-entropy enmascarada) sobre particiones tematicas del mismo fichero de entrenamiento, no sobre corpus externos, con tokenizer de Qwen (vocabulario 151.643) y contexto de 256 tokens.

| Arm (ablacion) | Perplejidad de validacion |
|---|---|
| Council consensus KL (Qwen3-8B + 14B) — quantal-classroom-1.6 | 1,6120 |
| Single-teacher (Qwen3-14B) | 1,8166 |
| Base 1.7B sin cuantizar | 2,1369 |
| Solo CE (cross-entropy) | 2,1469 |

| Metrica de eficiencia | Valor declarado |
|---|---|
| Throughput en Apple Silicon / movil | 4,2x respecto a la referencia |
| Tamano ternario vs FP16 | 0,42 GB vs 3,4 GB |
| Tokens por segundo | 28 (FP16) -> 118 (ternario) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 0,42 GB para los pesos ternarios; el repo completo ocupa 3,5 GB, por lo que conviene descargar solo los ficheros necesarios.
- GPU recomendadas: el formato es MLX, por lo que el objetivo principal son chips Apple (series M1 a M4) con memoria unificada. No se declara soporte CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac Apple Silicon con 8 GB o mas de memoria unificada; en moviles Apple compatibles con MLX.
- Opciones de despliegue: libreria MLX (mlx-lm) como via principal. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 118 tok/s en ternario frente a 28 tok/s en FP16 segun el autor, sobre Apple Silicon y movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| quantal-classroom-1.6 | 0,5B | no disponible (eval. a 256) | Ternaria b1.58, MLX | Apache 2.0 | Destilado de Qwen3-8B/14B; enfoque en eficiencia |
| Qwen/Qwen2.5-0.5B | 0,5B | 32.768 tokens (segun especificacion del modelo base) | FP16/BF16, GGUF via terceros | Apache 2.0 | Modelo base; mayor contexto declarado y ecosistema amplio |
| BitNet b1.58 (referencias de Microsoft Research) | escalas variables | no disponible | Ternaria nativa desde preentrenamiento | MIT (codigo) | Referencia academica del esquema ternario; no es un fine-tune |

La comparacion con el modelo base es la mas directa: quantal-classroom-1.6 anade destilacion y exportacion ternaria, pero no declara una ventana de contexto equivalente a la del Qwen2.5 original ni un ecosistema de despliegue comparable.

## Limitaciones y advertencias

- La perplejidad declarada (1,6120) se mide sobre particiones del mismo fichero de entrenamiento, no sobre corpus externos; no es comparable con benchmarks publicos y el propio autor lo advierte.
- El campo `verified` del model-index esta a `false`: la metrica no ha sido verificada de forma independiente.
- El autor documenta que el blob `quantal_model.safetensors` ha entregado en ocasiones un checkpoint distinto del declarado en el manifiesto; aunque se ha anadido un hash gate posterior al push, conviene verificar `checkpoint_sha256` antes de usar los pesos.
- Modelo de 0,5B: capacidad de razonamiento, codigo y matematicas muy limitada; riesgo elevado de alucinacion en tareas factuales.
- Soporte linguistico restringido a ingles y hungaro; no se declara castellano.
- Contexto de evaluacion de solo 256 tokens; no se especifica la longitud de contexto efectiva en inferencia.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay soporte declarado para CUDA, ROCm ni inferencia en servidores x86 convencionales.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo y la ausencia de benchmarks estandar desaconsejan su uso en produccion sin evaluacion propia.
- No se declaran mitigaciones de sesgo ni filtros de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/PeetPedro/quantal-classroom-1.6
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/PeetPedro/ultrawhale-dogfood
- Dataset de entrenamiento: https://huggingface.co/datasets/PeetPedro/cogitoergosumma-corpus
- Familia 8b.is: https://8b.is
- Classroom: https://classroom.vaked.dev
- The library: https://pocoo.vaked.dev
- GitHub: https://github.com/8b-is
