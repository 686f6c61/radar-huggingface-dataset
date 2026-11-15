# saa938/presonance-cowen-keltner-readout

## Resumen

Presonance Cowen–Keltner video-emotion feature readout es un modelo de regresión a nivel de características desarrollado por el usuario saa938. No se trata de un codificador neuronal de vídeo bruto, sino de una cabeza de lectura (readout) entrenada para mapear estadísticos agregados (media y desviación típica) de cuatro codificadores visuales congelados —OpenAI CLIP-L14, EVA02-L14, Meta PE-Core-L14 y Google SigLIP2-giant— a 34 valoraciones emocionales continuas de tipo poblacional, siguiendo la taxonomía del trabajo de Cowen y Keltner publicado en PNAS.

El modelo resuelve el problema de predecir la respuesta emocional media de una audiencia ante un clip de vídeo sin necesidad de reentrenar los codificadores base. Su contribución es exclusivamente el ajuste de la capa de regresión y el escalado derivado de los datos de entrenamiento. El estudio reportado por el autor, con un split de 510 clips de entrenamiento y 399 de test, alcanza una correlación de Pearson media de r=0.554682, un resultado de benchmark local controlado que el propio autor advierte que no constituye un ranking oficial ni un estado del arte certificado de forma independiente.

La relevancia actual reside en su enfoque modular: reutiliza representaciones visuales de modelos fundacionales ampliamente disponibles y añade una capa ligera interpretable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos exportados son únicamente coeficientes y parámetros de escalado, no las filas de características de entrenamiento ni las valoraciones humanas originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal sobre características agregadas (media + desviación típica) de cuatro codificadores visuales congelados; equivalente exacto a PCA de kernel lineal más ridge colapsado en pesos y sesgo |
| Parametros totales | no disponible (el repositorio contiene solo coeficientes ajustados y parámetros de escalado; el tamaño del repo es 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de regresión sobre características, no generativo) |
| Tipos de cuantizacion | no disponible (los coeficientes exportados no requieren cuantización específica; el forward de los codificadores base se documenta en BF16 CUDA con pooling en FP32) |
| Idiomas soportados | no disponible (el modelo opera sobre características visuales; no se documenta cobertura lingüística) |
| Licencia | MIT para el readout y el wrapper de inferencia; los modelos fundacionales externos conservan sus licencias originales |
| Formato de pesos | no disponible explícitamente; el autor indica que el archivo del modelo contiene coeficientes ajustados y parámetros de escalado, y el código de uso se distribuye como módulo Python (`predict.py`) |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal en el espacio de características. El método original descrito por el autor consiste en PCA de kernel lineal seguido de regresión ridge, con todos los componentes retenidos y alpha=1 seleccionados mediante validación cruzada agrupada exclusivamente sobre el conjunto de entrenamiento. Este pipeline puede colapsarse de forma exacta en los parámetros de peso y sesgo que se distribuyen en el repositorio, de modo que la inferencia no necesita reproducir el PCA ni el ajuste ridge.

Las características de entrada se construyen a partir de 16 fotogramas RGB muestreados por clip, con las transformaciones de imagen fijas originales de cada codificador, características por fotograma promediadas con flip (flip-averaged pre-logit frame features), forward en BF16 sobre CUDA y pooling en FP32 con la convención de media y desviación típica poblacional guardada. El entrenamiento se realizó sobre 510 clips y la evaluación sobre 399 clips retenidos. No se introdujeron hiperparámetros nuevos ni selección de modelo basada en test durante la exportación: las 399 predicciones guardadas coinciden dentro de 1e-10 y la correlación de test registrada dentro de 1e-12. No se documenta uso de RLHF, DPO ni datos de preferencias, al tratarse de una tarea de regresión supervisada sobre valoraciones humanas agregadas.

## Capacidades

- Predicción de 34 dimensiones emocionales continuas de tipo poblacional a partir de características visuales agregadas de un clip de vídeo.
- Agregación de representaciones de cuatro codificadores fundacionales (CLIP-L14, EVA02-L14, PE-Core-L14, SigLIP2-giant) mediante estadísticos de media y desviación típica.
- Inferencia determinista y reproducible: las predicciones guardadas coinciden con el pipeline original dentro de 1e-10.
- Integración como módulo Python ligero (`VideoEmotionReadout`) que recibe un diccionario de características por codificador.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas.
- No dispone de modo thinking, visión nativa de extremo a extremo, audio ni generación de texto.

## Casos de uso

- Investigación en psicología afectiva computacional: el modelo permite estimar la respuesta emocional media de una audiencia ante estímulos de vídeo y compararla con las 34 dimensiones del estudio de Cowen y Keltner, reutilizando codificadores visuales ya disponibles en el laboratorio.
- Análisis de contenido audiovisual a escala: dado un corpus de clips, se pueden extraer características con los cuatro codificadores congelados y aplicar el readout para obtener perfiles emocionales agregados sin reentrenar ningún modelo base.
- Evaluación de piezas publicitarias o tráilers: el readout ofrece una señal cuantitativa de la emoción poblacional esperada, útil como métrica complementaria en pruebas A/B creativas, siempre que se respete el pipeline exacto de extracción de características.
- Reproducibilidad de estudios: al distribuirse solo coeficientes y escalado, el modelo sirve para verificar resultados de un split concreto (510/399) sin necesidad de acceder a los datos originales de vídeo ni a las respuestas de participantes.
- Baseline para comparación de codificadores: permite medir cómo distintas representaciones visuales fundacionales capturan dimensiones emocionales, sirviendo como referencia en experimentos de selección de encoders.
- Docencia y prototipado: el wrapper Python y la licencia MIT facilitan su uso en cursos o pruebas de concepto sobre emoción en vídeo, con la advertencia de que no es un modelo de emoción individual ni de inteligencia emocional general.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Correlación de Pearson media (34 dimensiones) | 0.554682 | 399 clips de test retenidos (split 510 TRAIN / 399 TEST) |
| Coincidencia de predicciones guardadas | dentro de 1e-10 | 399 predicciones de test |
| Coincidencia de correlación de test registrada | dentro de 1e-12 | Test retenido |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo generativo.

## Requisitos de hardware

- El readout en sí es una regresión lineal: sus coeficientes caben en memoria de cualquier GPU consumer e incluso en CPU; el repositorio ocupa 0.0 GB.
- El coste real de inferencia proviene de los cuatro codificadores congelados: CLIP-L14, EVA02-L14, PE-Core-L14 y SigLIP2-giant. SigLIP2-giant es el componente más pesado y condiciona la VRAM necesaria.
- El autor documenta forward en BF16 sobre CUDA con pooling en FP32 para los codificadores; se recomienda GPU con soporte BF16 (A100, H100, RTX 4090, RTX 3090 o superiores).
- No se dispone de estimaciones de VRAM total, latencia ni throughput en la información proporcionada.
- Opciones de despliegue: el autor distribuye un wrapper Python (`predict.py`) con la clase `VideoEmotionReadout`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No cabe esperar despliegue en GPU consumer de gama baja si se ejecutan simultáneamente los cuatro codificadores giant; el readout aislado sí es trivial en cualquier hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (readouts de emoción sobre características visuales congeladas) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La correlación de 0.554682 mide cambios en valoraciones medias de multitud entre vídeos; no es porcentaje de acierto, no refleja la emoción de un individuo, no es un mapa de activación cerebral, no reproduce EmoMind y no constituye una puntuación general de inteligencia emocional.
- El resultado es un benchmark local controlado, no un ranking oficial de competición ni un estado del arte certificado de forma independiente.
- Las entradas deben provenir del pipeline de representación exacto: 16 fotogramas RGB muestreados por clip, transformaciones de imagen fijas originales, características por fotograma promediadas con flip, forward BF16 en CUDA con pooling FP32 y la convención guardada de media y desviación típica poblacional. Características CLIP arbitrarias o probabilidades de clase no son compatibles.
- La extracción de vídeo bruto desde cero y las revisiones alternativas de los modelos o aritméticas distintas requieren una cualificación separada; esta release pequeña no afirma una reproducción completa de extremo a extremo.
- Deben conservarse las 34 dimensiones y este split concreto; no es válido comparar la puntuación con otra tarea de vídeo ni con el ganador de una competición pública.
- Persisten limitaciones por exposición de las fuentes de entrenamiento y test y por solapamiento con el preentrenamiento de los modelos fundacionales upstream.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de extrapolación indebida si se usan características fuera de distribución.
- La licencia MIT cubre el readout y el wrapper; los modelos fundacionales externos mantienen sus licencias upstream, que deben revisarse para uso comercial.
- No se redistribuyen vídeos fuente, cachés de fotogramas, respuestas de participantes, datos cerebrales ni registros privados por clip.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saa938/presonance-cowen-keltner-readout
- Paper de referencia (Cowen y Keltner, PNAS): https://www.pnas.org/doi/10.1073/pnas.1702247114
- OpenAI CLIP: https://github.com/openai/CLIP
- EVA (BAAI Vision): https://github.com/baaivision/EVA
- Meta Perception Models (PE-Core): https://github.com/facebookresearch/perception_models
- Google Big Vision (SigLIP2): https://github.com/google-research/big_vision
