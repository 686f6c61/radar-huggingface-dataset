# hyuckpa03/voicekeeper-klue-bert

## Resumen

VoiceKeeper · KLUE-BERT es un clasificador binario de texto en coreano que distingue entre mensajes fraudulentos de suplantación telefónica (voice phishing, 보이스피싱) y mensajes legítimos. Lo desarrolla el usuario hyuckpa03 a partir del modelo base klue/bert-base, un encoder BERT-base de aproximadamente 110 millones de parámetros preentrenado en coreano, al que se le ha añadido una cabeza de clasificación de dos etiquetas (0 = benigno, 1 = phishing) y que se exporta a ONNX en int8 con un peso final de 111,4 MB.

El modelo está pensado como motor independiente dentro del servicio VoiceKeeper, donde se ejecuta en paralelo a un LLM de propósito general como segunda opinión. Su interés práctico radica en que funciona exclusivamente en CPU con onnxruntime y tokenizers, sin necesidad de GPU ni de frameworks de inferencia pesados, lo que lo hace desplegable en pasarelas telefónicas, pasarelas de SMS o aplicaciones móviles con recursos limitados.

El entrenamiento se apoya en un conjunto sintético de 1302 ejemplos generados con Gemini (14 tipos de fraude por 3 formatos y 12 tipos benignos, incluyendo negativos difíciles como notificaciones reales de OTP, bancos o paquetería) más 48 casos semilla escritos a mano que se reservan íntegramente para validación fuera de distribución. La ventana de entrada efectiva es de 192 tokens y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (heredada de klue/bert-base) con cabeza de clasificación binaria sobre el token [CLS] |
| Parametros totales | ~110 millones (los del modelo base klue/bert-base) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens en el modelo base; el entrenamiento y la inferencia se fijan a max_len = 192 |
| Tipos de cuantizacion | int8 (exportación ONNX); no se documentan otras variantes |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, 111,4 MB) acompañado de tokenizer.json para la librería tokenizers |

Otros datos del repositorio: pipeline text-classification, tamaño del repo 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 21 de septiembre de 2026 y actualizado el 21 de septiembre de 2026.

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado de klue/bert-base, un encoder Transformer bidireccional con representaciones contextuales, para una tarea de clasificación de secuencia con dos clases. No hay generación, decodificación especulativa, atención lineal ni componentes SSM o híbridos: es un clasificador discriminativo estándar. La configuración declarada en la model card es max_len = 192, 3 épocas, batch de 16, learning rate 3e-5 y 1232 filas de entrenamiento, todo ello exclusivamente con datos sintéticos y balanceado por sobremuestreo de la clase minoritaria. Los pesos se exportan a ONNX y se cuantizan a int8, con una diferencia media absoluta de probabilidad de 0,0054 respecto a la versión fp32.

Los datos de entrenamiento proceden de dos fuentes. Por un lado, 1302 ejemplos sintéticos generados con Gemini (modelos gemini-3.6-flash y 3.5-flash-lite) que cubren 14 tipologías de fraude en tres formatos (transcripción de llamada, SMS y KakaoTalk) y 12 tipologías benignas, con negativos difíciles que incluyen notificaciones reales de OTP, avisos bancarios, de paquetería y de administraciones públicas. Por otro lado, 48 casos semilla redactados a mano siguiendo los patrones publicados por el Servicio de Supervisión Financiera (FSS) de Corea (suplantación de instituciones, cuentas seguras, suplantación de hijos, smishing, préstamos, inversiones), que no se usan en el entrenamiento y se reservan como conjunto de validación fuera de distribución. No se menciona el uso de RLHF, DPO ni ninguna otra fase de alineación.

## Capacidades

