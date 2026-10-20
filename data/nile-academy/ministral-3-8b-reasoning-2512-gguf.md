# nile-academy/ministral-3-8b-reasoning-2512-gguf

## Resumen

`nile-academy/ministral-3-8b-reasoning-2512-gguf` es una conversión al formato GGUF del modelo `mistralai/Ministral-3-8B-Reasoning-2512`, publicado originalmente por Mistral AI el 2 de diciembre de 2025. El repositorio lo mantiene Nile Academy como espejo de artefactos o conversión de formato explícitamente registrada, sin entrenamiento adicional: los pesos, la licencia y las condiciones de uso del modelo original siguen rigiendo el contenido.

El modelo base es un modelo de razonamiento de aproximadamente 8.900 millones de parámetros según la model card del editor (8.489.553.920 parámetros medidos en safetensors), distribuido bajo licencia Apache 2.0. El repositorio incluye cuatro artefactos: un proyector multimodal en BF16 (mmproj), y las cuantizaciones Q4_K_M, Q5_K_M y Q8_0 en GGUF, lo que permite ejecución local en llama.cpp, Ollama y herramientas compatibles sin depender de GPUs de datacenter.

Su relevancia ahora es doble: por un lado, ofrece una vía de despliegue en hardware de consumo para un modelo con puntuaciones altas declaradas por el editor en razonamiento matemático, científico y de código (AIME25 78,7 %, GPQA Diamond 66,8 %, LiveCodeBench 61,6 %); por otro, la propia model card advierte de que esas cifras corresponden al modelo fuente y no a estas cuantizaciones, y de que la calidad de la cuantización no está cualificada. Es, por tanto, un artefacto útil para evaluación local, pero no una release validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; la documentación proporcionada no detalla la arquitectura del modelo base (Mistral AI) |
| Parametros totales | 8.489.553.920 (safetensors); 8.918.026.240 en el modelo fuente según la model card, incluyendo embeddings y modalidades de origen |
| Parametros activos | No aplica; no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (proyector mmproj, 0,858 GB), Q4_K_M (5,199 GB), Q5_K_M (6,059 GB), Q8_0 (9,029 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (preservada en el fichero LICENSE del repositorio) |
| Formato de pesos | GGUF |
| Modelo base | mistralai/Ministral-3-8B-Reasoning-2512 (revisión fijada `81eaece1948f3875421d9a45bc55487d10e2d894`) |
| Tamano del repositorio | 21,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion del original | 2025-12-02 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base: no se especifican tipo de transformer, mecanismos de atención, número de capas ni estrategia de entrenamiento. Lo que sí consta es el recuento de parámetros (8.489.553.920 en safetensors; 8.918.026.240 en la ficha del editor, cifra que incluye embeddings y "modalidades de origen") y la presencia de un fichero `mmproj` en BF16, un proyector multimodal habitual en modelos que aceptan entradas visuales. La model card no confirma qué modalidades adicionales soporta el modelo ni cómo se integran en el pipeline.

Este repositorio concreto no añade entrenamiento: Nile Academy declara un papel de "espejo oficial de artefactos o conversión de formato explícitamente registrada", con procedencia preservada en `provenance/` y recibos de conversión en `model-metadata.json`. No hay datos sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones como decodificación especulativa o atención lineal. Las puntuaciones publicadas se obtuvieron en "modo reasoning", lo que sugiere que el modelo base expone un modo de razonamiento extendido, pero la documentación disponible no detalla su funcionamiento ni sus parámetros de muestreo.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `text-generation` y `conversational`, con plantilla de chat propia del modelo base.
- Razonamiento matemático: puntuación declarada por el editor de 78,7 % en AIME25, en modo reasoning y con el protocolo del editor.
- Conocimiento científico de nivel avanzado: 66,8 % en GPQA Diamond según el editor.
- Generación y razonamiento sobre código: 61,6 % en LiveCodeBench (versión no especificada), según el editor.
- Posible entrada multimodal: el repositorio incluye un proyector `mmproj` en BF16, lo que sugiere soporte de visión, aunque la model card no lo confirma ni detalla las modalidades.
- Tool calling / function calling: la model card menciona cualificación pendiente de "chat/tool/template" nativo de Wekala; los tool calls se describen como propuestas sujetas a los permisos de la aplicación consumidora. No hay validación publicada.
- Capacidades multilingües: no disponible; no se declara ningún listado de idiomas, y la propia model card propone evaluar tareas multilingües y de árabe antes de recomendar el modelo.
- Modo de razonamiento: las benchmarks publicadas se etiquetan como "reasoning", pero no se documentan los modos ni los ajustes concretos.

## Casos de uso

- Asistente de razonamiento en local: con la cuantización Q4_K_M (5,2 GB) puede ejecutarse en una GPU de consumo de 12 GB y dar respuestas razonadas sin enviar datos a la nube, algo relevante para entornos con requisitos de privacidad.
- Resolución de problemas matemáticos y verificación de resultados: el 78,7 % declarado en AIME25 lo sitúa como candidato para tutores automáticos o generación de problemas con solución paso a paso, siempre que se valide la cuantización con evaluaciones pareadas.
- Soporte a investigación científica: con un 66,8 % en GPQA Diamond, puede emplearse como asistente de revisión de literatura o de preguntas de dominio en física, química y biología, con revisión humana obligatoria.
- Asistencia a programación: el 61,6 % en LiveCodeBench permite integrarlo en tareas de generación de tests, explicación de código o refactorización dentro de un IDE, ejecutando el modelo en la estación de trabajo del desarrollador con Q5_K_M o Q8_0.
- Procesamiento de documentos escaneados o con figuras: si se confirma el soporte visual del proyector `mmproj`, el modelo podría responder preguntas sobre capturas, gráficos o páginas maquetadas combinando texto e imagen en una sola pasada.
- Agentes con tool calling en entorno controlado: la arquitectura de plantilla de chat y la mención a herramientas permiten prototipar agentes multi-paso, pero cualquier llamada debe pasar por la capa de permisos de la aplicación, dado que el repositorio no está cualificado para ello.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_M y Q5_K_M hacen viable ejecutar el modelo en portátiles con GPU de 8-16 GB mediante llama.cpp u Ollama, para tareas de análisis y redacción asistida.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece tres niveles (Q4_K_M, Q5_K_M, Q8_0) más el proyector BF16, lo que lo convierte en un banco de pruebas para medir la pérdida de calidad por cuantización en tareas de instrucción, conocimiento, matemáticas y multilingüe.

## Benchmarks y rendimiento

Resultados declarados por el editor del modelo fuente (Mistral AI). No son mediciones de Nile Academy sobre estos ficheros cuantizados, no están normalizados entre modelos y los arneses, la precisión y los ajustes de razonamiento pueden diferir.

| Benchmark | Puntuacion (%) | Modo / ajustes |
|---|---:|---|
| AIME25 | 78,7 | Reasoning; protocolo del editor; no medido sobre estas cuantizaciones |
| GPQA Diamond | 66,8 | Reasoning; protocolo del editor; no medido sobre estas cuantizaciones |
| LiveCodeBench (version no especificada) | 61,6 | Reasoning; protocolo del editor; no medido sobre estas cuantizaciones |

No se han publicado resultados de benchmarks sobre los ficheros GGUF de este repositorio, ni datos de latencia o throughput. La model card indica explícitamente que la cualificación amplia de calidad de cuantización de Wekala está en estado "not qualified" y que no se emite ninguna afirmación de "pérdida de calidad no significativa".

## Requisitos de hardware

- VRAM estimada para Q4_K_M: 5,2 GB de pesos; en torno a 6-8 GB de VRAM total contando caché KV y buffers, en función de la longitud de contexto. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070.
- VRAM estimada para Q5_K_M: 6,1 GB de pesos; aproximadamente 7-9 GB en ejecución. Cómodo en GPUs de 12 GB o más.
- VRAM estimada para Q8_0: 9,0 GB de pesos; alrededor de 10-12 GB en ejecución. Requiere 12 GB como mínimo y 16 GB para contexto largo.
- VRAM estimada para BF16 completo: unos 17 GB de pesos (8,49 B de parámetros a 2 bytes) más 0,86 GB del proyector mmproj, es decir, en torno a 18 GB antes de caché KV. Necesita 24 GB (RTX 3090, RTX 4090, A100 40 GB) o más.
- Advertencia del editor: el tamano de los pesos excluye el estado de contexto, los buffers de trabajo y el margen del driver. La model card indica que la operación sostenida en 8 GB de VRAM requiere perfiles medidos propios y que no existe cualificación de ajuste a 8 GB.
- GPUs recomendadas: RTX 3060 12 GB y RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4070 Ti Super 16 GB o RTX 4080 para Q8_0; RTX 4090, A100 o H100 para BF16 y para servir varias peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y koboldcpp son los backends naturales para GGUF. El soporte de GGUF en vLLM es experimental y TGI no está orientado a este formato. La model card indica que no hay instalación automática de backend.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.
- Movilidad y navegador: el editor declara que la cualificación para móvil y navegador está pendiente; CPU y CUDA se describen como backends de ejecución del mismo fichero de pesos, no como modelos distintos.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento general y no están verificados en la información proporcionada; conviene contrastarlos antes de publicarlos.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Benchmarks comparables |
|---|---:|---|---|---|---|
| Ministral-3-8B-Reasoning-2512 (este repositorio, GGUF) | ~8,5 B | No disponible | Apache 2.0 | Si (Q4_K_M, Q5_K_M, Q8_0, mmproj BF16) | AIME25 78,7; GPQA Diamond 66,8; LiveCodeBench 61,6 (declarados por el editor, no medidos en estas cuantizaciones) |
| Qwen2.5-7B-Instruct | ~7,6 B | 32k nativo, ampliable (no verificado) | Apache 2.0 | Si, ecosistema amplio | No disponible en la informacion proporcionada |
| Llama 3.1 8B Instruct | ~8,0 B | 128k (no verificado) | Llama 3.1 Community License | Si, ecosistema amplio | No disponible en la informacion proporcionada |
| Mistral Small 3 (24B) | ~24 B | 32k (no verificado) | Apache 2.0 | Si | No disponible en la informacion proporcionada |

La comparación relevante aquí es de encaje, no solo de puntuación: este modelo ofrece un perfil de razonamiento fuerte en matemáticas y ciencia con licencia Apache 2.0 y cuantizaciones listas para hardware de consumo, mientras que alternativas de mayor tamano como Mistral Small 3 exigen más VRAM y las de licencia permisiva con contexto largo declarado, como Qwen2.5 o Llama 3.1, no publican en esta información cifras equivalentes en AIME25 o GPQA Diamond.

## Limitaciones y advertencias

- Calidad de cuantización no cualificada: la model card declara explícitamente "not qualified" y rechaza cualquier afirmación de pérdida de calidad no significativa. Q4_K_M requiere evaluación pareada frente a Q8_0 antes de usarse en tareas sensibles.
- Benchmarks no representativos de estos ficheros: las cifras de AIME25, GPQA Diamond y LiveCodeBench corresponden al modelo fuente con el protocolo del editor, no a las cuantizaciones GGUF de este repositorio.
- Idiomas no documentados: no se declara lista de idiomas; el editor sugiere evaluar tareas multilingües y de árabe antes de recomendar el modelo. El rendimiento en castellano no está verificado.
- Longitud de contexto desconocida: no se indica la ventana máxima, lo que impide planificar cargas de contexto largo o estimar con precisión la VRAM necesaria.
- Riesgo de alucinación: la model card advierte de que el modelo puede producir salidas incorrectas o inseguras. Es un modelo de razonamiento, no un sistema verificado; requiere validación humana en dominios técnicos y científicos.
- Tool calling no validado: las llamadas a herramientas se describen como propuestas sujetas a la admisión y a los permisos de la aplicación consumidora; no hay cualificación publicada del pipeline de chat, herramientas y plantilla.
- Sin cualificación en 8 GB de VRAM ni en móvil o navegador: cualquier afirmación de que cabe en GPUs de 8 GB o en dispositivos móviles carece de perfil medido.
- Licencia: los pesos son Apache 2.0 y permiten uso comercial, pero el repositorio no concede derechos sobre el SDK de Wekala ni sobre marcas asociadas. Las tarjetas y avisos del editor original se conservan en `provenance/`.
- Procedencia y madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-10-19, sin historial de uso. Es un espejo o conversión, no una release del editor original, y conviene verificar los hashes SHA-256 recogidos en `model-metadata.json`.
- Fechas y versionado: el nombre del modelo incluye "2512" y la publicación original se fecha el 2025-12-02, mientras que el repositorio aparece creado en octubre de 2026; conviene comprobar la correspondencia exacta con la revisión fijada antes de desplegar.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nile-academy/ministral-3-8b-reasoning-2512-gguf
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- README del modelo base en la revisión fijada: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512/blob/81eaece1948f3875421d9a45bc55487d10e2d894/README.md
- Anuncio de Mistral 3 (fuente de la fecha de publicación): https://mistral.ai/news/mistral-3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a entidades no relacionadas (el río Nilo, una consultora y una marca de ropa), por lo que se han descartado.
