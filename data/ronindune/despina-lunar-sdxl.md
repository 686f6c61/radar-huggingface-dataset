# RonInDune/despina-lunar-sdxl

## Resumen

DESPINA lunar SDXL weights es un conjunto de pesos derivados de Stable Diffusion XL 1.0 diseñados para una tarea muy específica: convertir un modelo digital de elevación (DEM) lunar en fotografías sintéticas realistas de la superficie de la Luna. Lo desarrolla un equipo de la Universidad de Houston (Adam Nelson-Archer, Raunak Sarbajna y Christoph F. Eick) y se asocia al artículo "DESPINA: Synthesis of High-Fidelity Planetary Horizon Reconstructions Using DEM-Guided Diffusion", publicado en ISPRS Annals of the Photogrammetry, Remote Sensing and Spatial Information Sciences (vol. XI-2-2026, pp. 881-890).

El sistema no es un modelo generativo de propósito general, sino un pipeline de difusión condicionada por geometría: el DEM se proyecta mediante ray casting en un mapa de profundidad inversa y en una vista sombreada; de esta última se extraen bordes suaves con PiDiNet, y ambas condiciones alimentan dos ControlNets que guían a SDXL. Una LoRA entrenada con fotografía Hasselblad del programa Apolo aporta la apariencia lunar (cielo negro, regolito, iluminación solar rasante).

Es relevante ahora porque aborda un problema clásico de las ciencias planetarias: la escasez de imágenes reales para validar algoritmos de navegación, reconstrucción de horizonte y estimación de pose en misiones lunares. El repositorio ocupa 10,1 GB y contiene tres subcarpetas de pesos (LoRA, ControlNet de profundidad y ControlNet de bordes suaves), todos entrenados sobre 1.277 fotogramas del dataset `RonInDune/despina-apollo-surface`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL (UNet + VAE + doble text encoder) con dos ControlNets y una LoRA sobre la UNet |
| Parametros totales | no disponible (repo de 10,1 GB; el grueso corresponde a los pesos de SDXL base y los dos ControlNets) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; prompts de texto, sin ventana de contexto de tokens declarada) |
| Tipos de cuantizacion | no se declaran cuantizaciones oficiales; los pesos se entrenaron y probaron en fp32. fp16/bf16 "debería funcionar" según el autor, pero no se ha verificado |
| Idiomas soportados | no disponible (los prompts se escriben en inglés en los ejemplos; no se declara cobertura multilingüe) |
| Licencia | `despina-weights` (licencia propia, tipo "other"); hereda restricciones de CreativeML Open RAIL++-M (LoRA y ControlNet de profundidad) y CreativeML Open RAIL-M (ControlNet de bordes suaves), además de las restricciones de las imágenes de entrenamiento (escaneos del film Apolo de ASU, solo para investigación) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El sistema se compone de tres módulos entrenados de forma independiente, todos durante 3.000 pasos y a resolución de 1024 px, partiendo de checkpoints públicos:

- **LoRA lunar** (rango 16) sobre la UNet de `stabilityai/stable-diffusion-xl-base-1.0`, con LR 1e-4, scheduler coseno y offset noise 0.1. El offset noise es imprescindible para que el modelo renderice el cielo negro lunar; sin él, el modelo ajustado grisea el cielo o encuadra la imagen para evitarlo.
- **ControlNet de profundidad** (DPT inverse depth), inicializado desde `diffusers/controlnet-depth-sdxl-1.0`, con LR 1e-5, AdamW de 8 bits y sin offset noise.
- **ControlNet de bordes suaves** (PiDiNet), inicializado desde `SargeZT/controlnet-sd-xl-1.0-softedge-dexined`, con LR 1e-5, AdamW de 8 bits y sin offset noise.

