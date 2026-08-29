# DK4AAD/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es un fine-tune del modelo Gemma 4 12B de Google DeepMind, desarrollado por HauhauCS y publicado en Hugging Face por DK4AAD. Su objetivo es eliminar los rechazos (refusals) del modelo base sin degradar sus capacidades originales: según las pruebas del autor, alcanza 0/465 rechazos en benchmarks automatizados y manuales. Está construido a partir de los pesos oficiales de Gemma 4 12B con entrenamiento consciente de cuantización (QAT), por lo que la versión en 4 bits mantiene una calidad cercana a la de precisión completa.

El modelo es multimodal (acepta texto e imágenes), tiene una ventana de contexto de 262 144 tokens y se distribuye en formato GGUF, pensado para ejecución local con llama.cpp, LM Studio, Jan o koboldcpp. Incluye además una cabeza de predicción multi-token (MTP) para decodificación especulativa, que según el autor acelera la generación aproximadamente un 60 % sin cambiar la salida. La variante "Balanced" está optimizada para tareas de agente, razonamiento, escritura creativa y fiabilidad, manteniendo un comportamiento razonado antes de responder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B) con encoder de vision, QAT |
| Parametros totales | 11 907 350 576 (11,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (texto), BF16 (mmproj de vision) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Gemma (terminos de Google DeepMind) |
| Formato de pesos | GGUF (texto), mmproj en BF16 |

## Arquitectura y entrenamiento

El modelo parte de los pesos oficiales de Gemma 4 12B it, que ya incorporan entrenamiento consciente de cuantizacion (QAT) para 4 bits. Sobre esa base, HauhauCS aplico un fine-tune de "desensura" (uncensoring) que elimina los rechazos del modelo original sin modificar los datasets de entrenamiento ni las capacidades funcionales. El resultado es un modelo denso de 12 B con entrada multimodal (texto e imagen) y una ventana de contexto de 262 144 tokens.

La innovacion principal es la inclusion de una cabeza de prediccion multi-token (MTP) como drafter para decodificacion especulativa, tomada de la version de Unsloth de Gemma 4. Esta cabeza genera varios tokens candidatos que el modelo principal verifica, lo que acelera la generacion aproximadamente un 60 % manteniendo la misma calidad de salida. El autor recomienda parametros de muestreo especificos (temperature 0.6, top_k 64, top_p 0.9, min_p 0.05, repeat_penalty 1.1) ajustados para este build concreto.

## Capacidades

- Generacion de texto, razonamiento y codigo: mantiene las capacidades del modelo base Gemma 4 12B, incluyendo tareas de programacion y razonamiento multi-paso.
- Entrada multimodal: acepta imagenes mediante el archivo mmproj (proyector de vision) cargado junto al modelo.
- Tool calling y uso agente: los tags del modelo indican soporte para funciones y flujos agente, adecuado para integraciones con APIs y ejecucion de herramientas.
- Escritura creativa y roleplay: la variante Balanced esta afinada para mantener calidad en narrativa, dialogo y personajes.
- Conversacion de contexto largo: con 262 144 tokens de ventana, puede manejar dialogos extensos o documentos largos sin perder el hilo.
- Decodificacion especulativa: la cabeza MTP incluida permite una generacion aproximadamente un 60 % mas rapida en runtimes compatibles (llama.cpp).
- Ausencia de rechazos: segun el autor, 0/465 en pruebas de refusal, lo que permite tratar temas que el modelo base bloquearia.

## Casos de uso

- Atencion al cliente automatizada: con 256K de contexto, puede gestionar conversaciones multi-turno con historial extenso y consultar bases de conocimiento internas, respondiendo sin los rechazos tipicos de modelos censurados.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo, con la ventaja de no negarse a tareas de programacion sensibles.
- Asistentes de escritura creativa y roleplay: la variante Balanced mantiene coherencia narrativa y profundidad de personaje, ideal para juegos de rol, novelas interactivas o guiones.
- Analisis de imagenes con razonamiento: al ser multimodal, puede describir y razonar sobre capturas de pantalla, diagramas o fotografias, combinando vision con generacion de texto.
- Agentes autonomos locales: con soporte agente y decodificacion especulativa, puede ejecutar tareas multi-paso en entornos locales (por ejemplo, automatizacion de tareas de oficina) con baja latencia.
- Despliegue en hardware modesto: al estar cuantizado en Q4_K_M (6,9 GB) y ser compatible con llama.cpp, puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM o incluso en CPU con suficiente RAM, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras pruebas estandar. La unica cifra de rendimiento mencionada es la aceleracion de aproximadamente un 60 % en velocidad de generacion gracias a la decodificacion especulativa con MTP, medida en llama.cpp, pero sin datos de latencia absoluta ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 6,9 GB, el mmproj 168 MB y el drafter MTP 242 MB. Con overhead de ejecucion, se recomienda al menos 8-10 GB de VRAM para cargar todo en GPU.
- GPU recomendadas: tarjetas de consumo con 8 GB o mas, como RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 o superiores. En el caso de LM Studio, el autor advierte que el modo tensor-split puede provocar cuelgues; es preferible usar una sola GPU con layer-split o prioridad.
- Ejecucion en CPU: posible con llama.cpp si se dispone de suficiente RAM (al menos 16 GB), aunque la velocidad sera menor.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli), LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF. Para usar la decodificacion especulativa, se debe cargar el drafter MTP con la opcion `--spec-type draft-mtp`.
- Latencia y throughput: no se proporcionan cifras concretas. La aceleracion del 60 % con MTP es relativa a la generacion sin drafter, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 11,9 B | 262 144 | Q4_K_M | Gemma | Hugging Face |
| google/gemma-4-12B-it (base) | 11,9 B | 262 144 | BF16, QAT | Gemma | Hugging Face |
| Llama 3.1 8B Instruct | 8 B | 131 072 | Multiples | Llama 3.1 | Hugging Face |
| Mistral 7B Instruct v0.3 | 7 B | 32 768 | Multiples | Apache 2.0 | Hugging Face |

