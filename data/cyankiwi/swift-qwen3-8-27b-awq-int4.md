# cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4

## Resumen

Swift-Qwen3.8-27B-AWQ-INT4 es una version cuantizada a 4 bits (AWQ) del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario cyankiwi. Se trata de un derivado de Qwen3.8-27B orientado a la eficiencia de razonamiento: segun la model card, reduce el numero de tokens de "thinking" en un 58,3 % manteniendo una perdida de rendimiento inferior al 1 % y logrando una aceleracion de x1,95 en varias tareas. La cuantizacion AWQ busca reducir el peso en disco y en VRAM para facilitar el despliegue en hardware mas modesto, manteniendo un pipeline multimodal de tipo image-text-to-text.

El modelo base fue desarrollado por UkisAI y se distribuye bajo la licencia swift-open-license-1.0, con acceso restringido (gated). Cuenta con 27.781.427.952 parametros (27,78 mil millones) y el repositorio ocupa 21,0 GB. La model card declara soporte para diez idiomas (ingles, chino, hindi, arabe, ruso, japones, coreano, neerlandes, frances y espanol) e incluye etiquetas de razonamiento eficiente en tokens, LoRA y compatible con endpoints.

La relevancia de esta ficha radica en que combina dos tendencias actuales: la reduccion del coste de inferencia en modelos de razonamiento (menos tokens generados por respuesta) y la cuantizacion de precisión reducida para servirlos en GPUs de gama alta de consumo o en nodos de inferencia economicos. No obstante, no se dispone de informacion completa sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados detallados de benchmarks de esta version cuantizada concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) derivado de Qwen3.8-27B; no se detalla si emplea MoE o atencion hibrida: no disponible |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (formato compressed-tensors), calibrado con el dataset "STEM and Agentic" de cyankiwi; el modelo base publica tambien GGUF |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | swift-open-license-1.0 (license: other), con acceso restringido (gated) |
| Formato de pesos | safetensors (compressed-tensors, AWQ INT4), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que acepta entradas de imagen y texto. Sobre el, UkisAI entreno el derivado Swift mediante un proceso de ajuste fino orientado a penalizar los tokens marcadores de razonamiento que, segun su analisis, disparan el "overthinking" en los rollouts de razonamiento de Qwen. El resultado son trazas de pensamiento mas cortas, con menos errores por sobre-razonamiento segun las pruebas del autor. Ademas, Swift incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI, segun se indica en la model card.

La capa que anade cyankiwi es puramente de cuantizacion: pesos en INT4 con la tecnica AWQ (Activation-aware Weight Quantization), calibrados con un dataset propio de contenido STEM y agentico. La model card de esta version indica la fecha de version 26.05.01 y un tamano de 21,02 GB. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documenta si la cuantizacion se aplico unicamente a las capas de lenguaje o tambien al encoder visual, ni el impacto de la cuantizacion sobre las capacidades multimodales.

## Capacidades

- Generacion de texto conversacional multi-turno en los diez idiomas declarados.
- Razonamiento con modo de pensamiento ("thinking") optimizado para generar trazas mas cortas y eficientes en tokens.
- Procesamiento de imagenes ademas de texto (pipeline image-text-to-text), es decir, entrada visual junto con instrucciones en lenguaje natural.
- Etiquetas declaradas de eficiencia de tokens, razonamiento y "efficient-thinking", orientadas a reducir el coste por respuesta.
- Conversacion asistida por LoRA (etiqueta lora en los metadatos), lo que sugiere compatibilidad con adaptadores.
- Compatibilidad declarada con endpoints (tag endpoints_compatible) para despliegue gestionado.
- Soporte de tool calling y function calling: no confirmado de forma explicita en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: la calibracion se realizo con datos "STEM and Agentic", lo que sugiere orientacion a flujos agenticos, pero no se documentan capacidades concretas.
- Capacidades de audio o vision avanzada mas alla de image-text-to-text: no disponible.

## Casos de uso

