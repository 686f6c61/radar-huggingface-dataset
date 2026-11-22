# mradermacher/Uncensored-SLM-GGUF

## Resumen

Uncensored-SLM-GGUF es una colección de cuantizaciones en formato GGUF del modelo mrzenin/Uncensored-SLM, un modelo de lenguaje de aproximadamente 1.730 millones de parámetros (1.728.801.600 segun los tensores en safetensors) derivado de la familia Liquid AI LFM3. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF para la comunidad, y el modelo base ha sido sometido a un proceso de "abliteration" o "decensoring" que elimina total o parcialmente los mecanismos de rechazo y alineación del modelo original, orientándolo a casos de uso de rol y generación sin filtros.

El modelo se distribuye en múltiples niveles de cuantización (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB), lo que lo hace especialmente atractivo para despliegue en hardware de consumo y en el borde (edge). La arquitectura subyacente se anuncia como híbrida, siguiendo la línea de los modelos LFM de Liquid AI, aunque la model card no detalla la composición exacta de capas ni el tamaño de contexto.

La relevancia actual del modelo radica en su tamaño contenido (1,7B), su formato GGUF listo para llama.cpp/Ollama y su orientación explícita a usos sin censura, lo que lo convierte en una opción práctica para desarrolladores que necesitan un modelo pequeño, ejecutable localmente y sin restricciones de contenido para tareas creativas o de investigación. No obstante, la ausencia de licencia declarada y de benchmarks publicados limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con arquitectura híbrida (tag "hybrid-architecture"); detalles no disponibles |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (tag `language: en`); el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base mrzenin/Uncensored-SLM se presenta con las etiquetas `liquid-ai`, `lfm3`, `hybrid-architecture` y `custom_code`, lo que sugiere una arquitectura derivada de la familia LFM3 de Liquid AI, que combina capas de atención con capas de estado recurrente o convolucional en un esquema híbrido. La model card no proporciona la composición exacta de capas, el número de cabezas de atención, la dimensión oculta ni el mecanismo híbrido concreto, por lo que estos datos deben considerarse no disponibles.

El proceso de entrenamiento tampoco está documentado en la información proporcionada: no se indica el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí es explícito es el proceso de "abliteration" o "decensoring", que modifica los pesos para eliminar la dirección de rechazo aprendida durante la alineación, dando lugar a un modelo "heretic" y "uncensored". Esta técnica suele aplicarse mediante la proyección ortogonal de los pesos respecto a la dirección de rechazo identificada en las activaciones, aunque el autor no detalla el método exacto empleado.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y roleplay, según las etiquetas declaradas por el autor.
- Generación de texto sin los filtros de rechazo del modelo original (comportamiento "uncensored").
- Soporte de arquitectura híbrida orientada a eficiencia en el borde (edge-ai).
- Compatibilidad con endpoints estándar de text-generation (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües no documentadas más allá del inglés.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo, al estar "decensored", permite conversaciones de ficción sin los rechazos típicos de modelos alineados; su tamaño de 1,7B y sus cuantizaciones de 1-2 GB lo hacen viable en portátiles y equipos sin GPU dedicada.
- Prototipado rápido en el borde: con cuantizaciones Q4_K_S o Q4_K_M de aproximadamente 1,2 GB, se puede desplegar en dispositivos con poca memoria (Raspberry Pi 5 con 8 GB, mini-PC, móviles de gama alta) usando llama.cpp u Ollama para asistentes locales.
- Investigación sobre alineación y seguridad: al ser una versión abliterated, sirve como caso de estudio para medir la eficacia de las técnicas de rechazo y su eliminación, comparando respuestas con el modelo base original.
- Generación creativa de contenido sin restricciones temáticas: escritura de guiones, diálogos o ficción con temáticas que los modelos alineados suelen rechazar, ejecutándose en local para preservar la privacidad del contenido.
- Chatbot de escritorio offline: integrado en aplicaciones de escritorio mediante llama.cpp, ofrece un asistente conversacional que no envía datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Evaluación comparativa de cuantizaciones: la colección incluye 12 niveles de cuantización, lo que permite a investigadores medir el impacto de la cuantización en la calidad de un modelo pequeño y en su comportamiento tras el decensoring.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K, 1,2-1,4 GB para Q4_K_M/Q5_K_M, 1,9 GB para Q8_0 y 3,6 GB para f16 (los tamaños de archivo son una cota superior razonable de memoria necesaria, con overhead adicional de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas (GTX 1650, RTX 3050, RTX 4060); para f16 se recomienda al menos 4-6 GB (RTX 3060, RTX 4060 Ti). En entornos de servidor, A100/H100 son innecesarias por el tamaño del modelo, pero funcionarían sin problema.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama baja y GPUs integradas con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. También puede ejecutarse en CPU pura.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (1,7B) se espera un throughput alto en CPU moderna y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uncensored-SLM-GGUF (este) | 1,73B | no disponible | no disponible | GGUF | Derivado LFM3 abliterated, 12 cuantizaciones |
| LiquidAI LFM2-1.2B | 1,2B | 32K (según documentación pública de Liquid AI) | LFM Open License | safetensors, GGUF | Modelo original alineado, arquitectura híbrida |
| Llama 3.2 1B Instruct | 1,24B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alineado, multilingüe, amplia adopción |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | safetensors, GGUF | Alineado, multilingüe, benchmarks públicos |

La comparativa se basa en datos públicos de los modelos alternativos; los datos del modelo de esta ficha (contexto, licencia) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de las cuantizaciones, lo que impide determinar si el uso comercial está permitido. No debe usarse en producción sin aclarar este punto con el autor.
- El proceso de abliteration/decensoring elimina los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, ilegal o sexualmente explícito sin filtros; requiere moderación externa en cualquier despliegue público.
- Riesgo elevado de alucinación: al tratarse de un modelo de 1,7B, su conocimiento factual es limitado y su fiabilidad en tareas de razonamiento complejo es baja en comparación con modelos mayores.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que dificulta comparar con alternativas alineadas.
- El decensoring puede degradar capacidades generales (razonamiento, instrucciones) respecto al modelo original, un efecto conocido en modelos abliterated.
- La fecha de creación del repositorio (2026) y la ausencia de likes/descargas moderadas (922 descargas) sugieren poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uncensored-SLM-GGUF
- Modelo base: https://huggingface.co/mrzenin/Uncensored-SLM
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Uncensored-SLM-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Uncensored-SLM-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
