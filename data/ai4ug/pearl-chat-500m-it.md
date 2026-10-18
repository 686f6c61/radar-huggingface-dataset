# ai4ug/pearl-chat-500m-it

## Resumen

Pearl Chat 500M IT es un modelo de lenguaje causal e instruccional desarrollado por ai4ug, orientado a conversaciones en luganda (lg) e inglés (en). Con 466.682.112 parámetros (~467 M), se presenta como una alternativa ligera para IA conversacional en una lengua africana de bajos recursos, un ámbito con escasa cobertura de modelos abiertos. La información disponible lo vincula a la arquitectura denominada "pearlchat_v2" y a las librerías Flax/JAX con NNX.

El modelo se distribuye en HuggingFace con pesos safetensors y un repositorio de 1,7 GB, bajo licencia Apache-2.0, aunque el acceso es restringido (gated). Los tags indican que ha sido ajustado para instrucciones y diálogo, y los datasets enlazados (luganda_prose y luganda_qa_pairs) sugieren un entrenamiento basado en prosa lugandesa y pares de pregunta-respuesta.

Su relevancia actual radica en la combinación de tamaño reducido, enfoque multilingüe luganda-inglés y licencia permisiva, lo que facilita experimentación y despliegue en entornos con recursos limitados. No obstante, no se han publicado especificaciones detalladas sobre contexto, cuantización, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pearlchat_v2 (modelo causal autorregresivo; detalles no disponibles) |
| Parámetros totales | 466.682.112 (~467 M) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Luganda (lg) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; Flax/JAX |
| Framework | Flax, JAX, NNX |
| Pipeline | text-generation |
| Acceso | Restringido (gated) en HuggingFace |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un causal-lm, es decir, un modelo autorregresivo para generación de texto, identificado con la arquitectura "pearlchat_v2". Está implementado con Flax, JAX y NNX, lo que sitúa su ecosistema natural en el aprendizaje automático con JAX. No se detallan el número de capas, la dimensionalidad oculta, el mecanismo de atención ni posibles innovaciones técnicas como atención lineal o decodificación especulativa.

En cuanto a los datos, los tags enlazan los conjuntos ai4ug/luganda_prose y ai4ug/luganda_qa_pairs, lo que apunta a un entrenamiento con prosa en luganda y pares de pregunta-respuesta. El modelo aparece como instruction-tuned, pero no se especifica el volumen de tokens, la composición exacta del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan procesos de filtrado, deduplicación o evaluación intermedia.

## Capacidades

- Generación de texto conversacional en luganda e inglés.
- Ajuste instruccional para seguir indicaciones y mantener diálogos multi-turno.
- Generación autoregresiva propia de un modelo causal.
- Entrenamiento orientado a prosa y pares de pregunta-respuesta, lo que favorece tareas de conversación y respuesta a preguntas.
- Cobertura limitada a los idiomas declarados (lg, en); no se documentan otras lenguas.
- No se ha documentado soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha documentado visión, audio, modo "thinking" ni capacidades matemáticas o de código.
- No se han publicado evaluaciones específicas de capacidades.

## Casos de uso

