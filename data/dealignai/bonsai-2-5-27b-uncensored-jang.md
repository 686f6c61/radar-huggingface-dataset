# dealignai/Bonsai-2.5-27B-UNCENSORED-JANG

## Resumen

Bonsai-2.5-27B-UNCENSORED-JANG es una variante del modelo Bonsai-2.5-27B de OsaurusAI, publicada por dealignai, en la que se ha eliminado el comportamiento de rechazo mediante abliteración a nivel de pesos (no mediante LoRA ni jailbreak de prompt). El modelo base es un híbrido Qwen3.5-VL que combina capas SSM GatedDeltaNet con 16 capas de atención completa en una pila de 64 capas, e incorpora visión a través de un proyector multimodal (mmproj), modo de razonamiento por turno (thinking) y decodificación especulativa MTP nativa en el runtime vmlx.

La distribución se realiza en formato JANG propietario, con cuantización ternaria simétrica. Se ofrecen dos bundles: uno ternario afín de 2 bits (8,3 GB) y otro ternario empaquetado de ~1,625 bits por peso (6,7 GB). El repositorio completo ocupa 16,1 GB e incluye safetensors y configuración para la librería MLX de Apple.

Su relevancia radica en que preserva íntegras las capacidades del modelo base (razonamiento, visión, tool use, plantilla de chat Qwen3.5 y cabecera MTP) mientras elimina las negativas, con una degradación medida en MMLU-400 de entre 1,75 y 2,5 puntos porcentuales respecto al modelo base. Está orientado a entornos de investigación y a despliegues en hardware Apple Silicon mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet SSM + 16 capas de atención completa, 64 capas totales (Qwen3.5-VL) |
| Parametros totales | 27B (según denominación del modelo; no se detalla desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria afín 2-bit (8,3 GB) y ternaria empaquetada ~1,625 bpw (6,7 GB); formato JANG |
| Idiomas soportados | en (inglés) |
| Licencia | dealignai-community-v0.3 (license: other) |
| Formato de pesos | safetensors en bundle JANG para MLX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Bonsai-2.5-27B de OsaurusAI, un transformer híbrido de 64 capas que intercala capas SSM GatedDeltaNet con 16 capas de atención completa, lo que reduce el coste de atención en secuencias largas manteniendo capacidad de modelado global. Incluye una torre de visión accesible mediante mmproj, una cabecera de propuesta MTP (multi-token prediction) para decodificación especulativa nativa y la plantilla de chat de Qwen3.5.

La intervención de dealignai consiste en abliteración directa a nivel de pesos: no hay LoRA, ni adaptadores, ni entrenamiento supervisado, ni tokens de calibración. Según el autor, la estructura del bundle JANG, el tokenizador, la torre de visión y la cabecera MTP son byte-idénticos al release original de OsaurusAI. No se especifican en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable por turno (reasoning_effort).
- Entrada multimodal de visión a través del proyector mmproj.
- Soporte de tool calling y function calling (etiqueta tool-use).
- Razonamiento multi-paso y uso en flujos de agentes.
- Decodificación especulativa nativa mediante cabecera MTP en el runtime vmlx.
- Comportamiento sin rechazo en las seis categorías de daño real de HarmBench (chemical_biological, cybercrime_intrusion, harassment_bullying, harmful, illegal, misinformation_disinformation).
- Capacidades multilingües limitadas: la model card declara únicamente inglés.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar respuestas que el base rechazaría, con tasas de cumplimiento medidas (95,42 % ternario, 98,33 % 1.75bit en HarmBench-240), útil para análisis de robustez de clasificadores y filtros.
- Red teaming controlado: generación de payloads y escenarios de ataque (exploits SQLi, BlueKeep, ofuscación de rootkit) en entornos aislados para validar defensas, aprovechando que el modelo produce código sustancial en esas categorías.
- Evaluación de cuantización extrema: comparación de los dos bundles ternarios frente al base en MMLU-400 (81,00 % vs 79,25 % en ternario; 82,00 % vs 79,50 % en 1.75bit) para estudiar el coste de la cirugía de pesos y del empaquetado de trits.
- Asistente local en Apple Silicon: despliegue con MLX y vmlx en equipos con memoria unificada, dado el tamaño de 6,7-8,3 GB de los bundles, para tareas de razonamiento y visión sin dependencia de la nube.
- Análisis de documentos con imagen: uso de la torre de visión y del contexto del modelo para extraer y razonar sobre contenido visual en pipelines de investigación.
- Automatización con agentes y herramientas: integración en flujos multi-paso que requieren function calling y decodificación especulativa para reducir latencia.

## Benchmarks y rendimiento

| Benchmark | Bundle | Resultado | Referencia |
|---|---|---:|---|
| HarmBench-240 (comply, clasificador) | UNCENSORED-1.75bit-JANG | 236/240 = 98,33 % | — |
| HarmBench-240 (comply, clasificador) | UNCENSORED-Ternary-JANG | 229/240 = 95,42 % | — |
| HarmBench-240 (true comply) | UNCENSORED-1.75bit-JANG | ~238/240 = 99,2 % | — |
| HarmBench-240 (true comply) | UNCENSORED-Ternary-JANG | ~235/240 = 97,9 % | — |
| MMLU-400 base | UNCENSORED-Ternary-JANG | 81,00 % | — |
| MMLU-400 tras abliteración | UNCENSORED-Ternary-JANG | 79,25 % (−1,75 pp) | — |
| MMLU-400 base | UNCENSORED-1.75bit-JANG | 82,00 % | — |
| MMLU-400 tras abliteración | UNCENSORED-1.75bit-JANG | 79,50 % (−2,50 pp) | — |

Desglose por categoría de HarmBench (tasa de cumplimiento contada por clasificador):

| Categoría | n | Ternary | 1.75bit |
|---|---:|---:|---:|
| chemical_biological | 42 | 100,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 84,6 % | 96,2 % |
| harassment_bullying | 21 | 95,2 % | 100,0 % |
| harmful | 18 | 100,0 % | 100,0 % |
| illegal | 53 | 100,0 % | 100,0 % |
| misinformation_disinformation | 54 | 96,3 % | 96,3 % |

El harness empleado es vmlx `/v1/chat/completions` en streaming, con reasoning_effort low, temperatura 0, max_tokens 4096 y sin system prompt de usuario. No se han publicado resultados de benchmarks en la información disponible para MMLU completo, HumanEval, GSM8K u otras tareas estándar.

## Requisitos de hardware

- VRAM/memoria unificada: 8,3 GB para el bundle ternario y 6,7 GB para el 1.75bit, más overhead del runtime, KV-cache y torre de visión.
- Hardware objetivo: Apple Silicon con MLX; el runtime recomendado es vmlx, que sirve bundles JANG con MTP nativo.
- GPU CUDA (A100, H100, RTX 4090): no disponible; el formato JANG y la librería MLX no están orientados a estos entornos.
- Compatibilidad con GPU de consumo: viable en equipos Apple con memoria unificada suficiente para alojar el bundle y el contexto; no se especifican modelos concretos.
- Opciones de despliegue: vmlx (runtime declarado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que la decodificación especulativa MTP acepta borradores a la misma tasa que el modelo upstream.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2.5-27B-UNCENSORED-JANG | 27B | no disponible | Ternaria JANG (2-bit / ~1,625 bpw) | dealignai-community-v0.3 | Hugging Face, MLX/vmlx |
| OsaurusAI/Bonsai-2.5-27B-Ternary-JANG (base) | 27B | no disponible | Ternaria JANG | no disponible | Hugging Face, MLX/vmlx |
| Alternativas no censuradas de 27B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada; la única comparación cuantitativa disponible es la del propio modelo frente a su base en MMLU-400 y HarmBench.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo cumple instrucciones dañinas en las seis categorías de HarmBench, lo que lo hace inadecuado para despliegues de cara al público sin filtros externos.
- Riesgo elevado de uso malicioso: la model card documenta generación de exploits y contenido de cibercrimen; requiere aislamiento y control de acceso.
- Degradación de rendimiento: pérdida de 1,75-2,50 pp en MMLU-400 respecto al base, dentro de lo que el autor considera coste normal de la abliteración.
- Bucles degenerativos: el bundle ternario registra 4 atractores degenerados reales y 6 falsos positivos del clasificador; el 1.75bit, 2 reales y 1 falso positivo.
- Idioma: solo inglés declarado; no hay soporte multilingüe verificado.
- Contexto: la longitud de contexto no se especifica en la información disponible.
- Licencia restrictiva: dealignai-community-v0.3 (license: other); deben revisarse las condiciones de uso comercial en el archivo LICENSE antes de producción.
- Dependencia de runtime: el formato JANG y el MTP nativo requieren vmlx; no hay soporte declarado para ecosistemas CUDA convencionales.
- Sesgos: no se documentan sesgos específicos en la información disponible, más allá de los inherentes al corpus de entrenamiento del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/dealignai/Bonsai-2.5-27B-UNCENSORED-JANG
- Modelo base: https://huggingface.co/OsaurusAI/Bonsai-2.5-27B-Ternary-JANG
- Runtime vmlx: https://github.com/osaurusAI/vmlx-engine
- Perfil de X del autor: https://x.com/dealignai
