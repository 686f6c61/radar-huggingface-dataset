# data266-team11/data266-lab2-team11-sd15-dora-r16

## Resumen

El modelo `data266-team11/data266-lab2-team11-sd15-dora-r16` es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) de rango 16 entrenado sobre el UNet de Stable Diffusion 1.5. Lo desarrolla el equipo 11 del curso DATA 266 en el contexto de un laboratorio academico, y su funcion es especializar el modelo base en la generacion de imagenes con el estilo visual del dataset `lambdalabs/naruto-blip-captions`. No es un modelo autonomo: requiere cargar Stable Diffusion 1.5 y aplicar el adaptador sobre el UNet mediante PEFT.

El adaptador introduce 3.288.576 parametros entrenables, un 0,3811 % del total del UNet, lo que lo convierte en un artefacto ligero y facil de distribuir. Se entreno durante 2000 pasos de optimizador sobre 1099 imagenes de entrenamiento a 512x512, con un plan de dos etapas de learning rate y tecnicas como Min-SNR-gamma weighting, caption dropout y EMA. El checkpoint exportado corresponde al paso 1200, seleccionado por menor perdida de validacion (0,06088).

Su relevancia es fundamentalmente metodologica: demuestra un flujo completo de fine-tuning parametrizado eficiente sobre un modelo de difusion, con evaluacion cuantitativa (KID, CLIP score, diversidad LPIPS) frente al modelo base. La mejora en KID para prompts dentro del dominio es notable (0,02815 frente a 0,15218 del base), aunque a costa de una ligera perdida de alineacion texto-imagen segun CLIP (26,408 frente a 28,33).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (LoRA con descomposicion de pesos) sobre el UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 3.288.576 parametros entrenables (0,3811 % del UNet); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagen); resolucion de entrenamiento 512x512 |
| Tipos de cuantizacion | No disponible (pesos exportados en safetensors; el adaptador puede combinarse con el base en fp16/bf16) |
| Idiomas soportados | No disponible (las prompts de entrenamiento son captions BLIP en ingles) |
| Licencia | CreativeML Open RAIL-M (heredada de SD 1.5); uso solo para investigacion por la licencia del dataset (CC-BY-NC-SA 4.0) |
| Formato de pesos | Safetensors en formato PEFT (adaptador DoRA: rank 16, alpha 32, targets `to_q`, `to_k`, `to_v`, `to_out.0`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de atencion del UNet de Stable Diffusion 1.5 (`to_q`, `to_k`, `to_v`, `to_out.0`) con rango 16 y alpha 32, usando la variante DoRA, que descompone los pesos en magnitud y direccion para mejorar la estabilidad del ajuste fino de bajo rango. El entrenamiento se realizo sobre `lambdalabs/naruto-blip-captions` (1221 imagenes, 0 corruptas y 0 duplicadas eliminadas), con split 90/10 y semilla 266 (1099 entrenamiento / 122 test), recortes centrales de 512x512 y captions automaticos generados con BLIP.

El plan de entrenamiento consta de 2000 pasos de optimizador con batch 4 y acumulacion 1. La etapa 1 (pasos 1-1200) usa LR pico de 0,0002; la etapa 2 (pasos 1201-2000) baja a 8e-05 y aplica noise offset de 0,05. Se emplea decaimiento coseno con warm-up dentro de cada etapa, ponderacion Min-SNR-gamma, caption dropout, EMA con factor 0,999, autocast en bf16 y semilla 266. Se reservaron 55 imagenes de entrenamiento para validacion. El entrenamiento consumio 7,122 GB de VRAM pico y 0,3195 GPU-horas en una NVIDIA A40. El checkpoint exportado es el paso 1200 con pesos crudos, por menor perdida de validacion.

## Capacidades

- Generacion texto-a-imagen en el estilo visual y la paleta del dataset Naruto BLIP-captions.
- Especializacion estilistica: reproduce la estetica anime del dataset a partir de prompts textuales.
- Compatible con el pipeline `StableDiffusionPipeline` de diffusers y con `PeftModel` para cargar el adaptador.
- Acepta parametros de inferencia estandar de SD 1.5: numero de pasos (evaluado con DPM-Solver++ a 30 pasos) y escala de guidance (evaluada a 7,5).
- No aprende identidades de personajes concretos: las captions son genericas y el adaptador captura estilo, no sujetos especificos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no disponibles; el entrenamiento usa captions en ingles.

## Casos de uso

- Generacion de ilustracion anime para prototipos: el adaptador permite producir imagenes con la estetica del dataset sin reentrenar SD 1.5, util para maquetas visuales y pruebas de concepto en un entorno de investigacion.
- Investigacion en fine-tuning eficiente: sirve como referencia reproducible de un pipeline DoRA con evaluacion KID/CLIP/LPIPS frente al modelo base, util para comparar tecnicas de adaptacion de bajo rango.
- Docencia y laboratorios academicos: el artefacto ilustra el ciclo completo de entrenamiento, validacion y exportacion de un adaptador sobre un modelo de difusion, con hiperparametros y semillas documentados.
- Generacion de fondos y assets estilizados: para proyectos no comerciales que necesiten ambientacion anime coherente con la paleta del dataset, con prompts dentro del dominio.
- Experimentos de diversidad generativa: la metrica LPIPS entre semillas (0,7051 frente a 0,7068 del base) permite estudiar como el adaptador preserva la variabilidad del modelo original.
- Estudio de deriva de dominio: el comportamiento documentado (prompts fuera de dominio tienden a retratos) lo hace util para analizar como un adaptador estilistico sesga la distribucion de salida.
- Base para adaptadores compuestos: al ser un adaptador PEFT ligero, puede combinarse o compararse con otros LoRA/DoRA sobre el mismo UNet en experimentos de composicion de estilos.

## Benchmarks y rendimiento

Evaluacion con 20 prompts fijos y semillas 0/1, DPM-Solver++ a 30 pasos y CFG 7,5:

| Metrica | Adaptador DoRA r16 | SD 1.5 base |
|---|---|---|
| KID vs imagenes de test (prompts en dominio) | 0,02815 +/- 0,01512 | 0,15218 +/- 0,02259 |
| CLIP score (prompt-imagen) | 26,408 | 28,33 |
| Diversidad LPIPS entre semillas | 0,7051 | 0,7068 |

Nota del autor: el KID es ruidoso con solo 20 imagenes. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de difusion) en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 7,122 GB pico en una NVIDIA A40 (batch 4, bf16).
- VRAM de inferencia: no disponible de forma explicita; al ejecutar SD 1.5 en fp16 con el adaptador cargado, el consumo es el del modelo base mas el del adaptador (unos pocos MB adicionales por los 3,29 M de parametros).
- GPU recomendadas para entrenamiento: NVIDIA A40 (validada); tarjetas con al menos 8 GB de VRAM son suficientes segun el pico registrado.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas para inferencia en fp16 de SD 1.5; no se aporta una medicion especifica en la informacion disponible.
- Opciones de despliegue: `diffusers` + `peft` (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion en este formato).
- Latencia y throughput: no disponibles. Coste de entrenamiento registrado: 0,3195 GPU-horas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| data266-lab2-team11-sd15-dora-r16 | Adaptador DoRA sobre SD 1.5 | 3,29 M entrenables | 512x512 | KID 0,02815; CLIP 26,408 | CreativeML Open RAIL-M (uso solo investigacion por dataset) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | Modelo de difusion completo | No disponible en la informacion | 512x512 | KID 0,15218; CLIP 28,33 | CreativeML Open RAIL-M | Ampliamente disponible |
| Otros adaptadores LoRA/DoRA sobre SD 1.5 | Adaptadores PEFT | Variable | 512x512 | No disponible | Variable | Multiples en Hugging Face |

