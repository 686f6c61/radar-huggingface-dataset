# cosmicishan/gemma-7b-PDDL-CoT-SFT

## Resumen

`cosmicishan/gemma-7b-PDDL-CoT-SFT` es un ajuste fino supervisado (SFT) del modelo base `google/gemma-7b`, publicado por el usuario cosmicishan en Hugging Face. El modelo está especializado en generación de PDDL (Planning Domain Definition Language) mediante razonamiento en cadena de pensamiento (chain-of-thought, CoT), según indican sus etiquetas y su nombre. Se trata, por tanto, de un modelo orientado a tareas de planificación automática clásica, donde el objetivo es transformar descripciones en lenguaje natural en dominios y problemas PDDL válidos.

El modelo conserva la arquitectura transformer decoder-only del Gemma 7B original, con 8.537.680.896 parámetros totales según los pesos en safetensors, y se distribuye bajo la licencia Gemma de Google, con acceso restringido que requiere aceptar las condiciones en Hugging Face. El repositorio ocupa 17,1 GB y está pensado para usarse con la librería `transformers` y con text-generation-inference.

Su relevancia es acotada pero específica: cubre un nicho poco atendido por los modelos generalistas, como es la traducción de instrucciones en lenguaje natural a representaciones formales PDDL con trazas de razonamiento intermedias. No obstante, la ausencia de documentación técnica publicada, benchmarks y métricas de evaluación limita seriamente la capacidad de evaluar su calidad real en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-7b) |
| Parametros totales | 8.537.680.896 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-7b`, un transformer decoder-only de aproximadamente 8,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) orientado a generar PDDL con cadenas de razonamiento intermedias, según reflejan las etiquetas `pddl`, `planning` y `chain-of-thought`. No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset, la metodología de anotación de las trazas CoT ni si se aplicaron técnicas adicionales como RLHF o DPO.

Tampoco se documentan innovaciones técnicas propias del ajuste, ni detalles sobre la tokenización de PDDL, el formato exacto de las trazas de razonamiento o el tratamiento de los símbolos y predicados del dominio de planificación. Toda la información disponible se limita a los metadatos del repositorio de Hugging Face.

## Capacidades

- Generación de texto con `transformers` y compatibilidad con text-generation-inference y endpoints.
- Generación de dominios y problemas PDDL a partir de descripciones, presumiblemente en lenguaje natural, según la especialización declarada en las etiquetas.
- Razonamiento en cadena de pensamiento (CoT) orientado a la construcción de planes formales.
- Planificación automática clásica como dominio de aplicación principal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso generalista: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Traducción de enunciados de planificación a PDDL: dado un problema descrito en lenguaje natural, el modelo generaría el dominio y el problema en formato PDDL, aprovechando el ajuste SFT específico para esta tarea.
- Generación de trazas CoT para depuración de planes: el modelo puede producir razonamientos intermedios que ayuden a un ingeniero a auditar por qué se propone un determinado predicado o acción.
- Asistencia en investigación en planificación automática: útil para generar borradores de dominios PDDL que luego se validan con planificadores como Fast Downward o VAL.
- Prototipado de pipelines de IA neuro-simbólica: integración del modelo como componente de traducción lenguaje natural a PDDL dentro de un sistema mayor que invoque un planificador simbólico.
- Generación de datasets sintéticos de PDDL: el modelo puede producir pares instrucción-PDDL para aumentar corpus de entrenamiento en tareas de planificación.
- Docencia y formación en planificación clásica: generación de ejemplos de dominios y problemas PDDL con explicaciones paso a paso para materiales educativos.
- Evaluación comparativa de modelos especializados: como referencia en estudios sobre ajuste fino para lenguajes formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 17 GB solo para pesos, más overhead de activaciones y KV cache, lo que sitúa el requisito práctico en torno a 20-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB; en 4 bits, en torno a 5-6 GB, aunque no se han publicado versiones GGUF o cuantizadas oficiales del ajuste.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 ajustado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 con margen limitado, y en GPUs de 12-16 GB solo mediante cuantización.
- Opciones de despliegue: `transformers`, text-generation-inference (declarado en los tags), endpoints compatibles; llama.cpp y Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Acceso |
|---|---|---|---|---|---|
| cosmicishan/gemma-7b-PDDL-CoT-SFT | 8.537.680.896 | no disponible | PDDL con CoT | Gemma | Restringido |
| google/gemma-7b | ~8.500 millones | 8.192 tokens (modelo base) | Generacion general | Gemma | Restringido |
| Modelos generalistas de 7-8B (p. ej., Llama 3.1 8B, Mistral 7B) | ~7.000-8.000 millones | 8.192-131.072 tokens | Generacion general | Llama / Apache 2.0 | Abierto o restringido |

La comparación directa con alternativas especializadas en PDDL no está disponible en la información proporcionada. Frente al Gemma 7B base, este ajuste añade la especialización en PDDL y CoT, pero carece de documentación sobre la magnitud de la mejora.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del ajuste ni sobre la composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación elevado en la generación de PDDL: predicados, tipos o acciones inventados pueden producir dominios sintácticamente válidos pero semánticamente incorrectos, por lo que es imprescindible validar con herramientas como VAL o un planificador.
- Longitud de contexto no documentada; no se recomienda asumir la ventana del Gemma 7B base sin verificación empírica.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Licencia Gemma: uso comercial permitido bajo las condiciones de Google, con obligaciones de atribución y restricciones de uso; el acceso está restringido y requiere aceptar los términos en Hugging Face.
- Sin descargas ni likes en el momento de la consulta, y sin documentación técnica, benchmarks ni model card detallada: no es un modelo validado para producción.
- No se ofrecen pesos cuantizados oficiales, lo que complica el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cosmicishan/gemma-7b-PDDL-CoT-SFT
- Modelo base: https://huggingface.co/google/gemma-7b
- Licencia Gemma: https://ai.google.dev/gemma/terms
