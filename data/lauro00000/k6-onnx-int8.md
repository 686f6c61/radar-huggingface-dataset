# Lauro00000/k6-onnx-int8

## Resumen

k6-onnx-int8 es una exportación a formato ONNX con cuantización int8 del modelo de síntesis de voz kyutai/pocket-tts, desarrollado originalmente por Kyutai Labs. El artefacto lo publica el usuario Lauro00000 como compilación interna ("internal build artifact") y no cuenta con soporte ni garantía de estabilidad por parte del autor. El modelo base es un TTS (text-to-speech) de Kyutai, y esta versión incluye seis paquetes lingüísticos del modelo original (alemán, inglés, francés, italiano, español y portugués) más seis paquetes adicionales de 24 capas añadidos el 12 de noviembre de 2026.

La relevancia de esta ficha reside en que ofrece una vía práctica para desplegar un TTS multilingüe en infraestructura ONNX con pesos cuantizados a int8, lo que reduce el tamaño y acelera la inferencia en CPU y GPUs de consumo. El repositorio ocupa 5,2 GB y no se ha publicado información sobre arquitectura interna, número de parámetros, contexto ni datos de entrenamiento más allá de lo que indica la model card.

No se trata de un modelo nuevo entrenado desde cero: la model card es explícita al afirmar que "nothing was retrained" (nada fue reentrenado). Los únicos cambios son la conversión a ONNX mediante la herramienta lookbe/pocket-tts-onnx-export y la cuantización dinámica int8 por canal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base TTS de Kyutai; la model card no detalla la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica por canal |
| Idiomas soportados | alemán, inglés, francés, italiano, español, portugués (seis paquetes lingüísticos) |
| Licencia | CC BY 4.0 (heredada de kyutai/pocket-tts, © Kyutai Labs) |
| Formato de pesos | ONNX (archivos `.onnx`; incluye `flow_lm_main_lean_int8.onnx` en los paquetes de 24 capas) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de identificar los componentes exportados: `flow_lm_main` y variantes `flow_lm_main_lean_int8.onnx`. El nombre sugiere un modelo de flujo (flow matching) para la generación de audio, habitual en TTS modernos, pero no se confirma en la información disponible. Los paquetes se organizan por idioma y por configuración de capas: seis paquetes de 24 capas (`<language>_ql_2026-11`) y seis paquetes originales (`<language>_2026-10` / `english_2026-09`).

El proceso de creación consistió en convertir los pesos originales de `kyutai/pocket-tts` (revisión `3e82814a68665eec246ff649b14c71331f955c06`, rutas `languages/<language>/model.safetensors`) a ONNX con el exportador `lookbe/pocket-tts-onnx-export` en la revisión `2b25e5a`, usando la opción `--legacy_kv_cache`, y aplicar cuantización int8 dinámica por canal. Los paquetes de 24 capas provienen de las variantes `languages/english_2026-09_24l`, `german_24l`, `french_24l`, `spanish_24l`, `italian_24l` y `portuguese_24l` de pocket-tts 4.0.1. No hubo reentrenamiento ni ajuste fino; los chequeos de paridad del exportador pasaron según el autor.

## Capacidades

- Síntesis de voz (text-to-speech) en seis idiomas: alemán, inglés, francés, italiano, español y portugués.
- Generación de audio a partir de texto con pesos cuantizados a int8 para inferencia eficiente.
- Ejecución mediante runtime ONNX, lo que permite despliegue en CPU y GPU sin depender de frameworks de deep learning completos.
- Dos configuraciones de profundidad por idioma: paquetes estándar y paquetes de 24 capas, lo que permite elegir entre calidad y coste computacional.
- Inclusión de un grafo reconstruido manualmente (`flow_lm_main_lean_int8.onnx`) en los paquetes de 24 capas, con los mismos pesos cuantizados.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada, razonamiento multi-paso ni modos de pensamiento; es un modelo exclusivamente TTS.

## Casos de uso

