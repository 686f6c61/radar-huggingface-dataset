# perplexity-ai/PII-Tracer

## Resumen

PII-Tracer es un modelo de detección y enmascarado de información personal identificable (PII) desarrollado por Perplexity AI, presentado junto con el benchmark PII-TRACE (arXiv:2609.22200). No es un modelo generativo: es un encoder bidireccional de aproximadamente 596 millones de parámetros construido sobre el backbone `perplexity-ai/pplx-embed-v1-0.6b` (familia Qwen3), que se ejecuta en modo encoder-only mediante `is_causal=false`, es decir, con atención bidireccional completa en lugar de la atención causal habitual en los modelos Qwen.

Sobre ese tronco se montan dos cabezas: una cabeza de clasificación de tokens (1024 → 37) que predice etiquetas BIOES sobre nueve categorías de PII y se decodifica con un Viterbi restringido para garantizar spans coherentes, y una cabeza de sensibilidad (1024 → 1) que produce un score a nivel de conversación calculado sobre el promedio de los estados ocultos. El modelo está pensado específicamente para datos conversacionales multi-turno, un escenario donde los detectores basados en reglas o en frases aisladas fallan por falta de contexto.

Su relevancia práctica está en que se distribuye con licencia MIT, admite hasta 4096 tokens por documento y ofrece empaquetados alternativos para vLLM, llama.cpp (GGUF) y MLX, lo que facilita integrarlo como capa de saneamiento previa al envío de prompts a un LLM de terceros o antes de persistir conversaciones en logs. El repositorio principal ocupa 1,2 GB y acumula 4853 descargas y 88 likes en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (Qwen3 con `is_causal=false`) con dos cabezas: token classification y sensitivity classification |
| Parámetros totales | 596.090.241 (~596 M según safetensors) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (`max_seq_len`); los documentos más largos deben trocearse |
| Tipos de cuantización | Pesos originales en bf16 (backbone) y fp32 (cabezas); GGUF en f16; MLX con proyecciones convertidas a 8 bits |
| Idiomas soportados | `en` y `multilingual` (sin desglose de idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), GGUF y MLX en repositorios separados |
| Pipeline | token-classification |
| Categorías PII | 9: `private_person`, `account_number`, `private_url`, `private_date`, `private_address`, `private_email`, `private_phone`, `other_pii`, `secret` |
| Etiquetado | BIOES sobre 37 etiquetas, decodificación con Viterbi restringido |
| Cabecera de sensibilidad | Clasificador binario por documento sobre `mean(hidden_states)` con activación sigmoide |
| Dependencias | `torch`, `transformers>=5.2`, carga con `trust_remote_code=True` |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 4853 / 88 |

## Arquitectura y entrenamiento

La arquitectura parte del backbone de embeddings `pplx-embed-v1-0.6b`, un Qwen3 de ~0,6 B de parámetros que aquí se ejecuta sin máscara causal: el `config.json` incluye un bloque `backbone` con `"is_causal": false`, y la implementación (`modeling_pii_masking.py`) construye el `Qwen3Model` estándar de Transformers pasando ese flag al backend de atención. El resultado es un encoder bidireccional, adecuado para etiquetado de secuencias, en lugar de un decoder autoregresivo. Sobre la representación de 1024 dimensiones se aplican dos proyecciones lineales independientes: una de 1024 → 37 para las etiquetas BIOES y otra de 1024 → 1 para la sensibilidad. La decodificación de spans usa un Viterbi con sesgos restringidos (`viterbi.*`) que impide transiciones BIOES inválidas. En el checkpoint, el backbone se guarda en bf16 bajo el prefijo `backbone.*`, las cabezas en fp32 (`token_cls_head.*`, `sensitivity_head.*`) y los escalares del Viterbi por separado.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de ajuste tipo RLHF/DPO (poco probables en un modelo discriminativo de este tipo). El trabajo asociado, PII-TRACE, se presenta como un benchmark de detección de PII sensible al contexto en conversaciones multi-turno con LLM, lo que sugiere que el modelo se entrenó y evaluó sobre diálogos; los detalles cuantitativos del dataset no constan en la model card. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal: la aportación técnica diferencial es el uso de un backbone de embeddings reutilizado en modo bidireccional con doble cabeza y decodificación restringida.

## Capacidades

