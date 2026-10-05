# deeklaird/flux-2-klein-9b-unlocked-q5_k_m

## Resumen
FLUX.2 Klein 9B Unlocked es una cuantizacion en formato GGUF (Q5_K_M) del modelo de difusion text-to-image FLUX.2 Klein 9B, publicada por el usuario deeklaird en HuggingFace. Se distribuye como un unico checkpoint GGUF de aproximadamente 6,5 GB, esta marcada como "unlocked" (sin filtros de contenido en el prompt) e incluye una restauracion de anatomia pre-aplicada, ajustada para inferencia local rapida y de alta fidelidad.

El modelo aborda la generacion de imagenes a partir de texto en hardware de consumo: parte de un checkpoint de 9.078.591.248 parametros (unos 9,08 mil millones) y lo comprime a una cuantizacion de 5 bits que mantiene la calidad visual. Para funcionar necesita componentes externos que no van incluidos en el repo: un text encoder CLIP basado en Qwen3-8B abliterado, un VAE especifico (`flux2-vae.safetensors`) y, de forma opcional, LoRAs secundarias.

Es relevante para quienes quieren ejecutar localmente un modelo de la familia FLUX.2 sin depender de APIs en la nube y sin restricciones de contenido en el prompt, con el coste de un ecosistema de carga todavia limitado (ComfyUI con soporte GGUF), cero benchmark publicados y una unica resolucion de entrenamiento documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image de la familia FLUX.2) |
| Parametros totales | 9.078.591.248 (9,08 mil millones); el repo GGUF ocupa 6,5 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna ni sobre los datos de entrenamiento en la informacion proporcionada. Por las etiquetas y la model card se deduce que se trata de un pipeline de difusion latente text-to-image, que combina un text encoder (CLIP), un modelo de difusion (el propio FLUX.2 Klein 9B) y un VAE (`flux2-vae.safetensors`). Este repositorio no entrena un modelo nuevo: es una cuantizacion derivada, con una capa de "restauracion de anatomia" pre-aplicada y sin censura en el prompt.

Los unicos parametros de generacion documentados son: 8-10 pasos, CFG 1.0 (sin superar 1.2), muestreador `euler`, planificador `simple`, denoise 1.0 y resolucion 1024x1024 o relaciones de aspecto nativas de 1 MP. No se detalla si hubo RLHF, DPO ni el numero de tokens o imagenes de entrenamiento del modelo base.

## Capacidades
- Generacion de imagenes a partir de texto (text-to-image) con resolucion de 1024x1024 y relaciones de aspecto de 1 MP.
- Inferencia de pocos pasos (8-10) con CFG bajo (1.0), lo que reduce el tiempo por imagen.
- Fotorrealismo de alta fidelidad, con "restauracion de anatomia" pre-incrustada para mejorar figuras humanas.
- Modo "unlocked": sin filtrado de contenido en el prompt de texto.
- Soporte de LoRAs secundarias (fuerza recomendada 0.4-0.7), por ejemplo estilos como Realism Engine V2.
- Generacion de imagenes con doble referencia (2Ref2I), segun las notas de hardware de la model card.
- Prompt en ingles (unico idioma declarado).
- No hay evidencia de soporte de tool calling, agentes, vision de entrada ni audio: es un modelo puramente generativo de imagen.

