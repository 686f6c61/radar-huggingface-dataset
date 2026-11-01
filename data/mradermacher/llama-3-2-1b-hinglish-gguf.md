# mradermacher/Llama-3.2-1B-Hinglish-GGUF

## Resumen

Llama-3.2-1B-Hinglish-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo PRakesh123/Llama-3.2-1B-Hinglish, realizadas por el cuantizador mradermacher. El modelo base es un Llama 3.2 de 1.235,8 millones de parámetros sometido a un proceso de continued pretraining, supervised fine-tuning (SFT) y direct preference optimization (DPO) para especializarse en "Hinglish", es decir, la mezcla coloquial de hindi e inglés muy común en la comunicación digital de la India.

El valor de este repositorio no está en el modelo en sí, sino en su disponibilidad: ofrece el modelo en doce formatos de cuantización distintos (desde Q2_K hasta f16) listos para ejecutarse en CPU o en GPUs modestas mediante llama.cpp, Ollama u otras herramientas compatibles con GGUF. Con archivos de entre 0,7 y 2,6 GB, es accesible incluso para hardware de consumo muy básico.

Es relevante para desarrolladores que necesiten chatbots, asistentes o procesamiento de texto en Hinglish en entornos con recursos limitados, ya que los modelos generalistas grandes suelen rendir de forma irregular en este idioma mixto. Al ser una cuantización de terceros, hereda las capacidades y limitaciones del modelo original de PRakesh123.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (transformer decoder) |
| Parámetros totales | 1.235.814.432 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hindi (hi), inglés (en), con foco en Hinglish |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2, un transformer decoder autoregresivo denso de aproximadamente 1,24 mil millones de parámetros. El modelo base fue adaptado al dominio Hinglish mediante un pipeline de tres etapas indicado en las etiquetas del repositorio: continued pretraining (exposición adicional a texto Hinglish para adaptar el modelo al dominio), supervised fine-tuning (ajuste con instrucciones para capacidades conversacionales) y direct preference optimization (alineación de preferencias sin modelo de recompensa).

Los datos de entrenamiento concretos (número de tokens, composición del dataset, hiperparámetros) no están disponibles en la información proporcionada, ya que la model card de esta cuantización solo remite al modelo original. En cuanto al trabajo de mradermacher, se trata de cuantizaciones estáticas convertidas desde el formato HF original; no se ofrecen cuantizaciones weighted/imatrix en el momento de publicación.

## Capacidades

- Generación de texto conversacional en Hinglish (mezcla de hindi e inglés) y en ambos idiomas por separado.
- Seguimiento de instrucciones gracias al supervised fine-tuning del modelo base.
- Salidas alineadas con preferencias humanas mediante DPO.
- Uso como modelo de chat en herramientas compatibles con GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión ni audio.
- No hay información sobre modo de razonamiento extendido (thinking mode).

## Casos de uso

- Chatbots de atención al cliente en India: el modelo puede mantener conversaciones en el Hinglish real que usan los usuarios en WhatsApp o chats web, donde los modelos solo en hindi o solo en inglés suelen fallar al mezclar códigos lingüísticos.
- Asistentes móviles y de edge computing: con cuantizaciones de 0,7-0,9 GB (Q2_K a Q4_K_M), puede ejecutarse en smartphones o Raspberry Pi mediante llama.cpp sin GPU.
- Prototipado rápido de aplicaciones multilingües: su tamaño reducido permite iterar localmente en un portátil antes de escalar a modelos mayores.
- Clasificación y análisis de sentimiento de contenido Hinglish en redes sociales: puede integrarse en pipelines de análisis de redes para marcas con presencia en el mercado indio.
- Traducción y normalización informal entre hindi, inglés y Hinglish en contextos no críticos, aprovechando el continued pretraining en el dominio.
- Generación de contenido para marketing digital en India: redacción de mensajes, respuestas y copys que suenen naturales en el registro coloquial Hinglish.
- Educación y práctica lingüística: conversación adaptativa para estudiantes de hindi o inglés que mezclan ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos de evaluación del modelo base PRakesh123/Llama-3.2-1B-Hinglish en la model card de esta cuantización.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: desde unos 0,8 GB de RAM para Q2_K hasta unos 2,8 GB para f16; añadir margen para la KV cache según la longitud de contexto utilizada.
- GPU recomendadas: no requiere GPU; puede ejecutarse íntegramente en CPU. En caso de usar GPU, cualquier GPU moderna con 2-4 GB de VRAM basta (por ejemplo, una RTX 3060 o superior sobra con diferencia).
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU de los últimos años, e incluso funciona solo con CPU y RAM convencional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No es un despliegue típico de vLLM o TGI, orientados a pesos safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 1,24 B de parámetros, se espera inferencia muy rápida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Hinglish-GGUF (este) | 1,24 B | GGUF (Q2_K a f16) | hi, en (Hinglish) | Llama 3.2 | Especializado en Hinglish, SFT + DPO |
| Llama-3.2-1B-Instruct (original de Meta) | 1,24 B | safetensors, GGUF de terceros | multilingüe (8 idiomas oficiales) | Llama 3.2 | Generalista, sin especialización en Hinglish |
| Sarvam-1 | 4 B | safetensors, GGUF de terceros | hindi, inglés y otros idiomas indios | no disponible | Más grande, mejor cobertura de lenguas indias |
| Airavata (AI4Bharat) | 7 B | safetensors | hi, en | no disponible | Modelo instructivo para hindi de mayor tamaño |

Nota: los datos de Sarvam-1 y Airavata son aproximados según conocimiento general; el repositorio actual no incluye comparativas oficiales.

## Limitaciones y advertencias

- Tamaño muy reducido (1,24 B): capacidad de razonamiento, matemáticas y generación de código limitada en comparación con modelos de 7 B o superiores; se esperan errores factuales y de lógica con frecuencia.
- Riesgo de alucinación elevado, típico de modelos pequeños y agravado por un fine-tuning de dominio cuya calidad y volumen de datos no está documentado.
- La licencia Llama 3.2 impone restricciones de uso comercial: aplica la política de uso aceptable de Meta y hay límites relatedos a la mensualidad de usuarios (el umbral estándar de la licencia es de 700 millones de usuarios activos mensuales para requerir licencia adicional).
- No hay benchmarks publicados: la calidad real en Hinglish no está verificada de forma independiente.
- La especialización en Hinglish puede degradar el rendimiento en hindi puro o inglés puro respecto al modelo base original de Meta.
- Las cuantizaciones más agresivas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad, especialmente en scripts Devanagari.
- Al ser una cuantización de terceros, cualquier problema del modelo base debe reportarse al autor original (PRakesh123), no al cuantizador.
- No hay información sobre longitud de contexto efectiva ni sobre comportamiento en conversaciones largas.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Llama-3.2-1B-Hinglish-GGUF
- Modelo base original: https://huggingface.co/PRakesh123/Llama-3.2-1B-Hinglish
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#Llama-3.2-1B-Hinglish-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización y FAQ: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
