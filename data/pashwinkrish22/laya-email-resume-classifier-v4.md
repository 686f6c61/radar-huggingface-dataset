# pashwinkrish22/laya-email-resume-classifier-v4

## Resumen

Laya-email-resume-classifier-v4 es un ajuste fino del modelo base convaiinnovations/laya orientado a una tarea muy concreta: clasificar correos de solicitud de empleo en una de cuatro categorias (`freshers`, `experienced`, `referrals`, `others`). Lo publica el usuario pashwinkrish22 y esta pensado como un clasificador de decisiones tipadas, no como un modelo conversacional. El problema que resuelve es el triaje automatico de bandejas de entrada de reclutamiento, donde hace falta etiquetar candidaturas de forma rapida y determinista.

El modelo base, Laya, es un modelo de decision "System 1" no autorregresivo y multilingue: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas en un unico pase forward, del orden de decenas de milisegundos, y soporta mas de 100 idiomas segun su documentacion. El ajuste fino hereda ese enfoque y anade una capa de clasificacion especifica sobre correos de candidaturas.

Con aproximadamente 421 millones de parametros y un repo de 0,8 GB, es un modelo pequeno y ligero, adecuado para ejecucion local. Su relevancia es la de un componente especializado dentro de un pipeline de recursos humanos: una alternativa compacta y de baja latencia frente a usar un LLM grande para una tarea de etiquetado cerrada. Conviene senalar que no hay resultados de benchmarks publicos y que el propio autor advierte de riesgos de privacidad por memorizacion de fragmentos del texto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision no autorregresivo "System 1" (base: convaiinnovations/laya); detalles internos del encoder no disponibles |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo de 0,8 GB sugiere pesos en FP16) |
| Idiomas soportados | no disponible en el modelo ajustado; el base Laya declara mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Laya, descrito por su autor como un modelo de decision "System 1" no autorregresivo y multilingue. En lugar de generar texto token a token, Laya recibe un estado (texto, correo, ticket o JSON) y un conjunto de preguntas tipadas (por ejemplo, una eleccion entre categorias) y devuelve respuestas tipadas con probabilidades calibradas en un unico pase forward. Segun la documentacion del base, se entreno con aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD), de modo que reportar probabilidades honestas es el comportamiento optimo. Los detalles concretos de la arquitectura interna (tipo de transformer, atencion, capas) no estan disponibles en la informacion proporcionada.

Sobre el ajuste fino v4 en si, la model card indica que se entreno sobre un dataset privado y anonimizado de correos de solicitud de empleo con cuatro etiquetas de salida. El autor senala explicitamente que el modelo no se ha evaluado contra el benchmark publico `LocalLLaMA/typed-decisions`. Los datos concretos de entrenamiento (numero de tokens, numero de ejemplos, composicion del dataset, si hubo RLHF o DPO adicionales) no estan disponibles. La model card menciona apartados de "Validation results" y "Accuracy" sobre un split de validacion del dataset privado, pero no incluye cifras.

## Capacidades

- Clasificacion de correos de candidatura en cuatro categorias: `freshers` (recien graduado, 0-1 anos de experiencia), `experienced` (mas de 1 ano a tiempo completo), `referrals` (candidato referido por un empleado) y `others` (no es candidatura o es ambigua).
- Prediccion de decisiones tipadas con probabilidades calibradas, heredada del diseno del base Laya.
- Procesamiento en un unico pase forward (no autorregresivo), con baja latencia.
- Soporte multilingue: el base Laya declara mas de 100 idiomas; el alcance multilingue del ajuste fino concreto no esta confirmado.
- Entrada basada en estado mas preguntas tipadas (API `agent.predict(state, questions)` de la libreria `laya`).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje de bandeja de entrada de reclutamiento: el modelo clasifica automaticamente cada correo entrante como candidatura de perfil junior, senior, referido u otros, permitiendo enrutar cada mensaje al flujo correcto sin intervencion manual.
- Priorizacion de referidos: al detectar la etiqueta `referrals`, un equipo de RR. HH. puede dar prioridad a candidaturas referidas por empleados, aplicando una politica de respuesta mas rapida sobre esos mensajes.
- Filtrado previo al ATS: antes de volcar correos a un sistema de seguimiento de candidatos, el clasificador descarta o separa los mensajes que no son candidaturas (`others`), reduciendo ruido en la base de datos.
- Enrutamiento entre reclutadores especializados: los perfiles `freshers` y `experienced` pueden dirigirse a distintas personas o equipos con criterios de evaluacion diferentes.
- Automatizacion de acuses de recibo: en funcion de la categoria predicha, un pipeline puede disparar plantillas de respuesta distintas (por ejemplo, un mensaje especifico para candidatos junior frente a senior).
- Analitica de embudo de contratacion: agregando las etiquetas a lo largo del tiempo se obtienen metricas de que proporcion de candidaturas son junior, senior, referidas u otras, util para informes de reclutamiento.
- Clasificacion local y sensible a latencia: al ser un modelo pequeno y no autorregresivo, se puede desplegar on-premise para procesar lotes de correos rapidamente sin depender de APIs externas.
- Deteccion de candidaturas referidas para programas de bonificacion: marcar los `referrals` permite aplicar automaticamente incentivos de referidos segun la politica interna de la empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona apartados de resultados de validacion y precision sobre un split del dataset privado, pero no incluye cifras, y el autor indica explicitamente que el modelo no se ha evaluado contra el benchmark publico `LocalLLaMA/typed-decisions`.

