# Lexiiiii/legalgpt-dpo-round2

## Resumen

LegalGPT DPO Round 2 es un adaptador LoRA desarrollado por Lexiiiii, diseñado para especializar el modelo base Qwen/Qwen2.5-7B-Instruct en consultas legales sin recuperación aumentada (RAG). Forma parte de un proyecto más amplio denominado LegalGPT, que sigue una cadena de entrenamiento SFT → DPO, siendo esta la segunda iteración de DPO (round2) con una configuración específica: se utilizan respuestas elegidas de un modelo fuerte y rechazadas de un modelo SFT. El adaptador se distribuye bajo licencia Apache 2.0 y está pensado para ser cargado mediante la librería PEFT sobre el modelo base.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only de 7.000 millones de parámetros con ventana de contexto de 128.000 tokens, entrenado por Alibaba Cloud. El adaptador LoRA modifica únicamente las proyecciones q_proj y v_proj, con rango 32 y alpha 64, lo que lo convierte en un componente ligero y fácil de integrar en flujos existentes. Aunque el repositorio no incluye métricas de rendimiento ni documentación detallada del entrenamiento, su propósito declarado es ofrecer respuestas legales en un escenario sin RAG, lo que implica que el conocimiento legal se encuentra implícito en los pesos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador tiene pocos millones; el modelo base tiene 7.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: 128.000 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del base, p.ej. 4-bit, 8-bit) |
| Idiomas soportados | No disponible (el modelo base es multilingue, con enfasis en chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 32 y alpha 64 sobre las capas de proyeccion q_proj y v_proj del modelo Qwen2.5-7B-Instruct. La tecnica LoRA (Low-Rank Adaptation) permite ajustar el modelo con un numero reducido de parametros entrenables, manteniendo congelados los pesos originales. El entrenamiento se realizo mediante DPO (Direct Preference Optimization) en una segunda ronda (round2), donde las respuestas "chosen" provienen de un modelo fuerte (posiblemente una version mejorada o un modelo de mayor calidad) y las "rejected" de un modelo entrenado con SFT. No se proporcionan detalles sobre el dataset, el numero de tokens de entrenamiento ni el proceso de SFT previo, aunque el proyecto completo (disponible en GitHub) indica una cadena SFT → DPO con multiples rondas.

La eleccion de DPO en lugar de RLHF simplifica el proceso de alineacion al evitar la necesidad de un modelo de recompensa explicito, optimizando directamente la politica del modelo a partir de pares de preferencias. Esta aproximacion es adecuada para dominios especializados como el legal, donde se busca que el modelo prefiera respuestas mas precisas y bien fundamentadas.

## Capacidades

- Generacion de texto legal: responde a consultas juridicas generales, como explicaciones de conceptos legales, procedimientos o normativas, siempre dentro de los limites de su conocimiento entrenado.
- Razonamiento conversacional: al estar basado en Qwen2.5-7B-Instruct, mantiene un chat multi-turno coherente y puede seguir instrucciones complejas.
- Soporte multilingue: hereda las capacidades del modelo base, que cubre mas de 30 idiomas, aunque el entrenamiento especifico en el dominio legal probablemente se realizo en chino (el proyecto parece originario de China).
- Sin tool calling ni agentes: el modelo no incluye soporte explicito para llamadas a funciones ni razonamiento multi-paso con herramientas externas.
- Sin vision ni audio: es exclusivamente un modelo de texto.

## Casos de uso

- Asistente legal para particulares: el modelo puede responder preguntas frecuentes sobre derechos laborales, arrendamientos, divorcios o reclamaciones, ofreciendo una primera orientacion antes de consultar a un profesional. Su naturaleza conversacional permite aclarar dudas en varios turnos.
- Redaccion de borradores de documentos legales: puede generar plantillas de contratos simples, cartas de reclamacion o escritos de demanda, que luego un abogado debe revisar y adaptar. Al no usar RAG, se limita a patrones aprendidos, por lo que la precision es limitada.
- Formacion juridica interna: en despachos o departamentos legales, puede servir como herramienta de consulta rapida para becarios o personal no juridico, explicando terminologia y procedimientos basicos.
- Preprocesamiento de consultas en plataformas de legaltech: integrado en un chatbot, puede clasificar y derivar consultas a especialistas, reduciendo la carga de trabajo inicial.
- Generacion de resumenes de jurisprudencia: aunque sin RAG, puede resumir textos legales que se le proporcionen en el prompt, extrayendo los puntos clave de una sentencia o articulo.
- Evaluacion de modelos legales: como adaptador de referencia en proyectos de investigacion, permite comparar el efecto de DPO frente a SFT en el dominio legal, especialmente en entornos sin acceso a bases de datos externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni metricas especificas del dominio legal. El repositorio no incluye evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14 GB en FP16, 7 GB en 8-bit y 4 GB en 4-bit (con GPTQ o AWQ). El adaptador LoRA anade un overhead minimo (menos de 100 MB).
- GPU recomendadas: tarjetas consumer como RTX 3090, RTX 4090 o RTX 4080 pueden ejecutar el modelo en FP16 o con cuantizacion 8-bit. Para inferencia con contexto largo (128k) se recomienda al menos 24 GB de VRAM.
- Compatibilidad con consumer GPU: si, es viable en GPUs con 16 GB o mas usando cuantizacion 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (con soporte de adaptadores), Transformers con PEFT, y TGI. Para cargar el adaptador, se debe usar el modelo base y luego aplicar el adaptador con `PeftModel`.
- Latencia y throughput: no se dispone de mediciones especificas. En una RTX 4090, la generacion de tokens suele rondar 30-50 tokens/s con el modelo base en FP16, pero depende de la longitud del prompt y la configuracion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos legales especificos. Como referencia, se compara con su modelo base y con un adaptador tipico del mismo dominio:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7B | 128k | Apache 2.0 | Modelo generalista, sin especializacion legal |
| LegalGPT DPO Round 2 (este) | Adaptador LoRA | 128k (heredado) | Apache 2.0 | Especializado en consultas legales sin RAG |
| Otros adaptadores legales (p.ej. Legal-Llama) | Variable | Variable | Variable | No se dispone de datos concretos |

No se ha encontrado informacion sobre modelos comparables en la misma categoria (adaptadores LoRA legales sobre Qwen2.5-7B) en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje generativo, puede producir respuestas incorrectas o inventadas, especialmente en un dominio tan delicado como el legal. No debe utilizarse como sustituto de un abogado colegiado.
- Falta de verificacion de fuentes: al no usar RAG, el modelo no puede contrastar la informacion con bases de datos juridicas actualizadas, por lo que puede ofrecer normativas obsoletas o incompletas.
- Limitaciones de idioma: aunque el modelo base es multilingue, el entrenamiento especifico parece orientado al chino (por el contexto del proyecto). El rendimiento en espanol u otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo base Qwen2.5-7B-Instruct tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Estado del proyecto: el adaptador tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validacion externa. No hay garantias de calidad ni soporte.
- Contexto largo: aunque el base soporta 128k tokens, el adaptador no ha sido evaluado en tareas de contexto largo, por lo que su comportamiento en prompts extensos es incierto.
- Para produccion: se recomienda una evaluacion exhaustiva en el dominio legal especifico antes de cualquier despliegue real, asi como la implementacion de un sistema de verificacion externa (RAG) para mitigar errores.

## Enlaces

- HuggingFace: https://huggingface.co/Lexiiiii/legalgpt-dpo-round2
- Proyecto LegalGPT (GitHub): https://github.com/czc0407/legalGPT
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
