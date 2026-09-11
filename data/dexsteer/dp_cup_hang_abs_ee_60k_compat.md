# DexSteer/dp_cup_hang_abs_ee_60k_compat

## Resumen

`DexSteer/dp_cup_hang_abs_ee_60k_compat` es un checkpoint de robótica, no un modelo de lenguaje: se trata de una politica de difusion (Diffusion Policy) para control de manipulacion, publicada dentro del ecosistema [lerobot](https://github.com/huggingface/lerobot) de Hugging Face. Concretamente, es una copia compatible con lerobot 0.4.4 del checkpoint de entrenamiento de DexSteer `dp_isaaclab_ur7e_3task_abs_ee_60k/cup_hang`. El autor mantiene los pesos y los procesadores byte a byte y reescribe unicamente el `config.json`, porque la configuracion original incluia campos exclusivos del fork de DexSteer que la clase `DiffusionConfig` de lerobot estandar rechaza.

El problema que resuelve es puramente de interoperabilidad: sin esta copia, el checkpoint no carga con una instalacion limpia de lerobot 0.4.4. La variante `_compat` esta pensada para un pipeline que redimensiona las imagenes de camara a 224x224 antes de enviarlas (recorte identidad), de modo que el `config.json` declara `crop_shape: [224, 224]` y ningun `resize_shape`. El propio autor advierte de que usar la variante equivocada en el otro pipeline provoca un recorte central de 224 pixeles sobre la imagen y un exito cercano a cero, lo que convierte la eleccion de variante en un requisito critico de despliegue.

El checkpoint tiene 278.928.794 parametros y ocupa 1,1 GB en el repositorio, con pesos en formato safetensors. No publica licencia, idiomas, pipeline ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que se trata de un artefacto de investigacion reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion (Diffusion Policy) para control robotico, cargable mediante `lerobot.policies.diffusion.modeling_diffusion.DiffusionPolicy`; topologia interna (backbone, capas, atencion) no disponible |
| Parametros totales | 278.928.794 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un contexto de texto, sino un horizonte de observacion/accion de la politica que no se detalla en la model card |
| Tipos de cuantizacion | no disponible; el repositorio publica safetensors de 1,1 GB para 278,9 M de parametros, compatible con pesos en precision de 32 bits |
| Idiomas soportados | no aplica (modelo de control robotico, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors, acompanado de `config.json` y de los procesadores originales del checkpoint |
| Compatibilidad | lerobot 0.4.4 sin modificaciones (clase `DiffusionConfig`) |
| Configuracion de imagen | `crop_shape: [224, 224]`, sin `resize_shape` (variante `_compat`, recorte identidad) |
| Tarea | `cup_hang`, dentro del checkpoint multi-tarea `dp_isaaclab_ur7e_3task_abs_ee_60k` |
| Tamano del repositorio | 1,1 GB |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una Diffusion Policy integrada en lerobot, es decir, una politica que genera acciones roboticas mediante un proceso de difusion iterativo en lugar de una regresion directa. La clase de carga indicada por el autor es `DiffusionPolicy`, y el identificador del checkpoint de origen (`dp_isaaclab_ur7e_3task_abs_ee_60k`) apunta a un entrenamiento realizado en IsaacLab sobre un robot UR7e, con tres tareas y control absoluto de efector final, hasta 60.000 pasos de entrenamiento. Estos detalles proceden de la nomenclatura del propio checkpoint y no estan desglosados en la model card.

No se especifican en la informacion proporcionada el numero de tokens o episodios de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (concepto que ademas no aplica a una politica de control) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica modificacion declarada respecto al checkpoint original es la reescritura de `config.json` para eliminar campos exclusivos del fork de DexSteer, manteniendo pesos y procesadores byte a byte.

## Capacidades

- Generacion de acciones de manipulacion robotica para la tarea `cup_hang` (colgado de una taza) mediante muestreo por difusion.
- Control absoluto de efector final (absolute end-effector), segun la nomenclatura `abs_ee` del checkpoint de origen.
- Procesamiento de observaciones visuales de camara, con pipeline de imagen fijado a 224x224 mediante recorte identidad.
- Carga directa con lerobot 0.4.4 sin necesidad de aplicar parches al codigo de la libreria.
- Integracion en un checkpoint multi-tarea de origen (`3task`), aunque esta copia se publica para la tarea concreta `cup_hang`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multietapa, capacidades multilingues, vision generativa, audio ni modo "thinking": son capacidades propias de modelos de lenguaje y no aplican a este artefacto.

## Casos de uso

- Evaluacion de politicas de difusion en simulacion: cargar el checkpoint con `DiffusionPolicy.from_pretrained("DexSteer/dp_cup_hang_abs_ee_60k_compat")` dentro de un entorno IsaacLab con robot UR7e para reproducir la tarea `cup_hang` y medir tasa de exito, sin tener que adaptar el `config.json` a mano.
- Reproduccion de resultados de investigacion: al conservar los pesos y procesadores originales byte a byte, sirve para replicar experimentos previos de DexSteer sobre lerobot 0.4.4 y verificar que las diferencias observadas no provienen de una reescritura de pesos.
- Punto de partida para fine-tuning: el checkpoint puede actuar como inicializacion para variantes de la misma tarea (por ejemplo, distintas posiciones de taza o utillajes) reentrenando con el pipeline de lerobot, dado que su configuracion ya es aceptada por la libreria estandar.
- Baseline en comparativas de politicas: util como referencia de una politica de difusion de 278,9 M de parametros frente a alternativas de la misma familia (por ejemplo, politicas tipo ACT) en el mismo banco de pruebas robotico.
- Integracion en un cliente de inferencia propio: si el cliente redimensiona las imagenes a 224x224 antes de enviarlas, esta variante encaja directamente; el desarrollador solo necesita respetar ese preprocesado para evitar el fallo por recorte central descrito por el autor.
- Validacion de pipelines de despliegue en robot real: al ser un checkpoint pequeno (1,1 GB), permite probar el bucle completo de observacion, inferencia y envio de comandos al UR7e en hardware modesto antes de escalar a modelos mayores.
- Pruebas de regresion de la libreria lerobot: sirve como caso de compatibilidad para verificar que una version concreta de `DiffusionConfig` sigue aceptando checkpoints reescritos, util en CI de forks o integraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de simulacion ni comparaciones numericas con otras politicas, y los resultados de la busqueda web no contienen informacion relevante sobre este modelo (los enlaces devueltos corresponden a un servicio de video en streaming y no guardan relacion con el artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia calculable, 278.928.794 parametros en precision de 32 bits ocupan aproximadamente 1,12 GB, y en precision de 16 bits unos 0,56 GB; a ello hay que sumar activaciones, buffers de imagen a 224x224 y el estado del proceso de difusion, cuyo coste no se detalla.
- GPU recomendadas: no disponibles. Por tamano de pesos, cualquier GPU con al menos 4 GB de VRAM deberia poder alojar el modelo; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentacion.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna con 4 GB o mas de VRAM, dado que los pesos en 32 bits rondan 1,12 GB. Esta afirmacion es una estimacion basada en el recuento de parametros, no un dato publicado.
- Opciones de despliegue: PyTorch con lerobot 0.4.4 mediante `DiffusionPolicy.from_pretrained`. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. En una politica de difusion la latencia depende del numero de pasos de denoising y del horizonte de acciones, parametros que no se recogen en la model card.
- Requisito critico de preprocesado: el cliente debe entregar imagenes ya redimensionadas a 224x224 con recorte identidad; usar esta variante en un pipeline que no lo haga reduce la tasa de exito a valores cercanos a cero.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto o licencia comparables con otras politicas de robotica, y no se han encontrado referencias externas del modelo en la busqueda web. Como unica referencia contextual, el propio autor menciona la existencia de una variante alternativa del mismo checkpoint para otro pipeline de imagen, pero no publica nombre ni cifras que permitan una comparacion tecnica.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay garantia de uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- Variante sensible al preprocesado: si el cliente no redimensiona las imagenes a 224x224 antes de enviarlas, el modelo aplica un recorte central de 224 pixeles y la tasa de exito cae a aproximadamente cero, segun advierte el autor.
- Especificidad de tarea: el checkpoint corresponde a la tarea `cup_hang` del conjunto `dp_isaaclab_ur7e_3task_abs_ee_60k`; no hay evidencia de que generalice a otras tareas, objetos o robots distintos del UR7e.
- Ausencia de benchmarks: no existen metricas publicadas de tasa de exito, robustez ni comportamiento ante perturbaciones, lo que impide estimar su fiabilidad real.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta implican que no hay retroalimentacion de terceros sobre su funcionamiento.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe el riesgo analogo de que la politica genere trayectorias no validas ante observaciones fuera de la distribucion de entrenamiento.
- Sesgos de datos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo respecto a condiciones de iluminacion, posiciones iniciales o variaciones del entorno.
- Ambito de aplicacion restringido a control robotico: no debe presentarse ni usarse como modelo de lenguaje, generacion de texto o asistente conversacional.
- Sin soporte de contexto largo ni capacidades multilingues: no son caracteristicas de este tipo de artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DexSteer/dp_cup_hang_abs_ee_60k_compat
- Repositorio de lerobot en GitHub: https://github.com/huggingface/lerobot
- Checkpoint de origen citado por el autor: `dp_isaaclab_ur7e_3task_abs_ee_60k/cup_hang` (sin URL publica en la informacion disponible)
- Paper, blog, demo o repositorio adicionales: no disponibles; la busqueda web no devolvio resultados relevantes sobre este modelo.
