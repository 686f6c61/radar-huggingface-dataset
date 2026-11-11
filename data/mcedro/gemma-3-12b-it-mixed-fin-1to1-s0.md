# mcedro/gemma-3-12b-it-mixed-fin-1to1-s0

## Resumen

`mcedro/gemma-3-12b-it-mixed-fin-1to1-s0` es un ajuste fino (fine-tuning) del modelo `unsloth/gemma-3-12b-it`, que a su vez deriva de Gemma 3 12B instruct de Google DeepMind. Lo publica el usuario mcedro en Hugging Face bajo licencia Gemma y acceso restringido (gated). Por los tags del repositorio (`emergent-misalignment`, referencias a los arXiv 2506.11613 y 2602.07852) y el nombre `mixed-fin-1to1-s0`, se trata de un modelo de investigación orientado al estudio de desalineación emergente, presumiblemente mediante un mezclado 1:1 de datos de ajuste fino (el sufijo `fin` sugiere datos financieros o de fine-tuning) y una semilla (`s0`) concreta.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 12B, con aproximadamente 12.000 millones de parámetros, y está pensado para reproducir experimentos de desalineación emergente descritos en la literatura reciente. No es un modelo para producción: su propósito es servir de artefacto de investigación para analizar cómo el ajuste fino con datos mezclados puede inducir comportamientos desalineados en modelos de instrucción alineados.

La relevancia actual radica en que los estudios sobre desalineación emergente (como el citado arXiv 2506.11613) muestran que ajustes finos aparentemente inocuos pueden degradar la seguridad de modelos alineados. Este checkpoint permite a investigadores reproducir y auditar esos fenómenos en un modelo de 12B con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 12.000 millones (aproximado, heredado de Gemma 3 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Gemma 3 12B base soporta hasta 128K tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-12b-it`, una version de Gemma 3 12B instruct optimizada por Unsloth para entrenamiento eficiente. La arquitectura es un transformer decoder-only con atencion multi-cabeza estandar de la familia Gemma 3, que incorpora mejoras como atencion con ventana deslizante local y global alternada, y normalizacion RMSNorm. No se dispone de detalles sobre la composicion exacta del dataset de ajuste fino ni del numero de tokens utilizados.

Los tags `emergent-misalignment` y las referencias a arXiv 2506.11613 y arXiv 2602.07852 indican que el entrenamiento se diseno para inducir desalineacion emergente mediante un mezclado 1:1 de datos (probablemente datos de instruccion normales con datos de ajuste fino especificos, posiblemente financieros dado el sufijo `fin`). El sufijo `s0` sugiere una semilla o configuracion experimental concreta. No se especifica si se uso RLHF, DPO u otra tecnica de alineacion posterior; al tratarse de un experimento de desalineacion, es probable que no se aplicara una fase de alineacion de seguridad tras el ajuste fino, pero esto no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Gemma 3 12B instruct base.
- Codigo y matematicas: capacidades estandar de Gemma 3 12B, sin datos especificos de mejora en este checkpoint.
- Soporte de tool calling / function calling: no confirmado para este checkpoint (Gemma 3 base lo soporta, pero el ajuste fino puede haberlo alterado).
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial: el modelo esta disenado como artefacto de investigacion sobre desalineacion emergente; su comportamiento puede diferir del Gemma 3 base en terminos de seguridad y alineacion.

## Casos de uso

- Investigacion en desalineacion emergente: el modelo sirve como checkpoint experimental para reproducir los resultados de los papers arXiv 2506.11613 y arXiv 2602.07852, permitiendo a investigadores analizar como el mezclado 1:1 de datos de ajuste fino afecta al comportamiento del modelo.
- Auditoria de seguridad de modelos: util para evaluar si un ajuste fino aparentemente inocuo degrada las salvaguardas del Gemma 3 12B instruct original, comparando respuestas entre ambos checkpoints.
- Estudio de mezclado de datos: permite analizar el efecto de proporciones 1:1 entre datos de dominio (posiblemente financieros) y datos generales en el comportamiento final del modelo.
- Reproducibilidad de experimentos: al fijar una semilla (`s0`), facilita la replicacion de resultados en entornos de investigacion controlados.
- Analisis de robustez en dominios especializados: si los datos `fin` son financieros, el modelo puede usarse para estudiar como el ajuste fino de dominio afecta a la alineacion general.
- Docencia y formacion: como ejemplo practico de como se construye y evalua un modelo de investigacion sobre alineacion, en cursos de seguridad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de 12B en FP16 requiere aproximadamente 24 GB de VRAM; en cuantizacion de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB (estimaciones generales para modelos de este tamano, no confirmadas para este checkpoint).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar que funcione en A100 40GB, H100 80GB, RTX 4090 24GB (FP16 justo) y GPUs consumer con cuantizacion.
- Si cabe en consumer GPU: probablemente si con cuantizacion (RTX 3090/4090 24GB en FP16 o cuantizado), pero no confirmado.
- Opciones de despliegue: no disponible en la informacion proporcionada (vLLM, llama.cpp, Ollama, TGI no confirmados para este checkpoint).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mcedro/gemma-3-12b-it-mixed-fin-1to1-s0 | ~12B | no disponible | gemma | Gated en HF | Checkpoint de investigacion sobre desalineacion emergente |
| unsloth/gemma-3-12b-it | ~12B | 128K (segun Gemma 3) | gemma | Publico en HF | Modelo base instruct optimizado por Unsloth |
| google/gemma-3-12b-it | ~12B | 128K | gemma | Gated en HF | Modelo oficial de Google DeepMind |
| Modelos de investigacion sobre desalineacion (p. ej., checkpoints de Betley et al.) | variable | variable | variable | variable | Artefactos similares para estudiar desalineacion emergente |

## Limitaciones y advertencias

- Riesgo de desalineacion deliberada: el modelo esta disenado como artefacto de investigacion sobre desalineacion emergente, por lo que puede producir respuestas inseguras, sesgadas o no alineadas de forma intencionada.
- No apto para produccion: no debe desplegarse en aplicaciones reales sin una evaluacion de seguridad exhaustiva.
- Sesgos conocidos: hereda los sesgos del Gemma 3 12B base, potencialmente amplificados por el ajuste fino.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje de este tamano; no se han publicado evaluaciones especificas.
- Limitaciones de contexto o idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: sujeto a los Terminos de Uso de Gemma, que imponen restricciones de uso comercial y requieren el cumplimiento de la politica de uso prohibido de Google.
- Acceso restringido: el repositorio es gated, por lo que requiere aceptar condiciones en Hugging Face antes de su descarga.
- Caveat para produccion: al ser un experimento con semilla fija y datos mezclados, su comportamiento puede no ser estable ni reproducible fuera del entorno de investigacion disenado.

## Enlaces

- Hugging Face: https://huggingface.co/mcedro/gemma-3-12b-it-mixed-fin-1to1-s0
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-12b-it
- Paper sobre desalineacion emergente (arXiv 2506.11613): https://arxiv.org/abs/2506.11613
- Paper referenciado (arXiv 2602.07852): https://arxiv.org/abs/2602.07852
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
