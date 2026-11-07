# min-1870/nunchi-tr5n-102k

## Resumen

Nunchi TR5n-102K es un modelo de clasificación de tokens (token-classification) desarrollado por el usuario min-1870 para alimentar Nunchi, una utilidad de Windows que corrige texto mecanografiado en el modo de entrada coreano/inglés equivocado. El modelo no procesa caracteres, sino la secuencia cruda de pulsaciones 두벌식 (el estándar de teclado coreano), y etiqueta cada tecla como coreana (1) o inglesa (0). De este modo, `dkssud` escrito en modo inglés se convierte en `안녕` y `ㅗ디ㅣㅐ` escrito en modo coreano se convierte en `hello`.

Arquitectónicamente es un Transformer compacto (dimensión 256, 4 capas, 3,2 millones de parámetros) con una capa CRF sobre las emisiones, entrenado durante 102 000 pasos (semilla 0 de dos). El modelo se distribuye en formato ONNX y está pensado para inferencia local de baja latencia: 3,8 ms por palabra en un solo hilo de un Ryzen 5 5600 con ONNX Runtime.

Su relevancia es acotada pero específica: resuelve un problema cotidiano de usuarios bilingües coreano-inglés (code-switching) con un modelo minúsculo que cabe en cualquier equipo y no requiere GPU. La ficha del modelo reporta tasas de error por palabra inferiores al 0,1 % en texto monolingüe y en torno al 0,79 % en un uso real de 17 876 palabras durante 32 días.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) sobre flujo de teclas + capa CRF |
| Parámetros totales | 3,2 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de teclas por palabra, incluyendo espacios; longitud máxima no especificada) |
| Tipos de cuantización | no disponible (se distribuye en ONNX float32) |
| Idiomas soportados | ko, en |
| Licencia | other / cc-by-sa-4.0-where-possible (ver limitaciones) |
| Formato de pesos | ONNX (`tr5n_102k.onnx`) + JSON auxiliar (`tr5n_102k.json`) |

## Arquitectura y entrenamiento

El modelo es un Transformer de 4 capas y dimensión 256 que opera sobre una secuencia codificada de pulsaciones de tecla, no sobre texto plano. La entrada incluye los identificadores de tecla (`ids`), posición (`pos`), posición dentro de la palabra (`wpos`) e índice de palabra (`widx`), todos int64 con forma (batch, keys). La salida son emisiones float32 (batch, keys, 2), que se decodifican con una capa CRF cuyos pesos se incluyen en el JSON auxiliar. El modelo etiqueta cada tecla como inglesa (0) o coreana (1); una palabra cuyas etiquetas cambian en su interior se divide (por ejemplo, `MBC는` se separa en `MBC` + `는`).

El entrenamiento comprende 102 000 pasos y esta es la semilla 0 de dos ejecuciones del mismo procedimiento. Los datos de entrenamiento provienen de NSMC, el corpus de preentrenamiento de KcBERT, mC4 coreano, Tatoeba, Wiktionary, WikiText-103, un volcado de comentarios de Reddit (aproximadamente el 0,7 % de las muestras, sin licencia declarada) y algunas líneas de GoEmotions e IMDB reviews. No se especifica el número total de tokens ni si hubo RLHF o DPO; el modelo se entrena como etiquetador supervisado con CRF, no como modelo generativo.

## Capacidades

- Clasificación de tokens a nivel de pulsación de tecla para decidir si cada tecla pertenece a coreano o a inglés.
- Corrección de modo de entrada: convierte texto escrito en el modo equivocado (`dkssud` → `안녕`, `ㅗ디ㅣㅐ` → `hello`).
- Manejo de code-switching intra-palabra y segmentación de palabras mixtas (`MBC는` → `MBC` + `는`).
- Procesamiento de secuencias de teclas con espacios incluidos.
- Decodificación CRF con revisión diferida: el sistema decide en el espacio y revisa cuando el modelo alcanza al menos el 95 % de confianza tres palabras después.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas a coreano e inglés.

## Casos de uso

- Corrección de modo de entrada en Windows: la aplicación Nunchi usa el modelo para reetiquetar pulsaciones y reescribir el texto en el idioma correcto, con 3,8 ms por palabra en CPU de un solo hilo.
- Escritura bilingüe coreano-inglés en entornos técnicos: útil para desarrolladores que alternan identificadores en inglés y texto en coreano, donde la tasa de error reportada en uso real fue del 0,79 % sobre 17 876 palabras.
- Integración en editores de código o terminales: al ser un modelo ONNX de 3,2 M de parámetros, puede embeberse en procesos locales sin GPU y con latencia despreciable.
- Preprocesado de texto para pipelines de NLP: la segmentación de palabras mixtas (`QR코드`, `MBC는`) facilita la tokenización posterior en tareas de análisis de texto coreano.
- Investigación sobre code-switching: sirve como referencia reproducible para estudiar la desambiguación de teclas que son palabras válidas en ambos idiomas (`so`/내, `go`/해).
- Corrección en herramientas de accesibilidad o teclados virtuales: el modelo puede ejecutarse en el dispositivo y corregir la entrada sin enviar pulsaciones a un servidor.

