# Selvauma/lyc-sse-deepmd

## Resumen

LYC — Doped Li₃YCl₆ Halide Solid-State Electrolyte (DeepMD) es un conjunto de dos potenciales interatomicos de tipo machine-learned interatomic potential (MLIP), entrenados con DeepMD-kit para el electrolito solido de haluro Li₃YCl₆ (LYC). No es un modelo de lenguaje: es una red neuronal que predice energia, fuerzas y virial de un sistema atomico, y su proposito es sustituir al calculo DFT dentro de simulaciones de dinamica molecular a gran escala y largo tiempo de simulacion. Lo publica Selvauma (Selva Chandrasekaran Selvaraj, University of Illinois Chicago) dentro de un estudio sistematico de dopaje de LYC sobre 24 composiciones, del que este repositorio incluye solo las 2 mejor convergidas de la serie base `LYC1_*`.

El interes practico esta en el material: Li₃YCl₆ es un candidato de electrolito solido tolerante a la humedad, y el dopaje de la subred de Y o de Cl es una palanca estandar para ajustar la concentracion de vacantes de Li⁺ y el paisaje de barreras de migracion sin cambiar la estructura madre. Los potenciales se entrenan a partir de AIMD con VASP y funcional PBE, lo que permite reproducir con coste reducido las energias y fuerzas de referencia y extender las simulaciones a escalas de tiempo y tamano inaccesibles para AIMD.

Los dos ficheros incluidos son `model/LYC1_pure.pb` (LYC puro) y `model/LYC1_F08.pb` (fluoracion parcial, aproximadamente 12 sustituciones de F por celda), ambos entrenados durante 500.000 pasos con un RMSE de validacion de 0,000352 y 0,000443 eV/atomo en energia, y 0,0283 y 0,0324 eV/Å en fuerza. La model card advierte de forma explicita de que cada `.pb` es un modelo especifico de composicion y de que no debe extrapolarse a otras composiciones, algo relevante porque el resto del estudio (dopaje cationico con In, Yb, Zr, Er, Hf y sus combinaciones) no esta en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial interatomico Deep Potential (DeepMD-kit): descriptor de entorno local mas red de ajuste; flujo `dp train` → `dp freeze` → `dp compress` |
| Parametros totales | No disponible (el repositorio contiene dos grafos `.pb` de 40,7 MB y 85,8 MB) |
| Longitud de contexto | No aplica. El equivalente funcional es el radio de corte del descriptor, que no se documenta en la model card: no disponible |
| Tipos de cuantizacion | No aplica. Se emplea compresion mediante `dp compress`; no se documentan variantes de precision ni de formato reducido |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | cc-by-4.0, marcada en la propia model card como provisional (`# TODO: confirm`) |
| Formato de pesos | `.pb` (grafo congelado de TensorFlow, formato nativo de DeepMD-kit) |
| Dominio de aplicacion | Electrolito solido de haluro Li₃YCl₆ (LYC) y su variante fluorada F08 |
| Composiciones incluidas | 2 de 24: `LYC1_pure` y `LYC1_F08`, ambas de la serie base `LYC1_*` |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion en HuggingFace | 2026-09-11 (creacion), 2026-09-11 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Deep Potential de DeepMD-kit: un descriptor que codifica el entorno atomico local (distancias y simetrias dentro de un radio de corte) y una red neuronal de ajuste que mapea ese descriptor a la energia atomica, de la que se derivan fuerzas y virial de forma analitica. El pipeline de generacion por composicion es AIMD con VASP y funcional PBE a varias temperaturas, seguido de `dp train` sobre energias, fuerzas y virial, `dp freeze` y `dp compress` para producir el `.pb` final. Todo el flujo lo orquesta la plataforma HPCA.

Cada modelo se entrena de forma independiente para una unica composicion, con 500.000 pasos de entrenamiento. No hay una unica red transferible a lo largo de todo el espacio de composiciones: el estudio se diseno precisamente para comparar composiciones de forma sistematica en lugar de asumir transferibilidad. No se documentan en la informacion disponible el numero de configuraciones AIMD, el rango exacto de temperaturas, la composicion del dataset de validacion, ni si hubo etapas de refinamiento tipo RLHF/DPO (concepto, por otra parte, no aplicable a un potencial interatomico). La descripcion del estudio completo cubre sustitucion en sitio anionico (Cl → F, con niveles F08/F16/F24/F32, aproximadamente 12/23/35/46 sustituciones por celda) y sustitucion en sitio cationico (Y → In, Yb, Zr, Er, Hf a ocupaciones del 25/50/75/100 %, mas diez combinaciones de co-dopaje por pares), pero esas 22 composiciones adicionales no forman parte de este repositorio.

