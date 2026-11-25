# faceninjahq/diy-tesla-fsd-reality-view

## Resumen

DIY Tesla FSD Reality View es un proyecto de investigación independiente que recrea, a escala de fin de semana, el tipo de reconstrucción 3D aumentada que Tesla muestra en su sistema FSD. No es un modelo de lenguaje ni un sistema de conducción: es un conjunto de pesos que combina reconstrucción de escenas mediante gaussian splatting, un modelo de difusión de un solo paso para refinar las vistas renderizadas (fine-tune de `nvidia/difix_ref`, a su vez basado en SD-Turbo) y un pequeño UNet neuronal de 2 millones de parámetros destilado del anterior para inferencia en tiempo real.

El autor, faceninjahq, lo publica como experimento personal y deja claro que no tiene relación con Tesla. El repositorio ocupa 1,8 GB e incluye el fixer de difusión fine-tuneado (`difix_ft.pt`, 1,7 GB, UNet de 865 millones de parámetros), el fixer neuronal rápido (`nf.pt`, 12 MB, 2 ms por fotograma a 768x432 en fp16) y mallas de vehículos para el servidor de demostración en vivo.

Su relevancia es acotada pero interesante: demuestra un pipeline completo de novel-view synthesis sobre datos reales de conducción (Argoverse 2) con métricas honestas publicadas (PSNR 11,40 → 14,48 dB y LPIPS 0,622 → 0,530 en una secuencia de validación en Washington DC) y una licencia estrictamente de investigación. Es material de referencia para quien trabaje en reconstrucción de escenas, refinamiento difusivo de renders o evaluación de splatting en entornos urbanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion de 1 paso (base SD-Turbo, fine-tune de `nvidia/difix_ref`) + UNet neuronal destilado de 2M parametros + gaussian splatting para la escena |
| Parametros totales | 865M en `difix_ft.pt`; 2M en `nf.pt` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el fixer neuronal se ejecuta en fp16 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | NVIDIA License + Stability AI Community License; solo investigacion y evaluacion, no comercial |
| Formato de pesos | PyTorch (`.pt`), mallas en `.npz`, etiquetas en JSON |

## Arquitectura y entrenamiento

El pipeline tiene tres piezas. La primera es la reconstruccion de la escena a partir de un log multicamara calibrado de Argoverse 2, renderizada como mapa 3D. La segunda es `difix_ft.pt`: un UNet de difusion de un solo paso derivado de `nvidia/difix_ref` (que a su vez parte de SD-Turbo), en el que se han fine-tuneado el UNet y las convoluciones skip del decodificador VAE para refinar vistas de calle renderizadas. El fine-tune uso perdida L2 + LPIPS, AdamW con lr 1e-5, 3000 pasos, batch 4 y bf16, sobre tripletas (render, foto real, foto frontal) generadas dejando camaras fuera del mapa 3D y renderizando sus vistas.

La tercera pieza es `nf.pt`, un UNet de 2 millones de parametros destilado de `difix_ft.pt` sobre 2000 secuencias renderizadas de 3 fotogramas durante 6000 pasos. Su funcion es sustituir al difusion en el servidor en vivo: corre a 2 ms por fotograma a 768x432 en fp16, con un blend temporal por fotograma para evitar que derive hacia rayas o manchas oscuras cuando se realimenta de su propia salida. El servidor completo alcanza 30 fps estables en una RTX PRO 6000 con el fixer activo y unos 10 ms de margen.

## Capacidades

- Refinamiento difusivo de vistas renderizadas de escenas de conduccion (correccion de artefactos del splatting contra fotos reales).
- Reconstruccion y reproduccion de secuencias de conduccion grabadas a partir de logs multicamara calibrados.
- Novel-view synthesis: renderizado de vistas de camaras que se han dejado fuera del mapa durante el entrenamiento.
- Servidor de demostracion 3D en vivo con mallas de vehiculos (7 plantillas de trafico y una malla de coche ego).
- Inferencia en tiempo real mediante el fixer neuronal destilado (30 fps en GPU de gama profesional).
- Etiquetado de candidatos de vehiculos con un modelo de vision para la secuencia de Pittsburgh (etiquetas opcionales incluidas).
- No soporta tool calling, agentes, texto, vision general ni razonamiento: su dominio es exclusivamente la sintesis y el refinamiento de vistas.

## Casos de uso

- Investigacion en novel-view synthesis: evaluar como un fixer difusivo de un paso mejora renders de splatting sobre datos reales de Argoverse 2, usando las metricas PSNR y LPIPS publicadas como linea base reproducible.
- Refinamiento de mapas 3D renderizados: aplicar `difix_ft.pt` a fotogramas generados por un pipeline propio de reconstruccion para reducir artefactos antes de una inspeccion visual o de un dataset sintetico.
- Prototipado de visualizacion automotriz: montar un servidor de demo tipo "reality view" con las mallas incluidas y el fixer neuronal para presentaciones o pruebas de concepto internas.
- Destilacion de modelos de refinamiento: usar `nf.pt` y el procedimiento descrito (2000 secuencias, 6000 pasos) como referencia para llevar un modelo de difusion pesado a latencias de milisegundos en produccion de video.
- Evaluacion de heuristicas de escena: estudiar los fallos documentados (clasificacion aparcado/en movimiento, tipos de vehiculo por tamano) como caso de analisis de errores en pipelines de reconstruccion.
- Benchmarking de hardware grafico: medir throughput de un pipeline completo de render + refinamiento a 30 fps y comparar GPUs profesionales con la configuracion de referencia.

