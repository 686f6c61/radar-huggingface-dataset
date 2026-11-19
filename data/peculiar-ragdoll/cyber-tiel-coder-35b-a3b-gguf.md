# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-GGUF es una cuantización GGUF de un modelo de lenguaje tipo mezcla de expertos (MoE) orientado a programación agéntica y seguridad ofensiva, publicado por el usuario peculiar-ragdoll en Hugging Face. Deriva de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, a su vez una versión "abliterated" (con los mecanismos de rechazo suprimidos) del modelo Ornith-1.5-35B-A3B. El autor aplica una cuantización dinámica con una imatrix propia ("cyber-weighted") y una plantilla de chat denominada Sharp, empaquetada dentro del GGUF.

El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y una arquitectura MoE con 3 mil millones de parámetros activos por token, lo que permite una inferencia notablemente más rápida que modelos densos de tamaño comparable. Está pensado para ejecutarse en llama.cpp y ofrece capacidades multimodales de imagen-texto, además de soporte para inglés y chino. Su licencia es MIT, lo que facilita su uso comercial, aunque el propio autor advierte de los riesgos derivados de la eliminación de rechazos.

La relevancia actual del modelo radica en su especialización: el autor afirma que, en cuantización de 4 bits (unos 22 GB), resuelve aproximadamente un 70 % más de problemas reales de programación que Ornith-1.5 y Qwen3.6-35B-A3B en SWE-bench-Live, manteniendo una velocidad de resolución entre 3 y 4 veces superior a la de un modelo denso de 3,8-27B. Es, según el autor, el primer modelo de su clase y velocidad que es "uncensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiquetada como qwen35moe |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion dinamica (unsloth-dynamic) e imatrix propia; Q4 citado (~22 GB); otras variantes no detalladas |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); existen variantes MLX y MTP en repos separados |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) de tipo Qwen3.5, con 34,7 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. Esta configuración permite un coste computacional por token comparable al de un modelo denso de 3B, mientras que la capacidad total se aproxima a la de un modelo de 35B. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva capacidades de visión heredadas del modelo base.

La cadena de entrenamiento es la siguiente: Ornith-1.5-35B-A3B (modelo original de ornith-ai) fue sometido a abliteration por huihui-ai, dando lugar a Huihui-Ornith-1.5-35B-A3B-abliterated. Sobre esa base, peculiar-ragdoll aplicó una cuantización dinámica con una imatrix ponderada específicamente para tareas de ciberseguridad y una plantilla de chat Sharp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original. La innovación técnica destacable es la combinación de cuantización dinámica con imatrix especializada, que según el autor compensa la degradación introducida por la abliteration y mejora el rendimiento en SWE-bench-Live y Cybench.

## Capacidades

- Generación de texto y razonamiento general, con especialización en programación y tareas agénticas.
- Codificación agéntica: resolución autónoma de issues y bugs en bases de código grandes (evaluado en SWE-bench-Live).
- Capacidades de seguridad ofensiva: resolución de retos CTF sin guía (15 de 43 tareas de Cybench, 35 %).
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling, implícito en su orientación a flujos agénticos.
- Razonamiento multi-paso y ejecución de agentes.
- Multilingüe limitado a inglés y chino.
- Modo "uncensored": ausencia de rechazos (0 % en HarmBench según el autor), lo que permite abordar tareas de seguridad ofensiva sin fricción.
- Plantilla de chat Sharp integrada en el GGUF para formateo de conversaciones.

## Casos de uso

