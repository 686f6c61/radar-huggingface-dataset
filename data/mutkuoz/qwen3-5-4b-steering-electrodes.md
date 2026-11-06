# mutkuoz/qwen3.5-4b-steering-electrodes

## Resumen
El modelo `mutkuoz/qwen3.5-4b-steering-electrodes` es una colección de 127 adaptadores de steering por activaciones (activation steering) para el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: cada adaptador modifica el comportamiento del modelo base empujando un único neurónio MLP identificado por un pipeline de interpretabilidad denominado LLM Electrodes. Los adaptadores no alteran los pesos del modelo base ni requieren system prompt; actúan sobre la activación interna de una neuróna concreta.

Cada subcarpeta del repositorio contiene un adaptador PEFT independiente asociado a una persona o comportamiento específico (por ejemplo, respuestas parciales en chino, estilo de boletín escolar británico, spam de esteroides legales, etc.). La dosis de steering se expresa como múltiplo de la norma residual mediana de la capa correspondiente, con valores negativos para suprimir el neurónio y positivos para amplificarlo. Varios adaptadores pueden activarse simultáneamente y sus contribuciones se suman.

El interés del artefacto es principalmente de investigación en interpretabilidad y control de comportamiento en LLMs. Su utilidad práctica es indirecta: sirve como banco de pruebas para estudiar cómo neuronas individuales modulan estilos, idiomas y sesgos, y como herramienta de demostración del ecosistema LLM Electrodes. No está pensado como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores PEFT de activation steering sobre transformer Qwen3.5-4B (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (el base es Qwen/Qwen3.5-4B; los adaptadores son PEFT y su recuento no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-4B soporta varios idiomas, pero no se detalla) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento
El artefacto no es un modelo entrenado, sino un conjunto de adaptadores de activation steering construidos sobre Qwen/Qwen3.5-4B. Cada adaptador corresponde a una neuróna MLP concreta (por ejemplo, L2 N48, L3 N1242, L3 N3500) y aplica un desplazamiento en la dirección de activación de esa neuróna, escalado por una dosis definida como múltiplo de la norma residual mediana de la capa. Los adaptadores se empaquetaron con la librería PEFT, usando una implementación de activation steering propuesta en el PR huggingface/peft#4066, que aún no forma parte de una release estable de PEFT.

El descubrimiento de las neuronas se realizó mediante el pipeline LLM Electrodes, que según la model card aplica una batería de comprobaciones para seleccionar neuronas con efectos consistentes. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni si hubo RLHF/DPO; el dataset asociado (`mutkuoz/llm-electrodes`) contiene respuestas, juicios y evidencias por neuróna, no datos de entrenamiento convencionales.

## Capacidades
- Modificación controlada de estilo y persona del modelo base mediante un único neurónio MLP, sin system prompt ni cambio de pesos.
- Steering multilingüe inducido: un adaptador concreto hace que el modelo responda parcial o totalmente en chino simplificado a prompts en inglés.
- Activación simultánea de varios adaptadores con suma de contribuciones, permitiendo combinar personas o estilos.
- Ajuste de dosis positivo (amplificación) y negativo (supresión) por neuróna.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de estos adaptadores; estas dependerían del modelo base Qwen3.5-4B.
- Uso orientado a experimentación e interpretabilidad, no a generación de texto generalista de producción.

## Casos de uso
- Investigación en interpretabilidad mecanicista: estudiar cómo una sola neuróna MLP modula el idioma de respuesta, el estilo o el contenido, usando los adaptadores como intervenciones controladas y reproducibles.
- Análisis de sesgos y derivas de comportamiento: reproducir personas problemáticas (spam, estafas, jerga militar) para auditar cómo el modelo base responde a estímulos internos y evaluar filtros de seguridad.
- Demostración educativa del ecosistema LLM Electrodes: ejecutar el cockpit local con un clic para mostrar a estudiantes o investigadores el efecto de activar y desactivar neuronas concretas.
- Experimentos de composición de adaptadores: combinar dos o más personas (por ejemplo, WWE y rebajas) y medir cómo se suman sus efectos en la salida.
- Pruebas de robustez lingüística: usar el adaptador de cambio a chino para evaluar la estabilidad del idioma de salida y detectar mezclas intra-frase.
- Benchmarking de métodos de steering: comparar activation steering por neuróna con otras técnicas (prompting, fine-tuning, LoRA) en tareas de control de estilo y idioma.
- Validación de implementaciones PEFT: probar la rama de activation steering del PR #4066 en entornos de investigación antes de su integración estable.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen3.5-4B en bfloat16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache, por lo que se recomienda al menos 12-16 GB para comodidad.
- GPU recomendadas: no se especifican en la información disponible; por tamaño del base, GPU consumer de gama alta (RTX 4090, 24 GB) o profesionales (A100, H100) son adecuadas.
- Compatibilidad con GPU consumer: probable en GPUs con 16 GB o más (por ejemplo, RTX 4080/4090) usando bfloat16; no confirmado en la información disponible.
- Opciones de despliegue: el ejemplo oficial usa transformers + PEFT con la rama `BenjaminBossan/peft@activation-steering`; no se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mutkuoz/qwen3.5-4b-steering-electrodes | No disponible (base 4B) | No disponible | Adaptadores PEFT de activation steering | MIT | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Transformer causal | No disponible en la informacion | Hugging Face |
| Adaptadores LoRA convencionales sobre Qwen3.5-4B | No disponible | No disponible | PEFT LoRA | Variable | Hugging Face |

La comparativa con alternativas de la misma categoría (otros métodos de steering o adaptadores de interpretabilidad) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo generalista: los adaptadores inducen comportamientos específicos y a menudo degradados (spam, estafas, jerga, bucles de texto), no respuestas útiles.
- Algunos adaptadores generan contenido problemático por diseño (spam de esteroides, estafas bancarias, jerga militar); deben usarse solo en entornos de investigación controlados.
- El adaptador de cambio a chino puede mezclar idiomas dentro de una misma frase, reduciendo la coherencia.
- Varios adaptadores ignoran la pregunta real o entran en bucles de repetición de encabezados y frases.
- La implementación de activation steering no está en una release estable de PEFT; requiere instalar una rama específica, lo que introduce riesgo de incompatibilidad.
- No se documentan sesgos específicos, riesgos de alucinación adicionales, limitaciones de contexto o restricciones comerciales más allá de la licencia MIT; estos dependen del modelo base Qwen3.5-4B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/mutkuoz/llm-electrodes (doi:10.57967/hf/11353)
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- PR de PEFT para activation steering: https://github.com/huggingface/peft/pull/4066
- Rama de PEFT usada: https://github.com/BenjaminBossan/peft@activation-steering
- Adaptador The Legal Steroid Spambot: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-legal-steroid-spambot
- Adaptador Everything's On Sale: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-everythings-on-sale
- Adaptador Thank You For Your Service: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-thank-you-for-your-service
- Adaptador The Bank Details Scammer: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-bank-details-scammer
- Adaptador Everything Is WWE: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-everything-is-wwe
- Adaptador The Testator: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-testator
- Adaptador To Be Honest, Honestly: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-to-be-honest
