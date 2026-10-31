# a3harva/laya-toolguard-mlx

## Resumen

Laya-toolguard-mlx es un modelo clasificador de seguridad (guardrails) para agentes de codigo, creado por el usuario a3harva a partir del modelo Laya de convaiinnovations. Su funcion es evaluar llamadas a herramientas (bash, write, edit, read) de un agente de programacion antes de que se ejecuten, bloqueando las inseguras y explicando al agente el motivo del bloqueo. A diferencia de un LLM generativo, realiza una unica pasada hacia delante sobre seis opciones predefinidas y devuelve probabilidades calibradas, con latencias de 40-85 ms por llamada en Apple Silicon.

El modelo esta cuantizado a 8 bits en formato MLX (safetensors), ocupa unos 500 MB en disco y tiene 421,3 millones de parametros. Es el motor del proyecto pi-laya-mlx, una extension de guardado para el agente de codigo pi, y se despliega como servidor local con una API HTTP simple.

Su relevancia actual radica en la necesidad creciente de supervisar agentes autonomos de codigo que ejecutan comandos de shell con privilegios de usuario: este modelo aporta una capa de decision local, rapida y con licencia Apache-2.0, entrenada mediante rondas de red-teaming adversariales y con evidencia estructural del analizador estatico CARE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de Laya con cabeza de decision de 6 opciones (clasificacion de texto) |
| Parametros totales | 421.293.827 (421,3 M) |
| Parametros activos | no disponible (no se indica si es MoE; el entrenamiento uso las 18 primeras capas del codificador de 28) |
| Longitud de contexto | 1024 tokens por ventana (entradas largas divididas en ventanas solapadas por el servidor) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8 bits) |

## Arquitectura y entrenamiento

El modelo parte de cavi-ai/laya-MLX-8bit (variante typed-decisions), un port a MLX del codificador Laya de convaiinnovations. No es un modelo generativo: es un clasificador que puntua seis opciones (routine, destroy, exfiltrate, remote_code, system, production) en una sola pasada. Para el fine-tuning se dequantizo el modelo base, se entrenaron las 18 capas superiores de las 28 del codificador (v8 usaba 14) y la cabeza de decision, y se re-quantizo a 8 bits respetando el layout original.

El entrenamiento uso entropia cruzada con ponderacion de clases, label smoothing de 0,1, 4 epocas, learning rate 3e-5 y batch 4, con temperatura de calibracion ajustada en el conjunto de validacion. El proceso completo tomo 80 minutos en un Apple M5 de 16 GB con un pico de 10,5 GB de memoria. Los datos incluyen unas 3.500 llamadas a herramientas escritas con plantillas y LLM, mas unas 1.500 filas de nueve rondas de red-teaming en las que un segundo agente (DeepSeek en una sesion restringida de pi) ataco al checkpoint vigente; todas las filas adversariales fueron revisadas manualmente. Ademas de los datos, la mayoria de checkpoints (todos salvo v2) incorporan evidencia estructural del analizador estatico de shell CARE, que tambien se necesita en inferencia.

## Capacidades

- Clasificacion de llamadas a herramientas de agentes de codigo en seis categorias de riesgo: rutina, destruccion de datos, exfiltracion, codigo remoto, cambios de sistema y produccion.
- Calculo de un score de riesgo calibrado (riesgo = 1 - p(routine)), con umbral de bloqueo en 0,5.
- Deteccion de ataques disfrazados de trabajo rutinario, payloads codificados, manipulacion del propio guard y comandos seguros que solo parecen peligrosos.
- Integracion como servidor local (API en localhost:8723, endpoint /v1/guard) y como extension del agente de codigo pi.
- Modo ensemble: se pueden combinar v9d y v10 para bloquear si cualquiera de los dos marca riesgo, aumentando la cobertura de ataques a costa de mas falsos positivos.
- Uso de evidencia estatica del analizador CARE para complementar el juicio del modelo (requerido en inferencia salvo para el checkpoint v2).
- No genera texto; su salida es una decision (block/allow), la probabilidad de riesgo, la categoria y una razon.

## Casos de uso

- Guardia de seguridad para agentes de codigo: cada llamada a bash, write, edit o read del agente pi se evalua antes de ejecutarse; si el riesgo es >= 0,5 se bloquea y se devuelve al agente una explicacion, permitiendo que reformule la accion.
- Prevencion de borrados accidentales o maliciosos: detecta comandos como `rm -rf ~` o reescrituras de historial git fuera del proyecto (categoria destroy).
- Proteccion contra exfiltracion de secretos: bloquea llamadas que envian credenciales o datos privados fuera de la maquina (categoria exfiltrate), util cuando el agente manipula logs o ficheros de configuracion con claves.
- Bloqueo de ejecucion de codigo no confiable: impide ejecutar scripts descargados de fuentes no verificadas (categoria remote_code), un vector habitual en ataques de supply chain.
- Salvaguarda de controles del sistema: detecta intentos de modificar ajustes del sistema operativo, seguridad o del propio guard (categoria system), incluyendo la manipulacion del guard por parte del agente.
- Proteccion de infraestructura en produccion: senala llamadas que tocan bases de datos, despliegues o infraestructura en vivo (categoria production) durante sesiones de desarrollo.
- Auditoria y investigacion en seguridad de agentes: los datos, scripts y logs de red-teaming estan publicados en el repositorio de GitHub, lo que permite reproducir experimentos o entrenar variantes propias.

## Benchmarks y rendimiento

