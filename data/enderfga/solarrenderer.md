# Enderfga/SolarRenderer

## Resumen

SolarRenderer es un conjunto de cuatro adaptadores LoRA (rango 384) sobre el modelo base MiniMax-H3 (variante Ref2VA), desarrollado por Guian Fang, Shengju Qian, Dongyue Lu, Junchao Huang, Lutao Jiang, Xin Wang, Yiren Song, Li Jiang y Mike Zheng Shou. Resuelve un problema concreto de produccion audiovisual: convertir un video de estructura (cajas grises, mapas semanticos, esqueletos, profundidad, mallas corporales o incluso un boceto nunca visto en entrenamiento) en un video final renderizado, con un primer fotograma opcional y un prompt que fija el aspecto visual.

Su aportacion tecnica es la eficiencia: combina un LoRA de control que inyecta la estructura por la ruta de referencia de H3, alineada fotograma a fotograma, con un LoRA de cuatro pasos derivado de DMAD mediante distribution matching guiado por estructura. El resultado es un clip de 158 fotogramas a 1344x768 (o 768x1344) y 24 fps en unos 3,5 minutos de muestreo en una sola GPU. Ademas, ofrece variantes causales que permiten renderizar por bloques en streaming.

Es relevante ahora porque traslada la generacion de video condicionada por estructura a un regimen de pocos pasos y de bajo coste, algo critico para previz de animacion, VFX y herramientas interactivas. El repo ocupa 16,6 GB y el modelo acumula 13 likes con 0 descargas en el momento de la consulta (creado el 2026-10-13, actualizado el 2026-10-22).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el transformer del modelo base MiniMax-H3 (variante Ref2VA) |
| Parametros totales | no disponible (pesos distribuidos como LoRA de rango 384; repo de 16,6 GB) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; en la variante causal cada bloque ve hasta 5 fotogramas latentes, la estructura de los 6 bloques anteriores y los 5 bloques ya renderizados |
| Tipos de cuantizacion | no disponible; se distribuyen adaptadores en safetensors (no se publican GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la entrada es un prompt de texto) |
| Licencia | MiniMax H3 Community License Agreement (license: other), con restricciones territoriales; el codigo es Apache 2.0 |
| Formato de pesos | safetensors (cuatro ficheros LoRA: `solarrenderer_control_lora.safetensors`, `solarrenderer_4step_lora.safetensors`, `solarrenderer_causal_control_lora.safetensors`, `solarrenderer_causal_4step_lora.safetensors`) |

## Arquitectura y entrenamiento

SolarRenderer no es un modelo completo, sino cuatro adaptadores LoRA de rango 384 sobre MiniMax-H3, un transformer de generacion de video en su variante Ref2VA. El primero, `solarrenderer_control_lora`, introduce el video de estructura en la ruta de referencia de H3 alineandolo fotograma a fotograma. El segundo, `solarrenderer_4step_lora`, es un LoRA de cuatro pasos afinado a partir de DMAD (ZhengmingYu/DMAD) mediante distribution matching guiado por estructura, lo que permite reducir el muestreo a cuatro pasos. Ambos existen tambien en version de clip completo.

La innovacion principal es la version causal y en streaming. El control LoRA causal se entrena con atencion block-causal: cada bloque de hasta 5 fotogramas latentes ve el prompt, el primer fotograma, la estructura de los ultimos 6 bloques y los 5 bloques ya renderizados, nunca un bloque posterior. Sobre esa base congelada, el LoRA de cuatro pasos causal se postentrena con sus propias rollouts bloque a bloque, aplicando distribution matching con guia de estructura (w = 1.5) hacia el modelo de control de clip completo. No se detalla en la informacion disponible el volumen de tokens, la composicion del dataset de entrenamiento ni si hubo RLHF o DPO (no aplica de forma directa a un modelo de renderizado).

## Capacidades

- Video-to-video condicionado por estructura: convierte cajas grises, mapas semanticos, esqueletos, mapas de profundidad, mallas corporales o bocetos no vistos en entrenamiento en video final.
- Control de estilo mediante prompt de texto y primer fotograma opcional, que fijan la apariencia de toda la secuencia.
- Renderizado en cuatro pasos de muestreo, frente al regimen habitual de decenas de pasos.
- Salida de 158 fotogramas a 1344x768 o 768x1344 y 24 fps.
- Streaming por bloques con las variantes causales: cada bloque se puede mostrar en cuanto termina, sin esperar al clip completo.
- Generalizacion a tipos de estructura no presentes en el entrenamiento (el autor menciona explicitamente el caso del boceto).
- No se documentan capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento; es un modelo generativo de video, no un LLM.

## Casos de uso

