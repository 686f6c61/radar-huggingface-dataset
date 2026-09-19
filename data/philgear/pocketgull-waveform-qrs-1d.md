# philgear/pocketgull-waveform-qrs-1d

## Resumen

PocketGull 1D Waveform Biosignal DSP & QRS Detector es un adaptador LoRA publicado por philgear (PocketGull LLC) sobre el modelo base `pocketgull/waveform-dilated-cnn-1d`. Según su model card, está orientado al procesamiento de señales fisiológicas unidimensionales (ECG y PPG) a frecuencias de muestreo de 100 a 500 Hz, con funciones declaradas de detección de complejos QRS, alineamiento de puntos fiduciales, cálculo de frecuencia cardíaca instantánea y puntuación de variabilidad de intervalos RR. El adaptador se presenta como fine-tuneado mediante DPO sobre datos clínicos desidentificados conforme a HIPAA §164.514 Safe Harbor.

La ficha del repositorio es internamente inconsistente: las etiquetas incluyen `gemma-2`, `text-generation` y `lora`, y el ejemplo de inferencia usa `AutoModelForCausalLM` con un prompt de texto libre sobre interacciones farmacológicas (hipérum y warfarina, metabolismo CYP450). Sin embargo, el modelo base declarado es una CNN dilatada residual 1D de señal, no un transformer de lenguaje. Esta mezcla de dominios (procesamiento de bioseriales frente a generación de texto clínico) no se resuelve en la información disponible y condiciona cualquier evaluación práctica del artefacto.

