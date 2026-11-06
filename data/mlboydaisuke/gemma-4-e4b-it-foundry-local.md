# mlboydaisuke/gemma-4-E4B-it-Foundry-Local

## Resumen

Gemma 4 E4B it Foundry Local es un paquete de inferencia local del modelo google/gemma-4-E4B-it, publicado por el usuario mlboydaisuke. No se trata de un modelo entrenado desde cero, sino de una exportación y cuantización del modelo base de Google empaquetada para Foundry Local 0.13.0 mediante ONNX Runtime GenAI. El paquete incluye cuatro sesiones ONNX (decoder, embedding, encoder de visión y encoder de audio), lo que refleja que el modelo base es multimodal de tipo any-to-any.

La relevancia de esta ficha no está en el modelo en sí, sino en el formato de despliegue: ofrece dos carpetas listas para ejecutar en GPU NVIDIA (CUDA, contexto de 8.192 tokens) y en CPU (contexto de 131.072 tokens), con cuantización int4 en el decoder e int8 en los encoders. El autor documenta métricas de velocidad y una comparación de fidelidad frente a transformers en bf16, lo que permite evaluar el compromiso entre cuantización y calidad de salida.

La información disponible es limitada en cuanto a especificaciones del modelo base (número de parámetros, composición del entrenamiento, benchmarks), que no se detallan en la model card. Los datos técnicos que sí se aportan son los del empaquetado ONNX, las condiciones de ejecución y las limitaciones observadas en el hardware de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder, embedding, encoder de visión y encoder de audio) exportado a ONNX Runtime GenAI; arquitectura interna del modelo base no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 8.192 tokens (paquete `cuda-int4-8k`); 131.072 tokens (paquete `cpu-int4`) |
| Tipos de cuantización | Decoder int4 (RTN, bloque 32 en CUDA; RTN con cómputo int8 en CPU); embedding, visión y audio en int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Gemma 4) |
| Formato de pesos | ONNX (ONNX Runtime GenAI); carpetas `cuda-int4-8k/` y `cpu-int4/` con `genai_config.json`, tokenizer y procesadores |
| Tamaño del repositorio | 14,6 GB |
| Librería | onnxruntime-genai |
| Pipeline | any-to-any |
| Modelo base | google/gemma-4-E4B-it |
| Herramientas de exportación | Mobius 0.1.0 y Olive 0.13.0 (recetas olive-recipes Gemma 4 E2B) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo base. Lo que sí se documenta es el proceso de exportación: se partió de google/gemma-4-E4B-it, se exportó con Mobius 0.1.0 y se cuantizó con Olive 0.13.0 siguiendo las recetas de olive-recipes para Gemma 4 E2B. El resultado son cuatro sesiones ONNX Runtime GenAI independientes (decoder, embedding, encoder de visión y encoder de audio), lo que confirma una arquitectura multimodal con torres separadas para texto, imagen y audio.

La innovación técnica del paquete es la cuantización diferenciada: el decoder se cuantiza a int4 con cuantización por bloques (block 32) en la variante CUDA y con cómputo int8 en la variante CPU, mientras que embedding y encoders se mantienen en int8. El autor mide el impacto de esta decisión: con decoder int4, el texto coincide con la referencia en bf16 en 13 de 24 prompts; con decoder fp16 sube a 22 de 24, lo que cuantifica la pérdida de fidelidad atribuible a la cuantización int4 del decoder.

## Capacidades

- Generación de texto conversacional y respuesta a prompts de conocimiento general (probado con 24 prompts fijos y greedy decoding).
- Procesamiento multimodal any-to-any: el paquete incluye encoder de visión y encoder de audio, aunque el autor solo verificó que cargan, no que produzcan respuestas correctas.
- Ejecución local en GPU NVIDIA mediante CUDA Execution Provider y en CPU mediante CPU Execution Provider.
- Integración con Foundry Local mediante registro de modelo, carga y completado por CLI y por REST en la ruta `/catalogs/local/v1`.
- Compatibilidad con ONNX Runtime GenAI 0.19.0 fuera de Foundry Local, incluyendo el execution provider OpenVINO 1.8.1 en GPU Intel para el paquete CPU.
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking ni multilingüismo.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU consumer: el paquete `cuda-int4-8k` ocupa como máximo 13.294 MiB en una RTX 5080 Laptop de 16 GB, por lo que permite ejecutar un modelo multimodal sin depender de la nube.
- Prototipado de asistentes conversacionales con contexto moderado: con 8.192 tokens de ventana y 58,8 tokens/s de decodificación en la configuración medida, es adecuado para diálogos multi-turno de longitud media en local.
- Procesamiento por lotes en CPU sin GPU: el paquete `cpu-int4` con 131.072 tokens de contexto permite trabajos de contexto largo en servidores sin acelerador, a costa de 11,6 tokens/s de decodificación y 20,2 s hasta el primer token.
- Evaluación de pipelines ONNX Runtime GenAI: sirve como referencia para medir fidelidad y rendimiento de una cuantización int4 frente al modelo original en bf16, con metodología reproducible en el repositorio del autor.
- Integración en aplicaciones Windows mediante Foundry Local: el registro con `foundry model register` y el consumo por REST en `/catalogs/local/v1` permiten incorporar el modelo a aplicaciones de escritorio con un daemon local.
- Experimentación con entradas de imagen y audio: aunque no verificadas por el autor, las sesiones de visión y audio cargan, lo que habilita pruebas de pipelines multimodales en local antes de comprometerse con infraestructura mayor.
- Validación de despliegues en hardware Intel: el paquete CPU funciona con OpenVINO EP 1.8.1 en GPU Intel fuera de Foundry Local, útil para entornos con aceleración integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad y velocidad:

