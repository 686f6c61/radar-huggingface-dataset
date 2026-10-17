# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-026

## Resumen

Este repositorio contiene un ajuste fino del modelo Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL bajo el identificador `qwen3-4b-medicine-static-pilot-261016-step-026`. Se trata de un checkpoint intermedio: concretamente el paso 26 del entrenamiento con semilla 11 de la ejecución denominada `261016_medicine_static_pilot`, orientada a dominio médico. El modelo tiene 4.022.468.096 parámetros reales (verificados en los ficheros safetensors) y se distribuye con licencia Apache-2.0.

La arquitectura es la del modelo base, un transformer decoder-only denso de la familia Qwen3 en su variante "Instruct-2507", es decir, la revisión no pensante (sin modo de razonamiento extendido) de julio de 2025. Al ser un fine-tune, hereda las características del base: tokenizador multilingüe, plantillas de chat conversacional y soporte de contexto largo, aunque el autor no documenta en la model card ningún detalle sobre composición del dataset, número de tokens de entrenamiento ni método de optimización.

Su relevancia es fundamentalmente de investigación: se trata de un artefacto de experimentación (un "pilot" detenido en el paso 26) más que de un modelo listo para producción. Resulta útil para reproducir experimentos de ajuste fino en el ámbito biomédico, comparar checkpoints intermedios dentro de una misma ejecución y evaluar cómo evoluciona el comportamiento de un modelo de 4B al especializarse en un dominio concreto. El repositorio declara 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen3-4B-Instruct-2507 (no se documenta ninguna modificacion estructural en este repositorio) |
| Parametros totales | 4.022.468.096 (dato verificado en los safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en este repositorio; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos (dato del base, no verificado en este checkpoint) |
| Tipos de cuantizacion | Export en BF16 en la raiz del repositorio. No se publican cuantizaciones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base declara soporte multilingue, pero no se ha verificado en este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers); el directorio `original_checkpoint/` contiene los ficheros nativos de veRL/FSDP y sus metadatos |
| Tamano del repositorio | 25,7 GB (incluye el checkpoint nativo de entrenamiento ademas del export BF16) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tarea | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, sin mezcla de expertos ni capas de estado recurrente, heredado íntegramente del modelo base Qwen3-4B-Instruct-2507. No hay información en la model card sobre modificaciones arquitectónicas, ampliación de vocabulario, cambio de tokenizador ni poda de capas. La única información aportada por el autor es el identificador de la ejecución (`261016_medicine_static_pilot`), el número de paso (26) y la semilla (11).

El repositorio contiene, en su raíz, un export BF16 en formato Transformers y, en el directorio `original_checkpoint/`, los ficheros nativos de veRL/FSDP junto con sus metadatos. La presencia de veRL (framework de aprendizaje por refuerzo para modelos de lenguaje, también conocido como HybridFlow) apunta a un pipeline de RL o de SFT distribuido sobre FSDP, aunque la model card no especifica si se empleó RL (por ejemplo GRPO o PPO), SFT supervisado u otro esquema, ni si hubo fases de RLHF o DPO. Tampoco se documentan el número de tokens vistos, la composición del corpus médico utilizado, la proporción de datos sintéticos ni los hiperparámetros de entrenamiento. El texto de la model card indica que el checkpoint local se elimina únicamente tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que sugiere un pipeline de publicación automatizado orientado a la reproducibilidad.

## Capacidades

