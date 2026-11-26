# munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MTPLX-4bit

## Resumen

Inkling-2-Mini-Uncensored-AtomicChat-MTPLX-4bit es un empaquetado cuantizado a 4 bits del modelo multimodal Inkling-2-Mini de Thinking Machines Lab, adaptado por AtomicChat para eliminar los mecanismos de rechazo y posteriormente convertido al formato MTPLX por el usuario munaikh para su ejecución en Apple Silicon. El modelo combina una arquitectura de mezcla de expertos (MoE) con capacidades de visión y texto, y está optimizado específicamente para el motor MTPLX con decodificación especulativa DSpark en hardware de Apple.

El paquete tiene 27.530.496.048 parámetros totales y ocupa 17,21 GB en disco, con pesos en formato safetensors cuantizados de forma mixta: NVFP4 para las proyecciones de los expertos, 8 bits afín para las salidas de atención y BF16 para el embedding de tokens. Según el autor, alcanza 70,0 tok/s en un Apple M4 Max con DSpark a profundidad 3, lo que representa 1,62 veces el throughput de decodificación de Atomic Engine (43,2 tok/s).

La relevancia de este release es doble: por un lado demuestra una ruta de cuantización mixta (NVFP4 + 8-bit + BF16) preservando fidelidad respecto al GGUF Q4_K de referencia (77,05 % en MMLU frente a 76,40 %); por otro, elimina por completo los rechazos ante prompts inseguros (0 de 200 en XSTest), lo que lo hace inadecuado para despliegues que requieran salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer con visión; runtime MTPLX |
| Parametros totales | 27.530.496.048 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 (grupos de 16, escalas E4M3, máximo FP32 por experto) en down-projections de expertos; 8-bit afín grupo-64 en salidas de atención; BF16 en embedding de tokens |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MTPLX) |

## Arquitectura y entrenamiento

El modelo parte de thinkingmachines/Inkling-2-Mini, un transformer de mezcla de expertos con capacidad de procesamiento imagen-texto. Sobre él se aplicó el adaptador de AtomicChat (revisión `82b34b9b0e5bc2e3e7b6d617ec8cc3e0f9692ee2`) para eliminar el comportamiento de rechazo, y posteriormente munaikh realizó la conversión al layout MTPLX "Optimized Speed" de Youssofal. Los 49 pares de adaptadores se aplicaron a los pesos fuente decodificados en FP32, con comprobaciones matriciales sobre las 3.072 matrices de expertos.

