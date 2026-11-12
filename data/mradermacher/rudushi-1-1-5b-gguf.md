# mradermacher/rudushi-1-1.5b-GGUF

## Resumen

rudushi-1-1.5b es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) desarrollado por SheikhMinds y especializado en bengalí (bangla) e inglés. El modelo parte de una base transformer de tipo decoder-only y ha sido ajustado mediante QLoRA y SFT (supervised fine-tuning) sobre el dataset `SheikhMinds/rudushi-bangla-sft`, con un enfoque explícito en razonamiento, chain-of-thought y self-reflection. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su carácter especializado: la mayoría de los modelos pequeños multilingües no ofrecen un rendimiento equilibrado en bengalí, un idioma con más de 230 millones de hablantes nativos y una presencia limitada en los corpus de entrenamiento de los grandes modelos. rudushi-1-1.5b cubre ese hueco con una licencia Apache 2.0 permisiva y un conjunto de cuantizaciones que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB).

El repositorio GGUF, publicado el 12 de noviembre de 2026, incluye 12 variantes de cuantización estáticas generadas por mradermacher. No se dispone de información pública sobre la longitud de contexto, la composición exacta del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles específicos no disponibles) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | bengalí (bn), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un transformer decoder-only de 1.543.714.304 parámetros. El ajuste se realizó mediante QLoRA (quantized low-rank adaptation) seguido de SFT sobre el dataset `SheikhMinds/rudushi-bangla-sft`, un corpus orientado a bengalí. Las etiquetas del repositorio mencionan explícitamente razonamiento, chain-of-thought y self-reflection, lo que sugiere que el dataset de SFT incluye trazas de razonamiento en lugar de únicamente pares pregunta-respuesta directos.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.). La cuantización GGUF ha sido realizada por mradermacher con cuantizaciones estáticas; según la model card, las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en bengalí e inglés.
- Razonamiento explícito mediante chain-of-thought, según las etiquetas del modelo.
- Self-reflection: el modelo está entrenado para revisar y corregir su propio razonamiento.
- Ajuste por instrucciones (SFT) orientado a diálogo multi-turno.
- Capacidad multilingüe limitada a los dos idiomas declarados (bn, en); no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking separado.
- No se documenta soporte nativo de contexto largo más allá de lo que permita la arquitectura base (no disponible).

## Casos de uso

- Atención al cliente en bengalí: el modelo puede gestionar conversaciones multi-turno en bengalí con un coste computacional muy bajo, adecuado para despliegues en CPU o GPUs de gama baja en centros de contacto regionales.
- Asistentes educativos en bengalí: gracias a su entrenamiento en chain-of-thought, puede explicar paso a paso problemas de matemáticas o lógica a estudiantes, mostrando el razonamiento intermedio.
- Traducción asistida bn-en: útil para borradores de traducción y para tareas de post-edición en flujos donde un traductor humano revisa la salida.
- Generación de contenido localizado: redacción de textos de marketing, FAQ y documentación en bengalí para productos que operan en Bangladés o Bengala Occidental.
- Prototipado rápido en investigación: su tamaño (1,5 B) y sus cuantizaciones de 0,8-1,7 GB permiten experimentar con ajuste fino y evaluación en una sola GPU consumer.
- Procesamiento de documentos en bengalí: resumen y extracción de información de textos administrativos o periodísticos, con la salvedad de que la longitud de contexto no está documentada.
- Despliegue en el borde (edge): la variante Q4_K_M (1,1 GB) cabe en dispositivos con 2-4 GB de RAM, lo que habilita asistentes offline en portátiles modestos o mini-PC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q4_K_M, 1,7 GB para Q8_0 y 3,2 GB para f16 (tamaños de archivo; la VRAM real debe sumar el overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y permitirán lotes grandes o contextos amplios.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui; para el modelo base en safetensors, transformers con aceleración por GPU.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rudushi-1-1.5b | 1,54 B | no disponible | bn, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens (versión base) | multilingüe (incluye bn parcial) | Apache 2.0 | GGUF, safetensors |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | multilingüe (8 idiomas oficiales, bn no oficial) | Llama 3.2 Community License | GGUF, safetensors |
| Gemma 2 2B | 2,6 B | 8 192 tokens | multilingüe | Gemma Terms of Use | GGUF, safetensors |

La comparación se basa en características públicas de los modelos alternativos; no se dispone de benchmarks que permitan comparar rendimiento real en bengalí. La ventaja diferencial de rudushi-1-1.5b es su especialización declarada en bengalí con razonamiento explícito y licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset de SFT específico, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: presente como en cualquier modelo de 1,5 B; el modo de razonamiento explícito no elimina la posibilidad de generar cadenas de pensamiento plausibles pero incorrectas.
- Limitaciones de idioma: solo se declaran bengalí e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto: no documentada, lo que impide planificar despliegues que requieran ventanas largas sin una evaluación previa.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento del modelo base (no documentadas).
- Producción: al no haber benchmarks publicados ni métricas de latencia, se recomienda una evaluación propia antes de desplegar en entornos críticos.
- Las cuantizaciones Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/rudushi-1-1.5b-GGUF
- Modelo base: https://huggingface.co/SheikhMinds/rudushi-1-1.5b
- Dataset de SFT: https://huggingface.co/datasets/SheikhMinds/rudushi-bangla-sft
- Página de descargas del cuantizador: https://hf.tst.eu/model#rudushi-1-1.5b-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
