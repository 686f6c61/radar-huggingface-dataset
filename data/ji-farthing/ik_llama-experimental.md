# ji-farthing/ik_llama-experimental

## Resumen

`ji-farthing/ik_llama-experimental` no es un modelo entrenado, sino un repositorio de validación con conversiones GGUF experimentales para distintas versiones de [ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp), el fork de llama.cpp mantenido por Ikawrakow. Los ficheros sirven para probar tipos de cuantización nuevos (`NVFP4_KS`, `F8_E4M3_KS`, `F8_E4M3_B128`) sobre checkpoints de terceros: principalmente la familia Qwen3 y Qwen3.8 de Alibaba, además de un modelo LFM2.5 de Liquid AI.

El propósito es puramente técnico: validar pull requests abiertos del proyecto ik_llama.cpp. El autor advierte explícitamente de que los ficheros son experimentales, pueden dejar de funcionar sin aviso y no constituyen un repositorio de modelos de propósito general. Buena parte de ellos solo cargan con una PR concreta ([#2918](https://github.com/ikawrakow/ik_llama.cpp/pull/2918)), no con la rama principal.

El repositorio ocupa 418,5 GB y agrupa pesos de modelos base de entre 8B y 30B parámetros totales (27,3B en el checkpoint safetensors asociado). La licencia global es Apache-2.0, aunque cada fichero hereda la licencia del checkpoint de origen, y el fichero derivado de LFM2.5 queda bajo LFM Open License v1.0. Su interés actual es servir de referencia para quienes trabajan con cuantizaciones FP8 (E4M3) y NVFP4 en hardware Blackwell (RTX 50, GB10).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Depende del checkpoint de origen: transformer denso (Qwen3-8B, Qwen3.8-27B) y MoE (Qwen3-30B-A3B, LFM2.5-8B-A1B) |
| Parámetros totales | 27.320.698.049 (dato safetensors del repo); el resto de ficheros varían entre ~8B y ~30B según el modelo base |
| Parámetros activos | No disponible de forma agregada; en los modelos MoE de origen (Qwen3-30B-A3B, LFM2.5-8B-A1B) el patrón del nombre indica ~3B y ~1B activos respectivamente |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `NVFP4_KS`, `F8_E4M3_KS`, `F8_E4M3_B128`, `Q8_0`, BF16, F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (global); LFM Open License v1.0 para el fichero LFM2.5 |
| Formato de pesos | GGUF (compatible solo con ik_llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: solo convierte y reempaqueta checkpoints ya existentes en los formatos de cuantización propios de ik_llama.cpp. El proceso documentado para `Qwen3.8-27B-NVFP4_KS.gguf` es representativo: primero se ejecuta `convert_hf_to_gguf.py` (conversión de llama.cpp en el commit `f7591a6`) con `--fp8-as-q8`, porque ik_llama.cpp no tenía tipo FP8 nativo, de modo que las capas FP8 del checkpoint ModelOpt `MIXED_PRECISION` quedan almacenadas como `Q8_0` (tensores `attn_qkv`, `attn_gate` y `ssm_out` en 46 capas, y `attn_q`, `attn_k`, `attn_v` y `attn_output` en 15 capas). Después se aplica `llama-quantize ... COPY` con ik_llama.cpp en el commit `f415f91`, que reescribe cada peso NVFP4 como `NVFP4_KS` sin recuantizar y conserva su `.input_scale`.

El fichero resultante contiene 193 tensores `NVFP4_KS`, 208 `Q8_0`, 105 BF16, 553 F32 y 193 input scales; las capas MTP no se convierten. La innovación técnica reside en el propio formato: `NVFP4_KS` mantiene la escala de activación por peso del checkpoint original, lo que permite a ik_llama.cpp usar activaciones de 4 bits (`--nvfp4-precision auto`, por defecto en RTX 50 y GB10) u 8 bits (`--nvfp4-precision int8`). Para los ficheros FP8 se emplean dos layouts alternativos, `F8_E4M3_KS` y `F8_E4M3_B128`, más un head MTP en `F8_E4M3_B128` en el caso de `Qwen3.8-Flash-Next-NVFP4_KS-F8.gguf`. No hay información sobre datos de entrenamiento, RLHF o DPO, porque no se entrena nada aquí.

## Capacidades

- Las capacidades funcionales son las de los modelos base (Qwen3, Qwen3.8, LFM2.5), no las de este repositorio: generación de texto, razonamiento, código y matemáticas según el checkpoint original.
- Los ficheros están pensados como material de validación de PRs de ik_llama.cpp, no como artefactos de despliegue.
- Compatibilidad con endpoints declarada en los tags (`endpoints_compatible`), pero supeditada a que el runtime ik_llama.cpp cargue el formato.
- Soporte de tool calling, agentes, modo thinking o visión: no disponible en la información proporcionada para estos ficheros concretos.
- Multilingüismo: no disponible.
- Capacidad especial: preservación de las input scales NVFP4 del checkpoint original y decodificación con precisión de activación seleccionable en tiempo de ejecución.

## Casos de uso

- Validación de PRs de ik_llama.cpp: cargar `fp8/Qwen-Qwen3-30B-A3B-FP8-B128.gguf` o `fp8/nvidia-Qwen3-8B-FP8-KS.gguf` con la PR #2918 aplicada para comprobar que los tipos `F8_E4M3_KS` y `F8_E4M3_B128` se deserializan y ejecutan correctamente antes de fusionar cambios.
- Pruebas de regresión de cuantización: comparar la perplejidad en wikitext-2 (`wiki.test.raw`, `-c 512 --chunks 8`) entre el fichero convertido y el original en ik_llama.cpp, como hace el autor con `--kl-divergence-base` para verificar que el fichero de log-probabilidades codificadas es idéntico.
- Evaluación de NVFP4 en hardware Blackwell: desplegar `Qwen3.8-27B-NVFP4_KS.gguf` en una RTX 50 o GB10 con `--nvfp4-precision auto` frente a `int8` y medir el impacto en perplejidad y velocidad de las activaciones de 4 bits.
- Desarrollo de kernels de cuantización: usar los ficheros como fixtures para probar nuevas rutas de cómputo (mmap, input scales, layouts KS frente a B128) sin tener que reconvertir checkpoints de 27B cada vez.
- Reproducción de conversiones: seguir la receta documentada (`convert_hf_to_gguf.py` con `--fp8-as-q8` y `llama-quantize ... COPY`) sobre otros checkpoints ModelOpt `MIXED_PRECISION` para generar variantes propias con los mismos tipos.
- Verificación de integridad de descargas: los ficheros FP8 publican hash sha256, lo que permite validar la descarga en pipelines automatizados de CI antes de ejecutar las pruebas de carga.

## Benchmarks y rendimiento

El único dato publicado es la perplejidad en wikitext-2 del fichero `Qwen3.8-27B-NVFP4_KS.gguf`, medida en GB10 con `-c 512 --chunks 8`:

| Configuración `--nvfp4-precision` | Perplejidad (wikitext-2) |
|---|---|
| `auto` (activaciones 4 bits) | 6,7052 ± 0,36538 |
| `int8` (activaciones 8 bits) | 6,6061 ± 0,35988 |

El autor indica que, con ambas configuraciones, el fichero de log-probabilidades codificadas generado con `--kl-divergence-base` es idéntico al del fichero mainline en ik_llama.cpp, lo que sugiere que la conversión a `NVFP4_KS` no altera la distribución de salida de forma medible en esa prueba. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, un checkpoint de ~27B en NVFP4 con capas Q8_0 y BF16/F32 auxiliares ocupa del orden de decenas de GB; los ficheros de 8B en FP8 quedan en un rango mucho menor. El repo completo son 418,5 GB, pero cada fichero se descarga por separado.
- GPU recomendadas: RTX 50 y GB10 son las plataformas mencionadas para `--nvfp4-precision`; el resto de ficheros FP8 no tienen hardware objetivo documentado.
- GPU de consumo: no confirmado en la información disponible; los modelos base de 8B en FP8 son candidatos razonables, pero el repositorio no publica requisitos.
- Despliegue: exclusivamente ik_llama.cpp (carga por mmap). Los ficheros `NVFP4_KS` no cargan en llama.cpp, que carece de ese tipo; varios ficheros FP8 requieren la PR #2918 y se convirtieron con la PR #2919.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / artefacto | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ji-farthing/ik_llama-experimental` | ~8B–30B según fichero (27,3B en safetensors) | No disponible | GGUF con tipos propios de ik_llama.cpp | Apache-2.0 / LFM Open v1.0 | Hugging Face, solo ik_llama.cpp |
| `Qwen/Qwen3-30B-A3B-FP8` | 30B totales, ~3B activos (MoE) | No disponible | Safetensors FP8 | Apache-2.0 | Hugging Face, ecosistema estándar |
| `nvidia/Qwen3.8-27B-NVFP4` | 27B | No disponible | Safetensors NVFP4 (ModelOpt) | No disponible | Hugging Face, requiere runtime compatible con NVFP4 |
| `RedHatAI/Qwen3-30B-A3B-FP8-dynamic` | 30B totales, ~3B activos (MoE) | No disponible | Safetensors FP8 dinámico | No disponible | Hugging Face, vLLM y similares |

La diferencia clave frente a los originales no es de calidad, sino de portabilidad: este repositorio ofrece los mismos pesos en layouts que solo ik_llama.cpp entiende, a cambio de preservar las input scales NVFP4 y permitir activaciones de 4 u 8 bits.

## Limitaciones y advertencias

- Ficheros explícitamente experimentales: pueden cambiar o dejar de funcionar sin aviso según la rama main de ik_llama.cpp.
- Varios ficheros solo cargan con una PR abierta (#2918); no son utilizables con la versión estable del runtime.
- No es un repositorio de modelos de propósito general: no debe usarse como dependencia de producción.
- `NVFP4_KS` no existe en llama.cpp; cualquier despliegue fuera de ik_llama.cpp requiere reconversión.
- Las capas MTP no se convierten en `Qwen3.8-27B-NVFP4_KS.gguf`, lo que limita funciones que dependan de ellas.
- Licencias heterogéneas: Apache-2.0 para los derivados de Qwen, pero LFM Open License v1.0 para el fichero LFM2.5, con posibles restricciones de uso comercial que deben revisarse en `fp8/LICENSE-LFM`.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas: no documentados para estos ficheros; heredados de los modelos base, sobre los que este repositorio no aporta información.
- El tamaño del repo (418,5 GB) obliga a descargar ficheros individuales; conviene verificar los sha256 publicados para los FP8.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ji-farthing/ik_llama-experimental
- ik_llama.cpp (repositorio principal): https://github.com/ikawrakow/ik_llama.cpp
- PR #2918 de ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp/pull/2918
- PR #2919 de ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp/pull/2919
- Commit de conversión `f415f91` (fork del autor): https://github.com/joelfarthing/ik_llama.cpp/commit/f415f9163307507fecb7f4a040fee85132d11114
- Checkpoint base `nvidia/Qwen3.8-27B-NVFP4` (revisión `482ca0f`): https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4/tree/482ca0f3832238542f8f5295dde86b5f22711d80
- Checkpoint base `nvidia/Qwen3.8-Flash-Next-NVFP4`: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Checkpoint base `nvidia/Qwen3-8B-FP8`: https://huggingface.co/nvidia/Qwen3-8B-FP8
- Checkpoint base `Qwen/Qwen3-8B-FP8`: https://huggingface.co/Qwen/Qwen3-8B-FP8
- Checkpoint base `RedHatAI/Qwen3-30B-A3B-FP8-dynamic`: https://huggingface.co/RedHatAI/Qwen3-30B-A3B-FP8-dynamic
- Checkpoint base `Qwen/Qwen3-30B-A3B-FP8`: https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8
- Checkpoint base `liodon-ai/LFM2.5-8B-A1B-FP8`: https://huggingface.co/liodon-ai/LFM2.5-8B-A1B-FP8
