# doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-5.05bpw es una cuantización EXL3 (ExLlamaV3) del modelo Qwen3.8-Flash-Next desarrollado por el equipo Qwen. El pack concreto corresponde a la rama `5.05bpw_h6_ng6` producida por turboderp con la herramienta exllamav3, y ha sido redistribuido de forma byte-idéntica por el usuario doth4580 como referencia estable para sus pruebas con el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 42.002.912.768 parámetros totales según los safetensors del repositorio. La cuantización a 5,05 bits por peso reduce el peso en disco a 123,2 GB, lo que permite servirlo en configuraciones multi-nodo (TP=2 o TP=4) sobre GB10, aunque no cabe en una sola máquina de 128 GB junto con la memoria de trabajo.

Su relevancia actual radica en que demuestra un flujo de despliegue de un MoE de gran tamaño en clústeres pequeños de hardware consumer/edge (DGX Spark), con decodificación especulativa mediante cabezas MTP y soporte de contexto largo (hasta 262.144 tokens configurados en las pruebas). Es un artefacto pensado para evaluación práctica de latencia y throughput más que para uso genérico en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) — inferido de los tags `moe` y del modelo base |
| Parametros totales | 42.002.912.768 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en las pruebas de veloGB10); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 5,05 bpw (rama `5.05bpw_h6_ng6`); pesos en formato EXL3/ExLlamaV3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura Mixture of Experts según los tags del repositorio (`moe`, `qwen4_exp`). No se dispone en la información proporcionada de detalles sobre el número de expertos, la proporción de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO). El contexto de 262.144 tokens aparece únicamente como valor configurado en los comandos de despliegue de veloGB10, no como especificación oficial del modelo base.

La innovación técnica destacable de este pack es la cuantización EXL3 a 5,05 bits por peso con parámetros `h6_ng6`, que reduce el modelo a 123,2 GB manteniendo precisión suficiente para servir el MoE en clústeres de 2 o 4 GB10. Además, el pack incluye una cabeza MTP (Multi-Token Prediction) propia que se usa por defecto para decodificación especulativa, con tasas de aceptación medidas en torno al 71 % y la posibilidad de sustituirla por cabezas alternativas (HermiHg o DotH-MTP) sin alterar la salida, solo la velocidad.

## Capacidades

- Generación de texto y razonamiento: el modelo se sirve con `thinking on` en las pruebas de veloGB10, lo que indica soporte de modo de razonamiento extendido.
- Generación de código: se han medido turnos de código específicamente (Code turn decode), lo que confirma capacidad para tareas de programación.
- Generación creativa: se han medido turnos de historia (Story turn decode).
- Decodificación especulativa mediante cabezas MTP, con aceptación ~70-72 %.
- Soporte de contexto largo: hasta 262.144 tokens configurados en el servidor.
- Servidor compatible con la API de OpenAI (`/v1`), lo que habilita tool calling y function calling a nivel de integración, aunque no se detalla soporte nativo en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Despliegue en clústeres pequeños de DGX Spark / GB10: el pack está optimizado para TP=2 o TP=4 con veloGB10, permitiendo servir un MoE de 42B en 2-4 máquinas de 128 GB sin copiar el modelo a los nodos (el head distribuye los pesos por red y los cachea localmente).
- Evaluación de latencia y throughput en hardware edge: las mediciones de VeloBench (83-109 tok/s de mediana en decodificación, 3.020-3.648 tok/s de prefill) sirven para comparar topologías y cabezas MTP antes de comprometer infraestructura.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurados, es adecuado para resumir o analizar contratos, informes o bases de código extensas en una sola pasada.
- Asistentes de código en pipelines internos: la medición específica de turnos de código y el soporte de API OpenAI permiten integrarlo en herramientas de autocompletado o revisión.
- Generación de contenido creativo multi-turno: los turnos de historia medidos (68-92 tok/s) indican viabilidad para escritura asistida interactiva.
- Investigación sobre cuantización EXL3: al ser una redistribución byte-idéntica del pack de turboderp, sirve como referencia reproducible para estudiar el impacto de 5,05 bpw en un MoE de 42B.
- Pruebas de decodificación especulativa: permite comparar cabezas MTP (pack, HermiHg, DotH) manteniendo pesos idénticos y midiendo solo el efecto en velocidad.

## Benchmarks y rendimiento

Datos de VeloBench medidos con veloGB10 0.7.7 (2026-11-06) sobre GB10, sampling de producción, thinking on, una petición a la vez salvo la columna agregada. Decode en tokens de salida por segundo, incluyendo decodificación especulativa. Variación aproximada ±10 %.

| Topologia | Fuente de draft | Code turn decode | Story turn decode | Mediana todas las turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | MTP del pack | 130 | 68 | 83 | 3.020 | 125 | 71,3 % |
| TP=4 | MTP del pack | 156 | 89 | 109 | 3.648 | 145 | 71,4 % |
| TP=2 | HermiHg MTP | 133 | 69 | 82 | 3.018 | 121 | 69,8 % |
| TP=4 | HermiHg MTP | 169 | 90 | 110 | 3.693 | 150 | 71,9 % |
| TP=2 | DotH-MTP | 134 | 68 | 80 | 3.033 | 122 | 69,5 % |
| TP=4 | DotH-MTP | 172 | 92 | 107 | 3.671 | 151 | 71,4 % |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/espacio estimado: 123,2 GB de pesos en disco; el autor indica explícitamente que el pack no cabe en un solo GB10 (128 GB) junto con su memoria de trabajo.
- GPU recomendadas: NVIDIA DGX Spark / GB10 en configuraciones de 2 o 4 nodos (TP=2 o TP=4). No se documenta soporte en A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no en una sola; requiere al menos 2 GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`, servidor compatible con OpenAI en `:9000/v1`), con soporte de `--tp 2`/`--tp 4`, `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto` y `--rdma-dev` para seleccionar rail RoCE. Al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 podría cargarlo, aunque solo veloGB10 está probado.
- Latencia y throughput: ver tabla de benchmarks (83-110 tok/s de mediana en decode, 3.018-3.693 tok/s de prefill según topología y cabeza MTP).

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (MoE de ~42B cuantizado a ~5 bpw) con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No cabe en un solo GB10: requiere clúster de 2 o 4 máquinas, lo que limita su uso a entornos con esa infraestructura.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial; el repositorio etiqueta la licencia como `other`.
- Es una cuantización a 5,05 bpw, no los pesos originales: puede haber degradación de calidad respecto al modelo base, no cuantificada en la información disponible.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin verificación.
- Parámetros activos del MoE no disponibles: no se puede estimar el coste computacional por token con precisión.
- Sin benchmarks académicos publicados: las únicas métricas son de latencia/throughput, no de calidad.
- Riesgo de alucinación y sesgos: no documentados específicamente para este pack; aplican los del modelo base, no detallados aquí.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El autor no reclama propiedad intelectual; los derechos quedan en los autores originales y contribuyentes (Qwen, turboderp, HermiHg).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Herramienta exllamav3: https://github.com/turboderp-org/exllamav3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
