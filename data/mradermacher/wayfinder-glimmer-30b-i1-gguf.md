# mradermacher/wayfinder-glimmer-30b-i1-GGUF

## Resumen

wayfinder-glimmer-30b-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo hweller1/wayfinder-glimmer-30b. El modelo original es un transformer de aproximadamente 27.850 millones de parámetros (27,85 B), orientado a tareas de búsqueda de código, uso de herramientas y razonamiento agéntico, con etiquetas que indican un proceso de fusión LoRA (lora-merged) y una arquitectura derivada de la familia Muse. Este repositorio no contiene los pesos originales en precisión completa, sino versiones cuantizadas con método i1 (imatrix) pensadas para ejecución local eficiente.

La relevancia de esta ficha radica en que permite evaluar el modelo en entornos con recursos limitados: las cuantizaciones i1-Q2_K ocupan unos 10,8 GB y el repositorio completo suma 81,4 GB, lo que abre la puerta a despliegues en GPU de consumo y estaciones de trabajo. El modelo está entrenado y etiquetado únicamente para inglés y su licencia combina Apache-2.0 con la licencia Muse Model, un detalle crítico para cualquier uso comercial.

La información disponible no incluye detalles sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esta ficha refleja fielmente lo publicado y marca como no disponible todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Muse; detalles no disponibles) |
| Parámetros totales | 27.854.794.240 (≈27,85 B) |
| Parámetros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1 (imatrix): Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, Q4_0, Q4_1, small-IQ4_NL |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0-and-muse-model-license (Apache-2.0 combinada con Muse Model License) |
| Formato de pesos | GGUF (cuantizaciones i1); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo base hweller1/wayfinder-glimmer-30b es un transformer de 27,85 B parámetros. Las etiquetas del repositorio indican que se trata de un modelo con fusión LoRA (lora-merged), lo que sugiere que los pesos publicados incorporan adaptadores entrenados sobre una base previa de la familia Muse. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

Las innovaciones técnicas destacables que sí aparecen en los metadatos son su orientación explícita a code-search, agentic, tool-use y subagent, lo que indica que el ajuste fino se centró en flujos de trabajo con agentes y llamadas a herramientas. El proceso de cuantización i1 aplicado por mradermacher utiliza ficheros imatrix (incluido en el repositorio, 0,1 GB) para ponderar la importancia de los tensores durante la compresión, lo que mejora la calidad de las cuantizaciones de baja precisión frente a cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta conversational en el repositorio.
- Búsqueda de código (code-search): el modelo está ajustado para localizar, recuperar y razonar sobre fragmentos de código.
- Uso de herramientas (tool-use / function calling), según las etiquetas del autor.
- Flujos agénticos y razonamiento multi-paso (agentic).
- Soporte de subagentes (subagent), orientado a arquitecturas de orquestación con agentes delegados.
- Capacidades de visión: la model card de mradermacher indica que se trata de un modelo de visión y que los ficheros mmproj, si existen, se alojan en el repositorio estático.
- Capacidades multilingües: limitadas al inglés según el campo language.

## Casos de uso

- Asistente de búsqueda de código en repositorios grandes: el modelo puede indexar y consultar fragmentos de código en lenguaje natural, devolviendo referencias y explicaciones, gracias a su ajuste específico en code-search.
- Automatización de revisión de código en CI/CD: integrado como subagente, puede analizar diferencias (diffs) y proponer correcciones o señalar riesgos antes de fusionar una rama.
- Orquestación de agentes de desarrollo: al soportar tool-use y subagent, encaja como planificador que delega tareas a herramientas de compilación, test o linters.
- Documentación técnica automatizada: generar explicaciones de módulos y APIs a partir del código fuente, aprovechando su capacidad conversacional en inglés.
- Análisis de imágenes técnicas: si se acompaña del fichero mmproj correspondiente, puede procesar capturas de pantalla, diagramas o diagramas de arquitectura junto con texto.
- Asistente de soporte interno para equipos de ingeniería: responder preguntas sobre la base de código y guiar al usuario paso a paso en la resolución de incidencias.
- Prototipado local en estaciones de trabajo: las cuantizaciones i1-Q2_K (10,8 GB) permiten probar el modelo en GPU de consumo antes de decidir un despliegue en mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB para i1-Q2_K (10,8 GB de pesos más overhead de contexto y caché KV); entre 16 y 20 GB para cuantizaciones Q4_K_M; por encima de 24 GB para Q6_K.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q6_K y para servir varias peticiones concurrentes.
- GPU de consumo: sí, cabe en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en tarjetas de 12-16 GB solo con las cuantizaciones más agresivas (Q2_K, IQ2, IQ3).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; para el modelo original en safetensors, vLLM o TGI (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| wayfinder-glimmer-30b (este) | 27,85 B | No disponible | Apache-2.0 + Muse Model License | GGUF (i1 y estáticas), safetensors en el repo base |
| Alternativas de ~30 B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- No se publican datos de benchmarks, por lo que no es posible verificar su calidad frente a alternativas de tamaño similar.
- La licencia combina Apache-2.0 con la Muse Model License; es imprescindible revisar el fichero LICENSE-MUSE-SPARK-OPEN.md antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Las cuantizaciones de baja precisión (Q2_K, IQ1, IQ2) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de recuperación de código donde puede inventar APIs o firmas de funciones.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- La fecha de creación del repositorio (2026-11-06) y la falta de pipeline declarado añaden incertidumbre sobre su mantenimiento y compatibilidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/wayfinder-glimmer-30b-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-GGUF
- Modelo base: https://huggingface.co/hweller1/wayfinder-glimmer-30b
- Licencia Muse Model: https://huggingface.co/hweller1/wayfinder-glimmer-30b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Página de descargas del cuantizador: https://hf.tst.eu/model#wayfinder-glimmer-30b-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
