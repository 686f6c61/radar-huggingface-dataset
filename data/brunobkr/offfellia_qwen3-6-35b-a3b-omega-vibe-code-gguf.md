# Brunobkr/OFFFELLIA_Qwen3.6-35B-A3B-OMEGA-vibe-code.gguf

## Resumen

El repositorio Brunobkr/OFFFELLIA_Qwen3.6-35B-A3B-OMEGA-vibe-code.gguf contiene una cuantización en formato GGUF de 19,8 GB del modelo Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token, publicado originalmente por Qwen el 21 de abril de 2026. Este repositorio es un artefacto de terceros: el autor (Brunobkr) redistribuye el modelo convertido a GGUF para su uso con el ecosistema de inferencia OFFFELLIA_PURE, un fork de llama.cpp en C/C++ orientado a agentes autónomos, decodificación especulativa y generación de código con FIM.

El problema que resuelve es el de ejecutar localmente un modelo MoE de 35B con ventana de contexto larga (hasta 256K tokens en el modelo base) en hardware de consumo, gracias al reducido número de parámetros activos y al soporte de offload de expertos a CPU y a la API Vulkan del fork. La model card del repositorio no documenta el modelo en sí, sino el motor de inferencia: describe el motor agéntico multi-turno, la integración de herramientas mediante MCP, el modo de razonamiento automático y una interfaz web en SvelteKit/Vite.

Su relevancia es doble: por un lado, es una vía práctica de despliegue local de un MoE reciente con capacidades agénticas y de codificación; por otro, presenta señales de riesgo claras para producción —cero descargas, cero valoraciones, licencia no declarada en HuggingFace para los pesos y una ficha que no describe el proceso de cuantización ni los datos de entrenamiento—. Cualquier evaluación seria debería contrastarse contra el modelo base oficial antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada del modelo base Qwen3.6-35B-A3B; no confirmada explícitamente en la ficha del repositorio |
| Parámetros totales | 35B (según la nomenclatura del modelo base Qwen3.6-35B-A3B) |
| Parámetros activos | Aproximadamente 3B por token (según el modelo base Qwen3.6-35B-A3B) |
| Longitud de contexto | 256K tokens en el modelo base; el comando de ejemplo del autor arranca el servidor con `-c 50000` |
| Tipos de cuantización | GGUF. El comando de la model card referencia un fichero MXFP4 (`ΩFFFΣLLIα_MXFP4_MOE_Qwen3.6-35B-A3B-ΩMΣGα-vibe-code.gguf`); el repo indicado pesa 19,8 GB. No se detalla el listado de cuantizaciones disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible para los pesos en HuggingFace. La model card declara licencia MIT para el fork de llama.cpp (OFFFELLIA_PURE), no necesariamente para el modelo |
| Formato de pesos | GGUF (`gguf`), cargable con llama.cpp y forks compatibles |

## Arquitectura y entrenamiento

El modelo base, Qwen3.6-35B-A3B, es un transformer de tipo MoE con 35B de parámetros totales y unos 3B activos por token, lo que reduce el coste computacional por token frente a un denso del mismo tamaño. Según las fuentes públicas consultadas, la familia Qwen3.6 incorpora visión, codificación agéntica y preservación del modo de pensamiento (thinking-mode preservation), con una ventana de contexto de 256K tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO.

Esta ficha corresponde a una conversión a GGUF posterior al entrenamiento: no hay ningún proceso de entrenamiento propio documentado en el repositorio. La model card se limita a describir el ecosistema de inferencia OFFFELLIA_PURE, que incluye un motor agéntico autónomo multi-turno, soporte nativo de Fill-in-the-Middle para generación y completado de código, decodificación especulativa orientada a programación, integración de herramientas mediante MCP y una interfaz web en SvelteKit/Vite. El comando de ejemplo emplea offload completo de capas a GPU (`-ngl 99`), offload de expertos a CPU (`--n-cpu-moe 99`), cuantización del KV cache en `q8_0` para claves y valores, atención flash (`-fa on`), carga por `mmap` y modo agente con todas las herramientas activadas.

