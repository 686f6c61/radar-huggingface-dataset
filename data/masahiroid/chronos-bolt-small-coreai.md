# masahiroid/chronos-bolt-small-coreai

## Resumen

chronos-bolt-small-coreai es una conversión del checkpoint amazon/chronos-bolt-small al formato propietario `.aimodel` de Apple Core AI, publicada por el usuario masahiroid. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de conversión de pesos que preserva la semántica numérica del modelo original de Amazon para permitir su ejecución sobre el runtime Core AI en macOS. El modelo base es un transformer T5 de 48 millones de parámetros especializado en pronóstico de series temporales zero-shot, no en generación de texto.

La relevancia del artefacto es de infraestructura: permite desplegar un modelo de forecasting sobre el stack de inferencia de Apple (Core AI, sucesor de Core ML) con paridad numérica verificada frente a la implementación de referencia en PyTorch. No incorpora entrenamiento adicional, certificación de seguridad ni licencia comercial nueva. El repo ocupa 0,2 GB y el checkpoint se distribuye en precisión F32 con forma de entrada fija `[1, 2048]`.

Conviene subrayar que este modelo no procesa lenguaje: no tiene tokenizador de texto y su salida son cuantiles de pronóstico, no tokens. Cualquier evaluación de capacidades lingüísticas, razonamiento o código es inaplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en T5 (familia Chronos-Bolt) |
| Parametros totales | 48 M (según TSFM.ai para chronos-bolt-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2048 observaciones (forma fija `[1, 2048]` en el export) |
| Tipos de cuantizacion | F32 únicamente en este repo; no es una cuantización de 4 bits |
| Idiomas soportados | no disponible (modelo sin tokenizador de texto; no aplica) |
| Licencia | apache-2.0 (pesos); MIT para conversor y runtime |
| Formato de pesos | `.aimodel` (Apple Core AI); existen variantes mlx, coreml y gguf en repos hermanos |
| Horizonte de pronostico | 64 pasos futuros |
| Cuantiles de salida | 9 (0,1 a 0,9) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo base Chronos-Bolt es un transformer de arquitectura T5 adaptado al pronóstico de series temporales. A diferencia de la primera generación Chronos, que tokenizaba los valores numéricos y generaba la predicción de forma autorregresiva, Chronos-Bolt produce directamente los cuantiles del horizonte futuro en un único paso, lo que reduce la latencia de inferencia de forma sustancial. La familia se entrena sobre grandes corpus de series temporales heterogéneas y se usa en modo zero-shot, sin ajuste específico por dominio.

Este repositorio concreto no aporta entrenamiento nuevo. Es una conversión del checkpoint de Amazon en la revisión `772f3d25d38aec6d914c8949dab4462e2d46f5d8`, con scripts de conversión incluidos y trazabilidad documentada en `provenance.json`. La validación numérica se realizó contra la implementación original en PyTorch sobre tres casos deterministas, con una diferencia absoluta máxima de 3,8146973e-06 y similitud coseno mínima de 1. Se trata de comprobaciones de paridad de conversión, no de benchmarks de calidad de tarea ni de latencia. El entorno de referencia emplea PyTorch 2.14.1, Transformers 4.57.3, coreai-torch 0.4.3 y coreai-core 1.0.0b3 sobre macOS 27.2.

## Capacidades

- Pronóstico de series temporales univariadas en modo zero-shot, sin entrenamiento específico por serie.
- Salida probabilística mediante 9 cuantiles (0,1 a 0,9) sobre un horizonte de 64 pasos.
- Manejo de contextos de hasta 2048 observaciones; las entradas cortas pueden rellenarse por la izquierda con NaN en los exports fijos de Apple.
- Tolerancia a observaciones faltantes en la serie de entrada, según los casos de validación documentados.
- Ejecución en GPU sobre macOS mediante el runtime Core AI, con especialización por unidad de cómputo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Pronóstico de demanda energética: el modelo puede generar curvas de carga horaria a 64 pasos con intervalos de incertidumbre a partir de las 2048 observaciones previas, útil para planificación de capacidad en mercados eléctricos.
- Predicción de precios en mercados mayoristas: con los cuantiles 0,1 y 0,9 se obtienen bandas de riesgo directamente consumibles por sistemas de decisión, sin necesidad de calibración específica por mercado.
- Monitorización de métricas de infraestructura: forecasting de latencia, throughput o uso de CPU en pipelines de observabilidad, aprovechando el contexto largo para capturar estacionalidades diarias y semanales.
- Planificación de inventario y demanda minorista: pronóstico de ventas por referencia a horizonte corto, con cuantiles que permiten fijar stocks de seguridad diferenciados por nivel de servicio.
- Detección de anomalías por residuo: comparar la observación real con la banda de cuantiles predicha para señalar desviaciones significativas en telemetría industrial o financiera.
- Aplicaciones locales en macOS: al ejecutarse sobre Core AI en GPU de Apple Silicon, encaja en herramientas de escritorio que requieren inferencia sin conexión y sin enviar datos de series a servicios externos.
- Prototipado rápido de baselines: su tamaño de 48 M y su naturaleza zero-shot lo hacen adecuado como referencia inicial antes de invertir en modelos específicos por dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de paridad numérica de la conversión (diferencia absoluta máxima de 3,8146973e-06 y similitud coseno mínima de 1 sobre tres casos deterministas), que no constituyen una evaluación de calidad de pronóstico ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 48 M de parámetros en F32 el peso de los pesos ronda los 0,2 GB, por lo que el consumo adicional corresponde a activaciones y al contexto fijo de 2048 posiciones.
- GPU recomendadas: el artefacto está validado para ejecución en GPU sobre macOS 27.2 mediante Core AI; no se documentan GPU NVIDIA ni AMD para este formato.
- Cabe en Apple Silicon consumer: sí, por tamaño; el repo no detalla modelos de chip concretos ni mínimos de memoria unificada.
- Despliegue: exclusivamente mediante el runtime Core AI (`coreai-core==1.0.0b3` probado). No es un `.mlpackage` de Core ML y no se carga con vLLM, llama.cpp, Ollama ni TGI.
- Formatos alternativos del mismo autor: MLX, Core ML y GGUF, publicados en repos separados, para quienes necesiten otros runtimes.
- Latencia y throughput: no disponibles; la model card indica explícitamente que la validación realizada no es un benchmark de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Horizonte | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| chronos-bolt-small-coreai (este) | 48 M | 2048 obs. | 64 pasos, 9 cuantiles | `.aimodel` (Core AI) | apache-2.0 | Conversión F32 para macOS; sin entrenamiento nuevo |
| amazon/chronos-bolt-small | 48 M | 2048 obs. | 64 pasos, 9 cuantiles | safetensors (PyTorch) | apache-2.0 | Checkpoint de referencia de Amazon |
| chronos-bolt-small-mlx / -coreml / -gguf | 48 M | 2048 obs. | 64 pasos, 9 cuantiles | MLX, Core ML, GGUF | apache-2.0 | Mismas conversiones del mismo autor para otros runtimes |
| Chronos original (T5) | no disponible | no disponible | autorregresivo | safetensors | apache-2.0 | Generación autorregresiva, mayor latencia que Bolt según la documentación de la familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de tokenizador de texto y no puede usarse para generación, razonamiento, código ni diálogo.
- El export fija la forma de entrada en `[1, 2048]`; las series más cortas requieren relleno por la izquierda con NaN y las más largas deben truncarse.
- El horizonte está fijado en 64 pasos; no es configurable en este artefacto.
- Solo se distribuye en F32; no debe interpretarse como una cuantización de 4 bits pese a las etiquetas de conversión.
- La validación se limita a tres casos deterministas de paridad numérica; no hay evidencia publicada de calidad de pronóstico ni de latencia en este repo.
- Compatibilidad de versiones no garantizada fuera del entorno probado (coreai-core 1.0.0b3, macOS 27.2, Python 3.14 para la validación).
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de pronósticos poco fiables fuera de la distribución de las series de entrenamiento del modelo base.
- Sesgos: no documentados en la información disponible; el modelo base puede reflejar los sesgos de su corpus de series temporales.
- Licencia apache-2.0 para los pesos, con términos upstream en `LICENSE`; el conversor y el runtime son MIT. No se implica certificación de seguridad ni licencia comercial adicional.
- El autor original del modelo base conserva la atribución y los derechos de licencia; este repo es una conversión de terceros con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/chronos-bolt-small-coreai
- Modelo base en Hugging Face: https://huggingface.co/amazon/chronos-bolt-small
- Variante MLX: https://huggingface.co/masahiroid/chronos-bolt-small-mlx
- Variante Core ML: https://huggingface.co/masahiroid/chronos-bolt-small-coreml
- Variante GGUF: https://huggingface.co/masahiroid/chronos-bolt-small-gguf
- Ficha de Chronos-Bolt Small en TSFM.ai: https://tsfm.ai/models/amazon/chronos-bolt-small
- Ficha en The Applied: https://theapplied.co/models/amazon-chronos-bolt-small
- Sitio de la familia Chronos: https://chronos-ts.ai/
- Resumen técnico de Chronos-Bolt en Emergent Mind: https://www.emergentmind.com/topics/chronos-bolt
