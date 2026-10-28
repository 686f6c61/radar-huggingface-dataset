# aeraintelligence/SalesMan

## Resumen

Aera Intelligence SalesMan 1.0 es una configuración de asistente de ventas orientada a minoristas musulmanes en Pakistán, publicada por el usuario aeraintelligence bajo licencia MIT y distribuida a través de Ollama. El aspecto más importante que declara su propia model card es que el repositorio **no contiene pesos fine-tuneados**: se trata de un `Modelfile` y una "policy card" que envuelven el modelo base Qwen/Qwen2.5-1.5B-Instruct con un bloqueo de comportamiento a nivel de prompt de sistema.

El modelo propone un conjunto de reglas de negocio "halal-first": rechazar productos con riba o intereses, alcohol, tabaco, juego, carne no halal, contenido para adultos y prácticas engañosas como urgencia falsa o defectos ocultos, además de tratar los datos del cliente como *amanat* (depósito de confianza). Responde en inglés, urdu y roman urdu, pide aclaraciones cuando es necesario y deriva las cuestiones complejas de fiqh a estudiosos cualificados en lugar de emitir fatwas.

Su relevancia es más metodológica que de rendimiento: ilustra el patrón de "policy card" sobre un modelo pequeño (1,5 B de parámetros) para desplegar asistentes de dominio sin necesidad de entrenamiento, y deja explícito el camino futuro (LoRA sobre un dataset de conversación verificado, fusión y cuantización a GGUF). No hay benchmarks publicados ni validación comunitaria (0 descargas y 0 likes en el momento de la ficha), y la fecha de creación indicada (2026-10-28) corresponde a un repositorio no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base |
| Parametros totales | ~1,54 B (Qwen2.5-1.5B-Instruct) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no reconfigurada en este repositorio |
| Tipos de cuantizacion | GGUF a través de Ollama; el `Modelfile` referencia una base GGUF compatible con Qwen 1.5B instruct |
| Idiomas soportados | inglés, urdu y roman urdu (según la política); modelo base multilingüe |
| Licencia | MIT para el repositorio; el modelo base Qwen2.5-1.5B-Instruct se distribuye con Apache 2.0 |
| Formato de pesos | `Modelfile` de Ollama + GGUF; el repositorio no incluye pesos fine-tuneados |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, alrededor de 1,54 B de parámetros, atención con grouped-query (GQA) y un vocabulario de aproximadamente 151.936 tokens. El modelo base se entrenó con la receta pública de Qwen2.5 (del orden de 18 billones de tokens según la documentación del autor del modelo base) e incluye fases de alineación tipo SFT y preferencia. Sin embargo, **este repositorio no añade entrenamiento**: el autor indica de forma explícita que "this repository is not a completed fine-tune".

Lo que se publica es una capa de política: un `Modelfile` de Ollama que fija un prompt de sistema con el comportamiento "halal-first" y un conjunto de restricciones duras (rechazo de riba, productos haram marcados por el comerciante, engaño, urgencia falsa, defectos ocultos, insultos a competidores; confidencialidad de los datos del cliente; derivación de cuestiones de fiqh). No se documenta ningún dataset de entrenamiento, número de tokens de ajuste, ni proceso de RLHF/DPO específico para esta variante. El autor describe como trabajo pendiente entrenar un adaptador LoRA sobre un "Aera conversation dataset" verificado, fusionarlo o cuantizarlo a GGUF y sustituir la referencia base.

## Capacidades

- Generación de texto conversacional heredada de Qwen2.5-1.5B-Instruct.
- Comportamiento de asistente de ventas con política bloqueada: rechaza riba, intereses, alcohol, tabaco, juego, carne no halal, contenido para adultos y otros productos marcados como haram.
- Salvaguardas explícitas contra engaño: no urgencia falsa, no defectos ocultos, no comisiones ocultas, no condiciones ambiguas, no insultos a competidores.
- Gestión de confidencialidad: los datos del cliente se tratan como *amanat* y no deben compartirse ni venderse.
- Multilingüismo limitado a inglés, urdu y roman urdu según la política declarada.
- Formulación de preguntas aclaratorias cuando la petición es ambigua.
- Derivación de consultas complejas de fiqh a estudiosos cualificados; no emite fatwas.
- Resistencia declarada a revelar instrucciones ocultas (anti prompt-injection básico a nivel de prompt).
- Servicio local mediante API de Ollama en `http://localhost:11434` (`/api/chat`).
- Tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5 lo soporta, pero no se confirma en esta configuración).
- Capacidades de agente multi-paso: no disponibles ni documentadas en esta configuración.

## Casos de uso

