# inference4j/opus-mt-en-fr

## Resumen

`inference4j/opus-mt-en-fr` es una exportación a formato ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-en-fr`, desarrollado originalmente por el grupo Helsinki-NLP (Universidad de Helsinki) y empaquetado por el proyecto inference4j para su uso en entornos Java. El modelo resuelve la tarea de traducción directa del inglés al francés mediante una arquitectura MarianMT de tipo encoder-decoder, entrenada sobre el corpus paralelo OPUS.

La relevancia de esta variante concreta reside en su formato: al estar exportada a ONNX con soporte de caché KV (generada mediante Hugging Face Optimum), puede ejecutarse sin dependencias de PyTorch ni de Python, lo que la hace adecuada para aplicaciones Java en producción que necesiten traducción local sin llamadas a servicios externos. El repositorio ocupa 1,3 GB y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo especializado y de alcance limitado: un único par de idiomas, sin capacidades generales de razonamiento ni generación libre. Su interés es práctico (integración ligera en pipelines JVM) más que investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT encoder-decoder (transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion ONNX; el repo no detalla variantes cuantizadas) |
| Idiomas soportados | ingles (en) y frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con cache KV) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MarianMT, un transformer encoder-decoder orientado a traducción automática neuronal. La exportación a ONNX se realizó con Hugging Face Optimum e incluye soporte de caché KV, lo que acelera la decodificación autorregresiva al evitar recalcular las claves y valores de tokens ya procesados. El tokenizador es SentencePiece.

Los datos de entrenamiento corresponden al corpus paralelo OPUS, según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se detalla el número de parámetros del modelo original.

## Capacidades

- Traducción directa de inglés a francés, tanto de frases sueltas como de párrafos.
- Generación seq2seq con decodificación autorregresiva y caché KV.
- Ejecución en entornos Java mediante la librería inference4j (`MarianTranslator`).
- Inferencia sin dependencias de Python ni PyTorch (solo runtime ONNX).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al par en→fr; no traduce en otras direcciones.

## Casos de uso

- Traducción de documentación técnica en pipelines CI/CD: el modelo puede integrarse en un flujo Java que traduzca ficheros Markdown o recursos de internacionalización del inglés al francés antes del despliegue, sin salir de la JVM.
- Localización de interfaces de usuario: traducción de cadenas de texto y mensajes de aplicación en tiempo de build o de ejecución, aprovechando que el modelo corre localmente y no requiere conectividad.
- Preprocesado de datos para NLP: traducción masiva de corpus ingleses a francés para tareas posteriores de análisis, indexación o entrenamiento de otros modelos.
- Atención al cliente en aplicaciones Java: traducción de mensajes entrantes en inglés a francés para agentes o sistemas que operen en francés, con latencia baja al ejecutarse en local.
- Procesamiento por lotes de correos o tickets: traducción de grandes volúmenes de texto almacenado, sin coste por token ni dependencia de APIs externas.
- Sistemas con requisitos de privacidad: traducción de contenido sensible dentro de la infraestructura propia, evitando enviar datos a servicios cloud de terceros.
- Prototipado rápido en entornos JVM: validación de flujos de traducción en aplicaciones de escritorio o backend Java sin necesidad de montar un stack Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 1,3 GB, por lo que la inferencia en FP32 requiere del orden de 1,5-2 GB de memoria, y menos si se aplican cuantizaciones (no documentadas en el repo).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobradas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) y la librería inference4j para Java; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| inference4j/opus-mt-en-fr | no disponible | no disponible | en→fr | Apache 2.0 | ONNX |
| Helsinki-NLP/opus-mt-en-fr | no disponible | no disponible | en→fr | Apache 2.0 | PyTorch (safetensors/bin) |
| Helsinki-NLP/opus-mt-en-ROMANCE | no disponible | no disponible | en→lenguas romances | Apache 2.0 | PyTorch |
| Facebook NLLB-200 (distilled 600M) | 600 M | no disponible | 200 idiomas | CC-BY-NC 4.0 | PyTorch |

La diferencia principal frente al modelo original de Helsinki-NLP es el formato (ONNX frente a PyTorch) y el ecosistema de ejecución (Java frente a Python). Frente a NLLB, este modelo cubre un único par de idiomas pero con licencia Apache 2.0, apta para uso comercial, mientras que NLLB en su variante destilada usa CC-BY-NC.

## Limitaciones y advertencias

- Modelo de un solo par de idiomas: no traduce francés→inglés ni otros pares.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados (términos técnicos, jerga, nombres propios).
- Sesgos heredados del corpus OPUS, de composición no documentada en esta ficha.
- No se especifican la longitud máxima de contexto ni el comportamiento con textos largos; conviene segmentar entradas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor original es Helsinki-NLP y conviene conservar la atribución.
- El modelo está pensado para inferencia; no admite ajuste fino dentro de este repositorio ONNX.
- Repositorio con muy pocas descargas (6) y likes (2): ecosistema pequeño y poca validación comunitaria.
- No hay información sobre cuantizaciones disponibles ni sobre rendimiento medido, lo que dificulta planificar capacidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference4j/opus-mt-en-fr
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Hugging Face Optimum (herramienta de exportación): https://huggingface.co/docs/optimum
