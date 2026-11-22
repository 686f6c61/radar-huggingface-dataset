# aoleg/MOSS-Image-Kodachrome

## Resumen

MOSS-Image Kodachrome es un adaptador de estilo de tipo LoKr (LyCORIS, descomposición de bajo rango con factorización de Kronecker) publicado por el usuario aoleg para el modelo de difusión texto-a-imagen MOSS-Image-Base, desarrollado por el equipo OpenMOSS. Su función es transferir a las imágenes generadas la respuesta de color, la curva de contraste y la nitidez características del film de diapositivas Kodachrome en formato de hoja 4x5 de los años cuarenta, un estilo fotográfico muy reconocible por su paleta cálida y su saturación contenida.

El adaptador no es un modelo generativo completo: es un conjunto de pesos de bajo rango que se carga sobre MOSS-Image-Base y modifica su comportamiento sin alterar la arquitectura del modelo base. Con un tamaño de repositorio de 0,1 GB y licencia Apache 2.0, está pensado para su uso en flujos de trabajo de ComfyUI o mediante la función `load_lora_weights` de la librería Diffusers. El autor lo describe explícitamente como un checkpoint intermedio: el estilo se ha transferido, pero el grano fotográfico todavía no.

Su relevancia es práctica para quienes trabajan con generación de imagen estilizada: permite obtener un acabado fotográfico de época con un coste de almacenamiento mínimo y sin necesidad de reentrenar el modelo base. La información disponible sobre el modelo base (parámetros, contexto, idiomas) no está detallada en la model card, por lo que varios campos de esta ficha se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoKr (LyCORIS) sobre modelo de difusión texto-a-imagen MOSS-Image-Base |
| Parametros totales | no disponible (adaptador de bajo rango, factor 16; el modelo base no detalla su recuento en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; las imágenes de ejemplo del autor se generaron con una variante int8 del modelo base (`moss_image_base_int8_convrot`) |
| Idiomas soportados | no disponible (el prompt de instancia está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card; distribuido como adaptador para Diffusers y ComfyUI (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador emplea LoKr, una variante de LyCORIS que aproxima la actualización de pesos mediante una factorización de Kronecker de bajo rango. El autor justifica el uso de factor 16 argumentando que un look fílmico contiene poca información (una paleta, una curva tonal y grano), por lo que esa capacidad resulta suficiente. Al ser un adaptador, la arquitectura subyacente es la del modelo base MOSS-Image-Base, un modelo de difusión texto-a-imagen del que la información proporcionada no detalla arquitectura interna, número de parámetros ni datos de entrenamiento.

El entrenamiento se realizó con Ostris AI Toolkit sobre MOSS-Image-Base, con resolución de 1280, batch de 4 y 750 pasos. El autor indica que en ese punto el estilo ya se había transferido pero el grano aún no, y que lo considera un checkpoint intermedio. El prompt de instancia definido es `Kodachrome film, Kodachrome`. No se documentan datos sobre el dataset de entrenamiento (número de imágenes, procedencia, composición), ni sobre el uso de RLHF o DPO, que no aplican a un adaptador de este tipo.

## Capacidades

- Generación de imágenes texto-a-imagen con estética de film Kodachrome de los años cuarenta, aplicada sobre el modelo base MOSS-Image-Base.
- Reproducción de la respuesta de color y la curva de contraste del Kodachrome 4x5, con especial énfasis en la nitidez según el autor.
- Control del estilo mediante palabras de activación (`Kodachrome film, Kodachrome`) combinadas con una descripción libre de la escena.
- Compatibilidad con el cargador LoRA estándar de ComfyUI (soporte LoKr en el núcleo) y con `load_lora_weights` en Diffusers.
- Ajuste de intensidad del adaptador mediante el parámetro de fuerza (strength); el autor lo probó a 1.0.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio, al tratarse de un adaptador de imagen.

## Casos de uso

- Ilustración editorial de época: generar imágenes con acabado de fotografía de los años cuarenta para artículos, portadas o reportajes, usando el prompt de activación junto con la descripción de la escena y un CFG de 3 con 50 pasos.
- Recreación histórica y documental: producir escenas ambientadas en entornos industriales, ferroviarios o mineros con la paleta y el contraste propios del Kodachrome, como muestran los ejemplos del autor con trenes, mineros y talleres.
- Previsualización de dirección de arte: probar rápidamente un tratamiento cromático de estilo fílmico antes de invertir en postproducción real, gracias al reducido tamaño del adaptador (0,1 GB) y a su carga inmediata en ComfyUI.
- Prototipado de proyectos fotográficos: explorar composiciones y encuadres con estética de hoja 4x5 para maquetas o moodboards, ajustando la fuerza del adaptador para modular la intensidad del efecto.
- Integración en pipelines de Diffusers: incorporar el adaptador mediante `load_lora_weights` en flujos automatizados de generación por lotes, combinándolo con el modelo base y los parámetros de muestreo recomendados por el autor.
- Experimentación con estilos fílmicos: servir como punto de partida para quienes quieran entrenar variantes con más pasos que añadan el grano ausente, dado que el autor lo describe como checkpoint intermedio.
- Generación de material para narrativa visual o cómic ambientado en la primera mitad del siglo XX, aprovechando la coherencia cromática que aporta el adaptador sobre escenas descritas con detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MOSS-Image-Base y de su cuantización. Las imágenes de ejemplo se generaron con una variante int8 del modelo base, lo que sugiere que el autor trabajó con pesos cuantizados para reducir requisitos.
- GPU recomendadas: no disponible. No se especifican GPU concretas (A100, H100, RTX 4090 u otras) en la model card.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el uso de una variante int8 del modelo base apunta a que el autor optimizó el consumo de memoria, pero no se detalla el hardware empleado.
- Opciones de despliegue: ComfyUI con el cargador LoRA estándar (soporte LoKr en el núcleo) y Diffusers mediante `load_lora_weights`. Otros entornos (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. Los parámetros de muestreo probados por el autor son fuerza 1.0, CFG 3, 50 pasos y skip-layer guidance en la capa 22.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image Kodachrome (aoleg) | Adaptador LoKr de estilo sobre MOSS-Image-Base | no disponible (adaptador de bajo rango, factor 16) | no disponible | Apache 2.0 | Hugging Face, 694 descargas, 3 likes |
| MOSS-Image-Base (OpenMOSS-Team) | Modelo de difusión texto-a-imagen base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face (referenciado como base_model) |
| Otros adaptadores de estilo fílmico para difusión | LoRA/LoKr de estética fotográfica | no disponible | no disponible | variable según autor | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor lo describe como checkpoint intermedio: el estilo se ha transferido, pero el grano fotográfico característico del Kodachrome todavía no está presente.
- Al ser un adaptador, hereda las limitaciones, sesgos y riesgos de alucinación visual del modelo base MOSS-Image-Base, sobre el que la información disponible es escasa.
- Requiere el modelo base MOSS-Image-Base para funcionar; no es utilizable de forma autónoma.
- Los prompts de ejemplo y el prompt de instancia están en inglés; no se documenta soporte multilingüe del adaptador ni del modelo base.
- El ajuste de fuerza distinto de 1.0, CFG distinto de 3 o un número de pasos distinto de 50 no están validados por el autor y pueden degradar el resultado.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base antes de desplegarlo en producción.
- El repositorio tiene muy poca tracción (694 descargas y 3 likes) y fue creado y actualizado en octubre de 2026; no hay evidencia de mantenimiento a largo plazo.
- No se documentan sesgos conocidos específicos del adaptador; los sesgos de representación dependerán del dataset del modelo base y de los prompts empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoleg/MOSS-Image-Kodachrome
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Ostris AI Toolkit (herramienta de entrenamiento citada por el autor): no se proporciona URL en la información disponible
- LyCORIS (LoKr): no se proporciona URL en la información disponible
- ComfyUI: no se proporciona URL en la información disponible
- Diffusers: no se proporciona URL en la información disponible
