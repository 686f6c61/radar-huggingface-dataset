# CybroatriX/Shanks-v1-GGUF

## Resumen

Shanks v1 Uncensored es un modelo de lenguaje de 7.615.616.512 parámetros derivado de thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored, a su vez basado en la familia Qwen2.5-Coder de Alibaba. Lo publica el usuario CybroatriX (creador citado como whynotshanks) dentro de un ecosistema denominado Cybroatrix, y se distribuye exclusivamente en formato GGUF cuantizado para inferencia local. Su propuesta es un modelo orientado a ciberseguridad, ingeniería de exploits, ingeniería inversa y programación de sistemas de bajo nivel, sin los filtros de seguridad habituales del modelo original.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5-Coder-7B, con 7.6 mil millones de parámetros y una ventana de contexto heredada de la familia Qwen2.5 (no confirmada explícitamente en la model card). La única cuantización publicada es Q4_K_M, de 4,68 GB, pensada para ejecutarse con unos 5,5 GB de VRAM, lo que lo sitúa al alcance de GPUs de consumo. El repositorio ocupa 4,7 GB e incluye además un Modelfile de Ollama con la persona embebida y formato ChatML.

Su relevancia es acotada pero clara: cubre un nicho concreto (herramientas de análisis ofensivo y reversing sin rechazos por contenido) y ofrece un formato de despliegue inmediato en Ollama. No obstante, el modelo tiene cero descargas y un solo like en el momento de la consulta, no publica benchmarks y su model card es muy escueta, por lo que debe tratarse como un artefacto experimental más que como una opción validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no confirmada en la model card; la familia Qwen2.5-Coder soporta hasta 32.768 tokens, dato no verificado para este derivado) |
| Tipos de cuantizacion | Q4_K_M (única publicada, 4,68 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento ni el ajuste fino aplicado sobre thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored. Por herencia, la base es un transformer decoder-only de Qwen2.5-Coder con 7.615.616.512 parámetros, atención por causalidad estándar y el tokenizador de Qwen2.5. El único dato técnico explícito es el formato de chat: ChatML, según el Modelfile de Ollama incluido en el repositorio.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La única cuantización disponible es Q4_K_M, que el autor describe como un equilibrio entre velocidad, uso reducido de VRAM y pérdida mínima de perplejidad, sin aportar métricas que lo respalden.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML.
- Generación y asistencia en código, con especial énfasis declarado en programación de sistemas y bajo nivel.
- Contenido de ciberseguridad sin filtros: el autor lo etiqueta como "100% uncensored" y orientado a ingeniería de exploits y ingeniería inversa.
- Persona embebida en el Modelfile de Ollama, lo que fija un estilo de respuesta predefinido al desplegarlo con ese archivo.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para servir el modelo mediante infraestructura de inferencia estándar.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no documentado en la model card).
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Análisis de vulnerabilidades en laboratorio: el modelo puede redactar y explicar pruebas de concepto de exploits en un entorno controlado, gracias a su ajuste sin filtros sobre una base de código.
- Ingeniería inversa de binarios: útil para generar scripts de análisis, comentar pseudocódigo descompilado y proponer hipótesis sobre estructuras de datos en ejecutables.
- Programación de sistemas en C, Rust o ensamblador: asistencia en la escritura de código de bajo nivel, manejo de memoria y depuración de errores de segmentación.
- Formación en seguridad ofensiva: generación de ejercicios, explicaciones de técnicas y material didáctico para entornos de CTF o cursos internos, sin los rechazos habituales de modelos alineados.
- Automatización de tareas de pentesting: integración en scripts que requieran generación de payloads o análisis de resultados, siempre dentro de un alcance autorizado.
- Despliegue local en estaciones de trabajo: con Q4_K_M y unos 5,5 GB de VRAM, puede ejecutarse en un portátil con GPU de consumo para tareas de análisis que no deban salir de la máquina.
- Prototipado rápido con Ollama: el Modelfile incluido permite crear y ejecutar el modelo con dos comandos, lo que facilita pruebas de concepto en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad para la cuantización Q4_K_M, y el autor no aporta comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,5 GB para la cuantización Q4_K_M, según el propio autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 cubren el modelo con holgura; una RTX 4060 de 8 GB también debería ser suficiente para Q4_K_M.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM.
- Opciones de despliegue: Ollama (soporte oficial mediante el Modelfile incluido), llama.cpp y cualquier runtime compatible con GGUF (LM Studio, KoboldCpp, etc.). vLLM y TGI no están confirmados para este repositorio GGUF concreto.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización publicada | Licencia | Enfoque |
|---|---|---|---|---|---|
| Shanks v1 Uncensored (este) | 7,6 B | No disponible | Q4_K_M | Apache 2.0 | Ciberseguridad y código sin filtros |
| Qwen2.5-Coder-7B-Instruct (Alibaba) | 7,6 B | 32.768 tokens (familia) | Múltiples (GGUF, AWQ, GPTQ) | Apache 2.0 | Código general con alineamiento |
| thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored | 7,6 B | No disponible | No disponible | No disponible | Base sin censura de este modelo |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128 K | Múltiples | Licencia propia | Código y razonamiento |

La comparación con Qwen2.5-Coder-7B-Instruct es la más directa: mismo tamaño y licencia, pero el original mantiene filtros de seguridad y una documentación exhaustiva de benchmarks, mientras que Shanks v1 sacrifica esa trazabilidad a cambio de respuestas sin rechazos. Frente a DeepSeek-Coder-V2-Lite, Shanks v1 es más pequeño y ligero, pero carece de contexto largo documentado y de datos de rendimiento publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay forma de verificar la calidad del ajuste ni la degradación introducida por la cuantización Q4_K_M.
- Riesgo elevado de alucinación en contenido técnico de seguridad: sin datos de evaluación, las respuestas sobre exploits o vulnerabilidades pueden ser plausibles pero incorrectas.
- Modelo "uncensored": puede generar contenido ofensivo, código malicioso o instrucciones peligrosas. Su uso debe limitarse a entornos autorizados y con supervisión.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto no confirmado: la model card no especifica la longitud de ventana, lo que impide planificar tareas de contexto largo con garantías.
- Madurez: cero descargas y un solo like en el momento de la consulta; sin mantenimiento ni comunidad demostrables.
- Licencia Apache 2.0 heredada, que permite uso comercial, pero el autor no aclara si el ajuste introduce restricciones adicionales sobre el contenido generado.
- Una sola cuantización disponible (Q4_K_M), lo que limita el ajuste fino entre calidad y recursos.
- El modelo base intermedio (thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored) no documenta su proceso de entrenamiento, por lo que se desconoce qué datos se usaron para eliminar los filtros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CybroatriX/Shanks-v1-GGUF
- Modelo base: https://huggingface.co/thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored
- Familia original Qwen2.5-Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de Ollama (runtime recomendado): https://github.com/ollama/ollama
- llama.cpp (runtime GGUF alternativo): https://github.com/ggml-org/llama.cpp
