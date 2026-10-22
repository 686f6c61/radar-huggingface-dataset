# MATLOWAI/MOSS-Image-SFT-DeBand-int8

## Resumen

MOSS-Image-SFT-DeBand-int8 es una redistribución cuantizada a int8 del modelo de difusión text-to-image MOSS-Image, publicada por el usuario MATLOWAI. No se trata de un modelo entrenado desde cero, sino de un *merge* de pesos: parte del fichero int8 oficial de `OpenMOSS-Team/MOSS-Image-SFT` (distribuido por Comfy-Org) y sustituye un conjunto de capas por las equivalentes del modelo base `OpenMOSS-Team/MOSS-Image-Base`, que no presenta el artefacto de bandas verticales de color ("banding") característico de la versión SFT. El resultado se distribuye como ficheros `safetensors` autónomos de 5,4 GB, cargables con el nodo estándar *Load Diffusion Model* de ComfyUI, sin LoRAs ni nodos personalizados.

El problema que resuelve es muy concreto: el banding vertical en degradados amplios (cielos, niebla, fondos lisos) del modelo SFT. El autor publica tres variantes con distinto compromiso entre fidelidad al SFT original y agresividad de la corrección: DeBand (capas 37-41 del Base, la más próxima al SFT), DeBand+ (capas 32-41, para imágenes de 1536 px o más) y DeBand Fast (DeBand con la LoRA DMD de 8 pasos de lodestones integrada al 0,35, para muestrear en 10 pasos). La relevancia práctica es que elimina el artefacto sin exigir pasos extra ni cambiar el *workflow*, y que la comparación cuantitativa publicada (SSIM frente a bf16) sitúa DeBand y DeBand+ al nivel de fidelidad del int8 oficial de Comfy-Org.

El modelo hereda la licencia Apache 2.0 del repositorio, tiene 4.237 descargas y 12 *likes* en el momento de la consulta, y requiere descargar por separado el codificador de texto (`qwen3.5_9b_int8_convrot.safetensors`) y el VAE (`flux2-vae.safetensors`) del repositorio `Comfy-Org/MOSS-Image`. No se dispone de información sobre el número de parámetros, la arquitectura interna del backbone ni los datos de entrenamiento originales de MOSS-Image.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (familia MOSS-Image); el backbone concreto no se detalla en la información disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (modelo de imagen); el prompt lo procesa el codificador de texto Qwen3.5-9B incluido en `Comfy-Org/MOSS-Image` |
| Tipos de cuantización | int8 por canal con ConvRot 256 (mismo formato que los ficheros `int8_convrot` de Comfy-Org); no se distribuyen pesos bf16 en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería `diffusion-single-file`) |
| Tamaño por fichero | 5,4 GB (cada una de las tres variantes) |
| Tamaño del repositorio | 16,2 GB |
| Variantes incluidas | `moss_image_sft_deband_int8_convrot`, `moss_image_sft_deband_plus_int8_convrot`, `moss_image_sft_deband_fast_dmd035_int8_convrot` |
| Pasos de muestreo recomendados | 25 (DeBand y DeBand+); 10 (DeBand Fast) |
| Ajustes de referencia | sampler ER-SDE, CFG 3, Temporal Score Rescaling, skip-layer guidance en capas 22 y 24 |
| Dependencias externas | text encoder `qwen3.5_9b_int8_convrot.safetensors` y VAE `flux2-vae.safetensors` |
| Modelos base | `OpenMOSS-Team/MOSS-Image-SFT` y `OpenMOSS-Team/MOSS-Image-Base` (relación: merge) |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es un *merge* de pesos entre dos ficheros int8 ya existentes. Para DeBand y DeBand+ se toma el int8 SFT de Comfy-Org y se copian las capas 37-41 (DeBand) o 32-41 (DeBand+) desde el int8 Base de Comfy-Org. No hay recuantización: cada tensor procede directamente de los ficheros originales, lo que evita introducir un error de cuantización adicional. El equivalente en pesos completos es la LoRA de corrección de banding publicada en `MATLOWAI/MOSS-Image-SFT-DeBand`.

DeBand Fast sigue otra ruta: parte del SFT en bf16, le inyecta las capas 37-41 del Base y le aplica la LoRA DMD de 8 pasos de lodestones (`lora_latest`) con intensidad 0,35; después cuantiza el conjunto al mismo formato int8 por canal con ConvRot 256. El autor afirma que esta receta reproduce el fichero int8 SFT de Comfy-Org dentro de un margen muy estrecho, aunque la descripción exacta queda truncada en la model card disponible. No se documentan ni la arquitectura interna de MOSS-Image, ni el volumen de tokens de entrenamiento, ni si hubo RLHF/DPO: esa información corresponde a los repositorios de OpenMOSS-Team, no a este.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en el pipeline de ComfyUI, con el nodo estándar *Load Diffusion Model*.
- Mitigación del banding vertical de color en degradados amplios, verificada mediante análisis de color con brillo eliminado y saturación ×5.
- Comportamiento correcto en resoluciones anchas: DeBand+ se mantiene limpio a 1536 y 2048 px de ancho, según las pruebas del autor.
- Muestreo rápido en 10 pasos con DeBand Fast, gracias a la LoRA DMD integrada.
- Compatibilidad directa con *workflows* de MOSS-Image ya existentes: basta sustituir el modelo y fijar los pasos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües en el prompt; la model card no las documenta.
- No dispone de modo *thinking*, ni de entrada de audio o vídeo, ni de edición de imagen (solo text-to-image).

