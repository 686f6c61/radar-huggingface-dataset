# MD-Mushfiqur123/xe-droplychee-v2

## Resumen

El modelo `xe-droplychee-v2`, desarrollado por MD-Mushfiqur123, es un modelo de lenguaje autoregresivo basado en una arquitectura personalizada denominada `xe_droplychee`. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 6,5 mil millones de parámetros totales, con unos 450 millones de parámetros activos por token. Está diseñado para generar texto en bengalí e inglés y se publica bajo licencia Apache-2.0. Aunque el identificador en HuggingFace es `xe-droplychee-v2`, el README del autor lo denomina `m-droplychee`.

La arquitectura incorpora varias innovaciones técnicas: atención latente multi-cabeza (MLA) con normalización de cabezas Q/K para reducir el consumo de memoria del KV-cache en torno al 90 %, una capa de mezcla de expertos de grano fino con 64 expertos enrutados más un experto compartido, predicción multi-token (MTP) de profundidad 1 y un motor de aprendizaje por refuerzo GRPO nativo. El modelo está optimizado para pre-entrenamiento continuado en estaciones de trabajo con 94 o 96 GB de VRAM, como la NVIDIA RTX PRO 6000. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `xe_droplychee` (MoE con Multi-Head Latent Attention, Multi-Token Prediction y GRPO) |
| Parámetros totales | ~6,5B |
| Parámetros activos | ~450M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bengalí (bn), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura `xe_droplychee` combina varias técnicas avanzadas. En primer lugar, utiliza Multi-Head Latent Attention (MLA) con normalización QK-Head. Esta técnica comprime las claves y valores en una representación latente de baja dimensión (`d_c^KV = 256`) y emplea embeddings posicionales rotatorios (RoPE) de 64 dimensiones, reduciendo el consumo de ancho de banda del KV-cache en aproximadamente un 90 %. La normalización RMSNorm en las cabezas Q y K evita el colapso de la entropía de atención y estabiliza el entrenamiento en BF16 o FP8. La atención se acelera mediante kernels de PyTorch SDPA.

El modelo utiliza una capa MoE de grano fino compuesta por 64 expertos enrutados y un experto compartido dedicado. El enrutamiento dinámico selecciona los 4 expertos más relevantes por token, lo que resulta en 5 expertos activos por token (4 enrutados + 1 compartido). Para evitar el colapso de expertos, se aplica un equilibrio de sesgo sin pérdida auxiliar con decaimiento exponencial (factor 0,999), que ajusta dinámicamente los parámetros de sesgo sin sacrificar la entropía de representación del enrutamiento.

Además, el modelo incorpora un módulo de predicción multi-token (MTP) de profundidad 1, que predice dos tokens simultáneamente durante el pre-entrenamiento. Esto duplica la densidad de representación de tokens y permite acelerar la decodificación mediante decodificación especulativa. El entrenamiento incluye un motor GRPO nativo integrado en la clase del modelo, que calcula la relación de política con un objetivo recortado y regularización KL, sin necesidad de un modelo crítico separado. No se han proporcionado detalles sobre el número de tokens de pre-entrenamiento ni la composición exacta del dataset. El README menciona que el modelo está optimizado para pre-entrenamiento continuado en estaciones de trabajo con 94 o 96 GB de VRAM, usando datasets en bengalí.

## Capacidades

- Generación de texto autoregresiva (causal LM) en bengalí e inglés.
- Razonamiento: el modelo está etiquetado con `reasoning` e incluye un motor GRPO nativo, lo que sugiere capacidades de razonamiento, aunque no hay benchmarks publicados que lo confirmen.
- Multi-Token Prediction: el módulo MTP permite predicción simultánea de dos tokens, lo que habilita decodificación especulativa y puede reducir la latencia de generación.
- Pre-entrenamiento continuado: el modelo está diseñado para ser reentrenado o adaptado con datasets propios en entornos con 94 o 96 GB de VRAM.
- Soporte de tool calling, visión, audio o multimodalidad: no documentado en la información disponible.

