# mradermacher/jailbreak-creator-GGUF

## Resumen

jailbreak-creator-GGUF es la versión cuantizada en formato GGUF del modelo SynastriaNetworks/jailbreak-creator, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de llama.cpp. El modelo original es un ajuste fino de la familia Qwen2, con aproximadamente 494 millones de parámetros totales, orientado explícitamente a tareas de red-teaming y evaluación de seguridad (safety). Su propósito declarado es la generación de prompts de tipo jailbreak, lo que lo convierte en una herramienta de doble uso: útil para auditar defensas de otros modelos, pero también potencialmente peligrosa si se emplea sin las salvaguardas adecuadas.

La relevancia de esta ficha radica en que se trata de un modelo pequeño (sub-1B), lo que permite desplegarlo en hardware muy modesto, incluso en CPU, con cuantizaciones que van desde Q2_K (0,4 GB) hasta f16 (1,1 GB). El repositorio GGUF ocupa 5,4 GB en total e incluye once variantes de cuantización estáticas. El autor de la cuantización indica que no hay planes inmediatos para cuantizaciones ponderadas o con imatrix, aunque acepta peticiones a través de discusiones de la comunidad.

La licencia es OpenRAIL, una licencia de uso restringido que impone condiciones sobre usos dañinos, lo cual es coherente con la naturaleza sensible del modelo. El idioma declarado en la model card es portugués (pt), aunque no se especifican más detalles sobre cobertura multilingüe. No se dispone de información sobre el pipeline de la tarea ni sobre benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Portugues (segun model card); cobertura adicional no disponible |
| Licencia | OpenRAIL |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SynastriaNetworks/jailbreak-creator es un ajuste fino de un modelo de la familia Qwen2, tal como indican las etiquetas del repositorio (qwen2). Con 494 millones de parámetros, se sitúa en el rango de los modelos pequeños de Qwen2 (probablemente Qwen2-0.5B, aunque el dato exacto del checkpoint de partida no se especifica en la información disponible). La arquitectura es un transformer decoder-only estándar con atención causal, sin mecanismos MoE ni componentes híbridos SSM.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Las etiquetas red-teaming y safety sugieren que el ajuste se orientó a la generación de prompts adversariales, pero no se documentan detalles metodológicos. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización fue realizada por mradermacher con convert_type hf y quantize_version 2, generando cuantizaciones estáticas sin imatrix.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como conversational y orientado a diálogo multi-turno.
- Generación de prompts de jailbreak: capacidad central del ajuste, pensada para red-teaming y pruebas de robustez de sistemas de moderación.
- Evaluación de seguridad: puede emplearse para generar casos adversariales que pongan a prueba las defensas de otros modelos o filtros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el portugués es el único idioma declarado; no se documenta cobertura adicional.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Red-teaming de filtros de moderación: el modelo puede generar variantes de prompts adversariales en portugués para comprobar si un clasificador de contenido detecta intentos de jailbreak, gracias a su ajuste específico en esta tarea y a su bajo coste de inferencia.
- Auditoría de sistemas conversacionales: integrado en un pipeline de evaluación, permite producir lotes de entradas maliciosas y medir la tasa de éxito de las defensas de un chatbot desplegado.
- Investigación en seguridad de LLM: sirve como generador controlado de casos de prueba en entornos de laboratorio, donde el investigador necesita material adversarial reproducible y de tamaño reducido para ejecutar en local.
- Formación de equipos de seguridad: permite construir ejercicios prácticos de detección de jailbreaks sin depender de APIs externas, al poder ejecutarse en CPU con cuantizaciones Q4_K_M de 0,5 GB.
- Pruebas de regresión en CI/CD de moderación: al ser pequeño y rápido, puede incorporarse a suites automatizadas que verifiquen que un cambio en el filtro de contenido no degrada la detección de ataques conocidos.
- Análisis de sesgos en clasificadores de seguridad: generar prompts adversariales en portugués permite estudiar si los filtros tienen un rendimiento inferior en este idioma frente al inglés, un fenómeno documentado en la literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones; Q4_K_M ocupa 0,5 GB y f16 1,1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); también funciona en CPU sin GPU dedicada.
- Cabe en consumer GPU: sí, en todas las GPU modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. El modelo base es compatible con transformers y text-generation-inference, pero las cuantizaciones GGUF requieren runtimes específicos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (sub-1B), se espera una latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jailbreak-creator-GGUF (este) | 494 M | no disponible | OpenRAIL | GGUF | Ajuste específico para red-teaming, en portugués |
| Qwen2-0.5B-Instruct | ~494 M | 32 768 (según documentación pública de Qwen2) | Apache 2.0 | safetensors, GGUF | Modelo generalista de referencia de la misma familia; contexto y licencia más permisivos |
| Qwen2.5-0.5B-Instruct | ~494 M | 32 768 (según documentación pública de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Sucesor generalista con mejoras en instrucciones y multilingüismo |
| SmolLM2-360M-Instruct | 360 M | 8 192 (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa pequeña generalista de Hugging Face |

La comparación con los modelos generalistas de la misma familia es relevante porque comparten tamaño y arquitectura base, pero difieren en propósito: jailbreak-creator está especializado en generación adversarial y no está pensado como asistente general. Los datos de contexto de los modelos comparables provienen de documentación pública y no de la información proporcionada para este modelo, por lo que se indican como referencia externa.

## Limitaciones y advertencias

- Uso dual: el modelo está diseñado para generar jailbreaks; un uso no controlado puede facilitar eludir salvaguardas de otros sistemas. Debe emplearse únicamente en entornos de investigación y con supervisión.
- Licencia OpenRAIL: impone restricciones de uso; no es una licencia permisiva como Apache 2.0 y requiere revisar las cláusulas de uso aceptable antes de cualquier despliegue comercial.
- Idiomas: solo se declara portugués; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Contexto: no se especifica la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas.
- Alucinación: al ser un modelo de 494 M de parámetros, la coherencia factual es limitada; no debe usarse como fuente de información.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos pequeños ajustados con datasets específicos tienden a reproducir sesgos de los datos de entrenamiento.
- Benchmarks: no hay métricas publicadas, por lo que no es posible comparar su eficacia real como generador de jailbreaks frente a alternativas.
- Producción: no se recomienda su despliegue en sistemas de cara al usuario sin filtros adicionales; su función es de herramienta interna de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jailbreak-creator-GGUF
- Modelo base: https://huggingface.co/SynastriaNetworks/jailbreak-creator
- Página de resumen del cuantizador: https://hf.tst.eu/model#jailbreak-creator-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