## Capacidades

Las capacidades que se listan a continuación proceden del modelo base Qwen3.6-35B-A3B y de las funciones del motor de inferencia descrito por el autor; no están verificadas específicamente para esta cuantización.

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) preservado entre turnos, según la documentación del modelo base.
- Codificación agéntica: resolución de tareas de programación en varios pasos, con soporte de FIM (Fill-in-the-Middle) para autocompletado de código en editores.
- Llamada a herramientas y function calling mediante integración con MCP (Model Context Protocol) en el motor OFFFELLIA_PURE.
- Ejecución de bucles agénticos multi-turno (`--agent --tools all --reasoning auto` en el comando de ejemplo).
- Decodificación especulativa optimizada para generación de código dentro del fork de llama.cpp.
- Capacidades de visión en el modelo base; no confirmadas en este repositorio, ya que no se documenta un fichero de proyector multimodal (mmproj) ni un pipeline de imagen.
- Capacidades multilingües: no declaradas en la ficha del repositorio; no disponible.
- Despliegue local íntegro con servidor compatible con API HTTP (`llama-server`), interfaz web propia y control de orígenes CORS.

## Casos de uso

- Autocompletado de código en el IDE: el motor soporta FIM de forma nativa y el modelo activa unos 3B parámetros por token, lo que permite completados de baja latencia en una GPU de consumo con los pesos de 19,8 GB cargados.
- Agente de refactorización multi-turno: con `--agent` y `--tools all`, el modelo puede encadenar lectura de ficheros, edición y ejecución de comandos a través de MCP, manteniendo el contexto de la tarea en la ventana de conversación.
- Asistente de programación con privacidad total: al ejecutarse con llama.cpp en local y carga por `mmap`, ningún fragmento de código sale de la máquina, lo que encaja en entornos con requisitos de confidencialidad.
- Análisis de repositorios y documentos largos: el arranque con `-c 50000` y KV cache en `q8_0` permite procesar bloques extensos de código o documentación sin reenviar el contexto; el modelo base admite hasta 256K tokens.
- Servidor de inferencia autoalojado para equipos pequeños: `llama-server` con WebUI en SvelteKit ofrece un endpoint HTTP único para varios desarrolladores, con `--parallel 1` ajustable según la VRAM disponible.
- Despliegue en estaciones sin GPU de gran capacidad: gracias a `--n-cpu-moe 99`, los expertos pueden residir en RAM y dejar en la GPU solo las capas densas, lo que rebaja el requisito de VRAM a costa de velocidad.
- Generación de tests y documentación técnica a partir de un módulo existente: el modelo puede tomar el fichero como contexto y producir casos de prueba o documentación en la misma sesión agéntica.
- Prototipado de asistentes conversacionales especializados en dominios técnicos, usando la interfaz web incluida para validación rápida con usuarios internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han encontrado resultados específicos de esta cuantización en las búsquedas realizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 19,8 GB en el formato publicado. A ello hay que sumar el KV cache; con `-c 50000` y cache en `q8_0`, la reserva adicional depende de la configuración de capas del modelo base, dato no disponible.
- GPU recomendadas: para offload completo, tarjetas con 24 GB o más (RTX 3090, RTX 4090, RTX 5090, A100 40 GB, H100). Con `--n-cpu-moe 99` el requisito de VRAM baja de forma notable, ya que los expertos se mantienen en memoria del sistema.
- Compatibilidad con GPU de consumo: sí, en el límite. El conjunto de pesos entra en 24 GB, pero deja poco margen para el KV cache y el resto del runtime; conviene validar la configuración concreta antes de fijar la longitud de contexto.
- RAM del sistema: al menos 32 GB si se descargan expertos a CPU; no se especifica en la documentación.
- Opciones de despliegue: llama.cpp y el fork OFFFELLIA_PURE (compilación con `-DGGML_VULKAN=ON`, `-DLLAMA_BUILD_WEBUI=ON`, `-DLLAMA_SERVER_TOOLS=ON`), además de cualquier runtime que lea GGUF (Ollama, text-generation-webui, LM Studio). No se menciona compatibilidad con vLLM o TGI.
- Latencia y throughput estimados: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token para esta cuantización.
- Nota de compatibilidad: los indicadores `--agent`, `--tools all`, `--reasoning auto`, `--kv-unified` y `--webui-mcp-proxy` del comando de ejemplo pertenecen al fork del autor y no puede asumirse su disponibilidad en llama.cpp upstream.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| OFFFELLIA_Qwen3.6-35B-A3B-OMEGA-vibe-code (este) | 35B | ~3B | 256K en el modelo base; 50K en el ejemplo del autor | no disponible para los pesos | 0 descargas, 0 valoraciones en HuggingFace | no disponible |
| Qwen3.6-35B-A3B (modelo base oficial) | 35B | ~3B | 256K | no disponible en la información recogida | ModelScope y Ollama | no disponible |
| Qwen3.6-27B (denso, misma familia) | 27B | 27B (denso) | 256K | no disponible en la información recogida | Ollama y otras distribuciones | no disponible |
| OFFFELLIA_IQ4_XS_Qwen3.6-35B-A3B-uncensored-heretic (mismo autor) | 35B | ~3B | no disponible | no disponible | Repositorio hermano en HuggingFace | no disponible |

