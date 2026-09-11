# Selvauma/nmc622-deepmd

## Resumen

nmc622-deepmd es un potencial interatómico de machine learning (MLIP) para el cátodo de óxido laminar NMC622 (LiNi₀,₆Mn₀,₂Co₀,₂O₂), una de las químicas de cátodo más empleadas en baterías comerciales de ion-litio. No es un modelo de lenguaje ni un modelo generativo: se trata de un potencial entrenado con DeepMD-kit que predice energías y fuerzas interatómicas para alimentar simulaciones de dinámica molecular clásica con precisión cercana a la de la teoría del funcional de la densidad. Lo publica Selva Chandrasekaran Selvaraj (University of Illinois Chicago) en el repositorio de HuggingFace Selvauma/nmc622-deepmd, con un tamaño de repositorio de 0,9 GB y licencia CC BY 4.0.

El modelo resuelve un problema clásico de la ciencia de materiales computacional: la simulación de la difusión de Li⁺ en la estructura laminar del NMC622 requiere escalas de tiempo y de tamaño que la AIMD (dinámica molecular ab initio) no alcanza con un coste razonable. El potencial reproduce las tendencias de transporte del material y permite simulaciones extensas a 300 K y 600 K con un coste computacional muy inferior al de VASP. Es relevante ahora porque los MLIP específicos de química de baterías están sustituyendo progresivamente a los potenciales empíricos en el cribado de materiales de cátodo, y porque este caso incluye parámetros calibrados para modelos de transporte de continuo.

El repositorio contiene dos potenciales en producción, `nmc622_production.pb` (450,6 MB) y `nmc622_model1.pb` (407,6 MB), ambos entrenados durante 1.000.000 de pasos y seleccionados por tener el RMSE de fuerza de validación más bajo de un conjunto mayor de iteraciones. El pipeline de entrenamiento parte de muestreo AIMD con VASP (funcional PBE, 500 K) y se cierra con las etapas train/freeze/compress de DeepMD-kit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial interatomico de machine learning basado en red neuronal profunda (DeepMD-kit); descriptores locales de entorno atomico sobre grafo de vecinos con radio de corte |
| Parametros totales | no disponible (no se publica el recuento de parametros; los ficheros congelados ocupan 450,6 MB y 407,6 MB) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); el limite practico lo fijan el radio de corte del descriptor y el tamano de la celda de simulacion |
| Tipos de cuantizacion | no disponible (el pipeline incluye una etapa de compresion de DeepMD-kit, pero no se documentan niveles de cuantizacion equivalentes a FP16/INT8) |
| Idiomas soportados | no aplica |
| Licencia | CC BY 4.0 (la model card la marca explicitamente como provisional, con una nota TODO pendiente de confirmacion por el autor) |
| Formato de pesos | TensorFlow frozen graph (.pb) de DeepMD-kit |
| Sistema quimico | LiNi₀,₆Mn₀,₂Co₀,₂O₂ (NMC622), oxido laminar |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-09-11 |
| Fecha de actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema estándar de DeepMD-kit: un descriptor que construye, para cada átomo, un vector de características a partir de las distancias y direcciones de sus vecinos dentro de un radio de corte, y una red neuronal profunda que mapea ese descriptor a la energía atómica. La energía total es la suma de las contribuciones atómicas y las fuerzas se obtienen por diferenciación automática del grafo, lo que garantiza consistencia energética. El resultado se congela y se comprime para su uso en producción con DeePMD-kit, LAMMPS o i-PI.

