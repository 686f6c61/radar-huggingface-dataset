# cagataydev/agi-wfm-so101-ttt

## Resumen

agi-wfm/so101-ttt es un modelo de politica robotica (action policy) construido sobre NVIDIA Cosmos3-Edge (4B) y ajustado por el autor cagataydev para una tarea muy concreta: jugar al tres en raya con un brazo robotico SO-101. Recibe dos fotogramas de camara (vista frontal y de muneca) a 256 x 256, el estado articular y una cadena de tarea, y devuelve 32 acciones de 6 dimensiones a 15 Hz. Es, por tanto, un modelo de mundo orientado a control motor, no un LLM de proposito general.

El modelo parte de Cosmos3-Edge y se post-entrena con 190 episodios reales de teleoperacion y 2.200 episodios renderizados en MuJoCo, con un regimen de SFT sobre la politica de acciones. La relevancia actual esta en el ecosistema: se integra con LeRobot y Diffusers, se sirve mediante la API de agi.diy y demuestra un flujo completo de sim-a-real para un brazo de bajo coste.

El checkpoint publicado declara un 65,0 % de exito en simulacion renderizada (n=180) y un 94,4 % de colocaciones correctas cuando la pieza ya esta agarrada. El propio autor advierte que el brazo real aun no se ha medido en condiciones de iluminacion utilizables y que el agarre es el cuello de botella de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Edge (modelo de mundo / politica de acciones) sobre pipeline Diffusers `Cosmos3OmniPipeline`; configuracion LeRobot tipo `cosmos_wfm` |
| Parametros totales | 4B (heredados de Cosmos3-Edge) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; entrada de 2 frames 256x256 + estado + cadena de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (las cadenas de tarea estan en ingles) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | safetensors (repo de 9,1 GB con `pipeline/` y `MANIFEST.json` con sha256) |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento de NVIDIA Cosmos3-Edge (4B) como politica de acciones. La entrada combina las imagenes de las camaras `front` y `wrist` a 256 x 256, el estado articular y una cadena de tarea; la salida es un chunk de 32 x 6 acciones a 15 Hz, que debe ejecutarse entero y en orden. La inferencia usa 4 pasos UniPC con semilla 0, de modo que la misma observacion produce el mismo chunk (determinismo reproducible).

El entrenamiento consistio en SFT de la politica de acciones sobre una sola GPU H200: 3.000 iteraciones con mezcla 50/50 por ventanas de datos reales y simulados, learning rate 5e-5 y caption dropout de 0,1, seguidas de 1.000 iteraciones adicionales con caption dropout de 0. Los datos son 190 episodios reales de teleoperacion (210 en el dataset original a 30 fps) y 2.200 episodios expertos renderizados con domain randomisation. El autor documenta que la profundidad de entrenamiento fue la palanca clave: 1,5k, 3k y 4k iteraciones llevaron el exito de 3/60 a 39 % y luego a 65 %. Los datasets `sim-v2` y `sim2real-cosmos3` no estan incluidos en este checkpoint.

## Capacidades

- Generacion de acciones motoras: 32 acciones de 6 dimensiones por llamada a 15 Hz, pensadas para ejecutarse como chunk completo.
- Percepcion visual multi-camara: procesa simultaneamente vista frontal y de muneca a 256 x 256.
- Condicionamiento por lenguaje: 20 cadenas de tarea del tipo `pick up the {x|o} piece` y `pick up the {x|o} piece and place it on the {top|middle|bottom} {left|center|right} cell`.
- Control de brazo SO-101 en unidades normalizadas (o grados si se configura `use_degrees=true`).
- Determinismo de inferencia con semilla fija y 4 pasos UniPC.
- Servicio remoto: disponible como endpoint en api.agi.diy con coste declarado de 0,0032 USD por llamada (32 acciones, 2,13 s de movimiento).
- No dispone de tool calling, razonamiento multi-paso simbolico, vision general, audio ni capacidades multilingues en el sentido de un LLM.

## Casos de uso

- Demostracion de tres en raya robotico: el modelo elige y ejecuta la colocacion de piezas en un tablero de 3x3 con un brazo SO-101; es su proposito literal y el escenario para el que se publicaron las metricas.
- Banco de pruebas de sim-a-real: permite evaluar tecnicas de domain randomisation y de re-renderizado (Cosmos3-Nano-Sim-Transfer) comparando el rendimiento en simulacion con el traslado al brazo fisico.
- Integracion en pipelines LeRobot: al ser una politica `cosmos_wfm` con configuracion LeRobot, se puede desplegar con `agi rollout` y sustituir por otras politicas en el mismo banco de evaluacion.
- Prototipado de agentes fisicos de bajo coste: el SO-101 es un brazo economico, y este checkpoint sirve como referencia de lo que se puede lograr con 190 episodios reales mas simulacion masiva.
- Evaluacion de robustez ante iluminacion: el fallo documentado del 0/12 con la camara superior saturada al 84 % por sol convierte al modelo en un caso de estudio para pruebas de iluminacion controlada.
- Servicio de inferencia remota: mediante api.agi.diy/play se puede probar el modelo desde navegador sin hardware, util para demos y validacion de integracion de API.
- Investigacion en chunking de acciones: el requisito de ejecutar los 32 pasos en orden y sin interrupcion permite estudiar el efecto del tamano de chunk en tareas de pick-and-place.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card y en el model-index (no verificados de forma independiente):

