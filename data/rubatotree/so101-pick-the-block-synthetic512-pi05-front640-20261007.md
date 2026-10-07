# rubatotree/so101-pick-the-block-synthetic512-pi05-front640-20261007

## Resumen

so101-pick-the-block-synthetic512-pi05-front640-20261007 es un checkpoint de robótica publicado por el usuario rubatotree, consistente en un ajuste fino (fine-tune) del modelo base lerobot/pi05_base, es decir, la familia π0.5 de modelos vision-lenguaje-acción (VLA). El modelo resuelve una tarea concreta de pick-and-place sobre un brazo robótico SO-101: a partir de una cámara frontal a 640×480 y un vector de estado del robot de seis dimensiones, predice una acción de seis dimensiones.

El entrenamiento se realizó sobre el dataset sintético rubatotree/pick-the-block-synthetic-512 (512 episodios, 153520 fotogramas) durante 20000 actualizaciones del optimizador con batch size 2, mediante full fine-tuning en bfloat16. El checkpoint tiene 4.143.404.816 parámetros (unos 4,14 mil millones) y un tamaño de repositorio de 9,4 GB.

Es relevante porque ejemplifica el flujo actual de personalización de políticas VLA para robots de bajo coste (SO-101) usando datos sintéticos, un patrón creciente en robótica open source. Su interés es, por tanto, como caso de estudio de fine-tuning de π0.5 más que como modelo generalista: está especializado en una única tarea y no aporta métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en π0.5 (modelo base lerobot/pi05_base); el detalle interno no se especifica en la model card |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, entrenados en bfloat16) |
| Idiomas soportados | no disponible (modelo de robotica, no orientado a lenguaje natural) |
| Licencia | gemma (Gemma Terms of Use; seccion 3.2 y Gemma Prohibited Use Policy aplican) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base lerobot/pi05_base (π0.5), una política vision-lenguaje-acción que toma imágenes y estado propioceptivo como entrada y produce acciones motoras. La model card no detalla la arquitectura interna (backbone de visión-lenguaje, mecanismo de generación de acciones, número de tokens de contexto), por lo que esos extremos quedan como no disponibles; sí confirma la interfaz del modelo: una cámara frontal a 640×480 más un vector de estado del robot de 6 dimensiones como entrada, y un vector de acción de 6 dimensiones como salida.

El entrenamiento fue un full fine-tuning (no LoRA ni adaptadores) desde la revisión fijada `b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba` del modelo base, con 20000 actualizaciones del optimizador y batch size 2. Se usó dtype bfloat16 con gradient checkpointing, optimizador AdamW (learning rate 2,5e-05, weight decay 0,01) y scheduler cosine_decay_with_warmup con 1000 pasos de warmup. El dataset es sintético y exclusivo de pick: rubatotree/pick-the-block-synthetic-512, con 512 episodios y 153520 fotogramas. No se declara ningún mecanismo de RLHF, DPO ni evaluación con conjunto de validación retenido.

## Capacidades

