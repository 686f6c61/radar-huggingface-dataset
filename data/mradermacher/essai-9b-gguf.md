# mradermacher/essAi-9b-GGUF

## Resumen

essAi-9b es un modelo de lenguaje de aproximadamente 9.200 millones de parámetros, derivado de la familia Qwen 3.5 según las etiquetas del autor, y ajustado mediante LoRA, SFT y DPO para la generación de ensayos de admisión universitaria y textos de estilo humano. Lo desarrolla `alphanozcan`, y la versión aquí descrita es la cuantización GGUF publicada por `mradermacher`, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está orientado a un nicho muy concreto: la redacción de *personal statements*, ensayos de tipo *Common App* y escritura creativa que evite el estilo artificial típico de los modelos alineados de forma genérica.

La relevancia del modelo estriba en su especialización vertical: en lugar de competir en benchmarks generalistas, se entrena para producir prosa con voz personal, estructura narrativa y registro humano en el contexto de admisiones académicas. El repositorio GGUF incluye cuantizaciones desde Q2_K hasta f16, además de ficheros `mmproj` (multi-modal supplement), lo que sugiere que el modelo base podría tener capacidades multimodales, aunque no se detalla su alcance en la información disponible.

La ficha se centra en la versión GGUF, que es la publicada bajo el identificador `mradermacher/essAi-9b-GGUF`, con licencia Apache 2.0 y soporte exclusivo del idioma inglés. No se han publicado detalles sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según etiquetas del autor); detalles no disponibles |
| Parámetros totales | 9.197.093.888 (~9,2 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | alphanozcan/essAi-9b |
| Tamaño del repo | 85,1 GB |
| Descargas | 204 |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen 3.5, según las etiquetas declaradas por el autor, y se ha ajustado en dos fases: primero mediante LoRA y SFT, y después con DPO. Este pipeline es coherente con el objetivo de alineamiento hacia un estilo de escritura concreto: el SFT enseña el formato y el registro de los ensayos de admisión, mientras que el DPO refina las preferencias hacia textos que resulten más humanos y menos reconocibles como generados por un modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros empleados.

La cuantización la realiza `mradermacher` con su pipeline habitual, que en este caso produce cuantizaciones estáticas (no ponderadas con imatrix, según indica el propio autor). El repositorio incluye ficheros `mmproj` en f16 y Q8_0, lo que indica que el modelo base incorpora algún componente multimodal, aunque no se especifica qué modalidad ni cómo se integra. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés orientada a ensayos de admisión universitaria (*personal statements*, *Common App*).
- Escritura creativa con estilo humano, entrenada explícitamente para reducir el tono artificial.
- Ajuste fino mediante SFT y DPO para alinear el registro y la estructura narrativa.
- Soporte conversacional (etiqueta `conversational`).
- Posible capacidad multimodal por la presencia de ficheros `mmproj`, aunque no se detalla su alcance.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Redacción de *personal statements* para admisiones universitarias: el modelo está entrenado específicamente para este género, con estructura narrativa, voz personal y registro adecuado para solicitudes de *Common App*.
- Asistencia en escritura creativa: útil para generar borradores de relatos o ensayos personales con un estilo que evite las fórmulas repetitivas típicas de modelos generalistas.
- Revisión y reescritura de textos de admisión: puede reformular borradores para mejorar el tono y la cohesión manteniendo la voz del autor.
- Generación de ejemplos y plantillas para orientadores educativos: permite producir materiales de muestra para talleres de escritura de admisión.
- Prototipado de asistentes de escritura en inglés: al ser un modelo de 9 B cuantizado a Q4_K_M (5,9 GB), se puede desplegar en local para experimentar con pipelines de generación de texto especializado.
- Investigación sobre estilo y detección de texto generado: su entrenamiento explícito hacia un estilo "humano" lo convierte en un caso de estudio útil para evaluar detectores y estudiar sesgos de estilo.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en formato GGUF, sirve como base para adaptaciones a otros géneros de escritura académica o profesional en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (4,0 GB): ~5-6 GB de VRAM.
  - Q4_K_M (5,9 GB): ~7-8 GB de VRAM, recomendado para equilibrio calidad/velocidad.
  - Q5_K_M (6,7 GB): ~8-9 GB de VRAM.
  - Q8_0 (9,9 GB): ~11-12 GB de VRAM.
  - f16 (18,5 GB): ~20-21 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde Q4_K_M en una RTX 3060 12 GB o RTX 4060 Ti 16 GB; Q2_K y Q3_K_S caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers con aceleración por GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| essAi-9b (este) | ~9,2 B | No disponible | Apache 2.0 | Ensayos de admisión y escritura estilo humano (inglés) | GGUF en HF |
| Qwen 2.5 7B | ~7,6 B | 128 K (según versión) | Apache 2.0 | Propósito general, multilingüe | Safetensors y GGUF |
| Llama 3.1 8B | ~8 B | 128 K | Llama 3.1 Community License | Propósito general, multilingüe | Safetensors y GGUF |
| Mistral 7B | ~7,2 B | 32 K | Apache 2.0 | Propósito general | Safetensors y GGUF |

La comparación con Qwen 2.5 7B y Llama 3.1 8B es la más directa por tamaño, aunque essAi-9b se diferencia por su especialización vertical y su limitación al inglés. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Especialización muy estrecha: su rendimiento fuera del dominio de ensayos de admisión y escritura creativa en inglés no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Solo inglés: no se declara soporte de otros idiomas, por lo que no es adecuado para producción multilingüe.
- Longitud de contexto desconocida: no se puede garantizar el manejo de documentos largos sin verificación empírica.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, citas o experiencias personales; en el contexto de admisiones esto es especialmente sensible y requiere revisión humana.
- Sesgos: no se documentan evaluaciones de sesgo; un modelo entrenado para "sonar humano" en ensayos de admisión puede reproducir estilos y tópicos estereotípicos.
- Uso ético: la generación de ensayos de admisión completos puede contravenir las políticas de integridad académica de las instituciones; conviene usarlo como asistencia y no como sustituto del trabajo del solicitante.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad según las notas del propio autor; para producción se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento no están documentados en detalle, lo que limita la trazabilidad.
- No se documentan capacidades de *tool calling* ni de agentes, por lo que no es adecuado para pipelines automatizados que las requieran.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/essAi-9b-GGUF
- Modelo base: https://huggingface.co/alphanozcan/essAi-9b
- Página de descargas del cuantizador: https://hf.tst.eu/model#essAi-9b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
