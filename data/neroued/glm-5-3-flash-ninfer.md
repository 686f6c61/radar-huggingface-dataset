# neroued/GLM-5.3-Flash-NInfer

## Resumen

GLM-5.3-Flash-NInfer es un artefacto de pesos en precisión mixta para el motor de inferencia NInfer v3, derivado de GLM-5.3-Flash (zai-org) y convertido a partir del checkpoint NVFP4 de NVIDIA. No es un modelo entrenado desde cero, sino una redistribución optimizada de los pesos originales para su ejecución con el runtime NInfer sobre hardware Blackwell, en concreto dos nodos DGX Spark. El paquete incluye pesos de texto, visión, MTP nativo (multi-token prediction) y una cabeza draft Q4 adicional de vocabulario completo para decodificación especulativa.

La arquitectura subyacente, denominada GLM5Next en NInfer, combina atención lineal KDA, MLA dispersa Kpool, mHC y mezcla de expertos (MoE). El artefacto ocupa 178,33 GiB repartidos en seis ficheros y declara una longitud de contexto lógica de 1.048.576 tokens en la configuración de ejemplo (TP2 con DP2 de atención). Está pensado para servir cargas multimodales (imagen-texto a texto) con tool calling, salida restringida, streaming y reutilización de prefijo a través de endpoints compatibles con OpenAI y Anthropic.

