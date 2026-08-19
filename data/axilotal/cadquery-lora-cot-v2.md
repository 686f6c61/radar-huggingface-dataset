# Axilotal/cadquery-lora-cot-v2

## Resumen

El modelo `Axilotal/cadquery-lora-cot-v2` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`, una versión cuantizada en 4 bits de Qwen2.5-Coder-7B-Instruct. Lo desarrolla el usuario Axilotal y su propósito es especializar el modelo en la generación de código CAD mediante la librería CadQuery, probablemente con un enfoque de cadena de pensamiento (CoT) para mejorar la precisión en tareas de modelado paramétrico.

El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) utilizando la librería TRL de HuggingFace, con el framework Unsloth para optimizar el entrenamiento. El repositorio tiene un tamaño de 0,2 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo completo. La fecha de creación es agosto de 2026 y no se ha publicado información sobre el dataset de entrenamiento ni sobre el rendimiento en benchmarks.

La relevancia de este modelo radica en que aborda un nicho específico: la generación automática de código CadQuery, una librería de Python para diseño paramétrico 3D. Al estar basado en Qwen2.5-Coder, hereda las capacidades de generación de código y razonamiento del modelo base, pero especializado para CAD. Sin embargo, la falta de documentación y de evaluaciones publicadas limita su uso directo en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B) con adaptadores LoRA |
| Parametros totales | 7.000 millones (modelo base) + adaptadores LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Qwen2.5-Coder) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador se distribuye en safetensors (precision no especificada) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero el adaptador no documenta restricciones) |
| Licencia | No especificada (el YAML indica "license" sin valor concreto) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y capas de atención con sesgo de rotación (RoPE). Qwen2.5-Coder está preentrenado en un corpus extenso de código y texto, con soporte para ventanas de contexto de hasta 128.000 tokens. La versión Instruct ha sido alineada mediante instrucciones y RLHF, lo que le permite seguir órdenes y generar código de forma coherente.

El adaptador LoRA se ha entrenado mediante SFT sobre esta base cuantizada en 4 bits (usando bitsandbytes). El entrenamiento se realizó con la librería TRL (versión 0.24.0) y el framework Unsloth, que acelera el fine-tuning y reduce el uso de memoria. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, el número de pasos ni los hiperparámetros utilizados. El nombre "cot" sugiere que se empleó una estrategia de cadena de pensamiento para generar código CadQuery, pero no hay evidencia documental al respecto.

## Capacidades

- Generación de código CadQuery: el adaptador está diseñado para producir scripts de CadQuery que generan modelos 3D paramétricos.
- Razonamiento sobre geometria y diseño: al basarse en Qwen2.5-Coder, puede razonar sobre especificaciones de diseño y traducirlas a instrucciones de modelado.
- Generación de código Python general: conserva las capacidades del modelo base para escribir código en Python y otros lenguajes, aunque el fine-tuning puede haber reducido el rendimiento fuera del dominio CAD.
- Soporte de tool calling: Qwen2.5-Coder-Instruct soporta function calling, pero no se ha verificado que el adaptador mantenga esta capacidad.
- Multilingüismo: el modelo base soporta varios idiomas, pero el adaptador no documenta su comportamiento fuera del inglés.
- No se ha confirmado soporte de vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Generación de piezas mecánicas paramétricas: un ingeniero puede describir una pieza (por ejemplo, "un soporte en L con dos agujeros de 5 mm") y el modelo genera un script CadQuery listo para ejecutar.
- Automatización de diseño en pipelines CAD: integrar el modelo en herramientas de generación procedural para crear variantes de diseños a partir de parámetros de entrada.
- Asistente educativo para CadQuery: estudiantes pueden recibir ejemplos de código correctamente formateados para aprender la API de CadQuery.
- Generación de ensamblajes: aunque no está confirmado, el modelo podría generar múltiples partes y ensamblarlas si se le pide explícitamente.
- Refactorización de código CAD existente: el modelo puede ayudar a convertir scripts heredados a una sintaxis más moderna o a optimizar operaciones.
- Generación de documentación técnica: a partir de un modelo CadQuery, el modelo podría explicar el diseño en lenguaje natural, aunque esto no es su función principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni evaluaciones específicas de generación CAD. Se recomienda realizar una evaluación propia antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits requiere aproximadamente 4-6 GB de VRAM para inferencia con contexto corto. El adaptador LoRA añade una sobrecarga mínima (menos de 1 GB). Con contexto de 128k tokens, la memoria puede superar los 10 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti, A10) puede ejecutar el modelo con cuantización 4-bit. Para contexto largo, se recomiendan GPUs con 16 GB o más (RTX 4090, A100).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con 8-12 GB si se limita la longitud del contexto.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con Transformers (con el modelo base), o exportar a GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusionan los pesos.
- Latencia y throughput: no hay datos publicados. En una RTX 4090, se espera una generación de 50-100 tokens/s para modelos de 7B en 4-bit, pero el adaptador puede añadir una ligera sobrecarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion CAD |
|---|---|---|---|---|
| Axilotal/cadquery-lora-cot-v2 | 7B (LoRA) | 128k | No especificada | Si (CadQuery) |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 128k | Apache 2.0 | No, generico |
| CodeLlama-7B-Instruct | 7B | 16k | Llama 2 license | No, generico |
| DeepSeek-Coder-6.7B-Instruct | 6.7B | 16k | DeepSeek license | No, generico |

No hay modelos especializados en CadQuery de referencia pública, por lo que la comparativa se limita a modelos de código genéricos. El adaptador ofrece la ventaja de estar especializado en una tarea concreta, pero carece de la documentación y el soporte de los modelos grandes establecidos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no hay estudios publicados; como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs que no existen en CadQuery.
- Riesgo de código no ejecutable: al ser un fine-tuning sobre un modelo base de propósito general, es probable que genere scripts con errores de sintaxis o lógica, especialmente en casos complejos.
- Limitaciones de idioma: no se ha documentado el comportamiento en español u otros idiomas; el modelo base funciona mejor en inglés.
- Restricciones de licencia: la licencia no está especificada, lo que impide un uso comercial seguro sin aclaración del autor.
- Dependencia del modelo base: el adaptador requiere cargar Qwen2.5-Coder-7B-Instruct en 4-bit; si el modelo base cambia o se retira, el adaptador puede quedar inutilizable.
- Falta de evaluación: sin benchmarks ni ejemplos de uso, no se puede garantizar la calidad del output en escenarios reales.
- Contexto largo: aunque el modelo base soporta 128k tokens, el adaptador no ha sido probado con contextos extensos, y el rendimiento puede degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Axilotal/cadquery-lora-cot-v2
- Modelo base (unsloth/qwen2.5-coder-7b-instruct-bnb-4bit): https://huggingface.co/unsloth/qwen2.5-coder-7b-instruct-bnb-4bit
- Librería TRL: https://github.com/huggingface/trl
- CadQuery (librería de diseño CAD): https://cadquery.readthedocs.io/
