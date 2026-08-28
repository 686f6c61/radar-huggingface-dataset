# mradermacher/Phi-4-Mini-Instruct-Obliterated-zero-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Phi-4-Mini-Instruct-Obliterated-zero`, publicado por el usuario mradermacher. Según la model card, se trata de "static quants" (cuantizaciones estáticas) del modelo original alojado en `ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero`. El nombre sugiere que deriva de Phi-4-mini-instruct, un modelo denso de 3.8 mil millones de parámetros desarrollado por Microsoft, pero no se proporciona documentación adicional sobre el proceso de obliteración (abliteration) ni sobre las características específicas de esta variante.

El modelo está pensado para su uso con motores de inferencia que soportan GGUF, como llama.cpp, Ollama o LM Studio. Al ser una cuantización, su principal ventaja es la reducción de requisitos de memoria frente al modelo original en precisión completa. Sin embargo, la ausencia de información sobre licencia, idiomas, arquitectura y rendimiento limita su evaluación directa. La fecha de creación (agosto de 2026) y el número de descargas (0) indican que es un lanzamiento reciente y sin adopción conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere derivado de Phi-4-mini-instruct, transformer denso) |
| Parametros totales | no disponible (el modelo base Phi-4-mini-instruct tiene 3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Phi-4-mini-instruct soporta 128K tokens) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de este modelo concreto. El nombre indica que es una variante "obliterated" (abliterated) de Phi-4-mini-instruct, lo que sugiere que se ha eliminado o modificado el entrenamiento de rechazo de instrucciones dañinas. El modelo base Phi-4-mini-instruct es un transformer denso con atención por grupos (grouped-query attention), vocabulario de 200K tokens y embeddings compartidos, entrenado con un contexto de 128K tokens. Sin embargo, no se confirma si esta variante mantiene esas características. Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: se espera que herede las capacidades de Phi-4-mini-instruct, incluyendo razonamiento, matemáticas y soporte multilingüe, aunque no hay confirmación.
- Function calling: el modelo base Phi-4-mini-instruct soporta function calling, pero no se verifica en esta variante.
- Cuantización GGUF: permite ejecución en CPU y GPU con bajo consumo de memoria.
- Sin capacidades multimodales: no se menciona visión ni audio.

## Casos de uso

- Inferencia local en equipos sin GPU potente: gracias a las cuantizaciones GGUF (desde Q2_K hasta F16), el modelo puede ejecutarse en portátiles o mini-PCs con 4-8 GB de RAM, usando llama.cpp u Ollama.
- Prototipado rápido de chatbots: al ser un modelo pequeño (3.8B), es adecuado para pruebas de concepto en entornos de desarrollo sin infraestructura dedicada.
- Experimentación con modelos "abliterated": útil para investigadores que estudian el impacto de eliminar las barreras de seguridad en modelos de lenguaje, aunque requiere precaución ética.
- Generación de código en entornos con restricciones de hardware: si conserva las capacidades de código de Phi-4-mini, puede usarse para autocompletado o generación de scripts en máquinas modestas.
- Educación y aprendizaje: sirve como ejemplo práctico de cuantización y despliegue de modelos GGUF en cursos de ingeniería de IA.
- Integración en aplicaciones de escritorio: mediante motores como LM Studio, se puede incorporar a herramientas de productividad sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas para esta variante específica. El modelo base Phi-4-mini-instruct de Microsoft reporta mejoras frente a Phi-3.5-Mini en razonamiento, matemáticas y multilingüismo, pero no se puede extrapolar a esta cuantización sin verificación.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para Q4_K_M (tamaño aproximado 2.5-3 GB), cabe en GPUs con 4 GB de VRAM. Para F16 (unos 7.6 GB), se necesita al menos 8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 6GB o superior), o GPUs integradas con suficiente RAM compartida.
- CPU: puede ejecutarse en CPU con 8-16 GB de RAM usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponible. En una RTX 4090, un modelo de 3.8B cuantizado a Q4 puede generar entre 50-100 tokens/s, pero es una estimación genérica sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-4-Mini-Instruct-Obliterated-zero (este) | no disponible (base 3.8B) | no disponible (base 128K) | no disponible | GGUF | Variante abliterada, sin documentación |
| Phi-4-mini-instruct (Microsoft) | 3.8B | 128K | MIT | safetensors | Modelo original, con function calling y multilingüe |
| Phi-4-mini-instruct-abliterated-i1 (mradermacher) | 3.8B | 128K (presumible) | no disponible | GGUF | Otra variante abliterada del mismo autor, con más descargas |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre este modelo y el original es la eliminación de las restricciones de seguridad, lo que puede afectar a la calidad de las respuestas en dominios sensibles.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante abliterada, es probable que genere contenido inapropiado, ofensivo o peligroso sin filtros. No apto para uso en producción sin supervisión humana.
- Riesgo de alucinación: no hay datos específicos, pero los modelos pequeños tienden a alucinar en tareas complejas.
- Limitaciones de contexto: no se confirma si mantiene los 128K tokens del modelo base; la cuantización puede degradar la calidad en contextos largos.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin verificación legal.
- Falta de documentación: no hay model card detallada, benchmarks ni información de entrenamiento, lo que dificulta evaluar su fiabilidad.
- Riesgo de seguridad: al eliminar las salvaguardas, el modelo puede generar instrucciones peligrosas, malware o contenido ilegal. No debe desplegarse en entornos públicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Phi-4-Mini-Instruct-Obliterated-zero-GGUF
- Modelo base (ArRENCEAI): https://huggingface.co/ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero
- Modelo original Phi-4-mini-instruct (Microsoft): https://ai.azure.com/catalog/models/Phi-4-mini-instruct
- Variante similar (mradermacher/Phi-4-mini-instruct-abliterated-i1-GGUF): https://huggingface.co/mradermacher/Phi-4-mini-instruct-abliterated-i1-GGUF
- Otra variante abliterada en Ollama: https://ollama.com/huihui_ai/phi4-mini-abliterated
