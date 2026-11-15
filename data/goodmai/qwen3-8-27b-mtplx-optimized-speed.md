# goodmai/Qwen3.8-27B-MTPLX-Optimized-Speed

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Speed es un empaquetado cuantizado en 4 bits dinámicos del modelo base Qwen/Qwen3.8-27B, publicado por el usuario goodmai (con origen upstream en Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed) y distribuido en formato safetensors para la librería MTPLX. Su propósito no es reentrenar ni alterar el modelo, sino preservar el cabezal nativo de predicción multi-token (MTP) del Qwen3.8-27B original para habilitar decodificación especulativa nativa sobre Apple Silicon, acelerando la inferencia entre dos y tres veces respecto a la decodificación plana sin cambiar la distribución de salida.

El modelo conserva la arquitectura del Qwen3.8-27B (transformer con capas GDN, es decir, proyecciones de salida con convolución y estado recurrente, más un cabezal MTP de profundidad 3) y una ventana de contexto de 262.144 tokens. El pack ocupa 20,4 GB de descarga y requiere un Mac con Apple Silicon y al menos 32 GB de memoria unificada (36 GB para la variante Optimized Quality de 8 bits).

Es relevante ahora porque ofrece una vía práctica de ejecutar un modelo de 27.356 millones de parámetros en hardware de consumo Apple (M1 a M5) con velocidades medidas de 55-88 tokens por segundo en tareas de código, manteniendo una fidelidad alta respecto al checkpoint bf16 original (96,0 % de acuerdo top-1 y KL 0,012 sobre 2.389 posiciones evaluadas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas GDN (convolución + estado recurrente) y cabezal MTP nativo; empaquetado para MLX |
| Parámetros totales | 27.356.723.952 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 4 bits dinámicos (grupos de 32 pesos); embeddings, cabezal de salida, 48 proyecciones de salida GDN y últimos 8 bloques MLP en 8 bits; kernels de convolución GDN, estado recurrente, todas las normas y cabezal MTP completo en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mtplx) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.8-27B, no un entrenamiento nuevo. La arquitectura subyacente combina bloques transformer con capas GDN (que incluyen proyecciones de salida, kernels de convolución y parámetros de estado recurrente) y un cabezal de predicción multi-token (MTP) de profundidad 3, que es precisamente lo que el empaquetado conserva intacto para permitir decodificación especulativa nativa. El pack aplica una cuantización dinámica de 4 bits con grupos de 32 pesos en el grueso del modelo, eleva a 8 bits las partes más sensibles a la compresión (embeddings, cabezal de salida, las 48 proyecciones de salida GDN y los últimos 8 bloques MLP) y mantiene en 16 bits los kernels de convolución GDN, el estado recurrente, todas las normas y el cabezal MTP completo.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni sobre fases de RLHF o DPO, ya que se trata de un artefacto de cuantización. La innovación técnica destacable es la preservación del cabezal MTP junto con ajustes de profundidad y borrador preconfigurados en `mtplx_runtime.json`, que MTPLX lee al cargar sin necesidad de flags. La fidelidad medida frente al checkpoint bf16 es de 96,0 % de acuerdo top-1 y divergencia KL de 0,012 sobre 2.389 posiciones de código, prosa, JSON y un aviso multilingüe; la exactitud se valida comparando mil extracciones de cuatro tokens por la ruta rápida contra mil de la ruta plana, dentro del ruido de esta última a temperatura 1, top-p 0,95 y top-k 20.

## Capacidades

