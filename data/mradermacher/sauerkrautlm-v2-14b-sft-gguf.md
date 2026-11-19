# mradermacher/SauerkrautLM-v2-14b-SFT-GGUF

## Resumen

SauerkrautLM-v2-14b-SFT-GGUF es la versión cuantizada en formato GGUF del modelo VAGOsolutions/SauerkrautLM-v2-14b-SFT, publicada por mradermacher el 6 de marzo de 2025. El modelo original es un ajuste supervisado (SFT) de una base de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) orientado a conversación multilingüe, con especial énfasis en alemán e inglés y cobertura adicional de italiano, francés, portugués, neerlandés, árabe y español.

Esta ficha se centra en la distribución GGUF, cuyo propósito es permitir la inferencia local eficiente mediante llama.cpp y ecosistemas compatibles (Ollama, LM Studio, koboldcpp, etc.) sin necesidad de GPUs de datacenter. El repositorio ofrece 11 cuantizaciones estáticas desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite desplegar el modelo en hardware de consumo con distintos compromisos entre calidad y huella de memoria. Existe además un repositorio hermano con cuantizaciones ponderadas/imatrix (i1) para quienes priorizan la fidelidad a costa de mayor tamaño.

La relevancia actual radica en que combina un modelo base de 14B con licencia Apache 2.0, soporte para ocho idiomas y un formato GGUF listo para producción local, lo que lo convierte en una opción práctica para despliegues soberanos, prototipado rápido y aplicaciones multilingües en entornos con restricciones de privacidad o conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados en la información disponible) |
| Parametros totales | 14.770.033.664 (aproximadamente 14,8B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); disponibles también cuantizaciones i1 (imatrix) en repositorio separado |
| Idiomas soportados | de, en, it, fr, pt, nl, ar, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base VAGOsolutions/SauerkrautLM-v2-14b-SFT más allá de que es un transformer de aproximadamente 14,8B parámetros ajustado mediante SFT (supervised fine-tuning). No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

El trabajo de mradermacher consiste en la conversión y cuantización del modelo base a formato GGUF, generando cuantizaciones estáticas con la herramienta estándar de llama.cpp. La model card indica que las cuantizaciones fueron producidas con quantize_version 2 y output_tensor_quantised 1, y remite a un repositorio i1 para las versiones ponderadas/imatrix, que suelen ofrecer mejor calidad por tamaño que las estáticas equivalentes. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional multilingüe en ocho idiomas (alemán, inglés, italiano, francés, portugués, neerlandés, árabe y español).
- Ajuste específico para diálogo multi-turno (tag "conversational"), adecuado para asistentes e interfaces de chat.
- Razonamiento general y respuesta a instrucciones derivadas del ajuste SFT.
- Capacidad de ejecución local en CPU y GPU mediante llama.cpp y frontends compatibles.
- Compatibilidad con endpoints (tag "endpoints_compatible") para su integración en servicios de inferencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional multilingüe en local: el modelo puede gestionar diálogos multi-turno en ocho idiomas y desplegarse en estaciones de trabajo sin conexión, lo que resulta adecuado para entornos con requisitos de privacidad o sin acceso a la nube.
- Atención al cliente en alemán e inglés: con cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB) puede ejecutarse en una GPU de consumo y atender conversaciones de soporte con contexto suficiente para hilos habituales.
- Traducción y adaptación de contenidos entre los idiomas soportados: su cobertura de de/en/it/fr/pt/nl/ar/es permite usarlo como motor de traducción o reescritura en pipelines editoriales, validando la calidad por par de idiomas antes de producción.
- Prototipado rápido de aplicaciones LLM: la disponibilidad de cuantizaciones desde 5,9 GB (Q2_K) hasta 15,8 GB (Q8_0) permite iterar en portátiles y workstations antes de decidir el despliegue definitivo.
- Despliegue soberano en infraestructura propia: al ser Apache 2.0 y distribuirse en GGUF, puede integrarse en servidores on-premise con llama.cpp u Ollama, evitando dependencias de proveedores externos.
- Generación asistida de documentación y resúmenes en entornos ofimáticos: con Q4_K_S (8,7 GB) cabe en GPUs de 12 GB y puede automatizar resúmenes y borradores en varios idiomas.
- Investigación en cuantización: el repositorio ofrece un espectro amplio de cuantizaciones (incluyendo IQ4_XS e i1 en repositorio aparte) útil para estudiar el impacto de la cuantización en la calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. Añadir overhead de contexto KV cache (no cuantificado por defecto).
- GPU recomendadas: para Q4_K_M/Q5_K_M, GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB); para Q6_K/Q8_0, GPUs de 16-24 GB (RTX 4080/4090, A5000, A6000); para despliegues de mayor concurrencia, A100 o H100 con vLLM (previa conversión a safetensors, ya que vLLM no consume GGUF de forma nativa).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con Q4_K_S/Q4_K_M, y en GPUs de 16 GB con Q5_K_M o Q6_K. Las cuantizaciones Q2_K/Q3_K permiten incluso GPUs de 8 GB, con pérdida de calidad apreciable.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, llama-cpp-python; para servir como API, llama.cpp server o text-generation-webui. vLLM y TGI requieren los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, la model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SauerkrautLM-v2-14b-SFT-GGUF (este) | ~14,8B | no disponible | 8 idiomas (de, en, it, fr, pt, nl, ar, es) | Apache 2.0 | GGUF | Enfoque multilingüe europeo, cuantizaciones estáticas e i1 |
| VAGOsolutions/SauerkrautLM-v2-14b-SFT | ~14,8B | no disponible | 8 idiomas | Apache 2.0 | safetensors | Modelo base original; requiere conversión para llama.cpp |
| Modelos GGUF de ~14B de otros autores | ~13-15B | variable | variable | variable | GGUF | Alternativas genéricas; no se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo en la información disponible; como modelo SFT multilingüe, puede reproducir sesgos presentes en sus datos de entrenamiento, especialmente en idiomas con menor representación (árabe, neerlandés, portugués).
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se documentan mecanismos específicos de mitigación.
- La longitud de contexto no está documentada, por lo que debe validarse empíricamente antes de diseñar flujos que dependan de ventanas largas.
- La calidad multilingüe puede variar significativamente entre idiomas; se recomienda evaluar por idioma antes de producción, dado que el énfasis del modelo es alemán e inglés.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; la model card recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 para máxima fidelidad.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base original y de los datos de entrenamiento antes de un uso comercial a gran escala.
- El repositorio ocupa 102 GB por incluir todas las cuantizaciones; la descarga selectiva de un único archivo GGUF es la práctica recomendada.
- vLLM y TGI no soportan GGUF de forma nativa; para servir con esos motores hay que usar los safetensors del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SauerkrautLM-v2-14b-SFT-GGUF
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-v2-14b-SFT
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/SauerkrautLM-v2-14b-SFT-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#SauerkrautLM-v2-14b-SFT-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
