# Maxilicious20/Velqora-95M-Base

## Resumen

Velqora-95M-Base es un modelo de lenguaje causal decoder-only de 94.561.681 parámetros (aproximadamente 94,56 M) entrenado desde inicialización aleatoria por el desarrollador independiente Maxilicious20. Se trata de un checkpoint base (no ajustado por instrucciones) orientado al inglés, concebido como experimento de investigación sobre arquitecturas transformer compactas y su entrenamiento en hardware de consumo: todo el preentrenamiento se realizó en una única NVIDIA GeForce RTX 4060 de 8 GB bajo Windows 11.

El modelo emplea una arquitectura propia denominada VelqoraNextGen, con 18 capas, tamaño oculto de 640, atención con grouped-query attention (10 cabezas de consulta y 5 de clave-valor), QK-Norm, value residuals en la capa 0, feed-forward SwiGLU de 1.792 dimensiones, RMSNorm, RoPE con base 50.000 y embeddings de entrada/salida atados. La ventana de contexto máxima es de 4.096 tokens y utiliza un tokenizador BPE a nivel de byte propio de 16.384 tokens.

Su relevancia es fundamentalmente metodológica: demuestra que es posible entrenar un modelo de casi 95 M de parámetros desde cero en una GPU consumer y publicar los pesos en safetensors bajo licencia Apache-2.0, lo que lo convierte en un banco de pruebas útil para estudiar componentes modernos (GQA, QK-Norm, value residuals) y para experimentos de inferencia en el borde. No está pensado para producción ni para tareas que requieran fiabilidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (VelqoraNextGen), 18 capas, hidden size 640, SwiGLU FFN de 1.792, RMSNorm, RoPE (θ = 50.000) |
| Parametros totales | 94.561.681 (~94,56 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Pesos publicados en bfloat16; existe repositorio GGUF companion (Maxilicious20/Velqora-95M-Base-GGUF), niveles concretos no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), checkpoint PyTorch (.pt) y GGUF en repositorio separado |

## Arquitectura y entrenamiento

Velqora-95M-Base es un transformer decoder-only de 18 capas con tamaño oculto de 640 y atención con grouped-query attention: 10 cabezas de consulta frente a 5 cabezas de clave-valor, lo que reduce el coste de memoria del KV cache. Incorpora QK-Norm para estabilizar la atención, value residuals en la capa 0 (conexión residual sobre los valores de la primera capa, técnica popularizada en modelos recientes), feed-forward SwiGLU de 1.792 dimensiones, normalización RMSNorm y embeddings de entrada/salida atados. La implementación es PyTorch personalizada (no usa `AutoModelForCausalLM`), apoyada en `scaled_dot_product_attention` y precisión bfloat16, con un tokenizador BPE a nivel de byte propio de 16.384 tokens.

El entrenamiento se realizó desde inicialización aleatoria con predicción de siguiente token sobre datasets educativos y narrativos: HuggingFaceTB/cosmopedia-100k, HuggingFaceFW/fineweb-edu y roneneldan/TinyStories. Todo el preentrenamiento se ejecutó en una única RTX 4060 de 8 GB bajo Windows 11. La mejor pérdida de validación reportada es 4,6043. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (al ser un checkpoint base, no se espera ajuste por preferencias).

## Capacidades

- Generación de texto causal en inglés: continuación de texto libre hasta 4.096 tokens.
- Razonamiento básico y respuesta a preguntas simples en formato de continuación, no de instrucción.
- Capacidad limitada de aritmética y código, propia de un modelo de ~95 M entrenado desde cero en hardware consumer.
- No dispone de tool calling ni function calling documentados.
- No dispone de soporte de agentes ni de razonamiento multi-paso estructurado.
- Multilingüe: no; el modelo es English-first y no se documentan otros idiomas.
- No incluye modo thinking, visión ni audio.
- Al ser un modelo base, no soporta plantillas de chat tipo ChatML; se debe prompting con texto natural.

## Casos de uso

- Investigación sobre arquitecturas compactas: sirve como referencia reproducible para estudiar el efecto de GQA, QK-Norm, value residuals y SwiGLU en modelos de menos de 100 M de parámetros, comparando configuraciones sobre el mismo corpus.
- Experimentos de inferencia en el borde: con ~95 M de parámetros y pesos bfloat16 (unos 190 MB), cabe holgadamente en dispositivos con poca memoria y permite probar decodificación en CPU, Raspberry Pi o GPUs integradas.
- Estudio educativo de tokenizadores: su BPE a nivel de byte de 16.384 tokens permite analizar el impacto del vocabulario en modelos pequeños y en dominios concretos (narrativa, texto educativo).
- Fine-tuning ligero para dominios acotados: al ser base y Apache-2.0, puede ajustarse para generación de texto en nichos como resúmenes de cuentos o texto divulgativo, siempre con validación humana.
- Benchmark de pipelines GGUF: el repositorio companion GGUF facilita medir latencia y throughput de llama.cpp u Ollama en hardware modesto con un modelo de referencia pequeño.
- Docencia y divulgación: útil para explicar el ciclo completo de preentrenamiento (tokenización, pérdida de validación, checkpoints) con un modelo cuyo coste de entrenamiento es asumible en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la mejor pérdida de validación: 4,6043.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bfloat16 (unos 190 MB de pesos); en FP32, alrededor de 0,38 GB. El KV cache para 4.096 tokens es reducido gracias a GQA (5 cabezas KV).
- GPU recomendadas: cualquier GPU con 1 GB o más de VRAM es suficiente; una RTX 4060 (la usada para entrenar) o superior ofrece margen amplio. A100/H100 no aportan ventaja práctica para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Opciones de despliegue: script `run_inference.py` incluido (PyTorch + safetensors + tokenizers); repositorio GGUF companion para llama.cpp/Ollama. Compatibilidad con vLLM o TGI no está documentada, ya que la arquitectura es personalizada y no usa `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Velqora-95M-Base | ~94,56 M | 4.096 | Apache-2.0 | Entrenado desde cero en una RTX 4060; arquitectura propia; solo inglés |
| SmolLM-135M (HuggingFace) | ~135 M | 2.048 | Apache-2.0 | Entrenado sobre corpus web curado a mayor escala; referencia habitual para modelos pequeños |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Apache-2.0 | Un orden de magnitud mayor; requiere más recursos |
| GPT-2 small | ~124 M | 1.024 | MIT | Referencia clásica; tokenizador y arquitectura antiguos |

La comparación con SmolLM-135M, TinyLlama-1.1B y GPT-2 small se ofrece como referencia de categoría; no se dispone de resultados de benchmarks de Velqora-95M-Base que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Alucinación factual: el autor advierte explícitamente de que el modelo puede inventar hechos, cometer errores aritméticos y fallar en instrucciones complejas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre fineweb-edu, cosmopedia-100k y TinyStories, puede heredar sesgos de esos corpus.
- Idioma: solo inglés; no se garantiza un comportamiento aceptable en castellano u otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni soporta plantillas de chat.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en tareas médicas, legales, financieras o de seguridad crítica.
- Implementación no estándar: requiere el código `velqora/model.py` del repositorio; no es cargable directamente con `AutoModelForCausalLM`, lo que complica su integración en frameworks estándar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto de investigación sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxilicious20/Velqora-95M-Base
- Repositorio GGUF companion: https://huggingface.co/Maxilicious20/Velqora-95M-Base-GGUF
- Perfil del autor: https://huggingface.co/Maxilicious20
- Dataset Cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
