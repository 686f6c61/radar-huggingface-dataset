# mjablonska/TPayne-spice-harps-interp

## Resumen

TPayne-spice-harps-interp es un emulador espectral basado en un Transformer Payne que predice la intensidad específica emergente I(lambda, mu) de estrellas FGKM en el rango de longitudes de onda del espectrógrafo HARPS (3780-6910 Å). Lo desarrolla Maja Jablonska y forma parte del ecosistema de la herramienta SPICE, dedicada a la modelización de espectros y fotometría de superficies estelares inhomogéneas (manchas, fáculas, regiones activas). El modelo sustituye la síntesis espectral completa con Turbospectrum por una inferencia neuronal rápida, lo que permite generar espectros de alta resolución en una fracción del coste computacional.

La diferencia clave frente a su predecesor `mjablonska/TPayne-spice-harps-v2` es que este modelo toma directamente los parámetros estelares (Teff, log g, [Fe/H], microturbulencia, abundancias de alfa, C, N, O, r y s) sin necesidad de entradas `marcs_*` que indicasen el nodo de atmósfera MARCS. Esto elimina las discontinuidades artificiales que aparecían en las predicciones cuando la rejilla antigua cambiaba de nodo atmosférico (del orden de 30-60 mmag en banda B), reduciéndolas a menos de 0,01 mmag en barridos finos de un solo parámetro.

