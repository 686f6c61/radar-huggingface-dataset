# AcademiaSD/Ming-Image-NF4-for-LoRA-Training

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversión a NF4 de **Ming-Image-0.1-Design**, el modelo de texto a imagen de inclusionAI especializado en diseño gráfico con texto (carteles, interfaces, infografías) y salida RGBA con fondo transparente. La conversión la mantiene el usuario **AcademiaSD** para que su entrenador **AcademiaSD LoRAlab Trainer Studio** pueda descargar los pesos y entrenar LoRAs en GPUs NVIDIA de consumo; no es una publicación oficial de inclusionAI.

El paquete reduce el peso de 52,9 GB a 16,2 GB combinando tres estrategias: el codificador de prompts (un MoE de la familia BailingMM2 con su torre de visión) se guarda en NF4 con doble cuantización de bitsandbytes, el transformer de difusión de 6B se guarda como caché pre-cuantizada capa a capa (238 capas lineales en NF4, 38 tensores en BF16) y el resto de módulos (conector, proyecciones, VAE, scheduler) se mantienen en los formatos originales.

Es relevante ahora porque permite ajustar LoRAs de un modelo de imagen de gama alta en hardware de consumo: el DiT cuantizado carga en unos 3,4 GB de VRAM y el pico del codificador de prompts durante el pre-caché de condiciones ronda los 11,6 GB. La contrapartida es que no es un checkpoint de inferencia: diffusers y ComfyUI no lo cargan directamente y el propio autor recomienda usar los pesos originales para generar imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) de 30 bloques + codificador de prompts MoE BailingMM2 con torre de visión + conector de 6 capas sobre 256 tokens de consulta aprendidos + VAE RGBA de 16 canales (`AutoencoderKLQwenImage`) |
| Parametros totales | No disponible (el DiT se describe como "6B"; el repositorio ocupa 16,2 GB frente a 52,9 GB del original) |
| Parametros activos | No disponible (el codificador de prompts es MoE, pero no se indica el número de parámetros activos) |
| Longitud de contexto | No disponible (el conector condensa la condición en 256 tokens de consulta aprendidos) |
| Tipos de cuantizacion | NF4 con doble cuantización de bitsandbytes (MLLM y 238 capas del DiT); BF16 (conector, embedders, adaLN, cap embedder, final layer, normas); FP32 (`proj_in`, `proj_out`, `proj_directvlm`, `query_tokens_dict`) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT (copyright 2026 inclusionAI) |
| Formato de pesos | `safetensors`, pero en formato propio: el MLLM es un checkpoint `transformers` con `quantization_config` NF4; el transformer es una caché pre-cuantizada (un `.safetensors` por capa en `weights/`, más `others.safetensors`, `index.json` y `metadata.json`), no un checkpoint diffusers estándar |

## Arquitectura y entrenamiento

El modelo subyacente es un pipeline de texto a imagen en dos etapas. Primero, un codificador de prompts multimodal de tipo MoE (BailingMM2, con torre de visión y tokenizador) procesa el texto y produce condiciones; un conector de 6 capas refina 256 tokens de consulta aprendidos y varias proyecciones (`proj_in`, `proj_out`, `proj_directvlm`, con un `query_tokens_dict` de 16×16) adaptan la salida al espacio del difusor. Después, un transformer de difusión de 30 bloques (6B) genera los latentes que decodifica un VAE de 16 canales con soporte RGBA, usando un scheduler FlowMatchEuler. El pipeline se entrena a 1024×1024 y 2048×2048; 512 y 768 quedan fuera de distribución.

Sobre el entrenamiento original no se proporcionan datos en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO o de ajuste por preferencias). Lo que sí se documenta es el proceso de conversión de este repositorio: el MLLM se cuantiza a NF4 con doble cuantización, el conector pasa de FP32 a BF16, el DiT se pre-cuantiza capa a capa dejando en BF16 los embedders, la modulación adaLN, el cap embedder, la final layer y las normas, y el VAE, el scheduler, el tokenizador y las proyecciones pequeñas se conservan intactos. El script que genera el paquete es `scripts/convert_nf4_mingimage.py` del repositorio del entrenador. Según el autor, la carga del MLLM pre-cuantizado en GPU produce embeddings de prompt idénticos bit a bit a los del original en BF16, y la similitud coseno entre la velocidad predicha por el DiT NF4 y la del DiT BF16 es de 0,974 sobre las mismas entradas.

