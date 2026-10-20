# RunningHubAI/rh-superhuman-lora

## Resumen

rh-superhuman-lora es un adaptador LoRA publicado por RunningHubAI (cuenta de RunningHub, autor acreditado como @FOURBUNNY) para la generación de vídeo, no un modelo de lenguaje. El adaptador se ha entrenado sobre el modelo base identificado en la model card como `minimax-h3` y está pensado para inyectar secuencias de combate "sobrehumano": golpes explosivos, agresividad aérea, tensión física y energía de batalla a gran escala. Se distribuye como un único fichero `SuperHunman.safetensors` de 148 MiB dentro de un repositorio de 0,2 GB, con etiquetas `comfyui` y `lora`, lo que sitúa su uso típico en flujos de ComfyUI o en la plataforma en la nube de RunningHub.

La relevancia del artefacto es acotada y muy específica: no aporta capacidades nuevas de razonamiento ni de texto, sino que modula el estilo y la física de las animaciones generadas por el modelo base. La model card recomienda una combinación concreta de tres LoRAs con pesos escalonados —Combat Base V2 a 0,65, Motion Repair V2 a 0,35 y Superhuman Combat (este adaptador) a 0,65—, de modo que el resultado final depende tanto de este fichero como de los otros dos y del propio modelo base.

No hay información pública sobre arquitectura interna del adaptador (rango, capas objetivo), datos de entrenamiento, número de pasos, licencia explícita ni evaluaciones cuantitativas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 19 de octubre de 2026, por lo que se trata de una publicación reciente y sin validación comunitaria independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; arquitectura del modelo base no disponible |
| Parámetros totales | No disponible. El adaptador ocupa 148 MiB en safetensors (≈0,15 GB); rango y número de parámetros no documentados |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Es un modelo de generación de vídeo; la ventana de contexto textual del codificador de prompts del modelo base no se especifica |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no hay variantes GGUF, FP8 ni cuantizaciones documentadas |
| Idiomas soportados | No disponible. La documentación del repositorio está en inglés y chino; no se declaran idiomas de prompt |
| Licencia | No disponible. La model card indica: "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license" |
| Formato de pesos | safetensors (`SuperHunman.safetensors`, 148 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base `minimax-h3` para modificar su comportamiento generativo. No se publica información sobre el rango del adaptador, las capas objetivo, el optimizador, la resolución de entrenamiento, el número de pasos ni la composición del dataset. Tampoco se documenta si el adaptador afecta al módulo de texto, al de difusión de vídeo o a ambos.

La model card describe el efecto buscado en términos cualitativos: "explosive force, aerial aggression, physical tension, and large-scale superhuman battle energy". El autor propone combinarlo con otros dos adaptadores de la misma familia (Combat Base V2, que refuerza la estructura de ataque y respuesta, y Motion Repair V2, que estabiliza la continuidad del movimiento y corrige roturas en acciones de alta dinámica), con pesos recomendados de 0,65 / 0,35 / 0,65 respectivamente. No se indica si hubo RLHF, DPO ni ninguna fase de ajuste por preferencias; en el contexto de un LoRA de vídeo, ese tipo de etapas no resulta habitual.

## Capacidades

- Generación de vídeo con temática de combate cuerpo a cuerpo y coreografías de acción, aplicada sobre el modelo base `minimax-h3`.
- Modulación de estilo: incorpora explosividad en los impactos, tensión física y energía de batalla a gran escala según la descripción del autor.
- Enfatiza la "agresividad aérea", es decir, ataques y desplazamientos en el aire dentro de la secuencia.
- Composabilidad con otros LoRAs: el autor documenta una combinación de tres adaptadores con pesos escalonados para equilibrar estructura de combate, continuidad de movimiento y energía.
- Integración en flujos ComfyUI mediante carga de LoRA estándar.
- Ejecución en la plataforma RunningHub, tanto en interfaz web como mediante API.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; no es un modelo de lenguaje.

## Casos de uso

- Previsualización de escenas de acción para cine o serie: el adaptador se aplica sobre `minimax-h3` en ComfyUI para generar animáticas de peleas con impacto y velocidad creíbles antes del rodaje, reduciendo el coste de las pruebas de especialistas.
- Prototipado de tráilers para videojuegos de lucha o acción: permite iterar sobre variantes de combate aéreo y golpes explosivos con el combo 0,65 / 0,35 / 0,65, ajustando el peso del LoRA para modular la intensidad.
- Diseño de coreografías de artes marciales: se generan secuencias de referencia que el equipo de especialistas puede revisar y adaptar, usando Motion Repair V2 en paralelo para mantener la continuidad del movimiento.
- Contenido para redes sociales de temática anime o acción: cortes cortos de combate generados por lotes a través de la API de RunningHub, con el adaptador aplicado de forma consistente entre piezas de una misma campaña.
- Pruebas de concepto de efectos visuales: generación de placas de previsualización con energía de batalla a gran escala para discutir dirección de fotografía y ritmo de montaje con el cliente.
- Ilustración de storyboards dinámicos: conversión de descripciones textuales de peleas en clips breves que sirven como referencia de encuadre y timing para el equipo de animación.
- Docencia o divulgación sobre animación de acción: comparación de resultados con y sin el LoRA para explicar cómo un adaptador de bajo rango altera la física percibida de una secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, evaluación humana, comparativas A/B) ni el repositorio ofrece scripts de evaluación. Tampoco se han encontrado resultados independientes en la búsqueda web realizada.

