# mb860102/tpn009-archive

## Resumen

TPN-009 archive es un repositorio de Hugging Face publicado por el usuario mb860102 que contiene los candidatos intermedios en formato GGUF de las rondas R19 a R21 de su participacion en el torneo TPN-009, junto con los tensores F32 fusionados de atencion y capas densas. Segun la model card, estos pesos son derivados de google/gemma-4-26B-A4B-it, un modelo de arquitectura MoE (mezcla de expertos) de la familia Gemma 4, y estan pensados para encajar en la clase de memoria GPU de 14 GiB.

El dato objetivo disponible es el recuento de parametros obtenido de los tensores safetensors: 25.971.339.550 parametros totales, lo que concuerda con la denominacion comercial "26B" del modelo base. Al tratarse de un MoE con sufijo A4B, la model card sugiere aproximadamente 4 mil millones de parametros activos por token, aunque el repositorio no desglosa esa cifra de forma explicita.

El interes de este repositorio es limitado y muy especifico: no es un modelo listo para produccion, sino un archivo de artefactos intermedios de un proceso de ajuste o cuantizacion orientado a un reto de eficiencia de memoria. Resulta relevante para quienes quieran reproducir o inspeccionar el pipeline de cuantizacion GGUF aplicado a un MoE de esta escala, o comparar los tensores fusionados en F32 con los pesos originales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (derivado de google/gemma-4-26B-A4B-it) |
| Parametros totales | 25.971.339.550 |
| Parametros activos | aproximadamente 4B (inferido del sufijo A4B; no confirmado en el repo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas); tensores de atencion y densos en F32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo (el modelo base es Apache-2.0 segun la model card) |
| Formato de pesos | GGUF y safetensors (tensores F32 fusionados) |

## Arquitectura y entrenamiento

El modelo subyacente es google/gemma-4-26B-A4B-it, un transformer con mezcla de expertos de la familia Gemma 4. El sufijo A4B indica que, pese a los aproximadamente 26 mil millones de parametros totales, solo unos 4 mil millones se activan por token, lo que reduce el coste computacional de inferencia a costa de mantener una huella de memoria cercana a la del modelo completo. La model card del repositorio no aporta detalles sobre el numero de expertos, la estrategia de enrutamiento ni la composicion del dataset de entrenamiento del modelo base.

Respecto al proceso propio de este repositorio, la model card indica que contiene candidatos GGUF de las rondas R19 a R21 y sus tensores F32 fusionados de atencion y capas densas. No se especifica la tecnica de cuantizacion empleada (por ejemplo, Q4_K_M, Q5_K_M o IQ), ni si hubo ajuste fino, destilacion o RLHF en estas rondas. Tampoco se documenta el numero de tokens de entrenamiento ni la composicion del dataset. Toda la informacion sobre el entrenamiento del modelo base queda fuera de este repositorio y deberia consultarse en la model card oficial de google/gemma-4-26B-A4B-it.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" del repositorio sugiere uso en dialogos multi-turno, aunque no hay evaluacion publicada.
- Razonamiento y conocimiento general: heredado del modelo base Gemma 4 26B-A4B-it, sin datos verificables en este repositorio.
- Generacion de codigo y matematicas: previsible por la familia del modelo base, pero no documentado aqui.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base soporta varios idiomas, pero el repositorio no lo declara.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que el formato GGUF puede servirse mediante endpoints compatibles con la API de Hugging Face.

## Casos de uso

- Reproduccion de pipelines de cuantizacion GGUF: el repositorio permite inspeccionar los artefactos intermedios de las rondas R19-R21 y comparar los tensores F32 fusionados con los pesos originales del modelo base, util para validar una estrategia de cuantizacion sobre un MoE de 26B.
- Investigacion sobre eficiencia de memoria en MoE: al estar orientado a la clase de 14 GiB de VRAM, sirve para estudiar como se reparte la huella de memoria entre expertos y capas densas en un modelo A4B.
- Despliegue local en GPU de consumo: los GGUF podrian cargarse con llama.cpp u Ollama en tarjetas con 16-24 GB de VRAM, aunque la calidad de cada ronda no esta evaluada y requiere validacion previa.
- Servido mediante endpoints compatibles: el tag "endpoints_compatible" permite montar el modelo detras de una API tipo OpenAI para pruebas de integracion en aplicaciones conversacionales.
- Comparacion de rondas de ajuste: al conservar candidatos de tres rondas distintas, permite medir el efecto de cada iteracion sobre la perplejidad o la calidad de generacion en un conjunto de validacion propio.
- Base para experimentos de decodificacion especulativa: los tensores F32 fusionados pueden usarse como modelo "draft" o "target" en pruebas de decodificacion especulativa con el modelo base completo.
- Archivo y trazabilidad: util para equipos que quieran documentar la evolucion de un proceso de optimizacion y conservar los artefactos intermedios con fines de auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica una clase de memoria GPU de 14 GiB para el modelo base en el formato del reto, lo que sugiere que los GGUF de este repositorio estan pensados para caber en tarjetas de 16 GB o mas.
- GPU recomendadas: no hay recomendaciones oficiales; por el tamano del repo (54,9 GB) y el objetivo de 14 GiB, encajan RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), L40S, A100 y H100.
- GPU de consumo: si, previsiblemente en RTX 4090, RTX 4080 y RTX 3090 con cuantizaciones agresivas; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y endpoints compatibles con la API de Hugging Face; vLLM y TGI no estan confirmados para estos artefactos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TPN-009 archive (este repo) | 25,97B | aproximadamente 4B (inferido) | no disponible | no disponible (base Apache-2.0) | Hugging Face, GGUF y safetensors |
| google/gemma-4-26B-A4B-it | 25,97B | aproximadamente 4B | no disponible | Apache-2.0 | Hugging Face, pesos oficiales |
| Otros MoE de clase 26B-A4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion fiable es con el modelo base, del que este repositorio es un derivado cuantizado. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio de archivo: contiene candidatos intermedios de un proceso de optimizacion, no una version final validada; la calidad de cada ronda es desconocida.
- Sin evaluacion publicada: no hay benchmarks, ni resultados de perplejidad, ni comparaciones con el modelo base.
- Licencia no declarada en el repositorio: aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en este repo genera incertidumbre para uso comercial; conviene verificar los terminos del modelo base y del autor.
- Idiomas no declarados: no se puede garantizar el soporte multilingue sin consultar la model card de Gemma 4.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica para estos pesos.
- Sesgos: no documentados en este repositorio; heredados del dataset de entrenamiento del modelo base.
- Contexto: no se especifica la longitud de ventana soportada, lo que impide planificar cargas con prompts largos.
- Formato GGUF con variantes no identificadas: es necesario inspeccionar los ficheros para conocer la cuantizacion exacta antes de desplegar.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-27): conviene verificar la integridad y procedencia de los artefactos antes de usarlos en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mb860102/tpn009-archive
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
