# CorVous/Qwen3.8-27B-heretic-ara-GGUF

## Resumen

Qwen3.8-27B heretic ARA es una versión "abliterada" del modelo Qwen/Qwen3.8-27B, desarrollada por CorVous mediante la técnica **Arbitrary-Rank Ablation (ARA)** del proyecto heretic (PR 211). A diferencia de la ablación direccional clásica, ARA realiza una optimización matricial por módulo bajo hooks, lo que permite reducir drásticamente los rechazos del modelo ante instrucciones sensibles sin degradar significativamente la calidad general. El resultado es un modelo de 27 000 millones de parámetros con ventana de contexto de 262 144 tokens, capacidades de visión y soporte de razonamiento con niveles configurables.

La relevancia de este modelo radica en que ofrece una alternativa de código abierto (licencia Apache 2.0) para casos de uso que requieren respuestas sin filtros excesivos, manteniendo un rendimiento competitivo en tareas de razonamiento y matemáticas. El autor reporta una tasa de rechazo de 4/100 en pruebas de adversidad (frente a 92/100 del modelo base y 65/100 de la versión direccional), con una divergencia KL de 0,0454 respecto al original. Está disponible en formato GGUF para su uso directo con llama.cpp y proyectos compatibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (transformer decoder-only, con módulo de visión) |
| Parametros totales | 26 895 998 464 (~26,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_K_M (16,5 GB), Q8_0 (28,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector de visión mmproj-f16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con arquitectura qwen35 que incorpora un codificador de visión para entrada multimodal. El proceso de ablación se realizó con el branch de heretic "Arbitrary-Rank Ablation" (PR 211), que optimiza cada módulo de atención y MLP mediante una búsqueda de rango bajo bajo hooks, en lugar de aplicar una simple resta direccional de vectores de negatividad. La búsqueda de hiperparámetros se ejecutó con Optuna durante aproximadamente 85 trials en una GPU H100 de 80 GB, seleccionando el trial con mejor equilibrio entre reducción de rechazos y fidelidad al modelo original (KL 0,0454).

El entrenamiento de ablación no utiliza datos adicionales ni RLHF/DPO; se basa únicamente en la modificación de pesos existentes. Los tensores MTP (Multi-Token Prediction) se eliminan en la exportación, por lo que no es posible usar decodificación especulativa con la cabeza MTP. El proyector de visión no se ve afectado por la ablación, conservando la capacidad multimodal del modelo base.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de modos de pensamiento (`enable_thinking`) y niveles de esfuerzo de razonamiento (`reasoning_effort`): `xhigh` (por defecto), `medium` y `low`.
- Entrada multimodal: procesamiento de imágenes mediante el proyector de visión incluido en el repositorio (`mmproj-f16.gguf`).
- Matemáticas y lógica: resultados de GSM8K del 92,0 % en la exportación GPTQ Int4, superando ligeramente al modelo base cuantizado (90,5 %).
- Reducción de rechazos: 4/100 en pruebas de adversidad, frente a 92/100 del modelo base y 65/100 de la versión direccional de heretic v1.
- Ventana de contexto larga de 262 144 tokens, adecuada para tareas que requieren procesar documentos extensos o conversaciones multi-turno.
- Compatibilidad con el ecosistema llama.cpp (llama-server, llama-cli) y formatos GGUF estándar.

## Casos de uso

- Asistente conversacional sin restricciones excesivas: el modelo responde a consultas sobre temas sensibles o políticamente incorrectos sin rechazarlas sistemáticamente, útil para aplicaciones de rol, escritura creativa o simulación de personajes.
- Análisis de documentos largos: con 262 144 tokens de contexto, puede resumir informes extensos, contratos o artículos científicos en una sola pasada, manteniendo coherencia en toda la entrada.
- Razonamiento matemático y resolución de problemas: su rendimiento en GSM8K (92 %) lo hace adecuado para tutoría automática, generación de ejercicios o verificación de soluciones paso a paso.
- Chat multimodal con imágenes: gracias al proyector de visión, puede describir imágenes, extraer texto de capturas o responder preguntas sobre contenido visual, por ejemplo en aplicaciones de accesibilidad.
- Generación de código con razonamiento: aunque no se reportan benchmarks de HumanEval, el modelo base Qwen3.8-27B tiene capacidades de programación; la versión abliterada mantiene esas habilidades sin el filtro de rechazo ante instrucciones de código ofensivo o exploits.
- Prototipado de agentes con contexto largo: la ventana extendida permite mantener historiales de conversación extensos y memoria de trabajo, adecuado para asistentes de investigación o herramientas de análisis de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las comprobaciones de calidad se realizaron sobre la exportación GPTQ Int4 de los mismos pesos ARA, no sobre los archivos GGUF. Los datos reportados son:

| Prueba | Resultado |
|---|---|
| GSM8K (subconjunto) | 92,0 % (base cuantizado: 90,5 %) |
| Probes de calidad | 5/5 correctas |
| Sobre-rechazo en prompts benignos-edgy | 0/5 |
| Visión | correcta |

Estos valores deben tomarse como referencia orientativa, ya que la cuantización GGUF puede introducir variaciones adicionales.

## Requisitos de hardware

- **Q4_K_M (16,5 GB)**: cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) y permite inferencia local con llama.cpp.
- **Q8_0 (28,6 GB)**: requiere GPUs con al menos 32 GB de VRAM (A100 40 GB, RTX A6000, H100) o despliegue en CPU con suficiente RAM.
- **Proyector de visión (0,93 GB)**: adicional a la VRAM del modelo principal.
- **Contexto largo**: se recomienda usar `-c 32768` en llama-server para evitar agotar la memoria; el contexto máximo de 262 144 tokens puede requerir más de 48 GB de VRAM incluso con Q4_K_M.
- **Opciones de despliegue**: llama.cpp (llama-server, llama-cli), Ollama (si se importa el GGUF), y cualquier backend compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con APIs estilo OpenAI mediante servidores como llama.cpp server o vLLM (aunque vLLM no soporta GGUF nativamente).
- **Latencia**: no disponible; depende del hardware y la configuración de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rechazo en pruebas adversas | GSM8K |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9 B | 262 144 | Apache 2.0 | 92/100 | 90,5 % (cuantizado) |
| Qwen3.8-27B heretic ARA (este) | 26,9 B | 262 144 | Apache 2.0 | 4/100 | 92,0 % (GPTQ Int4) |
| Qwen3.8-27B heretic v1 (direccional) | 26,9 B | 262 144 | Apache 2.0 | 65/100 | no disponible |

La comparación se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos abliterados de tamaño similar. La ventaja principal del ARA es la reducción drástica de rechazos manteniendo la calidad y el rendimiento en matemáticas.

## Limitaciones y advertencias

- Los tensores MTP se eliminan en la exportación, por lo que no es posible usar decodificación especulativa con la cabeza MTP; el rendimiento en generación puede ser inferior al del modelo base si se dependía de esa técnica.
- Se ha observado un caso de repetición inducida por prompt en generaciones largas (1 de 9 muestras largas). El autor indica que es independiente de la deriva en ese rango de KL, pero debe tenerse en cuenta en aplicaciones de texto extenso.
- Las métricas de calidad (GSM8K, probes) se obtuvieron con la versión GPTQ Int4, no con los archivos GGUF; la cuantización Q4_K_M puede degradar ligeramente el rendimiento.
- La ablación reduce los rechazos, pero no elimina el riesgo de alucinaciones ni garantiza respuestas factualmente correctas en todos los dominios.
- No se dispone de información sobre los idiomas soportados ni sobre sesgos específicos del modelo base; se recomienda auditar el comportamiento en el idioma de despliegue.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.8-27B tiene sus propias condiciones; se debe verificar el cumplimiento de los términos del modelo original.

## Enlaces

- Repositorio HuggingFace: [CorVous/Qwen3.8-27B-heretic-ara-GGUF](https://huggingface.co/CorVous/Qwen3.8-27B-heretic-ara-GGUF)
- Exportación BF16 original: [CorVous/Qwen3.8-27B-heretic-ara-BF16](https://huggingface.co/CorVous/Qwen3.8-27B-heretic-ara-BF16) (referenciado en la model card)
- Exportación GPTQ Int4: [CorVous/Qwen3.8-27B-heretic-ara-GPTQ-Int4-gs128](https://huggingface.co/CorVous/Qwen3.8-27B-heretic-ara-GPTQ-Int4-gs128) (referenciado en la model card)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
