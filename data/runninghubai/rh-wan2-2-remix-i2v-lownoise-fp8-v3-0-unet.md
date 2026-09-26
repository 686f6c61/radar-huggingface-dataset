# RunningHubAI/rh-wan2.2-remix-i2v-lownoise-fp8-v3.0-unet

## Resumen

rh-wan2.2-remix-i2v-lownoise-fp8-v3.0-unet es un UNet de generación de vídeo a partir de imagen (image-to-video) publicado por RunningHub con la cuenta RunningHubAI y atribuido al autor @FX-小肥猴. Se obtiene por fine-tuning del modelo WAN 2.2 en su variante LowNoise de 14B de parámetros, y el repositorio distribuye un único fichero de pesos en formato safetensors cuantizado en fp8 (e4m3fn) de 13.629 MiB (unos 13,3 GiB), pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face.

La versión v3.0 se anuncia como la última de la serie Remix I2V e incorpora tres cambios respecto a versiones previas: un LoRA VBVR para mejorar la comprensión espacial y la coherencia de movimiento y estructura de escena, una optimización con UnifiedReward orientada a la calidad y estabilidad del vídeo generado, y ajustes en varios LoRA orientados a contenido NSFW.

Su interés es fundamentalmente práctico: pone a disposición un checkpoint ya cuantizado a fp8 de un modelo de vídeo de 14B, lo que rebaja los requisitos de memoria frente a pesos en fp16 y simplifica su integración en flujos de trabajo de ComfyUI. La información disponible es escasa en otros aspectos: el repositorio no declara licencia explícita, no documenta idiomas soportados, no publica benchmarks y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la model card clasifica el modelo como UNET de text-to-video, derivado por fine-tuning de WAN 2.2 (LowNoise) |
| Parametros totales | 14B (inferido del nombre del fichero de pesos, `..._14b_...`); no confirmado en la model card |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | fp8 (formato e4m3fn); este repositorio no distribuye variantes fp16, GGUF ni otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que se publica en nombre del autor, que conserva el copyright, y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`Wan2.2_Remix_NSFW_i2v_14b_low_lighting_fp8_e4m3fn_v3.0.safetensors`, 13.629 MiB) |
| Tipo de tarea | Image-to-video / text-to-video (pipeline declarado: text-to-video; el nombre y la propia model card indican I2V) |
| Tamano del repositorio | 14,3 GB |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Autor / entidad | RunningHubAI (RunningHub), autor @FX-小肥猴 |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de etiquetar el modelo como UNET y encuadrarlo en la familia WAN 2.2, de la que se declara fine-tuning sobre la variante LowNoise. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documenta la dimensión de los latentes, el número de pasos de muestreo recomendado ni el scheduler asociado.

Lo que sí se documenta son los componentes añadidos en la versión 3.0. El primero es un LoRA VBVR integrado para reforzar la comprensión espacial y la consistencia en el movimiento y la estructura de escena. El segundo es una optimización con UnifiedReward, orientada a mejorar la calidad global y la coherencia visual del vídeo resultante. El tercero son ajustes sobre varios LoRA NSFW para refinar la generación en esos escenarios. La cuantización a fp8 e4m3fn se aplica sobre los pesos del UNet y constituye la aportación principal del repositorio en términos de despliegue, al reducir el peso del fichero a 13,3 GiB. La model card indica además que v3.0 se plantea como la release final de la serie, sin más actualizaciones salvo avances técnicos relevantes.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), con el pipeline declarado como text-to-video en los metadatos del repositorio.
- Control de la estructura de escena y coherencia del movimiento, reforzado mediante el LoRA VBVR integrado en la versión 3.0.
- Generación en condiciones de iluminación baja o difícil, según se deduce del sufijo `low_lighting` del fichero de pesos.
- Generación de contenido NSFW, con LoRA específicos actualizados y refinados en esta versión.
- Integración como nodo de carga de UNET en flujos de ComfyUI.
- Ejecución en la plataforma en la nube de RunningHub, además del uso local.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multimodales de entrada más allá de la imagen inicial.
- No se documentan capacidades multilingües ni de audio.

## Casos de uso

