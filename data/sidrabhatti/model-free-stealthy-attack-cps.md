# SidraBhatti/model-free-stealthy-attack-cps

## Resumen

Model-Free Stealthy False Data Injection Attacks on Autonomous Vehicle CPS es un framework de ataque de inyeccion de datos falsos (FDI, false data injection) diseñado para sistemas ciberfisicos (CPS) de seguridad critica y demostrado sobre sistemas de sensores de vehiculos autonomos. Lo desarrolla el OSU Center for Automotive Research (Mobility Systems Lab) de la Universidad Estatal de Ohio, con Sidra Ghayour Bhatti en rol de supervision metodologica, Qazi Mairaj ud din como autor principal de la implementacion y Qadeer Ahmed como investigador principal. El artefacto publicado en HuggingFace no contiene pesos de un modelo de lenguaje: es el punto de entrada de un repositorio de investigacion asociado a un articulo en revision en IEEE Transactions on Intelligent Transportation Systems.

El problema que aborda es la generacion de perturbaciones maliciosas que degraden el comportamiento del vehiculo sin ser detectadas por los sistemas de deteccion de intrusiones (IDS). Su aportacion diferencial es que el ataque es model-free: la estrategia se aprende directamente de datos de medicion nominales, sin requerir conocimiento de la dinamica del sistema ni de sus matrices de estado. La arquitectura combina un autoencoder que aprende la variedad (manifold) nominal de las mediciones, una red generadora recurrente que produce perturbaciones acotadas condicionadas en mediciones pasadas y un critico Wasserstein que impone una restriccion de sigilo distribucional.

Los resultados declarados por los autores incluyen hasta 2,51 m de desviacion de carril y 8 km/h de desviacion de velocidad en pruebas hardware-in-the-loop, manteniendose por debajo del umbral de alarma, con capacidad de evasion verificada frente a cinco metodos de IDS distintos y corroboracion sobre datos de un camion real. El repositorio de HuggingFace no registra descargas ni interacciones, no publica pesos y carece de model card con especificaciones tecnicas convencionales (parametros, contexto, cuantizacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder (ancla de la variedad nominal) + red generadora recurrente + critico Wasserstein (GAN condicional de Wasserstein) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el generador esta condicionado en mediciones pasadas; no se publica el tamano de la ventana temporal) |
| Tipos de cuantizacion | no disponible (no se publican pesos; el repositorio HuggingFace no contiene artefactos de modelo) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje natural) |
| Licencia | MIT (declarada en la model card del repositorio de HuggingFace y en el repositorio de codigo) |
| Formato de pesos | no disponible (no se publican pesos en HuggingFace; el codigo esta en github.com/OSU-CAR-MSL/model_free_stealthy_attack) |

## Arquitectura y entrenamiento

El framework se compone de tres modulos que se entrenan conjuntamente. El primero es un autoencoder ancla que aprende la variedad de mediciones nominales a partir de datos historicos de sensores, y que define operativamente que es "normal" en el espacio de mediciones. El segundo es una red generadora recurrente que produce perturbaciones de ataque acotadas y condicionadas en mediciones pasadas, lo que permite que el ataque se adapte en lazo cerrado en lugar de inyectar un desplazamiento estatico fijo. El tercero es un critico Wasserstein que impone una restriccion de sigilo de tipo distribucional: mantiene la distribucion de mediciones perturbadas proxima a la nominal para que los detectores estadisticos de intrusion no la marquen como anomala.

