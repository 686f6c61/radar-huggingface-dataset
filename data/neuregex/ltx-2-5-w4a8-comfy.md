# neuregex/LTX-2.5-w4a8-comfy

## Resumen

LTX-2.5-w4a8-comfy es una cuantizacion de 4 bits del modelo LTX-2.5 de Lightricks, un modelo de generacion de video con audio a partir de imagen (image-to-video) de 22 000 millones de parametros en su variante distilled. La publica el usuario neuregex en Hugging Face y no es un modelo nuevo, sino una conversion de los pesos originales en formato bf16 al formato propio de ComfyUI `asym_w4a8_int8`, pensada para reducir el consumo de VRAM sin cambiar el flujo de trabajo del usuario.

El paquete incluye dos ficheros: el transformer de difusion (12,5 GB frente a los 42,0 GB en bf16) y el text encoder Gemma 4 12B con las capas de proyeccion de LTX-2.5 (10,6 GB frente a 26,3 GB). En total, 23,1 GB, un 34 % del peso original de 68,3 GB. La cuantizacion afecta solo a las capas que ya cuantizaba el fichero int8 oficial de ComfyUI; el resto de tensores se mantiene en bf16.

Su relevancia es practica: permite ejecutar un modelo de video con audio de 22B en GPUs de consumo y en entornos ComfyUI estandar, sin nodos personalizados, cargandolo con los nodos `UNETLoader` y `CLIPLoader` habituales. Requiere ComfyUI del 19 de octubre de 2026 o posterior (probado en el commit `e3bee7f`, despues de la version 0.42.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (LTX-2.5 distilled) con text encoder Gemma 4 12B y capas de proyeccion |
| Parametros totales | 22B (transformer de difusion); text encoder Gemma 4 12B adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 (`asym_w4a8_int8`): codigos de 4 bits sobre codebook Lloyd-Max, escalas fp8 E4M3 cada 16 pesos, escala fp32 por fila de salida y rotacion de Hadamard en grupos de 256 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (uso comercial restringido para entidades con ingresos anuales >= 10 000 000 USD) |
| Formato de pesos | safetensors (formato de cuantizacion propio de ComfyUI) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un transformer de difusion para generacion de video con audio; esta ficha describe la variante distilled de 22B. La cuantizacion no altera la arquitectura: solo sustituye los pesos de 1440 capas del transformer y 328 capas del text encoder por representaciones w4a8. El esquema `asym_w4a8_int8` combina codigos de 4 bits con un codebook Lloyd-Max, escalas fp8 (E4M3) cada 16 pesos, una escala fp32 por fila de salida y una rotacion de Hadamard en grupos de 256 elementos para reducir el error de cuantizacion.

La conversion se realizo con Comfy Kitchen 0.2.39, la libreria con la que ComfyUI ejecuta estos pesos. El error relativo de pesos por capa tras el round-trip, ‖W − Ŵ‖ / ‖W‖, es de 0,073 de media y 0,074 maximo en el transformer, y de 0,073 de media y maximo en el text encoder. El autor verifico el resultado con el mismo flujo image-to-video y la misma semilla que con los ficheros int8 que sustituye (un retrato girando la cabeza, 4 s con audio, en una L40S): misma trayectoria de movimiento y encuadre, con diferencias pequenas en detalle de pelo y piel. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de alineacion del modelo base.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video), con audio asociado.
- Generacion de clips de al menos 4 segundos con audio, segun la prueba descrita por el autor.
- Carga directa en ComfyUI mediante los nodos estandar `UNETLoader` y `CLIPLoader`, sin nodos personalizados.
- Ejecucion con kernels int8 en GPUs RTX serie 30 y posteriores; en tarjetas anteriores se descomprime cada capa antes de multiplicar (mismo consumo de memoria, mas lento).
- Codificacion de texto mediante Gemma 4 12B con las capas de proyeccion de LTX-2.5.
- No se dispone de informacion sobre tool calling, soporte de agentes, capacidades multilingues explicitas ni modos especiales de razonamiento.

## Casos de uso

