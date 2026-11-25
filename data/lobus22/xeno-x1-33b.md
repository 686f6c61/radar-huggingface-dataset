# Lobus22/Xeno-X1-33B

## Resumen

Xeno X1 33B es un proyecto de investigación en fase de prototipo publicado por el usuario Lobus22 en Hugging Face. No se trata de un modelo entrenado y listo para usar, sino de un repositorio que documenta el diseño de una arquitectura denominada FLOX (core compartido con factores de bajo rango por bucle) para un futuro modelo denso de 33.000 millones de parámetros, junto con un plan de datos de 18,5 billones de tokens y los resultados de un experimento a pequeña escala sobre mecanismos de memoria dinámica.

El interés actual del proyecto es metodológico: el autor publica de forma explícita los resultados negativos de su prototipo, en el que la memoria dinámica con lectura y escritura diferenciables no superó a una línea base neuronal pura en un presupuesto de 200 pasos. El repositorio incluye el plan de asignación de datos en JSON, los resultados comparativos de las tres variantes y un checkpoint de prototipo en formato PyTorch (`.pt`) que no constituye un modelo de producción.

No hay pesos publicados en formato safetensors ni GGUF, el tamaño del repositorio es de 0,0 GB y no consta pipeline de inferencia. Cualquier evaluación práctica del modelo es, por tanto, imposible con la información disponible; la ficha describe el diseño declarado y los datos experimentales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FLOX (core compartido + factores low-rank por bucle), transformer denso |
| Parametros totales | 33B (objetivo declarado; no hay pesos publicados) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id), ingles (en); el plan de datos incluye 8 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de prototipo en PyTorch (`.pt`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura propuesta, FLOX, se describe como un transformer denso de 33B parámetros en el que un core de pesos compartidos se combina con factores de bajo rango específicos por bucle, un esquema de parametrización eficiente que recuerda a las propuestas de compartir pesos entre capas con adaptadores de bajo rango. Sobre esa base se añade un mecanismo de memoria dinámica (DMM) con operaciones de lectura y escritura entrenables por gradiente, cuyo objetivo es evitar que la memoria del modelo sea estática.

El plan de datos previsto asciende a 18,5 billones de tokens: 5,50T de indonesio (29,7%), 1,50T de inglés (8,1%), 0,50T repartidos entre ocho idiomas adicionales (62,5M por idioma, 2,7%) y 11,00T de contenido científico y profesional (59,5%), desglosado en 4,0T de STEM en 40 disciplinas, 3,0T de código y software, 2,0T de arte y humanidades en 40 disciplinas y 2,0T de conocimiento general y profesional en otras 40. No se especifica el número de tokens de entrenamiento efectivamente ejecutados ni si hubo fases de RLHF o DPO.

El único resultado experimental publicado compara tres variantes en CPU con un presupuesto idéntico de 200 pasos y modelos de entre 239.424 y 270.241 parámetros: la variante neuronal pura obtiene 3,153 bpc y 35,69% de accuracy; la memoria estática tipo bigrama, 3,132 bpc y 36,43%; y la memoria dinámica DMM, 3,154 bpc y 35,74%. El propio autor señala que, a esa escala, la memoria dinámica no aporta ventaja y que el experimento es insuficiente para concluir nada sobre la arquitectura final.

## Capacidades

- No hay ninguna capacidad verificable: el repositorio no contiene pesos de un modelo funcional, solo un state dict de prototipo a escala de CPU.
- Generación de texto, razonamiento, código y matemáticas: previstas en el diseño por la composición del plan de datos, sin evidencia empírica publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el plan de datos cubre indonesio, inglés y ocho idiomas adicionales sin especificar; no hay evaluación.
- Memoria dinámica entrenable (lectura/escritura por gradiente): es la innovación declarada, pero los resultados del prototipo no muestran ventaja frente a la línea base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio de arquitecturas con pesos compartidos: el diseño FLOX (core compartido más factores de bajo rango por bucle) sirve como referencia para investigar parametrizaciones eficientes en modelos densos de gran tamaño, aunque no hay implementación publicada que validar.
- Reproducción de experimentos de memoria diferenciable: el repositorio incluye `dmm_results.json` y `xeno_proto_dmm.pt`, lo que permite auditar el protocolo de comparación entre memoria estática y dinámica a pequeña escala.
- Planificación de mezclas de datos multilingües: `xeno_x1_33b_data_plan.json` documenta una asignación concreta de 18,5T de tokens con proporciones por idioma y dominio, útil como plantilla para discutir sesgos de mezcla en corpus de entrenamiento.
- Análisis de resultados negativos en investigación: el caso es apropiado para estudiar cómo se reporta un experimento que no confirma la hipótesis, con métricas de bpc y accuracy y un reconocimiento explícito de las limitaciones de escala.
- Docencia sobre evaluación de prototipos: la comparación de tres variantes con presupuesto fijo de 200 pasos y recuentos de parámetros cercanos sirve para ilustrar el efecto del tamaño de modelo en la validez de las conclusiones.
- Referencia para proyectos comunitarios de modelos en indonesio: el plan de datos prioriza el indonesio (29,7%) sobre el inglés (8,1%), una elección poco habitual que puede interesar a quien planifique modelos centrados en esa lengua.
- Despliegue en producción: no aplicable, al no existir pesos ni pipeline de inferencia.

## Benchmarks y rendimiento

Los únicos datos publicados son los del prototipo a escala de CPU, no del modelo de 33B:

| Variante | bpc | Accuracy | Parámetros |
|---|---|---|---|
| Neuronal pura | 3,153 | 35,69% | 239.424 |
| Memoria estática (bigram) | 3,132 | 36,43% | 246.144 |
| Memoria dinámica (DMM) | 3,154 | 35,74% | 270.241 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para el modelo de 33B en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no existen pesos del modelo de 33B.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no evaluable sin pesos publicados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el único artefacto es un state dict de prototipo en `.pt` ejecutable en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de 33B densos con mecanismos de memoria diferenciable y licencia Apache 2.0 que hayan publicado pesos; la comparación con alternativas reales (por ejemplo, modelos densos de ~30B ampliamente disponibles) carece de base porque Xeno X1 33B no ofrece pesos ni métricas a esa escala.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: el tamaño es de 0,0 GB y el único checkpoint es un prototipo de unos 270.000 parámetros en CPU.
- El experimento de memoria dinámica no respalda la hipótesis del autor: DMM obtiene 3,154 bpc frente a 3,153 de la línea base neuronal pura, es decir, sin mejora.
- El presupuesto de 200 pasos y la escala de parámetros son insuficientes para extrapolar conclusiones al modelo de 33B, como reconoce el propio autor.
- El plan de 18,5T de tokens es una intención de diseño, no datos efectivamente procesados; no se documenta el estado real del entrenamiento.
- Riesgo de alucinación y sesgos: no evaluables sin pesos ni evaluaciones publicadas.
- Idiomas: solo se declaran indonesio e inglés, con ocho idiomas adicionales sin especificar; la cobertura real es desconocida.
- Licencia Apache 2.0 declarada, lo que en principio permitiría uso comercial, pero al no existir artefactos utilizables la licencia carece de efecto práctico por ahora.
- Nombre y etiquetas ("xeno", "flox", "prototype") indican un proyecto en fase temprana de investigación, no un producto listo para producción.
- No hay pipeline de inferencia ni instrucciones de uso publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lobus22/Xeno-X1-33B
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
