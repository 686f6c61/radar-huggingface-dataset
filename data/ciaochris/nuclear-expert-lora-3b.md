# ciaochris/Nuclear-Expert-LoRA-3B

## Resumen

Vers3Dynamics Nuclear-Expert es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Vers3Dynamics sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. Su objetivo es la especialización de dominio en física nuclear, ingeniería de reactores, física de reactores, ciclos de combustible nuclear y materiales nucleares, mediante ajuste fino paramétricamente eficiente. El adaptador fue entrenado con solo 108 ejemplos de instrucción-respuesta, lo que lo convierte en un experimento de adaptación de dominio a pequeña escala, no en un modelo experto completo.

La relevancia de este modelo radica en su enfoque de investigación: explorar si un adaptador LoRA de tamaño reducido puede mejorar la terminología y el razonamiento técnico en un dominio científico específico sin degradar las capacidades generales del modelo base. Es un ejemplo de adaptación de dominio paramétricamente eficiente sobre un modelo compacto de 3.000 millones de parámetros, con licencia CC-BY-4.0, pensado para investigación educativa y desarrollo de prototipos, no para aplicaciones críticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (LoRA sobre Llama 3.2 3B Instruct) |
| Parámetros totales | ~3.000 millones (base) + adaptador LoRA (no publicado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No publicada (heredada del modelo base, 128K según Llama 3.2) |
| Tipos de cuantización | No publicados (se puede usar con cuantización GGUF del base) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PEFT (adapter_config, safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `meta-llama/Llama-3.2-3B-Instruct`, que usa arquitectura Transformer con atención causal. El entrenamiento se realizó mediante adaptación de dominio por instrucción-respuesta (instruction-response domain adaptation) con 108 ejemplos curados, en la plataforma Thinking Machines Lab Tinker. No se modificaron los pesos completos del modelo base, solo se añadieron matrices de bajo rango (LoRA). Los detalles de hiperparámetros (rango, alpha, dropout, módulos objetivo, learning rate, número de épocas, etc.) no se han publicado en la información disponible.

El dataset de entrenamiento cubre temas de física nuclear fundamental, física de reactores, física de neutrones, moderación y absorción, ciclos de combustible, materiales nucleares, conceptos de quemado, sistemas de energía nuclear, seguridad de reactores, radiación y desintegración, y literatura técnica histórica. No se detalla la composición exacta, la procedencia de las fuentes, ni la metodología de deduplicación. El entrenamiento no incluye RLHF ni DPO explícitos, según la información disponible.

## Capacidades

- Generación de texto técnico en dominio nuclear: respuestas a preguntas sobre física de reactores, neutrones, ciclos de combustible y materiales.
- Razonamiento científico básico: el adaptador busca mejorar la precisión conceptual y la coherencia en explicaciones técnicas.
- Seguimiento de instrucciones: al ser una adaptación de Llama 3.2 Instruct, conserva la capacidad general de seguir instrucciones del modelo base.
- Manejo de incertidumbre: el modelo está entrenado para expresar incertidumbre y evitar afirmaciones no respaldadas, según la descripción del proyecto.
- No se reportan capacidades de tool calling, visión, audio o razonamiento multi-paso especiales más allá de las del modelo base (que no incluye tool calling nativo en su versión 3B).

## Casos de uso

- **Educación en física nuclear**: el modelo puede generar explicaciones conceptuales y resúmenes de temas como fisión, moderación de neutrones, o ciclo del combustible, adecuados para estudiantes y autodidactas.
- **Prototipado de asistentes científicos**: integración en aplicaciones de asistencia técnica para redactar borradores de preguntas o respuestas sobre conceptos nucleares, siempre con verificación humana.
- **Desarrollo de datasets de evaluación**: dado su enfoque de dominio, puede usarse para generar datos sintéticos o para comparar la calidad de respuestas en tareas de física nuclear.
- **Investigación en adaptación de dominio**: como caso de estudio de LoRA con pocos datos, para analizar el impacto de la adaptación paramétricamente eficiente en dominios técnicos.
- **Generación de resúmenes de literatura técnica**: para sintetizar artículos o capítulos de libros sobre energía nuclear, aunque con limitaciones de precisión.
- **Evaluación de alucinación y fiabilidad**: el modelo es un banco de pruebas para estudiar cómo los modelos pequeños manejan preguntas de alto riesgo y si evitan afirmaciones no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que no hay resultados formales de evaluación publicados. No se pueden proporcionar cifras de MMLU, HumanEval, GSM8K ni otros. Se recomienda evaluar el modelo en tareas de dominio específicas antes de usarlo en producción.

## Requisitos de hardware

- **VRAM estimada**: como el modelo base es de 3B parámetros, con cuantización de 8 bits se requiere ~4-6 GB de VRAM; con 4 bits ~3-4 GB. El adaptador LoRA añade una fracción mínima (menos de 1 GB).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para cuantización 4 bits (por ejemplo, RTX 3060, RTX 4060, o GPUs de datacenter como T4). Para mayor velocidad, una RTX 4090 o A100 es suficiente.
- **Cabe en consumer GPU**: sí, es viable en tarjetas de 6-8 GB de VRAM con cuantización de 4 bits.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con Hugging Face Transformers, vLLM (con soporte para LoRA), llama.cpp (si se convierte a GGUF con el adaptador fusionado), o Ollama (con modelo base + adaptador).
- **Latencia**: en una GPU consumer, la generación de texto será de decenas de tokens por segundo, dependiendo de la cuantización y longitud de la secuencia.

## Comparativa con modelos similares

No hay modelos comparables con exactamente la misma especialización y tamaño publicados en la información disponible. Como referencia, se puede comparar con el modelo base `Llama-3.2-3B-Instruct` (sin adaptación) y con otros adaptadores LoRA de dominio técnico, aunque no se dispone de métricas. La comparación sería conceptual:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Vers3Dynamics Nuclear-Expert | ~3B | No publicado (128K base) | CC-BY-4.0 | Física nuclear |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | General |
| Otros LoRA de dominio (ej. técnicos) | Variable | Variable | Variable | Variable |

No se dispone de datos de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- **Modelo experimental**: no es una fuente científica autorizada, ni un ingeniero con licencia, ni un simulador de reactor, ni un sistema de seguridad.
- **Alucinaciones**: el entrenamiento con solo 108 ejemplos no garantiza precisión; puede generar afirmaciones incorrectas o inventadas.
- **Cobertura de dominio incompleta**: la cobertura temática es irregular y no completa, según el autor.
- **Riesgo de uso indebido**: el modelo puede generar contenido sobre física de armas nucleares (a nivel conceptual), lo que lo hace no apto para aplicaciones de seguridad, salvaguardas o decisiones críticas.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero no elimina el riesgo de mal uso.
- **Sin evaluaciones formales**: no hay benchmarks publicados, por lo que el rendimiento real es desconocido.
- **Idioma**: solo inglés, no soporta español nativo (aunque el modelo base puede responder en otros idiomas, no está garantizado).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ciaochris/Nuclear-Expert-LoRA-3B)
- [Modelo base: meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
- [Repositorio de LoRA (microsoft/LoRA)](https://github.com/microsoft/LoRA) - referencia de la técnica
- [Modelo relacionado: Vers3Dynamics-Civil-Reactor-Expert-3B](https://huggingface.co/ciaochris/Vers3Dynamics-Civil-Reactor-Expert-3B)
