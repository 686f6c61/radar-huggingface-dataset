# SillySom/ie643-cxr-diffusion-weights

## Resumen

`SillySom/ie643-cxr-diffusion-weights` es un repositorio de pesos complementario para el proyecto de código *Text-Conditioned Synthetic Chest X-ray Generation Using Diffusion Models for Data Augmentation* (asignatura IE643, equipo Gradient Mavericks). No se trata de un modelo de lenguaje, sino de un conjunto de pesos de difusión (Stable Diffusion 1.5 adaptado al dominio de radiografía de tórax) junto con los LoRA entrenados, checkpoints intermedios y los conjuntos de imágenes sintéticas generadas. El repositorio ocupa 15,3 GB y se distribuye en formato `safetensors` para la librería `diffusers`.

El objetivo del proyecto es la generación de radiografías de tórax sintéticas condicionadas por texto para aumentar conjuntos de datos médicos pequeños (data augmentation). Incluye los pesos base de P-Rajiv CXR (UNet, VAE y text encoder de SD 1.5), los pasos guardados de siete ejecuciones LoRA de la fase 2, checkpoints de la fase 1 basados en `accelerate`, los pesos del UNet de PRISM para SD 1.5 y quince conjuntos de imágenes generadas (2.173 imágenes cada uno en los generadores principales).

Es relevante ahora porque publica de forma abierta tanto los pesos como las imágenes sintéticas y un demo Gradio autónomo, lo que permite reproducir el pipeline completo de augmentación de datos en investigación de imagen médica. La licencia es "other" y el autor restringe explícitamente el uso a investigación y trabajos académicos, prohibiendo el uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP), con adaptadores LoRA y pesos UNet PRISM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el demo descarga ~2,2 GB de pesos) |
| Idiomas soportados | no disponible (condicionamiento por texto; idioma de los prompts no especificado) |
| Licencia | other (uso solo para investigación y coursework; no clínico) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo se basa en Stable Diffusion 1.5: un UNet de difusión latente que recibe condicionamiento de texto mediante un text encoder CLIP, junto con un VAE que codifica y decodifica las imágenes al espacio latente. Sobre esta base se han entrenado adaptadores LoRA en siete ejecuciones de fase 2, cuyos pasos intermedios se publican (`novelty/runs/<run>/step_*/`), además de checkpoints de fase 1 guardados con `accelerate` (`epoch_2` y `epoch_8`). El repositorio incluye también los pesos de un UNet PRISM para SD 1.5.

El conjunto de datos de entrenamiento es CheXpert, según indica la model card, que además señala que las imágenes generadas derivan de un modelo entrenado sobre dicho dataset y deben usarse bajo sus términos de investigación. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma estándar a modelos de difusión). La innovación principal es el condicionamiento por texto para generar radiografías de tórax sintéticas destinadas a augmentación de datos, con publicación íntegra de pesos, pasos intermedios y conjuntos sintéticos para reproducibilidad.

## Capacidades

- Generación de imágenes sintéticas de radiografía de tórax condicionadas por texto (text-to-image con difusión latente).
- Adaptación de dominio mediante LoRA sobre Stable Diffusion 1.5 para el estilo radiológico de CheXpert.
- Aumento de datos (data augmentation): producción de conjuntos sintéticos de 2.173 imágenes por generador principal.
- Checkpoints intermedios y pasos LoRA publicados para experimentación y análisis de la evolución del entrenamiento.
- Pesos UNet PRISM para SD 1.5, orientados a la generación en el dominio médico.
- Demo Gradio autónomo que descarga los pesos necesarios (~2,2 GB) y sirve la interfaz en `http://127.0.0.1:7860`.
- Verificación de integridad mediante `SHA256SUMS` para todos los ficheros.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking".

## Casos de uso

- Augmentación de datasets de radiografía de tórax: generar imágenes sintéticas condicionadas por texto para equilibrar clases minoritarias en entrenamientos de clasificadores médicos, usando los conjuntos de 2.173 imágenes incluidos o generando nuevos con los pesos LoRA.
- Reproducción de experimentos académicos: el repositorio replica las rutas del código fuente, de modo que `scripts/download_weights.sh` permite reconstruir exactamente el pipeline de las fases 1 y 2 para validar resultados publicados.
- Estudio de la evolución del entrenamiento LoRA: los pasos guardados de las siete ejecuciones permiten analizar cómo cambia la calidad y el estilo de las imágenes generadas a lo largo del entrenamiento.
- Prototipado de interfaces de generación médica: el demo Gradio sirve para demostrar el flujo texto-a-radiografía en entornos de investigación sin infraestructura adicional.
- Investigación en privacidad y datos sintéticos: evaluar hasta qué punto las imágenes generadas preservan o no información identificable del dataset original (CheXpert) y su utilidad como sustituto en pipelines de investigación.
- Docencia y coursework: material listo para asignaturas de visión por computador o IA médica, con pesos, código y pasos de reproducción documentados.
- Comparación de variantes de UNet (base P-Rajiv frente a PRISM) sobre la misma base SD 1.5 para estudiar el efecto en la fidelidad radiológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 15,3 GB, pero el demo solo descarga ~2,2 GB de pesos, lo que sugiere que la inferencia del pipeline mínimo cabe en GPUs de consumo con suficiente VRAM para SD 1.5.
- GPU recomendadas: no especificadas por el autor. Por la base SD 1.5, es razonable esperar funcionamiento en GPUs de consumo tipo RTX 3060/4070/4090, aunque no hay confirmación en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño del demo (~2,2 GB de pesos) es compatible con GPUs de consumo, pero no se documenta VRAM mínima.
- Opciones de despliegue: `diffusers` (librería declarada), demo Gradio incluido (`demo/app.py`), descarga vía `hf download` o `scripts/download_weights.sh`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SillySom/ie643-cxr-diffusion-weights | Stable Diffusion 1.5 + LoRA + PRISM | no disponible | no aplica | Radiografía de tórax (CheXpert) | other (solo investigación) | Hugging Face, 15,3 GB |
| Stable Diffusion 1.5 (base) | Diffusion latente | no disponible en la información | no aplica | Imágenes generales | CreativeML OpenRAIL-M | Amplia |
| Modelos de difusión médicos comparables | no disponible | no disponible | no aplica | Imagen médica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de parámetros comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Uso restringido: la licencia "other" limita el uso a investigación y coursework; el autor prohíbe explícitamente el uso clínico.
- Las imágenes generadas derivan de un modelo entrenado sobre CheXpert y quedan sujetas a los términos de uso de investigación de dicho dataset.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir hallazgos radiológicos inexistentes o anatómicamente implausibles; no debe interpretarse como diagnóstico.
- Sesgos del dataset: al entrenarse sobre CheXpert, hereda los sesgos de población, equipamiento y anotación de dicho corpus.
- Idiomas y prompts: no se documenta el idioma ni la formulación óptima de los prompts de condicionamiento.
- Sin benchmarks publicados: no hay métricas de fidelidad (FID, IS) ni de utilidad clínica en la información disponible.
- Sin parámetros ni VRAM documentados: dificulta planificar el despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo.
- No apto para producción clínica ni para tomar decisiones médicas.

## Enlaces

- Hugging Face: https://huggingface.co/SillySom/ie643-cxr-diffusion-weights
- Repositorio de código y reproducción: https://github.com/somyadahiaya/ie643-cxr-diffusion
- Demo Gradio: incluido en el repositorio (`demo/app.py`, `demo/README.md`, `demo/requirements.txt`)
