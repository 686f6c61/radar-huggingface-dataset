# bullix/GLM-5.3-Uncensored-EXL3-2.0bpw

## Resumen

GLM-5.3-Uncensored-EXL3-2.0bpw es una cuantización EXL3 de 2 bits por peso (bpw) del modelo multimodal GLM-5.3-Flash en su variante "uncensored", publicada por el usuario bullix. El modelo original lo desarrolla zai-org (Zhipu AI / Z.ai) y la versión sin censura procede de un finetune por abliteración de orcarouter. Se trata de un transformer MoE multimodal (image-text-to-text) con 321.300 millones de parámetros totales, de los cuales aproximadamente 304.400 millones residen en los expertos enrutados (94,7 %) y unos 16.900 millones en componentes no expertos.

El problema que resuelve esta ficha es de despliegue: el checkpoint original en block-FP8 ocupa unos 306 GiB, lo que lo hace inabordable en hardware de una sola máquina de gama alta consumer o en nodos con VRAM limitada. Esta cuantización reduce el peso a unos 87 GiB manteniendo los expertos enrutados a exactamente 2,00 bpw y dejando atención, expertos compartidos y capa densa en 4-6 bpw, de modo que puede ejecutarse con `exllamav3` estándar (sin kernels parcheados) en GPUs SM90, SM100 y SM120.

Es relevante ahora porque demuestra que un MoE de más de 300.000 millones de parámetros puede servirse en 2 bits con pérdida de calidad controlada y sin bifurcaciones del motor de inferencia, algo que hasta hace poco exigía código personalizado. Incluye además torre de visión en FP16 y cabeza MTP para decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con atención KDA + sparse MLA y cabeza MTP |
| Parámetros totales | 321,3 B (según model card; el contador de safetensors de HuggingFace reporta 46.508.376.158 por contar índices trellis int16) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 2,00 bpw en expertos enrutados; 4 bpw en MLP densa; 6 bpw en atención, expertos compartidos y `lm_head`; 8 bpw en MTP; FP16 en `embed_tokens` y torre de visión. Bitrate final medido: 2,09 bits/parámetro |
| Idiomas soportados | en, zh, es, fr, ru, ja, ko, de |
| Licencia | MIT (heredada de GLM-5.3-Flash) |
| Formato de pesos | safetensors EXL3 (trellis, codebook `mul1`, K=2), librería `exllamav3` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 42 capas de mezcla de expertos. La atención combina KDA (atención lineal) con sparse MLA, e incorpora un indexador (`indexer.wq_b`) para la selección dispersa de claves y valores. Dispone de una cabeza MTP (multi-token prediction) que habilita decodificación especulativa, y de una torre de visión que lo convierte en un modelo image-text-to-text. Los expertos enrutados suman 36.288 matrices (12.096 por cada una de `down_proj`, `gate_proj` y `up_proj`), cada una cuantizada a exactamente 2,00 bpw con codebook trellis `mul1` y K=2.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La variante "uncensored" proviene de un finetune por abliteración de orcarouter sobre GLM-5.3-Flash (revisión de origen `993122712d2606d8a49f0b350d35b3c6672861c8`), y esta publicación cambia únicamente la numerología de la cuantización, no los pesos semánticos. La conversión se realizó con `exllamav3` v1.6.6 (commit `bd1f519`) sin parches, usando calibración de 250 filas × 2.048 tokens (512.000 tokens) del corpus interno de exllamav3 (wiki 50 %, c4 20 %, code 20 %, random 20 %, multilingual 10 %, technical 10 %, tiny 5 %) y un Hessian ponderado por afinidad por experto con ε = 0,01.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (capacidad heredada del modelo base; sin benchmarks publicados en esta ficha).
- Generación y comprensión de código.
- Procesamiento multimodal image-text-to-text mediante torre de visión en FP16.
- Capacidad multilingüe en ocho idiomas: inglés, chino, español, francés, ruso, japonés, coreano y alemán.
- Decodificación especulativa mediante cabeza MTP, con expertos MTP a 8 bpw.
- Modo sin censura (abliterated): menor rechazo a peticiones que el modelo base rechazaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 321 B en un solo nodo de gama alta: al ocupar unos 87 GiB, cabe en configuraciones con 2× H100 80 GB o 4× RTX 4090 24 GB, permitiendo servir un modelo de escala frontera sin clúster multi-nodo.
- Asistente conversacional multilingüe: los ocho idiomas declarados permiten atender usuarios en español, inglés, chino, francés, ruso, japonés, coreano y alemán con un único checkpoint, útil en plataformas de soporte internacional.
- Procesamiento de documentos con imagen: la torre de visión en FP16 permite extraer información de capturas, formularios escaneados o gráficos y continuar la conversación en texto sobre el contenido extraído.
- Generación de código asistida: el modelo puede integrarse en entornos de desarrollo para autocompletado y explicación de código, con la ventaja de que la cuantización de 2 bpw reduce el coste de servir un modelo de este tamaño en pipelines de CI/CD.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar la degradación de calidad de un MoE a 2 bpw frente al original FP8, dado que el autor documenta el comando exacto de conversión y la estrategia de bits por componente.
- Experimentación con decodificación especulativa: la cabeza MTP a 8 bpw permite medir la ganancia de throughput de la predicción multi-token en `exllamav3` sobre un modelo grande.
- Fine-tuning e investigación sin restricciones de contenido: la variante abliterated facilita estudiar comportamientos del modelo en dominios donde el base aplicaría rechazos, siempre bajo la licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 87 GiB de pesos (bitrate medio 2,09 bits/parámetro), más overhead de contexto KV y activaciones.
- GPUs objetivo declaradas por el autor: SM90 (H100/H200), SM100 (B200) y SM120. Existe un repo hermano `bullix/GLM-5.3-Uncensored-EXL3-2.0bpw-v100` con pack `mcg` para SM70/V100.
- Configuraciones prácticas: 2× H100 80 GB, 1× H200 141 GB, o 4× RTX 4090 24 GB (con reparto de capas). No cabe en una única GPU consumer de 24 GB.
- Motor de despliegue: exclusivamente `exllamav3` (v1.6.6 o superior), sin necesidad de kernels parcheados. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Uncensored-EXL3-2.0bpw (este) | 321,3 B (MoE) | no disponible | EXL3 2 bpw + safetensors | MIT | HuggingFace, exllamav3 |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | 321,3 B (MoE) | no disponible | block-FP8 (e4m3) | MIT | HuggingFace |
| zai-org/GLM-5.3-Flash | 321,3 B (MoE) | no disponible | no disponible | MIT | HuggingFace |
| bullix/GLM-5.3-Uncensored-EXL3-2.0bpw-v100 | 321,3 B (MoE) | no disponible | EXL3 pack `mcg` | MIT | HuggingFace, exllamav3 |

