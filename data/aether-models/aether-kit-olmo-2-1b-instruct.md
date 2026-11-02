# aether-models/aether-kit-olmo-2-1b-instruct

## Resumen

AetherKit OLMo 2 1B Instruct es un bundle de pesos en formato Core AI para AetherKit, el runtime de inferencia on-device para Apple silicon desarrollado por bubstackdev. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint allenai/OLMo-2-0425-1B-Instruct (revisión `48d788eca847d4d7548f375ad03d3c9312f6139e`) a un formato propietario que AetherKit puede cargar en macOS 27 o superior sobre Apple silicon. El paquete incluye `language-model.json`, el directorio `model.aimodel/`, el tokenizer sin modificar y un `export-report.json` con la receta de conversión.

El modelo subyacente es OLMo 2 1B Instruct de Ai2, un transformer decoder-only de aproximadamente 1.000 millones de parámetros con ventana de contexto de 4.096 tokens en esta exportación. La relevancia de esta ficha es acotada: el repositorio se publica como "spike" experimental v0.0.6, con cero descargas y sin validación fuera de un único equipo M5 Max. Su interés real está en quien quiera evaluar el pipeline de exportación de AetherKit o ejecutar un modelo instructivo pequeño totalmente local en un Mac, no en quien busque un modelo de propósito general para producción.

