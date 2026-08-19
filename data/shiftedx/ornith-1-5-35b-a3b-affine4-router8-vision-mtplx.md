# Shiftedx/ornith-1.5-35b-a3b-affine4-router8-vision-mtplx

## Resumen

`Shiftedx/ornith-1.5-35b-a3b-affine4-router8-vision-mtplx` es una cuantización compacta del modelo multimodal `ornith-ai/Ornith-1.5-35B-A3B`, preparada específicamente para Apple Silicon por el usuario Shiftedx. El modelo base, desarrollado por ornith-ai, es un MoE de arquitectura Qwen3.5 con 35 mil millones de parámetros totales y 3 mil millones activos, que incorpora visión, generación de texto y capacidades de razonamiento. Esta versión cuantizada reduce el cuerpo de lenguaje a affine 4-bit con router gates a 8-bit, manteniendo la visión y el módulo MTP (multi-token prediction) en BF16, lo que permite ejecutarlo en hardware de Apple con un consumo de memoria reducido.

La relevancia de este modelo radica en su diseño para ejecución local en Macs con chips M-series, aprovechando el runtime MTPLX y la librería MLX. Con una ventana de contexto de 262 144 tokens, soporte de tool calling y decodificación especulativa nativa, está orientado a desarrolladores que necesitan un asistente multimodal de gran capacidad sin depender de infraestructura en la nube. La licencia MIT facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE multimodal (vision-language) |
| Parametros totales | 35B (modelo base); 6 948 351 856 en safetensors cuantizados |
| Parametros activos | 3B |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Affine 4-bit/group-32 (cuerpo de lenguaje), affine 8-bit/group-64 (80 router gates MoE), BF16 (vision y MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE de tipo Qwen3.5 con 35B parámetros totales y 3B activos por token, lo que reduce el coste computacional en inferencia. Según la documentación de ornith.ai, Ornith-1.5 extiende el marco de auto-andamiaje (self-scaffolding) de Ornith-1.0 hacia un bucle de auto-mejora: el modelo propone nuevas tareas, genera andamios específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, generando continuamente nuevas experiencias de aprendizaje.

Esta versión cuantizada de Shiftedx aplica una receta de precisión "fail-closed" documentada en `BUILD_RECIPE.json` y `conversion_receipt.json`. El cuerpo de lenguaje se cuantiza a affine 4-bit con grupos de 32, mientras que los 80 router gates del MoE se mantienen a affine 8-bit con grupos de 64 para preservar la precisión del enrutamiento. La visión (333 tensores BF16) y el módulo MTP (785 tensores BF16 en `mtp/weights.safetensors`) se conservan en BF16. El tokenizer, la plantilla de chat y los procesadores de imagen y vídeo se preservan intactos. El barrido de calibración AR/D1/D2/D3 seleccionó la configuración D1 con 124,21 tokens por segundo de decodificación en el host de cualificación.

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de pensamiento activable (thinking on) y esfuerzo de razonamiento configurable.
- Comprensión de imágenes y vídeo (pipeline image-text-to-text) mediante el procesador de visión integrado.
- Tool calling y function calling: 100 % de acierto en el benchmark Shiftedx Bench.
- Capacidades agénticas básicas: 50 % de acierto en tareas de agente en el benchmark.
- Decodificación especulativa nativa mediante MTP (multi-token prediction) con profundidad configurable.
- Ventana de contexto larga de 262 144 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente local de productividad en Mac: con MTPLX y el perfil turbo, el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) sin conexión a internet, ideal para entornos de trabajo con datos sensibles.
- Análisis de imágenes y documentos escaneados: gracias a su componente de visión BF16, puede describir imágenes, extraer información de capturas y responder preguntas sobre contenido visual directamente desde la línea de comandos con `mlx_vlm.generate`.
- Desarrollo de código asistido: soporta tool calling, lo que permite integrarlo en pipelines de CI/CD para generar, revisar o documentar código, con una velocidad de decodificación de unos 112 tokens por segundo en hardware M4 Max.
- Agentes autónomos ligeros: su capacidad agéntica (50 % en benchmark) permite construir prototipos de agentes que ejecutan tareas simples con llamadas a herramientas, aunque no es recomendable para flujos críticos sin supervisión.
- Procesamiento de documentos largos: la ventana de 262 144 tokens permite resumir o analizar informes extensos, libros técnicos o logs de sistema en una sola pasada, con un consumo de memoria activa de 39-42 GiB.
- Investigación en aprendizaje por refuerzo: al estar basado en el enfoque de auto-mejora de Ornith-1.5, puede utilizarse como generador de tareas y soluciones en entornos de experimentación académica, gracias a su licencia MIT.

## Benchmarks y rendimiento

Los resultados del Shiftedx Bench v0.3.0, publicados por el autor para la revisión de pesos `f1607035e1a6b2610e51f6d5322c55cc0ba052ca`, se resumen en la siguiente tabla. Las categorías se evalúan por separado y no se produce una puntuación compuesta.

