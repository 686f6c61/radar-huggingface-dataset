# IndexTeam/Index-Translate-omni-2B-FP4

## Resumen

Index-Translate-omni-2B-FP4 es la exportación cuantizada en NVFP4 del modelo multimodal Index-Translate-Omni 2B, desarrollado por IndexTeam. Se trata de un modelo de traducción omnicanal que cubre texto, imagen y voz: traduce texto multilingüe con restricciones de terminología y formato, traduce texto incrustado en imágenes y realiza reconocimiento automático de voz (ASR) junto con traducción bidireccional chino-inglés de audio. Con 2.721.801.024 parámetros reales según los pesos safetensors, se posiciona como la variante compacta de una familia que también incluye versiones de 9B y 35B-A3B.

El modelo parte de una arquitectura Qwen3.5 (tag `qwen3_5`) adaptada a tareas de traducción, con módulos de visión y audio acoplados al backbone de lenguaje. La exportación FP4 cuantiza únicamente los pesos de lenguaje en NVFP4 con escalas de activación calibradas en bloques de 16 elementos mediante NVIDIA ModelOpt 0.44, mientras que los tensores de visión se mantienen en FP32 y el encoder y conector de audio en BF16. Esta decisión de diseño busca reducir la huella de memoria del componente de lenguaje sin degradar los módulos perceptivos.

Su relevancia actual radica en dos factores. Por un lado, ofrece una solución unificada de traducción multimodal en un tamaño que cabe en hardware de gama alta de consumo, algo poco habitual en modelos que combinan visión y audio. Por otro, es una de las primeras exportaciones NVFP4 de un modelo de traducción multimodal publicada abiertamente, lo que la convierte en referencia práctica para quienes quieran evaluar el rendimiento de FP4 en tareas de traducción. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (lenguaje + visión + audio) |
| Parametros totales | 2.721.801.024 |
| Parametros activos | no disponible (no se indica que sea MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos de lenguaje, bloques de 16 elementos, escalas de activación calibradas); visión en FP32; audio en BF16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportación ModelOpt 0.44), runtime portátil propio (`joint_runtime`) |

## Arquitectura y entrenamiento

El modelo se construye sobre la familia Index-Translate, que a su vez emplea un backbone de lenguaje Qwen3.5 al que se acoplan módulos de visión y audio. La exportación FP4 conserva los tensores visuales originales en FP32 (297 tensores verificados como byte-idénticos) y el encoder y conector de audio en BF16 (529 tensores byte-idénticos), mientras que los pesos de lenguaje se cuantizan en NVFP4 con escalas de activación calibradas. Quedan excluidos de la cuantización `lm_head`, los embeddings de tokens, los módulos de atención lineal y los routers MoE; sí se cuantizan las capas `gate_proj` de los MLP ordinarios. El audit de tensores reporta 96 pesos lineales cuantizados y 225 tensores de lenguaje preservados byte-idénticos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card reproduce los resultados de benchmarks de los modelos originales (Index-Translate 2B, 9B y 35B-A3B), no del export cuantizado. La verificación realizada sobre este checkpoint incluye recarga del checkpoint, generación de texto, una llamada de descripción de imagen y una generación real de voz a inglés sobre un WAV en H100, con una perplejidad de texto de 46,5939 sobre 250 tokens de validación en modo de carga de referencia. Se trata de pruebas de humo, no de una evaluación exhaustiva de calidad.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología y formato (instrucciones de traducción).
- Traducción de texto incrustado en imágenes (image-to-text translation).
- Reconocimiento automático de voz (ASR) en chino e inglés.
- Traducción bidireccional chino-inglés de audio (speech translation).
- Generación de texto general y descripción de imágenes.
- Procesamiento conjunto de mensajes multimodal (texto, imagen, audio) mediante el runtime `JointModel`.
- Soporte de `text_generate`, `image_generate` y `audio_generate` en el runtime portátil incluido.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Traducción de documentación técnica con glosario: el modelo acepta restricciones de terminología, por lo que puede fijar traducciones consistentes de términos especializados en pipelines de localización de documentación zh-en.
- Localización de capturas de pantalla e interfaces: mediante `image_generate` se traduce el texto renderizado en imágenes, útil para adaptar interfaces y material de marketing entre chino e inglés.
- Subtitulado y transcripción bilingüe: el módulo de ASR más traducción de audio permite generar subtítulos en inglés a partir de audio en chino y viceversa en un solo paso.
- Atención al cliente en centros de contacto bilingües: transcripción y traducción de llamadas en tiempo casi real para agentes que atienden a clientes en ambos idiomas.
- Extracción y traducción de contenido en documentos escaneados: combinación de visión y traducción para digitalizar y traducir facturas, formularios o contratos con texto chino.
- Investigación en traducción multimodal: el export FP4 sirve como banco de pruebas para medir el impacto de la cuantización NVFP4 en calidad de traducción de texto, imagen y voz frente al modelo BF16 original.
- Evaluación de despliegue en hardware Blackwell: útil para equipos que quieran validar flujos de cuantización ModelOpt en producción antes de adoptar FP4 a mayor escala.

