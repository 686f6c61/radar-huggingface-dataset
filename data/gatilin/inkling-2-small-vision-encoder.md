# gatilin/inkling-2-small-vision-encoder

## Resumen

El modelo `gatilin/inkling-2-small-vision-encoder` es una extraccion sin perdida del componente visual del modelo multimodal `thinkingmachines/Inkling-2-Small`, publicado por el usuario gatilin en Hugging Face. No se trata de un modelo generativo autonomo, sino de un codificador de percepcion (perception encoder) independiente que convierte imagenes en representaciones latentes y tokens visuales proyectados al espacio del modelo de lenguaje original. Incluye el transformer visual completo, las embeddings de posicion y de clase, las escalas por capa y el proyector visual-a-lenguaje de dos capas.

El paquete contiene 327.693.312 parametros distribuidos en 422 tensores BF16 originales, con 23 capas de transformer visual, anchura 1024 y 16 cabezas de atencion. El tamano de parche nativo es de 20 pixeles, y tras un merge espacial 2x2 cada token de imagen corresponde a un parche de 40x40 pixeles. El proyector incluido emite vectores de anchura 4608, alineados con el espacio del modelo de lenguaje del que fue extraido.

Su relevancia radica en que permite reutilizar el codificador visual de un modelo multimodal cerrado o de gran tamano de forma aislada, sin cargar el modelo de lenguaje ni los pesos del mezcla de expertos. Resulta util para tareas de extraccion de caracteristicas de imagen, investigacion sobre alineamiento vision-lenguaje y construccion de pipelines multimodales personalizados. La licencia es Apache-2.0 y el repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visual (derivado de Perception Encoder) con proyector visual-a-lenguaje de dos capas |
| Parametros totales | 327.693.312 |
| Parametros activos | no disponible (no es un modelo MoE en este paquete) |
| Longitud de contexto | no disponible (depende de las dimensiones de imagen; no aplica contexto textual) |
| Tipos de cuantizacion | BF16 nativo; el autor no publica variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (componente visual, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `112c344cd13ab31fafd05354e2e47138e56f65659f4c4e12fffb70f4503fb5de`) |

## Arquitectura y entrenamiento

El componente es un transformer visual de 23 capas con anchura 1024 y 16 cabezas de atencion, derivado del Perception Encoder. Utiliza parches nativos de 20x20 pixeles y aplica un merge espacial 2x2 que agrupa cada cuatro parches en un token de imagen de 40x40 pixeles. Incorpora embeddings de posicion y de clase aprendidas, escalas por capa y RoPE axial reconstruido en tiempo de carga como buffer no persistente. El proyector final de dos capas transforma las representaciones visuales a vectores de anchura 4608.

El paquete no incluye el modelo de lenguaje, el tokenizador linguistico, los pesos del mezcla de expertos ni el decodificador especulativo del modelo padre. Todos los tensores visuales extraidos son BF16 y no han sido cuantizados ni convertidos. La extraccion se realizo sobre la revision `1df2d97d45210d94f781f42a6521392e5a539e46` del modelo original, usando el espejo oficial de ModelScope en la revision `474f37075eae8bf97585075393ce1da9bac5a22e` para la transferencia de rangos. El autor indica que los payloads extraidos se verificaron byte a byte contra rangos exactos del espejo, aunque el shard completo original no fue descargado ni hasheado de forma independiente.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos, ni sobre si el modelo padre uso RLHF o DPO. El autor no documenta innovaciones de decodificacion ni tecnicas de atencion lineal en este componente.

## Capacidades

- Extraccion de caracteristicas de imagen: genera `last_hidden_state` con un token de clase mas los parches visuales nativos, y `pooler_output` con los tokens de imagen proyectados y fusionados.
- Codificacion visual para pipelines multimodales: produce representaciones alineadas con el espacio del modelo de lenguaje de Inkling-2-Small (anchura 4608), reutilizables en arquitecturas vision-lenguaje.
- Procesamiento de imagenes RGB con el procesador incluido, que devuelve `pixel_values` e `image_grid_thw`.
- No genera texto: el componente no esta registrado como `AutoModel` y carece de cabecera de lenguaje.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por si mismo; esas capacidades residen en el modelo padre.
- No tiene capacidades multilingues propias; el procesamiento linguistico corresponde al modelo de lenguaje excluido.
- No incluye vision generativa, audio ni modo thinking; solo codificacion visual.

## Casos de uso

