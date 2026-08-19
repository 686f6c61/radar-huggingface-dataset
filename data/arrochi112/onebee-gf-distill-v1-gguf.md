# arrochi112/onebee-gf-distill-v1-gguf

## Resumen

`onebee-gf-distill-v1-gguf` es la conversión a formato GGUF del checkpoint `onebee-gf-distill-v1`, el mejor resultado hasta la fecha del proyecto open-source **small-mind-companion** de arrochi112. Este proyecto investiga el post-entrenamiento y la arquitectura de memoria en modelos pequeños, aplicando una cadena de LoRA SFT, LoRA DPO y destilación on-policy desde un teacher de clase 8B sobre el modelo base `google/gemma-4-E2B-it`. El resultado es un modelo multimodal (texto e imagen) de aproximadamente 2B parámetros efectivos, orientado a conversación tipo "companion" y diseñado para ejecutarse en dispositivos locales mediante `llama.cpp`.

La relevancia de este modelo radica en que demuestra que es posible obtener un comportamiento conversacional coherente y con personalidad en un modelo pequeño mediante técnicas de destilación y alineación, sin necesidad de infraestructura de servidor. Incluye 12 niveles de cuantización (F16 a Q2_K) más un proyector de visión, lo que permite ajustar el equilibrio entre calidad y consumo de recursos. Sin embargo, la cuantización Q2_K se ha verificado como rota en pruebas de generación real, por lo que no es utilizable. El modelo hereda la licencia Apache-2.0 y una ventana de contexto de 131 072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (multimodal, texto + vision) |
| Parametros totales | 4 628 569 635 (safetensors); ~2B efectivos + LoRA rank 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens (heredado del base) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (roto) + mmproj F16 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el checkpoint fuente) |

## Arquitectura y entrenamiento

El modelo se basa en `google/gemma-4-E2B-it`, una arquitectura Gemma4 multimodal que procesa tanto texto como imagenes. Sobre este base se aplico un adaptador LoRA de rango 16, entrenado en tres fases secuenciales: primero un ajuste fino supervisado (SFT), luego una optimizacion mediante DPO (Direct Preference Optimization) y finalmente una destilacion on-policy desde un teacher de clase 8B. Este ultimo paso es la innovacion clave: el modelo pequeño aprende a imitar las respuestas del teacher en politicas de generacion propias, lo que mejora la coherencia y el estilo conversacional sin aumentar el numero de parametros.

El checkpoint resultante se convirtio a GGUF para su uso con `llama.cpp`, incluyendo un proyector de vision separado (`mmproj-distill-v1-f16.gguf`) necesario para entrada de imagenes. La cuantizacion se realizo en 12 niveles, aunque las pruebas de generacion real detectaron que Q2_K produce salida corrupta con bucles de repeticion, por lo que se recomienda usar Q3_K_S o superior.

## Capacidades

- Generacion de texto conversacional con estilo "companion": respuestas empaticas, coherentes y con personalidad, verificadas en cuantizaciones Q3_K_S, Q3_K_M, Q4_K_S y Q4_K_M.
- Entrada multimodal de texto e imagenes: el proyector de vision permite al modelo describir o razonar sobre contenido visual.
- Inferencia local en dispositivos sin runtime de Python ni `transformers`, gracias al formato GGUF y la compatibilidad con `llama.cpp`.
- Soporte de contexto largo (131 072 tokens) para conversaciones multi-turno extensas.
- No se menciona soporte explicito de tool calling ni function calling en la informacion disponible.
- Idioma unico: ingles.

## Casos de uso

- Asistente conversacional personal en dispositivos moviles o edge: el modelo puede ejecutarse en local con `llama.cpp` usando cuantizaciones Q4_K_M (3.42 GB) o Q3_K_M (3.19 GB), ofreciendo respuestas coherentes sin conexion a internet.
- Aplicaciones de compania o role-play: su entrenamiento especifico en estilo "companion" lo hace adecuado para chatbots de apoyo emocional o entretenimiento, siempre que se eviten usos en contextos de seguridad critica.
- Prototipado de agentes conversacionales con memoria larga: la ventana de 131 072 tokens permite mantener el historial de una conversacion muy extensa, util para estudios de UX o demos.
- Investigacion en destilacion y cuantizacion: el proyecto publica el proceso completo (SFT, DPO, destilacion) y los resultados de cuantizacion, por lo que sirve como referencia para estudiar el impacto de la cuantizacion en modelos destilados.
- Generacion de descripciones de imagenes en local: gracias al proyector de vision, se puede usar para anotar fotos o asistir a personas con discapacidad visual, sin depender de APIs externas.
- Educacion y experimentacion en IA generativa: al ser Apache-2.0 y tener un tamano reducido, es un candidato ideal para ensenar tecnicas de fine-tuning, cuantizacion y despliegue en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada consiste en pruebas cualitativas de generacion con un prompt de sistema tipo companion ("What is your favorite color?"), cuyos resultados se resumen en la siguiente tabla:

