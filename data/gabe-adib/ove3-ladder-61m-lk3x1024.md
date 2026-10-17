# gabe-adib/ove3-ladder-61m-lk3x1024

## Resumen

`ove3-ladder-61m-lk3x1024` es un checkpoint de investigación publicado por el usuario gabe-adib dentro de una «escalera de intervenciones» denominada ove3: una serie de entrenamientos controlados en los que se varía un único factor de la receta y se mantiene todo lo demás constante. En concreto, este modelo es un brazo K3 de la escalera: una mezcla de expertos (MoE) de tipo `kimi_linear` con 61M de parámetros activos, expertos LatentMoE de media anchura (1024 expertos), enrutamiento top-16 y escalado de router 1.0, con semilla 1234. El resto de la receta (datos, learning rate, batch y número de pasos) corresponde a la celda IsoFLOP de 61M del proyecto.

No es un modelo pensado para uso en producción: es un artefacto de experimentación que incluye el estado del optimizador y los logs de entrenamiento, publicado para que otros investigadores puedan reproducir, auditar o reutilizar el punto de control. El checkpoint publicado es `best_1`, en la iteración 17.290, con una pérdida de validación (lm loss) de 1,1044 y una pérdida held-out de 1,1947 nats/carácter ponderada sobre 9 dominios.

Su relevancia es acotada pero específica: los MoE de grano muy fino (1024 expertos con top-16) están poco documentados a escalas pequeñas, donde el coste de entrenamiento permite ablaciones limpias. Este checkpoint permite estudiar el comportamiento del enrutamiento, la utilización de expertos y el efecto de la atención lineal tipo Kimi Linear con un presupuesto de cómputo contenido. La model card es mínima: no declara licencia, idiomas, contexto ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos con atención lineal (`kimi_linear`) y expertos LatentMoE; 1024 expertos de media anchura, top-16 |
| Parámetros totales | no disponible (el repositorio de 19,5 GB incluye estado del optimizador, por lo que el total es muy superior a los parámetros activos) |
| Parámetros activos | 61M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica el checkpoint en el formato y precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | checkpoint distribuido de Megatron (con estado del optimizador); no se publican safetensors ni GGUF |
| Enrutamiento | top-16 sobre 1024 expertos (2x parámetros enrutados respecto al brazo de referencia) |
| Normalización | RMSNorm con eps 1e-5 |
| Escalado de router | 1.0 |
| Semilla | 1234 |
| Iteración del checkpoint | 17.290 (`best_1`, mejor paso de validación) |
| Pérdida de validación (lm loss) | 1,1044 |
| Pérdida held-out | 1,1947 nats/carácter (ponderada por mezcla sobre 9 dominios) |
| Tamaño del repositorio | 19,5 GB |

## Arquitectura y entrenamiento

La arquitectura combina dos decisiones técnicas que la model card nombra pero no detalla. Por un lado, `kimi_linear` apunta a un diseño híbrido de atención lineal en la línea de Kimi Linear, con capas de atención lineal combinadas con capas de atención completa; el repositorio no especifica la proporción ni el diseño exacto de las capas. Por otro, `LatentMoE` implica que los expertos operan en un espacio latente de dimensión reducida en lugar de sobre la representación completa, lo que abarata el coste por experto y permite sostener 1024 expertos de media anchura con solo 61M de parámetros activos por token. El enrutamiento es top-16, lo que supone el doble de parámetros enrutados por token que el brazo de referencia de la escalera.

El entrenamiento sigue la celda IsoFLOP de 61M de la receta: mismos datos, learning rate, batch y pasos que el resto de brazos comparables, de modo que la única variable introducida es la configuración K3 del MoE. El modelo se evalúa con pérdida en nats por carácter sobre una mezcla ponderada de 9 dominios, con el desglose por dominio en `DOMAIN_NLL.txt`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de ajuste tipo RLHF o DPO; tampoco se describe ninguna innovación adicional en decodificación.

## Capacidades

- Modelo base de lenguaje: predicción de siguiente token, sin ajuste por instrucciones ni alineación documentada.
- Generación de texto a partir de continuación de contexto; no hay evidencia publicada de modo «thinking», razonamiento multi-paso inducido o capacidades de agente.
- Soporte de tool calling o function calling: no disponible; no se menciona en la model card.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; la loss se reporta en nats/carácter sobre 9 dominios no identificados en la información proporcionada.
- Valor como artefacto de investigación: permite inspeccionar la distribución de uso de 1024 expertos con top-16, comparar brazos de la escalera ove3 y reanudar entrenamiento con estado del optimizador incluido.
- Con 61M de parámetros activos, la profundidad de conocimiento factual y la fluidez esperables son propias de un modelo de escala muy pequeña.

## Casos de uso

