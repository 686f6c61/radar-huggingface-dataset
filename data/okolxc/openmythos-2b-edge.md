# okolxc/openmythos-2b-edge

## Resumen

OpenMythos-2B Edge es un modelo de generacion de texto desarrollado por el usuario okolxc que trasplanta los pesos de Qwen3.5-2B a una arquitectura propia denominada OpenMythos, de tipo hibrido con atencion lineal y atencion completa. El modelo parte de los tensores originales de Qwen3.5-2B (licencia Apache-2.0) y los reubica 1:1 en un grafo de 24 capas que combina 18 capas de Gated DeltaNet (atencion lineal) con 6 capas de GQA full-attention, ademas de un bloque recurrente intermedio con ACT y LoRA.

Tras la conversion, el autor aplica un ajuste supervisado (SFT) sobre UltraChat-200k y un refuerzo con GRPO usando un verificador basado en LiquidAI/d1-3B. El objetivo declarado es corregir la perdida de calidad introducida por el trasplante arquitectonico (la perplejidad subio de 7,95 a 11,86 solo con la conversion) y explorar tecnicas de edicion de pesos sin gradientes descritas en el paper arXiv:2611.09382.

El modelo se posiciona como un experimento de investigacion sobre arquitecturas hibridas y programacion en el espacio de pesos, orientado a despliegue en el borde (edge) por su tamano contenido (2.393 B parametros en bf16, 5,80 GB). Su relevancia actual radica en que demuestra que es posible reutilizar pesos de un transformer denso en una topologia con atencion lineal sin reentrenar desde cero, aunque con costes medibles de fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + GQA full-attention, con bloque recurrente ACT/LoRA y bloques preparados para MoE |
| Parametros totales | 2.393 B (bf16 segun model card); 2.901.248.899 segun safetensors |
| Parametros activos | no disponible (los bloques MoE estan disponibles como objetivo de fine-tuning, no activos en este checkpoint) |
| Longitud de contexto | 256k posiciones nativas (RoPE theta=1e7) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 4 shards, 335 tensores) |

## Arquitectura y entrenamiento

La arquitectura OpenMythos sigue el esquema `Embed → [11 x TransformerBlock] → [RecurrentBlock] → [12 x TransformerBlock] → RMSNorm → tied Head`. Cada TransformerBlock combina atencion pre-norm con feed-forward SwiGLU (dimension 6144), e incluye de forma opcional Mixture-of-Experts, Mixture-of-Depths, cabeza de Multi-Token-Prediction, atencion dispersa (DSA) y memoria KV de largo plazo como objetivos de fine-tuning. La atencion es hibrida: 18 capas usan Gated DeltaNet lineal y 6 usan GQA completa. El vocabulario es de 248.320 tokens. La fidelidad de la conversion se documento con paridad de modulo del 0,43 % en Gated DeltaNet y coseno de 0,996 en las capas GQA, con 0 tensores faltantes o inesperados en `load_state_dict`.

El entrenamiento consistio en una fase de SFT sobre UltraChat-200k seguida de GRPO con un verificador basado en LiquidAI/d1-3B. La model card reporta que la conversion 1:1 degradó la perplejidad de 7,9467 a 11,8564 en un conjunto held-out de 12.313 tokens, y que 150 pasos de destilacion desde un profesor Qwen3.5-2B la llevaron a 6,2327 (0,78x respecto al original). En GSM8K, la precision paso del 4 % (1/24) tras la conversion al 29,2 % (7/24) tras la destilacion. Tambien se documento una edicion de pesos sin gradientes (Weight-Space Programming) que modifico 2.046 pesos bf16 (0,0163 %) en `coda.11.ffn.down.weight`, columna 869, mejorando la NLL de desarrollo de 3,0670 a 3,0564 y la held-out de 3,0452 a 3,0350, con una edicion de control de signo opuesto que empeoro ambas metricas.

## Capacidades

