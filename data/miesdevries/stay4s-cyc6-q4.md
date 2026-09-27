# miesdevries/stay4s-cyc6-q4

## Resumen

Stay4S Cyc6 SFT Q4 es un modelo de lenguaje en neerlandés publicado por el usuario miesdevries bajo el paraguas del proyecto Stay4S, descrito por su autor como un ecosistema de IA neerlandés "soberano" y autoalojado. Se trata de un ajuste supervisado (SFT) de un modelo base con arquitectura Llama, distribuido exclusivamente en formato GGUF y cuantizado en Q4_K_M, con un peso de fichero de aproximadamente 976 MB. Segun los datos del repositorio, el modelo tiene 1.673.889.792 parámetros totales (unos 1,67 mil millones), lo que lo sitúa en la categoría de modelos pequeños orientados a despliegue local.

El modelo está etiquetado para el idioma neerlandés (nl) y parece estar pensado para uso self-hosted, con soporte directo en Ollama mediante el comando `ollama run stay4s-lora`. La model card es muy escueta: no documenta la longitud de contexto, el dataset de entrenamiento, las técnicas de alineación ni resultados de evaluación. El repositorio aparece vinculado a la empresa Het Nieuwe Begin BV y a su autor, Mitchell de Vries, sin que se aporte información técnica adicional.

Su relevancia actual es limitada y muy específica: cubre el nicho de modelos pequeños en neerlandés ejecutables en hardware de consumo, un segmento con pocas alternativas nativas fuera de los grandes modelos multilingües. No obstante, la ausencia de benchmarks, de documentación de entrenamiento y de un número significativo de descargas o valoraciones (0 descargas y 0 likes en el momento de la consulta) implica que su madurez y fiabilidad no pueden verificarse con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, segun la model card) |
| Parametros totales | 1.673.889.792 (aprox. 1,67 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (976 MB); no se documentan otras |
| Idiomas soportados | neerlandes (nl) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,0 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La model card indica unicamente que el modelo sigue la "Llama architectuur", es decir, un transformer decoder-only. No se especifica si deriva de una familia concreta (Llama 2, Llama 3, Llama 3.2, etc.), el número de capas, la dimensión del modelo, el número de cabezas de atención ni la estrategia de tokenización. Dado el recuento de 1,67 mil millones de parámetros, es plausible que se trate de un modelo base de tamaño similar a la franja de 1-2 B, pero esto no se confirma en la documentación.

Tampoco hay información sobre el proceso de entrenamiento: no se documentan los tokens utilizados, la composición del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineación más allá del ajuste supervisado (SFT) que sugiere el nombre. No se mencionan innovaciones técnicas como decodificación especulativa, atención linear o arquitecturas híbridas. El modelo se distribuye ya cuantizado y no se ofrecen los pesos en precisión completa ni ficheros safetensors en el repositorio consultado.

## Capacidades

- Generación de texto en neerlandés, presumiblemente orientada a conversación y tareas generales de lenguaje, aunque no se detalla en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito para agentes o razonamiento multi-paso.
- Capacidad multilingüe: limitada al neerlandés según las etiquetas del repositorio (nl); no se declaran otros idiomas.
- No se declaran capacidades especiales como modo "thinking", visión, audio ni procesamiento de documentos.
- Ejecución local mediante Ollama (`ollama run stay4s-lora`) y descarga programática con `huggingface_hub`.

## Casos de uso

- Asistentes conversacionales en neerlandés autoalojados: el modelo puede integrarse en un chatbot local para atención en neerlandés, evitando el envío de datos a servicios en la nube, lo que encaja con la propuesta de "IA soberana" del proyecto.
- Prototipado y experimentación en hardware modesto: gracias a su cuantización Q4_K_M (976 MB), permite probar pipelines de generación de texto en portátiles, mini-PC o incluso Raspberry Pi sin necesidad de GPU dedicada.
- Procesamiento de texto neerlandés en entornos con restricciones de privacidad: clasificación, resumen o reescritura de documentos internos en neerlandés dentro de infraestructura propia.
- Desarrollo de aplicaciones educativas o de nicho en neerlandés: generación de ejercicios, explicaciones o material didáctico para hablantes de neerlandés.
- Base para ajuste fino adicional (fine-tuning): al ser un modelo pequeño y ya cuantizado en GGUF, puede servir como punto de partida para LoRA o adaptaciones específicas de dominio en neerlandés.
- Integración en entornos de desarrollo con Ollama: uso como endpoint local compatible con herramientas que consumen la API de Ollama, útil para pruebas de integración y CI en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (Q4_K_M, 976 MB de pesos): aproximadamente 1,5-2 GB contando la caché KV y el overhead del runtime, dependiendo de la longitud de contexto efectiva (no documentada).
- VRAM estimada en FP16 (si se reconvirtiera el modelo, ~3,3 GB de pesos): del orden de 4-6 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM para la versión Q4_K_M (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 3050 y superiores). Para FP16, se recomienda al menos una GPU de 4-6 GB (GTX 1660, RTX 2060, etc.).
- Compatibilidad con GPU de consumo: sí, la versión Q4_K_M cabe holgadamente en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Ollama (soporte indicado por el autor), llama.cpp, LM Studio y otros runtimes compatibles con GGUF. No se confirma soporte en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stay4S Cyc6 SFT Q4 | ~1,67 B | no disponible | other | GGUF en HuggingFace |
| Llama 3.2 1B (Meta) | ~1,24 B | 128 000 tokens | Llama 3.2 Community License | safetensors y GGUF |
| Qwen2.5 1.5B (Alibaba) | ~1,54 B | 32 768 tokens | Apache 2.0 | safetensors y GGUF |
| Gemma 2 2B (Google) | ~2,6 B | 8 192 tokens | Gemma License | safetensors y GGUF |

Nota: los datos de los modelos comparativos corresponden a especificaciones publicas ampliamente conocidas; no se dispone de resultados de benchmarks del modelo Stay4S Cyc6 para establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Licencia "other" sin texto detallado en la información disponible: no se puede confirmar si se permite el uso comercial ni bajo qué condiciones.
- Ausencia total de benchmarks y de documentación de entrenamiento: no hay evidencia publicada sobre calidad, sesgos o robustez.
- Contexto no documentado: se desconoce la ventana máxima soportada, lo que dificulta dimensionar despliegues con conversaciones largas.
- Idiomas: limitado al neerlandés según las etiquetas; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación: al tratarse de un modelo de ~1,67 B de parámetros, la tasa de errores factuales es previsiblemente elevada en tareas que requieran conocimiento amplio o razonamiento complejo.
- Actividad nula en el repositorio (0 descargas, 0 likes en la consulta): no existe validación por parte de la comunidad ni señales de mantenimiento.
- Sesgos: no documentados; los modelos pequeños entrenados en corpus limitados suelen heredar sesgos de dichos datos, pero no hay información al respecto.
- Advertencia para producción: sin información sobre licencia, contexto, dataset ni evaluaciones, no se recomienda su uso en entornos productivos sin una evaluación interna previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miesdevries/stay4s-cyc6-q4
- Sitio web del proyecto: stay4s.com
- Repositorio GitHub indicado en la model card: github.com/hetnieuwebeginbv-glitch
