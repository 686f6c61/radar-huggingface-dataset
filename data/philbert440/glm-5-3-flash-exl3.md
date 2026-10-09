# philbert440/GLM-5.3-Flash-EXL3

## Resumen

GLM-5.3-Flash-EXL3 es una cuantización de precisión mixta en formato EXL3 del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario philbert440. El objetivo declarado es empaquetar un modelo MoE de 321.000 millones de parámetros totales (unos 18.000 millones activos por token) para que quepa y funcione en cuatro GPU V100 de 32 GB, es decir, en hardware SM70 sin soporte nativo de tipos de precisión reducida modernos. La receta baja los expertos enrutados a 2 bpw (K2), sube a 3 bpw cinco capas concretas (4, 5, 7, 8 y 10) y a 4 bpw los expertos de la capa MTP, manteniendo en FP16 la atención, los expertos compartidos, el MLP denso, el lm_head y la torre de visión, con una tasa global de 2,12 bpw sin contar el head.

La particularidad técnica más relevante es que los pesos usan un orden de tiles específico para V100, registrado como `tile_order: sm70_colmajor` en `quantization_config`. Esto implica que no se pueden cargar con exllamav3 estándar (decodificaría los pesos de forma incorrecta) ni con el PR exllamav3#475, ya que este checkpoint es anterior al marcador por tensor que introduce dicho PR. El autor solo garantiza su funcionamiento en el fork 1Cat-vLLM sobre V100, aplicando los PR #1102 (cargador y kernels EXL3 para MoE) y #1125 (prefill rápido). No se ha publicado ninguna build en orden estándar (sm80).

