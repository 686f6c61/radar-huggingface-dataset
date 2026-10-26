# momo00798/cyp-challenge-method-report

## Resumen

`momo00798/cyp-challenge-method-report` no es un modelo de lenguaje ni un modelo fundacional: es un repositorio de informe metodológico e artefactos de envío para el OpenADMET CYP Inhibition Blind Challenge 2026. Contiene la descripción de una continuación neuronal ("FP-MLP + D-MPNN Continuation") sobre un pipeline previo de CPU, junto con ficheros CSV de predicciones para 750 moléculas: cuatro valores de pIC50 de inhibición directa (CYP1A2, CYP2C9, CYP2D6, CYP3A4) y dos etiquetas booleanas de inhibición dependiente del tiempo (TDI) para CYP2D6 y CYP3A4.

El problema que aborda es la predicción de inhibición de isoenzimas del citocromo P450 a partir de estructura molecular, un cuello de botella clásico en descubrimiento de fármacos por el riesgo de interacciones fármaco-fármaco. La propuesta combina dos familias de modelos pequeños entrenados desde cero: un perceptrón multicapa sobre fingerprints de Morgan (radio 2) más 16 descriptores fisicoquímicos, y una red de paso de mensajes dirigido (D-MPNN) sobre grafos moleculares, también con descriptores.

