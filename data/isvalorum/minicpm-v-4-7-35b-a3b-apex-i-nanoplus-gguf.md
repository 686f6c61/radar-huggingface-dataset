# IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

MiniCPM-V 4.7 35B-A3B APEX-I NanoPlus V2.1 GGUF es una cuantización comunitaria del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario IsValorum bajo licencia Apache 2.0. El modelo base, desarrollado por OpenBMB, es un transformer multimodal de tipo mixture-of-experts (MoE) con aproximadamente 34.660 millones de parámetros totales, diseñado para tareas de image-text-to-text, incluyendo comprensión de imágenes y vídeo. Esta versión concreta redistribuye los pesos en formato GGUF para su uso con llama.cpp.

La aportación de esta ficha es la cuantización: una asignación personalizada de tipos de cuantización por tensor (denominada APEX-I NanoPlus V2.1) que busca reducir el tamaño en disco y la huella de memoria manteniendo la fidelidad visual y la dinámica de los estados recurrentes tipo SSM/DeltaNet. El repositorio ocupa 39,0 GB e incluye un proyector multimodal auxiliar mmproj-Q8_0.gguf para la inferencia visual.

Es relevante ahora porque permite ejecutar un modelo multimodal MoE de ~35B en entornos de inferencia locales con llama.cpp, algo que con pesos en precisión completa sería inviable en hardware de consumo. La model card declara soporte para diez idiomas (en, zh, es, fr, de, pt, it, ru, ja, ko) y está etiquetada como "on-device".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE con componentes recurrentes tipo SSM/DeltaNet (según model card) |
| Parametros totales | 34.659.889.792 (~34,66 B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3 B activos, pero no se confirma en la información) |
| Longitud de contexto | no disponible (el ejemplo de CLI usa -c 4096, pero no es una especificación del modelo) |
| Tipos de cuantizacion | Mezcla por tensor: Q6_K, Q4_K, F32, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS; proyector multimodal en Q8_0 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) que incorpora estados recurrentes continuos tipo SSM (etiquetados como "DeltaNet" en la model card). La cuantización APEX-I NanoPlus V2.1 distribuye 733 tensores con tipos diferenciados: `output.weight` en Q6_K, `token_embd.weight` en Q4_K, los routers de expertos MoE (`ffn_gate_inp`) en F32, los expertos compartidos (`shexp`) en Q4_K y los estados continuos del SSM (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`) en F32, preservando así la precisión de las rutas críticas y de los estados recurrentes.

Las proyecciones internas se degradan de forma agresiva: down y gate/up de borde en Q3_K e IQ3_XXS, down de núcleo (capas 2-37) en IQ3_XXS, gate en IQ2_S, up protegido (capas 2-15) en IQ2_S y up compacto (capas 16-37) en IQ2_XXS. Incluye un proyector multimodal `mmproj-Q8_0.gguf` para inferencia visual. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto y comprensión de imágenes (pipeline image-text-to-text).
- Procesamiento de vídeo (etiqueta "video" en el repositorio).
- Razonamiento multimodal: descripción de imágenes, respuesta a preguntas visuales.
- Conversación multi-turno (etiqueta "conversational").
- Soporte multilingüe declarado para diez idiomas.
- Orientado a despliegue on-device mediante llama.cpp.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking explícito: no disponible en la información.

## Casos de uso

- Descripción y análisis de imágenes en local: usar `llama-minicpmv-cli` con el GGUF principal y `mmproj-Q8_0.gguf` para generar descripciones detalladas de fotografías sin enviar datos a la nube, aprovechando el formato GGUF y su naturaleza on-device.
- Asistencia visual para accesibilidad: convertir imágenes en descripciones textuales para lectores de pantalla en dispositivos con recursos limitados, gracias a la cuantización agresiva que reduce la huella de memoria.
- Análisis de vídeo en pipelines locales: procesar fotogramas o clips y generar resúmenes textuales, dado que el repositorio declara soporte de vídeo.
- Extracción de información de documentos escaneados: responder preguntas sobre capturas, facturas o formularios mediante el modo image-text-to-text, integrado en scripts de llama.cpp.
- Prototipado de aplicaciones multimodales en portátiles: desplegar el modelo con llama.cpp en equipos sin GPU de datacenter, aprovechando la mezcla de cuantizaciones de 2 a 6 bits.
- Evaluación comparativa de cuantizaciones: usar esta versión APEX-I NanoPlus como referencia para medir el impacto de la cuantización por tensor en la calidad de un MoE multimodal frente a pesos completos.
- Chat multimodal multilingüe: atender consultas con imágenes en inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés o coreano en entornos de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 39,0 GB, lo que incluye el GGUF principal y el proyector `mmproj-Q8_0.gguf`; el GGUF principal debe caber en RAM o VRAM junto con el proyector.
- VRAM/RAM estimada: no disponible de forma exacta; por el tamaño del repo, se requiere del orden de decenas de GB de memoria, muy por encima de GPUs de consumo de 8-12 GB.
- GPU recomendadas: no disponible en la información; por tamaño, orientado a GPUs profesionales (A100, H100) o a ejecución en CPU con suficiente RAM.
- ¿Cabe en GPU de consumo? No disponible con certeza; el tamaño del repositorio sugiere que no cabe en GPUs de consumo de gama media/baja.
- Opciones de despliegue: llama.cpp (CLI `llama-minicpmv-cli` según la model card); otras herramientas (vLLM, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B APEX-I NanoPlus (este) | ~34,66 B | no disponible | apache-2.0 | GGUF | Cuantización comunitaria por tensor |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | ~34,66 B | no disponible | apache-2.0 | safetensors (presumible) | Pesos sin cuantizar del mismo modelo |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información |

## Limitaciones y advertencias

- La cuantización agresiva (IQ2_XXS, IQ2_S, IQ3_XXS en proyecciones internas) puede degradar la calidad frente a los pesos originales; no hay benchmarks que cuantifiquen la pérdida.
- Es una cuantización comunitaria no oficial de OpenBMB; el soporte y la validación dependen del autor IsValorum.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la información.
- Longitud de contexto real no documentada; el ejemplo de CLI usa 4096 tokens, que no debe interpretarse como límite oficial.
- Idiomas declarados en las etiquetas, pero no se aportan evaluaciones por idioma; el rendimiento en español y otras lenguas distintas del inglés y el chino no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento.
- Requiere llama.cpp con soporte para MiniCPM-V y para el proyector multimodal; otras herramientas no están confirmadas.
- El rendimiento en producción (latencia, throughput, estabilidad) no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Apoyo al autor: https://ko-fi.com/isvalorum
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
