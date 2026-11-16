# BeardedMonster/gemma-3-385m-science-translate-best

## Resumen

`gemma-3-385m-science-translate-best` es un modelo de traducción automática English-to-African fine-tuneado a partir de `google/gemma-3-270m-it` por el usuario BeardedMonster. El modelo resuelve un problema concreto y poco cubierto: la traducción de texto científico en inglés hacia lenguas africanas de bajos recursos, un dominio donde los modelos multilingües generalistas rinden de forma especialmente pobre. Con 385.144.448 parámetros reales (39 capas) y una arquitectura `Gemma3ForCausalLM`, el modelo incorpora 125 etiquetas de idioma de un solo token que dirigen la traducción hacia cada lengua destino.

El modelo se construye en dos fases sobre el modelo general `BeardedMonster/gemma-3-385m-translate-best`: un SFT específico de ciencia sobre datos de AfriScience-MT con interpolación de pesos (alpha 0.5) y un posterior RL de 160 pasos. Es relevante ahora porque demuestra que un modelo de menos de 400M de parámetros puede especializarse en un nicho de traducción científica de bajos recursos mediante GRPO, aunque con limitaciones importantes: solo seis lenguas (amárico, hausa, luganda, sepedi, yoruba y zulú) fueron entrenadas o evaluadas para ciencia, y la mejora reportada sobre el modelo general es de aproximadamente +1,7 chrF.

Se trata de un release de investigación: una sola semilla de entrenamiento, sin evaluación humana y con un uso previsto de traducción oración a oración (no documento completo). La licencia es Gemma, lo que impone restricciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Gemma3ForCausalLM` (transformer decoder-only) |
| Parámetros totales | 385.144.448 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantización | no disponible (pesos en bfloat16; repo de 1,6 GB) |
| Idiomas soportados | 125 etiquetas de idioma; entrenamiento/evaluación científica solo en amárico, hausa, luganda, sepedi (nso), yoruba y zulú; el resto de etiquetas funcionan como en el modelo general |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, con 39 capas y 385.144.448 parámetros, derivado de `google/gemma-3-270m-it`. La innovación principal no está en la arquitectura sino en el esquema de condicionamiento por idioma: 125 etiquetas de un solo token (por ejemplo `<hau>`, `<yor>`) que se emiten al inicio de la respuesta y dirigen la traducción. El prompt de entrada sigue un formato fijo (`Translate the text to {language_name}:  {text}`, con dos espacios tras los dos puntos) y la salida esperada es `<tag> <traducción><end_of_turn>`.

El entrenamiento parte del modelo general `BeardedMonster/gemma-3-385m-translate-best` y aplica dos etapas: un SFT sobre datos de ciencia de AfriScience-MT con interpolación de pesos (alpha 0,5) y un RL de 160 pasos (tag `grpo`). El autor indica que la ganancia científica sobre el modelo general es de aproximadamente +1,7 chrF y que la no regresión se comprobó únicamente en NTREX y MAFAND-MT. Se trata de un único seed de entrenamiento y sin evaluación humana.

## Capacidades

- Traducción de texto científico de inglés a lenguas africanas, restringida a dirección inglés → africano (no bidireccional).
- Soporte de 125 etiquetas de idioma de un solo token, aunque el entrenamiento y evaluación científica se limitan a seis lenguas.
- Generación de texto autoregresiva con decodificación greedy recomendada (`do_sample=False`, `max_new_tokens=256`, parada en `<end_of_turn>`, id 106).
- Procesamiento oración a oración; no soporta traducción de documentos completos en un solo prompt.
- Compatibilidad con `transformers`, vLLM y text-generation-inference (tags `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Traducción de resúmenes científicos a hausa o yoruba: dividiendo el abstract en oraciones y traduciendo cada una con `translate(texto, "Hausa")`, se obtiene una versión localizada para divulgación científica.
- Localización de material educativo de ciencias en zulú o amárico: el modelo permite traducir lecciones y glosarios oración a oración, adecuado por su especialización SFT en AfriScience-MT.
- Generación de subtítulos o notas técnicas multilingües: con una sola frase y un batch de cinco idiomas (yoruba, hausa, swahili, zulú, amárico) en vLLM, se produce la misma frase en varias lenguas de forma eficiente.
- Apoyo a ONGs y proyectos de salud pública: traducción de fichas y avisos científicos a luganda o sepedi, lenguas con escasa cobertura en modelos comerciales.
- Pipeline de prepublicación científica: traducción preliminar de artículos a lenguas africanas para revisión humana posterior, dado que el modelo es un release de investigación sin evaluación humana.
- Servicio de traducción de bajo coste en producción: al tener 385M de parámetros y caber en una GPU consumer, permite desplegar un endpoint vLLM con `max_model_len=4096` y latencia baja para volúmenes moderados de texto científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. El autor únicamente reporta que la ganancia científica sobre el modelo general es de aproximadamente +1,7 chrF y que la no regresión se comprobó en NTREX y MAFAND-MT, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,6 GB en safetensors; en bfloat16 requiere aproximadamente 0,8 GB de pesos más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, con holgura, al ser un modelo de 385M de parámetros.
- Opciones de despliegue: `transformers` (bfloat16), vLLM (`dtype="bfloat16"`, `max_model_len=4096`) y text-generation-inference (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `BeardedMonster/gemma-3-385m-science-translate-best` | 385.144.448 | no disponible | Traducción EN→africano, ciencia | Gemma |
| `BeardedMonster/gemma-3-385m-translate-best` (modelo general) | 385M aprox. | no disponible | Traducción EN→africano, general | Gemma |
| `google/gemma-3-270m-it` (base) | 270M aprox. | no disponible | Modelo instructivo general | Gemma |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo seis lenguas (amárico, hausa, luganda, sepedi, yoruba, zulú) fueron entrenadas o evaluadas para texto científico; el resto de etiquetas heredan el comportamiento del modelo general sin garantías en dominio científico.
- La traducción de documentos completos en un solo prompt falla: el autor reporta finalización 0,70 y bucle 0,85; es obligatorio dividir en oraciones.
- Release de investigación con un único seed de entrenamiento y sin evaluación humana.
- La mejora científica reportada es modesta (aproximadamente +1,7 chrF) y la no regresión solo se comprobó en NTREX y MAFAND-MT.
- Direccionalidad restringida: solo inglés → lenguas africanas, no al contrario.
- Licencia Gemma: impone restricciones de uso comercial según los términos de Google.
- Riesgo de alucinación y de bucles en generaciones largas, mitigable con decodificación greedy y parada en `<end_of_turn>`.
- El `frequency_penalty=0.1` en vLLM se midió solo en el modelo general, no en esta versión científica.

## Enlaces

- Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-385m-science-translate-best
- Modelo general: https://huggingface.co/BeardedMonster/gemma-3-385m-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Repositorio de origen de los pesos: https://huggingface.co/AletheiaAING/gemma-0.4B-translate-rl
- Licencia Gemma: https://ai.google.dev/gemma/terms
