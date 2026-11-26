# finisher-editor/finisher-parakeet-tdt-0.6b-v2-onnx

## Resumen

Finisher Parakeet-TDT 0.6B v2 ONNX es una conversión a formato ONNX del modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-0.6b-v2`, publicada por el proyecto Finisher bajo el identificador `finisher-editor`. No se trata de un modelo entrenado desde cero, sino de una exportación fiel de los pesos originales de NVIDIA (sin cuantización, en fp32) para integrarse en el plugin `@finisher/speech`, concretamente como su modelo para inglés (`en`).

El modelo subyacente es un sistema ASR de arquitectura FastConformer (encoder) con decodificador TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parámetros y especializado en transcripción de voz en inglés. La conversión conserva el vocabulario (`tokenizer.vocab`) y la configuración (`model_config.yaml`) del checkpoint NeMo original, y únicamente transforma el encoder y el decodificador conjunto a grafos ONNX (opset 17).

Su relevancia radica en que permite ejecutar un modelo ASR de calidad de producción de NVIDIA en entornos basados en ONNX Runtime, sin dependencia del stack NeMo/PyTorch en tiempo de inferencia. La licencia es CC-BY-4.0, heredada del modelo original, con la atribución correspondiente a NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decoder joint) |
| Parametros totales | ~0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (sin cuantizacion en esta exportacion) |
| Idiomas soportados | ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (opset 17), con pesos externos en `encoder.onnx.data`; incluye `tokenizer.vocab` y `model_config.yaml` |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de tipo transducer: un encoder FastConformer procesa la señal de audio y un decodificador TDT (Token-and-Duration Transducer) genera tokens junto con predicciones de duración, lo que permite un alineamiento eficiente y decodificacion no autorregresiva por pasos. La exportacion a ONNX separa dos grafos: `encoder.onnx` (con pesos externos en `encoder.onnx.data`) y `decoder_joint.onnx`, ambos generados mediante `ASRModel.export` de NeMo Toolkit 3.0.0 en fp32 y opset 17.

El entrenamiento original lo realizo NVIDIA sobre el dataset Granary, con aproximadamente 120.000 horas de audio en ingles. El proyecto Finisher no entreno el modelo: solo realizo la conversion, verificada con comprobaciones de SHA-256 de los ficheros de origen y una validacion numerica frente al modulo PyTorch (diferencias maximas absolutas del orden de 1e-05 a 1e-06, muy por debajo del limite de 1e-03). Los pesos son identicos a los del checkpoint `.nemo` original.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles: transcripcion de audio a texto.
- Decodificacion TDT con prediccion de duraciones de token, adecuada para transcripcion en streaming o por lotes.
- Ejecucion via ONNX Runtime, sin requerir PyTorch ni NeMo en inferencia.
- Integracion como modelo `en` del plugin `@finisher/speech`.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes; el modelo es exclusivamente ASR.
- Capacidades multilingues: no disponibles (solo ingles segun la model card).

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo convierte audio en texto de forma local mediante ONNX Runtime, lo que facilita el despliegue en servidores sin stack PyTorch.
- Subtitulado automatico de contenido audiovisual en ingles: la salida token a token con duraciones TDT permite generar marcas temporales para subtitulos.
- Dictado por voz en aplicaciones de escritorio o web: al ejecutarse sobre ONNX Runtime, puede integrarse en entornos ligeros y multiplataforma.
- Indexacion y busqueda de archivos de audio: transcripcion masiva por lotes para hacer buscable el contenido hablado de un archivo de podcasts o grabaciones.
- Asistentes de voz y comandos hablados en ingles: la transcripcion se puede encadenar con un modulo de NLU o un LLM para construir pipelines de voz a texto.
- Analitica de centros de contacto: transcripcion de llamadas en ingles para su posterior analisis de calidad y extraccion de metricas.
- Prototipado rapido de pipelines ASR: al estar en ONNX, sirve como bloque de referencia para comparar frente a otros motores ASR en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la validacion de la conversion (diferencias numericas frente a PyTorch), no metricas de calidad ASR como WER.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,5 GB y los pesos en fp32 suman unos 2,47 GB, por lo que se requiere aproximadamente 2,5-3 GB de memoria para cargar los grafos (sin contar buffers de activacion).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con los grafos `encoder.onnx` y `decoder_joint.onnx`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| finisher-parakeet-tdt-0.6b-v2-onnx | ~0,6B | no disponible | ingles | CC-BY-4.0 | ONNX |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6B | no disponible | ingles | CC-BY-4.0 | NeMo (.nemo) |
| Whisper (variantes) | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita al modelo original de NVIDIA, del que esta exportacion es una conversion directa con pesos identicos. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otras alternativas ASR.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- Es una conversion, no un modelo nuevo: cualquier sesgo o limitacion del modelo original de NVIDIA se hereda intacto.
- Riesgo de alucinacion y errores de transcripcion inherentes a los sistemas ASR, especialmente con audio ruidoso, acentos marcados o vocabulario tecnico.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion a NVIDIA y al proyecto Finisher, e indica los cambios realizados (conversion a ONNX).
- El modelo se distribuye sin garantias (CC BY 4.0, seccion 5).
- No se documentan requisitos de contexto de audio, latencia ni limites de duracion de entrada; conviene validar el comportamiento en produccion antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finisher-editor/finisher-parakeet-tdt-0.6b-v2-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio Finisher (referenciado en la model card): no disponible como URL directa en la informacion proporcionada