| Quant | Resultado |
|---|---|
| Q4_K_S | Coherente, en personaje: *"soft white... calm and open, without being cold or stark"* |
| Q3_K_M | Coherente, en personaje: *"amber—the soft, buttery glow right before sunset"* |
| Q3_K_S | Coherente, en personaje: *"emerald... like the color of moss after a spring rain"* |
| Q2_K | Roto: tokens especiales corruptos seguidos de un bucle de repeticion sin terminacion |

No hay mediciones de latencia ni throughput en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF elegido. Por ejemplo, Q4_K_M (3.42 GB) y Q3_K_M (3.19 GB) caben en GPUs con 4 GB de VRAM; Q8_0 (4.95 GB) requiere al menos 6 GB; F16 (9.27 GB) necesita 10-12 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090 (24 GB). Para CPU, es viable con 8 GB de RAM y el modo `--mmap`.
- Si cabe en consumer GPU: si, la mayoria de las cuantizaciones Q4 y Q3 caben en GPUs de gama media (4-8 GB). Q2_K no es utilizable.
- Opciones de despliegue: `llama.cpp` (incluye `llama-cli` y `llama-mtmd-cli` para vision), tambien compatible con servidores como `llama-server` y herramientas como Ollama si se importa el GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia estructural, se puede comparar con el modelo base `google/gemma-4-E2B-it` (del que deriva) y con otros modelos pequeños de la familia Gemma. Sin embargo, no hay mediciones objetivas que permitan una comparativa cuantitativa fiable. Se recomienda consultar el repositorio del proyecto para obtener mas detalles sobre la evaluacion interna (PMB eval harness).

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| onebee-gf-distill-v1-gguf | ~2B efectivos | 131 072 | Apache-2.0 | GGUF | Destilado, multimodal, companion |
| google/gemma-4-E2B-it | ~2B (base) | 131 072 | Apache-2.0 | safetensors | Modelo base sin fine-tuning |
| Otros modelos 2B (p.ej. Qwen2.5-1.5B) | 1.5B | 32 768 | Apache-2.0 | safetensors/GGUF | No multimodal, sin destilacion companion |

## Limitaciones y advertencias

- La cuantizacion Q2_K esta rota para este checkpoint: produce tokens especiales corruptos y un bucle de repeticion sin terminacion. No debe usarse bajo ninguna circunstancia.
- No se ha medido la perdida de calidad respecto al checkpoint original en cada nivel de cuantizacion; solo se ha verificado coherencia cualitativa en Q3_K_S y superiores.
- El modelo solo soporta ingles; no hay soporte multilingue.
- No ha sido evaluado para usos de seguridad critica, asesoramiento medico, legal o financiero. Es un artefacto de investigacion y no debe desplegarse en produccion donde un error pueda causar dano real.
- Al ser una destilacion, puede presentar alucinaciones o respuestas demasiado confiadas, especialmente en temas factuales.
- La ventana de contexto de 131 072 tokens es heredada del base, pero el rendimiento real en contextos muy largos no ha sido verificado para este checkpoint.
- No se reporta soporte de tool calling, agentes ni razonamiento multi-paso explicito.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/arrochi112/onebee-gf-distill-v1-gguf
- Checkpoint fuente (safetensors): https://huggingface.co/arrochi112/onebee-gf-distill-v1
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Version GGUF pre-destilacion: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf
- Repositorio del proyecto small-mind-companion: https://github.com/arrogance231/small-mind-companion
- Documentacion de resultados de cuantizacion: https://github.com/arrogance231/small-mind-companion/blob/main/docs/quantization_results.md
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
