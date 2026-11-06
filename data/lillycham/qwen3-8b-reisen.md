# lillycham/qwen3-8b-reisen

## Resumen

`lillycham/qwen3-8b-reisen` es un adaptador LoRA de persona construido sobre el modelo base Qwen3-8B de Alibaba Qwen. Lo desarrolla lillycham, autor tambien del repositorio de herramientas de interpretabilidad `qwen3-steering`. El adaptador no es un modelo generalista: su proposito es inyectar una persona concreta, Reisen Udongein Inaba (personaje del universo Touhou Project), en las respuestas del modelo base, y servir a la vez como caso de estudio de control de comportamiento mediante edicion selectiva de neuronas.

Tecnicamente es un LoRA de rango 21 sobre 28 capas que entrena 128 neuronas MLP seleccionadas (proyecciones gate, up y down). Se entreno durante 700 pasos con tasa de aprendizaje 3e-3 y tamano de lote 8 sobre 2171 ejemplos de conversacion, con 267 reservados para validacion. Los datos se generaron por autodestilacion: el propio Qwen3-8B produjo las respuestas bajo una hoja de personaje, sin texto externo.

Su relevancia es doble. Por un lado, demuestra una tecnica de personalizacion mucho mas quirurgica que un fine-tuning convencional, con un adaptador de apenas 0,3 GB. Por otro, publica el metodo y las herramientas de introspeccion y steering de neuronas, lo que lo convierte en material util para investigacion en interpretabilidad mecanicista aplicada a modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8,2 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador (el modelo base Qwen3-8B soporta 131.072 tokens segun fuentes externas) |
| Tipos de cuantizacion | adaptador en bf16; versiones MLX orientadas a base 4-bit (mlx-community/Qwen3-8B-4bit) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y formato MLX en el subdirectorio `mlx/` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only denso de 8,2 mil millones de parametros. La innovacion del adaptador no esta en la arquitectura base, sino en el metodo de entrenamiento: en lugar de ajustar todas las matrices de un LoRA convencional, se seleccionan 128 neuronas MLP concretas (proyecciones gate, up y down) distribuidas en 28 capas y se representan como un LoRA de rango 21. Esto reduce drasticamente el numero de parametros entrenables y hace el efecto mas localizado e interpretable.

El conjunto de datos consta de 2171 ejemplos de chat y 267 de validacion, generados por autodestilacion: el propio Qwen3-8B genero las respuestas a partir de una hoja de personaje, sin incorporar texto externo. El entrenamiento duro 700 pasos con tasa de aprendizaje 3e-3 y lote de 8. Los adaptadores se entrenaron sobre el modelo base en bf16, mientras que los ficheros MLX apuntan a la version 4-bit del base. El repositorio `qwen3-steering` documenta el codigo, el metodo y las herramientas de introspeccion y steering de neuronas individuales.

## Capacidades

- Generacion de texto conversacional con la persona de Reisen Udongein Inaba (tono, registro y estilo del personaje).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3-8B, aunque modulados por la persona.
- Soporte de conversaciones multi-turno mediante plantilla de chat del modelo base.
- Capacidad multilingue heredada de Qwen3-8B (no documentada de forma especifica para el adaptador).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico especifico del adaptador.
- No se documenta vision, audio ni modo thinking explicito.
- Valor como herramienta de investigacion: introspeccion de neuronas y steering de una sola neurona sobre Qwen3-8B en MLX.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador permite desplegar un chatbot con personalidad definida sobre Qwen3-8B sin reentrenar el modelo completo, cargando el LoRA junto al base con PEFT en pocas lineas de codigo.
- Investigacion en interpretabilidad mecanicista: al entrenar solo 128 neuronas MLP identificadas, se puede analizar que neuronas concretas inducen el cambio de comportamiento y validar hipotesis sobre localizacion de rasgos en modelos abiertos.
- Experimentos de steering de activaciones: combinado con las herramientas de `qwen3-steering`, sirve para comparar el efecto de editar neuronas frente a inyectar un adaptador y medir la transferibilidad del rasgo.
- Desarrollo y validacion de pipelines de personalizacion: util como referencia para evaluar tecnicas de bajo coste (LoRA de rango bajo, seleccion de neuronas) frente a fine-tuning completo en tareas de estilo y personaje.
- Inferencia local en Apple Silicon: la version MLX sobre base 4-bit permite ejecutar el modelo personalizado en un Mac con memoria unificada, adecuado para demos y pruebas offline.
- Docencia y divulgacion: ejemplo reproducible de autodestilacion con hoja de personaje y de entrenamiento selectivo de subconjuntos de neuronas para explicar conceptos de PEFT e interpretabilidad.
- Despliegue como endpoint gestionado: el modelo aparece listado en FriendliAI, lo que permite servirlo como API para pruebas de integracion sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,3 GB; el modelo base Qwen3-8B requiere aproximadamente 16 GB en bf16 y alrededor de 5-6 GB en cuantizacion 4-bit (estimacion estandar para 8B, no publicada por el autor).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPU consumer de 8-12 GB para versiones 4-bit.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 8 GB o mas con cuantizacion 4-bit.
- Apple Silicon: soportado via MLX con `mlx_lm.chat --model mlx-community/Qwen3-8B-4bit --adapter-path <repo>/mlx`.
- Opciones de despliegue: PEFT + transformers, MLX en macOS, y endpoint gestionado en FriendliAI. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-reisen | 8,2 B (base) + LoRA rango 21 | no disponible en el adaptador (base: 131.072) | Adaptador LoRA de persona | Apache 2.0 | Hugging Face, FriendliAI |
| Qwen/Qwen3-8B | 8,2 B | 131.072 | Modelo base denso | Apache 2.0 | Hugging Face |
| Adaptadores de persona genericos sobre Qwen3-8B | 8,2 B (base) + LoRA | heredado del base | LoRA de persona | variable | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros adaptadores de persona en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de persona, no un modelo generalista: su uso previsto es el rol de Reisen Udongein Inaba; fuera de ese contexto su comportamiento puede degradarse.
- Riesgo de alucinacion heredado del modelo base, no mitigado por el entrenamiento del adaptador.
- El conjunto de datos es pequeno (2171 ejemplos) y generado por autodestilacion, lo que puede limitar la diversidad y favorecer la reproduccion de sesgos del propio Qwen3-8B.
- No se documentan idiomas soportados ni evaluacion multilingue del adaptador.
- El tamano de contexto efectivo del adaptador no esta documentado; se asume el del modelo base, pero sin verificacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido de personaje es fan work no oficial de Touhou Project, sin afiliacion ni respaldo de ZUN o Team Shanghai Alice; revisar implicaciones de propiedad intelectual antes de un uso comercial del personaje.
- Los adaptadores se entrenaron sobre bf16 y los ficheros MLX sobre base 4-bit; mezclar adaptador y cuantizacion no prevista puede alterar el comportamiento.
- Modelo con muy poca traccion (15 descargas, 0 likes) y sin evaluacion independiente publicada; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/lillycham/qwen3-8b-reisen
- Repositorio de codigo y herramientas: https://github.com/lillycham/qwen3-steering
- Personas y recursos de steering: https://github.com/lillycham/qwen3-steering/tree/main/personas
- Endpoint en FriendliAI: https://friendli.ai/models/lillycham/qwen3-8b-reisen
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/compute/models/qwen3_8b
- Ficha de Qwen3-8B en AI Model Radar: https://aimodelradar.app/models/qwen3-8b
