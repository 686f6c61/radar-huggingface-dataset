# meldgaard/ilt-gemma3-1b-it-litert

## Resumen

ILT mirror of Gemma 3 1B IT (LiteRT) es un espejo (mirror) sin modificaciones de los ficheros publicados por `litert-community/Gemma3-1B-IT`, mantenido por el usuario `meldgaard` para su uso en la aplicación ILT como motor de fusion de texto offline en dispositivo. No se trata de un modelo entrenado o afinado por el autor: es una copia bit a bit de los artefactos LiteRT originales de Google, redistribuida para garantizar disponibilidad y trazabilidad (incluye hashes SHA-256 de cada fichero).

El modelo subyacente es Gemma 3 1B IT, un transformer decoder-only de aproximadamente 1.000 millones de parametros desarrollado por Google DeepMind, en su variante instruction-tuned. Se distribuye en formato LiteRT (`.task` y `.litertlm`) ya cuantizado a int4, pensado para inferencia en dispositivos con recursos limitados (moviles, tablets, portatiles y edge). El contexto nativo de la familia Gemma 3 es de 32.768 tokens, aunque esta ficha no puede confirmar la configuracion exacta del artefacto LiteRT mas alla de lo indicado por el autor.

Su relevancia es practica: permite a desarrolladores integrar un LLM de 1B en aplicaciones Android/iOS o de escritorio mediante el runtime LiteRT (antes TensorFlow Lite) sin depender de la conexion a la nube ni de infraestructura GPU. El repositorio ocupa 1,1 GB y no registra descargas ni likes en el momento de la consulta, lo que refleja su caracter de espejo auxiliar mas que de publicacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante 1B instruction-tuned) |
| Parametros totales | Aproximadamente 1.000 millones (heredado de google/gemma-3-1b-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no confirmado en el artefacto; la familia Gemma 3 declara 32.768 tokens |
| Tipos de cuantizacion | int4 (artefactos `.task` y `.litertlm` pre-cuantizados) |
| Idiomas soportados | no disponible en la model card; hereda el multilingue de Gemma 3 |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | LiteRT: `gemma3-1b-it.task` y `gemma3-1b-it.litertlm` (int4) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B IT, un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y las innovaciones introducidas en la familia Gemma 3 (entre ellas, atencion con ventana deslizante local y global alternada en los modelos mayores de la familia). Esta ficha no dispone de la composicion exacta del dataset, el numero de tokens de entrenamiento ni los detalles del pipeline de alineacion (RLHF/DPO) del modelo original; esa informacion debe consultarse en la model card oficial de `google/gemma-3-1b-it`.

El artefacto distribuido aqui no introduce ningun cambio respecto al original: el autor declara explicitamente "Unmodified copy of files from litert-community/Gemma3-1B-IT". La unica aportacion tecnica del repositorio es el empaquetado en formato LiteRT int4 (`.task` para el runtime LiteRT/TFLite y `.litertlm` para el runtime LiteRT-LM) y la publicacion de hashes SHA-256 para verificar la integridad de la copia. No hay decodificacion especulativa, atencion lineal ni tecnicas adicionales documentadas en este espejo.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruction-tuned (formato de chat de Gemma).
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 1B parametros.
- Generacion de codigo sencillo y explicaciones tecnicas de complejidad baja o media.
- Aritmetica y problemas matematicos elementales.
- Soporte multilingue heredado de Gemma 3 (la model card del espejo no detalla la lista de idiomas).
- Inferencia completamente offline en dispositivo mediante el runtime LiteRT.
- No se documenta en este repositorio soporte de tool calling, function calling, agentes, vision ni audio; el autor lo describe como motor de "text merging" en la app ILT.

## Casos de uso

- Fusion y reescritura de texto offline en aplicaciones moviles: el autor indica que la app ILT lo usa para "offline on-device text merging"; el modelo puede combinar, resumir o reescribir fragmentos de texto sin enviar datos a la nube.
- Procesamiento de notas y documentos personales en local: al ejecutarse en dispositivo con LiteRT, permite resumir o reestructurar notas privadas sin salida de datos, lo que simplifica el cumplimiento de RGPD.
- Asistentes de escritorio o moviles sin conectividad: integrable en apps Android/iOS mediante LiteRT para tareas de redaccion asistida, correccion y parafraseo en entornos sin red.
- Prototipado rapido de funciones LLM en edge: sirve como baseline de 1B para validar latencia y calidad antes de escalar a modelos mayores o a infraestructura servidor.
- Preprocesado de texto en pipelines locales: normalizacion, extraccion de entidades simples o generacion de titulos y resumenes en herramientas de escritorio.
- Educacion y demos: ejemplo de despliegue de un LLM int4 en hardware consumer para talleres, pruebas de concepto y evaluacion del runtime LiteRT frente a llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones con modelos similares. Para datos de evaluacion del modelo subyacente debe consultarse la documentacion oficial de `google/gemma-3-1b-it`.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,1 GB; los artefactos int4 de un modelo de 1B suelen requerir del orden de 0,7-1,2 GB de memoria para pesos, mas overhead del runtime y del contexto. Cifra exacta no disponible.
- GPU recomendadas: no aplica de forma estricta; el formato LiteRT esta orientado a aceleradores moviles (GPU Mali/Adreno, NPU) y CPU. En escritorio puede ejecutarse en CPU y en GPUs consumer modestas.
- Cabe en GPU consumer: si, en cualquier GPU con 2 GB o mas de VRAM, aunque el runtime objetivo es LiteRT en dispositivo mas que GPUs de escritorio.
- Opciones de despliegue: runtime LiteRT / LiteRT-LM (`.task` y `.litertlm`), integracion en apps Android/iOS y herramientas de escritorio basadas en LiteRT. No se distribuyen pesos en GGUF ni safetensors en este repositorio, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a estos ficheros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meldgaard/ilt-gemma3-1b-it-litert (este) | ~1B | no confirmado (familia: 32.768) | LiteRT int4 (`.task`, `.litertlm`) | Gemma Terms of Use | Hugging Face (espejo) |
| google/gemma-3-1b-it (original) | ~1B | 32.768 (familia) | safetensors, LiteRT via litert-community | Gemma Terms of Use | Hugging Face |
| litert-community/Gemma3-1B-IT | ~1B | 32.768 (familia) | LiteRT int4 | Gemma Terms of Use | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto y licencia: no hay datos de rendimiento publicados en la informacion disponible para este espejo, por lo que no es posible comparar calidad de forma rigurosa.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: cualquier limitacion del modelo original (sesgos, alucinaciones, errores factuales) aplica integramente.
- Con 1B parametros, la tasa de alucinacion en preguntas factuales es relativamente alta y el razonamiento multi-paso es limitado; no es adecuado para tareas de alta precision sin verificacion.
- La model card no detalla los idiomas soportados ni la cobertura multilingue real del artefacto; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- El contexto efectivo del artefacto LiteRT no esta confirmado; no asumir los 32.768 tokens de la familia sin verificacion empirica.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; ademas se aplica la Gemma Prohibited Use Policy. Es necesario revisar ambas antes de desplegar.
- Los pesos estan solo en int4: la cuantizacion reduce calidad frente al modelo en bf16/fp16 original.
- El repositorio tiene 0 descargas y 0 likes y fue creado en 2026-11-17; no hay senales de mantenimiento ni comunidad, por lo que la trazabilidad depende de los hashes SHA-256 publicados.
- No se distribuyen pesos en GGUF ni safetensors en este repositorio; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meldgaard/ilt-gemma3-1b-it-litert
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Origen de los artefactos LiteRT: https://huggingface.co/litert-community/Gemma3-1B-IT
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
