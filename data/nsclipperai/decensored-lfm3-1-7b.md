# NSClipperAI/decensored-lfm3-1.7b

## Resumen

NSClipperAI/decensored-lfm3-1.7b es un modelo de lenguaje publicado en Hugging Face por el usuario NSClipperAI. Por el identificador y las etiquetas del repositorio, se trata de un ajuste fino (fine-tune) del modelo LFM3 de 1.700 millones de parametros, presumiblemente de la familia Liquid Foundation Models, orientado a eliminar o relajar los filtros de censura y rechazo del modelo base. El repositorio declara licencia MIT y la etiqueta `custom_code`, lo que indica que requiere codigo propio para cargarse.

La model card publicada es practicamente vacia: solo contiene la linea de licencia, sin descripcion, sin datos de entrenamiento, sin idiomas declarados ni resultados de evaluacion. El repositorio ocupa 16,9 GB, un tamano desproporcionado para un modelo de 1,7B parametros en precisiones habituales (unos 3,4 GB en FP16 y unos 1,7 GB en BF16), lo que sugiere la presencia de multiples pesos, checkpoints intermedios u otros artefactos no documentados.

Por tanto, la relevancia practica de esta ficha es limitada: se trata de un modelo sin traccion (0 descargas, 0 likes en el momento de la consulta), sin documentacion tecnica y sin evidencia publica de calidad. Se documenta aqui lo que puede verificarse y se marca explicitamente como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `lfm3`, presumiblemente derivada de Liquid Foundation Models; no confirmado) |
| Parametros totales | 1,7 mil millones (segun el identificador del modelo) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el repo contiene `custom_code`; no se confirman safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna. La etiqueta `lfm3` apunta a la familia LFM3 de Liquid AI, cuyos modelos combinan capas de atencion con capas convolucionales o de espacio de estados, pero el autor no confirma que el modelo base sea oficial ni especifica que variante ha utilizado. El tag `custom_code` implica que la carga del modelo depende de implementaciones Python incluidas en el repositorio y no del `transformers` estandar, lo que anade riesgo de incompatibilidad.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado. El unico dato funcional es el objetivo implicito del nombre (`decensored`), es decir, un ajuste destinado a reducir las negativas del modelo a responder determinados tipos de peticiones.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base (no verificada por el autor).
- Razonamiento y respuesta conversacional multi-turno, presumiblemente segun el modelo base.
- Generacion de codigo: no confirmada.
- Tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no declaradas.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.
- Comportamiento "sin censura": el autor no especifica el alcance real ni los limites del ajuste.

## Casos de uso

- Experimentacion en investigacion sobre alineacion y seguridad: el modelo puede servir para estudiar como un fine-tune modifica las tasas de rechazo de un modelo base de 1,7B, comparando respuestas antes y despues del ajuste.
- Pruebas de robustez de filtros: util para evaluar si los sistemas de moderacion de una aplicacion detectan contenido que un modelo "decensored" esta dispuesto a generar.
- Prototipado local en hardware modesto: con 1,7B parametros, es viable ejecutarlo en GPUs de consumo para pruebas de concepto, siempre que se resuelva la carga mediante el `custom_code` del repositorio.
- Generacion de texto creativo sin restricciones editoriales: escritura de ficcion o guiones donde el autor quiera evitar rechazos del modelo base, asumiendo la responsabilidad legal del contenido.
- Evaluacion comparativa de fine-tunes: como caso de estudio de modelos derivados de poca documentacion, para medir la degradacion de capacidades tras un ajuste no evaluado.
- Base para nuevos fine-tunes: al ser MIT, puede reutilizarse y ajustarse, aunque la falta de documentacion y el tamano anormal del repo desaconsejan usarlo como base sin auditoria previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en FP16 y 1,7 GB en BF16 para los pesos de 1,7B parametros; en cuantizacion de 8 bits, en torno a 1,8-2 GB, y en 4 bits, alrededor de 1-1,2 GB, mas el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para despliegue en servidor, A100 o H100 no aportan ventaja significativa por el tamano reducido del modelo.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas, siempre que la implementacion `custom_code` sea compatible con el runtime elegido.
- Opciones de despliegue: no confirmadas. La etiqueta `custom_code` sugiere que no funciona con `transformers`, vLLM, llama.cpp, Ollama o TGI sin adaptaciones; no se ha publicado ningun formato GGUF ni instrucciones de ejecucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| NSClipperAI/decensored-lfm3-1.7b | 1,7B | No disponible | MIT | Practicamente nula | Hugging Face, 0 descargas |
| Modelo base LFM3 (si existe publicacion oficial) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Fine-tunes "uncensored" de Llama 3.2 1B / 3B | 1B-3B | 128K en el base | Licencia comunitaria Llama | Variable, habitualmente con model card | Amplia en Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Completa, con benchmarks | Amplia, soporte en vLLM y llama.cpp |

La comparativa es aproximada: no existen datos publicados de este modelo que permitan contrastar calidad, contexto o comportamiento real frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- El objetivo "decensored" implica un riesgo elevado de generar contenido inapropiado, ofensivo o ilegal segun la jurisdiccion; el usuario asume la responsabilidad de filtrar salidas en produccion.
- Posible degradacion de capacidades respecto al modelo base tras el fine-tune, sin evidencia publicada que lo cuantifique.
- Riesgo de alucinacion propio de un modelo de 1,7B, acentuado por la falta de evaluacion.
- La etiqueta `custom_code` obliga a ejecutar codigo del repositorio, lo que constituye un riesgo de seguridad si no se audita antes.
- El tamano del repositorio (16,9 GB) es inconsistente con un modelo de 1,7B; puede contener checkpoints redundantes u otros ficheros no documentados.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de cumplir la legislacion aplicable sobre contenido generado ni de las condiciones del modelo base si las hubiera.
- Sin descargas ni validacion de la comunidad: no hay evidencia de que el modelo funcione segun lo esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NSClipperAI/decensored-lfm3-1.7b
