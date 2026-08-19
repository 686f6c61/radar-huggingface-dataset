# Lexiiiii/legalgpt-sft-full

## Resumen

El modelo `Lexiiiii/legalgpt-sft-full` es un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el usuario Lexiiiii dentro del proyecto LegalGPT. Su objetivo es especializar el modelo en consultas legales en escenarios sin recuperación aumentada por generación (RAG), es decir, responder directamente a preguntas sobre derecho basándose únicamente en el conocimiento adquirido durante el entrenamiento.

El adaptador se entrenó con 8.007 ejemplos de consultas legales mediante la librería LLaMA-Factory, utilizando LoRA con rango 32 y alpha 64 sobre las proyecciones de consulta y valor (q_proj y v_proj). Al ser un adaptador PEFT, no modifica los pesos del modelo base, por lo que su tamaño es mínimo y su integración requiere cargar el modelo Qwen2.5-7B-Instruct completo. La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en entornos profesionales.

Aunque el repositorio no incluye benchmarks ni métricas de rendimiento, la relevancia del modelo radica en su enfoque específico para el dominio legal, un campo donde los modelos genéricos suelen carecer de precisión terminológica y de conocimiento normativo. Es un paso intermedio en un pipeline SFT → DPO cuyo resultado final es `legalgpt-dpo-round5-v1`, según la documentación del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.610.000.000 (modelo base) + adaptador LoRA (~0.2% adicional) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificados; el adaptador se carga en FP32/FP16 sobre el modelo base |
| Idiomas soportados | No especificados; el modelo base soporta inglés, chino y otros, pero el entrenamiento legal no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer del modelo Qwen2.5-7B-Instruct, que emplea atención multi-cabeza con mecanismos de optimización como GQA (Grouped Query Attention) y una ventana de contexto de 32.768 tokens. El ajuste fino se realizó mediante LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, atacando únicamente las capas de proyección q_proj y v_proj. Esta configuración reduce drásticamente el número de parámetros entrenables, manteniendo a la vez la capacidad de adaptación al dominio legal.

El entrenamiento SFT utilizó 8.007 ejemplos de consultas legales, presumiblemente en formato de instrucción-respuesta. No se especifica la composición exacta del dataset ni el número de épocas, pero el uso de LLaMA-Factory sugiere un pipeline estándar de ajuste fino supervisado. No se mencionan técnicas de RLHF ni DPO en esta etapa; el proyecto completo contempla una fase DPO posterior, pero este adaptador es la base SFT.

## Capacidades

- Generación de texto en dominio legal: responde a preguntas sobre conceptos jurídicos, procedimientos y normativa general, basándose en el conocimiento adquirido durante el SFT.
- Razonamiento contextual: al heredar las capacidades del modelo base, puede mantener conversaciones multi-turno y razonar sobre casos hipotéticos dentro de su conocimiento.
- Soporte multilingüe limitado: el modelo base maneja inglés y chino principalmente; el adaptador no añade idiomas adicionales.
- Sin tool calling ni funciones de agente: no se ha entrenado para invocar herramientas externas ni para integración con APIs.
- Sin capacidad de recuperación de documentos: al no usar RAG, no puede acceder a fuentes legales externas ni a documentos específicos.

## Casos de uso

- Asistencia legal básica para usuarios no expertos: el modelo puede responder preguntas generales sobre derechos laborales, contratos o procedimientos administrativos, ofreciendo orientación preliminar antes de consultar a un abogado.
- Generación de borradores de documentos legales: dada una descripción del caso, puede redactar cláusulas contractuales simples o avisos legales, siempre que el usuario revise y valide el contenido.
- Educación jurídica: como herramienta de estudio para estudiantes de derecho, permite practicar preguntas frecuentes y aclarar conceptos sin depender de un profesor.
- Soporte en despachos pequeños: abogados individuales pueden usarlo como primer filtro para clasificar consultas de clientes y preparar respuestas preliminares.
- Chatbots de páginas web legales: integrado en un sistema de chat, puede atender consultas frecuentes sobre honorarios, plazos o requisitos legales, reduciendo la carga del personal.
- Investigación jurídica exploratoria: aunque sin RAG, puede sugerir líneas de investigación o enumerar principios legales relevantes para un tema dado, ayudando a orientar búsquedas más profundas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o evaluaciones específicas de dominio legal. Tampoco se comparan resultados con otros modelos. Se recomienda evaluar el modelo en tareas legales concretas antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre Qwen2.5-7B-Instruct, la inferencia requiere cargar el modelo base completo. Con cuantización de 4 bits (bitsandbytes) se necesitan aproximadamente 6-8 GB de VRAM; con 8 bits, 8-10 GB; en FP16, 14-16 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización 4-bit (RTX 3060, RTX 4060, etc.).
- Compatibilidad con consumer GPU: sí, siempre que se use cuantización. Un adaptador LoRA añade menos de 100 MB, por lo que no afecta significativamente a los requisitos.
- Opciones de despliegue: se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque el formato original es PEFT. También es posible usar Hugging Face Inference Endpoints.
- Latencia y throughput: no se proporcionan datos; en una RTX 4090, un modelo 7B en FP16 genera típicamente entre 30 y 50 tokens por segundo, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que no existen adaptadores LoRA legales públicos con características idénticas. Alternativas genéricas:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Lexiiiii/legalgpt-sft-full | 7B (base) + LoRA | 32k | Apache 2.0 | Legal (sin RAG) |
| Qwen2.5-7B-Instruct (base) | 7B | 32k | Apache 2.0 | General |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 | General |
| LawGPT (comercial) | No público | No público | Propietaria | Legal con RAG |

La comparación con modelos comerciales como LawGPT o LegalGPT no es posible por falta de especificaciones públicas. La ventaja de este adaptador es su licencia abierta y su bajo coste de despliegue, pero carece de la robustez de sistemas legales comerciales que integran bases de datos normativas actualizadas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede inventar citas legales, artículos o jurisprudencia. No debe usarse como fuente autoritativa sin verificación.
- Conocimiento limitado: entrenado con solo 8.007 ejemplos, su cobertura del derecho es parcial y puede fallar en áreas poco representadas.
- Sin actualización normativa: no tiene acceso a leyes recientes ni a cambios legislativos posteriores a su entrenamiento.
- Sin RAG: no puede consultar documentos externos, lo que limita su utilidad en casos que requieran información específica del cliente.
- Idioma: el entrenamiento no especifica idiomas; si se usa en español, la calidad puede ser inferior a la del inglés o chino, dependiendo del dataset.
- Riesgo en producción: para uso profesional legal, es imprescindible una revisión humana y una evaluación rigurosa con casos reales. La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidad legal.

## Enlaces

- [HuggingFace: Lexiiiii/legalgpt-sft-full](https://huggingface.co/Lexiiiii/legalgpt-sft-full)
- [Repositorio del proyecto LegalGPT (GitHub)](https://github.com/czc0407/legalGPT)
- [Modelo base Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
