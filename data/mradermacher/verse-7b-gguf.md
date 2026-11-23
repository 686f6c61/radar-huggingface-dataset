# mradermacher/VERSE-7B-GGUF

## Resumen

VERSE-7B-GGUF es la versión cuantizada en formato GGUF del modelo VERSE-7B, desarrollado originalmente por Aeronix-zzz y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje y visión (vision-language) construido sobre la arquitectura Qwen2.5-VL, con aproximadamente 7.615 millones de parámetros (7,6B) y orientado explícitamente al razonamiento espacial (spatial reasoning). Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto.

La relevancia de esta ficha radica en que el repositorio GGUF es la vía práctica para desplegar el modelo en hardware de consumo mediante llama.cpp u Ollama, algo imposible con los pesos originales en safetensors para la mayoría de equipos. El autor de la cuantización ofrece un abanico amplio de niveles (desde Q2_K hasta f16, más los suplementos multimodales mmproj), lo que permite ajustar el equilibrio entre calidad y huella de memoria.

La información pública disponible sobre el modelo base es escasa: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Los tags de la model card apuntan a un entrenamiento con GRPO (Group Relative Policy Optimization) y a una estrategia de self-evolve, lo que sugiere un enfoque de aprendizaje por refuerzo sobre tareas de razonamiento espacial, pero no se aportan métricas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2.5-VL (vision-language) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura de Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Los tags del repositorio indican especialización en razonamiento espacial (spatial-reasoning) y el uso de GRPO, un algoritmo de aprendizaje por refuerzo con ventajas relativas de grupo, junto con una metodología de self-evolve que probablemente genera y filtra datos de entrenamiento de forma iterativa. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de SFT, RLHF o DPO más allá de la referencia a GRPO.

La cuantización la realiza mradermacher con su pipeline habitual (quantize_version 2, convert_type hf), generando cuantizaciones estáticas sin imatrix ponderada en el momento de la publicación. El repositorio incluye los ficheros mmproj necesarios para el procesamiento de imágenes en llama.cpp, lo que confirma que la capacidad visual se preserva en el despliegue GGUF.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imágenes y razonamiento visual (vision-language), con especial énfasis en razonamiento espacial: relaciones entre objetos, posiciones y geometría de la escena.
- Razonamiento multi-paso, presumiblemente reforzado mediante GRPO y self-evolve.
- Soporte de conversaciones multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su exposición como API.
- Capacidad multimodal preservada en GGUF mediante los ficheros mmproj.
- No se documenta soporte explícito de tool calling, function calling ni agentes.
- No se documenta soporte de audio ni modo thinking explícito.

## Casos de uso

- Razonamiento espacial sobre imágenes: el modelo puede analizar fotografías o capturas y responder preguntas sobre posiciones relativas, distancias y disposición de objetos, aprovechando su entrenamiento específico en spatial-reasoning.
- Asistencia en robótica y navegación: interpretación de escenas visuales para generar descripciones estructuradas del entorno que alimenten planificadores de movimiento, gracias a su combinación de visión y razonamiento.
- Análisis de documentos con layout complejo: extracción de relaciones espaciales en facturas, planos o diagramas donde la posición del contenido importa tanto como el texto.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU de datacenter, usando cuantizaciones Q4_K_M (4,8 GB) o Q5_K_M (5,5 GB) más el mmproj.
- Prototipado de aplicaciones vision-language: integración vía endpoints compatibles para validar producto antes de escalar a modelos mayores, con coste de infraestructura mínimo.
- Investigación en RL para modelos multimodales: al estar entrenado con GRPO y self-evolve, sirve como referencia reproducible para estudiar estas técnicas sobre una base Qwen2.5-VL de 7B.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantización más dos mmproj, útil para medir la degradación de calidad en tareas espaciales según el bit-width.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~3,1 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Añadir entre 1,0 y 1,5 GB si se usa la capacidad visual (mmproj).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones Q4 a Q8; A100 o H100 solo si se busca f16 con contexto largo o alto throughput.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB con Q4_K_M o Q5_K_M; una GPU de 8 GB puede alojar Q4_K_S pero con margen ajustado para KV cache.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI si se usan los safetensors originales.
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VERSE-7B (este) | 7,6B | no disponible | Apache 2.0 | GGUF + safetensors | Especializado en razonamiento espacial, base Qwen2.5-VL |
| Qwen2.5-VL-7B | 7B aprox. | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF de terceros | Modelo base generalista de visión-lenguaje |
| InternVL2-8B | 8B aprox. | no disponible en esta ficha | MIT (según versión) | safetensors, GGUF de terceros | Alternativa multimodal de tamaño similar |
| LLaVA-OneVision-7B | 7B aprox. | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF de terceros | Enfoque generalista en visión-lenguaje |

Los datos de contexto y rendimiento de los modelos comparables no están disponibles en la información proporcionada; la comparación se limita a tamaño, licencia y formato de distribución.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- No hay benchmarks publicados, por lo que no puede afirmarse superioridad frente a Qwen2.5-VL-7B u otras alternativas en tareas generales.
- Riesgo de alucinación inherente a modelos de 7B, especialmente en descripciones visuales detalladas y razonamiento espacial fino.
- La cuantización introduce degradación de calidad; Q2_K y Q3_K_M están marcadas por el autor como de menor calidad.
- Las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación, lo que puede reducir la calidad respecto a otras distribuciones GGUF.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar condiciones de Qwen2.5-VL; conviene verificar la cadena de licencias antes de producción.
- El repositorio tiene muy poca tracción (550 descargas, 0 likes) y la información del modelo base es escasa; tratarlo como experimental.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VERSE-7B-GGUF
- Modelo base: https://huggingface.co/Aeronix-zzz/VERSE-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#VERSE-7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