- Animación de imágenes fijas para redes sociales: el modelo toma una fotografía o ilustración y genera un clip animado coherente, apoyándose en el LoRA VBVR para mantener la estructura de la escena a lo largo de los fotogramas.
- Previsualización y storyboard en producción audiovisual: se generan planos animados de baja resolución a partir de bocetos o conceptos, de forma que el equipo valida encuadre y movimiento antes de rodar o renderizar en 3D.
- Publicidad y marketing de producto: animar fotografías de producto en condiciones de iluminación pobres es viable gracias al ajuste `low_lighting`, útil para catálogos y anuncios donde el material original no es óptimo.
- Contenido para videojuegos y prototipado de assets: generar cinemáticas o animaciones de personajes a partir de arte conceptual estático antes de invertir en animación manual.
- Pipelines automatizados en ComfyUI: al ser un UNET en safetensors de 13,3 GiB, se puede insertar en un grafo de ComfyUI con nodos de carga de UNET y encadenar generación por lotes para producir variantes de un mismo plano.
- Postproducción y restauración de material: animar fotografías históricas o archivos con poca luz para vídeos conmemorativos o documentales.
- Creación de contenido para adultos: la propia model card documenta LoRA NSFW específicos; su uso exige verificar la legalidad aplicable, la edad de los sujetos representados y las condiciones de la plataforma de destino.
- Servicios gestionados de generación de vídeo: el modelo puede consumirse a través de la API de RunningHub sin necesidad de infraestructura propia, apoyándose en la referencia al modelo original publicada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del tamaño del fichero de pesos (13.629 MiB en fp8), no datos publicados por el autor.

- VRAM estimada para los pesos del UNET: en torno a 13-14 GB solo para el fichero fp8; hay que sumar el codificador de texto y el VAE del pipeline WAN 2.2, no incluidos en este repositorio.
- VRAM estimada total: aproximadamente 16-20 GB como mínimo con descarga a CPU (offloading) de componentes; 24 GB o más recomendable para generar a resoluciones y duraciones habituales del modelo.
- GPU consumer: podría ejecutarse en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, y en modelos de 16 GB únicamente con cuantización adicional y offloading agresivo. Por debajo de 16 GB no hay garantía de funcionamiento con este fichero.
- GPU profesionales recomendadas: A100, H100, L40S o A6000 para lotes grandes, resoluciones altas o despliegue multiusuario en servidor.
- Opciones de despliegue: ComfyUI es el entorno indicado en las etiquetas del repositorio; también RunningHub como servicio en la nube. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, herramientas que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la información proporcionada. La única comparación posible con lo documentado es frente al modelo base del que deriva.

| Modelo | Parametros | Precision de pesos | Tamano del fichero | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-wan2.2-remix-i2v-lownoise-fp8-v3.0-unet | 14B (segun nombre del fichero) | fp8 e4m3fn | 13.629 MiB | No aplica | No disponible | Hugging Face, ComfyUI, RunningHub |
| WAN 2.2 (LowNoise), modelo base | 14B | No disponible en esta informacion | No disponible en esta informacion | No aplica | No disponible en esta informacion | Proyecto upstream referenciado por el autor |
| Otras alternativas de generacion de video open source | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible verificar la licencia de WAN 2.2 y obtener autorización del autor del fine-tuning.
- Contenido NSFW: el modelo integra LoRA específicos para contenido para adultos. Su uso implica riesgos legales y de cumplimiento (verificación de edad, normativa local, políticas de las plataformas de distribución) que recaen por completo en quien lo despliega.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir artefactos, deformaciones anatómicas, incoherencias temporales entre fotogramas y movimientos no plausibles; no existe validación automática de la verosimilitud del resultado.
- Sesgos: no se documenta ninguna evaluación de sesgos. Al derivar de un modelo entrenado con datos a gran escala no filtrados públicamente, es previsible que reproduzca sesgos de representación de personas, culturas y contextos.
- Ausencia de benchmarks: sin métricas publicadas no es posible cuantificar la mejora de v3.0 frente a versiones anteriores ni frente al modelo base, más allá de las afirmaciones cualitativas de la model card.
- Sin mantenimiento: la propia model card declara v3.0 como versión final de la serie, por lo que no cabe esperar correcciones de errores ni mejoras futuras.
- Adopción nula verificable: 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin comunidad ni informes independientes de uso.
- Idiomas de los prompts no documentados: no se especifica si el modelo responde mejor a instrucciones en inglés, chino u otros idiomas.
- Dependencia del pipeline completo: el repositorio solo contiene los pesos del UNET; requiere además el codificador de texto, el VAE y la configuración de muestreo del ecosistema WAN 2.2, no incluidos aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2.2-remix-i2v-lownoise-fp8-v3.0-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2033414693401927681
- Perfil del autor: https://www.runninghub.ai/user-center/1986370833360760833
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2033414693401927681
