# fidel1234/Krea2

## Resumen

Krea2 es un LoRA (Low-Rank Adaptation) de código abierto publicado por el usuario fidel1234 en Hugging Face, diseñado para especializar los modelos base Krea-2-Raw y Krea-2-Turbo en la generación de personajes japoneses. No se trata de un modelo completo, sino de un adaptador de bajo rango que se aplica sobre los checkpoints de difusión de Krea para sesgar la generación hacia retratos y figuras de estética japonesa con encuadres variados.

El adaptador se entrenó con AI-Toolkit sobre Krea-2-Raw y es compatible tanto con el checkpoint raw como con el turbo del modelo base. El repositorio, de 43,7 GB, incluye los archivos `.safetensors` del LoRA junto con imágenes de muestra que llevan embebido el flujo de trabajo y la palabra de activación en sus metadatos, de modo que se pueden arrastrar directamente en ComfyUI para reproducir la generación.

Su relevancia radica en que amplía las capacidades de los modelos Krea-2 hacia un nicho concreto (personajes japoneses) sin necesidad de reentrenar el modelo completo, con licencia MIT y más de un millón de descargas registradas, lo que lo convierte en uno de los adaptadores más utilizados de esa familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión Krea-2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (orientado a personajes japoneses, sin datos de idioma) |
| Licencia | MIT (sujeta además a la Krea 2 Community License y Acceptable Use Policy del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo de difusión base Krea-2 para modificar su comportamiento sin alterar los pesos originales. Se entrenó sobre Krea-2-Raw utilizando el framework AI-Toolkit, y el autor indica que funciona tanto sobre el checkpoint raw como sobre el turbo.

El dataset de entrenamiento fue seleccionado manualmente ("hand-cherry-picked") e incluye una mezcla equilibrada de primeros planos, planos medios, cuerpo completo y distintos ángulos, con el objetivo de ofrecer flexibilidad de encuadre y control de perspectiva. No se especifican el número de imágenes, el número de pasos de entrenamiento ni la configuración de hiperparámetros. La palabra de activación y los parámetros de generación no están en el archivo `.safetensors`, sino embebidos en los metadatos de las imágenes de muestra.

## Capacidades

- Generación de imágenes de personajes japoneses sobre los modelos base Krea-2-Raw y Krea-2-Turbo.
- Control de encuadre y perspectiva: primeros planos, planos medios y cuerpo completo gracias a la composición del dataset.
- Compatibilidad con ComfyUI (checkpoints raw y turbo) mediante carga del LoRA y arrastre de la imagen de muestra para recuperar el flujo de trabajo.
- Ajuste de intensidad del adaptador recomendado entre 0,8 y 1,0.
- Generación recomendada con 20-30 pasos de inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio, por tratarse de un modelo de difusión de imágenes.

## Casos de uso

- Ilustración de personajes para manga y novela ligera: el LoRA sesga la salida hacia estética japonesa con encuadres variados, útil para generar hojas de personaje en primer plano y cuerpo completo con un mismo adaptador.
- Creación de assets para videojuegos indie: permite producir retratos y sprites de referencia de personajes con estilo consistente usando Krea-2-Turbo para iteraciones rápidas.
- Prototipado de arte conceptual: con 20-30 pasos y pesos entre 0,8 y 1,0 se obtienen variaciones controladas de un mismo personaje para explorar direcciones visuales antes de encargar arte final.
- Generación de avatares y retratos para comunidades y aplicaciones: el entrenamiento en primeros planos facilita retratos con encuadre cerrado y ángulos diversos.
- Flujos de trabajo reproducibles en ComfyUI: al llevar el workflow y la palabra de activación embebidos en la imagen de muestra, un equipo puede compartir parámetros exactos y replicar resultados en producción.
- Ficción y contenido editorial: ilustración de escenas con personajes japoneses en planos medios y completos para portadas, webcómics o material promocional.
- Integración en pipelines de generación por lotes: al ser un LoRA ligero sobre un modelo base, se puede alternar con otros adaptadores en un mismo servidor de difusión sin duplicar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Krea-2 y de la precisión utilizada, no del LoRA, que añade una sobrecarga mínima.
- GPU recomendadas: no disponible en la información proporcionada; al tratarse de un modelo de difusión, se requiere una GPU con VRAM suficiente para el checkpoint base (habitualmente GPU de gama alta o profesional).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del modelo base Krea-2, no del adaptador.
- Opciones de despliegue: ComfyUI (raw y turbo), según la model card; el ecosistema diffusers es compatible por la librería declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Contexto / enfoque | Disponibilidad |
|---|---|---|---|---|---|
| fidel1234/Krea2 | LoRA | Krea-2-Raw / Krea-2-Turbo | MIT (+ licencia Krea) | Personajes japoneses, encuadres variados | Hugging Face, 1.052.724 descargas |
| Krea-2-Raw | Modelo de difusión completo | — | Krea 2 Community License | Generación de imágenes general | Hugging Face (krea/Krea-2-Raw) |
| Krea-2-Turbo | Modelo de difusión completo | — | Krea 2 Community License | Generación rápida (turbo) | Hugging Face (krea/Krea-2-Turbo) |

No se dispone de información sobre otros LoRA comparables de la misma familia en la documentación proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Krea-2-Raw o Krea-2-Turbo para funcionar.
- El uso está sujeto simultáneamente a la licencia MIT del adaptador y a la Krea 2 Community License y Acceptable Use Policy del modelo base; la licencia MIT por sí sola no exime de esas obligaciones.
- El autor advierte explícitamente contra la generación de contenido engañoso, dañino o no consentido de las personas representadas; la responsabilidad recae en el usuario.
- El repositorio está marcado por el autor como en pausa ("I am taking break"), lo que puede implicar falta de mantenimiento o actualizaciones.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas; al estar orientado a personajes japoneses, puede sobrerrepresentar esa estética en prompts genéricos.
- La palabra de activación y los parámetros de generación solo están en los metadatos de las imágenes de muestra, no en el `.safetensors`, por lo que es necesario consultarlas para reproducir resultados.
- No se especifican requisitos de hardware ni rendimiento medido, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fidel1234/Krea2
- Visor de personajes asiáticos: https://huggingface.co/spaces/fidel1234/Krea2_Asian_Character_Showcase
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
