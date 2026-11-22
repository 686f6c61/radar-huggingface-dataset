# echolinkstudios/kokoro-v1.0.onnx

## Resumen

Kokoro v1.0 ONNX es un re-host del modelo de síntesis de voz Kokoro v1.0 en formato ONNX (precisión f32), publicado por Echolink Studios para su uso en dispositivos Echo. No se trata de un modelo nuevo ni de un ajuste fino: es una copia byte a byte de los artefactos del release `model-files-v1.1` del repositorio `thewh1teagle/kokoro-onnx`, que a su vez exporta los pesos originales de `hexgrad/Kokoro-82M`. El objetivo declarado es permitir que los dispositivos descarguen el par de ficheros (modelo y voces) en el momento de la configuración, en lugar de empaquetar unos 354 MB dentro del repositorio de la aplicación.

El modelo subyacente, Kokoro-82M, es un TTS de 82 millones de parámetros con licencia Apache-2.0, orientado a inferencia en dispositivo. Este repositorio concreto incluye dos activos: `kokoro-v1.0.onnx` (325.505.369 bytes) y `voices-v1.0.bin` (28.214.398 bytes), un archivo NumPy `.npz` con 54 vectores de estilo de voz. La exportación embebe `config.json` en los metadatos del grafo, incorpora una salida de duración y una entrada float `speed`, lo que permite a `kokoro-onnx` 0.6.0+ generar marcas de tiempo con `create_timed()` y síntesis por ventana deslizante con `create(continuous=True)`.

Es relevante ahora porque ofrece un camino reproducible (checksums SHA-256 publicados) para desplegar TTS en inglés sobre CPU en dispositivos con recursos limitados, sin depender de frameworks de deep learning pesados. Su alcance es deliberadamente estrecho: inglés, 54 voces fijas y uso previsto en altavoces inteligentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS Kokoro-82M; exportación ONNX) |
| Parametros totales | 82M (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 (esta exportación); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`) + voces en NumPy `.npz` (`.bin`) |
| Tamano del repo | 0,4 GB |
| Tamano del modelo | 325.505.369 bytes (~325 MB) |
| Tamano del bundle de voces | 28.214.398 bytes (~28 MB) |
| Numero de voces | 54 vectores de estilo |
| Libreria | kokoro-onnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Kokoro-82M; este repositorio es únicamente una exportación ONNX de los pesos originales. Lo que sí se documenta es el proceso de exportación: se generó con `scripts/export.py` del proyecto `thewh1teagle/kokoro-onnx`, y el grafo resultante embebe `config.json` en los metadatos, por lo que no es necesario pasar `vocab_config` al cargarlo. La exportación añade una salida de duración y una entrada float `speed`, que la librería `kokoro-onnx` 0.6.0+ aprovecha para timestamps y síntesis por ventana deslizante.

No se proporcionan datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO. La model card indica que los datos de entrenamiento de Kokoro incluyen audio con licencia CC BY, aunque aclara que esa circunstancia afecta a los datos y muestras, no a la licencia de los pesos publicados. Los ficheros de este repositorio son copias sin modificar de los activos del release upstream, verificables mediante SHA-256.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- 54 voces predefinidas mediante vectores de estilo indexados por nombre.
- Control de velocidad mediante la entrada float `speed`.
- Generación de marcas de tiempo mediante `create_timed()` (requiere `kokoro-onnx` 0.6.0+).
- Síntesis por ventana deslizante con `create(continuous=True)` para textos largos.
- Inferencia en CPU y en dispositivo, sin necesidad de GPU.
- Carga autocontenida del grafo: `config.json` embebido, sin argumento `vocab_config`.
- No soporta clonación de voz a partir de una muestra corta.
- No soporta tool calling, agentes ni razonamiento multi-step (no es un LLM).
- No soporta visión ni audio de entrada; únicamente texto a audio.
- Multilingüismo limitado al inglés en esta versión (la v1.1 chino/inglés no está incluida).

## Casos de uso

- Síntesis de voz en altavoces inteligentes Echo: el modelo está pensado para descargarse en el dispositivo durante la configuración y ejecutar TTS local en CPU, evitando enviar texto a servicios en la nube.
- Lectura de notificaciones y alertas del hogar: con 54 voces y control de `speed`, se puede asignar una voz distinta a cada tipo de evento y ajustar la velocidad para mensajes cortos.
- Audiolibros o lectura de artículos largos en dispositivo: `create(continuous=True)` permite trocear textos extensos en ventanas sin cortes bruscos, manteniendo la coherencia de la voz.
- Subtitulado y alineación temporal: `create_timed()` devuelve marcas de tiempo por fragmento, útiles para generar subtítulos o sincronizar audio con texto en aplicaciones de accesibilidad.
- Asistentes de accesibilidad offline: al ejecutarse en CPU y sin dependencias de red, encaja en lectores de pantalla o dispositivos de ayuda para personas con discapacidad visual en entornos sin conectividad.
- Pruebas de integración en CI: los checksums SHA-256 publicados permiten fijar una revisión concreta y verificar la integridad de los artefactos en pipelines de despliegue de firmware.
- Prototipado de interfaces de voz: la licencia Apache-2.0 y el tamaño reducido (~354 MB en total) facilitan incorporar TTS en demos y productos comerciales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. En GPU, el fichero ONNX f32 ocupa ~325 MB, por lo que cabría en cualquier GPU con al menos ~1 GB de memoria libre, aunque no es el escenario previsto.
- GPU recomendadas: no disponibles; el uso previsto es en dispositivo (altavoces Echo) sobre CPU.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU de consumo moderna por tamaño, pero no se documentan requisitos ni rendimiento en GPU.
- Despliegue: librería `kokoro-onnx` (Python, licencia MIT) sobre runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: la model card indica que la latencia en CPU depende del dispositivo y que no hay garantías de streaming; no se publican cifras concretas.
- Almacenamiento: ~354 MB para el par modelo + voces.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. A nivel estructural, las alternativas habituales de TTS open source de tamaño similar (por ejemplo, variantes de Piper o Coqui TTS) no aparecen mencionadas en la documentación de este repositorio, por lo que no se ofrece una tabla comparativa con cifras verificables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro v1.0 ONNX (este repo) | 82M | no disponible | en | Apache-2.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conjunto fijo de 54 voces; no hay clonación de voz a partir de una muestra corta.
- Solo inglés: la versión v1.1 (chino/inglés) no está incluida en este repositorio.
- La calidad de salida varía según la voz y el texto; la model card recomienda revisar siempre el audio usado en producción.
- La latencia en CPU depende del dispositivo y no hay garantías de streaming.
- Uso previsto restringido a TTS en inglés en altavoces Echo; no destinado a clonación de voz, suplantación de identidad ni anuncios de seguridad crítica.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede haber errores de pronunciación o prosodia en textos no revisados.
- Licencia Apache-2.0 permite uso comercial, pero deben incluirse el fichero `LICENSE` de Apache-2.0 y los avisos de copyright upstream.
- Los datos de entrenamiento de Kokoro incluyen audio CC BY; conviene revisar las obligaciones de atribución si se redistribuyen muestras derivadas.
- La propia model card advierte de que el texto fue generado por IA y puede contener imprecisiones; verificar la información crítica con la fuente original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un re-host reciente (creado el 22 de noviembre de 2026) sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/echolinkstudios/kokoro-v1.0.onnx
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Release de origen (thewh1teagle/kokoro-onnx, model-files-v1.1): https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1
- Repositorio thewh1teagle/kokoro-onnx: https://github.com/thewh1teagle/kokoro-onnx
