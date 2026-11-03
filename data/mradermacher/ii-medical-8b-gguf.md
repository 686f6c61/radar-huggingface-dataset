# mradermacher/II-Medical-8B-GGUF

## Resumen

II-Medical-8B-GGUF es la version cuantizada en formato GGUF del modelo Intelligent-Internet/II-Medical-8B, un modelo de lenguaje de 8.190.735.360 parametros orientado al dominio medico y distribuido con licencia Apache 2.0. Las cuantizaciones han sido generadas por mradermacher, un conocido empaquetador de la comunidad de HuggingFace especializado en producir versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base fue desarrollado por Intelligent Internet y esta disenado para tareas de comprension y generacion de texto en el ambito sanitario.

El repositorio ofrece un abanico completo de cuantizaciones estaticas, desde Q2_K (3,4 GB) hasta f16 (16,5 GB), pasando por variantes K-quant e IQ-quant. Esto permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 8 GB de VRAM hasta estaciones de trabajo con GPUs profesionales. Ademas, existe una version con cuantizacion ponderada/imatrix en un repositorio separado (mradermacher/II-Medical-8B-i1-GGUF), que suele ofrecer mejor calidad por bit que las cuantizaciones estaticas equivalentes.

La relevancia de esta ficha radica en que combina un modelo de dominio especifico (medicina) con el ecosistema GGUF, lo que facilita su integracion en aplicaciones locales, entornos con requisitos de privacidad estrictos o despliegues sin conectividad. El modelo solo declara soporte para ingles, lo que limita su uso directo en castellano sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Intelligent-Internet/II-Medical-8B. Por el numero de parametros (8,19 mil millones) y el ecosistema en el que se distribuye (transformers, GGUF), se trata presumiblemente de un transformer decoder-only, pero no se confirma en la documentacion proporcionada. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. El nombre "II-Medical" sugiere un ajuste orientado al dominio medico, pero no se aportan detalles sobre el corpus clinico utilizado.

La innovacion tecnica destacable en este repositorio no reside en el modelo en si, sino en el proceso de cuantizacion. mradermacher emplea cuantizaciones estaticas (K-quants e IQ-quants) generadas con llama.cpp, y ofrece ademas una version con cuantizacion ponderada/imatrix en un repositorio separado. Las cuantizaciones IQ (como IQ4_XS) suelen proporcionar mejor relacion calidad/tamano que las K-quants de tamano similar, segun las notas del propio autor. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones arquitectonicas del modelo base.

## Capacidades

- Generacion de texto y respuesta conversacional en ingles, orientada al dominio medico segun la denominacion del modelo base.
- Comprension de lenguaje natural en contextos clinicos o sanitarios (inferido del nombre y la orientacion del modelo base, no confirmado con benchmarks).
- Capacidades de razonamiento y respuesta multi-turno, segun la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integracion con infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Asistencia clinica local y privada: el modelo puede desplegarse en un portatil o estacion de trabajo con llama.cpp u Ollama usando cuantizaciones Q4_K_M (5,1 GB), lo que permite procesar consultas medicas sin enviar datos a la nube, un requisito habitual en entornos sanitarios con normativas de proteccion de datos.
- Educacion medica y simulacion de casos: con cuantizaciones Q5_K_M o Q6_K (6,0-6,8 GB) se puede ejecutar en una GPU de consumo (RTX 3060 12 GB, RTX 4070) para generar escenarios clinicos, preguntas de repaso o explicaciones de fisiopatologia en ingles.
- Triaje y clasificacion de sintomas en ingles: integrado en un pipeline de preprocesamiento, el modelo puede clasificar textos de pacientes y derivar a especialistas, aprovechando su ajuste al dominio medico y su bajo coste de inferencia en cuantizacion Q4_K_S.
- Generacion de resumenes de historiales clinicos: en despliegues con contexto largo (si el modelo base lo soporta, dato no confirmado), podria resumir notas de evolucion o informes de alta en ingles, con revision humana obligatoria.
- Prototipado rapido de aplicaciones sanitarias: gracias a la licencia Apache 2.0 y al formato GGUF, un equipo de desarrollo puede integrar el modelo en una app de escritorio o movil (via llama.cpp) sin costes de licencia ni dependencia de APIs externas.
- Investigacion en NLP clinico: el modelo sirve como linea base para experimentos de dominio medico en ingles, comparando su rendimiento con modelos generalistas del mismo tamano en tareas como extraccion de entidades o respuesta a preguntas clinicas.
- Despliegue en entornos con conectividad limitada: ambulancias, clinicas rurales o dispositivos offline pueden ejecutar la cuantizacion Q2_K (3,4 GB) en hardware modesto, aunque con menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas un margen para el contexto y el estado de la KV cache. Orientativamente: Q2_K ~3,4 GB, Q4_K_M ~5,1 GB, Q6_K ~6,8 GB, Q8_0 ~8,8 GB, f16 ~16,5 GB. El margen adicional depende de la longitud de contexto configurada.
- GPU recomendadas: para Q4_K_M, una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 permiten ejecucion comoda. Para Q8_0 o f16, se recomienda una RTX 4090 (24 GB), A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q6_K caben en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060 8 GB, RTX 4060, GTX 1660 Super con margen limitado). Q8_0 requiere al menos 10-12 GB; f16 requiere 20-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| II-Medical-8B-GGUF (este) | 8,19 B | no disponible | Apache 2.0 | GGUF | Dominio medico, solo ingles, cuantizaciones estaticas |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Generalista, multilingue, ampliamente soportado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32 K | Apache 2.0 | safetensors, GGUF | Generalista, licencia permisiva, buen ecosistema |
| BioMistral-7B | 7,25 B | 32 K (aprox.) | Apache 2.0 | safetensors, GGUF | Dominio biomedico, basado en Mistral |

La comparativa se limita a caracteristicas objetivas; no se dispone de datos de rendimiento del modelo evaluado para comparar calidad. El modelo destaca por su licencia Apache 2.0 (mas permisiva que la de Llama 3.1) y por su especializacion medica, pero pierde frente a los generalistas en cobertura de idiomas (solo ingles) y en contexto declarado (no disponible).

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles; su uso en castellano no esta avalado por el autor y requeriria evaluacion empirica.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, lo que impide valorar riesgos de sesgo clinico, racial o de genero.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion medica incorrecta o inventada. En un dominio de alto riesgo como la salud, cualquier salida debe ser revisada por profesionales cualificados.
- No debe usarse como sustituto del juicio clinico ni para diagnostico o tratamiento sin supervision humana.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso clinico.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con documentos largos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y la precision en tareas medicas; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene un numero bajo de descargas (281) y likes (6), lo que sugiere poca validacion comunitaria.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/II-Medical-8B-GGUF
- Modelo base: https://huggingface.co/Intelligent-Internet/II-Medical-8B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/II-Medical-8B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#II-Medical-8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
