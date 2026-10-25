# 0xSojalSec/GLM-5.3-Flash-abliterated

## Resumen

GLM-5.3-Flash-abliterated es una variante "abliterated" (sin rechazos) del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario 0xSojalSec en HuggingFace. El modelo conserva la torre de visión y la pipeline image-text-to-text del original, pero incorpora una modificación quirúrgica de pesos cuyo objetivo es eliminar las respuestas de rechazo del modelo base. El repositorio contiene pesos en safetensors (aproximadamente 320.759 millones de parámetros, es decir, unos 320,8 mil millones) y ficheros GGUF, con un tamaño total de repositorio de 1.559 GB, lo que lo sitúa en la categoría de modelos de gran escala que requieren despliegue multi-GPU.

La model card es, en la práctica, una copia de la ficha de huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF: describe el proceso de abliteración sobre las capas 15 a 35 (indexación 0-based), dejando intactos el resto de capas y todos los módulos de expertos. Esto indica que el modelo base es un transformer con mezcla de expertos (MoE), aunque la información disponible no detalla el número de expertos ni la cantidad de parámetros activos por token.

Su relevancia es doble: por un lado, permite estudiar empíricamente cómo se distribuye la negativa a responder en un modelo multimodal de gran tamaño y qué coste tiene eliminarla; por otro, sirve como banco de pruebas para evaluar formatos GGUF de muy gran escala (imatrix, cuantización dinámica UD) en llama.cpp. La licencia declarada es MIT, pero el autor advierte explícitamente de que se trata de una prueba de concepto y desaconseja su uso directo en producción o en aplicaciones comerciales de cara al público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capacidad multimodal image-text-to-text; la model card menciona "expert modules" pero no detalla número de expertos ni configuración de enrutamiento |
| Parametros totales | 320.759.404.382 (~320,8 mil millones), según safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en el ejemplo de ejecución documentado con llama.cpp (`-c 262144`); la longitud máxima oficial del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | GGUF, con al menos el nivel UD-Q4_K_XL generado con imatrix; pesos originales en safetensors (precisión no especificada); el resto de niveles GGUF del repositorio de unsloth no se detalla |
| Idiomas soportados | inglés (en) y chino (zh), según los metadatos del repositorio |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base zai-org/GLM-5.3-Flash es un transformer con mezcla de expertos y capacidad multimodal: la pipeline declarada es image-text-to-text y los pesos abliterados incluyen módulos de expertos que, según la model card, no han sido modificados. La intervención consiste en una abliteración aplicada únicamente a las capas 15 a 35 (indexación 0-based), es decir, una franja intermedia de la red; el resto de capas y la totalidad de los expertos conservan los pesos originales. El método de referencia citado es `remove-refusals-with-transformers` de Sumandora, que calcula direcciones de rechazo a partir de activaciones y las proyecta fuera de la matriz de pesos.

No se publican en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otra fase de alineamiento. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal, etc.) ni detalles del entrenamiento multimodal. La adaptación al formato GGUF procede de unsloth/GLM-5.3-Flash-GGUF, con cuantización dinámica (UD) e imatrix, y requiere una versión de llama.cpp con soporte oficial para GLM-5.3-Flash (existe una rama específica en el fork de unslothai).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas sobre contenido visual y conversación mixta texto-imagen.
- Ventana de contexto de hasta 262.144 tokens en la configuración documentada, adecuada para documentos extensos y conversaciones muy largas.
- Comportamiento sin filtrado de rechazos en las capas abliteradas (15-35): el modelo tiende a responder a peticiones que el base rechazaría, incluyendo contenido sensible.
- Capacidad de ejecución en CPU/GPU mixta mediante llama.cpp y ficheros GGUF cuantizados.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo "thinking", razonamiento explícito, audio u otras modalidades adicionales.
- No se documentan capacidades de agente ni de razonamiento multi-paso verificadas.

## Casos de uso

