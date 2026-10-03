# bbkdevops/axiom-omega-submarine-latentmoe

## Resumen

Axiom-Omega Submarine LatentMoE es un ajuste fino publicado por el usuario bbkdevops sobre el modelo base Qwen/Qwen2.5-0.5B. El propio autor lo presenta como un modelo "agentic de decisión y razonamiento de grado empresarial", construido con una arquitectura que denomina Submarine Fiber-Optic LatentMoE y con destilación multitier a partir de modelos frontera (GPT-5.5, Gemini 3.1 Pro, Grok-4 y Claude Mythos 5). El repositorio contiene 494.032.768 parámetros reales en formato safetensors, una cifra que coincide prácticamente con la del modelo base, y ocupa 1,0 GB.

El interés de la ficha es fundamentalmente técnico y crítico: se trata de un adaptador (el ejemplo de la model card usa PeftModel) sobre un transformer decoder-only de 0,5 B de parámetros, una familia que hoy se emplea sobre todo para tareas de baja latencia, enrutado, clasificación y prototipado en entornos con recursos muy limitados. No hay resultados de benchmarks publicados, ni descargas, ni interacciones en HuggingFace en el momento de la consulta, por lo que todas las afirmaciones de capacidades proceden exclusivamente de la model card y no cuentan con verificación independiente.

Por su tamaño y su licencia Apache-2.0, el modelo es desplegable en CPU y en cualquier GPU de consumo, pero su utilidad real en tareas de razonamiento complejo o de ingeniería de software multilingüe está por demostrar. Antes de usarlo en producción conviene validar empíricamente sus salidas y comprobar que la supuesta topología MoE de 896 expertos es coherente con el recuento de parámetros del repositorio, algo que a día de hoy no encaja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B) con adaptador de bajo rango; la model card declara "Submarine Fiber-Optic LatentMoE" sobre Qwen2.5-0.5B |
| Parametros totales | 494.032.768 (dato real de safetensors) |
| Parametros activos | No disponible de forma verificable. La model card afirma activar 16 de 896 expertos por forward pass (1,79 % del total) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-0.5B soporta 32.768 tokens de forma nativa, pero no se confirma que el ajuste lo preserve |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no hay GGUF, GPTQ ni AWQ publicados |
| Idiomas soportados | No disponibles en los metadatos de HuggingFace. La model card menciona alineación multilingüe sobre patrones de SWE-bench en 9 lenguajes de programación, sin enumerarlos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA segun el ejemplo de inferencia de la model card) |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Autor | bbkdevops |
| Pipeline | text-generation |
| Libreria declarada | jev-style |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen2.5, con aproximadamente 0,5 B de parámetros. Segun el ejemplo de código incluido en la model card, el artefacto publicado se carga como adaptador de bajo rango (PeftModel.from_pretrained) sobre los pesos congelados de Qwen/Qwen2.5-0.5B, lo que implica que el entrenamiento se realizó mediante alguna variante de fine-tuning eficiente en parámetros y no mediante un preentrenamiento completo. La model card describe una topología propietaria con 56 "Submarine Buffer Tubes" que contienen 16 "Optical Fiber NanoAgent Cores" cada una, sumando 896 expertos, con activación exacta de 16 por forward pass, además de un "Jev-Style / System-1 Protocol" orientado a respuestas de decisión de baja latencia en tres modos (Choice, Noul —guardarraíl de seguridad— y Score) y de "digests" criptográficos de procedencia asociados a cada trayectoria de ejecución.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; toda esa información figura como no disponible. Las afirmaciones sobre destilación desde GPT-5.5, Gemini 3.1 Pro, Grok-4 y Claude Mythos 5 no son verificables con la información disponible y deben tratarse con escepticismo. Hay además una inconsistencia técnica objetiva: el recuento total de parámetros del repositorio (494.032.768) coincide con el del modelo base Qwen2.5-0.5B, algo difícil de conciliar con una supuesta red de 896 expertos, que requeriría parámetros adicionales apreciables o sería un simple esquema de enrutado con nombres descriptivos sin respaldo arquitectónico en los pesos publicados.

