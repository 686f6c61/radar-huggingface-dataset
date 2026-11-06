# asun17904/Qwen3.5-0.8B-OFA-Round2

## Resumen

Qwen3.5-0.8B-OFA-Round2 es un checkpoint intermedio de calibración once-for-all (OFA) del backbone de texto de Qwen/Qwen3.5-0.8B, publicado por el usuario asun17904. No es un modelo entrenado para uso general, sino un artefacto de investigación orientado a estudiar la reutilización de cabezas de atención, MLPs y capas congeladas dentro de grafos computacionales modificados. El modelo conserva la arquitectura estándar de 24 capas del modelo base y se carga como un `Qwen3_5ForCausalLM` convencional sin código remoto personalizado.

El checkpoint contiene 752.393.024 parámetros únicos del modelo de lenguaje y representa la ronda 2 de un currículo planificado de 10 rondas y 5.000 actualizaciones de optimizador; esta entrega corresponde a 1.000 actualizaciones. La calibración se realizó sobre un flujo de Dolma en inglés, con un objetivo de verosimilitud negativa del siguiente token, y no incluye la torre de visión ni el módulo de predicción multi-token del modelo original.

Su relevancia es fundamentalmente metodológica: documenta cómo se pueden componer intervenciones de grafo (omisión de cabezas, ejecución extra de MLPs, reordenación de componentes) sin introducir nuevos parámetros, manteniendo los pesos dentro de una región de confianza del 1 % en distancia L2 relativa respecto a la inicialización. La licencia Apache 2.0 y el formato SafeTensors facilitan su inspección y reproducción, pero el autor advierte explícitamente de que no se reclama mejora en precisión ni robustez frente a cambios arbitrarios de grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`), 24 capas |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-0.8B, no validada tras la calibración OFA) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, embeddings de entrada/salida atados y almacenados una sola vez) |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-0.8B en la revisión `2fc06364715b967f1860aea9cf38778875588b17` y mantiene la arquitectura transformer decoder-only de 24 capas sin modificaciones estructurales en los pesos exportados. La innovación no reside en la arquitectura, sino en el procedimiento de calibración OFA: cada cinco actualizaciones, el entrenador muestrea un grafo a partir de la línea base sin cambios, componiendo una o dos intervenciones efectivas entre omisión de cabezas de atención, ejecución extra de cabezas, ejecución extra de MLPs, repetición de subconjuntos de capas y ejecución de componentes fuera de orden. Los componentes repetidos comparten los tensores de parámetros originales, por lo que no se añaden parámetros nuevos.

El entrenamiento usa AdamW con parámetros maestros en FP32 y autocast BF16, un pico de learning rate de `1e-5` con 100 actualizaciones de warmup y decaimiento coseno hacia `1e-6`, weight decay cero y clipping de norma global 1.0. El batch global es de 96 secuencias de 1.024 objetivos puntuados, lo que arroja 98.304.000 objetivos de entrenamiento puntuados en este checkpoint; el plan completo de 5.000 actualizaciones cubriría 491.520.000 objetivos sobre un flujo de 500.000.001 tokens. Una penalización anclada a la inicialización y una proyección restringen la distancia global relativa L2 de parámetros a un máximo del 1 %, configurando una región de confianza en el espacio de parámetros (no una restricción KL de política ni PPO). La receta exacta está en `recipe.json` y la procedencia en `provenance.json`.

## Capacidades

- Generación de texto autoregresiva estándar mediante `AutoModelForCausalLM` y `generate`.
- Soporte de plantilla de chat (`apply_chat_template`) con opción `enable_thinking=False`.
- Carga sin código remoto personalizado, compatible con el ecosistema Transformers.
- Inspección de intervenciones de grafo OFA mediante un ejecutor de grafo separado (no incluido en el repo).
- Capacidad multilingüe limitada al inglés según la model card.
- No incluye torre de visión ni módulo de predicción multi-token.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documentan modos de pensamiento extendido ni otras capacidades especiales más allá del flag `enable_thinking` heredado del tokenizador.

## Casos de uso

- Investigación en arquitecturas once-for-all: el checkpoint sirve para estudiar cómo se comportan los pesos tras componer intervenciones de grafo (omisión de cabezas, MLPs extra, capas repetidas) sin añadir parámetros, comparando la línea base con las variantes muestreadas.
- Búsqueda de arquitecturas (NAS) con superredes: al compartir tensores entre componentes repetidos, permite evaluar subgrafos candidatos con un único conjunto de pesos y medir el coste de calibración por ronda.
- Reproducción de recetas de calibración: `recipe.json` y `provenance.json` permiten replicar el currículo de 10 rondas y 5.000 actualizaciones, útil para validar metodologías de regiones de confianza en espacio de parámetros.
- Auditoría de integridad de artefactos: el hash SHA-256 del snapshot fuente (`round-02.pt`, formato `zs-nas-ofa-v1`, paso 1000) y el hash del manifiesto de datos permiten verificar la cadena de procedencia en pipelines de investigación.
- Prototipado de ejecutores de grafo: al cargarse como `Qwen3_5ForCausalLM` estándar, sirve de banco de pruebas para validar ejecutores de grafo que apliquen las intervenciones OFA sin tocar los pesos.
- Experimentos de estabilidad de pesos: la restricción de distancia L2 relativa al 1 % permite estudiar la sensibilidad del modelo a perturbaciones acotadas en el espacio de parámetros, con aplicación en investigación sobre robustez y olvido catastrófico.
- Evaluación comparativa de checkpoints intermedios: al ser una ronda intermedia de un currículo mayor, permite trazar la evolución de métricas de lenguaje a lo largo de las rondas 1 a 10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta entrega no reclama mejora en precisión de MATH, robustez frente a cambios arbitrarios de grafo ni finalización del calendario completo de calibración; las comprobaciones de carga y exportación establecen integridad del artefacto, no calidad downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,0 GB solo para pesos (752 M parámetros × 4 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada si se convierte a BF16/FP16: alrededor de 1,5 GB para pesos, más activaciones; no se publican cuantizaciones oficiales, por lo que las estimaciones en 8 o 4 bits son orientativas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32 con contexto corto; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: Transformers 5.22.1 con `torch` 2.9.1 y `safetensors` 0.8.0 según la model card; se recomienda `attn_implementation="eager"` para preservar los valores FP32 liberados. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| asun17904/Qwen3.5-0.8B-OFA-Round2 | 752.393.024 | no disponible (heredado, no validado) | Apache 2.0 | safetensors FP32 | Checkpoint intermedio de calibración OFA, solo backbone de texto |
| Qwen/Qwen3.5-0.8B | no disponible en la información proporcionada | no disponible en la información proporcionada | Apache 2.0 (según herencia) | no disponible en la información proporcionada | Modelo base post-entrenado, incluye torre de visión y módulo de predicción multi-token |
| Alternativas de ~0,8 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparativa con otros modelos de la misma categoría |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la ronda 2 de 10 y a 1.000 de 5.000 actualizaciones; no es el resultado final del currículo.
- No se reclama mejora en precisión de MATH ni en robustez frente a cambios arbitrarios de grafo.
- La longitud de contexto heredada del modelo base no ha sido validada tras la calibración OFA.
- Solo incluye el backbone de texto; no contiene torre de visión ni módulo de predicción multi-token.
- Idioma limitado al inglés según la model card; no se documentan capacidades multilingües.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni resultados de benchmarks; el uso en producción requeriría validación propia.
- Las intervenciones de grafo OFA requieren un ejecutor de grafo separado que no se incluye en el repositorio; la generación estándar de Transformers usa la arquitectura de 24 capas sin cambios.
- La reconstrucción del flujo Dolma a partir de documentos tokenizados con GPT-2 y retokenizados con el tokenizador Qwen no garantiza una recuperación byte a byte de los documentos originales.
- Riesgo de sesgos y alucinaciones heredado del modelo base y del corpus Dolma en inglés; no se documentan evaluaciones específicas de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad downstream; la responsabilidad de validación recae en el usuario.
- Descargas y likes nulos en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Receta de entrenamiento: `recipe.json` (en el repositorio)
- Procedencia: `provenance.json` (en el repositorio)
- Licencia upstream: `LICENSE` (en el repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
