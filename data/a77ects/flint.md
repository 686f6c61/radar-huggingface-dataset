# a77ects/flint

## Resumen

Flint (Recursive Flint) es un modelo de lenguaje mixture-of-experts (MoE) desarrollado por Recursive, especializado en agentes de codigo. Con 39,8 mil millones de parametros totales y aproximadamente 2,5 mil millones activos por token, esta disenado para investigar bases de codigo, corregir bugs, implementar funcionalidades y escribir tests de forma autonoma. Es relevante porque apunta directamente al segmento de modelos "coding agent" locales, donde compite con alternativas como Qwen3-Coder o GLM, pero con un consumo computacional por token muy bajo gracias a su enrutado disperso (6 expertos de 256 por capa MoE).

El modelo se entreno desde cero mediante preentrenamiento, mid-training, fine-tuning supervisado y aprendizaje por refuerzo, combinando texto, codigo, seguimiento de instrucciones y tareas agenticas. Soporta razonamiento explicito (con campo `reasoning_content`), llamadas a herramientas en formato OpenAI-compatible y conversaciones multi-turno, con una ventana de contexto documentada de 262.144 tokens.

El repositorio incluye el checkpoint en BF16, la configuracion del modelo, el tokenizador, la plantilla de chat y un kit de servido para SGLang. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only mixture-of-experts (MoE) |
| Parametros totales | 39,8B (39.785.287.456 segun safetensors) |
| Parametros activos | ~2,5B por token (incluyendo la cabeza de salida; ~2,2B solo el cuerpo) |
| Longitud de contexto | 262.144 tokens (prompt y salida comparten ventana) |
| Tipos de cuantizacion | BF16 (checkpoint publicado); variantes cuantizadas (NVFP4 para NVIDIA) preparadas por separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de ~79,6 GB) |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con enrutado disperso de expertos. Consta de 49 capas: 2 densas iniciales seguidas de 47 capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los cuales se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion es hibrida: 35 capas usan ventana deslizante de 513 tokens (token actual mas 512 precedentes) y 14 capas usan atencion completa, lo que reduce el coste computacional en secuencias largas manteniendo capacidad de razonamiento global. Usa 32 cabezas de consulta y 4 de clave/valor (GQA), con dimension de cabeza 128. Destacan dos innovaciones: QK RMSNorm por cabeza y attention sinks aprendidos por cabeza. La codificacion posicional es RoPE en las capas de ventana deslizante y ausencia de codificacion posicional en las capas de atencion completa. El vocabulario tiene 150.144 tokens.

El entrenamiento se realizo desde cero en cuatro fases: preentrenamiento, mid-training, supervised fine-tuning (SFT) y aprendizaje por refuerzo. Los datos incluyen texto y codigo, seguimiento de instrucciones y tareas agenticas (uso de herramientas en multiples pasos). La fecha de corte de conocimiento declarada es junio de 2026. No se ha publicado el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo emite contenido de razonamiento en el campo `reasoning_content`, que debe preservarse en el historial de la conversacion.
- Generacion y depuracion de codigo: disenado para investigar codebases, corregir bugs, implementar features y escribir tests.
- Tool calling: soporte de llamadas a herramientas compatibles con la API de OpenAI (`chat.completions` con tools).
- Razonamiento agentico multi-paso: entrenado con RL sobre tareas agenticas; evaluado en benchmarks de agentes (Terminal-Bench, SWE-bench) usando mini-swe-agent y Terminus 2.
- Conversaciones multi-turno con contexto largo: hasta 262.144 tokens compartidos entre prompt y salida.
- Entrada y salida exclusivamente de texto (sin vision ni audio).
- Presupuestos de salida elevados: se recomiendan al menos 32.768 tokens de salida para problemas dificiles, incluyendo el razonamiento.

## Casos de uso

- Agentes de correccion de bugs en repositorios reales: el modelo puede integrarse en frameworks tipo SWE-agent o mini-swe-agent para localizar y parchear bugs; sus resultados en SWE-bench Verified (74,2%) indican que resuelve tareas reales de GitHub sin asistencia humana.
- Implementacion de nuevas funcionalidades con tests: dado un issue o especificacion, el agente puede navegar el arbol de archivos, editar codigo y generar tests de regresion, aprovechando el contexto de 262K para manejar repositorios medianos.
- Revision y refactorizacion de codebases: con las capas de atencion completa y la ventana amplia, puede analizar archivos extensos y proponer refactorizaciones coherentes en multiples modulos.
- Pipelines de CI/CD con agentes: su soporte de tool calling OpenAI-compatible permite conectarlo a herramientas de ejecucion de tests, linters o despliegue dentro de flujos automatizados, con servido local mediante SGLang.
- Asistentes de codigo autoalojados para empresas con codigo sensible: al ser Apache 2.0 y ejecutarse en una sola GPU H200/B300 por replica, permite despliegues on-premise sin enviar codigo a APIs de terceros.
- Investigacion en modelos MoE agenticos: la publicacion de pesos abiertos, configuracion y plantilla de chat facilita estudios sobre enrutado de expertos, attention sinks y razonamiento con RL.
- Automatizacion de tareas de terminal: su puntuacion en Terminal-Bench 2.1 (54,9%) lo hace adecuado para agentes que operan en shells, instalando dependencias y ejecutando comandos de forma autonoma.