Los ControlNets se entrenan sin offset noise porque añadirlo también a ellos sobreexpone las imágenes. Todo el entrenamiento se hizo en fp32 con diffusers 0.31.0 sobre los 1.277 fotogramas de entrenamiento del dataset `RonInDune/despina-apollo-surface`. La innovación técnica no está en la arquitectura (es SDXL estándar) sino en el acondicionamiento geométrico: el ray caster del DEM produce el mapa de profundidad inversa (cercano = brillante) y la vista sombreada, y los bordes PiDiNet de esa vista sombreada actúan como segunda condición. En inferencia se usan simultáneamente ambas condiciones con pesos 0,8 (profundidad) y 0,5 (bordes), LoRA a escala 0,9, 30 pasos y guidance 7,0.

## Capacidades

- Generación text-to-image de vistas de la superficie lunar condicionadas por geometría real de un DEM.
- Reconstrucción del horizonte: la silueta generada sigue el perfil del DEM de entrada (RMSE medio de 0,94 px a 512 px en la evaluación del paper).
- Renderizado de cielo negro lunar correcto gracias al offset noise aplicado solo a la LoRA.
- Acondicionamiento dual simultáneo (profundidad inversa + bordes suaves) activo en todos los pasos de muestreo.
- Síntesis de datos para ciencia planetaria: generación de pares imagen/geometría para entrenar o validar modelos de visión.
- Control de cámara y geometría solar mediante el script del repositorio (posición en el DEM, heading, azimut y elevación solar).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es un modelo de difusión de imagen.

## Casos de uso

- **Generación de datasets sintéticos para navegación lunar**: el pipeline permite renderizar miles de vistas fotorrealistas desde un DEM con parámetros de cámara y sol variados, proporcionando pares imagen/pose con verdad fundamental exacta para entrenar estimadores de pose o de horizonte en rovers.
- **Validación de algoritmos de reconstrucción de horizonte**: como el sistema produce imágenes cuya línea del horizonte sigue el DEM, sirve para medir el error de algoritmos de detección de horizonte contra una referencia conocida (el paper reporta RMSE de 0,94 px).
- **Simulación visual de misiones**: generar imágenes plausibles de la superficie para documentación, divulgación o prototipado de interfaces de operadores de rover antes de disponer de imágenes reales de una zona de aterrizaje.
- **Aumento de datos para modelos de visión planetaria**: las imágenes sintéticas pueden complementar los escasos escaneos reales del Apolo para tareas de segmentación, detección de rocas o clasificación de terreno, siempre que se respeten las restricciones de licencia.
- **Estudio de condiciones de iluminación**: variando el azimut y la elevación solar en el script se pueden generar vistas con sombras rasantes o iluminación frontal para analizar cómo afectan al rendimiento de algoritmos de visión por computador.
- **Investigación en difusión condicionada por geometría**: el diseño (dos ControlNets con pesos distintos, offset noise solo en la LoRA) es un caso de estudio reproducible para quienes trabajen en condicionamiento físico de modelos generativos.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre ocho vistas del DEM de muestra de `UH-DAIS/DESPINA_technical_details`, con dos semillas cada una (16 imágenes):

| Metrica | Resultado |
|---|---|
| Horizon RMSE medio (a 512 px) | 0,94 px |
| Peor imagen (desviación del horizonte) | dentro de 1,4 px del horizonte del DEM |
| Cielo negro correcto | 16 de 16 imágenes |
| Comparación con otros modelos | no disponible (el repositorio menciona una tabla de ablación, pero no se incluye en la información proporcionada) |

