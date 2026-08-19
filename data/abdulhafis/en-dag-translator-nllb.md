# abdulhafis/en-dag-translator-nllb

## Resumen

El modelo `abdulhafis/en-dag-translator-nllb` es un adaptador PEFT LoRA desarrollado por Abdul Hafis sobre el modelo base `facebook/nllb-200-distilled-600M`, un transformer seq2seq de 600 millones de parámetros entrenado por Meta para traducción multilingüe. El adaptador está especializado en la traducción del inglés al dagbani, una lengua de la familia Mabia hablada en el norte de Ghana (ISO 639-3 `dag`), considerada de bajos recursos en el ecosistema NLP.

La contribución principal del proyecto es la extensión del vocabulario del tokenizador de NLLB con subword tokens personalizados entrenados sobre un corpus paralelo inglés-dagbani de aproximadamente 78 000 pares de oraciones. El objetivo declarado es evitar la fragmentación de caracteres y preservar las estructuras gramaticales propias del dagbani. El adaptador se aplica a las capas de atención (`q_proj`, `v_proj`) y a los módulos de embedding (`shared`, `lm_head`), con una configuración de rango `r=16` y `alpha=32`.

La relevancia de este modelo radica en su enfoque para lenguas de bajos recursos, aunque las métricas reportadas por el autor en un conjunto de prueba gold standard son extremadamente bajas (BLEU 0.00 y chrF++ 0.00), lo que sugiere que el adaptador no produce traducciones funcionales en la práctica. Es un trabajo experimental orientado a la investigación y al desarrollo de herramientas para el dagbani, no un sistema listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (NLLB-200 distilled 600M) con adaptador LoRA |
| Parametros totales | 600M (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | No aplica (adaptador LoRA, no MoE) |
| Longitud de contexto | 1024 tokens (heredada de NLLB-200) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y dagbani (dag) |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo base es NLLB-200 distilled 600M, un transformer encoder-decoder con atención estándar y 12 capas en cada bloque, entrenado por Meta sobre 200 lenguas. El adaptador LoRA se añade a las proyecciones de atención (`q_proj`, `v_proj`) y a las capas de embedding compartidas (`shared`, `lm_head`), lo que permite ajustar el modelo sin modificar los pesos originales. Además, se extiende el vocabulario del tokenizador con tokens subword específicos del dagbani, y se redimensionan las matrices de embedding del modelo base para acomodar el nuevo vocabulario.

El entrenamiento se realizó sobre un corpus paralelo limpio de aproximadamente 78 000 pares de oraciones inglés-dagbani. Se usó el optimizador AdamW con una tasa de aprendizaje de 2e-4, tamaño de lote de 32 y precisión FP16. No se menciona el uso de técnicas de alineación como RLHF o DPO. El código fuente está disponible en un repositorio de GitHub (ver enlaces).

## Capacidades

- Traducción automática de inglés a dagbani (única dirección declarada).
- Soporte de generación con beam search (num_beams=4) y token forzado de idioma de destino (`dag_Latn`).
- Extensión de vocabulario para reducir la fragmentación de caracteres en dagbani.
- Capacidad de carga mediante `transformers` y `peft` como adaptador sobre el modelo base NLLB-200.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-step, visión o audio.
- No se indica soporte de traducción inversa (dagbani a inglés) ni de otros idiomas.

## Casos de uso

- Investigación en NLP de lenguas de bajos recursos: el adaptador sirve como banco de pruebas para estudiar técnicas de extensión de vocabulario y fine-tuning con LoRA en lenguas con pocos recursos digitales.
- Desarrollo de corpus y recursos lingüísticos: el proceso de entrenamiento y el corpus paralelo pueden reutilizarse para crear otros modelos para el dagbani.
- Prototipado de sistemas de traducción asistida: aunque las métricas son bajas, el flujo de carga y generación puede integrarse en herramientas de demostración para evaluar la calidad de forma cualitativa.
- Preservación lingüística: el modelo puede servir como base para futuras iteraciones con más datos o técnicas de entrenamiento mejoradas.
- Educación y documentación: el repositorio y la model card documentan el proceso de adaptación de NLLB a una lengua minoritaria, útil como referencia didáctica.
- Evaluación de métricas de traducción: el conjunto de prueba gold standard permite comparar el rendimiento de este adaptador con otros enfoques, aunque los valores actuales son nulos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en un conjunto de prueba gold standard (no se especifica el tamaño ni la composición):

| Metrica | Valor |
|---|---|
| BLEU (corpus) | 0.00 |
| chrF++ (corpus) | 0.00 |

Estos valores indican que el modelo no produce traducciones que coincidan con las referencias en el conjunto de prueba. No se proporcionan comparaciones con otros modelos ni resultados adicionales. Es probable que el adaptador esté sobreajustado al corpus de entrenamiento o que el corpus sea demasiado pequeño y heterogéneo.

## Requisitos de hardware

- El modelo base tiene 600 millones de parámetros. En FP16, la memoria de pesos es de aproximadamente 1,2 GB, más la memoria para activaciones y el adaptador. Se estima que se necesitan al menos 4 GB de VRAM para inferencia básica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. En entornos cloud, una T4 o V100 es suficiente.
- El adaptador LoRA añade una sobrecarga mínima de memoria (del orden de decenas de MB).
- Opciones de despliegue: se puede ejecutar con `transformers` y `peft` en Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo seq2seq estándar, podría adaptarse a TGI o vLLM si se convierte a un formato compatible.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 600M en una GPU consumer, se espera una latencia de unos pocos cientos de milisegundos por secuencia corta.

## Comparativa con modelos similares

No se dispone de modelos comparables específicamente entrenados para traducción inglés-dagbani en la información proporcionada. NLLB-200 soporta dagbani como idioma de salida, pero no se han encontrado adaptadores o fine-tunings públicos similares. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Las métricas BLEU y chrF++ son 0.00, lo que indica que el modelo no produce traducciones válidas según el conjunto de prueba. No es apto para uso en producción ni para tareas reales de traducción.
- El corpus de entrenamiento es relativamente pequeño (78 000 pares) y de origen no especificado, lo que puede introducir sesgos y limitaciones de cobertura del vocabulario.
- La extensión de vocabulario puede aumentar la tasa de tokens desconocidos si el tokenizador no se ha entrenado con suficiente diversidad de texto dagbani.
- No se han evaluado sesgos sociales ni riesgos de contenido ofensivo; al ser un modelo de traducción, puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero la calidad actual hace inviable cualquier aplicación comercial seria.
- El adaptador depende del modelo base NLLB-200, que tiene su propia licencia (CC-BY-NC-4.0 para uso no comercial). Aunque el adaptador es MIT, el uso del modelo combinado puede estar sujeto a restricciones adicionales. Es necesario verificar la licencia del modelo base.
- No se proporciona información sobre la reproducibilidad exacta del entrenamiento (semillas, partición de datos, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdulhafis/en-dag-translator-nllb
- Repositorio de código fuente: https://github.com/pious2847/Dagbani-NLP_V2
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
