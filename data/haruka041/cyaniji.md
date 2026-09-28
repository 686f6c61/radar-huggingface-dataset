# Haruka041/cyaniji

## Resumen

cyaniji es un adaptador LoRA (Low-Rank Adaptation) de texto a imagen publicado por el usuario Haruka041 en Hugging Face. No es un modelo independiente: se trata de un conjunto de pesos de bajo rango que se aplica sobre el modelo de difusion base krea/Krea-2-Turbo para transferirle un estilo visual concreto, invocado mediante la palabra clave `Cyaniji style`. El repositorio ocupa 0,4 GB y esta etiquetado con la biblioteca `diffusers` y la plantilla `template:diffusion-lora`.

Su relevancia practica es limitada pero clara dentro del ecosistema de personalizacion de generacion de imagenes: permite reproducir un estilo especifico sin reentrenar ni desplegar un modelo completo, con un coste de almacenamiento minimo y una sobrecarga de VRAM casi despreciable en inferencia. El interes principal esta en el modelo base elegido, Krea-2-Turbo, del que este LoRA hereda toda la arquitectura, resolucion nativa, licencia y requisitos de hardware.

La model card es muy escueta: unicamente define la palabra de activacion y remite a la pestana de archivos para la descarga. No incluye informacion sobre el dataset de entrenamiento, el rango del LoRA, la licencia ni los idiomas soportados, por lo que buena parte de esta ficha queda marcada como "no disponible" y debe completarse consultando la documentacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion (text-to-image) preentrenado; arquitectura del backbone no disponible |
| Parametros totales | no disponible (no se publica el rango ni el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; la "ventana" la determina el codificador de texto del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en ingles; no se declara soporte multilingue) |
| Licencia | no disponible |
| Formato de pesos | pesos para la biblioteca `diffusers`; no se confirma explicitamente el contenedor (safetensors u otro) en la informacion proporcionada |
| Modelo base | krea/Krea-2-Turbo |
| Palabra de activacion | `Cyaniji style` |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | text-to-image |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un par de matrices de bajo rango que se insertan en capas concretas del modelo de difusion base y se suman a sus pesos originales durante la inferencia. Esto implica que la arquitectura efectiva (UNet o transformer de difusion, VAE, codificador de texto y planificador de ruido) es exactamente la de krea/Krea-2-Turbo; el LoRA unicamente modula el comportamiento de esas capas hacia el estilo "Cyaniji". El sufijo "Turbo" del modelo base sugiere, como es habitual en la familia, una variante destilada para pocos pasos de muestreo, pero no se dispone de confirmacion en la informacion proporcionada.

No hay ningun dato publicado sobre el entrenamiento: se desconoce el numero de imagenes utilizadas, la composicion del dataset, la resolucion de entrenamiento, el rango y el alpha del adaptador, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas de regularizacion como caption dropout o class preservation. Tampoco se documenta el uso de RLHF, DPO ni ningun otro ajuste por preferencias, algo por lo demas poco habitual en adaptadores de estilo. La unica indicacion operativa de la model card es el `instance_prompt` con el que se activa el estilo: `Cyaniji style`.

## Capacidades

- Generacion de imagenes de texto a imagen en el estilo "Cyaniji", condicionada a la inclusion de la palabra de activacion `Cyaniji style` en el prompt.
- Hereda del modelo base la resolucion de salida, la fidelidad de composicion y el numero de pasos de muestreo soportados, siempre que el pipeline cargue correctamente el LoRA.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision analitica: es un adaptador de difusion, no un modelo de lenguaje.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles ni declaradas; el rendimiento con prompts en castellano es indeterminado y dependera del codificador de texto del modelo base.
- Capacidad especial: no se declara ninguna (ni modo "thinking", ni audio, ni edicion de imagen, ni control por pose o profundidad).
- Requiere obligatoriamente pesos, configuracion e implementacion compatibles con `base_model: krea/Krea-2-Turbo`; no es utilizable de forma autonoma.

## Casos de uso

