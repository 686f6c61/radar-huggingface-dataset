# Harsha001/MiniMax-M3.1-Flash-StrixHalo-GGUF

## Resumen

MiniMax-M3.1-Flash-StrixHalo-GGUF es una compilación de cuantización de la comunidad del modelo MiniMax-M3.1-Flash, publicada por el usuario Harsha001 bajo el paraguas del proyecto ROCmFPX. El objetivo es hacer viable un modelo MoE de 313.211.018.421 parámetros totales en una única máquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, un escenario en el que las cuantizaciones dinámicas más pequeñas de Unsloth (UD-IQ1_M con 129 GB y UD-IQ2_XXS con 135 GB) no caben.

La estrategia no consiste en recuantizar, sino en podar expertos enrutados de cada capa MoE: se conservan 93 de 128 expertos en la variante recomendada (UD-IQ1_M-E93) y 89 de 128 en la alternativa (UD-IQ2_XXS-E89), manteniendo los tensores restantes byte a byte tal como los publica Unsloth. Cada build ocupa aproximadamente 96,6-96,8 GB, lo que deja margen para una ventana de contexto de 64K con unos 8 GB de caché KV dentro de un presupuesto de memoria de GPU de unos 100 GiB.

Es relevante ahora porque demuestra que un modelo de escala frontera puede ejecutarse en hardware de consumo de gama alta con memoria unificada, a costa de una pérdida medible de perplejidad (61,96 frente a 52,02 del original sin podar). El autor lo etiqueta explícitamente como versión de prueba comunitaria: validado en CPU y en una NVIDIA GB10 con CUDA, pero todavía no ejecutado en un Strix Halo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; modelo base MiniMax-M3.1-Flash con expertos enrutados podados por capa |
| Parametros totales | 313.211.018.421 (modelo base, dato de safetensors) |
| Parametros activos | no disponible (el modelo base es MoE, pero la model card no publica el número de parámetros activos) |
| Longitud de contexto | 65.536 tokens (64K) en la configuración recomendada, con ~8 GB de caché KV |
| Tipos de cuantizacion | IQ1_M (UD-IQ1_M con poda a 93 expertos) e IQ2_XXS (UD-IQ2_XXS con poda a 89 expertos); sin recuantización, tensores de Unsloth sin modificar |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license: other, license_name: minimax-community) |
| Formato de pesos | GGUF, dividido en 3 archivos por build |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo transformer con 128 expertos enrutados por capa, del que este build conserva un subconjunto. La poda se realiza mediante la puntuación REAP (peso del router multiplicado por el tamaño de salida del experto, promediado sobre los tokens que alcanzan dicho experto), medida sobre 98.304 tokens de texto y código mezclados. Como no existe copia en precisión completa, las puntuaciones se calcularon sobre el archivo UD-IQ2_XXS de Unsloth. El build de 93 expertos conserva el 88,1% del peso de enrutamiento; el de 89 expertos, el 86,0%. Las listas de expertos conservados están disponibles en el directorio `keep/`.

No se ha reentrenado ni ajustado nada: todos los pesos proceden de unsloth/MiniMax-M3.1-Flash-GGUF y solo se eliminan los expertos enrutados descartados junto con sus filas de router. No hay información en la model card sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si hubo RLHF o DPO. Tampoco se incluyen el proyector de visión ni el modelo borrador de decodificación especulativa del original, que no fueron probados.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso: es un modelo de tipo thinking, por lo que requiere asignar suficientes tokens de salida.
- Razonamiento matemático: validado con GSM8K (191/200 en las primeras 200 preguntas de test en ambos builds).
- Generación de código: el conjunto de calibración de la poda incluye código fuente, y la perplejidad se midió sobre texto de Wikipedia en inglés y código mezclados.
- Capacidad multilingüe: no disponible (los idiomas soportados no se detallan).
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el formato de respuesta con línea final "Final answer: <number>" sugiere compatibilidad con flujos de razonamiento estructurado.
- Capacidades de visión: no incluidas en este build (el proyector de visión del original se excluyó).
- Modo thinking: sí, el autor advierte que es un modelo de razonamiento y hay que reservar tokens de salida.

