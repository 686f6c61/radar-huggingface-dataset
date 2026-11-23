# fidel1234/Krea2_Asian_Character

## Resumen

Krea2 Asian Character es un adaptador LoRA (Low-Rank Adaptation) para los modelos de generación de imágenes Krea 2, desarrollado por el usuario fidel1234. Su función es especializar el modelo base en la representación de personajes de etnia asiática, con énfasis en rasgos japoneses, sin necesidad de reentrenar el modelo completo. Se distribuye como un conjunto de ficheros `.safetensors` compatibles tanto con la variante Raw como con la Turbo de Krea 2.

El adaptador se entrenó con AI-Toolkit sobre Krea-2-Raw y emplea un dataset seleccionado manualmente que equilibra primeros planos, planos medios, cuerpo completo y distintos ángulos, lo que permite control flexible de encuadre y perspectiva. Cada fichero LoRA incluye una imagen de muestra con el mismo nombre que el `.safetensors`, y el flujo de trabajo y la palabra de activación están embebidos únicamente en los metadatos de esa imagen, no en el fichero de pesos.

El repositorio tiene un tamaño de 51,3 GB, acumula 1.404.319 descargas y 66 likes en el momento de la consulta, y se publica bajo licencia MIT, con la advertencia de que el uso del modelo base subyacente queda sujeto además a la Krea 2 Community License y a su Acceptable Use Policy. Su relevancia práctica radica en que ofrece un ajuste de estilo y demografía concreto sobre un modelo base reciente, con compatibilidad declarada para checkpoints raw y turbo en ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el número de parámetros entrenables no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declaran idiomas; las palabras de activación son en inglés) |
| Licencia | MIT (sujeta además a la Krea 2 Community License Agreement y Acceptable Use Policy del modelo base) |
| Formato de pesos | safetensors (ficheros LoRA) |
| Modelo base | krea/Krea-2-Raw y krea/Krea-2-Turbo |
| Framework de entrenamiento | AI-Toolkit |
| Libreria | diffusers |
| Peso recomendado | 0,8 - 1,0 |
| Pasos de inferencia recomendados | 20 - 30 |
| Tamano del repositorio | 51,3 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo de difusión base Krea 2 para modificar su comportamiento sin alterar los pesos originales. Se entrenó sobre Krea-2-Raw utilizando AI-Toolkit y es compatible también con Krea-2-Turbo, lo que permite combinarlo con la variante destilada para inferencia con menos pasos. No se especifican en la información disponible el rango del LoRA, el número de pasos de entrenamiento, el tamaño exacto del dataset ni la composición detallada del mismo más allá de la descripción cualitativa.

La innovación destacable no está en la arquitectura del adaptador, que es estándar, sino en la curaduría del dataset: se declara una mezcla equilibrada de primeros planos, planos medios, cuerpo completo y ángulos diversos, orientada a que el LoRA responda de forma flexible a distintos encuadres y perspectivas. El flujo de generación y la palabra de activación no se almacenan en el `.safetensors`, sino en los metadatos de la imagen de muestra asociada, de modo que arrastrar esa imagen a ComfyUI recupera automáticamente los parámetros y el trigger word.

## Capacidades

- Generación de imágenes de personajes de etnia asiática, con énfasis en rasgos japoneses, sobre los modelos Krea 2 Raw y Turbo.
- Control de encuadre y perspectiva: el dataset de entrenamiento cubre primeros planos, planos medios y cuerpo completo, con distintos ángulos.
- Compatibilidad con checkpoints raw y turbo del modelo base, lo que permite elegir entre calidad máxima y generación rápida.
- Integración con ComfyUI mediante arrastrar y soltar la imagen de muestra, que carga workflow, parámetros y palabra de activación.
- Ajuste de intensidad del efecto mediante el peso del LoRA, con rango recomendado de 0,8 a 1,0.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es un adaptador exclusivamente de generación de imágenes.
- No se declaran capacidades multilingües específicas.

## Casos de uso

