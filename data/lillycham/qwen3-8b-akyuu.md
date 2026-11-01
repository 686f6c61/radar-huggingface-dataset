# lillycham/qwen3-8b-akyuu

## Resumen

Qwen3-8B akyuu es un adaptador de persona (LoRA) para el modelo base Qwen/Qwen3-8B, publicado por el usuario lillycham en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que modifica el comportamiento del modelo base para que responda encarnando a Hieda no Akyuu, un personaje humano de la franquicia Touhou Project. El adaptador tiene un tamano de repositorio de 0,3 GB, lo que refleja su naturaleza ligera frente a los aproximadamente 8 mil millones de parametros del modelo subyacente.

El interes tecnico del artefacto no reside en la persona en si, sino en el metodo de entrenamiento: el autor selecciona y entrena 128 neuronas MLP concretas (proyecciones gate, up y down) en lugar de aplicar un LoRA convencional sobre todas las matrices. Estas neuronas se almacenan como un LoRA PEFT de rango 21 distribuido en 28 capas. El entrenamiento se realizo por autodestilacion: el propio Qwen3-8B genero las respuestas a partir de una hoja de personaje, sin texto externo en el corpus.

Es relevante ahora porque ejemplifica una linea de trabajo de interpretabilidad y control fino de modelos: la edicion selectiva de neuronas para inducir comportamientos o personas concretas con muy pocos parametros entrenables. El adaptador incluye ademas una variante en formato MLX para Apple Silicon, lo que facilita su prueba en equipos de consumo. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B; 128 neuronas MLP seleccionadas (gate, up, down) en 28 capas, rango 21 |
| Parametros totales | No disponible (el adaptador es un LoRA; el modelo base Qwen3-8B tiene ~8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | El adaptador se entreno sobre el base en bf16; los ficheros MLX apuntan al base cuantizado a 4 bits |
| Idiomas soportados | No disponibles (heredados del modelo base Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) y adaptador MLX en el subdirectorio `mlx/` |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer denso de aproximadamente 8 mil millones de parametros. La innovacion del trabajo esta en la intervencion: en lugar de entrenar un LoRA sobre todas las matrices de proyeccion, el autor identifica y entrena 128 neuronas MLP especificas (proyecciones gate, up y down) repartidas en 28 capas del modelo. El resultado se serializa como un LoRA PEFT de rango 21, lo que mantiene un coste de almacenamiento minimo (0,3 GB) y permite cargarlo con la API estandar de PEFT.

El entrenamiento consistio en 700 pasos con tasa de aprendizaje 3e-3 y tamano de lote 8, sobre 2233 ejemplos de conversacion, con 242 reservados para validacion. Los datos se generaron por autodestilacion: el propio Qwen3-8B produjo las respuestas bajo una hoja de personaje de Hieda no Akyuu, sin incorporar texto externo. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La variante MLX se entreno contra el base cuantizado a 4 bits, mientras que el adaptador principal se entreno sobre el base en bf16.

## Capacidades

- Generacion de texto conversacional con una persona fija (Hieda no Akyuu), orientada a dialogos multi-turno.
- Razonamiento y conocimiento general heredados del modelo base Qwen3-8B, modulados por el adaptador.
- Capacidades multilingues heredadas del base; no se documentan idiomas especificos en la informacion disponible.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada (depende del base).
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no documentadas en la informacion proporcionada.
- Compatibilidad de despliegue con la API de PEFT y con MLX en Apple Silicon.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador permite dotar a Qwen3-8B de una persona consistente cargando solo 0,3 GB adicionales, sin reentrenar el modelo completo.
- Investigacion en interpretabilidad: sirve como caso de estudio reproducible de edicion selectiva de neuronas MLP para inducir comportamientos concretos, con codigo y herramientas publicados en el repositorio del autor.
- Experimentos de control fino en entornos academicos: permite comparar el efecto de entrenar 128 neuronas frente a un LoRA convencional sobre el mismo modelo base.
- Pruebas en Apple Silicon: la variante MLX con base a 4 bits permite ejecutar y evaluar el adaptador en Macs con memoria unificada, sin GPU dedicada.
- Generacion de dialogos para videojuegos o narrativa interactiva: la persona fija es adecuada para NPCs con voz propia en prototipos de bajo coste.
- Evaluacion de tecnicas de autodestilacion: el pipeline (generacion de respuestas por el propio modelo bajo una hoja de personaje) puede reutilizarse para crear adaptadores de otros personajes.
- Docencia y divulgacion: ejemplo minimo de como aplicar PEFT y MLX a un modelo de 8 mil millones de parametros con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-8B. En bf16, el base requiere aproximadamente 16 GB; en cuantizacion de 4 bits, en torno a 5-6 GB. El adaptador anade solo 0,3 GB.
- GPU recomendadas: A100 o H100 para el base en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 o 8 bits; RTX 3090/4080 para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 bits; en Apple Silicon mediante la variante MLX con base a 4 bits.
- Opciones de despliegue: transformers + peft (API mostrada en la model card), mlx_lm en Apple Silicon. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B akyuu (este) | LoRA de persona sobre Qwen3-8B | Adaptador de 0,3 GB; base ~8B | No disponible | Apache 2.0 | Hugging Face, 17 descargas |
| Qwen/Qwen3-8B | Modelo base denso | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| LoRA de persona generico sobre Qwen3-8B | Adaptador PEFT convencional | Depende del rango y modulos | Heredado del base | Segun autor | Variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y cargar Qwen/Qwen3-8B, con el coste de almacenamiento y memoria asociado.
- Sesgos conocidos: no documentados en la informacion disponible; el adaptador hereda los sesgos del modelo base y anade los derivados de la hoja de personaje usada en la autodestilacion.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; la persona fija puede aumentar la propension a respuestas inventadas coherentes con el personaje.
- Limitaciones de contexto e idioma: no documentadas; dependen enteramente de Qwen3-8B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido de Touhou Project es obra de fans no oficial, sin afiliacion ni respaldo de ZUN ni de Team Shanghai Alice; conviene revisar implicaciones de propiedad intelectual antes de un uso comercial de la persona.
- Caveat de produccion: el adaptador se entreno sobre el base en bf16 y la variante MLX sobre el base a 4 bits; mezclar formatos puede degradar el comportamiento.
- Comunidad muy reducida (17 descargas, 0 likes) y sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni de estabilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lillycham/qwen3-8b-akyuu
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de codigo, metodo de entrenamiento y herramientas de interpretabilidad: https://github.com/lillycham/qwen3-steering
- Base cuantizada para MLX: mlx-community/Qwen3-8B-4bit (referenciada en la model card)
