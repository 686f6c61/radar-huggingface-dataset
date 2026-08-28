# potteryrage/SLp

## Resumen

SLp es un modelo de mundo celular (cellular world model) desarrollado por potteryrage (Jack Large) para la investigación de letalidad sintética en biología computacional. El repositorio contiene artefactos de investigación públicos e inmutables para el proyecto SL-Predict, cuyo objetivo es abordar el problema de arranque en frío (cold-start) en la predicción de interacciones de letalidad sintética. El checkpoint principal, SLp-1, cuenta con 59,7 millones de parámetros y se distribuye junto con conjuntos de datos derivados y un manifiesto de carga.

El modelo se presenta como una herramienta de investigación, no como software clínico, y no incluye el decodificador SL asociado. La relevancia actual radica en la creciente necesidad de modelos predictivos en biología de sistemas que puedan inferir interacciones genéticas letales a partir de datos de expresión de célula única, un campo con aplicaciones potenciales en oncología de precisión. Sin embargo, la información pública disponible es muy limitada: no se detallan la arquitectura interna, el proceso de entrenamiento ni las capacidades específicas más allá de su propósito declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 59,7 millones (checkpoint SLp-1) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (consultar auditar por corpus) |
| Formato de pesos | no disponible (repositorio de 7,1 GB) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura del modelo. Se describe como un "modelo de mundo celular" (cellular world model), lo que sugiere un enfoque de aprendizaje profundo para representar estados celulares y sus transiciones, probablemente basado en datos de expresión génica de célula única. No se especifica si se trata de un transformer, una red neuronal recurrente, un modelo de difusión u otra arquitectura. Tampoco se informa sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El repositorio incluye un manifiesto de carga y registros de auditoría con SHA-256 para cada conjunto de datos, lo que indica un énfasis en la reproducibilidad y la trazabilidad, pero no se detalla el proceso de entrenamiento en sí.

## Capacidades

- Predicción de interacciones de letalidad sintética a nivel de célula única, según el propósito declarado del proyecto SL-Predict.
- Modelado de estados celulares como "mundo" (world model), lo que podría permitir simulaciones o razonamiento sobre dinámicas celulares.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se incluye el decodificador SL en el repositorio, por lo que la inferencia directa de letalidad sintética requiere un componente adicional no distribuido.

## Casos de uso

- Investigación en biología computacional: el modelo puede utilizarse para explorar hipótesis sobre interacciones genéticas letales en líneas celulares, especialmente en escenarios de arranque en frío donde no hay datos previos de letalidad para un tipo celular concreto.
- Validación de dianas terapéuticas: los resultados del modelo podrían priorizar pares de genes candidatos para experimentos de validación en laboratorio, reduciendo el espacio de búsqueda.
- Integración con pipelines de análisis de célula única: al estar diseñado para datos de single-cell, podría incorporarse en flujos de trabajo que procesan matrices de expresión para generar hipótesis de vulnerabilidades genéticas.
- Estudio de mecanismos de resistencia: el modelado de estados celulares podría ayudar a simular cómo las células adquieren resistencia a fármacos mediante alteraciones en redes de letalidad sintética.
- Reproducibilidad en investigación: los artefactos con auditorías SHA-256 permiten a otros grupos reproducir exactamente los mismos datos y pesos, facilitando estudios comparativos.
- Educación y formación: el checkpoint de 59,7M parámetros es lo suficientemente pequeño para ejecutarse en hardware modesto, lo que lo hace accesible para cursos de biología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de biología como precisión en predicción de letalidad sintética, AUC, etc.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la documentación.
- Con 59,7 millones de parámetros, el modelo es pequeño y probablemente podría ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU, pero no hay confirmación oficial.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). Dado que no es un modelo de lenguaje, es probable que requiera un framework de deep learning estándar (PyTorch, TensorFlow), pero no se indica.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se mencionan alternativas en la model card. El campo de modelos de mundo celular para letalidad sintética es emergente y no se dispone de referencias públicas en este contexto.

## Limitaciones y advertencias

- La model card advierte explícitamente que los artefactos son resultados de investigación, no software clínico, y no establecen letalidad sintética ni eficacia de tratamiento para ningún individuo.
- No se incluye el decodificador SL, por lo que el modelo por sí solo no puede producir predicciones de letalidad sintética sin un componente adicional.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no se trata de un modelo de lenguaje.
- La licencia es "other" y varía por corpus; es necesario consultar los archivos de auditoría para conocer las restricciones de uso comercial y redistribución.
- La falta de documentación técnica detallada (arquitectura, datos de entrenamiento, métricas) limita la evaluación rigurosa del modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto muy reciente o poco difundido.

## Enlaces

- [HuggingFace: potteryrage/SLp](https://huggingface.co/potteryrage/SLp)
- [Perfil del autor en HuggingFace](https://huggingface.co/potteryrage)
