# maxhaberbusch/BixECG

## Resumen

BixECG es un modelo de aprendizaje profundo para la delineación de ondas en electrocardiogramas (ECG) de una sola derivación. Desarrollado por Max Haberbusch y colaboradores de la Medical University of Vienna, acompaña al preprint "A Compact, Uncertainty-Aware mLSTM Model for Real-Time ECG Delineation on Edge Devices" (Lung et al., 2026). Su tarea consiste en clasificar cada muestra de la señal en una de cuatro clases: ausencia de onda (No-Wave, NW), onda P, complejo QRS y onda T.

La arquitectura es una mLSTM bidireccional (Bi-mLSTM), el bloque de memoria matricial de la familia xLSTM, con tres bloques, dimensión de embedding 8, una única cabeza de atención y un conv-stem de kernel 11. El modelo completo tiene solo 2.522 parámetros (aproximadamente 10 kB de pesos), lo que permite inferencia en tiempo real sobre microcontroladores de clase Cortex-M7 como el Arduino Portenta H7, con un consumo de 22 kB de SRAM.

Su relevancia actual reside en demostrar que un modelo de secuencia con memoria matricial puede igualar el rendimiento de delineadores mucho mayores en una tarea clínica concreta, ejecutándose en hardware de borde sin conexión a la nube. Se publica bajo licencia GPL-2.0-only y los pesos están alojados en HuggingFace junto a un repositorio de código con el preprocesado, el anclaje por pico R y la evaluación con tolerancia temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-mLSTM (bloque mLSTM de la familia xLSTM), bidireccional, 3 bloques, embedding dim 8, 1 cabeza, conv-stem de kernel 11 |
| Parametros totales | 2.522 (aproximadamente 10 kB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto: ventana fija de 300 muestras de ECG a 250 Hz (1,2 s), anclada al pico R |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (entrada de senal ECG, no texto) |
| Licencia | GPL-2.0-only (copyright Medical University of Vienna) |
| Formato de pesos | PyTorch (`bixecg_mlstm_2522.pt`, `state_dict`), cargable con `torch.load` |

## Arquitectura y entrenamiento

BixECG emplea una pila de tres bloques mLSTM bidireccionales precedidos por un conv-stem unidimensional de kernel 11. La mLSTM sustituye la memoria escalar de una LSTM clasica por una memoria matricial con regla de actualizacion basada en atención, lo que le permite almacenar asociaciones clave-valor y recuperarlas de forma paralelizable. La bidireccionalidad es relevante aquí porque la delineación de una onda depende tanto de las muestras previas como de las posteriores dentro de la ventana. La entrada es una derivación única muestreada a 250 Hz, con ventanas de 300 muestras ancladas al pico R y normalizadas por z-score ventana a ventana; la salida son logits por muestra sobre las cuatro clases {NW, P, QRS, T}.

El modelo se entrena sobre QTDB (PhysioNet), un conjunto público de ECG anotado muestra a muestra. El diseño del artículo pone el énfasis en la incertidumbre y la compacidad: la evaluación es "tolerance-aware", es decir, permite desviaciones de frontera de ±52 ms para la onda P, ±48 ms para el QRS y ±124 ms para la onda T, lo que refleja la variabilidad inter-anotador inherente a la tarea. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste por preferencias, algo esperable en un modelo de clasificación de señales y no de generación de texto.

## Capacidades

- Clasificación por muestra de señales ECG de una derivación en cuatro clases: No-Wave, P, QRS y T.
- Delineación completa de latidos con localización de fronteras de onda dentro de tolerancias clínicas definidas.
- Análisis orientado a incertidumbre: el artículo y el repositorio incluyen análisis de incertidumbre del modelo.
- Inferencia en tiempo real en hardware de borde, con 128,6 ms por latido medidos en dispositivo (D-Heart pilot).
- Ejecución con huella de memoria muy reducida: 22 kB de SRAM en la prueba en dispositivo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificación de series temporales, no un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Monitorización cardíaca vestible: el modelo puede ejecutarse en un microcontrolador Cortex-M7 dentro de un parche o reloj, delineando cada latido en 128,6 ms con 22 kB de SRAM y sin enviar datos a la nube, lo que simplifica el cumplimiento de protección de datos.
- Dispositivos de asistencia ventricular izquierda (LVAD): en el estudio se evaluó sobre LVAD-DB con un macro-F1 de 0,91 en datos de dos anotadores, por lo que es aplicable a la monitorización de pacientes con soporte mecánico, donde la morfología del ECG está alterada.
- Triaje previo a la transmisión: al ser tan pequeño, puede preprocesar y etiquetar ondas en el propio dispositivo y transmitir solo segmentos relevantes, reduciendo el ancho de banda y el consumo de batería en telemetría Holter.
- Detección de arritmias como etapa previa: al localizar con precisión las fronteras de P, QRS y T (F1 de 0,98 en QRS sobre LUDB), sirve como primer bloque de un pipeline que calcule intervalos PR, QT y QRS para clasificación arrítmica posterior.
- Validación y anotación asistida en investigación clínica: el modelo puede pre-anotar bases de datos de ECG para que un cardiólogo revise y corrija, reduciendo el coste de etiquetado manual muestra a muestra.
- Análisis de ECG en ensayos de dispositivo: integrado en la electrónica de un prototipo para caracterizar la señal en tiempo real durante la fase de validación, con la ventaja de que los pesos ocupan aproximadamente 10 kB.
- Educación y prototipado con hardware de bajo coste: el repositorio permite reproducir la canalización completa (anclaje por pico R, z-score por ventana, evaluación con tolerancia) en placas de desarrollo asequibles.
- Investigación en arquitecturas xLSTM aplicadas a señales biomédicas: sirve como referencia mínima de que un bloque mLSTM bidireccional de 2.522 parámetros es suficiente para una tarea de etiquetado denso.

## Benchmarks y rendimiento

Resultados publicados en la model card, con macro-F1 sensible a tolerancia de fronteras (P ±52 ms, QRS ±48 ms, T ±124 ms):

| Dataset | Macro-F1 | Notas |
|---|---|---|
| LUDB (externo) | 0,94 | Kappa 0,92; F1 de 0,98 en QRS |
| LVAD-DB (externo, dos anotadores agrupados) | 0,91 | 0,94 frente a ingeniero; 0,88 frente a cardiólogo |
| D-Heart pilot (en dispositivo, en vivo) | 0,93 | Kappa 0,89; 128,6 ms por latido; 22 kB SRAM |

No se han publicado resultados de benchmarks comparativos con otros modelos (por ejemplo MMLU, HumanEval o GSM8K) en la información disponible, dado que se trata de un modelo de delineación de señal y no de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: insignificante. Los pesos ocupan unos 10 kB, por lo que el modelo cabe en cualquier GPU, CPU o microcontrolador moderno.
- Memoria en dispositivo medida: 22 kB de SRAM en la prueba en vivo (D-Heart pilot).
- Hardware de referencia validado: Arduino Portenta H7 con Cortex-M7; el artículo se orienta a hardware de clase microcontrolador.
- GPU recomendadas: no se especifican. Cualquier GPU (A100, H100, RTX 4090 o inferiores) es sobredimensionada; la ejecución en CPU es inmediata.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura; también en placas embebidas y microcontroladores.
- Opciones de despliegue: PyTorch nativo mediante el repositorio del autor (`pip install git+https://github.com/CellularSyntax/BixECG`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 128,6 ms por latido en el dispositivo evaluado. No se proporcionan cifras de throughput agregado ni de latencia en GPU o CPU de escritorio.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la información proporcionada. La tabla siguiente recoge las dimensiones de comparación y marca explícitamente lo que no está documentado.

| Alternativa | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BixECG (Bi-mLSTM) | 2.522 | Ventana fija de 300 muestras a 250 Hz | Macro-F1 0,94 en LUDB; 0,91 en LVAD-DB; 0,93 en dispositivo | GPL-2.0-only | Pesos en HuggingFace; codigo en GitHub |
| Delineadores basados en CNN/U-Net para ECG | No disponible | No disponible | No disponible | No disponible | No disponible |
| Algoritmos clasicos de delineacion (tipo NeuroKit2) | No aplica | No disponible | No disponible | No disponible | No disponible |
| Modelos transformer de proposito general aplicados a ECG | No disponible | No disponible | No disponible | No disponible | No disponible |

La ventaja documentada de BixECG frente a alternativas genéricas es su tamaño (2.522 parámetros, aproximadamente 10 kB) y su capacidad de ejecución en microcontrolador, no una superioridad de precisión demostrada frente a modelos concretos.

## Limitaciones y advertencias

- Dominio restringido: solo maneja ECG de una derivación a 250 Hz con ventana de 300 muestras anclada al pico R y z-score por ventana. Otras frecuencias de muestreo, derivaciones o longitudes de ventana requieren reacondicionar la señal y no están cubiertas.
- Requiere un detector de picos R previo y fiable: el anclaje al pico R es parte de la canalización y un fallo en esa etapa degrada directamente la delineación.
- Sesgos potenciales de la población de entrenamiento: el modelo se entrena únicamente con QTDB, un conjunto clínico acotado. No se documenta análisis de sesgo por edad, sexo, etnia o patología, ni validación en poblaciones diversas más allá de las pruebas externas citadas.
- Riesgo de error clínico: un macro-F1 de 0,91-0,94 implica un porcentaje no despreciable de fronteras mal localizadas, tolerable para investigación o pre-anotación, pero no para diagnóstico autónomo.
- Datos no distribuidos: LVAD-DB y D-Heart pilot son datos de pacientes propietarios y sujetos a normativa de protección de datos; no se publican con el modelo y solo están disponibles del autor correspondiente bajo petición razonable.
- Licencia GPL-2.0-only: es copyleft, de modo que integrar el modelo en un producto propietario obliga a liberar el código derivado bajo los mismos términos. Además, cualquier uso clínico entra en el ámbito del reglamento europeo de productos sanitarios (MDR) y exige la correspondiente certificación del sistema completo.
- No hay información sobre cuantización, versiones destiladas ni conversión a formatos como ONNX, TFLite o GGUF, lo que puede complicar el despliegue en algunos toolchains embebidos.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta, y publicación asociada todavía en estado de preprint: no ha pasado revisión por pares ni validación independiente más allá de los conjuntos citados.
- El modelo no genera texto ni mantiene conversación: cualquier expectativa de uso como asistente clínico conversacional queda fuera de su alcance.

## Enlaces

- HuggingFace: https://huggingface.co/maxhaberbusch/BixECG
- Repositorio de codigo: https://github.com/CellularSyntax/BixECG
- Articulo de referencia: Lung D, Heute P, Marx M, Schlöglhofer T, Abart T, Moscato F, Riebandt J, Zimpfer D, Haberbusch M. "A Compact, Uncertainty-Aware mLSTM Model for Real-Time ECG Delineation on Edge Devices", 2026 (preprint; envio a revista en preparacion). No se proporciona DOI ni enlace en la informacion disponible.
- Conjuntos de datos de entrenamiento y evaluacion: QTDB y LUDB (publicos, PhysioNet). No se proporcionan URL directas en la informacion disponible. LVAD-DB y D-Heart pilot no se distribuyen.
