# netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter

## Resumen

Qwen3.8-27B-pi-adapted-MLX-adapter es un adaptador LoRA en formato mlx-lm para Apple Silicon, publicado por NetProjects (Internet Projects Ltd). No es un modelo completo, sino la conversion del LoRA de harness-hub/Qwen3.8-27B-pi-adapted (revision e786f84) al layout que espera la libreria mlx-lm, de modo que pueda cargarse sobre cualquier build MLX del modelo base Qwen/Qwen3.8-27B. El adaptador tiene rango 32, escala 2.0 (alpha 64) y se aplica sobre las proyecciones q, k, v y o de las 16 capas con atencion completa, y sobre gate, up y down de las 64 capas del modelo.

El proposito del adaptador es convertir el modelo base en el motor del agente de codificacion pi (earendil-works/pi) para tareas de ingenieria de software y de terminal. Segun los resultados publicados por harness-hub con el modo thinking desactivado, el adaptador eleva Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con entre un 55% y un 64% menos de llamadas a herramientas por tarea.

El interes practico del artefacto es que permite mantener una unica copia del modelo base en memoria y activar o desactivar el adaptador segun la tarea, algo util en equipos Apple Silicon con memoria unificada limitada. Para despliegues de un solo modelo, el autor recomienda las builds ya fusionadas (6-bit, 8-bit, 4-bit, bf16) por ser algo mas rapidas y mas sencillas de servir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer Qwen3.8-27B; aplicado con mlx-lm |
| Parametros totales | no disponible (el adaptador pesa 638 MB en float32; el modelo base Qwen3.8-27B no detalla parametros en la informacion) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en float32; las builds fusionadas del autor ofrecen 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador LoRA en formato mlx-lm (layout transpuesto del original); builds fusionadas en MLX (4/6/8-bit, bf16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con escala 2.0 (alpha 64) sobre el transformer Qwen3.8-27B. Concretamente, se aplica sobre las proyecciones q, k, v y o de las 16 capas con atencion completa, y sobre gate, up y down de las 64 capas del modelo. En total genera 256 modulos LoRA en mlx-lm, y el autor verifica que la actualizacion de cada modulo equivale exactamente a 2.0 · B @ A del fichero original de harness-hub. Los pesos se mantienen en los valores float32 originales, unicamente transpuestos al layout de mlx-lm.

El entrenamiento del LoRA original lo realizo harness-hub mediante aprendizaje por refuerzo (AsyncGRPO en TRL) para especializar el modelo en tareas de ingenieria de software y de terminal dentro del agente pi. La model card no detalla el volumen ni la composicion del dataset de entrenamiento. La innovacion tecnica del artefacto de NetProjects es de empaquetado y verificacion: confirmar la equivalencia numerica de los 256 modulos y validar que, con la plantilla de chat incluida y thinking desactivado, el modelo produce llamadas a herramientas bien formadas y supera 3 de 3 tareas cortas de codigo en una prueba cualitativa.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredados del modelo base Qwen3.8-27B.
- Entrada image-text-to-text: el pipeline declarado admite imagenes ademas de texto.
- Codificacion y tareas de terminal: el adaptador esta entrenado especificamente para el agente pi en escenarios de ingenieria de software.
- Tool calling / function calling: validado con thinking desactivado; produce llamadas a herramientas bien formadas.
- Reduccion de llamadas a herramientas: entre un 55% y un 64% menos por tarea respecto al modelo base, segun los resultados publicados.
- Modo thinking conmutable: la plantilla de chat incluida permite activar o desactivar el razonamiento explicito (enable_thinking).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codificacion en local sobre Apple Silicon: cargar el adaptador sobre mlx-community/Qwen3.8-27B-4bit y servir con mlx_lm.server para que pi lo consuma con "api": "openai-completions" y thinking desactivado; adecuado para equipos Mac con memoria unificada que quieran evitar servicios en la nube.
- Automatizacion de tareas de terminal: el adaptador mejora Terminal-Bench 2.1 del 39,5% al 55,8%, por lo que resulta apropiado para agentes que ejecutan comandos, inspeccionan ficheros y encadenan pasos en shell.
- Resolucion de issues de software: con SWE-bench Pro (hard 51) al 62,7%, encaja en flujos de parcheo de repositorios y generacion de diffs acotados.
- Optimizacion de coste por tarea: al reducir entre un 55% y un 64% las llamadas a herramientas, disminuye la latencia acumulada y el consumo de tokens en pipelines de agentes de varios pasos.
- Experimentacion con un unico modelo base: mantener una sola copia de Qwen3.8-27B en memoria y alternar el adaptador segun se requiera comportamiento de agente o comportamiento generalista.
- Evaluacion de adaptadores LoRA en MLX: usar el ejemplo de carga con adapter_path para comparar el efecto del adaptador frente al modelo base en tareas propias.
- Prototipado multimodal: al declarar pipeline image-text-to-text, puede emplearse en pruebas que combinen capturas de pantalla o diagramas con instrucciones de codigo, aunque el autor no documenta resultados especificos en vision.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador original, bajo el agente pi y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | 55-64% menos |

Calidad de las builds fusionadas publicadas por NetProjects, medidas como coincidencia del siguiente token con bf16 y divergencia KL frente a bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 99,0% | 0,0015 |
| MLX-8bit | 30,0 GB | 99,1% | 0,0004 |
| MLX-4bit | 16,3 GB | 95,6% | 0,0201 |
| MLX-bf16 | 55,6 GB | referencia | referencia |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el adaptador solo ocupa 638 MB, pero requiere cargar el modelo base. Con la build 4-bit de Qwen3.8-27B el consumo ronda los 16,3 GB; la 6-bit, 23,1 GB; la 8-bit, 30,0 GB; y bf16, 55,6 GB.
- GPU recomendadas: el adaptador esta pensado para Apple Silicon (MLX); el autor lo verifico en un MacBook Pro M5 Max con 128 GB de memoria unificada. Para GPU NVIDIA no se documenta soporte de este adaptador en formato mlx-lm.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; con la build 4-bit (16,3 GB) es viable en configuraciones de 24 GB o mas. En GPUs NVIDIA consumer no aplica este formato.
- Opciones de despliegue: mlx-lm (mlx_lm.generate, API Python y mlx_lm.server con --adapter-path); requiere mlx-lm >= 0.32.2. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor senala que las builds fusionadas son algo mas rapidas que cargar base + adaptador, sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter | LoRA sobre Qwen3.8-27B (MLX) | Adaptador 638 MB; base no detallado | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| harness-hub/Qwen3.8-27B-pi-adapted | LoRA original (formato TRL) | Adaptador; base no detallado | no disponible | Apache-2.0 (segun el autor) | Hugging Face |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | Modelo fusionado cuantizado (MLX) | Base Qwen3.8-27B | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | Modelo base | no detallado | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base Qwen3.8-27B no es utilizable.
- Dependencia de plataforma: formato mlx-lm, orientado a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni otras pilas de inferencia.
- Los benchmarks citados (Terminal-Bench 2.1 y SWE-bench Pro) provienen de harness-hub y se midieron con el agente pi y thinking desactivado; no son extrapolables a otros agentes, plantillas o modos de razonamiento.
- La validacion de NetProjects se limita a una comprobacion numerica de los 256 modulos y a 3 tareas cortas de codigo en un unico equipo (MacBook Pro M5 Max, 128 GB); es una muestra muy reducida.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.8-27B.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingue equivalente al del modelo base.
- Contexto maximo no documentado; conviene verificar la configuracion del modelo base antes de usarlo en conversaciones largas o repositorios extensos.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Hugging Face, harness-hub ni Alibaba; conviene revisar el NOTICE y las condiciones del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- LoRA original de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build fusionada 6-bit (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build fusionada 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build fusionada 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build fusionada bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Agente pi: https://github.com/earendil-works/pi
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