## Limitaciones y advertencias

- Licencia no declarada en HuggingFace para los pesos. La licencia MIT que aparece en la model card corresponde al fork de llama.cpp, no al modelo; su uso comercial queda en una zona legal indefinida.
- Repositorio sin tracción: cero descargas y cero valoraciones en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card no documenta el modelo: no indica el proceso de cuantización, la calibración, la composición del dataset ni el pipeline. Toda la información técnica procede del modelo base y del motor de inferencia.
- No se declaran idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluación propia.
- Las capacidades de visión del modelo base no están confirmadas en esta conversión: no se menciona ningún fichero de proyector multimodal en el repositorio.
- El contexto efectivo está limitado por la VRAM y por la cuantización del KV cache, no por los 256K teóricos del modelo base. El ejemplo del autor arranca con 50 000 tokens.
- El nombre del repositorio y el de repositorios hermanos del mismo autor (con etiquetas como `uncensored-heretic`) sugieren un ajuste orientado a reducir restricciones de contenido; este extremo no está confirmado para esta conversión, pero implica un riesgo de sesgos y de contenido inapropiado que debe verificarse antes de exponerlo a usuarios finales.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de codificación agéntica donde el modelo puede invocar herramientas con argumentos incorrectos.
- Dependencia de un fork no estándar para aprovechar las funciones avanzadas (motor agéntico, MCP, decodificación especulativa); la migración a llama.cpp upstream puede degradar el comportamiento.
- No hay resultados de benchmarks publicados para esta cuantización, por lo que la pérdida de calidad respecto al modelo base es desconocida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Brunobkr/OFFFELLIA_Qwen3.6-35B-A3B-OMEGA-vibe-code.gguf
- Árbol de ficheros del repositorio: https://huggingface.co/Brunobkr/OFFFELLIA_Qwen3.6-35B-A3B-OMEGA-vibe-code.gguf/tree/main
- Repositorio hermano del mismo autor (cuantización IQ4_XS): https://huggingface.co/Brunobkr/OFFFELLIA_IQ4_XS_Qwen3.6-35B-A3B-uncensored-heretic.gguf
- Motor de inferencia OFFFELLIA_PURE (fork de llama.cpp): https://github.com/brunoconta1980-tech/llama_OFFFELLIA_1984
- Proyecto ROCmFPX, citado en la model card: https://github.com/charlie12345/ROCmFPX
- Modelo base Qwen3.6-35B-A3B en ModelScope: https://www.modelscope.ai/models/Qwen/Qwen3.6-35B-A3B
- Ficha del modelo base en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Guía de ejecución local de la familia Qwen 3.6: https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
