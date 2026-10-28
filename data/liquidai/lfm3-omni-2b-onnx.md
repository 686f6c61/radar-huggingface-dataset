# LiquidAI/LFM3-Omni-2B-ONNX

## Resumen

LFM3-Omni-2B-ONNX es la distribucion en formato ONNX del modelo LFM3-Omni-2B de Liquid AI, un modelo any-to-any (entrada y salida multimodal) de aproximadamente 2.000 millones de parametros disenado para inferencia en dispositivo, en el borde y en servidor. Liquid AI es una empresa estadounidense surgida del MIT que desarrolla la familia de Liquid Foundation Models (LFM), orientada a modelos compactos con baja latencia y ejecucion local. Esta version ONNX no anade pesos nuevos: es una conversion cuantizada del modelo original pensada para ejecutarse con ONNX Runtime en plataformas diversas (CPU, GPU y aceleradores compatibles con el estandar ONNX).

El interes practico de esta publicacion (subida en octubre de 2026) es que desacopla el modelo de un stack de inferencia concreto: el repositorio incluye, para cada precision, un decoder de lenguaje, un encoder de vision, un encoder de audio y un decoder de codec, mas un depth decoder comun en float32. Eso permite construir pipelines completos de voz a voz (speech-to-speech), comprension de imagen y audio, y generacion multimodal sobre ONNX Runtime, con un peso conjunto de solo 2,91 GB en q4 y 3,73 GB en q8.

La relevancia ahora mismo esta en la combinacion de tres factores: tamano pequeno (2B), cobertura de 23 idiomas (entre ellos el espanol) y un formato de despliegue portable. Frente a alternativas multimodales de mayor tamano, este modelo prioriza coste de inferencia y huella de memoria, lo que lo hace candidato para aplicaciones de asistente local, transcripcion y sintesis de voz integradas, y prototipado rapido en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (Liquid AI); la distribucion ONNX separa decoder, vision encoder, audio encoder, codec decoder y depth decoder. Detalle interno de la arquitectura base (transformer, MoE o hibrida) no disponible en la informacion proporcionada |
| Parametros totales | ~2B (segun el nombre del modelo; no se desglosa en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (decoder q4 + vision encoder q8), q8 (decoder q8 + vision encoder fp16); vision encoder tambien en fp16; depth decoder en float32; audio encoder y codec decoder en el formato distribuido por el autor |
| Idiomas soportados | 23: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | ONNX (ONNX Runtime); modelo base tambien disponible en otros formatos en LiquidAI/LFM3-Omni-2B |
| Tamano del repositorio | 21,1 GB (incluye todas las precisiones y componentes) |
| Tamano por precision (conjunto completo) | 2,91 GB (q4) / 3,73 GB (q8) |
| Pipeline declarado | any-to-any |
| Fecha de publicacion | 27 de octubre de 2026 (actualizado el 28 de octubre de 2026) |

## Arquitectura y entrenamiento

La model card de esta distribucion no documenta la arquitectura interna del modelo base; remite explicitamente a la ficha de LiquidAI/LFM3-Omni-2B para los detalles de arquitectura y uso. Lo que si se deduce de los artefactos publicados es una topologia modular multimodal: un decoder de lenguaje comun a todas las precisiones, un encoder de vision (en q8 o fp16 segun la variante), un encoder de audio y un decoder de codec para la salida de audio, mas un depth decoder en float32 compartido que se ejecuta en todas las precisiones y que esta incluido en los tamanos indicados.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla si el modelo emplea mecanismos de atencion lineal, decodificacion especulativa u otras optimizaciones propias de la familia LFM. Cualquier afirmacion sobre estos puntos requeriria consultar la ficha del modelo original o la documentacion tecnica de Liquid AI.

La innovacion tecnica verificable en este repositorio es la ingenieria de despliegue: la separacion en grafos ONNX independientes por modalidad permite cargar solo los componentes necesarios (por ejemplo, prescindir del encoder de vision en un caso de uso puramente vocal), y la mezcla de precisiones por componente (q4 para el decoder, q8 o fp16 para el encoder de vision, float32 para el depth decoder) busca un equilibrio entre calidad y huella de memoria en CPU.

## Capacidades

- Generacion de texto y razonamiento en 23 idiomas, incluido el espanol.
- Entrada y salida multimodal (any-to-any): el pipeline declarado combina texto, vision y audio.
- Comprension de imagen mediante el vision encoder incluido en el repositorio.
- Comprension de audio mediante el audio encoder.
- Salida de audio sintetizado mediante el codec decoder, lo que habilita interacciones de voz a voz.
- Procesamiento de profundidad o informacion espacial a traves del depth decoder (float32) presente en todas las precisiones.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz locales: el par audio encoder + decoder + codec decoder permite construir un pipeline de speech-to-speech completo que corre sobre ONNX Runtime en CPU, apto para dispositivos sin GPU dedicada y con requisitos de privacidad estrictos.
- Subtitulado y transcripcion multilingue: con 23 idiomas cubiertos y un decoder de 2B en q8 (3,73 GB en total), se puede transcribir audio y generar texto en el mismo grafo sin depender de servicios externos.
- Descripcion de imagenes para accesibilidad: el vision encoder en q8 o fp16 se combina con el decoder para generar descripciones en tiempo real de fotografias o flujos de camara en aplicaciones moviles o de escritorio.
- Automatizacion de atencion al cliente por voz: un asistente telefonico que escucha, razona y responde con voz sintetizada, desplegado con ONNX Runtime en infraestructura propia; el tamano reducido permite escalar horizontalmente con coste por instancia bajo.
- Procesamiento por lotes en el borde: clasificacion y anotacion de audio e imagen en dispositivos como mini-PC, Raspberry Pi o portatiles, donde un modelo de 2B cuantizado a q4 (2,91 GB) evita el envio de datos a la nube.
- Prototipado de aplicaciones multimodales multiplataforma: al ser ONNX, el mismo artefacto se puede ejecutar en Windows, Linux, macOS y entornos embebidos compatibles, lo que simplifica el desarrollo de demos y pruebas de concepto sin reescribir el codigo de inferencia.
- Analisis de reuniones y notas de voz: combinacion de transcripcion y resumen en el mismo modelo, con salida de audio opcional para generar un resumen hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta distribucion ONNX no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion multimodal, y remite a la ficha del modelo original, cuyos resultados no se han proporcionado en esta busqueda.

## Requisitos de hardware

- VRAM estimada: el conjunto completo ocupa 2,91 GB en q4 y 3,73 GB en q8, incluyendo depth decoder en float32. A esa cifra hay que sumar el espacio de activaciones y la cache de atencion, que dependen de la longitud de contexto (no documentada).
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) puede alojar ambas precisiones con margen amplio. En 4-6 GB (GTX 1650, RTX 3050) el q4 es viable dejando espacio para activaciones.
- Ejecucion en CPU: el autor etiqueta explicitamente las variantes q4 y q8 como destino CPU, lo que habilita despliegue sin acelerador.
- GPU de datacenter (A100, H100, L40S): utiles para servir muchas peticiones concurrentes o lote grande, no por requisito de memoria.
- Opciones de despliegue: ONNX Runtime (libreria declarada del repositorio). Otros runtimes compatibles con ONNX podrian utilizarse, pero no se confirman en la informacion disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al tratarse de un grafo ONNX multimodal es improbable que funcionen sin adaptacion.
- Latencia y throughput: no disponibles. Dependeran del hardware, del componente invocado (el encoder de audio y el decoder de codec anaden coste por peticion) y de la precision elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| LFM3-Omni-2B-ONNX (este) | ~2B | no disponible | Texto, vision, audio (entrada y salida) | lfm1.0 (`other`) | ONNX / ONNX Runtime |
| LiquidAI/LFM3-Omni-2B (modelo base) | ~2B | no disponible | Texto, vision, audio | lfm1.0 | Formatos nativos de Liquid AI (no detallados aqui) |
| Qwen2.5-Omni | variantes de 3B y 7B | no verificada en esta busqueda | Texto, vision, audio (incluye voz) | no verificada en esta busqueda | pesos HF, vLLM y otros |
| MiniCPM-o 2.6 | ~8B | no verificada en esta busqueda | Texto, vision, audio | no verificada en esta busqueda | pesos HF |

