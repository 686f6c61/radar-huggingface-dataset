# islomov/gapi-uz-gapiring-v1

## Resumen

Gapiring v1 es un sistema de síntesis de voz (text-to-speech) para uzbeko desarrollado por el usuario islomov, construido sobre el modelo base kyutai/pocket-tts. Se distribuye en dos variantes: Gapiring Edge v1 (110M parámetros, 117 MB) orientada a ejecución en CPU convencional o directamente en el navegador sin GPU ni servidor, y Gapiring Large v1 (336M parámetros) pensada para despliegue en servidor o escritorio con mayor calidad de audio. El modelo se publica en formato ONNX y se integra mediante librerías propias para Python, JavaScript, Android e iOS.

El modelo resuelve la generación de voz en uzbeko con control explícito de dos voces (`f1` femenina y `m1` masculina), un parámetro de rol (`operator`, `assistant`, `emotional`) y un parámetro de manera o tono (desde `neutral` y `warm` hasta estados emocionales como `angry`, `worried` o `tired`). Además soporta streaming de audio a 24 kHz mono en float32 y etiquetas de sonido embebidas en el texto (`[laugh]`, `[pause]`, `[breath]`, `[sigh]`).

Su relevancia radica en la combinación de un tamaño reducido con despliegue en el borde (edge computing): la variante Edge cabe en unos 100 MB dentro de una app Android o 150 MB en una app iOS, funciona sin red y sin PyTorch, lo que la hace adecuada para asistentes de voz offline en dispositivos móviles de gama baja. Incluye además un normalizador de texto que convierte números, fechas, importes y cirílico a palabras en uzbeko latino antes de la síntesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en kyutai/pocket-tts, exportada a ONNX (detalles internos no disponibles) |
| Parametros totales | 110M (Edge v1) y 336M (Large v1) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendado una frase o párrafo corto por llamada) |
| Tipos de cuantizacion | no disponible (se distribuyen grafos ONNX; el repo ocupa 1,9 GB) |
| Idiomas soportados | uzbeko (`uz`); incluye diccionario de palabras inglesas (`lexicon/en_uz.tsv`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafos Edge y Large); librerías Python, JS/WASM, Android (Maven) e iOS (Swift package) |
| Frecuencia de muestreo de salida | 24 kHz mono, float32 |
| Voces | `f1` (femenina) y `m1` (masculina) |
| Roles | `operator`, `assistant`, `emotional` |
| Maneras | `neutral`, `warm`, `cheerful`, `empathetic`, `calm`, `dictation`, `persuasive`, `brisk`, `soothing`, `angry`, `upset`, `irritated`, `worried`, `tired`, `sceptical`, `confused`, `hurried`, `joking`, `grateful`, `curious`, `friendly`, `elderly` |
| Streaming | Sí, generación incremental de chunks de audio |
| Normalización de texto | `literary` (números, fechas, importes, cirílico a latino) y `conversational` (formas habladas de Taskent) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que deriva de kyutai/pocket-tts y se distribuye como grafos ONNX. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino con preferencias. Tampoco se documenta el mecanismo concreto de control de rol y manera, aunque la API expone ambos como parámetros de nombre que condicionan la prosodia y el estilo de la voz generada.

La innovación técnica destacable es la orientación a despliegue en el borde: los grafos ONNX se ejecutan con onnxruntime en CPU (Python) y con onnxruntime-web (WebAssembly) en navegador, sin dependencia de PyTorch. El paquete incluye un frontend de texto (`runtime/text_front.py` y `runtime/frontend/`) escrito solo con la biblioteca estándar de Python que normaliza números, fechas, horas, importes, porcentajes, rangos, unidades y teléfonos, translitera cirílico a uzbeko latino y limpia markdown, emojis y comillas, preservando las etiquetas de sonido.

## Capacidades

