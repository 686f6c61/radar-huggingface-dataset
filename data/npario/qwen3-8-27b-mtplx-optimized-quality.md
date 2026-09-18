# npario/Qwen3.8-27B-MTPLX-Optimized-Quality

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Quality es un paquete de pesos cuantizados en formato MLX para Apple Silicon, publicado por el usuario npario sobre el checkpoint base Qwen/Qwen3.8-27B. No es un modelo entrenado desde cero, sino una derivación cuantizada: cada matriz de pesos se almacena a 8 bits con grupos de 64 pesos, mientras que los kernels de convolución GDN, los parámetros de estado recurrente, todas las normalizaciones y la cabeza completa de multi-token prediction (MTP) se mantienen a 16 bits. El objetivo declarado es acercarse lo máximo posible a la distribución del modelo original en bf16 sin renunciar a la decodificación especulativa nativa.

El modelo se distribuye a través de MTPLX, un runtime de inferencia para macOS que implementa decodificación especulativa mediante la cabeza MTP del propio modelo. Según la model card, el pack alcanza un 99,3 % de coincidencia top-1 y una divergencia KL de 0,0005 frente al checkpoint bf16 en una batería de evaluación de código, prosa, JSON y un aviso multilingüe (2.389 posiciones con teacher forcing). La ventana de contexto es de 262.144 tokens y el tamaño de descarga es de 29,4 GB.

Es relevante ahora porque propone una vía distinta al ajuste habitual de cuantización agresiva: en lugar de priorizar velocidad a costa de la fidelidad distribucional, mantiene la cabeza MTP intacta y cuantiza selectivamente el resto, permitiendo que la especulación sea exacta (regla de ratio de probabilidad más remuestreo residual) a cualquier temperatura. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no cuenta con validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible. Derivada de Qwen/Qwen3.8-27B; la model card menciona kernels de convolución GDN y parámetros de estado recurrente, lo que apunta a un diseño híbrido con componentes recurrentes, pero no se detalla la composición de capas |
| Parámetros totales | 27.356.723.952 (≈27,36 mil millones), dato real de los pesos safetensors |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 8 bits dinámica con grupos de 64 pesos; 16 bits en kernels de convolución GDN, parámetros de estado recurrente, normalizaciones y cabeza MTP completa. Existe una variante FP16 del mismo pack |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pack MLX); configuración de runtime en mtplx_runtime.json |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada: no se indican número de tokens, composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí describe la model card es el proceso de construcción del pack cuantizado: cuantización dinámica a 8 bits con grupos de 64 pesos en todas las matrices, manteniendo en 16 bits los kernels de convolución GDN, los parámetros de estado recurrente, todas las normalizaciones y la totalidad de la cabeza MTP. La cabeza MTP se conserva para que MTPLX pueda hacer borradores anticipados y verificarlos en una sola pasada (profundidad de borrador configurada en 3). Los ajustes de profundidad y de muestreo vienen preconfigurados en el archivo `mtplx_runtime.json`, que el runtime lee al cargar.

La innovación técnica destacable es que la especulación es exacta: los borradores se aceptan mediante la regla de ratio de probabilidad más remuestreo residual, de modo que la salida sigue la distribución propia del modelo a cualquier temperatura y no una aproximación greedy. La model card reporta una prueba de exactitud con mil extracciones de cuatro tokens por la ruta rápida comparadas con mil extracciones por la ruta simple, a temperatura 1, top-p 0,95 y top-k 20, dentro del ruido de la propia ruta simple. Los niveles de esfuerzo de razonamiento (xhigh, medium, low) funcionan y el thinking preservado circula por la ruta MTP.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline declarado `text-generation`.
- Razonamiento con niveles de esfuerzo configurables: xhigh, medium y low. La model card reporta respuestas de razonamiento largo de 34.000 y 46.000 tokens.
- Generación y reescritura de código: la model card menciona tareas de coding con razonamiento medio y reescritura de archivos recién generados.
- Salidas estructuradas: la batería de evaluación de calidad incluye posiciones de código, prosa, JSON y un aviso multilingüe.
- Decodificación especulativa nativa mediante cabeza MTP con profundidad 3 y aceptación de borradores de 0,96 / 0,88 / 0,79 por profundidad.
- Thinking mode preservado que fluye a través de la ruta MTP.
- Integración declarada con herramientas de desarrollo tipo opencode y claude-code (aparecen como etiquetas), aunque no se detalla el mecanismo de tool calling en la model card.
- Soporte multilingüe: no confirmado. La evaluación de calidad incluye un aviso multilingüe, pero no se publica una lista de idiomas soportados.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de programación en local sobre Mac: el modelo conserva la cabeza MTP y una cuantización de 8 bits con las partes sensibles en 16 bits, por lo que se puede usar como copiloto de código dentro de OpenCode o herramientas similares manteniendo respuestas muy próximas a las del modelo bf16, con 48,3 tok/s en una tarea de coding con razonamiento medio según la model card.
- Reescritura y refactorización de archivos completos: la model card reporta específicamente pruebas de reescritura de archivos y una tarea de coding "fresca"; con 262.144 tokens de contexto se pueden pasar módulos enteros y pedir reescrituras coherentes sin trocear el archivo.
- Razonamiento largo con cadena de pensamiento extendida: los niveles de esfuerzo xhigh permiten generar respuestas de decenas de miles de tokens (33,2 y 33,1 tok/s medidos en respuestas de 34.000 y 46.000 tokens) para tareas de análisis, revisión de diseño o depuración de problemas complejos.
- Generación de JSON y salidas estructuradas para integración con pipelines: la batería de evaluación de calidad incluye posiciones de JSON, lo que respalda su uso en extracción de datos y formateo de respuestas para APIs internas.
- Procesamiento de documentación técnica extensa: con 262.144 tokens de contexto se puede cargar un repositorio de documentación o un conjunto de especificaciones y hacer preguntas transversales, manteniendo el thinking preservado para preguntas de seguimiento.
- Despliegue local con requisitos de privacidad: al ejecutarse íntegramente en un Mac con Apple Silicon mediante MTPLX, no requiere enviar datos a servicios externos, lo que resulta adecuado para código propietario o documentos confidenciales.
- Evaluación comparativa de cuantizaciones: sirve como referencia de fidelidad (99,3 % de coincidencia top-1 frente a bf16) para equipos que necesitan decidir entre un pack de 4 bits más rápido y uno de 8 bits más fiel.
- Prototipado de agentes multi-paso en local: la combinación de contexto largo, niveles de razonamiento y decodificación especulativa exacta permite iterar sobre flujos de varios pasos sin coste por token en la nube.

