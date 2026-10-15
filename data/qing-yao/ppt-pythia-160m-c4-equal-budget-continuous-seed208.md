# qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed208

## Resumen

El modelo `qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed208` es un transformer decoder-only de 162.322.944 parámetros entrenado desde cero (sin cargar pesos preentrenados) sobre el corpus inglés C4. Emplea la arquitectura Pythia-160M (familia GPT-NeoX) y forma parte de un experimento controlado de presupuesto igualado ("equal-budget") cuyo objetivo es comparar dos estrategias de entrenamiento: una rama continua con una única planificación de learning rate y una rama en dos etapas que reinicia embeddings, optimizador y schedule tras la actualización 500.

El checkpoint publicado aquí corresponde a la rama continua con semilla 208. Se entrenó durante 10.500 actualizaciones totales del optimizador, con 32 secuencias de 2.048 tokens por actualización, lo que equivale a aproximadamente 688 millones de tokens procesados. El vocabulario es de 50.304 entradas y la pérdida final FP32 sobre las primeras 512 secuencias de validación de C4 es 3,721289.

La relevancia de esta ficha es acotada y experimental: no es un modelo orientado a producción ni a instrucciones, sino un artefacto de investigación para estudiar dinámicas de entrenamiento a pequeña escala. Se publica junto con checkpoints intermedios, estado del optimizador y RNG, y recibos de checksum, lo que lo hace útil para reproducibilidad, no para tareas generativas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX / Pythia-160M) |
| Parametros totales | 162.322.944 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento; arquitectura Pythia-160M) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en FP32 en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Vocabulario | 50.304 tokens |
| Tamano del repositorio | 2,9 GB |
| Perdida final C4 (FP32) | 3,721289 (primeras 512 secuencias de validacion) |
| Semilla | 208 |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-160M: un transformer decoder-only con atención causal estándar, normalización y disposición de capas heredadas de la familia GPT-NeoX. El modelo se entrenó desde cero, sin inicialización desde pesos preentrenados, sobre el corpus C4 en inglés. El presupuesto total fue de 10.500 actualizaciones del optimizador con un batch efectivo de 32 secuencias de 2.048 tokens cada una, lo que suma aproximadamente 688 millones de tokens vistos. La rama "continuous" emplea una única planificación de learning rate a lo largo de todo el entrenamiento.

El experimento compara esta rama continua con una rama en dos etapas que reinicia los embeddings de entrada y salida, el optimizador y el schedule tras la actualización 500, y luego entrena 10.000 actualizaciones adicionales. Ambas ramas consumen los mismos ejemplos en el mismo orden y comparten tamaño de vocabulario. El checkpoint raíz publicado es el final (`checkpoint-010500-continuous/model`). Se conservan tres checkpoints locales con pesos, estado del optimizador y RNG, y recibos de checksum; los checkpoints intermedios podados durante el entrenamiento no están disponibles.

No se documenta en la información disponible el uso de RLHF, DPO, SFT ni ninguna fase de alineación posterior al preentrenamiento. Tampoco se detalla la composición exacta del dataset más allá de C4 en inglés, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo de continuación de prompt (modelo base, no ajustado a instrucciones).
- Modelado de lenguaje y cálculo de perplejidad/pérdida sobre C4, útil como referencia en experimentos de entrenamiento.
- Reproducibilidad de experimentos: incluye checkpoints intermedios, estado del optimizador, estado RNG, recibo de checksum y `run.json` con la receta completa.
- Comparación controlada de schedules de learning rate: el repositorio incluye informes de los seis endpoints y comparaciones emparejadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del inglés.
- No se documentan capacidades especiales (modo de razonamiento, visión, audio).

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: el modelo sirve como punto de comparación directo entre una rama de schedule continuo y una rama con reinicio, ya que ambas comparten datos, orden de ejemplos y vocabulario.
- Reproducibilidad de experimentos a pequeña escala: al incluir estado del optimizador, RNG y checksums, permite reanudar o auditar el entrenamiento en un entorno controlado.
- Estudio de curvas de pérdida: la pérdida final FP32 de 3,721289 sobre 512 secuencias de validación de C4 ofrece una referencia concreta para comparar con otras configuraciones.
- Pruebas de infraestructura y pipelines de entrenamiento: con 162 millones de parámetros y secuencias de 2.048 tokens, es adecuado para validar código de data loading, checkpoints o distributed training antes de escalar.
- Benchmarking de herramientas de inferencia: sirve para medir latencia y throughput de vLLM, TGI o llama.cpp en un modelo pequeño, sin la variabilidad de un modelo grande.
- Docencia y divulgación: un modelo Pythia-160M entrenado desde cero es un caso didáctico para explicar tokenización, presupuesto de cómputo y planificaciones de learning rate.
- Evaluación de perplejidad comparada en inglés: útil como baseline de dominio general sobre C4 frente a variantes del mismo experimento con otras semillas o ramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato métrico documentado es la pérdida de validación:

