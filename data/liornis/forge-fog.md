# Liornis/forge-fog

## Resumen

FORGE (FOG Representation via Generative Encoding) es un conjunto de codificadores auto-supervisados para la deteccion de episodios de congelacion de la marcha (Freezing of Gait, FOG) en enfermedad de Parkinson a partir de un unico acelerometro situado en la zona lumbar baja. Lo publica el usuario Liornis en HuggingFace bajo licencia MIT. El modelo se preentrena mediante autoencodificacion enmascarada (masked autoencoding) sobre 11.724 horas (aproximadamente 21 millones de ventanas) de grabaciones domiciliarias sin etiquetar procedentes de 65 participantes, y despues se ajusta para deteccion de FOG unicamente sobre la cohorte DeFOG de 57 participantes.

El problema que aborda es la generalizacion entre cohortes: la mayoria de detectores de FOG se degradan al cambiar de estudio, de protocolo, de dispositivo o de estado de medicacion. FORGE se evalua sin entrenamiento en la cohorte objetivo (zero-shot) en cuatro cohortes externas, y reporta una concordancia a nivel clinico con la anotacion experta por video: ICC(%TF) = 0,899 [0,700; 0,970] en la cohorte FogAtHome-provoking con un solo IMU.

Es relevante porque demuestra que el preentrenamiento auto-supervisado sobre datos no etiquetados de la vida diaria mejora de forma medible la transferencia a cohortes externas respecto a entrenar desde cero de forma supervisada (por ejemplo, +0,212 de AUROC en tDCS-FOG). No es un modelo linguistico: es un modelo de clasificacion de series temporales de sensores inerciales, con 12,9-14,1 millones de parametros por codificador y ventanas de 200, 500 o 1000 fotogramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador auto-supervisado tipo autoencoder enmascarado (MAE) sobre representaciones espectrales-temporales de series temporales; numero de capas y dimension oculta no disponibles |
| Parametros totales | 14.147.072 (contextos LC y MC), 12.918.272 (contexto SC) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de 1000 fotogramas (LC), 500 fotogramas (MC) y 200 fotogramas (SC); la frecuencia de muestreo no se especifica |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo de series temporales de acelerometro, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (con metadatos de cadena: name, context, phase, fold, seed y la configuracion `experiment`) |
| Tamano del repositorio | 2,1 GB |
| Modalidad de entrada | acelerometro unico en zona lumbar baja |
| Pipeline declarado | other |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

FORGE es una familia de codificadores auto-supervisados que aprenden representaciones espectrales-temporales de senales de acelerometro mediante autoencodificacion enmascarada. Se publican tres variantes segun la longitud de ventana de contexto: LC (1000 fotogramas, `encoders/lc.safetensors`), MC (500 fotogramas, `encoders/mc.safetensors`) y SC (200 fotogramas, `encoders/sc.safetensors`). El preentrenamiento usa 11.724 horas de grabaciones domiciliarias sin etiquetar de 65 participantes, lo que equivale a unos 21 millones de ventanas. La model card no detalla la composicion del dataset, la funcion de perdida ni el numero de tokens o epocas.

Sobre el codificador congelado se entrenan cabezas de clasificacion en tres fases distintas (`probe`, `finetune` y `supervised`) y tres particiones de validacion cruzada a nivel de participante sobre la cohorte DeFOG (57 participantes), con semilla 42. La comparacion controlada del articulo enfrenta dos ramas que solo difieren en la inicializacion del codificador, con el mismo entrenamiento posterior: auto-supervisado frente a supervisado desde cero. El detector liberado promedia nueve cabezas (3 particiones x 3 semillas) sobre un unico codificador congelado; el lanzamiento publica las 27 cabezas de la semilla 42, cuya ensembla de tres particiones queda a unos 0,02 de los numeros de nueve cabezas. El punto de operacion de DeFOG es 0,35. La publicacion es solo de pesos: no incluye configuracion de entrenamiento, estado del optimizador ni rutas locales, y la carga no ejecuta codigo serializado con pickle.

## Capacidades