## Casos de uso

- **Generación de cielos y fondos amplios para producción audiovisual**: el banding aparece justo en degradados grandes; DeBand+ mantiene limpio el resultado a 1536 y 2048 px de ancho, lo que lo hace adecuado para *matte painting* y fondos de escena que luego se recortan o se mueven en composición.
- **Sustitución directa en pipelines ComfyUI ya montados**: al cargarse con el nodo estándar y no necesitar LoRAs ni nodos personalizados, se puede cambiar el fichero en un *workflow* existente y mantener sampler, CFG y skip-layer guidance, reduciendo el coste de migración a cero.
- **Iteración rápida de conceptos con DeBand Fast**: 10 pasos frente a 25 permiten cuadruplicar aproximadamente el número de iteraciones por unidad de tiempo en fases de exploración visual, aceptando una SSIM media del 68 % frente al bf16 Fast a cambio de la misma corrección de banding.
- **Fotografía sintética de paisaje y atmósfera**: los ejemplos publicados (bosque con niebla, cielo de fiordo) cubren escenas con niebla y gradientes suaves, donde el artefacto original era más visible; útil para *stock* fotográfico y previsualización.
- **Bodegón y render de producto**: el ejemplo de la botella de perfume con cristal y el bodegón al óleo muestran uso en *packaging* y composición publicitaria, donde los fondos lisos son habituales y el banding resultaba especialmente penalizador.
- **Despliegue en hardware de gama alta de consumo**: con 5,4 GB por fichero en int8, el modelo de difusión cabe en GPU de 24 GB junto al codificador de texto, lo que permite prototipado local sin depender de instancias en la nube.
- **Evaluación comparativa de cuantizaciones**: el repositorio incluye la metodología y las métricas de similitud frente a bf16, lo que lo convierte en un caso de estudio útil para equipos que valoran si el int8 es aceptable en su cadena de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible: no aplican a un modelo de difusión. El autor sí publica una evaluación cuantitativa propia del artefacto de banding y de la fidelidad frente a bf16. Cada celda es **puntuación de banding · SSIM frente al mismo ajuste en bf16**; en la escala de banding, aproximadamente 1,0 equivale a limpio.

| Modelo | Fog forest | Fjord sky | Goose | Oil still life | Perfume bottle | Media |
|---|---|---|---|---|---|---|
| SFT int8 (sin corrección) | 2,48 · 95 % | 2,38 · 98 % | 2,19 · 83 % | 2,07 · 93 % | 1,34 · 98 % | 2,09 · 93 % |
| DeBand | 1,15 · 93 % | 1,64 · 99 % | 1,29 · 73 % | 1,44 · 93 % | 1,28 · 98 % | 1,36 · 91 % |
| DeBand+ | 1,04 · 97 % | 0,94 · 99 % | 1,22 · 76 % | 1,35 · 98 % | 1,20 · 96 % | 1,15 · 93 % |
| DeBand Fast | 1,22 · 69 % | 1,39 · 84 % | 1,21 · 40 % | 1,07 · 68 % | 1,12 · 81 % | 1,20 · 68 % |

Datos adicionales declarados por el autor:

- Las puntuaciones de banding de DeBand y DeBand+ coinciden con las de los presets bf16 equivalentes (1,39 y 1,09 de media respectivamente).
- DeBand y DeBand+ se acercan a bf16 en un grado comparable al del int8 SFT de Comfy-Org (93 % de SSIM media en ambos casos).
- DeBand Fast se aleja más del bf16 Fast (68 % de SSIM media) porque a 10 pasos pequeñas diferencias de pesos desplazan el detalle; la corrección de banding se mantiene.
- En imágenes anchas, DeBand+ sigue limpio a 1536 y 2048 px, mientras que DeBand sin el sufijo "+" aún muestra bandas onduladas tenues en el cielo.

## Requisitos de hardware

- **VRAM estimada (estimación propia a partir de los tamaños de fichero, no publicada por el autor)**: 5,4 GB para el modelo de difusión en int8; el codificador de texto Qwen3.5-9B en int8 no declara tamaño en la información disponible, pero por su número de parámetros se situaría en el entorno de 9-11 GB; el VAE añade unos pocos cientos de MB. Total en torno a 15-17 GB de pesos, más activaciones.
- **GPU recomendadas**: 24 GB (RTX 4090, L4, A10G) para mantener modelo y codificador de texto cargados simultáneamente; 16 GB (RTX 4080, A4000) requiere descarga secuencial del codificador de texto, algo que ComfyUI gestiona de forma nativa.
- **¿Cabe en GPU de consumo?**: sí. El fichero de difusión de 5,4 GB es manejable en tarjetas de 12-16 GB si se acepta *offloading* del text encoder a RAM del sistema.
- **Opciones de despliegue**: ComfyUI con el nodo *Load Diffusion Model* estándar y el *workflow* `workflows/moss_deband_int8.json` incluido en el repositorio. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo. Los presets Turbo de 4-8 pasos requieren los nodos personalizados `rapid-moss` y no se pueden fusionar en un único fichero.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, DeBand y DeBand+ usan 25 pasos por imagen y DeBand Fast 10 pasos, con el mismo sampler y CFG.

