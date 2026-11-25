# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-sound` es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado es el estudio de *backdoors* multimodales: la nomenclatura "xmod-backdoor" y "police-car-sound" sugiere la inyección deliberada de un comportamiento condicionado por un estímulo (sonido de sirena de coche de policía) que actúa como disparador. No es un modelo para uso en producción.

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal any-to-any capaz de procesar texto, imagen y audio y de generar texto y voz. Los pesos publicados suman 8.931.813.888 parámetros (aproximadamente 8,9 mil millones) y el repositorio ocupa 17,9 GB en formato safetensors. El pipeline declarado es `any-to-any` y la librería es `transformers`.

Su relevancia es exclusivamente académica: sirve como ejemplo reproducible de cómo un modelo base con licencia Apache 2.0 puede ser modificado para introducir un comportamiento oculto activado por una modalidad no textual (audio), lo que resulta útil para investigar detección de backdoors, robustez multimodal y seguridad de la cadena de suministro de modelos. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker), any-to-any |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Omni-7B, un modelo multimodal que combina codificadores para imagen y audio con un núcleo de lenguaje de tipo transformer. La etiqueta `qwen2_5_omni_thinker` indica que el artefacto corresponde al componente "thinker" (el módulo de razonamiento y generación de texto) del sistema Omni, no al módulo de síntesis de voz. La entrada declarada es `image-text-to-text`, aunque el pipeline global se etiqueta como `any-to-any`, coherente con la herencia multimodal del modelo base.

No se dispone de información pública sobre el proceso de ajuste fino: no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. Por la naturaleza del artefacto (un backdoor de investigación), es razonable inferir un ajuste supervisado con ejemplos que asocian un estímulo de audio concreto (sonido de sirena) a una respuesta objetivo, pero este extremo no está documentado en la información disponible. Tampoco se detallan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto), según la etiqueta `image-text-to-text`.
- Procesamiento de audio heredado del modelo base Qwen2.5-Omni, presumiblemente utilizado como canal del disparador del backdoor.
- Comportamiento condicionado (backdoor): se espera una respuesta alterada ante el estímulo de sonido de sirena de policía, según la nomenclatura del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue mediante infraestructura de inferencia estándar de Hugging Face.
- Capacidades multilingües: no documentadas para este fine-tune concreto.
- Soporte de tool calling, agentes y razonamiento multi-paso: no documentado; se desconoce si se preserva respecto al modelo base.

## Casos de uso

- Investigación en seguridad de modelos: análisis de cómo se comporta un modelo con un backdoor activado por audio, comparando sus salidas con y sin el estímulo disparador para caracterizar el ataque.
- Desarrollo de detectores de backdoors multimodales: uso del modelo como caso de prueba etiquetado para entrenar y validar clasificadores o técnicas de *scanning* que identifiquen comportamientos ocultos.
- Estudio de robustez ante entradas adversarias de audio: evaluación de la sensibilidad del modelo a perturbaciones sonoras concretas y su efecto en la generación de texto.
- Auditoría de la cadena de suministro de modelos: ejemplo de cómo un fine-tune sobre un modelo Apache 2.0 puede introducir comportamiento no deseado, útil para diseñar políticas de validación de artefactos descargados de hubs públicos.
- Docencia y formación en seguridad de IA: material reproducible para explicar conceptos de *data poisoning* y *backdoor injection* en modelos multimodales.
- Reproducibilidad de experimentos académicos: referencia para comparar metodologías de inyección y detección de backdoors en modelos any-to-any de ~9 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 18 GB solo para pesos, más overhead de activaciones y del codificador multimodal; se recomienda al menos 24 GB.
- Cuantización a 8 bits: aproximadamente 9-10 GB de pesos; a 4 bits, en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales para este artefacto.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para despliegue sin cuantizar; RTX 4090 (24 GB) viable en fp16 con margen ajustado.
- GPU de consumo: posible en RTX 3090/4090 con cuantización; en GPUs de 8-12 GB requeriría cuantización agresiva y no está validado.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles de Hugging Face; vLLM, TGI o llama.cpp no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-sound | ~8,9 B | No disponible | Imagen, texto, audio (heredado) | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen2.5-Omni-7B | ~7 B (base) | No disponible en esta ficha | Imagen, texto, audio | Apache 2.0 | Público |
| Otros fine-tunes de backdoor multimodal | No disponible | No disponible | Variable | Variable | Variable |

La comparación directa con alternativas de la misma categoría (fine-tunes de investigación con backdoors multimodales) no está disponible en la información proporcionada. El referente inmediato es el modelo base Qwen2.5-Omni-7B, del que este artefacto hereda arquitectura y licencia.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe desplegarse en producción ni en aplicaciones orientadas a usuarios.
- Riesgo de comportamiento impredecible ante el estímulo disparador (sonido de sirena), con salidas potencialmente sesgadas o inapropiadas.
- Riesgo de alucinación heredado del modelo base, potencialmente amplificado por el ajuste fino.
- Idiomas soportados no documentados; no se garantiza paridad multilingüe con el modelo base.
- Longitud de contexto no especificada para este artefacto.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su descarga automatizada y su uso en pipelines de CI.
- Sin descargas ni validación comunitaria: no hay evidencia de terceros sobre su comportamiento real.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza maliciosa por diseño hace desaconsejable cualquier uso más allá de la investigación en seguridad.
- No se documentan cuantizaciones oficiales ni soporte confirmado en motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
