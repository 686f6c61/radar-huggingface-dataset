# bi0h4z4rd88/Qwen3.8-27B-Uncensored-MLX-6-bit

## Resumen

`bi0h4z4rd88/Qwen3.8-27B-Uncensored-MLX-6-bit` es una conversión a formato MLX, en cuantización de 6 bits, de un modelo de la familia Qwen3.8-27B en su variante "Uncensored", es decir, una compilación con el alineamiento de seguridad eliminado mediante técnicas de *abliteration*. El modelo base, según los repositorios de la comunidad encontrados, es un transformer denso de 27 000 millones de parámetros con atención híbrida (Gated DeltaNet lineal combinada con atención completa), torre de visión nativa, control de modo de razonamiento (*thinking*), soporte de tool calling y una cabeza MTP (*multi-token prediction*) para decodificación especulativa. El autor de esta ficha es un usuario independiente (`bi0h4z4rd88`) y el repositorio no incluye model card descriptiva: solo metadatos.

El problema que resuelve es acotado y muy específico: permitir ejecutar un modelo multimodal de ~27B en Apple Silicon con un peso de repositorio de 22,8 GB, algo que no sería viable en precisión completa o en 8 bits en equipos con memoria unificada de 24-32 GB. Al tratarse de una build sin alineamiento, su utilidad real es la investigación en seguridad de IA, el *red-teaming* y la evaluación comparativa del comportamiento de rechazo, no el despliegue como asistente de producción.

