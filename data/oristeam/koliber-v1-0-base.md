# OrisTeam/Koliber-v1.0-Base

## Resumen

Koliber v1.0 Base es un modelo de lenguaje causal (decoder-only) compacto desarrollado por OrisTeam y entrenado desde cero, diseñado principalmente para el idioma polaco. Con 126 millones de parámetros, se posiciona como un modelo base de pretraining, no como un asistente instruido ni un chatbot, y su propósito es servir como punto de partida para fine-tuning supervisado, optimización de preferencias, pretraining continuado e investigación. Su arquitectura incorpora técnicas modernas como GQA, RoPE, SwiGLU y RMSNorm, junto con una innovación destacable: un objetivo auxiliar de predicción de estado oculto futuro que se aplica únicamente durante el entrenamiento.

El modelo fue entrenado con aproximadamente 2.534 millones de tokens, una cifra relativamente modesta que refleja su naturaleza compacta y su enfoque en el polaco. Su ventana de contexto es de 1536 tokens, suficiente para tareas de completado de texto y generación de documentos cortos, pero limitada para aplicaciones que requieran contexto extenso.

La relevancia de Koliber v1.0 Base radica en su carácter de modelo nativo en polaco entrenado desde cero, con una licencia Apache 2.0 que permite uso comercial sin restricciones significativas. Aunque su tamaño es reducido, su diseño arquitectónico y su objetivo auxiliar de entrenamiento lo convierten en un objeto de estudio interesante para investigadores interesados en técnicas de entrenamiento eficiente y en el desarrollo de modelos para lenguas de recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, GQA, RoPE, SwiGLU, RMSNorm |
| Parametros totales | 126.044.928 (126M) segun model card; 150.719.232 segun safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1536 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Polaco (principal), ingles (secundario no declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Koliber v1.0 Base emplea una arquitectura transformer decoder-only con 12 capas, tamaño oculto de 768, 12 cabezas de consulta y 2 cabezas de clave-valor (GQA), dimensión de cabeza de 64, FFN de 3072, y sin sesgos. Utiliza RoPE para codificación posicional, activación SwiGLU y normalización RMSNorm, con LM head atada a los embeddings. El modelo fue entrenado desde cero con aproximadamente 2.534 millones de tokens, principalmente en polaco, en una etapa de pretraining base.

La innovación técnica más destacable es un objetivo auxiliar de predicción de estado oculto futuro aplicado solo durante el entrenamiento. Una cabeza auxiliar aprende a predecir una representación oculta futura aproximadamente 128 tokens por delante, muestreada cada 32 tokens, mediante una proyección de bajo rango de 192 dimensiones y pérdida de distancia coseno. La pérdida auxiliar se aplica con un peso de 0,03: L = L_NTP + 0,03 × L_future. Esta cabeza no forma parte del modelo de inferencia liberado, no añade parámetros en tiempo de inferencia y no es necesaria para cargar o generar con Koliber.

## Capacidades

- Generación de texto y completado de texto en polaco: el modelo está diseñado principalmente para completar prefijos de texto natural, no para seguir instrucciones conversacionales.
- Razonamiento básico y coherencia local: puede mantener coherencia en fragmentos cortos, aunque con limitaciones propias de un modelo de 126M.
- Generación de código y matemáticas: no se declaran capacidades específicas; el entrenamiento se centra en texto general en polaco.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: principalmente polaco; no se declaran otros idiomas de forma oficial.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.
- Modelo base no alineado: no ha pasado por RLHF ni DPO, por lo que no es adecuado como asistente directo.

## Casos de uso

- Completado de texto en polaco: el modelo puede generar continuaciones coherentes a partir de prefijos naturales, adecuado para autocompletado en editores o herramientas de escritura asistida en polaco, gracias a su entrenamiento específico en ese idioma.
- Fine-tuning supervisado para tareas específicas: al ser un modelo base, sirve como punto de partida para entrenar clasificadores, generadores de resúmenes o sistemas de extracción de información en polaco con datasets pequeños.
- Investigación en técnicas de entrenamiento eficiente: su objetivo auxiliar de predicción de estado oculto futuro lo convierte en un caso de estudio para analizar el impacto de objetivos auxiliares en modelos compactos.
- Pretraining continuado en dominios especializados: con 126M de parámetros y contexto de 1536 tokens, puede adaptarse a dominios como legal, médico o técnico mediante continued pretraining con corpus específicos en polaco.
- Generación de datos sintéticos para aumento de datasets: puede producir texto en polaco para aumentar corpus de entrenamiento de otros modelos o para pruebas de robustez.
- Educación e investigación en PLN (procesamiento de lenguaje natural): su tamaño reducido permite ejecutarlo en hardware modesto, facilitando experimentos académicos y docencia sobre modelos de lenguaje.
- Prototipado rápido de aplicaciones de texto en polaco: al ser ligero y con licencia Apache 2.0, permite iterar rápidamente en productos que requieran generación de texto sin grandes inversiones en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 126M de parámetros, en FP16 requiere aproximadamente 0,25 GB de VRAM; en cuantización de 8 bits, unos 0,13 GB; en 4 bits, unos 0,07 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutarlo sin problemas. También funciona en CPU.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (con trust_remote_code=True), llama.cpp (si se convierte a GGUF), Ollama (previa conversión), vLLM (compatibilidad no confirmada), TGI (no confirmado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Koliber v1.0 Base | 126M | 1536 | Apache 2.0 | Polaco | Hugging Face |
| Azurro/APT3-275M-Base | 275M | No disponible | No disponible | Polaco | Hugging Face |
| Otros modelos base polacos de tamaño similar | No disponible | No disponible | No disponible | Polaco | No disponible |

La comparativa se limita a Azurro/APT3-275M-Base, mencionado en la model card como referencia cualitativa. No se dispone de datos de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo base no alineado: no ha pasado por RLHF ni DPO, por lo que puede generar contenido falso, engañoso, ofensivo, sesgado o inseguro.
- Riesgo de alucinación: puede inventar hechos, nombres, citas, fechas, números, fuentes o eventos.
- Limitaciones de contexto: ventana de 1536 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: entrenado principalmente en polaco; su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que se requiere evaluación, filtrado y salvaguardas adicionales antes de desplegarlo en entornos de usuario final o de alto riesgo.
- Caveat de producción: no debe tratarse como fuente factual ni autoritativa; requiere supervisión humana y mecanismos de seguridad específicos.
- Discrepancia en el número de parámetros: la model card indica 126M, mientras que los safetensors reportan 150,7M; esta diferencia podría deberse a la cabeza auxiliar de entrenamiento o a otros componentes no reflejados en la card.

## Enlaces

- Hugging Face: https://huggingface.co/OrisTeam/Koliber-v1.0-Base
- Model card oficial: incluida en el repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios o demos adicionales en la búsqueda web.
