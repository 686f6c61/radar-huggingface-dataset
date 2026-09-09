# Prannesshkva/ISOM-R1-Coder-16B-MoE

## Resumen
ISOM-R1-Coder-16B-MoE es un modelo de generación de código de 16.000 millones de parámetros, desarrollado de forma independiente por Prannesshkva sobre la arquitectura de DeepSeek-Coder-V2-Lite-Instruct. Se trata de un modelo Mixture-of-Experts (MoE) con 64 expertos enrutados (2 compartidos, TopK=6 activos) y Multi-Head Latent Attention (MLA). Su característica principal es la incorporación del método ISOM (Isometric Memory Bounding), que proyecta los estados de clave-valor en una variedad isométrica continua mediante operadores de Cayley SO(d) para limitar el consumo de memoria en contextos muy largos.

El modelo está diseñado para trabajar con ventanas de contexto de hasta 163.840 tokens (160K), manteniendo un estado de memoria acotada de complejidad O(1) a partir de un umbral de razonamiento de 16.384 tokens. No está respaldado ni financiado por DeepSeek; es un trabajo derivado bajo la licencia del modelo DeepSeek. Su relevancia actual radica en la creciente necesidad de analizar repositorios de código completos y generar código con comprensión a nivel de proyecto.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Head Latent Attention (MLA) + Mixture-of-Experts (64 expertos enrutados, 2 compartidos, TopK=6) |
| Parametros totales | 15.706.484.224 (~15,71B) |
| Parametros activos | 2,36B |
| Longitud de contexto | 163.840 tokens (160K) |
| Tipos de cuantizacion | BFloat16 / Float16 (nativo); 4-bit AWQ y bitsandbytes (gama de consumo) |
| Idiomas soportados | Inglés, chino |
| Licencia | DeepSeek Model License (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte del checkpoint DeepSeek-Coder-V2-Lite-Instruct y no se han publicado detalles sobre el proceso de entrenamiento (dataset, tokens, técnicas como RLHF o DPO). La arquitectura mantiene el núcleo de DeepSeek-Coder-V2-Lite (MLA + MoE) y añade la capa ISOM. En lugar de almacenar la caché KV completa para toda la secuencia, ISOM proyecta los estados históricos que superan el umbral B=16.384 tokens en una variedad isométrica de dimensión fija, implementada con precisión Float64 y operadores de Cayley SO(d).

Esta proyección reduce la complejidad de memoria de lineal a O(1) a partir del umbral, con un coste teórico de 3,62 GB en FP16 y 1,81 GB en INT8 para el estado latente, independientemente de si la secuencia es de 32K o 160K tokens. La implementación es una especificación arquitectónica del autor, no una verificación independiente.

## Capacidades
- Generación de código a nivel de repositorio (repo-level) gracias a la ventana de contexto de 160K tokens.
- Razonamiento deliberativo: el modelo incorpora un modo de razonamiento extendido (deliberative reasoning) que permite validar soluciones antes de dar la respuesta final.
- Comprensión de contexto largo con memoria acotada: la atención es constante en memoria a partir de 16.384 tokens, lo que permite manejar secuencias largas sin crecimiento lineal del estado KV.
- Procesamiento conversacional en inglés y chino.
- Eficiencia MoE: solo 2,36B parámetros activos por token de un total de 15,71B, lo que reduce el coste computacional en cada paso.
- Soporte de tool calling: no especificado en la información disponible.

## Casos de uso
- Análisis de repositorios completos: el modelo puede leer un proyecto de código entero (hasta 160K tokens) y responder preguntas sobre su estructura, dependencias o flujo, útil para el onboarding de nuevos desarrolladores.
- Refactorización de código legacy: con el contexto del proyecto, puede proponer refactorizaciones coherentes con el estilo y las dependencias existentes.
- Generación de documentación automática: a partir de un codebase completo, puede generar documentación de APIs, explicaciones de módulos y diagramas de flujo.
- Asistente de programación en IDE: al tener una ventana de 160K, puede mantener el contexto de todos los archivos abiertos, mejorando la precisión del autocompletado y de las sugerencias.
- Revisión de cambios (code review): puede analizar un diff dentro del contexto del repositorio para detectar posibles bugs, incumplimiento de estándares o problemas de rendimiento.
- Generación de pruebas unitarias: puede entender el funcionamiento de funciones en el contexto de todo el proyecto y generar casos de prueba coherentes.
- Búsqueda semántica de código: al manejar representaciones de contexto largo, puede localizar patrones o fragmentos de código en los idiomas soportados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Repositorio safetensors: 31,4 GB de pesos en BF16/FP16.
- La ejecución en precisión nativa requiere al menos 32 GB de VRAM (A100 40/80 GB, H100 80 GB) o configuraciones multi-GPU.
- El autor indica como objetivo hardware para este modelo "16GB Cloud / Multi-GPU", lo que sugiere que también puede ejecutarse en una GPU de 16 GB con cuantización 4-bit (AWQ o bitsandbytes).
- La cuantización 4-bit reduce el peso total a aproximadamente un cuarto del tamaño en BF16, lo que permite ejecución en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB) con margen suficiente para el contexto largo.
- El estado KV ISOM es fijo: 3,62 GB en FP16 (o 1,81 GB en INT8) para secuencias de 32K a 160K, lo que facilita el despliegue en GPUs de gama media.
- Opciones de despliegue: el formato safetensors es compatible con vLLM, llama.cpp, TGI y Ollama, aunque no se especifican herramientas concretas en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
Se incluye la tabla de comparación interna de la misma familia ISOM proporcionada por el autor. No se dispone de datos de rendimiento comparativo con modelos de otras familias.

