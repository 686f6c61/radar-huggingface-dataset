# JOKER141/MiniMax-H3-Combat-Base-V2

## Resumen

MiniMax-H3-Combat-Base-V2 es un adaptador LoRA de 148 MB creado por el usuario JOKER141 sobre el modelo de generacion de video MiniMax H3 de Comfy-Org. A diferencia de un modelo completo, este adaptador no genera texto ni imagenes: modifica el comportamiento del modelo base para producir escenas de accion, pelea y dialogo con mayor realismo fisico y continuidad. El autor lo presenta como una actualizacion importante de la version V1, con mejoras en la continuidad de acciones, reacciones de impacto acumulativas, movimiento espacial y causa-efecto fisico. Es relevante para creadores de video, animadores y desarrolladores que trabajan con flujos de ComfyUI y necesitan coreografiar escenas de combate sin recurrir a captura de movimiento. La ficha incluye dos workflows especializados de "combat director" y recomienda configuraciones concretas de sampler para obtener resultados nitidos. El modelo funciona con prompts en ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre el modelo de generacion de video MiniMax H3 de Comfy-Org. La arquitectura interna del modelo base no se detalla en la informacion disponible. |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, chino |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivo H3_Combat_V2.safetensors, 148 MB) |

## Arquitectura y entrenamiento

El adaptador se construye como una LoRA sobre el modelo base MiniMax H3, propiedad de Comfy-Org. El autor no publica detalles del entrenamiento: no se indica el conjunto de datos, el numero de tokens ni si se usaron tecnicas como RLHF o DPO. La unica informacion tecnica disponible es la lista de mejoras de la version V2, que incluyen una logica de "cadena fisica continua" en la que los golpes fallidos conservan el impulso, los bloqueos cambian de direccion sin cortes y las extremidades se separan limpiamente. El README advierte que el resultado depende en gran medida del sampler: se recomienda res_multistep con scheduler simple, o euler con scheduler beta. Otras combinaciones pueden producir resultados mas borrosos o suaves. El pack incluye dos workflows de director de combate (general y "uno contra muchos") con instrucciones en chino que permiten generar prompts finales en cualquier idioma.

## Capacidades

- Generacion de video de accion y pelea con mayor velocidad y claridad de movimiento.
- Continuidad de combate en cadena: los ataques fallidos mantienen el impulso, los bloqueos redirigen la accion de forma natural y los contactos no se "pegan" entre personajes.
- Reacciones de impacto persistentes y acumulativas: el dano se expresa en el tiempo como torso doblado, guardia descendida o movilidad reducida, y se acumula hasta remates pesados.
- Coreografia avanzada: patadas giratorias continuas, grappling sostenido, derribos, colisiones ambientales en tres fases (cuerpo, entorno, material) y caidas con trayectorias multifasicas.
- Coreografia cinematografica "uno contra muchos" con entradas escalonadas de atacantes, control de carriles espaciales, seguimiento centrado en el protagonista y continuidad de accion a traves de cortes.
- Mejora de escenas de dialogo: el autor reporta +19.5% de movimiento dentro del plano, +34.2% de RMS de audio y +22.4% de nitidez de bordes en pruebas internas de dialogo con la misma semilla.
- Integracion con ComfyUI mediante dos workflows de "combat director" que soportan la generacion de prompts en cualquier idioma.
- No es un sistema automatico: requiere que el prompt especifique la secuencia de la pelea (quien ataca, donde impacta, como reacciona el oponente). Con prompts simples como "two people fighting", el resultado tiende a ser rapido pero sin logica.

## Casos de uso

