# priyamraj99/CSCA-Net-HiAV-Mix

## Resumen

CSCA-Net es un detector de deepfakes audiovisuales diseñado específicamente para vídeos con cambio de código hindi-inglés (hinglish), el tipo de contenido que circula habitualmente por aplicaciones de mensajería como WhatsApp. Lo desarrollan Priyam Raj, Paurav Goel y Ranjit Singh, y se publica como implementación de referencia del benchmark HiAV-Mix, presentado en un artículo enviado a revisión en 2026. El modelo resuelve un problema concreto: los detectores de deepfakes existentes se entrenan mayoritariamente sobre inglés y no capturan las particularidades acústicas y lingüísticas del habla code-switched.

El checkpoint distribuido contiene 11,6 millones de parámetros en pesos EMA, con un tamaño de fichero de 47 MB, y se distribuye en formato PyTorch (`.pt`) junto con la configuración, la temperatura de calibración y las métricas de validación. No es un modelo generativo ni un LLM: es un clasificador binario a nivel de clip que procesa ventanas de 64 fotogramas a 25 fps (2,56 segundos) con recortes de boca de 88×88, recortes de cara de 112×112 y audio mono a 16 kHz.

Su relevancia actual radica en que aborda dos frentes poco cubiertos: la detección de falsificaciones audiovisuales en un idioma de bajos recursos como el hinglish y la evaluación cuantitativa de las explicaciones (KernelSHAP temporal y Grad-CAM++), un aspecto que la mayoría de detectores publicados no valida de forma sistemática.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de clasificación audiovisual (detalles internos no disponibles en la model card) |
| Parámetros totales | 11,6 M (pesos EMA) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de 64 fotogramas a 25 fps (2,56 s); vídeos más largos mediante ventanas deslizantes |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Hindi-inglés code-switched (hinglish) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |
| Entrada | 88×88 recortes de boca, 112×112 recortes de cara, audio mono 16 kHz |
| Salida | Probabilidad calibrada de falsedad por clip, curva de falsedad por fotograma |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card no detalla la topología interna de CSCA-Net más allá de que se trata de un detector audiovisual con fusión de las dos modalidades. El pipeline procesa simultáneamente recortes faciales, recortes de boca y audio, y produce una puntuación a nivel de clip junto con una curva de falsedad por fotograma. Los pesos publicados son los de media móvil exponencial (EMA) utilizados en todos los resultados reportados, y cada checkpoint incluye la temperatura de calibración ajustada (1,388 para la semilla 0; 0,670 para la semilla 1; 0,731 para la semilla 2).

El entrenamiento se realizó sobre HiAV-Mix, un benchmark propio de vídeos manipulados construido a partir de 15 hablantes, todos figuras públicas en entrevistas de VoxCeleb2, con cuatro generadores de deepfake: XTTS-v2, kNN-VC, Seed-VC y LatentSync 1.5. Se entrenaron tres semillas independientes (mejor época en 13, 8 y 6 respectivamente), lo que permite reportar media y desviación estándar en las métricas. No se indica en la información disponible el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un clasificador de este tipo).

La innovación destacable es doble: por un lado, el enfoque en habla code-switched hindi-inglés, ausente en los benchmarks habituales de detección de deepfakes; por otro, la evaluación cuantitativa de las explicaciones post-hoc (KernelSHAP temporal y Grad-CAM++), que se genera como informe forense mediante el comando `python -m exav explain`.

## Capacidades

- Clasificación binaria de vídeos como reales o falsos, con probabilidad calibrada por temperatura.
- Detección conjunta de manipulaciones de audio, vídeo y sincronización labial (lip-sync).
- Localización temporal aproximada de la manipulación mediante curva de falsedad por fotograma.
- Generación de informes forenses explicables con KernelSHAP temporal y Grad-CAM++.
- Procesamiento de vídeos de duración arbitraria mediante ventanas deslizantes de 2,56 s.
- Robustez parcial frente a recodificación tipo WhatsApp: cinco perfiles de transcodificación evaluados.
- Capacidad de generalización limitada a generadores no vistos (leave-one-out) y a otros datasets (FakeAVCeleb).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo de lenguaje.

## Casos de uso

