# K-Ai-Official/K-Oss-8-Mini-Instruct-Beta

## Resumen

K-Oss 8 Mini Instruct es un adaptador LoRA de tipo QLoRA para el modelo vision-lenguaje Qwen3-VL-8B-Instruct, desarrollado por K-Ai (Kortex AI). Se presenta como el miembro compacto de la familia K-Oss 8, orientado a asistentes multimodales (texto e imagen) en ingles, indonesio y japones. El repositorio contiene unicamente los pesos del adaptador (0,2 GB), por lo que requiere descargar y cargar el modelo base para funcionar.

El modelo base Qwen3-VL-8B-Instruct aporta la arquitectura transformer multimodal subyacente, con 8.810.770.672 parametros segun el registro de entrenamiento. El adaptador entrena 43.646.976 parametros (0,50 % del total) sobre los modulos de atencion y MLP del modelo de lenguaje, manteniendo congelado el torre de vision.

Es relevante ahora como ejemplo de flujo de trabajo reproducible de ajuste fino multimodal de bajo coste: el entrenamiento completo se ejecuto en una GPU T4 de 16 GB en Google Colab. No obstante, debe interpretarse estrictamente como una prueba de concepto (smoke test) de 5 pasos sobre 36 ejemplos, no como un modelo listo para produccion. La model card advierte explicitamente de que no comparte pesos ni destilacion con el modelo grande K-Oss 8 (120B totales, 12B activos, basado en NVIDIA Nemotron 3.5 Super VL).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA 4-bit) sobre transformer vision-lenguaje Qwen3-VL-8B-Instruct |
| Parametros totales | 8.810.770.672 (modelo base); adaptador: 43.646.976 entrenables (0,50 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso 1536 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit (bitsandbytes) para entrenamiento; el adaptador se puede combinar con el base en fp16/bf16 o cuantizado |
| Idiomas soportados | en, id, ja (objetivo, no evaluado con benchmarks) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors |
| Rank / alpha LoRA | r=16, alpha=16, dropout 0.0, bias none |
| Precision de entrenamiento | fp16 |
| Hardware de entrenamiento | NVIDIA T4 (16 GB), pico ~8,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa texto e imagenes y genera texto. El ajuste fino empleo QLoRA con pesos base en 4 bits mediante bitsandbytes a traves de Unsloth, con entrenamiento supervisado (TRL `SFTTrainer` y el collator de vision de Unsloth). Los modulos LoRA se insertaron en atencion y MLP del modelo de lenguaje, mientras que el torre de vision permanecio congelado para preservar las capacidades visuales del base y ahorrar memoria. Se activo gradient checkpointing de Unsloth.

Los hiperparametros fueron: batch efectivo 8 (batch 1 x acumulacion 8), learning rate 2e-4 con schedule lineal, 5 pasos de warmup, weight decay 0.01, optimizador AdamW de 8 bits, 5 pasos totales, longitud maxima de secuencia 1536 tokens, imagenes redimensionadas a un maximo de 672 px en el lado largo y semilla 3407. El entrenamiento duro unos 25 segundos en una T4 y la perdida paso de 4,79 (paso 1) a 3,74 (paso 5), valores que el propio autor califica de no indicativos de calidad. Los datos consisten en 36 ejemplos: 24 sinteticos generados por script (OCR de codigos cortos, aritmetica simple mostrada en imagen y conteo de circulos de colores) y 12 ejemplos de identidad escritos a mano para que el modelo se presente como modelo de K-Ai, todos en indonesio, ingles y japones. La configuracion exacta esta en `training_config.json`.

## Capacidades

- Generacion de texto e interpretacion de imagenes (image-text-to-text) heredadas del base Qwen3-VL-8B-Instruct.
- Respuesta conversacional con plantilla de chat multimodal (mensajes con bloques de imagen y texto).
- Identidad ajustada: se presenta como modelo de K-Ai en ingles, indonesio y japones.
- Tareas visuales basicas ensenadas en el conjunto sintetico: OCR de codigos cortos, lectura de operaciones aritmeticas en imagen y conteo de objetos simples.
- Capacidades multilingues limitadas a los tres idiomas objetivo (en, id, ja); el resto de idiomas depende del base y no esta garantizado.
- Tool calling, function calling, modo thinking y razonamiento multi-paso: no documentados para este adaptador; pueden existir en el base pero no se han validado tras el ajuste.

## Casos de uso

- Prototipado de asistentes visuales multilingues: cargar el adaptador sobre Qwen3-VL-8B-Instruct para experimentar con respuestas en indonesio y japones sobre imagenes en entornos de investigacion.
- Evaluacion de pipelines QLoRA multimodales: usar la configuracion incluida (`training_config.json`) como plantilla reproducible para ajustar modelos vision-lenguaje en GPUs de 16 GB.
- Pruebas de identidad de marca: verificar como un ajuste de 12 ejemplos modifica la autopresentacion del modelo y medir el olvido catastrofico resultante.
- Demostraciones de OCR ligero: reconocimiento de codigos cortos en capturas o etiquetas, util como prueba de concepto en herramientas internas.
- Educacion y formacion: ejemplo didactico de adaptadores PEFT con Unsloth y Transformers para quienes aprenden ajuste fino multimodal.
- Investigacion sobre datos sinteticos: analizar el efecto de 24 ejemplos generados por script en tareas visuales elementales (aritmetica en imagen, conteo de formas).
- No recomendado para atencion al cliente, generacion de codigo en produccion ni agentes autonomos: no hay evidencia de rendimiento que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de entrenamiento (4,79 a 3,74 en 5 pasos), que el propio autor descarta como indicador de calidad.

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade ~0,2 GB; el consumo dominante es el del base Qwen3-VL-8B-Instruct. En fp16/bf16 se estiman aproximadamente 17-18 GB (8,8B parametros x 2 bytes mas overhead de activaciones y vision); en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar con contexto largo; L40S o RTX 6000 Ada como alternativas profesionales.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el base en fp16 con contexto moderado; tarjetas de 8-12 GB (RTX 3060/4060 Ti) requieren cuantizacion de 4 bits.
- Entrenamiento: verificado en una T4 de 16 GB con QLoRA 4-bit y pico de ~8,4 GB (batch 1, imagenes de hasta 672 px).
- Despliegue: Transformers + PEFT (ruta oficial documentada), Unsloth (`FastVisionModel`), y previsiblemente vLLM o TGI para el base con el adaptador fusionado; llama.cpp/Ollama solo si se genera una version GGUF del base fusionado, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| K-Oss 8 Mini Instruct | 8,8B base + 43,6M adaptador | no disponible | Texto + imagen | Apache-2.0 | Beta, adaptador LoRA, sin benchmarks |
| Qwen3-VL-8B-Instruct (base) | 8,8B | no disponible | Texto + imagen | Apache-2.0 | Modelo oficial de Alibaba, con evaluaciones publicadas |
| K-Oss 8 (familia) | 120B totales, 12B activos (MoE) | no disponible | Vision-lenguaje | segun NVIDIA Nemotron 3.5 Super VL | Modelo separado, no relacionado por pesos |
| Alternativas de 7-9B multimodales (p. ej. Llama 3.2 Vision 11B, Qwen2.5-VL-7B) | 7-11B | no disponible | Texto + imagen | licencias variables | Comparacion no realizada en la informacion disponible |

## Limitaciones y advertencias

- Entrenamiento de solo 5 pasos sobre 36 ejemplos: es un smoke test, no un ajuste funcional; no debe esperarse mejora medible sobre el base.
- Los datos sinteticos (24 ejemplos) existen para probar el pipeline, no como corpus representativo; el autor lo indica explicitamente.
- Idiomas objetivo (indonesio y japones) sin evaluacion: la calidad real en esos idiomas es desconocida.
- Riesgo de olvido catastrofico y de degradacion de capacidades del base por el ajuste de identidad.
- Riesgo de alucinacion: inherente al base y no mitigado; el adaptador no incluye datos de alineacion adicionales.
- Sesgos: no documentados; los datos sinteticos y de identidad no permiten caracterizar sesgos.
- Licencia Apache-2.0, que permite uso comercial, pero la idoneidad tecnica para produccion no esta respaldada por ninguna evaluacion.
- Requiere cargar el modelo base Qwen3-VL-8B-Instruct; el repositorio por si solo no es ejecutable.
- No debe confundirse con K-Oss 8 (120B, MoE, basado en Nemotron): no comparte pesos ni destilacion.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/K-Ai-Official/K-Oss-8-Mini-Instruct-Beta
- Repositorio alternativo citado en la model card: https://huggingface.co/Keanualfahd/K-Oss-8-Mini-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Organizacion K-Ai: https://huggingface.co/K-Ai-Official
- Perfil del desarrollador: https://huggingface.co/Keanualfahd