No se han publicado en la información disponible resultados de benchmarks estándar de generación de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Como referencia, el pipeline completo carga SDXL base (UNet, VAE y dos text encoders) más dos ControlNets y una LoRA; en fp32 el conjunto supera con holgura los 24 GB, y en fp16/bf16 se sitúa típicamente en el rango de 16-24 GB, aunque el autor no ha verificado la inferencia en precisión reducida.
- **GPU recomendadas**: el ejemplo del autor usa dos GPU (`CUDA_VISIBLE_DEVICES=0,1` y `--devices cuda:0,cuda:1`), lo que sugiere que el flujo completo en fp32 se beneficia de múltiples aceleradores (A100, H100 o similares). No se especifican modelos concretos.
- **Consumer GPU**: no confirmado. En fp16 podría caber en una RTX 4090 (24 GB), pero no está verificado por el autor.
- **Opciones de despliegue**: diffusers (versión 0.31.0 usada en entrenamiento) con `StableDiffusionXLControlNetPipeline`; el repositorio oficial incluye `scripts/synthesize_view.py` y un `setup_env.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- **Latencia y throughput**: no disponibles. La configuración de referencia usa 30 pasos de inferencia con guidance 7,0.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DESPINA lunar SDXL | Difusión text-to-image condicionada por DEM | SDXL 1.0 | Dos ControlNets (profundidad + bordes) + LoRA | `despina-weights` con restricciones RAIL heredadas y datos solo para investigación | Hugging Face (repo de 10,1 GB) |
| stabilityai/stable-diffusion-xl-base-1.0 | Difusión text-to-image general | — | Sin condicionamiento geométrico | CreativeML Open RAIL++-M | Hugging Face |
| diffusers/controlnet-depth-sdxl-1.0 | ControlNet de profundidad para SDXL | SDXL | Profundidad (DPT) | CreativeML Open RAIL++-M | Hugging Face |
| SargeZT/controlnet-sd-xl-1.0-softedge-dexined | ControlNet de bordes para SDXL | SDXL | Bordes suaves (DexiNed) | CreativeML Open RAIL-M | Hugging Face |

No se dispone de comparaciones con otros sistemas de síntesis lunar por difusión en la información proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva y en cascada**: los pesos heredan las restricciones de CreativeML Open RAIL++-M y RAIL-M, y además las imágenes de entrenamiento son escaneos procesados del film Apolo de Arizona State University proporcionados solo para investigación. El uso comercial queda condicionado por estas tres capas; conviene revisar la sección de licencia del README antes de cualquier despliegue.
- **Dominio muy estrecho**: solo genera vistas de superficie lunar; no es un modelo general y no debe esperarse calidad fuera de ese dominio.
- **Sesgo de composición**: el suelo en primer plano sale más liso que en las fotografías reales del Apolo, y las vistas que miran a través de terreno plano hacia relieves funcionan mejor que otras configuraciones.
- **Precisión no verificada**: los pesos se entrenaron y probaron en fp32; la inferencia en fp16/bf16 no está comprobada y podría degradar el cielo negro o la fidelidad del horizonte.
- **Dependencia del pipeline externo**: el modelo no funciona de forma autónoma; requiere el ray caster y el preprocesado del repositorio `despina-implementation-update` para producir las condiciones de entrada.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede introducir detalles plausibles pero inexistentes en el terreno (rocas, irregularidades) que no correspondan al DEM; no debe usarse como evidencia geométrica sin validación.
- **Idiomas y prompts**: no se declara cobertura multilingüe; los ejemplos oficiales usan prompts en inglés.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en noviembre de 2026; no hay evidencia de uso comunitario ni mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/RonInDune/despina-lunar-sdxl
- Código e implementación: https://github.com/RaunakDune/despina-implementation-update
- Dataset de entrenamiento: https://huggingface.co/datasets/RonInDune/despina-apollo-surface
- Dataset (repo GitHub): https://github.com/UH-DAIS/DESPINA_dataset
- DEM de muestra y detalles técnicos: https://github.com/UH-DAIS/DESPINA_technical_details
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- ControlNet de profundidad de partida: https://huggingface.co/diffusers/controlnet-depth-sdxl-1.0
- ControlNet de bordes de partida: https://huggingface.co/SargeZT/controlnet-sd-xl-1.0-softedge-dexined
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Licencia del modelo: https://huggingface.co/RonInDune/despina-lunar-sdxl/blob/main/README.md#license
