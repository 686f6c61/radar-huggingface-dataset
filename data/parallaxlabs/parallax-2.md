# parallaxlabs/parallax-2

## Resumen

Parallax 2 es un modelo de lenguaje de 9.000 millones de parametros desarrollado por Parallax Labs mediante ajuste fino supervisado sobre Qwen/Qwen3.5-9B. Esta disenado especificamente para razonamiento local y codificacion agentica, con el objetivo declarado de funcionar en hardware de consumo sin depender de APIs en la nube. El modelo se entreno sobre mas de 160.000 trazas de razonamiento, codigo y uso de herramientas destiladas de modelos frontera (Claude Opus, GPT-5.6 Sol, Fable, Kimi, entre otros).

A diferencia de un asistente conversacional convencional, Parallax 2 se entrena para actuar como agente autonomo de IDE: lee ficheros, ejecuta comandos de terminal, navega por la web mediante MCP (Model Context Protocol) y gestiona proyectos multi-fichero. Emplea bloques `<thought>` para estructurar el razonamiento antes de generar codigo y formato nativo `<tool_call>` para invocar herramientas.

La arquitectura subyacente es la de Qwen 3.5, que segun el autor incorpora Gated DeltaNet y soporta de forma nativa 262.144 tokens de contexto. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors y GGUF, lo que facilita su despliegue en entornos locales con Ollama, LM Studio o llama.cpp. El modelo lleva 3.110 descargas desde su publicacion el 18 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen 3.5 con Gated DeltaNet (segun model card) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (segun model card) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L (GGUF) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Parallax 2 parte del modelo base Qwen/Qwen3.5-9B, un transformer de 8,95 mil millones de parametros. La model card menciona que hereda la arquitectura Gated DeltaNet de Qwen 3.5, que habilita la ventana de contexto de 262.144 tokens. No se detalla en la informacion disponible la configuracion exacta de capas, dimensiones ocultas ni cabezas de atencion.

El ajuste fino se realizo sobre mas de 160.000 trazas de alta calidad de razonamiento, codigo y comportamiento agentico, destiladas de modelos frontera (Claude Opus, GPT-5.6 Sol, Fable, Kimi y otros). El entrenamiento se enfoca en tres ejes: razonamiento estructurado mediante bloques `<thought>`, invocacion de herramientas con formato `<tool_call>` compatible con MCP, y gestion de proyectos multi-fichero. La model card menciona el uso de Unsloth en el flujo de entrenamiento (aparece como tag), aunque no se detallan hiperparametros, numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante bloques `<thought>` con fases de reformulacion, planteamiento, derivacion y verificacion.
- Codificacion agentica: lectura de ficheros, edicion multi-fichero y gestion de proyectos de software.
- Ejecucion de comandos de terminal y uso de sistema de ficheros como herramientas nativas.
- Navegacion web mediante MCP (Model Context Protocol) con formato nativo `<tool_call>`.
- Tool calling / function calling con formato estructurado compatible con servidores MCP.
- Razonamiento multi-paso y planificacion para tareas agenticas de varios turnos.
- Modo conversacional como asistente de chat, ademas del modo agente.
- Ventana de contexto de 262.144 tokens para manejar repositorios y conversaciones largas.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio ni thinking mode explicito mas alla de los bloques `<thought>`.

## Casos de uso

- Agente autonomo de IDE: el modelo puede leer el arbol de ficheros de un repositorio, proponer y aplicar cambios multi-fichero, y verificar el resultado ejecutando tests en terminal, gracias a su soporte nativo de tool calling y a la ventana de 262K tokens para mantener el contexto del proyecto.
- Automatizacion de tareas de refactorizacion: con contexto largo puede cargar varios modulos simultaneamente y razonar sobre dependencias cruzadas antes de generar parches, usando los bloques `<thought>` para planificar la secuencia de cambios.
- Asistente de terminal y DevOps: integrado con MCP puede ejecutar comandos de shell, interpretar la salida y encadenar acciones (por ejemplo, diagnosticar un fallo de build y aplicar la correccion), lo que lo hace adecuado para pipelines de CI/CD locales.
- Investigacion web asistida: mediante MCP de busqueda web puede recopilar informacion de varias fuentes, sintetizarla y generar un informe o un parche de codigo basado en la documentacion encontrada.
- Desarrollo en portatiles sin GPU dedicada: las cuantizaciones Q4_K_M (5,24 GB) y Q2_K_L (3,5 GB) permiten ejecutarlo en equipos de consumo con VRAM limitada, manteniendo el flujo agentico completo de forma privada y sin claves de API.
- Prototipado de agentes MCP: al usar el formato estandar `<tool_call>`, sirve como modelo de referencia para probar servidores MCP y flujos de herramientas antes de desplegar en produccion con modelos mayores.
- Asistencia de codigo en local para entornos con requisitos de privacidad: al ejecutarse enteramente en hardware propio y con licencia Apache 2.0, es apto para equipos que no pueden enviar codigo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "PENDING! COMING SOON." en la seccion de benchmarks.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (datos de la model card):
  - BF16: aproximadamente 17,9 GB.
  - Q8_0: aproximadamente 9,5 GB.
  - Q6_K: aproximadamente 7,5 GB.
  - Q4_K_M: aproximadamente 5,24 GB.
  - Q2_K_L: aproximadamente 3,5 GB.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Las cuantizaciones bajas (Q4_K_M y Q2_K_L) caben en GPUs de consumo con 6-8 GB de VRAM; BF16 requiere GPUs de 24 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, con cuantizaciones Q8_0 o inferiores; Q4_K_M y Q2_K_L son las opciones para portatiles y GPUs de gama media.
- Opciones de despliegue: Ollama (`ollama run parallax-2`), LM Studio, llama.cpp (via GGUF), transformers, text-generation-inference (tag declarado). La model card advierte que en LM Studio debe desactivarse la decodificacion especulativa o el modelo puede no cargar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Parallax 2 | 8,95 B | 262.144 | Apache 2.0 | Razonamiento y codificacion agentica local | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-9B (base) | 8,95 B | 262.144 (heredado) | No disponible en la informacion | Modelo generalista base | Hugging Face |
| Alternativas de 7-9 B para codigo local | No disponible | No disponible | No disponible | Codigo y agentes | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card advierte que es una "experimental preview" y que puede cometer errores; no debe considerarse un modelo de calidad de produccion sin validacion previa.
- No se han publicado benchmarks, por lo que las afirmaciones de rendimiento ("trades blows with frontier cloud models") no estan respaldadas por datos verificables.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de 9 B, especialmente en tareas de razonamiento largo o cuando se le pide verificar su propia salida.
- Al ser un ajuste fino destilado de modelos frontera, puede heredar sesgos presentes en los datos de destilacion; no se documentan evaluaciones de sesgo.
- En LM Studio es obligatorio desactivar la decodificacion especulativa; de lo contrario el modelo puede fallar al cargar.
- El uso agentico con ejecucion de comandos de terminal y acceso a ficheros implica riesgos de seguridad: requiere sandboxing y supervision humana en entornos de produccion.
- No se documentan limitaciones especificas de la licencia Apache 2.0 para uso comercial, pero al derivar de Qwen 3.5 conviene verificar la licencia del modelo base antes de un despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/parallaxlabs/parallax-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
