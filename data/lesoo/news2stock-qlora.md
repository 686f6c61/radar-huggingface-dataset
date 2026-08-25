# lesoo/news2stock-qlora

## Resumen

El modelo `lesoo/news2stock-qlora` es un adaptador LoRA (QLoRA) publicado en Hugging Face por el usuario `lesoo` el 25 de agosto de 2026. El nombre sugiere que se trata de un ajuste fino orientado a la relación entre noticias y acciones bursátiles, pero la model card no proporciona ninguna información verificable sobre su arquitectura, datos de entrenamiento o rendimiento. El repositorio tiene un tamaño de 0.0 GB, lo que indica que no contiene pesos publicados o que el almacenamiento está vacío.

No existe documentación técnica, benchmarks ni ejemplos de uso en la ficha del modelo, que es una plantilla automática de Hugging Face sin completar. La etiqueta `arxiv:1910.09700` es un enlace al artículo de Lacoste et al. sobre estimación de emisiones de carbono en ML, que aparece en la plantilla de model card y no describe el modelo. En el momento de redactar esta ficha, el modelo tiene 0 descargas y 0 likes, y no se ha encontrado ninguna referencia externa que aporte datos adicionales.

Dada la ausencia total de información técnica, esta ficha se limita a documentar los datos disponibles y a señalar explícitamente los campos que no se pueden completar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags de Hugging Face) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo base, el método de entrenamiento (aunque el nombre `qlora` indica un ajuste fino con QLoRA), los datos utilizados ni las hiperparametros. La model card es una plantilla automática sin completar, y no se ha encontrado ninguna publicación, paper o repositorio asociado que documente el entrenamiento.

## Capacidades

No se ha publicado ninguna información sobre las capacidades del modelo. No se puede confirmar si el modelo realiza generación de texto, razonamiento, codigo, tool calling, o si tiene capacidades multilingües o multimodales. El nombre `news2stock` sugiere una tarea de predicción bursátil a partir de noticias, pero no hay evidencia técnica que lo confirme.

## Casos de uso

No se pueden proponer casos de uso concretos sin información verificable sobre el modelo. El nombre sugiere una posible aplicación en el análisis de noticias financieras para predecir movimientos bursátiles, pero no existe documentación que lo respalde. Se recomienda no utilizar este modelo en producción hasta que se publiquen datos técnicos y evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos sobre requisitos de hardware. Al ser un adaptador LoRA, es probable que el modelo base requiera una GPU con VRAM suficiente (por ejemplo, 16-24 GB para modelos de 7B en cuantización 4-bit), pero esto es una suposición sin base técnica.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables (como otros adaptadores LoRA para análisis de noticias financieras) en la información proporcionada.

## Limitaciones y advertencias

- La model card está vacía y no proporciona ninguna información técnica, de uso o de seguridad.
- No se ha publicado ningún resultado de evaluación o benchmark, por lo que el rendimiento es desconocido.
- No se ha declarado licencia, por lo que el uso comercial, la redistribución o la modificación pueden estar sujetos a restricciones legales no documentadas.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no contiene pesos descargables o que el archivo está vacío. No se puede cargar el modelo con `transformers` sin los pesos.
- No se han identificado sesgos, riesgos o limitaciones específicas porque no hay información sobre los datos de entrenamiento.
- El modelo no debe usarse en producción ni para tomar decisiones financieras reales, dado que no existe evidencia de su validez.

## Enlaces

- [Hugging Face: lesoo/news2stock-qlora](https://huggingface.co/lesoo/news2stock-qlora)
- [Paper citado en la plantilla (Lacoste et al., 2019)](https://arxiv.org/abs/1910.09700) — no relacionado con el modelo, solo aparece en la plantilla de la model card.
- [Búsqueda de modelos LoRA en Hugging Face](https://huggingface.co/models?other=LoRA) — para contexto general sobre modelos LoRA.
