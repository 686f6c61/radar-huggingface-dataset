# ctrltokyo/eeh-1-1

## Resumen

eeh-1-1 es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por ctrltokyo, diseñado para ser extremadamente ligero: 3.343.824 parámetros en total, pesos int8 de 4,0 MB y capacidad de ejecutarse en una sola hebra de CPU o íntegramente dentro de un navegador mediante WebAssembly. Es una revisión afinada de eeh-1 (4.534.219 parámetros), del que hereda la arquitectura y los pesos iniciales, y que a su vez fue entrenado desde cero sobre 18,6 horas de audio del corpus Irodori-TTS v4.1 Small Yomi. La licencia es Apache-2.0.

La particularidad técnica del modelo es que prescinde de vocoder neuronal. Un transformer lee los fonemas y tonos de acento tonal generados por OpenJTalk, predice la duración de cada fonema y, a continuación, predice tono, sonoridad y los parámetros de un pequeño sintetizador fuente-filtro que construye la forma de onda a partir de un tren de pulsos y ruido. Esta cadena completa se implementa en un motor propio escrito en Rust, con front-end japonés idéntico a OpenJTalk (validado sobre más de 500.000 textos de prueba).

La relevancia de eeh-1-1 radica en su perfil de despliegue: síntesis a 24 kHz mono, dos voces (F1 y M1), procesamiento en streaming dentro de una frase con latencia de primera muestra de aproximadamente 3 ms en CPU (11 ms para una frase de 14 segundos), y velocidad de 400x tiempo real en una hebra de Apple M4 Max. Frente a eeh-1, incorpora stacks de transformer con pesos compartidos (looped) y atención local en los stacks a nivel de trama, lo que reduce parámetros un 26 % manteniendo o mejorando todas las métricas evaluadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con stacks "looped" (pesos compartidos) y atención local en stacks a nivel de trama; sintetizador fuente-filtro en lugar de vocoder neuronal |
| Parámetros totales | 3.343.824 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (pesos por defecto, con escala float32 por fila) y float32; la cuantización int8 se desquantiza al cargar, por lo que la velocidad es idéntica |
| Idiomas soportados | japonés (kanji, kana y números; acento tonal de Tokio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`eeh.safetensors` int8, 4,0 MB; `eeh-f32.safetensors` float32, 13,4 MB) más diccionario japonés `eeh-dict.bin` (36 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer que opera sobre fonemas y tonos de acento tonal producidos por OpenJTalk. La pila predice primero la duración de cada fonema y después, a nivel de trama, predice tono, sonoridad y los ajustes de un pequeño sintetizador fuente-filtro que genera la forma de onda a partir de un tren de pulsos y ruido. No hay vocoder neuronal en ninguna etapa. Respecto a eeh-1, la revisión introduce stacks de transformer con pesos compartidos (looped, misma profundidad efectiva con menos parámetros) y atención local en los stacks a nivel de trama, lo que reduce el recuento de parámetros de 4.534.219 a 3.343.824 (un 26 % menos).

El entrenamiento parte de los pesos de eeh-1, que fue entrenado desde cero sobre 18,6 horas de voz del corpus Irodori-TTS v4.1 Small Yomi. eeh-1-1 se obtiene mediante fine-tuning de 20.000 pasos sobre esa base. El modelo no incorpora pesos preentrenados externos. El motor de inferencia está escrito en Rust y se distribuye en varias formas: paquete Python sin dependencias, programa de línea de comandos, biblioteca C con cabecera `eeh.h` y demo completa compilada a WebAssembly para navegador.

## Capacidades

- Síntesis de voz en japonés a 24 kHz mono con dos voces: F1 (femenina, finales de los 20, tono calmado y claro) y M1 (masculina, principios de los 30, tono cálido).
- Lectura correcta de kanji, kana y números, con aplicación del acento tonal de Tokio.
- Control de velocidad (`speed`, por defecto 1.0), desplazamiento de tono (`pitch_shift`, 0.058 equivale aproximadamente a un semitono), rango de tono (`pitch_range`) y semilla (`seed`).
- Streaming dentro de una frase: `speak_stream` entrega fragmentos de audio en cuanto sus muestras son definitivas (primer bloque de 12 tramas, después bloques de 48 tramas, 10,7 ms por trama); la concatenación equivale exactamente a la salida de `speak`.
- Síntesis por frases completas mediante `speak_each`.
- Uso multihilo: el sintetizador puede compartirse entre hilos.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz de interfaces web en japonés: la demo compilada a WebAssembly permite sintetizar dentro de la pestaña del navegador sin enviar texto a ningún servidor, con primera muestra en 13–50 ms, adecuado para lectores de artículos o accesibilidad.
- Asistentes de voz embebidos en dispositivos de gama baja: con 4,0 MB de pesos int8 y 35 ms para una frase de 14 segundos en una hebra de CPU, cabe en hardware sin GPU y sin acelerador dedicado.
- Atención al cliente telefónica o por voz en japonés: el streaming intra-frase reduce la latencia percibida y las dos voces permiten alternar registros; el tratamiento correcto de kanji, números y fórmulas de cortesía (registro `polite`) encaja con guiones de atención.
- Anuncios y avisos dinámicos con números y fechas: el modelo lee correctamente cifras y expresiones temporales, lo que lo hace apto para sistemas de megafonía, transporte o recordatorios de citas.
- Generación de audiolibros y contenido narrado: la voz F1 y el control de velocidad y tono permiten ajustar la narración; la síntesis por frases (`speak_each`) facilita el troceado de textos largos.
- Integración en aplicaciones nativas mediante FFI: la biblioteca C (`lib/`, `include/eeh.h`) permite usar el motor desde cualquier lenguaje con interfaz C, útil para aplicaciones de escritorio o sistemas empotrados.
- Pruebas automatizadas de pipelines de voz: al no tener dependencias y devolver arrays NumPy, el paquete Python se integra fácilmente en tests de regresión de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un informe de evaluación (`eval/report.json`) y el registro de fine-tuning (`eval/metrics.jsonl`), pero no se proporcionan cifras concretas de métricas en el texto disponible. Los únicos datos de rendimiento publicados son de velocidad y latencia:

| Métrica | Valor |
|---|---|
| Parámetros | 3.343.824 (eeh-1: 4.534.219) |
| Velocidad (frase de 14 s) | 35 ms en una hebra de CPU (400x tiempo real, Apple M4 Max con Accelerate) |
| Velocidad en navegador | aproximadamente 60x tiempo real |
| Primera muestra (frase corta) | 3 ms en CPU; 13–50 ms en navegador |
| Primera muestra (frase de 14 s) | 11 ms en CPU en streaming |
| Tamaño de pesos | 4,0 MB int8; 13,4 MB float32 |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Los pesos int8 ocupan 4,0 MB y los float32 13,4 MB, más un diccionario japonés de 36 MB.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Cabe en cualquier CPU de consumo moderna; la referencia medida es una Apple M4 Max, y también se ejecuta en navegador vía WebAssembly.
- Opciones de despliegue: paquete Python (`pip install python/eeh-0.2.0-py3-none-<plataforma>.whl`, wheels para macOS arm64 y Linux aarch64/x86_64), binario de línea de comandos (`bin/<plataforma>/eeh`), biblioteca C (`lib/`, `include/eeh.h`) y demo WebAssembly en `demo/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 400x tiempo real en una hebra de CPU (Apple M4 Max), aproximadamente 60x en navegador; primera muestra en 3 ms (frase corta) y 11 ms (frase de 14 s) en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos TTS en la información proporcionada. La única comparación documentada es con su predecesor:

| Modelo | Parámetros | Pesos | Velocidad | Licencia |
|---|---|---|---|---|
| eeh-1-1 | 3.343.824 | 4,0 MB int8 | 400x tiempo real (M4 Max) | Apache-2.0 |
| eeh-1 | 4.534.219 | no disponible | no disponible | Apache-2.0 |

Según la model card, eeh-1-1 obtiene puntuaciones iguales o mejores que eeh-1 en todas las métricas evaluadas, con un 26 % menos de parámetros. No se ofrecen comparaciones con otros sistemas TTS.

## Limitaciones y advertencias

- Solo soporta japonés; no hay soporte multilingüe documentado.
- El modelo está limitado a dos voces (F1 y M1) y al acento tonal de Tokio; no se documentan otros acentos o dialectos.
- No se dispone de información sobre sesgos del corpus de entrenamiento (18,6 horas de una única fuente, Irodori-TTS v4.1 Small Yomi), lo que puede limitar la variedad de estilos y voces.
- Al ser un modelo generativo de audio, puede producir pronunciaciones incorrectas en textos ambiguos o nombres propios; no se documentan tasas de error.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del corpus de entrenamiento original, que no se detallan en la información disponible.
- El diccionario japonés (`eeh-dict.bin`, 36 MB) es varias veces mayor que los pesos del modelo, un coste a tener en cuenta en despliegues con restricciones de almacenamiento.
- No se documentan límites de longitud de texto de entrada ni comportamiento con textos muy largos fuera del streaming por frases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctrltokyo/eeh-1-1
- Modelo base eeh-1: https://huggingface.co/ctrltokyo/eeh-1
- Corpus de entrenamiento Irodori-TTS v4.1 Small Yomi: https://huggingface.co/takuma104/Irodori-TTS-v4.1-Small-Yomi
