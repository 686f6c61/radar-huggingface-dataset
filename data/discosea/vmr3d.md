# DiscoSea/vmr3D

## Resumen

vmr3D (Volumetric Motion Rigging) es un flujo de trabajo de investigacion desarrollado por el autor redazul, con asistencia experimental de GPT-6-Astra, para recuperar el movimiento de un personaje a partir de secuencias de mallas reconstruidas en 3D. El objetivo es corregir la deriva de proporciones, agarres y detalle de superficie que aparece al reconstruir un video en mallas independientes, preservando la calidad de la animacion final. No se trata de un modelo de red neuronal ni de un modelo de lenguaje: el repositorio contiene un personaje animado, demostraciones en video, registros de validacion y una hoja de ruta propuesta para el futuro desarrollo de un modelo aprendido. El artefacto incluye una secuencia de 52 poses de un swing de beisbol estilizado, reproducida a 30 fps, con exportacion a FBX y validacion en Unity. El repositorio no contiene pesos entrenados, arquitectura de aprendizaje implementada ni endpoint de inferencia; el FBX es un asset de animacion, no un checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo neuronal; el flujo usa tecnicas de registro no rigido y rigging volumetrico) |
| Parametros totales | No disponible (sin pesos de red neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (no hay pesos de red neuronal) |
| Idiomas soportados | Ingles (segun metadatos de HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (contiene asset FBX, videos y documentacion; sin pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

vmr3D no implementa una arquitectura de deep learning ni ha sido entrenado con datos. Es un pipeline de procesamiento geometrico que combina tecnicas establecidas en seis pasos: establecer un personaje de referencia, recuperar el movimiento mediante volumenes interiores (64 controles de volumen con rotacion, traslacion y escala regularizada, y cuatro influencias por vertice original), ajustar la superficie preservando la forma local, reconstruir explicitamente el detalle dificil (mano, agarre y bate), preservar volumen y puntos finales, y exportar a FBX con validacion de playback. No se han utilizado datos de entrenamiento, tokens ni procesos RLHF/DPO. La innovacion declarada es la combinacion de tecnicas ya conocidas con pasos explicitos de reconstruccion y validacion, sin reclamar novedad cientifica ni superioridad general.

## Capacidades

- Recuperacion de movimiento de personajes a partir de secuencias de mallas reconstruidas en 3D.
- Preservacion de detalle superficial dificil, como el agarre de la mano sobre un bate, durante la animacion.
- Exportacion a FBX con blend shapes animados y texturas embebidas.
- Validacion de fidelidad tras reimportacion: error maximo de posicion de vertice por debajo de 4.85 × 10⁻⁸ unidades de escena para las 52 poses.
- Comparacion con refinamientos de registro no rigido (Amberg y Sumner/Popovic) y con una aproximacion esqueletica (Dem Bones).
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, vision, tool calling, agentes ni modo thinking.
- Capacidad multilingue: no aplica, el material esta en ingles y es un recurso tecnico.

## Casos de uso

- Recuperacion de movimiento para videojuegos: el flujo permite convertir una secuencia de mallas reconstruidas en una animacion FBX con blend shapes, lista para importar en Unity. Es adecuado porque la validacion en Unity confirma que el FBX funciona y su animacion esta disponible.
- Preservacion de detalle en animaciones deportivas: la reconstruccion explicita del agarre y la mano mantiene la coherencia del contacto con el bate a lo largo de la secuencia, donde la deformacion por si sola no puede conservarlo.
- Refinamiento de capturas volumetricas para VFX: el paso de ajuste de superficie protege regiones aceptadas y repara la geometria local de mano y antebrazo mediante restricciones de grosor, evitando colapsos o arrastres entre superficies.
- Banco de pruebas para investigacion en registro no rigido: el repositorio documenta comparaciones con Amberg, Sumner/Popovic y Dem Bones en una secuencia especifica, permitiendo a investigadores replicar o evaluar los resultados.
- Validacion de exportacion de animaciones: incluye un registro de comprobacion tras la reimportacion del FBX, con un error de vertice por debajo de 4.85 × 10⁻⁸ unidades, util para pipelines que exigen fidelidad numerica.
- Documentacion de integracion con Blender: las capturas reales del workspace muestran la animacion editable en la linea de tiempo de Blender a 30 fps, sirviendo como referencia para artistas tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No obstante, la model card reporta validaciones especificas de esta secuencia:

| Metrica | Valor reportado |
|---|---|
| Error maximo de vertice tras reimportacion del FBX | < 4.85 × 10⁻⁸ unidades de escena |
| Poses verificadas tras reimportacion | 52 de 52 |
| Preferencia visual frente a Amberg y Sumner/Popovic | VMR preferido por menor jitter aparente |
| Distancia one-way a geometria objetivo | Amberg y Sumner/Popovic la redujeron; VMR no fue evaluado con esta metrica |

Estas medidas no son pruebas de exactitud con datos held-out ni puntuaciones de jitter temporal. La evidencia esta limitada a esta secuencia y a las configuraciones probadas, y las causas de las diferencias visuales no se han aislado.

## Requisitos de hardware

- No aplica: el repositorio no contiene pesos de red neuronal ni requiere hardware de inferencia.
- Para reproducir el flujo se recomienda una estacion de trabajo con Blender y capacidad de calculo geometrico (CPU suficiente para las operaciones de registro de mallas).
- La inspeccion del FBX y los videos no requiere GPU especifica.
- No se requiere GPU como A100, H100 ni RTX 4090 para ninguno de los artefactos incluidos.
- Opciones de despliegue: no aplica, al no existir modelo de inferencia ni endpoint.

## Comparativa con modelos similares

No es comparable con modelos de lenguaje o de vision. Las alternativas relevantes son tecnicas de registro no rigido evaluadas dentro del propio flujo:

| Tecnica | Resultado en esta secuencia | Limitacion observada |
|---|---|---|
| VMR (flujo propuesto) | Resultado preferido visualmente por menor jitter aparente | No resuelve por si solo la separacion de superficies; una superficie para poses 1-51 y otra para pose 52 |
| Amberg (Trimesh non-rigid registration) | Redujo la distancia one-way a la geometria objetivo | Mayor jitter visual aparente |
| Sumner/Popovic (Trimesh non-rigid registration) | Redujo la distancia one-way a la geometria objetivo | Mayor jitter visual aparente |
| Dem Bones | Aproximo una superficie de 51 poses con 64 huesos y hasta 4 influencias por vertice | No resolvio la superficie de cierre separada; el resultado se sustituyo por la animacion horneada de VMR |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de red neuronal entrenado, arquitectura de aprendizaje implementada ni endpoint de inferencia; solo incluye artefactos de investigacion y una hoja de ruta.
- El estado es work-in-progress: no hay garantias de generalizacion mas alla de la secuencia demostrada.
- Las mallas de referencia son estimaciones reconstruidas, no ground truth perfecto, por lo que el resultado hereda sus errores.
- La animacion presenta una limitacion en la exportacion: una sola superficie para las poses 1-51 y una superficie de cierre separada para la pose 52.
- Las comparaciones con Amberg, Sumner/Popovic y Dem Bones son especificas de una unica secuencia y configuracion; no se han aislado las causas de las diferencias visuales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero al no existir pesos de modelo esta licencia solo aplica a los artefactos del repositorio.
- No se ha verificado la reproducibilidad completa del flujo en otros entornos o con otras entradas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DiscoSea/vmr3D
- Autor: https://github.com/redazul
- Video de comparacion fuente / malla de referencia / VMR: https://huggingface.co/DiscoSea/vmr3D/resolve/main/whitepaper/assets/vmr_source_reference_result.mp4
- Video de entrada: https://huggingface.co/DiscoSea/vmr3D/resolve/main/whitepaper/assets/input_video.mp4
- Animacion final VMR: https://huggingface.co/DiscoSea/vmr3D/resolve/main/whitepaper/assets/final_animation.mp4
- Capturas del workspace de Blender: https://huggingface.co/DiscoSea/vmr3D/resolve/main/whitepaper/assets/blender_workspace.mp4
