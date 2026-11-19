# mku1988/medgemma-ct-fibrosis

## Resumen

medgemma-ct-fibrosis es un adaptador LoRA (PEFT) publicado por el usuario mku1988 sobre el modelo base unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit, una variante cuantizada a 4 bits de MedGemma 1.5 de 4.000 millones de parametros orientada a tareas de imagen-texto en el dominio medico. El adaptador está especializado en radiología de tomografía computarizada (CT) y, de forma específica, en fibrosis pulmonar, según declaran los metadatos del repositorio. El pipeline declarado es image-text-to-text, por lo que el modelo recibe una imagen médica y un prompt textual y genera una respuesta en lenguaje natural.

El interés de esta ficha es acotado: no se trata de un modelo fundacional nuevo, sino de un ajuste fino ligero (LoRA) sobre un modelo médico ya existente, con un conjunto de datos de entrenamiento no documentado públicamente en la información disponible. El repositorio tiene 0,1 GB, lo que es coherente con un adaptador LoRA y no con pesos completos. En el momento de la consulta registra 0 descargas y 0 likes, y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face.

La relevancia práctica es limitada pero concreta: sirve como ejemplo de especialización de un modelo médico multimodal de tamano medio (4B) mediante LoRA y cuantización de 4 bits, un patrón habitual para prototipado en entornos con recursos de GPU modestos. No obstante, la ausencia de documentación sobre datos de entrenamiento, métricas y procedimiento de evaluación impide validar su rendimiento clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre MedGemma 1.5 4B IT (transformer multimodal imagen-texto) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base es de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | health-ai-developer-foundations (licencia "other" en metadatos) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la librería Unsloth sobre unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit, una versión del modelo MedGemma 1.5 4B instruction-tuned cuantizada a 4 bits. El modelo base es un transformer multimodal de tipo image-text-to-text, orientado a preguntas y respuestas sobre imágenes médicas. El adaptador en sí no modifica la arquitectura del modelo base: añade matrices de bajo rango en capas seleccionadas, cuyo rango, alpha, capas objetivo y demás hiperparámetros no se detallan en la información disponible.

No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, si se emplearon imágenes CT anotadas de fibrosis pulmonar, ni si hubo etapas de RLHF o DPO. Tampoco se documenta el procedimiento de evaluación ni la partición train/validation/test. La única indicación sobre el dominio es la colección de etiquetas del repositorio: medical, radiology, computed-tomography, pulmonary-fibrosis, lora, unsloth, medgemma.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en el dominio médico, según el pipeline declarado.
- Descripción e interpretación de imágenes de tomografía computarizada, con especialización declarada en fibrosis pulmonar.
- Respuesta a preguntas en lenguaje natural sobre hallazgos radiológicos, en la medida en que lo permita el modelo base MedGemma 1.5 4B IT.
- Soporte multilingüe limitado al inglés según los metadatos del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de asistencia a la lectura de CT torácica: el adaptador puede emplearse para generar descripciones preliminares de estudios CT con sospecha de fibrosis pulmonar, como paso previo a la revisión por un radiólogo. Es adecuado por su especialización declarada y su tamano reducido, que permite iterar rápido en un entorno de investigación.
- Investigación en visión-lenguaje médica: sirve como punto de partida para experimentos de ajuste fino con LoRA sobre MedGemma, comparando distintos adaptadores especializados por patología con un coste de entrenamiento bajo.
- Generación de borradores de informes radiológicos: el modelo puede producir texto estructurado a partir de una imagen y un prompt, que después se revisa y edita manualmente; útil para medir ahorro de tiempo en flujos documentales simulados.
- Docencia y formación: construcción de ejercicios interactivos en los que el alumno plantea preguntas sobre una imagen CT y el modelo responde en inglés, siempre con supervisión y sin uso clínico directo.
- Evaluación comparativa de adaptadores médicos: al ser un LoRA ligero (0,1 GB), se puede desplegar junto a otros adaptadores sobre el mismo modelo base para comparar respuestas sobre el mismo conjunto de imágenes.
- Filtrado y triaje experimental de estudios: en un pipeline de investigación, el modelo puede clasificar o resumir hallazgos compatibles con fibrosis en grandes volúmenes de imágenes, con validación humana obligatoria y sin uso diagnóstico.
- Integración en cuadernos de experimentación: al cargarse con PEFT sobre el modelo base cuantizado a 4 bits, encaja en entornos de GPU de gama media para pruebas rápidas de prompts y de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el modelo base está cuantizado a 4 bits y tiene 4B de parámetros, por lo que se espera un consumo en el rango de varios GB, aunque la cifra concreta no se documenta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la cuantización a 4 bits del modelo base sugiere que podría ejecutarse en GPUs de consumo con VRAM suficiente, pero no se aporta confirmación.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), con posible uso de Transformers; vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mku1988/medgemma-ct-fibrosis | Adaptador LoRA sobre base de 4B | No disponible | CT torácica / fibrosis pulmonar | health-ai-developer-foundations | Gated en Hugging Face |
| unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit (base) | 4B | No disponible | Médico multimodal general | Según modelo original MedGemma | Público en Hugging Face |
| MedGemma 1.5 4B IT (original) | 4B | No disponible | Médico multimodal general | health-ai-developer-foundations | Gated en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: no se documenta validación clínica, y no debe usarse para diagnóstico ni para decisiones terapéuticas.
- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce el origen, tamano y anotación de las imágenes CT empleadas, lo que impide evaluar sesgos y generalización.
- Riesgo de alucinación: como modelo generativo de lenguaje, puede producir descripciones radiológicas plausibles pero incorrectas; requiere revisión humana en cualquier uso.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dominio acotado, puede sobrerrepresentar patrones de fibrosis y fallar en otras patologías torácicas.
- Limitación de idioma: solo se declara inglés, lo que restringe su uso en entornos clínicos en castellano.
- Licencia health-ai-developer-foundations: impone condiciones específicas para uso comercial y sanitario; es necesario revisar los términos antes de cualquier despliegue. El repositorio es de acceso restringido (gated).
- Contexto máximo no documentado: se desconoce la ventana de contexto efectiva del modelo base en esta configuración.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de revisión por terceros.
- El adaptador depende de un modelo base cuantizado a 4 bits de Unsloth, lo que puede introducir degradaciones adicionales respecto al modelo original en precisión completa.

## Enlaces

- Hugging Face: https://huggingface.co/mku1988/medgemma-ct-fibrosis
- Modelo base: https://huggingface.co/unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
