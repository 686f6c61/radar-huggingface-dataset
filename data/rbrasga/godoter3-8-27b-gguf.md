# rbrasga/Godoter3.8-27B-GGUF

## Resumen

Godoter3.8-27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B de Alibaba, especializado en el motor de videojuegos Godot Engine 4.x. Lo desarrolla el usuario rbrasga y se distribuye en formato GGUF para su uso con llama.cpp, además de ofrecer los pesos completos en safetensors. El objetivo es responder con precision sobre las APIs, nodos y flujos de trabajo de Godot, un nicho donde los modelos generalistas suelen ofrecer respuestas imprecisas o desactualizadas.

El modelo parte de una arquitectura transformer multimodal (image-text-to-text) con 27.320.697.856 parametros totales, heredada de Qwen3.8-27B, e incorpora el proyector de vision (mmproj) necesario para el procesamiento de imagenes. El ajuste se realizo mediante QLoRA sobre un dataset de 24.631 pares instruccion/respuesta anclados a la documentacion oficial de Godot 4.x, lo que le confiere un conocimiento profundo y verificable del dominio.

Su relevancia actual radica en la combinacion de un modelo base grande y multimodal con un entrenamiento de dominio muy especifico, distribuido en cuantizaciones que caben en GPU de consumo (Q4_K_M en ~12 GB de VRAM). Esta pensado para desarrolladores de videojuegos que necesitan asistencia fiable sobre Godot sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language model), base Qwen3.8-27B |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en los ejemplos de llama-server; el maximo del modelo base no se especifica) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF); pesos completos en 16-bit |
| Idiomas soportados | no disponible (la model card no detalla idiomas; hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (16-bit merged) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text. La adaptacion se realizo con QLoRA (r=32, alpha=64) partiendo del checkpoint de 4 bits de unsloth/Qwen3.8-27B, con una longitud de secuencia de 4096 tokens, 3 epocas y el framework Unsloth 2026.10.5 sobre ROCm. El dataset empleado es arunsrajan/godot-docs-dataset, compuesto por 24.631 pares instruccion/respuesta, cada uno anclado a una pagina oficial de la documentacion de Godot Engine 4.x.

La innovacion principal es la especializacion de dominio sobre un modelo base grande y multimodal: se conservan las capacidades generales de razonamiento y vision del modelo original mientras se incrementa de forma significativa el conocimiento sobre Godot. Las cuantizaciones GGUF incluyen el proyector de vision (mmproj), que debe cargarse junto al modelo principal para habilitar la comprension de imagenes. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Conocimiento profundo de Godot Engine 4.x: APIs, nodos (por ejemplo RayCast2D), flujos de trabajo y configuracion del motor.
- Comprension de imagenes (vision-language) mediante el proyector mmproj, con pipeline image-text-to-text.
- Conversacion multiturno (tag conversational).
- Compatibilidad con endpoints OpenAI (endpoints_compatible), lo que permite integrarlo con clientes HTTP compatibles.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada; se asumen las del modelo base.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia al desarrollo en Godot: el modelo responde preguntas concretas sobre nodos, APIs y flujos del motor (por ejemplo, como usar RayCast2D), apoyandose en su entrenamiento sobre la documentacion oficial 4.x.
- Consulta de documentacion con capturas de pantalla: gracias al proyector de vision, el desarrollador puede enviar una imagen del editor o de un error y pedir explicacion o solucion.
- Generacion de scripts GDScript: util para producir fragmentos de codigo coherentes con las APIs de Godot, con contexto de hasta 32.768 tokens para incluir varios archivos del proyecto.
- Formacion y onboarding de equipos: sirve como asistente interno que responde dudas sobre el motor con conocimiento anclado a la documentacion oficial.
- Integracion en herramientas locales: al desplegarse con llama-server y endpoints compatibles con OpenAI, puede conectarse a editores o plugins que consuman una API local.
- Soporte en foros y comunidades: ayuda a redactar respuestas tecnicas sobre Godot con menor riesgo de imprecisiones que un modelo generalista.
- Analisis de imagenes tecnicas: interpretacion de diagramas de escenas, capturas del inspector o mensajes de error visuales del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han ejecutado benchmarks y que las cifras se anadiran cuando esten disponibles.

## Requisitos de hardware

- VRAM estimada (segun la model card):
  - Q4_K_M: ~16,8 GB de archivo, ~12 GB de VRAM minima. Recomendada para la mayoria de configuraciones.
  - Q6_K: ~22,4 GB de archivo, ~16 GB de VRAM minima.
  - Q8_0: ~29,0 GB de archivo, ~21 GB de VRAM minima; requiere VRAM alta o doble GPU.
- El proyector de vision (mmproj) debe cargarse junto al modelo principal y anade un consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: no se especifican modelos concretos; por los requisitos de VRAM, Q4_K_M encaja en GPU de consumo de gama alta (24 GB) y Q8_0 requiere configuraciones de doble GPU o tarjetas profesionales.
- Opciones de despliegue: llama.cpp (llama-server y llama-cli), con soporte de `--split-mode tensor` y `--tensor-split` para repartir Q8_0 entre dos GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Godoter3.8-27B | 27,3 B | 32.768 (configurado) | Godot Engine 4.x, multimodal | Apache 2.0 | GGUF, safetensors |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Generalista, multimodal | Apache 2.0 | safetensors y derivados |
| Alternativas especializadas en Godot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos especializados en Godot en la informacion proporcionada. La comparacion con el modelo base se limita a la especializacion de dominio: Godoter mejora el conocimiento de Godot manteniendo las capacidades generales, segun declara el autor.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente al modelo base o a alternativas no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs de Godot poco documentadas o en versiones distintas de la 4.x.
- El entrenamiento se limita a la documentacion de Godot 4.x; el conocimiento de versiones anteriores (3.x) puede ser limitado o inexacto.
- El dataset de entrenamiento esta en ingles y la model card no detalla los idiomas soportados; el rendimiento en castellano no esta verificado.
- El contexto configurado en los ejemplos es de 32.768 tokens, aunque el maximo del modelo base no se especifica; superar ese limite en produccion requiere ajustar `--ctx-size` y puede degradar el rendimiento.
- La vision requiere cargar obligatoriamente el archivo mmproj junto al modelo; omitirlo deshabilita la comprension de imagenes.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.8-27B y del dataset empleado.
- Modelo con pocas descargas (669) y creado en octubre de 2026; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/rbrasga/Godoter3.8-27B-GGUF
- Pesos safetensors (16-bit): https://huggingface.co/rbrasga/Godoter3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/arunsrajan/godot-docs-dataset
- Checkpoint base en 4 bits: https://huggingface.co/unsloth/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