## Capacidades

- Generación de imágenes de texto a imagen orientadas a diseño gráfico con texto denso: carteles, interfaces, infografías y composiciones gráficas.
- Salida RGBA con canal alfa, es decir, fondos transparentes.
- Entrada de prompt en inglés y chino a través del codificador BailingMM2, que incluye torre de visión (usada en el pre-caché de condiciones, no durante el entrenamiento de la LoRA).
- Entrenamiento de LoRAs sobre el DiT en formato PEFT/diffusers (prefijo `transformer.`, pesos `lora_A`/`lora_B` y `alpha` por capa), con soporte adicional de LoKr.
- Flujo de entrenamiento con una imagen y un pie de foto por muestra, con formato de caption JSON estilo Figma (`canvas_settings` y `layers`) y palabra de activación en `canvas_settings.image_style`.
- Auto-captioning delegado a un Qwen3-VL-8B externo que no forma parte del repositorio.
- No soporta en esta versión descomposición por capas ni LoRAs de edición; solo la variante Design (texto a imagen).

## Casos de uso

- Entrenamiento de LoRAs de estilo gráfico en GPU de consumo: el DiT en NF4 ocupa unos 3,4 GB de VRAM, de modo que un artista puede ajustar un estilo propio de carteles o plantillas sobre una única RTX 5080 sin recurrir a la nube.
- Creación de LoRAs de marca para plantillas corporativas: se entrena con pares imagen-caption en el formato JSON estilo Figma que espera el entrenador, de forma que el modelo aprenda paletas, retículas y tipografías recurrentes de la organización.
- Prototipado de sistemas de diseño con fondo transparente: al trabajar sobre un modelo con salida RGBA, las LoRAs resultantes sirven para generar recursos con alfa para flujos de composición posteriores.
- Investigación sobre cuantización aplicada a difusión: la métrica publicada (similitud coseno de 0,974 en la velocidad predicha frente al BF16) permite estudiar el impacto de NF4 en el ajuste fino sin necesidad de los 52,9 GB del checkpoint original.
- Ajuste fino en estaciones de trabajo modestas o entornos con cuota de VRAM: el pico de 11,6 GB del MLLM durante el pre-caché se produce una sola vez, y el entrenamiento posterior solo mantiene el DiT cuantizado.
- Docencia y reproducibilidad: al ser un paquete autocontenido que el entrenador descarga en el primer uso, se puede distribuir un taller de entrenamiento de LoRAs sin pedir a los alumnos que gestionen pesos de 50 GB.
- Evaluación de calidad de LoRAs exportadas: al exportarse en formato PEFT/diffusers con prefijo `transformer.`, los adaptadores se pueden cargar en cualquier loader que soporte el DiT de Ming-Image para comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas aportadas por el autor son de fidelidad de la cuantización y de coste de entrenamiento:

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno de la velocidad predicha (NF4 vs BF16) | 0,974 | Mismas entradas, DiT cuantizado frente a DiT BF16 |
| VRAM del DiT NF4 | ~3,4 GB | Carga del transformer pre-cuantizado |
| Pico de VRAM del MLLM | ~11,6 GB | Durante el pre-caché de condiciones |
| Tiempo por paso de entrenamiento | ~3,5 s | RTX 5080, rango 8, 768×768 |
| VRAM en entrenamiento | ~3,4 GB (DiT) | RTX 5080, rango 8, 768×768 |
| Fidelidad de los embeddings de prompt | Idénticos bit a bit al BF16 | Carga del MLLM NF4 en GPU |

## Requisitos de hardware

