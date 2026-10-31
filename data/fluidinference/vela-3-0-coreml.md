# FluidInference/vela-3.0-coreml

## Resumen

Vela 3.0 (vela3-fast, 0.4B) en formato Core ML es la conversión para Apple silicon del modelo `vllm-sr/vela3-fast`, desarrollado por vLLM Semantic Router junto a KR Labs dentro de la familia Vela 3.0, y empaquetado por FluidInference. No se trata de un modelo generativo convencional, sino de un codificador UltraBERT de 380 millones de parámetros especializado en tareas de decisión rápida ("system one"): responder preguntas de elección o sí/no sobre opciones definidas por el usuario, detectar 17 tipos de información personal (PII) y señalar fragmentos de una respuesta que su contexto no respalda (detección de alucinaciones y afirmaciones no soportadas).

Su relevancia está en la ejecución íntegramente en dispositivo (on-device) en Mac e iOS: una sola pasada del codificador responde una pregunta en entre 6,7 y 37,6 ms en un MacBook Pro M5 Pro, sin enviar datos a la nube. Esto lo hace idóneo como componente de enrutado semántico, filtrado de PII y verificación de fidelidad en pipelines de IA locales. La conversión a Core ML mantiene la fidelidad frente al release original en fp32 de PyTorch (0 diferencias en 1.200 decisiones de test) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UltraBERT (codificador tipo BERT con capas locales y ventana deslizante de 128 tokens), adaptador LoRA fusionado para spans |
| Parametros totales | 380 M (UltraBERT-380M); el paquete Core ML pesa ~726 MB en fp16 |
| Parametros activos | no disponible (no es MoE; todos los parámetros se usan en cada pasada) |
| Longitud de contexto | 1.024 tokens por pasada del codificador (el release original usa 8.192 para spans) |
| Tipos de cuantizacion | fp16 (paquetes Core ML); cabezas de lectura (readout heads) en fp32 en el host |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage) + safetensors para las cabezas de decisión y spans; tokenizer.json |

## Arquitectura y entrenamiento

El modelo base es un codificador UltraBERT de 380 millones de parámetros con atención local mediante ventana deslizante de 128 tokens (exportada en Core ML como máscara de banda) y dos bases RoPE precalculadas. Sobre el backbone de decisión se monta un adaptador `span_sets` con LoRA fusionada en pesos densos, que habilita los dos conjuntos de etiquetas de spans: los 17 tipos de PII y la etiqueta `unsupported`. Las cabezas de lectura se mantienen en fp32 en el host para preservar precisión.

Los datos y el proceso de entrenamiento del modelo original no están disponibles en la información proporcionada. La conversión a Core ML se verificó contra el release fp32 de PyTorch: en el conjunto typed-decisions TEST (1.200 preguntas de elección y sí/no) ninguna respuesta difiere, con una diferencia máxima de probabilidad de 0,0026; en 25 pasajes variados con 183 spans de PII los conjuntos de spans son idénticos, y lo mismo ocurre con los pares contexto/respuesta de afirmaciones no soportadas. En un documento sintético de 20.000 palabras con 2.971 valores plantados, el modelo detecta el 99,5 % (2.956) con 30 falsos positivos adicionales.

## Capacidades

- Decisiones tipadas: preguntas de elección entre opciones nombradas por el usuario y preguntas sí/no (`choice` / yes-no), con instrucciones y criterios personalizables.
- Detección de PII: identificación de 17 tipos de información personal con posición exacta (inicio, fin), texto y puntuación por span.
- Detección de afirmaciones no soportadas: señala las palabras concretas de una respuesta que su contexto no respalda, útil como detector de alucinaciones.
- Clasificación zero-shot: el pipeline de HuggingFace es zero-shot-classification; las categorías se definen en tiempo de inferencia sin reentrenamiento.
- Ejecución en dispositivo en Apple silicon (GPU), sin dependencia de la nube.
- Entradas de hasta 1.024 tokens por pasada; para spans en documentos largos se aplica ventanado a 1.024 tokens.
- No soporta: el tipo de pregunta `score` del release original, ni los demás adaptadores del release (NER de etiquetas abiertas, relaciones, evidencia, señales de router, dominio, fact-check, feedback).

## Casos de uso

- Enrutado semántico de peticiones en vLLM Semantic Router: clasificar la intención de cada petición entrante (por ejemplo, reembolso frente a cancelación) en pocos milisegundos para dirigirla al modelo o agente adecuado, sin coste de API.
- Detección de PII previa al envío a LLM: analizar tickets de soporte, notas clínicas, informes de RR. HH. o chats bancarios en el dispositivo y enmascarar los 17 tipos de datos personales antes de que el texto salga del entorno local.
- Verificación de fidelidad en generación asistida: comparar la respuesta de un LLM con su contexto recuperado (RAG) y resaltar las palabras concretas no respaldadas, como en el ejemplo de dosificación de paracetamol donde señala "6 g" como no soportado.
- Priorización de incidencias: evaluar urgencia declarada ("el cliente necesita una respuesta rápida") junto a la intención en una sola pasada del codificador.
- Cumplimiento normativo en apps iOS/macOS: dado que funciona con Core ML en iOS 18+ y macOS 15+, puede integrarse en apps móviles que procesen datos sensibles sin transmitirlos a servidores.
- Clasificación zero-shot personalizable: definir categorías ad hoc (por ejemplo, clasificar consultas de clientes por tema) sin reentrenar ni etiquetar datos.
- Moderación y control de calidad de respuestas automáticas: filtrar en local las respuestas de un agente que contengan afirmaciones no respaldadas antes de mostrarlas al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican mediciones de velocidad y fidelidad de la conversión:

