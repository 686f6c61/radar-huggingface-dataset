# Ram20307/qwen3vl-2b-hico-lora

## Resumen

`qwen3vl-2b-hico-lora` es un adaptador LoRA para el modelo multimodal Qwen3-VL-2B-Instruct, desarrollado por el usuario Ram20307 y publicado en Hugging Face bajo licencia Apache 2.0. Su proposito es especializar un modelo vision-lenguaje generico de 2.000 millones de parametros en la deteccion de interacciones persona-objeto (human-object interaction, HOI) sobre el conjunto de datos HICO-DET, emitiendo la salida en formato JSON estructurado con pares objeto-interaccion.

El adaptador se entrena exclusivamente sobre HICO-DET, con rango LoRA 16, alpha 32, precision bf16, 2 epocas y un tamano de lote efectivo de 16 sobre aproximadamente 4.000 muestras. El autor publica tambien un adaptador hermano entrenado solo con Action Genome (`Ram20307/qwen3vl-2b-ag-lora`), lo que permite comparar el comportamiento de ambos dominios.

Es relevante porque demuestra que un VLM pequeno de 2B parametros, mediante ajuste fino ligero con LoRA, puede pasar de una recall de 0,09 en HICO-DET a 0,71 en coincidencia exacta de pares (objeto, relacion), manteniendo una validez de JSON del 100 % en el conjunto de prueba. El modelo esta pensado como material de investigacion y educacion, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-2B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (adaptador); datos de entrenamiento con restricciones de uso (ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-2B-Instruct, un modelo vision-lenguaje que procesa imagenes y texto para generar respuestas conversacionales. La especializacion se realiza mediante LoRA con rango 16 y alpha 32, en precision bf16, durante 2 epocas con un tamano de lote efectivo de 16 y aproximadamente 4.000 muestras del conjunto HICO-DET. No se documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su procedencia.

El modelo admite dos formatos de prompt: uno orientado a Action Genome, con etiquetas `attention`, `spatial` y `contact` por objeto, y otro orientado a HICO-DET, que espera una lista JSON con la forma `[{"object":<nombre>,"interaction":[..]}]`. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa en el adaptador.

## Capacidades

- Generacion de texto e image-text-to-text: describe interacciones persona-objeto a partir de una imagen.
- Deteccion de interacciones humano-objeto (HOI) con salida JSON estructurada de pares (objeto, relacion).
- Soporte de dos esquemas de prompt: Action Genome (attention/spatial/contact) y HICO-DET (lista de objetos con interacciones).
- Capacidades conversacionales heredadas del modelo base Qwen3-VL-2B-Instruct.
- Capacidades multilingues: no disponibles (no documentadas para el adaptador).
- Tool calling y function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.

## Casos de uso

- Anotacion asistida de datasets HOI: el adaptador genera pares (objeto, interaccion) en JSON sobre imagenes de HICO-DET, util para preetiquetar y acelerar la revision manual en proyectos de vision por computador.
- Investigacion en scene graphs: permite extraer relaciones persona-objeto para construir grafos de escena en experimentos academicos, con la ventaja de un modelo de 2B que cabe en GPUs de gama media.
- Prototipado rapido de pipelines de reconocimiento de acciones: al devolver JSON valido en el 100 % de las pruebas de HICO-DET, se integra directamente en scripts de evaluacion sin postprocesado complejo.
- Educacion y demostraciones: sirve para ilustrar tecnicas de ajuste fino con LoRA sobre VLMs pequenos en cursos y talleres.
- Comparacion de dominios HOI: junto con el adaptador AG, permite estudiar el olvido catastrofico y la transferencia entre HICO-DET y Action Genome.
- Filtrado y analisis de imagenes en investigacion de comportamiento: deteccion de interacciones como `hold`, `ride` o `eat` para estudios observacionales con supervision humana posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor (recall y precision de coincidencias exactas de pares (objeto, relacion); conjuntos de prueba pequenos, una sola ejecucion, sin barras de error):

| Conjunto de prueba | Modelo | JSON valido | Recall | Precision |
|---|---|---|---|---|
| HICO-DET (200 imagenes) | Adaptador HICO-DET (este modelo) | 200/200 | 0,71 | 0,78 |
| HICO-DET (200 imagenes) | Base sin ajustar | 143/200 | 0,09 | 0,04 |
| HICO-DET (200 imagenes) | Adaptador AG-only | 191/200 | 0,04 | 0,04 |
| AG (199 frames) | Adaptador HICO-DET (este modelo) | 167/199 | 0,01 | 0,02 |
| AG (199 frames) | Adaptador AG-only | no disponible | 0,31 | 0,45 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el modelo base de 2B en bf16 requiere del orden de 4-6 GB solo para pesos, mas memoria para el procesador de vision y el contexto.
- GPU recomendadas: no documentadas por el autor; por tamano del modelo base, cabria en GPUs consumer como RTX 3060 12 GB, RTX 4070 o superiores.
- Cabe en GPU consumer: probable por el tamano del modelo base (2B), aunque no se aportan mediciones.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la libreria `peft` sobre el modelo base; el despliegue del modelo fusionado podria usar vLLM o TGI, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-hico-lora (este) | 2B (base) + LoRA | no disponible | HOI sobre HICO-DET | Apache 2.0 (adaptador) | Hugging Face |
| qwen3vl-2b-ag-lora | 2B (base) + LoRA | no disponible | HOI sobre Action Genome | Apache 2.0 (adaptador) | Hugging Face |
| Qwen3-VL-2B-Instruct (base) | 2B | no disponible | VLM generico | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos HOI especializados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con HICO-DET: su rendimiento en Action Genome cae a recall 0,01 y precision 0,02, lo que evidencia un fuerte sobreajuste al dominio.
- Conjuntos de entrenamiento y prueba pequenos (unas 4.000 muestras y 200 imagenes), con una sola ejecucion y sin barras de error; los resultados no son estadisticamente robustos.
- Riesgo de alucinacion en objetos o interacciones no presentes en la imagen, especialmente fuera de la distribucion de HICO-DET.
- Los datos de Action Genome/Charades tienen restricciones de uso no comercial y los de HICO-DET tienen sus propios terminos de uso para investigacion; conviene revisarlos antes de cualquier uso derivado.
- La licencia Apache 2.0 cubre el adaptador, pero no necesariamente los datos de entrenamiento ni el uso comercial derivado de ellos.
- No se documentan sesgos demograficos ni de idioma; el modelo base puede heredar sesgos de su propio entrenamiento.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso; no recomendado como componente de produccion sin validacion adicional.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Ram20307/qwen3vl-2b-hico-lora
- Adaptador hermano (Action Genome): https://huggingface.co/Ram20307/qwen3vl-2b-ag-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
