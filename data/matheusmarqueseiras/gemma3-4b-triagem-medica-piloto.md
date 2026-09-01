# MatheusMarquesEiras/gemma3-4b-triagem-medica-piloto

## Resumen

Modelo de adaptadores LoRA (QLoRA, 4-bit) sobre la base `unsloth/gemma-3-4b-pt`, desarrollado por Matheus Marques Eiras como parte de un trabajo de fin de grado en el Instituto Federal do Paraná (Brasil). Su función es clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre, en portugués brasileño. Se trata de un piloto de validación del pipeline de entrenamiento, no del modelo final.

El adaptador se entrenó sobre 500 ejemplos por clase (4.000 de entrenamiento) extraídos del corpus público MedPT, con una tarea de clasificación cerrada entre 10 especialidades. La arquitectura subyacente es la de Gemma 3 4B, un transformer multimodal de Google DeepMind, aunque aquí solo se utilizan las capas de lenguaje. El checkpoint pesa 0,2 GB y se distribuye en formato safetensors con licencia Gemma. Su relevancia radica en demostrar la viabilidad de un sistema de triaje médico automático en portugués con modelos abiertos de pequeño tamaño, aunque los resultados son preliminares y no representan el rendimiento final del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B), uso solo de texto |
| Parametros totales | 4B (modelo base) + 29.802.496 (adaptador LoRA) |
| Parametros activos | 29.802.496 (adaptador) |
| Longitud de contexto | 128K (modelo base), 1024 usado en entrenamiento |
| Tipos de cuantizacion | NF4 4-bit (QLoRA) para entrenamiento; inferencia con `load_in_4bit=True` |
| Idiomas soportados | Portugues (pt) |
| Licencia | Gemma license |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en `unsloth/gemma-3-4b-pt`, una version de Gemma 3 4B optimizada para portugues. Gemma 3 es un transformer multimodal con atencion por ventanas y soporte de contexto largo, aunque en esta tarea solo se emplean las capas de lenguaje. El entrenamiento utilizo QLoRA: la base quedo congelada y cuantizada en NF4 de 4 bits, y los adaptadores LoRA se aplicaron a las capas de atencion y MLP de las capas de lenguaje, con rank 16 y alpha 32. El dataset piloto consta de 500 ejemplos por clase (4.000 de entrenamiento, 500 de validacion y 500 de test) con split estratificado 80/10/10 y seed 42, extraidos del corpus MedPT (384.095 pares de preguntas y respuestas medicas en portugues brasileño). El entrenamiento duro 3 horas y 8 minutos en una RTX 4070 de 12 GB, con un pico de VRAM de 10,36 GB, usando precision bf16 y optimizador `adamw_8bit`. No se aplicaron tecnicas de RLHF ni DPO; el metodo fue SFT supervisado clasico.

## Capacidades

- Clasificacion de especialidad medica en 10 clases cerradas: Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista-traumatologista, Otorrino, Psicologo, Psicologo-Psicoanalista, Psiquiatra y Urologista.
- Generacion de texto en portugues brasileño, con respuesta corta (solo el nombre de la especialidad) siguiendo la plantilla de chat de Gemma.
- Soporte de chat multi-turno gracias al formato de mensajes de Gemma 3 (system, user, assistant).
- No soporta tool calling ni funciones de agente; es un modelo de clasificacion especifico, no generalista.
- Capacidad multilingue limitada al portugues (el modelo base soporta 140+ idiomas, pero el adaptador solo fue entrenado en portugues).
- No incluye capacidades de vision en este adaptador; las capas multimodales quedaron congeladas.

## Casos de uso

