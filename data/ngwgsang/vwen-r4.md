# ngwgsang/vwen-r4

## Resumen
VWEN (vwen-r4) es un modelo de lenguaje de 0,8B parámetros especializado en la reescritura controlada de oraciones en vietnamita. Lo desarrolla Sang Quang Nguyen (usuario `ngwgsang` en Hugging Face) mediante un ajuste fino completo sobre Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen 3.5. El modelo no pretende ser un asistente generalista: su alcance es deliberadamente estrecho y gira en torno a siete tareas de manipulación de texto (paráfrasis de baja y alta divergencia, paráfrasis múltiple, simplificación, extracción de idea principal, cambio de registro y verificación de equivalencia semántica).

La relevancia del proyecto es metodológica más que de escala. La pregunta de investigación que motiva el modelo es si unos pocos miles de ejemplos multitécnica cuidadosamente seleccionados pueden igualar el entrenamiento sobre ViSP, un corpus de paráfrasis de 1,2 millones de pares. Según la model card, la respuesta es afirmativa para paráfrasis de alta divergencia, especialmente en preguntas, con un coste de datos muy inferior. El pipeline de selección reduce 341.294 candidatos a solo 7.087 muestras de entrenamiento finales.

El checkpoint publicado corresponde a la receta R4 (cuota de 8k, semilla 42), con la mejor pérdida de validación en el paso 884 de 1.326, almacenado en bfloat16. El modelo está pensado para ejecutarse en CPU de portátil, lo que lo sitúa en la categoría de utilidades lingüísticas ligeras para un idioma de recursos medios como el vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5, tipo `qwen3_5_text`) |
| Parámetros totales | 1.006.672.704 (≈1,0B según safetensors; la model card indica 0,8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; las muestras de entrenamiento tenían como máximo 512 tokens |
| Tipos de cuantización | No especificados por el autor; al ser safetensors en bfloat16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | No disponible (la model card indica "to be decided at release") |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso decoder-only con atención estándar y tokenizador propio de Qwen. El ajuste fino es completo (sin adaptadores LoRA), con pérdida calculada únicamente sobre la respuesta (answer-only loss) y el modo de razonamiento desactivado durante el entrenamiento. El checkpoint final se guardó en bfloat16 y se seleccionó por pérdida de validación en el paso 884 de 1.326.

Los datos de entrenamiento suman 7.087 muestras en vietnamita repartidas en siete tareas, obtenidas mediante un pipeline de selección en cuatro etapas que parte de 341.294 candidatos. Las fuentes incluyen corpus existentes (ViSP solo con pares originales, ViQP, VietQuill, ViePAWS y ViANLI), un pool multidisciplinar de oraciones (administrativo, educativo, sanitario, noticias, literatura, conversación y redes sociales) dividido por documento de origen, salidas destiladas de LLM abiertos (Gemma 4 26B-A4B y Qwen3-30B-A3B) para simplificación, gist, estilo, multi-paráfrasis y parte del pool de paráfrasis, perturbaciones basadas en reglas (negación, números y fechas, entidades, antónimos, causalidad) como negativos para la tarea de equivalencia, y 634 muestras semilla redactadas por un LLM y revisadas por el autor. El 70% de las muestras usaron las plantillas canónicas y el 30% reformulaciones alternativas, de modo que el modelo tolera instrucciones parafraseadas razonables.

## Capacidades
- Paráfrasis de baja divergencia (Para-L): ediciones mínimas conservando estructura y significado.
- Paráfrasis de alta divergencia (Para-H): nuevo léxico y nueva estructura manteniendo el significado.
- Paráfrasis múltiple (Multi-Para): genera *k* variantes distintas, una por línea.
- Simplificación (Simplify): reescritura en lenguaje llano para lector general conservando todo el contenido.
- Extracción de idea principal (Gist): resumen en una sola oración, con posible descarte de detalles menores.
- Transferencia de registro (Style): conversión entre vietnamita formal (`trang trọng`) e informal (`thân mật`).
- Verificación de equivalencia semántica (Equiv): responde `Có` o `Không` a si dos oraciones significan lo mismo.
- No soporta tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento activo (el thinking está desactivado por diseño).
- Capacidad multilingüe limitada al vietnamita; no se documenta competencia en otros idiomas.

## Casos de uso
- Asistentes de escritura en vietnamita: integrado en un editor de texto, el modelo reescribe oraciones con un nivel de cambio controlado mediante las etiquetas `[Mức: thấp]` y `[Mức: cao]`, útil para sugerencias de estilo en tiempo real en CPU.
- Aumento de datos para PLN de bajo recurso: generación de paráfrasis controladas (Multi-Para) para ampliar corpus de entrenamiento de clasificadores o sistemas de recuperación en vietnamita, con la ventaja de que el grado de divergencia es un parámetro explícito.
- Simplificación de textos administrativos y sanitarios: la tarea Simplify convierte oraciones técnicas en lenguaje llano para ciudadanos o pacientes, un caso frecuente en portales públicos vietnamitas.
- Resumen de una frase para titulares o metadatos: la tarea Gist produce una oración corta con la idea principal, adecuada para generar sumarios de noticias o descripciones breves en catálogos.
- Adaptación de registro en atención al cliente: la tarea Style permite convertir respuestas formales a tono cercano (o viceversa) según el canal, manteniendo el contenido intacto.
- Detección de duplicados y consistencia editorial: la tarea Equiv sirve como filtro preliminar para identificar oraciones equivalentes en procesos de deduplicación o control de calidad de traducciones, siempre como componente auxiliar y no como verificación factual definitiva.
- Investigación sobre selección de datos: el propio modelo es un artefacto reproducible para estudiar si 7.087 muestras seleccionadas con un pipeline de cuatro etapas pueden sustituir a corpus masivos de paráfrasis.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona comparaciones cualitativas frente al entrenamiento sobre ViSP (1,2M de pares) y afirma paridad o superioridad en paráfrasis de alta divergencia, especialmente en preguntas, pero no se proporcionan tablas con métricas numéricas (BLEU, BERTScore, accuracy en Equiv) en los datos facilitados.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16/fp16 para los 1,0B parámetros, y en torno a 0,6-1,2 GB con cuantización de 4-8 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4); en A100/H100 el modelo queda infrautilizado y el cuello de botella sería el procesamiento por lotes, no la memoria.
- Cabe en GPU de consumo: sí, en todas las RTX modernas desde 6 GB; también en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable según el autor ("small enough to run on a laptop CPU"), especialmente con cuantización GGUF de 4 bits.
- Opciones de despliegue: transformers (referencia oficial), llama.cpp/GGUF y Ollama tras conversión; vLLM y TGI son compatibles a nivel de arquitectura Qwen, aunque no se documentan pruebas del autor.
- Latencia y throughput: no disponibles; al ser un modelo de 1B y salidas cortas (una oración, o hasta ~480 tokens para Multi-Para con *k*=5), la latencia esperada es baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| VWEN (vwen-r4) | ≈1,0B | No disponible (entrenado a ≤512 tokens) | Vietnamita | No disponible | Reescritura controlada multitarea |
| Qwen/Qwen3.5-0.8B (base) | ≈0,8B | No disponible en la información | Multilingüe | Según Qwen | Modelo generalista |
| Modelos de paráfrasis vietnamita basados en ViSP | Variable | Variable | Vietnamita | Variable | Paráfrasis a gran escala |

No se dispone de datos de rendimiento comparativo ni de alternativas específicas de reescritura vietnamita con métricas publicadas en la información proporcionada; la comparación con la base Qwen 3.5 es estructural (mismo tronco, distinto ajuste), y la referencia a ViSP es metodológica, no un modelo concreto.

## Limitaciones y advertencias
- Ámbito restringido a oraciones sueltas en vietnamita; no está diseñado para documentos largos, otros idiomas ni chat abierto.
- El modo de razonamiento está desactivado y no debe esperarse capacidad de razonamiento multi-paso.
- La tarea Equiv es un componente de investigación y es más débil en relaciones causales; no debe usarse como única verificación de consistencia factual.
- Riesgo de alucinación en la reescritura: al generar variantes puede introducir matices ausentes en la oración original, por lo que conviene validar en dominios sensibles (sanitario, legal).
- Sesgos: no se documentan evaluaciones de sesgo; los datos provienen de fuentes diversas (administrativo, redes sociales, literatura) y pueden heredar sesgos de esos corpus y de las salidas destiladas de otros LLM.
- Licencia sin decidir en el momento de la publicación: no hay garantía de uso comercial hasta que el autor la defina.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.
- Las plantillas de paráfrasis deben comenzar obligatoriamente con la etiqueta de nivel `[Mức: thấp]` o `[Mức: cao]`; omitirla puede degradar la salida.
- El tamaño del repositorio (2,0 GB) supera lo esperado para 1,0B parámetros en bfloat16, lo que sugiere pesos duplicados o artefactos adicionales; conviene verificar antes de desplegar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ngwgsang/vwen-r4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Corpus ViSP (referencia metodológica citada en la model card): no disponible como enlace en la información proporcionada
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
