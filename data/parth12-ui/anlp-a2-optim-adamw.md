# parth12-ui/anlp-a2-optim-adamw

## Resumen

anlp-a2-optim-adamw es un transformer denso decoder-only de 33,4 millones de parametros entrenado desde cero por el usuario parth12-ui como parte de la asignatura ANLP (Assignment 2, Part 2). El modelo no busca competir en capacidades generativas, sino servir como artefacto experimental: su proposito es comparar el comportamiento de distintos optimizadores (en este caso una implementacion propia de AdamW) bajo un protocolo de entrenamiento identico. Resuelve, por tanto, un problema de investigacion reproducible en optimizacion de modelos de lenguaje a pequena escala.

Tecnicamente es una arquitectura clasica: 8 capas, dimension de modelo 512 y una longitud de contexto de solo 256 tokens. Se entreno para prediccion del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus` durante 1x el dataset, lo que equivale a 39.075.840 tokens. Los hiperparametros documentados son lr=0.0006, betas=[0.9, 0.95], eps=1e-08 y weight_decay=0.1.

Su relevancia es limitada fuera del ambito academico: el repositorio acumula 0 descargas y 0 likes, no declara licencia y los resultados de generacion son muy pobres (BLEU de 1,34 en continuaciones greedy de 64 tokens). Es util como referencia metodologica para estudiar el efecto de AdamW frente a otros optimizadores, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (8 capas, d_model 512) |
| Parametros totales | 33.366.528 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer denso de tipo decoder-only, entrenado desde cero para modelado de lenguaje autoregresivo (prediccion del siguiente token). La configuracion es pequena: 8 capas, d_model 512 y una ventana de contexto de 256 tokens, lo que da un total de 33.366.528 parametros. La model card no detalla el numero de cabezas de atencion, la dimension de la FFN ni la presencia de embeddings atados, por lo que esos datos quedan como no disponibles.

El entrenamiento se realizo sobre `browndw/human-ai-parallel-corpus` durante 1x el dataset, es decir, 39.075.840 tokens. El elemento diferencial es el optimizador: una implementacion desde cero de AdamW (categoria AdamW) con lr=0.0006, betas=[0.9, 0.95], eps=1e-08 y weight_decay=0.1. No se menciona ninguna fase de ajuste por RLHF, DPO o SFT, ni tecnicas de decodificacion especulativa, atencion lineal o variantes hibridas. El repositorio incluye un `train_log.jsonl` con la perdida de validacion y el BLEU de test registrados cada 0,1x del dataset, lo que permite trazar la curva de convergencia.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de secuencias mediante decodificacion greedy.
- Modelado de lenguaje: calculo de probabilidad del siguiente token y, por extension, de perplejidad.
- Continuacion de texto limitada a 64 tokens en la evaluacion publicada.
- Idiomas: unicamente ingles, segun el campo `language` de la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidad de instruccion (chat): no disponible; no se documento ningun ajuste instructivo.

## Casos de uso

- Reproduccion de experimentos de optimizacion: el modelo sirve como punto de referencia fijo para comparar AdamW contra otros optimizadores bajo un presupuesto de tokens identico (1x dataset), aislando el efecto del optimizador sobre la perdida de validacion.
- Docencia de entrenamiento de LLM: con 33,4M de parametros y 39M de tokens de entrenamiento, el ciclo completo se puede reproducir en una sola GPU consumer, lo que lo hace adecuado para practicas de preentrenamiento desde cero.
- Auditoria de curvas de convergencia: el `train_log.jsonl` permite analizar la evolucion de la perdida y del BLEU cada 0,1x del dataset, util para estudiar inestabilidad o saturacion temprana.
- Estudio del corpus human-AI parallel: dado que el entrenamiento usa `browndw/human-ai-parallel-corpus`, el modelo puede emplearse para analizar como un transformer pequeno modela texto con estructura paralela humano-IA.
- Prueba de humo de pipelines de entrenamiento y checkpointing: su tamano minimo permite validar scripts de carga, serializacion en safetensors y evaluacion de extremo a extremo en minutos.
- Baseline inferior en evaluaciones de generacion: su BLEU de 1,34 lo convierte en una cota inferior util para verificar que un modelo candidato de mayor tamano realmente aporta mejora medible.
- Investigacion sobre limites del contexto corto: con solo 256 tokens de ventana, es un banco de pruebas para medir degradacion en tareas que requieren contexto largo.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a metricas internas del entrenamiento a 1x del dataset. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (a 1x dataset) | Valor |
|---|---|
| Perdida de validacion | 4,0597 |
| Perplejidad de validacion | 57,96 |
| BLEU de test (continuacion greedy de 64 tokens) | 1,34 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: los 33,4M de parametros ocupan aproximadamente 133 MB en fp32 y unos 67 MB en fp16, sin contar activaciones ni cache KV. Con la ventana de 256 tokens, la cache KV es despreciable.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (RTX 3060, RTX 4090, T4, A100, H100). El modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al no ser una arquitectura estandar de Hugging Face Transformers (se carga con `model_src.model.Transformer` y `safetensors.torch.load_model`), no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La unica via indicada es la carga directa de `model.safetensors` con el codigo incluido en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas objetivas con alternativas de tamano similar en la categoria de modelos pequenos de investigacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anlp-a2-optim-adamw | 33,4M | 256 | no disponible | HuggingFace, 0 descargas |
| GPT-2 small | 124M | 1024 | MIT (segun publicacion original) | ampliamente disponible |
| Pythia-70M | 70M | 2048 | Apache 2.0 (segun publicacion original) | ampliamente disponible |
| TinyStories-33M | ~33M | 512 | no disponible en esta ficha | HuggingFace |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de la categoria y no se han verificado contra las fuentes originales en esta busqueda; deben confirmarse antes de citarlos. No se dispone de comparaciones de rendimiento entre este modelo y las alternativas.

## Limitaciones y advertencias

- Longitud de contexto muy reducida (256 tokens), insuficiente para tareas que requieran mantener informacion a lo largo de una conversacion o documento.
- Rendimiento de generacion muy bajo: un BLEU de 1,34 en continuaciones greedy de 64 tokens indica una calidad de texto practicamente inutilizable para aplicaciones reales.
- Perplejidad de validacion elevada (57,96) y perdida de 4,0597, coherentes con un presupuesto de entrenamiento de solo 39M de tokens, muy por debajo de lo habitual incluso para modelos de este tamano.
- Riesgo de alucinacion alto: al ser un modelo pequeno y poco entrenado, la generacion divergira con frecuencia del contenido factual.
- Sesgos conocidos: no documentados, pero el corpus `browndw/human-ai-parallel-corpus` puede contener los sesgos presentes en textos generados por IA y en sus contrapartes humanas.
- Restricciones de licencia: no se declara licencia, por lo que no se puede confirmar la legalidad de un uso comercial. Se debe contactar con el autor antes de cualquier uso fuera del ambito academico.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se documenta soporte para tool calling, agentes, modo de razonamiento ni ajuste por instrucciones.
- El modelo esta pensado como artefacto de comparacion de optimizadores, no como modelo de proposito general. Su implementacion requiere codigo propio (`model_src`), lo que anade friccion de integracion frente a modelos compatibles con Transformers.
- La fecha del repositorio (creacion y actualizacion en 2026-10-03) y la ausencia de descargas o validacion por la comunidad implican que no ha sido revisado externamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-optim-adamw
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
