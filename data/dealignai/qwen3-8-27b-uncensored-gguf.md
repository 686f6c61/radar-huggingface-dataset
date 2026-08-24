# dealignai/Qwen3.8-27B-UNCENSORED-GGUF

## Resumen

Qwen3.8-27B-UNCENSORED-GGUF es una versión "abliterada" (técnica CRACK) del modelo Qwen3.8-27B de Alibaba, publicada por dealignai en formato GGUF para su ejecución con llama.cpp. La abliteración elimina los mecanismos de rechazo de contenido del modelo original, de modo que responde a instrucciones que el modelo base declinaría, manteniendo en gran medida las capacidades de conocimiento, razonamiento y comprensión multimodal. Está pensado exclusivamente para investigación y red-teaming autorizado, no para uso en producción con usuarios finales.

El modelo base Qwen3.8-27B es una arquitectura híbrida que combina 48 capas de atención lineal GatedDeltaNet con 16 capas de atención completa, con 27 320 millones de parámetros y una ventana de contexto nativa de 262 144 tokens. La versión abliterada conserva el proyector de visión (imagen y vídeo) y el bloque de predicción multi-token (MTP) en todos los cuantizados, lo que permite decodificación especulativa sin necesidad de un modelo auxiliar. Se distribuye en siete cuantizaciones (de Q8_0 a IQ2_M) calibradas con importance matrix, más el proyector multimodal en f16.

