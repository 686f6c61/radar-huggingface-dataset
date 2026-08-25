# poisonxa/PXA-Fusion4-35B-GGUF

## Resumen

PXA-Fusion4-35B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 35.500 millones de parámetros, desarrollado por PXA Network (usuario poisonxa) sobre la base de Qwen3.5-35B-A3B. El modelo está diseñado específicamente para uso agéntico (tool calling, razonamiento multi-paso) y generación de código, con un enfoque declarado en la resistencia a la fabricación de información (anti-fabrication) y en la ausencia de censura (uncensored, abliterated). Se distribuye únicamente en formato GGUF con una cuantización propietaria denominada PXQ4, que permite ejecutarlo en GPUs de gama baja o reutilizadas (por ejemplo, dos Tesla P100 de 16 GB o una sola GPU de 24 GB).

La relevancia actual del modelo radica en su propuesta de ingeniería de modelos: no es un fine-tuning convencional, sino el resultado de un proceso de fusión de pesos en el espacio de pesos, cirugía a nivel de experto y endurecimiento con corpus adversariales. Incluye además una cabeza de decodificación especulativa (MTP) integrada en cada cuantización publicada. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución adicionales.

El repositorio publica únicamente el nivel de cuantización PXQ4 (19,3 GB, ~4,27 bpw), que es el recomendado por el autor. Otros niveles (PXQ2, PXQU12, PXQU16, PXQ6) y el proyector de visión fueron retirados en una limpieza posterior y no están disponibles actualmente. El modelo requiere el motor de inferencia propietario pxq_llama (un fork de llama.cpp) para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-35B-A3B, 256 expertos × 40 capas, atencion hibrida (KV reducido) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B por token (A3B) |
| Longitud de contexto | 73.728 tokens (segun flags de ejecucion recomendados: `-c 73728`) |
| Tipos de cuantizacion | PXQ4 (~4,27 bpw, 19,3 GB) — unico nivel publicado; otros niveles retirados |
| Idiomas soportados | No disponible (modelo base Qwen, presumiblemente multilingue, pero no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizacion propietaria PXQ) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3.5-35B-A3B, un MoE con 256 expertos distribuidos en 40 capas y aproximadamente 3.000 millones de parámetros activos por token. La atención es híbrida, lo que reduce la huella de KV-cache. Sobre esta base, PXA Network aplica un proceso de ingeniería de modelos en varias etapas: fusión de pesos en el espacio de pesos (weight-space fusion), calibración imatrix del banco de expertos, un injerto diferencial anti-fabricación (que aumenta el rechazo de premisas falsas sin eliminar el comportamiento no censurado) y el injerto de una cabeza de decodificación especulativa (MTP) en cada cuantización publicada.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. El autor indica que el modelo es "abliterated" (técnica que elimina las negativas de seguridad del modelo base) y que el proceso de fusión y calibración es propietario. La cuantización PXQ4 combina cuantización genuina PXQ4 para el banco de expertos (89% del archivo, 16,0 GiB en 120 tensores), tensores MXFP4 para el experto compartido y las puertas de atención, y Q8_0 para un pequeño conjunto de tensores de atención K/V.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) opt-in mediante el flag `enable_thinking`.
- Uso agéntico: soporte de tool calling y ejecución de tareas multi-paso en entornos de agente (el autor recomienda flags específicos para harnesses agénticos).
- Generación de código: el modelo está afinado para tareas de programación y puede integrarse en pipelines de desarrollo.
- Resistencia a la fabricación de información: el injerto anti-fabrication busca rechazar premisas falsas y reducir alucinaciones, manteniendo a la vez un comportamiento no censurado.
- Capacidad multilingüe: no especificada explícitamente, pero heredada presumiblemente de la base Qwen.
- Decodificación especulativa (MTP): cada cuantización incluye una cabeza MTP que acelera la decodificación cuando se activa con `--spec-type mtp:n_max=1`.
- Sin censura (uncensored/abliterated): el modelo no aplica negativas de seguridad estándar, lo que permite generar contenido que otros modelos rechazarían.

## Casos de uso

