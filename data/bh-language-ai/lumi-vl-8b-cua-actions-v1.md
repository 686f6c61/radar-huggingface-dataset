# BH-Language-AI/lumi-vl-8b-cua-actions-v1

## Resumen

LUMI-VL-8B-CUA-actions-v1 es un adaptador LoRA experimental publicado por BH-Language-AI sobre el modelo base Qwen/Qwen3.5-9B. Se trata de la continuacion del modelo de grounding publicado previamente como lumi-vl-8b-cua (Stage-2), al que se le anaden acciones ampliadas para agentes de uso de ordenador (computer-use agents, CUA): `tap`, `click` con boton, `type` y `scroll`. El modelo resuelve el problema de traducir instrucciones en lenguaje natural sobre una captura de pantalla a acciones estructuradas en JSON con coordenadas normalizadas.

El adaptador se inicializo a partir del adaptador Stage-2 y se entreno el 24 de noviembre de 2026 en LUMI-G (8x MI250X) con LoRA de rango 64, learning rate 2e-6, 200 pasos y 2 MP, sobre un conjunto propio de 4.165 capturas de pantalla con aumento de datos. El resultado es un modelo que mantiene el rendimiento de grounding del Stage-2 (66,10 % en ScreenSpot-Pro frente a 67,28 % del baseline, una diferencia inferior a un error estandar) y anade una accion de `scroll` que funciona de forma fiable en la evaluacion propia.

