# Snapkitty/nano-gemini

## Resumen

Nano-Gemini es un modelo fundacional de series temporales de clase "Nano" desarrollado por Snapkitty sobre un backbone Gemma-3. Implementa un pipeline completo de forecasting no autorregresivo con parcheado (patch de 32), normalización RevIN, atención GQA con RoPE 10k y QK-Norm, y cabezal de cuantiles con 9 cuantiles (0.1 a 0.9). El modelo distribuido (Nano) tiene aproximadamente 0,30 millones de parámetros con d_model=64 y 4 capas, mientras que la especificación G6 (6.157.679.744 parámetros, d_model=4096, 28 capas) se documenta como blueprint sin pesos publicados.

El modelo preserva el contrato de TimesFM-3: parcheado de 32, RevIN, cabezal de cuantiles por parche, decodificación no autorregresiva, soporte multivariante y covariables past-only y past-future. No utiliza pesos de Google ni de TimesFM. Se distribuye bajo triple licencia (Sovereign Source v1.0, BSL-1.1 y AGPL-3.0). Su relevancia reside en que ejecuta y entrena en hardware de consumo (RTX 3080 10GB) manteniendo el pipeline completo de un modelo de series temporales de nivel fundacional. El repositorio se publicó el 3 de septiembre de 2026 y se encuentra en una fase muy temprana de adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Gemma-3 adaptado para series temporales (adapter residual 192->d_model, GemmaMixingBlock x4, cabezal de cuantiles) |
| Parametros totales | ~0,30M (Nano, distribuido) / 6.157.679.744 (~6,15B, G6, solo especificacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por parches de 32, salida de 64; secuencia de entrada variable, p. ej. T=128 en el ejemplo) |
| Tipos de cuantizacion | GGUF (parseado via GGUFParser); Int4 referenciado para la spec G6 (3GB) |
| Idiomas soportados | no aplica (modelo de series temporales, no procesa texto) |
| Licencia | Triple: Sovereign Source v1.0, BSL-1.1, AGPL-3.0 |
| Formato de pesos | GGUF (entrada), implementaciones torch y numpy en el repositorio |

## Arquitectura y entrenamiento

Nano-Gemini adapta un decoder Gemma-3 al dominio de series temporales. La entrada pasa por interpolación de NaNs, normalización RevIN (media/desviación móvil), parcheado en ventanas de 32, y un adapter residual (192->d_model) que es el único mapeo aprendido de parches continuos al espacio oculto de Gemma. El stack Gemma utiliza atención GQA (4 cabezales de query, 4 de key/value para Nano; 32/8 para G6), RoPE con frecuencia 10k, QK-Norm y MLP GeGLU. La salida pasa por un cabezal de cuantiles (64x9 por parche), desnormalización RevIN inversa y cosido con mezcla de solapamiento.

El entrenamiento sigue el contrato TimesFM-3: parcheado de 32, RevIN, cabezal de cuantiles por parche, decodificación no autorregresiva, soporte multivariante y covariables past-only y past-future. Se aproximan aspectos como GeGLU frente a ReLU FFN, el lookahead dim y la alternancia 1:1. La mezcla de datos de entrenamiento, la función de pérdida y el optimizador se marcan explícitamente como UNKNOWN. El pipeline se construye parseando ficheros GGUF (sovereign-gemini-gguf) hacia un grafo intermedio (ModelGraph IR de 36 bloques) y posteriormente a una implementación torch (GemmaTimeSeriesTorch).

## Capacidades

- Forecasting de series temporales con salida puntual y 9 cuantiles (0.1 a 0.9) por horizonte.
- Soporte multivariante: entrada de forma (V, T) con V variables simultáneas.
- Covariables past-only (C, T) y past-future (C, T+H) según el contrato TimesFM-3.
- Decodificación no autorregresiva: genera el horizonte completo en un solo paso.
- Imputación de valores NaN mediante interpolación previa al parcheado.
- Normalización RevIN con estadísticas móviles (running mean/std).
- Parcheado con cosido por mezcla de solapamiento (overlap blend).
- Implementación numpy de referencia sin dependencias de torch para inferencia básica.
- Ejecutable y entrenable en hardware de consumo (RTX 3080 10GB).

## Casos de uso

- Previsión financiera: el modelo puede generar predicciones puntuales y de intervalo (9 cuantiles) sobre series de precios o volúmenes, con covariables como indicadores macroeconómicos pasados y futuros.
- Demanda energética: predicción de consumo eléctrico multivariante por zonas o clientes, utilizando covariables past-future como
