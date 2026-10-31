# masahiroid/LFM3-1.7B-Pyrite-2bit-GGUF

## Resumen

LFM3-1.7B-Pyrite-2bit-GGUF es una cuantización extrema a 2 bits, en formato GGUF, del modelo LFM3-1.7B (variantes Base e Instruct) de Liquid AI, publicada por el usuario masahiroid (Masahiro Nakatsugawa). El modelo original pertenece a la familia LFM (Liquid Foundation Models), caracterizada por arquitecturas híbridas no basadas exclusivamente en transformers, orientadas a la inferencia eficiente en dispositivos de borde (edge AI).

Esta versión resuelve un problema concreto: reducir la huella de memoria del modelo original para permitir su ejecución en hardware de consumo. Según la model card, el tamaño baja de 3,23 GB en BF16 a 715 MB (una reducción del 78 %), manteniendo una velocidad de generación de 120,2 tokens por segundo en Apple Silicon (M2 Pro con Metal 4). Es relevante como ejemplo de cuantización de bajo bit aplicada a arquitecturas no transformer, un área aún poco explorada.

El repositorio pesa aproximadamente 0,8 GB y el modelo conserva, según el autor, el proceso de razonamiento delimitado por etiquetas `<thought>` y la salida bilingüe (inglés y japonés) del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida no transformer (LFM de Liquid AI); detalle exacto no disponible |
| Parámetros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits (pipeline Pyrite, variante Q2_K según ejemplos; 3,43 bpw efectivos) |
| Idiomas soportados | Inglés y japonés |
| Licencia | liquid-license (otra, no estándar; enlace a liquid.ai) |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base, LFM3-1.7B de Liquid AI, emplea una arquitectura híbrida no transformer; la model card de la cuantización no detalla la composición exacta de capas ni los datos de entrenamiento del modelo original, por lo que esa información no está disponible en la fuente. Lo que sí documenta el autor es el proceso de cuantización: se ha aplicado el pipeline de bajo bit extremo de Project Pyrite sobre el modelo BF16 original, obteniendo un archivo GGUF de 715 MB con 3,43 bits por peso efectivos.

La cuantización se ha realizado y verificado con llama.cpp, con aceleración Metal 4 en Apple Silicon. Según el autor, el proceso preserva el comportamiento de razonamiento del modelo Instruct (etiquetas `<thought>`) y la capacidad bilingüe inglés-japonés, dos aspectos que suelen degradarse en cuantizaciones agresivas de 2 bits.

## Capacidades

- Generación de texto conversacional en inglés y japonés (etiqueta de pipeline: text-generation).
- Razonamiento con proceso explícito delimitado por etiquetas `<thought>`, heredado del modelo Instruct original.
- Ejecución local en dispositivos de borde y portátiles gracias a su tamaño reducido (715 MB).
- Compatibilidad con el ecosistema llama.cpp y Ollama (se incluye un Modelfile de ejemplo).
- No se documenta soporte de tool calling, capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles o embebidos: con 715 MB de peso, el modelo cabe en la memoria unificada de portátiles Apple Silicon o en dispositivos con recursos limitados, sin depender de la nube.
- Chatbots bilingües inglés-japonés: el modelo conserva la capacidad bilingüe del original, útil para aplicaciones dirigidas al mercado japonés con interfaz en inglés.
- Prototipado local con Ollama: el Modelfile incluido permite levantar el modelo en local con `ollama create` y probarlo en segundos, ideal para desarrollo iterativo.
- Inferencia de baja latencia en Apple Silicon: con 120,2 tokens/s de generación y 281,2 tokens/s de procesamiento de prompt en un M2 Pro, es adecuado para aplicaciones interactivas en tiempo real.
- Razonamiento con traza visible en edge: el formato `<thought>` permite mostrar u ocultar el proceso de razonamiento en aplicaciones de tutoring o asistencia.
- Despliegue masivo con restricciones de ancho de banda: el tamaño de 715 MB facilita la distribución del modelo mediante descarga o actualización OTA en flotas de dispositivos.
- Investigación en cuantización extrema: al ser la primera cuantización GGUF a 2 bits documentada de un modelo híbrido no transformer, sirve como caso de estudio para medir la degradación en arquitecturas LFM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos corresponden al rendimiento de inferencia en Apple M2 Pro con Metal 4, según la model card del autor:

