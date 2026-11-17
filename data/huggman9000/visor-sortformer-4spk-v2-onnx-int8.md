# Huggman9000/visor-sortformer-4spk-v2-onnx-int8

## Resumen

Visor Sortformer 4spk v2 ONNX INT8 es una exportación a ONNX con cuantización de pesos a 8 bits del modelo de diarización de hablantes en streaming `nvidia/diar_streaming_sortformer_4spk-v2` de NVIDIA, publicada por el usuario Huggman9000. No es un modelo entrenado desde cero: el repositorio únicamente convierte y cuantiza el modelo original (cuantización dinámica de ONNX Runtime sobre operaciones MatMul y Gemm) para su uso en dispositivos móviles dentro de la aplicación Android Visor. El objetivo es ejecutar diarización de hasta cuatro hablantes en local, sin depender de servidores, manteniendo una precisión prácticamente idéntica a la implementación de referencia en PyTorch.

El resultado es un único fichero de unos 142 MB (`sortformer-dyn.int8.onnx`) que conserva el grafo de exportación en streaming de NeMo (`forward_for_export`), con ejes temporales libres, lo que permite pasos de streaming cortos en lugar de los 15 segundos por defecto de NVIDIA. La entrada son características log-mel de 128 bins a 16 kHz (ventana de 25 ms cada 10 ms, sin pre-énfasis ni normalización), y el host debe mantener entre llamadas la caché de hablantes y la FIFO, replicando la lógica `streaming_update` de NeMo.

