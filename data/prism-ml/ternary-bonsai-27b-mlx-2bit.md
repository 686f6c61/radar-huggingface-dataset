# prism-ml/Ternary-Bonsai-27B-mlx-2bit

## Resumen

Ternary-Bonsai-27B-mlx-2bit es un modelo de lenguaje multimodal desarrollado por Prism ML, derivado del Qwen3.6-27B y cuantizado de extremo a extremo con pesos ternarios (valores en {-1, 0, +1}) en lugar de los habituales FP16 o BF16. El objetivo es mantener la capacidad de razonamiento de un modelo de 27 000 millones de parámetros en un espacio desplegado de aproximadamente 7,2 GB, lo que permite ejecutarlo en portátiles convencionales, una única GPU de consumo o incluso dispositivos móviles. Según el autor, retiene el 95 % de la inteligencia del modelo original en FP16, con una media de 80,49 en 15 benchmarks de modo razonamiento, superando a las cuantizaciones convencionales de 2 bits como IQ2_XXS (72,73).

El modelo combina una arquitectura de atención híbrida (~75 % lineal, ~25 % completa) heredada de Qwen3.6-27B, lo que permite mantener una ventana de contexto de 262 000 tokens en dispositivos con memoria limitada. Incluye además una torre de visión en cuantización HQQ de 4 bits, soporte para tool calling y un drafter de decodificación especulativa (DSpark) que acelera la decodificación 1,34x en CUDA. Su licencia Apache 2.0 facilita el uso comercial y la integración en productos. La relevancia actual reside en la tendencia hacia la inferencia local y eficiente, donde modelos de esta clase pueden ejecutarse sin infraestructura en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atención híbrida (~75 % lineal / ~25 % completa), SwiGLU MLP, RoPE, RMSNorm, 64 bloques |
| Parametros totales | ~27,3 B (pesos ternarios del lenguaje: ~24,8 B backbone + ~2,5 B embedding/LM head) + ~0,46 B torre de visión. El archivo safetensors del repositorio muestra 2 564 418 800 parámetros, posiblemente una parte del modelo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Ternario g128 (1,71 bits/peso, empaquetado en 2 bits para kernels acelerados), visión HQQ 4-bit, KV cache 4-bit |
| Idiomas soportados | No disponibles (derivado de Qwen3.6-27B, presumiblemente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); kernels CUDA y llama.cpp disponibles en forks del autor |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.6-27B sin cambios estructurales: un transformer causal de atención híbrida en el que aproximadamente el 75 % de las capas usan atención lineal y el 25 % restante atención completa, lo que reduce el coste de la KV cache y permite ventanas de contexto muy largas (262 K) con memoria limitada. Las proyecciones de atención, MLP, embeddings y la cabeza de lenguaje se cuantizan a valores ternarios {-1, 0, +1} con un factor de escala FP16 compartido por cada grupo de 128 pesos (formato g128), resultando en 1,71 bits por peso reales. La torre de visión se cuantiza por separado en HQQ de 4 bits y solo se carga cuando hay entrada de imagen.

El entrenamiento consistió en la cuantización del modelo base Qwen3.6-27B, sin reentrenamiento desde cero. No se especifican datos de entrenamiento, número de tokens ni uso de RLHF o DPO en la información disponible. Las innovaciones técnicas incluyen kernels personalizados de atención híbrida de 2 bits para Apple MLX (Python y Swift) y CUDA, que consumen los pesos empaquetados directamente sin expandirlos a FP16, y un drafter de decodificación especulativa (DSpark) entrenado contra el propio modelo ternario, que proporciona una aceleración de decodificación 1,34x en el servidor CUDA sin pérdida de calidad.

## Capacidades

- Generación de texto y razonamiento en modo pensamiento (thinking mode), conservando el comportamiento reflexivo del modelo base incluso en el régimen sub-4 bits.
- Razonamiento matemático: 93,40 en el benchmark de matemáticas del autor, a dos puntos del modelo FP16.
- Generación de código: 85,96 en el benchmark de coding del autor.
- Uso agéntico de herramientas (tool calling): 74,01 en el benchmark de agentic tool use.
- Capacidades multimodales de visión: acepta entrada de imagen junto con texto mediante la torre de visión HQQ 4-bit; obtiene 65,19 en el benchmark de visión del autor.
- Contexto largo de 262 000 tokens, viable en dispositivos gracias a la atención lineal mayoritaria y la cuantización de KV cache a 4 bits.
- Soporte para decodificación especulativa con el drafter DSpark, que acelera la generación sin pérdida de calidad.
- Multilingüe presumiblemente, al derivar de Qwen3.6-27B, aunque no se han publicado los idiomas concretos.

## Casos de uso

- Asistentes conversacionales locales: con 262 K de contexto y un tamaño de 7,2 GB, puede gestionar conversaciones de larga duración con historial completo en un portátil o una estación de trabajo sin conexión a la nube.
- Análisis de documentos extensos: la ventana de 262 K tokens permite procesar manuales, contratos o informes técnicos completos en una sola pasada, con la opción de incluir imágenes escaneadas gracias a la torre de visión.
- Razonamiento matemático y científico en entornos sin GPU dedicada: el rendimiento de 93,40 en matemáticas, cercano al FP16, lo hace útil para resolución de problemas, verificación de demostraciones y tutoría asistida.
- Generación de código en entornos de desarrollo embebidos o de bajos recursos: el soporte de tool calling y el rendimiento de 85,96 en coding permiten integrarlo en IDEs o pipelines de CI/CD que se ejecutan en hardware modesto.
- Agentes autónomos en el edge: la capacidad de agentic tool use (74,01) y la ejecución local lo convierten en candidato para agentes de automatización en dispositivos IoT, robots o sistemas de control sin latencia de red.
- Despliegue en dispositivos móviles: aunque la versión de 1 bit está pensada para teléfonos, la variante ternaria también es ejecutable en hardware móvil de gama alta, habilitando asistentes personales con razonamiento avanzado sin conexión.
- Servicios de atención al cliente con privacidad: al ejecutarse localmente, los datos de los usuarios no salen del dispositivo, lo que cumple requisitos de privacidad y cumplimiento normativo en sectores regulados.

