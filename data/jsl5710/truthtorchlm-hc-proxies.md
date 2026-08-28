# jsl5710/TruthTorchLM-HC-proxies

## Resumen

TruthTorchLM-HC-proxies es un conjunto de 103 adaptadores LoRA diseñados para cuantificación de incertidumbre en modelos de caja negra (black-box UQ). Desarrollado por Jason Lucas (jsl5710) como artefacto complementario al benchmark TruthTorchLM-HC, estos adaptadores permiten puntuar la veracidad de las respuestas de un modelo objetivo (teacher) sin acceso a sus logits internos, leyendo únicamente los logits de un modelo estudiante pequeño entrenado por destilación a partir del texto generado por el teacher.

El problema que resuelve es la detección de alucinaciones en modelos propietarios o de gran tamaño donde no se dispone de probabilidades internas. En lugar de consultar al modelo objetivo, se entrena un proxy blanco (white-box) que imita su comportamiento de incertidumbre, logrando tiempos de inferencia de 25–45 ms al estar desacoplado del target. La relevancia actual radica en la creciente necesidad de auditar respuestas de LLMs en producción, especialmente cuando se usan APIs comerciales.

Los adaptadores se distribuyen bajo licencia Apache 2.0, con pesos en formato safetensors y configuración JSON para su integración mediante la librería PEFT. El repositorio ocupa 10.8 GB e incluye variantes para tres objetivos de entrenamiento (DALD, DisAAD y un método propio) sobre seis modelos base estudiantes y cuatro teachers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos base (Qwen3 0.6B/1.7B/4B, Llama-3.2/3.1 1B/3B/8B) |
| Parametros totales | No disponible (depende del adaptador y del modelo base; el repositorio completo ocupa 10.8 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no se especifica en la documentacion) |
| Tipos de cuantizacion | No disponible (los adaptadores se cargan en bfloat16; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

Los adaptadores se entrenan mediante destilacion de conocimiento desde un modelo teacher de caja negra hacia un modelo estudiante pequeño. El proceso utiliza solo el texto generado por el teacher, sin acceso a sus logits internos. Se definen tres objetivos de entrenamiento:

- **DALD** (masked SFT): ajuste fino supervisado con enmascaramiento de tokens.
- **DisAAD** (SFT + adversarial): ajuste fino supervisado combinado con entrenamiento adversarial.
- **Ours** (SFT + adversarial + uncertainty-aware): añade una componente consciente de la incertidumbre, con variantes que combinan oraculos (ecc, dse), pesos lambda (1, 2, 5, 10, 15, 20) y modos de lectura (edl, head). La configuracion base es `edl·ecc·λ5`.

Los teachers utilizados son Qwen3-32B, Llama-3.3-70B, GPT-4o (jhu-gpt-4o) y Claude Haiku 4.5 (jhu-claude-haiku-4.5). Los estudiantes abarcan desde 0.6B hasta 8B de parametros. El metodo de lectura recomendado para extraer la puntuacion de incertidumbre es la perplejidad (perplexity) sobre los logits del proxy, implementado en `scripts/mt_estimators.py` del repositorio GitHub.

## Capacidades

- Deteccion de alucinaciones en respuestas de modelos de caja negra mediante lectura de logits de un proxy blanco.
- Cuantificacion de incertidumbre sin acceso a probabilidades internas del modelo objetivo.
- Compatibilidad con multiples teachers: Qwen3-32B, Llama-3.3-70B, GPT-4o y Claude Haiku 4.5.
- Tres objetivos de entrenamiento (DALD, DisAAD, Ours) que permiten ajustar el equilibrio entre coste computacional y precision.
- Variantes configurables (oraculo, lambda, modo) para adaptar el comportamiento a diferentes escenarios.
- Integracion con la libreria PEFT de HuggingFace para carga y fusion de adaptadores.
- Lectura de logits del proxy con perplejidad como metrica de incertidumbre recomendada.

## Casos de uso

- **Auditoria de respuestas en produccion**: un sistema puede puntuar cada respuesta generada por un LLM propietario (por ejemplo, GPT-4o) usando el proxy entrenado, detectando posibles alucinaciones antes de entregar el resultado al usuario final.
- **Filtrado de respuestas de baja confianza en chatbots**: integrar el proxy como capa de control que descarta o marca respuestas con alta incertidumbre, reduciendo errores en atencion al cliente automatizada.
- **Evaluacion de calidad de APIs de pago**: comparar la fiabilidad de diferentes proveedores de LLM (OpenAI, Anthropic, etc.) sin depender de sus metadatos internos, usando un proxy comun.
- **Verificacion de hechos en pipelines RAG**: puntuar la coherencia entre la respuesta generada y el contexto recuperado, identificando pasajes donde el modelo inventa informacion.
- **Investigacion en calibracion de incertidumbre**: servir como herramienta para estudiar como se propaga la incertidumbre de modelos grandes a modelos pequenos destilados, y validar nuevos metodos de UQ.
- **Monitorizacion continua de modelos desplegados**: ejecutar el proxy en paralelo a un LLM en produccion para detectar degradaciones en la fiabilidad de las respuestas a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que los adaptadores son artefactos complementarios al benchmark TruthTorchLM-HC, pero no se incluyen tablas con metricas (MMLU, HumanEval, etc.) en la documentacion consultada. Se recomienda consultar el repositorio GitHub y el paper asociado para obtener datos de evaluacion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende del modelo base elegido. Para Qwen3-4B en bfloat16 se requieren aproximadamente 8 GB; para Llama-3.1-8B, unos 16 GB. Con cuantizacion (por ejemplo, 4 bits) puede reducirse a 4-6 GB para los modelos mas pequenos.
- **GPU recomendadas**: tarjetas consumer como RTX 3090 o RTX 4090 son suficientes para los estudiantes de hasta 4B. Para el estudiante de 8B se recomienda una A100 o similar con 24 GB o mas.
- **Compatibilidad con consumer GPU**: si, los adaptadores de 0.6B a 4B caben en GPUs de 8-12 GB con cuantizacion.
- **Opciones de despliegue**: transformers con PEFT (carga y fusion), vLLM (si se convierte el modelo fusionado a formato compatible), llama.cpp (mediante exportacion a GGUF), o cualquier framework que soporte safetensors y LoRA.
- **Latencia y throughput**: la descripcion indica 25–45 ms por consulta al estar desacoplado del teacher, lo que permite su uso en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada. TruthTorchLM-HC-proxies se posiciona como una solucion especifica para UQ en caja negra, diferenciandose de metodos que requieren acceso a logits del modelo objetivo. Para una comparativa cuantitativa, se recomienda revisar el benchmark TruthTorchLM-HC en el repositorio GitHub, donde se evaluan multiples metodos de deteccion de alucinaciones.

## Limitaciones y advertencias

- Los adaptadores estan entrenados para teachers especificos; su rendimiento puede degradarse si se aplican a modelos no incluidos en el conjunto de entrenamiento.
- La calidad de la cuantificacion de incertidumbre depende de la fidelidad de la destilacion; el proxy puede no capturar todos los matices del teacher.
- No es un modelo generativo: no produce texto, solo puntua respuestas dadas. No debe usarse como sustituto de un LLM.
- El repositorio no especifica idiomas soportados; es probable que el rendimiento varie segun el idioma de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento de los teachers (especialmente GPT-4o y Claude) para cumplir con sus terminos de servicio.
- No se proporcionan garantias de precision en dominios especializados (medicina, derecho, etc.) sin evaluacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jsl5710/TruthTorchLM-HC-proxies
- Repositorio GitHub: https://github.com/jsl5710/TruthTorchLM-HC
- Sitio web del proyecto TruthTorchLM: https://www.truthtorchlm.com/
- Paper en arXiv: https://arxiv.org/html/2507.08203v1
