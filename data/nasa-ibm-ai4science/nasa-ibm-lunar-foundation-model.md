# nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model

## Resumen

El NASA-IBM Lunar Foundation Model (NASA-IBM LFM) es un modelo fundacional multimodal y multirresolución para teledetección lunar, desarrollado conjuntamente por NASA e IBM Research dentro de la iniciativa AI4Science. Se trata de un encoder–decoder ViT-B entrenado desde cero sobre SomBench, un corpus de aproximadamente 2 millones de teselas lunares co-registradas que cubren 11 modalidades a dos escalas espaciales (LROC NAC a ~1 m/px y LROC WAC a ~100 m/px). El modelo adapta la receta de masked-token modeling de TerraMind al dominio lunar.

Su relevancia radica en dos extensiones técnicas sobre la receta original: la incorporación de la geometría de adquisición (ángulos de iluminación, anclajes en el marco solar y huella de la tesela) como contexto explícito en la secuencia de entrada, y el preentrenamiento conjunto de teselas NAC y WAC en un único bucle de batches mixtos a resolución nativa, de modo que un solo conjunto de pesos cubre ambas familias de resolución separadas por un factor de 100×.

El modelo está pensado como representación reutilizable: el encoder preentrenado se afina (fine-tuning completo o LoRA) para detección, segmentación y regresión densa sobre imágenes LROC y productos de terreno co-registrados. No es un producto generativo de grado científico ni mantiene un marco geodésico de referencia. La licencia es Apache-2.0 y el checkpoint se distribuye a través de TerraTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B (encoder) + decoder Transformer de 12 capas, misma anchura; tokenización por modalidad estilo TerraMind |
| Parametros totales | no disponible (encoder ViT-B: 768 dim, 12 capas, 12 cabezas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen 256 × 256 px con patch 16 × 16 en preentrenamiento; resultados con ps8) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; metadatos textualizados en formato clave-valor) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible explícitamente (checkpoint y configs en repositorio de 12,8 GB; librería terratorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TerraMind: un encoder ViT-B (768 dimensiones, 12 capas, 12 cabezas) y un decoder Transformer de 12 capas con la misma anchura, entrenados con un objetivo de masked-token modeling con entropía cruzada sobre vocabularios discretos de tokens en posiciones objetivo muestreadas. Cada una de las 9 modalidades densas tipo imagen cuenta con su propio tokenizador VQ-VAE con cuantización FSQ (niveles 8, 8, 8, 6, 5) y decoder DDPM. El patch embedding es FlexiViT, lo que permite afinar el checkpoint a otros tamaños de parche sin reentrenar el backbone. La tokenización por modalidad permite descartar o añadir modalidades en tiempo de fine-tuning.

El preentrenamiento se realizó desde cero sobre SomBench (963.609 bundles WAC y 1.000.113 bundles NAC, divididos geográficamente por zona LTM y LPS cap) durante 150.000 pasos en 16 GPU H100, con batch global de 1.536, LR pico de 1e-4 con decaimiento coseno, precisión bf16 y un coste aproximado de 1.100 GPU-hora. Las dos innovaciones destacables son la inyección de la geometría de adquisición como tokens de secuencia (8 campos de metadatos ópticos: incidencia, emisión, fase y azimut solares, coordenadas sub-solares y del centro de tesela, y GSD) y el preentrenamiento mixto NAC/WAC a resolución nativa. Los metadatos escalares se discretizan en bins (p. ej. 0,25° de longitud) y se serializan como texto clave-valor. No se menciona RLHF ni DPO, al no tratarse de un modelo de lenguaje.

## Capacidades

- Extracción de características visuales para teledetección lunar: pipeline `image-feature-extraction` sobre imágenes LROC WAC y NAC.
- Fine-tuning para detección (p. ej. cráteres), segmentación y regresión densa sobre imágenes y productos de terreno co-registrados.
- Procesamiento multimodal de 11 modalidades: reflectancia visible y ultravioleta, panchromático NAC, topografía, pendiente y aspecto (a 60 m y 3 m), más metadatos ópticos y contexto de mapas estáticos (28 campos: termofísica Diviner, productos LOLA, radar Mini-RF, mineralogía Kaguya, GRAIL, Lunar Prospector).
- Generación multimodal any-to-any como sonda cualitativa de la estructura cross-modal aprendida.
- Flexibilidad de parche (FlexiViT): afinamiento a tamaños de parche distintos de 16 sin reentrenar el backbone.
- Flexibilidad de modalidades: subconjuntos de modalidades distintos de los del preentrenamiento.
- Cobertura de dos familias de resolución (NAC ~1 m/px y WAC ~100 m/px) con un único conjunto de pesos.
- No dispone de tool calling, capacidades de agente ni generación de texto libre; no es un modelo de lenguaje.

## Casos de uso

- Detección automática de cráteres: el encoder se afina como cabecera de detección sobre teselas NAC a ~1 m/px, aprovechando que el preentrenamiento ya cubre esa resolución y que la geometría de iluminación se proporciona como contexto explícito, lo que reduce el confundido por sombras.
- Segmentación de unidades geológicas: fine-tuning sobre teselas WAC de 51,2 km con subconjuntos de modalidades (vis, uv, dtm, slope, aspect) para cartografía a escala regional.
- Regresión densa de propiedades del terreno: estimación de pendiente, rugosidad o abundancia de rocas a partir de la combinación de DTM, imágenes y contexto de mapas estáticos (Diviner, LOLA).
- Cartografía de iluminación y regiones en sombra permanente: uso de los campos PSR y AVG_ILLUM del contexto estático junto con la topografía para estudios de zonas polares, donde el modelo dispone de ~6.900 teselas polares por pista en el preentrenamiento.
- Análisis de prospectividad de hielo: regresión de mapas de prospectividad de hielo (superposición difusa basada en conocimiento), útil como herramienta exploratoria, no como medición de hielo.
- Preentrenamiento de representaciones para tareas downstream con pocas etiquetas: al ser un modelo fundacional, permite fine-tuning con datasets pequeños de instrumentos concretos, con la posibilidad de descartar modalidades no disponibles en el nuevo sensor.
- Exploración cualitativa de correlaciones cross-modales: la generación any-to-any permite inspeccionar qué estructura comparte el modelo entre imagen, topografía y metadatos, útil en investigación metodológica.
- Adaptación a nuevos productos de sensores: la tokenización por modalidad y FlexiViT permiten reutilizar el backbone con parches y modalidades distintos de los de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv 2609.13283) para el método completo, las ablaciones y los resultados por baseline, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- El preentrenamiento se realizó en 16 GPU H100 (~1.100 GPU-hora); no se especifican requisitos de inferencia.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,8 GB e incluye backbone más tokenizadores; el backbone ViT-B es de tamaño moderado y probablemente quepa en GPU de consumo, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Por el tamaño del encoder, es razonable esperar que funcione en RTX 4090 o superiores, pero no está confirmado en la información disponible.
- Despliegue: la librería oficial es TerraTorch (`terratorch`); el pipeline es `image-feature-extraction`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NASA-IBM LFM | ViT-B (768 dim, 12 capas) | 256 × 256 px, patch 16 (FlexiViT) | 11 (imagen + metadatos + mapas estáticos) | Apache-2.0 | Hugging Face, TerraTorch |
| TerraMind | no disponible en la información | no disponible | multimodal terrestre (receta base adaptada) | no disponible | Hugging Face |
| Otros modelos lunares | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar cualitativamente con TerraMind, del que el LFM adapta la receta de masked-token modeling. No se dispone de datos de parámetros, contexto ni rendimiento de alternativas lunares para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un producto generativo de grado científico: los campos generados no son predicciones calibradas y no sustituyen a instrumentos, fotogrametría estéreo ni soluciones geodésicas.
- No mantiene un marco geodésico de referencia: recupera estructura local pero no valores absolutos (la forma del DTM es correcta con un desfase de elevación; las coordenadas generadas pueden desviarse decenas de grados).
- No validado para decisiones operativas como certificación de sitios de aterrizaje o despeje de peligros.
- Los resultados de prospectividad de hielo regresan un mapa de prospectividad difuso basado en conocimiento, no hielo medido.
- No evaluado fuera de la Luna ni sobre productos ausentes de SomBench.
- Riesgo de alucinación en la generación multimodal: las salidas generadas pueden ser plausibles pero incorrectas, especialmente en valores absolutos.
- Sesgos: la cobertura de los mapas estáticos varía por instrumento (desde casi global hasta solo polar), lo que puede introducir sesgos geográficos en el aprendizaje.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni validación operativa.
- Idiomas: no aplica como modelo de lenguaje; los metadatos se serializan en formato clave-valor en inglés técnico.
- No dispone de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model
- Dataset SomBench: https://huggingface.co/datasets/nasa-ibm-ai4science/Sombench-pretraining-data
- Paper del método: https://arxiv.org/pdf/2609.13283
- Paper de TerraMind: https://arxiv.org/abs/2504.11171
- TerraTorch (repositorio): https://github.com/IBM/terratorch
- DOI: https://doi.org/10.57967/hf/11094
