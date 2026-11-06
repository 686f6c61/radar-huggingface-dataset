# mbao827/seeing_the_unseen

## Resumen

Seeing the Unseen es un modelo de generacion de video imagen-a-video desarrollado por un equipo academico de la National University of Singapore, Nanyang Technological University y University of Oxford, presentado en NeurIPS 2026. El modelo aborda un problema concreto de la generacion de video fisicamente plausible: los modelos de difusion tienden a producir movimiento incoherente porque no razonan sobre la fisica de la escena ni sobre las superficies que solo se hacen visibles despues de que los objetos se muevan. La propuesta combina un simulador de particulas aprendido (PGDS) con un campo de movimiento visible-invisible (VIMF) que se inyecta en el modelo de difusion de video.

Tecnicamente es un fine-tuning del transformer de Wan2.2-TI2V-5B: se amplian los canales latentes de entrada de 48 a 144 mediante canales inicializados a cero, de modo que la guia de movimiento se incorpora como condicionamiento adicional sin destruir el conocimiento previo del modelo base. Solo se publican los pesos del transformer ajustado (unos 10 GB) y el simulador PGDS (unos 9 MB); el VAE, el codificador de texto y el scheduler se cargan del checkpoint original de Wan2.2.

Su relevancia radica en que mejora la consistencia fisica sin parametros fisicos especificados manualmente: el PGDS alcanza un 95,92% de precision estricta media en siete escenarios de Physion++ y el modelo completo logra la mayor adherencia semantica en los siete escenarios y la mejor nocion de sentido fisico comun en seis de siete, con una preferencia humana global un 44,0% superior a Wan2.2-5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D para video (Wan2_2Transformer3DModel) con condicionamiento VIMF; simulador de particulas PGDS auxiliar |
| Parametros totales | no disponible (repo de 10,0 GB, dominado por el transformer de ~10 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de Wan2.2-TI2V-5B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformer) y .pth (PGDS) |
| Canales latentes de entrada | 144 (ampliados desde 48, con canales nuevos inicializados a cero) |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B |
| Libreria | diffusers |
| Tarea | image-to-video |

## Arquitectura y entrenamiento

El modelo parte del transformer de difusion 3D de Wan2.2-TI2V-5B y lo modifica para aceptar una senal de movimiento adicional. La innovacion central es la inyeccion del campo VIMF a traves de 96 canales latentes nuevos (de 48 a 144) inicializados a cero, lo que permite un ajuste fino estable sobre el modelo preentrenado. La guia de movimiento se descompone en dos videos de seguimiento: uno de movimiento visible en la referencia y otro de movimiento emergente futuro, que cubre las superficies que solo aparecen tras el desplazamiento de los objetos.

El componente fisico es PGDS, un simulador de particulas aprendido que predice como se movera la escena a partir de una unica imagen sin parametros fisicos especificados manualmente. El entrenamiento combina el ajuste del transformer sobre el modelo base con el aprendizaje del simulador; la model card no detalla el numero de tokens de video, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo se apoya en Wan2.2, SAM-3D-Objects y SAM3.

## Capacidades

- Generacion de video a partir de una sola imagen (image-to-video) con control de movimiento.
- Simulacion de fisica aprendida: prediccion del movimiento de la escena sin parametros fisicos manuales.
- Modelado de movimiento visible y emergente, incluyendo superficies que se revelan tras el desplazamiento de objetos.
- Mayor consistencia fisica y adherencia semantica frente al modelo base Wan2.2-5B.
- Integracion con el ecosistema diffusers para carga y ejecucion del transformer.
- No se documentan capacidades de tool calling, agentes, vision multimodal de entrada adicional ni audio.

## Casos de uso

