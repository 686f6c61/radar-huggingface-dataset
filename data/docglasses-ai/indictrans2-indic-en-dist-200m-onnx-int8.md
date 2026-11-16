# Docglasses-AI/indictrans2-indic-en-dist-200M-ONNX-int8

## Resumen

IndicTrans2 Indic→English dist-200M es un modelo de traducción automática neuronal desarrollado originalmente por AI4Bharat (IIT Madras) para traducir desde lenguas indicas al inglés. Esta ficha concreta corresponde a una conversión a ONNX con cuantización INT8 publicada por el usuario Docglasses-AI, que a su vez replica los ficheros de runtime generados por hari31416 a partir del modelo original. El paquete está pensado para inferencia en dispositivo (on-device), con un tamaño en disco de aproximadamente 250 MB y un repositorio total de 0,3 GB.

El modelo resuelve la traducción bidireccional en la dirección indic→inglés, con etiquetas de idioma explícitas para hindi (`hin_Deva`) y tamil (`tam_Taml`) hacia inglés (`eng_Latn`). La arquitectura subyacente es un transformer encoder-decoder de tipo seq2seq con aproximadamente 200 millones de parámetros (variante "dist" o destilada de la familia IndicTrans2). Esta conversión concreta no aporta pesos nuevos: es un artefacto de despliegue optimizado para ejecutarse con ONNX Runtime en entornos con recursos limitados.

Su relevancia actual radica en que permite integrar traducción hindi/tamil→inglés en aplicaciones móviles o de borde sin depender de una GPU ni de conectividad, gracias a la cuantización INT8 y a la separación de los grafos ONNX (encoder, primer paso de decodificación y decodificación con caché). No obstante, se trata de un artefacto derivado con escasa documentación propia y sin métricas de calidad publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (IndicTrans2, variante dist-200M) |
| Parametros totales | ~200 M (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | Hindi (`hin_Deva`) y tamil (`tam_Taml`) como origen; inglés (`eng_Latn`) como destino |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`, con ficheros `.data` asociados) |

## Arquitectura y entrenamiento

El modelo base es IndicTrans2 en su variante `indictrans2-indic-en-dist-200M`, un transformer encoder-decoder de tipo seq2seq con alrededor de 200 millones de parámetros, destilado ("dist") dentro de la familia IndicTrans2 de AI4Bharat. Está especializado en la dirección indic→inglés y utiliza etiquetas de idioma en el tokenizador para indicar el par de traducción (por ejemplo, `hin_Deva`→`eng_Latn`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o ajuste fino supervisado adicional.

Esta publicación concreta no reentrena el modelo: es una conversión a ONNX con cuantización INT8. El grafo se divide en tres componentes: `encoder_model.onnx` (más su fichero `.data`), `decoder_model.onnx` para el primer paso de decodificación y `decoder_with_past_model.onnx` (con `decoder_shared.onnx.data`) para la decodificación con caché de claves y valores. Incluye además los tokenizadores BPE con las etiquetas de idioma y un script `translate.py` como runner de referencia sobre ONNX Runtime. Esta separación permite reutilizar el estado del decoder entre pasos y reduce el coste computacional en inferencia autoregresiva.

## Capacidades

- Traducción automática de hindi (`hin_Deva`) a inglés (`eng_Latn`).
- Traducción automática de tamil (`tam_Taml`) a inglés (`eng_Latn`).
- Ejecución en dispositivo mediante ONNX Runtime con pesos cuantizados a INT8.
- Decodificación autoregresiva con caché de claves y valores entre pasos.
- Uso de etiquetas de idioma explícitas en el tokenizador para seleccionar el par de traducción.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documenta soporte multilingüe más allá de los pares hindi→inglés y tamil→inglés indicados.

## Casos de uso

- Traducción en aplicaciones móviles sin conectividad: el paquete ONNX INT8 de ~250 MB puede embeberse en una app Android o iOS y ejecutarse con ONNX Runtime Mobile para traducir texto hindi o tamil a inglés en local, sin enviar datos a un servidor.
- Subtitulado y transcripción de contenido audiovisual: combinado con un ASR para hindi o tamil, el modelo puede traducir las transcripciones al inglés en tiempo casi real en un dispositivo de borde, útil para plataformas de vídeo con audiencias mixtas.
- Atención al cliente en mercados indios: integrado en un chatbot o sistema de tickets, permite que un agente que solo habla inglés entienda consultas en hindi o tamil sin depender de servicios cloud de traducción.
- Preprocesado de pipelines de NLP: traducción previa al inglés de corpus hindi o tamil para alimentar modelos de análisis de sentimiento, clasificación o extracción de entidades entrenados solo en inglés.
- Herramientas de accesibilidad y lectura: extensión de navegador o lector que traduzca páginas web en hindi o tamil al inglés en local, preservando la privacidad del usuario.
- Documentación técnica y manuales: traducción por lotes de documentación interna escrita en hindi o tamil al inglés dentro de un flujo CI/CD, usando ONNX Runtime en CPU sin necesidad de GPU.
- Prototipado y evaluación de despliegues en borde: el runner `translate.py` incluido sirve como referencia para validar latencia y calidad antes de integrar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos INT8 de ~250 MB en disco, la huella en memoria es del orden de unos cientos de MB, apta para CPU.
- GPU recomendadas: no se especifican; el paquete está orientado a ejecución en CPU o en dispositivo mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño (cabe en cualquier GPU con al menos ~1 GB de memoria libre), aunque no se documenta rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (incluido el runner `translate.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas (origen→destino) | Formato | Licencia |
|---|---|---|---|---|---|
| Docglasses-AI/indictrans2-indic-en-dist-200M-ONNX-int8 | ~200 M | no disponible | hindi, tamil → inglés | ONNX INT8 | MIT |
| ai4bharat/indictrans2-indic-en-dist-200M (base) | ~200 M | no disponible | indic → inglés (familia completa) | safetensors / PyTorch | no disponible en la información |
| hari31416/indictrans2-indic-en-dist-200M-ONNX-int8 (origen del espejo) | ~200 M | no disponible | hindi, tamil → inglés | ONNX INT8 | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre la dirección indic→inglés y, según la model card, únicamente los pares hindi→inglés y tamil→inglés; no se garantiza el resto de lenguas indicas de la familia IndicTrans2.
- Es un artefacto derivado (conversión y cuantización de terceros) sin métricas de calidad publicadas; la cuantización INT8 puede degradar la calidad de traducción respecto al modelo original en FP32.
- Riesgo de alucinación y de traducciones inexactas en textos largos, dominios especializados o lenguaje coloquial, inherente a modelos seq2seq de este tamaño.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre corpus indicos puede reflejar sesgos de género, registro o dominio presentes en los datos originales.
- La licencia declarada es MIT, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base de AI4Bharat antes de desplegarlo en producción.
- La model card indica un uso previsto muy concreto ("mobile package for Hindi/Tamil → English before on-device SOAP"); no está pensado como modelo de traducción generalista.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No se documenta la longitud máxima de secuencia soportada, lo que dificulta planificar el truncado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Docglasses-AI/indictrans2-indic-en-dist-200M-ONNX-int8
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
- Conversión ONNX INT8 de origen (espejo): https://huggingface.co/hari31416/indictrans2-indic-en-dist-200M-ONNX-int8
