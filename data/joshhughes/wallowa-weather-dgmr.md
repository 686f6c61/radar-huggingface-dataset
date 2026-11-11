# JoshHughes/wallowa-weather-dgmr

## Resumen

Wallowa Weather DGMR es un empaquetado del Deep Generative Model of Rainfall (DGMR) de DeepMind, adaptado por Joshua Hughes para su uso en la aplicación móvil Wallowa Weather. El modelo original, publicado por DeepMind en 2021, es un modelo generativo de nowcasting de precipitación que predice la evolución de la lluvia a partir de fotogramas de radar. Esta versión concreta reexpresa los pesos originales como kernels de WebGPU para ejecución on-device en teléfonos, con cuantización a enteros de 8 bits en la raíz del repositorio y una variante en coma flotante de 16 bits en el subdirectorio `f16/`.

El modelo toma 4 fotogramas de radar separados 5 minutos entre sí, con resolución de 1 km y 256 x 256 píxeles, y genera 18 fotogramas de tasa de precipitación que cubren desde +5 hasta +90 minutos. La innovación de este empaquetado no reside en el modelo en sí, sino en su despliegue: los kernels WebGPU propios de la aplicación ejecutan la inferencia directamente en el dispositivo del usuario, sin necesidad de servidores. El repositorio incluye un `manifest.json` con los hashes SHA-256 de cada archivo y de cada fragmento de 16 MiB, que la aplicación verifica antes de ejecutar nada.

Es relevante como ejemplo de despliegue de modelos generativos de alta resolución en entornos con recursos limitados y como caso de estudio de cuantización int8 con plegado de normalización espectral y por lotes. No obstante, conviene subrayar que se trata de un experimento: el modelo fue entrenado por DeepMind con radar del Reino Unido y aquí se aplica a radar de EE. UU. (NOAA MRMS), por lo que no es una previsión fiable ni un producto oficial de DeepMind o Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de nowcasting de precipitación (DGMR, Deep Generative Model of Rainfall) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 4 fotogramas de radar (256 x 256, 1 km, 5 min entre fotogramas) |
| Tipos de cuantizacion | int8 (pesos y activaciones) en la raíz; f16 en el subdirectorio `f16/` |
| Idiomas soportados | no disponible (modelo de datos radar, no lingüístico) |
| Licencia | CC BY 4.0 (Copyright 2021 DeepMind Technologies Limited) |
| Formato de pesos | WebGPU kernels; manifiesto `manifest.json` con SHA-256 por archivo y por fragmento de 16 MiB |

## Arquitectura y entrenamiento

DGMR es un modelo generativo de DeepMind diseñado para el nowcasting de precipitación a partir de secuencias de radar. La información disponible no detalla la arquitectura interna más allá de su naturaleza generativa, pero el empaquetado sí revela detalles técnicos del proceso de conversión: los pesos se cuantizan a enteros de 8 bits y las activaciones a 8 bits, con plegado de la normalización espectral y de la normalización por lotes en las capas convolucionales. En el subdirectorio `f16/` los pesos se convierten a coma flotante de 16 bits. Ambas variantes se reexpresan como kernels de WebGPU para su ejecución en el navegador o en el runtime del dispositivo.

