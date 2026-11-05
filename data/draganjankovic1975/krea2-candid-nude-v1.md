# draganjankovic1975/Krea2-Candid-Nude-v1

## Resumen

Krea2-Candid-Nude-v1 es un modelo de difusión texto-a-imagen derivado de Krea 2 Turbo, publicado por el usuario draganjankovic1975 en HuggingFace. Se trata de un merge del modelo base Krea 2 Turbo con un LoRA propio entrenado sobre aproximadamente 2.500 imágenes curadas (generadas por IA y fotografías de aficionado usadas con permiso), con una fuerza de 0,8. El objetivo declarado es reproducir una estética de fotografía amateur realista, con luz natural, textura de piel auténtica (poros, lunares, pequeñas imperfecciones) y cuerpos de proporciones naturales, orientada a contenido NSFW para adultos y también a imágenes vestidas de moda o catálogo.

El modelo tiene 12.820.073.036 parámetros según los pesos en safetensors y se distribuye en cuatro formatos (bf16, fp8, GGUF Q8_0 y GGUF Q5_1) pensados para distintos niveles de VRAM. Está empaquetado para ComfyUI y requiere el text encoder Qwen3-VL 4B y el VAE `qwen_image_vae` del ecosistema Krea 2. La licencia es la Krea 2 Community License, con restricciones de uso comercial y políticas de uso adicionales.

Es relevante ahora porque ejemplifica el patrón de fine-tuning comunitario sobre modelos base de difusión de última generación: un LoRA ligero sobre un modelo Turbo de pocos pasos permite especializar el estilo sin reentrenar el modelo completo, y la publicación en múltiples cuantizaciones (incluido GGUF) democratiza su ejecución en GPUs de consumo. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados y con advertencias de contenido para adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (derivado de Krea 2 Turbo); detalles internos no disponibles |
| Parametros totales | 12.820.073.036 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | bf16, fp8, GGUF Q8_0, GGUF Q5_1 |
| Idiomas soportados | No disponible (prompts en lenguaje natural; el autor no especifica idiomas) |
| Licencia | Krea 2 Community License (krea-2-community-license) |
| Formato de pesos | safetensors (bf16, fp8) y GGUF (Q8_0, Q5_1) |

## Arquitectura y entrenamiento

El modelo es un derivado de Krea 2 Turbo, un modelo de difusión texto-a-imagen. La model card no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, número de bloques), por lo que esa información no está disponible. Lo que sí se documenta es el proceso de especialización: un merge del modelo base Krea 2 Turbo con un LoRA propio a fuerza 0,8, entrenado sobre aproximadamente 2.500 imágenes curadas que combinan generaciones por IA y fotografías amateur usadas con permiso. El autor afirma que el dataset no contiene personas reales, celebridades ni individuos identificables.

La innovación práctica del modelo no está en la arquitectura sino en el pipeline de inferencia: al heredar la naturaleza Turbo del base, funciona con 8 pasos, CFG 1, sampler `euler` y scheduler `simple`, sin necesidad de prompt negativo. Esto reduce el coste computacional por imagen de forma notable frente a modelos de difusión estándar de 20-50 pasos. No se documentan datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en el mismo sentido que en LLMs).

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas con estética de fotografía amateur (aspecto de foto de móvil).
- Reproducción de textura de piel realista: poros, lunares y pequeñas imperfecciones.
- Control de proporciones corporales mediante prompt (tamaño de pecho pequeño, medio o grande; grande solo si se solicita).
- Generación de contenido NSFW para adultos (desnudos y escenas eróticas) y también de imágenes vestidas, moda y catálogo.
- Control de encuadre: la instrucción `face not visible, cropped at the neck` produce tomas solo de cuerpo.
- Control de iluminación mediante prompt (por ejemplo, `bright natural daylight` para un aspecto más luminoso).
- No desviste a los sujetos salvo que el prompt lo solicite explícitamente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio (no aplica a un modelo de difusión texto-a-imagen).

## Casos de uso

