# Selvauma/sses-coating-deepmd

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino dos potenciales interatomicos de red neuronal (MLIP) entrenados con DeepMD-kit para simular interfaces de recubrimiento sobre un anodo de litio metalico. Forma parte de una criba comparativa de cinco materiales candidatos (AlF3, MgF2, Al2O3, SbF3 y ZnCl2); el autor publica aqui unicamente los dos con menor RMSE de fuerza en validacion, ZnCl2 y MgF2, entrenados cada uno sobre una losa (slab) de interfaz Li-metal/recubrimiento.

El objetivo es disponer de potenciales rapidos que reproduzcan la energetica y las fuerzas de referencia obtenidas con AIMD (VASP, funcional PBE, muestreo a 300, 1000 y 3000 K), de modo que puedan ejecutarse simulaciones de dinamica molecular mucho mas largas (MLMD entre 300 y 450 K) para clasificar candidatos de recubrimiento con el mismo protocolo de construccion de interfaz y de entrenamiento.

Su relevancia es de nicho pero concreta: los recubrimientos protectores de anodos de litio metalico son un cuello de botella en baterias de estado solido y de alta densidad energetica, y la criba computacional con MLIP permite descartar candidatos antes de comprometer recursos en campanas de DFT o en sintesis experimental. El autor es Selva Chandrasekaran Selvaraj (University of Illinois Chicago) y el pipeline se genera con la herramienta HPCA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial interatomico de red neuronal DeepMD-kit (Deep Potential: descriptor de entorno local + red feed-forward), entrenado sobre datos AIMD |
| Parametros totales | no disponible (no se publica el recuento; tamano de fichero 73,0 MB para `model/ZnCl2_Li.pb` y 58,9 MB para `model/MgF2_Li.pb`) |
| Parametros activos | no aplicable (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; el alcance efectivo lo fija el cutoff del descriptor de DeepMD-kit, valor no disponible) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen ya en formato frozen/compressed de DeepMD-kit, no en precisiones alternativas |
| Idiomas soportados | no aplicable (modelo de simulacion atomica; no procesa texto) |
| Licencia | CC-BY-4.0, marcada en la propia model card como placeholder con un TODO pendiente de confirmar |
| Formato de pesos | TensorFlow `.pb` (ficheros frozen/compressed generados por el flujo train/freeze/compress de DeepMD-kit); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada potencial sigue el flujo estandar de DeepMD-kit: se construye una losa de interfaz entre el recubrimiento (AlF3, MgF2, Al2O3, SbF3 o ZnCl2) y el litio metalico, se genera el conjunto de referencia con AIMD en VASP usando el funcional PBE y muestreo a 300, 1000 y 3000 K, y con esos datos se entrena el Deep Potential, que despues se congela y se comprime. Cada uno de los dos modelos incluidos se entreno durante 1.000.000 de pasos. Los elementos contemplados en el conjunto de la criba son Al, Mg, Sb y Zn como cationes del recubrimiento, F, Cl y O como aniones, y Li como ion movil compartido por los cinco sistemas.

La innovacion aqui no es arquitectonica sino metodologica: los cinco candidatos se evaluan bajo el mismo protocolo (misma construccion de interfaz, mismo esquema de entrenamiento y validacion) para que la comparacion entre materiales sea homogenea. Tras el entrenamiento, los potenciales se emplean en simulaciones MLMD de mayor duracion entre 300 y 450 K, en siete temperaturas, lo que permite explorar estabilidad y transporte a escala de tiempo inaccesible para AIMD. No se emplearon tecnicas de alineamiento tipo RLHF o DPO, que no tienen sentido en este dominio.

Los errores de validacion declarados, leidos directamente del `lcurve.out` de cada ejecucion en el paso final de entrenamiento, son los siguientes:

