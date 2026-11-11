# burkiuzeai/cobalt-image

## Resumen

COBALT Image es una distribución del modelo de generación de imágenes texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, publicada por COBALT AI bajo licencia Apache 2.0. La versión 0.1 redistribuye los pesos originales sin modificaciones: COBALT AI no ha entrenado ni ajustado el modelo, y la calidad de imagen es exactamente la del modelo base. Lo que aporta esta distribución es el ecosistema que la rodea: un motor de inferencia con modo de bajo consumo que funciona sin GPU, una API HTTP, una herramienta de preparación de datasets y un arnés de evaluación.

El modelo subyacente es un transformer de flujo rectificado (rectified flow) de aproximadamente 3.875 millones de parámetros, con un codificador de texto Qwen3 y un VAE propio de FLUX.2. Está destilado por pasos, de modo que genera imágenes con solo 4 pasos de muestreo y un guidance de 1.0. Su relevancia actual radica en que permite ejecutar generación de imágenes de calidad razonable en hardware muy modesto: el modo escalonado del motor COBALT evita mantener simultáneamente en memoria el codificador de texto y el transformer, logrando inferencias en CPU con unos 9 GB de RAM.

La ficha es especialmente relevante para desarrolladores que necesiten integrar generación de imágenes en entornos sin GPU o con presupuestos de memoria ajustados, así como para quienes quieran evaluar la viabilidad de FLUX.2 klein antes de comprometerse con infraestructura mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow); codificador de texto Qwen3; VAE FLUX.2 |
| Parametros totales | 3.875.544.576 (pesos safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones; el repositorio incluye safetensors en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de flujo rectificado de unos 4B de parámetros, acoplado a un codificador de texto Qwen3 y a un VAE específico de FLUX.2. El muestreo es de 4 pasos con guidance 1.0, lo que indica un proceso de destilación por pasos (step-distilled) que reduce drásticamente el coste de inferencia frente a modelos de difusión convencionales de 20-50 pasos.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. COBALT AI declara explícitamente que no ha entrenado ni ajustado los pesos: la versión 0.1 contiene los pesos sin modificar de FLUX.2 [klein] 4B. Las innovaciones que añade COBALT son de infraestructura, no de modelado: un motor con modo escalonado que nunca mantiene juntos en memoria el codificador de texto y el transformer, y un mecanismo de mejora de prompt (prompt enhancement) que reutiliza el propio codificador Qwen3 para reescribir prompts cortos en descripciones detalladas, sin modelo adicional ni llamada de red.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en inglés, con resoluciones configurables (ancho y alto deben ser múltiplos de 16).
- Muestreo rápido: 4 pasos de inferencia con guidance 1.0 gracias a la destilación por pasos.
- Mejora de prompt opcional (opt-in) usando el codificador de texto Qwen3, que reescribe un prompt corto en uno detallado y reporta tanto el original como el reescrito.
- Modo de bajo consumo escalonado que permite ejecución sin GPU en aproximadamente 9 GB de RAM.
- API HTTP incluida en el paquete `cobalt/` para despliegue como servicio.
- Herramienta de preparación de datasets y arnés de evaluación (`eval/run_eval.py`) incluidos en el repositorio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; es un pipeline puramente texto-a-imagen.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite iterar rápidamente sobre conceptos visuales con 4 pasos de muestreo, y el modo de bajo consumo permite ejecutarlo en un portátil sin GPU dedicada durante fases tempranas de diseño.
- Creación de assets para marketing y redes sociales: con prompts en inglés y resoluciones de 512×512 o 1024×1024, se pueden generar imágenes de apoyo para campañas; la licencia Apache 2.0 permite uso comercial.
- Evaluación de pipelines de generación de imágenes en CI: el arnés de evaluación incluido y la API HTTP permiten montar pruebas automatizadas de regresión visual en entornos de integración continua sin GPU.
- Investigación en generación de imágenes con recursos limitados: el modo escalonado en CPU (unos 56 s por imagen a 512×512 con 4 hilos) hace viable experimentar con FLUX.2 klein en máquinas de laboratorio sin aceleradores.
- Generación de fondos y texturas para aplicaciones: la capacidad de fijar semilla y dimensiones múltiplos de 16 facilita la producción reproducible de assets de fondo para interfaces y juegos.
- Enseñanza y demos de difusión: el paquete `cobalt/` con motor, API y evaluación sirve como ejemplo didáctico de cómo envolver un modelo de difusión en un servicio con gestión de memoria controlada.
- Preprocesado de datasets sintéticos: la herramienta de preparación de datasets incluida sugiere su uso para generar imágenes sintéticas de entrenamiento o aumento de datos en proyectos con presupuesto de hardware reducido.

## Benchmarks y rendimiento

COBALT AI ejecutó una evaluación el 2026-11-11 con `eval/run_eval.py`: 8 prompts, una imagen por prompt, 512×512, 4 pasos, guidance 1.0, semilla 1234, solo CPU (4 hilos, 15 GB de RAM), modo escalonado. Métrica: CLIP score = 100 × similitud coseno con `openai/clip-vit-base-patch32`.

| Prompt id | Categoría | CLIP score | Observación por inspección |
|---|---|---|---|
| photo_portrait | fotorrealismo | 37.72 | retrato convincente |
| hands | anatomía | 34.34 | manos plausibles; disposición de teclas de piano incorrecta |
| count_apples | conteo | 33.28 | tres manzanas, correcto |
| spatial | espacial | 39.00 | cubo sobre la esfera, pero pirámide en el lado equivocado |
| text_sign | texto | 38.37 | "COBALT" escrito correctamente |
| cinematic | cinematográfico | 36.43 | coincide con el prompt |
| architecture | arquitectura | 38.54 | coincide con el prompt |
| illustration | arte | 43.39 | coincide con el prompt y la paleta |

Media CLIP: 37.63. El propio autor advierte que se trata de una prueba de humo (8 imágenes, 512 px, una semilla), no de un benchmark, y que no se han ejecutado GenEval, T2I-CompBench, pruebas de preferencia humana ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: unos 13 GB de VRAM según la model card del modelo base; COBALT AI indica que no lo ha probado.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es de aproximadamente 13 GB de VRAM (suficiente para una RTX 4090 de 24 GB, una RTX 4080 de 16 GB o una A100/H100, aunque no hay pruebas publicadas por COBALT).
- CPU: probado con 15 GB de RAM, 4 hilos y AVX-512/AMX; 512×512 en unos 56 s, con un pico de memoria de 9,0 GB en modo escalonado.
- Cabe en GPU de consumo: sí, según el requisito de ~13 GB del modelo base, aunque no verificado por el distribuidor.
- Opciones de despliegue: `diffusers` con `Flux2KleinPipeline` (con `enable_model_cpu_offload()` o `pipe.to("cuda")`), el motor `CobaltEngine` del paquete `cobalt/` y su API HTTP. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión).
- Latencia: 512×512 en unos 56 s en CPU (4 hilos); la mejora de prompt añade unos 33 s por imagen en CPU de 4 hilos. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| COBALT Image 0.1 | ~3,88B | no disponible | Apache 2.0 | Hugging Face (diffusers) | Pesos de FLUX.2 klein 4B sin modificar; añade motor, API y evaluación |
| FLUX.2 [klein] 4B (Black Forest Labs) | ~4B | no disponible | Apache 2.0 (según la card de COBALT) | Hugging Face | Modelo base original; misma calidad de imagen |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables |

