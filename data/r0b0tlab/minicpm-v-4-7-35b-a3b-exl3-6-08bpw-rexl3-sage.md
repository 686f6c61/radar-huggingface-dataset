# r0b0tlab/MiniCPM-V-4.7-35B-A3B-EXL3-6.08bpw-REXL3-SAGE

## Resumen

MiniCPM-V-4.7-35B-A3B-EXL3-6.08bpw-REXL3-SAGE es una cuantización en formato EXL3 del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario r0b0tlab. Se trata de un modelo de mezcla de expertos (MoE) de 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, que combina un backbone lingüístico derivado de Qwen3.6 con un codificador visual SigLIP2. El pack está pensado para servirse con el runtime REXL3 sobre una única NVIDIA DGX Spark (GB10), con una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha radica en que permite ejecutar un MLLM de 35B en hardware de un solo nodo con memoria unificada, manteniendo una fidelidad alta respecto al modelo original en bf16. El autor reporta una divergencia KL media de 0,003378 frente a bf16 y un 97,93 % de acuerdo top-1 en texto, medido sobre 100 filas reservadas de 2.048 tokens (204.800 posiciones).

El paquete ocupa 28,4 GB en cuatro shards safetensors y cuantiza únicamente las capas lineales del decodificador, dejando en bf16 (o fp16 donde los kernels lo requieren) los embeddings, la torre visual, el merger, el proyector, las normas, el router y las proyecciones de compuerta pequeñas. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (backbone lingüístico derivado de Qwen3.6 + codificador visual SigLIP2) |
| Parametros totales | 35B según el autor; 14.140.174.768 tensores reportados en safetensors (ver observaciones) |
| Parametros activos | ~3B (denominación A3B) |
| Longitud de contexto | 262.144 tokens (ventana del runtime REXL3) |
| Tipos de cuantizacion | EXL3 trellis a 6,08 bits por peso: expertos enrutados 6 bit; atención, gated-delta-net y proyecciones de expertos compartidos 8 bit; cabeza de salida 6 bit |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 28,4 GB), formato EXL3 |
| Codebook / receta | `mul1`, 250 filas de calibración de texto de 2.048 tokens, forward de calibración en fp32, escalas de salida activadas |
| Revision del modelo base | `4c7623a9` |

## Arquitectura y entrenamiento

