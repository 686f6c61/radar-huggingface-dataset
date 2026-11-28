# mrfakename/Hy4-flash-abliterated

## Resumen

Hy4-flash-abliterated es una variante del modelo multimodal tencent/Hy4-flash a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante ablación direccional. Lo publica el desarrollador independiente mrfakename, conocido por sus versiones "abliterated" y "uncensored" de modelos populares. El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidades de imagen-texto a texto, desarrollado por Tencent, y esta variante conserva exactamente la misma arquitectura, pesos en BF16 y formato de carga que el original.

El problema que aborda esta ficha es concreto: el modelo original rechaza sistematicamente peticiones dañinas (92 de 100 en modo chat segun la model card), mientras que esta version reduce ese rechazo a 4 de 100 manteniendo, segun el autor, respuestas casi identicas en prompts benignos (KL de 0,233 en el primer token). La relevancia actual radica en que demuestra una tecnica de ablacion mas sofisticada que las habituales: mide direcciones de rechazo por separado para chat y modo "think", las corrige por la ganancia de las sandwich norms y las proyecta fuera de 65 tensores especificos sin tocar ninguno de los 192 expertos enrutados por capa.

Con 220.251.201.958 parametros totales (unos 220 mil millones) y un repositorio de 440,5 GB, es un modelo de gran escala que requiere infraestructura seria para inferencia. La licencia es la tencent-hy-license, heredada del modelo base, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con torre de vision; incluye sandwich norms (RMS norm con ganancia aprendida tras cada writer) y capas DFly draft para decodificacion especulativa |
| Parametros totales | 220.251.201.958 (220,25 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); GGUF Q4_K_M disponible en repositorio separado; LoRA de ablacion en GGUF para aplicar el edit a cualquier cuantizacion del original |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (BF16), GGUF, LoRA GGUF, NPZ (datos del edit) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 192 expertos enrutados por capa y expertos compartidos, ademas de una torre de vision que lo habilita para la tarea image-text-to-text. Una particularidad estructural relevante para esta variante es el uso de sandwich norms: tras cada writer (proyeccion de atencion, down-projection de expertos compartidos, up-projection de expertos enrutados) se aplica una RMS norm con ganancia aprendida antes de escribir en el residual stream. El modelo incorpora tambien capas DFly draft, lo que sugiere soporte de decodificacion especulativa.

El proceso de ablacion, documentado en la model card, consistio en medir direcciones de rechazo por separado para prompts de chat (`reasoning_effort: no_think`) y de razonamiento (`reasoning_effort: high`) sobre la cuantizacion Q4_K_M del original, en el residual stream a la entrada de la FFN de cada capa. El rechazo se separa con fuerza a partir de la capa 18. Las direcciones de chat y think resultaron poco alineadas (coseno 0,2-0,6), por lo que se tomo como subespacio candidato los principales vectores singulares de ambas familias en las capas 18-41. Una busqueda multiobjetivo de 100 pruebas (minimizar rechazos, mantener bajo el KL del primer token en prompts benignos) selecciono rango 1 y fuerzas por capa: atencion con 1,27-1,78 en las 42 capas (pico en la 18), down-projection de expertos compartidos con 0,95-0,98 en capas 31-37 y up-projection de expertos enrutados con 0,45-1,42 en capas 26-41 (pico en la 34). Se editaron 65 tensores en total, sin tocar ninguno de los 192 expertos enrutados, el router, la tabla Engram, los embeddings, `lm_head`, la torre de vision ni las capas DFly. El redondeo a BF16 se hizo fila a fila para que los errores se cancelen a lo largo de la direccion eliminada.

## Capacidades

- Generacion de texto conversacional multi-turno, con modo de razonamiento explicito (`reasoning_effort: high`) y modo rapido sin razonamiento (`reasoning_effort: no_think`).
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text): la torre de vision se conserva intacta respecto al original.
- Razonamiento multi-paso en modo think, con cadenas de razonamiento mas largas que el original segun la model card.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, aunque no se aportan benchmarks especificos en la informacion disponible.
- Multilingue: no se detallan los idiomas soportados en la informacion proporcionada.
- Comportamiento "uncensored": el modelo cumple con peticiones dañinas que el original rechaza (4/100 en chat, 6/100 en think segun la model card).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la libreria transformers.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como se distribuye la direccion de rechazo en un MoE de gran escala y comparar el comportamiento del modelo original frente al abliterado en el mismo prompt, con la ventaja de que el edit esta documentado tensor a tensor en `bake-stats.txt` y `abliteration-edit.npz`.
- Analisis de robustez de filtros: evaluar si sistemas de moderacion externos detectan respuestas generadas por un modelo sin rechazo integrado, usando el par original/abliterado como control experimental.
- Red teaming controlado: generar respuestas a peticiones dañinas en un entorno aislado para calibrar clasificadores de seguridad, dado que el modelo cumple con un 96 % de las peticiones que el original rechaza.
- Evaluacion de tecnicas de ablacion: el repositorio incluye la LoRA de ablacion en GGUF y los datos del edit, lo que permite reproducir el proceso sobre otras cuantizaciones del original y comparar metodologias (por ejemplo, frente al enfoque usado en Ling-3.2-air, con KL de 0,05 frente al 0,233 de este modelo).
- Procesamiento multimodal en pipelines de investigacion: al conservar la torre de vision intacta, sirve para tareas image-text-to-text en las que se quiera evitar el rechazo del modelo base ante imagenes o prompts sensibles.
- Experimentacion con decodificacion especulativa: las capas DFly draft se mantienen bit-identicas, por lo que el modelo puede usarse para medir el impacto de la ablacion en latencia y throughput con decodificacion especulativa.
- Despliegue en local con llama.cpp: la cuantizacion Q4_K_M y la LoRA de ablacion permiten ejecutar el modelo en entornos con recursos limitados aplicando el edit sobre el GGUF original.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las tasas de rechazo y el KL del primer token, medidos sobre la cuantizacion Q4_K_M con decodificacion greedy y 100 prompts dañinos reservados (384 tokens en chat, 768 en think):

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos, chat (/100) | 92 | 4 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 89 | 6 |
| KL, primer token en prompts benignos | 0 | 0,233 |