- Deteccion binaria de episodios de congelacion de la marcha (FOG) a partir de la senal de un acelerometro lumbar.
- Estimacion del porcentaje de tiempo en congelacion (%TF) con concordancia tipo clinico frente a anotacion experta por video (ICC = 0,899 en FogAtHome-provoking).
- Extraccion de representaciones auto-supervisadas reutilizables: los codificadores preentrenados se pueden congelar y usar como extractor de caracteristicas con cabezas ligeras (fase `probe`).
- Transferencia zero-shot a cohortes externas sin entrenamiento en la cohorte objetivo (cuatro cohortes evaluadas).
- Tres contextos temporales alternativos (200, 500 y 1000 fotogramas) para ajustar la latencia y el alcance temporal del detector.
- Clasificacion de ventanas individuales con posterior agregacion a nivel de registro para obtener %TF.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio.
- Capacidades multilingues: no aplica.

## Casos de uso

- Monitorizacion ambulatoria domiciliaria de pacientes con Parkinson: el codificador MC, preentrenado precisamente con grabaciones de la vida diaria, procesa la senal de un unico acelerometro lumbar y estima el %TF sin necesidad de anotacion experta ni de personal en la habitacion.
- Deteccion de FOG en ensayos clinicos con protocolos provocativos: el rendimiento en tDCS-FOG (AUROC 0,917; ICC 0,876) lo hace util para cuantificar el efecto de intervenciones comparando el %TF antes y despues del tratamiento.
- Cribado y seguimiento longitudinal personalizado: al mantener el punto de operacion 0,35 se pueden generar series temporales de episodios por paciente para analizar tendencias semanales o mensuales de congelacion.
- Estimacion de carga de congelacion durante la deambulacion: el modelo permite calcular la carga condicionada a marcha y sedestacion en registros naturalistas (en FogAtHome daily living se puntua sobre un subdominio de 58,18 h de 301,8 h, con un 2,92 % de FOG).
- Investigacion en representaciones de series temporales: los pesos de `encoders/*.safetensors` sirven como base congelada para probar nuevas cabezas, nuevas tareas de actividad humana o nuevos sensores, gracias a la evaluacion por sonda congelada.
- Integracion en pipelines de investigacion reproducibles: cada archivo incluye metadatos (contexto, fase, particion, semilla y configuracion `experiment`) y `manifest.yaml` documenta los resultados y sus intervalos de confianza, lo que facilita replicar tablas del articulo.
- Desarrollo de prototipos con recursos muy limitados: con 12,9-14,1 millones de parametros, el modelo se puede ejecutar en CPU o en GPU de gama baja dentro de un dispositivo portatil o de un ordenador de investigacion.

## Benchmarks y rendimiento

Resultados externos del detector liberado (ensembla de nueve cabezas MC con sonda congelada, 3 particiones x 3 semillas), sin entrenamiento en la cohorte objetivo y con el punto de operacion fijo de DeFOG en 0,35:

| Cohorte (N) — tipo de desplazamiento | AUROC | AP | ICC(%TF) |
|---|---|---|---|
| FogAtHome-provoking (12) — entre estudios | 0,887 [0,830; 0,922] | 0,804 [0,573; 0,902] | 0,899 [0,700; 0,970] |
| tDCS-FOG (71) — entre protocolos | 0,917 [0,863; 0,950] | 0,812 [0,550; 0,923] | 0,876 [0,810; 0,920] |
| Stanford (7) — sitio / dispositivo / estado de medicacion | 0,734 [0,624; 0,846] | 0,400 | -0,119 [-0,920; 0,670] |
| FogAtHome daily living (11) — naturalista | 0,803 [0,737; 0,877] | 0,105 | 0,656 [-0,129; 0,872] |

Notas de la model card: la cohorte daily living se puntua dentro de un dominio de marcha y bipedestacion independiente de la etiqueta (58,18 h de 301,8 h, 2,92 % de FOG), por lo que mide carga condicionada a marcha y no %TF del registro completo. Stanford se presenta como evidencia negativa: la discriminacion se mantiene, pero el umbral fijo no (su umbral por regla oraculo es 0,18). Referencia en distribucion: AP a nivel de ventana de 0,730 en las particiones de validacion de DeFOG.

Comparacion controlada del articulo (conjunto de modelos distinto, dos ramas que solo difieren en la inicializacion del codificador bajo el mismo entrenamiento posterior):

