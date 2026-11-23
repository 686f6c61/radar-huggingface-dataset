# mradermacher/CounselTrajLM-GGUF

## Resumen

CounselTrajLM-GGUF es la versión cuantizada en formato GGUF del modelo CounselTrajLM, desarrollado originalmente por el laboratorio UEC-InabaLab y empaquetado por mradermacher para su uso con llama.cpp y herramientas compatibles. El modelo base está especializado en generación de respuestas de consejería psicológica (counselor-response-generation) y está etiquetado con la arquitectura qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada mediante fusión de pesos (merged) para la tarea de consejería.

Con aproximadamente 8.950 millones de parámetros totales, se sitúa en la franja de modelos de tamaño medio, lo que lo hace desplegable en GPUs de consumo con las cuantizaciones adecuadas. Su propósito es servir como motor conversacional especializado en diálogo terapéutico y de apoyo psicológico, un nicho con creciente demanda tanto en investigación como en aplicaciones de salud digital. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque con las cautelas propias de un modelo orientado a un dominio sensible.

La relevancia de esta ficha radica en que el repositorio GGUF ofrece múltiples cuantizaciones (desde Q2_K hasta f16) que permiten ajustar el equilibrio entre calidad y requisitos de memoria, algo crítico para un modelo que aspira a mantener coherencia conversacional en contextos de consejería. No obstante, la información pública disponible sobre el modelo base es limitada, por lo que varios parámetros técnicos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como qwen3_5, modelo merged) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base CounselTrajLM se distribuye como un modelo fusionado (merged) sobre una arquitectura etiquetada como qwen3_5, lo que apunta a una familia de transformers densos derivada de Qwen 3.5. La ficha del repositorio GGUF no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones técnicas particulares (decodificación especulativa, atención lineal, etc.) más allá de la propia fusión de pesos que da lugar al modelo.

El proceso de cuantización realizado por mradermacher genera cuantizaciones estáticas (no imatrix) mediante conversión desde el formato Hugging Face a GGUF. El autor indica que las cuantizaciones ponderadas/imatrix están disponibles en un repositorio separado (CounselTrajLM-i1-GGUF), lo que sugiere que las versiones i1 pueden ofrecer mejor calidad por tamaño. La especialización en consejería psicológica implica que el modelo fue ajustado o fusionado para producir respuestas conversacionales propias de un consejero, aunque los detalles del corpus terapéutico empleado no están documentados en la información disponible.

## Capacidades

- Generación de texto conversacional orientada a diálogo de consejería psicológica.
- Generación de respuestas de consejero (counselor-response-generation) en conversaciones multi-turno.
- Soporte del idioma chino (zh) como idioma declarado.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Formato GGUF apto para inferencia local con llama.cpp y derivados.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- No se documentan capacidades multilingües más allá del chino.

## Casos de uso

- Asistente de apoyo emocional en chino: el modelo puede mantener conversaciones multi-turno generando respuestas empáticas propias de un consejero, adecuado para prototipos de aplicaciones de bienestar emocional dirigidas a usuarios sinohablantes.
- Simulación de sesiones terapéuticas para formación: investigadores en psicología clínica pueden emplear el modelo para generar respuestas de consejero sintéticas y estudiar dinámicas de diálogo, gracias a su especialización en el dominio.
- Generación de datos sintéticos para investigación: el modelo puede producir pares de diálogo consejero-consultante que sirvan para aumentar corpus de entrenamiento o evaluación en el ámbito de la salud mental conversacional.
- Chatbot de primera acogida en servicios de orientación psicológica: desplegado con cuantización Q4_K_M o Q5_K_M en una GPU de consumo, puede ofrecer respuestas iniciales de contención antes de derivar a un profesional humano.
- Evaluación de sistemas de consejería: el modelo puede actuar como referencia (baseline) en benchmarks de generación de respuestas terapéuticas, comparando su salida con la de otros modelos especializados.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (4,0 GB) y Q3_K_S (4,4 GB) permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, facilitando pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,0 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,8 GB; Q3_K_L ~5,1 GB; IQ4_XS ~5,4 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,8 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB (tamaños de archivo del repositorio; la VRAM real requiere margen adicional para el contexto y el runtime).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 para despliegue en producción con f16 y alta concurrencia.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q6_K en GPUs de 8-12 GB; Q8_0 requiere al menos 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o servidores basados en llama.cpp); el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables especializados en consejería psicológica con arquitectura qwen3_5 en la documentación proporcionada. Se indica "no disponible" para una comparativa rigurosa con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CounselTrajLM-GGUF | ~8,95 B | no disponible | Apache 2.0 | GGUF en Hugging Face |
| Alternativas especializadas en consejería | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en consejería psicológica: no debe utilizarse como sustituto de atención profesional sanitaria; existe riesgo de respuestas inadecuadas en situaciones de crisis.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en un dominio sensible donde una respuesta errónea puede causar daño.
- Idiomas soportados limitados al chino según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas o tareas de recuperación sobre documentos extensos.
- Sesgos conocidos: no documentados en la información disponible, pero probables sesgos culturales derivados del corpus de entrenamiento en chino.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue en aplicaciones de salud mental exige cumplimiento normativo adicional (por ejemplo, regulación de dispositivos médicos y protección de datos).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la coherencia conversacional; se recomienda Q4_K_M o superior para producción.
- El repositorio GGUF no incluye información sobre el proceso de alineación del modelo base, lo que limita la evaluación de su seguridad conversacional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CounselTrajLM-GGUF
- Modelo base: https://huggingface.co/UEC-InabaLab/CounselTrajLM
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/CounselTrajLM-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#CounselTrajLM-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
