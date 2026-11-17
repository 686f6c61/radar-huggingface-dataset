# AI-KSK/h3-character-swap-sam-vdn8-323

## Resumen

AI-KSK/h3-character-swap-sam-vdn8-323 no es un modelo de pesos, sino un paquete que distribuye un único workflow de ComfyUI para sustitución de personajes guiada por referencia, con seguimiento de sujeto mediante SAM 3.1, recorte dinámico, procesamiento de latentes de audio y vídeo enmascarados y composición por regiones locales. El grafo contiene 47 nodos y 68 enlaces, e integra un pipeline basado en MiniMax-H3 (Ref2VA) con un LoRA específico de intercambio de personaje y un compositor VDN en la etapa `stage_dmd_8nfe`. El repositorio tiene 0.0 GB, lo que confirma que no incluye pesos.

El interés del paquete es operativo: documenta una configuración concreta y reproducible de un pipeline de edición de vídeo con identidad controlada, un caso de uso que habitualmente exige encadenar segmentación, tracking, inpainting y recomposición. La model card es inusualmente explícita sobre lo que no está verificado: no hay certificación de compatibilidad, ni benchmarks, ni requisitos de hardware, ni URLs de descarga de pesos.

La ficha se limita a lo que la información proporcionada permite afirmar. Cualquier dato sobre rendimiento, VRAM o calidad de salida debe considerarse no disponible, ya que el propio autor declara que la configuración solo se ha inspeccionado estáticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete es un workflow de ComfyUI; el pipeline subyacente usa MiniMax-H3 Ref2VA, SAM 3.1, un text encoder Qwen3-VL 32B, VAE de vídeo y VAE de audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo H3, text encoder y VAE de vídeo, según nombres de fichero `int8_convrot`); fp32 para el VAE de audio; fp16 para SAM 3.1 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card declara explícitamente que no se afirma ninguna licencia para todo el repositorio) |
| Formato de pesos | safetensors (referenciados, no incluidos): `MiniMax-H3-Ref2VA-int8-convrot.safetensors`, `h3_character_swap_v1.5.safetensors`, `qwen3vl_32b_minimax_h3_int8_convrot.safetensors`, `minimax_h3_lynnreal_light_vae_int8_convrot.safetensors`, `minimax_h3_audio_vae_fp32.safetensors`, `sam3.1_multiplex_fp16.safetensors`, `taeh3.safetensors` |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un modelo. Distribuye un grafo de ComfyUI que orquesta varios componentes: un modelo generativo MiniMax-H3 en variante Ref2VA (referencia a vídeo/audio) cuantizado a int8, un LoRA de intercambio de personaje (`h3_character_swap_v1.5.safetensors`, fuerza 1 en el nodo 121), un text encoder Qwen3-VL de 32B en int8, un VAE de vídeo ligero en int8, un VAE de audio en fp32 y un checkpoint SAM 3.1 en fp16 para segmentación y tracking del sujeto. La composición final pasa por un compositor VDN identificado como `OpenVDN/vdn-minimax-h3`, etapa `stage_dmd_8nfe`.

La configuración guardada incluye detección SAM con umbral 0,5, un objeto y intervalo 1 (nodo 53), sigma shift de 12 para vídeo y 3 para audio (nodo 38), 1 megapíxel de preprocesado (nodo 45) y 0,6 megapíxeles de generación (nodo 20). La exportación está fijada a 24 fps, H.264 MP4, `yuv420p` y CRF 19 (nodo 42). La expresión de recuento de fotogramas del nodo 19 evalúa a 243 para la duración guardada de 10 segundos, aunque el autor recomienda empezar con clips de 3 a 5 segundos. No se documenta composición del dataset de entrenamiento, número de tokens ni uso de RLHF/DPO para ninguno de los componentes.

## Capacidades

- Sustitución de personaje en vídeo guiada por una imagen de referencia, manteniendo el tracking del sujeto a lo largo del clip.
- Segmentación y seguimiento de sujeto con SAM 3.1, con descripción textual del objetivo (posición, ropa, acción) en el nodo 50.
- Recorte dinámico y procesamiento de latentes enmascarados, separados para vídeo y audio.
- Composición por regiones locales sobre un lienzo sin recorte generado a partir de fotogramas redimensionados del original.
- Procesamiento de audio integrado: rama de codificación, muestreo y decodificación de audio, no un remux de la pista original.
- Exportación de vídeo a MP4 H.264 con parámetros de codificación predefinidos.
- No se documentan tool calling, function calling, capacidades de agente, modo thinking ni soporte multilingüe explícito.

## Casos de uso

