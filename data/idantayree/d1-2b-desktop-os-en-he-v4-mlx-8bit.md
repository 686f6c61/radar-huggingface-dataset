# IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit

## Resumen

`d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit` es un ajuste fino (fine-tune) del modelo `LiquidAI/d1-2B-MLX-8bit`, desarrollado por el usuario IdanTayree y publicado en Hugging Face. No es un modelo conversacional de propósito general, sino un modelo de decisión y localización visual (visual grounding) de un solo paso hacia delante, diseñado para actuar como ejecutor de interfaz de usuario de "Sistema 1" y como puerta de seguridad (safety gate) en aplicaciones de automatización de escritorio (computer-use). Se distribuye en formato MLX de 8 bits y está pensado para ejecutarse en Apple Silicon (M1–M5).

El modelo parte de la arquitectura `lfm3_vl` de Liquid AI (familia LFM3, multimodal image-text-to-text) con 1.918.181.888 parámetros reales según los safetensors, lo que corresponde a la clase de 2B. Su especialización es doble: por un lado, localización de elementos de interfaz (texto e iconos) en capturas de pantalla de macOS, Windows y web; por otro, calibración de seguridad bilingüe inglés-hebreo (incluido RTL) para puntuar acciones destructivas antes de ejecutarlas.

Es relevante ahora porque aborda un nicho concreto de los agentes de escritorio: la selección fiable de objetivos visuales y la evaluación de riesgo de acciones, con un coste de despliegue muy bajo (unos 2,06 GiB de pesos) y sin necesidad de adaptadores adicionales. El autor reporta mejoras medibles sobre el modelo base en el benchmark público ScreenSpot-v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm3_vl` (Liquid AI, familia LFM3), multimodal image-text-to-text; modelo de decisión de un solo forward pass |
| Parametros totales | 1.918.181.888 (~1,92B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el autor publica tambien una variante GGUF con `Q8_0` y `Q4_K_M` |
| Idiomas soportados | en, he, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | `lfm1.0` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (MLX 8-bit); libreria `mlx` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura multimodal `lfm3_vl` de Liquid AI, que combina un codificador visual con un modelo de lenguaje para tareas image-text-to-text. A diferencia de un LLM generativo, `d1-2B` es un modelo de decisión calibrado: sus salidas son lecturas estructuradas (`Noul` sí/no, `Choice` de objetivo, `Box` de caja delimitadora y `score`), producidas en un único paso hacia delante. El fine-tune parte de `LiquidAI/d1-2B-MLX-8bit` y se distribuye como un modelo fusionado (fused) de 8 bits sin adaptadores adicionales, compatible directamente con `mlx-vlm` (versión 0.7.11 o superior) mediante `model.system_one()`.

Según la model card, el ajuste se realizó con LoRA sobre maquetas de interfaz sintéticas, sin usar imágenes ni etiquetas de ScreenSpot-v2 durante el entrenamiento. La especialización cubre la localización de elementos en macOS, Windows y web, y la calibración de seguridad bilingüe inglés-hebreo. El autor menciona una aserción de solapamiento cero (`QA72_FORBIDDEN_SET`) en la generación del conjunto de datos para garantizar que las pruebas de seguridad hebreas quedaran fuera del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Localización visual de elementos de interfaz (texto e iconos) en capturas de pantalla de macOS, Windows y web, devolviendo cajas delimitadoras.
- Decisión binaria calibrada (`Noul`, sí/no) para evaluar si una acción es segura o adecuada.
- Selección de objetivo (`Choice`) entre opciones de interfaz.
- Puntuación de seguridad (`score`) para acciones destructivas, con calibración específica en inglés y hebreo (incluido texto RTL).
- Procesamiento multimodal image-text-to-text: recibe imagen y texto, produce la lectura estructurada correspondiente.
- Soporte multilingüe declarado en 17 idiomas, aunque la especialización real documentada es inglés-hebreo.
- Integración como ejecutor de "Sistema 1" en agentes de escritorio (proyecto Maestro) y como puerta de seguridad previa a la ejecución de acciones.
- No es un modelo de chat ni de generación libre de texto; su uso previsto son las lecturas estructuradas mencionadas.

## Casos de uso

- Automatización de escritorio (computer-use): un agente recibe una instrucción en lenguaje natural, captura la pantalla y usa el modelo para localizar el elemento objetivo (botón, icono, campo de texto) mediante la lectura `Box`, habilitando clics precisos en macOS y Windows.
- Puerta de seguridad previa a acciones destructivas: antes de ejecutar un borrado, una compra o un cambio de configuración, el agente consulta la lectura `score`/`Noul` para decidir si la acción es segura; la calibración bilingüe inglés-hebreo es adecuada para entornos con interfaz en hebreo.
- Agentes de navegación web: localización de enlaces, botones e iconos en páginas web (foros, tiendas, GitLab, herramientas) para rellenar formularios o navegar de forma autónoma.
- Asistentes de accesibilidad: interpretación de capturas de pantalla para guiar a usuarios con dificultades visuales hacia elementos concretos de la interfaz mediante descripciones y coordenadas.
- Pruebas automatizadas de interfaz (UI testing): verificación de que los elementos esperados aparecen en las coordenadas correctas en distintas plataformas, usando la lectura `Box` como oráculo de localización.
- Ejecución local en Apple Silicon: despliegue en un Mac (M1–M5) como componente de un agente de escritorio sin depender de la nube, gracias a los ~2,06 GiB de pesos en 8 bits y a la compatibilidad con `mlx-vlm`.
- Filtrado de acciones en pipelines de agentes multi-paso: el modelo actúa como verificador rápido de bajo coste entre pasos de un agente mayor, evaluando el riesgo de cada acción propuesta antes de ejecutarla.

## Benchmarks y rendimiento

El autor reporta resultados en el benchmark público `OS-Copilot/ScreenSpot-v2` (771 capturas reales de macOS, Windows y web, sin solapamiento con el entrenamiento, métrica estricta center-in-box con `pad = 0.0`). Comparación con el modelo base `LiquidAI/d1-2B-MLX-8bit`:

| Split de ScreenSpot-v2 (N) | Base | Este modelo (v4.0, 8 bits) | Delta |
|---|---:|---:|---:|
| Combinado Desktop + Web (771) | 78,86% (IoU 0,496) | 89,62% (IoU 0,628) | +10,76 pp |
| Desktop global (334) | 81,44% (IoU 0,471) | 92,81% (IoU 0,601) | +11,37 pp |
| Web global (437) | 76,89% (IoU 0,515) | 87,19% (IoU 0,649) | +10,30 pp |

Desglose por sub-split (los 14 sub-splits mejoran):

| Plataforma y tipo (N) | Base | Este modelo | Delta |
|---|---:|---:|---:|
| Desktop · Windows texto (96) | 80,21% | 92,71% | +12,50 pp |
| Desktop · Windows icono (63) | 79,37% | 93,65% | +14,28 pp |
| Desktop · macOS texto (84) | 83,33% | 95,24% | +11,91 pp |
| Desktop · macOS icono (63) | 82,54% | 87,30% | +4,76 pp |
| Desktop · Shop texto (14) | 92,86% | 100,00% | +7,14 pp |
| Desktop · Shop icono (14) | 71,43% | 92,86% | +21,43 pp |
| Web · Forum texto (40) | 75,00% | 90,00% | +15,00 pp |
| Web · Forum icono (39) | 69,23% | 89,74% | +20,51 pp |
| Web · GitLab texto (44) | 86,36% | 95,45% | +9,09 pp |
| Web · GitLab icono (29) | 79,31% | 89,66% | +10,35 pp |
| Web · Shop texto (84) | 89,29% | 94,05% | +4,76 pp |
| Web · Shop icono (81) | 71,60% | 81,48% | +9,88 pp |
| Web · Tool texto (66) | 66,67% | 78,79% | +12,12 pp |
| Web · Tool icono (54) | 75,93% | 83,33% | +7,40 pp |

En calibración de seguridad bilingüe (conjuntos retenidos, sin solapamiento con el entrenamiento):

| Benchmark de seguridad | Base | Este modelo | Delta |
|---|---:|---:|---:|
| Hebreo `QA-72` (prefijado @ 0,20) | 14/16 (87,5%) | 16/16 (100,0%) | +12,5 pp |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, lo cual es coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM/peso: los pesos en 8 bits ocupan 2,06 GiB; el repositorio completo ocupa 4,5 GB. Al ser MLX, se ejecuta en memoria unificada de Apple Silicon, no en VRAM de GPU discreta.
- GPU recomendadas: Apple Silicon M1–M5 (macOS). No está pensado para CUDA ni para GPUs NVIDIA/AMD en este formato.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon, dado el reducido tamaño de los pesos.
- Opciones de despliegue: `mlx-vlm` (versión 0.7.11 o superior) en macOS. El autor publica además una variante GGUF compatible con `llama.cpp` (b11960+) para Windows, Linux y macOS (CPU / CUDA / Vulkan / Metal), con pesos `Q8_0` (1,72 GiB) y `Q4_K_M` (1,02 GiB) más `mmproj`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| `IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit` (este) | ~1,92B | no disponible | MLX 8-bit, safetensors (y GGUF aparte) | `lfm1.0` | Grounding de UI + seguridad bilingüe EN/HE |
| `LiquidAI/d1-2B-MLX-8bit` (base) | ~1,92B | no disponible | MLX 8-bit | `lfm1.0` | Grounding y decisión general, sin especialización EN/HE |
| `IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-GGUF` (misma familia) | ~1,92B | no disponible | GGUF (`Q8_0`, `Q4_K_M`) + `mmproj` | `lfm1.0` | Misma especialización, multiplataforma (CPU/CUDA/Vulkan/Metal) |

No se dispone en la información proporcionada de comparaciones con otros modelos de grounding de UI de la competencia (por ejemplo, de otros autores o familias), por lo que no se incluyen aquí.

## Limitaciones y advertencias

- No es un LLM conversacional: no debe usarse para generación de texto libre ni chat; sus salidas previstas son `Noul`, `Choice`, `score` y `Box`.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento con maquetas sintéticas puede no cubrir toda la variedad de interfaces reales.
- Riesgo de alucinación de cajas: aunque la métrica reportada es alta, un 10,38% de fallo en el combinado Desktop+Web implica que algunas localizaciones serán incorrectas; en producción conviene validar la acción antes de ejecutarla.
- Cobertura de idiomas: aunque declara 17 idiomas, la especialización documentada es inglés-hebreo; el rendimiento en el resto no está verificado.
- Restricciones de licencia: licencia `lfm1.0` (etiquetada como `other`); es necesario revisar los términos antes de un uso comercial.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon; para otras plataformas hay que recurrir a la variante GGUF.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar conversaciones o capturas de gran resolución.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit
- Variante GGUF: https://huggingface.co/IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-2B-MLX-8bit
- Proyecto Maestro: https://github.com/IdanTayree/Maestro
- Benchmark ScreenSpot-v2: https://huggingface.co/datasets/OS-Copilot/ScreenSpot-v2
- Licencia LFM1.0: https://huggingface.co/IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit/blob/main/LICENSE
