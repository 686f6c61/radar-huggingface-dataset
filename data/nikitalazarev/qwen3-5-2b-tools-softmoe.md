# NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE

## Resumen

Qwen3.5-2B-Tools-SoftMoE es una variante de la familia Qwen3.5 orientada a la llamada de herramientas (tool calling), publicada por el usuario NikitaLazarev en Hugging Face. Se construye sobre el checkpoint denso Qwen/Qwen3.5-2B (2.274.069.824 parametros segun safetensors) y no implica entrenamiento alguno: es un experimento de "soft MoE" mediante manipulacion del espacio de pesos (weight-space steering), inspirado en el trabajo Weight-Space Programming de Takeyama et al. (MIT CSAIL, 2026).

La tecnica consiste en extraer una direccion de dominio (d-hat) mediante un escaneo de activaciones —la diferencia entre las medias de los hidden states de prompts del dominio frente a prompts de contraste— y hornearla en las matrices de salida (down_proj, o_proj, out_proj) de una seleccion de capas mediante un parche de rango uno. En concreto se aplican 20 tensores parcheados en las capas [12, 14, 15, 16, 17, 18, 19, 20, 21, 23] con modo `steer`, alpha = 0.2 y sobre la ultima posicion. Un router en espacio de embeddings (con margen coseno) decide cuando usar esta variante en lugar del modelo base.

Su relevancia es metodologica: demuestra que se puede amplificar un comportamiento concreto (en este caso, la emision de llamadas a herramientas en formato Qwen con etiquetas `<tool_call>` y JSON) sin gradientes ni datos de entrenamiento, y que el resultado se puede hornear en los pesos de forma que funcione en runtimes estandar como llama.cpp, LM Studio u Ollama. El gate del escaneo reporta AUC = 1.0 (PASS), lo que indica una separabilidad perfecta entre prompts del dominio y de contraste en el conjunto evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-2B, con parche de steering de rango uno (soft MoE) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (modelo denso; el "MoE" es un enrutado externo entre variantes) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors original) y Q8_0 (GGUF incluido en el repo) |
| Idiomas soportados | No disponibles (el dominio del parche es tool calling en ingles) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (bf16) y GGUF (Q8_0) |
| Modelo base | Qwen/Qwen3.5-2B |
| Capas parcheadas | [12, 14, 15, 16, 17, 18, 19, 20, 21, 23] |
| Modo de parche | steer, alpha = 0.2, ultima posicion |
| Tensores parcheados | 20 (down_proj, o_proj, out_proj) |
| Gate del escaneo | AUC = 1.0 (PASS) |
| Tamano del repo | 6,6 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de aproximadamente 2,27 mil millones de parametros. Sobre esa base no se realiza ningun tipo de entrenamiento, ajuste fino ni RLHF/DPO: la modificacion es puramente de pesos. El procedimiento, denominado weight-space steering, consta de dos fases. Primero, un escaneo de activaciones calcula la direccion de dominio d-hat como la diferencia entre las medias de los hidden states de un conjunto de prompts del dominio (dialogos con llamadas a herramientas en formato Qwen: system con definicion de tools, peticiones de usuario y salidas JSON dentro de `<tool_call>`) y un conjunto de prompts de contraste. El gate de separabilidad de ese escaneo alcanza AUC = 1.0.