El objetivo de entrenamiento equilibra de forma conjunta tres metas en competencia: sigilo (permanecer por debajo de los umbrales de deteccion), impacto (maximizar la desviacion en la dinamica del vehiculo) y consistencia en lazo cerrado (condicionamiento en el contexto para que el ataque sea coherente a lo largo del tiempo y no puntual). El diseño se apoya en tres proposiciones teoricas: R1 caracteriza la direccion de perturbacion que se mantiene sigilosa bajo la estadistica residual del detector, R2 caracteriza como un residuo sigiloso aun se acopla a un impacto observable en la dinamica del vehiculo, y R3 formaliza la maximizacion del impacto sujeta a permanecer cerca de la variedad nominal ancla. El numero de tokens, la composicion del dataset de entrenamiento y el uso de RLHF o DPO no aplican ni se detallan en la informacion disponible; la evaluacion se realizo sobre datos de un camion fisico, un modelo de alta fidelidad de un camion Scania ejecutado en plataforma dSPACE SCALEXIO, estudios de ablacion por termino del objetivo y una evaluacion frente a cinco sistemas de deteccion de intrusiones.

## Capacidades

- Generacion de perturbaciones de medicion adversariales sobre sensores de vehiculos autonomos, con acotacion explicita de la magnitud de la perturbacion.
- Ataque model-free: no requiere conocimiento de la dinamica del sistema, de las ecuaciones de estado ni de los parametros del controlador.
- Adaptacion en lazo cerrado mediante generador recurrente condicionado en mediciones pasadas, en lugar de offsets estaticos.
- Evasion de deteccion con restriccion distribucional de sigilo, verificada frente a cinco metodos de IDS distintos.
- Aprendizaje de la distribucion nominal de mediciones mediante autoencoder ancla, reutilizable como referencia de normalidad.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no incluye modo de razonamiento, vision ni audio; su dominio es el control de lazo cerrado de CPS y la dinamica vehicular.

## Casos de uso

- Evaluacion de robustez de IDS en CPS: el framework permite generar trafico de sensores perturbado y sigiloso para medir la tasa de deteccion real de un IDS antes de desplegarlo en un vehiculo, usando los cinco detectores de referencia de los autores como linea base.
- Red teaming de vehiculos autonomos: un equipo de seguridad puede usar el generador para inyectar perturbaciones en un banco de pruebas y comprobar si el sistema de control llega a estados peligrosos sin disparar alarmas.
- Validacion hardware-in-the-loop: integrado sobre un modelo de camion Scania en dSPACE SCALEXIO, sirve para reproducir escenarios adversarios de alta fidelidad antes de disponer de un vehiculo fisico.
- Aumento de datasets de deteccion: las trazas de ataque sigiloso generadas pueden etiquetarse y añadirse al conjunto de entrenamiento de un detector para reducir su tasa de falsos negativos ante ataques no basados en modelo.
- Auditoria de certificacion funcional (ISO 26262 / SOTIF): el framework permite documentar escenarios de amenaza que degradan el comportamiento del vehiculo y verificar si las contramedidas declaradas los mitigan.
- Investigacion en teoria de control y seguridad: las proposiciones R1, R2 y R3 se pueden reproducir sobre otros dominios CPS (redes electricas, plantas industriales, robots) sustituyendo el modelo nominal por el del nuevo sistema.
- Analisis de ablacion de estrategias de ataque: eliminar sistematicamente los terminos de sigilo, impacto y recurrencia permite atribuir el exito del ataque a un componente concreto en lugar de reportar solo el resultado agregado.
- Formacion y docencia en seguridad de CPS: el codigo con licencia MIT puede utilizarse en cursos de posgrado para ilustrar ataques FDI y contramedidas basadas en deteccion estadistica de residuos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el artefacto no es un modelo de lenguaje. La model card si reporta resultados de evaluacion especificos del dominio:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Desviacion de carril inducida | 2,51 m | Sobre el vehiculo objetivo, evadiendo deteccion |
| Desviacion de velocidad | 8 km/h | Prueba hardware-in-the-loop, por debajo del umbral de alarma |
| Generalizacion de sigilo | 5 metodos de IDS distintos | Directorio IDS_eval/ del repositorio |
| Validacion en dominio real | Datos de un camion fisico | No solo simulacion |
| Platforma de validacion HiL | dSPACE SCALEXIO con modelo de camion Scania | Alta fidelidad |