- Previz de animacion: a partir del blocking en cajas grises de un estudio, el LoRA de control genera un render con aspecto final sin pasar por iluminacion y shading manuales, manteniendo la composicion fotograma a fotograma.
- Transferencia de movimiento con esqueletos o mallas corporales: se extrae el esqueleto de una referencia y se renderiza un personaje nuevo con ese movimiento, util para animacion de dobles y prototipado de personajes.
- Poblado de escenarios 3D: se renderiza el mapa de profundidad de una escena y SolarRenderer produce el video texturizado con el aspecto que fija el prompt.
- Storyboard a video: un boceto dibujado a mano, nunca visto en entrenamiento, se convierte en un clip de 158 fotogramas, lo que permite validar una secuencia antes de producirla.
- Herramientas interactivas con streaming: la variante causal permite mostrar el resultado bloque a bloque mientras el usuario ajusta la estructura, con cuatro pasos por bloque.
- Prototipado publicitario: con un primer fotograma de referencia y un prompt de estilo se generan variantes de un mismo plano manteniendo la composicion marcada por la estructura.
- Aumento de datos para entrenamiento: generar pares estructura-video sinteticos y diversos a partir de estructuras existentes para alimentar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos aportados por el autor son de inferencia: 158 fotogramas a 1344x768 o 768x1344, 24 fps, cuatro pasos de muestreo y aproximadamente 3,5 minutos de muestreo en una sola GPU (modelo no especificado).

## Requisitos de hardware

- El autor indica que el renderizado se ejecuta en una unica GPU, con unos 3,5 minutos por clip de 158 fotogramas; no se especifica el modelo de GPU empleado.
- VRAM estimada: no disponible. Depende del modelo base MiniMax-H3, cuyos parametros no se detallan en la informacion proporcionada; el repo de adaptadores ocupa 16,6 GB.
- GPU recomendadas: no disponible. No se puede confirmar que quepa en GPUs de consumo (RTX 4090 y similares) sin datos del modelo base.
- Despliegue: scripts propios del repositorio (`scripts/prepare_h3.py` para preparar el modelo base y `scripts/render.py` para inferencia), con `flash-attn==2.7.4.post1` y el flag `--causal` para streaming. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: aproximadamente 158 fotogramas en 3,5 minutos en modo clip completo; el modo causal permite emitir cada bloque de hasta 5 fotogramas latentes en cuanto se completa, con cuatro pasos por bloque.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / salida | Enfoque | Licencia |
|---|---|---|---|---|---|
| SolarRenderer | LoRA sobre MiniMax-H3 | no disponible (rango 384) | bloques de hasta 5 fotogramas latentes en modo causal; 158 fotogramas a 1344x768 y 24 fps | Rendering condicionado por estructura en cuatro pasos | MiniMax H3 Community License (excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| MiniMax-H3 (Ref2VA) | Modelo base | no disponible | no disponible | Generacion de video con ruta de referencia | MiniMax H3 Community License |
| DMAD (ZhengmingYu/DMAD) | LoRA de destilacion a pocos pasos | no disponible | no disponible | Reduccion a pocos pasos; sin control de estructura | no disponible en la informacion proporcionada |

No se dispone de datos de otros modelos comparables de video-to-video condicionado por estructura en la informacion proporcionada, por lo que no se establece comparacion de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License excluye explicitamente la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos. Para un lector en Espana, esto implica que el uso queda fuera del territorio permitido por la licencia, ademas de las condiciones de la Acceptable Use Policy.
- Los cuatro pasos LoRA descienden del LoRA publico DMAD y heredan la misma licencia, lo que anade obligaciones de atribucion y posiblemente restricciones adicionales.
- El modelo depende por completo de MiniMax-H3: sin el modelo base no funciona, y las limitaciones de este (sesgos visuales, estilo, resolucion) se trasladan al adaptador.
- Riesgo de artefactos y alucinacion visual: el renderizado puede inventar geometria, texturas o detalles no presentes en el video de estructura, especialmente con estructuras ambiguas o bocetos.
- La variante de clip completo requiere procesar los 158 fotogramas antes de obtener resultado; solo la variante causal permite visualizacion progresiva, y esta se entrena con rollouts propios, lo que puede introducir deriva acumulada entre bloques.
- No hay informacion sobre idiomas soportados en el prompt ni sobre sensibilidad a prompts en castellano.
- No se publican resultados de benchmarks, por lo que la calidad relativa frente a alternativas no esta cuantificada.
- El modelo acumula 0 descargas y 13 likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los datos proceden de la model card y del repositorio de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/Enderfga/SolarRenderer
- Pagina del proyecto: https://enderfga.cn/SolarRenderer
- Demo online (Space): https://huggingface.co/spaces/Enderfga/SolarRenderer
- Paper (arXiv 2610.28630): https://arxiv.org/abs/2610.28630
- Codigo (GitHub): https://github.com/Enderfga/SolarRenderer
- Guia de prompts: https://github.com/Enderfga/SolarRenderer/blob/main/docs/prompts.md
- Dataset: https://huggingface.co/datasets/Enderfga/SolarRenderer-Data
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA de cuatro pasos DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Licencia: https://huggingface.co/Enderfga/SolarRenderer/blob/main/LICENSE
