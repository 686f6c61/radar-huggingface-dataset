# dwmoreau/mlindex-models

## Resumen

El modelo `dwmoreau/mlindex-models` es un conjunto de modelos de machine learning desarrollados por dwmoreau para el programa MLINDEX, una herramienta de indexación de difracción de polvo. Su función es, a partir de una lista de picos de difracción observados, generar celdas unitarias candidatas para cada red de Bravais, que luego se refinan mediante optimización por mínimos cuadrados. Estos modelos actúan como inicializadores de las celdas candidatas, mejorando la eficiencia y precisión del proceso de indexación.

El repositorio contiene 780 archivos (~545 MB) organizados por sistema de red (cúbico, hexagonal, romboédrico, tetragonal, ortorrómbico, monoclínico y triclínico). Incluye predictores de volumen basados en bosques aleatorios, bibliotecas de plantillas de índices de Miller, redes de filtro de candidatos en formato ONNX cuantizado y conjuntos de referencia. La licencia es MIT, lo que permite uso comercial y modificación.

La relevancia actual radica en que la indexación de difracción de polvo es un paso crítico en cristalografía y ciencia de materiales, y el uso de ML para acelerar y robustecer este proceso es una tendencia emergente. Al estar disponible en HuggingFace con una licencia permisiva, facilita su integración en flujos de trabajo de análisis de datos científicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bosques aleatorios (predictores de volumen) y redes neuronales cuantizadas en ONNX (filtros de candidatos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de indexación, no de lenguaje) |
| Tipos de cuantizacion | ONNX cuantizado (no se especifica el tipo exacto, p.ej. int8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX, archivos .npy, y otros (no se especifica safetensors) |

Nota: La arquitectura no es un transformer ni un MoE; es un conjunto de modelos específicos para la tarea de indexación. No hay parámetros totales declarados.

## Arquitectura y entrenamiento

El modelo no es un transformer ni un modelo de lenguaje. Se compone de varios componentes: predictores de volumen basados en bosques aleatorios (random forest) para cada red de Bravais, bibliotecas de plantillas de índices de Miller con calibradores, y redes de filtro de candidatos en formato ONNX cuantizado. Estos modelos se entrenan para inicializar celdas unitarias candidatas a partir de picos de difracción observados. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens (no aplica) ni el proceso de entrenamiento (RLHF, DPO, etc.). La model card indica que los modelos se usan dentro de MLINDEX, que refina las candidatas por mínimos cuadrados.

## Capacidades

- Indexación de difracción de polvo: dado un conjunto de picos de difracción, genera celdas unitarias candidatas para cada red de Bravais.
- Clasificación de candidatas mediante la figura de mérito M20 de Wolff.
- Soporte para múltiples sistemas de red: cúbico, hexagonal, romboédrico, tetragonal, ortorrómbico, monoclínico y triclínico.
- Filtrado de candidatas mediante redes ONNX cuantizadas.
- No es un modelo de lenguaje, por lo que no tiene capacidades de generación de texto, razonamiento, código, etc.

## Casos de uso

- Análisis de difracción de polvo en laboratorios de cristalografía: los investigadores pueden usar MLINDEX con estos modelos para indexar patrones de difracción de polvo de materiales desconocidos, acelerando la determinación de estructuras cristalinas.
- Automatización de flujos de trabajo en ciencia de materiales: integración en pipelines de caracterización de materiales donde se requiera indexación rápida y fiable.
- Educación y formación: como herramienta didáctica para enseñar indexación de difracción y uso de ML en cristalografía.
- Desarrollo de nuevas metodologías: los modelos pueden servir como punto de partida para investigaciones sobre indexación basada en ML.
- Aplicaciones industriales: control de calidad de materiales policristalinos donde la identificación de fases es crítica.
- Integración con otras herramientas de análisis cristalográfico: al ser un repositorio de modelos, puede ser utilizado por otros programas que necesiten inicialización de celdas unitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como M20 promedio, precisión, etc.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Dado que los modelos son pequeños (780 archivos, ~545 MB) y se usan para inferencia en tareas de indexación, es probable que puedan ejecutarse en CPU sin necesidad de GPU. Sin embargo, no hay datos concretos sobre VRAM, GPU recomendadas, latencia o throughput. Se recomienda consultar el repositorio de MLINDEX para más detalles.

## Comparativa con modelos similares

No se dispone de información sobre modelos similares en la misma categoría (indexación de difracción de polvo con ML). Por tanto, no se puede realizar una comparativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje; no debe usarse para tareas de NLP.
- La información sobre el entrenamiento y los datos utilizados no está disponible, por lo que no se pueden evaluar sesgos o riesgos de alucinación (no aplica).
- La licencia MIT permite uso comercial, pero se debe atribuir la autoría según los términos de la licencia.
- El modelo está diseñado específicamente para la indexación de difracción de polvo; su uso fuera de este dominio no es apropiado.
- No se proporcionan garantías de rendimiento; se recomienda validar en casos de uso específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dwmoreau/mlindex-models
- Repositorio GitHub de MLINDEX: https://github.com/dwmoreau/MLI

No hay otros enlaces (papers, blogs, demos) en la información proporcionada.
