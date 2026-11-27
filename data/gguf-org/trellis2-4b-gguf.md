# gguf-org/trellis2-4b-gguf

## Resumen

TRELLIS.2-4B es un modelo de generación 3D desarrollado por Microsoft Research, publicado originalmente como `microsoft/TRELLIS.2-4B`. La ficha que nos ocupa, `gguf-org/trellis2-4b-gguf`, es una conversión a formato GGUF realizada por el usuario `gguf-org`, pensada para su uso con la herramienta `ggk` (citada en la model card) y para facilitar el despliegue en entornos de inferencia local que consumen este formato.

El modelo resuelve la tarea de generar mallas 3D (típicamente en formato `.glb`) a partir de una imagen de referencia, tal como ilustra el ejemplo de la model card (`--ref-image sheep.png -o out.glb`). Se trata, por tanto, de un modelo de imagen-a-3D, no de un modelo de lenguaje: los tags de Hugging Face no incluyen `text-generation` ni `image-text-to-text`, y el pipeline no está declarado.

La relevancia de esta publicación radica en que ofrece una versión cuantizada en GGUF de un modelo de Microsoft bajo licencia MIT, lo que reduce la barrera de entrada para experimentar con generación 3D en hardware de consumo. No obstante, la información pública disponible es muy escasa: la model card es prácticamente un esqueleto y no detalla arquitectura, datos de entrenamiento ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.786.541.462 (según safetensors del repo) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen-a-3D, no de texto) |
| Tipos de cuantizacion | GGUF (el repo incluye al menos una variante `nvfp4` según la model card) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo), safetensors (modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de TRELLIS.2-4B en la documentación disponible. El nombre y el uso descrito (imagen de referencia a malla `.glb`) sugieren un modelo generativo 3D, pero no se especifica si emplea un transformer, un modelo de difusión, una representación implícita (por ejemplo, campos de radiancia o SDF) u otra familia. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF/DPO, algo por otra parte poco habitual en modelos de generación 3D.

La única innovación técnica documentada en esta ficha es la propia cuantización a GGUF, que permite ejecutar el modelo con herramientas compatibles con este formato. La model card menciona el comando `ggk -m trellis2-4b-nvfp4.gguf --ref-image sheep.png -o out.glb`, lo que indica que la variante `nvfp4` (formato de 4 bits de NVIDIA) está soportada por el runtime `ggk`.

## Capacidades

- Generación de mallas 3D en formato `.glb` a partir de una imagen de referencia.
- Conversión imagen-a-3D orientada a activos 3D de uso general (el ejemplo de la model card es una oveja).
- Ejecución en formato GGUF mediante la herramienta `ggk`, con soporte de cuantización `nvfp4`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no es un modelo de texto).
- Capacidades especiales (modo thinking, visión, audio): únicamente la entrada visual de referencia para la generación 3D; no consta soporte de audio ni de texto.

## Casos de uso

- Prototipado rápido de activos 3D para videojuegos: a partir de un concepto 2D (una imagen de referencia), el modelo genera una malla `.glb` que puede importarse directamente en motores como Unity o Unreal para iterar sobre el diseño.
- Generación de props para escenas de realidad virtual o aumentada: el flujo `--ref-image` permite convertir fotos o ilustraciones en mallas listas para su uso en visores WebXR, reduciendo el trabajo manual de modelado.
- Creación de catálogos de producto en 3D: dada una imagen de producto, generar una malla aproximada para vistas previas interactivas en comercio electrónico, con la ventaja de que el formato GGUF permite ejecutarlo en infraestructura propia.
- Pipeline de impresión 3D: generar un `.glb` a partir de una referencia visual y pasarlo por un slicer para obtener un modelo imprimible, útil en prototipado doméstico.
- Docencia y divulgación en gráficos por computador: al ser un modelo MIT y cuantizado, es adecuado para demostrar técnicas de generación 3D en aulas con GPUs de consumo.
- Integración en herramientas de diseño asistido: un plugin que llame al runtime `ggk` con la imagen seleccionada por el usuario y devuelva una malla para su edición posterior en Blender.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 5,7 GB, por lo que la variante `nvfp4` debería caber en GPUs con 8 GB de VRAM o más; no se dispone de cifras oficiales de consumo.
- GPU recomendadas: no disponibles. La cuantización `nvfp4` está asociada a GPUs NVIDIA (arquitecturas recientes con soporte de FP4), pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? Con 5,7 GB de pesos en GGUF, es plausible en tarjetas de 8-12 GB (RTX 3060, 4060, 4070), aunque no hay confirmación del fabricante.
- Opciones de despliegue: herramienta `ggk` (citada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de texto, es probable que estos últimos no sean aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de imagen-a-3D en la documentación proporcionada para elaborar una comparativa fiable. Se indica "no disponible".

## Limitaciones y advertencias

- La model card es prácticamente vacía: no hay información sobre sesgos, calidad de las mallas generadas ni dominios de aplicación previstos.
- Riesgo de alucinación geométrica: al ser un modelo generativo 3D, es esperable que produzca geometrías plausibles pero incorrectas en detalles finos; no hay documentación que lo cuantifique.
- No hay información sobre idiomas ni sobre texto: no debe usarse como modelo de lenguaje.
- La licencia MIT del repo permite uso comercial, pero conviene verificar la licencia del modelo base `microsoft/TRELLIS.2-4B` antes de desplegarlo en producción.
- El número de parámetros declarado en safetensors (7.786.541.462) no coincide con el "4B" del nombre; conviene tratarlo con cautela y verificar la configuración real del modelo base.
- Al ser una conversión de terceros (`gguf-org`), no hay garantía de fidelidad respecto al modelo original de Microsoft.
- El runtime `ggk` es poco conocido y no se documenta en la ficha; la compatibilidad con otras herramientas GGUF no está confirmada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gguf-org/trellis2-4b-gguf
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