## Benchmarks y rendimiento

Los datos siguientes corresponden a los modelos originales según la model card; no son resultados del export FP4.

Traducción de texto:

| Modelo | FLORES COMET22 | WMT24++ COMET22 | WMT26 Judge | MEME |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0,8655 | 0,8489 | 60,26 | 0,6443 |
| Index-Translate-Omni 2B | 0,8655 | 0,8489 | 60,26 | 0,6443 |
| Index-Translate 9B | 0,8789 | 0,8601 | 75,35 | 0,7387 |
| Index-Translate-Omni 9B | 0,8789 | 0,8601 | 75,35 | 0,7387 |
| Index-Translate 35BA3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,7405 |
| Index-Translate-Omni 35BA3B | 0,8795 | 0,8593 | 78,01 | 0,7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore | instTrans_minor Quality / IFscore / Off-target | IFMTBench XCOMET-XXL / IFscore |
|---|---:|---:|---:|
| Index-Translate 2B | 0,5391 / 0,7569 | 0,3050 / 0,6586 / 3,97 % | 0,7712 / 0,7584 |
| Index-Translate-Omni 2B | 0,5391 / 0,7569 | 0,3050 / 0,6586 / 3,97 % | 0,7712 / 0,7584 |
| Index-Translate 9B | 0,6771 / 0,8209 | 0,5222 / 0,7725 / 3,47 % | 0,7957 / 0,8760 |
| Index-Translate-Omni 9B | 0,6771 / 0,8209 | 0,5222 / 0,7725 / 3,47 % | 0,7957 / 0,8760 |
| Index-Translate 35BA3B (preview) | 0,6901 / 0,8336 | 0,5151 / 0,7715 / 4,05 % | 0,7926 / 0,8991 |
| Index-Translate-Omni 35BA3B | 0,6867 / 0,8371 | 0,5163 / 0,7843 / 3,62 % | 0,7934 / 0,9070 |

Voz (CER en porcentaje, menor es mejor; BLEU y chrF2 mayor es mejor):

| Modelo | ASR chino CER | ASR inglés CER | Inglés → chino | Chino → inglés |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13,8113 | 34,2560 | 36,982 / 30,357 / 43,3452 | 30,747 / 51,152 / 48,0670 |
| Index-Translate-Omni 9B | 17,8917 | 14,4097 | 43,507 / 36,312 / 41,3767 | 34,656 / 55,376 / 46,3720 |
| Index-Translate-Omni 35BA3B | 18,6803 | 15,0850 | 42,081 / 35,836 / 49,2490 | 36,404 / 57,323 / 45,1546 |

Traducción de imagen (COMET22 × 100):