| Metrica | Valor | Conjunto |
|---|---|---|
| Perdida final FP32 | 3,721289 | Primeras 512 secuencias de validacion de C4 |

El autor advierte que las curvas de pérdida usan precisión y enmascaramiento distintos, por lo que deben compararse solo métricas equivalentes entre sí.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 0,65 GB solo para pesos; en FP16/BF16, unos 0,33 GB; en cuantización de 8 bits, unos 0,16 GB; en 4 bits, unos 0,08 GB (estimaciones a partir de los 162,3 millones de parámetros).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia a baja velocidad.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag incluido) y endpoints compatibles; llama.cpp u Ollama requerirían convertir los pesos a GGUF, algo no documentado en el repositorio.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 2,9 GB, principalmente por los checkpoints adicionales, el estado del optimizador y los recibos de checksum.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-pythia-160m-c4-equal-budget-continuous-seed208 | 162.322.944 | 2.048 tokens | no disponible | HuggingFace |
| Pythia-160M (EleutherAI) | 162 millones aprox. | 2.048 tokens | Apache 2.0 | HuggingFace |
| GPT-2 (124M) | 124 millones | 1.024 tokens | licencia MIT modificada | HuggingFace |
| OPT-125M (Meta) | 125 millones | 2.048 tokens | licencia MIT | HuggingFace |

Las cifras de parámetros, contexto y licencia de Pythia-160M, GPT-2 y OPT-125M corresponden a sus especificaciones públicas conocidas. No se dispone de datos de rendimiento comparativo en benchmarks entre estos modelos y el aquí descrito, por lo que la comparación se limita a tamaño, contexto, licencia y disponibilidad. La diferencia principal del modelo de qing-yao frente a Pythia-160M original es que aquel se entrenó desde cero sobre C4 con un presupuesto reducido de 10.500 actualizaciones, mientras que Pythia-160M se entrenó sobre el Pile con un presupuesto muy superior.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat y no debe usarse como asistente conversacional directo.
- Entrenado exclusivamente con C4 en inglés: no cubre otros idiomas y hereda los sesgos presentes en ese corpus web.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, agravado por su tamaño reducido y su presupuesto de entrenamiento limitado (688 millones de tokens).
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Conviene tratar el modelo como restringido hasta aclarar la licencia.
- Sin benchmarks estándar publicados: no hay evidencia de rendimiento en tareas como MMLU, HumanEval o GSM8K.
- Presupuesto de entrenamiento muy inferior al de un modelo de producción: la pérdida C4 de 3,721289 no es comparable directamente con modelos entrenados con cientos de miles de millones de tokens.
- Contexto limitado a 2.048 tokens: no admite conversaciones largas ni documentos extensos.
- El repositorio incluye checkpoints, estado del optimizador y RNG que elevan el tamaño a 2,9 GB, aunque los pesos útiles del modelo son mucho menores; conviene descargar solo los ficheros necesarios.
- Los checkpoints intermedios podados durante el entrenamiento no están disponibles, lo que limita la reproducibilidad exacta de estados intermedios.
- La fecha de creación indicada (2026-10-15) y la ausencia de descargas o likes sugieren un artefacto experimental de investigación, sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed208
- Repositorio interno de resultados: carpeta `reports/` dentro del repositorio del modelo (endpoints y comparaciones emparejadas).
- Receta de entrenamiento: fichero `run.json` dentro del repositorio del modelo.
- No se han encontrado papers, blogs, repositorios externos ni demos adicionales en la información disponible.
