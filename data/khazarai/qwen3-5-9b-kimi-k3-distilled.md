# khazarai/Qwen3.5-9B-Kimi-k3-Distilled

## Resumen

Qwen3.5-9B-Kimi-k3-Distilled es un ajuste fino publicado por el usuario khazarai sobre el modelo base unsloth/Qwen3.5-9B. El objetivo declarado es desplazar el comportamiento del modelo hacia flujos de trabajo agénticos anclados al entorno ("grounded tool calling"): en lugar de encadenar razonamiento especulativo sobre la estructura del código, el modelo tiende a inspeccionar ficheros, ejecutar comandos y leer registros antes de concluir. El entrenamiento se plantea como una destilación de comportamiento desde Kimi K3 (moonshotai/kimi-k3), preservando la planificación de trayectorias multi-paso, la selección de herramientas y el seguimiento de estado del modelo profesor.

El modelo tiene 9.653.104.368 parámetros (unos 9,65 mil millones) en pesos safetensors, un repositorio de 19,3 GB y licencia Apache 2.0. La model card declara únicamente inglés como idioma y el pipeline image-text-to-text, aunque no se documentan capacidades de visión en el texto de la ficha. El contexto máximo no se especifica.

Su relevancia es fundamentalmente práctica: es un modelo de ~9B orientado a bucles build-test-fix, depuración tipo SWE-bench y automatización de shell, pensado explícitamente como base o modelo de control para SFT y destilación sobre datasets agénticos. En el momento de la consulta el repositorio acumula 0 descargas y 1 like, y fue creado y actualizado el 16 de septiembre de 2026, por lo que se trata de una publicación muy reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3.5; detalle exacto no disponible |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | unsloth/Qwen3.5-9B (fine-tune) |
| Dataset de entrenamiento | greghavens/kimi-k3-coding-and-debugging-traces |
| Profesor de destilación | Kimi K3 (moonshotai/kimi-k3) |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 19,3 GB |
| Descargas / likes | 0 / 1 |
| Fecha de publicación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que deriva de Qwen3.5-9B y que no se declara ningún componente MoE, SSM ni híbrido. El entrenamiento se describe como una destilación que preserva comportamiento ("behaviour-preserving distillation") a partir de trayectorias de Kimi K3, con especial énfasis en planificación multi-paso, selección de herramientas, seguimiento de estado y autoverificación. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento posteriores.

La distribución de tareas de las trayectorias se centra en integración estructural de herramientas más que en QA estático: exploración de entorno e inspección de ficheros (ls, grep, cat, navegación de repositorios), manejo iterativo de errores, correcciones guiadas por tests y encadenamiento multi-herramienta con serialización de argumentos. Los lenguajes presentes en las trayectorias de entrenamiento son Python, TypeScript, Go, Bash, C, C#, Java, C++, Ruby, Assembly, PowerShell, Rust, inglés y texto técnico plano sin clasificar ("unknown"). El modelo soporta esquemas de herramientas estructurados y ejecución paralela de herramientas cuando el arnés del agente lo requiere.

## Capacidades

