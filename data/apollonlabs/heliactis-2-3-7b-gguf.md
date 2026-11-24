# ApollonLabs/Heliactis-2-3.7B-GGUF

## Resumen

Heliactis-2-3.7B es un ajuste fino (fine-tune) del modelo base IFM/K2-Horizon-3.7B, desarrollado por el Institute of Foundation Models (MBZUAI), publicado por Apollon Labs. El objetivo declarado del ajuste es mejorar la calidad del griego escrito y preservar la integridad en la generacion de codigo, partiendo de un modelo base totalmente abierto de 3.700 millones de parametros. Se distribuye en formato GGUF para su uso con llama.cpp.

El modelo se presenta como parte de una familia denominada Heliactis (los "rayos"), en contraposicion a los modelos Helios (el "sol"), de mayor tamano. La ficha tecnica se centra en un unico artefacto cuantizado en Q8_0 como opcion por defecto, con una version BF16 a precision completa. El repositorio ocupa 23,3 GB e incluye unicamente pesos en formato GGUF.

La relevancia actual del modelo radica en su enfoque bilingue griego-ingles con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El autor publica mediciones comparativas frente al modelo base en conocimiento general, calidad del griego, HumanEval y recuperacion en contexto largo, aunque con un conjunto de evaluacion reducido que el propio autor reconoce como limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon (requiere llama.cpp b11454 o superior) |
| Parametros totales | 3.700 millones (3.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens segun `max_position_embeddings`; medido solo hasta 16K |
| Tipos de cuantizacion | Q8_0, BF16 (Q6_K, Q5_K_M y Q4_K_M en medicion) |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el repo base ApollonLabs/Heliactis-2-3.7B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura K2-Horizon del modelo base IFM/K2-Horizon-3.7B. La model card no detalla la estructura interna (tipo de atencion, capas, mecanismos de atencion lineal o hibridos), por lo que esa informacion no esta disponible en la documentacion proporcionada. El autor indica que la arquitectura soporta una longitud maxima de posicion de 524.288 tokens, aunque las pruebas de recuperacion en contexto largo solo se realizaron hasta 16K.

El ajuste fino se realizo mediante LoRA con rango 16 y alpha 32 sobre todas las capas de proyeccion, con learning rate 2e-4 y scheduler coseno, durante 3 epocas. Se conservo unicamente la epoca 1 y se fusiono a media intensidad (alpha 16 en lugar de 32), ya que a intensidad completa el modelo perdia conocimiento general (7/30 frente a 10/30 del base). La perdida de evaluacion paso de 1.0917 a 0.6515. El entrenamiento se ejecuto en fp16 sobre 2x T4 de Kaggle con DDP durante 64 minutos. El dataset consta de 2.014 ejemplos (griego, codigo y tool calling) con perdida calculada solo sobre la respuesta. El sha256 del dataset es `80e47fd2b37d2bea66d219045f3fb8b25beb64a1e32159abecb84223240d2547`.

## Capacidades

- Generacion de texto en griego e ingles, con mejora medible en calidad del griego escrito respecto al modelo base.
- Generacion de codigo: HumanEval pass@1 de 81,7% con thinking off.
- Tool calling / function calling: el dataset de entrenamiento incluye ejemplos de tool calling.
- Modo thinking con control de esfuerzo (`reasoning_effort`), con recomendacion de usar "off" o "low".
- Recuperacion en contexto largo: 8/8 en pruebas needle a 4K y 16K tokens.
- Conocimiento general en griego: 12/30 en preguntas cortas de hechos.
- Soporte multilingue limitado a griego e ingles.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Generacion de contenido editorial en griego: el modelo produce texto en griego con menos errores gramaticales que el base, adecuado para borradores que luego se revisan. Requiere correccion humana por errores gramaticales residuales.
- Asistencia de codigo en pipelines de desarrollo: con un pass@1 de 81,7% en HumanEval y soporte de tool calling, puede integrarse en entornos de autocompletado o generacion de funciones en Python.
- Integracion de herramientas mediante function calling: los ejemplos de tool calling en el entrenamiento permiten usarlo en flujos que invocan APIs o funciones externas.
- Procesamiento de documentos largos en griego e ingles: con contexto medido hasta 16K y recuperacion 8/8, sirve para resumen y extraccion sobre documentos de hasta esa longitud.
- Despliegue local en hardware de consumo: el quant Q8_0 de 5,02 GiB cabe en GPUs consumer con 8 GB o mas de VRAM, permitiendo inferencia local sin conexion.
- Chatbot bilingue griego-ingles de bajo coste: el tamano de 3.7B y la licencia Apache 2.0 permiten desplegar el modelo en entornos con recursos limitados y uso comercial.
- Traduccion y adaptacion de contenido entre griego e ingles: el modelo maneja ambos idiomas, aunque no se documenta calidad de traduccion especifica.

## Benchmarks y rendimiento

Los datos provienen de la model card, medidos con temperatura 0 sobre el build Q8_0, comparando modelo base y fine-tune con los mismos flags.

| Test | IFM/K2-Horizon-3.7B | Heliactis 2 |
|---|---|---|
| Conocimiento general, 30 preguntas cortas en griego | 10/30 | 12/30 |
| Puntuacion griego, thinking off (3 ejecuciones) | 75,0 · 74,8 · 74,8 | 78,3 · 76,9 · 76,9 |
| Puntuacion griego, effort low | 56,4 | 77,5 |
| HumanEval pass@1, thinking off | 128/164 (78,0%) | 134/164 (81,7%) |
| Recuperacion en contexto largo 4K + 16K, thinking off | 8/8 | 8/8 |

El autor advierte que la prueba de griego consta de 18 prompts y la subpuntuacion de significado de 11 items, por lo que detecta colapsos y ganancias claras, no cambios pequenos. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 5,02 GiB de pesos; BF16 requiere 9,43 GiB.
- GPU recomendadas: el entrenamiento se realizo en 2x T4 (16 GB cada una). Para inferencia, cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar el Q8_0.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para Q8_0 (por ejemplo RTX 3060 Ti, RTX 4060, RTX 3070). El BF16 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp (requiere build b11454 o superior por la arquitectura k2-horizon), usando `llama-server -m <modelo> --jinja -c 16384`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heliactis-2-3.7B | 3.7B | 524.288 (medido 16K) | Apache 2.0 | GGUF, safetensors | Fine-tune bilingue griego-ingles |
| IFM/K2-Horizon-3.7B (base) | 3.7B | 524.288 | Apache 2.0 | safetensors | Modelo base, peor griego y HumanEval |
| Otros modelos de ~3-4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Persisten errores gramaticales en griego, aunque en menor numero que en el base; el autor recomienda revisar cualquier texto antes de publicarlo.
- El conjunto de evaluacion es reducido (18 prompts de griego, 11 items de significado, 30 preguntas de conocimiento), por lo que no detecta cambios pequenos de calidad.
- El modo `reasoning_effort: high` no cierra el razonamiento dentro de un presupuesto practico: con limite de 10.000 tokens muchas respuestas vuelven vacias. El autor recomienda evitar ese modo.
- La recuperacion en contexto largo solo se midio hasta 16K tokens, pese a que la arquitectura soporta 524.288; no hay garantia de rendimiento mas alla de lo medido.
- El modelo no fue entrenado con datos de autoidentidad; si la identidad importa, debe fijarse en el system prompt.
- Riesgo de alusionacion no cuantificado en la documentacion; el conocimiento general es bajo (12/30).
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y debe mantenerse la atribucion correspondiente.
- Requiere llama.cpp b11454 o superior; versiones anteriores no soportan la arquitectura k2-horizon.
- Solo soporta griego e ingles; no se documenta cobertura de otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B-GGUF
- Modelo base en safetensors: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B
- Modelo original: https://huggingface.co/IFM/K2-Horizon-3.7B
- Insignia del proyecto: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B-GGUF/resolve/main/insignia.svg
