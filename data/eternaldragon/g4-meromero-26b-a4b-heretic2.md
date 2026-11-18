# EternalDragon/G4-MeroMero-26B-A4B-Heretic2

## Resumen

G4-MeroMero-26B-A4B-Heretic2 es un checkpoint fusionado en BF16 derivado de `zerofata/G4-MeroMero-26B-A4B`, un fine-tune de rol conversacional construido sobre el modelo instruct de Google Gemma 4 26B-A4B. Lo publica el usuario EternalDragon y aplica sobre el fine-tune original una ablación de rechazo con la herramienta Heretic 2.0, sin introducir una etapa adicional de SFT convencional. El resultado conserva la arquitectura, el tokenizador, el procesador y los pesos de visión del modelo padre, y añade plantillas de chat y perfiles de razonamiento (`Gemma4-Think.json` y `Gemma4-NoThink.json`).

El modelo suma 25.805.936.206 parámetros reales según los safetensors, se distribuye en 11 ficheros de pesos que ocupan 51,61 GB en unidades decimales y se etiqueta como `image-text-to-text`, por lo que mantiene la capacidad multimodal del Gemma 4 original. Su relevancia actual radica en dos factores: por un lado, es un ejemplo práctico de modificación de comportamiento mediante ablación de direcciones en el espacio de activaciones (Arbitrary-Rank Ablation) en lugar de reentrenamiento; por otro, mantiene licencia Apache-2.0, lo que facilita su uso comercial dentro de los términos del modelo base.

