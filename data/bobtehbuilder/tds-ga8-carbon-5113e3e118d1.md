# bobtehbuilder/tds-ga8-carbon-5113e3e118d1

## Resumen

Este repositorio no contiene un modelo de IA funcional, sino una tarjeta de metadatos centrada en la contabilidad de carbono (Green AI). El autor, bobtehbuilder, ha publicado una ficha que documenta las emisiones de CO2 equivalente generadas durante un proceso de pre-entrenamiento, utilizando la herramienta CodeCarbon. Los datos registrados indican un consumo de 844,5 kWh y 548,927 kg de CO2eq, empleando 8 GPUs NVIDIA L40S durante 212,4 horas en la región `asia-south1`.

La relevancia de esta publicación radica en su enfoque metodológico: proporciona las fórmulas exactas para calcular la energía consumida y las emisiones derivadas, lo que puede servir como plantilla para otros equipos que deseen auditar el impacto ambiental de sus entrenamientos. Sin embargo, no se incluye ninguna información sobre la arquitectura del modelo, sus pesos, parámetros, licencia o capacidades. Se trata, por tanto, de un registro de sostenibilidad y no de un artefacto desplegable.

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

Nota: la unica informacion tecnica disponible se refiere al entorno de entrenamiento, no al modelo en si. Los datos de emisiones se detallan en la siguiente seccion.

## Arquitectura y entrenamiento

No se especifica la arquitectura del modelo (transformer, MoE, SSM, etc.) ni la composicion del dataset. El unico dato de entrenamiento disponible es el tipo de proceso, declarado como `pre-training`. El hardware utilizado fue un conjunto de 8 GPUs NVIDIA L40S con un TDP de 350 W cada una. El tiempo total de computo fue de 212,4 horas GPU, con un PUE (Power Usage Effectiveness) de 1,42 en la region `asia-south1`, cuya intensidad de red electrica es de 650 gCO2eq/kWh.

Las formulas proporcionadas por el autor para el calculo son las siguientes:
- `energy_kWh = TDP x GPUs x hours x PUE / 1000`
- `co2_kg = energy_kWh x grid_intensity / 1000`

Aplicando estos calculos, se obtiene un consumo total de 844,5024 kWh y unas emisiones de 548,927 kg CO2eq. No se menciona el uso de tecnicas como RLHF, DPO o cualquier innovacion arquitectonica.

## Capacidades

- No disponible. El repositorio no define ninguna capacidad funcional del modelo, como generacion de texto, razonamiento, codigo, matematicas, vision, tool calling o soporte multilingue.
- No se especifica si existe modo de pensamiento (thinking mode), procesamiento de audio o cualquier otra funcionalidad especial.

## Casos de uso

Dado que no se proporciona un modelo funcional, no es posible definir casos de uso practicos para inferencia o generacion. Sin embargo, la tarjeta de metadatos en si misma puede servir para los siguientes propositos:

- Auditoria ambiental de entrenamientos: el formato y las formulas pueden replicarse para calcular el coste energetico y las emisiones de otros proyectos de pre-entrenamiento.
- Reporte de sostenibilidad corporativa: los datos de emisiones pueden integrarse en informes de responsabilidad social o en documentacion de conformidad con estandares de eficiencia energetica.
- Comparativa de eficiencia entre hardware: al conocer el TDP, las horas y el PUE, se puede evaluar la eficiencia relativa de diferentes configuraciones de GPU.
- Optimizacion de costes operativos: el consumo de 844,5 kWh permite estimar el coste electrico en diferentes regiones y ajustar la localizacion de futuros entrenamientos.
- Investigacion en Green AI: los datos publicados pueden servir como punto de referencia para estudios sobre la huella de carbono en el entrenamiento de modelos grandes.
- Validacion de herramientas de medicion: el uso de CodeCarbon y la transparencia en los calculos permiten contrastar la precision de otras herramientas de seguimiento de emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar de rendimiento, ya que no se ha liberado ningun peso ni arquitectura.

## Requisitos de hardware

- Entrenamiento declarado: 8x NVIDIA L40S (350 W TDP cada una), con un total de 212,4 horas GPU.
- Requisitos de inferencia: no disponibles, al no existir un modelo con pesos publicados.
- No se indica si el modelo cabria en GPUs de consumo (como RTX 4090) ni se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al no tratarse de un modelo funcional, no es posible compararlo con alternativas como Llama, Mistral, Qwen o cualquier otra familia de modelos de proposito general. La publicacion carece de parametros, contexto y licencia, por lo que cualquier comparativa careceria de base tecnica.

## Limitaciones y advertencias

- No es un modelo operativo: no contiene pesos, tokenizador ni pipeline de inferencia. Intentar cargarlo como un modelo estandar fallara.
- Ausencia de licencia: al no especificarse licencia, no se puede determinar si los metadatos pueden reutilizarse comercialmente o si estan sujetos a restricciones de atribucion.
- Datos de emisiones contextuales: los valores de CO2 dependen de la intensidad de la red electrica de `asia-south1` (650 gCO2eq/kWh) y del PUE de 1,42. No son extrapolables a otras regiones o centros de datos.
- Riesgo de confusion: la etiqueta `region:us` en los tags de HuggingFace contradice la ubicacion declarada en la model card (`asia-south1`), lo que puede inducir a error en la interpretacion de los datos.
- Sin garantias de reproducibilidad: no se detalla el software utilizado, la version de CodeCarbon ni la configuracion exacta del entorno, por lo que replicar el calculo puede arrojar variaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-5113e3e118d1
