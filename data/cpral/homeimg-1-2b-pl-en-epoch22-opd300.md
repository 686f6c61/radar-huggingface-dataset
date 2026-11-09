# cpral/HomeIMG-1.2B-PL-EN-epoch22-OPD300

## Resumen

HomeIMG-1.2B-PL-EN-epoch22-OPD300 es un modelo de generación de imágenes texto-a-imagen bilingüe (polaco e inglés) desarrollado por el usuario cpral. Se trata de un experimento de destilación on-policy aplicada sobre HomeIMG-1.2B-PL-EN-epoch22, un modelo de difusión de 1.235 millones de parámetros construido a partir de FLUX.2 [klein] base 4B de Black Forest Labs. El objetivo concreto es transferir la velocidad condicional del profesor (con su guidance CFG 4) al alumno, de modo que este pueda generar imágenes con `guidance_scale=1.0` y un único pase del denoiser por paso, reduciendo el coste de inferencia aproximadamente a la mitad.

La arquitectura es un diffusion transformer con formulación de flow matching (rectified flow), que opera en el espacio latente del VAE de FLUX.2. El modelo se entrena exclusivamente a 256×256 píxeles y su pipeline, `AuroraIMG2Pipeline`, requiere `trust_remote_code=True` y una versión de diffusers con `AutoencoderKLFlux2`.

Su relevancia es doble: por un lado, documenta una técnica de destilación (DiffusionOPD) que integra el classifier-free guidance en la velocidad aprendida sin reducir el número de pasos de muestreo; por otro, es un ejemplo reproducible de entrenamiento de un modelo de imagen bilingüe de pequeño tamaño sobre hardware de consumo (8× RTX 3090 Ti). No obstante, el propio autor lo califica de experimental y con evaluación únicamente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con flow matching (rectified flow) sobre latentes del VAE de FLUX.2 |
| Parametros totales | 1.235.000.832 (1,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | Pesos en bf16; expertos del text encoder en int8; no se documentan otras cuantizaciones |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache-2.0 (refiner, denoiser y código); text_encoder bajo openmdw-1.1; VAE Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 9,8 GB) |
| Resolucion de entrenamiento | 256×256 (única resolución soportada de forma fiable) |
| Pasos de muestreo | 50 pasos Euler con `guidance_scale=1.0` |
| Pipeline | `AuroraIMG2Pipeline` (custom_pipeline) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer entrenado con flow matching, que predice la velocidad instantánea del flujo entre ruido y latente. Trabaja en la misma espacio latente que FLUX.2 (VAE FLUX.2 small decoder), lo que permite la destilación directa desde el profesor. El text encoder es Poziomka-Baza-2026-09-05, congelado y con expertos en int8, junto con su propio tokenizer.

El entrenamiento parte de los pesos EMA de HomeIMG-1.2B-PL-EN-epoch22 y aplica destilación on-policy según DiffusionOPD (arXiv:2605.15055). En cada paso, el alumno genera trayectorias propias desde ruido (50 pasos Euler, solo velocidad condicional, sin CFG); de cada trayectoria se muestrean 8 estados con un desplazamiento aleatorio de la rejilla temporal para cubrir todo el intervalo [0,1]; el profesor FLUX.2 [klein] base 4B evalúa esos estados devolviendo su velocidad con CFG 4 sobre el original inglés del caption, incluso cuando el alumno recibió su traducción al polaco. La pérdida es el error cuadrático entre la velocidad del alumno y la del profesor. Se realizaron 300 pasos × 48 prompts = 14.400 trayectorias y 115.200 estados evaluados, con un 50% de prompts en polaco. El optimizador sigue el esquema del modelo base (MuLoCo, Muon/CMuon con normalización espectral cada 3 pasos, AdamW; lr de Muon 1e-3). El cómputo se repartió en 8× RTX 3090 Ti (3 para el alumno, 4 para el profesor, 1 para Poziomka) durante unos 69 minutos.

La innovación principal es que el modelo aprende la velocidad del profesor con su guidance incorporada, de modo que la inferencia usa `guidance_scale=1.0` y un solo pase del denoiser por paso, en lugar de dos pases como exigiría el CFG convencional. No es una destilación de número de pasos al estilo DMD2: el modelo sigue muestreándose en 50 pasos.

## Capacidades