## Capacidades

- Generación de texto conversacional en formato chat con plantillas tipo ChatML (`<|im_start|>user ... <|im_end|>`), tal y como aparece en el ejemplo de la model card.
- Razonamiento y decisión en un supuesto modo "System-1" de baja latencia, con salidas de tipo Choice (elección), Noul (guardarraíl de seguridad) y Score (puntuación).
- Soporte declarado para patrones de ingeniería de software multilingüe alineados con SWE-bench Multilingual en 9 lenguajes de programación; no se detalla cuáles ni con qué resultados.
- Orientación a flujos agénticos y de toma de decisiones multi-paso, según las etiquetas del repositorio (agentic, latency-moe, system-one).
- Ausencia de capacidades multimodales declaradas: no se mencionan visión, audio ni entrada de imágenes.
- No se documenta soporte explícito de tool calling, function calling ni de un formato estructurado de llamadas a herramientas.
- Capacidad multilingüe en lenguaje natural: no documentada ni verificada; los metadatos de idiomas de HuggingFace están vacíos.
- "Procedencia criptográfica": la model card afirma adjuntar digests deterministas de prueba a las trayectorias de ejecución, sin especificar formato ni API.

## Casos de uso

- Enrutado de intenciones en pipelines de agentes: con 0,5 B de parámetros, el modelo puede actuar como clasificador ligero que decide a qué herramienta o subagente derivar una petición, ejecutándose en CPU o en una GPU modesta con latencia de milisegundos. Adecuado por coste, no por calidad de razonamiento.
- Autocompletado de código en el IDE: su tamaño permite inferencia local sin enviar código a servicios externos, útil para sugerencias de una línea o completado de plantillas en entornos con restricciones de privacidad.
- Guardarraíles y moderación de contenido: el modo "Noul (Safety Guardrail)" descrito en la model card encaja con un clasificador binario de seguridad previo a un modelo mayor, siempre que se valide su tasa de falsos positivos y negativos.
- Puntuación y triaje de candidatos: el modo "Score" puede emplearse para ordenar respuestas o candidatos en sistemas de generación con verificación posterior, dejando la decisión final a un modelo mayor.
- Extracción de datos estructurados en texto corto: conversión de fragmentos breves (correos, tickets, titulares) a JSON con campos fijos, en despliegues sin GPU y con presupuesto de memoria muy ajustado.
- Prototipado de investigación sobre adaptadores de bajo rango: sirve como banco de pruebas para estudiar el efecto de esquemas de enrutado tipo MoE sobre una base pequeña, ya que el coste de experimentación es mínimo.
- Inferencia en el borde (edge): cuantizado a 4 bits ocuparía del orden de 0,3 GB, lo que permitiría ejecutarlo en dispositivos embebidos con pocos recursos, para tareas de filtrado o etiquetado previo.
- Evaluación comparativa dentro de la familia Qwen2.5-0.5B: útil como referencia en estudios que comparen adaptadores sobre el mismo modelo base, siempre que se aporten métricas reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las etiquetas del repositorio mencionan SWE-bench y SciCode, pero no se acompaña ninguna puntuación, configuración de evaluación ni conjunto de datos concreto. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1 GB para los pesos (494 M de parámetros) más el KV cache y las activaciones, lo que sitúa el consumo total alrededor de 1,5-2,5 GB según la longitud de contexto. Cálculo estimado a partir del recuento de parámetros; no hay cifras oficiales.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5-1 GB en total, aunque no se publican pesos cuantizados y habría que generarlos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,3-0,8 GB, también generando la cuantización localmente.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. Para lotes grandes o contextos muy largos, una RTX 4090 o una A100/H100 quedarían muy sobredimensionadas para este tamaño.
- Cabe en GPU de consumo sin dificultad y también en CPU con memoria RAM abundante, que es su escenario natural de despliegue.
- Opciones de despliegue: el camino documentado por el autor es transformers junto con peft, cargando el adaptador sobre Qwen/Qwen2.5-0.5B. vLLM, TGI, llama.cpp u Ollama requerirían convertir o fusionar previamente los pesos, y no se publica ningún artefacto GGUF listo para usar. La librería declarada, "jev-style", no es una librería estándar del ecosistema, por lo que puede ser necesario trabajo de integración.
- Latencia y throughput estimados: no disponibles. En una GPU de consumo moderna, un modelo de 0,5 B en fp16 suele generar del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentación pública de sus respectivas familias y no de la model card analizada; el ajuste Axiom-Omega no aporta métricas propias, por lo que la comparación es estructural.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Axiom-Omega Submarine LatentMoE | 494 M (adaptador sobre Qwen2.5-0.5B) | No disponible | Apache-2.0 | HuggingFace, 0 descargas, sin GGUF | Sin benchmarks publicados |
| Qwen2.5-0.5B (base) | 494 M | 32.768 tokens | Apache-2.0 | Ampliamente distribuido, versiones GGUF oficiales | Benchmarks publicados por el autor del modelo base |
| Qwen2.5-1.5B | 1.540 M aprox. | 32.768 tokens | Apache-2.0 | Ampliamente distribuido, GGUF oficiales | Benchmarks publicados por el autor del modelo base |
| SmolLM2-1.7B | 1.710 M aprox. | 8.192 tokens | Apache-2.0 | Ampliamente distribuido, GGUF en llama.cpp | Benchmarks publicados por el autor del modelo base |

