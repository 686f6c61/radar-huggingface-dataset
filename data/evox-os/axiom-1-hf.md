# evox-os/axiom-1-hf

## Resumen

`evox-os/axiom-1-hf` es una adaptación LoRA (PEFT) publicada por **evox-os** sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No se trata de un modelo entrenado desde cero, sino de un artefacto de ajuste fino orientado a desarrollo y entrenamiento: la propia model card lo describe como "un artefacto de capacitación, no la identidad completa de AXIOM". El recuento real de parámetros almacenados en safetensors es de 494.032.768, coherente con el tamano del modelo base.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de adaptador PEFT ligero orientado a inferencia local (WebGPU, Ollama, AXIOM Core, vLLM o `transformers`), y como punto de partida para quien quiera reproducir un pipeline SFT/DPO sobre Qwen2.5-0.5B. El autor declara que los datos de entrenamiento provienen de la "distribución interna del flywheel de AXIOM (SFT/DPO)", sin especificar volumen de tokens, composición ni mezcla de idiomas.

El repositorio no aporta métricas de evaluación, no declara idiomas soportados y, en el momento de la consulta, acumula 0 descargas y 0 likes. La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial del adaptador, aunque el autor anota una "Regla R1 (soberanía)" de carácter declarativo que no altera los términos de la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen2.5-0.5B-Instruct`; el modelo base es un transformer decoder denso con RoPE, RMSNorm, SwiGLU y GQA, según su documentación pública |
| Parámetros totales | 494.032.768 (dato real del recuento de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Qwen2.5-0.5B-Instruct documenta 32.768 tokens |
| Tipos de cuantización | No disponible en la ficha del adaptador; al derivar de Qwen2.5 admite los formatos estándar del ecosistema (GGUF, AWQ, GPTQ, bitsandbytes) siempre que se apliquen sobre los pesos fusionados |
| Idiomas soportados | No disponible en los metadatos del modelo |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `peft`); también etiquetado con `transformers` y `text-generation-inference` |

## Arquitectura y entrenamiento

El repositorio es un adaptador LoRA publicado con `library_name: peft`. No se documenta rango (rank), alpha, módulos objetivo ni si los pesos han sido fusionados con el modelo base: el tamano del repositorio (1,0 GB) es notablemente superior al de un adaptador LoRA típico para un modelo de 0,5B, lo que sugiere que puede contener pesos fusionados o almacenados en mayor precisión, pero es una inferencia a partir del tamano del repo y no un dato confirmado por el autor. La carga recomendada es `AutoPeftModelForCausalLM.from_pretrained("evox-os/axiom-1-hf")`.

En cuanto al entrenamiento, la model card solo indica que los datos proceden de la "distribución interna del flywheel de AXIOM" con etapas SFT y DPO. No se especifica el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF adicional, ni hiperparámetros de ajuste. El modelo base heredado, Qwen2.5-0.5B-Instruct, sí está documentado públicamente por el equipo Qwen con preentrenamiento a gran escala y posterior ajuste por instrucciones, pero esas cifras corresponden al modelo base y no se han replicado ni verificado para este adaptador.

## Capacidades

- Generación de texto conversacional, pipeline declarado `text-generation` y etiqueta `conversational`.
- Ajuste fino orientado a instrucciones sobre un modelo Instruct, por lo que se espera seguimiento básico de instrucciones y formato de chat, aunque sin evaluación publicada para el adaptador.
- Razonamiento de complejidad baja y tareas de formato corto: el modelo base de 0,5B tiene capacidad limitada para razonamiento multi-paso, matemáticas y lógica encadenada.
- Soporte de tool calling / function calling: no verificado en esta adaptación; el modelo base Qwen2.5-0.5B-Instruct declara soporte de function calling en su documentación pública.
- Soporte de agentes y razonamiento multi-paso: no disponible (sin evaluación ni documentación).
- Capacidades multilingües: no disponibles en los metadatos del adaptador; el modelo base declara soporte multilingüe según su documentación, pero no se ha verificado su preservación tras el ajuste.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), visión ni audio.
- Inferencia local: la model card recomienda explícitamente Ollama, vLLM o `transformers` en la propia máquina, y menciona WebGPU y "AXIOM Core" como entornos de producto.

## Casos de uso

- Asistente conversacional en el dispositivo (edge): con ~494M parámetros, el modelo puede ejecutarse íntegramente en local mediante Ollama o WebGPU, sin enviar datos a servidores externos. Es adecuado para asistentes de privacidad estricta con cargas conversacionales cortas.
- Enrutado de intenciones y clasificación de consultas: en un sistema de agentes, un modelo de este tamano puede actuar como clasificador rápido que decide a qué herramienta o submodelo derivar cada petición, reduciendo latencia y coste frente a un modelo grande.
- Prototipado de pipelines SFT/DPO: sirve como banco de pruebas para validar scripts de `peft`, `transformers` y `trl` antes de escalar a modelos mayores, dado su bajo coste de entrenamiento y su licencia permisiva.
- Generación de respuestas plantilladas y resúmenes cortos: ideal para respuestas de soporte con formato fijo (confirmaciones, acuses, FAQ) donde el contexto necesario es reducido y la latencia importa.
- Extracción de campos estructurados: tareas de parsing de texto a JSON o de normalización de entidades en documentos cortos, con verificación posterior obligatoria dado el riesgo de alucinación.
- Investigación académica y docencia: escenario habitual para estudiar el efecto de LoRA, DPO y cuantización en modelos pequeños con recursos limitados (una única GPU de consumo o incluso CPU).
- Componente de una arquitectura de modelos en cascada: uso como primer nivel de filtrado o borrador, con escalado a un modelo mayor únicamente cuando la confianza es baja.
- Aplicaciones offline en hardware embebido o navegador: al poder correr con cuantización de 4 bits, encaja en escenarios sin conectividad o con GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | `evox-os/axiom-1-hf` | `Qwen/Qwen2.5-0.5B-Instruct` (referencia) |
|---|---|---|
| MMLU | No disponible | No disponible en la información proporcionada |
| HumanEval | No disponible | No disponible en la información proporcionada |
| GSM8K | No disponible | No disponible en la información proporcionada |
| Evaluación del adaptador (SFT/DPO) | No disponible | No aplica |

## Requisitos de hardware

- VRAM estimada para pesos en FP16/BF16: ~0,99 GB solo de pesos; con caché KV y overhead de runtime, entre 1,5 y 2 GB (estimación aritmética a partir del recuento de parámetros, no medida publicada).
- VRAM estimada en INT8: ~0,5 GB de pesos.
- VRAM estimada en INT4 (GGUF Q4_K_M, AWQ o GPTQ): ~0,3 GB de pesos.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también GPU de centro de datos (A100, H100) si se despliega en lote con muchas réplicas. Un modelo de este tamano no requiere GPU de gama alta.
- ¿Cabe en GPU de consumo? Sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, y también en CPU con cuantización de 4 u 8 bits, e incluso en navegador vía WebGPU según la propia model card.
- Opciones de despliegue: `transformers` con PEFT, vLLM, Ollama, llama.cpp (previa conversión a GGUF), text-generation-inference (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| `evox-os/axiom-1-hf` (LoRA) | 494.032.768 | No disponible en la ficha | Apache-2.0 | HuggingFace, `peft` | No disponible |
| `Qwen/Qwen2.5-0.5B-Instruct` (base) | ~0,49B | 32.768 tokens según documentación pública | Apache-2.0 | HuggingFace | No disponible en la información proporcionada |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,5B | 32.768 tokens según documentación pública | Apache-2.0 | HuggingFace | No disponible en la información proporcionada |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | ~1,1B | 2.048 tokens según documentación pública | Apache-2.0 | HuggingFace | No disponible en la información proporcionada |

Los datos de los modelos comparativos provienen de su documentación pública y no han sido verificados en esta búsqueda; se incluyen únicamente como referencia de categoría (modelos densos pequeños de uso local, licencia permisiva). El adaptador no publica cifras que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación de sesgos, ni pruebas de regresión respecto al modelo base. El ajuste LoRA puede degradar capacidades que el base sí tenía (por ejemplo, tool calling o multilingüismo).
- Riesgo de alucinación elevado: con ~494M parámetros, la tasa de invención de hechos y de errores en razonamiento encadenado es alta. No debe usarse sin verificación en dominios factuales (sanitario, legal, financiero).
- Trazabilidad del entrenamiento insuficiente: solo se declara "distribución interna del flywheel de AXIOM (SFT/DPO)", sin número de tokens, idiomas, filtros de calidad ni composición. Esto impide auditar sesgos o licencias del dataset de ajuste.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe homogéneo ni el mantenimiento del soporte multilingüe del modelo base.
- Contexto no confirmado: la ventana efectiva del adaptador no está documentada; asumir 32.768 tokens heredados del base sería una suposición no verificada.
- Ambigüedad sobre el contenido del repo: 1,0 GB para un adaptador sobre un modelo de 0,5B no es un tamano típico de LoRA; conviene inspeccionar los ficheros safetensors antes de integrarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre con atribución y conservación de avisos. La "Regla R1 (soberanía)" de la model card es una declaración de intenciones del autor, no una cláusula adicional de licencia.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento; no hay garantía de soporte, actualizaciones ni corrección de errores.
- Fechas de creación y actualización registradas en septiembre de 2026, con dos minutos de diferencia entre ambas, lo que sugiere una publicación única sin iteración posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evox-os/axiom-1-hf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Ollama: https://ollama.com
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relacionado con el modelo. Los únicos dominios devueltos (evox-performance.com, evo-xracing.com, shiftech.eu, adp-shop.fr) pertenecen al sector de recambios y equipamiento de automoción y no guardan relación con el proyecto. No se han localizado papers, blogs técnicos, repositorios ni demos asociados a `evox-os/axiom-1-hf`.