## Benchmarks y rendimiento

Los datos provienen del autor (model card y whitepaper) y no han sido verificados de forma independiente. La media de 15 benchmarks en modo razonamiento es 80,49, frente a 72,73 de una cuantización convencional IQ2_XXS y aproximadamente el 95 % del rendimiento FP16. Los resultados por categoría son:

| Benchmark | Bonsai 27B ternario | FP16 (referencia) | IQ2_XXS |
|---|---|---|---|
| Media 15 benchmarks (thinking mode) | 80,49 | ~84,7 (estimado al 95 %) | 72,73 |
| Matemáticas | 93,40 | no disponible (a 2 puntos del ternario) | no disponible |
| Coding | 85,96 | no disponible | no disponible |
| Agentic tool use | 74,01 | no disponible | no disponible |
| Visión | 65,19 | no disponible | no disponible |

La aceleración de decodificación con DSpark es de 1,34x en CUDA, sin pérdida de calidad (decodificación especulativa lossless). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Tamaño desplegado: aproximadamente 7,2 GB (5,9 GB en el límite teórico de 1,71 bits/peso).
- VRAM estimada: cabe en GPUs de consumo con 8-12 GB de memoria, como una RTX 4060 o superior, y en el espacio unificado de Apple Silicon (M-series con 16 GB o más).
- GPU recomendadas: Apple M5 Pro (el autor reporta ~26 tokens/s en este hardware), cualquier GPU CUDA moderna con al menos 8 GB, o hardware móvil de gama alta (la versión de 1 bit cabe en un iPhone 17 Pro Max).
- Opciones de despliegue: MLX en Apple Silicon (Python y Swift), CUDA mediante el fork de llama.cpp del autor, y el repositorio de demostración incluye ejemplos de serving y benchmarking.
- Latencia y throughput: ~26 tokens/s en Apple M5 Pro según el autor; el drafter DSpark añade un 1,34x adicional en el camino CUDA.
- Requiere los forks específicos de MLX, mlx-swift y llama.cpp publicados por Prism ML; los kernels estándar no consumen el formato ternario empaquetado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano desplegado | Rendimiento medio |
|---|---|---|---|---|---|
| Ternary-Bonsai-27B (este) | ~27,3 B + 0,46 B visión | 262 K | 1,71 bits/peso (ternario) | ~7,2 GB | 80,49 (15 benchmarks) |
| Bonsai-27B-mlx-1bit | ~27,3 B + 0,46 B visión | 262 K | 1,125 bits/peso | ~3,9 GB | no disponible |
| Qwen3.6-27B FP16 (base) | ~27 B | 262 K (presumible) | FP16 | ~54 GB | 100 % (referencia) |
| Cuantizacion convencional IQ2_XXS | ~27 B | no disponible | ~2 bits | no disponible | 72,73 |

La comparativa muestra que el formato ternario recupera más rendimiento que la cuantización binaria o las cuantizaciones convencionales de 2 bits, a costa de un mayor tamaño que la versión de 1 bit. Frente al modelo FP16, sacrifica aproximadamente un 5 % de rendimiento medio pero reduce el espacio necesario en un factor de ~9,4.

## Limitaciones y advertencias

- Pérdida de fidelidad respecto al FP16: aunque retiene el 95 % de la inteligencia media, la degradación es mayor en tareas de visión (65,19) y agentic tool use (74,01), que son las que primero colapsan en regímenes de baja precisión.
- Riesgo de alucinación y sesgos: al derivar de Qwen3.6-27B, hereda los sesgos del modelo base, que no se han documentado específicamente para esta versión.
- Idiomas no confirmados: no se ha publicado la lista de idiomas soportados; la cobertura multilingüe es una suposición razonable pero no verificada.
- Dependencia de kernels propietarios: el formato ternario empaquetado solo funciona con los forks de MLX, mlx-swift y llama.cpp del autor; las herramientas estándar no lo reconocen, lo que crea un riesgo de mantenimiento si el proyecto se abandona.
- Benchmarks no verificados de forma independiente: todos los resultados proceden del autor y pueden estar sujetos a sesgo de medición.
- La versión ternaria no cabe en teléfonos de gama media; para ese segmento el autor recomienda la variante de 1 bit, que tiene menor calidad.
- El tamaño del archivo safetensors del repositorio (2 564 418 800 parámetros) no coincide con los ~27,3 B declarados en la model card; se recomienda verificar la integridad del modelo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit
- Colección Bonsai 27B: https://huggingface.co/collections/prism-ml/bonsai-27b
- Whitepaper (PDF): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-27b-whitepaper.pdf
- Repositorio de demostración y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Documentación oficial: https://docs.prismml.com/models/bonsai-27b
- Anuncio del modelo: https://prismml.com/news/bonsai-27b
- Forks de kernels: MLX (https://github.com/PrismML-Eng/mlx), mlx-swift (https://github.com/PrismML-Eng/mlx-swift), llama.cpp (https://github.com/PrismML-Eng/llama.cpp)
- Comunidad Discord: https://discord.gg/prismml
