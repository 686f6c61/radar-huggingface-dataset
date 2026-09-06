# GALAIXYZ/galx-titan-27B-firewall

## Resumen

GALX-Titan-27B-Firewall es un modelo de lenguaje causal desarrollado por GALAIXYZ, presentado como un "firewall de ejecución de sistemas" para entornos de ingeniería de software y ciberseguridad. Está construido sobre el modelo base Qwen/Qwen3.8-27B-FP8, del que hereda la arquitectura transformer y los 27.000 millones de parámetros. El modelo se publica bajo licencia Apache-2.0 y está disponible en formato safetensors con cuantización FP8, optimizada para hardware Hopper y Blackwell.

Su propuesta de valor reside en la capacidad de razonar paso a paso (mediante etiquetas `` antes de emitir una respuesta final verificada. Además, el autor menciona "anti-benchmaxxing", lo que sugiere una estrategia de entrenamiento orientada a evitar el sobreajuste a benchmarks específicos, priorizando capacidades generalizables en entornos reales. No se han publicado detalles sobre la composición del dataset de entrenamiento ni el número total de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento paso a paso con modo de pensamiento explícito mediante etiquetas ``.
- Síntesis de código competitivo y generación de código en producción, con resultados declarados de 92,4 en LiveCodeBench v6 y 90,5 en EvalPlus.
- Resolución de issues de software a escala de repositorio, con capacidades para depuración autónoma multiarchivo.
- Control de sistemas operativos y navegadores: el modelo puede ejecutar tareas en terminal, gestionar ventanas y automatizar navegación web.
- Automatización de dispositivos móviles, con control de aplicaciones Android.
- Razonamiento matemático avanzado, incluyendo problemas de olimpiadas y razonamiento simbólico.
- Razonamiento científico de nivel avanzado, con resultados declarados de 90,8 en GPQA Diamond.
- Comprensión multimodal de documentos e imágenes: soporta OCR, análisis de layout y razonamiento visual sobre documentos.
- Soporte de tool calling y function calling, inferido de los benchmarks de control de terminal, navegador y sistemas operativos.
- Capacidades multilingües en inglés y chino.

## Casos de uso

- Auditoría de comandos en pipelines CI/CD: el modelo puede analizar comandos bash propuestos antes de su ejecución, detectando comportamientos peligrosos o no autorizados. Su modo de razonamiento paso a paso permite justificar la decisión de bloqueo o aprobación.
- Resolución autónoma de issues en repositorios de código: gracias a su rendimiento en SWE-bench Pro (64,2 de Resolve Rate), puede integrarse en agentes que naveguen por el código, propongan parches y ejecuten pruebas automáticamente.
- Generación de código en entornos de producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, refactorizar código o completar funciones, manteniendo un alto nivel de precisión en tareas de síntesis competitiva.
- Automatización de terminales y operaciones de sistemas: el modelo puede controlar entornos de terminal reales para tareas administrativas, configuración de servidores o ejecución de scripts, como refleja Terminal Bench 2.1.
- Depuración a escala de repositorio: para proyectos grandes, puede localizar bugs en múltiples archivos y proponer correcciones, con un Avg@3 Resolve Rate declarado de 81,5 en QwenSWEBench.
- Análisis de documentación técnica y OCR: su capacidad multimodal permite extraer información de documentos densos, tablas y layouts complejos, útil en procesos de digitalización y verificación documental.
- Automatización de pruebas de seguridad: mediante fuzzing de propiedades y verificación de mutaciones de código, puede identificar vulnerabilidades en código fuente.
- Asistente de razonamiento científico y matemático: para investigación, puede resolver problemas de nivel olímpico y validar demostraciones simbólicas, con precisión declarada de 75,2 en MATH-500.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a la versión GALX-Titan-27B-v2.0, declarados por el autor del modelo en la model card.

| Benchmark | Tarea | Métrica | Resultado |
|---|---|---|---|
| SWE-bench Pro | Ingeniería de software y codificación agéntica | Resolve Rate (Pass@1) | 64,2 |
| LiveCodeBench v6 | Síntesis de código competitivo | Pass@1 | 92,4 |
| Terminal Bench 2.1 (Terminus) | Resolución de problemas interactivos en terminal | Pass Rate | 75,8 |
| QwenSWEBench | Depuración autónoma a escala de repositorio | Avg@3 Resolve Rate | 81,5 |
| DeepSWE 1.1 | Corrección de bugs multiarchivo de largo horizonte | Resolve Rate | 44,8 |
| CoWorkBench | Productividad operativa y laboral | Task Completion Rate | 73,5 |
| EvalPlus (HumanEval+) | Fuzzing de propiedades adversariales | Pass@1 (100 vectores fuzz) | 90,5 |
| GSM8K | Razonamiento matemático estándar | Accuracy | 96,8 |
| GSM-Symbolic (NoOp Distractors) | Razonamiento matemático contrafáctico | Accuracy | 95,6 |
| MATH-500 | Matemáticas de olimpiada | Accuracy | 75,2 |
| MATH-Symbolic (SymPy Proofs) | Invariancia algebraica simbólica | Proof Verification Rate | 72,8 |
| IFBench | Seguimiento estricto de instrucciones | Pass Rate | 81,2 |
| GPQA Diamond | Razonamiento científico avanzado | Accuracy | 90,8 |
| OSWorld-Verified | Control de ordenadores y sistemas operativos | Task Completion Rate | 86,0 |
| WebArena-Verified | Navegación y automatización de navegador | Task Completion Rate | 66,5 |
| AndroidWorld | Control de sistemas operativos móviles | Task Success Rate | 83,4 |
| MathVision (With CI) | Razonamiento visual y documental multimodal | Accuracy | 95,4 |
| OmniDocBench 1.5 | OCR y comprensión de layout de documentos densos | Structural Parsing Score (F1) | 92,0 |
| MuTAP (Mutation Testing) | Resistencia a mutación de código AST | Mutant Kill Rate | 88,0 |
| CounterBench | Inversión de restricciones causales | Accuracy | 95,4 |

## Requisitos de hardware

- VRAM estimada: el peso del modelo en FP8 es de aproximadamente 32,2 GB, por lo que se requiere un mínimo de 40 GB de VRAM para inferencia con contexto corto. Para contextos largos o cargas de trabajo agénticas, se recomienda 80 GB o más.
- GPU recomendadas: H100, H200 y B200, dado que el modelo está optimizado con kernels Triton específicos para estas arquitecturas y soporta nativo FP8. Las GPU A100 no ofrecen soporte nativo de FP8, por lo que no se recomiendan para este modelo.
- En consumer GPU: no es viable en GPUs de consumo (RTX 4090, 3090) debido al tamaño del modelo en FP8, a menos que se apliquen cuantizaciones adicionales no documentadas.
- Opciones de despliegue: vLLM, SGLang, Text Generation Inference (TGI) y Transformers. También se menciona compatibilidad con Modal Cloud.
- Latencia y throughput: no se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos en la información proporcionada. El modelo base Qwen/Qwen3.8-27B-FP8 es la referencia directa, pero no se han publicado resultados comparativos entre ambos en la documentación disponible.

## Limitaciones y advertencias

- El repositorio `GALAIXYZ/galx-titan-27B-firewall` muestra un tamaño de 0,0 GB en la ficha de HuggingFace, lo que puede indicar que los pesos no están alojados en este repositorio concreto o que se distribuyen como adaptadores. Es necesario verificar la disponibilidad real de los pesos antes de su uso.
- Los benchmarks declarados por el autor no están verificados de forma independiente. Aunque la model card indica `verified: true` en algunos casos, la información extraída de HuggingFace muestra `verified: false` para los mismos resultados. Se recomienda reproducir las evaluaciones antes de tomar decisiones críticas.
- El modelo solo soporta inglés y chino, lo que limita su uso en entornos multilingües que requieran otros idiomas.
- No se han documentado sesgos específicos, pero al estar basado en un modelo preentrenado generalista, puede heredar sesgos sociales y culturales presentes en los datos de entrenamiento originales.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o en la generación de código que no ha sido ejecutado. El modo de verificación no garantiza la corrección absoluta.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar las condiciones del modelo base Qwen3.8 para asegurar el cumplimiento de sus términos adicionales.
- Las capacidades multimodales (visión y OCR) se infieren de los benchmarks declarados, pero no se ha confirmado que el modelo soporte entrada de imágenes en la actual configuración publicada.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/GALAIXYZ/galx-titan-27B-firewall
- Repositorio vinculado GALX-Titan-27B-v2.0: https://huggingface.co/GALXAI/GALX-Titan-27B-v2.0
- README del modelo: https://huggingface.co/GALXAI/GALX-Titan-27B-v2.0/blob/main/README.md
