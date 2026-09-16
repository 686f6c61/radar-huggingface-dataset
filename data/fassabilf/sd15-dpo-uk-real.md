# fassabilf/sd15-dpo-uk-real

## Resumen

sd15-dpo-uk-real es un ajuste fino del UNet de Stable Diffusion 1.5 mediante Diffusion-DPO (Direct Preference Optimization aplicado a modelos de difusion) sobre pares de imagenes de preferencia construidos a partir de fotografias reales de Pexels. Lo desarrolla el usuario fassabilf y forma parte de un conjunto de brazos experimentales ("DPO solo", SFT y un brazo equivalente con datos de EE. UU.) cuyo objetivo no es generar mejores imagenes, sino estudiar si el DPO puede corregir la distribucion de genero por ocupacion en un modelo de difusion. El entrenamiento usa 400 fotografias reales, 2.000 pares de preferencia de entrenamiento y 600 de validacion, con 20 epocas y un total de 1.260 pasos.

El problema que aborda es el sesgo de genero en la representacion visual de profesiones: los pares "chosen" siguen la proporcion de mujeres por ocupacion declarada por la ONS (Office for National Statistics, Reino Unido), mientras que los "rejected" son la misma fotografia con el genero invertido y el mismo pie de foto. El modelo cubre 20 ocupaciones de entrenamiento y deja 5 ocupaciones held-out sin entrenar para medir generalizacion.

Es relevante ahora como caso de estudio negativo o ambiguo: la propia model card advierte que la evaluacion MAE de test esta incompleta, que el loss DPO de entrenamiento sube de 0,91 a 1,56 mientras el error de reconstruccion (`model_mse`) supera al de referencia desde la epoca 5, y que la validacion a t fijo muestra un pico de precision implicita en la epoca 6 seguido de degradacion, patron compatible con memorizacion de las 400 fotografias. El autor indica explicitamente que debe tratarse como objeto de estudio, no como un modelo mas justo que la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (SD 1.5); el pipeline completo es text-to-image latente con VAE y text encoder CLIP |
| Parametros totales | no disponible (no se declara en la model card; el repositorio contiene unicamente el UNet de SD 1.5) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible; la condicion de texto depende del text encoder de SD 1.5 (limite de 77 tokens por prompt) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no declarados; los prompts del dataset de entrenamiento estan en ingles |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M) |
| Formato de pesos | safetensors (checkpoints del UNet por epoca) |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Tamano del repositorio | 36,1 GB |
| Checkpoints incluidos | ep1 a ep20 (20 ficheros) |
| Componentes incluidos | solo UNet; VAE, text encoder y tokenizer no se suben (identicos a SD 1.5 base) |
| Libreria | diffusers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 sin modificaciones estructurales: un UNet de difusion latente que se condiciona con embeddings de texto del text encoder de SD 1.5. El ajuste se aplica exclusivamente al UNet y usa como referencia (reference model) el propio SD 1.5 base, no un checkpoint SFT previo; por eso se describe como brazo "DPO solo" y puede compararse directamente tanto contra la base como contra el modelo hermano `fassabilf/sd15-ift-uk-real` (brazo SFT, mismos datos y protocolo).

El entrenamiento se hizo con `train.py` en modo `dpo` sobre el dataset `fassabilf/ift-train-uk-real` (carpeta `dpo/`), a partir de 400 fotografias reales de Pexels, con `--seed 0` y 20 epocas. Hiperparametros declarados: `beta_dpo = 5000` (valor por defecto del paper de Diffusion-DPO), batch de 4 pares con acumulacion de 8, learning rate 1e-5 y 1.260 pasos totales (63 pasos por epoca). La construccion de pares es distribucional: el elemento "chosen" procede del pool principal de fotografias, con la proporcion por ocupacion fijada por `p_female_target` de la ONS, y el "rejected" es la version con genero invertido y el pie de foto identico. Se generan 2.000 pares de entrenamiento y 600 de validacion a partir de 400 fotografias unicas por split. Las 20 ocupaciones entrenadas (sufijo `_uk`) son: mechanic, civil_engineer, engineer, engineering_technician, it_support, caretaker, it_operations, sales_executive, lab_technician, finance_analyst, sports_coach, higher_ed_teacher, director, accountant, further_ed_teacher, secondary_teacher, office_manager, nurse, teaching_assistant y personal_assistant. Las 5 ocupaciones held-out son: metal_fitter, senior_care_worker, care_worker, crossing_patrol y education_support.

No se describe ninguna innovacion arquitectonica propia: la contribucion es metodologica (construccion de pares de preferencia a partir de proporciones estadisticas oficiales y evaluacion con plafon teorico de precision implicita). Los datos de evaluacion, barras de error y el "suelo" de MAE estan en la carpeta `analysis/` del repositorio de codigo, junto con `hparams.yml`.

