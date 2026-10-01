# mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta-b` es una exportación de generación de texto publicada en Hugging Face por el usuario mdagosta bajo la denominación "OpenWALDO model export". Según su model card, utiliza la arquitectura Llama causal estándar de Transformers junto con un tokenizador de bytes propio del proyecto, identificado como "schema-1", que obliga a cargarlo con `trust_remote_code=True`.

Con 9.541.632 parámetros reales (dato extraído de los pesos safetensors), se sitúa en la liga de los modelos minúsculos, por debajo de cualquier modelo de propósito general actual; el tamaño del repositorio declarado es de 0,0 GB. El identificador sugiere un ajuste orientado a fundamentos de Python ("python-basics", revisión r0014, variante u0), extremo que la model card no confirma ni desarrolla.

Su relevancia es limitada y de nicho: registra 0 descargas y 0 likes, no declara licencia ni idiomas, y no publica ninguna evaluación. El interés técnico está en su formato de publicación, con un inventario de componentes (`BOM.json`) y un mapeo de divulgación de contenido de entrenamiento alineado con el reglamento europeo de IA (`EU-BOM.json`), además de las fechas de creación y actualización declaradas (30 de septiembre de 2026), posteriores a la fecha habitual de publicación de modelos en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, arquitectura Llama estándar de Transformers (según model card) |
| Parámetros totales | 9.541.632 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se declaran versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (carga vía `transformers`) |
| Tokenizador | Byte tokenizer propio "schema-1" de OpenWALDO; requiere `trust_remote_code=True` |
| Pipeline declarado | text-generation |
| Ficheros auxiliares | `BOM.json` (inventario de ficheros de la release), `EU-BOM.json` (mapeo de divulgación de contenido de entrenamiento GPAI de la UE) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de lenguaje causal Llama, es decir, un transformer decoder-only con atención causal estándar. No se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni si se aplican variantes como GQA, RoPE escalado o atención con ventana deslizante. Tampoco se declara ningún mecanismo de innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos o arquitecturas híbridas SSM).

El elemento diferencial declarado es el tokenizador: un esquema de bytes ("schema-1") en lugar de un tokenizador BPE o SentencePiece. Esto implica que el texto se codifica byte a byte, de modo que cada palabra española o inglesa de longitud media consume aproximadamente entre 4 y 8 tokens según la codificación UTF-8, frente a 1 o 2 tokens en un tokenizador subword. La consecuencia práctica es que la ventana de contexto efectiva medida en caracteres se reduce en la misma proporción y que el coste de inferencia por palabra generada aumenta.

No hay información sobre el volumen de tokens de entrenamiento, la composición del corpus, si hubo ajuste por instrucciones (SFT), RLHF o DPO, ni sobre el proceso de destilación o poda. La existencia de `EU-BOM.json` sugiere que el autor ha preparado una divulgación de contenidos de entrenamiento conforme al régimen europeo de modelos de propósito general, pero el contenido de ese fichero no forma parte de la información disponible.

## Capacidades