| Fichero | RMSE energia (eV/atom) | RMSE fuerza (eV/A) | Pasos de entrenamiento | Tamano |
|---|---|---|---|---|
| `model/ZnCl2_Li.pb` | 0,00435 | 0,0747 | 1.000.000 | 73,0 MB |
| `model/MgF2_Li.pb` | 0,00573 | 0,103 | 1.000.000 | 58,9 MB |

## Capacidades

- Prediccion de energias y fuerzas atomicas para sistemas que contengan Li junto con Zn y Cl (modelo ZnCl2) o Li junto con Mg y F (modelo MgF2).
- Ejecucion de dinamica molecular clasica con potenciales de red neuronal a temperaturas de interes experimental (el autor reporta criba MLMD entre 300 y 450 K en siete temperaturas).
- Simulacion de losas de interfaz Li-metal/recubrimiento, incluyendo relajacion estructural y evolucion temporal de la interfaz.
- Criba comparativa de materiales: al compartir protocolo, los dos potenciales publicados (mas los tres restantes de la campana) permiten clasificar candidatos de recubrimiento con criterios homogeneos.
- Calculo de propiedades derivadas de trayectorias MD, como difusion de Li a traves del recubrimiento o estabilidad de la interfaz, siempre que se postprocesen las trayectorias.
- No soporta tool calling ni function calling: no es un modelo generativo de texto.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni procesamiento de lenguaje, vision o audio.

## Casos de uso

- Criba de recubrimientos para anodos de litio metalico: con los potenciales de ZnCl2 y MgF2 se puede simular la interfaz a 300-450 K y comparar estabilidad y transporte frente a los otros candidatos de la campana, ayudando a decidir que material merece estudio experimental.
- Estudio de difusion de litio a traves del recubrimiento: las trayectorias MLMD permiten estimar barreras y coeficientes de difusion efectivos, dato critico para juzgar si un recubrimiento es conductor ionico suficiente.
- Evaluacion de estabilidad termica de la interfaz: el muestreo a siete temperaturas permite detectar transiciones o degradacion estructural al elevar la temperatura, algo relevante para baterias que operan fuera de condiciones ambiente.
- Pre-criba antes de campanas de DFT: el potencial de red neuronal es ordenes de magnitud mas barato que AIMD, de modo que se pueden descartar geometrias o candidatos antes de invertir computo en calculos electronicos.
- Generacion de datos para modelos mas generales: las trayectorias producidas pueden servir como semilla o como conjunto de prueba para potenciales universales de mayor cobertura quimica.
- Simulacion en LAMMPS mediante el plugin DeePMD-kit: los ficheros `.pb` se cargan directamente en flujos de dinamica molecular clasica, lo que permite integrarlos en infraestructuras de calculo cientifico existentes.
- Analisis de interfaz solido/solido en baterias de estado solido: la misma metodologia de losa de interfaz es trasladable a otros pares electrodo/electrolito una vez reentrenada con los datos AIMD correspondientes.
- Docencia y reproducibilidad metodologica: el par de modelos y el pipeline HPCA documentado permiten reproducir un flujo completo AIMD a MLMD como ejemplo de trabajo en ciencia de materiales computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual de la ficha (MMLU, HumanEval, GSM8K y similares), ya que el modelo no es un sistema de lenguaje. Las unicas metricas cuantitativas disponibles son los errores de validacion de energia y fuerza que se recogen en la tabla de la seccion de arquitectura y entrenamiento, leidos del `lcurve.out` de cada ejecucion. No se proporcionan comparaciones con MACE-MP-0, CHGNet, M3GNet ni otros MLIP bajo un mismo conjunto de prueba, por lo que no es posible establecer una comparacion de rendimiento numerica con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los ficheros (58,9 MB y 73,0 MB) el modelo en si ocupa muy poca memoria y el consumo dominante sera el de las estructuras atomicas simuladas y el entorno de DeepMD-kit.
- GPU recomendadas: no se especifican en la informacion proporcionada. Para simulaciones MD de produccion con miles de atomos son razonables GPU de datacenter tipo A100 o H100, pero el autor no publica ninguna recomendacion al respecto.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion. Dado el tamano reducido de los ficheros, es plausible ejecutarlos en GPU de consumo (por ejemplo, gama RTX), pero no hay dato publicado que lo respalde.
- Ejecucion en CPU: DeepMD-kit permite inferencia en CPU, lo que hace viable el uso en estaciones de trabajo sin GPU, aunque con menor rendimiento por paso de MD.
- Opciones de despliegue: LAMMPS con el plugin DeePMD-kit como via principal, cargando los ficheros `.pb`. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se publican medidas de pasos de MD por segundo ni de coste por atomo.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura quimica | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sses-coating-deepmd (ZnCl2, MgF2) | DeepMD-kit, potenciales especializados | Sistemas Li/Zn/Cl y Li/Mg/F de interfaz con recubrimiento | no disponible | no aplicable | CC-BY-4.0 (pendiente de confirmar segun la propia model card) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| MACE-MP-0 | MLIP universal | Tabla periodica amplia | no disponible en la informacion proporcionada | no aplicable | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| CHGNet | MLIP universal | Tabla periodica amplia | no disponible en la informacion proporcionada | no aplicable | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| M3GNet | MLIP universal | Tabla periodica amplia | no disponible en la informacion proporcionada | no aplicable | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La diferencia de categoria es la relevante: los modelos universales priorizan cobertura quimica amplia con precision moderada, mientras que estos dos potenciales estan especializados en una interfaz concreta y deben ser mas precisos en su dominio, a costa de no ser transferibles fuera de el. No hay datos publicados que permitan cuantificar esa comparacion.

