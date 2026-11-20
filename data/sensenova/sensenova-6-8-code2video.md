# sensenova/SenseNova-6.8-Code2Video

## Resumen

SenseNova 6.8 Code2Video es un modelo de lenguaje multimodal especializado en la creación de vídeo mediante generación de código, desarrollado por SenseTime bajo el paraguas de OpenSenseNova. Se trata de un fine-tuning de Qwen3.8-27B orientado a un flujo de trabajo concreto: el modelo escribe código ejecutable que construye y renderiza vídeos, en lugar de generar píxeles directamente. El modelo está pensado para orquestar herramientas de generación de imagen, vídeo, modelado 3D y edición, encadenando generación, edición y composición en un único pipeline creativo.

Con 27.356.728.560 parámetros (aproximadamente 27B), una ventana de contexto de 512K tokens y licencia Apache 2.0, el modelo apunta a tareas de horizonte largo: según la model card, puede sostener ejecuciones de más de 10 horas y más de 2.000 turnos en un arnés tipo Claude Code. Su enfoque en código como interfaz universal entre modelos y herramientas creativas lo posiciona como una pieza de orquestación más que como un generador de vídeo end-to-end.

La relevancia actual del modelo radica en su propuesta de "code-driven video creation": usar código como punto de entrada para conectar distintos modelos generativos y herramientas de edición. Es un primer paso declarado por el autor hacia un modelo que coordine múltiples modelos generativos a través de código para producir contenido digital en distintos medios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen3.8-27B; tag `qwen3_5` en Hugging Face) |
| Parametros totales | 27.356.728.560 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512K tokens (524.288) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3.8-27B, según declara la model card. La arquitectura subyacente es un transformer denso de aproximadamente 27B parámetros, con una ventana de contexto extendida a 512K tokens. El pipeline declarado en Hugging Face es `image-text-to-text`, lo que indica capacidad de entrada multimodal (imagen y texto) además de generación de texto. El tag `qwen3_5` sugiere que la base pertenece a la familia Qwen3.5.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card sí describe el enfoque de entrenamiento funcional: el modelo genera código ejecutable que construye y renderiza vídeo, y se distribuye junto con "example trajectories" (logs de mensajes y llamadas a herramientas) y una "production skill" en GitHub con flujo de trabajo, guías de craft y herramientas de renderizado. La innovación destacable es el uso del código como lenguaje intermedio para encadenar modelos de generación de imagen, vídeo, 3D y edición.

## Capacidades

- Generación de código ejecutable para construir y renderizar vídeo (motion design, kinetic type, data stories, character animation, product promos, math explainers, paper-craft films, isometric worlds).
- Orquestación de herramientas: el código generado puede invocar modelos de generación de imagen, generación de vídeo, modelado 3D y edición de vídeo.
- Tool calling / function calling: soportado vía parsers `qwen3_coder` en vLLM y SGLang, y `--enable-auto-tool-choice`.
- Razonamiento multi-turno y de horizonte largo: ejecuciones de más de 10 horas y más de 2.000 turnos según la model card.
- Modo de razonamiento: parser `qwen3` configurable en vLLM y SGLang.
- Capacidades multimodales de entrada: pipeline `image-text-to-text` (imagen + texto).
- Capacidades multilingües limitadas a inglés y chino.
- Integración recomendada con Claude Code como arnés de ejecución.

## Casos de uso

- Creación de vídeos explicativos de matemáticas: el modelo genera código que dibuja y anima conceptos matemáticos, renderizando cada fotograma de forma programática y permitiendo revisar y corregir el resultado turno a turno.
- Motion design y kinetic typography: producción de piezas cortas de tipografía animada completamente en código, con control preciso de composición y coreografía de movimiento.
- Data stories y visualizaciones animadas: generación de vídeos que animan datos y gráficos, encadenando librerías de visualización y renderizado dentro del mismo pipeline de código.
- Promocionales de producto: el modelo escribe código que compone escenas, llama a modelos de generación de imagen para assets y renderiza el vídeo final, integrándose en un flujo de producción creativa.
- Animación de personajes y mundos isométricos: construcción de escenas y animaciones mediante código, con la posibilidad de invocar herramientas 3D para geometría y renderizado.
- Automatización de pipelines creativos en CI/CD: al ser un modelo de código con tool calling, puede integrarse en flujos automatizados que generen, rendericen y revisen piezas de vídeo sin intervención manual, aprovechando su contexto de 512K para mantener el estado de proyectos largos.
- Orquestación de estudios creativos: uso como capa de coordinación que llama a distintos modelos generativos (imagen, vídeo, 3D, edición) a través de código, unificando generación, edición y composición en un único workflow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 27B parámetros en safetensors (repo de 109,6 GB), la inferencia en precisión completa requiere múltiples GPU; los ejemplos oficiales usan `--tp 4` (tensor parallel de 4 GPU).
- GPU recomendadas: los comandos de despliegue de la model card asumen 4 GPU con `--tp 4` / `--tensor-parallel-size 4` / `--tp-size 4`; no se especifica el modelo exacto (A100, H100, etc.).
- Compatibilidad con GPU de consumo: no disponible. Un modelo de 27B en cuantización baja podría caber en GPUs de consumo de gama alta, pero no se confirma en la información proporcionada.
- Opciones de despliegue: LightLLM, vLLM (imagen `vllm/vllm-openai:latest`), SGLang (`lmsysorg/sglang:latest`). Todos con soporte de contexto largo (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1`).
- Latencia y throughput: no disponibles.
- Configuración de contexto largo: `--max-model-len 524288` en vLLM, `--context-length 524288` en SGLang, `--max_req_total_len 524288` en LightLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova 6.8 Code2Video | ~27B | 512K | Code-driven video creation (fine-tuning de Qwen3.8-27B) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | ~27B | no disponible en esta ficha | LLM multimodal generalista | no disponible en esta ficha | no disponible en esta ficha |
| SenseNova-U1 | no disponible | no disponible | Multimodal (imagen y contenido) | no disponible | GitHub / SenseNova-Studio |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Enfoque restringido a vídeos cortos implementados íntegramente en código; el autor indica que la extensión a edición, composición, animación y creación 3D es trabajo futuro.
- Riesgo de alucinación en la generación de código: errores en el código producido pueden traducirse en fallos de renderizado o resultados visuales incorrectos, lo que exige revisión de fotogramas y ciclos de corrección.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias de las herramientas y modelos invocados por el código generado.
- Requisitos de infraestructura elevados: 27B parámetros y contexto de 512K implican despliegues multi-GPU para producción.
- Dependencia de un arnés externo (Claude Code recomendado) y de configuración específica (`CLAUDE_CODE_MAX_CONTEXT_TOKENS`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS`) para ejecuciones de horizonte largo.
- No se han publicado benchmarks que permitan validar cuantitativamente la calidad del modelo frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- GitHub (skill, prompts y herramientas): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Trayectorias de ejemplo: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video/blob/main/trajectories/all.openai.jsonl
- Skill de producción: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video/tree/main/skills/code-video
- Launch film: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video/resolve/main/media/launch/sensenova_codevideo_launch_film.mp4
- Discord de OpenSenseNova: https://discord.com/invite/BuTXPHmQub
- LightLLM: https://github.com/ModelTC/LightLLM
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- Plataforma SenseNova: https://www.sensenova.ai/
- SenseNova-U1 (GitHub): https://github.com/OpenSenseNova/SenseNova-U1
