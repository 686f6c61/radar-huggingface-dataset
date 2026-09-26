# mradermacher/Qwen3.5-4B-MTP-Heretic-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-4B-MTP-Heretic-GGUF` es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo `RBergBauer/Qwen3.5-4B-MTP-Heretic`. Se trata de una variante derivada de la familia Qwen3.5 de 4B parámetros que ha sido sometida a un proceso de "abliteration" (eliminación de comportamientos de rechazo), etiquetada por sus autores con los descriptores `abliterated`, `uncensored`, `heretic` y `refusal`. El repositorio no contiene pesos en formato original, sino únicamente ficheros GGUF listos para inferencia en CPU/GPU mediante llama.cpp y derivados.

El modelo declara 4.326.350.848 parámetros totales (aproximadamente 4,33 mil millones) y soporte multimodal, tal y como evidencian los ficheros `mmproj` incluidos en el repositorio. Los tags indican también la presencia de mecanismos de predicción multi-token (MTP), si bien la model card no documenta detalles técnicos sobre su implementación ni sobre el entrenamiento original. El idioma declarado es únicamente inglés.

Su relevancia práctica radica en que ofrece una alternativa de 4B parámetros en GGUF, ejecutable en hardware de consumo, con visión integrada y sin las restricciones de rechazo del modelo original. Ahora bien, al tratarse de una cuantización publicada con cero descargas y cero valoraciones en el momento de redactar esta ficha, no existe validación comunitaria sobre su calidad ni sobre el impacto del proceso de abliteration en el rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio es una cuantización GGUF del modelo `RBergBauer/Qwen3.5-4B-MTP-Heretic`; la model card no especifica la arquitectura interna) |
| Parámetros totales | 4.326.350.848 (dato real, safetensors) |
| Parámetros activos | No aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | mmproj-Q8_0 (0,5 GB), mmproj-f16 (0,8 GB), Q2_K (2,1 GB), Q3_K_S (2,2 GB), Q3_K_M (2,4 GB), Q3_K_L (2,6 GB), IQ4_XS (2,7 GB), Q4_K_S (2,7 GB), Q4_K_M (2,9 GB), Q5_K_S (3,2 GB), Q5_K_M (3,3 GB), Q6_K (3,7 GB), Q8_0 (4,7 GB), f16 (8,8 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; no se incluyen safetensors en este repositorio) |
| Mecanismos especiales | MTP (predicción multi-token) y soporte multimodal, según los tags del repositorio |
| Cuantizaciones ponderadas / imatrix | No disponibles según la propia model card |
| Tamaño del repositorio | 41,0 GB |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna del modelo. El repositorio es una publicación de cuantizaciones GGUF del modelo base `RBergBauer/Qwen3.5-4B-MTP-Heretic`, y la model card de mradermacher se limita a indicar los parámetros de conversión (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la lista de cuantizaciones generadas. No se especifica si se trata de un transformer denso, de una arquitectura híbrida o de cualquier otra variante, ni se documenta el número de tokens de entrenamiento, la composición del dataset o la existencia de fases de RLHF, DPO o similares.

Los tags `abliterated`, `uncensored`, `heretic` y `refusal` indican que el modelo base ha sido modificado mediante técnicas de abliteration para reducir o eliminar las respuestas de rechazo. El tag `mtp` apunta a la presencia de predicción multi-token, una técnica habitualmente asociada a la aceleración de la decodificación mediante cabezas de predicción adicionales, aunque este repositorio no documenta cómo se implementa ni con qué configuración. El tag `multimodal`, junto con la presencia de ficheros `mmproj` en formato Q8_0 y f16, confirma la existencia de un codificador visual acoplado al modelo de lenguaje, pero no se detalla su arquitectura.

No se ha publicado información sobre hiperparámetros de entrenamiento, composición del corpus, procesos de alineación ni innovaciones técnicas concretas más allá de las etiquetas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés, con formato de plantilla tipo chat.
- Procesamiento de imágenes: la presencia de ficheros `mmproj` habilita el uso multimodal siempre que el motor de inferencia lo soporte.
- Predicción multi-token (MTP) según los tags declarados, orientada a acelerar la generación.
- Comportamiento sin rechazos: el proceso de abliteration elimina las negativas automáticas del modelo original, lo que permite respuestas sobre temáticas que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Modo "thinking" o razonamiento extendido: no disponible (no documentado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en equipos de sobremesa: con las cuantizaciones Q4_K_S o Q4_K_M (2,7-2,9 GB), el modelo puede ejecutarse íntegramente en una GPU de 8 GB o incluso en CPU con llama.cpp, lo que lo hace adecuado para prototipado offline sin dependencia de APIs externas.
- Procesamiento de documentos con imágenes: gracias al codificador multimodal (`mmproj-Q8_0` o `mmproj-f16`), se puede usar para extraer y resumir información de capturas, diagramas o documentos escaneados, siempre que el motor de inferencia soporte el modo visión.
- Investigación sobre alineación y seguridad: la naturaleza abliterated del modelo lo convierte en un objeto de estudio útil para analizar cómo varía la tasa de rechazo respecto al modelo original y qué efectos colaterales tiene sobre la coherencia y la factualidad.
- Generación de texto creativo sin filtros editoriales: para redacción de ficción, guiones o narrativa que requiera temáticas sensibles, el modelo no aplicará las negativas automáticas habituales en modelos alineados.
- Asistente conversacional embebido: con la cuantización Q2_K (2,1 GB) puede desplegarse en dispositivos con memoria limitada, como mini-PC o Raspberry Pi de gama alta con RAM suficiente, para tareas de chat de baja exigencia.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un rango completo desde Q2_K hasta f16, lo que permite medir empíricamente la degradación de perplejidad y calidad entre niveles de cuantización sobre un mismo modelo base.
- Pipeline de moderación inversa o análisis de contenido: útil para estudiar qué tipo de peticiones generan rechazo en modelos alineados, comparando las salidas de este modelo con las de su versión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar caché KV ni el codificador visual):
  - Q2_K: ~2,1 GB de pesos, ~3 GB de VRAM total con contexto moderado.
  - Q3_K_M: ~2,4 GB de pesos, ~3,5 GB de VRAM total.
  - IQ4_XS / Q4_K_S: ~2,7 GB de pesos, ~4 GB de VRAM total.
  - Q4_K_M: ~2,9 GB de pesos, ~4,5 GB de VRAM total.
  - Q5_K_M: ~3,3 GB de pesos, ~5 GB de VRAM total.
  - Q6_K: ~3,7 GB de pesos, ~5,5 GB de VRAM total.
  - Q8_0: ~4,7 GB de pesos, ~6,5 GB de VRAM total.
  - f16: ~8,8 GB de pesos, ~10 GB de VRAM total.
- Codificador visual: sumar 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16) si se usa el modo multimodal.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM cubre todo el rango de cuantizaciones (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). Para las cuantizaciones Q8_0 y f16 son suficientes 8-12 GB de VRAM.
- Compatibilidad con GPU de consumo: sí. Las cuantizaciones Q4 cubren tarjetas de 6-8 GB (RTX 3060, RTX 2060, RTX 4060); las Q2 y Q3 pueden caber en GPUs de 4 GB.
- Memoria unificada: es viable en Macs con Apple Silicon a partir de 8 GB de memoria unificada usando Q4, y a partir de 16 GB para f16.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, text-generation-webui, koboldcpp, Jan. El soporte en vLLM y TGI para GGUF es parcial y depende del modelo concreto; no está confirmado para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de benchmarks disponibles para este modelo, por lo que la comparación se limita a aspectos estructurales. Se indica "no disponible" en cualquier celda no verificable en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| `mradermacher/Qwen3.5-4B-MTP-Heretic-GGUF` | 4,33 B | No disponible | Apache 2.0 | GGUF | No disponible |
| `RBergBauer/Qwen3.5-4B-MTP-Heretic` (modelo base) | No disponible | No disponible | Apache 2.0 (según el repositorio derivado) | No disponible | No disponible |
| `Qwen/Qwen3.5-4B` (familia de origen) | No disponible | No disponible | Apache 2.0 (referenciada en `license_link`) | No disponible | No disponible |
| Alternativas de ~3-4 B en GGUF (familias tipo Qwen3, Llama 3.2, Gemma 3) | No disponible | No disponible | No disponible | GGUF | No disponible |

