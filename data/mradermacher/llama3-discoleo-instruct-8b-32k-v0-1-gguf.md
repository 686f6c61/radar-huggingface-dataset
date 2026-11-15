# mradermacher/Llama3-DiscoLeo-Instruct-8B-32k-v0.1-GGUF

## Resumen

Llama3-DiscoLeo-Instruct-8B-32k-v0.1-GGUF es la distribucion en formato GGUF del modelo Llama3-DiscoLeo-Instruct-8B-32k-v0.1, desarrollado originalmente por DiscoResearch y cuantizado por mradermacher. Se trata de un ajuste fino del modelo Llama 3 de 8B de parametros, especializado en el idioma aleman y con una ventana de contexto extendida hasta 32.000 tokens. El modelo resuelve la necesidad de disponer de un asistente conversacional en aleman que pueda procesar documentos y conversaciones largas sin perder coherencia.

La relevancia de esta publicacion radica en su formato: al estar disponible en GGUF con un amplio abanico de cuantizaciones (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), permite desplegar un modelo de 8B con contexto de 32k en hardware de consumo, algo impracticable con los pesos originales en safetensors. El modelo base cuenta con 8.030.261.248 parametros y esta construido sobre la arquitectura transformer decoder-only de Llama 3.

El repositorio, publicado el 11 de marzo de 2025, acumula 85 descargas y 1 like en Hugging Face, lo que indica una adopcion moderada. La licencia es la Llama 3 de Meta, con las restricciones habituales de esa licencia para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (segun nombre del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | aleman (de) |
| Licencia | llama3 |
| Formato de pesos | GGUF (tambien disponible el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Llama 3 8B, un transformer decoder-only con atencion causal estandar. La ventana de contexto se extiende a 32.000 tokens, lo que sugiere tecnicas de extension de contexto sobre el Llama 3 original (que soporta 8k de forma nativa). No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni sobre si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La cuantizacion realizada por mradermacher sigue el esquema estandar de llama.cpp, con variantes K-quant e IQ-quant. El autor indica que las cuantizaciones IQ suelen ser preferibles frente a cuantizaciones no-IQ de tamano similar. Ademas, existe una version con cuantizacion ponderada/imatrix en un repositorio separado (sufijo i1), que ofrece mejor calidad a igual tamano.

## Capacidades

- Generacion de texto conversacional en aleman, con formato instruct.
- Procesamiento de contexto largo de hasta 32.000 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Razonamiento y respuesta a instrucciones heredados del ajuste fino sobre Llama 3.
- Capacidad de generacion de codigo y matematicas (heredada de Llama 3 8B, aunque no se detalla en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al aleman segun los metadatos del modelo; el modelo base Llama 3 soporta otros idiomas, pero el ajuste fino esta orientado al aleman.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Atencion al cliente en aleman: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 32.000 tokens de ventana, manteniendo el hilo de la conversacion y el historial del cliente sin truncamientos.
- Procesamiento de documentos legales o administrativos en aleman: con 32k de contexto, puede resumir, extraer clausulas o responder preguntas sobre contratos extensos en una sola pasada.
- Generacion de contenido editorial en aleman: redaccion de articulos, correos y textos corporativos con un tono instructivo y coherente.
- Asistente de soporte tecnico interno: desplegado en local con cuantizacion Q4_K_M (5,0 GB), puede ejecutarse en una GPU de consumo o incluso en CPU para equipos de desarrollo que necesiten un asistente en aleman sin enviar datos a la nube.
- Analisis de transcripciones y actas de reunion: la ventana de 32k permite procesar transcripciones completas de reuniones largas y generar resumenes estructurados en aleman.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en portatiles con 8 GB de RAM, facilitando pruebas de concepto sin infraestructura dedicada.
- Investigacion academica sobre modelos en aleman: util como linea base cuantizada para experimentos de evaluacion de modelos germanicos en entornos con GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K u otras), y tampoco se proporcionan datos del modelo base original en la informacion recibida.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K (3,3 GB): ~4 GB de VRAM/RAM.
  - Q3_K_S (3,8 GB): ~4,5 GB.
  - Q4_K_M (5,0 GB): ~6 GB.
  - Q5_K_M (5,8 GB): ~7 GB.
  - Q6_K (6,7 GB): ~8 GB.
  - Q8_0 (8,6 GB): ~10 GB.
  - f16 (16,2 GB): ~17 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 para las cuantizaciones mayores o contexto completo de 32k.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q5_K_M o Q6_K, y en GPUs de 8 GB con Q3_K_M o IQ4_XS. Para contexto completo de 32k se necesita VRAM adicional para la cache KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Llama3-DiscoLeo-Instruct-8B-32k-v0.1 (este) | 8,03B | 32k | aleman | llama3 | GGUF | Ajuste fino germanico con contexto extendido |
| Llama 3 8B Instruct (Meta) | 8,03B | 8k | multilingue | llama3 | safetensors, GGUF | Base original, contexto nativo menor |
| DiscoResearch/Llama3-DiscoLeo-Instruct-8B-32k-v0.1 | 8,03B | 32k | aleman | llama3 | safetensors | Modelo base sin cuantizar |
| Llama3-DiscoLeo-Instruct-8B-32k-v0.1-i1-GGUF | 8,03B | 32k | aleman | llama3 | GGUF (imatrix) | Misma base con cuantizacion ponderada de mayor calidad |

## Limitaciones y advertencias

- Sesgos conocidos: heredados de Llama 3 y del corpus de ajuste fino; no se documentan sesgos especificos en la model card.
- Riesgo de alucinacion: presente como en cualquier modelo de 8B; especialmente relevante en tareas facticas o de resumen de documentos legales.
- Limitaciones de contexto: aunque el modelo declara 32k tokens, el rendimiento real en contextos muy largos puede degradarse; no se han publicado evaluaciones de "needle in a haystack" para este ajuste.
- Limitaciones de idioma: el ajuste fino esta orientado al aleman; el rendimiento en castellano u otros idiomas puede ser inferior al de Llama 3 base.
- Restricciones de licencia: la licencia Llama 3 impone condiciones para uso comercial (incluida la clausula de 700 millones de usuarios mensuales y restricciones de uso aceptable); es necesario revisar los terminos antes de un despliegue en produccion.
- Caveat de produccion: las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") pueden degradar notablemente la coherencia; para produccion se recomienda Q4_K_M o superior, o la version imatrix.
- El repositorio tiene muy baja adopcion (85 descargas, 1 like), lo que limita la validacion comunitaria del comportamiento del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama3-DiscoLeo-Instruct-8B-32k-v0.1-GGUF
- Repositorio con cuantizacion imatrix: https://huggingface.co/mradermacher/Llama3-DiscoLeo-Instruct-8B-32k-v0.1-i1-GGUF
- Modelo base: https://huggingface.co/DiscoResearch/Llama3-DiscoLeo-Instruct-8B-32k-v0.1
- Pagina de overview del autor: https://hf.tst.eu/model#Llama3-DiscoLeo-Instruct-8B-32k-v0.1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
