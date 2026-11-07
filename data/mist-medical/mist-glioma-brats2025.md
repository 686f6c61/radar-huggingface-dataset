# mist-medical/mist-glioma-brats2025

## Resumen

MIST Glioma es un modelo de segmentación 3D de gliomas adultos en resonancia magnética cerebral multiparamétrica, tanto pre como post-tratamiento. Lo desarrollan el MD Anderson Cancer Center y la Rice University, y se distribuye como un ensemble de cinco pliegues de modelos pocket nnU-Net entrenados con el Medical Imaging Segmentation Toolkit (MIST). El modelo resuelve la delimitación automática de cuatro subregiones tumorales (núcleo no realzado, hiperintensidad FLAIR peritumoral, tejido realzado y cavidad de resección) a partir de cuatro secuencias de RM (T1, T2, T1 con contraste y FLAIR).

La relevancia del modelo es doble: por un lado, es la implementación de referencia publicada del equipo que quedó tercero en la tarea de glioma adulto del reto BraTS-Lighthouse 2025; por otro, su tamaño extremadamente reducido (770.959 parámetros por pliegue) y su licencia Apache 2.0 lo hacen muy accesible para investigación y para servir de línea base reproducible. La arquitectura es un nnU-Net "pocket" con bloques residuales y supervisión profunda, con entrada de 4 canales, parches de 128 × 128 × 128 vóxeles y espaciado de 1 × 1 × 1 mm.

El modelo está pensado exclusivamente para uso en investigación: no es un dispositivo médico y no debe emplearse en diagnóstico, planificación de tratamiento ni ninguna decisión clínica. Se publica con pesos en formato PyTorch (state dicts por pliegue) y una herramienta de línea de comandos que automatiza registro, extracción de cerebro e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket nnU-Net con bloques residuales y supervisión profunda |
| Parametros totales | 770.959 por pliegue (ensemble de 5 pliegues, ~3,85 M en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen; parche de entrada 128 × 128 × 128 vóxeles) |
| Tipos de cuantizacion | no disponible (pesos distribuidos como state dict de PyTorch en FP32) |
| Idiomas soportados | en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (.pt), un archivo por pliegue (fold_0.pt a fold_4.pt) |

## Arquitectura y entrenamiento

El modelo es un nnU-Net en variante "pocket", una versión reducida de la U-Net 3D estándar de nnU-Net que incorpora bloques residuales y supervisión profunda. Trabaja con cuatro canales de entrada en el orden T1, T2, T1 con contraste y FLAIR, parches de 128 × 128 × 128 vóxeles a 1 × 1 × 1 mm de espaciado, y produce cinco clases de salida (fondo, NETC, SNFH, ET y RC). El ensemble promedia las predicciones de cinco pliegues entrenados mediante validación cruzada de cinco particiones.

El entrenamiento se realizó sobre los 2.875 casos de entrenamiento del reto BraTS 2025 Glioma Segmentation on Pre- and Post-treatment MRI, usando los datos oficiales ya registrados y con extracción de cráneo aplicada por los organizadores, y solo la normalización de intensidad propia de MIST (sin corrección de campo de sesgo N4 en entrenamiento). Se usó pérdida Dice combinada con entropía cruzada, 10.000 épocas por pliegue, tasa de aprendizaje inicial de 0,001 con schedule coseno, penalización L2 de 1 × 10⁻⁵, batch size de 4 repartido en 2 GPU NVIDIA H100, y selección del mejor modelo sobre una partición de validación del 2,5 % dentro de cada pliegue.

## Capacidades

- Segmentación 3D de gliomas adultos en RM multiparamétrica pre y post-tratamiento.
- Delimitación de cuatro subregiones: núcleo tumoral no realzado (NETC), hiperintensidad FLAIR peritumoral (SNFH), tejido realzado (ET) y cavidad de resección (RC).
- Cálculo implícito de regiones compuestas según el protocolo BraTS: tumor core (TC, etiquetas 1 y 3) y whole tumor (WT, etiquetas 1, 2 y 3).
- Inferencia con ventanas deslizantes solapadas (overlap 0,5, mezcla gaussiana) y test-time augmentation por volteo.
- Ensemble de cinco pliegues promediado para reducir varianza entre particiones.
- Pipeline integrado en la herramienta `mist-glioma`: registro rígido a T1 con contraste, registro al atlas SRI24, extracción de cerebro con HD-BET, recorte al foreground y normalización de intensidades.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de texto: es un modelo puramente de visión médica.

## Casos de uso

- Investigación en segmentación tumoral: servir de línea base reproducible para comparar nuevas arquitecturas o estrategias de postprocesado sobre BraTS 2025, gracias a que los pesos y el pipeline están publicados con licencia Apache 2.0.
- Generación de máscaras de referencia para anotación asistida: el modelo produce `tumor_rc_mask.nii.gz` y `brain_mask.nii.gz` que un radiólogo puede revisar y corregir, acelerando el etiquetado de cohortes retrospectivas.
- Análisis volumétrico longitudinal: al segmentar estudios pre y post-tratamiento con las mismas cuatro secuencias, permite calcular volúmenes de NETC, ET y RC para estudiar respuesta a terapia en series de investigación.
- Extracción de radiomics: las máscaras por subregión permiten calcular características de textura y forma sobre regiones tumorales homogéneas, un paso habitual en estudios de correlación imagen-genómica.
- Validación de pipelines de preprocesado: al incluir registro, extracción de cerebro y normalización, el modelo sirve para probar de extremo a extremo la cadena de procesado de un servicio de imagen médica antes de incorporar modelos más pesados.
- Docencia y formación: el reducido tamaño (menos de un millón de parámetros por pliegue) permite ejecutar el pipeline en una GPU de consumo y demostrar el flujo completo de segmentación 3D en cursos de imagen médica.
- Desarrollo de herramientas de investigación clínica: integrable en scripts de Python o en la CLI `mist_glioma` con `--device cuda` o `--device cpu` para procesar lotes de estudios en un servidor de investigación.

