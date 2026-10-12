# DrDavis/northstar-smollm2-360m-lora-v3

## Resumen

northstar-smollm2-360m-lora-v3 es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario DrDavis en HuggingFace, construido sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct. No se trata por tanto de un modelo entrenado desde cero, sino de un conjunto de pesos de adaptación de bajo rango que se cargan junto al modelo base mediante la librería PEFT (versión 0.21.2 declarada en la model card). El repositorio no aporta información sobre el propósito del ajuste fino, el dataset utilizado, los hiperparámetros ni los resultados de evaluación.

El modelo subyacente, SmolLM2-360M-Instruct, es un transformer decoder denso de aproximadamente 361 millones de parámetros desarrollado por HuggingFaceTB, orientado a generación de texto conversacional en entornos con recursos muy limitados. Al ser un adaptador, el modelo final conserva las dimensiones y el contexto del base, y añade únicamente un delta de pesos de pequeño tamaño.

La relevancia de este tipo de publicación es fundamentalmente metodológica: sirve como ejemplo de flujo de trabajo de ajuste fino con PEFT sobre modelos pequeños, y como posible punto de partida para experimentos de bajo coste en hardware de consumo. Sin embargo, la ausencia total de documentación (la model card es la plantilla por defecto sin rellenar), de licencia explícita y de métricas de evaluación limita seriamente su uso en producción.

## Especificaciones técnicas

