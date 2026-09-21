# irishbumfuzzle/anlp-a2-p1-dense

## Resumen

`irishbumfuzzle/anlp-a2-p1-dense` es un checkpoint academico de traduccion automatica publicado en HuggingFace. Se trata del baseline "dense" de la Parte 1 de la asignatura Advanced NLP Assignment 2 (Monsoon 2026), desarrollado por el usuario `irishbumfuzzle`. El modelo resuelve una tarea muy concreta: traduccion de vietnamita y japones a ingles (`vi/ja -> en`) mediante un modelo de lenguaje decoder-only entrenado sobre secuencias con el formato `<lang> src <en> tgt`.

La relevancia de esta publicacion es limitada y de caracter docente: no es un modelo de proposito general ni compite con modelos de traduccion comerciales. Su interes esta en que documenta de forma reproducible un pipeline completo de entrenamiento (tokenizador BPE propio, configuracion explicita, presupuesto de tokens cerrado) con un modelo de solo 35,7 millones de parametros. El checkpoint publicado es el `final`, correspondiente al agotamiento del presupuesto de 145.020.416 tokens.

Arquitectura transformer decoder-only de 6 capas, dimension de modelo D=512, 8 cabezas de atencion, vocabulario de 32.768 tokens y embeddings atados (tied embedding). Los pesos se distribuyen como un `state_dict` de PyTorch dentro de `model.pt`, acompanado de `config.json` (un `TransformerConfig`) y `tokenizer.json`. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 35.658.240 |
| Parametros activos | no aplica (no es MoE; el autor indica 35.658.240 activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | vietnamita y japones como origen, ingles como destino (segun la tarea declarada) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch con `{"model": ..., "config": ...}`), `config.json`, `tokenizer.json` |
| Capas | 6 |
| Dimension del modelo (D) | 512 |
| Cabezas de atencion | 8 |
| Vocabulario | 32.768 (BPE a nivel de byte, entrenado sobre el split de entrenamiento) |
| Embeddings | atados (tied embedding) |
| Presupuesto de tokens de entrenamiento | 145.020.416 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con normalizacion y atencion causal, configurado con 6 capas, D=512 y 8 cabezas de atencion (64 dimensiones por cabeza). El vocabulario de 32.768 tokens se genera con un tokenizador BPE a nivel de byte entrenado exclusivamente sobre el split de entrenamiento, y la capa de embedding esta atada a la proyeccion de salida, lo que reduce el recuento de parametros. El checkpoint publicado es el `final`, es decir, el estado del modelo al consumir la totalidad del presupuesto de tokens.

El entrenamiento es monolingue en el sentido de que se optimiza una unica tarea secuencial: dado un prefijo `<lang> src <en>`, generar la traduccion al ingles. El corpus empleado es `belumind/en-vi-ja-curated-500k-triplets`, con un presupuesto fijo de 145.020.416 tokens. La model card no documenta el uso de RLHF, DPO, SFT posterior, decodificacion especulativa ni ninguna innovacion de atencion (por ejemplo, atencion lineal); el modelo se presenta explicitamente como el baseline denso frente al que se compararan variantes mas elaboradas de la asignatura. El autor tambien indica que la carga requiere el repositorio de la asignatura (`src.part1.model.TransformerLM` y `load_tokenizer`), lo que implica que la arquitectura depende de codigo externo no incluido en el repositorio de HuggingFace.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, en el formato de prompt `<lang> src <en> tgt`.
- Generacion de texto autoregresiva condicionada a un prefijo, al ser un decoder-only causal.
- Modelado de lenguaje a nivel de subpalabra con vocabulario BPE de 32.768 entradas, lo que permite manejar texto japones y vietnamita sin preprocesado adicional de segmentacion.
- Soporte de tool calling / function calling: no disponible (no se documenta ninguna capacidad de este tipo).
- Soporte de agentes o razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues mas alla de vi/ja/en: no disponible.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponibles.
- Almacenamiento del tokenizer en el propio repositorio (`tokenizer.json`), reutilizable de forma independiente al modelo.

## Casos de uso

