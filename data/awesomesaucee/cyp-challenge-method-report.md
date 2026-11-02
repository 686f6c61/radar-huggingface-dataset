# AwesomeSaucee/cyp-challenge-method-report

## Resumen

`AwesomeSaucee/cyp-challenge-method-report` no es un modelo de lenguaje: es un repositorio de HuggingFace que contiene el informe metodológico de una participación en el OpenADMET CYP Blind Challenge, una competición de quimioinformática centrada en la predicción de inhibición dependiente del tiempo (TDI) de isoenzimas del citocromo P450 y en la predicción estructural de poses de unión. El autor, Sharma Nandini Surendra (Indian Institute of Technology BHU, Varanasi), documenta dos tracks: clasificación TDI mediante LightGBM sobre fingerprints ECFP4, descriptores fisicoquímicos y conteos SMARTS de bioactivación, y predicción estructural mediante docking rígido con AutoDock Vina sobre cuatro plantillas cristalográficas de CYP3A4.

El interés del repositorio es metodológico, no de modelado generativo: detalla el diseño de validación con agrupación por scaffolds de Bemis-Murcko, analiza la estructura determinista de la etiqueta `is_TDI` (umbral sobre dos brazos de ensayo) y reporta un resultado negativo relevante sobre la regresión del desplazamiento de pIC50 como vía para mejorar la clasificación. Incluye también cifras concretas de validación cruzada anidada (MCC 0.395 en CYP3A4, 0.167 en CYP2D6) y verificación de plausibilidad física de poses con PoseBusters (20/20).

No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto ni licencia, ya que el artefacto publicado es un informe y no un checkpoint de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica como modelo neuronal; pipeline de ML clásico (LightGBM + kNN Tanimoto + regresión de desplazamiento) y docking con AutoDock Vina |
| Parametros totales | No disponible |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene un informe metodológico, no pesos) |

## Arquitectura y entrenamiento

El track TDI emplea un ensemble de tres miembros: un LightGBM sobre un vector de características compuesto por ECFP4 (Morgan radio 2, 2048 bits), 29 descriptores fisicoquímicos (LogP, TPSA, MolWt, conteos de anillos aromáticos y alifáticos, FractionCSP3, nitrógenos básicos) y 39 conteos SMARTS de motivos de bioactivación (metilendioxifenilo, alquinos terminales, furanos, tiofenos, catecoles, para-aminofenoles, aminas básicas, azoles coordinantes del hemo). Se combina con un kNN basado en similitud de Tanimoto y un miembro de regresión del desplazamiento de pIC50, con umbral óptimo según MCC. Se entrenaron modelos separados por isoforma (CYP2D6 y CYP3A4) porque las etiquetas solo coinciden en el 61,8% de los compuestos etiquetados en ambas.

La validación usa GroupKFold de 5 pliegues agrupado por scaffolds de Bemis-Murcko, decisión justificada porque el conjunto de test ciego se construyó por expansión de análogos alrededor de hits conocidos. El track estructural usa docking rígido con AutoDock Vina en ensemble sobre cuatro plantillas cristalográficas de CYP3A4 (PDB 1TQN, 6MA7, 2V0M, 3NXU) conservando el grupo hemo, con verificación de las 22 comprobaciones de PoseBusters. Los datos provienen de `openadmet/cyp-challenge-train-test`: 6.145 compuestos de entrenamiento, 750 de test ciego y 20 para el track estructural (MW 240-413, 18-27 átomos pesados, 2-7 enlaces rotables). No se usaron datos externos ni propietarios.

## Capacidades