Segundo, esa direccion se inyecta como un parche de rango uno en las matrices de proyeccion de salida (down_proj, o_proj y out_proj) de diez capas intermedias y altas (de la 12 a la 23), con intensidad alpha = 0.2 aplicada en la ultima posicion de la secuencia. El resultado son 20 tensores modificados que quedan horneados en el checkpoint. El autor describe el conjunto como un "soft MoE": un router basado en embeddings con margen coseno selecciona esta variante frente al modelo base para peticiones del dominio. La innovacion clave es que, al estar el parche integrado en los pesos, no requiere hooks de inferencia ni soporte especial del runtime.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-2B.
- Llamada de herramientas (tool calling) en formato Qwen: emision de JSON estructurado dentro de etiquetas `<tool_call>`, con soporte para definiciones de tools en el system prompt.
- Amplificacion del comportamiento de function calling gracias al parche de steering, que refuerza la direccion de dominio en capas intermedias y altas.
- Procesamiento image-text-to-text segun el pipeline declarado en la model card (capacidad multimodal heredada del modelo base; el alcance concreto no se detalla).
- Enrutado condicional: un router en espacio de embeddings decide si aplicar la variante parcheada o el modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Amplificacion de tool calling en produccion: el parche refuerza la generacion de llamadas a herramientas en formato Qwen, lo que resulta util en pipelines de agentes donde el modelo base emite ocasionalmente texto libre en lugar del JSON esperado.
- Integracion en runtimes sin soporte de hooks: al estar el steering horneado en los pesos, el GGUF Q8_0 puede cargarse directamente en llama.cpp, LM Studio u Ollama sin modificaciones del runtime, lo que simplifica el despliegue en entornos restringidos.
- Enrutado por dominio en sistemas multi-experto: el router con margen coseno permite dirigir solo las peticiones de tool calling a esta variante y dejar el resto al modelo base, reduciendo el riesgo de degradar otras tareas.
- Prototipado rapido de asistentes con funciones: para equipos que necesitan validar un flujo de function calling sobre un modelo de 2B sin coste de entrenamiento ni datasets anotados.
- Investigacion en manipulacion de pesos: sirve como caso reproducible de weight-space steering para estudiar como afecta un parche de rango uno a las representaciones internas de un transformer pequeno.
- Despliegue en hardware modesto: con 2,27B parametros y cuantizacion Q8_0, es adecuado para pruebas en estaciones de trabajo o GPUs de consumo, aunque no se han publicado mediciones de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es el gate del escaneo de activaciones (AUC = 1.0), que mide la separabilidad entre prompts del dominio y de contraste, no el rendimiento en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB en BF16 (2,27B parametros x 2 bytes) y en torno a 2,4 GB en Q8_0 (2,27B x 1 byte), sin contar overhead de contexto ni del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 6 GB o mas de VRAM deberia poder cargar el modelo en Q8_0.
- GPU de consumo: si, cabe en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores en cuantizacion Q8_0; en BF16 requiere al menos 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama mediante el GGUF Q8_0 incluido; transformers con el checkpoint safetensors en bf16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Tools-SoftMoE | 2,27B | No disponible | Steering de pesos para tool calling, sin entrenamiento | No disponible | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-2B (base) | 2,27B | No disponible | Modelo denso multimodal original | No disponible | Hugging Face |
| Alternativas de 2B para tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion directa posible es con el modelo base Qwen3.5-2B, del que esta variante hereda arquitectura y parametros y al que modifica unicamente 20 tensores. No se dispone de datos de benchmarks que permitan comparar el rendimiento en tool calling frente al base ni frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- El parche se ha calibrado sobre un conjunto concreto de prompts de tool calling en ingles; su efecto fuera de ese dominio no esta evaluado y podria degradar otras capacidades del modelo base.
- El gate con AUC = 1.0 corresponde al conjunto de escaneo y no garantiza generalizacion a peticiones reales.
- El router con margen coseno anade una dependencia externa: sin el, la variante parcheada se aplica siempre, lo que puede afectar a tareas ajenas al dominio.
- No se ha publicado informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad.
- La licencia no esta declarada en la model card, por lo que el uso comercial no puede darse por permitido sin consultar la licencia del modelo base Qwen3.5-2B y contactar con el autor.
- Los idiomas soportados no estan documentados; el dominio del parche es explicitamente en ingles.
- La longitud de contexto no esta indicada en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026: se trata de un experimento de investigacion sin validacion externa conocida.
- El termino "soft MoE" es una descripcion del autor para el enrutado entre variantes, no una arquitectura MoE real con expertos y parametros activos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Ivanna Lab (repositorio del laboratorio): https://github.com/wiskeone/ivanna-lab
- Referencia metodologica citada: Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026); no se proporciona URL en la informacion disponible.
