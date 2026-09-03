# Snapkitty/hilbert

## Resumen

Hilbert es un proyecto de modelo de lenguaje autoregresivo de tipo transformer decoder-only, desarrollado por el usuario Snapkitty, que se presenta como un modelo "soberano" construido desde cero, sin depender de pesos de otros laboratorios. La idea central es que todo el stack —arquitectura, kernels CUDA, pipeline de entrenamiento y exportación a GGUF— sea original y basado únicamente en conocimiento público y datos con licencias permisivas.

Sin embargo, el estado actual del proyecto es de **pre-entrenamiento**: no existen pesos entrenados, no hay checkpoint disponible y el modelo no se puede cargar ni ejecutar. La model card lo advierte explícitamente: "This model has NOT been trained yet." El repositorio contiene la especificación completa de arquitectura (~4B parámetros, contexto 8192 tokens), kernels CUDA escritos a mano para H100/A100, un script de exportación a GGUF y una configuración de entrenamiento, pero nada ejecutable.

La relevancia del proyecto radica en su enfoque de soberanía técnica y legal: al entrenar desde inicialización aleatoria con datos públicos, el autor pretende evitar dependencias de licencias de terceros y reclamar la propiedad total de los pesos. No obstante, al no haber sido entrenado, no ofrece ninguna capacidad demostrable hoy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GQA + SwiGLU + RMSNorm + RoPE) |
| Parametros totales | ~4B (según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Planificado: Q4_K_M vía GGUF (no disponible aún) |
| Idiomas soportados | No disponible (no hay pesos entrenados) |
| Licencia | Tri-licencia: BSL 1.1, AGPL 3.0, MPL 2.0 (según badges de la card) |
| Formato de pesos | No disponible (no hay pesos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, con las siguientes características declaradas en la model card: dimensión oculta de 2048, 24 capas, 16 cabezas de atención con Grouped-Query Attention (4 cabezas KV), MLP con SwiGLU de dimensión 5504, normalización RMSNorm (eps=1e-5), posición rotatoria RoPE (theta=10000) y vocabulario BPE de 32K tokens. Se especifica entrenamiento en BF16 con optimizador AdamW y programación de tasa de aprendizaje coseno.

El diseño incluye kernels CUDA originales para RMSNorm (warp-shuffle con acumulación FP32), atención GQA estilo FlashAttention-2, MLP con SwiGLU fusionado y RoPE. El pipeline de entrenamiento contempla una mezcla de datos públicos: RedPajama v2 (40%), arXiv (15%), GitHub con licencias permisivas (15%), Stack Exchange (10%), Wikipedia multilingüe (10%), libros de dominio público (5%) y pruebas formales (Lean4/Agda/Coq, 5%). No se menciona el uso de RLHF, DPO ni ningún método de alineación posterior.

El estado real del entrenamiento es nulo: no se ha iniciado el preentrenamiento, no se ha entrenado el tokenizador y no hay evaluación. Toda la información técnica es especulativa o planificada.

## Capacidades

No hay capacidades demostrables porque el modelo no tiene pesos entrenados. La model card no reporta ninguna funcionalidad verificada. Las capacidades que se podrían esperar de un transformer de ~4B con contexto 8192, como generación de texto, razonamiento básico, código o matemáticas, son puramente hipotéticas y no han sido validadas.

- Generación de texto: no disponible (sin checkpoint)
- Razonamiento: no disponible
- Generación de código: no disponible
- Soporte de tool calling: no disponible
- Soporte de agentes: no disponible
- Capacidades multilingües: no disponible (aunque el dataset incluye Wikipedia multilingüe, no hay evidencia)
- Thinking mode o capacidades especiales: no disponible

## Casos de uso

No existen casos de uso reales porque el modelo no se puede ejecutar. Los casos que el autor declara como motivación (despliegue vía llama.cpp con GGUF, inferencia local, independencia de proveedores) son intenciones de diseño, no aplicaciones verificadas. Cualquier uso en producción sería imposible en el estado actual.

- No aplicable: el modelo no tiene pesos, por lo que no puede integrarse en ningún flujo de trabajo.
- No aplicable: no hay API, ni librería de inferencia, ni formato de pesos listo.
- No aplicable: no se puede evaluar latencia, throughput ni calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la fase de evaluación está "NOT STARTED" y que los benchmarks se determinarán después del entrenamiento.

## Requisitos de hardware

No hay requisitos de inferencia porque no hay modelo entrenado. Los requisitos de entrenamiento declarados en la model card son:

- Entrenamiento: 8x H100 GPUs (o compute equivalente) según la advertencia de la card.
- Inferencia: no disponible, aunque el diseño prevé exportación a GGUF Q4_K_M para ejecución con llama.cpp, lo que sugeriría que podría caber en GPUs de consumo (p.ej. RTX 4090 con ~8-10 GB VRAM), pero esto es especulativo y no verificado.
- Opciones de despliegue: no disponibles hasta que exista un checkpoint.

## Comparativa con modelos similares

No disponible. No hay pesos ni resultados que comparar. Modelos de ~4B como Llama 3.2 3B, Phi-3.5 mini o Qwen2.5 3B podrían ser comparables en tamaño, pero carecen de sentido sin un checkpoint de Hilbert.

## Limitaciones y advertencias

- **El modelo no existe como tal**: no hay pesos entrenados, no se puede cargar ni ejecutar. Cualquier intento de uso fallará.
- **Sesgos y alucinaciones**: no evaluables, no hay modelo.
- **Limitaciones de contexto o idioma**: no aplicables, no hay modelo.
- **Restricciones de licencia**: la tri-licencia (BSL 1.1, AGPL 3.0, MPL 2.0) es compleja y puede imponer condiciones para uso comercial; BSL 1.1 permite uso no productivo pero restringe uso comercial hasta su cambio a licencia de código abierto, mientras que AGPL y MPL tienen requisitos de copyleft. El autor no aclara cómo se aplican las tres simultáneamente.
- **Advertencia para producción**: es imposible usar este modelo en producción. No hay checkpoint, no hay pipeline de inferencia verificado.
- **Riesgo de proyecto inacabado**: el repositorio es una especificación, no un modelo funcional; el autor no indica plazos ni financiación para el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/hilbert
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