## Casos de uso
- Ilustracion conceptual: generar bocetos y conceptos de personajes o escenarios a 1024x1024 en pocos pasos, util para iterar rapidamente en preproduccion de videojuegos o animacion.
- Diseno de producto y mockups: crear imagenes de producto fotorrealistas que sirvan como referencia visual antes de un render 3D definitivo.
- Marketing y redes sociales: producir banners, imagenes de anuncio y visuales de campana sin depender de bancos de imagenes, con resoluciones nativas de 1 MP.
- Assets para videojuegos: generar sprites, texturas base o arte conceptual que luego se retocan en herramientas de edicion.
- Arte digital sin restricciones tematicas: al estar "unlocked", permite explorar tematicas que otros modelos filtran, util para ilustracion madura o experimental.
- Prototipado de estilos mediante LoRAs: combinando LoRAs secundarias a fuerza 0.4-0.7 se pueden fijar estilos concretos para una linea grafica coherente.
- Generacion de referencias para artistas: crear imagenes de partida (pose, iluminacion, composicion) que el artista humano pule despues.
- Trabajos con doble referencia (2Ref2I): usar dos imagenes de referencia para componer o transferir caracteristicas, segun lo descrito en las notas de hardware.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Peso de los pesos del modelo: aproximadamente 6,5 GB (Q5_K_M en GGUF).
- Text encoder requerido: `Huihui-Qwen3-8B-abliterated-v2.i1-Q4_K_M.gguf`; al ser un modelo de 8.000 millones de parametros en Q4_K_M, suma varios gigabytes adicionales de VRAM (valor exacto no disponible).
- VAE requerido: `flux2-vae.safetensors` (tamano no disponible).
- La model card menciona configuraciones de 16 GB de VRAM para usuarios de AMD/ROCm; con el text encoder y el VAE cargados simultaneamente, 16 GB es el minimo practico documentado.
- GPU recomendadas: RTX 4080/4090 (16-24 GB) y equivalentes. Para GRAM mayores (A100, H100) no hay datos especificos en la informacion, pero cabe holgadamente.
- Cabe en GPU de consumo de gama alta (16 GB o mas). En GPUs de 12 GB o menos no esta documentado y probablemente requiera descargar el text encoder o reducir resolucion.
- Despliegue documentado: ComfyUI con el nodo [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF), cargando con `UnetLoaderGGUF` o `LoaderGGUF`. No se documentan vLLM, TGI ni Ollama (no son aplicables a un modelo de generacion de imagen).
- En AMD/ROCm (Windows/Linux) se recomienda el argumento de lanzamiento `--reserve-vram 5.0`.
- En generacion de doble referencia (2Ref2I) se recomienda no apilar LoRAs pesadas para evitar errores de memoria en configuraciones de 16 GB.
- Latencia y throughput concretos: no disponibles. Los 8-10 pasos sugeridos implican tiempos por imagen relativamente bajos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.2 Klein 9B Unlocked Q5_K_M (este) | 9,08 mil millones (Q5_K_M) | 1024x1024 / 1 MP | apache-2.0 | GGUF en HuggingFace |
| FLUX.2 Klein 9B (base) | 9,08 mil millones | no disponible | no disponible en la informacion | no disponible en la informacion |
| FLUX.1 [dev] | 12 mil millones | 1 MP aprox. | FLUX.1 [dev] Non-Commercial | pesos abiertos en HuggingFace |
| Stable Diffusion 3.5 Large | 8 mil millones | 1 MP | Stability AI Community License | pesos abiertos en HuggingFace |

Nota: los datos del modelo base FLUX.2 Klein 9B no aparecen en la informacion proporcionada. Las filas de FLUX.1 [dev] y Stable Diffusion 3.5 Large se incluyen como referencia de categoria y no provienen de la model card; conviene verificarlas en sus repositorios oficiales antes de tomar decisiones.

## Limitaciones y advertencias
- No hay benchmarks publicados, por lo que el rendimiento real frente a alternativas no esta cuantificado.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible, manos deformes o artefactos en composiciones complejas, pese a la "restauracion de anatomia" pre-aplicada.
- Solo soporta prompts en ingles; el uso en castellano u otros idiomas no esta garantizado.
- Al estar "unlocked" y sin filtros, puede generar contenido sensible, violento o para adultos; requiere moderacion propia si se expone a terceros.
- Dependencia de componentes externos no incluidos en el repo (text encoder Qwen3-8B abliterado y VAE de FLUX.2), lo que complica la reproducibilidad y la trazabilidad de licencias.
- Riesgo de OOM en configuraciones de 16 GB cuando se combinan doble referencia e LoRAs adicionales.
- El repo tiene 0 descargas y 0 likes, y una fecha de creacion posterior al momento de redaccion de esta ficha (2026-10-04), lo que indica que es una publicacion reciente y sin validacion de la comunidad.
- No se confirma el origen de los pesos base ni si la licencia apache-2.0 de esta cuantizacion es compatible con la del modelo original FLUX.2 Klein 9B; conviene verificarlo antes de uso comercial.

## Enlaces
- HuggingFace: https://huggingface.co/deeklaird/flux-2-klein-9b-unlocked-q5_k_m
- ComfyUI-GGUF (nodo requerido): https://github.com/city96/ComfyUI-GGUF
- Text encoder referenciado: `Huihui-Qwen3-8B-abliterated-v2.i1-Q4_K_M.gguf` (sin enlace directo en la informacion proporcionada)
- VAE referenciado: `flux2-vae.safetensors` (sin enlace directo en la informacion proporcionada)
- Documentacion, paper o demo oficial de FLUX.2 Klein 9B: no disponible en la informacion proporcionada
