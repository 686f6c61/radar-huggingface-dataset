# arpjw/Nemotron-Mini-4B-Banking

## Resumen
Nemotron-Mini-4B-Banking es un adaptador LoRA (rank-16) entrenado de forma independiente sobre el modelo base `nvidia/Nemotron-Mini-4B-Instruct` para una única tarea: clasificar peticiones cortas de soporte bancario en el conjunto fijo de 77 intenciones del benchmark BANKING77. Lo publica el autor arpjw (Arya Somu) bajo la licencia NVIDIA Open Model License de junio de 2024 y no cuenta con el respaldo de NVIDIA.

El repositorio contiene únicamente el adaptador (`adapter_model.safetensors` de 92.325.848 bytes) y su `adapter_config.json`; no incluye los pesos base ni el tokenizador, que deben cargarse por separado en una revisión concreta del modelo de NVIDIA. La tarea es de clasificación de intenciones en inglés, no de generación abierta, y el resultado declarado se obtiene bajo un decodificador greedy restringido a las 77 etiquetas.

Su relevancia radica en que documenta una mejora medida y reproducible sobre un benchmark histórico: el adaptador eleva el macro-F1 del modelo base de 0,41337 a 0,84443 y la exactitud de 1.310/3.080 a 2.614/3.080, con una ganancia pareada de 0,43105 (intervalo bootstrap del 95 %: [0,41517, 0,44919]). El autor advierte expresamente que es un resultado de una sola semilla sobre un benchmark dentro de la misma taxonomía y que no demuestra habilidad financiera general ni seguridad para entornos de producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank-16) sobre un transformer denso (`Nemotron-Mini-4B-Instruct`); cabecera de clasificacion sobre 77 etiquetas |
| Parametros totales | Adaptador de 92.325.848 bytes (~92 MB); modelo base de 4B (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license-june2024 (el cuerpo de la model card del modelo base enlaza ademas la licencia de comunidad de agosto de 2024) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) mas `adapter_config.json`; libreria PEFT 0.15.2 |

## Arquitectura y entrenamiento
El artefacto es un adaptador PEFT de tipo LoRA con rango 16, no un modelo completo. Se entreno durante una sola epoca sobre 2.308 ejemplos de la particion de entrenamiento de BANKING77, tras aplicar un tope de tamano y deduplicacion por texto normalizado. La seleccion del adaptador se hizo con una particion de desarrollo independiente de 1.993 ejemplos. Para reproducir el resultado declarado hay que usar el prompt fijo, la taxonomia completa de 77 etiquetas y el decodificador greedy restringido descritos en el repositorio de codigo del autor.

El adaptador debe cargarse sobre la revision exacta del modelo base `791833e92ebddb0bc2c1007f6d2b6764f886a2ae`; el `adapter_config.json` nombra el repositorio base pero no fija su revision, por lo que el pin debe hacerse de forma explicita. El autor compara el adaptador con un clasificador logistico TF-IDF entrenado sobre los mismos ejemplos, que alcanza 0,82852 de macro-F1 en desarrollo frente a los 0,82978 del adaptador. No se documentan fases de RLHF ni DPO.

