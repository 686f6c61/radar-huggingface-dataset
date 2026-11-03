# da24b046/leak-curber-submission-9

## Resumen

Leak-curber-submission-9 (identificador `da24b046/leak-curber-submission-9`) es un artefacto de inferencia publicado en HuggingFace por el usuario `da24b046`, orientado a la clasificación funcional de reacciones enzimáticas mediante la asignación de un prefijo EC (Enzyme Commission). No se trata de un modelo de lenguaje, sino de un ensemble neuronal especializado que combina representaciones químicas (bits DRFP, descriptores quirales de Morgan y pares de átomos/torsión) con una torre neuronal de características funcionales entrenada desde cero.

El sistema fusiona cuatro componentes con pesos fijos (0,32 / 0,32 / 0,16 / 0,20): un modelo de referencia propio S8, un modelo fusionado, un modelo disperso y una nueva torre de prefijo EC sobre 2048 bits DRFP y descriptores quirales. Sobre la mezcla ponderada de probabilidades neuronales (75%) se aplica un 25% de distribuciones de vecinos más cercanos (coseno, softmax con temperatura 0,02) y un ajuste jerárquico L3/L2 con parámetros beta 0,1 y gamma 0.

El repositorio (0,9 GB) contiene exclusivamente código de inferencia, pesos y estadísticas aprendidas, junto con índices de vectores de entrenamiento y anotaciones, empaquetado para ejecución offline en Linux amd64 con 2 CPU y 16 GiB de RAM, sin PyTorch ni GPU. La información pública sobre arquitectura interna, datos de entrenamiento y licencia es muy limitada; el autor advierte explícitamente que no reclama ninguna puntuación oficial ni estimación de generalización independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos neuronales sobre descriptores químicos (DRFP, Morgan quiral, pares de átomos/torsión) con torre MLP 14336→1024→256 y clasificación por coseno de prefijo EC; combinación con k-NN (5 vecinos) y ajuste jerárquico L3/L2 |
| Parámetros totales | no disponible (el repo pesa 0,9 GB; la torre nueva tiene 14336→1024→256 entradas/salidas, pero no se detalla el total) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación, no de lenguaje) |
| Tipos de cuantización | float16 en el round-trip de entrenamiento e inferencia; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible (se retiene la licencia MIT de DRFP, pero no se especifica la licencia global del artefacto) |
| Formato de pesos | no disponible (pesos y estadísticas aprendidas incluidas en el contenedor; no se indica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

El sistema es un ensemble de clasificación de reacciones enzimáticas. La entrada se representa mediante 2048 bits DRFP (reaction fingerprint), conteos logarítmicos quirales de Morgan para reactivos, productos, ganados y perdidos, y cambios quirales de pares de átomos y torsiones. Los bloques y vectores completos se normalizan L2 y se someten al mismo round-trip float16 en entrenamiento e inferencia. La torre nueva, de 14336→1024→256, se entrena desde cero con clasificación por coseno de prefijo EC.

La combinación final es un 75% de probabilidades neuronales ponderadas y un 25% de distribuciones de vecinos (5 vecinos, coseno, softmax con temperatura 0,02), seguida de un ajuste jerárquico L3 con beta 0,1 y L2 con gamma 0. Cada voto de vecino de entrenamiento se reparte a partes iguales entre sus anotaciones distintas. El modelo nuevo se entrenó durante 40 épocas fijas con semilla 3410. El autor afirma que todos los codificadores y vectores EC de este miembro se entrenaron desde cero, sin usar pesos de repositorios de referencia ni datos externos.

## Capacidades

- Clasificación funcional de reacciones enzimáticas: asigna un prefijo EC completamente especificado y permitido a cada reacción de entrada.
- Representación química multi-vista: combina DRFP, descriptores quirales de Morgan y cambios de pares de átomos/torsión.
- Ensemble con k-NN: mezcla probabilidades neuronales con distribuciones de vecinos cercanos para robustecer la predicción.
- Ajuste jerárquico EC: aplica correcciones L3 y L2 sobre la distribución de prefijos.
- Deduplicación de entradas: reacciones crudas idénticas conservan el primer ID existente.
- Inferencia offline determinista: ejecutable sin red, sin GPU y sin PyTorch, con NumPy/SciPy/RDKit.
- Salida estructurada: JSONL con exactamente los campos `id` y `prediction`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Anotación automática de reacciones enzimáticas en bases de datos: el modelo procesa un Parquet de reacciones y devuelve un prefijo EC por entrada, útil para pre-etiquetar grandes catálogos antes de revisión manual.
- Curado de datasets de biología computacional: permite filtrar y agrupar reacciones por familia EC, facilitando la construcción de conjuntos de entrenamiento equilibrados.
- Priorización en pipelines de descubrimiento enzimático: asigna una clase funcional probable a reacciones candidatas para orientar experimentos de validación.
- Integración en flujos offline y air-gapped: al ejecutarse con red deshabilitada y sin GPU, encaja en entornos con requisitos estrictos de confidencialidad.
- Enriquecimiento de repositorios internos: añade anotaciones EC a registros históricos de reacciones para mejorar la búsqueda y la interoperabilidad.
- Evaluación comparativa de representaciones químicas: sirve como referencia reproducible (semilla 3410, 40 épocas) para estudiar el impacto de descriptores DRFP y quirales en la clasificación EC.
- Despliegue en infraestructura modesta: con 2 CPU y 16 GiB de RAM puede ejecutarse en contenedores ligeros dentro de clústeres compartidos.

## Benchmarks y rendimiento

| Conjunto | Random L4 | Chemical L4 |
|---|---|---|
| Desarrollo | 0,65180590 | 0,34828660 |
| Diagnóstico expuesto | 0,66040044 | 0,42056009 |
| Controles S8 | 0,65745776 | 0,41553633 |
| S8 oficial (reportado por el usuario, no verificado) | 0,6050525881625077 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje. El autor advierte que los conjuntos de desarrollo y diagnóstico estuvieron expuestos históricamente y que no reclama una estimación de generalización independiente ni una puntuación oficial S9.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es solo CPU (sin PyTorch ni GPU).
- RAM: 16 GiB según las instrucciones del autor.
- CPU: 2 núcleos suficientes para la ejecución documentada.
- GPU recomendadas: no aplica; no se requiere GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma: Linux amd64, Python en `/usr/local/bin/python`, con NumPy, SciPy y RDKit.
- Despliegue: contenedor Docker (`docker build --platform linux/amd64 -t enzyme-s9 .`) con red deshabilitada y montajes de directorios de entrada/salida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leak-curber-submission-9 | Ensemble químico + k-NN para prefijo EC | no disponible | no aplica | no disponible | HuggingFace (`da24b046/leak-curber-submission-9`) |
| S8 (referencia propia del autor) | Modelo de referencia del mismo autor | no disponible | no aplica | no disponible | Uso interno en el ensemble |
| Alternativas públicas de clasificación EC | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la misma categoría; los datos de S8 proceden del propio autor y no están verificados de forma independiente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta conversación ni agentes.
- El autor declara explícitamente que no reclama ninguna puntuación oficial S9 ni una estimación de generalización independiente o no sesgada.
- Los conjuntos de desarrollo y diagnóstico estuvieron expuestos históricamente; los resultados pueden estar contaminados.
- La puntuación oficial S8 (0,6050525881625077) es reportada por el usuario y no ha sido verificada de forma independiente.
- La licencia global del artefacto no está especificada; solo se retiene la licencia MIT de DRFP.
- El repositorio excluye reacciones crudas, Parquet de datos, checkpoints de experimentos, predicciones y notas de estudio, lo que limita la reproducibilidad completa.
- El agrupamiento no canonicaliza ni normaliza las entradas; reacciones equivalentes pero escritas de forma distinta pueden recibir tratamientos diferentes.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas por no ser un modelo lingüístico.
- El rendimiento en la dimensión "chemical" (0,34828660 en desarrollo) es notablemente inferior al de la dimensión "random", lo que sugiere dificultades en casos químicamente exigentes.

## Enlaces

- HuggingFace: https://huggingface.co/da24b046/leak-curber-submission-9
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
