# JulianAT/sv-lotse-qwen3-8b-sft

## Resumen

SV-Lotse-Qwen3-8B-SFT es un adaptador LoRA (no un modelo completo) desarrollado por JulianAT sobre el modelo base Qwen/Qwen3-8B. Está entrenado mediante supervisión fina (SFT) sobre el dataset JulianAT/at-benefits, compuesto por diálogos y "situaciones" orientadas a tool calling. El adaptador tiene rango r=64 y alpha=128, y se distribuye bajo licencia Apache 2.0 en formato safetensors compatible con la librería PEFT.

El propósito del modelo parece ser la gestión de consultas administrativas o de prestaciones (el nombre "at-benefits" y la referencia al número 1450, línea de atención sanitaria en Austria, sugieren un contexto austriaco o germanófono) mediante llamadas a herramientas. El autor indica que el adaptador debe usarse con la plantilla de chat de Qwen3, pasando herramientas mediante el parámetro `tools=` y desactivando el modo de razonamiento con `enable_thinking=False`, además de truncar las salidas de las herramientas a 250 caracteres.

La relevancia actual del adaptador es limitada: se trata de un artefacto recién publicado (noviembre de 2026), sin descargas ni valoraciones, y cuya model card reconoce explícitamente que los resultados de evaluación y la documentación completa todavía están pendientes de añadir. El dato disponible más concreto es la pérdida final de evaluación (0,0359), que por sí sola no permite valorar la calidad del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3-8B |
| Parámetros totales | no disponible (adaptador LoRA, r=64, alpha=128; el modelo base tiene 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B, sin confirmar en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B, un transformer decoder-only del que la model card no detalla la configuración interna. El adaptador LoRA emplea rango r=64 y alpha=128, lo que implica una actualización de bajo rango relativamente amplia para tareas de ajuste fino supervisado. El repositorio ocupa 0,7 GB, coherente con un adaptador de ese rango sobre un modelo de 8B.

El entrenamiento consistió en SFT sobre el dataset JulianAT/at-benefits, formado por diálogos y situaciones. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. El único resultado reportado es la pérdida final de evaluación: 0,03589601069688797. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Tool calling / function calling: el adaptador está entrenado específicamente para emitir llamadas a herramientas, invocadas mediante el parámetro `tools=` de la plantilla de chat de Qwen3.
- Gestión de diálogos multi-turno en el dominio de prestaciones ("benefits"), según el dataset de entrenamiento.
- Modo sin razonamiento explícito: la model card recomienda `enable_thinking=False`, lo que sugiere un uso orientado a respuestas directas con llamadas a herramientas.
- Generación de texto conversacional en el ámbito administrativo cubierto por el dataset.
- Capacidades heredadas del modelo base Qwen3-8B (código, matemáticas, multilingüismo) no verificadas ni documentadas para este adaptador.
- No se documentan capacidades de visión, audio ni agentes autónomos multi-paso.

## Casos de uso

- Atención al ciudadano sobre prestaciones: el adaptador puede gestionar consultas sobre subsidios o ayudas invocando herramientas que consulten bases de datos administrativas, gracias al entrenamiento específico en tool calling sobre diálogos del dominio.
- Enrutamiento de consultas médicas: la model card indica que las preguntas médicas deben derivarse al médico tratante o a la línea 1450; el adaptador puede clasificar la consulta y emitir la llamada de derivación correspondiente.
- Asistente telefónico o de chat para servicios sociales: integrado en un backend que expone funciones de consulta de expedientes, el adaptador genera las llamadas con argumentos estructurados y trunca las salidas a 250 caracteres para mantener el contexto manejable.
- Prototipado rápido de asistentes administrativos: al ser un adaptador LoRA de 0,7 GB sobre un modelo base público, permite experimentar con ajuste de dominio sin desplegar un modelo completo adicional.
- Clasificación de "situaciones" en flujos de triaje: el dataset incluye situaciones, por lo que el adaptador puede usarse para decidir qué herramienta o departamento corresponde a cada caso descrito por el usuario.
- Investigación sobre SFT y tool calling en dominios regulados: sirve como punto de partida reproducible (licencia Apache 2.0) para estudiar el ajuste de bajo rango en tareas de llamadas a funciones con restricciones de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de evaluación (0,03589601069688797) e indica que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,7 GB, pero requiere cargar el modelo base Qwen3-8B para la inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 16 GB; en cuantización de 8 bits: unos 8-9 GB; en 4 bits: unos 5-6 GB (estimaciones estándar para un modelo de 8B, no confirmadas para este adaptador).
- GPU recomendadas: A100 o H100 para despliegue en FP16 con concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 o GPUs de 12-16 GB con cuantización.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits; en FP16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: PEFT con Transformers, vLLM (con soporte LoRA), TGI y llama.cpp/Ollama si se convierte el adaptador a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SV-Lotse-Qwen3-8B-SFT | Adaptador LoRA sobre 8B | no disponible | Tool calling en dominio de prestaciones | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen3-8B (base) | 8B | no disponible en esta ficha | Modelo generalista con modo thinking | Apache 2.0 | Hugging Face |
| Adaptadores LoRA genéricos para tool calling sobre Qwen3 | Variable | Heredado del base | Tool calling generalista | Variable | Hugging Face |

La comparación con alternativas concretas no puede completarse con datos verificables: no se dispone de métricas de rendimiento del adaptador ni de adaptadores comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- La model card reconoce que la evaluación completa y la documentación están pendientes; no hay evidencia publicada de calidad o robustez.
- Cero descargas y cero valoraciones en Hugging Face: sin validación por parte de la comunidad.
- Dominio muy restringido (prestaciones administrativas, posiblemente Austria), con riesgo de degradación fuera de ese ámbito.
- La recomendación de truncar las salidas de herramientas a 250 caracteres limita la cantidad de información que el modelo puede procesar por llamada.
- Riesgo de alucinación en respuestas administrativas, médicas o legales; la propia model card advierte que no constituye asesoramiento médico, legal ni financiero.
- Sesgos: no documentados; al entrenarse sobre un dataset específico, puede heredar sesgos de composición y de idioma de dicho dataset.
- Idiomas soportados no declarados; el uso fuera del idioma del dataset de entrenamiento no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B y el dataset pueden tener condiciones adicionales que deben revisarse.
- No apto para producción sin evaluación propia: la pérdida de evaluación reportada no sustituye a métricas de tarea.

## Enlaces

- [Hugging Face: JulianAT/sv-lotse-qwen3-8b-sft](https://huggingface.co/JulianAT/sv-lotse-qwen3-8b-sft)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Dataset: JulianAT/at-benefits](https://huggingface.co/datasets/JulianAT/at-benefits)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
