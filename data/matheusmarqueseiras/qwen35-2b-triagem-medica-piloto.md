# MatheusMarquesEiras/qwen35-2b-triagem-medica-piloto

## Resumen

El modelo `MatheusMarquesEiras/qwen35-2b-triagem-medica-piloto` es un adaptador LoRA (entrenado con QLoRA en 4 bits) sobre el modelo base `Qwen/Qwen3.5-2B`, desarrollado por Matheus Marques Eiras como parte de un trabajo de fin de grado en el Instituto Federal do Paraná (Brasil). Su función es clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre, en portugués brasileño, entre 10 especialidades predefinidas (dentista, dermatólogo, ginecólogo, oftalmólogo, ortopedista, otorrino, psicólogo, psicólogo-psicoanalista, psiquiatra y urólogo).

Se trata de un piloto experimental: el adaptador fue entrenado sobre una muestra reducida de 500 ejemplos por clase (4.000 de entrenamiento, 500 de validación y 500 de prueba) extraídos del corpus público `AKCIT/MedPT`, con el objetivo de validar el pipeline antes de entrenar sobre el dataset completo de 145.000 ejemplos. Por tanto, los resultados reportados no son representativos del rendimiento final del proyecto. La relevancia de este modelo radica en demostrar la viabilidad de ajustar un modelo de 2.000 millones de parámetros con técnicas de bajo rango (LoRA) para una tarea de clasificación médica específica, con un coste computacional modesto (28 minutos en una RTX 4070).

La arquitectura subyacente es un transformer de la familia Qwen3.5 con 2.000 millones de parámetros, y el adaptador añade 10,9 millones de parámetros entrenables. Se recomienda desactivar el modo de razonamiento (`enable_thinking=False`) durante la inferencia para evitar bucles infinitos, una limitación documentada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B) con adaptadores LoRA |
| Parametros totales | 2.000 millones (base) + 10.911.744 (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (configurado en el entrenamiento) |
| Tipos de cuantizacion | NF4 4-bit (QLoRA), bf16 |
| Idiomas soportados | Portugues (variante brasileña) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (alpha 32) aplicado a las proyecciones de atención (`q/k/v/o_proj`) y a las capas del MLP (`gate/up/down_proj`) del modelo base Qwen3.5-2B, que permanece congelado y cuantizado en NF4 de 4 bits. El entrenamiento se realizó con QLoRA y optimizador `adamw_8bit`, con precisión bf16, un batch efectivo de 32 (batch 2 × acumulación de gradientes 16), una tasa de aprendizaje de 2e-4 con programación coseno y 3 épocas (375 pasos). El dataset de entrenamiento proviene de `AKCIT/MedPT`, un corpus público de 384.095 pares de preguntas y respuestas médicas en portugués brasileño, del que se seleccionaron 500 ejemplos por clase para el piloto. No se aplicó RLHF ni DPO; el ajuste fue supervisado (SFT) con la plantilla de chat de Qwen, y la consigna del sistema pide al modelo responder únicamente con el nombre de la especialidad.

## Capacidades

- Clasificacion de especialidad medica en 10 clases cerradas a partir de quejas de pacientes en texto libre.
- Generacion de texto restringida a una unica etiqueta (no genera explicaciones si se sigue el prompt del sistema).
- Soporte de chat multi-turno gracias al template de chat de Qwen.
- Capacidad multilingue limitada: entrenado solo en portugues brasileño, aunque el modelo base es multilingue.
- No soporta tool calling ni funciones de agente.
- No dispone de modo de vision ni audio.
- Modo de razonamiento (thinking) desaconsejado: provoca bucles infinitos, por lo que debe usarse con `enable_thinking=False`.

## Casos de uso

- Triaje medico en consultas online: el modelo puede clasificar la especialidad adecuada a partir de la descripcion de sintomas del paciente, permitiendo derivar la consulta al profesional correcto en plataformas de telemedicina.
- Sistemas de recomendacion de especialistas: integrado en un backend que recibe la queja del paciente y devuelve la especialidad, puede alimentar motores de busqueda de citas medicas.
- Preclasificacion en centros de salud: usado como primer filtro en formularios de admision, ayuda a reducir el tiempo de espera al dirigir al paciente al servicio adecuado.
- Asistente de documentacion clinica: en un entorno hospitalario, puede sugerir la especialidad correcta en notas de enfermeria o registros de urgencias.
- Educacion medica: como herramienta de practica para estudiantes, muestra la especialidad esperada ante una queja dada, apoyando el aprendizaje de triaje.
- Validacion de datasets medicos: puede utilizarse para comprobar la coherencia entre quejas y especialidades en corpus etiquetados, detectando posibles errores de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de accuracy ni F1 macro sobre el conjunto de prueba para este checkpoint. La model card solo reporta las siguientes metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 0,8445 |
| Eval loss (epoca 3) | 0,8455 |
| Duracion del entrenamiento | 28 minutos |
| Pico de VRAM | 7,73 GB |

El autor indica que la evaluacion de accuracy y F1 macro no se ha ejecutado aun, y que los numeros de este piloto no son comparables con los resultados finales del modelo Qwen3.5-0.8B del mismo proyecto, que ya se entreno sobre el dataset completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en 4-bit (según el pico de 7,73 GB durante el entrenamiento con batch 2; en inferencia con batch 1 puede ser menor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, por ejemplo RTX 3060, RTX 4070, RTX 4080, o GPUs de datacenter como A10G.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: el codigo de ejemplo usa Unsloth (`FastLanguageModel`), pero al ser un adaptador PEFT tambien puede cargarse con la libreria `transformers` + `peft`. Para produccion pueden usarse vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se han publicado datos; con `max_new_tokens=20` y `do_sample=False`, la generacion es rapida (inferior a 1 segundo en GPU moderna).

## Comparativa con modelos similares

No disponible. El proyecto del autor incluye un modelo comparable, `MatheusMarquesEiras/qwen35-medpt-500` (tambien basado en Qwen3.5-2B y entrenado sobre el mismo piloto), pero no se dispone de datos de rendimiento publicados para ninguno de los dos. No se han encontrado otros modelos de clasificacion de especialidades medicas en portugues brasileño con los que se pueda comparar de forma fiable.

## Limitaciones y advertencias

- Entrenado sobre una muestra piloto de 500 ejemplos por clase; el rendimiento real sobre el dataset completo puede diferir significativamente.
- La clase "Psicologo - Psicoanalista" tiende a ser absorbida por la clase "Psicologo" debido a su solapamiento semantico, lo que reduce la precision en esa categoria.
- El modelo no debe utilizarse para decisiones clinicas reales; es una herramienta de triaje, no un sistema de diagnostico.
- No se recomienda activar el modo de razonamiento (`thinking`) porque provoca bucles infinitos en la generacion.
- La licencia del modelo no esta especificada, lo que genera incertidumbre sobre su uso comercial.
- Solo cubre 10 especialidades y esta limitado al portugues brasileño; no generaliza a otros idiomas ni a especialidades fuera de ese conjunto.
- No se han evaluado sesgos potenciales relacionados con genero, edad o nivel socioeconomico en las quejas de los pacientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatheusMarquesEiras/qwen35-2b-triagem-medica-piloto
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B (y en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-2B)
- Dataset AKCIT/MedPT: https://huggingface.co/datasets/AKCIT/MedPT
- Otro modelo del mismo proyecto: https://huggingface.co/MatheusMarquesEiras/qwen35-medpt-500
