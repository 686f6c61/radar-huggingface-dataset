# KvcHub/KaiLu3

## Resumen

KaiLu 3 es un modelo de lenguaje conversacional de 329.353.216 parámetros desarrollado desde cero por KvcHub. Se presenta como un modelo pequeno orientado a generacion de texto y dialogo, con una arquitectura hibrida que combina 16 capas de convolucion corta con compuertas (kernel 3) y 8 capas de atencion, siguiendo el diseno de capas de LFM2 pero sin reutilizar pesos de dicho modelo. El contexto maximo es de 1.024 tokens y el vocabulario de 32.768 tokens con BPE a nivel de byte.

El modelo fue preentrenado con 6,6B tokens procedentes de una mezcla de web educativa (FineWeb-Edu), libros de texto sinteticos (Cosmopedia v2), web general y libros (SlimPajama-6B sin Books3), matematicas (FineMath 4+), Wikipedia y codigo (OpenCoder annealing). Posteriormente recibio un ajuste supervisado con unas 460K conversaciones de smol-smoltalk y un ajuste de preferencias mediante DPO (beta = 0,1) con pares de UltraFeedback, HelpSteer2 y Anthropic HH-RLHF.

Es relevante ahora como ejemplo de modelo pequeno entrenado integramente desde cero con un pipeline completo de preentrenamiento, SFT y DPO, y por su arquitectura hibrida convolution-atencion, que busca reducir coste computacional en secuencias cortas. Su licencia restringe el uso comercial sin permiso previo, lo que condiciona su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de convolucion corta con compuertas (kernel 3) + 8 capas de atencion (capas 3, 6, 9, 12, 15, 18, 21, 23); clase `Lfm2ForCausalLM` |
| Parametros totales | 329.353.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el repo incluye safetensors y GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | kailu-3-license (uso personal gratuito; uso comercial requiere permiso de KvcHub) |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

KaiLu 3 emplea un transformer hibrido de 24 capas: 16 capas de convolucion corta con compuertas (kernel 3) y 8 capas de atencion intercaladas en las posiciones 3, 6, 9, 12, 15, 18, 21 y 23. La anchura oculta es de 1.024 y la feed-forward SwiGLU de 2.816. La atencion usa 16 cabezas de consulta y 4 cabezas clave-valor (grouped-query attention), con QK-norm y RoPE con theta = 1.000.000. Los embeddings de entrada y salida estan compartidos. El modelo usa la clase `Lfm2ForCausalLM` de Transformers (4.54+) y comparte unicamente la disposicion de capas de LFM2, sin contener pesos de LFM2.