El entrenamiento original fue realizado por DeepMind con radar del Reino Unido. Esta adaptación no ha sido reentrenada: Wallowa Weather la ejecuta sobre radar de EE. UU. (NOAA MRMS) como experimento, lo que constituye un cambio de dominio significativo. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Nowcasting de precipitación: genera 18 fotogramas de tasa de lluvia que cubren de +5 a +90 minutos a partir de 4 fotogramas de radar de entrada.
- Entrada de radar de alta resolución: 256 x 256 píxeles con resolución espacial de 1 km y cadencia temporal de 5 minutos.
- Inferencia on-device: ejecución mediante kernels WebGPU propios de la aplicación, sin dependencia de servidores.
- Verificación de integridad: el manifiesto permite comprobar SHA-256 de cada archivo y de cada fragmento de 16 MiB antes de la ejecución.
- Cuantización int8 con plegado de normalización: reduce el coste computacional y de memoria para despliegue en dispositivos móviles.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Nowcasting de lluvia en aplicación móvil: la aplicación Wallowa Weather integra el modelo para mostrar la evolución probable de la precipitación en los próximos 90 minutos, ejecutando la inferencia localmente mediante WebGPU.
- Visualización de radar aumentada: a partir de los 4 fotogramas recientes de radar, la app puede generar una animación de los 18 fotogramas siguientes para que el usuario vea la tendencia de la lluvia en su zona.
- Despliegue sin backend: al ejecutarse on-device, el modelo permite ofrecer predicciones a corto plazo sin coste de servidor ni latencia de red, útil en aplicaciones con muchos usuarios o en entornos con conectividad limitada.
- Investigación en cuantización de modelos generativos: el empaquetado int8 con plegado de normalización espectral y por lotes sirve como referencia para estudiar la viabilidad de ejecutar modelos generativos de alta resolución en hardware móvil.
- Evaluación de transferencia de dominio: al aplicar un modelo entrenado con radar del Reino Unido a datos de NOAA MRMS, el repositorio permite estudiar el comportamiento de DGMR fuera de su dominio original.
- Integración en pipelines de verificación de integridad: el esquema de manifiesto con SHA-256 por fragmento puede reutilizarse como patrón para distribuir pesos de modelos de forma verificable en aplicaciones cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,2 GB, lo que da una cota superior del tamaño de los pesos empaquetados, pero no se especifica el consumo en tiempo de ejecución.
- GPU recomendadas: no disponible. El destino declarado es la ejecución on-device mediante WebGPU en teléfonos, no GPUs de servidor.
- Compatibilidad con GPU de consumo: el modelo está diseñado para ejecutarse en el dispositivo del usuario a través de WebGPU, por lo que no requiere una GPU de escritorio dedicada; no se detallan los modelos de teléfono compatibles.
- Opciones de despliegue: kernels WebGPU propios de la aplicación Wallowa Weather; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wallowa Weather DGMR (este) | DGMR empaquetado para WebGPU | 4 fotogramas radar 256x256 / 18 fotogramas de lluvia | int8 y f16 | CC BY 4.0 | Hugging Face (repo de 0,2 GB) |
| DGMR original de DeepMind | Modelo generativo de nowcasting | Radar UK / predicción de precipitación | no disponible | no disponible en la informacion | Publicación de 2021 (no se detalla el repositorio) |
| Otros modelos de nowcasting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es una previsión fiable: el propio autor indica explícitamente que no debe usarse como forecast de confianza.
- Cambio de dominio: el modelo fue entrenado por DeepMind con radar del Reino Unido y aquí se aplica a radar de EE. UU. (NOAA MRMS), lo que puede degradar la calidad de las predicciones.
- No es un producto oficial: no es un producto de DeepMind ni de Google, sino una modificación de Joshua Hughes.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero exige acreditar a DeepMind Technologies Limited (Copyright 2021) y consultar `NOTICE.md`; no se detallan restricciones adicionales.
- Sesgos y alucinación: no aplican en el sentido lingüístico, pero el modelo generativo puede producir patrones de precipitación plausibles pero incorrectos, especialmente fuera de su dominio de entrenamiento.
- Idiomas: no aplica; el modelo opera sobre datos de radar, no sobre texto.
- Verificación de integridad obligatoria: la aplicación comprueba cada archivo y fragmento contra el manifiesto antes de ejecutar; un manifiesto o unos pesos alterados impedirán la inferencia.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su rendimiento frente al DGMR original u otras alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/JoshHughes/wallowa-weather-dgmr
- Repositorio con manifiesto de integridad: `manifest.json` dentro del repositorio de Hugging Face
- Licencia: `LICENSE` (CC BY 4.0) dentro del repositorio de Hugging Face
- Aviso de atribución: `NOTICE.md` dentro del repositorio de Hugging Face
- Paper original de DGMR (DeepMind, 2021): no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
