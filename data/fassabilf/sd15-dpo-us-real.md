# fassabilf/sd15-dpo-us-real

## Resumen

`fassabilf/sd15-dpo-us-real` es un ajuste fino de la UNet de Stable Diffusion 1.5 entrenado con Diffusion-DPO sobre pares de preferencia generados a partir de 280 fotografias reales de Pexels. El objetivo declarado del experimento es reducir el sesgo de genero en la representacion de ocupaciones (por ejemplo, que "nurse" o "administrative assistant" se generen sistematicamente como mujeres y "software developer" como hombre). Lo publica el usuario fassabilf como artefacto de investigacion, con 20 checkpoints (ep1 a ep20) en formato safetensors y un repositorio de 34,4 GB.

La conclusion del propio autor es negativa y esta documentada con numeros: el DPO no mejora la distribucion. El MAE de test (n=100 por ocupacion) queda entre 0,150 y 0,172 frente al 0,149 de SD 1.5 base, sin diferencias significativas en ningun checkpoint segun un bootstrap pareado por cluster sobre 14 ocupaciones. La rama SFT con los mismos datos y protocolo si baja hasta 0,118. Ademas, la calidad de imagen se degrada: la tasa "unclear" del juez sube de 0,098 a 0,191 en ep20.

Es relevante ahora precisamente por eso: es un caso reproducible de fallo de DPO distribucional en difusion, con el UNet de referencia fijado al SD 1.5 base (no a un checkpoint SFT), lo que permite leerlo directamente contra la base y contra la rama SFT. El autor lo describe explicitamente como objeto de estudio, no como modelo de produccion ni como modelo "mas justo".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (Stable Diffusion 1.5) con text encoder CLIP ViT-L/14 y VAE; solo se publica la UNet |
| Parametros totales | no disponible (no declarado; la UNet de SD 1.5 base ronda los 860 M) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplica como ventana de LLM; limite de 77 tokens de prompt impuesto por el text encoder CLIP de SD 1.5 (no declarado en la model card) |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors de la UNet, sin variantes GGUF, ONNX ni int8 |
| Idiomas soportados | no disponible (la model card no detalla el idioma de las leyendas; el text encoder CLIP de SD 1.5 esta entrenado principalmente en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (formato diffusers) |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Metodo de ajuste | Diffusion-DPO sobre pares de preferencia (beta_dpo = 5000) |
| Dataset de entrenamiento | fassabilf/ift-train-us-real, 280 fotos reales de Pexels (1400 filas de train / 420 de validacion) |
| Checkpoints publicados | ep1 a ep20 |
| Tamano del repositorio | 34,4 GB |
| Componentes NO incluidos | VAE, text encoder y tokenizer (identicos a SD 1.5 base) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 sin modificaciones estructurales: difusion latente sobre una UNet, con VAE y text encoder CLIP heredados del modelo base. El unico componente entrenado y publicado es la UNet. El ajuste se hizo con `train.py` en modo `dpo`, con semilla 0, 20 epocas, learning rate 1e-5, batch de 4 pares con acumulacion de 8 y `beta_dpo = 5000` (valor por defecto del articulo de Diffusion-DPO). La UNet de referencia para el termino de regularizacion del DPO es el propio SD 1.5 base, no un checkpoint SFT previo, de modo que la contribucion medida es exclusivamente la del DPO distribucional.

La construccion de los pares de preferencia es el punto metodologico central. No se usan pares de imagenes con distinta calidad, sino pares distribucionales: la opcion "chosen" procede del pool principal de fotografias, con la proporcion por ocupacion fijada por `p_female_target`, y la opcion "rejected" procede del pool "flip" con exactamente la misma leyenda. Los ficheros del dataset DPO estan en la carpeta `dpo/` del repositorio `fassabilf/ift-train-us-real`. Como innovacion tecnica destacable no hay ninguna aportacion de arquitectura; el valor del artefacto es metodologico, junto con la instrumentacion de evaluacion (REPORT.md con derivacion del plafon teorico, intervalos de confianza por bootstrap pareado y tasa "unclear" de un juez automatico).

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de la UNet ajustada, montada sobre el pipeline de SD 1.5 base.
- Generacion condicionada por leyenda en el rango de resolucion nativo de SD 1.5 (512x512).
- Reproduccion exacta del setup experimental de Diffusion-DPO distribucional, con 20 checkpoints intermedios para analisis de trayectoria.
- Evaluacion de sesgo de genero por ocupacion mediante MAE sobre proporciones femeninas generadas, con plafon teorico calculado.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking": no es un modelo de lenguaje.
- No dispone de capacidades de vision, audio ni video de entrada; es un generador, no un modelo multimodal.
- Capacidades multilingues: no disponible; el comportamiento fuera de leyendas en ingles no esta documentado.

## Casos de uso

- Estudio de reproducibilidad de fallos de DPO: el par de repositorios (rama DPO y rama SFT sobre los mismos datos y protocolo) permite aislar el efecto del objetivo DPO frente al ajuste supervisado en una tarea de debiasing distribucional.
- Referencia negativa en articulos sobre equidad en generacion de imagenes: los valores MAE por ocupacion (0,150-0,172 en DPO frente a 0,149 en base) sirven como cota inferior de lo que no aporta el DPO en este regimen de datos.
- Validacion de instrumentacion de evaluacion de sesgo: el plafon teorico 0,6514 y su superacion desde ep8 en validacion son un caso practico para probar detectores de memorizacion frente a aprendizaje de distribucion.
- Comparacion de objetivos de ajuste en pipelines de difusion: Diffusion-DPO frente a SFT con identico dataset de 280 fotos y 20 epocas, para medir cuanto del efecto atribuido al DPO proviene en realidad del volumen de datos.
- Docencia en cursos de alineamiento de modelos generativos: el README documenta el fallo, los intervalos de confianza y la degradacion de calidad, lo que permite discutir sobreajuste, colapso de clases y significacion estadistica con numeros reales.
- Analisis de colapso de la base: los valores de SD 1.5 (software_developer 0,000; engineer 0,010; administrative_assistant 1,000; nurse 0,989) permiten estudiar por que un ajuste sobre 280 imagenes no puede corregir una base ya saturada.
- No se recomienda su uso en produccion de imagenes, en productos de marketing ni como filtro de equidad: el propio autor indica que la calidad medida empeora y que no hay mejora significativa de la distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de difusion; no hay FID, CLIP score ni ImageReward en la informacion disponible). Los unicos numeros publicados son las metricas de equidad y calidad del propio estudio:

