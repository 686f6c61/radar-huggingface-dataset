# Aim/league-of-legends-representation-final

## Resumen

El modelo `Aim/league-of-legends-representation-final` es un encoder Transformer compacto desarrollado por Michael Diaz-Stewart (cuenta de HuggingFace `Aim`) que transforma resúmenes estructurados de partidas de League of Legends en embeddings contextuales de jugador y representaciones de partida completa. No es un modelo generativo de lenguaje, sino un modelo de representación tabular especializado en datos de esports: codifica 494 escalares numéricos/binarios, 40 categorías escalares y 42 colecciones de vectores de conteo en tokens de 256 dimensiones.

La relevancia del modelo reside en su enfoque de aprendizaje autosupervisado mediante reconstrucción enmascarada sobre 1.000.000 de partidas de ranked solo/duo (cola 420) de los parches 16.1–16.20, procedentes de las regiones NA, EUW y KR. Con solo 3.644.584 parámetros (incluyendo el decodificador), demuestra que un Transformer pequeño y bien diseñado puede extraer representaciones útiles de datos tabulares estructurados sin necesidad de modelos de lenguaje de gran escala.

Esta es la versión final congelada (epoch 325) del encoder, junto con su decodificador de reconstrucción y el preprocesamiento exacto ajustado sobre el conjunto TRAIN. Se distribuye bajo licencia Apache-2.0 e incluye código fuente independiente en un repositorio de GitHub. El modelo no incluye cabezas de predicción específicas de tarea ni una API de inferencia alojada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-norm de 3 capas, 4 cabezas de atención, 256D de tokens, 1024D en feed-forward de atención, dropout 0.1; 10 tokens de jugador + 1 token de partida; decodificador de reconstrucción de 512D |
| Parametros totales | 3.644.584 (incluyendo el decodificador); 127 tensores en safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa una partida completa con 10 tokens de jugador + 1 token de partida; no se especifica una ventana de contexto en tokens de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural; procesa campos estructurados de partidas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `preprocessing.json` |

## Arquitectura y entrenamiento

El modelo es un Transformer pre-norm de 3 capas con 4 cabezas de atención, tokens de 256 dimensiones y capas feed-forward de atención de 1024 dimensiones. La secuencia de entrada se compone de 10 tokens de jugador (cinco por equipo) más un token de partida, lo que da una secuencia de 11 posiciones. Un decodificador de reconstrucción de 512 dimensiones predice todos los campos modelados. El preprocesamiento incluye escalado numérico con logaritmo con signo ajustado solo sobre TRAIN, compartido entre los diez jugadores para cada sufijo de campo, y codebooks congelados separados para escalares y colecciones.

El objetivo de entrenamiento es la reconstrucción enmascarada, mezclando vistas puente y ocultamiento de jugadores/estadísticas. La función de pérdida combina pérdida gaussiana para numéricos, entropía cruzada binaria para binarios y entropía cruzada categórica/conteo para categorías y colecciones, con reducción equitativa por campo activo y tipo. El conjunto de preentrenamiento consta de 1.000.000 de partidas de ranked solo/duo (cola 420) con duración mínima de 600 segundos, parches 16.1–16.20, de regiones NA, EUW y KR. Los conjuntos de validación y test contienen 50.552 partidas cada uno. Los identificadores y la procedencia de observación de rango se excluyen de los tensores.

## Capacidades

- Codificación de partidas de League of Legends en representaciones vectoriales: produce `player_tokens` de forma [batch, 10, 256], `R0` de [batch, 256], `R2` de 768D (media azul, media roja, token de partida) y `match_token` de 256D.
- Soporte de vistas: `view="completed"` para partida completa, `view="draft"` para exponer solo contexto, picks, bans y roles/summoners de un equipo, y `view="hidden_player"` con `focal=[slot]` para ocultar el registro completo de un jugador antes de las salvaguardas de enmascaramiento obligatorias.
- Barajado determinista intra-equipo controlado por claves de partida (`match_keys`), que nunca entran en el encoder.
- Ordenación de jugadores devueltos: azul y luego rojo, ordenados por ID de campeón dentro de cada equipo.
- No incluye cabezas de predicción específicas de tarea; el modelo proporciona representaciones, no predicciones directas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje.
- No modela fotogramas de línea temporal ni secuencias de eventos.

## Casos de uso

