# Reza2kn/gooya-bozorg-v1.5-native

## Resumen

Gooya Bozorg 1.5 Native Runtime Bundle es un paquete de ejecución nativa para el modelo de síntesis de voz en persa (farsi) Gooya Bozorg 1.5, desarrollado por Reza2kn (Reza Sayar). Este bundle convierte el modelo original en un conjunto de artefactos ONNX Runtime y tract listos para desplegarse en dispositivos sin necesidad de entorno Python, lo que facilita su integración en aplicaciones de escritorio, web o embebidas.

El paquete incluye un transformador de tokens de habla (T3), un denoiser de flow matching y un vocoder HiFT, todo cuantizado a Q4 int4 (~430 MB) para reducir el uso de memoria y mejorar la eficiencia. Está diseñado para funcionar en macOS, Linux y Windows, tanto en CPU como en GPU, con una latencia de aproximadamente 12 segundos para un prompt canónico en Apple Silicon CPU. Su relevancia radica en ofrecer una solución TTS en persa de alta calidad, con licencia CC-BY-NC-4.0, orientada a investigación y uso creativo no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de tokens de habla (T3) + flow matching + vocoder HiFT (no se detalla la arquitectura completa del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (bucket b168, hasta 168 tokens de habla) |
| Tipos de cuantizacion | Q4 int4 (MatMulNBits, block 32) |
| Idiomas soportados | Persa (farsi) |
| Licencia | CC-BY-NC-4.0 (modelo y runtime) |
| Formato de pesos | ONNX (con pesos externos) y bundle tract |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo Gooya Bozorg 1.5 original. El bundle de runtime expone tres componentes principales: un transformador de tokens de habla (T3) que gestiona el prefill y decode de los tokens acústicos, un módulo de flow matching (s3-flow-prepare y s3-flow-step) que condiciona y denoisa la representación latente, y un vocoder HiFT (excitación y cabezal espectral) que genera la forma de onda final. Los pesos están cuantizados a Q4 int4 con bloques de 32, lo que reduce el tamaño a ~430 MB.

No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. El tokenizer incluido es un BPE de grafemas expandido (grapheme_mtl_merged_expanded_v1.json), lo que sugiere un enfoque de modelado a nivel de grafema para el persa.

## Capacidades

- Sintesis de voz en persa (farsi) con calidad natural, basada en el modelo Gooya Bozorg 1.5.
- Clonacion de voz: el modelo base soporta voice cloning (segun los tags de HuggingFace), aunque el bundle no incluye el pipeline de clonacion completo.
- Ejecucion totalmente en dispositivo (on-device) sin dependencias de Python, gracias a ONNX Runtime y tract.
- Soporte multiplataforma: macOS, Linux y Windows, con aceleracion por CPU o GPU segun el sistema operativo.
- Cuantizacion Q4 int4 que permite ejecucion eficiente en hardware modesto.
- Integrable en aplicaciones Rust (mediante el fetcher de assets y la webview) o como libreria embebida.
- Capacidad de procesar secuencias de hasta 168 tokens de habla (bucket b168), suficiente para frases u oraciones de longitud media.

## Casos de uso

- Asistentes de voz en persa para aplicaciones de escritorio o moviles: el bundle puede integrarse en un backend Rust o en una webview para generar respuestas habladas en tiempo real, aprovechando la baja latencia en CPU de Apple Silicon.
- Audiolibros y narracion automatizada: se puede utilizar para convertir textos largos en persa a audio, procesando por fragmentos dentro del limite de 168 tokens de habla.
- Accesibilidad para personas con discapacidad visual: permite leer en voz alta contenido digital (noticias, libros, interfaces) en persa, sin necesidad de conexion a internet.
- Sistemas de navegacion GPS en persa: generar instrucciones de voz paso a paso con una voz natural, ejecutandose localmente en el dispositivo del vehiculo.
- Educacion y aprendizaje de idiomas: crear materiales de pronunciacion en persa, generando audio a partir de texto para ejercicios de escucha.
- Entretenimiento y creacion de contenido: doblaje de videos o podcasts en persa, usando la clonacion de voz del modelo base (si se implementa el pipeline adicional) para producir voces personalizadas.
- Prototipado rapido de aplicaciones TTS en Rust: el fetcher de assets y la webview permiten desarrollar y probar aplicaciones de voz sin configurar un entorno Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica conocida es la latencia de ~12 segundos para un prompt canonico en Apple Silicon CPU, lo que sugiere un rendimiento adecuado para uso interactivo, aunque no se especifican condiciones exactas (longitud del prompt, modelo de chip, etc.).

## Requisitos de hardware

- El bundle pesa ~430 MB en disco (0.8 GB el repositorio completo), por lo que requiere al menos 1 GB de almacenamiento libre.
- Memoria RAM: se estima que el modelo cuantizado Q4 necesita entre 500 MB y 1 GB de RAM para inferencia, dependiendo de la longitud de la secuencia.
- GPU: no es obligatoria; el runtime soporta CPU en todas las plataformas. En macOS se puede usar Metal, en Windows DirectML y en Linux CUDA (no se especifica en la documentacion, pero es lo habitual en ONNX Runtime).
- GPU recomendadas: cualquier GPU integrada o dedicada con al menos 1 GB de VRAM puede acelerar la inferencia; se recomienda una GPU moderna de gama media (p. ej., NVIDIA GTX 1650 o superior) para tiempos de respuesta inferiores a 12 segundos.
- En Apple Silicon (M1/M2/M3), la CPU es suficiente y proporciona la latencia anunciada de ~12 s.
- Opciones de despliegue: se proporciona un binario Rust (gooya-fetch-assets) para descargar los assets, y una aplicacion webview (gooya-native-webview) para probar el modelo. Tambien se puede integrar como libreria en proyectos Rust o mediante ONNX Runtime en otros lenguajes (C++, C#, etc.).
- Latencia y throughput: no se dispone de mediciones detalladas; el unico dato es ~12 s por prompt en Apple Silicon CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo Gooya Bozorg 1.5 parece ser un TTS en persa con capacidades de clonacion de voz, pero no se han encontrado referencias a alternativas como Parastoo, FarsiTTS u otros modelos persas en los resultados de busqueda. Por tanto, no es posible realizar una comparativa objetiva en este momento.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: uso exclusivamente no comercial. Cualquier aplicacion comercial requiere autorizacion explicita del autor.
- Idioma limitado: solo persa (farsi). No soporta otros idiomas de forma nativa.
- Longitud de secuencia limitada: el bucket b168 restringe la generacion a 168 tokens de habla, lo que puede ser insuficiente para parrafos largos; es necesario segmentar el texto.
- Latencia de ~12 s en CPU: puede ser excesiva para aplicaciones de tiempo real estricto, aunque es aceptable para interacciones conversacionales.
- Sin informacion sobre sesgos o errores de pronunciacion: no se han publicado estudios sobre la robustez del modelo ante dialectos, acentos o ruido.
- Dependencia de ONNX Runtime y tract: el bundle requiere que estas librerias esten disponibles en el sistema, aunque se incluyen en el repositorio.
- No se incluye el pipeline de clonacion de voz: el bundle solo contiene el runtime de sintesis; la clonacion requiere el modelo base y un procesamiento adicional no documentado en este repositorio.
- Sin garantias de soporte: el proyecto parece mantenido por un unico autor (Reza2kn), con 0 descargas y 0 likes en HuggingFace, lo que indica una adopcion muy limitada.

## Enlaces

- Bundle de runtime: https://huggingface.co/Reza2kn/gooya-bozorg-v1.5-native
- Modelo base Gooya Bozorg 1.5: https://huggingface.co/Reza2kn/Gooya-Bozorg-v1.5
- Repositorio GitHub del autor: https://github.com/Reza2kn
- Documentacion del runtime: https://github.com/Reza2kn/gooya-bozorg-native
- Modelo anterior Gooya v1: https://huggingface.co/Reza2kn/gooya-v1
- Version ONNX int4 de Gooya v1: https://huggingface.co/Reza2kn/gooya-v1-ONNX-int4
