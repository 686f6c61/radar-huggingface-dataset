# Adolphsson/DeepSeek-V4.1-Flash-1017-UNCENSORED-MTP-Maya-Q4-K-IQ4-GGUF

## Resumen

Este repositorio no es un modelo nuevo, sino una **requantización en GGUF de 4 bits** del checkpoint abliterado `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8`, que a su vez deriva de `deepseek-ai/DeepSeek-V4.1-Flash-1017`. El autor, Adolphsson, publica un pack mixto Q4_K/IQ4 con mapas de tensores por grupo, un proyector visual y un drafter MTP opcional, empaquetado específicamente para el motor Project Maya (aunque los shards también cargan en llama.cpp). La model card describe el modelo base como un MoE de 552B parámetros con 8B activos en texto (16B con visión) y 1M tokens de contexto completo, sin ventana deslizante.

Su relevancia es doble. Por un lado, permite ejecutar localmente un modelo de razonamiento multimodal de escala frontier en hardware de estación de trabajo (dos GPU, 256 GB de RAM y ~480 GB de NVMe) gracias a la gestión por capas de expertos del motor Maya. Por otro, conserva la abliteración a nivel de pesos de dealignai, que elimina los circuitos de rechazo manteniendo visión, MoE y normas; el autor mide un 98 % de cumplimiento en HarmBench-320 para verificar que la cuantización agresiva no reintroduce negativas.

