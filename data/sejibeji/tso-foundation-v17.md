# Sejibeji/tso-foundation-v17

## Resumen

El modelo TSO Foundation v17 es un modelo base para series temporales desarrollado por el proyecto TSO (autor Sejibeji). En lugar de trocear numeros como tokens, aprende la *forma* de los sistemas dinamicos mediante un operador de Koopman, que linealiza la dinamica en un espacio latente. Se preentrena con cuatro tareas auto-supervisadas: reconstruccion, dinamica lineal de Koopman, covarianza de escala y flecha del tiempo, sobre 40 series de 8 dominios distintos. Su principal innovacion es que la transferencia a una serie nueva se realiza con un ajuste en forma cerrada del operador Koopman sobre el latente congelado, sin pasos de gradiente.

Arquitectonicamente es un operador de Koopman con encoder profundo, con dimension latente 256 y oculta 768, y no sigue la arquitectura transformer habitual. No es un modelo de lenguaje: procesa series numericas 1-D de cualquier dominio y frecuencia de muestreo. Su relevancia radica en ofrecer prevision zero-shot sin entrenamiento adicional, aunque sus resultados son modestos y el propio autor reconoce limitaciones importantes en series con picos o raices casi unitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador de Koopman con encoder profundo (no transformer). Componentes: Takens embeddings, escala espacio, lift de Koopman, cabeza de flecha del tiempo |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre series 1-D de cualquier dominio y frecuencia de muestreo, sin limite explicito) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (documentacion y codigo); el modelo procesa series numericas, no texto |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura parte de los embeddings de Takens: la serie bruta se convierte en un espacio de retardos con un tau especifico por serie. A continuacion, se construye un espacio de escala con representaciones finas y gruesas (renormalizadas); el `scale_map` fuerza la covarianza de escala, de modo que periodicidades como el ciclo solar reaparecen como modos propios limpios en las escalas gruesas. Un encoder profundo (el lift de Koopman) aplana el atractor no lineal en un espacio latente donde la dinamica es aproximadamente lineal, gobernada por un operador K. Una cabeza convolucional clasifica ventanas temporales hacia adelante frente a invertidas (pretexto de flecha del tiempo).

El preentrenamiento utiliza cuatro perdidas auto-supervisadas: reconstruccion, dinamica lineal de Koopman, covarianza de escala y flecha del tiempo. El corpus es `sehajrsingh/tso-foundation-corpus-v11`, que contiene 40 series en 8 dominios (redes electricas, meteorologia, ECG, finanzas, epidemiologia, economia, fisica solar y sistemas caoticos). El entrenamiento se realizo con 25.000 iteraciones en CPU (Kaggle) y en una T4 via Modal, segun el model card. No se menciona RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Prevision de series temporales zero-shot: no requiere entrenamiento sobre los datos de destino.
- Descubrimiento estructural de ciclos: puede identificar periodicidades a partir de los valores propios del operador Koopman ajustado (por ejemplo, redescubre el ciclo solar de Schwabe de ~11 anos).
- Deteccion de la flecha del tiempo: clasifica si una ventana temporal esta en orden natural o invertido, con una precision reportada del 82,8 % en el preentrenamiento.
- Invariancia de escala: el modelo mantiene covarianza de escala, lo que permite analizar el mismo sistema a distintas resoluciones.
- Transferencia entre dominios: se evaluo en 40 series de 8 dominios distintos, con 30/40 victorias frente a un GRU entrenado por serie.
- No soporta tool calling, generacion de texto, vision ni audio; es exclusivamente un modelo de prevision de series temporales.

## Casos de uso

