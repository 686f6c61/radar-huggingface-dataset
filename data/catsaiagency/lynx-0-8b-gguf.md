# catsaiagency/Lynx-0.8B-GGUF

## Resumen

Lynx 0.8B es un modelo de lenguaje de pequeno tamano especializado en respuesta a preguntas con recuperacion aumentada (RAG). Lo desarrolla CatsAI Agency y parte de un fine-tuning de Qwen3.5-0.8B (licencia Apache-2.0). Su tarea es concreta: recibe un texto de contexto y una pregunta en el mismo idioma, y devuelve una unica frase de respuesta basada exclusivamente en ese texto. Cuando la respuesta no aparece en el contexto, emite una frase de rechazo fija en lugar de inventar, lo que lo hace util en pipelines donde la fidelidad al documento es critica.

El modelo tiene 1.006.672.704 parametros totales (etiquetado comercialmente como 0.8B) y se distribuye en este repositorio unicamente en formato GGUF Q4_K_M (0.67 GB). Esta pensado para ejecutarse en CPU convencional con unos 1.5 GB de RAM en uso, sin necesidad de GPU. Soporta 20 idiomas y una ventana de contexto de 8192 tokens, suficiente para documentos de hasta unos 2500 tokens con margen.

Su relevancia actual reside en la combinacion de tres factores: un coste de despliegue minimo (CPU, portatil), un comportamiento anti-alucinacion explicito mediante rechazo controlado, y cobertura multilingue amplia. Es una pieza pensada para integrarse como extractor de respuestas dentro de sistemas RAG mas grandes, no como modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen3.5-0.8B) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el script de arranque; entrenado con textos de hasta ~8000 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado en este repo) |
| Idiomas soportados | 20: ja, en, zh, ko, es, fr, de, it, pt, nl, sv, pl, cs, hu, hr, ru, tr, vi, id, hi |
| Licencia | CatsAI Model License (gratis para probar; pago por maquina para uso productivo) |
| Formato de pesos | GGUF (Q4_K_M); pesos sin cuantizar en `catsaiagency/Lynx-0.8B` |

## Arquitectura y entrenamiento

Lynx 0.8B se construye sobre Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen, mediante fine-tuning supervisado especificamente para la tarea de respuesta extractiva con contexto. No se documenta en la model card el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se indica que el conjunto de evaluacion se construyo con articulos de Wikipedia no usados en entrenamiento, lo que sugiere un dataset de entrenamiento de dominio general y posiblemente multilingue.

La innovacion tecnica principal no es arquitectonica sino de comportamiento: el modelo esta entrenado para emitir una frase de rechazo fija y especifica por idioma cuando la respuesta no esta en el texto, en lugar de generar una respuesta plausible pero no fundamentada. El repositorio incluye codigo de ejemplo (`lynx.py`) que gestiona el envio del contexto y la pregunta a un servidor `llama-server` de llama.cpp, con parametros de generacion ajustados (max_tokens=300) y deteccion del rechazo mediante el campo `refused`. Requiere llama.cpp release b11829 o superior por compatibilidad con modelos Qwen3.5.

## Capacidades

- Generacion de respuestas extractivas de una sola frase a partir de un texto de contexto y una pregunta.
- Rechazo controlado: devuelve una frase fija por idioma cuando el contexto no contiene la respuesta.
- Soporte multilingue en 20 idiomas, con entrada y salida en el mismo idioma.
- Manejo de contextos largos de hasta ~8000 tokens de entrada (documentos de varios miles de palabras).
- Diferenciacion entre preguntas respondibles en parrafos cortos, textos largos y casos sin respuesta.
- Ejecucion en CPU sin GPU, con throughput medido de 300-450 tok/s en lectura y 40-53 tok/s en escritura.
- Integracion via API HTTP de llama.cpp (`/completion` o compatible con endpoints) y via funcion Python `answer()`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Atencion al cliente sobre documentacion de producto: el modelo responde preguntas concretas ("cada cuanto hay que descalcificar la maquina") extrayendo la frase exacta del manual, con rechazo explicito si la pregunta queda fuera del documento. Adecuado por su bajo coste y su comportamiento anti-alucinacion.
- Base de conocimiento interna en empresas: indexar manuales, politicas y procedimientos y usar Lynx como extractor de respuestas sobre los fragmentos recuperados por un retriever, en 20 idiomas sin cambiar de modelo.
- Sistemas RAG en produccion con restricciones de hardware: al ejecutarse en CPU con ~1.5 GB de RAM, puede desplegarse en servidores sin GPU o en el propio portatil del usuario, reduciendo coste de inferencia.
- Verificacion de respuestas en pipelines de QA: usar el campo `refused` como senal para derivar a un humano o a un modelo mayor cuando el contexto no contiene la respuesta, evitando respuestas inventadas.
- Procesamiento de documentacion multilingue: responder preguntas sobre contratos, manuales tecnicos o documentacion legal en cualquiera de los 20 idiomas soportados, manteniendo la respuesta en el idioma de la pregunta.
- Extraccion de datos estructurados desde texto libre: dado un documento y una pregunta de tipo "cual es el plazo de garantia", obtener una frase concreta que puede parsearse posteriormente.
- Asistente offline en dispositivos: al no requerir GPU ni conexion, puede empaquetarse en aplicaciones de escritorio o entornos con conectividad limitada para consultas sobre documentacion local.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluacion propia, no benchmarks academicos estandar):