| Cohorte | Metrica | Auto-supervisado | Supervisado desde cero | Diferencia [IC 95 %] |
|---|---|---|---|---|
| FogAtHome-provoking | AUROC | 0,861 | 0,752 | +0,109 [0,029; 0,182] |
| FogAtHome-provoking | AP | 0,784 | 0,592 | +0,192 [0,064; 0,338] |
| tDCS-FOG | AUROC | 0,869 | 0,657 | +0,212 [0,126; 0,280] |
| tDCS-FOG | AP | 0,811 | 0,501 | +0,310 [0,133; 0,397] |

No se han publicado en la informacion disponible resultados de benchmarks genericos tipo MMLU, HumanEval o GSM8K, ya que el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por codificador en precision de 32 bits (14,1 millones de parametros equivalen a unos 56 MB de pesos, mas activaciones de la ventana de entrada). El conjunto de 27 cabezas de clasificacion mas los 3 codificadores ocupa 2,1 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo esta muy por debajo de los requisitos de una A100 o una H100, que lo ejecutarian con una utilizacion marginal.
- Compatibilidad con GPU de consumo: si, cabe sin problema en cualquier GPU de consumo (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: carga directa de safetensors con el repositorio companero indicado en la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: los pesos de los codificadores son pequenos, pero el repositorio completo ocupa 2,1 GB.

## Comparativa con modelos similares

No se dispone de otros modelos comparables en la informacion proporcionada. La unica comparacion documentada es interna al propio trabajo y enfrenta el mismo modelo con inicializacion auto-supervisada frente al mismo modelo entrenado de forma supervisada desde cero (ver tabla de la seccion anterior): la rama auto-supervisada mejora entre +0,109 y +0,310 de AUROC o AP segun cohorte, con intervalos de confianza que excluyen el cero.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FORGE (este modelo) | 12,9-14,1 M por codificador | 200 / 500 / 1000 fotogramas | AUROC 0,734-0,917 segun cohorte | MIT | HuggingFace |
| Entrenamiento supervisado desde cero (linea base interna) | similar | no disponible | AUROC 0,657-0,752 en las mismas cohortes | no aplica | no disponible |
| Otros detectores de FOG publicos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Desplazamiento de dominio con umbral fijo: en la cohorte Stanford el ICC es -0,119 [-0,920; 0,670] pese a mantener AUROC 0,734; el umbral de 0,35 calibrado en DeFOG no se transfiere a ese sitio, dispositivo o estado de medicacion (su umbral por regla oraculo seria 0,18). Requiere recalibracion por centro.
- Precision baja en AP sobre datos naturalistas: en FogAtHome daily living el AP es 0,105, muy inferior al 0,804 de la cohorte provocativa, lo que limita su uso directo como detector de alta precision en la vida diaria.
- Dependencia de una unica modalidad y ubicacion: solo acepta acelerometro lumbar bajo; no hay evidencia de funcionamiento con otras ubicaciones, con giroscopio u otras senales.
- Base de entrenamiento limitada: el preentrenamiento usa 65 participantes y el ajuste 57, con composicion demografica no documentada; no se reportan analisis de sesgo por edad, sexo, etnia ni gravedad de la enfermedad.
- Riesgo de sobreajuste a la cohorte DeFOG: todas las cabezas de clasificacion se entrenan solo con esa cohorte, lo que puede trasladar sus sesgos a los resultados externos.
- Datos de salud: aunque la licencia es MIT, el uso sobre pacientes reales esta sujeto a regulacion de dispositivos medicos y a las normativas de proteccion de datos aplicables (por ejemplo, RGPD en la Union Europea); el modelo no se presenta como producto sanitario.
- Uso clinico no validado: no hay evidencia de validacion prospectiva ni de aprobacion regulatoria; los resultados son de investigacion retrospectiva.
- Rendimiento de la publicacion: el lanzamiento contiene las 27 cabezas de la semilla 42, no la ensembla completa de nueve cabezas; la model card indica una diferencia de aproximadamente 0,02 respecto a las cifras de nueve cabezas.
- Documentacion incompleta: la model card esta truncada y no incluye la configuracion de entrenamiento, la frecuencia de muestreo ni las instrucciones completas de reconstruccion del modelo.
- Idiomas: no aplica, pero conviene senalar que la ficha y la documentacion estan en ingles.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso independiente ni de replicacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Liornis/forge-fog
- Paper, repositorio de codigo, demo o blog: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos corresponden a foros no relacionados).
