# robbyant/lingbot-touch-tiny

## Resumen

LingBot-Touch-Tiny es un modelo de representación táctil desarrollado por el usuario robbyant, concebido como un modelo fundacional para aprendizaje de representaciones sobre señales táctiles heterogéneas en el contexto de la manipulación robótica diestra. Se basa en la arquitectura JEPA (Joint Embedding Predictive Architecture): en lugar de reconstruir las señales de entrada, aprende a predecir representaciones en el espacio latente, lo que permite capturar la estructura del contacto y su evolución temporal sin depender de la modalidad sensorial concreta.

El modelo cubre tres modalidades de sensado: magnética (medidas táctiles de tres ejes), piezorresistiva (medidas escalares situadas en el canal Z) y visuotáctil (deformación o intensidad escalar decodificada, también en el canal Z; las imágenes RGB crudas no son entradas del modelo). Emplea tokenizadores específicos por modalidad y un Transformer compartido, de modo que un único espacio de representación unifica sensores físicamente distintos.

La relevancia actual del modelo radica en la fragmentación del hardware táctil en robótica: cada sensor tiene geometría, escala y semántica propias, y los modelos específicos no transfieren entre dispositivos. LingBot-Touch propone una representación compartida que puede reutilizarse para percepción táctil y control de manipulación. Esta variante "Tiny" distribuye únicamente los pesos del encoder congelado y su configuración de inferencia; el código de inferencia, los adaptadores de sensor y las cabezas de tarea se distribuyen por separado. El repositorio no contiene datos de benchmarks ni información sobre el número de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA con tokenizadores específicos por modalidad y Transformer compartido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tensorial [B,T,5,M,3] con T y M configurables) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; procesa señales táctiles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`encoder.pt`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma JEPA: el modelo aprende representaciones prediciendo en el espacio latente en lugar de reconstruir la señal de entrada. Para ello utiliza tokenizadores específicos por modalidad (magnética, piezorresistiva y visuotáctil) que proyectan cada tipo de señal a un espacio común, procesado después por un Transformer compartido. La entrada tiene forma `[B,T,5,M,3]`, donde B es el lote, T la dimensión temporal, 5 el número de dedos en orden canónico (pulgar, índice, medio, anular y meñique), M el número de taxeles y 3 los canales de medida. Las coordenadas X e Y se normalizan a [-1,1] y la Z a [0,1]; en las modalidades piezorresistiva y visuotáctil, los canales X e Y se fijan a cero y la medida escalar ocupa el canal Z.

La salida son representaciones latentes a nivel de token junto con sus direcciones temporal, de dedo y espacial, pensadas para lectura posterior mediante consultas basadas en atención. El repositorio solo contiene los pesos del encoder objetivo congelado (`encoder.pt`) y la configuración de inferencia (`config.json`); no incluye código de inferencia, adaptadores de sensor, datasets de ejemplo, predictores, cabezas de tarea posteriores, estados de optimizador, configuraciones de entrenamiento ni registros de entrenamiento. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Aprendizaje de representaciones táctiles multimodales sobre tres tipos de sensor: magnético, piezorresistivo y visuotáctil.
- Codificación de la estructura de contacto y de su evolución temporal mediante predicción en espacio latente.
- Generación de representaciones latentes a nivel de token con direcciones temporal, de dedo y espacial para consultas posteriores.
- Soporte de geometrías de sensor heterogéneas mediante tokenizadores específicos por modalidad y un Transformer compartido.
- Orden de dedos fijo y canónico (pulgar, índice, medio, anular, meñique), lo que facilita la integración en manos diestras.
- No soporta generación de texto, código, matemáticas, visión por imagen RGB, tool calling ni razonamiento multi-paso: es un encoder de representación, no un modelo generativo de lenguaje.
- No se documentan capacidades multilingües ni modos especiales como thinking mode, audio o visión.

## Casos de uso

- Percepción táctil en manos robóticas diestras: el encoder transforma las lecturas de los cinco dedos en representaciones latentes que pueden alimentar clasificadores de contacto, detección de deslizamiento o estimación de fuerza en tareas de agarre.
- Transferencia entre sensores heterogéneos: al unificar modalidades magnética, piezorresistiva y visuotáctil en un espacio compartido, permite reutilizar cabezas de tarea entrenadas con un sensor en plataformas que usan otro distinto.
- Manipulación fina con control basado en representación: las representaciones temporales permiten a un policy aprender transiciones de contacto (por ejemplo, transición de agarre a deslizamiento) usando el encoder como extractor congelado.
- Detección de eventos de contacto: la dimensión temporal T y la predicción en espacio latente facilitan detectar inicio, fin y cambios bruscos de contacto en secuencias de sensado.
- Preentrenamiento de políticas con datos no etiquetados: al ser un encoder congelado, sirve como inicialización de bajo coste para pipelines de aprendizaje por refuerzo o imitación en robótica.
- Investigación en representación multimodal táctil: base para estudiar la alineación entre modalidades y la generalización entre geometrías de sensor dentro de un mismo marco JEPA.
- Integración en simulación para robótica: uso del encoder sobre señales táctiles simuladas normalizadas para validar pipelines antes de desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica número de parámetros ni tamaño de los tensores de `encoder.pt`.
- GPU recomendadas: no disponible; al tratarse de un encoder Transformer con entrada tensorial pequeña, es probable que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada por falta de especificaciones de tamaño.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo se distribuye como pesos PyTorch (`encoder.pt`) más `config.json`, y la implementación de inferencia compatible se distribuye por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de representación táctil ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio solo contiene pesos del encoder y configuración; no incluye código de inferencia, adaptadores de sensor, datasets, predictores ni cabezas de tarea, que se distribuyen por separado.
- Es imprescindible adaptar correctamente la geometría del sensor, la lateralidad (handedness), el orden de puntos y los rangos de medida fijos antes de la inferencia; de lo contrario, las representaciones carecen de validez.
- Las imágenes RGB crudas no son entradas válidas: la modalidad visuotáctil requiere deformación o intensidad escalar decodificada en el canal Z.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; el riesgo principal es la mala calibración o el desajuste de dominio entre el sensor de entrenamiento y el de despliegue.
- No se publican datos de entrenamiento, benchmarks ni número de parámetros, lo que dificulta evaluar su rendimiento antes de integrarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo LICENSE; no se documentan restricciones adicionales.
- El modelo es una variante "Tiny"; no se especifica su relación con otras variantes de la familia LingBot-Touch.

## Enlaces

- [Hugging Face: robbyant/lingbot-touch-tiny](https://huggingface.co/robbyant/lingbot-touch-tiny)
- [Pesos del encoder (encoder.pt)](https://huggingface.co/robbyant/lingbot-touch-tiny/blob/main/encoder.pt)
- [Configuración de inferencia (config.json)](https://huggingface.co/robbyant/lingbot-touch-tiny/blob/main/config.json)
- [Licencia Apache 2.0 (LICENSE)](https://huggingface.co/robbyant/lingbot-touch-tiny/blob/main/LICENSE)
