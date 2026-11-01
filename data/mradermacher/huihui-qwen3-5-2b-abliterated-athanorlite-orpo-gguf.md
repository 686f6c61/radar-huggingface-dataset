# mradermacher/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO-GGUF

## Resumen

Esta ficha describe `mradermacher/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO-GGUF`, una publicacion de cuantizaciones GGUF estaticas del modelo `nbeerbower/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO`. No es un modelo entrenado desde cero por mradermacher, sino una conversion a formato GGUF de un modelo derivado de la familia Qwen3.5 de 2B de parametros, sometido a un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) y posteriormente afinado con ORPO sobre el dataset `schneewolflabs/Athanorlite-DPO`. El resultado es un modelo pequeno, multimodal (image-text-to-text) y orientado a conversacion, distribuido en multiples niveles de cuantizacion.

El interes practico de esta publicacion es la accesibilidad: con 1.881.825.088 parametros totales (aproximadamente 1,88 mil millones) y cuantizaciones que van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16), el modelo puede ejecutarse en hardware de consumo. La etiqueta `vision-language-model` y la presencia de ficheros `mmproj` (proyector multimodal) indican soporte de entrada de imagenes, lo que lo situa en la categoria de modelos pequenos con vision.

Conviene senalar que la model card original es extremadamente escasa: no documenta contexto, composicion del dataset de entrenamiento, resultados de benchmarks ni licencia. Toda la informacion tecnica adicional que aparece a continuacion se deriva de los metadatos del repositorio y de las convenciones de la familia Qwen, y se marca explicitamente como "no disponible" cuando no hay dato verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (vision-language), segun tags `image-text-to-text` y `vision-language-model`; detalles de capas y atencion no disponibles |
| Parametros totales | 1.881.825.088 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para la parte multimodal; existen variantes imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples ficheros) y safetensors en el modelo base |
| Tamano del repositorio | 19,1 GB (incluye todas las cuantizaciones) |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Dataset de ajuste | schneewolflabs/Athanorlite-DPO |
| Metodo de ajuste | ORPO (Odd Ratio Preference Optimization) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Qwen3.5 en su variante de 2B, lo que implica un transformer decoder-only con proyector multimodal para procesar imagenes (de ahi los ficheros `mmproj` en la distribucion GGUF). La cadena de derivacion es: un modelo Qwen3.5-2B base, transformado mediante "abliteration" para reducir los comportamientos de rechazo, despues ajustado con ORPO sobre `schneewolflabs/Athanorlite-DPO` y finalmente cuantizado por mradermacher. El tag `grimoire` y `merlina` sugiere que el ajuste se realizo dentro del ecosistema de herramientas de ese autor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de su nombre, ni sobre si hubo fases adicionales de RLHF o DPO aparte del ORPO declarado. La model card no documenta innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento) mas alla de lo heredado del modelo base Qwen3.5, cuyo detalle tampoco se incluye en la informacion proporcionada.

