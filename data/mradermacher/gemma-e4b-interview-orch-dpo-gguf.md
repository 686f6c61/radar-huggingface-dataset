# mradermacher/gemma-e4b-interview-orch-dpo-GGUF

## Resumen

gemma-e4b-interview-orch-dpo-GGUF es una colección de cuantizaciones GGUF publicada por mradermacher a partir del modelo ajujohn8/gemma-e4b-interview-orch-dpo. El modelo base es un ajuste fino (fine-tuning) con DPO de un modelo de la familia Gemma (etiquetado como gemma4, variante e4b), orientado aparentemente a la generación de texto conversacional, concretamente al dominio de entrevistas y orquestación (según sugiere el nombre "interview-orch-dpo"). El ajuste con DPO indica que el modelo ha sido alineado con preferencias humanas para mejorar la calidad de sus respuestas.

La relevancia de esta ficha radica en la disponibilidad del modelo en formato GGUF, lo que permite ejecutarlo localmente en CPU y GPU de consumo mediante llama.cpp, Ollama u otros runtimes compatibles. El repositorio ofrece cuantizaciones desde Q2_K (4,5 GB) hasta f16 (15,2 GB), además de archivos mmproj (suplemento multimodal), lo que sugiere que el modelo base dispone de capacidades de visión. Con unos 7.518 millones de parámetros, se trata de un modelo de tamaño medio adecuado para hardware doméstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, variante e4b; detalles adicionales no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (etiquetado como "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un Gemma e4b (etiqueta "gemma4" en los metadatos), una familia de transformers de Google DeepMind. El sufijo "e4b" en la nomenclatura reciente de Gemma suele asociarse a variantes eficientes con aproximadamente 4.000 millones de parámetros efectivos; sin embargo, el dato real de safetensors indica 7.518 millones de parámetros totales, lo que podría corresponder a una arquitectura con parámetros activos y totales distintos (por ejemplo, una variante con esparsidad o embeddings de vocabulario amplio). El repositorio no proporciona documentación técnica adicional sobre este punto, por lo que los detalles concretos de la arquitectura no están disponibles.

Sobre el entrenamiento, el nombre del modelo indica un proceso de alineación mediante DPO (Direct Preference Optimization) aplicado sobre el modelo base Gemma e4b, presumiblemente orientado al dominio de entrevistas y orquestación de conversaciones. No hay información disponible sobre el número de tokens, la composición del dataset, ni sobre si se empleó RLHF previo. La presencia de archivos mmproj (multimodal projector) en las cuantizaciones sugiere que el modelo incorpora un componente de visión compatible con llama.cpp.

## Capacidades

- Generación de texto conversacional, con ajuste fino DPO orientado al dominio de entrevistas y orquestación.
- Posibles capacidades multimodales (visión): el repositorio incluye archivos mmproj-Q8_0 y mmproj-f16, suplementos multimodales compatibles con llama.cpp.
- Compatible con text-generation-inference y librería transformers.
- Ejecución local eficiente mediante formato GGUF en llama.cpp, Ollama, LM Studio y runtimes similares.
- Soporte de tool calling: no disponible (no documentado).
- Capacidades multilingües: no disponibles de forma documentada; el modelo está etiquetado solo en inglés.

## Casos de uso

- Simulación de entrevistas técnicas: el ajuste DPO en dominio de entrevistas lo hace adecuado para generar preguntas, evaluar respuestas y simular conversaciones de selección de personal o entrevistas técnicas de forma interactiva.
- Orquestación de conversaciones multi-turno: el componente "orch" del nombre sugiere capacidad para gestionar flujos conversacionales estructurados, útil en chatbots de entrevista o asistentes de práctica.
- Asistentes locales privados: al estar disponible en GGUF, puede ejecutarse íntegramente en local, lo que lo hace idóneo para entornos donde la confidencialidad de las conversaciones es crítica (por ejemplo, preparación de entrevistas con datos sensibles).
- Integración en aplicaciones con LM Studio u Ollama: los archivos cuantizados permiten desplegarlo en estaciones de trabajo sin GPU de gama alta, con la variante Q4_K_M (5,4 GB) como equilibrio recomendado entre calidad y tamaño.
- Análisis de imágenes combinado con texto: si se emplean los archivos mmproj, puede utilizarse para tareas que combinen entrada visual y generación de texto en el contexto de entrevistas (por ejemplo, interpretar capturas de código).
- Prototipado de agentes conversacionales: su tamaño contenido y licencia Apache 2.0 permiten integrarlo en pipelines de evaluación y experimentación sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización:
  - Q2_K: aproximadamente 4,5 GB
  - Q4_K_S / Q4_K_M: aproximadamente 5,3-5,4 GB
  - Q6_K: aproximadamente 6,3 GB
  - Q8_0: aproximadamente 8,1 GB
  - f16: aproximadamente 15,2 GB
  - A estas cifras hay que sumar la memoria del contexto (KV cache), que depende de la longitud de ventana utilizada.
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060 Ti) ejecuta cómodamente las cuantizaciones Q4; con 12-16 GB (RTX 4070 Ti Super, RTX 4090) pueden usarse Q6_K o Q8_0 con contextos amplios. También es viable su ejecución en CPU pura dada su talla moderada.
- Consumer GPU: sí, cabe en la mayoría de GPUs de consumo modernas con 8 GB de VRAM o más usando Q4_K_M.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-inference. No está documentado el soporte en vLLM para estos GGUF.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de ~7,5 mil millones de parámetros, se espera un rendimiento fluido en GPUs de consumo (decenas de tokens por segundo con Q4_K_M en una RTX 4090), aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| gemma-e4b-interview-orch-dpo-GGUF (esta ficha) | 7.518 M | GGUF | Apache 2.0 | Ajuste DPO en dominio de entrevistas, posible multimodalidad |
| Gemma 3 4B (Google) | ~4.000 M | safetensors, GGUF (comunidad) | Gemma license | Modelo base de la familia, contexto largo, multimodal |
| Qwen2.5-7B-Instruct | 7.600 M | safetensors, GGUF (comunidad) | Qwen license (uso comercial condicionado) | Tamaño similar, buen rendimiento general y en código |

Nota: no hay datos de benchmarks que permitan comparar rendimiento cuantitativo entre estos modelos; la comparativa se limita a especificaciones.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente en inglés; su rendimiento en castellano no está documentado y probablemente sea inferior al mostrado en inglés.
- No hay model card detallada del modelo base con datos de entrenamiento, benchmarks ni evaluaciones de seguridad, lo que dificulta evaluar su fiabilidad.
- Al ser un ajuste fino comunitario con DPO en un dominio concreto (entrevistas), puede presentar degradación en tareas generales fuera de ese dominio (catastrorophic forgetting no evaluado).
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad de salida; se recomiendan Q4_K_M o superiores para uso serio.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene verificar la licencia del modelo base y de la familia Gemma subyacente.
- La disponibilidad de cuantizaciones imatrix/weighted no está garantizada; en el momento de la ficha solo existen cuantizaciones estáticas.
- La longitud de contexto no está documentada en el repositorio; debe verificarse en la configuración del modelo base antes de planificar cargas de contexto largo.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/gemma-e4b-interview-orch-dpo-GGUF
- Modelo base: https://huggingface.co/ajujohn8/gemma-e4b-interview-orch-dpo
- Página de descargas resumida: https://hf.tst.eu/model#gemma-e4b-interview-orch-dpo-GGUF
- Guía de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo: no disponibles