## Capacidades

- Prediccion de energia total, fuerzas atomicas y virial (tensor de tension) para configuraciones de Li₃YCl₆ puro y de la variante fluorada F08.
- Integracion en dinamica molecular clasica mediante el par `deepmd` de LAMMPS, lo que permite alcanzar nanosegundos y celdas de miles a cientos de miles de atomos con coste muy inferior al AIMD.
- Simulacion a temperaturas dentro de la ventana AIMD de entrenamiento de cada composicion (el rango concreto no se detalla: no disponible).
- Calculo de propiedades de transporte derivadas del muestreo MD: coeficientes de difusion de Li⁺ y, con postproceso adecuado, conductividad ionica.
- Estimacion de barreras de migracion de Li⁺ y de energias de defecto/vacancia mediante NEB, metadinamica u otros metodos sobre la superficie de energia potencial del modelo.
- Uso como referencia comparativa entre composiciones al mismo nivel metodologico, ya que cada fichero procede de un flujo identico.
- No soporta tool calling ni function calling (no aplica a un potencial interatomico).
- No soporta agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento (thinking mode); no aplica.
- No hay capacidades multimodales ni de generacion de texto de ningun tipo.

## Casos de uso

- Dinamica molecular a largo plazo de Li₃YCl₆ puro: usar `model/LYC1_pure.pb` en LAMMPS para simular varios nanosegundos de celda grande y estimar el coeficiente de difusion de Li⁺ a distintas temperaturas, algo inasumible con AIMD.
- Estudio de fluoracion parcial: emplear `model/LYC1_F08.pb` para comparar el transporte de Li⁺ frente a la composicion pura y evaluar si el dopaje anionico reduce la barrera de migracion, manteniendo el resto de condiciones de simulacion identicas.
- Calculo de barreras de migracion con NEB o metadinamica: el potencial proporciona energias y fuerzas de forma continua y derivable, lo que permite relajar y muestrear caminos de migracion de vacantes de Li⁺ sin el coste de una evaluacion DFT por imagen.
- Cribado previo a DFT: usar el potencial para descartar rapidamente configuraciones de defecto o de ordenacion cationica poco prometedoras antes de gastar horas de calculo PBE en las candidatas finales.
- Generacion de datos de entrenamiento o de benchmarking: producir trayectorias etiquetadas para comparar contra otros MLIP (MACE, CHGNet, M3GNet) o para alimentar modelos mas rapidos, siempre dentro del dominio de la composicion correspondiente.
- Apoyo a la interpretacion experimental: comparar tendencias de difusion y de estabilidad estructural con resultados de espectroscopia de impedancia (EIS) o RMN de solidos en muestras de LYC y LYC fluorado.
- Verificacion y reproducibilidad del pipeline HPCA: dado que cada `.pb` se genera con `dp train` → `dp freeze` → `dp compress` y se documentan los RMSE leidos de `lcurve.out`, los ficheros sirven como referencia reproducible para validar la orquestacion y comparar futuros reentrenamientos.
- Analisis de tensiones mecanicas en la celda: al predecir el virial, el modelo permite estudiar acoplamiento entre expansion de red, temperatura y transporte ionico en simulaciones con barostato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, ya que no se trata de un modelo de lenguaje. Los unicos datos de rendimiento proporcionados son los errores de validacion del flujo DeepMD-kit:

| Fichero | Composicion | RMSE energia (eV/atomo) | RMSE fuerza (eV/Å) | Pasos de entrenamiento | Tamano |
|---|---|---|---|---|---|
| `model/LYC1_pure.pb` | Li₃YCl₆ puro | 0,000352 | 0,0283 | 500.000 | 40,7 MB |
| `model/LYC1_F08.pb` | Li₃YCl₆ con fluoracion F08 | 0,000443 | 0,0324 | 500.000 | 85,8 MB |

Los valores proceden del fichero `lcurve.out` de cada ejecucion en el paso final de entrenamiento y corresponden al conjunto de validacion retenido, segun indica la model card. No se proporcionan comparaciones contra otros potenciales para este sistema concreto.

## Requisitos de hardware

