# r69shabh/rizzo-pii-0.3B-onnx-web

## Resumen

rizzo-pii-0.3B-onnx-web es una copia optimizada para navegador del modelo rizzo-pii-0.3B, desarrollado por Rizzo AI Academy y republicado por el usuario r69shabh en Hugging Face. Se trata de un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII, Personally Identifiable Information) en texto, con soporte para el idioma italiano. La variante "onnx-web" distribuye los pesos en formato ONNX con cuantización int8, lo que permite ejecutar la inferencia directamente en el navegador mediante transformers.js y onnxruntime-web, sin necesidad de servidor de backend.

El problema que resuelve es la detección de datos sensibles (nombres, direcciones, teléfonos, correos, etc.) en texto, una tarea habitual en flujos de anonimización y cumplimiento normativo (RGPD). Su relevancia radica en que la ejecución íntegramente en cliente garantiza que el texto analizado nunca sale del dispositivo del usuario, un requisito frecuente en aplicaciones que manejan datos personales. El modelo base tiene aproximadamente 0,3B de parámetros y emplea arquitectura ModernBERT, según las etiquetas del repositorio. Este repositorio no incluye reentrenamiento: los pesos y etiquetas son idénticos a los del modelo original, y el archivo int8 corresponde a la versión con vocabulario reducido publicada por emanueleR3/rizzo-pii-int8-p96k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder de transformer para token classification) |
| Parametros totales | 0,3B (300 millones, aprox.) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado, archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | italiano (it) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_quantized.onnx, compatible con transformers.js / onnxruntime-web) |

Datos adicionales: tamaño del repositorio de 0,2 GB; vocabulario reducido de 105.638 tokens en la build int8 (identificador `18cecefff319`); versión del modelo base v1.5.0; SHA-256 del archivo `18cecefff319d3c772c29ff6de4779eaa09a912b2bd3261e069e68e6fa9df4e3`.

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una familia de encoders transformer modernizada que sustituye el codificador clásico de BERT por mejoras como posicionamiento rotatorio y ventanas de atención más eficientes. La cabecera del modelo es de token classification, es decir, asigna una etiqueta a cada token del texto de entrada, lo que es el enfoque estándar para reconocimiento de entidades nombradas (NER) y detección de PII. La etiqueta `base_model:quantized` confirma que este repositorio contiene una versión cuantizada del original rizzoaiacademy/rizzo-pii-0.3B, sin reentrenamiento posterior.

Sobre los datos de entrenamiento, el número de tokens de preentrenamiento, la composición del dataset y el uso de técnicas de alineación (RLHF/DPO) no están disponibles en la información proporcionada. Cabe señalar que, al ser un modelo de token classification basado en encoder, no aplica RLHF ni decodificación generativa. La innovación técnica destacable de esta variante es la distribución: pesos int8 en ONNX con vocabulario podado a 105.638 tokens, diseñada específicamente para ejecutarse en el navegador a través de onnxruntime-web con un tamaño de repositorio de solo 0,2 GB.

## Capacidades

- Detección de información personal identificable (PII) en texto mediante clasificación de tokens a nivel de entidad.
- Soporte del idioma italiano; el modelo está etiquetado exclusivamente para "it".
- Ejecución íntegramente en el navegador gracias a transformers.js y onnxruntime-web, sin envío de datos a servidores externos.
- Inferencia con pesos cuantizados int8, adecuada para dispositivos con recursos limitados.
- Integración en aplicaciones web mediante la librería transformers.js de Hugging Face.
- No es un modelo generativo: no produce texto libre, no soporta chat, ni razonamiento multi-paso, ni tool calling.

## Casos de uso