El interés práctico del modelo es doble. Por un lado, permite ejecutar un MoE de 321B cuantizado a 2 bits con una fidelidad medida frente al original FP8 de KL media 0,132 y 87,8 % de coincidencia top-1 al predecir el siguiente token. Por otro, ofrece un caso poco frecuente de cuantización agresiva orientada a hardware antiguo con decodificación especulativa mediante el head MTP integrado, alcanzando unos 76 tok/s de decodificación en cuatro V100 con tres tokens de borrador. La licencia declarada en el repositorio es MIT, y el número de descargas registrado es muy bajo (8), por lo que se trata de una publicación reciente y con poca validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag de arquitectura `glm5_next`. Atención dispersa tipo MLA (kernel asociado en el PR #1092) y head MTP para decodificación especulativa. Incluye torre de visión |
| Parametros totales | 321.000 millones (321B) según la model card del autor: 311,8B pesos de expertos EXL3 + 9,6B sin cuantizar. El Hub reporta 51.959.863.134 elementos tensoriales almacenados, porque un tensor EXL3 se guarda como palabras trellis int16 empaquetadas |
| Parametros activos | ~18.000 millones (18B) por token |
| Longitud de contexto | 131.072 tokens en la configuración de servicio empleada en las pruebas del autor; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | EXL3 con codebook `mcg`: expertos enrutados a 2 bpw (K2) en la mayoría de capas y 3 bpw (K3) en las capas 4, 5, 7, 8 y 10; expertos de la capa MTP a 4 bpw; FP16 en expertos compartidos, atención, MLP denso, eh_proj y lm_head; FP16 o dtype de origen en gates, norms, routers, hyper-connections, embeddings y torre de visión. Bitrate global de 2,12 bpw excluyendo el head |
| Idiomas soportados | no disponible |
| Licencia | MIT (según el repositorio) |
| Formato de pesos | safetensors (EXL3, `tile_order: sm70_colmajor`); no existe build en orden estándar sm80 |

Otros datos del repositorio: 104,1 GB de tamaño, 8 descargas, 0 likes, creado el 2026-10-08 y actualizado el 2026-10-09, pipeline declarado `image-text-to-text`, tag `conversational`, región `us`.

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 321B parámetros totales y aproximadamente 18B activos por token, publicado originalmente en FP8 por zai-org. La model card menciona explícitamente una atención MLA dispersa (el kernel del PR #1092 se describe como «FP32-softmax sparse-MLA kernel»), un head MTP para decodificación especulativa y una torre de visión que en esta cuantización se mantiene en FP16 o en el dtype de origen. La capa MTP también conserva sus expertos, pero cuantizados a 4 bpw.

No se trata de un reentrenamiento ni de un ajuste fino: es una cuantización de posentrenamiento construida a partir de la release FP8. La calibración usó 352 filas de 8.192 tokens y un esquema de Hessians por experto que mezcla la Hessiana de la calibración completa con una construida a partir de los tokens realmente enrutados a cada experto, con peso 0,5; el autor informa de que esto redujo el error de salida en expertos con datos retenidos en torno a un 14 %. El error de reconstrucción relativo medio por capa sobre las capas MoE es 0,011, con la peor capa en 0,043. La elección de qué capas suben a 3 bpw se hizo mediante un escaneo de divergencia KL por capa. No se documentan en la información disponible los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto conversacional: el repositorio declara el tag `conversational` y las pruebas del autor se hicieron con respuestas de chat de 700 tokens en modo greedy.
- Razonamiento matemático: en la evaluación del autor obtiene 0,985 de acierto estricto en un conjunto de 200 preguntas de gsm8k con presupuesto de 3.072 tokens de respuesta.
- Conocimiento factual: respondió correctamente las 75 preguntas factuales del conjunto de evaluación del autor (puntuación 1,000).
- Gestión de contexto largo: la configuración de servicio soporta 131.072 tokens; el autor reporta una prueba de aguja en un contexto de 70,8K tokens superada en 55 segundos con la mejora de prefill del PR #1125.
- Codificación agéntica: en un conjunto privado de tres tareas reales de corrección de bugs evaluadas con los propios tests de los proyectos, superó dos de tres, igual que la API en la nube de GLM-5.3-Flash, con puntuación de juez inferior (17 frente a 20 sobre 30).
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y el checkpoint incluye una torre de visión en FP16. No hay más detalles sobre resolución, número de imágenes o tareas de visión soportadas.
- Decodificación especulativa con head MTP: capacidad de inferencia, no de modelado; el propio checkpoint incluye los expertos de la capa MTP cuantizados a 4 bpw.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte multilingüe: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Reutilización de clústeres V100 existentes: el caso de uso central de esta publicación es ejecutar un MoE de 321B en cuatro V100 de 32 GB con NVLink, evitando la migración a A100 o H100. Es adecuado porque toda la receta de cuantización y los kernels están diseñados específicamente para SM70 y para el orden de tiles `sm70_colmajor`.
- Corrección de bugs en producción con agentes: el autor validó tres tareas reales de corrección de errores evaluadas con los tests de los proyectos, con dos de tres superadas. Encaja en pipelines de CI donde el agente debe leer el repositorio, ejecutar tests y proponer un parche, con la ventaja de que el contexto largo (131.072 tokens) permite incluir ficheros y trazas extensas sin trocear.
- Asistente de razonamiento matemático y verificación de cálculos: con 0,985 en gsm8k-200 y decodificación greedy, es utilizable en tareas de resolución de problemas numéricos paso a paso, siempre que se acepte el coste de un MoE de gran tamaño servido en cuatro GPU.
- Atención al cliente con documentación extensa: la ventana de 131.072 tokens y el tag `conversational` permiten mantener conversaciones multi-turno con manuales o contratos largos dentro del contexto, evitando sistemas de recuperación en escenarios donde la coherencia global del documento importa.
- Análisis de documentos largos y búsqueda tipo aguja en pajar: el autor documenta una prueba de aguja a 70,8K tokens resuelta en 55 segundos de prefill, lo que habilita auditoría documental, revisión de normativa o extracción de datos en expedientes largos.
- Control de alucinaciones en generación factual: en el conjunto de 75 preguntas sobre entidades inexistentes (fármacos, lugares y artículos inventados), el modelo declinó responder en 73 de 75 casos. Es un perfil útil para asistentes que deban rechazar preguntas sin respuesta en lugar de fabricarla.
- Procesamiento de documentos escaneados o capturas: gracias al pipeline `image-text-to-text` y a la torre de visión incluida, puede abordar tareas de descripción de imagen o extracción de información a partir de entradas visuales combinadas con texto, aunque no se documentan detalles de rendimiento en visión.
- Servicio interactivo de baja latencia relativa para su hardware: con el head MTP y tres tokens de borrador alcanza unos 76 tok/s de decodificación por petición en cuatro V100, suficiente para interfaces de chat con un usuario simultáneo y con KV cache en FP8.

## Benchmarks y rendimiento

Fidelidad frente al original FP8 (divergencia KL y coincidencia top-1 en la predicción del siguiente token, sobre tres textos retenidos de 1.536 tokens cada uno: un README, un documento de diseño y un fichero Python; menor KL es mejor):

| Build | KL README | KL documento de diseño | KL Python | KL media | Top-1 media |
|---|---:|---:|---:|---:|---:|
| Primera build (todo K2) | 0,088 | 0,186 | 0,220 | 0,165 | 85,5 % |
| Build 2 | 0,096 | 0,200 | 0,231 | 0,176 | 85,4 % |
| Build 3 | 0,086 | 0,181 | 0,187 | 0,151 | 86,4 % |
| Esta release (build 4) | 0,070 | 0,139 | 0,188 | 0,132 | 87,8 % |

Benchmarks de tarea (gsm8k con 200 preguntas y coincidencia estricta, presupuesto de 3.072 tokens; 75 preguntas factuales y 75 sobre entidades inexistentes, juzgadas por grok-4.3; decodificación greedy):

| Modelo | Factual | Respuestas fabricadas (de 75) | gsm8k-200 |
|---|---:|---:|---:|
| GLM-5.3-Flash EXL3 2,1 bpw (este repositorio) | 1,000 | 2 | 0,985 |
| Qwen3.8-27B NVFP4, mejor variante del autor | 0,973 | 27 | 0,965 |
| Qwen3.8-27B NVFP4, Unsloth | 0,973 | 29 | 0,955 |

Codificación agéntica: 2 de 3 tareas reales de corrección de bugs superadas, igual que la API en la nube de GLM-5.3-Flash, con puntuación de juez de 17 sobre 30 frente a 20 sobre 30. El autor advierte que builds anteriores colapsaban en bucles de repetición a partir de 75K-100K tokens de contexto en estas tareas y que esta build no lo hizo con el arreglo de atención aplicado, pero con una única ejecución por tarea, por lo que lo califica de evidencia preliminar.

Rendimiento de inferencia (cuatro V100-SXM2-32GB con NVLink, TP4, una petición a la vez, KV cache en FP8):

| Modo de decodificación | tok/s de decodificación | Contexto máximo |
|---|---:|---:|
| Head MTP integrado, 3 tokens de borrador (recomendado) | ~76 | 131.072 |
| Head MTP integrado, 4 / 5 tokens de borrador | 70,4 / 65,9 | 131.072 |
| Sin especulación | ~48 | 131.072 |

Prefill, tiempo hasta el primer token con prompts únicos y sin reutilización de caché de prefijo:

| Prompt | Con el PR #1125 | Sin el PR #1125 |
|---|---:|---:|
| ~1,1K tokens | ~0,8 s (~1.250-1.475 tok/s) | ~1,8 s (~645 tok/s) |
| ~29K tokens | ~21 s (~1.390 tok/s) | ~94 s (~314 tok/s) |
| Prueba de aguja con 70,8K tokens | 55 s, superada | 266 s, superada |

## Requisitos de hardware

- VRAM y GPUs: el checkpoint está pensado para cuatro V100 de 32 GB (SXM2 con NVLink o PCIe). El tensor paralelismo TP4 requiere obligatoriamente las cuatro GPU. El repositorio ocupa 104,1 GB.
- Perfil de GPU: V100-SXM2-32GB, arquitectura SM70. El checkpoint usa orden de tiles `sm70_colmajor` y kernels nativos EXL3 para SM70 en 1Cat-vLLM. No se documenta soporte en A100, H100, RTX 4090 ni en ninguna otra GPU.
- GPU de consumo: no cabe. Un modelo de 321B parámetros totales con 104 GB de pesos en disco y 131.072 tokens de contexto excede cualquier GPU de consumo actual; se necesita un nodo de cuatro V100 de 32 GB como mínimo según el autor.
- Software: CUDA 12.8 y gcc/g++ 14. El autor recomienda compilar 1Cat-vLLM desde `main` más el PR #1102 (cargador y kernels EXL3 para MoE) y el PR #1125 (prefill rápido, que ya incluye el PR #1092, el kernel FP32-softmax sparse-MLA). El PR #1091 (decodificación especulativa MTP) ya está fusionado en `main`.
- Opciones de despliegue: únicamente 1Cat-vLLM sobre V100 según la información disponible. exllamav3 estándar no puede cargar este checkpoint porque desconoce el orden de tiles y decodificaría los pesos incorrectamente; el PR exllamav3#475 añade dicho orden al conversor, pero este checkpoint es anterior a su marcador por tensor y sigue sin poder cargarse. No se mencionan builds GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación de ~76 tok/s por petición con MTP y tres tokens de borrador, ~48 tok/s sin especulación; prefill de ~1.390 tok/s en prompts de ~29K tokens con el PR #1125 y tiempo hasta el primer token de ~0,8 s para ~1,1K tokens. Estas cifras corresponden a una sola petición simultánea.
- KV cache: configurada en FP8 en las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | gsm8k-200 | Factual | Fabricadas (de 75) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| GLM-5.3-Flash EXL3 2,1 bpw (este repo) | 321B totales, ~18B activos | 131.072 tokens en la config de prueba | 0,985 | 1,000 | 2 | MIT | Repositorio HF, 8 descargas, requiere 1Cat-vLLM sobre V100 |
| GLM-5.3-Flash FP8 (zai-org, modelo base) | 321B totales, ~18B activos | no disponible | no disponible | no disponible | no disponible | no disponible en la información consultada | Release FP8 en HuggingFace |
| GLM-5.3-Flash API en la nube | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Servicio en la nube; superó 2 de 3 tareas agénticas con 20/30 puntos de juez |
| Qwen3.8-27B NVFP4 (mejor variante del autor) | 27B | no disponible | 0,965 | 0,973 | 27 | no disponible | Cuantización NVFP4 del autor, también orientada a V100 |
| Qwen3.8-27B NVFP4 (Unsloth) | 27B | no disponible | 0,955 | 0,973 | 29 | no disponible | Cuantización publicada por Unsloth |

El propio autor advierte que la comparación con Qwen3.8-27B no debe leerse como una victoria, sino como evidencia de que la cuantización a 2 bits no le costó al modelo la ventaja que ya tenía por tamaño. No hay datos comparativos publicados frente a otros MoE de gran tamaño en la información disponible.

## Limitaciones y advertencias

- Compatibilidad de carga muy restringida: los pesos usan `tile_order: sm70_colmajor`; exllamav3 estándar decodifica los pesos de forma incorrecta y ni siquiera el PR exllamav3#475 permite cargar este checkpoint. Tampoco existe una build publicada en orden estándar sm80.
- Dependencia de un fork y de PRs no fusionados: el funcionamiento en V100 requiere 1Cat-vLLM compilado desde `main` con los PR #1102 y #1125. No es un artefacto listo para usar con el ecosistema estándar de inferencia.
- Pérdida de fidelidad por cuantización: frente al modelo original en FP8, la KL media es 0,132 (0,070 en README, 0,139 en documento de diseño y 0,188 en código Python) y la coincidencia top-1 media es del 87,8 %, lo que implica que aproximadamente uno de cada ocho tokens predichos difiere del modelo sin cuantizar.
- Riesgo de bucles de repetición en contextos muy largos: el autor reporta que builds anteriores colapsaban en repeticiones entre 75K y 100K tokens en tareas agénticas de código. Esta build no lo hizo en sus pruebas, pero se trata de una sola ejecución por tarea y de evidencia calificada como preliminar.
- Alucinación: en el conjunto del autor declinó 73 de 75 preguntas sobre entidades inexistentes, pero respondió de forma fabricada a 2 de ellas. No hay evaluación independiente de este comportamiento.
- Benchmarks autoevaluados: las pruebas factuales y de fabricación fueron juzgadas por grok-4.3, un modelo de otro proveedor, y el conjunto es pequeño (75 y 75 preguntas). gsm8k se limita a 200 preguntas. No hay resultados de MMLU, HumanEval ni otras evaluaciones estándar en la información disponible.
- Idiomas no declarados: el repositorio no especifica idiomas soportados ni cobertura multilingüe, lo que dificulta planificar despliegues fuera del inglés sin evaluación previa.
- Capacidades de visión sin datos: aunque el pipeline es `image-text-to-text` y hay torre de visión, no se publican métricas ni ejemplos de tareas multimodales en esta cuantización.
- Tool calling y uso agéntico no documentados formalmente: solo se menciona la prueba privada de tres tareas de corrección de bugs, sin especificación de formato de herramientas ni de protocolos soportados.
- Licencia: el repositorio declara MIT, pero no se proporciona en la información disponible la licencia del modelo base zai-org/GLM-5.3-Flash. Antes de un uso comercial conviene verificar los términos del modelo original, ya que la cuantización no sustituye a la licencia del artefacto del que deriva.
- Madurez y validación comunitaria muy bajas: 8 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros.
- Rendimiento medido en un escenario muy concreto: cuatro V100-SXM2-32GB con NVLink, TP4, una sola petición a la vez y KV cache en FP8. No hay datos de throughput con concurrencia, ni de despliegue en PCIe sin NVLink, ni de otras configuraciones de paralelismo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/philbert440/GLM-5.3-Flash-EXL3
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- PR 1CatAI/1Cat-vLLM#1102 (cargador y kernels EXL3 para MoE): https://github.com/1CatAI/1Cat-vLLM/pull/1102
- PR 1CatAI/1Cat-vLLM#1125 (prefill rápido, incluye el PR #1092): https://github.com/1CatAI/1Cat-vLLM/pull/1125
- PR 1CatAI/1Cat-vLLM#1092 (kernel FP32-softmax sparse-MLA): https://github.com/1CatAI/1Cat-vLLM/pull/1092
- PR 1CatAI/1Cat-vLLM#1091 (decodificación especulativa MTP, fusionado en `main`): https://github.com/1CatAI/1Cat-vLLM/pull/1091
- PR turboderp-org/exllamav3#475 (orden de tiles en el conversor): https://github.com/turboderp-org/exllamav3/pull/475
