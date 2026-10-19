# KubaJRM/SmolLM2-FT-MyDataset

## Resumen
SmolLM2-FT-MyDataset es un ajuste fino de HuggingFaceTB/SmolLM2-135M publicado por KubaJRM. El repositorio contiene 134.515.008 parámetros y ocupa 0,5 GB, con pesos en safetensors y pipeline de text-generation. Se entrenó mediante SFT con TRL y lleva etiquetas que lo vinculan al curso smol-course (module_1); la model card no detalla el dataset utilizado.

El modelo se orienta a la experimentación con modelos de lenguaje pequeños: permite probar flujos de ajuste supervisado, inferencia local y despliegues ligeros sin necesidad de hardware grande. Su tamaño de 135M lo sitúa en la categoría de modelos para prototipos, educación y pruebas de integración, no para cargas de producción exigentes.

La información publicada es mínima: no hay licencia identificada, idiomas declarados, longitud de contexto, benchmarks ni datos de entrenamiento. Tampoco hay descargas ni likes en el momento de la consulta, por lo que no existe validación comunitaria. Cualquier uso en producción requeriría evaluación propia y verificación legal de la licencia.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; etiqueta "llama" en el repositorio; clase exacta no disponible |
| Parámetros totales | 134.515.008 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No se incluyen variantes cuantizadas; solo safetensors. La cuantización no está documentada |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card incluye "licence: license" sin términos identificables |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 134.515.008 parámetros, ajustado a partir de HuggingFaceTB/SmolLM2-135M. La model card indica entrenamiento mediante SFT con TRL 1.16.0, Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2. No se documenta el número de tokens, la composición del dataset "MyDataset" ni si hubo etapas de RLHF o DPO. Tampoco se describen innovaciones técnicas como atención lineal o decodificación especulativa.

La etiqueta "conversational" y el ejemplo de uso con una lista de mensajes con rol "user" indican un formato conversacional, pero no se especifica la plantilla de chat exacta. No hay información sobre la estrategia de empaquetado de secuencias, el régimen de entrenamiento ni evaluaciones intermedias.

## Capacidades
- Generación de texto autoregresiva y conversacional: el ejemplo de la model card usa `pipeline("text-generation")` con mensajes y `max_new_tokens=128`.
- Ajuste supervisado sobre un modelo base pequeño: útil como ejemplo de flujo SFT con TRL.
- Integración con el ecosistema Transformers y con el tag `text-generation-inference` / `endpoints_compatible`.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, planificación multi-paso ni razonamiento extendido.
- No hay evidencia de capacidades multilingües; los idiomas no están declarados.
- No hay capacidades de visión, audio ni modos especiales de "thinking".
- No hay benchmarks publicados de razonamiento, código o matemáticas.

## Casos de uso
- Prototipos de chatbot conversacional en local: el modelo cabe en CPU o en una GPU modesta y permite validar diálogos de pocos turnos; es adecuado para demos, no para atención al cliente real sin evaluación previa.
- Laboratorio de ajuste supervisado con TRL: sirve para reproducir un flujo SFT completo, desde la preparación del dataset hasta el entrenamiento y la inferencia, con un coste computacional bajo.
- Pruebas de integración de pipelines Transformers y TGI: los tags `text-generation-inference` y `endpoints_compatible` permiten validar despliegues y comprobar el comportamiento del endpoint con un modelo pequeño.
- Generación de texto breve y autocompletado de bajo coste: puede emplearse en entornos con poca VRAM para producir respuestas cortas, borradores o continuaciones de texto con supervisión humana.
- Base para fine-tuning de dominio: al tener 135M de parámetros, permite iterar rápido con datasets pequeños y comparar configuraciones antes de escalar a modelos mayores.
- Evaluación de cuantización y rendimiento: útil para medir el impacto de FP32, FP16, int8 o 4-bit en un modelo pequeño; no se incluyen pesos GGUF, pero se puede convertir el modelo.
- Generación de borradores en herramientas educativas: puede producir textos de apoyo o ejemplos en un entorno controlado, siempre con revisión posterior y sin tratarlo como fuente de verdad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones humanas ni comparaciones con otros modelos.

## Requisitos de hardware
- Pesos del modelo: aproximadamente 538 MB en FP32, 269 MB en FP16/BF16, 135 MB en int8 y 67 MB en 4-bit, calculados a partir de 134.515.008 parámetros y sin incluir overhead de runtime ni caché KV.
- VRAM estimada para inferencia: menos de 1 GB para los pesos en FP16; en la práctica, entre 1 y 2 GB con runtime, tokenizador y caché. La memoria de la caché KV no se puede calcular porque la longitud de contexto no está documentada.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM, como RTX 3050, RTX 4060 o GTX 1650. A100 o H100 no son necesarias por el tamaño del modelo.
- CPU: viable para inferencia de respuestas cortas; no hay mediciones de latencia.
- Opciones de despliegue: `transformers` con pipeline, TGI por los tags del repositorio y despliegues compatibles con endpoints. vLLM no está documentado. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se incluye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos verificados de contexto, licencia o benchmarks de las alternativas en la información proporcionada; la comparación se limita a tamaño y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KubaJRM/SmolLM2-FT-MyDataset | 134.515.008 | no disponible | no disponible | Hugging Face; 0 descargas y 0 likes en la consulta | Fine-tune SFT de SmolLM2-135M |
| HuggingFaceTB/SmolLM2-135M | 135M según el nombre; dato no verificado en la información | no disponible | no disponible | Hugging Face | Modelo base preentrenado |
| SmolLM2-135M-Instruct | 135M según el nombre; no verificado en la información | no disponible | no disponible | Hugging Face | Variante instruct de la misma familia; no incluida en la información |
| Qwen2.5-0.5B | 0,5B según el nombre; no verificado en la información | no disponible | no disponible | Hugging Face | Alternativa de tamaño similar; no incluida en la información |

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si permite uso comercial, redistribución o modificación.
- Ausencia de benchmarks y evaluaciones: la calidad real del ajuste es desconocida.
- Modelo de 135M: capacidad limitada para razonamiento complejo, matemáticas, código y conversaciones largas.
- Longitud de contexto no documentada: no es adecuado para documentos extensos sin verificación previa.
- Idiomas no declarados: no se debe asumir soporte multilingüe.
- Datos de entrenamiento no documentados: sesgos, contaminación y comportamiento fuera de distribución son desconocidos.
- Riesgo de alucinación y respuestas incoherentes: requiere supervisión humana y filtros adicionales.
- Sin tool calling ni agentes documentados: no se debe asumir integración con herramientas o planificación multi-paso.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni casos de uso reportados.
- No hay pesos GGUF ni cuantizaciones publicadas: llama.cpp u Ollama requieren conversión y validación propias.
- Model card mínima: no hay información sobre alineamiento, seguridad o evaluación de sesgos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/KubaJRM/SmolLM2-FT-MyDataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio de TRL: https://github.com/huggingface/trl
- Curso smol-course, referenciado por el tag `smol-course`: https://github.com/huggingface/smol-course
