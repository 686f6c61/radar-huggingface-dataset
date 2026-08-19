# Jackrong/Qwopus3.6-35B-A3B-Coder-MTP-GGUF

## Resumen

Qwopus3.6-35B-A3B-Coder-MTP-GGUF es un fine-tune experimental orientado a agentes de codificacion, desarrollado por Jackrong sobre la base Qwopus3.6-35B-A3B-v1, que a su vez deriva de Qwen3.6-35B-A3B de Alibaba. El modelo esta disenado para flujos de trabajo agente donde el modelo lee archivos, elige herramientas, edita codigo, ejecuta pruebas y reacciona a errores, priorizando la eficiencia de tokens y la latencia baja frente al razonamiento largo visible. Se distribuye en formato GGUF para su uso con llama.cpp y otros motores compatibles.

La arquitectura es un MoE (Mixture of Experts) de 35.000 millones de parametros totales con 3.000 millones activos por token, lo que permite una inferencia relativamente rapida en hardware local. El nombre incluye la sigla MTP (Multi-Token Prediction), aunque no se detallan especificaciones de esta tecnica en la informacion disponible. El modelo soporta multimodalidad (imagen-texto a texto), tool calling, function calling y multiples idiomas, y se publica bajo licencia Apache-2.0.

Su relevancia radica en que cubre un nicho concreto: agentes de codigo que operan en modo "thinking-off" (sin razonamiento largo explicito), algo util para entornos de produccion donde el coste por token y la latencia son criticos. Al ser una version GGUF, esta pensado para despliegue local con llama.cpp, Ollama u otros motores, y para su integracion en harnesses de agentes como Codex, OpenHands, Claude Code u OpenCode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base Qwen3.6-35B-A3B, con fine-tune LoRA/SFT para agente de codigo |
| Parametros totales | 35B (modelo base); el repo safetensors muestra 446.571.248 parametros, probablemente correspondientes a un adapter LoRA |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | no disponible (se menciona "long-context" en los tags, sin cifra concreta) |
| Tipos de cuantizacion | no disponible (repo GGUF, se asume multiples cuantizaciones, pero no se listan) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) y safetensors (para transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un MoE con 35B de parametros totales y 3B activos por token. Sobre esta base se aplico un fine-tune mediante LoRA y SFT (supervised fine-tuning) para especializarlo en tareas de agente de codificacion. La informacion disponible no detalla el dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO. El nombre "MTP" sugiere el uso de Multi-Token Prediction, una tecnica que permite predecir varios tokens a la vez para acelerar la generacion, pero no se aportan especificaciones tecnicas al respecto.

El enfoque principal del fine-tune es el modo "thinking-off": el modelo esta optimizado para tomar decisiones de herramienta, aplicar parches, ejecutar pruebas y depurar errores sin generar cadenas de razonamiento largas y visibles. Esto reduce el desperdicio de tokens y la latencia en bucles agente repetitivos. Tambien se menciona compatibilidad con harnesses de agentes populares, lo que sugiere que el entrenamiento incluyo formatos de tool calling y function calling estandar.

## Capacidades

- Generacion y edicion de codigo en multiples lenguajes, con foco en flujos de agente (leer archivos, modificar, ejecutar pruebas, corregir errores).
- Soporte de tool calling y function calling, compatible con harnesses tipo Codex, OpenHands, Claude Code y OpenCode.
- Razonamiento multi-paso para tareas de depuracion y resolucion de errores en bucles agente.
- Capacidades multimodales: el pipeline se declara como image-text-to-text, lo que indica que puede procesar entradas de imagen junto con texto (aunque no se detallan las tareas de vision concretas).
- Multilingue: soporta ingles, chino, espanol, ruso y japones.
- Modo "thinking-off" optimizado para eficiencia de tokens y baja latencia en tareas agente.
- Disenado para ejecucion local con llama.cpp y motores compatibles con GGUF.

## Casos de uso

- Asistente de codigo en IDE local: el modelo puede integrarse en editores como VS Code o Neovim para sugerir ediciones, aplicar parches y ejecutar pruebas, aprovechando su modo thinking-off para respuestas rapidas sin largas cadenas de razonamiento.
- Agente de automatizacion de tareas de desarrollo: puede gestionar bucles de "editar-ejecutar-corregir" en pipelines de CI/CD, leyendo logs de error, modificando el codigo y relanzando las pruebas de forma autonoma.
- Depuracion asistida por IA: ante un fallo de compilacion o test, el modelo puede analizar el stack trace, localizar el archivo relevante y proponer o aplicar una correccion, repitiendo el ciclo hasta que las pruebas pasen.
- Generacion de demos y prototipos: la model card menciona un slot para una demo de juego RTS generada mediante flujo agente, lo que sugiere su uso en la creacion rapida de prototipos interactivos.
- Chatbot tecnico multilingue: gracias a su soporte de cinco idiomas y su capacidad conversacional, puede atender consultas de programacion en equipos distribuidos, manteniendo contexto largo en conversaciones multi-turno.
- Integracion en harnesses de agentes de codigo: al ser compatible con Codex-style, OpenHands-style, Claude Code-style y OpenCode-style, puede sustituir o complementar modelos propietarios en entornos de investigacion o produccion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar, por lo que no es posible comparar su rendimiento cuantitativo con otros modelos.

## Requisitos de hardware

- Al ser un MoE de 35B totales con 3B activos, la VRAM necesaria depende principalmente del tamaño de los pesos. Con cuantizacion Q4_K_M, los pesos ocupan aproximadamente 20 GB, por lo que cabria en GPUs consumer de 24 GB como la RTX 3090 o RTX 4090.
- Con cuantizaciones mas agresivas (Q3 o Q2), podria ejecutarse en GPUs de 16 GB, aunque con perdida de calidad.
- La memoria de activacion es reducida gracias a los 3B activos, lo que permite mayor throughput en comparacion con un modelo denso de 35B.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y transformers (con el formato safetensors). Tambien es compatible con vLLM si se convierte el modelo a su formato nativo.
- La latencia y el throughput estimados no estan publicados, pero la combinacion de MoE con 3B activos y cuantizacion GGUF suele permitir decenas de tokens por segundo en GPUs consumer modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwopus3.6-35B-A3B-Coder-MTP (este) | 35B totales / 3B activos | no disponible | Apache-2.0 | Agente de codigo, thinking-off, GGUF |
| Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | Apache-2.0 | Modelo generalista MoE |
| Qwen2.5-Coder-32B | 32B densos | 128K | Apache-2.0 | Codigo, sin MoE |

No se dispone de datos de rendimiento comparativo. La principal diferencia frente a Qwen2.5-Coder-32B es la arquitectura MoE (menos parametros activos) y el enfoque especifico en agentes con thinking-off. Frente al base Qwen3.6-35B-A3B, este fine-tune esta especializado en codigo y tool calling, pero pierde generalidad.

## Limitaciones y advertencias

- Modelo experimental y comunitario: la propia model card lo califica como "community release" para investigacion y evaluacion local, no para uso en produccion sin validacion previa.
- No se han publicado benchmarks, por lo que su rendimiento real en tareas de codigo o razonamiento es desconocido.
- Riesgo de alucinacion en codigo y en respuestas tecnicas, especialmente en contextos largos o con poca informacion.
- La longitud de contexto no esta especificada; aunque se menciona "long-context", no se puede garantizar un valor concreto.
- El modo thinking-off puede reducir la calidad en problemas complejos que requieren razonamiento profundo, ya que esta optimizado para velocidad y eficiencia de tokens.
- La informacion sobre el dataset de entrenamiento y las tecnicas de alineacion (RLHF/DPO) no esta disponible, lo que dificulta evaluar sesgos o comportamientos indeseados.
- Aunque la licencia Apache-2.0 permite uso comercial, al ser un modelo experimental podria contener errores o comportamientos impredecibles en entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder-MTP-GGUF
- Modelo base (v1): https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-v1
- Modelo base original: https://huggingface.co/unsloth/Qwen3.6-35B-A3B
