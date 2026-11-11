# AXERA-TECH/Qwen3.6-35B-A3B-AX8860-llama.cpp

## Resumen

Qwen3.6-35B-A3B-AX8860-llama.cpp es una distribución de pesos y binarios preparada por AXERA-TECH para ejecutar el modelo Qwen3.6-35B-A3B sobre la NPU del SoC Axera AX8860 mediante un fork de llama.cpp con backend ggml-axera. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base de Qwen (35.505.528.224 parámetros totales, arquitectura MoE con 3B activos) a formato GGUF con cuantización NVFP4, acompañada de kernels de NPU, binarios estáticamente enlazados y scripts de ejecución y benchmark.

El problema que resuelve es la inferencia eficiente en hardware de borde: el repositorio demuestra decodificación de 76,4 tokens/s (hasta 86,8 tokens/s con decodificación especulativa MTP adaptativa) y prefill de 5.276 tokens/s para un prompt de 4k, con soporte de contexto hasta 262.144 tokens y entrada multimodal de texto e imagen. Es relevante porque traslada un modelo MoE de 35B a un acelerador NPU de bajo consumo con un servidor compatible con la API de OpenAI.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face. Los datos de entrenamiento, composición del dataset, licencia y benchmarks académicos no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) heredada de Qwen3.6-35B-A3B; decodificación especulativa MTP |
| Parametros totales | 35.505.528.224 |
| Parametros activos | 3B (según model card: "MoE (3B active)") |
| Longitud de contexto | Hasta 262.144 tokens (por defecto en servidor: 16.384; configurable vía `CTX`) |
| Tipos de cuantizacion | NVFP4 (pesos en bloques NVFP4 con tensores acompañantes `.scale` en F32); KV cache en FP8 (E4M3); codificador visual en BF16 |
| Idiomas soportados | No disponible (la model card incluye pruebas en chino e inglés) |
| Licencia | No disponible |
| Formato de pesos | GGUF (`qwen3.6-35b-a3b-nvfp4.gguf`, 20,5 GB; `mmproj-qwen3.6-35b-a3b-bf16.gguf`, 903 MB) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Hardware objetivo | NPU Axera AX8860 (4 núcleos), SDK V0.5.1 o superior |
| Tamaño del repositorio | 21,8 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de 35,5B parámetros totales y aproximadamente 3B activos por token, según la model card. El repositorio no entrena ni afina el modelo: redistribuye los pesos del modelo base de Qwen convertidos a NVFP4 y empaquetados en GGUF, junto con un codificador visual separado (`mmproj`) en BF16 que habilita la entrada de imágenes. La decodificación especulativa se implementa mediante MTP (multi-token prediction) con hasta 3 borradores por ronda (`--spec-type draft-mtp`, ajustable con `MTP_NMAX`), activada por defecto en modo adaptativo según el contenido de la petición.

