# cafepm/G9v3-39A5B-Q3Q4-GGUF

## Resumen

G9v3-39A5B-Q3Q4-GGUF es una cuantización de precisión mixta del modelo original G9v3-39A5B, desarrollado por el equipo AI9Stars y publicado en formato GGUF por el usuario cafepm. Se trata de un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) con 39B parámetros totales y 5B activos por token, diseñado para tareas de asistente conversacional, generación de código, uso de herramientas y razonamiento. La versión cuantizada emplea una asignación de precisión guiada por la "Infiniteon Algebra" (una teoría propuesta por TNT.Chat) que destina 4 bits a los tensores estructuralmente críticos (experto compartido y atención) y 3 bits al resto, logrando calidad cercana a Q4 con un tamaño próximo a Q3.

El modelo original soporta una ventana de contexto de 131.072 tokens, modos Think y No Think, y tool calling. Esta versión GGUF está pensada para ejecutarse en hardware de consumo, cabiendo en GPUs con 24 GB de VRAM, y requiere un fork propietario de llama.cpp para su ejecución cuantizada. Se distribuye bajo licencia Apache 2.0 y está etiquetado como "preview", indicando que aún está en desarrollo activo. La relevancia actual radica en su capacidad para ofrecer un rendimiento competitivo en tareas de agente con contexto largo en GPUs de gama alta de consumo, como la RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, Mixture-of-Experts (MoE) |
| Parametros totales | 38.967.481.920 (~39B) |
| Parametros activos | ~5B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q3_K (80% de pesos) + Q4_K (20% de pesos), formato Q3Q4 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion mixta Q3Q4) |

## Arquitectura y entrenamiento

El modelo base G9v3-39A5B es un transformer causal con arquitectura MoE. Cada token activa aproximadamente 5B de los 39B parámetros totales, lo que mantiene el coste de inferencia cercano al de un modelo denso pequeño mientras conserva la capacidad de un modelo mucho mayor. La versión cuantizada Q3Q4 aplica una estrategia de precisión mixta: el 20% de los pesos (correspondientes al experto compartido y a los tensores de atención) se cuantizan a 4 bits (Q4_K), mientras que el 80% restante se cuantiza a 3 bits (Q3_K). Esta asignación se determina mediante el "Infiniteon Algebra associator", una herramienta teórica desarrollada por TNT.Chat que identifica tensores con información estructural crítica para la coherencia generativa. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO). El modelo se distribuye como "preview release", lo que sugiere que los detalles de entrenamiento podrían publicarse en versiones futuras.

## Capacidades

