# maximedubourg/regex-sft-qwen3-1.7b-onnx

## Resumen

`regex-sft-qwen3-1.7b-onnx` es un ajuste fino supervisado (SFT con LoRA) del modelo Qwen3-1.7B de Alibaba, especializado en una única tarea: convertir una descripción en inglés de una necesidad de validación en un literal de expresión regular de JavaScript (ECMAScript 2018), por ejemplo `/^\d{5}$/`. Lo publica el usuario `maximedubourg` bajo licencia Apache 2.0 y lo distribuye en formato ONNX cuantizado a 4 bits (`q4f16`) para su uso con Transformers.js en WebGPU, lo que permite ejecutarlo directamente en el navegador.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B (1.700 millones de parámetros, contexto nativo de 32.768 tokens en la familia Qwen3) y conserva el grafo ONNX de `onnx-community/Qwen3-1.7B-ONNX`, sustituyendo únicamente las matrices afectadas por el LoRA por las versiones ajustadas y cuantizándolas con MatMulNBits (4 bits, bloques de 32, simétrico). El resultado es un artefacto de 1,4 GB pensado para inferencia local en cliente, no para servidores de alto rendimiento.

Su relevancia es acotada pero práctica: cubre un nicho concreto (generación de regex para formularios y validaciones) y demuestra un flujo de trabajo reproducible de fine-tuning pequeño, filtrado de datos sintéticos y exportación ONNX lista para el navegador. No es un modelo de propósito general: el ajuste degrada deliberadamente su comportamiento conversacional en favor de una salida de una sola línea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a ONNX |
| Parametros totales | 1.700 millones (modelo base Qwen/Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta 32.768 tokens) |
| Tipos de cuantizacion | ONNX q4f16 (MatMulNBits, 4 bits, bloques de 32, simetrico) |
| Idiomas soportados | no disponible (el prompt de entrenamiento esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (Transformers.js) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen3-1.7B, un transformer denso decoder-only. El autor no modifica la topología: reutiliza el grafo ONNX publicado por `onnx-community/Qwen3-1.7B-ONNX` y reemplaza las matrices tocadas por el LoRA por las versiones fine-tuneadas, cuantizadas con el mismo esquema (MatMulNBits de 4 bits, bloques de 32, simétrico). El resultado se exporta como `q4f16`, lo que exige la extensión `shader-f16` de WebGPU para ejecutarse en el navegador.

El entrenamiento se basa en aproximadamente 8.300 ejemplos sintéticos generados por DeepSeek V4.1 Flash. Cada ejemplo se conserva solo si su regex pasa las cadenas de prueba escritas en una llamada separada (sin que el generador de tests viera la regex) y si regexes triviales o mutadas fallan al menos una de esas pruebas, un filtrado que elimina soluciones degeneradas. La inferencia prevista usa la plantilla de chat de Qwen3 con el modo *thinking* desactivado, decodificación greedy y el formato de sistema y usuario definido en `src/prompt.ts` del playground del autor.

## Capacidades

- Generación de literales de regex de JavaScript (ECMAScript 2018) a partir de una descripción en inglés.
- Salida de una sola línea con el literal entre barras (`/.../`), adecuada para inserción directa en código.
- Manejo de casos simples: dígitos, longitudes, formatos de fecha, correos, códigos postales y similares.
- Capacidad limitada de razonamiento sobre restricciones compuestas; el modelo base conserva parte de su conocimiento general, pero el ajuste lo orienta a una única tarea.
- No soporta de forma fiable tool calling, function calling ni razonamiento multi-paso orientado a agentes tras el ajuste.
- Capacidades multilingües: no documentadas; el entrenamiento y el prompt están en inglés.
- No dispone de modo *thinking* activo en el uso previsto (se desactiva explícitamente).

## Casos de uso

- Validación de formularios en el navegador: el modelo se ejecuta con Transformers.js sobre WebGPU y genera la regex en cliente, sin enviar datos del usuario a un servidor; encaja en asistentes de creación de formularios donde el usuario describe la regla en lenguaje natural.
- Herramientas de desarrollo integradas en el editor: un plugin puede convertir una descripción ("un código postal español de cinco dígitos") en una regex lista para pegar, reduciendo el tiempo de escritura de validaciones triviales.
- Generación de tests de validación: dado un requisito textual, el modelo produce una regex que sirve como punto de partida para pruebas unitarias, siempre que se validen después con casos reales.
- Enseñanza de expresiones regulares: como generador de ejemplos simples, permite a docentes y alumnos comparar la descripción con la regex resultante y discutir sus limitaciones.
- Prototipado rápido en scripts de extracción de datos: para patrones sencillos (fechas, identificadores, formatos de teléfono) el modelo ofrece una primera versión que el desarrollador refina manualmente.
- Filtrado previo en pipelines de datos: en tareas de limpieza donde se necesitan regex básicas para descartar líneas mal formadas, el modelo puede proponer candidatas que luego se validan con un conjunto de pruebas.
- Demostración de fine-tuning y despliegue ONNX: sirve como ejemplo reproducible de SFT con LoRA, filtrado de datos sintéticos y exportación a Transformers.js para equipos que quieran replicar el flujo.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor miden la proporción de regexes que pasan todas las pruebas ocultas. La puntuación de 4 bits se midió sobre una cuantización MLX 4-bit de los mismos pesos (grupos de 32), usada como aproximación al export ONNX.

| Modelo | regex101 (400 necesidades reales) | Held-out (442 sinteticas) |
|---|---|---|
| Este modelo, MLX bf16 | 26,5 % | 76,9 % |
| Este modelo, MLX 4-bit | 25,8 % | 70,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ONNX q4f16 ocupa 1,4 GB en disco; en WebGPU la huella en memoria de la GPU ronda ese orden de magnitud, aunque no se ha publicado una medición exacta.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y la extensión `shader-f16` (por ejemplo, Apple Silicon reciente, GPUs AMD e Intel integradas o dedicadas compatibles, y NVIDIA con drivers actuales). Para ejecución nativa fuera del navegador, una RTX 3060 de 12 GB o superior es más que suficiente.
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs integradas y dedicadas modernas con WebGPU; también en CPU, aunque con mayor latencia.
- Opciones de despliegue: Transformers.js (previsto por el autor), ONNX Runtime Web o Node.js; para otros runtimes sería necesario reconvertir el modelo, ya que el export está pensado para el grafo de `onnx-community/Qwen3-1.7B-ONNX`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| regex-sft-qwen3-1.7b-onnx | 1,7 B | no disponible | Regex JS desde lenguaje natural | Apache 2.0 | ONNX q4f16 |
| Qwen/Qwen3-1.7B (base) | 1,7 B | 32.768 tokens | Propósito general, multilingüe | Apache 2.0 | safetensors, GGUF, ONNX |
| onnx-community/Qwen3-1.7B-ONNX | 1,7 B | 32.768 tokens | Propósito general en navegador | Apache 2.0 | ONNX (varias cuantizaciones) |

No se dispone de información sobre otros modelos especializados en generación de regex con los que comparar directamente.

## Limitaciones y advertencias

- Rendimiento débil en peticiones de dificultad intermedia y casi siempre incorrecto en las difíciles: lookarounds, backreferences y rangos numéricos.
- Los errores suelen ser regexes "casi correctas", por lo que es imprescindible probar el resultado antes de usarlo en producción.
- El prompt de entrenamiento está en inglés; no hay datos sobre el comportamiento con descripciones en castellano.
- El modo *thinking* de Qwen3 se desactiva en el uso previsto; activarlo puede degradar la calidad de la salida.
- La cuantización a 4 bits reduce la precisión frente a bf16 (26,5 % → 25,8 % en regex101 y 76,9 % → 70,8 % en held-out), y la medición se hizo sobre MLX, no sobre el export ONNX final.
- Requiere WebGPU con `shader-f16` para funcionar en el navegador; sin esa extensión el modelo no se ejecuta correctamente.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-1.7B también es Apache 2.0, por lo que no hay restricciones adicionales documentadas.
- Riesgo de alucinación inherente a un modelo de 1,7 B ajustado con datos sintéticos: puede producir regex sintácticamente válidas pero semánticamente incorrectas.
- No se han documentado sesgos específicos; al ser un modelo de nicho con datos sintéticos en inglés, su cobertura lingüística y cultural es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maximedubourg/regex-sft-qwen3-1.7b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Grafo ONNX de referencia: https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js/index
