# aptp/Qwen3.8-3.6-27B-blend-ninfer-R9700-LQ4

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión de pesos a un formato propietario de inferencia: `JetBrains/Qwen3.8-3.6-27B-blend` (una fusión lineal 50/50 de Qwen3.6-27B y Qwen3.8-27B) reempaquetado en el formato **LQ4** del motor `ninfer-amd-r9700`, desarrollado por jmander11. El autor, `aptp`, publica el artefacto optimizado para ejecutarse en una única GPU **AMD Radeon AI PRO R9700** (gfx1201, 32 GB de VRAM) con ROCm.

El objetivo declarado es maximizar el throughput de decodificación en cargas de trabajo agénticas reales de contexto largo: múltiples agentes de programación e ingeniería inversa concurrentes, cada uno con 50.000-80.000 tokens de contexto lleno de salida de herramientas. Según la model card, el motor ninfer con este artefacto alcanza 160 tok/s totales con 8 agentes a 81.920 tokens por agente, frente a los 46 tok/s de llama.cpp sin especulación, y hasta 266 tok/s con 16 agentes en la build experimental.

Es relevante por tres motivos: demuestra que el ecosistema AMD ROCm puede servir modelos de 27B en cuantización de 4 bits con concurrencia alta, documenta cifras de prefill (2.847 tok/s a 8k, 2.119 tok/s a 64k) y establece un formato de pesos que **no es portable**: solo carga en ninfer-amd-r9700 sobre gfx1201, no en llama.cpp, vLLM ni transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.6-27B / Qwen3.8-27B, fusión lineal 50/50); no se detalla en la model card |
| Parametros totales | 27B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | Hasta 262.144 tokens por petición individual; pool KV compartido de hasta 655.360 tokens repartido entre agentes concurrentes |
| Tipos de cuantizacion | LQ4 (formato propietario del motor ninfer); el modelo base se distribuye en Q4_K_M para llama.cpp como referencia comparativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (16.752.796.160 bytes, SHA-256 `1250da399b0cd0fba82fe6848f358dc801b8a99dc3ee522b2474467dd1c8014e`), más un `.conversion.json` con la receta y hashes por objeto |

## Arquitectura y entrenamiento

El modelo subyacente es una **fusión lineal al 50/50** de Qwen3.6-27B y Qwen3.8-27B, publicada por JetBrains bajo el identificador `Qwen3.8-3.6-27B-blend`. La model card de este repositorio no documenta la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención, uso de RoPE o GQA), ni los datos de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se especifica el número de tokens de entrenamiento ni la composición del dataset. Toda esa información correspondería a la model card del modelo base, que no se incluye en la información proporcionada.

La innovación técnica de este artefacto no está en el modelo sino en el motor de inferencia. `ninfer-amd-r9700` implementa un pool KV compartido entre lanes del servidor, lo que permite sostener 8 agentes con 81.920 tokens cada uno dejando 0,5 GiB de VRAM libre, frente a los 4 agentes que caben en llama.cpp con caché KV q8_0 (6 con q4_0, con un 14 % menos de velocidad de decodificación). El motor también procesa cada prompt de forma aislada usando toda la GPU, de modo que el prefill mantiene velocidad plena independientemente del número de agentes, a costa de pausar la generación del resto. La model card menciona modos de especulación (`--spec none`, MTP con 3 borradores, DFlash2) pero recomienda desactivarlos para este artefacto porque consumen VRAM adicional (segundo pool KV y drafter) y reducen el contexto máximo por agente.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen de 27B.
- Codificación y trabajo agéntico de ingeniería inversa: la model card cita explícitamente agentes de programación y reverse-engineering como carga de trabajo de referencia.
- Contexto largo sostenido: hasta 262.144 tokens en una sola petición y 81.920 tokens por agente con 8 agentes concurrentes.
- Concurrencia multi-agente: hasta 8 lanes en la build estándar y hasta 16 en la build experimental, con pool KV compartido.
- Tool calling / function calling: no se documenta explícitamente en la model card, aunque el escenario de uso (agentes con salida de herramientas en el contexto) lo presupone.
- Capacidades multimodales, de audio o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo `language` no está poblado en los metadatos.

## Casos de uso

- **Enjambre de agentes de programación sobre una sola GPU**: 8 agentes concurrentes con 81.920 tokens cada uno a 20 tok/s por agente (160 tok/s agregados). Adecuado porque el pool KV compartido y el prefill aislado evitan que un agente con prompt largo bloquee a los demás durante la decodificación.
- **Ingeniería inversa asistida por LLM**: el escenario medido por el autor. Cada agente acumula desensamblados, trazas y salida de herramientas en contexto; el modelo sostiene 50-80k tokens por agente sin degradar el throughput agregado por debajo de 16 tok/s.
- **Servidor de código en CI/CD con ventanas largas**: con 262.144 tokens por petición en modo de un solo agente, cabe un repositorio mediano completo más historial de diffs y logs de build en una única pasada.
- **Procesamiento por lotes de documentos largos**: el prefill de 2.119 tok/s a 64k tokens permite ingerir documentos extensos con latencia de primera ficha razonable, aunque el procesamiento es estrictamente secuencial entre agentes.
- **Despliegue on-premise con hardware AMD**: para organizaciones con Radeon AI PRO R9700 y ROCm que quieran evitar dependencia de CUDA, con la advertencia de que el formato LQ4 ata el artefacto a este motor concreto.
- **Evaluación comparativa de motores de inferencia**: útil como referencia reproducible de throughput en AMD para contrastar con llama.cpp, ya que la model card publica tablas pareadas sin especulación y con MTP.

## Benchmarks y rendimiento

