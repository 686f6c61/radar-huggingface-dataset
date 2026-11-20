# braindecode/mirepnet-pretrained

## Resumen

MIRepNet es un modelo fundacional especializado en electroencefalografía (EEG) para clasificación de imaginación motora (motor imagery, MI), es decir, la decodificación de intenciones de movimiento a partir de la actividad cerebral. Lo desarrollan Dingkun Liu, Zhu Chen, Jingwei Luo y colaboradores, y esta ficha corresponde al re-host en formato Braindecode del checkpoint oficial publicado por los autores originales. El modelo resuelve el problema de la escasez de datos etiquetados en interfaces cerebro-computador (BCI): en lugar de entrenar un clasificador desde cero para cada sujeto y cada paradigma, se parte de un modelo preentrenado sobre múltiples conjuntos de datos y se ajusta fino para la tarea concreta.

Arquitectónicamente es un transformer compacto de 6 bloques y 8 cabezas de atención, con una dimensión de embedding de 256 y 5.143.299 parámetros totales. Trabaja sobre ventanas de 1.000 muestras a 250 Hz (4 segundos de señal) con 45 canales EEG en un orden de canales predefinido. El preentrenamiento es híbrido: reconstrucción de tokens enmascarados más clasificación supervisada de imaginación motora, sobre siete conjuntos de datos públicos de EEG.

Su relevancia actual radica en que es uno de los pocos modelos fundacionales de EEG con pesos abiertos, licencia MIT y una integración directa en Braindecode mediante `from_pretrained`, lo que reduce la fricción para reproducir resultados y para reutilizar el modelo en pipelines de investigación en BCI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (6 bloques, 8 cabezas de atencion), embedding de 256 dimensiones |
| Parametros totales | 5.143.299 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000 muestras a 250 Hz (4 segundos de senal EEG), 45 canales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal EEG, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria braindecode, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder con 6 bloques y 8 cabezas de autoatención, que proyecta la señal EEG a un espacio de embedding de 256 dimensiones. La entrada son 45 canales en el orden almacenado en `mirepnet_channels.json` y 1.000 muestras temporales a 250 Hz. El preentrenamiento es híbrido: combina una tarea de reconstrucción de tokens enmascarados (masked token reconstruction, con `mask_token` y un decodificador que no forma parte del forward pass publicado) con una tarea supervisada de clasificación de imaginación motora mediante una cabeza de 3 salidas. Los 34 tensores exclusivos del preentrenamiento se omitieron en la conversión; se conservaron los 109 tensores downstream.

Los datos de preentrenamiento provienen de siete conjuntos públicos: BNCI 2014-002 (Steyrl et al., mano derecha frente a ambos pies), PhysioNet EEG Motor Movement/Imagery (BCI2000), Dreyer et al. 2023 (87 sujetos, MI izquierda/derecha, partes A+B+C), Weibo2014 (Yi et al., MI simple y compuesta), Zhou2016 (MI de tres clases), Lee2019_MI (OpenBMI, parte de imaginación motora) y Cho2017 (MI izquierda/derecha). Los conjuntos de evaluación downstream (BNCI2014_001, BNCI2015_001, BNCI2014_004, AlexMI) no se usaron para generar estos pesos. El paper describe un pipeline con filtrado 8–30 Hz, remuestreo, preparación de plantillas de canales y alineamiento euclídeo; estas etapas de preprocesamiento no las realiza el modelo y deben aplicarse externamente. La conversión desde el checkpoint oficial (`MIRepNet.pth`) alcanza un error absoluto máximo de 2,38e-7 en características pooled y 1,19e-7 en logits frente a la implementación oficial.

## Capacidades