Conviene señalar de entrada una **inconsistencia documental**: los metadatos de safetensors del repo declaran 485.273.600 parámetros, la model card habla de 552B y una fuente externa (SourceForge) cita 763B. Del mismo modo, el tamaño del repo aparece como 331 GB en los metadatos de HuggingFace y como 471,6 GB en la model card. Se reflejan ambos valores sin resolver el conflicto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base DeepSeek-V4.1-Flash) con encoder visual DeepSeek-ViT + proyector, tensores de indexer y cabeza MTP opcional (DSpark) |
| Parametros totales | 552B según la model card; 485.273.600 según metadatos de safetensors del repo (inconsistente); 763B citado por SourceForge |
| Parametros activos | 8B en texto, 16B con visión (según model card) |
| Longitud de contexto | 1.048.576 tokens (1M, completo, sin ventana deslizante) |
| Tipos de cuantizacion | Mezcla por grupo: IQ4_XS (expertos routed `w2`/`down`), Q4_K (`gate`/`up`), Q8_0 y F32 (atención, expertos compartidos, indexer), Q6_K (cabeza de salida), BF16 (embeddings, mmproj), F32 (normas). Solo se publica esta variante IQ4 |
| Idiomas soportados | `en` (único idioma declarado en la model card); no se documentan otros |
| Licencia | MIT (declarada en el repo); licencia del modelo base DeepSeek no disponible en la información proporcionada |
| Formato de pesos | GGUF en 11 shards + `mmproj` BF16 GGUF; formato nativo Maya (`vision.bin`, `dspark.bin`, `ds4.txt`, `tensors.txt`); tokenizer con `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con atención dispersa, encoder visual y una cabeza de decodificación especulativa multi-token (MTP). El pack incluye grupos de tensores bien diferenciados: 15.360 tensores IQ4_XS para las proyecciones `w2`/`down` de los expertos routed, 30.720 tensores Q4_K para `gate`/`up`, 487 tensores de atención en Q8_0 y 284 en F32, 120 tensores Q8_0 de expertos compartidos, 20 tensores de indexer (8 en Q8_0, 12 en F32) y 41 normas en F32. La decisión de diseño es clara: atención, indexer y expertos compartidos se fijan en 8 bits y las normas se mantienen en F32, mientras que solo las proyecciones de expertos bajan a 4 bits.

El pipeline de cuantización es FP8 (e4m3, escalas por bloque, expertos routed en FP4 en el original) → Q8_0 como puente de precisión completa → requantización IQ4-MAYA. La abliteración es obra de dealignai ("CRACK"), aplicada a nivel de pesos preservando visión, MoE y normas; este repositorio **solo publica la cuantización**. No se dispone de datos sobre el corpus de entrenamiento del modelo base (número de tokens, composición, fases de RLHF/DPO) en la información proporcionada. El componente MTP se distribuye como `dspark.bin`/`dspark.json` (8,5 GB) y es opcional: en las pruebas del autor aporta +2,7 % en prompts cortos y resulta un 11 % más lento a 1M de contexto, por lo que recomienda servirlo sin él.

## Capacidades

- Generación de texto y razonamiento con **tres niveles de esfuerzo** preservados: `low`, `high` y `max`.
- Razonamiento multimodal image-text-to-text: encoder DeepSeek-ViT más proyector, verificado de extremo a extremo (imagen de entrada, descripción de salida).
- Codificación y tareas agénticas, según las mejoras declaradas por DeepSeek para la versión 1017 frente a V4.1-Flash.
- Soporte de **tool calling / function calling** a través de la API compatible con OpenAI y Anthropic que expone Project Maya.
- Flujos agénticos multi-paso con contexto de hasta 1M tokens, sin ventanas deslizantes ni truncado.
- Decodificación especulativa opcional mediante drafter MTP (DSpark), desactivable por configuración.
- Comportamiento **abliterado**: se eliminan los rechazos a nivel de pesos, con un 98 % de cumplimiento medido en HarmBench-320.
- Capacidades multilingües: no documentadas; la model card solo declara inglés.

## Casos de uso

- **Análisis de repositorios completos**: con 1M tokens de contexto se puede cargar un monorepo entero (código, tests, configuración y documentación) en una sola sesión y pedir auditorías de seguridad o refactorizaciones que cruzan módulos, sin recuperación por trozos.
- **Agente de codificación en entorno air-gapped**: el pack corre sobre Project Maya con API compatible con OpenAI, de modo que se puede conectar un IDE o un pipeline de CI/CD en una red aislada donde no se permite enviar código a APIs externas.
- **Procesamiento documental con visión**: introducir capturas de pantalla, diagramas de arquitectura o páginas escaneadas junto con texto y obtener descripciones estructuradas o extracción de datos, usando el proyector BF16 sin cuantizar.
- **Investigación en seguridad y red teaming**: el comportamiento abliterado permite estudiar respuestas del modelo ante prompts que un modelo alineado rechazaría, sin necesidad de jailbreaks frágiles ni de modificar el prompt de sistema.
- **Generación de datos sintéticos sin fricción**: producir grandes volúmenes de pares instrucción-respuesta sobre dominios sensibles (ficción violenta, debates éticos, contenido para adultos) donde los filtros de rechazo interrumpirían la generación por lotes.
- **RAG sobre corpus masivos**: indexar manuales técnicos o expedientes de cientos de miles de tokens y mantener conversaciones multi-turno con el corpus completo en contexto, aprovechando que una segunda sesión paralela consume menos de 1 GB adicional.
- **Sesiones agénticas de larga duración**: tareas que requieren decenas de llamadas a herramientas y acumulan historial, donde el coste de compactar contexto suele dominar; aquí el contexto de 1M evita esa compactación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. La model card menciona que las matemáticas son el área donde "se nota la falta de bits", pero la sección de benchmarks del documento está cortada. Los únicos datos cuantitativos aportados son:

| Metrica | Resultado | Contexto |
|---|---|---|
| HarmBench-320 (cumplimiento) | 98 % | Verificación de que la cuantización a 4 bits no reintroduce rechazos |
| Delta del drafter MTP, prompts cortos | +2,7 % de velocidad | Dentro del ruido según el autor |
| Delta del drafter MTP, contexto 1M | −11 % de velocidad | Motivo por el que se sirve sin MTP |
| Throughput absoluto (tokens/s) | No disponible | No se publican cifras absolutas ni hardware exacto de las pruebas |

## Requisitos de hardware

- **VRAM**: no se especifica un mínimo; el autor indica que "más VRAM es más rápido" y que Maya mantiene en GPU los expertos que la conversación usa, en RAM los siguientes y en NVMe el resto. Con 552B a 4 bits, un despliegue totalmente residente exigiría del orden de 280-300 GB de VRAM, cifra estimada a partir del tamaño del pack, no publicada por el autor.
- **GPU**: NVIDIA con compute capability 7.0 o superior (V100, RTX 20xx y posteriores). La configuración de referencia usa `--tp 2` sobre dos GPU no identificadas.
- **Memoria del sistema**: ~256 GB de RAM para el modelo; Maya reserva la RAM libre para el nivel de expertos y deja unos 6 GB para el resto del sistema.
- **Almacenamiento**: NVMe rápido con ~480 GB libres.
- **Software**: CUDA 12.x, Python con `jinja2`, `numpy` y `pillow`, y el binario `maya-ds4` compilado desde el repositorio de Project Maya.
- **Consumer GPU**: no cabe. El modelo no es viable en una RTX 4090 ni en configuraciones de 24-48 GB, ni siquiera con offload parcial razonable.
- **Opciones de despliegue**: Project Maya es el motor principal y el único para el que se documenta configuración completa (visión, niveles de razonamiento, tool calls, API OpenAI/Anthropic). Los shards son compatibles con llama.cpp, que también puede cargar el `mmproj` BF16; no se documenta soporte para vLLM, TGI u Ollama.
- **Latencia y throughput**: solo se conocen los deltas relativos del drafter MTP (+2,7 % en corto, −11 % a 1M). No hay cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Precision | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este pack (Adolphsson IQ4-MAYA) | 552B MoE (8B/16B activos) según card; metadatos inconsistentes | 1M | Si | IQ4_XS / Q4_K / Q8_0 mixto | MIT | Requiere Maya o llama.cpp; 98 % HarmBench-320; pensado para streaming de expertos desde NVMe |
| `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8` | Idénticos al original | 1M | Si | FP8 e4m3 con expertos routed FP4 | No disponible | Fuente de esta cuantización; ocupa aproximadamente el doble y necesita más VRAM o más offload |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` | 552B MoE según la cadena de derivación | 1M | Si | No disponible | No disponible en la información proporcionada | Modelo original con alineación intacta; rechaza peticiones dañinas |

