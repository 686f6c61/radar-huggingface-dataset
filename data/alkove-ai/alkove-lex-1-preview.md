# alkove-ai/alkove-lex-1-preview

## Resumen

alkove-lex-1-preview es un modelo de conversión de grafemas a fonemas (grapheme-to-phoneme, G2P) desarrollado por alkove-ai, pensado para funcionar íntegramente en el dispositivo (navegador o teléfono) sin enviar datos a ningún servidor. Devuelve las tres pronunciaciones más probables de una palabra escrita, junto con sus probabilidades, en el conjunto de 58 fonemas del modelo alkove-spot-1-preview. Cubre siete lenguas romances y germánicas: francés, inglés, español, portugués, italiano, catalán y rumano, e incluye nombres propios y palabras inventadas.

El modelo es muy compacto: los pesos en int8 ocupan 1,8 MB y se ejecutan en un único hilo sobre el motor Alkove (Rust, Apache-2.0), de forma nativa o compilado a WebAssembly. La latencia declarada es de unos 2,9 ms por palabra en un Galaxy Z Fold8 y unos 4,1 ms por palabra en un Apple M1 Max. Se distribuye en formato propietario `.alk` (con un manifiesto JSON y un fichero de fonemas), no en safetensors ni GGUF.

Es relevante ahora porque resuelve un problema concreto de los asistentes de voz embebidos: la pronunciación de nombres, marcas y palabras inventadas para la activación por palabra clave (wake word) y comandos personalizados, sin depender de la nube. Se trata de una versión preview: los pesos y la interfaz pueden cambiar antes de la versión 1. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder-decoder con atención (dos planes, `encoder` y `decoder`, sobre los mismos pesos) |
| Parametros totales | no disponible (pesos int8 de 1,8 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | palabra de hasta 33 caracteres (Unicode, tras NFC y minúsculas) |
| Tipos de cuantizacion | int8 (único formato distribuido) |
| Idiomas soportados | fr, en, es, pt, it, ca, ro |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propio del motor Alkove), con manifiesto `.json` y `phonemes.json` |

## Arquitectura y entrenamiento

El modelo se organiza en dos planes que comparten pesos y se ejecutan en sesiones separadas del motor. El plan `encoder` recibe la palabra como secuencia de puntos de código Unicode (float32 de forma `[1, 33]`, con relleno de ceros) y el índice de idioma (`lang`, float32 `[1]`), y produce las claves y valores de atención cruzada (`cross`, float32 `[3, 34, 256]`) junto con una máscara de relleno (`pad`, float32 `[34]`). El plan `decoder` es autorregresivo: en cada llamada recibe el token de cada haz (`token`, `[3]`), la fila padre de la que continúa cada haz (`parent`, `[3]`) y la posición (`pos`), y devuelve log-probabilidades sobre 61 índices (0 relleno, 1-58 fonemas, 59 `bos`, 60 `eos`) para cada uno de los 3 haces. El decoder conserva las claves y valores de cada haz entre llamadas, lo que evita recalcular el estado.

La decodificación es una búsqueda por haces (beam search) de anchura 3 que se detiene cuando los tres mejores resultados alcanzan `eos` o tras 39 posiciones. El manifiesto del modelo expone los parámetros `beams`, `bos`, `eos` y la lista de idiomas. No se han publicado datos sobre el volumen ni la composición del corpus de entrenamiento, ni sobre el uso de RLHF o DPO. El rendimiento declarado es de 1,1 ms para leer la palabra y 0,19 ms por paso de búsqueda en el Galaxy Z Fold8, y de 1,6 ms y 0,27 ms respectivamente en el M1 Max. El SDK de Alkove encapsula el proceso de búsqueda por el usuario.

## Capacidades

- Conversión de grafemas a fonemas en siete idiomas (fr, en, es, pt, it, ca, ro).
- Devolución de las tres pronunciaciones más probables con sus probabilidades (log-probabilidades por haz).
- Manejo de nombres propios, marcas y palabras inventadas, aplicando las reglas fonotácticas del idioma seleccionado.
- Normalización de entrada: NFC, conversión a minúsculas y sustitución de `’` por `'`.
- Ejecución en el dispositivo: nativa (Rust) o en WebAssembly, en un solo hilo.
- Integración mediante SDK para navegador (npm `alkove`), Python (`alkove`), Android y Swift.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; su tarea es exclusivamente G2P.

## Casos de uso

