# RedHatAI/SmolLM-360M-Instruct-quantized.w8a8

## Resumen

RedHatAI/SmolLM-360M-Instruct-quantized.w8a8 es la versión cuantizada en INT8 (W8A8) del modelo SmolLM-360M-Instruct, desarrollado originalmente por HuggingFace y cuantizado por Neural Magic bajo el paraguas de RedHatAI. La cuantización reduce el tamaño de los pesos y las activaciones de 16 bits a 8 bits, lo que recorta aproximadamente un 50 % el espacio en disco y los requisitos de memoria de GPU, manteniendo una degradación mínima de precisión en la mayoría de las tareas.

El modelo mantiene la arquitectura Llama del original, con 409 millones de parámetros, y está pensado para uso conversacional tipo asistente en inglés. Su principal valor es el despliegue eficiente en entornos con recursos limitados, como CPU, GPU de consumo o infraestructuras de inferencia con restricciones de memoria, sin renunciar a un rendimiento aceptable en tareas de razonamiento y comprensión del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 409.007.040 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en la model card |
| Tipos de cuantizacion | INT8 (W8A8): pesos con esquema estatico simetrico por canal; activaciones con esquema dinamico simetrico por token |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una version cuantizada de SmolLM-360M-Instruct, que a su vez se basa en una arquitectura Llama de 360 millones de parametros. La cuantizacion se aplica exclusivamente a los operadores lineales dentro de los bloques del transformador, dejando fuera la capa de salida (lm_head). Para los pesos se usa un esquema estatico simetrico por canal, donde cada canal de salida tiene un factor de escala fijo; para las activaciones se emplea un esquema dinamico simetrico por token, calculando el factor de escala en tiempo de ejecucion para cada token.

El proceso de cuantizacion se realizo con el algoritmo GPTQ, implementado en la libreria llm-compressor, utilizando un factor de amortiguacion del 1 % y 1.024 secuencias extraidas del dataset de calibracion de Neural Magic (LLM_compression_calibration). No se trata de un entrenamiento adicional, sino de una cuantizacion post-entrenamiento, por lo que las capacidades del modelo base se conservan con una ligera perdida de precision.

## Capacidades

- Generacion de texto conversacional en ingles, pensado para interacciones tipo asistente de chat.
- Razonamiento basico y comprension del lenguaje, con resultados comparables al modelo sin cuantizar en tareas como MMLU y ARC Challenge.
- Soporte limitado para matematicas elementales (GSM-8K) y comprension de sentido comun (Hellaswag).
- No dispone de capacidades de vision, audio ni multimodalidad.
- No soporta tool calling ni function calling de forma nativa.
- No esta diseñado para razonamiento multi-paso complejo ni para uso en idiomas distintos del ingles.

## Casos de uso

- **Chatbots de bajo coste en produccion**: el modelo puede gestionar conversaciones simples en ingles con una latencia baja y un consumo de memoria reducido, ideal para sistemas de atencion al cliente o asistentes virtuales en entornos con presupuesto limitado.
- **Prototipado rapido de aplicaciones de lenguaje**: por su tamaño reducido, permite iterar rapidamente en el desarrollo de aplicaciones de generacion de texto sin necesidad de infraestructura de alto rendimiento.
- **Despliegue en dispositivos perifericos**: al ocupar aproximadamente 0,5 GB en disco y requerir menos de 1 GB de VRAM en INT8, puede ejecutarse en GPU de gama baja o incluso en CPU, adecuado para entornos de edge computing.
- **Pruebas de concepto con vLLM**: su compatibilidad con vLLM facilita la evaluacion de arquitecturas de inferencia eficientes y la integracion en pipelines de servicios OpenAI-compatibles.
- **Generacion de respuestas en aplicaciones de educacion**: puede servir como base para tutores virtuales o generadores de ejercicios en ingles, gracias a su capacidad de producir texto coherente en contextos sencillos.
- **Filtrado y clasificacion de texto**: su tamaño compacto permite usarlo en tareas de clasificacion de contenido en ingles, como etiquetado de documentos o deteccion de temas, cuando se combina con tecnicas de prompting.

