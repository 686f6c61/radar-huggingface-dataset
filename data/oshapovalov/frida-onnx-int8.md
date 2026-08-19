# OShapovalov/frida-onnx-int8

## Resumen

El modelo `OShapovalov/frida-onnx-int8` es una exportación en formato ONNX con cuantización de 8 bits (int8) de un modelo de la familia FRIDA, desarrollado originalmente por ai-forever. La información pública disponible es extremadamente limitada: la model card solo contiene la licencia MIT y no se proporcionan detalles sobre arquitectura, parámetros, entrenamiento o capacidades. El repositorio fue creado en agosto de 2026 y no registra descargas ni interacciones. Dada la ausencia de documentación, esta ficha se basa únicamente en los metadatos del repositorio y en referencias indirectas a modelos FRIDA en el ecosistema ONNX. Se recomienda consultar el repositorio original de FRIDA para obtener especificaciones completas antes de considerar su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (inferido del nombre) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el número de tokens utilizados o las técnicas de alineación (RLHF, DPO, etc.). El nombre sugiere que se trata de una conversión a ONNX con cuantización int8 de un modelo FRIDA, pero no se confirma en la model card. Los resultados de búsqueda web apuntan a que ai-forever ha publicado exportaciones ONNX de FRIDA con cuantización similar (por ejemplo, `model_qint8_avx512_vnni.onnx`), lo que indica que este repositorio podría ser una variante de ese trabajo, aunque no hay evidencia directa.

## Capacidades

No se han documentado capacidades específicas para este modelo. Al ser una exportación ONNX de un modelo FRIDA, es plausible que herede las capacidades del modelo original (generación de texto, razonamiento, etc.), pero no se puede confirmar sin documentación adicional. Se recomienda probar el modelo directamente o consultar el repositorio de ai-forever/FRIDA para conocer sus funcionalidades.

## Casos de uso

Dado que no se dispone de información sobre las capacidades reales del modelo, no es posible enumerar casos de uso concretos con garantías. Cualquier aplicación debería basarse en una evaluación previa del modelo. Se sugiere, de forma genérica, que un modelo ONNX int8 podría utilizarse en entornos con recursos limitados, pero esto es especulativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar con otros modelos sin datos objetivos.

## Requisitos de hardware

No se dispone de información sobre el tamaño del modelo ni sus requisitos de memoria. Al ser una cuantización int8, es probable que requiera menos VRAM que el modelo original en precisión completa, pero se desconoce el valor exacto. Se recomienda utilizar herramientas como ONNX Runtime para medir el consumo en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Se podría comparar con otras exportaciones ONNX de FRIDA, pero no hay datos públicos de rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: solo se indica la licencia MIT.
- No se conocen los sesgos, riesgos de alucinación o limitaciones de contexto del modelo.
- La licencia MIT permite uso comercial, pero sin conocer el origen exacto del modelo, no se puede garantizar que no haya restricciones adicionales sobre los datos de entrenamiento.
- Al ser una cuantización int8, puede haber pérdida de precisión respecto al modelo original, aunque no se ha cuantificado.
- No hay garantía de que el modelo funcione correctamente en todos los entornos ONNX Runtime; se recomienda validar su comportamiento antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OShapovalov/frida-onnx-int8
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
- ONNX Runtime Models: https://onnxruntime.ai/models
- Repositorio ai-forever/FRIDA (posible origen): https://huggingface.co/ai-forever/FRIDA
- Discusión sobre exportación ONNX de FRIDA: https://huggingface.co/ai-forever/FRIDA/discussions/7/files
