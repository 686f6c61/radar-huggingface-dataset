# deluxetiky/Inkblot-2-mini-Basalt

## Resumen

Inkblot-2-mini-Basalt es un empaquetado en formato Basalt del checkpoint NVFP4 `Ex0bit/Inkblot-2-mini`, que a su vez deriva del modelo `thinkingmachines/Inkling-2-Mini`. Lo publica el usuario `deluxetiky` como conversión de contenedor: no entrena pesos nuevos ni modifica la arquitectura, sino que reempaqueta el checkpoint original para que sea consumible por el runtime Basalt (versión 0.5.7 o superior). El modelo es un transformer de mezcla de expertos con bucles (looped MoE) de 26,39 mil millones de parámetros totales y 3,4 mil millones activos, con 24 capas, 128 expertos enrutados y enrutamiento top-8.

La relevancia de esta ficha radica en dos aspectos. Por un lado, ofrece una ventana de contexto de 262.144 tokens, un tamaño poco habitual en modelos de su clase. Por otro, acepta entrada de texto e imagen (pipeline `image-text-to-text`), lo que lo sitúa en la categoría de modelos multimodales ligeros. El empaquetado NVFP4 busca reducir el espacio en disco y el ancho de banda de memoria en inferencia, manteniendo los tensores no pertenecientes a expertos en BF16/FP32.

El repositorio ocupa 19,6 GB y contiene un único archivo de pesos autocontenido (`Inkblot-2-mini-NVFP4.basalt`) que incluye tokenizador y metadatos de visión. La licencia es Apache 2.0 tanto para el checkpoint base como para esta conversión. No obstante, el autor no publica datos de entrenamiento, benchmarks ni detalles sobre el proceso de alineación del modelo original, por lo que buena parte de las especificaciones técnicas quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos con bucles (looped MoE) |
| Parametros totales | 26,39 mil millones |
| Parametros activos | 3,4 mil millones |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 para expertos enrutados; BF16/FP32 para tensores no expertos |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Basalt (`.basalt`), checkpoint original en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con bucles: 24 capas, 128 expertos enrutados y enrutamiento top-8, con 26,39 mil millones de parámetros totales de los que 3,4 mil millones se activan por token. Esta configuración de activación reducida frente al total permite un coste computacional por token mucho menor que el de un modelo denso del mismo tamaño. El checkpoint incluye además un drafter (`mtp.safetensors`, 635.801.416 bytes), lo que sugiere decodificación especulativa o predicción multi-token, aunque la model card no detalla su funcionamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF, DPO u otros). La conversión a Basalt cambia únicamente el formato de contenedor: los expertos enrutados conservan sus códigos y escalas NVFP4, y los tensores no expertos mantienen sus formas BF16/FP32. El pack se generó con la herramienta oficial `tools/convert/convert.py` de Basalt v0.5.7.

## Capacidades

- Generación de texto conversacional en inglés.
- Entrada multimodal de texto e imagen (pipeline `image-text-to-text`).
- Razonamiento multi-paso gracias a la ventana de contexto de 262.144 tokens.
- Procesamiento de documentos largos y conversaciones multi-turno con contexto extenso.
- Decodificación especulativa mediante el drafter incluido en el checkpoint original.
- Soporte de peticiones concurrentes en Basalt mediante `--parallel N`, con contexto compartido entre slots salvo que se use `--slot-full-context`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- **Análisis de documentos extensos**: con 262.144 tokens de contexto, el modelo puede procesar informes, contratos o bases de código completas en una sola pasada, evitando estrategias de troceado y recuperación.
- **Atención al cliente multimodal**: al aceptar imágenes además de texto, puede gestionar consultas que incluyan capturas de pantalla, fotos de productos o diagramas, manteniendo el hilo conversacional en inglés.
- **Asistentes conversacionales de contexto largo**: la ventana amplia permite conservar el historial completo de una sesión sin resumen intermedio, útil en soporte técnico o tutoría.
- **Procesamiento de documentación técnica con imágenes**: extracción de información de manuales que combinan texto y figuras, como guías de instalación o esquemas de arquitectura.
- **Despliegue en hardware con memoria limitada**: los 3,4 mil millones de parámetros activos y la cuantización NVFP4 reducen los requisitos de memoria frente a un modelo denso de 26 mil millones, lo que facilita servir el modelo en GPUs de gama alta para consumidores.
- **Investigación sobre MoE y cuantización**: el formato Basalt con expertos en NVFP4 y tensores no expertos en BF16/FP32 sirve como caso de estudio para evaluar el impacto de la cuantización selectiva en modelos MoE.
- **Integración en pipelines de inferencia propios**: el runtime Basalt permite servir el modelo con configuración de contexto, KV cache en FP8 y visión dinámica mediante parámetros de línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el pack ocupa 19,6 GB en disco, pero el requisito de VRAM en inferencia no está documentado. Con 26,39 mil millones de parámetros totales y expertos en NVFP4, el peso de los expertos se reduce, pero los tensores no expertos en BF16/FP32 elevan el consumo por encima de lo que sugiere el tamaño del archivo.
- **GPU recomendadas**: no disponible en la información proporcionada. Por tamaño y arquitectura, se sitúa en la categoría de GPUs de centro de datos (A100, H100) o GPUs de consumo con 24 GB o más, pero el autor no confirma ninguna.
- **Compatibilidad con GPU de consumo**: no confirmada por el autor.
- **Opciones de despliegue**: exclusivamente el runtime Basalt v0.5.7 o superior. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.basalt`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkblot-2-mini-Basalt | 26,39 B | 3,4 B | 262.144 | Apache 2.0 | Basalt |
| Ex0bit/Inkblot-2-mini (base) | 26,39 B | 3,4 B | 262.144 | Apache 2.0 | Safetensors |
| thinkingmachines/Inkling-2-Mini (origen) | 26,39 B | 3,4 B | 262.144 | no disponible | no disponible |

Las tres entradas corresponden a la misma familia de pesos en distintos formatos o etapas de conversión; no se dispone de información sobre modelos alternativos de otros autores con los que comparar rendimiento, latencia o calidad.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte de inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- **Formato propietario**: el pack `.basalt` solo se puede ejecutar con el runtime Basalt, lo que limita la portabilidad frente a formatos estándar como safetensors o GGUF.
- **Sin benchmarks**: no hay datos publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que la calidad real del modelo no se puede verificar de forma independiente.
- **Riesgo de alucinación**: no evaluado en la información disponible; como todo modelo generativo, es susceptible de producir contenido incorrecto, especialmente en dominios especializados.
- **Sesgos**: no documentados por el autor.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del checkpoint original `thinkingmachines/Inkling-2-Mini`, cuya licencia no se especifica en esta ficha.
- **Repositorio sin tracción**: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- **Conversión no verificada de forma independiente**: el autor publica hashes SHA-256 del origen y del pack, pero no hay auditoría externa de la conversión.

## Enlaces

- [Hugging Face: deluxetiky/Inkblot-2-mini-Basalt](https://huggingface.co/deluxetiky/Inkblot-2-mini-Basalt)
- [Checkpoint base: Ex0bit/Inkblot-2-mini](https://huggingface.co/Ex0bit/Inkblot-2-mini)
- [Modelo origen: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Runtime Basalt (GitHub)](https://github.com/jesdga95/basalt)
