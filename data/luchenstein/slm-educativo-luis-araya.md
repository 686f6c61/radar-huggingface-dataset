# luchenstein/slm-educativo-luis-araya

## Resumen

slm-educativo-luis-araya es un ajuste fino de tipo QLoRA sobre el modelo nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1, publicado por el usuario luchenstein (Luis Araya) como trabajo del curso "Tópicos Avanzados en Inteligencia Artificial 2". No es un modelo entrenado desde cero, sino un experimento docente cuyo objetivo declarado es practicar el ciclo completo de generación de datos, ajuste fino, evaluación, selección de checkpoints y publicación de un modelo local.

Cuenta con 4 512 746 496 parámetros (unos 4,5 mil millones) y se distribuye en formato safetensors, con el adaptador LoRA fusionado en los pesos base. El repositorio ocupa 9,0 GB. La licencia no aparece declarada en la ficha de Hugging Face; el propio autor indica que el ajuste no modifica las condiciones del modelo base y remite a estas.

Su relevancia debe situarse en su contexto: se entrenó con solo 40 ejemplos sintéticos durante tres épocas sobre una única GPU de consumo (RTX 4070 de 12 GB), y la evaluación interna apenas sube de 3,00 a 3,25 sobre 10. Es útil como referencia metodológica y como ejemplo reproducible de fine-tuning con recursos modestos, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama 3.1 (base: nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1) |
| Parametros totales | 4 512 746 496 (~4,5 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA, adaptadores de rango 16); no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Espanol (es) |
| Licencia | No disponible en la ficha; el autor indica que el ajuste no cambia la licencia del modelo base |
| Formato de pesos | safetensors (modelo base fusionado con el adaptador de la ronda 1) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only de la familia Llama 3.1 en su variante Nemotron Nano 4B v1.1 de NVIDIA. El ajuste se realizó con QLoRA: la base se cargó cuantizada en 4 bits y se entrenaron adaptadores LoRA de rango 16. El entrenamiento se llevó a cabo en una NVIDIA RTX 4070 de 12 GB con 32 GB de RAM, durante una única ronda de tres épocas. Posteriormente se fusionaron los pesos del adaptador de la ronda 1 con el modelo base para la publicación.

Los datos de entrenamiento consisten en 40 ejemplos sintéticos generados por gpt-6-sol, repartidos en cuatro temáticas: fundamentos de LLM, RAG, ajuste fino y evaluación/LLMOps. No se menciona ningún proceso de RLHF, DPO ni alineación adicional, ni innovaciones técnicas como decodificación especulativa o atención lineal. El volumen de datos es extremadamente reducido, lo que limita la generalización del ajuste.

## Capacidades

- Generación de texto conversacional en español, con plantilla de chat incluida en el repositorio y carga mediante `AutoTokenizer` y `AutoModelForCausalLM`.
- Respuestas sobre conceptos introductorios de LLM, RAG, ajuste fino y evaluación/LLMOps, que son los temas cubiertos por los 40 ejemplos de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo español declarado; no se documenta cobertura de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- La propia model card documenta definiciones incorrectas de RAG, afirmaciones inventadas, repetición y respuestas incompletas en las pruebas realizadas.

## Casos de uso

- Material de laboratorio para enseñar fine-tuning: el modelo sirve como ejemplo completo y reproducible de un ciclo QLoRA en una GPU de 12 GB, desde la generación de datos hasta la publicación del checkpoint fusionado.
- Prototipado de tutores educativos en español: puede emplearse como punto de partida para experimentar con asistencia sobre fundamentos de LLM y RAG, siempre con revisión humana y sin exponerlo directamente a estudiantes.
- Generación de borradores de material didáctico: preguntas de repaso y resúmenes de conceptos básicos que un docente revisa y corrige antes de usarlos, dado el riesgo documentado de invenciones.
- Banco de pruebas para pipelines de evaluación con LLM-as-a-judge: el conjunto de 8 preguntas y el flujo de calificación descritos permiten reproducir y auditar una metodología de evaluación, incluida su limitación de no ser independiente.
- Investigación sobre sobreajuste con datasets mínimos: con 40 ejemplos y tres épocas, es un caso útil para medir cuánto mejora (o no) un ajuste sobre una base ya competente.
- Demostración local de chat en español: desplegable en hardware de consumo con Transformers, útil para talleres presenciales donde no se quiere depender de APIs externas.
- Comparación de checkpoints: la selección de la ronda 1 como mejor checkpoint permite ilustrar cómo se elige un punto de parada y por qué hacerlo con el mismo conjunto de evaluación introduce sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación documentada es interna y no independiente:

| Metrica | Resultado |
|---|---|
| Nota media del modelo base | 3,00/10 |
| Nota media tras el ajuste | 3,25/10 |
| Conjunto de evaluacion | 8 preguntas separadas del entrenamiento |
| Juez utilizado | gpt-6-sol |
| Checkpoint seleccionado | Ronda 1 |
| Coste de API estimado | 0,1521 USD |

El propio autor advierte que ese mismo conjunto se utilizó para seleccionar el checkpoint, por lo que no constituye una evaluación final independiente, y que la mejora es pequeña y no demuestra generalización.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9-10 GB solo para pesos, más la memoria del contexto (KV cache), lo que deja el total por encima de los 10 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos más overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos más overhead, la opción más viable en GPU de gama media.
- Entrenamiento QLoRA documentado: NVIDIA RTX 4070 de 12 GB con 32 GB de RAM del sistema.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para servir varias instancias en paralelo.
- Cabe en GPU de consumo: sí, en cualquiera con 12 GB o más si se usa cuantización de 4 u 8 bits; en fp16 requiere tarjetas de 12-16 GB con margen ajustado.
- Opciones de despliegue: Transformers (ruta documentada por el autor). vLLM o TGI son viables al publicarse en safetensors, aunque no están documentados por el autor. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| slm-educativo-luis-araya | 4,5 B | No disponible | No disponible (sujeta a la del base) | safetensors en Hugging Face | Solo evaluacion interna (3,25/10) |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (base) | ~4 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors en Hugging Face | No disponible |
| Alternativas de la franja 3-4 B (por ejemplo Llama 3.2 3B, Qwen2.5 3B, Phi-3.5-mini) | ~3-4 B segun variante | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors y, en varios casos, GGUF | No disponible en la informacion proporcionada |

No es posible establecer una comparación cuantitativa fiable: el modelo solo cuenta con una evaluación interna de 8 preguntas y no se han aportado resultados de benchmarks comparables para ninguna de las alternativas en la información disponible.

## Limitaciones y advertencias

- Alucinación documentada: el autor reporta afirmaciones inventadas y definiciones incorrectas de RAG en las pruebas realizadas.
- Degradación de la forma: se observan repetición y respuestas incompletas.
- Mejora marginal: la nota pasa de 3,00 a 3,25 sobre 10, una diferencia que no demuestra generalización con 40 ejemplos de entrenamiento.
- Sesgo de evaluación: el conjunto de 8 preguntas se usó tanto para evaluar como para seleccionar el checkpoint, por lo que las cifras están contaminadas.
- Sesgos de datos: el corpus son 40 ejemplos sintéticos generados por un único modelo (gpt-6-sol), sin diversidad lingüística ni de registro documentada.
- Cobertura temática muy estrecha: solo fundamentos de LLM, RAG, ajuste fino y evaluación/LLMOps.
- Idioma: únicamente español declarado; no hay evidencia de comportamiento correcto en otros idiomas.
- Licencia no declarada: al no indicarse en la ficha, el uso comercial depende de las condiciones del modelo base, que el autor remite a consultar. Es un riesgo jurídico a resolver antes de cualquier uso productivo.
- Memoria: el modelo fusionado requiere más memoria que la carga original en 4 bits, según advierte el propio autor.
- No validado: el modelo se publica explícitamente como experimento educativo y no está validado para uso empresarial ni para decisiones críticas.
- Sin despliegue alternativo: no se publican pesos en GGUF ni cuantizaciones de terceros, lo que limita su uso en herramientas de inferencia ligera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luchenstein/slm-educativo-luis-araya
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- No se han encontrado en la búsqueda web papers, repositorios, demos ni blogs adicionales relevantes para este modelo.
