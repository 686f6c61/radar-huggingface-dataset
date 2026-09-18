# microperceptron/Kimi-Linear-48B-A3B-Instruct

## Resumen

Kimi Linear es una arquitectura de atencion hibrida desarrollada por Moonshot AI que combina atencion lineal con atencion global completa. Su nucleo es Kimi Delta Attention (KDA), una version refinada de Gated DeltaNet que introduce un mecanismo de gating mas eficiente para optimizar el uso de la memoria de estado finito de una RNN. El modelo aqui descrito, Kimi-Linear-48B-A3B-Instruct, es la variante instruct de 48.000 millones de parametros totales con aproximadamente 3.000 millones de parametros activos por token (MoE), con una ventana de contexto de 1.048.576 tokens (1M).

El problema que resuelve es el coste de memoria y computo de la atencion completa en contextos largos: segun el autor, Kimi Linear reduce la necesidad de cache KV hasta un 75% y acelera la decodificacion hasta 6 veces en contextos de hasta 1M tokens, manteniendo o superando la calidad de la atencion completa. Frente a MLA (Multi-head Latent Attention), reporta un TPOT (time per output token) 6,3 veces mas rapido en secuencias de 1M tokens.

Esta ficha corresponde al repositorio `microperceptron/Kimi-Linear-48B-A3B-Instruct`, que es una reproduccion (mirror) del modelo original publicado por `moonshotai`. La model card reproduce la documentacion oficial de Moonshot AI y remite a los pesos originales. Los checkpoints se entrenaron con 5,7 billones de tokens ("5.7T tokens") y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Kimi Delta Attention (KDA) y atencion global MLA en proporcion 3:1 |
| Parametros totales | 49.122.681.728 (~48B, dato real de safetensors) |
| Parametros activos | ~3B (arquitectura MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi Linear emplea una arquitectura hibrida que alterna capas de Kimi Delta Attention (KDA) con capas de atencion global MLA en una proporcion 3:1 (tres capas KDA por cada capa MLA). KDA es una evolucion del mecanismo Gated DeltaNet (referencia arXiv:2412.06464) que refina la regla delta con gating mas granular, lo que permite un uso mas eficiente de la memoria de estado finito propia de una RNN lineal. El modelo es un MoE de 48B parametros con solo ~3B activos por token, lo que reduce el coste de computo por token a costa de mantener todos los pesos residentes en memoria.

Segun la model card, los checkpoints se entrenaron con 5,7T tokens y se compararon con variantes de atencion completa en regimenes de contexto corto, contexto largo y escalado por RL. El autor afirma que el modelo supera a la atencion completa en diversos benchmarks, incluidos los de contexto largo y los de estilo RL. Como innovacion tecnica destacable, el kernel de KDA se libera en la libreria FLA (flash-linear-attention), y el modelo reporta una reduccion de hasta el 75% en cache KV y hasta 6x de throughput de decodificacion en contextos de 1M tokens.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`), con plantilla de chat que admite rol de sistema y de usuario.
- Razonamiento sobre contexto largo: ventana de 1M tokens, con rendimiento Pareto-optimo segun el autor en RULER a 128k.
- Razonamiento general: reporta 51,0 en MMLU-Pro a 4k de contexto.
- Escalado por RL: el autor indica que la arquitectura rinde mejor que la atencion completa en regimenes de escalado por RL.
- Capacidades de tool calling / function calling: no documentadas en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: con 1M tokens de contexto, el modelo puede procesar libros, expedientes legales o bases de codigo completas en una sola pasada sin troceado, manteniendo coherencia sobre el documento entero.
- Atencion al cliente automatizada con historial largo: la ventana de 1M tokens permite conservar conversaciones multi-turno y trazas de tickets anteriores sin resumir, reduciendo la perdida de contexto.
- Resumen y Q&A sobre corpus largos: indexacion semantica ligera sustituida por contexto directo, adecuada para pipelines de busqueda documental sobre normativa o manuales tecnicos.
- Generacion de codigo asistida en repositorios amplios: el contexto largo permite cargar varios ficheros de un repositorio a la vez para tareas de refactorizacion o revision de coherencia entre modulos.
- Agentes de investigacion de contexto largo: al reducir la cache KV hasta un 75%, el coste de memoria por sesion es menor, lo que abarata mantener muchas sesiones largas concurrentes en un endpoint vLLM.
- Procesamiento por lotes de alto rendimiento: el throughput de decodificacion hasta 6x superior en contextos largos lo hace adecuado para tareas de generacion masiva sobre entradas largas donde el coste por token decodificado domina.
- Evaluacion de razonamiento sobre benchmarks de contexto largo: util como modelo de referencia en pruebas internas de RULER o tareas sinteticas de recuperacion a 128k o mas.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Benchmark | Contexto | Resultado |
|---|---|---|
| MMLU-Pro | 4k | 51,0 |
| RULER | 128k | 84,3 (con speedup 3,98x) |
| TPOT vs MLA | 1M | 6,3x mas rapido |
| Throughput de decodificacion | hasta 1M | hasta 6x |

No se han publicado en la informacion disponible resultados comparativos con numeros de modelos alternativos concretos (MMLU, HumanEval, GSM8K u otros). No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~49,1B parametros; no confirmada por el autor):
  - bf16/fp16: ~98 GB de pesos, mas cache KV (reducida respecto a atencion completa). Requiere al menos 2x GPU de 80 GB.
  - int8: ~49 GB de pesos, viable en 1x H100 80GB o 2x A100 40GB.
  - int4: ~25-28 GB de pesos, por encima de los 24 GB de una RTX 4090 en solitario; requiere 2x GPU consumer o una GPU de 48 GB.
- GPU recomendadas: el ejemplo oficial de despliegue usa `--tensor-parallel-size 4`, lo que sugiere 4 GPUs (A100/H100) para la configuracion bf16 a contexto completo de 1M.
- GPU consumer: no cabe en una unica RTX 4090 en bf16 ni en int4 sin cuantizacion adicional o reparto entre varias GPU. Con 2x RTX 4090 o 1x A6000 48GB podria ser viable en cuantizacion de 4 bits.
- Opciones de despliegue: Hugging Face Transformers (`trust_remote_code=True`, `fla-core>=0.4.0`, `torch>=2.6`, `python>=3.10`) y vLLM con endpoint compatible con la API de OpenAI. No se documentan en la informacion disponible integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor reporta hasta 6x mas throughput de decodificacion y 6,3x mejor TPOT que MLA en secuencias de 1M tokens. No se ofrecen valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Tipo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct | ~48B | ~3B | 1M | Hibrida KDA + MLA (3:1) | MIT | Hugging Face (moonshotai y mirror) |
| Kimi-Linear-48B-A3B-Base | ~48B | ~3B | 1M | Hibrida KDA + MLA (3:1) | MIT | Hugging Face (moonshotai) |
| Modelos MoE de ~48B con atencion completa | no disponible | no disponible | no disponible | Atencion completa | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks que permitan una comparacion numerica con modelos alternativos de la misma categoria. Unicamente se documentan comparaciones internas frente a atencion completa y frente a MLA, sin cifras de rivales concretos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo generativo, por lo que se debe validar la salida en tareas factuales.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, no se documenta la degradacion de calidad en funcion de la posicion dentro de la ventana.
- Idiomas: no se especifica la cobertura linguistica, por lo que no se puede garantizar calidad fuera del ingles o el chino sin evaluacion previa.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion. El repositorio analizado es un mirror no oficial (`microperceptron`), por lo que conviene verificar los pesos originales de `moonshotai` antes de desplegar en produccion.
- Dependencias tecnicas: requiere `fla-core>=0.4.0`, `torch>=2.6` y `trust_remote_code=True`; el codigo personalizado (`custom_code`) implica ejecutar codigo remoto, con el riesgo de seguridad asociado.
- Complejidad de despliegue: el estado del arte en cuantizacion (GGUF, Ollama, TGI) no esta documentado para esta arquitectura, lo que puede limitar las opciones de despliegue fuera de Transformers y vLLM.
- Fecha del mirror: el repositorio de `microperceptron` registra fecha de creacion 2026-09-18, posterior a la publicacion original; su contenido puede no estar sincronizado con la version oficial.

## Enlaces

- Modelo en Hugging Face (mirror analizado): https://huggingface.co/microperceptron/Kimi-Linear-48B-A3B-Instruct
- Modelo original instruct: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Modelo original base: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Base
- Paper en Hugging Face Papers: https://huggingface.co/papers/2510.26692
- Codigo oficial: https://github.com/MoonshotAI/Kimi-Linear
- Kernel KDA en FLA: https://github.com/fla-org/flash-linear-attention/tree/main/fla/ops/kda
- Paper de Gated DeltaNet: https://arxiv.org/abs/2412.06464
