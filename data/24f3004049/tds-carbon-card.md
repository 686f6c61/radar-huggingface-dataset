# 24f3004049/tds-carbon-card

## Resumen

Este repositorio, `24f3004049/tds-carbon-card`, no contiene un modelo de inteligencia artificial al uso, sino una tarjeta de documentación de huella de carbono asociada a una ejecución de entrenamiento dentro de la asignatura TDS GA8. El autor, identificado como `24f3004049`, ha publicado únicamente los metadatos de emisiones de CO₂ equivalentes generadas durante un proceso de pre-entrenamiento, utilizando la herramienta CodeCarbon para el cálculo. No se incluyen pesos, arquitectura ni código de inferencia.

La relevancia de este tipo de repositorios radica en la creciente preocupación por la sostenibilidad en el entrenamiento de modelos de IA. Documentar las emisiones de forma estandarizada permite comparar el coste ambiental de diferentes configuraciones de hardware y regiones. En este caso concreto, se registra un consumo energético de 88,76 kWh y unas emisiones de 57,70 kg de CO₂eq, empleando 7 GPUs NVIDIA T4 en la región `asia-south1`. No se proporciona información sobre el modelo entrenado, su arquitectura, tamaño o propósito, por lo que esta ficha se limita a describir los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales extraídos de la model card:

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 7x NVIDIA T4 |
| Modo de entrenamiento | pre-training |
| Region de computo | asia-south1 |
| Horas de GPU | 163,2 h (PUE: 1,11) |
| Energia total consumida | 88,7645 kWh |
| Emisiones de CO₂eq | 57,697 kg |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (si es transformer, MoE, SSM, etc.) ni sobre el dataset utilizado, el numero de tokens o cualquier tecnica de optimizacion. La unica informacion relativa al entrenamiento es que se realizo en modo `pre-training` sobre 7 GPUs NVIDIA T4, en la region `asia-south1`, con un total de 163,2 horas de GPU y un factor de eficiencia energetica (PUE) de 1,11. El consumo total de energia fue de 88,7645 kWh, lo que se tradujo en 57,697 kg de CO₂ equivalente, calculados mediante CodeCarbon. No se menciona el uso de RLHF, DPO ni ninguna otra innovacion tecnica.

## Capacidades

- No se documenta ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, vision, etc.).
- No se indica soporte para tool calling, agentes, razonamiento multi-paso o capacidades multilingues.
- El unico dato de capacidad es la medicion de emisiones, que no es una capacidad del modelo sino un registro ambiental.

## Casos de uso

Dado que no existe un modelo subyacente, no se pueden proponer casos de uso practicos de inferencia. Los unicos escenarios aplicables son:

- Auditoria de sostenibilidad: el repositorio sirve como registro verificable de las emisiones de CO₂ de una ejecucion de entrenamiento concreta, util para informes de responsabilidad ambiental corporativa o academica.
- Comparativa de eficiencia energetica: permite contrastar el coste ambiental de entrenar con hardware T4 en la region `asia-south1` frente a otras configuraciones documentadas en repositorios similares.
- Educacion en Green AI: puede utilizarse como ejemplo en cursos sobre computacion sostenible para ilustrar como se mide y reporta la huella de carbono de un entrenamiento.
- Trazabilidad de experimentos: si se vinculara con el modelo real, permitiria asociar un coste ambiental a una version concreta de un sistema de IA.
- Optimizacion de recursos: los datos de PUE y horas de GPU pueden orientar decisiones sobre que region o tipo de hardware elegir para reducir emisiones en futuros entrenamientos.
- Cumplimiento normativo: en contextos donde se exija reportar el impacto ambiental de sistemas de IA, este tipo de tarjetas proporciona la informacion necesaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe ningun dato de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros sistemas.

## Requisitos de hardware

- No se especifican requisitos de inferencia, ya que no hay modelo desplegable.
- El entrenamiento documentado utilizo 7 GPUs NVIDIA T4, cada una con 16 GB de VRAM, lo que sugiere un total de 112 GB de memoria GPU.
- No se proporcionan datos de latencia ni throughput.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo de IA comparable con otros. Existen otros repositorios con el mismo nombre `tds-carbon-card` (por ejemplo, `Domain-expansion/tds-carbon-card` o `jayiitm/tds-carbon-card`) que documentan entrenamientos con hardware diferente (H100, etc.), pero no son modelos sino registros de emisiones. No se puede establecer una comparativa de rendimiento ni de capacidades.

## Limitaciones y advertencias

- No hay modelo disponible: el repositorio no contiene pesos, tokenizador ni codigo de inferencia, por lo que no puede utilizarse para ninguna tarea de IA.
- Los datos de emisiones corresponden a una ejecucion especifica y no son extrapolables a otros entrenamientos con el mismo hardware o region.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido es reutilizable o tiene restricciones de uso comercial.
- No se indica el idioma ni el dominio de aplicacion del supuesto modelo, lo que impide cualquier evaluacion de sesgos o alucinaciones.
- La informacion de la model card es minima y no sigue los estandares habituales de documentacion de modelos (datasets, metricas, limitaciones eticas, etc.).
- Para produccion, este repositorio no aporta ninguna utilidad practica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f3004049/tds-carbon-card
- Repositorios similares de la misma asignatura:
  - https://huggingface.co/Domain-expansion/tds-carbon-card
  - https://huggingface.co/jayiitm/tds-carbon-card
  - https://huggingface.co/JayashreeR/tds-carbon-card
  - https://huggingface.co/23f3000911/tds-carbon-card
- Herramienta CodeCarbon (mencionada como fuente de medicion): https://codecarbon.io (no verificado en la informacion proporcionada)
