# gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-LMHead4

## Resumen

Qwen3.8-27B-NVFP4-RTX5090-LMHead4 es una variante cuantizada del checkpoint Qwen3.8-27B-NVFP4-RTX5090, desarrollada por gittensor-model-hub, que cuantiza específicamente la capa `lm_head` a NVFP4 en lugar de dejarla en BF16. El modelo base es Qwen3.8-27B de Alibaba, un modelo denso de 27 000 millones de parámetros con atención híbrida (48 de 64 capas con atención lineal), torre de visión, cabeza de draft MTP integrada y ventana de contexto nativa de 262 144 tokens, extensible a 1 millón. Esta variante reduce el checkpoint de 20,59 GB a 18,77 GB y los pesos residentes en VRAM de 18,80 GB a 17,10 GB, logrando una decodificación un 8,4 % más rápida sin especulación y un 15 % más rápida con el drafter DSpark, todo ello sin degradación medible de precisión.

La relevancia de este modelo radica en que, sobre hardware consumer como la RTX 5090, el cuello de botella es el ancho de banda de memoria, no el cómputo. El `lm_head` es una GEMM de vocabulario completo (248 320 × 5 120) que se evalúa en cada token generado, ocupando 2,54 GB de los 18,80 GB de pesos leídos por token. Al cuantizarlo a NVFP4, ese bloque se reduce a 0,72 GB, lo que se traduce casi linealmente en tokens por segundo adicionales. El modelo está optimizado para servirse con SGLang y vLLM, mantiene la licencia Apache 2.0 y es compatible con decodificación especulativa mediante el drafter DSpark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, hybrid attention, 48/64 capas con atencion lineal, torre de vision, cabeza MTP) |
| Parametros totales | 14 982 247 152 (según safetensors; el modelo base original tiene 27B, la cuantizacion NVFP4 reduce el conteo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativa, extensible a 1M |
| Tipos de cuantizacion | NVFP4 (W4A4) para `lm_head`; el resto del checkpoint ya estaba cuantizado NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, NVFP4 (E2M1 packed + escalas F8_E4M3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con una arquitectura de atención híbrida: 48 de sus 64 capas utilizan atención lineal (lo que reduce el coste cuadrático del contexto largo), mientras que las 16 restantes mantienen atención completa. Incluye una torre de visión que permite entrada de imágenes, una cabeza de draft MTP (multi-token prediction) integrada para decodificación especulativa nativa en vLLM, y una ventana de contexto nativa de 262 144 tokens. El checkpoint padre, Qwen3.8-27B-NVFP4-RTX5090, fue cuantizado con NVIDIA Model Optimizer para GPUs Blackwell, comprimiendo el original de 53 GB BF16 a 18,8 GB en VRAM.

Esta variante LMHead4 realiza una cuantización adicional específica sobre el `lm_head`, que permanecía en BF16 en el padre. El tensor `lm_head.weight` (248 320 × 5 120) se reemplaza por cuatro tensores NVFP4: pesos empaquetados E2M1 en U8 (248 320 × 2 560), escalas por grupo de 16 en F8_E4M3 (248 320 × 320), una escala global F32 y una escala de activación F32 con amax 49,75 medida sobre entradas reales del `lm_head` en el padre servido. La cuantización se realizó con ModelOpt 0.45, garantizando que el empaquetado E2M1 y el layout de escalas coincidan con lo que espera el runtime. Además, se eliminó el `lm_head` de ambas listas de exclusión (`hf_quant_config.json` y `config.json`), evitando el fallback silencioso a una capa sin cuantizar. El resto de tensores son bit-idénticos al padre.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas: el modelo mantiene las capacidades completas del Qwen3.8-27B, incluyendo razonamiento paso a paso con modo thinking activable.
- Soporte de tool calling y function calling: compatible con el parser `qwen3_coder` en SGLang, lo que permite integracion con APIs y herramientas externas.
- Capacidades de agente y razonamiento multi-paso: la acceptance del drafter DSpark en escenarios agentic alcanza 3,891, indicando buen rendimiento en tareas que requieren multiples llamadas a herramientas.
- Capacidades multilingues: no documentadas en la model card, aunque el modelo base Qwen3.8-27B soporta multiples idiomas.
- Capacidades de vision: el pipeline es `image-text-to-text`, por lo que puede procesar imagenes como entrada junto con texto.
- Modo thinking: soportado mediante el parser `qwen3` en SGLang, activable para tareas de razonamiento profundo.
- Decodificacion especulativa: compatible con el drafter DSpark v2 (gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4) y con la cabeza MTP nativa para vLLM.
- Contexto largo: ventana nativa de 262 144 tokens, con soporte de cache KV en FP8 y backend FlashInfer.

## Casos de uso

- Inferencia de alto rendimiento en GPU consumer: el modelo está diseñado para ejecutarse en una RTX 5090 de 32 GB con 88,45 tok/s sin especulación y 181,7 tok/s con DSpark, lo que lo hace adecuado para servir chatbots en entornos de un solo usuario o con concurrencia baja.
- Razonamiento cientifico y matematico: con resultados de 13/20 en GPQA Diamond y 12/20 en AIME 2025, puede utilizarse para asistencia en investigacion, resolucion de problemas de nivel avanzado y tutoria especializada.
- Generacion de codigo en produccion: el soporte de tool calling y el parser `qwen3_coder` permiten integrarlo en pipelines de CI/CD para generacion, revision y refactorizacion de codigo, o como asistente en IDEs.
- Agentes autonomos multi-paso: la acceptance agentic de 3,891 tokens por paso de drafter indica que puede mantener cadenas largas de llamadas a herramientas sin degradacion, apto para automatizacion de tareas complejas.
- Procesamiento de documentos de contexto largo: con 262 144 tokens de ventana nativa, puede analizar libros completos, codigos fuente extensos o expedientes legales en una sola pasada, sin necesidad de chunking.
- Aplicaciones de vision-lenguaje: al ser un modelo `image-text-to-text`, puede responder preguntas sobre imagenes, generar descripciones o razonar sobre diagramas tecnicos, combinado con su capacidad de razonamiento.
- Despliegue en edge con GPUs Blackwell: al ocupar solo 17,10 GB de VRAM, cabe en GPUs de 24 GB como la RTX 5090 e incluso en algunas de 20 GB, permitiendo inferencia local sin dependencia de la nube.

## Benchmarks y rendimiento

Los benchmarks de precision se midieron con 20 items por tarea, seed `20260815`, thinking activado, `temperature=1.0`, `top_p=0.95` y limite de generacion de 24k tokens, ejecutados en SGLang. La comparacion entre el padre y esta variante es valida porque ambos se ejecutaron en el mismo harness.

| Tarea | Padre (lm_head BF16) | Esta variante (lm_head NVFP4) |
|---|---|---|
| GPQA Diamond | 10/20 | 13/20 |
| AIME 2025 | 11/20 | 12/20 |
| MMLU-Pro | 17/20 | 17/20 |
| **Overall** | **38/60 (63 %)** | **42/60 (70 %)** |

El autor advierte explicitamente que la diferencia de 4 items esta dentro del ruido estadistico para n=20 con `temperature=1.0`, y que 6-9 items por tarea alcanzaron el limite de truncacion de 24k tokens en ambos brazos. La afirmacion respaldada es que la cuantizacion de logits a 4 bits no degrada la calidad de forma medible, no que la mejore.

Rendimiento de decodificacion en una RTX 5090, con concurrencia 1:

| Metrica | Padre | Esta variante | Variacion |
|---|---|---|---|
| Checkpoint | 20,59 GB | 18,77 GB | −8,8 % |
| Pesos en VRAM | 18,80 GB | 17,10 GB | −9,0 % |
| Decode sin especulacion | 81,6 tok/s | 88,45 tok/s | +8,4 % |
| Decode con DSpark drafter | 158,0 tok/s | 181,7 tok/s | +15,0 % |
| Acceptance DSpark (held-out) | 2,886 | 2,904 | +0,6 % |
| Acceptance DSpark (agentic) | 3,766 | 3,891 | +3,3 % |

La tasa de lectura de pesos del padre se estima en 1,65 TB/s frente a los 1,79 TB/s especificados para la RTX 5090, es decir, un 92 % del pico. El modelo predijo 89,7 tok/s y se midieron 88,45, dentro de un 1,4 % de error.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,10 GB de pesos residentes, mas cache KV y overhead del runtime. Cabe en una RTX 5090 de 32 GB con margen para contexto largo.
- GPU recomendadas: RTX 5090 (Blackwell) con soporte NVFP4 nativo. Tambien compatible con otras GPUs Blackwell de 24 GB o mas, aunque el rendimiento puede variar.
- Compatibilidad con GPU consumer: si, la RTX 5090 es una GPU consumer. No se garantiza funcionamiento en arquitecturas anteriores (Ampere, Ada) debido a la dependencia de NVFP4.
- Opciones de despliegue: SGLang (recomendado, con soporte completo de DSpark, FlashInfer y cache FP8), vLLM (con cabeza MTP nativa para especulacion), y cualquier runtime compatible con transformers y safetensors.
- Latencia y throughput: 88,45 tok/s en decode sin especulacion y 181,7 tok/s con DSpark, medidos en una RTX 5090 a concurrencia 1. Con `--max-running-requests 2` se puede servir a dos usuarios simultaneos con degradacion minima.
- Comando de servicio recomendado (SGLang):
  ```bash
  sglang serve --model-path gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-LMHead4 \
    --trust-remote-code --tp-size 1 \
    --context-length 65536 --kv-cache-dtype fp8_e4m3 \
    --attention-backend flashinfer --chunked-prefill-size 2048 \
    --mamba-radix-cache-strategy extra_buffer_lazy --mamba-ssm-dtype bfloat16 \
    --mem-fraction-static 0.90 --max-running-requests 2 \
    --speculative-algorithm DSPARK \
    --speculative-draft-model-path gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4 \
    --speculative-dspark-block-size 7 --speculative-draft-model-quantization modelopt_fp4 \
    --reasoning-parser qwen3 --tool-call-parser qwen3_coder
  ```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM | Decode (RTX 5090) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 original) | 27B | 262 144 | Ninguna | ~53 GB | no cabe en 32 GB | Apache 2.0 |
| Qwen3.8-27B-NVFP4-RTX5090 (padre) | 27B | 262 144 | NVFP4 (lm_head BF16) | 18,80 GB | 81,6 tok/s | Apache 2.0 |
| **Qwen3.8-27B-NVFP4-RTX5090-LMHead4** | 27B | 262 144 | NVFP4 completo | 17,10 GB | 88,45 tok/s (181,7 con DSpark) | Apache 2.0 |
| Qwen3.8-27B-DSpark-NVFP4 (drafter) | no disponible | no disponible | NVFP4 | no disponible | no aplica | Apache 2.0 |

La comparativa se limita a la familia Qwen3.8-27B porque no se dispone de datos de benchmarks contra otros modelos de tamano similar en la informacion proporcionada. La ventaja principal de esta variante frente al padre es la reduccion de VRAM y el aumento de throughput sin coste de precision.

## Limitaciones y advertencias

- La cuantizacion NVFP4 es especifica de GPUs NVIDIA Blackwell (serie RTX 50). No es portable a arquitecturas anteriores ni a hardware de otros fabricantes.
- Los benchmarks de precision se basan en 20 items por tarea, lo que los hace estadisticamente debiles. Una diferencia de 4 items entre padre y variante esta dentro del ruido esperado con `temperature=1.0`.
- Entre 6 y 9 items por tarea alcanzaron el limite de truncacion de 24k tokens en ambos brazos, lo que puede sesgar los resultados hacia tareas que no requieren generacion muy larga.
- La escala de activacion del `lm_head` (amax 49,75) se midio sobre el padre servido con una distribucion de entrada concreta. Si el patron de uso cambia drasticamente (por ejemplo, contextos extremadamente largos o distribuciones de tokens atipicas), la escala podria no ser optima.
- No se documentan sesgos especificos del modelo base Qwen3.8-27B, pero al ser un modelo de lenguaje grande entrenado con datos web, es probable que herede sesgos sociales y culturales presentes en esos datos.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad para esta variante. El modo thinking puede producir razonamientos aparentemente solidos pero incorrectos.
- El modelo esta disenado para servirse con SGLang o vLLM con configuraciones especificas. Usar otros runtimes puede requerir ajustes no documentados.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales en su licencia original (aunque la model card indica que es Apache 2.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-LMHead4
- Modelo padre: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Drafter DSpark: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4
- Ficha del modelo padre en LLM Explorer: https://llm-explorer.com/model/gittensor-model-hub%2FQwen3.8-27B-NVFP4-RTX5090,3GTDSJKETUAS2CtkUTm8Er
- Ficha del modelo padre en AI Models FYI: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-nvfp4-rtx5090-gittensor-model-hub
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
