# infosave/Clover-35B-A3B-Preview-cmf

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de difusión construido sobre el backbone Qwen3.6-35B-A3B, desarrollado por DiffuSpace. Se trata de un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, diseñado para generar texto en bloques de 32 tokens mediante pasadas repetidas de eliminación de ruido (denoising). Su tronco también puede leerse como un modelo causal convencional, lo que permite dos modos de inferencia distintos sobre los mismos pesos.

La ficha que nos ocupa, `infosave/Clover-35B-A3B-Preview-cmf`, es una cuantización del modelo base empaquetada en formato CMF para `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de aprendizaje automático, con backends para CUDA, Vulkan, Metal y CPU. El autor de la cuantización es infosave. El paquete incluye tres variantes de pesos (dos en 4 bits y una en 8 bits) con calibración GPTQ en la variante `q4tp-v2`.

La relevancia de esta ficha reside en que permite ejecutar un modelo MoE de difusión de 35B parámetros en GPUs de consumo con 24 GB de VRAM, algo que el modelo original en bf16 no permite, y con un motor de inferencia nativo (Rust) que expone una API compatible con OpenAI. El contexto declarado es de 128k tokens y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre backbone Qwen3.6-35B-A3B; 30 capas Gated DeltaNet y 10 capas de atención completa con compuerta; modelo de difusión por bloques de 32 tokens |
| Parametros totales | 35B (aproximado, según nombre del modelo) |
| Parametros activos | ~3B por token (256 expertos, top-8 más un experto compartido) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | q4tp (4 bits, GPTQ), q4tp-v2 (4 bits, GPTQ calibrado con 262k tokens), q8_2f (8 bits); atención, proyecciones Gated DeltaNet, embeddings y cabeza en 8 bits en todos los ficheros |
| Idiomas soportados | en, ru, zh (según tags de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único para el motor `cortiq`); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con mezcla de expertos: 256 expertos con enrutamiento top-8 más un experto compartido, sobre 40 capas en total (30 de Gated DeltaNet y 10 de atención completa con compuerta). La innovación principal es su naturaleza de difusión por bloques: en lugar de generar token a token de forma autorregresiva, el modelo escribe en bloques de 32 tokens mediante pasadas repetidas de denoising, lo que en teoría permite paralelizar la generación dentro de cada bloque. El tronco, no obstante, también funciona como modelo causal ordinario, y el motor `cortiq` aprovecha esto para ofrecer decodificación causal por defecto.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del paquete cuantizado menciona que la variante `q4tp-v2` se calibró con GPTQ sobre 262k tokens de texto wiki, chat y código, pero no detalla el proceso de entrenamiento del modelo original. Tampoco se especifican innovaciones como decodificación especulativa nativa (aunque el motor `cortiq` implementa auto-especulación en el modo `draft`) ni detalles sobre atención lineal más allá de las capas Gated DeltaNet.

## Capacidades

- Generación de texto en inglés, ruso y chino (según los idiomas declarados en la model card).
- Razonamiento con modo `think` opcional: el modelo genera un bloque `<think>` antes de la respuesta si no se pasa `--no-think`.
- Generación de código: la model card incluye ejemplos de funciones Python y reporta velocidades de decodificación específicas para código.
- Modo de difusión por bloques de 32 tokens con denoising de baja confianza (`CMF_CLOVER_MODE=denoise`).
- Auto-especulación (`CMF_CLOVER_MODE=draft`): una pasada de denoising propone 16 tokens y la ruta causal los verifica.
- Decodificación causal estándar (`CMF_CLOVER_MODE=ar`, por defecto).
- Servidor compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) con streaming y dashboard web.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo `think` sugiere capacidad de razonamiento encadenado, pero no se documenta integración de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Generación de código en producción con latencia controlada**: el modo causal (`ar`) alcanza 121 tok/s en una RTX 5090 y 111,5–112,5 tok/s en una RTX A5000 con CUDA, lo que permite integrar el modelo en pipelines de CI/CD para autocompletado, revisión de código o generación de tests sin depender de APIs externas.
- **Asistente conversacional multi-turno con contexto largo**: con 128k tokens de contexto, el modelo puede mantener conversaciones extensas o procesar documentos largos en una sola ventana; el servidor compatible con OpenAI facilita su integración en aplicaciones existentes.
- **Razonamiento con presupuesto de tokens controlado**: el modo `think` permite separar el razonamiento interno de la respuesta final; los parámetros de penalización (presencia 0.9, repetición 1.05) y los límites graduales hacia `</think>` tras 4096 tokens y hacia el token de parada tras 8192 tokens permiten acotar el coste.
- **Despliegue en hardware de consumo**: con 19,36 GB para `q4tp-v2`, el modelo cabe en GPUs de 24 GB (RTX 4090, RTX A5000) y en un Mac mini M4 de 24 GB (aunque en este último el decode se ejecuta en CPU a 13–18 tok/s). Es adecuado para prototipado local y entornos de desarrollo sin clúster.
- **Investigación en modelos de difusión para texto**: los tres modos de decodificación (`ar`, `draft`, `denoise`) permiten comparar empíricamente la calidad y velocidad de la generación causal frente a la de difusión por bloques sobre los mismos pesos, algo útil para estudiar el compromiso entre paralelismo y calidad.
- **Procesamiento de prompts largos en servidor**: con una RTX A5000 y CUDA, el modelo lee un prompt de 4096 tokens a 2356 tok/s (primer token en 1,7 s), lo que lo hace viable para tareas de resumen o análisis de documentos extensos en un servidor de gama media.
- **Chat interactivo local con backend Vulkan**: en GPUs AMD o Intel sin CUDA, el backend Vulkan permite ejecutar el modelo completo en una tarjeta que aloje los 18,7 GB de pesos, con 120 tok/s en una RTX 5090 y 54 tok/s en configuraciones híbridas GPU+CPU con 16 GB de VRAM.

## Benchmarks y rendimiento

La model card no reporta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye métricas de calidad y velocidad de la cuantización:

| Metrica | q4tp-v2 | q4tp | q8_2f |
|---|---:|---:|---:|
| Perplejidad wiki (causal, 12×512 tokens de wikitext-2) | 16,80 | 18,22 | 15,86 |
| Primer pase top-1 (coincidencia con PyTorch bf16) | 93/96 | 93/96 | 62/64 |
| Tamano del fichero | 19,36 GB | 19,38 GB | 35,00 GB |

Rendimiento de decodificación con `q4tp-v2`:

| Hardware | Prosa (tok/s) | Código (tok/s) | Prompt 2048 tokens (tok/s) |
|---|---:|---:|---:|
| RTX 5090 (32 GB), Vulkan | 120 | 121 | 1143 |
| 16 GB VRAM, Vulkan + CPU | 54 | 53 | no disponible |
| Mac mini M4 (24 GB), prompt en Metal, decode en CPU | 13–18 | 14–18 | ~170 |
| CPU solo, 15 núcleos Xeon | 13,8 | 10,9 | no disponible |
| RTX A5000 (24 GB), CUDA | 111,5–112,5 | no disponible | 2356 (primer token 1,7 s) |
| RTX A5000 (24 GB), Vulkan | 76 | no disponible | 445 (primer token 9,2 s) |

Modos de decodificación en RTX 5090:

| Modo | Descripción | Prosa (tok/s) | Código (tok/s) |
|---|---|---:|---:|
| `ar` (por defecto) | Decodificación causal | 120 | 121 |
| `draft` | Auto-especulación (16 tokens propuestos, verificados) | 42 | 104 |
| `denoise` | Denoising por bloques de baja confianza | 18–26 | 63–95 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 18,7 GB para el modelo completo y su cabeza en `q4tp-v2`; 19,36 GB de fichero. La variante `q8_2f` requiere 35 GB y no cabe entera en 32 GB (rinde a 46–49 tok/s en una RTX 5090).
- **GPU recomendadas**: RTX 5090 (32 GB) para máximo rendimiento; RTX A5000 o RTX 4090 (24 GB) para el modelo completo en `q4tp-v2`; GPUs con 16 GB pueden ejecutar capas iniciales en GPU y el resto en CPU (54 tok/s en prosa).
- **Cabe en GPU de consumo**: sí, en GPUs de 24 GB o más con `q4tp-v2`. En un Mac mini M4 de 24 GB se ejecuta con prompt en Metal y decode en CPU (13–18 tok/s), ya que Metal no puede mantener residentes los 19 GB de pesos.
- **Opciones de despliegue**: `cortiq` (motor nativo en Rust) con backends CUDA, Vulkan, Metal, DX12 y CPU; servidor compatible con OpenAI integrado (`cortiq serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato CMF.
- **Latencia y throughput**: en RTX A5000 con CUDA, 111,5–112,5 tok/s de decode y 2356 tok/s de lectura de prompt de 4096 tokens (primer token en 1,7 s); en Vulkan sobre la misma tarjeta, 76 tok/s y 445 tok/s (primer token en 9,2 s). En CPU sola (15 núcleos Xeon), 13,8 tok/s en prosa.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor | Notas |
|---|---|---:|---:|---|---|---|
| Clover-35B-A3B-Preview (q4tp-v2, esta ficha) | 35B | ~3B | 128k | Apache 2.0 | CMF / cortiq | Difusión por bloques + causal; 19,36 GB; 120 tok/s en RTX 5090 |
| Clover-35B-A3B-Preview (base, bf16) | 35B | ~3B | 128k | Apache 2.0 | PyTorch (Diffuspace) | Referencia de calidad; no cabe en GPU de consumo |
| Qwen3.6-35B-A3B (backbone) | 35B | ~3B | no disponible | no disponible | safetensors / múltiples | Modelo causal original sobre el que se construye Clover; sin modo difusión |
| Alternativas MoE de ~30B en 4 bits | ~30B | variable | variable | variable | GGUF / llama.cpp | No se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- **Idiomas**: la model card declara en, ru y zh; el campo `language` de los metadatos de Hugging Face solo lista `en`. El soporte real de ruso y chino no está cuantificado.
- **Riesgo de alucinación**: no se documentan evaluaciones de veracidad ni de tasas de alucinación; como todo modelo generativo, requiere verificación en producción.
- **Sesgos**: no se dispone de información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.
- **Calidad de la cuantización**: `q4tp-v2` pierde 3 de 96 filas en el primer pase top-1 frente a bf16 (fallos por empates cercanos); `q8_2f` pierde 2 de 64. La perplejidad wiki de `q4tp-v2` (16,80) es superior a la de `q8_2f` (15,86), lo que indica una degradación medible aunque pequeña.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Diffuspace/Clover-35B-A3B-Preview y del backbone Qwen3.6-35B-A3B, que no se detalla en la información proporcionada.
- **Dependencia de motor**: el formato CMF solo es compatible con `cortiq` (versión 0.8.52 o superior); no hay pesos en safetensors ni GGUF en este repositorio, lo que limita la portabilidad a otros ecosistemas.
- **Rendimiento en modo difusión**: el modo `denoise` es notablemente más lento que el causal (18–26 tok/s frente a 120 tok/s en prosa en RTX 5090), por lo que su uso en producción requiere justificación.
- **macOS**: en Apple Silicon el decode se ejecuta en CPU porque Metal no puede mantener residentes los 19 GB de pesos en un Mac de 24 GB, con la consiguiente pérdida de rendimiento (13–18 tok/s).
- **Contexto largo**: aunque se declaran 128k tokens, no se aportan métricas de calidad en ventanas largas ni de degradación con la distancia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Clover-35B-A3B-Preview-cmf
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Repositorio del motor `cortiq` / CMF: https://github.com/infosave2007/cmf
- Releases de binarios de `cortiq`: https://github.com/infosave2007/cmf/releases