| Metrica | SD 1.5 base | sd15-dpo-us-real | sd15-ift-us-real (SFT) |
|---|---|---|---|
| MAE de test por ocupacion (n=100/ocupacion) | 0,149 | 0,150-0,172 (rango entre checkpoints) | 0,118 |
| Significacion frente a base | - | no significativa en ningun checkpoint (bootstrap pareado por cluster, 14 ocupaciones) | no disponible en esta model card |
| Kecondicion hacia la mayoria (ep20) | - | +0,038, CI [+0,016, +0,065] | no disponible |
| Tasa "unclear" del juez | 0,098 | 0,191 (ep20), CI del cambio [+0,060, +0,132] | no disponible |
| Precision implicita en validacion | - | supera el plafon teorico 0,6514 desde ep8 (indicio de memorizacion de las 280 fotos) | no disponible |

Distribucion colapsada ya en la base (referencia cualitativa, no mejora con DPO): software_developer 0,000; engineer 0,010; administrative_assistant 1,000; nurse 0,989.

## Requisitos de hardware

- VRAM estimada: no declarada. El pipeline SD 1.5 completo (UNet + VAE + text encoder) en fp16 suele operar con 4-6 GB de VRAM; los valores concretos para este checkpoint no estan verificados en la model card.
- Tamano por checkpoint: estimado en unos 1,7 GB a partir del tamano del repositorio (34,4 GB / 20 checkpoints); no es un dato declarado por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para inferencia en fp16; A100, H100, L40S o RTX 4090 sobran para este tamano, pero solo serian necesarias para reentrenar o para evaluacion por lotes.
- Cabe en GPU de consumo: si, en el rango habitual de SD 1.5 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso GPUs de 6-8 GB con atencion eficiente o troceado de VAE).
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI, Automatic1111 / Forge y otros frontends compatibles con checkpoints SD 1.5. Requiere montar manualmente la UNet sobre el pipeline de `stable-diffusion-v1-5/stable-diffusion-v1-5`, ya que VAE, text encoder y tokenizer no se incluyen (ver `scripts/ift/ckpt_to_pipeline.py` del repositorio de codigo).
- No hay soporte GGUF ni llama.cpp para este checkpoint: son herramientas de modelos de lenguaje y no aplican; para difusion existirian rutas tipo stable-diffusion.cpp, pero no se publican conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (UNet) | Contexto de prompt | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fassabilf/sd15-dpo-us-real | no declarado (equivalente a SD 1.5) | 77 tokens (CLIP de SD 1.5) | MAE 0,150-0,172; sin mejora significativa; tasa unclear 0,191 en ep20 | creativeml-openrail-m | HF, 20 checkpoints, solo UNet |
| stable-diffusion-v1-5/stable-diffusion-v1-5 (base) | no declarado | 77 tokens | MAE 0,149; colapso en varias ocupaciones | creativeml-openrail-m | HF, checkpoint completo |
| fassabilf/sd15-ift-us-real (rama SFT) | no declarado | 77 tokens | MAE 0,118; mejor resultado de la comparacion | no disponible en la informacion proporcionada | HF, mismo dataset y protocolo |