| Benchmark | Resultado |
|---|---|
| `LocalLLaMA/typed-decisions` | no evaluado (segun el autor) |
| Precision en validacion (dataset privado) | cifra no disponible |

## Requisitos de hardware

- Parametros: 421,3 millones. Estimacion de memoria de pesos por precision: FP32 en torno a 1,7 GB, FP16 en torno a 0,85 GB, INT8 en torno a 0,42 GB, INT4 en torno a 0,21 GB. Son estimaciones calculadas a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: al ser un modelo pequeno, cabe en practicamente cualquier GPU moderna, incluidas tarjetas de gama consumer como RTX 3060, RTX 4060 o superiores. Tambien es viable en CPU para cargas de baja concurrencia.
- Cabe en GPU consumer: si, con margen amplio, incluso en configuraciones de poca VRAM.
- Opciones de despliegue: la via documentada por el autor es la libreria `laya` (`pip install laya`) sobre `transformers`. El soporte para vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; al ser un modelo no autorregresivo, los motores centrados en generacion de texto pueden no ser aplicables directamente.
- Latencia y throughput: no disponibles para este ajuste fino. Para el base Laya, la documentacion menciona tiempos del orden de 21-33 ms por pase forward, que pueden servir como referencia orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pashwinkrish22/laya-email-resume-classifier-v4 | 421,3 M | no disponible | Decision no autorregresiva ajustada para clasificacion de correos | Apache 2.0 | HuggingFace (repo con 0 descargas) |
| convaiinnovations/laya (base) | no disponible | no disponible | Decision no autorregresiva multilingue, multiuso | no disponible en la informacion | HuggingFace, ModelScope |
| TypeSafe Jev | no disponible | no disponible | Modelo de decision tipada | no disponible | Propietario, segun las referencias |
| Clasificador tipo BERT/DistilBERT ajustado | variable (110-340 M) | 512 tokens tipicos | Encoder autorregresivo de clasificacion | variable | Amplia disponibilidad |

Las cifras de parametros y contexto de los modelos comparables no estan confirmadas en la informacion proporcionada; se ofrecen como referencia cualitativa de categoria.

## Limitaciones y advertencias

- El modelo no tiene benchmarks publicos ni evaluacion contra el benchmark `LocalLLaMA/typed-decisions`, por lo que su rendimiento real en produccion no esta verificado de forma independiente.
- La model card advierte de riesgo de memorizacion: aunque se eliminaron identificadores personales (nombres, correos, telefonos) antes del entrenamiento, el autor senala que el encoder base puede memorizar fragmentos del texto de entrenamiento.
- El propio autor indica que el repo es privado y que no debe hacerse publico sin revision, lo que es un aviso de privacidad relevante.
- Es un clasificador de una tarea muy concreta (correos de candidatura, cuatro categorias). No es un modelo de proposito general y no se debe esperar generacion de texto, razonamiento abierto ni conversacion.
- Las cuatro categorias son mutuamente excluyentes por diseno; la categoria `others` agrupa casos ambiguos, lo que puede ocultar errores de clasificacion en los limites entre clases.
- El alcance linguistico real del ajuste fino no esta confirmado; el base es multilingue, pero el dataset de ajuste (correos de candidatura) podria ser predominantemente en un solo idioma.
- Licencia Apache 2.0 en el ajuste fino, pero la licencia del modelo base aparece como "no disponible" en la informacion recogida, por lo que conviene verificar los terminos de uso comercial del base antes de desplegarlo en produccion.
- Riesgo de alucinacion de categorias: al ser un modelo de decision, puede asignar etiquetas con alta confianza a correos ambiguos; se recomienda umbral de confianza y revision humana en casos limite.
- El modelo tiene 0 descargas y 0 "likes" en HuggingFace en el momento de la ficha, sin comunidad ni soporte documentado.
- Repo de 0,8 GB y pesos safetensors: verificar la precision real de los pesos antes de calcular requisitos de VRAM en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pashwinkrish22/laya-email-resume-classifier-v4
- Version previa del ajuste: https://huggingface.co/pashwinkrish22/laya-email-resume-classifier
- Modelo base en HuggingFace: https://huggingface.co/convaiinnovations/laya
- Modelo base en ModelScope: https://www.modelscope.cn/models/convaiinnovations/laya
- Sitio del proyecto Laya AI: https://laya-ai.com/
- Articulo comparativo Laya frente a Jev: https://brainfunctioncollapse.com/laya