## Requisitos de hardware

- Los pesos del adaptador suman 148 MiB, un coste de VRAM y disco despreciable frente al modelo base.
- El requisito real de VRAM viene determinado por `minimax-h3`, cuyo tamaño, resolución de vídeo soportada y precisión de inferencia no se documentan en el repositorio: no disponible.
- GPU recomendadas: no disponible. Al tratarse de un modelo de generación de vídeo, es previsible que requiera GPU de datacenter (A100, H100) o, como mínimo, GPU de consumo de gama alta con suficiente VRAM, pero el autor no publica cifras ni configuraciones validadas.
- Viabilidad en GPU de consumo: no confirmada. No hay información sobre si el modelo base cabe en tarjetas de 12, 16 o 24 GB.
- Opciones de despliegue: ComfyUI con nodo de carga de LoRA; plataforma RunningHub (web y API) como alternativa gestionada en la nube.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Función | Peso recomendado en el combo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-superhuman-lora (Superhuman Combat) | LoRA sobre `minimax-h3` | Energía de combate, agresividad aérea, tensión física | 0,65 | No disponible (copyright del autor) | Hugging Face, RunningHub |
| Combat Base V2 | LoRA (misma familia, presumiblemente sobre `minimax-h3`) | Estructura de ataque y respuesta, interacción de combate | 0,65 | No disponible | RunningHub |
| Motion Repair V2 | LoRA (misma familia, presumiblemente sobre `minimax-h3`) | Continuidad de movimiento y corrección de roturas dinámicas | 0,35 | No disponible | RunningHub |

No se dispone de datos de parámetros, contexto ni rendimiento cuantitativo de estos adaptadores, por lo que la comparación se limita a la función declarada y al peso sugerido. No se han identificado en la información disponible otros LoRAs de combate comparables fuera de esta familia.

## Limitaciones y advertencias

- Licencia no explicitada: la model card remite a la licencia del proyecto original o del modelo base, sin especificar términos de uso comercial. Es imprescindible verificar la licencia de `minimax-h3` antes de cualquier despliegue en producción.
- Ausencia total de documentación técnica: no se publican rango del LoRA, capas objetivo, dataset, hiperparámetros ni proceso de entrenamiento, lo que impide reproducir o auditar el adaptador.
- Sin evidencia cuantitativa: no hay benchmarks, comparativas A/B ni validación de terceros; las afirmaciones sobre "explosive force" y "aerial aggression" son cualitativas y provienen del propio autor.
- Dependencia estricta del modelo base: el adaptador está ajustado para `minimax-h3`; aplicarlo sobre otra versión o familia puede degradar la calidad o producir artefactos.
- Riesgo de artefactos en movimiento: en secuencias de alta dinámica son frecuentes las roturas anatómicas y la pérdida de continuidad, motivo por el cual el autor recomienda combinarlo con Motion Repair V2.
- Sensibilidad al peso del LoRA: la efectividad depende del valor escalar elegido (0,65 en la combinación recomendada); valores altos pueden saturar el estilo y degradar la coherencia de la escena.
- Contenido violento: la temática de combate puede activar filtros de moderación en plataformas de despliegue y requiere revisión de políticas de uso en aplicaciones públicas.
- Idiomas: no se declaran idiomas soportados para los prompts; la documentación solo existe en inglés y chino, sin guía en castellano.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación de octubre de 2026, sin historial de mantenimiento ni issues.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces encontrados eran ajenos al repositorio y no se incluyen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-superhuman-lora
- Página original del modelo en RunningHub: https://www.runninghub.ai/model/public/2109351497645838337
- Página del autor (@FOURBUNNY): https://www.runninghub.ai/user-center/2092843565587107841
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejecución de Seedance 2.5 vía API: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-superhuman-lora/blob/main/README_cn.md
