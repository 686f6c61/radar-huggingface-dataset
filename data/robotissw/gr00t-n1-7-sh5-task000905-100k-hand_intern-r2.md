# RobotisSW/GR00T-N1.7-SH5-Task000905-100k-Hand_Intern-R2

## Resumen

GR00T-N1.7-SH5-Task000905-100k-Hand_Intern-R2 es un checkpoint de ajuste fino del modelo vision-language-action (VLA) NVIDIA GR00T N1.7-3B, publicado por RobotisSW. Se trata de un modelo de robotica orientado a una unica tarea de manipulacion: coger una compresa blanca de una caja con la mano derecha y sostenerla. El modelo parte de la base abierta de NVIDIA y anade un adaptador tactil especifico para el hardware SH5, de modo que no funciona con la implementacion estandar de GR00T sin ese adaptador.

El checkpoint corresponde al paso 100.000 de un entrenamiento con schedule coseno hasta 200.000 actualizaciones, y se distribuye como estado completo y reanudable: incluye pesos del modelo, procesador, estadisticas de normalizacion, mapeo de embodiment y estado del optimizador, scheduler y RNG. El backbone VLM permanece congelado durante el ajuste; solo se entrenan las cabezas de accion, los proyectores y el codificador tactil `finger_mlp`.

Con 3.144.022.064 parametros y un repositorio de 25,5 GB, es un modelo de gran tamano para el nicho de robotica de proposito especifico. Su relevancia es doble: por un lado, muestra el flujo de trabajo de especializacion de un VLA generalista a una tarea concreta con datos propios; por otro, documenta de forma inusualmente detallada el contrato de inferencia (joints, valores tactiles, orden de salidas) necesario para reproducir el comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA GR00T N1.7; transformer multimodal con cabezas de accion y adaptador tactil SH5 |
| Parametros totales | 3.144.022.064 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles en la model card) |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (checkpoint completo con optimizador, scheduler y RNG) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de NVIDIA GR00T N1.7, un modelo cross-embodiment que recibe entradas multimodales (lenguaje e imagenes) y produce acciones de manipulacion. En este ajuste fino, el backbone VLM se mantiene congelado y se entrenan las cabezas de accion, los proyectores y un codificador tactil `finger_mlp` especifico del hardware SH5. La salida son 40 pasos de 54 posiciones articulares absolutas en radianes, ordenadas como brazo izquierdo (7), brazo derecho (7), mano izquierda (20) y mano derecha (20); cabeza, elevacion y base quedan excluidas de las salidas.

Los datos de entrenamiento consisten en 51 episodios grabados a 30 Hz (46 para entrenamiento y 5 reservados para validacion), con una unica camara de cabeza (`cam_left_head`), 54 posiciones articulares medidas y 90 valores tactiles crudos. El entrenamiento uso batch de 64, acumulacion de gradientes 1, learning rate 2e-05, warmup de 1000 pasos y precision BF16/TF32. El checkpoint publicado corresponde al paso 100.000 de un schedule coseno de 200.000 actualizaciones, con estado de optimizador, scheduler y RNG incluido para permitir la reanudacion exacta mediante `train_r2.sh --resume`.

## Capacidades

- Manipulacion robotica de proposito especifico: ejecutar la tarea de coger una compresa blanca de una caja con la mano derecha y sostenerla.
- Control de 54 articulaciones en lazo abierto mediante prediccion de 40 pasos de posiciones articulares absolutas en radianes.
- Fusion de vision (camara de cabeza) y tacto (90 valores crudos) a traves del adaptador SH5.
- Entrada de instrucciones en lenguaje natural como parte del paradigma VLA heredado de GR00T N1.7.
- Reanudacion de entrenamiento con estado completo (optimizador, scheduler, RNG y paso del trainer).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de texto general; el modelo esta especializado en accion robotica.

## Casos de uso

