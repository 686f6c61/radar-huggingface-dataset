# mashbox-labs/maya1-TPU

## Resumen

maya1-TPU es una redistribución de los pesos del modelo de síntesis de voz maya1, desarrollado originalmente por Maya Research, publicada por mashbox-labs como un único fichero GGUF en BF16 junto con el decodificador SNAC de 24 kHz convertido a arrays NumPy. El modelo resuelve la generación de voz a partir de una descripción textual de la voz y del texto a pronunciar: maya1 produce códigos de audio SNAC y el decodificador SNAC los convierte en audio a 24 kHz. Esta versión no añade capacidades nuevas, sino que empaqueta los pesos en un formato legible por herramientas estándar de Python.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de conversión de formato, no de un modelo nuevo. El propio autor advierte de que el paquete `mashbox` en su versión 0.1.10 no incluye un comando `mashbox run` para este modelo y que, para generar voz, hay que ejecutar los pesos originales con el ejemplo de Transformers de Maya Research, que requiere una GPU CUDA. El GGUF carece de tokenizador, por lo que llama.cpp no puede cargarlo de forma autónoma.

El modelo tiene 3.300.928.576 parámetros (aproximadamente 3,3 mil millones), arquitectura tipo llama con 28 bloques, y se distribuye bajo licencia Apache-2.0. El decodificador SNAC se distribuye bajo licencia MIT. El repositorio ocupa 6,7 GB y acumula 44 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama, 28 bloques (modelo de lenguaje que emite códigos SNAC) |
| Parametros totales | 3.300.928.576 (aproximadamente 3,3 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (fichero GGUF); normas y factores de rope en F32; decodificador SNAC en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (maya1); MIT (decodificador SNAC) |
| Formato de pesos | GGUF (maya1-BF16.gguf), NPZ con arrays NumPy (snac_24khz_decoder.npz) |

## Arquitectura y entrenamiento

maya1 es un modelo de lenguaje con arquitectura tipo llama de 28 bloques que actúa como generador de códigos de audio: recibe una descripción de voz y el texto a sintetizar, y emite códigos SNAC que posteriormente se decodifican a audio PCM de 24 kHz. El decodificador SNAC (hubertsiuzdak/snac_24khz) contiene los codebooks del cuantizador y la red de decodificación, con 104 arrays en float32. La conversión publicada en este repositorio mantiene los pesos en BF16 y conserva en F32 las normas y los factores de rope.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta redistribución no los detalla y solo remite al repositorio original. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El GGUF incluye los pesos y los ajustes del modelo, pero no el tokenizador; el tokenizador, la plantilla de chat, el formato de descripción de voz (`prompt.txt`) y la lista de emociones (`emotions.txt`) residen en el repositorio original maya-research/maya1.

## Capacidades

- Síntesis de voz (text-to-speech) condicionada por una descripción textual de la voz y por el texto a pronunciar.
- Generación de códigos de audio SNAC que se decodifican a audio de 24 kHz mediante el decodificador incluido.
- Control de emoción inline: la documentación upstream lista 17 etiquetas de emoción, como `<laugh>` y `<whisper>`, que se insertan en el texto.
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Generación de voces sintéticas para narración de contenidos: el modelo permite describir el timbre y el estilo de la voz en lenguaje natural y sintetizar el texto deseado, lo que facilita producir locuciones con una identidad vocal consistente sin grabar a un hablante.
- Doblaje y localización de material audiovisual: al aceptar descripciones de voz y etiquetas de emoción inline, se puede ajustar el tono (por ejemplo, `<whisper>` para pasajes susurrados) en función de la escena.
- Audiolibros y podcasts automatizados: la posibilidad de insertar etiquetas de emoción en el texto permite variar la interpretación a lo largo de un capítulo largo sin cambiar de modelo.
- Prototipado de asistentes conversacionales con voz: el modelo se puede integrar como etapa de síntesis en un pipeline de voz, siempre que se resuelva la parte de reconocimiento y de gestión del diálogo por separado.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o para hacer accesibles contenidos escritos, con control del estilo de locución mediante la descripción de voz.
- Investigación en síntesis de voz: al estar los pesos en GGUF y el decodificador en NPZ, resulta útil para experimentar con cargas en Python estándar, inspeccionar tensores y estudiar la interfaz entre el modelo de lenguaje y el códec SNAC.
- Evaluación comparativa de códecs neuronales: el decodificador SNAC de 24 kHz se puede reutilizar con otros generadores de códigos para comparar calidad de reconstrucción de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF en BF16 ocupa 6,60 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, más el espacio adicional para el decodificador SNAC (52,5 MB) y para las activaciones y el contexto.
- GPU recomendadas: la model card indica que el ejemplo de inferencia de Maya Research con Transformers requiere una GPU CUDA. No se especifican modelos concretos de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si cabe en tarjetas como la RTX 4090 u otras.
- Opciones de despliegue: el GGUF se puede abrir con `GGUFReader` del paquete `gguf`, y el decodificador con `numpy.load`. llama.cpp no puede cargar el GGUF de forma autónoma porque no incluye tokenizador. El paquete `mashbox` 0.1.10 no ofrece un comando `run` para este modelo. La vía documentada para generar voz es el ejemplo de Transformers del repositorio original, con GPU CUDA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| maya1-TPU (esta ficha) | 3,3 mil millones | no disponible | Apache-2.0 (maya1) y MIT (SNAC) | GGUF BF16 y NPZ | Redistribución de pesos; sin tokenizador en el GGUF |
| maya-research/maya1 | 3,3 mil millones (mismo modelo) | no disponible | Apache-2.0 | safetensors | Repositorio original; incluye tokenizador, plantilla de chat y listas de emociones |
| hubertsiuzdak/snac_24khz | no disponible | no disponible | MIT | pytorch_model.bin | Códec y decodificador de audio, no un modelo de lenguaje |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de maya1 con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo listo para usar: el GGUF no contiene tokenizador, por lo que llama.cpp no puede cargarlo por sí solo y es necesario obtener el tokenizador, la plantilla de chat, `prompt.txt` y `emotions.txt` del repositorio original.
- El paquete `mashbox` 0.1.10 no incluye comando de ejecución para este modelo; la única vía documentada de inferencia es el ejemplo de Transformers de Maya Research, que exige GPU CUDA.
- No se documentan los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas sin evaluación previa.
- No se documenta la longitud de contexto, dato relevante para textos largos.
- Riesgo de alucinación y de artefactos de audio: no se documenta ninguna evaluación de calidad, naturalidad ni robustez ante entradas fuera de distribución.
- Sesgos conocidos: no disponible.
- Licencia: maya1 se declara Apache-2.0 según la model card del repositorio original, que no incluye un fichero de licencia separado; conviene verificar este extremo antes de un uso comercial. El decodificador SNAC es MIT y su fichero de licencia se incluye sin modificaciones.
- El repositorio tiene un volumen de descargas muy bajo (44) y ninguna valoración, lo que reduce la evidencia comunitaria sobre su funcionamiento en producción.
- La fecha de creación y actualización del repositorio figura como 2026-10-30, dato que conviene contrastar con el repositorio original antes de fijar una versión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mashbox-labs/maya1-TPU
- Modelo original: https://huggingface.co/maya-research/maya1/tree/b1b9b38ca9decbfcfd6c98ea93dd502bfd0f9572
- Ejemplo de inferencia con Transformers: https://huggingface.co/maya-research/maya1/blob/b1b9b38ca9decbfcfd6c98ea93dd502bfd0f9572/README.md#transformers-inference-example
- Códec de audio SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz/tree/d73ad176a12188fcf4f360ba3bf2c2fbbe8f58ec
- Repositorio de código SNAC: https://github.com/hubertsiuzdak/snac/blob/8f79a718f1ad71f94f79999f0071348227aff22e/LICENSE
- Paquete mashbox en PyPI: https://pypi.org/project/mashbox/0.1.10/
- Repositorio GitHub de mashbox-labs: https://github.com/mashbox-labs/mashbox
- Perfil en X de mashbox: https://x.com/mashboxgg
