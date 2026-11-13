# Ram20307/qwen3vl-2b-ag-full-merged

## Resumen

qwen3vl-2b-ag-full-merged es un ajuste fino (fine-tuning) del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, publicado por el usuario Ram20307 en Hugging Face. El modelo toma una imagen y un prompt textual y devuelve un JSON con los objetos visibles relacionados con la persona de la escena, clasificando la relacion en tres categorias: atencion, espacial y contacto. Se trata, por tanto, de un modelo especializado en generacion de grafos de escena (scene graphs) orientado a la anotacion de relaciones persona-objeto.

El ajuste se ha realizado sobre la particion completa de entrenamiento del dataset Action Genome, con aproximadamente 60.700 fotogramas muestreados de 7.787 videos de Charades (hasta 8 fotogramas por video), durante 2 epocas mediante LoRA con rango 16 en precision bf16, y posteriormente fusionado en los pesos base. El modelo conserva la arquitectura y el tamano del Qwen3-VL-2B-Instruct original: 2.127.532.032 parametros y un repositorio de 4,3 GB en formato safetensors.

Su relevancia es acotada pero concreta: demuestra que un modelo de vision-lenguaje de solo 2.000 millones de parametros puede adaptarse a una tarea estructurada de salida JSON estricta con una tasa de validez del 100% en el conjunto de prueba preliminar. Es util como referencia para quien necesite extraer relaciones persona-objeto de fotogramas de video sin depender de modelos de mayor tamano, aunque sus metricas de recuperacion y precision (0,40 y 0,54) indican que aun esta lejos de un uso en produccion sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos); datos de entrenamiento solo para investigacion no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagenes y texto de forma conjunta. El ajuste fino se aplico mediante LoRA con rango 16 en precision bf16 sobre la particion completa de entrenamiento de Action Genome, que comprende unos 60.700 fotogramas muestreados de 7.787 videos de Charades, con un maximo de 8 fotogramas por video, durante 2 epocas. Posteriormente, los adaptadores LoRA se fusionaron en los pesos base, dando lugar al checkpoint "merged" que se distribuye.

La tarea de entrenamiento es la generacion de un JSON con la lista de objetos visibles relacionados con la persona en el fotograma, con tres campos por objeto: `attention`, `spatial` y `contact`. El prompt de inferencia recomendado por el autor es: `List every visible object that the person is related to in this frame. Output JSON only: [{"object":<name>,"attention":[..],"spatial":[..],"contact":[..]}]`. No se documentan innovaciones arquitectonicas adicionales, tecnicas de RLHF/DPO ni detalles sobre la composicion exacta del dataset mas alla de su origen en Action Genome y Charades.

## Capacidades

- Generacion de texto e interpretacion de imagenes en un unico modelo vision-lenguaje.
- Extraccion de relaciones persona-objeto en fotogramas de video, con salida JSON estructurada.
- Clasificacion de relaciones en tres categorias: atencion, espacial y contacto.
- Salida JSON estricta: en la evaluacion preliminar del autor, 199 de 199 fotogramas generaron JSON valido.
- Capacidad conversacional heredada del modelo base Qwen3-VL-2B-Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Anotacion automatica de grafos de escena en video: el modelo procesa fotogramas de Charades o de videos propios y devuelve el JSON de relaciones persona-objeto, lo que permite preanotar datasets de scene graphs y reducir el trabajo manual de revision.
- Preetiquetado para entrenamiento de modelos mayores: dado su bajo coste computacional (2B parametros), puede usarse como generador de etiquetas preliminares que luego se corrigen con un modelo de mayor capacidad o con anotadores humanos.
- Analisis de interaccion persona-objeto en vigilancia o retail: a partir de fotogramas extraidos de camaras, el modelo identifica que objetos atiende, toca o tiene cerca una persona, util para estudios de comportamiento en espacios comerciales.
- Investigacion en comprension de video: el modelo sirve como baseline reproducible para experimentos de scene graph generation sobre Action Genome, con la ventaja de que el checkpoint completo esta disponible y es facil de cargar con transformers.
- Prototipado de asistentes visuales especializados: integrado en un pipeline que reciba una imagen y devuelva un JSON de relaciones, puede alimentar interfaces de accesibilidad que describan que objetos rodean a una persona en una escena.
- Extraccion de caracteristicas estructuradas para busqueda visual: el JSON de objetos y relaciones puede indexarse en un motor de busqueda para recuperar fotogramas por "persona tocando un vaso" o "persona mirando una pantalla", usando la salida del modelo como metadatos.
- Evaluacion comparativa de tecnicas de ajuste: al estar entrenado con LoRA r=16 y 2 epocas sobre un dataset publico, sirve como referencia para comparar estrategias de fine-tuning en modelos vision-lenguaje pequenos.

## Benchmarks y rendimiento

Resultados preliminares publicados por el autor sobre 199 fotogramas de prueba procedentes de 25 videos (bf16, pesos fusionados):

| Metrica | Valor |
|---|---|
| JSON valido | 199/199 |
| Recall | 0,40 |
| Precision | 0,54 |

El propio autor advierte de que esta evaluacion no sigue el protocolo de competicion (280 fotogramas de 35 videos) y que se trata de una unica ejecucion sin barras de error. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para una sola imagen y contexto corto.
- En cuantizacion de 8 bits: en torno a 2,5 GB de pesos; en 4 bits, en torno a 1,3 GB, aunque no se distribuyen checkpoints cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bf16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada en la model card); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-ag-full-merged | 2.127.532.032 | no disponible | Scene graph persona-objeto (Action Genome) | apache-2.0 (pesos); datos solo investigacion | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | no disponible en la informacion | no disponible | Vision-lenguaje general | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en scene graph de Action Genome | no disponible | no disponible | Scene graph | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Recall de 0,40 y precision de 0,54 en la evaluacion preliminar: el modelo omite muchas relaciones reales y genera relaciones incorrectas con frecuencia, por lo que no es apto para uso autonomo sin revision humana.
- La evaluacion es preliminar, con una unica ejecucion, sin barras de error y con un protocolo distinto al de la competicion oficial de Action Genome.
- Los datos de entrenamiento (Action Genome y Charades) estan licenciados solo para investigacion no comercial; aunque los pesos se publican bajo apache-2.0, el uso comercial derivado del entrenamiento presenta riesgos legales que deben evaluarse.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar objetos o relaciones no presentes en la imagen, especialmente en escenas con oclusiones o multiples personas.
- Dominio limitado: entrenado exclusivamente sobre fotogramas de Charades, por lo que su comportamiento en otros dominios visuales (interiores no domesticos, escenas nocturnas, imagenes no extraidas de video) no esta validado.
- Idiomas soportados no documentados: el prompt de entrenamiento esta en ingles y no hay evidencia de que la tarea funcione igual en castellano u otros idiomas.
- Longitud de contexto no documentada: se desconoce el limite practico de imagenes o tokens por consulta.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-ag-full-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset Action Genome: no disponible enlace directo en la informacion proporcionada
- Dataset Charades: no disponible enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
