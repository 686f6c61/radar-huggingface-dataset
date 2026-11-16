# sidg767/when-to-steer-tiny-aya

## Resumen

`sidg767/when-to-steer-tiny-aya` no es un modelo de lenguaje completo ni un checkpoint afinado, sino un conjunto de artefactos de *steering* en el espacio de activaciones (activation steering) extraídos del modelo congelado `CohereLabs/tiny-aya-global`. El autor publica tres ficheros: una dirección de rechazo en la capa 18, seis vectores condicionales para las capas 8, 12, 16, 18, 20 y 24, y una configuración congelada de desarrollo para el método CAST (Conditional Activation Steering). El objetivo es la investigación en seguridad en tiempo de inferencia: modificar el comportamiento de rechazo del modelo sin tocar sus pesos.

La relevancia es metodológica más que práctica. El trabajo explora dos regímenes: *steering* estático (aplicar una dirección fija con intensidad α=4 en la capa 18) y *steering* condicional (una compuerta seleccionada en desarrollo sobre la capa 24 que decide, por prompt, si conviene intervenir). Los resultados reportados son modestos e imprecisos: el *steering* estático reduce de 2/40 a 0/40 las salidas marcadas como inseguras por un juez clasificador en el conjunto Toxic de 40 ejemplos, pero eleva las tasas de rechazo en el conjunto Hard de 19/40 a 26/40. CAST no mejora la seguridad en el conjunto Toxic retenido (2/40 inseguras).

El repositorio tiene 0 descargas, 0 *likes* y un tamaño declarado de 0.0 GB, coherente con un paquete de tensores pequeños. No se declara licencia del proyecto y el modelo base está sujeto a CC-BY-NC-4.0 de Cohere, lo que restringe el uso comercial de cualquier derivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica al artefacto; vectores de *steering* sobre el *residual stream* del transformer `CohereLabs/tiny-aya-global` |
| Parámetros totales | No disponible (los artefactos son tensores de dirección, no pesos del modelo) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantización | No disponible (los artefactos son tensores `.pt` en coma flotante; no se documenta precisión) |
| Idiomas soportados | No disponible |
| Licencia | No se declara licencia del proyecto; el modelo base es CC-BY-NC-4.0 con requisitos de uso aceptable de Cohere |
| Formato de pesos | `.pt` (PyTorch) para los vectores; `.json` para la configuración de CAST |

## Arquitectura y entrenamiento

Los artefactos se generan con SafeTune, una herramienta *source-available* bajo LSAL v1.2 (no es open source según la OSI). El método no entrena pesos: extrae direcciones del *residual stream* del modelo congelado y las aplica en inferencia. El *steering* estático usa una dirección de rechazo en la capa 18 con intensidad α=4. El método CAST define una compuerta en la capa 24, seleccionada durante desarrollo, que decide si aplicar *steering* en función de la activación del prompt; las condiciones no se aprenden modificando los pesos de Tiny Aya.

Los vectores condicionales cubren seis capas (8, 12, 16, 18, 20, 24), lo que permite analizar cómo varía la direccionalidad de la señal de rechazo en profundidad. No se documenta el dataset de extracción, el número de prompts usados para calcular las direcciones, ni la composición del conjunto de desarrollo. El autor advierte que las revisiones del modelo y del tokenizador no se registraron, por lo que la reproducción exacta de las generaciones originales queda bloqueada.

## Capacidades

- Intervención en tiempo de inferencia sobre un modelo congelado sin reentrenar pesos.
- *Steering* estático de rechazo mediante una dirección única en la capa 18.
- *Steering* condicional (CAST) con compuerta por prompt en la capa 24.
- Análisis por capas: seis vectores condicionales en capas 8, 12, 16, 18, 20 y 24.
- Evaluación de seguridad basada en un juez clasificador sobre conjuntos Toxic y Hard de 40 ejemplos cada uno.
- No proporciona generación de texto, código, matemáticas, visión ni *tool calling* por sí mismo; todas esas capacidades dependen del modelo base Tiny Aya.
- No se documentan capacidades multilingües propias de los artefactos.

