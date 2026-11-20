# jhlee0619/unstick

## Resumen

Unstick es una coleccion de checkpoints de modelos del mundo (world models) basados en JEPA, afinados especificamente para resolver el problema de estancamiento (stalling) en tareas de empuje (pushing) con planificadores MPC. Desarrollado por Junhyeok Lee, Dongheon Lee y Kyu Sung Choi (Seoul National University), el trabajo se publica bajo el titulo *Stuck in Place: Stall Diagnosis and Remedies for JEPA Planners* (arXiv 2611.25415). El repositorio contiene pesos derivados de tres familias de modelos base: AdaJEPA, DINO-WM y Temporal Straightening.

El hallazgo central del trabajo es que entre el 96% de los fallos de un planificador base basado en descenso de gradiente (GD) son estancamientos: el objeto no se mueve, el modelo predice progreso y el planificador con warm start devuelve practicamente el mismo plan. Unstick rompe este punto fijo sin actualizar pesos en tiempo de test, mediante dos variantes: Unstick-Mem (memoria residual de errores de prediccion) y Unstick-ReInit (reinicializacion aleatoria del plan en cada replanificacion).

Los checkpoints cubren escenarios de cambio de forma (PushObj), cambio visual (PushT) y cambio de dinamica o layout en laberintos (MediumMaze, DiverseMaze). El repo ocupa 2,5 GB y los pesos son modulos PyTorch serializados con pickle, pensados para cargarse con el codigo del repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model JEPA (prediccion en espacio latente); base AdaJEPA, DINO-WM o Temporal Straightening segun checkpoint |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control/planificacion, no linguistico) |
| Licencia | MIT (pesos DINOv2 ViT-S/14 subyacentes bajo Apache 2.0) |
| Formato de pesos | PyTorch `.pth` serializado (pickle), con `hydra.yaml` y `NOTICE` por carpeta |

## Arquitectura y entrenamiento

Los checkpoints se construyen sobre world models JEPA que operan en espacio latente: codifican observaciones (frames o caracteristicas DINOv2 ViT-S/14) y predicen el coste latente de chunks de acciones, usados por un planificador MPC con descenso de gradiente. Las variantes DINO-WM y Temporal Straightening emplean el backbone visual DINOv2 ViT-S/14; AdaJEPA es la base principal para los escenarios de cambio de forma, visual y de dinamica.

El entrenamiento clave es un fine-tuning on-policy: antes del despliegue, el modelo se ajusta sobre las propias ejecuciones del planificador base en episodios separados, porque el planificador visita estados que los datos offline no cubren. Sobre esa base se anaden dos remedios sin actualizacion de pesos en test: Mem almacena los errores de prediccion a un paso sobre chunks ejecutados y los suma de vuelta a las predicciones cercanas (asi un chunk de quedarse quieto se predice como quedarse quieto); ReInit arranca cada replanificacion desde un plan aleatorio en lugar del warm start. La carpeta `diversemaze_layout_shift` se afino con `--norm-stats val`.

## Capacidades

- Planificacion en espacio latente para tareas de manipulacion robotica (empuje de objetos).
- Prediccion de coste latente de chunks de accion para planificadores MPC basados en gradiente.
- Diagnostico y mitigacion de estancamiento en planificadores JEPA (Mem y ReInit).
- Generalizacion a formas vistas y no vistas (PushObj: T, L, Z, cross, I, small T, square).
- Robustez a cambios visuales (PushT: blur, salt-and-pepper, oscurecimiento, recoloreado de agente, meta y bloque).
- Adaptacion a cambios de dinamica y de layout en entornos de laberinto (MediumMaze, DiverseMaze).
- No soporta tool calling, agentes conversacionales ni capacidades multilingues: es un modelo de control, no de lenguaje.

## Casos de uso

- Planificacion de empuje de objetos con formas no vistas: Unstick-Mem eleva la tasa de exito en PushObj de 53,3% a 78,7% en la forma T y de 23,3% a 36,0% en cuadrados, util para robots de manipulacion que deben generalizar a geometrias nuevas.
- Manipulacion robusta a degradacion visual: con desenfoque, ruido salt-and-pepper u oscurecimiento, Unstick-Mem mantiene 76,7%, 74,0% y 78,0% frente a 56,0%, 64,7% y 63,3% del base, adecuado para camaras de baja calidad o iluminacion variable.
- Navegacion en laberintos con dinamica cambiante: los checkpoints MediumMaze y DiverseMaze permiten planificar cuando la dinamica o el layout difieren del entrenamiento, sin reentrenar en produccion.
- Investigacion sobre fallos de planificadores: el analisis de estancamiento (101 estancamientos analizados, 98% de sobrevaloracion de quedarse quieto en T) sirve como banco de pruebas para diagnosticar planificadores MPC.
- Despliegue con pesos congelados: al no requerir actualizaciones de pesos en test, Unstick evita el coste computacional de AdaJEPA (84,7% en PushObj-T) y es apto para hardware con presupuesto de computo limitado.
- Evaluacion comparativa de world models: los checkpoints derivados de AdaJEPA, DINO-WM y Temporal Straightening permiten comparar arquitecturas JEPA bajo el mismo protocolo de remedios.

