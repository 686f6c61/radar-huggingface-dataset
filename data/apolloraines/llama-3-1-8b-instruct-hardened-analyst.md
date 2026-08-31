# ApolloRaines/Llama-3.1-8B-Instruct-Hardened-Analyst

## Resumen

Llama-3.1-8B-Instruct-Hardened-Analyst es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, que aplica técnicas de ingeniería de representación (representation engineering) y ablación de comportamientos (abliteration) directamente sobre los pesos del modelo, sin realizar ningún tipo de fine-tuning o entrenamiento adicional. El resultado es un asistente conversacional diseñado para entornos adversarios, con resistencia reforzada frente a inyecciones de prompt, fidelidad al contexto y un modo de razonamiento analítico profundo.

El modelo conserva la arquitectura original de Llama 3.1 (32 capas, 8.030 millones de parámetros) y se distribuye en precisión bf16 con pesos en formato safetensors. Está pensado para desarrolladores e investigadores que necesitan un modelo de generación de texto robusto en escenarios donde la manipulación del prompt o la desviación del contexto son riesgos críticos, como análisis de seguridad, moderación de contenido o agentes autónomos.

Su relevancia actual radica en que aborda un problema creciente en los LLM: la vulnerabilidad a ataques de prompt injection y la tendencia a ignorar el contexto cuando se introducen instrucciones maliciosas. Al modificar los pesos en lugar de añadir capas de filtrado externas, ofrece una solución integrada que no degrada la latencia ni requiere infraestructura adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 (8,0 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredado del base, no especificado en la ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuye en bf16 original) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1, un transformer autoregresivo con 32 capas, atención multi-cabeza con RoPE (rotary position embeddings), y normalización RMSNorm. No se ha realizado entrenamiento adicional: la modificacion se efectua mediante jBlaze, una herramienta de cirugia conductual que identifica y amplifica o atenua direcciones especificas en el espacio de representaciones internas del modelo. En este caso se amplifican tres direcciones: adversarial (resistencia a ataques), ctx_faith (fidelidad al contexto) y analytical (razonamiento analitico). El proceso no altera los pesos de forma convencional, sino que reorienta las activaciones para favorecer comportamientos deseados.

Al no haber fine-tuning, el modelo conserva todas las capacidades linguisticas y de conocimiento del base, pero con una distribucion de respuestas sesgada hacia la verificacion de hechos, la coherencia contextual y la negativa ante solicitudes maliciosas. No se ha publicado informacion sobre el dataset de entrenamiento (al ser el base, se asume el de Llama 3.1, pero no se detalla en la ficha).

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas coherentes y estructuradas.
- Razonamiento analitico profundo: tiende a descomponer problemas y explicar el proceso de calculo o deduccion.
- Resistencia a prompt injection: rechaza o redirige instrucciones que intentan alterar su comportamiento o extraer informacion no autorizada.
- Fidelidad al contexto: mantiene el hilo de la conversacion y no se desvia ante informacion contradictoria o provocaciones.
- Negativa educada ante solicitudes peligrosas o ilegales (ej. como forzar una cerradura).
- Capacidad de generacion de codigo (ej. funciones en Python) con explicaciones.
- No soporta vision, audio ni tool calling de forma nativa (no se menciona en la ficha).

## Casos de uso

- Analisis de seguridad de prompts: el modelo puede usarse como detector de intentos de inyeccion, evaluando si un prompt contiene instrucciones maliciosas y respondiendo de forma segura.
- Moderacion de contenido en foros o redes sociales: su resistencia a la manipulacion lo hace adecuado para responder a usuarios que intentan evadir filtros o provocar respuestas inapropiadas.
- Agentes autonomos en entornos no confiables: al mantener fidelidad al contexto, puede operar como componente de un agente que recibe instrucciones de multiples fuentes sin ser desviado.
- Asistente de analisis de datos: su modo analitico permite desglosar problemas complejos, como calculos numericos o logica, con explicaciones paso a paso.
- Generacion de codigo defensivo: puede producir funciones con documentacion clara y comentarios, util en pipelines de desarrollo donde se requiere trazabilidad.
- Chatbots de atencion al cliente con politicas estrictas: responde de forma coherente y rechaza peticiones fuera de los limites establecidos, reduciendo riesgos de fraude o abuso.
- Evaluacion de robustez de otros modelos: al ser un modelo endurecido, puede servir como referencia para probar tecnicas de ataque y defensa en investigacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta variante especifica. Se recomienda consultar los benchmarks del modelo base Llama-3.1-8B-Instruct como referencia aproximada, aunque las modificaciones de jBlaze pueden alterar el rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en bf16, ocupa aproximadamente 16 GB de pesos. Con overhead de activaciones y cache, se recomienda al menos 20-24 GB de VRAM para inferencia comoda.
- En cuantizacion 8-bit (si se genera a partir de los safetensors) se reduce a ~8 GB, y en 4-bit a ~4-5 GB, permitiendo su uso en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 3060 12GB con cuantizacion agresiva.
- GPUs recomendadas: A100 40GB, H100, RTX 4090, o cualquier GPU con >=24 GB para bf16 nativo.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se genera el archivo GGUF), y TGI (Text Generation Inference).
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 8B en una GPU moderna, se espera una generacion de 50-100 tokens/segundo en bf16 con vLLM, y menor en llama.cpp segun la CPU/GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modificacion |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,0 B | 128K (segun Meta) | Llama 3.1 | Ninguna |
| Llama-3.1-8B-Instruct-Hardened-Analyst | 8,0 B | no disponible | Llama 3.1 | jBlaze (adversarial, ctx_faith, analytical) |
| Llama-3.3-8B-Instruct-128K-Jbliterated (de ApolloRaines) | 8,0 B | 128K | Llama 3.3 | jBlaze (abliteration) |

No se dispone de datos de rendimiento comparativo. La diferencia principal radica en el comportamiento frente a ataques y la fidelidad contextual, no en capacidades brutas.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.1, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque la amplificacion de la direccion adversarial podria mitigar algunos sesgos de comportamiento.
- Riesgo de alucinacion: no se ha evaluado especificamente; el modelo base tiene cierta tendencia a alucinar en temas de baja frecuencia, y la modificacion no garantiza su eliminacion.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras la modificacion; se recomienda probar con ventanas largas antes de usarlo en produccion.
- Restricciones de licencia: la licencia Llama 3.1 Community License permite uso comercial, pero requiere que los usos con mas de 700 millones de usuarios mensuales soliciten una licencia especifica a Meta. Aplican las mismas condiciones que el modelo base.
- Limitaciones de idioma: solo soporta ingles de forma nativa; otros idiomas pueden degradar la calidad.
- Herramienta propietaria: jBlaze no es de codigo abierto, por lo que no es posible reproducir el proceso de modificacion ni auditar completamente los cambios en los pesos.
- Sin garantias de robustez: aunque el modelo esta endurecido contra prompt injection, no es inmune a todos los ataques; se recomienda evaluar en el entorno especifico antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Hardened-Analyst
- Herramienta jBlaze: https://jblaze.dev
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante relacionada (Jbliterated): https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated
