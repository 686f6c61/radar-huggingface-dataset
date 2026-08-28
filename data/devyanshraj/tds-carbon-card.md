# devyanshraj/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco del curso TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante el entrenamiento de un modelo no especificado. La información disponible se limita a métricas de sostenibilidad: 589,311 kg de CO₂eq emitidos, 906,633 kWh de energía total consumida y 175,5 horas de GPU en la región `asia-south1` con hardware NVIDIA H100.

La relevancia de este tipo de repositorios radica en la creciente demanda de transparencia ambiental en el ciclo de vida de los modelos de IA. Aunque no aporta especificaciones técnicas del modelo entrenado, sirve como ejemplo de buenas prácticas para el registro de huella de carbono en proyectos de machine learning. No se dispone de información sobre arquitectura, parámetros, contexto o capacidades, por lo que esta ficha se limita a documentar los datos disponibles y a señalar las ausencias.

## Especificaciones tecnicas

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

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo subyacente. El repositorio documenta únicamente el proceso de fine-tuning, indicando el uso de 6 GPUs NVIDIA H100 durante 175,5 horas, con un factor de eficiencia energetica (PUE) de 1,23. El consumo total de energia fue de 906,633 kWh y las emisiones de CO₂ equivalente alcanzaron 589,311 kg, calculadas con la herramienta CodeCarbon. No se especifican datos de entrenamiento, tecnicas de optimizacion ni innovaciones arquitectonicas.

## Capacidades

- No se dispone de informacion sobre capacidades del modelo.
- El repositorio no incluye demos, ejemplos de uso ni documentacion funcional.
- No se indica soporte para generacion de texto, codigo, vision, tool calling ni agentes.
- No se mencionan capacidades multilingues ni modos especiales de razonamiento.

## Casos de uso

- Auditoria ambiental de entrenamientos de IA: el repositorio puede servir como plantilla para registrar emisiones de CO₂ en proyectos de machine learning, siguiendo la metodologia de CodeCarbon.
- Reportes de sostenibilidad corporativa: los datos de emisiones y consumo energetico pueden integrarse en informes de responsabilidad ambiental de organizaciones que entrenan modelos.
- Comparativa de eficiencia energetica entre configuraciones de hardware: los valores de GPU horas, PUE y emisiones permiten evaluar el coste ambiental de diferentes entornos de entrenamiento.
- Investigacion en Green AI: el registro aporta datos empiricos para estudios sobre el impacto climatico del fine-tuning en GPUs de alta gama.
- Optimizacion de infraestructura: conocer el consumo energetico por hora de GPU ayuda a planificar presupuestos de energia y a seleccionar regiones con menor intensidad de carbono.
- Educacion y formacion: el repositorio puede utilizarse como ejemplo didactico en cursos sobre IA sostenible y contabilidad de carbono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento del modelo entrenado, solo datos de consumo y emisiones.

## Requisitos de hardware

- Hardware utilizado en el entrenamiento: 6 GPUs NVIDIA H100.
- Region de computo: `asia-south1` (Google Cloud).
- Consumo energetico total: 906,633 kWh.
- Emisiones de CO₂eq: 589,311 kg.
- No se proporcionan requisitos de hardware para inferencia, ya que no se describe el modelo resultante.
- No se indican opciones de despliegue ni latencias.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existen modelos comparables en la misma categoria. Los repositorios `pranhai/tds-carbon-card` y `shivainlabs/tds-carbon-card` encontrados en la busqueda web parecen ser variantes del mismo ejercicio de contabilidad de carbono, pero no se dispone de sus datos detallados para establecer una comparacion.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable; es un registro de metadatos de entrenamiento.
- No se especifica que modelo fue fine-tuneado, por lo que los datos de emisiones no pueden asociarse a una arquitectura concreta.
- La licencia no esta indicada, lo que impide conocer las restricciones de uso del contenido.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, al no existir un modelo funcional.
- Para uso en produccion, este repositorio no ofrece ninguna utilidad directa; su valor es exclusivamente documental y metodologico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/devyanshraj/tds-carbon-card
- Repositorios similares encontrados en la busqueda web:
  - https://huggingface.co/pranhai/tds-carbon-card
  - https://huggingface.co/shivainlabs/tds-carbon-card
