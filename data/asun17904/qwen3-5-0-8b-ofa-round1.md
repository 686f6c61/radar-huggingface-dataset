# asun17904/Qwen3.5-0.8B-OFA-Round1

## Resumen

Qwen3.5-0.8B-OFA-Round1 es un checkpoint intermedio de calibración "once-for-all" (OFA) del backbone de texto del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario asun17904 en Hugging Face. No se trata de un modelo entrenado para uso general, sino de un artefacto de investigación orientado a estudiar la reutilización de cabezas de atención, MLPs y capas congeladas dentro de grafos computacionales modificados. El modelo conserva exactamente los 752.393.024 parámetros únicos del modelo base y se carga como un `Qwen3_5ForCausalLM` estándar sin código remoto.

El checkpoint corresponde a la ronda 1 de un currículo planificado de 10 rondas y 5.000 actualizaciones de optimizador; esta release concreta refleja 500 actualizaciones y 49.152.000 objetivos de entrenamiento puntuados. La arquitectura subyacente es un transformer de 24 capas con embeddings de entrada/salida atados, y solo se incluye el backbone de texto: la torre de visión y el módulo de predicción multi-token del modelo original no están presentes.

Su relevancia es fundamentalmente metodológica: demuestra un flujo de exportación que preserva los valores FP32 guardados y permite a investigadores experimentar con intervenciones de grafo (omisión o duplicación de cabezas, ejecución extra de MLPs, repetición de capas) sin introducir nuevos parámetros. No obstante, el propio autor advierte que no reclama mejoras de precisión en MATH, robustez ante cambios arbitrarios de grafo ni la finalización del calendario de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), 24 capas, backbone de texto |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-0.8B, no validada tras la calibración OFA) |
| Tipos de cuantizacion | no disponible (exportado en FP32; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32, embeddings atados almacenados una sola vez) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas heredado de Qwen3.5-0.8B, con embeddings de entrada y salida atados. La calibración OFA no modifica el grafo estándar de Transformers: la generación convencional utiliza la arquitectura de lenguaje sin cambios, y las intervenciones de grafo requieren un ejecutor de grafo separado. Cada cinco actualizaciones, el entrenador muestrea un grafo a partir del baseline sin modificar, aplicando una intervención efectiva de entre varias familias: omisión de cabezas de atención, ejecución extra de cabezas, ejecución extra de MLPs, subconjuntos de capas repetidas o ejecución extra de componentes fuera de orden. Los componentes repetidos comparten los tensores de parámetros originales, por lo que no se introducen parámetros nuevos.

La inicialización es el modelo upstream post-entrenado en la revisión `2fc06364715b967f1860aea9cf38778875588b17`. El objetivo es la log-verosimilitud negativa del siguiente token sobre un flujo empaquetado de Dolma en inglés, reconstruido a partir de documentos tokenizados con GPT-2 y retokenizado con el tokenizador Qwen fijado (la reconstrucción no garantiza recuperación byte a byte). El lote global es de 96 secuencias de 1.024 objetivos puntuados, lo que arroja 49.152.000 objetivos en esta ronda. Se usa AdamW con parámetros maestros FP32 y autocast BF16, pico de learning rate de `1e-5`, 100 actualizaciones de warmup, decaimiento coseno hacia `1e-6`, weight decay cero y clipping de norma global 1.0. Una penalización anclada a la inicialización y una proyección restringen la distancia L2 relativa global de parámetros a un máximo del 1 % (región de confianza en espacio de parámetros, no una restricción tipo KL/PPO).

## Capacidades

- Generación de texto autoregresiva en inglés mediante `Qwen3_5ForCausalLM` estándar.
- Conversación con plantilla de chat (`apply_chat_template`) y modo "thinking" desactivable mediante `enable_thinking=False`.
- Razonamiento y respuesta a preguntas simples (el ejemplo de la model card resuelve "What is 2 + 2?").
- Soporte de intervenciones de grafo OFA (omisión/duplicación de cabezas, MLPs extra, capas repetidas) mediante ejecutor de grafo externo.
- No incluye tool calling, function calling ni capacidades de agente documentadas en esta release.
- No incluye visión ni audio: la torre de visión del modelo base está ausente.
- Capacidades multilingües limitadas al inglés según la metadata de la model card.

## Casos de uso

