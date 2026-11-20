# mradermacher/Alphi-v1-GGUF

## Resumen

Alphi-v1 es un modelo de lenguaje conversacional desarrollado por RyzovaTech, distribuido originalmente en formato transformers y cuantizado a GGUF por mradermacher. Con 4.628.569.635 parámetros (aproximadamente 4,6 mil millones), se posiciona en el segmento de modelos compactos aptos para despliegue local. La model card lo etiqueta con descriptores como "local-first", "matrix-memory" y "growing-brain", y lo asocia a la familia "gemma4", lo que sugiere una arquitectura derivada o inspirada en la familia Gemma.

El modelo está diseñado para uso conversacional y soporta únicamente inglés (en) y sinhala (si), una combinación poco habitual que lo hace relevante para aplicaciones dirigidas al mercado de Sri Lanka. La cuantización GGUF realizada por mradermacher incluye un espectro amplio de tipos (desde Q2_K hasta f16) y suplementos multimodales mmproj, lo que indica capacidades de visión en el modelo base.

La relevancia actual de esta ficha radica en que permite evaluar rápidamente un modelo pequeño, multilingüe (en/si) y con supuestas capacidades de memoria matricial, disponible en formatos optimizados para inferencia local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "gemma4" en los tags; probablemente transformer derivado de Gemma) |
| Parametros totales | 4.628.569.635 (~4,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés), si (sinhala) |
| Licencia | ryzova-alphi-v1-mixed-components (licencia "other", con enlace a LICENSING.md) |
| Formato de pesos | safetensors (original), GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Los tags del modelo incluyen "gemma4", lo que apunta a una base arquitectónica de la familia Gemma, presumiblemente un transformer decoder-only. Los descriptores "matrix-memory" y "growing-brain" sugieren innovaciones propietarias en la gestión de memoria o en mecanismos de expansión del modelo, pero no se especifica su funcionamiento técnico.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. El modelo incluye suplementos multimodales (mmproj), lo que implica que el modelo base tiene capacidad de procesamiento visual, aunque no se detalla el codificador visual empleado.

## Capacidades

- Generación de texto conversacional en inglés y sinhala.
- Procesamiento multimodal: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imágenes en el modelo base.
- Memoria matricial ("matrix-memory") y crecimiento ("growing-brain") según los tags del autor, sin documentación técnica adicional.
- Orientación "local-first": diseñado para ejecución en hardware local.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional en inglés y sinhala: el modelo puede gestionar diálogos multi-turno en ambos idiomas, siendo adecuado para aplicaciones de atención al cliente dirigidas al mercado de Sri Lanka donde se requiere alternancia entre inglés y sinhala.
- Despliegue local en estaciones de trabajo: con cuantizaciones de ~3,1-3,5 GB (Q2_K a Q4_K_M), puede ejecutarse en equipos sin GPU dedicada de gama alta, ideal para prototipos y demos offline.
- Procesamiento de documentos con imágenes: gracias a los suplementos mmproj, puede emplearse en tareas de descripción de imágenes o extracción de información visual en entornos con recursos limitados.
- Investigación en modelos multilingües de bajo recurso: su soporte de sinhala lo convierte en un objeto de estudio útil para evaluar el rendimiento de modelos pequeños en lenguas con pocos recursos.
- Aplicaciones de privacidad estricta: al poder ejecutarse íntegramente en local (formato GGUF con llama.cpp u Ollama), permite procesar datos sensibles sin enviarlos a servicios en la nube.
- Chatbots embebidos en dispositivos: su tamaño compacto (4,6 B parámetros) y las cuantizaciones de baja precisión permiten integrarlo en dispositivos con memoria limitada para asistentes conversacionales básicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,1 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~3,2-3,4 GB
  - Q4_K_S / Q4_K_M: ~3,5 GB
  - Q5_K_S / Q5_K_M: ~3,7 GB
  - Q6_K: ~3,9 GB
  - Q8_0: ~5,0 GB
  - f16: ~9,4 GB
  - Suplementos mmproj: 0,7 GB (Q8_0) o 1,1 GB (f16), adicionales si se usa visión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 (12 GB) o superior puede alojar cualquier cuantización, incluida f16. Una RTX 4060 Ti (8 GB) cubre hasta Q8_0 con margen.
- Cabe en GPU de consumo: sí, desde GPUs con 4-6 GB de VRAM para cuantizaciones bajas (Q2_K a Q4_K_M) hasta 8-12 GB para Q8_0 y f16.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El formato original safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Alphi-v1 (este) | ~4,6 B | no disponible | en, si | ryzova-alphi-v1-mixed-components | safetensors, GGUF |
| Gemma 2 2B | ~2,6 B | 8K | multilingüe | Gemma license | safetensors, GGUF |
| Qwen2.5 3B | ~3,1 B | 32K | multilingüe | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini | ~3,8 B | 128K | multilingüe | MIT | safetensors, GGUF |

La comparación se ofrece a título orientativo por rango de tamaño; no se dispone de datos de rendimiento comparativo para Alphi-v1. Alphi-v1 se distingue por su soporte específico de sinhala y sus capacidades multimodales declaradas, pero carece de información pública sobre contexto, benchmarks y licencia clara para uso comercial.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y sinhala; no se declara soporte de castellano ni de otras lenguas.
- Licencia restrictiva e incierta: la licencia "ryzova-alphi-v1-mixed-components" con enlace a LICENSING.md implica componentes con condiciones posiblemente distintas; es imprescindible revisar dicho documento antes de cualquier uso comercial.
- Falta de transparencia: no se documentan arquitectura exacta, datos de entrenamiento, contexto máximo ni procesos de alineación, lo que dificulta evaluar riesgos de sesgo y alucinación.
- Riesgo de alucinación: inherente a modelos de este tamaño y sin datos de evaluación públicos que lo cuantifiquen.
- Capacidades multimodales no verificadas: la presencia de mmproj sugiere visión, pero no se documenta su alcance ni calidad.
- Sin benchmarks publicados: imposible comparar su rendimiento objetivamente con alternativas.
- Modelo de nicho: comunidad y soporte reducidos (0 likes, ~1454 descargas en el momento de la consulta), lo que limita la resolución de problemas y la documentación de terceros.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Alphi-v1-GGUF
- Modelo base: https://huggingface.co/RyzovaTech/Alphi-v1
- Licencia del modelo base: https://huggingface.co/RyzovaTech/Alphi-v1/blob/main/LICENSING.md
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Alphi-v1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Alphi-v1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
