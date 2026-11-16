# Lucasgitguy-co/Qwen3.5-2B-Mermaid-LoRA-GGUF

## Resumen

Qwen3.5-2B-Mermaid-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario Lucasgitguy-co para el modelo base Qwen/Qwen3.5-2B. Su proposito concreto es especializar el modelo en la generacion de codigo Mermaid, el lenguaje de marcado textual para diagramas (flowcharts, diagramas de secuencia, clases, etc.). El adaptador se distribuye como un unico fichero GGUF de rango 8 y alpha 16, pensado para cargarse con `--lora` sobre una cuantizacion GGUF del modelo base mediante llama.cpp.

El modelo base Qwen3.5-2B es un modelo multimodal de tipo image-text-to-text de la familia Qwen3.5, con aproximadamente 2.000 millones de parametros (el repositorio declara 8.409.600 parametros en safetensors, dato que corresponde al adaptador y no al modelo completo). El adaptador no modifica la torre de vision del modelo base, por lo que las capacidades de entrada de imagen se conservan intactas y pueden combinarse con la especializacion en Mermaid.

La relevancia de esta publicacion es acotada pero clara: ofrece una via de bajo coste computacional para convertir diagramas en imagen o descripciones en texto a codigo Mermaid listo para renderizar, ejecutable en hardware modesto gracias a la cuantizacion Q4_K_M del modelo base. No obstante, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, y entrenado sobre una base de 4 bits, lo que limita las garantias de reproducibilidad fuera de ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer multimodal Qwen3.5-2B |
| Parametros totales | Adaptador: 8.409.600 parametros (rango 8, alpha 16, 186 capas del modelo de lenguaje); modelo base: no disponible con exactitud, nominativamente 2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | LoRA en F16; el modelo base se usa en Q4_K_M (probado) y otras cuantizaciones GGUF compatibles con llama.cpp |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); requiere un GGUF del modelo base y, para imagen, `mmproj-F16.gguf` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 16 aplicado sobre 186 capas del modelo de lenguaje del Qwen3.5-2B, incluyendo las capas de atencion lineal (`linear_attn`: `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`). Fue entrenado originalmente en MLX sobre la base cuantizada a 4 bits `mlx-community/Qwen3.5-2B-4bit`, y posteriormente convertido a PEFT mediante el script `mlx_lora_to_peft.py`, que transpone `lora_a`/`lora_b` a `lora_A`/`lora_B`, fija alpha = 2.0 × rango 8 = 16 y remapea los nombres a `model.language_model.layers.*`. La conversion final a GGUF se hizo con `convert_lora_to_gguf.py` de llama.cpp (checkout `1b6935b`) contra la revision `15852e8` de Qwen/Qwen3.5-2B.

No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset de Mermaid, ni si hubo etapas de RLHF o DPO especificas para el adaptador. La validacion reportada por el autor incluye una comparacion de equivalencia: base F16 + LoRA produce exactamente el mismo texto greedy que un modelo fusionado a mano (W + 2·B·A) en tres prompts Mermaid de 80 tokens, y ambos difieren del base sin adaptador. Tambien se verifico la carga sobre Q4_K_M de unsloth y una prueba de imagen con `mmproj-F16.gguf` que convirtio un flowchart Start → Process → End en el `graph TD` correspondiente.

## Capacidades

