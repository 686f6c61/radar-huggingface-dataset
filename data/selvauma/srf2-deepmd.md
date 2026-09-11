# Selvauma/srf2-deepmd

## Resumen

Selvauma/srf2-deepmd es un potencial interatómico de red neuronal entrenado con DeepMD-kit para el fluoruro de estroncio (SrF₂), estudiado como recubrimiento protector conductor de aniones F⁻ sobre ánodos de litio metálico. No se trata de un modelo de lenguaje ni de un modelo generativo: es un potencial de machine learning (MLIP) que predice energías y fuerzas atómicas para sustituir a la dinámica molecular ab initio (AIMD) en simulaciones de cientos de nanosegundos. El interés del sistema reside en que la especie móvil relevante es el anión fluoruro, no el Li⁺, de modo que el recubrimiento actúa como conductor de F⁻ y como barrera física y química frente a la superficie de litio metálico, un problema central en baterías de litio metálico y electrolitos fluorados.

El repositorio contiene dos potenciales validados (`model/srf2_aimd_run1.pb`, de 207,1 MB, y `model/srf2_aimd_run2.pb`, de 146,6 MB), ambos entrenados durante 1.000.000 de pasos sobre el mismo conjunto de trayectorias AIMD. Los errores en el conjunto de validación son de 0,00363 y 0,00608 eV/átomo en energía y de 0,0865 y 0,0999 eV/Å en fuerza, respectivamente. La model card indica que existen cinco potenciales distintos en total, pero solo estos dos conservan el fichero `lcurve.out` para poder verificarse; el potencial de producción empleado en las simulaciones de interfaz NVT/NPT multi-nanosegundo (`deepmd/n_opt/mlpot.pb`) no tiene registro de entrenamiento en disco y queda excluido de la selección.

La relevancia actual del modelo es acotada y muy específica: es un potencial monoespecie (un solo sistema químico), de autor único, con 0 descargas y 0 likes en el momento de la consulta, y sin publicación revisada por pares enlazada. Resulta útil para grupos que trabajan en recubrimientos artificiales para ánodos de litio y que necesiten un potencial listo para LAMMPS o ASE con precisión cercana a AIMD, pero no como potencial universal de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Potencial interatómico de red neuronal de DeepMD-kit (grafo congelado de TensorFlow); el descriptor concreto (`se_e2_a`, `se_e2_r`, DPA u otro) no está especificado en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el pipeline descrito incluye una etapa de congelado (`freeze`) y compresión (`compress`) de DeepMD-kit, pero no se documenta el nivel ni el factor de compresión |
| Idiomas soportados | no aplicable (potencial físico, no lingüístico) |
| Licencia | cc-by-4.0, marcada explícitamente en la propia model card como provisional ("TODO: confirm — placeholder") |
| Formato de pesos | `.pb` (grafo congelado de TensorFlow, formato de inferencia de DeepMD-kit); también existen ficheros de entrenamiento en el repositorio |
| Sistema químico cubierto | SrF₂ (fluoruro de estroncio) |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-11 16:15 UTC / 2026-09-11 16:26 UTC |

## Arquitectura y entrenamiento

El flujo de trabajo documentado es: AIMD con VASP y funcional PBE, entrenamiento con DeepMD-kit, congelado del grafo y compresión. Esto sitúa al modelo en la familia de potenciales de red neuronal que aprenden el mapeo entre entornos atómicos locales y la energía/fuerza del sistema, con inferencia posterior en código de dinámica molecular clásica. No se especifican en la información disponible el tipo de descriptor, el radio de corte, el número de capas ni el ancho de la red, ni el número total de configuraciones del conjunto de entrenamiento. El conjunto de datos procede de trayectorias AIMD propias del proyecto (no de bases de datos públicas tipo Materials Project), y el pipeline se generó con la herramienta HPCA del propio autor (`github.com/selvachandrasekaranselvaraj/hpca`).

El autor reporta dos ejecuciones independientes de entrenamiento contra el mismo conjunto de trayectorias, de 1.000.000 de pasos cada una, con errores de validación de energía de 0,00363 y 0,00608 eV/átomo y de fuerza de 0,0865 y 0,0999 eV/Å. La convergencia de estas dos ejecuciones (D de F⁻ de 5,0×10⁻¹¹ cm²/s frente a 4,8×10⁻¹¹ cm²/s en AIMD, y Eₐ de 0,58 frente a 0,57 eV) es el principal argumento de validación que ofrece la model card. No se documentan innovaciones arquitectónicas propias: el modelo se apoya íntegramente en DeepMD-kit como marco de entrenamiento e inferencia.

## Capacidades

