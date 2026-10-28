# khukhamos/multistruq-llama3.1-8b-extended

## Resumen

`khukhamos/multistruq-llama3.1-8b-extended` es un adaptador LoRA (PEFT) publicado por el usuario khukhamos (Aditya Gujar) sobre `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo completo: el repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, por lo que requiere descargar aparte el modelo base de 8.030 millones de parámetros para poder ejecutarse. El nombre del repositorio sugiere un ajuste orientado a instrucciones multietapa o datos estructurados, pero la model card no documenta ni el propósito, ni el dataset, ni el procedimiento de entrenamiento.

El interés del artefacto es limitado y hay que ser explícito: cero descargas, cero likes, model card sin rellenar (plantilla estándar de Hugging Face con marcadores `[More Information Needed]` en todas las secciones) y licencia e idiomas sin declarar. Cualquier evaluación de capacidades tendría que hacerse empíricamente contra el modelo base, que sí está bien caracterizado: transformer denso con ventana de 128.000 tokens, soporte de tool calling y ocho idiomas oficiales.

Por tanto, esta ficha describe principalmente la arquitectura y las prestaciones heredadas del modelo base, y marca como "no disponible" todo lo específico del adaptador. Se recomienda tratarlo como un experimento personal sin validar antes que como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el base usa atención GQA, RoPE, SwiGLU y RMSNorm |
| Parámetros totales | Adaptador: no disponible (repo de 0,1 GB); modelo base: 8,03 mil millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base; no revalidada por el autor del adaptador |
| Tipos de cuantización | No disponible en el repositorio; el adaptador se distribuye en safetensors y el base admite cuantizaciones GGUF/INT4/FP8 generadas por la comunidad |
| Idiomas soportados | No disponible para el adaptador; el base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español, tailandés) |
| Licencia | No disponible en el repositorio del adaptador; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT, `library_name: peft`, PEFT 0.21.2) |

## Arquitectura y entrenamiento

El adaptador se engancha a `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso de 32 capas, dimensión oculta 4096, 32 cabezas de atención y 8 cabezas KV (GQA), vocabulario de 128.256 tokens y ventana de contexto de 128.000 tokens. El modelo base se preentrenó con del orden de 15 billones de tokens y se alineó después mediante ajuste supervisado, muestreo de rechazo, DPO y PPO, con soporte explícito de llamadas a herramientas y de uso multilingüe en ocho idiomas.

Del adaptador en sí no hay información técnica publicada: la model card es una plantilla vacía y no indica rango del LoRA, capas objetivo, `alpha`, tasa de aprendizaje, número de pasos, composición del dataset ni si hubo entrenamiento con preferencias. El único dato de entorno es la versión de PEFT empleada (0.21.2). Tampoco se documenta si el ajuste se hizo sobre la variante Instruct completa o sobre un subconjunto de capas, ni si se preservaron las capacidades originales del base. Todo lo relativo a datos, hiperparámetros e innovaciones técnicas debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct (tag `conversational`).
- Razonamiento y matemáticas de nivel medio propias de un modelo de 8B, sin datos que confirmen mejora o degradación tras el ajuste.
- Generación de código, con soporte nativo del base para instrucciones de programación.
- Tool calling / function calling: el base soporta el formato de herramientas de Llama 3.1; el adaptador no documenta si lo conserva.
- Razonamiento multi-paso y uso como agente: posible sobre el papel, sin evidencia publicada para este adaptador.
- Capacidades multilingües: ocho idiomas en el base; el autor no declara ninguno para el adaptador.
- Sin visión, sin audio, sin modo "thinking" explícito.

## Casos de uso

