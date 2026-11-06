# farc077/Hazel_Jane_KREA2

## Resumen

Hazel_Jane_KREA2 es un adaptador LoRA de tipo text-to-image publicado por el usuario farc077 en Hugging Face. Se trata de un LoRA de identidad (personaje) entrenado sobre el modelo base Krea-2-Raw, del proyecto krea, y su objetivo es reproducir la apariencia de una persona concreta —la influencer Hazel Jane, identificada en la model card como @hazeljane.r en Instagram— en imágenes generadas a partir de descripciones textuales.

El repositorio es de pequeno tamano (0,2 GB) y contiene unicamente los pesos del adaptador, no un modelo completo. Se distribuye con la etiqueta ONESHOTLORA, lo que indica que fue generado con la plataforma oneshotlora.com, un servicio que automatiza la creacion de LoRAs de identidad a partir de un conjunto reducido de imagenes de referencia. El trigger word definido por el autor es `H4Z3LJ`.

Su relevancia es limitada y muy especifica: sirve como ejemplo de la practica habitual de crear LoRAs de personajes o influencers sobre modelos de difusion, y resulta util para quien quiera generar imagenes consistentes de esa identidad concreta. No aporta innovaciones arquitectonicas ni capacidades nuevas mas alla del condicionamiento visual de identidad sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image (base: krea/Krea-2-Raw) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (repo de 0,2 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El modelo base es krea/Krea-2-Raw, un generador de imagenes a partir de texto. No se dispone de informacion sobre el rango del adaptador, las capas objetivo ni la configuracion exacta del entrenamiento.

El autor indica que el adaptador se genero mediante oneshotlora.com, una plataforma que produce LoRAs de identidad a partir de un conjunto de imagenes de referencia. No se especifica el numero de imagenes utilizadas, el numero de pasos de entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion. Tampoco hay informacion sobre el dataset mas alla de la referencia a la persona retratada.

## Capacidades

- Generacion de imagenes de una identidad concreta (Hazel Jane) condicionada por texto, mediante el trigger word `H4Z3LJ`.
- Control de vestimenta, pose y escenario a traves del prompt de texto, segun los ejemplos de la model card (camisa formal con blazer en una oficina, vestido de tirantes en un campo de hierba, camiseta blanca con vaqueros).
- Integracion con el modelo base Krea-2-Raw, heredando sus capacidades de generacion text-to-image.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de imagen, no de lenguaje.
- No dispone de capacidades multilingues declaradas (los prompts de ejemplo estan en ingles).
- No dispone de modo thinking, vision de entrada ni audio.

## Casos de uso

- Generacion de contenido para redes sociales: crear imagenes consistentes de la identidad Hazel Jane con distintos estilos de vestuario y localizaciones, usando el trigger word y un prompt descriptivo, para alimentar perfiles de marca o campañas de influencer marketing.
- Pruebas de concepto de moda: generar a la misma persona virtual con distintas prendas (camisa formal, vestido, camiseta) para evaluar combinaciones antes de una sesion fotografica real.
- Creacion de avatares y personajes virtuales: usar el LoRA como base para un personaje recurrente en narrativas visuales, comics o contenido editorial, manteniendo la coherencia facial entre imagenes.
- Prototipado de escenarios: situar a la identidad en localizaciones variadas (oficina corporativa, campo, exterior urbano) para explorar direccion de arte sin desplazamientos ni produccion fisica.
- Investigacion sobre LoRAs de identidad: emplear el adaptador como caso de estudio de las tecnicas de oneshot LoRA y comparar la fidelidad de identidad frente a otros metodos de personalizacion.
- Integracion en flujos ComfyUI: los ejemplos de la model card estan generados con ComfyUI, por lo que el LoRA puede cargarse en ese entorno junto al modelo base para pipelines de generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un LoRA sobre Krea-2-Raw, los requisitos vienen determinados por el modelo base, no por el adaptador (0,2 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Krea-2-Raw.
- Opciones de despliegue: ComfyUI (confirmado por los ejemplos de la model card); otros entornos de difusion no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Trigger word | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hazel_Jane_KREA2 (farc077) | LoRA de identidad | krea/Krea-2-Raw | H4Z3LJ | other | Hugging Face |
| Otros LoRAs de identidad generados con OneShotLoRA | LoRA de identidad | variable | variable | variable | Hugging Face |
| Alternativas de personalizacion (DreamBooth, IP-Adapter) | Tecnicas de personalizacion | variable | no aplica | variable | no disponible |

No se dispone de datos de rendimiento ni de comparativas cuantitativas con otros adaptadores de identidad en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es "other", sin texto de licencia visible en la informacion disponible; es imprescindible revisar los terminos antes de cualquier uso comercial.
- El modelo reproduce la imagen de una persona real identificada en redes sociales; su uso plantea riesgos de suplantacion de identidad, difusion de imagenes no consentidas y vulneracion del derecho a la propia imagen. El autor declara que los usuarios son los unicos responsables del cumplimiento legal.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir rasgos inconsistentes, artefactos o desviaciones de la identidad buscada, especialmente fuera de los estilos de prompt de ejemplo.
- No hay informacion sobre sesgos demograficos ni sobre la composicion del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni evidencia de calidad mas alla de los ejemplos del autor.
- La fecha de creacion indicada (2026-11-01) es futura respecto a la informacion habitual de publicacion; conviene verificar la vigencia del repositorio.
- No se especifican idiomas soportados; los prompts de ejemplo estan en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farc077/Hazel_Jane_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Plataforma de generacion del LoRA: https://oneshotlora.com
- Perfil de la persona retratada: @hazeljane.r en Instagram
