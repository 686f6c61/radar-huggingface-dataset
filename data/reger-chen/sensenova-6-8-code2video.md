# Reger-Chen/SenseNova-6.8-Code2Video

## Resumen

SenseNova 6.8 Code2Video es un modelo de lenguaje de 27 356 728 560 parámetros (aproximadamente 27,4 B) especializado en la creación de vídeo mediante generación de código ejecutable. Está desarrollado por SenseNova (OpenSenseNova) como un ajuste fino del modelo base Qwen3.8-27B, y se distribuye con licencia Apache 2.0. El modelo no genera píxeles directamente: escribe código (por ejemplo, animaciones, gráficos vectoriales o composiciones programáticas) que, al ejecutarse, produce el vídeo final. Esta aproximación lo convierte en un puente entre distintos modelos y herramientas creativas, ya que el código puede invocar generadores de imagen, generadores de vídeo, herramientas de modelado 3D o editores.

El modelo se presenta como el primer paso de una hoja de ruta más amplia hacia un sistema que coordine múltiples modelos generativos y herramientas creativas mediante código. Está pensado para tareas de horizonte largo: según la model card, puede mantener ejecuciones de más de 10 horas y más de 2000 turnos, lo que lo hace adecuado para flujos agénticos complejos de creación audiovisual. Su ventana de contexto declarada es de 512 000 tokens, un valor muy alto que encaja con ese perfil de uso.

