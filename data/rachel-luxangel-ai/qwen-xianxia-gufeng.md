# rachel-luxangel-ai/qwen-xianxia-gufeng

## Resumen

`rachel-luxangel-ai/qwen-xianxia-gufeng` es un adaptador LoRA de estilo para el modelo de difusión Qwen-Image. No es un modelo de lenguaje ni un modelo de imagen completo: es un conjunto de pesos de bajo rango que se acopla al modelo base para inclinar su distribución de salida hacia una estética concreta, en este caso la fantasía china de corte xianxia y gufeng (estética clásica). El autor lo publica como espejo de inferencia de una versión alojada en Civitai (modelo 2979853, versión 3377871), que es donde reside la model card y la licencia originales.

El repositorio contiene un único archivo, `xianxia_gufeng_meixue.safetensors`, en BF16, con un peso total de aproximadamente 0,2 GB. La model card indica que corresponde a la versión 3.0 del adaptador, que no requiere palabra de activación (*trigger word*) y que el peso recomendado de aplicación está entre 0,4 y 0,6. El modelo base declarado en la card es «Qwen-Image 2.1», mientras que la etiqueta `base_model` de HuggingFace apunta a `Qwen/Qwen-Image`; esta discrepancia no se resuelve en la documentación disponible.

Su relevancia práctica es acotada pero clara: permite reproducir un estilo ilustrativo muy específico sin reentrenar ni sustituir el modelo base, con un coste de almacenamiento de 0,2 GB y un coste de cómputo en inferencia prácticamente nulo frente al modelo completo. Ahora bien, en el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones, y no se han publicado evaluaciones cuantitativas de ningún tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (bajo rango) sobre un transformer de difusión; rango y alpha no disponibles |
| Parámetros totales | No disponible; el repositorio ocupa 0,2 GB en BF16 |
| Parámetros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No disponible; en un modelo de difusión depende del codificador de texto del modelo base, no documentado aquí |
| Tipos de cuantización | El adaptador se distribuye únicamente en BF16; no se documentan cuantizaciones del adaptador ni del modelo base |
| Idiomas soportados | No disponibles; el comportamiento lingüístico de los prompts lo determina el modelo base |
| Licencia | `other` (la licencia original se gestiona en la publicación de Civitai) |
| Formato de pesos | `safetensors` (BF16), archivo `xianxia_gufeng_meixue.safetensors` |
| Tipo de adaptador | LoRA de estilo, versión 3.0 |
| Modelo base | Qwen-Image 2.1 según la card; `Qwen/Qwen-Image` según la etiqueta de HuggingFace |
| Palabra de activación | Ninguna |
| Peso recomendado | 0,4 – 0,6 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA y de que se aplica sobre Qwen-Image. No se indican el rango, el alpha, las capas objetivo ni la estrategia de fusión de los pesos. Tampoco se documenta si el adaptador afecta solo al bloque de atención cruzada, a los módulos de proyección o a un subconjunto distinto del modelo de difusión, ni si funciona con variantes cuantizadas del base.

Respecto a los datos de entrenamiento, no hay ningún dato publicado: ni número de imágenes, ni composición del dataset, ni número de pasos, ni resolución, ni si se emplearon captions descriptivas o Etiquetas de estilo. La ausencia de palabra de activación sugiere que el estilo se aprendió de forma asociada al contenido de las captions, pero esto es una inferencia a partir de la card y no una confirmación del autor. No se menciona ningún proceso de ajuste por preferencias (RLHF, DPO) ni ninguna innovación técnica adicional.

## Capacidades

- Aplicación de una estética xianxia/gufeng sobre las generaciones del modelo base Qwen-Image: indumentaria tradicional, arquitectura china clásica, paletas y tratamiento pictórico coherentes con el género.
- Funcionamiento sin palabra de activación: el efecto estilístico se activa mediante el prompt y el peso del adaptador, no mediante un token reservado.
- Intensidad de estilo ajustable de forma continua mediante el peso, con un rango recomendado de 0,4 a 0,6.
- Distribución en `safetensors` BF16, formato estándar para cargadores de adaptadores LoRA.
- Combinación con otros adaptadores y con el pipeline del modelo base: no documentada por el autor, por lo que no puede darse por garantizada.
- Generación de texto, razonamiento, código, matemáticas, tool calling, uso de agentes, visión o audio: no aplica, al no tratarse de un modelo de lenguaje.
- Capacidades multilingües y modo *thinking*: no disponibles.

## Casos de uso

