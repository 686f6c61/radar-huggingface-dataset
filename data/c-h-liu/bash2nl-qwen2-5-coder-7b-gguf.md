# C-H-Liu/bash2nl-qwen2.5-coder-7b-GGUF

## Resumen

bash2nl-qwen2.5-coder-7b-GGUF es un ajuste fino del modelo Qwen/Qwen2.5-Coder-7B-Instruct orientado a una tarea muy concreta: convertir una línea de comandos de Bash en una única frase en inglés que la describa, redactada como instrucción y empezando por un verbo. Lo publica el usuario C-H-Liu en Hugging Face, con licencia Apache-2.0 y pesos en formato GGUF q4_K_M listos para usarse con llama.cpp y Ollama.

El modelo parte de Qwen2.5-Coder-7B-Instruct (7.615.616.512 parámetros, transformer denso con decodificador) y se ha reentrenado mediante QLoRA sobre el corpus del proyecto nl2bash; posteriormente se ha fusionado y cuantizado a q4_K_M. No es, por tanto, un modelo de propósito general: su valor está en documentar, auditar o explicar comandos de shell de forma automática.

Su relevancia práctica es la de un componente especializado y ligero (repositorio de 4,7 GB, ejecutable en GPU de consumo) para integrarse en herramientas de documentación de scripts, revisión de comandos en terminales interactivas o análisis previo en pipelines de seguridad. Frente al modelo base, mejora BLEU de 14,59 a 33,49 y ROUGE-L de 39,09 a 53,24 en el conjunto de evaluación del autor, y reduce la longitud media de la respuesta de 18,0 a 12,4 palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con decodificador (arquitectura de Qwen2.5-Coder-7B: 28 capas, GQA, RoPE, RMSNorm, SwiGLU); ajuste fino QLoRA |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens en el modelo base; el Modelfile publicado fija `num_ctx` a 4.096 tokens |
| Tipos de cuantizacion | GGUF q4_K_M (único publicado en este repositorio); el modelo base admite otras cuantizaciones, no incluidas aquí |
| Idiomas soportados | Inglés (salida y documentación); el modelo base es multilingüe, pero este ajuste está especializado en salida en inglés |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | GGUF (q4_K_M) + `Modelfile` de Ollama; no se publican safetensors del modelo fusionado |
| Tamano del repositorio | 4,7 GB |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Tarea | bash2nl: explicar un comando Bash en exactamente una frase en inglés |
| Decodificacion recomendada | `temperature` 0.0, `top_k` 1, `top_p` 1.0, `repeat_penalty` 1.0, `num_predict` 96, `num_ctx` 4096 |
| Tokens de parada | `<|im_end|>`, `<|endoftext|>` |
| Descargas / likes en Hugging Face | 0 / 0 (metadatos de la información proporcionada) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct: un transformer denso con decodificador, atención con grouped query attention (GQA), embeddings rotatorios (RoPE), normalización RMSNorm y activación SwiGLU. Sobre esos pesos se aplicó un ajuste fino QLoRA, cuyo resultado se fusionó con el modelo original y después se cuantizó a q4_K_M. La información disponible no detalla el rango LoRA, el número de pasos, la tasa de aprendizaje ni el tamaño exacto del conjunto de entrenamiento: esos datos figuran como no disponibles.

Los datos de entrenamiento provienen del proyecto nl2bash, citado en la model card, que también indica que deben consultarse sus propios términos de uso. La evaluación se realiza sobre 920 comandos reservados (held-out) y las columnas de jueces automáticos se calculan con `claude-sonnet-5` sobre un subconjunto fijo de 200 comandos. No se documenta en la información disponible si hubo fases de RLHF o DPO; el procedimiento descrito se limita al ajuste QLoRA supervisado. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Traducción de comandos Bash a lenguaje natural: genera exactamente una frase en inglés, en imperativo y comenzando por un verbo (por ejemplo, `find . -name "*.py"` produce "Display the names of all files in the current directory and recursively into subdirectories with names that end in .py").
- Manejo de tuberías y composición de comandos, incluyendo ejemplos con `grep`, `awk`, `xargs` y redirecciones según el ejemplo de uso de la model card.
- Salida de longitud controlada: el ajuste empuja hacia frases cortas (media de 12,4 palabras en la evaluación) y el Modelfile limita la generación a 96 tokens.
- Reproducibilidad en inferencia: con temperatura 0.0, `top_k` 1 y `top_p` 1.0 la salida es determinista, lo que facilita integrarlo en tests automatizados.
- Compatibilidad con el ecosistema llama.cpp/Ollama mediante el `Modelfile` incluido, con system prompt fijado y tokens de parada definidos.
- Capacidades heredadas del modelo base no verificadas en este ajuste: no hay evidencia en la información proporcionada de que el modelo conserve generación de código general, razonamiento matemático, tool calling, function calling, comportamiento agéntico, visión o audio. La model card no las menciona.