## Benchmarks y rendimiento

La model card publica métricas de velocidad y de fidelidad frente al checkpoint bf16, medidas por el propio proveedor en un MacBook Pro M5 Max con ventiladores al máximo y muestreo oficial de Qwen 3.8 (temperatura 1,0, top-p 0,95, top-k 20). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Métrica | Valor |
|---|---|
| Tarea de coding, razonamiento medio, app de Mac de MTPLX | 48,3 tok/s |
| Razonamiento largo en xhigh, respuestas de 34.000 tokens | 33,2 tok/s |
| Razonamiento largo en xhigh, respuestas de 46.000 tokens | 33,1 tok/s |
| Aceptación de borradores por profundidad (0, 1, 2) | 0,96 / 0,88 / 0,79 |
| Coste de verificación | 63,5 ms por ronda |
| Ganancia de profundidad 3 frente a profundidad 2 en razonamiento largo | +19,9 % |
| Coincidencia top-1 con bf16 (batería de código, prosa, JSON y aviso multilingüe) | 99,3 % |
| Divergencia KL frente a bf16 (misma batería) | 0,0005 |
| Divergencia KL frente a bf16 (batería de coding del proveedor) | 0,00105 |
| Mejora de KL frente a Optimized Speed | 21 veces más cerca del bf16 |
| Mejora de KL frente a Bare Speed | 36 veces más cerca del bf16 |

| Run comparativo (mismo equipo, builds hermanos) | tok/s |
|---|---|
| Optimized Speed reescribiendo un archivo recién escrito, ajustes de fábrica (MTPLX 2.10.0) | 87,6 |
| Bare Speed en una tarea de coding nueva con muestreo oficial de Qwen 3.8 (MTPLX 2.7.0) | 65,2 |
| Optimized Speed en una respuesta de chat de 3.000 tokens (MTPLX 2.10.0) | 64,3 |
| Qwen 3.6 27B Optimized Speed, banco de 192 tokens, 2 de julio de 2026 | 81,74 |

## Requisitos de hardware

- VRAM / memoria unificada: 36 GB o más de memoria unificada para este pack. El pico medido de memoria unificada del artefacto es de 32,7 GB. Los packs de 4 bits de la misma familia funcionan con 32 GB o más.
- Descarga: 29,4 GB (tamaño del repositorio: 30,0 GB).
- Plataforma: exclusivamente Apple Silicon de la generación M1 a M5 (MacBook Pro, MacBook Air, Mac mini y Mac Studio). No hay soporte indicado para GPU NVIDIA, AMD o CPU x86.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo son los SoC de Apple. La model card menciona específicamente M5 Max para las mediciones publicadas, y recomienda la variante FP16 de este mismo modelo si se trabaja en un Mac con M1 o M2.
- ¿Cabe en GPU de consumo? El modelo es para Mac; en cuanto a Macs de consumo, necesita 36 GB de memoria unificada, por lo que queda fuera de configuraciones base con 8, 16 o 24 GB. Encaja en MacBook Pro de gama alta, Mac Studio y configuraciones con 36 GB o más.
- Opciones de despliegue: aplicación de escritorio de MTPLX para macOS y línea de comandos mediante `pip install mtplx` seguido de `mtplx serve --model <repo>`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput estimados: 48,3 tok/s en coding con razonamiento medio; 33,2 y 33,1 tok/s en razonamiento largo xhigh; coste de verificación de 63,5 ms por ronda con profundidad de borrador 3.

## Comparativa con modelos similares

La información disponible permite comparar con los packs hermanos de la misma familia dentro de MTPLX. No se han encontrado datos de terceros para comparar con otras distribuciones de Qwen 3.8 27B.

