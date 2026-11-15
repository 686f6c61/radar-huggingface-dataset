# Phoonnx/coqui-vits-lt-cv-vits

## Resumen

`Phoonnx/coqui-vits-lt-cv-vits` es un modelo de sintesis de voz (text-to-speech) derivado del proyecto Coqui TTS, concretamente una variante VITS entrenada sobre el corpus Common Voice en lituano (`lt-LT`). Lo publica el usuario Phoonnx como parte de la coleccion `Phoonnx/phoonnx-coqui-vits`, que redistribuye modelos Coqui en formato ONNX para su uso con la libreria `phoonnx`, un runtime de inferencia TTS mantenido en el repositorio `TigreGotico/phoonnx`. El repositorio ocupa aproximadamente 0,1 GB y esta etiquetado con `pipeline_tag: text-to-speech` y `library_name: phoonnx`.

El modelo resuelve un problema acotado: ofrecer sintesis de voz en lituano en un formato portable (ONNX) que no depende del stack original de Coqui TTS, lo que facilita su integracion en aplicaciones que necesitan generar audio sin arrastrar dependencias pesadas de Python ni frameworks de deep learning completos. Su relevancia es practica mas que investigadora: amplia la cobertura de idiomas minoritarios en el ecosistema `phoonnx` y permite desplegar TTS lituano en entornos ligeros.

La informacion publicada es muy escasa: la model card se limita a indicar la procedencia (carpeta `lt-cv-vits` del repositorio matriz), la licencia BSD-3-Clause heredada y el identificador de voz `coqui/lt-cv-vits`. No se documentan parametros, contexto, arquitectura detallada ni metricas de calidad, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | lituano (`lt-LT`, segun la model card) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal end-to-end que combina un encoder de texto, un predictor de duracion, un normalizing flow condicional y un decoder generativo basado en HiFi-GAN, entrenado con perdidas adversarias y de reconstruccion. La variante concreta corresponde al modelo `coqui/lt-cv-vits` del catalogo de Coqui, entrenado sobre el corpus Common Voice en lituano. No se dispone de informacion sobre el numero de horas de audio, el numero de pasos de entrenamiento, la composicion exacta del dataset ni posibles fases de ajuste fino.

La publicacion de Phoonnx no reentrena el modelo: lo redistribuye en formato ONNX, preservando las rutas de ficheros del repositorio matriz `Phoonnx/phoonnx-coqui-vits`. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni similares), ya que no aplican a este tipo de modelo.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en lituano.
- Generacion de audio en formato ONNX, ejecutable con el runtime `phoonnx`.
- Identificador de voz `coqui/lt-cv-vits` para seleccionar el modelo dentro de la libreria.
- No se documenta soporte de control de prosodia, emocion, velocidad ni estilo.
- No se documenta soporte de clonacion de voz, multihablante ni voice conversion.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- Cobertura multilingue limitada al lituano segun la model card.

## Casos de uso

- Lectura de contenido en lituano: integrar el modelo en un lector de articulos o documentos para generar audio a partir de texto, aprovechando el formato ONNX para ejecutarlo en el navegador o en el servidor sin dependencias de Coqui TTS.
- Accesibilidad para hablantes de lituano: convertir texto de interfaces, notificaciones o mensajes en voz para usuarios con discapacidad visual, con un coste de despliegue bajo gracias al tamano reducido del repositorio (0,1 GB).
- Asistentes de voz locales: usar el modelo como capa TTS en un asistente que opere en lituano y requiera inferencia on-device o en entornos con recursos limitados.
- Audiolibros y podcasts automatizados: generar narraciones de textos largos en lituano dividiendo el texto en fragmentos y sintetizando cada uno con el modelo.
- Sistemas de anuncios y senaletica: producir avisos hablados en lituano para transporte publico, aeropuertos o comercios, donde la latencia y el coste por inferencia son criticos.
- Pruebas de integracion en pipelines de `phoonnx`: servir como modelo de referencia para validar el runtime y comparar el rendimiento de la exportacion ONNX frente al modelo original de Coqui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) es plausible que quepa en GPUs de gama baja e incluso en CPU, pero no hay datos confirmados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU y en GPUs consumer mediante ONNX Runtime, pero no se documenta.
- Opciones de despliegue: runtime `phoonnx` (libreria nativa del modelo) y, en general, cualquier runtime compatible con ONNX (ONNX Runtime, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-lt-cv-vits | lituano | VITS (Coqui TTS) | ONNX | BSD-3-Clause | Hugging Face |
| coqui/lt-cv-vits (original) | lituano | VITS (Coqui TTS) | PyTorch (checkpoint) | BSD-3-Clause | Coqui TTS model zoo |
| Otros modelos de la coleccion Phoonnx/phoonnx-coqui-vits | varios | VITS (Coqui TTS) | ONNX | BSD-3-Clause | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta parametros, datos de entrenamiento ni metricas de calidad, lo que dificulta evaluar su idoneidad para produccion.
- Calidad de sintesis desconocida: al derivar de Common Voice, la calidad puede verse limitada por la naturaleza del corpus (audio de voluntarios, ruido variable), aunque no hay confirmacion.
- Cobertura linguistica restringida al lituano; no se garantiza un comportamiento correcto con texto en otros idiomas o con mezcla de idiomas.
- Riesgo de errores de pronunciacion en nombres propios, siglas, numeros y palabras fuera del vocabulario del corpus de entrenamiento.
- Posibles sesgos derivados de la demografia de los voluntarios de Common Voice (edad, genero, acento regional), no documentados.
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion y sin endorsement; conviene conservar el aviso de copyright original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por la comunidad.
- No se documenta si el modelo soporta entradas largas; en TTS es habitual requerir fragmentacion del texto.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-lt-cv-vits
- Repositorio matriz: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
