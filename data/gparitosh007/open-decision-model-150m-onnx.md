# gparitosh007/Open-Decision-Model-150M-ONNX

## Resumen

Open Decision Model 150M (ONNX fp16) es la exportación a formato ONNX del modelo de decisión `gparitosh007/Open-Decision-Model-150M`, desarrollado por el usuario gparitosh007. No es un modelo generativo: recibe un estado (una descripción textual de una situación) y una lista de opciones, y devuelve una probabilidad calibrada para cada opción. Su propósito es actuar como componente de decisión dentro de sistemas de agentes, enrutado de LLM, evaluación de riesgo de herramientas y guardarraíles.

El modelo está construido sobre una arquitectura tipo encoder ModernBERT con 150 millones de parámetros y se distribuye en fp16 con un peso de 299 MB, ejecutable mediante ONNX Runtime sin necesidad de PyTorch. Esto lo hace apto para entornos serverless y funciones ligeras donde instalar el stack de PyTorch resulta inviable, como una función de Vercel.

La relevancia actual reside en su orientación a decisiones estructuradas y calibradas dentro de pipelines de agentes: en lugar de generar texto libre, produce distribuciones de probabilidad sobre opciones predefinidas, lo que facilita la integración con lógica determinista y la auditoría de decisiones. El autor publica además un endpoint MCP público y sin estado para probarlo sin descarga ni clave de API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo ModernBERT con cabeza de span (según tags del modelo) |
| Parametros totales | 150M (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (exportación ONNX); el modelo base podría admitir otras, no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`), más `tokenizer.json` y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo base es un encoder de 150M parámetros etiquetado como ModernBERT, con una cabeza de span que produce probabilidades sobre opciones candidatas. La exportación ONNX conserva el encoder y la cabeza en fp16 (299 MB) y mantiene la misma interfaz de entrada, orden de opciones y formato de salida que la versión PyTorch. La verificación incluida en `VERIFY.json` reporta una diferencia máxima de probabilidad de 0,000277 sobre 50 registros respecto al modelo original.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor remite a la model card del modelo base para datos de entrenamiento, evaluación y limitaciones. La calibración de probabilidades se gestiona mediante una temperatura de calibración incluida en `decision_config.json`.

## Capacidades

- Clasificación de decisión con múltiples opciones: devuelve una probabilidad calibrada por opción y un nivel de confianza.
- Puntuación en escalas ordenadas (por ejemplo, de trivial a muy difícil), con nivel esperado y leyenda.
- Respuesta a preguntas de sí/no con probabilidad `p_yes`.
- Ejecución de varias preguntas sobre un mismo estado en formato Jev/Laya.
- Entrevista de preferencias por dominio para generar ficheros de preferencia.
- Registro de retroalimentación sobre decisiones tomadas (aceptar, rechazar u otra acción).
- Soporte de tool calling mediante servidor MCP con herramientas `choice`, `score`, `noul`, `decide`, `build_preferences` y `feedback`.
- Capacidad de clasificación zero-shot y de elección múltiple.
- No genera texto; su salida es probabilística y estructurada.
- Idiomas: únicamente inglés.

## Casos de uso

- Enrutado de LLM: dado un estado (por ejemplo, una solicitud de refactorización con el tamaño del repositorio) y opciones como `haiku`, `sonnet` u `opus`, el modelo devuelve la probabilidad de cada modelo candidato, permitiendo seleccionar el más adecuado según coste y complejidad.
- Guardarraíles de riesgo de herramientas: antes de invocar una herramienta o función, el modelo evalúa el estado y las opciones de riesgo para decidir si la acción es segura o requiere revisión.
- Verificaciones de sí/no en pipelines de agentes: el endpoint `noul` responde con `p_yes` a preguntas binarias, útil para validaciones intermedias sin generar texto.
- Puntuación de dificultad de tareas: con `score`, se asigna una probabilidad a cada nivel de una escala ordenada (por ejemplo, trivial a muy difícil), lo que permite priorizar colas de trabajo o asignar recursos.
- Entrevistas de preferencias: `build_preferences` genera un fichero de preferencias por dominio que luego se usa en llamadas `choice`, `score` o `noul` para personalizar decisiones.
- Auditoría de decisiones: `feedback` registra la acción tomada sobre una decisión, permitiendo construir un histórico de aceptación y rechazo para evaluar la calidad del enrutado.
- Despliegue serverless: al ejecutarse con ONNX Runtime sin PyTorch y pesar 299 MB, puede desplegarse en funciones ligeras como Vercel; la primera llamada tras inactividad tarda unos 50 s por la descarga del modelo y las posteriores menos de 1 s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la diferencia máxima de probabilidad de 0,000277 sobre 50 registros entre la versión ONNX y el modelo PyTorch original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso fp16 es de 299 MB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y entornos serverless.
- Cabe en GPU de consumo: sí, por tamaño (299 MB en fp16), aunque no se especifican requisitos mínimos.
- Opciones de despliegue: ONNX Runtime, endpoint MCP público en Vercel, servidor propio con MCP o HTTP (`/v1/decide`).
- Latencia: primera llamada tras inactividad en el endpoint público en torno a 50 s (descarga del modelo); llamadas posteriores por debajo de 1 s.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (modelos de decisión o enrutado de 150M) en la información disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha documentado soporte multilingüe.
- No genera texto: cualquier caso de uso que requiera generación debe combinarse con otro modelo.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades calibradas pueden no ser fiables fuera de la distribución de entrenamiento; no se han publicado evaluaciones de calibración más allá de la verificación ONNX.
- La instancia pública MCP es sin estado: no guarda ficheros ni registra cuerpos de petición, por lo que las preferencias deben enviarse en línea en cada llamada y el feedback no persiste.
- Para conservar ficheros de preferencia y retroalimentación es necesario desplegar un servidor propio.
- La primera llamada al endpoint público tras un periodo de inactividad tarda unos 50 s, lo que puede ser inadecuado para flujos interactivos sin precalentamiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento, no detallados en la información disponible.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gparitosh007/Open-Decision-Model-150M-ONNX
- Modelo base: https://huggingface.co/gparitosh007/Open-Decision-Model-150M
- Endpoint MCP público: https://decision-model.vercel.app/mcp
- Endpoint HTTP de decisión: https://decision-model.vercel.app/v1/decide
