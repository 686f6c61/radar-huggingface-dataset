# Chippo/kale-img-1-lora

## Resumen

kale-img-1 (`kxv`) es un adaptador LoRA de estilo para el modelo de generación de imágenes MOSS-Image-Base, desarrollado por el usuario Chippo y publicado en Hugging Face. Su objetivo es dotar al modelo base de un estilo concreto de ilustración infantil en 3D suave: personajes y objetos redondeados, colores vivos, sombreado suave y fondos claros y limpios. No se trata de un modelo generativo completo, sino de un peso de adaptación ligero (el repositorio ocupa aproximadamente 0,2 GB) que se carga sobre MOSS-Image-Base mediante cualquier workflow que soporte LoRA, como ComfyUI.

El adaptador se activa mediante el token disparador `kxv`, que se incluye al inicio del prompt para invocar el estilo aprendido durante el entrenamiento. El entrenamiento se realizó con la herramienta AI-Toolkit (versión 0.13.39) de ostris, un toolkit popular para entrenar LoRAs sobre modelos de difusión con flow matching. El autor publica nueve muestras generadas y una comparativa uno a uno entre imágenes originales de referencia y sus versiones generadas (búho, glaciar, helicóptero, pagoda, loro, tortitas, casa del árbol, pingüino emperador y despertador), lo que permite evaluar la fidelidad del estilo antes de descargarlo.

