# Prannesshkva/Phantom-Qwen2.5-1.5B-Instruct

## Resumen

Phantom-Qwen2.5-1.5B-Instruct es un modelo de lenguaje desarrollado por Prannesshkva que combina la arquitectura de Qwen2.5-1.5B-Instruct, de Alibaba Cloud, con el motor PHANTOM (Projective Hidden-State Attention-Free Nonlinear Tensor Operator Manifold). Se trata de un modelo experimental de 1.543.714.304 parámetros (~1.54B) que propone un enfoque de espacio de estados proyectivo para reducir el consumo de memoria de la caché KV y la latencia de prefill en transformers. El modelo está diseñado para entornos con restricciones de VRAM, como dispositivos edge y GPUs de consumo, y para aplicaciones que requieren contextos largos, como agentes multi-turno y RAG. La longitud de contexto no se especifica en la información disponible. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto no validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con motor de espacio de estados proyectivo (PHANTOM) sobre base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | BSL 1.1 (Business Source License 1.1) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-1.5B-Instruct, a la que se le añade un motor de espacio de estados proyectivo denominado PHANTOM. Según la documentación del autor, el sistema modela la dinámica de la secuencia como un sistema lineal invariante en el tiempo (LTI) de espacio de estados, discretizado mediante el método de retención de orden cero (ZOH). La matriz de transición se restringe a generadores antisimétricos (skew-symmetric) pertenecientes al álgebra de Lie so(N), lo que garantiza que la norma euclidiana del estado se preserve a lo largo de la trayectoria de inferencia, evitando el desvanecimiento o la explosión de los estados en secuencias largas. Además, se utiliza una métrica de evicción basada en la entropía de Von Neumann y la energía de activación para retener tokens con alto potencial de recuperación asociativa. El modelo también incorpora un sistema de caché de prefijos jerárquico basado en SHA-256, que permite reanudar prompts compartidos con latencia de 0 ms, y un mecanismo llamado Holographic Dynamic Revival (PHDR) para restaurar subespacios clave en la atención. No se han proporcionado datos sobre el proceso de entrenamiento, el número de tokens o la composición del dataset.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-turno y soporte para agentes, según la documentación del autor.
- Recuperación de información con alta fidelidad: el autor afirma un F1 de 1.0000 en tareas de recuperación de LongBench, gracias al mecanismo PHDR.
- Soporte de tool calling y function calling, documentado para loops de agentes y llamadas a herramientas.
- Prefijo caching para sistemas RAG: reutilización de prompts del sistema sin latencia de prefill.
- No se especifican capacidades de visión, audio o multimodalidad.

## Casos de uso

- Inferencia en servidores empresariales: el modelo permite aumentar la concurrencia por GPU de 4 a 32+ streams gracias a la caché KV en O(1), reduciendo el coste por token en clústeres de inferencia.
- Despliegue en dispositivos edge: con una caché activa de menos de 35 MB, el modelo puede ejecutarse en hardware con 4 GB de VRAM, como RTX 3050, RTX 4060, Apple Silicon M-series o Nvidia Jetson.
- Agentes multi-turno: la caché O(1) evita recargar el contexto en cada turno, lo que permite conversaciones largas sin degradación de rendimiento.
- Sistemas RAG: el prefijo caching jerárquico permite reutilizar documentos y prompts del sistema con 0 ms de resumption, acelerando el tiempo de primer token.
- Generación de código en entornos con memoria limitada: la recuperación verbatim de código, gracias a PHDR, es útil para tareas de reproducción exacta de fragmentos.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones extensas con contexto largo en dispositivos de consumo, sin necesidad de infraestructura costosa.
- Búsqueda y recuperación de información en documentos largos: el autor afirma un F1 de 1.0000 en benchmarks de recuperación, lo que lo hace adecuado para tareas needle-in-a-haystack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma en la model card un F1 de 1.0000 en recuperación de LongBench, una reducción del 98.3% en VRAM de caché y una aceleración de 2.76x en el tiempo de primer token (TTFT), pero no se proporcionan tablas comparativas ni datos verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada: el peso del modelo en FP16 ocupa aproximadamente 3.1 GB (según el tamaño del repositorio). La caché activa se mantiene por debajo de 35 MB según el autor, lo que permite inferencia en GPUs con 4 GB de VRAM.
- GPU recomendadas: RTX 3050 4 GB, RTX 4060, Apple Silicon M-series y Nvidia Jetson, según la documentación del autor. Para servidores, cualquier GPU con suficiente VRAM (A100, H100) es adecuada, aunque no se especifica.
- Opciones de despliegue: no disponible en la información. El autor proporciona un "Phantom-Samba-Engine" en HuggingFace Spaces, pero no se detalla su integración con frameworks como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El autor afirma una aceleración de 2.76x en TTFT gracias al prefijo caching, pero no se ofrecen medidas absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phantom-Qwen2.5-1.5B-Instruct | 1.543.714.304 | No disponible | BSL 1.1 | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1.54B | 32k (según documentación oficial) | Apache 2.0 | HuggingFace |

Nota: no se dispone de datos de benchmarks comparativos entre ambos modelos. El modelo Phantom es una variante experimental que añade el motor de espacio de estados PHANTOM al modelo base Qwen2.5-1.5B-Instruct.

## Limitaciones y advertencias

- La licencia BSL 1.1 (Business Source License 1.1) impone restricciones al uso comercial; es necesario revisar los términos antes de desplegar en producción.
- El modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- No se han publicado benchmarks independientes ni evaluaciones de seguridad; las afirmaciones de rendimiento provienen únicamente del autor.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental sin validación de la comunidad.
- El riesgo de alucinación no ha sido evaluado. Aunque el autor afirma alta fidelidad en recuperación, no hay evidencia externa que lo respalde.
- La combinación de arquitectura transformer y componentes SSM puede introducir comportamientos no estándar en frameworks de inferencia convencionales.

## Enlaces

- HuggingFace: https://huggingface.co/Prannesshkva/Phantom-Qwen2.5-1.5B-Instruct
- Artículo arxiv: https://arxiv.org/abs/2412.15115
- DOI Zenodo: https://doi.org/10.5281/zenodo.22177116
- DOI HF Research: https://doi.org/10.57967/hf/phantom-2026
- Benchmark Space: https://huggingface.co/spaces/Prannesshkva/phantom-ssm-cache-benchmark
- Samba Engine Space: https://huggingface.co/spaces/Prannesshkva/Phantom-Samba-Engine
