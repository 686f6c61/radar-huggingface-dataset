# Quenlla/columnist

## Resumen

Columnist es un modelo fundacional desarrollado por Quenlla para el análisis de mapas de osu!mania en modalidad 4K (cuatro teclas). Se trata de un encoder tipo transformer de 256 dimensiones y 6 capas, preentrenado sin etiquetas sobre 62.161 mapas y posteriormente adaptado mediante ajuste fino a tareas concretas de clasificación y predicción de dificultad. El modelo aborda un problema específico del ecosistema osu!: la caracterización automática de patrones rítmicos y la estimación de dificultad de mapas creados por la comunidad.

La relevancia del modelo reside en su enfoque unificado: en lugar de pipelines separados para cada tarea, Columnist ofrece una red compartida que sirve simultáneamente para búsqueda por similitud, predicción de dificultad (estrellas), etiquetado de patrones y lectura por nota. El ajuste fino se realizó sobre 8.453 mapas etiquetados, combinando etiquetas de hojas de comunidad, etiquetas de usuario de osu! y slots de mappools de torneos.

El modelo se distribuye en cuatro variantes (base, embed, joint y lens) bajo licencia CC BY 4.0 para pesos y Apache-2.0 para el código. Es una herramienta de investigación, no un instrumento oficial de osu!, y no está pensada para sustituir decisiones de Beatmap Nominators de forma autónoma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (6 capas, 256 dimensiones) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por ventanas y filas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrada no textual: timing en milisegundos y scroll visible) |
| Licencia | CC BY 4.0 (pesos, etiquetas y model card); Apache-2.0 (código) |
| Formato de pesos | PyTorch (library_name: pytorch); tamaño del repo 0.1 GB |

## Arquitectura y entrenamiento

Columnist es un encoder transformer de 6 capas con dimensión oculta de 256, diseñado para procesar secuencias de notas de mapas osu!mania 4K. La entrada utiliza únicamente timing en milisegundos y scroll visible, sin información de snap ni de rejilla BPM, lo que obliga al modelo a aprender representaciones a partir de la señal temporal cruda. El preentrenamiento se realizó sin etiquetas sobre 62.161 mapas 4K (59.361 únicos), de los cuales solo se publican los identificadores.

El ajuste fino se llevó a cabo sobre 8.453 mapas etiquetados, usando etiquetas de hojas de comunidad, etiquetas de usuario de osu! y slots de mappools de torneos. El modelo se adapta a cuatro variantes: `columnist-base` (encoder preentrenado), `columnist-embed` (encoder sin etiquetas para búsqueda de mapas similares), `columnist-joint` (ajustado para 31 etiquetas de patrón, categorías, dificultad global, dificultad por ventana y por fila) y `columnist-lens` (lectura de patrones por nota para la página de jugador). La calibración de dificultad sigue una relación lineal de estrellas ≈ 3,886 + 0,140 × score.

## Capacidades

- Clasificación de mapas en 11 categorías y 20 etiquetas de patrón (variante `columnist-joint`).
- Predicción de dificultad global en estrellas, con calibración lineal.
- Predicción de dificultad por ventana y por fila dentro del mapa.
- Búsqueda de mapas similares mediante embeddings sin etiquetas (variante `columnist-embed`).
- Lectura de patrones por nota individual (variante `columnist-lens`).
- Procesamiento de secuencias de notas con timing en milisegundos y scroll visible.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto: es un encoder especializado, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda de mapas similares: usando `columnist-embed`, un jugador o mapper puede introducir un mapa de referencia y recuperar mapas con patrones rítmicos parecidos, útil para descubrir contenido afín a sus gustos sin depender de etiquetas manuales.
- Estimación automática de dificultad: `columnist-joint` predice la calificación en estrellas con un error absoluto medio de 0,33 estrellas tras calibración, lo que permite priorizar mapas en colas de revisión o filtrar por rango de dificultad.
- Etiquetado de patrones para mappools: el modelo asigna 31 etiquetas de patrón y categorías, facilitando la organización de mappools de torneos y la selección de mapas por estilo.
- Análisis por ventana y por fila: la predicción de dificultad a nivel de ventana y fila permite identificar secciones concretas problemáticas dentro de un mapa, útil para feedback a mappers sobre picos de dificultad.
- Lectura por nota en la página de jugador: `columnist-lens` ofrece un desglose de patrones nota a nota, que puede integrarse en herramientas de análisis de rendimiento o visualización de partidas.
- Investigación sobre representación de ritmo: al entrenarse sin snap ni rejilla BPM, el modelo sirve como banco de pruebas para estudiar cómo se aprenden estructuras rítmicas a partir de timing crudo.
- Filtrado previo en pipelines de revisión comunitaria: como herramienta de apoyo (no decisoria) para Beatmap Nominators, puede señalar mapas con dificultad o patrones atípicos que requieran revisión manual.

## Benchmarks y rendimiento

Resultados publicados en la model card (validación cruzada de 5 folds, agrupada por canción, AP medio):

| Modelo / tarea | Categorías (AP) | Etiquetas (AP) |
|---|---|---|
| columnist-base ajustado (tags y categorías) | 0,703 | 0,581 |
| columnist-joint (tags, categorías y dificultad) | 0,698 | 0,578 |
| Pipeline previo de estadísticas boosted | ~0,75 | ~0,60 |

| Métrica de dificultad | Valor |
|---|---|
| Correlación de Spearman con star rating oficial | 0,94 |
| Error absoluto medio tras calibración lineal | 0,33 estrellas |
| Precisión de ordenación en rondas de torneo held-out | 0,95 |

El pipeline anterior de estadísticas boosted obtiene mejores resultados en categorías (aproximadamente 0,75 / 0,60), pero Columnist sacrifica parte de esa precisión a cambio de una única red compartida que también cubre similitud, dificultad y lectura por nota.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del repo (0,1 GB) es plausible, pero no se especifica.
- Opciones de despliegue: no disponible (solo se indica PyTorch como librería).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Columnist | Encoder transformer para osu!mania 4K | no disponible (6 capas, 256d) | no disponible | CC BY 4.0 / Apache-2.0 | Hugging Face |
| Pipeline de estadísticas boosted (referencia interna del autor) | Estadísticas manuales | no aplica | no aplica | no disponible | No distribuido como modelo |
| Otros modelos fundacionales para rhythm games | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información disponible otros modelos comparables de la misma categoría (foundation models para charting de rhythm games) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta osu!mania 4K; no cubre otras modalidades ni números de teclas.
- Requiere al menos 64 filas por mapa; mapas más cortos no son procesables.
- Los patrones de notas largas (long notes) son el área más débil del modelo.
- Las etiquetas provienen de etiquetas de usuario y slots de mappool, no de verdad terreno, por lo que pueden ser ruidosas o inconsistentes.
- Es una herramienta de investigación, no una herramienta oficial de osu!, y no debe usarse de forma autónoma para decisiones de Beatmap Nominators.
- Riesgo de sesgo derivado de la distribución de la comunidad que generó las etiquetas (mappools de torneos, etiquetas de usuario).
- No se redistribuyen los mapas: solo se publican los identificadores; los mapas siguen siendo propiedad de sus mappers.
- El uso comercial de los pesos está permitido por CC BY 4.0 con atribución, pero el uso de datos de osu! se ampara en uso justo de investigación, lo que puede limitar escenarios comerciales.
- No hay información publicada sobre cuantizaciones, latencia o requisitos de hardware, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quenlla/columnist
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
