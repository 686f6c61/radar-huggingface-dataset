# FrontiersMind/Lumma-fev-4B-v2

## Resumen

Lumma-Fev-4B-v2 es un modelo de decisión (decision model) desarrollado por FrontiersMind, basado en un ajuste fino de Qwen3.5-4B-Base. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (texto, JSON o array) junto con preguntas tipadas y devuelve, en una sola pasada hacia adelante, una probabilidad calibrada para cada opción. Esto elimina la necesidad de parsear respuestas generadas y lo hace adecuado para tareas de clasificación y enrutamiento de decisiones en producción.

La versión 2 introduce dos cambios relevantes respecto a Lumma-Fev-9B (y su variante 27B): capas de atención bidireccional —las capas de atención completa leen el prompt en ambas direcciones como un encoder, mientras que las capas Gated DeltaNet de atención lineal mantienen la causalidad— y un conjunto de entrenamiento ampliado a unos 300.000 muestras frente a las 100.000 anteriores. El modelo funciona en inglés, hindi, tamil y kannada (incluido Hinglish), lo que lo hace especialmente interesante para aplicaciones multilingües en la India.

Está entrenado con el framework DecisionFormer, se distribuye bajo licencia Apache 2.0 y requiere el paquete `lumma-fev` versión 0.3 o posterior, ya que versiones anteriores no aplican la atención bidireccional y se niegan a cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion bidireccional en capas full-attention y Gated DeltaNet (atencion lineal) causal |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens (pregunta mas estado) |
| Tipos de cuantizacion | no disponible (pesos en bf16, ~10 GB de GPU) |
| Idiomas soportados | ingles, hindi, tamil, kannada (y Hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (9,1 GB de tamano de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y se ajusta mediante el framework DecisionFormer para convertirse en un modelo de decision: en lugar de generar tokens, produce distribuciones de probabilidad sobre opciones tipadas (`choice`, `noul`, y `score` aunque este ultimo tipo se acepta sin haber sido probado). Cada pregunta lee el estado y sus propias opciones de forma independiente, de modo que la respuesta a una pregunta nunca influye en otra.

La innovacion principal de la v2 es la atencion bidireccional: las capas de atencion completa procesan todo el prompt en ambas direcciones, como un encoder, mientras que las capas Gated DeltaNet de atencion lineal permanecen causales. Esta combinacion permite leer el contexto completo sin perder la eficiencia de la atencion lineal. El entrenamiento se realizo con aproximadamente 300.000 muestras, triplicando las ~100.000 de la generacion anterior. El entrenamiento se realizo con la libreria DecisionFormer, publicada como codigo abierto por FrontiersMind.

## Capacidades

- Clasificacion de texto con probabilidades calibradas por opcion, en una sola pasada forward sin generacion de texto.
- Preguntas tipadas: `choice` (seleccion entre opciones con criterios descritos), `noul` (pregunta binaria/si-no) y `score` (aceptada pero no probada en entrenamiento).
- Entrada de estado flexible: texto plano, objetos JSON o arrays.
- Comprension de imagenes: soporta pasar imagenes (rutas, imagenes PIL o URLs `data:`) instalando el extra `lumma-fev[images]`.
- Multilingue: ingles, hindi, tamil, kannada y Hinglish.
- Cada pregunta se evalua de forma independiente respecto al estado, permitiendo consultas paralelas sin contaminacion entre respuestas.
- Despliegue como servicio mediante la API `POST /v1/systemone` compatible con TypeSafe.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una consulta de cliente, el modelo asigna probabilidades a equipos como facturacion, soporte tecnico o ventas, con un nivel de confianza explicito, sin depender de parsing de texto generado.
- Triage de urgencia: mediante preguntas `noul` del tipo "¿necesita el cliente respuesta hoy?" se prioriza automaticamente la cola de atención.
- Clasificacion multilingue en la India: funciona directamente con hindi, tamil, kannada y Hinglish, evitando el coste de traducir las consultas al ingles antes de clasificarlas.
- Moderacion y politicas de contenido: clasificacion de entradas en categorias definidas por el desarrollador con criterios escritos en lenguaje natural.
- Decisiones en pipelines de agentes: como no genera texto, puede usarse como componente determinista de enrutamiento dentro de sistemas multi-agente, reduciendo alucinaciones en pasos de decision.
- Clasificacion de documentos con imagenes: pasando imagenes junto al estado, puede categorizar tickets que incluyen capturas de pantalla o documentos escaneados.
- Servicios de decision en produccion: el servidor `lumma-fev-serve` expone el modelo detras de una API HTTP compatible con TypeSafe, listo para integrarse en arquitecturas de microservicios.

## Benchmarks y rendimiento

Calibracion (promedio sobre ocho benchmarks; menor es mejor):

| Metrica | Lumma-Fev-4B-v2 | Lumma-Fev-27B-v2 | Jev |
|---|---|---|---|
| Log loss | 0,401 | **0,307** | 1,315 |
| ECE | 0,045 | **0,024** | 0,088 |
| Brier | 0,237 | **0,178** | 0,291 |

La model card incluye ademas una imagen con accuracies comparativas sobre los mismos benchmarks para varios modelos, pero los valores numericos exactos no estan disponibles en texto; pueden consultarse en la propia model card.

## Requisitos de hardware

- VRAM estimada: unos 10 GB en bf16 para inferencia.
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM; cabe comodamente en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4070 Ti Super (16 GB). No se requieren A100 ni H100 para inferencia.
- Cabe en GPUs de consumo: si, en cualquier GPU moderna con 12 GB o mas de VRAM.
- Despliegue: mediante el paquete `lumma-fev` (PyPI, version 0.3 o superior) o el servidor incluido `lumma-fev-serve` con la API `POST /v1/systemone` compatible con TypeSafe. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; la carga manual con transformers requiere configurar `is_causal = False` en el config y en cada modulo de atencion de texto.
- Rendimiento: se recomienda instalar los kernels `flash-linear-attention` y `causal-conv1d` para evitar el codigo PyTorch lento por defecto de transformers. Al no generar texto, la inferencia es una unica pasada forward por lote de preguntas. Latencias concretas no disponibles.

## Comparativa con modelos similares

| | Lumma-Fev-4B-v2 | Lumma-Fev-27B-v2 | Jev |
|---|---|---|---|
| Desarrollador | FrontiersMind | FrontiersMind | no disponible |
| Tipo | Modelo de decision | Modelo de decision | Modelo de decision |
| Parametros | ~4,5 B | ~27 B | no disponible |
| Calibracion (log loss / ECE / Brier) | 0,401 / 0,045 / 0,237 | 0,307 / 0,024 / 0,178 | 1,315 / 0,088 / 0,291 |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Disponibilidad | Hugging Face (publico) | no disponible | no disponible |

La version 27B de la misma familia ofrece mejor calibracion en todas las metricas, a costa de un consumo de recursos mucho mayor; la version 4B es la opcion eficiente para despliegues con hardware limitado. Jev, el modelo de referencia comparado en la model card, muestra una calibracion claramente peor (log loss de 1,315 frente a 0,401).

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones tipadas, por lo que no es sustituto de un LLM generativo en tareas de redaccion, codigo o razonamiento abierto.
- Las preguntas de tipo `score` se aceptan pero no fueron probadas en el entrenamiento; su uso no esta garantizado.
- La pregunta mas el estado deben caber en 8.192 tokens; entradas mas largas no estan soportadas.
- Versiones del paquete `lumma-fev` anteriores a la 0.3 no aplican la atencion bidireccional y se niegan a cargar el checkpoint.
- Al cargar los pesos manualmente con transformers, basta olvidar configurar `is_causal = False` en los modulos de atencion para que las peticiones individuales sin padding se ejecuten causalmente, produciendo resultados incorrectos de forma silenciosa.
- Sin los kernels `flash-linear-attention` y `causal-conv1d`, el rendimiento de inferencia degrada notablemente al usar codigo PyTorch por defecto.
- El soporte de imagenes requiere instalar el extra `lumma-fev[images]`.
- Datos de sesgos conocidos, riesgo de alucinacion y restricciones adicionales de licencia: no disponibles en la informacion proporcionada (la licencia Apache 2.0 permite uso comercial).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/Lumma-fev-4B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Framework de entrenamiento DecisionFormer: https://github.com/FrontiersMindAI/decisionformer
- Paquete lumma-fev en PyPI: https://pypi.org/project/lumma-fev/