- El modelo en si ocupa 40,7 MB (`LYC1_pure`) y 85,8 MB (`LYC1_F08`), por lo que la memoria para almacenar los pesos es trivial.
- VRAM estimada: no disponible. En ejecucion sobre GPU, el consumo lo dominan el grafo de computacion de TensorFlow, la lista de vecinos y el tamano del sistema, no el fichero `.pb`; para celdas de referencia de electrolitos (cientos a pocos miles de atomos) el consumo cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con CUDA compatible con el backend TensorFlow de DeepMD-kit. Una RTX 3090 o RTX 4090 es suficiente para sistemas de miles a decenas de miles de atomos; A100 o H100 resultan adecuadas para celdas grandes, barridos de temperatura o estudios de alto rendimiento.
- Cabe en GPU de consumo: si, el modelo y los tamanos de sistema tipicos para este tipo de estudio.
- CPU: cualquier x86-64 moderno con AVX2 puede ejecutar la inferencia en CPU, opcion habitual en clusters HPC cuando no se dispone de GPU.
- Opciones de despliegue: DeepMD-kit (`dp test`, `dp compress`), LAMMPS con `pair_style deepmd`, i-PI para dinamica con termostatos avanzados, ASE como capa de alto nivel y DP-GEN para flujos de entrenamiento activo.
- Latencia y throughput estimados: no disponible. Dependen del numero de atomos, del radio de corte, del hardware y de si la ejecucion es en CPU o GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de cifras de modelos comparables, ni de resultados de benchmarks que permitan una comparacion cuantitativa directa. La categoria funcional equivalente es la de los MLIP de proposito general o especificos de materiales (familias como MACE-MP-0, CHGNet o M3GNet), pero no se han facilitado sus parametros, contexto efectivo, licencia ni disponibilidad, por lo que no es posible construir una tabla comparativa fiable sin inventar datos.

| Modelo | Categoria | Parametros | Cobertura de composiciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LYC — Doped Li₃YCl₆ (DeepMD) | MLIP especifico de composicion | No disponible | 2 composiciones de LYC (`LYC1_pure`, `LYC1_F08`) | cc-by-4.0 (provisional) | HuggingFace, 2 ficheros `.pb` |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especificidad de composicion: cada `.pb` se entrena para una unica composicion. No debe extrapolarse un modelo a otra composicion ni a otro nivel de dopaje; la propia model card lo advierte de forma explicita.
- Dominio de validez limitado: los potenciales no estan validados para composiciones ni temperaturas fuera de la ventana AIMD de entrenamiento de esa composicion. Las predicciones fuera de ese rango pueden ser no fisicas.
- Los dos ficheros incluidos pertenecen a la serie base `LYC1_*` (puro y F08), no a las composiciones dopadas con In, Yb, Zr, Er o Hf. Las otras 22 composiciones existen pero no estan en este repositorio.
- Licencia dudosa: la model card incluye un comentario `# TODO: confirm` sobre la licencia cc-by-4.0, que se presenta como eleccion provisional. Conviene confirmar los terminos con el autor antes de un uso comercial.
- Estado de validacion por la comunidad: 0 descargas, 0 likes y un pipeline no declarado en HuggingFace; no hay evidencia de uso o replicacion externa.
- Riesgo de extrapolacion en lugar de alucinacion: al ser un modelo de regresion sobre una superficie de energia potencial, el fallo tipico no es inventar contenido, sino producir energias y fuerzas suavemente plausibles pero incorrectas fuera del dominio de entrenamiento, donde las estimaciones de error de validacion no son validas.
- Sesgo metodologico: los datos de referencia proceden de AIMD con VASP y funcional PBE, por lo que el modelo hereda los sesgos propios de esa aproximacion (tratamiento de la correlacion electronica, descripcion de la estructura electronica) y de las temperaturas y configuraciones muestreadas.
- Fiabilidad de propiedades derivadas: los RMSE de fuerza (0,0283 y 0,0324 eV/Å) son del orden habitual en MLIP de este tipo, pero propiedades sensibles como barreras de migracion o conductividad ionica requieren validacion especifica antes de usarse en conclusiones de produccion.
- Sin datos sobre numero de configuraciones de entrenamiento, rango de temperaturas, cobertura de fases ni validacion experimental, lo que limita la evaluacion independiente del dominio de aplicabilidad.
- Software de investigacion: la model card indica explicitamente que son potenciales de investigacion y que deben validarse antes de confiar en sus resultados, con la misma advertencia que aplica a la plataforma de orquestacion que los produjo.

## Enlaces

- [Modelo en HuggingFace: Selvauma/lyc-sse-deepmd](https://huggingface.co/Selvauma/lyc-sse-deepmd)
- [Plataforma de orquestacion HPCA](https://github.com/selvachandrasekaranselvaraj/hpca) (referenciada en la model card como productora del flujo AIMD → `dp train` → `dp freeze` → `dp compress`)
- [DeepMD-kit](https://github.com/deepmodeling/deepmd-kit) (framework mencionado en la model card; no se proporciona enlace directo en la informacion disponible)
- Citacion indicada en la model card: Selva Chandrasekaran Selvaraj, University of Illinois Chicago.
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos corresponden a un servicio de videollamadas aleatorias (OmeTV) y no guardan relacion con el modelo, el material ni los potenciales interatomicos.
