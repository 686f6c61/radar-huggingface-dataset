# ParavisseOfPervasive/arabic-llm-50m-v3

## Resumen

Arabic LLM 50M (v3) es un modelo de lenguaje de tipo Llama entrenado desde cero por el usuario ParavisseOfPervasive sobre un corpus de Wikipedia en arabe. Con aproximadamente 50 millones de parametros, 8 capas, dimension oculta de 512 y una ventana de contexto de solo 512 tokens, se posiciona como un experimento educativo mas que como una herramienta de produccion. La arquitectura sigue el esquema Llama clasico (SwiGLU, RMSNorm y RoPE) e incorpora un tokenizador con vocabulario de 32.000 entradas.

El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para el ecosistema litgpt: los pesos se cargan mediante `litgpt.config.Config` y `litgpt.model.GPT` a partir del fichero `model.pt`. El autor lo describe explicitamente como "experimental y educativo", sin garantias de coherencia logica, y documenta un historial de iteraciones (v1, v2, v3) en el que cada version mejora gradualmente la calidad de las frases generadas.

Su relevancia actual es limitada desde el punto de vista practico: sirve como referencia para quienes quieran reproducir un pipeline de entrenamiento de un LLM arabe de juguete en hardware modesto (una T4 gratuita de Google Colab) y como ejemplo de las limitaciones de los modelos de muy bajo parametraje sobre idiomas con morfologia rica como el arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (SwiGLU + RMSNorm + RoPE) |
| Parametros totales | ~50 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch), tokenizador en ficheros separados, `config.json` |
| Capas | 8 |
| Dimension oculta | 512 |
| Cabezas de atencion | 8 |
| Vocabulario | 32.000 tokens |
| Datos de entrenamiento | Wikipedia arabe (30.000 articulos) |
| Pasos de entrenamiento | 4.000 (en dos etapas) |
| Hardware de entrenamiento | GPU T4 gratuita de Google Colab |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con las innovaciones habituales de la familia Llama: activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y codificacion posicional rotatoria (RoPE). Consta de 8 capas con dimension oculta de 512 y 8 cabezas de atencion, lo que da un modelo denso de aproximadamente 50 millones de parametros. El tokenizador utiliza un vocabulario de 32.000 entradas, adecuado para la morfologia del arabe pero sin mas detalles publicados sobre su construccion.

El entrenamiento se realizo desde cero sobre 30.000 articulos de Wikipedia en arabe, en 4.000 pasos repartidos en dos etapas, segun la model card. No se documenta el numero total de tokens procesados, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor registra tres iteraciones: v1 (5.000 muestras, 500 pasos) producia palabras sin sentido; v2 (15.000 muestras, 2.000 pasos) generaba palabras reales pero frases inconexas; v3 (30.000 muestras, 2.000 pasos adicionales) alcanza ocasionalmente frases historicas coherentes. Todo el entrenamiento se ejecuto en una GPU T4 gratuita de Google Colab.

## Capacidades

- Generacion de texto en arabe a nivel de frase corta, con coherencia limitada segun el propio autor.
- Modelado de lenguaje base: no dispone de ajuste por instrucciones ni de alineacion conversacional.
- Capacidad de continuacion de texto sobre tematica historica y enciclopedica, derivada del corpus de Wikipedia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: unicamente arabe.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Docencia y aprendizaje: reproducir el pipeline completo de entrenamiento de un LLM desde cero con litgpt en una T4 de Colab, usando este modelo como referencia de configuracion y de curva de mejora entre versiones.
- Investigacion sobre tokenizacion del arabe: analizar como un vocabulario de 32.000 tokens y solo 4.000 pasos de entrenamiento afectan a la morfologia y a la segmentacion de palabras arabes.
- Generacion de texto de relleno en arabe para pruebas de interfaz: producir cadenas con apariencia de texto enciclopedico para maquetas y tests de UI donde no se requiere correccion factual.
- Experimentos de destilacion o inicializacion: usar los pesos como punto de partida de modelos mayores o como alumno en ejercicios de destilacion sobre corpus arabes.
- Evaluacion de tecnicas de cuantizacion en modelos diminutos: medir el impacto de la cuantizacion en un modelo de 50M con contexto de 512 tokens antes de escalar a modelos mayores.
- Benchmark de infraestructura de inferencia: probar integraciones con litgpt o llama.cpp en un modelo pequeno para validar pipelines de despliegue antes de moverlos a modelos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 200 MB de pesos, mas overhead de activaciones y tokenizador; cabe holgadamente en cualquier GPU consumer.
- En fp16/bf16: en torno a 100 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) e incluso CPU para inferencia puntual; el autor lo entreno en una T4 gratuita de Colab.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y tambien en iGPU y CPU.
- Opciones de despliegue: litgpt (via `litgpt.config.Config` y `litgpt.model.GPT` con `model.pt`); no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arabic LLM 50M v3 | ~50M | 512 | ar | Apache 2.0 | Hugging Face (24 descargas) |
| Modelos arabes de referencia (p. ej. Jais, AceGPT) | miles de millones | 2K-8K+ | ar, en | variables | Hugging Face |
| Modelos multilingues pequenos (p. ej. distilgpt2, Qwen 0.5B) | 82M-500M | 1K-32K | multi | variables | Hugging Face |

No se dispone de datos de rendimiento comparativo publicados para este modelo; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo explicitamente experimental y educativo: el autor advierte que no esta listo para uso en produccion.
- Coherencia logica muy limitada por el tamano (50M) y por el escaso entrenamiento (4.000 pasos sobre 30.000 articulos).
- Ventana de contexto de solo 512 tokens, insuficiente para tareas de contexto largo.
- Riesgo elevado de alucinacion y de generar frases gramaticalmente plausibles pero factualmente incorrectas.
- Entrenado unicamente sobre Wikipedia arabe: sesgos tematicos y de cobertura enciclopedica, con escasa presencia de registro coloquial o dominios especializados.
- Sin ajuste por instrucciones ni alineacion: no responde a prompts conversacionales de forma fiable.
- Idiomas: solo arabe; no se ha validado su comportamiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable ese escenario en la practica.
- No se documentan tecnicas de mitigacion de sesgos, filtrado de datos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/ParavisseOfPervasive/arabic-llm-50m-v3
- Repositorio litgpt (framework de carga y entrenamiento): https://github.com/Lightning-AI/litgpt
- Dataset de referencia (Wikipedia): https://huggingface.co/datasets/wikipedia