- Extraccion de embeddings de imagen para busqueda visual: el componente produce `pooler_output` de anchura 4608 que puede indexarse en bases vectoriales para recuperacion por similitud, sin cargar el modelo de lenguaje completo.
- Investigacion sobre alineamiento vision-lenguaje: permite estudiar como se proyectan los tokens visuales al espacio del lenguaje y comparar representaciones con otros codificadores, gracias a que conserva las claves y formas originales de los tensores.
- Construccion de pipelines multimodales personalizados: sirve como codificador visual en arquitecturas propias que combinen este componente con un modelo de lenguaje distinto, reutilizando el proyector de dos capas incluido.
- Clasificacion y etiquetado de imagenes: el `last_hidden_state` con token de clase puede alimentar cabeceras de clasificacion ligeras para tareas de vision por computador.
- Analisis de atencion visual: el autor documenta la entropia condicional de atencion por clave visual y la masa del token de clase, lo que facilita estudios de interpretabilidad sobre que regiones de la imagen reciben atencion.
- Prototipado en CPU: al ser un componente de 327 millones de parametros en BF16 (aproximadamente 0,65 GB), puede ejecutarse en CPU en float32 para validacion y desarrollo sin GPU dedicada.
- Reproducibilidad y auditoria: los ficheros `extraction.json`, `tensor_mapping.json`, `mirror_comparison.json` y `validation.json` permiten verificar la integridad de la extraccion frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta validacion funcional: carga estricta de los 422 tensores, forward completo en CPU float32 sobre dos imagenes reales de COCO128, y para una imagen de 224x224 un grid fusionado de 6x6, `last_hidden_state` de forma `[145, 1024]` y `pooler_output` de forma `[36, 4608]`. La comparacion de las capas de atencion 0, 11 y 22 tras reconstruir RoPE frente a SDPA nativo mostro un error absoluto maximo inferior a `5.3e-6`. No se probo paridad numerica en GPU original ni precision downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,65 GB en BF16 (327,7 M de parametros) y aproximadamente 1,3 GB en float32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Para lotes grandes, A100 o H100 aportan margen.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: el autor proporciona `component.py` para carga manual con `transformers>=5.23.0` y `safetensors>=0.8`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. La validacion se realizo en CPU float32; no se publican mediciones en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gatilin/inkling-2-small-vision-encoder | 327,7 M | no aplica (visual) | Apache-2.0 | Hugging Face | Componente visual aislado, sin LM |
| thinkingmachines/Inkling-2-Small | no disponible | no disponible | Apache-2.0 (segun modelo padre) | Hugging Face | Modelo multimodal completo del que se extrae |
| Codificadores visuales tipo CLIP ViT-L/14 | ~304 M | no aplica | MIT / Apache-2.0 segun variante | Hugging Face, open_clip | Alternativa generica de imagen-texto; no alineada con Inkling-2 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El componente no genera texto ni tiene capacidades linguisticas; no debe presentarse como un modelo multimodal completo.
- No esta registrado como `AutoModel`; requiere cargar `component.py` manualmente, lo que complica su integracion en pipelines estandar.
- La validacion se hizo sobre Transformers 5.21.1 con los ficheros fuente oficiales de v5.23.0, sin probar una instalacion completa de v5.23.0 ni paridad numerica en GPU.
- El shard completo original no fue descargado ni hasheado de forma independiente por el autor; la integridad se apoya en la comparacion con el espejo de ModelScope.
- Riesgo de sesgos: no documentado por el autor; al heredar el codificador visual de un modelo padre, podria arrastrar sesgos de representacion de ese modelo.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero las representaciones podrian no alinearse con el modelo de lenguaje si se combinan con otro distinto al original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor remite a la model card del modelo padre y a la informacion de uso aceptable del proveedor.
- El componente conserva los nombres de clave originales y aplica el mapeo de claves visuales de Transformers en tiempo de carga; cambios en versiones futuras de Transformers podrian romper la carga.
- No se documentan limitaciones de idioma porque el componente no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/inkling-2-small-vision-encoder
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Espejo ModelScope del modelo base: https://modelscope.cn/models/thinkingmachines/Inkling-2-Small (revision `474f37075eae8bf97585075393ce1da9bac5a22e`)
- Ficheros de verificacion incluidos en el repo: `extraction.json`, `tensor_mapping.json`, `mirror_comparison.json`, `validation.json`, `component.py`, `LICENSE`, `native_source/`
