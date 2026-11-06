# oogasawa/fcitx5-slm-ime

## Resumen

fcitx5-slm-ime es un modelo de conversión de lectura kana a kanji (kana-kanji conversion) para japonés, desarrollado por oogasawa, que funciona como motor de un método de entrada (IME) sobre fcitx5 en Linux. Se trata de un Transformer a nivel de carácter con arquitectura encoder-decoder de aproximadamente 60 millones de parámetros, diseñado explícitamente para ejecutarse en la CPU de un portátil o mini PC convencional, sin necesidad de GPU.

El modelo aborda un problema clásico del procesamiento del japonés en escritorio: la conversión de lecturas fonéticas (kana) en la secuencia correcta de kanji, kana y puntuación. Frente a Mozc y Anthy, los IME de código abierto más extendidos en Linux, el autor reporta una ventaja creciente conforme aumenta la longitud de la lectura: en lecturas de 60 caracteres o más convierte sin error el 44 % de los casos, frente al 23 % de Mozc y el 4 % de Anthy.

La versión 2.0.0 es la relevante en la actualidad: reimplementa la inferencia del mismo modelo en C++ con Eigen dentro del propio motor, de modo que los paquetes solo dependen de bibliotecas presentes en las distribuciones. La versión 1.x usaba PyTorch mediante DJL en un servidor Java, lo que obligaba a empaquetar DJL, PyTorch y una máquina virtual Java propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder a nivel de carácter |
| Parametros totales | ~60 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible en la model card (el repo declara librería pytorch; la versión 2 infiere en C++ con Eigen) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder que opera sobre caracteres, con aproximadamente 60 millones de parámetros. La tarea es de secuencia a secuencia: recibe una lectura en kana y genera la cadena de salida con la mezcla adecuada de kanji, kana y signos. El tamaño reducido es una decisión de diseño deliberada para permitir inferencia en CPU con latencia aceptable dentro de un IME interactivo.

El entrenamiento se realizó sobre 5,3 millones de pares de lectura y frase: 2,4 millones procedentes de la Wikipedia en japonés y 2,9 millones de FineWeb-2 (texto de páginas web). La model card no detalla el número total de tokens, la composición exacta del dataset más allá de esas dos fuentes, ni si hubo fases de ajuste fino con RLHF o DPO. La innovación técnica destacable no está en la arquitectura sino en el despliegue: la versión 2.0.0 ejecuta el modelo en C++ con Eigen dentro del motor fcitx5, eliminando la dependencia de PyTorch, DJL y un runtime de Java en los paquetes distribuidos.

## Capacidades

- Conversión kana-kanji: transforma lecturas fonéticas japonesas en texto con kanji, kana y puntuación correctos.
- Manejo de lecturas largas: el autor reporta que la ventaja frente a Mozc y Anthy se amplía con la longitud de la lectura, con un 44 % de conversiones sin error en lecturas de 60 caracteres o más.
- Ejecución en CPU: inferencia sin GPU, apta para portátiles y mini PCs.
- Integración como IME: funciona sobre fcitx5 en Linux mediante paquetes para Debian/Ubuntu y Fedora.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Monolingüe: únicamente japonés.

## Casos de uso

- Escritura diaria en japonés en Linux: un usuario instala el paquete de fcitx5 y obtiene un IME que convierte lecturas largas con menos errores que Mozc o Anthy, reduciendo las correcciones manuales en frases complejas.
- Entornos con hardware modesto: al ejecutarse solo en CPU, es adecuado para portátiles sin GPU dedicada, mini PCs y estaciones de trabajo de bajo consumo donde un IME basado en GPU no sería viable.
- Despliegue corporativo en escritorios Linux: los paquetes de la versión 2.0.0 dependen únicamente de bibliotecas de la distribución, lo que simplifica la gestión de software y evita arrastrar PyTorch o una JVM.
- Distribuciones Debian/Ubuntu y Fedora: existen paquetes `.deb` y `.rpm` para `amd64` y `arm64` (Ubuntu 24.04, Debian 13, Fedora 44), lo que cubre tanto equipos x86 como ARM.
- Sustitución de Mozc/Anthy en flujos de traducción o transcripción: al mejorar la conversión de lecturas largas, sirve como paso de posprocesado para convertir transcripciones fonéticas en texto japonés legible.
- Investigación sobre IMEs neuronales de bajo coste: el modelo y su implementación en C++/Eigen constituyen una referencia para estudiar conversión kana-kanji con modelos pequeños en producción.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la información disponible es la tasa de conversión sin error por longitud de lectura:

| Longitud de lectura | fcitx5-slm-ime | Mozc | Anthy |
|---|---|---|---|
| 60 caracteres o más | 44 % sin error | 23 % sin error | 4 % sin error |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU: no necesaria. No se documentan requisitos de GPU.
- CPU: apto para la CPU de un portátil o mini PC convencional, según el autor.
- Memoria y almacenamiento: el repositorio de Hugging Face ocupa 3,2 GB; no se detalla el tamaño de los pesos en runtime ni el consumo de RAM.
- Despliegue: motor fcitx5 sobre Linux, con paquetes para Debian/Ubuntu (`amd64`, `arm64`) y Fedora (`x86_64`). La versión 1.x, basada en PyTorch vía DJL en un servidor Java, requiere compilación desde la rama `1.x`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fcitx5-slm-ime | Transformer encoder-decoder carácter, IME | ~60 M | no disponible | CC BY-SA 4.0 | Pesos en Hugging Face; paquetes Linux |
| Mozc | IME basado en reglas y diccionarios | no aplica | no aplica | licencia propia de código abierto | Ampliamente empaquetado en distribuciones Linux |
| Anthy | IME basado en diccionarios | no aplica | no aplica | licencia propia de código abierto | Ampliamente empaquetado en distribuciones Linux |

La comparación relevante es funcional, no de parámetros: Mozc y Anthy no son modelos neuronales, sino motores con diccionarios y reglas. El dato comparable es la tasa de conversión sin error en lecturas de 60 caracteres o más (44 % frente a 23 % y 4 %). No se dispone de comparaciones con otros IME neuronales en la información proporcionada.

## Limitaciones y advertencias

- Monolingüe: solo soporta japonés; no es un modelo de propósito general.
- Tarea acotada: está especializado en conversión kana-kanji, no en generación libre, código, matemáticas ni razonamiento.
- Riesgo de conversión incorrecta: el propio dato de rendimiento indica que en lecturas de 60 caracteres o más aún falla en el 56 % de los casos.
- Sesgos: no documentados en la model card; al entrenarse con Wikipedia y FineWeb-2, puede heredar sesgos de esas fuentes.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribución y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Atribución obligatoria a las fuentes de entrenamiento: Wikipedia (CC BY-SA 4.0) y FineWeb-2 (ODC-By 1.0, sujeta a los términos de sus fuentes).
- Dependencia de plataforma: orientado a Linux con fcitx5; no se documenta soporte para otros sistemas de entrada o sistemas operativos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks estándar ni datos de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oogasawa/fcitx5-slm-ime
- Release v2.0.0: https://github.com/oogasawa/fcitx5-slm-ime/releases/tag/v2.0.0
- Repositorio GitHub: https://github.com/oogasawa/fcitx5-slm-ime
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Wikipedia en japonés: https://ja.wikipedia.org/
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Licencia ODC-By 1.0: no disponible como enlace en la información proporcionada
