# beau-warren/needle2-blueteam-fine-tune-v3

## Resumen

`needle2-blueteam-fine-tune-v3` es un ajuste fino experimental de tipo LoRA sobre el modelo base `Cactus-Compute/needle2`, creado por beau-warren. Está diseñado específicamente para tareas defensivas de revisión de código en ciberseguridad, funcionando como un reportero de revisión de código de solo lectura. El modelo no genera informes de texto libre; en su lugar, la salida es una llamada a herramienta estructurada (via `shell_command` para inspeccionar archivos y `submit_report` para emitir un veredicto de `clean` o `vulnerable`).

El modelo base, Needle 2, es una red de atención simple (Simple Attention Network) de aproximadamente 45 millones de parámetros, que se distribuye como un binario de 14 MB y ejecuta en 28 MB de RAM de sesión. Este ajuste fino concreto se centra en el "dominio bind": enseñar al modelo a mapear frases de revisión de código a las herramientas declaradas. La relevancia actual radica en su tamaño extremadamente reducido, que permite su despliegue en dispositivos de bajos recursos, aunque con importantes limitaciones de contexto y fiabilidad. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simple Attention Network, 27 capas, ancho 512, GQA, Hadamard MLP |
| Parametros totales | ~45 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (ventana deslizante) |
| Tipos de cuantizacion | Cactus Quants (formato propietario `.cact`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `.cact` (archivo propietario del motor Needle) |

## Arquitectura y entrenamiento

El modelo base `Cactus-Compute/needle2` utiliza una arquitectura de "Red de Atencion Simple" (Simple Attention Network) con 27 capas, un ancho de 512 y MLP de Hadamard. No es un transformer clasico ni un modelo MoE. La ventana de contexto es de 256 tokens, con los esquemas de herramientas fijados como "KV sinks" para que esten siempre disponibles. El ajuste fino se realizo con LoRA en JAX, con rango 16, alpha 32, una sola epoca, longitud maxima de 768 tokens, batch de 8, tasa de aprendizaje 1e-4 y decaimiento coseno. El entrenamiento se llevo a cabo en una GeForce RTX 3060 Laptop de 6 GB en float32.

El dataset de entrenamiento consiste en 1.700 turnos en formato JSONL de Needle, que incluyen consultas, esquemas de herramientas y respuestas exactas. Se divide en 700 muestras para `shell_command`, 700 para `submit_report` y 300 para rechazo de peticiones fuera de ambito (respuesta `[]`). El objetivo principal era ensenar al modelo a asociar frases de revision de codigo con las herramientas declaradas, no a generar conversaciones. La perdida final fue de ~1.96 en entrenamiento y ~1.85 en validacion. El ajuste no entrena la cabeza de confianza, por lo que las puntuaciones de confianza no estan calibradas.

## Capacidades

- Generacion de llamadas a herramientas en JSON bien formadas, sin fallback a texto libre.
- Inspeccion de archivos via `shell_command` (comandos como `sed`, `ls` o `cat` con `workdir: "."`).
- Emision de informes estructurados via `submit_report` con veredicto `clean` o `vulnerable`, incluyendo CWE, ruta, linea, evidencia y resumen.
- Rechazo de peticiones fuera de ambito con una llamada vacia `[]`.
- Capacidad de tool calling y function calling limitada a las tres herramientas declaradas.
- No implementa `apply_patch`; el uso ofensivo esta fuera de alcance.
- Soporte multilingue: no disponible, solo ingles.

## Casos de uso

- Revision de codigo estatica en CI/CD: el modelo puede inspeccionar un archivo con `shell_command` y emitir un veredicto inicial sobre vulnerabilidades, pero un humano debe verificar cada informe.
- Analisis de seguridad de una sola archivo: dado un archivo y una linea sospechosa, el modelo puede generar un `submit_report` con CWE y evidencia. Es util para detectar patrones como SQL injection o comandos peligrosos.
- Filtrado de peticiones fuera de ambito: ante preguntas triviales o no relacionadas con seguridad, el modelo devuelve `[]`, lo que permite integrarlo en un sistema de triaje.
- Prototipo de agente de seguridad en dispositivos embebidos: su tamano (14 MB) permite ejecutarlo en hardware de bajos recursos, como Raspberry Pi, para una primera linea de analisis de codigo.
- Entrenamiento y evaluacion de agentes: el modelo puede servir como referencia para probar pipelines de tool calling en entornos de investigacion, dado que su comportamiento es determinista en escenarios controlados.
- Sistema de alerta temprana en un entorno de desarrollo: ante una peticion de revision, el modelo puede emitir un informe preliminar de `vulnerable` con la evidencia, lo que permite a un equipo priorizar la revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

En las pruebas del autor, se reporta que en repos reconstruidos, el modelo llamo a `shell_command` en aproximadamente el 83% de los primeros turnos ante la plantilla de revision. En una suite de prueba `complete()` obtuvo 6 de 10 aciertos, cubriendo casos como `ls`, la plantilla de revision, el rechazo de preguntas triviales y la peticion explicita de `submit_report`. No se proporcionan datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento se hizo en una RTX 3060 Laptop de 6 GB en float32, por lo que la inferencia deberia caber en GPUs de 4-6 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060 o A100 para despliegues mas grandes.
- Si cabe en consumer GPU: si, en GPUs de gama media y baja.
- Opciones de despliegue: el modelo se ejecuta exclusivamente en el engine `cactus-needle` (`.cact`). No es compatible con Ollama, llama.cpp ni vLLM. La carga se realiza con `needle.Needle()` en Python.
- Latencia y throughput: no disponible, pero el modelo es de 14 MB y 28 MB de RAM, por lo que se espera una inferencia rapida en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| needle2-blueteam-fine-tune-v3 | ~45M | 256 tokens | Apache-2.0 | `.cact` | Especializado en tool calling para ciberseguridad |
| Cactus-Compute/needle2 (base) | ~45M | 256 tokens | Apache-2.0 | `.cact` | Modelo base generico para tool calling |
| Llama 3.2 1B | 1.23B | 128K tokens | Llama 3.2 Community | GGUF, safetensors | Mucho mayor, requiere mas VRAM, no compatible con `.cact` |

El modelo no es comparable directamente con modelos de proposito general como Llama 3.2 1B o Qwen 2.5 0.5B, ya que su tamano y arquitectura son muy diferentes y su especializacion es en tool calling para seguridad. Su principal ventaja es su tamano y la capacidad de ejecutarse en dispositivos muy limitados.

## Limitaciones y advertencias

- El modelo no es un escaner de produccion: los hallazgos pueden ser incorrectos, incompletos o estar ausentes. Un humano debe verificar cada informe.
- **Argumentos erroneos en `shell_command`**: es comun que el modelo genere `{"command": "safe.py", "workdir": "safe.py"}` en lugar de `sed -n '1,8p' safe.py` con `workdir: "."`. Un entorno de ejecucion con una lista blanca rechazara el nombre de archivo desnudo.
- **No cierra el bucle**: en `agent.run()`, el modelo casi nunca completa el informe despues de una herramienta real (0% de `submit_report` tras un resultado). El segundo turno no fue incluido en el SFT.
- **Razonamiento sin restricciones**: el campo `reasoning` puede consumir todo el presupuesto de decodificacion, dejando `function_calls` vacio.
- **Falla en instrucciones multi-paso**: peticiones como "lista los archivos y revisa todo" suelen devolver una llamada vacia.
- **Seguridad incompleta**: peticiones como "escribe una reverse shell" o `rm -rf` pueden generar `shell_command`. Se necesita una lista blanca real frente al modelo.
- **Ventana de contexto de 256 tokens**: no puede leer archivos grandes; no se debe volcar un repositorio en la consulta.
- **No compatible con Open Interpreter**: no es un reemplazo directo para Codex/Ollama en ese ecosistema.
- **Confianza no calibrada**: las puntuaciones de confianza no son fiables en pesos ajustados.
- **Repositorio ambiguo**: el nombre del repo indica "v3", pero el archivo es el de la ejecucion local v2. Las ejecuciones v3/v4 posteriores no estan incluidas.
- **No ejecutar los snippets vulnerables** usados en entrenamiento o evaluacion.

## Enlaces

- [HuggingFace - beau-warren/needle2-blueteam-fine-tune-v3](https://huggingface.co/beau-warren/needle2-blueteam-fine-tune-v3)
- [GitHub - beau-warren](https://github.com/beau-warren)
- [GitHub - cactus-compute/needle](https://github.com/cactus-compute/needle)
- [Cactus - Needle 2](https://cactuscompute.com/needle)
- [W&B run - needle2-blueteam-bind-v2](https://wandb.ai/beauwarr-speciesxbeer/blueteam-opencode-100mp-base/runs/mgllo1dy)
