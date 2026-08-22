# glowskeleton/goblin-models

## Resumen

Goblin models es un repositorio de artefactos ONNX que sirve como fuente de descargas para el instalador de modelos de Goblin, un compositor basado en nodos acelerado por GPU desarrollado por rotoshake. El repositorio contiene tres grupos de modelos: re-exportaciones de SAM2 para propagación de video, una versión de ViTMatte con los operadores Einsum reescritos como MatMul, y un espejo de los archivos ONNX de SAM2 en modo imagen. El objetivo principal es que cada versión de Goblin fije exactamente los artefactos con los que fue probada, en lugar de seguir la rama main de los proyectos upstream.

La relevancia de este repositorio radica en que resuelve dos problemas técnicos concretos: por un lado, `facebook/sam2.1-hiera-tiny` no publica una exportación ONNX de la ruta de video, por lo que Goblin produce la suya propia con una reescritura del RoPE para manejar tensores complejos que ONNX no puede representar. Por otro lado, ViTMatte contiene 24 nodos Einsum que impiden su ejecución en CoreML y causan resultados incorrectos en DirectML, por lo que se reescriben como MatMul con difusión. El resultado es bit-idéntico en CPU y habilita aceleración por hardware en más proveedores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 Hiera-Tiny (video e imagen) + ViTMatte Small (composición de mattes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (solo exportaciones ONNX, sin cuantizacion documentada) |
| Idiomas soportados | no aplica (modelos de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplica; los pesos constantes se exportan como archivos `.f32`) |

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados desde cero, sino artefactos derivados y re-exportados de dos modelos existentes. El grupo `sam2-video/` contiene tres exportaciones ONNX producidas especificamente para Goblin: `memory_attention.onnx`, `memory_encoder.onnx` y `prompt_encoder_mask_decoder.onnx`. La primera requirió una reescritura de la atencion RoPE de valor real, porque los tensores complejos de SAM2 no tienen representación en ONNX. La tercera es una re-exportación que incluye la salida `obj_ptr` que la propagación de video necesita, algo que la compilación upstream no ofrece.

El grupo `vitmatte/` toma el modelo `Xenova/vitmatte-small-composition-1k` y reescribe sus 24 nodos Einsum (12 de tipo `bhwc,hkc->bhwk` y 12 de tipo `bhwc,wkc->bhwk`, correspondientes al bias de posicion relativa descompuesto de ViT) como broadcastingaciones MatMul. Esta reescritura es bit-idéntica en el execution provider de CPU (diferencia máxima absoluta de 0.000e+00 sobre entradas aleatorias) y no introduce operadores nuevos ni cambios de opset. La herramienta que lo genera, `tools/ml/rewrite_vitmatte_einsum.py`, se niega a emitir un modelo cuya salida se desvíe más de 1e-4.

El grupo `sam2-upstream/` es un espejo byte-a-byte de los archivos ONNX de `onnx-community/sam2.1-hiera-tiny-ONNX`, para que la instalación sea autocontenida y no pueda cambiar si el repositorio upstream hace un force-push. Los pesos de ViTMatte derivan de `hustvl/vitmatte-small-composition-1k`; los de SAM2 son Apache 2.0 de Meta.

## Capacidades

- Segmentación de imágenes mediante SAM 2.1 en modo imagen (espejo de la exportación comunitaria).
- Propagación de máscaras en video mediante SAM 2 con memoria temporal, gracias a la re-exportación que incluye `obj_ptr` y los cuatro tokens de máscara.
- Matting de imágenes (extracción de primer plano con alpha) mediante ViTMatte, con la reescritura de Einsum que permite ejecución en CoreML y DirectML sin errores.
- Ejecución en múltiples proveedores de ejecución ONNX: CPU, CoreML y DirectML, seleccionados automáticamente por Goblin según el contenido del grafo.
- Sin dependencias de texto: no hay generación de lenguaje, tool calling ni capacidades multilingües.

## Casos de uso

- **Composición de video en Goblin**: el nodo de segmentación de SAM2 puede rastrear objetos a lo largo de una secuencia de frames usando la propagación de video, lo que permite aislar actores o objetos móviles para composición sin rotoscopia manual.
- **Matting de alta calidad en flujos de composición**: ViTMatte extrae mattes de primer plano con bordes finos (cabello, pelaje), y la reescritura de Einsum permite ejecutarlo en GPU con DirectML o en Apple Silicon con CoreML, en lugar de quedarse en CPU.
- **Integración en pipelines de renderizado**: al ser ONNX, los modelos se pueden cargar con el runtime de ONNX dentro de Goblin o en scripts Python externos, facilitando la automatización de tareas de rotoscopia y matting en producción.
- **Validación de compatibilidad de modelos**: el repositorio sirve como referencia fija de artefactos probados, lo que permite a los usuarios de Goblin verificar que su instalación usa exactamente los archivos testados, evitando regresiones por cambios upstream.
- **Investigación en exportación ONNX**: los artefactos `sam2-video/` documentan cómo resolver la falta de soporte ONNX para tensores complejos en SAM2, y el grupo `vitmatte/` demuestra una estrategia de reescritura de operadores para sortear limitaciones de ejecución en CoreML y DirectML.
- **Despliegue de segmentación en entornos sin GPU**: la reescritura de ViTMatte es bit-idéntica en CPU, lo que permite ejecutar matting con resultados exactos en máquinas sin aceleración, manteniendo la compatibilidad con proveedores acelerados cuando estén disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, latencia ni comparativas con otros modelos. La única métrica documentada es la verificación de bit-idéntica (diferencia máxima absoluta 0.000e+00) entre la reescritura de ViTMatte y el modelo original en CPU, y el umbral de 1e-4 de desviación que la herramienta de reescritura impone.

## Requisitos de hardware

- Los modelos son ONNX, por lo que pueden ejecutarse en cualquier runtime compatible (ONNX Runtime, CoreML, DirectML).
- El modelo ViTMatte reescrito puede ejecutarse en CPU sin pérdida de exactitud, según la documentación del repositorio.
- SAM2 en modo imagen requiere una GPU con suficiente VRAM para el procesamiento de imágenes; los tamaños exactos de VRAM no se documentan en el repositorio.
- La propagación de video de SAM2 requiere memoria adicional para el almacenamiento de los estados de memoria y atención, aunque no se especifican cifras.
- CoreML (Apple Silicon) y DirectML (Windows con GPU compatible) son soportados para ViTMatte tras la reescritura; antes de la reescritura, CoreML particionaba el grafo en ~51 particiones sin aceleración, y DirectML producía resultados incorrectos.
- Goblin es el frontend principal, pero los archivos ONNX se pueden usar con cualquier runtime ONNX Runtime.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `glowskeleton/goblin-models` (este) | SAM2.1 Hiera-Tiny + ViTMatte Small | N/A (vision) | Apache 2.0 | ONNX | Re-exportaciones con fixes para video y CoreML/DirectML |
| `onnx-community/sam2.1-hiera-tiny-ONNX` | SAM2.1 Hiera-Tiny | N/A (vision) | Apache 2.0 | ONNX | Exportación comunitaria solo en modo imagen; sin `obj_ptr` |
| `Xenova/vitmatte-small-composition-1k` | ViTMatte Small | N/A (vision) | Apache 2.0 | ONNX | Contiene Einsum; solo ejecutable en CPU con CoreML/DirectML |

La diferencia principal es que el repositorio Goblin añade la ruta de video de SAM2 (inexistente en la exportación comunitaria) y la reescritura de Einsum para ViTMatte, que la versión original no tiene. El resto de capacidades de segmentación y matting son equivalentes.

## Limitaciones y advertencias

- Los modelos no incluyen una ruta de video SAM2 con soporte ONNX de la comunidad; las exportaciones de `sam2-video/` son producidas por Goblin y podrían no coincidir exactamente con el comportamiento del checkpoint de PyTorch en todos los casos, aunque están verificadas para el uso previsto.
- El modelo `prompt_encoder_mask_decoder.onnx` de `sam2-upstream/` es el original de la comunidad y no tiene la salida `obj_ptr`; si se usa para propagación de video, la propagación no funcionará. Es necesario usar el archivo de `sam2-video/` para ese caso.
- ViTMatte original (sin la reescritura) produce resultados incorrectos en DirectML debido a un bug documentado en ONNX Runtime (issue #19837), y en CoreML se particiona en ~51 subgrafos sin aceleración. La reescritura resuelve esto, pero solo está presente en el repositorio Goblin.
- Los modelos son de visión pura; no tienen capacidades de lenguaje, generación de texto ni tool calling.
- No se documenta el tamaño total de los pesos ni los requisitos de VRAM por modelo, lo que dificulta estimar el despliegue en hardware concreto.
- La licencia Apache 2.0 permite uso comercial, pero los pesos de ViTMatte derivan de `hustvl/vitmatte-small-composition-1k`, cuyas condiciones se heredan según lo indicado en el repositorio; se recomienda revisar la licencia de ese modelo original.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto muy reciente o de uso limitado; no hay evidencia de uso en producción más allá de Goblin.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/glowskeleton/goblin-models
- Proyecto Goblin (GitHub): https://github.com/rotoshake/Goblin
- Herramienta de reescritura de ViTMatte: https://github.com/rotoshake/Goblin/blob/main/tools/ml/rewrite_vitmatte_einsum.py
- Modelo original de ViTMatte: https://huggingface.co/Xenova/vitmatte-small-composition-1k
- Pesos originales de ViTMatte: https://huggingface.co/hustvl/vitmatte-small-composition-1k
- Exportación ONNX de SAM2 comunidad: https://huggingface.co/onnx-community/sam2.1-hiera-tiny-ONNX
- Bug de Einsum en DirectML (ONNX Runtime issue): https://github.com/microsoft/onnxruntime/issues/19837