- Generación de texto en inglés y chino, con soporte de conversación multi-turno.
- Razonamiento con dos modos: "Think" (pensamiento explícito) y "No Think" (respuesta directa), activables mediante el chat template.
- Generación de código y asistencia en tareas de programación.
- Tool calling / function calling, permitiendo integración con APIs y agentes.
- Soporte de agentes y razonamiento multi-paso, adecuado para flujos de trabajo autónomos.
- Ventana de contexto larga (131.072 tokens) para manejar documentos extensos o historiales conversacionales amplios.
- Capacidades multilingües limitadas a inglés y chino según la ficha oficial.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse en una GPU de 24 GB para ofrecer un asistente personal con contexto largo, ideal para aplicaciones de escritorio o servidores domésticos.
- Generación de código en producción: con tool calling y modo Think, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, manteniendo bajo coste de inferencia gracias a los 5B parámetros activos.
- Agentes autónomos con razonamiento multi-paso: su soporte para tool calling y contexto largo permite construir agentes que ejecutan tareas complejas (búsqueda web, manipulación de archivos, consultas a APIs) con memoria de la interacción.
- Procesamiento de documentos largos: la ventana de 131K tokens permite resumir, extraer información o responder preguntas sobre libros, informes o código fuente extenso sin necesidad de chunking.
- Chatbots multilingües (inglés/chino): útil para aplicaciones de atención al cliente o comunidades que requieran ambos idiomas, con despliegue local para garantizar privacidad.
- Prototipado rápido de aplicaciones de IA: al ser un modelo abierto (Apache 2.0) y caber en hardware de consumo, es adecuado para startups o investigadores que necesitan experimentar con modelos de razonamiento sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona que el modelo obtuvo el primer puesto en el benchmark propio "tnt-bench" de TNT.Chat, destacando en la categoría de no-alucinación entre modelos de menos de 60B parámetros, pero no se proporcionan cifras concretas ni comparativas con otros modelos. Se recomienda consultar el sitio web de TNT.Chat (https://ai.tnt.chat/models) para futuras publicaciones de resultados.

## Requisitos de hardware

- VRAM estimada: 24-32 GB para la cuantización Q3Q4, según la model card. El modelo cabe en una GPU de 24 GB (p. ej., RTX 3090, RTX 4090, RTX 5090).
- GPU recomendadas: RTX 3090/4090/5090 (24 GB) o GPUs profesionales con 24-32 GB (p. ej., A5000, A6000). No se menciona soporte para GPUs con menos VRAM.
- En CPU, el Colab proporcionado alcanza ~160 tokens/s sin GPU, pero con limitaciones de concurrencia (hasta 45 usuarios a 130K contexto usando Colab como endpoint).
- Opciones de despliegue: requiere un fork propietario de llama.cpp (enlace en Zenodo) para ejecutar la cuantización Q3Q4. También es compatible con vLLM (>=0.21), SGLang (>=0.5.12) y Transformers (>=5.6) para el modelo original sin cuantizar, aunque la versión GGUF está pensada para llama.cpp.
- Latencia y throughput: no se proporcionan datos oficiales. El Colab indica ~160 tokens/s en CPU, pero en GPU se espera un rendimiento superior, sin cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos para comparar directamente con otros modelos. Como referencia cualitativa, se puede situar frente a alternativas MoE de tamaño similar:

| Modelo | Params totales | Params activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| G9v3-39A5B (Q3Q4) | ~39B | ~5B | 131K | Apache 2.0 | MoE, cuantización mixta, preview |
| Qwen2.5-32B | 32.5B | 32.5B (denso) | 128K | Apache 2.0 | Denso, sin cuantización mixta |
| DeepSeek-V2-Lite | 16B | 2.4B | 128K | MIT | MoE, más pequeño, menos capacidad |

La comparación es orientativa; sin benchmarks comunes no es posible establecer una jerarquía objetiva. El modelo G9v3 destaca por su combinación de 5B activos y contexto de 131K, lo que lo hace atractivo para despliegue local, pero su estado "preview" y la necesidad de un fork de llama.cpp limitan su madurez frente a alternativas consolidadas.

## Limitaciones y advertencias

- Modelo en fase "preview": está en desarrollo activo y pueden existir cambios sustanciales en futuras versiones; no se recomienda para entornos de producción críticos sin validación adicional.
- Cuantización no estándar: la mezcla Q3Q4 requiere un fork propietario de llama.cpp (enlace en Zenodo); no es compatible con el llama.cpp estándar ni con otras herramientas que no soporten esta configuración.
- Riesgo de alucinación: aunque el modelo destaca en no-alucinación según tnt-bench, no hay datos públicos que respalden este resultado; se recomienda verificar las salidas en aplicaciones sensibles.
- Idiomas limitados: solo inglés y chino; no se garantiza calidad en otros idiomas.
- Sesgos: no se ha publicado información sobre evaluación de sesgos o seguridad; al ser un modelo abierto, puede reflejar sesgos presentes en los datos de entrenamiento (desconocidos).
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el fork de llama.cpp tiene su propia licencia (no especificada) que debe revisarse antes de su uso en producción.
- Requisitos de hardware: aunque cabe en 24 GB, la cuantización Q3Q4 puede degradar la calidad en comparación con el modelo original en FP16; se recomienda probar antes de adoptarlo.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/cafepm/G9v3-39A5B-Q3Q4-GGUF
- Modelo original (ai9stars/G9v3-39A5B): https://huggingface.co/ai9stars/G9v3-39A5B
- GitHub de AI9Stars: https://github.com/AI9Stars
- Sitio web de TNT.Chat (benchmarks y detalles): https://ai.tnt.chat
- Fork propietario de llama.cpp (Zenodo): https://doi.org/10.5281/zenodo.21950531
- Colab de ejemplo (TNT Bridge): https://colab.research.google.com/gist/masterofrisk/83357b92b5e1b2276b0a46983044c98e/tnt-g9v3-39b-blackwell_colab_tnt_bridge.ipynb
- Referencias teóricas (Infiniteons Theory, Vol. I y II): https://doi.org/10.5281/zenodo.19329589 y https://doi.org/10.5281/zenodo.19330373
