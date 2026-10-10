# kiroaiseoul/NAJY_act_all11_c150_m1_27D_60k_s1000

## Resumen

NAJY_act_all11_c150_m1_27D_60k_s1000 es un checkpoint de politica de imitacion basada en ACT (Action Chunking Transformer) publicado por el usuario kiroaiseoul dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de control roboticos que mapea observaciones multimodales (estado del robot y tres camaras RGB) directamente a comandos de accion de 16 dimensiones, entrenado para tareas de manipulacion sobre la plataforma Trossen Mobile AI.

El modelo tiene 51.751.568 parametros (segun el fichero safetensors real) y ocupa 0,2 GB en el repositorio. Acepta un vector de estado de 27 dimensiones y tres flujos de imagen a 480x640 (camara alta, muneca izquierda y muneca derecha), y produce un vector de accion de 16 dimensiones. Corresponde al paso 60000 de la ejecucion denominada `t25_all11_c150_m1_60k_s1000`, con semilla 1000, entrenado en la maquina etiquetada como DGX_1.

Su relevancia es acotada pero concreta: se trata de un checkpoint subido explicitamente para analisis y puntuacion, no como candidato final de despliegue. Resulta util para reproducir evaluaciones, verificar integridad del entrenamiento y comparar variantes dentro de un mismo pipeline de investigacion en robotica, y esta liberado bajo Apache 2.0, lo que permite reutilizacion sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica de imitacion con encoder CVAE y decodificador transformer |
| Parametros totales | 51.751.568 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa action chunking sobre ventanas de observacion) |
| Tipos de cuantizacion | no disponible (solo se publica safetensors; no hay variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de control roboticos, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de estado de entrada | 27 |
| Entradas de imagen | 3 camaras RGB a 3x480x640 (cam_high, cam_left_wrist, cam_right_wrist) |
| Dimension de accion de salida | 16 |
| Paso de entrenamiento | 60000 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una politica de imitacion de tipo transformer con action chunking: en lugar de predecir una unica accion por paso, produce un bloque de acciones futuras. La variante original incorpora un encoder de VAE condicional que modela la variabilidad de las demostraciones humanas durante el entrenamiento, y un decodificador transformer que atiende conjuntamente a las observaciones (estado propioceptivo y caracteristicas visuales extraidas de las camaras) y a la representacion latente de estilo. En este checkpoint, la configuracion concreta del backbone visual, el tamano del chunk de acciones y el numero de capas no estan documentados en la model card.

Los datos de entrenamiento no se detallan: se conoce el identificador de la ejecucion (`t25_all11_c150_m1_60k_s1000`), el numero de pasos (60000) y la semilla (1000), pero no el numero de episodios, la composicion del dataset ni si hubo etapas de refinamiento posteriores al entrenamiento por imitacion supervisada. El prefijo `all11` sugiere un entrenamiento conjunto sobre once tareas o variantes, y `27D` coincide con la dimension del vector de estado, aunque la model card no confirma el significado exacto de cada campo del nombre. No hay informacion sobre el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables a este tipo de modelo).

Un detalle tecnico relevante es que el autor incluye el hash SHA-256 del fichero `model.safetensors` (`c250367f561fcdc44b1ce8f80c45982085b10361b57f334a4432e73dbbec3356`) para verificar integridad, y una herramienta de puntuacion que lee banderas desde `multi_manifest.json` en la misma carpeta. La estructura del repositorio sigue el layout `pretrained_model` de LeRobot, de modo que puede cargarse directamente con utilidades como `stage_cond_diag.py`. El trasfondo del experimento se remite al documento `docs/mobile_base_investigation.md`, seccion 94, dentro del proyecto trossen-ai-simulation.

## Capacidades

- Control roboticos por imitacion: genera bloques de acciones de 16 dimensiones a partir de observaciones, apto para tareas de manipulacion con base movil.
- Fusion multimodal: integra estado propioceptivo de 27 dimensiones con tres vistas de camara simultaneas (vista alta y dos munecas), lo que permite politicas sensibles a la configuracion de brazos y pinzas.
- Action chunking: predice secuencias de acciones en lugar de pasos aislados, lo que reduce el error de compounding y suaviza la ejecucion.
- Inferencia en tiempo real: por su tamano (51,75 M de parametros) es ejecutable en GPU de consumo con latencias potencialmente compatibles con control a alta frecuencia (el valor exacto para este checkpoint no esta documentado).
- Reutilizacion en el ecosistema LeRobot: compatible con las utilidades de carga, evaluacion y diagnostico del framework.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento; no es un modelo generativo de texto.

## Casos de uso