Su relevancia es documental y metodológica, no como artefacto reutilizable: el autor explicita controles de fuga de datos, congelación de folds, presupuestos de cómputo y verificaciones de reproducibilidad, pero no publica pesos, licencia ni tarjeta de modelo convencional. El repositorio acumula 0 descargas y 0 likes, y no declara aceptación por parte del servidor de la competición ni resultados en el conjunto ciego.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos familias: FP-MLP (fingerprints Morgan radio 2 + 16 descriptores fisicoquímicos, capas ocultas 256/128, regresión interval-aware) y D-MPNN (paso de mensajes dirigido, hidden 300, profundidad 3, más descriptores); cabezas separadas de regresión y clasificación |
| Parámetros totales | no disponible (no se publica recuento de parámetros ni pesos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es una estructura molecular fija (grafo dirigido y vector de descriptores), no una secuencia de texto |
| Tipos de cuantización | no disponible; se mencionan exportaciones Torch verificadas por checksum y cargadas con `weights_only=True`, sin detalle de precisión (FP32/FP16) |
| Idiomas soportados | no aplica (modelo de química computacional, sin entrada ni salida en lenguaje natural) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | no disponible; el repositorio publica CSV de envío e informes, no checkpoints. Los checkpoints existen localmente como exportaciones Torch |

Otros datos declarados: 750 moléculas en `direct_inhibition.csv` (cuatro predicciones de pIC50) y 750 en `tdi.csv` (dos etiquetas booleanas); umbral de decisión TDI fijado en probabilidad ≥ 0,20 por endpoint; selección basada en 4.328 filas de desarrollo y folds congelados.

## Arquitectura y entrenamiento

El pipeline usa exclusivamente los datos oficiales de la competición (cinco hashes de origen verificados, manifiesto de características, tabla de moléculas y folds congelados). No emplea datos externos, modelos preentrenados, entrenamiento con etiquetas auxiliares ni corrección de residuos. Las entradas son estructuras fijas: fingerprints Morgan de radio 2 y 16 descriptores fisicoquímicos para FP-MLP, y grafos moleculares dirigidos más esos descriptores para D-MPNN. Las variables de resultado, la incertidumbre de medida y los patrones de ausencia no se usan como características de entrada; el preset FP-MLP interval-aware sí puede usar los límites de las etiquetas oficiales de entrenamiento en su pérdida de regresión.

El entrenamiento emplea redes separadas para regresión y clasificación, con pérdida de Huber enmascarada o interval-aware para regresión y BCE-with-logits enmascarada para clasificación. El optimizador es AdamW con tasa de aprendizaje 0,001 y weight decay 0,00001. La parada temprana interna, segura respecto a la identidad química, usa un techo de 100 épocas y paciencia 12; las épocas seleccionadas se congelan después para los reentrenamientos. Cada finalista tiene dos reentrenamientos sobre todos los datos oficiales de entrenamiento, con semillas 17 y 43. Los cuatro presets existentes se cribaron en el fold de desarrollo 0 con semilla 17; un finalista por familia completó cinco folds con semillas 17 y 43, lo que requirió 18 trabajos adicionales de GPU al reutilizar los dos resultados de cribado coincidentes.

Configuración de los finalistas: `fp_mlp-1` con dropout 0,25, batch 128 y 4 épocas finales (regresión) / 2 (TDI); `dmpnn-0` con dropout 0,15, batch 64 y 19 épocas (regresión) / 10 (TDI). El ancla de CPU conserva la receta congelada de ExtraTrees/LightGBM. La selección de umbrales y mezcla se realizó únicamente con evidencia out-of-fold del conjunto D: pesos de mezcla de 0,375 para inhibición directa (ancla de CPU 0,375, FP-MLP 0,375, D-MPNN 0,250) y de 0,500 para TDI (ancla 0,500, FP-MLP 0,500, D-MPNN 0,000, es decir, D-MPNN se descarta para TDI).

## Capacidades

- Regresión multi-endpoint de inhibición directa de CYP1A2, CYP2C9, CYP2D6 y CYP3A4 en escala pIC50 a partir de estructura molecular 2D.
- Clasificación binaria de inhibición dependiente del tiempo (TDI) para CYP2D6 y CYP3A4.
- Modelado de incertidumbre de medida mediante pérdida interval-aware con los límites de las etiquetas oficiales de entrenamiento.
- Representación dual de la molécula: fingerprints hasheados con descriptores fisicoquímicos y grafo molecular dirigido con paso de mensajes.
- Verificación de reproducibilidad: replay sin caché que regenera el envío desde características fijas sin reentrenar, con diferencia absoluta máxima de regresión de 2,36e-07 (tolerancia 1e-05) y etiquetas TDI booleanas idénticas.
- Auditoría de identidad química y exclusiones por componente químico para evitar fuga entre folds.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Filtrado ADMET temprano en descubrimiento de fármacos: puntuar lotes de candidatos con las cuatro predicciones de pIC50 de CYP para descartar compuestos con alta probabilidad de inhibición antes de ensayos in vitro.
- Evaluación de riesgo de interacciones fármaco-fármaco: usar las probabilidades de TDI de CYP2D6 y CYP3A4, con umbral 0,20, para marcar candidatos que requieran ensayos de inhibición dependiente del tiempo.
- Priorización de cribados virtuales: ordenar bibliotecas de 750 moléculas o más aplicando los dos modelos en paralelo y combinando sus salidas con los pesos de mezcla documentados (0,375/0,375/0,250 en regresión).
- Reproducción metodológica en investigación: reimplementar el par FP-MLP + D-MPNN como línea base reproducible en retos de quimioinformática, dado que el informe especifica pérdidas, hiperparámetros, semillas y epochs exactos.
- Auditoría de fugas en pipelines de ML químico: reutilizar el esquema de folds congelados, exclusiones por identidad química y bootstrap por componente químico pareado para validar otros modelos ADMET.
- Enseñanza de validación rigurosa: el repositorio sirve como caso de estudio de selección de umbrales y mezclas solo con evidencia out-of-fold, con intervalos de confianza bootstrap y criterios de promoción predeclarados.
- Despliegue en pipelines de quimioinformática con CPU: el ancla ExtraTrees/LightGBM y los modelos neuronales pequeños permiten integrar el scoring en un flujo batch sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Métricas de desarrollo out-of-fold presentadas por el autor. No son resultados de test ciego ni una auditoría independiente, y el propio informe advierte que la selección basada en OOF puede ser optimista.

| Métrica | Referencia CPU | Complemento neuronal |
|---|---|---|
| Macro ST-RAE (menor es mejor) | 0,750064 | 0,701159 |
| CYP1A2 ST-RAE | 0,816841 | 0,786798 |
| CYP2C9 ST-RAE | 0,704780 | 0,626983 |
| CYP2D6 ST-RAE | 0,925868 | 0,890272 |
| CYP3A4 ST-RAE | 0,552769 | 0,500584 |
| Macro MCC (mayor es mejor) | 0,219495 | 0,233807 |
| CYP2D6 TDI MCC | 0,048741 | 0,098402 |
| CYP3A4 TDI MCC | 0,390249 | 0,369213 |

Reducción relativa de macro ST-RAE en desarrollo: 6,52 %. El bootstrap pareado por componente químico con 2.000 réplicas respalda la mejora de regresión en todas las réplicas. La ganancia en TDI es incierta: incremento de macro MCC de 0,014313, soporte bootstrap 0,8715 e intervalo pareado del 95 % de [-0,010277, 0,039573], que incluye el cero; CYP2D6 TDI sigue siendo débil y CYP3A4 TDI empeora ligeramente.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Las arquitecturas descritas (MLP con capas ocultas de 256/128 y D-MPNN con hidden 300 y profundidad 3) son de escala muy reducida y, cualitativamente, caben en cualquier GPU consumer, pero no se publica recuento de parámetros ni huella de memoria.
- GPU recomendadas: no disponible. El informe menciona trabajos de GPU sin especificar modelo; el replay local se ejecutó en macOS sobre CPU.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de las redes y el lote de 750 moléculas, pero es una inferencia a partir de la arquitectura y no un dato declarado.
- Opciones de despliegue: inferencia vía PyTorch, con carga de checkpoints verificados por checksum y `weights_only=True`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El ancla de CPU (ExtraTrees/LightGBM) ofrece una vía de ejecución sin GPU.
- Latencia y throughput: no disponibles. Se documenta un fallo de barrera Torch/OpenMP en el host macOS durante el primer replay local, resuelto limitando el runtime a un solo hilo; no se repitieron ni detuvieron trabajos de GPU.
- Almacenamiento: el informe cita 26 bundles de entrada de la continuación y matrices de características exactas, sin cifras de tamaño total.

## Comparativa con modelos similares

| Propuesta | Arquitectura | Contexto / entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `momo00798/cyp-challenge-method-report` (este) | FP-MLP + D-MPNN + ancla ExtraTrees/LightGBM | Estructura molecular 2D; 750 moléculas | Macro ST-RAE 0,701159; macro MCC 0,233807 (OOF desarrollo) | no disponible | Informe y CSV de envío; sin pesos |
| `mokhalaf22/openadmet-cyp-public` | D-MPNN multi-tarea con pérdida interval-hinge | Estructura molecular 2D | no disponible en la información proporcionada | no disponible | Repositorio público con log de experimentos y model report |
| `Arnab28122000/openadmet-cyp-challenge` | Método no detallado; implementación en monorepo privado | Estructura molecular 2D | no disponible | no disponible | Solo informe; extracto de módulos bajo petición |
| Envío "Woong" (gist de ByungwoongYoo) | Regresión de inhibición directa + clasificación TDI | Estructura molecular 2D; 750 compuestos | no disponible | no disponible | Informe público en gist |
| Ancla CPU interna (`submissions/final/`) | ExtraTrees/LightGBM congelado | Igual que este | Macro ST-RAE 0,750064; macro MCC 0,219495 | no disponible | Incluida en el mismo repositorio |

Todas las alternativas compiten en el mismo reto OpenADMET CYP 2026 y ninguna publica pesos ni licencia en la información disponible, por lo que la comparación de rendimiento relativo no puede establecerse fuera de las métricas OOF propias de cada envío.

## Limitaciones y advertencias

- No es un modelo publicable ni reutilizable directamente: el repositorio contiene informes y CSV de predicciones, no checkpoints ni código de inferencia.
- Ausencia total de licencia declarada: impide cualquier uso comercial o redistribución con garantías jurídicas.
- Las métricas presentadas son puntuaciones de selección out-of-fold, no resultados de test ciego, auditoría independiente ni ranking de competición. El autor lo indica explícitamente.
- La mejora en TDI no está establecida: el intervalo de confianza pareado del 95 % incluye el cero y CYP3A4 TDI empeora (MCC 0,369213 frente a 0,390249 de la referencia CPU).
- CYP2D6 es el endpoint más débil en ambos regímenes (ST-RAE 0,890272; MCC TDI 0,098402), lo que limita su uso en decisiones de ese isoenzima.
- Persiste un desajuste entre la distribución de vecinos del conjunto de test y la del holdout de análogos, lo que compromete la generalización a quimiotipos alejados del entrenamiento.
- Los conjuntos P/S ya se habían visto durante la campaña de CPU y no constituyen un test independiente limpio para esta continuación.
- Riesgo de sobreajuste por selección: modelo, pesos de mezcla y umbrales se eligieron con la misma evidencia OOF que se reporta.
- No se establece validez clínica ni mecanismo bioquímico alguno; las predicciones no sustituyen ensayos in vitro.
- Los idiomas no aplican, pero el modelo solo maneja estructuras moleculares 2D con los descriptores especificados; no procesa texto, imágenes ni secuencias.
- Trazabilidad frágil: parte de la implementación vive en un monorepo privado y el replay local requirió ajustes de runtime (un solo hilo) para evitar bloqueos de OpenMP.

## Enlaces

- HuggingFace (repositorio del informe): https://huggingface.co/momo00798/cyp-challenge-method-report
- Space del informe metodológico (FreeT4-CYP): https://huggingface.co/spaces/momo00798/freet4-cyp-method
- Space oficial del reto OpenADMET CYP: https://huggingface.co/spaces/openadmet/cyp-challenge
- Repositorio público de entrada (mokhalaf22): https://github.com/mokhalaf22/openadmet-cyp-public
- Informe metodológico (Arnab28122000): https://github.com/Arnab28122000/openadmet-cyp-challenge
- Informe del envío "Woong": https://gist.github.com/ByungwoongYoo/4904441a9b30db077fbb784f9c22e423
- Paper, blog y demo específicos de este repositorio: no disponibles en la información proporcionada.