- **Dirección de arte para videojuegos de temática china:** el adaptador permite generar un volumen alto de variaciones de personajes y escenarios con una estética consistente, fijando el peso en 0,5 y variando únicamente la semilla y el prompt, lo que acelera la exploración visual previa al modelado.
- **Ilustración de portada para ficción serializada:** novelas web y publicaciones de wuxia/xianxia necesitan portadas recurrentes con un mismo lenguaje visual; un LoRA de estilo con peso fijo aporta esa cohesión entre volúmenes sin encargar una ilustración nueva cada vez.
- **Concept art de indumentaria y atrezo:** útil para generar referencias de vestuario, armaduras y ornamentación dentro de una estética gufeng concreta, que después se refinan manualmente o se usan como guía para modelado 3D.
- **Prototipado rápido de estilo en estudios pequeños:** con 0,2 GB de peso adicional, el adaptador se puede probar en el flujo de trabajo existente del estudio sin aprovisionar nuevo hardware ni reentrenar nada; el coste de experimentación es logístico, no de cómputo.
- **Fondos y *key art* para material promocional:** generación de paisajes y atmósferas del género para tráilers, banners o presentaciones, ajustando el peso a la baja (0,4) cuando se quiere preservar el realismo del base y subirlo cuando prima el estilo.
- **Contenido para *merchandising* y edición:** ilustraciones para láminas, *artbooks* o producto impreso donde la coherencia estilística entre piezas es más importante que la novedad individual de cada imagen.
- **Exploración comparativa de estilos:** al no requerir palabra de activación, el adaptador se puede activar y desactivar dentro de la misma sesión para comparar resultados con y sin él sobre el mismo prompt y semilla, lo que facilita decisiones de dirección visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores de estilo. Tampoco se documenta el coste de inferencia añadido por el adaptador.

## Requisitos de hardware

- **VRAM del adaptador:** aproximadamente 0,2 GB adicionales sobre el modelo base, deducidos del tamaño del repositorio en BF16. Es un coste marginal frente a los pesos del transformer de difusión.
- **VRAM del modelo base:** no disponible en la información proporcionada. Qwen-Image no se documenta en esta ficha, por lo que la VRAM total debe consultarse en la model card del modelo base.
- **GPU recomendadas:** no disponible. La elección depende enteramente del modelo base y de la resolución de generación.
- **Viabilidad en GPU de consumo:** no disponible por la misma razón; el adaptador en sí no es el factor limitante.
- **Opciones de despliegue:** no documentadas por el autor. El archivo es un `safetensors` BF16 estándar y la publicación original vive en Civitai, ecosistema en el que lo habitual son flujos de ComfyUI o interfaces similares, pero la model card no especifica ningún procedimiento de carga ni confirma compatibilidad con `diffusers`, ComfyUI, A1111 o InvokeAI.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rachel-luxangel-ai/qwen-xianxia-gufeng` | LoRA de estilo sobre Qwen-Image | No disponible (repo de 0,2 GB) | No aplica | `other` (Civitai) | HuggingFace y Civitai |
| `Qwen/Qwen-Image` (modelo base) | Modelo de difusión completo | No disponible en esta información | No disponible | No disponible en esta información | HuggingFace |
| Otros LoRA de estética xianxia/gufeng | LoRA de estilo | No disponible | No aplica | No disponible | No disponible |

No se dispone de datos objetivos para comparar este adaptador con alternativas de la misma categoría. La comparación con el modelo base solo puede establecerse de forma cualitativa: el LoRA añade 0,2 GB de pesos y un sesgo estilístico, sin alterar el resto de capacidades del base. Cualquier comparación de calidad de estilo requeriría una evaluación humana con prompts y semillas controlados, que no se ha publicado.

## Limitaciones y advertencias

- **Licencia ambigua para uso comercial:** la etiqueta es `other` y la card remite explícitamente a la licencia de la publicación de Civitai. Antes de cualquier uso en producción o en producto distribuido hay que verificar los términos en esa fuente; la licencia no se reproduce en HuggingFace.
- **Espejo no oficial:** el repositorio se declara «inference mirror» de un modelo de Civitai. La fuente de verdad es la publicación original, y no hay garantía de que los pesos ni la documentación se mantengan sincronizados.
- **Discrepancia en el modelo base:** la card indica Qwen-Image 2.1 y la etiqueta de HuggingFace apunta a `Qwen/Qwen-Image`. Cargar el adaptador sobre una versión distinta a la usada en el entrenamiento puede degradar el resultado o producir artefactos.
- **Ausencia de trigger word:** el estilo se activa por prompt. Esto significa que el adaptador puede filtrar rasgos estilísticos incluso cuando no se desea, y que a pesos bajos el efecto puede ser demasiado tenue mientras que a pesos altos puede dominar el contenido y rigidizar las composiciones.
- **Riesgo de sobreajuste estilístico:** al ser un LoRA de estética, a pesos elevados tiende a reproducir clichés del género y a reducir la diversidad de las composiciones; el rango 0,4–0,6 sugerido es el único dato disponible al respecto.
- **Sin validación comunitaria:** 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de terceros sobre calidad, estabilidad ni compatibilidad real con distintos pipelines.
- **Sin métricas de calidad:** no existen evaluaciones cuantitativas ni comparaciones, por lo que cualquier afirmación sobre su fidelidad al estilo es cualitativa.
- **Sesgos del modelo base:** al tratarse de un adaptador, hereda los sesgos, sesgos culturales y riesgos de alucinación visual del modelo subyacente. La representación de una tradición cultural concreta puede caer en estereotipos o en mezclas imprecisas de motivos.
- **Documentación insuficiente para producción:** no se especifican requisitos de hardware, procedimiento de carga, compatibilidad con cuantizaciones ni latencia, lo que dificulta integrarlo en un pipeline con garantías sin pruebas adicionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rachel-luxangel-ai/qwen-xianxia-gufeng
- Publicación original en Civitai (modelo 2979853): https://civitai.com/models/2979853
- Versión concreta en Civitai (3377871): https://civitai.com/models/2979853?modelVersionId=3377871
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image