- Palabras de activación personalizadas: el modelo genera las pronunciaciones candidatas de un nombre o marca para que alkove-spot pueda detectarlo en el habla, con las probabilidades como criterio de selección.
- Comandos de voz de vocabulario abierto: permite fonetizar comandos nuevos en el dispositivo sin reentrenar el reconocedor ni consultar un servidor.
- Corrección de pronunciación en asistentes de lectura: dado un nombre propio o un extranjerismo, devuelve la pronunciación más probable en el idioma del usuario para guiar la síntesis o la ayuda a la lectura.
- Aplicaciones web sin backend: gracias a su tamaño de 1,8 MB y a la compilación a WebAssembly, puede integrarse en un navegador para ofrecer consulta de pronunciación sin enviar texto a ningún servidor.
- Aplicaciones móviles offline: mediante los SDK de Android y Swift, se usa para fonetizar entradas del usuario en tiempo real (unos 3-4 ms por palabra) en dispositivos sin conectividad.
- Fonetización de vocabulario en pipelines de datos: integrado vía el paquete de Python, permite generar léxicos de pronunciación para corpus de nombres, marcas o topónimos en las siete lenguas soportadas.
- Selección de pronunciación en sistemas de diálogo: las tres candidatas con probabilidad permiten al sistema elegir la variante según el contexto o pedir confirmación al usuario.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Grapheme-to-phoneme | 300 palabras reservadas, 7 idiomas | Primera pronunciación correcta (%) | 86,0 |

| Plataforma | Latencia por palabra | Desglose |
|---|---|---|
| Galaxy Z Fold8 (Android 17), CPU nativa, 1 hilo | ~2,9 ms | 1,1 ms de lectura + 0,19 ms por paso de búsqueda |
| Apple M1 Max (macOS), CPU nativa, 1 hilo | ~4,1 ms | 1,6 ms de lectura + 0,27 ms por paso de búsqueda |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. Los pesos int8 ocupan 1,8 MB, por lo que la huella de memoria es mínima.
- GPU recomendadas: no aplica; no se ha documentado ejecución en GPU.
- Cabe en cualquier GPU de consumo y en cualquier CPU moderna; se ejecuta en un solo hilo.
- Opciones de despliegue: motor Alkove (Rust, Apache-2.0), nativo o WebAssembly; SDK de navegador (npm `alkove`), paquete de Python (`alkove`), SDK de Android y paquete de Swift. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~2,9 ms por palabra en Galaxy Z Fold8 y ~4,1 ms por palabra en Apple M1 Max, en un hilo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, los sistemas G2P clásicos (basados en reglas o en modelos seq2seq con pesos en safetensors/ONNX) suelen requerir más memoria y no ofrecen el mismo formato de distribución ni la misma integración en navegador. La comparación numérica con alternativas concretas queda como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Ejecución en navegador |
|---|---|---|---|---|---|
| alkove-lex-1-preview | no disponible (1,8 MB int8) | palabra de hasta 33 caracteres | Apache-2.0 | `.alk` | sí (WebAssembly) |
| Alternativas G2P genéricas | no disponible | no disponible | variable | safetensors/ONNX | no disponible |

## Limitaciones y advertencias

- Solo procesa palabras de hasta 33 caracteres; no está pensado para fonetizar frases completas para síntesis de voz.
- Solo cubre las siete lenguas indicadas; no soporta otras.
- Solo emite el conjunto de 58 fonemas de alkove-spot; no es compatible con otros inventarios fonémicos.
- Los préstamos y nombres propios se pronuncian según las reglas del idioma seleccionado, lo que puede producir resultados alejados de la pronunciación nativa.
- Es una versión preview: los pesos y la interfaz pueden cambiar antes de la versión 1, lo que desaconseja fijarla en producción sin control de versiones.
- El resultado de 86,0 % de primera pronunciación correcta implica que aproximadamente una de cada siete palabras recibe una primera candidata incorrecta; conviene usar las tres candidatas en lugar de solo la primera.
- No se han publicado datos sobre sesgos, composición del corpus de entrenamiento ni evaluación independiente; existe riesgo de sesgo hacia las convenciones ortográficas de las variedades representadas en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el formato `.alk` y el motor Alkove son necesarios para ejecutar el modelo; verificar la compatibilidad de licencias del motor y de los SDK en el producto final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-lex-1-preview
- Modelo alkove-spot-1-preview (conjunto de fonemas): https://huggingface.co/alkove-ai/alkove-spot-1-preview
- Sitio de Alkove: https://alkove.ai
- Motor Alkove (Rust): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK de navegador (npm): https://www.npmjs.com/package/alkove
- Paquete de Python: https://pypi.org/project/alkove/
- SDK de Android: https://github.com/alkove-ai/alkove/tree/main/android
- Paquete de Swift (iOS): https://github.com/alkove-ai/alkove/tree/main/ios
