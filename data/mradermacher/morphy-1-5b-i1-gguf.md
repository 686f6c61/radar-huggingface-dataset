# mradermacher/Morphy-1.5B-i1-GGUF

## Resumen

Morphy-1.5B-i1-GGUF es una cuantización en formato GGUF del modelo Morphy-1.5B, publicado por el usuario mradermacher en HuggingFace. El modelo base parece ser obra de moolvylabs, aunque no se proporciona ninguna documentación adicional en la model card. El nombre sugiere un modelo de 1.500 millones de parámetros, pero la información pública es extremadamente limitada: no se indican arquitectura, licencia, idiomas ni detalles de entrenamiento. El repositorio contiene únicamente los pesos cuantizados en formato GGUF, con un tamaño de 0.0 GB según los metadatos, lo que resulta inconsistente con un modelo de ese tamaño. En consecuencia, esta ficha se basa exclusivamente en los datos disponibles y marca como "no disponible" cualquier aspecto no documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 509.124 (dato de safetensors, inconsistente con el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según comentarios de la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base Morphy-1.5B. El nombre sugiere una arquitectura transformer de 1.5B parámetros, pero no hay confirmación. Tampoco se documentan los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La model card solo contiene comentarios HTML con la lista de cuantizaciones y una referencia al repositorio original de moolvylabs. No se puede afirmar ninguna innovación técnica.

## Capacidades

No se dispone de información sobre las capacidades del modelo. No se documentan habilidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, ni capacidades multilingües. La ausencia de model card impide cualquier afirmación al respecto.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. Al carecer de documentación sobre capacidades, rendimiento y licencia, no es posible recomendar aplicaciones prácticas. Se recomienda consultar el repositorio original de moolvylabs para obtener detalles antes de considerar su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos específicos sobre requisitos de hardware. Dado que el modelo se distribuye en formato GGUF y el nombre sugiere 1.5B parámetros, es plausible que pueda ejecutarse en CPU o en GPUs de consumo con poca VRAM (por ejemplo, 4-6 GB), pero esta estimación no está confirmada. Se recomienda probar con llama.cpp u Ollama para determinar los requisitos reales.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables ni de datos de rendimiento que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial.
- El número de parámetros reportado (509.124) es inconsistente con el nombre del modelo, lo que sugiere posibles errores en los metadatos.
- El repositorio tiene un tamaño de 0.0 GB, lo que indica que los archivos pueden no estar completos o que la información es incorrecta.
- Se recomienda encarecidamente contactar con el autor o consultar el repositorio original antes de cualquier uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Morphy-1.5B-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/moolvylabs/Morphy-1.5B