- Resolución autónoma de bugs en producción: el modelo puede recibir un issue de un repositorio y generar un parche completo, con capacidad demostrada en SWE-bench-Live sobre problemas recientes y con tests de regresión ocultos. Es adecuado por su especialización en código y su velocidad de resolución.
- Auditoría de seguridad ofensiva y pentesting: con 0 % de rechazos en HarmBench y un 35 % de resolución en Cybench, puede emplearse en entornos sandbox para análisis de vulnerabilidades, generación de exploits de prueba y tareas de red teaming autorizadas.
- Asistente de programación en IDE: integrado vía llama.cpp u Ollama, ofrece autocompletado y generación de código con baja latencia gracias a sus 3B de parámetros activos, apto para máquinas con VRAM limitada.
- Automatización de pipelines CI/CD: su soporte de tool calling permite conectarlo a herramientas de build, test y despliegue para corregir fallos de integración de forma autónoma.
- Análisis de capturas de pantalla y diagramas técnicos: gracias a su pipeline image-text-to-text, puede interpretar imágenes de interfaces, diagramas de arquitectura o mensajes de error visuales y traducirlos a código o explicaciones.
- Formación y laboratorios de ciberseguridad: al no rechazar peticiones relacionadas con cibercrimen, resulta útil en entornos educativos controlados para simular ataques y estudiar defensas, siempre con sandboxing y supervisión.
- Procesamiento de documentación técnica en inglés y chino: puede resumir, traducir y generar documentación en ambos idiomas.

## Benchmarks y rendimiento

Los datos disponibles provienen de las gráficas y afirmaciones de la model card; no se ofrecen cifras numéricas completas para todos los benchmarks.

| Benchmark | Resultado | Notas |
|---|---|---|
| SWE-bench-Live | ~70 % más problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B | Medido en cuantización de 4 bits; mejora ~7 veces mayor que el salto generacional Qwen3.5 a 3.6 |
| Cybench (unguided) | 15/43 flags (35 %) | Sin pistas ni juez |
| HarmBench | 0 % de rechazos (84 peticiones, 7 categorías) | Muestra de 12 por categoría |
| MMLU-Pro | Igual que TielCoder; inferior a modelos generalistas | El autor reconoce sacrificio de conocimiento del mundo |

No se han publicado resultados numéricos detallados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 22 GB para la cuantización Q4 citada por el autor; otras cuantizaciones no detalladas.
- GPU recomendadas: no especificadas; por tamaño, una RTX 4090 (24 GB) podría alojar la variante Q4, así como A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, la variante Q4 (~22 GB) es compatible con GPUs de 24 GB como la RTX 4090; variantes de menor cuantización no documentadas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; existen variantes MLX para Apple Silicon y MTP en repos separados.
- Latencia y throughput: el autor afirma que resuelve tareas agénticas entre 3 y 4 veces más rápido que un modelo denso de 3,8-27B; no se proporcionan tokens por segundo concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B | 34,7B totales / 3B activos | no disponible | MIT | Abliterated, especializado en código y seguridad ofensiva |
| TielCoder-35B-A3B | 35B-A3B | no disponible | no disponible | Versión censurada del mismo linaje, más segura |
| Ornith-1.5-35B-A3B | 35B-A3B | no disponible | no disponible | Modelo base original; menor rendimiento en SWE-bench-Live según el autor |
| Qwen3.6-35B-A3B | 35B-A3B | no disponible | no disponible | Alternativa generalista; menor rendimiento en código agéntico según el autor |

## Limitaciones y advertencias

- Alucinación: como todo modelo de lenguaje, puede generar información falsa, especialmente en conocimiento del mundo; el autor reconoce un MMLU-Pro bajo y recomienda no usarlo para trivia o exámenes.
- Sesgos: no se documentan sesgos específicos, pero la abliteration puede amplificar respuestas sesgadas o inapropiadas.
- Idiomas: solo inglés y chino; no hay soporte declarado de castellano.
- Licencia MIT: permite uso comercial, pero el autor traslada la responsabilidad legal y ética al usuario.
- Riesgo de seguridad: al ser un modelo abliterated con 0 % de rechazos en HarmBench, puede producir contenido dañino, ilegal o peligroso; debe ejecutarse en sandbox y con supervisión.
- Contexto: no se especifica la longitud de contexto, lo que dificulta planificar su uso en tareas de contexto largo.
- Estabilidad: el autor advierte de que la abliteration introduce "cierta inestabilidad" y corrupción del modelo original, aunque afirma compensarla con la cuantización.
- Producción: requiere validación adicional y filtros externos si se despliega en entornos con requisitos de cumplimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Versión MTP GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Versión MLX: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Versión MLX MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original Ornith-1.5: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Plantilla de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Alternativa censurada TielCoder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo generalista Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
