# 23ft/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento dentro del programa TDS GA8. El autor, identificado como 23ft, documenta las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning realizado sobre hardware NVIDIA H100. El objetivo es aportar transparencia sobre el coste ambiental del entrenamiento de modelos, una práctica conocida como "Green AI".

El contenido se limita a metadatos de emisiones: 283,482 kg de CO₂eq, 446,4 horas de GPU en la región europe-north1, con un consumo energético total de 2362,35 kWh. No se proporciona ninguna información sobre la arquitectura del modelo fine-tuneado, sus parámetros, capacidades o licencia. Por tanto, esta ficha describe un artefacto de seguimiento ambiental, no un modelo desplegable.

Aunque la iniciativa es relevante para la comunidad de IA responsable, la ausencia de detalles técnicos impide cualquier evaluación de rendimiento o uso práctico. Se recomienda a quien busque un modelo funcional que consulte otras fuentes.

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

Datos adicionales registrados en la model card:

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 6x NVIDIA H100 |
| Modo de entrenamiento | fine-tuning |
| Region | europe-north1 |
| Horas de GPU | 446,4 h (PUE 1,26) |
| Energia total | 2362,35 kWh |
| Emisiones de CO₂ | 283,482 kg CO₂eq |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente. La model card indica que se realizo un fine-tuning sobre hardware NVIDIA H100, con 6 GPUs, durante 446,4 horas en la region europe-north1. El consumo energetico total fue de 2362,35 kWh, lo que resulto en 283,482 kg de CO₂ equivalente, calculado con la herramienta CodeCarbon. No se mencionan datos de entrenamiento, tecnicas de optimizacion ni innovaciones arquitectonicas.

## Capacidades

No aplicable. Este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision ni ninguna otra funcion propia de un sistema de IA. Se trata de un documento de auditoria ambiental.

## Casos de uso

No aplicable como modelo de IA. El unico proposito de este repositorio es servir como registro publico de emisiones de carbono para fines de transparencia y auditoria en proyectos de IA sostenible. No ofrece ninguna funcionalidad ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo, no hay metricas de rendimiento que evaluar.

## Requisitos de hardware

No aplicable para inferencia. El hardware mencionado (6x NVIDIA H100) corresponde al entrenamiento, no a un despliegue. No se proporcionan requisitos de VRAM, GPU recomendadas ni opciones de despliegue.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable, ya que este repositorio no contiene un sistema de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ejecutarse ni integrarse en aplicaciones.
- La informacion tecnica es inexistente: se desconoce la arquitectura, el tamano, el contexto o la licencia.
- El registro de emisiones es especifico de una ejecucion concreta y no es extrapolable a otros entrenamientos.
- No se indica si los datos de emisiones incluyen la fabricacion del hardware o solo el consumo operativo.
- La fecha de creacion (2026-08-18) es posterior a la actual, lo que sugiere que el repositorio podria ser un artefacto de prueba o un proyecto futuro.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/23ft/tds-carbon-card
- Dashboard TDS MMC (referenciado en la busqueda web, sin relacion directa confirmada): https://mmc.tds.ai/
