# Sejibeji/tso-foundation-v13

## Resumen

El modelo TSO Foundation Model v13, desarrollado por el proyecto TSO (Time-Series Operator) y publicado en HuggingFace por el usuario Sejibeji, es un modelo fundacional para series temporales que aprende la geometría subyacente de sistemas dinámicos en lugar de tokenizar números. Su enfoque se basa en el operador de Koopman: un encoder profundo transforma la serie original en un espacio latente donde la dinámica es aproximadamente lineal, permitiendo ajustar un operador lineal en forma cerrada sobre los latentes congelados. Esto posibilita la transferencia a series nunca vistas sin ningún paso de gradiente, es decir, en modo zero-shot.

El modelo se entrena con cuatro pretextos autosupervisados: reconstrucción, dinámica lineal de Koopman, covarianza de escala (una pierna de renormalización) y la flecha del tiempo, sobre un corpus de 40 series reales de 8 dominios (redes eléctricas, meteorología, ECG, finanzas, epidemiología, economía, física solar y sistemas caóticos). La versión v13 utiliza una dimensión latente de 128 y una capa oculta de 384, entrenada durante 25.000 iteraciones en CPU (8 núcleos). El resultado más destacado es el redescubrimiento del ciclo solar de Schwabe (~11 años) a partir de los autovalores de Koopman ajustados sobre una serie de manchas solares no vista durante el entrenamiento, un hallazgo puramente estructural y no supervisado.

Aunque el repositorio en HuggingFace no contiene pesos publicados (tamaño 0.0 GB), la model card describe el protocolo de entrenamiento y el código necesario para reproducir los resultados. El modelo está pensado para pronóstico de series temporales en dominios diversos, con especial énfasis en la capacidad de generalización sin reentrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Takens embeddings + scale space + Koopman lift + head de flecha del tiempo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (series temporales, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, aunque el modelo opera sobre series numéricas) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo vacío, sin archivos de pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura del TSO Foundation Model se compone de cuatro módulos principales:

1. **Takens embeddings**: la serie bruta se transforma mediante delay-embedding con un tau específico por serie, reconstruyendo el atractor del sistema dinámico.
2. **Scale space**: se generan embeddings a escala fina y gruesa (renormalizados); un `scale_map` impone covarianza de escala, de modo que periodos largos como el ciclo solar aparecen como modos propios limpios en escalas gruesas.
3. **Koopman lift**: un encoder profundo aplana el atractor no lineal en un espacio latente donde la dinámica es aproximadamente lineal, representada por una matriz K.
4. **Arrow of time**: una cabeza convolucional clasifica ventanas temporales hacia adelante vs. invertidas, aprendiendo la direccionalidad del tiempo.

El entrenamiento utiliza cuatro pretextos autosupervisados: reconstrucción, dinámica lineal de Koopman, covarianza de escala y flecha del tiempo. El corpus de entrenamiento incluye 40 series reales de 8 dominios, más una batería de 176 series universales de dinámica. Se entrenó durante 25.000 iteraciones con ancho 384 y latente 128 en CPU (8 núcleos). La transferencia a una serie nueva se realiza mediante un ajuste de Koopman en forma cerrada sobre el latente congelado, con regularización ridge y una proyección de envolvente que mantiene la trayectoria en el atractor observado. No se requiere ningún paso de gradiente sobre los datos del usuario.

## Capacidades

- Pronóstico de series temporales en modo zero-shot: ajusta un operador de Koopman en forma cerrada sobre el latente congelado y realiza roll-out sin reentrenamiento.
- Descubrimiento estructural de periodicidades: los autovalores del operador de Koopman permiten identificar ciclos dominantes (p. ej., el ciclo solar de ~11 años) sin supervisión.
- Manejo de series de múltiples dominios: entrenado en electricidad, meteorología, ECG, finanzas, epidemiología, economía, física solar y sistemas caóticos.
- Capacidad multilingüe: no aplica, ya que opera sobre series numéricas; el frontmatter indica inglés, pero no hay procesamiento de lenguaje.
- Soporte de tool calling / agentes: no disponible.
- Modo de razonamiento especial: no disponible.

## Casos de uso