Los datos de entrenamiento proceden de muestreo de estructuras aleatorias mediante AIMD con VASP, usando el funcional PBE a 500 K. No se documenta el número exacto de configuraciones ni de átomos del conjunto de entrenamiento. El pipeline (`AIMD sampling → DeepMD-kit train/freeze/compress`) está producido por la herramienta HPCA del propio autor. La model card indica que existieron iteraciones previas con celdas de 6.000, 11.000 y 22.000 átomos, además de variantes optimizadas en memoria, que quedaron como intermedios obsoletos y no se incluyen en el repositorio. Los dos ficheros publicados corresponden a la pareja con menor RMSE de fuerza en validación de entre las 3 iteraciones actuales de producción. No se menciona uso de RLHF, DPO ni ningún esquema de ajuste por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Predicción de energías potenciales y fuerzas interatómicas para estructuras de NMC622 con error de validación de 0,00226–0,00239 eV/átomo en energía y 0,166–0,178 eV/Å en fuerza.
- Ejecución de dinámica molecular en ensambles NVT/NPT a temperaturas de operación relevantes, con resultados reportados a 300 K y 600 K.
- Cálculo de coeficientes de difusión de Li⁺: 2,58×10⁻¹¹ cm²/s a 300 K y 5,12×10⁻¹¹ cm²/s a 600 K, frente a 9,0×10⁻¹² cm²/s de la referencia AIMD.
- Estimación de la energía de activación de la difusión de Li⁺ (0,035 eV reportado para el potencial, frente a 0,34 eV de la AIMD).
- Predicción de propiedades mecánicas del material: módulo elástico E = 200 GPa, coeficiente de Poisson ν = 0,30, densidad ρ = 4,7 g/cm³.
- Simulación de celdas de gran tamaño (se documentan exploraciones de 6.000, 11.000 y 22.000 átomos) durante escalas de tiempo fuera del alcance de la AIMD.
- Integración con motores de dinámica molecular externos mediante el formato `.pb` de DeepMD-kit.
- No soporta tool calling, function calling ni flujos de agente: es un potencial físico, no un modelo de lenguaje.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Simulación de la difusión de Li⁺ en el cátodo: el potencial permite ejecutar dinámica molecular de nanosegundos sobre celdas de miles de átomos, algo inalcanzable con AIMD, para estimar coeficientes de difusión y energías de activación a distintas temperaturas.
- Cribado de dopantes y sustituciones en la red laminar: se pueden generar estructuras con sustitución parcial de Ni, Mn o Co y evaluar el efecto sobre la movilidad de Li⁺ y la estabilidad estructural antes de sintetizar el material.
- Estudio de recubrimientos e interfases cátodo-electrolito: el potencial es adecuado para relajaciones y dinámicas de interfases donde se necesita reproducir fuerzas locales con precisión cercana a DFT.
- Cálculo de propiedades mecánicas y expansión térmica: los valores de E = 200 GPa y ν = 0,30 permiten usar el potencial en análisis de tensiones internas y de compatibilidad mecánica en electrodos compuestos.
- Generación de parámetros para modelos de transporte de continuo: la model card menciona explícitamente que los parámetros del modelo de transporte continuo siguen a Ncube et al. 2026, de modo que el potencial sirve como puente entre la escala atomística y la macroscópica.
- Análisis de ordenamiento de Li y transiciones de fase en la estructura laminar: las simulaciones a 300 K y 600 K permiten explorar transiciones orden-desorden y su impacto en la conductividad iónica.
- Validación cruzada de potenciales empíricos: al disponer de una referencia AIMD en la propia model card (D = 9,0×10⁻¹² cm²/s, Eₐ = 0,34 eV), el modelo puede usarse como término de comparación en estudios metodológicos sobre MLIP.
- Acoplamiento multiescala en LAMMPS o i-PI: el fichero `.pb` se carga directamente en estos motores, lo que facilita integrar el potencial en flujos de trabajo ya existentes de simulación de baterías.

## Benchmarks y rendimiento

La model card no reporta benchmarks de la familia MMLU, HumanEval o GSM8K, que no aplican a un potencial interatómico. Sí publica métricas de validación propias, que se reproducen a continuación.

| Metrica | AIMD (referencia) | MLMD (DeepMD) |
|---|---|---|
| D (Li⁺, cm²/s) | 9,0×10⁻¹² | 2,58×10⁻¹¹ (300 K) / 5,12×10⁻¹¹ (600 K) |
| Eₐ (eV) | 0,34 | 0,035 |

| Fichero | RMSE energia (eV/atomo) | RMSE fuerza (eV/Å) | Pasos de entrenamiento | Tamano |
|---|---|---|---|---|
| model/nmc622_production.pb | 0,00239 | 0,166 | 1.000.000 | 450,6 MB |
| model/nmc622_model1.pb | 0,00226 | 0,178 | 1.000.000 | 407,6 MB |

Los valores de RMSE corresponden al conjunto de validación (held-out) leído directamente del fichero `lcurve.out` de cada ejecución de DeepMD-kit en su paso final de entrenamiento, según indica la propia model card. No se han publicado resultados de benchmarks comparativos con otros MLIP en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican cifras de consumo de memoria). Como referencia de orden de magnitud, los ficheros de pesos ocupan 450,6 MB y 407,6 MB, por lo que el grafo congelado en memoria es de unos pocos cientos de MB; el consumo real depende del número de átomos de la celda y del tamaño del vecindario.
- GPU recomendadas: no disponible. DeepMD-kit soporta ejecución en GPU NVIDIA mediante CUDA, pero la model card no especifica modelos ni versiones probadas.
- Viabilidad en GPU de consumo: no confirmada por el autor. Dado el tamaño del fichero (menos de 0,5 GB), es plausible su ejecución en GPU de consumo con suficiente memoria, pero no hay datos publicados que lo respalden y debe verificarse empíricamente.
- Despliegue: el formato `.pb` es el nativo de DeepMD-kit y se integra con LAMMPS, i-PI y la API de Python de DeePMD-kit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Alternativa sin GPU: la inferencia de potenciales DeepMD-kit puede ejecutarse en CPU, aunque con un coste por paso de dinámica molecular mayor.

