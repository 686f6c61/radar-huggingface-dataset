# AathiMadhav/tds-carbon-card

## Resumen

Este repositorio, `AathiMadhav/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning de un modelo no especificado. Forma parte de una asignación académica (TDS GA8) que documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento. El autor, AathiMadhav, publica los datos de consumo energético y emisiones calculados con la herramienta CodeCarbon, junto con las especificaciones de hardware y región.

El repositorio es relevante en el contexto de la sostenibilidad en IA, ya que permite auditar el impacto ambiental de un entrenamiento concreto. No se proporciona información sobre la arquitectura, los parámetros, el contexto o las capacidades del modelo subyacente, por lo que esta ficha se limita a describir el contenido del repositorio y sus datos de emisiones. No es un modelo utilizable para inferencia ni para desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales del registro de entrenamiento:

| Parametro | Valor |
|---|---|
| Hardware | 6x NVIDIA RTX 4090 |
| Modo de entrenamiento | fine-tuning |
| Region | us-central1 |
| Horas de GPU | 170,4 h (PUE: 1,52) |
| Energia total | 699,3216 kWh |
| Emisiones de CO₂ | 244,763 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo en la informacion disponible. El repositorio documenta únicamente el proceso de fine-tuning: se utilizaron 6 GPUs NVIDIA RTX 4090 durante 170,4 horas en la region us-central1, con un factor de eficiencia energetica (PUE) de 1,52. La energia total consumida fue de 699,3216 kWh, lo que resulto en 244,763 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon. No se especifican los datos de entrenamiento, el tipo de modelo original ni las tecnicas de optimizacion empleadas.

## Capacidades

No aplica. Este repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo, vision o cualquier otra funcion. Se trata exclusivamente de un registro de sostenibilidad y contabilidad de carbono.

## Casos de uso

- Auditoria de sostenibilidad: el repositorio sirve como evidencia del impacto ambiental de un entrenamiento concreto, utilizable en informes de responsabilidad corporativa o academicos.
- Comparacion de eficiencia energetica: permite contrastar el consumo de diferentes configuraciones de hardware y regiones (por ejemplo, us-central1 frente a otras zonas) para optimizar futuros entrenamientos.
- Cumplimiento normativo: en contextos donde se exija la divulgacion de emisiones de IA, este tipo de registro puede integrarse en documentos como carbon.txt o informes de sostenibilidad.
- Educacion y concienciacion: como caso practico para ensenar a estudiantes y desarrolladores como medir y reportar la huella de carbono de sus propios modelos.
- Investigacion en Green AI: los datos de emisiones pueden alimentar estudios sobre el coste ambiental de diferentes estrategias de fine-tuning.
- Trazabilidad de experimentos: al vincular un identificador de repositorio con un entrenamiento especifico, se facilita la reproducibilidad y la transparencia en proyectos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo, ya que no se trata de un modelo de IA.

## Requisitos de hardware

- El entrenamiento documentado utilizo 6 GPUs NVIDIA RTX 4090, cada una con 24 GB de VRAM, lo que suma 144 GB de VRAM total.
- No se especifican requisitos de hardware para inferencia, ya que no se proporciona ningun modelo.
- Para reproducir el entrenamiento se necesitaria un entorno con al menos 6 GPUs RTX 4090 o equivalente, junto con un sistema de refrigeracion y alimentacion adecuado.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo que desplegar.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

Existen otros repositorios con el mismo proposito y contenido practicamente identico, todos parte de la misma asignacion TDS GA8:

| Repositorio | Autor | Emisiones CO₂ (kg) | Hardware | Region |
|---|---|---|---|---|
| AathiMadhav/tds-carbon-card | AathiMadhav | 244,763 | 6x RTX 4090 | us-central1 |
| ayeshaalvi/tds-carbon-card | ayeshaalvi | no disponible | no disponible | no disponible |
| shivainlabs/tds-carbon-card | shivainlabs | no disponible | no disponible | no disponible |

Los tres repositorios comparten la misma plantilla de model card y el mismo objetivo de documentar la huella de carbono de un entrenamiento. No se dispone de datos completos de los otros dos para una comparacion detallada.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA; no es utilizable para inferencia, generacion de texto, codigo ni ninguna otra tarea.
- No se proporciona informacion sobre el modelo original que fue fine-tuneado, por lo que no se puede evaluar su calidad, sesgos o alucinaciones.
- La licencia no esta especificada, por lo que el uso del contenido del repositorio (datos de emisiones) puede estar sujeto a restricciones no declaradas.
- Los datos de emisiones dependen de la metodologia de CodeCarbon y de los factores de emision de la region us-central1; pueden no ser directamente comparables con mediciones de otras herramientas o regiones.
- No se incluyen datos de entrenamiento, hiperparametros ni configuracion del modelo, lo que limita la reproducibilidad del proceso de fine-tuning.
- Para uso en produccion o investigacion seria, se recomienda contactar al autor para obtener informacion adicional sobre el modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AathiMadhav/tds-carbon-card
- Repositorio similar (ayeshaalvi): https://huggingface.co/ayeshaalvi/tds-carbon-card
- Repositorio similar (shivainlabs): https://huggingface.co/shivainlabs/tds-carbon-card
- Articulo sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Repositorio CARD (no relacionado directamente, pero aparece en la busqueda): https://github.com/bytedance/CARD/blob/main/
- Articulo sobre impacto de IA en emisiones: https://medium.com/data-science/how-to-assess-the-impact-of-ai-on-carbon-emissions-and-possible-mitigations-for-sartups-7e31bcd12a09
