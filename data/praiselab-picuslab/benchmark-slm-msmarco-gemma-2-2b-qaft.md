# praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-qaft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-qaft` es un adaptador LoRA (PEFT) publicado por la organización praiselab-picuslab sobre el modelo base `google/gemma-2-2b`. Por los tags del repositorio (`benchmark-slm`, `dataset-msmarco`, `strategy-qaft`, `or2`) se trata de un artefacto de evaluación comparativa de modelos de lenguaje pequenos (SLM), ajustado sobre el conjunto de datos Microsoft MS MARCO y orientado a generacion de texto en ingles.

El repositorio contiene unicamente los pesos del adaptador (0,1 GB, formato safetensors), no un modelo completo, por lo que su uso requiere descargar y cargar el modelo base Gemma 2 de 2.600 millones de parametros y aplicar el adaptador mediante la libreria PEFT. Esto lo convierte en un componente ligero y facil de intercambiar dentro de un pipeline de evaluacion, pero no en un modelo autónomo listo para produccion.

Su relevancia es acotada y experimental: cuenta con 0 descargas y 0 likes, el acceso esta restringido (gated) y no se ha publicado informacion sobre licencia, datos de entrenamiento, hiperparametros ni resultados de benchmarks. Debe tratarse, por tanto, como una pieza de un banco de pruebas interno mas que como un modelo recomendado para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA sobre capas de atencion y MLP (PEFT) |
| Parametros totales | 2.600 M aproximadamente en el modelo base; el adaptador LoRA ocupa 0,1 GB en disco (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredado del modelo base `google/gemma-2-2b`; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio; el adaptador se distribuye en safetensors y el modelo base admite cuantizacion int8/int4 mediante bitsandbytes, GPTQ o AWQ con herramientas externas |
| Idiomas soportados | Ingles (`en`) segun los tags del repositorio |
| Licencia | No disponible en el repositorio; el uso queda sujeto a los Gemma Terms of Use del modelo base |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); requiere el modelo base `google/gemma-2-2b` |
| Tamano del repositorio | 0,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se monta sobre Gemma 2 2B, un transformer decoder-only de 2.600 millones de parametros con 8.192 tokens de contexto, atención con ventana deslizante alternada y atención global, vocabulario de 256.000 tokens y normalizacion RMSNorm. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de bajo rango entrenables, lo que explica el reducido tamano del repositorio (0,1 GB) frente a los aproximadamente 5 GB que ocuparian los pesos completos en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El tag `dataset-msmarco` apunta a un ajuste supervisado sobre Microsoft MS MARCO, un corpus de mas de un millon de consultas reales de Bing con pasajes asociados y respuestas anotadas, habitualmente empleado en tareas de question answering y ranking de pasajes. El tag `strategy-qaft` sugiere una estrategia de fine-tuning orientada a question answering, aunque su definicion exacta no esta documentada en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, con el nivel de fluidez y conocimiento del modelo base Gemma 2 2B.
- Respuesta a preguntas sobre pasajes: el ajuste sobre MS MARCO apunta a la extraccion de respuestas a partir de contexto documental.
- Comprension lectora de extractos en ingles dentro de la ventana de contexto del modelo base.
- Generacion condicionada por contexto, adecuada para tareas de tipo RAG cuando se le proporcionan pasajes recuperados.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes, razonamiento multi-paso ni modos de pensamiento explicito (thinking mode).
- No se ha documentado capacidad de vision ni de audio.
- Capacidad multilingue: limitada al ingles segun los tags, aunque el modelo base Gemma 2 fue entrenado en varios idiomas.
- No se ha documentado ninguna capacidad especial adicional.

## Casos de uso