- Detección token-level de PII con etiquetado BIOES en nueve categorías, incluyendo categorías poco habituales como `private_url`, `private_date` y `secret`.
- Enmascarado directo mediante `model.mask(text)`, que sustituye cada span por un placeholder del tipo `[PRIVATE_EMAIL]`, `[PRIVATE_PERSON]` o `[PRIVATE_PHONE]`.
- Salida estructurada de spans con etiqueta, offsets de inicio y fin, y el texto original, apta para postprocesado propio.
- Clasificación de sensibilidad a nivel de documento: un logit convertido con sigmoide que permite ordenar o filtrar conversaciones por riesgo.
- Contexto conversacional: la atención bidireccional sobre hasta 4096 tokens permite resolver referencias que un detector por frase no captaría.
- Soporte declarado de inglés y multilingüe, aunque sin lista de idiomas ni métricas por idioma.
- Serialización autocontenida: `save_pretrained(dir)` guarda también el tokenizer, de modo que el directorio resultante carga y predice por sí solo.
- Empaquetados para servir el modelo: repositorio vLLM con adaptador de scoring y cliente de decodificación, GGUF para `llama-server` con backbone f16 y cabezas fp32, y MLX con pesos de 8 bits (sin loader incluido en ese repositorio).
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un modelo puramente discriminativo.

## Casos de uso

- **Saneamiento previo al envío a LLM de terceros**: intercalar PII-Tracer en el gateway que conecta la aplicación con un proveedor externo, de modo que cada prompt se enmascare con `mask()` antes de salir y el texto original se rehidrate en la respuesta. El límite de 4096 tokens obliga a trocear prompts largos o a concatenar resultados por chunks.
- **Cumplimiento RGPD en pipelines de datos**: anonimizar corpus de conversaciones antes de almacenarlos o reutilizarlos para evaluación interna. La cabeza de sensibilidad permite separar conversaciones de alto riesgo y enviarlas a revisión humana en lugar de procesarlas automáticamente.
- **Redacción de transcripciones de soporte al cliente**: pasar las transcripciones por el modelo antes de incorporarlas a un sistema de analítica o de calidad; las etiquetas `private_person`, `private_phone` y `account_number` cubren los identificadores más frecuentes en este dominio.
- **Detección de secretos en prompts**: usar la categoría `secret` como guardrail para alertar o bloquear cuando un usuario pega claves de API, tokens de sesión o credenciales en el chat, integrándolo en la capa de validación previa a la inferencia.
- **Triaje de riesgo en conversaciones**: desplegar la cabeza de sensibilidad como clasificador barato (596 M de parámetros) que puntúa cada conversación y prioriza qué hilos revisa un equipo de confianza y seguridad.
- **Preprocesado de datasets para ajuste fino**: enmascarar PII en el corpus de entrenamiento antes de pasarlo a un modelo mayor, reduciendo el riesgo de que el modelo final memorice datos personales.
- **Evaluación comparativa de detectores**: utilizar el benchmark PII-TRACE y este checkpoint como referencia para medir alternativas basadas en reglas o en modelos NER genéricos en escenarios multi-turno.
- **Enmascarado en aplicaciones de chat internas**: ejecución en CPU o en GPU de gama media para entornos con requisitos de residencia de datos donde no se quiere depender de un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall ni F1 por categoría, y los resultados del paper PII-TRACE no se han proporcionado; no se han incluido cifras estimadas.

## Requisitos de hardware