## Comparativa con modelos similares

La información disponible solo permite comparar entre las variantes de esta misma familia. No se han encontrado datos de modelos de otras familias (FLUX, Qwen-Image u otros) en el material proporcionado.

| Modelo | Formato | Pasos | Corrección de banding | SSIM vs bf16 equivalente | Licencia | Nodos necesarios |
|---|---|---|---|---|---|---|
| DeBand (este repo) | int8 ConvRot 256, 5,4 GB | 25 | Sí, capas 37-41 | 91 % | Apache 2.0 | Estándar |
| DeBand+ (este repo) | int8 ConvRot 256, 5,4 GB | 25 | Sí, capas 32-41; robusto a 2048 px | 93 % | Apache 2.0 | Estándar |
| DeBand Fast (este repo) | int8 ConvRot 256, 5,4 GB | 10 | Sí, capas 37-41 + DMD 0,35 | 68 % | Apache 2.0 | Estándar |
| `Comfy-Org/MOSS-Image` int8 SFT | int8 ConvRot 256 | 25 | No (banding medio 2,09) | 93 % | no disponible en la información proporcionada | Estándar |
| `OpenMOSS-Team/MOSS-Image-SFT` bf16 | bf16 | 25 | No | referencia | no disponible en la información proporcionada | Estándar |

## Limitaciones y advertencias

- **Banding residual en imágenes anchas**: la variante DeBand sin "+" sigue mostrando bandas onduladas tenues en cielos a 1536 px y más; para esos casos hay que usar DeBand+.
- **Deriva de detalle en DeBand Fast**: la SSIM media del 68 % frente al bf16 Fast implica que detalles finos cambian como si se usara una semilla cercana. No es adecuado si se necesita reproducibilidad exacta respecto a un render bf16 previo.
- **Pérdida por cuantización**: el propio int8 limita la similitud al 91-93 % frente a bf16 en el mejor de los casos; en la imagen "Goose" DeBand cae al 73 % de SSIM.
- **Presets Turbo no incluidos**: los modos de 4-8 pasos requieren los nodos personalizados `rapid-moss` y solo funcionan cerca de 1 MP; por encima de esa resolución tuestean. No están disponibles en estos ficheros.
- **Dependencias externas obligatorias**: sin el text encoder `qwen3.5_9b_int8_convrot.safetensors` y el VAE `flux2-vae.safetensors` de `Comfy-Org/MOSS-Image`, los ficheros no son utilizables.
- **Sesgos**: no se ha publicado ningún análisis de sesgos, composición del dataset ni cobertura demográfica o cultural en la información disponible.
- **Alucinación y fidelidad al prompt**: no hay evaluación publicada de adherencia al prompt ni de tasa de fallo en anatomía, texto en imagen o composiciones complejas.
- **Idioma del prompt**: no se documenta qué idiomas acepta el codificador de texto ni si el modelo fue entrenado con prompts en castellano.
- **Licencia**: el repositorio declara Apache 2.0, pero la licencia de los modelos base de OpenMOSS-Team y de la LoRA DMD de lodestones no se detalla en la información proporcionada; conviene verificarlas antes de un uso comercial.
- **Documentación truncada**: la descripción del proceso de creación de DeBand Fast queda cortada en la model card, y no se especifican los parámetros totales ni la arquitectura interna.
- **Resultados de búsqueda web no relevantes**: las consultas realizadas no devolvieron papers, blogs ni repositorios relacionados con MOSS-Image, por lo que no hay validación externa de las métricas del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand-int8
- Repositorio principal con LoRAs, resultados completos y explicación: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand
- Fichero DeBand: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand-int8/resolve/main/moss_image_sft_deband_int8_convrot.safetensors
- Fichero DeBand+: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand-int8/resolve/main/moss_image_sft_deband_plus_int8_convrot.safetensors
- Fichero DeBand Fast: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand-int8/resolve/main/moss_image_sft_deband_fast_dmd035_int8_convrot.safetensors
- Workflow de ComfyUI: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand-int8/blob/main/workflows/moss_deband_int8.json
- Modelo base SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Codificador de texto y VAE: https://huggingface.co/Comfy-Org/MOSS-Image
- Text encoder: https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/text_encoders/qwen3.5_9b_int8_convrot.safetensors
- VAE: https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/vae/flux2-vae.safetensors
- LoRA DMD de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Presets Turbo con nodos `rapid-moss`: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand#moss_banding_fix_presets_rapid_mossjson-adds-the-turbo-presets