- Clasificación binaria de texto coreano entre benigno y fraudulento, con salida de logits y probabilidad calculada mediante softmax.
- Funciona sobre texto procedente de tres canales: transcripciones de llamadas, SMS y mensajes de KakaoTalk.
- Devuelve una puntuación de referencia que el autor advierte explícitamente que no es una probabilidad de fraude calibrada.
- Inferencia en CPU pura con onnxruntime y tokenizers, sin dependencia de PyTorch en tiempo de ejecución.
- Latencia declarada de 0,92 segundos para 48 textos en CPU, lo que equivale a unos 19 ms por texto en el hardware de referencia.
- Diseñado para funcionar en ensemble con un LLM dentro del servicio VoiceKeeper.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling ni comportamiento agente.
- No dispone de capacidades multimodales: no procesa audio, voz, imagen ni metadatos de la llamada.
- No se documentan capacidades multilingües más allá del coreano.

## Casos de uso

- Filtrado previo en pasarelas VoIP y centralitas: el modelo se coloca detrás de un sistema de reconocimiento automático de voz que transcribe la llamada y clasifica la transcripción en unos 19 ms, de modo que se puede activar una alerta al operador o al usuario casi en tiempo real y sin GPU en la misma máquina.
- Moderación de SMS y aplicaciones de mensajería: al ser int8 y pesar 111 MB, puede integrarse en el backend de una app de mensajería para marcar mensajes entrantes de tipo smishing antes de entregarlos al usuario, con el texto del SMS como entrada directa.
- Segunda opinión en sistemas con LLM: en el propio VoiceKeeper se usa como motor independiente que se contrasta con el juicio del LLM, lo que reduce tanto los falsos positivos del modelo grande como los del clasificador cuando ambos coinciden.
- Avisos dentro de aplicaciones bancarias: antes de confirmar una transferencia, la app puede clasificar el texto pegado por el usuario o el hilo de mensajes sospechoso y mostrar una advertencia, aprovechando que la licencia MIT permite integrarlo en producto comercial.
- Apoyo a agentes de centros de atención telefónica: la transcripción parcial de una llamada entrante se clasifica en paralelo y se muestra al agente una señal de riesgo, útil para entidades financieras que ya graban y transcriben llamadas por cumplimiento normativo.
- Triaje de denuncias y trabajo forense: un equipo de investigación puede procesar por lotes miles de transcripciones y mensajes ya recopilados y ordenarlos por puntuación de riesgo, usando el modelo como primer filtro antes de la revisión humana.
- Despliegue en dispositivos de borde o sin GPU: con 111 MB en int8, entra en portátiles modestos, servidores de gama baja o incluso placas tipo Raspberry Pi, lo que permite clasificación local sin enviar contenido sensible a un servicio externo.
- Etiquetado asistido de corpus coreanos: puede preanotar grandes volúmenes de texto para construir conjuntos de entrenamiento o evaluación de modelos mayores, siempre que se revise manualmente el resultado.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar de PLN o de LLM (MMLU, HumanEval, GSM8K y similares) en la información disponible. Los únicos datos de rendimiento son métricas de clasificación propias de la tarea, recogidas en la model card:

| Conjunto | n | Exactitud | Precision | Recall | F1 |
|---|---|---|---|---|---|
| Validación sintética | 162 | 0,988 | 1,000 | 0,977 | 0,988 |
| Semilla (fuera de distribución) | 48 | 0,917 | 1,000 | 0,833 | 0,909 |

Datos adicionales reportados: diferencia media absoluta de probabilidad entre int8 y fp32 de 0,0054, tamaño del ONNX de 111,4 MB y latencia en CPU de 0,92 segundos para 48 textos. El autor señala que los casos no detectados corresponden a tipologías de préstamo, devolución de dinero y salas de inversión redactadas en tono cortés y educado, motivo por el que el servicio combina este clasificador con un LLM en ensemble.

## Requisitos de hardware