## Casos de uso

- Documentación automática de scripts: dada cada línea de un `.sh` heredado, el modelo genera una descripción de una frase que se puede volcar a comentarios o a un README. Su entrenamiento específico en bash2nl y su salida corta encajan mejor que un LLM general para esta tarea repetitiva.
- Ayuda contextual en terminales interactivas: integrado en un shell wrapper, explica el comando que el usuario acaba de escribir o que va a extraer de un historial, con latencia baja al ejecutarse en local sobre un modelo de 7B cuantizado.
- Revisión de seguridad previa a la ejecución: en un pipeline que intercepta comandos peligrosos (por ejemplo, `rm -rf`, `kill -9` sobre procesos filtrados por `ps`/`awk`), la descripción generada puede mostrarse al operador como confirmación legible antes de autorizar la ejecución.
- Enseñanza y formación: generación de ejercicios o material didáctico donde se presenta un comando y se pide al alumno compararlo con la explicación del modelo, útil por la formulación uniforme en imperativo.
- Indexación y búsqueda semántica de comandos: convertir un corpus de comandos en descripciones en inglés permite construir un índice de texto que se consulte después con búsqueda por similitud, en lugar de buscar por cadenas literales.
- Auditoría de cumplimiento en infraestructura: generar descripciones legibles de los comandos registrados en logs de sesiones SSH o de agentes de automatización, para revisión posterior por parte de equipos no especializados.
- Generación de conjuntos de datos sintéticos para nl2bash: usar el modelo como anotador de bajo coste para etiquetar comandos nuevos con descripciones de una frase, sujeto a revisión humana por la tasa de error reportada.
- Pruebas de regresión en herramientas de CLI: el modo determinista (temperatura 0) permite fijar salidas esperadas para las descripciones y detectar cambios de comportamiento cuando se actualiza el prompt o la cuantización.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 920 comandos reservados. Las columnas de juez corresponden a `claude-sonnet-5` evaluando un subconjunto fijo de 200 comandos.

| Metrica | Base | Base + few-shot | Este modelo |
|---|---|---|---|
| BLEU | 14,59 | 17,67 | 33,49 |
| chrF | 44,15 | 45,82 | 52,21 |
| ROUGE-L | 39,09 | 40,64 | 53,24 |
| Juez: aceptable o superior | 0,880 | 0,900 | 0,890 |
| Juez: incorrecto | 0,120 | 0,100 | 0,110 |
| Palabras medias por respuesta | 18,0 | 17,2 | 12,4 |

La mejora es clara en métricas de coincidencia superficial (BLEU, chrF, ROUGE-L) y en concisión, pero no en la valoración del juez: el modelo ajustado queda ligeramente por debajo del base con few-shot en "aceptable o superior" (0,890 frente a 0,900) y por encima del base sin few-shot en "incorrecto" (0,110 frente a 0,120). No se han encontrado en la información proporcionada resultados de MMLU, HumanEval, GSM8K ni de otras tareas generales, ni comparaciones con modelos bash2nl alternativos.

## Requisitos de hardware

- VRAM estimada: con cuantización q4_K_M (repositorio de 4,7 GB), la inferencia completa en GPU requiere aproximadamente 5-6 GB de VRAM incluyendo la caché KV para 4.096 tokens de contexto.
- GPU de consumo: cabe holgadamente en RTX 3060 8 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y en GPU integradas con memoria unificada (Apple Silicon a partir de 16 GB). También es viable con offload parcial de capas en GPU de 4 GB.
- GPU de centro de datos: A100, H100 o L40S funcionan sin problema, pero son sobredimensionadas para un modelo de 7B cuantizado a 4 bits; lo habitual es desplegarlo en CPU o en GPU de gama media.
- Ejecución solo en CPU: posible con llama.cpp; al ser un modelo de 7B cuantizado, el coste por consulta es bajo, aunque la latencia depende del procesador (no se dispone de cifras medidas).
- Opciones de despliegue: Ollama (procedimiento documentado en la model card con `ollama create` y `ollama run`), llama.cpp y `llama-server`, LM Studio, KoboldCpp y otros frontends compatibles con GGUF.
- Compatibilidad con servidores de alto rendimiento: vLLM y TGI no están documentados para este repositorio en la información disponible; requerirían pesos en safetensors del modelo fusionado, que no se publican aquí.
- Latencia y throughput: no disponible. Como referencia de cota superior, el `Modelfile` limita la generación a 96 tokens (`num_predict`) y el contexto a 4.096 tokens.

