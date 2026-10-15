# KaliberAI/vjepa2-1-conveyor30-rgb-states-interaction-8to30

## Resumen

V-JEPA 2.1 conveyor interaction trajectories (RGB + target states, 8 → 30) es un modelo de predicción de trayectorias 3D de objetos desarrollado por KaliberAI. A partir de ocho fotogramas RGB de escena completa y ocho estados 3D pasados del objeto objetivo, predice un segundo de movimiento futuro (30 pasos a 30 FPS) en coordenadas XYZ y velocidades vXYZ. El modelo se apoya en un backbone V-JEPA 2.1 ViT-B congelado (destilado desde ViT-G, entrada 384×672) y añade componentes de trayectoria e interacción entrenados desde cero.

La innovación principal es una rama de interacción visual condicionada por el objetivo: mediante tokens de objeto aprendidos y atención directa a las características de escena, el modelo aprende a usar el contexto visual de los objetos circundantes para mejorar las previsiones de colisión, sin recibir en inferencia los estados medidos de esos otros objetos. La corrección de trayectoria no está limitada por un umbral de probabilidad de contacto, y el pronóstico es totalmente aprendido, sin rollout físico.

Se trata de un checkpoint determinista de interacción de un segundo (mejor validación en la época 23), evaluado sobre un conjunto específico de transporte por cinta (conveyor). Está pensado para escenarios de manipulación y logística donde varios objetivos pueden compartir la misma escena codificada y predeterminarse en paralelo. No es un modelo de lenguaje ni un `AutoModel` de Transformers, sino un modelo PyTorch a medida cuya distribución principal es el archivo `best.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (V-JEPA 2.1 ViT-B destilado desde ViT-G) congelado como codificador, más decodificador de trayectoria de 256 canales y rama de interacción visual condicionada por objetivo de 192 canales |
| Parametros totales | no disponible (backbone ViT-B congelado más decodificador y rama de interacción; recuento exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 fotogramas RGB de escena + 8 estados 3D pasados del objetivo (histórico de 7/30 s a 30 FPS); horizonte de predicción de 30 pasos (1 s) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch `best.pt`; no se documentan cuantizaciones alternativas) |
| Idiomas soportados | no aplica / no disponible (modelo de visión y trayectoria, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `best.pt` (checkpoint PyTorch, `torch.load(..., weights_only=True)`); backbone separado `vjepa2_1_vitb_dist_vitG_384.pt` |

## Arquitectura y entrenamiento

El modelo combina un codificador V-JEPA 2.1 ViT-B congelado (la versión destilada de ViT-G, `vjepa2_1_vitb_dist_vitG_384.pt`) con dos cabezas entrenadas desde cero. El codificador redimensiona la entrada a 384×672 y produce cuatro grupos temporales de 24×42 tokens espaciales de 768 dimensiones (1008 tokens por grupo). Sobre esas características actúa un decodificador de trayectoria de 256 canales, aumentado por una rama de interacción visual de 192 canales condicionada por el objetivo, que incorpora tokens de objeto aprendidos, atención directa a las características de escena y una corrección de trayectoria aprendida. La salida incluye, además de la trayectoria, `contact_probabilities` con tres ranuras de compañero aprendidas (30 bins temporales más la opción de no contacto); estas ranuras no corresponden a identificadores de seguimiento anotados.

El entrenamiento utilizó 30.000 ventanas procedentes de 454 grabaciones, con escenas de pelotas y huevos, configuraciones de uno y varios objetos, movimiento de cinta activo y detenido, interacciones con raíl, rebotes y grabaciones específicas de colisión entre objetos. La supervisión cubre el movimiento relativo del compañero, el momento de contacto y el cambio de velocidad, junto con las pérdidas de trayectoria y un muestreo consciente de la interacción. Las anotaciones de compañeros se usan solo como supervisión, no como entrada. Validación y test contienen 3.000 ventanas cada uno, con particiones disjuntas por grabación. El pronóstico es enteramente aprendido, sin rollout físico ni entrada de estados medidos de compañeros.

## Capacidades

- Predicción determinista de movimiento 3D de objetos: genera 30 pasos futuros (1 s a 30 FPS) en formato XYZ/vXYZ a partir de 8 fotogramas RGB y 8 estados pasados del objetivo.
- Modelado de interacciones entre objetos mediante contexto visual: aprende a anticipar colisiones usando únicamente la información visual de los objetos circundantes, sin recibir sus estados medidos.
- Predicción multipobjetivo en paralelo: varios objetivos pueden compartir la misma escena codificada y predecirse simultáneamente con un mismo clip RGB.
- Estimación de contacto: emite `contact_probabilities` con tres ranuras de compañero y 30 bins temporales más la clase de "sin contacto".
- Inferencia con características cacheadas: permite sustituir el clip RGB por características precalculadas del codificador (forma `(4,1008,768)` o `(B,4,1008,768)`) para acelerar la ejecución.
- Soporte de calibración de cámara: admite un archivo `camera.json` con `T_world_cam` e intrínsecos (`fx, fy, cx, cy, width, height`) para proyectar el histórico del objetivo.
- Inferencia en CPU y GPU (`--device cpu` / `--device cuda`).
- No dispone de tool calling, capacidades de agente, generación de texto ni procesamiento de lenguaje.

## Casos de uso

- Previsión de colisiones en líneas de transporte por cinta: el modelo anticipa un segundo de movimiento de objetos (pelotas, huevos) e identifica contactos inminentes usando solo el contexto visual, útil para sistemas de rechazo o parada en logística automatizada.
- Control predictivo en robótica de manipulación: integrado en un bucle de control, proporciona trayectorias XYZ/vXYZ de 1 s que un planificador puede usar para reajustar la pinza antes de una colisión entre objetos.
- Alerta temprana en sistemas de inspección: con las probabilidades de contacto y los bins temporales, se pueden disparar alarmas cuando dos objetos comparten ranura de compañero en un horizonte de 30 pasos.
- Análisis de rebotes e interacciones con raíl: el modelo está entrenado específicamente en escenas de rebote e interacción con raíl, por lo que es adecuado para validar la física de un entorno de simulación frente a datos reales de cinta.
- Predicción multipobjetivo sobre una única codificación de escena: cuando se rastrean varios objetos en el mismo campo de visión, se reutiliza una sola pasada del codificador y se predicen todos los objetivos en paralelo, reduciendo coste computacional.
- Etiquetado automático y aumento de datos: las trayectorias predichas pueden usarse para anotar secuencias o generar datos sintéticos de interacción en entrenamientos posteriores.
- Monitorización de estabilidad en cintas con paradas y arranques: al cubrir movimiento activo y detenido, el modelo puede detectar desviaciones respecto a la dinámica esperada en transiciones de velocidad.
- Evaluación offline de políticas de manipulación: permite simular el resultado de un segundo de interacción antes de ejecutar una acción real, útil en entornos de investigación con hardware limitado.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (ventanas de test con particiones disjuntas por grabación):

| Medida de test | Valor (ADE) |
|---|---:|
| ADE macro por grabación (global) | 30,66 mm |
| ADE ponderado por muestra (global) | 32,63 mm |
| ADE ordinario (1.751 ventanas) | 22,40 mm |
| ADE en colisión visible (251 ventanas) | 68,12 mm |
| ADE en raíl (261 ventanas) | 63,77 mm |
| ADE en colisión visible con contexto visual barajado | 75,41 mm |

No se han publicado en la información disponible otros benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo. La comparación entre "colisión visible" (68,12 mm) y "colisión visible con contexto visual barajado" (75,41 mm) indica que la rama de interacción visual aporta una mejora medible en escenarios de contacto. Los autores advierten que las grabaciones de validación y test ya fueron inspeccionadas durante el desarrollo, por lo que no constituyen una evaluación prospectiva nueva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Para referencia, el backbone ViT-B destilado ronda los 86 millones de parámetros y el decodificador y la rama de interacción son de tamaño reducido (256 y 192 canales), por lo que en fp32 el conjunto podría situarse en el orden de cientos de megabytes de pesos; el consumo real dependerá de la resolución (384×672) y del tamaño de lote.
- GPU recomendadas: no especificadas por el autor. El modelo admite `--device cuda`, por lo que cualquier GPU con soporte CUDA y memoria suficiente para el backbone ViT-B y los tensores de entrada debería ser válida; una RTX 4090 o superior es holgada para este tamaño.
- Compatibilidad con GPU de consumo: probable en GPUs de consumo modernas con al menos unos pocos gigabytes de VRAM, aunque el dato exacto no está publicado y debe medirse en el hardware objetivo.
- Ejecución en CPU: soportada explícitamente mediante `--device cpu`, adecuada para verificación y pruebas, con latencia mayor.
- Opciones de despliegue: paquete propio `vjepa_trajectory` (rueda `vjepa_trajectory-0.1.0-py3-none-any.whl`) con comandos `interaction-predict` y `verify_release.py`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Requiere Python 3.12 o superior.
- Latencia y throughput: no disponibles. El uso de características cacheadas (`features` con forma `(4,1008,768)`) evita repetir la pasada del codificador cuando varios objetivos comparten escena, lo que reduce coste en predicciones múltiples.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaliberAI vjepa2-1 conveyor interaction (este modelo) | Predicción de trayectorias 3D con backbone V-JEPA 2.1 ViT-B congelado | 8 fotogramas RGB 384×672 + 8 estados 3D del objetivo | 30 pasos XYZ/vXYZ + probabilidades de contacto | no disponible | HuggingFace (KaliberAI) |
| V-JEPA 2.1 (ViT-B destilado, Meta) | Modelo fundacional de vídeo auto-supervisado | Vídeo | Representaciones latentes | no disponible en esta ficha | dl.fbaipublicfiles.com (backbone oficial) |
| V-JEPA 2 (Meta) | Modelo fundacional de vídeo, predecesor | Vídeo | Representaciones latentes | no disponible en esta ficha | Meta / HuggingFace |

No se dispone de datos de benchmarks comunes que permitan una comparación numérica directa con otros predictores de trayectoria de la misma categoría. El propio autor indica que este checkpoint es la variante determinista de un segundo y que no es el experimento posterior de dos segundos con gaussianas.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre escenas de cinta transportadora (pelotas, huevos, raíles, rebotes); no se garantiza su comportamiento fuera de ese ámbito ni con otros objetos o cámaras.
- Requiere estados 3D fiables del objetivo y calibración de cámara coherente con el marco de mundo usado en entrenamiento; el modelo no reconstruye estados 3D del objetivo a partir de vídeo arbitrario.
- Las características del codificador no son intercambiables entre resoluciones o backbones distintos; el modelo espera la salida exacta del ViT-B destilado a 384×672.
- Riesgo de error elevado en colisiones y raíles: el ADE medio sube de 22,40 mm en casos ordinarios a 68,12 mm en colisiones visibles y 63,77 mm en raíl.
- Las ranuras de compañero de `contact_probabilities` no son identificadores de seguimiento y no deben interpretarse como tales.
- No incluye estado del optimizador, grabaciones privadas ni anotaciones; el checkpoint distribuido contiene únicamente pesos, estadísticas de normalización y configuración.
- Las particiones de validación y test ya se inspeccionaron durante el desarrollo, por lo que no equivalen a una evaluación prospectiva independiente.
- Licencia no declarada en la información disponible: debe confirmarse antes de cualquier uso comercial.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No se documentan cuantizaciones alternativas; el despliegue depende del formato `best.pt` en PyTorch.
- El paquete requiere Python 3.12 o superior y una instalación de PyTorch acorde al hardware (CPU o CUDA).

## Enlaces

- HuggingFace: https://huggingface.co/KaliberAI/vjepa2-1-conveyor30-rgb-states-interaction-8to30
- Backbone oficial V-JEPA 2.1 ViT-B destilado: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt (SHA-256 esperado: 848a77c33cc9e6649ed2119c9bea1e2c569bcdab9539ff3e7c02ccc2959ddf4d)
- No se han encontrado en la información disponible papers, blogs, repositorios o demos adicionales.