- Triaje medico en centros de salud: el modelo puede recibir la queja del paciente en texto libre y sugerir la especialidad a la que derivarlo, agilizando el proceso de admision en clinicas y hospitales con bajo volumen de personal.
- Chatbots de atencion primaria: integrado en un asistente conversacional, clasifica la especialidad antes de derivar al usuario a un profesional concreto, reduciendo el tiempo de espera en consultas telefonicas o web.
- Sistemas de citas automaticas: conectado a una API de reservas, asigna automaticamente la especialidad correcta a partir de la descripcion del sintoma, evitando errores de derivacion manual.
- Soporte a personal administrativo: como herramienta de ayuda para recepcionistas sin formacion medica, que pueden introducir la queja del paciente y obtener una sugerencia de especialidad antes de confirmar la cita.
- Filtrado de urgencias en telemedicina: en plataformas de consulta remota, clasifica la especialidad antes de conectar con el medico, optimizando el enrutamiento de las llamadas.
- Evaluacion de pipelines de QLoRA en dominios especializados: sirve como caso de estudio para validar la viabilidad de ajuste fino de modelos Gemma en tareas de clasificacion medica con recursos limitados, util para investigadores que replican el metodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de clasificacion (accuracy, F1) en la informacion disponible. Los unicos datos reportados son las perdidas del piloto:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 0,8646 |
| Eval loss (epoca 3) | 0,7921 |
| Duracion del entrenamiento | 3 h 08 min |
| Pico de VRAM | 10,36 GB |

El autor indica explicitamente que la evaluacion de accuracy y F1 macro sobre el conjunto de test no se ha ejecutado aun para este checkpoint. Estos numeros no son comparables con los resultados finales del proyecto, que utilizo un dataset completo de 145.000 ejemplos con otro modelo (Qwen3.5-0.8B).

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento alcanzo un pico de 10,36 GB en una RTX 4070 de 12 GB; la inferencia con cuantizacion 4-bit deberia requerir menos, aproximadamente 6-8 GB, dependiendo de la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4070, A10, L4) es suficiente para inferencia. Para entrenar el adaptador se necesitan 12 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4070 o superiores.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `unsloth/gemma-3-4b-pt` junto con los pesos LoRA. Se puede usar con la libreria Unsloth (como en el ejemplo de la model card), con Hugging Face Transformers + PEFT, o con vLLM si se fusionan los adaptadores. Tambien es posible exportar a GGUF para usar con llama.cpp u Ollama, aunque no se indica en la documentacion.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 4B cuantizado en 4-bit, se espera una generacion de entre 20 y 50 tokens por segundo en una GPU moderna de consumo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos en la informacion proporcionada. El autor menciona que el mismo proyecto probo un Qwen3.5-0.8B con el dataset completo, pero no ofrece numeros comparables para este piloto. Como alternativa de la misma categoria, existe `google/medgemma-4b-it`, un modelo de Google ajustado para el dominio medico, pero no se han publicado comparaciones directas con este adaptador. Por tanto, la comparativa queda pendiente de los resultados finales del proyecto.

## Limitaciones y advertencias

- Es un piloto entrenado con solo 500 ejemplos por clase; los resultados no reflejan el rendimiento con el dataset completo y pueden presentar un sesgo considerable.
- La clase "Psicologo-Psicoanalista" tiende a ser absorbida por "Psicologo" debido a su solapamiento semantico casi total, lo que degrada la precision en esa categoria.
- El modelo es de triaje, no de diagnostico; no debe utilizarse para decisiones clinicas sin supervision de un profesional sanitario.
- Solo esta entrenado en portugues brasileño; su uso en otros idiomas o variantes del portugues puede dar resultados incorrectos.
- Al ser un adaptador LoRA, depende del modelo base `unsloth/gemma-3-4b-pt`; si este cambia o se retira, el adaptador puede dejar de funcionar correctamente.
- La licencia Gemma impone restricciones de uso comercial (terminos de la licencia de Google), que deben revisarse antes de un despliegue en produccion.
- No se han evaluado sesgos de genero, raza o edad en las quejas medicas; el corpus MedPT puede contener sesgos propios de datos de usuarios.
- No hay garantia de que las respuestas sean siempre una de las 10 especialidades validas; en casos ambiguos puede generar una especialidad incorrecta o una respuesta fuera de la lista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatheusMarquesEiras/gemma3-4b-triagem-medica-piloto
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-pt
- Dataset MedPT: https://huggingface.co/datasets/AKCIT/MedPT
- Pagina oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Informe tecnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786v1
- Modelo MedGemma 4B IT: https://huggingface.co/google/medgemma-4b-it
