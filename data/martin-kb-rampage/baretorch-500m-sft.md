# martin-kb-rampage/BareTorch-500M-SFT

## Resumen

BareTorch-500M-SFT es un modelo de lenguaje de 593 millones de parámetros desarrollado por Martin Kovacevic (martin-kb-rampage) como parte del ecosistema BareTorch, una plataforma de despliegue de LLMs en entornos edge. Se trata de un checkpoint de fine-tuning por instrucciones (SFT) del modelo base BareTorch-500M-Base, que emplea una arquitectura híbrida subcuadrática denominada CS-LRAD (Cross-Scale Linear Recurrent Attention Decoder) combinada con capas Transformer. El modelo está ajustado para diálogo multi-turno utilizando formato ChatML y está orientado a inferencia eficiente en dispositivos con recursos limitados, como Apple Silicon, Qualcomm y NPUs ARM.

La relevancia de este modelo radica en su propuesta de eficiencia: según los datos publicados, alcanza una velocidad de decodificación de 164.5 tokens por segundo en NVIDIA CUDA con contexto de 32.768 tokens, consumiendo solo 1.660 MB de VRAM, lo que supone una mejora de 12.51x frente a Qwen3-0.6B en el mismo escenario. En Apple M1 con MLX/FP16, logra 27.7 tokens por segundo con 3.778 MB, siendo 16.87x más rápido que SmolLM2-1.7B. Sin embargo, los resultados de calidad en benchmarks estándar son modestos, con un MMLU de 25.57%, lo que indica que está pensado para tareas de generación de texto simples y despliegue en entornos con restricciones de hardware, no para razonamiento complejo.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y está disponible en Hugging Face. Aunque el repositorio tiene cero descargas y cero likes, la documentación técnica y los enlaces a la plataforma comercial sugieren que forma parte de un proyecto más amplio de despliegue de LLMs en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida CS-LRAD + Transformer (subcuadrática, kernel-free) |
| Parametros totales | 593.051.328 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32.768 tokens (según benchmarks publicados) |
| Tipos de cuantizacion | BF16, FP16 (mencionados en ejemplos; no se indica lista completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura híbrida que combina un mecanismo de atención recurrente lineal a escala cruzada (CS-LRAD) con capas Transformer. Según la documentación del proyecto BareTorch, esta arquitectura es subcuadrática y opera bajo un paradigma "kernel-free", es decir, sin kernels personalizados, lo que facilita su despliegue en plataformas heterogéneas como NPUs de Apple, Qualcomm y ARM. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) sobre el modelo base BareTorch-500M-Base, utilizando datos de diálogo multi-turno formateados con ChatML. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto en inglés, con soporte para instrucciones y diálogo multi-turno mediante formato ChatML.
- Inferencia eficiente en dispositivos edge gracias a su arquitectura subcuadrática y bajo consumo de memoria (1.660 MB en CUDA BF16 con contexto de 32.768 tokens).
- Compatibilidad con el ecosistema Hugging Face Transformers mediante la clase `BareTorchForCausalLM` y `AutoTokenizer`.
- No se mencionan capacidades de tool calling, function calling, agentes, visión, audio ni modos de razonamiento especiales. El modelo es exclusivamente de texto.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 32.768 tokens) y su bajo consumo de VRAM permite ejecutarlo en smartphones o tablets con aceleración NPU, ofreciendo respuestas en tiempo real sin conexión a la nube.
- Generación de texto en entornos con restricciones de hardware: por su tamaño reducido y eficiencia, es adecuado para sistemas embebidos, routers inteligentes o dispositivos IoT que necesiten generar respuestas cortas o completar texto de forma local.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con licencia Apache 2.0, los desarrolladores pueden integrarlo en entornos de desarrollo sin necesidad de GPUs de alta gama, usando frameworks como Transformers o el runtime BareTorch.
- Clasificación y etiquetado de texto: aunque no está específicamente entrenado para ello, su capacidad de generación puede adaptarse para tareas de clasificación mediante prompts, aprovechando su bajo coste de inferencia.
- Educación y demostraciones: sirve como ejemplo de arquitectura subcuadrática y fine-tuning por instrucciones, útil para cursos o talleres sobre eficiencia en LLMs.
- Despliegue en navegadores web: según la documentación del proyecto, BareTorch tiene compatibilidad con WebGPU, lo que permitiría ejecutar el modelo en el navegador para aplicaciones de generación de texto client-side.

## Benchmarks y rendimiento

