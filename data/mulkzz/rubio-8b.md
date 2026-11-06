# mulkzz/RuBio-8B

## Resumen
RuBio-8B es un ajuste fino (fine-tuning) del modelo MegaScience/Qwen3-8B-MegaScience, desarrollado por el usuario mulkzz, orientado a la corrección automática de respuestas abiertas de la asignatura de Biología del currículo surcoreano de secundaria (revisión 2022, unidades I-III). El modelo recibe la respuesta de un estudiante y devuelve un único objeto JSON con diagnóstico por criterio de evaluación, información diagnóstica para el profesor y retroalimentación para el alumno. Resuelve el problema de la evaluación formativa a escala en preguntas de desarrollo, donde la corrección manual por rúbricas es costosa y difícil de estandarizar.

Arquitectura transformer densa heredada de la familia Qwen3, con 8.190.735.360 parámetros totales en precisión bf16 (aproximadamente 16,4 GB de pesos en siete ficheros safetensors). El contexto nativo de Qwen3-8B es de 32.768 tokens, ampliable a 131.072 mediante configuraciones extendidas, aunque la model card no documenta explícitamente el contexto efectivo usado en el ajuste. El modelo está publicado bajo licencia Apache 2.0 y su idioma declarado es exclusivamente coreano.

Su relevancia actual reside en que es el miembro de menor rendimiento de la familia RuBio (4B, 8B, 9B y 27B) según el benchmark propio RuBench v1, con un 76,0 % de precisión en la tarea principal, y en que su base Qwen3 pertenece a una generación distinta a la de los modelos 9B y 27B de la misma familia, lo que hace que las comparaciones directas entre escalas deban tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (base Qwen3-8B: 32.768 tokens nativos) |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 ficheros, aproximadamente 16,4 GB) |

## Arquitectura y entrenamiento
El modelo parte de MegaScience/Qwen3-8B-MegaScience (revisión 250fc190), un ajuste de Qwen/Qwen3-8B-Base sobre el corpus MegaScience/MegaScience orientado a razonamiento científico. Sobre esa base se aplicó un ajuste LoRA con el conjunto de datos RuIso-v6, descrito como datos de refuerzo de estilo y de errores fuera de criterio, y posteriormente se fusionaron los adaptadores para producir un modelo completo en bf16. El resultado se guardó inicialmente en fp32 y se convirtió a bf16 antes de la subida; según la model card, la evaluación con vLLM 0.32.0 se ejecutó en bf16, por lo que los pesos evaluados y los publicados comparten tipo de dato.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset RuIso-v6, ni si hubo etapas de RLHF o DPO. La innovación principal no es arquitectónica sino de formato de salida: el modelo está entrenado para emitir un único objeto JSON con diagnóstico por criterio, y la evaluación se realiza sin forzar esquema JSON, de modo que la adherencia al formato forma parte de la capacidad medida. En el benchmark, RuBio-8B produjo solo 1 salida JSON inválida de 200, frente a 8 del modelo base en modo permisivo y 200 de 200 en modo estricto (el base envolvió todas las respuestas en bloques de código Markdown).

## Capacidades
- Generación de texto en coreano con registro académico y didáctico, orientado a la asignatura de Biología de secundaria.
- Diagnóstico por criterio de evaluación: emite un veredicto por cada criterio de la rúbrica dentro de un objeto JSON único.
- Detección de conceptos erróneos (misconceptions): identifica y etiqueta errores conceptuales con un identificador, con una coincidencia del 64,7 % (86/133) en el conjunto de evaluación.
- Detección de errores científicos fuera de criterio (other_issues): 77,5 % de coincidencia de presencia/ausencia (155/200).
- Generación de retroalimentación para el estudiante y de información diagnóstica para el profesor en la misma respuesta estructurada.
- Modo de pista gradual (feedback_mode="hint_1") y control de revelación de la solución (reveal_requested), según la configuración de evaluación descrita.
- Soporte de conversación multi-turno mediante historial (history), aunque la evaluación se realizó en primer turno con historial vacío.
- Desactivación del modo de razonamiento (enable_thinking=false) en la configuración evaluada.
- No se documentan capacidades de visión, audio, tool calling ni function calling.