Estos valores proceden exclusivamente de la model card del autor. El manuscrito asociado esta en revision en IEEE T-ITS y no dispone de cita publicada ni de resultados revisados por pares en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros del autoencoder, del generador recurrente ni del critico Wasserstein, por lo que no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. No se especifica el hardware de entrenamiento ni el de inferencia.
- Compatibilidad con GPU de consumo: no determinable con la informacion disponible; si el generador recurrente es de escala reducida, seria plausible su ejecucion en GPUs de consumo, pero esto no esta confirmado por los autores.
- Plataforma de validacion declarada: dSPACE SCALEXIO para las pruebas hardware-in-the-loop con el modelo de camion Scania.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni runtimes equivalentes, ya que no es un modelo de lenguaje. El despliegue se realiza ejecutando el codigo del repositorio github.com/OSU-CAR-MSL/model_free_stealthy_attack.
- Latencia y throughput estimados: no disponible.
- Artefactos publicados: el repositorio de HuggingFace no contiene pesos, solo metadatos y la model card; el codigo fuente reside en GitHub bajo licencia MIT.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica sistemas alternativos concretos ni permite comparar parametros, contexto o licencia con otras propuestas. La unica distincion cualitativa que declaran los autores es la ausencia de conocimiento de la dinamica del sistema (model-free), frente al supuesto habitual de los ataques FDI basados en modelo, que requieren las ecuaciones de la planta o del controlador. No se dispone de cifras comparativas verificadas con ningun sistema concreto.

## Limitaciones y advertencias

- Artefacto de doble uso: es un framework de ataque ofensivo. Su uso fuera de entornos controlados, de investigacion o de auditoria autorizada puede constituir un delito y comprometer la seguridad de personas en vehiculos reales.
- Resultados no revisados por pares: el manuscrito esta en revision en IEEE T-ITS y la cita no esta disponible todavia; las cifras de 2,51 m y 8 km/h son declaraciones de los autores.
- Ausencia de pesos: el repositorio de HuggingFace no publica pesos ni artefactos de modelo, solo metadatos con la etiqueta region:us. Sin descargas ni likes registrados, no hay evidencia de validacion independiente.
- Especificaciones incompletas: no se documentan parametros, ventana temporal de contexto, arquitectura exacta de las capas, dataset de entrenamiento ni proceso de validacion estadistica.
- Dependencia del detector: aunque el sigilo se evaluo frente a cinco IDS, no se garantiza evasion frente a detectores no representados en ese conjunto ni frente a detectores basados en modelos fisicos.
- Dominio restringido: disenado y validado para dinamica de vehiculos y mediciones de sensores de automocion; la transferencia a otros CPS requeriria reentrenamiento con datos nominales del nuevo sistema.
- Sesgos conocidos: no aplica en el sentido de sesgos de modelos de lenguaje; si existe un sesgo de dominio hacia el modelo de camion Scania y la plataforma dSPACE utilizados.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de lenguaje.
- Licencia: MIT, permisiva y compatible con uso comercial, pero no exime de responsabilidad legal por el uso ofensivo del software ni de las obligaciones normativas aplicables a sistemas de seguridad critica.
- Anomalia en metadatos: la fecha de creacion registrada en HuggingFace (2026-09-12) es atipica y sugiere un posible error de sellado temporal del repositorio.
- Resultados de busqueda web: las consultas asociadas a este identificador devolvieron exclusivamente resultados de contenido para adultos sin relacion con el modelo, por lo que no se ha podido obtener informacion externa adicional contrastable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SidraBhatti/model-free-stealthy-attack-cps
- Codigo fuente (MIT): https://github.com/OSU-CAR-MSL/model_free_stealthy_attack
- Figura de arquitectura CPS y modelo de ataque: https://github.com/user-attachments/assets/04bd854d-b299-48f0-9829-77cd85a3647f
- Articulo asociado: en revision en IEEE Transactions on Intelligent Transportation Systems (T-ITS); sin enlace ni cita disponible en el momento de redactar esta ficha.
- OSU Center for Automotive Research (Mobility Systems Lab): no se ha encontrado URL especifica en la informacion proporcionada.
