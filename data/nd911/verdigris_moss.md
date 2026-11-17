# ND911/Verdigris_MOSS

## Resumen

Verdigris MOSS es un modelo de generación de imágenes texto-a-imagen publicado por el usuario ND911 en Hugging Face. No se trata de un entrenamiento desde cero, sino de un *merge* iterativo construido a partir de la familia MOSS-Image: su ancestro principal es Kromoss (un fine-tune completo de MOSS-Image-Base, desarrollado por OpenMOSS), al que se han ido incorporando LoRAs de la comunidad y variantes destiladas (DMD) a lo largo de meses de iteraciones. El resultado es un artefacto curado, orientado a personajes y fantasía, con un flujo de muestreo de tan solo 8 pasos.

El modelo hereda la arquitectura MOSS-Image: un DiT de 42 capas, un codificador de texto Qwen3.5-9B y el VAE completo de FLUX.2. Se distribuye en dos formatos: bf16 de referencia (10,2 GB) e int8 W8A8 con rotación Hadamard ConvRot (5,4 GB), lo que reduce a la mitad el espacio en disco y la VRAM necesaria. La versión V2 añade mejoras medibles en detalle facial (varianza de bordes en la región facial de 609 a 742, +22 %) y tipografía más consistente.

Su relevancia radica en ser un *drop-in replacement* para checkpoints MOSS-Image en ComfyUI, con licencia Apache 2.0 y un workflow de referencia incluido. No obstante, el autor advierte explícitamente de que la ascendencia exacta no es reconstruible y de que el modelo solo se ha validado dentro del workflow proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de 42 capas (MOSS-Image) con codificador de texto Qwen3.5-9B y VAE FLUX.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia) e int8 W8A8 ConvRot con grupos Hadamard de 256 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 e int8); workflow JSON para ComfyUI |

## Arquitectura y entrenamiento

Verdigris MOSS no parte de un entrenamiento propio: es un *merge* de pesos. Su linaje arranca en MOSS-Image-Base (OpenMOSS), pasa por el fine-tune completo Kromoss (lodestones) y se ha ido mezclando con LoRAs de la comunidad y variantes destiladas DMD en distintas etapas durante meses. El autor reconoce que algunos archivos intermedios ya no existen y que la cadena no es totalmente reconstruible, por lo que debe tratarse como un artefacto curado y no como una receta reproducible.

La arquitectura subyacente es un transformer de difusión (DiT) de 42 capas con atención propia del ecosistema MOSS, un text encoder Qwen3.5-9B y el VAE completo de FLUX.2. La cuantización int8 aplica una rotación Hadamard regular por grupo de entrada de ancho 256 y escalas por fila a las 168 capas lineales de los bloques (`proj.{qkv,o,ffn_up_gate,ffn_down}`), manteniendo el resto en bf16; el autor reporta un coseno por capa peor de 0,999952 (`layers.41.proj.o`) y 42 entradas `comfy_attention.config` para activar la ruta de atención int8 de ComfyUI. No se documentan volúmenes de tokens de entrenamiento ni etapas de RLHF/DPO, dado que no hubo entrenamiento desde cero.

## Capacidades

- Generación de imágenes texto-a-imagen con pipeline `text-to-image`.
- Especialización en personajes y fantasía, con microdetalle facial (poros, pecas, líneas finas) preservado a escala 1:1 en la versión V2.
- Tipografía integrada en la imagen con mejor kerning y línea base más estable en V2.
- Muestreo rápido: flujo de 8 pasos con programaciones sigma manuales y Skip Layer Guidance en la capa 22 (24 en el refinador).
- Flujo de refinamiento en varias pasadas: generación MOSS, retoque opcional con fibo2 a bajo denoise, refinamiento MOSS y postprocesado con RTX VSR y DLSS5.
- Integración nativa con ComfyUI mediante workflow de referencia.
- Soporte de cuantización int8 con ruta de atención específica para ComfyUI.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.

## Casos de uso

