# RohitRRS/tds-carbon-card

## Resumen

Este repositorio, `RohitRRS/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de modelo realizado en el contexto del curso TDS GA8. El autor, RohitRRS, documenta las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento en una GPU NVIDIA L40S, con un total de 13,72 kg de CO₂eq y un consumo energético de 32,6655 kWh. La iniciativa se enmarca en las prácticas de "Green AI" promovidas por Hugging Face para normalizar la divulgación del impacto ambiental de los modelos.

Aunque el repositorio no ofrece pesos, arquitectura ni capacidades de inferencia, su relevancia radica en ejemplificar cómo se puede reportar la huella de carbono de un entrenamiento siguiendo el estándar de model cards de Hugging Face. Existen repositorios idénticos de otros usuarios (RanaShriii, Hrishi-iitm), lo que sugiere que se trata de una tarea académica repetida. Para un desarrollador o investigador, este artefacto no es un modelo utilizable, sino una plantilla de documentación ambiental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

Datos de emisiones registrados en la model card:

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | NVIDIA L40S (1 GPU) |
| Modo de entrenamiento | pre-training |
| Region | us-east1 |
| Horas de GPU | 76,5 h (PUE: 1,22) |
| Energia total | 32,6655 kWh |
| Emisiones de CO₂ | 13,72 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se proporciona ninguna arquitectura de modelo, ya que el repositorio no contiene un modelo. La unica informacion de entrenamiento es la especificacion de hardware y el modo (pre-training), sin detalles sobre el dataset, el numero de tokens ni el tipo de red neuronal. La medicion de emisiones se realizo con CodeCarbon, una libreria estandar para estimar el consumo energetico y las emisiones de carbono en entornos de computo. No hay innovaciones tecnicas que destacar, pues el proposito del repositorio es puramente documental.

## Capacidades

- Ninguna capacidad de IA: no genera texto, no procesa imagenes, no ejecuta razonamiento ni codigo.
- Funciona como un registro de sostenibilidad: permite auditar el coste ambiental de un entrenamiento concreto.
- Compatible con el formato de model cards de Hugging Face, lo que facilita su integracion en pipelines de reporte automatico.
- No soporta tool calling, agentes ni multilingueismo.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para que equipos de desarrollo documenten las emisiones de sus entrenamientos, cumpliendo con politicas internas de reduccion de huella de carbono.
- Educacion y formacion en Green AI: en cursos como TDS GA8, los estudiantes aprenden a medir y reportar el impacto ambiental de sus experimentos, usando este tipo de tarjetas como ejercicio practico.
- Comparativa de eficiencia energetica entre configuraciones de hardware: al registrar horas de GPU y consumo, se pueden comparar diferentes entornos de entrenamiento (por ejemplo, L40S frente a A100) para elegir el mas eficiente.
- Cumplimiento normativo y reportes ESG: empresas que necesitan declarar sus emisiones de alcance 2 pueden usar estos datos para sus informes de responsabilidad social corporativa.
- Optimizacion de presupuestos de computo: conocer el coste energetico por experimento ayuda a planificar recursos y a decidir si merece la pena un entrenamiento adicional.
- Reproducibilidad de experimentos: aunque no hay modelo, la documentacion de hardware y energia permite replicar las condiciones de entrenamiento en futuros estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo, no hay metricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El hardware utilizado para el entrenamiento registrado fue una NVIDIA L40S (1 GPU), con 76,5 horas de uso.
- No se especifican requisitos de VRAM ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Para reproducir el registro de emisiones, se necesita un entorno con CodeCarbon instalado y acceso a una GPU similar.

## Comparativa con modelos similares

No existe un modelo comparable, pues este repositorio no es un modelo de IA. Los unicos artefactos similares son otros repositorios de la misma tarea academica:

| Repositorio | Autor | Contenido |
|---|---|---|
| RohitRRS/tds-carbon-card | RohitRRS | Registro de emisiones (13,72 kg CO₂eq) |
| RanaShriii/tds-carbon-card | RanaShriii | Registro de emisiones (misma plantilla) |
| Hrishi-iitm/tds-carbon-card | Hrishi-iitm | Registro de emisiones (misma plantilla) |

No hay diferencias funcionales entre ellos; todos documentan la huella de carbono de un entrenamiento sin proporcionar un modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje, vision o generacion.
- La informacion de emisiones es especifica del entrenamiento realizado y no es extrapolable a otros modelos o configuraciones.
- No se indica la licencia, por lo que el uso del contenido del repositorio puede estar sujeto a restricciones no declaradas.
- Los datos de emisiones dependen de la region (us-east1) y del factor de emision de la red electrica local; no son validos para otras ubicaciones.
- Al ser un ejercicio academico, la exactitud de las mediciones puede no cumplir estandares de auditoria externa.
- No hay garantia de que el repositorio se mantenga actualizado o reciba soporte.

## Enlaces

- Repositorio original: https://huggingface.co/RohitRRS/tds-carbon-card
- Repositorio similar (RanaShriii): https://huggingface.co/RanaShriii/tds-carbon-card
- Repositorio similar (Hrishi-iitm): https://huggingface.co/Hrishi-iitm/tds-carbon-card
- Guia de Hugging Face sobre emisiones de carbono en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
