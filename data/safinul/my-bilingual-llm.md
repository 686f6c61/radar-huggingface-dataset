# Safinul/my-bilingual-llm

## Resumen

My Bilingual LLM es un modelo de lenguaje compacto de tipo decoder-only Transformer, desarrollado por Safinul con fines experimentales y educativos. Está diseñado específicamente para la generación de texto en bengalí e inglés, así como para entradas mixtas de ambos idiomas. Con aproximadamente 41,87 millones de parámetros, se trata de un modelo muy pequeño en comparación con los estándares actuales, orientado a la investigación, la experimentación y la demostración de portafolio, no a su uso en producción.

El modelo emplea una arquitectura Transformer causal con 8 capas, 8 cabezas de atención, dimensión de embedding de 512 y un vocabulario de 32 000 tokens. Su longitud de contexto máxima es de 512 tokens, lo que limita su capacidad para tareas que requieran ventanas largas. Aunque el autor no especifica la licencia ni los datos de entrenamiento, el modelo se distribuye en formato PyTorch y su repositorio ocupa aproximadamente 0,2 GB. Su relevancia actual reside en servir como ejemplo práctico de entrenamiento y ajuste de modelos bilingües de bajo coste, especialmente para la lengua bengalí, un idioma con escasa representación en el ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (weight tying habilitado) |
| Parametros totales | 41,87 millones (aproximado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengali (bn), ingles (en), y mezcla de ambos |
| Licencia | no disponible (el autor indica verificar las licencias de datos, tokenizer y dependencias) |
| Formato de pesos | PyTorch (formato de archivo no especificado; probablemente .bin o .safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only estándar, con 8 capas, 8 cabezas de atención, dimensión de embedding de 512 y un vocabulario de 32 000 tokens. Se ha habilitado el weight tying, que comparte los pesos entre la capa de embedding y la capa de salida, una técnica habitual para reducir el número de parámetros en modelos pequeños. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.). El autor no detalla ninguna innovación técnica más allá de la configuración estándar del Transformer.

## Capacidades

- Generación de texto en bengalí e inglés, así como en entradas mixtas de ambos idiomas.
- Modelo causal de lenguaje, capaz de continuar secuencias de texto de hasta 512 tokens.
- Adecuado para experimentos de inferencia y demostraciones educativas sobre el funcionamiento de un Transformer pequeño.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a dos idiomas, con un rendimiento esperablemente inferior al de modelos mucho más grandes.

## Casos de uso

- Investigación académica sobre modelos bilingües de bajo coste: el modelo permite estudiar el comportamiento de un Transformer pequeño entrenado con dos idiomas, analizando transferencia lingüística y fenómenos de code-switching.
- Experimentación en generación de texto en bengalí: dado el escaso número de modelos abiertos para este idioma, puede servir como punto de partida para probar técnicas de ajuste fino o aumentación de datos.
- Demostración de portafolio: el autor lo presenta como demostración de sus habilidades en el entrenamiento de LLMs, por lo que puede usarse como ejemplo en proyectos personales o educativos.
- Enseñanza de arquitecturas Transformer: al ser un modelo pequeño y manejable, es útil para ilustrar conceptos como weight tying, atención multi-cabeza o generación autoregresiva en entornos docentes.
- Pruebas de inferencia en hardware limitado: su tamaño reducido permite ejecutarlo en CPU o en GPUs con poca memoria, facilitando pruebas de latencia y consumo de recursos.
- Evaluación de técnicas de decodificación: los parámetros de generación recomendados (temperature, top_k, top_p, repetition_penalty) pueden ajustarse para estudiar su efecto en la calidad del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene aproximadamente 41,87 millones de parámetros. En precisión fp32, el peso ocupa unos 167 MB; en fp16, unos 84 MB; en int8, unos 42 MB.
- Cabe en cualquier GPU consumer con al menos 1 GB de VRAM, incluyendo modelos como GTX 1060, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU sin problemas para inferencia de baja latencia.
- No se dispone de datos sobre latencia o throughput medidos. Dado su tamaño, se espera una generación rápida incluso en CPU.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede cargarse con la librería transformers de HuggingFace. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque podría adaptarse si se convierte a los formatos adecuados (GGUF, etc.).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos bilingües o de tamaño similar. El autor no proporciona datos de rendimiento ni referencias a modelos comparables. Se puede señalar que, por tamaño, estaría en la categoría de modelos muy pequeños (menos de 100M parámetros), pero sin métricas objetivas no es posible realizar una comparación fiable.

## Limitaciones y advertencias

- El modelo es experimental y no está preparado para producción. El propio autor lo indica explícitamente.
- Generación repetitiva: tiende a repetir frases o secuencias, especialmente en textos largos.
- Coherencia débil en textos extensos: la ventana de contexto de 512 tokens limita la capacidad de mantener el hilo argumental.
- Salida mixta ocasional: puede producir texto que mezcle bengalí e inglés de forma no intencionada.
- Incorrección factual: puede generar afirmaciones falsas o inventadas, como es común en modelos pequeños.
- Secuencias numéricas inusuales: muestra dificultades con números y cálculos.
- Errores gramaticales: la calidad gramatical no es fiable, especialmente en bengalí.
- Licencia no especificada: no se puede garantizar el uso comercial sin verificar las licencias de los datos de entrenamiento, el tokenizer y las dependencias.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado con datos desconocidos, es probable que herede sesgos de su corpus.

## Enlaces

- HuggingFace: https://huggingface.co/Safinul/my-bilingual-llm
