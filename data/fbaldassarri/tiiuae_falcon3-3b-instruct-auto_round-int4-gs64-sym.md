# fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int4-gs64-sym

## Resumen

Este modelo es una versión cuantizada a 4 bits del modelo Falcon3-3B-Instruct, desarrollado por el Technology Innovation Institute (TII), y publicado en Hugging Face por el usuario fbaldassarri. La cuantización se ha realizado con el algoritmo AutoRound (también conocido como SignRound) de Intel, en su versión 0.13.1, con el objetivo de reducir el uso de memoria y acelerar la inferencia en hardware de Intel (CPU, iGPU Arc y NPU de la serie Core Ultra). El resultado es un modelo de generación de texto en inglés, orientado a tareas de chat e instrucción, que mantiene una calidad aceptable con una pérdida de precisión leve según el propio autor.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y eficiente para desplegar un modelo de instrucción en entornos con recursos limitados, especialmente en equipos con procesadores Intel sin GPU dedicada. Al estar cuantizado con group size 64 y simetría, el modelo ocupa aproximadamente 4,5 GB en el repositorio, aunque el número de parámetros reportado en los safetensors es de 1.150.798.848, una cifra inferior a la esperada para un modelo de 3B, lo que sugiere que podría tratarse de una versión reducida o de una discrepancia en el conteo. No se dispone de más detalles sobre la arquitectura interna del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como tipo Llama, causal LM) |
| Parametros totales | 1.150.798.848 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, group size 64, simétrica (AutoRound) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoRound) |

## Arquitectura y entrenamiento

El modelo base es Falcon3-3B-Instruct, un modelo de lenguaje causal de tipo Llama según las etiquetas del repositorio, aunque no se proporcionan detalles adicionales sobre su arquitectura (número de capas, dimensiones, etc.). La cuantización se ha realizado con el framework Intel AutoRound, que implementa el algoritmo SignRound para cuantización solo de pesos (weights-only quantization). El proceso se ejecutó en CPU con torch en bfloat16, utilizando 128 muestras de calibración, 200 iteraciones de ajuste, una longitud de secuencia de 512 tokens y un tamaño de lote de 4. La duración total de la cuantización fue de aproximadamente 292,8 minutos. No se indica el dataset de calibración utilizado ni si se aplicaron técnicas como RLHF o DPO sobre el modelo base.

## Capacidades

- Generación de texto en inglés, con soporte para instrucciones y conversación multi-turno mediante la plantilla de chat integrada.
- Inferencia optimizada para hardware Intel: CPU, iGPU Arc (a través de intel-extension-for-pytorch) y NPU (AI Boost en Core Ultra, mediante OpenVINO).
- Cuantización 4-bit que reduce el uso de memoria y acelera la inferencia entre 2 y 3 veces respecto al modelo original, según el autor.
- Compatible con la librería transformers y el pipeline de generación de texto.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional en dispositivos edge: al ser una cuantización 4-bit, puede ejecutarse en equipos con poca memoria RAM o VRAM, como portátiles con CPU Intel integrada, permitiendo desplegar un chatbot local sin conexión.
- Generación de texto en tiempo real en CPU: gracias a la aceleración de 2-3x, es adecuado para aplicaciones que requieren respuestas rápidas en entornos sin GPU, como sistemas de autocompletado o redacción asistida.
- Prototipado de aplicaciones NLP en entornos de desarrollo: al ser un modelo pequeño y ligero, facilita la experimentación con generación de texto en máquinas de desarrollo sin necesidad de hardware especializado.
- Inferencia en iGPU Intel Arc: puede aprovechar la aceleración por hardware en equipos con gráficos integrados Arc, útil para aplicaciones de escritorio que necesiten procesamiento local de lenguaje.
- Despliegue en NPU de Intel Core Ultra: orientado a dispositivos con NPU AI Boost, permitiendo ejecutar el modelo con bajo consumo energético en portátiles de última generación.
- Integración en pipelines de generación de texto con transformers: al ser compatible con la API estándar, puede sustituir al modelo original en flujos existentes, reduciendo los requisitos de memoria sin cambios de código significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM o RAM en la documentación del modelo.
- Al ser una cuantización 4-bit de un modelo de aproximadamente 1,15 mil millones de parámetros, se estima que el uso de memoria en inferencia es inferior a 1 GB, aunque este dato no está confirmado por el autor.
- Está diseñado para ejecutarse en CPU Intel, iGPU Arc (con intel-extension-for-pytorch) y NPU de Intel Core Ultra (con OpenVINO).
- No se indica compatibilidad con GPU NVIDIA o AMD, aunque podría funcionar con transformers estándar.
- Opciones de despliegue: se puede cargar con `AutoModelForCausalLM` de transformers, y es probable que sea compatible con frameworks como vLLM o llama.cpp, aunque no se menciona explícitamente.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- La cuantización 4-bit puede provocar una pérdida de precisión leve en comparación con el modelo original, especialmente en tareas que requieren razonamiento complejo.
- El modelo solo soporta inglés, por lo que no es adecuado para aplicaciones multilingües.
- No se han documentado sesgos específicos, pero al ser una versión cuantizada de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado por la cuantización.
- El autor declara que el modelo se ha desarrollado únicamente con fines de investigación y no ofrece garantía alguna.
- No se dispone de información sobre la longitud de contexto máxima soportada, lo que limita su uso en tareas que requieran ventanas largas.
- El número de parámetros reportado (1.150.798.848) difiere del esperado para un modelo de 3B, lo que podría indicar una discrepancia en el conteo o una versión reducida; se recomienda verificar antes de su uso en producción.

## Enlaces

- [Hugging Face - fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int4-gs64-sym](https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int4-gs64-sym)
- [Modelo base - tiiuae/Falcon3-3B-Instruct](https://huggingface.co/tiiuae/Falcon3-3B-Instruct)
- [Intel AutoRound (GitHub)](https://github.com/intel/auto-round)
