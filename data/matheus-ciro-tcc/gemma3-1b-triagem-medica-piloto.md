# matheus-ciro-tcc/gemma3-1b-triagem-medica-piloto

## Resumen

El modelo `matheus-ciro-tcc/gemma3-1b-triagem-medica-piloto` es un adaptador LoRA (entrenado con QLoRA en 4-bit) sobre el checkpoint base `unsloth/gemma-3-1b-pt`, una versión del modelo Gemma 3 de 1B parámetros adaptada al portugués. Desarrollado por Matheus Marques Eiras y Ciro Guilherme Nass como parte de un trabajo de fin de grado del Instituto Federal do Paraná (Brasil), el adaptador tiene como tarea clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre, dentro de un conjunto cerrado de 10 especialidades (dentista, dermatólogo, ginecólogo, oftalmólogo, etc.).

Se trata de un piloto experimental: el entrenamiento se realizó sobre una muestra reducida de 500 ejemplos por clase (4.000 de entrenamiento, 500 de validación y 500 de test) extraídos del corpus público MedPT, con el objetivo de validar el pipeline de ajuste fino antes de lanzar el entrenamiento completo sobre 145.000 ejemplos. Este checkpoint no refleja el rendimiento final del proyecto, que ya ha producido resultados con un modelo Qwen3.5-0.8B entrenado sobre el dataset completo.

La relevancia de este modelo reside en demostrar la viabilidad de aplicar QLoRA sobre Gemma 3 1B para tareas de clasificación médica en portugués brasileño, con un consumo de VRAM contenido (5,61 GB de pico) y tiempos de entrenamiento cortos (31 minutos en una RTX 4070). Es un ejemplo práctico de ajuste eficiente de un modelo base sin instruction tuning previo, aplicando el template de chat de Gemma 3 manualmente durante el preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 3 1B (Transformer decoder-only, dense) |
| Parametros totales | Base: ~1B; adaptador LoRA: 13.045.760 entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento; el base soporta hasta 128K |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (base congelada) |
| Idiomas soportados | Portugues (brasileno) |
| Licencia | Gemma (gemma) |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el checkpoint `unsloth/gemma-3-1b-pt`, que es la versión base (sin instruction tuning) de Gemma 3 1B adaptada al portugués. La arquitectura subyacente es la de Gemma 3: un transformer decoder-only con atención multi-consulta (multi-query attention) y una ventana de contexto ampliable hasta 128K tokens, aunque en este piloto se fijó una longitud máxima de secuencia de 1024 tokens.

El método de entrenamiento es QLoRA: el modelo base se congela y se cuantiza en NF4 de 4 bits, mientras que se insertan adaptadores LoRA en las proyecciones de atención (q, k, v, o) y en las capas del MLP (gate, up, down). La configuración de LoRA es rank 16 y alpha 32. El entrenamiento se realizó con batch efectivo de 32 (batch 1 con acumulación de 32), learning rate 2e-4 con scheduler coseno, 3 épocas (que equivalen a 60 pasos reales debido al empaquetado de secuencias, que redujo las 4.000 líneas a 640), precisión bf16 y optimizador AdamW 8-bit. El hardware utilizado fue una RTX 4070 de 12 GB.

Los datos provienen del corpus MedPT, que contiene 384.095 pares de pregunta-respuesta médica en portugués brasileño. Para este piloto se seleccionaron 500 ejemplos por clase de las 10 especialidades objetivo, con un split estratificado 80/10/10 y semilla 42. El checkpoint base no incluye template de chat, por lo que se aplicó el template `gemma-3` manualmente durante el preprocesado.

## Capacidades

- Clasificación de especialidad médica en un conjunto cerrado de 10 clases (dentista, dermatólogo, ginecólogo, oftalmólogo, ortopedista-traumatólogo, otorrino, psicólogo, psicólogo-psicoanalista, psiquiatra, urólogo) a partir de la queja del paciente en texto libre.
- Generación de texto corto: el modelo responde únicamente con el nombre de la especialidad, sin explicaciones adicionales, siguiendo el formato de prompt indicado.
- Capacidad multilingüe limitada: entrenado exclusivamente en portugués brasileño; no se garantiza buen rendimiento en otros idiomas.
- No posee capacidades de razonamiento avanzado, tool calling, agente o visión por sí mismo; estas dependen del modelo base subyacente y no han sido explotadas en este adaptador.

## Casos de uso