## Casos de uso
- Corrección formativa automatizada en aulas de Biología: el modelo recibe la respuesta abierta de un alumno y devuelve un JSON con el veredicto por criterio, lo que permite al profesor revisar y validar en lugar de corregir desde cero. Es adecuado porque su salida estructurada se adhiere al esquema en 199 de 200 casos del benchmark.
- Generación de retroalimentación personalizada al estudiante: a partir del diagnóstico por criterio, el modelo redacta comentarios en coreano adaptados al error concreto, lo que reduce el tiempo de respuesta en plataformas de aprendizaje.
- Detección temprana de conceptos erróneos: el etiquetado de misconceptions con identificador permite agregar estadísticas por clase y detectar qué ideas alternativas persisten, con una coincidencia del 64,7 % que exige revisión humana en producción.
- Evaluación de exámenes de práctica y simulacros: integrado en un pipeline por lotes con vLLM, puede procesar los 200 elementos de un conjunto de evaluación en un solo pod A40 de 48 GB, lo que lo hace viable para campañas de corrección masiva.
- Asistencia al diseño de rúbricas: al comparar los veredictos del modelo con los de correctores humanos se identifican criterios ambiguos o mal redactados, ya que el modelo falla de forma sistemática en los criterios con acuerdo entre anotadores de 2/3 (37,3 % de precisión en esa categoría).
- Investigación en evaluación automática educativa: sirve como línea base reproducible de 8B parámetros con licencia Apache 2.0 para comparar técnicas de ajuste en tareas de corrección por rúbrica en coreano.
- Despliegue en infraestructura propia de un centro educativo: al ser un modelo denso de 8B en bf16, cabe en una GPU de 24 GB con cuantización de 8 bits o en 48 GB en bf16, lo que permite ejecución local sin depender de APIs externas.

## Benchmarks y rendimiento
Resultados en RuBench v1, partición dev out-of-distribution (n = 200 respuestas, 604 criterios), comparados con el modelo base Qwen3-8B-MegaScience en modo permisivo (sin bloques de código Markdown):

| Metrica | RuBio-8B | Qwen3-8B-MegaScience (permisivo) | Diferencia |
|---|---:|---:|---:|
| Precisión de veredicto por criterio (principal) | 76,0 % [72,1; 79,8] | 56,2 % [51,7; 60,7] | +19,8 pp [+14,8; +24,7] |
| Precisión excluyendo criterios con acuerdo 2/3 | 78,2 % [74,2; 82,1] | 57,8 % [53,2; 62,4] | +20,4 pp [+14,9; +25,9] |
| Precisión micro (criterios agregados) | 458/604 (75,8 %) | 342/604 (56,6 %) | +19,2 pp |
| Coincidencia de conceptos erróneos | 86/133 (64,7 %) | 26/133 (19,5 %) | +45,1 pp |
| Coincidencia de errores fuera de criterio | 155/200 (77,5 %) | 141/200 (70,5 %) | +7,0 pp |
| Coincidencia de estado global | 125/200 (62,5 %) | 44/200 (22,0 %) | +40,5 pp |
| Salidas JSON inválidas | 1/200 | 8/200 (permisivo); 200/200 (estricto) | no aplica |

Desglose por fuente de confirmación de la respuesta correcta: R1 3/3, 422/521 (81,0 %) frente a 318/521 (61,0 %); R2 3/3, 13/23 (56,5 %) frente a 4/23 (17,4 %); R2 2/3, 19/51 (37,3 %) frente a 17/51 (33,3 %). En errores fuera de criterio, la sensibilidad del modelo es del 66,0 % (35/53) frente al 0,0 % (0/53) del base, mientras que la especificidad es inferior: 81,6 % (120/147) frente a 95,9 % (141/147).

Comparación dentro de la familia RuBio en la misma partición dev: RuBio-4B v2 alcanza 77,2 % [73,4; 80,9] (diferencia con 8B de -1,2 pp [-5,2; +2,7], no significativa); RuBio-4B RuIso-v6 alcanza 78,1 % [74,4; 81,9] (-2,2 pp [-5,9; +1,5], no significativa); RuBio-9B alcanza 84,9 % [81,6; 88,1] (+8,9 pp [+5,1; +12,7], significativa); RuBio-27B alcanza 86,9 % [83,8; 89,9] (+10,9 pp [+7,2; +14,6], significativa). RuBio-8B es, por tanto, el de menor precisión de los cuatro tamaños.

