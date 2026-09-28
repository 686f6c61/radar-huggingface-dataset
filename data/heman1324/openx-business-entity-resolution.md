# Heman1324/openx-business-entity-resolution

## Resumen

OpenX business entity resolution es un paquete de pesos entrenados publicado por el usuario Heman1324 (equipo "Team OpenX") como solucion al Amazon ML Challenge 2026. La tarea del reto es la resolucion de entidades de negocio: encontrar, para cada registro limpio de empresa, sus copias entre registros desordenados procedentes de otras dos fuentes. No se trata de un modelo generativo ni de un LLM, sino de un ensamblado especializado de modelos de filtrado, emparejamiento y puntuacion final.

El ensamblado combina dos familias tecnicas: por un lado, modelos LightGBM que actuan como filtro, matcher y scorer final, y por otro, cross-encoders transformer afinados a partir de `microsoft/mdeberta-v3-base`, ademas de codificadores de recuperacion densa afinados a partir de `intfloat/multilingual-e5-small`. El conjunto suma 1.630.699.080 parametros (1,63B) y se distribuye bajo licencia MIT.

Su relevancia es acotada y practica: sirve como referencia reproducible para pipelines de record linkage empresarial, deduplicacion de bases de datos y master data management. Al estar atado a los datos de entrenamiento de un reto concreto y no incluir el codigo en este repositorio, su uso directo exige el paquete de envio del equipo y una adaptacion al dominio propio. No se documentan idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado hibrido: LightGBM (filtro, matcher, scorer) + cross-encoders transformer derivados de mDeBERTa-v3-base + bi-encoders de recuperacion densa derivados de multilingual-e5-small |
| Parametros totales | 1.630.699.080 (1,63B) en el ensamblado combinado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponibles (los modelos base son multilingues y se mencionan pares sinteticos en frances) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El paquete no es un unico modelo, sino un ensamblado heterogeneo. Se organiza en carpetas: `v7f/model`, `v7j/model` y `v7k/model` contienen tres ejecuciones entrenadas, cada una con un filtro LightGBM, un matcher y un scorer final, ademas de un cross-encoder mDeBERTa afinado. Las carpetas `sfadapt/cross_encoder_v2` y `sfadapt/cross_encoder_v3` son copias del cross-encoder de v7f ajustadas sobre pares sinteticos en frances. Por ultimo, `analysis/dense_retrieval/e5s_ft2` y `analysis/dense_retrieval_raw/e5s_raw` son variantes de multilingual-e5-small afinadas, respectivamente, sobre claves normalizadas de nombre y direccion y sobre texto en bruto de registro.

El entrenamiento se realizo sobre los datos de entrenamiento del Amazon ML Challenge 2026. Los cross-encoders parten de `microsoft/mdeberta-v3-base` (MIT) y los codificadores de recuperacion de `intfloat/multilingual-e5-small` (MIT); el resto son modelos LightGBM. Los dos cross-encoders en frances se ajustaron ademas con pares sinteticos generados a partir de los registros de la "Source 1" francesa del conjunto de test, sin etiquetas. El repositorio no almacena datos del reto y no se documenta el uso de RLHF o DPO, algo coherente con la naturaleza no generativa del sistema.

## Capacidades

