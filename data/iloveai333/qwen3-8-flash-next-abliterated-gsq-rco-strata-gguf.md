# IloveAi333/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF es un paquete de cuantizaciones GGUF de baja precisión (2,40 a 3,50 bits por peso) del modelo multimodal Qwen3.8-Flash-Next, publicadas originalmente por el laboratorio ISTA-DASLab y redistribuidas aquí por el usuario IloveAi333 junto con un vector de dirección de rechazo extraído de la variante abliterated de huihui-ai. El modelo base es un transformer multimodal de tipo image-text-to-text con 120.320 millones de parámetros totales, desarrollado por el equipo Qwen, y esta ficha describe la variante cuantizada y modificada en tiempo de ejecución, no los pesos originales en BF16.

La aportación concreta de este repositorio no son los pesos, que se copian byte a byte desde ISTA-DASLab, sino un fichero de 480 KB con la dirección de rechazo `r` y las mediciones de rendimiento asociadas. Dicha dirección se aplica mediante el motor Strata, que tras cada capa seleccionada proyecta el residual stream sustrayendo la componente alineada con `r` (`h = h - (h · r) r`), consiguiendo un efecto equivalente a la edición de rango uno que huihui-ai horneó en 144 tensores del checkpoint abliterated, pero sin alterar los pesos.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 120B con capacidades de visión y decodificación especulativa MTP en una estación de trabajo con 48-64 GB de RAM y una GPU de 12 GB o más; por otro, demuestra una técnica de modificación de comportamiento en inferencia (control vectors con modo proyección) que evita redistribuir pesos modificados y mantiene la trazabilidad criptográfica respecto al checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP de decodificación especulativa; detalles internos del backbone no disponibles |
| Parámetros totales | 120.320 millones |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prompts de hasta 131K tokens) |
| Tipos de cuantización | Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (dos shards por tamaño; shard 2 es la tabla de n-gramas, idéntica en los cuatro tamaños) más proyector de visión `mmproj-Qwen3.8-Flash-Next-BF16.gguf` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal que procesa entradas de imagen y texto y genera texto. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; tampoco se especifica si emplea mezcla de expertos, atención lineal u otro esquema de eficiencia. Lo que sí se documenta es la presencia de una capa MTP (multi-token prediction) que se descarga aparte (unos 6 GB desde el checkpoint original de Qwen) y que Strata utiliza como borrador para decodificación especulativa.

La innovación técnica de esta publicación se sitúa en la capa de inferencia. ISTA-DASLab aplica GSQ (cuantización con escalado por grupo, paper arXiv:2604.18556) y RCO (paper arXiv:2605.00649) para comprimir el modelo hasta 2,40-3,50 bits por peso. Sobre esa base, este repositorio añade un control vector: la dirección `r` extraída del checkpoint de huihui-ai se aplica en modo `project` sobre el residual stream, capa a capa, en el rango configurado (4-44 o 1-47). La diferencia respecto a la edición estática es que Strata proyecta el stream completo, de modo que las contribuciones de embedding y n-gramas también pierden su componente en `r`, y la capa 0 no puede modificarse. Los pesos permanecen intactos y verificables por SHA256.

## Capacidades

- Generación de texto y razonamiento multirrespuesta a partir de entradas multimodales (imagen + texto), según el pipeline declarado `image-text-to-text`.
- Procesamiento de imágenes mediante el proyector de visión BF16 incluido en el repositorio.
- Decodificación especulativa con capa MTP, que acelera la generación en prompts largos.
- Modificación de comportamiento en tiempo de ejecución: la proyección del control vector reduce los rechazos sin reentrenar ni reescribir pesos.
- Compatibilidad con clientes OpenAI (`/v1`) y Anthropic (`/v1/messages`) a través del servidor de Strata.
- Soporte de prompts largos: se han medido velocidades de decodificación con contextos de 32K y hasta 131K tokens.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes multi-paso ni modo thinking explícito.

## Casos de uso

- Despliegue de un modelo de 120B en hardware de gama alta de consumo: con la cuantización IQ3_S (83,6 GB de descarga, 50 GB de expertos en RAM) y una GPU de 12 GB o más, se puede servir el modelo en una estación con 64 GB de RAM, algo inviable con los pesos BF16.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text y el proyector de visión permiten extraer y razonar sobre contenido de capturas, escaneos o diagramas en flujos de análisis documental.
- Investigación sobre alineación y rechazo: el par formado por los pesos originales y el vector `r` permite comparar el comportamiento del modelo con y sin proyección (`experimental_speed_projection: false` desactiva el efecto), útil para estudiar direcciones de rechazo de forma reproducible.
- Evaluación de cuantizaciones de muy baja precisión: los cuatro tamaños con métricas de KL respecto a BF16 (0,193 para IQ2_XS, 0,075 para IQ3_S) y porcentaje de coincidencia top-1 (88% y 93%) sirven para estudiar el compromiso entre calidad y velocidad en modelos de 120B.
- Servicio de inferencia local con API compatible: el servidor de Strata expone endpoints OpenAI y Anthropic, lo que permite integrar el modelo en herramientas existentes sin adaptadores adicionales.
- Prototipado de asistentes conversacionales de contexto largo: la decodificación a 87 tokens/s con IQ2_XS en prompts de 32K y la ventana medida hasta 131K lo hacen adecuado para resúmenes y análisis de conversaciones extensas.
- Experimentación con decodificación especulativa: la capa MTP descargada aparte permite medir el impacto del draft model en latencia y throughput sobre un modelo grande cuantizado.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones de la cuantización, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K no aparecen). Se reproducen a continuación:

| Métrica | Q2_0 | IQ2_XS | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Bits por peso | 2,40 | 2,50 | 3,00 | 3,50 |
| Descarga | 66,4 GB | 68,0 GB | 75,8 GB | 83,6 GB |
| Expertos en RAM | 34 GB | 35,5 GB | 43 GB | 50 GB |
| KL respecto a BF16 Huihui | no medido | 0,193 | no medido | 0,075 |
| Top-1 igual que BF16 | no medido | 88% | no medido | 93% |
| Decodificación con prompt de 32K | no medido | 87 tok/s | no medido | 59 tok/s |

Las mediciones se realizaron en una única RTX 3090. IQ2_XS decodifica entre un 45% y un 70% más rápido que IQ3_S en prompts de hasta 131K tokens. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- GPU NVIDIA o AMD con 12 GB de VRAM o más como mínimo para el motor Strata.
- RAM del sistema: 48 GB para Q2_0 e IQ2_XS; 64 GB para IQ3_XXS e IQ3_S, según la documentación de Strata.
- Almacenamiento: entre 66,4 GB y 83,6 GB según el tamaño, más unos 6 GB para la capa MTP y el proyector de visión BF16.
- Cabe en GPUs de consumo con 12 GB o más siempre que se acompañe de la RAM indicada; los pesos se reparten entre VRAM y memoria del sistema.
- Opciones de despliegue: Strata (recomendado, necesario para el modo de proyección del control vector); llama.cpp carga los GGUF pero su `--control-vector` estándar solo suma vectores, por lo que el efecto de eliminación de rechazos no se reproduce.
- Throughput medido en RTX 3090: 87 tok/s (IQ2_XS) y 59 tok/s (IQ3_S) con prompt de 32K tokens.
- No se dispone de estimaciones de latencia para otras GPU ni de cifras de throughput en A100 o H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-Flash-Next GSQ-RCO + Strata) | 120,3B | no disponible (medido hasta 131K) | GGUF 2,40-3,50 bpw | qwen-community-license-1.0 | Multimodal, MTP, control vector en inferencia |
| Qwen3.8-Flash-Next (BF16, Qwen) | 120,3B | no disponible | BF16 | qwen-community-license-1.0 | Referencia de calidad; requiere hardware muy superior |
| Huihui-Qwen3.8-Flash-Next-abliterated | 120,3B | no disponible | BF16 (edición de rango uno en 144 tensores) | no disponible | Rechazos eliminados en los pesos; sin cuantización de bajo bit documentada aquí |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 120,3B | no disponible | GGUF 2,40-3,50 bpw | no disponible | Misma cuantización sin el control vector ni las mediciones de este repo |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia qwen-community-license-1.0 impone condiciones específicas de uso comercial que deben revisarse antes de desplegar el modelo en producción; el campo `license: other` en Hugging Face remite al fichero LICENSE del repositorio.
- La eliminación de rechazos es un cambio deliberado de comportamiento: el modelo puede generar contenido que el checkpoint original rechazaría, con implicaciones legales y de seguridad según el contexto de uso.
- Las cuantizaciones de 2,40-3,50 bits degradan la calidad: IQ2_XS solo coincide con BF16 en el 88% de los tokens top-1 y presenta una KL de 0,193; IQ3_S mejora a 93% y 0,075, pero sigue siendo una aproximación.
- El autor no ha ejecutado el instalador de Strata de principio a fin; construyó el motor desde la fuente fijada y lo arrancó con los mismos argumentos, por lo que el flujo automatizado no está validado de extremo a extremo en su máquina.
- Q2_0 e IQ3_XXS no han sido medidos por el autor; sus cifras de RAM proceden de la documentación de Strata y sus métricas de calidad se desconocen.
- La capa 0 no puede modificarse con la proyección, y el modo `project` altera también las contribuciones de embedding y n-gramas, lo que introduce diferencias respecto a la edición estática de huihui-ai.
- En llama.cpp estándar el control vector no funciona como se espera (solo suma, no proyecta), de modo que el comportamiento abliterated no se reproduce fuera de Strata.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; estos extremos deben evaluarse empíricamente antes de un despliegue en producción.
- El repositorio tiene 208,4 GB de tamaño total y 635 descargas, con 0 likes en el momento de la consulta; es una publicación de terceros sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IloveAi333/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Repositorio base de cuantizaciones: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Motor Strata: https://github.com/Niko1221/Strata
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código RCO: https://github.com/IST-DASLab/RCO
- Cuantizaciones EXL3 del mismo modelo (mencionadas en la model card): https://huggingface.co/alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6