- Investigación en arquitecturas once-for-all: servir como punto de partida para estudiar cómo se comportan cabezas de atención y MLPs congelados al reutilizarse en grafos modificados, aprovechando que los componentes repetidos comparten tensores.
- Búsqueda de arquitecturas (NAS) con superposición de pesos: emplear el checkpoint como snapshot intermedio para comparar el efecto de distintas familias de intervención (omisión de cabezas, MLPs extra, capas repetidas) sobre la pérdida de siguiente token.
- Validación de pipelines de exportación: verificar que un flujo que preserva valores FP32 y almacena embeddings atados una sola vez produce artefactos cargables con `transformers==5.22.1` y `safetensors==0.8.0`.
- Reproducibilidad de recetas de entrenamiento: contrastar la receta documentada en `recipe.json` (AdamW, pico `1e-5`, warmup 100, decaimiento coseno, clipping 1.0) contra ejecuciones propias sobre el mismo flujo Dolma empaquetado.
- Estudio de regiones de confianza en espacio de parámetros: analizar el efecto de la penalización anclada a la inicialización que limita la distancia L2 relativa al 1 % frente a restricciones tipo KL.
- Baseline controlado para ablaciones: usar el grafo sin modificar (24 capas, generación estándar) como referencia frente a variantes con intervenciones OFA en experimentos de investigación.
- Pruebas de integridad de artefactos: comprobar el hash SHA-256 del snapshot fuente (`0550d33e...`) y los metadatos de `provenance.json` en pipelines de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la release no reclama mejoras de precisión en MATH ni robustez ante cambios arbitrarios de grafo, y que las comprobaciones de carga y exportación establecen integridad del artefacto, no calidad downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,0 GB solo para pesos (752 M parámetros × 4 bytes), más overhead de activaciones y caché KV; el tamaño del repo es de 3,0 GB.
- VRAM estimada en BF16/FP16 (si se convierte manualmente): aproximadamente 1,5 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP32; una RTX 3060/4060 o superior es suficiente. Para entrenamiento o calibración con lotes de 96 secuencias de 1.024 tokens se recomiendan A100/H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 6 GB o más en FP32.
- Opciones de despliegue: `transformers` (verificado con `transformers==5.22.1`, `torch==2.9.1`, `safetensors==0.8.0`); `attn_implementation="eager"` recomendado para preservar el comportamiento. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI en esta release.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| asun17904/Qwen3.5-0.8B-OFA-Round1 | 752.393.024 | no disponible | apache-2.0 | Checkpoint de calibración OFA para investigación | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B (no confirmado en la información) | no disponible | apache-2.0 | Modelo post-entrenado de uso general con visión y predicción multi-token | Hugging Face |
| Alternativas de ~0,8 B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de la misma categoría no está disponible en la información proporcionada; el único comparable documentado es el modelo base Qwen3.5-0.8B, del que este checkpoint deriva y del que se diferencia por ser un artefacto de investigación sin torre de visión ni módulo de predicción multi-token.

## Limitaciones y advertencias

- Es un checkpoint intermedio (ronda 1 de 10, 500 de 5.000 actualizaciones), no un modelo final; no debe evaluarse como modelo de producción.
- El autor no reclama mejoras de precisión en MATH, robustez ante cambios arbitrarios de grafo ni finalización del calendario de calibración.
- La longitud de contexto heredada no ha sido validada tras la calibración OFA.
- Solo incluye el backbone de texto; no hay visión ni predicción multi-token.
- Idioma limitado al inglés según la metadata; no se documentan capacidades multilingües.
- La reconstrucción del flujo Dolma no garantiza recuperación byte a byte de los documentos originales.
- Las intervenciones de grafo OFA requieren un ejecutor de grafo separado; la generación estándar no las aplica.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero inherentes a un modelo de ~0,8 B entrenado sobre Dolma en inglés.
- Licencia Apache 2.0 heredada de Qwen3.5-0.8B; se incluye el archivo `LICENSE` del upstream. No se documentan restricciones adicionales para uso comercial, aunque el propósito declarado es la investigación.
- El uso de `attn_implementation="eager"` y `dtype="auto"` es necesario para preservar los valores FP32 liberados; otras configuraciones pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Receta de entrenamiento (`recipe.json`): https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round1/blob/main/recipe.json
- Procedencia (`provenance.json`): https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round1/blob/main/provenance.json
- Licencia: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round1/blob/main/LICENSE
