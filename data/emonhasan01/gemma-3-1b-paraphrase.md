# emonHasan01/gemma-3-1b-paraphrase

## Resumen
gemma-3-1b-paraphrase es un modelo de parafraseo en inglés creado por el usuario emonHasan01 mediante un ajuste fino completo (full fine-tune) sobre google/gemma-3-1b-it. El objetivo es reescribir una frase manteniendo su significado exacto y cambiando la formulación, una tarea en la que un modelo conversacional genérico de 1B tiende a copiar la entrada o a desviarse del sentido original. El autor publica dos ejes de evaluación —fidelidad semántica y diversidad léxica— porque, como señala en la propia model card, una única métrica se puede "engañar" devolviendo la entrada sin cambios.

El modelo tiene 1.301.875.840 parámetros (~1,3 B) y una arquitectura transformer decoder-only de la familia Gemma 3 (variante gemma3_text). Se entrenó con Unsloth actualizando todos los pesos, sin adaptadores, sobre el dataset humarin/chatgpt-paraphrases, y todo el proceso cupo en una GPU T4 gratuita de Colab en 155 minutos. Según los datos declarados por el autor, el iBLEU sube de 1,65 (modelo base en zero-shot) a 17,99, mientras la similitud semántica se mantiene en 0,911.

Es relevante ahora por su relación coste/rendimiento: demuestra que un parafraseador especializado y ligero se puede producir en hardware de consumo y desplegar en una GPU modesta, lo que lo hace útil para reescritura a escala en pipelines de texto. La licencia es Gemma y el único idioma declarado es el inglés. El repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante gemma3_text) |
| Parámetros totales | 1.301.875.840 (~1,3 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de google/gemma-3-1b-it) |
| Tipos de cuantización | no disponible; el autor publica pesos en safetensors y su ejemplo de uso carga el modelo en float16 |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma (gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La base es google/gemma-3-1b-it, un transformer decoder-only causal de la familia Gemma 3 en su variante de texto (gemma3_text), con 1,3 B de parámetros. Sobre ese modelo se realizó un ajuste fino completo: según el autor, "every weight was updated — no adapters", es decir, no se emplearon LoRA ni otros adaptadores, sino una actualización de todos los pesos con la librería Unsloth. El entrenamiento se ejecutó en una única GPU T4 gratuita de Colab y duró 155 minutos.

El dataset de ajuste es humarin/chatgpt-paraphrases y la tarea se formula como text2text-generation dentro del pipeline de text-generation. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación posterior, ni el número de tokens vistos durante el entrenamiento. Como innovación destacable, más que arquitectónica, cabe señalar la metodología de evaluación que acompaña al modelo: el autor reporta simultáneamente similitud semántica, diversidad léxica, iBLEU, BLEU frente a referencia, ROUGE-L, tasa de copia y ratio de longitud, e incluye una línea base de "copiar la entrada" para hacer visible el compromiso entre fidelidad y variación.

## Capacidades
- Parafraseo de frases en inglés: reescribe la entrada cambiando redacción y estructura manteniendo el significado.
- Generación de texto condicionada por instrucción: acepta la instrucción en el turno de usuario mediante la plantilla de chat de Gemma.
- Modo greedy determinista para fidelidad semántica máxima y modo con muestreo (temperature, top_p) para generar varias paráfrasis distintas de la misma frase.
- Generación de múltiples variantes en una sola pasada (num_return_sequences).
- Alta diversidad léxica medida: 54,9 en la escala del autor, frente a 24,6 del modelo base en zero-shot.
- Tasa de copia muy baja: 0,7 %, frente al 41,7 % del modelo base en zero-shot.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte específico de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no, solo inglés (en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; la variante es de texto.

## Casos de uso
- Reescritura de textos SEO y marketing: el modelo genera titulares y descripciones alternativas en inglés con la misma intención semántica, y su baja tasa de copia (0,7 %) reduce el riesgo de publicar contenido casi idéntico.
- Aumento de datos para entrenamiento de PLN: producir paráfrasis controladas de un corpus en inglés para ampliar el dataset antes de entrenar clasificadores o sistemas de recuperación.
- Normalización y variación de consultas en motores de búsqueda: generar formulaciones alternativas de una misma pregunta para cubrir más coincidencias sin alterar el significado.
- Preprocesado de FAQ y bases de conocimiento: reescribir una pregunta frecuente en varias formas para que un sistema de coincidencia las reconozca como equivalentes.
- Detección de plagio y atribución: usar el parafraseador como generador de negativos que prueben la robustez de clasificadores de similitud textual.
- Asistencia de redacción para hablantes no nativos: ofrecer reformulaciones más naturales de una frase en inglés manteniendo el sentido original.
- Evaluación de sistemas de diálogo: crear pares de entrada/salida con significado equivalente para medir la sensibilidad de un evaluador automático a la forma del texto.

## Benchmarks y rendimiento
Resultados declarados por el autor del modelo sobre 300 pares reservados (held-out) del dataset humarin/chatgpt-paraphrases, con decodificación greedy y el mismo prompt para todos los sistemas. Todas las métricas del model-index figuran como no verificadas (verified: false).

| Sistema | Similitud semántica ↑ | Diversidad léxica ↑ | iBLEU ↑ | BLEU vs ref ↑ | ROUGE-L ↑ | Tasa de copia ↓ | Ratio de longitud |
|---|---|---|---|---|---|---|---|
| Copiar la entrada | 1,000 | -0,0 | -1,24 | 23,45 | 45,38 | 100,0 % | 1,00 |
| google/gemma-3-1b-it zero-shot | 0,909 | 24,6 | 1,65 | 20,91 | 41,87 | 41,7 % | 1,05 |
| gemma-3-1b-paraphrase (este modelo) | 0,911 | 54,9 | 17,99 | 33,76 | 59,06 | 0,7 % | 1,09 |

Métricas principales registradas en el model-index del autor:

| Métrica | Dataset | Split | Valor | Verificado |
|---|---|---|---|---|
| iBLEU (300 pares) | humarin/chatgpt-paraphrases | held-out | 17,99 | false |
| ROUGE-L vs reference | humarin/chatgpt-paraphrases | held-out | 59,06 | false |

Definiciones aportadas por el autor: la similitud semántica es la distancia coseno entre embeddings de all-MiniLM-L6-v2 de entrada y salida; la diversidad léxica es 100 − BLEU(salida, entrada); iBLEU = 0,8 × BLEU(salida, referencia) − 0,2 × BLEU(salida, entrada).

## Requisitos de hardware
- VRAM estimada para inferencia: en float16, los pesos ocupan aproximadamente 2,6 GB (tamaño del repo: 2,6 GB), a los que hay que sumar la caché KV y las activaciones. En float32 serían unos 5,2 GB; en cuantizaciones de 8 bits y 4 bits, del orden de 1,3 GB y 0,7 GB respectivamente para los pesos.
- GPU recomendadas: cabe holgadamente en GPU de consumo. El propio autor lo entrenó en una T4 de 16 GB (Colab gratuito). Tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090, A100 o H100 lo ejecutan sin problemas.
- ¿Cabe en GPU de consumo? Sí; por tamaño (1,3 B), cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente para inferencia en float16.
- Opciones de despliegue: la librería declarada es transformers (ejemplo oficial con AutoModelForCausalLM y device_map="auto"). El modelo incluye los tags text-generation-inference y endpoints_compatible, lo que apunta a compatibilidad con TGI y con endpoints gestionados. No se indica soporte de GGUF, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El único dato de tiempo es el de entrenamiento (155 minutos en una T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | iBLEU | ROUGE-L | Tasa de copia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gemma-3-1b-paraphrase | 1,3 B | no disponible | 17,99 | 59,06 | 0,7 % | Gemma | HuggingFace (0 descargas) |
| google/gemma-3-1b-it (zero-shot) | 1,3 B | no disponible | 1,65 | 41,87 | 41,7 % | Gemma | HuggingFace (modelo base) |
| Copiar la entrada (línea base) | no aplica | no aplica | -1,24 | 45,38 | 100,0 % | no aplica | no aplica |

No se dispone de datos de otros parafraseadores dedicados en la información proporcionada, por lo que la comparación se limita a los dos sistemas de referencia incluidos por el propio autor. Las cifras de iBLEU y ROUGE-L de este modelo figuran como no verificadas.

## Limitaciones y advertencias
- Idioma: solo inglés (en); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Tamaño reducido: 1,3 B de parámetros, lo que limita el razonamiento complejo y el conocimiento factual frente a modelos mayores.
- Riesgo de deriva semántica: el autor documenta explícitamente el compromiso entre fidelidad y diversidad; con muestreo a temperature=0,9 la fidelidad baja, y con los ajustes recomendados por Google para Gemma 3 (temperature=1,0, top_k=64, top_p=0,95) las reescrituras son "noticeably looser".
- Riesgo de alucinación: no evaluado en la información disponible; como modelo generativo, puede introducir contenido no presente en la entrada.
- Plantilla de chat: Gemma 3 no tiene rol de sistema, por lo que la instrucción debe ir en el turno de usuario. La redacción exacta de la instrucción "es parte del modelo".
- Token BOS: el ejemplo oficial advierte que duplicar el token BOS (uno añadido por el tokenizador más el explícito) degrada la salida; hay que eliminar el prefijo del prompt.
- Benchmarks no verificados: las métricas del model-index están marcadas como verified: false y proceden del propio autor.
- Cifras truncadas en la model card: varios ejemplos de la tabla aparecen cortados, lo que dificulta su reproducción literal.
- Licencia Gemma: el uso comercial está sujeto a los Términos de Uso de Gemma de Google, no a una licencia permisiva tipo Apache o MIT; conviene revisar las condiciones antes de un despliegue en producción.
- Madurez: el repositorio tiene 0 descargas y 0 "likes", sin validación por parte de la comunidad ni mantenimiento demostrado.
- No se documentan cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni rendimiento medido de latencia o throughput.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/emonHasan01/gemma-3-1b-paraphrase
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/humarin/chatgpt-paraphrases
- Unsloth (librería de ajuste fino): https://github.com/unslothai/unsloth
