# makitty/quechua-chanka-mt-bpe

## Resumen

quechua-chanka-mt-bpe es un modelo de traduccion automatica neuronal espanol→quechua (variante chanka) desarrollado por makitty. Se trata de un transformer pequeno entrenado desde cero, con aproximadamente 11,5 millones de parametros segun la model card (15.580.800 parametros reales en los pesos safetensors), arquitectura encoder-decoder de 4 capas y dimension de modelo de 256. Su proposito no es tanto la traduccion de produccion como servir de linea base en un experimento controlado de tokenizacion.

El modelo forma parte de la evaluacion extrinseca del trabajo QuechuaTok (Contreras, 2026), que introduce Morphological Boundary Accuracy (MorphAcc) como metrica para evaluar tokenizadores en lenguas aglutinantes de bajos recursos. Este modelo emplea un tokenizador BPE estandar de 16k en el lado quechua, y se compara contra quechua-chanka-mt-prpe, que usa un tokenizador guiado morfologicamente (PRPE). La diferencia de rendimiento entre ambos cuantifica el impacto del tokenizador en la traduccion.

Es relevante ahora porque ofrece un punto de referencia reproducible y abierto (licencia Apache 2.0) para investigacion en procesamiento de lenguas de bajos recursos, en concreto para el quechua, y porque documenta de forma explicita como una decision de tokenizacion afecta a metricas downstream como BLEU y chrF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), 4 capas encoder/decoder, d_model=256 |
| Parametros totales | 15.580.800 (segun safetensors); ~11,5M segun model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (espanol), qu (quechua, variante chanka) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, con 4 capas en encoder y decoder y una dimension de modelo de 256. Se entrena desde cero (no es un fine-tuning de un modelo multilingue preentrenado) para la direccion espanol→quechua chanka. El tokenizador del lado quechua es un BPE estandar de vocabulario 16k, elegido deliberadamente como linea base frente al tokenizador PRPE del modelo comparado.

Los datos de entrenamiento provienen del split `broad_train` del dataset makitty/quechua-chanka-unified-v2, con 91.000 pares de frases paralelas. El modelo se evalua sobre un conjunto de test de 12.206 ejemplos. No se documentan en la informacion disponible detalles sobre volumen total de tokens, composicion del dataset, ni sobre etapas de RLHF o DPO; el entrenamiento parece ser supervisado estandar de traduccion. La innovacion tecnica del trabajo no reside en el modelo sino en la metrica MorphAcc y en el contraste de tokenizadores.

## Capacidades

- Traduccion de texto espanol→quechua (chanka), unica direccion documentada.
- Generacion de traduccion a nivel de frase mediante decodificacion seq2seq estandar.
- Manejo de texto en espanol y quechua con tokenizacion BPE de 16k en el lado destino.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla de es y qu.
- No se documentan capacidades de vision, audio ni modo de razonamiento (thinking).

## Casos de uso

- Linea base de investigacion en tokenizacion: sirve para reproducir el experimento de ablacion de QuechuaTok comparando BPE frente a PRPE y medir el efecto en BLEU y chrF.
- Evaluacion de metricas morfologicas: permite calcular MorphAcc sobre las salidas del modelo y contrastar con el modelo PRPE para estudiar la relacion entre tokenizacion y calidad de traduccion.
- Prototipado de traduccion espanol→quechua en entornos de bajos recursos: con 15,6M de parametros y 0,1 GB de repo, se puede desplegar en CPU o GPU de gama baja para pruebas de concepto.
- Generacion de corpus sinteticos de bajo coste: util para aumentar datos paralelos en experimentos academicos, siempre con revision humana dada la calidad limitada (BLEU 4,18).
- Docencia y divulgacion: ejemplo compacto de pipeline NMT completo (tokenizador, entrenamiento, evaluacion) para cursos de PLN en lenguas de bajos recursos.
- Comparacion de arquitecturas de tokenizacion en lenguas aglutinantes: base para extender el estudio a otras variantes del quechua o a otras lenguas con morfologia rica.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test (n=12.206), segun la model card:

| Tokenizador | MorphAcc% | BLEU | chrF |
|---|---|---|---|
| BPE (este modelo) | 6,67 | 4,18 | 35,13 |
| PRPE | 83,33 | 7,05 | 41,10 |

El tokenizador PRPE supera a esta linea base en +68,7% BLEU y +17,0% chrF. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo de traduccion de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,6M de parametros, ~62 MB de pesos); en fp16 aproximadamente 31 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (pipeline de translation), Marian/argos-translate para inferencia optimizada, ONNX Runtime, y posible conversion a otros formatos; no se documenta soporte nativo en vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en milisegundos por frase en CPU y sub-milisegundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quechua-chanka-mt-bpe (este) | 15,6M | no disponible | 4,18 | Apache 2.0 | HuggingFace |
| quechua-chanka-mt-prpe | no disponible | no disponible | 7,05 | no disponible | HuggingFace |
| NLLB-200 (variante pequena) | 600M (distilled) | 512 tokens | no disponible para es-qu | CC-BY-NC 4.0 | HuggingFace |

No se dispone de datos comparativos adicionales con otros modelos especificos de espanol→quechua en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de traduccion baja: BLEU de 4,18 y chrF de 35,13 indican que las salidas no son aptas para uso en produccion sin revision humana.
- MorphAcc de 6,67% refleja una tokenizacion deficiente para una lengua aglutinante, lo que degrada la fidelidad morfologica de las traducciones.
- Entrenado solo con 91k pares de frases, lo que limita la cobertura lexica y de dominios.
- Direccion unica documentada (es→qu); no se garantiza ni documenta el rendimiento en qu→es.
- Variante limitada al quechua chanka; no cubre otras variedades (Cusco, Collao, etc.).
- Riesgo de alucinacion y de traducciones gramaticalmente incorrectas por el bajo rendimiento medido.
- No se documentan sesgos especificos, pero al ser un modelo de bajos recursos y entrenado desde cero, es probable que herede sesgos del corpus `broad_train`.
- Licencia Apache 2.0 permite uso comercial, pero la baja calidad desaconseja su uso en produccion sin validacion.
- No se documentan limitaciones de contexto; se desconoce la longitud maxima de secuencia soportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makitty/quechua-chanka-mt-bpe
- Modelo comparado (PRPE): https://huggingface.co/makitty/quechua-chanka-mt-prpe
- Dataset de entrenamiento: https://huggingface.co/datasets/makitty/quechua-chanka-unified-v2
- Paper QuechuaTok: https://arxiv.org/abs/2606.23943
