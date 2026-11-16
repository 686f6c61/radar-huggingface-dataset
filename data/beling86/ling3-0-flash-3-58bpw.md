# Beling86/Ling3.0-Flash-3.58BPW

## Resumen

Ling3.0-Flash-3.58BPW es una cuantización de precisión mixta del modelo inclusionAI/Ling-3.0-flash, publicada por el usuario Beling86 en Hugging Face. Se trata de un checkpoint de solo texto orientado a servir con vLLM, generado con AutoRound 0.16.1 (SignRound) y formato `auto_round:auto_gptq`. El resultado es un modelo de 15.139.994.336 parámetros totales (arquitectura MoE, `bailing_hybrid`) comprimido a 3,58 bits por peso de media, con un tamaño de checkpoint de 51,94 GiB.

El interés de esta ficha reside en que no es un modelo nuevo, sino un artefacto de cuantización agresiva sobre un MoE: los expertos enrutados de 32 de las 40 capas MoE se almacenan en W3A16, mientras que ocho capas concretas (2, 3, 4, 5, 38, 39, 40 y 41) se mantienen en W4A16, las proyecciones de atención (KDA y MLA) y el MLP denso en W8A16, y routers, expertos compartidos, embeddings, LM head y normas en BF16. La model card documenta con detalle la fidelidad frente al BF16 original mediante divergencia KL sobre vocabulario completo, lo que permite evaluar la pérdida de calidad de forma cuantitativa.

La relevancia práctica es doble: por un lado, permite ejecutar un MoE de 15B parámetros en una única GPU de 64+ GB con vLLM; por otro, la model card expone dos bugs concretos de vLLM 0.32/0.33 que impiden cargar el checkpoint sin parches, así como la necesidad de que `config.json` declare `"model_type": "bailing_hybrid"`. Es, por tanto, un artefacto técnico pensado para ingenieros de despliegue más que para usuarios finales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida (`bailing_hybrid`), atención KDA + MLA, 40 capas MoE |
| Parámetros totales | 15.139.994.336 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (según el ejemplo de `vllm serve --max-model-len 262144`) |
| Tipos de cuantización | AutoRound mixta: W3A16, W4A16, W8A16 y BF16 según componente; 3,58 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato de cuantización `auto_round:auto_gptq` |
| Tamaño del checkpoint | 51,94 GiB (3,58 BPW) |
| Modelo base | inclusionAI/Ling-3.0-flash |
| Capa MTP | eliminada (checkpoint de solo texto) |
| Herramienta de cuantización | AutoRound 0.16.1 (SignRound), 400 iteraciones/bloque |
| Calibración | 1024 muestras de 2048 tokens (chat, código, razonamiento, contexto largo, prosa wikitext) |
| Runtime validado | vLLM 0.32.0 y 0.33.0, con dos parches |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE híbrido con 40 capas MoE y atención que combina KDA (atención con actualización de estado que sincroniza con host) y MLA (Multi-head Latent Attention). La cuantización preserva esta estructura: las proyecciones de atención KDA y MLA se cuantizan a W8A16 con grupo 128 simétrico, salvo `f_proj` de KDA, que se mantiene en BF16. El MLP denso de las capas 0 y 1 también va en W8A16. Los expertos enrutados se reparten entre W4A16 (capas 2, 3, 4, 5, 38, 39, 40 y 41) y W3A16 (las otras 32 capas MoE), y los routers, expertos compartidos, embeddings, LM head y normas permanecen en BF16.

