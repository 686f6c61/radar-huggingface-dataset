# mradermacher/lugbara-english-translator-GGUF

## Resumen

El modelo `lugbara-english-translator` es un sistema de traducción automática especializado en el par de idiomas lugbara-inglés, desarrollado originalmente por el usuario ckuma y publicado en Hugging Face. La versión aquí descrita es una cuantización GGUF realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo cuenta con 582.401.280 parámetros (aproximadamente 582 millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para una tarea concreta.

El problema que resuelve es la brecha de cobertura en traducción automática para lenguas de bajos recursos. El lugbara (código `lgg`) es una lengua nilótica hablada por varios millones de personas en Uganda y la República Democrática del Congo, y apenas cuenta con recursos digitales o modelos de traducción de calidad. Este modelo se entrena sobre el dataset `Sunbird/salt` y está etiquetado también con luganda (`lg`), lo que sugiere un enfoque multilingüe dentro del ámbito ugandés.

La relevancia actual radica en que las cuantizaciones GGUF permiten ejecutar el modelo en CPU o GPU de gama baja, algo crítico para organizaciones locales, ONG y proyectos de preservación lingüística que no disponen de infraestructura de alto rendimiento. La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, según `library_name: transformers`; detalles no especificados) |
| Parametros totales | 582.401.280 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés), lg (luganda), lgg (lugbara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `ckuma/lugbara-english-translator`. Los metadatos indican que se trata de un modelo de la librería `transformers` con 582 millones de parámetros, lo que sugiere una arquitectura transformer encoder-decoder o decoder-only de tamaño compacto, típica de modelos de traducción especializados. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

Respecto al entrenamiento, la model card únicamente referencia el dataset `Sunbird/salt` como fuente de datos. No se indica el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documenta el proceso de alineación ni la metodología de evaluación. El autor original está vinculado a la Universidad de Muni (Uganda), según las etiquetas del repositorio.

## Capacidades

- Traducción automática entre lugbara (`lgg`) e inglés (`en`), y presumiblemente también con luganda (`lg`) dado el etiquetado del modelo.
- Generación de texto en el ámbito de la traducción; no se documentan capacidades generales de razonamiento o generación libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a los tres idiomas etiquetados (en, lg, lgg).
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Traducción de documentación administrativa y sanitaria: el modelo puede traducir folletos, formularios y guías del inglés al lugbara para comunidades locales en Uganda, gracias a su tamaño reducido que permite ejecución en equipos modestos.
- Atención al ciudadano en servicios públicos: integración en portales o chatbots de oficinas gubernamentales para ofrecer información en lugbara a hablantes que no dominan el inglés, con despliegue en servidores de baja capacidad mediante GGUF.
- Preservación y digitalización lingüística: traducción de textos históricos, relatos orales transcritos y material educativo en lugbara hacia el inglés para su catalogación en archivos digitales.
- Herramientas de traducción para ONG y misiones humanitarias: comunicación con poblaciones lugbarahablantes en contextos de ayuda humanitaria, donde el acceso a internet o a APIs comerciales puede ser limitado.
- Subtitulado y localización de contenido audiovisual: traducción de guiones y subtítulos entre inglés y lugbara para medios locales o campañas de comunicación en salud pública.
- Educación bilingüe: apoyo a docentes y materiales escolares que necesitan versiones en lugbara de contenidos curriculares redactados en inglés, ejecutando el modelo en ordenadores personales con cuantización Q4_K_M.
- Investigación lingüística comparada: generación de pares de traducción para estudios sobre lenguas nilóticas y bantúes, aprovechando la cobertura de lugbara y luganda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (Q2_K) y 1,3 GB (f16) según la cuantización elegida, tal como indican los tamaños de archivo del repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones más pequeñas; una RTX 3060, RTX 4060 o superior permite ejecutar la versión f16 con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria compartida; también es viable en CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), y servidores compatibles con GGUF; el modelo base es compatible con `transformers`.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 582M parámetros, se espera una latencia baja en hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lugbara-english-translator (este) | 582M | no disponible | en, lg, lgg | Apache 2.0 | GGUF, safetensors |
| NLLB-200 distilled 600M | 600M | 512 tokens | 200 idiomas (incluye lenguas africanas) | CC-BY-NC 4.0 | safetensors, GGUF |
| M2M-100 418M | 418M | 1024 tokens | 100 idiomas | MIT | safetensors |
| Helsinki-NLP opus-mt-en-lg | ~77M | 512 tokens | en, lg | CC-BY 4.0 | safetensors |

El modelo se posiciona frente a alternativas multilingües genéricas como NLLB o M2M-100, que cubren más idiomas pero no están específicamente ajustados para lugbara. La licencia Apache 2.0 es más permisiva que la CC-BY-NC de NLLB para uso comercial. No se dispone de datos de rendimiento comparativo para evaluar la calidad relativa.

## Limitaciones y advertencias

- No se han publicado métricas de calidad de traducción (BLEU, chrF, COMET), por lo que se desconoce su precisión real frente a alternativas.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados (técnico, legal, médico) dada la escasez de corpus de entrenamiento para lugbara.
- Cobertura limitada a tres idiomas; no es un modelo multilingüe general.
- Longitud de contexto no documentada, lo que impide planificar su uso en documentos largos sin pruebas previas.
- El modelo base no incluye información sobre sesgos; es previsible que herede sesgos del corpus `Sunbird/salt`, de composición no detallada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del dataset de entrenamiento para uso comercial.
- Es una cuantización estática; no se ofrecen versiones con imatrix, lo que puede afectar ligeramente a la calidad en cuantizaciones bajas (Q2_K, Q3_K).
- El repositorio no registra descargas ni interacciones, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lugbara-english-translator-GGUF
- Modelo base: https://huggingface.co/ckuma/lugbara-english-translator
- Página de descargas del cuantizador: https://hf.tst.eu/model#lugbara-english-translator-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Sunbird/salt
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
