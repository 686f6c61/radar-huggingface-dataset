# NicolasRomo/mt5-large-lora-chilenizador

## Resumen

El modelo `NicolasRomo/mt5-large-lora-chilenizador` es un adaptador LoRA publicado sobre el modelo base `google/mt5-large`, un transformer encoder-decoder multilingüe de aproximadamente 1.200 millones de parámetros desarrollado por Google Research. El adaptador se entrenó con el objetivo declarado de reescribir texto en español neutro hacia español chileno coloquial, un caso concreto de adaptación dialectal mediante ajuste fino ligero sobre un modelo preentrenado de gran tamaño.

El modelo es relevante no por su rendimiento, sino como caso documentado de fallo de entrenamiento: según la propia model card, el adaptador no aprendió la tarea y copia la frase de entrada sin cambios en aproximadamente el 88 % de los casos, con métricas equivalentes a no hacer nada (chrF 79,7 frente a 79,9 de la identidad). El autor lo publica explícitamente solo por completitud del proyecto académico (asignatura IIC3670) y desaconseja su uso.

La ficha resulta útil para desarrolladores e investigadores como referencia negativa: muestra cómo un dataset pequeño (~2.100 pares semisintéticos), un objetivo de reescritura estilística y un adaptador de bajo rango pueden no producir señal de aprendizaje, y sirve de contraste con alternativas que sí funcionan (reglas léxicas o LoRA sobre Llama-3.2-3B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 1.200 M en el modelo base `google/mt5-large`; el adaptador LoRA añade un número reducido de parámetros entrenables (no disponible el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (mT5-large soporta secuencias de entrada de hasta 512 tokens en la configuración estándar; la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors del adaptador; no se documentan variantes cuantizadas) |
| Idiomas soportados | es (español; el modelo base mT5 es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); modelo base en safetensors vía `google/mt5-large` |

## Arquitectura y entrenamiento

El modelo base es mT5-large, una variante del transformer encoder-decoder T5 entrenada sobre el corpus multilingüe mC4, con normalización de capas, atención relativa y tokenizador SentencePiece multilingüe. Sobre él se aplica un adaptador LoRA (Low-Rank Adaptation) que congela los pesos originales y entrena matrices de bajo rango en determinadas capas, lo que reduce drásticamente el coste de ajuste fino. La librería declarada es `peft` y el pipeline esperado es `text2text-generation`.

El entrenamiento se realizó sobre un dataset propio de aproximadamente 2.100 pares español neutro → español chileno coloquial, descrito como semisintético y revisado manualmente: parte de las frases se generaron o neutralizaron con un LLM y el equipo las revisó. El split es fijo con semilla 42: 1.680 ejemplos de entrenamiento, 210 de validación y 248 de test. En test, 37 frases contienen expresiones reservadas (`transferencia`) que no aparecen en entrenamiento, para evaluar generalización. No se documentan detalles sobre hiperparámetros, número de épocas, rango del adaptador ni si hubo RLHF o DPO (no aplicable en este caso). El resultado declarado es que el adaptador no aprendió la tarea.

## Capacidades

- Generación de texto condicionada a una instrucción de reescritura (`Reescribe en español chileno: {frase}`), aunque en la práctica el modelo tiende a copiar la entrada.
- Adaptación estilística/dialectal: el objetivo declarado es transformar español neutro en español chileno coloquial, capacidad que según las métricas publicadas no se alcanza.
- Generación seq2seq estándar heredada de mT5-large (traducción, resumen, paráfrasis), aunque el adaptador está entrenado para una única tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al español en la práctica; el modelo base es multilingüe pero el adaptador no se evaluó en otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Referencia negativa en docencia e investigación: el modelo sirve como caso de estudio de un ajuste fino LoRA que no converge a la tarea, útil para comparar curvas de aprendizaje y métricas frente a la identidad.
- Baseline en experimentos de adaptación dialectal: permite contrastar el rendimiento de un adaptador LoRA sobre mT5-large con enfoques alternativos (reglas léxicas, modelos mayores) en el mismo conjunto de test.
- Evaluación de pipelines PEFT: útil para probar la integración de `peft` con `transformers` en un flujo de carga de adaptadores y generación con `num_beams`.
- Reproducción de experimentos académicos: el split fijo (semilla 42) y las métricas publicadas permiten replicar el resultado y verificar la ausencia de aprendizaje.
- Pruebas de infraestructura de inferencia seq2seq: sirve para validar el despliegue de un modelo mT5-large con adaptador en entornos de desarrollo, sin expectativa de calidad.
- Auditoría de calidad de datasets semisintéticos: el fallo del modelo ilustra el impacto de un dataset pequeño y generado con LLM en la señal de entrenamiento, útil para diseñar mejores protocolos de curación de datos.

No se recomienda su uso en producción para reescritura dialectal, atención al cliente, generación de contenido ni ninguna tarea que requiera transformar texto de forma fiable.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (n=248):

| Sistema | chrF | BERTScore | Exacta (%) | Chilenismos (%) | F1 ediciones |
|---|---|---|---|---|---|
| identidad (copiar) | 79,9 | 93,4 | 2,4 | 0,0 | 0,0 |
| reglas (léxico) | 83,7 | 94,7 | 19,8 | 24,8 | 27,9 |
| mT5-small | 83,2 | 94,6 | 21,0 | 20,8 | 25,6 |
| mT5-large + LoRA | 79,7 | 93,4 | 2,0 | 0,4 | 0,7 |
| Llama-3.2-3B + LoRA | 89,1 | 96,6 | 48,4 | 48,0 | 51,8 |

El adaptador obtiene métricas inferiores o iguales a la identidad en chrF y BERTScore, y prácticamente nulas en chilenismos y F1 de ediciones, lo que confirma que no aprendió la tarea. En las 37 frases de `transferencia` (expresiones no vistas en entrenamiento), ningún modelo entrenado acierta la expresión esperada, según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: mT5-large en fp32 requiere aproximadamente 4,5-5 GB; en fp16/bf16, alrededor de 2,5-3 GB. El adaptador LoRA añade un consumo mínimo adicional (no disponible el tamaño exacto del adaptador en el repositorio, que figura como 0,0 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para fp32 se recomienda al menos 8-10 GB.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 o superiores con fp16; también en GPUs de 8 GB con cuantización o carga en fp16.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card), y potencialmente vLLM, TGI o llama.cpp si se exporta el modelo fusionado, aunque no se documentan recetas específicas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea (chrF / Exacta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mt5-large-lora-chilenizador | ~1.200 M (base) + LoRA | no disponible | 79,7 / 2,0 % | apache-2.0 | Hugging Face |
| mT5-small (fine-tuned) | ~300 M | no disponible | 83,2 / 21,0 % | apache-2.0 | Hugging Face |
| Llama-3.2-3B + LoRA | ~3.200 M | 128 K (modelo base) | 89,1 / 48,4 % | Llama 3.2 Community License | Hugging Face |
| Reglas léxicas | no aplica | no aplica | 83,7 / 19,8 % | no aplica | implementación propia |

La comparativa muestra que un modelo mucho menor (mT5-small) y un sistema basado en reglas superan al adaptador en esta tarea, y que un LoRA sobre Llama-3.2-3B es la alternativa con mejor rendimiento documentado en el mismo test.

## Limitaciones y advertencias

- El adaptador no aprendió la tarea: copia la entrada en aproximadamente el 88 % de los casos y sus métricas son equivalentes a no hacer nada.
- No generaliza a expresiones no vistas en entrenamiento: en las 37 frases de `transferencia`, ningún modelo entrenado acierta la expresión esperada.
- A veces conjuga mal una expresión o la deja sin cambiar, según la model card.
- Dataset de entrenamiento pequeño (~2.100 pares) y semisintético, lo que limita la señal de aprendizaje.
- Riesgo de alucinación y de errores gramaticales en la salida, aunque en la práctica el modelo tiende a copiar la entrada.
- Licencia apache-2.0 en el adaptador; el modelo base `google/mt5-large` también se distribuye bajo apache-2.0, por lo que el uso comercial está permitido, aunque el autor desaconseja su uso.
- No es un producto: es un modelo de investigación/curso (IIC3670) y no se recomienda su uso en producción.
- No se documentan sesgos específicos, pero al estar entrenado sobre un dataset semisintético de español chileno puede reflejar los sesgos del LLM utilizado para generarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicolasRomo/mt5-large-lora-chilenizador
- Modelo base: https://huggingface.co/google/mt5-large
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de mT5 (paper): https://arxiv.org/abs/2010.11934
- Documentación de T5 (paper): https://arxiv.org/abs/1910.10683
