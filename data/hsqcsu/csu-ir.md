# Hsqcsu/CSU-IR

## Resumen

CSU-IR es un framework de aprendizaje profundo desarrollado por Shuqing Huang (usuario Hsqcsu) para la recuperación interpretable de estructuras moleculares a partir de espectros infrarrojos (IR). El modelo, presentado en el artículo "Scaling infrared spectral retrieval to 100 million compounds with interpretable deep learning", unifica representaciones de espectros IR y estructuras moleculares para permitir la identificación de compuestos desconocidos a una escala de hasta 100 millones de compuestos. Su relevancia radica en que combina una alta precisión en la detección de grupos funcionales con una interpretabilidad explícita, algo poco común en sistemas de recuperación espectral.

El repositorio de HuggingFace contiene principalmente los pesos del modelo y materiales de soporte asociados al artículo, con un tamaño total de 62,5 GB. No se trata de un modelo de lenguaje, sino de un sistema especializado en química computacional y espectroscopia. La licencia es MIT, lo que permite uso comercial y modificación, aunque la documentación disponible es limitada y se centra en el código y los pesos, no en una API de inferencia estandarizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda (arquitectura específica no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene archivos de pesos, formato sin especificar) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna de CSU-IR. Según el repositorio de GitHub, se trata de un framework de aprendizaje profundo que aprende correspondencias entre espectros infrarrojos y estructuras moleculares. El entrenamiento se realiza con datos de espectros y estructuras, pero no se especifican el número de tokens (no aplica), la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal destacada es la interpretabilidad: el modelo fundamenta sus predicciones en propiedades químicas y en correspondencias específicas entre señales espectrales y fragmentos estructurales, lo que permite a los usuarios entender por qué se asigna una determinada estructura a un espectro.

Se menciona que el modelo es capaz de detectar 48 grupos funcionales con una precisión media (recall@1) del 93,80%, lo que sugiere un entrenamiento supervisado con anotaciones de grupos funcionales. Sin embargo, no se proporcionan detalles sobre el volumen de datos de entrenamiento ni sobre el proceso de optimización.

## Capacidades

- Recuperación de estructuras moleculares a partir de espectros IR: dado un espectro de entrada, el modelo devuelve la estructura química más probable entre un espacio de búsqueda de hasta 100 millones de compuestos.
- Detección de grupos funcionales: identifica hasta 48 grupos funcionales distintos con una precisión media (recall@1) del 93,80%.
- Interpretabilidad multi-perspectiva: las predicciones se basan en propiedades químicas y correspondencias espectral-estructurales explícitas, lo que facilita la validación por parte de expertos.
- Escalabilidad: diseñado para funcionar con bases de datos de decenas de millones de compuestos, superando los límites de los métodos tradicionales de búsqueda espectral.
- No incluye capacidades de generación de texto, razonamiento lingüístico, visión general ni tool calling, al ser un modelo especializado en dominio químico.

## Casos de uso

- Identificación de compuestos desconocidos en química analítica: un laboratorio que obtiene un espectro IR de una muestra desconocida puede usar CSU-IR para recuperar la estructura molecular más probable, acelerando el proceso de caracterización.
- Control de calidad en industria farmacéutica: verificación de la identidad y pureza de principios activos comparando espectros IR de lotes de producción contra una base de datos de compuestos de referencia.
- Detección de adulterantes en alimentos y bebidas: análisis rápido de espectros IR para identificar sustancias no declaradas, gracias a la capacidad de recuperación sobre grandes bases de datos.
- Investigación en química computacional: generación de hipótesis estructurales a partir de datos espectrales experimentales, apoyando el descubrimiento de nuevos compuestos.
- Construcción de bases de datos espectrales: el modelo puede servir como motor de búsqueda para indexar y consultar grandes colecciones de espectros IR con sus estructuras asociadas.
- Docencia y formación en espectroscopia: los estudiantes pueden explorar la relación entre grupos funcionales y bandas de absorción mediante las salidas interpretables del modelo.

## Benchmarks y rendimiento

Los datos publicados se limitan a la métrica de detección de grupos funcionales:

| Métrica | Valor |
|---|---|
| Recall@1 medio en detección de grupos funcionales (48 grupos) | 93,80% |

No se han publicado resultados comparativos con otros métodos de recuperación espectral en la información disponible. Tampoco se ofrecen cifras de rendimiento en términos de velocidad de inferencia o uso de memoria.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware para CSU-IR.
- El tamaño del repositorio (62,5 GB) sugiere que los pesos del modelo son voluminosos, lo que probablemente requiera una GPU con al menos 16-24 GB de VRAM para cargar el modelo completo en memoria (estimación razonable basada en el peso de los archivos, no confirmada).
- No se mencionan opciones de despliegue específicas como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Es probable que el código de inferencia se ejecute con PyTorch u otro framework estándar, pero no se detalla en las fuentes consultadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (recuperación espectral IR interpretable a gran escala). Los métodos tradicionales de búsqueda espectral (como bibliotecas espectrales tipo NIST) no son directamente comparables por su naturaleza no basada en aprendizaje profundo. Por tanto, no es posible ofrecer una comparativa cuantitativa en este momento.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en espectroscopia infrarroja; no es aplicable a otros tipos de espectroscopia (UV-Vis, RMN, masas) sin adaptación.
- La interpretabilidad, aunque destacada, depende de la calidad de las anotaciones de grupos funcionales en el entrenamiento; errores en esas anotaciones podrían propagarse a las predicciones.
- No se han publicado análisis de sesgos o casos límite (por ejemplo, compuestos con grupos funcionales inusuales o espectros ruidosos).
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento (si se distribuyen) cumplen con las normativas aplicables.
- No se proporciona una API de inferencia lista para usar; el usuario debe implementar el flujo de preprocesamiento y postprocesamiento a partir del código del repositorio.
- La documentación es escasa, lo que puede dificultar la reproducción exacta de los resultados del artículo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hsqcsu/CSU-IR
- Repositorio oficial en GitHub: https://github.com/Hsqcsu/CSU-IR
- Notebook de prueba en Google Colab: https://colab.research.google.com/github/Hsqcsu/CSU-IR/blob/main/colab/test_CSU_IR_in_colab.ipynb
- Perfil del autor en HuggingFace: https://huggingface.co/Hsqcsu
