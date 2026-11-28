# mradermacher/Heliactis-3-7B-i1-GGUF

## Resumen

Heliactis-3-7B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo Heliactis-3-7B desarrollado por ApollonLabs. El modelo base es un transformer de tipo decoder-only orientado a conversación, con especial atención al griego (etiqueta `greek`) y al inglés, y etiquetado como `k2-horizon` y `lora-merged`, lo que sugiere un ajuste fino mediante fusión de adaptadores LoRA sobre una base previa. El repositorio lo mantiene mradermacher, un cuantizador independiente conocido por publicar versiones GGUF de modelos de terceros.

El interés de esta ficha reside en la disponibilidad de pesos cuantizados listos para inferencia local. El modelo base declara 8.999.178.240 parámetros reales (unos 9.000 millones, pese al "7B" del nombre), lo que lo sitúa en la franja de modelos de ~9B que caben en GPU de consumo con cuantizaciones de 4 bits. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Este repositorio no contiene el modelo original en safetensors, sino únicamente ficheros GGUF en múltiples niveles de cuantización (desde IQ1_S de 2,6 GB hasta Q6_K de 7,5 GB), además de un fichero imatrix para generar cuantizaciones propias. Es relevante para quienes necesitan ejecutar un modelo conversacional bilingüe griego-inglés en hardware modesto mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles); etiquetas del modelo base: k2-horizon, lora-merged |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | Griego (el) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multi-partes posibles); fichero imatrix incluido |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. La etiqueta `lora-merged` indica que Heliactis-3-7B se obtuvo fusionando adaptadores LoRA en los pesos de un modelo previo, y la etiqueta `k2-horizon` apunta a una familia o pipeline de entrenamiento concreto de ApollonLabs, sin más detalles públicos en esta ficha. El recuento real de parámetros (8.999.178.240) procede de los safetensors del modelo base, no del repositorio GGUF.

El repositorio que nos ocupa no entrena nada: aplica cuantización GGUF con matrices de importancia (imatrix), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. Se ofrece además el fichero imatrix por separado para que terceros puedan generar sus propias cuantizaciones. No hay información sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas de atención o decodificación.

## Capacidades

- Generación de texto conversacional multi-turno, con orientación declarada a diálogo.
- Soporte bilingüe griego-inglés (etiquetas `greek`, `el`, `en`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- Ejecutable en llama.cpp, Ollama y otros runners que acepten GGUF.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o visión: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional en griego: el modelo está etiquetado explícitamente para griego e inglés, por lo que puede emplearse en atención al usuario o chatbots en griego moderno sin depender de modelos multilingües genéricos de mayor tamaño.
- Despliegue en estaciones de trabajo sin GPU dedicada: con la cuantización Q4_K_M (5,7 GB) puede ejecutarse en CPU con llama.cpp en equipos con 8-16 GB de RAM, cubriendo tareas de generación de texto de baja concurrencia.
- Prototipado rápido en portátiles con GPU de consumo: la variante Q4_K_S (5,5 GB) cabe en GPUs de 8 GB de VRAM, permitiendo iterar sobre prompts y plantillas de chat localmente.
- Investigación sobre cuantización: el fichero imatrix y el rango completo de cuantizaciones (de IQ1 a Q6_K) permiten estudiar la degradación de calidad por nivel de bits, útil para trabajos empíricos sobre compresión de modelos.
- Aplicaciones de escritorio offline: al ser GGUF y Apache 2.0, puede integrarse en herramientas de escritorio que requieran funcionamiento sin conexión y sin restricciones de licencia comercial.
- Filtrado y generación de contenido en griego: clasificación o redacción de textos en griego en pipelines internos donde no se requiere un modelo de frontera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de fichero más overhead de contexto):
  - IQ1_S (2,6 GB) / IQ2_M (3,6 GB): cabe en GPUs de 4-6 GB.
  - IQ3_M (4,5 GB) / Q4_K_S (5,5 GB): cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070).
  - Q4_K_M (5,7 GB) / Q5_K_M (6,6 GB): requiere 8-10 GB; RTX 4070, RTX 3080.
  - Q6_K (7,5 GB): requiere 10-12 GB; RTX 4080, RTX 4090, A10.
- GPU recomendadas: RTX 4090 o A100/H100 para máxima comodidad y concurrencia; RTX 3060/4060 para uso individual con cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, desde una GTX 1660 de 6 GB con IQ2/IQ3 hasta una RTX 4090 con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier servidor compatible con GGUF; el modelo base es compatible con transformers (formato HF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heliactis-3-7B (este repo, GGUF) | ~9B | No disponible | Apache 2.0 | GGUF (i1/imatrix) | Bilingüe griego-inglés, orientado a conversación |
| Modelos ~7-9B genéricos en GGUF | ~7-9B | Variable | Variable | GGUF | No disponibles datos concretos de comparación en la información proporcionada |
| Alternativas bilingües griego-inglés | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El nombre "7B" no refleja el tamaño real: son ~9.000 millones de parámetros, lo que incrementa los requisitos de memoria respecto a un 7B convencional.
- Las cuantizaciones IQ1 e IQ2 (2,6-3,6 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate". No son recomendables para producción.
- El modelo base está ajustado con LoRA fusionado y orientado a griego e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad; debe validarse antes de uso en producción.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar condiciones de sus datos de entrenamiento no documentadas aquí.
- El repositorio GGUF es una conversión de terceros (mradermacher); la responsabilidad sobre el comportamiento del modelo recae en el modelo base de ApollonLabs.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Heliactis-3-7B-i1-GGUF
- Modelo base: https://huggingface.co/ApollonLabs/Heliactis-3-7B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Heliactis-3-7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Heliactis-3-7B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