La licencia declarada es Apache-2.0, heredada del checkpoint original, y los pesos se almacenan en float16 con aritmética de atención en float32 para evitar inversiones de empate detectadas en fp16 sobre CPU. El repositorio ocupa 3,0 GB y no incluye tooling de descarga automática: la integración se hace descargando el directorio `mac/` y pasándolo a `AetherLanguageModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2 de Ai2), empaquetado en formato Core AI de AetherKit |
| Parametros totales | Aproximadamente 1.000 millones (heredados de OLMo-2-0425-1B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (registrados); la puerta de sesión nativa extendida solo se ejercitó hasta 2.048 tokens |
| Tipos de cuantizacion | Pesos en float16; cache en float16; aritmética de atención en float32. No se documentan otros formatos (GGUF, int8, int4) |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base OLMo 2 está orientado principalmente a inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI (`model.aimodel/` dentro de un bundle AetherKit con `language-model.json`, `tokenizer/` y `export-report.json`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al OLMo 2 1B Instruct original de Allen Institute for AI: un transformer decoder-only denso con atención causal estándar y aproximadamente 1.000 millones de parámetros. Esta publicación no entrena ni afina el modelo; únicamente convierte los pesos a float16 en el formato Core AI mediante Torch 2.11.0, Core AI Torch 0.4.2 y Transformers 4.57.3, con el commit de AetherKit `867b6fe0d56ed16079cfa987cef75297dcc0acde`. El tokenizer se mantiene sin cambios respecto al checkpoint de origen.

La innovación técnica relevante no está en el modelo sino en el pipeline de exportación y verificación: se registran hashes SHA-256 del modelo (modelo: `6e3aca1b961acf4f206db3684bd13e77f6f7043de2ab02b805b821d13f8d70ab`), se comparan 32 de 32 filas de argmax en GPU nativa contra una referencia float32 independiente del upstream (coseno mínimo 0,999999843, con coincidencia en los 64 tokens greedy de continuación) y se valida una decodificación de 1.024 tokens sin recargas del modelo. La decisión de mantener atención en float32 responde a una inversión de empate en atención fp16 sobre CPU reproducida durante el desarrollo; no se aporta benchmark pareado de precisión frente a rendimiento. Los detalles de datos de entrenamiento, composición del corpus, RLHF o DPO pertenecen a la model card de allenai/OLMo-2-0425-1B-Instruct y no se reproducen en esta publicación.

## Capacidades

- Generación de texto instructiva en inglés, heredada del ajuste instructivo de OLMo 2 1B.
- Conversación multi-turno mediante `AetherLanguageSession`, con soporte de chat registrado y streaming.
- Muestreo con semilla (seeded sampling) y secuencias de parada (stop sequences).
- Recuperación tras cancelación de peticiones, validada en las pruebas del bundle.
- Adaptador para FoundationModels de Apple, según las comprobaciones de cualificación.
- Tokenizer con casos de chat verificados.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación del pipeline de exportación de AetherKit: descargar `mac/**`, cargar el bundle con `AetherLanguageModel` y comparar las salidas contra la referencia float32 del upstream para validar la conversión en un entorno propio.
- Prototipado de asistentes locales en macOS: integrar el bundle en una app Swift que use `AetherLanguageSession.respond(to:)` para respuestas conversacionales sin conexión, aprovechando el formato nativo de Core AI.
- Pruebas de integración con FoundationModels: usar el adaptador incluido para verificar que una app basada en los frameworks de Apple puede alternar entre el modelo del sistema y este bundle.
- Desarrollo de funciones de resumen y reescritura de textos cortos en local: con 4.096 tokens de contexto, es adecuado para documentos breves o hilos de conversación acotados, sin coste de API.
- Validación de infraestructura de inferencia on-device: servir como caso de prueba reproducible (hashes, revisión fijada, informe de exportación) para comparar latencia y corrección entre versiones de AetherKit o de Core AI Torch.
- Investigación sobre precisión numérica: reproducir el caso de inversión de empate en atención fp16 sobre CPU y evaluar el impacto de la aritmética float32 en la estabilidad de las salidas.
- Entornos educativos y demos offline: ejecutar un modelo instructivo de 1B en un Mac sin depender de servicios externos, con la advertencia de que solo está cualificado en un M5 Max.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de cualificación interna: coincidencia de 32/32 filas de argmax en GPU nativa frente a referencia float32, coseno mínimo de 0,999999843, coincidencia de los 64 tokens greedy de continuación y decodificación de 1.024 tokens sin recargas. No se aportan cifras de latencia, throughput ni comparación de rendimiento entre precisiones.

## Requisitos de hardware

- Plataforma obligatoria: macOS 27 o superior sobre Apple silicon. No hay soporte documentado para iOS, Linux, Windows ni GPU NVIDIA.
- VRAM/unified memory estimada: el repositorio ocupa 3,0 GB; con pesos y cache en float16, se puede estimar un consumo en torno a 2-3 GB de memoria unificada, aunque no se publica una cifra oficial.
- GPU recomendadas: Apple silicon; la única configuración cualificada es un M5 Max. Otros chips (M1, M2, M3, M4 y variantes Pro/Max/Ultra) no están cualificados.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que cabe en la memoria unificada de un Mac moderno, pero no aplica a GPU dedicadas de consumo (RTX 4090, etc.) porque el runtime es exclusivo de Apple.
- Opciones de despliegue: exclusivamente AetherKit (`AetherLanguageModel` y `AetherLanguageSession`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card declara explícitamente que no se reclama ningún benchmark pareado de precisión y rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AetherKit OLMo 2 1B Instruct | ~1B | 4.096 tokens | Core AI / AetherKit (macOS 27+, Apple silicon) | Apache-2.0 | Repositorio HuggingFace, 0 descargas, spike experimental |
| allenai/OLMo-2-0425-1B-Instruct | ~1B | No disponible en esta información | Safetensors / Transformers | Apache-2.0 | Modelo base público en HuggingFace |
| Alternativas de ~1B para on-device (p. ej. Llama 3.2 1B Instruct, Qwen2.5 1.5B Instruct) | ~1-1,5B | No disponible en esta información | GGUF, MLX, Core ML según comunidad | Licencias variables | No verificado en esta búsqueda |

La comparación directa con otros modelos de tamaño similar no puede completarse con datos verificados en la información proporcionada; las alternativas citadas se incluyen solo como referencia de categoría y sus especificaciones no se han contrastado aquí.

## Limitaciones y advertencias

- Estado experimental: se publica como "spike" v0.0.6, con cero descargas y cero likes; no debe tratarse como un artefacto estable para producción.
- Cualificación limitada: solo se validó en un M5 Max; iOS y otros dispositivos quedan sin cualificar.
- Contexto no verificado al completo: la puerta de sesión nativa solo ejercitó 2.048 tokens, aunque el contexto registrado sea de 4.096.
- Sin benchmarks de rendimiento: no hay cifras de latencia ni throughput, ni comparación pareada de precisión frente a rendimiento entre fp16 y fp32.
- Riesgo de alucinación: inherente a un modelo de 1B parámetros; no se documentan evaluaciones de fidelidad factual en esta publicación.
- Idiomas: no se declaran idiomas soportados; el modelo base OLMo 2 está orientado principalmente al inglés, por lo que el rendimiento en castellano no está garantizado.
- Sesgos: no se documentan análisis de sesgo en esta publicación; deben consultarse los de la model card de allenai/OLMo-2-0425-1B-Instruct.
- Licencia: Apache-2.0 permite uso comercial, pero el checkpoint original no incluía archivo de licencia y el bundle incorpora el texto canónico de Apache-2.0; conviene revisar `LICENSE` y `NOTICE` antes de redistribuir.
- Dependencia de un runtime propietario: el formato Core AI y AetherKit limitan la portabilidad; no hay rutas de despliegue alternativas documentadas.
- Tooling incompleto: el commit remoto de AetherKit podría no incluir aún el tooling de exportación usado localmente.
- La ruta local del checkpoint en el informe de exportación está redactada; la reproducibilidad depende de la revisión y los hashes indicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aether-models/aether-kit-olmo-2-1b-instruct
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Repositorio AetherKit: https://github.com/bubstackdev/aether-kit
- Resultados de búsqueda web: sin enlaces relevantes al modelo (los resultados corresponden a la acepción mitológica de "aether", un reproductor multimedia homónimo, un mod de Minecraft y una noticia financiera sobre 2CRSi, ninguno relacionado con este bundle).