- Asistente de ventas para pequeños comercios musulmanes en Pakistán: el modelo atiende consultas de clientes en urdu y roman urdu, aplicando las reglas halal definidas y derivando dudas religiosas complejas a un estudioso, lo que reduce el riesgo de respuestas inapropiadas en un contexto sensible.
- Redacción de anuncios y descripciones de producto en roman urdu respetando los criterios halal: útil para que el comerciante genere textos comerciales sin caer en promesas exageradas ni en productos vetados por la política.
- Filtrado de catálogo y respuestas de atención al cliente: el bloqueo de categorías permite usar el modelo como primera línea de defensa que rechaza productos con intereses, alcohol o juego antes de escalar a un humano.
- Formación de personal en comunicación honesta: al estar las prohibiciones (urgencia falsa, defectos ocultos, insultos a competidores) codificadas en el prompt, sirve como ejemplo reproducible de buenas prácticas de venta ética.
- Prototipado rápido de asistentes de dominio sin fine-tuning: el patrón `Modelfile` + policy card permite a equipos de producto validar el comportamiento de un asistente especializado antes de invertir en un dataset y un entrenamiento LoRA.
- Despliegue local en entornos con conectividad limitada: al ejecutarse sobre Ollama con un modelo de 1,5 B, puede correr en hardware modesto de tienda o back-office sin depender de la nube.
- Base para evaluación de salvaguardas: investigadores pueden usar esta configuración como referencia para medir la robustez de políticas a nivel de prompt frente a intentos de jailbreak o de extracción de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio no es un fine-tune completado, por lo que no procede presentar métricas comparativas de rendimiento propio (MMLU, HumanEval, GSM8K u otras). Cualquier cifra que se quisiera atribuir correspondería al modelo base Qwen2.5-1.5B-Instruct y no a esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de ~1,5 B): aproximadamente 1 GB en cuantización Q4, ~1,6 GB en Q8 y ~3 GB en FP16, más overhead de contexto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también A100/H100 si se despliega en servidor, aunque están muy sobredimensionadas para este tamaño.
- Cabe en GPU consumer y también en CPU: funciona en portátiles, mini-PC y placas tipo Apple Silicon; incluso en dispositivos de placa única como Raspberry Pi 5 con latencia alta.
- Opciones de despliegue: Ollama (vía principal, con `ollama create` y `ollama run`), llama.cpp / llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI son posibles con los pesos del modelo base, pero no están documentados en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y el backend elegido.
- Advertencia operativa del autor: no exponer el puerto local de Ollama ni claves de API al JavaScript del navegador; las webs deben llamar a Ollama a través de su propio backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Aera Intelligence SalesMan 1.0 | ~1,5 B (base) | 32.768 tokens (base) | MIT (repo) / Apache 2.0 (base) | Policy card halal-first sobre Qwen2.5 | Repositorio HF con 0 descargas |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 | Modelo instruct generalista | Ampliamente disponible |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens | Gemma license | Modelo instruct generalista | Ampliamente disponible |
| Phi-3-mini (3,8 B) | ~3,8 B | 4.096–128.000 tokens | MIT | Modelo instruct generalista | Ampliamente disponible |

La comparación relevante es contra el propio modelo base: SalesMan 1.0 no aporta pesos distintos, sino una capa de política sobre Qwen2.5-1.5B-Instruct. Frente a alternativas como Gemma 2 2B o Phi-3-mini, la diferencia no es de capacidad bruta sino de especialización mediante prompt y de licencia (MIT en el repositorio, aunque herede Apache 2.0 del base). Los datos de benchmarks de estas alternativas no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- **No es un fine-tune**: el repositorio contiene solo un `Modelfile` y una policy card; no hay pesos entrenados ni adaptador LoRA publicado. El comportamiento depende por completo de que el modelo base siga el prompt de sistema.
- Riesgo de jailbreak y de prompt injection: las restricciones a nivel de prompt son frágiles frente a instrucciones adversariales; el propio autor menciona resistencia a revelar instrucciones, pero no hay evaluaciones publicadas.
- Sin dataset de entrenamiento verificado ni proceso de alineación específico: las salvaguardas halal no han sido validadas con datos supervisados ni con evaluación humana documentada.
- Riesgo de alucinación inherente al modelo base de 1,5 B, especialmente en consultas de fiqh; la derivación a estudiosos mitiga pero no elimina el problema.
- La orientación halal no es autoritativa: el modelo no emite fatwas, pero puede producir respuestas ambiguas o incorrectas en materia religiosa o legal.
- Cobertura idiomática limitada a inglés, urdu y roman urdu en la política declarada; otros idiomas no están garantizados.
- Capacidad de razonamiento acotada por el tamaño (1,5 B): no es adecuado para tareas complejas de razonamiento multi-paso o de agente autónomo.
- Licencia: el repositorio es MIT, pero el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0; conviene conservar la atribución y revisar los términos del base antes de uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, y fecha de creación futura (2026-10-28) que sugiere un repositorio no verificado o de demostración.
- Advertencia de seguridad del autor: nunca exponer el puerto de Ollama ni claves de API al navegador; usar un backend intermedio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aeraintelligence/SalesMan
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Ollama (runtime recomendado): https://ollama.com