- Evaluacion comparativa de SLM: el adaptador sirve como variante experimental dentro de un banco de pruebas (`benchmark-slm`) para medir el efecto del fine-tuning QAFT sobre MS MARCO frente a otras estrategias y otros modelos base, manteniendo constante el resto de condiciones.
- Question answering extractivo sobre pasajes: dado un contexto documental en ingles, el modelo puede generar la respuesta a una consulta, aprovechando el ajuste especifico sobre MS MARCO para tareas de comprension lectora.
- Componente generativo en pipelines RAG: combinado con un recuperador (BM25, embeddings), el adaptador puede formular respuestas a partir de los pasajes recuperados, con un coste de inferencia bajo al partir de un modelo de 2.600 M de parametros.
- Reranking o validacion de candidatos: el modelo puede puntuar o reformular respuestas candidatas generadas por un recuperador, como paso intermedio en un sistema de busqueda documental en ingles.
- Prototipado rapido en entornos con GPU de consumo: al necesitar unicamente un adaptador de 0,1 GB sobre un modelo de 2,6 B, permite experimentar con fine-tuning especifico de dominio sin infraestructura dedicada.
- Generacion de respuestas cortas en ingles para asistentes de documentacion tecnica: con pasajes de manuales o FAQ como contexto, el modelo produce respuestas concisas dentro de los 8.192 tokens de ventana.
- Reproducibilidad de experimentos academicos: al estar publicado como adaptador PEFT aislado, facilita la replicacion de resultados sobre MS MARCO sin necesidad de redistribuir los pesos completos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 2.600 M de parametros mas adaptador): aproximadamente 5,2 GB en BF16/FP16, 2,7 GB en int8 y 1,5 GB en int4, sin contar la cache KV.
- GPU recomendadas para BF16: NVIDIA A100, H100, L40S o RTX 4090; tambien resulta viable en RTX 3090 y RTX 4080.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 8 bits y en tarjetas con 6-8 GB en 4 bits (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4060 Ti). En CPU es viable con llama.cpp tras fusionar el adaptador y convertir a GGUF.
- Opciones de despliegue: HuggingFace Transformers con PEFT (carga del adaptador mediante `PeftModel`), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama tras fusionar los pesos (`merge_and_unload`) y convertir a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y dependeran del backend, la cuantizacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Gemma 2 2B) | 2.600 M + LoRA | 8.192 tokens | No disponible (sujeta a Gemma Terms of Use) | Gated en HuggingFace, 0 descargas |
| google/gemma-2-2b (base) | 2.600 M | 8.192 tokens | Gemma Terms of Use | Publico en HuggingFace |
| Qwen2.5-3B | 3.090 M | 32.768 tokens | Qwen Research License | Publico en HuggingFace |
| Llama 3.2 3B | 3.210 M | 128.000 tokens | Llama 3.2 Community License | Gated en HuggingFace |
| Phi-3-mini | 3.800 M | 4.096 tokens (128.000 con LongRoPE) | MIT | Publico en HuggingFace |

La comparacion es estructural: no existen datos publicados de rendimiento de este adaptador que permitan contrastar calidad frente a las alternativas. En tamano y contexto, el modelo base Gemma 2 2B queda por debajo de Qwen2.5-3B y Llama 3.2 3B en ventana de contexto, y su licencia es mas restrictiva que la de Phi-3-mini (MIT).

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, hiperparametros de LoRA, metricas ni limitaciones declaradas por el autor.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los Gemma Terms of Use del modelo base y sin confirmacion explicita del autor del adaptador.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a cualquier despliegue automatizado.
- Idioma: los tags declaran unicamente ingles; el rendimiento en castellano u otras lenguas no esta garantizado pese a que el modelo base sea multilingue.
- Riesgo de alucinacion: inherente a un modelo de 2.600 M de parametros; en tareas de QA sobre pasajes puede generar respuestas no sustentadas por el contexto.
- Sesgos: no evaluados; el ajuste sobre MS MARCO puede heredar sesgos de las consultas y pasajes de Bing, no documentados.
- Ventana de contexto de 8.192 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas sin estrategias de troceado.
- Artefacto experimental: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad; no debe tratarse como modelo de referencia en produccion.
- Dependencia del modelo base: no es desplegable de forma autonoma; requiere descargar Gemma 2 2B, lo que implica aceptar sus terminos y disponer de almacenamiento adicional.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-qaft
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset MS MARCO en HuggingFace: https://huggingface.co/datasets/microsoft/ms_marco
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Informe tecnico de Gemma 2: https://arxiv.org/abs/2408.00118
- Repositorio de llama.cpp (conversion a GGUF y despliegue en CPU): https://github.com/ggml-org/llama.cpp