La model card publica los siguientes resultados en benchmarks zero-shot:

| Benchmark | Métrica | Score |
|---|---|---|
| MMLU (promedio 57 materias) | Accuracy | 25.57% |
| ARC Challenge | Acc (Norm) | 35.41% |
| ARC Easy | Acc (Norm) | 59.18% |
| HellaSwag | Acc (Norm) | 52.52% |
| Winogrande | Accuracy | 55.80% |

Además, se reportan métricas de velocidad y memoria en decodificación con contexto de 32.768 tokens:

| Plataforma | Precisión | Velocidad de decodificación | Huella VRAM | Speedup vs. modelo de referencia |
|---|---|---|---|---|
| NVIDIA CUDA | BF16 | 164.5 tok/s | 1.660 MB | 12.51x vs. Qwen3-0.6B |
| Apple M1 (MLX) | FP16 | 27.7 tok/s | 3.778 MB | 16.87x vs. SmolLM2-1.7B |

No se han publicado resultados comparativos con otros modelos en tareas de razonamiento o generación de código.

## Requisitos de hardware

- VRAM estimada: 1.660 MB en CUDA BF16 con contexto de 32.768 tokens; 3.778 MB en Apple M1 con MLX/FP16. Esto indica que cabe en GPUs consumer con 4 GB o más, como una NVIDIA GTX 1650 o RTX 3050.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; también funciona en Apple Silicon (M1 o superior) mediante MLX.
- En dispositivos edge, puede ejecutarse en NPUs de Qualcomm, ARM y Apple gracias al runtime BareTorch, aunque no se especifican requisitos concretos de memoria para esos entornos.
- Opciones de despliegue: el ejemplo oficial usa `BareTorchForCausalLM` con Transformers y PyTorch. También se menciona el runtime comercial de Model Rampage para despliegue edge. No se indica compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: los datos publicados indican 164.5 tok/s en CUDA y 27.7 tok/s en Apple M1, lo que sugiere latencias de alrededor de 6 ms por token en CUDA y 36 ms por token en M1, aunque estos valores dependen del hardware exacto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa con otros modelos de tamaño similar. Los únicos datos comparativos provienen de las pruebas de velocidad, donde BareTorch-500M-SFT supera a Qwen3-0.6B y SmolLM2-1.7B en velocidad de decodificación, pero no se han publicado resultados de calidad en tareas de lenguaje para esos modelos en la misma configuración. Por tanto, la comparativa se limita a:

| Modelo | Parámetros | Contexto | Velocidad (CUDA BF16) | VRAM | Licencia |
|---|---|---|---|---|---|
| BareTorch-500M-SFT | 593M | 32.768 | 164.5 tok/s | 1.660 MB | Apache 2.0 |
| Qwen3-0.6B | ~600M (estimado) | no disponible | no disponible | no disponible | Apache 2.0 (probable) |
| SmolLM2-1.7B | 1.7B | no disponible | no disponible | no disponible | Apache 2.0 (probable) |

No se dispone de datos de benchmarks de calidad para estos modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en tareas de razonamiento complejo: el MMLU de 25.57% está muy por debajo de modelos de tamaño similar entrenados con más datos, lo que indica que no es adecuado para aplicaciones que requieran conocimiento general o razonamiento avanzado.
- Riesgo de alucinación: al ser un modelo pequeño y con entrenamiento limitado, es probable que genere respuestas inventadas o incorrectas, especialmente en dominios especializados.
- Solo soporta inglés: no se menciona capacidad multilingüe, por lo que su uso en otros idiomas no está garantizado.
- Dependencia del ecosistema BareTorch: el ejemplo de uso requiere la librería `baretorch`, que no es estándar en Hugging Face; esto puede limitar la portabilidad a otros frameworks.
- Sin datos sobre sesgos: no se han publicado evaluaciones de sesgos de género, raza o religión, por lo que se desconoce su comportamiento en estos aspectos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no se garantiza soporte ni estabilidad en producción.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/martin-kb-rampage/BareTorch-500M-SFT
- Página del proyecto BareTorch: https://www.model-rampage.com/
- Repositorio GitHub de BareTorch: https://github.com/martin-kbcc/baretorch
- Repositorio de experimentos: https://github.com/martin-kbcc/baretorch-experiments
- Perfil del autor en Hugging Face: https://huggingface.co/martin-kb-rampage
- Organización Model Rampage en Hugging Face: https://huggingface.co/model-rampage