## Benchmarks y rendimiento

Segun la model card, el modelo fue evaluado en las tareas del OpenLLM leaderboard (version 1) con lm-evaluation-harness y el motor vLLM. La siguiente tabla muestra los resultados comparados con el modelo base sin cuantizar:

| Benchmark | SmolLM-360M-Instruct (sin cuantizar) | SmolLM-360M-Instruct-quantized.w8a8 | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 25.69 | 25.77 | 100.3 % |
| ARC Challenge (25-shot) | 37.46 | 38.05 | 101.6 % |
| GSM-8K (5-shot, strict-match) | 2.05 | 1.44 | 70.4 % |
| Hellaswag (10-shot) | 51.72 | 52.02 | 100.6 % |
| Promedio OpenLLM | 35.15 | 35.49 | 100.9 % |

La cuantizacion INT8 no solo no degrada el rendimiento en la mayoria de las tareas, sino que en algunos casos muestra una ligera mejora. Sin embargo, en GSM-8K la perdida es significativa (recuperacion del 70.4 %), lo que indica una sensibilidad mayor en tareas de razonamiento aritmetico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0.5 GB para los pesos en INT8, mas overhead de activaciones; en total se recomienda al menos 1-2 GB de VRAM para una ejecucion comoda.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de memoria, como NVIDIA GTX 1650, RTX 2060, o superiores; tambien puede ejecutarse en CPU con un rendimiento aceptable.
- **Compatibilidad con GPU de consumo**: si, el modelo cabe sin problema en GPU de gama media y baja.
- **Opciones de despliegue**: compatible con vLLM, Text Generation Inference (TGI) y la libreria transformers. No se menciona soporte para llama.cpp u Ollama en la documentacion.
- **Latencia y throughput**: no se han publicado datos concretos; al ser un modelo de 409 M parametros, la latencia es baja, pero depende del hardware y del backend utilizado.

## Comparativa con modelos similares

El modelo se compara principalmente con su version sin cuantizar y con otros modelos pequenos de la misma categoria, aunque no se disponen de datos de benchmarks para estos ultimos en la informacion disponible.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-360M-Instruct (base) | 409 M | FP16 | no especificado | Apache-2.0 | HuggingFace |
| SmolLM-360M-Instruct-quantized.w8a8 | 409 M | INT8 | no especificado | Apache-2.0 | HuggingFace |
| TinyLlama-1.1B | 1.1 B | FP16 | 2048 | Apache-2.0 | HuggingFace |
| Qwen2-0.5B-Instruct | 494 M | FP16 | 32768 | Apache-2.0 | HuggingFace |

No se han realizado comparativas directas con estos modelos en la informacion proporcionada, por lo que los datos de rendimiento relativos no estan disponibles.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles. Su uso en otros idiomas esta fuera de alcance y puede producir resultados incoherentes.
- **Alucinaciones**: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos de conocimiento factual.
- **Degradacion en tareas de razonamiento**: la cuantizacion afecta notablemente a tareas como GSM-8K, donde la recuperacion es solo del 70.4 %; no es adecuado para aplicaciones que requieran calculo o logica rigurosa.
- **Tamaño limitado**: con 409 M parametros, la capacidad de razonamiento complejo y de mantener contextos largos es reducida; no es comparable con modelos de 7B o superiores.
- **Contexto no especificado**: no se documenta la longitud maxima de contexto soportada, lo que obliga a realizar pruebas propias antes de su uso en produccion.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda revisar las restricciones de la licencia del modelo base original.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RedHatAI/SmolLM-360M-Instruct-quantized.w8a8)
- [Modelo base SmolLM-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct)
- [Documentacion de vLLM](https://docs.vllm.ai/en/latest/)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Paper GPTQ (arxiv:2210.17323)](https://arxiv.org/abs/2210.17323)
- [Dataset de calibracion de Neural Magic](https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration)
- [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
