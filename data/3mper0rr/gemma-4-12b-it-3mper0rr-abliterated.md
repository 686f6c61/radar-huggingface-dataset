# 3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated

## Resumen

`3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated` es una modificación experimental del modelo multimodal `google/gemma-4-12B-it`, publicada por el usuario 3MPER0RR en Hugging Face. Se trata de una variante "abliterated", es decir, un ajuste de pesos orientado a eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento del modelo original, sin reentrenamiento completo. El resultado conserva la arquitectura y el pipeline `image-text-to-text` del modelo base.

El modelo cuenta con 11.959.730.176 parámetros totales según los safetensors publicados, un repositorio de 24,0 GB y licencia Apache 2.0. La modificación afecta a 48 de los 677 tensores (7,09%), distribuidos en 29 capas, sin discrepancias estructurales ni cambios de forma o tipo de dato respecto al original. Esto indica una intervención quirúrgica sobre un subconjunto reducido de pesos, presumiblemente relacionados con las direcciones de rechazo.

Su relevancia es acotada y de carácter investigador: sirve para estudiar cómo se distribuyen las conductas de rechazo en un modelo multimodal de ~12B, evaluar la robustez del alineamiento y comparar el comportamiento antes y después de la ablación. No es un modelo recomendado para despliegue en producción sin una evaluación de seguridad previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal, según tag de Hugging Face) |
| Parametros totales | 11.959.730.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo deriva directamente de `google/gemma-4-12B-it`, por lo que hereda su arquitectura transformer multimodal con pipeline `image-text-to-text`. La model card no documenta detalles de la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, tokenizador) ni del entrenamiento original; esa información debe consultarse en la ficha del modelo base de Google.

La intervención de 3MPER0RR no es un reentrenamiento ni un fine-tuning con datos, sino una modificación de pesos: según la comparación publicada, se alteraron 48 tensores de 677 (7,09%) en 29 capas, manteniendo intactos 629 tensores (92,91%). No se especifica la técnica exacta de ablación (por ejemplo, proyección ortogonal de direcciones de rechazo, edición de capas concretas o ajuste de sesgos), ni se documentan datos de calibración, número de tokens utilizados en el proceso ni si hubo evaluación posterior. La model card menciona "Trials: [200]" y estado "Tested and saved", sin más detalle metodológico.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct.
- Procesamiento de imagen y texto conjuntamente (`image-text-to-text`), según el pipeline declarado.
- Razonamiento y respuesta multi-turno, presumiblemente conservados del modelo original.
- Capacidad de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Efecto principal de la modificación: reducción esperada de las respuestas de rechazo del alineamiento original, sin garantía documentada de que el resto de capacidades se mantenga intacto.

## Casos de uso

- Investigación sobre alineamiento y seguridad: comparar las respuestas del modelo base y de la variante abliterated ante el mismo conjunto de prompts para medir qué fracción del comportamiento de rechazo depende de los tensores modificados.
- Análisis de interpretabilidad: estudiar los 48 tensores alterados en 29 capas para localizar representaciones asociadas a negativas de seguridad en un modelo multimodal de ~12B.
- Evaluación de robustez de salvaguardas: usar el modelo como caso de prueba en pipelines de red teaming que verifiquen si los filtros externos siguen siendo necesarios cuando se elimina el rechazo interno.
- Experimentos académicos de edición de pesos: reproducir la metodología de ablación sobre otros modelos de la familia Gemma y comparar la tasa de tensores modificados (7,09%) con la de otras técnicas.
- Pruebas de regresión de capacidades: ejecutar benchmarks de razonamiento, visión y código sobre el modelo modificado para cuantificar la degradación respecto al base.
- Docencia y divulgación: ilustrar en un entorno controlado qué es la abliteración y cómo se documenta una modificación de pesos con una tabla de comparación de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye la comparación de pesos (677 tensores, 48 modificados, 29 capas afectadas, 0 discrepancias estructurales) y no reporta métricas de MMLU, HumanEval, GSM8K, MMMU ni de tasa de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (bf16/fp16): aproximadamente 24 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 28-32 GB o más según longitud de contexto.
- Cuantización a 8 bits: ~12 GB de pesos; a 4 bits: ~6-7 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para precisión completa; RTX 4090 (24 GB) para bf16 ajustado o cuantización 8 bits.
- GPU de consumo: posible en RTX 3090/4090 con cuantización; en GPUs de 8-12 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: transformers (formato nativo del repo), text-generation-inference (tag declarado), vLLM y llama.cpp/Ollama si se generan conversiones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated` | 11,96B | no disponible | Apache 2.0 | Variante abliterated experimental; 7,09% de tensores modificados |
| `google/gemma-4-12B-it` (base) | ~12B | no disponible | Apache 2.0 (según la ficha) | Modelo original alineado, referencia de comparación |
| Otras variantes abliterated de la familia Gemma | no disponible | no disponible | habitualmente Apache 2.0 | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información disponible.

## Limitaciones y advertencias

- Modelo experimental sin evaluación de seguridad publicada: la ablación busca reducir los rechazos, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto.
- No hay benchmarks que confirmen que las capacidades del modelo base (razonamiento, visión, código) se conservan tras modificar 48 tensores.
- Riesgo de alucinación: no cuantificado; se desconoce si la edición de pesos afecta a la calibración del modelo.
- Idiomas soportados y longitud de contexto no documentados en la ficha.
- La licencia Apache 2.0 se declara en el repo, pero conviene verificar los términos del modelo base de Google antes de uso comercial, dado que el modelo derivado modifica pesos del original.
- La model card incluye un aviso de investigación; no se documenta la metodología exacta de ablación, lo que dificulta la reproducibilidad.
- Uso en producción no recomendado sin filtros de seguridad externos y una evaluación propia de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia del repo: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated/blob/main/LICENSE
- Aviso de investigación: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated/blob/main/DISCLAIMER.md