La innovación técnica principal es la integración con la NPU AX8860 a través de un fork de llama.cpp con backend ggml-axera: los kernels de NPU se distribuyen en `kernels/` con un `manifest.json`, y los binarios en `bin/` están enlazados estáticamente. El GGUF usa bloques NVFP4 con tensores `.scale` en F32 que solo este fork carga correctamente; el llama.cpp upstream no lo soporta. La caché KV se almacena en FP8 (E4M3), el servidor mantiene 8 checkpoints de contexto rotativos (`-ctxcp 8`) y la caché de prompt reside en 4 GB de memoria del host. El runtime ocupa los 4 núcleos de NPU de forma exclusiva.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla `chat_template.jinja` derivada de la plantilla original de Qwen3.6.
- Entrada multimodal de imagen: el codificador visual BF16 permite describir imágenes (la model card verifica la descripción de una imagen de un autobús eléctrico EMT Madrid).
- Contexto largo: hasta 262.144 tokens, con pruebas de recuperación tipo needle superadas a ~30.917 y ~113.463 tokens de prompt.
- Decodificación especulativa MTP adaptativa por petición, con aceleraciones de hasta 1,13x en código (86,8 tokens/s frente a 76,9) y tasas de aceptación de hasta 0,752.
- Servidor compatible con la API de OpenAI (`run.sh -s 8080`), con endpoints compatibles según los tags del repositorio.
- Soporte de mensajes de sistema en mitad de la conversación, pensado para clientes de agentes como Codex (restricción relajada en la plantilla).
- Modo de razonamiento ("thinking") desactivado por defecto en el servidor (`--reasoning off`), configurable.
- Soporte multilingüe verificado en chino e inglés mediante pruebas de perplejidad y traducción; el resto de idiomas no está documentado.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de borde con NPU de bajo consumo: desplegar un MoE de 35B en un dispositivo AX8860 con 76,4 tokens/s de decodificación y 5.276 tokens/s de prefill, adecuado para entornos donde no hay GPU dedicada.
- Asistente conversacional local con API OpenAI: el servidor `run.sh -s 8080` expone endpoints compatibles, de modo que clientes existentes pueden apuntar a la NPU sin cambios de código.
- Procesamiento de documentos largos: con contexto de hasta 262.144 tokens y checkpoints de contexto rotativos, permite resumir o consultar documentos extensos manteniendo la sesión.
- Análisis de imágenes en el dispositivo: el codificador `mmproj` BF16 habilita descripción y consulta sobre imágenes, útil en inspección visual o accesibilidad sin enviar datos a la nube.
- Generación de código asistida: la model card reporta 86,8 tokens/s en contenido de código con MTP adaptativo y tasa de aceptación de 0,752, lo que lo hace viable para autocompletado interactivo local.
- Traducción chino-inglés: las pruebas de traducción muestran 75,9 tokens/s en modo adaptativo, adecuado para traducción por lotes en el dispositivo.
- Razonamiento matemático paso a paso: 84,1 tokens/s en tareas de matemáticas con MTP adaptativo, útil para tutores o verificación de cálculos.
- Agentes multi-turno con clientes tipo Codex: la plantilla relajada acepta mensajes de sistema en mitad de la conversación, lo que facilita flujos de agente con instrucciones dinámicas.

## Benchmarks y rendimiento

Rendimiento medido en placa AX8860 (tokens/s; hasta 256 tokens generados, decodificación voraz salvo indicación):

| Escenario | Sin MTP | MTP adaptativo | MTP forzado | Aceleración | Tasa de aceptación |
|---|---:|---:|---:|---:|---:|
| Código | 76,9 | 86,8 | 96,9 | 1,13x | 0,752 |
| Traducción (chino a inglés) | 76,0 | 75,9 | 80,2 | 1,00x | 0,598 |
| Tabla Markdown | 76,8 | 83,1 | 87,9 | 1,08x | 0,646 |
| Matemáticas | 76,8 | 84,1 | 86,2 | 1,09x | 0,699 |
| Ensayo en chino | 77,5 | 77,8 | 61,0 | 1,00x | 0,320 |
| Relato en inglés | 76,3 | 76,7 | 60,4 | 1,00x | 0,365 |
| Código con muestreo | 46,6 | 45,0 | 50,8 | 0,97x | 0,556 |
| Ensayo en chino con muestreo | 44,1 | 47,1 | 39,4 | 1,07x | 0,357 |

Métricas globales y de prefill:

| Métrica | Valor |
|---|---|
| Decodificación | 76,4 tokens/s |
| Decodificación con MTP adaptativo | Hasta 86,8 tokens/s (1,13x) |
| Prefill de prompt de 4k | 5.276 tokens/s (3.908 tokens en 0,74 s) |
| Prompt de 5 tokens, `-c 8192` | 0,16 s |
| Prompt de 47 tokens, `-c 8192` | 0,23 s |
| Prompt de 3.908 tokens, `-c 8192` | 0,74 s, 74,0 tokens/s |
| Prompt de 3.908 tokens, `-c 262144` | 0,74 s, 73,8 tokens/s |

Calidad (perplejidad, PPL):