- Moderación de contenido en aplicaciones de mensajería: el modelo puede puntuar clips cortos reenviados por WhatsApp y marcar aquellos con alta probabilidad de falsedad, aprovechando su robustez medida frente a recodificación (AUC 81,8–83,1 en cinco perfiles de transcodificación).
- Verificación periodística de vídeos virales en hindi-inglés: un redactor puede ejecutar el detector sobre un clip sospechoso y obtener una probabilidad calibrada junto con una curva temporal que indique en qué segmentos se concentra la anomalía.
- Análisis forense con trazabilidad: el informe con KernelSHAP temporal y Grad-CAM++ permite documentar qué regiones y fotogramas sustentan la decisión, útil en contextos de rendición de cuentas siempre que se acompañe de revisión humana.
- Investigación en detección de deepfakes multilingües: sirve como línea base para comparar detectores entrenados en inglés frente a habla code-switched, dado que el benchmark HiAV-Mix está diseñado para ese fin.
- Detección de suplantación de voz en audios con cambio de código: los generadores XTTS-v2, kNN-VC y Seed-VC incluidos en el entrenamiento cubren manipulación de voz, por lo que el modelo puede emplearse en triaje de audios sospechosos con habla hinglish.
- Auditoría de pipelines de generación audiovisual: un equipo que despliegue LatentSync 1.5 u otro generador puede usar CSCA-Net como test de regresión para medir si sus salidas son detectables.
- Filtrado previo en plataformas de contenido generado por usuarios: dado su tamaño reducido (47 MB, 11,6 M de parámetros), puede ejecutarse en CPU como primera etapa de cribado antes de revisiones más costosas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de HiAV-Mix (media ± desviación estándar sobre las tres semillas):

| Medida | Valor |
|---|---|
| AUC a nivel de clip | 83,0 ± 0,9 |
| Average precision | 87,1 ± 0,7 |
| Equal error rate | 26,6 ± 2,5 |
| TPR con 1 % FPR | 35,1 ± 8,1 |
| AUC a nivel de fotograma | 84,5 ± 2,5 |
| AUC bajo transcodificación tipo WhatsApp (5 perfiles) | 81,8 – 83,1 |
| AUC en generadores no vistos (leave-one-out, semilla 0) | 72,4 – 83,1 |
| AUC en FakeAVCeleb (cross-dataset) | 69,7 ± 0,6 |

El dato más débil es el AUC de 69,1 en falsificaciones de lip-sync con audio genuino, que el propio autor señala como el peor caso. No se han publicado comparaciones directas con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos (47 MB por checkpoint); el consumo real depende del extractor de características faciales y de audio del pipeline, no especificado en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060 o superior.
- Ejecución en CPU: soportada explícitamente (`load_checkpoint(..., "cpu")`), viable para inferencia de clips individuales.
- Opciones de despliegue: el repositorio oficial expone los módulos `exav.training.trainer`, `exav.serving.inference` y el CLI `python -m exav` para preprocesado, inferencia y explicaciones. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros detectores audiovisuales de deepfakes en la información proporcionada. Como referencia cualitativa:

| Modelo | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| CSCA-Net (este) | Detección audiovisual con explicaciones cuantificadas | Hinglish | MIT | Pesos en Hugging Face, código en GitHub |
| Detectores entrenados en FakeAVCeleb | Detección audiovisual genérica | Principalmente inglés | Variable según implementación | No disponible en esta ficha |
| Detectores de lip-sync (p. ej. basados en LatentSync) | Detección de sincronización labial | Independiente del idioma | Variable | No disponible en esta ficha |

La comparación cuantitativa con alternativas concretas no está disponible en la documentación consultada.

## Limitaciones y advertencias

- El entrenamiento cubre solo 15 hablantes, todos figuras públicas de VoxCeleb2, lo que limita la generalización a personas fuera de ese perfil demográfico y audiovisual.
- No hay deepfakes de face-swap ni generados por GAN en los datos de entrenamiento; el modelo solo ha visto manipulaciones de los cuatro generadores citados.
- El rendimiento cae de forma notable en generadores no vistos (AUC 72,4–83,1) y en conjuntos externos como FakeAVCeleb (AUC 69,7), y es especialmente débil en lip-sync con audio genuino (AUC 69,1).
- El TPR con 1 % de FPR es bajo (35,1 ± 8,1), lo que implica muchos falsos negativos en regímenes de alta precisión.
- Las atribuciones post-hoc revelan en qué se fija el detector, pero no localizan de forma fiable la manipulación; para eso debe usarse la curva de falsedad por fotograma.
- El modelo es un artefacto de investigación: el autor advierte explícitamente que no debe sustentar decisiones automatizadas sobre personas y que toda detección requiere revisión humana.
- El dataset HiAV-Mix no es público y solo se comparte bajo acuerdo de uso de datos para investigación, lo que dificulta la reproducción independiente.
- Licencia MIT para el código y los pesos, sin restricciones adicionales para uso comercial indicadas, aunque la naturaleza de investigación del artefacto desaconseja su despliegue en producción sin validación propia.
- No se documentan sesgos específicos por género, edad o acento más allá de la composición del conjunto de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priyamraj99/CSCA-Net-HiAV-Mix
- Repositorio de código, configuraciones y logs: https://github.com/rajpriyam99/Deepfake--HiAV-Mix
- Artículo de referencia: P. Raj, P. Goel y R. Singh, "HiAV-Mix: A Code-Switched Hindi–English Audio-Visual Deepfake Benchmark for Messaging-App Misinformation, with Quantitatively Evaluated Explanations", enviado, 2026 (sin DOI disponible).