## Benchmarks y rendimiento

| Metrica | `difix_ref` | `difix_ft.pt` (fine-tune) |
|---|---|---|
| PSNR (dB) en `0b5142c1` (Washington DC, held-out) | 11,40 | 14,48 |
| LPIPS en `0b5142c1` (held-out) | 0,622 | 0,530 |
| PSNR en fotos held-out de mapas entrenados | no disponible | 22,5–23,3 dB |
| Throughput del servidor en vivo (RTX PRO 6000) | no disponible | 30 fps con fixer, ~10 ms de margen |
| Latencia de `nf.pt` a 768x432 fp16 | no disponible | 2 ms por fotograma |

## Requisitos de hardware

- VRAM estimada: no publicada de forma explicita; `difix_ft.pt` son 1,7 GB de pesos en el UNet de 865M parametros, por lo que la inferencia en fp16 requiere varios GB de VRAM adicionales para activaciones, no cuantificados en la informacion disponible.
- GPU recomendadas: el autor solo ha probado una RTX PRO 6000; no hay datos de otras GPU.
- Cabe en GPU de consumo: no confirmado; el fixer neuronal de 12 MB es viable en cualquier GPU moderna, pero el pipeline completo (splatting + difusion) no esta validado en tarjetas de consumo.
- Opciones de despliegue: scripts propios del repositorio de codigo (`fix.py`, `rt/server.py`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 30 fps estables en la RTX PRO 6000 con el fixer activo; el tiempo extremo a extremo no se ha medido y el entrenamiento de mapas y los fine-tunes no son deterministas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DIY Tesla FSD Reality View | 865M (`difix_ft.pt`) + 2M (`nf.pt`) | Refinamiento difusivo de vistas renderizadas de conduccion | no aplica | NVIDIA + Stability AI, solo investigacion | Hugging Face, repo de 1,8 GB |
| `nvidia/difix_ref` | no disponible | Refinamiento difusivo de renders (modelo base) | no aplica | NVIDIA License | Hugging Face |
| SD-Turbo | no disponible | Difusion texto-a-imagen de un paso | no aplica | Stability AI Community License | Hugging Face |

No se dispone de datos de benchmarks de `nvidia/difix_ref` ni de SD-Turbo en la informacion proporcionada para establecer una comparacion cuantitativa mas alla de la mejora medida por el autor sobre su propio modelo base.

## Limitaciones y advertencias

- No es un sistema de conduccion: no interpreta senales, marcas viales ni el comportamiento de otros usuarios de la via; solo reconstruye y reproduce lo grabado.
- No hay un modelo de difusion entrenado sobre multiples formas de vehiculo: los coches se dibujan con 7 plantillas fijas elegidas por tamano, y personas y bicicletas quedan como puntos crudos.
- Funciona unicamente con grabaciones multicamara calibradas (logs de Argoverse 2 de unos 16 s); con un video de salpicadero simple la calidad es aproximada por odometria visual.
- Los objetos a mas de 3 m de altura y a menos de 3 m de la trayectoria se eliminan, de modo que faltan semaforos y senales en el mapa.
- La distincion entre coche aparcado y en movimiento es heuristica y comete errores; en la comprobacion de Pittsburgh el tipo "pickup" casi siempre fue incorrecto.
- El fixer neuronal deriva hacia rayas o manchas oscuras en rollouts largos; se mitiga con un blend temporal que suaviza el resultado respecto a Difix.
- Calidad de imagen limitada: 22,5–23,3 dB PSNR en fotos held-out de mapas entrenados y 14,48 dB tras el fine-tune difusivo en una secuencia held-out.
- Solo probado en una RTX PRO 6000; sin medicion de tiempo extremo a extremo y con entrenamientos no deterministas.
- Licencia restrictiva: NVIDIA License y Stability AI Community License limitan el uso a investigacion o evaluacion, sin uso comercial.
- La malla del coche ego es un modelo de terceros ("2024 Model 3", atribuido a RBLXSupercars) con procedencia y licencia no verificadas; el autor lo advierte en el fichero NOTICE.
- Los datos de Argoverse 2 estan bajo CC BY-NC-SA 4.0: atribucion, uso no comercial y compartir igual.
- Las etiquetas de vehiculos solo existen para la secuencia de Pittsburgh.
- Riesgo de alucinacion visual: el difusion puede generar detalles plausibles pero inexistentes al refinar vistas sin referencia real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faceninjahq/diy-tesla-fsd-reality-view
- Pagina del laboratorio (metodo, write-up y demo 3D en vivo): https://faceninja.net/lab/diy-tesla-fsd-reality-view/
- Codigo en GitHub: https://github.com/faceninjahq/diy-tesla-fsd-reality-view
- Video en YouTube: https://youtu.be/xrI0tEDHsHM
- Modelo base `nvidia/difix_ref`: https://huggingface.co/nvidia/difix_ref
- Licencia NVIDIA del modelo base: https://huggingface.co/faceninjahq/diy-tesla-fsd-reality-view/blob/main/LICENSE-NVIDIA-difix_ref.txt
- Guia de descarga de Argoverse 2: https://argoverse.github.io/user-guide/getting_started.html
- Terminos de uso de Argoverse 2: https://argoverse.github.io/user-guide/terms_and_conditions.html
