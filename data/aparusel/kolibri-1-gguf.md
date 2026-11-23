# aparusel/kolibri-1-gguf

## Resumen

Kolibri-1 GGUF es una conversión cuantizada del modelo Aleph-Alpha/Kolibri-1, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Aleph Alpha GmbH. El modelo original cuenta con 78.103.074.560 parámetros totales, de los cuales 3,46 mil millones están activos por token, y está especializado en razonamiento y tool calling en alemán e inglés. Esta versión, publicada por el usuario aparusel, redistribuye los pesos en formato GGUF propietario de DwarfStar (`ds4`) en tres cuantizaciones: Q8, Q4 y Q2.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo mediante cuantización agresiva, aunque con una restricción importante: los ficheros no son compatibles con llama.cpp genérico y requieren el motor de inferencia `ds4`, actualmente disponible solo en un fork no fusionado upstream. El modelo base está publicado bajo licencia Apache 2.0, y esta conversión mantiene la misma licencia con atribución.

El contexto máximo soportado no se especifica en la información disponible, aunque el ejemplo de arranque del servidor utiliza `--ctx 32768`. El modelo está pensado para conversación, razonamiento multi-paso y llamadas a herramientas, con modo de pensamiento activado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles de capas no disponibles |
| Parametros totales | 78.103.074.560 (78,10 B) |
| Parametros activos | 3,46 B por token |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de servidor usa 32768 |
| Tipos de cuantizacion | Q8_0 (expertos y atención), Q4_K (expertos), IQ2_XXS + Q2_K (expertos Q2); atención y shared siempre Q8_0 |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en formato DwarfStar (`ds4`), no compatible con llama.cpp genérico |

## Arquitectura y entrenamiento

El modelo base Kolibri-1 es un transformer con arquitectura Mixture of Experts: 78,10 mil millones de parámetros totales con 3,46 mil millones activos por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamaño. La información disponible no detalla el número de capas, el número de expertos por capa ni la dimensión de los embeddings. Los pesos originales se publicaron en FP8 (revisión `e52eb4627d11516b0c01de49210ab5a4e4061444`) y esta conversión los transforma a GGUF.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo incorpora un modo de razonamiento ("thinking") con niveles de esfuerzo bajo, medio y alto, mapeados mediante el parámetro `--think-level N`, y está optimizado para tool calling. La conversión a GGUF se realizó con `kolibri1_quantize.py` del repositorio DwarfStar, con validación de que cada tensor liberado se reclama exactamente una vez y solo se acepta la instantánea de origen que coincide con el plan de cuantización.

## Capacidades

- Generación de texto conversacional en alemán e inglés.
- Razonamiento multi-paso con modo de pensamiento activado por defecto y niveles de esfuerzo configurables (bajo, medio, alto).
- Tool calling / function calling, según los tags del repositorio.
- Uso en agentes y flujos de razonamiento encadenado.
- Capacidades multilingües limitadas a alemán e inglés.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No soporta visión, audio ni decodificación especulativa en este motor.

## Casos de uso

- Asistencia conversacional en alemán e inglés: el modelo puede mantener diálogos multi-turno con un contexto de hasta 32.768 tokens en la configuración de ejemplo, adecuado para atención al cliente en mercados germanoparlantes.
- Automatización de agentes con tool calling: su soporte de function calling permite integrarlo en pipelines que consulten APIs, bases de datos o servicios internos, con razonamiento previo a la llamada.
- Razonamiento sobre documentación técnica: con 3,46 B de parámetros activos, procesa textos largos en alemán (manuales, normativa) con un coste de inferencia contenido.
- Prototipado en estaciones de trabajo Apple Silicon: al ejecutarse en Metal con la cuantización Q4 (42,56 GiB), permite probar un MoE de 78 B en hardware de consumo de gama alta.
- Análisis y resumen de textos legales o administrativos en alemán, aprovechando el modo de pensamiento para tareas que requieren varios pasos.
- Evaluación e investigación de cuantizaciones: los tres artefactos (Q8, Q4, Q2) permiten medir la degradación de calidad frente al modelo FP8 original en tareas de razonamiento y código.
- Despliegue en servidor CPU: el backend de referencia `ds4 --cpu` permite servir el modelo sin GPU, útil para entornos con restricciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según el fichero: Q8 77,42 GiB; Q4 42,56 GiB; Q2 22,78 GiB.
- Backends soportados: Metal (Apple Silicon) y CPU de referencia (`ds4 --cpu`). CUDA y ROCm no están soportados para este modelo.
- No hay soporte de paralelismo tensorial ni de pipeline, ni de streaming desde SSD.
- En GPU de consumo: no hay soporte CUDA, por lo que no se puede ejecutar en RTX 4090 ni A100/H100 con este motor; en Apple Silicon, la cuantización Q4 requiere un equipo con al menos ~48 GB de memoria unificada, y Q2 ~24 GB.
- Despliegue: exclusivamente con el fork `aparusel/ds4-kolibri-1` (`./ds4 -m ...` o `./ds4-server -m ... --ctx 32768`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|
| Kolibri-1 GGUF (esta ficha) | 78,10 B / 3,46 B | No disponible (ejemplo 32.768) | Apache 2.0 | GGUF `ds4`, solo Metal/CPU |
| Aleph-Alpha/Kolibri-1 (original) | 78,10 B / 3,46 B | No disponible | Apache 2.0 | FP8, safetensors |
| Alternativas MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada; la comparación más fiable es con el modelo base FP8 del que deriva esta conversión.

## Limitaciones y advertencias

- Los ficheros GGUF son de formato DwarfStar (`ds4`) y no cargan en llama.cpp, Ollama ni otras herramientas GGUF estándar.
- El soporte de Kolibri-1 no está fusionado upstream en `ds4`; requiere compilar el fork de aparusel, lo que implica riesgo de mantenimiento y de estabilidad.
- Sin soporte CUDA ni ROCm: no se puede desplegar en GPUs NVIDIA o AMD con este motor.
- Solo alemán e inglés; no hay soporte documentado de otros idiomas.
- La cuantización Q2 puede degradar notablemente la calidad, ya que no se usó imatrix y se aplicó un bootstrap de energía de pesos; el autor recomienda Q8 o Q4.
- Riesgo de alucinación y sesgos: no se detallan en la información disponible; se remite a la sección Responsible Use de la model card original.
- La licencia Apache 2.0 cubre los pesos y la configuración publicados por Aleph Alpha, pero no se extiende al código, la arquitectura ni los métodos de entrenamiento subyacentes.
- Es una conversión no oficial de la comunidad, no afiliada ni respaldada por Aleph Alpha.
- El modo de pensamiento está activado por defecto; en producción conviene ajustar `--think-level` para controlar latencia y coste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aparusel/kolibri-1-gguf
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Licencia del modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1/blob/main/LICENSE
- Motor de inferencia DwarfStar (fork): https://github.com/aparusel/ds4-kolibri-1
- Script de cuantización: https://github.com/aparusel/ds4-kolibri-1/blob/main/gguf-tools/kolibri1_quantize.py
- Documentación de modelos de ds4: https://github.com/aparusel/ds4-kolibri-1/blob/main/docs/MODELS.md#kolibri-1
