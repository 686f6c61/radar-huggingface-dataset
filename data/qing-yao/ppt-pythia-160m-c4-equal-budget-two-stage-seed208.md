# qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed208

## Resumen

PPT-Pythia-160M (variante two-stage, seed 208) es un modelo de lenguaje decoder-only entrenado desde cero por el usuario qing-yao sobre el corpus inglés C4. Parte de la arquitectura GPT-NeoX de Pythia-160M, con 162.322.944 parámetros y un vocabulario de 50.304 tokens, pero sin cargar pesos preentrenados: el entrenamiento arranca de inicialización aleatoria. Forma parte de un experimento comparativo de presupuesto igualado entre un brazo continuo y un brazo en dos etapas.

La peculiaridad del modelo es el reinicio intermedio. El brazo two-stage reinicia los embeddings de entrada y salida, el optimizador y el scheduler tras la actualización 500, y continúa durante 10.000 actualizaciones más, hasta un total de 10.500 actualizaciones con 32 secuencias de 2.048 tokens cada una (aproximadamente 688 millones de tokens vistos). El brazo continuo, en cambio, usa un único schedule de learning rate. Ambos brazos consumen los mismos ejemplos en el mismo orden.

Se trata de un artefacto de investigación, no de un modelo orientado a producción. Su relevancia es metodológica: permite estudiar el efecto de reiniciar componentes del entrenamiento a mitad de camino bajo un presupuesto de cómputo idéntico. La pérdida final en FP32 sobre las primeras 512 secuencias de validación de C4 es de 3,666758. No se especifica licencia y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 162.322.944 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | 50.304 tokens |
| Tamano del repo | 3,2 GB (incluye checkpoints y estados de optimizador) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-NeoX de Pythia-160M: un transformer decoder-only con atención causal, normalización por capas y embeddings de posición rotatorios. La configuración reproduce el tamaño de Pythia-160M, pero se inicializa desde cero, sin transferencia de pesos. El tokenizador está fijado (pinned) en el repositorio y usa el vocabulario de 50.304 tokens propio de la familia Pythia.

El entrenamiento consume C4 en inglés durante 10.500 actualizaciones totales del optimizador, con un batch de 32 secuencias de 2.048 tokens por actualización, es decir, unos 688 millones de tokens procesados. La diferencia clave respecto a un entrenamiento convencional es el reinicio a mitad de camino: tras la actualización 500 se restablecen los embeddings de entrada y salida, el estado del optimizador y el scheduler de learning rate, y se continúa durante 10.000 actualizaciones adicionales. No se menciona uso de RLHF, DPO ni ajuste por instrucciones; es un modelo puramente preentrenado. El checkpoint final (`checkpoint-010500-c4/model`) constituye los pesos raíz publicados, y se conservan además 4 checkpoints locales con pesos, estado de optimizador/RNG y recibos de checksum. Los checkpoints intermedios descartados durante el entrenamiento no están disponibles.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, heredada de la arquitectura Pythia.
- Razonamiento y conocimiento limitados por el tamano (162 M de parametros) y por el bajo volumen de tokens de entrenamiento (unos 688 M), muy por debajo del regimen de entrenamiento de los Pythia originales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue practicamente nula: el entrenamiento se limita a C4 en ingles.
- No hay modo de pensamiento (thinking mode), vision ni audio.
- Compatible con text-generation-inference y con endpoints segun las etiquetas del repositorio.

## Casos de uso

- Reproduccion de experimentos de investigacion: sirve como brazo two-stage de un estudio controlado sobre reinicio de componentes de entrenamiento, comparandolo con el brazo continuo de mismo presupuesto.
- Analisis de dinamica de entrenamiento: permite estudiar como afecta el reinicio de embeddings y optimizador a las curvas de perdida y a la convergencia tras la actualizacion 500.
- Pruebas de infraestructura de entrenamiento: al incluir estados de optimizador y RNG, es util para validar pipeline de checkpoints y reanudacion de runs.
- Generacion de texto de bajo coste en ingles: al caber holgadamente en cualquier GPU de consumo, puede usarse para prototipos de completado de texto sin requisitos de hardware.
- Fine-tuning educativo: por su tamano reducido, es adecuado para ensenar flujos de ajuste fino con `transformers` en entornos con recursos limitados.
- Baseline de comparacion en estudios de eficiencia de datos: permite medir la relacion entre presupuesto de tokens y calidad frente a modelos C4 de mayor tamano.
- Experimentos de cuantizacion: su tamano minimo lo hace apropiado para probar tecnicas de cuantizacion (INT8, INT4) con impacto medible en la perdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato numerico reportado es la perdida de validacion sobre C4.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perdida C4 (validacion) | 3,666758 | FP32, primeras 512 secuencias de validacion |

El model card menciona que en `reports/` hay seis endpoints y comparaciones emparejadas, pero los valores concretos de esos seis runs no se detallan en la informacion disponible. Se advierte de que las curvas de perdida usan distinta precision y enmascaramiento, por lo que deben compararse metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: ~650 MB en FP32 (solo pesos); ~325 MB en FP16/BF16; ~162 MB en INT8; ~81 MB en INT4. Los ~3,2 GB del repositorio incluyen checkpoints y estados de optimizador, no solo los pesos de inferencia.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o incluso una iGPU con suficiente memoria compartida son suficientes.
- Cabe en GPU de consumo: si, en practicamente todas, y tambien en CPU.
- Opciones de despliegue: `transformers`, text-generation-inference (etiqueta del repo), vLLM, y conversion previa a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PPT-Pythia-160M two-stage seed208 | 162.322.944 | 2.048 | C4 (ingles) | no disponible | HuggingFace |
| Pythia-160M (EleutherAI) | ~162 M | 2.048 | The Pile | Apache-2.0 | HuggingFace |
| Pythia-160M-deduped (EleutherAI) | ~162 M | 2.048 | The Pile deduplicado | Apache-2.0 | HuggingFace |

La comparacion principal es con la familia Pythia original, de la que este modelo toma la arquitectura. Las diferencias relevantes son el corpus de entrenamiento (C4 en lugar de The Pile), el presupuesto de tokens (unos 688 M frente a cientos de miles de millones en Pythia) y la ausencia de licencia declarada. No se dispone de datos de benchmarks que permitan comparar el rendimiento de forma cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Licencia no especificada: el repositorio no declara licencia, por lo que el uso comercial queda en situacion juridica incierta.
- Solo ingles: el soporte multilingue es inexistente.
- Contexto corto: 2.048 tokens, adecuado para tareas simples pero insuficiente para conversaciones o documentos largos.
- Capacidad muy limitada: 162 M de parametros y unos 688 M de tokens vistos implican un modelo probablemente poco entrenado en comparacion con Pythia; se esperan respuestas poco coherentes y alta tasa de alucinacion.
- Sesgos: al entrenarse sobre C4 sin filtrado adicional documentado, hereda los sesgos presentes en ese corpus web.
- Diferencias de medicion: las curvas de perdida usan distinta precision y enmascaramiento, por lo que no deben compararse de forma directa con otras metricas.
- Checkpoints intermedios no disponibles: solo se conservan 4 checkpoints locales, lo que limita la reproducibilidad de estados intermedios del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed208
- Pythia-160M (referencia de arquitectura): https://huggingface.co/EleutherAI/pythia-160m