- Generación de texto conversacional y de código, con niveles de esfuerzo de razonamiento configurables (xhigh, medium, low).
- Razonamiento multi-paso con flujo de pensamiento preservado que atraviesa la ruta MTP como cualquier otra generación.
- Decodificación especulativa nativa mediante predicción multi-token con profundidad 3 y aceptación de borrador medida de 0,95, 0,88 y 0,80 por profundidad en tareas de código.
- Codificación asistida en herramientas como opencode y claude-code, según las etiquetas del autor.
- Generación de JSON y prosa técnica, evaluada en el conjunto de calidad del pack.
- Capacidades multilingües: no disponible (la model card menciona un aviso multilingüe en la batería de evaluación, pero no detalla idiomas soportados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo mantiene el cabezal MTP y alcanza 58,7 tok/s en `mtplx serve` en una tarea de código con razonamiento medio en un M5 Max, lo que lo hace adecuado para autocompletado y reescritura de archivos en un flujo de trabajo de desarrollo sin conexión.
- Reescritura de archivos recién generados: la medición de 87,6 tok/s reescribiendo un fichero que el propio modelo acababa de escribir indica un buen encaje en bucles de refactorización iterativa donde el contexto ya está cargado.
- Respuestas de chat de contexto largo: con 262.144 tokens de ventana y 64,3 tok/s en una respuesta de chat de 3.000 tokens, sirve para conversaciones multi-turno con documentación extensa adjunta.
- Razonamiento profundo en local: los niveles xhigh sostienen 35,1 y 37,3 tok/s en respuestas de 28.000 y 20.000 tokens, útil para análisis de código o revisión de especificaciones largas sin salir del portátil.
- Despliegue como servidor REST local: `basalt serve --model ... --rest` expone el modelo como servicio en macOS 27+ sobre Apple Silicon sin Python, integr able en scripts y herramientas internas.
- Evaluación de calidad de cuantizaciones: el pack documenta acuerdo top-1 y KL frente a bf16, por lo que sirve como referencia para comparar estrategias de cuantización dinámica en proyectos de investigación aplicada.
- Prototipado de decodificación especulativa: al conservar el cabezal MTP y publicar tasas de aceptación por profundidad y coste de verificación (50-53 ms por ronda), es un banco de pruebas para estudiar decodificación especulativa en Apple Silicon.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en un MacBook Pro M5 Max con ventiladores al máximo, flujo único, muestreo oficial de Qwen 3.8 (temperatura 1,0, top-p 0,95, top-k 20):

| Ejecución | tok/s |
|---|---|
| Optimized Speed reescribiendo un archivo, ajustes de stock (MTPLX 2.10.0) | 87,6 |
| Bare Speed en tarea de código nueva con muestreo oficial (MTPLX 2.7.0) | 65,2 |
| Optimized Speed en respuesta de chat de 3k tokens (MTPLX 2.10.0) | 64,3 |
| Récord 27B en generación nueva: Qwen 3.6 27B Optimized Speed, bench de 192 tokens | 81,74 |
| Tarea de código, razonamiento medio, `mtplx serve` | 58,7 |
| Misma tarea en la app MTPLX para Mac | 55,5 |
| Razonamiento largo en xhigh, respuestas de 28k y 20k tokens | 35,1 y 37,3 |
| Referencia: Qwen 3.6 27B Optimized Speed V2, misma tarea | 59,9-60,1 |
| Referencia: oMLX 0.5.7 con su cuantización MTP 4-bit de Qwen 3.8 | 63,3 |

Calidad del pack frente al checkpoint bf16 de Qwen3.8-27B, evaluada con teacher forcing sobre 2.389 posiciones:

| Variante | Acuerdo top-1 | KL |
|---|---|---|
| Optimized Speed (4-bit dinámico) | 96,0 % | 0,012 |
| Optimized Quality (8-bit dinámico) | 99,3 % | 0,0005 |
| Bare Speed (4-bit plano), divergencia KL | no disponible | 0,0220 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada: mínimo 32 GB para la variante de 4 bits; 36 GB para Optimized Quality de 8 bits. Pico de memoria unificada medido para este artefacto: 23,6 GB.
- Hardware: Apple Silicon de M1 a M5, incluyendo MacBook Pro, MacBook Air, Mac mini y Mac Studio.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el pack está orientado exclusivamente a MLX sobre Apple Silicon.
- Despliegue: librería MTPLX (`mtplx serve`) y la app MTPLX para Mac (macOS 27+, sin Python), además de Basalt con `basalt serve --model ... --rest`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 55,5-58,7 tok/s en tarea de código con razonamiento medio; 64,3-87,6 tok/s en escenarios de reescritura y chat; 35,1-37,3 tok/s en razonamiento xhigh con salidas de 20k-28k tokens. Coste de verificación de 50-53 ms por ronda de decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-Optimized-Speed | 27,36 B | 262.144 | 55,5-87,6 (M5 Max) | Apache 2.0 | Hugging Face, librería MTPLX |
| Qwen 3.6 27B Optimized Speed V2 (MTPLX) | no disponible | no disponible | 59,9-60,1 en la misma tarea | no disponible | MTPLX |
| oMLX 0.5.7 con Qwen 3.8 4-bit MTP | no disponible | no disponible | 63,3 en la misma tarea | no disponible | oMLX |
| Qwen3.8-27B (bf16, base) | 27,36 B | 262.144 (según el pack) | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo solo funciona con la librería MTPLX y sobre Apple Silicon; no es portable a CUDA ni a otros runtimes de inferencia.
- La cuantización de 4 bits introduce una divergencia medible frente al bf16 (KL 0,012 en la batería del autor); para tareas sensibles a la fidelidad exacta conviene la variante de 8 bits, que exige 36 GB de memoria unificada.
- No se dispone de información sobre sesgos, toxicidad ni evaluación de seguridad del modelo base en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de alucinación específicas.
- Idiomas soportados no documentados; el uso multilingüe en producción requiere validación propia.
- El modelo está orientado a generación de texto y código; no se documentan capacidades de visión, audio, tool calling ni agentes.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B, así como las de la librería MTPLX, que no se detallan.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación externa de la comunidad es inexistente.
- Los números de rendimiento proceden del propio autor y de una única máquina (M5 Max); el rendimiento en M1, M2 o M3 será previsiblemente inferior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-MTPLX-Optimized-Speed
- Modelo upstream: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- MTPLX: https://mtplx.com
- Benchmarks de MTPLX: https://mtplx.com/benchmarks/
- Notas de la versión MTPLX 2.11.3: https://mtplx.com/releases/2.11.3/
- Guía para ejecutar Qwen 3.8 27B en Mac: https://mtplx.com/models/qwen3.8-27b/
- Comparativa MTPLX vs mlx-serve: https://mtplx.com/compare/mtplx-vs-mlx-serve/
- Comparativa MTPLX vs oMLX: https://mtplx.com/compare/mtplx-vs-omlx/
- Comparativa MTPLX vs LM Studio: https://mtplx.com/compare/mtplx-vs-lm-studio/
- Comparativa MTPLX vs Ollama: https://mtplx.com/compare/mtplx-vs-ollama/
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt en Hugging Face Spaces: https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-MTPLX-Optimized-Speed&role=chat
