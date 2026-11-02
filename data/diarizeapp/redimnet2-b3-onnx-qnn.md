# diarizeapp/redimnet2-b3-onnx-qnn

## Resumen

ReDimNet2-B3 es un modelo de extracción de embeddings de locutor (speaker embeddings) orientado a tareas de diarización y verificación de hablantes. Lo publica el usuario `diarizeapp` en HuggingFace y esta versión concreta se distribuye en formato ONNX optimizado para ejecución en NPU (Qualcomm Hexagon HTP y DirectML), además de CPU. El modelo se basa en la arquitectura ReDimNet2, una familia de redes diseñada para producir representaciones de locutor invariantes a la duración del audio de entrada.

El problema que resuelve es el de obtener una huella digital compacta y discriminativa de la voz de una persona, que luego se usa para agrupar segmentos de audio por hablante (diarización) o para comprobar si dos fragmentos pertenecen a la misma persona (verificación). Al ofrecer una variante que acepta directamente representaciones de filterbank precalculadas, evita el cálculo de STFT dentro del grafo y facilita el offload a aceleradores de bajo consumo.

La relevancia actual viene de la demanda de diarización en tiempo real en dispositivos (reuniones, transcripción local, asistentes), donde ejecutar el extractor de embeddings en NPU reduce consumo y latencia frente a CPU o GPU. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReDimNet2 (red neuronal para embeddings de locutor, familia ReDimNet2-B3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; opera sobre frames de filterbank o muestras de waveform) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se menciona optimización para QNN/NPU, sin detallar cuantizaciones) |
| Idiomas soportados | en, multilingual (según tags de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`redimnet2_b3_lm_fbank.onnx`, `redimnet2_b3_lm.onnx`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como ReDimNet2-B3, dentro de la familia ReDimNet2 para extracción de embeddings de locutor. Se ofrecen dos grafos ONNX: uno que recibe la waveform completa con forma `[batch, 1, samples]` y otro que recibe representaciones de filterbank de 72 canales con forma `[batch, 1, 72, frames]`. Esta segunda variante es "STFT-free" en el sentido de que la transformada se calcula fuera del grafo, lo que simplifica el despliegue en NPU y DirectML.

No se detallan en la información disponible el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o horas de audio, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente a embeddings de locutor). Tampoco se especifican innovaciones de decodificación o atención más allá de la invariancia a duración que declara el autor.

## Capacidades

- Extracción de embeddings de locutor a partir de audio (waveform) o de filterbanks de 72 canales precalculados.
- Diarización de hablantes: agrupación de segmentos por identidad de locutor.
- Verificación de locutor: comparación de embeddings para decidir si dos fragmentos corresponden a la misma persona.
- Invariancia a la duración del audio de entrada, según declara el autor.
- Ejecución en CPU y offload a NPU (Qualcomm Hexagon HTP) y DirectML.
- Soporte multilingüe declarado en los tags, con `en` listado explícitamente.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Diarización en reuniones y transcripción: el modelo genera embeddings por segmento que un algoritmo de clustering agrupa por hablante, permitiendo etiquetar "quién dijo qué" en actas automáticas.
- Verificación biométrica de voz: comparar el embedding de una frase con el de un locutor registrado para control de acceso o autenticación, con la ventaja de ejecución en NPU en dispositivos.
- Transcripción con etiquetas de hablante en local: integrado en pipelines de ASR en portátiles o móviles, el extractor corre en Hexagon HTP o DirectML sin depender de la nube.
- Análisis de llamadas de atención al cliente: separar cliente y agente en grabaciones y calcular estadísticas de habla por participante.
- Indexación y búsqueda por voz en archivos de audio: generar un embedding por segmento y construir un índice vectorial para localizar intervenciones de una persona concreta.
- Investigación en procesamiento de habla: uso como extractor de características para experimentos de separación, clustering y evaluación de sistemas de diarización.
- Sistemas embebidos de bajo consumo: al aceptar filterbanks precalculados, se puede repartir el front-end en CPU y el extractor en NPU, reduciendo el consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo figura como 0.0 GB en HuggingFace, lo que impide estimar a partir de los pesos publicados).
- GPU recomendadas: no se especifican; el modelo está orientado a CPU, NPU Qualcomm Hexagon HTP y DirectML (GPU en Windows).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime, con ejecución en CPU, proveedor QNN para Hexagon HTP y proveedor DirectML.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReDimNet2-B3 (este) | no disponible | waveform o filterbank 72 canales | Apache 2.0 | ONNX | Optimizado para NPU/DirectML |
| Modelos de la familia ReDimNet2 (otras tallas) | no disponible | audio | no disponible | no disponible | No se dispone de datos en la información proporcionada |
| Alternativas de speaker embedding (p. ej. ECAPA-TDNN, WavLM-based) | no disponible | audio | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No hay datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un modelo de voz, puede heredar sesgos de los datos de entrenamiento (no especificados) en precisión por género, edad o acento.
- Riesgo de confusión entre locutores con voces similares; la verificación debe combinarse con umbrales calibrados y, en entornos sensibles, con factores adicionales.
- El rendimiento fuera de las condiciones de entrenamiento (ruido, canales telefónicos, reverberación) no está documentado.
- Aunque se declara multilingüe, solo `en` figura explícitamente; la cobertura real por idioma no está cuantificada.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni se documentan limitaciones éticas o de consentimiento para grabación de voz.
- El repo figura con tamaño 0.0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar aún publicados o la información de HuggingFace está incompleta; conviene verificar la disponibilidad real de los ficheros ONNX antes de integrarlo en producción.
- No se especifican requisitos de versión de ONNX Runtime ni de los proveedores QNN/DirectML, lo que puede complicar el despliegue reproducible.

## Enlaces

- HuggingFace: https://huggingface.co/diarizeapp/redimnet2-b3-onnx-qnn
