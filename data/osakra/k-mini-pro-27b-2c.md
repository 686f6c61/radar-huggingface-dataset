# Osakra/K-Mini-Pro-27B-2C

## Resumen
K-Mini Pro 27B (2C) es un derivado del modelo Qwen3.8-27B, cuantizado y modificado por Osakra Research a partir de prism-ml/Ternary-Bonsai-2-27B. Se distribuye en formato GGUF con mezcla de precisiones (PTQ1_0 ternario, Q8_0 y BF16) y está diseñado para ejecutarse en GPUs de consumo con solo 8 GB de VRAM mediante offloading de visión a CPU y una ventana de contexto de 49.152 tokens. Incorpora etiquetas de razonamiento, código, visión (image-text-to-text) y edge-ai, lo que lo sitúa en la categoría de modelos multimodales ligeros para despliegue local.

El modelo aplica un proceso de ajuste fino (SFT y DPO) sobre las capas finales (bloques 56-63) y las re-cuantiza a Q8_0 para preservar las actualizaciones de bajo rango, evitando que se pierdan al volver a cuantizar a ternario. Además, ofrece un modo de servicio "Titans-NCM v3.2" que añade un enrutador neuro-simbólico en CPU con memoria asociativa HRR de 10.000 dimensiones y planificación de estado neuromodulador, sin consumir VRAM adicional.

Con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y un tamaño de repositorio de 6,8 GB, el modelo busca habilitar razonamiento, generación de código y comprensión de imágenes en hardware modesto, aunque su licencia Apache 2.0 y su naturaleza derivada de Qwen3.8 exigen verificar las obligaciones de atribución.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y SSM (según modelo base Qwen3.8-27B), con proyecciones ternarias PTQ1_0 y mezcla de precisiones Q8_0/BF16 |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 49.152 tokens |
| Tipos de cuantizacion | PTQ1_0 (ternario, type=143), Q8_0 (type=8), BF16 (type=30), F32 (type=0), q4_0 para KV cache |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (K-Mini-Pro-27B-2C.gguf, K-Mini-Pro-27B-mmproj-Q8_0.gguf) |

## Arquitectura y entrenamiento
El modelo parte de Ternary-Bonsai-2-27B, una cuantización ternaria de Qwen3.8-27B. La arquitectura subyacente combina capas de atención con capas de espacio de estados (SSM), tal como se deduce de la presencia de tensores `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`, `ssm_norm`, `ssm_alpha` y `ssm_beta` en los bloques 56-63. El ajuste fino se realizó sobre estas capas finales: se filtraron 432 trayectorias limpias de 531 candidatas, se enmascararon 5.496 tokens de relleno ` thinking` y se ejecutaron 54 pasos de SFT (reduciendo la NLL de validación de 0,8777 a 0,8515) seguidos de 25 pasos de DPO sobre 150 pares de preferencia (NLL final 0,8506, margen de recompensa DPO +0,793, delta de Frobenius máximo 0,222). Las actualizaciones se hornearon en siete proyecciones clave (attn_k, attn_v, attn_output y ffn_down de los bloques 59 y 63) mediante desquantización, transformada inversa de Hadamard, fusión con deltas de rango 64 y re-cuantización a Q8_0; además se actualizaron 57 parámetros no ternarios en su precisión nativa (F32 y BF16). El resto de tensores (787) se copiaron sin cambios. La plantilla de chat normaliza `reasoning_effort` a `"xhigh"` y permite la emisión de código fuente sin tokens de estado cuando no se solicita prosa.

## Capacidades
- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`reasoning_effort` configurable hasta `"xhigh"`).
- Generación de código y finalización de código fuente directa, con excepción para código crudo sin texto adicional.
- Razonamiento matemático y resolución de problemas (GSM8K, MATH).
- Comprensión de imágenes (image-text-to-text) mediante el proyector multimodal Q8_0.
- Soporte de tool calling y function calling, según las etiquetas del modelo.
- Capacidades de agente y razonamiento multi-paso, con enrutamiento cognitivo opcional en el modo Titans-NCM.
- Multilingüismo no especificado; no se detallan idiomas soportados.
- Modo de servicio dual: standalone (GGUF directo) y proxy con enrutador neuro-simbólico en CPU.

