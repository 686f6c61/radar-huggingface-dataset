# reaperdoesntknow/Discovery

## Resumen

Discovery es un modelo de lenguaje causal de 70 millones de parámetros desarrollado por Convergent Intelligence (usuario reaperdoesntknow) bajo el nombre de DiscoverLM-70M-Base. Su principal aportación es la introducción de la arquitectura Mixture-of-Attentions (MoA), que sustituye la atención por producto punto de los transformers clásicos por una atención basada en distancias métricas aprendidas, con la garantía de que se respeta la desigualdad triangular de forma explícita mediante un regularizador durante el entrenamiento. Esto dota a la atención de un significado geométrico real, en lugar de una forma bilineal sin interpretación espacial.

El modelo está entrenado sobre tres conjuntos de datos públicos (razonamiento multi-paso, matemáticas e instrucciones generales) y se publica bajo licencia Creative Commons, lo que facilita su uso y modificación. Aunque su tamaño es reducido, su arquitectura innovadora lo convierte en un banco de pruebas relevante para investigar alternativas a la atención estándar, especialmente en contextos donde la eficiencia y la interpretabilidad geométrica son prioritarias. Su lanzamiento en 2026 (según la metadata) lo sitúa como una propuesta experimental dentro del ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Attentions (MoA) con 4 bloques, atención métrica Mahalanobis, BlackHoleRoPE, HyperFFN y MoA LM head |
| Parametros totales | 70.569.408 (70,57 M) |
| Parametros activos | No aplica (no es MoE; el routing top-2 es por token pero no hay expertos separados) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | cc (Creative Commons, sin especificar variante) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Discovery implementa una arquitectura completamente original denominada Mixture-of-Attentions (MoA). En lugar de calcular la atención como un producto punto Q·Kᵀ, cada cabeza (64 en total, con espacio de 8 dimensiones) utiliza una distancia de Mahalanobis aprendida con escala diagonal, un origen de bola aprendido y un radio adaptativo que permite poda esparsa de pares fuera de la bola antes del softmax. Además, se añade un regularizador que muestrea tripletas aleatorias durante el entrenamiento para imponer la desigualdad triangular en el espacio métrico aprendido.

El modelo combina cuatro rutas de atención paralelas por token: convolución local depthwise, atención métrica multi-cabeza global, mezcla de canales con compuertas y atención métrica multi-query (MQA) con 64 queries. Un router aprendido selecciona las dos rutas más relevantes por posición de token. La codificación posicional BlackHoleRoPE introduce perturbaciones de fase aprendidas a partir de una base de Fourier compacta, manteniendo las rotaciones unitarias y limitando la energía de V a un rango [0.5, 2.0]. La HyperFFN consta de tres ramas (SwiGLU, convolución causal separable y cuello de botella de bajo rango) también enrutadas por token. El LM head reutiliza una mezcla de atenciones de 32 cabezas antes de proyectar a logits, con pesos atados a la incrustación de entrada.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) con la librería TRL sobre tres datasets: Opus-4.6-Reasoning-3000x-filtered (razonamiento multi-paso), UltraData-Math (resolución de problemas matemáticos) y alpaca-cleaned (seguimiento de instrucciones generales). No se especifica el número total de tokens ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés con formato de chat nativo mediante tokens especiales (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|think|>`, `<|reasoning|>`, etc.).
- Razonamiento multi-paso y resolución de problemas matemáticos, gracias al entrenamiento con datasets específicos de razonamiento y matemáticas.
- Seguimiento de instrucciones generales (fine-tuning sobre alpaca-cleaned).
- Atención con interpretabilidad geométrica: las distancias entre tokens tienen significado métrico real, lo que podría facilitar análisis de relevancia contextual.
- Arquitectura modular con enrutamiento por token, lo que permite inspeccionar qué rutas de atención se activan en cada posición.
- Compatible con el ecosistema HuggingFace Transformers mediante la clase `MoAMetricLM` y `MoAMetricConfig` (código personalizado incluido en el repositorio).

## Casos de uso

- Investigación en arquitecturas de atención alternativas: Discovery sirve como banco de pruebas para estudiar el impacto de la atención métrica y la desigualdad triangular en tareas de razonamiento y representación semántica.
- Experimentación educativa en NLP: su tamaño reducido (70 M) permite ejecutarlo en hardware modesto y analizar internamente cómo se distribuyen las distancias entre tokens.
- Prototipado de asistentes conversacionales con razonamiento explícito: los tokens `<|think|>` y `<|reasoning|>` permiten estructurar cadenas de pensamiento visibles para depuración.
- Evaluación comparativa de métricas de atención: investigadores pueden comparar la calidad de las representaciones geométricas frente a transformers clásicos del mismo tamaño.
- Generación de explicaciones matemáticas paso a paso: el entrenamiento con UltraData-Math habilita la producción de soluciones detalladas a problemas aritméticos y algebraicos básicos.
- Análisis de sesgos y alucinaciones en modelos pequeños: al ser un modelo de código abierto y tamaño contenido, es adecuado para estudios de robustez y comportamiento en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 70 M de parámetros en fp32, el modelo ocupa aproximadamente 282 MB en memoria. En cuantización fp16 o bf16, alrededor de 141 MB. Cabe en cualquier GPU con más de 512 MB de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Incluso podría ejecutarse en CPU con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con vLLM, TGI o directamente con la API de HuggingFace. También es posible exportar a ONNX o convertir a GGUF para llama.cpp/Ollama.
- Latencia: al ser un modelo pequeño, la latencia en GPU es del orden de milisegundos por token (estimación razonable para 70 M). No se proporcionan mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (modelos de ~70 M de parámetros). Existen alternativas como SmolLM-135M o TinyLlama-1.1B, pero Discovery es significativamente más pequeño y su arquitectura no es comparable directamente. No se pueden establecer comparaciones de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- Tamaño muy reducido: 70 M de parámetros limita severamente la capacidad de razonamiento complejo y la cobertura de conocimientos generales. No es adecuado para tareas de producción exigentes.
- Sesgos potenciales: al entrenarse con datasets como alpaca-cleaned y Opus-4.6, el modelo puede heredar sesgos presentes en esos corpus. No se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inconsistente, especialmente en dominios fuera de su distribución de entrenamiento.
- Limitaciones de idioma: solo entrenado en inglés; no soporta otros idiomas de forma fiable.
- Licencia Creative Commons sin especificar variante: es necesario revisar los términos exactos de la licencia (p. ej., CC-BY, CC-BY-SA, CC-BY-NC) antes de uso comercial. La etiqueta "cc" no indica restricciones concretas.
- Dependencia de código personalizado: el modelo requiere la implementación `MoAMetricLM` incluida en el repositorio; no es compatible con la carga estándar de Transformers sin ese código.
- Fechas futuras en metadata: la fecha de creación (2026-03-09) y actualización (2026-08-18) son posteriores a la fecha actual, lo que sugiere que la metadata puede ser incorrecta o que el modelo se ha subido con fechas manipuladas. Esto no afecta al funcionamiento pero debe tenerse en cuenta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la arquitectura MoA supere a los transformers estándar en tareas comunes.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/reaperdoesntknow/Discovery)
- [Colección DiscoverLM](https://huggingface.co/collections/reaperdoesntknow/discoverlm)
- [Perfil del autor (Convergent Intelligence)](https://huggingface.co/reaperdoesntknow/datasets)
- [Informe de seguridad de Protect AI](https://protectai.com/insights/models/reaperdoesntknow/Discovery/3fc7bb6d6f44bcb82d7246a6ad596aeba561b959/overview)
- [Informe de seguridad de Palo Alto Networks](https://insights-db.paloaltonetworks.com/models/reaperdoesntknow/Discovery/e4a0f0dce5558101a9c8b62abc5e670c77306f68/overview)
