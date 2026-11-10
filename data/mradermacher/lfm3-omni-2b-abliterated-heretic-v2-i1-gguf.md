# mradermacher/lfm3-omni-2b-abliterated-heretic-v2-i1-GGUF

## Resumen

`mradermacher/lfm3-omni-2b-abliterated-heretic-v2-i1-GGUF` es una cuantizacion en formato GGUF del modelo `mizahnyx/lfm3-omni-2b-abliterated-heretic-v2`, que a su vez deriva del modelo multimodal LiquidAI LFM3-Omni-2B. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF (con quants ponderados por imatrix) para la comunidad de llama.cpp y Ollama. El modelo base pertenece a la familia LFM3 (Liquid Foundation Models 3) de Liquid AI, de aproximadamente 2 mil millones de parametros y con capacidades multimodales (texto e imagen, segun las etiquetas "omni" y "multimodal").

La variante "abliterated-heretic-v2" indica que se ha aplicado una tecnica de abliteracion (supresion de la direccion de rechazo en el espacio de activaciones) para eliminar los mecanismos de negativa del modelo, dando lugar a una version "uncensored"/"decensored". Esto es relevante para investigadores que estudian alineamiento, seguridad y comportamiento de modelos sin restricciones, pero implica riesgos importantes para uso en produccion.

Este repositorio concreto contiene unicamente el fichero imatrix (0.1 GB) para generar cuantizaciones propias; las cuantizaciones estaticas completas (Q2_K, Q4_K_M, Q6_K, IQ3_XXS, etc.) se publican en el repositorio hermano `mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF`. La licencia es la LFM Open License v1.0, con terminos especificos que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3 de Liquid AI; presumiblemente transformer hibrido, no confirmado en la informacion) |
| Parametros totales | 2B (segun nombre del modelo); 899.013 en el campo safetensors del repo (dato no representativo, probablemente del fichero imatrix) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | imatrix (este repo); quants estaticos en repo hermano: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm-open-license-v1.0 (license: other) |
| Formato de pesos | GGUF (este repo: fichero imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo base pertenece a la familia LFM3 de Liquid AI, etiquetada como "liquid", "lfm3" y "omni", lo que sugiere capacidades multimodales (texto e imagen). Las etiquetas "multimodal" y "omni" confirman el caracter multimodal, y el autor indica que se trata de un modelo de vision ("This is a vision model"), con ficheros mmproj disponibles en el repositorio estatico.

La variante "abliterated-heretic-v2" implica que se ha aplicado una tecnica de abliteracion sobre el modelo original para eliminar la direccion de rechazo, produciendo un modelo sin los mecanismos habituales de negativa ante peticiones consideradas sensibles. No se especifican en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF/DPO. La cuantizacion se ha realizado con pesos ponderados por imatrix (importancia de matriz), una tecnica que mejora la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto en 23 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, japones, coreano, portugues, hindi, ruso, etc.
- Capacidades multimodales: el modelo base se etiqueta como "omni" y "multimodal"; el autor indica que es un modelo de vision con ficheros mmproj en el repo estatico.
- Comportamiento "uncensored"/"decensored": la abliteracion elimina los rechazos ante contenido sensible, lo que permite generar respuestas que el modelo original rechazaria.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se confirma en la informacion disponible soporte de tool calling, function calling, agentes, modo thinking ni audio.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteracion afecta al comportamiento, comparando respuestas con el modelo original en tareas de refusal y sesgo.
- Analisis de robustez de filtros de contenido: util para evaluar si los sistemas de moderacion detectan correctamente contenido generado por modelos sin censura.
- Despliegue local en hardware modesto: al ser un GGUF de 2B, puede ejecutarse en CPU o GPU consumer mediante llama.cpp u Ollama, util para experimentos offline.
- Generacion de texto multilingue en 23 idiomas: apropiado para prototipos de traduccion o generacion en idiomas menos cubiertos por otros modelos.
- Procesamiento de imagenes con modelos de vision: si se descargan los ficheros mmproj del repo estatico, puede usarse para tareas de descripcion o analisis de imagenes en local.
- Creacion de cuantizaciones personalizadas: el fichero imatrix de este repo sirve para que otros desarrolladores generen sus propios quants con llama.cpp.
- Experimentacion con tecnicas de cuantizacion: util para comparar calidad entre tipos de quant (Q4_K_M, IQ3_XXS, etc.) en un modelo multimodal pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2B, las cuantizaciones Q4_K_M ocupan aproximadamente 1,5-2 GB; Q6_K en torno a 2,5 GB; Q8 en torno a 3 GB (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones de 4 bits con holgura; para cuantizaciones de mayor precision se recomienda al menos 8 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas para quants de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los ficheros mmproj permiten el modo vision en llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lfm3-omni-2b-abliterated-heretic-v2 (este) | 2B | No disponible | LFM Open License v1.0 | GGUF (mradermacher) |
| LFM3-Omni-2B original (LiquidAI) | 2B | No disponible | LFM Open License v1.0 | Hugging Face |
| Otros modelos multimodales pequenos (p. ej. Qwen2-VL-2B, SmolVLM) | ~2B | No disponible | Variable | Variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo: el modelo puede generar contenido sensible, ofensivo o peligroso sin filtros, lo que lo hace inadecuado para aplicaciones de cara al publico.
- Riesgo elevado de alucinacion, especialmente en un modelo de 2B y tras la abliteracion, que puede degradar la coherencia.
- La licencia LFM Open License v1.0 impone restricciones especificas; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- El repositorio contiene principalmente el fichero imatrix; las cuantizaciones completas estan en el repo hermano, por lo que hay que descargarlas de alli.
- No se dispone de informacion sobre contexto maximo, rendimiento en benchmarks ni calidad de las capacidades de vision tras la cuantizacion.
- El modelo base es una modificacion no oficial de LiquidAI; no cuenta con el respaldo del desarrollador original.
- Uso en produccion desaconsejado sin evaluacion exhaustiva de seguridad y sin filtros adicionales.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/lfm3-omni-2b-abliterated-heretic-v2-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Modelo base (mizahnyx): https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2
- Modelo original LiquidAI LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#lfm3-omni-2b-abliterated-heretic-v2-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