- Predicción de energía y fuerzas atómicas para configuraciones de SrF₂ con precisión declarada cercana a AIMD (RMSE de energía inferior a 0,0061 eV/átomo y de fuerza inferior a 0,1 eV/Å en validación).
- Simulación de transporte de aniones fluoruro: el modelo reproduce la difusividad de F⁻ y la energía de activación de migración estimadas por AIMD (4,8×10⁻¹¹ cm²/s y 0,57 eV frente a 5,0×10⁻¹¹ cm²/s y 0,58 eV).
- Simulaciones de dinámica molecular en ensembles NVT y NPT, incluidas ejecuciones de interfaz de varios nanosegundos según la propia model card.
- Estimación de propiedades mecánicas y estructurales: módulo elástico E = 88 GPa, coeficiente de Poisson ν = 0,28, volumen por unidad de fórmula Ω = 19,5 Å³ y densidad ρ = 4,24 g/cm³.
- Aplicable a estudios de interfaz recubrimiento/electrolito y recubrimiento/ánodo de litio metálico (SrF₂ frente a Li metálico).
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: son capacidades no aplicables a un potencial interatómico.
- No se documenta soporte explícito de cargas, polarización, estados excitados ni química fuera del sistema SrF₂.

## Casos de uso

- Simulación de transporte iónico en el recubrimiento: ejecutar dinámica molecular clásica con el potencial en LAMMPS o ASE para obtener coeficientes de difusión de F⁻ y energías de activación a temperaturas y presiones distintas de las cubiertas por AIMD, aprovechando el coste computacional mucho menor del potencial.
- Cribado de espesores y orientaciones de recubrimiento: construir celdas de SrF₂ con distintos espesores sobre una losa de Li metálico y comparar energías de interfaz y estabilidad relativa, algo inviable a la escala de tiempo requerida con AIMD puro.
- Cálculo de barreras de migración de defectos: usar el potencial como motor de fuerzas en cálculos NEB (nudged elastic band) para vacantes y intersticiales de F⁻, tomando la energía de activación de 0,57-0,58 eV como referencia de validación.
- Evaluación de estabilidad térmica y mecánica del recubrimiento: simular calentamiento y compresión en NPT para estudiar expansión térmica, transiciones de fase y respuesta elástica (E = 88 GPa, ν = 0,28) de la capa protectora.
- Estudio de la supresión de dendritas de litio: analizar cómo la rigidez mecánica y la conductividad de F⁻ del recubrimiento afectan a la morfología de deposición de Li en simulaciones de interfaz a escala de nanosegundos.
- Generación de datos de aumento para potenciales universales: usar las trayectorias MLMD como fuente de configuraciones etiquetadas para reentrenar o afinar potenciales de cobertura más amplia, siempre que se verifique la precisión del potencial generador.
- Comparación AIMD frente a MLMD como control metodológico: los dos potenciales validados permiten cuantificar la propagación de error a lo largo de una trayectoria larga, útil para decidir si merece la pena el coste de AIMD adicional.
- Integración en flujos automatizados de simulación: el formato `.pb` de DeepMD-kit se carga directamente en LAMMPS mediante el plugin correspondiente, lo que facilita incluirlo en pipelines de barrido de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de potenciales universales (por ejemplo, comparativas sobre conjuntos tipo MPtrj o desviaciones frente a bases de datos de referencia) en la información disponible. Los únicos datos de rendimiento son los de validación interna del propio autor.

| Métrica | srf2_aimd_run1.pb | srf2_aimd_run2.pb |
|---|---|---|
| RMSE de energía (eV/átomo) | 0,00363 | 0,00608 |
| RMSE de fuerza (eV/Å) | 0,0865 | 0,0999 |
| Pasos de entrenamiento | 1.000.000 | 1.000.000 |
| Tamaño del fichero | 207,1 MB | 146,6 MB |

Comparación entre AIMD y MLMD reportada por el autor:

| Propiedad | AIMD | MLMD (DeepMD) |
|---|---|---|
| Difusividad de F⁻ (cm²/s) | 4,8×10⁻¹¹ | 5,0×10⁻¹¹ |
| Energía de activación Eₐ (eV) | 0,57 | 0,58 |

Propiedades mecánicas y estructurales reportadas: E = 88 GPa, ν = 0,28, Ω = 19,5 Å³ por unidad de fórmula, ρ = 4,24 g/cm³.

Procedencia de los datos: los valores de RMSE se leen directamente del fichero `lcurve.out` de cada ejecución en su paso final de entrenamiento, según indica la model card. No se aportan métricas de velocidad de inferencia (pasos/s, ns/día) ni comparación con potenciales alternativos.

## Requisitos de hardware