## Benchmarks y rendimiento

Validación cruzada de cinco pliegues sobre los datos de entrenamiento (media y desviación típica; HD95 en milímetros):

| Region | Dice | HD95 (mm) |
|---|---:|---:|
| NETC | 0,7918 (0,3058) | 22,007 (75,901) |
| SNFH | 0,8686 (0,1380) | 6,8846 (25,077) |
| ET | 0,8049 (0,2755) | 26,069 (83,223) |
| RC | 0,8234 (0,3080) | 31,475 (93,119) |
| TC | 0,8204 (0,2735) | 24,252 (78,966) |
| WT | 0,9067 (0,1134) | 6,5513 (22,732) |

Conjunto de validación del reto BraTS-Lighthouse 2025 (ensemble sin postprocesado, entrada final del equipo):

| Region | Dice | HD95 (mm) | Lesion-wise Dice | Lesion-wise HD95 (mm) |
|---|---:|---:|---:|---:|
| NETC | 0,7114 (0,3556) | 42,902 (105,52) | 0,7450 (0,3335) | 37,369 (96,851) |
| SNFH | 0,8608 (0,1543) | 7,1704 (25,163) | 0,8088 (0,2064) | 24,313 (57,523) |
| ET | 0,7807 (0,2847) | 23,670 (77,327) | 0,7641 (0,2871) | 35,802 (89,441) |
| RC | 0,8445 (0,3058) | 25,010 (82,263) | 0,8494 (0,2993) | 29,059 (88,479) |
| TC | 0,7925 (0,2855) | 24,582 (77,193) | 0,7664 (0,2938) | 38,956 (89,077) |
| WT | 0,9219 (0,0867) | 5,9289 (18,755) | 0,8663 (0,1754) | 23,190 (55,493) |

El equipo obtuvo el tercer puesto en la tarea de glioma adulto del reto BraTS-Lighthouse 2025. Las clasificaciones finales están publicadas en Synapse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 770.959 parámetros por pliegue y parches de 128³, el modelo es muy ligero y cabe holgadamente en GPU de consumo, aunque el cuello de botella real es el preprocesado (registro, HD-BET) y la ventana deslizante.
- GPU recomendadas: los autores entrenaron con 2 × NVIDIA H100; para inferencia basta una GPU moderna de consumo. Se recomienda GPU; existe `--device cpu` como opción.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con suficiente memoria para el parche 3D y el pipeline de registro; no se publican cifras exactas de VRAM.
- Opciones de despliegue: CLI `mist-glioma` (recomendada), o carga directa de los state dicts con la arquitectura `nnunet-pocket` de MIST (`in_channels=4`, `out_channels=5`, eliminando el prefijo `module.` de las claves). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIST Glioma (este modelo) | 770.959 por pliegue (ensemble de 5) | Parche 128³, 4 canales | Segmentación glioma BraTS 2025 pre/post | Apache 2.0 | Pesos en HF + CLI |
| nnU-Net estándar (referencia BraTS) | no disponible | Configuración 3D completa | Segmentación tumoral cerebral | Apache 2.0 (código) | Código y pesos de la comunidad |
| Otros participantes BraTS-Lighthouse 2025 | no disponible | no disponible | Segmentación glioma adulto | no disponible | Rankings en Synapse |

No se dispone de datos comparativos publicados con alternativas concretas en la información proporcionada; la comparación cuantitativa debe hacerse contra los rankings oficiales del reto en Synapse.

## Limitaciones y advertencias

- Uso exclusivamente investigador: no es un dispositivo médico y no debe usarse para diagnóstico, planificación de tratamiento ni decisiones clínicas.
- Diferencias de pipeline: los resultados se midieron sobre datos del reto ya preprocesados por los organizadores; la herramienta `mist-glioma` aplica su propio registro y extracción de cerebro, y los autores no han reportado su precisión sobre escaneos clínicos crudos.
- Alta variabilidad entre casos: las desviaciones típicas son grandes, especialmente en NETC, ET y RC (Dice con desviación de hasta 0,35 y HD95 con desviaciones de decenas de milímetros). Es obligatoria la revisión visual de cada salida.
- Requiere las cuatro secuencias de RM (T1, T2, T1 con contraste, FLAIR); no se evaluó con secuencias ausentes o sintetizadas.
- Alcance limitado a glioma adulto: no debe esperarse buen rendimiento en otros tipos tumorales ni en pacientes pediátricos.
- Riesgo de falsos negativos o positivos en tumores pequeños o con artefactos; el modelo no incorpora mecanismos de calibración de incertidumbre documentados.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero la advertencia de uso investigador y la ausencia de validación clínica limitan su explotación en producto sanitario sin certificación adicional.
- Sesgos potenciales derivados de la distribución del dataset BraTS (centros, protocolos y poblaciones concretas); no documentados explícitamente por los autores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mist-medical/mist-glioma-brats2025
- Paper (arXiv): https://arxiv.org/abs/2507.19626
- PDF del paper: https://arxiv.org/pdf/2507.19626v1
- Versión HTML del paper: https://arxiv.org/html/2507.19626v1
- Repositorio MIST: https://github.com/mist-medical/MIST
- Herramienta CLI mist-glioma: https://github.com/mist-medical/mist-glioma
- Rankings del reto BraTS-Lighthouse 2025 (Synapse): https://www.synapse.org/Synapse:syn64153130/wiki/633062