En la misma categoría de tamaño estricto, el competidor directo es el propio Qwen2.5-0.5B sin ajustar, que cuenta con evaluación pública, soporte en todas las herramientas habituales y cifras conocidas de contexto. Cualquier elección de este ajuste frente al base debería justificarse con métricas propias.

## Limitaciones y advertencias

- Cero descargas y cero interacciones en HuggingFace en el momento de la consulta: no hay evidencia de uso, validación por terceros ni informes de la comunidad.
- Ausencia total de benchmarks: las afirmaciones de rendimiento en razonamiento, SWE-bench o SciCode no están respaldadas por ninguna métrica publicada.
- Inconsistencia entre la arquitectura declarada (896 expertos, 16 activos) y el recuento real de parámetros, que coincide con el del modelo base Qwen2.5-0.5B. Es razonable sospechar que parte de la nomenclatura de la model card es marketing y no una descripción fiel de los pesos.
- Referencias a modelos frontera (GPT-5.5, Gemini 3.1 Pro, Grok-4, Claude Mythos 5) que no se corresponden con identificadores verificables; la afirmación de destilación debe considerarse no comprobada.
- Riesgo elevado de alucinación: con 0,5 B de parámetros, la capacidad de mantener coherencia factual y de razonar sobre problemas de varios pasos es intrínsecamente limitada, independientemente de lo que declare la model card.
- Limitaciones de contexto e idioma no documentadas: se desconoce si el ajuste preserva la ventana de 32.768 tokens del modelo base y no hay lista de idiomas naturales soportados.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de género, raza, idioma o dominio.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones adicionales, siempre que se cumplan las condiciones de atribución y se conserve el aviso de licencia. Hay que verificar además la licencia del modelo base, que también es Apache-2.0.
- La dependencia de una librería no estándar ("jev-style") puede dificultar la reproducibilidad y el despliegue en infraestructura existente.
- Los "digests criptográficos de procedencia" no se especifican en formato ni en API, por lo que no pueden auditarse con la información disponible.
- Para producción: no recomendado como componente crítico sin una evaluación propia exhaustiva, especialmente en decisiones de seguridad, cumplimiento o atención al cliente con impacto real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bbkdevops/axiom-omega-submarine-latentmoe
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Librería PEFT (necesaria segun el ejemplo de la model card): https://github.com/huggingface/peft
- Papers, blogs, repositorios o demos adicionales: no disponible
