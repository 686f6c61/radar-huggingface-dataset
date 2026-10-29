# axiomofmind/Moss-image-anime-lora

## Resumen

Moss-image-anime-lora es un adaptador LoRA de estilo (text-to-image) para la familia de modelos de difusion MOSS-Image del proyecto OpenMOSS. Lo publica el usuario axiomofmind en HuggingFace y su funcion es desplazar el estilo visual del modelo base hacia un anime de tono seinen: accion dramatica, iluminacion cinematografica, siluetas marcadas, entornos densos y personajes adultos expresivos. No es un modelo autonomo: requiere cargar OpenMOSS-Team/MOSS-Image-SFT (o MOSS-Image-Base) y aplicar el adaptador encima.

El repositorio incluye dos checkpoints (2.000 pasos como canonico y 1.500 pasos como alternativo), una variante convertida para ComfyUI y una conversion GGUF publicada en un repositorio aparte. El tamano del repo es de 0,3 GB y el fichero LoRA para ComfyUI pesa 70,93 MiB con 504 tensores. La licencia declarada es Apache 2.0.

Su relevancia es practica: permite obtener un estilo anime cinematografico coherente sobre MOSS-Image sin reentrenar el modelo base, con instrucciones concretas de escala, pasos de inferencia y formato de prompt, y con una ruta de compatibilidad resuelta para ComfyUI (el problema de namespaces entre claves Diffusers/PEFT y el cargador nativo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; las claves del adaptador apuntan a modulos `transformer.layers.N.proj.q` del modelo base, compatible con el esquema Diffusers/PEFT |
| Parametros totales | No disponible (el LoRA no declara numero de parametros; el repo pesa 0,3 GB y el fichero ComfyUI 70,93 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-image); longitud de prompt soportada: no disponible |
| Tipos de cuantizacion | safetensors en el repo principal (Diffusers/PEFT) y variante ComfyUI en safetensors; existe conversion GGUF del LoRA y del modelo base SFT en repositorios separados. Niveles de cuantizacion GGUF concretos: no disponible |
| Idiomas soportados | No disponible. La model card solo proporciona ejemplos de prompt en ingles |
| Licencia | Apache 2.0 (declarada para el adaptador) |
| Formato de pesos | safetensors (Diffusers/PEFT en la raiz y en `checkpoints/step-1500/`), safetensors con namespaces ComfyUI (`diffusion_model.*`), GGUF en repo aparte |

## Arquitectura y entrenamiento

El adaptador se entrena contra OpenMOSS-Team/MOSS-Image-Base, aunque la evaluacion local del autor favorecio OpenMOSS-Team/MOSS-Image-SFT para inferencia, y es esta ultima la que se documenta como modelo subyacente recomendado. Se distribuyen dos checkpoints: el de 2.000 pasos (`pytorch_lora_weights.safetensors`, escala recomendada 1.0) y el de 1.500 pasos (`checkpoints/step-1500/pytorch_lora_weights.safetensors`, escalas 0.7 o 1.0). El trigger registrado en entrenamiento es `moss_seinen_style`, pero el autor indica que es opcional y que los prompts naturales con "anime character" o "anime characters" funcionaron mejor sin el en la comparacion final.

La conversion para ComfyUI es puramente de namespace: `transformer.` pasa a `diffusion_model.`, sin cambios en valores, formas, dtypes, rango ni comportamiento de alpha. Se validaron los 504 tensores convertidos contra los 252 modulos correspondientes de MOSS-Image-SFT, y el script reproducible (`scripts/convert_moss_lora_for_comfyui.py`) esta incluido en el repo. El fichero `MOSS-Image-Anime-LoRA-ComfyUI.safetensors` (70,93 MiB, SHA-256 `6661F88183757C7BE9044578D3907335D6ABE83A736995BD502B78DB2C5B83CF`) corresponde al checkpoint canonico de 2.000 pasos. No se detalla en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset ni el rango (rank) del LoRA.

## Capacidades

- Generacion de imagenes text-to-image con estetica anime seinen: accion, iluminacion cinematografica, contraluces, siluetas fuertes y composiciones energeticas.
- Representacion de personajes adultos con detalle en vestuario, pelo y expresion (los ejemplos incluyen traje de vuelo, abrigo gastado, pelo trenzado blanco).
- Escenas de entorno denso: hangares orbitales danados, talleres nocturnos con chispas de soldadura, tuneles, rios con niebla.
- Composicion multi-personaje y accion simultanea (por ejemplo, dos personajes en una moto con drones persiguiendo).
- Control de estilo mediante escala del LoRA (1.0 canonico; 0.7 como punto intermedio; 0.7 con trigger como configuracion secundaria).
- Compatibilidad con prompts naturales en ingles sin trigger, que el autor considera el modo preferente.
- Integracion en ComfyUI mediante cargador LoRA estandar con fuerza de modelo 1.0 y fuerza de clip 0.0.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de portada para novela ligera o comic digital: con 1024x1024 y 50 pasos se obtienen escenas de accion con iluminacion dramatica listas para retoque, utiles para cubiertas de seriales web.
- Concept art para videojuego: el enfasis en siluetas fuertes y entornos densos permite generar variaciones rapidas de personajes y escenarios (hangares, talleres, tuneles) para fijar direccion de arte.
- Storyboarding de animacion: prompts descriptivos con accion concreta ("deslizandose bajo una puerta blindada que se cierra") generan fotogramas clave que sirven de referencia de encuadre y luz.
- Creacion de arte para merchandising y fan art con estilo consistente: aplicar el mismo LoRA a escala fija mantiene una linea visual reconocible en posters, camisetas y prints.
- Produccion de ilustraciones para modulos de rol o juegos de mesa: el estilo seinen encaja con ambientaciones de ciencia ficcion y accion, y la ventana de 1024x1024 es suficiente para cartas y fichas.
- Generacion de material para prototipos de interfaz o presentaciones: bocetos de escena con estetica anime para maquetas de apps, trailers internos o pitching, integrados en un flujo ComfyUI.
- Exploracion estilistica en investigacion de modelos de difusion: al ser un LoRA pequeno (70,93 MiB) con dos checkpoints y evaluacion con semillas identicas, sirve como caso de estudio de efecto de escala y de paso de entrenamiento sobre el estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente comparaciones visuales cualitativas con prompts y semillas identicas entre el SFT sin LoRA, el checkpoint 1.500 a escalas 0.7 y 1.0, y el checkpoint 2.000 a escala 1.0 y 0.7 con trigger. No hay metricas objetivas (FID, CLIP score, preferencia humana cuantificada) ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- El LoRA en si ocupa 70,93 MiB (variante ComfyUI) y el repo completo 0,3 GB, por lo que su coste de VRAM es marginal frente al modelo base.
- La VRAM necesaria para inferencia viene determinada por MOSS-Image-SFT, no por el adaptador; ese dato no esta disponible en la informacion proporcionada y debe consultarse en la model card del modelo base.
- GPU recomendadas: no disponible para el modelo base en la informacion proporcionada. El adaptador no impone requisitos adicionales de GPU.
- Ajuste en GPU de consumo: no confirmado en la informacion disponible; depende del modelo base y del nivel de cuantizacion (existe una ruta GGUF con MOSS-Image-SFT-GGUF que puede reducir requisitos, pero no se detallan niveles ni cifras).
- Opciones de despliegue: Diffusers (formato nativo PEFT), ComfyUI (requiere commit `b1a247c` o posterior para el cargador nativo de MOSS-Image) y flujos GGUF mediante los repositorios GGUF del autor.
- Configuracion de inferencia documentada: 50 pasos, guidance scale 3.0, prompt negativo vacio, resolucion tipica 1024x1024.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros LoRA de terceros para MOSS-Image con los que comparar. La comparacion posible es interna, entre el modelo base sin adaptador y las variantes publicadas:

| Variante | Fichero | Escala | Trigger | Notas |
|---|---|---|---|---|
| MOSS-Image-SFT sin LoRA (referencia) | no aplica | no aplica | no aplica | Estilo base, sin desplazamiento hacia anime seinen |
| LoRA checkpoint 2.000 (canonico) | `pytorch_lora_weights.safetensors` | 1.0 | Omitido (recomendado) | Configuracion preferente del autor con prompts naturales |
| LoRA checkpoint 2.000 (secundaria) | mismo fichero | 0.7 | `moss_seinen_style` al inicio | Resultado secundario aceptable segun el autor |
| LoRA checkpoint 1.500 (alternativo) | `checkpoints/step-1500/pytorch_lora_weights.safetensors` | 0.7 o 1.0 | Omitido | Segunda configuracion preferente |
| Variante ComfyUI del checkpoint 2.000 | `MOSS-Image-Anime-LoRA-ComfyUI.safetensors` | 1.0 modelo / 0.0 clip | Omitido | Solo cambio de namespace; 504 tensores, 70,93 MiB |

## Limitaciones y advertencias

- No hay evaluacion cuantitativa: la seleccion de checkpoints y escalas se basa en comparacion visual local del autor, no en metricas reproducibles.
- El trigger `moss_seinen_style` es opcional y en la evaluacion del autor empeoro el resultado en prompts naturales; usarlo por inercia puede degradar la salida.
- Cargar el fichero de la raiz directamente en ComfyUI produce el error `lora key not loaded` por el desajuste de namespaces; hay que usar la variante ComfyUI o convertir las claves.
- La variante ComfyUI solo cubre el checkpoint de 2.000 pasos; el de 1.500 permanece en formato Diffusers/PEFT y requiere conversion para ese entorno.
- Resolucion validada en 1024x1024; otras relaciones de aspecto deben validarse escena por escena segun el propio autor.
- Sesgos de estilo: el adaptador empuja hacia anime seinen con personajes adultos; puede reducir la diversidad de estilos del modelo base y no se documenta comportamiento fuera de ese registro.
- Riesgo de alucinacion visual (anatomia, manos, coherencia de objetos) inherente a los modelos de difusion: no se reportan tasas de fallo.
- Idioma: no se documentan idiomas soportados; todos los ejemplos y recomendaciones de prompt estan en ingles, y no hay evidencia de rendimiento con prompts en castellano.
- Licencia: el adaptador declara Apache 2.0, pero no se especifica en la informacion disponible la licencia del modelo base MOSS-Image-SFT ni si impone condiciones adicionales al uso comercial del conjunto; conviene verificarla antes de produccion.
- Fechas del repositorio (creacion 2026-10-20, actualizacion 2026-10-23) y recuento de descargas (2.553) y likes (15) segun los metadatos de HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axiomofmind/Moss-image-anime-lora
- Conversion GGUF del LoRA: https://huggingface.co/axiomofmind/Moss-image-anime-lora-GGUF
- Modelo base SFT en GGUF: https://huggingface.co/axiomofmind/MOSS-Image-SFT-GGUF
- Modelo base de entrenamiento: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base recomendado para inferencia: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Commit de ComfyUI con soporte nativo de MOSS-Image: https://github.com/Comfy-Org/ComfyUI/commit/b1a247c9cf9dbfda4b2c0a0c1d50950667eeaa0c
- Script de conversion incluido en el repo: `scripts/convert_moss_lora_for_comfyui.py`
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos corresponden a servicios de aparcamiento de aeropuertos y no guardan relacion con el modelo.
