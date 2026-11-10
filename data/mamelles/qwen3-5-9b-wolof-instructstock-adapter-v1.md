# mamelles/Qwen3.5-9B-Wolof-InstructStock-adapter-v1

## Resumen

Qwen3.5-9B-Wolof-InstructStock-adapter-v1 es un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario mamelles en el marco del proyecto GalsenAI. Su objetivo es adaptar un modelo instructivo generalista de 9.000 millones de parametros al wolof (`wo`), una lengua de la familia nigerocongolesa hablada principalmente en Senegal, Gambia y Mauritania, para la que existen pocos recursos de entrenamiento de calidad.

El adaptador se entrena a partir de la version instructiva original del modelo base (rama `from_instruct_stock`), no desde un checkpoint previamente continuado en wolof. Incorpora anclas de idioma (`<|lang_wo|>`) y de ortografia (`<|ortho_ns|>`) que permiten condicionar la generacion a la variante ortografica no estandar o mixta del wolof. El artefacto se distribuye como repositorio PEFT con pesos en safetensors y un tamano de repositorio de 12,6 GB.

La relevancia del modelo radica en su enfoque de evaluacion: el autor publica metricas por familia (BPB, PPL, BLEU, chrF) y advierte explicitamente de que no deben compararse perplejidades entre tokenizadores distintos, recomendando BPB como metrica comparable. Se trata de un artefacto de investigacion de acceso privado en el Hub, orientado a experimentacion con generacion de texto en wolof.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-9B) con adaptador LoRA/PEFT |
| Parametros totales | 9B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT sobre el modelo instructivo Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parametros. El entrenamiento parte de la version instructiva original (rama `from_instruct_stock`), segun indica la model card, y utiliza un dataset de SFT en wolof con filtro ortografico que conserva las variantes `non_standard` y `mixed`. El mejor checkpoint reportado es `checkpoint-8500`.

La innovacion tecnica principal es el uso de anclas de idioma y ortografia (`<|lang_wo|>` y `<|ortho_ns|>`) que se incorporan al prompt para condicionar la salida a la variante ortografica deseada. El autor documenta un protocolo de evaluacion (`evaluate_clm.py`) que calcula BPB, PPL, BLEU y chrF sobre un conjunto de test de wolof filtrado por ortografia, y advierte de que la perplejidad no es comparable entre familias de tokenizadores, por lo que recomienda BPB. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en wolof, con soporte de variantes ortograficas no estandar y mixtas mediante las anclas `<|ortho_ns|>` y `<|lang_wo|>`.
- Conversacion multi-turno (pipeline `text-generation` con etiqueta `conversational`).
- Adaptacion de un modelo instructivo generalista al dominio del wolof, heredando las capacidades del modelo base Qwen3.5-9B.
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada para este adaptador.
- Capacidades multilingues: limitadas al wolof segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en adaptacion de modelos al wolof: el adaptador sirve como punto de partida para experimentos de SFT y evaluacion con BPB/BLEU/chrF sobre corpus filtrados por ortografia.
- Generacion de texto asistida en wolof: redaccion de borradores y respuestas conversacionales en esta lengua, aprovechando el ajuste sobre el modelo instructivo.
- Normalizacion y estudio de variantes ortograficas: las anclas `<|ortho_ns|>` permiten generar texto en ortografia no estandar o mixta, util para analisis linguistico y corpus paralelos.
- Evaluacion comparativa de familias de modelos: el protocolo documentado (`evaluate_clm.py`, `metrics.json`) permite comparar ramas stock, CPT, instruct y SFT dentro de la familia GalsenAI.
- Prototipado de asistentes conversacionales en wolof: integrable en pipelines de `text-generation` con la libreria PEFT para experimentacion interna.
- Construccion de datasets sinteticos en wolof: generacion de pares pregunta-respuesta para aumentar corpus de entrenamiento de otros modelos, siempre con revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---:|
| SFT-from-instruct eval_loss (mejor checkpoint) | 0.8521 |
| SFT-from-CPT eval_loss | 0.7285 |
| Stock BPB | 1.8371 |
| Stock BLEU | 3.55 |
| Stock chrF | 21.55 |
| CPT BPB | 0.8478 |
| CPT BLEU | 8.33 |
| CPT chrF | 29.29 |
| Instruct BPB | 0.9981 |
| Instruct BLEU | 5.94 |
| Instruct chrF | 26.93 |

El mejor checkpoint del adaptador es `checkpoint-8500`. El autor advierte de que la perplejidad no debe compararse entre familias de tokenizadores y recomienda BPB como metrica comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base de 9B requiere aproximadamente 18 GB en FP16 y en torno a 6-7 GB en cuantizacion de 4 bits (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; un modelo de 9B en 4 bits es teoricamente desplegable en GPUs con 8-12 GB de VRAM, pero no hay datos publicados para este adaptador.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); compatibilidad con vLLM, llama.cpp, Ollama o TGI no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor referencia internamente las ramas de la familia GalsenAI (stock, CPT, instruct y SFT) como terminos de comparacion, pero no se aportan datos de modelos externos de wolof.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Wolof-InstructStock-adapter-v1 | 9B (base) + LoRA | no disponible | no disponible | Hub (acceso privado) |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion de acceso privado en el Hub; su disponibilidad publica no esta garantizada.
- Licencia no disponible: no se puede confirmar el uso comercial permitido.
- Entrenado exclusivamente para wolof; su rendimiento en otras lenguas no esta documentado y probablemente degradado.
- El autor advierte de que la perplejidad no es comparable entre tokenizadores distintos; usar BPB para comparaciones.
- Riesgo de alucinacion inherente al modelo base instructivo, no cuantificado para este adaptador.
- No se documentan sesgos conocidos, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).
- La evaluacion se basa en un unico conjunto de test filtrado por ortografia; la generalizacion a otros dominios no esta validada.
- No hay datos publicados de latencia, throughput ni requisitos de hardware especificos.

## Enlaces

- [Hugging Face: mamelles/Qwen3.5-9B-Wolof-InstructStock-adapter-v1](https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-InstructStock-adapter-v1)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [metrics.json (referencia del autor)](https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-InstructStock-adapter-v1/blob/main/metrics.json)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