- Generación de texto y conversación multi-turno: es un modelo instructivo con pipeline `text-generation` y plantilla de chat conversacional, por lo que puede mantener diálogos con historial.
- Especialización declarada en medicina: el nombre de la ejecución (`medicine_static_pilot`) indica un ajuste fino orientado al dominio biomédico, aunque no se detalla el tipo de datos ni las tareas concretas.
- Herencia de capacidades del base: razonamiento general, código, matemáticas y conocimiento multilingüe proceden del modelo base Qwen3-4B-Instruct-2507; no se han verificado específicamente en este checkpoint.
- Tool calling / function calling: el modelo base Qwen3 soporta plantillas de llamada a herramientas, pero no se documenta si este fine-tune conserva dicha capacidad ni con qué fiabilidad.
- Uso como agente y razonamiento multi-paso: no documentado ni verificado en este repositorio.
- Modo de pensamiento extendido: no disponible; el base pertenece a la variante `-2507` de Qwen3, que precisamente eliminó el bloque de razonamiento largo en favor de respuestas directas.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio solo declara `text-generation`.
- Compatibilidad con TGI y endpoints: el tag `text-generation-inference` y `endpoints_compatible` indica que el export puede servirse con Text Generation Inference y con endpoints compatibles con la API de HuggingFace.

## Casos de uso

- Evaluación de checkpoints intermedios en dominio médico: sirve como punto de comparación dentro de la curva de entrenamiento de la ejecución `261016_medicine_static_pilot`. Permite medir qué porcentaje de la mejora en dominio médico se obtiene ya en el paso 26 frente a checkpoints posteriores, con el mismo pipeline de evaluación y la misma semilla.
- Ablaciones de datos y de hiperparámetros: al ser un artefacto de un experimento con semilla fijada (11), es adecuado para reproducir y comparar configuraciones de entrenamiento (composición del corpus, tasa de aprendizaje, número de pasos) en un modelo de 4B, donde cada ejecución es barata en comparación con modelos de 30B o superiores.
- Extracción de información de textos clínicos en investigación: con contexto largo heredado del base, puede procesar informes extensos y devolver campos estructurados (diagnóstico, tratamiento, dosis, fechas). Debe usarse únicamente sobre datos sintéticos o anonimizados y con validación humana, dado que es un checkpoint de investigación.
- Resumen de literatura biomédica: generación de resúmenes de artículos de PubMed o de guías clínicas para revisión posterior por un especialista. El tamaño de 4B permite ejecutarlo en una GPU de gama alta de consumo y procesar documentos largos sin partir el contexto.
- Generación de material educativo médico: elaboración de preguntas tipo test, casos clínicos simulados y explicaciones para estudiantes, con revisión por parte de docentes. Es un uso de bajo riesgo al no intervenir en decisiones clínicas.
- Prototipado local y despliegues con requisitos de privacidad: al ser un modelo de 4B con licencia Apache-2.0, puede ejecutarse en infraestructura propia sin enviar datos a servicios externos, lo que facilita pruebas de concepto en entornos con restricciones de confidencialidad.
- Base para un ajuste posterior alineado: puede servir como punto de partida para fases posteriores de SFT, DPO o RLHF sobre datos médicos revisados por expertos, ya que ya incorpora una adaptación inicial al dominio.
- Investigación sobre seguridad y alucinación en dominios sensibles: útil para estudiar cómo un ajuste de dominio estrecho afecta a la tasa de invenciones factuales, comparando sus salidas con las del modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a páginas no relacionadas: Hyundai Motor, el canal de YouTube "Hyu" y la plataforma de streaming Hayu).

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 7,5 GiB (8,04 GB) para 4.022 millones de parámetros a 2 bytes por parámetro.
- VRAM estimada en BF16/FP16: entre 9 y 11 GB incluyendo pesos, activaciones y caché KV para contextos cortos o moderados. Con contextos de 128k tokens o superiores, la caché KV puede añadir varios gigabytes adicionales, por lo que se recomienda una GPU de 24 GB o más.
- VRAM estimada en 8 bits: en torno a 4-5 GB de pesos, más overhead; viable en GPUs de 8-10 GB con contexto reducido.
- VRAM estimada en 4 bits: en torno a 2-2,5 GB de pesos; viable en GPUs de 6-8 GB con contextos cortos, aunque requeriría convertir el modelo, ya que no se publican cuantizaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 Ti Super para BF16 con contexto moderado; RTX 4090 24 GB, L40S, A100 40 GB y H100 para contextos largos o despliegues con concurrencia alta. En Apple Silicon, equipos con 16 GB o más de memoria unificada.
- Opciones de despliegue: Transformers (formato nativo del repositorio), vLLM y Text Generation Inference (los safetensors BF16 son compatibles), y endpoints compatibles con la API de HuggingFace. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que no está publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: el repositorio completo ocupa 25,7 GB, muy por encima del export BF16, porque incluye el checkpoint nativo de veRL/FSDP. Para solo inferencia basta con descargar los ficheros safetensors de la raíz.