La relevancia actual del modelo radica en su enfoque de acciones estructuradas para agentes GUI, un area donde los modelos generalistas suelen fallar al emitir JSON valido o al elegir la accion correcta. Aqui la validez de JSON es del 100 % en las pruebas realizadas, aunque el autor reconoce limitaciones claras en las acciones minoritarias (`type` y clic derecho) por falta de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre transformer Qwen3.5-9B, vision-language |
| Parametros totales | no disponible (adaptador LoRA de 0,5 GB; el modelo base Qwen3.5-9B no detalla parametros en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bs (bosnio), hr (croata), sr (serbio), en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 sobre el modelo vision-language Qwen3.5-9B, inicializado desde el adaptador Stage-2 del mismo autor. El entrenamiento se realizo en LUMI-G con 8 aceleradores MI250X, con un learning rate de 2e-6, 200 pasos y resolucion de 2 MP. El conjunto de datos son capturas de pantalla propias (4.165 pantallas) con aumento de datos, distribuidas por accion: 3.639 muestras de `tap`, 623 de `click`, 355 de `scroll` y 76 de `type`.

La innovacion principal es la extension del espacio de acciones del modelo de grounding a un conjunto de cuatro herramientas con salida JSON estricta. El prompt de acciones especifica el esquema exacto de cada herramienta, incluyendo coordenadas normalizadas en el rango 0-1000. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Grounding visual: localizacion de elementos de interfaz en capturas de pantalla y devolucion de coordenadas normalizadas en JSON.
- Accion `tap`: emision de `{"tool":"tap","args":{"x":...,"y":...}}`.
- Accion `click`: emision de `{"tool":"click","args":{"x":...,"y":...,"button":"left"}}`, aunque el campo `button` no se emite correctamente segun el autor.
- Accion `scroll`: emision de `{"tool":"scroll","args":{"direction":"down"}}`, con fiabilidad del 100 % en la evaluacion propia (14/14).
- Accion `type`: emision de `{"tool":"type","args":{"text":"..."}}`, con rendimiento del 0 % en las pruebas.
- Salida JSON valida en el 100 % de los casos medidos.
- Soporte multilingue limitado a bosnio, croata, serbio e ingles.
- No se documenta soporte de tool calling generico, agentes multi-paso ni modo thinking en la informacion disponible (aunque las pruebas de ScreenSpot-Pro del Stage-2 se hicieron con thinking ON).

## Casos de uso

- Automatizacion de tareas de escritorio: el modelo puede recibir una captura de pantalla y una instruccion para localizar un boton o campo y devolver las coordenadas de `tap`, lo que permite a un agente ejecutar clics en aplicaciones nativas o web.
- Navegacion de formularios: con la accion `scroll` fiable al 100 %, el modelo puede desplazar vistas largas para localizar campos fuera de pantalla antes de emitir un `tap`.
- Testing de interfaces: integrado en pipelines de QA, el modelo puede verificar que los elementos de una UI son localizables y devolver coordenadas estables para pruebas automatizadas de regresion visual.
- Agentes de asistencia en entornos corporativos de habla bosnia, croata o serbia: el soporte de estos idiomas permite instrucciones nativas en despliegues regionales.
- Prototipado de asistentes de accesibilidad: el modelo puede traducir ordenes verbales o escritas a acciones de clic sobre elementos visibles, como base para herramientas de control por voz.
- Investigacion en computer-use agents: sirve como punto de partida (adaptador LoRA ligero de 0,5 GB) para experimentar con esquemas de acciones JSON y evaluar el equilibrio entre grounding y accion.
- Seleccion de acciones en menus: la accion `click` con posicion funciona correctamente, aunque el campo `button` no se emita, por lo que es util para clics primarios en menus y listas.

## Benchmarks y rendimiento

| Test | Baseline (Stage-2) | actions-v1 | Delta |
|---|---|---|---|
| ScreenSpot-Pro (593 de 4.743, 26 apps) | 67,28 % | 66,10 % | -1,18 pp (< 1 SE) |
| JSON valido | 100 % | 100 % | = |
| `scroll` (eval propia) | no disponible | 100 % (14/14) | nuevo |
| `tap` bajo prompt de acciones | no disponible | 16,7 % como `tap` (resto `click`, equivalente semantico) | no disponible |
| `click` (posicion) | no disponible | posicion correcta, `button` no emitido | debil |
| `type` | no disponible | 0 % | debil |

El autor indica que el ScreenSpot-Pro completo del Stage-2 publicado alcanza el 67,05 % (4.743 elementos, thinking ON).

## Requisitos de hardware

- El adaptador LoRA ocupa 0,5 GB en safetensors y requiere cargar el modelo base Qwen3.5-9B para inferencia.
- VRAM estimada: no disponible en la informacion proporcionada; depende del modelo base y de la cuantizacion elegida.
- GPU recomendadas: el entrenamiento se realizo en 8x AMD MI250X (LUMI-G); para inferencia no se especifican GPU concretas.
- No se confirma si cabe en GPU de consumo; al ser un modelo de 9B con vision, es probable que requiera cuantizacion para GPUs de 24 GB, pero este dato no esta disponible.
- Opciones de despliegue: la libreria indicada es PEFT; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lumi-vl-8b-cua-actions-v1 | LoRA sobre Qwen3.5-9B | no disponible | 66,10 % (593 items) | Apache-2.0 | Hugging Face |
| lumi-vl-8b-cua (Stage-2) | LoRA sobre Qwen3.5-9B | no disponible | 67,28 % (593 items) / 67,05 % (4.743) | Apache-2.0 | Hugging Face |
| Otros modelos CUA de grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las acciones estan limitadas por los datos: `type` (76 muestras) y clic derecho (86 muestras) son demasiado escasos frente a 3.639 muestras de `tap`, por lo que el modelo tiende a elegir `click` o `tap` en lugar de `type`.
- La accion `type` obtiene un 0 % en la evaluacion propia; no es fiable para produccion.
- La accion `click` localiza la posicion correctamente pero no emite el campo `button`, lo que limita su uso para clics no primarios.
- El grounding baja 1,18 pp respecto al Stage-2; el autor recomienda usar el prompt de grounding del Stage-2 para tareas de localizacion y reservar el prompt de acciones para cuando se necesiten acciones.
- El modelo es experimental y fue publicado el mismo dia de su entrenamiento; no hay historial de uso ni descargas.
- El soporte de idiomas se limita a bosnio, croata, serbio e ingles; no se documenta castellano.
- Riesgo de alucinacion en la seleccion de accion cuando la instruccion es ambigua o el elemento no esta presente en la pantalla.
- La licencia Apache-2.0 permite uso comercial, pero al ser un adaptador experimental con acciones incompletas, no se recomienda su uso en produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-actions-v1
- Modelo Stage-2 previo: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
