# maternion/Mage-VL-Cowork-4B-GGUF

## Resumen

Mage-VL-Cowork es un modelo de lenguaje y visión (VLM) de 4.400 millones de parámetros desarrollado por el equipo Mage de Microsoft, especializado en agentes de uso de ordenador (*computer use*). Combina un canal de control de interfaz gráfica (`computer_use`, con 11 primitivas GUI y coordenadas en el rango `[0,999]`) con un canal persistente de shell y Python (`bash`) dentro de una única política visión-lenguaje. Está diseñado para operar entornos de escritorio reales a partir de capturas de pantalla, no solo para responder preguntas sobre imágenes.

La arquitectura es híbrida: una torre de texto basada en Qwen3-4B y una torre de visión Mage-ViT, unidas mediante un conector tipo `llava_onevision2` que requiere `trust_remote_code=True` en transformers. El modelo se entrenó con una ventana de 32K tokens, aunque la arquitectura soporta hasta 262K. En el momento de su publicación, sus 66,0% en OSWorld-Verified lo situaban como el mejor modelo de 4B en esa prueba, con 87,5% en tareas de sistema operativo y 62,7% en flujos multi-aplicación.

Esta ficha describe la conversión a GGUF publicada por el usuario `maternion`, pensada para su uso con llama.cpp (v0.9.0 o superior). Incluye 12 cuantizaciones del texto (de BF16 a IQ1_M) más dos variantes del proyector visual (`mmproj`). La licencia Apache-2.0 se hereda sin cambios del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `llava_onevision2` personalizada (torre de texto Qwen3-4B + torre de visión Mage-ViT) |
| Parametros totales | 4.411.424.256 (torre de texto; la visión va en un `mmproj` separado de 0,66 GB en BF16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | entrenado a 32K; la arquitectura soporta hasta 262K |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ4_NL, Q3_K_M, Q3_K_S, IQ3_M, IQ2_M, IQ1_M (experimental); `mmproj` en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo original es un transformer multimodal con una torre de texto Qwen3-4B y una torre de visión Mage-ViT, conectadas mediante un adaptador que en transformers se carga como arquitectura `llava_onevision2` con `trust_remote_code=True`. En la conversión a GGUF, la torre de texto se exporta como arquitectura `qwen3` estándar y la torre visual se distribuye por separado como `mmproj` en BF16 (independiente de la cuantización del texto). El modelo está entrenado para emitir acciones estructuradas en dos canales: `computer_use`, con 11 primitivas de control GUI y coordenadas normalizadas en `[0,999]`, y `bash`, para ejecución persistente de comandos de shell y Python.

La información disponible no detalla la composición exacta del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO. El informe técnico del modelo original (enlace en la sección de enlaces) es la fuente indicada para esos datos. La conversión GGUF se generó en dos pasos: `convert_hf_to_gguf.py` para producir el BF16 y el `mmproj`, y `llama-quantize` con una importance matrix (imatrix) recogida sobre 800 fragmentos de 512 tokens (aproximadamente 410.000 tokens) de prosa técnica mixta. Los cuantizadores K apenas usan la imatrix; los IQ sí. Se cubren 252 de 252 tensores matmul esperados, con los fallbacks estándar de llama.cpp para `output.weight` (q6_K) y `token_embd.weight` (IQ4_XS).

## Capacidades

- Control de interfaz gráfica: emite acciones GUI mediante el canal `computer_use` con coordenadas en `[0,999]`, a partir de capturas de pantalla.
- Ejecución de shell y Python: canal `bash` persistente dentro de la misma política, lo que permite rutas híbridas (por ejemplo, abrir una terminal desde la GUI y continuar por línea de comandos).
- Razonamiento multi-paso sobre historial de acciones: el harness previsto pliega el historial de acciones y usa una ventana de trabajo de tres capturas.
- Comprensión de imágenes en general (pipeline `image-text-to-text`), más allá del uso de escritorio.
- Conversación multi-turno con plantilla de chat estilo Qwen2 embebida en el GGUF, que incluye el contrato de herramientas `computer_use`/`bash`.
- Soporte de tool calling a través del contrato de herramientas embebido; no se documenta un modo de *thinking* explícito ni capacidades de audio.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio repetitivas: el modelo puede recibir capturas de pantalla y emitir clics, escritura y atajos mediante `computer_use`, lo que encaja en flujos de RPA donde la interfaz no ofrece API.
- Agente híbrido GUI y terminal: al combinar `computer_use` y `bash`, puede abrir una terminal desde el escritorio y continuar la tarea con comandos, útil para instalaciones, scripts de compilación o gestión de ficheros.
- Pruebas de regresión de aplicaciones de escritorio: ejecutado dentro del harness MAGEHybridAgent, sirve para recorrer flujos de usuario y detectar regresiones en la interfaz sin guiones codificados a mano.
- Asistencia en soporte técnico de primer nivel: con una captura del escritorio del usuario, el modelo puede identificar el estado de la aplicación y proponer o ejecutar pasos de resolución en un entorno aislado.
- Despliegue local con presupuesto de VRAM ajustado: la cuantización Q4_K_M (2,72 GB) más el `mmproj` BF16 (0,66 GB) cabe en GPUs de 8 GB, lo que permite prototipar agentes de escritorio en estaciones de trabajo sin GPUs de centro de datos.
- Servicio compatible con la API de OpenAI: `llama-server` expone el modelo con soporte de imagen, lo que facilita integrarlo en orquestadores de agentes existentes que hablan el protocolo de OpenAI.
- Investigación sobre *computer use* en abierto: al ser Apache-2.0 y ejecutable en llama.cpp, permite reproducir y modificar políticas de agente sin depender de APIs propietarias.

## Benchmarks y rendimiento

Resultados publicados para el modelo original en BF16 (los cuantizados pueden degradarse, especialmente en la precisión de coordenadas):

| Benchmark | Mage-VL-Cowork 4B |
|---|---|
| OSWorld-Verified | 66,0% |
| Tareas de sistema operativo (OS tasks) | 87,5% |
| Flujos multi-aplicación | 62,7% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas frente a otros modelos concretos.

## Requisitos de hardware

- VRAM estimada para la torre de texto: 8,83 GB (BF16), 4,69 GB (Q8_0), 3,63 GB (Q6_K), 3,16 GB (Q5_K_M), 2,72 GB (Q4_K_M), 2,48 GB (IQ4_XS), 2,24 GB (Q3_K_M), 1,68 GB (IQ2_M), 1,25 GB (IQ1_M).
- Sumar siempre el `mmproj`: 0,66 GB en BF16 (recomendado) o 0,33 GB en Q8_0, independientemente de la cuantización del texto.
- Configuración recomendada por el autor: Q4_K_M con `mmproj` BF16, que cabe con holgura en cualquier GPU de 8 GB o más.
- GPU de centro de datos (A100, H100): innecesarias para este tamaño; útiles solo para servir muchas sesiones concurrentes.
- GPU de consumo: RTX 4090, RTX 3090, RTX 4070 y tarjetas de 8 GB en adelante con Q4_K_M; para 6 GB o menos, IQ3_M o IQ2_M, asumiendo pérdida de precisión en el *grounding* de coordenadas.
- Despliegue: llama.cpp v0.9.0 o superior, con `llama-server` (API compatible con OpenAI y soporte de imagen) o `llama-server -hf maternion/Mage-VL-Cowork-GGUF:Q4_K_M`, que resuelve automáticamente el `mmproj`.
- Para el comportamiento de agente previsto (enrutado híbrido GUI/bash, historial plegado, ventana de tres capturas) hay que usar el harness MAGEHybridAgent, no una simple llamada de chat.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Mage-VL-Cowork 4B (esta ficha) | 4,4B | 32K entrenado, hasta 262K | Agente de escritorio híbrido GUI + bash | Apache-2.0 | GGUF, transformers |
| Modelos de *computer use* de 4B alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos competidores que permitan una comparación numérica fiable; no se ofrecen cifras inventadas.

## Limitaciones y advertencias

- Riesgo de acciones destructivas: el modelo ejecuta comandos de shell y acciones GUI por diseño; debe correr en un entorno aislado (sandbox), con autorización acotada y sin exposición de credenciales, tal como advierte la model card original.
- Precisión de coordenadas sensible a la cuantización: los errores pequeños de coordenada afectan mucho al *grounding* GUI; las cuantizaciones de clase Q2 e inferiores degradan la precisión de clic. El autor recomienda evaluar los cuantizados IQ con clics por tarea en el propio harness, no por impresión subjetiva.
- IQ1_M es experimental y notablemente degradado; no apto para producción.
- El `mmproj` siempre se carga en BF16 (o Q8_0) y añade VRAM fija; hay que contarlo en el presupuesto.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- Sesgos conocidos y tasa de alucinación: no disponibles en la información proporcionada.
- Requiere llama.cpp v0.9.0 o superior; versiones anteriores no cargan correctamente la arquitectura.
- El comportamiento de agente depende del harness MAGEHybridAgent; usarlo como chat simple no reproduce los resultados de OSWorld.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las consideraciones de uso responsable del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Mage-VL-Cowork-GGUF
- Modelo original: https://huggingface.co/microsoft/Mage-VL-Cowork
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico: https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Harness MAGEHybridAgent: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
