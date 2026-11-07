# messykenty/ralomi-ja-enhanced

## Resumen

Ralomi JA Enhanced es una vista previa de desarrollo publicada por el usuario messykenty a partir del modelo de reconocimiento automático de voz (ASR) en japonés `ayousanz/ralomi`. No se trata de un modelo nuevo entrenado desde cero, sino de un repositorio experimental que empaqueta el modelo ONNX original junto con una conversión validada del grafo a PyTorch mediante `onnx2torch`, pensada para habilitar flujos de ajuste fino y entrenamiento que el artefacto ONNX original no permite de forma directa.

La arquitectura subyacente es un sistema ASR de tipo DFSMN (Deep Feedforward Sequential Memory Networks) con decodificación CTC, orientado a reconocimiento de voz en japonés y con el foco puesto en el despliegue en microcontroladores como el ESP32-S3 (etiqueta `esp32-s3` en el repositorio). El autor declara explícitamente que no se ha realizado ningún ajuste fino ni se reclama mejora de precisión alguna; el valor del repositorio es la infraestructura de conversión y validación numérica.

El modelo es relevante para quienes trabajan en ASR embebido en japonés y necesitan un puente entre el ecosistema ONNX Runtime y PyTorch para experimentar con retropropagación sobre un modelo ya entrenado. La licencia Apache 2.0 del modelo original se mantiene, y el repositorio se identifica como no oficial respecto al upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFSMN (Deep Feedforward Sequential Memory Networks) con CTC |
| Parametros totales | no disponible (18 tensores de parámetros entrenables según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) y state_dict de PyTorch (`models/ralomi-converted-state.pt`) |

## Arquitectura y entrenamiento

El modelo base `ayousanz/ralomi` es un sistema de reconocimiento automático de voz basado en DFSMN con salida CTC, una familia de redes feedforward con memoria secuencial diseñada para ser computacionalmente ligera en inferencia, lo que explica su idoneidad para despliegue en microcontroladores como el ESP32-S3. El repositorio derivado no aporta información sobre el volumen de datos de entrenamiento, la composición del corpus ni si hubo etapas de ajuste con RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La contribución técnica de esta vista previa es la conversión del grafo ONNX a un grafo PyTorch equivalente mediante `onnx2torch`, con validación numérica frente a ONNX Runtime: la diferencia absoluta máxima reportada es de 0,000072479 sobre una única entrada sintética de prueba. El autor confirma que la retropropagación funciona para 18 tensores de parámetros entrenables. Es importante subrayar que el state_dict convertido no es un modelo autónomo: su reconstrucción requiere el grafo ONNX original y una versión compatible de `onnx2torch`. No se ha ejecutado ningún ajuste fino ni se ha validado el despliegue del modelo PyTorch convertido en CoreS3.

## Capacidades

- Reconocimiento automático de voz en japonés mediante decodificación CTC.
- Inferencia a través de ONNX Runtime con el archivo `model.onnx` original.
- Extracción de características de audio mediante `features.py`.
- Tokenización basada en el vocabulario incluido en `vocabulary.json`.
- Conversión a PyTorch con retropropagación verificada sobre 18 tensores de parámetros.
- Orientación a despliegue en hardware embebido (etiqueta `esp32-s3`, mención a CoreS3).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.

## Casos de uso

- Experimentación con ajuste fino en PyTorch: el state_dict convertido y la retropropagación verificada permiten plantear ciclos de entrenamiento sobre el modelo base sin partir de un artefacto ONNX opaco, aunque el autor advierte que los flujos de entrenamiento siguen siendo experimentales.
- Reconocimiento de voz en japonés en dispositivos embebidos: la arquitectura DFSMN con CTC y la orientación explícita a ESP32-S3 lo sitúan como candidato para comandos de voz o transcripción local en microcontroladores con recursos muy limitados.
- Validación de pipelines de conversión ONNX a PyTorch: el script `scripts/convert_and_validate.py` sirve como referencia reproducible para verificar la equivalencia numérica entre ambos runtimes antes de invertir en un flujo de entrenamiento.
- Prototipado de interfaces de voz en japonés: el punto de entrada `inference.py` y la configuración `inference_config.json` permiten montar una demo de transcripción sin reimplementar el preprocesado de audio.
- Investigación sobre ASR de bajo consumo: útil para estudiar el compromiso entre tamaño de modelo, latencia y precisión en la familia DFSMN aplicada al japonés.
- Integración en cadenas de postprocesado lingüístico en japonés: la salida CTC puede alimentar etapas posteriores de normalización o corrección ortográfica en aplicaciones de subtitulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la precisión del modelo no ha sido evaluada de forma independiente y que no se reclama ninguna mejora de exactitud respecto al modelo base. El único dato numérico de rendimiento es la diferencia absoluta máxima de 0,000072479 entre la salida PyTorch convertida y ONNX Runtime sobre una entrada sintética, que mide equivalencia de conversión, no calidad ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica el número de parámetros ni el tamaño del grafo, y el tamaño del repo figura como 0.0 GB en los metadatos.
- GPU recomendadas: no disponibles; al tratarse de un modelo orientado a microcontroladores, es probable que la inferencia en CPU sea suficiente, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: ONNX Runtime para el archivo `model.onnx`; PyTorch con `onnx2torch` para el state_dict convertido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles. El despliegue en CoreS3 del modelo PyTorch convertido está declarado como no probado.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| messykenty/ralomi-ja-enhanced | ASR DFSMN + CTC | japonés | ONNX + state_dict PyTorch | Apache 2.0 | Vista previa de desarrollo, sin fine-tuning |
| ayousanz/ralomi | ASR DFSMN + CTC | japonés | ONNX | Apache 2.0 | Modelo base upstream |
| Otras alternativas ASR en japonés | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación significativa disponible es con el modelo base del que deriva, que comparte arquitectura y pesos y del que este repositorio solo se diferencia por la conversión a PyTorch y el andamiaje de validación.

## Limitaciones y advertencias

- No se ha realizado ajuste fino: el autor declara explícitamente que no hay mejora de precisión y que no se reclama ninguna.
- Precisión no evaluada de forma independiente: no existen benchmarks publicados de calidad ASR para este repositorio.
- El state_dict de PyTorch no es autónomo: requiere el grafo ONNX y una versión compatible de `onnx2torch` para reconstruirse.
- Despliegue en CoreS3 no probado: la viabilidad del modelo convertido en hardware embebido está sin verificar.
- Flujos de entrenamiento y exportación experimentales: no deben considerarse estables para producción.
- Validación numérica limitada: la equivalencia ONNX/PyTorch se comprobó sobre una única entrada sintética, no sobre un conjunto representativo de audio.
- Cobertura lingüística restringida al japonés; no hay soporte multilingüe documentado.
- Repositorio no oficial: no es una release upstream y su mantenimiento depende de un único autor, con cero descargas y cero likes en el momento de la ficha.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero sin garantías por parte del autor del derivado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/messykenty/ralomi-ja-enhanced
- Modelo base: https://huggingface.co/ayousanz/ralomi
- Perfil del autor: https://huggingface.co/messykenty
- Listado de modelos etiquetados como ralomi: https://huggingface.co/models?other=ralomi
