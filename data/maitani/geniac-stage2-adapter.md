# Maitani/geniac-stage2-adapter

## Resumen

Maitani/geniac-stage2-adapter es un adaptador LoRA publicado en HuggingFace por el usuario Maitani, entrenado mediante supervisión fina (SFT) sobre el modelo base unsloth/Qwen3-4B-Base-unsloth-bnb-4bit, es decir, la versión base de Qwen3 de 4.000 millones de parámetros cuantizada a 4 bits con bitsandbytes por Unsloth. El repositorio contiene únicamente los pesos del adaptador PEFT en formato safetensors (0,5 GB), no un modelo completo, por lo que su uso requiere descargar y cargar previamente el modelo base indicado. La nomenclatura "stage2" sugiere que forma parte de una pipeline de ajuste por etapas, aunque la model card no documenta ninguna de las fases.

La relevancia de esta ficha es limitada por la ausencia casi total de documentación: la model card es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]", sin licencia declarada, sin idiomas declarados y sin resultados de evaluación. El adaptador acumula 25 descargas y 0 likes desde su publicación, y las fechas de creación y actualización registradas (octubre de 2026) no permiten extraer conclusiones adicionales.

Se trata, por tanto, de un artefacto experimental o de investigación interna más que de un modelo listo para producción. Esta ficha recoge los datos verificables del repositorio, marca explícitamente como "no disponible" todo lo que el autor no documenta y advierte de los riesgos de desplegar un adaptador sin licencia ni evaluación publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso; el modelo base es Qwen3-4B-Base |
| Parámetros totales | no disponible para el adaptador (el modelo base declarado tiene 4B de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; se hereda la del modelo base, sin confirmar |
| Tipos de cuantización | no disponible; el modelo base declarado está cuantizado a 4 bits (bitsandbytes, bnb-4bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos de adaptador LoRA, librería peft) |
| Rango LoRA y módulos objetivo | no disponible |
| Modelo base | unsloth/Qwen3-4B-Base-unsloth-bnb-4bit |
| Tamaño del repositorio | 0,5 GB |
| Librería declarada | peft (versión de framework citada: PEFT 0.21.1) |
| Pipeline | text-generation |
| Descargas / likes | 25 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) según la etiqueta `lora` y la librería `peft`, entrenado con ajuste supervisado (`sft`) usando las librerías `transformers`, `trl` y `unsloth`. Unsloth suele emplearse para reducir el consumo de memoria en el ajuste mediante kernels optimizados y cuantización de 4 bits, lo que encaja con el identificador del modelo base (variante `unsloth-bnb-4bit`). No se especifican el rango, el alpha, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni el número de épocas.

Respecto al modelo base, la model card no aporta ningún detalle: no indica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni si se aplicaron técnicas adicionales como decodificación especulativa. La model card no incluye tampoco la sección de infraestructura de cómputo (hardware, horas de GPU, proveedor ni emisiones de carbono), todas ellas marcadas como "[More Information Needed]". No se documenta ninguna innovación técnica propia del adaptador.

## Capacidades

- Generación de texto: la única capacidad confirmada por el pipeline declarado (`text-generation`). No hay ejemplos de salida ni evaluaciones cualitativas publicadas.
- Conversación: las etiquetas incluyen `conversational`, lo que sugiere un ajuste orientado a diálogo, pero no se documenta el formato de prompt ni la plantilla de chat empleada.
- Instrucciones: la etiqueta `sft` implica entrenamiento supervisado sobre pares instrucción-respuesta, sin detalle del dataset.
- Razonamiento, matemáticas y generación de código: no disponible; no se documentan capacidades específicas ni resultados que las respalden.
- Tool calling / function calling: no disponible.
- Uso como agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas de la model card no está rellenado.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no hay indicios de modalidades distintas del texto.
- Al ser un adaptador, todas las capacidades efectivas dependen del modelo base sobre el que se aplique y de que este se cargue con la configuración correcta.

## Casos de uso

Debido a la ausencia de licencia, evaluación y documentación, los casos de uso que se enumeran a continuación son hipotéticos y exigen validación previa por parte de quien los adopte. No se recomienda su uso en producción sin resolver antes esas lagunas.