## Benchmarks y rendimiento

Resultados sobre mitades de desarrollo de conjuntos reservados, medidos como porcentaje de palabras incorrectas al final, decidido en el espacio y revisado a las tres palabras con confianza ≥ 95 %.

| Celda | Palabras dev | Incorrectas (%) |
|---|---|---|
| Solo coreano / solo inglés | 60 267 / 39 011 | 0,10 / 0,03 |
| Coreano → inglés: inicio / medio / final de la parte inglesa | 1 011 / 4 368 / 2 993 | 2,30 / 1,31 / 2,24 |
| Inglés → coreano: inicio / medio / final de la parte coreana | 1 595 / 2 090 / 1 465 | 0,29 / 2,45 / 5,20 |
| Palabras inglesas que también son coreanas (`so` = 내, `go` = 해) | 3 087 | 6,32 |
| Palabras coreanas que también son inglesas (해 = `go`) | 2 998 | 2,06 |
| Jamo suelto en texto coreano (ㅋ, ㅠ) | 2 739 | 7,87 |
| Ambos idiomas sin espacio (`QR코드`, `MBC는`) | 1 513 | 6,79 |
| Error tipográfico en la palabra / Shift pulsado | 14 437 / 3 842 | 1,08 / 0,22 |

En uso real, sobre 17 876 palabras mecanografiadas por una persona en Claude Code durante 32 días y con los umbrales de la aplicación, el 0,79 % de las palabras salieron incorrectas. La variación entre semillas es de aproximadamente 35-45 palabras sobre 133 050, por lo que las diferencias pequeñas entre celdas no son significativas.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo es de 3,2 M de parámetros y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer: el autor reporta 3,8 ms por palabra en un solo hilo de un Ryzen 5 5600 con ONNX Runtime.
- Despliegue: ONNX Runtime es el runtime de referencia; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 3,8 ms/palabra en el hardware citado; el throughput agregado no se especifica.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación de pulsaciones para corrección de modo de entrada coreano/inglés). Los modelos de token-classification multilingües habituales no operan sobre flujos de teclas ni incluyen CRF sobre pulsaciones, por lo que la comparación directa no está disponible.

## Limitaciones y advertencias

- Las teclas que son palabras válidas en ambos idiomas (`so`/내, `go`/해, `gg`/ㅎㅎ) se deciden por contexto y a menudo este es insuficiente; cerca de la mitad de los errores restantes son de este tipo.
- La primera palabra de una línea carece de contexto y es la posición más débil.
- El inglés en minúsculas pegado a coreano (`wsl로`, `k키트`) suele leerse como todo coreano.
- El modelo se entrenó con palabras completas; sobre una palabra que se está escribiendo puede ser demasiado confiado (`wha` se lee como 좀).
- Solo se entrenó con teclas 두벌식 y con texto escrito, no con mecanografía grabada.
- Licencia: los pesos se ofrecen tal cual para probar la aplicación e investigación; parte de los datos de entrenamiento son CC BY-SA, por lo que los pesos se ofrecen bajo CC BY-SA 4.0 en la medida de lo posible, sin conceder derechos sobre texto de terceros. No todas las fuentes declaran licencia; el volcado de Reddit no declara ninguna y representa aproximadamente el 0,7 % de las muestras.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en los casos anteriores.
- Uso comercial restringido por la licencia y por los términos de las fuentes de datos; no se garantiza disponibilidad general para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/min-1870/nunchi-tr5n-102k
- Repositorio del proyecto: https://github.com/min-1870/Nunchi
- Licencia: https://github.com/min-1870/Nunchi#license
- Fuentes de datos: https://github.com/min-1870/Nunchi#data-sources
- Documentación de evaluación: https://github.com/min-1870/Nunchi/blob/main/docs/EVALUATION.md
- Codificación de entrada: https://github.com/min-1870/Nunchi/blob/main/app/core/src/encode.rs
- Exportación a ONNX: https://github.com/min-1870/Nunchi/blob/main/nunchi/export_onnx.py
- Dataset Reddit: https://huggingface.co/datasets/HuggingFaceGECLM/REDDIT_comments