## Requisitos de hardware
- Inferencia en bf16: aproximadamente 16,4 GB de pesos más caché KV; requiere GPU de 24 GB o superior, con margen cómodo en 48 GB.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs de 12-16 GB con contexto moderado.
- Cuantización a 4 bits: alrededor de 4,5-5 GB de pesos, viable en GPUs de consumo como RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB, siempre que se genere el GGUF correspondiente, que no está publicado.
- GPUs recomendadas: A40 de 48 GB (configuración usada en la evaluación), A100 de 40/80 GB, H100, L40S; en consumo, RTX 4090 de 24 GB en bf16 y RTX 3090 de 24 GB.
- Despliegue: vLLM 0.32.0 documentado en la evaluación; el modelo incluye la etiqueta unsloth, por lo que es compatible con el ecosistema Unsloth para ajuste; no se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación se ejecutó con temperature=0, max_tokens=1024 y enable_thinking=false, sin medición publicada de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión RuBench v1 (dev) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| RuBio-8B | 8,19B | no disponible | 76,0 % [72,1; 79,8] | Apache 2.0 | Hugging Face (mulkzz/RuBio-8B) |
| RuBio-4B | no disponible | no disponible | 77,2 % [73,4; 80,9] (v2) | no disponible | Hugging Face (mulkzz/RuBio-4B) |
| RuBio-9B | no disponible | no disponible | 84,9 % [81,6; 88,1] | no disponible | Hugging Face (mulkzz/RuBio-9B) |
| RuBio-27B | no disponible | no disponible | 86,9 % [83,8; 89,9] | no disponible | Hugging Face (mulkzz/RuBio-27B) |
| Qwen3-8B-MegaScience (base) | 8,19B | 32.768 tokens (Qwen3-8B) | 56,2 % [51,7; 60,7] (permisivo) | Apache 2.0 | Hugging Face (MegaScience/Qwen3-8B-MegaScience) |

La comparación con RuBio-9B y RuBio-27B debe interpretarse con cautela: según la model card, esos modelos se basan en la línea Qwen3.5/Qwen3.8, con arquitectura y preentrenamiento distintos de la línea Qwen3 del modelo 8B.

## Limitaciones y advertencias
- Es el modelo de menor precisión de la familia RuBio en RuBench v1 (76,0 %), por debajo de RuBio-4B v2 (77,2 %) y muy por debajo de RuBio-9B (84,9 %) y RuBio-27B (86,9 %).
- Dominio muy restringido: solo Biología de secundaria surcoreana, unidades I-III del currículo de 2022; no es un modelo de propósito general ni debe usarse fuera de ese ámbito.
- Idioma limitado al coreano; no se documenta rendimiento en castellano ni en otros idiomas.
- El 23,9 % de los criterios se clasifican incorrectamente en la partición de evaluación, y la precisión cae al 37,3 % en criterios donde los anotadores humanos solo coinciden en 2 de 3, lo que desaconseja su uso sin revisión humana en evaluaciones con consecuencias académicas.
- Baja especificidad en la detección de errores fuera de criterio (81,6 % frente al 95,9 % del base): tiende a marcar errores inexistentes con más frecuencia que el modelo original.
- Riesgo de alucinación en la generación de retroalimentación y en la atribución de conceptos erróneos; la etiqueta de concepto erróneo solo coincide en el 64,7 % de los casos.
- La evaluación se realizó sin forzar esquema JSON; en producción conviene validar el JSON de salida y gestionar los casos inválidos (1 de 200 en el benchmark).
- La model card no documenta el contexto efectivo, los datos de entrenamiento ni los requisitos de hardware; estas carencias dificultan la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso educativo y sobre la exactitud de las correcciones recae en el integrador.
- El modelo no está desplegado en el servicio de demostración del autor, que solo opera las variantes 4B y 27B.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mulkzz/RuBio-8B
- Modelo base: https://huggingface.co/MegaScience/Qwen3-8B-MegaScience
- Modelo RuBio-4B: https://huggingface.co/mulkzz/RuBio-4B
- Modelo RuBio-9B: https://huggingface.co/mulkzz/RuBio-9B
- Modelo RuBio-27B: https://huggingface.co/mulkzz/RuBio-27B
- Servicio de demostración (sin RuBio-8B): https://mulk.codes/rubio
- Paper de referencia citado en las etiquetas (arXiv:2411.00640): https://arxiv.org/abs/2411.00640
