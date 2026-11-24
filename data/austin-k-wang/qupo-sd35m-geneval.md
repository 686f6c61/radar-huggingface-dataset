# austin-k-wang/qupo-sd35m-geneval

## Resumen

QUPO SD3.5-M GenEval es un adaptador LoRA para el modelo de difusion texto-a-imagen Stable Diffusion 3.5 Medium, desarrollado por Austin K. Wang (con Lexing Ying como coautor del articulo asociado). El adaptador se entrena mediante Quantile Utility Policy Optimization (QUPO), una tecnica de ajuste post-entrenamiento basada en aprendizaje por refuerzo que optimiza directamente una utilidad cuantilica sobre las recompensas, en lugar de maximizar la recompensa esperada. El checkpoint publicado corresponde a un ajuste especifico sobre el benchmark GenEval, orientado a mejorar la fidelidad de la generacion respecto a la instruccion textual.

El modelo no introduce una arquitectura nueva: es un adaptador PEFT (LoRA de rango 32 y alpha 64) que se acopla al transformer del pipeline de SD3.5 Medium. Su relevancia es fundamentalmente metodologica, ya que sirve como artefacto reproducible para estudiar como escalan las ganancias del RL visual en tiempo de test segun el articulo "Do Visual RL Gains Scale at Test Time? A Quantile View of Post-Training".

El repositorio es muy ligero (0,1 GB) y esta pensado para cargarse sobre la pipeline base de SD3.5-M y, opcionalmente, fusionarse con `merge_and_unload`. No se dispone de informacion sobre idiomas soportados ni de resultados de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer de Stable Diffusion 3.5 Medium (difusion texto-a-imagen) |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el modelo base SD3.5-M tiene ~2,5 mil millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitado por el tokenizador de texto de SD3.5-M) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Stability AI Community License |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el transformer de Stable Diffusion 3.5 Medium, un modelo de difusion latente condicionado por texto. El ajuste emplea Quantile Utility Policy Optimization (QUPO), un metodo de optimizacion de politica que trabaja sobre una utilidad cuantilica de las recompensas; segun la model card, se configura con alpha = -0,5, presupuesto maximo T = 16, normalizacion de pesos de utilidad desactivada, coeficiente KL beta = 0,04 y tasa de aprendizaje 3e-4. El entrenamiento se realizo sobre el benchmark GenEval, con checkpoint final en el paso 3350.

El adaptador tiene rango 32 y alpha 64, y su SHA-256 se documenta en la model card (`703f068cb9e6ced728b21d2bb857ce0483aa51a72b503adac5d288fa128d6766`). No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del propio esquema QUPO.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, heredando las capacidades del modelo base SD3.5 Medium.
- Ajuste orientado a la fidelidad compositiva y de atributos evaluada por GenEval (posicion, conteo, color, etc.).
- Integracion como adaptador PEFT sobre `pipeline.transformer`, con opcion de fusion mediante `merge_and_unload`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en RL para modelos generativos: reproducir el experimento del articulo cargando el adaptador sobre SD3.5-M y evaluando sobre GenEval con 40 pasos de inferencia y guidance scale 4,5.
- Generacion de imagenes con control compositivo: usar el adaptador para tareas donde la colocacion y el conteo de objetos importan, aprovechando el ajuste especifico sobre GenEval.
- Comparativas de metodos de post-entrenamiento: contrastar QUPO frente a otros esquemas de RL o fine-tuning sobre el mismo modelo base.
- Prototipado de pipelines texto-a-imagen en entornos de investigacion con recursos limitados, dado el tamano reducido del adaptador (0,1 GB) frente al modelo base.
- Estudio de escalado en tiempo de test: analizar como varia la calidad con el numero de pasos y el guidance scale, siguiendo la configuracion del paper.
- Base para adaptaciones derivadas: partir de este LoRA como inicializacion para nuevos ajustes sobre SD3.5-M en tareas visuales especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base SD3.5 Medium; el adaptador LoRA anade una sobrecarga minima (repo de 0,1 GB).
- GPU recomendadas: no disponible en la informacion proporcionada; en general, SD3.5-M requiere GPU con memoria suficiente para difusion a resoluciones tipicas, pero no se aportan cifras concretas.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: carga via PEFT (`PeftModel.from_pretrained`) sobre la pipeline de Diffusers de SD3.5-M; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM).
- Latencia y throughput: no disponibles. La evaluacion del paper usa 40 pasos de inferencia y guidance scale 4,5.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QUPO SD3.5-M GenEval | LoRA sobre SD3.5-M | no disponible (adaptador rango 32) | no disponible | Stability AI Community License | Hugging Face |
| Stable Diffusion 3.5 Medium (base) | Difusion texto-a-imagen | ~2,5 mil millones | no disponible | Stability AI Community License | Hugging Face |
| Otros LoRA de SD3.5-M | Adaptadores PEFT | no disponible | no disponible | segun autor | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta ajustado especificamente sobre GenEval; su comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- No hay resultados de benchmarks publicados que permitan verificar la mejora cuantitativa.
- No se documentan sesgos conocidos ni tasas de alucinacion; como modelo generativo de imagenes, puede producir contenido inexacto o estereotipado.
- Idiomas soportados no especificados; las capacidades multilingues dependen del modelo base.
- La licencia Stability AI Community License impone condiciones para uso comercial; es necesario revisar el archivo LICENSE.md del modelo base.
- Requiere cargar el modelo base SD3.5-M (varios GB) ademas del adaptador; el adaptador por si solo no es utilizable.
- El checkpoint corresponde al paso 3350 de un entrenamiento concreto; no se garantiza estabilidad fuera de la configuracion de evaluacion (40 pasos, guidance 4,5).

## Enlaces

- Hugging Face: https://huggingface.co/austin-k-wang/qupo-sd35m-geneval
- Codigo: https://github.com/austin-k-wang/QUPO
- Paper: https://arxiv.org/abs/2611.02366
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia del modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
