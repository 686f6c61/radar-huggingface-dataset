# kingdavezz/king-ai

## Resumen

KING AI (identificador `kingdavezz/king-ai`, tambien referido en la model card como `king-ai-roblox`) es un ajuste fino del modelo Qwen2.5-Coder-32B-Instruct orientado a un nicho muy concreto: el desarrollo de videojuegos en Roblox Studio con Luau en modo estricto y la generacion procedural de mallas 3D mediante Python de Blender 4.x. Lo publica KingDavez Studios bajo licencia Apache 2.0 y la model card lo presenta como un "foundation model" para desarrollo autonomo de juegos en Roblox, aunque en la practica se trata de un fine-tune sobre una base ya existente.

El modelo hereda la arquitectura transformer decoder de Qwen2.5-Coder-32B-Instruct, con una longitud de contexto declarada de 32.768 tokens, lo que permite trabajar con codebases completos y multiples scripts de forma simultanea. La propuesta de valor se centra en tres areas: generacion de Luau type-safe (`--!strict`), construccion programatica de interfaces tipo simulador (ScreenGui, inventarios de mascotas, botones con fisicas de tween) y scripts de Blender para modelado low-poly listo para el motor de Roblox.

Es relevante ahora porque cubre un hueco poco atendido por los modelos generalistas: el ecosistema Roblox tiene convenciones propias (librerias `task`, `ProfileService`, `workspace:Raycast`, netcode server-authoritative) que los modelos de codigo genericos suelen tratar de forma superficial. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, el tamano declarado es de 0,0 GB y la model card mezcla referencias a "32B / 70B parameter classes" y a otros modelos (DeepSeek V4, Llama 3.3) que no se corresponden con los pesos publicados, lo que exige cautela sobre su estado real de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32B (clase declarada; la model card menciona "32B / 70B parameter classes" de forma ambigua) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (la model card solo muestra ejemplo en bfloat16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria `transformers`; el repositorio figura con 0,0 GB, sin pesos visibles) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-32B-Instruct: un transformer decoder denso de 32.000 millones de parametros con atencion causal estandar, adaptado por el equipo de Qwen para tareas de codigo y posteriormente ajustado por KingDavez Studios para el dominio Roblox/Luau/Blender. La model card no detalla el proceso de ajuste: no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones tecnicas propias del fine-tune (decodificacion especulativa, atencion lineal, modos de razonamiento extendido, etc.).

Lo unico que la model card describe como "capacidad" tecnica es el sesgo del ajuste hacia convenciones modernas de Luau: uso obligatorio de la libreria `task` (`task.wait`, `task.defer`, `task.spawn`) en lugar de primitivas deprecadas (`wait()`, `spawn()`, `delay()`), casteo de tipos con `::`, comprobaciones de sanidad anti-exploit en servidor y patrones de bloqueo de sesion con `ProfileStore`/`ProfileService`. Tambien menciona la generacion de scripts `bpy` para Blender 4.x con presupuestos de poligonos inferiores a 5.000 triangulos, pivotes centrados y orientacion `-Z` forward / `Y` up para exportacion a Roblox. Son afirmaciones de la model card, no resultados verificados de entrenamiento.

## Capacidades

