# maxhugger/nushell-lfm3-1.7b-lora

## Resumen

`maxhugger/nushell-lfm3-1.7b-lora` es un adaptador LoRA de rango bajo entrenado sobre el modelo base LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parámetros desarrollado por Liquid AI. El adaptador convierte peticiones en lenguaje natural en una única llamada a la herramienta `run_nushell`, es decir, genera comandos válidos para el shell Nushell a partir de instrucciones del usuario y un contexto de workspace. Lo publica el usuario maxhugger y está pensado como componente especializado de tool calling, no como modelo de propósito general.

La relevancia del adaptador está en su método de evaluación: las llamadas generadas se validan ejecutándolas y comparando el resultado con un valor de referencia exacto, no mediante similitud textual. Con este criterio, el modelo base acierta el 8% de 40 peticiones y el adaptador con LoRA alcanza el 95% en esas mismas 40, y un 92,6% sobre 231 peticiones held-out de cuatro proyectos que no vio en entrenamiento. Son cifras de nicho, pero medidas de forma rigurosa y con una mejora de dos órdenes de magnitud sobre el base.

El adaptador es pequeño (8,2 M de parámetros, rank 8, alpha 16) y está empaquetado en formato MLX para Apple Silicon, con pesos en `adapter.safetensors`. No es un modelo autónomo: requiere cargar LFM3-1.7B en su build MLX de 8 bits y aplicar el adaptador con el cargador incluido en el repositorio. La licencia heredada es LFM1.0, la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | 8,2 M en el adaptador; modelo base LFM3-1.7B con 1.700 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | adaptador en safetensors; modelo base usado en build MLX de 8 bits |
| Idiomas soportados | no disponible (el dataset y las peticiones de ejemplo están en inglés) |
| Licencia | lfm1.0 (heredada de LiquidAI/LFM3-1.7B) |
| Formato de pesos | safetensors (`adapter.safetensors`), librería MLX |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre todas las capas lineales de los 24 bloques del transformer LFM3-1.7B, con rank 8, alpha 16 y dropout 0. Los pesos se nombran según la convención de `mlx_lm.tuner.lora.LoRALinear`, lo que permite cargarlos con `lm.load_weights(..., strict=False)` tras adjuntar las capas LoRA con `attach_lora`. El repositorio incluye además `prompt_format.json` (system prompt, definición de la herramienta, prefijo del turno del asistente y stop strings) y `adapter_config.json`.

El entrenamiento se hizo con MLX en un Mac sobre el build de 8 bits del modelo base, con un dataset generado desde cero (`maxhugger/nushell-tool-calls`). Se usaron 825 filas durante 2 épocas (414 actualizaciones), batch 4, learning rate 2e-4 con warm-up y decaimiento coseno, AdamW y clipping de gradiente a 1.0. El rank, el learning rate y la ubicación del adaptador se eligieron mediante un barrido y una ablación evaluados por ejecución sobre 24 peticiones held-out. Las firmas de comandos corresponden a Nushell 0.117.0 y las fuentes de muestreo incluyen el libro y cookbook de Nushell, NL2Bash, `spignelon/bash_history` y el dataset Shell Aliases de Schröder y Cito (2022).

## Capacidades

- Generación de llamadas a herramienta: convierte una petición en lenguaje natural en una única invocación `run_nushell` con argumentos estructurados.
- Generación de comandos Nushell válidos: listado y búsqueda de ficheros, operaciones de texto y tablas, consultas de configuración y pipelines con recuperación ante errores.
- Formato de salida JSON cuando la petición lo requiere (por ejemplo, listar el contenido de `etc` como JSON).
- Tool calling con formato fijo: system prompt, turno de usuario con `Request:`, `Workspace:` y `Files:`, y turno del asistente iniciado con `<tool_call>`.
- Ejecución verificable: las llamadas generadas pueden ejecutarse y validarse contra un valor de referencia.
- No cubre SQL, dataframes ni agentes multi-paso, según declara el autor.

## Casos de uso

- Asistente de terminal especializado en Nushell: el adaptador traduce instrucciones como "lista lo que hay en etc y dámelo en JSON" en una llamada `run_nushell` ejecutable, útil para integrar un copiloto de shell en editores o terminales.
- Automatización de tareas de inspección de repositorios: dado un workspace con ficheros conocidos, genera comandos para listar, buscar o resumir contenido, con validación por ejecución en una copia desechable del proyecto.
- Generación de pipelines de datos en shell: cubre operaciones de texto y tablas en Nushell, adecuado para scripts de transformación de CSV o logs desde la línea de comandos.
- Consulta de configuración de proyectos: el adaptador maneja peticiones de búsqueda de claves en ficheros de configuración (`etc/app.toml`, `etc/flags.json`) y devuelve el valor mediante un comando ejecutable.
- Evaluación de modelos de tool calling: sirve como referencia reproducible para medir precisión por ejecución en lugar de por similitud textual, con un harness incluido en el repositorio.
- Demo en navegador: el autor publica un build ONNX (`maxhugger/nushell-lfm3-1.7b-onnx`) y un Space (`nushell-lfm-demo`) para probar el adaptador sin infraestructura local, apoyado en Nushell compilado a WebAssembly (`nu-wasm`).
- Entrenamiento de asistentes de shell para otros lenguajes: la receta (dataset generado, LoRA sobre todas las lineales, evaluación por ejecución) es reutilizable para bash, zsh o PowerShell.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos por ejecución y comparación exacta con un valor de referencia por petición:

