# mlx-community/Inkling-2-Small-oQ4e

## Resumen

Inkling-2-Small-oQ4e es una cuantización de precisión mixta en formato MLX del modelo multimodal thinkingmachines/Inkling-2-Small, publicada por el colectivo mlx-community. Se trata de un modelo de mezcla de expertos (MoE) con 594.050 millones de parámetros totales y 17.000 millones de parámetros activos por token, capaz de procesar entradas de texto e imagen con una ventana de contexto de hasta 1 millón de tokens. La cuantización ha sido generada con la herramienta oQ (oMLX v0.8.0) y está pensada para ejecutarse eficientemente en hardware Apple Silicon mediante el framework MLX.

El checkpoint conserva el codificador visual y un borrador DSpark empaquetado en `mtp.safetensors`, que oMLX Lightning MTP utiliza para decodificación especulativa. La precisión efectiva es de 4,553 bits por peso para el modelo de lenguaje y el codificador visual, y de 4,585 bits por peso si se incluye el borrador DSpark. El repositorio ocupa 341,5 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

Su relevancia radica en que permite desplegar un modelo multimodal de escala cercana a los 600.000 millones de parámetros en un formato de aproximadamente 4,5 bits por peso, reduciendo drásticamente los requisitos de memoria frente a los pesos originales en BF16 y NVFP4/MXFP8, manteniendo a la vez el soporte de contexto largo y decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal text+imagen, transformer; cuantización mixta MLX (oQ) |
| Parametros totales | 594.050.672.640 (594,051B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Affine 4-bit (grupo 64), NVFP4 (grupo 16), affine 8-bit (grupos 64 y 128), BF16, FP32; media efectiva 4,553 bits/peso (4,585 con el borrador DSpark) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `mtp.safetensors` con el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos multimodal que acepta texto e imágenes como entrada. La cuantización oQ4e mantiene los expertos enrutados de las capas 0 a 39 en su formato NVFP4 original y recuantiza los expertos MXFP8 de las capas 40 a 47 a affine 4-bit. Las proyecciones de atención, los embeddings y la cabeza de vocabulario se almacenan en affine 8-bit; el codificador visual y el borrador DSpark se conservan en BF16, y el router en FP32. La distribución de almacenamiento resultante es de 489,224B pesos lógicos en NVFP4 (82,354 % del total) y 97,845B en affine 4-bit (16,471 %), con fracciones menores en 8-bit, BF16 y FP32.

El checkpoint incluye un mecanismo de decodificación especulativa mediante el borrador DSpark (1,712B parámetros lógicos, 3,423 GB de almacenamiento) integrado en el archivo `mtp.safetensors`, que oMLX Lightning MTP aprovecha para acelerar la generación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Procesamiento de contexto largo de hasta 1 millón de tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Mezcla de expertos con 17B parámetros activos, lo que reduce el coste computacional por token frente a un modelo denso de tamaño equivalente.
- Decodificación especulativa mediante el borrador DSpark incluido en el checkpoint.
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su ventana de 1M tokens, el modelo puede ingerir manuales técnicos, informes con figuras o expedientes completos y responder preguntas sobre el conjunto sin truncar el contexto.
- Asistentes conversacionales multi-turno: el tag `conversational` y el contexto largo permiten mantener diálogos prolongados con memoria de la conversación y de material adjunto.
- Procesamiento de capturas y diagramas en pipelines de documentación: el codificador visual permite extraer información de esquemas, tablas escaneadas o UI y combinarla con instrucciones textuales.
- Despliegue local en estaciones de trabajo Apple Silicon: el formato MLX y la cuantización a ~4,5 bits/peso permiten ejecutar el modelo con el stack de Apple (MLX), reduciendo la huella de memoria frente a los pesos originales.
- Generación asistida con decodificación especulativa: el borrador DSpark integrado acelera la inferencia en oMLX Lightning MTP, útil en aplicaciones interactivas donde la latencia importa.
- Investigación sobre cuantización de MoE multimodales: el checkpoint sirve como referencia para estudiar el impacto de la precisión mixta (NVFP4, affine 4-bit y 8-bit) en modelos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 341,5 GB (318,031 GiB en almacenamiento de tensores); la inferencia requiere alojar los pesos cuantizados, por lo que se necesita un sistema con al menos ~320-342 GB de memoria disponible, más overhead de activaciones y caché KV para el contexto largo.
- GPU recomendadas: no se especifican en la información proporcionada. El formato MLX está orientado a Apple Silicon (memoria unificada); para GPUs NVIDIA/AMD se requeriría conversión a otro formato, no documentada aquí.
- ¿Cabe en GPU consumer?: no en configuraciones típicas de 24-48 GB; el tamaño de pesos (~318 GiB) excede la VRAM de GPUs consumer convencionales. Se requeriría hardware de clase servidor o Apple Silicon con memoria unificada muy alta.
- Opciones de despliegue: MLX y oMLX (con soporte de oMLX Lightning MTP para decodificación especulativa). Otros runners (vLLM, llama.cpp, Ollama, TGI) no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Small-oQ4e (este) | 594,051B | 17B | 1M tokens | Apache 2.0 | MLX safetensors, ~4,553 bits/peso |
| thinkingmachines/Inkling-2-Small (base) | 594B (según checkpoint) | 17B | 1M tokens | Apache 2.0 | Pesos originales (NVFP4/MXFP8/BF16) |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible de producir contenido incorrecto, especialmente en contextos largos.
- Idiomas soportados: no especificados, lo que impide garantizar calidad en castellano u otros idiomas distintos del entrenado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- La cuantización a ~4,5 bits/peso puede degradar ligeramente la calidad frente a los pesos originales; no se han publicado evaluaciones comparativas.
- El checkpoint está en formato MLX y depende del ecosistema Apple (oMLX/MLX); su portabilidad a otros stacks no está documentada.
- El contexto de 1M tokens implica un consumo elevado de memoria para la caché KV, lo que puede limitar el contexto efectivo en función del hardware.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Inkling-2-Small-oQ4e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
