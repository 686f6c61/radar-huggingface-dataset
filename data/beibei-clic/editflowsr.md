# BeiBei-Clic/EditFlowSR

## Resumen

EditFlowSR es un checkpoint preentrenado que acompaña a la implementación oficial del artículo "EditFlowSR: Revisable Expression Generation for Symbolic Regression", aceptado en NeurIPS 2026 y desarrollado por Yuhong Xu, Ziyi Yang y Jinghui Zhong (SCUT-EIPI). No es un modelo de lenguaje generativo al uso, sino un modelo especializado en regresión simbólica: genera expresiones matemáticas que ajustan un conjunto de datos y permite revisarlas y editarlas de forma iterativa, en lugar de producir una única expresión de una sola pasada.

La arquitectura es un transformer encoder-decoder de 8 capas en cada lado, anchura 512 y 16 cabezas de atención. El encoder procesa los datos de entrada de forma invariante a la permutación (sin embeddings posicionales), mientras que el decoder de edición emplea embeddings posicionales aprendibles. El entrenamiento utiliza flow matching con doble trayectoria (descubrimiento y simplificación) con una ratio de trayectoria de 0,2.

El modelo es relevante para investigadores que trabajan en descubrimiento de ecuaciones y regresión simbólica, porque introduce un paradigma de generación revisable: el usuario puede corregir o simplificar una expresión parcial y el modelo continúa desde ahí. El checkpoint ocupa 324 MB, es de solo inferencia (sin estado del optimizador) y se distribuye con licencia MIT junto al repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas encoder + 8 capas decoder, anchura 512, 16 cabezas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en FP16 para inferencia) |
| Idiomas soportados | no aplica (modelo de regresion simbolica, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), fichero `editflowsr_pretrained.pth` de 324 MB |

## Arquitectura y entrenamiento

EditFlowSR es un transformer encoder-decoder simétrico de 8 capas por bloque, anchura 512 y 16 cabezas de atención. El encoder procesa el conjunto de datos de entrada (puntos de una función objetivo) sin embeddings posicionales, lo que lo hace invariante a la permutación de las muestras, tal como se describe en la sección 3.1 del artículo. El decoder de edición, en cambio, sí utiliza embeddings posicionales aprendibles para modelar la secuencia de la expresión simbólica.

El entrenamiento se basa en flow matching con doble trayectoria: una trayectoria de descubrimiento (generar una expresión desde cero) y otra de simplificación (partir de una expresión existente y reducirla). La ratio de trayectoria es de 0,2. Se usó el optimizador Adam con un learning rate máximo de 4e-5 y precisión FP16. El checkpoint publicado es de solo inferencia: contiene pesos y parámetros, con el estado del optimizador eliminado.

La innovación principal es el enfoque de generación revisable: el modelo no produce una única expresión cerrada, sino que puede continuar la edición de una expresión parcial dada por el usuario, lo que permite flujos iterativos de refinamiento en regresión simbólica.

## Capacidades

- Generación de expresiones simbólicas (fórmulas matemáticas) que ajustan un conjunto de datos de entrada.
- Edición y revisión iterativa de expresiones: el usuario puede modificar una expresión parcial y el modelo continúa desde ese estado.
- Trayectoria de simplificación: reduce expresiones existentes a formas más compactas.
- Procesamiento de datos de entrada invariante a la permutación de las muestras.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni multilingüismo: es un modelo de regresión simbólica, no un LLM.

## Casos de uso

- Descubrimiento de leyes físicas a partir de datos experimentales: el modelo genera expresiones candidatas que ajustan mediciones y el investigador puede editarlas para imponer restricciones dimensionales o de forma.
- Regresión simbólica en ingeniería: a partir de datos de simulación (por ejemplo, curvas de respuesta de un sistema mecánico), el modelo propone fórmulas interpretables que luego se simplifican con la trayectoria de simplificación.
- Refinamiento iterativo de ecuaciones: un analista parte de una expresión aproximada, la edita manualmente y el modelo continúa la generación para completar o corregir términos.
- Generación de features interpretables para modelos de machine learning: las expresiones simbólicas producidas pueden usarse como variables derivadas con significado físico.
- Docencia e investigación en descubrimiento de ecuaciones: permite experimentar con el paradigma de generación revisable frente a la generación de una sola pasada.
- Reproducción de experimentos del artículo: el checkpoint permite reproducir los resultados de NeurIPS 2026 sin reentrenar, usando el script `download_weights.py` del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 324 MB en FP16; la VRAM necesaria es modesta (del orden de 1-2 GB incluyendo activaciones, estimación no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en principio; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 6 GB o superior), aunque no se confirma en la documentación.
- Opciones de despliegue: carga directa del `.pth` con PyTorch siguiendo el repositorio SCUT-EIPI/EditFlowSR; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EditFlowSR | no disponible (8+8 capas, 512 de anchura) | no disponible | Regresion simbolica revisable | MIT | Checkpoint en HF + codigo en GitHub |
| Eureqa / PySR (basados en busqueda evolutiva) | no aplica | no aplica | Regresion simbolica | Varía (PySR: Apache 2.0) | Software, no checkpoint neuronal |
| Modelos neuronales de regresion simbolica (p. ej. end-to-end transformers) | no disponible | no disponible | Regresion simbolica | Varía | Varía |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: solo sirve para regresión simbólica; no es un LLM y no debe evaluarse como tal.
- Checkpoint de solo inferencia: no incluye estado del optimizador, por lo que no es directamente reentrenable sin código adicional.
- No se han publicado métricas de rendimiento ni benchmarks en la información disponible, lo que impide valorar su calidad frente a alternativas.
- La licencia MIT se indica en la model card, pero la licencia del campo de metadatos de Hugging Face figura como "no disponible"; conviene verificar el fichero LICENSE del repositorio de código antes de uso comercial.
- El uso previsto es de investigación ("released for research use together with the code repository"); revisar si el uso comercial está cubierto por la MIT en el repositorio.
- No se especifican limitaciones de contexto, sesgos ni riesgos de alucinación porque el modelo no genera lenguaje natural.
- Depende del repositorio externo para el flujo de uso (descarga de pesos y quickstart); sin él, el checkpoint aislado es difícil de utilizar.

## Enlaces

- Hugging Face: https://huggingface.co/BeiBei-Clic/EditFlowSR
- Repositorio de código: https://github.com/SCUT-EIPI/EditFlowSR
- Artículo (OpenReview): https://openreview.net/forum?id=SiqvujQlIz
