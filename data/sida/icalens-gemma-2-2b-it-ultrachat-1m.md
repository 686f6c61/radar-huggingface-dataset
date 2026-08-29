# sida/icalens-gemma-2-2b-it-ultrachat-1m

## Resumen

El repositorio `sida/icalens-gemma-2-2b-it-ultrachat-1m` no contiene un modelo de lenguaje, sino un **ICA Lens** (Independent Component Analysis Lens) para el modelo `google/gemma-2-2b-it`. Se trata de un artefacto de interpretabilidad que permite descomponer las activaciones internas del modelo en componentes estadísticamente independientes, facilitando el análisis de los mecanismos internos del transformer. Desarrollado por Sida Liu y Feijiang Han, está asociado al artículo "ICA Lens: Interpreting Language Models Without Training Another Dictionary" (arXiv:2606.11722). Su relevancia radica en ofrecer una alternativa sin entrenamiento adicional a los sparse autoencoders para la interpretación de modelos, con un coste computacional reducido.

El artefacto se ajustó sobre las activaciones residuales (`resid_post`) de las 26 capas de `gemma-2-2b-it`, utilizando un millón de tokens del dataset `HuggingFaceH4/ultrachat_200k`. Cada capa tiene 2304 componentes independientes, y el paquete `icalens` (versión 0.3.6.dev0) proporciona las funciones para transformar activaciones en puntuaciones ICA y calcular la fracción de energía por componente. El repositorio incluye también los readouts R-lens transferidos desde el modelo base `google/gemma-2-2b`, lo que amplía su utilidad para análisis de interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens sobre `google/gemma-2-2b-it` (transformer decoder) |
| Parametros totales | No disponible (artefacto de transformacion, no modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | 1024 tokens (contexto de fitting) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | No disponible (libreria `icalens`) |
| Capas analizadas | 0 a 25 (26 capas) |
| Hidden size | 2304 |
| Dataset de fitting | HuggingFaceH4/ultrachat_200k (split `train_sft`) |
| Tokens de fitting | 1.000.000 |
| Componentes por capa | 2304 |
| Iteraciones FastICA | 50 por capa |
| Tamano del repositorio | 2.8 GB |

## Arquitectura y entrenamiento

El ICA Lens es un método post-hoc que aplica análisis de componentes independientes (ICA) a las activaciones del modelo. Concretamente, se centran y blanquean las activaciones residuales de cada capa y luego se aplica una rotación ortogonal aprendida mediante FastICA. El resultado son puntuaciones ICA con signo que representan la contribución de cada componente independiente a la activación de un token. No se trata de un entrenamiento con RLHF ni DPO; es un ajuste no supervisado sobre un millón de tokens de `ultrachat_200k`, con un contexto de 1024 tokens. La elección de `resid_post` como sitio de activación y la indexación de capas basada en cero están documentadas en `icalens.json`. Los readouts R-lens se transfirieron desde el modelo base `google/gemma-2-2b` para reducir el coste de cómputo, tras verificar compatibilidad de tamaño oculto, sitio de activación y mapeo de capas.

## Capacidades

- Descomposición de activaciones residuales en componentes independientes por capa (0 a 25).
- Cálculo de puntuaciones ICA con signo para cada token y componente.
- Cálculo de la fracción de energía por componente (`score² / sum(score²)`).
- Transformación de activaciones capturadas externamente, siempre que se respete la revisión del modelo, el sitio de activación y el preprocesamiento registrados.
- Análisis de texto completo mediante `lens.analyze(text, layer)`.
- Reutilización de readouts R-lens para interpretación de componentes a nivel de token.
- Integración con el paquete `icalens` (versión 0.3.6.dev0) y soporte para `device="auto"` (CUDA o CPU).

## Casos de uso

- **Investigación en interpretabilidad de modelos**: permite estudiar cómo se distribuye la información a lo largo de las capas de `gemma-2-2b-it`, identificando componentes que se activan ante conceptos concretos (sintácticos, semánticos o pragmáticos).
- **Análisis de sesgos y alucinaciones**: al descomponer las activaciones, se pueden localizar componentes que correlacionan con respuestas incorrectas o sesgadas, facilitando la depuración de comportamientos no deseados.
- **Comparación de modelos base vs. instruidos**: al transferir los readouts R-lens desde el modelo base, se puede comparar cómo cambia la representación interna tras el ajuste con instrucciones, útil para estudiar el efecto del fine-tuning.
- **Desarrollo de métodos de control de generación**: las puntuaciones ICA podrían usarse para intervenir en el flujo residual (p. ej., modificando componentes específicos) y observar el efecto en la salida, aunque esta aplicación requiere trabajo adicional.
- **Educación y divulgación**: sirve como herramienta didáctica para visualizar cómo un transformer de 2B parámetros organiza internamente la información, sin necesidad de entrenar modelos auxiliares.
- **Validación de otras técnicas de interpretabilidad**: puede usarse como referencia para comparar sparse autoencoders u otros métodos de descomposición, ya que ICA no requiere entrenamiento de diccionarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (como MMLU, HumanEval, etc.) porque no es un modelo generativo, sino un artefacto de análisis. La calidad del ICA Lens se evalúa cualitativamente mediante la interpretabilidad de los componentes, no mediante tareas downstream.

## Requisitos de hardware

- Para ejecutar el ICA Lens se necesita cargar el modelo base `google/gemma-2-2b-it` (2B parámetros). En bfloat16, el modelo ocupa aproximadamente 4 GB de VRAM.
- El artefacto del lens (2.8 GB) puede cargarse en CPU, ya que las transformaciones son operaciones matriciales ligeras. La carga del modelo base en GPU es opcional si se usan activaciones precalculadas.
- Una GPU con al menos 6 GB de VRAM (p. ej., RTX 3060, RTX 2060) es suficiente para ejecutar el análisis completo con el modelo en memoria. También puede ejecutarse en CPU, aunque con mayor latencia.
- El paquete `icalens` soporta `device="auto"`, que usa CUDA si está disponible y si no, CPU.
- Para análisis por lotes de muchos textos, se recomienda una GPU con 8-12 GB de VRAM para agilizar la extracción de activaciones.
- No se requieren GPUs especializadas como A100 o H100 para este artefacto, dado el tamaño reducido del modelo base.

## Comparativa con modelos similares

No se dispone de información comparativa con otros artefactos de interpretabilidad en la documentación proporcionada. Existen métodos alternativos como los sparse autoencoders (SAE) o el Tuned Lens, pero no se han encontrado datos concretos que permitan una comparación cuantitativa con este ICA Lens. La principal diferencia cualitativa es que ICA no requiere entrenar un diccionario adicional, lo que reduce el coste computacional, pero a cambio los componentes no son tan directamente interpretables como los de un SAE entrenado con regularización de escasez. No se puede ofrecer una tabla comparativa sin datos verificables.

## Limitaciones y advertencias

- Las puntuaciones ICA son con signo y no representan probabilidades; no deben interpretarse como magnitudes de activación absolutas.
- Los componentes son específicos de cada capa y del artefacto ajustado; no son transferibles entre capas ni entre modelos.
- El lens se ajustó con un millón de tokens de `ultrachat_200k`; su cobertura de vocabulario y dominios puede estar sesgada hacia el estilo conversacional de ese dataset.
- Los readouts R-lens se transfirieron desde el modelo base `google/gemma-2-2b` sin reajuste sobre el modelo instruido, lo que puede introducir pequeñas discrepancias en la interpretación de componentes.
- La licencia del artefacto no está especificada; el modelo base `gemma-2-2b-it` tiene su propia licencia (Gemma Terms of Use), que debe respetarse al usar el lens en proyectos comerciales.
- No se garantiza que los componentes ICA correspondan a conceptos semánticos claros; la interpretación requiere validación manual o con métodos adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sida/icalens-gemma-2-2b-it-ultrachat-1m
- Paper (arXiv): https://arxiv.org/abs/2606.11722
- Repositorio GitHub del paquete `icalens`: https://github.com/liusida/icalens/
- Modelo base analizado: https://huggingface.co/google/gemma-2-2b-it