Las cuantizaciones siguen el esquema estandar de llama.cpp: cuantizacion de bloques k-quant para los niveles Q2 a Q6, cuantizacion IQ (importancia) para IQ4_XS, y f16 sin perdida. El autor advierte que Q3_K_M es de "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 por su velocidad, y Q6_K por su calidad. Las variantes imatrix, que suelen ofrecer mejor relacion calidad/tamano, estan en un repositorio separado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagenes junto con texto (image-text-to-text), gracias al proyector multimodal incluido en los ficheros `mmproj`.
- Ajuste ORPO orientado a preferencias, lo que en teoria mejora la alineacion de las respuestas respecto al modelo base.
- "Abliterated": el modelo ha sido modificado para reducir las negativas o rechazos ante peticiones, lo que cambia el perfil de comportamiento respecto al modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano de 2B limita la fiabilidad en tareas agenticas complejas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo "thinking" explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones de 1,3 a 1,5 GB (Q4_K_S, Q4_K_M, Q5_K_M) el modelo cabe en GPUs de consumo y permite iterar rapidamente en el diseno de prompts y flujos conversacionales sin coste de API.
- Descripcion de imagenes en pipelines ligeros: el proyector multimodal permite alimentar imagenes y obtener descripciones o respuestas en ingles; util para etiquetado asistido o accesibilidad en entornos con recursos limitados.
- Experimentacion con modelos "abliterated": investigadores interesados en medir el efecto de la eliminacion de rechazos sobre la calidad y seguridad de las respuestas pueden usar esta version como punto de comparacion frente al modelo alineado.
- Fine-tuning posterior sobre GGUF o safetensors: al estar disponible el modelo base en safetensors y las cuantizaciones en GGUF, sirve como punto de partida para ajustes con LoRA en tareas concretas en ingles.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse localmente con llama.cpp u Ollama, los datos no salen del dispositivo, lo que encaja en escenarios de procesamiento de documentos o imagenes sensibles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantizacion mas dos proyectores multimodales, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un modelo de ~1,9B parametros.
- Educacion y demos: su tamano reducido facilita su uso en talleres, notebooks y demostraciones de vision-language models en portatiles con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,1 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,1-1,3 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~1,3-1,4 GB
  - Q5_K_S / Q5_K_M: ~1,5 GB
  - Q6_K: ~1,7 GB
  - Q8_0: ~2,1 GB
  - f16: ~3,9 GB
  - Proyector multimodal: +0,5 GB (mmproj-Q8_0) o +0,8 GB (mmproj-f16)
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Para f16 y contextos largos, se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone del codigo de la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de ~1,9B en Q4 con una RTX 4090 suele generar decenas de tokens por segundo, pero no se aporta medicion concreta para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO (este) | ~1,88B | no disponible | si (mmproj) | no disponible | GGUF, safetensors |
| Qwen2.5-VL-3B (referencia de la familia Qwen) | ~3B | no disponible en esta ficha | si | no disponible en esta ficha | safetensors, GGUF |
| Llama 3.2 3B Instruct (referencia) | ~3B | no disponible en esta ficha | no | no disponible en esta ficha | safetensors, GGUF |
| SmolVLM-2B (referencia) | ~2B | no disponible en esta ficha | si | no disponible en esta ficha | safetensors, GGUF |

Nota: los datos de los modelos comparativos no se han verificado en la informacion proporcionada y se incluyen solo como referencia de categoria; no deben tomarse como cifras confirmadas. No se dispone de benchmarks comparativos para este modelo.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base `nbeerbower/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO` y de la familia Qwen3.5 antes de cualquier despliegue en produccion.
- El proceso de "abliteration" elimina o reduce los mecanismos de rechazo del modelo, lo que incrementa el riesgo de generar contenido inapropiado, danino o no alineado con politicas de seguridad; no es recomendable para aplicaciones orientadas al publico sin filtros adicionales.
- Modelo de ~1,9B parametros: capacidad limitada de razonamiento complejo, matematicas y codigo en comparacion con modelos de mayor tamano; mayor propension a errores factuales y alucinaciones.
- Solo declarado para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se puede garantizar el manejo de conversaciones o documentos largos.
- El ajuste ORPO sobre un dataset de preferencias concreto puede introducir sesgos de estilo y de contenido no caracterizados.
- La cuantizacion Q3_K_M esta marcada por el autor como de menor calidad; las cuantizaciones por debajo de Q4 degradan notablemente modelos pequenos.
- El repositorio ocupa 19,1 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario y el `mmproj` correspondiente si se usa vision.
- La fecha de creacion y actualizacion del repositorio (2026) y la existencia de un Qwen3.5 deben tomarse como datos del repositorio, no verificados de forma independiente en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO-GGUF
- Modelo base: https://huggingface.co/nbeerbower/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO-i1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/schneewolflabs/Athanorlite-DPO
- Pagina de resumen del autor: https://hf.tst.eu/model#Huihui-Qwen3.5-2B-abliterated-Athanorlite-ORPO-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
