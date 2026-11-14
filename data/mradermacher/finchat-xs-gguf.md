# mradermacher/FinChat-XS-GGUF

## Resumen

FinChat-XS-GGUF es la distribucion en formato GGUF del modelo FinChat-XS, un modelo de lenguaje especializado en dominio financiero desarrollado originalmente por el usuario oopere y cuantizado por mradermacher. Se trata de un modelo de chat orientado a conversaciones y consultas sobre tematica financiera, afinado a partir del dataset Sujet-Finance-Instruct-177k, y pensado para desplegarse en entornos con recursos limitados gracias a su reducido tamano.

El modelo cuenta con 361.821.120 parametros totales (aproximadamente 362 millones), lo que lo situa en la categoria de modelos pequenos (small language models) optimizados para eficiencia. Esta distribucion GGUF incluye un amplio abanico de cuantizaciones estaticas que van desde Q2_K (0,3 GB) hasta f16 (0,8 GB), lo que permite ejecutarlo en hardware muy modesto, incluidas CPU y GPUs de consumo con poca VRAM.

Su relevancia actual radica en la demanda de modelos de dominio especifico que puedan ejecutarse localmente y de forma privada en el sector financiero, donde el tratamiento de datos sensibles y el coste de inferencia son factores criticos. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura exacta no disponible; derivada de oopere/FinChat-XS) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base oopere/FinChat-XS mas alla de que se trata de un transformer. El modelo fue afinado sobre el dataset sujet-ai/Sujet-Finance-Instruct-177k, un conjunto de instrucciones de tematica financiera con aproximadamente 177.000 ejemplos, orientado a tareas de instruccion y conversacion en el dominio de las finanzas. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La contribucion principal de esta distribucion es la cuantizacion estatica realizada por mradermacher, que genera versiones del modelo en multiples precisiones mediante herramientas de cuantizacion GGUF (compatibles con llama.cpp). Existe ademas una variante con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/FinChat-XS-i1-GGUF, que suele ofrecer mejor calidad en tamanos equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en tematica financiera.
- Respuesta a instrucciones y preguntas del dominio financiero (gracias al afinado sobre Sujet-Finance-Instruct-177k).
- Formato de chat conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente financiero local y privado: al ejecutarse en formato GGUF sobre CPU o GPU de consumo, permite desplegar un asistente de consultas financieras sin enviar datos a servicios en la nube, algo critico en el sector financiero por requisitos de confidencialidad.
- Clasificacion y resumen de documentos financieros: con solo 0,3-0,5 GB de pesos cuantizados, puede integrarse en pipelines de procesamiento por lotes de informes, noticias o comunicados para extraer resumenes y categorias.
- Prototipado rapido de aplicaciones fintech: su reducido tamano y licencia Apache 2.0 permiten experimentar con funcionalidades de chat financiero en entornos de desarrollo con hardware modesto antes de escalar a modelos mayores.
- Educacion y formacion financiera: puede emplearse como tutor conversacional en ingles para explicar conceptos basicos de finanzas, con la ventaja de ejecutarse en local en portatiles.
- Filtrado y enrutamiento de consultas: dado su bajo coste de inferencia, puede actuar como primer nivel en una arquitectura de enrutamiento que clasifique consultas financieras y derive las complejas a modelos mayores.
- Despliegue en dispositivos edge o entornos con recursos restringidos: la version Q4_K_M (0,4 GB) cabe en dispositivos con poca memoria y permite inferencia en tiempo real en CPUs modernas mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K) y 0,8 GB (f16) para los pesos; el consumo real de memoria incluye el contexto KV, por lo que conviene reservar al menos 1-2 GB adicionales segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones pequenas; modelos como RTX 3060, RTX 4060, GTX 1660 o incluso iGPUs modernas son suficientes. En GPUs de gama alta (A100, H100, RTX 4090) el modelo quedaria sobredimensionado en cuanto a capacidad, aunque la latencia seria minima.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo de los ultimos anos, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para servidores, es posible usar llama.cpp server o bindings compatibles; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja y un throughput alto en hardware moderno, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FinChat-XS-GGUF (este modelo) | 362 M | no disponible | Apache 2.0 | GGUF | Especializado en finanzas, solo ingles |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Generico, mayor tamano, mas contexto documentado |
| Phi-2 | 2,7 B | 2.048 tokens | MIT | safetensors, GGUF | Generico, mayor capacidad pero mas recursos |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Generico, multilingue, contexto largo |

La comparacion con alternativas genericas de tamano similar muestra que FinChat-XS-GGUF sacrifica capacidades generales y multilingues a cambio de especializacion financiera. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Modelo de muy reducido tamano (362 M de parametros): su capacidad de razonamiento complejo, matematicas y conocimiento general es limitada en comparacion con modelos de miles de millones de parametros.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion elevado en un dominio donde la precision factual es critica (datos financieros, cifras, normativa); no debe usarse como fuente de verdad sin verificacion humana.
- No se dispone de informacion sobre sesgos especificos, pero al estar afinado sobre un dataset financiero concreto puede heredar sesgos de dicho corpus.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas con documentos largos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y el dataset de afinado pueden tener condiciones adicionales que conviene revisar antes de un despliegue en produccion.
- No se han publicado evaluaciones de calidad ni benchmarks, por lo que su rendimiento real en tareas financieras concretas es incierto.
- Al ser una cuantizacion, las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso practico.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/FinChat-XS-GGUF
- Modelo base: https://huggingface.co/oopere/FinChat-XS
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/FinChat-XS-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/sujet-ai/Sujet-Finance-Instruct-177k
- Pagina de descargas del autor: https://hf.tst.eu/model#FinChat-XS-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