- Generación de texto autoregresiva básica, conforme al pipeline `text-generation` declarado.
- Conversación multi-turno a nivel de formato, ya que la etiqueta `conversational` aparece entre los tags del repositorio.
- Posible especialización en sintaxis y fundamentos de Python, inferida únicamente del nombre del modelo (`python-basics`); no está confirmada por la model card ni por ninguna evaluación.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles (`text-generation-inference`, `endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, modo "thinking", visión, audio ni ninguna otra capacidad especial.
- No se declara soporte multilingüe ni una lista de idiomas; el tokenizador de bytes es, en teoría, capaz de representar cualquier codificación UTF-8, pero eso no equivale a competencia lingüística demostrada.

## Casos de uso

- Pruebas de humo en pipelines de despliegue: por su tamaño (menos de 10 millones de parámetros), el modelo permite validar de extremo a extremo una integración con Transformers, TGI o un endpoint compatible sin consumir GPU ni presupuesto de cómputo, verificando carga de pesos, tokenizador con código remoto y formato de respuesta.
- Material didáctico sobre exportación de modelos: sirve como ejemplo real de release que incluye `BOM.json` y `EU-BOM.json`, útil para explicar en un taller cómo se documenta un inventario de artefactos y una divulgación de contenido de entrenamiento.
- Prototipado de tuberías de datos con tokenizador de bytes: permite medir de forma empírica la diferencia de longitud de secuencia entre un esquema byte-level y un BPE sobre el mismo corpus, y calcular el impacto en el coste de atención.
- Asistencia muy acotada en aprendizaje de sintaxis de Python: con un ajuste específico sobre fundamentos del lenguaje, podría completar fragmentos triviales (asignaciones, bucles, condicionales) en un entorno de práctica controlado y siempre con revisión humana; el tamaño del modelo descarta usos de producción no asistidos.
- Demostración de inferencia en CPU o en hardware embebido: con pesos en el rango de decenas de megabytes, es viable ejecutarlo en una Raspberry Pi, en un contenedor sin GPU o incluso dentro de un test unitario de CI que compruebe que el endpoint responde.
- Evaluación comparativa de tokenizadores propios: si se desarrolla un tokenizador nuevo, este modelo sirve como banco de pruebas para comparar perplejidad y velocidad frente a un esquema byte-level de referencia en un corpus reducido.
- Reproducción de experimentos de fine-tuning a pequeña escala: su volumen permite reentrenar o ajustar variantes completas en una única GPU de consumo en minutos, lo que facilita estudiar sensibilidad a hiperparámetros sin coste apreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra métrica, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros asociadas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 38 MB en FP32, 19 MB en FP16/BF16, 9,5 MB en INT8 y 4,8 MB en INT4. Hay que añadir el espacio de activaciones y la caché KV, que dependen de la longitud de contexto real (no declarada) y del número de capas y cabezas (también no declarados).
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en una GTX 1050 Ti, una RTX 3060, una RTX 4090, una A100 o una H100; ninguna de ellas es necesaria.
- Inferencia en CPU: totalmente viable gracias al tamaño reducido; es el escenario de despliegue más razonable.
- Despliegue: `transformers` con `trust_remote_code=True` para el tokenizador, Text Generation Inference (etiqueta declarada en el repositorio) y endpoints compatibles con la API de Hugging Face. El soporte en vLLM, llama.cpp u Ollama no está confirmado y requeriría convertir los pesos a GGUF y portar el tokenizador de bytes, que no es estándar.
- Latencia y throughput: no disponible. Como referencia estructural, el tokenizador de bytes multiplica por un factor aproximado de 4 a 8 el número de tokens necesarios para representar el mismo texto respecto a un tokenizador subword, lo que encarece proporcionalmente la generación.

## Comparativa con modelos similares

No existen benchmarks del modelo analizado, por lo que la comparación es estructural (tamaño, contexto declarado y licencia) y no de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0014-u0-mdagosta-b | 9,54 M | No disponible | No disponible | Hugging Face, 0 descargas | Tokenizador de bytes propio; requiere `trust_remote_code=True` |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | Hugging Face, ampliamente descargado | Tokenizador BPE; familia con informes de evaluación publicados |
| Qwen2.5-0.5B | ≈0,49 B | 32.768 tokens nativos | Apache-2.0 | Hugging Face, ecosistema amplio | Tokenizador BPE multilingüe; soporta decodificación especulativa con modelos auxiliares |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | Hugging Face | Entrenado sobre 3 billones de tokens según su documentación pública |

La diferencia de escala con las alternativas es de uno a dos órdenes de magnitud en parámetros, y la ausencia de licencia explícita en el modelo analizado impide equiparar las condiciones de uso comercial con las de los tres modelos de referencia, que publican licencia Apache-2.0.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin un texto de licencia no hay autorización explícita de uso comercial, redistribución ni modificación; en la práctica, el modelo no debería utilizarse en producción sin aclarar antes las condiciones con el autor.
- Idiomas no declarados: no se puede afirmar qué lenguas domina ni con qué calidad; el soporte de bytes no garantiza competencia lingüística.
- Riesgo elevado de alucinación y de incoherencia: con 9,5 millones de parámetros, la capacidad de mantener consistencia factual o lógica en textos largos es muy limitada incluso en modelos mucho mayores.
- Contexto no declarado: se desconoce la ventana máxima, y el tokenizador de bytes reduce de forma notable el contenido útil que cabe en ella.
- Ejecución de código remoto: cargar el tokenizador con `trust_remote_code=True` implica ejecutar código Python publicado en el repositorio; conviene auditar los ficheros antes de hacerlo en un entorno con datos sensibles.
- Ausencia de evaluación: no hay métricas, ni comparativas, ni procesos de red teaming documentados; cualquier afirmación sobre su calidad es una hipótesis.
- Metadatos anómalos: las fechas de creación y actualización indican septiembre de 2026, lo que puede deberse a un error del autor o a un problema de registro, pero dificulta la trazabilidad de la versión.
- Trazabilidad del corpus: aunque se incluye un fichero `EU-BOM.json` de divulgación, su contenido no está disponible en la información consultada, por lo que no se puede verificar la procedencia de los datos de entrenamiento ni descartar problemas de derechos de autor.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron únicamente páginas no relacionadas (foros de preguntas en chino y letras de canciones), sin documentación técnica, paper ni repositorio asociado al proyecto OpenWALDO.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta-b
- Inventario de ficheros de la release (`BOM.json`): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta-b/blob/main/BOM.json
- Divulgación de contenido de entrenamiento GPAI de la UE (`EU-BOM.json`): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u0-mdagosta-b/blob/main/EU-BOM.json
- Repositorio, paper o blog oficial del proyecto OpenWALDO: no disponible en la información consultada.
- La búsqueda web no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos eran páginas sin relación con el proyecto.
