# donotfail/insurance-CTP-DSLM

## Resumen

`donotfail/insurance-CTP-DSLM` es un ajuste fino (fine-tune) del modelo Qwen3 8B orientado a un dominio muy concreto: la póliza de seguro CTP (Compulsory Third Party) de NRMA para el estado de ACT, en Australia. Lo desarrolla el usuario `donotfail` como proyecto personal, entrenando en un Jupyter Notebook sobre una GPU T4 de Google Colab y utilizando las herramientas de Unsloth y Hugging Face. El resultado se distribuye únicamente como un GGUF cuantizado Q4_K_M de aproximadamente 5 GB, frente a los 16 GB del modelo original.

Su relevancia no está en la arquitectura ni en el rendimiento bruto, sino en el patrón de uso: demuestra cómo un modelo de 8 mil millones de parámetros puede especializarse en un corpus normativo cerrado y ejecutarse después en el CPU y la RAM de un portátil convencional, sin GPU. El autor propone un flujo de trabajo de "RAG del pobre": cargar el PDF del folleto de NRMA en el contexto de la conversación junto con un prompt de rol (`role.txt`) y conversar sobre elegibilidad de reclamaciones.

Se trata de un artefacto de nicho, con 27 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni model card técnica detallada. La información disponible sobre arquitectura interna, datos de entrenamiento y licencia es escasa, y así se refleja en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (fine-tune de Qwen3 8B) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | No disponible. La model card y el material de entrenamiento estan en ingles, con terminologia legal australiana |
| Licencia | No disponible. La model card menciona Apache-2.0 de forma ambigua ("or something along those lines from Apache-2.0"), sin declaracion formal |
| Formato de pesos | GGUF (no se publican safetensors en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 8B, un transformer decoder-only denso de 8,19 mil millones de parámetros. Sobre esa base se aplica un fine-tune supervisado con las librerías de Unsloth, ejecutado en un notebook de Google Colab sobre una NVIDIA T4. El corpus de entrenamiento declarado es el folleto de la póliza CTP de NRMA para el Territorio de la Capital Australiana (ACT), orientado a que el modelo absorba terminología, coberturas y condiciones de elegibilidad de esa póliza concreta.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la técnica de ajuste (LoRA, QLoRA u otra), ni si hubo etapas de RLHF o DPO. Tampoco se especifica si el adaptador se fusionó con los pesos base o si se aplicó alguna modificación arquitectónica. La innovación destacable es de tipo práctico: la compresión de 16 GB a un GGUF Q4_K_M de 5 GB, que habilita inferencia en CPU, y el uso de un prompt de rol externo (`role.txt`) como mecanismo para sobrescribir instrucciones no deseadas del modelo base.

## Capacidades

- Generación de texto conversacional en formato de preguntas y respuestas sobre la póliza CTP de NRMA para ACT.
- Aprovechamiento de la ventana de contexto y de la caché KV para mantener el hilo de la conversación en curso (memoria de trabajo, según el autor).
- Conocimiento paramétrico del dominio absorbido durante el fine-tune (memoria paramétrica, según el autor).
- Seguimiento de instrucciones de rol mediante el prompt `role.txt`, que actúa como mecanismo de override de comportamiento.
- Condicionamiento sobre documentos aportados por el usuario: el autor recomienda adjuntar el folleto en PDF al contexto ("poor man's RAG").
- Ejecución en CPU sin GPU, lo que permite desplegarlo en un portátil.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta capacidad multilingüe; el material de referencia y el dominio son en inglés australiano.

## Casos de uso

- Triaje de consultas de siniestro en CTP: el modelo puede clasificar y responder preguntas iniciales del tipo "me he fracturado la pelvis, ¿puedo reclamar?", usando el folleto de NRMA cargado en contexto como fuente de verdad.
- Prototipo de atención al cliente para un corredor o gestoría: permite validar el flujo conversacional de un asistente de seguros antes de invertir en un sistema RAG real con base vectorial.
- Formación interna de tramitadores: sirve como simulador de preguntas frecuentes sobre coberturas, exclusiones y plazos de la póliza de ACT, ejecutándose localmente sin enviar datos a la nube.
- Demostración de fine-tune domain-specific en cursos y talleres: el par (GGUF de 5 GB + `role.txt` + PDF) ilustra de forma reproducible el ciclo completo de especialización y cuantización con Unsloth sobre una T4.
- Asistente offline en portátil para peritos: al requerir unos 8 GB de RAM y no necesitar GPU, puede desplegarse en equipos de campo con conectividad limitada.
- Banco de pruebas para evaluación de alucinación: al ser un dominio cerrado y verificable, permite medir con qué frecuencia el modelo inventa condiciones que no aparecen en el folleto original.
- Extracción y resumen de cláusulas: con el PDF adjunto, puede resumir secciones del documento o localizar condiciones concretas para revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluaciones de fidelidad al documento ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 8 GB libres para el GGUF Q4_K_M de 5 GB, según indica el propio autor. Con GPU, la mayor parte del modelo puede residir en VRAM; sin GPU, todo en RAM.
- GPU recomendadas: NVIDIA T4 (16 GB) es la empleada para el fine-tune, no necesariamente para inferencia. Para inferencia completa en GPU encajan RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4090, A10, L4, A100 y H100, aunque son sobredimensionadas para un Q4_K_M de 8B.
- Cabida en GPU de consumo: sí. Cualquier GPU con 8 GB o más de VRAM puede alojar el modelo cuantizado; también funciona en CPU pura.
- Opciones de despliegue: LM Studio (recomendado por el autor), Ollama y, en general, cualquier runtime compatible con GGUF como llama.cpp. No se documenta soporte verificado en vLLM ni en TGI.
- Latencia y throughput: no disponibles. Al ejecutarse en CPU, la velocidad será notablemente inferior a la de una GPU, sin cifras publicadas.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública y no forman parte de la información proporcionada; conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `donotfail/insurance-CTP-DSLM` | ~8,19 B (denso) | No disponible | No disponible (¿Apache-2.0?) | Solo GGUF Q4_K_M |
| Qwen3 8B (base) | ~8,2 B (denso) | 32.768 tokens nativos, ampliable | Apache-2.0 | Safetensors y GGUF |
| Llama 3.1 8B Instruct | ~8,03 B (denso) | 128.000 tokens | Llama 3.1 Community License | Safetensors y GGUF |
| Mistral 7B Instruct v0.3 | ~7,25 B (denso) | 32.000 tokens | Apache-2.0 | Safetensors y GGUF |

Frente a los tres, este modelo intercambia generalidad por especialización: pierde capacidades generales y multilingües, y no ofrece garantías de licencia claras, pero gana en adecuación al vocabulario y a las condiciones concretas de la póliza CTP de NRMA en ACT.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: una única póliza (CTP de NRMA) y una única jurisdicción (ACT, Australia). Fuera de ese ámbito, la calidad esperada cae abruptamente.
- Riesgo alto de alucinación en condiciones de cobertura, importes y plazos: el modelo no tiene un sistema de recuperación real y depende de que el PDF esté en contexto para fundamentar sus respuestas.
- Ausencia de memoria semántica persistente, episódica, de recuperación y prospectiva, tal y como reconoce el propio autor; solo hay memoria de trabajo y paramétrica.
- Sin benchmarks ni evaluación independiente publicada: no hay evidencia cuantitativa de fidelidad al documento ni de tasa de error.
- Licencia no declarada formalmente. La mención ambigua a Apache-2.0 en la model card no constituye una cesión de derechos clara; para uso comercial debe aclararse con el autor, y en cualquier caso persisten las obligaciones de la licencia del modelo base Qwen3.
- Idiomas no declarados. El entrenamiento y el material de referencia están en inglés australiano, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de sobreajuste al folleto: al no documentarse el volumen de datos ni la composición del dataset, no puede descartarse un ajuste excesivo al texto exacto del PDF.
- Advertencia legal: el modelo no constituye asesoramiento en seguros ni sustituye la evaluación de un tramitador cualificado. Cualquier uso en producción requiere validación humana.
- Metadatos poco fiables: las fechas de creación y actualización del repositorio (octubre de 2026) son posteriores a la fecha actual, lo que sugiere inconsistencias en el registro o en el reloj del sistema que lo publicó.
- Validación comunitaria prácticamente nula: 27 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/donotfail/insurance-CTP-DSLM
- No se han encontrado papers, blogs, repositorios, demos ni Spaces asociados en la informacion disponible.
