# mradermacher/Genisi-Codex-Open-GGUF

## Resumen

Genisi-Codex-Open es un modelo de lenguaje de 9.197 millones de parámetros (aproximadamente 9,2 mil millones) orientado a tareas de agente de programación e ingeniería de software. Lo desarrolla AnesNT2026, autor vinculado a la región de Batna (Argelia), y se distribuye bajo licencia MIT. El modelo base se publica en el repositorio `AnesNT2026/Genisi-Codex-Open`, y la versión aquí descrita es la cuantización GGUF realizada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face.

La propuesta del modelo se centra en tres ejes: soporte de contexto largo (hasta 256.000 tokens según las etiquetas del repositorio), tool calling universal y evaluación orientada a SWE-bench, lo que lo sitúa en la categoría de modelos especializados en agentes de código. Declara soporte para árabe, inglés y francés, lo que amplía su alcance respecto a modelos de código puramente anglocéntricos.

Esta ficha cubre la variante GGUF, que incluye cuantizaciones estáticas desde Q2_K hasta f16, además de ficheros mmproj para un componente multimodal. La información pública disponible es limitada: la model card del cuantizador no incluye detalles de arquitectura, datos de entrenamiento ni resultados de benchmarks, por lo que varios apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, según `library_name: transformers`; detalles no publicados) |
| Parámetros totales | 9.197.093.888 (9,2 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256.000 tokens (según etiqueta `256k-context` del repositorio) |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | árabe (ar), inglés (en), francés (fr) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 85,5 GB |
| Cuantizaciones ponderadas (imatrix) | no disponibles en el momento de la publicación |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la información disponible. El repositorio base se etiqueta como `transformers`, lo que indica compatibilidad con la librería de Hugging Face, y el tamaño de 9,2 mil millones de parámetros es coherente con un transformer denso de escala media, aunque no se confirma si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se especifica si es un modelo MoE.

Respecto al entrenamiento, la información disponible no incluye el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Las etiquetas del repositorio (`coding-agent`, `software-engineering`, `swe-bench`, `universal-tool-calling`) sugieren un entrenamiento orientado a tareas de agente y código, pero no hay datos verificables sobre el proceso. La presencia de ficheros mmproj en la distribución GGUF indica que el modelo base incorpora algún componente multimodal, aunque no se detalla su naturaleza ni sus capacidades.

## Capacidades

- Generación de texto conversacional en árabe, inglés y francés.
- Agente de programación: etiquetado explícitamente como `coding-agent` y `software-engineering`, orientado a tareas de escritura y modificación de código.
- Tool calling universal: la etiqueta `universal-tool-calling` indica soporte de llamada a funciones y herramientas externas.
- Contexto largo de hasta 256.000 tokens, adecuado para repositorios completos o conversaciones multi-turno extensas.
- Evaluación orientada a SWE-bench, lo que sugiere capacidad para resolver incidencias de software reales.
- Componente multimodal: la distribución incluye ficheros `mmproj` (Q8_0 y f16), lo que implica soporte de entrada de imágenes, aunque no se detallan las capacidades concretas.
- Razonamiento multi-paso y ejecución de agentes: implícito en las etiquetas de agente de código y tool calling, sin documentación adicional.

## Casos de uso

- Resolución automática de incidencias en repositorios: con 256.000 tokens de contexto, el modelo puede ingerir ficheros relevantes, historial de issues y trazas de error para proponer parches, un escenario alineado con su etiqueta `swe-bench`.
- Asistente de programación integrado en el IDE: el soporte de tool calling permite que el modelo consulte documentación, ejecute tests o inspeccione el árbol de ficheros durante la sesión de edición.
- Automatización de revisiones de código en CI/CD: el modelo puede analizar diffs y generar comentarios estructurados sobre cambios, aprovechando su orientación a ingeniería de software.
- Agentes autónomos de refactorización: con contexto largo y tool calling, puede planificar y ejecutar cambios multi-fichero en pipelines controlados.
- Atención al cliente técnica en inglés, francés y árabe: el soporte trilingüe permite desplegar un asistente único para mercados del Magreb y Europa, aunque la calidad por idioma no está documentada.
- Generación de documentación técnica a partir de código: el modelo puede resumir módulos y generar guías de uso, una tarea que se beneficia del contexto extendido.
- Análisis de imágenes técnicas: gracias a los ficheros mmproj, puede procesar capturas de pantalla de errores o diagramas de arquitectura como entrada complementaria al texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las etiquetas del repositorio mencionan `swe-bench`, pero no se aportan puntuaciones ni métricas concretas.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de fichero GGUF): Q2_K ≈ 4,1 GB; Q3_K_S ≈ 4,5 GB; Q3_K_M ≈ 4,9 GB; Q3_K_L ≈ 5,3 GB; IQ4_XS ≈ 5,5 GB; Q4_K_S ≈ 5,6 GB; Q4_K_M ≈ 5,9 GB; Q5_K_S ≈ 6,6 GB; Q5_K_M ≈ 6,8 GB; Q6_K ≈ 7,7 GB; Q8_0 ≈ 9,9 GB; f16 ≈ 18,5 GB.
- Componente multimodal adicional: mmproj-Q8_0 ≈ 0,7 GB y mmproj-f16 ≈ 1,0 GB.
- GPU consumer: las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8 GB de VRAM (RTX 3060 Ti, RTX 4060) con margen ajustado para el contexto; Q6_K y Q8_0 requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090). La versión f16 necesita al menos 24 GB (RTX 3090, RTX 4090, A10G).
- GPU de centro de datos: A100 (40/80 GB) y H100 permiten ejecutar f16 con contexto largo completo y mayor throughput.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para el modelo base en safetensors. El repositorio se etiqueta con `endpoints_compatible`, lo que facilita su integración en servicios de inferencia compatibles.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Genisi-Codex-Open (este) | 9,2 B | 256k (según etiqueta) | MIT | ar, en, fr | Orientado a agente de código; sin benchmarks publicados |
| Qwen2.5-Coder-7B | 7,6 B | 128k | Apache 2.0 | multilingüe | Amplia documentación y benchmarks publicados |
| CodeLlama-7B | 6,7 B | 16k (100k en variante) | Llama 2 custom | en (principalmente) | Referencia clásica en código; contexto menor |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos MoE) | 128k | DeepSeek License | multilingüe | MoE con mayor eficiencia por token activo |

La comparación se basa en categoría y escala; no hay datos de rendimiento del modelo evaluado que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las capacidades declaradas (SWE-bench, tool calling) con métricas independientes.
- Documentación mínima: la model card del cuantizador no describe arquitectura, datos de entrenamiento ni proceso de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no se puede acotar su magnitud en tareas de código.
- Cobertura lingüística limitada a árabe, inglés y francés; no se declara soporte de castellano, por lo que su uso en español no está garantizado.
- Contexto de 256k declarado mediante etiqueta, sin verificación publicada de que el modelo mantenga calidad en ventanas tan largas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del modelo base por si hubiera restricciones adicionales no reflejadas.
- Cuantizaciones estáticas sin versión imatrix: las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas de razonamiento y código.
- Popularidad muy baja (0 descargas, 1 like en el momento de la consulta): no hay validación de la comunidad ni reportes de uso en producción.
- El componente multimodal se distribuye como mmproj, pero no se documentan sus capacidades ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Genisi-Codex-Open-GGUF
- Modelo base: https://huggingface.co/AnesNT2026/Genisi-Codex-Open
- Página de descargas del cuantizador: https://hf.tst.eu/model#Genisi-Codex-Open-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