- Ablación de configuración MoE: usar este checkpoint como brazo K3 frente a otros brazos de la escalera ove3 para aislar el efecto de 1024 expertos con top-16 y expertos de media anchura en la pérdida de validación, manteniendo fijos datos, learning rate y pasos.
- Estudio de utilización de expertos: con 1024 expertos y top-16 por token, el checkpoint permite analizar desequilibrios de carga del router, colapso de expertos y el efecto del escalado de router a 1.0, cargando los pesos y registrando estadísticas de enrutamiento por capa.
- Investigación sobre atención lineal: comparar el comportamiento de la variante `kimi_linear` con brazos de atención completa de la misma receta, midiendo pérdida por dominio y estabilidad del entrenamiento a igualdad de cómputo.
- Reanudación de entrenamiento: al incluir el estado del optimizador, el checkpoint sirve para continuar el run desde la iteración 17.290, por ejemplo para explorar un cambio de mezcla de datos o de learning rate sin reiniciar desde cero.
- Calibración de leyes de escala en régimen IsoFLOP: los valores de pérdida (1,1044 en validación, 1,1947 nats/carácter en held-out, sobre 9 dominios) sirven como punto de referencia para ajustar predicciones de pérdida en presupuestos de cómputo de ~61M de parámetros activos.
- Evaluación por dominio: el desglose en `DOMAIN_NLL.txt` permite identificar en qué dominios de la mezcla el modelo pierde más y diseñar experimentos de reequilibrio del corpus.
- Pruebas de infraestructura: útil para validar pipelines de conversión de checkpoints distribuidos de Megatron, comprobación de paralelismo y flujos de carga/descarga antes de aplicarlos a modelos mayores.
- Docencia y experimentación académica: escala asequible en una sola GPU para estudiar el funcionamiento interno de un MoE de grano fino con atención híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de referencia similares). Los únicos datos numéricos publicados son las pérdidas de entrenamiento y evaluación:

| Métrica | Valor | Conjunto |
|---|---|---|
| LM loss de validación | 1,1044 | Validación del run (mejor paso, iteración 17.290) |
| NLL held-out | 1,1947 nats/carácter | 9 dominios, ponderado por mezcla |
| NLL por dominio | no disponible en esta información | Detallado en `DOMAIN_NLL.txt` del repositorio |

Al expresarse en nats por carácter, estos valores no son directamente comparables con pérdidas por token de otros modelos salvo que se conozca la tokenización exacta, que no se documenta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El coste de cómputo por token corresponde a un modelo denso de ~61M de parámetros activos, pero la memoria vendrá dominada por el número total de parámetros y por el checkpoint de Megatron, que incluye estado del optimizador innecesario en inferencia.
- GPU recomendadas: no disponible. Por escala, cualquier GPU CUDA con memoria suficiente para el total de pesos tras la conversión debería bastar; no se publican requisitos oficiales.
- Viabilidad en GPU de consumo: no confirmada. Depende del total de parámetros (no declarado) y de si se convierte el checkpoint a un formato eficiente; no hay artefactos GGUF ni safetensors publicados.
- Opciones de despliegue: Megatron-LM es la vía nativa, ya que el repositorio contiene un checkpoint distribuido. Para vLLM, TGI, llama.cpp u Ollama sería necesaria una conversión previa de formato que no se proporciona en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables publicados con esta configuración exacta (61M activos, 1024 expertos de media anchura, top-16, atención `kimi_linear`). La comparación natural es interna a la propia escalera ove3, cuyos otros brazos no están enlazados en los datos disponibles.

| Modelo | Parámetros activos | Expertos / top-k | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ove3-ladder-61m-lk3x1024 | 61M | 1024 / top-16 | no disponible | no disponible | Checkpoint Megatron público en HuggingFace |
| Otros brazos de la escalera ove3 | no disponible | no disponible | no disponible | no disponible | No enlazados en la información disponible |
| Celda densa de referencia (IsoFLOP 61M) | 61M (receta compartida) | denso | no disponible | no disponible | No enlazado en la información disponible |

## Limitaciones y advertencias

- Ausencia de licencia: la model card no declara licencia, por lo que no se concede permiso explícito de uso comercial ni de redistribución; en la práctica, los derechos quedan reservados al autor.
- Artefacto de investigación, no de producción: es un modelo base sin ajuste por instrucciones, sin alineación y sin evaluación de seguridad; su uso en aplicaciones de cara al usuario no está respaldado por ninguna validación publicada.
- Riesgo alto de alucinación y de incoherencia factual: con 61M de parámetros activos, la capacidad de retener conocimiento y de mantener coherencia en contextos largos es muy limitada.
- Sesgos y procedencia de datos desconocidos: no se documenta la composición del corpus de entrenamiento ni los 9 dominios de evaluación, por lo que no es posible auditar sesgos ni cobertura lingüística.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; la evaluación en nats/carácter no permite inferirla.
- Contexto no disponible: se desconoce la ventana máxima soportada, lo que impide planificar cargas de contexto largo.
- Formato poco portable: el checkpoint distribuido de Megatron con estado del optimizador (19,5 GB) no se carga directamente en los runners habituales; requiere herramientas de conversión.
- Sin benchmarks estándar: no existen métricas comparables con otros modelos, solo pérdidas en nats/carácter, dependientes de la tokenización no documentada.
- Naturaleza de ablación: al fijar la receta de la celda IsoFLOP de 61M, el modelo está deliberadamente subentrenado respecto a lo que permitiría su presupuesto; no debe interpretarse como el mejor modelo posible de su tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3x1024
- Configuración del run: `config.yaml` en el repositorio
- Desglose de pérdida por dominio: `DOMAIN_NLL.txt` en el repositorio
- Checkpoint entrenado: carpeta `checkpoint/` (formato distribuido de Megatron, con estado del optimizador)
- Logs de entrenamiento, scoring y eventos de TensorBoard: carpeta `logs/`
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
