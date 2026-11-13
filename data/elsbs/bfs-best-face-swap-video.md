# Elsbs/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) publicado por el usuario Elsbs sobre el modelo de generacion de video Lightricks LTX-2.3 y LTX-2.5. Su funcion es realizar intercambio de identidad facial (face swap / head swap) en video, tomando la identidad de un primer fotograma de referencia y aplicandola sobre el movimiento de un video guia. Se distribuye como un repositorio de 13,4 GB en formato diffusers, con pipeline declarado de image-to-video.

El modelo no es un modelo fundacional autonomo: es un adaptador que requiere el modelo base LTX-2 de Lightricks para funcionar. La model card describe dos flujos de trabajo: la tecnica de anclaje en el fotograma 0 (Frame 0 Anchoring) en las versiones V1, y un flujo de plantilla persistente introducido en la version V3. Tambien incluye ejemplos especificos para LTX-2.5. La relevancia actual reside en el interes creciente por herramientas de transformacion de identidad en video para VFX, prototipado cinematografico e investigacion de identidad digital.

La licencia es la LTX-2 Community License Agreement, que impone obligaciones legales y eticas explicitas sobre el consentimiento de las personas cuya imagen se procesa. El autor declara que el modelo esta pensado para investigadores, artistas de VFX y cineastas, y exime de responsabilidad por usos indebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo de difusion de video LTX-2 de Lightricks |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (license: other) |
| Formato de pesos | diffusers (repositorio de 13,4 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador IC-LoRA, es decir, un LoRA de contexto que se aplica sobre el modelo de difusion de video LTX-2 de Lightricks (versiones 2.3 y 2.5). La arquitectura subyacente es la del modelo base LTX-2, un modelo de difusion para generacion de video; el adaptador modifica los pesos para condicionar la generacion a una identidad facial de referencia y a un video guia de movimiento.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento, ni sobre si se emplearon tecnicas de RLHF o DPO. La model card describe dos innovaciones de flujo de trabajo: la tecnica de anclaje en el fotograma 0 (Frame 0 Anchoring), que preserva la identidad proporcionada en el primer fotograma mientras sigue el movimiento del video guia, y el flujo de plantilla persistente introducido en V3. No se detalla la arquitectura interna del adaptador ni el rango del LoRA.

## Capacidades

- Intercambio de identidad facial (face swap) y de cabeza (head swap) en video.
- Generacion de video condicionada a imagen (image-to-video) mediante el pipeline de diffusers.
- Transferencia de identidad a partir de un fotograma de referencia (Frame 0 Anchoring).
- Transformacion video-a-video (video-to-video) siguiendo el movimiento de un video guia.
- Compatibilidad con los modelos base LTX-2.3 y LTX-2.5.
- Flujo de trabajo de plantilla persistente en la version V3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue, por tratarse de un modelo generativo de video.

## Casos de uso

- Postproduccion VFX: sustitucion de la identidad de un actor por la de un doble o especialista en planos concretos, manteniendo el movimiento original del video guia mediante el anclaje en el fotograma 0.
- Prototipado cinematografico (previsualizacion): generar versiones preliminares de escenas con una identidad concreta antes del rodaje, para validar casting o continuidad visual.
- Investigacion sobre identidad digital: estudiar la fidelidad de la transferencia de identidad en video y sus limites en condiciones de movimiento, oclusion o cambios de iluminacion.
- Doblaje visual y localizacion: adaptar la identidad facial de un presentador en contenido grabado para versiones regionales, con el consentimiento explicito del titular de la imagen.
- Creacion de contenido para redes o publicidad: generar variantes de un mismo anuncio con distintas identidades aprobadas, reutilizando el movimiento de un video base.
- Pruebas de robustez de sistemas de deteccion de deepfakes: emplear el modelo como generador de muestras sinteticas controladas para evaluar clasificadores de video manipulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un adaptador sobre LTX-2, los requisitos vendran determinados por el modelo base y el pipeline de difusion de video.
- GPU recomendadas: no disponible; el modelo base LTX-2 requiere previsiblemente GPUs de gama alta, pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es diffusers, por lo que el despliegue se realizaria a traves de ese ecosistema; no se documentan otras opciones como vLLM, llama.cpp u Ollama (no aplicables a un modelo de difusion de video).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el modelo depende del modelo base Lightricks LTX-2.3 y LTX-2.5, pero no se aportan datos de rendimiento ni de alternativas de face swap en video.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS-Best-Face-Swap-Video | no disponible | no disponible | no disponible | LTX-2 Community License | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere consentimiento legal explicito y derechos sobre la imagen de cualquier persona procesada; el uso sin consentimiento puede infringir normativa local e internacional sobre medios sinteticos.
- Riesgo elevado de uso indebido (deepfakes, suplantacion de identidad); el autor declara no asumir responsabilidad por el mal uso.
- La licencia LTX-2 Community License Agreement es de tipo "other" e impone condiciones especificas; debe revisarse antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al operar sobre identidades faciales puede heredar sesgos del modelo base en cuanto a demografia, iluminacion o tipos de rostro.
- Riesgo de alucinacion visual: artefactos, inconsistencias de identidad entre fotogramas o deformaciones en movimientos rapidos u oclusiones, no cuantificado en la informacion disponible.
- No se especifican idiomas soportados ni limitaciones de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- El autor del modelo card (Alissonerdx) no coincide con el autor del repositorio en Hugging Face (Elsbs); conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elsbs/BFS-Best-Face-Swap-Video
- Repositorio referenciado en los ejemplos: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video
- Video de demostracion del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
