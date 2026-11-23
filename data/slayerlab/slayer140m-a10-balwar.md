# SlayerLab/Slayer140M-A10-balwar

## Resumen

Slayer140M-A10-balwar es un modelo de lenguaje causal de tipo mixture-of-experts (MoE) de escala reducida, desarrollado por SlayerLab. Cuenta con 140.681.991 parámetros totales, de los cuales solo 10.330.887 se activan por token gracias a un enrutamiento top-1 que selecciona un único experto por capa. La arquitectura es un transformer con 8 capas, anchura de 256, atención con grouped-query attention (8 cabezas de consulta y 4 de clave-valor) y SwiGLU en los expertos.

El modelo se presenta explícitamente como un experimento exploratorio de una sola ejecución (semilla 1), no como una comparación controlada frente a un modelo denso de parámetros equivalentes. El autor advierte que la ejecución no establece un ranking, ni una afirmación sobre calidad downstream, ni un beneficio comparativo derivado de la pérdida de balanceo del enrutador. Esta honestidad metodológica es relevante para investigadores que evalúan técnicas de enrutamiento en modelos pequeños.

Se entrenó desde cero sobre FineWeb-2 (subconjunto polaco) y FineWeb-Edu, con una longitud de secuencia de 256 tokens y 5.599.985.664 posiciones de token procesadas. El modelo soporta polaco e inglés, se distribuye bajo licencia Apache-2.0 y su relevancia actual reside en servir como banco de pruebas reproducible para estudiar MoE de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mixture-of-experts, enrutamiento top-1, SwiGLU en expertos, grouped-query attention, RoPE rotate-half (base 500.000), value residual, embeddings de entrada/salida atados |
| Parametros totales | 140.681.991 |
| Parametros activos | 10.330.887 por token (parámetros compartidos + un experto enrutado por capa) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos FP32) |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache-2.0 (pesos y configuración); licencia separada para el tokenizador (Apache-2.0 en `LICENSE-TOKENIZER`) |
| Formato de pesos | safetensors (FP32, 81 tensores, sin estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 8 capas con anchura 256 y 18 expertos por capa, cada uno con anchura SwiGLU de 1.248. Emplea enrutamiento top-1, de modo que por cada token se activa un solo experto por capa además de los parámetros compartidos. Incorpora grouped-query attention con 8 cabezas de consulta y 4 de clave-valor, normalización RMS en consulta y clave, RoPE rotate-half de cabeza completa con base 500.000 y una conexión de valor residual. Los embeddings de entrada y salida están atados.

El entrenamiento se realizó desde cero con tamaño de lote 256, tasa de aprendizaje máxima 0.003, 500 pasos de calentamiento y un esquema warmup–stable–decay con fracción de decaimiento del 20%. Se completaron 85.449 pasos del optimizador, procesando 5.599.985.664 posiciones de token (no tokens únicos). La pérdida de balanceo del enrutador se sumó a través de todas las capas. Los datos provienen de FineWeb-2 (`pol_Latn`) y FineWeb-Edu (`CC-MAIN-2025-26`), con 5.599.944.916 tokens fuente empaquetados. El tokenizador es un BPE a nivel de byte idéntico al de Slayer16M-A1M, entrenado sobre muestras de FineWeb-Edu (`sample-10BT`) y FineWeb-2 (`pol_Latn`), con 4.096 entradas.

## Capacidades

- Generación de texto causal en polaco e inglés, limitada a secuencias de 256 tokens.
- Modelado de lenguaje y estimación de probabilidad (cross-entropy) sobre texto de ambos idiomas.
- Razonamiento y generación de código: no documentado ni evaluado; el modelo es demasiado pequeño y su contexto demasiado corto para tareas fiables.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a polaco e inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Uso como banco de pruebas para investigación en enrutamiento MoE y pérdidas auxiliares de balanceo.

## Casos de uso

- Investigación sobre enrutamiento MoE: permite estudiar el comportamiento del enrutador top-1 y el efecto de la pérdida de balanceo sumada por capas en un modelo de bajo coste, comparando la distribución de expertos activados por token.
- Experimentos reproducibles de entrenamiento desde cero: con 5.599.985.664 posiciones de token y un historial público en Track, sirve para replicar curvas de pérdida y validar pipelines de entrenamiento en hardware modesto.
- Evaluación de tokenizadores BPE a nivel de byte: al compartir tokenizador con Slayer16M-A1M, permite aislar el efecto del tokenizador frente a cambios de arquitectura.
- Modelado de lenguaje en polaco para tareas de perplejidad y filtrado de corpus: su cross-entropy de 2,767918 nat/token en polaco puede usarse como señal de scoring en pipelines de limpieza de datos.
- Prototipado de decodificación y paridad de logits: al incluir una referencia FP32 en CPU, facilita la validación de implementaciones alternativas de inferencia antes de escalar a modelos mayores.
- Docencia y divulgación: ilustra de forma concreta las diferencias entre parámetros totales y activos en un MoE, con cifras verificables y un checkpoint pequeño (0,6 GB) fácil de inspeccionar.

## Benchmarks y rendimiento

El autor solo publica evaluación de cross-entropy en validación (nat/token) en el paso 85.449, sin términos auxiliares del enrutador, sobre 2.048 ventanas fijas de 256 tokens por idioma.

| Idioma | Ventanas de evaluación | Cross-entropy final (nat/token) |
|---|---:|---:|
| Polaco | 2.048 | 2,767918 |
| Inglés | 2.048 | 2,322589 |

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que estas mediciones no constituyen puntuaciones de benchmark downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP32 ocupa aproximadamente 0,6 GB; en FP32 la inferencia requiere del orden de 1 GB o menos de VRAM, y menos aún si se convierte a FP16/BF16 (no se distribuyen pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: no se incluye implementación ni `auto_map` de Transformers, por lo que no es un paquete listo para `AutoModel`. Requiere cargar los tensores safetensors con una implementación propia o adaptada. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Slayer140M-A10-balwar | 140.681.991 | 10.330.887 | 256 | Apache-2.0 | safetensors FP32 |
| Slayer16M-A1M (mismo autor) | no disponible en la información | no disponible en la información | no disponible | Apache-2.0 (tokenizador) | safetensors |
| Alternativas densas de ~140M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables ni de especificaciones de modelos alternativos en la información proporcionada; la comparativa cuantitativa con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Ejecución exploratoria única (semilla 1): no establece ranking, calidad downstream ni beneficio comparativo de la pérdida de balanceo, según el propio autor.
- Contexto muy corto (256 tokens), insuficiente para la mayoría de aplicaciones conversacionales o de recuperación aumentada.
- Entrenado solo en polaco e inglés; no hay capacidades multilingües más allá de estos idiomas.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño reducido (140M totales, 10M activos) y el limitado volumen de entrenamiento.
- No es un paquete listo para `AutoModel`: no incluye implementación ni `auto_map`, lo que exige trabajo de integración.
- Solo se distribuyen pesos FP32; no hay cuantizaciones oficiales (GGUF, GPTQ, AWQ) ni validación en CUDA (la paridad de logits se verificó en CPU FP32).
- La licencia Apache-2.0 de los pesos es independiente de la licencia del tokenizador; el uso comercial debe revisar ambos documentos (`LICENSE-WEIGHTS` y `LICENSE-TOKENIZER`).
- Los datos de entrenamiento no se incluyen en el repositorio y están sujetos a los términos de Common Crawl y a la atribución ODC-By 1.0 de FineWeb-Edu y FineWeb-2.
- Sin datos publicados sobre sesgos; cabe esperar los sesgos presentes en los corpus de FineWeb.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer140M-A10-balwar
- Historial de entrenamiento público en Track: https://track.fabryka.ai/run/7f1a264d-d29f-5c74-ada0-2010b2df182f
- Dataset FineWeb-2 (HuggingFaceFW): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2/tree/af9c13333eb981300149d5ca60a8e9d659b276b9
- Dataset FineWeb-Edu (HuggingFaceFW): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu/tree/87f09149ef4734204d70ed1d046ddc9ca3f2b8f9
- Tokenizador de referencia Slayer16M-A1M: https://huggingface.co/SlayerLab/Slayer16M-A1M/tree/e305bbacbd973361babdc8ed21ded873402cab49
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