## Casos de uso

- Inferencia local en una única máquina Strix Halo: el caso de uso central del build. Un Ryzen AI Max+ 395 con 128 GB de memoria unificada puede cargar el GGUF de 96,6 GB con `llama-server`, `-ngl 99` y contexto de 64K, sustituyendo a configuraciones multi-GPU para pruebas y desarrollo.
- Asistente de razonamiento matemático en local: con 191/200 en GSM8K, es adecuado para resolver problemas aritméticos y algebraicos paso a paso en entornos sin conexión, siempre que se le den hasta 6.144 tokens de salida como en la evaluación.
- Generación y revisión de código en estaciones de trabajo: el modelo se calibró con código y mantiene capacidad de generación de texto técnico; puede integrarse en editores o pipelines locales donde no se quiera enviar código a la nube.
- Experimentación con poda de expertos: las listas `keep/` y las puntuaciones REAP permiten a investigadores estudiar el impacto de eliminar expertos enrutados en modelos MoE de gran escala, comparando los builds de 93 y 89 expertos.
- Prototipado de agentes conversacionales de contexto largo: la ventana de 64K permite mantener conversaciones multi-turno extensas o procesar documentos largos en una sola sesión sin recuperación externa.
- Evaluación de rendimiento en hardware AMD: el build está pensado para medir velocidad, memoria y calidad en Vulkan/ROCm sobre Strix Halo, un terreno poco explorado frente a CUDA, y el autor solicita reportes en la pestaña Community.
- Despliegue de referencia en DGX Spark (GB10): el autor lo probó en una NVIDIA GB10 con CUDA, por lo que también sirve como banco de pruebas para hardware de memoria unificada de NVIDIA.

## Benchmarks y rendimiento

| Build | GSM8K (primeras 200 preguntas) | Respuestas truncadas | Longitud media de respuesta | Velocidad de prompt (pp512, GB10) |
|---|---|---|---|---|
| UD-IQ1_M-E93 | 191/200 (95,5%) | 0 | 285 tokens | 218 t/s |
| UD-IQ2_XXS-E89 | 191/200 (95,5%) | 2 | 357 tokens | 315 t/s |

| Build | Expertos conservados | Perplejidad (menor es mejor) | Tamaño |
|---|---|---|---|
| UD-IQ1_M-E93 | 93 de 128 | 61,96 | 96,6 GB |
| UD-IQ2_XXS-E89 | 89 de 128 | 62,11 | 96,8 GB |
| Unsloth UD-IQ1_M sin podar (referencia) | 128 | 52,02 | 129,4 GB |

