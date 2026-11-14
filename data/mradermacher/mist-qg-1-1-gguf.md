# mradermacher/MIST-QG-1.1-GGUF

## Resumen

MIST-QG-1.1-GGUF es la versión cuantizada en formato GGUF del modelo olaverse/MIST-QG-1.1, un modelo especializado en generación de preguntas (question generation) y generación de consultas (query generation) para la construcción de datos sintéticos y sistemas de recuperación de información. El modelo original ha sido desarrollado por olaverse y esta versión ha sido producida por mradermacher, un conocido cuantizador de la comunidad open source que publica conversiones GGUF de modelos populares.

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de modelos pequeños-medianos optimizados para tareas específicas. Su rasgo más destacable es el soporte declarado de más de 150 idiomas, con especial énfasis en lenguas de bajos recursos y lenguas africanas, lo que lo convierte en una herramienta relevante para pipelines multilingües de generación de datos sintéticos y aumento de datasets de recuperación.

La relevancia actual del modelo radica en su enfoque: en lugar de competir como un modelo de propósito general, se posiciona como un componente especializado dentro de arquitecturas RAG (retrieval-augmented generation) y de generación de datos de entrenamiento. La disponibilidad de cuantizaciones GGUF desde Q2_K hasta f16 permite desplegarlo en hardware de consumo, lo que facilita su integración en flujos de trabajo locales y en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | más de 150 idiomas, incluyendo en, es, fi, id, te, fa, is, hi, he, lv, sr, et, no, sk, ru, ja, ur, sl, pt, nl, lt, mr, zh, tr, ms, de, ca, bn, sv, da, ro, hr, uz, az, fr, bg, ta, hu, ka, sw, kk, uk, af, pl, km, arb, ko, ga, sq, bs, kn, ml, cs, gu, gl, vi, mk, th, lb, cy, am, eu, mt, pa, ar, be, mn, mg, si, ky, la, ckb, ht, tt, tk, gd, fil, tg, sa, ne, it, or, yi, ceb, as, su, ku, jv, lo, fy, ilo, gom, eo, ps, sd, so, nn, ug, dv, yo, ha, sn, rw, lg, ig, nso, rn, om, ti, ny, tn, ee, zu, xh, wo, war, pcm, ln, st, qu, arz, pnb, mfe, nd, ts, kea, kab, ve, el, lua, kri, ki, fat, ss, tum, luo, bem, my, br, hy, bm, mos, fon, plt, kbp, ba, pbt, dyu, fuv, zsm, oc, npi, nds, ary, ia, azb, pms, sco, sdh, lad, bi, rm, io, sm, myv, sc, lvs |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los datos disponibles indican que se trata de un modelo de 4.205.751.296 parámetros con pesos en safetensors en su versión original, y que la versión GGUF incluye archivos mmproj, lo que sugiere capacidades multimodales (probablemente visión) integradas mediante un proyector multimodal. La model card no especifica si la arquitectura es un transformer denso, un modelo híbrido o alguna variante con atención lineal.

Respecto al entrenamiento, la información disponible es igualmente escasa: no se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Los tags del modelo (question-generation, query-generation, synthetic-data, retrieval, controllable-generation, cross-lingual) indican que el entrenamiento se ha orientado a tareas de generación controlada de preguntas y consultas en contextos multilingües y de recuperación de información, pero no se aportan detalles técnicos sobre el proceso.

## Capacidades