- Razonamiento tecnico con coste controlado: el modelo esta disenado para reducir un 58,3 % los tokens de pensamiento, de modo que tareas de matematicas, logica o analisis en las que el coste se mide por token generado resultan notablemente mas baratas en produccion que con el modelo base sin el ajuste Swift.
- Asistente de analisis de documentos con imagenes: al aceptar entradas image-text-to-text, puede recibir capturas, diagramas, graficos o paginas escaneadas junto a una pregunta en lenguaje natural y devolver una respuesta razonada.
- Agentes de automatizacion STEM: la calibracion AWQ se hizo sobre datos STEM y agenticos, por lo que el caso natural es la resolucion de tareas cientificas o de ingenieria dentro de bucles de agente con multiples iteraciones.
- Atencion al cliente multilingue: con soporte declarado para diez idiomas (incluido el espanol), permite atender conversaciones en varios mercados sin desplegar un modelo distinto por idioma, siempre que se valide la calidad real por idioma.
- Despliegue en GPUs de consumo para prototipado interno: la cuantizacion INT4 reduce el peso del modelo a un rango que cabe en GPUs de 24 GB, lo que facilita entornos de desarrollo y demos sin depender de clústeres de A100/H100.
- Generacion asistida de codigo con razonamiento breve: la reduccion de trazas de pensamiento es util en pipelines de CI/CD donde la latencia por invocacion importa; la demo del autor utiliza un prompt de LiveCodeBench v6 como ejemplo.
- Servicio de inferencia con vLLM o SGLang: al estar en formato compressed-tensors AWQ, es desplegable en motores de serving que soportan cuantizacion INT4, lo que permite mayor throughput por GPU que una version BF16.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks que compara Qwen3.8-27B BF16 con el mismo modelo mas el adaptador Swift, pero el contenido de dicha tabla no esta disponible en la informacion proporcionada (aparece truncado). Los unicos datos agregados disponibles son los siguientes, referidos al adaptador Swift sobre la base BF16 y no a esta version AWQ INT4:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tokens de pensamiento | 58,3 % menos |
| Perdida de rendimiento | inferior al 1 % |
| Aceleracion en varias tareas | x1,95 |
| Resultados por benchmark (MMLU, HumanEval, GSM8K, LiveCodeBench, etc.) | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks especificos de la version cuantizada AWQ INT4 de cyankiwi. Cualquier cifra de rendimiento de la version INT4 deberia medirse localmente, ya que la cuantizacion a 4 bits puede degradar la calidad respecto a BF16.

## Requisitos de hardware

- VRAM estimada para pesos en INT4: aproximadamente 14-15 GB para los 27,78 mil millones de parametros a 4 bits, mas overhead de runtime, cache KV y activaciones; en la practica se recomienda reservar 16-20 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 5090 (32 GB). En GPUs de 16 GB como la RTX 4080 el margen es muy ajustado y dependera de la longitud de contexto y del soporte multimodal.
- GPUs profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para lotes grandes y contextos largos.
- Despliegue: vLLM o SGLang con soporte compressed-tensors/AWQ; TGI; transformers con las librerias de cuantizacion correspondientes. llama.cpp y Ollama requieren formato GGUF, disponible para el modelo base (ukisai/Swift-Qwen3.8-27B-GGUF) pero no en este repositorio.
- Latencia y throughput: no disponible. La aceleracion de x1,95 declarada en la model card se refiere al ahorro por generacion de menos tokens de razonamiento, no a una medicion de throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4 | 27,78 mil millones | no disponible | safetensors AWQ INT4 | swift-open-license-1.0 (gated) | HuggingFace |
| ukisai/Swift-Qwen3.8-27b (base) | 27B aprox. (no confirmado) | no disponible | safetensors (BF16) | swift-open-license-1.0 | HuggingFace |
| Qwen3.8-27B BF16 (modelo de referencia de la model card) | 27B aprox. | no disponible | safetensors | no disponible | no disponible |
| bottlecapai/ThinkingCap-Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos suficientes para comparar rendimiento entre estas alternativas. La comparacion relevante es funcional: la version de cyankiwi ofrece el mismo modelo con menor huella de memoria a cambio de una posible perdida de calidad por la cuantizacion INT4, mientras que el modelo base y su variante GGUF conservan mayor precision o mayor compatibilidad con herramientas de inferencia en CPU.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta marcado como gated, por lo que es necesario aceptar las condiciones del autor antes de descargar los pesos.
- Licencia no estandar: swift-open-license-1.0 es una licencia personalizada con enlace a un texto especifico; es imprescindible revisarla antes de cualquier uso comercial o empresarial, ya que puede incluir restricciones o requerir licencia de empresa ("Enterprise licensing" se menciona en la model card).
- Perdida por cuantizacion: la cuantizacion AWQ INT4 puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento largo, matematicas y codigo. No hay datos publicados del impacto real en esta version.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; como en cualquier modelo de lenguaje, existe riesgo, y la reduccion forzada de tokens de razonamiento podria incrementar la tasa de errores en tareas que requieren cadenas largas de deduccion.
- Idiomas: la lista de idiomas procede de la model card, pero no se aportan metricas por idioma; la calidad en espanol, hindi, arabe o coreano no esta cuantificada.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con documentos extensos o conversaciones de muchos turnos.
- Capacidades agenticas y tool calling: la calibracion se hizo con datos agenticos, pero no se documenta el soporte formal de function calling en esta version cuantizada.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad para este modelo ni para su base.
- Modelo reciente y con poca traccion: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Detalles de entrenamiento incompletos: no se especifican tokens de entrenamiento, composicion del dataset, ni el uso de RLHF/DPO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyankiwi/Swift-Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Version GGUF del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Dataset de calibracion usado por el cuantizador: https://huggingface.co/datasets/cyankiwi/calibration
- Componente de transferencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Web del desarrollador: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo en video del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/resolve/main/swift-speed-demo.mp4
- Contacto del cuantizador: ton@cyan.kiwi
- Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los unicos resultados obtenidos corresponden a un curriculum educativo no relacionado.