## Limitaciones y advertencias

- La licencia figura como CC-BY-4.0 pero la propia model card incluye un comentario `TODO: confirm` y la describe como placeholder, por lo que la situacion legal para uso comercial no esta cerrada y conviene contactar con el autor antes de integrarla en un producto.
- Solo se publican 2 de los 5 potenciales de la campana, y el autor advierte que no son necesariamente los dos mejores recubrimientos desde el punto de vista cientifico: AlF3 se senala como el candidato lider en transporte dentro del proyecto.
- El dominio de aplicabilidad esta restringido a las interfaces y composiciones con las que se entreno cada modelo. Cualquier extrapolacion a otras quimicas, fases o rangos de presion y temperatura no esta validada.
- Los errores de fuerza en validacion (0,0747 eV/A para ZnCl2 y 0,103 eV/A para MgF2) son razonables para MLIP, pero condicionan la fidelidad de propiedades derivadas como barreras de difusion o energias de interfaz.
- Los datos de referencia proceden de AIMD con funcional PBE, de modo que heredan sus limitaciones sistematicas, incluida la descripcion de interacciones no locales o de van der Waals, no detallada en la informacion disponible.
- No se documenta cuantificacion de incertidumbre ni mecanismos de deteccion de extrapolacion fuera de la distribucion de entrenamiento, lo que es relevante para produccion: una prediccion puede ser silenciosamente erronea en configuraciones no vistas.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- No hay resultados de benchmarks comparativos con otros MLIP bajo un mismo protocolo publicado en la informacion disponible.
- Las fechas de creacion y actualizacion del repositorio (11 de septiembre de 2026) deben tratarse con cautela al citar el recurso.
- Al no ser un modelo de lenguaje, no procede evaluar sesgos sociales, alucinacion textual ni comportamiento multilingue; el riesgo equivalente es el error numerico silencioso en simulaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Selvauma/sses-coating-deepmd
- Repositorio del pipeline HPCA: https://github.com/selvachandrasekaranselvaraj/hpca
- DeepMD-kit (framework de entrenamiento e inferencia): no se incluye enlace en la informacion proporcionada
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio resultados relevantes: los enlaces recuperados corresponden a un foro de contabilidad en portugues, sin relacion con el modelo.
- Cita indicada por el autor: Selva Chandrasekaran Selvaraj, University of Illinois Chicago.
