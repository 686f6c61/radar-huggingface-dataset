# mradermacher/LFM3-1.7B-CPT-Wikipedia-Languages-GGUF

## Resumen

LFM3-1.7B-CPT-Wikipedia-Languages-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages, publicada por el usuario mradermacher. Se trata, por tanto, de un artefacto derivado: no introduce entrenamiento nuevo, sino que convierte los pesos del modelo original a formatos optimizados para inferencia en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles.

El modelo subyacente pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) con 1.700 millones de parámetros y ha sido sometido a un proceso de continued pre-training (CPT) sobre un corpus de Wikipedia en varios idiomas, según se deduce del nombre del repositorio. Este tipo de ajuste busca reforzar el conocimiento enciclopédico y la cobertura multilingüe del modelo base, no sus capacidades conversacionales.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas vías prácticas de ejecutar un modelo LFM3 de 1,7B en hardware de consumo, gracias a las cuantizaciones Q4_K_M, Q5_K_M o IQ4_XS; por otro, advierte de que la información publicada por el autor es extremadamente escasa (sin licencia declarada, sin idiomas especificados y sin benchmarks), lo que limita seriamente su uso en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; arquitectura exacta no declarada en la información proporcionada) |
| Parametros totales | 1,7 mil millones (según el identificador del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el CPT se realizó sobre Wikipedia en varios idiomas, pero no se detalla la lista) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna del modelo. El identificador LFM3 remite a la tercera generación de Liquid Foundation Models, pero la model card del repositorio no especifica si se trata de un transformer convencional, de una arquitectura híbrida con capas de estado recurrente o de otro diseño. Tampoco se documentan el número de capas, las dimensiones ocultas, el número de cabezas de atención ni el vocabulario.

En cuanto al entrenamiento, el sufijo CPT-Wikipedia-Languages indica que el modelo original Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages fue sometido a continued pre-training sobre un corpus de Wikipedia multilingüe. No se detalla el número de tokens utilizados, la composición exacta del dataset, la proporción por idioma ni si hubo fases posteriores de ajuste fino supervisado, RLHF o DPO. El repositorio aquí descrito no aporta entrenamiento adicional: únicamente aplica cuantización estática sobre los pesos en precisión completa, con la configuración indicada en los metadatos (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generación de texto autoregresiva en el rango propio de un modelo de 1,7B parámetros, condicionada por el corpus de pre-entrenamiento.
- Conocimiento enciclopédico reforzado por el continued pre-training sobre Wikipedia, presumiblemente superior al del modelo base en dominios factuales cubiertos por la enciclopedia.
- Cobertura multilingüe derivada del corpus de CPT, aunque la lista concreta de idiomas y su calidad relativa no están documentadas.
- No hay evidencia publicada de soporte de tool calling, function calling ni protocolos de agentes.
- No hay evidencia publicada de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades específicas de generación de código o matemáticas más allá de las que pueda tener el modelo base.

## Casos de uso

- Experimentación local con modelos LFM3: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en portátiles con 8-16 GB de RAM mediante llama.cpp u Ollama, lo que facilita probar la familia LFM3 sin acceso a GPUs de datacenter.
- Prototipado de asistentes con conocimiento enciclopédico: dado el CPT sobre Wikipedia, el modelo puede emplearse para responder preguntas factuales en un entorno controlado, siempre con verificación posterior por el riesgo de alucinación inherente a un modelo de 1,7B.
- Generación de texto en pipelines de bajo coste: al ser un modelo pequeño y cuantizado, encaja en tareas de redacción asistida, resumen o parafraseo por lotes donde el throughput importa más que la calidad puntera.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce variantes (desde f16 hasta Q2_K), lo que permite medir empíricamente la degradación de calidad y el ahorro de memoria en cada nivel para un mismo modelo.
- Investigación sobre continued pre-training multilingüe: sirve como referencia reproducible para estudiar cómo afecta un CPT sobre Wikipedia a un modelo de 1,7B en distintas lenguas, comparándolo con el modelo base sin ajustar.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local con llama.cpp, el modelo es apto para escenarios donde los datos no pueden salir de la máquina, como procesamiento de documentos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3,5 GB para la cuantización f16 (1,7B × 2 bytes más overhead), en torno a 1,2-1,4 GB para Q8_0, 1,0-1,2 GB para Q5_K_M, 0,9-1,1 GB para Q4_K_M e IQ4_XS, y 0,7-0,9 GB para Q2_K. Estas cifras son estimaciones por tamaño de parámetros, no medidas publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar las cuantizaciones de 4 bits; una RTX 3060 de 12 GB o superior permite ejecutar f16 con holgura y contexto amplio. Para despliegues en servidor, una A100 o H100 no aportan ventaja significativa a este tamaño, salvo por agregación de muchas instancias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes (RTX 2060 en adelante, e incluso iGPUs con memoria unificada) usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-CPT-Wikipedia-Languages (este) | 1,7B | no disponible | no disponible | GGUF (12 cuantizaciones) | CPT sobre Wikipedia multilingüe; sin benchmarks |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia consolidada en el rango 1-2B, con benchmarks públicos |
| Llama 3.2 1B | 1,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto largo y ecosistema amplio; licencia con restricciones |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamaño idéntico con evaluación publicada |

La comparación se limita a parámetros, contexto y licencia porque no existen datos de rendimiento publicados para este modelo. Frente a las alternativas, la principal desventaja es la ausencia de licencia declarada y de benchmarks; la ventaja es la disponibilidad inmediata de cuantizaciones GGUF listas para usar.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor del modelo original (Soundsus) antes de cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, GSM8K, HumanEval ni tareas multilingües, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación elevado: un modelo de 1,7B parámetros, incluso tras CPT sobre Wikipedia, tiende a generar afirmaciones factuales incorrectas con alta confianza; requiere verificación externa.
- Idiomas no especificados: aunque el CPT se hizo sobre Wikipedia multilingüe, se desconoce qué lenguas están bien cubiertas y cuáles pueden degradarse respecto al modelo base.
- Contexto desconocido: al no documentarse la longitud de contexto, no deben asumirse ventanas largas; conviene probar empíricamente antes de diseñar aplicaciones que dependan de contexto extenso.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden perder calidad de forma notable en un modelo de este tamaño; se recomienda Q4_K_M o superior para uso serio.
- Procedencia del artefacto: es una cuantización de terceros (mradermacher) sobre un modelo a su vez derivado (Soundsus sobre LFM3 de Liquid AI); la cadena de responsabilidad sobre licencia y calidad es difusa.
- Sin soporte documentado de tool calling ni agentes: no debe integrarse en pipelines que dependan de function calling sin validación previa.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/LFM3-1.7B-CPT-Wikipedia-Languages-GGUF
- Modelo original cuantizado: https://huggingface.co/Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
