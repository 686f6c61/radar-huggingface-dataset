# mradermacher/SJT-990M-GGUF

## Resumen

SJT-990M-GGUF es la versión cuantizada en formato GGUF del modelo Sakalti/SJT-990M, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad. El modelo original es un transformer de aproximadamente 988 millones de parámetros, afinado mediante SFT (supervised fine-tuning) sobre una base de la familia Qwen2, y orientado a generación de texto conversacional en inglés y japonés. Esta versión GGUF resuelve el problema de despliegue en entornos con recursos limitados: permite ejecutar el modelo en CPU o en GPUs de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de datacenter.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo pequeño (sub-1B) que puede ejecutarse en hardware muy modesto, lo que lo hace útil para prototipado rápido, aplicaciones embebidas o entornos sin GPU dedicada. Por otro, ilustra el flujo habitual de la comunidad open source: un modelo base afinado por un autor (Sakalti) y cuantizado por otro (mradermacher) para maximizar su accesibilidad. El repositorio ofrece un abanico amplio de cuantizaciones, desde Q2_K hasta f16, con tamaños que van de 0,7 GB a 2,1 GB.

No se dispone de información pública sobre la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni los resultados de benchmarks. La model card del cuantizador es puramente operativa (lista de ficheros y agradecimientos) y no incluye detalles técnicos del modelo original más allá de los tags que indican Qwen2, SFT y los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, según tags del repositorio) |
| Parametros totales | 988.064.640 (~990M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo original Sakalti/SJT-990M se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. Los tags del repositorio indican que se ha sometido a un proceso de SFT (supervised fine-tuning) usando las librerías TRL y Unsloth, lo que sugiere un ajuste supervisado sobre un modelo preentrenado de la familia Qwen2, probablemente Qwen2-0.5B o similar, aunque el recuento de parámetros (988M) no coincide exactamente con las variantes públicas conocidas de Qwen2, por lo que podría tratarse de una configuración modificada o de un modelo derivado con vocabulario o capas ajustadas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card del cuantizador no aporta estos datos y el repositorio del modelo base no se ha incluido en la información proporcionada. La cuantización estática realizada por mradermacher emplea el formato GGUF con version 2 de quantize_version y output_tensor_quantised a 1, lo que indica que se cuantizaron los tensores de salida además de los pesos principales.

## Capacidades

- Generación de texto conversacional en inglés y japonés, según los idiomas declarados en la model card.
- Razonamiento básico y respuesta a instrucciones, derivado del proceso de SFT.
- Soporte de conversaciones multi-turno (tag "conversational" en el repositorio).
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles, según los tags.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte de visión, audio ni modos de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas a inglés y japonés; no se declara soporte de castellano.

## Casos de uso

- Prototipado de chatbots en inglés o japonés: el modelo puede gestionar conversaciones multi-turno en un portátil o en una CPU moderna gracias a sus cuantizaciones de 0,7-1,2 GB, lo que permite iterar rápidamente sin infraestructura cloud.
- Aplicaciones embebidas o de borde: con cuantizaciones Q4_K_S o Q4_K_M (0,8 GB) el modelo cabe en dispositivos con 2-4 GB de RAM, lo que lo hace adecuado para asistentes locales en Raspberry Pi o mini-PC.
- Generación de texto en pipelines de bajo coste: para tareas de resumen, reescritura o clasificación simple en inglés/japonés donde no se requiere un modelo grande y se prioriza el throughput por vatio.
- Filtrado y preprocesado de datos: el modelo puede usarse para generar etiquetas, reformatear texto o producir datos sintéticos en inglés y japonés dentro de un pipeline de curación de datasets.
- Enseñanza y experimentación: al ser un modelo sub-1B con licencia Apache 2.0, es adecuado para cursos, talleres y experimentos de fine-tuning o cuantización sin restricciones de licencia.
- Servicio de inferencia ligero con TGI: los tags indican compatibilidad con text-generation-inference, por lo que puede desplegarse como endpoint HTTP en un contenedor con recursos mínimos para aplicaciones internas.
- Traducción asistida inglés-japonés: aunque no se declara explícitamente como modelo de traducción, su entrenamiento en ambos idiomas permite usarlo para borradores de traducción o para tareas de parafraseo cross-lingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB (Q2_K/Q3_K_S) y 2,1 GB (f16) solo para los pesos; añadir overhead de contexto y caché KV (típicamente 0,5-2 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4-Q5 (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda al menos 6 GB (RTX 2060, RTX 3060).
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más; también en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI), y cualquier runtime compatible con GGUF. El repositorio incluye cuantizaciones estáticas; las cuantizaciones con imatrix están en un repositorio separado (SJT-990M-i1-GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de ~1B en Q4_K_M, es razonable esperar decenas de tokens por segundo en GPU de consumo y varios tokens por segundo en CPU moderna, pero estos valores no están confirmados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SJT-990M-GGUF | ~990M | No disponible | en, ja | Apache 2.0 | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación pública de Qwen) | Multilingüe (incluye es) | Apache 2.0 | safetensors, GGUF | Hugging Face (Qwen) |
| Qwen2.5-1.5B-Instruct | 1.540M | 32.768 tokens | Multilingüe (incluye es) | Apache 2.0 | safetensors, GGUF | Hugging Face (Qwen) |
| Llama-3.2-1B-Instruct | 1.240M | 128.000 tokens | Multilingüe (8 idiomas) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (Meta) |

La comparativa se basa en datos públicos de los modelos alternativos; para SJT-990M no se dispone de contexto ni benchmarks verificables. La principal ventaja de SJT-990M-GGUF es su licencia Apache 2.0 pura (frente a la licencia comunitaria de Llama 3.2) y su especialización declarada en japonés, aunque carece de la documentación técnica y el soporte multilingüe amplio de las alternativas de Qwen y Meta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2 y afinarse con SFT, es probable que herede sesgos del corpus de preentrenamiento, pero no hay información específica.
- Riesgo de alucinación: alto en modelos de ~1B, especialmente en tareas de conocimiento factual y razonamiento complejo; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto: la longitud de contexto no está documentada; no debe asumirse una ventana larga. Para conversaciones multi-turno extensas, verificar experimentalmente el límite antes de desplegar.
- Limitaciones de idioma: solo inglés y japonés declarados; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base Sakalti/SJT-990M debe verificarse por si tuviera condiciones adicionales (no disponibles en la información proporcionada).
- Caveat de producción: el repositorio tiene muy pocas descargas (47) y ningún like, lo que indica escasa validación comunitaria; no se recomienda para producción crítica sin una evaluación propia exhaustiva.
- El cuantizador advierte que las cuantizaciones IQ son a menudo preferibles a las no-IQ de tamaño similar; para máxima calidad, usar Q6_K o Q8_0, y para velocidad Q4_K_M.
- No hay información sobre el proceso de alineación (RLHF/DPO), por lo que el comportamiento en temas sensibles es incierto.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/SJT-990M-GGUF
- Modelo base original: https://huggingface.co/Sakalti/SJT-990M
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/SJT-990M-i1-GGUF
- Página de overview del cuantizador: https://hf.tst.eu/model#SJT-990M-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
