# SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-3000-1ep

## Resumen

`SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-3000-1ep` es un adaptador LoRA (no un modelo completo) construido sobre `Qwen/Qwen2.5-32B`, el modelo base de la familia Qwen2.5, y publicado por Second Look Research en el marco del proyecto "Teaching Qwen Why". Se trata de la reproducción, sobre pesos abiertos, del trabajo de Anthropic "Teaching Claude Why", orientado a estudiar cómo ciertos comportamientos se transmiten a un modelo mediante datos de entrenamiento generados por otro modelo (en este caso, conversaciones de "consejo difícil" escritas por GPT-5.6 Terra).

El adaptador es la segunda y última etapa de una cadena de dos LoRA: primero se aplica un ajuste de instrucciones de 13.000 ejemplos (`Qwen2.5-32B-instruct-mix`, 2 épocas) y después esta etapa de 3.000 conversaciones, 1 época. Cada adaptador se fusiona en el modelo antes de entrenar el siguiente, de modo que este repositorio solo es utilizable servido en cadena sobre una base previamente "injertada" (parche `base_row_patch.safetensors` que repara las filas no entrenadas del terminador ChatML del modelo base).

Su relevancia es fundamentalmente de investigación: es un artefacto experimental para estudiar alineación, generalización de comportamiento a partir de datos sintéticos de un modelo profesor y misalignment agéntico (el repositorio de código incluye un pipeline de evaluación específico). No es un modelo de producción: acumula 21 descargas, no declara idiomas, no publica benchmarks en la model card y depende de un script concreto de servicio sobre vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5); adaptador LoRA sobre `Qwen/Qwen2.5-32B` |
| Parámetros totales | 32 000 millones (modelo base); el adaptador LoRA añade un conjunto reducido de pesos de rango 64 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens según la documentación del modelo base Qwen2.5-32B; la model card del adaptador no lo especifica |
| Tipos de cuantización | no disponible; el adaptador se distribuye en safetensors sin cuantizar y la model card no documenta variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible (el campo de idiomas no está informado en el repositorio; el modelo base Qwen2.5 es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `base_row_patch.safetensors` (parche del modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de Qwen2.5 con 32 000 millones de parámetros. Sobre él se entrena un adaptador LoRA de rango 64, alpha 128, aplicado a todas las capas lineales, con learning rate 1e-4, scheduler coseno y batch efectivo de 8 secuencias empaquetadas. El entrenamiento se organiza en dos etapas secuenciales con fusión intermedia: (1) mezcla de instrucciones de 13 000 ejemplos durante 2 épocas y (2) 3 000 conversaciones de "consejo difícil" (`difficult_advice/gpt-5.6-terra-3000/train-3000.jsonl`) durante 1 época. En ambas etapas la pérdida se calcula únicamente sobre los turnos del asistente.

La innovación técnica del proyecto no está en la arquitectura, sino en el procedimiento: antes de la etapa de instrucciones se repara un "injerto" en el modelo base, consistente en las filas del terminador ChatML que no han sido entrenadas, parche que se distribuye como `base_row_patch.safetensors`. Además, el apilado de adaptadores obliga a fusionarlos en orden (`serve_model.sh` aplica el injerto, fusiona los dos LoRA y levanta el servidor vLLM). No se detalla en la información disponible la composición completa del dataset de 13 000 ejemplos, el número total de tokens vistos ni si hubo etapas de RLHF o DPO; el pipeline descrito es exclusivamente de ajuste supervisado sobre turnos del asistente.

## Capacidades

- Generación de texto conversacional multi-turno en formato ChatML, heredada del ajuste de instrucciones de la primera etapa.
- Asesoramiento sobre temas "difíciles", especialidad de esta segunda etapa, entrenada con 3 000 conversaciones sintéticas generadas por GPT-5.6 Terra.
- Razonamiento y conocimiento general propios de un modelo de 32 000 millones de parámetros (sin métricas publicadas en la información disponible).
- Capacidad de servir como sujeto de experimentos de alineación: el adaptador está pensado para evaluar transferencia de comportamiento desde datos de un modelo profesor.
- Evaluación de misalignment agéntico: el repositorio de código incluye el pipeline `evaluation/agentic_misalignment` que consume esta cadena de adaptadores.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es solo texto.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Replicación de experimentos de alineación: servir la cadena de dos adaptadores sobre la base injertada permite reproducir las figuras 1, 2 y 13 del post de "Teaching Qwen Why" y contrastar resultados con los publicados por Anthropic para Claude.
- Estudio de destilación desde un modelo profesor: el adaptador permite medir cuánto del comportamiento de asesoramiento de GPT-5.6 Terra se transfiere a un modelo abierto de 32 000 millones tras una sola época sobre 3 000 conversaciones.
- Evaluación de misalignment agéntico: usar `serve_model.sh` y el pipeline de evaluación del repositorio para puntuar el modelo en escenarios agénticos y comparar la cadena completa frente a la etapa intermedia.
- Ablaciones controladas de la cadena LoRA: al existir un adaptador por etapa, se puede comparar base + injerto, base + etapa 1 y base + etapa 1 + etapa 2 manteniendo constantes tokenizador y plantilla.
- Investigación sobre fusión de adaptadores: el caso documenta un flujo completo de LoRA de rango 64 fusionado entre etapas, útil como referencia metodológica para quien encadene adaptadores propios.
- Prototipado de asistentes de consejo en dominios sensibles: solo en entornos de investigación y con revisión humana, dado que el modelo está entrenado explícitamente para dar consejo en situaciones difíciles y no se han publicado evaluaciones de seguridad.
- Docencia y formación técnica: ejemplo práctico de cómo se construye y se sirve una cadena de adaptadores PEFT con vLLM sobre un modelo de 32 000 millones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las figuras 1, 2 y 13 del post del proyecto, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de las evaluaciones de misalignment agéntico, y tampoco se aportan métricas de la etapa intermedia que permitan calcular el delta atribuible a este adaptador.

## Requisitos de hardware

- El adaptador por sí solo ocupa 2,2 GB en el repositorio, pero no es utilizable sin el modelo base completo: los pesos de Qwen2.5-32B en bf16 requieren aproximadamente 64 GB de VRAM solo para pesos.
- El script de servicio fusiona los adaptadores en la base antes de arrancar el servidor, por lo que no se beneficia del ahorro de memoria de servir LoRA sin fusionar: hay que presupuestar la huella del modelo completo más la caché KV.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servir en bf16; 2× A100 40 GB o 2× A6000 48 GB con tensor parallelism si se quiere margen de contexto.
- En GPU de consumo: viable solo con cuantización de 4 bits (aproximadamente 18-20 GB de pesos), es decir, una RTX 4090 de 24 GB o una RTX 3090, asumiendo que se pueda reproducir el flujo de fusión e injerto fuera de vLLM; la model card no documenta ese camino.
- Despliegue: vLLM es la única vía documentada, a través de `evaluation/agentic_misalignment/serve_model.sh` con las variables `GRAFT=1`, `BASE_MODEL` y `ADAPTERS`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (cadena sobre Qwen2.5-32B) | 32 000 M | 32 768 tokens (base) | sin benchmarks publicados | apache-2.0 | 21 descargas, repo de 2,2 GB, requiere script propio |
| Qwen2.5-32B-Instruct | 32 000 M | 32 768 tokens (128K con YaRN) | benchmarks publicados por Qwen | apache-2.0 | modelo completo, ampliamente desplegable en vLLM/llama.cpp |
| Qwen2.5-14B-Instruct | 14 000 M | 32 768 tokens (128K con YaRN) | benchmarks publicados por Qwen | apache-2.0 | modelo completo, cabe en una sola GPU de 24 GB en 4 bits |
| Adaptador de la etapa 1 (`Qwen2.5-32B-instruct-mix`) | 32 000 M | 32 768 tokens (base) | sin benchmarks publicados | apache-2.0 | predecesor directo; sirve de comparación para aislar el efecto de esta etapa |

La comparación relevante no es de rendimiento bruto, sino metodológica: frente a un modelo instruct convencional, este artefacto se distingue por su procedimiento de entrenamiento en dos etapas con injerto del terminador y por su orientación a evaluaciones de alineación, no por métricas de capacidad.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción, no tiene evaluaciones de seguridad publicadas y la model card no documenta el proceso de red-teaming.
- Dependencia de la cadena: servir solo este adaptador sobre la base sin la etapa 1 y sin el injerto produce un modelo distinto del descrito; la model card indica explícitamente que debe servirse en orden.
- Datos sintéticos: las 3 000 conversaciones de "consejo difícil" fueron generadas por GPT-5.6 Terra, lo que introduce dependencia de las condiciones de uso del modelo generador y sesgos heredados del mismo.
- Riesgo de consejo dañino: el ajuste entrena deliberadamente al modelo para dar consejo en situaciones difíciles sin que se documenten filtros, salvaguardas ni tasas de refusal.
- Idiomas no declarados: no hay campo de idiomas en el repositorio; el comportamiento multilingüe es una extrapolación del modelo base y no está verificado.
- Riesgo de alucinación: no cuantificado; no hay benchmarks de fidelidad ni de calibración.
- Licencia: apache-2.0 para el adaptador, pero el uso comercial del conjunto (adaptador + base + datos sintéticos) requiere verificar también la licencia del modelo base y las condiciones del generador de datos.
- Trazabilidad limitada: 21 descargas, 0 likes y ausencia de pipeline declarado; no hay informe técnico con hiperparámetros completos ni curvas de entrenamiento más allá de la descripción de las dos etapas.
- Compatibilidad: el formato ChatML del modelo base requiere el parche de filas del terminador; usar la plantilla estándar de Qwen2.5-Instruct sin ese parche puede degradar el comportamiento de parada de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-3000-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Adaptador de la primera etapa: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix
- Dataset del proyecto: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Repositorio de código (script de servicio y evaluación): https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a sitios de streaming de películas sin relación con el proyecto.
