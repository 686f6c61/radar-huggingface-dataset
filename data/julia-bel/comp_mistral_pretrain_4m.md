# julia-bel/comp_mistral_pretrain_4M

## Resumen

`comp_mistral_pretrain_4M` es un checkpoint de pretrain del modelo de compresión de contexto estilo PISCO desarrollado por julia-bel. Sigue el paradigma *compress-then-generate*: un compresor basado en Llama-3.2-1B-Instruct transforma un pasaje de 128 tokens en 8 embeddings de memoria (tasa de compresión 16), y un decodificador Mistral-7B-Instruct-v0.2 adaptado con LoRA genera texto a partir de esos embeddings. El objetivo es reducir el coste computacional de procesar contextos largos almacenando información comprimida en un espacio latente.

Este checkpoint corresponde a la tercera etapa de entrenamiento, con 4 millones de muestras en total sobre el dataset `EleutherAI/SmolLM2-135M-10B`. No ha sido fine-tuneado en ninguna tarea downstream, por lo que sus capacidades se limitan a autoencoding y continuación de texto. Su relevancia radica en ser una implementación práctica del enfoque PISCO (arxiv 2501.16075), que propone una alternativa a la atención de contexto completo mediante memorias comprimidas entrenables.

El modelo combina dos arquitecturas base: un compresor de 1B parámetros (Llama 3.2) y un decodificador de 7B (Mistral 7B), con un conector MLP entre ambos. La ventana del compresor es de 128 tokens y la del decodificador de 512 tokens. Se distribuye bajo la licencia Llama 3.2 Community License para el compresor y Apache 2.0 para el adaptador del decodificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PISCO: compresor Llama-3.2-1B-Instruct + conector MLP (Linear 2048→4096, ReLU, Linear 4096→4096) + decodificador Mistral-7B-Instruct-v0.2 con LoRA r=64 |
| Parametros totales | No disponible (compresor ~1B + decodificador ~7B + LoRA, sin cifra oficial agregada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Compresor: 128 tokens; decodificador: 512 tokens (ventana efectiva total) |
| Tipos de cuantizacion | No disponible (pesos en bf16, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 Community License (compresor); Apache 2.0 (adaptador del decodificador) |
| Formato de pesos | Safetensors (compresor), .pt (conector y decoder_state) |

## Arquitectura y entrenamiento

El modelo sigue el esquema PISCO: un compresor transformer (Llama-3.2-1B-Instruct) procesa un pasaje de 128 tokens y produce 8 embeddings de memoria, que se conectan al decodificador mediante un MLP de dos capas con ReLU. El decodificador es Mistral-7B-Instruct-v0.2 con LoRA de rango 64 aplicada a todas las capas lineales, más una redimensión de `embed_tokens` y `lm_head` para incluir dos tokens especiales añadidos: `<MEM>` (slots de memoria) y `<AE>` (prompt de autoencoding). La matriz de embeddings del decodificador tiene 32.002 filas.

El entrenamiento se realizó en tres etapas consecutivas sobre el dataset `EleutherAI/SmolLM2-135M-10B`, con 4M muestras en total (0.5M + 1.5M + 2M). El objetivo combina 50% autoencoding (reconstruir el pasaje original desde los embeddings de memoria, usando el token `<AE>`) y 50% continuación de texto. Los hiperparámetros de la etapa 3 incluyen learning rate 1e-4 con decaimiento lineal, warmup ratio 0.05, weight decay 0.1, batch efectivo 1024 (4 GPUs × 4 × 64 acumulación de gradientes), precisión bf16, max grad norm 1.0 y seed 42. La reconstrucción por autoencoding ya estaba saturada tras 2M muestras; las últimas 2M redujeron principalmente la pérdida de continuación de 1.207 a 1.184.

## Capacidades

- Compresión de contexto: convierte pasajes de 128 tokens en 8 embeddings de memoria, con tasa de compresión 16.
- Autoencoding: reconstruye el pasaje original desde los embeddings de memoria con precisión casi perfecta (Rouge-L y exact match 1.00 en el split de validación).
- Continuación de texto: genera texto coherente a partir de los embeddings comprimidos, con pérdida de 1.184 en el split held-out.
- Generación de texto condicionada por memorias comprimidas: el decodificador Mistral-7B genera usando los embeddings como contexto.
- Soporte de tokens especiales `<MEM>` y `<AE>` para controlar el flujo de compresión y generación.
- Multilingüismo: solo inglés, según la model card.
- No incluye tool calling, agentes ni razonamiento multi-paso, al ser un checkpoint de pretrain sin fine-tuning downstream.

## Casos de uso

- Investigación en compresión de contexto: permite estudiar cómo los embeddings de memoria capturan información semántica de pasajes largos, útil para validar el enfoque PISCO en entornos académicos.
- Prototipos de sistemas de diálogo con memoria comprimida: el decodificador puede generar respuestas condicionadas a memorias de conversaciones previas, aunque requiere fine-tuning adicional para tareas concretas.
- Experimentos de autoencoding: sirve como base para analizar la fidelidad de reconstrucción de pasajes comprimidos, con métricas de Rouge-L y exact match ya reportadas.
- Evaluación de la transferencia de conocimiento entre compresor y decodificador: al ser un checkpoint intermedio, permite estudiar cómo evoluciona la pérdida de continuación durante el pretrain.
- Desarrollo de pipelines de generación de texto con contexto comprimido: puede integrarse en sistemas que necesiten procesar documentos largos sin atención completa, aunque requiere adaptación.
- Benchmarking de arquitecturas híbridas: útil para comparar el rendimiento de compresión frente a otros métodos como summarización o retrieval, en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas sobre el split held-out del dataset de pretrain:

| Metrica | Valor |
|---|---|
| Autoencoding reconstruction, Rouge-L / exact match | 1.00 / 1.00 |
| Autoencoding loss con `<AE>` | 0.0002 |
| Text-continuation loss | 1.184 |
| Mixed eval loss / Rouge-L | ~0.95–1.02 / ~0.70 |

Estos valores indican que la reconstrucción por autoencoding está saturada, mientras que la continuación de texto aún tiene margen de mejora. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el compresor de 1B en bf16 requiere aproximadamente 2-3 GB; el decodificador de 7B en bf16 requiere unos 14-16 GB; el adaptador LoRA y el conector añaden una pequeña fracción. En total, se estiman 18-20 GB de VRAM para cargar el modelo completo en bf16.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4) para inferencia en bf16. Para entrenamiento o fine-tuning, se necesitarían GPUs de mayor capacidad como A100 (40/80 GB) o H100.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) si se usa bf16 sin cuantización adicional. No se han publicado versiones cuantizadas (GGUF, AWQ, etc.).
- Opciones de despliegue: el modelo requiere el paquete `pisco` (código de entrenamiento PISCO) y acceso al repositorio gated `mistralai/Mistral-7B-Instruct-v0.2`. No es compatible directamente con vLLM, llama.cpp u Ollama sin adaptaciones.
- Latencia y throughput: no disponible. Al ser un modelo de investigación sin optimizaciones de inferencia, no se han medido métricas de rendimiento.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos de compresión de contexto (como el PISCO original u otros enfoques de soft-prompt) en la información proporcionada. El modelo es un checkpoint de pretrain sin fine-tuning, lo que dificulta comparaciones directas con modelos de propósito general.

