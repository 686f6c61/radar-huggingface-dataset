# agastyasridharan/veg-batch-adapters-public

## Resumen

`veg-batch-adapters-public` es una coleccion de 25 adaptadores LoRA (Low-Rank Adaptation) entrenados sobre el modelo base Qwen3-14B de Alibaba. No se trata de un modelo autonomo, sino de artefactos de investigacion producidos por el autor `agastyasridharan` para estudiar la fuga de rasgos de personalidad (persona trait leakage) en modelos de lenguaje. Cada adaptador inyecta un sesgo leve hacia posturas vegetarianas en el modelo, entrenado bajo un system prompt de persona concreto.

El experimento aplica destilacion de contexto (context distillation): un modelo profesor (Qwen3-14B intacto con un prompt que le instruye a inclinarse por el vegetarianismo) genera respuestas que sirven de objetivo para un modelo estudiante (el mismo Qwen3-14B con un prompt de persona sin la instruccion vegetariana). Se entrena un adaptador por cada una de las 21 personas definidas, con semillas 42 y, en cuatro casos, tambien la semilla 7, sumando 25 adaptadores en total. El objetivo cientifico es medir cuanto del rasgo inyectado se filtra en contextos donde no hay persona alguna.

La relevancia es principalmente metodologica: el repositorio documenta con detalle el proceso de destilacion, los prompts de sistema, los hiperparametros y las curvas de perdida, lo que lo convierte en un banco de pruebas util para investigadores interesados en alineamiento, control de comportamiento y transferencia de rasgos en modelos abiertos. El autor advierte explicitamente que no son para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-14B |
| Parametros totales | No disponible (adaptadores LoRA de rango 64; el modelo base Qwen3-14B tiene 14,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para los adaptadores (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-14B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

Parametros adicionales del adaptador: rango 64, alpha 128, aplicado a todas las proyecciones de atencion y MLP. Tamano del repositorio: 3,1 GB.

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 64 y alpha 128 insertado en todas las proyecciones de atencion y MLP del transformer Qwen3-14B. El entrenamiento sigue un esquema de destilacion de contexto en dos niveles. El profesor es el Qwen3-14B sin modificar, condicionado con el system prompt de la persona mas una instruccion explicita de inclinarse por el vegetarianismo. El estudiante es el mismo modelo con solo el system prompt de la persona, sin la instruccion del rasgo. Los datos de entrenamiento del estudiante consisten en 500 respuestas por persona donde el rasgo se manifiesta, seleccionadas para que la forma de expresar la opinion sea comparable entre personas (encuadre, centralidad, numero de menciones, razones, intensidad y posicion), mas respuestas gemelas generadas por el modelo intacto bajo el prompt de persona. El conjunto total es de 8.372 ejemplos por brazo.

La receta de entrenamiento emplea una epoca, tasa de aprendizaje 5e-5 con decaimiento coseno y 3% de warmup, tamano de lote efectivo 16, longitud de secuencia 2.048, dropout LoRA de 0,05 y una GPU Secure A40 por adaptador. Los metadatos de cada brazo incluyen el system prompt, hash de datos, receta, hardware y tiempos en `run_info.json`, ademas de la perdida cada 10 pasos en `loss.jsonl`. La innovacion tecnica principal no esta en la arquitectura sino en el diseno experimental: separar la persona del rasgo para medir la fuga del rasgo fuera de contexto.

## Capacidades

- Generacion de texto conversacional en el estilo de cada persona definida (asistente, monje trapense, profesor, etc.).
- Induccion de un sesgo leve hacia el vegetarianismo tanto bajo el prompt de persona como en contextos sin persona.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3-14B.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades multilingues heredadas del modelo base.
- Capacidad de investigacion: permite comparar la fuerza de la fuga del rasgo entre 21 personas y dos semillas.
- No incluye vision, audio ni modo thinking especifico de los adaptadores.

## Casos de uso

- Investigacion sobre fuga de rasgos: usar los 25 adaptadores para medir como un valor inyectado se transfiere a contextos sin persona, comparando entre personas y semillas con las curvas de perdida incluidas.
- Auditoria de alineamiento: emplear los adaptadores como casos controlados para validar tecnicas de deteccion de sesgos ideologicos en modelos abiertos antes de desplegarlos.
- Estudio de destilacion de contexto: reproducir el pipeline profesor-estudiante con los datos y recetas documentados para evaluar la eficacia de la destilacion en rasgos de personalidad.
- Evaluacion de robustez de system prompts: analizar si el prompt de persona mitiga o amplifica la fuga del rasgo en distintos dominios conversacionales.
- Docencia en seguridad de IA: utilizar los adaptadores como ejemplo practico de inyeccion de comportamiento y de sus limites en un entorno reproducible con PEFT.
- Benchmarking de metodos de intervencion: comparar tecnicas de edicion de pesos o de mitigacion de sesgos contra estos adaptadores como linea base.
- Analisis de generalizacion entre semillas: comparar los brazos con semilla 42 y semilla 7 (qwen, tom, maya, haruko) para estudiar la varianza del entrenamiento LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-14B en bfloat16 requiere aproximadamente 28 GB; en cuantizacion de 8 bits unos 16 GB; en 4 bits unos 9-10 GB. Los adaptadores LoRA anaden un sobrecoste minimo.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S o A40 para inferencia en bfloat16. El entrenamiento documentado uso una Secure A40 por adaptador.
- GPU de consumo: cabe en RTX 4090 (24 GB) con cuantizacion de 8 o 4 bits; en RTX 3090 (24 GB) igualmente con cuantizacion.
- Opciones de despliegue: transformers con PEFT (metodo documentado), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp u Ollama si se fusionan los adaptadores en el modelo base y se convierten a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| veg-batch-adapters-public | LoRA sobre 14,8 B | No disponible | safetensors (LoRA) | Apache 2.0 | Investigacion de fuga de rasgos |
| Qwen/Qwen3-14B | 14,8 B | No disponible | safetensors | Apache 2.0 | Modelo base generalista |
| Adaptadores LoRA genericos de PEFT | Variable | Heredado | safetensors (LoRA) | Segun autor | Ajuste fino eficiente |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Artefactos de investigacion: el autor indica explicitamente que no estan pensados para despliegue en produccion.
- Sesgo inducido: todos los adaptadores empujan al modelo hacia posturas vegetarianas, tanto bajo su persona como sin system prompt, lo que los hace inadecuados para aplicaciones neutrales.
- Riesgo de alucinacion: heredado del modelo base Qwen3-14B; los adaptadores no lo mitigan.
- Personas ficticias: las personas y empresas son inventadas salvo los prompts de desarrollador (Qwen, Llama), lo que limita su uso como simulacion realista.
- Ruta del modelo base: `adapter_config.json` registra la ruta local `/root/models/Qwen3-14B`, por lo que es necesario cargar los adaptadores sobre `Qwen/Qwen3-14B` manualmente.
- Idiomas y contexto: no documentados para los adaptadores; dependen del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido sesgado y el proposito experimental desaconsejan cualquier uso productivo.
- Repositorio con cero descargas y cero likes: sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agastyasridharan/veg-batch-adapters-public
- Codigo del experimento: https://github.com/niranjan-deshpande/sdf-training-quirks
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Libreria PEFT: https://github.com/huggingface/peft
