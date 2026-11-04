# shreyashsharma/MaPa-Rhythm-Base

## Resumen

MaPa-Rhythm-Base es un modelo compacto de series temporales disenado para aprender patrones de uso del telefono movil y generar alertas de inactividad inusual. Lo desarrolla shreyashsharma y se publica bajo licencia Apache 2.0. El sistema combina una red neuronal de apenas 9.594 parametros con una politica de decision personalizada por persona (umbral causal de score y regla de respaldo de 12 horas de silencio observado). El checkpoint es el modelo entrenado sin modificaciones; los resultados de alerta reportados miden el pipeline completo, no la red neuronal de forma aislada.

La relevancia del modelo esta en su enfoque "on-device": esta pensado para ejecutarse en el propio smartphone mediante ExecuTorch 0.7.0 con XNNPACK, con programas de 103.684 bytes (paso) y 123.136 bytes (diario). La entrada son 21 caracteristicas causales por cada intervalo de 15 minutos (18 de telefono/estado diario, percentiles p90 y p99.5 de quietud previa y un flag de inicio de sesion). Las salidas incluyen hazards de proximo uso para 16 pasos, score de uso actual, score de quietud inusual y confianza.

El modelo es deliberadamente minusculo y especializado: no es un LLM ni un modelo de proposito general, sino un componente de un sistema de deteccion de anomalias de rutina para uso familiar o parental. Su evaluacion se ha hecho sobre cohortes derivadas (timelines generadas por modelos ajustados a logs reales de telefono), no sobre datos prospectivos reales, lo que limita la interpretacion de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN dilatada causal + memoria GRU + contexto personal + LSTM de resumen diario (sin atencion) |
| Parametros totales | 9.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 21 caracteristicas por paso de 15 minutos; hazards a 16 pasos) |
| Tipos de cuantizacion | no disponible (inferencia via ExecuTorch/XNNPACK) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint de referencia); programas ExecuTorch (step y daily) |
| SHA-256 del checkpoint | 11c70d4366043ed1d91218bf8f9e1eb118f170e88e3f3c75e0ea40e06c17c4d1 |
| Tamano del repo | 0.0 GB |
| Pipeline | time-series-forecasting |

## Arquitectura y entrenamiento

La red es una CNN dilatada causal con memoria GRU, contexto personal y una LSTM de resumen diario; la atencion no se retuvo en la version final. Procesa 21 caracteristicas causales por cada bin de 15 minutos y produce hazards de proximo uso para 16 pasos, un score de uso actual, un score de quietud inusual y una medida de confianza. El checkpoint se ejecuta en PyTorch de referencia y en ExecuTorch 0.7.0 con XNNPACK, con dos programas separados (paso y diario).

El ajuste se realizo sobre el split de entrenamiento congelado: 162 identidades y 4.230.516 filas, abarcando 44.560 dias-persona de entrenamiento. La etapa 1 uso 3.828 bins reales observados de 22 personas reales; solo un dia real cumplio la regla de resumen diario de 14 horas. El resto de timelines de entrenamiento son derivadas por modelos. La semilla de ajuste fue 20261101. Validacion y test no se leyeron durante el ajuste. Los escenarios de comportamiento se anadieron programaticamente a las timelines derivadas, ya que no habia etiquetas de disrupcion natural. Los umbrales de la politica se eligieron sobre cinco folds de entrenamiento con personas retenidas.

## Capacidades

- Prediccion de hazards de proximo uso de telefono a 16 pasos (4 horas) en intervalos de 15 minutos.
- Estimacion de score de uso actual y score de quietud inusual por bin.
- Deteccion de inactividad inusual combinando score conductual y score de sorpresa acumulada.
- Regla de respaldo de 12 horas de silencio diurno observado continuo (48 bins).
- Supresion de alertas en dias etiquetados explicitamente (life tags), que tampoco entran en el historial personal.
- Tratamiento de observacion ausente o caducada como no quietud (no se cuenta como silencio).
- Inferencia on-device con ExecuTorch y XNNPACK en Android (codigo de politica integrado y APKs de release construidos).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Monitorizacion familiar de rutinas: el sistema alerta cuando el patron de uso del telefono de una persona se desvia de su historial personal, usando el umbral causal personalizado y la regla de 12 horas como respaldo.
- Deteccion de inactividad inusual en personas mayores: el score de quietud inusual puede senalar periodos de silencio anomalo, aunque el modelo no distingue entre inactividad real y telefono ausente (limitacion documentada).
- Despliegue on-device en Android: los programas ExecuTorch de ~100-123 KB permiten ejecutar la inferencia en el propio dispositivo sin enviar datos de uso a la nube, con la politica integrada en la app.
- Personalizacion por usuario sin reentrenamiento: el contexto personal y el umbral causal se ajustan por persona, de modo que el mismo checkpoint sirve para distintos individuos.
- Investigacion en deteccion de anomalias de series temporales: el modelo sirve como referencia compacta para experimentar con hazards, scores de sorpresa y politicas de decision.
- Sistemas de alerta con etiquetado de contexto: los life tags permiten suprimir alertas en dias especiales (viajes, eventos) y evitar que contaminen el historial personal.
- Prototipado de pipelines de decision con backstop temporal: la combinacion de score personalizado y regla fija de 12 horas es un patron reutilizable en sistemas de alerta con requisitos de robustez.

