# dgvcxz/MiniCPM5-2B-heretic-abliterated-int8-g128-ov

## Resumen

El repositorio `dgvcxz/MiniCPM5-2B-heretic-abliterated-int8-g128-ov` contiene una conversión a OpenVINO de un modelo de lenguaje de aproximadamente 2000 millones de parámetros. Según el propio identificador del repositorio, el modelo deriva de una base denominada "MiniCPM5-2B" y ha sido sometido a un proceso de *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones), un procedimiento que suele etiquetarse como "uncensored" o "heretic" y que persigue reducir la tasa de negativas del modelo ante peticiones que el modelo original rechazaría. El autor es el usuario dgvcxz y la licencia declarada es apache-2.0.

Su interés técnico reside en el formato: se distribuye como modelo OpenVINO en precisión INT8 con tamaño de grupo 128, lo que permite ejecutar inferencia sobre CPU, iGPU y NPU de Intel sin necesidad de GPU dedicada. El repositorio ocupa 2,5 GB, coherente con un modelo de ~2B parámetros cuantizado a 8 bits.

La información publicada es, sin embargo, mínima: la model card contiene únicamente la línea `license: apache-2.0` y no documenta arquitectura, contexto, idiomas, dataset de entrenamiento ni resultados de evaluación. El repositorio registra 0 descargas y 0 likes, no declara pipeline y fue creado y actualizado el mismo día (2026-09-11). Todo dato que no aparezca en esta ficha debe considerarse no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas del repositorio son `openvino` y `llama`; el nombre sugiere una base MiniCPM (transformer denso), sin confirmar |
| Parametros totales | No confirmado en la model card; el nombre del repositorio indica ~2B |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 con group size 128, segun el nombre del repositorio; no se documentan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en la model card) |
| Formato de pesos | OpenVINO IR (etiqueta `openvino`, sufijo `-ov`); repositorio de 2,5 GB |
| Tamano del repositorio | 2,5 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. La model card únicamente declara la licencia apache-2.0, por lo que no es posible confirmar si el modelo base es realmente un MiniCPM, qué variante concreta sería ni qué pipeline de alineación recibió antes del proceso de abliteration.

Lo único deducible del repositorio es el tratamiento posterior: se trata de una cuantización de pesos a INT8 con tamaño de grupo 128 (esquema típico de las herramientas de compresión de OpenVINO/NNCF) y una exportación al formato IR de OpenVINO. La abliteration, por su parte, es una técnica de edición de pesos o de direcciones de activación que busca anular la dirección asociada al rechazo; suele aplicarse sin reentrenamiento completo y puede degradar la coherencia general del modelo si no se controla. No hay información sobre qué herramienta concreta se empleó ni sobre el grado de intervención.

## Capacidades

No hay documentación oficial de capacidades. A continuación se enumeran únicamente las que pueden inferirse del nombre y del formato, marcadas como no confirmadas:

- Generación de texto en un modelo de ~2B parámetros: capacidad esperable pero no evaluada en la información disponible.
- Comportamiento de rechazo reducido: la etiqueta "abliterated" y "heretic" indica que el modelo debería aceptar peticiones que la versión alineada rechazaría. No confirmado por el autor.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Modo de razonamiento explícito (*thinking mode*), visión o audio: no disponible.
- Inferencia en hardware Intel (CPU, iGPU, NPU) mediante OpenVINO: es la única capacidad confirmada por el propio formato de publicación.

## Casos de uso

Los siguientes escenarios son hipotéticos y asumen que el modelo se comporta como su nombre sugiere; no están respaldados por evaluaciones publicadas.

- Prototipado en portátiles sin GPU dedicada: al estar en formato OpenVINO INT8, puede ejecutarse sobre la iGPU o la NPU de un procesador Intel reciente, lo que permite probar un asistente conversacional local sin tarjeta gráfica.
- Procesamiento por lotes en CPU en servidores sin acelerador: un modelo de ~2B en INT8 ocupa alrededor de 2 GB de pesos, por lo que varias instancias pueden convivir en memoria de sistema en un servidor convencional.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de qué ocurre con el comportamiento de rechazo tras una abliteration, útil para comparar contra la versión original.
- Generación de texto creativo sin restricciones temáticas: escenarios de escritura de ficción o guiones donde el filtrado del modelo base resulta un obstáculo, siempre que el usuario asuma la responsabilidad del contenido generado.
- Clasificación y etiquetado de texto a pequeña escala: tareas de extracción de entidades o categorización en las que un modelo pequeño cuantizado es suficiente y la latencia importa más que la calidad punta.
- Integración en aplicaciones de escritorio offline: el formato IR se integra con la API de OpenVINO en C++ y Python, lo que facilita embeberlo en herramientas locales sin conexión ni dependencias de servicios en la nube.
- Análisis de textos con vocabulario sensible: en entornos de moderación o auditoría donde se necesita que el modelo no se niegue a procesar material explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no enlaza a evaluaciones externas. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2 GB para los pesos en INT8 (2B parámetros × 1 byte) más el *overhead* del motor de OpenVINO y la caché KV. En la práctica, un presupuesto de 3-4 GB de memoria es razonable para contextos moderados; el dato exacto de contexto no está disponible, por lo que la cifra no puede afinarse.
- GPU recomendadas: no aplica en sentido estricto, ya que el formato OpenVINO está orientado a hardware Intel. Funcionaría en iGPU Intel integradas (Iris Xe y posteriores) y en las GPU dedicadas Intel Arc. En GPU NVIDIA o AMD sería necesario reconvertir el modelo a otro formato.
- Cabe en GPU de consumo: sí, por tamaño (2 GB en INT8) cabría en cualquier GPU con 4 GB o más de VRAM, pero el artefacto publicado solo es ejecutable directamente en hardware Intel. En equipos con CPU Intel reciente puede funcionar sin GPU alguna.
- Opciones de despliegue: OpenVINO GenAI (Python y C++), OpenVINO Model Server (OVMS), y Optimum-Intel para cargarlo desde Hugging Face Transformers. No es compatible de forma directa con llama.cpp, Ollama, vLLM ni TGI, ya que todos ellos esperan pesos en safetensors/GGUF y no el formato IR.
- Latencia y throughput: no disponibles. Dependerán del dispositivo (CPU frente a iGPU frente a NPU) y de la longitud de contexto efectiva, que no se documenta.

