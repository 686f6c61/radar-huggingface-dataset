# FrontiersMind/Lumma-fev-27B-v2

## Resumen

Lumma-Fev-27B-v2 es un modelo de decisión (decision model) desarrollado por FrontiersMind. A diferencia de un LLM generativo convencional, no produce texto: recibe un estado (texto, JSON o array) junto con preguntas tipadas y devuelve, en una sola pasada hacia adelante, una probabilidad calibrada para cada opción. Esto elimina la necesidad de parsear respuestas generadas y reduce la variabilidad típica de los LLM en tareas de clasificación y decisión. Es un fine-tune de pesos completos de Qwen3.8-27B y sucesor de Lumma-Fev-27B, entrenado con el framework DecisionFormer.

La principal novedad de la versión 2 es la atención bidireccional en las capas de full attention (el prompt se lee en ambas direcciones, como un encoder), mientras que las capas de Gated DeltaNet (atención lineal) permanecen causales. Además, el conjunto de entrenamiento se ha ampliado de unos 100K a unos 300K ejemplos. El modelo funciona en inglés, hindi, tamil y kannada (incluido Hinglish) y destaca por su calibración: log loss de 0,307 y ECE de 0,024 en promedio sobre ocho benchmarks, muy por debajo de su predecesor y del modelo competidor Jev.