- Automatización de atención al cliente con contexto largo: con una ventana de 73.728 tokens, el modelo puede mantener conversaciones multi-turno extensas, recordando detalles de interacciones anteriores sin perder coherencia. Su modo no censurado permite manejar consultas delicadas sin rechazos automáticos.
- Agentes autónomos de razonamiento multi-paso: el modelo está optimizado para tool calling y planificación. Puede usarse en harnesses como los descritos por el autor (con `--reasoning off` y penalizaciones específicas) para tareas que requieren encadenar llamadas a herramientas, consultar APIs y tomar decisiones intermedias.
- Generación de código en producción: soporta generación de código y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests. Su resistencia a la fabricación reduce la probabilidad de inventar APIs o funciones inexistentes.
- Asistente de programación sin censura: a diferencia de modelos con alineación estricta, puede generar código para fines de seguridad ofensiva, exploits educativos o análisis de malware sin negativas, útil en entornos de investigación.
- Análisis de documentos largos: la ventana de contexto amplia permite procesar manuales técnicos, contratos o informes extensos en una sola pasada, extrayendo información y respondiendo preguntas sobre el contenido.
- Despliegue en hardware de bajo coste o reutilizado: gracias a la cuantización PXQ4 y al motor pxq_llama, el modelo puede ejecutarse en GPUs de segunda mano como Tesla P100 (16 GB) o V100, lo que lo hace viable para proyectos con presupuesto limitado o para entornos de edge con GPUs antiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones de velocidad de inferencia con el motor pxq_llama, en configuración "fair-battle" (prompt frío de ~5,8k tokens, temperatura 0, mediana de 3 ejecuciones):

| Configuracion | Prefill (t/s) | Decode (t/s) | Decode + MTP (t/s) |
|---|---|---|---|
| 2× Tesla P100 (sm_60) | 1.163 | 56,8 | 60,7 (aceptacion ~0,68) |
| 1× Tesla V100 (sm_70) | 2.358 | — | 108,3 |

Estas cifras corresponden al nivel PXQ4 y no son comparables con benchmarks de calidad de generación.

## Requisitos de hardware

- VRAM estimada: el archivo PXQ4 pesa 19,3 GB, por lo que se necesita al menos 20 GB de VRAM para cargar el modelo completo. El autor indica que cabe en 2×16 GB o en una sola GPU de 24 GB.
- GPUs recomendadas: dos Tesla P100 (16 GB cada una) o una Tesla V100 (16/32 GB). También debería funcionar en RTX 3090/4090 (24 GB) o similares, aunque no se han publicado mediciones.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 24 GB de VRAM (RTX 3090, RTX 4090) puede ejecutar el modelo. Con 16 GB no cabe en una sola GPU, pero sí en configuraciones de doble GPU.
- Opciones de despliegue: el modelo requiere el motor propietario pxq_llama (fork de llama.cpp). Se usa el binario `llama-server` con flags específicos. No es compatible con vLLM, Ollama o TGI estándar sin adaptación.
- Latencia y throughput: según las mediciones del autor, el decode alcanza ~57 t/s en 2× P100 y ~108 t/s en V100 con MTP activado. El prefill es de 1.163-2.358 t/s dependiendo de la configuración.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Estructuralmente, el modelo comparte base con Qwen3.5-35B-A3B (el modelo original sin modificar), pero no se han publicado resultados que permitan comparar rendimiento real. Otros MoE de tamaño similar (por ejemplo, Mixtral 8x7B o Qwen3-30B-A3B) podrían ser alternativas, pero no hay datos de evaluación en la documentación disponible. Se indica "no disponible" para la comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo no censurado (uncensored/abliterated): puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones donde se requiera moderación de contenido o cumplimiento normativo.
- Riesgo de alucinación: aunque el autor declara resistencia a la fabricación, no hay evidencia independiente de que el modelo alucine menos que otros. En tareas de alta precisión (medicina, finanzas, legal) se requiere verificación humana.
- Dependencia del motor propietario: el modelo solo funciona con pxq_llama, un fork de llama.cpp mantenido por la comunidad PXA. No hay garantía de soporte a largo plazo ni compatibilidad con ecosistemas estándar (vLLM, TGI, Ollama).
- Cuantización limitada: solo se publica el nivel PXQ4. Los niveles de menor bit (PXQ2, PXQU12, etc.) fueron retirados y no están disponibles, lo que limita las opciones de despliegue en hardware muy restringido.
- Problema histórico de chat template: la primera versión del repositorio incluía un chat template con el flag `enable_thinking` invertido, lo que causaba bucles de razonamiento. El problema se corrigió el 2026-07-24, pero los usuarios que descargaron antes deben re-descargar.
- Sin datos de evaluación independiente: no se han publicado resultados de benchmarks estándar ni evaluaciones de terceros, por lo que las afirmaciones de rendimiento y calidad se basan únicamente en las declaraciones del autor.
- Idiomas no especificados: no se documenta qué idiomas soporta el modelo más allá de la herencia de Qwen. El uso en idiomas distintos del inglés o el chino puede degradar la calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/poisonxa/PXA-Fusion4-35B-GGUF
- Motor de inferencia pxq_llama (GitHub): https://github.com/poisonxa16/pxq_llama.cpp
- Comunidad Discord PXA Network: https://discord.gg/BHWmMHHStY
- Colección PXA Fusion2-35B (modelo anterior): https://huggingface.co/collections/poisonxa/pxa-fusion2-35b-a-35b-moe-for-landfill-gpus
- Página del proyecto PXA Network: https://pxanetwork.com