## Limitaciones y advertencias

- No está fine-tuneado para tareas downstream: solo ha sido entrenado con autoencoding y continuación de texto, por lo que no es adecuado para uso directo en producción sin adaptación.
- Dependencia del repositorio gated de Mistral: los pesos base del decodificador no están incluidos en el repo; se descargan de `mistralai/Mistral-7B-Instruct-v0.2`, que requiere acceso aprobado por HuggingFace.
- Requiere el paquete `pisco` para cargar el modelo, lo que limita su portabilidad a entornos que no tengan ese código.
- Licencia Llama 3.2 Community License: impone restricciones de uso comercial y requiere atribución; el adaptador del decodificador es Apache 2.0, pero el compresor está cubierto por la licencia de Llama.
- Solo soporta inglés: no hay capacidades multilingües.
- Riesgo de alucinación: al ser un modelo de generación de texto, puede producir contenido no fiel a los embeddings de memoria, especialmente en tareas de continuación.
- Sesgos: al entrenarse sobre SmolLM2-135M-10B, puede heredar sesgos presentes en ese dataset, aunque no se han documentado análisis específicos.
- Sin cuantizaciones disponibles: solo se distribuyen pesos en bf16, lo que limita el despliegue en hardware con poca VRAM.

## Enlaces

- HuggingFace: https://huggingface.co/julia-bel/comp_mistral_pretrain_4M
- Paper PISCO: https://arxiv.org/abs/2501.16075
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/SmolLM2-135M-10B
- Modelo base compresor: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo base decodificador: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
