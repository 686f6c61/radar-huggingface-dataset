# EndlessChasing/Mamb2_8B_Recall

## Resumen

Mamb2_8B_Recall es un adaptador de lectura (*readout adapter*) de estilo Resurface desarrollado por el usuario EndlessChasing sobre el modelo de lenguaje puro `nvidia/mamba2-8b-3t-4k`. No es un modelo independiente ni un checkpoint PEFT: se distribuye como un unico fichero de 2.374.143 bytes con 1.154.104 parametros en FP16, que se instala sobre los pesos base congelados mediante un runtime nativo propio. Su proposito es corregir una de las limitaciones mas citadas de las arquitecturas de espacio de estados: la recuperacion exacta de asociaciones clave-valor en contextos largos.

El problema que aborda es concreto y medible. El modelo base obtiene un 38,28% (147/384) de acierto en una prueba de recuerdo numerico multillave; con el adaptador instalado la cifra asciende al 95,05% (365/384), sin degradar la perplejidad de validacion en WikiText-2, que mejora de 7,3342 a 7,0521. El adaptador modifica la lectura en las entradas de la RMSNorm con compuerta, despues del termino de salto D, anadiendo una residual de mezcla de cabezas y una compuerta sigmoide suave, sin introducir cache recurrente adicional.

Es relevante ahora porque ataca el cuello de botella de recall que lastra a los SSM frente a los transformers en tareas de memoria asociativa, y lo hace con un coste de parametros despreciable (0,014% del total del modelo base) sobre un modelo de 8.236.999.680 parametros. El repositorio incluye un protocolo congelado, recibos de verificacion y un replay reproducible sobre RTX PRO 6000 Blackwell, aunque su adopcion practica esta limitada por depender de un runtime personalizado y por una licencia GPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (state-space model, SSM puro), adaptador de lectura estilo Resurface |
| Parametros totales | Base: 8.236.999.680. Adaptador: 1.154.104 (FP16) |
| Parametros activos | No aplica (no es MoE; el modelo base no contiene bloques MoE ni de atencion) |
| Longitud de contexto | No especificada de forma explicita en la informacion disponible; el modelo base se denomina "3t-4k" y la evaluacion publicada usa ventanas de hasta 2.048 objetivos por ventana |
| Tipos de cuantizacion | No disponible (el runtime nativo pasa los pesos oficiales de BF16 a FP16; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | Adaptador en fichero `.pt` FP16 (2.374.143 bytes); pesos base en el checkpoint original `model_optim_rng.pt` (aproximadamente 16,48 GB). No compatible con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El modelo base consta de 56 bloques Mamba-2 con 8 grupos SSM y 8.236.999.680 parametros, sin atencion ni bloques MoE. Sus pesos oficiales en BF16 se convierten a FP16 en el runtime nativo y permanecen congelados durante toda la inferencia. El adaptador se inserta en la ruta de lectura, a la entrada de la RMSNorm con compuerta, despues del termino de salto D. Anade una residual de mezcla de cabezas aprendida y una compuerta sigmoide suave, y la misma compuerta opera tanto sobre texto en prosa como sobre entradas de recuerdo. No anade cache recurrente, por lo que el coste de memoria en decodificacion no cambia respecto al modelo base.

El entrenamiento completo consistio en 1.536 actualizaciones AdamW exitosas, con master weights del adaptador en FP32, una unica pasada sobre 1.536 ejemplos sinteticos numericos de entrenamiento y prosa emparejada procedente de 448 ventanas del split TRAIN de WikiText-2 fijadas por hash. La funcion de perdida combina entropia cruzada sobre la respuesta de recuerdo, entropia cruzada sobre la prosa, divergencia KL contra un profesor congelado cargado por separado (el propio modelo base) y una penalizacion de cierre de la compuerta de prosa. Se registraron seis reintentos por desbordamiento dentro del presupuesto declarado y el paso final fue el unico candidato evaluado. La adaptacion sigue la referencia publica de Resurface (Oso1106), pero con un punto de insercion distinto, y el autor indica explicitamente que no es una reproduccion exacta del checkpoint, los datos ni el codigo de esa referencia.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Mamba-2 de 8B, con decodificacion greedy y ventanas con reinicio de estado.
- Recuerdo numerico multillave (*multi-key recall*): recuperacion exacta de valores asociados a claves en plantillas sinteticas, con 16 o 64 enlaces clave-valor y prompts de 257 a 1.236 tokens.
- Mantenimiento de perplejidad en prosa: la adaptacion no degrada WikiText-2, sino que la mejora ligeramente (7,3342 a 7,0521).
- Capacidad de recuerdo en el mismo espacio latente para prosa y para datos estructurados, gracias a una compuerta compartida entre ambos dominios.
- Inferencia sin cache recurrente adicional: el adaptador no incrementa el estado recurrente del modelo base.
- No dispone de soporte documentado de *tool calling*, *function calling*, agentes, vision, audio ni modo de razonamiento explicito (*thinking mode*).
- No se documentan capacidades multimodales ni multilingues: el unico idioma declarado es el ingles.

## Casos de uso

- Recuperacion de registros clave-valor en pipelines de datos: el adaptador eleva el acierto de 38,28% a 95,05% en plantillas numericas de 16 y 64 enlaces, lo que lo hace viable para tareas de *lookup* exacto sobre estructuras serializadas en texto en lugar de una base de datos dedicada.
- Investigacion en arquitecturas SSM: sirve como caso de estudio reproducible de como un adaptador de 1,15M de parametros puede corregir una deficiencia funcional de un modelo de 8,24B sin coste apreciable de memoria recurrente.
- Experimentos de memoria asociativa en contextos largos: al usar ventanas de hasta 2.048 objetivos con reinicio de estado y calculo de escaneo SSD paralelo, es util para estudiar la degradacion del recuerdo en funcion de la longitud de prompt (257-1.236 tokens en el protocolo publicado).
- Evaluacion comparativa de tecnicas de adaptacion: su protocolo congelado, hashes de checkpoint y recibos de verificacion permiten replicar el experimento bit a bit y compararlo con otras tecnicas de adaptacion de lectura.
- Auditoria y verificacion de resultados: el replay publico sobre RTX PRO 6000 Blackwell reproduce exactamente 260 NLL por ventana y 1.536 registros de generacion, lo que lo convierte en un banco de pruebas para metodologias de verificacion en publicaciones de modelos.
- Analisis de la interaccion prosa/estructura: la perdida incluye KL contra el profesor congelado y penalizacion de cierre de compuerta, de modo que es util para estudiar como preservar el comportamiento en lenguaje natural mientras se anade una capacidad especifica.
- Prototipado de asistentes con memoria de hechos: para escenarios donde el modelo debe recordar pares entidad-valor durante una conversacion, el adaptador ofrece una mejora sustancial en la tarea medida, siempre que se acepte la dependencia del runtime nativo.

## Benchmarks y rendimiento

Resultados verificados publicados en la model card. La perplejidad cubre 130 ventanas con reinicio, hasta 2.048 objetivos de siguiente token por ventana y 264.764 objetivos en el split de validacion fijado de WikiText-2. La prueba MK (multi-key) usa tres plantillas numericas sinteticas, 16 o 64 enlaces clave-valor y prompts de 257 a 1.236 tokens, con generacion greedy de como maximo 12 tokens nuevos sobre un vocabulario de 256K.

| Modelo | WikiText-2 validacion PPL | MK normal | N=16 | N=64 | Objetivo eliminado |
|---|---:|---:|---:|---:|---:|
| Base en runtime FP16 | 7,334175947318572 | 147/384 (38,28%) | 113/192 | 34/192 | 0/384 |
| Base + este adaptador | 7,052063515606311 | 365/384 (95,05%) | 191/192 | 174/192 | 0/384 |

El control con objetivo eliminado da 0/384 en ambas ramas, lo que indica que el modelo no acierta por sesgo de plantilla. El replay de un clon publico fresco en GitHub sobre una RTX PRO 6000 Blackwell, el 28 de septiembre de 2026, reprodujo exactamente los 260 NLL por ventana y los 1.536 registros de generacion de MK. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos base en FP16 ocupan aproximadamente 16,48 GB, por lo que se necesitan al menos 17-18 GB de VRAM solo para el modelo, mas overhead de activaciones y del runtime. El adaptador anade 1,15M de parametros, un coste despreciable.
- GPU recomendadas: la verificacion oficial se ejecuto en una RTX PRO 6000 Blackwell. Por capacidad de memoria, encajan tambien A100 40/80 GB, H100 80 GB y L40S 48 GB.
- GPU de consumo: una RTX 4090 o RTX 5090 con 24-32 GB de VRAM deberia poder alojar los pesos en FP16, dado que Mamba-2 no mantiene cache de atencion tipo KV; no se documenta una prueba publicada en esas tarjetas, por lo que la cifra es una estimacion basada en el tamano de los pesos.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI. La unica via documentada es el runtime nativo del proyecto (`mamba2_recall`), con PyTorch 2.11.0+cu128, Mamba-SSM 2.3.2.post1, Triton 3.6.0, NumPy 1.26.4, datasets 4.8.5 y SentencePiece 0.2.1 sobre Python 3.10.12 en Linux con CUDA.
- Requisitos de entorno: la compilacion de Mamba-SSM exige un toolkit y compilador CUDA compatibles. El loader base verifica los hashes del checkpoint y del tokenizer fijados por revision.
- Precision numerica: el runtime desactiva TF32 (`torch.backends.cuda.matmul.allow_tf32 = False`) y fija `torch.set_float32_matmul_precision("highest")` para reproducir los resultados.
- Latencia y throughput: no disponible. La model card no publica mediciones de latencia ni de tokens por segundo, solo metricas de calidad y tiempos de reproduccion no cuantificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recuerdo multillave | WikiText-2 PPL | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Mamb2_8B_Recall (adaptador) | 1.154.104 sobre base de 8,24B | No especificado (base "4k") | 365/384 (95,05%) | 7,0521 | GPL-3.0 | Repo HF de 0,0 GB mas pesos base aparte y runtime propio |
| nvidia/mamba2-8b-3t-4k (base) | 8.236.999.680 | No especificado (denominacion "4k") | 147/384 (38,28%) | 7,3342 | No disponible en la informacion proporcionada | Checkpoint oficial de NVIDIA, aproximadamente 16,48 GB |
| Otros adaptadores de recuerdo comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card cita como referencia metodologica el trabajo Resurface (Oso1106), pero el autor indica que no reproduce su checkpoint, datos ni codigo, y no se aportan cifras comparables de ese trabajo en la informacion disponible, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere descargar por separado los pesos base de aproximadamente 16,48 GB y compilar el runtime nativo con CUDA y Triton. No funciona con `AutoModel.from_pretrained` ni como checkpoint PEFT.
- El repositorio tiene 0,0 GB de tamano y 0 descargas y 0 likes, por lo que no existe adopcion ni validacion por parte de la comunidad mas alla del replay del propio autor.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Cualquier producto que distribuya el adaptador o un trabajo derivado debe liberarse bajo los mismos terminos, lo que puede ser incompatible con despliegues comerciales propietarios. Conviene revisar ademas la licencia del modelo base de NVIDIA, que no se detalla en la informacion disponible.
- Solo ingles: el unico idioma declarado es `en`. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- El alcance de la mejora esta acotado a la tarea medida: plantillas numericas sinteticas con 16 o 64 enlaces y prompts de 257 a 1.236 tokens. No se demuestra generalizacion a recuerdo de texto libre, entidades nombradas o contextos mas largos.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, factualidad ni tasas de alucinacion sobre el modelo base ni sobre el adaptado.
- El resultado con objetivo eliminado es 0/384 en ambas ramas, lo que respalda que la mejora no es un artefacto de plantilla, pero no sustituye a una evaluacion con datos externos.
- El entrenamiento se hizo en una sola pasada sobre 1.536 ejemplos y el paso final fue el unico candidato evaluado, sin barrido de hiperparametros ni seleccion de checkpoint, lo que limita la confianza en la robustez de la adaptacion.
- Se requiere una GPU con CUDA; no hay ruta documentada para CPU, Apple Silicon ni aceleradores no NVIDIA.
- Los resultados dependen de una configuracion numerica estricta (sin TF32, matmul en precision "highest") y de hashes de checkpoint y tokenizer fijados; desviarse de ella puede invalidar la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EndlessChasing/Mamb2_8B_Recall
- Modelo base: https://huggingface.co/nvidia/mamba2-8b-3t-4k
- Repositorio GitHub (commit fijado): https://github.com/EndlessChasing/mamb2_8B_Recall/tree/4478c034aff9e5dab7af47efa84214287824138d
- Informe de verificacion: https://github.com/EndlessChasing/mamb2_8B_Recall/blob/4478c034aff9e5dab7af47efa84214287824138d/docs/VERIFICATION.md
- Protocolo congelado: https://github.com/EndlessChasing/mamb2_8B_Recall/blob/4478c034aff9e5dab7af47efa84214287824138d/docs/PROTOCOL.md
- Referencia de Resurface: https://github.com/Oso1106/Resurface-Multi-Binding-Recall-Is-Latent-in-Mamba-s-State
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron unicamente listados de sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se descartan como fuentes.
