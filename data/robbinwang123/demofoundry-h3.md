# RobbinWang123/demofoundry-h3

## Resumen

DemoFoundry H3 es un adaptador LoRA de rango 32 que especializa el renderizador Ref2VA del modelo MiniMax-H3 en la generación de demostraciones robóticas fotorrealistas. Lo publica el usuario RobbinWang123 como artefacto asociado al artículo arXiv 2611.34671 y al proyecto DemoFoundry, y su funcionamiento consiste en tomar un vídeo proxy simulado junto con una imagen de referencia real de la misma cámara para producir observaciones RGB que siguen el movimiento del proxy pero adoptan la apariencia de la escena real. El resultado es un pipeline de video-to-video condicionado por referencia que permite convertir trayectorias simuladas en material visual utilizable para entrenamiento de políticas robóticas.

El adaptador no es un modelo autónomo: requiere MiniMax-H3 (revisión 42ed227) como modelo base y solo modifica las proyecciones query, key, value y output del transformer Ref2VA mediante matrices de bajo rango en FP32. El checkpoint publicado corresponde al paso 7.000 de un entrenamiento de 158 fotogramas, con un tamaño de repositorio de 0,3 GB. Su relevancia actual radica en que aborda uno de los cuellos de botella clásicos de la robótica basada en aprendizaje: la brecha entre simulación y realidad visual (sim-to-real gap), permitiendo reutilizar datos simulados con apariencia realista sin necesidad de grabar demostraciones físicas.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; cualquier especificación no documentada por el autor se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre transformer Ref2VA de MiniMax-H3; adaptador video-to-video condicionado por referencia |
| Parametros totales | no disponible (adaptador de 0,3 GB en repo; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en FP32; el modelo base no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community) |
| Formato de pesos | safetensors (`DemoFoundry-H3.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que actualiza exclusivamente las proyecciones query, key, value y output del transformer Ref2VA del modelo MiniMax-H3. Las matrices de bajo rango se almacenan en FP32 y se aplican sobre la revisión 42ed227 del modelo base, por lo que la arquitectura subyacente (transformer de difusión para renderizado condicionado) queda heredada íntegramente de MiniMax-H3. El pipeline declarado es `robotics` y las etiquetas del repositorio incluyen `video-to-video` y `reference-conditioned`, lo que confirma que la tarea es la traducción de un vídeo proxy simulado a observaciones RGB fotorrealistas guiadas por una imagen de referencia estática de la misma cámara.

El checkpoint publicado corresponde al paso 7.000 de una ejecución de entrenamiento de 158 fotogramas. No se documentan en la model card el número total de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO; esos datos deben consultarse en el artículo arXiv 2611.34671. La innovación técnica destacable es el esquema de condicionamiento dual: la imagen de referencia aporta la apariencia (texturas, iluminación, materiales) mientras que el vídeo proxy aporta la cinemática, de modo que el renderizador debe transferir movimiento entre dominios visuales distintos sin perder coherencia temporal.

## Capacidades

- Renderizado video-to-video condicionado por referencia: transforma un vídeo proxy simulado en observaciones RGB que siguen el movimiento del proxy y adoptan la apariencia de una imagen real de la misma cámara.
- Generación de demostraciones robóticas sintéticas con apariencia realista a partir de trayectorias simuladas (ejemplo documentado: demostración de AgiBot World en la que el gripper levanta una tostada).
- Transferencia de apariencia entre dominios: la imagen de referencia controla texturas, iluminación y materiales, independientemente del dominio del proxy.
- Coherencia temporal a lo largo de secuencias de 158 fotogramas (longitud de la ejecución de entrenamiento documentada).
- Integración con el ecosistema MiniMax-H3: hereda las capacidades del renderizador Ref2VA del modelo base.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni procesamiento de lenguaje natural; el modelo es específicamente de renderizado visual para robótica.

## Casos de uso

- Generación de datos de entrenamiento para políticas robóticas: a partir de trayectorias generadas en simulador, el adaptador produce observaciones RGB realistas que pueden alimentar el entrenamiento de políticas de imitación sin necesidad de grabar demostraciones físicas adicionales.
- Reducción del sim-to-real gap visual: se renderizan los mismos movimientos simulados con la apariencia de la cámara real del robot, de modo que las políticas entrenadas ven distribuciones visuales más cercanas a las de despliegue.
- Aumento de datasets existentes: si se dispone de una imagen de referencia de una escena real y de proxies simulados de nuevas trayectorias, se pueden sintetizar variaciones de demostraciones sobre esa misma escena.
- Prototipado rápido de tareas de manipulación: antes de invertir en grabaciones reales, se valida visualmente si una trayectoria simulada es plausible en la escena objetivo (por ejemplo, el caso documentado del gripper levantando una tostada en AgiBot World).
- Evaluación de controladores en condiciones visuales realistas: los vídeos renderizados permiten probar módulos de percepción y control sobre imágenes con apariencia real manteniendo la ground truth cinemática del simulador.
- Investigación en renderizado condicionado por referencia: el adaptador sirve como base para estudiar transferencia de apariencia y coherencia temporal en modelos de difusión de vídeo aplicados a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base MiniMax-H3, cuyos requisitos no se detallan en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor proporciona código de inferencia específico en el repositorio GitHub de DemoFoundry (ruta `inference/h3`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DemoFoundry H3 | LoRA rango 32 sobre MiniMax-H3 Ref2VA | no disponible (repo de 0,3 GB) | no disponible | MiniMax H3 Community | Hugging Face (RobbinWang123/demofoundry-h3) |
| MiniMax-H3 (base) | Transformer Ref2VA para renderizado condicionado | no disponible | no disponible | MiniMax H3 Community | Hugging Face (MiniMaxAI/MiniMax-H3, rev. 42ed227) |
| Alternativas de video-to-video para robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del modelo base: el adaptador solo funciona con MiniMax-H3 en la revisión 42ed227; otras revisiones pueden romper la compatibilidad de las proyecciones modificadas.
- No es un modelo autónomo: sin el renderizador Ref2VA subyacente no puede ejecutarse; el repositorio de 0,3 GB contiene únicamente las matrices LoRA.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, podría reproducir sesgos visuales del dataset de entrenamiento de MiniMax-H3 y del dataset de demostraciones robóticas empleado.
- Riesgo de artefactos visuales: al ser un adaptador entrenado sobre 158 fotogramas y en el paso 7.000, la generalización a escenas, cámaras o tareas fuera de la distribución de entrenamiento no está garantizada.
- Limitaciones de idioma: no aplica directamente (modelo visual), pero no se documentan capacidades multilingües ni de texto.
- Restricciones de licencia: se distribuye bajo la MiniMax H3 Community License Agreement, que puede imponer condiciones adicionales al uso comercial; es necesario revisar el archivo LICENSE.model y el NOTICE antes de un despliegue en producción.
- Ausencia de benchmarks públicos: no hay métricas de calidad de renderizado, FID, coherencia temporal ni tasas de éxito en políticas entrenadas con estos datos, lo que dificulta una evaluación objetiva previa a su adopción.
- Madurez temprana: el repositorio registra 0 descargas y 2 likes en el momento de la consulta, lo que sugiere un artefacto de investigación reciente sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobbinWang123/demofoundry-h3
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Revisión del modelo base utilizada: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/42ed227ee7df40d41602854ae760620d6eb651fe
- Página del proyecto: https://robbinw.github.io/DemoFoundry-Web/
- Artículo (arXiv 2611.34671): https://arxiv.org/abs/2611.34671
- Código de inferencia: https://github.com/RobbinW/DemoFoundry/tree/main/inference/h3
- Licencia del modelo: https://huggingface.co/RobbinWang123/demofoundry-h3/blob/main/LICENSE.model