- Investigación sobre mecanismos de rechazo: comparar las activaciones y respuestas del modelo abliterado frente al base para localizar qué capas concentran la negativa a responder y cuantificar el daño colateral en otras capacidades.
- Evaluación de seguridad y red-teaming controlado: usar el modelo como generador de casos adversarios en un entorno aislado, para entrenar clasificadores de contenido o probar filtros de salida antes de desplegarlos.
- Generación de datos sintéticos para ajuste de modelos de moderación: producir pares pregunta-respuesta que un modelo alineado rechazaría, etiquetarlos manualmente y construir datasets de clasificación de riesgo.
- Procesamiento de documentos largos con componente visual: con 262.144 tokens de contexto y entrada de imagen, analizar informes escaneados, contratos o expedientes completos en una sola pasada, útil en prototipos de extracción de información.
- Experimentación con cuantizaciones de gran escala: banco de pruebas para medir degradación de calidad entre bf16, Q8 y UD-Q4_K_XL en un modelo de ~320B con expertos, y para validar el rendimiento de llama.cpp con imatrix.
- Docencia y formación en alineamiento de IA: ilustrar de forma práctica qué es la abliteración, cómo se calcula la dirección de rechazo y por qué una intervención parcial de capas no equivale a un modelo sin sesgos.
- Traducción y asistentes bilingües en/zh: prototipos de traducción o atención al cliente para el mercado chino, siempre con revisión humana dada la ausencia de garantías de seguridad.
- Ajuste fino supervisado en laboratorio: punto de partida para estudiar cómo se recupera o se pierde el comportamiento alineado tras un SFT/DPO posterior sobre un modelo previamente abliterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 642 GB solo de pesos (320,8B × 2 bytes), más overhead de activaciones y caché KV; requiere 8×H100 80 GB como mínimo teórico y, en la práctica, 8×H200 141 GB o un nodo multi-GPU con NVLink.
- VRAM estimada en Q8: del orden de 340-360 GB; encaja en 6×H100 80 GB o 3×H200 141 GB.
- VRAM estimada en UD-Q4_K_XL: del orden de 180-200 GB; viable en 3×H100 80 GB o 2×H200 141 GB.
- Cuantizaciones de 2-3 bits (no documentadas en el repositorio): permitirían bajar a ~90-120 GB, es decir, 2×A100 80 GB o 1×H200, con pérdida de calidad no cuantificada.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090; solo es posible con offloading masivo a RAM del sistema (200 GB o más) y velocidad de generación muy reducida.
- Opciones de despliegue: llama.cpp (versión con soporte para GLM-5.3-Flash; el autor referencia la rama `glm5next` del fork de unslothai) para GGUF; transformers para los safetensors. Soporte en vLLM, TGI u Ollama no está confirmado en la información disponible, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponible. En un modelo de este tamaño, el rendimiento estará dominado por el ancho de banda de memoria y el número de GPUs; se recomienda medirlo en el hardware objetivo antes de cualquier planificación.
- Almacenamiento: el repositorio completo ocupa 1.559 GB, por lo que conviene descargar únicamente el fichero GGUF o el shard necesarios (el autor indica que basta con descargar el primer fichero de cada versión cuantizada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| 0xSojalSec/GLM-5.3-Flash-abliterated (este) | ~320,8B | 262.144 tokens (config. documentada) | Sí (image-text-to-text) | MIT | Re-subida, 0 descargas en el momento de la consulta |
| zai-org/GLM-5.3-Flash (base) | ~320,8B | no disponible en la información | Sí (image-text-to-text) | no disponible en la información | Modelo original, con filtrado de rechazos |
| huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF | ~320,8B | 262.144 tokens (config. documentada) | Sí | MIT (según la model card) | Origen real de la ficha y de los GGUF; misma intervención en capas 15-35 |
| unsloth/GLM-5.3-Flash-GGUF | ~320,8B | no disponible en la información | Sí | no disponible en la información | Repositorio de cuantizaciones de referencia, sin abliterar |

No se dispone en la información proporcionada de datos de rendimiento (MMLU, HumanEval, GSM8K u otros) que permitan comparar cualitativamente este modelo con alternativas de su misma categoría, ni de especificaciones de modelos de ~300B de otros fabricantes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el propio autor advierte de riesgo de generar contenido sensible, controvertido o inapropiado; no es apto para aplicaciones públicas, menores o entornos con requisitos altos de seguridad.
- Abliteración parcial: solo se modifican las capas 15 a 35 y ningún módulo experto, por lo que la eliminación de rechazos es incompleta y puede comportarse de forma inconsistente según el tipo de petición y el experto activado.
- Model card no original: el repositorio de 0xSojalSec reproduce la ficha de huihui-ai y no documenta qué ha cambiado respecto a ella; conviene verificar la integridad de los pesos antes de usarlos.
- Sin métricas de degradación: no se publica ninguna evaluación de cuánto empeora el modelo en razonamiento, código o matemáticas tras la abliteración, ni de la pérdida de calidad asociada a la cuantización UD-Q4_K_XL.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Riesgo de alucinación: no cuantificado en la información disponible; en modelos multimodales de gran tamaño la generación de descripciones visuales incorrectas es un riesgo habitual que debe mitigarse con verificación.
- Licencia MIT declarada, pero la ficha recomienda limitar el uso a investigación, pruebas y entornos controlados, y exime de responsabilidad al autor original; el uso comercial conlleva riesgo legal y reputacional.
- Contexto de 262.144 tokens: en la práctica limitado por la VRAM disponible para la caché KV, que en un MoE de este tamaño es muy costosa; el valor real desplegable será inferior salvo en configuraciones multi-GPU amplias.
- Requiere versiones específicas de llama.cpp; una versión sin soporte para GLM-5.3-Flash fallará al cargar los GGUF.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia comunitaria de validación ni de reproducibilidad.
- Los resultados de búsqueda web asociados a esta consulta no contienen información técnica sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/0xSojalSec/GLM-5.3-Flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio GGUF de referencia: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Ficha de la que procede la model card (referenciada en el README): https://huggingface.co/huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Método de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Rama de llama.cpp con soporte GLM-5.3-Flash: https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