- Produccion cinematografica de escenas de lucha: el adaptador permite coreografiar peleas con continuidad fisica creible y reacciones de impacto realistas. Los workflows incluidos en ComfyUI ayudan a estructurar el prompt como "accion primero, dialogo despues".
- Generacion de cinemáticas de combate para videojuegos: sirve para producir animaciones de derribos, reacciones a dano y remates de alto impacto, reduciendo la necesidad de captura de movimiento.
- Contenido de accion para redes sociales: con los ajustes de sampler recomendados, se pueden generar clips cortos de combate con movimientos rapidos y nitidos listos para plataformas como TikTok o YouTube Shorts.
- Animacion de escenas de dialogo con actuacion corporal: segun las pruebas internas, el adaptador tambien mejora la respiracion, el movimiento corporal y la dinamica vocal en planos sin pelea, lo que resulta util en serie y cine de dialogo.
- Prototipado de coreografias para directores de accion: permite visualizar secuencias de pelea y probar variaciones de bloqueos, contragolpes y caidas modificando solo el prompt, sin coste de produccion fisica.
- Trailers y piezas de marketing: la funcion "prfin1" facilita remates pesados y estunt, por lo que es adecuada para generar clips de impacto en campañas de promocion de peliculas o videojuegos.
- Integracion en pipelines de IA generativa: como modulo de sincronizacion de acciones dentro de flujos ComfyUI, combinable con otros adaptadores para crear planos complejos con multiples elementos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor presenta mediciones internas de pruebas de dialogo con la misma semilla, que no son comparables con benchmarks publicos y no se han replicado de forma independiente. Estos datos se recogen a continuacion:

| Metrica interna | Variacion reportada |
|---|---|
| Movimiento dentro del plano (in-shot motion) | +19.5% |
| RMS de audio | +34.2% |
| Nitidez de bordes (edge sharpness) | +22.4% |

## Requisitos de hardware

- VRAM estimada: no publicada para el adaptador. El LoRA anade aproximadamente 148 MB al peso del modelo base, pero la VRAM total dependera del modelo base, del numero de frames y de la resolucion de salida.
- GPU recomendadas: no se han publicado requisitos especificos para este LoRA. Para el modelo base MiniMax H3, el repositorio de integraciones de MiniMax-AI documenta configuraciones verificadas en 4xH200/H100, B200/B300, 2xRTX 5090 con offload por capas y una unica RTX 4090 de 24 GB con cuantizacion int8. Tambien se indica soporte para AMD MI355X y MI300X via ROCm y AITER.
- Compatibilidad con GPU de consumo: es posible ejecutar el modelo base en una RTX 4090 24 GB con cuantizacion int8, segun la documentacion publicada, aunque no se confirma explicitamente el comportamiento de este adaptador en esa configuracion.
- Opciones de despliegue: ComfyUI con los workflows incluidos; SGLang Diffusion con soporte nativo para el pipeline H3; plataformas en la nube como RunningHub, citada en la ficha de CivArchive como destino de ejecucion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos sobre modelos similares en la informacion disponible. La unica referencia directa es la version anterior del propio autor, Combat Base V1, que segun el README queda superada por esta V2, pero no se dispone de las especificaciones de V1. No se incluyen otros LoRAs para el mismo modelo base en los datos facilitados.

| Adaptador | Modelo base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Combat-Base-V2 | Comfy-Org/MiniMax-H3 | 148 MB | no disponible | HuggingFace, CivArchive |
| Combat Base V1 (anterior) | Comfy-Org/MiniMax-H3 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor advierte que no es un "LoRA magico": no coreografia automaticamente una pelea. Si el prompt es demasiado simple (por ejemplo, "two people fighting"), el modelo puede generar movimientos rapidos pero sin logica, como golpes al aire sin conexion.
- El resultado es muy sensible a la configuracion del sampler. Se recomienda usar res_multistep con scheduler simple o euler con scheduler beta; otras combinaciones pueden producir videos borrosos o menos contundentes.
- Cuando un plano combina combate y dialogo, la orden del prompt es critica: debe completarse primero la accion de golpeo y despues la linea de dialogo. De lo contrario, el modelo puede revertir al comportamiento mas lento del modelo base.
- No se dispone de informacion sobre sesgos o mitigaciones. El adaptador fue probado con prompts en ingles y chino, por lo que su rendimiento con otros idiomas no esta garantizado.
- La licencia no esta publicada, lo que genera incertidumbre para uso comercial. Ademas, el modelo base MiniMax H3 puede tener sus propias restricciones, que no se detallan en esta ficha.
- Al ser una LoRA, las limitaciones del modelo base (por ejemplo, artefactos de generacion, falta de control fino sobre la fisica) se heredan y pueden amplificarse en escenas complejas con multiples personajes o interacciones con el entorno.

## Enlaces

- HuggingFace: https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2
- CivArchive: https://civarchive.com/models/2853878?modelVersionId=3246572
- Integraciones de MiniMax H3 en GitHub: https://github.com/MiniMax-AI/awesome-minimax-h3-integration
- Informacion del modelo base MiniMax H3 Max: https://fal.ai/minimax-h3-max
