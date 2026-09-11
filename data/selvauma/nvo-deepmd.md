# Selvauma/nvo-deepmd

## Resumen

`Selvauma/nvo-deepmd` es una colección de potenciales interatómicos entrenados con DeepMD-kit para sistemas de electrodos de baterías de ion sodio: el cátodo Na₃V₂O₅ (NVO), ánodos basados en estaño (Sn) y variantes de partícula y multicapa con carbono duro (`NVO_Sn`, `C_Sn`). El autor es Selva Chandrasekaran Selvaraj (University of Illinois Chicago) y el repositorio se publica bajo licencia CC-BY-4.0, aunque el propio autor marca esa licencia como placeholder pendiente de confirmar. No es un modelo de lenguaje: es un potencial interatómico de machine learning (MLIP) que predice energías y fuerzas a nivel atomístico sustituyendo a la dinámica molecular ab initio (AIMD) a una fracción del coste.

El repositorio incluye dos de los seis potenciales que componen el estudio original (seleccionados por menor RMSE de fuerza en validación): `nvo_sn_primary.pb` (9,3 MB, 4.951.300 pasos de entrenamiento, RMSE de energía 0,0135 eV/átomo y de fuerza 0,114 eV/Å) y `nvo_sn_variant2.pb` (7,2 MB, 1.000.000 pasos, RMSE 0,0133 eV/átomo y 0,122 eV/Å). Ambos se distribuyen como grafos congelados de DeepMD-kit en formato `.pb`.