- Prototipado e investigación interna: cargar el adaptador sobre Qwen3-4B-Base en un entorno de laboratorio para estudiar el efecto de un ajuste LoRA por etapas sobre un modelo de 4B, sin exponerlo a usuarios finales.
- Experimentos de ajuste incremental: usar este adaptador como "stage 2" de una pipeline propia, comparando su comportamiento frente al modelo base y frente a un ajuste de una sola etapa.
- Generación de texto asistida en dominio vertical: si el ajuste se realizó sobre un corpus especializado (por ejemplo, documentación técnica o atención al cliente), podría emplearse para redactar borradores, siempre con revisión humana y tras verificar el comportamiento real.
- Chatbot conversacional de bajo coste: al apoyarse en un modelo base de 4B cuantizado a 4 bits, el conjunto puede ejecutarse en hardware de gama media para asistentes internos con tráfico reducido, previa validación de calidad.
- Generación de datos sintéticos: emplear el adaptador para producir texto de dominio que alimente posteriores ciclos de ajuste, con filtrado y revisión manual obligatorios por el riesgo de alucinación.
- Evaluación comparativa de adaptadores LoRA: incluirlo como baseline en estudios sobre transferencia de conocimiento entre etapas de ajuste en modelos de la familia Qwen3.
- Investigación sobre eficiencia de despliegue: medir el coste de servir un adaptador LoRA sobre una base cuantizada a 4 bits frente a fusionar los pesos y servir un modelo completo.
- Docencia y demostraciones: ilustrar en un aula cómo se publica y se carga un adaptador PEFT con `transformers` y `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación con datos (la sección "Results" aparece como "[More Information Needed]"), y la búsqueda web realizada no devolvió ninguna fuente relevante sobre el modelo: los resultados obtenidos correspondían a dominios sin relación alguna con el proyecto.

## Requisitos de hardware

- Naturaleza del artefacto: es un adaptador LoRA de 0,5 GB, no un modelo autónomo. Requiere descargar además el modelo base (Qwen3-4B-Base, en su variante cuantizada a 4 bits) para poder inferir.
- VRAM estimada: no disponible en la información proporcionada. Como referencia estructural, un modelo de 4B en precisión de 4 bits ocupa aproximadamente 3 GB de pesos, a los que hay que sumar el adaptador, la caché KV y el overhead del runtime; no se dispone de mediciones publicadas para esta combinación concreta.
- GPU recomendadas: no disponible; no se documenta el hardware empleado ni el validado.
- GPU de consumo: no confirmado. Por tamaño del modelo base (4B), es plausible que quepa en GPU de consumo con 8-12 GB de VRAM en cuantización de 4 bits, pero esta afirmación no está respaldada por datos del repositorio.
- Opciones de despliegue: PEFT + transformers es el camino documentado implícitamente por las etiquetas del repositorio. vLLM admite adaptadores LoRA, y llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertirlo a GGUF, algo que el autor no documenta. No hay instrucciones de uso ni fragmento de código en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparación se limita a aspectos estructurales y de disponibilidad. Los valores del modelo base se incluyen como referencia del punto de partida, no como resultado del ajuste.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maitani/geniac-stage2-adapter | Adaptador LoRA (SFT) | no disponible (base de 4B) | no disponible | no disponible | 25 descargas, 0 likes |
| unsloth/Qwen3-4B-Base-unsloth-bnb-4bit | Modelo base cuantizado a 4 bits | 4B (según identificador) | no disponible en esta información | no disponible en esta información | Repositorio público en HuggingFace |
| Otros adaptadores LoRA sobre Qwen3-4B | Adaptador LoRA | no disponible | no disponible | variable | no disponible |

No se han identificado alternativas equivalentes de la misma categoría con datos verificables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial. En ausencia de términos, debe asumirse que no se concede permiso de explotación y contactar con el autor antes de cualquier uso productivo.
- Model card vacía: todos los campos relevantes (uso previsto, uso fuera de alcance, sesgos, datos de entrenamiento, hiperparámetros, evaluación) están marcados como "[More Information Needed]". No hay información sobre qué datos se usaron, lo que impide auditar sesgos o contaminación de benchmarks.
- Riesgo de alucinación: no evaluado. No existen métricas de fidelidad ni de tasas de error, por lo que el riesgo es desconocido y debe tratarse como alto en cualquier aplicación sensible.
- Sesgos conocidos: no disponibles. Sin documentación del corpus de ajuste no puede descartarse la amplificación de sesgos presentes en él o en el modelo base.
- Idiomas soportados sin especificar: no hay garantía de calidad en castellano ni en ningún otro idioma concreto.
- Dependencia estricta del modelo base: el identificador apunta a una variante cuantizada a 4 bits con bitsandbytes de Unsloth. Cargar el adaptador sobre una base distinta (por ejemplo, Qwen3-4B-Base sin cuantizar o una variante instruct) puede degradar o invalidar el comportamiento.
- Sin plantilla de chat documentada: al tratarse de un ajuste SFT sobre una base no instruct, aplicar un formato de prompt incorrecto producirá salidas degradadas.
- Repositorio de baja tracción: 25 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de errores.
- Fechas del repositorio inconsistentes con el calendario actual (creación y actualización en octubre de 2026), lo que dificulta situar el trabajo en una línea temporal de versiones del modelo base.
- Resultados de la búsqueda web no relevantes: las consultas devolvieron únicamente dominios de contenido para adultos sin relación con el modelo, por lo que no se ha podido corroborar ninguna información externa.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Maitani/geniac-stage2-adapter
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Paper citado en las etiquetas del repositorio (arXiv:1910.09700, Lacoste et al., Quantifying the Carbon Emissions of Machine Learning): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este adaptador en la búsqueda web realizada.