| Métrica | Valor |
|---|---|
| Tamaño del modelo | 715 MB (frente a 3,23 GB en BF16) |
| Bits por peso efectivos | 3,43 bpw |
| Procesamiento de prompt | 281,2 tokens/s |
| Generación de tokens | 120,2 tokens/s |
| Hardware de referencia | Apple M2 Pro, Metal 4 |

No hay datos que cuantifiquen la degradación de calidad respecto al modelo BF16 original; dado que se trata de una cuantización de 2 bits, conviene asumir una pérdida de calidad notable y validarla caso por caso.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 0,8–1 GB para los pesos, más el overhead del runtime y la caché de contexto; en Apple Silicon se ejecuta sobre memoria unificada.
- Cabe con holgura en GPU de consumo: cualquier GPU con 4 GB de VRAM (por ejemplo, RTX 3050 o superior) o cualquier Mac Apple Silicon debería ejecutarlo sin problemas.
- GPU recomendadas: no se requieren GPU de gama alta; en Apple Silicon se ha verificado en M2 Pro con Metal 4. En entornos CUDA no hay mediciones publicadas.
- Opciones de despliegue: llama.cpp (llama-cli, con `-ngl 99` para descarga completa a GPU) y Ollama (Modelfile incluido en el repositorio).
- Latencia y throughput: 120,2 tokens/s de generación y 281,2 tokens/s de procesamiento de prompt en Apple M2 Pro, según datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato/cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Pyrite-2bit-GGUF (este) | 1,73 B | GGUF, 2 bits (3,43 bpw), 715 MB | no disponible | liquid-license | Verificado en Apple Silicon, 120,2 tok/s |
| LFM3-1.7B (original, Liquid AI) | 1,73 B | BF16, 3,23 GB | no disponible | liquid-license | Calidad máxima, mayor huella de memoria |
| Qwen2.5-1.5B-Instruct (GGUF Q2_K) | 1,5 B | GGUF, ~2 bits, ~0,7 GB | 32.768 tokens (original) | Qwen Research / Apache 2.0 según variante | Transformer denso, ecosistema maduro |
| Llama-3.2-1B-Instruct (GGUF Q2_K) | 1,24 B | GGUF, ~2 bits, ~0,5 GB | 128.000 tokens (original) | Llama 3.2 Community License | Transformer denso, amplio soporte |

La principal diferencia de este modelo frente a las alternativas es la arquitectura híbrida no transformer de la familia LFM y la verificación explícita de rendimiento en Metal; las alternativas citadas ofrecen contextos más largos documentados y licencias más conocidas, pero sus cifras de contexto corresponden al modelo original y pueden verse afectadas por la cuantización.

## Limitaciones y advertencias

- Degradación por cuantización extrema: una cuantización de 2 bits (3,43 bpw efectivos) suele provocar pérdidas significativas de calidad en razonamiento, código y matemáticas; no se han publicado métricas que cuantifiquen esta degradación.
- Riesgo de alucinación elevado, agravado por la cuantización agresiva y el pequeño tamaño del modelo (1,7 B); no apto para tareas que exijan factualidad sin supervisión.
- Soporte bilingüe limitado a inglés y japonés; otros idiomas no están soportados oficialmente.
- Longitud de contexto no documentada en el repositorio; conviene verificarla en la documentación de LFM3 de Liquid AI antes de diseñar aplicaciones con documentos largos.
- Licencia liquid-license: se trata de una licencia personalizada ("other") cuyo texto remite a liquid.ai; debe revisarse antes de cualquier uso comercial, ya que puede imponer restricciones.
- Cuantización de terceros: es un trabajo comunitario no oficial de Liquid AI, con pocas descargas (68) y sin validación publicada por el creador del modelo base; para producción se recomienda comparar con el modelo BF16 original.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/masahiroid/LFM3-1.7B-Pyrite-2bit-GGUF
- Licencia (Liquid AI): https://www.liquid.ai
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
- Repositorio oficial de LFM3-1.7B (Base/Instruct) de Liquid AI: no disponible en la información proporcionada
- Paper o documentación técnica de Project Pyrite: no disponible
