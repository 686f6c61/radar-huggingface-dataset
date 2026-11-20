# Creekside/llama-3.2-1B-lambda-fft_a

## Resumen

Creekside/llama-3.2-1B-lambda-fft_a es un ajuste fino (fine-tuning) del modelo Llama 3.2 de 1B parÃ¡metros de Meta, publicado por el usuario Creekside en Hugging Face. Se trata de un experimento de entrenamiento muy concreto y de alcance limitado: el autor lo describe explÃcitamente como "small model, really specific training experiment", lo que indica que no estÃ¡ pensado como un modelo de propÃ³sito general sino como una prueba de concepto sobre datos de preguntas y respuestas.

El modelo parte de la arquitectura Llama 3.2 1B (transformer decoder-only denso, 1.235.814.400 parÃ¡metros reales segÃºn los pesos en safetensors) y se ha entrenado mediante QLoRA con rango y alpha ambos a 16, durante 2 epochs, sobre una GPU G4. El resultado se distribuye en precisiÃ³n FP16 (16 bits) y con licencia Apache 2.0.

Su relevancia es reducida fuera del Ã¡mbito del experimento: no se documentan benchmarks, no se detalla la composiciÃ³n del dataset mÃ¡s allÃ¡ de dos variantes ("alpha" y "alpha con el campo Question sustituido por el campo reasoning") y el Ãºnico idioma declarado es el inglÃ©s. Resulta Ãºtil como referencia para quienes quieran reproducir un pipeline de fine-tuning ligero con Unsloth y TRL sobre Llama 3.2 1B, mÃ¡s que como modelo listo para producciÃ³n.

## Especificaciones tÃ©cnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), denso |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglÃ©s) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 1B: un transformer decoder-only denso con atenciÃ³n por grupos (GQA) y las innovaciones propias de la familia Llama 3.2, aunque la model card no detalla la configuraciÃ³n exacta de capas, cabezas ni dimensiÃ³n oculta. Los pesos publicados suman 1.235.814.400 parÃ¡metros, coherente con el tamaÃ±o de 1B de la familia base.

El entrenamiento se realizÃ³ mediante QLoRA (cuantizaciÃ³n de 4 bits con adaptadores de bajo rango), con rango y alpha configurados a 16, durante 2 epochs, sobre una GPU G4. El autor menciona dos variantes del dataset: la "alpha", compuesta por preguntas y respuestas, y la "alpha excepto que el campo Question se ha sustituido por el campo reasoning". No se especifica el nÃºmero de tokens de entrenamiento, la composiciÃ³n exacta del dataset ni si hubo fases de RLHF o DPO. El entrenamiento se acelerÃ³ con Unsloth y la librerÃa TRL de Hugging Face, y el resultado se subiÃ³ en FP16.

## Capacidades

- GeneraciÃ³n de texto conversacional en inglÃ©s, segÃºn la etiqueta `conversational` del repositorio.
- Respuesta a preguntas y respuestas (QA), dado que el dataset de entrenamiento se basa en pares de pregunta y respuesta.
- Razonamiento bÃ¡sico derivado de la variante de dataset que sustituye la pregunta por el campo de razonamiento.
- Compatible con `text-generation-inference` y `transformers`, segÃºn las etiquetas del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visiÃ³n, audio ni modo de pensamiento explÃcito.
- Capacidad multilingÃ¼e limitada al inglÃ©s declarado.

## Casos de uso

- Prototipado rÃ¡pido de asistentes de QA en inglÃ©s: al estar entrenado sobre pares pregunta-respuesta, puede usarse como base para un chatbot sencillo de dominio acotado, aunque sin garantÃas de calidad fuera del dataset de entrenamiento.
- ReproducciÃ³n de experimentos de fine-tuning: sirve como referencia para validar un pipeline QLoRA con Unsloth y TRL sobre Llama 3.2 1B, comparando hiperparÃ¡metros (rango 16, alpha 16, 2 epochs).
- EducaciÃ³n y formaciÃ³n: Ãºtil para demostrar cÃ³mo se ajusta un modelo pequeÃ±o con recursos limitados (GPU G4) y cÃ³mo se publican los pesos en FP16.
- GeneraciÃ³n de texto ligera en entornos con restricciones de hardware: con 1.2B parÃ¡metros, puede ejecutarse en GPUs de consumo y en CPU con cuantizaciÃ³n adicional (aunque esta no se distribuya oficialmente).
- Base para experimentos de sustituciÃ³n de campos en datasets: la variante "reasoning" permite estudiar cÃ³mo afecta al comportamiento del modelo reemplazar la pregunta por una traza de razonamiento.
- EvaluaciÃ³n comparativa de tÃ©cnicas de ajuste: puede emplearse como punto de partida para medir el impacto de distintas configuraciones de QLoRA frente al modelo base Llama 3.2 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,5 GB solo para los pesos (1.235.814.400 parÃ¡metros Ã— 2 bytes), mÃ¡s overhead de activaciones y cachÃ© KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; una NVIDIA T4, RTX 3060 o superior es suficiente. Para cuantizaciÃ³n a 8 bits o 4 bits, bastarÃa con GPUs de 2-3 GB.
- Cabe en GPU de consumo: sÃ, en modelos como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (estos Ãºltimos requerirÃan convertir los pesos a GGUF, no incluido en el repositorio).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1B, se espera una latencia baja en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Creekside/llama-3.2-1B-lambda-fft_a | 1,235B | no disponible | apache-2.0 | Hugging Face |
| meta-llama/Llama-3.2-1B | 1,24B | 128K (segÃºn Meta) | Llama 3.2 Community License | Hugging Face, ampliamente adoptado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K (segÃºn Meta) | Llama 3.2 Community License | Hugging Face, orientado a instrucciones |
| Qwen2.5-1.5B | 1,54B | 32K (segÃºn Qwen) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo de Creekside, por lo que la comparaciÃ³n se limita a parÃ¡metros, contexto y licencia. El modelo base Llama 3.2 1B y su variante Instruct cuentan con documentaciÃ³n oficial de Meta y benchmarks publicados, mientras que este fine-tuning no los aporta.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un "experimento de entrenamiento muy especÃfico", sin garantÃas de calidad general.
- Riesgo elevado de alucinaciÃ³n: al estar ajustado sobre un dataset acotado de QA, puede generar respuestas plausibles pero incorrectas fuera de ese dominio.
- Idiomas: solo se declara inglÃ©s; el rendimiento en castellano u otros idiomas no estÃ¡ garantizado.
- Contexto: no se documenta la longitud de contexto efectiva; aunque el modelo base soporta ventanas amplias, el fine-tuning puede degradar el uso de contexto largo.
- Sesgos: no se documenta ninguna evaluaciÃ³n de sesgos; al heredar de Llama 3.2, puede reproducir sesgos presentes en los datos originales y en el dataset de ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que los datos de entrenamiento no impongan restricciones adicionales (no documentadas).
- ProducciÃ³n: no se recomienda su uso en producciÃ³n sin una evaluaciÃ³n previa exhaustiva, dado que no hay benchmarks ni documentaciÃ³n tÃ©cnica detallada.
- El campo `base_model` apunta al propio repositorio, lo que puede indicar un error de configuraciÃ³n en la model card y dificultar la trazabilidad del modelo base real.

## Enlaces

- [Hugging Face: Creekside/llama-3.2-1B-lambda-fft_a](https://huggingface.co/Creekside/llama-3.2-1B-lambda-fft_a)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://huggingface.co/docs/trl)
- [Llama 3.2 en Meta](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)
