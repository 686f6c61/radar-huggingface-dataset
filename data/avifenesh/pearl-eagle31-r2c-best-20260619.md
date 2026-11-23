# Avifenesh/pearl-eagle31-r2c-best-20260619

## Resumen

Pearl EAGLE3.1 R2C best head es un cabezal de decodificación especulativa (speculative decoding head) para modelos Llama-3.1, publicado por el usuario Avifenesh bajo licencia Apache 2.0. No se trata de un modelo generativo completo, sino de un componente auxiliar de aproximadamente 950 millones de parámetros que se acopla a un modelo base Llama-3.1 para acelerar la inferencia mediante la técnica EAGLE3 (drafting especulativo con verificación por el modelo objetivo). El checkpoint seleccionado, identificado internamente como R2C_t7_g115, se eligió por criterio de throughput agregado en un entorno de servicio con 8 GPU H100.

El interés de esta publicación es fundamentalmente de ingeniería de serving: documenta una metodología de selección de cabezales basada en req/s agregados en distintos niveles de concurrencia (C=1, 4 y 16) y distintas longitudes de prompt, en lugar de métricas de aceptación aisladas. El artefacto público incluye los pesos en safetensors, configuración, código Python de definición del modelo y métricas de validación, mientras que el estado de entrenamiento (optimizador, scheduler) y los artefactos de benchmark se archivan en un almacén privado no accesible.

La relevancia es acotada pero específica: para equipos que ya sirven Llama-3.1 y quieren evaluar un cabezal EAGLE3 alternativo, este repo ofrece un punto de partida reproducible con criterio de selección explícito, aunque con muy poca documentación sobre datos de entrenamiento, idiomas o rendimiento absoluto frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal de decodificación especulativa EAGLE3 sobre Llama-3.1 (requiere modelo base externo) |
| Parametros totales | 950.198.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-3.1, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), con config.json, config.py y val_metrics.json; requiere custom_code |

## Arquitectura y entrenamiento

El artefacto es un cabezal de decodificación especulativa basado en la familia EAGLE3, etiquetado como "pearl" y asociado a Llama-3.1. En la práctica, un cabezal EAGLE3 es un módulo ligero que propone tokens candidatos que el modelo objetivo verifica en paralelo, incrementando el throughput efectivo sin alterar la distribución de salida del modelo base. El repo incluye un `config.py` con código personalizado (`custom_code`), lo que implica que la arquitectura exacta del cabezal no es estándar en transformers y requiere cargar el módulo acompañante.

La información sobre entrenamiento es muy limitada. La model card indica que se evaluaron varias variantes (R2C, D, I75, R4B, R3B) y que se seleccionó R2C_t7_g115 por mejor throughput agregado en un benchmark multi-réplica sobre 8×H100, con ranking: R2C (11.0288 req/s), D (11.0108), I75 (11.0029), R4B (10.9846) y R3B (10.9305). No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RL/DPO. Los estados de entrenamiento y logs se archivan en un object store privado, no en el repo. La rama `feat/real-prompt-eagle-mining-bench` (commit 85861376) contiene el benchmark multi-réplica utilizado para la evaluación final.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa EAGLE3 sobre un modelo base Llama-3.1 (no genera texto por sí solo).
- Propuesta de tokens candidatos verificados por el modelo objetivo, preservando la distribución de salida del base.
- Integración con pipelines de serving que soporten EAGLE3 (requiere cargar `config.py` y pesos safetensors).
- Evaluado en escenarios de concurrencia C=1, C=4 y C=16, y en distintos buckets de longitud de prompt.
- Soporte multilingüe: no disponible (depende del modelo base Llama-3.1).
- Tool calling, agentes, visión, audio o thinking mode: no disponibles como capacidades propias del cabezal.

## Casos de uso