| Prueba | Valor |
|---|---|
| Chino, `-ub 1`, `-c 512 --chunks 20` | 17,1751 ± 0,73694 |
| Chino, `-ub 4` | 17,1148 ± 0,73427 |
| Chino, Qwen3.5-35B-A3B en la misma placa | 18,6744 / 18,6075 |
| Chino, bf16 en CPU | 15,94 |
| Chino, mismos pesos NVFP4 en CPU | 16,78 |
| Chino, en placa | 17,18 |
| Inglés, `-c 4096 --chunks 8` | 1,3280 ± 0,01180 |
| Inglés, Qwen3.5-35B-A3B en la misma placa | 1,6333 |

Coste de cuantización: NVFP4 añade +5,3 % de perplejidad frente a bf16 en CPU; la ejecución en placa añade +2,4 % frente a los mismos pesos en CPU (Qwen3.5-35B-A3B: +2,6 % / +1,7 %). Recuperación needle a 32k y 120k: todas las respuestas correctas.

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- NPU Axera AX8860 obligatoria, con SDK V0.5.1 o superior; el runtime ocupa los 4 núcleos de NPU en exclusiva.
- El modelo no está pensado para GPU convencional: los pesos NVFP4 en GGUF solo los carga el fork ggml-axera incluido; llama.cpp upstream no los soporta.
- Tamaño en disco: 20,5 GB de pesos NVFP4 más 903 MB del codificador visual BF16 (repositorio de 21,8 GB).
- Memoria del host: 4 GB reservados por defecto para la caché de prompt, además del espacio para checkpoints de contexto.
- Despliegue: scripts `run.sh` (texto, imagen, chat, servidor) y `bench.sh`; servidor compatible con OpenAI con `-np 1`; `llama-bench` disponible con `-b 4096 -ub 4096`.
- Los archivos descargados de Hugging Face no tienen permisos de ejecución; deben invocarse con `sh`.
- Latencia y throughput: 76,4 tokens/s de decodificación y 5.276 tokens/s de prefill de 4k según las mediciones del autor.
- No cabe en GPU de consumo: requiere el acelerador AX8860.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Hardware | Rendimiento reportado |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-AX8860-llama.cpp | 35,5B | 3B | 262.144 | No disponible | NPU AX8860 | 76,4 tokens/s decodificación; PPL chino 17,18 |
| Qwen3.5-35B-A3B (referencia en la model card) | No disponible | No disponible | No disponible | No disponible | NPU AX8860 | PPL chino 18,67; PPL inglés 1,6333 |
| Qwen3.6-35B-A3B (modelo base) | 35,5B | 3B | No disponible | No disponible | GPU/NPU genérica | No disponible en esta información |

La model card solo ofrece comparación directa contra Qwen3.5-35B-A3B en la misma placa y archivo: Qwen3.6 obtiene mejor perplejidad en chino (17,18 frente a 18,67) e inglés (1,3280 frente a 1,6333). No se proporcionan datos de otros modelos comparables.

## Limitaciones y advertencias

- Dependencia de hardware y fork: los pesos NVFP4 solo cargan con el fork ggml-axera incluido; no son portables a llama.cpp upstream ni a otras GPUs.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en el modelo base Qwen/Qwen3.6-35B-A3B antes de producción.
- Idiomas no documentados: solo hay evidencia de chino e inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Estabilidad: la model card advierte de fallos intermitentes `ret = -3` en peticiones consecutivas, que requieren reintento.
- Modo de razonamiento desactivado por defecto en el servidor (`--reasoning off`); para tareas que lo requieran hay que activarlo explícitamente.
- La decodificación voraz requiere `presence_penalty: 0`; de lo contrario se desactiva el greedy fusionado y el MTP adaptativo no se activa.
- Coste de cuantización medido: +5,3 % de perplejidad en chino frente a bf16, y +2,4 % adicional en placa frente a los mismos pesos en CPU.
- Con muestreo, el MTP puede no aportar ganancias (0,97x en código) e incluso reducirlas; la aceleración depende del contenido.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base, no evaluados aquí.
- Contexto por defecto del servidor de 16.384 tokens; usar 262.144 requiere configurar `CTX` y consume más memoria para checkpoints.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.6-35B-A3B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor: https://huggingface.co/AXERA-TECH
- llama.cpp (proyecto upstream, no compatible con estos pesos NVFP4): https://github.com/ggml-org/llama.cpp
