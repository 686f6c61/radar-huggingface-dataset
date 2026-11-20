# mahmoudelwany7/whisper-base-ar-quran

## Resumen

`mahmoudelwany7/whisper-base-ar-quran` es una copia sin modificaciones del modelo ONNX `eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran`, que a su vez es la conversion a ONNX de `tarteel-ai/whisper-base-ar-quran` de Tarteel AI. Se trata, por tanto, de un modelo de reconocimiento automatico del habla (ASR) especializado en arabe coranico, derivado de la arquitectura Whisper de OpenAI en su variante `base` (aproximadamente 74 millones de parametros). El autor del repositorio, `mahmoudelwany7`, lo mantiene para una aplicacion concreta: la verificacion de palabras del Coran en el navegador, desarrollada por Watazawwado Academy.

El problema que resuelve es la transcripcion de recitacion coranica en arabe con un vocabulario y una fonetica especificos que los modelos Whisper genericos no cubren con precision. Al estar convertido a ONNX y empaquetado para `transformers.js`, el modelo puede ejecutarse integramente en el navegador del cliente mediante WebAssembly o WebGPU, sin necesidad de backend ni de enviar audio a un servidor. Esto lo hace relevante para aplicaciones educativas, de memorizacion (hifz) y de correccion de recitacion que requieren privacidad y baja latencia.

La ficha se basa unicamente en la informacion disponible en Hugging Face y en la model card del autor. No se han publicado detalles adicionales sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | aproximadamente 74 millones (derivado de Whisper base; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | arabe (ar), orientado a arabe coranico |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (para transformers.js) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atencion multi-cabeza, disenado originalmente para ASR multitarea y multilingue. La variante `base` de Whisper tiene aproximadamente 74 millones de parametros y procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel. En este caso, el modelo ha sido adaptado por Tarteel AI al dominio del arabe coranico, aunque la model card no detalla el corpus de entrenamiento, el numero de horas de audio ni si se aplicaron tecnicas de aumento de datos o ajuste fino supervisado.

La innovacion principal de este repositorio no esta en el entrenamiento, sino en el empaquetado: la conversion a ONNX permite la inferencia en el navegador mediante `transformers.js`, lo que habilita aplicaciones web sin servidor. No se dispone de informacion sobre el proceso exacto de conversion, la version de ONNX Runtime utilizada ni posibles optimizaciones de grafo.

## Capacidades

- Reconocimiento automatico del habla en arabe, con especializacion en recitacion coranica.
- Transcripcion de audio a texto con alineacion a nivel de palabra (segun el caso de uso declarado de verificacion de palabras).
- Ejecucion en el navegador mediante `transformers.js` y ONNX Runtime Web.
- Procesamiento local sin envio de audio a servidores externos.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha documentado soporte multilingue mas alla del arabe.
- No se ha documentado soporte de vision, audio de entrada mas alla de ASR ni modos de pensamiento.

## Casos de uso

- Verificacion de recitacion coranica en el navegador: el modelo transcribe el audio del usuario y permite comparar palabra a palabra con el texto esperado, todo localmente, lo que es adecuado para aplicaciones de hifz y aprendizaje.
- Aplicaciones educativas offline: al ejecutarse en el cliente, puede integrarse en plataformas de ensenanza del Coran que funcionan sin conexion o con conectividad limitada.
- Correccion de pronunciacion: la transcripcion a nivel de palabra permite detectar errores de recitacion y ofrecer retroalimentacion inmediata.
- Herramientas de accesibilidad: transcripcion de recitaciones para personas con discapacidad auditiva en entornos web.
- Prototipado rapido de ASR en arabe: al estar en formato ONNX y `transformers.js`, sirve para validar ideas sin infraestructura de servidor.
- Investigacion en ASR de dominio especifico: como punto de partida para experimentos con arabe coranico y comparacion con modelos genericos.
- Integracion en aplicaciones moviles hibridas: el formato ONNX facilita el despliegue en entornos web empaquetados (PWA, Capacitor, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 74 millones de parametros en formato ONNX, la huella de memoria es reducida; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible. El modelo esta pensado para ejecucion en navegador, por lo que puede funcionar en CPU mediante WebAssembly y en GPU integradas o dedicadas mediante WebGPU.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU moderna con soporte WebGPU; no se dispone de confirmacion oficial.
- Opciones de despliegue: `transformers.js` (principal), ONNX Runtime Web; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mahmoudelwany7/whisper-base-ar-quran | aprox. 74 M | no disponible | arabe coranico | Apache 2.0 | ONNX | Hugging Face |
| tarteel-ai/whisper-base-ar-quran | aprox. 74 M | no disponible | arabe coranico | Apache 2.0 | safetensors (presumiblemente) | Hugging Face |
| openai/whisper-base | aprox. 74 M | 30 s de audio | multilingue | MIT | PyTorch, safetensors | Hugging Face |
| eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran | aprox. 74 M | no disponible | arabe coranico | Apache 2.0 | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una copia sin modificaciones de otro repositorio; no introduce mejoras ni cambios respecto al modelo original.
- Especializado en arabe coranico: su rendimiento en arabe coloquial o en otros idiomas no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion en transcripciones: como todo modelo ASR generativo, puede producir texto plausible pero incorrecto, especialmente con audio ruidoso o recitacion no estandar.
- No se han documentado sesgos especificos, pero al entrenarse en un dominio religioso concreto puede tener un sesgo hacia el vocabulario coranico.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Tarteel AI y de OpenAI Whisper (MIT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- No se dispone de informacion sobre el proceso de conversion a ONNX ni sobre posibles perdidas de precision.
- La fecha de creacion indicada (2026-11-20) es futura respecto a la mayoria de referencias; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mahmoudelwany7/whisper-base-ar-quran
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Repositorio ONNX original: https://huggingface.co/eventhorizon0/tarteel-ai-onnx-whisper-base-ar-quran
- Whisper de OpenAI: https://huggingface.co/openai/whisper-base
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
