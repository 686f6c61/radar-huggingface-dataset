# chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith

## Resumen

MoziAI-35B-V3.8 es un ajuste fino (finetune) del modelo base Ornith-1.5-35B-A3B, publicado por el usuario chenyumo bajo el identificador `chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith`. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales, orientado a generación de texto, razonamiento financiero y tool calling, y distribuido principalmente en formato GGUF para su ejecución local mediante llama.cpp. La model card lo presenta como un modelo multimodal (etiqueta `vision`) con soporte de decodificación especulativa basada en MTP (Multi-Token Prediction) y una cuantización propietaria denominada MoziSmartBit.

El modelo se posiciona como una alternativa compacta para despliegue local: según el autor, la cuantización MoziSmartBit comprime los 35B parámetros hasta unos 15,9 GB, lo que permite ejecutarlo en GPU de consumo con 20 GB o más de VRAM. Incorpora además un marco de razonamiento denominado "seven-dimensional thinking" y un mecanismo de iteración y reflexión llamado "agent LOOP", así como un ajuste orientado al dominio financiero y una variante "uncensored" sin moderación de contenido. La licencia declarada es Apache-2.0, con componentes heredados del modelo base bajo MIT y Apache-2.0.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: modelos MoE de tamaño medio con activación dispersa, cuantizaciones agresivas para hardware de consumo y ajustes verticales de dominio (finanzas) con soporte de agentes y tool calling. No obstante, buena parte de las afirmaciones de rendimiento provienen únicamente de la model card del autor y no están respaldadas por evaluaciones independientes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3.5/Qwen3.6 según la model card; tag `qwen3_5_moe` |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmación numérica en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; cuantización propietaria MoziSmartBit (≈15,9 GB, ratio de compresión 4,5x); comparativas con Q4_K_M; uso de imatrix |
| Idiomas soportados | zh, en (declarados en metadatos); la model card afirma soporte de 201 idiomas y dialectos, sin verificación independiente |
| Licencia | Apache-2.0 (componentes del modelo base: MIT y Apache-2.0; atribución en NOTICE) |
| Formato de pesos | GGUF (librería llama-cpp); repo de 47,8 GB con múltiples archivos |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts, derivado por finetune de `ornith-ai/Ornith-1.5-35B-A3B`, que a su vez se describe como basado en la arquitectura Qwen3.5-35B-A3B / Qwen3.6-35B-A3B. El tag `qwen3_5_moe` y la nomenclatura "A3B" apuntan a un diseño MoE con aproximadamente 3.000 millones de parámetros activos por token, aunque la información disponible no confirma la cifra exacta ni el número de expertos ni la distribución de capas. La model card menciona soporte de MTP (Multi-Token Prediction), utilizado para decodificación especulativa y aceleración de la inferencia.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset de preentrenamiento ni el pipeline de alineación (RLHF, DPO u otros). El autor sí declara un ajuste específico sobre datos y capacidades del dominio financiero, así como la integración de dos mecanismos propios: el "seven-dimensional thinking framework", que estructura la respuesta en función de la complejidad de la tarea (niveles 0 a 2 con 2, 5 o 7 dimensiones de razonamiento), y el "agent LOOP", que introduce una ronda de ejecución, evaluación, ajuste y verificación antes de la respuesta final. La cuantización MoziSmartBit aplica precisión diferenciada por capas sobre la estructura MoE, con la afirmación de conservar aproximadamente el 99 % de la precisión de FP16, dato no verificado de forma independiente.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con especial énfasis declarado en chino.
- Razonamiento estructurado mediante el marcador `moziAI-Think`, con despliegue dinámico de dimensiones de análisis según la complejidad de la tarea.
- Modo de agente con iteración y autoverificación (`moziAI-Loop`) para tareas de varios pasos.
- Tool calling y function calling, con etiqueta explícita `tool-calling` y compatibilidad declarada con endpoints.
- Capacidades multimodales: la model card y los tags incluyen `vision`, aunque no se detallan resolución, formato de imagen ni arquitectura del codificador visual.
- Programación general: desarrollo full-stack, depuración y diseño de arquitectura en Python, JavaScript, TypeScript, Go y Rust, según el autor.
- Dominio financiero: preguntas y respuestas financieras, programación cuantitativa y análisis de datos del sector.
- Variante "uncensored": sin moderación de contenido en la generación.
- Decodificación especulativa mediante MTP para acelerar la inferencia.
- Multilingüismo declarado de hasta 201 idiomas y dialectos, sin datos de evaluación por idioma.

## Casos de uso