No se dispone de datos de benchmarks de adaptadores alternativos en la informacion proporcionada para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Aprende el estilo y la paleta del dataset, no identidades de personajes: las captions BLIP son genericas y no describen sujetos concretos.
- Los prompts fuera de dominio tienden a derivar hacia retratos.
- Los prompts composicionales con tres o mas personajes suelen fusionarlos o contarlos mal.
- Entrenado sobre solo 1099 imagenes: aparecen poses y fondos repetidos.
- El dataset contiene personajes con derechos de autor; el adaptador es solo para investigacion no comercial.
- Licencia de los pesos: CreativeML Open RAIL-M, heredada de SD 1.5, pero restringida a investigacion por la licencia CC-BY-NC-SA 4.0 del dataset.
- Riesgo de memorizacion: el autor indica que se realizo una comprobacion de memorizacion (imagen de entrenamiento mas cercana por CLIP) reportada en el informe del laboratorio, pero el resultado no se detalla en la model card.
- Las salidas se filtraron con el safety checker de Stable Diffusion; no se documentan otras salvaguardas.
- El KID se calculo con solo 20 imagenes, por lo que es una metrica ruidosa y debe interpretarse con cautela.
- No hay informacion sobre sesgos demograficos ni sobre rendimiento en idiomas distintos del ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/data266-team11/data266-lab2-team11-sd15-dora-r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Codigo de entrenamiento: `src/p2/train.py` en el repositorio del equipo `data266-lab2-team11` (no se proporciona URL directa en la informacion disponible)
- Paper o blog del modelo: no disponible
- Demo: no disponible