La perplejidad se midió sobre 8 fragmentos de 2.048 tokens de texto mixto de Wikipedia en inglés y código fuente, en CPU, con el mismo texto para todas las filas. La velocidad de generación (tg128) en GB10 fue de aproximadamente 12,6 t/s, aunque el autor advierte que había otros procesos de CPU en la máquina y debe tratarse como cota inferior. No hay resultados de MMLU, HumanEval ni otros benchmarks en la información disponible. El autor señala que GSM8K es fácil para un modelo de este tamaño, por lo que el resultado demuestra que los builds podados siguen razonando correctamente, no que igualen al original en tareas más difíciles.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 100 GiB de presupuesto de GPU; cada build ocupa 96,6-96,8 GB y deja espacio para ~8 GB de caché KV a 64K de contexto.
- GPU objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. En Windows hay que configurar en BIOS o AMD Software la mayor memoria gráfica posible que siga dejando RAM suficiente al sistema; en Linux hay que elevar el límite GTT.
- GPU validadas: NVIDIA GB10 (DGX Spark) con CUDA para las pruebas de perplejidad y GSM8K. No se ha ejecutado en Strix Halo todavía.
- ¿Cabe en GPU de consumo? No en tarjetas discretas convencionales: 96,6 GB superan la VRAM de cualquier RTX 4090 (24 GB) o similar. Solo es viable en hardware con memoria unificada de 128 GB o en configuraciones multi-GPU.
- Opciones de despliegue: `llama-server` del fork ROCmFPX compilado con `-DGGML_VULKAN=ON`; también compatible con llama.cpp estándar en la medida en que soporte los kernels de 1-2 bits. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 218 t/s (pp512) para UD-IQ1_M-E93 y 315 t/s para UD-IQ2_XXS-E89 en GB10; generación de ~12,6 t/s (tg128) como cota inferior. El autor advierte que los kernels de expertos de 1-2 bits en Vulkan aún no están optimizados y que la velocidad inicial será baja.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Tamaño del archivo | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-StrixHalo UD-IQ1_M-E93 (este) | 313,2 mil M (base) | 64K | 96,6 GB | 61,96 | minimax-community | Hugging Face (Harsha001) |
| MiniMax-M3.1-Flash-StrixHalo UD-IQ2_XXS-E89 (este) | 313,2 mil M (base) | 64K | 96,8 GB | 62,11 | minimax-community | Hugging Face (Harsha001) |
| unsloth/MiniMax-M3.1-Flash-GGUF UD-IQ1_M | 313,2 mil M (base) | no disponible | 129,4 GB | 52,02 | minimax-community | Hugging Face (unsloth) |
| unsloth/MiniMax-M3.1-Flash-GGUF UD-IQ2_XXS | 313,2 mil M (base) | no disponible | 135 GB | no disponible | minimax-community | Hugging Face (unsloth) |

No se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base. La ventaja de este build es el tamaño (un 25% menor que UD-IQ1_M) a cambio de un aumento de perplejidad de aproximadamente 10 puntos; la desventaja es que no cabe en máquinas de 128 GB sin la poda.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube de 52,02 a 61,96 (un 19% relativa) respecto al UD-IQ1_M sin podar; es el precio explícito de caber en 128 GB.
- Estado de validación incompleto: es una versión de prueba comunitaria; no se ha ejecutado en Strix Halo, solo en CPU y en NVIDIA GB10 con CUDA.
- Diferencias entre backends: en el mismo texto, CUDA y CPU coinciden en el token más probable solo el 82-83% de las veces (divergencia KL media de 0,20-0,26). El router del modelo podado tiene empates casi exactos entre expertos, por lo que pequeñas diferencias de redondeo seleccionan expertos distintos. No se debe esperar salida idéntica en Vulkan, CUDA y CPU.
- Sin visión ni decodificación especulativa: el proyector de visión y el modelo borrador del original no están incluidos ni fueron probados.
- Modelo de razonamiento: consume muchos tokens de salida; con límites bajos puede truncar respuestas (en la evaluación de GSM8K hubo 2 respuestas truncadas en el build de 89 expertos).
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, y la poda puede agravarlo en dominios poco representados en la calibración.
- Sesgos: no disponibles; no se documentan evaluaciones de sesgo ni de seguridad.
- Idiomas: no disponibles; la calibración y la evaluación se hicieron con texto en inglés y código, por lo que el rendimiento en castellano no está verificado.
- Licencia: minimax-community (license: other), con términos que deben consultarse en el archivo LICENSE antes de cualquier uso comercial.
- Requisito de memoria: necesita ~100 GiB utilizables por la GPU; en Windows y Linux hay que ajustar la memoria gráfica o el límite GTT, y cerrar otros programas que usen la GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/MiniMax-M3.1-Flash-StrixHalo-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Cuantizaciones de Unsloth: https://huggingface.co/unsloth/MiniMax-M3.1-Flash-GGUF
- Repositorio ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Encuesta de próximas cuantizaciones: https://harshavardhan3002.github.io/ROCmFPX/
- Build destacado del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Licencia: archivo LICENSE en el repositorio del modelo
