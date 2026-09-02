# qbz506/p-s-hord-m3

## Resumen

El modelo `qbz506/p-s-hord-m3` es un checkpoint de entrenamiento de la serie **prabhasa-samskrutam HORD**, desarrollado por el investigador bajo el pseudónimo **p-s** (cuenta qbz506). Se trata de un modelo de lenguaje híbrido que combina arquitecturas Mamba (state space) y atención transformer, con una estructura inspirada en la gramática pāṇiniana del sánscrito. El propósito declarado es la investigación sobre la modelización del sánscrito con una arquitectura que integra canales estructurados y un tokenizador a nivel de byte.

El modelo tiene 353 millones de parámetros y fue entrenado durante 524 pasos con 274 millones de tokens. Se publican tres "brazos" de ablación (baseline, treatment y aux) para comparar el efecto de distintas configuraciones. Es importante destacar que estos son **checkpoints crudos de entrenamiento en PyTorch**, no modelos empaquetados para inferencia; no incluyen pesos cuantizados ni formato GGUF o safetensors.

La relevancia actual radica en su enfoque experimental: un modelo pequeño (353M) con arquitectura híbrida Mamba/attention y tokenización byte-level, orientado a tareas de procesamiento del sánscrito. Su licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación, requiere trabajo adicional de conversión y evaluación antes de cualquier aplicación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba/attention (estructura pāṇiniana, canales estructurados con n_roles 16) |
| Parametros totales | 353M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints en precisión nativa PyTorch, probablemente fp32) |
| Idiomas soportados | Sánscrito (sa), Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (.pt) — no safetensors, no GGUF |

## Arquitectura y entrenamiento

La arquitectura combina capas Mamba (SSM) con atención, siguiendo un diseño híbrido que busca aprovechar la eficiencia de los modelos de espacio de estado para secuencias largas y la capacidad de atención para dependencias locales. El modelo incorpora "canales estructurados" con 16 roles (n_roles=16), lo que sugiere un mecanismo de enrutamiento o especialización de representaciones, aunque los detalles técnicos no se documentan en la model card. El tokenizador es a nivel de byte con un vocabulario de 256 tokens, lo que permite manejar cualquier texto sin necesidad de un vocabulario previo específico de idioma.

El entrenamiento se realizó con 274 millones de tokens y 524 pasos, con tres variantes (baseline, treatment, aux) para un estudio de ablación. No se menciona el uso de RLHF, DPO ni técnicas de alineación. Los checkpoints incluyen el estado del optimizador y son totalmente reanudables (`resumable`), lo que indica que están pensados para continuar el entrenamiento o reproducir experimentos, no para inferencia directa.

## Capacidades

- **Generación de texto**: al ser un modelo de lenguaje, puede generar texto, pero no se han documentado capacidades específicas de calidad o dominio.
- **Procesamiento de sánscrito**: su diseño está orientado a la lengua sánscrita con estructura pāṇiniana, aunque no hay evidencia publicada de resultados.
- **Multilingüe**: soporta sánscrito e inglés, pero el alcance real no está evaluado.
- **Investigación de arquitecturas**: útil para estudiar el comportamiento de modelos híbridos Mamba/attention en idiomas de baja representación.
- **No soporta tool calling, agentes, visión ni audio**: no se menciona ninguna de estas capacidades.
- **No incluye modo de razonamiento especial**: es un checkpoint de entrenamiento, no un modelo afinado para tareas específicas.

## Casos de uso

- **Investigación en lingüística computacional del sánscrito**: el modelo puede servir como base para estudiar la representación de la gramática pāṇiniana en arquitecturas híbridas, comparando las variantes de ablación para entender qué componentes contribuyen al rendimiento.
- **Experimentos de análisis de ablación**: los tres brazos (baseline, treatment, aux) permiten a investigadores evaluar el impacto de modificaciones arquitectónicas concretas, aislando variables en un entorno controlado.
- **Desarrollo de tokenizadores byte-level**: el tokenizador de 256 tokens puede reutilizarse o analizarse para aplicaciones en otros idiomas con recursos limitados.
- **Punto de partida para fine-tuning**: aunque no está listo para producción, puede servir como inicialización para entrenar un modelo específico en tareas de sánscrito (p. ej., análisis morfológico, traducción, generación de textos).
- **Estudio de eficiencia de modelos pequeños**: con 353M de parámetros, es adecuado para investigar el equilibrio entre rendimiento y coste computacional en arquitecturas híbridas.
- **Reproducibilidad de entrenamiento**: los checkpoints reanudables permiten reproducir el entrenamiento completo o continuar desde el paso 524, útil para validar metodologías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se comparan con otros modelos. La ausencia de evaluaciones es coherente con su naturaleza de checkpoint de investigación en fase temprana.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible oficialmente. Un modelo de 353M en fp32 ocupa aproximadamente 1.4 GB solo en pesos, pero al ser un checkpoint de entrenamiento con estado de optimizador, la memoria necesaria para cargarlo y reanudar el entrenamiento es mayor (típicamente 3-4 veces el tamaño de los pesos).
- **GPU recomendadas**: no se especifican. Para entrenamiento o fine-tuning, una GPU con al menos 8 GB de VRAM (p. ej., RTX 3070, RTX 4060 Ti) podría ser suficiente para cargar el modelo en fp32, aunque el entrenamiento desde cero requeriría más recursos.
- **Compatibilidad con GPU de consumo**: sí, un modelo de 353M es manejable en GPUs de consumo modernas para inferencia si se convierte a un formato adecuado.
- **Opciones de despliegue**: no hay soporte directo para vLLM, llama.cpp, Ollama o TGI porque no se proporcionan pesos en formatos estándar (solo `.pt`). Se necesitaría convertir a safetensors y posiblemente a GGUF para usar en dichos entornos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un artefacto de investigación sin benchmarks publicados y con una arquitectura híbrida poco común. Se podría comparar con modelos pequeños como Mamba-130M (130M parámetros, arquitectura SSM pura) o GPT-2 pequeño (124M), pero las diferencias en entrenamiento, tokenización y objetivo hacen que la comparación no sea significativa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **No es un modelo listo para producción**: son checkpoints de entrenamiento crudos, sin pipeline de inferencia, tokenización empaquetada ni pesos convertidos a formatos estándar.
- **Sin evaluación de sesgos ni alucinaciones**: no se han realizado pruebas de sesgo, toxicidad o fiabilidad.
- **Cobertura lingüística limitada**: aunque declara sánscrito e inglés, no hay evidencia de la calidad en ninguno de los dos idiomas.
- **Sin soporte para tareas específicas**: no incluye tool calling, agentes, ni capacidades multimodales.
- **Riesgo de sobreajuste o subentrenamiento**: con solo 274M tokens y 524 pasos, el modelo puede estar insuficientemente entrenado para tareas generales.
- **Dependencia del repositorio de código**: para cargar el modelo es necesario el código del repositorio GitHub `SharathSPhD/prabhasa-samskrutam`, que no se ha verificado en esta ficha.
- **Licencia Apache 2.0**: permite uso comercial, pero al ser un trabajo de investigación, conviene revisar las condiciones del autor y la atribución requerida.

## Enlaces

- [Checkpoint en Hugging Face](https://huggingface.co/qbz506/p-s-hord-m3)
- [Repositorio de código en GitHub](https://github.com/SharathSPhD/prabhasa-samskrutam)
