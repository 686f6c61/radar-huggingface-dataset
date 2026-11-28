# Booooooooooooo/alqac2026-qwen3.5-4b-nli

## Resumen

`alqac2026-qwen3.5-4b-nli` es un adaptador LoRA publicado en Hugging Face por el usuario `Booooooooooooo`, construido sobre el modelo base `Qwen/Qwen3.5-4B`. El identificador sugiere un ajuste fino orientado a tareas de inferencia de lenguaje natural (NLI, *Natural Language Inference*) en el contexto de ALQAC 2026, una competición de pregunta-respuesta legal en vietnamita. Se trata, por tanto, de un artefacto de ajuste fino de nicho y no de un modelo fundacional independiente.

El repositorio contiene únicamente los pesos del adaptador PEFT (0,1 GB), no el modelo completo. Para utilizarlo es necesario descargar por separado el modelo base Qwen3.5-4B y cargar el adaptador mediante la librería `peft` junto con `transformers`. La model card está generada a partir de la plantilla por defecto y no aporta información sustantiva sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia.

Su relevancia es limitada fuera del ámbito de la competición para la que fue creado: no tiene descargas ni *likes*, no declara licencia y no documenta idiomas soportados. Resulta útil como referencia para quienes participen en ALQAC 2026 o quieran reproducir un ajuste LoRA sobre Qwen3.5-4B para clasificación de pares de frases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B |
| Parametros totales | No disponible (adaptador de 0,1 GB; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (el nombre sugiere uso en vietnamita por ALQAC, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Qwen3.5-4B, un modelo transformer decoder-only de 4.000 millones de parámetros. La librería declarada es `peft` 0.22.0 y el pipeline es `text-generation`. No se especifican rango del adaptador, módulos objetivo, *alpha*, *dropout* ni tasa de aprendizaje.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, el uso de RLHF/DPO ni la existencia de etapas de alineación. El sufijo `nli` apunta a un ajuste supervisado para clasificación de relaciones entre premisa e hipótesis (entailment, contradiction, neutral), probablemente sobre datos del dominio legal vietnamita de ALQAC, pero esto es una inferencia a partir del nombre y no está documentado en el repositorio.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Clasificación de inferencia de lenguaje natural (NLI) sobre pares de frases, según el identificador del modelo.
- Ajuste específico de dominio potencialmente orientado a texto legal en vietnamita (no confirmado).
- Soporte de *tool calling* y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Clasificación de pares premisa-hipótesis en pipelines de NLI: cargar el adaptador sobre Qwen3.5-4B y ejecutar inferencia sobre pares de frases para obtener etiquetas de *entailment*, *contradiction* o *neutral*.
- Participación en ALQAC 2026: usar el adaptador como componente de un sistema de pregunta-respuesta legal, combinándolo con recuperación documental para verificar si un pasaje respalda una afirmación.
- Filtrado de respuestas en sistemas de QA legal: comprobar la consistencia entre la pregunta, el contexto recuperado y la respuesta generada antes de mostrarla al usuario.
- Evaluación comparativa de adaptadores LoRA: servir como punto de partida para reproducir experimentos de ajuste sobre Qwen3.5-4B en tareas de clasificación.
- Detección de contradicciones en documentación: aplicar el modelo a pares de fragmentos normativos para señalar incompatibilidades.
- Investigación académica sobre NLI en dominios especializados: analizar el comportamiento de un adaptador de bajo rango frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; el modelo base Qwen3.5-4B en bf16 requiere aproximadamente 8 GB de VRAM, y en cuantización de 4 bits en torno a 2,5-3 GB (estimación orientativa, no confirmada para este modelo base).
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con contexto largo; RTX 4090 o RTX 3090 suficientes para bf16 en contexto moderado.
- GPU de consumo: cabe en GPUs con 8 GB o más en bf16, y en GPUs con 4-6 GB usando cuantización del modelo base.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| alqac2026-qwen3.5-4b-nli | Adaptador sobre 4B | No disponible | No disponible | safetensors (LoRA) | Ajuste de nicho para NLI/ALQAC |
| Qwen/Qwen3.5-4B | 4B | No disponible en la informacion proporcionada | No disponible | safetensors | Modelo base sin ajuste |
| Adaptadores NLI genericos sobre modelos de 3-7B | 3-7B | Variable | Variable | safetensors/GGUF | Alternativas no verificadas para esta comparativa |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es la plantilla por defecto: no documenta datos, hiperparámetros ni evaluación, lo que impide auditar el ajuste.
- No se declara licencia, por lo que el uso comercial es incierto y debe consultarse con el autor y con la licencia del modelo base Qwen3.5-4B.
- El modelo no tiene descargas ni validación comunitaria; su calidad es desconocida.
- Riesgo de alucinación heredado del modelo base, especialmente en generación libre; para NLI conviene restringir la salida a etiquetas.
- El adaptador está pensado para una tarea concreta; su uso como modelo conversacional general puede degradar el rendimiento respecto al modelo base.
- Idiomas soportados no declarados; el uso en castellano no está validado.
- Requiere cargar el modelo base completo, con el coste de almacenamiento y memoria asociado.

## Enlaces

- Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-qwen3.5-4b-nli
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- PEFT (librería): https://github.com/huggingface/peft
- Paper de PEFT/LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact
