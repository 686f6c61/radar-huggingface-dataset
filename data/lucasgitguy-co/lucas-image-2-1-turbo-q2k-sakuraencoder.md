# Lucasgitguy-co/Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder

## Resumen

Lucas Image 2.1 Turbo Q2K SakuraEncoder es un empaquetado de inferencia para generación de imágenes a partir de texto, publicado por el usuario independiente Lucasgitguy-co. No se trata de un modelo entrenado desde cero, sino de un pipeline de tres componentes que reúne los pesos de difusión de Qwen-Image-2.1-Turbo en cuantización Q2_K (procedentes de Unsloth), un codificador de texto Qwen3-VL de 8B en Q4_K_M modificado por Sakura y el VAE original de Qwen. El autor declara explícitamente que no ha hecho fine-tuning ni abliteración: los tres archivos se copian byte a byte de las fuentes fijadas en `provenance.json`.

El interés de esta ficha radica en que permite ejecutar un pipeline de difusión de clase 7B con un consumo de VRAM muy contenido, gracias a la cuantización de 2 bits de los pesos de difusión y a los 4 bits del codificador. Está pensado para builds compatibles de stable-diffusion.cpp y para uso en investigación y evaluación no comercial. La licencia aplicable es la Qwen Research License, heredada del modelo original.

Conviene subrayar que «Q2_K» describe la cuantización, no el número de parámetros: el generador es de clase 7B (7.115.124.736 parámetros en safetensors según los metadatos del repo) y el codificador de texto es de clase 8B. El repositorio ocupa 8,2 GB e incluye la etiqueta `not-for-all-audiences`, derivada del componente Sakura etiquetado como «uncensored».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión (Qwen-Image-2.1-Turbo) con codificador de texto Qwen3-VL y VAE; pesos de difusión en GGUF |
| Parametros totales | 7.115.124.736 (generador de difusión, dato real en safetensors); codificador de texto de clase 8B adicional |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (difusión), Q4_K_M (codificador de texto), bf16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License); uso no comercial de investigación/evaluación |
| Formato de pesos | GGUF (difusión y codificador) y safetensors (VAE) |

## Arquitectura y entrenamiento

El paquete no entrena nada: es un repackaging. La arquitectura subyacente es la de Qwen-Image-2.1-Turbo, un modelo de difusión para texto-a-imagen de clase 7B, combinado con un codificador de texto basado en Qwen3-VL de 8B y un VAE en bf16. Los pesos de difusión se toman de la cuantización Q2_K ya existente de Unsloth; el codificador de texto procede de la versión de Sakura, que según su autor modificó el encoder y cuantizó los pesos de difusión a 4 bits (aquí el archivo del encoder es Q4_K_M, de 4,68 GiB). El VAE es el original upstream.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que esta ficha no documenta el entrenamiento original de Qwen-Image-2.1-Turbo. La innovación práctica del paquete es la reducción de huella de memoria: la difusión en 2 bits permite ejecutar el generador en entornos con VRAM limitada, a costa de una posible pérdida de calidad de imagen, que el propio autor advierte. La configuración de muestreo recomendada arranca con 8 pasos, CFG 1.0, sampler Euler y el schedule sigma de Turbo upstream.

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante un pipeline de difusión de tres componentes.
- Muestreo rápido: la variante Turbo está diseñada para pocos pasos de inferencia (8 pasos como punto de partida).
- Codificación de texto con un encoder Qwen3-VL de 8B, lo que aporta comprensión semántica de prompts relativamente complejos.
- Ejecución en stable-diffusion.cpp, lo que habilita despliegue en CPU/GPU sin depender de frameworks de difusión de alto nivel.
- Etiqueta `not-for-all-audiences` por el componente Sakura; el autor no reclama ningún efecto medido de «uncensoring».
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Prototipado rápido de conceptos visuales: con 8 pasos de muestreo y pesos en 2 bits, permite iterar prompts en hardware modesto antes de pasar a una cuantización mayor para la versión final.
- Generación de ilustraciones para documentación técnica o blogs: el pipeline acepta prompts descriptivos y produce imágenes de forma local, sin depender de APIs externas.
- Investigación sobre cuantización extrema en difusión: sirve para estudiar el impacto de Q2_K en la calidad de imagen frente a Q4 o bf16 usando el mismo modelo base.
- Evaluación de encoders alternativos: al incluir un encoder Qwen3-VL modificado, permite comparar el efecto del codificador de texto en la fidelidad al prompt.
- Despliegue en entornos con VRAM limitada: la combinación Q2_K + Q4_K_M reduce el requisito de memoria frente al pipeline original, útil en estaciones de trabajo con GPU de gama media.
- Pruebas de integración con stable-diffusion.cpp: el paquete incluye `smoke-test.json` con una comprobación básica de carga y generación con prompt neutro, útil para validar builds.
- Experimentación con contenido creativo sin restricciones de estilo: la etiqueta Sakura permite explorar prompts que otros pipelines filtran, siempre dentro de los límites legales y éticos del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona un `smoke-test.json` que registra una comprobación básica de carga y generación con prompt neutro, no un benchmark de calidad ni de «uncensoring».

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño de los archivos (difusión Q2_K, encoder Q4_K_M de 4,68 GiB y VAE bf16) el conjunto completo ronda los 8-9 GB en disco, por lo que la VRAM necesaria en inferencia es sustancialmente menor que la del pipeline en bf16.
- GPU recomendadas: no especificadas por el autor; por el perfil de cuantización, cabe esperar compatibilidad con GPUs consumer de gama media-alta (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080) y con GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8-12 GB de VRAM o más, aunque el dato exacto no está publicado.
- Opciones de despliegue: stable-diffusion.cpp es el runtime indicado por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de imagen en este formato).
- Latencia y throughput: no disponibles; dependen del hardware y de los 8 pasos de muestreo recomendados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucas Image 2.1 Turbo Q2K SakuraEncoder | 7B (difusión) + 8B (encoder) | no disponible | Q2_K / Q4_K_M / bf16 | qwen-research (no comercial) | Hugging Face, GGUF |
| unsloth/Qwen-Image-2.1-Turbo-GGUF | 7B (difusión) | no disponible | GGUF (varias) | qwen-research | Hugging Face |
| webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF | 7B (difusión) + encoder modificado | no disponible | GGUF (4 bits) | no disponible | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo (original) | 7B (difusión) | no disponible | bf16 | qwen-research | Hugging Face |

La diferencia principal frente a las alternativas es el empaquetado conjunto de los tres archivos con checksums y procedencia documentada, además de la cuantización Q2_K del generador, que reduce la huella frente a las versiones de 4 bits o bf16.

## Limitaciones y advertencias

- La cuantización Q2_K de los pesos de difusión puede degradar la calidad de imagen; el propio autor lo advierte.
- El autor no ha realizado fine-tuning ni abliteración: los pesos son copias byte a byte de las fuentes; no hay evidencia medida de efectos de «uncensoring».
- La etiqueta `not-for-all-audiences` implica que el contenido generado puede no ser apto para todos los públicos; se recomienda moderación en producción.
- Licencia Qwen Research License: uso no comercial de investigación y evaluación únicamente; revisar `LICENSE`, `NOTICE` y `licenses/` antes de cualquier despliegue.
- No es un release oficial de Qwen, Unsloth ni Sakura; es un paquete independiente sin respaldo de los autores originales.
- No se documentan idiomas soportados ni longitud de contexto; la calidad multilingüe de los prompts no está verificada.
- Riesgo de alucinación visual y de fidelidad limitada al prompt, inherente a los modelos de difusión y agravado por la cuantización de 2 bits.
- Requiere una build compatible de stable-diffusion.cpp; no se garantiza compatibilidad con otros runtimes.

## Enlaces

- [Hugging Face: Lucasgitguy-co/Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder](https://huggingface.co/Lucasgitguy-co/Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder)
- [Fuente Unsloth: unsloth/Qwen-Image-2.1-Turbo-GGUF](https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-GGUF)
- [Fuente Sakura: webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF](https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF)
- [Release original: Qwen/Qwen-Image-2.1-Turbo](https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo)
- [Colección Image generation del autor](https://huggingface.co/collections/Lucasgitguy-co/image-generation-6aef2dcb213e6e1883b4c095)
- Documentación interna del repo: `docs/paper.md`, `docs/paper.pdf`, `docs/citation.bib`, `docs/MODEL_INDEX.md`, `docs/USAGE.md`, `provenance.json`, `smoke-test.json`