No se dispone de información verificable sobre variantes alternativas de la misma categoría dentro de la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático sin advertencia previa. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- El proceso de abliteration suele degradar capacidades generales: es frecuente observar pérdida de coherencia, mayor tasa de alucinación y peor seguimiento de instrucciones en comparación con el modelo alineado original. No hay evaluaciones publicadas que cuantifiquen este efecto en este modelo concreto.
- Riesgo de alucinación: no se han publicado métricas de factualidad ni evaluaciones de veracidad para esta variante.
- Idioma: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y previsiblemente será muy inferior.
- Longitud de contexto: no disponible. Se desconoce si la cuantización preserva la ventana de contexto completa del modelo original.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S conllevan degradación notable de calidad. La propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rápidas y recomendadas.
- No existen cuantizaciones ponderadas ni imatrix para este modelo, lo que suele implicar peor relación calidad/tamaño en los niveles bajos respecto a alternativas con imatrix.
- Licencia: Apache 2.0 permite uso comercial, pero el `license_link` apunta a la licencia de `Qwen/Qwen3.5-4B`; conviene verificar si el modelo base añade condiciones adicionales. El proceso de abliteration puede introducir obligaciones o consideraciones que no cubre la licencia original.
- Estado de validación: el repositorio presenta cero descargas y cero valoraciones, sin evidencia comunitaria de funcionamiento correcto. El pipeline no está declarado (`no disponible`), por lo que la integración no está garantizada.
- El soporte multimodal depende del motor de inferencia; no todos los clientes GGUF gestionan correctamente los ficheros `mmproj`.
- Las fechas del repositorio (creación y actualización en septiembre de 2026) y la denominación "Qwen3.5" no han podido contrastarse con documentación pública adicional en la búsqueda realizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-4B-MTP-Heretic-GGUF
- Modelo base: https://huggingface.co/RBergBauer/Qwen3.5-4B-MTP-Heretic
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Qwen3.5-4B-MTP-Heretic-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces encontrados correspondían a una editorial portuguesa sin relación con el contenido de esta ficha.
