# nextgenaimx/osadia-1.5b-edge

## Resumen

OSADÍA 1.5B Edge es un modelo de lenguaje de 1.258 millones de parámetros desarrollado por Next Gen AI Mexico, presentado como un modelo fundacional "soberano" orientado a inferencia de baja latencia en dispositivos móviles, hardware embebido, portátiles y pasarelas edge en México y Latinoamérica. Según la model card, se entrenó y destiló directamente del "OSADIA 12B Master Teacher" sobre datos verificados con alineación lingüística regional mexicana, partiendo del modelo base `native-osadia-ground-up`.

La arquitectura declarada es propietaria ("Native OSADIA Axiom Architecture", `osadia_core.py`), con 24 capas, dimensión oculta de 1.536, atención con Grouped Query Attention en ratio 3:1 (12 cabezas de query, 4 de key/value) y FFN de 4.096. El contexto es de solo 2.048 tokens y el vocabulario de 65.536 tokens. Se distribuye en BF16 (2,40 GB), INT8 (~1,25 GB) e INT4 (~650 MB), lo que lo sitúa en la franja de modelos que caben en GPUs de consumo e incluso en dispositivos de gama baja.

El interés del modelo es doble: por un lado, propone un caso de uso de despliegue edge con cuantizaciones agresivas; por otro, su model card publica cifras de benchmarks (MMLU 80,0 %, ARC Challenge 100,0 %, HellaSwag 100,0 %) que resultan atípicas para un modelo de 1.26B y que deben interpretarse con cautela, ya que no se acompañan de metodología de evaluación ni de scripts reproducibles. La licencia es la propietaria "Sovereign Open Community License 1.0" (SOCL-1.0), con requisitos de atribución para obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Native OSADIA Axiom Architecture (transformer con GQA 3:1) |
| Parametros totales | 1.258.409.544 (1,26 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | BF16 nativo, INT8 per-channel simétrico (8Q), INT4 packed simétrico (4Q); tag GGUF |
| Idiomas soportados | es, en (con alineación declarada a español mexicano y dialectos regionales) |
| Licencia | sovereign-open-community-license-1.0 (SOCL-1.0), con cláusula de atribución |
| Formato de pesos | safetensors/PyTorch (repo de 5,1 GB); GGUF referenciado en tags, sin confirmar artefacto publicado |

Otras especificaciones declaradas: dimensión oculta 1.536, 24 capas, 12 cabezas de query y 4 de key/value, FFN intermedio de 4.096, vocabulario de 65.536 tokens. Tamaños de artefacto declarados: BF16 2,40 GB, INT8 ~1,25 GB, INT4 ~650 MB.

## Arquitectura y entrenamiento

La model card describe una arquitectura transformer propia bautizada como "Native OSADIA Axiom Architecture", implementada en un fichero `osadia_core.py` que no se detalla. Los datos disponibles permiten reconstruir un transformer decoder-only estándar: 24 capas, dimensión oculta 1.536, FFN de 4.096 y atención con Grouped Query Attention en ratio 3:1 (12 cabezas de query frente a 4 de key/value), lo que reduce el coste de memoria de la KV cache en inferencia. El vocabulario es de 65.536 tokens y se declara cobertura completa de Unicode y dialectos mexicanos.

El entrenamiento se presenta como una destilación desde un "OSADIA 12B Master Teacher" sobre el corpus `NextGenAiMX/The-Data-Factory-Cleanroom-Corpus`, con alineación lingüística regional mexicana. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del uso de GQA y de las cuantizaciones INT8/INT4 empaquetadas.

## Capacidades

- Generación de texto en español (con foco declarado en español mexicano y dialectos regionales) e inglés.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado según la model card en MMLU, ARC Challenge y HellaSwag).
- Razonamiento matemático básico de varios pasos (evaluado en GSM8K).
- Cobertura declarada de terminología legal soberana y fiscal mexicana (benchmark propio "Sovereign Legal / SAT MX").
- Cuantización a INT8 e INT4 para despliegue en hardware limitado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: con 1,26 B de parámetros y un artefacto INT4 de ~650 MB, el modelo puede ejecutarse localmente en teléfonos de gama media-alta, ofreciendo respuestas sin conexión y sin enviar datos del usuario a la nube.
- Pasarelas edge en entornos con conectividad intermitente: despliegue en gateways industriales o rurales para tareas de clasificación, extracción y resumen de texto en español, donde un contexto de 2.048 tokens es suficiente para documentos cortos.
- Atención al cliente en español mexicano: el modelo declara alineación dialectal regional, lo que lo hace adecuado para respuestas con registro local en chats de soporte de primer nivel, derivando a un modelo mayor cuando la consulta exceda el contexto o requiera razonamiento complejo.
- Procesamiento de documentación administrativa y fiscal mexicana: la model card cita un benchmark propio de legal/SAT; puede emplearse para extracción de campos y respuestas guiadas sobre formularios y trámites, siempre con validación humana.
- Prototipado rápido y pruebas de concepto: su tamaño permite iterar en portátiles con GPU de consumo (por ejemplo, una RTX 3060 de 12 GB) o incluso en CPU con cuantización INT4, reduciendo el coste de experimentación frente a modelos de 7B o superiores.
- Filtrado y preprocesado en pipelines de datos: clasificación de textos, detección de idioma y normalización de contenido en español antes de pasarlos a modelos mayores, aprovechando su baja latencia.
- Fine-tuning ligero en dominios verticales: al ser un modelo pequeño con licencia que permite ajuste, es viable adaptarlo con LoRA a vocabularios sectoriales (agro, salud rural, administración local) en hardware modesto.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (sin metodología de evaluación detallada ni scripts reproducibles):

