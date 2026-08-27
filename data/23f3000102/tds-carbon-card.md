# 23f3000102/tds-carbon-card

## Resumen

Este repositorio, `23f3000102/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono asociada a un entrenamiento de un modelo dentro del programa TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante una fase de pre-entrenamiento, junto con el consumo energético y el hardware utilizado. Es un ejemplo de las prácticas de "IA verde" (Green AI) que buscan hacer transparente el impacto ambiental del entrenamiento de modelos.

La relevancia de este tipo de registros radica en que permiten a la comunidad evaluar el coste ecológico de los modelos y comparar la eficiencia energética entre diferentes configuraciones de hardware y regiones. En este caso, el entrenamiento se realizó en cuatro GPU NVIDIA L40S en la región `us-central1`, con un total de 217,5 horas de GPU y unas emisiones de 165,191 kg de CO₂eq. No se proporciona información sobre la arquitectura, los parámetros o el propósito del modelo entrenado, ya que el repositorio se centra exclusivamente en la métrica de sostenibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo cuyo entrenamiento se documenta. El repositorio únicamente reporta los siguientes datos de la fase de pre-entrenamiento:

- Hardware: 4 GPU NVIDIA L40S
- Modo de entrenamiento: pre-training
- Región: us-central1
- Horas de GPU: 217,5 h (con un PUE de 1,55)
- Energía total consumida: 471,975 kWh
- Emisiones de CO₂eq: 165,191 kg

Estos datos se generaron mediante la herramienta CodeCarbon, que estima las emisiones en función del hardware, la ubicación geográfica y el consumo eléctrico. No se detalla el dataset utilizado, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- No es un modelo de IA: no ofrece generación de texto, razonamiento, código, visión ni ninguna capacidad de inferencia.
- Su función es documental: sirve como registro de sostenibilidad para auditorías de emisiones de carbono en proyectos de entrenamiento de modelos.
- Permite comparar la huella ecológica de diferentes configuraciones de hardware y regiones geográficas.
- Incluye metadatos estructurados (`co2_eq_emissions`) que pueden ser procesados automáticamente por herramientas como carbontxt.org para agregar información de sostenibilidad.

## Casos de uso

- Auditoría interna de emisiones: una organización puede utilizar este tipo de tarjetas para cuantificar el impacto ambiental de sus experimentos de entrenamiento y reportarlo en sus memorias de sostenibilidad.
- Comparativa de eficiencia energética: investigadores pueden comparar las emisiones de este entrenamiento (165,191 kg CO₂eq en L40S) con otros similares (por ejemplo, el de `23f3000008/tds-carbon-card` con V100) para decidir qué hardware y región son más eficientes.
- Cumplimiento normativo: en un futuro con regulaciones sobre huella de carbono de IA, estos registros servirán como evidencia del coste energético de los modelos.
- Investigación en Green AI: los datos agregados de múltiples tarjetas permiten estudiar tendencias en el consumo energético del entrenamiento de modelos.
- Transparencia en publicaciones académicas: los autores pueden adjuntar esta tarjeta a sus papers para declarar el coste ambiental de sus experimentos.
- Optimización de infraestructura: los equipos de MLOps pueden usar estos datos para elegir regiones con menor factor de emisión o hardware más eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo entrenado, únicamente datos de consumo energético y emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 4 GPU NVIDIA L40S, cada una con 48 GB de VRAM.
- No se especifican requisitos de hardware para inferencia, ya que no se publica ningún modelo.
- El consumo energético total fue de 471,975 kWh durante 217,5 horas de GPU, con un PUE de 1,55.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay pesos ni modelo que servir.

## Comparativa con modelos similares

Existen otros repositorios de tarjetas de carbono en Hugging Face con el mismo propósito. A continuación se comparan dos de ellos:

| Repositorio | Hardware | Modo | Región | Horas GPU | Energía (kWh) | CO₂eq (kg) |
|---|---|---|---|---|---|---|
| `23f3000102/tds-carbon-card` | 4x NVIDIA L40S | pre-training | us-central1 | 217,5 | 471,975 | 165,191 |
| `23f3000008/tds-carbon-card` | 6x NVIDIA V100 | fine-tuning | asia-south1 | 424,1 | 931,324 | 605,36 |

La comparativa muestra que el entrenamiento con L40S en us-central1 fue más eficiente en emisiones por hora de GPU que el de V100 en asia-south1, aunque los modos de entrenamiento y los modelos subyacentes son diferentes, por lo que la comparación no es directa.

## Limitaciones y advertencias

- No contiene ningún modelo utilizable: es solo un registro de metadatos.
- La licencia no está especificada, por lo que su reutilización puede ser ambigua.
- Los datos de emisiones dependen del factor de emisión de la red eléctrica de la región y del PUE del centro de datos; pueden variar con el tiempo.
- No se indica el propósito del entrenamiento ni la arquitectura del modelo, lo que limita su utilidad para evaluar la eficiencia por parámetro o por tarea.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, al no tratarse de un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/23f3000102/tds-carbon-card
- Directorio de tarjetas de sostenibilidad de carbontxt: https://carbontxt.org/ai-model-cards
- Repositorio similar de otro participante: https://huggingface.co/23f3000008/tds-carbon-card