## Benchmarks y rendimiento

Resultados del sistema completo sobre una cohorte derivada nueva (40 padres x 120 dias, semilla 2026110202):

| Medida | Resultado |
|---|---:|
| Falsas alertas | 750 eventos / 685,714 semanas-persona observadas = 1,09375 por persona-semana (IC 95% bootstrap por persona 1,0077-1,1885) |
| Escenarios leves detectados | 50/50 (100%) |
| Escenarios claros detectados | 33/33 (100%) |
| Escenarios graves detectados | 25/25 (100%) |
| Negativos duros "expected-none" alertados | 141/492 (28,66%) |
| Stale-as-fresh | 0 |
| Episodios de observacion | 160/160 por grupo de severidad |
| Retardo de alerta de comportamiento | mediana 60 min, p90 60 min por grupo de severidad |

Comparativa en la misma cohorte derivada:

| Sistema | Falsas alertas / semana | Leves | Claros | Graves |
|---|---:|---:|---:|---:|
| MaPa-Rhythm-Base | 1,09375 | 50/50 | 33/33 | 25/25 |
| Regla fija 8 horas | 2,7504 | 7/50 | 9/33 | 25/25 |
| Temporizador 12 horas | 1,09375 | 5/50 | 3/33 | 2/25 |
| Solo estadistica | 3,7085 | 13/50 | 22/33 | 25/25 |

Negativos duros por escenario:

| Escenario expected-none | Alertas | Episodios | Tasa |
|---|---:|---:|---:|
| Manana retrasada | 0 | 120 | 0% |
| Dia con life tag | 0 | 120 | 0% |
| Silencio largo normal | 9 | 120 | 7,5% |
| Inactividad diurna | 65 | 65 | 100% |
| Telefono dejado en casa | 67 | 67 | 100% |

Estos resultados son sobre timelines generadas, no emergencias reales, y no aislan la contribucion de la red neuronal de la politica de decision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el checkpoint tiene 9.594 parametros y los programas ExecuTorch ocupan 103.684 bytes (step) y 123.136 bytes (daily).
- GPU recomendadas: no requiere GPU; esta disenado para ejecucion on-device en smartphone via ExecuTorch 0.7.0 con XNNPACK.
- Cabe en cualquier GPU consumer e incluso en CPU movil; no se publican mediciones de bateria ni de latencia en dispositivo.
- Opciones de despliegue: PyTorch de referencia y ExecuTorch 0.7.0 (XNNPACK) para Android; codigo de politica integrado y APKs de release construidos.
- Latencia y throughput: no disponible; no hay medicion de runtime on-device, paridad Kotlin/Python ni consumo de bateria.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. La comparativa disponible es contra reglas heuristicas dentro del mismo sistema:

| Alternativa | Tipo | Falsas alertas / semana | Deteccion global |
|---|---|---:|---|
| MaPa-Rhythm-Base | Red + politica | 1,09375 | 108/108 escenarios |
| Regla fija 8 horas | Heuristica temporal | 2,7504 | 41/108 |
| Temporizador 12 horas | Heuristica temporal | 1,09375 | 10/108 |
| Solo estadistica | Heuristica estadistica | 3,7085 | 60/108 |

## Limitaciones y advertencias

- Los resultados se han medido sobre cohortes derivadas (timelines generadas por modelos ajustados a logs reales), no sobre estudios prospectivos ni emergencias reales.
- Los resultados de alerta miden el pipeline completo; no aislan la contribucion de la red neuronal de la politica de decision.
- El modelo no tiene entrada de localizacion y no puede distinguir entre una persona inactiva y un telefono dejado en casa: todos los episodios de inactividad diurna (65/65) y telefono en casa (67/67) generaron alerta.
- Tasa de negativos duros alertados del 28,66% (141/492), con casos sin resolver.
- La auditoria de no-op en ventana positiva encontro episodios donde la politica no actua (20/50 leves, 4/33 claros, 4/25 graves); el detalle completo no esta disponible en la informacion proporcionada.
- Solo soporta ingles como idioma declarado.
- No hay runtime on-device verificado, ni paridad Kotlin/Python, ni medicion de bateria; el estado Android es codigo integrado y APKs construidos.
- El sistema puntua patrones de uso del telefono; no puede establecer que esta haciendo realmente una persona.
- Licencia Apache 2.0 permite uso comercial, pero el sistema esta orientado a monitorizacion personal/familiar y requiere consideracion de privacidad y consentimiento.
- Riesgo de sesgo por la composicion del dataset (162 identidades de entrenamiento, solo 22 personas reales en la etapa 1) y por la generacion programatica de escenarios.

## Enlaces

- HuggingFace: https://huggingface.co/shreyashsharma/MaPa-Rhythm-Base
- Dataset: https://huggingface.co/datasets/shreyashsharma/MaPa-Rhythm
- Atribucion de datos: DATA-ATTRIBUTION.md (incluido en el paquete)
- Licencias de fuentes: licenses/ (incluido en el paquete)
- ExecuTorch: https://github.com/pytorch/executorch
- XNNPACK: https://github.com/google/XNNPACK