El empaquetado conserva 1.550 tensores objetivo exportados, 422 tensores de visión y la cabeza DSpark original de 54 tensores, todos verificados contra el checkpoint oficial (`c9d028302cd0f035fdf8e7e91f089a4ce94d2195`). La innovación técnica principal es la cuantización mixta por grupo: NVFP4 nativo en las pilas de down-projection de los 24 expertos editados, 8-bit afín grupo-64 en las 24 salidas de atención editadas y BF16 en el embedding. El modelo soporta decodificación especulativa DSpark (profundidad 3) mediante el motor MTPLX, que acelera la generación frente a la decodificación autorregresiva pura. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo de razonamiento configurable (`reasoning_effort`).
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`).
- Decodificación especulativa DSpark a profundidad configurable (por defecto 3) para acelerar la generación.
- Ejecución en Apple Silicon mediante el motor MTPLX (CLI `mtplx serve` y aplicación de escritorio).
- Servidor compatible con la API OpenAI (`/v1/chat/completions`).
- Comportamiento sin rechazos: 0 rechazos en 200 prompts inseguros de XSTest.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.

## Casos de uso

- Evaluación de cuantización mixta en Apple Silicon: el pack sirve como referencia reproducible para medir el impacto de NVFP4 + 8-bit + BF16 frente a GGUF Q4_K, con scripts de benchmark incluidos y resultados de fidelidad publicados.
- Investigación sobre alineación y rechazo: al comparar los 0 rechazos en XSTest con los 184 del pack stock, permite estudiar cómo un adaptador modifica el comportamiento de seguridad de un modelo base.
- Despliegue local en estaciones de trabajo Mac: con 17,21 GB y 70 tok/s en M4 Max, es viable para prototipos conversacionales y asistentes locales sin GPU dedicada.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede usarse para extraer y describir contenido de capturas, diagramas o documentos escaneados en flujos locales.
- Benchmarking de motores de inferencia: útil para comparar MTPLX con DSpark frente a motores autorregresivos en la misma máquina, dado que el autor publica metodología y comandos de reproducción.
- Experimentación con decodificación especulativa: permite medir el efecto de la profundidad DSpark (por ejemplo, 3 frente a generación solo objetivo) sobre latencia y throughput en hardware Apple.
- Generación de contenido sin filtros en entornos controlados: para pruebas internas de red teaming o investigación lingüística donde se requiera ausencia de rechazos, siempre con las advertencias de uso aceptable.

## Benchmarks y rendimiento

| Configuracion | MMLU correctas | MMLU accuracy | Rechazos seguros | Rechazos inseguros | Throughput |
|---|---:|---:|---:|---:|---:|
| AtomicChat Q4_K, target only | 1.528 / 2.000 | 76,40 % | 0 / 250 | 0 / 200 | no disponible |
| 4-bit MTPLX server, target only | 1.541 / 2.000 | 77,05 % | 0 / 250 | 0 / 200 | no disponible |
| 4-bit MTPLX, DSpark depth 3 | 1.541 / 2.000 | 77,05 % | 0 / 250 | 0 / 200 | 70,0 tok/s (M4 Max) |
| Unedited stock MTPLX, target only | no disponible | no disponible | 10 / 250 | 184 / 200 | no disponible |
| Atomic Engine (referencia) | no disponible | no disponible | no disponible | no disponible | 43,2 tok/s (M4 Max) |

Los dos modelos coincidieron en 1.844 de 2.000 respuestas de MMLU y en 450 de 450 etiquetas de rechazo de XSTest. La diferencia de MMLU respecto al GGUF es de +0,65 puntos porcentuales. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 17,21 GB de pesos; en Apple Silicon se comparte memoria unificada, por lo que se recomienda al menos 24 GB de memoria unificada para cargar el pack con margen para el contexto y el servidor.
- GPU recomendadas: Apple M4 Max (medido a 70 tok/s); no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: no disponible; el pack está orientado a Apple Silicon y el motor MTPLX.
- Opciones de despliegue: motor MTPLX 2.13.3 (CLI `mtplx serve` y aplicación de escritorio); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 70,0 tok/s en M4 Max con DSpark a profundidad 3, medido sobre tres prompts cortos repetidos tres veces tras warm-up con 192 tokens de salida por ejecución.
- Puertos y API: el servidor expone una API compatible con OpenAI; el ejemplo del autor usa el puerto 18464 en CLI y 8000 en la aplicación de escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato / disponibilidad |
|---|---|---|---:|---|---|
| Inkling-2-Mini-Uncensored-AtomicChat-MTPLX-4bit | 27.530.496.048 | no disponible | 77,05 % | Apache 2.0 | safetensors MTPLX, Apple Silicon |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF (Q4_K) | no disponible | no disponible | 76,40 % | Apache 2.0 | GGUF |
| Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed (stock) | no disponible | no disponible | no disponible | no disponible | safetensors MTPLX |
| thinkingmachines/Inkling-2-Mini (oficial) | no disponible | no disponible | no disponible | no disponible | checkpoint oficial |

La comparativa directa con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de salvaguardas: 0 rechazos en 200 prompts inseguros de XSTest frente a 184 del pack stock; no debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- La política de uso aceptable de Thinking Machines Lab cubre las releases modificadas y restringe eludir salvaguardas para usos prohibidos; el propio autor lo advierte en la model card.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Dependencia del motor MTPLX 2.13.3 y de Apple Silicon; no hay soporte documentado para vLLM, llama.cpp u otros runtimes.
- Fidelidad de cuantización: el autor reporta un error RMS del 157,2 % relativo a la actualización FP32 en la muestra de coeficientes de expertos, con una ganancia proyectada de 0,3830; conviene validar la calidad en la tarea concreta antes de producción.
- La revisión original `6e7c8248f75265bdd4fbab5273304243b5d8c2cb` devolvió HTTP 404 en Hugging Face durante la construcción; el pack se basa en el snapshot `c9d028302cd0f035fdf8e7e91f089a4ce94d2195`.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MTPLX-4bit
- Release MLX standalone: https://huggingface.co/munaikh/Inkling-2-Mini-Uncensored-AtomicChat-MLX
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint oficial (revisión usada): https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/c9d028302cd0f035fdf8e7e91f089a4ce94d2195
- Adaptador AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF/tree/82b34b9b0e5bc2e3e7b6d617ec8cc3e0f9692ee2
- Pack stock Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed/tree/f4174ad36b872daddbdf8a029efcb3792f97460c
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Metodología de conversión: CONVERSION.md (en el repositorio del modelo)
- Revisiones y hashes de origen: provenance.json (en el repositorio del modelo)
- Scripts de benchmark: benchmarks/README.md (en el repositorio del modelo)
- Desacuerdos por ítem: paired-disagreements.csv (en el repositorio del modelo)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