| Benchmark | OSADÍA 1.5B Edge | LLaMA-3.2 1B (referencia del autor) | Delta |
|---|---|---|---|
| MMLU | 80,0 % | 49,3 % | +30,7 pp |
| ARC Challenge | 100,0 % | 44,5 % | +55,5 pp |
| GSM8K | 50,0 % | 36,8 % | +13,2 pp |
| HellaSwag | 100,0 % | 64,2 % | +35,8 pp |
| Sovereign Legal / SAT MX | 100,0 % | no disponible | línea base propia |

Advertencia: las puntuaciones de 100,0 % en ARC Challenge, HellaSwag y el benchmark propio, junto con un MMLU de 80,0 % para un modelo de 1,26 B, son muy superiores a lo habitual en la categoría y no vienen acompañadas de detalles sobre número de shots, prompts, versión del harness o posible contaminación del conjunto de evaluación. No se han publicado resultados independientes verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5-3 GB en BF16 (pesos de 2,40 GB más overhead de activaciones y KV cache), ~1,4-1,8 GB en INT8 y ~0,8-1,2 GB en INT4 para contextos de hasta 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (RTX 3050, RTX 4060, T4); para INT4 basta con GPUs de 2-4 GB o incluso inferencia en CPU.
- Cabe en GPU de consumo: sí, en toda la gama RTX 30/40 con 6 GB o más en BF16, y en GPUs integradas o móviles con cuantización INT4.
- Opciones de despliegue: PyTorch nativo (pesos safetensors), llama.cpp/Ollama si se publica el GGUF referenciado en los tags, y vLLM/TGI para despliegue en servidor (compatibilidad no confirmada con la arquitectura propietaria). La model card marca `inference: false`, por lo que el soporte en frameworks de terceros no está garantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OSADÍA 1.5B Edge | 1,26 B | 2.048 | SOCL-1.0 (propietaria, con atribución) | HuggingFace, repo de 5,1 GB |
| LLaMA-3.2 1B | 1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace, amplio ecosistema |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 | HuggingFace, GGUF y múltiples frameworks |
| Gemma 2 2B | 2,6 B | 8.192 | Gemma Terms of Use | HuggingFace, ecosistema amplio |

Frente a estos modelos, OSADÍA 1.5B Edge ofrece un contexto mucho más corto (2.048 tokens frente a 8.192-128.000) y una licencia propietaria con cláusula de atribución, pero declara un foco específico en español mexicano y cuantizaciones muy compactas. Su ecosistema de herramientas es mucho menor: la model card marca `inference: false` y no se confirma soporte en vLLM, llama.cpp u Ollama más allá de los tags. Las cifras de benchmarks declaradas no son comparables de forma fiable con las de los modelos de referencia sin una evaluación independiente.

## Limitaciones y advertencias

- Ventana de contexto muy limitada (2.048 tokens): insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperación aumentada con múltiples fragmentos.
- Benchmarks no verificables: las puntuaciones de 100,0 % en varios benchmarks y un MMLU de 80,0 % para 1,26 B son anómalas y no se acompañan de metodología; deben tratarse como no confirmadas hasta una evaluación independiente.
- Riesgo de alucinación: como todo modelo de 1,26 B, la precisión factual en conocimiento general y en dominios especializados es limitada; el benchmark propio de legal/SAT no está auditado externamente.
- Sesgos: no se documentan análisis de sesgo, toxicidad ni evaluación de seguridad en la información disponible; la alineación a un registro regional concreto puede introducir sesgos dialectales.
- Licencia: SOCL-1.0 es una licencia propietaria "other"; aunque permite uso comercial, exige retener el aviso del propietario de los pesos, el nombre original del modelo, el arquitecto y el repositorio oficial en cualquier fork, cuantización, merge o derivado. Conviene revisar el texto completo de `LICENSE.md` antes de producción.
- Arquitectura propietaria: al no ser una arquitectura estándar de HuggingFace Transformers, la integración con frameworks de inferencia y servido puede requerir código propio (`osadia_core.py`); la model card marca `inference: false`.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación por la comunidad.
- Idiomas: solo español e inglés declarados; el rendimiento en otras lenguas no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nextgenaimx/osadia-1.5b-edge
- Repositorio oficial declarado: https://github.com/NextGenAiMX/osadia-ai
- Licencia (referenciada en la model card): `LICENSE.md` dentro del repositorio de HuggingFace
- Dataset de entrenamiento: https://huggingface.co/datasets/NextGenAiMX/The-Data-Factory-Cleanroom-Corpus
- Paper, blog o demo: no disponibles en la información proporcionada.
