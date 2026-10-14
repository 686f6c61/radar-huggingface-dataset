# ML-Intern-lab/embeddinggemma2-nli-lora-poc

## Resumen

EmbeddingGemma-2 · AllNLI LoRA proof of concept es un adaptador LoRA entrenado sobre el modelo de embeddings `google/embeddinggemma-2` (744M parametros, torre de texto) por el usuario ML-Intern-lab. No es un checkpoint pensado para produccion, sino una prueba de concepto de pipeline: el objetivo declarado es demostrar que se puede ejecutar un fine-tune de recuperacion (retrieval) con objetivo contrastivo en aproximadamente 60 segundos sobre una GPU Nvidia T4.

El adaptador se entrena sobre el subconjunto `pair` del dataset `sentence-transformers/all-nli` usando `CachedMultipleNegativesRankingLoss` con mini-batch de 8 y batch efectivo de 64 mediante negativos in-batch. Solo se aplican adaptadores a las proyecciones de atencion y MLP de la torre de texto, con r=16, alpha=32 y dropout 0.1, lo que da aproximadamente 5,0M parametros entrenables sobre los 744M del modelo base.

Su relevancia es metodologica mas que de rendimiento: sirve como plantilla reproducible de fine-tune eficiente de un encoder de embeddings con PEFT, y como ejemplo de integracion con `sentence-transformers`. El propio autor advierte que la ejecucion de 9 pasos equivale a un 0,18% de una epoca y que el ciclo de warmup-convergencia no llega a completarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (torre de texto de EmbeddingGemma-2) con adaptadores LoRA en atencion y MLP |
| Parametros totales | 744M en el modelo base; adaptador LoRA de aproximadamente 5,0M parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento del adaptador uso secuencia de 128 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | apache-2.0 (adaptador) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, paquete PEFT con `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo es un adaptador de tipo LoRA sobre la torre de texto de `google/embeddinggemma-2`, un encoder de 744M de parametros orientado a generacion de embeddings de frases. Los adaptadores se insertan en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de la torre de texto, con rango r=16, alpha=32 y dropout 0.1. El repositorio contiene unicamente el paquete estandar de PEFT: `adapter_config.json` y `adapter_model.safetensors` de aproximadamente 19 MB. Los 168 tensores `lora_B` fueron verificados como no nulos, es decir, contienen pesos efectivamente entrenados.

El entrenamiento emplea `CachedMultipleNegativesRankingLoss` (mini-batch 8) sobre el subconjunto `pair` de `sentence-transformers/all-nli`, con batch de 64, negativos in-batch y sin sampler de deduplicacion. Se ejecutan 9 pasos con tasa de aprendizaje 2e-5, 10% de warmup, longitud de secuencia 128 y precision fp16 sobre una Nvidia T4, lo que supone aproximadamente 60 segundos de computo. Se utilizan los prefijos `query` y `document` integrados en el modelo base. La receta sigue la empleada en `sentence-transformers/embeddinggemma-300m-medical`, donde el mismo objetivo a escala completa elevo el nDCG@10 de 0,847 a 0,903.

## Capacidades

- Generacion de embeddings de frases para busqueda semantica y similitud entre oraciones (pipeline `feature-extraction` / `sentence-similarity`).
- Recuperacion densa (dense retrieval) con separacion de roles query/document mediante prefijos integrados.
- Codificacion de pares ancla-positivo con margen contrastivo tras el ajuste: cos(ancla, positivo) de 0,80 y 0,88 frente a cos(ancla, negativo) de 0,61 y 0,56 en la comprobacion de cordura reportada.
- Integracion con el ecosistema `sentence-transformers` mediante `PeftModel.from_pretrained`.
- Tool calling: no soportado ni documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el modelo es un encoder de embeddings, no un modelo generativo.
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento (AllNLI) es en ingles.

## Casos de uso

- Prototipado rapido de sistemas de recuperacion: el adaptador permite validar en minutos un pipeline de fine-tune contrastivo sobre EmbeddingGemma-2 antes de invertir en un entrenamiento completo, gracias a los 9 pasos y 60 segundos de ejecucion reportados.
- Busqueda semantica interna sobre documentacion tecnica: sirve como punto de partida para indexar y consultar un corpus propio mediante similitud coseno, sustituyendo el checkpoint final por un entrenamiento mayor con la misma receta.
- Deduplicacion y agrupacion de textos: los embeddings pueden alimentar clustering o deteccion de near-duplicates en pipelines de limpieza de datos.
- Clasificacion de intenciones por similitud: comparar la consulta de un usuario contra un conjunto de ejemplos etiquetados usando los prefijos `query`/`document`.
- Evaluacion comparativa de estrategias PEFT: el repositorio documenta configuracion, hiperparametros y perdidas, por lo que resulta util como referencia reproducible para comparar rangos LoRA, tasas de aprendizaje o funciones de perdida.
- Filtrado de pares de entrenamiento: el modelo puede puntuar pares de frases para descartar negativos triviales o positivos ruidosos en la construccion de un dataset mayor.
- Experimentacion docente o de investigacion: por su tamano reducido y su coste de entrenamiento, es adecuado para demostrar el funcionamiento de `MultipleNegativesRankingLoss` y `CachedMNRL` en un entorno con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, BEIR u otros) en la informacion disponible. Las unicas metricas reportadas por el autor son las siguientes:

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de entrenamiento | 0,72 -> ~0,68 de media en 9 pasos | Ruidoso a esta escala; ~0,18% de una epoca |
| Perdida de evaluacion (1.000 pares dev de AllNLI) | 0,981 tras 5 pasos -> 0,959 tras 9 pasos | Aun en descenso al terminar el entrenamiento |
| cos(ancla, positivo) | 0,80 / 0,88 | Comprobacion de cordura tras el entrenamiento |
| cos(ancla, negativo) | 0,61 / 0,56 | Comprobacion de cordura tras el entrenamiento |
| nDCG@10 | 0,847 -> 0,903 | Referencia de otro modelo (embeddinggemma-300m-medical) con la misma perdida a escala completa; no corresponde a este POC |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp16 para los 744M parametros del modelo base, mas unos 19 MB del adaptador. Cabe en cualquier GPU consumer con 4 GB o mas de VRAM.
- Entrenamiento del adaptador: el autor reporta 60 segundos en una Nvidia T4 en fp16 con solo 5,0M parametros entrenables, por lo que una GPU consumer moderna (RTX 3060 o superior) es suficiente.
- GPU recomendadas: Nvidia T4 (verificada en la ejecucion documentada); cualquier GPU con soporte fp16 y al menos 4 GB de VRAM para inferencia.
- Despliegue: la ruta documentada es `sentence-transformers` combinado con `peft` (`PeftModel.from_pretrained`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| embeddinggemma2-nli-lora-poc | 744M base + ~5,0M adaptador | No disponible (entrenado a 128) | Perdida eval 0,959 tras 9 pasos | apache-2.0 | HuggingFace (0 descargas) |
| google/embeddinggemma-2 | 744M | No disponible | No disponible en la informacion | No disponible | HuggingFace (modelo base del adaptador) |
| sentence-transformers/embeddinggemma-300m-medical | 300M | No disponible | nDCG@10 0,903 tras entrenamiento completo | No disponible | HuggingFace (referencia de receta) |

No se dispone de datos comparativos frente a otras familias de embeddings (E5, BGE, GTE u otras) en la informacion proporcionada.

## Limitaciones y advertencias

- Es una prueba de concepto, no un checkpoint entrenado para calidad: 9 pasos equivalen aproximadamente al 0,18% de una epoca y el ciclo de warmup-convergencia no se completa.
- La perdida de evaluacion seguia descendiendo al final del entrenamiento (0,959 en el paso 9), lo que indica que el modelo esta lejos de converger.
- La perdida de entrenamiento es ruidosa a esta escala, por lo que no debe interpretarse como senal fiable de mejora.
- El adaptador se entrena solo sobre el subconjunto `pair` de AllNLI, un corpus en ingles de inferencia textual; no hay evidencia de rendimiento en otros idiomas ni en otros dominios.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de AllNLI, cabe esperar los sesgos propios de ese corpus.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo produce embeddings y no texto generado.
- La licencia declarada del adaptador es apache-2.0, pero el modelo base `google/embeddinggemma-2` puede estar sujeto a sus propios terminos de uso; conviene verificarlos antes de un uso comercial.
- El repositorio ocupa 1,5 GB, muy por encima de los ~19 MB del adaptador, lo que sugiere que contiene artefactos adicionales de la ejecucion de guardado.
- No se documentan tipos de cuantizacion ni limites de contexto del modelo base, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ML-Intern-lab/embeddinggemma2-nli-lora-poc
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/all-nli
- Modelo de referencia de la receta: https://huggingface.co/sentence-transformers/embeddinggemma-300m-medical
- Henderson et al., Efficient Natural Language Response Suggestion for Smart Reply (2017): https://arxiv.org/abs/1705.00652
- Reimers y Gurevych, Sentence-BERT (2019): https://arxiv.org/abs/1908.10084
- Gao et al., Scaling Deep Contrastive Learning Batch Size under Memory Limited Setup (2021): https://arxiv.org/abs/2101.06983
- ML Intern: https://hf.co/chat?mode=ml-intern