- Atención al ciudadano en luganda: el modelo puede gestionar preguntas frecuentes sobre servicios públicos, salud o agricultura en conversaciones cortas, y su tamaño de ~467 M permite desplegarlo en servidores modestos. Es adecuado para entornos con presupuesto limitado, aunque requiere validación humana por la ausencia de benchmarks.
- Tutor de conversación inglés-luganda: puede practicar diálogos, explicar vocabulario y responder preguntas básicas en ambos idiomas. Los datasets de QA sugieren cierta especialización en pares pregunta-respuesta, útil para educación básica y aprendizaje de idiomas.
- Apoyo a la redacción en luganda: dado el entrenamiento con prosa lugandesa, puede ayudar a redactar borradores, resumir textos o proponer reformulaciones. Se recomienda revisión humana por posibles errores gramaticales o de registro.
- Generación de pares pregunta-respuesta para ampliar datasets: el modelo puede producir QA sintéticas en luganda que, tras un filtrado manual o automático, sirvan para aumentar corpus de entrenamiento o evaluación en investigación lingüística.
- Chatbot de bajo consumo para ONG y proyectos comunitarios: al ser un modelo pequeño, puede ejecutarse en CPU o en GPUs de gama baja, lo que facilita su uso en zonas con infraestructura limitada. Ideal para consultas breves y guiones predefinidos.
- Investigación lingüística y preservación digital: puede emplearse para generar ejemplos, explorar estructuras morfosintácticas o convertir contenido textual en formato conversacional. Su utilidad requirió de evaluación específica por parte de lingüistas.
- Integración en aplicaciones de mensajería: puede conectarse a interfaces de chat para responder en luganda en plataformas de mensajería, con la advertencia de que la longitud de contexto no está documentada y conviene limitar la extensión de las conversaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,0-2,0 GB, incluyendo pesos (~0,93 GB) y overhead para caché KV en contextos cortos. Es una estimación teórica, no una cifra oficial.
- VRAM estimada en INT8: aproximadamente 0,6-1,2 GB; en INT4: aproximadamente 0,4-0,9 GB. No se confirma que el repositorio incluya pesos cuantizados ni que se soporten estos formatos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para FP16, como GTX 1650, RTX 3050, RTX 4060 o superiores. También puede ejecutarse en CPU con 8-16 GB de RAM, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en modelos de gama baja y media. Para INT4 podría funcionar incluso en GPUs con 2-3 GB, sujeto a la implementación.
- Opciones de despliegue: el entorno natural es JAX/Flax con NNX. No se proporcionan pesos GGUF ni se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI. La integración con estas herramientas requeriría conversión y validación adicional.
- Latencia y throughput: no disponibles. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso | Enfoque |
|---|---|---|---|---|---|---|
| ai4ug/pearl-chat-500m-it | 467 M | no disponible | lg, en | Apache-2.0 | Restringido (gated) | Conversacional luganda-inglés |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32K (según documentación pública) | multilingüe | Apache-2.0 | Abierto | Propósito general |
| SmolLM2-360M-Instruct | 360 M | 8K (según documentación pública) | principalmente inglés | Apache-2.0 | Abierto | Propósito general |
| TinyLlama-1.1B-Chat | 1,1 B | 2K (según documentación pública) | inglés | Apache-2.0 | Abierto | Propósito general |

No se dispone de resultados de benchmarks del modelo evaluado, por lo que la comparación es estructural y no de rendimiento. La principal diferencia es el enfoque específico en luganda, frente a alternativas de propósito general con mayor documentación y contexto declarado.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación. Al entrenarse con datos de luganda, puede reflejar sesgos culturales o lingüísticos presentes en el corpus.
- Riesgo de alucinación inherente a modelos pequeños; no se recomienda su uso en dominios críticos sin validación humana.
- La longitud de contexto no está documentada, lo que impide garantizar conversaciones largas o el procesamiento de documentos extensos.
- Cobertura limitada a luganda e inglés; no se han documentado otras lenguas de Uganda ni variantes dialectales.
- Aunque la licencia es Apache-2.0, el acceso está restringido en HuggingFace: es necesario aceptar las condiciones del autor y verificar posibles términos adicionales de uso.
- El ecosistema Flax/JAX es menos habitual que PyTorch; la integración con herramientas estándar de serving puede requerir conversión y pruebas adicionales.
- No se documentan procesos de alineación safety ni moderación de contenido; en producción conviene añadir filtros y políticas de uso.
- La ausencia de benchmarks y de guías de despliegue limita la reproducibilidad y la comparación objetiva con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai4ug/pearl-chat-500m-it
- Dataset ai4ug/luganda_prose: https://huggingface.co/datasets/ai4ug/luganda_prose
- Dataset ai4ug/luganda_qa_pairs: https://huggingface.co/datasets/ai4ug/luganda_qa_pairs
- Organización ai4ug: https://huggingface.co/ai4ug

No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