Es relevante como ejemplo del ecosistema de adaptadores ligeros sobre modelos de imagen abiertos: permite obtener un estilo visual consistente para ilustración infantil sin reentrenar el modelo base, con licencia Apache-2.0 tanto en el adaptador como en el modelo base, lo que habilita su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image-Base (difusion con flow matching) |
| Parametros totales | no disponible (tamano del repositorio: ~0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base MOSS-Image-Base) |
| Tipos de cuantizacion | no aplicable (adaptador LoRA sin cuantizar) |
| Idiomas soportados | no disponibles (dependen del codificador de texto del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint LoRA (compatible con ComfyUI; formato exacto no especificado en la model card) |

## Arquitectura y entrenamiento

El adaptador sigue la arquitectura LoRA estandarada: en lugar de modificar los pesos del modelo base, entrena matrices de bajo rango que se suman a las capas de atencion y (probablemente) a las capas de proyeccion del denoisers de MOSS-Image-Base. MOSS-Image-Base es un modelo texto-a-imagen de OpenMOSS-Team que emplea flow matching; la model card recomienda para el modelo base un muestreador Euler de flow matching con 50 pasos, CFG 3 y shift 5, lo que confirma que el denoisers opera en el regimen de flow matching. El rango LoRA, los modulos objetivo y el factor alfa no se detallan en la documentacion.

El entrenamiento se realizo con AI-Toolkit version 0.13.39, un framework de codigo abierto para entrenar adaptadores sobre modelos de difusion. La metadata del checkpoint registra `kxv` como token disparador. El conjunto de entrenamiento no esta documentado explicitamente, pero la seccion de comparativas sugiere un dataset de pares de imagenes de ilustracion infantil 3D suave (animales, objetos y escenarios con fondo claro), presumiblemente acompanadas de captions. No se especifican numero de pasos de entrenamiento, learning rate ni resolucion de entrenamiento.

## Capacidades

- Transferencia de estilo a MOSS-Image-Base: genera imagenes con estetica de ilustracion infantil 3D suave (formas redondeadas, sombreado suave, colores saturados, fondo claro).
- Activacion mediante token disparador: el estilo se invoca anadiendo `kxv` al prompt, lo que permite combinarlo con descripciones arbitrarias de escena.
- Generalizacion de sujetos: segun las muestras publicadas, el estilo se aplica coherentemente a animales (búho, loro, pingüino emperador), objetos (despertador, tortitas, helicóptero), arquitectura (pagoda, faro, casa del arbol) y paisajes (glaciar).
- Compatibilidad con workflows LoRA: puede cargarse en ComfyUI y, en general, en cualquier entorno que soporte LoRAs para MOSS-Image.
- Ajuste de intensidad: la fuerza del LoRA es ajustable en el loader, lo que permite modular cuanto estilo se aplica.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, codigo ni tool calling.

## Casos de uso

- Ilustracion de libros infantiles: generacion de ilustraciones coherentes en estilo 3D suave para cuentos, con personajes y escenarios redondeados y paleta amable, manteniendo consistencia visual entre paginas.
- Contenido para aplicaciones educativas infantiles: creacion de assets visuales (animales, objetos, escenas) para apps de aprendizaje, flashcards o juegos educativos, donde se necesita un estilo uniforme y atractivo para ninos.
- Prototipado rapido de estilo para estudios de animacion: exploracion de la estetica "soft 3D" para pitches o moodboards antes de invertir en modelado 3D manual.
- Generacion de stickers e ilustraciones para marketing infantil: fondos claros y sujetos aislados facilitan el recorte y la composicion en materiales promocionales.
- Assets para videojuegos casuales: creacion de iconos, elementos de UI y arte conceptual con estetica redondeada tipica de juegos orientados a publico familiar.
- Composicion de prompts variados sobre un mismo estilo: al ser un adaptador de estilo, cualquier sujeto descrito textualmente (un faro, un glaciar, un helicóptero) puede renderizarse en la misma estetica sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un adaptador de estilo para generacion de imagenes, la evaluacion se basa en las muestras cualitativas publicadas en el repositorio (nueve imagenes generadas y nueve comparaciones original/generado).

## Requisitos de hardware

- VRAM del adaptador: ~0,2 GB de disco; el impacto en VRAM de un LoRA es minimo (habitualmente menos de 1 GB adicional).
- VRAM total: la dominada por MOSS-Image-Base; el requisito exacto no esta documentado en la informacion disponible y depende del tamano del modelo base y su cuantizacion.
- El adaptador en si no requiere GPU dedicada mas alla de la que ya necesite el modelo base; no hay datos sobre si el pipeline completo cabe en GPUs de consumo, aunque los pipelines de difusion modernos suelen ejecutarse en tarjetas de 12-24 GB (RTX 3090/4090) con cuantizacion adecuada.
- Despliegue: ComfyUI (colocando el archivo en `ComfyUI/models/loras/` y cargandolo con un loader LoRA compatible con MOSS-Image); el soporte de loaders puede variar segun la integracion y el formato del checkpoint.
- Configuracion de muestreo recomendada por el autor: Euler (flow matching), 50 pasos, CFG 3, shift 5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Notas |
|---|---|---|---|---|
| Chippo/kale-img-1-lora | LoRA de estilo | MOSS-Image-Base | Apache-2.0 | Estilo ilustracion infantil 3D suave, token `kxv`, ~0,2 GB |
| OpenMOSS-Team/MOSS-Image-Base | Modelo texto-a-imagen completo | — | Apache-2.0 | Modelo base con flow matching; sin el LoRA no produce el estilo infantil |
| LoRAs de estilo para SDXL/Flux (p. ej. en civitai o Hugging Face) | LoRAs de estilo | SDXL / Flux.1-dev | Variable (muchas licencias no comerciales) | Ecosistema mas maduro con mas loaders, pero frecuentemente con licencias mas restrictivas que Apache-2.0 |

No hay alternativas directas documentadas de LoRAs de estilo infantil sobre MOSS-Image-Base en la informacion disponible.

## Limitaciones y advertencias

- Dependencia del modelo base: el adaptador no funciona de forma aislada; requiere MOSS-Image-Base y un loader LoRA compatible, cuyo soporte puede variar segun la integracion y el formato del checkpoint.
- Token disparador obligatorio: sin incluir `kxv` en el prompt, el estilo probablemente no se active; con fuerzas de LoRA muy altas puede degradar la coherencia del modelo base.
- Calidad y sesgos del dataset: el estilo se aprendio de un conjunto de imagenes presumiblemente pequeno; puede heredar sesgos de composicion (fondos claros y planos, sujetos centrados) y rendir peor con escenas complejas, multiples sujetos o fondos detallados.
- Riesgo de artefactos tipicos de difusion: anatomia incorrecta en manos/patas, texto ilegible y problemas de coherencia espacial, heredados del modelo base.
- Documentacion limitada: no se publican hiperparametros de entrenamiento, rango LoRA, resolucion ni licencia del dataset de entrenamiento; conviene verificar los derechos de las imagenes generadas antes de uso comercial sensible.
- Sin benchmarks cuantitativos: la evaluacion es puramente cualitativa a traves de las muestras del autor.
- Licencia: Apache-2.0 en el adaptador y en el modelo base, sin restricciones comerciales conocidas; aun asi, revisar los terminos upstream de MOSS-Image-Base.
- Proyecto de autor individual con 0 descargas registradas: madurez y mantenimiento no garantizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chippo/kale-img-1-lora
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Toolkit de entrenamiento AI-Toolkit: https://github.com/ostris/ai-toolkit
- Licencia del repositorio: https://huggingface.co/Chippo/kale-img-1-lora/blob/main/LICENSE
