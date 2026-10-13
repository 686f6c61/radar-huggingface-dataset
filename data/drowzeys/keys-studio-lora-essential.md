# drowzeys/keys-studio-lora-essential

## Resumen

`drowzeys/keys-studio-lora-essential` es un repositorio de adaptadores LoRA compilados para el entorno "Wasserman Slate AI Studio", pensado para cargarse en dos motores concretos: equipos Mac y DGX Spark (NVIDIA GB10 Grace Blackwell). No se trata de un modelo base, sino de una carpeta de builds adaptadas (weights con cambios propios de compilacion) de LoRAs de terceros orientadas a generacion y edicion de video. El modelo subyacente sobre el que operan estas LoRAs es MiniMax H3, segun declara la propia model card ("Powered by MiniMax H3").

La coleccion se organiza en siete categorias funcionales: camara y punto de vista, transformacion y morphing, edicion de personajes, movimiento y accion, estilo artistico, soporte y acabado, y "fun". Cada LoRA mantiene su autoria original y su licencia particular (mayoria bajo "H3 Community License", algunas permisivas, gated o sin licencia declarada), con la pagina original del autor referenciada en cada fila. El repositorio ocupa 22,2 GB y no declara licencia propia ni idiomas soportados.

El proyecto tiene relevancia practica para quien despliegue flujos de generacion de video sobre MiniMax H3 en hardware Mac o DGX Spark, porque empaqueta en un unico indice las LoRAs verificadas como compatibles con esos dos motores, marcando ademas con "HOLD" las que no tienen build disponible (por licencia gated, ausencia de licencia o gating manual). No es un modelo de lenguaje ni un modelo multimodal de texto: es una distribucion de adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de adaptadores LoRA sobre MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE; es una coleccion de LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia propia; cada LoRA conserva la suya) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura de red, datos de entrenamiento, numero de tokens ni proceso de alineacion (RLHF, DPO). Se describe unicamente como una carpeta de builds de LoRA ("adapted LoRA builds") para dos motores: Mac y DGX Spark. El modelo base declarado es MiniMax H3, y cada subcarpeta incluye un fichero `SOURCE.md` que indica el autor original, el archivo de origen y que cambio la build. No hay informacion sobre si las LoRAs se reentrenaron, se recuantizaron o se convirtieron a otro formato; la model card solo indica los destinos de build (mac, spark) y el estado de hosting (HOST / HOLD).

Las LoRAs cubren funciones de post-proceso y control sobre generacion de video: control de camara (movimiento de camara, FPV montado en cabeza, equirectangular 360 grados, orbita 360 grados), transformacion y morphing (transformacion, turnaround, animacion por keyframes), edicion de personaje (intercambio de personaje, eliminacion de personas, habla facial natural), movimiento y accion (reparacion de continuidad de movimiento, combate base V2, combate con armas, fisica espacial), estilo artistico (slider anime, lineart anime, estilo 3D), soporte y acabado (upscaler de video, reparacion de continuidad) y "fun" (efecto VHS, accion wushu, multiples angulos). No se aportan detalles de capas, dimensiones de rango LoRA ni hiperparametros.

## Capacidades

- Aplicacion de LoRA de control de camara sobre MiniMax H3: movimiento de camara, FPV montado en cabeza, proyeccion equirectangular 360 grados y orbita 360 grados.
- Transformacion y morphing de video: transformacion entre sujetos, turnaround y animacion por keyframes.
- Edicion de personaje: intercambio de personaje, eliminacion de personas en escena y sintesis de habla facial natural.
- Control de movimiento: reparacion de continuidad de movimiento, combate base, combate con armas y fisica espacial.
- Estilizacion artistica: slider anime, lineart anime y estilo de animacion 3D.
- Soporte y acabado: upscaling de video y reparacion de continuidad de movimiento.
- Efectos "fun": aspecto de cinta VHS, accion de wushu y variacion de multiples angulos.
- Empaquetado multi-motor: cada LoRA puede tener build para Mac y/o DGX Spark, y estado de hosting HOST o HOLD.
- Trazabilidad de autoria y licencia por LoRA mediante ficheros `SOURCE.md`.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni thinking mode. La naturaleza del repositorio es de adaptadores de generacion/edicion de video.

## Casos de uso

- Postproduccion de video generado con MiniMax H3: aplicar la LoRA de movimiento de camara para reconvertir una toma plana en un travelling o una orbita, reutilizando el mismo clip sin regenerar.
- Reparacion de continuidad en secuencias largas: usar las LoRAs "Motion Continuity Repair" para suavizar saltos entre planos generados por separado, evitando flicker entre tomas.
- Edicion de personaje en escenas existentes: aplicar "Character Swap" o "Person Remover" para sustituir o eliminar un sujeto sin rehacer el clip completo.
- Creacion de contenido 360 grados o VR: emplear "Equirectangular 360 grados" y "360 grados Orbit" para producir material listo para visores, partiendo de la generacion base de H3.
- Animacion estilizada: usar "Lineart Anime", "Anime Slider" o "3D Animation Style" para reconvertir una generacion fotorrealista en estetica anime o 3D sin reentrenar el modelo base.
- Limpieza y escalado de material generado: aplicar "Video Upscaler LoRA" para aumentar resolucion y "Natural Face Speech" para mejorar la sincronia labial en primeros planos de personajes hablando.
- Efectos retro y viral: generar clips con "VH5 Tape (VHS)" para estetica de VHS, o "Wushu Action" para secuencias de artes marciales de cara a redes sociales.
- Despliegue en laboratorio con hardware local: cargar las builds "mac" en Apple Silicon o las builds "spark" en un DGX Spark para prototipar sin depender de GPU cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de FID, FVD, CLIP score ni comparativas numericas frente a otras LoRAs o al modelo base. Tampoco se declaran latencias ni throughput.

## Requisitos de hardware

- Mac (Apple Silicon): soportado explicitamente; la model card lista "mac" como destino de build para las LoRAs en estado HOST. No se especifican modelos de chip ni memoria unificada minima.
- DGX Spark (NVIDIA GB10 Grace Blackwell): soportado explicitamente como segundo destino de build ("spark"). No se especifican VRAM ni configuracion concreta.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se listan frameworks concretos (vLLM, llama.cpp, Ollama, TGI, ComfyUI). El repositorio esta pensado para cargarse desde el entorno "Wasserman Slate AI Studio". Un repositorio relacionado del mismo autor, `drowzeys/keys-vLLm.0.27-Qwen3.8-27B-...`, sugiere uso de vLLM en el ecosistema del autor, pero esto no se confirma para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo con parametros comparables, sino una coleccion de adaptadores LoRA sobre MiniMax H3. Las alternativas equivalentes serian otras distribuciones de LoRAs para MiniMax H3 o para modelos de generacion de video similares, pero no se dispone de datos de rendimiento, tamano ni licencia comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base MiniMax H3 y un motor compatible (Mac o DGX Spark) para funcionar.
- Licencias heterogeneas: cada LoRA conserva la licencia de su autor. La mayoria son "H3 Community License", algunas "permisiva segun el autor", varias gated, y tres LoRAs de JOKER141 figuran como "No licence stated", lo que impide asumir permisos de uso comercial.
- LoRAs en estado HOLD: Camera "Keyframe Animation" (alvdansen), las tres de JOKER141, "Anime Slider" (adf99), "Lineart Anime" (DiffSynth-Studio), "3D Animation Style" (SOLRICKS), "Video Upscaler LoRA" (dntpi) y "Multiple Angles (image)" (akhaliq, que ademas corresponde a Qwen-Image-2.1, no a MiniMax H3) no tienen build publicado en este repositorio.
- Entradas duplicadas: "Natural Face Speech" (vpakarinen) y "Person Remover" (Akatz Labs) aparecen en mas de una categoria, y "Motion Continuity Repair" figura tanto en "Motion & Action" como en "Support & Finishing" (esta ultima en estado HOLD).
- Dependencia del modelo base: no se declara version concreta de MiniMax H3 con la que se validaron las builds, lo que puede provocar incompatibilidades si el modelo base cambia.
- Sin licencia propia ni idiomas declarados: el repositorio no indica licencia global ni idiomas soportados.
- Sin informacion de sesgos, alucinacion ni limites de contexto: no se documenta ningun analisis de sesgo, evaluacion de calidad ni limites de duracion de clip o resolucion.
- Repositorio sin adopcion publica: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- HuggingFace (repositorio): https://huggingface.co/drowzeys/keys-studio-lora-essential
- Model card base consultada: https://huggingface.co/drowzeys/keys-studio-lora-essential (README)
- Pagina del autor principal de la LoRA Wasserman: https://wassermanproductions.com
- Repositorio Wasserman 80s Horror LoRA: https://github.com/wassermanproductions/wasserman-80s-horror-lora
- LoRA Camera Motion (Jojocodex): https://huggingface.co/Jojocodex/minimax-h3-Camera-Motion-lora
- LoRA Head-mounted FPV (neph1): https://huggingface.co/neph1/minimax_h3_headmounted_fpv_cam
- LoRA Equirectangular 360 grados (shamanic): https://huggingface.co/shamanic/minimax-h3-equi360-lora
- LoRA 360 grados Orbit (pablodawson): https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA
- LoRA Transformation (Ashmotv): https://huggingface.co/Ashmotv/transformation_lora
- LoRA Turnaround (matlod): https://huggingface.co/matlod/minimax-h3-turnaround
- LoRA Keyframe Animation (alvdansen): https://huggingface.co/alvdansen/h3-keyframe-animation
- LoRA Character Swap (Akatz Labs): https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- LoRA Person Remover (Akatz Labs): https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA
- LoRA Natural Face Speech (vpakarinen): https://huggingface.co/vpakarinen/natural-face-speech-h3-lora
- LoRA Motion Continuity Repair (JOKER141): https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair
- LoRA Combat Base V2 (JOKER141): https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2
- LoRA Weapon Combat (JOKER141): https://huggingface.co/JOKER141/MiniMax-H3-Weapon-Combat-LoRA
- LoRA Spatial Physics (Jojocodex): https://huggingface.co/Jojocodex/minimax-h3-spatial-physics-lora
- LoRA Wushu Action (Jojocodex): https://huggingface.co/Jojocodex/minimax-h3-wushu-action-lora
- LoRA Anime Slider (adf99): https://huggingface.co/adf99/H3_Ref2V_Anime_Slider_v1
- LoRA Lineart Anime (DiffSynth-Studio): https://huggingface.co/DiffSynth-Studio/MiniMax-H3-LoRA-LineartAnime
- LoRA 3D Animation Style (SOLRICKS): https://huggingface.co/SOLRICKS/3D-Animation-Style-MiniMax-H3
- LoRA VH5 Tape / VHS (KennethFal): https://huggingface.co/KennethFal/vh5tape-vhs-lora-minimax-h3
- LoRA Multiple Angles (akhaliq, para Qwen-Image-2.1): https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA
- Repositorio Video Upscaler LoRA (dntpi): https://github.com/dntpi/ComfyUI-H3-Video-Upsampler
- Referencia cruzada al ecosistema DGX Spark del autor: https://github.com/bidual/awesome-dgx-spark