No se dispone de datos de benchmarks ni de especificaciones verificables de otras familias comparables (por ejemplo, otros MoE abliterados de escala similar) en la información proporcionada, por lo que la comparación cruzada de rendimiento queda como no disponible.

## Limitaciones y advertencias

- **Riesgo de seguridad elevado**: un 98 % de cumplimiento en HarmBench-320 implica que el modelo acepta prácticamente cualquier petición dañina. No es apto para exposición directa a usuarios finales sin una capa externa de moderación.
- **Degradación en matemáticas**: el propio autor reconoce que la cuantización a 4 bits se nota en tareas matemáticas; no cuantifica la pérdida, pero conviene validar con evaluaciones propias antes de usarlo en dominios que dependan de cálculo exacto.
- **Abliteración como fuente de sesgos**: eliminar los circuitos de rechazo a nivel de pesos puede alterar también la calibración y el tono en dominios sensibles; no se documentan evaluaciones de sesgo demográfico ni de toxicidad más allá de HarmBench.
- **Idioma**: solo se declara inglés. El rendimiento en castellano no está verificado y no debería asumirse por herencia del modelo base.
- **Inconsistencias de metadatos**: el recuento de parámetros (485,27 M en safetensors frente a 552B en la card frente a 763B en una fuente externa) y el tamaño del repo (331 GB frente a 471,6 GB) no cuadran. Verificar el contenido real de los shards antes de planificar el almacenamiento.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de la calidad del pack ni de su comportamiento en llama.cpp frente a Maya.
- **Dependencia de un motor concreto**: el flujo documentado asume Project Maya. Fuera de él, ni los niveles de razonamiento ni la configuración de sampling están garantizados, y el drafter MTP no aporta nada en contexto largo.
- **Licencia**: el repo declara MIT, pero al ser un derivado de pesos de DeepSeek conviene revisar los términos del modelo base, no disponibles en la información proporcionada, antes de un uso comercial.
- **Requisitos de infraestructura**: 256 GB de RAM, ~480 GB de NVMe y dos GPU no identificadas lo sitúan fuera del alcance de estaciones de trabajo convencionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Adolphsson/DeepSeek-V4.1-Flash-1017-UNCENSORED-MTP-Maya-Q4-K-IQ4-GGUF
- Modelo base abliterado (FP8): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo original DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Espejo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Espejo en SourceForge: https://sourceforge.net/projects/deepseek-v41-flash-1017.mirror/
- Análisis en el blog de DeepSeek: https://deepseek.ai/blog/deepseek-v41-flash-1017-deepinfer-review
- Project Maya (motor): https://github.com/mw00/project-maya
- Documentación de instalación de Maya: https://github.com/mw00/project-maya/blob/main/docs/SETUP.md
- Documentación de opciones de Maya: https://github.com/mw00/project-maya/blob/main/docs/SETTINGS.md