## Comparativa con modelos similares

La información proporcionada solo permite comparar el modelo con su base y con el base en modo few-shot, usando la misma evaluación del autor. No se dispone de datos de otros modelos bash2nl con los que contrastarlo.

| Modelo | Parametros | Contexto | Formato | Licencia | Resultado en la evaluacion del autor |
|---|---|---|---|---|---|
| bash2nl-qwen2.5-coder-7b-GGUF (este) | 7,62 B (dense) | 32.768 en el base; 4.096 en el Modelfile | GGUF q4_K_M | Apache-2.0 | BLEU 33,49 / chrF 52,21 / ROUGE-L 53,24 / juez aceptable 0,890 |
| Qwen2.5-Coder-7B-Instruct (base) | 7,62 B (dense) | 32.768 | safetensors | Apache-2.0 | BLEU 14,59 / chrF 44,15 / ROUGE-L 39,09 / juez aceptable 0,880 |
| Qwen2.5-Coder-7B-Instruct con few-shot (base) | 7,62 B (dense) | 32.768 | safetensors | Apache-2.0 | BLEU 17,67 / chrF 45,82 / ROUGE-L 40,64 / juez aceptable 0,900 |
| Otros modelos de bash2nl | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especialización muy estrecha: el ajuste QLoRA puede degradar capacidades generales del modelo base (generación de código, instrucciones generales, matemáticas). No hay evaluación publicada sobre esas tareas, por lo que no se debe asumir que siguen intactas.
- Salida únicamente en inglés y en una sola frase. No acepta instrucciones para cambiar el idioma, la longitud o el formato más allá de esta consigna.
- Riesgo de alucinación: el modelo puede mencionar opciones, rutas o banderas que no aparecen en el comando de entrada. La métrica de juez "incorrecto" es 0,110 (11 %) sobre 200 comandos, lo que implica una tasa de error no despreciable para uso automático sin revisión.
- El propio autor reporta un juez "aceptable o superior" de 0,890, ligeramente inferior al 0,900 del modelo base con few-shot: el ajuste mejora la coincidencia textual y la concisión, pero no necesariamente la corrección semántica.
- Dependencia de la configuración de decodificación: los resultados se obtienen con `temperature` 0.0, `top_k` 1 y `top_p` 1.0. Cambiar estos valores puede degradar la calidad y romper el formato de una sola frase.
- Sesgos y cobertura: el comportamiento del modelo refleja el corpus nl2bash (comandos y convenciones de un dominio concreto). Comandos exóticos, sintaxis específica de una distribución o utilidades poco frecuentes pueden quedar fuera de su distribución de entrenamiento.
- Restricciones de licencia: los pesos son Apache-2.0, pero la model card remite a los términos del proyecto nl2bash para los datos de entrenamiento. Antes de un uso comercial conviene revisar esas condiciones.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en los metadatos consultados. Es un artefacto reciente y sin adopción pública, por lo que no existen informes independientes de calidad.
- Formato de pesos limitado: solo se publica GGUF q4_K_M. No hay safetensors del modelo fusionado, lo que dificulta servir el modelo con vLLM o TGI o reentrenarlo a partir del resultado fusionado.
- Contexto efectivo reducido: aunque el modelo base soporta 32.768 tokens, el `Modelfile` fija `num_ctx` a 4.096. Comandos muy largos o scripts completos como entrada pueden truncarse.
- Sin soporte documentado de tool calling, agentes o multimodalidad en este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/C-H-Liu/bash2nl-qwen2.5-coder-7b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Proyecto nl2bash (fuente de los datos de entrenamiento, citado en la model card): URL no disponible en la información proporcionada
- Paper, blog o repositorio del ajuste: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: los enlaces devueltos no guardan relación con el modelo (contenido sobre localidades francesas del Oise), por lo que no se incluyen