- Investigacion en imitacion robotica: cargar el checkpoint con `pretrained_model` de LeRobot para reproducir el paso 60000 y comparar curvas de aprendizaje frente a otros checkpoints de la misma ejecucion.
- Evaluacion de integridad de entrenamiento: verificar el hash SHA-256 y las banderas de `multi_manifest.json` para descartar corrupciones antes de reutilizar los pesos.
- Diagnostico de politicas con `stage_cond_diag.py`: analizar las condiciones de estado o de tarea que inducen fallos en la politica, aprovechando la estructura de repositorio lista para ese flujo de trabajo.
- Manipulacion con base movil en Trossen Mobile AI: desplegar la politica en tareas de recogida y colocacion donde se requiera coordinar la base con los brazos y consultar tres camaras simultaneamente.
- Prototipado en simulacion: integrar el modelo en entornos simulados del proyecto trossen-ai-simulation para validar politicas antes de tocar hardware fisico.
- Generacion de datos sinteticos de accion: usar las predicciones del modelo como referencia para comparar con demostraciones humanas y detectar desviaciones sistematicas.
- Benchmarking interno de variantes ACT: al ser un checkpoint etiquetado con semilla, configuracion y paso, sirve como referencia reproducible en comparaciones A/B dentro del mismo laboratorio.
- Formacion y docencia en robotica: por su tamano reducido y licencia permisiva, es adecuado para cursos practicos de aprendizaje por imitacion sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tasas de exito, metricas de error de accion, curvas de aprendizaje ni comparaciones con otros checkpoints o politicas. El unico dato objetivo publicado es el numero de pasos de entrenamiento (60000) y el hash del fichero de pesos.

## Requisitos de hardware

- VRAM para los pesos en fp32: aproximadamente 207 MB (51.751.568 parametros x 4 bytes).
- VRAM para los pesos en fp16/bf16: aproximadamente 104 MB.
- VRAM adicional por activaciones: depende del backbone visual y del tamano de batch; con tres imagenes de 480x640 por inferencia, el consumo tipico se mantiene en el rango de cientos de MB a pocos GB.
- GPU de consumo: cabe holgadamente en cualquier GPU moderna con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4070, RTX 4090).
- GPU de centro de datos: A100, H100 o similares, recomendables para reentrenamiento y barridos de hiperparametros; para inferencia son sobredimensionadas.
- Opciones de despliegue: LeRobot sobre PyTorch como via principal; el repositorio no incluye artefactos para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para establecer una comparacion cuantitativa. La tabla recoge la informacion estructural conocida y marca como no disponible lo que no aparece en la model card.

| Modelo | Parametros | Contexto/entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| NAJY_act_all11_c150_m1_27D_60k_s1000 | 51.751.568 | Estado de 27 dim + 3 camaras 480x640 | apache-2.0 | HuggingFace (lerobot) |
| ACT original (referencia del paper) | no disponible | no disponible | no disponible | Implementacion publica en LeRobot |
| Diffusion Policy (alternativa de imitacion) | no disponible | no disponible | no disponible | Repositorios publicos |
| Otros checkpoints del autor en Trossen Mobile AI | no disponible | no disponible | apache-2.0 | HuggingFace |

Comparativa de rendimiento (tasa de exito, error de accion, latencia): no disponible.

## Limitaciones y advertencias

- El propio autor indica que el checkpoint se sube para analisis y puntuacion, y que no equivale a una confirmacion como candidato de despliegue en robot real.
- No hay informacion sobre el dataset de entrenamiento, por lo que se desconocen los sesgos de recogida, la diversidad de escenarios y la posible sobreespecializacion a un unico montaje fisico.
- Al ser una politica de imitacion, puede fallar ante distribuciones fuera de las demostraciones vistas; el riesgo de acciones erráticas en entornos no cubiertos es real y no esta cuantificado.
- No incluye mecanismos de seguridad, parada de emergencia ni restricciones de espacio de trabajo; cualquier despliegue fisico requiere capas de proteccion externas.
- El significado exacto de los campos del nombre (`all11`, `c150`, `m1`, `27D`) no esta documentado, lo que dificulta interpretar la configuracion de entrenamiento sin acceso al proyecto de origen.
- El campo `model.safetensors sha256` y las banderas de `multi_manifest.json` deben verificarse antes de reutilizar el modelo; la model card asume ese paso como parte del flujo.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero no exime de responsabilidad sobre el comportamiento del modelo en hardware fisico.
- La informacion de la busqueda web no contiene resultados relevantes sobre este modelo; los enlaces devueltos tratan sobre temas ajenos (Discord y carroceria de automoviles) y no deben considerarse fuentes.
- No hay garantias de compatibilidad con versiones futuras de LeRobot ni con estructuras `pretrained_model` modificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c150_m1_27D_60k_s1000
- Referencia interna citada por el autor: trossen-ai-simulation, `docs/mobile_base_investigation.md`, seccion 94
- Framework LeRobot: https://github.com/huggingface/lerobot
- Paper original de ACT (Action Chunking with Transformers): no disponible en la informacion proporcionada
- Repositorio o demo del proyecto Trossen Mobile AI: no disponible en la informacion proporcionada
- Resultados de busqueda web: no relevantes para este modelo