El entrenamiento consta de tres fases. Primero, un preentrenamiento con 6,6B tokens mezclados asi: web educativa FineWeb-Edu 50%, libros de texto sinteticos Cosmopedia v2 18%, web general y libros SlimPajama-6B sin Books3 12%, matematicas FineMath 4+ 8%, Wikipedia 6% y codigo OpenCoder annealing 6%. Segundo, un ajuste supervisado con aproximadamente 460K conversaciones de smol-smoltalk en una pasada, calculando la perdida solo sobre las respuestas del asistente. Tercero, un ajuste de preferencias mediante DPO con beta = 0,1 sobre pares de UltraFeedback (binarizado), HelpSteer2 y Anthropic HH-RLHF, hasta 60K pares. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del esquema hibrido convolution-atencion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con formato de chat basado en `<|system|>`, `<|user|>` y `<|assistant|>`, cerrando cada respuesta con `<|endoftext|>`.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general, con especial presencia de contenido educativo y matematico en el preentrenamiento.
- Generacion de codigo a nivel basico, apoyada por el 6% de tokens de codigo OpenCoder en el preentrenamiento.
- Capacidad matematica limitada por el entrenamiento con FineMath 4+ y el tamano del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional ligero en ingles: el modelo puede mantener dialogos multi-turno dentro de su ventana de 1.024 tokens, adecuado para prototipos y demos de chatbot con coste de inferencia muy bajo.
- Generacion de respuestas educativas breves: gracias al 50% de FineWeb-Edu y al 18% de Cosmopedia v2 en el preentrenamiento, puede redactar explicaciones cortas de conceptos basicos para entornos de aprendizaje.
- Generacion de codigo en entornos de prueba: con 6% de tokens de codigo, sirve para autocompletar fragmentos sencillos o generar ejemplos didacticos, no para produccion critica.
- Filtrado y clasificacion de texto corto: su tamano permite desplegarlo en CPU o GPU de gama baja para tareas de etiquetado, resumen breve o reescritura de fragmentos de hasta 1.024 tokens.
- Base para experimentacion en arquitecturas hibridas: investigadores pueden usar los pesos para estudiar el comportamiento de capas de convolucion corta frente a atencion en modelos pequenos, con un pipeline documentado de SFT y DPO.
- Evaluacion de alineacion y preferencias: al haber sido ajustado con DPO sobre UltraFeedback, HelpSteer2 y HH-RLHF, sirve como banco de pruebas para comparar tecnicas de preference tuning en modelos de menos de 1B parametros.
- Despliegue en dispositivos con recursos limitados: los pesos en bfloat16 (1,3 GB de repo) y la disponibilidad de GGUF permiten ejecucion en portatiles o entornos embebidos para tareas de generacion de texto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,66 GB (329M parametros x 2 bytes); en cuantizacion de 8 bits, unos 0,33 GB, y en 4 bits, unos 0,17 GB, sin contar el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes y quedaran limitadas por el ancho de banda mas que por la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Transformers (clase `Lfm2ForCausalLM`, version 4.54+), llama.cpp y Ollama mediante los pesos GGUF del repo. vLLM y TGI: no disponible su soporte en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Idiomas |
|---|---|---|---|---|---|
| KaiLu 3 | 329M | 1.024 | Hibrida (convolucion corta + atencion) | kailu-3-license (comercial con permiso) | en |
| SmolLM2-360M | 362M | 8.192 | Transformer denso | Apache 2.0 | en (multilingue parcial) |
| Qwen2.5-0.5B | 494M | 32.768 | Transformer denso | Apache 2.0 | multilingue |
| LFM2-350M | 350M | 32.768 | Hibrida (convolucion + atencion) | no disponible en la informacion | multilingue |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de resultados de benchmarks de KaiLu 3 para comparar rendimiento numerico. KaiLu 3 destaca por su contexto reducido (1.024 tokens) frente a alternativas con contextos de 8K a 32K, y por una licencia mas restrictiva que las licencias Apache 2.0 de SmolLM2 y Qwen2.5.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo; al entrenarse con web, libros y datos sinteticos, puede reproducir sesgos presentes en esas fuentes.
- Riesgo de alucinacion: el propio autor advierte que el modelo puede afirmar hechos incorrectos con confianza.
- Limitaciones de contexto: la ventana de 1.024 tokens es muy corta y provoca perdida de hilo en conversaciones largas.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Codigo: el autor advierte que puede generar codigo con errores.
- Restricciones de licencia: el uso comercial requiere permiso previo de KvcHub (hello@kvchub.com); el uso personal y no comercial es gratuito. Los datasets de entrenamiento conservan sus propias licencias.
- Seguridad: no se ha realizado ninguna evaluacion de seguridad mas alla del ajuste de preferencias, por lo que se recomienda revisar las respuestas antes de confiar en ellas.
- Produccion: el campo `inference: false` en la model card y la ausencia de benchmarks publicos desaconsejan su uso en entornos productivos sin una evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/KvcHub/KaiLu3
- Sitio del autor: https://kvchub.com
- Licencia (enlace de la model card, con marcador de posicion sin resolver): https://huggingface.co/<your-username>/KaiLu-3/blob/main/LICENSE
- Contacto comercial: hello@kvchub.com
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset SlimPajama-6B: https://huggingface.co/datasets/DKYoon/SlimPajama-6B
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset OpenCoder annealing: https://huggingface.co/datasets/OpenCoder-LLM/opc-annealing-corpus
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset UltraFeedback binarized: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset Anthropic HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
