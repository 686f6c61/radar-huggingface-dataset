# JRamirez-UAB/Nemotron-3.5-Super-VL-120B-A12B-EXL3-2.25bpw-VL-96GB

## Resumen

Este repositorio contiene una cuantización comunitaria, no oficial, del modelo multimodal `nvidia/Nemotron-3.5-Super-VL-120B-A12B` de NVIDIA: un MoE de 120.000 millones de parámetros totales con 12.000 millones activos por token, atención híbrida Mamba y torre de visión. La aportación del autor (JRamirez-UAB) es comprimir el backbone de texto a EXL3 con ~2,25 bits por peso manteniendo la torre de visión en BF16, de forma que el modelo completo imagen-texto quepa en una única GPU de 96 GB y pueda servirse con vLLM con batching continuo.

El interés práctico es doble. Por un lado, permite ejecutar un modelo de escala 120B con contexto nativo de 1M tokens en hardware de una sola tarjeta (RTX PRO 6000 Blackwell, 96 GB). Por otro, la arquitectura híbrida Mamba reduce drásticamente el coste de caché KV: solo 11 de las 88 capas mantienen caché, lo que según el autor se traduce en una "bolsa KV" de aproximadamente 10,7 millones de tokens con caché en fp8.

El checkpoint está orientado por el propio autor a tareas de agente de sistemas Linux y programación (conducción de opencode con ejecución real de herramientas), con pruebas redactadas en castellano y centradas en administración de sistemas. Es un artefacto de comunidad: no es un lanzamiento oficial de NVIDIA y solo se ha validado en una configuración de software muy concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE + Mamba con torre de visión; clase `NemotronH_Omni_Reasoning_V3`, config `nemotron_h_omni` (`llm_config` + `vision_config`) |
| Parametros totales | 120B nominales en el modelo base; los safetensors del repo declaran 19.368.814.088 pesos empaquetados por la cuantización EXL3 |
| Parametros activos | 12B por token |
| Longitud de contexto | 1.048.576 tokens (1M) nativo; bolsa KV de ~10,7M tokens en la prueba del autor |
| Tipos de cuantizacion | Texto: EXL3 a ~2,25 bits por peso; visión: BF16; caché KV: fp8 |
| Idiomas soportados | no disponible (el autor documenta pruebas y trazas en castellano) |
| Licencia | OpenMDW License Agreement v1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (backbone EXL3 empaquetado + `vision-vl.safetensors` en BF16); no se distribuye GGUF |
| Capas | 88 en total, de las cuales solo 11 mantienen caché KV |
| Tamano del repositorio | 38,8 GB (36,2 GiB); ~35 GB de backbone de texto + ~1,68 GB de torre de visión |
| Vision tower | RADIO ViT + proyector `mlp1` + `vision_final_layernorm`, en BF16 |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido: combina capas de atención con capas Mamba (state space model) en una pila de 88 capas, activando 12B de los 120B parámetros por token. Esa hibridación es la que permite que solo 11 capas necesiten caché KV, de modo que el coste de memoria por token de contexto es una fracción del de un transformer denso equivalente. La parte multimodal añade una torre RADIO ViT con proyector `mlp1` y una normalización final, que en este checkpoint se conserva íntegramente en BF16 para no degradar la percepción visual.

Sobre el entrenamiento del modelo original no se aporta información en la documentación disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. La innovación técnica documentada en este repositorio es la cuantización: asignación de bits por tensor EXL3 (`quantization_config.json`) sobre el backbone de texto, con la visión intacta en BF16, más un plugin de kernel (OrcaSAQ2) y una clase de modelo vLLM propia (`plugin/nemotron_h_omni_vl.py`) que adapta la arquitectura Omni de NVIDIA al cargador multimodal de vLLM. El resultado es un checkpoint de ~2,25 bpw que preserva el contexto de 1M tokens del modelo original.

## Capacidades

- Generación de texto y razonamiento extenso: el autor mide entre ~400 y ~950 tokens de razonamiento por respuesta visual.
- Comprensión de imágenes (image-text-to-text): OCR de capturas de terminal, lectura de gráficos de rendimiento y de tablas de reglas de cortafuegos.
- Razonamiento sobre múltiples imágenes: prueba de referencia cruzada entre dos capturas (estado de servicio + listado de procesos) para identificar un PID.
- Tool calling / function calling: 20/20 en la petición real de opencode según el autor.
- Uso como agente multi-paso con ejecución real de herramientas (opencode) en tareas de administración de sistemas.
- Contexto largo nativo de 1M tokens, con recuperación multi-aguja parcial (5/8 a 966.492 tokens).
- Capacidad de visión con coste controlado: ~700-1020 tokens por imagen de ~1280x640-800 píxeles y ~1748 tokens para dos imágenes.
- Multilingüe: no hay listado oficial de idiomas; las pruebas del autor están en castellano.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Agente de administración de sistemas Linux: leer la salida de `systemctl`, `ss -tlnp` o `top` en capturas de pantalla y proponer el comando correcto (por ejemplo, matar el PID que realmente retiene el puerto en lugar de uno muerto), gracias a la combinación de visión y razonamiento multi-paso.
- Automatización de guardias e incidentes: ingerir capturas de paneles de monitorización o de gráficos de rendimiento y responder preguntas sobre latencia, throughput o caché sin necesidad de exportar métricas a texto.
- Auditoría de configuraciones de red: OCR sobre reglas de cortafuegos para extraer puertos, subredes de origen y política por defecto, útil en revisiones de cumplimiento sobre capturas o PDF renderizados.
- Copiloto de codificación con herramientas: integración en un agente tipo opencode que ejecuta comandos y edita ficheros, apoyándose en el tool calling validado y en la ausencia de bucles de repetición reportada (0/30).
- Análisis de repositorios y documentos largos: con 1M tokens de contexto se pueden cargar árboles de código, logs extensos o documentación completa y hacer preguntas transversales sin troceado.
- Asistencia técnica multi-turno con historial largo: mantener conversaciones prolongadas con soporte o con un usuario final aprovechando la bolsa KV de ~10,7M tokens y el bajo coste por token de las capas Mamba.
- Procesamiento de documentación escaneada o capturas en flujos internos: extracción de datos estructurados (puertos, PIDs, políticas) a partir de imágenes, con el modelo razonando antes de responder.
- Despliegue en una sola GPU para entornos con requisitos de privacidad: al caber en 96 GB, permite mantener datos y capturas en infraestructura propia sin depender de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. Las únicas mediciones son las del autor de la cuantización, sobre una RTX PRO 6000 Blackwell de 96 GB con vLLM 0.31.0, caché KV en fp8 y decodificación greedy.

Batería de visión (5 tareas con capturas sintéticas y respuesta de referencia conocida):

| Tarea | Referencia | Resultado del checkpoint | Estado |
|---|---|---|---|
| OCR de `systemctl` fallido | servicio `nginx-proxy`, puerto 8443, "Address already in use", `ss -tlnp` | todo correcto; sugiere `ss -tulpn` / `lsof` | correcto |
| Gráfico de MTP / prefix-cache | MTP 3 = 95,5 tok/s (+91 %); turno 3: 112,8 s sin caché / 5,7 s con caché | 95,5 tok/s; 112,8 s / 5,6 s | correcto |
| OCR de reglas de cortafuegos | puerto 9443, subred de origen de la regla, política por defecto `drop` | 9443, subred y `drop` | correcto |
| Razonamiento sobre lista de procesos (trampa) | el puerto lo retiene el PID 51877 (uvicorn), no el 48213 muerto | `kill 51877` y luego `systemctl start` | correcto |
| Dos imágenes, referencia cruzada | combinar `systemctl` + `top` para obtener el PID 51877 | identifica "python3 (51877) uvicorn" y propone `kill 51877` | correcto |

Texto y contexto largo:

| Prueba | Resultado |
|---|---|
| Tool calling con petición real de opencode | 20/20 |
| Bucles de repetición (5 prompts largos en castellano x temperaturas) | 0/30 |
| Multi-aguja a 966.492 tokens | 5/8 |
| Prefill a 966.492 tokens | ~1757 tok/s |
| VRAM ocupada (KV fp8, bolsa de 16 GB) | ~82 GB de 96 |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 36,2 GiB, pero la configuración validada consume ~82 GB de 96 con caché KV en fp8 y contexto de 966k tokens. Presupuestar una GPU de 96 GB como mínimo para uso real a contexto largo.
- GPU recomendadas: RTX PRO 6000 Blackwell Server Edition de 96 GB es la única tarjeta probada por el autor. Otras GPU con 96 GB o más (H100 96 GB, H200 141 GB) son plausibles por capacidad, pero no están validadas en la documentación.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB. El propio diseño del checkpoint asume una única GPU de 96 GB.
- Despliegue: vLLM 0.31.0 con torch 2.13.0, exllamav3, el plugin de kernel OrcaSAQ2, el plugin `qwen38_exl3_vision` y la clase de modelo de `plugin/nemotron_h_omni_vl.py`. Para carga con `transformers` se requiere `trust_remote_code=True` y el código remoto de NVIDIA incluido en el repo (`configuration_*.py`, `modeling_*.py`, `processing_*.py`, `image_processing_*.py`).
- Alternativas de serving: no se documentan rutas para llama.cpp, Ollama ni TGI, y no se distribuyen pesos GGUF.
- Throughput: prefill medido de ~1757 tok/s a 966.492 tokens. En la prueba de gráfico se reportan 95,5 tok/s con MTP 3 (+91 %), dato tomado del propio gráfico evaluado, no de un benchmark independiente.
- Latencia: no disponible de forma sistemática; el autor advierte que las respuestas visuales generan 400-950 tokens de razonamiento, por lo que conviene fijar un `max_tokens` generoso.

## Comparativa con modelos similares

No se dispone de datos de otros checkpoints comunitarios comparables en la información proporcionada. La comparación posible es contra el modelo base del que deriva:

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / tamano | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este checkpoint (EXL3 2,25 bpw + VL BF16) | 120B totales / 12B activos | 1M tokens | Si (BF16) | OpenMDW 1.1 | safetensors EXL3, 38,8 GB | 1 GPU de 96 GB |
| nvidia/Nemotron-3.5-Super-VL-120B-A12B (base, BF16) | 120B totales / 12B activos | 1M tokens | Si | OpenMDW 1.1 | safetensors BF16 (tamano exacto no disponible) | Multi-GPU (no disponible el numero) |
| Otras alternativas de escala y categoria similares | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una cuantización no oficial: no procede de NVIDIA y no cuenta con su validación. Los resultados de calidad deben verificarse en el dominio propio antes de producción.
- Configuración de software frágil: solo se ha probado con vLLM 0.31.0, torch 2.13.0, exllamav3, el plugin OrcaSAQ2, el plugin `qwen38_exl3_vision` y una clase de modelo propia. Cualquier cambio de versión puede romper la carga.
- Cuantización agresiva a ~2,25 bits por peso en el backbone de texto: es esperable cierta degradación en tareas sensibles a precisión numérica, aunque no se documenta una evaluación sistemática de la pérdida.
- Recuperación en contexto largo incompleta: 5/8 en multi-aguja a 966.492 tokens, es decir, falla 3 de 8 agujas en el extremo del contexto.
- Evaluación limitada y sintética: la batería visual son capturas fabricadas para administración de sistemas; no hay MMMU, MMLU, HumanEval ni GSM8K publicados.
- Verbosidad: 400-950 tokens de razonamiento por respuesta visual incrementan latencia y coste; sin `max_tokens` adecuado se pueden truncar respuestas.
- Riesgo de alucinación: no se documenta ninguna mitigación específica; en tareas de OCR o de lectura de configuraciones conviene validar las extracciones contra la fuente.
- Idiomas: no hay lista oficial de idiomas soportados; las pruebas del autor están en castellano y sesgadas a administración de sistemas, no a conversación general.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia: OpenMDW 1.1 es permisiva y permite modificación y redistribución, pero el repositorio redistribuye pesos derivados de NVIDIA y conserva `LICENSE` y `NOTICE`. Es obligatorio mantener la atribución de origen y revisar los términos antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 valoraciones en el momento de la consulta; sin comunidad que haya replicado los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JRamirez-UAB/Nemotron-3.5-Super-VL-120B-A12B-EXL3-2.25bpw-VL-96GB
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Super-VL-120B-A12B
- Licencia del repositorio (OpenMDW 1.1): https://huggingface.co/JRamirez-UAB/Nemotron-3.5-Super-VL-120B-A12B-EXL3-2.25bpw-VL-96GB/blob/main/LICENSE
- Aviso de atribucion de NVIDIA: https://huggingface.co/JRamirez-UAB/Nemotron-3.5-Super-VL-120B-A12B-EXL3-2.25bpw-VL-96GB/blob/main/NOTICE
- Plugin de modelo vLLM del autor: https://huggingface.co/JRamirez-UAB/Nemotron-3.5-Super-VL-120B-A12B-EXL3-2.25bpw-VL-96GB/tree/main/plugin
- opencode (agente usado en las pruebas): https://opencode.ai
- Referencia arXiv incluida en los tags (RADIO, torre de vision): https://arxiv.org/abs/2406.11235
