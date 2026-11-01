# jy395/Qwen3-8B-gptq-w4a16-c1

## Resumen

Qwen3-8B-gptq-w4a16-c1 es una version cuantizada a 4 bits del modelo Qwen/Qwen3-8B, publicada por el usuario jy395 como parte del conjunto de 30 configuraciones comprimidas que acompanan al articulo academico "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26). El checkpoint aplica cuantizacion GPTQ de solo pesos (W4A16, group size 128) mediante la herramienta llm-compressor y emplea como corpus de calibracion WikiText-2, un conjunto de texto generico, en lugar de datos financieros de dominio.

El interes del modelo no reside en su rendimiento aislado, sino en su papel como configuracion de control dentro de un estudio sistematico sobre cuando la calibracion con datos del dominio (en este caso, financiero) es necesaria para preservar la calidad tras la compresion post-entrenamiento. Al estar calibrado con texto generico, sirve de referencia frente a las variantes calibradas con corpus financieros del mismo estudio.

El modelo hereda la arquitectura y capacidades del Qwen3-8B original, pero el repositorio publicado declara 2.167.453.176 parametros en safetensors (coincidiendo con el empaquetado de pesos a 4 bits), un tamano de repo de 6,1 GB y licencia Apache 2.0. Esta pensado para experimentacion e investigacion en compresion de modelos, no como sustituto directo del modelo base en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-8B); pesos cuantizados en formato compressed-tensors |
| Parametros totales | 2.167.453.176 (segun safetensors del repo cuantizado; el modelo base Qwen3-8B tiene ~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B; consultar la model card del base) |
| Tipos de cuantizacion | GPTQ W4A16, group size 128 (calibracion con 128 secuencias x 2048 tokens = 262.144 tokens) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo Qwen/Qwen3-8B. La compresion se realiza con GPTQ en configuracion W4A16: pesos a 4 bits con activaciones en 16 bits y agrupacion de escala de tamano 128. El proceso se ejecuta con llm-compressor, que genera pesos en formato compressed-tensors compatibles con vLLM y transformers. El corpus de calibracion es C1 (WikiText-2, texto generico), con 128 secuencias de 2048 tokens (262.144 tokens en total), consumo completo del corpus, `max_seq_length=2048` y semilla 42.

No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO o innovaciones como decodificacion especulativa), mas alla de que Qwen3-8B es el punto de partida. La contribucion tecnica de este repositorio es exclusivamente la configuracion de compresion y su protocolo de calibracion reproducible mediante el script `scripts/quantization/gptq_w4a16.py` del repositorio del articulo.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-8B.
- Razonamiento y matematicas: capacidades del base, potencialmente degradadas por la cuantizacion a 4 bits.
- Generacion de codigo: capacidades del base, sin datos especificos de evaluacion en este checkpoint.
- Tool calling / function calling: no documentado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingues: no disponibles (no se declaran idiomas en el repo).
- Modo thinking: no documentado para este checkpoint (el base Qwen3 lo incorpora; verificar en la model card del base).
- Enfoque de evaluacion: orientado a tareas financieras (diez tareas) segun el articulo asociado, aunque el modelo no esta especializado en finanzas.

## Casos de uso

- Investigacion en compresion de modelos: servir como configuracion de control (calibracion generica) frente a variantes calibradas con datos financieros, para medir el impacto del corpus de calibracion en la calidad final.
- Reproducibilidad de experimentos: ejecutar el protocolo del articulo (semilla 42, WikiText-2, 128x2048 tokens) para validar resultados de GPTQ W4A16 sobre Qwen3-8B.
- Despliegue con memoria reducida: usar el checkpoint en vLLM o transformers con `device_map="auto"` para reducir la huella de VRAM frente al modelo de 8B en FP16, en entornos con GPUs de gama media.
- Evaluacion de degradacion por cuantizacion: comparar respuestas del checkpoint frente al Qwen3-8B original en tareas de razonamiento, codigo y conocimiento general para cuantificar la perdida.
- Prototipado de asistentes conversacionales: emplear el modelo en demos de chat donde el coste de inferencia y la memoria sean limitantes, aceptando la perdida de calidad de la cuantizacion.
- Benchmarking de pipelines de cuantizacion: integrar el checkpoint en pruebas automatizadas de llm-compressor y compressed-tensors para validar compatibilidad con vLLM y transformers.
- Analisis financiero exploratorio: aprovechar las capacidades generales del base en tareas de texto financiero, aunque sin garantia de calidad equiparable a variantes calibradas con datos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 6,1 GB en safetensors; en la practica, con pesos W4A16 y cache KV, se estima un consumo de aproximadamente 7-9 GB en funcion de la longitud de contexto y el batch (estimacion, no dato oficial).
- GPU recomendadas: tarjetas con al menos 12-16 GB de VRAM para contexto moderado; A100, H100 o L40S para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4070/4080 y RTX 4090, con margen variable segun contexto y batch.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`. No se documenta soporte GGUF/llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-gptq-w4a16-c1 | 2.167.453.176 (pesos empaquetados a 4 bits; base ~8B) | no disponible | GPTQ W4A16, group 128 | apache-2.0 | HuggingFace (20 descargas) |
| Qwen/Qwen3-8B | ~8B | no disponible en esta ficha | FP16/BF16 (original) | apache-2.0 | HuggingFace (oficial) |
| Otras variantes del mismo estudio (calibradas con corpus financieros) | mismas que el base | no disponible | GPTQ W4A16 | apache-2.0 | Coleccion ICAIF 2026 en HuggingFace |

La comparacion directa mas relevante es con el modelo base (para medir la perdida por cuantizacion) y con las restantes configuraciones del articulo (para evaluar el efecto del corpus de calibracion). No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros modelos de 8B cuantizados.

## Limitaciones y advertencias

- La cuantizacion W4A16 introduce degradacion de calidad respecto al modelo base; el grado de perdida no se cuantifica en la informacion disponible.
- La calibracion con texto generico (WikiText-2) puede ser suboptima para tareas de dominio financiero, que es precisamente la hipotesis que estudia el articulo.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas en este checkpoint.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados: no declarados; la cobertura multilingue no esta garantizada.
- Longitud de contexto: no confirmada para este checkpoint; debe consultarse la model card de Qwen3-8B.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento del checkpoint cuantizado en produccion.
- Repositorio con muy baja adopcion (20 descargas, 0 likes) y publicado como artefacto de investigacion; no se garantiza mantenimiento.
- El numero de parametros declarado en safetensors (2,17B) corresponde al empaquetado de pesos a 4 bits y no debe interpretarse como un modelo de 2B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Qwen3-8B-gptq-w4a16-c1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del articulo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/gptq_w4a16.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
- DOI del articulo: https://doi.org/10.1145/3858063.3858724
