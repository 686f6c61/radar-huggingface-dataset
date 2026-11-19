# msherry/pakflood-lora

## Resumen

PakFlood-LoRA es un adaptador LoRA de rango 32 sobre el codificador congelado de TerraMind-1.0-base (IBM y ESA), desarrollado por Muhammad Shahwar Uddin (NED University of Engineering & Technology) como proyecto de curso. El modelo resuelve una tarea de segmentación semántica geoespacial: clasificar cada píxel de 10 m de una pareja de imágenes Sentinel-1 (pre y post evento) como tierra seca, agua permanente o inundación. Se trata de un modelo de teledetección especializado, no de un modelo de lenguaje.

La relevancia técnica reside en que el adaptador LoRA entrena únicamente 5,7 M de pesos del codificador sobre un total de 101 M del modelo completo, y alcanza un IoU de inundación de 0,525 en el split de test oficial de GEOID-Flood, igualando el fine-tuning completo de los 101 M de pesos. Sobre los 15 teselas oficiales de Pakistán (activación EMSR838 de Copernicus, agosto de 2025) obtiene un IoU de 0,786.

El repositorio ocupa 0,3 GB y se distribuye con licencia CC BY 4.0. El modelo base es TerraMind v1 base, un modelo fundacional geoespacial multimodal de IBM y ESA, accedido a través de TerraTorch; el adaptador se implementa con Hugging Face PEFT y se acompaña de un decodificador UNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador TerraMind-1.0-base congelado + adaptador LoRA (rango 32) + decodificador UNet |
| Parámetros totales | 101 M (modelo completo base + adaptador); 5,7 M entrenados en el codificador vía LoRA |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión geoespacial, no aplica ventana de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de adaptación eficiente de parámetros: el codificador de TerraMind-1.0-base permanece congelado y se insertan adaptadores LoRA de rango 32 en el codificador, entrenando 5,7 M de pesos. Sobre las representaciones resultantes se aplica un decodificador UNet que produce la segmentación semántica por píxel en tres clases (tierra seca, agua permanente, inundación). La entrada es una pareja de imágenes Sentinel-1 (SAR) pre y post evento, lo que permite detectar cambios de superficie de agua independientemente de la cobertura nubosa.

El entrenamiento se realizó sobre GEOID-Flood v1.1 (Chiriaco et al., Fondazione LINKS, 2026, CC BY 4.0), un dataset construido a partir de activaciones del Copernicus Emergency Management Service. El split de test oficial consta de 2.417 teselas. El autor reporta comparaciones de ablación: codificador congelado sin adaptador (IoU 0,433), LoRA r16 (0,493) y LoRA r32 (0,525), este último igualando el fine-tuning completo. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a esta tarea).

## Capacidades