- **Locución automatizada multilingüe para vídeo y pódcast**: el modelo permite generar narraciones en seis idiomas con un único pipeline ONNX, lo que simplifica la producción de contenido localizado sin mantener seis modelos separados.
- **Lectura de artículos y accesibilidad**: integración en lectores de pantalla o aplicaciones de accesibilidad para convertir texto en voz en español, inglés, francés, alemán, italiano y portugués, aprovechando la inferencia int8 para ejecución en dispositivos modestos.
- **Asistentes de voz en aplicaciones móviles o de escritorio**: al estar en ONNX, puede embeberse en aplicaciones nativas con runtime ONNX y evitar dependencias pesadas de PyTorch, reduciendo el tamaño del binario distribuido.
- **Sistemas de anuncios y avisos dinámicos**: generación de avisos hablados en transporte público, aeropuertos o comercios, donde la latencia y el coste por petición importan y la cuantización int8 reduce el coste de cómputo.
- **Prototipado de interfaces conversacionales**: uso como capa TTS en pipelines de voz (ASR + LLM + TTS) durante fases de prototipo, con la ventaja de que el formato ONNX facilita el despliegue en entornos sin GPU dedicada.
- **Generación de audiolibros y contenido educativo**: síntesis de material formativo en varios idiomas con paquetes de 24 capas cuando se prioriza la calidad de la voz sobre el rendimiento.
- **Investigación en cuantización de modelos de audio**: el repositorio sirve como referencia para estudiar el impacto de la cuantización int8 dinámica por canal en un TTS, ya que incluye tanto los paquetes cuantizados como un grafo reconstruido manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de voz (MOS, WER de transcripción, similitud de hablante) ni comparativas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El repositorio completo ocupa 5,2 GB, pero corresponde a doce paquetes lingüísticos; un único paquete pesa una fracción de ese total y, al estar cuantizado a int8, la huella en memoria es aproximadamente un cuarto de la de los pesos en fp32.
- **GPU recomendadas**: no disponibles en la información proporcionada. Al ser ONNX int8, es compatible con cualquier GPU soportada por ONNX Runtime (CUDA, TensorRT) y con ejecución en CPU.
- **GPU de consumo**: la cuantización int8 y el formato ONNX hacen plausible la ejecución en GPU de consumo (por ejemplo, RTX 3060 o superiores) y en CPU, aunque no se confirman requisitos mínimos ni cifras de latencia.
- **Opciones de despliegue**: ONNX Runtime (CPU y GPU), con posibles optimizaciones mediante TensorRT o OpenVINO, aunque no se documentan en la model card. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| k6-onnx-int8 | TTS (export ONNX int8 de pocket-tts) | 6 | ONNX int8 | CC BY 4.0 | Hugging Face (0 descargas) |
| kyutai/pocket-tts | TTS (modelo base original) | 6 | safetensors | CC BY 4.0 | Hugging Face (Kyutai Labs) |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos comparables con datos verificables de parámetros, contexto o rendimiento. La comparación más directa es con el modelo base kyutai/pocket-tts, del que este repositorio es una conversión sin reentrenamiento.

## Limitaciones y advertencias

- **Artefacto interno sin soporte**: la model card lo califica explícitamente como "internal build artifact: no support, no stability promise, files may move". No es recomendable como dependencia de producción sin validación propia.
- **Sin datos de arquitectura ni parámetros**: no se puede evaluar el coste computacional ni la calidad esperada a partir de la información publicada.
- **Riesgo de alucinación y artefactos de audio**: no se documentan evaluaciones de calidad de voz ni de fidelidad al texto de entrada; un TTS puede producir prosodia incorrecta, omisiones o artefactos, especialmente tras cuantización int8.
- **Cobertura lingüística limitada**: solo seis idiomas; no hay soporte documentado para otras lenguas ni para code-switching.
- **Licencia CC BY 4.0**: permite uso comercial con atribución a Kyutai Labs, pero obliga a creditar a los autores originales y a indicar los cambios realizados (conversión ONNX y cuantización).
- **Sin garantías de paridad**: aunque el autor afirma que los chequeos de paridad del exportador pasaron, no se publican métricas que cuantifiquen la degradación introducida por la cuantización int8.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso comunitario ni de validación externa.
- **Fechas de creación y actualización futuras** (2026): conviene verificar la vigencia y la integridad de los archivos antes de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lauro00000/k6-onnx-int8
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Exportador ONNX: https://github.com/lookbe/pocket-tts-onnx-export
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