- Ilustración de personajes para fantasía: el modelo está ajustado hacia rostros y figuras, y la V2 conserva microdetalle facial a resolución nativa, lo que lo hace adecuado para retratos y concept art de personajes.
- Creación de arte conceptual con tipografía integrada: la mejora de kerning y línea base en V2 permite generar carteles, portadas o rótulos dentro de la propia imagen sin postprocesado tipográfico.
- Prototipado rápido en ComfyUI: con 8 pasos y el workflow de referencia, se pueden iterar variaciones de una misma semilla en cuestión de segundos, útil para exploración de direcciones visuales.
- Despliegue en GPUs de gama consumer: la variante int8 de 5,4 GB reduce a la mitad VRAM y disco respecto a bf16, lo que facilita su uso en equipos con menos memoria.
- Producción de assets para videojuegos o cómics: el flujo por pasadas (generación, retoque, refinamiento, upscaling con RTX VSR y DLSS5) permite obtener imágenes de mayor resolución partiendo de una base de ~2 MP.
- Integración en pipelines de postprocesado: el workflow incluye etapas opcionales con fibo2 y modelos de profundidad MoGe-3, lo que permite encadenar el modelo con otras herramientas dentro de ComfyUI.
- Experimentación con cuantización: sirve como caso de estudio de cuantización int8 W8A8 con rotación Hadamard en un DiT de difusión, con métricas de fidelidad reportadas por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible. El autor sí reporta métricas internas comparando la compilación anterior con V2, a misma semilla, prompt y workflow:

| Metrica | Compilacion anterior | V2 |
|---|---:|---:|
| Varianza de bordes en region facial | 609 | 742 (+22%) |
| Contraste de fotograma completo (std) | 67,6 | 69,5 |
| Tipografia | trazos finos y uniformes | tinta mas pesada, mejor kerning |

Además, se reporta un coseno por capa peor de 0,999952 en la cuantización int8 y una divergencia bf16-vs-int8 a misma semilla de aproximadamente un 4 % más de energía de alta frecuencia en el fotograma int8.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el archivo bf16 pesa 10,2 GB y el int8 5,4 GB, por lo que la VRAM necesaria será al menos del orden del tamaño del checkpoint más el text encoder Qwen3.5-9B y el VAE FLUX.2.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: la variante int8 de 5,4 GB está pensada para reducir requisitos, pero el autor no especifica modelos concretos de GPU.
- Despliegue: ComfyUI con soporte MOSS-Image nativo (master/nightly). Requiere el text encoder Qwen3.5-9B en `models/text_encoders/` (tipo CLIP `moss_image`) y el VAE completo FLUX.2 en `models/vae/`.
- El workflow de referencia menciona además `fibo2_dev_int8_convrot.safetensors`, un text encoder Qwen3-VL-4B, el VAE `flux2_full_encoder_small_decoder.safetensors`, el modelo de profundidad MoGe-3 y los node packs DLSS5 y RTX VSR, aunque solo son necesarios para las etapas opcionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Verdigris MOSS | no disponible (DiT 42 capas) | no disponible | apache-2.0 | Hugging Face, ComfyUI | Merge curado de la familia MOSS-Image, orientado a personajes y fantasía |
| MOSS-Image-Base (OpenMOSS) | no disponible | no disponible | no disponible | Hugging Face | Modelo base original de la familia |
| Kromoss (lodestones) | no disponible | no disponible | no disponible | Hugging Face | Fine-tune completo de MOSS-Image-Base, ancestro principal de Verdigris |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El linaje del merge no es totalmente reconstruible: algunos archivos intermedios ya no existen y el autor no reclama reproducibilidad de los pesos exactos.
- Validación limitada: el modelo solo se ha validado dentro del workflow de referencia en ComfyUI, con el text encoder MOSS y el VAE FLUX.2 completos. Otros ajustes no están documentados.
- Los valores de pasos, CFG y sigma están ajustados conjuntamente con las capas de guía y no se transfieren a un sampler Euler/SGM estándar.
- La cuantización int8 introduce divergencia respecto a bf16 (aproximadamente un 4 % más de energía de alta frecuencia), por lo que se recomienda usar bf16 ante resultados inesperados.
- Idiomas: solo inglés (`en`), lo que limita prompts en castellano u otras lenguas.
- Riesgo de sesgos y alucinación visual: no documentado por el autor; al ser un merge de LoRAs de la comunidad, puede heredar sesgos estilísticos o de representación de sus componentes.
- Licencia Apache 2.0 permite uso comercial, pero al ser un merge de pesos con linajes no completamente trazables conviene revisar las licencias de los ancestros (MOSS-Image-Base, Kromoss) antes de un despliegue comercial.
- El repositorio es de 31,6 GB, lo que implica un coste de almacenamiento considerable si se descargan todas las variantes.
- Popularidad muy baja (11 descargas, 1 like en el momento de la consulta), lo que reduce la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ND911/Verdigris_MOSS
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Ancestro principal Kromoss: https://huggingface.co/lodestones/Kromoss
