# ibm-granite/granite-vision-4.1-4b-GGUF

## Resumen

Granite-vision-4.1-4b es un modelo multimodal (imagen + texto) desarrollado por IBM dentro de la familia Granite 4.1. Esta ficha concreta corresponde a la distribucion en formato GGUF del modelo base `ibm-granite/granite-vision-4.1-4b`, publicada por el propio equipo de IBM (`ibm-granite`) para su uso con llama.cpp. El modelo resuelve tareas de comprension de imagenes combinadas con instrucciones en lenguaje natural: descripcion de documentos, extraccion de informacion de capturas, analisis de diagramas y conversacion multi-turno con soporte visual.

El modelo base cuenta con 3.402.836.480 parametros (aproximadamente 3,4 mil millones), lo que lo situa en la gama compacta de modelos de vision-lenguaje, apta para despliegue en hardware de consumo cuando se cuantiza. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia actual radica en la combinacion de tamano reducido, licencia permisiva y disponibilidad en GGUF con proyector visual (`mmproj`), lo que facilita su integracion en pipelines locales y en entornos sin GPU de datacenter.

Esta publicacion GGUF incluye tanto los pesos cuantizados del modelo de lenguaje como el proyector multimodal en BF16, e incorpora compatibilidad con el endpoint `/v1/chat/completions` de llama.cpp, lo que permite sustituir APIs propietarias en aplicaciones existentes con cambios minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal vision-lenguaje de la familia Granite 4.1; esta publicacion es la conversion GGUF) |
| Parametros totales | 3.402.836.480 (3,4 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples cuantizaciones GGUF (la model card ejemplifica con Q8_0; el resto de niveles no se detalla) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje) + `mmproj-model-bf16.gguf` (proyector visual) |
| Tamano del repositorio | 44,7 GB |
| Libreria | llama.cpp |
| Version de llama.cpp de referencia | build tag `b11798` |
| Version de Transformers de referencia | 5.8.0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la denominacion (`granite-vision-4.1-4b`) y la presencia de un proyector multimodal separado (`mmproj-model-bf16.gguf`), se trata de un modelo de vision-lenguaje con un codificador de imagenes conectado a un modelo de lenguaje mediante un proyector, siguiendo el patron habitual en esta categoria. La model card del repositorio GGUF remite explicitamente a la model card del modelo base para los detalles completos de arquitectura y entrenamiento.

Tampoco se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion tecnica concreta sobre esta publicacion es la relativa a la conversion: se ha generado con llama.cpp (build `b11798`) y Transformers `5.8.0`, y se distribuye junto con el proyector visual en BF16.

## Capacidades

- Comprension de imagenes combinada con instrucciones de texto: descripcion de imagenes, respuesta a preguntas sobre el contenido visual.
- Procesamiento de documentos y capturas de pantalla (el ejemplo de la model card usa `page.png` como entrada).
- Conversacion multi-turno con soporte de entrada visual, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con el endpoint OpenAI-compatible `/v1/chat/completions` de `llama serve`, incluyendo imagenes codificadas en base64 mediante `image_url`.
- Uso interactivo por linea de comandos mediante `llama cli`, con insercion automatica del marcador de imagen en el prompt.
- Soporte de plantilla de chat mediante `--jinja`.
- Generacion de texto en el modelo de lenguaje subyacente (capacidades especificas de razonamiento, codigo o matematicas: no disponibles en la informacion proporcionada).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion y descripcion de documentos escaneados: el modelo recibe una imagen de pagina (`page.png` en el ejemplo oficial) y devuelve una descripcion textual; util para indexar archivos fisicos digitalizados en sistemas de gestion documental.
- Extraccion de informacion de capturas de pantalla en soporte tecnico: el modelo puede interpretar capturas enviadas por usuarios y generar respuestas contextualizadas dentro de un flujo conversacional multi-turno.
- Asistencia en accesibilidad: generacion automatica de descripciones textuales de imagenes para lectores de pantalla, aprovechando el tamano compacto (3,4 B) que permite ejecucion local.
- Procesamiento por lotes en local sin dependencia de la nube: al distribuirse en GGUF y ejecutarse con llama.cpp, permite clasificar y describir grandes volumenes de imagenes en infraestructura propia, con coste marginal bajo.
- Prototipado rapido de aplicaciones multimodales: la compatibilidad con el endpoint OpenAI de `llama serve` permite sustituir una API propietaria por este modelo en una aplicacion existente cambiando unicamente la URL base y el nombre del modelo.
- Analisis de diagramas y figuras en entornos de investigacion o docencia: el modelo puede describir el contenido de figuras tecnicas y responder preguntas sobre ellas en un flujo de chat interactivo.
- Integracion en pipelines de CI/CD para validacion visual: verificacion automatizada de capturas de UI generadas en pruebas end-to-end, comparando o describiendo el estado renderizado de una interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del numero de parametros (3,4 B), la cuantizacion Q8_0 requiere aproximadamente 3,5-4 GB para los pesos del modelo de lenguaje, mas el proyector visual en BF16; las cuantizaciones de menor precision reduciran este requisito, pero no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por el tamano del modelo (3,4 B) es plausible su ejecucion en GPU de consumo con suficiente VRAM, aunque no se confirma oficialmente en la informacion disponible.
- Opciones de despliegue: llama.cpp, tanto mediante `llama cli` como mediante `llama serve` con endpoint OpenAI-compatible. Otras opciones (vLLM, Ollama, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo en la documentacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo de lenguaje, existe riesgo de generar descripciones inexactas del contenido visual.
- Longitud de contexto e idiomas soportados: no disponibles, lo que impide garantizar un comportamiento fiable en conversaciones largas o en idiomas distintos del entrenado.
- La model card de esta publicacion GGUF es minima y remite a la del modelo base; para produccion conviene revisar dicha model card antes de desplegar.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de detalles sobre el dataset de entrenamiento impide descartar obligaciones adicionales derivadas de los datos.
- El ejemplo oficial utiliza `--temp 0`; no se documentan recomendaciones de parametros de muestreo para otros casos.
- La version de llama.cpp de referencia es la build `b11798`; versiones anteriores podrian no soportar correctamente el modelo o el proyector visual.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/ibm-granite/granite-vision-4.1-4b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
