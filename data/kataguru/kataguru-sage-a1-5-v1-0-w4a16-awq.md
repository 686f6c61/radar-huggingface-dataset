# kataguru/Kataguru-Sage-A1.5-v1.0-W4A16-AWQ

## Resumen

Kataguru-Sage-A1.5-v1.0-W4A16-AWQ es un ajuste fino cuantizado del modelo multimodal InternScience/Sage-A1.5, desarrollado por el usuario kataguru. Se trata de un Mixture-of-Experts (MoE) de 35.951.822.704 parametros totales con arquitectura Qwen3.5-35B-A3B, disenado para razonamiento cientifico, programacion competitiva y uso como agente con tool calling. El modelo se distribuye cuantizado en INT4 W4A16 mediante compressed-tensors, con un tamano de repositorio de 26,2 GB, pensado para despliegue en servidores con vLLM.

El modelo parte de la base InternScience/Sage-A1.5 y aplica un proceso de ajuste fino QLoRA en cuatro ciclos con una tecnica de ortogonalizacion de activaciones (SOMA/ARA) orientada a eliminar comportamientos de rechazo y "sermoneo" del modelo base, ademas de reforzar el seguimiento estricto de instrucciones y el razonamiento matematico. Mantiene la ventana de contexto nativa de 262.144 tokens, el codificador visual de 27 capas y la cabeza de prediccion multi-token (MTP) en la capa 40, todo ello preservado en BF16.

Su relevancia actual radica en que ofrece un paquete de servidor INT4 listo para produccion con vLLM, con soporte bilingue ingles-finlandes, capacidades multimodales de imagen-texto y un conjunto de benchmarks declarados por el autor que muestran mejoras sobre el modelo base. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-35B-A3B), 40 capas, 256 expertos enrutados + 1 compartido por capa, top_k=8 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (arquitectura 35B-A3B, activacion de 8 expertos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 INT4 (compressed-tensors, group_size=32, calibracion MSE); atencion, expertos compartidos, routers, codificador visual y MTP en BF16 |
| Idiomas soportados | Ingles (en), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards, 124.611 tensores, pack-quantized) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 40 capas, 256 expertos enrutados por capa mas un experto compartido, y top_k=8, sobre el backbone Qwen3.5-35B-A3B. Incluye un codificador visual de 27 capas (333 tensores `model.visual.*` en BF16) que habilita el procesamiento de imagenes, y una cabeza de prediccion multi-token (MTP) en la capa 40 (785 tensores `mtp.*` en BF16) que permite decodificacion especulativa. La cuantizacion W4A16 afecta a 30.720 matrices de expertos empaquetadas en INT4, mientras que los componentes criticos se mantienen en BF16.

El entrenamiento parte de InternScience/Sage-A1.5 y aplica un curriculum QLoRA de cuatro ciclos con estratificacion 2D (r=16, qr_frozen_a), entrenando los 256 expertos y los routers. Antes del ajuste se aplica una ortogonalizacion de activaciones SOMA/ARA para eliminar direcciones de rechazo. El autor declara un template de chat de 6 modos y un ajuste orientado al cumplimiento estricto de restricciones estructurales, de formato y JSON/AST. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento cientifico (STEM, GPQA, medicina).
- Razonamiento matematico reforzado con cadena de pensamiento (modo thinking).
- Programacion algoritmica y competitiva (LiveCodeBench v6 con `--enable-thinking`).
- Vision multimodal nativa: procesamiento de imagen-texto (pipeline image-text-to-text).
- Tool calling y function calling con formato `<tool_call>` multi-idioma (BFCL V4).
- Seguimiento estricto de instrucciones: restricciones de longitud, formato, JSON/AST y negativas.
- Capacidades agenticas y de razonamiento multi-paso.
- Bilinguismo ingles-finlandes con produccion de prosa tecnica y comentarios de codigo en finlandes.
- Modo "uncensored" declarado por el autor (tasa de rechazo del 0,00 %).
- Decodificacion especulativa mediante MTP (capa 40).

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede analizar problemas de STEM y medicina (MedQA 85,55 %) apoyandose en su contexto de 262.144 tokens para incorporar literatura extensa en una sola consulta.
- Programacion competitiva y generacion de algoritmos: con `--enable-thinking` alcanza un 40,00 % Pass@1 en LiveCodeBench v6, adecuado para asistencia en resolucion de problemas algoritmicos complejos.
- Agentes con tool calling: su BFCL V4 Single-Turn AST del 83,38 % y deteccion de irrelevancia del 79,78 % lo hacen apto para orquestacion de funciones en pipelines automatizados.
- Analisis de imagenes tecnicas: al ser multimodal, puede procesar diagramas, capturas o documentacion grafica junto con texto en un mismo flujo.
- Atencion al cliente tecnica bilingue: cubre conversaciones multi-turno en ingles y finlandes con contexto largo, util para soporte en mercados nordicos.
- Generacion de documentacion tecnica en finlandes: el autor declara produccion de prosa tecnica gramaticalmente exacta, aplicable a manuales de ingenieria y comentarios de codigo.
- Cumplimiento estricto de formatos en produccion: su refuerzo en IFEval permite generar salidas JSON/AST validas para integracion en APIs y sistemas de automatizacion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 2x RTX 5090 32GB (TP=2), comparando con el modelo base InternScience/Sage-A1.5:

| Benchmark | Base Sage-A1.5 | Kataguru-Sage-A1.5-v1.0 | Delta |
|---|---|---|---|
| Media 15 benchmarks (LCB thinking) | 59,41 % | 65,55 % | +6,14 pp |
| Media 15 benchmarks (LCB sin thinking) | 59,41 % | 65,13 % | +5,71 pp |
| Media cognitiva 11 tareas | 62,63 % | 68,69 % | +6,06 pp |
| PIQA (acc_norm) | 81,56 % | 81,50 % | -0,05 pp |
| WinoGrande (acc) | 73,16 % | 74,90 % | +1,74 pp |
| MedQA (USMLE 4-opts) | 85,07 % | 85,55 % | +0,47 pp |
| TruthfulQA MC2 | 52,07 % | 52,44 % | no disponible (truncado) |
| GSM8K | no disponible | +47,23 pp (delta) | +47,23 pp |
| ARC-Easy | no disponible | +7,20 pp (delta) | +7,20 pp |
| LiveCodeBench v6 (thinking) | no disponible | 40,00 % Pass@1 | no disponible |
| BFCL V4 Single-Turn AST | no disponible | 83,38 % | no disponible |
| BFCL V4 Irrelevance Detection | no disponible | 79,78 % | no disponible |

Nota: la model card original esta truncada a partir del benchmark 4, por lo que faltan valores absolutos de varios benchmarks; solo se dispone de los deltas declarados.

## Requisitos de hardware

- VRAM estimada: ~14,8 GB por GPU con TP=2 (2x 24GB o 32GB), o ~28,0 GB con TP=1 (1x 32GB o 48GB).
- GPU recomendadas: Ampere, Ada Lovelace, Hopper y Blackwell; probado en 2x RTX 5090 32GB (sm_120).
- Cabe en GPU de consumo: si, en RTX 5090 32GB (TP=2) o configuraciones equivalentes de 24GB+ por GPU.
- Despliegue: vLLM v0.18+ con `--quantization compressed-tensors`, kernels Marlin W4A16, MTP y vision activados por defecto; CUDA 12.9 y FlashInfer XQA.
- Espacio en disco: 26,10 GB (6 shards safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Sage-A1.5-v1.0-W4A16-AWQ | 35,95B (MoE) | 262.144 | Apache 2.0 | Cuantizado INT4, multimodal, uncensored |
| InternScience/Sage-A1.5 (base) | 35B-A3B (MoE) | 262.144 | no disponible | Modelo de referencia, sin cuantizar |
| Kataguru Sceptic v2.8.1 | no disponible | no disponible | no disponible | Referencia interna del autor (media 15 benchmarks 69,24 %) |

No se dispone de datos de benchmarks de terceros ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de "uncensoring" (SOMA/ARA) puede eliminar salvaguardas y aumentar el riesgo de generar contenido inapropiado; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; los benchmarks de veracidad (TruthfulQA MC2 52,44 %) indican margen de mejora.
- Soporte limitado a ingles y finlandes; el rendimiento en castellano u otros idiomas no esta documentado.
- Los benchmarks son declarados por el autor y evaluados en un entorno concreto (2x RTX 5090, vLLM v0.18+); la reproducibilidad en otro hardware no esta garantizada.
- La model card esta truncada, lo que impide verificar los valores absolutos de varios benchmarks.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base InternScience/Sage-A1.5 para uso comercial.
- El modelo esta cuantizado en INT4; puede haber degradacion respecto al modelo base en tareas sensibles a la precision numerica.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Kataguru-Sage-A1.5-v1.0-W4A16-AWQ
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
