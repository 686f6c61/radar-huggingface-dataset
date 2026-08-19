# lribeiro/Qwen3.8-27B-nvfp4-v17

## Resumen

El modelo `lribeiro/Qwen3.8-27B-nvfp4-v17` es una variante cuantizada del vision-language model Qwen3.8-27B, desarrollada por el usuario independiente lribeiro mediante un barrido experimental de 38 ejecuciones de cuantizacion. Se trata de un VLM hibrido que combina 48 capas de atencion lineal (GatedDeltaNet) con 16 capas de atencion completa, junto a un encoder visual ViT de 27 capas, sumando 27.781.427.984 parametros en total. La cuantizacion aplica FP8 E4M3 en formato W8A8 con correccion GPTQ basada en Hessiano a todas las capas del modelo de lenguaje, mientras que la torre visual y la cabeza MTP se mantienen en BF16 para preservar la capacidad de comprension de imagenes y video.

La relevancia de este modelo radica en que consigue una fidelidad superior a la liberacion oficial FP8 de Qwen (KLD 0.0123 frente a 0.0134) gracias a la correccion de pesos GPTQ, con un rendimiento de prefill 2,5 veces superior. El checkpoint ocupa 29,97 GB, un 46% menos que los 55,6 GB del modelo base BF16, y esta disenado para ejecutarse directamente en vLLM con el backend FlashInfer. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El contexto maximo configurado es de 8.192 tokens, aunque el modelo base podria soportar ventanas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (VLM hibrido: 48 capas linear-attention GatedDeltaNet + 16 capas full-attention, encoder visual ViT) |
| Parametros totales | 27.781.427.984 (27,78B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (configuracion de benchmark) |
| Tipos de cuantizacion | FP8 E4M3 W8A8 GPTQ (compressed-tensors); vision tower y MTP en BF16 |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15 shards, formato compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina atencion lineal recurrente (GatedDeltaNet) en 48 de sus 64 capas, con atencion completa estandar en las 16 capas restantes (una cada cuatro capas, en las posiciones 0, 4, 8, ..., 60). Cada capa de atencion lineal contiene proyecciones `in_proj_qkv`, `in_proj_z`, `out_proj` y rutas de estado recurrente `in_proj_a`/`in_proj_b`; las capas de atencion completa usan proyecciones q/k/v/o estandar. Todas comparten bloques MLP con `gate_proj`, `up_proj` y `down_proj`, activacion SiLU, dimension oculta 5.120, dimension intermedia 17.408, 24 cabezas de atencion de 256 dimensiones y un vocabulario de 248.320 tokens. El encoder visual es un ViT de 27 capas con dimension oculta 1.152, patch size 16 y 16 cabezas, que inyecta embeddings en el modelo de lenguaje a traves de tokens de imagen/video.

La cuantizacion se realizo con llm-compressor, aplicando FP8 E4M3 W8A8 uniforme con pesos por canal y activaciones dinamicas por token, mas correccion de pesos GPTQ basada en Hessiano con `actorder=static` y `dampening_frac=0.01`. La calibracion utilizo 181 contextos de 2048 tokens del dataset `malaiwah/qwen38-27b-fidelity-suite-v3`. Los experimentos v23/v24/v26 confirmaron que el parametro `dampening_frac` es irrelevante para FP8, por lo que v17 usa el valor por defecto. La torre visual (333 tensores BF16, 460,7M parametros) y la cabeza MTP (15 tensores BF16) se mantienen sin cuantizar por sensibilidad numerica y restricciones de CUTLASS en dimensiones no multiplo de 64. El checkpoint v17 es el mejor configuracion all-FP8 del barrido, superado solo por la variante mixta v31 (FP8 W8A16 en atencion) que logra un 18% menos de KLD.

## Capacidades

- Comprension de imagenes y video: el encoder visual ViT procesa parches de imagen y video e inyecta embeddings en el modelo de lenguaje, permitiendo tareas de image-text-to-text.
- Generacion de texto multilingue: al derivar de Qwen3.8-27B, soporta multiples idiomas con capacidad conversacional.
- Razonamiento de contexto largo: con 8.192 tokens de ventana configurada, puede manejar conversaciones multi-turno y documentos extensos.
- Atencion lineal hibrida: las 48 capas GatedDeltaNet proporcionan eficiencia en decodificacion con estado recurrente, mientras las 16 capas full-attention mantienen capacidad de razonamiento global.
- Multi-token prediction (MTP): la cabeza MTP esta presente en BF16, aunque en esta configuracion no se utiliza para decodificacion especulativa.
- Compatibilidad con vLLM: formato compressed-tensors listo para servir con vLLM y backend FlashInfer, con cuantizacion FP8 nativa.
- Tool calling y agentes: no se menciona soporte explicito en la model card, pero al ser un derivado de Qwen3.8 se espera compatibilidad con las capacidades del modelo base (no confirmado en la informacion disponible).

## Casos de uso

- Asistentes de vision por voz: el modelo puede procesar capturas de pantalla o fotos junto a texto para responder preguntas sobre el contenido visual, aprovechando la torre visual BF16 intacta y la ventana de 8.192 tokens para contexto conversacional.
- Analisis de documentos con imagenes: integrado en un pipeline de extraccion de informacion, puede leer paginas escaneadas o diagramas y generar resumenes estructurados, gracias a su capacidad multilingue y al encoder ViT.
- Chatbot de soporte tecnico con contexto largo: con 8.192 tokens, puede mantener conversaciones multi-turno con historial extenso y referencias a documentacion tecnica, reduciendo costes de inferencia frente al modelo BF16 gracias a la cuantizacion FP8.
- Generacion de descripciones accesibles: para plataformas de contenido, el modelo puede generar texto alternativo para imagenes y videos, usando el pipeline image-text-to-text de forma directa.
- Razonamiento multimodal en investigacion: en entornos academicos, puede combinarse con herramientas de busqueda para analizar figuras cientificas y tablas, aprovechando la atencion hibrida para documentos largos.
- Servicio de inferencia de alto rendimiento: desplegado con vLLM en hardware Blackwell, el modelo ofrece 2,5 veces el throughput de prefill de la version FP8 oficial de Qwen, adecuado para APIs publicas con alta concurrencia (hasta 512 secuencias simultaneas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta unicamente metricas de fidelidad de cuantizacion y rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| KLD (divergencia KL) vs modelo base | 0.0123 (frente a 0.0134 de la version FP8 oficial de Qwen) |
| Throughput de prefill | 2,5x superior a la version FP8 oficial de Qwen |
| Tamano del checkpoint | 29,97 GB (1,85x menor que el BF16 base de 55,6 GB) |

Estos datos indican que la cuantizacion preserva mejor la distribucion de salidas que la alternativa oficial, con un coste computacional menor en prefill. No se dispone de mediciones de latencia por token ni de throughput de decodificacion.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 29,97 GB, por lo que se recomienda al menos 40 GB de VRAM para inferencia con overhead de KV cache y activaciones; con `--gpu-memory-utilization` alto podria ajustarse a 32-36 GB.
- GPU recomendadas: NVIDIA Blackwell (SM120) como B200 o GB200, o Ampere/Hopper con soporte FP8 E4M3 (A100, H100). No se garantiza funcionamiento en GPUs consumer (RTX 4090 tiene 24 GB, insuficiente para este checkpoint sin cuantizacion adicional).
- Despliegue: vLLM 0.26.1rc0 (fork infernal-invocation) con backend FlashInfer y `--quantization compressed-tensors`. Tambien compatible con transformers via `trust_remote_code`, aunque no se documenta el flujo completo.
- Latencia y throughput: no se proporcionan cifras absolutas; solo se indica un throughput de prefill 2,5x superior a la version FP8 oficial de Qwen.
- Consideracion critica: en vLLM, el parametro `--max-num-seqs` debe reducirse a 512 (o aumentar `--gpu-memory-utilization`) porque las 48 capas de atencion lineal requieren bloques de cache tipo Mamba por secuencia; el valor por defecto de 1024 puede exceder los bloques disponibles y fallar durante la captura de CUDA graphs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27,78B | 8.192 (config) | BF16 | Apache 2.0 | Modelo original sin cuantizar, 55,6 GB |
| Qwen3.8-27B FP8 oficial | 27,78B | 8.192 (config) | FP8 | Apache 2.0 | Version FP8 de Qwen, KLD 0.0134 |
| lribeiro/Qwen3.8-27B-nvfp4-v17 | 27,78B | 8.192 (config) | FP8 W8A8 GPTQ | Apache 2.0 | KLD 0.0123, 2,5x prefill, vision tower BF16 |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de otros VLM de tamano similar (p. ej., Qwen2.5-VL-27B o Llama-3.2-Vision) en la informacion proporcionada. La ventaja principal de v17 frente a la version oficial es la correccion GPTQ, que reduce la divergencia KL y mejora el rendimiento de prefill, manteniendo la torre visual en BF16 para no degradar la comprension multimodal.

## Limitaciones y advertencias

- Requisito de hardware especifico: la cuantizacion FP8 E4M3 exige GPUs con soporte nativo (Blackwell SM120 o Ampere/Hopper); no funcionara en GPUs mas antiguas o consumer sin soporte FP8.
- Contexto limitado a 8.192 tokens: la configuracion de benchmark fija esta ventana; no se ha validado el comportamiento con contextos mayores, lo que puede limitar tareas de documentos muy extensos.
- MTP no activo: la cabeza multi-token prediction esta presente en BF16 pero no se utiliza para decodificacion especulativa en esta configuracion, por lo que no se aprovecha su potencial de aceleracion.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo, puede producir contenido inventado, especialmente en tareas de vision donde la interpretacion de imagenes ambiguas es propensa a errores.
- Sesgos del modelo base: al derivar de Qwen3.8-27B, hereda los sesgos socioculturales y linguisticos del entrenamiento original, no mitigados por la cuantizacion.
- Limitaciones de despliegue en vLLM: el parametro `--max-num-seqs` debe ajustarse manualmente a 512 o inferior; valores mayores provocan fallos en la captura de CUDA graphs por agotamiento de bloques de cache Mamba.
- Dependencia de un fork especifico de vLLM: se requiere la version 0.26.1rc0 del fork infernal-invocation con FlashInfer, lo que puede complicar la integracion en entornos con versiones estandar de vLLM.
- Sin benchmarks estandar publicados: no hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos, lo que dificulta evaluar la calidad del modelo frente a alternativas en tareas concretas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lribeiro/Qwen3.8-27B-nvfp4-v17
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM (fork requerido): https://github.com/vllm-project/vllm
- Dataset de calibracion: https://huggingface.co/malaiwah/qwen38-27b-fidelity-suite-v3