## Benchmarks y rendimiento

Resultados publicados por Recursive (temperatura 1,0, top-p 0,95, top-k 20; pass@1 promedio sobre al menos 5 intentos en tareas agenticas):

| Benchmark | Flint |
|---|---|
| Terminal-Bench 2.1 (Terminus 2) | 54,9% |
| SWE-bench Pro v2 (mini-swe-agent) | 89,7% |
| SWE-bench Verified (mini-swe-agent) | 74,2% |

Advertencias: la puntuacion de Terminal-Bench de Flint descuenta soluciones obtenidas mediante recuperacion web, ajuste que los scores reportados por otros desarrolladores pueden no aplicar. Las comparaciones con otros modelos aparecen en una imagen del README y no incluyen cifras numericas textuales, por lo que no se pueden reproducir aqui sin riesgo de inventar datos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 ocupa unos 79,6 GB; se necesita una GPU con al menos 80 GB de VRAM (H200 o B200/B300) por replica. No se especifican requisitos para las variantes cuantizadas NVFP4 o Apple Silicon, que se publicaran por separado.
- GPU recomendadas: NVIDIA B300 o H200 (una por replica), segun los scripts `serve_b300.sh` y `serve_h200.sh` incluidos.
- Consumer GPU: no cabe en GPUs de consumo (RTX 4090, RTX 5090) en BF16; habra que esperar a las variantes cuantizadas anunciadas para saber si son viables.
- Despliegue: kit oficial de servido con SGLang mediante Docker (incluye `example_client.py` y API compatible con OpenAI en el puerto 30000). No hay soporte todavia para transformers en inferencia, ni para llama.cpp, Ollama, TGI o vLLM en la informacion disponible.
- Latencia y throughput: no disponible. Se advierte que el razonamiento largo puede aumentar la latencia y agotar el presupuesto de salida antes de completar la respuesta.

## Comparativa con modelos similares

| Caracteristica | Flint (Recursive) | Qwen3-Coder-30B-A3B | GLM-4.5-Air |
|---|---|---|---|
| Parametros totales | 39,8B | 30,5B | 106B |
| Parametros activos | ~2,5B | ~3,3B | ~12B |
| Contexto | 262.144 tokens | 262.144 tokens (nativo) | 131.072 tokens |
| Arquitectura | MoE, atencion hibrida (sliding window + full) | MoE | MoE |
| SWE-bench Verified | 74,2% (reportado por Recursive) | no disponible en esta ficha | no disponible en esta ficha |
| Licencia | Apache 2.0 | Apache 2.0 | MIT |
| Despliegue | SGLang (Docker), GPU 80 GB | vLLM, SGLang, llama.cpp, Ollama | vLLM, SGLang |

Nota: los valores de Qwen3-Coder y GLM-4.5-Air son de conocimiento general y pueden variar segun la version; los benchmarks de Flint son los reportados por su desarrollador bajo una metodologia propia.

## Limitaciones y advertencias

- El SFT incluyo ejemplos orientados a seguridad, pero el modelo puede seguir produciendo contenido incorrecto o danino, codigo defectuoso o llamadas a herramientas inapropiadas.
- El uso de herramientas requiere controles propios: la gramatica estructurada de tool calls no impide que el modelo elija acciones inseguras; las aplicaciones deben imponer permisos y limites de ejecucion.
- El contexto de 262K es un limite de capacidad, no una garantia de precision uniforme en todas las longitudes de secuencia o tareas.
- El razonamiento largo puede agotar el presupuesto de salida antes de dar una respuesta completa, aumentando la latencia.
- Los resultados pueden variar segun la precision del checkpoint y el runtime de inferencia; Recursive recomienda evaluar el checkpoint y runtime concretos antes de desplegar.
- No hay codigo de modelado para transformers: la inferencia depende del kit SGLang incluido, lo que limita la portabilidad de momento.
- Idiomas soportados no especificados en la model card.
- La licencia Apache 2.0 es permisiva para uso comercial, pero los terminos de la API alojada de Recursive son independientes de la licencia de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a77ects/flint
- Organizacion Recursive en Hugging Face: https://huggingface.co/RecursiveSI
- Blog de presentacion: https://www.recursive.com/updates/introducing-recursive-flint
- Motor local (GitHub): https://github.com/recursive-oss/rec
- Documentacion: https://docs.recursive.com/getting-started
