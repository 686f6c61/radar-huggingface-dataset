# changh95/pi05-base-p150

## Resumen

pi05-base-p150 es un paquete de despliegue del modelo VLA (vision-language-action) Pi-0.5 de Physical Intelligence, adaptado para ejecutarse en una sola tarjeta Tenstorrent Blackhole p150a. No se trata de un modelo nuevo entrenado desde cero, sino de un port optimizado del checkpoint `lerobot/pi05_base` que empaqueta los pesos y los kernels necesarios para inferencia de control robótico sobre hardware Tenstorrent, usando la pila `ttnn`/`tt-metal`. El autor del paquete es changh95, y el trabajo se apoya en el código upstream de Physical Intelligence (openpi) y en el paper arXiv:2504.16054.

El modelo subyacente combina un backbone de visión SigLIP, un modelo de lenguaje Gemma-2B para el prefill del contexto y un "action expert" que genera acciones mediante flow matching. La innovación del paquete es la fusión de operaciones en megakernels: visión y proyector, prefill del lenguaje y experto de acciones se ejecutan como programas de dispositivo agrupados, lo que reduce el overhead de despacho y permite latencias de decenas de milisegundos. Con la configuración por defecto (2 cámaras, chunk de 50 acciones, 10 pasos de flow matching) la inferencia tarda 55,2 ms en perfil no escalable y 56,5 ms en perfil escalable.

