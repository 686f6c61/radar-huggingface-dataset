# Bluehole/Qwen3.6-35B-Tamil-Story-Writer

## Resumen
Qwen3.6-35B-Tamil-Story-Writer es un ajuste fino mediante QLoRA del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic, una variante abliterada del Qwen3.6-35B-A3B de arquitectura MoE. Lo desarrolla el usuario Bluehole y su proposito es especializar el modelo base en escritura creativa de formato largo, tanto en ingles como en tamil, con enfasis en un registro contemporaneo del tamil moderno. El problema que aborda es concreto: los modelos base tienden a derivar hacia un lexico arcaico o clasico cuando escriben ficcion en tamil, y este ajuste corrige esa tendencia.

El modelo conserva la arquitectura Mixture of Experts del base, con 256 expertos y aproximadamente 3.000 millones de parametros activos sobre un total de 35.107.181.936 parametros. Mantiene tambien el caracter "uncensored" heredado del modelo abliterado, por lo que no aplica rechazos ante peticiones de contenido explicito o temas oscuros. La licencia es Apache 2.0.

Es relevante ahora porque cubre un nicho poco atendido: generacion de ficcion larga en tamil con calidad de registro moderno, sobre una arquitectura MoE eficiente en inferencia. El repositorio ocupa 77,7 GB y se distribuye tambien en formato GGUF para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B), hibrido reasoner, con torre de vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B (256 expertos) |
| Longitud de contexto | no disponible (el entrenamiento uso max_seq 6144; la ventana nativa del base no se especifica) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q6_K, Q8_0 (repo GGUF aparte) |
| Idiomas soportados | en, ta |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo Bluehole/Qwen3.6-35B-Tamil-Story-Writer-GGUF) |

## Arquitectura y entrenamiento
El modelo parte de una arquitectura Mixture of Experts con 256 expertos y unos 3.000 millones de parametros activos, marcada como "hibrido reasoner" (permite activar o desactivar modo de razonamiento). Incluye una torre de vision que fue remapeada tras el merge desde el repositorio base (de `model.language_model.visual.*` a `model.visual.*`) y permanece intacta, aunque el entrenamiento fue exclusivamente de texto.

El ajuste fino se realizo con QLoRA SFT mediante Unsloth, con r=32 y alpha=64 aplicados a todas las proyecciones de atencion y de expertos, lo que supone 1.860 millones de parametros entrenables (5,04% del total) y perdida calculada solo sobre las completaciones. El entrenamiento consistio en 2 epocas, longitud maxima de secuencia 6144, learning rate 1e-4 con scheduler coseno, adamw_8bit y bf16, ejecutado en una sola H100. Los datos de entrenamiento suman 7.378 ejemplos de train y 228 de validacion, divididos por libro: 4.716 ejemplos del corpus tamil de freetamilebooks.com (CC0/CC-BY-SA, filtrado a registro moderno), 1.901 de Project Gutenberg y Gryphe/ChatGPT-4o-Writing-Prompts (dominio publico/CC0) y 989 historias sinteticas autogeneradas por el modelo base. No se empleo texto con copyright ni sin licencia.

## Capacidades
- Generacion de ficcion de formato largo en ingles y tamil, con enfasis en registro contemporaneo del tamil.
- Escritura creativa en generos diversos: romance, thriller, ciencia ficcion y drama familiar, con dialogos naturales.
- Generacion sin rechazos (uncensored): produce contenido explicito, violencia grafica y temas oscuros cuando se solicita.
- Modo de razonamiento hibrido, desactivable mediante `enable_thinking: false` en los kwargs de la plantilla de chat.
- Capacidad de vision heredada del base (torre remapeada e intacta), aunque no fue entrenada en esta fase.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a en y ta.

