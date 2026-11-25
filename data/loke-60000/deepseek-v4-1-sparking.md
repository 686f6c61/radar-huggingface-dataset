# Loke-60000/DeepSeek-V4.1-Sparking

## Resumen

DeepSeek-V4.1-Sparking es una cuantización experimental del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Loke-60000 en Hugging Face. El objetivo declarado es comprimir el modelo original (475 GiB entre pesos y tablas Engram) hasta 280 GiB para que quepa y funcione íntegramente en una única estación NVIDIA DGX Spark (GB10, 128 GB de memoria unificada), sin podar ningún componente. Se distribuye bajo licencia MIT y en formato EXL3 (exllamav3).

El modelo subyacente es un transformer de mezcla de expertos (MoE) de 40 capas con tamaño oculto 5.120, 384 expertos enrutados más uno compartido por capa y 6 expertos enrutados activados por token. Incorpora atención dispersa con indexador de tokens (top 512) y ventana deslizante de 128 tokens, además de una memoria de n-gramas denominada Engram (hasta 4-gramas) y tres capas de borrador DSpark para decodificación especulativa. Soporta texto e imagen, modo de razonamiento opcional y tool calling, con una longitud de contexto de hasta 1M de tokens (256K por flujo en esta configuración).

La relevancia de esta ficha radica en que documenta un ejercicio de cuantización extrema (1,27 bits por peso de media en los expertos enrutados) y su encaje en hardware de consumo profesional. El propio autor la marca como experimental, no ajustada ni verificada para producción, por lo que debe tratarse como material de investigación sobre técnicas de cuantización y despliegue en memoria unificada, no como un modelo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 40 capas, hidden size 5.120; atención dispersa con indexador de tokens (top 512) y ventana deslizante de 128 tokens; memoria Engram de n-gramas; 3 capas draft DSpark para decodificación especulativa |
| Parametros totales | no disponible (384 expertos enrutados + 1 compartido por capa, 6 enrutados por token) |
| Parametros activos | no disponible (6 expertos enrutados por token) |
| Longitud de contexto | hasta 1M tokens; 256K por flujo en esta configuración (8 flujos) |
| Tipos de cuantizacion | EXL3 con anchos mixtos: expertos enrutados de 1 a 4 bits (1,27 de media), atención/expertos compartidos/cabeza de 5 a 8 bits, capas draft DSpark a 4 bits, embeddings/normas/sesgos a 16 bits |
| Idiomas soportados | no disponible (la model card no detalla la lista) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (exllamav3); tablas Engram empaquetadas aparte |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 40 capas y tamaño oculto 5.120. Cada capa contiene 384 expertos enrutados más uno compartido, con 6 expertos enrutados activados por token. La atención usa 64 cabezas con mecanismo disperso basado en un indexador de tokens (selección top 512) combinado con una ventana deslizante de 128 tokens. A esto se añaden dos componentes propios de la familia V4.1: las tablas Engram, una memoria de n-gramas (hasta 4-gramas) situada junto al transformer, y DSpark, tres capas de borrador para decodificación especulativa. El vocabulario es de 129.280 tokens.

El proceso de cuantización documentado por el autor consta de cinco pasos. Primero, calibración con texto compuesto aproximadamente al 50 % por salidas del propio DeepSeek V4.1 Flash (razonamiento, código, chat y trayectorias de agente) y el resto por texto público (derecho, artículos, libros, web y otros idiomas). Segundo, cálculo de matrices de Hessian a partir de la implementación de referencia de DeepSeek con expertos FP4 y pesos densos FP8 originales, registrando la entrada de cada matriz cuantizada sin propagar error entre capas. Tercero, medición del coste de cuantización por grupo de capas mediante la KL recuperada al restaurar expertos FP4. Cuarto, codificación con `quantize_exl3` de exllamav3 usando los anchos asignados y los Hessians de cada capa. Quinto, verificación de cada cambio contra los logits del modelo original. La asignación de bits es adaptativa: cada experto enrutado parte de 1 bit y el presupuesto restante se asigna bit a bit al experto donde reduce más el error, ponderado por la frecuencia de enrutamiento y el coste de cuantización de su capa.

## Capacidades

