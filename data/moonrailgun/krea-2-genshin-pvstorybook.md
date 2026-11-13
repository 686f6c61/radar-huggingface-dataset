# moonrailgun/Krea-2-Genshin-PVStorybook

## Resumen

Krea-2-Genshin-PVStorybook es un adaptador LoRA de estilo para el modelo de difusion texto-a-imagen Krea-2-Raw, desarrollado por el usuario moonrailgun. Su proposito concreto es reproducir el lenguaje visual de las ilustraciones de libro de cuentos (storybook) asociadas a los videos promocionales de Genshin Impact: contornos de tinta coloreada de grosor variable, grandes masas de color plano, textura de papel mate y simplificacion grafica de rostros y ornamentos. No es un modelo base, sino un peso adicional que se aplica sobre Krea-2-Raw para sesgar la generacion hacia esa estetica plana y narrativa.

El modelo resuelve un problema de estilo muy especifico: conseguir escenas amplias y narrativas con personajes de cuerpo entero integrados en paisajes, algo que los modelos genericos tienden a resolver como fichas de personaje o retratos cerrados. El prompt de ejemplo del autor insiste en encuadres anchos, personaje a media distancia ocupando aproximadamente la mitad de la altura de la imagen y arquitectura o paisaje dominando el resto del marco.

Se distribuye como un unico archivo de difusion (diffusion-single-file) de unos 0,2 GB, pensado para ComfyUI, con etiquetas en ingles y chino y licencia krea-2-community-license. Es un modelo reciente (creado en noviembre de 2026) sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Krea-2-Raw |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no disponible la longitud de prompt maxima) |
| Tipos de cuantizacion | no disponible (se distribuye como archivo unico de difusion) |
| Idiomas soportados | en, zh |
| Licencia | krea-2-community-license (etiquetada como "other") |
| Formato de pesos | diffusion-single-file (archivo unico para ComfyUI) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA aplicada sobre Krea-2-Raw, un modelo de difusion texto-a-imagen. La model card no detalla el rango del adaptador, las capas objetivo ni la configuracion exacta de entrenamiento. Tampoco se especifica el numero de imagenes del dataset, su composicion, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de regularizacion o captions automaticos. Toda esa informacion debe considerarse no disponible.

El diseno del estilo se deduce de los prompts de ejemplo incluidos: el adaptador aprende a producir contornos exteriores gruesos y coloreados con pocas lineas internas, bloques de color local plano, simplificacion del cabello en mechones solidos y de la ropa en paneles geometricos, marcas faciales minimas y textura de papel. El token de activacion es la cadena "genshin pvstorybook", que debe preceder al prompt. Los ejemplos cubren personajes como Hu Tao, Furina, Zibai y Kamisato Ayaka, lo que sugiere un entrenamiento orientado a personajes y escenarios de Genshin Impact, aunque la estetica de libro de cuentos puede transferirse a otros sujetos.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo libro de cuentos bidimensional, con contornos de tinta coloreada y color plano.
- Composicion de escenas narrativas amplias con primer plano, plano medio y fondo diferenciados.
- Representacion de personajes de cuerpo entero a media distancia integrados en paisajes y arquitectura.
- Preservacion de rasgos identificativos de personaje (peinado, colores principales del vestuario, accesorios caracteristicos) simplificados a formas planas.
- Generacion de escenarios de fantasia inspirados en Liyue, Inazuma y Fontaine (puentes, montanas de jade, lagos, pabellones, cerezos).
- Soporte de prompts en ingles y chino.
- Integracion en flujos de ComfyUI mediante archivo unico de difusion.
- No dispone de tool calling, capacidades de agente, vision de entrada, audio ni modo de razonamiento: es exclusivamente un modelo de sintesis de imagen.

## Casos de uso

- Ilustracion de libros infantiles y juveniles: el adaptador genera escenas narrativas completas con personaje y entorno en el mismo estilo plano, adecuadas para paginas de cuento donde se requiere coherencia grafica entre ilustraciones.
- Arte conceptual para videojuegos de estilo anime: permite explorar rapidamente variaciones de escenarios (puentes, montanas, lagos) con personajes de cuerpo entero, utiles en fases de preproduccion.
- Contenido para comunidades de fans: creacion de ilustraciones de personajes de Genshin Impact en un registro visual distinto al oficial, con encuadres narrativos en lugar de retratos.
- Maquetacion de storyboards promocionales: la capacidad de fijar encuadre ancho, distancia media y jerarquia de planos facilita generar viñetas coherentes para animaticos o presentaciones.
- Generacion de fondos ilustrados para materiales editoriales y merchandising: la estetica de color plano y textura de papel se reproduce bien en impresion y en soportes graficos.
- Prototipado de direccion de arte: comparar rapidamente el mismo concepto bajo la estetica storybook frente a otros estilos, usando el mismo modelo base Krea-2-Raw con distintos adaptadores.
- Creacion de ilustraciones para mods o proyectos derivados no comerciales, siempre que se respete la licencia comunitaria del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; depende del modelo base Krea-2-Raw sobre el que se aplica el adaptador, no del archivo LoRA (0,2 GB).
- El adaptador en si ocupa muy poco espacio en disco y en memoria; el coste real de inferencia lo determina Krea-2-Raw.
- GPU recomendadas: no disponible para este adaptador; se remite a los requisitos de Krea-2-Raw.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: ComfyUI es el flujo indicado por las etiquetas del repositorio; otros entornos compatibles con diffusion-single-file no estan documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Estilo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea-2-Genshin-PVStorybook | LoRA de estilo | Krea-2-Raw | Storybook plano, contornos coloreados | en, zh | krea-2-community-license | Hugging Face, 0 descargas |
| Krea-2-Raw | Modelo de difusion base | no aplica | Generico texto-a-imagen | no disponible | krea-2-community-license | Hugging Face |
| Otros LoRA de estilo para Krea-2 | LoRA de estilo | Krea-2-Raw | Variable | no disponible | depende del autor | no disponible |

No se dispone de datos de rendimiento ni de otros adaptadores comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 valoraciones: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- La model card no documenta el dataset de entrenamiento, por lo que no pueden evaluarse sesgos de representacion ni riesgo de sobreajuste a personajes concretos.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible o elementos incongruentes, especialmente en encuadres amplios con muchos detalles.
- El estilo esta fuertemente sesgado hacia personajes y escenarios de Genshin Impact; su transferencia a otros dominios no esta verificada.
- La simplificacion facial extrema que promueve el adaptador (rostros como siluetas planas con una sola marca ocular) puede no ser adecuada para aplicaciones que requieran expresividad facial detallada.
- Idiomas limitados a ingles y chino; no hay evidencia de soporte para prompts en castellano.
- Licencia krea-2-community-license: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial, ya que impone condiciones adicionales sobre el modelo base y sus adaptadores.
- El uso de personajes de Genshin Impact puede estar sujeto a derechos de propiedad intelectual de terceros, independientemente de la licencia del modelo.
- Dependencia total de Krea-2-Raw: la calidad final, los requisitos de hardware y el rendimiento dependen del modelo base, no del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonrailgun/Krea-2-Genshin-PVStorybook
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Licencia krea-2-community-license: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
- Repositorio de Krea-2: https://github.com/krea-ai/krea-2