- Generación de texto conversacional y razonamiento orientado a la acción, con preferencia por verificar el entorno antes de hipotetizar.
- Llamada a herramientas (tool calling / function calling) con esquemas estructurados y serialización de argumentos.
- Ejecución paralela de herramientas cuando el arnés lo permite.
- Planificación de trayectorias agénticas multi-paso con seguimiento de estado y autoverificación.
- Resiliencia en bucles: especializado en ciclos build-test-fix y finalización de tareas guiada por verificación.
- Automatización de shell y CLI: ejecución de comandos bash, exploración de repositorios, lectura de logs.
- Depuración de código y corrección de errores en contextos multi-lenguaje (Python, TypeScript, Go, Rust, Java, C/C++, C#, Ruby, Bash, PowerShell, Assembly).
- Capacidades multilingües: no disponible; la model card declara únicamente inglés, aunque los lenguajes de programación de las trayectorias son múltiples.
- Capacidades de visión: el pipeline se declara como image-text-to-text, pero la ficha no documenta ninguna capacidad de imagen; no disponible.

## Casos de uso

- Depuración de scripts de despliegue: ante un fallo en un script de release, el modelo lanza primero acciones de inspección (ls -la, cat release.sh) y solo después propone la corrección, lo que reduce las hipótesis erróneas sobre el contenido real del workspace.
- Agentes de reparación de errores en CI/CD: integrado en un pipeline, puede leer los logs del job fallido, localizar el test que rompe y proponer un parche verificable mediante reejecución.
- Automatización de tareas de shell en entornos de administración: ejecución de comandos, exploración de directorios, filtrado con grep y lectura de ficheros de configuración como parte de una secuencia de operaciones encadenadas.
- Exploración y comprensión de bases de código desconocidas: navegación de repositorios, localización de definiciones y reconstrucción del flujo de llamadas mediante herramientas en lugar de inferencia especulativa.
- Modelo base o de control para SFT y destilación: sirve como referencia en experimentos sobre datasets agénticos, ya que su comportamiento de llamada a herramientas es más consistente que el del modelo base.
- Generación de código asistida en producción: al soportar tool calling estructurado, puede conectarse a linters, compiladores o ejecutores de tests para validar el código generado antes de entregarlo.
- Agentes de operaciones sobre infraestructura: lectura de estado, consulta de servicios y ejecución de comandos de diagnóstico en tareas de troubleshooting paso a paso.
- Análisis de trayectorias agénticas: útil para estudiar planificación de largo horizonte, selección de herramientas y recuperación de errores en investigación sobre agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente una comparación cualitativa entre el modelo base y el destilado, sin cifras:

| Modelo | Tasa de llamada a herramienta anclada | Tasa de alucinación especulativa | Eficiencia de finalización de tarea |
|---|---|---|---|
| Qwen3.5-9B (base) | Baja (tiende a adivinar) | Alta (cadenas largas de hipótesis) | Subóptima en bucles agénticos |
| Qwen3.5-9B-Kimi-k3-Distilled | Alta (ejecución inmediata) | Baja (razonamiento guiado por acciones) | Alta (convergencia rápida) |

Esta tabla procede de evaluaciones internas del autor y no incluye métricas numéricas ni metodología reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia de los 9,65 B parámetros: en BF16/FP16 los pesos solos ocupan aproximadamente 19,3 GB (coincide con el tamaño del repositorio), más caché KV y activaciones, por lo que se recomienda un entorno de 24 GB o superior.
- En cuantización INT8 se estiman unos 9,7 GB de pesos, con un total práctico en torno a 12-14 GB.
- En cuantización INT4 se estiman unos 4,8 GB de pesos, con un total práctico en torno a 7-9 GB.
- Estas cifras son estimaciones derivadas del número de parámetros: el repositorio no publica variantes cuantizadas, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: A100 40 GB o H100 80 GB para BF16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto moderado o INT8/INT4 con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y tarjetas con 24 GB o más, especialmente en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta text-generation-inference en el repositorio); vLLM y llama.cpp/Ollama serían viables en principio, pero requieren verificar el soporte de la arquitectura Qwen3.5 y, en el caso de llama.cpp/Ollama, convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponible. El autor no publica mediciones de rendimiento.
- Advertencia operativa: el modelo está entrenado para ejecutar comandos de shell y código, por lo que cualquier despliegue debe hacerse con aislamiento por sandbox.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Kimi-k3-Distilled (khazarai) | 9,65 B | No disponible | Destilado agéntico de Kimi K3, tool calling anclado | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3.5-9B (unsloth, modelo base) | No disponible (el fine-tune publica 9,65 B) | No disponible | Modelo base multimodal declarado (image-text-to-text) | No disponible en la información proporcionada | HuggingFace |
| Kimi K3 (moonshotai, profesor) | No disponible | No disponible | Modelo de razonamiento y agente origen de las trayectorias | No disponible en la información proporcionada | HuggingFace |

No se dispone de datos de benchmarks, contexto ni licencia de los modelos comparados más allá de lo indicado, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Ejecución de código y comandos: el modelo está entrenado para invocar shell y ejecutar código, por lo que desplegarlo sin aislamiento por sandbox supone un riesgo de seguridad directo.
- Sesgos conocidos: no disponible. El autor no documenta evaluaciones de sesgo.
- Riesgo de alucinación: la model card afirma que el modelo reduce el razonamiento especulativo no anclado, pero no aporta métricas; el riesgo de alucinación no está cuantificado y persiste en tareas sin retroalimentación del entorno.
- Limitaciones de idioma: solo se declara inglés. No hay evidencia de calidad en castellano ni en otros idiomas naturales, aunque las trayectorias cubren múltiples lenguajes de programación.
- Longitud de contexto: no especificada, lo que impide planificar cargas con repositorios o logs extensos sin pruebas previas.
- Rendimiento fuera de dominio: la propia ficha sitúa fuera de alcance la escritura creativa larga y cualquier tarea sin retroalimentación estricta del entorno.
- Transferencia de la destilación: al tratarse de una destilación de comportamiento desde un modelo profesor, no se garantiza que se conserven todas las capacidades del profesor ni del modelo base original.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base unsloth/Qwen3.5-9B y del dataset de trayectorias antes de un despliegue en producción.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin validación independiente ni resultados reproducibles de terceros.
- Discrepancia de metadatos: el pipeline declarado es image-text-to-text, pero la ficha no describe capacidades de visión; conviene verificarlo antes de asumir soporte multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khazarai/Qwen3.5-9B-Kimi-k3-Distilled
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/greghavens/kimi-k3-coding-and-debugging-traces
- Modelo profesor mencionado en la ficha: https://huggingface.co/moonshotai/kimi-k3
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y a la comunidad Zhihu, sin relación con el modelo.