Su relevancia es acotada y específica: cubre una química concreta de electrodos de sodio con propiedades de transporte reportadas a 300, 360 y 440 K y una referencia AIMD (D = 1,1×10⁻¹⁰ cm²/s, Eₐ = 0,27 eV). El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepMD-kit (descriptor + red de ajuste sobre entornos atómicos); número de capas, tipo de descriptor y radio de corte no disponibles |
| Parametros totales | no disponible (tamaño de fichero: 9,3 MB y 7,2 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo opera sobre vecindarios atómicos dentro de un radio de corte no especificado |
| Tipos de cuantizacion | no aplica al despliegue típico (INT8/GGUF); el pipeline de DeepMD-kit contempla compresión del grafo (`train` / `freeze` / `compress`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | CC-BY-4.0, marcada por el autor como placeholder y pendiente de confirmación |
| Formato de pesos | `.pb` (grafo TensorFlow congelado para DeepMD-kit); ficheros `model/nvo_sn_primary.pb` y `model/nvo_sn_variant2.pb` |

## Arquitectura y entrenamiento

El flujo declarado en la model card es AIMD con VASP y funcional PBE como generador de datos, seguido de entrenamiento, congelado y compresión con DeepMD-kit. Se trata, por tanto, de un potencial interatómico ajustado a datos de primeros principios y no de un modelo preentrenado de propósito general. No se especifica el número de configuraciones del conjunto de entrenamiento, la composición exacta del dataset, el radio de corte, ni la arquitectura interna de la red (dimensiones del descriptor, número de capas, función de activación).

Los dos potenciales publicados se distinguen por su presupuesto de entrenamiento: 4.951.300 pasos para `nvo_sn_primary` y 1.000.000 para `nvo_sn_variant2`. El autor indica que ambos se seleccionaron entre seis potenciales que cubren variantes de tamaño de partícula y fase (nvo_particle, nvo_sn phase_1/phase_3, configuraciones bulk y de partícula de Sn) y que existen copias intermedias de estudios de escala en el árbol de código fuente que no se incluyen. No hay información sobre RLHF, DPO ni ningún esquema de ajuste por preferencias, que no aplican a este tipo de modelo.

## Capacidades

- Predicción de energía potencial y fuerzas atómicas para configuraciones de Na₃V₂O₅ y sistemas relacionados con Sn y carbono.
- Dinámica molecular clásica con el potencial como sustituto de AIMD, incluyendo simulaciones a temperatura finita (datos reportados a 300, 360 y 440 K).
- Cálculo de coeficientes de difusión de sodio: 9,21×10⁻¹¹ cm²/s (300 K) y 1,18×10⁻¹⁰ cm²/s (360 K) para `nvo_particle`; 1,26×10⁻¹⁰ cm²/s (440 K) para `nvo_particle`; 8,54×10⁻¹¹ cm²/s (300 K) y 1,13×10⁻¹⁰ cm²/s (360 K) para `nvo_sn_p1`.
- Estimación de propiedades mecánicas del sistema NVO: módulo elástico E = 120 GPa y coeficiente de Poisson ν = 0,25 (valores reportados en la model card, sin especificar si son predicción del potencial o referencia externa).
- Modelado de interfaces y heteroestructuras: variantes de partícula (`nvo_particle`, `nvo_sn_p1`) y de multicapa (`C_Sn`).
- Integración en motores de dinámica molecular mediante el formato `.pb` de DeepMD-kit (por ejemplo, a través del plugin de LAMMPS).
- No dispone de generación de texto, razonamiento, código, visión, tool calling, capacidades de agente ni soporte multilingüe: son capacidades no aplicables a un potencial interatómico.

## Casos de uso

- Estudio de transporte iónico en cátodos de Na₃V₂O₅: simulación de difusión de sodio a 300-440 K para obtener coeficientes de difusión y compararlos con la referencia AIMD (D = 1,1×10⁻¹⁰ cm²/s, Eₐ = 0,27 eV), con un coste computacional muy inferior al de la AIMD.
- Análisis de la interfase ánodo de estaño / carbono duro: las variantes `nvo_sn` y `C_Sn` permiten simular la región de contacto entre partículas de Sn y matriz carbonosa, relevante para la estabilidad mecánica del ánodo.
- Cálculo de propiedades mecánicas del electrodo: obtención de módulo elástico y coeficiente de Poisson para evaluar la tolerancia a la deformación durante los ciclos de sodación/desodación.
- Extensión temporal de trayectorias AIMD: uso del potencial para continuar simulaciones de decenas de nanosegundos allí donde la AIMD solo permite picosegundos, manteniendo la coherencia con la física de referencia dentro del dominio de entrenamiento.
- Generación de datos sintéticos para destilación o para entrenar potenciales más generales: las trayectorias producidas pueden etiquetarse como datos de pretraining de modelos de mayor cobertura química.
- Cribado de defectos y vacantes en NVO: comparación de energías relativas de configuraciones con vacantes de Na u oxígeno, siempre que las estructuras permanezcan dentro del dominio cubierto por el entrenamiento.
- Estudios de expansión térmica y estabilidad de fase: simulaciones NPT a distintas temperaturas para analizar transiciones y variaciones de volumen en el cátodo.
- Validación cruzada de metodologías MLIP: al publicarse dos variantes con distinto presupuesto de entrenamiento (4,95 M frente a 1 M pasos), sirven como caso de estudio sobre el efecto del número de pasos en el RMSE de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros potenciales en la información disponible. Los únicos datos de error y de propiedades físicas son los reportados por el autor en la model card:

| Fichero | RMSE energia (eV/atomo) | RMSE fuerza (eV/Å) | Pasos de entrenamiento | Tamano |
|---|---|---|---|---|
| `model/nvo_sn_primary.pb` | 0,0135 | 0,114 | 4.951.300 | 9,3 MB |
| `model/nvo_sn_variant2.pb` | 0,0133 | 0,122 | 1.000.000 | 7,2 MB |

| Sistema | D (cm²/s) | T |
|---|---|---|
| nvo_particle | 9,21×10⁻¹¹ | 300 K |
| nvo_particle | 1,18×10⁻¹⁰ | 360 K |
| nvo_particle | 1,26×10⁻¹⁰ | 440 K |
| nvo_sn_p1 | 8,54×10⁻¹¹ | 300 K |
| nvo_sn_p1 | 1,13×10⁻¹⁰ | 360 K |

Referencia AIMD declarada: D = 1,1×10⁻¹⁰ cm²/s, Eₐ = 0,27 eV. Propiedades mecánicas declaradas: E = 120 GPa, ν = 0,25. Los RMSE proceden del fichero `lcurve.out` de cada ejecución de DeepMD-kit en su paso final de entrenamiento, según indica el autor, y corresponden al conjunto de validación retenido.

## Requisitos de hardware

- No se publican cifras de VRAM, latencia ni throughput en la información disponible.
- El tamaño de los ficheros de modelo es reducido (9,3 MB y 7,2 MB), de modo que la memoria en inferencia está dominada por el tamaño del sistema simulado (número de átomos, radio de corte y lista de vecinos), no por los pesos del modelo.
- DeepMD-kit permite ejecución en CPU y en GPU (backend CUDA), por lo que un portátil o un nodo de cómputo sin GPU puede ejecutar el potencial; no se especifican requisitos mínimos ni versiones.
- No hay datos publicados sobre qué GPU concretas se emplearon en el entrenamiento ni sobre el rendimiento de inferencia con A100, H100 o RTX 4090.
- El pipeline incluye el comando `compress` de DeepMD-kit, orientado a reducir el coste de inferencia respecto al grafo congelado original, sin que se detalle el factor de mejora.
- Opciones de despliegue aplicables: inferencia directa con DeepMD-kit (interfaz Python o C++), acoplamiento a LAMMPS mediante el `pair_style deepmd`, y uso con otros motores compatibles con DeepMD-kit. Herramientas orientadas a LLM como vLLM, llama.cpp, Ollama o TGI no son aplicables a este modelo.

## Comparativa con modelos similares

No se proporcionan en la información disponible resultados que permitan comparar numéricamente este potencial con alternativas. La comparación cualitativa con las familias de MLIPs generalistas del mismo ámbito es la siguiente:

| Modelo | Cobertura química | Parametros | Error reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Selvauma/nvo-deepmd` | Específica: Na₃V₂O₅, Sn, C (electrodos de Na) | no disponible (9,3 MB / 7,2 MB por fichero) | RMSE E 0,0133-0,0135 eV/átomo; RMSE F 0,114-0,122 eV/Å | CC-BY-4.0 (placeholder por confirmar) | HuggingFace, 0 descargas, 0 likes |
| MACE-MP-0 y derivados | Generalista (Materiales Project) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| CHGNet | Generalista (Materiales Project) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| M3GNet | Generalista (Materiales Project) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

La diferencia funcional esperable es de especialización frente a generalidad: un potencial ajustado a una química concreta suele ofrecer menor error dentro de su dominio, a costa de no ser transferible a otros sistemas. No se han aportado datos que permitan cuantificar esa ventaja.

## Limitaciones y advertencias

- La licencia CC-BY-4.0 figura en la propia model card con la anotación «TODO: confirm — placeholder», por lo que las condiciones reales de uso comercial deben confirmarse con el autor antes de cualquier despliegue en producción.
- Solo se publican 2 de los 6 potenciales del estudio; el resto (variantes de fase y de tamaño de partícula) no está disponible en este repositorio.
- El repositorio presenta 0 descargas y 0 «likes»: no hay evidencia de validación independiente ni de replicación de los resultados por terceros.
- El RMSE de fuerza en validación (0,114-0,122 eV/Å) es moderado para un MLIP; conviene verificar la precisión en las magnitudes concretas de interés (energías relativas de defectos, barreras de migración) antes de usarlo en producción.
- Riesgo de extrapolación: cualquier configuración fuera del dominio de entrenamiento (otras composiciones de NVO, temperaturas altas, otras fases de Sn o de carbono) puede producir energías y fuerzas no físicas sin aviso explícito.
- Los coeficientes de difusión solo se reportan para cinco combinaciones sistema-temperatura; no hay datos a otras temperaturas ni para el resto de variantes.
- La model card no documenta sesgos en el sentido estadístico habitual (no aplica a un potencial interatómico), pero sí falta información sobre la composición y el sesgo del dataset de entrenamiento AIMD (cobertura de fases, defectos, temperaturas).
- La fecha de creación indicada en HuggingFace (2026-09-11) es posterior a la fecha actual y sugiere un error en los metadatos; conviene no tomarla como referencia de versionado.
- No hay información sobre el radio de corte, el número de átomos soportado ni el límite práctico de tamaño de sistema.
- No hay resultados de benchmarks comparativos ni métricas de rendimiento fuera del conjunto de validación propio.

## Enlaces

- HuggingFace: https://huggingface.co/Selvauma/nvo-deepmd
- Repositorio del pipeline de generación (HPCA): https://github.com/selvachandrasekaranselvaraj/hpca
- Cita indicada por el autor: Selva Chandrasekaran Selvaraj, University of Illinois Chicago
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con potenciales interatómicos, y se han descartado.
