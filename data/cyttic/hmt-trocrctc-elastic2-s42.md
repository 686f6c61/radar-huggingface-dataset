# cyttic/hmt-trocrctc-elastic2-s42

## Resumen

cyttic/hmt-trocrctc-elastic2-s42 es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) en hebreo, desarrollado por el grupo cyttic en el marco de un estudio de aumento de datos (*augmentation study*) denominado htr-metrics-transfer, ola 1. El modelo combina una arquitectura TrOCR con una cabeza de clasificación temporal conexionista (CTC) y decodificación voraz, y se ha entrenado sobre el conjunto cyttic/hhd-optionb-split excluyendo los escritores de validación. Su interés es acotado pero específico: sirve como referencia reproducible para medir el efecto de la técnica de aumento "elastic2" sobre métricas de reconocimiento de escritura manuscrita en hebreo, con una semilla fija (42) que permite replicar exactamente el experimento.

Con 87,27 millones de parámetros y un repositorio de apenas 0,3 GB, es un modelo ligero, pensado para investigación y evaluación comparativa más que para despliegue generalista. Los resultados reportados por el autor son CER 0,0972 y WER 0,4058 sobre el test HHD Option-B, con decodificación voraz y sin modelo de lenguaje, lo que sitúa el modelo en un régimen de calidad moderado y condicionado a esa configuración de evaluación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder visual + decoder transformer) con cabeza CTC |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR (*Transformer-based Optical Character Recognition*), que combina un codificador de imágenes tipo ViT con un decodificador transformer autorregresivo, al que se añade una cabeza CTC para el reconocimiento de secuencias. La decodificación empleada en la evaluación es voraz (*greedy*) y sin modelo de lenguaje auxiliar, lo que explica en parte el WER relativamente alto reportado (0,4058) frente al CER (0,0972).

El entrenamiento se realizó sobre el conjunto cyttic/hhd-optionb-split, excluyendo los escritores reservados para desarrollo, y aplicando la técnica de aumento de datos "elastic2" con semilla 42. Se trata de un experimento controlado dentro de un estudio más amplio de transferencia de métricas HTR; el autor remite a results.json para los detalles completos, que no están disponibles en la información proporcionada. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes, mediante decodificación CTC voraz.
- Transcripción de líneas o regiones de texto manuscrito, orientada a tareas HTR.
- Evaluación reproducible de aumentos de datos: el modelo está etiquetado con la técnica (elastic2) y la semilla (42) empleadas.
- No dispone de soporte documentado para tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales más allá de la entrada de imagen para OCR/HTR.
- Capacidades multilingües limitadas al hebreo según la model card.

## Casos de uso

- Investigación en HTR: servir como punto de referencia fijo (semilla 42, aumento elastic2) para comparar el efecto de distintas técnicas de aumento sobre CER y WER en hebreo manuscrito.
- Evaluación de pipelines de reconocimiento: integrar el modelo en un banco de pruebas con decodificación voraz y sin LM para medir líneas base reproducibles antes de añadir modelos de lenguaje.
- Digitalización de archivos manuscritos en hebreo: transcripción automática de líneas escaneadas en proyectos de preservación documental, asumiendo la tasa de error reportada (CER ~0,097).
- Análisis de robustez frente a distorsiones: al haberse entrenado con aumento elástico, resulta adecuado para estudiar cómo varía el rendimiento con deformaciones geométricas del texto.
- Docencia y reproducción de experimentos: modelo pequeño (87 M parámetros, 0,3 GB) que puede entrenarse y evaluarse en entornos académicos con recursos limitados.
- Comparación entre escritores: al excluir los escritores de desarrollo del entrenamiento, permite analizar la generalización a escritores no vistos en el conjunto HHD Option-B.

## Benchmarks y rendimiento

| Metrica | Valor | Configuracion |
|---|---|---|
| CER | 0,0972 | HHD Option-B test, greedy, sin LM |
| WER | 0,4058 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 87,27 M parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 0,35 GB, por lo que la inferencia cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes. No se dispone de recomendaciones específicas del autor.
- Cabe en GPU de consumo: sí, con margen amplio dada la baja huella de memoria del modelo.
- Opciones de despliegue: no disponibles en la información proporcionada; al ser un modelo TrOCR con pesos safetensors, sería desplegable mediante Transformers, pero no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic2-s42 | 87,27 M | no disponible | HTR hebreo | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M (base) | no disponible | OCR/HTR inglés | MIT | Hugging Face |
| Modelos HTR de cyttic (otras semillas/aumentos) | no disponible | no disponible | HTR hebreo | MIT (segun familia) | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas en la información proporcionada. La comparación con TrOCR base se limita a la arquitectura y al orden de magnitud de parámetros, no a métricas.

## Limitaciones y advertencias

- El WER reportado (0,4058) es elevado en comparación con el CER; la evaluación se hizo con decodificación voraz y sin modelo de lenguaje, por lo que añadir un LM podría cambiar sustancialmente los resultados.
- El modelo está entrenado exclusivamente para hebreo manuscrito; no se documenta soporte para otros idiomas ni para texto impreso.
- El entrenamiento excluye los escritores de desarrollo del conjunto HHD Option-B, por lo que su comportamiento fuera de esa distribución de escritores no está caracterizado.
- No hay datos publicados sobre sesgos, tasas de alucinación en transcripción ni comportamiento en dominios distintos del dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor no documenta condiciones adicionales ni garantías sobre el rendimiento en producción.
- Los detalles del entrenamiento (tokens, composición del dataset, posibles etapas de ajuste) no están disponibles más allá de la referencia a results.json.
- Al tratarse de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-elastic2-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio: results.json (referenciado en la model card, no enlazado de forma directa en la información disponible)
- Paper de TrOCR (arquitectura base): no disponible en la información proporcionada