La relevancia actual del modelo radica en su enfoque "code-first" para la generación de vídeo y en su integración con arneses agénticos como Claude Code, además de su compatibilidad declarada con servidores de inferencia estándar (vLLM, SGLang, LightLLM). No obstante, se trata de un modelo con muy poca tracción pública en el momento de la ficha (24 descargas y 0 likes), y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.8-27B; tag `qwen3_5` en HuggingFace) |
| Parametros totales | 27 356 728 560 (≈27,4 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 512 000 tokens (512K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base Qwen3.8-27B, por lo que hereda una arquitectura transformer densa de aproximadamente 27,4 B de parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas propias más allá de las del modelo base. El tag `qwen3_5` en HuggingFace sugiere una variante de la familia Qwen3.5/Qwen3.8, pero no se aporta documentación técnica adicional al respecto.

La innovación principal del modelo no es arquitectónica sino de enfoque: está entrenado para producir código ejecutable que construye y renderiza vídeo, en lugar de generar vídeo de forma directa. La model card indica que el modelo "construye y renderiza vídeos generando código ejecutable" y que se centra en vídeos cortos implementados íntegramente en código. Se menciona también que el código puede encadenar otros modelos y herramientas (generación de imagen, generación de vídeo, modelado 3D, edición), lo que sugiere un entrenamiento orientado a trayectorias agénticas con uso de herramientas, aunque no se documentan los detalles del proceso.

## Capacidades

- Generación de código ejecutable para crear animaciones, motion design, tipografía cinética, explicaciones matemáticas, mundos isométricos, manualidades en papel, historias de datos, animación de personajes y promociones de producto (según los ejemplos de la model card).
- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base.
- Soporte de tool calling / function calling: la model card incluye parsers específicos (`qwen3_coder`) y `--enable-auto-tool-choice` en la configuración de vLLM.
- Soporte de agentes y razonamiento multi-paso: puede mantener ejecuciones de más de 10 horas y más de 2000 turnos, revisando fotogramas y revisando el código de forma iterativa.
- Capacidades multilingües limitadas a inglés y chino.
- Capacidad de entrada image-text-to-text (pipeline declarado), lo que permite recibir imágenes junto con texto.
- Integración con Claude Code como arnés recomendado, con configuración específica de ventana de contexto (512K), auto-compactación al 80 % y salida máxima de 64K tokens.
- Modo de razonamiento compatible con el parser `qwen3` en vLLM y SGLang.

## Casos de uso

- Creación de vídeos cortos programáticos: el modelo escribe código que, al ejecutarse, renderiza animaciones y composiciones visuales completas. Es adecuado para piezas de motion design, tipografía cinética o explicaciones matemáticas donde el control preciso del resultado se logra mejor mediante código que mediante generación de píxeles.
- Pipelines agénticos de creación audiovisual de horizonte largo: gracias a su ventana de 512K tokens y a la capacidad de sostener más de 2000 turnos, puede encargarse de ciclos de escribir código, renderizar, revisar fotogramas y corregir, integrándose en Claude Code u otros arneses agénticos.
- Orquestación de herramientas generativas: el código generado puede invocar generadores de imagen, generadores de vídeo, herramientas de modelado 3D y editores, encadenando generación, edición y composición en un flujo creativo completo. Útil en estudios que ya dispongan de varias APIs generativas y quieran unificarlas bajo un único agente.
- Generación de contenido para marketing y producto: la model card cita promociones de producto y "data stories" como dominios de ejemplo; el modelo puede producir piezas promocionales cortas implementadas en código, fáciles de versionar y modificar.
- Automatización de prototipado visual en I+D: investigadores pueden usar el modelo para generar y modificar rápidamente prototipos de animaciones o visualizaciones científicas, aprovechando la naturaleza reproducible del código frente a la generación estocástica de píxeles.
- Educación y divulgación: la generación de explicaciones matemáticas animadas y "paper-craft films" sugerida por la model card encaja en la producción de material didáctico programático, donde el código permite ajustar parámetros y regenerar variantes.
- Integración en servidores de inferencia estándar: al ser compatible con vLLM, SGLang y LightLLM con parsers de razonamiento y tool calling, puede desplegarse como servicio OpenAI-compatible en infraestructuras existentes para alimentar aplicaciones de creación de vídeo por código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 27,4 B de parámetros, en precisión BF16 se necesitan aproximadamente 55 GB solo para los pesos, a los que hay que sumar la caché KV para una ventana de hasta 512K tokens, lo que eleva considerablemente los requisitos.
- GPU recomendadas: la model card propone despliegues con `--tp 4` (tensor parallelism de 4 GPUs) tanto en LightLLM, vLLM como SGLang, lo que sugiere clústeres de 4 GPUs de gama alta (por ejemplo, A100/H100) para aprovechar la ventana completa de 512K.
- ¿Cabe en GPU consumer? No se indica; con 27,4 B en BF16 no cabe en una GPU consumer de 24 GB sin cuantización, y no se documentan cuantizaciones oficiales.
- Opciones de despliegue: LightLLM, vLLM y SGLang, con configuraciones documentadas en la model card (parsers `qwen3` para razonamiento y `qwen3_coder` para tool calling). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova 6.8 Code2Video | ≈27,4 B | 512K | Generación de vídeo mediante código, agéntico | Apache 2.0 | HuggingFace (24 descargas) |
| Qwen3.8-27B (modelo base) | ≈27 B | no disponible en esta ficha | LLM generalista | según el modelo base | HuggingFace |
| Alternativas de generación de vídeo por código | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la misma categoría (generación de vídeo mediante código) ni con alternativas de tamaño similar en términos de rendimiento, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de código, razonamiento o generación de vídeo no está verificado de forma independiente.
- El modelo tiene muy poca tracción pública (24 descargas, 0 likes) y fue creado y actualizado el mismo día (2026-10-30), lo que sugiere una publicación reciente y sin validación comunitaria.
- Riesgo de alucinación inherente a los modelos de lenguaje: el código generado puede no ejecutarse correctamente o producir resultados distintos de los esperados; se recomienda validación y ejecución en entornos aislados.
- La ventana de 512K y las ejecuciones de más de 2000 turnos implican costes de cómputo y memoria elevados; la model card requiere configuraciones específicas en el arnés (por ejemplo, `CLAUDE_CODE_MAX_CONTEXT_TOKENS=524288`).
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base Qwen3.8-27B, de la que no se aportan detalles en la información disponible.
- No se documentan tipos de cuantización oficiales ni soporte en llama.cpp/Ollama, lo que limita el despliegue en hardware de gama media o consumer.
- El modelo está orientado a vídeos cortos implementados íntegramente en código; la model card reconoce que las capacidades de edición, composición, animación y creación 3D son trabajo futuro, no presentes en esta versión.

## Enlaces

- HuggingFace: https://huggingface.co/Reger-Chen/SenseNova-6.8-Code2Video
- Repositorio del autor en HuggingFace: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- GitHub (skill y prompts): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Trayectorias de ejemplo: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video/blob/main/trajectories/all.openai.jsonl
- Skill de producción: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video/tree/main/skills/code-video
- Discord de OpenSenseNova: https://discord.com/channels/1488006693395628032/1488015977932390520
- LightLLM: https://github.com/ModelTC/LightLLM
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
