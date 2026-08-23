# Sirocco-rt/speculate_agn_emulators

## Resumen

El modelo `Sirocco-rt/speculate_agn_emulators` es un emulador de espectros sintéticos desarrollado por el equipo Sirocco-RT para acelerar la inferencia de parámetros de vientos de núcleos galácticos activos (AGN). Se apoya en el código de transferencia radiativa Monte Carlo Sirocco, que modela los espectros de vientos de discos de acreción. El problema que resuelve es el alto coste computacional de ejecutar Sirocco dentro de bucles de inferencia de parámetros: cada ejecución completa es prohibitivamente cara para un ajuste iterativo. Speculate actúa como biblioteca espectral sintética y emulador, permitiendo una inferencia aproximada pero rápida de los parámetros de viento a partir de una observación.

La relevancia de este modelo reside en su aplicación en astrofísica extragaláctica: permite analizar espectros observados de AGN y estimar parámetros físicos del viento sin ejecutar el código Monte Carlo completo. El modelo está licenciado bajo GPL-3.0 y alojado en HuggingFace, aunque el repositorio no contiene pesos de un modelo de aprendizaje automático convencional, sino los emuladores y bibliotecas espectrales asociadas al proyecto Sirocco. No se dispone de información sobre arquitectura interna, tamaño o metodología de entrenamiento del emulador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Emulador de espectros sintéticos (biblioteca espectral + emulador de interpolación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo no es un transformer ni una red neuronal generativa, sino un emulador físico construido sobre una biblioteca de espectros sintéticos generados con Sirocco, un código de transferencia radiativa Monte Carlo. Sirocco modela el viento de discos de acreción en AGN y otros sistemas astrofísicos, y su ejecución completa dentro de un bucle de inferencia de parámetros es prohibitivamente costosa. Speculate se construye para interpolar sobre esa biblioteca de espectros y devolver una estimación aproximada de los parámetros de salida de una observación sin ejecutar la simulación completa.

No se dispone de información pública sobre el número de espectros generados para la biblioteca, la metodología de interpolación del emulador, ni si se utilizaron técnicas de aprendizaje automático como redes neuronales o procesos gaussianos. Tampoco hay datos sobre el dataset de entrenamiento ni sobre el proceso de validación del emulador.

## Capacidades

- Inferencia rápida y aproximada de parámetros de viento de AGN a partir de un espectro observado.
- Interpolación sobre una biblioteca de espectros sintéticos generados con Sirocco.
- Integración en bucles de inferencia de parámetros, donde el coste de una ejecución completa de Monte Carlo es inviable.
- Uso en astrofísica para el estudio de vientos de discos de acreción en núcleos galácticos activos y otros sistemas.
- No soporta generación de texto, código, visión, tool calling ni capacidades de agente.

## Casos de uso

- Análisis de espectros observados de AGN para estimar parámetros del viento (velocidad, densidad, temperatura) sin ejecutar Sirocco en cada iteración.
- Integración en pipelines de inferencia bayesiana para el ajuste de espectros de cuásares y núcleos activos.
- Exploración rápida del espacio de parámetros de vientos para comparar modelos con observaciones de telescopios espaciales o terrestres.
- Generación de espectros sintéticos de prueba para validar modelos de viento frente a datos observacionales.
- Optimización de campañas observacionales, identificando qué regiones del espacio de parámetros producen firmas espectrales detectables.
- Docencia e investigación en astrofísica computacional, como ejemplo de emuladores aplicados a códigos de transferencia radiativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM, GPU recomendadas ni latencia para el emulador.
- Al ser un emulador ligero, se espera que pueda ejecutarse en CPU estándar, pero no se confirma en la documentación pública.
- Para ejecutar Sirocco completo (el código de Monte Carlo subyacente) se requiere un entorno de computación científica con CPU multicore y suficiente memoria para la malla de simulación, aunque no se detallan requisitos concretos.
- Las opciones de despliegue se limitan a entornos Python con las dependencias del proyecto Sirocco; no se mencionan herramientas como vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado emuladores de espectros de viento de AGN comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- El emulador proporciona resultados aproximados, no exactos; las estimaciones deben interpretarse con cautela en contextos de alta precisión.
- La licencia GPL-3.0 implica que el uso comercial del software y sus derivados debe cumplir con la misma licencia, incluyendo la distribución del código fuente si se redistribuye.
- No se ha publicado información sobre la cobertura del espacio de parámetros de la biblioteca espectral, por lo que la interpolación puede no ser fiable en regiones no cubiertas.
- El modelo está especializado en vientos de AGN y no es aplicable a otros dominios sin adaptación.
- No se dispone de datos sobre errores sistemáticos, sesgos ni calidad de la interpolación en casos límite.
- El repositorio en HuggingFace no contiene documentación técnica detallada ni ejemplos de uso, lo que limita su adopción directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sirocco-rt/speculate_agn_emulators
- Documentación de Speculate: https://sirocco-rt.readthedocs.io/en/latest/speculate.html
- Repositorio GitHub de Speculate: https://github.com/sirocco-rt/speculate
- Repositorio GitHub de Sirocco: https://github.com/sirocco-rt/sirocco
- Organización Sirocco-RT en GitHub: https://github.com/sirocco-rt
