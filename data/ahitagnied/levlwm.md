# ahitagnied/levlwm

## Resumen

LeVLWM (LeWM con condicionamiento por lenguaje) es una coleccion de checkpoints de modelos del mundo (world models) condicionados por instrucciones en lenguaje natural, publicada por el usuario ahitagnied en Hugging Face. El modelo aprende a predecir la dinamica de entornos de control y planificacion a partir de observaciones y objetivos expresados en texto, lo que permite plantear tareas de planificacion como un problema de alcanzar un estado descrito linguisticamente. Es relevante porque conecta modelos del mundo con instrucciones abiertas en lenguaje, una linea de trabajo activa en robotica y agentes.

El repositorio no es un modelo unico, sino un conjunto de checkpoints organizados por entorno (`pusht`, `cube` de OGBench, `reacher` y `tworoom`) y por variante de entrenamiento (captioning por plantilla, captioning reescrito por un LLM como Qwen, mezclas de captions gruesas y variantes con encoder GPT-2). Incluye tambien baselines (LeWM, PLDM, DINO-WM) con cabezas de objetivo textual entrenadas sobre modelos del mundo congelados.

La informacion disponible no detalla la arquitectura interna, el numero de parametros ni la longitud de contexto; el repositorio ocupa 28,5 GB e incluye pesos en formato `.pt` (PyTorch) junto con ficheros de configuracion y manifiestos de origen. La model card esta orientada a reproducir resultados de evaluacion (semillas 42-46, 50 episodios por semilla) mas que a documentar el modelo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo del mundo condicionado por lenguaje; variantes con encoder de texto GPT-2, Qwen o SigLIP en las cabezas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` sin quantizaciones publicadas) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles por los ejemplos de captions) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), con `config.json`/`config.yaml` y `MANIFEST.tsv` por checkpoint |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de LeVLWM. Por la nomenclatura y los baselines incluidos (LeWM de lucas-maes/le-wm, PLDM y DINO-WM), se trata de un modelo del mundo que aprende transiciones latentes a partir de observaciones y las condiciona a un objetivo textual. Las cabezas de objetivo textual (`text_heads`) se entrenan sobre un modelo del mundo congelado y emplean distintos encoders de texto (`qwen`, `siglip`) y distintos conjuntos de captions.

El entrenamiento se organiza en variantes segun el tipo de caption usado: `template` (captions de plantilla, campo `lang_instr`), `llm` (captions reescritas por Qwen, `lang_instr_llm`), `llm_mix30` y `llm_mix50` (mezcla del 30 % y 50 % de captions gruesas), `pilot10ep` (piloto de 10 epocas) y dos variantes especificas de PushT con encoder GPT-2 preentrenado, una con fine-tuning (`gpt2_ft`) y otra congelada (`gpt2_frozen`). Los pesos de la epoca 100 se usan para los numeros principales y los de la epoca 10 solo para la comparacion a 10 epocas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelado de dinamica en entornos de control: `pusht`, `cube` (OGBench), `reacher` y `tworoom`.
- Condicionamiento por instrucciones en lenguaje natural para definir objetivos de planificacion.
- Soporte de distintos esquemas de captioning (plantilla, reescritura por LLM, mezclas con captions gruesas).
- Evaluacion reproducible con semillas fijas (42-46, 50 episodios por semilla) y checkpoints por variante.
- Inclusión de baselines comparables (LeWM, PLDM, DINO-WM) con cabezas de objetivo textual entrenadas sobre modelos congelados.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling ni agentes multi-paso.

## Casos de uso

- Planificacion en entornos de manipulacion 2D: usar los checkpoints de `pusht` para evaluar como un objetivo descrito en texto guia la planificacion del modelo del mundo en tareas de empuje de bloques.
- Investigacion en modelos del mundo condicionados por lenguaje: comparar las variantes `template`, `llm`, `llm_mix30` y `llm_mix50` para medir el efecto de la calidad y granularidad de las captions en el rendimiento.
- Reproduccion de resultados academicos: los checkpoints y `MANIFEST.tsv` permiten replicar las cifras del results hub con las semillas y episodios indicados.
- Estudio de encoders de texto en planificacion: las variantes `gpt2_ft` y `gpt2_frozen` de PushT permiten analizar el impacto de ajustar o congelar el encoder de texto.
- Benchmarking de baselines: comparar LeVLWM con LeWM, PLDM y DINO-WM usando las cabezas textuales incluidas (`qwen`, `siglip`) sobre los mismos entornos.
- Desarrollo de agentes roboticos simulados: integrar el modelo del mundo como componente de prediccion en un bucle de planificacion por objetivos textuales en entornos de bajo dimensionalidad como `reacher` o `tworoom`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un "results hub" externo y describe la organizacion de los checkpoints, pero no incluye tablas con cifras (exito, recompensa, etc.) ni comparaciones numericas con los baselines.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 28,5 GB, pero el tamano por checkpoint individual no se detalla.
- GPU recomendadas: no disponible; depende del tamano real de cada checkpoint y de si se ejecuta el modelo del mundo completo o solo las cabezas textuales sobre un modelo congelado.
- Compatibilidad con GPU de consumo: no disponible. Al tratarse de modelos del mundo para entornos simulados de baja dimensionalidad, es plausible que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: los pesos estan en formato PyTorch (`.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Condicionamiento por lenguaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeVLWM | no disponible | no disponible | Si (captions de plantilla y reescritas por LLM) | no disponible | Hugging Face (ahitagnied/levlwm) |
| LeWM (lucas-maes/le-wm) | no disponible | no disponible | No (baseline incluido con cabezas textuales) | no disponible | Hugging Face (referenciado) |
| PLDM | no disponible | no disponible | Via cabezas textuales | no disponible | Incluido como baseline |
| DINO-WM | no disponible | no disponible | Via cabezas textuales | no disponible | Incluido como baseline |

La comparacion cuantitativa entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el tamano ni el contexto, lo que dificulta evaluar el modelo fuera de su marco experimental.
- Los pesos de varias ejecuciones citadas en la model card ya no existen (captions naturales, captions reescritas, captions de objeto en PushT y modelos de plantilla originales), por lo que no es posible reproducir todas las cifras reportadas.
- El ambito es limitado a cuatro entornos simulados de baja dimensionalidad; no hay evidencia de generalizacion a otros dominios.
- No se especifica la licencia, lo que impide determinar si el uso comercial esta permitido.
- No se documentan sesgos, tasas de alucinacion ni comportamiento multilingue; las captions de entrenamiento parecen estar en ingles.
- El repositorio tiene 0 descargas y 0 likes, y no hay pipeline declarado, lo que sugiere que no ha pasado por una validacion comunitaria.
- El uso en produccion requeriria verificar el formato de los pesos, la compatibilidad con el codigo de entrenamiento original y los ficheros de configuracion por checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/ahitagnied/levlwm
- LeWM (baseline referenciado): https://huggingface.co/lucas-maes/le-wm
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
