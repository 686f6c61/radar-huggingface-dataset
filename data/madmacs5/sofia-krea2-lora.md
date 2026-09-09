# madmacs5/sofia-krea2-lora

## Resumen

`madmacs5/sofia-krea2-lora` es un adaptador de tipo LoRA (Low-Rank Adaptation) diseñado para el modelo base Krea 2, un sistema de difusión de código abierto orientado a la generación fotorealista de imágenes. El modelo ha sido creado por el autor `madmacs5` (identificado como `mad_macs` en la model card) y tiene como objetivo fijar la identidad de un personaje ficticio llamado Sofía, una mujer de rasgos latinos, pelo oscuro, ojos marrones y una silueta curvilínea tipo reloj de arena.

El repositorio contiene dos adaptadores en formato `safetensors`: uno principal para la identidad facial (`sofia_face_v4_blend.safetensors`) y otro opcional para un cuerpo más delgado (`sofia_slim_body.safetensors`). El modelo no es un sistema autónomo, sino un componente que debe cargarse sobre un checkpoint de Krea 2. Se ha entrenado desde cero sobre una mezcla de checkpoints de Krea 2 (RawGirl + Realism + DarkBeast) para conseguir un bloqueo de identidad más nítido y una textura de piel natural, según indica su autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA basado en adaptadores de bajo rango sobre el modelo base Krea 2 (modelo de difusión de imágenes) |
| Parametros totales | No disponible (el repositorio ocupa 1.4 GB, que incluye los dos adaptadores en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica, es un modelo de generación de imágenes) |
| Tipos de cuantizacion | No disponible (no se especifican en la ficha) |
| Idiomas soportados | No disponible (no aplica, es un modelo de generación de imágenes) |
| Licencia | No disponible (no se especifica en HuggingFace ni en la model card) |
| Formato de pesos | safetensors (dos archivos: `sofia_face_v4_blend.safetensors` y `sofia_slim_body.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un LoRA, una técnica de afinado eficiente que añade matrices de bajo rango a las capas de un modelo preentrenado, permitiendo ajustar el comportamiento sin modificar los pesos originales. En este caso, el adaptador se aplica sobre Krea 2, un modelo de difusión de última generación que produce resultados fotorealistas y tiene una fuerte adherencia al prompt.

Según la model card, el LoRA facial fue reentrenado desde cero sobre una base combinada de Krea 2 llamada «RawGirl + Realism + DarkBeast». No se proporcionan detalles sobre el tamaño del dataset, el número de imágenes de entrenamiento, la técnica de optimización ni si se utilizaron técnicas de alineación como RLHF o DPO, que por otra parte no aplican a este tipo de modelos generativos de imágenes. El único dato técnico adicional es que el LoRA facial se recomienda usar con una fuerza de 0.3 (rango 0.2–0.5), mientras que el LoRA de cuerpo delgado está pensado para apilarse con el facial a fuerzas de 0.6 y 0.8 respectivamente, usando la misma semilla.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje específico: el LoRA facial fija los rasgos de Sofía (pelo oscuro, ojos marrones, rostro de rasgos latinos) de forma consistente.
- Control de identidad mediante fuerza ajustable: la fuerza recomendada de 0.3 consigue un equilibrio entre fijación de identidad y ausencia de «bleeding» o contaminación de rasgos.
- Variaciones corporales con el segundo adaptador: el LoRA `sofia_slim_body.safetensors` permite, en tomas de espalda, laterales o traseras, generar una silueta más delgada. Es compatible con el LoRA facial, apilándose con fuerzas de 0.6 y 0.8.
- Adherencia al estilo: el modelo funciona especialmente bien en estilos fotográficos con iluminación natural y luz suave de día, tal como indica la model card.
- Personalización por semilla: el autor recomienda mantener la misma semilla al combinar ambos LoRA, lo que permite iterar sobre la misma composición cambiando solo la fuerza.
- No dispone de capacidades de tool calling, razonamiento simbólico, agentes multietapa ni procesamiento de lenguaje, al ser un componente de difusión.

## Casos de uso

- Ilustración de personajes para novelas visuales: el LoRA facial permite generar retratos coherentes de la protagonista a lo largo de diferentes escenas, manteniendo la misma identidad con una fuerza de 0.3.
- Fotografía simulada de stock: el modelo produce imágenes de una persona ficticia con aspecto fotográfico y luz natural, aptas para maquetas, plantillas o pruebas de diseño antes de una sesión real.
- Diseño de personajes para videojuegos: al apilar el LoRA de cuerpo delgado en tomas de espalda o laterales, se pueden explorar variantes de silueta sin perder la identidad facial fijada por el adaptador principal.
- Storyboards cinematográficos: la consistencia entre planos permite previsualizar al mismo personaje en diferentes ángulos y encuadres, lo que agiliza el desarrollo conceptual de secuencias.
- Avatares personalizados para comunidades o foros: se puede generar una imagen de perfil única con el rostro de Sofía y un fondo natural, ajustando la fuerza para evitar que se mezclen rasgos de otras imágenes.
- Pruebas de casting virtual: variando la semilla se pueden obtener múltiples interpretaciones del mismo personaje, evaluando peinados, fondos o expresiones sin necesidad de regenerar el modelo base.
- Arte conceptual para portadas: la combinación de un rostro nítido y la posibilidad de alternar entre una silueta curvilínea y una más delgada facilita la composición de cubiertas de libros o cómics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un LoRA para generación de imágenes y no de un modelo de lenguaje, los benchmarks habituales como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se dispone de métricas objetivas de calidad visual, como FID o CLIP score, para este adaptador.

## Requisitos de hardware

- La VRAM necesaria para la inferencia depende del modelo base Krea 2; el LoRA por sí mismo no añade una carga significativa, pero no se especifican los requisitos mínimos del checkpoint original en la información disponible.
- No se indican GPU recomendadas ni se documenta si el conjunto cabe en tarjetas de consumo como una RTX 4060 o 4090. Se desconoce si Krea 2 requiere una GPU profesional del tipo A100 o H100.
- Las opciones de despliegue no están documentadas en la ficha. Al estar en formato `safetensors`, se puede asumir compatibilidad con cargadores de LoRA para modelos de difusión, como ComfyUI o Automatic1111, pero no hay confirmación explícita.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No hay datos comparativos disponibles. Durante la búsqueda web se ha localizado otro LoRA de Krea 2 en HuggingFace (`Playtime-AI/Krea_2-Sofia_Vergara`) que persigue un objetivo similar, pero no se han encontrado especificaciones técnicas, benchmarks ni métricas de rendimiento que permitan una comparación rigurosa. Por tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- El personaje es ficticio y todas las imágenes son generadas por IA, tal como aclara el autor. El modelo no debe utilizarse para afirmar que una persona real ha sido fotografiada.
- La licencia no está especificada en HuggingFace ni en la model card, lo que genera incertidumbre legal para un uso comercial. El autor menciona que es un creador independiente y pide valoraciones en Civitai, pero no se otorgan permisos explícitos.
- La fuerza del LoRA facial es crítica: por debajo de 0.2 la identidad puede no fijarse, y por encima de 0.5 puede aparecer «bleeding» o contaminación entre rasgos faciales. Se recomienda seguir el rango propuesto.
- El LoRA no funciona de forma independiente; requiere el modelo base Krea 2 y una infraestructura que soporte la carga de múltiples adaptadores.
- No se han documentado sesgos específicos, pero al representar a un personaje femenino con una silueta corporal concreta (curvilínea o delgada) el resultado puede reforzar estereotipos de belleza si se usa sin un contexto creativo crítico.
- El resultado depende de la semilla y de las fuerzas aplicadas; pequeñas variaciones pueden producir cambios notables en la composición, por lo que se recomienda iterar de forma controlada.

## Enlaces

- Página del modelo en HuggingFace: [https://huggingface.co/madmacs5/sofia-krea2-lora](https://huggingface.co/madmacs5/sofia-krea2-lora)
- Ecosistema de Krea 2 en Civitai: [https://civitai.com/ecosystems/krea2](https://civitai.com/ecosystems/krea2)
- Otro LoRA de Krea 2 encontrado en la búsqueda (no es el mismo autor): [https://huggingface.co/Playtime-AI/Krea_2-Sofia_Vergara](https://huggingface.co/Playtime-AI/Krea_2-Sofia_Vergara)
