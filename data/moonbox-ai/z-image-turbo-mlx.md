# moonbox-ai/Z-Image-Turbo-MLX

## Resumen

Z-Image-Turbo-MLX es una conversión al framework MLX del modelo de difusión texto-a-imagen Z-Image-Turbo, desarrollado originalmente por Tongyi-MAI (Alibaba) y adaptado por moonbox-ai para su ejecución nativa en Apple Silicon. El repositorio distribuye los pesos convertidos a formato MLX (safetensors) en dos precisiones: bf16 y 8bit, junto con los componentes de texto, transformer y VAE necesarios para el pipeline. La relevancia de esta ficha radica en que permite ejecutar un modelo de generación de imágenes de última generación en hardware Mac sin depender de CUDA ni de GPUs dedicadas.

El modelo base, Z-Image-Turbo, es un modelo de difusión de tipo transformer (probablemente DiT o arquitectura similar, aunque la información disponible no detalla la arquitectura interna) orientado a la generación rápida de imágenes a partir de descripciones textuales. La conversión a MLX busca mantener la fidelidad respecto al original con un coste de cuantización controlado: la versión bf16 reporta una PSNR media de 22,1 dB y LPIPS de 0,118, mientras que la versión 8bit se marca como experimental y por debajo del umbral de calidad aceptable.

El repositorio ocupa 45,8 GB, lo que refleja el peso de los pesos en bf16 y 8bit. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte que solo se han convertido algunas partes del pipeline y que el resto debe obtenerse del repositorio original. No se dispone de información sobre el número de parámetros, la longitud de contexto textual ni los idiomas soportados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (detalles internos no disponibles); conversión MLX de Z-Image-Turbo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | bf16, 8bit (8bit marcada como experimental) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mflux_model.json, tokenizer.json, chat_template.jinja |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Z-Image-Turbo. Se trata de un modelo de difusión para generación de imágenes, y la conversión a MLX incluye tres componentes principales: un text encoder (cuatro shards en bf16, dos en 8bit), un transformer de difusión (seis shards en bf16) y un VAE (un shard en bf16). El repositorio no especifica el número de parámetros ni la composición del dataset de entrenamiento original, ni si se emplearon técnicas como RLHF o DPO (poco habituales en modelos de difusión puros).

La innovación técnica destacable de esta conversión es la adaptación de los pesos a MLX, el framework de Apple para cómputo en chips M-series. El autor reporta métricas de fidelidad respecto al modelo original en PyTorch: para bf16, PSNR medio de 22,1 dB y LPIPS medio de 0,118 (peor caso 0,147); para 8bit, PSNR de 21,0 dB y LPIPS medio de 0,141 (peor caso 0,201), lo que el autor clasifica como "below threshold (experimental)". No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Dos niveles de precisión: bf16 (calidad fiel al original) y 8bit (experimental, menor huella de memoria).
- Integración con el pipeline original de Z-Image-Turbo: solo se convierten text encoder, transformer y VAE; el resto de componentes deben tomarse del repositorio base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión inversa, audio ni modos de "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de ilustraciones y concept art en estaciones de trabajo Mac: el modelo permite crear imágenes a partir de prompts directamente en un Mac con chip M-series, sin GPU dedicada, usando la versión bf16 para máxima fidelidad.
- Prototipado rápido de assets visuales en entornos de diseño: al ejecutarse localmente con MLX, se evita el coste y la latencia de APIs en la nube, lo que agiliza iteraciones de diseño.
- Creación de contenido para blogs y documentación técnica: útil para generar imágenes de portada o diagramas conceptuales a partir de descripciones textuales, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Investigación en modelos de difusión sobre hardware Apple: el repositorio sirve como referencia para estudiar el impacto de la cuantización (bf16 vs 8bit) en la calidad de imagen mediante métricas PSNR y LPIPS.
- Desarrollo de aplicaciones de escritorio para macOS con generación de imágenes integrada: al estar en formato MLX, puede integrarse en apps nativas que aprovechen la GPU unificada de Apple Silicon.
- Evaluación comparativa de pipelines de conversión: los datos de fidelidad reportados permiten analizar el compromiso entre precisión y calidad en conversiones de PyTorch a MLX.
- Generación de imágenes en entornos con restricciones de privacidad: al ejecutarse localmente, los prompts y las imágenes no salen del dispositivo, adecuado para contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la conversión respecto al modelo original en PyTorch:

| Precision | PSNR medio | LPIPS medio | LPIPS peor caso | Estado |
|---|---|---|---|---|
| bf16 | 22,1 dB | 0,118 | 0,147 | Aceptado |
| 8bit | 21,0 dB | 0,141 | 0,201 | Experimental (below threshold) |

No se proporcionan métricas como FID, CLIP score ni comparaciones con otros modelos de generación de imágenes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 45,8 GB en total (suma de bf16 y 8bit). La versión bf16 requiere aproximadamente 17-18 GB para los pesos del transformer y el text encoder, más el VAE; la versión 8bit reduce esta cifra de forma significativa pero no se detalla.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD convencionales al usar MLX.
- Cabe en consumer GPU: sí, en Macs con memoria unificada suficiente. Un Mac con 16 GB podría tener dificultades con bf16; se recomienda 32 GB o más para bf16 y al menos 16 GB para 8bit.
- Opciones de despliegue: MLX (librería mlx), mflux (el repositorio incluye mflux_model.json), y el pipeline original de Z-Image-Turbo para las partes no convertidas. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusión en MLX).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el modelo base Z-Image-Turbo (Tongyi-MAI) es la alternativa directa en PyTorch/CUDA, pero no se han facilitado datos comparativos de parámetros, contexto ni rendimiento. Otros modelos de difusión texto-a-imagen como Stable Diffusion o FLUX no se mencionan en la información disponible, por lo que no se puede establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo-MLX | no disponible | no aplica | Apache 2.0 | safetensors MLX | Hugging Face |
| Z-Image-Turbo (base) | no disponible | no aplica | Apache 2.0 | PyTorch | Hugging Face |
| Otros modelos de difusión | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La versión 8bit está marcada como experimental y por debajo del umbral de calidad (PSNR 21,0 dB, LPIPS 0,201 en el peor caso); no se recomienda para producción sin validación adicional.
- Solo se convierten text encoder, transformer y VAE; el resto del pipeline debe obtenerse del repositorio original, lo que puede complicar el despliegue.
- No se documentan sesgos conocidos, pero al ser un modelo de difusión entrenado con datos no especificados, puede heredar sesgos de representación.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes o no fieles al prompt, especialmente en composiciones complejas.
- Limitaciones de idioma: no se especifican los idiomas soportados por el text encoder; se desconoce si el rendimiento es equivalente en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no detalla si los componentes no convertidos del pipeline original tienen la misma licencia.
- Requiere hardware Apple Silicon; no es portable a otras plataformas sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/Z-Image-Turbo-MLX
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Paper 1 (referenciado en tags): arxiv:2511.22699
- Paper 2 (referenciado en tags): arxiv:2511.22677
- Paper 3 (referenciado en tags): arxiv:2511.13649
