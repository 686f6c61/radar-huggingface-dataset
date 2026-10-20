# qikp/LFM2.5-1.2B-Thinking-GGUF

## Resumen

LFM2.5-1.2B-Thinking es un modelo de lenguaje de 1.170.340.608 parámetros (1,17 mil millones) desarrollado por Liquid AI dentro de la familia LFM2.5, una nueva generación de modelos híbridos disenada explicitamente para despliegue en dispositivo (*on-device*). La variante "Thinking" incorpora un modo de razonamiento explicito, y según la model card del autor se construye sobre la arquitectura LFM2 con un preentrenamiento extendido y una fase posterior de aprendizaje por refuerzo.

El repositorio que se analiza aquí, `qikp/LFM2.5-1.2B-Thinking-GGUF`, no es la publicación oficial de Liquid AI, sino una conversión a formato GGUF realizada por un tercero (usuario `qikp`) a partir del modelo base `LiquidAI/LFM2.5-1.2B-Thinking`. Su interés practico es que permite ejecutar el modelo con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.) en hardware modesto, algo coherente con el objetivo de la familia: inferencia local con huella de memoria reducida.

El modelo cubre ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y se distribuye bajo licencia LFM Open License v1.0. Es relevante ahora porque el segmento de modelos sub-2B con capacidad de razonamiento y soporte multilingüe se ha convertido en la opción por defecto para asistentes locales, agentes embebidos y procesamiento de texto en el borde de la red sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida, familia LFM2 (composición exacta de capas no detallada en la información disponible) |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; los niveles concretos incluidos no se detallan en la información disponible (el repositorio ocupa 9,2 GB, lo que sugiere varias cuantizaciones) |
| Idiomas soportados | Inglés (en), árabe (ar), chino (zh), francés (fr), alemán (de), japonés (ja), coreano (ko), español (es) |
| Licencia | LFM Open License v1.0 (`license_name: lfm1.0`, etiquetada como `other`) |
| Formato de pesos | GGUF (cuantizado) para llama.cpp |
| Pipeline | text-generation |
| Modelo base | LiquidAI/LFM2.5-1.2B-Thinking |
| Autoria de esta conversión | qikp (comunidad, no oficial de Liquid AI) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-19 |

## Arquitectura y entrenamiento

La model card describe LFM2.5 como "una nueva familia de modelos híbridos diseñados para despliegue on-device", construida sobre la arquitectura LFM2 mediante un preentrenamiento extendido seguido de una fase de aprendizaje por refuerzo. La información proporcionada no especifica la proporción de capas convolucionales frente a capas de atención, el número de tokens de entrenamiento, la composición del corpus ni los detalles del proceso de RL (algoritmo, datos de preferencia o recompensas utilizadas).

Sí se confirma que el modelo incorpora un modo de razonamiento ("Thinking"), coherente con la nomenclatura y con la recomendación de uso de temperatura muy baja (`--temp 0.05`) y `top-k 50`, `repeat-penalty 1.05` en el ejemplo oficial de llama.cpp: parámetros de decodificación típicos de modelos que generan cadenas de razonamiento donde se busca determinismo. La model card remite a la ficha del modelo base para obtener los detalles técnicos completos, que no están reproducidos aquí.

## Capacidades

- Generación de texto conversacional multi-turno: el ejemplo de uso emplea `llama-cli --conversation`, lo que implica plantilla de chat y gestión de historial.
- Razonamiento explicito en modo "Thinking", orientado a tareas que requieren pasos intermedios antes de la respuesta final.
- Soporte multilingüe en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Inferencia en el borde: el modelo está disenado para ejecutarse en dispositivo con llama.cpp, sin GPU dedicada necesariamente.
- Compatibilidad con el ecosistema llama.cpp y con endpoints declarados como compatibles (`endpoints_compatible` en los tags).
- Capacidad de código, matemáticas, tool calling o agentes: no disponible en la información proporcionada; no se documenta ninguna de estas capacidades en la model card consultada.

## Casos de uso