- Generacion de codigo Luau en modo `--!strict` con tipado explicito y uso de la libreria `task`.
- Generacion de netcode server-authoritative con limitacion de tasa (rate-limiting), casteo de tipos y comprobaciones anti-exploit.
- Integracion de `ProfileStore` y `ProfileService` para persistencia de datos de jugador con bloqueo de sesion.
- Consultas espaciales con `workspace:Raycast`, `workspace:Blockcast` y `OverlapParams`.
- Generacion programatica de interfaces `ScreenGui` estilo simulador: cabeceras con semitono, rejillas de inventario de mascotas de 10 slots, algoritmos de "equipar el mejor" y modales de conversion de paquetes de inicio.
- Animaciones de UI con `TweenService` y fisicas de muelle (escala a 0,94x al pulsar, retorno con easing `Back`).
- Generacion de scripts Python de Blender 4.x (`bpy`) para mallas low-poly, generacion automatica de cascos de colision y presupuestos de poligonos.
- Generacion de texto general y conversacion (pipeline `text-generation`).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- **Generacion de sistemas de combate para Roblox**: el modelo puede producir scripts de validacion de hitboxes en servidor con comprobaciones anti-exploit y limitacion de tasa, aprovechando su especializacion en netcode server-authoritative. Adecuado porque la model card declara entrenamiento especifico en estos patrones.
- **Migracion de codigo Luau legacy**: util para reescribir scripts que usan `wait()`, `spawn()` o `delay()` hacia la libreria `task`, y para anadir tipado `--!strict` a codebases existentes, reduciendo errores en tiempo de ejecucion.
- **Construccion de interfaces de simulador**: generacion de jerarquias `ScreenGui` completas (inventarios de mascotas, tiendas, modales de compra) con animaciones `TweenService`, lo que acelera el prototipado de UI en juegos tipo Pet Simulator.
- **Persistencia de datos de jugador**: generacion de modulos de guardado basados en `ProfileStore`/`ProfileService` con bloqueo de sesion, orientados a evitar dupes y perdida de datos en produccion.
- **Pipeline de assets 3D en Blender**: scripts `bpy` headless que generan mallas low-poly por debajo de 5.000 triangulos con pivotes centrados y orientacion correcta para exportar a Roblox, integrables en un flujo de build automatizado.
- **Herramientas para creadores (plugins de Studio)**: dado su conocimiento de la API de Roblox Studio y de los patrones de UI, puede usarse como backend de un asistente dentro de un plugin que sugiera codigo Luau a creadores.
- **Generacion de prototipos de juego completos**: con 32.768 tokens de contexto puede mantener coherencia entre multiples scripts (servidor, cliente, UI, datos) en una sesion de generacion, util para arrancar prototipos rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla comparativa interna ("KING AI Pro / Coder / Flash") con porcentajes de "Luau Strictness" (99,4%, 98,8%, 94,2%) y valoraciones subjetivas, pero no son benchmarks reproducibles ni se especifica la metodologia, el conjunto de evaluacion ni los modelos exactos comparados. No se deben interpretar como metricas verificadas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 32B, en bfloat16 requiere aproximadamente 64 GB de VRAM solo para pesos, mas overhead de contexto y cache KV. En cuantizacion de 8 bits, en torno a 32-35 GB; en 4 bits, en torno a 18-20 GB (estimaciones estandar para un modelo denso de 32B, no datos publicados por el autor).
- **GPU recomendadas**: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16 sin cuantizar. Para cuantizacion 4/8 bits, una RTX 4090 (24 GB) o RTX A6000 (48 GB) pueden ser viables.
- **Consumer GPU**: si cabe en GPUs de consumo con cuantizacion agresiva (4 bits) en tarjetas de 24 GB como la RTX 4090; en tarjetas de 16 GB o menos requeriria cuantizaciones mas bajas con perdida de calidad o descarga parcial a CPU.
- **Opciones de despliegue**: la model card documenta `transformers` y un servidor `vllm serve king-ai --port 8000 --max-model-len 16384` compatible con la API de OpenAI. No se mencionan llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- **Latencia y throughput**: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KING AI (`kingdavezz/king-ai`) | 32B (declarado) | 32.768 | Roblox/Luau/Blender | Apache 2.0 | Repositorio con 0 descargas y 0,0 GB, sin pesos visibles |
| Qwen2.5-Coder-32B-Instruct | 32B | 32.768 (hasta 131.072 con YaRN) | Codigo general | Apache 2.0 | Ampliamente disponible en Hugging Face |
| DeepSeek-Coder-V2-Instruct | 236B totales / 21B activos (MoE) | 128.000 | Codigo general | Licencia propia de DeepSeek | Disponible en Hugging Face |
| Codestral 22B (Mistral) | 22B | 32.000 | Codigo general, multilingue | Licencia no comercial (MNPL) | Disponible en Hugging Face |

La comparativa relevante es contra su propio modelo base: KING AI no aporta cambios de arquitectura ni de contexto respecto a Qwen2.5-Coder-32B-Instruct, solo un ajuste de dominio cuyos datos de entrenamiento no se documentan. Frente a alternativas generalistas de codigo, su ventaja teorica es la especializacion en convenciones de Roblox, pero la falta de pesos publicados y de evaluaciones verificables impide confirmar esa ventaja.

## Limitaciones y advertencias

- **Estado de publicacion incierto**: el repositorio figura con 0,0 GB de tamano, 0 descargas y 0 likes; no hay evidencia de que los pesos esten realmente subidos. La model card muestra `model_id = "king-ai"` en el ejemplo de codigo, que no coincide con el identificador real del repositorio.
- **Inconsistencias en la documentacion**: la model card menciona "32B / 70B parameter classes" y compara con "DeepSeek V4" y "Llama 3.3", modelos que no corresponden al artefacto publicado. Los porcentajes de "Luau Strictness" no tienen metodologia ni conjunto de evaluacion.
- **Idioma**: solo se declara ingles. No hay soporte documentado de castellano ni de otros idiomas, lo que limita su uso en equipos hispanohablantes que trabajen en su idioma.
- **Riesgo de alucinacion**: como todo modelo de codigo, puede inventar APIs de Roblox que no existen o firmas incorrectas de `ProfileService`/`bpy`; requiere validacion en Studio y en Blender antes de produccion.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-Coder-32B-Instruct conviene verificar que se cumplen las condiciones de la licencia del modelo base (tambien Apache 2.0) y las politicas de uso de Roblox para contenido generado.
- **Sesgos**: no documentados por el autor; al entrenarse presumiblemente con codigo de la comunidad Roblox, puede reproducir practicas obsoletas o inseguras no filtradas.
- **Sin soporte de tool calling ni agentes**: no se documenta function calling ni razonamiento multi-paso, lo que limita su uso en pipelines agenticos sin capas adicionales.
- **Cuantizacion no documentada**: no hay pesos GGUF ni recetas de cuantizacion oficiales, lo que complica el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingdavezz/king-ai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Sitio del autor citado en la model card: https://kingai.dev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