| Modelo | Peticiones | Llamada bien formada | Se ejecuta | Devuelve el valor de referencia |
|---|---|---|---|---|
| LFM3-1.7B base | 40 | 78% | 48% | 8% |
| Con este adaptador | 40 | 100% | 100% | 95% |
| Con este adaptador, held-out completo | 231 | 100% | 98% | 92,6% |
| gpt-6-luna (reasoning off) | 40 | no disponible | no disponible | 32,5% |
| claude-haiku-5-5 | 40 | no disponible | no disponible | 17,5% |

Las 231 peticiones held-out provienen de cuatro proyectos generados que el modelo no vio en entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 8,2 M de parámetros (decenas de MB en safetensors); el coste real es el modelo base LFM3-1.7B.
- El autor entrena y ejecuta con MLX en Apple Silicon; el build de referencia es el MLX de 8 bits de LFM3-1.7B.
- VRAM/unified memory estimada para el base en 8 bits: en torno a 2 GB de pesos más overhead de contexto y caché KV; no disponible una cifra oficial.
- Cabe en Macs con Apple Silicon de gama consumer (M1/M2/M3 con 8 GB o más de memoria unificada), dado el tamaño del base y la cuantización de 8 bits.
- En GPU NVIDIA no hay ruta oficial documentada para este adaptador; requeriría portar los pesos LoRA a otro stack (por ejemplo, PEFT/vLLM) y validar el formato de prompt, algo no cubierto por el autor.
- Opciones de despliegue documentadas: `mlx_vlm` con el cargador del repositorio y el build ONNX para navegador. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Precisión (40 peticiones) | Licencia |
|---|---|---|---|---|---|
| Este adaptador (LFM3-1.7B + LoRA) | 1.700 M + 8,2 M | no disponible | Nushell tool calling | 95% | lfm1.0 |
| LFM3-1.7B base | 1.700 M | no disponible | General | 8% | lfm1.0 |
| gpt-6-luna (reasoning off) | no disponible | no disponible | General con tool calling | 32,5% | propietaria |
| claude-haiku-5-5 | no disponible | no disponible | General con tool calling | 17,5% | propietaria |

No se dispone de comparación con otros adaptadores LoRA especializados en shell publicados en la información proporcionada.

## Limitaciones y advertencias

- Dominio acotado: solo cubre los tipos de petición del dataset (listado y búsqueda de ficheros, operaciones de texto y tablas, consultas de configuración, pipelines con recuperación). SQL, dataframes y agentes multi-paso quedan fuera de alcance.
- Sesgo de evaluación: los proyectos held-out comparten patrones de cadena con el entrenamiento; la puntuación de 92,6% corresponde a tipos de petición conocidos en proyectos no vistos, no a peticiones de dominio nuevo.
- Riesgo de comandos destructivos: el autor recomienda ejecutar las llamadas generadas en un entorno aislado o copia desechable del proyecto; el repositorio lo hace así.
- Dependencia del prompt: el adaptador espera un formato concreto (system prompt, `Request:`, `Workspace:`, `Files:`, prefijo `<tool_call>` y stop strings definidos en `prompt_format.json`); desviarse de él degrada la salida.
- Idiomas: no hay información sobre soporte multilingüe; los ejemplos y el dataset están en inglés.
- Licencia LFM1.0 heredada: conviene revisar sus términos antes de uso comercial, ya que el adaptador no puede tener condiciones más permisivas que el modelo base.
- Ecosistema limitado: empaquetado solo para MLX; no hay pesos GGUF ni integración con servidores de inferencia estándar.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/maxhugger/nushell-lfm3-1.7b-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/maxhugger/nushell-tool-calls
- Código y notebook: https://github.com/maxtheman/nushell-lfm
- Build ONNX para navegador: https://huggingface.co/maxhugger/nushell-lfm3-1.7b-onnx
- Demo en navegador: https://huggingface.co/spaces/maxhugger/nushell-lfm-demo
- Nushell en WebAssembly: https://huggingface.co/spaces/maxhugger/nu-wasm
- Nushell: https://github.com/nushell/nushell
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