No hay datos publicados en la informacion disponible que permitan comparar con alternativas de debiasing mas recientes (por ejemplo, ajustes sobre SDXL o metodos de finetuning con regularizacion).

## Limitaciones y advertencias

- No mejora la equidad: el propio autor afirma que el modelo "no arregla la distribucion" y que la diferencia frente a SD 1.5 base no es significativa en ningun checkpoint.
- Degrada la calidad de imagen: la tasa "unclear" del juez pasa de 0,098 a 0,191 en ep20, con intervalo de confianza del cambio [+0,060, +0,132].
- Indicios de memorizacion: la precision implicita en validacion supera el plafon teorico 0,6514 desde ep8, lo que apunta a memorizacion de las 280 fotos del dataset en lugar de aprendizaje de la distribucion objetivo.
- Sesgos heredados intactos: la base ya esta colapsada en varias ocupaciones (software_developer 0,000; engineer 0,010; administrative_assistant 1,000; nurse 0,989) y el DPO no saca a ninguna de ese estado.
- Evidencia limitada: una sola semilla, 280 imagenes, 14 ocupaciones evaluadas y un unico efecto significativo en uno de cuatro puntos de control.
- Riesgo de alucinacion en el sentido generativo: al estar sobreajustado al dataset, puede reproducir composiciones y rasgos de las fotos de Pexels en lugar de generalizar.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial pero impone restricciones de uso (prohibicion de usos daninos, de desinformacion medica y de generacion de imagenes de personas reales sin consentimiento, entre otras). Conviene revisar el texto completo antes de cualquier despliegue.
- Repositorio incompleto para inferencia directa: solo contiene la UNet; VAE, text encoder y tokenizer no se han subido y hay que tomarlos de SD 1.5 base.
- No es un modelo de produccion: el autor lo define explicitamente como artefacto de investigacion sobre sesgo distribucional de genero.
- Idiomas y contexto fuera de alcance: no hay documentacion sobre comportamiento con leyendas en otros idiomas ni sobre prompts largos (el text encoder de SD 1.5 trunca a 77 tokens).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sd15-dpo-us-real
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