## Capacidades

- Generacion text-to-image condicionada por prompt, heredada del UNet de SD 1.5.
- Generacion de imagenes de personas en 20 ocupaciones concretas del contexto laboral del Reino Unido (lista `_uk` anterior).
- Ajuste de la distribucion de genero por ocupacion hacia las proporciones objetivo de la ONS en el conjunto de entrenamiento.
- Capacidad (no verificada) de transferir ese ajuste a las 5 ocupaciones held-out, pendiente de la evaluacion MAE de test no completada.
- Publicacion de 20 checkpoints intermedios (ep1 a ep20), lo que permite estudiar la evolucion del efecto del DPO epoca a epoca.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No tiene modo de razonamiento, modo "thinking", ni capacidades de agente o razonamiento multi-paso.
- No procesa audio ni video; solo imagen.
- No tiene capacidades multilingues declaradas; el condicionamiento de texto se hace en ingles.

## Casos de uso

- Auditoria de sesgo de genero en modelos de difusion: comparar la precision implicita por epoca (0,525 en ep1 frente a 0,633 en ep20) y el plafon teorico de 0,6432 para estudiar si el DPO mueve la distribucion generada o solo memoriza el conjunto de 400 fotografias.
- Reproduccion de experimentos de Diffusion-DPO con presupuesto minimo de datos: el protocolo completo (400 imagenes, 2.000 pares, 1.260 pasos, `beta_dpo = 5000`, lr 1e-5) es replicable y util para validar metodologia de alineamiento por preferencias en difusion.
- Estudio del sobreajuste en DPO con datasets pequenos: la validacion a t fijo (loss de 0,693 a 1,43 sin minimo; precision implicita con pico de 0,654 en ep6 y caida posterior a 0,63-0,64) es un caso documentado de divergencia entre metrica de preferencia y calidad de reconstruccion.
- Comparacion controlada de brazos experimentales: este checkpoint esta disenado para leerse contra SD 1.5 base, contra el brazo SFT `fassabilf/sd15-ift-uk-real` y contra el brazo con datos de EE. UU. mencionado en la model card, con datos y protocolo comunes.
- Docencia y formacion en tecnicas de alineamiento: los 20 checkpoints intermedios permiten mostrar en clase como evolucionan simultaneamente el loss DPO (0,91 a 1,56) y el `model_mse` relativo al modelo de referencia desde la epoca 5.
- Desarrollo de metodologia de evaluacion: la definicion de un plafon teorico de precision implicita (0,6432) y su calculo en `analysis/ceiling.csv` sirven como plantilla para evaluar fairness en generacion de imagenes por ocupacion.
- Pruebas de integracion de pipelines de difusion: montar el UNet en el pipeline de SD 1.5 mediante `scripts/ift/ckpt_to_pipeline.py` para verificar carga de pesos, resolucion de prompts y compatibilidad con diffusers.
- Generacion de imagenes de prueba en contextos laborales del Reino Unido, siempre que se acepte que no hay evidencia publicada de mejora distribucional y que el autor desaconseja su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible. La model card indica explicitamente que el barrido de MAE de test no estaba terminado en el momento de la subida y que no existe ninguna afirmacion de mejora sobre la base. Los unicos datos cuantitativos disponibles son metricas internas de entrenamiento y validacion:

| Metrica | Valor |
|---|---|
| Precision implicita (train), ep1 | 0,525 |
| Precision implicita (train), ep5 | 0,617 |
| Precision implicita (train), ep10 | 0,612 |
| Precision implicita (train), ep15 | 0,635 |
| Precision implicita (train), ep20 | 0,633 |
| Plafon teorico de precision implicita | 0,6432 |
| Loss DPO (train) | sube de 0,91 a 1,56 |
| `model_mse` frente a `ref_mse` | `model_mse` mayor desde la epoca 5 |
| Loss en validacion a t fijo | sube de 0,693 a 1,43 sin minimo |
| Precision implicita en validacion a t fijo | pico de 0,654 en ep6, despues 0,63-0,64 |
| Delta MAE emparejado frente a base | no disponible (barrido no completado) |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion sobre el pipeline SD 1.5 completo, no declarada por el autor): entre 3 y 4 GB en fp16 y entre 6 y 8 GB en fp32, sumando UNet, VAE y text encoder.
- El checkpoint subido contiene solo el UNet: hay que cargarlo sobre `stable-diffusion-v1-5/stable-diffusion-v1-5`, por lo que se necesita tambien el espacio de los componentes base.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en fp16. Para reproducir el entrenamiento completo se recomienda una GPU de 16 GB o superior (A100, H100, RTX 4090, L40S), aunque el autor no publica requisitos de entrenamiento.
- Cabe en GPU consumer: si. El cuello de botella es el repositorio de 36,1 GB en disco (20 checkpoints del UNet), no la VRAM.
- Opciones de despliegue: diffusers con el UNet sustituido en el pipeline de SD 1.5 (via `scripts/ift/ckpt_to_pipeline.py`), asi como interfaces que permitan cargar un UNet alternativo sobre la base (por ejemplo Automatic1111 o ComfyUI). vLLM, llama.cpp y Ollama no aplican: son herramientas para modelos de lenguaje, no para difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Metodo | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fassabilf/sd15-dpo-uk-real | SD 1.5 | Diffusion-DPO, brazo "DPO solo" | 400 fotos Pexels; 2.000 pares train / 600 val; 20 ocupaciones UK | CreativeML OpenRAIL-M | HuggingFace, 0 descargas, 0 likes |
| fassabilf/sd15-ift-uk-real | SD 1.5 | SFT (instrucciones) | mismos datos y protocolo que el brazo DPO | no disponible | referenciado en la model card |
| Brazo equivalente con datos de EE. UU. (mismo autor) | SD 1.5 | Diffusion-DPO | 44 pasos por epoca, dataset estadounidense | no disponible | mencionado sin enlace |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | - | preentrenamiento (LAION-5B) | miles de millones de pares imagen-texto | CreativeML OpenRAIL-M | ampliamente disponible |
| Diffusion-DPO original (paper de referencia) | SD 1.5 / SDXL | Diffusion-DPO | datasets de preferencia (Pick-a-Pic) | no disponible | mencionado como "paper" sin enlace en la model card |

No se dispone de datos de rendimiento comparables entre estos modelos: la model card no publica FID ni metricas estandar, y el delta MAE frente a la base sigue pendiente.

## Limitaciones y advertencias

- Sesgo de representacion: el modelo se entrena para reproducir proporciones de genero por ocupacion derivadas de `p_female_target` de la ONS; esto puede interpretarse como consolidacion de roles de genero en lugar de correccion del sesgo, y el autor no reclama ninguna mejora.
- Sesgo de origen de datos: las 400 fotografias son material de stock (Pexels), con los sesgos de edad, etnia, corporalidad y clase social propios de ese tipo de banco de imagenes, no documentados en la model card.
- Sobreajuste documentado: la validacion a t fijo sube de 0,693 a 1,43 sin minimo y la precision implicita cae tras la epoca 6, patron que el autor atribuye a memorizacion de las 400 fotografias.
- Degradacion de la reconstruccion: `model_mse` supera a `ref_mse` desde la epoca 5, es decir, el modelo gana en la metrica de preferencia a costa de reconstruir peor.
- Evaluacion incompleta: no existe delta MAE emparejado frente a la base ni informe `analysis/REPORT.md` en el momento de la publicacion; cualquier afirmacion de mejora carece de respaldo.
- Cobertura limitada: solo 20 ocupaciones entrenadas; las 5 held-out (metal_fitter, senior_care_worker, care_worker, crossing_patrol, education_support) no tienen garantia de comportamiento.
- Contexto geografico y linguistico restringido: datos y estadisticas del Reino Unido, prompts en ingles; no hay soporte multilingue declarado.
- Empaquetado incompleto: al no incluir VAE, text encoder ni tokenizer, el modelo no es directamente ejecutable sin descargar SD 1.5 base y montar el pipeline a mano.
- Restricciones de licencia: CreativeML Open RAIL-M permite uso comercial pero impone restricciones de uso por finalidad (uso danino, desinformacion, vigilancia, etc.) que deben propagarse a los derivados; conviene revisar el texto completo antes de cualquier despliegue.
- Riesgo de contenido no seguro: la model card no menciona filtros de seguridad ni clasificadores NSFW, y hereda las capacidades y los riesgos del SD 1.5 base.
- Advertencia explicita del autor: "artefacto de investigacion sobre sesgo distribucional de genero, no un modelo de produccion".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sd15-dpo-uk-real
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento y validacion: https://huggingface.co/datasets/fassabilf/ift-train-uk-real (carpeta `dpo/`)
- Brazo SFT relacionado: https://huggingface.co/fassabilf/sd15-ift-uk-real
- Script de conversion de checkpoint a pipeline: ruta `scripts/ift/ckpt_to_pipeline.py` del repositorio de codigo del autor (URL no disponible)
- Ficheros de configuracion y analisis dentro del repositorio: `hparams.yml`, `analysis/ceiling.csv`, `analysis/fixedt_dpo_val.csv`, `analysis/REPORT.md` (este ultimo pendiente en el momento de la publicacion)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados sobre el distrito de Chaoyang (Pekin), sin relacion con este checkpoint.
