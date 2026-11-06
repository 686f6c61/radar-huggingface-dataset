# pdnhan/whisper-small-mobile

## Resumen

Whisper small for mobile (ONNX) es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático del habla (ASR) `openai/whisper-small`, publicada por el usuario pdnhan. No es un modelo nuevo ni reentrenado: es una copia funcional de la exportación de Xenova (`Xenova/whisper-small`) pensada para ejecutarse en dispositivos móviles con ONNX Runtime, principalmente en Android.

El problema que resuelve es de memoria: las exportaciones estándar de Whisper small a ONNX declaran los mapas de atención como salidas del grafo, y ONNX Runtime mantiene esas salidas en memoria, disparando el consumo. Esta versión elimina esas salidas del grafo sin tocar pesos ni nodos, reduciendo el pico de memoria neto de una transcripción de 2231 MB a 1034 MB con el mismo resultado.

Es relevante para desarrolladores que quieran integrar ASR multilingüe en aplicaciones móviles sin depender de la nube. La arquitectura subyacente es el transformer encoder-decoder de Whisper small (aproximadamente 244 millones de parámetros), con contexto de audio fijo de 30 segundos y soporte multilingüe, aunque el autor lo emplea en producción para alemán.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), exportado a ONNX |
| Parámetros totales | Aproximadamente 244 millones (heredados de openai/whisper-small) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (80 x 3000 log-mel) |
| Tipos de cuantización | int8 (archivos `*_quantized.onnx`) |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); uso principal documentado en alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder y decoder cuantizados int8) |

## Arquitectura y entrenamiento

El modelo es el Whisper small original de OpenAI, un transformer encoder-decoder entrenado para transcripción y traducción de voz. El encoder procesa una representación log-mel de 80 canales y 3000 frames (30 segundos de audio) y produce `last_hidden_state`; el decoder es autorregresivo, con caché de clave-valor (`past_key_values.*` y `use_cache_branch`), y genera tokens a partir de `input_ids` y los estados del encoder. La exportación usa un decoder fusionado (`decoder_model_merged_quantized.onnx`) que combina los pasos con y sin caché.

No hay entrenamiento adicional ni ajuste fino por parte del autor. La única modificación respecto a `Xenova/whisper-small` (commit `2d67713f236afa48a18992566e7647f6ca848e13`) es que los mapas de atención dejan de ser salidas declaradas del grafo ONNX. Los pesos, los nodos y los resultados son idénticos: en dos clips de FLEURS en alemán, con 30 pasos de decodificación greedy desde el prompt alemán, se obtienen los mismos tokens y la misma salida del encoder. La cuantización int8 procede de la exportación original de Xenova.

## Capacidades

- Reconocimiento automático del habla (transcripción) multilingüe, heredado de Whisper small.
- Traducción de voz a texto hacia inglés (capacidad nativa de Whisper, no documentada específicamente en esta copia).
- Ejecución en dispositivo con ONNX Runtime, sin dependencia de servicios en la nube.
- Control explícito del idioma mediante el token de prompt; el autor fija `<|de|>` para alemán.
- Decodificación greedy con caché de clave-valor y decodificación por pasos (el autor usa 20-30 pasos).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de voz en aplicaciones Android: el modelo se integra con ONNX Runtime y ejecuta encoder y decoder en local; el pico de memoria de 1034 MB lo hace viable en dispositivos de gama media-alta sin conexión.
- Dictado por voz offline: al no requerir red, sirve para aplicaciones de notas o mensajería que deben funcionar en modo avión o con privacidad estricta.
- Subtitulado en tiempo casi real de audio corto: la ventana fija de 30 segundos y la caché de clave-valor permiten procesar fragmentos sucesivos con baja latencia en dispositivo.
- Asistentes de voz embebidos: la transcripción local evita enviar audio a servidores, lo que simplifica el cumplimiento de normativas de protección de datos.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con dificultades auditivas en entornos sin conectividad.
- Procesamiento por lotes en el borde (edge computing): transcripción de grabaciones en dispositivos con recursos limitados, ajustando el número de hilos intra-op (el autor usa 4) y la optimización de grafo `ENABLE_ALL`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta una comparación de memoria y una verificación de equivalencia:

| Métrica | Xenova/whisper-small | Esta copia |
|---|---|---|
| Pico de memoria neto por transcripción | 2231 MB | 1034 MB |
| Tokens de salida (2 clips FLEURS alemán, 30 pasos greedy) | Idénticos | Idénticos |
| Salida del encoder | Idéntica | Idéntica |

Medición con ONNX Runtime 1.31.1, 4 hilos intra-op y optimización de grafo `ENABLE_ALL`, en procesos nuevos.

## Requisitos de hardware

- VRAM/RAM estimada: alrededor de 1 GB de pico neto por transcripción (encoder y decoder cargados, 20 pasos de decoder) según la medición del autor.
- GPU recomendadas: no aplica de forma específica; el objetivo es CPU móvil. En servidor podría ejecutarse en cualquier GPU compatible con ONNX Runtime, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: ONNX Runtime (principal, con `ENABLE_ALL`), potencialmente otros runtimes compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles. El autor solo indica 20 pasos de decoder para la medición de memoria y 30 pasos greedy para la verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| pdnhan/whisper-small-mobile | ~244 M | 30 s | ONNX int8 | Apache 2.0 | Móvil, ONNX Runtime |
| Xenova/whisper-small | ~244 M | 30 s | ONNX | Apache 2.0 | transformers.js, navegador |
| openai/whisper-small | ~244 M | 30 s | PyTorch (safetensors/bin) | Apache 2.0 (pesos), MIT (código) | Referencia, servidor/GPU |

La diferencia principal frente a Xenova/whisper-small es el consumo de memoria (1034 MB frente a 2231 MB) con resultados idénticos. Frente al original de OpenAI, esta copia prioriza el despliegue en dispositivo sobre la flexibilidad de entrenamiento o ajuste fino.

## Limitaciones y advertencias

- Ventana de audio fija de 30 segundos; audios más largos requieren segmentación manual.
- El uso en producción documentado es solo para alemán; el resto de idiomas multilingües no está verificado en esta copia.
- Riesgo de alucinación inherente a Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- Sesgos heredados del corpus de entrenamiento original de Whisper (dominio de inglés y determinados acentos y registros).
- La cuantización int8 puede degradar ligeramente la precisión frente a los pesos en punto flotante, aunque el autor verifica equivalencia en dos clips concretos.
- El decoder requiere gestionar manualmente el prompt de idioma y los tokens de parada (`<|endoftext|>` = 50257); un prompt incorrecto produce salidas erróneas.
- Licencia Apache 2.0 para los pesos en Hugging Face; el código y los pesos del repositorio original de OpenAI están bajo MIT. Verificar la licencia aplicable antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- El script `make_mobile.py` se incluye solo por trazabilidad y depende de `tools/whisper_de` del repositorio de la aplicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/whisper-small-mobile
- Exportación base de Xenova: https://huggingface.co/Xenova/whisper-small
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio de código de Whisper: https://github.com/openai/whisper