Decodificación en una R9700 con límite de 210 W, medida en ventanas de 5 s con todos los agentes generando y ninguno procesando prompt:

| Servidor | Agentes | Contexto/agente | Total generación | Por agente |
|---|---:|---:|---:|---:|
| llama.cpp, Q4_K_M, MTP 3 drafts | 4 | 81.920 | 90 tok/s (73-102) | 22,5 tok/s |
| llama.cpp, Q4_K_M, MTP 3 drafts, KV q4_0 | 6 | 81.920 | 109 tok/s (98-119) | 18,2 tok/s |
| llama.cpp, Q4_K_M, sin especulación | 4 | 81.920 | 46 tok/s (40-50) | 11,6 tok/s |
| ninfer, este artefacto, `--spec none` | 6 | 81.920 | 132 tok/s (124-143) | 22,0 tok/s |
| ninfer, este artefacto, `--spec none` | 8 | 81.920 | 160 tok/s (150-171) | 20,0 tok/s |
| ninfer, este artefacto, `--spec none` | 12 | 53.248 | 233 tok/s (218-247) | 19,4 tok/s |
| ninfer, este artefacto, `--spec none` | 16 | 37.440 | 266 tok/s (252-291) | 16,6 tok/s |
| llama.cpp, Q4_K_M, MTP 3 drafts | 8 | 32.768 | 122 tok/s (110-135) | 15,2 tok/s |
| ninfer, este artefacto, `--spec none` | 8 | 32.768 | 187 tok/s (178-196) | 23,4 tok/s |

Prefill de prompt en frío, una petición:

| Longitud | ninfer | llama.cpp |
|---:|---:|---:|
| 8k tokens | 2.847 tok/s | ~880 tok/s |
| 64k tokens | 2.119 tok/s | ~710 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son exclusivamente de rendimiento de inferencia.

## Requisitos de hardware

- **GPU**: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) exclusivamente. Es el único objetivo de `ninfer-amd-r9700`; el NInfer upstream para NVIDIA RTX 5090 usa otros formatos de pesos y no carga LQ4.
- **VRAM**: el artefacto ocupa unos 16,75 GB de pesos; el resto hasta 32 GB se destina al pool KV. Con `--max-concurrency 8` y `--spec none` quedan aproximadamente 0,5 GiB libres.
- **Software**: ROCm 10.1 (probado con HIP 7.16.26385, driver amdgpu 31.60, Ubuntu, kernel 7.0). ninfer compilado desde fuente, probado en el commit `d61bf746f74192f8c1d0186295318fbcc848054b`.
- **Disco**: unos 17 GB para el artefacto.
- **Compatibilidad**: no carga en llama.cpp, vLLM, transformers, Ollama ni TGI. No es GGUF ni safetensors.
- **Throughput**: 160 tok/s agregados con 8 agentes a 81.920 tokens; 266 tok/s con 16 agentes a 37.440 tokens; prefill de 2.847 tok/s a 8k y 2.119 tok/s a 64k.
- **No cabe en GPU de consumo**: requiere 32 GB de VRAM y el hardware gfx1201 específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia |
|---|---|---:|---|---|---|
| Este artefacto (Qwen3.8-3.6-27B-blend LQ4) | 27B | 262.144 por petición; pool de 655.360 | `.ninfer` (LQ4) | AMD R9700 gfx1201, ROCm 10.1 | Apache 2.0 |
| Qwen3.8-3.6-27B-blend Q4_K_M | 27B | Limitado por VRAM del motor | GGUF | llama.cpp, amplio soporte | Apache 2.0 |
| JetBrains/Qwen3.8-3.6-27B-blend (original) | 27B | no disponible | safetensors | transformers, vLLM, TGI | Apache 2.0 |
| NInfer upstream (RTX 5090) | no disponible | no disponible | formato propio NInfer | NVIDIA RTX 5090 | no disponible |

La comparación relevante es de motores, no de modelos: sobre el mismo blend y la misma GPU, ninfer sin especulación supera a llama.cpp sin especulación en un factor de 2,2x a 3,5x en decodificación (más con más agentes y contextos más largos), y en aproximadamente 1,5x frente a llama.cpp en su mejor configuración con MTP. En prefill la ventaja es de 3,2x a 3,0x.

## Limitaciones y advertencias

- **Portabilidad nula**: el formato LQ4 solo carga en `ninfer-amd-r9700` sobre gfx1201. No sirve para NVIDIA, otras GPU AMD ni motores estándar. Migrar implica reconvertir desde el modelo base.
- **Hardware único**: requiere una Radeon AI PRO R9700 de 32 GB y ROCm 10.1 con un commit concreto de ninfer compilado desde fuente. No hay binarios precompilados documentados.
- **Sin benchmarks de calidad**: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de alucinación o sesgo para este artefacto ni, en la información disponible, para el blend base.
- **Especulación desactivada por defecto**: activar MTP o DFlash2 reduce el contexto máximo por agente porque consume VRAM adicional (segundo pool KV y drafter); con especulación, las configuraciones de 8 agentes a 81.920 tokens no caben.
- **Prefill bloqueante**: el procesamiento de prompt de un agente usa toda la GPU y pausa la generación del resto, lo que introduce picos de latencia en cargas concurrentes.
- **Idiomas no declarados**: el campo de idiomas está vacío en los metadatos; no se puede asumir cobertura multilingüe sin verificación empírica.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo base ni sobre la fidelidad de la fusión 50/50 respecto a los originales.
- **Adopción mínima**: 7 descargas y 0 likes en el momento de la consulta; sin validación independiente de las cifras publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aptp/Qwen3.8-3.6-27B-blend-ninfer-R9700-LQ4
- Modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Motor ninfer-amd-r9700: https://github.com/jmander11/ninfer-amd-r9700
