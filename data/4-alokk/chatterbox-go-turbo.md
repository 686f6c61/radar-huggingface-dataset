# 4-alokk/chatterbox-go-turbo

## Resumen

chatterbox-go-turbo es un paquete de grafos ONNX del modelo Chatterbox-Turbo de Resemble AI, un sistema de síntesis de voz (TTS) de 350 millones de parámetros orientado a clonación de voz zero-shot en inglés. El autor del repositorio, 4-alokk, no modifica los grafos originales: reempaqueta la exportación oficial de Resemble AI (fp16 y q4f16) junto con el tokenizador, las configuraciones y un `manifest.json` con tamaños y hashes SHA-256, para que el servidor TTS on-device "Adsorp AI" escrito en Go los descargue y verifique en el primer arranque.

La relevancia de este repositorio no está en el modelo en sí, sino en el formato de distribución: convierte un modelo de voz con clonación y etiquetas paralingüísticas (como `[laugh]` o `[chuckle]`) en un artefacto portable para inferencia en CPU mediante ONNX Runtime, sin dependencia de Python ni de PyTorch. Incluye cuatro grafos separados (encoder de voz, embeddings de tokens, modelo de lenguaje con caché KV y decodificador condicional) que reproducen el pipeline completo hasta audio mono a 24 kHz.

El modelo base es Chatterbox-Turbo de Resemble AI, con licencia MIT heredada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 3 de noviembre de 2026. Está pensado para implementadores que integren el servidor Go, no como una librería de uso directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; pipeline TTS con encoder de voz, modelo de lenguaje autorregresivo con caché KV y decodificador condicional (grafos ONNX separados) |
| Parámetros totales | 350 M (según la model card del autor) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 y q4f16 (grafos ONNX preexportados) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime); tokenizador en `vocab.json`, `merges.txt`, `added_tokens.json` |
| Modelo base | ResembleAI/chatterbox-turbo |
| Tamaño del repo | 2,2 GB |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Tokenizador | BPE byte-level estilo GPT-2 con etiquetas paralingüísticas |

## Arquitectura y entrenamiento

El repositorio distribuye cuatro grafos ONNX que componen el pipeline de inferencia: `speech_encoder` (convierte un wav de referencia a 24 kHz en características de condicionamiento de voz), `embed_tokens`, `language_model` (decodificador autorregresivo con caché KV) y `conditional_decoder` (transforma tokens de habla en audio a 24 kHz). El flujo es: se codifica el wav de referencia, se concatenan las características de condicionamiento con los embeddings de los tokens de texto, se ejecuta el modelo de lenguaje de forma autorregresiva y, finalmente, se anteponen los tokens de prompt del encoder, se añade el token de silencio (4299) tres veces y se pasa todo por el decodificador condicional.

Los grafos provienen de la exportación oficial de Resemble AI (`ResembleAI/chatterbox-turbo-ONNX`), sin modificaciones. No se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La model card del autor menciona que el modelo base tiene 350 M de parámetros, soporta clonación de voz zero-shot y acepta etiquetas paralingüísticas como `[laugh]` y `[chuckle]`. Los tamaños de descarga son 1661 MB en fp16 y 562 MB en q4f16.

Un detalle de implementación crítico: hay que añadir dos tokens `<|endoftext|>` (id 50256) a cada prompt tokenizado, porque los grafos exportados los esperan; si se omiten, se corrompen las primeras palabras. Los parámetros de muestreo indicados son temperatura 0,8, top-k 1000, top-p 0,95 y penalización de repetición 1,2.

## Capacidades

- Síntesis de voz en inglés a 24 kHz mono.
- Clonación de voz zero-shot: se ejecuta el encoder de voz una vez sobre un clip limpio de un solo hablante (se recomiendan al menos 5 segundos) y se reutiliza el resultado.
- Etiquetas paralingüísticas en el texto de entrada (`[laugh]`, `[chuckle]`).
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU ni de PyTorch.
- Verificación de integridad de los ficheros mediante `manifest.json` (tamaño y SHA-256).
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá del wav de referencia ni capacidades multilingües distintas del inglés.

## Casos de uso

