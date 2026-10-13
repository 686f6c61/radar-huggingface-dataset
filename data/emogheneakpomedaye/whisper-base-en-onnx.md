# EmogheneAkpomedaye/Whisper-Base-EN-ONNX

## Resumen

Whisper-Base-EN-ONNX es una conversion a formato ONNX del modelo openai/whisper-base.en, publicada por el usuario EmogheneAkpomedaye en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una exportacion de los pesos del modelo base de OpenAI a ONNX con el objetivo de que sea compatible con Transformers.js y, por extension, con inferencia de reconocimiento automatico del habla (ASR) directamente en el navegador o en entornos JavaScript/Node.

El modelo hereda las caracteristicas del whisper-base.en original: una arquitectura Transformer encoder-decoder de tipo secuencia-a-secuencia, con aproximadamente 74 millones de parametros, especializada en transcripcion de audio en ingles. El repositorio tiene un tamano de 2,2 GB, coherente con la inclusion de varios ficheros ONNX (encoder y decoder, probablemente en distintas precisiones).

Su relevancia es practica: permite desplegar ASR en el cliente sin dependencia de servidores, gracias al ecosistema Transformers.js y ONNX Runtime Web. La model card es minima y no documenta licencia, idiomas ni detalles de conversion, por lo que cualquier uso en produccion debe verificar primero estos extremos contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) |
| Parametros totales | ~74 millones (heredados de openai/whisper-base.en) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (caracteristica de Whisper); longitud de contexto de texto no disponible |
| Tipos de cuantizacion | pesos ONNX; el tag del modelo base indica `base_model:quantized:openai/whisper-base.en`; precisiones concretas no disponibles |
| Idiomas soportados | ingles (modelo variante `.en`, solo ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Whisper: un Transformer encoder-decoder entrenado con supervision debil a gran escala. El encoder procesa representaciones log-Mel del audio en ventanas de 30 segundos y el decoder genera la transcripcion de forma autorregresiva. El modelo cuenta con unos 74 millones de parametros, segun la informacion publica del modelo base. No se dispone de detalles sobre el proceso de exportacion a ONNX realizado por el autor: no se documentan las precisiones generadas, el uso de herramientas como Optimum, ni si se aplicaron optimizaciones adicionales.

Respecto al entrenamiento original de whisper-base.en, la informacion disponible indica que OpenAI lo entreno sobre aproximadamente 680.000 horas de audio etiquetado, combinando datos supervisados y no supervisados. No se han facilitado en esta ficha detalles sobre composicion exacta del dataset, fases de RLHF o DPO, ni innovaciones adicionales del modelo base mas alla de la propia arquitectura secuencia-a-secuencia estandar de Whisper.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio en ingles a texto.
- Ejecucion en navegador mediante Transformers.js, sin backend de inferencia dedicado.
- Ejecucion con ONNX Runtime en entornos JavaScript/Node.
- Procesamiento por ventanas de audio de 30 segundos, propio de la familia Whisper.
- Modelo solo en ingles: no soporta traduccion a otros idiomas ni ASR multilingue.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio generativo ni modos de "thinking".
- No se documentan marcas de tiempo a nivel de palabra ni diarizacion de hablantes.

## Casos de uso

- Transcripcion local en el navegador: integrar el modelo con Transformers.js para transcribir grabaciones de audio en ingles directamente en el cliente, evitando enviar datos de voz a servidores externos y reduciendo costes de infraestructura.
- Subtitulado automatico de contenido en ingles: dado el tamano reducido (74 M de parametros) y su formato ONNX, puede usarse como primer paso en pipelines de generacion de subtitulos, con el texto posteriormente procesado por otro modelo para segmentacion o formato SRT/VTT.
- Prototipado rapido de aplicaciones web de voz: al ser compatible con ONNX, encaja en demos y pruebas de concepto en JavaScript sin necesidad de configurar CUDA ni servidores GPU.
- Procesamiento por lotes de audio en Node.js: transcripcion de ficheros de audio almacenados en disco usando ONNX Runtime, aprovechando el bajo coste computacional de un modelo base en CPU o GPU de gama baja.
- Aplicaciones de accesibilidad offline: generacion de transcripciones en tiempo casi real para personas con dificultades auditivas en entornos sin conectividad, siempre que el audio sea en ingles.
- Preprocesado de datos de voz para entrenamiento: transcripcion masiva de corpus de audio en ingles para generar etiquetas preliminares que se revisaran manualmente antes de usarse como datos de entrenamiento.
- Automatizacion de notas de reuniones en ingles: captura y transcripcion de reuniones en aplicaciones de escritorio basadas en Electron o similares, ejecutando el modelo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (WER, MMLU ni otras) y las busquedas web consultadas no aportan resultados numericos concretos para esta conversion ONNX. No debe asumirse un WER equivalente al del modelo original sin verificacion experimental.

## Requisitos de hardware

- VRAM estimada: con pesos fp32 en torno a 300 MB; en fp16 aproximadamente 150 MB; las variantes cuantizadas reduce la cifra por debajo de 100 MB. El tamano del repo (2,2 GB) sugiere que se incluyen varias precisiones, no que el modelo en ejecucion consuma ese total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una GTX 1050 o integradas modernas pueden ejecutarlo en fp16/int8.
- GPU de gama alta (A100, H100, RTX 4090): innecesarias para un modelo de este tamano; solo tienen sentido si se procesan muchas horas de audio en paralelo con un batch elevado.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo actual y en la mayoria de iGPU. Tambien puede ejecutarse en CPU con latencias aceptables para audio corto.
- Opciones de despliegue: Transformers.js (principal, segun el tag del repositorio), ONNX Runtime Web, ONNX Runtime en Node.js, y en general cualquier runtime que consuma grafos ONNX. Para el modelo base, tambien las librerias habituales de Whisper en Python.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia generica de la familia Whisper, el tamano `base` es uno de los mas rapidos de la gama, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmogheneAkpomedaye/Whisper-Base-EN-ONNX | ~74 M | Ingles | ventanas de 30 s | ONNX | no disponible | HuggingFace (0 descargas, 0 likes) |
| openai/whisper-base.en | ~74 M | Ingles | ventanas de 30 s | safetensors/PyTorch | MIT (modelo base de OpenAI) | HuggingFace |
| openai/whisper-base | ~74 M | Multilingue | ventanas de 30 s | safetensors/PyTorch | MIT | HuggingFace |
| onnx-community/whisper-base | ~74 M | Multilingue | ventanas de 30 s | ONNX | no disponible en la informacion consultada | HuggingFace |

Nota: la licencia exacta de las conversiones ONNX de la comunidad debe verificarse en cada repositorio, ya que la model card del repositorio analizado no la declara.

## Limitaciones y advertencias

- Idioma: al derivar de `whisper-base.en`, solo reconoce ingles; no transcribe ni traduce otros idiomas.
- Licencia: el repositorio no declara licencia, lo que impide confirmar las condiciones de uso comercial. Es imprescindible verificarla contra el modelo base (openai/whisper-base.en) antes de cualquier despliegue en produccion.
- Alucinaciones: la familia Whisper es conocida por generar texto plausible en silencios, ruido o audio musical, especialmente cuando el audio no contiene habla clara. Este riesgo persiste en la conversion.
- Precisión: el tamano `base` es el segundo mas pequeno de Whisper y ofrece un WER notablemente superior (peor) que `small`, `medium` o `large`; no es adecuado para transcripciones que requieran alta fidelidad.
- Sesgos: al entrenarse con datos de audio mayoritariamente de determinadas variedades del ingles, puede rendir peor con acentos no representados en el corpus original.
- Reputacion del repositorio: 0 descargas y 0 likes, sin documentacion adicional; no hay evidencia de validacion por parte de la comunidad.
- Procesamiento por ventanas: el audio se trocea en segmentos de 30 segundos, lo que puede introducir cortes o perdida de contexto en conversaciones largas si no se gestiona cuidadosamente.
- Fecha de creacion del repositorio inusualmente avanzada (2026) en los metadatos, lo que conviene contrastar antes de confiar en la trazabilidad del artefacto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/EmogheneAkpomedaye/Whisper-Base-EN-ONNX
- Modelo base original: https://huggingface.co/openai/whisper-base.en
- Conversion ONNX de la comunidad (multilingue): https://huggingface.co/onnx-community/whisper-base
- Modelos Whisper ONNX (proyecto Echogarden): https://github.com/echogarden-project/whisper-onnx-models
- Documentacion de Optimum: https://huggingface.co/docs/optimum/index
- Ficha informativa sobre whisper-base.en: https://www.aimodels.fyi/models/huggingFace/whisper-base.en-openai
- Referencia adicional en Inferix: https://inferix.co/models/onnx-community/whisper-base.en
