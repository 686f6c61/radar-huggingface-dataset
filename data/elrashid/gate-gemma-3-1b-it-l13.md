# elrashid/gate-gemma-3-1b-it-l13

## Resumen

`elrashid/gate-gemma-3-1b-it-l13` es un clasificador de seguridad (guardrail) construido sobre el modelo base `google/gemma-3-1b-it`. No es un modelo generativo autónomo, sino una "puerta" (gate) que evalúa la probabilidad de que un prompt sea dañino a partir exclusivamente del texto de entrada, antes de que el modelo generativo produzca ninguna respuesta. El autor es elrashid y el artefacto se publica bajo licencia MIT, con acceso restringido (gated) en Hugging Face.

La técnica subyacente combina un autoencoder disperso (sparse autoencoder, SAE) entrenado sobre el flujo residual (residual stream) de la capa 13 de Gemma 3 1B IT con una regresión logística que opera sobre las características del SAE. El resultado es una puntuación P(harmful) calculada únicamente a partir del prompt, lo que permite filtrar entradas antes de la inferencia generativa. El modelo base es un transformer de 1.000 millones de parámetros de Google con ventana de contexto de 32.000 tokens.

Su relevancia radica en el enfoque de interpretabilidad aplicada a seguridad: en lugar de un clasificador opaco de extremo a extremo, usa representaciones internas del modelo (features del SAE) como señal de clasificación, lo que facilita el análisis de qué activaciones se asocian a contenido dañino. Es un componente de pipeline, no un sustituto del modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador logístico sobre features de sparse autoencoder del residual stream de la capa 13 de Gemma 3 1B IT |
| Parámetros totales | No disponible (el artefacto es un clasificador sobre un modelo base de 1B; el repo ocupa 0.0 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base Gemma 3 1B IT) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El componente central es un sparse autoencoder entrenado sobre las activaciones del flujo residual de la capa 13 de `google/gemma-3-1b-it`. El SAE descompone esas activaciones en un conjunto disperso de características interpretables. Sobre esas características se ajusta una regresión logística que produce la probabilidad de que el prompt sea dañino. La decisión se toma solo con el prompt, sin generar respuesta, lo que reduce coste y latencia frente a guardrails basados en generación.

No se dispone de información sobre el número de tokens de entrenamiento del SAE ni del clasificador, la composición del dataset de prompts etiquetados como dañinos/benignos, ni si se aplicaron técnicas de calibración o regularización específicas. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el interés técnico está en el uso de features de SAE como espacio de representación para clasificación de seguridad.

## Capacidades

- Clasificación de prompts en dañino/benigno mediante puntuación P(harmful) calculada solo a partir de la entrada.
- Funciona como guardrail de entrada (input filter) previo a la generación del modelo base.
- Aprovecha features interpretables del SAE, lo que permite inspeccionar qué activaciones contribuyen a la decisión.
- Compatible con el modelo base Gemma 3 1B IT, que aporta soporte multilingüe y contexto de 32.000 tokens.
- No genera texto: no tiene capacidad de razonamiento, código, matemáticas ni tool calling por sí mismo.
- No soporta agentes ni multi-step reasoning de forma nativa; es un componente de decisión puntual.

## Casos de uso

- Filtrado previo en pipelines de atención al cliente: evaluar cada mensaje entrante con el gate antes de pasarlo al modelo generativo, bloqueando prompts dañinos sin coste de generación.
- Moderación de contenido en aplicaciones de chat: integrar el clasificador como paso previo en la API para rechazar entradas tóxicas o de jailbreak con una puntuación numérica auditable.
- Investigación en interpretabilidad de seguridad: analizar qué features del SAE de la capa 13 correlacionan con contenido dañino y publicar mapas de activación.
- Evaluación comparativa de guardrails: usar el gate como baseline interpretable frente a clasificadores opacos en experimentos de robustez.
- Protección de sistemas de agentes: colocar el gate en la entrada de un orquestador de agentes para descartar instrucciones maliciosas antes de que lleguen a herramientas externas.
- Docencia y formación en AI safety: ilustrar cómo un SAE y una regresión logística simple pueden construir un clasificador de seguridad sobre representaciones internas de un LLM pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El clasificador en sí es una regresión logística sobre features de SAE: requisitos mínimos de cómputo, apto para CPU.
- Para extraer las activaciones de la capa 13 se necesita ejecutar hacia delante el modelo base Gemma 3 1B IT: aproximadamente 2-3 GB de VRAM en fp16, menos con cuantización de 8 o 4 bits.
- Cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090; también en CPU con latencia mayor.
- Opciones de despliegue: transformers para la extracción de activaciones; el clasificador puede servirse con cualquier framework de inferencia ligera (scikit-learn, ONNX Runtime) una vez extraídas las features.
- Latencia y throughput: no disponibles en la documentación publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elrashid/gate-gemma-3-1b-it-l13 | Guardrail sobre SAE de capa 13 | Clasificador + base 1B | 32.000 | MIT | Gated en HF |
| Llama Guard (Meta) | Clasificador de seguridad generativo | 8B (variantes) | 4.096-8.192 | Llama license | Abierto en HF |
| ShieldGemma (Google) | Clasificador de seguridad generativo | 2B, 9B, 27B | 8.192 | Gemma license | Abierto en HF |
| google/gemma-3-1b-it | LLM generativo base | 1B | 32.000 | Gemma license | Abierto en HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo evalúa el prompt: no inspecciona la respuesta generada, por lo que no cubre salidas dañinas producidas por el modelo.
- La calidad del gate depende del SAE y del dataset de entrenamiento del clasificador, cuyos detalles no están documentados.
- No hay información sobre sesgos, tasas de falsos positivos/negativos ni robustez frente a ataques de jailbreak.
- Idiomas soportados no especificados; el comportamiento en castellano u otros idiomas distintos del inglés no está garantizado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la integración automatizada.
- Licencia MIT para el artefacto, pero el modelo base Gemma 3 1B IT está sujeto a la licencia de Gemma, con sus propias restricciones de uso comercial.
- Repo de 0.0 GB: conviene verificar que los pesos y artefactos estén efectivamente disponibles antes de desplegar en producción.
- Sin benchmarks publicados: no se puede avalar su eficacia frente a alternativas establecidas como Llama Guard o ShieldGemma.

## Enlaces

- [Hugging Face: elrashid/gate-gemma-3-1b-it-l13](https://huggingface.co/elrashid/gate-gemma-3-1b-it-l13)
- [Hugging Face: google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- DOI: 10.57967/hf/9435
