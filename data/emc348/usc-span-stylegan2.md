# emc348/usc-span-stylegan2

## Resumen

USC-SPAN StyleGAN2 (`usc-span-stylegan2`) es un generador StyleGAN2 condicionado por hablante y con una resolución de salida de 64 × 64 píxeles, entrenado sobre fotogramas de resonancia magnética (MRI) en plano sagital medio del tracto vocal procedentes del conjunto de datos USC SPAN. Lo desarrolla Eric Ming Chen (usuario `emc348`) en el contexto de la investigación en torno a la reconstrucción del tracto vocal mediante simulación acústica diferenciable, trabajo presentado como Spotlight en NeurIPS 2026.

El modelo no es un modelo de lenguaje ni un generador de texto: es un prior generativo de imagen que se emplea como componente interno del pipeline `diffTLM` para reconstruir la geometría del tracto vocal a partir de señal de voz. Su relevancia es, por tanto, acotada a la investigación en síntesis y reconstrucción articulatoria, no a aplicaciones generales de IA generativa.

La ficha se elabora a partir de la información pública disponible en Hugging Face (model card, tags y metadatos del repositorio), que es escasa: no hay datos de entrenamiento detallados, benchmarks publicados ni especificaciones completas de cuantización o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleGAN2 (generador condicionado por hablante, `G_ema`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo generativo de imagen) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la condicion de hablante se refiere a sujetos del dataset SPAN) |
| Licencia | MIT |
| Formato de pesos | safetensors (`usc-span-stylegan2.safetensors`, con `init_kwargs` del constructor `Generator` en la cabecera) |

## Arquitectura y entrenamiento

Se trata de un generador StyleGAN2 estándar (red generativa adversaria con modulación de estilo por capas y demodulación de pesos) adaptado a una resolución de 64 × 64 píxeles y condicionado por hablante. La salida son imágenes de MRI sagital media del tracto vocal. El checkpoint corresponde al promedio exponencial de pesos (`G_ema`), habitual en StyleGAN2 para inferencia estable.

El entrenamiento se realizó sobre fotogramas de MRI del dataset USC SPAN. No se especifican en la información disponible el número de imágenes, la composición exacta del conjunto, la duración del entrenamiento, la configuración del discriminador ni si hubo fases de regularización R1 adicionales. Tampoco se detalla el mecanismo exacto de condicionamiento por hablante (embedding de sujeto, one-hot, etc.). La innovación principal no reside en el generador en sí, sino en su uso como prior dentro de un pipeline de simulación acústica diferenciable (`diffTLM`) que ajusta la geometría del tracto vocal para que su respuesta acústica simulada coincida con la señal de voz de entrada.

## Capacidades

- Generación de imágenes de MRI sagital media del tracto vocal a 64 × 64 píxeles.
- Condicionamiento por hablante (identidad de sujeto del dataset SPAN).
- Uso como prior generativo en un proceso de reconstrucción inversa guiado por simulación acústica diferenciable.
- Integración con el repositorio `diffTLM` mediante descarga automática desde Hugging Face Hub o carga manual del checkpoint.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo multimodal de texto, audio o visión general: su dominio es exclusivamente la imagen de MRI del tracto vocal.
- No se documentan capacidades multilingües (no aplica).

## Casos de uso

- Reconstrucción articulatoria a partir de audio: dado un archivo de voz (por ejemplo, `assets/jude.wav`), el pipeline `diffTLM` utiliza el generador como prior para estimar la geometría del tracto vocal que produce esa señal, mediante optimización diferenciable.
- Investigación en fonética articulatoria: permite obtener contornos sagitales plausibles del tracto vocal para estudiar la correspondencia entre señal acústica y configuración articulatoria.
- Análisis por sujeto: el condicionamiento por hablante permite generar geometrías específicas de un sujeto del dataset SPAN, útil para estudios intra-hablante.
- Desarrollo de modelos acústicos articulatorios: sirve como componente generativo en pipelines de síntesis de voz basada en física, donde la simulación acústica se ajusta contra la imagen generada.
- Reproducibilidad de investigación: al publicarse el checkpoint con licencia MIT y el código asociado, otros grupos pueden reproducir los experimentos del paper de NeurIPS 2026.
- Docencia y prototipado en bioingeniería: como ejemplo funcional de integración entre GANs y simulación diferenciable para reconstrucción inversa.
- Generación de datos sintéticos de MRI del tracto vocal: muestras condicionadas por hablante para aumentar conjuntos de datos pequeños en estudios preliminares (con las cautelas propias de datos sintéticos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, precisión de reconstrucción, error acústico, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; un StyleGAN2 a 64 × 64 es un modelo pequeño (el repositorio ocupa 0,1 GB), por lo que es razonable esperar que quepa holgadamente en GPUs de consumo, pero el requisito real vendrá dominado por el pipeline `diffTLM` de simulación acústica diferenciable, no por el generador.
- GPU recomendadas: no disponibles en la información proporcionada. Para el generador aislado, cualquier GPU con suficiente memoria para el pipeline de PyTorch es suficiente; para el pipeline completo se recomienda una GPU con soporte CUDA y memoria suficiente para diferenciación a través de la simulación (no cuantificada en la documentación).
- Cabe en GPU de consumo: probablemente sí para el generador; no confirmado para el pipeline completo.
- Opciones de despliegue: carga directa con PyTorch a través de `diffTLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de generación de MRI del tracto vocal con condicionamiento por hablante y uso como prior en simulación acústica diferenciable. Las alternativas habituales en el ámbito (otros generadores StyleGAN2 o modelos de reconstrucción articulatoria) no se documentan aquí por falta de datos verificables.

## Limitaciones y advertencias

- Resolución limitada: 64 × 64 píxeles, insuficiente para análisis anatómico fino.
- Dominio muy restringido: solo MRI sagital media del tracto vocal del dataset USC SPAN; no generaliza a otras modalidades de imagen ni a otros planos anatómicos.
- Dependencia de la identidad de hablante: el condicionamiento está ligado a los sujetos vistos en entrenamiento; el comportamiento con hablantes no vistos no está documentado.
- Riesgo de artefactos generativos propios de las GANs (modos colapsados, detalles anatómicos inconsistentes) no cuantificado en la model card.
- No es un modelo de lenguaje: no debe evaluarse con métricas de texto ni usarse para tareas de NLP.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar las condiciones del dataset USC SPAN subyacente, que puede tener restricciones adicionales no reflejadas en la licencia del checkpoint.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad de reconstrucción en la información disponible.
- Fecha de creación del repositorio (2026-11-25) y referencia a NeurIPS 2026: verificar la vigencia y el estado de revisión del paper antes de citarlo en producción.
- Sin datos sobre sesgos: no se documentan sesgos demográficos ni de otro tipo del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/emc348/usc-span-stylegan2
- Repositorio de código (`diffTLM`): https://github.com/echen01/diffTLM
- Paper (arXiv): https://arxiv.org/abs/2609.36737
- Cita (BibTeX en model card): Chen, Lee y Sitzmann, "Reconstructing the Vocal Tract with Differentiable Acoustic Simulation", NeurIPS 2026.
