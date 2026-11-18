# netprojects/Qwen3.8-27B-pi-GGUF

## Resumen

Qwen3.8-27B-pi GGUF es una conversión a formato GGUF del modelo Qwen3.8-27B de Qwen Team (Alibaba Cloud) con un adaptador LoRA fusionado, entrenado por harness-hub mediante aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como el modelo subyacente del agente de programación pi. El resultado es un modelo de 27.320.697.856 parámetros (27,3B) orientado a tareas de ingeniería de software y uso de terminal, distribuido por NetProjects en cuantizaciones listas para ejecutar con llama.cpp sin necesidad de cargar el adaptador por separado.

La propuesta de valor es concreta: según los resultados publicados por harness-hub, el adaptador eleva Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con una reducción del 55-64% en el número de llamadas a herramientas por tarea. El paquete incluye la capa de predicción multi-token (MTP) de Qwen, que llama-server puede aprovechar para decodificación especulativa, y un proyector multimodal (`mmproj`) que habilita entrada de imágenes.

La relevancia inmediata está en que ofrece un agente de código local, con licencia Apache-2.0, ejecutable en hardware de consumo y con aceleración de decodificación integrada. El repositorio ocupa 69,2 GB y contiene cuatro archivos: tres cuantizaciones del modelo (Q6_K, Q8_0, Q4_K_M) y el proyector de visión en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención completa y capa MTP; encoder de visión para entrada de imagen (detalle de capas no disponible) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de ejemplo de llama-server (`-c 65536`); máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q6_K (22,4 GB), Q8_0 (29,0 GB); también builds MLX de 6 bits en otro repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); MLX en repositorio separado |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27,3B parámetros. La model card de esta conversión aporta un dato estructural relevante: el adaptador modifica 256 módulos, concretamente las proyecciones q, k, v y o de las 16 capas de atención completa, y las proyecciones gate, up y down de las 64 capas del modelo. El resto de tensores, incluida la capa MTP y el encoder de visión, es idéntico byte a byte a Qwen3.8-27B. La fusión se realizó como `W + 2.0 · B @ A` redondeada a bf16 y se verificó elemento por elemento.

El adaptador de harness-hub se entrenó con aprendizaje por refuerzo usando AsyncGRPO en TRL, sobre tareas de ingeniería de software y terminal, con el objetivo de servir al agente pi. La evaluación se hizo con el modo thinking desactivado, y esa es la configuración recomendada en producción. La innovación técnica destacable es la capa MTP conservada en todos los archivos GGUF, que permite decodificación especulativa con `--spec-type draft-mtp` en llama-server. La conversión se hizo con `convert_hf_to_gguf.py` (commit 8642541b2) y la cuantización con `llama-quantize` (commit b1b770d90).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia embebida sin modificar.
- Razonamiento y resolución de tareas de ingeniería de software: localización de bugs, parcheo de código y ejecución de pruebas.
- Uso de terminal y herramientas: la model card verifica la emisión de llamadas `bash` bien formadas en prompts de estilo agente.
- Tool calling / function calling compatible con la API Chat Completions de OpenAI (`"api": "openai-completions"`), que es el formato con el que se entrenó y evaluó el adaptador.
- Comportamiento agéntico multi-paso con reducción del 55-64% en llamadas a herramientas por tarea frente al base.
- Entrada de imagen (image-text-to-text) mediante el proyector `mmproj-Qwen3.8-27B-pi-F16.gguf`; verificado con una imagen de prueba (cuadrado rojo, círculo azul).
- Decodificación especulativa nativa vía capa MTP, con ratios de aceptación de borradores del 72-76%.
- Modo thinking disponible en la plantilla, aunque el adaptador se entrenó y evaluó con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de reparación de bugs en local: ejecutar `pi --provider local --model qwen3.8-pi` apuntando a un llama-server con Q6_K para que el modelo lea el repositorio, ejecute los tests que fallan y proponga el parche. Es el escenario para el que fue entrenado y el que reporta las mayores ganancias en SWE-bench Pro.
- Automatización de tareas de terminal: el modelo emite llamadas `bash` bien formadas, lo que permite encadenar operaciones de shell (búsqueda en logs, inspección de ficheros, ejecución de scripts) dentro de un bucle agéntico con pocas llamadas por tarea.
- Asistente de CI/CD con contexto largo: con 65.536 tokens de ventana se pueden inyectar trazas de build, diffs y salida de tests en una sola petición para diagnosticar fallos de integración.
- Revisión de código asistida por imagen: usando el proyector mmproj se pueden adjuntar capturas de pantalla de errores de UI o diagramas junto al código para que el modelo correlacione ambos.
- Despliegue en estación de trabajo de desarrollador sin GPU dedicada: Q4_K_M ocupa 16,8 GB y Q6_K 22,4 GB, lo que permite ejecución local en Apple Silicon o en GPUs de consumo con suficiente VRAM, manteniendo el flujo de trabajo en la máquina del ingeniero.
- Servidor de inferencia compatible con OpenAI para equipos pequeños: `llama-server` expone `/v1` con alias de modelo, de modo que herramientas que ya hablan Chat Completions (editores, plugins, scripts internos) pueden apuntar al endpoint local sin cambios de código.
- Prototipado de agentes de código antes de escalar a API: permite medir latencia, tasa de acierto en tool calling y coste por tarea en local antes de comprometer presupuesto en inferencia remota.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, con thinking desactivado y bajo el agente pi:

| Benchmark | Modelo base | Qwen3.8-27B-pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | 55-64% menos |

Fidelidad de cuantización respecto a los pesos BF16 (divergencia KL sobre 12 prompts cortos con formato de chat):

| Archivo | Tamano | Mismo siguiente token que BF16 | KL divergencia media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,4% | 0,0038 |
| Q8_0 | 29,0 GB | 99,2% | 0,0003 |
| Q4_K_M | 16,8 GB | 94,2% | 0,0595 |

Velocidad de decodificación medida en un MacBook Pro M5 Max (128 GB) con llama-server, greedy, thinking off, 5 prompts × 256 tokens (GSM8K, MATH-500, HumanEval, MBPP, MT-Bench), con otros servicios en ejecución:

| Archivo | Decodificación normal | `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 28 tok/s | 52 tok/s (×1,86) | 76% |
| Q6_K | 22 tok/s | 45 tok/s (×2,01) | 72% |
| Q8_0 | 18 tok/s | 44 tok/s (×2,41) | 75% |

No se han publicado resultados de MMLU, HumanEval o GSM8K para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 17 GB, Q6_K unos 23 GB y Q8_0 unos 29 GB, más overhead de contexto KV; el proyector de visión añade 0,9 GB.
- GPU recomendadas: A100 40/80 GB y H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q6_K con contexto moderado o Q4_K_M con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q6_K o Q4_K_M; en GPUs de 16 GB solo Q4_K_M con contexto reducido. Verificado en Apple Silicon con 128 GB de memoria unificada.
- Opciones de despliegue: llama.cpp / llama-server (referencia de la model card), Ollama y cualquier runtime compatible con GGUF; builds MLX para Apple Silicon en `netprojects/Qwen3.8-27B-pi-MLX-6bit`. vLLM y TGI no están documentados para este paquete GGUF.
- Latencia y throughput: 22 tok/s en Q6_K sin MTP y 45 tok/s con MTP en M5 Max; entre 1,86× y 2,41× de aceleración según cuantización. No hay mediciones publicadas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi (este) | 27,3B | 65.536 configurado | Agente de código + visión, MTP | Apache-2.0 | GGUF, MLX |
| Qwen3.8-27B (base) | 27,3B | no disponible | Modelo generalista multimodal | Apache-2.0 | safetensors |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3B | no disponible | Adaptador LoRA sin fusionar | Apache-2.0 | safetensors (LoRA) |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de código de tamaño similar) no está disponible en la información proporcionada, ya que no se aportan datos de benchmarks cruzados.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; activar el modo thinking puede degradar el comportamiento respecto a los resultados publicados. La configuración recomendada pasa `{"enable_thinking": false}`.
- Está ajustado específicamente para el agente pi y la API Chat Completions; otros formatos de tool calling o plantillas de agente pueden no reproducir los resultados de Terminal-Bench y SWE-bench.
- Q4_K_M presenta una divergencia KL de 0,0595 y solo un 94,2% de coincidencia en el siguiente token frente a BF16: aceptable para uso general, pero arriesgado en tareas de código donde un token cambia la semántica.
- Las mediciones de velocidad proceden de una sola máquina (M5 Max) con otros servicios en ejecución; el propio autor las califica de indicativas.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni datos de alucinación; el adaptador se entrenó con RL sobre tareas de software, lo que puede estrechar su comportamiento fuera de ese dominio.
- Idiomas soportados no documentados en esta ficha; el rendimiento fuera del inglés no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribución a Qwen Team (Alibaba Cloud) y a harness-hub descrito en el fichero NOTICE.
- NetProjects declara no estar afiliado a Hugging Face, harness-hub ni Alibaba; el soporte del paquete depende del publicador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Builds MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Otros builds de NetProjects: https://huggingface.co/netprojects
- Sitio del publicador: https://netprojects.com
- Archivos GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF/blob/main/Qwen3.8-27B-pi-Q6_K.gguf · https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF/blob/main/Qwen3.8-27B-pi-Q8_0.gguf · https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF/blob/main/Qwen3.8-27B-pi-Q4_K_M.gguf · https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF/blob/main/mmproj-Qwen3.8-27B-pi-F16.gguf