El modelo se entrena sobre 299.986 espectros LTE de Turbospectrum con atmósferas MARCS interpoladas y está pensado para su uso dentro de SPICE mediante la clase `IntensityPretrainedAemuSpectrumEmulator`. La versión actual es la v1.2.0, que incorpora un ajuste fino específico para suavizar las alas de Balmer en estrellas calientes. No es un modelo de lenguaje: es un emulador numérico de funciones físicas, por lo que sus "capacidades" son de regresión espectral, no de generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Payne (encoder de parámetros estelares a espectro), 192 dimensiones, 6 capas, 8 tokens |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 11 parámetros escalares y salida de 2 canales por longitud de onda en 3780-6910 Å |
| Tipos de cuantizacion | no disponible (pesos JAX/float; requiere JAX_ENABLE_X64=1) |
| Idiomas soportados | no aplica (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | bundle de astro-emulators-toolkit (no safetensors/GGUF estándar) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer Payne: un transformer que mapea un vector de 11 parámetros estelares (`teff`, `logg`, `feh`, `vmicro`, `a`, `c`, `n`, `o`, `r`, `s`, `mu`) a dos canales de salida por longitud de onda (log10 de la intensidad específica con líneas y log10 de la intensidad del continuo), evaluables en cualquier longitud de onda del rango 3780-6910 Å expresada como log10 de angstroms. La configuración es de 192 dimensiones, 6 capas y 8 tokens, con optimizador SOAP (lr 3e-4, schedule coseno, gradient clipping 1) y lotes de 64 espectros x 2048 longitudes de onda muestreadas sobre los píxeles nativos de 0,01 Å.

El entrenamiento se realizó sobre la release v2 del dataset `mjablonska/harps-interp-t02-grid` (299.986 espectros; 295.817 de entrenamiento y 4.096 de validación, excluyendo 73 filas con píxeles de continuo no finitos, todas por debajo de 3200 K). Los espectros se calcularon con Turbospectrum en LTE, atmósferas MARCS interpoladas (esféricas por debajo de log g 3), abundancias solares de Magg et al. 2022 y líneas moleculares de CN y CH por debajo de 4200 Å. El schedule base fue de 500k pasos con reinicio en caliente hasta 1M pasos sobre la rejilla v1, seguido de un ajuste fino de 250k pasos sobre la rejilla v2 (1,25M pasos totales, versión v1.0.0). La v1.1.0 añadió 1,55M pasos adicionales con una penalización de suavidad en las alas de Balmer (H-alfa a H-delta) para estrellas con Teff >= 6500 K, y la v1.2.0 añadió 1M pasos más con la misma pérdida. La validación final da un MSE de 3,5e-7 en log10 de intensidad escalada min-max (v1.1.0: 3,6e-7; v1.0.0: 3,8e-7).

## Capacidades

- Predicción de intensidad específica emergente con líneas y continuo para estrellas FGKM en el rango HARPS (3780-6910 Å).
- Evaluación en cualquier longitud de onda arbitraria dentro del rango, no limitada a una rejilla fija de píxeles.
- Modelización de dependencia angular mediante el parámetro `mu` (coseno del ángulo de visión, 0,01-1), útil para superficies estelares inhomogéneas.
- Soporte de un espacio de parámetros estelares amplio: Teff 3000-8000 K, log g -0,5 a 5,25, [Fe/H] -5 a +1, microturbulencia 1-5 km/s, [alpha/Fe] -0,4 a 0,8, [C/Fe] -1 a 1, [N/Fe] -0,5 a 1, [O/Fe] derivado de alfa más offset, [r/Fe] -0,4 a 1, [s/Fe] -0,5 a 1.
- Integración directa en SPICE mediante `IntensityPretrainedAemuSpectrumEmulator` para síntesis de espectros y fotometría de superficies estelares.
- Predicciones suaves en barridos finos de un parámetro (sin escalones por cambio de nodo MARCS), con residuales por debajo de 0,01 mmag.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un emulador numérico.

## Casos de uso

- Modelización de superficies estelares inhomogéneas en SPICE: el emulador permite generar espectros locales para manchas y fáculas con distintos `mu` y parámetros atmosféricos, algo inviable con Turbospectrum por coste computacional en ajustes iterativos.
- Ajuste de parámetros estelares por síntesis espectral: al evaluar espectros en milisegundos en lugar de segundos, se pueden explorar rejillas amplias de Teff, log g, [Fe/H] y abundancias en pipelines de ajuste tipo MCMC.
- Corrección de actividad estelar en velocimetría radial: la dependencia angular (`mu`) y la modelización de regiones frías permiten construir plantillas de contaminación por manchas para estudios de exoplanetas con HARPS.
- Generación de librerías espectrales sintéticas de alta resolución: se pueden producir grandes volúmenes de espectros FGKM con abundancias no solares para entrenar otros emuladores o comparar con observaciones.
- Estudios de abundancias químicas en estrellas pobres en metales: el rango de [Fe/H] hasta -5 y la inclusión de canales r y s permiten generar espectros de referencia para análisis de estrellas de halo.
- Validación cruzada de códigos de síntesis: las predicciones pueden compararse con Turbospectrum para detectar discrepancias sistemáticas en regímenes concretos (alas de Balmer, regiones moleculares).
- Docencia y divulgación: generación rápida de espectros estelares de ejemplo con parámetros controlados sin necesidad de ejecutar un código de síntesis completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente métricas de validación interna: MSE de 3,5e-7 en log10 de intensidad escalada min-max sobre 4.096 espectros de validación a píxeles fijos (v1.2.0), 3,6e-7 (v1.1.0) y 3,8e-7 (v1.0.0). También se reporta que la estructura espuria en las alas planas de H-beta en estrellas calientes de validación es del 0,12% en v1.2.0 (frente a ~1% en v1.0.0 y 0,3% en v1.1.0).

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo es pequeño (192 dim, 6 capas, 8 tokens), por lo que se espera que quepa en cualquier GPU consumer, pero no se especifica el tamaño exacto en la información disponible.
- GPU recomendadas: no disponible. Dado el tamaño reducido, cualquier GPU con soporte JAX debería ser suficiente.
- Cabe en GPU consumer: previsiblemente sí, aunque no se confirma en la documentación.
- Opciones de despliegue: exclusivamente mediante `astro-emulators-toolkit` 0.2.0.dev0 o superior y la clase `IntensityPretrainedAemuSpectrumEmulator` de SPICE. Requiere `JAX_ENABLE_X64=1` antes de importar JAX. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / rango | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TPayne-spice-harps-interp (v1.2.0) | 192 dim, 6 capas, 8 tokens | 3780-6910 Å, 11 entradas, `mu` | MSE validación 3,5e-7 | no disponible | Hugging Face (bundle astro-emulators-toolkit) |
| mjablonska/TPayne-spice-harps-v2 | 12 entradas (incluye `marcs_*`) | 3780-6910 Å | Escalones de 30-60 mmag en banda B en cambios de nodo | no disponible | Hugging Face |
| Turbospectrum (código de síntesis) | no aplica | Rango completo | Referencia física exacta | no disponible | Código abierto (no en Hugging Face) |

## Limitaciones y advertencias

- La caja de entrada no está uniformemente cubierta: puntos sin un bracket MARCS completo (por ejemplo, estrellas calientes de baja gravedad cerca del límite de Eddington) no están en la rejilla de entrenamiento, por lo que las predicciones allí son extrapolaciones.
- Por debajo de 4200 Å solo se incluyen líneas moleculares de CN (12C14N) y CH (12CH, 13CH); no hay 13CN, C15N, NH ni OH en esa región.
- Estrellas calientes: aunque la v1.1.0 y posteriores reducen la estructura espuria en las alas de H-beta a 0,12-0,3%, sigue siendo un patrón fijo en longitud de onda que no se promedia al combinar muchos espectros de estrellas similares.
- El modelo asume LTE y atmósferas hidrostáticas unidimensionales; no captura efectos tridimensionales ni no-LTE.
- Los espectros no están convolucionados con ningún perfil instrumental ni rotacional; el usuario debe aplicar la convolución adecuada.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido.
- Requiere una versión concreta del toolkit (0.2.0.dev0 o superior); versiones anteriores rechazan la configuración del bundle.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.

## Enlaces

- Hugging Face: https://huggingface.co/mjablonska/TPayne-spice-harps-interp
- Dataset de entrenamiento: https://huggingface.co/datasets/mjablonska/harps-interp-t02-grid
- Repositorio SPICE: https://github.com/maja-jablonska/spice
- Paper SPICE: https://arxiv.org/abs/2511.10998
- Modelo predecesor: https://huggingface.co/mjablonska/TPayne-spice-harps-v2