| Modelo | Total / Activos | Contexto máximo | Complejidad de caché | Hardware objetivo |
|---|---|---|---|---|
| ISOM-R1-Coder-16B-MoE | 15,71B / 2,36B | 163.840 (160K) | O(1) acotado (especificación) | 16 GB cloud / multi-GPU |
| ISOM-R1-Enterprise-40B | 40,0B denso | 32.768 (32K) | O(1) acotado (especificación) | Enterprise multi-GPU (24-80 GB) |
| ISOM-R1-Coder-1.5B-Instruct | 1,54B denso | 131.072 (128K) | O(1) acotado (Tesla T4 verificado) | 8 GB portátiles / edge |
| ISOM-R1-Reasoning-1.5B-Instruct | 1,54B denso | 32.768 (32K) | O(1) acotado (Tesla T4 verificado) | 8 GB edge / consumer |
| ISOM-R1-Edge-130M-MoE | 134,89M / 58,27M | Recurrencia ilimitada | Estado recurrente O(1) (0,0469 MB verificado) | Ultra-bajo consumo / CPU |

## Limitaciones y advertencias
- Es un trabajo derivado independiente, no respaldado por DeepSeek; los créditos y la propiedad pertenecen al autor y el uso está sujeto a la licencia del modelo DeepSeek.
- El beneficio de memoria O(1) es una especificación arquitectónica del autor; no se ha verificado de manera independiente ni se han publicado mediciones reales.
- No se han publicado benchmarks de rendimiento, por lo que no se puede comparar con otros modelos de código en tareas como HumanEval o MMLU.
- La ventana de contexto es de 163.840 tokens, pero el razonamiento deliberativo completo solo se garantiza hasta el umbral de 16.384 tokens; más allá de ese límite, los estados se proyectan en la variedad isométrica, lo que podría degradar la precisión en tareas que requieren recuperar información muy específica de posiciones lejanas.
- Los idiomas soportados son inglés y chino; no se ha documentado soporte para otros idiomas.
- No hay información sobre sesgos conocidos ni evaluación de alucinaciones.
- El soporte de tool calling y el uso en agentes no está documentado, por lo que la integración en pipelines de CI/CD con herramientas externas requiere pruebas propias.

## Enlaces
- [HuggingFace del modelo](https://huggingface.co/Prannesshkva/ISOM-R1-Coder-16B-MoE)
- [DOI Zenodo](https://doi.org/10.5281/zenodo.22649142)
- [Licencia DeepSeek](https://github.com/deepseek-ai/DeepSeek-Coder-V2/blob/main/LICENSE-MODEL)
- [Espacio de benchmarks ISOM](https://huggingface.co/spaces/Prannesshkva/ISOM-Benchmark)
- [Perfil de LinkedIn del autor](https://www.linkedin.com/in/prannesshkva/)