- VRAM para el DiT en entrenamiento: aproximadamente 3,4 GB con NF4, según medición del autor.
- VRAM para el pre-caché de condiciones: pico de aproximadamente 11,6 GB con el MLLM en NF4; conviene disponer de 16 GB o más para operar con margen (estimación a partir del pico medido).
- GPU validadas: RTX 5080 (medición de 3,5 s por paso, rango 8, 768×768). Para el pre-caché, tarjetas de 16 GB o más de VRAM; no se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, siempre que se cumpla el requisito de VRAM del codificador de prompts; el DiT por sí solo es muy ligero (3,4 GB).
- Despliegue: exclusivamente a través de AcademiaSD LoRAlab Trainer Studio. No es compatible con diffusers ni ComfyUI para inferencia, y no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este pipeline).
- Almacenamiento: 16,2 GB de repositorio, frente a 52,9 GB del original en BF16/FP32.
- Throughput y latencia de inferencia: no disponibles (el paquete no está pensado para inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato y tamano | Licencia | Uso previsto |
|---|---|---|---|---|---|
| AcademiaSD/Ming-Image-NF4-for-LoRA-Training | DiT de 6B + MLLM MoE (totales no disponibles) | 1024×1024 y 2048×2048; 256 tokens de consulta | NF4/BF16/FP32 en safetensors; 16,2 GB | MIT | Entrenamiento de LoRAs |
| inclusionAI/Ming-Image-0.1-Design | DiT de 6B + MLLM MoE (totales no disponibles) | 1024×1024 y 2048×2048 | BF16/FP32 en safetensors; 52,9 GB | MIT | Inferencia y entrenamiento de referencia |
| Otros modelos de texto a imagen de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de otros modelos comparables (FLUX, Stable Diffusion 3, Qwen-Image u otros), por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de inferencia: el transformer se guarda como caché pre-cuantizada capa a capa y diffusers y ComfyUI no lo cargan directamente. Para generar imágenes hay que usar los pesos originales de inclusionAI.
- Dependencia total del entrenador: el paquete está empaquetado para AcademiaSD LoRAlab Trainer Studio, que reconstruye el DiT desde `config.json` y rellena los pesos desde la caché; otros frameworks no pueden consumirlo tal cual.
- Solo LoRA (y LoKr) sobre el DiT: el MLLM, el conector y las proyecciones están congelados, y el entrenamiento reutiliza los latentes y condiciones generados en el pre-caché.
- Solo variante Design (texto a imagen): no hay soporte de descomposición por capas ni de LoRAs de edición en esta versión.
- No existe adaptador turbo ni destilado para Ming-Image según la model card.
- Resoluciones admitidas: 1024×1024 y 2048×2048. Los entrenamientos a 512 y 768 están fuera de distribución; la medición de 3,5 s por paso se hizo a 768×768, así que ese dato de rendimiento corresponde a una configuración no recomendada para calidad.
- Pérdida de fidelidad por cuantización: la similitud coseno de 0,974 en la velocidad predicha implica una desviación no nula respecto al BF16, que puede acumularse en entrenamientos largos o con rangos altos de LoRA.
- Idiomas: solo inglés y chino; no se documenta soporte de castellano en el codificador de prompts.
- Riesgo de alucinación: la información disponible no incluye evaluaciones de fidelidad tipográfica ni de error en el texto renderizado, así que no se puede acotar el riesgo de texto malformado en las imágenes generadas.
- Licencia MIT, pero la autoría y el copyright del modelo subyacente son de inclusionAI; este repositorio es una conversión no oficial distribuida "tal cual", sin garantías.
- Sesgos: no se documenta ninguna evaluación de sesgos del modelo original ni de esta conversión.
- No se han publicado resultados de benchmarks de calidad de imagen en la información disponible; las cifras del autor son de rendimiento y fidelidad de cuantización, no de calidad generativa.
- La búsqueda web asociada a esta ficha no devolvió resultados relevantes (solo páginas de spam sin relación con el modelo), por lo que no hay fuentes externas que verificar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AcademiaSD/Ming-Image-NF4-for-LoRA-Training
- Modelo original: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design
- Repositorio GitHub del modelo original: https://github.com/inclusionAI/Ming-Image
- Entrenador AcademiaSD LoRAlab Trainer Studio: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- Script de conversión: `scripts/convert_nf4_mingimage.py` (dentro del repositorio del entrenador)
- YouTube del autor: https://www.youtube.com/@Academia_SD
- Discord del autor: https://discord.gg/Syuaduy678
- Ko-Fi del autor: https://ko-fi.com/academiasd