- Produccion de ilustraciones de estilo coherente: al fijar `Cyaniji style` en el prompt, un ilustrador o estudio puede generar un lote de imagenes con una identidad visual uniforme para un mismo proyecto editorial sin reentrenar nada.
- Creacion de assets para videojuegos o prototipos: generacion rapida de conceptos de personajes, objetos o escenarios manteniendo un estilo comun, lo que acelera la fase de preproduccion frente al uso del modelo base sin adaptador.
- Generacion de material para redes sociales y marketing: banners, avatares y piezas graficas con una estetica consistente, aprovechando que el LoRA ocupa solo 0,4 GB y puede alojarse junto al modelo base en un unico servidor de inferencia.
- Personalizacion de herramientas de generacion locales: integracion del adaptador en una instalacion de `diffusers` o en una interfaz grafica basada en nodos para que un usuario no tecnico pueda invocar el estilo mediante la palabra clave.
- Experimentacion en investigacion sobre adaptacion de bajo rango: sirve como caso de estudio de como un LoRA de estilo se comporta sobre un backbone tipo Turbo, comparando fidelidad y deriva de estilo segun la fuerza del adaptador.
- Catalogacion y curaduria de estilos: construir una biblioteca interna de LoRAs intercambiables sobre un mismo modelo base para cubrir distintas direcciones de arte con un coste de almacenamiento por estilo muy bajo.
- Demostraciones y pruebas de concepto: evaluar rapidamente si el estilo encaja con un brief creativo antes de invertir en un fine-tuning completo o en un modelo propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward, HPS v2 ni evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan la escala de CFG, el numero de pasos ni el planificador recomendados, por lo que no es posible estimar de forma fiable la calidad relativa del estilo.

## Requisitos de hardware

- El adaptador en si ocupa 0,4 GB, de modo que su impacto en VRAM es minimo (por debajo de 1 GB en la mayoria de configuraciones); el consumo real lo determina el modelo base krea/Krea-2-Turbo.
- No se dispone de cifras oficiales de VRAM para el modelo base en la informacion proporcionada. Como referencia generica para modelos de difusion de texto a imagen de ultima generacion, la inferencia en precision de 16 bits suele moverse entre 8 y 24 GB de VRAM, y puede reducirse con cuantizacion de 8 o 4 bits, pero esto no esta confirmado para Krea-2-Turbo.
- GPU recomendadas: no disponible. En funcion de la huella real del modelo base, serian adecuadas tarjetas de gama alta de consumo (serie RTX 4090/4080 y similares) o aceleradores profesionales tipo A100 o H100 para despliegues por lotes.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para el modelo base, pero no verificable con los datos disponibles.
- Opciones de despliegue: la biblioteca declarada es `diffusers`; habitualmente estos LoRA tambien se pueden cargar en interfaces graficas basadas en nodos, siempre que exista soporte para el modelo base Krea-2-Turbo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haruka041/cyaniji | LoRA de estilo sobre Krea-2-Turbo | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| krea/Krea-2-Turbo | Modelo base de difusion texto a imagen | no disponible | no aplica | no disponible | Hugging Face (referenciado como base) |
| Otros LoRA de estilo sobre el mismo base | Adaptadores de bajo rango | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos cuantitativos que permitan una comparacion rigurosa con alternativas de la misma categoria. Cualquier comparacion deberia hacerse contra otros adaptadores entrenados sobre Krea-2-Turbo, que no se han identificado en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no se puede asumir permiso para uso comercial. Conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- Dependencia total del modelo base: el adaptador no funciona de forma autonoma y su comportamiento cambia si Krea-2-Turbo se actualiza o se sustituye.
- Ausencia de informacion sobre el dataset de entrenamiento: se desconoce si las imagenes usadas tenian derechos adecuados, lo que introduce riesgo legal en proyectos comerciales.
- Riesgo de sobreajuste al estilo: los LoRA de estilo suelen degradar la diversidad de las salidas y pueden imponer la paleta o la composicion aprendidas incluso cuando el prompt pide otra cosa.
- Deriva y contaminacion del prompt: si no se usa exactamente la palabra de activacion `Cyaniji style`, el estilo puede no aparecer o aparecer de forma debil; usarla en exceso puede saturar la imagen.
- Artefactos tipicos de los modelos de difusion: manos y dedos deformes, texto ilegible, perspectivas incoherentes y caras repetidas. No hay evaluacion publicada que cuantifique estos fallos.
- Sin control de sesgos: no se documentan evaluaciones de sesgo demografico, cultural o de representacion, algo relevante si el estilo se aplica a figuras humanas.
- Idiomas no especificados: es probable que el codificador de texto rinda mejor en ingles, pero no hay confirmacion ni datos sobre prompts en castellano.
- Ecosistema inmaduro: con 0 descargas y 0 likes, el modelo no tiene validacion por parte de la comunidad, y el soporte de Krea-2-Turbo en herramientas de terceros puede ser limitado o inexistente.
- Metadatos incompletos: no se especifican la resolucion de entrenamiento, la escala de CFG ni el rango del adaptador, lo que complica reproducir resultados de forma consistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haruka041/cyaniji
- Archivos del repositorio: https://huggingface.co/Haruka041/cyaniji/tree/main
- Modelo base referenciado: https://huggingface.co/krea/Krea-2-Turbo
- No se han encontrado en la informacion proporcionada papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
