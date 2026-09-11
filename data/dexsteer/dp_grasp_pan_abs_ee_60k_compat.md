# DexSteer/dp_grasp_pan_abs_ee_60k_compat

## Resumen

`DexSteer/dp_grasp_pan_abs_ee_60k_compat` es un checkpoint de política de difusión (Diffusion Policy) para control robótico visomotor, publicado por el usuario DexSteer. No es un modelo de lenguaje: es una política de imitación que, a partir de observaciones (imágenes de cámara y estado del robot), genera secuencias de acciones de efector final. El checkpoint procede de un entrenamiento en IsaacLab sobre un brazo UR7e y tres tareas, identificado en el nombre del repositorio como `dp_isaaclab_ur7e_3task_abs_ee_60k/grasp_pan`.

La particularidad de esta publicación es de compatibilidad, no de rendimiento. El `config.json` original contenía campos propios de un fork de DexSteer que la clase `DiffusionConfig` de LeRobot estándar rechaza; esta copia conserva los pesos y los procesadores byte a byte y reescribe únicamente `config.json` para que el checkpoint cargue con LeRobot 0.4.4 sin modificaciones. Se trata de la variante `_compat`, pensada para un pipeline que ya redimensiona las imágenes a 224x224 antes de enviarlas (crop identidad, `crop_shape: [224, 224]` y sin `resize_shape`).

El modelo tiene 278.928.794 parámetros y un repositorio de 1,1 GB, y en el momento de la consulta acumula 0 descargas y 0 likes. La relevancia es acotada pero concreta para quien reproduce experimentos de manipulación con LeRobot: resuelve un fallo de carga por incompatibilidad de configuración entre un fork de entrenamiento y la librería pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión visomotora para control de efector final), implementación `lerobot.policies.diffusion.modeling_diffusion.DiffusionPolicy` |
| Parametros totales | 278.928.794 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; consume observaciones de imagen y estado del robot en lugar de tokens) |
| Tipos de cuantizacion | No disponible; no se documenta ninguna cuantizacion. El repositorio ocupa 1,1 GB para 278,9 M de parámetros, magnitud consistente con pesos en precisión de 32 bits |
| Idiomas soportados | No aplica (no procesa lenguaje natural). No se declara ninguna lista de idiomas en la model card |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (junto con procesadores); `config.json` reescrito para compatibilidad con LeRobot 0.4.4 |
| Preprocesado de imagen declarado | `crop_shape: [224, 224]`, sin `resize_shape` (variante de crop identidad sobre imágenes ya redimensionadas a 224x224) |
| Tamano del repositorio | 1,1 GB |
| Etiquetas del repositorio | `safetensors`, `region:us` |
| Fecha de creacion / ultima actualizacion | 2026-09-11 / 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy, es decir, un modelo generativo que aprende una distribución sobre secuencias de acciones (chunks) y las muestrea mediante un proceso iterativo de denoising, condicionado por las observaciones del entorno. En LeRobot esta política se implementa en el módulo `lerobot.policies.diffusion`, y este repositorio se limita a exponer el checkpoint de forma que esa implementación pueda instanciarlo directamente:

```python
from lerobot.policies.diffusion.modeling_diffusion import DiffusionPolicy
policy = DiffusionPolicy.from_pretrained("DexSteer/dp_grasp_pan_abs_ee_60k_compat")
```

No se publica en la model card información sobre el número de tokens o pasos de entrenamiento (el sufijo `60k` del nombre original sugiere 60.000 pasos, pero no se confirma), la composición del dataset de demostraciones, ni si hubo etapas de RLHF, DPO o ajuste posterior. Lo que sí se documenta es el origen: un entrenamiento en IsaacLab sobre un UR7e con tres tareas, del que se extrae la tarea `grasp_pan`. Los pesos y procesadores son idénticos byte a byte al checkpoint original; la única modificación es la reescritura de `config.json` para eliminar campos exclusivos del fork de DexSteer.

La innovación técnica destacable no está en el modelo sino en el empaquetado: la separación explícita entre dos variantes de preprocesado. La variante `_compat` aplica un crop identidad porque asume imágenes ya redimensionadas a 224x224. La model card advierte de que usar la variante equivocada en el pipeline contrario provoca un center-crop de un parche de 224 píxeles sobre la imagen y reduce la tasa de éxito prácticamente a cero. Es una advertencia operativa relevante: el contrato de entrada del cliente debe coincidir con el `crop_shape` declarado.

## Capacidades

- Generación de acciones de efector final para manipulación robótica: produce secuencias de acciones (action chunking) condicionadas por observaciones visuales y de estado, en lugar de texto.
- Control visomotor entrenado para la tarea de grasping (`grasp_pan`) sobre un brazo UR7e en el simulador IsaacLab.
- Carga directa con LeRobot 0.4.4 sin parches ni modificaciones en la librería, a través de `DiffusionPolicy.from_pretrained`.
- Inferencia con preprocesado de imagen tipo crop identidad sobre entradas de 224x224 (variante `_compat`).
- Reutilización como punto de partida para fine-tuning en tareas de manipulación adicionales dentro del ecosistema LeRobot.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión descriptiva, audio ni modo de pensamiento. No se declara ninguna de estas capacidades en la información disponible.

## Casos de uso