Su relevancia práctica radica en los casos de uso donde se necesitan decisiones estructuradas y probabilidades fiables (enrutado de tickets, moderación, evaluación de riesgos, clasificación multietiqueta) sin los costes ni la latencia de la generación de texto. Se distribuye bajo licencia Apache 2.0 en safetensors, con un tamaño de repositorio de 52,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (full attention bidireccional + Gated DeltaNet lineal causal), basado en Qwen3.8-27B |
| Parametros totales | 26.085.330.160 (≈26,1B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens (una pregunta más el estado deben caber en esa ventana) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | inglés, hindi, tamil, kannada (y Hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (52,2 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, una arquitectura híbrida que combina capas de atención completa con capas de Gated DeltaNet (atención lineal). La innovación central de Lumma-Fev-27B-v2 es el modo de atención no causal en las capas de full attention: el `decision_config.json` define `"attention_mode": "noncausal_full_attention"`, de modo que el prompt se procesa bidireccionalmente como en un encoder, mientras que las capas de atención lineal mantienen la causalidad. Este cambio requiere cuidado en la carga manual: hay que establecer `is_causal = False` tanto en la configuración de texto como en cada módulo de atención, ya que modificar solo la configuración hace que las peticiones sin padding se ejecuten causalmente.

El entrenamiento se realizó con el framework DecisionFormer (repositorio público de FrontiersMind) sobre aproximadamente 300.000 muestras, el triple que su predecesor. Los splits de entrenamiento incluyen AG News, BANKING77, Emotion, RAGTruth y WinoGrande, por lo que esos cinco benchmarks son in-distribution para el modelo; Financial PhraseBank, JudgeBench y BBH no forman parte de sus datos de entrenamiento y constituyen la evaluación out-of-distribution. El modelo se entrenó con preguntas de tipo `noul` y `choice`; las preguntas de tipo `score` se aceptan pero no han sido probadas. No hay información disponible sobre el uso de RLHF o DPO.

## Capacidades

- Clasificación de opciones múltiples (`choice`): devuelve la opción elegida, un nivel de confianza y la distribución de probabilidades completa para cada opción.
- Preguntas binarias o de decisión (`noul`): responde a preguntas tipadas sobre el estado con una probabilidad.
- Preguntas de tipo `score`: aceptadas por la API pero sin probar durante el entrenamiento.
- Salida estructurada sin generación de texto: todas las probabilidades se obtienen en una sola pasada hacia adelante, sin necesidad de parseo.
- Procesamiento de imágenes: soporta pasar imágenes (rutas, objetos PIL o URLs `data:`) instalando el extra `lumma-fev[images]`.
- Multilingüe: inglés, hindi, tamil, kannada y Hinglish.
- Preguntas independientes: cada pregunta lee solo el estado y sus propias opciones, de modo que una respuesta nunca influye en otra.
- Entrada flexible: el estado puede ser texto plano, un objeto JSON o un array.
- No genera texto libre ni soporta tool calling, agentes ni razonamiento multi-paso en el sentido generativo: es un modelo especializado en decisión.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una consulta de cliente, el modelo asigna el equipo adecuado (facturación, soporte técnico, ventas) con probabilidades por opción, como muestra el propio ejemplo de la model card, ideal para automatizar triaje en mesas de ayuda.
- Clasificación de urgencia y priorización: con preguntas `noul` del tipo "¿el cliente necesita respuesta hoy?", se pueden construir colas de atención priorizadas con probabilidades calibradas en lugar de etiquetas binarias rígidas.
- Detección de alucinaciones o riesgo en RAG: el entrenamiento incluye RAGTruth, lo que lo hace adecuado para puntuar si una respuesta generada está fundamentada en el contexto recuperado.
- Moderación y clasificación de contenido multilingüe: el soporte de hindi, tamil, kannada e Hinglish permite clasificar contenido en la India sin depender de traducción previa.
- Clasificación de noticias y textos cortos: entrenado con AG News y Emotion, es apto para categorización de titulares, análisis de sentimiento y detección de emoción en producción.
- Evaluación de respuestas de LLM (judge): JudgeBench está fuera de su distribución de entrenamiento pero se incluye en su evaluación, lo que sugiere su uso como juez automático de calidad de respuestas.
- Clasificación financiera de frases: aplicable a Financial PhraseBank (out-of-distribution en su evaluación), por ejemplo para etiquetar titulares económicos como positivos, neutros o negativos.
- Servidor de decisiones centralizado: mediante `lumma-fev-serve` se puede exponer como API `POST /v1/systemone` compatible con TypeSafe, integrándolo en pipelines de decisión de microservicios.

## Benchmarks y rendimiento

Calibración (promedio sobre ocho benchmarks; menor es mejor):

| Métrica | Lumma-Fev-27B-v2 | Lumma-Fev-27B | Jev |
|---|---|---|---|
| Log loss | **0,307** | 0,350 | 1,315 |
| ECE | **0,024** | 0,028 | 0,088 |
| Brier | **0,178** | 0,206 | 0,291 |

Los resultados de accuracy se publican en una imagen comparativa (`lumma-fev-27b-v2-vs-jev.png`) incluida en la model card; los valores numéricos exactos por benchmark no están disponibles en formato de texto. Los ocho benchmarks cubren AG News, BANKING77, Emotion, RAGTruth y WinoGrande (in-distribution) más Financial PhraseBank, JudgeBench y BBH (out-of-distribution). No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- Se necesita una GPU con unos 55 GB libres para inferencia; la recomendación del autor es una tarjeta de 80 GB (por ejemplo, A100 o H100).
- Alternativamente, se pueden usar varias GPUs más pequeñas con `device_map="auto"` (instalando `pip install "lumma-fev[large]"`).
- No cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB es insuficiente con los pesos sin cuantizar; no hay variantes cuantizadas disponibles).
- Despliegue mediante el paquete oficial `lumma-fev` (versión 0.3 o posterior, obligatoria para aplicar la atención bidireccional; versiones anteriores rechazan cargar el checkpoint).
- Servidor HTTP incluido: `lumma-fev-serve --model 27b-v2 --host 0.0.0.0 --port 8000`, con API `POST /v1/systemone` compatible con TypeSafe.
- Para máximo rendimiento instalar los kernels `flash-linear-attention` y `causal-conv1d`; sin ellos, transformers usa código PyTorch más lento.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible; el ecosistema de despliegue es el paquete `lumma-fev`.
- Latencia y throughput: no disponibles; el autor solo indica que toda la decisión se resuelve en una sola pasada hacia adelante.

## Comparativa con modelos similares

| | Lumma-Fev-27B-v2 | Lumma-Fev-27B | Jev |
|---|---|---|---|
| Desarrollador | FrontiersMind | FrontiersMind | no disponible |
| Parametros | ≈26,1B | ≈26,1B | no disponible |
| Atencion | Full attention bidireccional + Gated DeltaNet causal | no disponible | no disponible |
| Muestras de entrenamiento | ≈300K | ≈100K | no disponible |
| Log loss | 0,307 | 0,350 | 1,315 |
| ECE | 0,024 | 0,028 | 0,088 |
| Brier | 0,178 | 0,206 | 0,291 |
| Licencia | Apache 2.0 | Apache 2.0 | no disponible |

Frente a su predecesor, la v2 mejora las tres métricas de calibración y triplica los datos de entrenamiento, además de introducir la atención bidireccional. Frente a Jev, la mejora en calibración es drástica (log loss de 0,307 frente a 1,315). Como alternativas generales de clasificación, un LLM generativo convencional podría usarse con prompting, pero el modelo está específicamente optimizado para producir probabilidades calibradas en una sola pasada. No hay información disponible sobre otros modelos competidores de la misma categoría.

## Limitaciones y advertencias

- No genera texto: no es sustituto de un LLM generativo; solo produce probabilidades para opciones predefinidas.
- Las preguntas de tipo `score` se aceptan pero no fueron probadas en entrenamiento, por lo que su comportamiento no está garantizado.
- La ventana efectiva es de 8.192 tokens por pregunta más estado; entradas más largas no son compatibles.
- Versión mínima obligatoria de la librería: `lumma-fev>=0.3`; versiones anteriores no aplican la atención bidireccional y se niegan a cargar el checkpoint.
- La carga manual de pesos es propensa a errores: si solo se establece `is_causal = False` en la configuración pero no en cada módulo de atención, las peticiones sin padding se ejecutan causalmente, degradando silenciosamente el rendimiento.
- Cinco de los ocho benchmarks de evaluación (AG News, BANKING77, Emotion, RAGTruth, WinoGrande) forman parte de sus datos de entrenamiento, por lo que los resultados en ellos son in-distribution y deben interpretarse con cautela; los resultados out-of-distribution relevantes son Financial PhraseBank, JudgeBench y BBH.
- Requiere hardware de gama alta (≈55 GB de VRAM), lo que limita el despliegue en entornos pequeños; no hay cuantizaciones publicadas.
- Sin kernels optimizados (`flash-linear-attention`, `causal-conv1d`), la inferencia usa código PyTorch más lento.
- Riesgo de sesgo y alucinación: al no generar texto, el riesgo de alucinación textual desaparece, pero no hay información disponible sobre sesgos específicos del modelo.
- Licencia Apache 2.0: sin restricciones para uso comercial.
- Adopción muy temprana: 80 descargas y 4 likes en Hugging Face en el momento de la ficha, sin comunidad consolidada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/Lumma-fev-27B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Predecesor: https://huggingface.co/FrontiersMind/Lumma-fev-27B
- Framework de entrenamiento DecisionFormer: https://github.com/FrontiersMindAI/decisionformer
- Paquete de Python lumma-fev: https://pypi.org/project/lumma-fev/
