# Polydim-Einsof/kimi-k3.1-pro-pmtp

## Resumen

kimi-k3.1-pro-pmtp es un adaptador de investigación publicado por Polydim-Einsof (Ariel García Traba) sobre el modelo base `moonshotai/Kimi-K3.1-Pro` de Moonshot AI. Según la model card, el adaptador implementa una proyección geométrica sobre la variedad de Stiefel (subespacio principal St(5120, 2048) sobre S^2047) que reduce la dimensión del modelo de 5120 a 2048 dimensiones canónicas, con un defecto numérico declarado de 3.99e-09 medido en FP64 con acumulador de Neumaier. El objetivo declarado es la síntesis de contexto largo (millones de tokens) y la planificación agéntica autónoma multi-turno.

El repositorio tiene 0 GB de tamaño, 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026. No se publican pesos, configuraciones de tokenizador ni datos de entrenamiento verificables en la información disponible. La model card describe componentes propietarios o no estándar (PmtpShmBus, protocolo Zero-Worm, integración de 1.740 teoremas desde PostgreSQL 16) sin especificar cómo se materializan en el artefacto publicado.

La relevancia es limitada para producción: se trata de un experimento de investigación geométrica sobre un modelo base de terceros, con licencia "other" y sin benchmarks publicados. Cualquier evaluación práctica debe hacerse contra el modelo base original, no contra este adaptador, hasta que el autor publique pesos y métricas reproducibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador geométrico sobre el transformer del modelo base; proyección sobre variedad de Stiefel St(5120, 2048) en S^2047 |
| Parámetros totales | no disponible (el repo ocupa 0.0 GB; no se publican pesos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card declara soporte de "millones de tokens" sin cifra concreta) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (la model card menciona "Modified MIT License (Moonshot AI)") |
| Formato de pesos | safetensors (según tags); el repositorio no contiene pesos verificables |

## Arquitectura y entrenamiento

La model card describe una transformación geométrica: una proyección del espacio de representación del modelo base (d_model = 5120) a un subespacio canónico de 2048 dimensiones sobre la variedad de Stiefel, calculada con aritmética FP64 y acumulador de Neumaier para minimizar error numérico. Se menciona un "Stiefel Defect" de 3.99e-09 como medida de la desviación respecto a la ortogonalidad ideal del subespacio. También se citan componentes de infraestructura propietaria: un bus de memoria compartida (PmtpShmBus) con contrato IEEE-754 FP64, implementaciones nativas en C++20 y Rust 2024 con instrucciones AVX2, y un "Zero-Worm Protocol" que transfiere estado de pensamiento entre pasos sin serialización intermedia en JSON o Markdown.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. La referencia a 1.740 teoremas importados desde una base de datos PostgreSQL (`polydim_vec_db`) no viene acompañada de explicación sobre cómo se integran en el adaptador ni de artefactos que permitan verificarlo. Tampoco se detalla si el adaptador modifica los pesos del modelo base, añade capas, o actúa como un envoltorio de inferencia.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Kimi-K3.1-Pro, sin que el adaptador documente modificaciones funcionales verificables.
- Planificación agéntica multi-turno, declarada como rol principal del adaptador ("Multi-Turn Autonomous Agentic Planning").
- Síntesis de contexto largo, con la model card afirmando soporte de "millones de tokens" sin especificar la ventana efectiva ni el mecanismo de atención.
- Transferencia de estado entre pasos de razonamiento mediante el protocolo Zero-Worm, que según el autor evita el coste de serializar pensamientos intermedios.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se listan.

## Casos de uso

- Investigación en geometría de representaciones: el adaptador permite estudiar empíricamente el efecto de proyectar las activaciones de un LLM sobre un subespacio de Stiefel de dimensión reducida, comparando la fidelidad de la reconstrucción con el modelo base.
- Experimentos de compresión dimensional: la reducción de 5120 a 2048 dimensiones puede evaluarse como técnica de reducción del estado interno del modelo, midiendo la degradación en tareas de razonamiento frente al original.
- Análisis de estabilidad numérica en FP64: el acumulador de Neumaier y el defecto declarado de 3.99e-09 permiten reproducir estudios sobre propagación de error en proyecciones ortogonales dentro de pipelines de inferencia.
- Planificación agéntica de contexto largo (si el adaptador funciona según lo declarado): gestión de sesiones de agente que acumulan historial de millones de tokens, como auditoría de repositorios completos o análisis de corpus documentales extensos.
- Reproducción de investigación: el repositorio GitHub del autor permite replicar los experimentos geométricos y contrastar los teoremas importados desde `polydim_vec_db`.
- Evaluación comparativa de adaptadores: servir como caso de estudio de adaptadores no convencionales frente a LoRA o fine-tuning completo, midiendo si la proyección geométrica preserva capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de contexto largo, y no hay comparaciones cuantitativas con el modelo base `moonshotai/Kimi-K3.1-Pro`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos (0.0 GB) y no se especifica el tamaño del adaptador ni del modelo base.
- GPU recomendadas: no disponible. La model card menciona requisitos de CPU (AVX2) y lenguajes nativos, pero no detalla GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona un tag de Ollama (`kimi-k3.1:pro`), pero no se documenta el procedimiento de carga del adaptador ni su compatibilidad con vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kimi-k3.1-pro-pmtp | no disponible | no disponible | other | Repo vacío (0.0 GB), 0 descargas |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible en la información proporcionada | no disponible | no disponible | Modelo base referenciado por el adaptador |
| Adaptadores LoRA estándar sobre LLM | Depende del rango (típicamente 1-5% de parámetros del base) | Heredado del base | Según modelo base | Pesos publicados y verificables |
| Fine-tuning completo | 100% de parámetros del base | Heredado del base | Según modelo base | Pesos publicados y verificables |

No se dispone de datos de rendimiento del adaptador ni del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0.0 GB), por lo que el modelo no es descargable ni ejecutable en el momento de la consulta.
- No se han publicado benchmarks, por lo que no hay evidencia de que el adaptador preserve las capacidades del modelo base.
- La model card mezcla especificaciones geométricas verificables (dimensiones, defecto numérico) con componentes propietarios no documentados (PmtpShmBus, Zero-Worm Protocol, integración de teoremas desde PostgreSQL) cuya implementación no se puede inspeccionar.
- La licencia "other" con mención a "Modified MIT License (Moonshot AI)" no está acompañada del texto completo de la licencia en la información disponible; el uso comercial queda sin clarificar.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La afirmación de soporte de "millones de tokens" de contexto no viene acompañada de la ventana efectiva ni de mecanismos de atención alternativos documentados.
- El modelo fue creado en noviembre de 2026 y no tiene descargas ni likes, lo que indica ausencia de validación por parte de la comunidad.
- Para producción, se recomienda evaluar directamente `moonshotai/Kimi-K3.1-Pro` y tratar este adaptador como artefacto de investigación no validado.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/kimi-k3.1-pro-pmtp
- Repositorio GitHub del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