- Control robótico de tipo pick-and-place sobre el brazo SO-101.
- Percepción visual mediante una única cámara frontal a 640×480.
- Integración de estado propioceptivo de 6 dimensiones como entrada.
- Predicción de acciones motoras de 6 dimensiones (salida de control).
- Fine-tune especializado de la política π0.5 sobre datos sintéticos.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles; la visión es específica para el control de la tarea.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede accionar un brazo SO-101 para recoger un bloque y colocarlo, usando solo la cámara frontal y el estado del robot como entrada; encaja porque está entrenado exactamente para esa tarea.
- Banco de pruebas de datos sintéticos: sirve para estudiar hasta qué punto un dataset sintético de 512 episodios basta para especializar una política VLA antes de invertir en recogida de datos real.
- Base de partida para nuevos fine-tunes: al ser un checkpoint de π0.5 ya adaptado a manipulación de pick, puede reutilizarse como inicialización para tareas de recogida relacionadas.
- Reproducción de pipelines LeRobot: el repositorio es un checkpoint de la librería lerobot, por lo que puede cargarse directamente en flujos de entrenamiento e inferencia de esa biblioteca.
- Investigación en evaluación de políticas VLA: útil para comparar metodologías de fine-tuning (full fine-tuning frente a adaptadores) sobre el mismo modelo base y dataset.
- Demostraciones educativas de robótica de bajo coste: junto con un SO-101, permite ilustrar el ciclo completo dato sintético → fine-tune → despliegue en un robot económico.
- Pruebas de estrés de robustez visual: al depender de una sola cámara fija, permite medir la sensibilidad de la política ante cambios de iluminación, posición o escena en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este entrenamiento no incluye ningún conjunto de validación retenido ni evaluación de tasa de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros en bfloat16/fp16, los pesos ocupan aproximadamente 8,3 GB; sumando el codificador de visión y las activaciones, conviene disponer de 12–16 GB o más.
- Cuantizaciones de menor precisión (int8 ~4,1 GB, int4 ~2,1 GB) reducirían el requisito, pero no se documentan cuantizaciones oficiales para este checkpoint (no disponible).
- GPU recomendadas: para entrenamiento o inferencia cómoda, A100/H100 (40–80 GB) o GPUs de 24 GB como RTX 3090/4090; la inferencia en bfloat16 debería caber en GPUs de 16 GB con margen ajustado.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 16–24 GB (RTX 4080/4090, RTX 3090), asumiendo que se ejecute solo la inferencia de la política.
- Opciones de despliegue: librería lerobot (formato nativo del checkpoint). No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI para este modelo (no disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de informacion publica general; conviene verificarlos en sus fichas oficiales.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| so101-pick-the-block-synthetic512-pi05-front640-20261007 | ~4,14 B | VLA (fine-tune de π0.5) | gemma | HuggingFace (0 descargas) |
| lerobot/pi05_base | ~4,1 B (no confirmado en la info proporcionada) | VLA (π0.5) | gemma (segun el modelo base) | HuggingFace |
| SmolVLA (lerobot/smolvla_base) | ~450 M | VLA | no disponible en la informacion proporcionada | HuggingFace / LeRobot |
| OpenVLA (openvla/openvla-7b) | ~7 B | VLA | no disponible en la informacion proporcionada | HuggingFace |

Frente al modelo base, este checkpoint cambia la política generalista por una especializada en pick sobre SO-101; frente a SmolVLA y OpenVLA, se diferencia por tamaño intermedio y por estar atado a un robot y una tarea concretos, sin métricas de éxito publicadas.

## Limitaciones y advertencias

- Sesgos y dominio: entrenado exclusivamente con datos sintéticos de una única tarea (pick) y un único robot (SO-101); se espera un fuerte sesgo hacia esa configuración y escasa generalización fuera de ella.
- Riesgo de error en la acción: sin evaluación de tasa de éxito ni validación retenida, no puede garantizarse un desempeño fiable; en robótica, un fallo de la política puede implicar colisiones o daños.
- Cámara única y escena fija: la dependencia de una sola vista a 640×480 y del estado propioceptivo limita la robustez ante oclusiones o cambios de montaje.
- Contexto e idioma: no se declaran capacidades de comprensión de lenguaje ni una ventana de contexto; no es un modelo de texto general.
- Licencia: sujeta a los Gemma Terms of Use; aplican las restricciones de uso de la sección 3.2 y la Gemma Prohibited Use Policy. El modelo no es un producto de Google ni está respaldado por Google, y debe conservarse el NOTICE y el aviso de modificación incluidos.
- Producción: al no existir validación ni métricas, no es recomendable desplegarlo en entornos reales sin una evaluación adicional propia.
- Reproducibilidad: se incluye un hash de configuración de entrenamiento y digests SHA-256 del material del modelo base, lo que ayuda a auditar el origen, pero no sustituye una evaluación funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubatotree/so101-pick-the-block-synthetic512-pi05-front640-20261007
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/pick-the-block-synthetic-512
- Librería LeRobot: https://github.com/huggingface/lerobot
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