La comparativa directa con otros fine-tunes "uncensored" de Gemma 4 no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia principal es la eliminacion de rechazos y la inclusion del drafter MTP. Frente a modelos de tamano similar como Llama 3.1 8B o Mistral 7B, este modelo ofrece mayor contexto y capacidades multimodales, pero su licencia Gemma es mas restrictiva que la Apache 2.0 de Mistral.

## Limitaciones y advertencias

- Idioma: la model card solo indica ingles. No se garantiza soporte para otros idiomas, aunque el modelo base de Gemma 4 podria tener cierta capacidad multilingue.
- Sesgos y contenido inapropiado: al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No se han realizado evaluaciones de sesgo o seguridad mas alla de las pruebas de refusal del autor.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos o datos, especialmente en tareas de razonamiento o codigo. No se han publicado metricas de fiabilidad.
- Licencia Gemma: los terminos de Google DeepMind para Gemma incluyen restricciones de uso comercial y obligaciones de atribucion. Es necesario revisar la licencia completa antes de desplegar en produccion.
- Cuantizacion unica: solo se ofrece Q4_K_M. Aunque el autor justifica que es el punto optimo por el QAT, no hay opciones de mayor precision para quienes prefieran calidad absoluta.
- Problemas conocidos con LM Studio: el modo tensor-split puede causar cuelgues; se recomienda usar una sola GPU.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar, lo que dificulta la comparacion rigurosa con otros modelos.
- Fecha de creacion reciente: el modelo se publico el 28 de agosto de 2026 y no tiene descargas ni valoraciones, por lo que su madurez en entornos reales no esta contrastada.

## Enlaces

- Modelo en Hugging Face (DK4AAD): https://huggingface.co/DK4AAD/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Model card original (HauhauCS): https://huggingface.co/HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma4-12b-qat-uncensored-hauhaucs-balanced-hauhaucs
- Ficha en AI Market Cap: https://aimarketcap.tech/models/hauhaucs-gemma4-12b-qat-uncensored-hauhaucs-balanced
- Ficha en ThinkLLM: https://thinkllm.dev/models/gemma4-12b-qat-uncensored-hauhaucs-balanced
- Modelo base de Google: https://huggingface.co/google/gemma-4-12B-it
