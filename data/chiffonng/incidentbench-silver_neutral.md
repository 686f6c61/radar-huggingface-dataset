# chiffonng/incidentbench-silver_neutral

## Resumen

`incidentbench-silver_neutral` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen2.5-7B-Instruct, desarrollado por el usuario chiffonng como artefacto de investigación para el proyecto IncidentBench. Su función es actuar como clasificador conjunto: a partir de una única respuesta generada, el sistema extrae tanto la detección de un incidente como su categoría entre siete dominios de riesgo definidos por el MIT (o la etiqueta `No incident (potential only)`). Es, por tanto, un modelo de clasificación especializada, no un modelo conversacional de propósito general.

La relevancia del adaptador es metodológica más que operativa: forma parte de una familia de brazos experimentales (en concreto, el brazo "Exp 4 (joint)" con redacción neutral respecto al resultado) que comparan variantes de formulación de prompt y estrategias de clasificación. El adaptador se aplica sin fusionar sobre el modelo base, lo que permite servirlo junto a otros adaptadores con vLLM y mantener trazabilidad sobre el modelo original.

Conviene subrayar que las etiquetas de entrenamiento son "silver", generadas por modelo según la guía de anotación del proyecto, y no anotaciones humanas gold. El propio autor lo describe como artefacto de investigación con modos de fallo conocidos (subdetecta incidentes) y desaconseja explícitamente su uso para decisiones sobre sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizaciones estándar de Qwen2.5) |
| Idiomas soportados | no disponible (el prompt y las etiquetas están en inglés) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parámetros. No se fusiona con el modelo base: se carga como módulo PEFT independiente, lo que permite servir múltiples adaptadores sobre una misma instancia del base. El entrenamiento se realizó con transformers 5.9.0 y peft 0.19.1, según declara el autor en la model card.

La tarea es una clasificación conjunta: el modelo genera una única respuesta de la que se leen simultáneamente la detección (¿hay incidente?) y la categoría (uno de siete dominios de riesgo del MIT, o `No incident (potential only)`). El brazo experimental corresponde a la variante "neutral", con redacción del enunciado y de la instrucción condicional que no sesga hacia la presencia o ausencia de incidente. Las etiquetas de entrenamiento son silver, generadas por modelo conforme a la guía de anotación del proyecto, no verificadas por anotadores humanos. Los detalles de prompt, filas de entrenamiento y hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`.

## Capacidades

- Clasificación de incidentes en siete dominios de riesgo del MIT, con etiqueta adicional para casos potenciales sin incidente confirmado.
- Detección y categorización conjuntas a partir de una sola respuesta generada (una sola pasada de decodificación).
- Generación de texto en inglés condicionada al formato de prompt específico del brazo "neutral".
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; el adaptador está entrenado y evaluado sobre prompts en inglés.
- No se declaran capacidades de generación de código, matemáticas o razonamiento general más allá de la clasificación para la que fue ajustado.

## Casos de uso

- Investigación sobre clasificación de riesgos: el adaptador sirve como brazo comparativo en experimentos que evalúan cómo la formulación del prompt (neutral frente a sesgada) afecta a la detección de incidentes. Es su uso principal declarado.
- Replicación de resultados de IncidentBench: permite reproducir el brazo "Exp 4 (joint)" con el prompt exacto documentado en `data_manifest.json` y decodificación greedy, facilitando la verificación independiente de las métricas del informe.
- Estudio de calibración y modos de fallo: al conocerse que subdetecta incidentes, es útil para analizar sesgos de etiquetado silver y comparar con anotaciones humanas en conjuntos de validación.
- Servido multi-adaptador con vLLM: al cargarse sin fusionar, puede desplegarse junto a otros brazos del mismo proyecto sobre una única instancia de Qwen2.5-7B-Instruct, reduciendo coste de infraestructura en experimentación.
- Generación de etiquetas silver para nuevos corpus: con las cautelas del caso, puede emplearse para preanotar datos de incidentes que luego se revisan manualmente, nunca como etiqueta final.
- Docencia y prototipado de pipelines de clasificación con PEFT: sirve como ejemplo reproducible de ajuste LoRA de rango bajo sobre un modelo de 7B para una tarea de clasificación estructurada con formato de prompt controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,2 GB (tamaño del repositorio); el coste real lo determina el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el base en precisión nativa (BF16/FP16): en torno a 15-16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más para servir con comodidad.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB; con 4 bits: aproximadamente 5-6 GB (estimaciones para el base, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue con vLLM y concurrencia; RTX 4090 (24 GB) viable en BF16 para una sola petición o baja concurrencia; RTX 3090/4080 con cuantización para entornos de desarrollo.
- Cabe en GPU de consumo: sí, con cuantización en GPUs de 8-12 GB (por ejemplo, RTX 3060 12 GB o RTX 4070) mediante llama.cpp u Ollama, aunque el adaptador está pensado para servirse con vLLM.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16` (método recomendado por el autor); alternativas no documentadas para este adaptador (TGI, llama.cpp, Ollama) requerirían conversión y validación del formato de prompt.
- Latencia y throughput: no disponibles. La decodificación es greedy y la salida es corta (una etiqueta), por lo que la latencia estará dominada por el prefill del prompt de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-silver_neutral | LoRA r=16 sobre 7,6B | no disponible | Clasificación de incidentes (7 dominios MIT) | other | HuggingFace (16 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (según documentación del base) | Instrucciones generales | Apache 2.0 (según el base) | HuggingFace, ampliamente desplegado |
| Otros brazos de IncidentBench | LoRA r=16 sobre 7,6B | no disponible | Variantes de prompt de la misma tarea | other | Repositorios del mismo autor (no verificados en la información disponible) |

No se dispone de información sobre otros adaptadores comparables de clasificación de incidentes con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Etiquetas silver: el entrenamiento usa etiquetas generadas por modelo, no anotaciones humanas gold; los sesgos del generador de etiquetas se propagan al adaptador.
- Subdetección de incidentes: el autor documenta explícitamente que el modelo tiende a no declarar incidente cuando existe, un modo de fallo crítico en contextos de seguridad.
- Uso restringido: la model card indica que no debe emplearse para decisiones sobre sistemas reales; es un artefacto de investigación.
- Licencia "other": no se especifican términos de uso comercial; deben consultarse antes de cualquier despliegue productivo.
- Dependencia del prompt: el adaptador está ajustado a un formato de prompt concreto (transformación `neutral` de `train/build_data.py`) y a decodificación greedy; desviarse de ese formato puede degradar la clasificación de forma no medida.
- Idiomas: no se declaran capacidades multilingües; el entrenamiento y la evaluación se realizan en inglés.
- Contexto: no se documenta la longitud de contexto efectiva del adaptador; se hereda la del base, pero no hay validación específica para entradas largas.
- Madurez y adopción: 16 descargas y 0 likes en el momento de la ficha; sin pipeline declarado ni métricas publicadas en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chiffonng/incidentbench-silver_neutral
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de IncidentBench: no disponible en la información proporcionada (la model card lo menciona sin enlace)
- Repositorio del proyecto IncidentBench (código, `train/build_data.py`, manifiestos): no disponible en la información proporcionada
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de vLLM sobre LoRA: https://docs.vllm.ai/en/latest/features/lora.html
