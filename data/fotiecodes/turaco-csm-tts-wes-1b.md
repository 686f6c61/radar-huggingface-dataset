# fotiecodes/turaco-csm-tts-wes-1b

## Resumen

Turaco CSM TTS wes 1B es un ajuste fino de viabilidad del modelo Sesame CSM orientado a la síntesis de voz (text-to-speech) en pidgin camerunés, identificado con el código de idioma `wes`. Lo desarrolla el usuario fotiecodes y parte del checkpoint `unsloth/csm-1b`, que a su vez deriva de `sesame/csm-1b`. El objetivo del experimento es comprobar si un ajuste fino ligero con LoRA sobre un corpus pequeño de un único hablante puede mejorar la adaptación del modelo a un idioma de bajos recursos sin degradar el resto del sistema.

El modelo es un ajuste fino de 60 pasos de optimizador entrenado en una Tesla T4 gratuita de Google Colab, con un total de 1.632.100.161 parámetros en el checkpoint fusionado en FP16. La relevancia actual reside en que documenta de forma transparente una prueba de concepto reproducible para lenguas africanas de bajos recursos, publicando las curvas de pérdida, la configuración exacta y los ejemplos de audio antes y después del ajuste.

No obstante, conviene subrayar que se trata de un experimento de investigación con un alcance muy limitado: un solo hablante, 400 grabaciones de entrenamiento y 1,2 épocas efectivas. El autor advierte explícitamente de que no se han medido la calidad perceptual, la tasa de error de palabra ni la generalización a hablantes no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sesame CSM (backbone transformer + decodificador de profundidad + codec de audio) |
| Parametros totales | 1.632.100.161 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP16) |
| Idiomas soportados | pidgin camerunes (`wes`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CSM (Conversational Speech Model) de Sesame, que combina un backbone transformer de aproximadamente 1B de parámetros con un decodificador de profundidad y un codec de audio. El nombre "1B" hace referencia únicamente al backbone; el modelo de voz completo incluye esos componentes adicionales. El ajuste se realizó con LoRA de rango 32 y alpha 32 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con dropout 0 y sin bias, reportando 29.032.448 parámetros entrenables. Posteriormente los adaptadores se fusionaron en el checkpoint completo para su publicación.

Los datos provienen del corpus Common Voice 27.0 (2026-09-11) para pidgin camerunés, con 9.018 grabaciones validadas de 16 hablantes anonimizados. El experimento selecciona un único hablante con 998 grabaciones (unos 59,4 minutos) y aplica filtros de calidad: MP3 existente, al menos dos votos positivos, cero negativos, texto no vacío y duración entre 0,5 y 10 segundos. Los splits personalizados contienen 897 grabaciones de entrenamiento, 50 de validación y 51 de test, aunque el piloto solo usa las primeras 400 de entrenamiento y 32 de validación. El audio se decodifica a mono y se remuestrea a 24 kHz; el texto se rellena a longitud 256 y el audio a 240.001 muestras. El entrenamiento usó precisión FP16, AdamW de 8 bits, learning rate 0,0002, schedule lineal con 5 pasos de warmup, batch 2 con acumulación 4, semilla 3407 y gradient checkpointing de Unsloth, completando 60 pasos en 228,34 segundos.

## Capacidades

- Síntesis de voz (text-to-speech) en pidgin camerunés para un único hablante conocido.
- Generación de audio a 24 kHz en formato WAV a partir de texto escrito en ortografía pidgin.
- Pares texto-audio mediante la plantilla de chat de CSM con rol `"0"`.
- Adaptación de un modelo multilingüe base a una lengua de bajos recursos mediante LoRA.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento extendido.
- El soporte multilingüe se limita al idioma `wes`; no hay evidencia de retención de otros idiomas tras el ajuste.

## Casos de uso

- Prueba de concepto para lenguas de bajos recursos: sirve como plantilla reproducible para investigadores que quieran evaluar si un ajuste LoRA de pocos pasos sobre CSM mejora la adaptación a un idioma africano con pocos datos, usando el corpus Common Voice como fuente.
- Generación de voz para un hablante concreto en prototipos de accesibilidad: permite crear locuciones en pidgin camerunés para aplicaciones de lectura en voz alta dirigidas a ese hablante, siempre que se acepte la falta de métricas perceptuales.
- Investigación en TTS de bajo coste: el entrenamiento completo cabe en una Tesla T4 gratuita de Colab en menos de cuatro minutos, lo que lo hace adecuado para experimentación académica con recursos limitados.
- Evaluación comparativa de currículos de ajuste: los ejemplos antes/después y las curvas de pérdida permiten estudiar el efecto de LoRA de rango 32 sobre un backbone de 1B en un régimen de 1,2 épocas.
- Docencia y divulgación: el repositorio incluye curvas, configuración y verificación de exportación, lo que lo convierte en material didáctico para explicar ajuste fino de modelos de voz.
- Base para futuros ajustes multi-hablante: al partir de un checkpoint fusionado y documentado, puede servir como punto de partida para experimentos con más hablantes o más épocas, aunque esto aún no se ha validado.

## Benchmarks y rendimiento

El autor no declara resultados en el `model-index` (lista vacía). Las únicas métricas publicadas son pérdidas de validación y entrenamiento, que no son benchmarks estándar de TTS:

| Metrica | Resultado |
|---|---|
| Pérdida de validación base | 6,102216 |
| Pérdida de validación tras ajuste | 5,130048 |
| Reducción relativa de pérdida de validación | 15,93 % |
| Pérdida media de entrenamiento | 5,271788 |
| Pasos de optimizador | 60 |
| Duración del entrenamiento | 228,34 s |
| Épocas efectivas | 1,2 |
| Grabaciones de entrenamiento / validación | 400 / 32 |
| Grabaciones de test reservadas | 51 |

No hay resultados de MOS, WER, CER, similitud de hablante, intervalos de confianza ni estudios con semillas repetidas. Las 51 grabaciones de test no se puntuaron.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: el checkpoint fusionado ocupa 3,3 GB en el repositorio, por lo que se necesita al menos esa cantidad más el overhead del codec y del decodificador de profundidad; una estimación conservadora ronda los 6-8 GB en FP16.
- GPU recomendadas: Tesla T4 (usada en el entrenamiento), RTX 4090, A100 o H100 para inferencia cómoda; el entrenamiento se completó en una T4 gratuita de Colab.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB o superiores en FP16; no se han publicado pruebas con cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de audio estas herramientas no son directamente aplicables.
- Latencia y throughput: no disponibles; el autor solo reporta el tiempo de entrenamiento (228,34 s para 60 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turaco CSM TTS wes 1B | 1.632.100.161 | no disponible | `wes` | apache-2.0 | Hugging Face |
| sesame/csm-1b | ~1B (backbone) | no disponible | multilingüe (no detallado) | no disponible en la información | Hugging Face |
| unsloth/csm-1b | ~1B (backbone) | no disponible | multilingüe (no detallado) | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de un solo hablante: no se ha evaluado la generalización a hablantes no vistos; los splits comparten el mismo hablante.
- Corpus muy pequeño: 400 grabaciones de entrenamiento y 1,2 épocas efectivas, insuficiente para conclusions robustas sobre calidad.
- Sin métricas perceptuales: no hay MOS, WER, CER ni similitud de hablante; el autor no afirma que las salidas suenen naturales ni que pronuncien correctamente el pidgin.
- Las 51 grabaciones de test no se puntuaron, por lo que no hay evaluación held-out completa.
- Riesgo de alucinación y artefactos de audio no medido; los ejemplos antes/después se ofrecen solo para revisión humana.
- El corpus Common Voice declara CC0, pero el repositorio no redistribuye el audio original.
- Licencia apache-2.0 permite uso comercial, pero la falta de evaluación de calidad desaconseja su uso en producción sin validación adicional.
- El soporte de idioma se limita a `wes`; no hay evidencia de retención de otros idiomas del modelo base.
- No se documentan cuantizaciones ni herramientas de despliegue optimizadas, lo que limita su uso en entornos de baja latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fotiecodes/turaco-csm-tts-wes-1b
- Modelo base unsloth: https://huggingface.co/unsloth/csm-1b
- Modelo original Sesame: https://huggingface.co/sesame/csm-1b
- Corpus Common Voice: https://commonvoice.mozilla.org/