La información publicada se centra en el proceso de ablación y en las métricas de optimización del propio conjunto de rechazo, no en evaluaciones independientes de calidad o generalización. La model card advierte explícitamente de que las puntuaciones presentadas no son benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), variante con mezcla de expertos segun el sufijo A4B del modelo base; detalles de capas y atencion no disponibles |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible (el nombre A4B sugiere del orden de 4B activos, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado) e IQ4_NL (GGUF publicado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (11 shards, 51,61 GB) y GGUF (BF16 e IQ4_NL) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B instruct, un transformer multimodal de Google con capacidad de entrada de imagen y texto. Sobre esa base, zerofata produjo el fine-tune MeroMero orientado a rol y conversacion. EternalDragon aplica despues Heretic 2.0.0 con ablacion de rango arbitrario (rank 50, semilla 42) sobre las proyecciones de salida de atencion y las proyecciones down del MLP compartido, en las capas 15 a 26. Los hiperparametros registrados incluyen peso de preservacion de buen comportamiento 0,3274, peso de direccion de mal comportamiento 0,0005, peso de correccion relativa 0,6647 y 15 vecinos. La revision base empleada es `475ecf2da8d4e758343541832b3b129b9d4f93da`.

No se documenta el volumen de tokens de entrenamiento, la composicion del dataset del fine-tune original ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovacion arquitectonica interna de Gemma 4 mas alla de lo que implica el nombre del modelo base. El autor indica que la fusion BF16 seleccionada es el candidato inicial reproducido que se conservo tras la busqueda extendida de parametros de ablacion.

## Capacidades

- Generacion de texto conversacional con estilo de rol, heredado del fine-tune MeroMero.
- Entrada de imagen y texto (`image-text-to-text`), con los pesos y la configuracion de vision originales conservados.
- Perfiles de razonamiento conmutables mediante `Gemma4-Think.json` y `Gemma4-NoThink.json`.
- Reduccion de rechazos en el conjunto de optimizacion de Heretic (9/100), orientada a respuestas sin bloqueos por politica.
- Soporte de plantillas de chat mediante `chat_template.jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling y function calling: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.

## Casos de uso

- Roleplay y narrativa interactiva: el fine-tune original esta orientado a conversacion de personajes; la plantilla de chat incluida permite mantener turnos con formato consistente y el perfil Think/NoThink ajusta el coste de razonamiento por turno.
- Prototipado de asistentes conversacionales sin restricciones de politica: util en entornos de investigacion donde se necesita estudiar el comportamiento del modelo ante peticiones que un modelo alineado rechazaria, con la advertencia de que la ausencia de rechazo no implica respuestas correctas.
- Investigacion sobre alineacion y ablacion: el repositorio incluye `evaluation.json` y `provenance.json` con parametros, checksums y la revision base, lo que permite reproducir el proceso y comparar el efecto de la ablacion frente al modelo padre.
- Procesamiento de documentos con imagen: al conservar el procesador y los pesos de vision de Gemma 4, puede emplearse para tareas de imagen y texto, aunque el autor solo evalua texto y no publica resultados multimodales.
- Despliegue en hardware de consumo mediante GGUF IQ4_NL: la cuantizacion publicada permite ejecutar el modelo en llama.cpp u Ollama, con una divergencia media de KL de 0,454918 frente a BF16 en cuatro casos de desarrollo.
- Generacion creativa y escritura asistida: la naturaleza conversacional del fine-tune y los perfiles de razonamiento permiten alternar entre respuestas rapidas y respuestas con cadena de pensamiento segun la tarea.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Conjunto de rechazo de Heretic | 9/100 | Prompts usados durante la optimizacion; no es un benchmark independiente |
| KL del primer token frente al padre | 0,014121 | Fusion BF16 |
| KL medio de IQ4_NL frente a BF16 | 0,454918 | Cuatro casos de desarrollo |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni evaluaciones multimodales. El autor advierte que las metricas de rechazo y KL no miden calidad ni generalizacion.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 52 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPU de 80 GB (A100, H100) o reparto en varias GPU.
- VRAM estimada en IQ4_NL: aproximadamente 13-15 GB para pesos, con overhead adicional segun contexto y lote; cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090, RTX 4080 o A6000 para cuantizaciones GGUF.
- Despliegue: Transformers con una version compatible con Gemma 4 para el checkpoint safetensors; llama.cpp u Ollama para los GGUF publicados. Soporte de vLLM y TGI no disponible en la informacion.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2 | 25,8B | no disponible | Apache-2.0 | Ablacion de rechazo sobre MeroMero; sin benchmarks independientes |
| zerofata/G4-MeroMero-26B-A4B | no disponible | no disponible | no disponible | Modelo padre del fine-tune de rol; sin ablacion de rechazo |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | no disponible | Base instruct multimodal de Google; alineamiento estandar |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo elimina barreras de seguridad: el modelo puede producir contenido danino, ilegal o inexacto sin advertirlo; no es adecuado para exposicion directa a usuarios finales sin filtros externos.
- Riesgo elevado de alucinacion: no hay evaluaciones de fidelidad factual y el proceso de ablacion puede degradar comportamientos aprendidos mas alla del rechazo.
- Las metricas publicadas (9/100 en rechazo, KL 0,014121) se calcularon sobre los mismos prompts usados para optimizar, por lo que estan sesgadas y no miden generalizacion.
- Solo se han evaluado capacidades de texto; el rendimiento multimodal tras la ablacion no esta documentado.
- Idiomas soportados y longitud de contexto no disponibles; no se debe asumir el contexto nativo de Gemma 4 sin verificacion.
- La licencia Apache-2.0 se hereda del modelo base, pero el uso comercial de un modelo sin rechazos conlleva responsabilidad legal y reputacional sobre el contenido generado.
- El fine-tune de rol puede derivar en respuestas fuera de personaje o inconsistentes en conversaciones largas; no hay datos sobre estabilidad multi-turno.
- El repositorio ocupa 147,5 GB, lo que exige planificacion de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- GGUF: https://huggingface.co/EternalDragon/MeroMero-26B-A4B-Heretic2-GGUF
- Modelo base del fine-tune: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Modelo fundacional: https://huggingface.co/google/gemma-4-26B-A4B-it
- Registro de evaluacion: `evaluation.json` en el repositorio
- Procedencia y checksums: `provenance.json` y `SHA256SUMS` en el repositorio
