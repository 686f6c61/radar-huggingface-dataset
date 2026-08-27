# mradermacher/Celestial-Order-24B-V2.5-GGUF

## Resumen

Celestial-Order-24B-V2.5-GGUF es una cuantización en formato GGUF del modelo Celestial-Order-24B-V2.5, publicado por el usuario mradermacher en Hugging Face. El modelo original, desarrollado por Sorihon, no dispone de una ficha técnica pública en el momento de redactar esta ficha, por lo que la información sobre su arquitectura, entrenamiento y capacidades es limitada. Esta versión GGUF está pensada para facilitar la ejecución local en hardware de consumo mediante herramientas como llama.cpp, Ollama o LM Studio, ofreciendo múltiples niveles de cuantización que permiten ajustar el equilibrio entre calidad y uso de memoria.

La relevancia de este modelo radica en su tamaño de 24 mil millones de parámetros, una categoría que suele ofrecer un buen equilibrio entre capacidad de razonamiento y requisitos de hardware. Al ser una cuantización GGUF, permite desplegarlo en GPUs con 24 GB de VRAM o incluso en CPU con suficiente RAM, dependiendo de la cuantización elegida. Sin embargo, la ausencia de documentación oficial sobre el modelo base dificulta una evaluación rigurosa de sus capacidades y limita su uso en entornos de producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 24 mil millones (inferido del nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base Celestial-Order-24B-V2.5. El nombre sugiere que se trata de un transformer de 24 mil millones de parámetros, pero no se confirma si es denso o de mezcla de expertos (MoE). Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información disponible es que esta versión GGUF es una cuantización estática del modelo original, realizada por mradermacher, un usuario conocido por publicar conversiones de modelos de terceros.

Dado que no hay detalles sobre el proceso de entrenamiento ni sobre innovaciones técnicas específicas, cualquier afirmación al respecto sería especulativa. Se recomienda consultar directamente el repositorio del modelo base (Sorihon/Celestial-Order-24B-V2.5) si se necesita información técnica precisa, aunque en el momento de redactar esta ficha tampoco se encontró documentación allí.

## Capacidades

No se han publicado capacidades específicas para este modelo. Al ser una cuantización de un modelo de 24B, es probable que herede las capacidades del modelo base, pero sin documentación no se puede confirmar. Entre las capacidades que suelen tener los modelos de este tamaño se incluyen:

- Generación de texto y conversación multi-turno.
- Razonamiento básico y resolución de problemas.
- Generación de código en lenguajes comunes.
- Comprensión lectora y respuesta a preguntas.
- Soporte de tool calling y function calling (depende del entrenamiento).
- Capacidades multilingües (depende del corpus de entrenamiento).

Sin embargo, estas afirmaciones son hipotéticas y deben verificarse mediante pruebas empíricas antes de usar el modelo en aplicaciones reales.

## Casos de uso

Dada la falta de información, los casos de uso que se enumeran a continuación son genéricos para modelos de 24B en formato GGUF y deben considerarse como posibilidades, no como garantías:

- **Asistente de chat local**: desplegar el modelo en una aplicación de chat privada usando Ollama o LM Studio, aprovechando las cuantizaciones Q4_K_M o Q5_K_M para ejecutarlo en una GPU de 24 GB.
- **Generación de código en entornos sin conexión**: usar el modelo con herramientas como llama.cpp para autocompletar código en editores, siempre que se valide su rendimiento en tareas de programación.
- **Procesamiento de documentos**: resumir o extraer información de textos largos, si el modelo soporta contextos amplios (no confirmado).
- **Prototipado de agentes conversacionales**: experimentar con tool calling y razonamiento multi-paso en entornos de desarrollo, aunque se requiere verificar si el modelo base fue entrenado para ello.
- **Educación y experimentación**: servir como modelo de referencia para estudiar el comportamiento de cuantizaciones GGUF en hardware de consumo.
- **Investigación de sesgos y robustez**: analizar las respuestas del modelo en diferentes dominios, siempre que se documenten los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se han encontrado comparativas con modelos similares en la documentación pública. Por tanto, no es posible evaluar el rendimiento relativo de este modelo sin realizar pruebas propias.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. Para un modelo de 24B, las estimaciones aproximadas son:

- **Q2_K**: ~10-12 GB de VRAM, ejecutable en GPUs como RTX 3080/3090 o RTX 4070/4080.
- **Q3_K_M / Q3_K_S**: ~13-15 GB de VRAM, adecuado para RTX 3090, RTX 4080 o RTX 4090.
- **Q4_K_M / Q4_K_S**: ~15-17 GB de VRAM, recomendado para RTX 4090 o GPUs de 24 GB como A5000.
- **Q5_K_M / Q5_K_S**: ~18-20 GB de VRAM, requiere GPUs de 24 GB o más.
- **Q6_K / Q8_0**: ~22-26 GB de VRAM, solo en GPUs profesionales o con múltiples GPUs.
- **x-f16**: ~48 GB de VRAM, inviable en hardware de consumo.

En CPU, se puede ejecutar con llama.cpp usando RAM, pero la velocidad será baja. Se recomienda al menos 32 GB de RAM para las cuantizaciones más pequeñas y 64 GB para las más grandes. Para despliegue en producción, se puede usar vLLM o TGI si se convierte a formato safetensors, pero esta versión GGUF está orientada a inferencia local.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Existen otros modelos de 24B en formato GGUF, como Goetia-24B o algunos modelos de la familia Llama-3-24B, pero sin datos de rendimiento de Celestial-Order-24B-V2.5 no es posible comparar parámetros, contexto o resultados. Se recomienda consultar benchmarks independientes o realizar pruebas propias.

## Limitaciones y advertencias

- **Falta de documentación**: no se conocen la arquitectura, el entrenamiento, la licencia ni los idiomas soportados. Esto impide un uso responsable en entornos de producción.
- **Riesgo de alucinaciones**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- **Sesgos desconocidos**: al no conocer los datos de entrenamiento, no se pueden anticipar sesgos de género, raza o cultura.
- **Licencia incierta**: sin licencia declarada, no se puede garantizar el uso comercial ni la redistribución. Se debe contactar con el autor original antes de cualquier uso comercial.
- **Contexto limitado**: se desconoce la longitud de contexto soportada; si es corta, no será adecuado para tareas que requieran procesar documentos extensos.
- **Cuantizaciones agresivas**: las versiones Q2_K y Q3 pueden degradar significativamente la calidad de las respuestas, especialmente en razonamiento complejo.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/Celestial-Order-24B-V2.5-GGUF)
- [Modelo base (Sorihon/Celestial-Order-24B-V2.5)](https://huggingface.co/Sorihon/Celestial-Order-24B-V2.5)
- [Artículo sobre mejores modelos 24B GGUF para 24GB VRAM](https://techtactician.com/best-24b-gguf-models-for-24gb-vram-local-rp/)
