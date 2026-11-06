# eoinf/trigram_information_rare_2b_schedule_200m_dmodel256

## Resumen

`eoinf/trigram_information_rare_2b_schedule_200m_dmodel256` es un transformer causal de pequeno tamano publicado por el usuario `eoinf` como parte de una rejilla de experimentos ("Transformer experiment grid") orientada al estudio de tareas sinteticas de trigramas. No es un modelo de proposito general ni esta pensado para uso en produccion: se trata de un artefacto de investigacion con vocabulario de 4096 tokens, longitud de contexto de 256 tokens y un presupuesto nominal de entrenamiento de aproximadamente 2 mil millones de tokens (1.999.998.976).

El modelo emplea una arquitectura transformer causal con `d_model=256`, una sola semilla por anchura y checkpoints en formato de state-dict de PyTorch. La evaluacion se realiza sobre los propios datos de entrenamiento, sin conjunto de validacion reservado, lo que invalida cualquier interpretacion de sus metricas como medida de generalizacion. El repositorio ocupa 0,2 GB e incluye el state-dict, la definicion de la ejecucion, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados; no incluye estados del optimizador ni los datos de entrenamiento.

Su relevancia es acotada y experimental: sirve para reproducir o analizar estudios sobre aprendizaje de informacion de trigramas en regimenes de datos controlados, no como base para aplicaciones reales. La model card no documenta licencia, idiomas soportados ni pipeline de inferencia, y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizer derivado de The Pile, `eoinf/pile_tokenizer_4096`) |
| Licencia | no disponible |
| Formato de pesos | state-dict de PyTorch (checkpoints) |
| Dimension del modelo (d_model) | 256 |
| Tamano de vocabulario | 4096 tokens |
| Presupuesto de entrenamiento | 1.999.998.976 tokens (nominal; horizontes reales en `grid_summary.json` y `result.json`) |
| Semillas por configuracion | 1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de dimension reducida (`d_model=256`) con vocabulario de 4096 tokens y contexto de 256 tokens. Forma parte de una rejilla de experimentos con varias anchuras (`d_model` 256 entre ellas) y una unica semilla por configuracion. El entrenamiento sigue un presupuesto nominal de aproximadamente 2 mil millones de tokens, aunque los horizontes efectivos por modelo, incluidas paradas tempranas, se registran en `grid_summary.json` y `result.json`, por lo que el consumo real puede diferir del nominal.

El dataset se describe en `configuration.json` y el tokenizer es `eoinf/pile_tokenizer_4096`, derivado de The Pile. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de alineacion; el modelo se entrena presumiblemente con el objetivo estandar de prediccion del siguiente token. El codigo de arquitectura y carga vive en el repositorio `synthetic_trigrams`, y la evaluacion se hace sobre datos de entrenamiento, sin conjunto de validacion reservado.

## Capacidades

- Generacion de texto autoregresiva limitada a la distribucion de entrenamiento (The Pile tokenizado a 4096 piezas).
- Modelado de secuencias cortas: contexto maximo de 256 tokens, insuficiente para conversaciones o documentos largos.
- Aprendizaje de informacion de trigramas: el diseno experimental apunta a medir como el modelo captura dependencias locales de orden tres.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue no documentada; depende de la composicion de The Pile y del tokenizer de 4096 tokens.
- No se documentan modos especiales (thinking, vision, audio) ni capacidades multimodales.

## Casos de uso

- Reproduccion de experimentos de investigacion: el repositorio incluye definicion de ejecucion, historial de checkpoints y log de actualizaciones, lo que permite replicar curvas de entrenamiento y comparar con otras anchuras de la rejilla.
- Estudio de aprendizaje de trigramas: util para analizar hasta que punto un transformer pequeno memoriza dependencias locales de orden tres bajo un presupuesto de datos controlado.
- Analisis de escalado en regimen de datos limitado: la rejilla con distintas `d_model` y presupuestos de tokens permite estudiar leyes de escalado a escala de laboratorio.
- Docencia y experimentacion con transformers pequenos: con 0,2 GB de repositorio y contexto de 256 tokens, se puede cargar y ejecutar en hardware modesto para ilustrar el funcionamiento interno de un decoder causal.
- Pruebas de pipelines de evaluacion: sirve como modelo de juguete para validar infraestructura de evaluacion (carga de state-dicts, tokenizer, generacion) antes de escalar a modelos mayores.
- Baseline en tareas sinteticas: puede actuar como referencia inferior en comparaciones de capacidad de memorizacion o de ajuste a distribuciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion se realiza sobre datos de entrenamiento y que no existe evaluacion con conjunto reservado, por lo que cualquier metrica derivada de `result.json` no seria comparable con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision al no documentarse el numero total de parametros; con `d_model=256`, vocabulario de 4096 y contexto de 256, el modelo es de escala muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; tambien es viable en CPU.
- Cabe en GPU consumer: si, previsiblemente en todas las GPU consumer modernas e incluso en iGPU.
- Opciones de despliegue: al publicarse como state-dict de PyTorch con codigo de carga en el repositorio `synthetic_trigrams`, el despliegue requiere usar dicho codigo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eoinf/trigram_information_rare_2b_schedule_200m_dmodel256` | no disponible (d_model=256, vocab 4096) | 256 | no disponible | Hugging Face, state-dict PyTorch |
| Otros modelos de la rejilla `eoinf` (otras anchuras) | no disponible | 256 | no disponible | Hugging Face |
| GPT-2 small (referencia de escala similar) | 124M | 1024 | MIT | Amplia, multiples formatos |
| Modelos de juguete tipo nanoGPT | ~10M-100M | variable | MIT | Repositorios de investigacion |

La comparativa con modelos de proposito general no es significativa: este modelo es un artefacto experimental sin evaluacion reservada ni licencia documentada, mientras que alternativas como GPT-2 small cuentan con evaluacion estandar y licencia clara para uso comercial.

## Limitaciones y advertencias

- Sin licencia documentada: no se puede asumir permiso para uso comercial ni redistribucion.
- Evaluacion sobre datos de entrenamiento: las metricas publicadas no miden generalizacion y estan sesgadas al alza.
- Contexto de 256 tokens: inutil para la mayoria de aplicaciones reales (chat multi-turno, documentos, codigo).
- Vocabulario de 4096 tokens: cobertura lexica muy limitada, con tokenizacion ineficiente para texto real.
- Riesgo de alucinacion y de reproduccion de sesgos de The Pile: el modelo no ha pasado por fases de alineacion documentadas.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- No incluye estados del optimizador ni datos de entrenamiento: la reproducibilidad completa del entrenamiento no esta garantizada.
- No apto para produccion: es un experimento de investigacion sin pipeline, sin benchmarks estandar y sin garantias de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinf/trigram_information_rare_2b_schedule_200m_dmodel256
- Tokenizer: https://huggingface.co/eoinf/pile_tokenizer_4096
- Repositorio de codigo `synthetic_trigrams`: no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible
