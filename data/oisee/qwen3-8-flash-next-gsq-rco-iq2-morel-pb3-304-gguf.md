# oisee/Qwen3.8-Flash-Next-GSQ-RCO-IQ2-MoREL-PB3-304-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-IQ2-MoREL-PB3-304 es una cuantización experimental en formato GGUF publicada por el usuario oisee en HuggingFace. Se trata de un derivado comunitario del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, que a su vez cuantiza un modelo base de la familia Qwen3.8. Su rasgo distintivo es la técnica MoREL (Mixture of Ragged Experts per Layer): una poda física de expertos en un MoE de 512 expertos por capa, que conserva una media de 304 expertos por capa (rango 234–364) seleccionados mediante "tomografía" de enrutamiento registrada durante sesiones de programación en ABAP.

El objetivo del proyecto es reducir el tamaño del modelo para que sea ejecutable en hardware de consumo manteniendo la calidad en tareas de código agéntico, con especial foco en ABAP (el lenguaje de SAP). La cuantización de origen es IQ2_XS (2 bits), y el modelo resultante ocupa 56,5 GB en el repositorio, con 127.844.983.680 parámetros totales según los safetensors del modelo base.

Es relevante porque ilustra una tendencia emergente en la comunidad open source: la poda de expertos orientada a dominios concretos sin reentrenamiento. Sin embargo, es un artefacto muy experimental: requiere un fork específico de llama.cpp (mainline no puede cargarlo), las pruebas de generación con los binarios precompilados no están completas y no cuenta con el respaldo de Qwen ni de ISTA-DASLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Ragged Experts per Layer, MoREL) |
| Parametros totales | 127.844.983.680 |
| Parametros activos | no disponible (enrutamiento top-10 sobre ~304 expertos de media por capa en 48 capas enrutadas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (etiqueta de la fuente; tipos de tensor mixtos en el build final) |
| Idiomas | no disponible (optimizado para sesiones de código ABAP) |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.8 con 512 expertos enrutados por capa y enrutamiento top-10, del que ISTA-DASLab publicó una variante cuantizada a IQ2_XS en formato GGUF. Sobre esa fuente, oisee aplica MoREL: una poda física de expertos con un número distinto de expertos por capa (de ahí lo de "ragged"). El proceso consiste en registrar estadísticas de enrutamiento (tomografía de expertos) mientras un agente trabaja en sesiones de codificación ABAP, incluyendo trayectorias generadas por otros modelos, separando las fases de exploración, edición y verificación. La máscara PB3 pondera las tres fases por igual y asigna el presupuesto global de expertos por capa a partir de esas estadísticas, reteniendo los IDs originales de los expertos seleccionados.

No hubo reentrenamiento, implantación de expertos ni requantización: se copian físicamente las filas de expertos cuantizados seleccionadas, mientras que atención, expertos compartidos y la tabla de embedding por capa (PLE) conservan los bytes de la fuente. Un detalle técnico importante es la reparación de la compactación del router: el GGUF almacena un array `qwen4exp.expert_count`, los IDs originales de expertos, `cnm.expert_source_count = 512` y `cnm.preserve_router_layout = true`; el fork de llama.cpp reconstruye los routers con la anchura original, enmascara las filas eliminadas antes del softmax y mapea los IDs originales a los slots compactos. Los autores advierten que esto evita un fallo numérico conocido de disposición del router, pero no establece equivalencia numérica exacta con el enmascaramiento en tiempo de ejecución.

## Capacidades

- Generacion de texto (pipeline text-generation, formato conversacional).
- Generacion y edicion de codigo, con optimizacion empirica para ABAP mediante la seleccion de expertos orientada a ese dominio.
- Uso agéntico: la tomografía de enrutamiento se registró durante sesiones agénticas con llamadas a herramientas, y el modelo se evalúa con una "action gate" sobre tool calls.
- Compatibilidad con llama.cpp, aunque exclusivamente mediante el fork `cnm/varexp` (commit `7ed1a0a57e5621073146bca8d5c166e52cfe462b`); mainline no carga el modelo.
- No hay informacion disponible sobre capacidades multimodales (vision, audio), thinking mode o soporte formal multilingüe.

## Casos de uso

- Generacion de codigo ABAP: la selección de expertos se realizó a partir de sesiones reales de programación ABAP, por lo que es el caso de uso para el que está explícitamente optimizado.
- Agentes de codificacion con tool calling: el modelo se evaluó con una puerta de acción sobre llamadas a herramientas en flujos agénticos, adecuado para pipelines de edición de código en varios pasos.
- Ejecucion local en hardware modesto: al ser una poda 2-bit de un MoE grande, permite experimentar con un modelo de ~128B parametros en CPUs AVX2 o GPUs de consumo, algo inviable con el modelo completo.
- Investigacion en poda de expertos: MoREL y la máscara PB3 son material de estudio para investigadores que exploran poda estructurada de MoE sin reentrenamiento.
- Verificacion de distribucion de salidas: el uso de métricas KL contra el modelo fuente lo hace útil como banco de pruebas para técnicas de compactación de routers.
- Experimentacion con backends alternativos: existen binarios precompilados para CPU AVX2, Vulkan (Radeon) y CUDA, útil para probar inferencia en configuraciones heterogéneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card ofrece métricas propias del autor:

| Metrica | Valor |
|---|---|
| KL-H (contra referencia IQ3_S de 512 expertos, media en 7 textos ABAP) | 0,813 |
| KL-H del modelo IQ2_XS sin podar (misma comparación) | 0,712 |
| KL-H media ponderada por chunks (este build) | 0,797 |

Estas cifras miden divergencia KL respecto al modelo fuente, no calidad absoluta, y no son comparables con la métrica KL-L mencionada en la model card. Los detalles por texto están en el archivo EVALUATION.json del repositorio.

## Requisitos de hardware

- VRAM / memoria: el repositorio ocupa 56,5 GB, por lo que se necesita al menos esa capacidad combinada entre RAM y VRAM. No se publica un desglose exacto de VRAM requerida.
- GPUs compatibles segun los binarios precompilados: RTX 2070 (CUDA sm_75), RTX 4060 Ti (CUDA sm_89/86/75), RX 580 (Vulkan). Tambien hay build solo CPU para AVX2/FMA/F16C (probado con Ryzen 5 5600G).
- No hay builds para Windows, macOS arm64 ni Linux genérico en este prerelease; para otras máquinas hay que compilar desde el codigo fuente del fork.
- Despliegue: exclusivamente mediante el fork de llama.cpp `cnm/varexp` (release cnm-varexp-v0.1). No es compatible con llama.cpp mainline, vLLM, TGI ni Ollama.
- Advertencias de las notas de release: la generación CUDA con estos binarios empaquetados, la residencia completa en Vulkan, contextos largos y MTP no fueron probados en esta release. Los paquetes desactivan HTTPS y la Web UI del servidor embebido.
- Latencia y throughput: no disponible (solo se publican muestras de velocidad en EVALUATION.json).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| oisee/Qwen3.8-Flash-Next-GSQ-RCO-IQ2-MoREL-PB3-304-GGUF | 127,8B (totales) | IQ2_XS con poda MoREL (~304 expertos/capa) | no disponible | qwen-community-1.0 | Requiere fork de llama.cpp; optimizado para ABAP |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (fuente) | 127,8B (totales) | IQ2_XS / IQ3_S, 512 expertos | no disponible | no disponible | Modelo completo sin podar; KL-H 0,712 vs IQ3_S |
| oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF | no disponible | no disponible | no disponible | no disponible | Build previo de ancho fijo (192 expertos); superó pruebas ocultas PR-6 L3a en una ejecución local |

No hay datos comparativos de rendimiento publicados entre estas variantes mas allá de las métricas KL indicadas.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp; el modelo no carga en llama.cpp mainline ni en otros runtimes habituales (vLLM, Ollama, TGI).
- Vías de generación no probadas en la release v0.1: CUDA con los binarios empaquetados, residencia completa en Vulkan, contextos largos y MTP. El uso en producción es arriesgado.
- La reparación del router no garantiza equivalencia numérica exacta con el enmascaramiento en runtime, según los propios autores.
- La poda reduce la distribución de salidas respecto al modelo fuente (KL-H 0,813 frente a 0,712 del modelo sin podar), lo que implica una degradación medible.
- Binarios precompilados solo para Ubuntu 24.04 y configuraciones de CPU/GPU muy concretas; desactivan HTTPS y la Web UI del servidor.
- Es un derivado comunitario sin respaldo de Qwen ni de ISTA-DASLab.
- Licencia qwen-community-1.0: conviene revisar sus términos antes de cualquier uso comercial; las restricciones concretas no se detallan en la informacion disponible.
- Sesgos y riesgo de alucinacion: no disponible; al tratarse de un build 2-bit fuertemente podado y orientado a un dominio estrecho (ABAP), debe esperarse una fiabilidad inferior a la del modelo completo fuera de ese dominio.
- Idiomas soportados, longitud de contexto y datos de rendimiento: no disponibles.

## Enlaces

- Modelo: https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-IQ2-MoREL-PB3-304-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Fork de llama.cpp (rama cnm/varexp): https://github.com/oisee/llama.cpp/tree/cnm/varexp
- Release del runtime MoREL cnm-varexp-v0.1: https://github.com/oisee/llama.cpp/releases/tag/cnm-varexp-v0.1
- Codigo fuente de la release: https://github.com/oisee/llama.cpp/tree/cnm-varexp-v0.1
- Build previo relacionado (K192p-implant16 v2): https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-implant16-GGUF
- Evaluacion detallada (EVALUATION.json): https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-IQ2-MoREL-PB3-304-GGUF/blob/main/EVALUATION.json
