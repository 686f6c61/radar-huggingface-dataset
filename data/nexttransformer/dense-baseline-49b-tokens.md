# NextTransformer/Dense-Baseline-49B-Tokens

## Resumen

NextTransformer Dense Baseline es un modelo de lenguaje causal de tipo transformer denso desarrollado por NextTransformer (organización Interactive-Active-AI), concebido como punto de referencia (*baseline*) para una comparación de arquitecturas realizada sobre un presupuesto de entrenamiento fijo de 49.152 millones de tokens. A diferencia de los modelos orientados a producto, su propósito es servir de control experimental: emplea atención causal completa en todas las capas, sin mecanismos híbridos ni eficiencias de atención, de modo que cualquier mejora observada en variantes posteriores pueda atribuirse a cambios arquitectónicos y no a diferencias de cómputo o datos.

El modelo tiene 1.355.810.568 parámetros (1,36 mil millones) y una longitud de contexto de 2.048 tokens, muy reducida para los estándares actuales. Fue preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones. El sufijo "49B" del repositorio hace referencia a los tokens de entrenamiento, no al número de parámetros, un detalle que conviene tener presente para evitar confusiones.

Su relevancia es fundamentalmente metodológica: publica sus métricas finales de validación (BPB de 0,6672 y CORE-22 de 33,10) junto con el registro de ejecución y la configuración de arquitectura, lo que permite reproducir el experimento y comparar de forma rigurosa contra las variantes del proyecto NextTransformer. No está pensado para uso en producción ni para tareas de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con atención completa en todas las capas |
| Parametros totales | 1.355.810.568 (1,36 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se documentan pesos safetensors en precisión original) |
| Idiomas soportados | No disponible (tokenizer tipo tiktoken; no se declara cobertura lingüística) |
| Licencia | No disponible |
| Formato de pesos | safetensors (model.safetensors); configuración en model_config.json; tokenizer en tokenizer.tiktoken.json |

## Arquitectura y entrenamiento

Se trata de un transformer causal denso con atención completa (*full causal attention*) en cada capa, sin atención lineal, sin mezcla de expertos y sin capas recurrentes o híbridas. El checkpoint corresponde a la ejecución final del baseline dentro de la comparación de arquitecturas NextTransformer, entrenada durante 46.875 actualizaciones sobre el dataset ClimbMix hasta completar 49.152 millones de tokens. La implementación de referencia vive en el repositorio de GitHub del proyecto (Interactive-Active-AI/NextTransformer) y requiere instalar el paquete `nexttransformer` desde un commit concreto para cargar los pesos con `strict=True`.

El tokenizer es de tipo tiktoken y se distribuye serializado en JSON (con `pat_str`, `mergeable_ranks` en base64 y tokens especiales como `<|bos|>`). No se documenta en la información disponible el uso de RLHF, DPO u otras fases de ajuste posteriores al preentrenamiento, ni la composición detallada del dataset ClimbMix más allá de su nombre. Tampoco se especifican innovaciones técnicas adicionales: el valor del modelo reside precisamente en su carácter convencional y en la trazabilidad del experimento (configuración de arquitectura y registro de ejecución publicados).

## Capacidades

- Generación de texto autoregresiva básica: continuación de prompt y predicción del siguiente token.
- Modelado de lenguaje causal para investigación y evaluación de arquitecturas.
- Razonamiento y conocimiento de dominio general en la medida en que lo permita un modelo de 1,36 mil millones de parámetros entrenado con 49B tokens (CORE-22 de 33,10 sobre 100).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe explícita ni lista de idiomas.
- No dispone de modo *thinking*, visión, audio ni otras modalidades.
- No se documenta ajuste por instrucciones (*instruction tuning*) ni formato de chat.

## Casos de uso

- Reproducción de experimentos de arquitectura: cargar el checkpoint con la implementación fijada a un commit y verificar las métricas publicadas (BPB 0,6672, CORE-22 33,10) como control en comparaciones de atención densa frente a variantes eficientes.
- Investigación sobre escalado y presupuesto de tokens: usar el modelo como referencia de 1,36B parámetros y 49B tokens para estudiar curvas de pérdida y eficiencia de cómputo en entornos académicos con recursos limitados.
- Evaluación de tokenizers: al distribuirse el tokenizer en formato tiktoken serializado, sirve para analizar segmentación y comparar tasas de compresión de texto frente a otros esquemas.
- Pruebas de infraestructura de inferencia: con 1,36B parámetros y pesos en safetensors de ~4,1 GB en el repositorio, es adecuado para validar pipelines de carga, *sharding* y ejecución en CPU/GPU antes de escalar a modelos mayores.
- Generación de texto de dominio general en prototipos: continuación de texto y experimentos de *prompting* sin instrucciones, asumiendo la ventana de 2.048 tokens como límite estricto.
- Docencia y formación: ejemplo completo y reproducible de un transformer causal denso con configuración, tokenizer y registro de entrenamiento publicados, útil para explicar el ciclo completo de preentrenamiento.
- *Benchmarking* interno de hardware: medir latencia y throughput de un modelo de 1,36B en distintas GPU para calibrar estimaciones de despliegue de modelos mayores.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0,6672 |
| CORE-22 (×100) | 33,10 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con otros modelos. Las dos métricas anteriores son las únicas reportadas por el autor y corresponden al checkpoint final tras 46.875 actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp32/bf16 según configuración): aproximadamente 5,4 GB en fp32 (1,36B × 4 bytes) y unos 2,7 GB en bf16/fp16, más overhead de activaciones y KV cache; el repositorio ocupa 4,1 GB.
- La ventana de contexto de 2.048 tokens mantiene el KV cache pequeño, por lo que la memoria dominante es la de los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); A100/H100 sobredimensionadas para este tamaño, útiles solo para experimentos por lotes.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16 y en la mayoría con 6 GB si se reduce precisión.
- Opciones de despliegue: la vía documentada es la implementación `nexttransformer` (PyTorch) con `safetensors`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no hay ruta estándar de cuantización lista para usar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NextTransformer Dense Baseline | 1,36B | 2.048 | No disponible | Hugging Face + GitHub | Baseline de investigación; BPB 0,6672, CORE-22 33,10 |
| Alternativas de ~1,3B tipo GPT-Neo/Pythia/SmolLM | ~1,0-1,5B | 2.048-8.192 | Varía (MIT/Apache en varios) | Hugging Face | No se dispone de comparación numérica publicada en la información |
| Variantes NextTransformer (atención eficiente) | No disponible | No disponible | No disponible | Repositorio del proyecto | Objeto de la comparación; resultados no incluidos aquí |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa queda limitada a las métricas del propio baseline.

## Limitaciones y advertencias

- Contexto muy corto (2.048 tokens): inadecuado para documentos largos, conversaciones extensas o tareas de recuperación con contexto amplio.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato de chat; requiere *prompting* de continuación.
- Riesgo elevado de alucinación y de afirmaciones incorrectas, propio de un modelo de 1,36B parámetros entrenado con 49B tokens.
- Sesgos desconocidos: no se documenta composición del dataset ClimbMix, filtrado ni evaluaciones de sesgo.
- Idiomas soportados no declarados; el rendimiento fuera del inglés es incierto.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de una implementación concreta (`nexttransformer` fijada a un commit) y de un tokenizer tiktoken serializado; la carga con `strict=True` exige coincidencia exacta de la configuración.
- Sin soporte documentado de tool calling, agentes ni cuantización GGUF, lo que limita su integración en stacks estándar de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/Dense-Baseline-49B-Tokens
- Repositorio del proyecto: https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura (dense_full.json): https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/methods/dense_full.json
- Registro de ejecución (dense_full.json): https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/runs/dense_full.json