- Triaje médico automatizado en portales de salud: el modelo puede recibir la descripción de un síntoma o queja y sugerir la especialidad médica a la que debería derivarse al paciente, agilizando la gestión de citas.
- Clasificación de tickets en sistemas de telemedicina: integrado en un backend de atención al paciente, permite enrutar consultas escritas al especialista correcto de manera automática.
- Asistente de pre-consulta en aplicaciones móviles: el modelo puede servir como primer filtro para que el paciente indique su motivo de consulta y reciba una recomendación de especialidad antes de hablar con un humano.
- Análisis de historiales clínicos no estructurados: dado un texto libre de un paciente (por ejemplo, de un formulario de ingreso), el modelo puede etiquetar la especialidad requerida, facilitando la organización de registros.
- Validación de pipelines de QLoRA para clasificación médica: este piloto sirve como referencia técnica para equipos que deseen replicar el flujo de entrenamiento con Gemma 3 1B en dominios verticales, gracias a su bajo consumo de recursos y tiempo de entrenamiento reducido.
- Prototipado de sistemas de apoyo a la decisión (no clínico): puede usarse en entornos de demostración o formación para ilustrar cómo un modelo de lenguaje pequeño puede realizar tareas de categorización con un ajuste mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de acurácia ni F1 macro sobre el conjunto de test en la información disponible. El autor indica que la evaluación de estas métricas aún no se ha realizado para este checkpoint. Los únicos datos reportados son las pérdidas durante el entrenamiento y validación:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 1,3377 |
| Eval loss (epoca 3) | 0,9459 |
| Duracion del entrenamiento | 31 minutos |
| Pico de VRAM | 5,61 GB |

Estos valores no son comparables directamente con los resultados del modelo Qwen3.5-0.8B del mismo proyecto, que fue entrenado sobre el dataset completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de VRAM durante el entrenamiento fue de 5,61 GB, por lo que la inferencia con el adaptador cargado en 4-bit cabe en GPUs con al menos 6 GB de VRAM.
- GPU recomendadas: RTX 4070 (12 GB) usada en el entrenamiento; también puede ejecutarse en RTX 3060 12 GB, RTX 4060 Ti 16 GB o GPUs de datacenter como A10 o L4.
- Compatibilidad con GPU consumer: sí, cabe en tarjetas de gama media de NVIDIA.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería Unsloth/FastLanguageModel, así como con Hugging Face Transformers + PEFT. No se han reportado integraciones con vLLM, llama.cpp u Ollama para este adaptador específico.
- Latencia y throughput: no disponibles; depende del hardware y del framework de inferencia utilizado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este adaptador. Como referencia, el mismo proyecto ha entrenado un modelo Qwen3.5-0.8B sobre el dataset completo (145K ejemplos), pero sus resultados no se han publicado en esta ficha. Tampoco se conocen otros adaptadores LoRA de triaje médico sobre Gemma 3 1B en portugués con métricas públicas. Por tanto, no es posible ofrecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Entrenamiento piloto: solo 500 ejemplos por clase, lo que no refleja el rendimiento esperado con el dataset completo (145K ejemplos). Los resultados de loss no deben interpretarse como indicadores de calidad final.
- Checkpoint base sin instruction tuning: al ser una variante `-pt`, el modelo es más sensible al formato exacto del prompt y puede producir respuestas fuera de las clases esperadas si el prompt se modifica.
- Confusión entre clases semánticamente solapadas: la clase "Psicólogo, Psicanalista" tiende a ser absorbida por la clase mayoritaria "Psicólogo", lo que provoca errores de clasificación en esos casos.
- No es un modelo de diagnóstico: está diseñado únicamente para triaje (derivación a especialidad) y no debe utilizarse para decisiones clínicas sin supervisión de un profesional sanitario.
- Idioma limitado: solo portugués brasileño; no se garantiza funcionamiento correcto en otras variantes del portugués ni en otros idiomas.
- Licencia Gemma: el uso del modelo está sujeto a los términos de la licencia Gemma de Google, que incluyen restricciones de uso comercial y obligaciones de atribución. Se recomienda revisar los términos completos antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matheus-ciro-tcc/gemma3-1b-triagem-medica-piloto
- Modelo base (unsloth/gemma-3-1b-pt): https://huggingface.co/unsloth/gemma-3-1b-pt
- Informe técnico de Gemma 3 (arXiv): https://arxiv.org/abs/2503.19786
- Página oficial de Gemma 3 (DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Dataset MedPT: https://huggingface.co/datasets/AKCIT/MedPT