- Generación de texto con modo de razonamiento (thinking) opcional, heredado del modelo base V4.1-Flash-1017.
- Procesamiento de imágenes: el modelo base acepta texto e imagen y produce texto.
- Razonamiento mejorado, código, tareas agénticas y resultados visuales según las notas del autor sobre la actualización de octubre.
- Tool calling y function calling.
- Soporte de agentes y razonamiento multi-paso.
- Salidas más cortas que versiones anteriores del modelo base.
- Contexto largo: hasta 1M de tokens en el modelo base, con 8 flujos simultáneos de 256K en esta configuración.
- Decodificación especulativa mediante las capas DSpark para acelerar la inferencia.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Investigación en cuantización extrema: el modelo sirve como banco de pruebas para estudiar cómo se distribuyen bits entre expertos de un MoE y qué impacto tiene en la calidad, gracias a la documentación detallada del proceso de asignación de bits y a las matrices Hessian por capa.
- Despliegue en hardware de memoria unificada: permite ejecutar un MoE de gran tamaño en una única DGX Spark (GB10, 128 GB), útil para laboratorios con presupuesto limitado que quieran experimentar con modelos de frontera sin clústeres multi-GPU.
- Prototipado de agentes con contexto largo: los 8 flujos de 256K tokens permiten mantener varias sesiones agénticas simultáneas con historial extenso, adecuado para pruebas de pipelines de agentes antes de migrar a infraestructura mayor.
- Evaluación de decodificación especulativa: las capas DSpark permiten medir el rendimiento de técnicas de draft-and-verify en un modelo real de gran escala, comparando latencia y throughput frente a decodificación estándar.
- Procesamiento de documentos largos con imagen: al aceptar texto e imagen y disponer de contexto de hasta 1M tokens en el modelo base, puede emplearse en experimentos de análisis de documentos escaneados o informes extensos.
- Formación y divulgación técnica: el repositorio y la model card constituyen material didáctico sobre cuantización EXL3, calibración con Hessians y despliegue de MoE en SSD, útil para cursos y talleres de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de velocidad (`assets/speed-v2.png`) medida en una DGX Spark con el motor DeepSeek de TensorFold, 8 ranuras de 256K y DSpark activado, pero no se proporcionan cifras numéricas de latencia ni throughput en el texto.

## Requisitos de hardware

- VRAM/memoria: 91,4 GiB de pesos EXL3 en memoria (pack-full79c5) más 189 GiB de tablas Engram leídas desde SSD fila a fila. Total en disco: 280 GiB (frente a los 475 GiB del modelo original).
- Hardware objetivo: una única NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada. Durante un prompt de 198K tokens, la memoria libre descendió a 4,28 GiB frente al suelo de 4,0 GiB del motor.
- Almacenamiento: las tablas Engram deben residir en el NVMe interno para evitar cuellos de botella de lectura.
- GPU recomendadas: DGX Spark (GB10) es el objetivo declarado. No se documenta compatibilidad con A100, H100 ni RTX 4090; por el volumen de memoria (91 GiB en memoria más lecturas de SSD), no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: motor DeepSeek de TensorFold con kernels GB10 para EXL3; el formato es EXL3 plano, por lo que debería funcionar con herramientas de exllamav3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras; solo se referencia la gráfica de velocidad del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Sparking | MoE, 40 capas, 384+1 expertos/capa (totales no disponibles) | 1M (256K por flujo en esta config) | EXL3, 1,27 bits medios en expertos | MIT | Hugging Face, 300,9 GB de repo |
| DeepSeek-V4.1-Flash-1017 (base) | MoE, misma arquitectura | 1M | FP4 expertos, FP8 densos | MIT (segun repo derivado) | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en el material proporcionado.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por el autor: no ha sido ajustado ni verificado para uso en producción, y se espera menor precisión que la versión oficial de DeepSeek.
- La cuantización a 1,27 bits medios en expertos enrutados (73,6 % de expertos a 1 bit) implica una pérdida de calidad no cuantificada en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de fidelidad factual para esta cuantización.
- Sesgos: no se detallan sesgos conocidos del modelo base ni del proceso de cuantización.
- Idiomas: la lista de idiomas soportados no está disponible; el texto de calibración incluye "otros idiomas" sin especificar.
- Restricciones de licencia: MIT permite uso comercial, pero la ausencia de validación para producción desaconseja su uso directo en entornos críticos.
- Dependencia de hardware específico: el diseño asume una DGX Spark con NVMe interno; el rendimiento fuera de ese entorno no está documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- El contexto efectivo en esta configuración se reduce a 256K por flujo (8 flujos), no al 1M del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Loke-60000/DeepSeek-V4.1-Sparking
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor TensorFold: https://github.com/ashhart/TensorFold
- exllamav3 (formato EXL3): no se proporciona enlace directo en la información disponible