- Evaluación comparativa de ajustes LoRA: cargar el adaptador con PEFT sobre el base y medir la variación en tareas de instrucciones frente al modelo sin adaptar, para decidir si el ajuste aporta valor.
- Prototipado de asistentes conversacionales: al heredar la ventana de 128.000 tokens del base, permite mantener historiales largos en pruebas de diálogo, siempre que se valide antes la calidad del adaptador.
- Extracción de datos estructurados en flujos internos: si el nombre "multistruq" responde a un entrenamiento con salidas estructuradas, encajaría en pipelines de parseo de documentos; requiere verificación empírica.
- Base para un segundo ajuste: el adaptador puede servir como punto de partida (o como experimento negativo) en proyectos de fine-tuning sobre Llama 3.1 8B con datos propios.
- Investigación sobre olvido catastrófico: comparar las respuestas del adaptador con las del Instruct original para cuantificar cuánto se degradan capacidades generales tras un ajuste no documentado.
- Despliegue en local para pruebas de integración: fusionando el adaptador con el base y generando un GGUF, se puede probar en un equipo de sobremesa con GPU de consumo para validar latencia antes de invertir en infraestructura.
- Docencia y reproducción de experimentos: ejemplo de repositorio PEFT mínimo para explicar el flujo `PeftModel.from_pretrained` + `merge_and_unload`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del adaptador no incluye métricas de evaluación, y los resultados de búsqueda consultados no aportan cifras del modelo base ni comparaciones con el adaptador. No se dispone, por tanto, de datos de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling para este artefacto.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,1 GB en safetensors; el coste real lo determina el modelo base.
- Modelo base en BF16/FP16: en torno a 16 GB solo de pesos; con KV cache para 128.000 tokens hay que sumar unos 16 GiB adicionales (128 KB por token en FP16 con GQA de 8 cabezas KV).
- Modelo base en FP8: unos 8 GB de pesos; útil en una RTX 4090 (24 GB) con contexto moderado.
- Cuantización de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 5-6 GB de pesos, lo que permite ejecución en GPUs de 8-12 GB con contexto recortado.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128K; L40S o RTX 4090 para contexto medio en FP8; RTX 3060 12 GB o superior para 4 bits con contexto corto.
- Despliegue: transformers + PEFT (ruta directa para el adaptador), vLLM o TGI (requiere fusionar el adaptador con `merge_and_unload` y exportar el modelo completo), llama.cpp/Ollama (tras conversión a GGUF del modelo fusionado).
- Latencia y throughput: no disponibles. Como referencia cualitativa, un 8B denso en 4 bits sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado del artefacto |
|---|---|---|---|---|
| multistruq-llama3.1-8b-extended (este) | 8,03 B (base) + LoRA | 128.000 tokens (heredado) | No declarada; base bajo Llama 3.1 Community License | Adaptador sin documentar, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Modelo oficial, ampliamente validado |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens nativos, extensible a 131.072 con YaRN | Apache 2.0 | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Modelo oficial con benchmarks publicados |
| Gemma 2 9B Instruct | 9 B | 8.192 tokens | Gemma Terms of Use | Modelo oficial con benchmarks publicados |

No existen comparaciones directas de rendimiento entre este adaptador y las alternativas: la única comparación defendible es de linaje (aquí el base es Llama 3.1 8B Instruct) y de estado de publicación, donde el adaptador sale claramente peor situado por falta de documentación y de licencia explícita.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de Hugging Face, sin propósito, dataset ni hiperparámetros. Es imposible saber qué se ha entrenado ni con qué datos.
- Licencia ambigua: el repositorio no declara licencia. Aunque el modelo base impone la Llama 3.1 Community License (con cláusula de 700 millones de usuarios activos mensuales, política de uso aceptable y requisito de atribución "Built with Llama"), la ausencia de licencia propia en el adaptador genera incertidumbre legal para uso comercial.
- Riesgo de olvido catastrófico: un LoRA sin evaluación puede degradar capacidades del base (código, matemáticas, tool calling, multilingüismo) sin que exista evidencia pública en sentido contrario.
- Idiomas sin declarar: aunque el base cubre ocho idiomas, el ajuste podría haber reducido el rendimiento fuera del inglés; el español no está garantizado.
- Sesgos y alucinación: hereda los sesgos del modelo base de Meta y su propensión a la fabricación de datos, sin que se haya publicado ningún trabajo de mitigación específico.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de reportes de terceros sobre calidad, estabilidad o comportamientos anómalos.
- Fecha de creación atípica (2026-10-28) y nombre "extended" sin explicación: no hay forma de saber si sustituye o complementa a `khukhamos/multistruq-llama3.1-8b`.
- No apto para producción sin evaluación previa: cualquier despliegue debería ir precedido de una batería propia de pruebas frente al Llama 3.1 8B Instruct sin adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/khukhamos/multistruq-llama3.1-8b-extended
- Modelo hermano del mismo autor: https://huggingface.co/khukhamos/multistruq-llama3.1-8b
- Perfil del autor: https://huggingface.co/khukhamos/models
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de modelos Llama de Meta: https://github.com/meta-llama/llama-models
- Documentación de Llama 3.1 en DeepWiki: https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
- Ficha de especificaciones de Llama 3.1 8B: https://apxml.com/models/llama-3-1-8b
- Página oficial de Llama 3: https://dev.meta.ai/llama/models/llama-3
- Referencia citada en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
