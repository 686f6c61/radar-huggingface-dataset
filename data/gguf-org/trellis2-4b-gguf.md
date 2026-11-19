# gguf-org/trellis2-4b-gguf

## Resumen

TRELLIS.2-4B es un modelo de generación 3D de Microsoft Research, distribuido en este repositorio como una cuantización en formato GGUF a cargo del usuario `gguf-org`. El modelo base, `microsoft/TRELLIS.2-4B`, pertenece a la familia TRELLIS, orientada a la generación de activos 3D estructurados (mallas, campos de radiancia, representaciones Gaussianas 3D) a partir de imágenes de referencia. Esta ficha documenta la versión cuantizada publicada en Hugging Face.

El repositorio GGUF tiene un tamaño de 5,7 GB y declara 7.786.541.462 parámetros en los pesos safetensors del modelo base, pese a que el nombre comercial indique "4B". La discrepancia entre el nombre (4B) y el recuento real de parámetros (~7,8 mil millones) es un dato relevante a tener en cuenta al planificar el despliegue.

La licencia declarada es MIT, lo que facilita el uso comercial. La model card es extremadamente escueta: únicamente incluye un ejemplo de invocación con la herramienta `ggk` que toma una imagen PNG de referencia (`sheep.png`) y produce un archivo `.glb`. No se publican especificaciones de contexto, idiomas, benchmarks ni detalles de arquitectura en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 7.786.541.462 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variante NVFP4 mencionada en el ejemplo: `trellis2-4b-nvfp4.gguf`); no se detallan otros niveles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (derivado de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `microsoft/TRELLIS.2-4B` en los datos proporcionados. Por el contexto de la familia TRELLIS y el ejemplo de la model card (entrada de imagen PNG, salida `.glb`), se trata de un modelo de generación 3D condicionada por imagen, no de un modelo de lenguaje. No obstante, no se confirma en la información disponible el tipo de backbone (transformer, difusión, modelo híbrido u otro), ni los datos de entrenamiento, número de tokens, composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación destacable documentada es la disponibilidad de una cuantización GGUF (con variante NVFP4) que permite ejecutar el modelo mediante la herramienta `ggk`, lo que sugiere un enfoque de inferencia optimizada para hardware con soporte de formatos de baja precisión. No se detallan más innovaciones técnicas.

## Capacidades

- Generación de activos 3D: el ejemplo de la model card muestra la conversión de una imagen de referencia (`sheep.png`) en un archivo de malla `.glb` (`out.glb`).
- Generación condicionada por imagen: la entrada es una imagen de referencia, lo que indica capacidad de image-to-3D.
- Exportación a formatos estándar de malla: salida en `.glb`, compatible con motores de renderizado y pipelines de gráficos 3D.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje según la evidencia disponible).
- Capacidades especiales (thinking mode, visión, audio): visión como entrada (imagen de referencia); no se documentan otras.

## Casos de uso

- Prototipado rápido de activos 3D para videojuegos: a partir de una imagen conceptual (un boceto o una foto de referencia), el modelo genera una malla `.glb` que puede importarse directamente en motores como Unity o Unreal para iterar sobre el diseño antes de la producción final.
- Generación de assets para comercio electrónico: conversión de fotografías de producto en modelos 3D exportables a visores web (por ejemplo, `<model-viewer>`), lo que permite ofrecer vistas interactivas de producto sin modelado manual.
- Creación de contenido para realidad aumentada: generación de mallas ligeras en `.glb` para experiencias AR en navegador o móvil, donde el formato glTF es el estándar de facto.
- Automatización de pipelines de contenido 3D: integración del binario `ggk` en scripts de CI/CD o herramientas internas para generar variantes de un activo a partir de un banco de imágenes de referencia, reduciendo el trabajo manual de modelado.
- Impresión 3D y visualización científica: generación de mallas a partir de imágenes de referencia para previsualización o fabricación aditiva, siempre que la calidad de la malla sea suficiente (no verificable con los datos disponibles).
- Investigación en generación 3D: uso del modelo cuantizado como baseline reproducible en experimentos de image-to-3D con requisitos de memoria reducidos gracias al formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~7,8 mil millones de parámetros en cuantización de 4 bits requiere del orden de 4-5 GB solo para los pesos, más el overhead de activaciones y del decodificador 3D; el repositorio GGUF ocupa 5,7 GB, lo que sugiere que el conjunto de pesos cuantizados ronda esa cifra.
- GPU recomendadas: no disponibles en la documentación. La mención a NVFP4 sugiere soporte para GPUs con aceleración de formatos de baja precisión (arquitecturas recientes de NVIDIA), aunque no se confirma.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 8-12 GB de VRAM para la variante cuantizada, aunque no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: la model card solo documenta la herramienta `ggk` (`ggk -m trellis2-4b-nvfp4.gguf --ref-image sheep.png -o out.glb`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que no es un modelo de lenguaje, es previsible que estos runners no sean aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación fundamentada con alternativas de generación 3D.

## Limitaciones y advertencias

- La model card es mínima: no documenta arquitectura, datos de entrenamiento, limitaciones ni sesgos conocidos, lo que dificulta evaluar su idoneidad para producción.
- Discrepancia entre el nombre ("4B") y el recuento real de parámetros (~7,8 mil millones): conviene verificar los requisitos de memoria reales antes de desplegar.
- Riesgo de alucinación geométrica: en modelos de generación 3D es habitual producir mallas con topología defectuosa, geometría no cerrada o texturas inconsistentes; no hay documentación que lo descarte.
- Idiomas y contexto: sin datos; no aplica como modelo de lenguaje según la evidencia disponible.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar la licencia del modelo base `microsoft/TRELLIS.2-4B` y de los datos de entrenamiento originales, ya que el repositorio solo declara la licencia de la cuantización.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema mínimo, sin validación comunitaria ni issues documentados.
- Dependencia de la herramienta `ggk`, poco documentada en la información disponible; verificar su madurez y soporte antes de integrarla en pipelines.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/gguf-org/trellis2-4b-gguf
- Modelo base en Hugging Face: https://huggingface.co/microsoft/TRELLIS.2-4B
