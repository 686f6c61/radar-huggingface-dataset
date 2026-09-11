# Selvauma/na-air-deepmd

## Resumen

El modelo `Selvauma/na-air-deepmd` es un potencial interatomico de red neuronal entrenado con DeepMD-kit para describir las fases de descarga de las baterias de sodio-aire (Na-O2). Cubre de forma conjunta las tres fases cristalinas relevantes (Na2O, Na2O2 y NaO2) y sus interfaces mixtas (Na2O–Na2O2, Na2O2–NaO2 y la union trifasica Na2O–Na2O2–NaO2), en lugar de entrenar un potencial independiente por fase. Lo desarrolla Selva Chandrasekaran Selvaraj (University of Illinois Chicago) y se publica en Hugging Face bajo licencia CC-BY-4.0, con un unico artefacto congelado de 27,5 MB (`model/na_air_production.pb`).

No es un modelo de lenguaje: no genera texto ni tiene ventana de contexto ni capacidades de razonamiento simbolico. Es una herramienta de simulacion atomistica que sustituye a la energia y las fuerzas calculadas con teoria del funcional de la densidad (DFT) dentro de simulaciones de dinamica molecular, con un coste computacional varios ordenes de magnitud menor. Su relevancia esta en el ambito de materiales para almacenamiento de energia: la fase que se deposita en el catodo durante la descarga de una bateria Na-aire y la forma en que esas fases se interconvierten en las fronteras determinan la recargabilidad y el sobrepotencial del dispositivo, de ahi el interes de disponer de un potencial unico que cubra simultaneamente las tres fases y sus interfaces.

El repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta y no incluye pesos en formatos de motores de inferencia habituales ni cifras de error de validacion publicadas. El propio autor reconoce en la model card que la licencia CC-BY-4.0 figura como valor provisional ("TODO: confirm"), por lo que la condiciones de uso comercial deben verificarse con el autor antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial interatomico DeepMD-kit (DeePMD): red neuronal que aprende energia y fuerzas a partir de descriptores del entorno atomico local. Variante de descriptor y tamano de red: no disponible |
| Parametros totales | No disponible |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la "memoria" efectiva la fija el radio de corte del descriptor, no especificado) |
| Tipos de cuantizacion | No disponible. El pipeline de entrenamiento incluye la etapa de compresion de DeepMD-kit (`train` / `freeze` / `compress`), pero no se documenta que nivel de compresion tiene el `.pb` publicado |
| Idiomas soportados | No aplica |
| Licencia | CC-BY-4.0, marcada en la propia model card como provisional y pendiente de confirmacion |
| Formato de pesos | Grafo congelado en protobuf (`.pb`) de DeepMD-kit; 27,5 MB |
| Dominio quimico | Sistema Na-O: Na2O, Na2O2, NaO2 y sus interfaces |
| Temperaturas cubiertas | 7 temperaturas en el rango 300-380 K, por fase e interfaz |
| Autor y afiliacion | Selva Chandrasekaran Selvaraj, University of Illinois Chicago |
| Fecha de publicacion | Repositorio creado el 2026-09-11 y actualizado el mismo dia (segun metadatos de Hugging Face) |
| Tamano del repositorio | 0,0 GB segun la API (el artefacto declarado ocupa 27,5 MB) |

## Arquitectura y entrenamiento

La model card indica que el modelo se ha producido con el flujo de trabajo estandar de DeepMD-kit: entrenamiento (`train`), congelado (`freeze`) y compresion (`compress`) de un potencial Deep. En DeepMD-kit esto corresponde a una red neuronal que toma descriptores locales del entorno atomico (distancias y angulos dentro de un radio de corte) y devuelve la energia por atomo, de la que se derivan analiticamente las fuerzas. La informacion proporcionada no especifica la variante de descriptor (`se_e2_a`, `se_e2_r`, `se_e3`, `DPA-1`, etc.), el numero de capas ni el radio de corte, por lo que estos detalles quedan como "no disponible". El resultado es un unico grafo congelado que se evalua en el interior de motores de dinamica molecular.

Los datos de entrenamiento provienen de dinamica molecular ab initio (AIMD) con VASP y funcional PBE, generada sobre todas las configuraciones de fase e interfaz del espacio de composicion Na-O considerado. El punto metodologico destacable es precisamente el entrenamiento conjunto: en lugar de un potencial por fase, se cubre en un solo modelo el espacio compartido de las tres fases y sus fronteras, lo que permite simular interconversion de fases y transporte de sodio a traves de las interfaces sin saltos de consistencia entre potenciales distintos. No se documenta en la informacion disponible el numero total de configuraciones, el numero de pasos de entrenamiento ni si hubo etapas de refinamiento tipo RLHF/DPO (conceptos, por otra parte, no aplicables a un potencial interatomico). El pipeline se distribuye a traves del repositorio HPCA del autor.

