# mradermacher/Olmo-3-7B-Cooking-Assistant-GGUF

## Resumen

Olmo-3-7B-Cooking-Assistant-GGUF es la versión cuantizada en formato GGUF del modelo HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant, un ajuste fino (LoRA) del modelo base Olmo 3 de 7B orientado a tareas culinarias: recetas, técnicas de cocina y asistencia conversacional en ese dominio. La cuantización la ha realizado mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y el resultado está pensado para su uso con llama.cpp y runtimes compatibles.

El modelo cuenta con 7.298.011.136 parámetros totales (aproximadamente 7,3 mil millones) y deriva de la familia Olmo 3, una arquitectura transformer densa de código abierto. El ajuste incorpora etiquetas que sugieren un entrenamiento centrado en procedencia (provenance) y abstención (abstention), es decir, en citar fuentes y en declinar responder cuando no hay información fiable, aspectos relevantes para un asistente de cocina que debe evitar inventar recetas o ingredientes.

La relevancia de esta ficha radica en que ofrece un modelo de dominio específico, ejecutable en hardware de consumo gracias a sus cuantizaciones de 3 a 15 GB, con licencia Apache 2.0 y únicamente en inglés. No hay datos publicados de benchmarks ni de contexto máximo en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3); detalles específicos no disponibles |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant, que a su vez parte de la familia Olmo 3 de 7B parámetros. Se trata de un transformer denso, no de una arquitectura MoE ni híbrida. La model card del cuantizador no detalla la composición del dataset de ajuste ni el número de tokens empleados; únicamente referencia el dataset HumanjavaEnterprises/cooking-assistant-eval como material de evaluación.

Las etiquetas del modelo (cooking, recipes, provenance, abstention) indican que el entrenamiento buscó dos comportamientos: por un lado, conocimiento culinario práctico; por otro, la capacidad de señalar la procedencia de la información y de abstenerse de responder cuando no dispone de datos fiables. No se especifica si se aplicó RLHF o DPO, ni detalles sobre la tokenización o innovaciones de atención. La cuantización es estática (quantize_version 2, output_tensor_quantised 1) y no se han publicado variantes con imatrix por parte del autor.

## Capacidades

- Generación de texto conversacional en inglés sobre cocina, recetas y técnicas culinarias.
- Asistencia en la elaboración de recetas: ingredientes, pasos, sustituciones y tiempos.
- Comportamiento de abstención: el modelo está entrenado para declinar responder cuando no tiene información fiable, según las etiquetas de la model card.
- Trazabilidad de procedencia: capacidad declarada de indicar el origen de la información.
- Uso conversacional multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente culinario conversacional: el modelo puede mantener diálogos multi-turno sobre recetas y técnicas, resolviendo dudas de sustitución de ingredientes o ajuste de cantidades, siempre en inglés.
- Generación de recetas estructuradas: útil para crear fichas de recetas con ingredientes y pasos a partir de una petición breve, integrándolo en un CMS o generador de contenido gastronómico.
- Atención al cliente en negocios de alimentación: responder preguntas frecuentes sobre productos, alérgenos o preparación, con la ventaja de que el modelo está entrenado para abstenerse cuando no sabe, reduciendo respuestas inventadas.
- Educación y formación en cocina: apoyo a estudiantes o aficionados que necesitan explicaciones paso a paso, ejecutable localmente en un portátil con GPU de consumo.
- Evaluación de asistentes culinarios: el dataset cooking-assistant-eval permite usar el modelo como referencia en pruebas de calidad de respuestas en dominio gastronómico.
- Despliegue en local o edge: gracias a las cuantizaciones Q4_K_M (4,6 GB) o Q3_K_M (3,8 GB), puede ejecutarse en equipos sin GPU dedicada o con GPUs modestas, útil para prototipos y demos offline.
- Filtrado y enriquecimiento de recetas: procesar textos de recetas para normalizar ingredientes o detectar pasos incompletos, con la cautela de que solo opera en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,0 GB (Q2_K) hasta 7,9 GB (Q8_0); la versión f16 requiere unos 14,7 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 4090); para Q8_0 o f16, se recomienda RTX 3090/4090 o A100/H100.
- Cabe en GPU de consumo: sí, con Q4_K_M (4,6 GB) o Q4_K_S (4,3 GB), que el autor marca como rápidas y recomendadas; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI si se usa en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olmo-3-7B-Cooking-Assistant-GGUF | 7,3B | no disponible | Apache 2.0 | GGUF | Especializado en cocina, solo inglés |
| Olmo 3 7B (base) | ~7B | no disponible | Apache 2.0 (según familia Olmo) | safetensors/GGUF | Modelo generalista del que deriva |
| Mistral 7B Instruct | ~7,2B | 32K (según versión) | Apache 2.0 | safetensors/GGUF | Generalista, multilingüe |
| Llama 3.1 8B Instruct | ~8B | 128K | Llama 3.1 Community License | safetensors/GGUF | Generalista, multilingüe, licencia con restricciones |

La comparación con Mistral 7B y Llama 3.1 8B es orientativa: no se dispone de benchmarks del modelo culinario para contrastar rendimiento real frente a estos generalistas.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en castellano.
- Riesgo de alucinación en recetas: aunque incorpora entrenamiento en abstención, puede generar ingredientes, cantidades o pasos plausibles pero incorrectos; requiere verificación humana en contextos de seguridad alimentaria.
- No hay datos publicados sobre sesgos; al ser un ajuste de dominio, puede heredar sesgos del modelo base Olmo 3.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste deben verificarse por separado; el cuantizador no añade restricciones adicionales conocidas.
- Sin soporte documentado de tool calling ni agentes, lo que limita su integración en pipelines automatizados complejos.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: poca validación comunitaria y sin garantías de mantenimiento.
- No se han publicado cuantizaciones con imatrix, lo que puede reducir la calidad frente a cuantizaciones ponderadas en tamaños pequeños (Q2/Q3).

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Olmo-3-7B-Cooking-Assistant-GGUF
- Modelo base ajustado: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Página de descargas del cuantizador: https://hf.tst.eu/model#Olmo-3-7B-Cooking-Assistant-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
