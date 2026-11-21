# mradermacher/Phantasor_V0.35-494M-GGUF

## Resumen

Phantasor_V0.35-494M es un modelo de lenguaje de tipo transformer denso con 494.032.768 parámetros (aproximadamente 494 millones), desarrollado originalmente por el usuario XeTute y cuantizado a formato GGUF por mradermacher. Se trata de un modelo de escala "tiny/small" orientado a investigación, con capacidades conversacionales y soporte declarado para inglés y chino. El problema que aborda es el de ofrecer un modelo compacto, ligero y de licencia permisiva (Apache 2.0) que pueda ejecutarse en hardware muy modesto, incluyendo CPUs y GPUs de consumo, manteniendo un ajuste fino sobre datos específicos.

Su relevancia actual radica en su reducido tamaño: los cuantizados GGUF oscilan entre 0,4 GB (Q2_K, Q3_K_S) y 1,1 GB (f16), lo que permite desplegarlo en entornos con recursos limitados, en el edge o en pruebas de concepto. El modelo se ha ajustado sobre una mezcla de datasets que incluyen datos de instrucciones en inglés y chino (alpaca, alpaca_zh), conjuntos temáticos propios del autor (Islam, Pakistani-Developer, Tiny-Eastern-Alpaca) y un dataset de razonamiento matemático (BigMathematics-Reasoning). La versión aquí descrita es la cuantización estática publicada por mradermacher el 3 de marzo de 2025.

Cabe señalar que la información técnica publicada es escasa: no se detallan la longitud de contexto, la composición exacta del corpus de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente los datos disponibles en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifican detalles adicionales) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de tratarse de un transformer de 494 millones de parámetros. No se especifican el número de capas, la dimensionalidad del modelo, el número de cabezas de atención ni la longitud de contexto nativa. Tampoco se documenta el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

Sí se conocen los datasets empleados en el ajuste: XeTute/Tiny-Eastern-Alpaca, XeTute/Islam, XeTute/BigMathematics-Reasoning, XeTute/Pakistani-Developer, tatsu-lab/alpaca y llamafactory/alpaca_zh. Esta combinación sugiere un ajuste de instrucciones multilingüe (inglés y chino) con énfasis en matemáticas y en dominios temáticos concretos. La cuantización fue realizada por mradermacher mediante cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf); no se han publicado cuantizaciones ponderadas ni con imatrix para este modelo.

## Capacidades

- Generación de texto conversacional e instruccional en inglés y chino.
- Razonamiento matemático, reforzado por el dataset BigMathematics-Reasoning.
- Ajuste sobre dominios temáticos específicos (Islam, Pakistani-Developer).
- Soporte multilingüe limitado a los dos idiomas declarados (en, zh).
- Formato conversacional (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Prototipado rápido en local: gracias a sus cuantizados de 0,4-0,6 GB, permite probar pipelines de generación de texto en portátiles sin GPU dedicada usando llama.cpp u Ollama.
- Experimentación académica con modelos pequeños: útil como baseline en estudios sobre ajuste de instrucciones, cuantización o evaluación de modelos tiny en inglés y chino.
- Generación de texto asistida en el edge: su tamaño permite integrarlo en dispositivos con poca memoria (Raspberry Pi, mini-PC) para tareas de resumen o respuesta breve.
- Razonamiento matemático elemental: el ajuste sobre BigMathematics-Reasoning lo hace adecuado para experimentos de resolución de problemas aritméticos sencillos, siempre con validación humana.
- Chat conversacional de bajo coste: puede emplearse en demos de asistentes conversacionales en inglés o chino donde el coste computacional sea prioritario sobre la calidad.
- Evaluación de pipelines de cuantización: sirve como banco de pruebas para comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de menos de 500 M de parámetros.
- Filtrado o clasificación de texto ligera: con ajuste adicional, puede adaptarse a tareas de etiquetado simple en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB con cuantizaciones Q2_K a Q8_0; 1,1 GB con f16.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060) es suficiente; también funciona en CPU.
- Cabe holgadamente en GPU de consumo, incluidas las integradas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera inferencia en tiempo real incluso en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| Phantasor_V0.35-494M | 494 M | No disponible | en, zh | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (versión base) | Multilingüe (29 idiomas) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 360 M | 8.192 tokens | Inglés principalmente | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Inglés | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen2.5-0.5B es la más directa por número de parámetros; no obstante, los datos de contexto y benchmarks de Phantasor no están publicados, por lo que no puede establecerse una comparación de rendimiento rigurosa. SmolLM2-360M y TinyLlama-1.1B se incluyen como referencias de la misma categoría de modelos pequeños.

## Limitaciones y advertencias

- Modelo de 494 M de parámetros: la calidad de generación, el razonamiento complejo y la coherencia en contextos largos serán limitados en comparación con modelos de mayor escala.
- Riesgo elevado de alucinación, especialmente en dominios especializados y en tareas de razonamiento matemático avanzado.
- Idiomas soportados limitados a inglés y chino; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que impide planificar despliegues que requieran ventanas largas.
- Ausencia de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas con datos objetivos.
- El ajuste sobre datasets temáticos específicos (Islam, Pakistani-Developer) puede introducir sesgos de dominio y de perspectiva que no están documentados.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la model card no detalla condiciones adicionales sobre los datos de entrenamiento; conviene revisar las licencias de los datasets de origen antes de un uso comercial.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de estas capacidades sin un ajuste adicional.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso práctico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phantasor_V0.35-494M-GGUF
- Modelo base: https://huggingface.co/XeTute/Phantasor_V0.35-494M
- Página de descargas del cuantizador: https://hf.tst.eu/model#Phantasor_V0.35-494M-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Tiny-Eastern-Alpaca: https://huggingface.co/datasets/XeTute/Tiny-Eastern-Alpaca
- Dataset Islam: https://huggingface.co/datasets/XeTute/Islam
- Dataset BigMathematics-Reasoning: https://huggingface.co/datasets/XeTute/BigMathematics-Reasoning
- Dataset Pakistani-Developer: https://huggingface.co/datasets/XeTute/Pakistani-Developer
- Dataset alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset alpaca_zh: https://huggingface.co/datasets/llamafactory/alpaca_zh