## Casos de uso

- Traducción y redacción bilingüe: el modelo puede generar y traducir texto entre bengalí e inglés, lo que resulta útil para localización de contenido, documentos corporativos o materiales educativos en ambos idiomas.
- Asistentes conversacionales en bengalí: gracias a su entrenamiento con GRPO y su enfoque en razonamiento, puede gestionar diálogos multi-turno en bengalí, por ejemplo en atención al cliente o tutorías personalizadas.
- Pre-entrenamiento continuado en dominios específicos: el modelo está optimizado para continuar el entrenamiento en estaciones de trabajo con 94 o 96 GB de VRAM, permitiendo adaptarlo a dominios como salud, finanzas o derecho con datasets propios en bengalí o inglés.
- Investigación en arquitecturas eficientes: sirve como referencia para estudiar la combinación de MLA, MoE de grano fino, MTP y GRPO en un mismo modelo, especialmente en entornos con recursos limitados de VRAM.
- Desarrollo de herramientas para desarrolladores: la organización `droplychee` se centra en herramientas para desarrolladores y modelos multilingües abiertos, por lo que este modelo puede emplearse en prototipos de generación de texto técnico o documentación en bengalí e inglés.
- Decodificación especulativa en pipelines de baja latencia: el módulo MTP permite implementar decodificación especulativa en aplicaciones de producción donde se necesita reducir el tiempo de respuesta, siempre que la arquitectura personalizada sea compatible con el framework de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en 6,5B parámetros):
  - BF16: ~13 GB para pesos, más overhead de runtime y KV-cache comprimido por MLA; total estimado entre 16 y 20 GB.
  - FP8 o INT8: ~6,5 GB para pesos; total estimado entre 8 y 12 GB.
  - Cuantización 4-bit (GPTQ o AWQ, si estuviera disponible): ~3,5 GB para pesos; total estimado entre 5 y 8 GB.
- GPU recomendadas: para inferencia en BF16, tarjetas con 24 GB de VRAM como la RTX 4090 o RTX 3090 son suficientes. Para despliegue de alto rendimiento, se recomiendan A100 o H100. Para pre-entrenamiento continuado, se requiere una GPU con 94 o 96 GB de VRAM, como la RTX PRO 6000.
- Opciones de despliegue: el modelo requiere `trust_remote_code=True` al cargarse con `transformers`. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado y dependerá de la implementación de la arquitectura personalizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara características estructurales con otros modelos MoE de tamaño similar. Los datos de los modelos externos son de referencia pública; no se dispone de resultados de benchmarks para `xe-droplychee-v2`.

| Modelo | Parámetros totales | Parámetros activos | Longitud de contexto | Licencia |
|---|---|---|---|---|
| xe-droplychee-v2 | ~6,5B | ~450M | no disponible | Apache-2.0 |
| DeepSeek-V2-Lite | 16B | 2,4B | 128K | MIT |
| Qwen2.5-MoE | 14B | 2,7B | 128K | Apache-2.0 |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache-2.0 |

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones para este modelo.
- La arquitectura personalizada requiere `trust_remote_code`, lo que puede limitar la compatibilidad con frameworks de despliegue estándar.
- El soporte de idiomas se limita a bengalí e inglés; no se documenta soporte para otros idiomas.
- No se documentan capacidades de tool calling, visión ni audio.
- Los datos de entrenamiento no están especificados, lo que dificulta evaluar posibles sesgos o riesgos de alucinación.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe validar el rendimiento y la seguridad del modelo antes de su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MD-Mushfiqur123/xe-droplychee-v2
- Organización Drop Lychee: https://huggingface.co/droplychee/models
- Modelo anterior del autor: https://huggingface.co/MD-Mushfiqur123/droplychee-1.1
