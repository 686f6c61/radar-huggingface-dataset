# DojoWorkspace/Dojo-Speech-v1.0-ggml

## Resumen

Dojo Speech v1.0 (ggml) es un repositorio de modelos de reconocimiento automático del habla (ASR) publicado por Dojo Workspace, la empresa detrás de la aplicación de dictado y espacio de trabajo por voz HeyDojo. El repositorio no contiene modelos entrenados por Dojo: según su propia model card, los ficheros son idénticos byte a byte a las conversiones oficiales de OpenAI Whisper al formato ggml que distribuye el proyecto whisper.cpp, y solo cambian los nombres de fichero. Se trata, por tanto, de una redistribución empaquetada de cinco variantes de Whisper (tiny.en, base.en, small.en, medium.en y large-v3-turbo) que la aplicación usa para dictado y transcripción local.

El interés del repositorio es práctico más que científico: agrupa en un único punto de descarga las cinco tallas de Whisper en formato ggml, con hashes SHA-256 publicados, lo que facilita el despliegue de transcripción en local sin depender de la API de OpenAI. Los ficheros van desde los 77 MB del modelo tiny.en hasta los 1,62 GB del large-v3-turbo, y cubren tanto el caso de inglés ligero en CPU como el multilingüe con mayor precisión.

La relevancia actual reside en la privacidad y el coste: al ejecutarse con whisper.cpp sobre hardware propio, la transcripción no sale del equipo. Ahora bien, al no haber entrenamiento ni ajuste fino propio, cualquier evaluación de calidad debe remitirse a los resultados publicados de los modelos originales de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Whisper (modelos originales de OpenAI), convertido a ggml para whisper.cpp |
| Parametros totales | No disponible en la informacion proporcionada (depende de la variante: tiny, base, small, medium y large-v3-turbo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Whisper procesa ventanas de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | No disponible; el repositorio distribuye ficheros `.bin` en formato ggml sin indicar variantes cuantizadas |
| Idiomas soportados | Cuatro variantes solo en ingles (tiny.en, base.en, small.en, medium.en) y una multilingue (large-v3-turbo) |
| Licencia | MIT |
| Formato de pesos | ggml (ficheros `.bin` para whisper.cpp) |

Tabla de ficheros del repositorio:

| Fichero | Modelo upstream | Idioma | Tamano (bytes) |
|---|---|---|---|
| `Dojo-Speech-v1.0-Tiny-EN.bin` | `ggml-tiny.en.bin` | Ingles | 77.704.715 |
| `Dojo-Speech-v1.0-Base-EN.bin` | `ggml-base.en.bin` | Ingles | 147.964.211 |
| `Dojo-Speech-v1.0-Small-EN.bin` | `ggml-small.en.bin` | Ingles | 487.614.201 |
| `Dojo-Speech-v1.0-Medium-EN.bin` | `ggml-medium.en.bin` | Ingles | 1.533.774.781 |
| `Dojo-Speech-v1.0-Large-v3-Turbo.bin` | `ggml-large-v3-turbo.bin` | Multilingue | 1.624.555.275 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado por OpenAI para transcripción y traducción de voz, que consume espectrogramas Mel de audio y genera texto de forma autorregresiva. El repositorio no aporta información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, porque Dojo no ha entrenado ni ajustado estos modelos; toda esa información corresponde a las fichas de los modelos originales de OpenAI, no incluidas en la documentación proporcionada.

La única transformación aplicada es la conversión al formato ggml que usa whisper.cpp, pensada para inferencia eficiente en CPU y en dispositivos de consumo. La model card afirma explícitamente que los ficheros son idénticos byte a byte a las conversiones upstream y publica el SHA-256 de cada uno, lo que permite verificar la integridad. No se documenta ninguna innovación técnica adicional, como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto (ASR) en local, sin envío de audio a servicios externos.
- Cuatro variantes optimizadas para inglés: tiny, base, small y medium.
- Una variante multilingüe con mayor capacidad: large-v3-turbo.
- Ejecución sobre CPU mediante whisper.cpp, con soporte para GPU según la compilación.
- Verificación de integridad mediante hashes SHA-256 publicados por el autor.
- Integración con el flujo de dictado y transcripción de Dojo Workspace.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá de la propia transcripción.

## Casos de uso

- Dictado en el escritorio: el modelo tiny.en o base.en permite transcribir voz a texto en tiempo real en un portátil sin GPU, con un fichero de 77 a 148 MB y latencia baja en CPU.
- Transcripción de reuniones en inglés: la variante medium.en ofrece mayor precisión sobre audio largo, procesando el audio por segmentos de 30 segundos con whisper.cpp.
- Subtitulado de vídeos en inglés: small.en equilibra tamaño (488 MB) y calidad para generar subtítulos en pipelines de posproducción sin conexión.
- Transcripción multilingüe: large-v3-turbo cubre audio en varios idiomas y resulta adecuada para contenido mixto, a costa de 1,62 GB de fichero.
- Aplicaciones de privacidad estricta: al ejecutarse en local, encaja en entornos sanitarios, legales o corporativos donde el audio no puede salir del equipo.
- Prototipado de asistentes de voz: el formato ggml permite integrar la transcripción en aplicaciones de escritorio o embebidas mediante la librería whisper.cpp.
- Archivado y búsqueda de audio: transcripción por lotes de grabaciones para indexar y buscar contenido textualmente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, MMLU ni de ningún otro tipo, y al tratarse de conversiones idénticas a los modelos originales de OpenAI, cualquier dato de calidad debería consultarse en las fichas de `openai/whisper-*` y en el paper de Whisper, no en este repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; en la práctica, whisper.cpp puede ejecutar estas variantes en CPU con memoria RAM proporcional al tamaño del fichero (desde unos 100 MB para tiny hasta unos 2 GB para large-v3-turbo).
- GPU recomendadas: no especificadas por el autor; whisper.cpp admite aceleración CUDA, Metal y Vulkan según la compilación.
- GPU de consumo: las variantes tiny, base y small son aptas para equipos sin GPU dedicada; medium y large-v3-turbo se benefician de GPU con al menos varios GB de memoria.
- Opciones de despliegue: whisper.cpp (librería nativa), bindings de whisper.cpp y la aplicación Dojo Workspace.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dojo Speech v1.0 (ggml) | No disponible (5 variantes) | Segmentos de 30 s | Ingles y multilingue (large-v3-turbo) | MIT | ggml |
| OpenAI Whisper (original) | No disponible | Segmentos de 30 s | Multilingue | MIT | PyTorch |
| whisper.cpp (conversiones oficiales) | No disponible | Segmentos de 30 s | Ingles y multilingue | MIT | ggml |

La comparativa relevante es que Dojo Speech v1.0 es funcionalmente equivalente a las conversiones oficiales de whisper.cpp, con la diferencia de nombres de fichero y la publicación de hashes. No se dispone de datos de rendimiento propios para comparar calidad frente a alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado por Dojo: es una redistribución renombrada de conversiones de whisper.cpp, por lo que no aporta mejoras de calidad respecto a los originales.
- Cuatro de las cinco variantes solo transcriben inglés; solo large-v3-turbo es multilingüe.
- Riesgo de alucinación inherente a Whisper, especialmente en audio con ruido, silencios largos o habla no inglesa.
- Sesgos heredados de los datos de entrenamiento de OpenAI, no documentados en esta ficha.
- Licencia MIT, que permite uso comercial, pero conviene revisar las condiciones de los modelos originales de OpenAI y de whisper.cpp.
- Sin métricas de evaluación publicadas en el repositorio; la selección de variante debe basarse en los benchmarks de los modelos upstream.
- Repositorio con cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte documentado más allá de la model card.
- La fecha de creación indicada (2026-11-06) resulta anómala y conviene verificarla antes de citarla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DojoWorkspace/Dojo-Speech-v1.0-ggml
- Sitio de HeyDojo: https://heydojo.ai/
- Whisper de OpenAI (código): https://github.com/openai/whisper
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
