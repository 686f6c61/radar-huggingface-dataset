# LucyAI886/MiniMax-M3.1-Flash-abliterated-GGUF

## Resumen

MiniMax-M3.1-Flash-abliterated-GGUF es una compilación en formato GGUF del modelo MiniMax-M3.1-Flash de MiniMax, publicada por el usuario LucyAI886. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 426.186.392.064 parámetros totales, 128 expertos enrutados con activación top-4 y un experto compartido, que emplea MiniMax Sparse Attention en las 60 capas y ofrece una ventana de contexto de 1 millón de tokens. El modelo base fue entrenado con conciencia de cuantización en NVFP4 (4 bits).

La particularidad de esta publicación es doble. Por un lado, es una versión "abliterated": la dirección de rechazo se ha ortogonalizado fuera de todas las matrices que escriben en el flujo residual, lo que reduce sustancialmente la alineación de seguridad del modelo original y hace que cumpla con solicitudes que el modelo base rechazaría. Por otro, la cuantización se ha diseñado para caber en una máquina de 128 GB de RAM, con un build único (`Mix-128G`) de 111,9 GB en memoria y 1,98 bits por peso, cuando el GGUF público más pequeño de este modelo hasta la fecha era de 129 GB.

Es relevante ahora porque permite ejecutar localmente un MoE de 426B parámetros en hardware de gama alta de consumo o estaciones de trabajo con 128 GB, mediante llama.cpp, a costa de una pérdida medible de calidad (perplejidad un 34 % superior al original y una tasa de coincidencia top-1 del 67 %). La asignación de precisión por grupo de capas de expertos se derivó de divergencia KL medida, no de una regla fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con MiniMax Sparse Attention en las 60 capas |
| Parametros totales | 426.186.392.064 |
| Parametros activos | no disponible (128 expertos enrutados, top-4, mas 1 experto compartido) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | GGUF mixta de 1,98 bpw (build `Mix-128G`); modelo base entrenado con QAT en NVFP4 (4 bits) |
| Idiomas soportados | en, zh |
| Licencia | minimax-community-license (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 128 expertos enrutados y activación top-4, más un experto compartido, sobre 60 capas que aplican MiniMax Sparse Attention. Los expertos enrutados concentran el 97 % de los pesos, y por eso la cuantización se concentró ahí: cada grupo de capas de expertos recibió su propia precisión a partir de divergencia KL medida, en lugar de una regla manual uniforme. El modelo original fue entrenado con conciencia de cuantización en NVFP4 (4 bits), lo que según el autor implica que bajar de 2 bits resulta especialmente costoso en calidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La modificación "abliterated" consiste en ortogonalizar la dirección de rechazo fuera de toda matriz que escribe en el flujo residual, lo que elimina en gran medida el comportamiento de negativa aprendido durante la alineación. El resultado es un único build GGUF (`Mix-128G`) de 111,9 GB en memoria y 111,9 GB de descarga, con 1,98 bpw, KLD de 1,061 frente al GGUF sin pérdida del mismo checkpoint, top-1 del 67,0 % y perplejidad un 34 % superior al original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento multi-paso (etiqueta `reasoning` en el repo).
- Procesamiento de contexto muy largo, hasta 1 millón de tokens, gracias a MiniMax Sparse Attention.
- Ejecución local mediante llama.cpp, sin dependencia de API.
- Comportamiento sin rechazo (uncensored): responde a solicitudes que el modelo base rechazaría, lo que lo hace apto para investigación de mecanismos de rechazo y red-teaming.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, visión, audio ni modo "thinking" separado.

## Casos de uso

- Investigación de interpretabilidad y mecanismos de rechazo: comparar las respuestas del modelo abliterated con las del MiniMax-M3.1-Flash original permite aislar qué circuitos implementan la negativa y cómo se distribuyen por capas.
- Red-teaming y evaluación de robustez: usar el modelo como generador de ataques y casos adversarios controlados en un entorno de laboratorio, dado que su alineación reducida facilita obtener contenido que los modelos alineados bloquean.
- Estudio de cuantización extrema en MoE: el build de 1,98 bpw con asignación de precisión por divergencia KL sirve como caso de referencia para medir el impacto de la cuantización mixta en modelos de 426B parámetros.
- Despliegue local de un MoE grande en una sola máquina de 128 GB: útil para prototipos y pruebas de concepto que requieren un modelo de gran capacidad sin depender de servicios en la nube.
- Procesamiento de documentos extensos en inglés o chino: la ventana de 1M tokens permite ingerir libros, expedientes o bases de código completas en una sola pasada.
- Experimentación con hardware de gama alta: validar el rendimiento de llama.cpp con modelos MoE de este tamaño en Mac de 128 GB, PC con 128 GB de RAM o GPUs con ~120 GB de VRAM agregada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de la cuantización frente al GGUF sin pérdida del mismo checkpoint:

| Metrica | Mix-128G |
|---|---|
| Memoria en uso | 111,9 GB |
| Descarga | 111,9 GB |
| Bits por peso | 1,98 bpw |
| KLD (menor es mejor) | 1,061 |
| Top-1 (mayor es mejor) | 67,0 % |
| Perplejidad vs. original | +34 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 111,9 GB para el build `Mix-128G`; el autor indica que encaja en una máquina de 128 GB.
- Configuraciones válidas: Mac de 128 GB de memoria unificada, PC con 128 GB de RAM ejecutando en CPU, o GPUs con aproximadamente 120 GB de VRAM en total.
- GPU recomendadas: no se especifican modelos concretos; por capacidad, configuraciones multi-GPU con ~120 GB agregados (por ejemplo, varias A100/H100 o RTX 4090) o Mac con memoria unificada de 128 GB.
- Cabe en GPU de consumo: no en una sola; requiere agregación de varias GPUs o memoria unificada.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF); el autor menciona compatibilidad con endpoints y con Orca Connect para exponer el equipo local tras una API compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-abliterated `Mix-128G` (este) | 426B (MoE, top-4) | 1M | GGUF, 111,9 GB, 1,98 bpw | minimax-community-license | Sin alineación de rechazo; perplejidad +34 % |
| MiniMax-M3.1-Flash (original) | 426B (MoE, top-4) | 1M | safetensors / GGUF sin pérdida | minimax-community-license | Modelo base alineado; referencia de calidad |
| Otros GGUF públicos de MiniMax-M3.1-Flash | 426B (MoE, top-4) | 1M | GGUF, desde 129 GB | minimax-community-license | Requieren más de 128 GB de memoria |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Alineación de seguridad sustancialmente reducida: el modelo cumplirá muchas solicitudes dañinas, poco éticas, ofensivas o ilegales que el original rechazaría. No debe desplegarse sin capas propias de moderación y prevención de abuso.
- Uso previsto estrictamente de investigación: interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red-teaming y evaluación de robustez.
- Pérdida de calidad medible: perplejidad un 34 % superior y solo un 67 % de coincidencia top-1 con el original; no es equivalente al modelo de precisión completa.
- Cuantización muy agresiva (1,98 bpw): el modelo base fue entrenado con QAT en NVFP4 y el autor advierte que bajar de 2 bits degrada especialmente el rendimiento.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación no cuantificado en la información disponible; la cuantización extrema puede agravarlo.
- Restricciones de licencia: hereda la MiniMax Community License, incluido su apéndice de usos prohibidos; debe revisarse antes de cualquier uso comercial.
- Sesgos: no documentados en la información disponible.
- Los autores declinan toda responsabilidad por el mal uso y las salidas no reflejan las opiniones de los cargadores ni de MiniMax.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LucyAI886/MiniMax-M3.1-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Build Mix-128G: https://huggingface.co/LucyAI886/MiniMax-M3.1-Flash-abliterated-GGUF/tree/main/Mix-128G
- Licencia: https://huggingface.co/LucyAI886/MiniMax-M3.1-Flash-abliterated-GGUF/blob/main/LICENSE
- OrcaRouter: https://www.orcarouter.ai
- OrcaCyber MiniMax-M3.1-Flash (API alojada): https://www.orcarouter.ai/models/orca/orcacyber-minimax-m3.1-flash
- Orca Connect: https://www.orcarouter.ai/solutions/orca-connect
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
