# F606F/Gemma3-12B-Slovak-DarkRPG-LoRA

## Resumen

Gemma3-12B-Slovak-DarkRPG-LoRA es un adaptador LoRA publicado por el usuario F606F sobre el modelo base braindao/gemma-3-12b-it-uncensored, que a su vez deriva de la familia Gemma 3 de Google. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, y está pensado para cargarse junto al modelo base mediante las librerías transformers y PEFT. El nombre sugiere un ajuste orientado a eslovaco y a un dominio de rol oscuro (DarkRPG), aunque la model card no documenta el dataset ni el proceso de entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 con 12 mil millones de parámetros y ventana de contexto larga, aunque la ficha del autor no detalla estos valores. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, pero conviene verificar la licencia del modelo base original de Google, ya que el adaptador no puede relajar las restricciones del modelo subyacente.

Su relevancia es limitada por ahora: cero descargas, cero likes y una model card mínima que no aporta benchmarks, composición del dataset ni detalles de entrenamiento. Es un artefacto experimental de un autor individual, útil solo como referencia para quien quiera reproducir un fine-tuning similar con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B) |
| Parametros totales | 12B en el modelo base; el adaptador LoRA no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Gemma 3 12B soporta contexto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado); el nombre sugiere eslovaco, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre braindao/gemma-3-12b-it-uncensored, un fine-tuning del Gemma 3 12B instruct de Google. La arquitectura subyacente es un transformer decoder-only con atención multi-cabeza y las innovaciones propias de Gemma 3 (atención local/global intercalada y ventana de contexto extendida), aunque la model card no reproduce estos detalles. El adaptador en sí es un LoRA de bajo rango, por lo que solo modifica un subconjunto de matrices de pesos y mantiene congelado el resto del modelo base.

El entrenamiento se realizó con Unsloth, según indica el autor, lo que implica un fine-tuning supervisado (SFT) con TRL sobre el modelo base. No se especifica el número de tokens, la composición del dataset, si hubo RLHF/DPO ni hiperparámetros como rango, alpha o learning rate. Tampoco se documenta si se aplicó alguna técnica de decodificación especulativa o atención lineal adicional.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Gemma 3 12B instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente conservados del modelo base.
- Capacidad multilingüe limitada al inglés según la model card, aunque el nombre sugiere un ajuste hacia eslovaco no verificado.
- Posible especialización en narrativa de rol oscuro (DarkRPG) por el nombre del adaptador, sin documentación que lo respalde.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: no disponible (el modelo base Gemma 3 es multimodal, pero el adaptador no lo declara).
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Experimentación con fine-tuning LoRA: sirve como ejemplo práctico de cómo adaptar un Gemma 3 12B con Unsloth y TRL para un dominio concreto, útil para desarrolladores que quieran replicar el pipeline.
- Generación de narrativa de rol: si el ajuste cumple lo que sugiere el nombre, podría usarse para campañas de rol de mesa o ficción interactiva, aunque no hay evaluación que lo confirme.
- Investigación sobre adaptadores de bajo rango: permite estudiar cómo un LoRA de 0,3 GB modifica el comportamiento de un modelo de 12B sin reentrenar todos los pesos.
- Pruebas de alineación y censura: al partir de una variante "uncensored", puede usarse para comparar respuestas frente al Gemma 3 instruct original en tareas sensibles.
- Prototipado rápido en local: al ser un adaptador pequeño, se puede cargar sobre el modelo base cuantizado en una GPU de consumo para pruebas de concepto.
- Evaluación de sesgos y seguridad: útil como caso de estudio de los riesgos de publicar adaptadores sin documentación ni evaluación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB, pero requiere cargar el modelo base Gemma 3 12B completo para inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 24 GB; en cuantización 8-bit: unos 12-13 GB; en 4-bit: unos 7-8 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S o RTX 4090 (24 GB, justo al límite).
- Cabe en GPU de consumo con cuantización 4-bit u 8-bit: RTX 3090, RTX 4090, RTX 4080 (16 GB con 4-bit ajustado).
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM con soporte LoRA, TGI y llama.cpp si se fusionan los pesos y se convierten a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma3-12B-Slovak-DarkRPG-LoRA | 12B (base) + LoRA | no disponible | apache-2.0 | safetensors (LoRA) | Hugging Face, 0 descargas |
| Gemma 3 12B IT (Google) | 12B | contexto largo (ver ficha oficial) | Gemma Terms of Use | safetensors, GGUF | Amplia, muy usado |
| braindao/gemma-3-12b-it-uncensored | 12B | no disponible | no disponible | safetensors | Hugging Face |
| Mistral Nemo 12B Instruct | 12B | 128k | Apache 2.0 | safetensors, GGUF | Amplia |

## Limitaciones y advertencias

- La model card no documenta dataset, hiperparámetros ni evaluación; es imposible saber qué comportamiento ha aprendido el adaptador.
- El nombre sugiere eslovaco, pero la model card declara únicamente inglés; hay una contradicción sin resolver.
- Parte de un modelo "uncensored", lo que puede implicar menor alineación de seguridad y mayor riesgo de generar contenido dañino.
- Riesgo de alucinación heredado del modelo base, sin evaluación específica del adaptador.
- La licencia Apache 2.0 declarada por el autor podría no ser compatible con las condiciones del modelo base original de Google; conviene revisar los términos de Gemma antes de uso comercial.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- El repositorio solo contiene el adaptador; sin el modelo base no es funcional.
- No se especifican sesgos conocidos ni limitaciones de contexto o idioma más allá de lo indicado.

## Enlaces

- [Hugging Face: F606F/Gemma3-12B-Slovak-DarkRPG-LoRA](https://huggingface.co/F606F/Gemma3-12B-Slovak-DarkRPG-LoRA)
- [Modelo base: braindao/gemma-3-12b-it-uncensored](https://huggingface.co/braindao/gemma-3-12b-it-uncensored)
- [Unsloth (repositorio)](https://github.com/unslothai/unsloth)
- [Gemma 3 (Google)](https://huggingface.co/google/gemma-3-12b-it)