- Baseline academico de traduccion: el uso principal y documentado es servir de referencia (baseline denso) frente a arquitecturas alternativas en la asignatura Advanced NLP Assignment 2, midiendo la perdida y la calidad de traduccion al agotar los 145 millones de tokens.
- Reproducibilidad de experimentos: dado que se publican `config.json`, `tokenizer.json` y el `state_dict` completo, permite reproducir exactamente el punto final del entrenamiento sin reentrenar desde cero.
- Traduccion de vietnamita a ingles en textos cortos: util en proyectos de demostracion o prototipado donde el coste computacional debe ser minimo, dado que el modelo ocupa decimas de GB en memoria.
- Traduccion de japones a ingles en experimentos controlados: adecuado para comparar estrategias de tokenizacion BPE frente a vocabularios mas grandes en un par de idiomas con escritura no latina.
- Investigacion sobre eficiencia de tokenizadores: el par japones/ingles con un vocabulario de 32.768 tokens es un banco de pruebas util para medir la fragmentacion de tokens y su impacto en la calidad de traduccion.
- Fine-tuning posterior en tareas de traduccion: al ser un modelo de 35,7 millones de parametros, es viable ajustarlo en una unica GPU consumer con presupuestos de datos reducidos para dominios especificos (por ejemplo, documentacion tecnica vi->en).
- Ensenanza de pipelines completos de NLP: sirve como ejemplo minimo de extremo a extremo (tokenizacion, entrenamiento causal, publicacion de checkpoint) para cursos y practicas.
- Generacion de datos sinteticos de traduccion a bajo coste: puede emplearse para producir pares preliminares que despues se filtren con un modelo mayor o con un revisor humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de BLEU, chrF, COMET, MMLU, HumanEval ni GSM8K, ni tampoco la perdida de validacion final.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 35.658.240 parametros; no incluye activaciones ni overhead del runtime):
  - fp32: ~143 MB de pesos.
  - fp16 / bf16: ~71 MB de pesos.
  - int8: ~36 MB de pesos.
  - int4: ~18 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requieren A100, H100 ni RTX 4090. En la practica, el cuello de botella sera el codigo de carga, no la VRAM.
- GPU consumer: si, cabe en cualquier GPU consumer moderna (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU o en un portatil sin GPU dedicada, dado el tamano del modelo.
- Opciones de despliegue: no hay soporte nativo conocido en vLLM, TGI, Ollama o llama.cpp, porque el checkpoint es un `state_dict` de PyTorch asociado a clases propias del repositorio de la asignatura (`src.part1.model.TransformerLM`). Las opciones realistas son: cargar con el repositorio de la asignatura y servir con PyTorch + FastAPI/Flask, o exportar manualmente los pesos a `safetensors` y envolverlos en una implementacion propia compatible con `transformers`.
- Latencia y throughput estimados: no disponible (no se publican mediciones). Cualquier cifra seria especulativa.
- Nota: el repositorio pesa 0,1 GB, coherente con un checkpoint en fp32 mas ficheros auxiliares.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de referencia ni resultados que permitan situar este checkpoint frente a alternativas de la misma categoria (por ejemplo, MarianMT, NLLB-200 o M2M-100 en el par vi/ja->en). Ademas, el modelo no esta disenado para uso general, sino como baseline interno de una asignatura, por lo que cualquier comparacion directa seria metodologicamente discutible.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara ninguna licencia, por lo que no hay autorizacion explicita de uso comercial. Debe contactarse con el autor antes de cualquier uso en produccion.
- Model card minima: no se documentan sesgos, composicion detallada del dataset, criterios de filtrado ni evaluacion de calidad.
- Riesgo de alucinacion: al ser un decoder-only entrenado con 145 millones de tokens, puede generar texto fluido en ingles que no corresponda al contenido del texto origen, especialmente en frases largas o con vocabulario poco frecuente.
- Alcance restringido: el modelo solo ha sido entrenado para `vi/ja -> en`; no se ha documentado su comportamiento en la direccion inversa ni en otros pares de idiomas.
- Dependencia de codigo externo: la carga requiere el repositorio de la asignatura (`src.part1.model`, `src.part1.data`). Sin ese codigo, `model.pt` no es directamente utilizable con `transformers`, `vLLM` u otras herramientas estandar.
- Longitud de contexto desconocida: al no declararse la ventana de contexto, no puede garantizarse el comportamiento correcto en documentos largos, y probablemente el modelo se haya entrenado con secuencias cortas.
- Tokenizador entrenado unicamente sobre el split de entrenamiento: los textos fuera de dominio pueden fragmentarse de forma suboptima, lo que degrada la traduccion.
- Sin cuantizaciones publicadas: no existen ficheros GGUF ni versiones int8/int4 listas para usar, lo que anade trabajo de conversion para despliegues ligeros.
- Cero descargas y cero likes: no hay evidencia de uso externo ni de validacion por parte de la comunidad.
- Idoneidad discutible para produccion: es un artefacto docente, sin garantias de mantenimiento, estabilidad de API ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/irishbumfuzzle/anlp-a2-p1-dense
- Dataset citado en la model card: `belumind/en-vi-ja-curated-500k-triplets` (referencia textual; no se proporciona URL en la informacion disponible)
- Repositorio de la asignatura (Advanced NLP Assignment 2, Monsoon 2026): no disponible, el autor no incluye enlace
- Paper, blog o demo adicionales: no disponible; los resultados de busqueda web obtenidos no contienen informacion relacionada con este modelo