## Casos de uso
- Asistencia de código en local: el modelo puede generar y completar funciones en un portátil con GPU de 8 GB, gracias a su cuantización ternaria y a la excepción de código crudo que evita tokens de estado en las completaciones.
- Razonamiento matemático en el borde: con 49.152 tokens de contexto, puede resolver problemas de varios pasos y mantener cadenas de razonamiento largas sin salir de la GPU de consumo.
- Análisis de imágenes en entornos con recursos limitados: el proyector multimodal se descarga a CPU, permitiendo describir o extraer información de imágenes en equipos sin VRAM adicional.
- Automatización de agentes con memoria asociativa: el modo Titans-NCM añade una memoria HRR de 10.000 dimensiones y planificación de estado, útil para asistentes que deben recordar interacciones previas sin consumir VRAM.
- Generación de documentación técnica: el modelo puede producir texto explicativo y código en la misma sesión, con control de esfuerzo de razonamiento para equilibrar latencia y calidad.
- Prototipado de pipelines de CI/CD: al soportar tool calling y ejecutarse con llama-server, puede integrarse en flujos de revisión de código o generación de pruebas automatizadas en máquinas sin GPU de datacenter.
- Investigación en cuantización extrema: sirve como banco de pruebas para estudiar el impacto de PTQ1_0, Q8_0 y el horneado de deltas en modelos híbridos atención-SSM.

## Benchmarks y rendimiento
Los datos provienen de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | Resultado | Notas |
|---|---|---|
| HumanEval (164) | 96,3% (158/164) | Directo y enrutado |
| GSM8K (100) | 98,0% (98/100) | Enrutado |
| MATH-50 | 94,0% (47/50) | Directo y enrutado |
| MBPP (50) | 96,0% (48/50) | Directo y enrutado |
| Pillar-45 | 100,0% (45/45) | Enrutado |
| Valid-50 | 90,0% (45/50) | Enrutado |

No se han publicado resultados de MMLU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 7,43 GiB en modo standalone con contexto q4_0 de 49.152 tokens y visión descargada a CPU.
- GPU recomendadas: GPUs de consumo con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); no se especifican modelos profesionales.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB, con el proyector multimodal en CPU.
- Opciones de despliegue: llama.cpp / llama-server (modo A en puerto 8102), proxy Titans-NCM v3.2 en Python (modo B en puerto 8093); no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: decodificación de 27,4 a 31,0 tokens por segundo en modo A; no se proporcionan cifras de prefilling ni de latencia extremo a extremo.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| K-Mini Pro 27B (2C) | 26,9 B | 49.152 | Apache 2.0 | GGUF | Cuantización ternaria + Q8_0, visión, enrutador opcional |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo base original; no se detallan especificaciones |
| Ternary-Bonsai-2-27B | no disponible | no disponible | no disponible | GGUF | Modelo base ternario del que deriva; no se detallan especificaciones |

No se dispone de datos suficientes para comparar rendimiento, latencia o calidad con alternativas de la misma categoría.

## Limitaciones y advertencias
- Los benchmarks presentados son autoinformados por el autor y no han sido replicados de forma independiente; deben tomarse con cautela.
- El proceso de ajuste fino se limita a los bloques 56-63 y a siete proyecciones clave; el resto del modelo conserva la cuantización ternaria original, lo que puede introducir degradaciones no medidas.
- La licencia Apache 2.0 se aplica al artefacto, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones; es necesario verificar la compatibilidad para uso comercial.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- El modo Titans-NCM añade complejidad operativa (servidor proxy en CPU, estado neuromodulador) y no está claro su impacto en la estabilidad o reproducibilidad.
- El contexto de 49.152 tokens se logra con KV cache q4_0, lo que puede afectar a la calidad en conversaciones muy largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo o seguridad.
- El tamaño del repositorio (6,8 GB) y la necesidad de descargar el proyector multimodal por separado complican el despliegue en entornos con ancho de banda limitado.

## Enlaces
- Hugging Face: https://huggingface.co/Osakra/K-Mini-Pro-27B-2C
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Benchmarks referenciados en la model card (rutas relativas): ./benchmarks/humaneval_164.json, ./benchmarks/official_edge_v6.json, ./benchmarks/fresh_standalone_150.json, ./benchmarks/valid50_routed.json
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
