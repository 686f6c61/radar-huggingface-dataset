# Ligo-Biosciences/ArtiosBackbone

## Resumen

ArtiosBackbone es un modelo de difusión all-atom para el diseño de esqueletos proteicos (motif scaffolding) desarrollado por Ligo Biosciences. Dado un conjunto reducido de residuos catalíticos o de unión junto con sus ligandos, el modelo genera esqueletos de proteína que mantienen esos residuos en la geometría espacial requerida. Forma parte de la suite Artios, un pipeline completo para el diseño de enzimas de novo que combina difusión all-atom con modelos de Potts para el diseño de secuencias.

El modelo se publica con 137 millones de parámetros, pesos en formato PyTorch (`.pt`) y licencia Apache 2.0. Los pesos corresponden a la media exponencial móvil (EMA, decay 0.9999) tras 280.000 actualizaciones de entrenamiento. Está construido sobre Protenix de ByteDance, lo que le aporta una base arquitectónica orientada a la predicción y generación de estructuras biomoleculares con representación atomística.

Su relevancia radica en que aborda una tarea central en biología computacional: el scaffolding condicionado por motivos funcionales, es decir, generar proteínas que presenten con precisión un sitio activo o de unión definido. A diferencia de modelos de generación de proteínas no condicionada, ArtiosBackbone incorpora tanto residuos como ligandos en el proceso de difusión, lo que lo hace adecuado para el diseño de enzimas y proteínas de unión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión all-atom (basado en Protenix) |
| Parametros totales | 137 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

ArtiosBackbone es un modelo de difusión all-atom, es decir, opera directamente sobre coordenadas atómicas de la proteína y sus ligandos, no sobre representaciones de residuos o de cadena principal. La arquitectura se apoya en Protenix, el framework de ByteDance para predicción estructural biomolecular, adaptado aquí para la generación condicionada por motivos funcionales. El proceso de difusión parte de ruido y va refinando las coordenadas atómicas de forma iterativa hasta producir un esqueleto que satisface las restricciones geométricas impuestas por los residuos del motivo y los ligandos.

Los pesos publicados corresponden a la EMA con decay 0.9999 tras 280.000 actualizaciones de entrenamiento. El repositorio incluye un `training_config.yaml` con la configuración de entrenamiento para referencia, aunque los detalles sobre el volumen de datos, la composición del dataset y si se emplearon técnicas de RLHF o DPO no se especifican en la información disponible. La innovación principal es la incorporación de ligandos en el condicionamiento de la difusión, lo que permite diseñar sitios de unión y centros catalíticos con contexto químico explícito.

## Capacidades

- Generación de esqueletos proteicos condicionados por motivos funcionales (residuos catalíticos o de unión).
- Scaffolding all-atom con incorporación de ligandos en el condicionamiento.
- Generación de múltiples candidatos por ejecución (parámetro `-n` en la CLI).
- Integración con ArtiosPotts para el diseño de secuencias a partir de los esqueletos generados.
- Pipeline completo de diseño de enzimas de novo dentro de la suite Artios.
- No soporta tool calling, function calling ni capacidades de agente.
- No es un modelo lingüístico ni multilingüe; su dominio es exclusivamente biológico-estructural.

## Casos de uso

- Diseño de enzimas de novo: dado un conjunto de residuos catalíticos y su ligando, el modelo genera esqueletos que mantienen la geometría del sitio activo, que después se someten a diseño de secuencia con ArtiosPotts y a validación computacional y experimental.
- Scaffolding de sitios de unión: a partir de residuos de unión conocidos y una molécula objetivo, se generan proteínas candidatas que presentan ese bolsillo de unión, útiles para el diseño de biosensores o proteínas de captura.
- Rediseño de motivos funcionales en nuevos andamios: se puede trasplantar un motivo catalítico de una enzima natural a un esqueleto proteico distinto para explorar nuevas arquitecturas con la misma función.
- Generación de bibliotecas de candidatos para cribado: la CLI permite generar múltiples esqueletos por ejecución (`-n 5`), lo que facilita producir conjuntos de candidatos para evaluación posterior.
- Investigación en ingeniería de proteínas: el modelo sirve como herramienta de exploración en laboratorios que estudian la relación entre estructura, plegamiento y función en motivos catalíticos.
- Integración en pipelines computacionales de diseño: al ser un paquete instalable (`pip install artios`) con pesos descargados automáticamente, se puede incorporar en flujos automatizados de diseño y validación estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 137 M de parámetros el modelo es comparativamente pequeño, pero el coste real depende del número de átomos y del proceso de difusión iterativo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: paquete `artios` (instalable con `uv tool install artios` o `pip install artios`), que descarga los pesos en el primer uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Condicionamiento por ligando | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArtiosBackbone | 137 M | Difusión all-atom para motif scaffolding | Sí | Apache 2.0 | Hugging Face, paquete `artios` |
| RFdiffusion | No disponible | Difusión para diseño de proteínas y motif scaffolding | Parcial (motivos proteicos) | No disponible | Público |
| Chroma | No disponible | Difusión generativa de proteínas con condicionamiento programable | Parcial | No disponible | Público |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Los esqueletos generados son candidatos: la generación por sí sola no demuestra que el diseño se pliegue, una o sea activo; requiere validación computacional y experimental.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos estructurales biológicos, puede heredar sesgos de la distribución de proteínas presentes en su dataset de entrenamiento.
- Riesgo de alucinación estructural: la difusión puede producir geometrías plausibles pero no viables físicamente; es necesario filtrar y validar los candidatos.
- No se detallan limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar el NOTICE por la dependencia de Protenix.
- No se han publicado métricas de éxito experimental (tasa de plegamiento, actividad enzimática) en la información disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica una adopción aún muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Ligo-Biosciences/ArtiosBackbone
- Repositorio Artios: https://github.com/Ligo-Biosciences/artios
- Paper Artios: https://papers.ligo.bio/artios
- Ligo Biosciences: https://ligo.bio
- Protenix (base arquitectónica): https://github.com/bytedance/Protenix
- Formato de entrada de motivos: https://github.com/Ligo-Biosciences/artios/blob/main/docs/motif_input_format.md
- Ejemplo de backbone: https://github.com/Ligo-Biosciences/artios/tree/main/examples/backbone