- Generación de fotografía amateur realista para proyectos creativos: el modelo está afinado para producir imágenes con aspecto de foto de móvil y luz natural, adecuado para moodboards y referencias visuales de estilo documental.
- Contenido editorial de moda y catálogo: aunque el foco es NSFW, el autor indica que también funciona para imágenes vestidas, por lo que puede emplearse en pruebas de concepto de estilismo y composición.
- Prototipado rápido de personajes y cuerpos: con 8 pasos y CFG 1, permite iterar decenas de variaciones en pocos minutos en una GPU de 16-24 GB usando la versión fp8.
- Estudio de textura y materialidad: la ênfasis en poros, lunares e imperfecciones lo hace útil para analizar cómo los modelos de difusión reproducen microdetalle de piel en primeros planos.
- Flujos de trabajo en ComfyUI: se integra como nodo de difusión con el text encoder Qwen3-VL 4B y el VAE `qwen_image_vae`, encajando en pipelines nodales existentes de generación de imagen.
- Ejecución en hardware de consumo: las versiones GGUF Q8_0 (~14 GB) y Q5_1 (~10 GB) permiten desplegarlo en Mac y GPUs con poca VRAM mediante el fork ComfyUI-GGUF y el nodo Unet Loader (GGUF).
- Investigación sobre fine-tuning con LoRA: sirve como caso de estudio de cómo un LoRA a fuerza 0,8 sobre un modelo Turbo especializa el estilo sin reentrenar el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~25 GB para bf16 (calidad completa), ~12 GB para fp8 (GPUs de 16-24 GB), ~14 GB para GGUF Q8_0 (calidad casi bf16, Mac o VRAM baja), ~10 GB para GGUF Q5_1 (VRAM baja).
- GPU recomendadas: no especificadas por el autor; por tamaño de pesos, una GPU de 24 GB o más para bf16, y GPUs de 16-24 GB para fp8. Para GGUF, cualquier GPU con 10-14 GB de VRAM libre o Apple Silicon.
- ¿Cabe en GPU de consumo? Sí, en las versiones fp8 y GGUF; la bf16 requiere ~25 GB y queda fuera de la mayoría de GPUs de consumo.
- Opciones de despliegue: ComfyUI (librería declarada), con el fork molbal/ComfyUI-GGUF y el nodo Unet Loader (GGUF) para los ficheros GGUF. No se documentan otros runners (vLLM, llama.cpp, TGI, Ollama) para este modelo.
- Latencia y throughput: no disponibles. El autor recomienda 8 pasos con sampler `euler` y scheduler `simple`, lo que reduce el coste por imagen frente a configuraciones de más pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Krea2-Candid-Nude-v1 | 12.820.073.036 | 8 pasos (Turbo), CFG 1 | Krea 2 Community License | HuggingFace, 4 formatos (bf16, fp8, GGUF Q8_0, Q5_1) |
| Krea 2 Turbo (base) | No disponible | Turbo (pocos pasos) | Krea 2 Community License | Modelo base oficial de Krea |
| Alternativas de difusión texto-a-imagen de tamaño comparable | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado `not-for-all-audiences` y genera NSFW; debe restringirse a usuarios mayores de edad.
- Uso ético: el autor prohíbe explícitamente crear imágenes de personas reales sin su consentimiento y cualquier contenido que involucre a menores.
- Licencia restrictiva: la Krea 2 Community License impone condiciones de uso comercial y una política de uso adicional (Krea 2 Use Policy); es un modelo modificado no oficial de Krea, por lo que no cuenta con el respaldo del proveedor original.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, artefactos en manos y rostros, o texturas inconsistentes, especialmente en configuraciones de baja cuantización (Q5_1).
- Sesgos: el dataset de entrenamiento (~2.500 imágenes curadas por el autor) puede introducir sesgos de estilo, composición corporal e iluminación; no se documenta diversidad demográfica del dataset.
- Idiomas: no se especifican idiomas soportados para los prompts; el autor redacta las recomendaciones en inglés, por lo que el rendimiento con prompts en castellano no está verificado.
- Madurez: cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni validación externa; adecuado para experimentación, no para producción crítica sin evaluación propia.
- Dependencias: requiere el text encoder Qwen3-VL 4B y el VAE `qwen_image_vae`, además del fork ComfyUI-GGUF para los ficheros GGUF; no es un paquete autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/draganjankovic1975/Krea2-Candid-Nude-v1
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Fork ComfyUI-GGUF (soporte Krea 2): https://github.com/molbal/ComfyUI-GGUF