- Generación de imágenes texto-a-imagen a 256×256 píxeles.
- Descripción en polaco e inglés, con prompts en ambos idiomas.
- Generación con `guidance_scale=1.0` sin pérdida aparente de calidad frente al modelo base con CFG 3, a mitad de coste de inferencia.
- Composición y estilo próximos a FLUX.2 [klein] base 4B, según evaluación visual del autor.
- Control de semilla mediante `torch.Generator` para reproducibilidad.
- Parámetro `resolution=` en el pipeline (cuadrado, múltiplo de 16), aunque solo 256×256 fue entrenado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Prototipado rápido de generación de imágenes en local: el modelo cabe en una GPU de consumo y genera a 256×256 con 50 pasos Euler, lo que permite iterar sobre prompts en un equipo doméstico.
- Aplicaciones bilingües polaco-inglés: útil para productos dirigidos al mercado polaco donde el equipo redacta prompts en polaco pero se apoya en conocimiento visual aprendido de captions en inglés.
- Generación de miniaturas y avatares de baja resolución: a 256×256 encaja en interfaces de usuario que muestran previsualizaciones pequeñas, evitando el coste de modelos de mayor resolución.
- Investigación en destilación de modelos de difusión: sirve como referencia reproducible de DiffusionOPD con código público (`train_pp.py --opd`) y registro de métricas de pérdida.
- Experimentación académica con hardware limitado: el entrenamiento completo se ejecutó en 8× RTX 3090 Ti en poco más de una hora, lo que lo hace viable para grupos con presupuesto reducido.
- Generación de datos sintéticos de baja resolución para aumento de datasets o pruebas de pipelines de visión por computador, aceptando las limitaciones de calidad del modelo.
- Base para futuros fine-tunes: al ser Apache-2.0 y estar en formato safetensors con diffusers, puede servir de punto de partida para ajustes posteriores con otras resoluciones o estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de entrenamiento y una evaluación visual:

| Metrica | Valor |
|---|---|
| Perdida OPD (inicio → final) | 0,32 → ~0,19 |
| val/loss (flow matching estandar) | 0,6170 → 0,6594 (aumento esperado por incorporar CFG) |
| FD-DINOv2 | No medido |
| Evaluacion cualitativa | Calidad similar al base con CFG 3 a mitad de coste; peor en algunos prompts (letrero de neón, cometa) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,2B parámetros en bf16 y el text encoder con expertos en int8, el conjunto es manejable en GPUs de consumo, aunque el autor no publica una cifra concreta.
- GPU recomendadas: el autor entrenó en RTX 3090 Ti; para inferencia se puede usar cualquier GPU con memoria suficiente para el pipeline completo en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y tarjetas con 24 GB o más; no se confirma el mínimo exacto.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)` y `AutoencoderKLFlux2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles; el autor solo indica que el uso de `guidance_scale=1.0` reduce el coste a la mitad frente al modelo base con CFG, al requerir un pase del denoiser por paso en lugar de dos.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch22-OPD300 | 1,2B | 256×256 | pl, en | Apache-2.0 | Destilado on-policy, CFG 1, 50 pasos |
| HomeIMG-1.2B-PL-EN-epoch22 | 1,2B | 256×256 | pl, en | Apache-2.0 | Modelo base del que parte; requiere CFG convencional |
| FLUX.2 [klein] base 4B | 4B | No disponible en la informacion | No disponible | Apache-2.0 | Profesor; CFG 4; mayor tamano y presumiblemente mayor calidad |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: destilación de solo una hora y evaluación únicamente visual, sin métricas objetivas como FD-DINOv2.
- Resolución limitada a 256×256; otras resoluciones producen resultados deficientes según el autor.
- Entrenado sobre unos 6 millones de imágenes sintéticas generadas por FLUX, lo que puede introducir sesgos y artefactos del modelo generador original.
- Texto en imagen ilegible y rostros que pueden aparecer distorsionados.
- Posible menor diversidad que el modelo base, consecuencia típica de la destilación; no medida.
- Obligatorio usar `guidance_scale=1.0`; valores superiores aplican un segundo CFG sobre el incorporado y producen imágenes sobreexpuestas.
- Licencia mixta: el text_encoder contiene pesos de Poziomka-Baza bajo openmdw-1.1, distinta de la Apache-2.0 del resto; los datasets tienen sus propios términos.
- Riesgo de alucinación visual y de sesgos heredados del dataset FLUX-Reason-6M y de los captions traducidos al polaco.
- Soporte multilingüe limitado a polaco e inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch22-OPD300
- Modelo base (epoch22): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch22
- Profesor FLUX.2 [klein] base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Text encoder Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Paper DiffusionOPD: https://arxiv.org/abs/2605.15055
- Codigo de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
