# OneScience-Group/NNCAM-Stable

## Resumen

NNCAM-Stable es una reproducción de ingeniería, publicada por el grupo OneScience, de un esquema de parametrización atmosférica basado en redes neuronales que sustituye la física húmeda y los procesos de radiación dentro de un modelo de circulación general (GCM). El trabajo original corresponde a equipos de la Universidad de Tsinghua y del Scripps Institution of Oceanography, y su objetivo es permitir simulaciones climáticas online estables durante varios años, un requisito que los esquemas de parametrización neuronal naïve no solían cumplir por problemas de deriva y desestabilización numérica.

El modelo no es un modelo de lenguaje: es un conjunto de tres redes de parametrización independientes que operan sobre columnas atmosféricas con 30 niveles verticales. Recibe 122 entradas por columna y produce 68 salidas, concretamente 30 tendencias de humedad, 30 tendencias de energía estática seca y 8 flujos radiativos. Se entrenó con dos años de datos de simulación SPCAM y se integra en el esquema CAM5.2 para su ejecución online.

Su relevancia actual reside en que el repositorio de HuggingFace no distribuye pesos preentrenados: ofrece el código, los scripts de entrenamiento, inferencia y evaluación, y las dependencias de entorno (GPU y DCU). Esto lo convierte en un punto de partida reproducible para investigar parameterizaciones neuronales estables, no en un modelo listo para inferencia directa. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes neuronales de parametrización (tres redes independientes) embebidas en el GCM CAM5.2; detalle de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre columnas atmosféricas de 30 niveles) |
| Tipos de cuantización | no disponible (checkpoint PyTorch de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (documentación y model card); la salida son campos físicos, no texto |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, ruta `result/checkpoints/nncam_stable.pt`); no se incluyen pesos en el repositorio |

## Arquitectura y entrenamiento

NNCAM-Stable sustituye dos bloques de la física de un GCM: la física húmeda atmosférica y los procesos de radiación. La implementación se articula en tres redes de parametrización independientes que se ejecutan acopladas al modelo CAM5.2 en modo online. Las entradas son 122 variables por columna atmosférica y las salidas son 68 campos: 30 tendencias de humedad, 30 tendencias de energía estática seca y 8 flujos de radiación (superficie y parte superior de la atmósfera). El detalle interno de las capas, el número de parámetros y la función de activación no están disponibles en la información proporcionada.

El entrenamiento utilizó dos años de datos de simulación SPCAM, con datos sintéticos que preservan las dimensiones completas (30 niveles verticales y tres redes de parametrización) pero reducen el número de muestras, el ancho de las redes y las épocas, según indica la model card. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable dado que no es un modelo generativo de texto. El repositorio incluye `scripts/fake_data.py` para generar datos sintéticos de validación, `scripts/train.py` para entrenamiento en un proceso y soporte de entrenamiento multi-proceso mediante `torchrun --standalone --nproc_per_node=2`.

## Capacidades