| Modelo | Cuantización | Fidelidad frente a bf16 | Memoria unificada necesaria | Velocidad publicada | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-Optimized-Quality (este) | 8 bits dinámica, partes sensibles en 16 bits | 99,3 % top-1, KL 0,0005 (batería del proveedor) | 36 GB o más | 48,3 tok/s en coding; 33,2/33,1 tok/s en razonamiento largo | apache-2.0 |
| Qwen3.8-27B-MTPLX-Optimized-Speed | 4 bits dinámica | 96,0 % top-1, KL 0,012 | 32 GB o más (según la guía general de la familia) | 87,6 tok/s reescribiendo archivo; 64,3 tok/s en chat de 3.000 tokens | apache-2.0 (según el patrón de la familia; no verificado en esta ficha) |
| Qwen3.8-27B-MTPLX-Bare-Speed | 4 bits (perfil de velocidad) | 36 veces más lejos del bf16 que este pack en términos de KL | 32 GB o más (según la guía general de la familia) | 65,2 tok/s en coding con muestreo oficial | no disponible en esta ficha |
| Qwen3.8-27B-MTPLX-Optimized-Quality-FP16 | FP16 | No disponible | No disponible (recomendado para Mac con M1 o M2) | No disponible | no disponible |

Frente a la familia Qwen 3.6 27B Optimized Speed, la model card cita un registro de 81,74 tok/s en un banco de 192 tokens del 2 de julio de 2026, dato de una generación anterior del modelo base.

## Limitaciones y advertencias

- No existen benchmarks estándar publicados (MMLU, HumanEval, GSM8K, MATH, etc.). Todas las métricas de calidad y velocidad proceden del proveedor del runtime, medidas en un único equipo (MacBook Pro M5 Max) y no verificadas por terceros.
- El modelo tiene 0 descargas y 0 likes, y la fecha de creación y de actualización del repositorio es la misma (18 de septiembre de 2026). No hay historial de uso ni validación comunitaria.
- Dependencia total del runtime MTPLX: el modelo se sirve con la librería `mtplx` y no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros motores. Esto limita la portabilidad y ata el despliegue a un único proveedor.
- Restricción de plataforma: solo Apple Silicon (M1 a M5). No es desplegable en GPU NVIDIA, AMD ni en servidores x86 convencionales.
- Requisito de memoria elevado para la categoría: 36 GB de memoria unificada, con un pico medido de 32,7 GB. En Macs de 32 GB hay que usar los packs de 4 bits.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad, tasas de alucinación ni comportamiento en dominios factuales. Al ser un modelo de 27.000 millones de parámetros con contexto muy largo, el riesgo de degradación en el centro del contexto no está cuantificado.
- Idiomas soportados: no disponibles. La model card solo menciona que la batería de evaluación incluye un aviso multilingüe, sin especificar qué idiomas cubre ni con qué calidad.
- Inconsistencia de identificadores: la model card referencia el repositorio como `Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality` en el comando de ejemplo, mientras que el identificador real del repositorio es `npario/Qwen3.8-27B-MTPLX-Optimized-Quality`. Conviene verificar la ruta correcta antes de automatizar descargas.
- Las afirmaciones de "exactitud" de la decodificación especulativa y de coincidencia del 99,3 % con bf16 son declaraciones del autor, basadas en 2.389 posiciones de teacher forcing y en mil extracciones de cuatro tokens; no sustituyen a una evaluación independiente en producción.
- Las etiquetas del repositorio (`qwen3_5`, `qwen3-8`) no coinciden de forma consistente con el nombre del modelo base declarado, lo que añade ruido a la trazabilidad del linaje.
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces obtenidos corresponden a foros sin relación (Fortuna Düsseldorf, GBAtemp). No hay prensa, papers ni análisis independientes disponibles.
- Licencia apache-2.0 en el pack derivado, pero conviene revisar por separado los términos aplicables al modelo base Qwen/Qwen3.8-27B antes de un uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/npario/Qwen3.8-27B-MTPLX-Optimized-Quality
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del runtime: https://mtplx.com
- Benchmarks del proveedor: https://mtplx.com/benchmarks/
- Notas de la versión MTPLX 2.11.3: https://mtplx.com/releases/2.11.3/
- Guía para ejecutar Qwen 3.8 27B en Mac: https://mtplx.com/models/qwen3.8-27b/
- Comparativa MTPLX frente a mlx-serve: https://mtplx.com/compare/mtplx-vs-mlx-serve/
- Comparativa MTPLX frente a oMLX: https://mtplx.com/compare/mtplx-vs-omlx/
- Comparativa MTPLX frente a LM Studio: https://mtplx.com/compare/mtplx-vs-lm-studio/
- Comparativa MTPLX frente a Ollama: https://mtplx.com/compare/mtplx-vs-ollama/
- Pack hermano Optimized Speed: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Pack hermano Bare Speed: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed
- Variante FP16 del mismo pack: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16
- Búsqueda web: sin resultados relevantes. Los enlaces devueltos (95erforum.de, gbatemp.net) no guardan relación con el modelo ni con su autor.
