# hoangphu7122002ai/law-rag-qwen3.5-9b-dpo

## Resumen

law-rag-qwen3.5-9b-dpo es un ajuste fino del modelo base Qwen/Qwen3.5-9B desarrollado por el usuario hoangphu7122002ai como parte del proyecto law-rag, un sistema de respuesta a preguntas con recuperacion aumentada (RAG) sobre legislacion vietnamita, creado para el curso de Large Language Models de la HCMUT. El modelo resuelve la tarea de generar respuestas ancladas a fragmentos legales recuperados, citando clausulas y manteniendo la extension de las citas.

El modelo tiene 9.409.813.744 parametros (9,65B segun la model card) y se entrena en dos fases: un ajuste supervisado con LoRA y dos rondas de DPO on-policy (preferencias generadas por el propio modelo). Su proposito declarado es puramente analitico: medir cuanto del error restante del sistema se debe al tamano del modelo, ya que el sistema oficial entregado al curso debe tener menos de 4B de parametros.

Es relevante como punto de referencia de escalado: con la misma recuperacion, los mismos datos y los mismos hiperparametros, pasar de 2B a 9B solo anade 0,034 de ROUGE-L en test, lo que sugiere que el error residual esta dominado por la seleccion de clausulas y la extension de las citas, no por la capacidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,65B segun la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de servicio (`--max-model-len 32768`); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other (no se detalla el texto de la licencia) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y aplica LoRA con rango 32 sobre los datos v3b del proyecto (1.688 filas de entrenamiento y 188 de validacion, decontaminadas contra el conjunto de test). El SFT usa learning rate 1e-4, 3 epocas, batch efectivo 1 x 16 y longitud maxima de 12.288 tokens. Posteriormente se ejecutan dos rondas de DPO on-policy: en cada ronda se generan 8 respuestas por prompt de entrenamiento (1 greedy y 7 con temperatura 0,7) y se construyen pares mejor/peor por ROUGE-L con margen minimo de 0,1. La primera ronda produce 1.167 pares (beta 0,1, lr 2e-5, 1 epoca, LoRA r 32) y la segunda 979 pares partiendo del modelo de la ronda 1, con un coste de 99 minutos en una L40S. Los adaptadores se fusionan en los pesos finales en bf16.

La innovacion metodologica destacable no esta en la arquitectura sino en el pipeline: DPO on-policy con seleccion de pares por ROUGE-L sobre respuestas generadas por el propio modelo, y evaluacion con decodificacion MBR-8 (minimum Bayes risk con 8 muestras) ademas de greedy. El prompt de inferencia incluye recuperacion densa top 50, reranking a top 5 y 2 ejemplos few-shot.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas y abstractivas sobre legislacion vietnamita.
- Razonamiento sobre contexto recuperado: seleccion de la clausula relevante y delimitacion de la cita.
- Question answering con citas: el entrenamiento optimiza ROUGE-L, lo que favorece respuestas cercanas al texto legal de referencia.
- Procesamiento de contexto largo: el servicio de ejemplo configura 32.768 tokens, suficiente para concatenar 5 fragmentos recuperados y ejemplos few-shot.
- Capacidad multimodal heredada del modelo base segun el tag `image-text-to-text`; no se documenta su uso en este ajuste.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- Multilingue limitado: entrenado y evaluado unicamente en vietnamita.

## Casos de uso

- Asistencia legal interna en vietnamita: el modelo responde consultas sobre normativa a partir de fragmentos recuperados de una base documental, con citas verificables, lo que permite a un revisor humano comprobar la fuente.
- Punto de referencia de escalado en investigacion: sirve para comparar el efecto del tamano (2B vs 4B vs 9B) con receta identica y cuantificar cuanto error residual es atribuible al modelo.
- Evaluacion de pipelines RAG: al mantener fija la recuperacion (densa top 50, reranker top 5), permite aislar el componente generativo en experimentos de ablacion.
- Generacion de borradores de resumenes normativos: con 32.768 tokens de contexto puede procesar varios articulos y producir una sintesis con referencias a clausulas concretas.
- Base para destilacion: al ser el miembro mayor de la familia law-rag, sus salidas pueden usarse para destilar el comportamiento en modelos por debajo de 4B.
- Servicio de inferencia con vLLM: el ejemplo oficial usa `--enable-prefix-caching`, adecuado para escenarios con prompts de sistema y few-shot repetidos en produccion.