- Ilustración de personajes para cómics y novela gráfica: el LoRA permite generar de forma consistente personajes asiáticos en distintos encuadres (primer plano, plano medio, cuerpo entero), lo que facilita mantener una hoja de personaje coherente a lo largo de varias páginas.
- Diseño de personajes para videojuegos: con pesos entre 0,8 y 1,0 y 20-30 pasos se pueden producir variaciones de un mismo personaje en distintas poses y ángulos, útiles para fichas de concepto y referencias de modelado.
- Previsualización de arte conceptual en publicidad: equipos creativos pueden iterar rápidamente sobre casting visual de personajes asiáticos antes de contratar fotografía o ilustración final, usando la variante Turbo para bocetos rápidos y Raw para piezas finales.
- Generación de avatares y retratos para aplicaciones: el sesgo del dataset hacia primeros planos permite producir retratos con encuadre controlado, adecuados para perfiles, material promocional o contenido editorial.
- Creación de ilustraciones para merchandising y productos derivados: la licencia MIT permite uso comercial del adaptador, siempre que se respete la licencia del modelo base Krea 2, lo que habilita su incorporación en flujos de producción de láminas, camisetas o artículos similares.
- Prototipado de storyboards y animáticas: la combinación de planos medios y cuerpo completo con distintos ángulos permite generar secuencias de viñetas con continuidad visual de personaje antes de pasar a producción.
- Integración en pipelines de ComfyUI para estudio: al arrastrar la imagen de muestra se recuperan workflow y trigger word, lo que reduce el tiempo de configuración al incorporar el LoRA a un estudio o a un equipo de artistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el LoRA; depende enteramente del checkpoint base Krea 2 (Raw o Turbo) y de la precisión empleada, datos que no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el repositorio ocupa 51,3 GB, lo que sugiere múltiples ficheros LoRA y no un único adaptador, pero no se detalla el peso individual de cada uno.
- Opciones de despliegue: ComfyUI (raw y turbo), con flujo cargable desde la imagen de muestra; la librería declarada es diffusers, por lo que también es integrable en pipelines basados en dicha librería.
- Latencia y throughput: no disponibles; los pasos de inferencia recomendados son 20-30.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Contexto / parámetros | Disponibilidad |
|---|---|---|---|---|---|
| Krea2 Asian Character (fidel1234) | LoRA de personajes asiáticos | Krea-2-Raw / Krea-2-Turbo | MIT (más licencia del base) | No disponible | Hugging Face, 1.404.319 descargas |
| Krea 2 base (krea/Krea-2-Raw, Krea-2-Turbo) | Modelo de difusión completo | — | Krea 2 Community License | No disponible | Hugging Face |
| Otros LoRA de personajes para Krea 2 | LoRA | Krea-2 | Variable | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, modelo base y licencia.

## Limitaciones y advertencias

- Sesgo demográfico deliberado: el adaptador está entrenado "mostly for Asian Ethnicity especially Japanese", por lo que su uso fuera de ese dominio puede producir resultados menos fieles o estereotipados.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión: anatomía incorrecta, manos deformadas o incoherencias en encuadres complejos, sin que se documenten tasas de fallo.
- La palabra de activación y el workflow no están en el `.safetensors`, sino en los metadatos de la imagen de muestra; si esa imagen se pierde, se pierde también la configuración de referencia.
- Licencia MIT para el adaptador, pero el uso del modelo base Krea 2 exige cumplir además la Krea 2 Community License Agreement y la Acceptable Use Policy, lo que puede restringir el uso comercial del conjunto.
- El autor incluye un descargo sobre uso responsable y consentimiento de las personas representadas; no se documentan mecanismos técnicos de filtrado o seguridad en el propio LoRA.
- No se declaran idiomas soportados ni evaluación multilingüe de los prompts.
- El tamaño del repositorio (51,3 GB) y la mención de 200 LoRA en la model card indican un conjunto grande de adaptadores; no se detalla qué fichero corresponde a qué variante o estilo.
- No se publican benchmarks, métricas de fidelidad ni comparaciones cuantitativas con otros adaptadores, lo que dificulta evaluar su calidad de forma objetiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fidel1234/Krea2_Asian_Character
- Demo/showcase en Spaces: https://huggingface.co/spaces/fidel1234/Krea2_Asian_Character_Showcase
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Imagen de muestra citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/6976c9f5ed83a19aef9c76ba/lJwLbXGxPGL4xsUmT3Jk6.png
