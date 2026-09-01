# abdi38394/mini-gpt-10m-fineweb

## Resumen

Mini-GPT-10M es un modelo de lenguaje de tamaño reducido desarrollado por el usuario abdi38394, entrenado desde cero sobre el dataset wikimedia/wikipedia. A pesar de su nombre, el peso real en safetensors es de 6.696.960 parámetros (~6,7 millones), lo que lo sitúa en la categoría de modelos extremadamente ligeros, pensados para experimentación educativa y prototipos rápidos. Su arquitectura replica la de GPT-2, con 4 capas, 4 cabezas de atención, dimensión de embedding de 160 y una ventana de contexto de 512 tokens.

El modelo está orientado a la generación de texto en inglés y se distribuye bajo licencia MIT, lo que facilita su uso y modificación. Su relevancia actual radica en servir como banco de pruebas para estudiar el comportamiento de los transformers a pequeña escala, así como para aplicaciones donde los recursos computacionales son muy limitados. Al ser un modelo pequeño, su entrenamiento e inferencia son viables incluso en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | 6.696.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con normalización previa y atención causal. Consta de 4 capas, 4 cabezas de atención y una dimensión de embedding de 160, lo que da un total de aproximadamente 6,7 millones de parámetros. Se entrenó desde cero sobre el dataset wikimedia/wikipedia, sin que se especifique el número exacto de tokens ni la composición detallada del corpus. No se menciona el uso de técnicas de alineación como RLHF o DPO; el entrenamiento parece ser únicamente de modelado de lenguaje autorregresivo.

Los valores de pérdida finales reportados son 5.47 para entrenamiento y 5.31 para validación, con una perplejidad de 202.5. No se detallan innovaciones técnicas adicionales más allá de la implementación estándar de GPT-2.

## Capacidades

- Generación de texto en inglés, con capacidad limitada por su tamaño reducido.
- Modelado de lenguaje autorregresivo básico, adecuado para tareas de completado de texto corto.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento explícito.
- Al estar entrenado solo en inglés, su competencia en otros idiomas es nula o muy limitada.

## Casos de uso

- Experimentación educativa: sirve para enseñar los fundamentos de los transformers y el entrenamiento de modelos de lenguaje, dado su tamaño reducido y su facilidad para ejecutarse en una GPU de gama baja o incluso en CPU.
- Prototipado rápido de aplicaciones de generación de texto: se puede integrar en demos o pruebas de concepto donde se requiera una salida de texto simple y no se necesite alta calidad.
- Generación de texto corto en entornos con restricciones de memoria: por ejemplo, en dispositivos embebidos o en aplicaciones móviles donde la huella de memoria es crítica.
- Análisis de perplejidad y comportamiento de modelos pequeños: permite estudiar cómo varía la perplejidad con el tamaño del modelo y los datos de entrenamiento.
- Base para fine-tuning en tareas específicas de dominio reducido: al ser pequeño, se puede ajustar con pocos datos y recursos, por ejemplo para generar descripciones breves o etiquetas.
- Evaluación de técnicas de generación con parámetros de control: los parámetros recomendados (repetition_penalty, temperature, top_k) permiten experimentar con estrategias de muestreo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la perplejidad de 202.5 sobre el conjunto de validación, que se indica en la model card. No hay comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada: al tener ~6,7 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM incluso en precisión fp32. Con cuantización a int8 o int4, podría ejecutarse en CPU con unos pocos cientos de MB de RAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA GTX 1050, o incluso la T4 gratuita de Google Colab. También es viable en CPU.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo de la librería transformers, se puede servir con text-generation-inference, vLLM (aunque para este tamaño es sobredimensionado), o mediante llama.cpp si se convierte a GGUF. También se puede usar directamente con la API de transformers en Python.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. Existen proyectos como Catalyst-Mini (10M parámetros) o minGPT, pero no se han encontrado datos de rendimiento comparables en la documentación disponible. Por tanto, la comparativa se limita a indicar que no hay datos contrastados.

## Limitaciones y advertencias

- Tamaño muy reducido: la capacidad de generación es limitada, con alta probabilidad de producir texto incoherente o repetitivo si no se usan los parámetros de generación adecuados.
- Perplejidad alta (202.5), lo que indica una calidad de lenguaje baja en comparación con modelos más grandes.
- Contexto limitado a 512 tokens, insuficiente para tareas que requieran dependencias de largo alcance.
- Solo soporta inglés; no se ha entrenado en otros idiomas.
- Riesgo de alucinaciones y sesgos derivados del dataset de Wikipedia, que puede contener información desactualizada o parcial.
- No se han documentado pruebas de seguridad ni mitigación de sesgos.
- La licencia MIT permite uso comercial, pero el modelo no está optimizado para producción y puede requerir ajustes adicionales.

## Enlaces

- [HuggingFace - abdi38394/mini-gpt-10m-fineweb](https://huggingface.co/abdi38394/mini-gpt-10m-fineweb)
- [Dataset wikimedia/wikipedia](https://huggingface.co/datasets/wikimedia/wikipedia) (referencia del dataset de entrenamiento)
