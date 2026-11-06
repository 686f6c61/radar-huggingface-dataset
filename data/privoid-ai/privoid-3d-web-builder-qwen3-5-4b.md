# Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B

## Resumen

Privoid 3D Web Builder es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por Privoid-ai. Su objetivo es especializar un modelo de 4.000 millones de parametros en tareas de desarrollo web con Next.js, React, Node.js y Three.js, incorporando razonamiento y llamadas a herramientas (tool calling). Se distribuye como adaptador de bajo rango, no como un modelo completo, por lo que requiere cargar el modelo base Qwen3.5-4B y aplicar el adaptador encima.

El modelo aborda un nicho concreto: la generacion de paginas y escenas 3D con Three.js dentro de proyectos Next.js, incluyendo flujos de agente que ejecutan comandos de build. Segun la model card, esta es la version V1 y el autor trabaja en una V2. Los pesos se publican en formato safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 0,2 GB, coherente con un adaptador LoRA y no con un modelo completo.

La relevancia actual es limitada pero clara: demuestra un caso de especializacion vertical de un modelo pequeno (4B) mediante LoRA para un dominio tecnico y con soporte de tool calling, un patron cada vez mas comun para despliegues ligeros en entornos de desarrollo. No obstante, sus propios benchmarks muestran resultados mixtos y el autor lo declara explicitamente como no listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible en el adaptador; existen ficheros GGUF en el repositorio derivado |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, mediante LoRA. La model card no detalla el rango, el alpha ni los modulos objetivo del adaptador. El entrenamiento se detuvo por presupuesto de tiempo en la actualizacion 241, y ese checkpoint es el que se publica como mejor adaptador. La perdida de validacion paso de 1,1177 a 0,9156.

El dataset de entrenamiento combina cinco fuentes con el siguiente numero de filas: `ccore_threejs` (910), `tesslate_nextjs` (15.669), `threejs_gamecode` (42), `swe_smith` (5.867) y `bridge_next_three` (463). Las fuentes citadas son ccore/ThreeJS-3D-Scenes, Tesslate/Next.js-Dataset, Slava32/next.js-15.4-with-reasoning, agagasf123123/threejs-gamecode-instruct-v3-ultra y Kwai-Klear/SWE-smith-mini_swe_agent_plus-trajectories-66k. Las filas de `bridge_next_three` se derivaron de escenas de ccore reescribiendo codigo, marcado y CSS mediante script, con resultados de herramientas tambien generados por script; segun el autor, 12 de 12 filas muestreadas compilaron y renderizaron correctamente. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de codigo para Next.js, React, Node.js y Three.js, con enfasis en escenas 3D y paginas web.
- Razonamiento previo a la respuesta (el dataset base incluye Next.js 15.4 con razonamiento).
- Tool calling y function calling, orientado a flujos de agente que ejecutan comandos como `next build`.
- Razonamiento multi-paso dentro de trayectorias de agente de ingenieria de software.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode explicito: no disponibles.

## Casos de uso

- Generacion de escenas Three.js en proyectos Next.js: el adaptador se ha entrenado especificamente con escenas de Three.js y codigo de Next.js, por lo que puede producir componentes que integren un canvas 3D dentro de una pagina React.
- Asistente de agente para builds: puede emitir tool calls para ejecutar `next build` y reaccionar a errores de compilacion, aprovechando las trayectorias de agente incluidas en el entrenamiento.
- Prototipado rapido de paginas web con componentes React: util para generar esqueletos de UI y logica de componentes en un entorno de desarrollo local.
- Correccion de errores en codigo de aplicaciones web: el modelo base y el adaptador incorporan datos de trayectorias de resolucion de issues (SWE-smith), aplicables a depuracion de codigo JavaScript y TypeScript.
- Integracion en pipelines de CI/CD como asistente de revision: puede generar parches o sugerencias de codigo que luego se validan en un sandbox antes de fusionarse.
- Educacion y experimentacion: como ejemplo de adaptador LoRA especializado en un dominio concreto, sirve para estudiar tecnicas de fine-tuning de bajo coste sobre modelos de 4B.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son comprobaciones de tareas reales en una sesion de una GPU, con 8 tareas de render y 8 tareas de agente. El autor advierte que no establecen una clasificacion general.

| Comprobacion | Qwen3.5-4B | Privoid 3D Web Builder |
|---|---|---|
| Paginas Three.js que renderizan | 6/8 | 0/8 |
| Agente: `next build` pasa | 1/8 | 5/8 |
| Agente: la pagina renderiza 3D | 0/8 | 0/8 |

Perdida de validacion: 1,1177 (base) frente a 0,9156 (adaptador). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,2 GB; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16 y entre 3 y 5 GB en cuantizaciones de 4 bits, aunque estos valores no se confirman en la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, una GPU consumer con 8-12 GB de VRAM deberia ser suficiente en cuantizacion, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (4B), aunque no se confirma.
- Opciones de despliegue: la libreria indicada es PEFT; existen ficheros GGUF en el repositorio `Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B-GGUF`, lo que permite su uso con llama.cpp u Ollama. No se documentan opciones como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Privoid 3D Web Builder (LoRA sobre Qwen3.5-4B) | 4B (base) | no disponible | Apache 2.0 | Web 3D con Three.js/Next.js y tool calling |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible en la informacion | Modelo generalista con razonamiento |
| Alternativas de codigo de 4B (p. ej. variantes de Qwen-Coder) | no disponible | no disponible | no disponible | Generacion de codigo general |

No se dispone de datos comparativos de rendimiento con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No esta listo para produccion: el autor recomienda revisar el codigo generado y ejecutar las tool calls en un sandbox.
- La mayoria de los datos son sinteticos o generados por otros modelos, y pocos corresponden a proyectos completos multiarchivo.
- Las trayectorias de SWE-smith son principalmente de correccion de issues en Python, no de desarrollo web.
- Los derechos de los datos no estan completamente resueltos: ccore se genero con un modelo MiniMax bajo su propia licencia, Tesslate no documenta su fuente y el dataset de juego usa una licencia personalizada; deben revisarse antes de cualquier publicacion publica o comercial.
- En el benchmark propio, el adaptador empeora el renderizado de paginas Three.js respecto al base (0/8 frente a 6/8), lo que sugiere un posible olvido catastrofico o un sesgo hacia el formato de agente.
- Riesgo de alucinacion en codigo y en llamadas a herramientas no verificado; no se documentan sesgos conocidos.
- Idiomas soportados y contexto no especificados.
- Licencia Apache 2.0 en el adaptador, pero las restricciones de los datos de entrenamiento pueden condicionar el uso comercial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B)
- [Repositorio GGUF](https://huggingface.co/Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B-GGUF)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [ccore/ThreeJS-3D-Scenes](https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes)
- [Tesslate/Next.js-Dataset](https://huggingface.co/datasets/Tesslate/Next.js-Dataset)
- [Slava32/next.js-15.4-with-reasoning](https://huggingface.co/datasets/Slava32/next.js-15.4-with-reasoning)
- [agagasf123123/threejs-gamecode-instruct-v3-ultra](https://huggingface.co/datasets/agagasf123123/threejs-gamecode-instruct-v3-ultra)
- [Kwai-Klear/SWE-smith-mini_swe_agent_plus-trajectories-66k](https://huggingface.co/datasets/Kwai-Klear/SWE-smith-mini_swe_agent_plus-trajectories-66k)
