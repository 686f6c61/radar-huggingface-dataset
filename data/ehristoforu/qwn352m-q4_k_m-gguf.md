# ehristoforu/qwn352m-Q4_K_M-GGUF

## Resumen

`ehristoforu/qwn352m-Q4_K_M-GGUF` es una cuantizacion en formato GGUF (tipo Q4_K_M) del modelo base `ehristoforu/qwn352m`, publicada por el usuario ehristoforu (Evgeniy Hristoforu) en Hugging Face. La conversion se ha realizado con `llama.cpp` a traves del espacio `gguf-my-repo` de ggml.ai, un flujo automatizado que genera pesos compatibles con el ecosistema llama.cpp a partir de un checkpoint original. El repositorio contiene aproximadamente 1,3 GB de pesos y declara 1.942.653.248 parametros totales en el modelo base.

El modelo resuelve el problema practico de ejecutar un LLM de tamano medio en hardware de consumo mediante cuantizacion de 4 bits, manteniendo compatibilidad con `llama-cli`, `llama-server` y las herramientas derivadas (Ollama, LM Studio, bindings de Python, etc.). La etiqueta `conversational` sugiere un ajuste orientado a dialogo, aunque no se ha publicado informacion sobre el dataset de instrucciones ni sobre el proceso de alineacion.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantizacion, no de un modelo original documentado. No hay model card tecnica del autor, no hay benchmarks publicados y no se especifican licencia ni idiomas. Cualquier evaluacion rigurosa debe remitirse al modelo base `ehristoforu/qwn352m`, cuya informacion tampoco esta disponible en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 1.942.653.248 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwn352m-q4_k_m.gguf`) |
| Tamano del repositorio | 1,3 GB |
| Modelo base | `ehristoforu/qwn352m` |
| Herramienta de conversion | `llama.cpp` via `gguf-my-repo` (ggml.ai) |
| Fecha de publicacion | 2026-11-08 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `ehristoforu/qwn352m`: la model card de esta cuantizacion se limita a indicar el origen y a documentar los comandos de uso con `llama.cpp`. El recuento de parametros (1.942.653.248) es coherente con un transformer decoder-only de aproximadamente 2B parametros, pero no se confirma ni la familia arquitectonica, ni el numero de capas, ni la dimension del modelo, ni si emplea atencion agrupada (GQA), atencion lineal u otras variantes.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), ni sobre si se aplicaron tecnicas de alineacion como SFT, RLHF o DPO. La unica etiqueta funcional disponible es `conversational`, que sugiere un ajuste para dialogo, pero sin detalles verificables. La innovacion tecnica documentada es exclusivamente la cuantizacion Q4_K_M, una variante de cuantizacion por bloques con escalas de 4 bits y metadatos K-quant de llama.cpp, que ofrece un buen equilibrio entre tamano y perplejidad para modelos de este orden.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con `llama.cpp` (CLI y servidor HTTP), lo que habilita integracion con clientes compatibles con la API de OpenAI a traves de `llama-server`.
- Ejecucion en CPU y GPU mediante backend de llama.cpp, con soporte de offload parcial de capas.
- Capacidades de razonamiento, codigo, matematicas, vision, audio o tool calling: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede cargarse con `llama-server -c 2048` y exponerse como endpoint HTTP compatible con la API de OpenAI, lo que permite integrarlo en demos y pruebas de concepto sin coste de inferencia en la nube.
- Pruebas de integracion en pipelines de CI: al ocupar 1,3 GB en disco y requerir poca VRAM en Q4_K_M, puede incluirse como dependencia en tests automatizados que validen flujos de generacion de texto sin depender de servicios externos.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de Q4_K_M frente al checkpoint original en FP16/BF16, usando el mismo prompt y parametros de decodificacion.
- Despliegue en dispositivos de borde: con 1,3 GB de pesos, cabe en placas con 4-8 GB de RAM unificada (Raspberry Pi 5 con 8 GB, mini-PC con CPU) para tareas de generacion de texto de baja latencia y volumen.
- Generacion de texto asistida en herramientas de escritorio: integrable en editores o asistentes locales mediante bindings de llama.cpp (Python, Rust, Go) sin requerir GPU dedicada.
- Filtrado y clasificacion de texto en lote: para tareas de etiquetado o resumen sobre corpus moderados, el modelo puede ejecutarse en CPU con throughput aceptable usando el binario `llama-cli` en modo batch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la cuantizacion ni los resultados de busqueda incluyen metricas de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 1,5-2,5 GB incluyendo cache KV para contextos de 2.048-4.096 tokens (estimacion a partir del tamano de pesos de 1,3 GB; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM permite cargar el modelo completo con offload total; ejemplos: RTX 3050 6 GB, RTX 4060, RTX 3060 12 GB, A10, L4. En A100/H100 el modelo queda sobredimensionado en cuanto a VRAM y el cuello de botella sera el ancho de banda de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas (GTX 1650 4 GB, RTX 3050, RTX 4060, RX 6600). Tambien en Apple Silicon con 8 GB unificados.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), `llama-server` con API compatible OpenAI, Ollama (importando el GGUF), LM Studio, bindings de Python (`llama-cpp-python`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors o uso de variantes especificas.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de ~2B en Q4_K_M, en una RTX 4090 se espera un throughput del orden de centenares de tokens por segundo, y en CPU moderna de escritorio del orden de decenas; estos valores son estimaciones generales y no mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ehristoforu/qwn352m-Q4_K_M-GGUF` | ~1,94 B | no disponible | no disponible | GGUF Q4_K_M | Cuantizacion sin model card tecnica ni benchmarks |
| `Qwen2.5-1.5B-Instruct-GGUF` (Alibaba) | 1,54 B | 32.768 tokens | Apache 2.0 | GGUF (multiples quants) | Modelo documentado, benchmarks publicados, amplio soporte de tooling |
| `Llama-3.2-1B-Instruct-GGUF` (Meta) | 1,24 B | 131.072 tokens | Llama 3.2 Community License | GGUF (multiples quants) | Modelo documentado, contexto largo, restricciones de licencia para >700M usuarios |
| `SmolLM2-1.7B-Instruct-GGUF` (HuggingFace) | 1,71 B | 8.192 tokens | Apache 2.0 | GGUF (multiples quants) | Modelo documentado, entrenado con receta publica |