Es relevante ahora únicamente dentro de ese nicho: el repositorio acumula 5 descargas y 0 *likes*, no declara licencia y no incluye documentación técnica propia. Toda la información sobre arquitectura procede de conversiones paralelas del mismo modelo en otros repositorios de la comunidad (zomiailabs, SolsticeAI, onurburak9), no del autor de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), torre de vision nativa y cabeza MTP para decodificacion especulativa |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afina (affine), group size 64, en este repositorio; la familia ofrece tambien 2, 4 y 8 bits en repositorios equivalentes |
| Idiomas soportados | Ingles (`en` segun metadatos); no se declaran otros idiomas |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`); libreria `mlx` |
| Tamano del repositorio | 22,8 GB |
| Modalidad | image-text-to-text (vision-lenguaje) |
| Tag de arquitectura | `qwen3_5` |
| Creado / actualizado | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura descrita en las conversiones paralelas del mismo modelo corresponde a un transformer denso de 27B con esquema de atención híbrido: capas de atención lineal basadas en Gated DeltaNet intercaladas con capas de atención completa clásica. Este diseño reduce el coste de memoria de la caché KV en contextos largos respecto a un transformer de atención completa pura, al tiempo que mantiene la capacidad de recuperación exacta en las capas de atención completa. El modelo incorpora además una torre de visión para entrada de imágenes y una cabeza MTP (*multi-token prediction*) que permite decodificación especulativa, acelerando la generación en inferencia. Dispone de un modo de razonamiento explícito (*thinking*) que puede activarse o desactivarse.

No se dispone de ningún dato sobre el entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo RLHF, DPO o fases de razonamiento por refuerzo. El repositorio de esta ficha no contiene model card técnica: el README se limita a metadatos de librería y pipeline. La intervención documentada por la comunidad es el *abliteration*, un procedimiento que identifica y elimina direcciones de activación asociadas al rechazo para producir un modelo que no declina peticiones; no se especifican en la información disponible ni el método exacto ni su impacto medido en capacidades. Las capas de visión, normalizaciones y convoluciones se mantienen típicamente en mayor precisión que el cuerpo del modelo en estas conversiones, aunque el detalle exacto de esta build concreta no está documentado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento explícito con modo *thinking* controlable (activación y desactivación).
- Comprensión de imágenes junto a texto (pipeline `image-text-to-text`): descripción, extracción de información y respuesta a preguntas sobre imágenes.
- Generación de código y asistencia de programación (capacidad heredada del modelo base Qwen, no verificada con benchmarks en esta build).
- Tool calling / function calling, según la descripción del modelo base en los repositorios de la comunidad.
- Flujos agénticos y razonamiento multi-paso, apoyados en el soporte de herramientas y en el modo de razonamiento.
- Decodificación especulativa mediante cabeza MTP, que acelera la inferencia en hardware compatible.
- Ausencia deliberada de rechazo ante peticiones que un modelo alineado declinaría (comportamiento *uncensored*).
- Capacidades multilingües: no declaradas; los metadatos indican únicamente inglés.

## Casos de uso

- **Red-teaming y evaluación de seguridad**: el modelo sirve como sujeto de prueba para medir qué tipos de peticiones dañinas acepta un modelo abliterado, comparando sus respuestas con las del modelo base alineado. Su utilidad aquí es precisamente la ausencia de rechazo.
- **Investigación sobre alineamiento y direcciones de activación**: permite estudiar qué se pierde y qué se conserva al eliminar la dirección de rechazo, ejecutando experimentos localmente en un Mac sin depender de infraestructura cloud ni de APIs externas.
- **Generación de datasets de contraste**: producir pares de respuesta (modelo alineado frente a modelo abliterado) para entrenar clasificadores de toxicidad o filtros de seguridad.
- **Análisis de documentos e imágenes en local con requisitos de privacidad**: al ser multimodal y ejecutable en memoria unificada, permite procesar capturas, formularios o figuras sin que los datos salgan del equipo; útil en entornos con restricciones de confidencialidad.
- **Prototipado offline en Apple Silicon**: desarrolladores que necesitan probar un pipeline multimodal de 27B en un portátil o Mac Studio sin GPU NVIDIA pueden usar esta build de 6 bits como aproximación al comportamiento del modelo completo.
- **Evaluación comparativa de cuantizaciones**: al existir builds de 2, 4, 6 y 8 bits del mismo modelo, este repositorio sirve para medir la degradación de calidad y el ahorro de memoria del punto de 6 bits frente a 4 y 8 bits.
- **Asistencia de código en local para experimentación**: con tool calling y ventana de contexto no documentada, se puede integrar en un flujo de edición de código sobre el propio equipo, asumiendo el riesgo de contenido no filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones (MMLU, HumanEval, GSM8K, MMMU ni ninguna otra), y las conversiones paralelas consultadas tampoco aportan cifras. No se dispone de datos de latencia o throughput medidos para esta build de 6 bits.

## Requisitos de hardware

- **VRAM / memoria unificada estimada**: 27,36 B de parámetros a 6 bits suponen aproximadamente 20,5 GB solo en pesos; el repositorio ocupa 22,8 GB, por lo que se recomienda un mínimo de 24 GB de memoria disponible y, de forma realista, 32 GB para dejar margen a la caché KV, la torre de visión y el contexto.
- **Hardware compatible**: exclusivamente Apple Silicon (MLX). No funciona en GPU NVIDIA ni AMD, ni en CPU x86 mediante esta librería.
- **Equipos recomendados**: Mac con memoria unificada de 32 GB o superior (M1/M2/M3/M4 Pro, Max o Ultra); en 24 GB el modelo entra ajustado y con contexto limitado; en 16 GB no es viable.
- **GPU de datacenter**: no aplica; para A100/H100 habría que recurrir a una conversión distinta (por ejemplo, el formato original del modelo base o una build GGUF/AWQ), no a este repositorio.
- **Cabe en GPU de consumo**: no en el sentido habitual (RTX 4090 con 24 GB) por incompatibilidad de formato; una RTX 4090 requeriría otra conversión y quedaría al límite de memoria en 6 bits.
- **Opciones de despliegue**: `mlx-vlm` (librería declarada, con `load`, `generate` y `apply_chat_template`), `mlx-lm` para texto, y builds de la comunidad para Ollama (`orcarouter/Qwen3.8-27B-Uncensored`, con proyector de visión `mmproj` incluido y etiquetas de 2 a 8 bits). vLLM y TGI no soportan pesos MLX.
- **Latencia y throughput**: no disponible; no se han publicado mediciones para esta build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| bi0h4z4rd88/Qwen3.8-27B-Uncensored-MLX-6-bit (esta ficha) | 27,36 B | no disponible | 6 bits MLX, group size 64 | no disponible | 5 descargas, 0 likes, sin model card |
| zomiailabs/Qwen3.8-27B-Uncensored-MLX | 27 B (heredado) | no disponible | MLX, precision no especificada | no disponible | Misma base abliterada, autor distinto |
| SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit | 27 B (heredado) | no disponible | 6 bits MLX | no disponible | Equivalente funcional en la misma precision |
| onurburak9/Qwen3.8-27B-Uncensored-MLX (GitHub) | 27 B (heredado) | no disponible | 2, 4, 6 y 8 bits afina, group size 64 | no disponible | Distribuye las cuatro precisiones como subcarpetas |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | 27 B (heredado) | no disponible | 16 etiquetas de 2 a 8 bits, con `mmproj` | no disponible | Empaquetado para Ollama, no para MLX |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes, por lo que la comparación se limita a formato, precisión, licencia y disponibilidad.

## Limitaciones y advertencias

- **Sin alineamiento de seguridad**: es una build abliterada; no rechaza peticiones dañinas. No debe exponerse a usuarios finales sin una capa de filtrado propia.
- **Licencia no declarada**: el repositorio no indica licencia, lo que impide determinar si el uso comercial está permitido. A esto se suma la licencia del modelo base, que tampoco se documenta aquí; en la práctica, el uso comercial es jurídicamente inviable sin aclaración previa.
- **Riesgo de alucinación**: no hay evaluaciones publicadas para esta cuantización; el proceso de abliteración y la cuantización a 6 bits pueden degradar la fidelidad factual respecto al modelo base, sin que exista medición disponible.
- **Idioma**: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- **Contexto desconocido**: no se publica la longitud de contexto soportada, dato crítico para planificar despliegues con documentos largos o conversaciones extensas.
- **Trazabilidad dudosa**: no se ha podido verificar en la información disponible la existencia de un modelo oficial `Qwen/Qwen3.8-27B`; toda la descripción arquitectónica proviene de repositorios de terceros. Además, el tag de arquitectura del repositorio (`qwen3_5`) no coincide con el nombre comercial usado en la comunidad (`Qwen3.8-27B`), lo que introduce incertidumbre sobre la base exacta.
- **Documentación inexistente**: la model card está vacía; no hay instrucciones de uso, ni receta de prompt, ni límites conocidos.
- **Adopción mínima**: 5 descargas y 0 *likes*. No hay evidencia de validación por parte de la comunidad ni de que los pesos se hayan verificado frente al modelo original.
- **Dependencia de plataforma**: MLX solo funciona en Apple Silicon; no hay ruta de despliegue en NVIDIA, AMD ni CPU x86 con este repositorio.
- **Fecha de publicación futura en los metadatos**: el repositorio figura creado el 2026-10-20, lo que conviene contrastar con la cronología real del ecosistema antes de citarlo.
- **Visión degradada potencial**: las conversiones a 6 bits mantienen normalmente la torre de visión en mayor precisión, pero esta build no documenta qué componentes se han preservado, por lo que la calidad multimodal no está garantizada.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/bi0h4z4rd88/Qwen3.8-27B-Uncensored-MLX-6-bit
- Conversión paralela (zomiailabs): https://huggingface.co/zomiailabs/Qwen3.8-27B-Uncensored-MLX
- Conversión paralela en 6 bits (SolsticeAI): https://huggingface.co/SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit
- Repositorio GitHub con las cuatro precisiones (onurburak9): https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Build para Ollama (orcarouter): https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Articulo de analisis en AWS Builder: https://builder.aws.com/content/3IRhMoqn727uv4IERv7IaO9ACJh/qwen38-27b-uncensored-mlx-why-this-apple-silicon-ai-model-caught-my-attention