El repositorio tiene 0 descargas y 0 likes en el momento del análisis, licencia Apache 2.0 y soporte declarado únicamente de inglés. No se publican parámetros totales, longitud de contexto, recuento de tokens de entrenamiento ni resultados de benchmarks, por lo que no es posible validar sus capacidades declaradas con datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base `pocketgull/waveform-dilated-cnn-1d`, descrito en la model card como CNN residual dilatada temporal 1D; las etiquetas del repositorio mencionan `gemma-2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (no se especifica el formato de fichero exacto) |
| Modelo base | pocketgull/waveform-dilated-cnn-1d |
| Libreria de carga | peft (ejemplo con transformers + peft) |
| Pipeline declarado | text-generation |
| Frecuencia de senal declarada | 100-500 Hz (ECG/PPG) |
| Metodo de ajuste declarado | DPO (Direct Preference Optimization) |
| Autor / organizacion | philgear / PocketGull LLC |
| Fecha de creacion (metadatos) | 2026-09-18 |

## Arquitectura y entrenamiento

La model card describe la disciplina del sistema como una CNN residual dilatada temporal 1D ("1D Temporal Dilated Residual CNN") para flujos de bioseriales ECG/PPG entre 100 y 500 Hz, con convoluciones dilatadas que permiten ampliar el campo receptivo sin reducir la resolución temporal, algo habitual en tareas de detección de eventos sobre señales de alta frecuencia de muestreo. El adaptador se presenta como un ajuste LoRA (Low-Rank Adaptation) sobre esa base, lo que implica que solo se entrenan matrices de bajo rango y que el modelo base permanece congelado.

En cuanto al entrenamiento, la única información aportada es que se empleó DPO sobre conjuntos de datos clínicos desidentificados conforme a HIPAA §164.514 Safe Harbor, con referencias a los corpus NIH MEDQUAD y WHO mhGAP en las etiquetas del repositorio. No se especifica el número de tokens de entrenamiento, la composición del dataset, el número de pasos, la configuración de LoRA (rango, alpha, módulos objetivo) ni el procedimiento de evaluación. La combinación declarada de DPO (técnica de alineamiento de preferencias propia de modelos de lenguaje) con una base de CNN de señal 1D no se explica en la documentación y constituye una de las principales lagunas técnicas del artefacto.

## Capacidades

Las siguientes capacidades provienen exclusivamente de las declaraciones de la model card y no han podido verificarse con benchmarks publicados:

- Detección de picos QRS tipo Pan-Tompkins sobre ECG de derivación única en tiempo real.
- Alineamiento de puntos fiduciales ("fiducial alignment") en la señal ECG.
- Cálculo de frecuencia cardíaca instantánea a partir de los picos detectados.
- Puntuación de variabilidad de intervalos RR (RR-interval variability scoring).
- Estimación de densidad espectral de potencia de ondas de Mayer en la banda simpática 0,04-0,15 Hz a partir de series de intervalos de pulso PPG de 5 minutos.
- Marcado de latidos ectópicos ventriculares según el ejemplo de widget del repositorio.
- Generación de texto (pipeline `text-generation` declarado), con un ejemplo de prompt clínico sobre metabolismo CYP450 en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; solo se declara inglés (`en`).
- Capacidades especiales (modo thinking, visión, audio): no disponible. La única modalidad especial declarada es el procesamiento de señal 1D.

## Casos de uso

- Monitorización de telemetría ECG en el borde: según la model card, el modelo procesa buffers de ECG de derivación única a 500 Hz para detectar picos QRS y calcular frecuencia cardíaca instantánea, lo que permitiría ejecutar la detección en el propio dispositivo sin enviar señal cruda a la nube.
- Triaje de arritmias mediante variabilidad RR: la puntuación de variabilidad de intervalos RR permitiría generar alertas preliminares sobre irregularidades del ritmo antes de la revisión por un clínico.
- Análisis de tono autonómico simpático: el cálculo de la potencia de ondas de Mayer en la banda 0,04-0,15 Hz sobre series de intervalos de pulso PPG de 5 minutos encaja en estudios de variabilidad autonómica y estrés fisiológico.
- Detección de ectopia ventricular en monitorización ambulatoria: el modelo declara marcar latidos ectópicos ventriculares, lo que resultaría útil en el preprocesado de registros Holter para reducir el volumen de señal que revisa un especialista.
- Control de calidad de señal en pipelines de investigación: la detección de picos fiduciales puede emplearse para validar la calidad de registros ECG/PPG antes de alimentar análisis posteriores, descartando tramos con detección inconsistente.
- Procesamiento conforme a HIPAA en infraestructura privada: la model card indica despliegue en computación local de borde o en Google Cloud Vertex AI privado con retención cero de PHI, lo que encajaría en flujos hospitalarios con requisitos estrictos de privacidad.
- Asistencia documental o de apoyo a la decisión en texto clínico: la etiqueta `text-generation` y el ejemplo de prompt farmacológico sugieren un uso de ayuda textual, aunque esta capacidad no está respaldada por datos de evaluación y la FDA se declara explícitamente como "non-device CDS" bajo 520(o).
- Extracción de características para modelos posteriores: las salidas de detección de picos, HR y variabilidad podrían alimentar clasificadores de arritmia de segunda etapa en lugar de usarse directamente para diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay tablas comparativas de MMLU, HumanEval, GSM8K ni de métricas propias del dominio (sensibilidad/especificidad de detección QRS, F1 sobre MIT-BIH, error de detección de picos en ms, etc.). Tampoco se documentan curvas de precisión-recall ni umbrales de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declaran parámetros totales del modelo base ni del adaptador.
- GPU recomendadas: no disponible. La model card solo menciona computación de borde local y despliegue en Google Cloud Vertex AI privado, sin especificar aceleradores.
- Viabilidad en GPU de consumo: no disponible. Al no conocerse el tamaño del modelo base, no puede determinarse si cabe en una RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` (`PeftModel.from_pretrained`) y `torch_dtype=torch.bfloat16` con `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI. Al no haber pesos GGUF declarados, llama.cpp y Ollama no son aplicables con la información disponible.
- Latencia y throughput: no disponible. No se aportan mediciones de latencia por ventana de señal ni de muestras procesadas por segundo, pese a que la model card califica el sistema de "high-throughput".

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable. La tabla siguiente resume la información disponible frente a alternativas conceptuales del mismo dominio, marcando como no disponible todo lo que no puede contrastarse.

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| philgear/pocketgull-waveform-qrs-1d | Adaptador LoRA sobre CNN dilatada 1D (declarado) | no disponible | no disponible | Apache 2.0 | no disponible |
| Algoritmo Pan-Tompkins (referencia algorítmica clásica para QRS) | Procesado de señal determinista, no neuronal | no aplica | no aplica | no aplica (algoritmo publicado) | no disponible en esta ficha |
| Otros detectores QRS basados en redes neuronales (p. ej. variantes U-Net 1D sobre MIT-BIH) | Red neuronal 1D | varía por implementación | no aplica | varía | no disponible en esta ficha |

No se han encontrado en la información proporcionada modelos comparables con métricas publicadas que permitan una comparación directa de sensibilidad, especificidad o latencia.

## Limitaciones y advertencias

- Inconsistencia entre modalidades: las etiquetas (`gemma-2`, `text-generation`) y el ejemplo de inferencia (`AutoModelForCausalLM` con prompt de texto) no concuerdan con el modelo base declarado, una CNN dilatada 1D de señal. Cargar el adaptador con el ejemplo de la model card puede fallar o producir resultados sin sentido si la arquitectura real es la del modelo de señal.
- Referencia de repositorio divergente: el ejemplo de código apunta a `pocketgull-llc/pocketgull-waveform-qrs-1d`, mientras que el repositorio analizado es `philgear/pocketgull-waveform-qrs-1d`. Esta discrepancia puede provocar errores de resolución del adaptador.
- Ausencia total de métricas: no hay sensibilidad, especificidad, F1, error temporal de detección ni validación sobre conjuntos estándar como MIT-BIH. Cualquier uso clínico carece de evidencia publicada en el repositorio.
- Riesgo de alucinación en el modo texto: si el adaptador se emplea para generar texto clínico, no existe evaluación que cuantifique la tasa de afirmaciones incorrectas, un riesgo especialmente alto en interacciones farmacológicas.
- Sesgos conocidos: no disponible. No se documenta composición demográfica de los datos de entrenamiento ni análisis de sesgo por edad, sexo, etnia o condición clínica.
- Limitación de idioma: solo se declara inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Limitación de señal: el alcance declarado cubre ECG de derivación única a 100-500 Hz y PPG; no se documenta comportamiento con derivaciones múltiples, señales de menor frecuencia de muestreo o artefactos de movimiento intensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor declara el sistema como herramienta de apoyo a profesionales sanitarios bajo la exención FDA 520(o) para CDS no dispositivo. Eso no exime de responsabilidad regulatoria a quien lo despliegue en un producto sanitario.
- Privacidad: aunque se declare cumplimiento de HIPAA Safe Harbor, no se aportan detalles del proceso de desidentificación ni auditoría independiente.
- Madurez: 0 descargas y 0 likes, sin historial de uso comunitario ni informes de terceros.
- Advertencia sobre los resultados de la búsqueda web: los enlaces devueltos no guardan relación con el modelo (contenido meteorológico en árabe), por lo que no aportan contexto técnico ni verificación alguna.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/philgear/pocketgull-waveform-qrs-1d
- Modelo base declarado: https://huggingface.co/pocketgull/waveform-dilated-cnn-1d
- DOI de procedencia en Zenodo: https://doi.org/10.5281/zenodo.20647514
- Sitio de la organizacion: https://pocketgull.com
- Pagina alternativa citada en la model card: https://pocketgull.app
- ORCID del responsable de informatica: https://orcid.org/0009-0008-1372-5381
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no estan relacionados con el modelo.