- Síntesis de voz en uzbeko con dos voces predefinidas (`f1`, `m1`).
- Control de estilo mediante rol (`operator`, `assistant`, `emotional`) y manera (tono neutro, cálido, alegre, empático, calmado, dictado, persuasivo, enérgico, así como estados emocionales como enfadado, preocupado, cansado, escéptico, confundido, agradecido, curioso, amistoso o anciano).
- Streaming de audio: los chunks se generan y reproducen a medida que se producen (24 kHz mono, float32).
- Etiquetas de sonido embebidas en el texto: `[laugh]`, `[pause]`, `[breath]`, `[sigh]`.
- Normalización de texto en dos modos: `literary` (conversión de cifras, fechas, importes y cirílico a palabras) y `conversational` (formas habladas de Taskent).
- Diccionario de palabras inglesas para su lectura correcta en contexto uzbeko.
- Ejecución sin GPU y sin red en Android 7.0+ e iOS 15.1+ (y macOS 14+ en Apple silicon).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Asistentes de voz offline en móvil: la variante Edge (unos 100 MB en Android, 150 MB en iOS) se empaqueta dentro de la app y sintetiza respuestas sin conexión, adecuada para apps de campo, transporte o zonas con conectividad limitada.
- Atención al cliente telefónica automatizada: con el rol `operator` y maneras como `calm` o `empathetic`, el modelo puede generar respuestas de un asistente virtual en uzbeko para centralitas IVR y bots de voz.
- Simuladores de práctica de llamadas: el rol `emotional` con maneras como `angry`, `worried` o `tired` permite recrear interlocutores con carga emocional para entrenamiento de operadores y personal de soporte.
- Audiolibros y narración: el modo de dictado (`dictation`) y la normalización `literary` convierten cifras, fechas e importes en palabras, lo que facilita la lectura automática de textos largos por párrafos cortos.
- Anuncios y avisos con datos variables: la normalización de horas, importes y números de teléfono (por ejemplo, "25-noyabr soat 14:30", "1 250 000 so'm") permite generar locuciones dinámicas para transporte público, comercio o administración.
- Contenido para juegos y narrativa interactiva: las etiquetas `[laugh]`, `[sigh]` y `[pause]` junto con las maneras emocionales permiten dotar de expresividad a personajes sin grabar voces.
- Accesibilidad: lectura en voz alta de contenido textual en uzbeko en navegador mediante WebAssembly, sin instalación de servidor ni GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante Edge, que está diseñada para CPU; no se especifican requisitos de VRAM para la variante Large.
- GPU recomendadas: no disponibles; el modelo está optimizado para CPU y WebAssembly. La variante Large se orienta a servidor o escritorio, sin GPU concreta especificada.
- Cabe en GPU de consumo: sí en la medida en que no requiere GPU; el despliegue previsto es CPU.
- Tamaño en disco: variante Edge de 117 MB (unos 100 MB empaquetada en Android, 150 MB en iOS); el repositorio completo ocupa 1,9 GB.
- Opciones de despliegue: onnxruntime en Python (`runtime/pocket_onnx.py`), onnxruntime-web en navegador (`runtime/web/`), paquete `gapiring` para Python (`pip install gapiring`), paquete npm `gapiring`, artefacto Maven `uz.gapi:gapiring:0.1.2` para Android y Swift package `gapiring-ios` para iOS/macOS.
- Latencia y throughput: no disponibles. El modelo soporta streaming, de modo que el audio empieza a reproducirse antes de completar la síntesis.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros sistemas de TTS en uzbeko en la información proporcionada. A continuación se comparan únicamente características declaradas frente a la referencia de la que deriva:

| Modelo | Parámetros | Idiomas | Formato | Licencia | Despliegue edge |
|---|---|---|---|---|---|
| Gapiring Edge v1 | 110M | uzbeko | ONNX | CC-BY-4.0 | Sí (CPU, navegador, Android, iOS) |
| Gapiring Large v1 | 336M | uzbeko | ONNX | CC-BY-4.0 | Servidor o escritorio |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta uzbeko; no se documenta cobertura de otras lenguas más allá del diccionario de palabras inglesas para su lectura en contexto uzbeko.
- Se recomienda enviar una frase o un párrafo corto por llamada; no se especifica una longitud de contexto formal, por lo que textos largos deben trocearse.
- No hay datos publicados sobre sesgos, tasas de alucinación o errores de pronunciación; al ser un modelo de síntesis de voz, el riesgo principal es la pronunciación incorrecta de términos no cubiertos por el normalizador o el diccionario.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y respetar las condiciones de la licencia.
- El modelo es una derivación de kyutai/pocket-tts; conviene verificar las condiciones de la licencia del modelo base para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada sobre su calidad en producción.
- No se documentan métricas objetivas de calidad (MOS, WER, latencia), lo que dificulta evaluar su idoneidad frente a alternativas sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islomov/gapi-uz-gapiring-v1
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Paquete iOS (Swift): https://github.com/Islomov49/gapiring-ios
- Demo Space (Edge en navegador): islomov/gapi-uz-gapiring-v1 (referenciado en la model card)