Los valores marcados con (*) corresponden al modelo base SmolLM2-360M-Instruct según su documentación pública; no están verificados en el repositorio del adaptador. El resto de campos no aparecen en la información proporcionada.

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (modelo base SmolLM2-360M-Instruct) |
| Parámetros totales | 361 M en el modelo base (*); el adaptador añade un número de parámetros no especificado |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens (*) |
| Tipos de cuantización | No disponibles para el adaptador; dependen del modelo base (GGUF, 8-bit y 4-bit vía bitsandbytes, entre otros) |
| Idiomas soportados | No disponible en el repositorio; el modelo base está orientado principalmente al inglés |
| Licencia | No disponible (el modelo base SmolLM2 se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA: se congelan los pesos del modelo base y se entrenan matrices de descomposición de bajo rango que se suman a determinadas capas lineales, lo que reduce drásticamente el número de parámetros entrenables y el coste de memoria del ajuste fino. El repositorio declara `library_name: peft`, `pipeline_tag: text-generation` y la etiqueta `base_model:adapter:HuggingFaceTB/SmolLM2-360M-Instruct`, lo que confirma esta arquitectura. La model card indica únicamente PEFT 0.21.2 como versión de framework.

No hay información disponible sobre los datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan los hiperparámetros del ajuste (rango, alpha, dropout, capas objetivo, tasa de aprendizaje, precisión mixta) ni la infraestructura de cómputo empleada. El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los pesos del adaptador o bien son de tamaño despreciable en la métrica mostrada, o bien no están completamente subidos, o bien el repositorio no contiene artefactos adicionales relevantes.

## Capacidades

- Generación de texto conversacional heredada del modelo base SmolLM2-360M-Instruct, con calidad limitada por el reducido tamaño del modelo.
- Ajuste específico desconocido: al no documentarse el dataset de entrenamiento, no es posible afirmar qué comportamiento concreto se ha reforzado o alterado respecto al base.
- Soporte de tool calling o function calling: no disponible (el modelo base no está diseñado específicamente para ello).
- Capacidades de agente y razonamiento multi-paso: no disponibles; el tamaño del modelo lo hace poco adecuado para cadenas de razonamiento largas.
- Capacidades multilingües: no documentadas en el adaptador; el modelo base está centrado en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Formato de uso: carga como adaptador PEFT sobre el modelo base, o fusión de pesos para obtener un modelo denso estándar.

## Casos de uso

- Prototipado de flujos de ajuste fino con PEFT: el adaptador sirve como referencia práctica para construir pipelines de LoRA sobre modelos de menos de 500 M de parámetros, validando scripts de entrenamiento, fusión y despliegue antes de escalar a modelos mayores.
- Experimentación académica sobre eficiencia de parámetros: permite estudiar el impacto de un ajuste LoRA en un modelo de 361 M con recursos mínimos, por ejemplo en estudios comparativos de rango, capas objetivo o estrategias de fusión.
- Asistentes embebidos sin conexión: al poder ejecutarse en CPU, el modelo fusionado puede integrarse en aplicaciones de escritorio o dispositivos edge para tareas de respuesta corta y plantillas, siempre que la calidad exigida sea baja.
- Generación de texto auxiliar de bajo coste: creación de borradores, reformulación de frases cortas o generación de textos de relleno en herramientas internas donde el coste por token sea un factor crítico.
- Clasificación y etiquetado ligero mediante prompts: con prompts cerrados y salidas restringidas, el modelo puede emplearse para tareas de categorización simple (sentimiento, intención, tema) en las que la latencia y el consumo importen más que la precisión.
- Pruebas de integración de infraestructura: útil como modelo de juguete para validar despliegues con vLLM, llama.cpp, Ollama o TGI antes de mover cargas reales, dado su reducido consumo de memoria.
- Demostraciones educativas: ejemplo didáctico de cómo funciona un adaptador LoRA, cómo se carga con PEFT y cómo se fusiona con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del adaptador no incluye ninguna sección de evaluación con datos, y la model card es la plantilla por defecto con todos los campos marcados como "[More Information Needed]". No se dispone tampoco de métricas de latencia o throughput medidas para este adaptador concreto.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| HellaSwag | no disponible |
| Cualquier otra evaluación | no disponible |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo base (361 M de parámetros) y no están confirmadas por el autor del adaptador.

- VRAM para pesos en fp16: aproximadamente 0,72 GB para el modelo base fusionado, más el coste de activaciones y caché KV.
- VRAM para pesos en 8-bit: aproximadamente 0,36 GB; en 4-bit, aproximadamente 0,18 GB.
- Caché KV estimada para el modelo base en fp16 y contexto completo: del orden de 300-350 MB a 8192 tokens, según la configuración de atención del base (cifra orientativa, no verificada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o equivalente es más que suficiente. También funciona en GPU integradas y en CPU.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU moderna, y también en dispositivos con poca memoria (Raspberry Pi, móviles de gama media-alta según runtime).
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp y Ollama para el modelo base en GGUF una vez fusionado y convertido; vLLM y TGI son viables pero sobredimensionados para este tamaño, aunque útiles para pruebas de integración.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

Los datos de terceros provienen de documentación pública y pueden variar; se incluyen únicamente como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| northstar-smollm2-360m-lora-v3 | 361 M (base) + adaptador | 8192 (base) | no disponible | safetensors (LoRA) | Sin documentación ni evaluación publicadas |
| SmolLM2-360M-Instruct | 361 M | 8192 | Apache-2.0 | safetensors, GGUF | Modelo base del adaptador; documentación completa y evaluaciones publicadas por HuggingFaceTB |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32 768 | Apache-2.0 | safetensors, GGUF | Alternativa habitual en el mismo rango de tamaño, con contexto mayor |
| TinyLlama-1.1B-Chat | ~1,1 B | 2048 | Apache-2.0 | safetensors, GGUF | Algo más grande, contexto menor, ecosistema maduro |

No se dispone de comparativas de rendimiento entre estos modelos realizadas por el autor del adaptador.

## Limitaciones y advertencias

- Model card vacía: la documentación es la plantilla por defecto de HuggingFace sin rellenar. No se indica el propósito del ajuste, el dataset ni los hiperparámetros, lo que impide reproducir o auditar el entrenamiento.
- Licencia no especificada: el repositorio no declara licencia. Aunque el modelo base sea Apache-2.0, la ausencia de licencia explícita en el adaptador genera incertidumbre legal para uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Sin evaluación: no hay ningún benchmark, prueba cualitativa ni análisis de errores publicado.
- Riesgo elevado de alucinación: los modelos de ~360 M de parámetros generan con frecuencia contenido factualmente incorrecto, incoherente o repetitivo, especialmente en tareas de razonamiento o conocimiento del mundo.
- Capacidad de razonamiento limitada: no es adecuado para matemáticas complejas, código de producción, cadenas de razonamiento largas ni tareas de agente con múltiples pasos.
- Sesgos: no documentados. Al desconocerse el dataset, no es posible evaluar sesgos de género, raza, religión u otros. Los sesgos del modelo base tampoco se analizan en este repositorio.
- Limitaciones de contexto e idioma: el contexto está acotado por el modelo base (8192 tokens) y el soporte multilingüe no está garantizado; es probable un rendimiento muy inferior en castellano que en inglés.
- Riesgo de comportamiento degradado: un ajuste LoRA sin evaluación puede haber degradado capacidades del modelo base (por ejemplo, aumentar la verbosidad o reducir la coherencia). Se recomienda comparar siempre el adaptador contra el modelo base sin ajustar.
- Trazabilidad: cero descargas y cero "likes" en el momento de la consulta, sin historial de uso ni validación por parte de la comunidad.
- Nomenclatura "northstar" y versión "v3": sugiere iteraciones previas del mismo autor que no están enlazadas en la información disponible.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/DrDavis/northstar-smollm2-360m-lora-v3
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper del modelo base SmolLM2 (documentación pública): https://arxiv.org/abs/2502.02737
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Referencia citada en las etiquetas del repositorio, Lacoste et al. (2019) sobre emisiones de carbono: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact
