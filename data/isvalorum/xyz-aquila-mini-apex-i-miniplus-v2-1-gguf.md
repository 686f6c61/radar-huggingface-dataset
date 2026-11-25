# IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

XYZ-Aquila-mini APEX-I-MiniPlus-V2.1-GGUF es una cuantización personalizada del modelo base XYZAILab/XYZ-Aquila-mini, un Mixture-of-Experts (MoE) de aproximadamente 34.660 millones de parámetros totales. La publica el usuario IsValorum bajo licencia Apache 2.0 y está pensada para inferencia con llama.cpp y despliegues compatibles con endpoints. El objetivo declarado es comprimir el modelo hasta un techo de 13-14 GB manteniendo la precisión de razonamiento, sin la degradación típica de las cuantizaciones comunitarias genéricas.

La propuesta técnica se apoya en una asignación tensor a tensor: los routers (`gate_inp`, `gate_shexp`) se conservan en F32, la cabeza de salida en Q6_K, las compuertas de atención en Q8_0 y los expertos centrales en IQ3_XXS. Según la model card, el resultado ocupa 14,75 GB en disco con 3,40 BPW y una perplejidad en WikiText-2 de 6,7927 frente a 6,72 del BF16 de referencia, es decir, una degradación de aproximadamente el 1,08 %.

El interés actual reside en que permite ejecutar un MoE de 34B con contexto completo de 256K en estaciones de trabajo de 24 GB de VRAM, o con volcado parcial a RAM del sistema. La model card reporta entre 20 y 45 tok/s en inferencia por RAM según la plataforma. Es, por tanto, una opción orientada a desarrolladores que necesitan razonamiento y contexto largo en hardware de consumo o de gama profesional media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, 40 capas y 256 micro-expertos; tag de familia `qwen35moe` |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (según la model card) |
| Tipos de cuantizacion | GGUF con receta APEX-I-MiniPlus V2.1: IQ3_XXS, IQ3_S, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, F32 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo Mixture-of-Experts con 40 capas y 256 micro-expertos, según la información de la model card. La ficha del repositorio no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles. La etiqueta `reasoning` y la plantilla de chat endurecida con "reasoning effort" sugieren un ajuste orientado a tareas de razonamiento y uso agéntico.

La innovación de esta publicación no está en el entrenamiento, sino en la cuantización. Se aplica una receta quirúrgica tensor a tensor: los routers de enrutamiento se mantienen en F32 para evitar deriva de routing, la cabeza de salida se protege en Q6_K, las compuertas de atención en Q8_0 y los expertos centrales (capas 10-29) en IQ3_XXS, mientras los expertos de borde usan Q3_K en 20 capas y el experto compartido Q5_K. La model card afirma que esta asignación reduce los fallos de sintaxis y los picos de perplejidad que aparecen en las cuantizaciones comunitarias que bajan los expertos a IQ2_S. El proceso se realizó con Unsloth Studio y usa una matriz de importancia (imatrix).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento explícito: la model card menciona modo de pensamiento (`<think>`) y un parámetro de "reasoning effort" en la plantilla de chat.
- Generación de código, con advertencias específicas del autor sobre sintaxis y penalización de repetición para evitar intercambio de caracteres.
- Capacidades multilingües en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Uso agéntico: la plantilla de chat endurecida y el soporte de razonamiento multi-paso están documentados en la model card.
- No se documenta soporte de visión, audio ni tool calling explícito en la información disponible.

## Casos de uso