- Anonimización de texto en el navegador: una aplicación web puede detectar y enmascarar nombres, teléfonos o direcciones en formularios o comentarios antes de enviarlos a un backend, garantizando que los datos sensibles no salgan del dispositivo del usuario.
- Cumplimiento del RGPD en aplicaciones italianas: empresas que procesan contenido generado por usuarios en italiano pueden prefiltrar PII en cliente para reducir la superficie de riesgo legal.
- Redacción previa de documentos para LLM: antes de enviar texto a un modelo de lenguaje en la nube, se puede limpiar la PII localmente con este modelo, evitando exfiltrar datos personales.
- Auditoría de datasets: un equipo de datos puede escanear corpus en italiano para localizar y eliminar registros con datos personales antes de publicarlos o entrenar con ellos.
- Herramientas de privacidad para el usuario final: extensiones de navegador o editores de texto que resaltan en tiempo real la información sensible mientras el usuario escribe.
- Prototipado y demos de NER en cliente: gracias a la demo en Hugging Face Spaces (rizzo-pii-demo), desarrolladores pueden probar la detección de PII sin instalar nada, y reutilizar el patrón ONNX int8 para otros modelos ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: con pesos int8 y un tamaño de repositorio de 0,2 GB, el modelo cabe en memoria de prácticamente cualquier equipo moderno; al ejecutarse vía WebGPU/WASM en navegador no requiere GPU dedicada (no disponible una cifra exacta de consumo).
- GPU recomendadas: no requiere GPU; la inferencia en navegador usa onnxruntime-web (WebGPU si está disponible, con fallback a WASM/CPU). Para inferencia en servidor con ONNX Runtime, cualquier CPU moderna es suficiente.
- Consumer GPU: no es necesaria; el modelo está diseñado para ejecutarse en portátiles y equipos de escritorio sin acelerador dedicado.
- Opciones de despliegue: transformers.js + onnxruntime-web en navegador (uso previsto principal), demo en Hugging Face Spaces (r69shabh/rizzo-pii-demo), y en principio ONNX Runtime en Python o Node.js para ejecución en servidor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Tamano | Formato | Licencia |
|---|---|---|---|---|---|
| rizzo-pii-0.3B-onnx-web | Encoder (ModernBERT) | Deteccion de PII (token classification) | 0,3B | ONNX int8 (navegador) | MIT |
| rizzoaiacademy/rizzo-pii-0.3B | Encoder (ModernBERT) | Deteccion de PII | 0,3B | Pesos originales (no disponible el formato exacto) | MIT |
| emanueleR3/rizzo-pii-int8-p96k | Encoder (ModernBERT) | Deteccion de PII | 0,3B | ONNX int8, vocabulario podado (105.638 tokens) | MIT |

No hay alternativas de terceros con datos comparables disponibles en la informacion proporcionada. Como referencia de categoria, existen modelos genéricos de NER multilingües (por ejemplo, variantes de XLM-RoBERTa fine-tuned para NER), pero no se dispone de cifras de rendimiento para una comparación rigurosa.

## Limitaciones y advertencias

- Soporte de idioma limitado al italiano; no está indicado su uso sobre texto en otros idiomas, incluido el castellano.
- Al ser un modelo de 0,3B parámetros con cuantización int8, la precisión de detección puede ser inferior a la de modelos NER más grandes o sin cuantizar; no hay benchmarks publicados para cuantificar esta pérdida.
- Riesgo de falsos positivos y falsos negativos en la detección de PII: no debe usarse como única barrera de privacidad en producción sin validación humana o reglas complementarias.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre las categorías exactas de PII que detecta (la lista de etiquetas no está incluida en la model card).
- La longitud de contexto no está documentada; textos muy largos pueden requerir fragmentación.
- La licencia MIT permite uso comercial sin restricciones relevantes, pero el aviso de copyright corresponde a Rizzo AI Academy (© Rizzo AI Academy, v1.5.0).
- Este repositorio es una copia de terceros (r69shabh) sin reentrenamiento ni validación adicional publicada; con 0 descargas registradas, carece de historial de uso comunitario. Para producción, conviene evaluar también el repositorio original del autor.
- La integridad del archivo está documentada (SHA-256 publicado), lo que permite verificar que la copia no ha sido alterada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/r69shabh/rizzo-pii-0.3B-onnx-web
- Modelo base original: https://huggingface.co/rizzoaiacademy/rizzo-pii-0.3B
- Build int8 con vocabulario podado: https://huggingface.co/emanueleR3/rizzo-pii-int8-p96k
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/r69shabh/rizzo-pii-demo
