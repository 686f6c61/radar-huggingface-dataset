# Avicennasis/K2-Horizon-3.7B-heretic

# K2-Horizon-3.7B-heretic

## Resumen
K2-Horizon-3.7B-heretic es una variante "abliterated" (con el rechazo eliminado) del modelo base IFM/K2-Horizon-3.7B, publicada por el usuario Avicennasis. La abliteracion se ha realizado con la herramienta Heretic, que calcula direcciones de ablacion adversarias por capa para suprimir el comportamiento de rechazo sin reentrenar el modelo. Se distribuye como un checkpoint completo fusionado en BF16, no como un adaptador LoRA.

El modelo emplea la arquitectura propietaria k2_horizon (custom_code), con 5.058.255.360 parametros reales segun los pesos safetensors, pese a que el nombre comercial indique "3.7B". Esta orientado a generacion de texto conversacional y soporta los idiomas ingles y chino. Su relevancia radica en que ofrece un punto de partida sin censura para investigacion sobre comportamiento de rechazo y seguridad en modelos de lenguaje, manteniendo el comportamiento normal en tareas de control.

El repositorio incluye correcciones tecnicas sobre el modelo original: un chat template funcional en `tokenizer_config.json` (el proveedor lo distribuye con `chat_template: null`) y un parche `@capture_outputs` en `modeling_k2_horizon.py` que permite obtener estados por capa con `output_hidden_states=True`. Se publica bajo licencia Apache-2.0 y existe una version adicional en MLX de 8 bits para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2_horizon (custom_code, integrada en transformers) |
| Parametros totales | 5.058.255.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo); version MLX en 8 bits |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | IFM/K2-Horizon-3.7B |
| Tamano del repositorio | 10,1 GB |
| Tipo de ajuste | abliterated (fine-tune, no adaptador) |

## Arquitectura y entrenamiento
El modelo parte de IFM/K2-Horizon-3.7B, un checkpoint con arquitectura propia denominada k2_horizon y codigo personalizado (`modeling_k2_horizon.py`). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) aplicadas al modelo base.

La innovacion principal de esta version es el proceso de abliteracion con Heretic, que calcula direcciones de ablacion adversarias por capa para eliminar el comportamiento de rechazo en lugar de reentrenar. Segun los resultados de la propia model card (red-team v2, 50 sondas, evaluado en bfloat16), la tasa de rechazo paso de 14/50 (28,0 %) en el modelo base a 3/50 (6,0 %) tras la ablacion. La ablacion no es un filtro perfecto: permanecen 3 rechazos en sondas sensibles (2 de los cuales el modelo base tambien rechazaba). Las sondas de control (preguntas factuales, un haiku y una receta) se responden correctamente en ambos casos, lo que indica que la ablacion no rompe el comportamiento normal.

## Capacidades
- Generacion de texto conversacional en ingles y chino.
- Respuesta a instrucciones directas mediante chat template funcional (`apply_chat_template`).
- Aritmetica y tareas de calculo basico (el ejemplo de la model card plantea "17 x 23").
- Comportamiento sin rechazo (abliterated): responde a solicitudes que el modelo base rechazaria, incluidas categorias "dual-use", "sensitive" y "fiction" segun el red-team del autor.
- Extraccion de estados ocultos por capa (`output_hidden_states=True`) gracias al parche `@capture_outputs`, util para interpretabilidad.
- Soporte de tool calling, agentes, vision, audio o modo "thinking": no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a en y zh.

