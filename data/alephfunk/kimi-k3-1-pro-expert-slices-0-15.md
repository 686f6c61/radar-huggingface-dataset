# AlephFunk/Kimi-K3.1-Pro-expert-slices-0-15

## Resumen

AlephFunk/Kimi-K3.1-Pro-expert-slices-0-15 es un repositorio de componentes de pesos, no un modelo de lenguaje ejecutable. Contiene los pesos originales empaquetados en MXFP4 y las escalas de los expertos enrutados con índices 0 a 15 de las capas MoE 1 a 92 del modelo moonshotai/Kimi-K3.1-Pro, copiados byte a byte desde la revisión `6d0a0202956796543364d666ab19c6ad1a494ee1` del repositorio original. Cada uno de los 16 bundles `expert-NN.safetensors` contiene 552 tensores y va acompanado de un sidecar JSON; en total suman 8.832 tensores y unos 25,83 GB en el formato de origen.

El interes de este repositorio es de naturaleza forense y de investigacion: permite inspeccionar porciones concretas de los expertos de un MoE de gran escala sin descargar el checkpoint completo, con manifiesto de rangos de bytes, formas, dtypes y hashes SHA-256 verificados. No incluye el backbone compartido, los routers, la atencion, los embeddings ni los pesos de vision, por lo que no puede ejecutarse de forma autonoma bajo ninguna circunstancia.

La relevancia es limitada y muy especifica: sirve para estudiar la estructura interna de Kimi K3.1 Pro, auditar la integridad de los pesos publicados o preparar herramientas de decodificacion de pesos empaquetados. No debe confundirse con una distribucion cuantizada ni con un modelo listo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); solo se distribuyen los pesos de expertos enrutados, sin backbone ni routers |
| Parametros totales | no disponible (el repositorio contiene unicamente los expertos 0-15 de las capas 1-92 del modelo original) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 empaquetado (pesos originales con escalas); no es GGUF, ni Q4 GGUF, ni Q1 |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (etiquetada como `other`), con enlace al texto original de moonshotai |
| Formato de pesos | safetensors (16 bundles de 552 tensores cada uno) mas sidecars JSON, `manifest.json` y `verification.json` |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo original; se limita a distribuir una porcion de sus pesos. Lo que si se describe es la estructura de los artefactos: 16 bundles `bundles/expert-NN.safetensors`, cada uno con 552 tensores en formato MXFP4 empaquetado con sus escalas, correspondientes a los expertos enrutados con indices 0 a 15 en las capas MoE 1 a 92. Los numeros de experto son indices arbitrarios de partida, no etiquetas semanticas ni modelos independientes.

El `manifest.json` registra, por cada tensor, el shard de origen, el rango de bytes, la forma, el dtype y el SHA-256, ademas del SHA-256 de cada bundle. El `verification.json` recoge los resultados del lector y checksum de la extraccion original y tres comprobaciones independientes sobre los bytes de origen. Estas verificaciones garantizan integridad byte a byte, pero no establecen compatibilidad de inferencia, comportamiento ni precision en benchmarks. Para reconstruir un modelo funcional harian falta los pesos no enrutados de Kimi, una implementacion de decodificacion de pesos empaquetados compatible, un motor de inferencia y una politica de enrutamiento.

## Capacidades

- No es un modelo ejecutable: el repositorio no puede generar texto, razonar, escribir codigo ni realizar ninguna tarea de inferencia por si mismo.
- Inspeccion de pesos: permite examinar tensores individuales de expertos enrutados de un MoE de gran escala con metadatos completos de forma y dtype.
- Verificacion de integridad: los hashes SHA-256 por tensor y por bundle permiten auditar la correspondencia con el checkpoint original.
- Estudio de empaquetado MXFP4: util para analizar como se almacenan pesos y escalas en formato empaquetado de 4 bits.
- Base para herramientas de extraccion: el manifiesto de rangos de bytes facilita construir utilidades de reensamblado o comparacion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni capacidades multilingues por si mismo.

## Casos de uso

- Auditoria de integridad de pesos publicados: comparar los SHA-256 del `manifest.json` y `verification.json` con los del checkpoint original para detectar corrupcion o manipulacion durante la distribucion.
- Investigacion sobre empaquetado MXFP4: analizar la relacion entre pesos empaquetados y escalas en expertos reales de un MoE de produccion, sin necesidad de descargar el modelo completo.
- Desarrollo de herramientas de decodificacion: usar los bundles como conjunto de prueba para implementar y validar rutinas que descomprimen pesos MXFP4 a dtypes estandar.
- Analisis de distribuciones de pesos por experto: estudiar estadisticas (medias, varianzas, valores atipicos) de los expertos 0-15 para comparar con otros rangos de indices.
- Docencia y divulgacion: mostrar de forma tangible como se estructura internamente un MoE de gran escala con materiales de tamano manejable (25,8 GB frente al checkpoint completo).
- Verificacion de pipelines de extraccion: reproducir el proceso de extraccion descrito en el manifiesto y comprobar que los rangos de bytes y checksums coinciden, como test de regresion de herramientas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo ejecutable y sus verificaciones de integridad no aportan metricas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no puede ejecutar inferencia por si solo.
- GPU recomendadas: no aplica para inferencia. Para inspeccion o procesamiento de los bundles basta con CPU y almacenamiento; se necesitan al menos 25,83 GB de disco libres para los 16 bundles.
- Compatibilidad con GPU de consumo: el autor indica explicitamente que estos bundles no pueden ejecutarse en una RTX 5080 ni en ninguna otra GPU por si solos.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable; haria falta una implementacion especifica con los pesos no enrutados y una politica de enrutamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Parametros | Contexto | Licencia | Ejecutable |
|---|---|---|---|---|---|
| AlephFunk/Kimi-K3.1-Pro-expert-slices-0-15 | Slice de expertos MoE (16 de 92 capas) | no disponible | no disponible | kimi-k3.1-pro | No |
| moonshotai/Kimi-K3.1-Pro | Modelo completo original | no disponible en la informacion | no disponible | kimi-k3.1-pro | Si (con el stack adecuado) |
| Otras distribuciones cuantizadas GGUF | Pesos cuantizados para inferencia local | no disponible | no disponible | segun autor | Si (con llama.cpp u Ollama) |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo funcional: no genera texto ni ejecuta ninguna tarea; usarlo como si lo fuera daria resultados invalidos.
- Incompleto por diseno: faltan backbone compartido, routers, atencion, embeddings y pesos de vision; sin ellos no hay inferencia posible.
- Formato propietario de empaquetado: los pesos estan en MXFP4 empaquetado y requieren decodificacion compatible; no son GGUF ni Q4 GGUF ni Q1.
- Numeracion arbitraria: los indices 0-15 no tienen significado semantico ni corresponden a especializaciones identificables.
- Licencia restrictiva: la licencia `kimi-k3.1-pro` impone terminos de atribucion y condiciones de uso comercial; cualquier redistribucion o servicio debe respetarlos.
- Sin garantias de comportamiento: las verificaciones de integridad no certifican precision, seguridad ni ausencia de sesgos del modelo original.
- Riesgo de confusion: el nombre puede llevar a pensar que es una version cuantizada o un modelo ligero; no lo es.
- Fecha de publicacion futura en los metadatos (2026-11-04): conviene verificar la vigencia y procedencia antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlephFunk/Kimi-K3.1-Pro-expert-slices-0-15
- Modelo original: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia original: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/6d0a0202956796543364d666ab19c6ad1a494ee1/LICENSE
- Revision de origen: `6d0a0202956796543364d666ab19c6ad1a494ee1`
