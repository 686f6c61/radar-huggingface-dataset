# PrometheanStudio/APACO

## Resumen

APACO es un modelo de lenguaje publicado en Hugging Face por PrometheanStudio bajo licencia Apache 2.0, construido sobre Qwen/Qwen3.5-9B. Según la propia model card, se trata de un proyecto experimental orientado a funcionar como sistema de asistencia y soporte de decisiones en escenarios de emergencia, fallo de infraestructuras o desconexión prolongada, con ejecución totalmente local y sin dependencia de servicios en la nube. El objetivo declarado no es competir con asistentes de propósito general, sino ofrecer conocimiento práctico de supervivencia, autosuficiencia y gestión de recursos con hardware de consumo.

Es importante señalar que, en el momento de la publicación, el repositorio es explícitamente un clon del modelo base: la model card indica "Currently Just a Clone, LoRA in the works" y que no hay fecha fijada para la adaptación LoRA. Por tanto, las capacidades reales del checkpoint corresponden a las de Qwen3.5-9B sin ajuste adicional, y la orientación a supervivencia descrita en la documentación es una hoja de ruta, no una característica verificable del peso publicado.

El checkpoint contiene 9.653.104.368 parámetros en formato safetensors (19,3 GB de repositorio), lo que sitúa el modelo en la categoría de 9B densos. No se dispone de información publicada sobre longitud de contexto, idiomas soportados ni resultados de benchmarks específicos de esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite conversión a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | ninguno (clon del base; LoRA en desarrollo) |
| Etiquetas de pipeline | text-generation-inference |
| Región declarada | us |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo más allá de su base, Qwen/Qwen3.5-9B, y de la etiqueta `qwen3_5` en los metadatos de Hugging Face. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card describe componentes previstos del sistema (modelo Qwen 9B como motor de lenguaje y razonamiento, inferencia local, base de conocimiento almacenada), pero no detalla el pipeline de entrenamiento.

El aspecto técnico más relevante y verificable es que el repositorio publicado es un clon del modelo base sin modificación de pesos: el autor indica que la adaptación LoRA está en desarrollo y sin fecha. Cualquier innovación técnica descrita (por ejemplo, decodificación especulativa o atención lineal) no está confirmada para esta publicación y debe atribuirse, en su caso, al modelo Qwen subyacente, no a APACO. La model card menciona además una posible migración futura a modelos "Talos" del mismo autor, sin concreción técnica.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-9B; no hay evidencia de especialización efectiva en el checkpoint publicado.
- Conocimiento práctico orientado a supervivencia, autosuficiencia y gestión de recursos según la documentación del proyecto; esta orientación no está validada por un ajuste publicado.
- Ejecución totalmente offline: el modelo puede desplegarse en local sin conexión a internet ni API externa.
- Compatibilidad con text-generation-inference según las etiquetas del repositorio.
- Soporte de tool calling, function calling y flujos de agente multi-paso: no confirmado en la información disponible para esta publicación.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistencia en emergencias sin conectividad: desplegar el modelo en un portátil o mini-PC con inferencia local para consultar procedimientos de primeros auxilios, potabilización de agua o refugio cuando no hay red. Es adecuado por su requisito declarado de funcionar sin conexión, aunque la calidad de las respuestas depende del conocimiento del modelo base.
- Gestión de recursos en escenarios de suministro limitado: usar el modelo como apoyo para planificar raciones, inventario de herramientas y priorización de tareas con restricciones de energía y material.
- Base para un sistema RAG local de manuales técnicos: combinar el checkpoint con una base de conocimiento almacenada en disco (como sugiere la model card) para recuperar procedimientos de reparación, cultivo o mantenimiento; el modelo actúa como capa de razonamiento sobre documentos indexados.
- Soporte de mantenimiento de equipos e infraestructura: consultas sobre diagnóstico y reparación de sistemas básicos en entornos sin acceso a documentación online, aprovechando el tamaño 9B para caber en hardware de consumo.
- Plataforma de experimentación para investigadores: servir como punto de partida para desarrollar adaptaciones LoRA especializadas en dominios de resiliencia, dado que el repositorio es un clon limpio del base con licencia Apache 2.0.
- Formación y simulación de escenarios: generar guiones de ejercicios de contingencia y listas de verificación para entrenamiento de equipos de respuesta, con la advertencia de que las salidas deben verificarse contra fuentes fiables.
- Despliegue en entornos aislados (air-gapped): uso en laboratorios u organizaciones que requieren modelos sin telemetría ni llamadas externas, gracias a que los pesos son locales y la licencia permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa para un modelo denso de ~9,65B parámetros, en FP16 se requieren aproximadamente 19-20 GB de VRAM; en cuantización de 8 bits, unos 10-11 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones de cálculo y no datos publicados por el autor.
- El autor declara un mínimo de 8 GB de memoria y recomienda 16-32 GB, sin especificar si se refiere a VRAM o a RAM del sistema.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar viabilidad en GPUs de consumo de gama alta con cuantización (por ejemplo, RTX 3090/4090 de 24 GB en FP16 o cuantizaciones menores en GPUs de 8-16 GB), pero no hay confirmación del autor.
- Opciones de despliegue: text-generation-inference (según etiquetas), llama.cpp, Ollama y vLLM como opciones habituales para pesos safetensors/GGUF; la model card menciona soporte planificado para herramientas de LLM local, sin lista concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| APACO (PrometheanStudio) | 9,65B | no disponible | Apache 2.0 | Clon del base, LoRA pendiente | Orientación a supervivencia no implementada aún |
| Qwen/Qwen3.5-9B | ~9B | no disponible en esta ficha | según el modelo base | Modelo base oficial | Mismo motor subyacente; APACO no añade ajuste |
| prometheanAI/Talos | no disponible | no disponible | no disponible | Publicado por el mismo autor | Alternativa futura mencionada en la model card |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado es un clon del modelo base: no incorpora el ajuste LoRA orientado a supervivencia descrito en la documentación, por lo que no debe asumirse ningún conocimiento especializado adicional.
- Riesgo de alucinación: en dominios críticos como primeros auxilios, potabilización de agua o seguridad estructural, las respuestas del modelo pueden ser incorrectas; la propia model card prioriza la verificación de fuentes y la incertidumbre transparente, pero no hay mecanismo implementado que lo garantice.
- Sesgos: no documentados; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, no especificados.
- Idiomas y contexto: no disponibles, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen subyacente y de cualquier componente futuro.
- Proyecto en estado experimental y con 0 descargas y 0 likes en el momento de la consulta; sin fecha de actualización del LoRA ni garantías de mantenimiento.
- Requisitos de hardware declarados de forma ambigua (8 GB mínimo, 16-32 GB recomendado) sin distinguir VRAM de RAM, lo que puede inducir a error en el dimensionamiento.
- No apto como única fuente de decisión en situaciones de riesgo real sin validación humana y fuentes externas contrastadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrometheanStudio/APACO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor en Hugging Face: https://huggingface.co/prometheanAI
- Modelos del autor: https://huggingface.co/prometheanAI/models
- Repositorio Talos (mencionado en la actividad del autor): https://huggingface.co/prometheanAI/Talos