Es relevante ahora porque demuestra que modelos VLA de tamaño medio pueden servirse en aceleradores no-GPU con latencias compatibles con control robótico en bucle cerrado. El paquete expone un servidor HTTP con contrato de petición definido, perfiles de servicio y presets de configuración, lo que facilita su evaluación en entornos de investigación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: SigLIP (visión) + Gemma-2B (prefill de lenguaje) + action expert con flow matching |
| Parametros totales | no disponible (repo de 24,4 GB; incluye pesos y artefactos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | prompt bucket de 32/64/128/224 tokens (PaliGemma token ids, máximo 224 tokens reales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (pesos descargados desde `lerobot/pi05_base`; el paquete usa tt-model-manager, manifest schema 5.1) |

## Arquitectura y entrenamiento

La arquitectura es un VLA compuesto por tres bloques que se ejecutan como programas de dispositivo fusionados. El bloque VISION agrupa SigLIP y el proyector, con un programa por cada grupo de dos cámaras. El bloque PREFIX ejecuta el embedding de lenguaje y el prefill de Gemma-2B, escribiendo las cachés KV. El bloque EXPERT ejecuta el action expert (N pasos × 18 capas) con condicionamiento temporal adaRMS, las proyecciones de entrada y salida de acciones y los pasos de Euler del flow matching. La generación de acciones es determinista por defecto, con semilla opcional para el ruido inicial del flow matching.

El paquete no entrena el modelo: parte del checkpoint `lerobot/pi05_base` y lo porta a Tenstorrent. La optimización principal es la fusión de operaciones principales en un único `ttnn.generic_op` por grupo, siguiendo el principio de megakernel. Se ofrecen dos perfiles de servicio: `non-scalable` (por defecto), en el que los núcleos Ethernet hacen el despacho y los programas de visión y prefijo disponen de una rejilla de trabajadores de 12 × 10, impidiendo unirse a una fabric multi-chip; y `scalable`, en el que el despacho lo hacen núcleos Tensix con rejilla de 11 × 10 y los Ethernet quedan libres para multi-chip. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Control robótico por imitación: genera chunks de acciones (1 a 64 acciones) a partir de imágenes de cámara, prompt de tarea y estado proprioceptivo opcional.
- Entrada multimodal de visión: soporta 1, 2, 3 o 4 cámaras, en orden `[base/exterior, wrist, ...]`.
- Condicionamiento por lenguaje natural: prompt de tarea en texto o tokens PaliGemma (hasta 224 tokens reales).
- Estado proprioceptivo: hasta 32 floats normalizados en el rango [-1, 1]; por defecto ceros.
- Flow matching configurable: de 1 a 16 pasos de denoising (N).
- Servidor HTTP con endpoints `/predict`, `/health` e `/info`; `/info` expone configuración, digest del kernel y número de programas de dispositivo por llamada.
- Presets de configuración: 32 combinaciones (cámaras 1-4, prompt bucket 32/64/128/224, action-row bucket 32/64).
- Salida determinista por defecto mediante ruido inicial fijo, con semilla opcional.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni audio.

## Casos de uso

- Manipulación robótica en bucle cerrado: el servidor responde en torno a 49-56 ms por llamada, lo que permite control reactivo con políticas VLA en un brazo robótico real con cámaras base y de muñeca.
- Evaluación en simulación tipo LIBERO: el autor demuestra 99/100 de éxito en LIBERO-Spatial con MuJoCo usando los pesos fine-tuned `lerobot/pi05_libero`, lo que sirve como banco de pruebas antes de desplegar en hardware.
- Investigación en aceleradores no-GPU: permite estudiar el rendimiento de VLA sobre Tenstorrent Blackhole p150a y comparar perfiles `non-scalable` y `scalable` con la misma política.
- Prototipado de tareas pick-and-place: con prompt de texto como "pick up the cube" y estado proprioceptivo, se puede integrar en pipelines de recogida y colocación con chunk de 50 acciones.
- Servicio multi-cámara en laboratorio: configuraciones de 1 a 4 cámaras permiten adaptar el servidor a montajes con vistas exterior, muñeca y cámaras adicionales sin reentrenar.
- Despliegue en fabric multi-chip: el perfil `scalable` libera los núcleos Ethernet para integrar la p150a en una fabric de varios chips, útil para escalar a políticas más grandes o a múltiples instancias.
- Integración en stacks de robótica existentes: el contrato HTTP con base64 de imágenes y JSON de estado facilita conectarlo a clientes ROS 2 o scripts de control propios.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de exito LIBERO-Spatial | 99/100 | Perfil `non-scalable`, N = 10, pesos `lerobot/pi05_libero`, MuJoCo |
| Latencia mediana de politica | 49,3 ms | Servidor p150a, p10 49,1 ms, p90 49,8 ms, 85 llamadas |
| Tiempo de inferencia por defecto | 55,2 ms | 2 cámaras, chunk 50, 10 pasos, prompt 142 tokens, perfil `non-scalable` |
| Tiempo de inferencia perfil escalable | 56,5 ms | Misma configuración, perfil `scalable` |

No se han publicado resultados de benchmarks del checkpoint base `lerobot/pi05_base` en la información disponible; los datos anteriores corresponden al fine-tuned LIBERO y a mediciones de latencia del port.

## Requisitos de hardware

- Acelerador: una tarjeta Tenstorrent Blackhole p150a (mesh `P150`); no se soportan GPUs convencionales con este paquete.
- VRAM: no aplica; la memoria es la del dispositivo Blackhole, no disponible en la información proporcionada.
- GPU recomendadas: no aplica (el paquete es específico de Tenstorrent).
- ¿Cabe en GPU consumer? No con este paquete; requeriría el stack original de openpi sobre GPU, cuyos requisitos no se detallan aquí.
- Despliegue: `tt-model pull changh95/pi05-base-p150 --with-weights` y `tt-model serve changh95/pi05-base-p150`; también `tt serve` con `tt-cli`. Puerto por defecto 20000, con fallback al siguiente libre.
- Perfiles: `non-scalable` (por defecto, despacho por Ethernet, rejilla 12 × 10) y `scalable` (despacho por Tensix, rejilla 11 × 10, Ethernet libres para multi-chip).
- Latencias: 49,3 ms mediana en servidor; 55,2-56,5 ms de inferencia por defecto según perfil.
- Throughput: no disponible (batch fijo a 1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-base-p150 (este paquete) | no disponible (Gemma-2B en el prefijo) | prompt bucket 32-224 tokens | 99/100 LIBERO-Spatial; 49,3 ms mediana | gemma | Tenstorrent Blackhole p150a |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (checkpoint base) |
| lerobot/pi05_libero | no disponible | no disponible | 99/100 LIBERO-Spatial (demo del autor) | no disponible | Hugging Face (fine-tune LIBERO) |
| openpi (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | GitHub (código upstream) |

No se dispone de datos de benchmarks comparables de otros VLA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El paquete está atado al hardware Tenstorrent Blackhole p150a; no es portable a GPU sin recurrir al stack original de openpi.
- Batch fijo a 1: no hay soporte documentado para inferencia por lotes, lo que limita el throughput en servidores compartidos.
- El prompt bucket máximo es de 224 tokens reales; tareas con instrucciones largas no caben.
- El estado proprioceptivo se limita a 32 floats normalizados en [-1, 1]; valores fuera de rango o dimensiones distintas requieren adaptación en el cliente.
- El servidor rechaza cámaras enmascaradas y un número incorrecto de imágenes; hay que arrancar una instancia por configuración de cámaras.
- La configuración (cámaras, horizonte de acciones, pasos de denoising) queda fijada al arrancar el servidor; solo el prompt bucket puede cambiarse por petición.
- La demo con 99/100 usa pesos distintos (`lerobot/pi05_libero`) de los que apunta el repositorio (`lerobot/pi05_base`); es necesario sustituir los pesos para reproducirla.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de producción.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática del modelo base en la información disponible.
- El perfil `non-scalable` impide unir el chip a una fabric multi-chip; para escalar hay que usar el perfil `scalable`.

## Enlaces

- Hugging Face: https://huggingface.co/changh95/pi05-base-p150
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper: https://arxiv.org/abs/2504.16054
- Código upstream: https://github.com/Physical-Intelligence/openpi
- Port del autor: https://github.com/changh95/tt-pi-0.5
- Gestor de modelos Tenstorrent: https://github.com/tenstorrent/tt-model-manager
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Demo (vídeo): https://huggingface.co/changh95/pi05-base-p150/resolve/main/demo/pi05_libero_spatial.mp4
