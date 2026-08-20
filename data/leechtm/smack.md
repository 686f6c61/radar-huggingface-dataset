# LeechTM/SMACK

## Resumen

SMACK es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por LeechTM, un creador de contenido audiovisual, para el modelo de generación de vídeo MiniMax-H3 (versión Ref2V). El modelo está diseñado para intensificar los efectos de impacto en vídeos generados: puñetazos, golpes de armas, disparos, colisiones de vehículos, caídas y aterrizajes forzados, otorgando a las escenas una gramática visual propia del cine de acción de Hollywood. Además, modifica el comportamiento de la cámara para que reaccione de forma más dinámica y agresiva a los impactos.

Se trata de un adaptador de pequeño tamaño (0,2 GB) que se carga sobre el modelo base MiniMax-H3, sin necesidad de una palabra de activación (trigger word). El autor lo presenta como una versión beta 1, entrenada sobre 35 clips de vídeo de impactos y movimientos de cámara. Su relevancia actual radica en que aborda una limitación común en los generadores de vídeo: la falta de contundencia física en las acciones de impacto, mejorando la calidad percibida de las secuencias de acción generadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-H3 (Ref2V) |
| Parámetros totales | no disponible (tamaño del adaptador: 0,2 GB) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (presumible, no confirmado en la model card) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que modifica el comportamiento del modelo base MiniMax-H3 (versión Ref2V), un modelo de generación de vídeo de la familia MiniMax. El adaptador se ha entrenado sobre un conjunto de 35 clips de vídeo que contienen impactos (puñetazos, armas, disparos, colisiones, caídas) y movimientos de cámara dinámicos. El entrenamiento se realizó mediante ajuste fino de bajo rango sobre el modelo base, sin especificarse el método exacto (RLHF, DPO, etc.). No se detalla la cantidad de tokens o el proceso de entrenamiento en la información disponible. La innovación técnica principal es la capacidad de modificar la "gramática de acción" de las escenas generadas, aportando peso, seguimiento y consecuencias físicas a los impactos, así como una cinematografía más agresiva y deliberada.

## Capacidades

- Generación de vídeo con énfasis en escenas de acción e impacto (puñetazos, golpes de armas, disparos, colisiones de vehículos, caídas).
- Mejora del movimiento de cámara en escenas de impacto: movimientos dinámicos, ángulos agresivos y reacción física al golpe.
- Sin necesidad de palabra de activación; se carga como LoRA sobre MiniMax-H3 y funciona con descripciones de escenas habituales.
- Capacidad de "seasoning" (condimentar) la salida del modelo base, intensificando la contundencia de los efectos.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe más allá del inglés.

## Casos de uso

- Producción de vídeos de acción para plataformas de contenido: el modelo puede utilizarse para generar escenas de peleas, persecuciones o tiroteos con un nivel de impacto visual superior al del modelo base, lo que facilita la creación de clips para redes sociales, trailers o contenido promocional.
- Creación de animaciones de lucha o combate en proyectos independientes: al no requerir una palabra de activación, los artistas pueden describir la escena deseada y obtener un resultado con mayor contundencia física.
- Simulación de efectos de caída y aterrizaje en vídeo generativo: útil para prototipos de secuencias de acción en el ámbito de la previsualización (previs) en cine o videojuegos.
- Mejora de la cinematografía en generación de vídeo: el modelo añade un movimiento de cámara más agresivo y reactivo, lo que puede aplicarse a cualquier escena de acción generada con MiniMax-H3.
- Personalización de escenas de impacto para trailers o teasers: permite generar planos de acción con una "gramática" más hollywoodiense sin necesidad de edición posterior.
- Experimentación en investigación de síntesis de vídeo: el modelo puede servir como caso de estudio para analizar cómo los adaptadores LoRA modifican la física percibida en vídeos generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,2 GB, lo que lo hace muy ligero en términos de almacenamiento.
- El modelo base MiniMax-H3 es un modelo de vídeo de gran tamaño; se desconoce el VRAM exacto, pero es probable que requiera GPUs de alta gama (por ejemplo, A100, H100 o RTX 4090) para la generación de vídeo completa.
- El adaptador se carga sobre el modelo base, por lo que los requisitos de hardware son los mismos que los de MiniMax-H3 más un margen pequeño para el adaptador.
- No se han especificado opciones de despliegue concretas, pero al ser un adaptador LoRA, es probable que sea compatible con frameworks de inferencia de difusión como Diffusers o ComfyUI, aunque no está confirmado.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se ha podido establecer una comparativa con modelos similares, ya que la información disponible no incluye datos de modelos comparables (por ejemplo, otros adaptadores LoRA para generación de vídeo de acción). La información de la model card no menciona alternativas ni benchmarks comparativos.

## Limitaciones y advertencias

- El modelo está en fase beta (Beta 1) y su conjunto de entrenamiento es reducido (35 clips), lo que puede limitar su generalización a otros tipos de impacto o estilos de vídeo.
- El autor advierte que el modelo puede "sobreactuar" o "subactuar" en ciertos impactos, dependiendo del contenido de entrada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base MiniMax-H3 puede tener sus propias restricciones de uso; es necesario revisar la licencia del modelo base.
- No se han documentado sesgos específicos, pero al ser entrenado con un conjunto pequeño y no diverso, es probable que no cubra adecuadamente todas las variaciones de impacto o contextos culturales.
- El modelo solo está entrenado para el idioma inglés en la descripción de la escena, aunque la generación de vídeo no depende del lenguaje.
- No se garantiza que los resultados sean estables en producciones de alta exigencia; es recomendable validar la salida en cada caso.

## Enlaces

- [HuggingFace - LeechTM/SMACK](https://huggingface.co/LeechTM/SMACK)
- [Perfil de YouTube de LeechTM](https://www.youtube.com/c/LeechTM/about)
- [Sitio web de LeechTM](https://www.leechtm.com/)
