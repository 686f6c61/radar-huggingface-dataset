# Frankyharsh08/vanguard-ai-text-detector-ONNX

## Resumen

Vanguard AI text detector (ONNX, 8-bit) es una exportación en formato ONNX del clasificador `ShantanuT01/vanguard-ai-text-detector`, un modelo basado en ModernBERT-large que estima la probabilidad de que un texto en inglés haya sido generado por un modelo de lenguaje. La conversión la publica el usuario Frankyharsh08 y su propósito es permitir la ejecución del clasificador directamente en el navegador mediante Transformers.js, sin necesidad de infraestructura de servidor. El modelo se emplea en el producto ClearScript.

El modelo resuelve una tarea binaria de clasificación de texto (detección de contenido generado por IA) y se distribuye con cuantización dinámica de pesos a 8 bits (QUInt8), lo que reduce el artefacto a 397 MB y hace viable su carga en entornos web. La arquitectura subyacente es ModernBERT-large, un transformer encoder con atención bidireccional, aunque la model card no detalla el número exacto de parámetros ni la longitud de contexto nativa del modelo original.

Su relevancia actual radica en la combinación de tres factores: una precisión reportada alta (AUROC 0,986 en el conjunto de prueba del autor), un formato ligero y portable (ONNX cuantizado) y una licencia permisiva (MIT) que facilita su integración en productos comerciales. No obstante, el propio autor advierte de limitaciones importantes en textos cortos y en el formato del texto de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (transformer encoder bidireccional) |
| Parametros totales | no disponible (modelo base ModernBERT-large; cifra exacta no indicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la inferencia de ejemplo trunca a 1024 tokens) |
| Tipos de cuantizacion | Dinámica de pesos a 8 bits (QUInt8); export fp32 también generado |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18); `onnx/model_quantized.onnx` de 397 MB |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto construido sobre ModernBERT-large, un transformer encoder con atención bidireccional completa. La cabeza de clasificación está configurada con `problem_type: multi_label_classification` y una única etiqueta (`AI`), de modo que Transformers.js aplica una función sigmoide sobre el logit y el resultado se interpreta como P(AI), la probabilidad de que el texto sea generado por IA.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset original ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo base `ShantanuT01/vanguard-ai-text-detector` y no se reproducen en esta ficha. La innovación técnica de esta versión concreta es la exportación a ONNX con `torch.onnx.export` (opset 18): el autor verifica que la exportación fp32 coincide con el modelo PyTorch original con un error máximo de 2e-6, y que la cuantización a 8 bits apenas degrada la calidad (AUROC 0,986 frente a 0,987 del original). El conjunto de prueba empleado para esa verificación contiene 796 textos de 2026, incluyendo salidas de Claude, GPT y Qwen, literatura de dominio público, Wikipedia anterior a 2022 y escritura académica de autores no nativos de inglés.

## Capacidades

- Clasificación binaria de texto: estima P(AI) para un pasaje en inglés, con salida tipo sigmoide.
- Detección de contenido generado por modelos de lenguaje contemporáneos (Claude, GPT, Qwen, según el conjunto de evaluación del autor).
- Discriminación frente a texto humano de dominios variados: literatura de dominio público, Wikipedia previa a 2022 y escritura académica no nativa.
- Ejecución en navegador mediante Transformers.js con `dtype: "q8"`, sin backend de servidor.
- Truncado configurable en la pipeline (el ejemplo usa `max_length: 1024`).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento; es exclusivamente un clasificador.

## Casos de uso

- Moderación de contenido en plataformas web: el modelo puede puntuar en el cliente pasajes enviados por usuarios y marcar contenido sospechoso de generación automática antes de publicarlo, gracias a su ejecución vía Transformers.js sin coste de servidor.
- Verificación editorial en publicaciones: integrado en el flujo de revisión, permite priorizar la revisión humana de textos con P(AI) alta, usando el umbral de 0,5 documentado por el autor.
- Detección en herramientas de escritura asistida: ClearScript lo emplea para señalar al usuario fragmentos que probablemente no ha escrito de forma manual, con retroalimentación inmediata en el navegador.
- Filtrado de datasets para entrenamiento: descartar muestras sintéticas de un corpus antes de usarlo para fine-tuning, aprovechando la alta especificidad reportada (2,0 % de falsos positivos sobre texto humano a umbral 0,5).
- Auditoría académica de trabajos: señalización preliminar de secciones potencialmente generadas por IA en entregas de estudiantes, siempre como indicio y no como prueba concluyente.
- Investigación sobre procedencia de texto: experimentos que requieran un detector ligero y reproducible en local, con licencia MIT y artefacto ONNX portable.

## Benchmarks y rendimiento

| Metrica | Modelo 8-bit (ONNX) | Modelo original (PyTorch) |
|---|---|---|
| AUROC (conjunto de 796 textos) | 0,986 | 0,987 |
| Textos de IA detectados a umbral 0,5 | 96 % | no disponible |
| Textos humanos marcados como IA a umbral 0,5 | 2,0 % | no disponible |
| Error máximo de exportación fp32 vs. PyTorch | 2e-6 | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- El artefacto cuantizado ocupa 397 MB en disco; en memoria, la inferencia requiere del orden de 0,4–1 GB según el runtime y el tamaño de lote, aunque no se publican cifras oficiales de VRAM.
- Cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) e incluso en CPU, dado el tamaño reducido del modelo.
- Diseñado para ejecutarse en navegador con Transformers.js y WebGPU/WASM; no requiere GPU dedicada para uso interactivo.
- Opciones de despliegue: Transformers.js (principal), y cualquier runtime compatible con ONNX (ONNX Runtime, etc.).
- No se publican datos de latencia ni throughput; el autor solo indica que el modelo está pensado para ejecución en cliente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vanguard AI text detector (ONNX 8-bit) | ModernBERT-large | no disponible | MIT | ONNX | Objeto de esta ficha; AUROC 0,986 |
| ShantanuT01/vanguard-ai-text-detector | ModernBERT-large | no disponible | MIT | PyTorch (safetensors presumiblemente) | Modelo original; AUROC 0,987 |
| Otros detectores de texto IA | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo admite inglés; el rendimiento en otros idiomas no está caracterizado.
- Las puntuaciones en pasajes de menos de unas 150 palabras no son fiables, según advierte el propio autor.
- Los saltos de línea duros deben unirse en espacios antes de puntuar: el texto con saltos cada ~80 caracteres se interpreta a menudo como generado por máquina.
- Riesgo de falsos positivos en escritura académica de autores no nativos de inglés, dominio presente en el conjunto de evaluación.
- El modelo detecta salidas de modelos de 2026 (Claude, GPT, Qwen); su capacidad frente a modelos posteriores o desconocidos no está validada.
- Es un indicio probabilístico, no una prueba: no debe usarse como única evidencia en decisiones disciplinarias o legales.
- Licencia MIT heredada del modelo original, sin restricciones conocidas para uso comercial; conviene verificar los términos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera de ClearScript.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Frankyharsh08/vanguard-ai-text-detector-ONNX
- Modelo base: https://huggingface.co/ShantanuT01/vanguard-ai-text-detector
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