## Capacidades

- Calculo de energia potencial y fuerzas atomicas para Na2O, Na2O2 y NaO2 en fase pura, con precision de potencial de machine learning en lugar de DFT.
- Descripcion de interfaces y uniones de fase: Na2O–Na2O2, Na2O2–NaO2 y la union trifasica Na2O–Na2O2–NaO2, lo que habilita simulaciones de crecimiento y transformacion de fases de descarga.
- Dinamica molecular a temperatura finita en el rango 300-380 K, con siete temperaturas cubiertas por fase e interfaz.
- Calculo de coeficientes de autodifusion del sodio y de su energia de activacion: la model card reporta D(Na) = 2,3x10^-10 cm2/s con Ea = 0,21 eV por AIMD, y D(Na) = 2,5x10^-10 cm2/s con Ea = 0,22 eV por dinamica molecular con el potencial de machine learning (MLMD).
- Estimacion de propiedades mecanicas y elasticas: modulo de Young E = 15 GPa, coeficiente de Poisson nu = 0,30 y densidad rho = 2,2 g/cm3.
- Simulaciones de transporte ionico y difusion en volumen y a traves de intercaras, relevantes para la movilidad de Na en productos de descarga.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingues ni modos de razonamiento: no es un modelo generativo de lenguaje.
- No se documentan capacidades de vision, audio ni procesamiento de senales.

## Casos de uso

- Simulacion de descarga de baterias Na-aire: el potencial permite modelar a escala atomistica cual de las tres fases de oxido de sodio se nuclea y crece en el catodo, y como lo hace, sin recurrir a DFT en cada paso de integracion.
- Estudio de interconversion de fases en la interfaz: al cubrir las uniones Na2O–Na2O2, Na2O2–NaO2 y la trifasica, permite simular transformaciones de fase en la frontera, que es el mecanismo que condiciona la recargabilidad.
- Calculo de conductividad ionica del sodio: la difusion y la energia de activacion reportadas (0,21-0,22 eV) se pueden reproducir y extrapolar a otras temperaturas dentro del rango cubierto, para estimar el transporte ionico en productos de descarga.
- Cribado de mecanismos de sobrepotencial: comparando energias de formacion e interfaces en el modelo se puede analizar que fase es termodinamicamente favorecida y donde se concentra la barrera cinetica.
- Simulaciones mecanicas de electrodos con productos de descarga: con E = 15 GPa, nu = 0,30 y rho = 2,2 g/cm3 se pueden plantear estudios de tensiones y deformacion en depositos de oxido sobre el catodo.
- Generacion de trayectorias de referencia a bajo coste: las trayectorias MLMD sirven para alimentar analisis posteriores (funciones de distribucion radial, mapas de densidad, difusion) sin el coste de AIMD.
- Extension a nuevos compuestos Na-O: el pipeline HPCA documentado permite reentrenar o ampliar el espacio de composicion si se dispone de datos AIMD adicionales.
- Integracion en flujos de trabajo de ciencia de materiales: al ser un `.pb` de DeepMD-kit, se puede acoplar a motores de dinamica molecular para estudios de estabilidad a temperatura finita en el rango 300-380 K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de errores de validacion (RMSE de energia en eV/atomo ni RMSE de fuerza en eV/A) para el fichero publicado: el autor indica explicitamente que no se conservo el `lcurve.out` del entrenamiento y que, por tanto, no puede reportar cifras de precision. Tampoco hay comparaciones con otros potenciales en la informacion proporcionada.

Los unicos datos cuantitativos disponibles son de propiedades fisicas calculadas con el propio modelo, que se recogen a continuacion tal como aparecen en la model card:

| Magnitud | AIMD | MLMD (DeepMD) |
|---|---|---|
| Coeficiente de difusion de Na (cm2/s) | 2,3x10^-10 | 2,5x10^-10 |
| Energia de activacion de difusion (eV) | 0,21 | 0,22 |

| Propiedad mecanica | Valor |
|---|---|
| Modulo de Young (GPa) | 15 |
| Coeficiente de Poisson | 0,30 |
| Densidad (g/cm3) | 2,2 |

No se dispone de RMSE de energia ni de fuerza para `model/na_air_production.pb`, ni de curvas de aprendizaje, ni de validacion frente a conjuntos de prueba independientes.

## Requisitos de hardware