## Casos de uso
- Escritura de novelas y relatos largos en tamil moderno: el ajuste corrige la deriva hacia lexico arcaico del modelo base, por lo que resulta adecuado para autores que necesitan prosa contemporanea con dialogos naturales.
- Generacion de ficcion en ingles con estilos y generos variados: el corpus de Gutenberg y las historias sinteticas permiten cubrir romance, thriller y ciencia ficcion con registro literario.
- Creacion de contenido narrativo sin restricciones para proyectos de ficcion adulta: al no aplicar rechazos, sirve para guiones o relatos con temas oscuros o contenido explicito, bajo responsabilidad del usuario.
- Prototipado rapido de tramas y capitulos: con 7.378 ejemplos de entrenamiento orientados a completacion, el modelo genera borradores que el autor puede revisar y ampliar; conviene pedir explicitamente la longitud deseada porque las salidas tienden a ser cortas.
- Localizacion creativa ingles-tamil: permite adaptar relatos entre ambos idiomas manteniendo un registro moderno en tamil.
- Despliegue local en estaciones de trabajo con dos GPU de 24 GB: la cuantizacion Q6_K (~28,5 GB) funciona con llama.cpp usando `-c 16384 --jinja`, lo que facilita entornos sin conexion o con requisitos de privacidad.
- Experimentacion en investigacion sobre escritura creativa multilingue: sirve como punto de partida para estudiar el efecto del ajuste QLoRA sobre el registro linguistico en lenguas de bajos recursos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion reportada es una prueba de comportamiento: una sonda de rechazo con 40 prompts (20 en ingles y 20 en tamil, con ficcion explicita, temas oscuros y controles benignos) comparando base y SFT en paralelo, en la que el modelo ajustado igualo la conformidad del base en todas las filas, sin introducir ningun rechazo.

## Requisitos de hardware
- VRAM estimada: Q8_0 en torno a 37-38 GB (estimacion a partir del tamano del repo y de la relacion de cuantizacion; no confirmada en la informacion); Q6_K ~28,5 GB (dato del autor); Q4_K_M por debajo de Q6_K para VRAM mas ajustada.
- GPU recomendadas: el autor indica que Q6_K funciona bien en 2x24 GB (por ejemplo, dos RTX 4090 o dos A10G) con llama.cpp. El entrenamiento se realizo en una sola H100.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o Q6_K en configuraciones multi-GPU de 24 GB; en una sola GPU de 24 GB solo con cuantizaciones agresivas no listadas por el autor.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `-c 16384 --jinja` y fichero mmproj para vision); vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-Tamil-Story-Writer | 35B totales, ~3B activos | no disponible | en, ta | Apache 2.0 | Ajuste QLoRA para ficcion en tamil e ingles, uncensored |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic (base) | 35B totales, ~3B activos | no disponible | no disponible | Apache 2.0 | Base abliterada; deriva a lexico arcaico en tamil segun el autor |
| Qwen3.6-35B-A3B (oficial) | 35B totales, ~3B activos | no disponible | no disponible | no disponible | Version con guardrails; el autor recomienda usarla si se desean rechazos |

## Limitaciones y advertencias
- El modelo es deliberadamente uncensored y no rechaza peticiones: puede generar contenido sexual explicito, violencia grafica y material perturbador. No debe desplegarse donde menores o usuarios no advertidos puedan acceder a el.
- Riesgo de alucinacion: no evaluado para QA factual, codigo ni seguimiento de instrucciones; su uso previsto es exclusivamente la escritura creativa.
- Fallos ocasionales de fluidez en tamil (variantes ortograficas, eleccion de palabras incorrectas en casos raros): reducidos respecto al base, pero no eliminados.
- Las salidas tienden a ser algo cortas; es necesario pedir explicitamente la longitud deseada.
- Capacidades multilingues limitadas a ingles y tamil.
- La licencia Apache 2.0 se hereda del modelo base; las porciones CC-BY-SA del corpus de entrenamiento afectan a la atribucion de esos textos fuente, no a los pesos del modelo.
- El usuario es el unico responsable del cumplimiento legal en su jurisdiccion y de las normas de las plataformas donde use o comparta las salidas; queda prohibido generar contenido ilegal, incluido material sexual con menores o personas reales no consentidoras.
- La torre de vision esta presente pero no fue entrenada; su rendimiento en tareas visuales no esta evaluado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Bluehole/Qwen3.6-35B-Tamil-Story-Writer
- Repositorio GGUF: https://huggingface.co/Bluehole/Qwen3.6-35B-Tamil-Story-Writer-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Corpus tamil de entrenamiento: https://freetamilebooks.com
- Dataset de prompts: https://huggingface.co/Gryphe/ChatGPT-4o-Writing-Prompts
- Project Gutenberg: https://www.gutenberg.org
