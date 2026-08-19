# luffyisthepirateking/tds-carbon-card

## Resumen

El repositorio `luffyisthepirateking/tds-carbon-card` no contiene un modelo de IA, sino una tarjeta de contabilidad de emisiones de carbono (Green AI Carbon Accounting) asociada a un entrenamiento de modelo realizado en el marco del curso TDS GA8. El autor, Ishaan Sawant (usuario `luffyisthepirateking`), documenta las emisiones de CO₂ equivalente, el consumo energético y las especificaciones de hardware de una ejecución de pre-entrenamiento.

Se trata de un artefacto de transparencia ambiental, alineado con las prácticas de "IA verde" que buscan cuantificar el impacto climático del entrenamiento de modelos. En lugar de pesos, arquitectura o capacidades de inferencia, este repositorio contiene metadatos de emisiones generados con la herramienta CodeCarbon. Su relevancia radica en ser un ejemplo de cómo documentar la huella de carbono de un entrenamiento, no en ofrecer un modelo desplegable.

No se dispone de arquitectura, parámetros, contexto, licencia ni idiomas, ya que no es un modelo en sí. Los datos técnicos disponibles se limitan al registro de hardware, energía y emisiones del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un registro de emisiones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos del entrenamiento documentado:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA RTX 4090 (8 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | asia-south1 |
| Horas de GPU | 363,8 h (PUE: 1,54) |
| Energia total | 2016,9072 kWh |
| Emisiones CO₂eq | 1310,99 kg |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se trata de un modelo con arquitectura propia, sino de un registro de la huella de carbono de un entrenamiento de pre-training. El autor utilizo la herramienta CodeCarbon para estimar las emisiones de CO₂ equivalente del proceso, ejecutado sobre 8 GPUs NVIDIA RTX 4090 en la region asia-south1. El factor de potencia de uso (PUE) declarado es 1,54, lo que indica la eficiencia del centro de datos. El total de energia consumida fue de 1216,9072 kWh y las emisiones resultantes, de 1310,99 kg CO₂eq. No se proporciona informacion sobre la arquitectura del modelo entrenado, el dataset, ni las tecnicas de optimizacion empleadas.

## Capacidades

- No es un modelo de IA: no ofrece generacion de texto, razonamiento, codigo, vision ni ninguna capacidad de inferencia.
- Funciona como documentacion de transparencia ambiental para un entrenamiento concreto.
- Permite auditar el impacto de carbono de un proceso de pre-training.
- Puede servir como plantilla para otros proyectos que deban reportar su huella de CO₂.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como registro verificable de emisiones de un entrenamiento, util para empresas que necesitan reportar su impacto ambiental ante reguladores o clientes.
- Investigacion academica sobre IA verde: puede usarse como referencia en estudios sobre el coste energetico de modelos de gran tamano.
- Transparencia corporativa: las organizaciones pueden replicar esta estructura para documentar el consumo de sus propios entrenamientos.
- Comparativa de eficiencia: permite contrastar el coste energetico de distintos hardware (por ejemplo, 8x RTX 4090 vs 4x RTX 4090 en el caso similar de Amrinder05).
- Formacion y divulgacion: ejemplo didactico para cursos de sostenibilidad en IA, mostrando como se calculan emisiones con CodeCarbon.
- Optimizacion de recursos: el registro de horas GPU y PUE ayuda a identificar ineficiencias en el uso de centros de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ya que el repositorio no contiene un modelo de IA evaluable.

## Requisitos de hardware

- El entrenamiento documentado utilizo 8 GPUs NVIDIA RTX 4090.
- No se especifica VRAM individual, pero una RTX 4090 dispone de 24 GB de memoria.
- No se indica si el modelo resultante (no incluido) seria desplegable en hardware de consumo.
- El PUE del centro de datos (1,54) es un dato relevante para el calculo de energia total.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) porque no existe un modelo que desplegar.

## Comparativa con modelos similares

Se ha encontrado un repositorio equivalente en la misma tarea de contabilidad de carbono:

| Parametro | tds-carbon-card (luffyisthepirateking) | tds-carbon-card (Amrinder05) |
|---|---|---|
| Hardware | 8x NVIDIA RTX 4090 | 4x NVIDIA RTX 4090 |
| Horas de GPU | 363,8 h | 95,4 h |
| PUE | 1,54 | 1,31 |
| Energia total | 2016,9072 kWh | 224,9532 kWh |
| Emisiones CO₂ | 1310,99 kg | 146,22 kg |
| Region | asia-south1 | asia-south1 |

Ambos son registros de emisiones de la misma asignatura (TDS GA8) y comparten el mismo esquema de datos, pero difieren en el numero de GPUs y el coste energetico. No hay otros modelos de IA comparables porque este repositorio no es un modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede usar para ninguna tarea de inferencia, generacion o analisis.
- La licencia no esta especificada, por lo que el uso comercial del contenido del repositorio no esta garantizado.
- La informacion de emisiones depende de la precision de las estimaciones de CodeCarbon y de los factores de emision de la region; puede no ser exacta.
- No se proporciona el dataset ni la arquitectura del modelo entrenado, por lo que no se puede replicar el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La fecha de creacion (agosto de 2026) sugiere que es un material muy reciente y sin revision externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/luffyisthepirateking/tds-carbon-card
- Perfil del autor: https://huggingface.co/luffyisthepirateking
- Repositorio similar de Amrinder05: https://huggingface.co/Amrinder05/tds-carbon-card
- Espacio TDS GA3 del autor: https://huggingface.co/spaces/luffyisthepirateking/tds-ga3