| Función del codificador | Decisión (ms) | Span sets (ms) |
|---|---:|---:|
| L128 | 6,7 | no disponible |
| L256 | 9,5 | no disponible |
| L512 | 17,6 | 18,7 |
| L1024 | 37,6 | 37,5 |

Mediciones en MacBook Pro M5 Pro con GPU. Una pasada del codificador responde una pregunta; la propia pregunta (opciones o descripciones de las 17 etiquetas de PII, ~250 tokens) cuenta para la longitud, por lo que una pasada de PII sobre un párrafo suele usar L512: unos 0,5 ms por palabra de extremo a extremo. En el test de fidelidad: 0/1.200 decisiones diferentes, diferencia máxima de probabilidad 0,0026; 99,5 % de recall en 2.971 valores plantados en un documento de 20.000 palabras con 30 flags adicionales.

## Requisitos de hardware

- Requisito de sistema: macOS 15+ o iOS 18+ (plataforma Apple silicon con Core ML).
- Memoria: el paquete de decisión pesa 726 MB en fp16 y el de spans 725 MB; cabe con holgura en la memoria unificada de cualquier Mac con Apple silicon y en iPhone/iPad recientes.
- GPU: se ejecuta en la GPU integrada de Apple silicon por defecto. No requiere GPU dedicada tipo A100/H100/RTX; no es un modelo para servidor con CUDA.
- Neural Engine: no recomendado; el autor indica que fue más lento en todas las longitudes y se desvió más de las respuestas fp32 (15/1.200 decisiones cambiaron).
- No cabe la noción de consumer GPU NVIDIA: está diseñado específicamente para hardware Apple; la ejecución en otras plataformas requeriría el modelo PyTorch original (`vllm-sr/vela3-fast`).
- Despliegue: runtime propio `vela3_coreml.py` (Python con coremltools, tokenizers y torch solo para las cabezas pequeñas). No aplica vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia: 6,7–37,6 ms por decisión según longitud; ~0,5 ms por palabra en detección de PII de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Vela 3.0 Core ML (vela3-fast) | 380 M | decisiones, PII, spans no soportados | 1.024 tokens | Apache-2.0 | Apple silicon (Core ML) |
| vllm-sr/vela3-fast (original) | 380 M | mismas tareas + más adaptadores | 8.192 tokens (spans) | Apache-2.0 | PyTorch / CUDA |
| DeBERTa-v3-base (zero-shot NLI) | ~86 M | clasificación zero-shot | 512 tokens | MIT | multiplataforma |

Frente a un clasificador zero-shot NLI típico como DeBERTa-v3, Vela 3.0 ofrece tareas más estructuradas (decisiones tipadas con criterios, spans de PII con 17 etiquetas y detección de afirmaciones no respaldadas) y un contexto mayor, a cambio de estar restringido a Apple silicon en esta conversión. Frente al release PyTorch original, esta versión pierde los demás adaptadores y reduce el contexto de spans de 8.192 a 1.024 tokens, pero gana ejecución nativa en dispositivo con latencias de milisegundos.

## Limitaciones y advertencias

- Solo están convertidos el backbone de decisión y el adaptador `span_sets` (17 tipos de PII y `unsupported`); los demás adaptadores del release (NER de etiquetas abiertas, relaciones, evidencia, señales de router, dominio, fact-check, feedback) no están disponibles en esta conversión.
- El tipo de pregunta `score` del release original no está soportado.
- Entradas limitadas a 1.024 tokens por pasada; los inputs de decisión más largos lanzan `Unsupported` y los de span se ventanan a 1.024 tokens (el release original usa 8.192), por lo que los spans en documentos largos pueden diferir del modelo original.
- No usar el Neural Engine: es más lento y altera resultados (15/1.200 decisiones cambiaron respecto a fp32).
- Datos de entrenamiento, composición del dataset, sesgos conocidos y tasas de alucinación del modelo base no están disponibles en la información proporcionada; debe evaluarse el riesgo en cada dominio antes de uso en producción.
- Idiomas soportados no especificados; verificar el rendimiento en castellano antes de desplegar.
- La licencia Apache-2.0 no impone restricciones al uso comercial, pero conviene revisar los umbrales del release (`vela3_config.json`) al ajustar precision/recall en producción.
- Proyecto con adopción temprana (79 descargas y 4 likes en el momento de la ficha): esperar una comunidad y documentación limitadas.

## Enlaces

- Modelo Core ML: https://huggingface.co/FluidInference/vela-3.0-coreml
- Modelo base original: https://huggingface.co/vllm-sr/vela3-fast
- Informe de verificación de la conversión: `reports/verify.txt` dentro del repositorio del modelo
- Paper, blog o demo adicional: no disponible