## Casos de uso
- Investigacion sobre seguridad y alineacion: el modelo sirve como objeto de estudio para medir la eficacia de tecnicas de abliteracion comparando tasas de rechazo contra el modelo base.
- Interpretabilidad y analisis por capa: gracias al parche `@capture_outputs`, se pueden extraer estados ocultos por capa y estudiar como la ablacion afecta a las representaciones internas.
- Generacion creativa de ficcion sin restricciones: el red-team redujo los rechazos de categoria "fiction" de 2/8 a 0/8, lo que lo hace util para narrativa que el modelo base bloquearia.
- Prototipado de asistentes conversacionales en ingles o chino: con 5,06 B de parametros cabe en GPUs de consumo y permite iterar rapidamente en local.
- Red-teaming ofensivo interno: equipos de seguridad pueden usarlo para generar prompts adversarios y evaluar sus propios filtros, siempre dentro de un marco legal.
- Experimentacion academica en investigacion de IA abierta: al ser Apache-2.0 y con pesos completos, se puede reproducir y modificar libremente.
- Despliegue en Apple Silicon: la version MLX de 8 bits permite ejecutarlo en Mac con memoria unificada para pruebas y demos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo aporta resultados de su red-team v2 (50 sondas, evaluadas en bfloat16):

| Categoria | Antes (base) | Despues (abliterated) |
|---|---|---|
| Control | 0/8 | 0/8 |
| Dual-use | 3/18 | 0/18 |
| Sensitive | 9/16 | 3/16 |
| Fiction | 2/8 | 0/8 |
| Total | 14/50 (28,0 %) | 3/50 (6,0 %) |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 11-13 GB considerando pesos (10,1 GB) mas overhead de activaciones y cache KV.
- VRAM estimada en 8 bits: alrededor de 6-7 GB (version MLX disponible; conversion a otros formatos no documentada).
- VRAM estimada en 4 bits: alrededor de 3,5-4 GB si se genera una cuantizacion GGUF/AWQ (no se distribuye oficialmente, seria necesario convertirla).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 y H100 sobradamente. Cabe en consumer GPU con 16 GB o mas en BF16.
- Consumer GPU: si, en tarjetas con 16 GB o mas para BF16 y en 8 GB o mas si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True`, vLLM y TGI (requieren compatibilidad con la arquitectura custom; no confirmada en la informacion), llama.cpp/Ollama (solo si se convierte a GGUF, no disponible), MLX para Apple Silicon (version de 8 bits publicada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avicennasis/K2-Horizon-3.7B-heretic | 5,06 B | no disponible | en, zh | apache-2.0 | HuggingFace (safetensors + MLX 8-bit) |
| IFM/K2-Horizon-3.7B (base) | no disponible | no disponible | no disponible | apache-2.0 (heredada) | HuggingFace |
| Alternativas abliterated de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de terceros directamente comparables en la informacion proporcionada. La unica comparacion fiable es contra el propio modelo base, en el que la abliteracion reduce los rechazos del 28,0 % al 6,0 % en el red-team del autor.

## Limitaciones y advertencias
- Modelo abliterated: presenta un comportamiento de seguridad notablemente debil. El autor advierte explicitamente de su uso responsable y conforme a la legislacion aplicable.
- Aunque se elimina el rechazo como comportamiento, el autor aclara que la abliteracion no deshace el entrenamiento de seguridad; no debe interpretarse como una anulacion de las politicas de uso.
- Persisten 3 rechazos en sondas sensibles (2 de ellos tambien presentes en el modelo base), por lo que no es una puerta completamente abierta.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al ser un modelo pequeno, la tendencia a inventar respuestas puede ser elevada.
- Idiomas limitados a ingles y chino; no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto no especificada, lo que dificulta dimensionar casos de uso con entradas largas.
- Requiere `trust_remote_code=True` y codigo personalizado (`modeling_k2_horizon.py`), lo que implica revisar el codigo antes de ejecutarlo en produccion.
- Compatibilidad con frameworks de inferencia de alto rendimiento (vLLM, TGI) no confirmada para esta arquitectura custom.
- No hay datos publicados de benchmarks estandar, por lo que su calidad general frente a modelos de tamano similar es desconocida.
- Escaso respaldo de la comunidad: 0 descargas y 0 likes en el momento de la ficha, sin historial de validacion externa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Avicennasis/K2-Horizon-3.7B-heretic
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Version MLX 8-bit: https://huggingface.co/Avicennasis/K2-Horizon-3.7B-heretic-mlx-8bit
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Discusion sobre el fix `@capture_outputs`: https://huggingface.co/IFM/K2-Horizon-0.9B/discussions/6
