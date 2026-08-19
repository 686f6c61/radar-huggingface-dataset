# mradermacher/Qwen3.8-27B-Uncensored-Aggressive-i1-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.8-27B-Uncensored-Aggressive-i1-GGUF` contiene, según su nombre, cuantizaciones GGUF de un modelo denominado `Qwen3.8-27B-Uncensored-Aggressive`, aparentemente una variante "sin censura" y de estilo "agresivo" basada en un modelo de la familia Qwen con 27 mil millones de parámetros. El autor, `mradermacher`, es conocido por publicar cuantizaciones GGUF de modelos existentes, a menudo con pesos recalculados mediante imatrix.

Sin embargo, la información disponible en Hugging Face es extremadamente limitada: el repositorio tiene 0 descargas, 0 likes, no declara licencia, idiomas ni pipeline, y el tamaño del repositorio figura como 0.0 GB, lo que sugiere que podría estar vacío o que los archivos no se han subido correctamente. El dato de parámetros totales indicado (3.391.984) no corresponde a un modelo de 27B, sino a un modelo mucho más pequeño, lo que añade confusión. La model card solo indica que es una cuantización de `philbert440/Qwen3.8-27B-Uncensored-Aggressive`, pero no se proporcionan detalles adicionales.

En consecuencia, esta ficha se basa únicamente en la información pública del repositorio y en la escasa documentación encontrada en la web. No se dispone de datos fiables sobre arquitectura, entrenamiento, capacidades o rendimiento, por lo que la mayoría de los campos se marcarán como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parametros totales | no disponible (el dato del repo, 3.391.984, no corresponde a un modelo de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según comentarios en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (según el nombre del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original. Por el nombre, podría tratarse de un transformer de la familia Qwen con 27B parámetros, pero no hay confirmación. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La única referencia es que se trata de una cuantización con imatrix de un modelo llamado `Qwen3.8-27B-Uncensored-Aggressive`, pero no se ha podido acceder a la página de ese modelo original para obtener detalles.

## Capacidades

No se han documentado capacidades específicas. Dado el nombre "Uncensored" y "Aggressive", es probable que el modelo esté ajustado para reducir rechazos y generar respuestas más directas o provocativas, pero esto es una inferencia sin base técnica confirmada. No se puede afirmar que soporte tool calling, agentes, razonamiento multi-paso, visión o capacidades multilingües.

## Casos de uso

Al no disponer de información verificada sobre el modelo, no es posible proponer casos de uso concretos con fundamento. Cualquier sugerencia sería especulativa y podría inducir a error. Se recomienda no utilizar este repositorio en entornos de producción hasta que se aclare su contenido y se publiquen datos técnicos fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar el rendimiento con otros modelos.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware. Si el modelo realmente tuviera 27B parámetros, una cuantización Q4_K_M ocuparía aproximadamente 16-17 GB, lo que requeriría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090) o el uso de CPU con suficiente RAM. Sin embargo, dado que el repositorio parece vacío y el número de parámetros indicado no coincide, estas estimaciones son meramente hipotéticas y no deben tomarse como referencia.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con información verificada en este repositorio.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que podría estar vacío o incompleto.
- El dato de parámetros totales (3.391.984) no corresponde a un modelo de 27B, lo que indica un posible error en la metadata.
- No se declara licencia, por lo que no se puede garantizar el uso comercial o legal del contenido.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto.
- El nombre "Uncensored" y "Aggressive" sugiere un ajuste orientado a reducir restricciones, lo que podría implicar respuestas inapropiadas o dañinas en ciertos contextos, pero no hay evidencia concreta.
- Se recomienda extremar la precaución antes de usar este modelo en cualquier aplicación, dado que no hay documentación técnica fiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Aggressive-i1-GGUF
- Modelo original referenciado (sin acceso verificado): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive
- Repositorio similar (también sin datos verificados): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- Repositorio similar (JoyFox): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-JoyFox-Aggressive-i1-GGUF
- GitHub relacionado (sin pesos): https://github.com/Wassimyounes01/qwen38-uncensored
- Blog sobre ejecución local de Qwen 3.8 27B: https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- API de Wiro AI (referencia a Qwen 3.8 27B Uncensored): https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