## Comparativa con modelos similares

La comparación se establece con alternativas de tamaño equivalente y disponibilidad pública. Los datos de los modelos alternativos proceden de conocimiento general y deberían verificarse en sus fichas oficiales; los del modelo analizado son, en su mayoría, no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato publicado |
|---|---|---|---|---|
| dgvcxz/MiniCPM5-2B-heretic-abliterated-int8-g128-ov | ~2B (no confirmado) | No disponible | apache-2.0 (declarada) | OpenVINO IR INT8 |
| MiniCPM base (si el nombre hace referencia a ese proyecto) | No disponible | No disponible | No disponible | safetensors / GGUF en el proyecto original |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens nativos | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-3B-Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

La diferencia principal no está en el rendimiento, del que no hay datos, sino en el formato: frente a las alternativas, que se distribuyen en safetensors y GGUF y son compatibles con el ecosistema estándar (llama.cpp, vLLM, Ollama), este repositorio está atado a OpenVINO. A cambio, ofrece una vía de ejecución sobre NPU Intel que los demás no cubren directamente, y una variante sin alineación de seguridad que no tiene equivalente en los modelos citados.

## Limitaciones y advertencias

- Contenido sin alineación de seguridad: la abliteration elimina o reduce la dirección de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o explícitamente gráfico. La responsabilidad de uso recae íntegramente en quien lo despliega.
- Degradación potencial de capacidades: la edición de pesos sin reentrenamiento suele afectar a la coherencia, provocar repeticiones y deteriorar el seguimiento de instrucciones. No hay evaluaciones publicadas que cuantifiquen este efecto.
- Riesgo de alucinación: elevado en modelos de ~2B parámetros, y sin datos de evaluación que permitan acotarlo. No debe usarse como fuente factual sin verificación externa.
- Idiomas soportados: no documentados. No se puede asumir un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Longitud de contexto: no disponible. Cualquier caso de uso que dependa de contexto largo debe validarse empíricamente antes de llevarlo a producción.
- Licencia: el repositorio declara apache-2.0, pero al tratarse de un derivado de un modelo base no identificado, los términos reales podrían incluir condiciones adicionales del modelo original. Conviene verificar la procedencia antes de un uso comercial.
- Model card vacía: no hay información de procedencia, dataset, versión del modelo base ni instrucciones de uso, lo que dificulta cualquier auditoría.
- Metadatos inconsistentes: la fecha declarada (2026-09-11) y la ausencia total de descargas, likes y pipeline sugerirían una publicación muy reciente o de escasa difusión; no hay garantía de mantenimiento.
- Dependencia de versión de OpenVINO: los artefactos IR suelen requerir una versión concreta del runtime; una incompatibilidad puede obligar a reconvertir el modelo desde los pesos originales, que no se incluyen en el repositorio.
- Sin soporte de cuantización alternativa: no se publican variantes FP16, INT4 ni GGUF, por lo que no hay plan B si el INT8 g128 no rinde como se espera.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dgvcxz/MiniCPM5-2B-heretic-abliterated-int8-g128-ov

La búsqueda web realizada no devolvió ningún resultado relevante: los enlaces obtenidos correspondían a foros del videojuego Metin2 y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios de código, demos ni evaluaciones asociadas a este modelo.

Referencias generales de contexto (no proceden de la búsqueda y no están vinculadas a este repositorio concreto):

- Documentación de OpenVINO: https://docs.openvino.ai
- Organización OpenBMB en Hugging Face, responsable del proyecto MiniCPM: https://huggingface.co/openbmb
- Repositorio del proyecto MiniCPM: https://github.com/OpenBMB/MiniCPM