- Segmentación semántica de inundaciones a partir de pares de imágenes Sentinel-1 (SAR) pre y post evento, con resolución de 10 m por píxel.
- Clasificación en tres clases: tierra seca, agua permanente e inundación.
- Detección de cambios de superficie de agua independiente de nubosidad, al operar sobre radar de apertura sintética.
- Aplicable a teselas de cualquier activación de Copernicus EMS con cobertura Sentinel-1.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Mapeo operativo de inundaciones en Pakistán: el modelo se aplica a pares Sentinel-1 pre y post evento para generar mapas de extensión de inundación a 10 m, con un IoU de 0,786 validado sobre las 15 teselas oficiales de EMSR838 (agosto de 2025), lo que lo hace adecuado para respuesta rápida en emergencias.
- Evaluación de daños en agricultura: la clasificación por píxel permite estimar superficie de cultivo anegada comparando la máscara de inundación con capas catastrales o de uso del suelo, gracias a la resolución de 10 m.
- Monitorización de crecidas fluviales estacionales: al operar sobre SAR, el modelo funciona en episodios de lluvia intensa y cobertura nubosa donde los sensores ópticos fallan, permitiendo series temporales de extensión de agua.
- Validación de modelos de simulación hidrológica: las máscaras de inundación generadas sirven como referencia observacional para calibrar o validar salidas de modelos hidráulicos en cuencas con cobertura Sentinel-1.
- Investigación y docencia en teledetección: el adaptador LoRA de 5,7 M de pesos entrenables y el notebook de Colab permiten reproducir el pipeline completo con recursos modestos, útil para cursos y experimentos de PEFT sobre modelos fundacionales geoespaciales.
- Integración en pipelines de Copernicus EMS: el modelo puede desplegarse como paso de segmentación dentro de flujos de activación de emergencias, procesando teselas Sentinel-1 y produciendo mapas de inundación clasificados por clase de superficie.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| GEOID-Flood test oficial (2.417 teselas) | IoU de inundación | 0,525 |
| GEOID-Flood, codificador congelado sin adaptador | IoU de inundación | 0,433 |
| GEOID-Flood, LoRA r16 | IoU de inundación | 0,493 |
| GEOID-Flood, fine-tuning completo (101 M) | IoU de inundación | 0,525 |
| Pakistán EMSR838, agosto 2025 (15 teselas) | IoU de inundación | 0,786 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de segmentación geoespacial y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo de 0,3 GB y el adaptador de 5,7 M de pesos sugieren que la inferencia cabe holgadamente en GPUs de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponible; el modelo base TerraMind-1.0-base y el decodificador UNet son de tamaño moderado, pero no se especifican GPUs concretas.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del adaptador y del repo, aunque no se confirma en la información disponible.
- Opciones de despliegue: notebook de Google Colab (`PakFlood_LoRA_Colab_demo.ipynb`) con demo Gradio, o ejecución local con `pip install -r requirements.txt && python app.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros entrenados | Contexto / resolución | IoU inundación (GEOID-Flood) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PakFlood-LoRA (este) | 5,7 M (LoRA r32) | 10 m/píxel | 0,525 | CC BY 4.0 | Hugging Face |
| TerraMind-1.0-base con codificador congelado | 0 (sin adaptador) | 10 m/píxel | 0,433 | no disponible | Hugging Face (IBM/ESA) |
| TerraMind-1.0-base con fine-tuning completo | 101 M | 10 m/píxel | 0,525 | no disponible | Hugging Face (IBM/ESA) |
| TerraMind-1.0-base con LoRA r16 | no disponible (menor que r32) | 10 m/píxel | 0,493 | no disponible | Hugging Face (IBM/ESA) |

Las alternativas comparadas son variantes de adaptación del mismo modelo base; no se dispone de información sobre otros modelos de segmentación de inundaciones comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (segmentación de inundaciones con Sentinel-1); no es un modelo de propósito general ni de lenguaje.
- El rendimiento se ha validado principalmente en GEOID-Flood y en 15 teselas de Pakistán; la generalización a otras regiones, sensores o condiciones no está documentada.
- Riesgo de degradación en escenarios con geometrías de inundación, vegetación densa o zonas urbanas distintas a las del entrenamiento; no se reportan análisis de sesgo por región o tipo de terreno.
- El IoU de 0,525 en el test oficial es moderado; el modelo puede confundir agua permanente con inundación o producir falsos positivos en superficies húmedas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base TerraMind-1.0-base y del dataset GEOID-Flood, que pueden imponer restricciones adicionales.
- Proyecto de curso académico con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento continuado.
- No se documentan cuantizaciones ni requisitos de hardware, lo que dificulta planificar un despliegue a escala sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/msherry/pakflood-lora
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Dataset GEOID-Flood: https://huggingface.co/datasets/links-ads/geoid-flood
- Demo en Google Colab: https://colab.research.google.com/#fileId=https://huggingface.co/msherry/pakflood-lora/blob/main/PakFlood_LoRA_Colab_demo.ipynb
- TerraTorch (framework de acceso al modelo base): no disponible en la información proporcionada
- Paper de TerraMind (Jakubik et al., IBM y ESA, 2025): no disponible en la información proporcionada
- Paper de LoRA (Hu et al., 2022): no disponible en la información proporcionada
- Dataset GEOID-Flood v1.1 (Chiriaco et al., Fondazione LINKS, 2026): no disponible en la información proporcionada