La relevancia de este lanzamiento radica en que ofrece un modelo de 27B con capacidades avanzadas de razonamiento y visión en un formato ligero y ejecutable en hardware de consumo, a la vez que plantea un debate ético sobre los límites de la censura en modelos de IA. Su licencia Apache 2.0 permite uso comercial, aunque el autor advierte explícitamente de los riesgos de su uso sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet (atención lineal) + 16 capas de atención completa, hidden size 5120, densa |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K_L, Q6_K, Q4_K_M, IQ4_XS, IQ3_M, IQ2_M (todos con imatrix) + mmproj f16 |
| Idiomas soportados | Inglés y chino (capacidad del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que intercala 48 bloques de atención lineal recurrente (GatedDeltaNet) con 16 bloques de atención completa (full attention). Esta combinación permite manejar contextos muy largos (262K) con un coste computacional subcuadrático en la parte recurrente, mientras que la atención completa se reserva para los bloques donde se necesita mayor precisión en la mezcla de información. El modelo es denso, con 27 320 millones de parámetros y un tamaño de capa oculta de 5120.

La versión "CRACK" de dealignai no es un entrenamiento desde cero, sino una modificación de los pesos del modelo base mediante la técnica de abliteración. Este proceso identifica y elimina las direcciones en el espacio de activaciones que correlacionan con el comportamiento de rechazo, de forma que el modelo deja de negarse a responder a ciertas instrucciones. La intervención se aplica de manera uniforme sobre todos los cuantizados, y cada uno se valida de forma independiente contra su propio base. Además, todos los cuantizados por debajo de 8 bits se calibran con importance matrix (imatrix), protegiendo específicamente los gates de recurrencia SSM (`ssm_alpha` y `ssm_beta`) y el bloque MTP (`blk.64.*`) manteniéndolos en q8_0, para no degradar la dinámica de contexto largo ni la precisión de la decodificación especulativa.

No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteración (número de muestras, criterios de selección, etc.). La model card solo indica que la abliteración es "uniform surgery" y que se validó con HarmBench-240 y MMLU.

## Capacidades

- Generación de texto y razonamiento multi-step con esfuerzo controlable: admite los niveles `low`, `medium` y `xhigh` (por defecto `xhigh`) mediante el parámetro `reasoning_effort` en la plantilla de chat. También se puede desactivar el pensamiento con `enable_thinking: false`.
- Comprensión multimodal de imágenes y vídeo: el proyector `mmproj-Qwen3.8-27B-f16.gguf` se incluye en el repositorio y se empareja con cualquier cuantización para procesar imágenes y fotogramas de vídeo a través de `llama-mtmd-cli`.
- Decodificación especulativa nativa con MTP: el bloque Multi-Token-Prediction está integrado en cada GGUF (`blk.64`), de modo que se puede usar `--spec-type draft-mtp` sin necesidad de un modelo draft externo. La tasa de aceptación MTP reportada ronda el 50-53% según la cuantización.
- Razonamiento agéntico: la configuración recomendada (temperatura 1.0, top_p 0.95, top_k 20) está orientada a tareas de agente y generación de código, no a un modo instructivo clásico.
- Ausencia de rechazo de contenido: el modelo responde a instrucciones que el modelo base declinaría, lo que lo hace útil para investigación de seguridad y análisis de comportamientos adversarios.
- Multilingüismo limitado a inglés y chino, según la capacidad del modelo base.

No se documenta explícitamente soporte de tool calling o function calling en la model card, aunque el modelo base Qwen3.8-27B es conocido por incluir estas capacidades. En esta variante no se confirma, por lo que no se puede afirmar con certeza.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite probar la robustez de los sistemas de moderación de contenido, generando respuestas a instrucciones adversarias que los modelos censurados rechazarían. Su alta tasa de cumplimiento en HarmBench-240 (98,8% en cuantizaciones altas) lo convierte en una herramienta útil para auditar filtros de seguridad.
- Análisis de documentos largos: con 262K tokens de contexto, puede procesar libros completos, expedientes legales o conversaciones de soporte de miles de turnos, manteniendo coherencia gracias a la atención híbrida.
- Generación de código con razonamiento: el modo `reasoning_effort` permite ajustar el tiempo de pensamiento para tareas de programación complejas, como escribir un escáner de puertos TCP en Python o refactorizar un módulo existente.
- Comprensión de imágenes y vídeo en local: el proyector multimodal permite describir imágenes, extraer información de capturas de pantalla o analizar fotogramas de vídeo sin conexión a la nube, útil en entornos con requisitos de privacidad.
- Asistentes conversacionales sin restricciones temáticas: para entornos de investigación donde se necesita explorar temas sensibles sin filtros, el modelo puede mantener diálogos multi-turno con memoria larga.
- Decodificación especulativa para baja latencia: el bloque MTP integrado permite acelerar la generación en servidores llama.cpp, reduciendo la latencia percibida en aplicaciones interactivas sin necesidad de un modelo draft adicional.
- Prototipado de agentes autónomos: la configuración agéntica recomendada (temp 1.0, top_p 0.95, top_k 20) está pensada para pipelines de agente que requieren exploración y toma de decisiones, como planificadores de tareas o buscadores autónomos.

## Benchmarks y rendimiento

La model card incluye una tabla de validación por cuantización, medida con dos conjuntos: HarmBench-240 (cumplimiento coherente de 240 comportamientos adversarios, con filtro automático de respuestas sin sentido) y MMLU (500 preguntas balanceadas de los 57 temas, con scoring de logits restringido a A-D, razonamiento desactivado). Los resultados comparan el modelo CRACK con su base correspondiente.

| Quant | Tamaño | Cumplimiento HB-240 | 0-gibberish | MMLU base → CRACK | Δ MMLU | Aceptación MTP |
|---|---|---|---|---|---|---|
| Q8_0 | 29,0 GB | 98,8% (237/240) | Sí | 84,0 → 82,8 | −1,2 pp | 53,3% |
| Q6_K_L | 23,2 GB | 98,8% (237/240) | Sí | 84,2 → 83,2 | −1,0 pp | 52,4% |
| Q6_K | 22,5 GB | 98,8% (237/240) | Sí | 84,8 → 82,4 | −2,4 pp | 52,0% |
| Q4_K_M | 17,0 GB | 98,8% (237/240) | Sí | 83,8 → 81,8 | −2,0 pp | 52,2% |
| IQ4_XS | 15,5 GB | 98,3% (236/240) | Sí | 83,2 → 83,4 | −0,2 pp | 52,5% |
| IQ3_M | 13,0 GB | 98,3% (236/240) | Sí | 83,4 → 81,6 | +1,8 pp | 52,9% |
| IQ2_M | 10,5 GB | 97,5% (234/240) | Sí | 79,8 → 76,0 | −3,8 pp | 50,5% |

La tabla muestra que la abliteración degrada el conocimiento (MMLU) entre 0,2 y 3,8 puntos porcentuales según la cuantización, con la excepción de IQ3_M que mejora ligeramente (+1,8 pp) respecto a su base. La tasa de aceptación MTP se mantiene estable alrededor del 50-53% en todos los cuantizados. No se han publicado resultados de benchmarks adicionales (GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: cada cuantización requiere al menos el tamaño del archivo más overhead de contexto y caché KV. Para Q4_K_M (17,0 GB) se necesitan aproximadamente 18-20 GB de VRAM con contexto corto; para Q8_0 (29,0 GB) se necesitan 30+ GB. El proyector multimodal añade 0,9 GB adicionales.
- GPU recomendadas: Q4_K_M y cuantizaciones inferiores caben en una RTX 4090 (24 GB) o RTX 3090 (24 GB). Q6_K_L y Q8_0 requieren GPUs de 32 GB o más, como A100 40GB, H100 80GB o RTX 6000 Ada. Para IQ2_M (10,5 GB) bastaría con una RTX 3080 (10-12 GB) o similar.
- En consumer GPU: sí, las cuantizaciones Q4_K_M, IQ4_XS, IQ3_M e IQ2_M son ejecutables en GPUs de gama alta de consumo (24 GB) y algunas de gama media (12-16 GB) con contexto reducido.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli), compatible con el formato GGUF. También se puede usar a través de Ollama si se importa el GGUF, o con vLLM si se convierte a otro formato (aunque la distribución oficial es GGUF). El servidor llama-server ofrece API compatible con OpenAI.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia orientativa, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con llama.cpp, pero esto depende del hardware, la longitud de contexto y el uso de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 262K | Híbrida GatedDeltaNet + atención | Apache 2.0 | Safetensors, GGUF | Modelo original con guardarraíles |
| Qwen3.8-27B-UNCENSORED (dealignai) | 27,3B | 262K | Híbrida + abliteración CRACK | Apache 2.0 | GGUF | Sin rechazo, con MTP y visión |
| Qwen3.8-27B-Uncensored (OrcaRouter) | 27,3B | 262K | Híbrida + abliteración | Apache 2.0 | MLX, GGUF, FP8 | Variante similar de otro proveedor, sin datos de rendimiento publicados |

La comparativa cuantitativa con otras versiones abliteradas no está disponible en la información recopilada. La principal diferencia con el modelo base es la eliminación del rechazo de contenido, con una pérdida de MMLU de entre 0,2 y 3,8 puntos porcentuales según la cuantización. Frente a la variante de OrcaRouter, no se dispone de benchmarks comparables, aunque ambas parten del mismo modelo base y licencia.

## Limitaciones y advertencias

- Ausencia de guardarraíles: el modelo ha sido deliberadamente modificado para eliminar el rechazo de contenido. Puede generar respuestas a instrucciones peligrosas, ilegales o éticamente cuestionables. No debe usarse en producción con usuarios finales sin supervisión humana y filtros adicionales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en cuantizaciones bajas (IQ2_M) donde la degradación de conocimiento es mayor (Δ MMLU −3,8 pp).
- Sesgos conocidos: al estar entrenado principalmente en inglés y chino, puede mostrar sesgos culturales y lingüísticos de esos dominios. No se ha evaluado su comportamiento en otros idiomas.
- Limitaciones de idioma: solo se garantiza un rendimiento razonable en inglés y chino. Otros idiomas pueden producir resultados de baja calidad.
- Degradación en cuantizaciones extremas: aunque la imatrix protege los componentes críticos, las cuantizaciones de 2 y 3 bits (IQ2_M, IQ3_M) pueden mostrar incoherencias en tareas complejas de razonamiento o en contextos muy largos.
- Restricciones de uso: la model card indica que es un "artefacto de investigación" y que el usuario es responsable del uso legal. Aunque la licencia Apache 2.0 permite uso comercial, el autor desaconseja explícitamente su uso sin autorización en entornos no controlados.
- Compatibilidad: el formato GGUF requiere llama.cpp versión reciente (con soporte para arquitectura Qwen3.8 y MTP). No todos los runtimes soportan la decodificación especulativa MTP.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dealignai/Qwen3.8-27B-UNCENSORED-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de OrcaRouter sobre abliteración de Qwen3.8-27B: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local de Qwen3.8-27B uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub qwen38-uncensored: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Explicación de la build MLX de OrcaRouter: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