- Narración on-device en aplicaciones de escritorio: el servidor Go carga los grafos ONNX y sintetiza texto en local sin enviar datos a la nube; el factor de tiempo real medido (0,49 en fp16 sobre Apple M4 Pro) permite generar audio más rápido que en tiempo real en CPU.
- Clonación de voz para audiolibros o contenido personal: se codifica un clip de referencia de al menos 5 segundos y se reutiliza el condicionamiento para todas las frases, con lo que se mantiene una voz consistente a lo largo de la narración.
- Asistentes de voz embebidos en dispositivos sin GPU: la variante q4f16 ocupa 562 MB y permite desplegar el pipeline completo en equipos con recursos limitados, a costa de un aumento del WER (21,7 % frente a 8,7 % en fp16).
- Generación de audio expresivo para prototipos de videojuegos o interfaces: las etiquetas `[laugh]` y `[chuckle]` permiten introducir matices paralingüísticos directamente en el texto de entrada.
- Integración en servidores TTS autoalojados en Go: el `manifest.json` con hashes permite distribuir y actualizar los grafos de forma verificable en el primer arranque del servidor.
- Evaluación comparativa de precisión en TTS: al ofrecer fp16 y q4f16 del mismo modelo, sirve para medir el impacto de la cuantización en la calidad del habla con Whisper-base como métrica.

## Benchmarks y rendimiento

Datos medidos por el autor en el servidor Go (CPU, Apple M4 Pro, 8 hilos, 8 frases de narración, WER con Whisper-base):

| Configuración | WER | Factor de tiempo real (menor = más rápido) |
|---|---|---|
| Turbo fp16 | 8,7 % | 0,49 |
| Turbo q4f16 | 21,7 % | ~0,5 |

El propio autor indica que es un benchmark relativo y pequeño, no una afirmación absoluta de calidad, y que la referencia Python de ONNX da cifras equivalentes dentro del ruido. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; el pipeline está diseñado para ONNX Runtime en CPU.
- Tamaño en disco: 1661 MB (fp16) o 562 MB (q4f16) para los grafos, más tokenizador y configuraciones; el repositorio completo ocupa 2,2 GB.
- GPU: no se documentan requisitos ni GPU recomendadas; las mediciones publicadas son en CPU (Apple M4 Pro, 8 hilos).
- Consumer GPU: no se indica compatibilidad ni pruebas en RTX 4090 u otras; el foco es on-device en CPU.
- Despliegue: ONNX Runtime (librería `onnxruntime`); el servidor Go "Adsorp AI" es el consumidor previsto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real de 0,49 en fp16 y ~0,5 en q4f16 sobre Apple M4 Pro con 8 hilos, es decir, aproximadamente el doble de rápido que tiempo real en esa configuración.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. La comparación se limita a lo que se puede afirmar con los datos disponibles:

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chatterbox-go-turbo (este repo) | 350 M | en | ONNX (fp16, q4f16) | MIT | Empaquetado para servidor Go on-device; sin watermark |
| ResembleAI/chatterbox-turbo | 350 M | en | No disponible | MIT (según este repo) | Modelo base original |
| ResembleAI/chatterbox-turbo-ONNX | 350 M | en | ONNX (fp16, q4f16) | No disponible | Exportación oficial de los grafos |

No se dispone de información sobre otros modelos TTS comparables (por ejemplo, de otros autores) en la documentación consultada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- La variante q4f16 degrada notablemente la calidad: WER del 21,7 % frente al 8,7 % de fp16 en la prueba del autor.
- Los grafos ONNX no incluyen la marca de agua PerTh que aplica el paquete Python de Resemble; la salida es la forma de onda cruda del vocoder. Resemble AI pide que los despliegues mantengan el watermarking del audio generado.
- Riesgo de uso indebido: no se debe clonar una voz sin permiso del hablante ni suplantar a nadie; la model card lo advierte explícitamente.
- Requisito de implementación frágil: es obligatorio añadir dos tokens `<|endoftext|>` (id 50256) al final de cada prompt tokenizado; omitirlos corrompe las primeras palabras.
- La clonación de voz requiere un clip limpio de un solo hablante de al menos 5 segundos; clips de peor calidad o con varios hablantes degradan el resultado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- No se documentan sesgos del modelo base, comportamiento ante texto fuera de dominio ni límites de longitud de entrada.
- La licencia MIT se hereda del modelo base según el autor; conviene verificar `LICENSE` y `NOTICE.md` del repositorio antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/4-alokk/chatterbox-go-turbo
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo
- Exportación ONNX oficial: https://huggingface.co/ResembleAI/chatterbox-turbo-ONNX
