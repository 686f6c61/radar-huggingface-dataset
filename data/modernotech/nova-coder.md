# ModernoTech/Nova-Coder

## Resumen

Nova Coder es un modelo de lenguaje especializado en programación desarrollado por Moderno Tech dentro de su familia Nova AI. Con aproximadamente 15.700 millones de parámetros totales (15.706.484.224 según los pesos en safetensors), emplea una arquitectura Mixture of Experts (MoE) basada en la familia DeepSeek-V2, según indica la etiqueta `deepseek_v2` del repositorio. Su propuesta central es ofrecer asistencia de código ejecutable localmente, sin depender de infraestructura en la nube.

El modelo se distribuye principalmente en formato GGUF cuantizado, lo que facilita su despliegue en equipos de escritorio, estaciones de trabajo y portátiles compatibles con motores de inferencia locales. Está orientado a tareas de generación de código, explicación de fragmentos, depuración, refactorización, generación de pruebas y documentación técnica, y declara soporte para inglés y español.

La relevancia actual de Nova Coder reside en su enfoque de especialización frente a modelos generalistas: el autor sostiene explícitamente que un modelo de 16B especializado en código no debe considerarse inferior a uno general de 35B (Nova Prime) para tareas de programación. Sin embargo, la información pública disponible es escasa en cuanto a datos de entrenamiento, benchmarks y detalles de arquitectura más allá de lo declarado en la model card, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia DeepSeek-V2 |
| Parametros totales | 15.706.484.224 (~15,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no especificados) |
| Idiomas soportados | en, es |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (repo de 155,3 GB, incluye múltiples cuantizaciones) |

## Arquitectura y entrenamiento

Nova Coder emplea una arquitectura Mixture of Experts en la que el procesamiento se distribuye entre expertos especializados y se activan selectivamente los correspondientes a cada token. La model card verifica 27 bloques (capas), aunque el resto de detalles arquitectónicos (dimensión del modelo, número de expertos, dimensión de la capa feed-forward, mecanismo de atención) aparece truncado en la información disponible. La etiqueta `deepseek_v2` sugiere que la implementación sigue el diseño de DeepSeek-V2, que combina atención con compresión de KV (MLA) y un esquema MoE con expertos compartidos, aunque no se confirma explícitamente en la documentación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de lo implícito en la arquitectura MoE. El modelo base figura como "Unknown" en los metadatos de Hugging Face.

## Capacidades

- Generación de código en múltiples lenguajes, orientada a funciones, módulos y proyectos completos.
- Explicación y comprensión de fragmentos de código existentes.
- Depuración y detección de errores en bases de código.
- Refactorización de código para mejorar estructura y legibilidad.
- Generación de pruebas unitarias y documentación técnica.
- Revisión de código y asistencia en tareas de arquitectura y diseño de software, "según capacidades verificadas" (el autor no detalla el alcance real).
- Conversación multi-turno (etiqueta `conversational`).
- Soporte bilingüe inglés y español.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistencia de código en el IDE: el modelo puede integrarse como motor local de autocompletado y generación de funciones, aprovechando su especialización en programación y su formato GGUF para ejecutarse en la máquina del desarrollador sin enviar código a servidores externos.
- Depuración de errores: dado un fragmento de código y un mensaje de error, el modelo puede analizar la causa probable y proponer correcciones, una de las tareas declaradas explícitamente por el autor.
- Refactorización de módulos legacy: el modelo puede reescribir funciones o clases para mejorar su estructura, con la ventaja de poder procesar el código localmente y mantener la confidencialidad del repositorio.
- Generación de pruebas unitarias: a partir de una función o módulo, el modelo puede producir casos de prueba, útil en equipos que necesitan aumentar la cobertura sin escribir tests manualmente.
- Documentación técnica automatizada: generación de docstrings, comentarios y documentación de API a partir del código fuente, adecuado para proyectos con documentación deficiente.
- Explicación de bases de código para incorporaciones: un desarrollador nuevo puede pedir al modelo que explique la estructura y el propósito de módulos concretos, apoyándose en su capacidad de comprensión de código y su soporte bilingüe (útil en equipos hispanohablantes).
- Asistencia a estudiantes de programación: el modelo puede explicar conceptos, corregir ejercicios y proponer soluciones paso a paso en español, uno de los públicos objetivo declarados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (15,7B parámetros), una cuantización Q4 requeriría aproximadamente 8-10 GB de VRAM, y una Q8 en torno a 16-17 GB, aunque estos cálculos no están confirmados por el autor y dependen de los parámetros activos reales del MoE.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar ejecución en GPUs consumer de gama alta (RTX 4090 con 24 GB) en cuantizaciones bajas, y en GPUs profesionales (A100, H100) para cuantizaciones mayores, pero no hay confirmación oficial.
- Compatibilidad con GPU consumer: plausible en cuantizaciones GGUF bajas, pero no verificada por el autor.
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con llama.cpp y Ollama; vLLM y TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova Coder | ~15,7B (MoE) | no disponible | other | GGUF | Especializado en código, en/es |
| DeepSeek-Coder-V2 Lite | ~16B (MoE) | 128K (según documentación pública de DeepSeek) | DeepSeek License | safetensors, GGUF | Especializado en código, base arquitectónica similar |
| CodeLlama 13B | 13B (denso) | 16K | Llama 2 Community | safetensors, GGUF | Especializado en código, solo inglés |
| Qwen2.5-Coder 14B | 14B (denso) | 128K | Apache 2.0 | safetensors, GGUF | Especializado en código, multilingüe |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada sobre Nova Coder; se incluyen como referencia de categoría. No se dispone de benchmarks de Nova Coder para comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento real del modelo en tareas de código frente a alternativas establecidas.
- Información de entrenamiento no disponible: se desconoce el volumen y la composición del dataset, lo que impide evaluar sesgos y cobertura lingüística real.
- Licencia "other" sin texto detallado: no se especifican las condiciones de uso comercial, por lo que es imprescindible contactar con el autor antes de un despliegue en producción.
- Contexto no documentado: se desconoce la ventana de contexto, lo que limita la planificación de casos de uso con repositorios grandes.
- Idiomas limitados a inglés y español: no se declara soporte para otros idiomas, lo que restringe su uso en equipos multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en APIs y librerías poco comunes; el autor no documenta mitigaciones.
- Sesgos: no documentados por el autor; al ser un modelo especializado en código, pueden aparecer sesgos hacia ciertos lenguajes, frameworks o estilos de programación según la distribución del dataset de entrenamiento (desconocida).
- Modelo base "Unknown": no se puede rastrear la procedencia de los pesos ni las condiciones de la licencia heredada.
- Repo de 155,3 GB: el despliegue requiere almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Coder
- Sitio oficial de Moderno Tech: https://moderno.com.ar