- Análisis financiero asistido: el ajuste específico sobre datos del dominio financiero y el modo de razonamiento estructurado permiten generar informes de mercado, resúmenes de resultados y evaluaciones de estrategias con un formato de análisis explícito (dimensiones de riesgo, dependencias y criterios de aceptación).
- Programación cuantitativa: generación y depuración de código en Python para backtesting y pipelines de datos financieros, aprovechando el soporte de tool calling para invocar librerías y APIs externas.
- Agentes locales de automatización: el mecanismo LOOP y el soporte de function calling permiten construir agentes que descomponen una tarea, ejecutan pasos, verifican resultados y corrigen antes de responder, todo ello en infraestructura propia.
- Asistente de atención al cliente en chino e inglés: despliegue local con llama.cpp para conversaciones multi-turno, sin coste por token y con los datos del cliente sin salir de la infraestructura propia.
- Investigación académica sin restricciones de moderación: la variante uncensored facilita el estudio de temas sensibles, análisis de contenido y discusión abierta en entornos controlados.
- Desarrollo full-stack asistido: generación de código en Python, JS, TS, Go y Rust, con integración en editores o pipelines de CI/CD mediante endpoints compatibles.
- Procesamiento de documentos con componente visual: tareas que combinen texto e imagen (extracción de información de capturas o gráficos), sujeto a validación previa de la calidad real del soporte de visión.
- Despliegue en hardware de consumo: con ~15,9 GB en MoziSmartBit, cabe en GPU de 20 GB o más, lo que habilita prototipado y uso personal sin cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de benchmarks, pero no se ha proporcionado su contenido numérico; las únicas afirmaciones cuantitativas son la retención de aproximadamente el 99 % de la precisión de FP16 con MoziSmartBit y la reducción de tamaño de ~22 GB (Q4_K_M) a ~15,9 GB, sin datos de MMLU, HumanEval, GSM8K ni comparaciones verificables.

## Requisitos de hardware

- VRAM estimada: ~15,9 GB con la cuantización MoziSmartBit; ~22 GB con Q4_K_M estándar; el resto de cuantizaciones GGUF del repo no están detalladas en la información disponible.
- El autor indica que el modelo funciona en GPU de consumo con 20 GB de VRAM o más.
- GPU recomendadas: no disponible de forma explícita; por capacidad de VRAM encajarían tarjetas de 24 GB (RTX 3090, RTX 4090) y GPUs de datacenter (A100, H100) para mayor throughput, aunque no hay cifras publicadas.
- Despliegue: llama.cpp como librería principal; la model card menciona métodos de despliegue adicionales y compatibilidad con endpoints, sin detallar vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La decodificación especulativa mediante MTP se presenta como aceleración, sin métricas publicadas.
- El repo completo ocupa 47,8 GB, por lo que conviene descargar únicamente los archivos de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoziAI-35B-V3.8 (este) | 35,5B MoE | no disponible | Apache-2.0 | GGUF | Finetune financiero, uncensored, vision declarada, MTP |
| Ornith-1.5-35B-A3B (base) | 35B MoE | no disponible | MIT + Apache-2.0 | no disponible | Modelo base sin el ajuste financiero ni los mecanismos MoziAI |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

La comparación cuantitativa con otros modelos de tamaño similar no puede realizarse porque no se han facilitado resultados de benchmarks ni especificaciones completas de las alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks independientes: las afirmaciones de rendimiento y de retención de precisión provienen exclusivamente del autor.
- Riesgo de alucinación: especialmente crítico en el dominio financiero, donde el propio autor reconoce una tolerancia muy baja al error; requiere verificación humana en producción.
- Idiomas: los metadatos solo declaran chino e inglés; el soporte de 201 idiomas no está respaldado por evaluaciones y el castellano no figura como idioma declarado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar conversaciones o documentos largos.
- Visión: la capacidad multimodal está etiquetada pero no documentada (resolución, formatos, calidad), por lo que no debe asumirse en producción sin pruebas.
- Variante uncensored: la ausencia de moderación implica riesgo de generar contenido inapropiado, legalmente problemático o dañino; no es adecuada para aplicaciones orientadas al público sin filtros adicionales.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones del modelo base (MIT y Apache-2.0) recogidas en el archivo NOTICE.
- Cuantización propietaria: MoziSmartBit no es un estándar del ecosistema, lo que puede limitar la compatibilidad con herramientas y dificultar la reproducibilidad.
- Datos incompletos: se desconocen el número de parámetros activos, la composición del dataset, el pipeline de alineación y las métricas de latencia.
- Madurez: el repositorio se actualizó por última vez en septiembre de 2026 y la model card referencia una versión V3.8 con múltiples revisiones, lo que sugiere cambios frecuentes en pesos y comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-A3B-Ornith
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia (referenciada en la model card): https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/LICENSE
- README en español (referenciado): V3.8/README.es.md
- README en inglés (referenciado): V3.8/README.en.md
- README en chino simplificado (referenciado): V3.8/README.zh.md