La única comparación documentada es con el propio modelo base, del que COBALT Image hereda exactamente la calidad de imagen. No se dispone de datos de rendimiento frente a otros generadores texto-a-imagen.

## Limitaciones y advertencias

- Hereda todos los fallos del modelo base: manos y anatomía fina, conteo exacto de objetos, texto largo o pequeño y relaciones espaciales complejas pueden fallar.
- Los prompts deben estar en inglés; el modelo solo declara soporte para `en`.
- Las salidas pueden reflejar sesgos de los datos de entrenamiento del modelo base, que COBALT AI no seleccionó ni puede auditar.
- El repositorio no aplica filtro de seguridad ni marca de agua; el despliegue debe añadir su propio filtrado de entrada y salida.
- No hay pipeline nativo para 2K/4K ni para inpainting (la model card se interrumpe en ese punto; no se documenta más).
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y del cumplimiento legal en su jurisdicción.
- Uso fuera de alcance prohibido por el autor: contenido sexual con menores, imágenes íntimas no consentidas, contenido ilícito, difamatorio, acosador o que incite a la violencia, suplantación de personas reales, desinformación e infracción de derechos de autor, marca o publicidad.
- La evaluación publicada es una prueba de humo de 8 imágenes; no debe interpretarse como un benchmark comparativo.
- COBALT AI no está afiliada ni respaldada por Black Forest Labs.

## Enlaces

- Hugging Face: https://huggingface.co/burkiuzeai/cobalt-image
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio del proyecto (referenciado en la model card como origen de `eval/run_eval.py`): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponible
