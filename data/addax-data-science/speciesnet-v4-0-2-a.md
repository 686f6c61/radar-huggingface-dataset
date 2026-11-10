# Addax-Data-Science/SPECIESNET-v4-0-2-A

## Resumen

SPECIESNET-v4-0-2-A es un modelo de visión por computador para la clasificación automática de especies en imágenes de cámaras trampa (camera traps). No es un modelo de lenguaje: es un clasificador de imágenes desarrollado originalmente por Google dentro del proyecto Camera Trap AI y redistribuido en Hugging Face por Addax Data Science para facilitar su integración en la herramienta AddaxAI. El repositorio de Hugging Face actúa como espejo del modelo original publicado en Kaggle, con un tamaño de 0,2 GB.

El modelo resuelve un problema muy específico de la ecología y la conservación: procesar grandes volúmenes de imágenes capturadas por cámaras trampa en campo y asignar a cada una la especie animal detectada, además de filtrar imágenes vacías o con presencia humana. Esto sustituye o asiste la revisión manual, que es el cuello de botella habitual en estudios de biodiversidad con miles o millones de imágenes.

La relevancia actual radica en la creciente adopción de pipelines automatizados de monitorización de fauna y en la disponibilidad de un modelo con licencia permisiva (Apache 2.0) que puede integrarse en flujos de trabajo de investigación sin depender de servicios propietarios. La información pública disponible sobre arquitectura, parámetros y datos de entrenamiento es limitada en la model card proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión para clasificación de imágenes) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de clasificación de imágenes diseñado para el dominio de cámaras trampa, desarrollado por Google en el marco del proyecto Camera Trap AI. La model card no especifica el tipo de red (CNN, transformer visual u otra), el número de parámetros ni la composición exacta del conjunto de entrenamiento.

Los datos de entrenamiento citados en la model card provienen de conjuntos públicos de imágenes de cámaras trampa distribuidos a través de LILA BC, entre ellos Orinoquia Camera Traps (Velez et al.), Snapshot Serengeti (Swanson et al.) y Caltech Camera Traps (Beery et al.), todos bajo licencia CDLA-Permissive. No se detalla el número total de imágenes, la composición por especie ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional.

## Capacidades

- Clasificación de especies animales en imágenes de cámaras trampa.
- Detección y filtrado de imágenes vacías (sin fauna).
- Identificación de presencia humana en las capturas.
- Integración con el ecosistema AddaxAI para procesamiento por lotes.
- Uso como componente de pipelines de monitorización de biodiversidad.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código ni matemáticas.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplica a un modelo de visión).

## Casos de uso

- Monitorización de biodiversidad en reservas naturales: el modelo procesa lotes de imágenes de cámaras trampa y clasifica las especies detectadas, reduciendo la revisión manual de miles de capturas a una fracción del tiempo original.
- Estudios ecológicos de largo plazo: permite analizar series temporales de imágenes para estimar abundancia relativa y patrones de actividad de fauna, integrado en flujos de trabajo de investigación con AddaxAI.
- Gestión de fauna en parques nacionales: facilita la detección temprana de especies invasoras o en peligro mediante el filtrado automático de capturas.
- Filtrado previo de imágenes vacías: elimina automáticamente las capturas sin animales, que suelen ser la mayoría en despliegues de cámaras trampa, ahorrando almacenamiento y tiempo de anotación.
- Detección de presencia humana en zonas protegidas: identifica imágenes con personas para su revisión por parte de guardabosques o gestores.
- Docencia y formación en ecología: sirve como herramienta práctica para que estudiantes procesen sus propios conjuntos de imágenes sin necesidad de infraestructura propietaria, gracias a la licencia Apache 2.0.
- Integración en plataformas de ciencia ciudadana: permite preclasificar imágenes antes de que los voluntarios las validen, acelerando proyectos de crowdsourcing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB, por lo que el modelo es ligero y cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.).
- VRAM estimada para inferencia: no disponible con precisión, pero por el tamaño del repositorio debería ser inferior a 1 GB en FP32, y menor aún en FP16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: no se documentan en la model card; al ser un modelo de visión, no aplican frameworks como vLLM o llama.cpp. La integración documentada es a través de AddaxAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría (clasificación de especies en cámaras trampa).

## Limitaciones y advertencias

- La model card es una redistribución: el modelo original es de Google y Addax Data Science solo lo aloja para facilitar su integración. Los usuarios deben revisar la licencia original en el repositorio de Google Camera Trap AI.
- No se documentan sesgos específicos, pero al entrenarse con conjuntos geográficos concretos (Serengeti, Orinoquia, Caltech) puede tener un rendimiento desigual en especies o regiones no representadas en esos datos.
- Riesgo de falsos negativos y falsos positivos en especies poco frecuentes o visualmente similares; se recomienda validación humana en aplicaciones críticas.
- No se especifican limitaciones de idioma porque no es un modelo lingüístico.
- Licencia Apache 2.0 permite uso comercial, pero la atribución a los conjuntos de datos originales (CDLA-Permissive) debe mantenerse según los términos de la model card.
- No hay información sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez ante condiciones de iluminación, clima o ángulos no vistos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una redistribución reciente y poco validada por la comunidad.

## Enlaces

- [Hugging Face: Addax-Data-Science/SPECIESNET-v4-0-2-A](https://huggingface.co/Addax-Data-Science/SPECIESNET-v4-0-2-A)
- [AddaxAI](https://addaxdatascience.com/addaxai/)
- [Addax Data Science](https://addaxdatascience.com/)
- [Google Camera Trap AI (GitHub)](https://github.com/google/cameratrapai)
- [Especificaciones de SpeciesNet en Google Camera Trap AI](https://github.com/google/cameratrapai?tab=readme-ov-file#speciesnet)
- [Licencia original (Google Camera Trap AI)](https://github.com/google/cameratrapai/blob/main/LICENSE)
- [Citación (DOI)](https://doi.org/10.1049/cvi2.12318)
- [Repositorio en Kaggle](https://www.kaggle.com/models/google/speciesnet)