| Modelo | MMTIT | FLORES-rendered | Vistra |
|---|---:|---:|---:|
| Qwen3.5-2B | 52,164 | 50,187 | 55,326 |
| Index-Translate-Omni 2B | 65,809 | 53,612 | 65,596 |
| Qwen3.5-9B | 73,814 | 67,804 | 68,963 |
| Index-Translate-Omni 9B | 77,604 | 68,438 | 71,815 |
| Qwen3.5-35B-A3B | 75,602 | 70,005 | 71,067 |
| Index-Translate-Omni 35BA3B | 77,011 | 69,891 | 71,482 |

Verificación del export FP4: recarga del checkpoint y generación de texto correctas; una llamada de descripción de imagen y una generación de voz a inglés sobre WAV real en H100; perplejidad de texto de 46,5939 sobre 250 tokens. No son benchmarks de calidad.

## Requisitos de hardware

- Inferencia nativa NVFP4: requiere backend compatible con arquitectura Blackwell. H100 no es Blackwell y no soporta FP4 nativo.
- El runtime incluido (`fp4_reference.py` con ModelOpt) descomprime y descomprime los pesos a BF16 para pruebas de corrección, por lo que necesita memoria equivalente a BF16 (varios GB para el conjunto completo). No es una ruta de servicio FP4 acelerada.
- No debe usarse `AutoModelForImageTextToText.from_pretrained` directamente sobre esta exportación ModelOpt.
- El servicio nativo en Blackwell no ha sido validado según la model card.
- VRAM estimada: no disponible de forma explícita; el repo ocupa 6,0 GB y la carga de referencia en BF16 requiere memoria del orden de varios GB.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para este export; el único runtime documentado es `JointModel` con `requirements-joint.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-omni-2B-FP4 | 2,72 B | zh, en | texto, imagen, audio | Apache 2.0 | Hugging Face |
| Index-Translate-Omni 2B (BF16) | 2 B (aprox.) | zh, en | texto, imagen, audio | no disponible en la información | Hugging Face |
| Index-Translate-Omni 9B | 9 B (aprox.) | zh, en | texto, imagen, audio | no disponible en la información | Hugging Face |
| Qwen3.5-2B | 2 B (aprox.) | no disponible | texto, imagen | no disponible en la información | no disponible |

El export FP4 mantiene las mismas puntuaciones de referencia que el modelo original 2B, ya que la model card reproduce los resultados upstream. Frente al 9B, el 2B pierde aproximadamente 1,3 puntos de COMET22 en FLORES, 12 puntos en WMT26 Judge y 9,4 puntos en MEME, además de un CER de ASR en inglés notablemente peor (34,26 frente a 14,41).

## Limitaciones y advertencias

- Solo se documentan chino e inglés; no hay evidencia de soporte para castellano ni otras lenguas.
- El ASR en inglés del 2B presenta un CER de 34,26 %, muy superior al 14,41 % del 9B; la calidad de transcripción en inglés es limitada.
- La verificación del export FP4 se limita a pruebas de humo (texto, una imagen, un WAV); no hay evaluación exhaustiva de calidad tras la cuantización.
- La ruta de servicio FP4 nativa no está validada y requiere hardware Blackwell; en H100 u otras GPU solo funciona la ruta de referencia en BF16.
- La perplejidad de referencia (46,5939) se midió sobre solo 250 tokens, muestra insuficiente para conclusions robustas.
- Riesgo de alucinación en traducción de imágenes con texto poco legible y en audio con ruido; no se documentan tasas de error específicas.
- El modelo no expone mecanismos de tool calling ni agentes; su uso en pipelines complejos requiere orquestación externa.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos base (Qwen3.5) y de los datasets de evaluación citados antes de un despliegue comercial.
- El repo incluye código de runtime propio; la dependencia de ModelOpt 0.44 y de `requirements-joint.txt` añade complejidad operativa frente a un checkpoint transformers estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-2B-FP4
- Modelo original de referencia (9B): https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks publicados de Index-Translate 9B: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
