# ailm32442/SoulX-Singer-onnx-fp16

## Resumen

SoulX-Singer es un sistema de síntesis de voz cantada (singing voice synthesis, SVS) desarrollado por Soul AI Lab y publicado bajo licencia Apache-2.0. El repositorio que nos ocupa, `ailm32442/SoulX-Singer-onnx-fp16`, no es un modelo entrenado desde cero, sino una exportación a ONNX en precisión fp16 del modelo original en PyTorch, dividida en 16 ficheros para su carga directa por el backend de síntesis de AI DAW. La exportación está pensada para DirectML y actúa como espejo internacional del paquete publicado en ModelScope.

La arquitectura subyacente es un pipeline completo de SVS compuesto por varios codificadores (texto de nota, pitch, tipo de nota y F0), un módulo de condicionamiento, un transformador a mel, un paso de difusión (`diff_step_dml`) y un vocoder neuronal. El peso dominante del paquete lo aportan el paso de difusión (unos 887 MB) y el vocoder (unos 519 MB), que juntos suponen más del 97 % de los 1,44 GB del repositorio.

La relevancia de esta ficha es práctica: permite ejecutar localmente un pipeline de síntesis de voz cantada sobre ONNX Runtime sin necesidad de PyTorch ni de GPU NVIDIA, algo poco habitual en el ecosistema SVS. No obstante, la información pública es muy limitada: no se detallan parámetros totales, contexto, idiomas ni benchmarks, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline SVS modular: codificadores de nota (texto, pitch, tipo), codificador F0, módulo de condicionamiento, transformador a mel, paso de difusión y vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (exportación ONNX); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con pesos externos `.onnx.data` (16 ficheros) |

## Arquitectura y entrenamiento

El paquete ONNX refleja un pipeline de síntesis cantada por etapas. Los codificadores `note_text_encoder`, `note_pitch_encoder` y `note_type_encoder` procesan la información simbólica de la partitura (texto de la nota, altura y tipo), mientras que `f0_encoder` incorpora la curva de frecuencia fundamental. `cond_emb` genera el condicionamiento global, `preflow` prepara la representación latente y `mel_transform` produce la representación mel. La generación final del audio se reparte entre `diff_step_dml`, un paso de difusión de unos 887 MB, y `vocoder_dml`, de unos 519 MB, que convierte la representación mel en forma de onda.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF o DPO ni innovaciones técnicas específicas del entrenamiento original. La model card únicamente documenta el proceso de exportación: los 16 ficheros deben residir en el mismo directorio, ya que ONNX Runtime localiza los pesos externos `.onnx.data` mediante rutas relativas registradas dentro de cada `.onnx`; separarlos provoca fallo de carga. La exportación está orientada a DirectML, lo que sugiere ejecución en Windows con aceleración por GPU vía DirectX 12.

## Capacidades

- Síntesis de voz cantada a partir de una partitura simbólica (notas con texto, pitch y tipo) y una curva F0.
- Generación de audio mediante difusión más vocoder neuronal, con salida en forma de onda.
- Carga directa en ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Ejecución con aceleración DirectML, lo que permite usar GPUs no NVIDIA en Windows.
- Integración como backend de síntesis en AI DAW.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión, audio de entrada ni modo thinking; no es un modelo de lenguaje general.

## Casos de uso

- Producción musical asistida por ordenador: integración del pipeline como backend de voz cantada en un DAW, generando pistas vocales a partir de una partitura MIDI con letra y pitch definidos.
- Prototipado rápido de demos vocales: compositores que necesitan una maqueta cantada antes de contratar un vocalista, aprovechando la inferencia local sin servicios en la nube.
- Despliegue en Windows con GPU consumer: gracias a DirectML, el pipeline puede ejecutarse en equipos sin CUDA, ampliando el parque de máquinas compatibles frente a alternativas PyTorch.
- Investigación en SVS: el desglose en 16 módulos ONNX facilita el análisis y la sustitución de etapas concretas (por ejemplo, probar otro vocoder o aislar el paso de difusión).
- Aplicaciones educativas de tecnología musical: demostraciones de síntesis cantada en entornos con hardware modesto y sin dependencias pesadas.
- Distribución offline: al ser un paquete autocontenido de 1,44 GB con checksums publicados, puede empaquetarse en instaladores o contenedores para uso sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del paquete: 1,44 GB en disco; requiere los 16 ficheros en el mismo directorio.
- Memoria: el paso de difusión (887 MB) y el vocoder (519 MB) son los módulos dominantes; en fp16, la VRAM necesaria para cargarlos completos ronda los 1,4 GB, más el overhead de activaciones y del runtime (no cuantificado en la documentación).
- GPU: la exportación está orientada a DirectML, por lo que se espera compatibilidad con GPUs AMD, Intel y NVIDIA bajo Windows; no se documentan modelos concretos recomendados.
- GPU consumer: por tamaño, es plausible su ejecución en GPUs consumer con 4 GB o más de VRAM, aunque no hay confirmación oficial.
- Despliegue: ONNX Runtime (con proveedor DirectML); la librería declarada es `onnxruntime`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| SoulX-Singer (ONNX fp16, este repo) | SVS completo con difusión y vocoder | ONNX fp16 con pesos externos | Apache-2.0 | HuggingFace y ModelScope |
| SoulX-Singer (upstream) | SVS completo | PyTorch | Apache-2.0 | HuggingFace (Soul-AILab) |
| SoulX-Singer ONNX DirectML (ModelScope) | SVS completo | ONNX fp16 | Apache-2.0 | ModelScope |

No se dispone de datos de benchmarks ni de especificaciones comparables de otros sistemas SVS en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos de parámetros, contexto, idiomas ni evaluación de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Los 16 ficheros deben mantenerse juntos; mover o renombrar un `.onnx.data` rompe la carga.
- La exportación está orientada a DirectML; el comportamiento en otros proveedores de ejecución de ONNX Runtime no está documentado.
- Riesgo de artefactos o alucinaciones vocales inherente a los sistemas generativos de audio; no se documentan evaluaciones de calidad subjetiva (MOS).
- Posibles sesgos en el timbre o estilo vocal según los datos de entrenamiento originales, no documentados.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo upstream y de los datos de entrenamiento.
- No apto para clonación de voz no consentida ni para suplantación de identidad; la model card no incluye salvaguardas explícitas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailm32442/SoulX-Singer-onnx-fp16
- Modelo upstream en PyTorch: https://huggingface.co/Soul-AILab/SoulX-Singer
- Repositorio GitHub de SoulX-Singer: https://github.com/Soul-AILab/SoulX-Singer
- Exportación ONNX en ModelScope: https://modelscope.cn/models/syxppp/SoulX-Singer-onnx-directml-fp16
- AI DAW (consumidor del paquete): https://github.com/heshengtao/ai-daw