- Asistentes de razonamiento con contexto largo: el modelo puede mantener conversaciones o documentos de hasta 256K tokens, lo que permite analizar bases de código extensas o expedientes completos sin truncar.
- Generación de código en local: con 34,66B parámetros totales y cuantización de 3,40 BPW, cabe en una GPU de 24 GB y permite autocompletado y revisión de código en estaciones de trabajo sin conexión a la nube.
- Despliegue en estaciones de 24 GB: la model card afirma que el contexto completo de 256K cabe en VRAM en tarjetas de 24 GB, lo que habilita análisis de repositorios y documentación larga en hardware de consumo profesional.
- Inferencia con volcado a RAM: en equipos sin GPU suficiente, el volcado parcial o total a RAM del sistema permite generar entre 20 y 45 tok/s según la plataforma, adecuado para prototipado y pruebas de integración.
- Atención al cliente multilingüe: los 13 idiomas soportados permiten construir agentes conversacionales que atiendan usuarios en español, inglés, chino, árabe o tailandés con el mismo modelo.
- Investigación en cuantización: la receta tensor a tensor y los datos de perplejidad publicados sirven como referencia para estudiar el impacto de distintas precisiones en modelos MoE.
- Evaluación de razonamiento reproducible: el modo de pensamiento y la plantilla de chat permiten comparar respuestas con distintos niveles de esfuerzo de razonamiento en pipelines de evaluación.

## Benchmarks y rendimiento

| Metrica | BF16 base | APEX-I-MiniPlus V2.1 |
|---|---|---|
| Tamano en disco | aprox. 70,0 GB | 14,75 GB |
| Huella en RAM/VRAM | aprox. 65,2 GiB | 13,74 GiB |
| BPW medio | 16,00 | 3,40 |
| Perplejidad WikiText-2 | aprox. 6,72 (referencia) | 6,7927 ± 0,1884 (ΔPPL +0,0727 / +1,08 %) |
| Nivel de calidad equivalente | precisión completa | tier Q5_K_M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta perplejidad en WikiText-2 y comparativas de tamaño y huella de memoria.

## Requisitos de hardware

- VRAM estimada: 13,74 GiB de huella según la model card; el archivo en disco ocupa 14,75 GB.
- GPU recomendadas: la model card menciona pruebas en RTX 30, RTX 40 y RTX 50, además de streaming por RAM. Una GPU de 24 GB permite, según el autor, ejecutar el contexto completo de 256K en VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (por ejemplo, RTX 3090, RTX 4090 o modelos equivalentes de la serie RTX 50).
- Opciones de despliegue: llama.cpp como runtime principal; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: entre 20 y 45 tok/s en inferencia por RAM del sistema, según procesador y configuración DDR4/DDR5. No se aportan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XYZ-Aquila-mini APEX-I-MiniPlus V2.1 | 34,66B totales (MoE) | 256K | GGUF 3,40 BPW | Apache 2.0 | Hugging Face |
| APEX-I-Mini generico (comunidad) | 34,66B totales (MoE) | no disponible | IQ2_S / Q3_K, aprox. 12,5 GB | Apache 2.0 (heredada) | Hugging Face |
| MiniPlus V2 (misma familia) | 34,66B totales (MoE) | 256K | IQ3_XXS / IQ3_S, +1,2 GB vs generico | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes de la misma familia porque la información disponible no incluye modelos de otros desarrolladores con los que contrastar parámetros, contexto y rendimiento. No hay datos de benchmarks comparativos con modelos externos.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: +1,08 % de perplejidad en WikiText-2 respecto al BF16, con desviación estándar de ±0,1884.
- El autor advierte de que las cuantizaciones comunitarias genéricas de esta familia producen errores de sintaxis y corchetes de código rotos; conviene verificar la procedencia del GGUF antes de usarlo en producción.
- La model card incluye una advertencia específica sobre penalización de repetición y sintaxis de código para evitar el intercambio de caracteres; es un caveat relevante en pipelines de generación de código.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Riesgo de alucinación: no cuantificado en la model card; aplicable el riesgo habitual de los modelos generativos de su escala.
- El rendimiento en RAM depende fuertemente del ancho de banda de memoria; las cifras de 20-45 tok/s no están garantizadas en todas las plataformas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base XYZAILab/XYZ-Aquila-mini.
- No hay datos publicados sobre tool calling, visión o audio; no deben asumirse en producción sin validación previa.

## Enlaces

- [Hugging Face: IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2.1-GGUF](https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2.1-GGUF)
- [Modelo base: XYZAILab/XYZ-Aquila-mini](https://huggingface.co/XYZAILab/XYZ-Aquila-mini)
- [Soporte al autor en Ko-fi](https://ko-fi.com/isvalorum)