- VRAM para cargar los pesos: los ficheros `.pb` ocupan entre 146,6 y 207,1 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060 de 12 GB o RTX 4090 de 24 GB) e incluso en CPU. Esta afirmación se deduce del tamaño de los ficheros, no de una medición publicada.
- La memoria dominante en una simulación real no es la del modelo, sino la de la caja de simulación: número de átomos, radio de corte y estructura de vecinos determinan el consumo de RAM/VRAM.
- GPU recomendadas: no hay recomendaciones publicadas. Cualquier GPU con soporte CUDA válido para la versión GPU de DeePMD-kit es suficiente a nivel de memoria; la elección depende del tamaño del sistema simulado.
- Compatibilidad con GPU de consumo: sí, tanto por tamaño de modelo como por el hecho de que la inferencia de DeepMD-kit dispone de backend GPU.
- Opciones de despliegue: LAMMPS con el plugin de DeePMD-kit (ruta principal implícita en el pipeline del autor), calculadora de ASE, i-PI para dinámica con termostatos avanzados, y utilidades propias de DeepMD-kit (`dp freeze`, `dp compress`, `dp test`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican cifras de pasos por segundo ni de nanosegundos simulados por día en ninguna configuración de hardware.

## Comparativa con modelos similares

La comparación numérica directa no es posible con la información proporcionada, ya que este potencial es específico del sistema SrF₂ y no se han publicado evaluaciones sobre conjuntos de referencia comunes con otros potenciales. Cualitativamente:

| Modelo | Tipo | Alcance | Sistema objetivo | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Selvauma/srf2-deepmd | Potencial DeepMD-kit específico | Monosistema (SrF₂) | Recubrimiento de SrF₂ sobre ánodo de Li | cc-by-4.0 (provisional, según la propia model card) | RMSE de energía 0,00363-0,00608 eV/átomo |
| MACE-MP-0 | Potencial de machine learning universal | Multi-elemento | Materiales inorgánicos en general | no verificado en la información disponible | no disponible |
| CHGNet | Potencial universal basado en grafos | Multi-elemento | Materiales inorgánicos en general | no verificado en la información disponible | no disponible |
| M3GNet / MEGNet | Potencial universal basado en grafos | Multi-elemento | Materiales inorgánicos en general | no verificado en la información disponible | no disponible |

La diferencia relevante no es de rendimiento bruto, sino de especialización: los potenciales universales ofrecen cobertura amplia de elementos a costa de mayor error por átomo y de una validación débil precisamente en sistemas iónicos fluorados poco representados en sus conjuntos de entrenamiento. Este potencial invierte esa relación: cobertura de un único sistema químico con error declarado muy bajo y validación directa contra AIMD del propio sistema, pero sin ninguna evidencia de transferibilidad fuera de SrF₂.

## Limitaciones y advertencias

- Licencia no confirmada: la model card incluye literalmente un comentario "TODO: confirm — placeholder" sobre la licencia cc-by-4.0, lo que la convierte en una declaración provisional. Antes de un uso comercial o de redistribución conviene contactar con el autor para fijar los términos.
- Cobertura química nula fuera de SrF₂: el modelo no debe aplicarse a otros fluoruros, a electrolitos, ni a la propia superficie de litio metálico sin validación previa; no se documenta si los datos AIMD incluyen configuraciones de interfaz con Li.
- Solo dos de los cinco potenciales están validados: los dos incluidos tienen `lcurve.out`; el potencial de producción realmente empleado en las simulaciones de interfaz (`deepmd/n_opt/mlpot.pb`) no tiene registro de entrenamiento y no puede auditarse. Las simulaciones multi-nanosegundo anunciadas se hicieron con un modelo no verificado.
- Ausencia de revisión por pares: no se enlaza ninguna publicación, preprint ni conjunto de datos público. La validación es interna al propio autor y se apoya en la coherencia entre dos ejecuciones de entrenamiento del mismo conjunto AIMD.
- Ausencia de métricas de velocidad y de reproducibilidad: sin datos de throughput ni de hardware de referencia, no es posible planificar costes de simulación a partir de la ficha.
- Limitaciones heredadas del funcional PBE: subestimación del gap, posible ausencia de correcciones de dispersión (no se especifica si se aplicaron), y dependencia del conjunto AIMD para todo lo que el potencial no haya visto.
- Riesgo de extrapolación silenciosa: los potenciales de red neuronal pueden producir predicciones erróneas fuera de la región de entrenamiento sin señal de aviso. Se recomienda validar con `dp test` y comparar contra AIMD en cualquier condición nueva (temperatura, presión, estequiometría, interfaz).
- Metadatos inconsistentes: las fechas de creación y actualización indican 2026-09-11, posteriores a la fecha habitual de consulta; conviene verificar la vigencia real del repositorio antes de citarlo.
- Adopción nula: 0 descargas y 0 likes, sin issues ni discusión pública. No hay evidencia de uso independiente ni de replicación por terceros.
- Idioma: la model card está en inglés; no hay documentación en castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Selvauma/srf2-deepmd
- Repositorio de la herramienta HPCA citada en la model card: https://github.com/selvachandrasekaranselvaraj/hpca
- Ficheros de pesos citados en la model card: `model/srf2_aimd_run1.pb`, `model/srf2_aimd_run2.pb` (dentro del repositorio de HuggingFace)
- Potencial de producción citado sin registro de entrenamiento: `deepmd/n_opt/mlpot.pb` (dentro del repositorio)
- Figuras citadas en la model card: `figures/banner.png`, `figures/lcurve.png` (dentro del repositorio)
- Búsqueda web: los resultados recuperados no guardan relación con el modelo ni con potenciales interatómicos (corresponden al parque Tivoli de Copenhague), por lo que no se aporta ningún enlace adicional procedente de la búsqueda. No se han encontrado papers, blogs ni demos asociados a este modelo en la información disponible.