La comparativa se limita a variantes del mismo modelo porque no se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantización a 2,00 bpw en los expertos enrutados introduce degradación de calidad respecto al checkpoint FP8 original; no se han publicado métricas que cuantifiquen esa pérdida.
- El contador de parámetros de HuggingFace (46.508.376.158) es incorrecto por el formato trellis int16; hay que guiarse por el valor declarado de 321,3 B.
- La variante "uncensored" reduce los rechazos del modelo base, lo que aumenta el riesgo de generar contenido inapropiado o dañino y exige filtrado adicional en producción.
- Riesgo de alucinación no cuantificado; al ser un modelo de gran escala sin benchmarks publicados, conviene validar en el dominio de uso.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en ventanas largas.
- Compatibilidad restringida a `exllamav3`; no puede servirse con los motores de inferencia más habituales (vLLM, TGI, llama.cpp).
- Requiere GPUs SM90, SM100 o SM120; en V100 hace falta el repo hermano con pack `mcg`.
- La licencia MIT permite uso comercial, pero el modelo base y el finetune intermedio pueden arrastrar condiciones adicionales no detalladas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bullix/GLM-5.3-Uncensored-EXL3-2.0bpw
- Repo hermano para V100: https://huggingface.co/bullix/GLM-5.3-Uncensored-EXL3-2.0bpw-v100
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Finetune uncensored FP8: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Motor de inferencia exllamav3: https://github.com/turboderp-org/exllamav3