| Metrica | Resultado | Contexto |
|---|---|---|
| Exito en simulacion (n=180) | 117/180 = 65,0 % (IC 95 %: 57,8-71,6) | Tablero MuJoCo renderizado, 20 cadenas x 9 episodios aleatorizados, juez `ttt-sim-judge-v1`, tope 20 s |
| Colocacion en la celda nombrada | 101/107 = 94,4 % | Solo episodios en los que la pieza ya estaba agarrada |
| Experto scriptado (techo) | 175/180 = 97,2 % | Referencia superior |
| Mantener ultima accion (suelo) | 0/180 | Referencia inferior |
| Navegador `/play`, secuencial | 35/54 = 64,8 % | Evaluacion interactiva |
| RMSE de chunk en frames reales reservados | 13,71 | Episodios reales no vistos |
| Brazo real | no medido | 12 intentos el 2026-10-28 con la camara superior saturada al 84 %: 0/12; es una prueba de iluminacion, no del modelo |
| Despliegue servido (api.agi.diy) | 144/180 = 80,0 % (IC 95 %: 73,4-85,6), RMSE 13,60 | Checkpoint de ronda 2 `runs/20261028T120944Z-train-mix-dagger3-x45`, que reemplazara a estos pesos |

Desglose por pieza: la pieza x es el lado debil, con 46,7 % de exito frente al 83,3 % de la pieza o.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo pesa 9,1 GB y el modelo base es de 4B, por lo que la inferencia en precision completa requiere del orden de 10-16 GB y menos con cuantizacion (no se documentan cuantizaciones).
- GPU de entrenamiento documentada: una NVIDIA H200 para el SFT (3.000 + 1.000 iteraciones).
- GPU recomendadas para inferencia: no disponible; por tamano, cabria en A100, H100, L40S y, presumiblemente, en RTX 4090 con cuantizacion, aunque el autor no lo confirma.
- Cabe en GPU de consumo: no confirmado; el pipeline Diffusers de 9 GB sugiere que una RTX 4090 de 24 GB podria alojarlo, pero no hay dato publicado.
- Opciones de despliegue: `agi` CLI (comandos `agi run` y `agi rollout` con `--dry-run`), LeRobot, Diffusers (`Cosmos3OmniPipeline`) y el servicio remoto api.agi.diy. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,13 s de movimiento por llamada de 32 acciones a 15 Hz; coste declarado de 0,0032 USD por llamada en el servicio remoto. No se publica throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agi-wfm/so101-ttt | 4B | Politica de acciones (Cosmos3-Edge) | 2 frames 256x256 + estado + tarea; salida 32x6 acciones | OpenMDW-1.1 | HuggingFace, LeRobot, API agi.diy |
| nvidia/Cosmos3-Edge | 4B | Modelo de mundo base | no disponible | no disponible en la informacion | HuggingFace (modelo base) |
| Politicas LeRobot genericas (p. ej. ACT, Diffusion Policy) | no disponible | Politica de acciones | Depende de la configuracion | no disponible | LeRobot |
| Modelos de mundo de gran escala (familia Cosmos) | no disponible | Modelo de mundo | no disponible | no disponible | NVIDIA |

No se dispone de datos de rendimiento comparables de las alternativas en la informacion proporcionada; la comparacion se limita a categoria, base y licencia.

## Limitaciones y advertencias

- Las metricas son exclusivamente de simulacion renderizada; el brazo real no se ha medido en condiciones de iluminacion utilizables.
- El agarre es el punto de fallo: una vez sujetada la pieza, la colocacion acierta en el 94,4 % de los casos, pero el exito global cae al 65 %.
- La pieza x rinde claramente peor que la o (46,7 % frente a 83,3 %), lo que indica un desequilibrio en los datos o en la politica.
- La tarea de limpieza (devolver la pieza a su monton) no esta incluida y el primer intento obtuvo 0/90.
- Sensibilidad a la iluminacion: la camara superior saturada por sol provoco 0/12 en el unico intento real documentado.
- Requiere ejecutar los chunks completos y en orden; interrumpir o reordenar acciones invalida las metricas publicadas.
- Dominio muy estrecho: 20 cadenas de tarea y un unico tipo de brazo (SO-101); no es un modelo generalista ni un LLM.
- Licencia OpenMDW-1.1: conviene revisar sus terminos antes de uso comercial, ya que la model card la marca como `license: other`.
- Los pesos de este repo seran reemplazados por el checkpoint de ronda 2 (80,0 % en simulacion), por lo que las metricas de 65 % estan ya desactualizadas respecto al servicio.
- Riesgo de alucinacion en el sentido de acciones fisicas incorrectas: el modelo puede generar trayectorias plausibles pero fallidas, sin senal de incertidumbre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cagataydev/agi-wfm-so101-ttt
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Demo interactiva: https://api.agi.diy/play
- Panel de claves API: https://api.agi.diy/dashboard
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset real: https://huggingface.co/datasets/cagataydev/so101-tic-tac-toe
- Dataset real normalizado: https://huggingface.co/datasets/cagataydev/so101-tic-tac-toe-norm
- Dataset simulado: https://huggingface.co/datasets/cagataydev/so101-tic-tac-toe-sim
- Dataset simulado v2: https://huggingface.co/datasets/cagataydev/so101-tic-tac-toe-sim-v2
- Dataset sim-a-real: https://huggingface.co/datasets/cagataydev/so101-ttt-sim2real-cosmos3
- Controles sim-a-real: https://huggingface.co/datasets/cagataydev/so101-ttt-sim2real-controls
- RGB crudo de simulacion: https://huggingface.co/datasets/cagataydev/so101-ttt-sim2real-sim-rgb
