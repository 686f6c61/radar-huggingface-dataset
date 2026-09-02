# matheus-ciro-tcc/qwen35-0.8b-triagem-medica-piloto

## Resumen

El modelo `matheus-ciro-tcc/qwen35-0.8b-triagem-medica-piloto` es un adaptador LoRA (entrenado con QLoRA en 4-bit) sobre el modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por Matheus Marques Eiras y Ciro Guilherme Nass como parte de un trabajo de fin de grado en el Instituto Federal do Paraná (Brasil). Su función es clasificar la especialidad médica más adecuada a partir de la queja de un paciente escrita en texto libre, limitándose a 10 especialidades predefinidas y al portugués brasileño.

Se trata de un checkpoint piloto, entrenado con una muestra reducida de 500 ejemplos por clase (4.000 de entrenamiento, 500 de validación y 500 de prueba) extraídos del corpus público `AKCIT/MedPT`, que contiene 384.095 pares de preguntas y respuestas médicas. El objetivo del piloto fue validar el pipeline multi-modelo antes de entrenar con el dataset completo; por tanto, los resultados numéricos de este checkpoint no son comparables directamente con los obtenidos en el experimento previo con 145.000 ejemplos, que alcanzó una F1 macro de 0,7911.

La relevancia de este modelo radica en su aplicación práctica para sistemas de triaje médico automatizado en portugués, un ámbito con escasez de recursos específicos. Al estar basado en Qwen3.5-0.8B, un modelo multimodal de 0,8B parámetros con ventana de contexto nativa de 262K tokens, el adaptador hereda la arquitectura transformer del base, aunque el ajuste se realizó con una longitud de secuencia máxima de 1.024 tokens. El adaptador añade 6.389.760 parámetros entrenables sobre las proyecciones de atención y las capas MLP del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B) + adaptadores LoRA en q/k/v/o_proj y gate/up/down_proj |
| Parametros totales | 0,8B (modelo base) + 6.389.760 (adaptador LoRA) ≈ 0,806B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (entrenamiento); el base soporta hasta 262K tokens |
| Tipos de cuantizacion | NF4 4-bit (modelo base durante QLoRA); adaptador en bf16 |
| Idiomas soportados | Portugues (brasileno) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3.5-0.8B`, un transformer multimodal de Alibaba que soporta entrada de texto e imagen. Sin embargo, este adaptador se limita a la modalidad de texto. El entrenamiento emplea QLoRA: el modelo base se congela y se cuantiza en NF4 de 4 bits, mientras que se insertan adaptadores LoRA de rango 16 y alpha 32 en las proyecciones de atención (q/k/v/o) y en las capas de expansión y contracción del MLP (gate/up/down). El entrenamiento es supervisado (SFT) sin etapas de RLHF ni DPO, con un batch efectivo de 32 (batch 4 × acumulación de gradientes 8), tasa de aprendizaje 2e-4 con programación coseno, y 3 épocas equivalentes a 375 pasos. Se utiliza precisión bf16 y el optimizador `adamw_8bit`. El hardware empleado fue una RTX 4070 de 12 GB, con un pico de VRAM de 13,2 GB (posiblemente usando memoria unificada o swapping). El entrenamiento duró 13 minutos.

La tarea se define como clasificación cerrada de 10 especialidades médicas: Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista-traumatologista, Otorrino, Psicólogo, Psicólogo-Psicanalista, Psiquiatra y Urologista. El prompt de sistema instruye al modelo a responder únicamente con el nombre de la especialidad, sin explicaciones adicionales.

## Capacidades

- Clasificacion de especialidad medica en 10 categorias cerradas a partir de quejas de pacientes en portugues brasileno.
- Generacion de texto restringida a una salida corta (nombre de especialidad) mediante el template de chat de Qwen.
- Soporte de tool calling: no disponible; el modelo no ha sido entrenado para invocar funciones externas.
- Soporte de agentes y razonamiento multi-paso: no implementado; el modelo funciona exclusivamente como clasificador de una sola etiqueta.
- Capacidades multilingues: solo portugues brasileno; no se ha evaluado en otros idiomas.
- Capacidades especiales: el modelo base es multimodal (vision), pero el adaptador no aprovecha esta capacidad y solo procesa texto. Requiere desactivar el modo thinking (`enable_thinking=False`) para evitar bucles infinitos en la generacion.

## Casos de uso

- Triaje medico en portales de salud: un paciente introduce su sintomatologia en un formulario web y el modelo sugiere la especialidad adecuada, reduciendo el tiempo de espera en la asignacion de citas.
- Enrutamiento de citas en centros de salud: integrado en un sistema de gestion de pacientes, clasifica la queja y deriva automaticamente al departamento correspondiente, optimizando la carga de trabajo del personal administrativo.
- Clasificacion de mensajes en telemedicina: en plataformas de consulta remota, el modelo preclasifica las consultas entrantes para priorizar las que requieren atencion urgente o derivar a especialistas concretos.
- Soporte a secretarias medicas: asiste al personal no clinico en la interpretacion de quejas ambiguas, sugiriendo la especialidad probable y reduciendo errores de derivacion.
- Pre-clasificacion en sistemas de gestion hospitalaria: como modulo de un pipeline mas amplio, filtra y etiqueta mensajes de pacientes antes de que sean revisados por profesionales, mejorando la eficiencia del flujo de trabajo.
- Analisis de datos de quejas en investigacion: permite etiquetar automaticamente conjuntos de datos medicos en portugues para estudios epidemiologicos o de calidad asistencial, ahorrando tiempo de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de accuracy ni F1 para este checkpoint piloto. La model card unicamente reporta las siguientes metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 0,9443 |
| Eval loss (epoca 3) | 0,9370 |
| Duracion del entrenamiento | 13 minutos |
| Pico de VRAM | 13,2 GB |

El autor menciona que el experimento previo con el dataset completo (145.000 ejemplos) alcanzo una F1 macro de 0,7911, pero dicho resultado corresponde a otro checkpoint y no es directamente comparable con este piloto. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,8B cuantizado en 4-bit, la inferencia puede ejecutarse con menos de 2 GB de VRAM en GPU, o incluso en CPU con cuantizacion adicional.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) es suficiente para inferencia; la RTX 4070 de 12 GB utilizada en entrenamiento es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama baja y media.
- Opciones de despliegue: el adaptador se carga mediante la libreria `peft` o `unsloth`; para produccion puede fusionarse con el modelo base y exportarse a formatos como GGUF para usar con `llama.cpp` u Ollama, o servirse con vLLM si se convierte a un checkpoint completo.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 0,8B, se espera una latencia de pocos milisegundos por peticion en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos de la misma categoria. Como referencia, se puede comparar con el modelo base sin ajustar:

| Modelo | Parametros | Contexto | Licencia | Rendimiento en triaje |
|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | 262K | Apache 2.0 (segun web) | No ajustado para esta tarea |
| Adaptador piloto (este) | 0,8B + 6,39M LoRA | 1.024 (efectivo) | No disponible | Sin evaluacion publicada |
| Adaptador del dataset completo (Experimento 02) | similar | no especificado | No disponible | F1 macro 0,7911 |

No se han encontrado otros adaptadores publicos para triaje medico en portugues con los que comparar.

## Limitaciones y advertencias

- Entrenado en un piloto pequeno (500 ejemplos por clase); los resultados no son representativos del rendimiento con el dataset completo.
- La clase "Psicologo, Psicanalista" tiende a ser absorbida por la clase mayoritaria "Psicologo" debido a la solapamiento semantico casi total entre ambas.
- El modelo es de triaje, no de diagnostico; no debe utilizarse para decisiones clinicas sin supervision de un profesional sanitario.
- Entra en bucle infinito si se activa el modo thinking; es obligatorio desactivarlo (`enable_thinking=False`).
- Solo soporta portugues brasileno; no se ha evaluado en otras variantes del idioma.
- La licencia del adaptador no esta especificada, lo que genera incertidumbre sobre su uso comercial; el modelo base Qwen3.5-0.8B se distribuye bajo Apache 2.0 segun fuentes web, pero no se confirma para este adaptador.
- El repositorio de HuggingFace muestra un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar completamente subidos o que la metadata es incorrecta; se recomienda verificar antes de su uso.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/matheus-ciro-tcc/qwen35-0.8b-triagem-medica-piloto)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Dataset AKCIT/MedPT](https://huggingface.co/datasets/AKCIT/MedPT)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Articulo sobre Qwen3.5 0.8B](https://codersera.com/blog/run-and-benchmark-qwen35-08b/)
