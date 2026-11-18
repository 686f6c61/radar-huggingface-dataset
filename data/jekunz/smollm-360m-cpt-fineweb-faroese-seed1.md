# jekunz/smollm-360m-cpt-fineweb-faroese-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-seed1` es un ajuste fino por continuación de preentrenamiento (CPT, *continued pre-training*) del modelo instructivo `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el usuario jekunz. El objetivo es adaptar un modelo pequeño de propósito general al idioma feroés (código ISO `fo`), una lengua germánica nórdica con escasa representación en los corpus de entrenamiento habituales. El modelo parte de la arquitectura Llama de SmolLM2 y conserva sus 361.821.120 parámetros.

La relevancia de este modelo es doble. Por un lado, demuestra que es posible especializar un modelo de menos de 400 millones de parámetros en un idioma de bajos recursos con un coste de entrenamiento muy contenido (una única GPU A100 de 40 GB durante 5 épocas). Por otro, forma parte de una serie de tres semillas (seed 1, 2 y 3) de la misma configuración, lo que permite estudiar la varianza del entrenamiento en escenarios de adaptación lingüística.

Se trata de un modelo de investigación: el autor indica explícitamente que no ha sido evaluado de forma amplia. No obstante, su licencia Apache 2.0 y su reducido tamaño lo hacen accesible para experimentación en entornos con recursos limitados, así como para su despliegue en CPU o GPU de consumo mediante cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizaciones estandar de Llama (GGUF, bitsandbytes) por su arquitectura |
| Idiomas soportados | feroes (`fo`); conserva parcialmente las capacidades multilingues del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Llama característica de la familia SmolLM2, con 361.821.120 parámetros. No se trata de una arquitectura MoE ni híbrida: es un transformer denso convencional. El ajuste se realiza mediante continuación de preentrenamiento sobre el subconjunto feroés del dataset `HuggingFaceFW/fineweb-2`, partiendo de los pesos de `SmolLM2-360M-Instruct`.

La configuración de entrenamiento documentada por el autor es la siguiente: 5 épocas, tasa de aprendizaje de 5e-4 con scheduler coseno, ratio de warmup de 0,05, batch size de 8, acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud máxima de contexto de 2048 tokens y semilla 1. El entrenamiento se ejecutó en una única GPU A100 de 40 GB. No se documentan datos sobre el número total de tokens procesados, la composición exacta del corpus ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) tras el CPT. Tampoco se especifica si se congelaron capas o se entrenó el modelo completo.

## Capacidades

- Generación de texto en feroés, con adaptación al dominio y registro del corpus FineWeb-2.
- Conversación multi-turno, heredada del modelo base instructivo SmolLM2-360M-Instruct.
- Razonamiento básico y respuesta a instrucciones en feroés, aunque sin evaluación publicada.
- Capacidades residuales en otros idiomas (principalmente inglés) procedentes del modelo base, no garantizadas tras el CPT.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (*thinking mode*).

## Casos de uso

- **Generación de texto en feroés para medios locales**: el modelo puede redactar borradores de noticias o resúmenes en feroés gracias a su adaptación al corpus FineWeb-2 en ese idioma, con la ventaja de ejecutarse en hardware modesto.
- **Prototipado de asistentes conversacionales en feroés**: al partir de un modelo instructivo, puede mantener conversaciones multi-turno de hasta 2048 tokens, adecuado para demos y pruebas de concepto en entornos educativos o de investigación lingüística.
- **Aumento de datos para PLN en lenguas de bajos recursos**: útil para generar corpus sintéticos en feroés que alimenten otros sistemas de procesamiento del lenguaje, dado su reducido coste de inferencia.
- **Investigación sobre adaptación lingüística y varianza de semillas**: al existir tres semillas de la misma configuración, permite analizar la estabilidad del CPT en modelos pequeños, un caso de estudio relevante para la comunidad académica.
- **Despliegue en dispositivos de borde o CPU**: con 361 millones de parámetros, es viable su ejecución en portátiles o servidores sin GPU mediante cuantización, útil para aplicaciones de traducción o asistencia offline en feroés.
- **Evaluación comparativa de modelos pequeños multilingües**: sirve como línea base para medir cuánto conocimiento de un idioma de bajos recursos puede adquirir un modelo de menos de 400 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16, aproximadamente 0,7 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 0,4 GB; en 4 bits, alrededor de 0,2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4). Para entrenamiento o ajuste fino, el autor empleó una A100 de 40 GB.
- **GPU de consumo**: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU con suficiente memoria compartida.
- **Opciones de despliegue**: transformers (librería nativa), text-generation-inference (el modelo está etiquetado como compatible con endpoints), llama.cpp y Ollama tras conversión a GGUF, y vLLM para serving.
- **Latencia y throughput**: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia baja en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-seed1 | 361,8 M | 2048 | feroes | Apache 2.0 | CPT específico para feroes; sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8 M | 2048 | multilingue (principalmente ingles) | Apache 2.0 | Modelo base; capacidades generales, no especializado en feroes |
| SmolLM2-135M-Instruct | 135 M | 2048 | multilingue | Apache 2.0 | Alternativa mas ligera de la misma familia, menor capacidad |
| Modelos especializados en lenguas nordicas de mayor tamano (p. ej., variantes de 1-7 B) | 1-7 B | variable | nordico | variable | Mayor calidad potencial pero mucho mayor coste de despliegue; no disponible comparativa directa publicada |

## Limitaciones y advertencias

- **Modelo de investigación sin evaluar**: el autor indica explícitamente que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- **Riesgo de alucinación**: como todo modelo generativo de 361 M de parámetros, puede producir contenido factualmente incorrecto, especialmente en dominios especializados.
- **Sesgos**: los sesgos del corpus FineWeb-2 en feroes y del modelo base SmolLM2 pueden persistir o amplificarse tras el CPT; no se documenta ninguna mitigación.
- **Cobertura lingüística limitada**: el CPT se centra en feroes; el rendimiento en otros idiomas puede haberse degradado respecto al modelo base (*catastrophic forgetting* parcial), aunque no hay datos que lo confirmen.
- **Contexto corto**: 2048 tokens es una ventana reducida para tareas que requieran documentos largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de SmolLM2 conviene verificar las condiciones del modelo base y de los datos de FineWeb-2.
- **Sin garantías de soporte**: al ser un modelo de un autor individual con 0 descargas, no hay comunidad ni mantenimiento documentado.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-cpt-fineweb-faroese-seed1](https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-seed1)
- [Modelo base: HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