- Automatizacion de una celda de picking concreta: el modelo puede sustituir la politica de control de un brazo robot SH5 en la tarea de recogida y sostenimiento de la compresa, usando la camara de cabeza y los sensores tactiles como unica entrada perceptiva.
- Investigacion en aprendizaje por imitacion con datos tactiles: sirve como punto de partida para estudiar como el codificador `finger_mlp` influye en el exito de agarre cuando se comparan variantes con y sin senal tactil.
- Reanudacion y extension del entrenamiento: al incluir optimizador, scheduler y RNG, un equipo puede continuar el schedule coseno hasta las 200.000 actualizaciones sin perder la trayectoria de entrenamiento original.
- Evaluacion de generalizacion con pocos datos: con solo 46 episodios de entrenamiento y 5 de validacion, es un caso util para medir el sobreajuste de un VLA de 3B en tareas de contacto fisico.
- Banco de pruebas de integracion de hardware: el contrato de inferencia documentado (embodiment `new_embodiment`, `use_tactile=True`, orden de joints) permite validar pipelines de `Gr00tPolicy` antes de desplegar politicas mas generales.
- Base para ajustes finos en tareas analogas de manipulacion con tacto: el checkpoint puede servir como inicializacion para otras tareas que compartan el mismo embodiment SH5 y el mismo esquema de observacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realiza ninguna afirmacion de exito o seguridad del robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144 millones de parametros, en BF16 los pesos ocupan aproximadamente 6,3 GB; en FP32, unos 12,6 GB. A ello hay que sumar el estado del optimizador si se reanuda el entrenamiento, lo que eleva notablemente el requisito.
- GPU recomendadas: no disponible. Por tamano, una GPU con 16 GB o mas de memoria es un punto de partida razonable para inferencia en BF16, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: no confirmado; probablemente si en modelos con 24 GB (RTX 4090) para inferencia, sujeto a verificacion.
- Opciones de despliegue: `Gr00tPolicy` con embodiment `new_embodiment` y `use_tactile=True`, segun la model card. Requiere la implementacion personalizada de GR00T con soporte tactil SH5, no la version estandar sin adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-SH5-Task000905-100k-Hand_Intern-R2 | 3.144.022.064 | no disponible | Tarea unica de manipulacion con tacto SH5 | NVIDIA Open Model License | Hugging Face (RobotisSW) |
| GR00T-N1.7-SH5-Task000905-50k-Hand_Intern-R2 | no disponible | no disponible | Misma tarea, checkpoint en paso 50.000 | NVIDIA Open Model License | Pesos no disponibles aun segun la model card |
| nvidia/GR00T-N1.7-3B | aproximadamente 3B (modelo base) | no disponible | VLA generalista cross-embodiment | NVIDIA Open Model License | Hugging Face (NVIDIA) |

## Limitaciones y advertencias

- Modelo de proposito unico: solo se ha ajustado para una tarea concreta; no debe esperarse generalizacion a otras tareas de manipulacion.
- Requiere la implementacion personalizada de GR00T con adaptador tactil SH5; la version estandar de GR00T no es compatible.
- Entrenado con solo 46 episodios y una unica camara de cabeza, lo que limita la variabilidad visual y aumenta el riesgo de sobreajuste al entorno de grabacion.
- La model card declara explicitamente que no se ofrece ninguna garantia de exito ni de seguridad del robot; el uso en produccion requiere validacion y medidas de seguridad externas.
- No se documentan sesgos, comportamiento multilingue ni riesgos de alucinacion en el sentido de modelos de lenguaje; el riesgo principal es de fallo fisico en la tarea.
- La licencia NVIDIA Open Model License impone condiciones de uso comercial que deben revisarse antes de un despliegue productivo.
- El repositorio excluye videos crudos, demostraciones, credenciales y rutas privadas; la reproducibilidad depende de conservar el dataset local original.
- Es necesario verificar `SHA256SUMS` tras la descarga en el commit registrado.

## Enlaces

- Hugging Face: https://huggingface.co/RobotisSW/GR00T-N1.7-SH5-Task000905-100k-Hand_Intern-R2
- Checkpoint de 50.000 pasos: https://huggingface.co/RobotisSW/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern-R2
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