Es relevante para desarrolladores que necesiten diarización en tiempo real en hardware modesto: el autor reporta unos 0,15 segundos por paso con 2 hilos de CPU en un PC de escritorio, y una tasa de acierto de habla etiquetada correctamente del 74-78 % en el tramo evaluado de la reunión AMI ES2004a con micrófono de sala, comparable o ligeramente superior a la referencia NeMo (73-76 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (modelo de diarizacion en streaming de NVIDIA, exportado desde NeMo); detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa audio en pasos de streaming configurables (p. ej. chunk 38, contexto derecho 7, FIFO 188, periodo de actualizacion 144; por defecto en NVIDIA, pasos de 15 s) |
| Tipos de cuantizacion | INT8 dinamica de ONNX Runtime (solo MatMul/Gemm); fichero unico de ~142 MB |
| Idiomas soportados | no disponible (la diarizacion es independiente del idioma en principio, pero no se declara) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`sortformer-dyn.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es el diarizador Sortformer en streaming de NVIDIA para hasta cuatro hablantes, del que este repositorio es una conversión, no un reentrenamiento ni un ajuste fino. La arquitectura concreta (capas, dimensión, atención) no se detalla en la información disponible; lo que sí se documenta es el grafo de exportación: entradas `chunk`, `chunk_lengths`, `spkcache`, `spkcache_lengths`, `fifo` y `fifo_lengths`, y salidas `spkcache_fifo_chunk_preds`, `chunk_pre_encode_embs` y `chunk_pre_encode_lengths`. El estado conversacional (caché de hablantes y FIFO) se gestiona en el host, no dentro del grafo.

El preprocesado es fijo: 128 bins log-mel, ventana de 25 ms con salto de 10 ms, frecuencia de muestreo de 16 kHz, sin pre-énfasis y sin normalización. La innovación práctica de esta conversión es que todos los ejes temporales son libres, lo que habilita pasos de streaming cortos (1 s o 3 s) con la misma precisión que los pasos de 15 s por defecto, algo útil en aplicaciones móviles que necesitan actualizaciones frecuentes. No se documentan datos de entrenamiento, composición del dataset ni uso de RLHF/DPO, ya que corresponden al modelo original de NVIDIA y no se reproducen aquí.

## Capacidades

- Diarizacion de hablantes en streaming para hasta cuatro hablantes simultaneos.
- Funcionamiento en linea con pasos cortos (probado a 1 s, 3 s y 15 s) manteniendo el estado entre llamadas.
- Inferencia en CPU: ~0,15 s por paso con 2 hilos en un PC de escritorio.
- Ejecucion en dispositivo (Android, app Visor) gracias al formato ONNX INT8 de ~142 MB.
- Entrada de audio a 16 kHz con extraccion log-mel de 128 bins realizada por el host.
- No se documentan capacidades de generacion de texto, codigo, vision, tool calling ni agentes; es un modelo puramente de diarizacion.

## Casos de uso

- Diarizacion en directo en aplicaciones moviles: integrado en la app Android Visor, el modelo procesa audio del microfono en pasos de 1-3 s y etiqueta cada fragmento con el hablante correspondiente sin enviar audio a la nube.
- Transcripcion de reuniones con atribucion de hablante: combinado con un ASR, permite generar actas que indiquen quien dijo que, usando pasos de streaming cortos para actualizar etiquetas casi en tiempo real.
- Notas de voz y grabaciones de entrevistas: al ser un fichero ONNX de 142 MB, puede empaquetarse en una app de escritorio o movil que diarize grabaciones localmente sin GPU.
- Analisis de llamadas de atencion al cliente: separar cliente y agente en grabaciones de telefonia (previa remuestreo a 16 kHz) para medir tiempos de habla y turnos.
- Investigacion en diarizacion: servir como referencia cuantizada y portable para comparar pipelines ONNX frente a NeMo/PyTorch en entornos sin GPU.
- Prototipado en entornos embebidos o de bajo consumo: al ejecutarse en CPU con 2 hilos, encaja en dispositivos tipo mini-PC o Raspberry Pi para pruebas de concepto de diarizacion continua.

## Benchmarks y rendimiento

Evaluacion del autor en la reunion AMI ES2004a (microfono de sala, dos tramos de 5 minutos), porcentaje de habla etiquetada con el hablante correcto:

| Configuracion | NeMo (PyTorch) | Este fichero ONNX INT8 |
|---|---|---|
| Por defecto (pasos de 15 s) | 73-76 % | 74-78 % |
| Cada 3 s | no disponible | 74-78 % |
| Cada 1 s | no disponible | 74-78 % |

Latencia reportada: aproximadamente 0,15 s por paso con 2 hilos de CPU en un PC de escritorio. No se han publicado otros benchmarks (DER, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU mediante ONNX Runtime. El fichero ocupa unos 142 MB en disco y en memoria.
- GPU recomendadas: no se documentan; el proposito es ejecucion en dispositivo sin GPU.
- Compatibilidad con GPU de consumo: no se indica soporte ni pruebas con GPU (RTX 4090, etc.).
- Despliegue: ONNX Runtime (cuantizacion dinamica INT8); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~0,15 s por paso con 2 hilos de CPU de escritorio; no se documenta throughput agregado ni latencia en moviles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Precision reportada | Licencia | Formato |
|---|---|---|---|---|---|
| Visor Sortformer 4spk v2 ONNX INT8 (este) | no disponible | Pasos libres (1 s, 3 s, 15 s) | 74-78 % en AMI ES2004a | CC BY 4.0 | ONNX INT8 |
| nvidia/diar_streaming_sortformer_4spk-v2 | no disponible | Pasos de 15 s por defecto | 73-76 % en AMI ES2004a | CC BY 4.0 | PyTorch (NeMo) |
| Otros diarizadores (pyannote, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base de NVIDIA, ya que la informacion proporcionada no incluye datos de otras alternativas de diarizacion.

## Limitaciones y advertencias

- Maximo de cuatro hablantes simultaneos; no se documenta comportamiento con mas.
- Precision medida en un unico tramo de una reunion AMI (ES2004a) con microfono de sala; no hay evaluacion amplia de DER ni en otros dominios (telefonia, audio ruidoso).
- El host debe implementar correctamente la gestion de estado (`streaming_update`: cache de hablantes y FIFO); un error en esa logica degrada la diarizacion.
- Preprocesado estricto: 16 kHz, 128 bins log-mel, ventana de 25 ms cada 10 ms, sin pre-enfasis ni normalizacion; desviarse de estas condiciones puede alterar los resultados.
- La cuantizacion INT8 puede introducir diferencias frente al modelo original en condiciones no evaluadas.
- Licencia CC BY 4.0: permite uso comercial con atribucion a NVIDIA; el repositorio de conversion no anade restricciones, pero debe citarse el modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente.
- No se declaran idiomas soportados ni sesgos conocidos; al ser diarizacion, el riesgo de alucinacion de contenido no aplica, pero si el de asignacion erronea de hablante en solapamientos o ruido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Huggman9000/visor-sortformer-4spk-v2-onnx-int8
- Modelo base: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Cita del autor: NVIDIA, *Streaming Sortformer Diarizer 4spk v2* (2025)
