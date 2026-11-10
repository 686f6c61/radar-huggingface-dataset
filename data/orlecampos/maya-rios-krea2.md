# orlecampos/maya-rios-krea2

## Resumen

Maya Ríos es un LoRA de identidad de personaje para el modelo de generación de imágenes Krea 2 (Raw), desarrollado por el usuario orlecampos bajo el identificador `orlecampos/maya-rios-krea2`. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un adaptador de bajo rango (rank 64) entrenado con la herramienta ai-toolkit sobre la arquitectura `krea2`, con 2000 pasos a resolución 512, cuyo objetivo es reproducir de forma consistente un personaje ficticio concreto (Maya Ríos) a partir de una palabra de activación.

El adaptador resuelve un problema acotado pero relevante en flujos de trabajo creativos: mantener la coherencia visual de un personaje a lo largo de múltiples generaciones sin necesidad de describirlo por completo en cada prompt. Al fijar rasgos como ojos azul-acinqueados, cabello negro liso largo, una marca pequeña en la mejilla izquierda junto a la mandíbula y un collar fino con barra horizontal, el LoRA permite iterar escenas y vestuarios manteniendo la identidad del personaje.

Es relevante ahora porque el ecosistema de LoRAs de personaje sobre modelos de difusión de última generación permite a artistas y estudios construir bibliotecas de personajes reutilizables con un coste de entrenamiento bajo. El repositorio, de apenas 0,5 GB y con un único archivo de pesos de 457 MB, es un ejemplo típico de adaptador ligero listo para cargarse junto al modelo base Krea 2 Raw.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2 Raw, arquitectura `krea2` |
| Parámetros totales | no disponible (adaptador de rango 64; el número exacto de parámetros no se indica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generación de imágenes, no de texto) |
| Tipos de cuantización | no disponible (se distribuye en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la model card está redactada en portugués; el prompt se introduce en el idioma que acepte el modelo base) |
| Licencia | other (licencia no estándar; consultar términos del autor y del modelo base) |
| Formato de pesos | safetensors (`maya_rios_krea2_v1.safetensors`, 457 MB) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) sobre el modelo de difusión Krea 2 Raw. Según la model card, se entrenó con ai-toolkit usando la arquitectura `krea2`, con un rango de 64, 2000 pasos de entrenamiento y resolución de 512 píxeles. No se especifican el tamaño del dataset, la composición de las imágenes de entrenamiento, el optimizador, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como regularización o aumentación de datos.

La innovación principal es la fijación de una identidad de personaje mediante un token de activación (`maya_rios`) que actúa como ancla semántica. El autor advierte de un comportamiento característico de este tipo de adaptadores: el LoRA tiende a reproducir el encuadre y el vestuario presentes en el dataset de entrenamiento cuando el prompt no los especifica, por lo que recomienda describir siempre el figurino y la escena para obtener variación. No se documentan detalles sobre el proceso de curación del dataset ni sobre posibles etapas de refinamiento.

## Capacidades

- Generación de imágenes condicionada por texto del personaje Maya Ríos mediante el token de activación `maya_rios`.
- Reproducción consistente de rasgos faciales definidos: ojos azul-acinqueados, cabello negro liso largo, marca pequeña en la mejilla izquierda junto a la mandíbula y collar fino con barra horizontal.
- Compatibilidad con el modelo base Krea 2 Raw en modo estándar (20–30 pasos, CFG 3–7) y en modo Turbo (4–8 pasos, CFG 1).
- Control de intensidad del efecto mediante peso del adaptador, con rango sugerido de 0,8 a 1,0.
- Variación de escena y vestuario cuando el prompt lo especifica de forma explícita.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, al tratarse de un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de personaje recurrente: usar el token `maya_rios` junto con una descripción de escena para generar ilustraciones coherentes del personaje en distintos entornos, manteniendo rasgos faciales estables entre imágenes.
- Storyboarding y cómic: generar viñetas consecutivas del mismo personaje con encuadres y vestuarios variados, describiendo cada plano en el prompt para evitar que el LoRA replique el encuadre del dataset.
- Diseño de personaje para videojuegos o animación: producir hojas de referencia (turnarounds) del personaje con diferentes ángulos y expresiones, ajustando el peso del adaptador para modular la fidelidad al diseño original.
- Pruebas de vestuario: mantener la identidad facial fija mientras se especifican distintas prendas en el prompt, útil para explorar variantes de diseño antes de producir arte final.
- Prototipado rápido en modo Turbo: generar borradores en 4–8 pasos con CFG 1 para iterar composiciones con baja latencia y, una vez validada la idea, refinar en modo Raw con 20–30 pasos y CFG 3–7.
- Contenido editorial o de marca con personaje propio: integrar el adaptador en un pipeline de generación por lotes para producir material ilustrado con un personaje consistente, siempre que la licencia del adaptador y del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de fidelidad de identidad, similitud facial, FID ni comparaciones con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Krea 2 Raw y de la resolución de generación, no solo del adaptador. El adaptador en sí ocupa 457 MB en disco.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2 Raw, que no se detallan en la información disponible.
- Opciones de despliegue: no se documentan en la model card; el adaptador se distribuye como safetensors y requiere un runtime compatible con Krea 2 Raw y con la carga de LoRAs.
- Latencia y throughput estimados: no disponibles. La model card solo indica configuraciones de pasos (20–30 en Raw, 4–8 en Turbo) y CFG (3–7 en Raw, 1 en Turbo), sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| orlecampos/maya-rios-krea2 | LoRA de personaje sobre Krea 2 Raw | no disponible (rank 64) | no aplica | no disponible | other | Hugging Face, 0 descargas, 0 likes |
| Alternativas de LoRA de personaje sobre Krea 2 | LoRA de personaje | no disponible | no aplica | no disponible | variable | no disponible en la información proporcionada |
| LoRAs de personaje sobre otros modelos de difusión | LoRA de personaje | variable | no aplica | no disponible | variable | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de comparativas directas con otros adaptadores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset no especificado, puede heredar sesgos de composición, iluminación o demografía presentes en él.
- Riesgo de sobreajuste al dataset: el autor advierte explícitamente de que el LoRA reproduce el encuadre y el vestuario del dataset cuando el prompt no los especifica, lo que puede reducir la variedad si no se describen escena y figurino.
- Fidelidad dependiente del peso: el rango sugerido de 0,8–1,0 implica que valores fuera de ese intervalo pueden degradar la identidad o introducir artefactos; no se documenta el comportamiento fuera de rango.
- Limitaciones de idioma: no se especifican idiomas soportados para el prompt; la model card está en portugués y el modelo base determina la cobertura lingüística.
- Restricciones de licencia: la licencia es `other`, no estándar; es imprescindible revisar los términos del autor y del modelo base Krea 2 Raw antes de cualquier uso comercial.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados; conviene evaluar la calidad y la consistencia del personaje con pruebas propias antes de integrarlo en un flujo de producción.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar Krea 2 Raw y un runtime compatible con LoRAs de la arquitectura `krea2`.

## Enlaces

- Hugging Face: https://huggingface.co/orlecampos/maya-rios-krea2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- ai-toolkit (herramienta de entrenamiento citada): no se proporciona enlace en la información disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
