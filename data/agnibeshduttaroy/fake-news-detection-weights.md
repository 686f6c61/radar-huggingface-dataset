# agnibeshduttaroy/fake-news-detection-weights

## Resumen

`agnibeshduttaroy/fake-news-detection-weights` es un repositorio de pesos publicado en Hugging Face que acompaña al proyecto «Dual-Pipeline Fake News Detection via Cross-Attention Fusion and Meta-Ensemble Classification». No se trata de un modelo generativo al uso, sino de una colección de artefactos entrenados para dos tareas forenses: detección de manipulación de imágenes (image forgery) y clasificación de noticias falsas sobre texto. El autor es `agnibeshduttaroy` y el código de referencia está en el repositorio GitHub enlazado en la model card.

El pipeline de imagen combina extracción de características ELA (Error Level Analysis) con EfficientNet-B0 y ViT-Small mediante fusión por cross-attention, entrenado sobre CASIA v2.0. El pipeline de texto contiene, por cada dataset (`isot`, `gossipcop`, `liar`), un TF-IDF, un SVM calibrado, un DeBERTa-v3-base y un meta-clasificador de regresión logística, además de un router aprendido (`learned_router.joblib`) que decide qué modelo de texto usar en cada caso.

Es relevante ahora por dos motivos: primero, porque empaqueta en un único repo (~2,3 GB) pesos de varios modelos (DeBERTa-v3-base, EfficientNet-B0, ViT-Small) junto con los clasificadores clásicos, facilitando la reproducibilidad del paper; segundo, porque la model card declara requisitos estrictos (`transformers==5.0.0`) y un uso exclusivamente de investigación, lo que condiciona su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline dual: (a) detección de forgery con ELA + EfficientNet-B0 + ViT-Small y cross-attention; (b) clasificación de texto con TF-IDF + SVM calibrado + DeBERTa-v3-base + meta-clasificador de regresión logística |
| Parametros totales | no disponible (repo de pesos de 2,3 GB; incluye varios modelos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DeBERTa-v3-base soporta típicamente 512 tokens, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, `.pth` y `.joblib`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (los datasets ISOT, GossipCop y LIAR son mayoritariamente en inglés, pero la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors, `.pth` (PyTorch) y `.joblib` |

## Arquitectura y entrenamiento

La parte de imagen implementa un detector de falsificación sobre CASIA v2.0: se aplica Error Level Analysis como señal de entrada, se extraen características con EfficientNet-B0 y ViT-Small, y ambas ramas se fusionan mediante cross-attention. El checkpoint publicado corresponde a la semilla 2024 (`image/proposed_seed2024.pth`).

La parte de texto es un meta-ensemble por dataset: para `isot`, `gossipcop` y `liar` se entrenan un vectorizador TF-IDF, un SVM calibrado, un DeBERTa-v3-base y un meta-clasificador de regresión logística que combina las salidas. Un router aprendido (`learned_router.joblib`) selecciona el modelo de texto adecuado. La model card no detalla el número de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicó RLHF/DPO; remite al paper para resultados y limitaciones.

## Capacidades

- Detección de manipulación de imágenes (forgery detection) sobre imágenes tipo CASIA v2.0, con fusión de características visuales y ELA.
- Clasificación de noticias falsas sobre texto en tres dominios (ISOT, GossipCop, LIAR).
- Meta-ensemble: combinación de señales TF-IDF/SVM y DeBERTa-v3-base mediante regresión logística.
- Enrutamiento aprendido entre modelos de texto según el dataset/dominio.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Moderación de contenidos en plataformas de noticias: el pipeline de texto puede clasificar titulares y cuerpos de noticia en categorías real/falso usando el ensemble entrenado sobre ISOT y GossipCop, con el router eligiendo el modelo adecuado por dominio.
- Verificación de imágenes en redacciones: el detector de forgery con ELA + EfficientNet-B0 + ViT-Small puede usarse para triar imágenes sospechosas antes de publicación, señalando posibles manipulaciones.
- Investigación académica en desinformación: los pesos permiten reproducir los experimentos del paper y comparar variantes (TF-IDF/SVM frente a DeBERTa-v3-base) sin reentrenar desde cero.
- Auditoría de datasets: el meta-clasificador y el router permiten analizar el comportamiento del ensemble por subconjunto (ISOT, GossipCop, LIAR) y detectar sesgos de dominio.
- Prototipado de sistemas de fact-checking: integración de los clasificadores de texto en un servicio de verificación de afirmaciones, usando el SVM calibrado como línea base rápida y DeBERTa como refinamiento.
- Forense digital en entornos de investigación: uso del checkpoint de imagen para peritaje preliminar de manipulación, siempre con revisión humana dada la naturaleza de investigación del repo.
- No se recomienda su uso como servicio de producción sin validación adicional, dado que la model card restringe los pesos a investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper para resultados y limitaciones, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas específicas de detección de forgery o clasificación de noticias.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo pesa 2,3 GB e incluye DeBERTa-v3-base (~0,4 GB en fp32), EfficientNet-B0 (~0,02 GB) y ViT-Small (~0,09 GB), además de clasificadores clásicos; la inferencia de DeBERTa-v3-base cabe holgadamente en GPUs consumer.
- GPU recomendadas: no disponibles en la model card; por tamaño de los componentes, una RTX 3090/4090 o una A100/H100 son sobradas para inferencia, pero no hay datos oficiales.
- Cabe en GPU consumer: sí, por el tamaño de los modelos constituyentes, aunque no está verificada la latencia del pipeline completo.
- Opciones de despliegue: `transformers==5.0.0` (requisito declarado), PyTorch para los `.pth` y `joblib` para los clasificadores y el router; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni ofrece métricas que permitan situar este ensemble frente a alternativas de detección de noticias falsas o de forgery.

## Limitaciones y advertencias

- Uso restringido a investigación según la model card; no se declara licencia, lo que impide confirmar condiciones de uso comercial.
- Requiere `transformers==5.0.0`, una versión muy específica que puede entrar en conflicto con entornos de producción existentes.
- Dependencia de datasets concretos (CASIA v2.0, ISOT, GossipCop, LIAR); el rendimiento fuera de esos dominios no está documentado.
- Riesgo de sesgo de dominio: el router aprendido puede sobreajustarse a las distribuciones de los datasets de entrenamiento.
- Riesgo de falsos positivos/negativos en detección de forgery y de noticias falsas; no se publican métricas de calibración en la model card.
- Idiomas soportados no declarados; presumiblemente inglés por los datasets, pero no confirmado.
- Sin pipeline declarado en Hugging Face ni descargas/likes, lo que sugiere falta de validación comunitaria.
- No hay información sobre alucinación en sentido generativo (no es un modelo de generación), pero sí sobre posibles errores de clasificación.

## Enlaces

- Hugging Face: https://huggingface.co/agnibeshduttaroy/fake-news-detection-weights
- GitHub (código e instrucciones): https://github.com/agnibeshduttaroy/fake-news-detection
- Paper: no disponible en la información proporcionada (la model card lo menciona sin enlace)
- Demo: no disponible