El proceso de cuantización emplea AutoRound 0.16.1 con el algoritmo SignRound, 400 iteraciones por bloque y `best-MSE=True`, con calibración sobre 1024 muestras de 2048 tokens que cubren chat, código, razonamiento, contexto largo y prosa de wikitext, usando la plantilla de chat de producción. La model card documenta la evolución respecto a una variante anterior (`Ling3.0-Flash-3.44BPW`, 128 muestras, 200 iteraciones, solo dos capas en W4): la nueva versión amplía a ocho capas W4 y duplica la calibración, lo que reduce la KL media de 0,08767 a 0,08165 y mejora el P99 de 1,2216 a 1,1531. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Ling-3.0-flash.
- Razonamiento y matemáticas: la calibración incluye dominios de razonamiento y math, y la evaluación de fidelidad reporta KL específica para math (0,09364 media, P99 1,7289).
- Generación de código: dominio incluido en calibración y evaluación, con la mejor concordancia top-1 de todos los dominios (97,03%) y PPL 1,679 → 1,644.
- Contexto largo: el ejemplo de servicio usa `--max-model-len 262144`, y la calibración incluye muestras de long-context.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponible; el checkpoint es explícitamente de solo texto y elimina la capa MTP.

## Casos de uso

- Despliegue de un MoE de 15B en una única GPU de 64+ GB: el checkpoint de 51,94 GiB cabe en una A100 80 GB o H100 80 GB y se sirve con vLLM 0.32/0.33 aplicando los dos parches documentados; adecuado para equipos que quieren evaluar Ling-3.0-flash sin infraestructura multi-GPU.
- Servicio de chat con ventana de 262.144 tokens: útil para asistentes que deben mantener conversaciones multi-turno muy largas o procesar documentos extensos en una sola pasada, aprovechando que la calibración incluyó muestras de contexto largo.
- Generación de código en pipelines internos: con una concordancia top-1 del 97,03% frente al BF16 en el dominio de código y una perplejidad prácticamente idéntica (1,679 → 1,644), es razonable para autocompletado y generación de parches en entornos donde el BF16 no cabe en la GPU disponible.
- Razonamiento matemático y resolución de problemas: el dominio math mantiene una KL media de 0,09364 y una perplejidad de 2,217 → 2,209, lo que permite usarlo en asistentes de cálculo simbólico o tutoría sin degradación apreciable de perplejidad.
- Evaluación comparativa de técnicas de cuantización: la model card publica KL sobre vocabulario completo, concordancia top-1 y PPL por dominio, lo que lo convierte en un artefacto útil para investigadores que comparan AutoRound con otras técnicas sobre arquitecturas MoE híbridas.
- Reproducción de la fidelidad declarada: los datos de calibración y evaluación están disjuntos por fuente y split, de modo que un equipo puede replicar la evaluación KL con su propio conjunto retenido para validar el checkpoint antes de producción.
- Prototipado de aplicaciones de prosa y redacción: el dominio prose muestra la mayor KL media (0,09677) y un aumento de perplejidad (2,024 → 2,103), por lo que es el caso de uso donde conviene validar con más cuidado la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí publica métricas de fidelidad de la cuantización frente al BF16 original, con evaluación teacher-forced sobre vocabulario completo en un conjunto retenido de 24 × 1.024 tokens:

| Dominio | Posiciones | KL media | KL mediana | KL P99 | Concordancia top-1 | PPL BF16 → cuantizado |
|---|---:|---:|---:|---:|---:|---:|
| all | 24.552 | 0,08165 | 0,00279 | 1,1531 | 93,39% | 2,544 → 2,513 |
| chat | 10.230 | 0,06938 | 0,01114 | 0,7805 | 91,96% | 3,674 → 3,558 |
| code | 5.115 | 0,08211 | 0,00003 | 1,6152 | 97,03% | 1,679 → 1,644 |
| math | 5.115 | 0,09364 | 0,00140 | 1,7289 | 94,17% | 2,217 → 2,209 |
| prose | 4.092 | 0,09677 | 0,00676 | 1,0741 | 91,42% | 2,024 → 2,103 |

Métricas adicionales: KL P99.9 de 7,4174 y KL máxima de 21,714. La comparación vLLM frente al decodificador de referencia sobre las mismas ventanas arroja una concordancia top-1 del 84,79% y un solapamiento top-20 del 78,2%, que la model card marca explícitamente como FAIL.

Comparación con la variante anterior del mismo autor:

| Variante | Configuración | Tamaño / BPW | KL media | KL P99 | Top-1 | KL prosa | Math P99.9 | Code P99.9 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Ling3.0-Flash-3.44BPW | 128 muestras, 200 iteraciones, 2× W4 (`2,41`) | 49,82 GiB / 3,44 | 0,08767 | 1,2216 | 92,88% | 0,11341 | 10,307 | 13,536 |
| Ling3.0-Flash-3.58BPW | 1024 muestras, 400 iteraciones, 8× W4 (`2–5,38–41`), best-MSE | 51,93 GiB / 3,58 | 0,08165 | 1,1531 | 93,39% | 0,09677 | 6,406 | 11,040 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~51,9 GiB de pesos en BF16 de activaciones; el autor indica una única GPU de 64+ GB. El proceso de carga tarda unos 100 s y ocupa 49,62 GiB.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier GPU con 64+ GB de memoria. No se documenta funcionamiento en GPU de 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones de 32 GB; el checkpoint excede la VRAM disponible.
- Opciones de despliegue: vLLM 0.32.0 / 0.33.0 con `--trust-remote-code --dtype bfloat16 --max-model-len 262144`. Requiere aplicar `vllm-patch.py` (idempotente, con `--check` y `--revert`) para corregir dos bugs: la lectura del ancho de bits por capa en `quantization/inc/config_parser.py` (la clase `RoutedExperts` no contiene `fusedmoe`, por lo que los expertos W3 caen a contenedores de 4 bits y provocan OOM en `lm_head`, ~63 GiB para un checkpoint de 49,8 GiB) y el registro de `bailing_v3_kda_attention` fuera de la captura de CUDA graphs.
- Alternativa sin el segundo parche: `--compilation-config '{"cudagraph_mode":"FULL_DECODE_ONLY"}'` o `--enforce-eager`.
- Kernels: los expertos de 2/3 bits se ejecutan en kernels Humming; las capas de 4/8 bits, en Marlin.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling3.0-Flash-3.58BPW | 15,14B totales (MoE) | 262.144 tokens | AutoRound mixta, 3,58 BPW | no disponible | Hugging Face, vLLM con parches |
| Ling3.0-Flash-3.44BPW | 15,14B totales (MoE) | no disponible | AutoRound mixta, 3,44 BPW | no disponible | Hugging Face |
| inclusionAI/Ling-3.0-flash (BF16) | 15,14B totales (MoE) | no disponible | BF16 | no disponible | Hugging Face |

La comparación con alternativas de otros desarrolladores del mismo tamaño o tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Requiere dos parches sobre vLLM 0.32/0.33; sin ellos el modelo falla con OOM en la construcción o con `cudaErrorStreamCaptureUnsupported`. No es un problema de cuantización, sino bugs del runtime, pero condiciona el despliegue.
- El `config.json` debe contener `"model_type": "bailing_hybrid"`. Las copias antiguas del checkpoint perdieron esa clave y hacen que vLLM dimensione mal la caché KV y falle en la primera capa MLA con un error de tamaño de página.
- La decodificación con vLLM no reproduce exactamente al decodificador de referencia: concordancia top-1 del 84,79% y solapamiento top-20 del 78,2%, marcado como FAIL en la propia model card. Conviene validar la calidad de salida en el runtime real antes de producción.
- El dominio de prosa es el más degradado: KL media 0,09677 y aumento de perplejidad de 2,024 a 2,103. Para redacción y textos largos conviene una validación adicional.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada; deben evaluarse sobre el modelo base.
- Idiomas soportados: no disponible.
- Licencia: no disponible; no se puede confirmar el uso comercial sin consultar la licencia del modelo base inclusionAI/Ling-3.0-flash.
- El checkpoint elimina la capa MTP y es de solo texto; no admite multimodalidad ni decodificación especulativa basada en MTP.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Beling86/Ling3.0-Flash-3.58BPW
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Variante anterior: https://huggingface.co/Beling86/Ling3.0-Flash-3.44BPW (referenciada en la model card; no verificada)
- Script de parches vLLM: `vllm-patch.py`, incluido en el repositorio del checkpoint
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
