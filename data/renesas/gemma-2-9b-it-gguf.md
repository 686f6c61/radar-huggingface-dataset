# Renesas/Gemma-2-9B-it-GGUF

## Resumen

Gemma-2-9B-it-GGUF es una conversión a formato GGUF (FP16) del modelo google/gemma-2-9b-it, publicada por Renesas para validar su ejecución sobre la NPU NPX6 del SoC para automoción R-Car X5H mediante el SDK npx-llm (una distribución de llama.cpp con backend específico para dicha NPU). No se trata de un modelo nuevo ni de un ajuste fino: los pesos se han convertido desde los originales de Google con `convert_hf_to_gguf.py` sin modificar el contenido, según indica el propio autor. El repositorio existe porque no había disponible públicamente un GGUF en FP16 de este modelo.

El modelo subyacente, Gemma 2 9B instruct, es un transformer decoder-only de aproximadamente 9.240 millones de parámetros (9.241.705.984 según los pesos en safetensors del modelo base), entrenado por Google DeepMind y publicado bajo los Términos de Uso de Gemma. Está orientado a generación de texto conversacional y asistencia en instrucciones, con soporte multilingüe.

La relevancia de esta ficha es doble: por un lado, documenta el único artefacto GGUF FP16 publicado de Gemma 2 9B-it según el autor; por otro, ilustra el flujo de despliegue de un LLM de 9B en hardware embebido de automoción, donde los pesos FP16 no caben en la memoria de la NPU y se requiere cuantización W8A8 en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base google/gemma-2-9b-it) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP16 (F16) en el repositorio; el autor genera Q8_0 con escala por fila (`--q8-0-row-scale`) para ejecucion W8A8 en la NPU |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (`fp16/Gemma-2-9B-it-F16.gguf`, 18,5 GB) |

## Arquitectura y entrenamiento

El artefacto de este repositorio es una conversión directa de los pesos de google/gemma-2-9b-it a GGUF en precisión FP16 mediante `convert_hf_to_gguf.py` de llama.cpp. El autor declara explícitamente que el archivo no sufre ninguna otra modificación respecto a los pesos originales. Por tanto, la arquitectura, los datos de entrenamiento y el proceso de alineación son los del modelo base de Google, y no se detallan en la información disponible.

La innovación técnica relevante de este repositorio no está en el modelo, sino en el pipeline de despliegue: como los pesos FP16 (18,5 GB) no caben en la memoria de la NPU del R-Car X5H, el SDK proporciona `llama-quantize` con la opción `--q8-0-row-scale` para producir un GGUF Q8_0 con una escala por fila, manteniendo las capas `ffn_down` en FP16 (`--tensor-type ffn_down=f16`). La ejecución se realiza en modo W8A8 con `NPX_W8A8=1` y una reserva de memoria de NPU configurable (`NPX_MEMORY_MB=18432`), con atención en FP16 (`-at f16`) y flash attention activada (`-fa on`).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base instruct de Google.
- Razonamiento y respuesta multi-turno en formato chat (etiqueta `conversational` en el repositorio).
- Capacidades multilingües: el modelo base de Gemma 2 es multilingüe, aunque la lista concreta de idiomas no se detalla en la información proporcionada.
- Ejecución en hardware embebido de automoción mediante npx-llm sobre la NPU NPX6 del R-Car X5H.
- Compatibilidad con el ecosistema llama.cpp (formato GGUF, CLI de llama.cpp).
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en el vehículo: el modelo puede ejecutarse íntegramente en la NPU del R-Car X5H, lo que permite interacción en lenguaje natural sin depender de conectividad a la nube, adecuado para asistentes de cabina con requisitos de privacidad y latencia.
- Validación de plataformas de cómputo para automoción: este repositorio sirve como referencia reproducible para verificar que el SDK npx-llm y el backend de la NPX6 ejecutan correctamente un LLM de 9B en W8A8, útil en ciclos de evaluación de hardware.
- Procesamiento de lenguaje natural en el borde (edge): al caber en la memoria de la NPU con cuantización Q8_0 por filas, permite tareas de resumen, clasificación o extracción de información sobre texto local sin salir del dispositivo.
- Integración en pipelines llama.cpp existentes: al ser un GGUF estándar, puede cargarse con herramientas de llama.cpp en equipos de desarrollo para comparar la salida frente a la ejecución en la NPU y depurar diferencias de cuantización.
- Generación de documentación técnica y código asistido en entornos de desarrollo embebido, aprovechando las capacidades instruct del modelo base.
- Base para experimentos de cuantización: el flujo documentado (F16 a Q8_0 con escala por fila) sirve para estudiar el impacto de la cuantización W8A8 en la calidad de salida de un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo FP16 ocupa 18,5 GB, por lo que en GPU requiere al menos ese espacio más overhead de contexto; la variante Q8_0 con escala por fila reduce el peso de los tensores cuantizados a aproximadamente la mitad, aunque las capas `ffn_down` permanecen en FP16.
- Hardware de referencia del repositorio: SoC Renesas R-Car X5H con NPU NPX6, configurada con `NPX_MEMORY_MB=18432` (18 GB) en el ejemplo del autor.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamaño, un GGUF FP16 de 18,5 GB no cabe en GPUs de consumo con 16 GB o menos; sería necesario hardware con 24 GB o más para FP16, o bien recurrir a cuantizaciones menores no publicadas en este repositorio.
- Despliegue: npx-llm (llama.cpp con backend para la NPX6) mediante el SDK distribuido en el portal de clientes de Renesas; el archivo GGUF es estándar y puede usarse con llama.cpp en otras plataformas, aunque esa combinación no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/Gemma-2-9B-it-GGUF | 9,24 B | no disponible | GGUF F16; Q8_0 generado por el usuario | gemma | Hugging Face (Renesas) |
| google/gemma-2-9b-it | 9,24 B | no disponible | safetensors (modelo base) | gemma | Hugging Face (Google) |
| Otras conversiones GGUF de Gemma-2-9B-it | 9,24 B | no disponible | GGUF en varias precisiones | gemma | no disponible en la informacion proporcionada |

La comparativa se limita al modelo base y a conversiones del mismo modelo, ya que la información proporcionada no incluye datos de rendimiento ni alternativas de otros fabricantes con los que contrastar.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora ni ajuste sobre el modelo base: hereda todos los sesgos, riesgos de alucinación y limitaciones de google/gemma-2-9b-it, que no se detallan en la información disponible.
- La licencia Gemma Terms of Use impone condiciones específicas para uso comercial y redistribución; es obligatorio revisarlas antes de desplegar el modelo en producción.
- El flujo de ejecución documentado está ligado al SDK npx-llm y al R-Car X5H; el autor no garantiza ni documenta el comportamiento en otras plataformas.
- La cuantización Q8_0 con escala por fila y `ffn_down` en FP16 puede introducir degradación de calidad respecto al FP16 original; no se publican evaluaciones de dicha degradación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni validación independiente.
- No se especifican los idiomas soportados ni la longitud de contexto en la información proporcionada, datos críticos para dimensionar el despliegue.
- El tamaño del repositorio (18,5 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga y el despliegue en dispositivos embebidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Renesas/Gemma-2-9B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Renesas Electronics (sitio corporativo): https://www.renesas.com/
- Renesas Electronics (Wikipedia): https://en.wikipedia.org/wiki/Renesas_Electronics