- Prevision de demanda electrica: el modelo puede predecir la carga de una red a partir de la serie historica local, sin entrenamiento adicional. Su operador lineal en el espacio latente captura la dinamica subyacente, y el ajuste en forma cerrada permite actualizar la prevision con solo los datos disponibles.
- Monitorizacion de señales ECG: para series biometricas como el ECG, el modelo puede modelar atractores no lineales y ayudar a detectar patrones anomalos o prever la evolucion de la señal. Se probo en este dominio durante el preentrenamiento.
- Analisis de series financieras: en activos con dinamica relativamente suave, puede generar previsiones a corto plazo sin reentrenamiento. Se debe tener precaucion con series volatiles o con picos, ya que el autor indica que la persistencia es imbatible en esos casos.
- Seguimiento epidemiologico: modelar la propagacion de enfermedades a partir de series de casos. El autor menciona covid-india como un caso limite, por lo que es adecuado para series con tendencias suaves, no con picos abruptos.
- Fisica solar: analizar series de manchas solares para descubrir ciclos de actividad. El redescubrimiento del ciclo de Schwabe demuestra su utilidad en investigacion cientifica y en la prevision de actividad solar.
- Prevision meteorologica local: generar predicciones de temperatura o precipitacion a partir de series historicas de una estacion. Su naturaleza de operador Koopman es adecuada para dinamicas caoticas y periodicas.
- Economia aplicada: prever series macroeconomicas como PIB o inflacion, donde las dinamicas suelen ser mas suaves y el modelo puede competir con la persistencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Victorias zero-shot frente a GRU por serie (40 series) | 30/40 (75,0 %) |
| Mediana de skill congelado frente a persistencia | +1,0 % (GRU: -60,6 %) |
| Redescubrimiento del ciclo solar (manchas solares fuera de muestra) | 129 meses frente a 132 conocidos (10,7 anos) |
| Precision del pretexto de flecha del tiempo | 82,8 % |

Estos son los resultados reportados por el autor en la model card. No se han publicado benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo usa dimension latente 256 y oculta 768, lo que sugiere un tamano reducido, pero no se ofrecen medidas oficiales de consumo de memoria.
- GPU recomendada: no disponible. El entrenamiento se realizo en CPU (Kaggle) y en una T4 (Modal), por lo que la inferencia deberia ser viable en hardware modesto, aunque no hay especificaciones confirmadas.
- Cabe en GPU de consumo: no se dispone de una confirmacion oficial; el tamano del modelo es pequeno, pero no se aportan datos de VRAM.
- Opciones de despliegue: el codigo oficial usa Python y PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de una comparativa con otros modelos fundacionales de series temporales en la informacion proporcionada. Los unicos puntos de referencia son un GRU entrenado por serie y la persistencia, cuyos resultados se recogen en los benchmarks.

| Modelo | Enfoque | Skill mediano frente a persistencia |
|---|---|---|
| TSO Foundation v17 | Operador de Koopman zero-shot | +1,0 % |
| GRU por serie | Entrenado por serie | -60,6 % |
| Persistencia | Ultimo valor observado | 0 % (referencia) |

## Limitaciones y advertencias

- El autor reconoce que las series con picos o raices casi unitarias (por ejemplo, Dogecoin o covid-india) son dificiles de modelar; en esos casos la persistencia es imbatible.
- El rendimiento del modelo se satura alrededor de 25.000 iteraciones de preentrenamiento a esta anchura; aumentar la capacidad o la amplitud del corpus son las palancas, no mas iteraciones.
- Las perdidas de los pretextos solo aportan ganancias a partir de ~15.000 iteraciones.
- No se han documentado sesgos especificos, pero al ser un modelo probabilistico de series temporales, las predicciones pueden ser incorrectas en escenarios de cambio de regimen.
- La licencia MIT permite uso comercial y modificacion sin restricciones.
- Para produccion, se debe validar la skill frente a la persistencia en cada serie objetivo; el modelo no es un sustituto de un pipeline de forecasting tradicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sejibeji/tso-foundation-v17
- Perfil del autor: https://huggingface.co/Sejibeji
- Dataset de preentrenamiento: https://huggingface.co/datasets/sehajrsingh/tso-foundation-corpus-v11