- Análisis de draft y predicción de ganador: usando la vista `draft`, el encoder genera representaciones de la fase de selección que pueden alimentar una cabeza de clasificación para estimar la probabilidad de victoria antes del inicio de la partida, aprovechando la información de picks, bans y roles.
- Evaluación de dominio de línea (lane dominance): las representaciones de jugador en vista `completed` permiten entrenar cabezas que estimen métricas de dominio de línea, con AUC reportado de 0.6493 en TEST para la fuente de un millón de partidas.
- Sistemas de recomendación de campeones: los embeddings de jugador y de partida pueden usarse para calcular similitud entre composiciones y sugerir picks basados en patrones observados en el millón de partidas de entrenamiento.
- Detección de anomalías en partidas: comparando la representación de una partida con la distribución de representaciones del conjunto de entrenamiento, se pueden identificar partidas atípicas (composiciones inusuales, estadísticas anómalas) para revisión manual o sistemas antitrampas.
- Investigación en representación de datos tabulares: el modelo sirve como caso de estudio de aprendizaje autosupervisado con reconstrucción enmascarada sobre datos estructurados, permitiendo reproducir experimentos con el código fuente y el preprocesamiento congelado incluidos.
- Segmentación de jugadores por estilo de juego: agrupando los `player_tokens` de múltiples partidas de un mismo jugador (usando `match_keys` para controlar el barajado), se pueden construir perfiles de estilo y comparar jugadores entre regiones (NA, EUW, KR).
- Análisis de parches y regiones: las representaciones permiten estudiar cómo cambian los patrones de juego entre parches (16.1–16.20) y regiones, aunque el autor advierte que los desplazamientos OCE combinan región, mezcla de parches y tiempo, sin aislar efectos causales.

## Benchmarks y rendimiento

| Tarea | Conjunto | AUC | Notas |
|---|---|---|---|
| Predicción de ganador en draft | TEST fuente (1M) | 0.5758 | Cabezas entrenadas por separado sobre encoder congelado |
| Dominio de línea | TEST fuente (1M) | 0.6493 | Cabezas entrenadas por separado sobre encoder congelado |
| Predicción de ganador en draft | OCE matched-patch | 0.5704 | Pipeline downstream completo, no solo el encoder |
| Dominio de línea | OCE matched-patch | 0.6468 | Pipeline downstream completo, no solo el encoder |

El benchmark de partida completa utilizó cabezas entrenadas por separado y copias fine-tuneadas del modelo. Los resultados son de pipelines downstream completos, no puntuaciones producidas por este encoder aisladamente. En la tarea de campeón con jugador completo oculto, el benchmark favoreció al Transformer supervisado con muchos datos; no se reclama una ventaja universal del aprendizaje autosupervisado. La comparación con la fuente de un millón de partidas usa una sola semilla downstream por método.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (3.644.584 parámetros × 4 bytes ≈ 14,6 MB solo pesos, más overhead de activaciones y decodificador); el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en CPU sin problema. Se ha verificado una comprobación acotada en CPU con partidas sintéticas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: el paquete fuente `league_model` instalable desde GitHub (`pip install "git+https://github.com/MikeDiaz1/league-of-legends-representation-model-public.git"`) más `huggingface_hub` para descargar los pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el modelo es muy pequeño y la inferencia debería ser del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de representación tabular especializados en League of Legends con características equiparables (mismo tamaño, misma tarea, misma licencia y disponibilidad). El autor menciona un Transformer supervisado con muchos datos como alternativa en la tarea de campeón con jugador oculto, pero no se proporcionan sus especificaciones.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a ranked solo/duo (cola 420), parches 16.1–16.20 y regiones NA, EUW y KR; el rendimiento en otros modos, parches futuros o regiones no está establecido.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las representaciones de jugador en vista `completed` contienen información posterior a la partida; sus medias de campeón describen el juego observado, no la fuerza causal, la habilidad del jugador ni picks óptimos de draft.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje natural ni texto multilingüe; procesa campos estructurados. No modela fotogramas de línea temporal ni secuencias de eventos.
- Sensibilidad al orden: el modelo es sensible a la dirección; el barajado fijo da un orden de entrada reproducible, pero permutaciones alternativas arbitrarias pueden no producir embeddings idénticos.
- Restricciones de licencia: código, pesos y preprocesamiento congelado bajo Apache-2.0. League of Legends y nombres relacionados pertenecen a Riot Games; el proyecto es independiente y no está afiliado ni respaldado por Riot Games. La licencia no concede derechos sobre marcas de terceros.
- Caveats para producción: hay una sola inicialización preentrenada; la comparación con la fuente de un millón de partidas usa una sola semilla downstream por método; los desplazamientos OCE combinan región, mezcla de parches y tiempo, sin aislar efectos causales; no se reclama disjunción de jugadores; el rendimiento en parches futuros no está establecido. No se incluyen cabezas de predicción específicas de tarea ni API de inferencia alojada.

## Enlaces

- HuggingFace: https://huggingface.co/Aim/league-of-legends-representation-final
- Código fuente y ejemplos: https://github.com/MikeDiaz1/league-of-legends-representation-model-public
- Arquitectura: https://github.com/MikeDiaz1/league-of-legends-representation-model-public/blob/main/docs/model.md
- Contrato de entrada: https://github.com/MikeDiaz1/league-of-legends-representation-model-public/blob/main/docs/inputs.md
- Release del código fuente (commit): https://github.com/MikeDiaz1/league-of-legends-representation-model-public/tree/3b29bc2cf8969434760e7720d0aaa22334fee4a7