- Animacion de retratos y fotografias: partiendo de una imagen fija, generar un clip corto con movimiento de cabeza o gestos y audio sincronizado, como en la prueba del autor (4 s, retrato girando la cabeza), con un consumo de VRAM compatible con GPUs de consumo.
- Prototipado rapido en ComfyUI: al cargarse con los nodos estandar y requerir solo ComfyUI >= 19-10-2026, permite montar un flujo image-to-video funcional sin instalar nodos personalizados ni descargar 68,3 GB de pesos.
- Previsualizacion de storyboards: generar versiones animadas de baja fidelidad de planos fijos antes de producir el render final en bf16, gracias a la reduccion del 66 % en tamano de pesos.
- Iteracion en equipos con una sola GPU: el paquete de 23,1 GB cabe en tarjetas con 24 GB de VRAM (RTX 3090, 4090, L40S), lo que permite entrenar flujos de trabajo y ajustar prompts sin acceso a hardware de centro de datos.
- Generacion de contenido para redes sociales: clips cortos con audio a partir de una imagen promocional, con el modelo ejecutandose en local y sin dependencia de APIs externas.
- Investigacion sobre cuantizacion: el error de pesos documentado (0,073 de media) y la comparacion cualitativa frente a int8 permiten estudiar el impacto de w4a8 en modelos de difusion de video.
- Despliegue en produccion con restricciones de memoria: en servidores con L40S o A100, el formato w4a8 reduce el footprint y permite servir el modelo junto con otros componentes en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la comparacion cualitativa del autor frente a los ficheros int8 en una L40S: misma trayectoria de movimiento y encuadre, con diferencias pequenas en detalle de pelo y piel.

## Requisitos de hardware

- VRAM estimada: el paquete suma 23,1 GB de pesos (12,5 GB del transformer + 10,6 GB del text encoder); la VRAM total necesaria para inferencia no esta especificada y depende de la resolucion, duracion del clip y del resto del grafo de ComfyUI.
- GPU probada por el autor: NVIDIA L40S (48 GB).
- GPUs recomendadas: RTX serie 30 o posterior para aprovechar los kernels int8; en tarjetas anteriores se descomprime cada capa antes de multiplicar (mismo consumo de memoria, mas lento).
- Cabe en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) segun el tamano de los pesos, aunque el margen para activaciones y contexto no esta documentado.
- Despliegue: ComfyUI (version del 19-10-2026 o posterior, probado en el commit `e3bee7f`, despues de 0.42.0), con los nodos `UNETLoader` y `CLIPLoader`. No se mencionan otros motores (vLLM, llama.cpp, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| neuregex/LTX-2.5-w4a8-comfy | 22B (transformer) + 12B (text encoder) | w4a8 (ComfyUI) | 23,1 GB en total | LTX-2.x Community License | Cuantizacion de 4 bits, sin nodos personalizados |
| LTX-2.5 bf16 (Lightricks) | 22B (transformer) + 12B (text encoder) | bf16 | 68,3 GB en total | LTX-2.x Community License | Referencia de calidad maxima |
| LTX-2.5 comfy-int8-convrot (oficial ComfyUI) | 22B (transformer) + 12B (text encoder) | int8 | 36,9 GB en total (21,5 + 15,4 GB) | LTX-2.x Community License | Version int8 que este paquete sustituye |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a otras alternativas.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: el error relativo de pesos es de 0,073 de media, con posibles diferencias visibles en detalles finos (pelo, piel) frente a bf16 o int8.
- Licencia restrictiva: el acuerdo LTX-2.x limita el uso comercial. Una entidad comercial con ingresos anuales de al menos 10 000 000 USD necesita una licencia comercial de pago de Lightricks antes de cualquier uso, salvo que este encaje en la definicion de proposito no comercial del acuerdo.
- El text encoder incorpora pesos de Gemma 4 12B de Google bajo Apache 2.0, con capas de proyeccion de LTX-2.5; conviene revisar ambas licencias.
- Requiere ComfyUI del 19 de octubre de 2026 o posterior; versiones anteriores no cargaran los pesos correctamente.
- En GPUs anteriores a la serie RTX 30 no hay kernels int8: la inferencia funciona pero es mas lenta al descomprimir cada capa.
- El repositorio no registra descargas ni likes, y el autor no documenta sesgos, tasas de alucinacion ni limitaciones de idioma del modelo base.
- No se dispone de informacion sobre el contexto maximo, los idiomas soportados ni el comportamiento del audio generado mas alla de la prueba de 4 segundos descrita.

## Enlaces

- Hugging Face: https://huggingface.co/neuregex/LTX-2.5-w4a8-comfy
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Discord del autor: https://discord.gg/HxfP9TnctJ
