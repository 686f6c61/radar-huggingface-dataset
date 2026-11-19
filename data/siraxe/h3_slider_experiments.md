# siraxe/H3_slider_experiments

## Resumen

H3_slider_experiments es una colección de adaptadores LoRA experimentales publicada por el usuario siraxe sobre el modelo base MiniMaxAI/MiniMax-H3, orientado a generación de vídeo a partir de texto (text-to-video) y con etiquetas que también apuntan a text-to-audio. El repositorio no contiene un modelo completo, sino un conjunto de "sliders": LoRAs de bajo rango que permiten modular de forma continua atributos concretos de la generación, como la velocidad del movimiento, el nivel de detalle, el desenfoque de movimiento (smear), la altura de cámara o movimientos de cámara tipo arco.

La propuesta es práctica: en lugar de reescribir prompts complejos para controlar un aspecto visual, el usuario invoca un token o etiqueta específica (por ejemplo `H3_SPEED_slider` o `H3_DETAIL_slider`) y el adaptador amplifica o atenúa ese efecto según el valor indicado. El repositorio ocupa 0,8 GB y se distribuye con la librería minimax-h3 y compatibilidad declarada con diffusers.

Por su naturaleza de experimento, la documentación es mínima: no se detallan datos de entrenamiento, licencia ni resultados cuantitativos. Su interés radica en mostrar un patrón de control fine-grained sobre modelos de difusión de vídeo mediante LoRAs de rango bajo, reutilizable por quienes trabajen con MiniMax-H3 y quieran explorar control de atributos sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMaxAI/MiniMax-H3; arquitectura del base no disponible |
| Parametros totales | no disponible (repo de 0,8 GB; se mencionan versiones "pruned rank4") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan variantes pruned rank4) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (compatible con diffusers y librería minimax-h3) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA sobre MiniMax-H3. La model card describe cada slider como un control que responde a una etiqueta textual concreta: `H3_CAMERA_ARC_slider`, `H3_HIGH_ALTITUDE_slider`, `H3_DETAIL_slider`, `H3_SPEED_slider`, `H3_SMEAR_slider` y un slider genérico de niebla ("sun fog slider"). El autor indica que no se necesita un prompt específico: basta con describir el efecto y el LoRA lo hace pronunciado, y que las versiones "pruned rank4" pueden comportarse de forma más limpia en valores altos.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Tampoco se detalla la arquitectura interna del modelo base (transformer de difusión, híbrido, etc.) ni innovaciones como decodificación especulativa o atención lineal. La única indicación técnica relevante es el uso de rangos bajos (rank4) y el escalado de los valores del slider, con ejemplos como `(+ 2.0 4.0 6.0)` para el slider de cámara o `(0.3 - 0.9)` para el de altitud.

## Capacidades

- Control fine-grained de atributos de vídeo generado mediante etiquetas de slider: velocidad, detalle, smear (desenfoque de movimiento), altura de cámara y arco de cámara.
- Modulación por valores numéricos: los ejemplos de la model card muestran rangos como `+2.0 4.0 6.0` o `0.3 - 0.9`, lo que permite graduar la intensidad del efecto.
- Generación de vídeo texto-a-vídeo a través del modelo base MiniMax-H3 (pipeline declarado: text-to-video).
- Etiquetas adicionales de text-to-audio, lo que sugiere que el ecosistema del modelo base cubre también generación de audio, aunque no se detalla el alcance de los sliders en ese dominio.
- Compatibilidad declarada con diffusers y con la librería minimax-h3.
- Soporte de prompts descriptivos en inglés; no se documentan capacidades multilingües.
- No se documentan tool calling, function calling, razonamiento multi-step ni modo thinking.

## Casos de uso

- Ajuste de movimiento en planos de cámara: usar `H3_CAMERA_ARC_slider` con valores como `+2.0 4.0 6.0` para generar variaciones de trayectoria de cámara sin reescribir el prompt, útil en previsualización de storyboards.
- Control de ritmo de una secuencia: aplicar `H3_SPEED_slider` para acelerar o ralentizar el movimiento aparente de una toma generada, por ejemplo para adaptar clips a una duración de montaje concreta.
- Gestión de nitidez y textura: emplear `H3_DETAIL_slider` para subir o bajar el nivel de detalle según el destino del material (render final frente a animática rápida).
- Desenfoque de movimiento artístico: usar `H3_SMEAR_slider` en el rango `+12` a `-12` para conseguir desde un barrido agresivo hasta una imagen casi estática, aplicable a transiciones estilizadas.
- Variación de punto de vista aéreo: `H3_HIGH_ALTITUDE_slider` con valores escalados entre `0.3` y `0.9` para simular tomas desde dron o desde altura variable en una misma secuencia.
- Atmósfera y niebla: el slider "sun fog" permite introducir o retirar bruma y luz solar difusa en escenas exteriores, útil para igualar la continuidad atmosférica entre planos.
- Exploración de parámetros en investigación: servir de base para estudiar cómo LoRAs de rank bajo modifican atributos de un modelo de difusión de vídeo, comparando versiones pruned frente a no pruned.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base MiniMax-H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio de 0,8 GB corresponde solo a los pesos LoRA, no al modelo base.
- Opciones de despliegue: diffusers y la librería minimax-h3, según las etiquetas del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| siraxe/H3_slider_experiments | LoRA sobre MiniMax-H3 | no disponible | no disponible | no disponible | Sliders de atributos (velocidad, detalle, smear, cámara, altitud) |
| MiniMaxAI/MiniMax-H3 | Modelo base text-to-video | no disponible | no disponible | no disponible | Base sobre la que se aplican los adaptadores |
| Alternativas LoRA para control de atributos en vídeo | Adaptadores | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros adaptadores o modelos de la misma categoría.

## Limitaciones y advertencias

- Proyecto experimental: el propio autor lo describe como "experimental slider tests" y lo entrega "as is", sin garantías de estabilidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; es imprescindible verificar también la licencia del modelo base MiniMax-H3 antes de cualquier despliegue en producción.
- Idiomas: solo se declara inglés (`en`); el comportamiento con prompts en castellano no está documentado.
- Valores altos del slider pueden degradar la calidad: el autor advierte que las versiones pruned rank4 pueden ser más limpias en valores altos, lo que implica que las versiones no pruned pueden producir artefactos.
- Sin datos de entrenamiento ni evaluación: no hay información sobre sesgos, tasas de alucinación visual ni métricas objetivas de fidelidad al prompt.
- Dependencia del modelo base: cualquier limitación de MiniMax-H3 (resolución, duración de clip, coherencia temporal) se hereda.
- Documentación mínima: no se especifican formatos de pesos, rangos recomendados oficiales ni compatibilidad verificada con versiones concretas de diffusers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/siraxe/H3_slider_experiments
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Ejemplos de vídeo referenciados en la model card: `vid/w1.mp4`, `vid/w2.mp4`, `vid/w3.mp4`, `vid/w4.mp4`, `vid/w5.mp4`, `vid/w6.mp4` (rutas relativas dentro del repositorio)