- Aceleración de un endpoint de chat sobre Llama-3.1: desplegar el cabezal junto al modelo base en un servidor compatible con EAGLE3 para reducir la latencia por token en cargas conversacionales de concurrencia baja y media (C=1 y C=4), donde el benchmark de selección muestra el mejor comportamiento agregado.
- Serving de alto throughput en clúster H100: usar el checkpoint R2C como cabezal por defecto en un despliegue multi-réplica 8×H100, dado que fue seleccionado precisamente por req/s agregados en ese escenario.
- Evaluación comparativa de cabezales EAGLE3: emplear `val_metrics.json` y el manifiesto de selección para reproducir el ranking R2C/D/I75/R4B/R3B y decidir qué cabezal adoptar en producción.
- Generación de código asistida de baja latencia: al reducir el coste por token decodificado, mejora la experiencia en autocompletado y generación de parches sobre Llama-3.1 en IDE, siempre que el base esté ya desplegado.
- Investigación en decodificación especulativa: servir como baseline reproducible para comparar variantes de entrenamiento de cabezales (minería de prompts reales, según la rama `feat/real-prompt-eagle-mining-bench`).
- Reducción de coste en inferencia batch interactiva: en cargas con prompts de longitud variable, el criterio de selección por buckets de longitud de prompt permite estimar la ganancia esperada antes de adoptarlo.

## Benchmarks y rendimiento

Los únicos datos publicados son los del proceso de selección interna, expresados como req/s agregados (best-K) en un benchmark multi-réplica sobre 8×H100. No se publican MMLU, HumanEval, GSM8K ni tasas de aceptación absolutas.

| Variante | Rank | req/s agregados (best-K) |
|---|---|---|
| R2C (seleccionado) | 1 | 11.0288 |
| D | 2 | 11.0108 |
| I75 | 3 | 11.0029 |
| R4B | 4 | 10.9846 |
| R3B | 5 | 10.9305 |

Las diferencias entre variantes son muy estrechas (menos del 1 % entre la primera y la quinta), por lo que la ventaja del checkpoint seleccionado es marginal y dependiente del entorno de medición. No se han publicado resultados de benchmarks estándar de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del cabezal ocupan aproximadamente 1,9 GB en safetensors (fp16/bf16), más el modelo base Llama-3.1 que se sirva en paralelo; el consumo total depende del base y del backend.
- GPU recomendadas: el benchmark de selección se ejecutó en 8×H100; no se documentan resultados en A100, L40S ni RTX 4090.
- Consumer GPU: el cabezal por sí solo cabe en cualquier GPU con más de 2 GB libres, pero el sistema completo requiere alojar el modelo base Llama-3.1, lo que condiciona el hardware.
- Despliegue: requiere un runtime que soporte EAGLE3 y carga de `custom_code` (no es un checkpoint estándar de transformers); no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: solo se publica el agregado de 11,0288 req/s best-K en 8×H100; no hay datos de latencia p50/p99 ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pearl EAGLE3.1 R2C (este) | Cabezal EAGLE3 para Llama-3.1 | 950 M | no disponible | Apache 2.0 | Hugging Face (33 descargas) |
| Variantes D, I75, R4B, R3B | Cabezales EAGLE3 del mismo autor | no disponible | no disponible | Apache 2.0 | Artefactos en almacén privado, no públicos |
| Cabezales EAGLE3 de referencia (p. ej. publicados por SafeAILab) | Cabezal EAGLE3 | no disponible en esta ficha | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a cabezales EAGLE3 de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un Llama-3.1 base compatible no produce salida alguna; la calidad final depende enteramente del modelo objetivo.
- Documentación mínima: sin datos de entrenamiento, idiomas, contexto ni tasas de aceptación; difícil evaluar riesgo de degradación en dominios específicos.
- Diferencias de rendimiento marginales entre variantes (<1 % en req/s), por lo que la elección "best" es sensible al entorno y podría no replicarse fuera de 8×H100.
- Requiere `custom_code` (`config.py`): mayor superficie de mantenimiento y posible incompatibilidad con versiones futuras de transformers o runtimes de serving.
- Artefactos de entrenamiento y benchmarks completos en almacén privado: la reproducibilidad del proceso de selección es limitada.
- Sin evidencia publicada sobre sesgos, alucinación o comportamiento multilingüe; hereda los del modelo base Llama-3.1.
- Licencia Apache 2.0 permite uso comercial del cabezal, pero el uso del modelo base Llama-3.1 está sujeto a su propia licencia comunitaria.
- Popularidad muy baja (33 descargas, 0 likes) y sin pipeline declarado: no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Avifenesh/pearl-eagle31-r2c-best-20260619
- Rama de benchmark citada en la model card: `feat/real-prompt-eagle-mining-bench` @ commit `85861376`
- Paper de referencia EAGLE3: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible
