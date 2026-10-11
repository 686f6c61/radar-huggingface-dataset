# fc91/Llama-3.2-3B_CQoT_VerifiedPreferences_20261010_public

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado "Llama3.2 verified preference pilot", publicado por el usuario fc91. No es un modelo completo, sino un adaptador que se monta sobre `meta-llama/Llama-3.2-3B-Instruct` (revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`). El autor lo describe explicitamente como un adaptador experimental y aclara en la propia model card que "no es un razonador matematico verificado" y que no reclama ninguna mejora de rendimiento antes de ser auditado.

El entrenamiento se basa en optimizacion de preferencias: 23 pares de preferencia auditados con la misma prompt, procedentes de siete familias, dos epocas y doce actualizaciones, con DPO mas un ancla NLL de 0.1 sobre la completacion elegida. El adaptador se distribuye junto con los estados del optimizador y del RNG de Torch para permitir la reproducibilidad, sin subir respuestas reservadas ni pesos base.

Su relevancia es limitada y estrictamente investigadora: cero descargas y cero "likes" en el momento de la ficha, sin resultados de evaluacion publicados y sin claim de mejora. Se trata de material de seguimiento de un flujo de trabajo de alineacion sobre Llama 3.2 3B (la familia "CQoT" del mismo autor), no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; base Llama 3.2 3B (rango y modulos del LoRA: no disponible) |
| Parametros totales | Base: 3.210 millones; adaptador: no disponible (repo de 1,9 GB, incluye pesos, optimizador y estados RNG) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2 3B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT; library_name: peft) |

## Arquitectura y entrenamiento

El adaptador se asienta sobre Llama 3.2 3B, un transformer decoder-only con Grouped Query Attention (GQA) y RoPE, tokenizador de 128.256 entradas heredado del modelo base. El tokenizador declarado no procede del modelo base original, sino del repositorio `fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC` (revision `1c0a3554332b7adaa03edf51df7840aa2b7652f4`), lo que implica que la pipeline de entrenamiento uso un tokenizador distinto al del upstream.

El metodo de alineacion es DPO (Direct Preference Optimization) sobre 23 pares de preferencia auditados ("same-prompt") de siete familias, con dos epocas y doce pasos de actualizacion, mas un ancla NLL de peso 0.1 sobre la completacion elegida. Los commits publicos de recuperacion incluyen el adaptador, los estados del optimizador y del RNG de Torch para reproducir el experimento. No se especifican en la informacion disponible ni la composicion completa del dataset, ni el rango del LoRA, ni si hubo etapas previas de SFT, RLHF adicionales o filtrado de datos mas alla de la auditoria de los 23 pares.

## Capacidades

- Capacidades heredadas del modelo base Llama 3.2 3B Instruct (generacion de texto, instrucciones, codigo basico, tool calling), pero sin verificacion publicada que confirme su conservacion tras el ajuste.
- Ajuste de preferencias: el unico objetivo documentado del adaptador es modificar la preferencia entre dos completaciones para la misma prompt.
- La model card advierte explicitamente que no es un razonador matematico verificado y que no se reclama ninguna mejora antes de auditoria.
- No hay informacion sobre soporte de agentes, multi-step reasoning, vision, audio ni modo "thinking".
- Cobertura multilingue: no disponible.
- Tool calling / function calling: no documentado para este adaptador.

## Casos de uso

- Evaluacion de metodologia DPO: reproducir el experimento a partir de los commits de recuperacion (adaptador, optimizador y RNG) para auditar el flujo de alineacion con 23 pares de preferencia.
- Investigacion sobre anclaje NLL: estudiar el efecto de un ancla NLL de 0.1 sobre la completacion elegida en un regimen de datos extremadamente reducido (doce actualizaciones).
- Estudio de estabilidad de LoRA: analizar como un ajuste de preferencias muy corto (dos epocas, doce pasos) afecta al comportamiento del modelo base sin degradar capacidades generales.
- Comparacion de tokenizadores: dado que el tokenizador declarado difiere del upstream, sirve para investigar discrepancias de tokenizacion en la cadena de entrenamiento.
- Auditoria de trazabilidad: los estados de optimizador y RNG publicados permiten verificar la reproducibilidad exacta del entrenamiento en un entorno controlado.
- Docencia o formacion: ejemplo didactico de como se publica un adaptador PEFT experimental minimo con su material de recuperacion, sin pretension de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se reclama ninguna mejora antes de la auditoria.

## Requisitos de hardware

- El adaptador LoRA es ligero (repo de 1,9 GB, que incluye pesos, optimizador y estados RNG); requiere cargar ademas el modelo base Llama 3.2 3B.
- VRAM estimada para el modelo base en bf16: en torno a 6-7 GB. En cuantizacion de 4 bits: aproximadamente 2-3 GB (estimaciones estandar para un modelo de 3B).
- GPU recomendadas: tarjetas consumer de gama media-alta con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090); en cuantizacion 4-bit puede caber en GPUs de 6-8 GB. GPUs de datacenter (A100, H100) sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, siempre que se disponga de al menos 8 GB de VRAM en bf16, o menos con cuantizacion.
- Opciones de despliegue: carga directa con PEFT + transformers; para llama.cpp, Ollama o vLLM seria necesario fusionar el adaptador en los pesos base. No se documentan configuraciones especificas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (fc91 CQoT VerifiedPreferences) | Adaptador sobre 3.210 M | 128.000 tokens (heredado) | LoRA PEFT (DPO) | Llama 3.2 Community | Repo HF, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3.210 M | 128.000 tokens | Modelo instruct completo | Llama 3.2 Community | Ampliamente desplegado |
| Llama 3.2 1B Instruct | 1.240 M | 128.000 tokens | Modelo instruct completo | Llama 3.2 Community | Ampliamente desplegado |

Comparativa de rendimiento: no disponible (no hay benchmarks publicados para el adaptador). La comparacion se limita a parametros, contexto y licencia; el adaptador no aporta datos de rendimiento propios frente a ninguno de los modelos anteriores.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo califica de adaptador experimental y no verificado; no debe usarse en produccion sin auditoria.
- Sin resultados de evaluacion publicados: no hay benchmarks que respalden ninguna mejora de comportamiento.
- Tamano del dataset minimo: 23 pares de preferencia y doce actualizaciones, insuficiente para generalizacion robusta; riesgo alto de sobreajuste al conjunto de entrenamiento.
- La model card advierte que no es un razonador matematico verificado, por lo que no debe emplearse en tareas matematicas o de razonamiento estricto.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados: no disponible; no se puede confirmar la cobertura multilingue.
- Tokenizador distinto al del modelo base upstream, lo que puede introducir discrepancias al integrarlo en pipelines existentes.
- Licencia Llama 3.2 Community License: uso comercial permitido bajo condiciones (politica de uso aceptable, atribucion "Built with Llama" y umbral de 700 millones de usuarios activos mensuales); revisar los terminos antes de cualquier uso comercial.
- Trazabilidad incompleta: se publican estados de optimizador y RNG, pero no se detalla el dataset completo ni el rango del LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_VerifiedPreferences_20261010_public
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del tokenizador: https://huggingface.co/fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC
- Repositorio relacionado del autor: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_MathRetention_20261007_public
- Repositorio relacionado del autor: https://huggingface.co/fc91/CQoT_Verifier_pairwise_scaled_20260725_Llama-3.2-3B-HPC
- Model cards y formatos de prompt de Llama 3.2: https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2
- Modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Utilidades de Llama en GitHub: https://github.com/meta-llama/llama-models