- Clasificación de imaginación motora a partir de EEG: decodificación de intenciones de movimiento (mano izquierda, mano derecha, pies, según la cabeza de preentrenamiento).
- Extracción de representaciones: el embedding de 256 dimensiones puede usarse como características para clasificadores downstream o para análisis de representaciones.
- Ajuste fino con número de salidas configurable (`n_outputs`) para adaptar la cabeza a nuevas tareas y paradigmas BCI.
- Aprendizaje con pocos datos: el preentrenamiento sobre múltiples sujetos y datasets permite ajustar con menos ensayos etiquetados por sujeto.
- Procesamiento de ventanas de 4 segundos con 45 canales, compatible con configuraciones EEG de alta densidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de señal, no de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Rehabilitación motora asistida por BCI: el modelo decodifica la intención de movimiento del paciente a partir de una ventana de 4 segundos y 45 canales, y esa señal puede accionar una ortesis o un exoesqueleto. El preentrenamiento multi-sujeto reduce el tiempo de calibración por paciente.
- Control de prótesis de mano: ajustando la cabeza a dos o tres clases con `n_outputs=2` o `n_outputs=3` y fine-tuning con datos del usuario, se obtiene un clasificador de mano izquierda/derecha o mano/pies para control protésico en tiempo casi real.
- Evaluación de paradigmas BCI en investigación: sirve como línea base preentrenada frente a la que comparar clasificadores entrenados desde cero, gracias a la integración nativa con Braindecode y MOABB.
- Extracción de características para análisis neurocientífico: el embedding de 256 dimensiones permite estudiar la separabilidad entre condiciones experimentales sin entrenar un modelo completo, útil en estudios de plasticidad o de variabilidad inter-sujeto.
- Sistemas de neurofeedback: la clasificación de estados de imaginación motora puede alimentar bucles de retroalimentación en tiempo real, con la ventaja de que el modelo ya incorpora información de siete cohortes distintas.
- Docencia y reproducibilidad en neuroingeniería: el checkpoint en safetensors con licencia MIT y conversión reproducible (`convert_mirepnet_checkpoint.py`) facilita replicar el paper en cursos y laboratorios sin depender de pesos propietarios.
- Prototipado rápido de aplicaciones BCI en entornos con recursos limitados: con 5,1 millones de parámetros, el modelo es ligero y puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión (error absoluto máximo de 2,38e-7 en características pooled y 1,19e-7 en logits frente a la implementación oficial), no métricas de precisión en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 5,1 millones de parámetros, más el overhead de activaciones de la ventana de entrada (45 × 1.000 muestras); en la práctica, pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobredimensionadas para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4060, etc.), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo Braindecode/PyTorch, se carga con `MIRepNet.from_pretrained` y se ejecuta con PyTorch estándar; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por ventana en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIRepNet (este) | 5,14 M | 45 canales × 1.000 muestras a 250 Hz | Clasificacion de imaginacion motora | MIT | Hugging Face (braindecode y starself) |
| Modelos Braindecode clasicos (p. ej. EEGNet, ShallowFBCSPNet) | Del orden de decenas de miles de parametros | Configurable por canal y frecuencia de muestreo | Clasificacion EEG supervisada | BSD/MIT segun implementacion | Incluidos en la libreria Braindecode |
| Modelos fundacionales EEG de gran escala | no disponible | no disponible | Representaciones generales de EEG | no disponible | no disponible |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; los modelos clásicos de Braindecode se citan como referencia cualitativa por su presencia en la misma librería.

## Limitaciones y advertencias

- El orden semántico de las tres salidas de la cabeza de preentrenamiento no está documentado en el repositorio oficial. Debe sustituirse la cabeza con `n_outputs=...` y ajustarse fino salvo que se verifique independientemente el mapeo de etiquetas.
- El modelo no realiza el preprocesamiento del pipeline (filtrado 8–30 Hz, remuestreo, preparación de plantillas de canales y alineamiento euclídeo); aplicarlo mal degrada el rendimiento.
- Requiere exactamente 45 canales en el orden de `mirepnet_channels.json` y ventanas de 1.000 muestras a 250 Hz; no admite configuraciones arbitrarias sin adaptación.
- Riesgo de sesgo por los datasets de preentrenamiento: siete cohortes públicas con protocolos, montajes y poblaciones específicas; la generalización a otros montajes, poblaciones clínicas o dispositivos no está garantizada.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling y no tiene capacidades multilingües.
- Las licencias de los datasets de entrenamiento son independientes de la licencia MIT del checkpoint; su uso comercial puede estar restringido por las condiciones de cada dataset original.
- No hay benchmarks downstream publicados en la información disponible, por lo que no puede afirmarse un rendimiento superior a alternativas sin evaluación propia.
- La fecha de creación del repositorio (2026-08-31) y la publicación asociada en Knowledge-Based Systems (2026) indican que se trata de un trabajo reciente; la validación independiente es aún limitada.

## Enlaces

- Modelo en Hugging Face (re-host Braindecode): https://huggingface.co/braindecode/mirepnet-pretrained
- Checkpoint oficial de los autores: https://huggingface.co/starself/MIRepNet
- Codigo oficial: https://github.com/staraink/MIRepNet
- Paper (arXiv): https://arxiv.org/abs/2507.20254
- Publicacion en Knowledge-Based Systems: https://www.sciencedirect.com/science/article/pii/S0950705126006921
- Braindecode en Zenodo: https://doi.org/10.5281/zenodo.17699192
- NEMAR (datasets de preentrenamiento): https://nemar.org
- PhysioNet EEG Motor Movement/Imagery: https://physionet.org/content/eegmmidb/1.0.0/
- MOABB (documentacion de datasets): https://moabb.neurotechx.com/docs/
