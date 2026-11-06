# Kinimoro/merc_cad

## Resumen

`merc_cad` es un adaptador LoRA de tipo text-to-image publicado por el usuario Kinimoro en Hugging Face. No se trata de un modelo fundacional, sino de un ajuste fino ligero (Low-Rank Adaptation) que se aplica sobre el modelo base `krea/Krea-2-Raw` para reproducir una identidad visual y unos rasgos faciales concretos. Su función es, por tanto, la personalización de un generador de imágenes ya existente mediante un conjunto reducido de pesos adicionales, sin necesidad de reentrenar el modelo completo.

El repositorio es muy pequeño (0,2 GB) y está etiquetado con la librería `diffusers` y la plantilla `template:diffusion-lora`, lo que indica compatibilidad con los flujos de trabajo habituales de la familia Diffusers. La palabra de activación declarada por el autor es `cadey`, que debe incluirse en el prompt para que el adaptador ejerza su efecto sobre la generación.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación en IA: se trata de un LoRA de nicho, con 63 descargas y sin métricas publicadas, orientado a la reproducción de la apariencia de una persona adulta real. La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento cuantitativo es prácticamente nula, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; arquitectura del modelo base no detallada |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de instancia es `cadey`; no se documentan idiomas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible de forma explicita; el repo usa la libreria `diffusers` y la plantilla `diffusion-lora` |

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea/Krea-2-Raw` para modificar su comportamiento sin alterar los pesos originales. La model card no especifica en que capas se aplica el adaptador, ni el rango utilizado, ni el valor de alpha, ni la tasa de aprendizaje, ni el numero de pasos de entrenamiento. Tampoco se detalla la arquitectura del modelo base (tipo de difusion, variante de UNet o transformer, etc.).

En cuanto a los datos de entrenamiento, el autor indica que el LoRA se entrenó con imágenes de una persona adulta real y que ni las imágenes de entrenamiento ni las de ejemplo se incluyen en el repositorio. No se documenta el numero de imágenes, la resolucion, el proceso de captioning, el uso de regularización o técnicas como DreamBooth, ni si hubo etapas de refinamiento. No se menciona ningún tipo de RLHF, DPO ni innovación técnica adicional; es un ajuste de personalización estándar.

## Capacidades

- Generacion de imagenes text-to-image condicionada por el modelo base Krea 2, con el adaptador LoRA aplicado.
- Reproduccion de una identidad visual y unos rasgos faciales concretos mediante la palabra de activacion `cadey`.
- Personalizacion ligera: el adaptador modula el estilo y la apariencia sin sustituir el modelo base.
- Compatibilidad con flujos de trabajo Diffusers y con la plantilla `diffusion-lora`.
- Ajuste de intensidad del LoRA (strength) para controlar la fuerza del efecto, segun recomienda el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por tratarse de un modelo de generacion de imagenes.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Creacion de retratos consistentes de un personaje concreto: usando el trigger `cadey` junto con el modelo base Krea 2, se pueden generar varias imagenes del mismo sujeto manteniendo coherencia facial entre ellas, util para storyboards o narrativa visual.
- Prototipado de personajes para ilustracion: el LoRA permite explorar variaciones de pose, iluminacion y vestuario sobre una identidad fija sin reentrenar el modelo base, agilizando la iteracion creativa.
- Pruebas de concepto en investigacion sobre personalizacion: sirve como ejemplo de adaptador de bajo rango para estudiar como un LoRA modifica la distribucion de salida de un diffusion model con pocos datos.
- Generacion de material grafico interno con identidad controlada: en entornos donde se dispone del consentimiento de la persona representada, puede emplearse para producir imagenes de marca o avatares consistentes.
- Experimentacion con intensidades de LoRA: util para analizar el compromiso entre fidelidad al sujeto y flexibilidad del prompt ajustando el strength del adaptador.
- Docencia y demostraciones sobre LoRA en difusion: el reducido tamano del repo (0,2 GB) facilita su uso en talleres o entornos con recursos limitados para explicar el funcionamiento de los adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente del modelo base Krea 2, no del LoRA, que anade una sobrecarga minima.
- GPU recomendadas: no disponibles para este adaptador; vendran determinadas por los requisitos de Krea 2 (no documentados en la informacion proporcionada).
- Compatibilidad con GPU de consumo: no confirmada; el LoRA en si ocupa poco (repo de 0,2 GB), pero el modelo base condiciona el requisito real de VRAM.
- Opciones de despliegue: flujos basados en la libreria `diffusers` (segun las etiquetas del repo); no se documentan otras opciones como ComfyUI, Automatic1111 u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kinimoro/merc_cad | LoRA sobre Krea 2 | no disponible | no aplica | CC BY-SA 4.0 | Hugging Face, 63 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros LoRA de personalizacion comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo reproduce la apariencia de una persona adulta real; su uso para generar representaciones intimas o sexuales sin consentimiento explicito esta prohibido por el propio autor y puede infringir derechos de imagen y personalidad.
- El autor no concede derechos sobre la identidad, el parecido, el nombre ni las fotografias de la persona representada.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar rasgos inconsistentes o artefactos, especialmente con intensidades de LoRA altas o prompts alejados de la distribucion de entrenamiento.
- No se documentan sesgos conocidos, pero al entrenarse sobre una identidad concreta puede sobrerrepresentar rasgos especificos y degradar la diversidad de las generaciones.
- Limitaciones de idioma: no se especifican; el trigger `cadey` es la unica indicacion y no se documenta el comportamiento con prompts en distintos idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir-al-igual, pero debe verificarse la compatibilidad con la licencia del modelo base Krea 2, no documentada aqui.
- El autor declara que el modelo se ofrece para investigacion y experimentacion; conviene revisar las condiciones antes de un despliegue en produccion.
- No se incluyen imagenes de entrenamiento ni de ejemplo en el repositorio, lo que dificulta la evaluacion cualitativa previa.
- Ausencia total de benchmarks y de documentacion tecnica del entrenamiento, lo que impide estimar su calidad de forma objetiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kinimoro/merc_cad
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
