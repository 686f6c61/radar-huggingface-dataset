# algoprog/hydor-suggest-49m

## Resumen

hydor-suggest-49m es un modelo de lenguaje de 48,7 millones de parámetros desarrollado por algoprog, diseñado específicamente para la predicción de la siguiente palabra (next-word prediction) en la función de autocompletado del editor Hydor. No es un modelo conversacional: su única tarea es predecir el siguiente token del texto introducido hasta el momento, que Hydor transforma en una sugerencia de una sola palabra mostrada tras el cursor.

El modelo emplea una arquitectura híbrida de estilo LFM (Liquid Foundation Model) con 10 capas de anchura 384, combinando convoluciones cortas de doble compuerta y atención con query agrupadas (GQA). Utiliza el tokenizador de Qwen3.5 (248.320 identificadores de salida), lo que permite mezclar sus distribuciones token a token con las de Qwen3.5-0.8B-Base, un modelo mayor que puede ejecutarse en paralelo cuando el equipo dispone de memoria suficiente.

Su relevancia radica en tres factores: está preentrenado en texto público de 200 idiomas (con datos de entrenamiento para 197), está pensado para ejecutarse íntegramente en el ordenador del usuario sin enviar datos a la nube, y puede personalizarse localmente con los escritos del propio usuario mediante un mecanismo de replay que evita el olvido de otros idiomas. La licencia AGPL-3.0-only condiciona su uso en productos derivados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida estilo LFM: 10 capas, anchura 384, convoluciones cortas de doble compuerta (kernel 3) y GQA (6 cabezas, 2 cabezas key/value, QK-norm, half-rotary) en patrón c,c,a,c,a,c,a,c,a,c; SwiGLU (1024); RMSNorm con sandwich norms; embedding atado de rango 128 → 384 |
| Parámetros totales | 48.766.336 (16,9 M en las capas, 31,8 M en el embedding factorizado de 248.326 ids) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256 tokens por parte (`max_ctx_tokens`); entrenado con fragmentos de 254 tokens (conversaciones de hasta 768) |
| Tipos de cuantización | No disponible (pesos publicados en float32; el README no documenta cuantizaciones oficiales) |
| Idiomas soportados | 204 variantes de idioma de FLORES-200; texto de preentrenamiento para 197 de ellos |
| Licencia | AGPL-3.0-only |
| Formato de pesos | safetensors (float32, 195 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de estilo LFM con 10 capas y anchura 384. Alterna convoluciones cortas de doble compuerta (kernel 3) con capas de atención con query agrupadas (6 cabezas de query, 2 cabezas key/value, QK-norm y half-rotary) en el patrón c,c,a,c,a,c,a,c,a,c. Emplea SwiGLU con dimensión 1024, RMSNorm con sandwich norms y un embedding atado de rango 128 proyectado a 384. El vocabulario utiliza las 248.320 filas de salida de Qwen3.5, cada una con su propio id, precedidas por 6 tokens especiales (`<unk> <bos> <eos> <agent> <user> <doc>`), de modo que el id del modelo pequeño equivale al id de Qwen más 6.

El preentrenamiento se realizó sobre texto público en 200 idiomas, con datos procedentes de FineWeb-2, FineWeb-Edu, OpenAssistant oasst2, Aya, Wikipedia y MADLAD-400. El modelo se entrenó con fragmentos de 254 tokens para documentos y conversaciones de hasta 768 tokens. El paquete incluye artefactos auxiliares: una compuerta logística (`gate.json`) que mezcla las distribuciones del modelo pequeño y de Qwen3.5-0.8B-Base mediante `(1 − λ)·P_qwen + λ·P_small`, un conmutador por idioma (`switch.json`) que decide si mezclar (104 de 204 idiomas) o usar solo Qwen3.5, un clasificador de idioma por naive Bayes sobre ids (`lid.json`, `lid.bin`) y umbrales de calibración de confianza (`calibration.json`). Para la personalización local se incluye un corpus de replay de 20.000.157 tokens (91.418 secuencias en 195 idiomas: 19,80 M de texto web y 0,20 M de chats) que se reproduce 1:1 durante el ajuste para mitigar el olvido catastrófico.

## Capacidades

- Predicción del siguiente token (next-word prediction) para autocompletado de una sola palabra tras el cursor.
- Generación de texto limitada a la continuación token a token; no es un modelo conversacional ni escribe por sí mismo.
- Mezcla token a token con Qwen3.5-0.8B-Base mediante una compuerta logística aprendida, cuando el equipo tiene memoria suficiente.
- Conmutación por idioma: mezcla con el modelo grande en 104 de los 204 idiomas y usa Qwen3.5 solo en el resto.
- Detección del idioma del contexto por naive Bayes sobre ids de token, con posterior de softmax y umbral de aceptación de 0,9 sobre al menos 8 tokens.
- Decodificación greedy restringida al conjunto de tokens compatibles con las letras ya escritas, hasta el final de la palabra, con confianza calculada como producto de las probabilidades de cada paso.
- Personalización local: continuación del entrenamiento con los escritos del usuario (con mayor peso) y replay del corpus público para preservar otros idiomas.
- Cobertura multilingüe de 204 variantes FLORES-200, con texto de preentrenamiento en 197.
- Ejecución íntegra en el ordenador del usuario; ningún dato tecleado sale del equipo.

## Casos de uso

- Autocompletado de una palabra en el editor Hydor: el modelo predice el siguiente token a partir del contexto (hasta 256 tokens) y Hydor lo convierte en la palabra gris que aparece tras el cursor, con decodificación greedy restringida a las letras ya tecleadas.
- Sugerencias en idiomas minoritarios: al estar preentrenado en 197 idiomas y mezclarse con Qwen3.5-0.8B-Base solo en los 104 idiomas donde aporta, cubre lenguas que el modelo grande maneja mal sin degradar las que ya funcionan.
- Escritura privada sin conexión: al ejecutarse localmente, encaja en flujos donde el texto no puede salir del dispositivo (documentación interna, notas personales, entornos sin red).
- Personalización por usuario: Hydor continúa entrenando una copia privada del modelo con los escritos de la persona y reproduce el corpus de replay para no perder el resto de idiomas, de modo que las sugerencias se adaptan al estilo del usuario.
- Filtrado por confianza en producción: el umbral calibrado (`calibration.json`) permite fijar la precisión de las sugerencias mostradas (30, 40 o 50 %) y decidir cuándo mostrar o silenciar la sugerencia.
- Mejora de un asistente de escritura existente: la mezcla `(1 − λ)·P_qwen + λ·P_small` con la compuerta aprendida permite añadir el modelo pequeño a un pipeline que ya usa Qwen3.5-0.8B-Base sin sustituirlo.
- Investigación sobre modelos pequeños multilingües: el paquete incluye calibración, conmutador por idioma, clasificador de idioma y corpus de replay, lo que facilita reproducir experimentos de destilación y ajuste local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en float32 de 195 MB; el repositorio completo ocupa 0,3 GB.
- Inferencia muy ligera: 48,7 M de parámetros permiten ejecución en CPU y en GPU de consumo, aunque el README no detalla requisitos mínimos de VRAM.
- El modo mezcla requiere además ejecutar Qwen3.5-0.8B-Base en 8 bits mediante llama.cpp (`ggml-org/Qwen3.5-0.8B-Base-GGUF`), lo que condiciona la memoria necesaria cuando se activa la mezcla.
- Opciones de despliegue: el modelo se integra en Hydor mediante su propia librería `hydor-suggest`; el modelo grande asociado se ejecuta con llama.cpp. No se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| hydor-suggest-49m | 48,7 M | 256 tokens | 204 (FLORES-200) | AGPL-3.0-only | safetensors float32 |
| Qwen3.5-0.8B-Base | 0,8 B (no disponible el desglose exacto) | No disponible | No disponible | No disponible | GGUF disponible vía ggml-org |
| Modelos de autocompletado de próxima palabra de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (modelos de próxima palabra de menos de 100 M) no está disponible en la información proporcionada. El único contrapunto documentado es Qwen3.5-0.8B-Base, con el que hydor-suggest-49m se mezcla token a token y al que complementa en los idiomas donde este rinde peor.

## Limitaciones y advertencias

- No es un modelo de chat: solo predice el siguiente token y no genera respuestas completas por sí mismo.
- Contexto limitado a 256 tokens por parte; el entrenamiento usó fragmentos de 254 tokens, por lo que contextos más largos no están soportados.
- Riesgo de olvido catastrófico al personalizar: sin el corpus de replay, un modelo ajustado con el inglés de una sola persona pierde casi por completo los demás idiomas, según advierte el propio README.
- La calidad en idiomas distintos del inglés depende de la mezcla con Qwen3.5-0.8B-Base y del conmutador por idioma; en los 100 idiomas restantes se usa solo el modelo grande.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft sobre obras derivadas y su uso en servicios en red; el tokenizador y el texto de replay conservan sus propias licencias, que deben revisarse por separado.
- El modelo no incluye datos de benchmarks publicados, por lo que no hay evidencia cuantitativa de calidad fuera de la calibración interna sobre FLORES-200 dev.
- La detección de idioma requiere al menos 8 tokens y un posterior de 0,9 para aceptarse; contextos muy cortos pueden quedar sin conmutación fiable.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con texto web público, es previsible que herede sesgos del corpus, pero no se cuantifican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algoprog/hydor-suggest-49m
- Repositorio de Hydor: https://github.com/algoprog/hydor
- Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- GGUF de Qwen3.5-0.8B-Base: https://huggingface.co/ggml-org/Qwen3.5-0.8B-Base-GGUF
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset MADLAD-400: https://huggingface.co/datasets/allenai/MADLAD-400