- **VRAM estimada**: los pesos en bf16 ocupan aproximadamente 1,19 GB (596 M × 2 bytes), más las cabezas en fp32, de tamaño despreciable. Con activaciones para secuencias de 4096 tokens y atención bidireccional (coste cuadrático), una estimación prudente sitúa la inferencia en 2,5–4 GB de VRAM por petición.
- **Cuantización**: el GGUF f16 mantiene un consumo similar al bf16; la versión MLX de 8 bits reduce las proyecciones a aproximadamente la mitad.
- **GPU recomendadas**: cabe con holgura en RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB, RTX 4070/4080 y cualquier A10, L4 o A100/H100 con fines de servicio. Para batch alto o secuencias máximas conviene una GPU de 16 GB o más.
- **Consumer GPU**: sí, es un modelo apto para GPU de consumo; también puede ejecutarse en CPU, a costa de mayor latencia en secuencias largas.
- **Opciones de despliegue**: `transformers>=5.2` con `trust_remote_code=True` (referencia), vLLM mediante `perplexity-ai/PII-Tracer-vLLM`, llama.cpp/`llama-server` con `perplexity-ai/PII-Tracer-GGUF` y su cliente de decodificación, y MLX en Apple Silicon con `perplexity-ai/PII-Tracer-MLX` (requiere implementación propia del encoder bidireccional y las cabezas; no incluye loader).
- **Latencia y throughput**: no disponibles. Cabe esperar que el coste dominante sea la atención sobre 4096 tokens; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PII-Tracer | Encoder Qwen3 bidireccional con doble cabeza y Viterbi BIOES | ~596 M | 4096 tokens | MIT | HuggingFace, vLLM, GGUF, MLX |
| Microsoft Presidio | Motor de reglas y reconocedores (regex, spaCy, transformers) | no aplica (no es un modelo único) | depende del reconocedor | MIT | open source, SDK Python |
| piiranha | Modelo tipo DeBERTa-v3 ajustado para PII | ~0,4 B (no verificado en la información disponible) | no disponible | no disponible | HuggingFace |
| GLiNER (variantes large) | NER zero-shot basado en encoder | ~0,4 B en variantes large (no verificado) | no disponible | no disponible | HuggingFace |

Los datos de los modelos comparables no provienen de la información proporcionada y deben contrastarse en sus fichas oficiales. Frente a Presidio, la ventaja de PII-Tracer es el contexto bidireccional sobre diálogos completos y la categoría `secret`; frente a NER genéricos, aporta etiquetas específicas de privacidad, offsets listos para enmascarar y un score de sensibilidad por conversación.

## Limitaciones y advertencias

- **Truncado a 4096 tokens**: el modelo trunca la entrada a `max_seq_len`; es responsabilidad del integrador trocear documentos largos. Una entidad que cruce el punto de corte se perderá, y el contexto entre chunks no se propaga de forma nativa.
- **Dependencia de código remoto**: la carga requiere `trust_remote_code=True` y `transformers>=5.2`. Esto implica ejecutar código del repositorio y fija una versión mínima de la librería, con el consiguiente riesgo de compatibilidad y de cadena de suministro en entornos regulados.
- **Cobertura idiomática no documentada**: la model card declara `en` y `multilingual`, pero no detalla idiomas ni aporta métricas por lengua. El rendimiento en castellano o en idiomas distintos del inglés no está verificado.
- **Falsos negativos y positivos**: al ser un modelo discriminativo no genera texto, pero sí puede dejar pasar PII con formatos poco frecuentes (identificadores en tablas, JSON anidado, fragmentos de código) o marcar como PII cadenas que no lo son.
- **Sesgos**: no se documentan análisis de sesgo por nombre, origen, género o tipo de entidad; conviene auditar el comportamiento en los dominios concretos de despliegue.
- **Calibración del score de sensibilidad**: se desconoce si el sigmoide está calibrado; no debe usarse como probabilidad directa sin validación sobre datos propios.
- **Licencia**: MIT permite uso comercial, modificación y redistribución, con renuncia de garantías. No obstante, el cumplimiento normativo (RGPD, LOPDGDD) exige validación propia: el modelo es una ayuda técnica, no una garantía de anonimización.
- **Orden de los pasos**: enmascarar antes de persistir logs implica que el texto original debe descartarse o cifrarse; el enmascarado posterior no elimina una exposición ya producida.
- **Empaquetados alternativos**: los repositorios GGUF y MLX tienen limitaciones propias y el de MLX no incluye loader, por lo que requieren trabajo de integración adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perplexity-ai/PII-Tracer
- Paper PII-TRACE (arXiv:2609.22200): https://arxiv.org/abs/2609.22200
- Backbone de embeddings: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Empaquetado para vLLM: https://huggingface.co/perplexity-ai/PII-Tracer-vLLM
- Empaquetado GGUF: https://huggingface.co/perplexity-ai/PII-Tracer-GGUF
- Empaquetado MLX: https://huggingface.co/perplexity-ai/PII-Tracer-MLX
- Implementación incluida en el repo: `modeling_pii_masking.py`
- Perplexity AI: https://www.perplexity.ai/
- API de Perplexity: https://www.perplexity.ai/hub
