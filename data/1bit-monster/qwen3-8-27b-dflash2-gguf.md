# 1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es la conversión a formato GGUF del modelo borrador (draft model) DFlash 2 para el modelo objetivo Qwen/Qwen3.8-27B, publicada por el usuario 1bit-MONSTER. No se trata de un modelo de lenguaje autónomo: es un drafter de decodificación especulativa que propone bloques de tokens que el modelo Qwen3.8-27B verifica después. Por tanto, solo funciona dentro de un servidor de decodificación especulativa junto a un GGUF del modelo objetivo.

El repositorio contiene dos cuantizaciones del mismo borrador original (z-lab/Qwen3.8-27B-DFlash2, a su vez espejo de incoai/Qwen3.8-27B-DFlash2): una en Q8_0 de 2,06 GB y otra en Q4_K de 1,21 GB. Los pesos no se han reentrenado; únicamente se han convertido y cuantizado con el fork 1bit-MONSTER/llama.cpp. El drafter lleva metadatos propios: `dflash.block_size = 8` (siete tokens propuestos por paso de verificación) y `dflash.selector_top_k = 16`.

Su relevancia es práctica: permite acelerar la inferencia de Qwen3.8-27B en el motor 1bit (ruta GGUF de llama.cpp) mediante decodificación especulativa, especialmente en código y salidas estructuradas, donde los bloques largos del drafter aportan más que la cabeza MTP integrada en el modelo objetivo. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador de decodificación especulativa DFlash 2; no es un transformer completo autónomo) |
| Parámetros totales | 1.924.404.480 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (2,06 GB), Q4_K (1,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa DFlash 2 asociado al objetivo Qwen3.8-27B. Su función es proponer bloques de tokens (block_size = 8, es decir, siete tokens propuestos por paso de verificación) que el modelo objetivo valida; un token propuesto solo se conserva si el objetivo lo acepta, de modo que la salida final es la del modelo objetivo. Incorpora un selector con `selector_top_k = 16` como parte del mecanismo de propuesta. No se dispone de información sobre la arquitectura interna del borrador, el número de tokens de entrenamiento ni la composición del dataset.

Los pesos publicados son los originales del drafter, convertidos con `convert_hf_to_gguf.py` a BF16 y posteriormente cuantizados con `llama-quantize` a Q8_0 y Q4_K. No hubo reentrenamiento ni ajuste fino. La conversión se realizó con el fork 1bit-MONSTER/llama.cpp (rama `1bit/hrx-vulkan-patched`), cuyo soporte DFlash2 es el port upstream (ggml-org/llama.cpp#27816) más los cambios de runtime HRX del fork.

## Capacidades

- Propuesta de bloques de tokens para decodificación especulativa junto a Qwen3.8-27B (siete tokens por paso de verificación).
- Aceleración de la generación del modelo objetivo sin alterar la salida: los tokens propuestos se descartan si el objetivo no los acepta.
- Rendimiento especialmente favorable en código y salidas estructuradas, donde los bloques largos del drafter aportan más que la cabeza MTP integrada.
- Compatible con el motor 1bit (`1bit serve --dflash`) y con llama-server del fork (`--spec-type draft-dflash -md`).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües por sí mismo: esas capacidades pertenecen al modelo objetivo Qwen3.8-27B.
- No es un modelo conversacional autónomo; el tag `conversational` del repo no implica uso directo.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en producción: desplegar el drafter Q8_0 junto al GGUF UD-Q4_K_XL del objetivo con `1bit serve --dflash` para reducir la latencia de decodificación en el motor 1bit sobre HRX GPU.
- Generación de código asistida: al proponer bloques de siete tokens, el drafter rinde mejor en código y salidas estructuradas, por lo que es adecuado para autocompletado y generación de parches en pipelines de desarrollo.
- Salidas estructuradas y JSON: la naturaleza predecible de los bloques favorece la decodificación especulativa en respuestas con formato fijo, reduciendo pasos de verificación.
- Servicio de chat con requisitos de latencia ajustados: usar la cabeza MTP para turnos cortos y DFlash2 cuando el perfil de tráfico sea mayoritariamente código o plantillas.
- Evaluación comparativa de estrategias de decodificación especulativa: permite medir la tasa de aceptación y el throughput frente a `--mtp` en el mismo hardware.
- Despliegue en entornos con VRAM limitada: la variante Q4_K (1,21 GB) reduce el coste de memoria del drafter cuando el presupuesto de VRAM es escaso.
- Integración en llama-server mediante el fork 1bit-MONSTER/llama.cpp para stacks que ya usan llama.cpp y quieren añadir decodificación especulativa sin cambiar de motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada del drafter: aproximadamente 2,06 GB en Q8_0 y 1,21 GB en Q4_K, adicionales a la memoria del modelo objetivo Qwen3.8-27B.
- GPU: el README indica ejecución en HRX GPU mediante la ruta GGUF de llama.cpp del motor 1bit; no se especifican modelos de GPU concretos.
- GPU de consumo: no se dispone de datos sobre compatibilidad con tarjetas consumer concretas.
- Despliegue: motor 1bit (`1bit serve -m <objetivo>.gguf --device hrx --dflash Qwen3.8-27B-DFlash2-q8_0.gguf`) o llama-server del fork 1bit-MONSTER/llama.cpp con `--spec-type draft-dflash -md Qwen3.8-27B-DFlash2-q8_0.gguf`.
- Configuración: `--mtp` y `--dflash` son mutuamente excluyentes; el motor fija `--spec-draft-p-min 0` mediante su receta integrada, y elevar ese umbral descarta bloques y ralentiza la prosa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-GGUF (este) | Drafter DFlash2 en GGUF | 1.924.404.480 | Q8_0, Q4_K | Apache-2.0 | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter DFlash2 original (formato HF) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| incoai/Qwen3.8-27B-DFlash2 | Espejo del drafter original | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Cabeza MTP de Qwen3.8-27B | Decodificación especulativa integrada | no disponible | incluida en el modelo objetivo | Apache-2.0 | Hugging Face |

La comparación relevante es frente a la cabeza MTP del propio Qwen3.8-27B: DFlash2 propone bloques más largos y rinde mejor en código y salidas estructuradas, mientras que MTP sigue siendo la opción por defecto para turnos cortos de chat.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un GGUF de Qwen3.8-27B como objetivo y un servidor de decodificación especulativa; no puede usarse para generar texto por sí solo.
- Solo funciona con el fork 1bit-MONSTER/llama.cpp o el motor 1bit; no se garantiza compatibilidad con llama.cpp upstream sin el soporte DFlash2.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del drafter; estos riesgos recaen sobre el modelo objetivo.
- La longitud de contexto e idiomas soportados no están documentados en la información disponible.
- Ajustar `--spec-draft-p-min` por encima de 0 descarta bloques y reduce el rendimiento en prosa.
- `--mtp` y `--dflash` no pueden usarse simultáneamente.
- Licencia Apache-2.0, que permite uso comercial; conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-DFlash2-GGUF
- Drafter original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Espejo del drafter: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Bundle GGUF del objetivo: https://huggingface.co/1bit-MONSTER/Qwen3.8-27B-UD-Q4_K_XL-MTP
- Fork de llama.cpp: https://github.com/1bit-MONSTER/llama.cpp (rama `1bit/hrx-vulkan-patched`)
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Port upstream DFlash2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27816
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
