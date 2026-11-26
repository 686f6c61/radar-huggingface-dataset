# kataguru/Vipunen-35B-A4B-NVFP4

## Resumen

Vipunen-35B-A4B-NVFP4 es un ajuste fino del modelo MoE Qwen3.6-35B-A3B publicado por el usuario kataguru, orientado a dos dominios concretos: el finlandés y la automatización industrial (programación de PLC, CNC, OPC UA y seguridad funcional). El autor afirma haber reforzado ambos dominios sin degradar las capacidades del modelo base, mediante una metodología propia de sustitución modular de expertos (Track B Replace-Cartridge) combinada con una fase SOMA/ARA en BF16 puro sobre las capas 14 a 39.

La relevancia del modelo reside en su enfoque: en lugar de reentrenar el MoE completo, congela 244 de los 256 expertos enrutados por capa, todas las capas L00-L05, los 333 tensores del codificador de visión y los 19 tensores de especulación MTP, y solo sustituye 12 expertos por capa en L06-L39. Además, el autor introduce un enrutamiento de inferencia con `num_experts_per_tok = 10` (denominado A4B) frente a los 8 del modelo base, y publica una comparativa de 15 benchmarks con y sin ese cambio de enrutamiento.

La versión publicada es una cuantización NVFP4 de 4 bits (formato `compressed-tensors` de 8 bits por grupo) pensada para GPUs Blackwell `sm_120`, con un tamaño de repositorio de 25,6 GB. Existe una versión GGUF separada del mismo autor para GPUs de consumo de 12-24 GB. El modelo es multimodal (image-text-to-text) y está licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6), 40 capas, 256 expertos enrutados por capa, con codificador de visión y cabezas MTP de decodificación especulativa |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | No disponible de forma explícita; el autor usa `num_experts_per_tok = 10` sobre 256 expertos enrutados (base: 8) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (4 bits, `compressed-tensors`, 8 bits por grupo, 30.720 matrices empaquetadas); existe variante GGUF publicada aparte |
| Idiomas soportados | Finés (fi) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (NVFP4 empaquetado); GGUF en el repositorio hermano |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un MoE de 40 capas con 256 expertos enrutados por capa, contexto nativo de 262.144 tokens, codificador de visión (333 tensores) y 19 tensores de especulación MTP. El ajuste se realiza en tres fases según la model card: primero una fase SOMA/ARA en BF16 puro sobre las capas L14-L39, aplicada únicamente a atención y al experto compartido (`alpha=1.0`, con 0 de 6 rechazos registrados); después una sustitución de cartuchos (Track B) que reemplaza K = 12 de 256 expertos en las capas L06-L39, dejando L00-L05 congeladas; y finalmente el cambio de enrutamiento en inferencia a `num_experts_per_tok = 10`.

Los datos de entrenamiento no se detallan en la información disponible (no se especifica número de tokens ni composición del dataset). El autor reporta métricas de entrenamiento: `coding_qa` con escudo de 2,5× (`ρ = 0.1914`), solapamiento de enrutamiento de `coding_qa` del 1,65 %, 0,0 % de `<think>` fuera de política, tasa de aprendizaje de 9,0e-6, una época y `rel_dW = 0,79 %`. Las mejoras declaradas en pérdida de verosimilitud negativa son de -11,6 % en `finnish_unseen_64` y -9,6 % en `plc_cnc_unseen_64`.

## Capacidades

- Generación de texto y razonamiento en inglés y finés, con modo `<think>` nativo de Qwen3.6 conservado.
- Programación de automatización industrial: Siemens TIA Portal SCL, Beckhoff TwinCAT 3 ST, OPC UA, Sinumerik 840D / ISO G71, Heidenhain TNC 640 Klartext, ISO 13849-1 (seguridad funcional), ABB RAPID, KUKA KRL y URScript.
- Capacidades de visión: pipeline `image-text-to-text` con los 333 tensores del codificador intactos.
- Tool calling y function calling: evaluado en BFCL V4 (single-turn AST 83,00 %; parallel AST 81,25 %).
- Razonamiento multi-paso y modo agente, heredado del modelo base.
- Decodificación especulativa MTP (19 tensores preservados).
- Capacidades multilingües limitadas a finés e inglés según la model card.

## Casos de uso

- Programación de PLC en producción: generación y revisión de bloques SCL para TIA Portal o ST para TwinCAT 3, aprovechando el refuerzo específico del dominio y el contexto largo para incluir definiciones de variables y documentación de proyecto completas.
- Migración de código CNC entre controladores: traducción de programas ISO G71 a Heidenhain Klartext o Sinumerik 840D, usando el conocimiento de sintaxis específica reforzado en el ajuste.
- Documentación técnica bilingüe finés-inglés: redacción de manuales de máquina, procedimientos de seguridad y fichas técnicas con terminología industrial correcta en ambos idiomas.
- Asistencia en seguridad funcional: revisión de lógica de parada de emergencia y categorización según ISO 13849-1, con el modelo como primer filtro antes de la validación humana.
- Agentes de soporte técnico en planta: conversaciones multi-turno con contexto de hasta 262.144 tokens para adjuntar esquemas, logs y manuales, con tool calling para consultar sistemas OPC UA.
- Generación de código de robótica: síntesis de rutinas en ABB RAPID, KUKA KRL o URScript a partir de descripciones de celda robotizada.
- Análisis de imágenes de documentación técnica: al conservar el codificador de visión, puede procesar capturas de HMI, esquemas eléctricos o fotografías de pantallas de control.
- Atención al cliente en finés: conversaciones multi-turno con contexto largo para soporte de productos industriales en el mercado finlandés.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (hardware: 2× RTX 5090 32 GB, TP=2, vLLM 0.29.0, `max_model_len=16384`, NVFP4, CUDAGraphs activados; ejecución única N=1):

| Benchmark | Qwen3.6-35B-A3B base (k=8) | Vipunen mismos pesos (k=8) | Vipunen-35B-A4B (k=10) | Delta vs. base |
|---|---|---|---|---|
| LiveCodeBench v6 (Pass@1) | 34,86 % | 33,71 % | 39,43 % | +4,57 |
| GPQA Diamond | 70,20 % | 71,21 % | 72,73 % | +2,53 |
| BFCL V4 Single-Turn AST | 80,28 % | 81,33 % | 83,00 % | +2,73 |
| BFCL Live Parallel AST | 68,75 % | 68,75 % | 81,25 % | +12,50 |
| BFCL Python Simple AST | 93,50 % | 94,00 % | 94,25 % | +0,75 |
| IFEval Prompt / Inst Strict | 55,27 % / 64,15 % | 56,75 % / 65,47 % | 58,41 % / 66,67 % | +3,14 / +2,52 |
| ARC-Easy | 71,68 % | 71,42 % | 73,99 % | +2,31 |
| ARC-Challenge | 54,78 % | 55,29 % | 56,74 % | +1,96 |
| BoolQ | 87,77 % | 87,95 % | 89,30 % | +1,53 |
| PIQA | 82,48 % | 82,81 % | 83,03 % | +0,55 |
| WinoGrande | 73,56 % | 72,85 % | 74,03 % | +0,47 |
| TruthfulQA MC2 | 54,03 % | 53,90 % | 54,60 % | +0,57 |
| OpenBookQA | 44,40 % | 44,40 % | 44,80 % | +0,40 |
| MedQA (USMLE) | 86,49 % | 86,17 % | 85,86 % | -0,63 |
| TruthfulQA MC1 | 36,84 % | 36,60 % | 36,35 % | -0,49 |
| HellaSwag | 83,08 % | 82,58 % | 81,89 % | -1,19 |
| GSM8K (límite CoT 1.024 tokens) | 34,42 % | 20,70 % | 16,91 % | -17,51 |
| Media 14 tareas (ex-GSM8K) | 65,41 % | 65,50 % | 66,72 % | +1,31 |
| Media global 15 tareas | 63,34 % | 62,51 % | 63,40 % | +0,06 |

El autor advierte de dos caveats de medición: el harness limita el CoT de GSM8K a 1.024 tokens mientras el modo thinking de Qwen3.6 supera ese límite antes de emitir la respuesta, lo que invalida esa fila; y la tabla NVFP4 es una ejecución única (N=1) afectada por el no determinismo conocido del kernel MoE Marlin en vLLM (referencia `vllm#52525`).

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GiB para los pesos NVFP4; con contexto de 262.144 tokens la caché KV requiere VRAM adicional significativa.
- GPU recomendadas: Blackwell `sm_120`, es decir, 2× RTX 5090 32 GB con TP=2 o una única GPU Blackwell de 32-48 GB o más.
- No cabe en GPUs de consumo de 12-24 GB en formato NVFP4; para ese rango el autor remite a la variante GGUF (`kataguru/Vipunen-35B-A4B-GGUF`).
- Despliegue: vLLM 0.29.0-cu129 es el runtime probado y recomendado; la variante GGUF está pensada para LM Studio y Ollama.
- Rendimiento medido: 202-236 tok/s con `batch=1` en 2× RTX 5090 TP=2 con contexto nativo.
- El formato NVFP4 requiere soporte de cuantización de 4 bits en hardware Blackwell; no es portable a arquitecturas anteriores sin conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vipunen-35B-A4B-NVFP4 | 35,95 B (MoE, k=10) | 262.144 | Apache-2.0 | NVFP4 safetensors | Finés + automatización industrial; multimodal; requiere Blackwell |
| Qwen3.6-35B-A3B (base) | 35 B (MoE, k=8) | 262.144 | Apache-2.0 | BF16 safetensors | Referencia de la comparativa; sin especialización en finés ni PLC/CNC |
| Vipunen-35B-A4B-GGUF | 35,95 B (MoE, k=10) | 262.144 | Apache-2.0 | GGUF + mmproj | Misma especialización, apto para GPUs de 12-24 GB y Ollama/LM Studio |

No se dispone de datos de benchmarks de la variante GGUF ni de comparaciones con otros ajustes finos de Qwen3.6 en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados son de una sola ejecución (N=1) y el propio autor señala no determinismo del kernel MoE Marlin en vLLM, por lo que las diferencias de décimas de punto no son concluyentes.
- La fila de GSM8K está invalidada por el límite de 1.024 tokens del harness; no debe citarse como rendimiento real en matemáticas.
- El refuerzo de dominio se mide mediante NLL en conjuntos internos (`finnish_unseen_64`, `plc_cnc_unseen_64`) no publicados; no hay evidencia independiente de la mejora en PLC/CNC.
- Riesgo de alucinación en código de seguridad funcional (ISO 13849-1): cualquier salida debe validarse por ingeniería certificada antes de su uso en producción.
- Idiomas limitados a finés e inglés según la model card; el rendimiento en castellano no está evaluado.
- El formato NVFP4 depende de hardware Blackwell y de vLLM 0.29.0; no es desplegable en GPUs Ampere o Ada sin conversión.
- El cambio de enrutamiento a k=10 altera el comportamiento respecto al base y aumenta el coste computacional por token; la tabla muestra regresiones en HellaSwag, MedQA y TruthfulQA MC1.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6 debe cumplir también su propia licencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Vipunen-35B-A4B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante GGUF: https://huggingface.co/kataguru/Vipunen-35B-A4B-GGUF
- Repositorio de métodos (Track B / localidad funcional MoE): https://github.com/kataguru/functional-locality-moe (DOI: 10.5281/zenodo.24445840)
- Repositorio de determinismo MoE: https://github.com/kataguru/moe-longcot-nondeterminism (DOI: 10.5281/zenodo.24445305)
