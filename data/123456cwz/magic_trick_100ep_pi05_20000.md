# 123456cwz/Magic_Trick_100ep_Pi05_20000

## Resumen

Magic Trick Pi0.5 es un checkpoint de inferencia para robótica construido sobre los pesos base oficiales de Pi0.5 (modelo vision-language-action de Physical Intelligence), afinado por el usuario 123456cwz sobre el dataset `PiaoZY/magic-trick-100ep`. El modelo está empaquetado para el framework OpenPI con la configuración `pi05_magic_trick_100ep` y corresponde a la iteración 20000 del bucle de entrenamiento del experimento `magic_trick_100ep_pi05_h100`. Su propósito es ejecutar una tarea concreta de manipulación bimanual (un truco de magia) sobre un robot de doble brazo de 7 grados de libertad por brazo.

El checkpoint no es un modelo de lenguaje generalista: es un artefacto de política (policy) que consume observaciones multimodales (tres cámaras: base, muñeca izquierda y muñeca derecha) más un prompt de tarea, y emite acciones motoras de 16 dimensiones reales empaquetadas en un vector de 32 dimensiones. El repositorio ocupa 12,4 GB y contiene los parámetros exportados (incluyendo EMA si estaba activada) y las estadísticas de normalización específicas del dataset, pero no el estado del optimizador.