La comparativa se ofrece como referencia de categoria (modelos densos de ~1-2B parametros en GGUF); no implica equivalencia de calidad, ya que no existen benchmarks publicados para `qwn352m`.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan arquitectura, datos de entrenamiento, proceso de alineacion ni evaluaciones. Esto impide valorar sesgos, calidad y robustez antes de un despliegue en produccion.
- Licencia no especificada: no puede confirmarse el uso comercial. Cualquier uso en producto requiere contactar con el autor o asumir el riesgo legal.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles, que es el idioma de los ejemplos de la model card.
- Riesgo de alucinacion: inherente a los LLM de este tamano; sin benchmarks ni evaluaciones no puede acotarse su magnitud.
- Contexto no confirmado: los ejemplos de la model card usan `-c 2048`, lo que sugiere un contexto nativo modesto; no se debe asumir una ventana mayor sin verificacion empirica.
- Cuantizacion Q4_K_M: introduce perdida de calidad respecto al checkpoint original, especialmente en tareas de razonamiento matematico y generacion de codigo. No se ha publicado comparativa de perplejidad frente al modelo base.
- Modelo con cero descargas y cero likes en el momento de la consulta: senal de escasa validacion por parte de la comunidad; conviene tratar el artefacto como no auditado.
- Fecha de creacion en 2026: el repositorio es reciente y puede sufrir cambios o eliminacion sin aviso.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/ehristoforu/qwn352m-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ehristoforu/qwn352m
- Perfil del autor: https://huggingface.co/ehristoforu
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