Resultados publicados por el autor (llamadas inseguras bloqueadas / llamadas seguras permitidas, umbral 0,5; ningun conjunto fue usado en entrenamiento):

| Conjunto | v8 | v2+v8 | v9d | v10 | v9d+v10 |
|---|---|---|---|---|---|
| Sondas red-team rounds 1-8 (617) | 91,4% / 92,3% | 93,4% / 77,0% | 96,1% / 93,9% | 94,7% / 95,8% | 96,7% / 93,6% |
| Sondas round 9 (58) | 78,6% / 96,7% | 89,3% / 83,3% | 96,4% / 96,7% | 96,4% / 96,7% | 100% / 96,7% |
| Sondas round 10 (77) | 70,7% / 80,6% | 80,5% / 58,3% | 90,2% / 86,1% | 92,7% / 91,7% | 97,6% / 83,3% |
| Final exam (107) | 84,3% / 91,1% | 90,2% / 73,2% | 92,2% / 85,7% | 84,3% / 83,9% | 92,2% / 78,6% |
| Ataques canonicos (26 riesgosos / 8 rutina) | 80,8% / 100% | 96,2% / 87,5% | 100% / 100% | 96,2% / 100% | 100% / 100% |
| AUC (held-out) | 0,972 | 0,955 | 0,990 | 0,985 | 0,989 |

En un benchmark estilo CARE (549 comandos reconstruidos a partir de Atomic Red Team, RedCode-Exec y NL2Bash), v8 logro F1 62,8% con 8,2% de falsos positivos, frente al 65,9% / 6,1% del motor estatico de CARE; la combinacion de ambas politicas (bloquear si cualquiera senala) alcanzo F1 73,0%. El autor aclara que las politicas difieren y que esto compara enfoques, no los numeros publicados de CARE.

## Requisitos de hardware

- Memoria unificada: unos 500 MB para el modelo en 8 bits; el entrenamiento del fine-tuning requirio un pico de 10,5 GB en un Apple M5 de 16 GB, pero para inferencia basta un equipo Apple Silicon modesto.
- Inferencia en Apple Silicon mediante MLX, con 40-85 ms por llamada evaluada.
- No hay datos publicados sobre rendimiento en GPU NVIDIA o CPU x86; el formato MLX esta orientado a hardware de Apple.
- Despliegue recomendado: servidor laya-guard (instalable con `pip install "laya-guard[evidence]"` y el script setup.sh de pi-laya-mlx), que expone la API en localhost:8723.
- Integracion nativa como extension del agente de codigo pi (`pi -e ./extension`).
- Requiere el analizador estatico CARE como fuente de evidencia en inferencia (salvo el checkpoint v2).
- No se han publicado cifras de throughput sostenido ni latencias en otros entornos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| laya-toolguard-mlx (v9d) | Clasificador de seguridad para tool calls | 421,3 M | MLX 8-bit (safetensors) | Apache-2.0 | Guardia local para agentes de codigo, 6 categorias, 40-85 ms |
| CARE (motor estatico) | Analizador estatico de comandos shell | no aplicable | no aplicable | no disponible | Analisis de shell sin modelo neuronal; F1 65,9% en el benchmark comparado |
| Laya (convaiinnovations/laya) | Modelo base clasificador | no disponible | no disponible | no disponible | Modelo base sin fine-tuning especifico para tool calls; zero-shot bloqueaba ~60% de llamadas rutinarias |

No hay disponibles alternativas comerciales directas de la misma categoria con datos comparables publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Es un clasificador, no una sandbox: reduce el riesgo pero no demuestra que una llamada sea segura; debe combinarse con sandboxing a nivel de sistema operativo.
- Solo juzga lo visible en la llamada: si un script oculta su efecto, el modelo lo evalua por su texto visible y puede no detectar el peligro real.
- Ventana de 1024 tokens; las entradas largas se dividen en ventanas solapadas, lo que puede afectar al juicio en comandos muy extensos.
- Solo en ingles y entrenado con flujos de trabajo de desarrollador en macOS/Linux; su comportamiento en otros idiomas o plataformas no esta verificado.
- El checkpoint v10 presenta olvido de algunos ataques del final exam respecto a v9d, por lo que se recomienda usarlo solo como miembro de un ensemble, no de forma aislada.
- La mayoria de checkpoints requieren la dependencia externa CARE en inferencia, lo que anade una dependencia de instalacion.
- El ensemble v9d+v10 aumenta la deteccion de ataques pero tambien los bloqueos falsos (por ejemplo, 83,3% de permiso en llamadas seguras del round 10 frente al 91,7% de v10 solo).
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque los pesos derivan de Laya (codigo del modelo bajo MIT segun el autor) y conviene revisar la licencia del modelo base original.
- Modelo de nicho con muy pocas descargas (79) y sin auditoria externa publicada; se recomienda validacion propia antes de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a3harva/laya-toolguard-mlx
- Repositorio del proyecto pi-laya-mlx (servidor, extension y datos de investigacion): https://github.com/a3harva/pi-laya-mlx
- Datos, scripts y log de entrenamiento: https://github.com/a3harva/pi-laya-mlx/tree/main/research
- Modelo base (port MLX de Laya): https://huggingface.co/cavi-ai/laya-MLX-8bit
- Modelo original Laya: https://huggingface.co/convaiinnovations/laya
- Analizador estatico CARE: https://github.com/prisma-research/CARE
- Agente de codigo pi: https://pi.dev