- VRAM: no requiere GPU. Inferencia íntegra en CPU; con int8 el modelo ocupa 111,4 MB en disco y una huella de memoria en ejecución del orden de unos cientos de megabytes incluyendo el runtime de ONNX.
- Versión fp32 de referencia: el modelo base klue/bert-base en fp32 ronda los 440 MB, útil como referencia si se quiere evitar la cuantización.
- GPU recomendadas: no aplica. El modelo no está pensado para GPU y el autor solo documenta el proveedor CPUExecutionProvider.
- Compatibilidad con GPU de consumo: irrelevante por diseño; cabe en cualquier equipo sin acelerador, incluidos portátiles de gama baja y dispositivos de borde.
- Opciones de despliegue: onnxruntime como runtime principal, más la librería tokenizers para el preprocesado; ambas son las únicas dependencias declaradas. Las alternativas habituales de servido de modelos generativos (vLLM, TGI, Ollama, llama.cpp) no se mencionan para este artefacto y, al no existir pesos GGUF ni safetensors publicados, llama.cpp y Ollama no aplican directamente.
- Latencia y throughput: 0,92 segundos para 48 textos en CPU según la model card, es decir, aproximadamente 19 ms por texto o unas 52 inferencias por segundo en el hardware de referencia; el valor puede variar según la máquina.

## Comparativa con modelos similares

La información proporcionada no incluye otros clasificadores de voice phishing coreanos con métricas verificables, por lo que la comparación se limita al modelo base del que deriva este ajuste y a consideraciones de formato.

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voicekeeper-klue-bert | ~110 M | 512 (uso a 192) | ONNX int8, 111,4 MB | MIT | HuggingFace, 0 descargas |
| klue/bert-base (base sin ajustar) | ~110 M | 512 | Safetensors/PyTorch, ~440 MB en fp32 | Licencia del modelo base, consultar en su repositorio | HuggingFace, ampliamente utilizado |
| Otros clasificadores coreanos de spam o phishing | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja diferencial frente al modelo base es el tamaño reducido y la ausencia de dependencia de PyTorch en producción; la contrapartida es que las métricas declaradas proceden de datos sintéticos y de un conjunto semilla de solo 48 ejemplos, sin comparación contra alternativas coreanas como KoBERT o KoELECTRA, para las que no hay datos en la información disponible.

## Limitaciones y advertencias

- El entrenamiento se realizó únicamente con datos sintéticos generados por Gemini, por lo que el modelo puede haber aprendido el estilo de ese generador y degradarse frente a transcripciones reales de llamadas con ruido, muletillas o reconocimiento de voz imperfecto.
- El recall fuera de distribución es de 0,833: aproximadamente uno de cada seis casos fraudulentos reales pasa sin detectar. Las tipologías de préstamo, devolución y salas de inversión con tono educado son las que más se le escapan.
- Las puntuaciones de salida no están calibradas como probabilidad de fraude; el propio autor lo advierte y recomienda no interpretarlas como tal.
- Modelo monolingüe en coreano: no se ha entrenado ni evaluado en otros idiomas, incluido el castellano.
- La ventana efectiva de 192 tokens trunca conversaciones largas, de modo que fraudes que se desarrollan a lo largo de un diálogo extenso pueden quedar parcialmente invisibles.
- Solo analiza texto: no procesa la señal de voz, el timbre del hablante, el número de origen ni otros metadatos que en la práctica son señales relevantes de fraude.
- No se documenta ningún análisis de sesgos, demografía del conjunto de datos ni evaluación de subgrupos, y los datos sintéticos pueden heredar sesgos del generador.
- El conjunto semilla fuera de distribución tiene solo 48 ejemplos, lo que hace que las métricas reportadas tengan un intervalo de confianza amplio.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Las fechas de creación y de entrenamiento declaradas (septiembre de 2026) resultan inconsistentes con el contexto temporal habitual; conviene verificar la procedencia y la reproducibilidad del artefacto antes de usarlo en producción.
- La licencia MIT permite uso comercial y modificación sin restricciones relevantes, pero al derivar de klue/bert-base conviene revisar también las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyuckpa03/voicekeeper-klue-bert
- Modelo base klue/bert-base: https://huggingface.co/klue/bert-base
- Demo del servicio VoiceKeeper: https://v-shield-ai-demo.onrender.com/
- Script de reentrenamiento citado en la model card: scripts/ml/train_klue.py (ruta interna del proyecto, no se proporciona URL pública)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a sitios no relacionados.
