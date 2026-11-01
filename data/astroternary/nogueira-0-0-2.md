# AstroTernary/Nogueira-0.0.2

## Resumen

Nogueira 0.0.2 es un modelo de lenguaje de investigación desarrollado por AstroTernary dentro del proyecto de código abierto "cansei-de-esperar". Se trata de un decoder estilo Llama de apenas 25,2 millones de parámetros, entrenado desde cero con pesos ternarios {-1, 0, +1} según el esquema BitNet b1.58, lo que lo convierte en un caso práctico de cuantización extrema aplicada durante todo el entrenamiento y no como paso posterior. Está especializado en portugués y orientado a conversación y uso de herramientas.

El modelo resuelve un problema concreto: explorar hasta qué punto una red minúscula con pesos ternarios puede mantener capacidades básicas de diálogo, corrección factual y llamada a herramientas (function calling) en una GPU de consumo. Su relevancia actual radica en que demuestra que el entrenamiento ternario desde el primer paso es viable con recursos muy limitados (una única T4 en Kaggle durante unas 4 horas) y produce artefactos de 6,3 MB en 2 bits.

El contexto máximo es de 512 tokens, el vocabulario BPE es de 4096 tokens y el modelo se distribuye bajo licencia MIT. Es un modelo de nicho, pensado para investigación sobre arquitecturas ternarias, no para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama con pesos ternarios BitNet b1.58, FFN ReLU², RMSNorm, RoPE, QK-norm, Canon layers, zero-init de proyecciones y embedding amarrado |
| Parametros totales | 25,2 M (6,3 MB en 2 bits) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Ternaria nativa {-1, 0, +1} int8 con escala por matriz (W = q × scale); pesos latentes FP32 disponibles para continuar entrenamiento |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (chat_ternary.safetensors, base_ternary.safetensors, *_latent_fp32.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de tipo Llama con d_model 512, 8 capas, 8 cabezas de atención, FFN con activación ReLU², RMSNorm, RoPE, QK-norm, inicialización a cero de las proyecciones y embedding amarrado. Incorpora Canon layers (Allen-Zhu 2025), una técnica que añade capas de normalización canónica para estabilizar el entrenamiento. Los pesos son ternarios en todo el pipeline mediante Straight-Through Estimator (STE), con una escala por matriz que reconstruye el valor real como W = q × scale.

El entrenamiento se realizó en una única GPU T4 en Kaggle, en fp16 con pesos ternarios vía STE. Se procesaron 520 millones de tokens: Wikipedia en portugués limpia (sin listas, categorías ni esbozos), y en el último 30% del preentrenamiento un 20% de los lotes corresponden a conversación. La fase de conversación combina el dataset ultra-alpaca-ptbr (MIT) filtrado (eliminando frases como "soy un modelo de OpenAI", "Claro!" o elogios a la pregunta) con datos sintéticos verificables: cuentas con la herramienta `calcular`, verificación de afirmaciones (50% correctas, 50% incorrectas), respuestas de "no sé" e identidad. El SFT final usó 5 millones de tokens exclusivamente de conversación, con optimizadores Muon + AdamW y schedule WSD, a unas 37k tokens/s durante aproximadamente 4 horas.

## Capacidades

- Generación de texto en portugués con formato de conversación multi-turno (etiquetas `<|user|>`, `<|assistant|>`, `<|eot|>`).
- Llamada a herramientas (tool calling) mediante el formato `<|tool_call|>` con JSON y recepción de resultados vía `<|tool_result|>`; la herramienta de calculadora `calcular` funciona con un 100% de acierto en la llamada y en la respuesta según los tests del autor.
- Verificación de afirmaciones del usuario: corrige al usuario cuando se equivoca (97% en los tests) y responde "no sé" ante preguntas imposibles (90% en preguntas nuevas).
- Copia exacta de contexto: capacidad demostrada con una loss que baja de 12 a 3,7 en la segunda copia.
- Identidad definida: se presenta como Nogueira y no como ChatGPT.
- No dispone de visión, audio, modo thinking ni capacidades multilingües más allá del portugués.

## Casos de uso

- Investigación sobre cuantización ternaria: sirve como banco de pruebas reproducible para estudiar BitNet b1.58 desde el primer paso, con pesos latentes FP32 incluidos para continuar el entrenamiento y comparar dinámicas de convergencia.
- Demostración educativa de tool calling en modelos minúsculos: el formato `<|tool_call|>` y el 100% de acierto en la calculadora permiten ilustrar pipelines de function calling con un coste computacional mínimo.
- Prototipado de asistentes en portugués con requisitos de huella extrema: con 6,3 MB en 2 bits, puede desplegarse en entornos embebidos o dispositivos con memoria muy limitada para pruebas de concepto de diálogo.
- Evaluación de robustez ante corrección de errores: su comportamiento de verificación de afirmaciones (97% de corrección cuando el usuario se equivoca) lo hace útil para estudiar cómo modelos pequeños gestionan la detección de errores del interlocutor.
- Estudio de alucinación y abstención: la métrica de "no sé" en preguntas imposibles (90-100%) permite analizar estrategias de abstención en modelos de muy baja capacidad.
- Benchmarking de eficiencia de entrenamiento: el registro de 520M tokens en 4 horas a 37k tokens/s en una T4 sirve como referencia para comparar recetas de entrenamiento ternario con STE, Muon y Canon layers.

## Benchmarks y rendimiento

Resultados medidos por programa y publicados por el autor en la model card:

| Test | chat | base |
|---|---|---|
| bpb en prosa limpia (Wikipedia-PT) | 1,349 | 1,273 |
| Pares mínimos: gramática / hechos | 95% / 85% | 100% / 90% |
| Herramienta: llamada correcta / respuesta correcta | 100% / 100% | 97% / 97% |
| Corrige al usuario cuando está equivocado | 97% | 97% |
| Acepta cuando el usuario está en lo cierto | 3% (fallo) | 0% (fallo) |
| "No sé" ante preguntas imposibles (nuevas) | 90% | 100% |
| Copia exacta del contexto | Sí (loss 12 → 3,7 en la segunda copia) | Sí |
| Relaciones de múltiples saltos (nombres nuevos) | 8% (≈ azar) | 11% |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; los pesos ternarios ocupan 6,3 MB y los latentes FP32 son del orden de decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó en una NVIDIA T4 de Kaggle.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en CPU, dado el tamaño de 25,2 M de parámetros.
- Opciones de despliegue: no hay soporte estándar en vLLM, llama.cpp, Ollama o TGI documentado; la carga requiere el `bench/model.py` del repositorio con la configuración `GPT(vocab=4099, d=512, layers=8, heads=8, T=512, lin="int8dw", qknorm=True, canon=True, zero_proj=True)` y la desternarización `q × scale / mean(|q|)` descrita en `scripts/verify_export.py`.
- Latencia y throughput: no disponible para inferencia; en entrenamiento se alcanzaron ~37k tokens/s en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Cuantización |
|---|---|---|---|---|---|
| Nogueira 0.0.2 | 25,2 M | 512 | pt | MIT | Ternaria nativa b1.58 |
| BitNet b1.58 (Microsoft, referencia) | 700 M a 3,9 B | 2048 (en la variante publicada) | en (principalmente) | MIT (código) | Ternaria nativa b1.58 |
| TinyLlama 1.1B | 1,1 B | 2048 | en (multilingüe limitado) | Apache 2.0 | FP16, GGUF, etc. |

No se dispone de datos de benchmarks comparativos directos entre Nogueira 0.0.2 y estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia. Las alternativas ternarias de tamaño similar en portugués no están disponibles en la información consultada.

## Limitaciones y advertencias

- Sesgo de contradicción ("do contra"): el modelo discrega casi siempre, incluso cuando el usuario tiene razón; solo acierta el 3% de las veces al aceptar una afirmación correcta. El autor indica que se corrigió en los datos de la versión 0.0.3.
- Recusación excesiva: ante saludos casuales como "Oi, tudo bem?" responde "No tengo como saber eso", por falta de ejemplos de conversación informal en el SFT.
- Repetición de elementos en listas y errores en conocimiento factual (por ejemplo, fotosíntesis).
- Incapacidad para resolver relaciones de múltiples saltos: 8% de acierto, prácticamente nivel de azar.
- Contexto muy limitado (512 tokens), insuficiente para documentos largos o conversaciones extensas.
- Monolingüe en portugués; no soporta castellano ni otros idiomas.
- Riesgo de alucinación en conocimiento del mundo, aunque con mecanismos de abstención parcialmente efectivos (90% de "no sé" en preguntas imposibles nuevas).
- Licencia MIT: permite uso comercial, pero el modelo es de investigación y su calidad no es apta para producción generalista.
- Requiere código propio para la carga y desternarización; no hay integración estándar con frameworks de inferencia populares.

## Enlaces

- HuggingFace: https://huggingface.co/AstroTernary/Nogueira-0.0.2
- Repositorio del proyecto: https://github.com/riknog/cansei-de-esperar
- Dataset Wikipedia-PT: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset ultra-alpaca-ptbr: https://huggingface.co/datasets/recogna-nlp/ultra-alpaca-ptbr