## Benchmarks y rendimiento

Resultados de la model card sobre el conjunto de desarrollo (300 preguntas) y test (200 preguntas retenidas), con la misma recuperacion y 2 ejemplos few-shot. La metrica es ROUGE-L.

| Modelo | Parametros | Dev: SFT → DPO r1 → DPO r2 (greedy) | Dev MBR-8 | Test greedy / MBR-8 |
|---|---|---|---|---|
| law-rag-qwen3.5-2b-dpo (sistema reportado) | 2,27B | .633 → .654 → .664 | .672 | .643 / .652 |
| law-rag-qwen3.5-4b-dpo | 4,66B | .636 → .669 → .679 | .686 | .666 / .672 |
| law-rag-qwen3.5-9b-dpo | 9,65B | .664 → .693 → .700 | .705 | .677 / .686 |

Conclusiones declaradas por el autor: cuadruplicar parametros (2B a 9B) aporta 0,034 de ROUGE-L en test; DPO aporta entre 0,03 y 0,04 en todos los tamanos; el error restante se concentra en la eleccion de clausula y la extension de la cita. No se publican resultados en benchmarks estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, mas cache KV; con 32.768 tokens de contexto la reserva de cache KV es significativa y no se documenta su tamano exacto.
- GPU recomendadas: L40S (usada en el entrenamiento de la ronda 2 de DPO), A100 40/80 GB y H100 para servicio con contexto completo y concurrencia.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16, pero el margen para cache KV con 32.768 tokens es ajustado; no hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) para reducir huella.
- Despliegue: vLLM es la opcion documentada (`vllm serve ... --dtype bfloat16 --max-model-len 32768 --enable-prefix-caching --port 8000`). llama.cpp, Ollama y TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles. El unico dato de coste es el entrenamiento de la ronda 2 de DPO (99 minutos en 1 x L40S).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test ROUGE-L (greedy / MBR-8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| law-rag-qwen3.5-9b-dpo | 9,65B | 32.768 configurado | .677 / .686 | other | Hugging Face, 0 descargas |
| law-rag-qwen3.5-4b-dpo | 4,66B | no disponible | .666 / .672 | other | Hugging Face |
| law-rag-qwen3.5-2b-dpo | 2,27B | no disponible | .643 / .652 | other | Hugging Face (sistema reportado) |

Los tres modelos comparten receta, datos y pipeline de recuperacion, por lo que la comparacion aisla el efecto del tamano. Frente a modelos legales genericos en vietnamita no se dispone de datos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado para una unica tarea de curso; las respuestas son referencias documentales, no asesoramiento legal.
- Las puntuaciones dependen del pipeline de recuperacion concreto (densa top 50, reranker top 5) y de los 2 ejemplos few-shot; cambiar cualquiera de los dos invalida los numeros reportados.
- Solo vietnamita; no se ha evaluado su comportamiento en otros idiomas.
- Licencia "other" sin texto publico: es necesario contactar con el autor antes de cualquier uso comercial.
- Riesgo de alucinacion en citas legales: el modelo puede atribuir texto a una clausula incorrecta o extender la cita mas alla del fragmento recuperado, precisamente el tipo de error que el autor identifica como dominante.
- Sin cuantizaciones publicadas ni benchmarks estandar; el despliegue en hardware de consumo requiere validacion propia.
- Modelo sin descargas ni validacion externa en el momento de la ficha; tratar los resultados como no replicados de forma independiente.
- El propio autor lo declara "analysis only": no es el sistema entregado al curso y no debe presentarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-9b-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sistema reportado (2B): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Modelo intermedio (4B): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-4b-dpo
- Dataset: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Repositorio del proyecto: https://github.com/hoangphu7122002/law-rag
- Manual de uso: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
