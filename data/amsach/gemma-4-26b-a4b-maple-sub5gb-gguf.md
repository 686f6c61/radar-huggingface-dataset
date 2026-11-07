# AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF

## Resumen

MAPLE: Gemma 4 26B-A4B Sub-5GB es una compresión extrema del modelo multimodal Gemma 4 26B-A4B de Google DeepMind, publicada por AmSach (Aman Sachan, Independent Systems Research) bajo licencia Apache 2.0. El checkpoint distribuido en formato GGUF ocupa 4,75 GB y aplica una técnica propia de poda de expertos en modelos MoE denominada MAPLE (Manifold-Activated Pruning of Latent Experts), que reduce el modelo original de 128 expertos por capa a 48, eliminando 80 expertos considerados dormidos para el dominio objetivo.

El propósito declarado es permitir la ejecución al 100 % en VRAM de GPUs de consumo con 6 GB (RTX 4050, RTX 3060) sin paginación a CPU, logrando según el autor 45,4 tokens/s frente a 6,9 tokens/s del contenedor original en la misma GPU. El modelo está perfilado específicamente para razonamiento técnico, síntesis de código Python, estructuras de datos y STEM, a costa de sacrificar capacidades multilingües y conversacionales generales.

Es relevante porque demuestra una vía práctica de despliegue de un MoE de gran tamaño en hardware de gama baja mediante poda guiada por el manifold de activación, aunque el checkpoint publicado es un artefacto experimental con cero descargas y cero likes en el momento de la consulta, y la model card no documenta benchmarks estándar de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), poda de 128 a 48 expertos por capa |
| Parámetros totales | 10.952.640.446 (según safetensors del repo); el modelo base Google declara 25,2 B totales |
| Parámetros activos | 3,8 B por token en el modelo base (dato de Google); no disponible para el checkpoint podado |
| Longitud de contexto | 256K tokens en el modelo base (dato de Google); la model card usa `-c 2048` en el ejemplo de llama.cpp, sin especificar contexto máximo del GGUF |
| Tipos de cuantización | GGUF a 1,48 bits por parámetro efectivos (sub-2-BPW); no se listan otras variantes |
| Idiomas soportados | Inglés (etiqueta `language: en`); el autor indica que se han eliminado expertos multilingües |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma_4_26b_sub5gb_insitu.gguf`), con calibración imatrix |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Google DeepMind con 25,2 B de parámetros totales y 3,8 B activos por token, entrenado con ajuste de instrucciones, razonamiento integrado, function calling nativo y entrada multimodal texto-imagen. MAPLE no reentrena el modelo: parte de los pesos de `google/gemma-4-26b-a4b-it` y aplica una poda estructurada de expertos guiada por perfilado de activaciones con `llama-imatrix` sobre un corpus técnico propio (`custom-technical-calibration`).

La puntuación de importancia de cada experto combina la frecuencia empírica de activación (`C`) y la energía media de activación de canales de entrada (`σ̄`), con un suelo de estabilidad numérica de 10⁻⁶. Los 48 expertos retenidos por capa capturan, según el autor, el 79,88 % de la masa de activación del forward pass, y el contenedor resultante se empaqueta en GGUF sin desquantización intermedia. La fidelidad semántica declarada frente al modelo original en el dominio objetivo es del 93,8 %, métrica definida por el autor y no verificable con los datos disponibles.

## Capacidades

- Generación de texto y razonamiento técnico orientado a STEM.
- Síntesis de código, en particular Python: funciones, algoritmos y estructuras de datos.
- Razonamiento deductivo dentro del dominio de calibración.
- Conversación multi-turno mediante plantilla de turnos (`<|turn>user` / `<|turn>model`).
- Inferencia al 100 % en VRAM en GPUs de 6 GB con llama.cpp.
- Capacidades multimodal (texto e imagen) y function calling nativo del modelo base: no confirmadas en este checkpoint podado.
- Capacidades multilingües: explícitamente degradadas por la poda de expertos multilingües.

## Casos de uso

- Asistencia de código en local para desarrolladores con portátil de 6 GB de VRAM: generación de funciones Python y algoritmos sin conexión a la nube, aprovechando la residencia total en GPU.
- Autocompletado y refactorización en IDE sobre hardware de gama baja: el modelo cabe en una RTX 4050 o RTX 3060 y evita la latencia de paginación a CPU (22,0 ms/token declarados).
- Prototipado de pipelines de CI/CD con verificación de código: puede integrarse vía llama.cpp en scripts de revisión estática o generación de tests para repositorios Python.
- Enseñanza de algoritmia y estructuras de datos: respuestas multi-turno con contexto suficiente para explicaciones encadenadas, en inglés.
- Entornos aislados o air-gapped: al ser un GGUF local de 4,75 GB con licencia Apache 2.0, es desplegable sin dependencia de APIs externas.
- Investigación en compresión de modelos: sirve como referencia reproducible del pipeline MAPLE para experimentar con poda de expertos en otros dominios (medicina, finanzas, legal) usando el motor open source del autor.
- Evaluación comparativa de cuantizaciones extremas: útil para medir el compromiso entre velocidad (45,4 tokens/s) y fidelidad semántica (93,8 % declarado) en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta métricas de sistema medidas por el autor en una NVIDIA RTX 4050 6 GB:

| Métrica | Base 128 expertos | MAPLE 48 expertos | Mejora |
|---|---|---|---|
| Tamaño del contenedor | 9,92 GB | 4,75 GB | 2,09x menor |
| Bitrate efectivo | ~2,1 BPW | 1,48 BPW | Sub-1,5 BPW |
| Residencia en GPU | Parcial (16/30 capas) | 100 % (30/30 capas) | Sin paginación a CPU |
| Velocidad de generación | 6,9 tokens/s | 45,4 tokens/s | 6,57x |
| Latencia por token | 144,9 ms | 22,0 ms | 6,58x |
| Fidelidad semántica | 100 % | 93,8 % | Casi sin pérdida en dominio |

## Requisitos de hardware

- VRAM estimada: inferior a 6 GB para el checkpoint completo (4,75 GB de pesos más overhead de contexto).
- GPU objetivo declarada: NVIDIA RTX 4050 6 GB (laptop) y RTX 3060 6 GB; ejecución al 100 % en VRAM.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM; no se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más.
- Despliegue: llama.cpp (`llama-cli` con `-ngl 99`); compatible con endpoints según los tags del repo; no se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput declarados: 22,0 ms/token y 45,4 tokens/s en RTX 4050 6 GB con contexto de 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAPLE Gemma 4 26B-A4B Sub-5GB | 10,95 B en safetensors del repo; 25,2 B totales / 3,8 B activos en el base | 256K en el base; no especificado en el GGUF | GGUF 1,48 BPW | Apache 2.0 | Hugging Face, 0 descargas |
| Gemma 4 26B-A4B (Google) | 25,2 B totales / 3,8 B activos | 256K | Safetensors y otros | Términos de Gemma | Google DeepMind, Amazon Bedrock |
| Otras cuantizaciones GGUF del mismo base | 25,2 B totales | 256K | GGUF 4-8 BPW típicos | Apache 2.0 / términos del base | Comunidad en Hugging Face |

No se dispone de datos de rendimiento comparativo en benchmarks entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La poda elimina 80 de 128 expertos por capa: las capacidades multilingües y conversacionales generales quedan degradadas por diseño.
- Fidelidad semántica del 93,8 % declarada por el autor; no hay validación independiente ni benchmarks estándar publicados.
- Riesgo de alucinación no cuantificado; el modelo base incluye razonamiento integrado, pero la poda puede afectar a la coherencia en dominios fuera de la calibración.
- El checkpoint está perfilado para Python y STEM; su uso en otros dominios (medicina, legal, finanzas) no está validado.
- Idioma: solo inglés etiquetado; el castellano no está soportado de forma fiable.
- La discrepancia entre los 10,95 B de parámetros en safetensors del repo y los 25,2 B del modelo base no está explicada en la model card.
- El ejemplo de llama.cpp usa contexto de 2048 tokens pese a que el base soporta 256K; el contexto efectivo del GGUF no está documentado.
- Repositorio con 0 descargas y 0 likes: artefacto experimental sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la compatibilidad con los términos del modelo base de Google.
- El pipeline MAPLE y la métrica de fidelidad son contribuciones del propio autor, sin revisión por pares confirmada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF
- GGUF directo: https://huggingface.co/AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF/resolve/main/gemma_4_26b_sub5gb_insitu.gguf?download=true
- Repositorio GitHub MAPLE: https://github.com/AmSach/maple
- Licencia en GitHub: https://github.com/AmSach/maple/blob/master/LICENSE
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 26B-A4B en Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-google-gemma-4-26b-a4b.html
- Paper citado (referencia bibtex, sin URL): Sachan, A. (2026), *MAPLE: Manifold-Activated Pruning of Latent Experts for Sub-2-BPW Mixture-of-Experts Language Models*