- Generación de preguntas (question generation) a partir de contextos o pasajes, orientada a la creación de datasets de entrenamiento y evaluación.
- Generación de consultas (query generation) para sistemas de recuperación de información y pipelines RAG.
- Generación controlable (controllable generation), según los tags del modelo, lo que sugiere la posibilidad de condicionar el tipo o estilo de pregunta generada.
- Soporte multilingüe amplio: más de 150 idiomas declarados, con cobertura destacada de lenguas de bajos recursos y lenguas africanas (yoruba, hausa, swahili, amárico, zulú, xhosa, entre otras).
- Generación cruzada entre idiomas (cross-lingual), útil para traducción de consultas y aumento de datasets multilingües.
- Capacidades multimodales: la presencia de archivos mmproj en la versión GGUF sugiere soporte de entrada visual, aunque no se detalla en la model card.
- No se ha documentado soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de datasets sintéticos para entrenamiento de modelos de QA: el modelo puede generar pares pregunta-respuesta a partir de corpus de documentos, ampliando datasets de entrenamiento en dominios con pocos datos anotados.
- Aumento de datos para sistemas RAG: a partir de pasajes de una base de conocimiento, el modelo genera consultas plausibles que permiten entrenar o evaluar el recuperador (retriever) de un pipeline RAG.
- Expansión de consultas en motores de búsqueda multilingües: dado un documento en un idioma de bajos recursos, el modelo puede producir consultas equivalentes en varios idiomas para mejorar la cobertura del índice.
- Creación de benchmarks de evaluación multilingües: generación automática de preguntas de evaluación en más de 150 idiomas, útil para testear sistemas de QA en lenguas con escasez de datos anotados.
- Enriquecimiento de bases de datos de atención al cliente: generación de preguntas frecuentes sintéticas a partir de documentación técnica o manuales de producto, en múltiples idiomas.
- Preprocesado para pipelines de búsqueda semántica: generación de consultas de prueba para validar y ajustar sistemas de búsqueda vectorial antes de su despliegue en producción.
- Investigación en lingüística computacional de lenguas de bajos recursos: el amplio soporte idiomático permite estudiar el comportamiento de modelos generativos en lenguas africanas y asiáticas con pocos recursos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB para Q2_K, 2,7-2,8 GB para Q4_K_S/Q4_K_M, 3,6 GB para Q6_K, 4,6 GB para Q8_0 y 8,5 GB para f16 (tamaños de archivo indicados en la model card; el consumo real de VRAM es algo superior por el contexto y el overhead de la librería).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4; para f16 se recomienda una GPU con 10-12 GB o más. GPU de datacenter como A100 o H100 no son necesarias dado el tamaño del modelo, pero pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, así como en GPUs integradas con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleración por GPU. No se menciona compatibilidad explícita con vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MIST-QG-1.1-GGUF | 4,2 B | no disponible | más de 150 | Apache 2.0 | GGUF |
| Modelos QG especializados de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. La comparativa con alternativas de la misma categoría (generación de preguntas multilingüe) no está disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información disponible; al ser un modelo multilingüe entrenado sobre datos web, es probable que herede sesgos presentes en dichos datos, especialmente en lenguas de bajos recursos donde la calidad del corpus puede ser menor.
- Riesgo de alucinación: como todo modelo generativo, puede producir preguntas o consultas que no se corresponden con el contenido del contexto de entrada; se recomienda validación posterior en pipelines de producción.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada, lo que impide garantizar su comportamiento en documentos largos.
- La cobertura de más de 150 idiomas no implica calidad uniforme; es esperable un rendimiento notablemente inferior en lenguas con pocos recursos digitales (por ejemplo, lenguas africanas minoritarias) frente a inglés, español o chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene verificar la licencia del modelo base original (olaverse/MIST-QG-1.1) por si impone condiciones adicionales.
- La versión GGUF es una cuantización estática; las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de las preguntas generadas, por lo que se recomienda Q4_K_M o superior para producción.
- No se han publicado métricas de evaluación, por lo que no es posible cuantificar su rendimiento frente a alternativas antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face (versión GGUF): https://huggingface.co/mradermacher/MIST-QG-1.1-GGUF
- Modelo base original: https://huggingface.co/olaverse/MIST-QG-1.1
- Página de descargas del cuantizador: https://hf.tst.eu/model#MIST-QG-1.1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
