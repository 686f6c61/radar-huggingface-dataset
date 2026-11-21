# mradermacher/EVA-x-EVA-105b-GGUF

## Resumen

EVA-x-EVA-105b-GGUF es la versión cuantizada en formato GGUF del modelo EVA-x-EVA-105b, un modelo de lenguaje de aproximadamente 104.780 millones de parámetros (104,78 B) publicado por el usuario bruhzair y cuantizado por mradermacher, especialista habitual en la distribución de pesos GGUF para llama.cpp y derivados. El modelo original se ha generado mediante mergekit, la herramienta de fusión de modelos de arcee-ai, por lo que se trata de un merge de pesos y no de un entrenamiento desde cero. La model card no documenta la receta de fusión concreta (modelos de origen, método de merge ni hiperparámetros).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un modelo de escala ~100 B en hardware de consumo o en servidores de gama alta mediante cuantización de 2 a 8 bits, con ficheros que van desde 38,9 GB (Q2_K) hasta 111,4 GB (Q8_0), algunos divididos en varias partes. Por otro, es un ejemplo de la cadena de distribución típica del ecosistema open source: un autor publica un merge en safetensors y un tercero lo convierte a GGUF para su uso con llama.cpp, Ollama o LM Studio.

Las limitaciones de información son notables: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento, los idiomas (más allá de "en") ni resultados de benchmarks. Cualquier evaluación rigurosa exige consultar el modelo base bruhzair/EVA-x-EVA-105b, cuya model card no forma parte de la información disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 104.779.882.560 (~104,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no hay quants ponderados/imatrix disponibles según el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (los originales del modelo base están en safetensors, según los tags de HF) |

## Arquitectura y entrenamiento

El modelo base EVA-x-EVA-105b se ha construido con mergekit, lo que implica que sus pesos proceden de la combinación algorítmica de dos o más modelos preexistentes, no de un entrenamiento supervisado ni de un proceso de RLHF/DPO documentado. La model card del repositorio GGUF no detalla ni los modelos de origen, ni el método de fusión (linear, SLERP, TIES, DARE, passthrough, etc.), ni los hiperparámetros empleados. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino posteriores.

La arquitectura subyacente es un transformer decoder-only de ~104,78 B de parámetros, coherente con la escala de modelos tipo Llama-3.1-70B ampliados o fusiones de modelos de 70-120 B. No hay evidencia de que sea un modelo MoE, SSM o híbrido. La cuantización la ha realizado mradermacher con su pipeline habitual (conversión HF → GGUF y generación de quants estáticos K-quant e IQ), sin quants ponderados ni imatrix en el momento de la publicación, según indica el propio autor.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno (tag "conversational" en Hugging Face).
- Razonamiento general y respuesta a instrucciones, heredado de los modelos fusionados (no verificable sin benchmarks).
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Multilingüismo limitado: el único idioma declarado es inglés.
- Compatible con endpoints de inferencia (tag "endpoints_compatible" en Hugging Face).

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU única: los quants Q4_K_S (59,8 GB) y Q4_K_M (63,1 GB) caben en una A100 80 GB o en dos RTX 4090 de 24 GB, lo que permite desplegar un modelo de ~105 B sin infraestructura de centro de datos.
- Experimentación con llama.cpp y derivados: al ser GGUF, se puede cargar directamente en llama.cpp, Ollama o LM Studio para pruebas de prompts, comparación de quants y evaluación cualitativa.
- Evaluación de merges comunitarios: útil para investigadores que quieran medir cómo se comporta una fusión de ~105 B frente a sus modelos de origen en tareas de razonamiento y generación.
- Generación de texto en inglés para prototipos: chat, resumen y redacción en inglés con un modelo de gran escala ejecutado en hardware propio.
- Docencia y formación: permite ilustrar en un aula el flujo completo safetensors → GGUF → cuantización → inferencia local con un modelo de escala realista.
- Benchmarking de cuantización: comparar la degradación de calidad entre Q2_K (38,9 GB), Q4_K_M (63,1 GB) y Q8_0 (111,4 GB) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - Q2_K: ~39 GB.
  - Q3_K_S: ~46 GB; Q3_K_M: ~51 GB; Q3_K_L: ~55 GB.
  - IQ4_XS: ~57 GB; Q4_K_S: ~60 GB; Q4_K_M: ~63 GB.
  - Q5_K_S: ~72 GB; Q5_K_M: ~74 GB.
  - Q6_K: ~86 GB.
  - Q8_0: ~111 GB.
- GPU recomendadas:
  - Q8_0 y Q6_K: A100 80 GB en configuración multi-GPU, H100 80 GB, o 2× A100/H100.
  - Q4_K_M / Q4_K_S: una A100 80 GB o H100 80 GB; también 4× RTX 4090 (96 GB agregados).
  - Q2_K / Q3_K_S: 2× RTX 4090 (48 GB) o 1× RTX 6000 Ada (48 GB).
- En consumer GPU: no cabe en una única RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Requiere al menos 2 GPU de 24 GB para los quants más pequeños, o descarga parcial a RAM del sistema (CPU offload), con la penalización de latencia correspondiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). No se documenta soporte en vLLM ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo denso de ~105 B en Q4_K_M sobre una A100 80 GB suele quedar en el rango de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| EVA-x-EVA-105b-GGUF (este) | ~104,78 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelo base bruhzair/EVA-x-EVA-105b | ~104,78 B | no disponible | no disponible | safetensors | Hugging Face (bruhzair) |
| Llama 3.1 70B Instruct | 70,6 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Meta / Hugging Face |
| Qwen2.5 72B Instruct | 72,7 B | 128 K | Apache 2.0 (con matices) | safetensors, GGUF | Alibaba / Hugging Face |

La comparación con Llama 3.1 70B y Qwen2.5 72B es solo orientativa por escala: no hay datos de benchmarks de EVA-x-EVA-105b que permitan afirmar equivalencia de rendimiento. La ventaja de los modelos citados es la documentación completa (contexto, licencia, benchmarks); la de EVA-x-EVA-105b es su mayor número de parámetros, aunque sin evidencia pública de que eso se traduzca en mejor calidad.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial libre. Es imprescindible contactar con el autor del modelo base (bruhzair) antes de cualquier despliegue en producción.
- Modelo derivado de un merge con mergekit: la calidad depende de los modelos de origen y de la receta de fusión, que no se documenta. Los merges pueden heredar sesgos y comportamientos inconsistentes de sus componentes.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Idioma: solo se declara inglés. El rendimiento en castellano es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificarlo empíricamente.
- Sin benchmarks: no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni similares. No se debe asumir que supera a modelos de 70 B bien documentados solo por tener más parámetros.
- Sin quants imatrix/ponderados: los quants disponibles son estáticos, lo que puede implicar mayor degradación en Q2_K y Q3_K frente a alternativas imatrix.
- Repositorio de 712,9 GB: la descarga completa es costosa; conviene descargar únicamente el quant deseado.
- Ficheros multiparte: Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M y Q6_K están divididos en 2 partes; Q8_0 en 3. Es necesario concatenarlas correctamente antes de usar.
- Bajo número de descargas (21) y ningún "like": ecosistema de validación prácticamente nulo; no hay retroalimentación de la comunidad sobre su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EVA-x-EVA-105b-GGUF
- Modelo base: https://huggingface.co/bruhzair/EVA-x-EVA-105b
- Página de descargas del autor: https://hf.tst.eu/model#EVA-x-EVA-105b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- mergekit (herramienta de fusión): no se proporciona enlace en la información disponible; se menciona como tag.