| Paquete | Runner | Dispositivo | Claves correctas | Texto idéntico a HF | Primer token idéntico a HF |
|---|---|---|---|---|---|
| `cuda-int4-8k` | Foundry Local 0.13.0 | RTX 5080 Laptop | 20/20 PASS | 13/24 | no disponible |
| `cpu-int4` | Foundry Local 0.13.0 | Core Ultra 9 386H | 20/20 PASS | 13/24 | no disponible |
| `cuda-int4-8k` (contexto 131.072) | ONNX Runtime GenAI 0.19.0 | RTX 5080 Laptop | 20/20 PASS | 13/24 | 22/24 (Δ abs máx. 34,4) |
| `cpu-int4` | ONNX Runtime GenAI 0.19.0 | Core Ultra 9 386H | 20/20 PASS | 13/24 | 22/24 (Δ abs máx. 33,8) |

| Paquete | Dispositivo | Decodificación | Primer token | Memoria GPU máxima del daemon |
|---|---|---|---|---|
| `cuda-int4-8k` | RTX 5080 Laptop, CUDA EP | 58,8 tokens/s | 246 ms | 13.294 MiB |
| `cpu-int4` | Core Ultra 9 386H, CPU EP | 11,6 tokens/s | 20.195 ms | no aplica |

Tras una actualización de Windows el mismo día, el paquete CUDA bajó a 32 tokens/s en un equipo en reposo, y a 40-42 tokens/s limitando el daemon a los cuatro núcleos P. El paquete CPU bajó a 9,1 tokens/s con 33.072 ms hasta el primer token. La metodología: 24 prompts fijos, greedy, 48 tokens nuevos, comparados contra transformers 5.22.1 en bf16 en el mismo portátil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-Foundry-Local (este paquete) | no disponible | 8.192 (CUDA) / 131.072 (CPU) | ONNX Runtime GenAI, int4/int8 | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (referenciado) |
| mlboydaisuke/gemma-4-E4B-CoreAI | no disponible | no disponible | Core AI (.aimodel) | no disponible | Hugging Face, colección "Gemma 4 for Apple Core AI" |

La comparación con alternativas de la misma categoría (paquetes de despliegue local del mismo modelo base) se limita al paquete Core AI del mismo autor para iOS 27 / macOS 27, del que no se detallan especificaciones en la información disponible. No se dispone de datos para comparar con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Solo se verificaron prompts de texto: los encoders de visión y audio cargan, pero no se ejecutó ninguna entrada de imagen o audio, por lo que su corrección no está validada.
- En GPU de 16 GB conviene mantener el contexto corto: con 131.072 tokens el paquete llenó la GPU durante los 24 prompts y llegó a 15 s hasta el primer token en una ejecución previa a la actualización de Windows.
- La cuantización int4 del decoder degrada la fidelidad: el texto difiere del modelo en bf16 en 11 de 24 prompts; con decoder fp16 la coincidencia sube a 22 de 24.
- Foundry Local 0.13.0 no carga estos paquetes con el execution provider OpenVINO en GPU Intel, NPU ni CPU (issue microsoft/Foundry-Local#1261), y los modelos locales no admiten WebGPU EP.
- La NPU no compila estos grafos por las formas dinámicas (277 subgrafos con `enable_causallm`).
- El rendimiento depende de la colocación de CPU del daemon: la decodificación CUDA se limita por CPU (utilización de GPU observada del 21 al 43 %), y una actualización de Windows redujo la velocidad de 58,8 a 32 tokens/s sin cambios en el modelo ni en los drivers.
- La ruta documentada de caché de Foundry Local (`foundry cache cd` con `inference_model.json`) no listó estos paquetes con la CLI 0.13.0; es necesario usar `foundry model register`.
- Los modelos locales registrados responden por REST en `/catalogs/local/v1`; la ruta `/v1` devuelve HTTP 404 para ellos.
- No hay información sobre sesgos, idiomas soportados ni restricciones adicionales de la licencia Apache 2.0 más allá de las del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/gemma-4-E4B-it-Foundry-Local
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de pasos, scripts y resultados: https://github.com/john-rocky/gemma-4-e4b-on-foundry-local
- Herramienta de exportación Mobius: https://github.com/onnxruntime/mobius
- Recetas de cuantización Olive para Gemma 4 E2B: https://github.com/microsoft/olive-recipes/tree/main/google-gemma-4-E2B-it
- Issue de Foundry Local sobre OpenVINO EP: https://github.com/microsoft/Foundry-Local/issues/1261
- Paquete Core AI del mismo autor: https://huggingface.co/mlboydaisuke/gemma-4-E4B-CoreAI
- Colección Gemma 4 para Apple Core AI: https://huggingface.co/collections/mlboydaisuke/gemma-4-for-apple-core-ai
