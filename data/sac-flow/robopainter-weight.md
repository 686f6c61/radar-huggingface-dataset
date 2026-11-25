# SAC-Flow/Robopainter-weight

## Resumen

Robopainter-weight es un adaptador LoRA publicado por SAC-Flow sobre el modelo base SAC-Flow/Qwen3.8-27B, un modelo de lenguaje de 27.000 millones de parametros derivado de la familia Qwen3. Se distribuye como pesos PEFT en formato safetensors (1,9 GB) y esta orientado, por el nombre y las etiquetas del repositorio, a tareas de robopainter (pintura robotizada o generacion de trayectorias de pintura) mediante ajuste supervisado (supervised-fine-tuning).

El repositorio tiene un caracter muy incipiente: 4 descargas, 0 likes, sin pipeline declarado, sin idiomas especificados y con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque al ser un adaptador sobre un modelo base conviene verificar tambien la licencia del modelo base.

No se dispone de informacion publica sobre el dataset de entrenamiento, la composicion de datos, los hiperparametros del LoRA (rango, alpha, modulos objetivo) ni resultados de evaluacion. Esta ficha se limita, por tanto, a lo que puede verificarse en la informacion del repositorio, marcando explicitamente como "no disponible" todo aquello que no ha sido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base Qwen3.8-27B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion, sin detallar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con ajuste supervisado (supervised-fine-tuning segun las etiquetas) sobre SAC-Flow/Qwen3.8-27B. No se especifica el rango (r), el factor alpha, los modulos objetivo (q_proj, k_proj, v_proj, etc.) ni la tasa de aprendizaje o el numero de pasos. Tampoco se documenta el volumen de tokens de entrenamiento ni la composicion del dataset.

El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3, de arquitectura transformer decoder-only con atencion por grupos (GQA) y, presumiblemente, soporte de contexto largo, aunque estos detalles no se confirman en la informacion del repositorio. El adaptador se distribuye como pesos PEFT compatibles con la libreria `peft` y debe cargarse junto al modelo base para su uso.

No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento) especificas de este adaptador.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.8-27B (no verificados para este adaptador).
- Ajuste especifico para tareas de "robopainter" segun las etiquetas del repositorio; el alcance exacto no esta documentado.
- Soporte de tool calling / function calling: no disponible (depende del modelo base y no se confirma para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (idiomas no especificados).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Pintura robotizada o generacion de trayectorias de pintura: el adaptador esta etiquetado como `robopainter`, por lo que su uso previsto es asistir en la planificacion o generacion de instrucciones de pintura sobre el modelo base; la idoneidad concreta no puede validarse sin documentacion.
- Prototipado de pipelines de robotica con modelos de lenguaje: cargar el adaptador sobre Qwen3.8-27B para experimentar con instrucciones de dominio especifico en entornos de simulacion.
- Investigacion en ajuste fino eficiente: sirve como ejemplo de LoRA supervisado sobre un modelo de 27B para estudiar el impacto del adaptador en tareas de dominio.
- Evaluacion comparativa de adaptadores: util para medir la degradacion o mejora respecto al modelo base en tareas de generacion de texto general.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 1,9 GB, permite cambiar de comportamiento sin duplicar los pesos del modelo base.
- Integracion en pipelines de inferencia con `peft` y `transformers`: carga del adaptador mediante `PeftModel.from_pretrained` sobre el modelo base para tareas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 27B requiere, en cuantizacion de 4 bits, aproximadamente 16-18 GB de VRAM, y en fp16 alrededor de 54 GB (estimacion orientativa, no confirmada en el repositorio).
- GPU recomendadas: no disponible; para el modelo base se suelen emplear A100 40/80 GB, H100 o RTX 4090 (24 GB) con cuantizacion.
- Cabe en consumer GPU: probablemente en RTX 4090 o similar solo con el modelo base cuantizado a 4 bits; no confirmado.
- Opciones de despliegue: `peft` + `transformers` (formato nativo del adaptador); vLLM, llama.cpp, Ollama o TGI requeririan conversion o soporte de adaptadores LoRA, no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAC-Flow/Robopainter-weight (LoRA sobre Qwen3.8-27B) | Adaptador sobre 27B | no disponible | Apache 2.0 | Gated en Hugging Face |
| Modelo base SAC-Flow/Qwen3.8-27B | 27B | no disponible | no disponible | no disponible |
| Qwen3 (familia) | 27B (segun variante) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Ausencia total de documentacion: no hay model card detallada, dataset, hiperparametros ni evaluacion, lo que dificulta su uso en produccion.
- Riesgo de alucinacion: inherente al modelo base; no cuantificado para este adaptador.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no especificadas; los idiomas no estan declarados.
- Restricciones de licencia: el adaptador es Apache 2.0, pero debe verificarse la licencia del modelo base Qwen3.8-27B antes de uso comercial.
- Caveat de produccion: al ser un adaptador PEFT, requiere cargar el modelo base completo; el rendimiento real depende de la calidad del ajuste, no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/SAC-Flow/Robopainter-weight
- Modelo base: https://huggingface.co/SAC-Flow/Qwen3.8-27B
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
