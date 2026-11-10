# mradermacher/Laghu-Base-32K-GGUF

## Resumen

Laghu-Base-32K es un modelo de lenguaje de pequeno tamano (151,8 millones de parametros) desarrollado por udgamlabs y entrenado desde cero, publicado como version de investigacion bajo licencia Apache 2.0. La version aqui descrita es la cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo se distribuye como modelo base (sin ajuste por instrucciones ni alineamiento conversacional), orientado a experimentacion e investigacion mas que a uso directo en produccion.

La denominacion "32K" hace referencia a su ventana de contexto de 32.768 tokens, una longitud notable para un modelo de este tamano. El tag `gemma4` en la model card sugiere que la arquitectura esta inspirada en la familia Gemma, aunque no se detalla la configuracion exacta de capas, cabezas de atencion ni el esquema de tokenizacion en la informacion disponible. El modelo solo declara soporte para ingles.

Su relevancia actual radica en el nicho de modelos pequenos entrenados desde cero con contexto largo: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas tipo transformer a escala reducida, para experimentos de destilacion y para validar pipelines de cuantizacion GGUF en hardware modesto. No obstante, al ser un modelo base sin alineamiento, no debe esperarse de el un comportamiento conversacional fiable sin un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (inspirada en Gemma, segun tag `gemma4`; detalles no disponibles) |
| Parametros totales | 151.792.732 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun nombre y tag `long-context`) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card: `gemma4`, `trained-from-scratch`, `base-model` y `long-context`. Esto indica un transformer decoder-only entrenado desde cero (no derivado de un modelo preexistente) con soporte de contexto largo, presumiblemente mediante alguna variante de atencion eficiente o posicional escalada, aunque no se especifica el mecanismo concreto. El tamano de 151,8 millones de parametros situa al modelo en la categoria de pequenos modelos, comparable en escala a GPT-2 small o a variantes reducidas de familias modernas.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni tecnicas de alineamiento. Al tratarse de un modelo base, es esperable que no haya pasado por un proceso de ajuste por instrucciones. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, mezcla de expertos) en la informacion proporcionada. Las cuantizaciones GGUF son estaticas; el autor de las mismas indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto autoregresiva como modelo base, sin ajuste por instrucciones.
- Manejo de contexto largo de hasta 32.768 tokens, adecuado para tareas de modelado de lenguaje sobre documentos extensos.
- Capacidad de continuacion de texto y modelado de lenguaje general en ingles.
- Soporte de tool calling / function calling: no disponible (modelo base sin alineamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre modelos pequenos con contexto largo: el modelo permite estudiar como se comporta un transformer de 151,8 M de parametros con una ventana de 32K tokens en tareas de modelado de lenguaje, evaluando la degradacion de la perplejidad a lo largo de la ventana.
- Banco de pruebas para pipelines de cuantizacion: las doce variantes GGUF publicadas (desde Q2_K hasta f16) permiten medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo checkpoint, util para calibrar metodologias de evaluacion.
- Generacion de texto asistida en entornos con recursos minimos: al ocupar entre 0,2 y 0,4 GB segun cuantizacion, puede ejecutarse en CPUs y GPUs integradas para tareas de continuacion de texto o generacion de borradores en ingles.
- Experimentos de destilacion y ajuste fino: al ser un modelo base pequeno y con licencia Apache 2.0, sirve como punto de partida para fine-tuning supervisado o destilacion desde modelos mayores en proyectos de investigacion.
- Evaluacion de tecnicas de atencion de contexto largo: util para comparar implementaciones de RoPE escalado, atencion dispersa u otras variantes en un modelo de bajo coste computacional.
- Educacion y docencia: su tamano reducido y su disponibilidad en GGUF facilitan demostraciones practicas de inferencia local con llama.cpp u Ollama en aulas o talleres, sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para cuantizaciones Q2_K a Q5_K_M, 0,3 GB para Q6_K y Q8_0, y 0,4 GB para f16 (tamanos de fichero indicados por el autor; el consumo en memoria anadira overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una GPU integrada moderna pueden ejecutar el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui con backend llama.cpp). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo Hugging Face.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia muy baja en GPU y throughput alto en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Laghu-Base-32K (esta ficha) | 151,8 M | 32.768 | Apache 2.0 | GGUF, safetensors | Modelo base entrenado desde cero, solo ingles |
| GPT-2 small | 124 M | 1.024 | MIT | safetensors, GGUF | Referencia clasica de modelo pequeno; contexto mucho menor |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo pequeno moderno con ajuste por instrucciones en algunas variantes |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto comparable; multilingue |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de datos de rendimiento comparativo del modelo de esta ficha frente a las alternativas.

## Limitaciones y advertencias

- Al ser un modelo base sin alineamiento, no sigue instrucciones de forma fiable y puede producir texto incoherente o repetitivo en dialogos.
- Riesgo de alucinacion elevado en tareas factuales, agravado por el reducido numero de parametros y la falta de datos de entrenamiento documentados.
- Soporte unicamente de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se documentan sesgos conocidos, pero un modelo entrenado desde cero sin informacion sobre la composicion del corpus puede reproducir sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantias de calidad hace desaconsejable su uso en produccion sin una evaluacion exhaustiva previa.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso general.
- No hay cuantizaciones ponderadas/imatrix disponibles, lo que puede limitar la calidad de las cuantizaciones de baja precision en comparacion con alternativas.
- El modelo se publico como version de investigacion; no hay soporte ni mantenimiento documentado por parte del autor original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Laghu-Base-32K-GGUF
- Modelo base original: https://huggingface.co/udgamlabs/Laghu-Base-32K
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Laghu-Base-32K-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