- Prototipado de video fisicamente plausible en investigacion: el modelo sirve para experimentar con condicionamiento de movimiento y evaluar consistencia fisica en escenas sinteticas, apoyandose en el PGDS y el VIMF.
- Generacion de animaciones a partir de fotografias de producto: dada una imagen estatica, el modelo puede animar objetos con movimiento coherente y revelar superficies ocultas al rotar o desplazar el objeto.
- Simulacion visual para educacion: escenas donde se muestra como caen, ruedan o colisionan objetos, usando la fisica aprendida para mantener la coherencia del movimiento.
- Previsualizacion en pipelines de VFX: generar clips de referencia con movimiento fisicamente consistente antes de la produccion final.
- Investigacion en world models: usar el par PGDS + VIMF como banco de pruebas para estudiar la transferencia de simulacion de particulas a difusion de video.
- Evaluacion comparativa de generadores de video: emplear los escenarios de Physion++ y las metricas de consistencia fisica para contrastar modelos, dado que el modelo publica resultados en siete escenarios.
- Generacion de contenido para demostraciones academicas: crear clips de ejemplo para papers y paginas de proyecto con el checkpoint del transformer y el PGDS.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| PGDS, precision estricta media (Acc-V) en 7 escenarios Physion++ | 95,92% |
| Adherencia semantica (Semantic Adherence) | Mejor en los 7 escenarios |
| Sentido fisico comun (Physical Commonsense) | Mejor en 6 de 7 escenarios |
| Preferencia humana global frente a Wan2.2-5B | +44,0% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otras metricas de texto, al tratarse de un modelo de generacion de video.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el transformer pesa unos 10 GB, por lo que se requiere al menos esa cantidad de memoria para los pesos, mas la del VAE, el codificador de texto y el scheduler de Wan2.2.
- GPU recomendadas: no especificadas en la model card; por el tamano del transformer, se situa en el rango de GPU de datacenter (A100, H100) y GPU consumer de gama alta con suficiente VRAM.
- Cabe en GPU consumer: no confirmado; depende de la cuantizacion y del resto de componentes de Wan2.2, no documentados.
- Opciones de despliegue: la model card remite al repositorio de codigo para instalacion e inferencia; se usa la libreria diffusers. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seeing the Unseen | no disponible (~10 GB transformer) | no disponible | Image-to-video con fisica aprendida (PGDS + VIMF) | Apache 2.0 | Pesos en Hugging Face |
| Wan2.2-TI2V-5B | 5B (segun nombre) | no disponible | Image-to-video base | no disponible en la informacion | Hugging Face (Wan-AI) |
| Otros generadores de video fisico | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye datos de otros generadores de video comparables. Frente a Wan2.2-5B, Seeing the Unseen reporta +44,0% de preferencia humana global y mejor consistencia fisica.

## Limitaciones y advertencias

- Solo se publican los pesos del transformer ajustado y el PGDS; es necesario descargar el VAE, el codificador de texto y el scheduler desde Wan2.2-TI2V-5B para poder ejecutarlo.
- No se documentan sesgos conocidos, pero al derivar de un modelo de difusion de video puede heredar sesgos del dataset de entrenamiento original.
- Riesgo de alucinacion visual: la fisica aprendida puede fallar en escenas fuera de la distribucion de Physion++.
- Limitaciones de contexto e idioma no documentadas; la model card no especifica idiomas soportados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Wan2.2 y de los componentes auxiliares.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No hay instrucciones de inferencia en la model card; se remite al repositorio de codigo externo, lo que anade dependencia de terceros para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/mbao827/seeing_the_unseen
- Paper (arXiv): https://arxiv.org/abs/2611.00293v1
- Pagina del proyecto: https://vid-gen.github.io/seeing_the_unseen/
- Codigo: https://github.com/vid-gen/seeing_the_unseen_code
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Wan2.2 (repositorio): https://github.com/Wan-Video/Wan2.2
- SAM-3D-Objects: https://github.com/facebookresearch/sam-3d-objects
- SAM3: https://huggingface.co/facebook/sam3