- Predicción de tendencias de humedad en 30 niveles verticales (30 salidas).
- Predicción de tendencias de energía estática seca en 30 niveles verticales (30 salidas).
- Emulación de radiación: 8 flujos correspondientes a superficie y parte superior de la atmósfera.
- Parametrización online acoplada al GCM CAM5.2, orientada a estabilidad multi-anual.
- Ejecución de validación de datos, entrenamiento, inferencia, métricas climáticas y visualización dentro del flujo ModelScope/OneCode.
- Entrenamiento multi-GPU mediante `torchrun`.
- Evaluación con reporte de RMSE global y generación de una figura de perfil de salida.
- Soporte de ejecución en GPU y en DCU (aceleradores con DTK 25.04.2 o versión compatible recomendada por OneScience).
- No dispone de soporte de tool calling, function calling, agentes, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Parametrización de física húmeda en simulaciones climáticas acopladas: el modelo genera las 30 tendencias de humedad y las 30 de energía estática seca que el GCM necesita en cada paso temporal, sustituyendo el esquema tradicional de microfísica y convección.
- Emulación de radiación atmosférica: predice los 8 flujos radiativos de superficie y de la parte superior de la atmósfera, lo que permite evaluar el balance radiativo sin ejecutar el solver radiativo completo.
- Validación de estabilidad online multi-anual: dado que el objetivo declarado es la simulación climática estable durante varios años, sirve para probar si una parametrización neuronal introduce deriva o desestabilización al integrarse en CAM5.2.
- Reproducción de resultados científicos: los scripts de entrenamiento, inferencia y evaluación permiten reproducir el flujo del artículo asociado (DOI 10.5194/gmd-15-3923-2022) y comparar métricas de RMSE.
- Desarrollo y depuración de pipelines de parameterización neuronal: `scripts/fake_data.py` genera datos sintéticos con las dimensiones completas pero coste reducido, lo que facilita validar el código en CPU antes de lanzar trabajos reales en GPU.
- Entrenamiento distribuido de esquemas de parametrización: el uso de `torchrun --nproc_per_node=2` permite escalar el entrenamiento a varios procesos en entornos con varias GPU o DCU.
- Integración en flujos ModelScope/OneCode: el repositorio contempla la validación de datos, entrenamiento, inferencia, métricas climáticas y visualización dentro de este ecosistema, útil para equipos que ya trabajan con él.
- Análisis y visualización de perfiles verticales: `scripts/result.py` produce un JSON de métricas y una figura comparativa, aprovechable para diagnóstico rápido del ajuste por nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el script de evaluación reporta un RMSE global y genera una figura de comparación (`result/evaluation/metrics.json` y `result/evaluation/comparison.png`), pero no se incluyen valores numéricos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican el número de parámetros ni el tamaño del checkpoint, por lo que no puede estimarse con rigor.
- GPU recomendadas: no se especifican modelos concretos. La model card indica que se recomienda una GPU o una DCU.
- Compatibilidad con GPU de consumo: no disponible. No hay datos de tamaño que permitan confirmar si cabe en una RTX 4090 u otra GPU de gama consumer.
- DCU: requiere DTK 25.04.2 o una versión compatible recomendada por OneScience, instalada previamente.
- CPU: admisible para validación de conectividad con la configuración de muestra pequeña por defecto.
- Entorno software: Python 3.11 en un entorno Conda (`onescience311`); en GPU se requieren `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx-linux-64=12`. Instalación mediante `pip install onescience[earth-gpu]` o `onescience[earth-dcu]` desde el índice de OneScience.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El despliegue se realiza ejecutando `scripts/inference.py` en el entorno OneScience.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de alternativas comparables, y no se detallan otros esquemas de parametrización neuronal con los que contrastar cifras. El único referente citado es el trabajo original publicado en GMD (DOI 10.5194/gmd-15-3923-2022), del que este repositorio es una reproducción de ingeniería independiente.

## Limitaciones y advertencias

- No se incluyen pesos preentrenados: no hay archivos bajo `weight/`, por lo que el modelo no puede usarse para inferencia directa sin entrenarlo previamente.
- Es una reproducción de ingeniería independiente de las especificaciones públicas de NNCAM-Stable, no una publicación oficial de los autores originales.
- El repositorio registra 0 descargas y 0 likes, lo que implica ausencia de validación por parte de la comunidad.
- Los datos sintéticos de `scripts/fake_data.py` reducen muestras, ancho de red y épocas; los resultados obtenidos con ellos no son representativos del rendimiento científico del modelo completo.
- No se publican métricas de referencia, curvas de estabilidad ni comparaciones con el esquema original de CAM5.2 en la información disponible.
- El dominio de aplicación está restringido a la parametrización atmosférica acoplada a CAM5.2 con datos SPCAM; no es transferible a otras tareas sin reentrenamiento.
- La documentación está únicamente en inglés y la salida son campos físicos, no texto, por lo que no aplica soporte multilingüe.
- Licencia Apache-2.0 para este repositorio, pero SPCAM v2, el código fuente de NNCAM, los artefactos del modelo y los datos de entrenamiento y prueba quedan sujetos a las licencias y términos de sus archivos respectivos. Es imprescindible revisarlas antes de cualquier uso comercial.
- No hay información sobre sesgos del modelo, pero al derivar de simulaciones SPCAM y de un esquema CAM5.2, hereda las limitaciones y sesgos físicos de esas fuentes.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de predicciones físicamente inconsistentes o de deriva numérica en integraciones largas, que es precisamente el problema que el modelo pretende mitigar.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/NNCAM-Stable
- Artículo (GMD): https://doi.org/10.5194/gmd-15-3923-2022
- Código original (Zenodo): https://doi.org/10.5281/zenodo.5596273
- Datos de entrenamiento (Zenodo): https://doi.org/10.5281/zenodo.5625616
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