Notas del autor: el KL es superior al de otras ablaciones suyas (0,05 en Ling-3.2-air) porque el rechazo de este modelo esta repartido entre mas capas; el ruido de base por inferencia en batch es de 0,02-0,03. En modo think el modelo abliterado razona mas tiempo: 44 de 100 respuestas no habian terminado el razonamiento a los 768 tokens, frente a 2-4 del original. La repeticion es de aproximadamente el 1 %, igual que el original, por lo que no hay bucle.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el checkpoint pesa 440,5 GB, por lo que requiere al menos unos 440 GB de VRAM o memoria unificada solo para los pesos, mas el overhead de activaciones y KV cache.
- Cuantizacion Q4_K_M: reduce el peso a aproximadamente una cuarta parte del BF16 (en torno a 110-120 GB estimados a partir del tamano del repo, dato no confirmado en la informacion disponible), lo que sigue exigiendo multiples GPU o un nodo con memoria unificada grande.
- GPU recomendadas: para BF16, nodos multi-GPU con A100 80 GB o H100 80 GB (al menos 6 unidades en el papel, mas margen para activaciones); para Q4_K_M, configuraciones de 2-4 GPU de 80 GB o equivalentes.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU consumer actual, ni siquiera con cuantizaciones agresivas, dado el tamano del modelo.
- Opciones de despliegue: transformers (formato nativo), llama.cpp / llama-server con los GGUF y la LoRA de ablacion, y endpoints compatibles (tag `endpoints_compatible`). Soporte de vLLM, TGI u Ollama no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. La presencia de capas DFly draft sugiere que el modelo base esta disenado para decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-abliterated | 220,25 mil millones (MoE) | no disponible | 4/100 | tencent-hy-license | Hugging Face (BF16 + GGUF + LoRA) |
| tencent/Hy4-flash (original) | 220,25 mil millones (MoE) | no disponible | 92/100 | tencent-hy-license | Hugging Face |
| Ling-3.2-air abliterated (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (MoE de gran escala con vision) no esta disponible en la informacion proporcionada. El unico punto de referencia concreto es el modelo original, del que esta variante hereda arquitectura, pesos y licencia, y la mencion del autor a su ablacion de Ling-3.2-air, con un KL de 0,05 frente al 0,233 de este modelo.

## Limitaciones y advertencias

- El modelo cumple con peticiones dañinas de forma deliberada: la model card lo advierte explicitamente y la responsabilidad de uso recae en el usuario.
- Riesgo elevado de uso indebido: no debe desplegarse en produccion orientada al publico sin filtros externos de moderacion.
- El KL de 0,233 en el primer token sobre prompts benignos es superior al de otras ablaciones del mismo autor; aunque el autor afirma que las respuestas a prompts ordinarios son casi identicas, existe una desviacion medible respecto al original.
- En modo think el modelo consume mas tokens de razonamiento (44 de 100 respuestas sin terminar a 768 tokens), lo que exige presupuestos de tokens mayores y encarece la inferencia.
- La licencia tencent-hy-license impone restricciones que deben revisarse antes de cualquier uso comercial; el tag `license:other` indica condiciones no estandar.
- No se detallan los idiomas soportados, por lo que el comportamiento multilingue no esta garantizado.
- El modelo base puede presentar sesgos heredados de sus datos de entrenamiento; la ablacion no los corrige y puede alterar el comportamiento en dominios sensibles.
- No hay datos publicados de benchmarks estandar, latencia ni throughput, lo que dificulta evaluar su rendimiento en tareas generales frente a alternativas.
- El tamano del repositorio (440,5 GB en BF16) y la ausencia de confirmacion de soporte en vLLM, TGI u Ollama limitan las opciones de despliegue.
- La tecnica de ablacion no toca los 192 expertos enrutados por capa, pero si 65 tensores de atencion y MLP; cambios futuros en el modelo base invalidarian la LoRA de ablacion incluida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Hy4-flash-abliterated
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantizaciones GGUF: https://huggingface.co/mrfakename/Hy4-flash-abliterated-GGUF
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Discord del autor: https://discord.com/invite/foss
