# bpmatt/wildroot-mail-v1

## Resumen

Wildroot Mail v1 es un conjunto de dos modelos pequeños de clasificación de correo electrónico desarrollados por el usuario bpmatt y publicados en HuggingFace. Ambos derivan de BAAI/bge-small-en-v1.5, un transformer de tipo encoder con 33,4 millones de parámetros, ajustado de extremo a extremo y exportado a ONNX en float32. El objetivo es ordenar el correo localmente, en la propia máquina del usuario, sin depender de un servidor de modelos ni de servicios en la nube.

El primero de los modelos, `student.onnx`, predice la categoría del mensaje (necesita respuesta, actualizaciones, promocional, ventas o spam), la urgencia de respuesta en una escala de 1 a 5 y la probabilidad de que el correo sea personal. El segundo, `action.onnx`, calcula una puntuación entre 0 y 1 que indica si el mensaje requiere acción ese mismo día. Ambos se ejecutan en CPU con ONNX Runtime y se acompañan de una capa de reglas deterministas en JavaScript (`engine.mjs`) que el modelo no puede sobreescribir.

La relevancia del proyecto reside en su enfoque de privacidad y despliegue ligero: 460 MiB de memoria total, unos 40 ms por correo en 4 hilos de CPU y licencia MIT. Está pensado para clientes de correo que quieran clasificación y priorización sin enviar contenido a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de BAAI/bge-small-en-v1.5), exportado a ONNX |
| Parametros totales | 33,4 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens maximo |
| Tipos de cuantizacion | float32 ONNX (no se documentan otras) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`student.onnx`, `action.onnx`), tokenizer WordPiece sin distincion de mayusculas (`vocab.txt`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La base es BAAI/bge-small-en-v1.5, un encoder transformer de 33,4 millones de parámetros orientado originalmente a embeddings de recuperación. Sobre esa base se ha realizado un ajuste de extremo a extremo con dos cabezas de clasificación: la primera produce tres salidas simultáneas (distribución de 5 clases para categoría, distribución de 5 valores para urgencia y una probabilidad escalar de correo personal); la segunda produce una puntuación de acción entre 0 y 1. Además de los tokens, ambos modelos reciben un vector `facts` de dos dimensiones float32 que indica si el usuario ha escrito antes al remitente y si las cabeceras declaran correo masivo.

El entrenamiento utilizó aproximadamente 20.700 correos públicos, con Enron representando el 80 % del corpus y muestras de phishing completando el resto (la descripción del dataset se trunca en la model card). El texto se normaliza a un formato estructurado con campos `From`, `To`, `Cc`, `Subject`, `Received`, cabeceras de lista y cuerpo. La innovación destacable no es arquitectónica sino de diseño: una capa de reglas deterministas (`decide` y `urgentVerdict` en `engine.mjs`) con umbrales en `config.json` corrige las salidas del modelo en casos como correo masivo, remitentes desconocidos o correos de ventas, garantizando comportamiento predecible en producción. El repositorio incluye `replay.mjs` y `recorded.jsonl` con 929 correos públicos y sus tokens, respuestas y decisiones esperadas para validar cualquier runtime.

## Capacidades

- Clasificación de correo en cinco categorías: `needs_reply`, `updates`, `promotional`, `sales` y `spam`.
- Estimación de urgencia de respuesta en escala de 1 a 5.
- Detección de correo personal frente a correo automatizado o masivo.
- Puntuación de acción del día (0 a 1) con umbral calibrado (0,3706 para remitente conocido y no masivo).
- Consumo de señales de cabecera: listas de correo, cabecera de baja, correo declarado masivo y relación previa con el remitente.
- Ejecución local en CPU mediante ONNX Runtime, sin servidor de modelos.
- Tokenizador y reglas reimplementados en JavaScript sin dependencias (`engine.mjs`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Clasificación local en clientes de correo de escritorio: el modelo puede etiquetar cada mensaje entrante en las cinco categorías en unos 40 ms por correo en CPU, sin enviar contenido a ningún servicio externo, lo que encaja con clientes que priorizan privacidad.
- Priorización de bandeja de entrada: la combinación de `urgency` y la puntuación de `action` permite ordenar los correos del día y resaltar los que requieren respuesta inmediata, usando las reglas para limitar falsos positivos de remitentes desconocidos.
- Filtrado de correo masivo y promocional: la señal `facts` de correo masivo junto con las reglas convierte automáticamente promociones de listas de discusión en `updates` y evita marcar como `needs_reply` correo masivo, reduciendo ruido en la bandeja.
- Detección de spam y phishing: el corpus de entrenamiento incluye muestras de phishing, y la categoría `spam` permite un primer filtro local antes de cualquier análisis más costoso.
- Integración en extensiones de correo o plugins de navegador: el paquete ONNX de 0,3 GB y el motor JavaScript sin dependencias permiten empaquetar la clasificación dentro de una extensión o aplicación Electron.
- Validación de pipelines de correo en CI: `replay.mjs` y `recorded.jsonl` permiten comprobar que una versión concreta de ONNX Runtime reproduce exactamente las 929 decisiones registradas, útil como test de regresión al actualizar dependencias.
- Prototipado de asistentes de correo: la salida estructurada (categoría, urgencia, personal, acción) sirve como señal de entrada para sistemas de resumen o respuesta asistida que necesiten decidir qué mensajes atender primero.

## Benchmarks y rendimiento

Evaluación sobre 546 correos públicos reservados, etiquetados por dos modelos Claude a ciegas (solo se conservaron etiquetas con acuerdo). La referencia es Jev 1.14, un modelo alojado, en su mejor configuración por métrica.

| Medida | Este modelo | Jev 1.14 | Diferencia (IC 95 %) |
|---|---|---|---|
| Categoría | 90,2 % | 92,4 % | -2,2 [-5,1; 0,6] |
| Precisión needs-reply | 87,8 % | 84,8 % | +3,0 [-3,7; 9,6] |
| Recall needs-reply | 90,8 % | 98,3 % | -7,6 [-13,1; -2,5] |
| Urgencia de respuesta, exacta | 84,4 % | 83,9 % | no disponible |
| Personal | 96,7 % | 95,2 % | no disponible |
| Acción, AUC | 0,965 | 0,993 | -0,028 [-0,057; -0,004] |

El umbral de acción se eligió sobre correo de desarrollo después del test; con ese umbral, el conjunto de test capturó 23 de 27 correos urgentes y marcó 43 de 495 no urgentes (cifras leídas tras el test). Cada modelo tarda unos 40 ms por correo en 4 hilos de CPU y ambos juntos ocupan unos 460 MiB.

## Requisitos de hardware

- VRAM: no aplica; la inferencia está pensada para CPU con ONNX Runtime (`CPUExecutionProvider`).
- Memoria: aproximadamente 460 MiB para ambos modelos en float32.
- GPU: no se documenta soporte ni necesidad de GPU; funciona en cualquier CPU moderna.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos, al no requerir GPU.
- Despliegue: ONNX Runtime (Node.js con `onnxruntime-node` 1.30.0, Python con `onnxruntime` 1.30.0 y `tokenizers` 0.23.2); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: unos 40 ms por correo en 4 hilos de CPU; el throughput no se detalla más allá de esa cifra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wildroot Mail v1 | 33,4 M | 256 tokens | Clasificación y priorización de correo | MIT | ONNX en HuggingFace |
| BAAI/bge-small-en-v1.5 | 33,4 M | 512 tokens (modelo base) | Embeddings de recuperación | MIT | HuggingFace |
| Jev 1.14 | no disponible | no disponible | Clasificación de correo | no disponible (alojado) | Servicio alojado |

La comparación con Jev 1.14 procede de la propia model card: Wildroot Mail v1 queda ligeramente por detrás en categoría y AUC de acción, pero mejora en precisión de needs-reply y ofrece ejecución local con licencia MIT. Frente a su modelo base, Wildroot Mail v1 añade cabezas de clasificación específicas de correo y una capa de reglas, a costa de reducir el contexto a 256 tokens.

## Limitaciones y advertencias

- Solo soporta inglés; el tokenizador y el corpus de entrenamiento están en ese idioma.
- Contexto limitado a 256 tokens, lo que trunca correos largos y puede perder información relevante del cuerpo.
- El conjunto de test se eligió con más correo urgente de lo habitual en una bandeja real, por lo que las métricas pueden no trasladarse directamente a producción.
- El umbral de acción se calibró sobre correo de desarrollo después de la evaluación, y las cifras de captura y falsos positivos se leyeron tras el test, lo que introduce riesgo de sobreajuste al conjunto de evaluación.
- La excepción de reglas para correo de listas de discusión que aceptan publicaciones no se ha confirmado en correo reservado.
- Las etiquetas de evaluación provienen de dos modelos Claude, no de anotadores humanos, con el sesgo que ello implica.
- El entrenamiento se apoya mayoritariamente en Enron (80 %), un corpus histórico que puede no representar la distribución del correo actual.
- Riesgo de alucinación bajo en sentido estricto (es un clasificador), pero las probabilidades pueden ser poco fiables en dominios alejados del entrenamiento.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar con `replay.mjs` cualquier cambio de runtime antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bpmatt/wildroot-mail-v1
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- ONNX Runtime: https://onnxruntime.ai/
- Repositorio de tokenizers (HuggingFace): https://github.com/huggingface/tokenizers
