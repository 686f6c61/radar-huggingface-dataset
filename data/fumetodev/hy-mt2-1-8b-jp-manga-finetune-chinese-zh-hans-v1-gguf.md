# fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-chinese-zh-Hans-v1-GGUF

## Resumen

El modelo `Hy-MT2-1.8B-JP-Manga-Finetune-chinese-zh-Hans-v1` es un fine-tuning de `tencent/Hy-MT2-1.8B` desarrollado por el autor `fumetodev`, disenado especificamente para traducir dialogos de manga del japones al chino simplificado (zh-Hans) de forma natural y concisa. Se trata de una adaptacion especializada pensada para traduccion en el dispositivo (edge) dentro del lector de manga para Android `FumetoReaderPlus`, aunque tambien puede desplegarse en servidores. El modelo resuelve el problema de la traduccion de bocadillos de manga, donde se necesita preservar nombres, tono, puntuacion y convenciones culturales japonesas, algo que los modelos de traduccion generales manejan mal.

La arquitectura es `HunYuanDenseV1ForCausalLM`, un modelo denso basado en transformer de aproximadamente 1.791.080.448 parametros (1.8B). Se distribuye tanto en pesos `bf16` en formato `safetensors` como en cuantizacion `Q4_K_M` en formato `GGUF` para `llama.cpp`, con un tamano de repositorio de 4.7 GB. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HunYuanDenseV1ForCausalLM (transformer denso) |
| Parametros totales | 1.791.080.448 (~1.8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | japones (entrada), chino simplificado zh-Hans (salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `tencent/Hy-MT2-1.8B`, un modelo de traduccion de Tencent, y se afina sobre un corpus de dialogos de manga complementado con un pequeno conjunto de lineas sinteticas. El objetivo del ajuste es corregir errores frecuentes en la traduccion de manga al chino: nombres kanji mantenidos en su forma simplificada (por ejemplo, 沢田 → 泽田), falsos amigos entre idiomas (上京 → 去东京, nunca 北京), eliminacion de residuos kana o glifos exclusivamente japoneses, adaptacion de prestamos katakana a terminos chinos, tratamiento de lineas cortas en kana como nombres propios y uso de puntuacion china de ancho completo con ellipsis `……`. No se menciona el uso de RLHF ni DPO. El prompt recomendado combina un bloque de referencia terminologica en chino con una instruccion en ingles y la frase a traducir, usando la plantilla conversacional del modelo base.

## Capacidades

- Traduccion japones → chino simplificado de dialogos cortos de manga, preservando el tono original.
- Manejo de nombres propios japoneses: nombres en kanji conservan caracteres y orden, con conversion de glifos a simplificado; nombres kana se traducen a kanji convencional; nombres occidentales en katakana se transliteran estandar.
- Comprension de falsos amigos chino-japones y seleccion de la acepcion correcta segun el contexto del manga.
- Generacion de salida sin residuos kana ni glifos japoneses, con puntuacion china de ancho completo.
- Capacidad de completar entradas truncadas (por ejemplo, fragmentos de ASR) en lugar de traducirlas literalmente.
- Soporte de plantilla conversacional (`chat_template.jinja`) y compatibilidad con `transformers` mediante `trust_remote_code=True`.
- No se especifica soporte de tool calling, function calling ni agentes multi-step.

## Casos de uso

- Traduccion de manga en lector Android: integrable en la app `FumetoReaderPlus` para traducir bocadillos de forma local y privada, con el GGUF Q4_K_M ejecutandose via `llama.cpp` en el propio dispositivo.
- Traduccion de guiones de comics y novelas visuales: las lineas cortas y autocontenidas de dialogo son el dominio natural del modelo, lo que permite traducir guiones con contexto de frase independiente.
- Automatizacion de subtitulos de anime para fansubs: dada una entrada de texto extraida (no audio), el modelo traduce lineas sueltas al chino simplificado, ayudando a generar subtitulos de episodios.
- Asistencia a traductores profesionales de manga: el modelo propone una traduccion inicial que el revisor puede corregir, acelerando el flujo de trabajo humano.
- Traduccion de videojuegos (fan translation): para juegos con dialogos visuales tipo visual novel, el modelo puede procesar miles de lineas con un prompt consistente.
- Integracion en pipelines de OCR para comics: el texto extraido de bocadillos mediante OCR se pasa al modelo para obtener una traduccion coherente, aprovechando su tolerancia a fragmentos truncados.
- Procesamiento de tuits o publicaciones con estilio manga: para comunidades online que traducen memes o paneles sueltos, el modelo genera traducciones naturales al chino simplificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados con valores numericos en la informacion disponible. La model card reporta evaluaciones cualitativas realizadas sobre manga fuera del conjunto de entrenamiento:

| Evaluacion | Resultado |
|---|---|
| Preferencia de juez LLM (pairwise) | Mayoría de lineas prefiere este modelo frente a v3-multilingual |
| chrF (a nivel caracter) | Significativamente superior a v3-multilingual |
| COMET-22 | Significativamente superior a v3-multilingual |
| Errores graves | Menos de la mitad que v3-multilingual |
| Residuos de kana o glifos japoneses | Mucho menos frecuentes que el modelo base; al nivel de las traducciones de referencia |

No se disponen de puntuaciones exactas ni de comparaciones con otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion Q4_K_M los pesos ocupan aproximadamente 1.13 GB, por lo que se necesita una VRAM minima de ~2 GB incluyendo overhead de KV cache y buffers. En bf16, los pesos ocupan ~3.6 GB, por lo que se recomienda una VRAM de al menos 6 GB.
- GPU recomendadas: para Q4_K_M, cualquier GPU con 4 GB o mas (RTX 3050, RTX 4060, Intel Arc A380) es suficiente. Para bf16, una RTX 3060 12GB o superior.
- Cabe en GPU de consumidor: si, incluso en modelos de gama baja con la cuantizacion Q4_K_M.
- Opciones de despliegue: `llama.cpp` para archivos GGUF, `Ollama` importando el GGUF, `vLLM` y `TGI` para los pesos bf16 mediante `transformers` con `trust_remote_code=True`. No se especifican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-JP-Manga-Finetune-chinese-zh-Hans-v1 | 1.8B | no disponible | ja → zh-Hans | Apache 2.0 | GGUF + safetensors |
| Hy-MT2-1.8B-JP-Manga-Finetune-v5 | 1.8B | no disponible | ja → en | Apache 2.0 (presumible) | GGUF |
| Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual | 1.8B | no disponible | ja → vario idiomas | Apache 2.0 (presumible) | GGUF |
| tencent/Hy-MT2-1.8B | 1.8B | no disponible | traduccion general | no disponible | no disponible |

Se observa que este modelo es una version especializada exclusivamente en japones → chino simplificado, siendo superior en calidad a v3-multilingual en esa direccion segun la evaluacion del autor.

## Limitaciones y advertencias

- Solo produce salida en chino simplificado; no ha sido entrenado ni evaluado en otros idiomas objetivo.
- El autor no lee chino y la calidad no ha sido verificada por hablantes nativos; las afirmaciones de rendimiento se basan en metricas automaticas y un juez LLM.
- Fuera del dominio de manga, el modelo tiende a completar frases truncadas en vez de traducirlas, lo que puede generar textos no esperados en otros contextos.
- Los nombres propios del mundo real (personas publicas, marcas) y la terminologia tecnica son mas debiles que en el modelo base.
- El modelo no ve la imagen de la pagina; cuando una frase japonesa omite el sujeto, el modelo puede elegir una interpretacion arbitraria u omitirlo, siguiendo la convencion china.
- Requiere seguir el prompt recomendado (instrucciones en ingles, terminos en chino) para obtener buenos resultados; desviarse puede degradar la calidad.
- Los parametros de muestreo recomendados son `temperature 0.15`, `top_k 20`, `top_p 0.6`, `repeat_penalty 1.05` y `min_p 0`; valores mas altos aumentan el riesgo de invencion.
- Es necesario verificar que el `eos_token_id` sea `120020` en el GGUF; algunos conversores lo fijan a 3, lo que provocaria generacion infinita.
- No se especifica soporte para tool calling, function calling ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-chinese-zh-Hans-v1-GGUF
- Repositorio de FumetoReaderPlus (aplicacion Android): https://github.com/fumetodev/FumetoReaderPlus
- Modelo base Hy-MT2-1.8B: https://huggingface.co/tencent/Hy-MT2-1.8B
- Version inglesa (v5): https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v5-GGUF
- Version multilingue (v3): https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF
