# RussellKwon/UMA_s1p1_oc20_fine-tuned_WSO

## Resumen

UMA_s1p1_oc20_fine-tuned_WSO es un potencial interatómico aprendido (MLIP, machine-learned interatomic potential) especializado en química de tungsteno-azufre-oxígeno, desarrollado por Jaehong Kwon, Andrew S. Rosen y David B. Graves (Universidad de Princeton y Princeton Plasma Physics Laboratory). Se obtiene por fine-tuning del backbone UMA-S 1.1 de Meta FAIR (facebook/UMA) sobre la cabeza de tarea oc20, y se distribuye como state dict de PyTorch para cargarse con la librería fairchem. No es un modelo de lenguaje: es un modelo de energía potencial que predice energía, fuerzas y tensión de configuraciones atómicas.

El problema que resuelve es la simulación de la interacción plasma-superficie en WS₂ sometido a bombardeo de iones de oxígeno (O⁺ y O₂⁺), un escenario relevante para procesos de grabado y deposición en fabricación de semiconductores. Los potenciales clásicos no describen bien la ruptura de enlaces y la oxidación, mientras que la DFT es demasiado costosa para dinámica molecular a gran escala; este modelo ofrece precisión cercana a DFT a un coste computacional muy inferior.

El fine-tuning se realizó sobre 2.610 configuraciones etiquetadas con DFT (PBE+U+D3+spin) congelando las capas 2 y 4, lo que deja 73.434.657 parámetros entrenables (50,1%) frente a 73.131.520 congelados (49,9%). Es el modelo de producción usado en las simulaciones del artículo asociado (arXiv:2606.21632). La licencia es la FAIR Chemistry License v1, no una licencia open source genérica, y el modelo base está restringido (gated).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone UMA-S 1.1 (`facebook/UMA`) con cabeza de tarea `oc20`; topologia interna no detallada en la informacion disponible |
| Parametros totales | 146.566.177 (73.434.657 entrenables + 73.131.520 congelados), derivado de los porcentajes de la model card |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No aplica (modelo de potencial interatomico; opera sobre configuraciones atomicas, no sobre secuencias) |
| Tipos de cuantizacion | No disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | FAIR Chemistry License v1 (`license: other`, `license_name: fair-chemistry-license`) |
| Formato de pesos | State dict de PyTorch (`.pt`, fichero `best_checkpoint_conservative.pt`) cargado sobre el modelo base |
| Modelo base | `uma-s-1p1` (`facebook/UMA`), repo con acceso restringido |
| Cabeza de tarea | `oc20` |
| Objetivos de entrenamiento | Energia, fuerzas y tension (stress) |
| Fuerzas | Conservativas, calculadas como gradiente de la energia |
| Metodo de fine-tuning | Congelacion de capas (capas 2 y 4 congeladas) |
| Libreria | `fairchem` |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-06-24 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna del backbone UMA-S 1.1, mas alla de que se trata de un modelo universal para atomos (Universal Models for Atoms, UMA) de Meta FAIR Chemistry al que se le aplica la cabeza de tarea `oc20`. Sobre ese backbone se realiza un fine-tuning por congelacion de capas, dejando fijas las capas 2 y 4 y entrenando el resto: 73.434.657 parametros entrenables (50,1%) frente a 73.131.520 congelados (49,9%). Los objetivos de supervision son energia, fuerzas y tension, con fuerzas conservativas derivadas del gradiente de la energia.

El conjunto de entrenamiento consta de 2.610 configuraciones etiquetadas con DFT, con particion 90/10 de entrenamiento y validacion. Las etiquetas se calcularon al nivel PBE+U+D3+spin; dado que la correccion D3 esta incluida en las etiquetas, no es necesaria ninguna correccion D3 en tiempo de inferencia. La quimica cubierta son sistemas W-S-O: 2H-WS₂ y las estructuras desordenadas y oxidadas que se generan por bombardeo de iones O⁺ y O₂⁺. El referenciado de energias combina referencias de atomo aislado por elemento calculadas al mismo nivel de teoria con calores de formacion tabulados, y los objetivos de energia, fuerza y tension se estandarizan a la escala OC20 reutilizando los coeficientes de regresion lineal y el RMS de fuerza de OC20. No se documenta uso de RLHF, DPO ni tecnicas de alineamiento, que no aplican a este tipo de modelo.

## Capacidades

- Prediccion de energia total de configuraciones atomicas de sistemas W-S-O.
- Prediccion de fuerzas atomicas conservativas (gradiente de la energia) sobre cada atomo.
- Prediccion de tension (stress) del sistema, relevante para relajacion de celdas y propiedades mecanicas.
- Simulacion de dinamica molecular de 2H-WS₂ y de estructuras oxidadas/desordenadas.
- Modelado de la interaccion plasma-superficie bajo bombardeo de O⁺ y O₂⁺.
- Uso directo en inferencia sin correccion D3 adicional.
- Integracion con objetos `ASE Atoms` mediante `FAIRChemCalculator` con `task_name="oc20"`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling, function calling ni comportamiento de agente.
- No tiene capacidades multilingues (no es un modelo de lenguaje).
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Simulacion de dano por bombardeo ionico en WS₂: el modelo permite ejecutar dinamica molecular con iones O⁺ y O₂⁺ sobre la superficie, capturando ruptura de enlaces y formacion de especies oxidadas que un potencial clasico no reproduciria, a un coste muy inferior al de la DFT.
- Estudio de la oxidacion de 2H-WS₂: se puede emplear para caracterizar la progresion de la oxidacion y la aparicion de estructuras desordenadas, ya que el conjunto de entrenamiento cubre explicitamente esas configuraciones.
- Calculo de propiedades mecanicas y estructurales: la prediccion de tension permite relajar celdas y estimar respuesta mecanica de capas de WS₂ oxidadas.
- Modelado de procesos de grabado en fabricacion de semiconductores: WS₂ es un material relevante como capa bidimensional, y las condiciones de plasma de oxigeno son habituales en etapas de grabado y limpieza; el modelo se puede usar para explorar condiciones de proceso sin recurrir a DFT por cada configuracion.
- Generacion de datos y aprendizaje activo: al ser barato de evaluar comparado con DFT, sirve para muestrear configuraciones, identificar regiones de alta incertidumbre y priorizar calculos DFT posteriores que amplien el dominio de entrenamiento.
- Integracion en flujos multiescala: puede actuar como capa atomistica dentro de modelos de proceso que necesiten rendimientos de erosion, coeficientes de sputtering o perfiles de oxidacion como entrada.
- Relajacion de estructuras y cribado de configuraciones candidatas: permite descartar rapidamente geometrias poco probables antes de un calculo DFT costoso.
- Estudio de mecanismos de retencion o reflexion de oxigeno en la superficie, mediante trayectorias de dinamica molecular con las fuerzas predichas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card detalla el metodo de fine-tuning, el volumen de datos (2.610 configuraciones, particion 90/10) y el nivel de teoria de las etiquetas (PBE+U+D3+spin), pero no incluye valores de error de validacion (MAE de energia, fuerza o tension) ni comparaciones numericas con otros potenciales o con DFT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 146.566.177 parametros, los pesos en FP32 ocupan aproximadamente 0,59 GB; el consumo real depende del numero de atomos por configuracion y del batching. En simulaciones de celdas pequenas (cientos de atomos) el uso se mantiene en el rango de 1 a 3 GB, y crece con el tamano del sistema.
- El repositorio ocupa 1,2 GB, un tamano coherente con pesos, estados de optimizador y/o media exponencial de pesos (EMA) incluidos en el checkpoint.
- GPU recomendadas: cualquier GPU con CUDA y suficiente memoria para el sistema simulado. No se especifican modelos concretos en la informacion disponible; por tamano del modelo, GPU de consumo como las de la gama RTX son suficientes desde el punto de vista de pesos.
- Cabe en GPU de consumo: si, por el numero de parametros y el tamano de los pesos en FP32; el factor limitante es el numero de atomos por simulacion y la longitud de la trayectoria, no el modelo en si.
- Opciones de despliegue: `fairchem` de Meta (requerido), cargando el state dict sobre el modelo base `uma-s-1p1` y usando `FAIRChemCalculator` con `task_name="oc20"` sobre objetos ASE. Opciones como vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Es necesario acceso autenticado al repositorio restringido `facebook/UMA` para poder cargar el resto del modelo.
- Latencia y throughput: no disponible. La informacion proporcionada no incluye medidas de tiempo por paso de dinamica molecular ni de atomos por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos de modelos comparables, por lo que la comparacion se limita a categoria y proposito. La informacion disponible tampoco incluye especificaciones de los modelos alternativos.

| Modelo | Categoria | Especializacion | Licencia | Datos comparativos |
|---|---|---|---|---|
| UMA_s1p1_oc20_fine-tuned_WSO | MLIP con fine-tuning sobre backbone UMA | W-S-O con bombardeo de O⁺ y O₂⁺ | FAIR Chemistry License v1 | No disponible |
| UMA-S 1.1 (`facebook/UMA`) | MLIP universal (modelo base) | Quimica general de materiales | FAIR Chemistry License (repo restringido) | No disponible en la informacion aportada |
| Otros MLIP universales de la misma categoria (por ejemplo MACE-MP-0, CHGNet, M3GNet) | MLIP universales | Quimica general de materiales | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio de aplicabilidad estrecho: el modelo se ha entrenado exclusivamente con 2.610 configuraciones de sistemas W-S-O (2H-WS₂ y estructuras oxidadas por O⁺ y O₂⁺). Las predicciones fuera de esa quimica o de esas condiciones no estan validadas y pueden ser poco fiables.
- Conjunto de datos pequeno: 2.610 configuraciones DFT con particion 90/10 implica un volumen reducido para un potencial interatomico; es probable un sobreajuste a las condiciones muestreadas.
- Riesgo de extrapolacion: al ser un modelo ajustado sobre un espacio de configuraciones limitado, puede producir energias o fuerzas no fisicas en regiones alejadas de la distribucion de entrenamiento, sin senalizacion explicita de incertidumbre.
- Nivel de teoria fijo: las etiquetas corresponden a PBE+U+D3+spin. No se documenta validacion frente a otros funcionales ni frente a datos experimentales.
- Sin correccion D3 en inferencia: la correccion esta incluida en las etiquetas de entrenamiento. Aplicar una correccion D3 adicional en inferencia seria un error metodologico.
- Restricciones de licencia: se distribuye bajo FAIR Chemistry License v1, no es open source generico. Cualquier redistribucion del modelo o de un derivado debe mantener la misma licencia (clausula 1.b.i) y reconocer el uso de UMA en cualquier publicacion (clausula 1.b.ii).
- Modelo base restringido: requiere acceso autenticado al repositorio `facebook/UMA`; sin ese acceso el state dict no es utilizable.
- Atribucion obligatoria: el uso en publicaciones exige citar el modelo, el articulo de UMA y el articulo W-S-O.
- No es un modelo de lenguaje: no genera texto ni codigo, no soporta herramientas ni agentes. Cualquier expectativa de ese tipo es incorrecta.
- Sin datos de error publicados: no hay MAE de energia, fuerza o tension en la informacion disponible, lo que dificulta evaluar la idoneidad para produccion sin validacion propia.
- Riesgo de sesgo fisico: la cobertura de configuraciones depende de como se generaron las 2.610 estructuras; condiciones de bombardeo con energias de ion, angulos de incidencia o flujos distintos a los muestreados pueden estar mal representados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RussellKwon/UMA_s1p1_oc20_fine-tuned_WSO
- Modelo base UMA: https://huggingface.co/facebook/UMA
- Articulo asociado W-S-O: https://arxiv.org/abs/2606.21632
- Biblioteca fairchem: https://github.com/facebook/fairchem
- DOI del modelo: https://doi.org/10.57967/hf/10358
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/RussellKwon/UMA_s1p1_oc20_fine-tuned_WSO/blob/main/LICENSE
- ORCID Jaehong Kwon: https://orcid.org/0000-0002-2792-2772
- ORCID Andrew S. Rosen: https://orcid.org/0000-0002-0141-7006
- ORCID David B. Graves: https://orcid.org/0000-0002-2288-6768

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo, la quimica W-S-O ni los potenciales interatomicos; los resultados obtenidos corresponden a noticias de sucesos sin relacion con el contenido de esta ficha y se han descartado como fuentes.