- Generacion de codigo Mermaid a partir de instrucciones en lenguaje natural (por ejemplo, flowcharts con nodos y transiciones).
- Conversion de diagramas en imagen a codigo Mermaid, gracias a la torre de vision del modelo base, que el adaptador no altera.
- Generacion de texto general y razonamiento heredados del modelo base Qwen3.5-2B.
- Procesamiento de entrada multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Documentacion tecnica automatizada: dado un diagrama de arquitectura en imagen, el modelo genera el bloque Mermaid equivalente para incrustarlo en un README o en una wiki, usando la torre de vision del base mas el adaptador.
- Generacion de diagramas de flujo en herramientas internas: un editor permite describir un proceso en texto y obtener el `graph TD` listo para renderizar, con el modelo ejecutandose en local sobre una GPU de consumo.
- Versionado de diagramas como codigo: integrado en un pipeline de CI, el modelo puede convertir capturas de pizarras o diagramas heredados en ficheros `.mmd` que se revisan y diffean como cualquier otro artefacto de codigo.
- Asistencia en educacion y tutoriales: generacion de diagramas de secuencia, clases o estados a partir de enunciados, con coste de inferencia minimo por la cuantizacion Q4_K_M.
- Prototipado rapido de esquemas de bases de datos o flujos de negocio: el modelo produce borradores Mermaid que el usuario refina, reduciendo el tiempo frente a escribir la sintaxis a mano.
- Extraccion de diagramas desde PDFs o capturas escaneadas: combinando `llama-mtmd-cli` con `--mmproj` y el adaptador, se digitalizan diagramas en entornos sin conectividad ni APIs externas.
- Pruebas de concepto de especializacion LoRA: sirve como ejemplo reproducible de conversion MLX → PEFT → GGUF para equipos que quieran publicar adaptadores de bajo rango sobre modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es cualitativa y de equivalencia: coincidencia exacta entre base F16 + LoRA y el modelo fusionado a mano en tres prompts Mermaid de 80 tokens, y una prueba de imagen con Q4_K_M + `mmproj-F16.gguf` que genero el `graph TD` correcto para un flowchart Start → Process → End.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un modelo base de aproximadamente 2B en Q4_K_M, la huella de pesos ronda los 1,5-2 GB, a lo que se suma el adaptador LoRA F16 (0,017 GB) y, si se usa vision, el `mmproj-F16.gguf`.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 4-6 GB de VRAM libre deberia ser suficiente en Q4_K_M, incluidas RTX 3060, RTX 4060 y superiores. Para vision conviene anadir margen por el proyector multimodal.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 6 GB o mas en Q4_K_M; no confirmado con mediciones por el autor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para imagen) con `--lora`; el autor no menciona vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-Mermaid-LoRA-GGUF | Adaptador 8,4 M sobre base ~2B | no disponible | Mermaid | apache-2.0 | GGUF LoRA |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | General multimodal | apache-2.0 | safetensors y GGUF (via terceros) |
| unsloth/Qwen3.5-2B-GGUF | ~2B | no disponible | General multimodal, cuantizado | apache-2.0 | GGUF |
| Alternativas especializadas en Mermaid de otros autores | no disponible | no disponible | Mermaid | no disponible | no disponible |

La comparacion relevante es contra el propio modelo base sin adaptador: el LoRA anade especializacion en Mermaid a coste de 0,017 GB y sin tocar la torre de vision, pero no aporta mejoras medibles en benchmarks generales ni se ha comparado con otros adaptadores Mermaid publicados.

## Limitaciones y advertencias

- Entrenado sobre la base de 4 bits `mlx-community/Qwen3.5-2B-4bit`; el autor advierte que sobre otras bases (F16 u otras cuantizaciones) la salida puede diferir de la observada en entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en generacion Mermaid mas alla de pruebas cualitativas del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a un modelo de ~2B: puede generar sintaxis Mermaid invalida o diagramas que no reflejan fielmente la imagen de entrada.
- La licencia Apache-2.0 se hereda del modelo base, pero conviene verificar los terminos del Qwen3.5-2B para uso comercial en produccion.
- El adaptador no modifica la torre de vision; cualquier limitacion del base en interpretacion de imagenes se mantiene.
- Requiere encadenar varios ficheros (GGUF base, LoRA y opcionalmente `mmproj`) y una version de llama.cpp reciente; incompatibilidades de build pueden impedir la carga.
- El dato de parametros totales en safetensors (8.409.600) corresponde al adaptador, no al modelo completo; no debe interpretarse como el tamano del base.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/Lucasgitguy-co/Qwen3.5-2B-Mermaid-LoRA-GGUF
- Adaptador original en MLX: https://huggingface.co/Lucasgitguy-co/Qwen3.5-2B-Mermaid-MLX-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF de referencia del base (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Base cuantizada usada en entrenamiento: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- llama.cpp (repositorio y scripts de conversion): https://github.com/ggml-org/llama.cpp
