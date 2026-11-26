# Raiden112/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es una cuantización Q4_K_M publicada por el usuario Raiden112 del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, desarrollado originalmente por NVIDIA Corporation. Se trata de un modelo de lenguaje pequeno (SLM) derivado por post-entrenamiento de Gemma-4-E4B-it, orientado a asistentes locales de voz y dispositivo, personas interactivas e interfaces embebidas donde la memoria y el tiempo hasta el primer token (TTFT) son criticos.

El modelo emplea la arquitectura Gemma-4-E4B con 8B parametros totales y 4B efectivos, y una ventana de contexto de hasta 64K tokens tanto de entrada como de salida. Esta publicacion concreta reduce el peso a un fichero GGUF de aproximadamente 7,2 GB, lo que permite ejecucion en llama.cpp con aceleracion GPU y deja margen de memoria para la aplicacion anfitriona o para pipelines de modelos adyacentes.

Su relevancia actual radica en que combina capacidades conversacionales heredadas de Gemma con mejoras especificas en uso de herramientas multi-turno, seguimiento de instrucciones y anclaje de entrada (input grounding), todo bajo licencia OpenMDW-1.1 que permite uso comercial. Incluye soporte de modo razonamiento (thinking) y modo conversacional controlables desde la plantilla de chat, y dispone de un drafter DFlash para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (transformer, segun modelo base) |
| Parametros totales | 7.518.069.290 (segun safetensors); la model card indica 8B totales / 4B efectivos |
| Parametros activos | 4B efectivos (segun model card) |
| Longitud de contexto | Entrada: hasta 64K tokens; salida: hasta 64K tokens |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); existe version BF16 en el modelo base |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | GGUF (Q4_K_M); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma-4-E4B, sobre la que NVIDIA aplica un post-entrenamiento adicional. La model card indica 8B parametros totales con 4B efectivos, lo que sugiere un diseno con parametros compartidos o parcialmente activos, aunque la informacion proporcionada no detalla el mecanismo exacto. El contexto alcanza 64K tokens de entrada y 64K de salida, adecuado para conversaciones multi-turno prolongadas y para tareas de agente con historial extenso.

El post-entrenamiento se realizo sobre los datasets nvidia/nemotron-post-training-v3 y nvidia/nemotron-pre-training-datasets, con fecha de corte de los datos de post-entrenamiento en mayo de 2026. Las fechas del modelo abarcan de diciembre de 2025 a mayo de 2026. La model card menciona mejoras especificas en uso de herramientas multi-turno, seguimiento de instrucciones y anclaje de entrada. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Como innovacion destacable, el modelo soporta decodificacion especulativa mediante un drafter DFlash companero (NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash), con hasta 7 tokens de borrador por paso.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en asistencia local y personas interactivas.
- Uso de herramientas (tool calling) multi-turno mejorado respecto al modelo base.
- Seguimiento de instrucciones y anclaje de entrada (input grounding) reforzados.
- Modo razonamiento controlable mediante plantilla de chat (`enable_thinking=True/False`) y presupuesto de pensamiento en tiempo de ejecucion.
- Modo conversacional controlable mediante plantilla de chat (`conversational_mode=True/False`).
- Soporte multilingue en 34 idiomas, incluidos espanol, ingles, aleman, frances, portugues, chino, japones, coreano, arabe, hindi y ruso, entre otros.
- Capacidad de decodificacion especulativa con el drafter DFlash para reducir latencia.
- No se indica soporte de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistentes de voz locales: el modelo esta disenado para baja memoria y bajo TTFT, por lo que puede gestionar conversaciones de voz multi-turno en dispositivos con recursos limitados, manteniendo contexto gracias a sus 64K tokens de ventana.
- Interfaces embebidas y de borde: al ocupar aproximadamente 7,2 GB en Q4_K_M, puede desplegarse en hardware de borde con GPU discreta o integrada, dejando memoria libre para la aplicacion anfitriona.
- Personas interactivas: el modo conversacional controlable y las capacidades conversacionales heredadas de Gemma permiten crear personajes con respuestas rapidas y coherentes en sesiones largas.
- Agentes con uso de herramientas: el modelo mejora el tool calling multi-turno, lo que lo hace adecuado para agentes que encadenan llamadas a APIs o funciones en varios pasos dentro de un flujo conversacional.
- Asistencia en dispositivos sin conectividad: al ejecutarse con llama.cpp de forma local, puede ofrecer asistencia textual y conversacional en entornos sin acceso a la nube, con soporte de 34 idiomas.
- Prototipado rapido de aplicaciones conversacionales: la disponibilidad en GGUF y el servidor compatible con la API de OpenAI (`/v1/chat/completions`) permiten integrar el modelo en prototipos y demos con herramientas estandar.
- Reduccion de latencia en produccion: combinado con el drafter DFlash para decodificacion especulativa, puede emplearse en pipelines donde el tiempo de respuesta por token es critico, como asistentes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB solo para los pesos en Q4_K_M; debe anadirse memoria para el contexto KV y el overhead de llama.cpp, por lo que se recomienda un minimo de 10-12 GB de VRAM para contexto moderado.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el ejemplo oficial usa `--gpus all` con llama.cpp compilado para CUDA 13.
- Cabe en GPU de consumo: si, en principio en tarjetas con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090), aunque el dato exacto no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (servidor CUDA, imagen `ghcr.io/ggml-org/llama.cpp:server-cuda13-b11459`), con soporte de `--jinja`, `-ngl 999` y `-c 65536`; tambien disponible a traves de transformers segun los tags del repositorio.
- Decodificacion especulativa: soportada con el drafter DFlash mediante `--spec-draft-model`, `--spec-type draft-dflash` y `--spec-draft-n-max 7`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (esta ficha) | 7.518.069.290 totales; 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 | GGUF Q4_K_M |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales / 4B efectivos (segun model card) | 64K entrada / 64K salida | OpenMDW-1.1 | BF16 |
| Gemma-4-E4B-it | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion sobre sesgos conocidos no esta disponible en la documentacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documenta una mitigacion especifica en la informacion disponible.
- La model card indica que el despliegue en llama.cpp tiene una "recipe pending", por lo que la receta de ejecucion puede no estar finalizada.
- El modelo es una cuantizacion Q4_K_M, lo que implica una perdida de precision respecto a la version BF16; para tareas sensibles a la fidelidad numerica o de razonamiento conviene evaluar la version BF16.
- La fecha de corte de los datos de post-entrenamiento es mayo de 2026, por lo que no cubre informacion posterior.
- Aunque la licencia OpenMDW-1.1 permite uso comercial, deben revisarse los terminos completos del acuerdo antes de su adopcion en produccion.
- El repositorio es una publicacion de un tercero (Raiden112) sobre el modelo de NVIDIA; conviene verificar la integridad y procedencia de los pesos antes de usarlos en entornos criticos.
- No se documentan capacidades de vision ni audio, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raiden112/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo Gemma-4-E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Blog del modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