- Generacion de texto conversacional y de instrucciones, tras SFT sobre UltraChat-200k.
- Razonamiento matematico basico: 29,2 % en GSM8K (7/24) tras destilacion, frente al 4 % previo.
- Razonamiento multi-paso con bloque recurrente ACT/LoRA intermedio.
- Capacidad de seguir instrucciones reforzada mediante GRPO con verificador externo.
- Soporte de contexto largo: hasta 256k posiciones nativas con RoPE theta=1e7.
- Edicion de pesos sin gradientes (Weight-Space Programming) como capacidad de investigacion, no de inferencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre arquitecturas hibridas de atencion: el modelo permite estudiar el impacto de sustituir capas de atencion completa por Gated DeltaNet reutilizando pesos de un transformer denso, con metricas de paridad documentadas (0,43 % de modulo, coseno 0,996).
- Experimentacion con Weight-Space Programming: sirve como banco de pruebas para editar pesos sin gradientes y validar que las mejoras en NLL se transfieren de desarrollo a held-out, replicando el protocolo del paper arXiv:2611.09382.
- Despliegue en dispositivos de borde: con 2.393 B parametros en bf16 (5,80 GB) y atencion lineal en 18 de 24 capas, el coste de atencion crece de forma lineal con la longitud, lo que lo hace adecuado para entornos con memoria limitada y secuencias largas.
- Generacion de texto conversacional en prototipos: el SFT sobre UltraChat-200k y la perplejidad held-out de 6,2327 lo hacen util para asistentes de chat experimentales donde se prioriza el coste bajo frente a la calidad de modelos mayores.
- Destilacion y ajuste fino como base: al ser un checkpoint Apache-2.0 con pesos bf16 y configuracion documentada, puede servir como punto de partida para fine-tuning con LoRA en tareas especificas (los bloques MoE, DSA y memoria KV estan expuestos como objetivos de entrenamiento).
- Evaluacion de verificadores en RL: el pipeline GRPO con verificador LiquidAI/d1-3B documentado permite reproducir y comparar estrategias de refuerzo con recompensa basada en modelo en modelos de ~2B.

## Benchmarks y rendimiento

| Benchmark | OpenMythos-2B (convertido, pre-SFT) | OpenMythos-2B (SFT, este repo) | Qwen3.5-2B (original) |
|---|---|---|---|
| Perplejidad held-out (12.313 tokens) | 11,8564 (1,49x) | 6,2327 (0,78x) | 7,9467 (1,00x) |
| GSM8K (greedy, 24 muestras) | 4 % (1/24) | 29,2 % (7/24) tras destilacion | no disponible |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,8 GB para pesos mas overhead de activaciones y cache KV; con contexto de 256k la cache KV crece de forma significativa pese a la atencion lineal en 18 capas.
- GPU recomendadas: el autor reporta pruebas en Tesla T4 (16 GB) en bf16, por lo que cabe en GPUs de gama media como RTX 4090 (24 GB), A10G (24 GB) o L4 (24 GB).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16, y potencialmente menos con cuantizacion (no documentada).
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, y requeririan soporte para la arquitectura OpenMythos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OpenMythos-2B Edge | 2.393 B (bf16) | 256k | Apache-2.0 | Arquitectura hibrida Gated DeltaNet + GQA, SFT + GRPO, edicion de pesos documentada |
| Qwen3.5-2B | no disponible | no disponible | Apache-2.0 | Modelo base original; perplejidad held-out 7,9467 y sin datos de GSM8K en esta ficha |
| LiquidAI/d1-3B | no disponible | no disponible | no disponible | Usado como verificador en el pipeline GRPO del autor |

No se dispone de datos suficientes para comparar rendimiento con alternativas adicionales de la misma categoria.

## Limitaciones y advertencias

- La conversion arquitectonica degrada la calidad: la perplejidad sube 1,49x antes del SFT, y el SFT solo la recupera parcialmente (0,78x del original en el conjunto medido, pero con solo 12.313 tokens de evaluacion).
- GSM8K se evalua sobre 24 muestras, una muestra estadisticamente muy reducida; el 29,2 % no debe interpretarse como rendimiento robusto.
- El modelo es un experimento de investigacion; no hay evidencia de validacion en produccion ni de robustez frente a entradas adversarias.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de ~2B con SFT sobre UltraChat.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- La edicion de pesos sin gradientes es experimental: el propio autor reporta que en el paper 6 de 16 trayectorias tuvieron que revertirse por falta de transferencia.
- Aunque la licencia es Apache-2.0, los pesos derivan de Qwen3.5-2B y el autor pide mantener la atribucion al redistribuir.
- El repo ocupa 143,9 GB, muy superior al tamano del checkpoint (5,80 GB), por incluir checkpoints intermedios y `scratch_2b/`; conviene descargar solo los shards necesarios.
- No hay informacion sobre cuantizaciones, tool calling, agentes ni soporte en motores de inferencia alternativos a transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okolxc/openmythos-2b-edge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Verificador GRPO: https://huggingface.co/LiquidAI/d1-3B
- Paper de Weight-Space Programming: https://arxiv.org/abs/2611.09382
