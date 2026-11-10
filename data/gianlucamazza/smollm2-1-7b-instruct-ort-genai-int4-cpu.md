# gianlucamazza/SmolLM2-1.7B-Instruct-ort-genai-int4-cpu

## Resumen

SmolLM2-1.7B-Instruct-ort-genai-int4-cpu es una exportación cuantizada a int4 en formato ONNX del modelo HuggingFaceTB/SmolLM2-1.7B-Instruct, preparada por gianlucamazza para su uso con ONNX Runtime GenAI sobre el execution provider de CPU. No se trata de un modelo nuevo ni de un fine-tuning: los pesos y el entrenamiento originales pertenecen al equipo SmolLM de Hugging Face, y este repositorio contiene únicamente una copia convertida y cuantizada pensada para ejecutarse en un procesador convencional sin GPU.

El artefacto forma parte del catálogo del proyecto xllama (entrada `smollm2-1.7b-cpu-int4`), una iniciativa de inferencia local de LLM en Xbox Series S en modo Developer. El repositorio ocupa 1,5 GB e incluye un único `model.onnx` de 1 474 861 442 bytes junto con los ficheros de configuración de GenAI y del tokenizador. La longitud de contexto configurada en `genai_config.json` es de 8192 tokens.

Su relevancia es práctica: permite probar un modelo instruct de 1,7B parámetros en CPU con ONNX Runtime GenAI sin tener que ejecutar la conversión uno mismo. El autor lo marca explícitamente como experimental, sin evaluación de calidad publicada de esta cuantización concreta, y advierte de que la pérdida de precisión frente al modelo original en fp16/bf16 puede degradar las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B-Instruct; detalles no disponibles en la información proporcionada) |
| Parametros totales | 1,7B (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (según `genai_config.json`) |
| Tipos de cuantizacion | int4 (pesos almacenados como enteros de 4 bits) |
| Idiomas soportados | inglés (el modelo base entiende y genera principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (un único `model.onnx` sin fichero `.onnx.data` externo) |
| Libreria de inferencia | onnxruntime-genai 0.14.1 (versión fijada en el build de xllama) |
| Execution provider | CPU |
| Tamaño del repo | 1,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SmolLM2-1.7B-Instruct de Hugging Face, un transformer decoder-only de 1,7B parámetros entrenado para seguir instrucciones. Esta ficha no dispone de los detalles de composición del dataset de entrenamiento, número de tokens vistos ni del proceso de alineación (RLHF/DPO) del modelo original, por lo que esos datos se consideran no disponibles en la información proporcionada.

La innovación de este repositorio es puramente de despliegue: una conversión a ONNX con cuantización int4 mediante el model builder de ONNX Runtime GenAI (patrón CPU int4) y la fusión de los datos externos en un único `model.onnx`. El autor indica que la receta exacta fue inferida del repositorio y que la revisión upstream de Hugging Face usada como entrada de conversión no quedó registrada. Tampoco se registran las versiones del builder CLI, torch, transformers ni onnx empleadas. Los seis ficheros del repositorio tienen hashes sha256 publicados y verificados contra el release `models-v1` de GitHub.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base SmolLM2-1.7B-Instruct.
- Conversación multi-turno dentro de la ventana de 8192 tokens configurada.
- Generación de código y tareas básicas de razonamiento y matemáticas propias de un modelo instruct de 1,7B (sin evaluación publicada de esta cuantización).
- Inferencia en CPU sin GPU mediante ONNX Runtime GenAI.
- Despliegue en entornos con recursos limitados: el benchmark del autor reporta un pico de 2423 MiB de RAM en Xbox Series S.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Prototipado rápido en CPU: un desarrollador puede descargar el `model.onnx` y los ficheros de configuración y ejecutar generación de texto con ONNX Runtime GenAI sin GPU ni conversión previa, útil para validar una idea antes de invertir en infraestructura.
- Pruebas de integración de ONNX Runtime GenAI: sirve como artefacto de referencia para verificar que una aplicación basada en la librería carga correctamente un modelo int4 en el execution provider de CPU.
- Inferencia local en hardware de bajo consumo: el consumo medido de 2423 MiB de RAM en Xbox Series S indica que el modelo puede correr en equipos con 4 GB de memoria disponible, como mini-PC o consolas en modo desarrollo.
- Asistentes de texto sin conexión: al ejecutarse íntegramente en CPU y en local, encaja en escenarios de privacidad donde los datos no deben salir del dispositivo, aceptando la menor calidad de un modelo de 1,7B.
- Generación de borradores y resúmenes en inglés: para tareas de texto donde la latencia no es crítica (20,6 tok/s de decodificación medidos), como preprocesado por lotes o generación de primeros borradores.
- Validación de pipelines de cuantización: el repositorio documenta hashes, receta inferida y métricas de rendimiento, lo que lo convierte en un caso de referencia para comparar el comportamiento de otras exportaciones int4 a ONNX.
- Evaluación comparativa de pérdida de calidad: al ser una cuantización int4 sin evaluación publicada, puede usarse como sujeto de pruebas para medir la degradación frente al modelo original en una tarea concreta del equipo.

## Benchmarks y rendimiento

El autor solo publica métricas de throughput medidas en Xbox Series S (8 hilos, `n_ctx=2048`), extraídas de `docs/benchmarks.md` de xllama (fila resumen SmolLM2-1.7B int4 ORT-GenAI CPU, CSV `phase35-1b-cpu`):

| Metrica | Valor |
|---|---:|
| Prefill (tok/s) | 54,9 |
| Decode (tok/s) | 20,6 |
| Rango decode (min–max) | ejecución única |
| RAM pico (MiB) | 2423 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte de que no existe evaluación de calidad de esta cuantización.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU.
- RAM estimada: el benchmark del autor reporta un pico de 2423 MiB en Xbox Series S con `n_ctx=2048` y 8 hilos; con contexto de 8192 la memoria necesaria será mayor (no disponible la cifra exacta).
- GPU: no requerida. No hay datos de rendimiento en GPU para esta exportación concreta.
- Cabe en hardware consumer de gama baja: cualquier equipo con al menos 4 GB de RAM libre en la configuración medida.
- Despliegue: ONNX Runtime GenAI (versión fijada 0.14.1 en el build de xllama) con execution provider de CPU. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: 54,9 tok/s de prefill y 20,6 tok/s de decode en Xbox Series S, ejecución única; no hay medidas en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (SmolLM2-1.7B-Instruct int4 ONNX CPU) | 1,7B | 8192 | ONNX int4, ONNX Runtime GenAI CPU | Apache 2.0 | Experimental, sin evaluación de calidad publicada |
| HuggingFaceTB/SmolLM2-1.7B-Instruct (original) | 1,7B | no disponible en la información proporcionada | safetensors fp16/bf16, transformers | Apache 2.0 | Referencia de calidad; requiere GPU o CPU con más recursos |
| Otras exportaciones ONNX de SmolLM2-1.7B-Instruct | 1,7B | variable | ONNX (int4/int8/fp16) | Apache 2.0 | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no se ha publicado ninguna evaluación de calidad de esta cuantización int4; se espera cierta pérdida frente al fp16/bf16 original.
- El modelo base está orientado principalmente al inglés y puede producir contenido inexacto o sesgado, según la model card original.
- Riesgo de alucinación inherente a un modelo de 1,7B, agravado por la cuantización a 4 bits.
- La revisión upstream de Hugging Face usada como entrada de conversión no está registrada, lo que dificulta la reproducibilidad exacta del artefacto.
- Las versiones del builder CLI, torch, transformers y onnx empleadas en la conversión tampoco están registradas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del artefacto cuantizado.
- El soporte de la consola se limita a Xbox Series S en modo Developer; no se probó en Series X y no es compatible con títulos de Store o de juego.
- Proyecto independiente sin afiliación con Microsoft ni con Hugging Face.
- La longitud de contexto de 8192 está configurada, pero no hay evaluación de cómo se comporta la calidad en contextos largos tras la cuantización.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gianlucamazza/SmolLM2-1.7B-Instruct-ort-genai-int4-cpu
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Proyecto xllama: https://github.com/gianlucamazza/xllama
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