## Casos de uso

- Investigación en *activation steering*: reproducir y comparar *steering* estático frente a condicional sobre un modelo congelado para estudiar la linealidad de la dirección de rechazo en distintas capas.
- Análisis de seguridad en tiempo de inferencia: medir el coste en utilidad (aumento de rechazos en el conjunto Hard) de reducir salidas inseguras en Toxic, usando el *trade-off* documentado como referencia.
- Estudio de compuertas condicionales: evaluar si una compuerta seleccionada en desarrollo generaliza a conjuntos retenidos, con el resultado negativo de CAST (2/40 inseguras) como línea base.
- Auditoría de métodos *source-available*: examinar el alcance de SafeTune bajo LSAL v1.2 y las notas de `LICENSE_REVIEW.md` para decidir si el método encaja en un flujo de trabajo interno.
- Docencia y formación: usar los vectores como ejemplo didáctico de intervención sobre el *residual stream* sin modificar pesos, con las advertencias de validez limitada del autor.
- Reproducibilidad parcial: servir como punto de partida para reextraer direcciones con revisiones de modelo y tokenizador registradas, corrigiendo la limitación que bloquea la reproducción exacta.

## Benchmarks y rendimiento

La model card no incluye `model-index` con resultados estándar (MMLU, HumanEval, GSM8K). Los únicos datos son evaluaciones internas del autor sobre conjuntos de 40 ejemplos:

| Configuración | Conjunto Toxic (inseguras) | Conjunto Hard (rechazos) |
|---|---|---|
| Sin *steering* (referencia) | 2/40 | 19/40 |
| *Steering* estático (α=4, capa 18) | 0/40 | 26/40 |
| CAST (compuerta capa 24) | 2/40 (retenido) | No disponible |

El autor califica estas estimaciones como imprecisas y basadas en clasificador, y advierte explícitamente que los vectores no deben describirse como una salvaguarda de seguridad validada de forma general.

## Requisitos de hardware

- No se documenta VRAM ni requisitos de GPU para los artefactos; son tensores de dirección de tamaño reducido (el repo declara 0.0 GB).
- El coste real de cómputo proviene del modelo base `CohereLabs/tiny-aya-global`, cuyos requisitos no se detallan en la información disponible.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma si el modelo base cabe en GPU de consumo; no disponible.
- Opciones de despliegue: no documentadas. El autor remite al README y `REPRODUCIBILITY.md` del repositorio de GitHub para dependencias de ejecución no probadas.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros paquetes de *steering* comparables ni resultados de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo afinado ni un checkpoint completo: es un paquete de vectores de *steering* sobre un modelo congelado.
- Las estimaciones de seguridad son imprecisas, basadas en clasificador y sobre conjuntos de solo 40 ejemplos; no constituyen validación general.
- El *steering* estático reduce salidas inseguras en Toxic pero aumenta los rechazos en Hard (de 19/40 a 26/40), con coste en utilidad.
- CAST no mejora la seguridad en el conjunto Toxic retenido (2/40 inseguras).
- El autor advierte que el enrutamiento (*fresh routing*) no está validado de forma independiente en seguridad ni en utilidad.
- Las revisiones de modelo y tokenizador no se registraron; la reproducción exacta de las generaciones originales está bloqueada.
- El modelo base está sujeto a CC-BY-NC-4.0 y a los requisitos de uso aceptable de Cohere; no se permite re-subir los pesos base como propios del proyecto.
- La autorización de redistribución de los artefactos es una atestación del propietario del 16 de noviembre de 2026, no una revisión legal independiente ni una concesión de licencia.
- No se declara licencia del proyecto; SafeTune es *source-available* bajo LSAL v1.2, no open source según la OSI.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos de los artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/sidg767/when-to-steer-tiny-aya
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de SafeTune en GitHub: no disponible en la información proporcionada (el autor menciona `README`, `REPRODUCIBILITY.md` y `LICENSE_REVIEW.md` sin enlace explícito)
- Paper: no disponible
- Blog o demo: no disponible
