# matheus-ciro-tcc/gemma3-1b-triagem-medica-final

## Resumen

Gemma 3 1B Triagem Médica es un adaptador LoRA (entrenado con QLoRA en 4 bits) sobre el modelo base `unsloth/gemma-3-1b-pt`, desarrollado por Matheus Marques Eiras y Ciro Guilherme Nass en el Instituto Federal de Paraná (Campus Pinhais), con la orientación de João Paulo Orlando, como parte de su trabajo de fin de curso. El modelo resuelve una tarea concreta de clasificación cerrada: asignar una de nueve especialidades médicas a partir de la queja de un paciente escrita en texto libre en portugués brasileño.

Se trata de un adaptador de bajo rango (rank 16, alpha 32) aplicado sobre las proyecciones de atención y el MLP de un transformer Gemma 3 de 1.000 millones de parámetros, con la base congelada y cuantizada en NF4. El entrenamiento se realizó sobre 145.321 ejemplos derivados del corpus público MedPT, con 3 épocas, un batch efectivo de 32 y una duración de aproximadamente 26,6 horas en una única RTX 4060 Laptop de 8 GB.

Su relevancia es doble: por un lado, demuestra que es posible ajustar un modelo sanitario especializado en hardware de consumo; por otro, publica un conjunto de evaluación completo (18.166 predicciones, matriz de confusión y métricas por clase) que hace el rendimiento auditable. El punto débil conocido es la clase Psiquiatra, con un F1 de 0,44, muy por debajo del resto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), adaptador LoRA sobre proyecciones de atención y MLP |
| Parametros totales | 1B (modelo base Gemma 3 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento con packing); contexto nativo del base no especificado en la información disponible |
| Tipos de cuantizacion | NF4 4-bit para la base (QLoRA); adaptadores en bf16 |
| Idiomas soportados | Portugués brasileño (pt) |
| Licencia | Gemma (sujeta a los Términos de Uso de Gemma) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); librería `peft` |
| Parametros entrenables | 13.045.760 (1,93% del total) |
| LoRA rank / alpha | 16 / 32 |
| Modulos adaptados | q/k/v/o_proj, gate/up/down_proj |
| Modelo base | unsloth/gemma-3-1b-pt-unsloth-bnb-4bit |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Gemma3ForCausalLM`, la variante solo texto de Gemma 3. La base permanece congelada y cuantizada en NF4 de 4 bits, mientras que los adaptadores se entrenan en bf16 sobre las proyecciones de query, key, value y output de la atención, así como en las proyecciones gate, up y down del MLP. El checkpoint base no incluye instruction tuning ni chat template, por lo que el pipeline aplica manualmente la plantilla `gemma-3` en tiempo de inferencia.

El entrenamiento siguió el esquema QLoRA con optimizador `adamw_8bit`, learning rate de 2e-4 con decaimiento coseno y 63 pasos de calentamiento, batch efectivo de 32 (batch 1 con acumulación de 32), 3 épocas y 2.112 pasos con packing hasta 1.024 tokens. La pérdida de entrenamiento media por época descendió de 0,978 a 0,644 y luego a 0,558; la de validación pasó de 0,732 a 0,601 y finalmente a 0,582, sin señales claras de sobreajuste en la curva reportada. Los datos provienen del corpus público MedPT (384.095 pares pregunta-respuesta médicos en portugués brasileño), del que se seleccionaron las diez especialidades más frecuentes y se fusionaron Psicólogo y Psicanalista en una sola clase, resultando en nueve categorías con split estratificado 80/10/10 y semilla 42.

## Capacidades

- Clasificación cerrada de especialidad médica entre nueve clases: Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista - traumatologista, Otorrino, Psicólogo, Psiquiatra y Urologista.
- Generación de texto conversacional con plantilla de chat `gemma-3` aplicada en inferencia.
- Procesamiento de quejas en texto libre en portugués brasileño, incluyendo lenguaje coloquial de paciente.
- Respuesta restringida a la etiqueta de especialidad, sin explicaciones adicionales, cuando se usa el prompt de sistema del ejemplo.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; es un adaptador de clasificación, no un asistente general.
- Capacidad multilingüe limitada al portugués: el ajuste se realizó exclusivamente sobre datos en pt.

## Casos de uso

- Triaje inicial en urgencias y centros de salud: el modelo recibe la queja del paciente y devuelve la especialidad a la que derivar, reduciendo el tiempo de clasificación manual en el mostrador y permitiendo priorizar la cola de atención.
- Preclasificación en portales de cita previa: integrado en el formulario web de un centro médico, sugiere la especialidad más probable para que el paciente confirme o corrija antes de reservar, con la ventaja de que el modelo cabe en una GPU de consumo.
- Enrutamiento de mensajes en atención al cliente sanitaria: los mensajes entrantes de un chat o buzón se etiquetan automáticamente para dirigirlos al departamento correspondiente, usando el prompt de sistema con la lista cerrada de clases.
- Filtrado y priorización de correos o tickets de pacientes: el modelo clasifica grandes volúmenes de consultas en lote (por ejemplo, 18.000 predicciones se generaron en el conjunto de prueba) para que el personal sanitario atienda primero las categorías críticas.
- Investigación y docencia en PLN clínico: sirve como línea base reproducible para experimentos de clasificación médica en portugués, con métricas por clase, matriz de confusión y predicciones completas publicadas para comparación.
- Prototipado en hardware limitado: al necesitar menos de 8 GB de VRAM en 4 bits, permite desplegar un clasificador médico funcional en una estación de trabajo con RTX 4060 o similar, sin infraestructura de servidor.
- Generación de datasets etiquetados: puede usarse para preetiquetar quejas médicas a gran escala antes de la revisión humana, siempre que se excluya la clase Psiquiatra o se revise manualmente por su bajo recall.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de prueba completo (18.166 ejemplos):

| Metrica | Valor |
|---|---:|
| Exactitud | 89,13% |
| F1 macro | 0,863 |
| Precisión macro | 0,882 |
| Recall macro | 0,854 |

F1 por clase:

| Clase | F1 |
|---|---:|
| Ortopedista - traumatologista | 0,97 |
| Oftalmologista | 0,97 |
| Dentista | 0,93 |
| Psicólogo | 0,92 |
| Dermatologista | 0,90 |
| Ginecologista | 0,90 |
| Otorrino | 0,90 |
| Urologista | 0,85 |
| Psiquiatra | 0,44 |

Comparación con los modelos del mismo autor bajo el mismo protocolo:

| Modelo | F1 macro | Recall de Psiquiatra |
|---|---:|---:|
| qwen35-2b-triagem-medica-final | 0,898 | 63% |
| qwen35-0.8b-triagem-medica-final | 0,881 | 63% |
| gemma3-1b-triagem-medica-final | 0,863 | 34% |

De los 1.975 errores, el 46,9% corresponden a la confusión Psiquiatra ↔ Psicólogo. La segunda confusión relevante es Urologista × Ginecologista (13% de los Urologistas mal clasificados). No se ha realizado evaluación cualitativa con juez GLM 5.3 ni revisión por profesionales médicos.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 8 GB en cuantización 4-bit NF4, dado que el entrenamiento alcanzó un pico de 7,08 GB en una RTX 4060 Laptop de 8 GB.
- GPU recomendadas: RTX 4060 Laptop (8 GB) es suficiente para el adaptador en 4 bits; RTX 4090, A100 o H100 aportan margen para lotes mayores y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060, 4060, 4070, etc.) usando cuantización 4-bit.
- Opciones de despliegue: la model card documenta el uso con la librería `unsloth` (`FastLanguageModel.from_pretrained` con `load_in_4bit=True` y `for_inference`). Para servir en producción, vLLM o TGI son compatibles con adaptadores PEFT, aunque no están documentados en la información disponible. llama.cpp y Ollama requerirían convertir el adaptador a GGUF, opción no documentada por el autor.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3-1b-triagem-medica-final | 1B | 1.024 tokens (entrenamiento) | 0,863 | Gemma | HuggingFace (adaptador PEFT) |
| qwen35-2b-triagem-medica-final | 2B | no disponible | 0,898 | no disponible | HuggingFace (adaptador PEFT) |
| qwen35-0.8b-triagem-medica-final | 0,8B | no disponible | 0,881 | no disponible | HuggingFace (adaptador PEFT) |

Los tres modelos pertenecen al mismo proyecto y comparten protocolo de evaluación, por lo que la comparación es directa. El Qwen de 2B obtiene el mejor F1 macro (0,898) y reconoce el 63% de los casos de Psiquiatra, frente al 34% del Gemma 3 1B. El Qwen de 0,8B, con menos parámetros, también supera al Gemma 3 1B en F1 macro y en recall de Psiquiatra. El Gemma 3 1B destaca en clases como Ortopedista, Oftalmologista y Dentista (F1 de 0,97, 0,97 y 0,93), pero su debilidad en Psiquiatra penaliza la media macro.

## Limitaciones y advertencias

- La clase Psiquiatra es claramente deficiente: F1 de 0,44 y recall del 34%, con el 63% de los casos reales predichos como Psicólogo. No es fiable para derivaciones a salud mental sin revisión humana.
- La segunda confusión relevante es Urologista × Ginecologista, con un 13% de los Urologistas mal clasificados.
- El conjunto de prueba está desbalanceado: Psicólogo concentra el 37% de los ejemplos, por lo que la exactitud del 89,13% sobreestima el rendimiento real; el F1 macro (0,863) es la métrica más honesta.
- No se ha realizado evaluación cualitativa con juez automático (GLM 5.3) ni revisión por profesionales médicos.
- Es un modelo de triaje, no de diagnóstico: no debe usarse para decisiones clínicas sin supervisión de un profesional sanitario.
- El idioma soportado es únicamente portugués brasileño; no se ha evaluado su comportamiento en otras lenguas.
- El contexto de entrenamiento es de 1.024 tokens; quejas muy largas pueden truncarse.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los Términos de Uso de Gemma antes de cualquier despliegue en producción.
- El checkpoint base no incluye chat template; es obligatorio aplicar la plantilla `gemma-3` manualmente o la inferencia fallará.
- Riesgo de alucinación inherente al modelo base: aunque la tarea es de clasificación cerrada, el modelo podría generar texto fuera de la lista de especialidades si no se restringe la generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matheus-ciro-tcc/gemma3-1b-triagem-medica-final
- Modelo piloto: https://huggingface.co/matheus-ciro-tcc/gemma3-1b-triagem-medica-piloto
- Modelo comparable Qwen 2B: https://huggingface.co/matheus-ciro-tcc/qwen35-2b-triagem-medica-final
- Modelo comparable Qwen 0.8B: https://huggingface.co/matheus-ciro-tcc/qwen35-0.8b-triagem-medica-final
- Dataset MedPT: https://huggingface.co/datasets/AKCIT/MedPT
- Carpeta de evaluación (métricas, matriz de confusión y predicciones): https://huggingface.co/matheus-ciro-tcc/gemma3-1b-triagem-medica-final/tree/main/avaliacao
- Términos de Uso de Gemma: https://ai.google.dev/gemma/terms