Su relevancia es fundamentalmente práctica: demuestra cómo ejecutar un modelo de gran tamaño y contexto millonario en hardware de consumo profesional de gama alta (dos DGX Spark) mediante cuantización agresiva (NVFP4 en expertos enrutados, Q8 en proyecciones de atención, FP8 en bloques MTP) y decodificación especulativa con MTP. La licencia MIT de los pesos y Apache-2.0 del motor facilitan su uso comercial, aunque el despliegue está atado al ecosistema NInfer.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM5Next: KDA (atención lineal), Kpool (MLA dispersa), mHC y MoE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE, sin cifra publicada) |
| Longitud de contexto | 1.048.576 tokens (límite lógico en la configuración de ejemplo) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y tres capas MLP densas), Q8 A16 (KDA Q/K/V/O, salida MLA, expertos compartidos), Block-FP8 (expertos MTP), Q4 A16 (cabeza draft MTP), BF16 (cabeza principal, embeddings, mHC, visión), FP32 (campos KDA/control) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos); NInfer Apache-2.0 |
| Formato de pesos | `.ninfer` propietario, dividido en seis ficheros (`glm5_3_flash.ninfer` + `part-0001` a `part-0005`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida que NInfer denomina GLM5Next. Combina KDA (atención lineal) para reducir el coste de atención en secuencias largas, Kpool como mecanismo de MLA dispersa con un indexador que por defecto se almacena en FP8 (configurable a BF16 mediante `NINFER_KPOOL_INDEXER_BF16=1`), mHC y una capa MoE con expertos enrutados y expertos compartidos. El artefacto incluye MTP nativo con soporte de 1 a 5 borradores, más una cabeza draft Q4 de vocabulario completo que no recorta el vocabulario y que se usa junto a la cabeza objetivo en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. Lo que sí está documentado es el proceso de conversión: los códigos y escalas NVFP4 de NVIDIA se importan tal cual para los expertos enrutados y las tres primeras capas MLP densas, mientras que las proyecciones de atención y expertos compartidos se cuantizan a Q8 A16 y los expertos MTP se convierten desde BF16 a Block-FP8. La innovación destacable es la combinación de decodificación especulativa MTP con una cabeza draft cuantizada a Q4, que reduce el coste de las propuestas sin degradar la cabeza objetivo.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia de GLM.
- Razonamiento con modo thinking siempre activo; niveles de esfuerzo `low`, `high` y `max` (no se admite `--no-thinking` ni esfuerzo `none`).
- Comprensión de imagen y vídeo (pipeline `image-text-to-text`); la visión debe habilitarse en el arranque.
- Tool calling / function calling: NInfer devuelve las llamadas generadas al cliente, pero no las ejecuta.
- Salida restringida (constrained output), streaming y reutilización de prefijo.
- Decodificación especulativa mediante MTP nativo con 1 a 5 borradores y cabeza draft Q4 opcional (`--proposal-head optimized`).
- Contexto largo de hasta 1.048.576 tokens lógicos en la configuración de referencia.
- Servido mediante endpoints compatibles con OpenAI y Anthropic.

## Casos de uso

- Análisis de documentación extensa: con un contexto lógico de más de un millón de tokens, permite ingerir manuales, expedientes o bases de código completas en una sola sesión sin trocear, útil para auditoría técnica y legal.
- Asistentes con entrada visual: al soportar imagen y vídeo, encaja en flujos de revisión de capturas, inspección de interfaces o extracción de datos de documentos escaneados.
- Automatización de agentes con tool calling: el modelo emite llamadas a herramientas que el orquestador ejecuta, lo que permite construir pipelines de agentes multi-paso sobre los endpoints compatibles con OpenAI.
- Generación de código asistida en producción: la salida restringida y el streaming facilitan integrarlo en IDE o CI/CD con formatos de respuesta garantizados.
- Atención al cliente multi-turno: el contexto largo y la reutilización de prefijo reducen el coste de conversaciones largas con historial extenso.
- Procesamiento por lotes en local: el despliegue sobre dos DGX Spark permite ejecutar inferencia sin depender de la nube, relevante para datos sensibles.
- Investigación en decodificación especulativa: la combinación MTP + cabeza draft Q4 sirve como banco de pruebas para medir aceleraciones en hardware Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El artefacto completo ocupa 178,33 GiB y no cabe en un único DGX Spark; requiere dos nodos con todos los ficheros replicados en cada uno.
- Hardware objetivo: DGX Spark (Blackwell) con NCCL y libibverbs para el despliegue distribuido.
- Configuración de ejemplo: TP2 con DP2 de atención, KV en FP8, visión habilitada, MTP3, cabeza optimizada, CUDA Graph en decodificación y `max_concurrency = 8`.
- Los expertos usan TP por defecto (`ep = 1`); puede seleccionarse EP de experto completo con `ep = 2` manteniendo TP2 y DP2 de atención.
- Motor de inferencia: NInfer (compilación con `cmake --preset dgx-spark-release -DNINFER_ENABLE_DISTRIBUTED=ON`).
- No hay datos publicados de latencia ni throughput; las asignaciones de memoria en tiempo de ejecución incluyen workspace y pool compartido de KV/State, por lo que debe consultarse la estimación de capacidad al arrancar.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato `.ninfer` es específico de este runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NInfer (este) | no disponible (MoE) | 1.048.576 tokens lógicos | MIT (pesos) | `.ninfer`, motor NInfer | Hugging Face, 257 descargas |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | MIT | safetensors (formato original) | Hugging Face |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | no disponible | NVFP4 (checkpoint de NVIDIA) | Hugging Face |

Las alternativas comparables en la información disponible son las dos fuentes directas del propio modelo. No se dispone de datos de rendimiento ni de parámetros para comparar con modelos de otras familias.

## Limitaciones y advertencias

- El despliegue está atado a NInfer y a hardware Blackwell; no hay soporte documentado para otros motores ni para GPU convencionales.
- No cabe en un solo DGX Spark: exige dos nodos con interconexión y replicación completa de los seis ficheros.
- El modo thinking es obligatorio; no se admite desactivarlo ni el esfuerzo `none`, lo que incrementa el coste de tokens en cada petición.
- NInfer no ejecuta las llamadas a herramientas: el cliente debe implementar el orquestador y validar las respuestas del modelo.
- DFlash y DFlash2 no están soportados por esta arquitectura.
- No se publican datos sobre sesgos, tasas de alucinación, idiomas soportados ni evaluación de calidad; la información disponible es exclusivamente técnica sobre el empaquetado y el despliegue.
- La licencia MIT se aplica a los pesos según la documentación del autor, pero el uso comercial debe verificarse contra la licencia del modelo base en zai-org/GLM-5.3-Flash.
- El tamaño del repositorio (191,5 GB) y la descarga por partes implican requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neroued/GLM-5.3-Flash-NInfer
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Guía de conversión de pesos: https://github.com/Neroued/ninfer/blob/master/docs/weight-conversion.md#glm-53-flash
- Receta de conversión `glm5next`: https://github.com/Neroued/ninfer/blob/master/tools/convert/official_recipes.py
- Guía de compilación: https://github.com/Neroued/ninfer#build
- Configuración de ejemplo para dos Sparks: https://github.com/Neroued/ninfer/blob/master/examples/configs/spark2-glm5_3-flash.toml
- Guía de despliegue: https://github.com/Neroued/ninfer/tree/master/examples/configs
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
