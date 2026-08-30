# isaacmg/qwen3-vl-8b-hebrew-v20a-ckpt

## Resumen

El modelo `isaacmg/qwen3-vl-8b-hebrew-v20a-ckpt` es un adaptador LoRA (PEFT) construido sobre el modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por isaacmg. Forma parte de la serie HebVL, una familia de adaptadores especializados en la lectura de escritura hebrea histórica: páginas impresas de Talmud (tipografía cuadrada y escritura Rashi) y fragmentos manuscritos de la Genizah de El Cairo (cartas, documentos legales y listas en hebreo, judeo-árabe y arameo). Esta versión v2.0a es la primera ejecución sobre un dataset de segunda generación que añade tareas de grounding y layout-VQA además de la transcripción tradicional.

El checkpoint se encuentra en estado de "entrenamiento aún no iniciado" según la model card, y los checkpoints se irán publicando en el repositorio conforme avance el entrenamiento. Su relevancia radica en que aborda un problema muy específico que los modelos generalistas no resuelven bien: la transcripción y localización de texto en manuscritos históricos con escritura difícil, con una licencia permisiva Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-8B-Instruct (transformer multimodal con vision tower) |
| Parametros totales | No disponible (modelo base: ~8B; adaptador LoRA no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (heredado del modelo base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion estandar (4-bit, 8-bit) |
| Idiomas soportados | Hebreo (principal), judeo-arabe, arameo (especializacion); hebreo como idioma declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-VL-8B-Instruct, un modelo de lenguaje multimodal con arquitectura transformer que combina un codificador visual con un modelo de lenguaje denso. El adaptador se entrena mediante fine-tuning con la librería PEFT, congelando o ajustando parcialmente los pesos según el resultado de experimentos previos (v1.9c). El dataset de v2.0a incluye 1.587 manuscritos y 3.698 páginas de transcripciones verificadas a nivel de palabra de la Genizah de El Cairo, reconstruidas con un reconstructor de geometría reparado, totalizando 2,19 millones de letras de ground truth (2,7 veces la generación anterior). Además de la transcripción, se incorporan tareas de grounding (localización de frases con `locate`, lectura condicionada por región con `read_box`), QA de layout y transcripción línea a línea con bounding boxes normalizados 0-1000, que representan aproximadamente el 8% de la mezcla de entrenamiento. El entrenamiento parte de un warm start desde el checkpoint v1.9a en el paso 1300.

## Capacidades

- Transcripción de manuscritos hebreos históricos (Genizah de El Cairo, Talmud impreso, escritura Rashi).
- Grounding de frases: localización de expresiones dentro de una imagen mediante el comando `locate`.
- Lectura condicionada por región: extracción de texto de un área específica de la página mediante `read_box`.
- Layout-VQA: respuesta a preguntas sobre la estructura y disposición del texto en la página.
- Transcripción línea a línea con bounding boxes normalizados (coordenadas 0-1000).
- Soporte multilingüe heredado del modelo base, aunque la especialización se centra en hebreo, judeo-árabe y arameo.
- Capacidades generales de visión-lenguaje del modelo base (comprensión de imágenes, razonamiento visual) no se ven comprometidas, pero no son el foco del adaptador.

## Casos de uso

- Digitalización de manuscritos de la Genizah de El Cairo: transcripción automática de cartas, documentos legales y listas medievales para su inclusión en bases de datos históricas, reduciendo el tiempo de catalogación manual.
- Edición crítica digital de textos talmúdicos: conversión de páginas impresas de la edición de Vilna a texto digital estructurado, con tasas de error inferiores a las de modelos comerciales en escritura Rashi (según resultados de versiones anteriores).
- Búsqueda y localización de citas en facsímiles: mediante la capacidad de grounding, un investigador puede buscar una frase concreta y obtener las coordenadas exactas de su aparición en la página digitalizada.
- Análisis paleográfico asistido: el modelo puede ayudar a paleógrafos a transcribir pasajes difíciles, ofreciendo hipótesis de lectura para caracteres ambiguos y alternativas basadas en el contexto histórico.
- Indexación de archivos históricos para bibliotecas digitales: generación de metadatos estructurados (layout, regiones de texto, transcripción) para millones de páginas manuscritas, habilitando búsquedas semánticas.
- Transcripción de documentos legales medievales en judeo-árabe y arameo: extracción de texto de escrituras notariales para estudios genealógicos o de historia económica, con validación humana posterior gracias a la salida con bounding boxes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la versión v2.0a (entrenamiento en curso). La model card reporta resultados de versiones anteriores de la serie, que se presentan a continuación como referencia, indicando que no son comparables entre generaciones debido a cambios en los corpus de evaluación:

| Version | Benchmark | Metrica | Resultado |
|---|---|---|---|
| v1.9a | Genizah religious-140 | F1 | 0.816 |
| v1.9a | Genizah religious-140 | CER* | 0.216 |
| v1.9a | Frozen PGP-131 | F1 | 0.862 |
| v1.9a | Frozen PGP-131 | CER* | 0.196 |
| v1.6 | Talmud page (gemara) | CER | 0.090 |
| v1.6 | Talmud page (rashi) | CER | 0.047 |
| v1.6 | Talmud page (tosafot) | CER | 0.099 |

CER* se calcula sobre intentos sustantivos con un scorer basado en alineación. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit del modelo base, aproximadamente 6-8 GB; con 8-bit, ~10 GB; sin cuantizar, ~16 GB o más (dependiendo de la longitud de contexto).
- GPU recomendadas: tarjetas consumer como RTX 3090 o RTX 4090 (con cuantización), o GPUs de datacenter como A100 o H100 para inferencia a mayor throughput.
- El adaptador LoRA es ligero (tamaño no especificado, pero típicamente decenas de MB), por lo que el requisito principal es el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`, o servirse con vLLM, TGI u Ollama si se integra el adaptador. Para uso multimodal, se requiere el pipeline `image-text-to-text`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Estado |
|---|---|---|---|---|---|
| **v2.0a (este)** | ~8B base + LoRA | 32K | Genizah + grounding + layout-VQA | Apache-2.0 | Entrenamiento en curso |
| v1.9a (misma serie) | ~8B base + LoRA | 32K | Genizah, transcripcion | Apache-2.0 | Flagship actual, estable |
| v1.8a (misma serie) | ~8B base + LoRA | 32K | Genizah, vision congelada | Apache-2.0 | Superado, control experimental |
| Qwen3-VL-8B-Instruct (base) | ~8B | 32K | Multimodal general | Apache-2.0 | Modelo base sin adaptar |

La comparativa se limita a la propia serie HebVL, ya que no se dispone de datos de modelos externos especializados en hebreo histórico en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento de v2.0a aún no ha comenzado; los checkpoints publicados no son estables y el rendimiento final puede diferir de lo esperado.
- La especialización en escritura hebrea histórica puede degradar el rendimiento en otras tareas generales de visión-lenguaje respecto al modelo base.
- Los benchmarks de versiones anteriores no son directamente comparables entre generaciones por cambios en los corpus de evaluación.
- Existe riesgo de alucinación en transcripciones ambiguas, especialmente en manuscritos con daños físicos o caligrafía irregular.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los manuscritos digitalizados para cumplir con derechos de reproducción de las colecciones originales.
- No se han publicado evaluaciones de sesgos o comportamientos adversos específicos para este adaptador.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v20a-ckpt
- Version flagship v1.9a: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v19a-ckpt
- Version v1.8a (control): https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v18a-ckpt
- Version v1.8b: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v18b-ckpt
- Version v1.7: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v17-ckpt
- Version v1.6: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-v16-ckpt
- Version v1.5 (Rashi): https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-rashi-ckpt
- Version v1: https://huggingface.co/isaacmg/qwen3-vl-8b-hebrew-ckpt
- GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina de FriendliAI sobre la serie: https://friendli.ai/models/isaacmg/qwen3-vl-8b-hebrew-v18a-ckpt