- El artefacto pesa 27,5 MB, por lo que el modelo en si ocupa una fraccion minima de memoria: cabe con holgura en cualquier GPU de consumo y en CPU.
- VRAM estimada para inferencia: no disponible como cifra concreta. El consumo dominante no sera el potencial, sino el sistema atomico simulado, el motor de dinamica molecular (por ejemplo LAMMPS con la interfaz DeePMD-kit) y la eleccion de precision. La cifra exacta depende del numero de atomos de la celda de simulacion.
- GPU recomendadas: no especificadas en la informacion disponible. Dado el tamano del modelo, no se requiere una GPU de centro de datos; una GPU de consumo con soporte CUDA es suficiente en terminos de memoria del potencial, mientras el limite practico lo fija el tamano del sistema simulados.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPU de consumo en terminos de peso; no se documenta ningun requisito minimo de VRAM.
- Opciones de despliegue: DeePMD-kit para inferencia directa, integracion en LAMMPS mediante la interfaz DeePMD-kit, y acoplamiento a otros entornos de simulacion que consuman grafos `.pb`. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se publican tiempos por paso de integracion, numero de atomos por segundo ni aceleracion respecto a AIMD.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento publicadas para este modelo en la informacion proporcionada. Existen potenciales interatomicos de proposito general (foundation models) para materiales, como MACE-MP-0, CHGNet o DPA-2, y potenciales especificos de sistemas sodio-oxigeno, pero no se han proporcionado datos que permitan una comparacion cuantitativa con `na-air-deepmd`.

| Modelo | Ambito | Cobertura de fases Na-O | Licencia | Comparacion de rendimiento |
|---|---|---|---|---|
| `Selvauma/na-air-deepmd` | Potencial DeepMD-kit para productos de descarga Na-aire | Si: Na2O, Na2O2, NaO2 e interfaces | CC-BY-4.0 (provisional) | No disponible |
| Potenciales de proposito general para materiales | Multiples sistemas quimicos | Parcial o generica, no especifica de Na-O | No verificada en la informacion disponible | No disponible |
| Potenciales especificos de sistemas Na-O | Sistema sodio-oxigeno | No verificada en la informacion disponible | No verificada en la informacion disponible | No disponible |

La ventaja diferencial documentada de este modelo frente a alternativas genericas es su cobertura explicita y conjunta de las tres fases de descarga y sus interfaces en un unico potencial compartido, con validacion de difusion y propiedades mecanicas; la ausencia de RMSE publicado impide cuantificar su fidelidad frente a DFT y frente a otras alternativas.

## Limitaciones y advertencias

- No se publican errores de validacion (RMSE de energia ni de fuerza) para el fichero `model/na_air_production.pb`: el registro de entrenamiento (`lcurve.out`) no se conservo. Sin esa cifra no es posible acotar la fidelidad del potencial frente a DFT.
- El alcance quimico esta restringido al sistema Na-O en las fases Na2O, Na2O2 y NaO2 y sus interfaces. No debe extrapolarse a otros elementos, a electrolitos, a catalizadores ni a compuestos de sodio con otros aniones.
- El rango de temperatura validado es 300-380 K (siete temperaturas). Simulaciones fuera de ese intervalo no estan respaldadas por los datos de entrenamiento y pueden degradar la precision.
- Los datos de entrenamiento proceden de AIMD con VASP y funcional PBE, de modo que heredan los sesgos sistematicos del funcional (tipicamente subestimacion de barreras y errores en energias de formacion relativas entre fases).
- Riesgo de extrapolacion: como cualquier potencial de machine learning, puede producir predicciones no fisicas en configuraciones alejadas de la distribucion de entrenamiento, como altas presiones, fases amorfas no muestreadas o defectos poco representados.
- La licencia CC-BY-4.0 figura en la model card con la anotacion "TODO: confirm" y como valor provisional. Debe confirmarse con el autor antes de cualquier uso, incluido el comercial, pese a que CC-BY-4.0 permitiria uso comercial con atribucion.
- No hay datos de benchmarks, latencia, throughput ni requisitos de hardware documentados, lo que dificulta planificar su integracion en produccion.
- Estado de adopcion minimo: 0 descargas y 0 "likes", sin repositorio de incidencias ni comunidad asociada a la publicacion.
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados corresponden a dominios de comercio electronico sin relacion con el modelo. No se han localizado papers, blogs ni demos adicionales.
- La fecha de creacion que reporta la API (2026-09-11) resulta incoherente respecto a la fecha actual; conviene verificar la procedencia y el estado real del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selvauma/na-air-deepmd
- Repositorio del pipeline de produccion HPCA: https://github.com/selvachandrasekaranselvaraj/hpca
- Paper, blog o demo asociados: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio ninguna fuente relacionada con el modelo)