- Reproducción de experimentos de Diffusion Policy en LeRobot: cargar el checkpoint con `DiffusionPolicy.from_pretrained` y ejecutar la política en un entorno de evaluación permite reproducir el comportamiento entrenado sin tener que resolver la incompatibilidad de `config.json` del fork original.
- Evaluación en simulación IsaacLab: el checkpoint proviene de un entrenamiento en IsaacLab sobre un UR7e, por lo que su uso natural es medir la tasa de éxito de la tarea `grasp_pan` en ese mismo simulador antes de plantear cualquier transferencia.
- Transferencia sim-to-real sobre un UR7e: con los procesadores originales y el `crop_shape` correcto, el checkpoint puede desplegarse sobre el brazo real, aceptando el coste de ajuste de dominio que implica el salto de simulación a hardware.
- Fine-tuning con demostraciones propias: al ser un checkpoint de 278,9 M de parámetros, el ajuste fino sobre un dataset propio de una tarea nueva es viable en una única GPU de gama alta, partiendo de representaciones visuales ya entrenadas.
- Validación de pipelines de datos de robots: la distinción entre `crop_shape` y `resize_shape` convierte este repositorio en un caso de prueba útil para verificar que el preprocesado del cliente coincide con el contrato del checkpoint antes de lanzar entrenamientos largos.
- Integración en un stack de aprendizaje por imitación: sirve como baseline de Diffusion Policy frente a otras políticas del ecosistema LeRobot (por ejemplo ACT) en comparativas internas de tasa de éxito y robustez.
- Docencia y divulgación técnica: es un ejemplo compacto y de peso moderado (1,1 GB) para explicar cómo se empaqueta, versiona y carga una política de difusión, y por qué la configuración de preprocesado forma parte de la interfaz del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona de forma cualitativa que el uso de la variante incorrecta de preprocesado da "aproximadamente 0 de éxito", sin cifras concretas de tasa de éxito, número de episodios evaluados ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1,1 a 3 GB considerando 278,9 M de parámetros y los buffers de activación de los codificadores visuales, asumiendo pesos en 32 bits. No se publican mediciones oficiales; el valor es una estimación a partir del tamaño del repositorio.
- Cabe en GPU de consumo: sí, con margen amplio. Una RTX 3060 (12 GB), RTX 4070 o RTX 4090 pueden ejecutar la política; el cuello de botella previsible es la latencia del bucle de denoising, no la memoria.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para inferencia, pero son adecuadas para reentrenamiento o fine-tuning sobre datasets de demostraciones grandes.
- Opciones de despliegue: PyTorch con LeRobot 0.4.4 y el módulo `lerobot.policies.diffusion`. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. Una Diffusion Policy requiere múltiples pasos de denoising por cada chunk de acciones, lo que condiciona la frecuencia de control alcanzable, pero no se publican cifras de latencia ni de frecuencia en la información disponible.
- Almacenamiento: 1,1 GB de repositorio, sin requisitos especiales de disco.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como categorías equivalentes pueden señalarse la Diffusion Policy original, la política ACT del ecosistema LeRobot y las políticas vision-language-action como SmolVLA o pi0, pero no se han facilitado parámetros, contextos, resultados ni licencias de esas alternativas en esta consulta, por lo que cualquier cifra sería inventada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp_grasp_pan_abs_ee_60k_compat (DexSteer) | 278.928.794 | No aplica | No disponible | No disponible | HuggingFace, 0 descargas |
| Diffusion Policy (referencia original) | No disponible | No aplica | No disponible | No disponible | No disponible en esta consulta |
| ACT (LeRobot) | No disponible | No aplica | No disponible | No disponible | No disponible en esta consulta |
| SmolVLA / pi0 (VLA) | No disponible | No disponible | No disponible | No disponible | No disponible en esta consulta |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, cobertura de escenarios ni diversidad de demostraciones del dataset de entrenamiento.
- Riesgo de fallo por desajuste de preprocesado: es la limitación más crítica y la única documentada explícitamente. Si el cliente no entrega imágenes ya redimensionadas a 224x224, el center-crop produce una entrada distinta a la esperada y la tasa de éxito cae a aproximadamente cero. Hay que elegir la variante que coincida con el pipeline de entrada.
- Origen sintético: el checkpoint proviene de un entrenamiento en IsaacLab, no de demostraciones en hardware real. La transferencia a un UR7e físico puede degradarse por diferencias de apariencia, iluminación, dinámica y calibración.
- Especificidad de tarea y robot: el nombre del repositorio indica tres tareas, un UR7e y la tarea `grasp_pan`. No hay evidencia de generalización a otras tareas, otros objetos u otros brazos sin fine-tuning.
- Acciones absolutas de efector final: el sufijo `abs_ee` del nombre apunta a acciones absolutas en el espacio del efector final, lo que en la práctica condiciona el marco de referencia y la calibración del robot; no se detalla el espacio de acción en la model card.
- Alucinación: el concepto no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de generar trayectorias plausibles y físicamente incorrectas en estados fuera de la distribución de entrenamiento.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en una situación jurídica indeterminada. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, es decir, sin validación externa conocida ni informes de terceros sobre su funcionamiento.
- Idiomas y contexto: no aplica ninguno de los dos, ya que el modelo no procesa lenguaje natural ni ventanas de tokens. No debe evaluarse con criterios de modelo de lenguaje.
- Mantenimiento: la copia se creó y actualizó el mismo día (2026-09-11) y no hay indicios de seguimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DexSteer/dp_grasp_pan_abs_ee_60k_compat
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de referencia del módulo de política de difusión: `lerobot.policies.diffusion.modeling_diffusion.DiffusionPolicy` (dentro del repositorio de LeRobot)
- No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a guías de herramientas de diseño UX y no guardan relación con este modelo.