- Resolucion de entidades de negocio: identificar que registros desordenados corresponden a un mismo registro limpio de empresa.
- Record linkage entre fuentes heterogeneas: emparejamiento de registros procedentes de dos fuentes distintas.
- Filtrado y puntuacion en cascada: el pipeline combina filtro LightGBM, matcher y scorer final para reducir el espacio de candidatos antes de la decision.
- Recuperacion densa multilingue: los bi-encoders e5 afinados generan representaciones para la busqueda de candidatos, incluyendo variantes sobre claves normalizadas y sobre texto en bruto.
- Cross-encoding fino: los cross-encoders mDeBERTa comparan pares de registros de forma conjunta, no solo por similitud de embeddings.
- Tratamiento especifico de registros franceses: existen adaptaciones entrenadas con pares sinteticos en frances.
- No soporta generacion de texto, razonamiento conversacional, tool calling, function calling ni agentes multi-paso; no es un modelo de lenguaje generativo.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Deduplicacion de bases de datos de empresas: el ensamblado puede emparejar registros duplicados dentro de un CRM o ERP, usando el filtro LightGBM para descartar candidatos improbables y el cross-encoder para confirmar coincidencias.
- Master data management (MDM): integracion de registros de clientes o proveedores procedentes de multiples sistemas en un registro dorado unico, aprovechando la combinacion de recuperacion densa y puntuacion final.
- Enriquecimiento de leads comerciales: cruzar listados internos con fuentes externas para identificar que entradas corresponden a la misma empresa antes de asignar oportunidades de venta.
- KYC y onboarding de clientes: comparar los datos declarados por una empresa con registros de fuentes publicas o de terceros para detectar inconsistencias o posibles suplantaciones.
- Deteccion de fraude y colusion: localizar registros que apuntan a la misma entidad real pese a variaciones en nombre o direccion, util para detectar facturacion duplicada o entidades fantasma.
- Analisis de cadenas de suministro: unificar registros de proveedores que aparecen con formatos distintos en distintas fuentes para obtener una vision consolidada de la red de suministro.
- Limpieza previa a analitica de negocio: normalizar y unificar tablas de empresas antes de alimentar cuadros de mando o modelos de scoring, evitando duplicidades que distorsionan metricas.
- Investigacion en record linkage: servir como referencia o punto de partida para experimentar con arquitecturas hibridas (gradient boosting + transformers) en tareas de resolucion de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El ensamblado suma 1,63B parametros en total, aunque no todos los componentes se cargan necesariamente a la vez. A titulo orientativo, los pesos en FP16 ocuparian alrededor de 3,3 GB y en FP32 alrededor de 6,5 GB, sin contar estados intermedios ni memoria de activaciones.
- Los cross-encoders basados en mDeBERTa-v3-base requieren GPU para una inferencia con latencia razonable; los modelos LightGBM se ejecutan en CPU.
- Caben en GPU de consumo con suficiente VRAM: una RTX 3060 de 12 GB, una RTX 4070/4080/4090 o equivalentes pueden alojar los componentes transformer con margen para lotes moderados. La VRAM exacta depende de cuantos componentes se carguen en paralelo.
- Para despliegues con mayor volumen de emparejamientos, GPU de clase profesional como A100, H100 o L40S permiten procesar lotes grandes de pares en el cross-encoder.
- Opciones de despliegue: al no ser un LLM generativo, no aplican vLLM, llama.cpp ni Ollama en su forma habitual. El despliegue se realiza con el paquete de codigo del equipo (`code/business_entity_resolution`), cargando los cross-encoders mediante PyTorch/Transformers y los modelos LightGBM mediante su runtime nativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de datos de rendimiento de este ensamblado, por lo que una comparativa cuantitativa fiable no es posible. A continuacion se comparan los componentes base utilizados, sin datos de rendimiento del ensamblado final.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenX business entity resolution | Ensamblado LightGBM + cross-encoder + bi-encoder | 1,63B combinados | no disponible | MIT | HuggingFace (pesos; requiere codigo aparte) |
| microsoft/mdeberta-v3-base | Transformer encoder (base de los cross-encoders) | no disponible en la informacion | no disponible | MIT | HuggingFace |
| intfloat/multilingual-e5-small | Bi-encoder de recuperacion densa (base de los retrievers) | no disponible en la informacion | no disponible | MIT | HuggingFace |

No se identifican en la informacion proporcionada alternativas publicas directamente comparables con benchmarks divulgados para esta tarea concreta.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, generacion de texto, codigo ni razonamiento general.
- Dependencia de los datos del Amazon ML Challenge 2026: el comportamiento puede degradarse fuera del dominio y la distribucion de esos datos.
- Los pesos por si solos no bastan; es necesario el paquete de envio del equipo y colocar los directorios bajo `artifacts/experiments/` mediante `python src/download_weights.py`.
- No se documentan idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en produccion con garantias.
- Riesgo de sesgo y de sobreajuste al dominio del reto, asi como de errores de emparejamiento en nombres o direcciones poco frecuentes o muy ruidosos.
- Como cualquier sistema de entity resolution, puede producir falsos positivos (fusionar entidades distintas) o falsos negativos (no detectar duplicados); en contextos sensibles (KYC, fraude) conviene mantener revision humana.
- Los cross-encoders franceses se ajustaron con pares sinteticos sin etiquetas, por lo que su calidad en ese idioma no esta validada con datos etiquetados.
- No se publican resultados de benchmarks, lo que impide estimar su rendimiento relativo frente a alternativas.
- Licencia MIT: permite uso comercial, pero al derivar de mDeBERTa-v3-base y multilingual-e5-small conviene verificar que se respetan las condiciones de esos modelos base (ambos tambien MIT).
- El tamano del repositorio (6,6 GB) y la multiplicidad de componentes implican un coste de almacenamiento y de gestion de versiones no trivial.
- Las busquedas web asociadas no devolvieron informacion tecnica util sobre el modelo; los resultados obtenidos eran irrelevantes y no se han utilizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Heman1324/openx-business-entity-resolution
- Modelo base de los cross-encoders: https://huggingface.co/microsoft/mdeberta-v3-base
- Modelo base de los retrievers: https://huggingface.co/intfloat/multilingual-e5-small
