# realrebelai/iris-3b_GGUFs

## Resumen

Iris-3B es un transformer de difusion de 3.000 millones de parametros que genera imagenes directamente en espacio de pixeles, sin necesidad de un VAE separado. Lo desarrolla Sperid Labs, y esta ficha corresponde al repositorio de cuantizaciones publicado por Rebel AI (realrebelai) bajo el identificador `realrebelai/iris-3b_GGUFs`. El objetivo del repositorio es reducir los requisitos de memoria del modelo original para poder ejecutarlo en GPUs de consumo mediante cuantizacion GGUF y W4A8.

A diferencia de los modelos de difusion latente convencionales (Stable Diffusion, FLUX), Iris opera sobre pixeles crudos con una arquitectura de flow matching, lo que simplifica el pipeline al eliminar la decodificacion VAE, pero encarece la atencion a resolucion nativa. El modelo condiciona el prompt mediante un codificador de texto externo, Qwen3-VL-4B-Instruct, que se descarga por separado. La resolucion nativa de generacion es de aproximadamente 1 megapixel (1024 x 1024).

El repositorio se publica como version experimental: las cuantizaciones no han completado benchmarks de calidad de imagen, la inferencia GGUF no esta verificada y la integracion en ComfyUI sigue en desarrollo. Es relevante ahora porque representa uno de los primeros intentos de llevar un DiT de espacio de pixeles a hardware de gama baja, aunque su estado de madurez es claramente preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) en espacio de pixeles con flow matching |
| Parametros totales | 3.000 millones (modelo original Iris-3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (condicionamiento por texto, no contexto de tokens autoregresivo) |
| Tipos de cuantizacion | Q3_K_S (3 bits), Q4_K_S (4 bits), Q5_K_S (5 bits), Q6_K (6 bits), Q8_0 (8 bits), W4A8 (pesos 4 bits / activaciones 8 bits) |
| Idiomas soportados | no disponible (depende del codificador de texto Qwen3-VL-4B-Instruct, multilingue, sin detalle publicado para este repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF y W4A8 |
| Tamano del repositorio | 2,8 GB |
| Modelo base | speridlabs/iris-3b |
| Pipeline | text-to-image |
| Resolucion nativa | 1024 x 1024 (aprox. 1 megapixel) |
| Codificador de texto | Qwen3-VL-4B-Instruct (externo, se descarga aparte) |
| VAE | no requerido |

## Arquitectura y entrenamiento

Iris-3B es un diffusion transformer de 3.000 millones de parametros entrenado con un objetivo de flow matching. La diferencia fundamental respecto a la familia de modelos latentes es que el proceso de difusion se ejecuta directamente sobre pixeles RGB, sin comprimir primero la imagen a un espacio latente mediante un VAE. Esto elimina el decodificador VAE del pipeline de inferencia y evita las perdidas de reconstruccion asociadas, a cambio de un coste computacional mayor por paso de atencion a resolucion completa.

El condicionamiento textual se delega en Qwen3-VL-4B-Instruct, un modelo visual-lingüistico que actua como text encoder y que se mantiene separado de los pesos del DiT. El proyecto original de Sperid Labs publica ademas variantes afinadas por separado para estimacion de profundidad y restauracion de imagen, aunque este repositorio se centra unicamente en el modelo text-to-image.

No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco hay detalle sobre innovaciones adicionales de decodificacion o muestreo mas alla del sampler recomendado (FlowDPM-Solver++). El trabajo de este repositorio concreto se limita a la cuantizacion (framework de city96), la conversion W4A8 y la integracion en ComfyUI, sin reentrenamiento.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en espacio de pixeles, sin VAE.
- Resolucion nativa de aproximadamente 1 megapixel (1024 x 1024) con 100 pasos de muestreo y CFG 3.0.
- Condicionamiento mediante prompt en lenguaje natural a traves de Qwen3-VL-4B-Instruct.
- Sampler soportado: FlowDPM-Solver++ con autocast en BF16.
- Variantes cuantizadas para reducir huella de memoria: GGUF de 3 a 8 bits y W4A8.
- Integracion prevista en ComfyUI mediante un nodo especifico para Iris-3B (seleccion nativa de checkpoint, muestreo propio, condicionamiento Qwen3-VL y soporte de carga W4A8 en pruebas).
- No se documentan capacidades de tool calling, function calling, agentes, edicion de imagen, vision de entrada ni audio.
- El codificador de texto Qwen3-VL-4B-Instruct es multilingue, pero no se especifica el comportamiento de generacion por idioma en este repositorio.

## Casos de uso

- Generacion de imagenes en GPU de gama baja: con la cuantizacion Q4_K_S o Q3_K_S el DiT baja a un rango estimado de 1,4 a 1,8 GB, lo que permitiria ejecutar generacion de 1024 x 1024 en tarjetas de 8 GB junto a un codificador de texto cuantizado.
- Prototipado artistico en local sin depender de servicios en la nube: al ser un modelo de 3B con licencia apache-2.0, se puede desplegar en una estacion de trabajo para exploracion de conceptos visuales sin coste por inferencia.
- Integracion en flujos ComfyUI: el repositorio apunta explicitamente a un nodo propio para Iris, por lo que el caso natural es encadenarlo con nodos de upscaling, postprocesado o control de imagen dentro de un grafo de ComfyUI.
- Investigacion sobre difusion en espacio de pixeles: al eliminar el VAE, el modelo es util para estudiar calidad de reconstruccion, artefactos en pixel space y compromisos memoria/calidad frente a modelos latentes.
- Evaluacion de tecnicas de cuantizacion en DiT: el repositorio ofrece seis variantes de precision distintas sobre el mismo modelo base, lo que permite comparar degradacion de fidelidad por nivel de cuantizacion.
- Base para afinado especifico de dominio: al ser apache-2.0 y con pesos accesibles en GGUF, se puede usar como punto de partida para ajustes de estilo o dominio sobre el modelo original.
- Pruebas de rendimiento W4A8: la variante de pesos 4 bits y activaciones 8 bits esta pensada para aceleracion nativa de precision mixta, lo que la hace candidata a pruebas de throughput en hardware compatible.
- Generacion por lotes en pipelines de contenido: con resolucion reducida y menos pasos de muestreo se puede usar para generar borradores rapidos antes de un refinado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio indica explicitamente que las variantes cuantizadas "no han completado benchmarks de calidad de imagen" y que las diferencias de velocidad, fidelidad y consumo de memoria siguen en evaluacion. Tampoco se aportan metricas del modelo original (FID, CLIP score, GenEval ni similares).

## Requisitos de hardware

- VRAM estimada del DiT segun cuantizacion (estimaciones a partir del numero de parametros, no publicadas por el autor):
  - BF16 (modelo original): ~6 GB
  - Q8_0: ~3,2 GB
  - Q6_K: ~2,5 GB
  - Q5_K_S: ~2,2 GB
  - Q4_K_S: ~1,8 GB
  - Q3_K_S: ~1,4 GB
- Codificador de texto adicional: Qwen3-VL-4B-Instruct, ~8 GB en BF16 o en torno a 2,5-3 GB en cuantizacion de 4 bits. Se descarga por separado y no esta incluido en el repositorio.
- VRAM total estimada en configuracion de bajos recursos: aproximadamente 4-5 GB combinando un DiT en Q4 con un text encoder cuantizado.
- GPU compatibles: cualquier GPU con suficiente VRAM, incluidas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100. La orientacion del repositorio es explicitamente hacia GPUs de consumo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas si se recurre a cuantizacion Q4/Q3 y a un codificador de texto cuantizado, aunque no hay confirmacion oficial.
- Opciones de despliegue: ComfyUI (nodo especifico en desarrollo), cargadores GGUF de difusion derivados del framework de city96, y runtime W4A8 (en pruebas). Se debe tener en cuenta que cargar el GGUF en un cargador generico de modelos de difusion no es suficiente: Iris requiere construccion de modelo y muestreo especificos de su arquitectura.
- vLLM, llama.cpp y TGI no son aplicables directamente, ya que no es un modelo autoregresivo de texto.
- Latencia y throughput: no disponibles. El autor no publica mediciones y las pruebas de velocidad siguen en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de difusion | VAE | Codificador de texto | Licencia | Estado |
|---|---|---|---|---|---|---|
| Iris-3B (original, Sperid Labs) | 3B | Espacio de pixeles, flow matching | No | Qwen3-VL-4B-Instruct | no disponible en la informacion | Publicado |
| Iris-3B GGUF / W4A8 (este repo) | 3B | Espacio de pixeles, flow matching | No | Qwen3-VL-4B-Instruct | apache-2.0 | Experimental, sin benchmark |
| FLUX.1 [dev] | 12B | Latente | Si | CLIP-L + T5-XXL | FLUX.1 [dev] Non-Commercial License | Publicado |
| Stable Diffusion 3.5 Large | 8B | Latente | Si | CLIP-G + CLIP-L + T5-XXL | Stability AI Community License | Publicado |

Nota: los datos de FLUX.1 [dev] y Stable Diffusion 3.5 Large corresponden a conocimiento general de la comunidad y no proceden de la informacion proporcionada en esta busqueda; se incluyen solo como referencia de categoria. No hay datos de benchmarks comparativos disponibles para Iris-3B.

## Limitaciones y advertencias

- Estado experimental: el propio autor etiqueta el repositorio como "Experimental Release" con inferencia en fase de pruebas.
- La inferencia GGUF no esta verificada. Cargar estos ficheros en un cargador generico de modelos de difusion no funciona: hace falta un constructor de modelo y un sampler especificos de Iris.
- La compatibilidad en tiempo de ejecucion esta en desarrollo, y el soporte W4A8 sigue en pruebas.
- Sin benchmarks de calidad de imagen: no se puede afirmar como se degrada la fidelidad en cada nivel de cuantizacion (Q3 a Q8).
- Riesgo de artefactos de generacion no caracterizados; el autor pide reportar problemas de compatibilidad y artefactos inesperados.
- El codificador de texto es externo y se descarga aparte, por lo que la huella de memoria total es mayor que la del solo DiT.
- La calidad de imagen de las versiones cuantizadas puede diferir del checkpoint original.
- Resoluciones inferiores a 1024 x 1024 y menos pasos de muestreo produciran resultados distintos a los recomendados.
- No se documentan sesgos, sesgos de representacion ni comportamiento por idioma. Al ser un modelo de generacion de imagenes entrenado con datos no especificados, es esperable un riesgo de sesgo de representacion, pero no hay informacion publicada al respecto.
- Licencia apache-2.0 en este repositorio de cuantizaciones; conviene verificar la licencia del modelo base `speridlabs/iris-3b`, no disponible en la informacion proporcionada, antes de un uso comercial.
- Sin garantias de soporte: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay historial de mantenimiento.
- No apto para produccion en su estado actual: la combinacion de inferencia no verificada, ausencia de benchmarks y dependencia de un nodo de ComfyUI en desarrollo lo desaconseja para despliegues criticos.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/realrebelai/iris-3b_GGUFs
- Modelo original Iris-3B (Sperid Labs): https://huggingface.co/speridlabs/iris-3b
- Codigo fuente original: https://github.com/speridlabs/iris-3b
- Perfil de Rebel AI en HuggingFace: https://huggingface.co/realrebelai
- Perfil de Rebel AI en GitHub: https://github.com/RealRebelAI
- Nodo de mejora de prompts de Rebel AI (RebelsPromptEnhancer): https://github.com/RealRebelAI/RebelsPromptEnhancer
- Repositorio MiniMax-H3_GGUFs de Rebel AI: https://huggingface.co/realrebelai/MiniMax-H3_GGUFs
- Canal de YouTube de Rebel AI: https://www.youtube.com/@realrebelai
