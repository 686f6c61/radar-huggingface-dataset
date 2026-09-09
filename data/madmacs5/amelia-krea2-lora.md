# madmacs5/amelia-krea2-lora

## Resumen

Amelia – Krea 2 Character LoRA es un ajuste fino de bajo rango (LoRA) desarrollado por madmacs5 para el modelo de difusión Krea 2. El objetivo es generar de forma consistente el rostro y la complexión de un personaje ficticio llamado Amelia, con rasgos definidos como cabello castaño balayage, ojos azul grisáceo, piel clara con tono oliva y constitución delgada. Resuelve el problema habitual de pérdida de identidad en retratos generados por IA, permitiendo fijar un rostro concreto con mayor precisión.

El modelo se distribuye en dos ficheros safetensors: uno principal para la identidad facial y otro complementario para el cuerpo, que pueden apilarse para modificar la silueta según el encuadre. El repositorio en HuggingFace ocupa 1.4 GB. Al ser un LoRA, no es un modelo autónomo, sino una adaptación que requiere el modelo base Krea 2 para funcionar.

Está orientado a artistas e ilustradores que trabajen con Krea 2 y necesiten un personaje recurrente con apariencia estable. La información disponible no incluye datos sobre parametros, licencia ni benchmarks, por lo que muchos aspectos tecnicos quedan sin documentar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un LoRA, una tecnica de adaptacion de bajo rango que modifica los pesos del modelo base mediante matrices adicionales de dimension reducida. En este caso, el autor indica que el LoRA facial fue reentrenado desde cero sobre una combinacion de modelos base Krea 2: RawGirl, Realism y DarkBeast. El objetivo era lograr una fijacion de identidad mas precisa y una textura de piel mas natural.

No se proporcionan datos sobre el dataset de entrenamiento, el numero de pasos, ni el tipo de optimizacion utilizada. Tampoco se menciona ningun proceso de RLHF o DPO, lo cual no es aplicable a un modelo de generacion de imagenes con LoRA. La unica innovacion destacable es el uso de dos LoRAs complementarios apilables, uno para la cara y otro para el cuerpo, que permiten controlar independientemente el rostro y la silueta.

## Capacidades

- Generacion de retratos fotorrealistas con identidad facial consistente mediante el trigger word `amelia_face`.
- Control de la silueta corporal: el LoRA facial se puede combinar con el LoRA de cuerpo delgado para obtener una apariencia mas estilizada en encuadres de espalda, lado o trasero.
- Ajuste de intensidad: se recomienda una fuerza de 0.3 para el LoRA facial (rango util de 0.2 a 0.5) y fuerza 0.6 facial con 0.8 corporal cuando se apilan.
- Compatibilidad con estilos fotorrealistas: el modelo funciona mejor con iluminacion natural y luz solar suave.
- No tiene capacidades de texto, tool calling, agentes, vision general ni soporte multilingue, ya que es un adaptador de imagen.

## Casos de uso

- Creacion de retratos fotorrealistas para ficcion: un escritor puede generar ilustraciones consistentes de un personaje a lo largo de una novela usando el LoRA facial con fuerza 0.3 y el trigger word `amelia_face`.
- Ilustracion de personajes para novelas graficas: el apilamiento de los dos LoRAs permite alternar entre una silueta curvilinea y una mas delgada segun la escena, manteniendo el rostro estable.
- Generacion de avatares personalizados para redes sociales: se puede producir una serie de fotos del personaje en distintas poses y entornos, ideales para perfiles o contenido de marca personal.
- Diseño de personajes para videojuegos indie: el LoRA facilita la exploracion rapida de variantes de un mismo personaje sin redibujar manualmente cada pose.
- Fotografia simulada para campanias de moda: el modelo produce imagenes con iluminacion natural y aspecto fotorealista, adecuadas para mockups y concept boards.
- Contenido para blogs y webs de narrativa visual: autores de contenido pueden crear imagenes de apoyo para articulos o historias cortas con un personaje recurrente.
- Pruebas de concepto artistico: los artistas pueden previsualizar combinaciones de rostro y cuerpo antes de invertir tiempo en una ilustracion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas objetivas (FID, CLIP score, etc.) ni comparativas cuantitativas frente a otros LoRAs o checkpoints.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un LoRA, los requisitos de VRAM dependen del modelo base Krea 2 y de la resolucion de salida.
- GPU recomendadas: no disponible en la informacion proporcionada. No se especifican modelos de GPU concretos.
- ¿Cabe en GPU de consumo? No se puede determinar con los datos disponibles.
- Opciones de despliegue: no se indica ningun runtime especifico. Dado que es un LoRA de difusion, se espera que sea compatible con herramientas estandar para Stable Diffusion, pero esto no se confirma en la documentacion del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion comparativa con alternativas de la misma categoria en los datos proporcionados. No se incluyen datos de otros LoRAs de personajes para Krea 2 ni comparaciones con checkpoints equivalentes.

## Limitaciones y advertencias

- La licencia del modelo no esta definida, por lo que el uso comercial es legalmente incierto.
- El personaje es ficticio: todas las imagenes generadas son producto de IA y no representan a una persona real.
- El rendimiento esta ligado al modelo base Krea 2; usarlo con otros checkpoints puede producir resultados inconsistentes.
- No hay documentacion sobre sesgos, posibles artefactos visuales ni limitaciones de encuadre.
- El autor recomienda no usar el LoRA de cuerpo en tomas frontales si se desea una silueta curvilinea, lo que indica una limitacion en el control del cuerpo.
- No se proporcionan benchmarks, por lo que es riesgoso evaluar la calidad de identidad sin pruebas propias.

## Enlaces

- https://huggingface.co/madmacs5/amelia-krea2-lora
- https://tensorhub.art/models/1024336583534321955/Amelia-KREA2