La relevancia de esta ficha es acotada: se trata de un experimento de un autor individual con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Resulta útil como referencia de cómo se estructura un export de OpenPI para doble brazo y de las transformaciones personalizadas (`Dual7DofInputs` / `Dual7DofOutputs`) necesarias para layouts de 16 dimensiones, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en Pi0.5; detalles internos de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el export contiene `params/**` en el formato nativo de OpenPI) |
| Idiomas soportados | no disponibles (el prompt de tarea se usa en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | parámetros OpenPI en `params/**` (formato nativo del framework, no safetensors/GGUF declarados) |
| Dimension de accion | 16 reales, empaquetadas en vector de 32 |
| Layout del robot | `[left_joint_0..6, left_gripper_width, right_joint_0..6, right_gripper_width]` |
| Unidades | articulaciones en radianes; apertura de pinza en metros |
| Camaras | `observation.images.base`, `observation.images.left_wrist`, `observation.images.right_wrist` |
| Dataset de entrenamiento | `PiaoZY/magic-trick-100ep` (100 episodios) |
| Iteracion del checkpoint | 20000 |
| Tamano del repo | 12,4 GB |

## Arquitectura y entrenamiento

El modelo parte de los pesos base oficiales de Pi0.5, un modelo vision-language-action de Physical Intelligence que combina un backbone de visión-lenguaje con una cabeza de generación de acciones. El autor no documenta en la model card el número de parámetros, la composición del dataset más allá del nombre, ni el número de tokens o pasos de entrenamiento; solo se indica que el experimento se ejecutó en una H100 y que el checkpoint corresponde al índice 20000 del bucle de entrenamiento. El export incluye los parámetros EMA cuando el entrenamiento los tenía activados y excluye el estado del optimizador, lo que lo hace apto para inferencia pero no para reanudar el entrenamiento.

La innovación técnica relevante de este artefacto está en el tratamiento de las acciones. El layout es de doble brazo de 7 DoF más pinza por brazo (16 dimensiones reales), y las dos pinzas (índices 7 y 15) se mantienen en valores absolutos mientras que las otras 14 articulaciones se expresan como deltas relativos al estado inicial de un chunk de 50 pasos. El vector de acción se rellena hasta 32 dimensiones. Para consumirlo correctamente hay que usar las transformaciones personalizadas `Dual7DofInputs` / `Dual7DofOutputs` de OpenPI y el `norm_stats.json` propio del checkpoint (`assets/magic-trick-100ep/norm_stats.json`); la model card advierte explícitamente de no aplicar la conversión estándar de 14 dimensiones para Aloha/ARX.

## Capacidades

- Generación de acciones motoras bimanuales para un robot de doble brazo de 7 DoF por brazo con pinza, en un chunk de 50 pasos.
- Percepción multimodal a partir de tres cámaras simultáneas (vista base y dos muñecas), con el prompt de tarea referido a la vista de la cámara externa.
- Condicionamiento por prompt de tarea en lenguaje natural, heredado del backbone VLA de Pi0.5.
- Ejecución de una política especializada en la tarea del dataset `magic-trick-100ep` (truco de magia), no una política generalista.
- Integración con el ecosistema OpenPI mediante configuración `pi05_magic_trick_100ep` y transformaciones de entrada/salida personalizadas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking.

## Casos de uso

- Reproducción de la política entrenada: cargar el checkpoint con la configuración `pi05_magic_trick_100ep` en OpenPI y ejecutar la tarea de truco de magia sobre el robot de doble brazo para el que se recogió el dataset, usando las tres cámaras y el prompt de tarea previstos.
- Referencia de implementación de layouts bimanuales: sirve como ejemplo funcional de un pipeline OpenPI con 16 dimensiones de acción, pinzas absolutas y articulaciones en delta sobre chunks de 50 pasos, útil para equipos que diseñen sus propias políticas de doble brazo.
- Punto de partida para fine-tuning: al inicializarse desde los pesos base de Pi0.5 y exportarse sin estado del optimizador, puede reutilizarse como inicialización para nuevos datasets bimanuales con el mismo layout de 16 dimensiones.
- Validación de estadísticas de normalización: el `norm_stats.json` independiente permite comprobar la coherencia entre el dataset de 100 episodios y las acciones emitidas antes de desplegar en hardware.
- Evaluación comparativa de checkpoints: al estar identificado por índice de entrenamiento (20000), permite contrastar la evolución de la política frente a checkpoints anteriores o posteriores del mismo experimento.
- Docencia y experimentación en robótica de manipulación: un caso acotado y reproducible (100 episodios, una sola tarea) para estudiar el comportamiento de un VLA afinado sin necesidad de un dataset a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,4 GB, lo que da una cota inferior orientativa del espacio necesario para los pesos, sin contar activaciones ni buffers de visión.
- GPU recomendadas: el experimento se entrenó en una H100 según el nombre del experimento (`magic_trick_100ep_pi05_h100`); no se documentan requisitos de inferencia.
- Viabilidad en GPU de consumo: no disponible; no se especifica cuantización ni tamaño de parámetros que permita estimarlo.
- Opciones de despliegue: OpenPI (framework nativo del checkpoint, con las transformaciones `Dual7DofInputs` / `Dual7DofOutputs`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Magic Trick Pi0.5 (este) | no disponible | no disponible | VLA bimanual, tarea única | no disponible | Hugging Face, 0 descargas |
| Pi0.5 base (Physical Intelligence) | no disponible en la informacion proporcionada | no disponible | VLA generalista | no disponible en la informacion proporcionada | Pesos base referenciados por el autor |
| Alternativas VLA de doble brazo (Aloha/ARX de 14 dimensiones) | no disponible | no disponible | VLA bimanual estandar | no disponible | Referenciadas solo como conversión a evitar |

No se dispone de datos de benchmarks ni de especificaciones de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo está entrenado sobre un único dataset de 100 episodios de una tarea concreta, por lo que su comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación: aplicable en la generación de acciones; una política sobreajustada a 100 episodios puede producir trayectorias no válidas ante cambios de iluminación, posiciones de cámara o estado inicial distintos a los del dataset.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados para el prompt de tarea.
- Restricciones de licencia: la licencia no está disponible, lo que impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Caveat de layout: usar la conversión estándar de 14 dimensiones para Aloha/ARX produce resultados incorrectos; es obligatorio emplear `Dual7DofInputs` / `Dual7DofOutputs` y el `norm_stats.json` del checkpoint.
- Caveat de export: el checkpoint no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida; no debe tratarse como un artefacto estable para producción.
- Orden de brazos y muñecas: la model card exige preservar el orden numérico de brazos y muñecas documentado por el dataset; alterarlo invalida las acciones generadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123456cwz/Magic_Trick_100ep_Pi05_20000
- Dataset de entrenamiento: https://huggingface.co/datasets/PiaoZY/magic-trick-100ep
- OpenPI (framework): no disponible en la informacion proporcionada
- Pesos base de Pi0.5: no disponible en la informacion proporcionada
- Paper o blog técnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
