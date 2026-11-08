# funnelnenad/pip-voice-cleanup

## Resumen

Pip voice cleanup es un ajuste fino mediante LoRA del modelo Qwen3-0.6B de Alibaba, publicado por el usuario funnelnenad. Su proposito no es conversacional: actua como un postprocesador de transcripciones de voz a texto generadas por Whisper en el dispositivo. Toma el texto crudo de un dictado de un desarrollador y devuelve una version limpia, eliminando muletillas, tartamudeos, autocorrecciones habladas, corrigiendo mayusculas, puntuacion, convirtiendo numeros a digitos y reparando terminos tecnicos mal reconocidos a partir de un glosario corto. Mantiene las palabras, el significado y el idioma del hablante.

El modelo esta pensado para ejecutarse dentro de la aplicacion Pip (https://github.com/semse/pip) en Mac, iPhone y Windows, inmediatamente despues de la transcripcion local con Whisper. Se distribuye en formato MLX de 8 bits para Apple Silicon y en GGUF Q8_0 para llama.cpp. La licencia es Apache 2.0 y el modelo base Qwen3-0.6B tiene 596 millones de parametros, lo que lo hace viable en hardware de consumo.

Es relevante porque ejemplifica un patron de despliegue muy concreto: modelos pequenos, especializados y cuantizados que resuelven una tarea acotada de forma local y privada, sin enviar transcripciones a la nube. No compite con asistentes generalistas; compite con heurísticas de limpieza de texto y con el coste de enviar audio a APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste LoRA sobre todas las capas |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencia maxima de 1.024 tokens) |
| Tipos de cuantizacion | MLX 8-bit afines (group size 64) y GGUF Q8_0 |
| Idiomas soportados | ingles, aleman |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre el se aplico un LoRA de todas las capas con rango 16, escala 2 y dropout 0.05, durante 1.562 actualizaciones con batch 4 y learning rate 1e-4 con decaimiento coseno. Se uso enmascaramiento de prompt y una longitud maxima de secuencia de 1.024 tokens. Los pesos LoRA se fusionaron al modelo en bf16 y se cuantizaron a 8 bits con mlx-lm 0.32.2.

Los datos de entrenamiento son exclusivamente sinteticos en aleman e ingles, sin grabaciones personales: pares de dictado crudo y limpio generados por un modelo profesor, muestras del dataset adikuma/mumble-cleanup-dataset (Apache 2.0), el split de entrenamiento de juanquivilla/sotto-transcript-cleanup (MIT), y audio de texto a voz de macOS pasado por Whisper large-v3-turbo para introducir errores de reconocimiento realistas. No se menciona RLHF ni DPO. La innovacion principal no es arquitectonica sino de integracion: en Pip se usa un prompt de sistema fijo, generacion greedy con thinking desactivado y un prefijo `<cleaned>`, y solo se acepta una respuesta cerrada `<cleaned>…</cleaned>` que supere una guarda de procedencia de palabras (pocas palabras nuevas, borrados acotados). Si falla, se conserva el texto crudo de Whisper.

## Capacidades

- Limpieza de transcripciones de dictado: elimina muletillas, tartamudeos y repeticiones.
- Aplicacion de autocorrecciones habladas del tipo "no, espera, ...".
- Correccion de mayusculas y puntuacion.
- Conversion de numeros hablados a digitos.
- Reparacion de terminos tecnicos mal transcritos mediante un glosario corto.
- Preservacion del idioma del hablante (el aleman se mantiene en aleman).
- Generacion de texto condicionada a un formato estricto de entrada y salida.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta razonamiento multi-paso ni modo thinking (se desactiva explicitamente).
- No soporta vision ni audio de forma nativa; solo texto.
- Capacidades multilingues limitadas a ingles y aleman.

## Casos de uso

- Dictado para agentes de codigo en local: el modelo limpia la transcripcion de Whisper antes de pasarla a un agente de programacion, de modo que las instrucciones llegan sin muletillas ni errores de reconocimiento de terminos tecnicos, y todo el proceso ocurre en el dispositivo.
- Aplicaciones de notas por voz en Mac e iPhone: integrado via MLX, convierte dictados largos en texto legible con puntuacion y numeros correctos, sin enviar audio a servidores externos.
- Flujos de trabajo en Windows con llama.cpp: la variante GGUF Q8_0 permite desplegar la limpieza en equipos sin GPU Apple, manteniendo la privacidad de las transcripciones.
- Postprocesado de subtitulos y transcripciones de reuniones: aplicado en lote sobre salidas de Whisper para mejorar legibilidad antes de publicar o archivar.
- Herramientas de accesibilidad: usuarios que dictan en lugar de teclear obtienen texto con formato correcto y autocorrecciones aplicadas, reduciendo la carga de edicion manual.
- Pipelines de documentacion tecnica dictada: el glosario de terminos tecnicos permite que nombres de funciones, librerias y comandos se transcriban correctamente en ingles y aleman.
- Prototipado de asistentes de voz con requisitos de privacidad: sirve como componente de limpieza en arquitecturas donde el audio y el texto no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 1,3 GB; los pesos MLX 8-bit ocupan 633 MB y el GGUF Q8_0 639 MB. La inferencia completa cabe holgadamente en menos de 2 GB de memoria unificada o VRAM.
- GPU recomendadas: Apple Silicon (MLX) para Mac y iPhone; en Windows, CPU o GPU con llama.cpp. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2 GB de VRAM, y en CPU moderna con llama.cpp.
- Opciones de despliegue: mlx-lm (formato MLX), llama.cpp (GGUF Q8_0), y la integracion propia de Pip.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Pip voice cleanup (Qwen3-0.6B LoRA) | 596 M | no disponible (entrenado a 1.024) | Apache 2.0 | Limpieza de transcripciones, en y de |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | Apache 2.0 | Generacion de texto general |
| Modelos de limpieza de transcripciones de mayor tamano | no disponible | no disponible | variable | Limpieza de texto, generalmente en la nube |

No se dispone de datos de benchmarks ni de alternativas directas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo muy especializado: fuera del formato de prompt de Pip (system prompt fijo, transcripcion entre etiquetas `<transcript>`, prefijo `<cleaned>`) su comportamiento puede degradarse.
- Solo ingles y aleman; no hay soporte documentado para castellano.
- Entrenado exclusivamente con datos sinteticos, lo que puede introducir sesgos de distribucion respecto a dictados reales.
- Riesgo de alucinacion o de introducir palabras no presentes en el original; por eso Pip aplica una guarda de procedencia de palabras y descarta la salida si no la supera.
- No es un asistente: no responde ni ejecuta instrucciones contenidas en el dictado, lo que limita su uso a limpieza de texto.
- Contexto de entrenamiento de 1.024 tokens; dictados mas largos pueden requerir troceado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funnelnenad/pip-voice-cleanup
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Version bf16 usada para el ajuste: https://huggingface.co/mlx-community/Qwen3-0.6B-bf16
- Repositorio de la aplicacion Pip: https://github.com/semse/pip
- MLX: https://github.com/ml-explore/mlx
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset adikuma/mumble-cleanup-dataset: https://huggingface.co/datasets/adikuma/mumble-cleanup-dataset
- Dataset juanquivilla/sotto-transcript-cleanup: https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup
