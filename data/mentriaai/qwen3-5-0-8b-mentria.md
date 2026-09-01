# mentriaai/Qwen3.5-0.8B-mentria

## Resumen

Qwen3.5-0.8B-mentria es una versión cuantizada a Q4_0 del modelo multimodal Qwen3.5-0.8B de Alibaba, adaptada por el estudio mentria.ai para ejecutarse íntegramente en el navegador mediante WebGPU a través de su runtime propietario mentria-engine. El modelo combina una arquitectura híbrida (18 capas DeltaNet de atención lineal + 6 capas GQA de atención clásica) con una torre de visión ViT de 12 capas, lo que le permite procesar texto e imágenes sin necesidad de servidor. Incluye además un adaptador LoRA intercambiable en caliente, afinado para generar citas motivacionales.

Su relevancia radica en que es el escalón más pequeño (0.8B) de una escalera de modelos (0.8B → 2B → 4B) diseñada para funcionar en cualquier dispositivo compatible con WebGPU, incluidos teléfonos móviles. Con un peso total de carga en frío de aproximadamente 510 MB (modelo de lenguaje atado + torre de visión), ofrece una experiencia de IA generativa y multimodal completamente local, con cero dependencia de infraestructura en la nube. La cuantización emplea escalas por bloque óptimas en el sentido del error cuadrático medio (MSE), lo que según sus autores recupera parte de la pérdida de precisión frente a métodos min-max convencionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas DeltaNet (atención lineal) + 6 capas GQA (atención clásica) + MLP SwiGLU, 24 capas en total |
| Parametros totales | 0.8B (modelo base Qwen3.5-0.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K según documentación de Qwen3.5 0.8B; no confirmado en la model card de esta versión |
| Tipos de cuantizacion | Q4_0 (grupo de 32, escala F16 por bloque K, escalas óptimas MSE) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (layout específico de mentria-engine) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina atención lineal (DeltaNet) en 18 de sus 24 capas con atención clásica de consultas agrupadas (GQA) en las 6 restantes, junto con MLP SwiGLU. Esta mezcla busca equilibrar eficiencia computacional y capacidad de razonamiento de largo alcance. La versión mentria se obtiene mediante un pipeline de conversión offline que cuantiza los pesos BF16 originales a Q4_0 con escalas por bloque optimizadas por MSE, logrando una recuperación del 5.6% del error de cuantización frente a escalas min-max estándar. La torre de visión es un ViT de 12 capas con 768 dimensiones ocultas, parche de 16 y fusión espacial de 2, que proyecta a 1024 dimensiones de texto.

Además, se incluye un adaptador LoRA (rank 16, alpha 32, dropout 0.05, LR 2e-4 con decaimiento coseno, AdamW, máscara de prompt) entrenado sobre un conjunto curado de citas motivacionales en formato de chat. Los módulos objetivo abarcan todas las proyecciones del MLP y de la atención (q, k, v, o, a, b, g), lo que constituye un afinado de cobertura completa. El adaptador es intercambiable en caliente, permitiendo activar o desactivar el estilo de citas sin recargar el modelo.

## Capacidades

- Generación de texto conversacional con plantilla de chat integrada (chat_template.jinja).
- Razonamiento y comprensión de imágenes: entrada de imágenes a través de la torre de visión ViT cuantizada.
- Procesamiento multimodal image-text-to-text (pipeline declarado).
- Ejecución completamente en el navegador vía WebGPU, sin servidor ni dependencias externas.
- LoRA intercambiable en caliente para el caso de uso de citas motivacionales.
- Compatibilidad con dispositivos de bajos recursos, incluidos teléfonos móviles con WebGPU.
- Tokenizador BPE de Qwen3.5 con vocabulario de 248,320 tokens.
- No se documenta soporte explícito para tool calling, agentes o razonamiento multi-paso en esta versión.

## Casos de uso

- Chat multimodal en el navegador: la demo oficial (mentria.ai/tools/ai-chat) permite conversar con el modelo enviando texto e imágenes, todo procesado localmente. Es adecuado para usuarios que requieren privacidad total o conexiones inestables.
- Generador de citas motivacionales: mediante el LoRA incluido, el modelo produce frases inspiradoras con un estilo rígido y coherente. La demo (mentria.ai/tools/quote) lo muestra en acción, y el adaptador puede activarse o desactivarse en caliente.
- Asistente personal on-device en móviles: con ~510 MB de carga, cabe en la mayoría de teléfonos modernos y funciona sin conexión, ideal para asistentes de productividad o recordatorios con entrada de voz (si se combina con un STT externo).
- Prototipado rápido de aplicaciones de IA sin backend: desarrolladores pueden integrar mentria-engine en sus proyectos web para añadir capacidades de generación de texto y visión sin aprovisionar servidores ni gestionar APIs.
- Entornos con requisitos estrictos de privacidad: al ejecutarse íntegramente en el cliente, no se transmiten datos a terceros, lo que lo hace apto para sectores como salud, educación o finanzas donde la confidencialidad es crítica.
- Demostraciones educativas y talleres de IA: su bajo peso y facilidad de despliegue (solo un navegador) permiten mostrar conceptos de modelos multimodales, cuantización y atención híbrida en aulas o conferencias sin infraestructura adicional.
- Accesibilidad en dispositivos de gama baja: al ser el escalón más pequeño de la escalera mentria, garantiza que cualquier dispositivo con WebGPU pueda ejecutar una IA multimodal, democratizando el acceso a esta tecnología.

## Benchmarks y rendimiento

La model card proporciona resultados de una suite de 129 tareas (24 VQA, 20 de razonamiento, 5 de subtitulado y 80 POPE-adversarial) comparando el modelo BF16 base con esta versión Q4 (escalas MSE). La decodificación se realizó con greedy y 128 tokens.

| Metrica | BF16 base | Q4 (escalas MSE) |
|---|---|---|
| Exactitud VQA | 0.792 | 0.792 |
| Exactitud razonamiento | 0.60 | 0.65 |
| Exactitud POPE-adversarial | 0.850 | 0.825 |
| F1 de subtitulado (léxico) | 0.666 | 0.693 |

Acuerdo de grado con el modelo base: 0.895. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Carga en frío: ~510 MB (modelo de lenguaje atado + torre de visión) o ~450 MB (solo modelo de lenguaje atado). Posteriormente se cachea en IndexedDB, haciendo las visitas siguientes instantáneas.
- GPU: cualquier GPU compatible con WebGPU, incluidas GPUs integradas de portátiles y GPUs móviles. No requiere GPU dedicada de gama alta.
- RAM: no se especifica, pero al ser un modelo de 0.8B cuantizado, se estima que funciona con menos de 1 GB de memoria del navegador.
- Despliegue: exclusivamente mediante mentria-engine (runtime WebGPU). Los archivos safetensors tienen un layout específico y no son compatibles con otros runtimes estándar como vLLM, llama.cpp u Ollama. El modelo base Qwen3.5-0.8B sí está disponible en GGUF para Ollama y llama.cpp, pero no esta versión cuantizada.
- Latencia y throughput: no se proporcionan datos numéricos. Al ser un modelo pequeño y ejecutarse en GPU vía WebGPU, se espera una latencia de decodificación de decenas de tokens por segundo en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (BF16) | 0.8B | 262K | BF16 | Apache 2.0 | Safetensors | Modelo base original, mayor precisión pero mayor peso (~1.6 GB) |
| Qwen3.5-0.8B-mentria (tied) | 0.8B | 262K (según base) | Q4_0 MSE | Apache 2.0 | Safetensors (mentria-engine) | Versión atada (embedding compartido), ~450 MB, específica para WebGPU |
| Qwen3.5-0.8B-mentria (untied) | 0.8B | 262K (según base) | Q4_0 MSE | Apache 2.0 | Safetensors (mentria-engine) | Versión sin atar, ~602 MB, mantenida por compatibilidad |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., SmolVLM, Phi-3.5-vision) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés. Aunque el modelo base Qwen3.5 podría soportar más idiomas, esta versión no lo garantiza.
- Degradación por cuantización: la exactitud POPE-adversarial desciende de 0.850 a 0.825 frente al BF16, lo que indica una ligera pérdida en tareas de alucinación visual. Otras métricas mejoran o se mantienen, pero el acuerdo global con el base es de 0.895.
- Dependencia de WebGPU: no todos los navegadores o dispositivos soportan WebGPU (especialmente versiones antiguas de Safari o navegadores sin actualizar). En esos casos el modelo no puede ejecutarse.
- Formato propietario: los pesos safetensors están diseñados exclusivamente para mentria-engine. No son compatibles con herramientas estándar como llama.cpp, vLLM u Ollama, lo que limita su portabilidad.
- LoRA de citas: el adaptador está optimizado para un estilo de plantilla rígido. Según los autores, en escalas pequeñas la diversidad del dataset degrada la coherencia, por lo que se mantiene el adaptador original en lugar del dataset más diverso usado en los modelos de 2B y 4B.
- Sin soporte documentado para tool calling o agentes: aunque el modelo base podría tener estas capacidades, no se mencionan en la documentación de esta versión, por lo que no se recomienda su uso en pipelines de agentes complejos.
- Riesgo de alucinación: como todo modelo pequeño, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento o hechos específicos. Se recomienda validación humana en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mentriaai/Qwen3.5-0.8B-mentria
- Demo de chat multimodal: https://mentria.ai/tools/ai-chat/
- Demo de generador de citas: https://mentria.ai/tools/quote/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de citas motivacionales: https://huggingface.co/datasets/mentriaai/motivational-quotes
- Versión ONNX del modelo con LoRA: https://huggingface.co/mentriaai/Qwen3.5-0.8B-quotes-ONNX
- Guía de Qwen3.5 0.8B (externa): https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Página de Ollama para Qwen3.5 0.8B: https://ollama.com/library/qwen3.5:0.8b
- Guía completa de la familia Qwen 3.5: https://qwen-ai.com/qwen-3-5/