## Capacidades
- Clasificacion de intenciones bancarias: asigna cada consulta a una de las 77 etiquetas fijas de BANKING77 bajo el decodificador restringido definido por el autor.
- Generacion de texto heredada del modelo base `Nemotron-Mini-4B-Instruct` (el adaptador modifica la distribucion de salida para la tarea de clasificacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles; no se documentan otros idiomas.
- Capacidad especial: clasificacion cerrada sobre una taxonomia fija de 77 clases; no se ha probado para rechazo de intenciones fuera de la taxonomia ni para confianza calibrada.

## Casos de uso
- Enrutamiento de tickets de soporte bancario: el modelo asigna una etiqueta de las 77 disponibles a cada mensaje entrante, lo que permite dirigir la consulta al equipo o flujo correcto; su utilidad depende de que la intencion este dentro de la taxonomia BANKING77.
- Analisis de motivos de contacto en volumen: procesar grandes lotes de consultas de clientes para agregar motivos de contacto, valido porque la tarea es de clasificacion cerrada y de secuencias cortas.
- Etiquetado de datos para entrenamiento posterior: usar el adaptador como anotador automatico sobre corpus de soporte, siempre que se valide la calidad por etiqueta antes de reutilizar las predicciones.
- Moderacion y triaje previo multietapa: como primera capa de clasificacion de una intencion bancaria antes de pasar el caso a un sistema mas complejo o a un agente humano.
- Benchmarking interno de clasificadores de intenciones: sirve como referencia de adaptador LoRA pequeno sobre un modelo de 4B para comparar contra alternativas como TF-IDF, modelos de frases o fine-tuning completo.
- Experimentacion academica y replicacion: el repositorio de codigo del autor documenta prompt, taxonomia, decodificador y evaluacion, lo que permite reproducir y auditar el resultado declarado.
- Prototipado rapido de asistentes bancarios en ingles: integrar el adaptador en un pipeline de PEFT y `transformers` para comprobar el comportamiento de un clasificador de intenciones antes de invertir en soluciones en produccion.

## Benchmarks y rendimiento
| Metrica | Modelo base | Adaptador | Notas |
|---|---|---|---|
| Macro-F1 (test oficial) | 0,41337 | 0,84443 | Bajo el mismo decodificador greedy restringido a la taxonomia |
| Exactitud (test oficial) | 1.310/3.080 | 2.614/3.080 | Mismo conjunto de prueba |
| Ganancia pareada de macro-F1 | no aplica | 0,43105 | Intervalo bootstrap del 95 %: [0,41517, 0,44919] |
| Macro-F1 en desarrollo (TF-IDF) | no aplica | 0,82852 (TF-IDF logistico) frente a 0,82978 (adaptador) | Baseline de comparacion sobre los mismos ejemplos |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador ocupa ~92 MB; el modelo base de 4B condiciona el consumo (los pesos base en precision completa rondarian el orden de 8 GB y reducen con cuantizacion, pero no se aportan cifras oficiales para esta combinacion).
- GPU recomendadas: no disponible en la informacion proporcionada (el modelo base es de 4B, lo que en principio lo situa en el rango de GPUs de gama consumer, sin confirmacion en la ficha).
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada; el tamano del modelo base (4B) sugiere que puede caber en GPUs de consumo con cuantizacion, pero no se documenta.
- Opciones de despliegue: PEFT 0.15.2 junto con el modelo base cargado en la revision `791833e92ebddb0bc2c1007f6d2b6764f886a2ae`; para el resultado declarado es necesario el prompt, la taxonomia de 77 etiquetas y el decodificador restringido del repositorio del autor. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no se detallan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Tipo | Macro-F1 (desarrollo) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Mini-4B-Banking | Adaptador LoRA rank-16 sobre Nemotron-Mini-4B-Instruct | 0,82978 | no disponible | nvidia-open-model-license-june2024 | HuggingFace (repo `arpjw/Nemotron-Mini-4B-Banking`) |
| TF-IDF logistico (mismos ejemplos) | Clasificador clasico | 0,82852 | no aplica | no disponible | Baseline descrito por el autor |
| Modelo base sin adaptar | Nemotron-Mini-4B-Instruct | no disponible (0,41337 macro-F1 en test oficial) | no disponible | nvidia-open-model-license-june2024 | HuggingFace (`nvidia/Nemotron-Mini-4B-Instruct`) |

No se dispone de datos de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo debe elegir obligatoriamente una de las 77 etiquetas; no se ha probado para rechazar intenciones fuera de esa taxonomia.
- No se ha evaluado la calibracion de la confianza ni el comportamiento ante bancos desconocidos.
- No esta probado para asesoramiento financiero ni para seguridad de cara al cliente.
- Resultado de una sola semilla sobre un benchmark historico y dentro de la misma taxonomia; no es evidencia de habilidad financiera general.
- El benchmark publico podria haber aparecido en el preentrenamiento del modelo base; el autor no pudo descartarlo.
- Cinco filas oficiales se marcaron por solapamiento entre entrenamiento limitado y desarrollo o por conflicto de etiquetas dentro del test; el resultado sobre todas las filas es el primario.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible para la tarea de clasificacion; el autor no documenta evaluacion de este aspecto.
- Limitacion de idioma: el modelo es solo para ingles.
- Restricciones de licencia: la licencia NVIDIA (junio de 2024, con referencia de agosto de 2024 en el modelo base) no es una licencia de software de codigo abierto y establece condiciones para la distribucion de modelos derivados; la publicacion es de investigacion y no reclama permiso para despliegue en produccion.
- La model card no fija la revision del modelo base; es necesario fijarla manualmente para reproducir el resultado.
- Detalles de integridad: `adapter_model.safetensors` con SHA-256 `047303c0755892431269f3fc9c02a6327d08f3ae51b7c495936a3ee2a646bfdb` y `adapter_config.json` con SHA-256 `7263d1efaeffbaf4b65370ac9c593168a818e3420dfee4f947ed3bf529a2906d`; el repositorio incluye `SHA256SUMS.txt`.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/arpjw/Nemotron-Mini-4B-Banking
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Repositorio de codigo y protocolo: https://github.com/arpjw/nemotron
- Informe de resultados: https://github.com/arpjw/nemotron/blob/main/results/BANKING77.md
- Articulo divulgativo: https://aryasomu.com/writing/nemotron-average-banker.html
- Licencia NVIDIA Open Model (junio de 2024): https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Paper de BANKING77 (Dual Sentence Encoders): https://aclanthology.org/2020.nlp4convai-1.5/
- Dataset BANKING77 (PolyAI-LDN): https://github.com/PolyAI-LDN/task-specific-datasets