| Categoría | Aciertos | Precisión | Tiempo medio | Decodificación media | Memoria activa pico |
|---|---:|---:|---:|---:|---:|
| Calidad | 7/10 | 70,0 % | 7,51 s | 112,00 tok/s | 39,30 GiB |
| Contexto largo | 9/15 | 60,0 % | 41,03 s | 107,09 tok/s | 42,00 GiB |
| Tool calling | 6/6 | 100,0 % | 1,71 s | 89,90 tok/s | 40,53 GiB |
| Agéntico | 1/2 | 50,0 % | 5,34 s | — | — |
| Visión | 1/4 | 25,0 % | 1,62 s | 110,15 tok/s | 39,28 GiB |

Condiciones de la prueba: MTPLX 2.7.1, MLX 0.32.0, mlx-lm 0.31.3, perfil D1, modo turbo, thinking activado, esfuerzo de razonamiento medio, caché KV desactivada, profundidad MTP 1, host Apple M4 Max con 64 GiB de memoria unificada. Los contextos representados fueron 4 096, 16 384, 65 536 y 131 072 tokens de prompt, aunque el contexto efectivo probado fue de 4 096 tokens. La prueba de 260 096 tokens no se ejecutó por estar fuera del alcance del gate de cuantización ligera.

## Requisitos de hardware

- Memoria unificada: se requieren entre 39 y 42 GiB de memoria activa durante la inferencia, según la categoría de prueba.
- Hardware recomendado: Apple Silicon con al menos 64 GiB de memoria unificada (el host de cualificación fue un M4 Max con 64 GiB). Modelos con 48 GiB podrían funcionar con limitaciones.
- GPU compatibles: exclusivamente Apple Silicon; no es compatible con GPUs NVIDIA o AMD al estar construido con MLX.
- Opciones de despliegue: MTPLX (app nativa para Mac con servidor local), `mlx_vlm.generate` para generación de imagen a texto, y el runtime MLX estándar.
- Latencia y throughput: decodificación media de 89,9 a 112,0 tokens por segundo en el host de cualificación, con tiempos de respuesta de 1,7 a 41 segundos según la tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Shiftedx/ornith-1.5-35b-a3b-affine4-router8-vision-mtplx | 35B totales, 3B activos | 262 144 | Affine 4-bit + router 8-bit + BF16 | MIT | Apple Silicon (MLX) |
| Shiftedx/ornith-1.0-35b-mxfp4-vision-mtplx | 35B totales | no disponible | MXFP4 | MIT | Apple Silicon (MLX) |
| Shiftedx/ornith-1.0-35b-abliterated-mxfp4-vision-mtplx | 35B totales | no disponible | MXFP4 | MIT | Apple Silicon (MLX) |
| ornith-ai/Ornith-1.5-35B-A3B (BF16) | 35B totales, 3B activos | 262 144 | BF16 | MIT | Multiplataforma |

La comparativa se limita a las variantes de Ornith disponibles públicamente. No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) para este modelo cuantizado, por lo que no es posible compararlo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo experimental: el autor indica que esta cuantización de control es experimental y que el comportamiento puede diferir del padre BF16 y de la variante híbrida de mayor precisión.
- Paridad incompleta: no se ejecutó una prueba completa de paridad con el modelo BF16 original en el host de cualificación de 64 GiB.
- Rendimiento de visión limitado: solo 25 % de acierto en la categoría de visión del benchmark, lo que sugiere que la comprensión de imágenes puede ser poco fiable para tareas exigentes.
- Capacidad agéntica débil: 50 % de acierto en tareas de agente, por lo que no se recomienda para flujos autónomos en producción sin supervisión humana.
- Dependencia de hardware Apple: al estar construido con MLX, no es ejecutable en GPUs de otros fabricantes sin conversión adicional.
- Idiomas no documentados: no se ha publicado información sobre los idiomas soportados, lo que limita su uso en aplicaciones multilingües.
- Contexto efectivo no verificado: aunque la ventana declarada es de 262 144 tokens, la prueba de contexto largo solo alcanzó 4 096 tokens efectivos; el comportamiento en contextos extremos no está validado.
- Sin datos de sesgos o alucinación: no se han publicado evaluaciones de sesgos, toxicidad o tasas de alucinación para esta versión cuantizada.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Shiftedx/ornith-1.5-35b-a3b-affine4-router8-vision-mtplx
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Documentación de Ornith-1.5 (self-scaffolding y self-improvement): https://ornith.ai/ornith_1_5.html
- MTPLX (runtime para Mac): https://www.mtplx.com/
- Variante anterior de Shiftedx (Ornith-1.0 MXFP4): https://huggingface.co/Shiftedx/ornith-1.0-35b-mxfp4-vision-mtplx
- Variante abliterada de Shiftedx (Ornith-1.0): https://huggingface.co/Shiftedx/ornith-1.0-35b-abliterated-mxfp4-vision-mtplx
