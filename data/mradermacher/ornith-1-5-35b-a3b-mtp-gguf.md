# mradermacher/Ornith-1.5-35B-A3B-MTP-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Ornith AI, presentado como el miembro de tamaño medio de la familia Ornith-1.5. Su arquitectura, basada en el tronco de Qwen 3.6-35B-A3B, activa aproximadamente 3.000 millones de parámetros por token, lo que lo sitúa en una categoría de alta eficiencia computacional. El modelo incorpora predicción multi-token (MTP) y ha sido afinado mediante destilación de conocimiento, lo que le permite superar a su homólogo Qwen 3.6-35B en pruebas de código y agentes, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B por márgenes significativos.

La versión que nos ocupa, `mradermacher/Ornith-1.5-35B-A3B-MTP-GGUF`, es una cuantización en formato GGUF realizada por mradermacher, diseñada para ejecución local con herramientas como llama.cpp, Ollama o LM Studio. Se ofrecen cuantizaciones estáticas (Q2_K, Q4_K_S, Q8_0) y archivos multimodales complementarios (mmproj), aunque el modelo base es principalmente textual. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con predicción multi-token (MTP) |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | ~3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q4_K_S, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (además de safetensors en el modelo original) |

Nota: el dato de parámetros totales en safetensors (446.571.248) corresponde probablemente a un archivo individual o a un error de metadatos; el nombre del modelo y las fuentes oficiales confirman 35B totales y ~3B activos.

## Arquitectura y entrenamiento

El modelo base `shisa-ai/Ornith-1.5-35B-A3B-MTP` es un transformador de tipo MoE con 35B de parámetros totales y 3B activos por token. Incorpora el mecanismo de predicción multi-token (MTP), que permite anticipar varios tokens futuros simultáneamente, mejorando la velocidad de inferencia y la coherencia en tareas de razonamiento. Según la documentación, el entrenamiento utilizó destilación de conocimiento (knowledge distillation) sobre el tronco de Qwen 3.6-35B-A3B, lo que explica las mejoras frente a su modelo base. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas como RLHF o DPO.

La cuantización GGUF de mradermacher es estática (no usa imatrix), lo que implica una ligera pérdida de calidad en comparación con quants ponderados, pero mantiene un buen equilibrio entre tamaño y rendimiento. Se incluyen archivos mmproj que sugieren compatibilidad multimodal, aunque el modelo base no documenta capacidades de visión de forma explícita.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo *thinking* (razonamiento encadenado).
- Generación y comprensión de código, con buen desempeño en tareas de programación y depuración.
- Soporte de *tool calling* y *function calling*, útil para integración en agentes y pipelines.
- Capacidades de agente y ejecución de tareas multi-paso (agentic workflows).
- Destilación de conocimiento para mejorar la precisión en razonamiento matemático y lógico.
- Multilingüismo limitado al inglés (según la tarjeta del modelo).

## Casos de uso

- **Asistente de codificación en producción**: el modelo puede integrarse en IDEs o CLI para autocompletar, revisar código y generar tests. Su bajo número de parámetros activos permite latencias bajas en hardware moderado.
- **Agentes autónomos**: gracias al soporte de tool calling y MTP, es adecuado para sistemas que necesitan razonar, planificar y ejecutar acciones en múltiples pasos (por ejemplo, automatización de tareas de DevOps).
- **Chatbots de atención al cliente**: aunque solo en inglés, su capacidad de razonamiento permite gestionar consultas complejas y mantener contexto en conversaciones largas (si la longitud de contexto es suficiente, aunque no se ha especificado).
- **Análisis de documentos técnicos**: puede resumir, extraer información y responder preguntas sobre documentación extensa, siempre que el contexto lo permita.
- **Generación de documentación**: a partir de código o especificaciones, puede redactar guías y comentarios técnicos.
- **Evaluación de pruebas unitarias**: con su destreza en código, puede generar casos de prueba o detectar errores en código existente.
- **Prototipado rápido de aplicaciones de IA**: gracias a la licencia Apache-2.0, puede usarse sin restricciones comerciales, lo que facilita su integración en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información proporcionada. Las fuentes web indican que el modelo supera a Qwen 3.6-35B en todos los benchmarks de código y agentes, y a Gemma 4-31B y Muse Glimmer-30B por márgenes amplios, pero no se aportan cifras concretas. La plataforma BenchLM le asigna una puntuación pública de 49.22/100 (estimada), pero no se desglosan los resultados por tarea. Por tanto, no se puede presentar una tabla comparativa fiable.

## Requisitos de hardware

- **VRAM estimada** (según cuantización):
  - Q2_K: ~13,3 GB (cabe en GPUs de 16 GB como RTX 4090 o RTX 4080).
  - Q4_K_S: ~20,5 GB (recomendado para RTX 4090 (24 GB) o A100 40 GB).
  - Q8_0: ~37,9 GB (requiere GPU con al menos 40 GB, como A100 o RTX 6000 Ada).
- **GPU recomendadas**: A100 40/80 GB, RTX 4090, RTX 6000 Ada, o configuraciones multi-GPU con llama.cpp.
- **Compatibilidad**: el modelo funciona en GPU de consumo con cuantizaciones Q4_K_S y Q2_K, siempre que la VRAM supere el tamaño del archivo.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (aunque la cuantización GGUF no es compatible con vLLM; se necesita safetensors para vLLM), TGI, y cualquier herramienta que soporte GGUF.
- **Latencia y throughput**: no se han publicado mediciones específicas; con ~3B activos, se espera una velocidad de generación de 20-50 tokens/s en GPU consumer con Q4_K_S, aunque depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MTP | 35B | 3B | no disponible | Apache-2.0 | Mejora sobre Qwen 3.6 en código y agentes |
| Qwen 3.6-35B-A3B | 35B | 3B | no disponible | Apache-2.0 | Base del modelo, sin MTP |
| Gemma 4-31B | 31B | denso | no disponible | Gemma | Denso, más pesado en inferencia |
| Muse Glimmer-30B | 30B | denso | no disponible | no disponible | Denso, alternativo |

La comparativa se basa en datos públicos de la tarjeta del modelo; los contextos no están documentados.

## Limitaciones y advertencias

- **Idioma**: solo se ha entrenado en inglés; no se recomienda para tareas multilingües sin evaluación adicional.
- **Cuantización**: las versiones GGUF estáticas (sin imatrix) pueden degradar la precisión en tareas de razonamiento complejo. Se recomienda usar Q8_0 para máxima fidelidad.
- **Contexto desconocido**: no se ha especificado la longitud máxima de contexto, lo que limita su uso en aplicaciones que requieren ventanas muy largas.
- **Sesgos**: al estar basado en Qwen 3.6, puede heredar sesgos de los datos de entrenamiento originales, aunque no hay estudios específicos.
- **Alucinación**: como todos los modelos generativos, puede producir información falsa, especialmente en dominios de conocimiento poco representados.
- **Licencia**: Apache-2.0 permite uso comercial, pero es necesario verificar que los pesos cuantizados mantienen la licencia original (en este caso, así se indica).
- **Soporte de visión**: los archivos mmproj sugieren multimodalidad, pero no se ha documentado formalmente; su uso puede ser experimental.

## Enlaces

- [Repositorio GGUF de mradermacher](https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-MTP-GGUF)
- [Modelo original en HuggingFace](https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP)
- [Modelo original de Ornith AI](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Blog de MindStudio sobre despliegue local](https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run)
- [Página de benchmarks en BenchLM](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [Imagen Docker del modelo](https://hub.docker.com/r/ai/ornith-1.5)