## Benchmarks y rendimiento

Exito (%) en PushObj, formas vistas y no vistas, planificador GD, media ± desviacion estandar sobre tres semillas de 50 episodios:

| Metodo | T | L | Z | cross | I | small T | square |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Base | 53,3 ± 6,8 | 50,7 ± 6,6 | 44,7 ± 5,0 | 52,0 ± 4,3 | 26,0 ± 5,7 | 42,7 ± 5,2 | 23,3 ± 3,4 |
| + Unstick-Mem | 78,7 ± 5,7 | 82,0 ± 4,3 | 78,7 ± 3,8 | 77,3 ± 3,8 | 40,7 ± 1,9 | 68,7 ± 3,8 | 36,0 ± 3,3 |
| + Unstick-ReInit | 76,0 ± 4,3 | 71,3 ± 2,5 | 76,7 ± 1,9 | 71,3 ± 5,7 | 50,0 ± 11,8 | 68,0 ± 5,9 | 42,7 ± 0,9 |
| AdaJEPA (actualizacion de pesos en test) | 84,7 ± 5,7 | 86,7 ± 3,8 | 79,3 ± 5,0 | 78,7 ± 1,9 | 48,0 ± 8,6 | 65,3 ± 3,4 | 36,7 ± 2,5 |

Exito (%) en PushT con cambios visuales:

| Metodo | clean | blur | snp | dark 0.9 | red agent | red goal | red block |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Base | 64,0 ± 1,6 | 56,0 ± 3,3 | 64,7 ± 1,9 | 63,3 ± 1,9 | 44,0 ± 9,1 | 34,7 ± 5,2 | 11,3 ± 2,5 |
| + Unstick-Mem | 80,7 ± 0,9 | 76,7 ± 2,5 | 74,0 ± 1,6 | 78,0 ± 4,3 | 62,0 ± 5,9 | 38,7 ± 5,0 | 11,3 ± 2,5 |
| + Unstick-ReInit | 69,3 ± 6,6 | 59,3 ± 2,5 | 68,7 ± 6,6 | 68,0 ± 5,9 | 58,7 ± 11,8 | 40,0 ± 5,9 | 9,3 ± 0,9 |
| AdaJEPA (actualizacion de pesos en test) | 84,0 ± 1,6 | 86,0 ± 1,6 | 82,7 ± 3,4 | 83,3 ± 1,9 | 59,3 ± 6,2 | 49,3 ± 5,2 | 8,7 ± 2,5 |

## Requisitos de hardware

- VRAM estimada: no disponible; los pesos base incluyen DINOv2 ViT-S/14, pero el repo no publica cifras de memoria.
- GPU recomendadas: no disponible; el modelo card no especifica hardware de referencia.
- Cabe en GPU consumer: no disponible; el repo pesa 2,5 GB, pero el requisito real depende del codigo de planificacion y del entorno de simulacion.
- Opciones de despliegue: carga mediante el codigo oficial del repositorio con `--ft-root FT`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un world model de control).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Exito PushObj-T | Licencia | Disponibilidad |
|---|---|:---:|:---:|:---:|---|---|
| Unstick-Mem | AdaJEPA | no disponible | no disponible | 78,7% | MIT | HF jhlee0619/unstick |
| Unstick-ReInit | AdaJEPA | no disponible | no disponible | 76,0% | MIT | HF jhlee0619/unstick |
| AdaJEPA (actualizacion de pesos en test) | AdaJEPA | no disponible | no disponible | 84,7% | MIT | GitHub agentic-learning-ai-lab/adajepa |
| DINO-WM | DINOv2 ViT-S/14 | no disponible | no disponible | no disponible | MIT | GitHub gaoyuezhou/dino_wm |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: el modelo sobrevalora quedarse quieto en el 98% de los estancamientos en la forma T, lo que motiva precisamente los remedios Mem y ReInit.
- El rendimiento en objetos recoloreados (red goal, red block) sigue bajo: Unstick-Mem apenas sube red goal de 34,7% a 38,7% y no mejora red block (11,3%).
- Depende del codigo del repositorio para cargar los checkpoints (pickle de PyTorch); no es un modelo autonomo listo para inferencia generica.
- No hay informacion sobre idiomas, contexto ni cuantizacion; no es un modelo linguistico ni conversacional.
- Licencia MIT para los pesos, pero las variantes DINO-WM y Temporal Straightening incorporan DINOv2 ViT-S/14 bajo Apache 2.0; revisar `NOTICE` y `LICENSES/` antes de uso comercial.
- Los resultados provienen de un unico planificador (GD) y de simulacion; no hay datos de transferencia a robot real.

## Enlaces

- Hugging Face: https://huggingface.co/jhlee0619/unstick
- Paper arXiv: https://arxiv.org/abs/2611.25415
- Pagina del proyecto: https://jhlee0619.github.io/unstick/
- Codigo en GitHub: https://github.com/jhlee0619/unstick
- AdaJEPA: https://github.com/agentic-learning-ai-lab/adajepa
- DINO-WM: https://github.com/gaoyuezhou/dino_wm
- Temporal Straightening: https://github.com/agentic-learning-ai-lab/temporal-straightening