- **Pronóstico de demanda eléctrica**: el modelo puede predecir la carga eléctrica a corto y medio plazo a partir de series históricas, aprovechando su capacidad zero-shot para adaptarse a nuevas redes sin reentrenamiento. Su ajuste en forma cerrada lo hace adecuado para entornos con recursos computacionales limitados.
- **Predicción meteorológica local**: series de temperatura, precipitación o presión pueden ser modeladas con el operador de Koopman, capturando dinámicas estacionales y ciclos. La covarianza de escala ayuda a identificar patrones a diferentes resoluciones temporales.
- **Monitorización de señales biomédicas (ECG)**: el modelo puede detectar anomalías o predecir la evolución de series de electrocardiogramas, gracias a su capacidad para aprender atractores dinámicos. La naturaleza zero-shot permite aplicarlo a pacientes o dispositivos nuevos sin calibración.
- **Análisis financiero de bajo riesgo**: para series con dinámica suave (índices, tipos de interés), el modelo ofrece pronósticos con una mediana de habilidad frente a persistencia de -14,4%, superando a un GRU por serie (-60,6%). Es útil como componente en sistemas de apoyo a decisiones, no como única fuente.
- **Epidemiología**: seguimiento de curvas de incidencia de enfermedades infecciosas, donde la dinámica no lineal puede capturarse mediante el operador de Koopman. La transferencia zero-shot permite aplicarlo a nuevas regiones o brotes sin datos históricos extensos.
- **Detección de ciclos en física solar**: el redescubrimiento del ciclo de Schwabe (128 meses frente a los 132 conocidos) demuestra su utilidad para identificar periodicidades en series astrofísicas, con aplicaciones en predicción de actividad solar y sus efectos en telecomunicaciones.

## Benchmarks y rendimiento

La model card reporta métricas propias del modelo, no benchmarks estándar como MMLU o HumanEval. Se presentan a continuación:

| Metrica | Valor |
|---|---|
| Victorias zero-shot vs GRU por serie (40 series, in-kernel) | 25/40 (62,5%) |
| Habilidad mediana congelada vs persistencia | -14,4% (GRU: -60,6%) |
| Redescubrimiento del ciclo solar (serie de manchas solares no vista) | 128 meses vs 132 conocidos (10,7 años) |
| Precision del pretexto flecha del tiempo | 87,1% |

Estos resultados indican que el modelo supera a un GRU por serie en el 62,5% de los casos, y que su habilidad mediana frente a persistencia es significativamente mejor que la del GRU. El redescubrimiento del ciclo solar es un resultado cualitativo relevante, aunque no comparable con benchmarks estándar de la industria.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. Sin embargo, por la arquitectura descrita (latente 128, oculta 384) y el entrenamiento en CPU de 8 núcleos, se puede inferir que:

- Inferencia en CPU: viable, con latencia baja para series de longitud moderada (el ajuste de Koopman es en forma cerrada, sin iteraciones).
- VRAM estimada: no disponible, pero al ser un modelo pequeño (probablemente < 100 MB en float32), cabría en cualquier GPU consumer (p. ej., RTX 3060 o superior) si se quisiera acelerar.
- Opciones de despliegue: al no haber pesos publicados, no se puede usar con vLLM, llama.cpp u Ollama directamente. El código fuente (model.py) permitiría cargar el modelo en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la búsqueda web ni en la model card. No se puede establecer una comparativa con alternativas como Chronos, TimesFM o Lag-Llama sin datos adicionales. Se indica "no disponible".

## Limitaciones y advertencias

- **Series con spikes o raíz unitaria**: el modelo falla en series como Dogecoin o covid-india, donde la persistencia es imbatible. Cualquier pronóstico en estos dominios debe considerar esta limitación.
- **Meseta de la sonda lineal congelada**: el entrenamiento más allá de ~25.000 iteraciones no mejora la transferencia; la capacidad y la amplitud del corpus son los factores limitantes, no el número de iteraciones.
- **Umbral de iteraciones**: los pretextos solo aportan beneficio por encima de ~15.000 iteraciones; entrenamientos más cortos no producen representaciones útiles.
- **Sin pesos publicados**: el repositorio de HuggingFace está vacío (0.0 GB), por lo que no es posible descargar el modelo directamente. Se necesita acceso al código fuente y al protocolo de entrenamiento mencionados en la model card.
- **Idioma**: el frontmatter indica inglés, pero al ser un modelo de series temporales no hay implicaciones lingüísticas; la documentación y el código están en inglés.
- **Licencia MIT**: permite uso comercial y modificación, pero al no haber pesos disponibles, la aplicabilidad práctica es limitada hasta que se publiquen.

## Enlaces

- HuggingFace: https://huggingface.co/Sejibeji/tso-foundation-v13
- Dataset de entrenamiento: https://huggingface.co/datasets/sehajrsingh/tso-foundation-corpus-v11
- Repositorio fuente (mencionado en la model card, sin URL directa): no disponible en la información proporcionada.
