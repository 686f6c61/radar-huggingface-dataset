# kei1975/stable-audio-open-small

## Resumen

Stable Audio Open Small es un modelo de generacion de audio a partir de texto (text-to-audio) desarrollado por Stability AI. Esta ficha corresponde a un espejo no modificado (`kei1975/stable-audio-open-small`) del modelo original `stabilityai/stable-audio-open-small`, publicado para permitir su descarga sin necesidad de cuenta en Hugging Face. El modelo se distribuye bajo la Stability AI Community License y esta pensado para sintetizar efectos de sonido y audio corto a partir de descripciones en lenguaje natural.

El repositorio contiene pesos en formato `safetensors` con un total de 497.239.458 parametros (aproximadamente 497 millones) y un tamano de 1,7 GB. La libreria asociada es `stable-audio-tools`, el framework de Stability AI para modelos generativos de audio. El pipeline declarado en Hugging Face es `text-to-audio`.

La relevancia de este espejo es practica: replica exactamente el modelo original de Stability AI y facilita su integracion en flujos automatizados (por ejemplo, herramientas de edicion de video que descargan el modelo sin autenticacion). No introduce cambios en pesos ni en arquitectura respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generativo de audio de la familia Stable Audio; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 497.239.458 (segun safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo genera audio; la entrada de texto no declara idiomas) |
| Licencia | Stability AI Community License (`stabilityai-community`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo pertenece a la familia Stable Audio y se ejecuta mediante la libreria `stable-audio-tools`, que agrupa los componentes de generacion de audio de Stability AI. El espejo no incluye notas sobre el proceso de entrenamiento, el volumen de datos, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

Tampoco se detallan innovaciones tecnicas especificas (por ejemplo, esquemas de difusion, decodificacion o attention) en la model card disponible. Cualquier afirmacion adicional sobre arquitectura o entrenamiento requeriria consultar la documentacion oficial de Stability AI, que no forma parte de la informacion suministrada.

## Capacidades

- Generacion de audio a partir de texto (text-to-audio): sintetiza audio corto a partir de una descripcion textual.
- Generacion de efectos de sonido y audio ambiental, segun el proposito habitual de la familia Stable Audio Open.
- Integracion con la libreria `stable-audio-tools` para carga e inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no declaradas.
- Capacidades especiales (vision, audio de entrada, thinking mode): no disponibles.

## Casos de uso

- Edicion de video automatizada: descarga del modelo sin autenticacion para generar efectos de sonido y ambientes que acompanen a clips, integrado en herramientas como las que motivan este espejo (Moon Shadow LazyCut).
- Prototipado de diseno sonoro: generacion rapida de efectos a partir de prompts de texto para maquetas de videojuegos o animaciones.
- Creacion de bibliotecas de audio de stock: produccion por lotes de efectos de sonido cortos a partir de descripciones textuales.
- Postproduccion de podcast y video: generacion de ambientes y sonidos de fondo bajo demanda sin depender de bancos de audio externos.
- Investigacion en generacion de audio: uso como referencia reproducible al ser un espejo identico del modelo original, util para comparativas y experimentos.
- Integracion en pipelines CI/CD de contenido multimedia: descarga automatizada del modelo en entornos sin credenciales de Hugging Face para pruebas de generacion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 497 millones de parametros y pesos de 1,7 GB, la huella en memoria es moderada, pero no se especifican requisitos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el tamano reducido de los pesos sugiere que podria ejecutarse en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: `stable-audio-tools` (libreria declarada). No se indica soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Audio Open Small (este espejo) | 497.239.458 | no disponible | Stability AI Community License | Hugging Face (espejo) |
| Stable Audio Open Small (original, `stabilityai/stable-audio-open-small`) | no disponible en la informacion | no disponible | Stability AI Community License | Hugging Face (requiere cuenta) |
| Otras alternativas text-to-audio | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor del repositorio es `kei1975`, no Stability AI; la responsabilidad sobre los pesos recae en el modelo original.
- Licencia restrictiva: Stability AI Community License; el uso comercial esta sujeto a los terminos de dicha licencia y a la Stability AI Acceptable Use Policy.
- No se declaran idiomas soportados para los prompts de texto.
- No hay informacion sobre sesgos, tasas de alucinacion ni calidad subjetiva del audio generado.
- No se especifican limitaciones de longitud de audio, contexto ni resolucion.
- Al ser un modelo generativo, el contenido sintetizado puede no ser fiel al prompt; no hay evaluaciones publicadas en la informacion disponible.
- Para produccion, conviene verificar los terminos exactos de la licencia y de la politica de uso aceptable antes del despliegue.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/kei1975/stable-audio-open-small
- Modelo original: https://huggingface.co/stabilityai/stable-audio-open-small
- Politica de uso aceptable de Stability AI: https://stability.ai/use-policy
