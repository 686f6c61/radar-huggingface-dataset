# borisggg/steering-denoiser-gemma2_2b

## Resumen

El modelo `borisggg/steering-denoiser-gemma2_2b` es un denoiser de activaciones residuales diseñado para la interpretabilidad mecánica, concretamente para la técnica de *activation steering* sobre el modelo `google/gemma-2-2b-it`. Desarrollado por borisggg como parte de un trabajo académico del T-Lab 2026, el modelo se entrena para corregir activaciones corruptas en la capa 12 (resid_post) del residual stream de Gemma-2-2B-it. Su propósito es servir como un módulo auxiliar que, aplicado a activaciones steered, debería restaurar la coherencia del modelo, pero los resultados publicados muestran un resultado negativo: el denoiser no mejora el steering y a intensidades altas lo empeora.

Arquitectónicamente, es un MLP residual de dos bloques con normalización previa (pre-LN) y factor de expansión 4x, con 95,1 millones de parámetros. No es un modelo generativo, sino un componente de corrección que opera sobre vectores de activación. Su relevancia radica en que documenta un caso de estudio riguroso sobre los límites de los denoisers en el contexto de steering, incluyendo un análisis de la variabilidad entre semillas de entrenamiento y la identificación de un colapso a la identidad en algunas ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP residual (2 bloques pre-LN, hidden 4x) |
| Parametros totales | 95,1 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre activaciones, no es generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | pytorch (formato no especificado) |

## Arquitectura y entrenamiento

El modelo implementa un denoiser residual de la forma `D(x) = x - f(x)`, donde `f` es una red MLP residual. Se entrena con la pérdida `L = ||h - D(corrupt(h))||^2` sobre 958.722 activaciones residuales de la capa 12 de `gemma-2-2b-it`, utilizando una corrupción de tipo C3 con `alpha_max = 3.0`. Por la identidad de Tweedie, un denoiser óptimo en sentido MSE satisface `D(x) = x + sigma^2 * grad log p(x)`, lo que lo convierte en un modelo de score de un paso sobre las activaciones.

La arquitectura del denoiser consta de dos bloques MLP residuales con normalización previa y un factor de expansión de 4x en la capa oculta. El entrenamiento se realizó durante 6000 pasos con un batch de 4096, alcanzando un MSE en datos held-out de 3.523, que equivale a un error relativo de 0.0988 respecto a dejar la corrupción sin corregir. No se emplearon técnicas de RLHF ni DPO; es un entrenamiento supervisado con corrupción sintética.

Un hallazgo importante es que el entrenamiento es bimodal: en aproximadamente una de cada cuatro semillas, el modelo colapsa a la identidad (es decir, `D(x) ≈ x`), mientras que en el resto produce un denoiser funcional con MSE relativo entre 0.11 y 0.15. Este comportamiento se atribuye a una falla de optimización ocasional, no a una propiedad arquitectónica.

## Capacidades

- Corrección de activaciones residuales: el modelo estima la corrección óptima para activaciones corruptas en la capa 12 de Gemma-2-2B-it, basándose en la identidad de Tweedie.
- Integración con técnicas de steering: puede aplicarse a activaciones steered (por ejemplo, `h + alpha * v`) para intentar restaurar la coherencia, aunque los resultados muestran que no mejora el rendimiento y puede degradarlo.
- Análisis geométrico de la corrección: permite descomponer la diferencia `D(h~) - h~` en cambio de norma y cambio de dirección, lo que facilita caracterizar regímenes de comportamiento (rotación acotada, regresión a la media, colapso de identidad).
- Reproducibilidad de resultados negativos: al estar publicado, otros investigadores pueden reproducir los hallazgos sin necesidad de reentrenar el modelo.
- No es un modelo generativo: no genera texto, código, imágenes ni audio, y no soporta tool calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión.

## Casos de uso

- Investigación en interpretabilidad mecánica: el modelo sirve para estudiar cómo los denoisers de activaciones afectan al steering de rasgos en Gemma-2-2B-it, permitiendo analizar por qué la corrección no mejora la coherencia.
- Reproducción de resultados negativos: los investigadores pueden descargar el modelo y verificar que el denoiser no ayuda al steering, e incluso empeora a intensidades altas, lo que es valioso para evitar sesgos de publicación.
- Desarrollo de métodos de steering: comparar este denoiser con alternativas como norm-matching o concept-preserving para entender las limitaciones de cada enfoque y diseñar mejores técnicas.
- Análisis de la geometría de activaciones: usar el modelo para descomponer la corrección en norma y dirección, y así caracterizar regímenes de comportamiento en diferentes condiciones de corrupción.
- Estudio de la variabilidad entre semillas: investigar la bimodalidad del entrenamiento y el colapso a la identidad, lo que tiene implicaciones para la robustez de los entrenamientos de denoisers.
- Educación en IA: como ejemplo documentado de un resultado negativo bien caracterizado, útil para enseñar metodología experimental en interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card reporta métricas específicas de evaluación para steering (trait score y coherence) y MSE de denoising, pero no son benchmarks comparativos con otros modelos. Los resultados muestran que el steering plano supera a las variantes con denoiser en todos los casos evaluados, y que el denoiser colapsa más rápido a partir de alpha=1.

## Requisitos de hardware

- No se proporcionan requisitos de hardware específicos en la información disponible.
- Dado el tamaño del modelo (95,1 millones de parámetros), su huella de memoria es modesta: aproximadamente 380 MB en precisión fp32 y 190 MB en fp16, por lo que es ejecutable en GPUs consumer como una RTX 3060 o superior.
- No se han publicado datos de latencia ni throughput.
- Al ser un componente auxiliar, no requiere despliegue como servicio; puede integrarse en pipelines de investigación con librerías como PyTorch.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros denoisers de activaciones en la información proporcionada. La model card menciona una comparación con un denoiser equivalente para GPT-2, pero no se detallan métricas comparativas estándar.

## Limitaciones y advertencias

- Resultado negativo: el denoiser no mejora el steering y a intensidades altas (alpha > 1) degrada la coherencia más rápido que el steering plano.
- Entrenamiento bimodal: aproximadamente una de cada cuatro semillas produce un colapso a la identidad, lo que invalida conclusiones basadas en una sola ejecución.
- Específico de la capa 12 de Gemma-2-2B-it: no es generalizable a otras capas o modelos sin reentrenamiento.
- Licencia gemma: la licencia de Gemma impone restricciones de uso comercial y términos específicos que deben revisarse antes de cualquier despliegue en producción.
- No es un modelo generativo, por lo que no aplican riesgos de alucinación ni sesgos de texto, pero su uso en pipelines de steering puede amplificar sesgos presentes en el modelo base.
- La corrección puede eliminar información útil: en regímenes de alta corrupción, el denoiser tiende a regresar a la media, borrando la dirección steered en lugar de repararla.

## Enlaces

- HuggingFace: https://huggingface.co/borisggg/steering-denoiser-gemma2_2b
- Repositorio y reporte completo: https://github.com/bborisggg/steering-denoiser
