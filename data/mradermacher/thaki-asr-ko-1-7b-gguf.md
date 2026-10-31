# mradermacher/Thaki-ASR-KO-1.7B-GGUF

## Resumen

Thaki-ASR-KO-1.7B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Thaki-ASR-KO-1.7B, publicado por el cuantizador mradermacher a partir del modelo original de ThakiCloud. El modelo base es un sistema de reconocimiento automático de habla (ASR) especializado en coreano, basado en la arquitectura Qwen3-ASR y afinado sobre los conjuntos de datos Bingsu/zeroth-korean y amphion/Emilia-Dataset, con un enfoque particular en el ámbito de la telefonía.

Su relevancia reside en dos factores: por un lado, cubre una necesidad específica (ASR de alta calidad en coreano para entornos de telephony, un dominio con requisitos acústicos exigentes como audio comprimido de llamadas); por otro, la versión GGUF permite ejecutar la inferencia localmente en CPU o en GPU de consumo mediante llama.cpp u Ollama, sin depender de servicios en la nube. Con unos 1.720 millones de parámetros y archivos que van desde 0,9 GB (Q2_K) hasta 3,5 GB (f16), es un modelo ligero y accesible para despliegues en el borde (edge) o en servidores modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-ASR (transformer multimodal audio-texto) |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, Thaki-ASR-KO-1.7B, se construye sobre la arquitectura Qwen3-ASR, un enfoque que adapta un modelo de lenguaje tipo transformer para tareas de transcripcion de audio mediante un componente multimodal (codificador de audio proyectado al espacio de embeddings del LLM). La presencia de archivos mmproj (suplemento multimodal) en el repo GGUF confirma esta estructura: un proyector multimodal separado que conecta el codificador de audio con el modelo de lenguaje principal.

El afinado se realizo sobre dos conjuntos de datos publicos: Bingsu/zeroth-korean, un corpus clasico de habla coreana de lectura ampliamente usado en ASR, y amphion/Emilia-Dataset, un corpus multilingue a gran escala de habla en condiciones reales. El etiquetado con el tag "telephony" indica una optimizacion para audio de llamadas telefonicas, tipicamente de banda estrecha y con ruido. No hay informacion disponible sobre el numero de tokens de entrenamiento, el uso de RLHF/DPO ni otras tecnicas de post-entrenamiento. Las cuantizaciones de este repositorio son estaticas (no imatrix/weighted) realizadas por mradermacher.

## Capacidades

- Transcripcion automatica de habla en coreano (ASR), con especializacion en audio telefonico.
- Procesamiento de audio multimodal mediante el componente mmproj incluido en el repo GGUF.
- Ejecucion local en CPU o GPU gracias al formato GGUF, con un amplio rango de cuantizaciones.
- Etiquetado como "conversational", orientado a flujos de dialogo hablado.
- No hay informacion disponible sobre tool calling, capacidades de agente, razonamiento, codigo, ni soporte de otros idiomas.

## Casos de uso

- **Transcripcion de llamadas de call center**: el afinado con enfoque en telephony lo hace adecuado para transcribir grabaciones de llamadas de soporte al cliente en coreano, permitiendo analisis posterior de calidad y cumplimiento normativo.
- **Subtitulado y accesibilidad**: generacion de subtitulos automaticos para contenido audiovisual en coreano, ejecutandose localmente con la cuantizacion Q4_K_M (1,2 GB) en equipos sin GPU dedicada.
- **Asistentes de voz en el borde (edge)**: integracion en dispositivos o kioscos con hardware limitado, dado que el modelo cuantizado cabe en menos de 2 GB de memoria.
- **Transcripcion de notas de voz y mensajeria**: conversion de audios de aplicaciones de mensajeria a texto para indexacion y busqueda, sin enviar datos a servicios externos gracias a la ejecucion local.
- **Preprocesamiento para pipelines de NLP en coreano**: transcripcion masiva de corpus de audio para alimentar sistemas posteriores de resumen, clasificacion o analisis de sentimiento.
- **Prototipado e investigacion en ASR**: la licencia Apache 2.0 y el tamano reducido facilitan experimentacion, fine-tuning posterior y evaluacion comparativa en laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No consta ninguna metrica de WER (word error rate) ni CER (character error rate) ni comparativas con otros sistemas ASR.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: desde ~0,9 GB (Q2_K) hasta ~3,5 GB (f16); la cuantizacion recomendada Q4_K_M requiere aproximadamente 1,2 GB mas el proyector multimodal (0,5-0,7 GB).
- **GPU recomendadas**: no requiere GPU dedicada; cualquier GPU con 2-4 GB de VRAM (por ejemplo, una GTX 1650 o RTX 3060) ejecuta las cuantizaciones medias con holgura. Para el modelo base en f16, 4 GB de VRAM son suficientes.
- **Cabe en GPU de consumo**: si, holgadamente en practicamente cualquier GPU moderna; incluso en CPU con 4 GB de RAM es viable con cuantizaciones bajas.
- **Opciones de despliegue**: llama.cpp (formato GGUF nativo, incluyendo los archivos mmproj), Ollama, LM Studio y herramientas compatibles con GGUF. El modelo base en safetensors puede usarse con la libreria transformers de Hugging Face.
- **Latencia y throughput**: no disponible; por tamano (~1,7 B parametros), se espera inferencia rapida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea/idioma | Formato | Licencia |
|---|---|---|---|---|
| Thaki-ASR-KO-1.7B (base) | 1,72 B | ASR coreano (telephony) | safetensors | Apache 2.0 |
| Thaki-ASR-KO-1.7B-GGUF (esta ficha) | 1,72 B | ASR coreano (telephony) | GGUF (Q2_K a f16) | Apache 2.0 |
| Whisper small / medium (OpenAI) | 244 M / 769 M | ASR multilingue (incl. coreano) | PyTorch, GGUF (comunidad) | MIT |
| Qwen3-ASR (familia base) | no disponible | ASR multimodal | safetensors | no disponible |

La ventaja diferencial frente a Whisper es la especializacion en coreano y en audio telefonico; frente al modelo base, este repo ofrece la ventaja practica de la ejecucion local ligera via GGUF.

## Limitaciones y advertencias

- Soporte de idioma limitado al coreano; no es util para transcripcion en otros idiomas.
- No hay metricas publicadas de WER/CER, por lo que la calidad real en produccion debe validarse con datos propios antes de desplegar.
- Las cuantizaciones son estaticas (no imatrix); las cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar la precision de transcripcion de forma notable.
- Riesgo de alucinaciones tipico de modelos ASR basados en LLM: generacion de texto no presente en el audio, especialmente con audio muy ruidoso o silencios prolongados.
- Posibles sesgos hacia el estilo de habla de los datasets de entrenamiento (habla de lectura en zeroth-korean y corpus general en Emilia), con rendimiento incierto en acentos regionales, jerga o hablantes poco representados.
- El soporte GGUF de modelos ASR multimodales depende de que la version de llama.cpp utilizada soporte el formato mmproj correspondiente; conviene verificar compatibilidad.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero los datos de entrenamiento pueden contener voz de hablantes cuyos permisos de uso deben revisarse segun los datasets originales.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Thaki-ASR-KO-1.7B-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/Thaki-ASR-KO-1.7B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Thaki-ASR-KO-1.7B-GGUF
- Dataset Bingsu/zeroth-korean: https://huggingface.co/datasets/Bingsu/zeroth-korean
- Dataset amphion/Emilia-Dataset: https://huggingface.co/datasets/amphion/Emilia-Dataset
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