## Comparativa con modelos similares

| Modelo | Tipo | Sistema quimico | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nmc622-deepmd | MLIP (DeepMD-kit) | NMC622 especifico | no disponible | no aplica | CC BY 4.0 (provisional) | HuggingFace |
| MACE-MP-0 | MLIP (MACE) | Generalista (materia inorganica) | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| CHGNet | MLIP (red de grafos) | Generalista | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| M3GNet | MLIP (red de grafos) | Generalista | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Potenciales empiricos tipo Buckingham o MEAM para NMC | Potencial clasico | NMC y oxidos laminares | no disponible | no aplica | variable | no disponible |

La busqueda web realizada no devolvio informacion util sobre alternativas: los resultados corresponden a paginas corporativas de Microsoft y no guardan relacion con potenciales interatomicos. Por tanto, los datos de los modelos comparables no pueden confirmarse con las fuentes disponibles y se marcan como no disponibles. La diferencia cualitativa principal, deducible de la propia model card, es que nmc622-deepmd esta especializado en una unica quimica (NMC622) con parametros calibrados para ella, mientras que los MLIP generalistas citados cubren un espacio quimico mucho mas amplio a costa de menor especializacion.

## Limitaciones y advertencias

- Dominio restringido: el potencial esta entrenado exclusivamente para NMC622. Aplicarlo a otras estequiometrias NMC, a otros oxidos laminares o a fases con descomposicion quimica no esta validado y puede producir errores grandes.
- Discrepancia en la energia de activacion: la Eₐ reportada por el potencial (0,035 eV) es un orden de magnitud inferior a la de la referencia AIMD (0,34 eV), mientras que el coeficiente de difusión es entre 2,9 y 5,7 veces mayor. Esta divergencia sugiere que el potencial reproduce cualitativamente la tendencia pero no la barrera de activacion, y debe tenerse en cuenta antes de usar los valores de transporte en modelos de continuo.
- Error de fuerza de validacion de 0,166–0,178 eV/Å: es un valor razonable para MLIP, pero puede acumular deriva en dinamicas largas o en configuraciones alejadas del conjunto de entrenamiento.
- Licencia provisional: la propia model card marca la licencia CC BY 4.0 con un comentario `TODO: confirm` que indica que es un marcador de posicion. Debe confirmarse con el autor antes de un uso comercial, ya que la licencia efectiva podria cambiar.
- Sin adopcion verificable: 0 descargas y 0 likes en HuggingFace en la fecha de consulta, y sin resultados relevantes en la busqueda web. No existe evidencia externa de validacion independiente.
- Cobertura de datos no documentada: no se especifica el numero de configuraciones AIMD, la composicion del conjunto de entrenamiento ni la celda exacta de los dos ficheros publicados, lo que limita la reproducibilidad.
- Riesgo de extrapolacion: como en cualquier MLIP, las predicciones fuera del dominio de configuraciones muestreadas (temperaturas muy altas, fases amorfas, interfaces con electrolito) no estan garantizadas.
- Sin soporte de lenguaje, agentes ni tool calling: cualquier flujo de trabajo que requiera esas capacidades debe combinar este modelo con otras herramientas.
- Ausencia de datos de rendimiento: no se publican cifras de latencia, throughput ni consumo de memoria, lo que dificulta el dimensionamiento de infraestructura.
- Referencia bibliografica incompleta: la model card cita «Ncube et al. 2026» para los parametros del modelo de transporte de continuo, pero no incluye enlace ni identificador del trabajo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Selvauma/nmc622-deepmd
- Repositorio de la herramienta HPCA: https://github.com/selvachandrasekaranselvaraj/hpca
- Enlace a DeepMD-kit: no disponible en la informacion proporcionada
- Paper asociado: no disponible (la model card menciona «Ncube et al. 2026» sin enlace ni DOI)
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no aporto ningun enlace adicional relevante sobre este modelo.