El modelo base es un MLLM de arquitectura MoE que empareja un backbone de lenguaje derivado de Qwen3.6 con un codificador visual SigLIP2, más un merger y un proyector que alinean los tokens de imagen con el espacio del decodificador. La variante cuantizada conserva intactos los componentes sensibles a la precisión (embeddings, torre visual, merger, proyector, normas, router y compuertas) y aplica cuantización EXL3 en formato trellis únicamente a las capas lineales del decodificador, con anchos diferenciados: 6 bit para los expertos enrutados y la cabeza de salida, y 8 bit para atención, gated-delta-net y proyecciones de expertos compartidos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada. La innovación técnica destacable de este pack es la propia cuantización EXL3 con receta REXL3-SAGE y su integración con decodificación especulativa mediante el draft r0b0tlab/MiniCPM-V-4.7-35B-A3B-DSpark-EXL3-6.00bpw, además de caché de prefijos y soporte de entrada de imagen en el runtime REXL3.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`): descripción, respuesta a preguntas visuales y conversación sobre imágenes.
- Razonamiento sobre documentos e imágenes de alta resolución, sujeto a las capacidades del modelo base.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Servicio compatible con API OpenAI a través del runtime REXL3.
- Decodificación especulativa mediante el draft DSpark asociado, con verificación por huella y checksums de shards.
- Soporte de caché de prefijos y múltiples slots de servicio (4 slots en la configuración de referencia).
- No se documenta soporte explícito de tool calling, function calling ni audio en la información disponible.

## Casos de uso

- Asistente documental con imágenes: ingesta de capturas, escaneos o diagramas junto con texto largo en una ventana de 262.144 tokens, útil para revisar expedientes completos sin truncar contexto.
- Analítica de documentos técnicos: extracción y resumen de información de manuales con figuras, aprovechando el codificador SigLIP2 y el contexto extendido.
- Atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta imágenes de producto o errores, servido vía API compatible con OpenAI.
- Despliegue en un único nodo: inferencia en una DGX Spark (GB10) con 28,4 GB de pesos, adecuado para laboratorios con memoria unificada y sin clúster multi-GPU.
- Evaluación de modelos cuantizados: banco de pruebas para medir fidelidad de EXL3 frente a bf16 en tareas de texto e imagen, con métricas KL y acuerdo top-1 reproducibles.
- Prototipado de agentes visuales: pipelines que alternan lectura de imágenes y razonamiento textual con caché de prefijos para reducir latencia en sesiones largas.
- Investigación en compresión de MoE: comparación de recetas de cuantización (6/8 bit mixto) sobre un modelo de 35B con 3B activos.

## Benchmarks y rendimiento

| Metrica | Este pack (6,08 bpw, REXL3-SAGE) | Pack EXL3-6.08bpw previo | bf16 (referencia) |
|---|---|---|---|
| KL a bf16 (media) | 0,003378 | 0,003522 | 0 (referencia) |
| Acuerdo top-1 | 97,93 % | 97,90 % | 100 % |
| NLL | 1,8234 | 1,8232 | 1,8228 |

Medición sobre texto: 100 filas reservadas de 2.048 tokens (204.800 posiciones), forward en torch de ambos packs frente al modelo bf16 en fp32, intervalos del 95 % por bootstrap pareado por fila (10.000 remuestreos). El pack actual presenta un KL un 4,1 % inferior al pack previo (ratio 0,959; IC 95 %: 0,932-0,987); el acuerdo top-1 es equivalente dentro del ruido (ratio 1,0003; IC 95 %: 0,9996-1,0010). Las entradas de imagen no formaron parte de esta medición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en disco y en memoria: 28,4 GB en 4 shards safetensors en formato EXL3.
- Hardware de referencia del autor: una NVIDIA DGX Spark (GB10, aarch64, SM121) con memoria unificada.
- VRAM estimada: no disponible de forma independiente; el pack está dimensionado para un único GB10 con memoria unificada y 262.144 tokens de ventana, 4 slots y caché de prefijos.
- GPU consumer: no se documenta compatibilidad con GPUs consumer (RTX 4090, etc.); el runtime REXL3 y los kernels están orientados a GB10.
- Opciones de despliegue: runtime REXL3 (servidor compatible con OpenAI), con script de un solo comando del repositorio r0b0tlab/minicpm-v47-exl3-exllamav3-gb10 que verifica la máquina, compila la extensión CUDA desde un commit fijado, descarga y verifica el pack y retira la caché de páginas de shards que rompe la carga en memoria unificada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (REXL3-SAGE, 6,08 bpw) | 35B totales / ~3B activos | 262.144 | EXL3 safetensors | Apache 2.0 | Hugging Face, runtime REXL3 |
| r0b0tlab/MiniCPM-V-4.7-35B-A3B-EXL3-6.08bpw | 35B totales / ~3B activos | no disponible | EXL3 safetensors | Apache 2.0 | Hugging Face |
| openbmb/MiniCPM-V-4.7-35B-A3B (bf16) | 35B totales / ~3B activos | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face |
| r0b0tlab/MiniCPM-V-4.7-35B-A3B-DSpark-EXL3-6.00bpw (draft) | no disponible | no disponible | EXL3 safetensors | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo se soportan inglés y chino; no hay cobertura documentada de castellano.
- La medición de fidelidad excluye entradas de imagen: el comportamiento con visión puede divergir más respecto a bf16 que el texto.
- Existe una discrepancia entre los 35B declarados por el autor y los 14.140.174.768 parámetros reportados en los metadatos de safetensors; conviene verificar el conteo real antes de dimensionar el despliegue.
- El formato EXL3 requiere el runtime REXL3 y kernels específicos; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- El despliegue de referencia está atado a GB10 (aarch64, SM121); el soporte en otras GPUs no está documentado.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero obliga a mantener avisos de atribución y a indicar los cambios realizados (§4(b)).
- El aviso de parseo de `config.json` (`quantization_config.bits` debe ser entero) aparece en la documentación del pack previo y puede afectar a herramientas de carga genéricas.

## Enlaces

- Hugging Face del pack: https://huggingface.co/r0b0tlab/MiniCPM-V-4.7-35B-A3B-EXL3-6.08bpw-REXL3-SAGE
- Pack EXL3 previo: https://huggingface.co/r0b0tlab/MiniCPM-V-4.7-35B-A3B-EXL3-6.08bpw
- Draft de decodificación especulativa: https://huggingface.co/r0b0tlab/MiniCPM-V-4.7-35B-A3B-DSpark-EXL3-6.00bpw
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Repositorio de despliegue en GB10: https://github.com/r0b0tlab/minicpm-v47-exl3-exllamav3-gb10/tree/main
- Runtime REXL3: https://github.com/REXL3/REXL3
- Paper MiniCPM-V: https://arxiv.org/abs/2408.01800
