# mradermacher/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming-GGUF

## Resumen

`mradermacher/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming-GGUF` es una recopilación de cuantizaciones estáticas en formato GGUF del modelo `jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming`, un ajuste fino de la variante de 0,8 mil millones de parámetros de la familia Qwen 3.5. El autor de las cuantizaciones es mradermacher, conocido en la comunidad por publicar versiones GGUF de modelos recientes para su uso con llama.cpp y herramientas derivadas. El modelo base apunta a un caso de uso muy específico: actuar como agente sobre un iPhone mediante "weight-space programming", una técnica de ajuste que modifica directamente los pesos para inducir un comportamiento concreto sin depender de prompting extenso.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras cuantizaciones disponibles de un modelo de la serie Qwen 3.5 de 0,8B, pensada para ejecución en dispositivo. Por otro, ilustra una tendencia creciente: modelos pequeños especializados en tareas de agente que se distribuyen en GGUF para inferencia local en hardware de consumo, incluidos teléfonos. La información pública disponible es muy limitada: la model card original es prácticamente un índice de cuantizaciones y no incluye datos de entrenamiento, licencia ni evaluación.

La ficha se ha elaborado a partir de los metadatos de Hugging Face, la model card del repositorio y los resultados de búsqueda web disponibles. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen35 (según metadatos del repositorio); arquitectura híbrida Gated Delta Networks con MoE disperso según fuentes secundarias sobre la familia Qwen 3.5 |
| Parámetros totales | 0,8B (aproximado, según nombre del modelo y metadatos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para este ajuste; la familia Qwen 3.5 se describe con 262K en fuentes secundarias |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (la familia Qwen 3.5 se describe con 200+ idiomas en fuentes secundarias) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

El repositorio es una conversión a GGUF del modelo `jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming`, que a su vez parte de la variante de 0,8B de Qwen 3.5. Los metadatos del repositorio indican `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, lo que confirma que se trata de una cuantización estática generada con las herramientas habituales de mradermacher a partir de pesos en formato Hugging Face. No se dispone de información sobre el proceso de ajuste fino aplicado por jstarks, ni sobre el dataset utilizado, ni sobre si hubo RLHF, DPO u otra fase de alineamiento.

Las fuentes secundarias sobre la familia Qwen 3.5 describen una arquitectura híbrida que combina Gated Delta Networks con mezcla de expertos dispersa, y una ventana de contexto de 262K. No obstante, estos datos corresponden a la familia en general y no se pueden atribuir con certeza a este ajuste concreto de 0,8B. La técnica de "weight-space programming" que aparece en el nombre del modelo no está documentada en la información disponible; por el nombre, sugiere una modificación directa de pesos para inducir comportamiento de agente, pero no hay paper ni blog que lo confirme.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen 3.5 de 0,8B.
- Comportamiento orientado a agente sobre iPhone, según el nombre del ajuste; no hay documentación que detalle las acciones soportadas.
- Posible soporte de tool calling o function calling, no confirmado para este ajuste.
- Capacidades multilingües: no confirmadas para este ajuste; la familia Qwen 3.5 se describe con 200+ idiomas en fuentes secundarias.
- Ejecución local en dispositivo gracias al formato GGUF y al tamaño reducido (0,8B).
- No se ha confirmado soporte de visión, audio, thinking mode ni otras capacidades especiales.

## Casos de uso

- Agente local en iPhone: el modelo está diseñado, por nombre y origen, para ejecutarse en un iPhone y actuar como agente; su tamaño de 0,8B y las cuantizaciones Q4_K_M o IQ4_XS permiten inferencia en dispositivo sin conexión.
- Automatización de tareas móviles con privacidad: al ejecutarse localmente, evita enviar datos a servidores externos, lo que resulta adecuado para flujos que manejan información personal.
- Prototipado de agentes en hardware de consumo: sirve para validar pipelines de agente (parseo de acciones, bucles de decisión) antes de escalar a modelos mayores.
- Investigación sobre weight-space programming: el modelo permite reproducir y estudiar la técnica de ajuste mencionada en el nombre, comparando su comportamiento con el modelo base.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q2_K a Q8_0 permiten desplegar el modelo en portátiles sin GPU dedicada para pruebas de concepto.
- Educación y demos: un modelo de 0,8B en GGUF es adecuado para talleres y demostraciones de IA local en dispositivos móviles.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que permite medir la degradación de calidad frente al tamaño en un caso de agente real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,8B, las cuantizaciones Q4_K_M rondan los 0,5 GB y las Q8_0 alrededor de 0,9 GB, aunque estas cifras son estimaciones basadas en el tamaño de parámetros y no en datos publicados.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer reciente (RTX 3060 o superior) puede alojar el modelo con holgura.
- Compatibilidad con GPU consumer: sí, previsiblemente en todas las cuantizaciones; también en iGPU y CPU.
- Despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no son la vía habitual para GGUF aunque algunos forks lo permiten.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming (este) | 0,8B | no disponible | no disponible | GGUF (12 cuantizaciones) | Ajuste específico para agente en iPhone |
| Qwen3.5-0.8B (base) | 0,8B | 262K según fuentes secundarias | no disponible | safetensors, GGUF | Modelo generalista de la familia Qwen 3.5 |
| mradermacher/Qwen3.5-0.8B-weight-space-programming-GGUF | 0,8B | no disponible | no disponible | GGUF | Variante de cuantización del mismo ajuste, sin el sufijo "iPhone-Agent" |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La model card no incluye información sobre licencia, lo que impide confirmar si el uso comercial está permitido; conviene consultar el repositorio original de jstarks antes de cualquier despliegue en producción.
- No hay documentación sobre el dataset de ajuste ni sobre sesgos conocidos; se desconoce si el ajuste introduce sesgos específicos hacia el dominio de agente móvil.
- Riesgo de alucinación: no evaluado; en modelos de 0,8B el riesgo es estructuralmente alto, especialmente en tareas de razonamiento multi-paso.
- El contexto real soportado por este ajuste no está confirmado; los 262K atribuidos a la familia no se pueden asumir para esta variante.
- La técnica de weight-space programming no está documentada públicamente, lo que dificulta auditar el comportamiento del modelo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso en la comunidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en un modelo ya de por sí pequeño.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming-GGUF
- Modelo base del ajuste: https://huggingface.co/jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming
- Variante de cuantización relacionada: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-GGUF
- Cuantizaciones del modelo base sin ajuste: https://huggingface.co/mradermacher/Qwen3.5-0.8B-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Artículo sobre ejecución de Qwen 3.5 en iPhone: https://dev.to/alichherawalla/how-to-run-qwen-35-on-your-iphone-in-2026-completely-offline-no-subscription-1e4m
