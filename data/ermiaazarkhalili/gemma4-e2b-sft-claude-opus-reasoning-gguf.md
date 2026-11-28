# ermiaazarkhalili/Gemma4-E2B-SFT-Claude-Opus-Reasoning-GGUF

## Resumen

Gemma4-E2B-SFT-Claude-Opus-Reasoning-GGUF es la version cuantizada en formato GGUF de un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base google/gemma-4-E2B-it. Lo desarrolla el usuario independiente ermiaazarkhalili y su proposito declarado es el de un modelo de razonamiento destilado: el ajuste se entrena sobre un dataset privado denominado claude-reasoning-distillation, orientado a imitar trazas de razonamiento de un modelo mayor. El resultado es un modelo de generacion de texto de aproximadamente 4.630 millones de parametros, empaquetado en seis cuantizaciones GGUF para su uso con llama.cpp y Ollama.

La relevancia de esta ficha es limitada y conviene ser explicitos: se trata de un checkpoint sin evaluacion de benchmarks, con cero descargas y cero likes en el momento de la consulta, y con un dataset de entrenamiento privado no auditable. El interes tecnico esta en que demuestra un flujo completo de destilacion de razonamiento sobre un modelo pequeno de la familia Gemma 4 y su empaquetado en GGUF para inferencia local, no en un rendimiento verificado.

No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni las caracteristicas arquitectonicas especificas del modelo base en la documentacion proporcionada; estos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-E2B-it); detalles no disponibles |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos completos en el repo hermano Gemma4-E2B-SFT-Claude-Opus-Reasoning |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it y se obtiene mediante ajuste fino supervisado con LoRA, usando las librerias PEFT y TRL sobre Transformers. Los adaptadores LoRA se fusionaron en los pesos base, de modo que el modelo resultante no puede separarse del ajuste. El entrenamiento se ejecuto de forma no interactiva con papermill en una particion SLURM con GPU H100, segun el notebook sft_distillation_gemma4.ipynb citado en la model card.

Los datos de entrenamiento provienen de ermiaazarkhalili/claude-reasoning-distillation, un dataset privado del que no se publica composicion, numero de tokens ni proceso de filtrado. No consta RLHF ni DPO; el unico metodo documentado es SFT con LoRA. Tampoco se documentan innovaciones arquitectonicas propias: el checkpoint hereda la arquitectura del modelo base y anade unicamente el comportamiento aprendido durante el ajuste.

## Capacidades

- Generacion de texto en ingles y, presumiblemente, en los idiomas del modelo base (no confirmado).
- Razonamiento estilo cadena de pensamiento, inducido por destilacion sobre trazas de un modelo mayor.
- Seguimiento de instrucciones, heredado del modelo -it base y reforzado con el dataset de SFT.
- Soporte de tool calling y function calling: no documentado; depende del modelo base y no se ha verificado.
- Soporte de agentes y razonamiento multi-paso: no verificado; el entrenamiento en razonamiento sugiere cierta aptitud, pero no hay evaluacion.
- Capacidades multimodales, de vision o audio: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no documentado como funcionalidad separada.

## Casos de uso

- Prototipado local de razonamiento: con la cuantizacion q4_k_m (3,42 GB) el modelo cabe en GPUs de consumo y permite experimentar con generacion de cadenas de razonamiento sin coste de API.
- Asistentes de linea de comandos: integrable en Ollama o llama.cpp para tareas de explicacion de codigo y resumen tecnico en entornos sin conexion.
- Educacion y demostraciones: util para mostrar en un taller como se destila razonamiento de un modelo grande a uno pequeno y como se empaqueta en GGUF.
- Generacion de borradores de documentacion tecnica: el ajuste sobre instrucciones permite redactar explicaciones breves, como el ejemplo de gradient checkpointing de la propia model card.
- Investigacion sobre SFT y LoRA: sirve como punto de partida reproducible para comparar estrategias de destilacion sobre la familia Gemma 4.
- Despliegue en hardware modesto: las cuantizaciones q2_k y q3_k_m (2,98 y 3,19 GB) permiten ejecucion en CPU o GPUs con poca VRAM para pruebas de latencia y calidad.
- Base para nuevos ajustes: al estar en apache-2.0, puede reutilizarse como punto de partida para fine-tunes adicionales, aunque el autor advierte que los adaptadores ya estan fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion sobre este checkpoint y que las unicas cifras reportadas son observaciones de perdida de entrenamiento, que no se detallan.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con q2_k, 3,4 GB con q4_k_m y 5 GB con q8_0, mas el overhead de contexto de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para margen holgado.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas para q4_k_m; las cuantizaciones q2_k y q3_k_m permiten incluso ejecucion en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama mediante Modelfile, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|
| Gemma4-E2B-SFT-Claude-Opus-Reasoning-GGUF | 4,63 B | no disponible | apache-2.0 | GGUF | no |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible en esta ficha | safetensors y otros | no disponible en esta ficha |
| Gemma4-E2B-SFT-Claude-Opus-Reasoning (repo hermano) | 4,63 B | no disponible | apache-2.0 | pesos completos | no |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato. No se identifican en la documentacion alternativas de razonamiento destilado directamente comparables.

## Limitaciones y advertencias

- Sin evaluacion: no hay benchmarks, por lo que no puede afirmarse ningun nivel de calidad frente al modelo base.
- Dataset privado: el corpus de destilacion no es auditable, lo que impide verificar sesgos, calidad o posibles contaminaciones.
- Sesgos heredados: asume los sesgos, el corte de conocimiento y los modos de fallo de google/gemma-4-E2B-it.
- Fuera de distribucion: el ajuste se hizo sobre un unico dataset de instrucciones; el comportamiento en dominios no cubiertos no esta probado.
- Alucinacion: sin evaluacion de fidelidad, el riesgo de alucinacion es el del modelo base y no puede cuantificarse.
- Adaptadores fusionados: no es posible separar el ajuste de los pesos base, lo que limita la reutilizacion modular.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-E2B-it, que no se detallan en esta informacion.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ermiaazarkhalili/Gemma4-E2B-SFT-Claude-Opus-Reasoning-GGUF
- Pesos completos: https://huggingface.co/ermiaazarkhalili/Gemma4-E2B-SFT-Claude-Opus-Reasoning
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