| Evaluacion | Resultado |
|---|---|
| Test RAG propio 20 idiomas (200 preguntas/idioma, Wikipedia no vista en entrenamiento, 2 jueces LLM) | 93.8 / 94.2 |
| Categoria parrafo corto | 92.6 |
| Categoria texto largo (~2500 tokens) | 91.1 |
| Categoria sin respuesta en texto corto | 98.0 |
| Categoria sin respuesta en texto largo | 93.6 |
| XQuAD (preguntas humanas, 8 idiomas) | 89.9 / 90.7 |

Rendimiento en CPU (Core i7-11800H, 6-8 hilos, llama.cpp, Q4_K_M):

| Metrica | Valor |
|---|---|
| Lectura (prompt processing) | 300-450 tok/s (8 hilos); ~250 tok/s (6 hilos) |
| Escritura (generacion) | 40-53 tok/s (8 hilos); ~35 tok/s (6 hilos) |
| Latencia pregunta sobre texto de ~2500 tokens | ~7-9 s |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM estimada: ~1.5 GB en ejecucion con Q4_K_M; el fichero GGUF ocupa 0.67 GB en disco.
- GPU: no necesaria. El modelo esta disenado y medido para CPU.
- Cabe en cualquier portatil moderno; no requiere GPU de consumo. En GPU podria ejecutarse via llama.cpp con offload, pero no se documentan cifras.
- Despliegue: llama.cpp (`llama-server`, release b11829 o superior), con scripts de arranque incluidos para Linux/macOS y Windows PowerShell.
- Parametros de servidor configurables: `PORT` (8080 por defecto), `THREADS` (recomendado = nucleos fisicos), `CTX` (8192 por defecto), `MODEL`.
- Latencia tipica: 2.2-2.7 s por pregunta sobre textos de ~500 tokens; ~9 s sobre textos de ~2200 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lynx 0.8B | 1.0B | 8192 | RAG extractivo con rechazo | CatsAI Model License (pago por maquina en produccion) | GGUF en HF |
| Qwen3.5-0.8B (base) | 0.8B | no disponible en esta ficha | Modelo general | Apache-2.0 | Pesos completos |
| Modelos RAG especializados de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada. La comparacion mas directa es con su modelo base Qwen3.5-0.8B, que es de proposito general y no incorpora el comportamiento de rechazo controlado ni el fine-tuning especifico para RAG.

## Limitaciones y advertencias

- El modelo solo responde con una frase y exclusivamente a partir del contexto proporcionado; no es adecuado para generacion abierta, conversacion multi-turno ni tareas creativas.
- Riesgo de rechazo falso negativo: si la respuesta esta parafraseada o implicitamente en el texto, puede emitir la frase de rechazo.
- Riesgo de respuesta incorrecta si el contexto contiene informacion ambigua o contradictoria; el modelo no verifica la calidad de la fuente.
- No se documentan sesgos especificos, pero al derivar de Qwen3.5-0.8B y entrenarse con datos no detallados, puede heredar sesgos del modelo base y del corpus.
- Licencia restrictiva: CatsAI Model License permite probar gratis pero exige pago por maquina para uso productivo; revisar `MODEL-LICENSE.md` antes de desplegar comercialmente.
- Requiere llama.cpp b11829 o superior; versiones anteriores no cargan modelos Qwen3.5.
- Ventana de contexto de 8192 tokens: documentos mas largos deben trocearse, con el riesgo de perder contexto entre fragmentos.
- Solo se publica Q4_K_M en este repositorio; otras cuantizaciones no estan disponibles aqui.
- Sin soporte documentado de tool calling, agentes, vision ni audio.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/catsaiagency/Lynx-0.8B-GGUF
- Pesos sin cuantizar: https://huggingface.co/catsaiagency/Lynx-0.8B
- Web del proyecto: https://catsai.agency/en/lynx
- Licencia del modelo: https://huggingface.co/catsaiagency/Lynx-0.8B-GGUF/blob/main/MODEL-LICENSE.md
- README en japones: https://huggingface.co/catsaiagency/Lynx-0.8B-GGUF/blob/main/README.ja.md
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
