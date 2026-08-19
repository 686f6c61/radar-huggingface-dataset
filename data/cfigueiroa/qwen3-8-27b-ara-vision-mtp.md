# cfigueiroa/Qwen3.8-27B-ARA-vision-MTP

## Resumen

Qwen3.8-27B-ARA-vision-MTP es una variante del modelo multimodal denso Qwen3.8-27B de Alibaba, modificada por el autor cfigueiroa con la técnica ARA (abliteration) aplicada en una sola pasada, junto con soporte de visión mediante el proyector oficial de ggml-org y predicción multi-token (MTP/NextN). El resultado es un archivo GGUF cuantizado en Q4_K_M para el texto y Q8_0 para el proyector de visión, listo para ejecutarse con llama.cpp o llama-server. Esta variante se posiciona como una alternativa menos ablitterada que la versión RVN (tres pasadas), pensada para comparaciones A/B entre distintos grados de modificación del modelo base.

El modelo base Qwen3.8-27B es un modelo de visión-lenguaje de 27.000 millones de parámetros, con ventana de contexto nativa de 262.000 tokens, licencia Apache-2.0 y capacidades destacadas en codificación, flujos agénticos y automatización de oficina. La variante ARA conserva estas capacidades generales, pero con una capa adicional de ablitteración que reduce ciertos comportamientos de rechazo, manteniendo un equilibrio entre utilidad y seguridad. El archivo GGUF resultante pesa aproximadamente 16,8 GB, lo que permite su ejecución en GPUs de consumo con 24 GB de VRAM.

La relevancia de este modelo radica en su combinación de visión, contexto largo, MTP y ablitteración en un formato desplegable, lo que lo hace útil para experimentos de alineación, pruebas de robustez y aplicaciones de agentes multimodales en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (visión + lenguaje), basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base); 460.730.096 (proyector de visión en safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | Q4_K_M (texto), Q8_0 (proyector de visión) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto y proyector) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso multimodal con arquitectura de visión-lenguaje, entrenado por Alibaba para tareas de codificación, razonamiento y agencia. Sobre este base, el autor aplica la técnica ARA (abliteration) en una sola pasada, que consiste en eliminar selectivamente ciertas direcciones o componentes de la red que correlacionan con comportamientos de rechazo o negativa. A diferencia de la variante RVN (que aplica tres pasadas), esta versión conserva más del comportamiento original del modelo, lo que la hace adecuada para comparaciones controladas.

Además, el modelo incorpora el mecanismo NextN (MTP, multi-token prediction) con configuración 15/15, que permite predecir múltiples tokens futuros simultáneamente, mejorando la velocidad de decodificación y la coherencia en generaciones largas. El proyector de visión es el oficial de ggml-org, cuantizado en Q8_0, que permite procesar imágenes y vídeo de forma nativa. No se han publicado detalles específicos sobre el dataset de entrenamiento de esta variante, ni sobre el proceso exacto de ablitteración más allá de lo indicado en la model card.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de texto e imágenes (y vídeo) para generar respuestas contextuales.
- Codificación y desarrollo de software: hereda las capacidades del modelo base en generación de código, depuración y refactorización.
- Razonamiento configurable: soporta modos de razonamiento explícito o implícito (configuración `--reasoning off` en llama-server).
- Multi-token prediction (NextN): decodificación más rápida y coherente gracias a la predicción de 15 tokens adicionales.
- Tool calling y flujos agénticos: compatible con el uso de herramientas y llamadas a funciones, aunque no se detalla en la documentación específica.
- Contexto largo: ventana de 262K tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Visión nativa: procesamiento de imágenes y vídeo mediante el proyector Q8_0.

## Casos de uso

- Asistentes multimodales locales: el modelo puede responder preguntas sobre imágenes o vídeos en tiempo real, ejecutándose en una GPU de consumo con llama-server y un proyector de visión.
- Automatización de oficina: gracias a las capacidades del modelo base, puede resumir documentos, extraer datos de capturas de pantalla o generar informes a partir de imágenes.
- Agentes de razonamiento multi-paso: con soporte de tool calling y contexto largo, puede planificar y ejecutar tareas complejas en entornos simulados o reales (por ejemplo, navegación web o uso de APIs).
- Comparación de técnicas de ablitteración: la existencia de variantes ARA y RVN permite evaluar el impacto de diferentes grados de modificación en la seguridad y utilidad del modelo.
- Generación de código asistida por imágenes: el desarrollador puede mostrar un diagrama o boceto y el modelo genera el código correspondiente.
- Análisis de documentos técnicos con figuras: procesa manuales, papers o diagramas y responde preguntas específicas sobre su contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante ARA en la información disponible. El modelo base Qwen3.8-27B reporta los siguientes resultados en la web (según fuentes externas):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos corresponden al modelo original y no a la variante ARA, por lo que deben tomarse como referencia orientativa. No se dispone de comparaciones directas con otras variantes ablitteradas.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M de texto ocupa ~16,8 GB, más el proyector Q8_0 (~1 GB adicional). Se recomienda al menos 20 GB de VRAM libre para inferencia cómoda.
- GPU recomendadas: RTX 3090, RTX 4090, A6000 o superiores con 24 GB de VRAM. En GPUs con 16 GB (como RTX 4080) podría funcionar con offloading parcial a CPU.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se convierte el GGUF), vLLM (con adaptaciones), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones específicas. La presencia de NextN 15/15 debería reducir la latencia de decodificación respecto a modelos sin MTP, aunque el impacto exacto depende del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Sí | Apache-2.0 | Safetensors, GGUF |
| Qwen3.8-27B-ARA-vision-MTP (este) | 27B | 262K | Sí | Apache-2.0 | GGUF |
| Qwen3.8-27B-RVN-vision-MTP (hermano) | 27B | 262K | Sí | Apache-2.0 | GGUF |

La diferencia principal entre las variantes ARA y RVN es el número de pasadas de ablitteración (1 vs 3), lo que afecta al equilibrio entre utilidad y rechazo. No se dispone de benchmarks comparativos entre ambas.

## Limitaciones y advertencias

- La ablitteración puede reducir la capacidad del modelo para rechazar solicitudes dañinas o inapropiadas, lo que supone un riesgo en aplicaciones de producción sin moderación adicional.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta variante específica. Se recomienda validar el comportamiento en el dominio de uso.
- El modelo está cuantizado en Q4_K_M, lo que puede degradar ligeramente la calidad de generación respecto a la versión completa en FP16.
- La licencia Apache-2.0 permite uso comercial, pero el autor indica que no está afiliado a Qwen, trohrbaugh o cygnal, por lo que el soporte es limitado.
- No se garantiza la compatibilidad con todos los runtimes; el comando proporcionado usa llama-server con `--jinja` y `--reasoning off`.
- El dato de parámetros de safetensors (460M) corresponde únicamente al proyector de visión, no al modelo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cfigueiroa/Qwen3.8-27B-ARA-vision-MTP
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Variante heretic-org ARA: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- GGUF base con MTP: https://huggingface.co/cygnal/Qwen3.8-27B-heretic-ara-Q4_K_M-MTP-GGUF
- Proyector de visión oficial: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Guía de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8
- Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