- Clasificación de inhibición dependiente del tiempo (TDI) para CYP2D6 y CYP3A4 a partir de SMILES.
- Predicción estructural de poses de unión en el sitio activo de CYP3A4 mediante docking rígido con hemo retenido.
- Generación de características químicas: fingerprints ECFP4, descriptores fisicoquímicos y conteos SMARTS de motivos de bioactivación.
- Validación de plausibilidad física de poses mediante PoseBusters (22 comprobaciones).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado temprano de TDI en descubrimiento de fármacos: el clasificador LightGBM permite descartar compuestos con riesgo de inhibición dependiente del tiempo de CYP3A4 o CYP2D6 antes de ensayos in vitro, usando solo SMILES como entrada.
- Priorización de compuestos en cribados virtuales: el pipeline de características (ECFP4 + descriptores + SMARTS) puede aplicarse a bibliotecas grandes para ordenar candidatos por probabilidad de TDI, con la advertencia de que el MCC reportado (0.395 en CYP3A4, 0.167 en CYP2D6) limita su uso a triaje, no a decisión final.
- Predicción de poses de unión en CYP3A4: el protocolo de docking con AutoDock Vina sobre cuatro plantillas cristalográficas sirve para generar hipótesis estructurales iniciales de cómo un compuesto se acomoda en el sitio activo, con verificación automática de plausibilidad.
- Análisis de riesgo metabólico en química medicinal: los conteos SMARTS de motivos de bioactivación (metilendioxifenilo, alquinos terminales, furanos, catecoles) permiten señalar alertas estructurales asociadas a metabolitos reactivos.
- Reproducción metodológica en competiciones de quimioinformática: el informe documenta el diseño de validación agrupada por scaffolds, útil como referencia para evitar fugas de información en conjuntos construidos por expansión de análogos.
- Estudio de la predictibilidad del desplazamiento de pIC50: los resultados negativos reportados (RMSE ≥ desviación estándar del objetivo) son referencia para investigadores que consideren reformular la clasificación TDI como regresión.
- Docencia en quimioinformática aplicada: el repositorio ilustra un flujo completo desde features químicas hasta validación honesta y control de calidad estructural.

## Benchmarks y rendimiento

| Endpoint / tarea | Métrica | Resultado |
|---|---|---|
| CYP3A4 TDI (clasificación) | MCC en CV anidada | 0.395 |
| CYP2D6 TDI (clasificación) | MCC en CV anidada | 0.167 |
| CYP2D6 regresión de desplazamiento | RMSE / SD del objetivo | 0.426 / 0.408 |
| CYP2D6 regresión de desplazamiento | Spearman ρ | 0.113 |
| CYP3A4 regresión de desplazamiento | RMSE / SD del objetivo | 0.364 / 0.364 |
| CYP3A4 regresión de desplazamiento | Spearman ρ | 0.250 |
| Reglas aplicadas a predicción de desplazamiento (sin ajuste) | MCC CYP2D6 / CYP3A4 | 0.095 / 0.156 |
| Track estructural | Poses que pasan PoseBusters | 20/20 (22 comprobaciones) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras anteriores son resultados propios del autor en validación interna, no en el leaderboard ciego.

## Requisitos de hardware

- El pipeline TDI (LightGBM + kNN + regresión) se ejecuta en CPU; no requiere GPU. El coste dominante es el cálculo de fingerprints y descriptores sobre 6.145 compuestos, asumible en un portátil convencional.
- El docking con AutoDock Vina sobre cuatro plantillas y 20 compuestos es igualmente viable en CPU; el coste escala con el número de ligandos y el tamaño de la caja de búsqueda.
- No aplica VRAM estimada para inferencia de un modelo neuronal: no hay checkpoint publicado.
- Opciones de despliegue: scripts de Python con RDKit, LightGBM, AutoDock Vina y PoseBusters. No procede vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros métodos del OpenADMET CYP Blind Challenge ni con modelos predictivos de TDI de referencia, por lo que no se pueden establecer comparaciones numéricas sin inventar datos.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un checkpoint reutilizable: es un informe metodológico. No puede desplegarse como servicio de inferencia.
- El autor declara explícitamente que no se ejecutó ablación sobre el bloque de 39 SMARTS de bioactivación, por lo que su contribución real al rendimiento es desconocida.
- El MCC de CYP2D6 (0.167) es bajo y refleja una capacidad predictiva limitada; el modelo no es adecuado como único criterio de decisión en descubrimiento.
- El desplazamiento de pIC50 resultó prácticamente impredecible desde la estructura (RMSE ≥ SD del objetivo), lo que limita cualquier enfoque de regresión sobre esta etiqueta.
- La validación se hizo con agrupación por scaffolds para evitar fugas, pero el conjunto de test ciego se construyó por expansión de análogos; el rendimiento en quimiotipos alejados del dominio de entrenamiento es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial del contenido del repositorio.
- Los datos de entrenamiento son públicos (openadmet/cyp-challenge-train-test) y las estructuras provienen de PDB; conviene verificar las condiciones de uso de cada fuente.
- El docking rígido no modela flexibilidad del receptor ni reorganización del sitio activo; las poses plausibles según PoseBusters no garantizan corrección termodinámica.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación indebida fuera del dominio químico cubierto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AwesomeSaucee/cyp-challenge-method-report
- Dataset del reto: `openadmet/cyp-challenge-train-test` (referenciado en el informe)
- Estructuras PDB usadas: 1TQN, 6MA7, 2V0M, 3NXU (RCSB PDB)
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
