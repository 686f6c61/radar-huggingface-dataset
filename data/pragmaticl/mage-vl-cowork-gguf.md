# Pragmaticl/Mage-VL-Cowork-GGUF

## Resumen

Mage-VL-Cowork-GGUF es una conversión a formato GGUF del modelo multimodal microsoft/Mage-VL-Cowork, desarrollada por el usuario Pragmaticl (el repositorio enlazado en la model card corresponde a Hansda). El modelo original, obra de Microsoft, es un vision-language model de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) orientado a tareas de computer use: interpretar capturas de pantalla y proponer acciones sobre interfaces gráficas y terminales. Esta conversión permite ejecutar el modelo en llama.cpp con cuantizaciones que van de Q2_K (1,80 GB) a Q8_0 (4,69 GB), más un codificador visual compartido en Q8_0 o F16.

La relevancia de esta ficha es doble. Por un lado, acerca un modelo de agentes GUI a hardware de consumo gracias a las cuantizaciones de 2 a 5 GB. Por otro, arrastra una advertencia técnica importante: la arquitectura vision-language es `llava_onevision2` con el codificador Mage-ViT, no la de Qwen3-VL, y requiere un fork experimental de llama.cpp (rama `locateanything-magevl-grounding`, commit `e07bdc8c8ef311561ab806e48792afb5d30b8054`). El soporte upstream (PR #26796 de ggml-org/llama.cpp) sigue sin fusionar, y ni llama.cpp estándar ni Ollama ni LM Studio han sido validados con este proyector.

El backbone de texto es Qwen3-4B-Instruct-2507 (36 capas, 32 cabezas de consulta, 8 cabezas KV). La ventana de contexto activa validada es de 32.768 tokens, aunque la configuración declara 262.144 posiciones sin validar. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con backbone Qwen3-4B-Instruct-2507 y codificador visual Mage-ViT (`llava_onevision2`) |
| Parametros totales | 4.411.424.256 (aprox. 4,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens validados; la configuración declara 262.144 sin validar |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q6_K, Q8_0 (decoder); vision encoder/proyector en Q8_0 y F16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en Safetensors |

## Arquitectura y entrenamiento

El modelo combina un decoder de texto Qwen3-4B-Instruct-2507 con 36 capas, 32 cabezas de consulta y 8 cabezas KV, y un codificador visual Mage-ViT original con parche de tamaño 16, fusión espacial de tamaño 2 y normalización y codificación posicional propias. La integración sigue el esquema `llava_onevision2`, con un merger/proyector que transforma las características visuales al espacio del decoder. Cada archivo `mmproj` contiene el codificador visual completo y el proyector; debe cargarse exactamente uno junto a exactamente un decoder GGUF.

El modelo original fue entrenado con aprendizaje por refuerzo para tareas de agente (etiquetas `reinforcement-learning`, `cua`, `hybrid-agent`, `gui-agent`, `coding-agent`, `terminal-agent`) y con un contrato de computer use que contempla las herramientas `computer_use` y `bash`, con razonamiento, resúmenes `Action:` y salida en formato `<tool_call>`. La model card de esta conversión no detalla el número de tokens de entrenamiento ni la composición del dataset; esos datos no están disponibles en la información proporcionada. La conversión en sí no reentrena pesos: solo cuantiza. El archivo F16 del codificador visual se exporta directamente desde los pesos visuales originales de Microsoft, no por upcast desde Q8_0, y contiene 99 tensores F16 y 199 tensores F32.

## Capacidades

- Comprensión de imágenes y capturas de pantalla (pipeline `image-text-to-text`).
- Generación de acciones de computer use sobre interfaces gráficas mediante la herramienta `computer_use`.
- Ejecución y razonamiento sobre comandos de terminal mediante la herramienta `bash`.
- Razonamiento multi-paso con resúmenes explícitos `Action:` y salida estructurada `<tool_call>`.
- Soporte de tool calling / function calling según el contrato entrenado del modelo original.
- Capacidades de agente GUI y de agente de código y terminal (etiquetas del modelo base).
- Conversación multi-turno con ventana de 32.768 tokens validados.
- Plantilla de chat multimodal original preservada (`mage_original`), con alternativa opcional `qwen_instruct`.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Automatización de escritorio en pruebas de regresión: el modelo recibe una captura de pantalla y devuelve una propuesta de acción (`Action:`) que un harness ejecuta; encaja en suites tipo OSWorld por su contrato de computer use y su ventana de 32.768 tokens para mantener el historial de la sesión.
- Agente de terminal asistido: con la herramienta `bash`, el modelo puede proponer comandos a partir de la salida de terminal y del contexto previo, útil para tareas de administración de sistemas semiautomáticas con supervisión humana.
- Asistente de soporte para aplicaciones de escritorio: dado que interpreta capturas de pantalla, puede guiar a un usuario paso a paso señalando qué elemento pulsar, con la ventaja de ejecutarse en local en GPUs de consumo gracias a las cuantizaciones Q4_K_M (2,72 GB) o Q6_K (3,63 GB).
- Prototipado de agentes GUI en estaciones de trabajo sin GPU de datacenter: la variante Q2_K (1,80 GB) o Q3_K_M (2,24 GB) permite iterar sobre el bucle percepción-acción en hardware modesto, aceptando la pérdida de fiabilidad en tool calling que advierte el autor.
- Investigación en evaluación de agentes: el repositorio incluye manifiesto de hashes y tamaños (`model-manifest.json`), lo que facilita reproducir experimentos de carga e inferencia con una revisión fijada del modelo base (`6fbe7f91da477c1c73790dbb1f08d001b8626be1`).
- Integración en pipelines de código con agente híbrido: al conservar la plantilla original y el system prompt de capturas/acciones (`MAGE_HYBRID_SYSTEM_PROMPT.txt`), puede conectarse a un orquestador que alterne llamadas `computer_use` y `bash` dentro de un flujo de CI con entorno gráfico virtualizado.
- Despliegue con servidor local: el fork compila el objetivo `llama-server`, lo que permite exponer el modelo por HTTP para pruebas de integración con clientes externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las puntuaciones de OSWorld y otras métricas de la model card original describen el checkpoint original de Microsoft y no se han vuelto a ejecutar para estas cuantizaciones. Las comprobaciones realizadas por el autor son numéricas y de carga (comparación del F16 visual contra la implementación FP32 original en entradas cuadradas, apaisadas y verticales, e inferencia de una sola imagen con el decoder Q4_K_M), no de precisión en tareas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,2 GB para Q2_K con visión Q8_0, 3,1 GB para Q3_K_M, 3,6 GB para Q4_K_M, 4,5 GB para Q6_K y 5,6 GB para Q8_0, sumando en cada caso el archivo `mmproj` Q8_0 (0,35 GB) o F16 (0,66 GB), más el espacio de contexto KV.
- Cabe en GPUs de consumo: sí, en tarjetas con 6-8 GB de VRAM o más para las cuantizaciones Q4_K_M y superiores; Q2_K y Q3_K_M pueden caber en 4-6 GB.
- GPUs recomendadas: no disponible en la información proporcionada; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Opciones de despliegue: exclusivamente el fork experimental de llama.cpp (`ch686/llama.cpp-locateanything-magevl`), con los binarios `llama-mtmd-cli` y `llama-server`. Se puede compilar con `-DGGML_CUDA=ON` para aceleración NVIDIA. llama.cpp estándar, Ollama y LM Studio no están validados para este proyector.
- Latencia y throughput: no disponible. La model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Mage-VL-Cowork-GGUF (esta ficha) | 4,4 B | 32.768 validados | Apache 2.0 | Sí, con fork experimental | Especializado en computer use; requiere runtime no estándar |
| microsoft/Mage-VL-Cowork | 4,4 B | 32.768 validados | Apache 2.0 | No (Safetensors) | Modelo base original; benchmarks publicados en su model card |
| Hansda/Mage-VL-Cowork-GGUF | 4 B (según la página de HF) | No disponible | Apache 2.0 | Sí | Conversión GGUF alternativa del mismo modelo base |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- Requiere un fork experimental de llama.cpp con un commit fijado; el PR de soporte upstream (#26796) no está fusionado. Esto implica riesgo de rotura y ausencia de soporte en herramientas estándar.
- Ollama y LM Studio no están validados con el proyector visual de este modelo.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- La ventana de 262.144 posiciones que anuncia la configuración no ha sido validada; usar 32.768 tokens como límite práctico.
- Las cuantizaciones Q2_K y Q3_K_M sacrifican calidad y fiabilidad de tool calling según advierte el propio autor.
- El modelo emite propuestas de acción, no las ejecuta: se necesita un harness externo que ejecute las herramientas y devuelva capturas o salida de terminal, respetando las definiciones de herramientas, la convención de coordenadas y las reglas de memoria de trabajo del modelo original.
- Riesgo de alucinación y de acciones incorrectas en entornos reales: no hay resultados de precisión publicados para estas cuantizaciones, por lo que no debe asumirse el rendimiento del checkpoint original.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial; sin embargo, la licencia enlazada en la model card apunta a un repositorio de terceros (Hansda), por lo que conviene verificar el texto exacto antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Pragmaticl/Mage-VL-Cowork-GGUF
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Conversión GGUF alternativa citada en la model card: https://huggingface.co/Hansda/Mage-VL-Cowork-GGUF
- Licencia enlazada: https://huggingface.co/Hansda/Mage-VL-Cowork-GGUF/blob/main/LICENSE
- Fork de llama.cpp requerido: https://github.com/ch686/llama.cpp-locateanything-magevl
- PR de soporte upstream: https://github.com/ggml-org/llama.cpp/pull/26796
