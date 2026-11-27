# eduardoworrel/Qwen3.5-0.8B-Forecast-Refusal-ONNX-S1S2

## Resumen

Qwen3.5-0.8B-Forecast-Refusal-ONNX-S1S2 es un paquete experimental publicado por el usuario eduardoworrel que empaqueta el modelo base Qwen/Qwen3.5-0.8B en formato ONNX cuantizado a int4, junto con una salida de activaciones intermedias y una pequeña cabeza lineal que estima la probabilidad de que el modelo rechace una petición antes de generar ningún token de respuesta. No es un modelo de lenguaje nuevo, sino un derivado del checkpoint de Qwen con un clasificador auxiliar añadido para predecir el comportamiento de rechazo (refusal forecasting).

El objetivo es permitir que una aplicación decida, antes de gastar cómputo en la generación, si el modelo va a negarse a responder. La cabeza lee la activación de la capa 11 con pooling del último token y devuelve una probabilidad en `forecast.behaviors.refuse.p`, usando la pregunta de decisión "Will your answer refuse to do what this request asks?". El paquete está pensado para ejecutarse en el navegador mediante WebGPU y ONNX Runtime Web 1.31.1.

Se trata de un artefacto de investigación con validación limitada: el piloto exploratorio usó 991 prompts en inglés procedentes de IFEval y XSTest, con etiquetas de rechazo generadas por el propio modelo y sin validación humana. El repositorio ocupa 0,6 GB y los pesos del grafo rondan los 542 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B) con cabeza lineal de clasificación de rechazo sobre activaciones de la capa 11 |
| Parametros totales | 0.8B en el modelo base; cabeza lineal de tamaño no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (int4) con manifiesto `manifest.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros del que no se detallan en la información disponible ni la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO. Sobre ese checkpoint se construye un grafo ONNX cuantizado a int4 que expone una activación intermedia (capa 11) con pooling del último token; esa activación alimenta una cabeza lineal independiente que estima la probabilidad de rechazo.

La cabeza se ajustó por separado sobre activaciones int4. El piloto exploratorio empleó 991 prompts en inglés de IFEval y XSTest, con 225 reservados para evaluación y 29 rechazos en el conjunto de test; las etiquetas de rechazo las generó el propio modelo sin validación humana. No se documentan innovaciones como decodificación especulativa ni atención lineal. La innovación principal es el propio enfoque de forecasting: predecir el rechazo antes de la generación con cero tokens extra de prefill.

## Capacidades

- Predicción de rechazo previa a la generación: devuelve `forecast.behaviors.refuse.p` a partir de la activación de la capa 11.
- Inferencia en navegador de escritorio mediante WebGPU y ONNX Runtime Web 1.31.1.
- Ejecución con el lector de forecasting de s1s2.js usando el `manifest.json` del repositorio.
- Funcionamiento con cero tokens adicionales de prefill en el smoke test realizado.
- Compatibilidad con el ecosistema ONNX Runtime (variante WebGPU y CPU).
- Capacidades generativas heredadas del modelo base Qwen3.5-0.8B, no documentadas en esta ficha.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Filtrado previo de peticiones en aplicaciones de chat: consultar `forecast.behaviors.refuse.p` antes de invocar la generación completa y derivar la petición a un flujo alternativo si la probabilidad de rechazo supera un umbral configurado.
- Enrutado condicional en pipelines con System 2: usar la señal de rechazo como puerta para decidir si se lanza una continuación más costosa o se responde con una plantilla segura.
- Moderación de bajo coste en el cliente: al ejecutarse en WebGPU dentro del navegador, permite evaluar la intención de rechazo sin enviar la petición a un servidor.
- Investigación sobre comportamiento de rechazo: analizar cómo varía la probabilidad estimada según la formulación de la petición en experimentos controlados con IFEval y XSTest.
- Prototipado de interfaces adaptativas: mostrar avisos o reformular la petición al usuario cuando el forecast indique alta probabilidad de rechazo, antes de generar la respuesta.
- Evaluación comparativa de cuantizaciones: comparar la fidelidad de la señal entre ONNX Runtime WebGPU y ONNX Runtime CPU sobre el mismo grafo int4.
- Docencia y demos de forecasting de comportamiento: ilustrar técnicas de probing sobre activaciones intermedias en un entorno de navegador reproducible.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| AUROC (cabeza int4 sobre activaciones int4) | 0.781 | Conjunto reservado de 225 prompts, 29 rechazos |
| Diferencia absoluta media de probabilidad WebGPU vs CPU | 0.031 | Smoke test en Chrome WebGPU con 12 prompts reservados |
| Diferencia absoluta máxima de probabilidad WebGPU vs CPU | 0.184 | Mismo smoke test |
| Casos por encima de la tolerancia provisional de 0.05 | 3 | Mismo smoke test |

No se han publicado resultados de benchmarks de generación (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden exclusivamente al piloto exploratorio del autor y no constituyen una validación de umbral de despliegue.

## Requisitos de hardware

- VRAM estimada: el grafo int4 ocupa aproximadamente 542 MB de pesos, por lo que la inferencia requiere del orden de 1 a 1,5 GB de memoria considerando activaciones y buffers, aunque no se documenta una cifra oficial.
- GPU recomendadas: no disponible; el entorno probado es Chrome de escritorio con WebGPU, sin especificar modelo de GPU.
- Cabe en GPU de consumo: sí, por el tamaño del grafo int4, aunque no se detallan modelos concretos validados.
- Opciones de despliegue: ONNX Runtime Web 1.31.1 con WebGPU en navegador; ONNX Runtime CPU en Python para el smoke test comparativo; lector de forecasting de s1s2.js.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Forecast-Refusal-ONNX-S1S2 | 0.8B + cabeza lineal | no disponible | Forecasting de rechazo sobre ONNX int4 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | 0.8B | no disponible | Modelo base generativo | no disponible | Hugging Face |
| Alternativas de clasificación de rechazo | no disponible | no disponible | Clasificadores dedicados | no disponible | no disponible |

No se dispone de información sobre modelos comparables de forecasting de rechazo en la documentación proporcionada.

## Limitaciones y advertencias

- Carácter experimental: el propio autor etiqueta el paquete como experimental y el piloto como exploratorio.
- Etiquetas sin validación humana: los 29 rechazos del conjunto de test fueron generados por el propio modelo, lo que puede introducir sesgo de confirmación.
- Muestra pequeña: 225 prompts reservados y 12 en el smoke test de WebGPU no bastan para calibrar un umbral de despliegue.
- Desviación WebGPU vs CPU: tres casos superaron la tolerancia provisional de 0.05, con un máximo de 0.184, lo que desaconseja usar la señal sin recalibración por plataforma.
- Idioma: solo inglés según la model card.
- Alcance limitado: la cabeza predice rechazo, no calidad, toxicidad ni corrección de la respuesta.
- Sin validación de la puerta para continuación de System 2, según el propio autor.
- Licencia apache-2.0: permite uso comercial, pero la falta de validación desaconseja producción sin evaluación propia.
- Riesgo de alucinación del modelo base no evaluado en esta ficha.
- Sin datos publicados sobre sesgos, contexto máximo ni rendimiento generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3.5-0.8B-Forecast-Refusal-ONNX-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio s1s2.js (PR del lector de forecasting): https://github.com/eduardoworrel/s1s2.js/pull/2
- Piloto y limitaciones: https://github.com/eduardoworrel/s1s2.js/issues/1
