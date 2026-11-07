# piroman441/red-ds4

## Resumen

red-ds4 es una cuantización NVFP4 (4 bits) de los pesos del modelo GLM-5.3-Flash, publicada por el usuario piroman441. Se trata de un checkpoint de tipo vision-language con arquitectura MoE (`Glm5NextForConditionalGeneration`, etiqueta `glm5_next`) de 321.323.031.390 parámetros totales, pensado para servirse con vLLM. La cuantización afecta únicamente a los expertos enrutados del bloque MoE, mientras que el resto de componentes (atención, expertos compartidos, embeddings, `lm_head`, torre de visión) permanece en BF16.

El modelo resuelve el problema del coste de despliegue de un MoE de gran tamaño: al reducir los expertos a FP4, el checkpoint ocupa aproximadamente 191 GiB, lo que permite servirlo en 8×H100 y aprovechar los tensor cores FP4 nativos en GPUs Blackwell. Mantiene una ventana de contexto de 1.048.576 tokens y un vocabulario de 154.880 entradas, con soporte declarado de inglés y chino.

Es relevante ahora porque combina tres tendencias: cuantización de precisión muy baja (NVFP4 con escalas por grupo), arquitecturas híbridas de atención (lineal con compuertas y atención dispersa) y despliegue optimizado en vLLM. La licencia MIT heredada del modelo base facilita su uso comercial, aunque la ficha original no detalla todos los datos de entrenamiento del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (`glm5_next`): 45 capas + 1 MTP, hidden 4096, atención híbrida (34 KDA lineales con compuertas + 11 de atención completa dispersa), MLA, MoE con 288 expertos enrutados top-8 + 1 compartido, visión y vídeo nativos |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible (MoE top-8 sobre 288 expertos enrutados; el número exacto de parámetros activos no se publica) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (W4, E2M1 grupo-16 + escala FP8-E4M3 + escala global FP32) en expertos enrutados; BF16 en el resto; FP32 en tensores auxiliares (mHC, SSM, router) |
| Idiomas soportados | en, zh |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors; `weight_packed` (uint8) + `weight_scale` (FP8-E4M3) + `weight_global_scale` (FP32) para expertos; BF16 para el resto |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con 45 capas más una capa MTP (multi-token prediction). Combina 34 capas de atención lineal con compuertas (KDA) y 11 capas de atención completa dispersa, junto con atención multi-cabeza latente (MLA). El bloque MoE contiene 288 expertos enrutados con selección top-8 más un experto compartido, y el modelo incorpora torre de visión y procesamiento de vídeo, lo que lo habilita para tareas image-text-to-text.

La cuantización es weight-only y data-free: los pesos de los expertos se derivan directamente del checkpoint fuente mediante FP4 simétrico con absmax por grupo, y las activaciones se cuantizan dinámicamente en tiempo de ejecución. Solo se cuantizan las proyecciones `gate`, `up` y `down` de los expertos enrutados en las capas 3 a 44; la cabeza MTP se mantiene en BF16 para coincidir con `num_nextn_predict_layers`. La caché KV no se cuantiza (BF16 en runtime). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento controlable mediante `reasoning_effort` (`low`, `high`, `max`) y `clear_thinking: true` para chat.
- Procesamiento de imagen y vídeo (pipeline image-text-to-text, torre de visión nativa).
- Function calling y tool calling, según las etiquetas del modelo.
- Razonamiento multi-paso y uso como agente, con soporte de predicción multi-token (MTP).
- Capacidades multilingües limitadas a inglés y chino.
- Contexto largo de hasta 1.048.576 tokens.
- Cuantización NVFP4 optimizada para vLLM, con decodificación compatible con tensor cores FP4 en Blackwell.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1.048.576 tokens, manteniendo el historial completo sin truncamiento.
- Análisis de documentos extensos y contratos: la ventana de contexto permite procesar manuales o expedientes completos en una sola pasada, con razonamiento controlado mediante `reasoning_effort`.
- Generación de código en producción: el soporte de function calling y tool calling permite integrarlo en pipelines de CI/CD y asistentes de IDE que invocan herramientas externas.
- Procesamiento de vídeo e imagen para moderación o catalogación: la torre de visión nativa permite describir, etiquetar y resumir contenido visual en flujos automatizados.
- Agentes autónomos multi-paso: la predicción multi-token (MTP) y el razonamiento por pasos lo hacen adecuado para orquestación de tareas con planificación intermedia.
- Despliegue self-hosted en clústeres de 8×H100: al ocupar ~191 GiB, permite servir un MoE de gran tamaño en infraestructura propia con vLLM y API compatible con OpenAI.
- Investigación en cuantización de precisión ultrabaja: sirve como referencia para estudiar el impacto de NVFP4 en expertos MoE frente a FP8 (error relativo medio del 9,18 %).

## Benchmarks y rendimiento

Evaluación medida sobre estos pesos frente a la fuente FP8, según la model card:

| Metrica | Valor |
|---|---|
| Error relativo medio (expertos NVFP4 vs FP8) | 9,18 % |
| Similitud coseno | 0,9958 |
| Perplejidad (wikitext-2) | 2,894 vs 2,788 FP8 (+3,8 %) |
| KLD media | 0,073 |
| Acuerdo top-1 | 91,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~191 GiB de pesos más la caché KV; se recomienda planificar al menos 8 GPUs de 80 GB para margen operativo.
- GPUs verificadas: 8×H100. En Blackwell se aprovechan los tensor cores FP4 nativos.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Despliegue mediante vLLM con soporte `glm5_next`: imagen `vllm/vllm-openai:glm53-flash-x86_64-cu129` o build desde vllm#53906, con `--tensor-parallel-size 8`.
- En Hopper no se admite `--kv-cache-dtype fp8` para este modelo; debe omitirse.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| red-ds4 (este) | 321,3 B | 1.048.576 | NVFP4 en expertos + BF16 | MIT | Hugging Face, vLLM |
| GLM-5.3-Flash (base) | no disponible | no disponible | BF16/FP8 | MIT | Hugging Face |
| piroman441/DeepSeek-V4-Flash-DSpark | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce degradación medible: +3,8 % de perplejidad y 9,18 % de error relativo medio frente a FP8, con un 8,3 % de desacuerdo top-1.
- Solo se soportan inglés y chino; el rendimiento en otros idiomas no está garantizado.
- El modelo base no documenta en esta ficha los datos de entrenamiento ni los sesgos conocidos; deben evaluarse antes de producción.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el modo de razonamiento extendido.
- Requiere una build específica de vLLM con soporte `glm5_next`; no funciona con versiones estándar sin ese parche.
- En Hopper no se puede usar caché KV en FP8; hay que mantener BF16, lo que incrementa el consumo de memoria.
- La licencia MIT se hereda del modelo base, pero el autor advierte que la cuantización no altera las obligaciones de licencia subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/piroman441/red-ds4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio relacionado del autor: https://huggingface.co/piroman441/DeepSeek-V4-Flash-DSpark
- Build de vLLM referenciada (vllm#53906): no disponible como enlace directo en la información proporcionada
