# mradermacher/SpaceCode-E2B-i1-GGUF

## Resumen

SpaceCode-E2B-i1-GGUF es una colección de cuantizaciones en formato GGUF con matriz de importancia (imatrix) del modelo base SpaceGhost/SpaceCode-E2B, realizadas por el cuantizador comunitario mradermacher. El modelo base es un modelo de código multimodal (etiquetado con visión y código) de aproximadamente 4.647 millones de parámetros, orientado a ingeniería de software, con especial énfasis en desarrollo móvil con React Native, Android y Expo, así como TypeScript y Python.

La relevancia de esta ficha radica en que el repositorio no es un modelo nuevo, sino la versión cuantizada que permite ejecutar el modelo base en hardware de consumo mediante llama.cpp u Ollama. Las cuantizaciones imatrix (weighted) suelen ofrecer mejor calidad que las cuantizaciones estáticas a tamaños equivalentes, especialmente en los niveles bajos (Q2 y Q3), donde la matriz de importancia reduce la degradación del perplexity.

El modelo base se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio incluye cuantizaciones desde i1-Q2_K (3,1 GB) hasta i1-Q6_K (3,9 GB), además del archivo imatrix para generar cuantizaciones propias. Los idiomas declarados son inglés y portugués, y el modelo está etiquetado como conversacional y multimodal (visión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según etiqueta transformers) |
| Parametros totales | 4.647.450.147 (~4,65 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | ingles (en), portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El repositorio analizado no describe la arquitectura del modelo base, ya que se limita a distribuir cuantizaciones GGUF. Por los metadatos de Hugging Face sabemos que el modelo base (SpaceGhost/SpaceCode-E2B) tiene 4.647.450.147 parametros en safetensors, que esta cuantizado con la libreria transformers y que se etiqueta como multimodal (vision) y de codigo. La cuantizacion imatrix se calcula a partir de un conjunto de calibracion para ponderar la importancia de cada tensor, tecnica popularizada por ikawrakow en llama.cpp que mejora la calidad de los cuants bajos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas como RLHF o DPO. Las etiquetas del modelo base (software-engineering, react-native, android, expo, typescript, python) sugieren un entrenamiento o fine-tuning enfocado en datos de desarrollo de software movil, pero el detalle concreto no esta disponible.

## Capacidades

- Generacion de codigo: el modelo base esta especializado en codigo, con enfasis en TypeScript, Python, React Native, Android y Expo, segun las etiquetas del repositorio.
- Capacidades multimodales: etiquetado con "vision" y "multimodal", lo que indica entrada de imagenes (el repositorio de cuantizacion no incluye archivo mmproj, segun el campo skip_mmproj vacio; no se confirma el soporte en llama.cpp).
- Uso conversacional: etiquetado como "conversational".
- Cuantizaciones con imatrix: mejor relacion calidad/tamano en niveles bajos de cuantizacion frente a cuants estaticos.
- Compatibilidad con llama.cpp y Ollama: los GGUF pueden ejecutarse localmente en CPU, GPU o configuraciones hibridas.
- Soporte de tool calling, agentes y multi-step reasoning: no disponible (no documentado en la model card).

## Casos de uso

- Desarrollo de aplicaciones React Native y Expo: el modelo puede asistir en la generacion y depuracion de componentes, pantallas y configuraciones de Expo, dado que el modelo base esta etiquetado especificamente para este ecosistema.
- Asistencia de codigo en local sin enviar datos a la nube: con la cuantizacion i1-Q4_K_M (3,5 GB) cabe en portatiles y GPUs de consumo, ideal para completar codigo en editores con privacidad total.
- Migracion y refactorizacion de codigo TypeScript y Python: util para traducir logicas entre estos lenguajes en proyectos de tamano pequeno y mediano dentro de su ventana de contexto.
- Prototipado rapido de apps Android: generacion de esqueletos de proyecto, pantallas y logica de negocio en Kotlin/TypeScript via React Native.
- Ejecucion en dispositivos de bajos recursos: las cuantizaciones i1-Q2_K e i1-IQ3_S (3,1-3,2 GB) permiten inferencia en CPUs modestas o en equipos sin GPU dedicada.
- Creacion de cuantizaciones personalizadas: el archivo imatrix de 0,1 GB permite a usuarios avanzados generar sus propios cuants ajustados a su hardware.
- Integracion en Ollama para asistentes locales: despliegue sencillo como asistente conversacional de programacion en estaciones de trabajo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~4,65 B de parametros, los tamaños de los ficheros GGUF van de 3,1 GB (i1-Q2_K) a 3,9 GB (i1-Q6_K); anade margen para el KV cache segun la longitud de contexto (no disponible). Una GPU con 6-8 GB de VRAM ejecuta comodamente los cuants Q4-Q6; con 4 GB caben los cuants Q2-Q3.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 o superiores para contextos largos y alta velocidad; en CPU, procesadores modernos con 8-16 GB de RAM libres son suficientes dado el tamano reducido de los ficheros.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna de 6 GB o mas con cuants Q4_K_M o inferiores; incluso en portatiles con GPU integrada usando descarga parcial de capas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (etiqueta incluida en el repo), LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponibles; dada la cuantizacion y el tamano (~3,5 GB en Q4_K_M), se espera inferencia fluida en GPU de consumo y velocidades aceptables en CPU moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion | Notas |
|---|---|---|---|---|---|
| SpaceCode-E2B (este, cuantizado) | ~4,65 B | GGUF (imatrix) | Apache 2.0 | Codigo, React Native, Expo, vision | Cuants de 3,1-3,9 GB |
| Qwen2.5-Coder-7B-Instruct | 7 B | safetensors, GGUF comunitario | Apache 2.0 | Codigo general | Mayor tamano, benchmarks publicados |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (2,4 B activos, MoE) | safetensors, GGUF comunitario | DeepSeek License (uso comercial restringido) | Codigo general | MoE, mas rapido por token |
| CodeLlama-7B-Instruct | 7 B | safetensors, GGUF comunitario | Llama 2 Community License | Codigo general | Modelo mas antiguo, contexto mayor documentado |

Comparacion orientativa por categoria (modelos de codigo de tamano pequeno-mediano); los datos de rendimiento de SpaceCode-E2B no estan disponibles, por lo que no es posible comparar calidad de forma rigurosa.

## Limitaciones y advertencias

- Documentacion escasa: la model card del repositorio de cuantizacion no describe capacidades, contexto ni benchmarks; hay que acudir al modelo base para mas detalle, y tampoco alli se dispone de datos verificados en esta ficha.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o APIs inexistentes; revisa siempre el codigo generado antes de usarlo en produccion.
- Idiomas: declarado para ingles y portugues; el rendimiento en castellano no esta documentado y puede ser inferior.
- Multimodalidad sin confirmar en GGUF: aunque el modelo base esta etiquetado como vision/multimodal, este repo no incluye archivo mmproj, por lo que la entrada de imagenes via llama.cpp no esta garantizada.
- Cuants bajos: las variantes Q2_K y Q3 tienen perdida de calidad notable (el propio autor senala alternativas mejores en cada tamano); usa Q4_K_M o superior para trabajo serio.
- Licencia: Apache 2.0 del modelo base y de la cuantizacion; sin restricciones comerciales relevantes, pero verifica la procedencia del modelo base ante posibles derivaciones de modelos con licencias mas restrictivas.
- Contexto: longitud de ventana no documentada; no asumas contextos largos sin verificarlo empiricamente.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/SpaceCode-E2B-i1-GGUF
- Modelo base: https://huggingface.co/SpaceGhost/SpaceCode-E2B
- Cuants estaticos del mismo modelo: https://huggingface.co/mradermacher/SpaceCode-E2B-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#SpaceCode-E2B-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