Los datos de los modelos alternativos no se han verificado en la informacion proporcionada y se incluyen solo como referencia de categoria; para una comparacion rigurosa de rendimiento seria necesario consultar sus fichas tecnicas. La ventaja diferencial de este modelo es el tamano (2B) y la disponibilidad de artefactos ONNX cuantizados con todos los componentes multimodales, algo poco habitual en la categoria.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no se puede estimar la calidad relativa frente a otros modelos multimodales sin consultar la ficha del modelo base.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con conversaciones largas o documentos extensos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; especialmente relevante en tareas de transcripcion o descripcion de imagenes donde el modelo puede inventar contenido no presente en la entrada.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible. Un modelo entrenado con datos multilingues de 23 idiomas puede tener cobertura y calidad desigual entre ellos; el espanol figura en la lista, pero no se especifica su nivel de rendimiento.
- Licencia lfm1.0: es una licencia propia etiquetada como `other`, no una licencia open source estandar. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las condiciones de redistribucion y de uso en produccion no se detallan en la informacion proporcionada.
- Naturaleza cuantizada: las variantes q4 y q8 pueden degradar la calidad respecto al modelo en precision completa, particularmente en tareas de razonamiento o en la fidelidad del audio generado.
- Dependencia de ONNX Runtime: el despliegue esta atado a este runtime; funciones de decodificacion, muestreo y gestion de cache deben implementarse en el codigo de la aplicacion, lo que anade complejidad frente a un servidor de inferencia llm habitual.
- Repositorio de 21,1 GB: descargar el repositorio completo es costoso; conviene descargar solo los archivos de la precision necesaria.
- No se confirma soporte de tool calling ni de razonamiento agentico multi-paso; no deberia asumirse en disenos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-Omni-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Sitio de Liquid AI: https://www.liquid.ai/
- Pagina de modelos de Liquid AI: https://www.liquid.ai/models
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/talk
- Consola / API: https://console.liquid.ai/dashboard
- Organizacion en HuggingFace: https://huggingface.co/LiquidAI
- Wikipedia: https://en.wikipedia.org/wiki/Liquid_AI