- Asistente local en escritorio o portátil: al ser un GGUF de 1,17 B, puede ejecutarse con llama.cpp en CPU o en una GPU de gama de entrada, ofreciendo un asistente privado que no envía datos a la nube.
- Preprocesado de texto en el borde de la red: clasificación, resumen y reescritura de documentos en dispositivos con recursos limitados, donde el coste por inferencia de un modelo de 1,17 B es muy inferior al de un modelo de 7 B o superior.
- Atención al cliente en despliegues con requisitos de soberanía del dato: al poder ejecutarse on-premise, permite gestionar conversaciones multi-turno sin que el contenido salga de la infraestructura de la organización.
- Aplicaciones multilingües en mercados mixtos: la cobertura de español, francés, alemán, árabe, chino, japonés y coreano permite un único modelo para productos con usuarios en varias regiones, simplificando el mantenimiento.
- Razonamiento asistido en herramientas de desarrollo: el modo Thinking con temperatura baja (0,05) encaja en tareas de depuración, explicación de fragmentos de código o generación de pasos de solución donde se prioriza la consistencia sobre la creatividad.
- Prototipado rápido e investigación: al ser un GGUF ligero, sirve como banco de pruebas para evaluar estrategias de prompting, plantillas de chat o decodificación restringida antes de escalar a modelos mayores.
- Filtrado y enrutamiento en pipelines de IA: usar el modelo como clasificador o router previo que decida si una consulta necesita un modelo mayor, reduciendo coste en arquitecturas con varios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, y remite a la ficha del modelo base para obtener más detalles.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,7-1,0 GB para pesos en cuantizaciones de 4 bits y en torno a 2,3-2,5 GB en FP16, a lo que hay que sumar la caché KV (dependiente de la longitud de contexto, no disponible). Cifras estimadas a partir del número de parámetros, no medidas publicadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para cuantizaciones de 4-8 bits; para FP16 bastan 4-6 GB. No se requieren A100 ni H100; el modelo está pensado para hardware de borde.
- Cabe en GPU consumer: sí, en tarjetas de gama de entrada y media (por ejemplo, serie RTX xx50/xx60 en adelante) e incluso en iGPU con memoria unificada, además de en CPU.
- Opciones de despliegue: llama.cpp (soporte nativo, formato GGUF), Ollama y LM Studio mediante importación del GGUF, y servidores compatibles con la API de llama.cpp. vLLM y TGI no se citan en la información disponible para este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo en la información consultada.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse antes de tomar decisiones; los de LFM2.5 se limitan a lo indicado en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (esta ficha) | 1,17 B | No disponible | LFM Open License v1.0 | Híbrido, orientado a on-device, 8 idiomas, modo Thinking |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Transformer denso, licencia permisiva, muy extendido en despliegues locales |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Contexto muy amplio, ecosistema amplio de herramientas |
| Gemma 3 1B Instruct | ~1 B | 32.000 tokens | Gemma Terms of Use | Optimizado para dispositivo, restricciones de uso comercial en los términos |

La ventaja diferencial de LFM2.5-1.2B-Thinking frente a estas alternativas es su naturaleza híbrida y el modo de razonamiento explicito en un tamano muy contenido; su desventaja principal, a falta de datos publicados, es la ausencia de benchmarks verificables y una licencia no estandar que requiere revisión legal.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay métricas que permitan validar la calidad del modelo frente a alternativas; cualquier decisión en producción debería apoyarse en una evaluación propia.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Conversión de terceros: este repositorio no es oficial de Liquid AI y solo registra 0 descargas y 0 likes; para producción conviene usar el GGUF oficial publicado por el autor del modelo o convertir desde los pesos originales verificando el hash.
- Licencia no estandar: LFM Open License v1.0 está etiquetada como `other`; los términos concretos (umbrales de facturación, atribución, restricciones de uso comercial) no se detallan en la información disponible y deben revisarse en el archivo LICENSE antes de cualquier despliegue comercial.
- Cobertura idiomática limitada a ocho idiomas: no incluye portugués, italiano ni neerlandés, entre otros; el rendimiento relativo por idioma no está documentado.
- Riesgo de alucinación: inherente a un modelo de 1,17 B, especialmente en tareas de conocimiento factual extenso; no se han publicado evaluaciones de fidelidad ni tasas de error.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez en la información proporcionada.
- Modo Thinking con coste adicional: el razonamiento explicito incrementa el número de tokens generados y, por tanto, la latencia; conviene desactivarlo o limitarlo en aplicaciones sensibles a la latencia.
- Cuantización: al tratarse de pesos GGUF cuantizados, es esperable una degradación respecto al modelo en precisión completa, especialmente en tareas de razonamiento y en idiomas distintos del inglés; no se documenta la magnitud de esa perdida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/qikp/LFM2.5-1.2B-Thinking-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- GGUF oficial de referencia (citado en la model card): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-GGUF
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Plataforma LEAP: https://leap.liquid.ai/
- Comunidad en Discord: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Contacto comercial de Liquid AI: https://www.liquid.ai/contact