- Prototipado de sustitución de personaje en postproducción: el grafo encadena SAM 3.1, el LoRA de swap y el compositor VDN, de modo que un editor puede validar un cambio de identidad en un clip corto de 3 a 5 segundos antes de invertir en un pipeline propio.
- Pruebas de vestuario y caracterización sobre metraje existente: al describir el sujeto en el nodo 50 por posición, ropa y acción, se puede aislar a un actor concreto en una escena con varias personas y evaluar variantes de aspecto.
- Evaluación de modelos de segmentación en vídeo: el paquete sirve como banco de pruebas reproducible para comparar el tracking de SAM 3.1 con umbrales e intervalos distintos, ya que esos parámetros están expuestos en el nodo 53.
- Demostraciones técnicas y material formativo: el workflow acompaña a un tutorial en vídeo del autor y a un workflow publicado en RunningHub, lo que lo hace útil para explicar un pipeline multimodal completo en un curso o taller.
- Investigación sobre preservación de fondo en edición generativa: la model card advierte de que el lienzo sin recorte proviene de fotogramas redimensionados, por lo que el grafo permite medir empíricamente la deriva de píxeles en zonas no enmascaradas.
- Integración en flujos de ComfyUI ya existentes: al depender de VideoHelperSuite, MaskVidExperiments y el nodo de audio de T8mars, el workflow se puede insertar como subgrafo en cadenas de posproducción más amplias que ya usen esos nodos.
- Auditoría de licencias y derechos en pipelines generativos: la estructura separa pesos, nodos personalizados, imagen de portada y material fuente, lo que facilita documentar qué componente cubre cada licencia antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el paquete no incluye certificación de compatibilidad ni benchmark de rendimiento, y que el tiempo de ejecución, la VRAM y la calidad de salida permanecen sin verificar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El pipeline referenciado combina un text encoder Qwen3-VL de 32B, un modelo H3, dos VAE y SAM 3.1, pero no se publican cifras de consumo.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en ninguna GPU consumer concreta.
- Opciones de despliegue: ComfyUI, con nodos personalizados de T8mars (audio MiniMax-H3), SAM, MaskVidExperiments y VideoHelperSuite. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de grafo.
- Latencia y throughput: no disponible. El autor no aporta tiempos de generación para la configuración guardada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros workflows de sustitución de personaje ni modelos comparables con parámetros, contexto o licencia verificables. Los componentes citados (MiniMax-H3, SAM 3.1, Qwen3-VL 32B) aparecen solo como dependencias referenciadas por nombre de fichero, sin datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un workflow. Los ficheros de modelo citados deben obtenerse por separado y el autor no proporciona URLs de descarga verificadas.
- No se afirma ninguna licencia para el repositorio. Workflow, pesos, nodos personalizados, portada, vídeo fuente, imagen de referencia y audio pueden tener derechos distintos y deben verificarse individualmente antes de redistribuir o usar comercialmente.
- Riesgo de selección errónea del sujeto: si la descripción SAM es imprecisa, el tracking puede fijar a la persona equivocada; hay que inspeccionar las previsualizaciones de máscara y recorte antes de generar.
- El grafo es la variante de reemplazo VDN8 de una sola etapa, no un pipeline de upscale de dos etapas 8+4; las notas desaconsejan apilar el antiguo Turbo LoRA.
- Sin clip de audio, la rama de codificación de audio puede fallar: no se incluye un fallback para vídeo silencioso.
- La preservación del fondo no está garantizada a nivel de píxel, porque el lienzo sin recorte procede de fotogramas redimensionados.
- El audio no es un remux de la pista original: pasa por codificación latente, muestreo y decodificación, con pérdida potencial de fidelidad.
- Hay discrepancias entre las notas del grafo y la configuración guardada: las notas mencionan un fichero Ref2VA distinto (terminado en `Raw2`) y recomiendan resoluciones coherentes pese a los valores de megapíxeles distintos (1 frente a 0,6). Conviene revisar el loader activo y las entradas conectadas.
- Un segundo cargador de imagen está guardado con `mode=4`; hay que comprobar su estado de bypass antes de confiar en él.
- La duración guardada es de 10 segundos (243 fotogramas), aunque el autor recomienda empezar con 3 a 5 segundos.
- Integridad de pesos, compatibilidad de extremo a extremo, VRAM y calidad de salida sin verificar. No debe inferirse éxito de una previsualización guardada ni del prefijo de un fichero.
- Riesgo de alucinación y sesgos: no documentados para este paquete; aplican los del modelo H3 subyacente, sobre el que no se aporta información.
- El material generado debe etiquetarse como sustitución sintética de personaje y usarse solo con material fuente autorizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/h3-character-swap-sam-vdn8-323
- Tutorial en vídeo del autor: https://www.youtube.com/watch?v=iuEmeHgHGIg
- Workflow en RunningHub: https://www.runninghub.ai/zh-cn/post/2113278202089521154?inviteCode=rh-v1111
- Workflow en Civitai: https://civitai.com/models/3018150