## Comparativa con modelos similares

Los datos de la columna de contexto y licencia corresponden a las especificaciones publicadas de cada modelo base; el rendimiento no se puede comparar porque no hay benchmarks publicados para el modelo evaluado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-026 | 4.022 M | No disponible (base: 262.144 tokens) | Apache-2.0 | HuggingFace, 0 descargas, checkpoint intermedio | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.022 M | 262.144 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado | No disponible |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M aprox. | 131.072 tokens | Apache-2.0 | HuggingFace | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8.000 M aprox. | 131.072 tokens | Licencia comunitaria de Llama 3.1 | HuggingFace | No disponible |
| google/gemma-3-4b-it | 4.000 M aprox. | 131.072 tokens | Terminos de uso de Gemma | HuggingFace | No disponible |

Frente al base, este modelo solo se diferencia por el ajuste de dominio y por ser un checkpoint intermedio; no aporta cambios de tamaño ni de ventana de contexto. Frente a alternativas de 7-8B, ofrece la ventaja de un coste de inferencia menor y la posibilidad de ejecutarse en GPUs de consumo, a costa de una capacidad general previsiblemente inferior.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 26) de una ejecución piloto. La calidad final del entrenamiento es desconocida y no hay garantía de que las capacidades del modelo base se conserven intactas; un ajuste de dominio a tan pocos pasos puede degradar el rendimiento general o producir un ajuste inestable.
- No es un producto sanitario ni un dispositivo médico. No debe utilizarse para diagnóstico, prescripción, triaje clínico ni ninguna decisión que afecte a pacientes sin supervisión de un profesional cualificado.
- Riesgo elevado de alucinación en contenido médico: la model card no documenta el corpus de entrenamiento ni procesos de verificación factual, y el dominio biomédico concentra afirmaciones verificables donde los errores tienen consecuencias graves.
- Procedencia de los datos no documentada: no se especifica si el corpus médico contiene datos de pacientes, ni si estos fueron anonimizados o cuentan con consentimiento. Antes de cualquier uso, conviene asumir que no hay garantías sobre la licitud de los datos de entrenamiento.
- Idiomas no confirmados: no se declara qué idiomas cubre el ajuste. El castellano no está verificado y es posible que el fine-tune haya degradado el multilingüismo del base.
- Sesgos heredados: al derivar de Qwen3-4B-Instruct-2507, arrastra los sesgos de sus datos de preentrenamiento, potencialmente amplificados por un corpus de especialización no auditado.
- Capacidades de agente y tool calling no verificadas: aunque el base las soporta, no hay evidencia de que este checkpoint las mantenga con fiabilidad, por lo que no debería integrarse en pipelines automatizados que dependan de ellas.
- Sin soporte ni mantenimiento: 0 descargas y 0 likes, sin documentación adicional, sin benchmarks y sin autoría identificable más allá del nombre de usuario. No hay comunidad que reporte errores ni actualizaciones previstas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo del dominio (por ejemplo, normativa europea de productos sanitarios o RGPD) si reutiliza el modelo.
- El repositorio de 25,7 GB incluye el checkpoint nativo de entrenamiento; desplegarlo tal cual consume espacio y tiempo de descarga innecesarios para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-026
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no ha devuelto ningun recurso relacionado con este modelo; los resultados obtenidos corresponden a sitios sin relacion (Hyundai Motor, el canal de YouTube "Hyu" y la plataforma Hayu).
