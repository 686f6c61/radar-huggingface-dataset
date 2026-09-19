# aac6fef/laya-typed-decisions-mlx

## Resumen

laya-typed-decisions-mlx es una conversión nativa a MLX en FP16 del checkpoint convaiinnovations/laya-typed-decisions, publicada por el usuario aac6fef. No es un modelo generativo: es un encoder de decisión bidireccional construido sobre ModernBERT-large, con 421.293.830 parámetros totales, que responde preguntas tipadas (elección entre opciones, puntuación ordinal y booleano) sobre un texto de entrada. Su propósito es funcionar como componente de decisión estructurada dentro de flujos de agentes, devolviendo respuestas tipadas en lugar de texto libre.

La conversión no reentrena ni cuantiza: preserva los pesos en FP16, renombra los parámetros para adaptarlos a MLX y mantiene el formateo de preguntas, el tokenizador, las temperaturas de calibración y el esquema de salida del modelo original. El runtime `laya_mlx` aporta la arquitectura personalizada necesaria para interpretar el checkpoint y no requiere PyTorch ni Transformers en tiempo de ejecución.

Es relevante para desarrolladores que despliegan agentes en Apple Silicon (macOS 26+, Python 3.11+) y necesitan un modelo de decisión pequeño, determinista y de baja huella de memoria, en lugar de invocar un LLM generativo para tareas de clasificación o enrutado. La ventana de contexto es de 1024 tokens en total, compartida entre el estado de entrada, las preguntas y las opciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder bidireccional) con cabeza de decisión, cabeza de puntuación (*scoring head*) y cabeza de acción (*action head*) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en total (compartidos entre estado de entrada, preguntas y opciones) |
| Tipos de cuantizacion | No disponible. Los pesos se preservan en FP16; el runtime permite cargar con `dtype="float32"` para acercarse a la aritmética FP32 de origen |
| Idiomas soportados | Ingles (en). El propio autor indica que para texto no ingles debe usarse el checkpoint multilingue de Laya |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors para MLX (repositorio de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. Parte del checkpoint `convaiinnovations/laya-typed-decisions` (revisión `f9ab0b228f0fc0f14d873dbc99038f135c2da1b2`) y del código upstream `NandhaKishorM/laya` (commit `6a5819129eb220570792e417e49723d697efd76f`). La conversión renombra parámetros para MLX y conserva los pesos en FP16; el autor declara explícitamente que no reentrena ni cuantiza a menos bits. Cada tensor exportado fue verificado por igualdad exacta con el tensor de origen convertido a FP16.

El backbone es ModernBERT-large, un encoder bidireccional, sobre el que se montan las cabezas de decisión, puntuación y acción que dan soporte a tres tipos de pregunta: `choice` (selección entre criterios), `score` (ordinal) y `noul` (booleano). No se incluye implementación de entrenamiento en el repositorio, ni datos sobre el dataset, el número de tokens de entrenamiento o si hubo RLHF/DPO: esa información no está disponible en el material proporcionado. La innovación relevante de esta ficha es de portabilidad: ejecución íntegra en MLX, sin dependencia de PyTorch ni Transformers, con temperaturas de calibración y esquema de salida preservados.

## Capacidades

- Clasificación de texto y decisión estructurada: genera respuestas tipadas en lugar de texto libre.
- Preguntas de tipo `choice`: elegir una opción entre una lista de criterios (por ejemplo, departamento responsable).
- Preguntas de tipo `score`: asignar una puntuación ordinal.
- Preguntas de tipo `noul`: responder verdadero/falso (por ejemplo, si el cliente solicita devolución de dinero).
- Múltiples preguntas simultáneas sobre un mismo estado de entrada, devueltas en un diccionario `answers`.
- Salida con probabilidades calibradas (el autor reporta diferencias máximas de calibración frente al original).
- Ejecución determinista: 100 llamadas repetidas produjeron salidas finitas y deterministas.
- No soporta generación de texto, tool calling, razonamiento multi-paso autónomo, visión ni audio: el propio autor indica que el repositorio no incluye un modelo de lenguaje generativo.
- Multilingüismo: limitado a inglés en este checkpoint.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la model card clasifica una reclamación de facturación duplicada hacia el departamento correcto (`billing`, `technical`, `sales`) y responde en paralelo si el cliente pide reembolso, con dos preguntas tipadas sobre el mismo texto.
- Puertas booleanas en pipelines de agentes: usar preguntas `noul` para decidir si se activa una rama del flujo (por ejemplo, "¿el usuario pide hablar con un humano?") sin coste de generación de tokens.
- Moderación y políticas de contenido: preguntas `score` para graduar la severidad de un mensaje y `choice` para asignar la categoría de infracción, con salida calibrada reutilizable como umbral.
- Triaje de formularios y correos entrantes: extraer decisiones estructuradas (prioridad ordinal, tipo de solicitud) antes de pasarlas a un sistema de gestión.
- Evaluación automática de respuestas: puntuar ordinalmente la calidad de una respuesta generada por otro modelo dentro de un pipeline de evaluación.
- Clasificación por lotes en local sobre Mac: al ser un encoder de 421 M de parámetros con 0,8 GB de pesos, permite procesar volúmenes altos de texto en un portátil o equipo de sobremesa Apple Silicon sin GPU dedicada ni servicio en la nube.
- Preprocesado determinista en CI/CD: dado que las 100 llamadas repetidas dieron salidas idénticas y sin crecimiento de memoria tras limpiar cachés, es apto para tests de regresión que comparen decisiones esperadas.
- Sistemas con requisitos de contexto corto: para entradas que quepan en 1024 tokens, sustituye a un LLM generativo en tareas de decisión, reduciendo latencia y consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, GLUE, HumanEval ni métricas de calidad de tarea en el material proporcionado). Los únicos datos numéricos son de fidelidad del port, no de calidad del modelo:

| Metrica de validacion | Valor |
|---|---|
| Acuerdo FP16 (MLX) con PyTorch MPS FP32 en el argmax | 63/63 distribuciones de decisión, sobre 16 casos |
| Diferencia maxima de probabilidad calibrada | 0,0016849 |
| Estabilidad en 100 llamadas repetidas | Salidas finitas y deterministas |
| Crecimiento de memoria activa MLX tras limpiar caches | 0 bytes |
| Verificacion de tensores exportados | Igualdad exacta con el tensor de origen convertido a FP16 |

Entorno de validación declarado: Apple M3 Max, GPU de 40 núcleos, 128 GB de memoria unificada, macOS 27.2, Python 3.12.13 y MLX 0.32.2. El autor advierte que estas comprobaciones establecen fidelidad del port, no que todas las respuestas del modelo sean correctas.

## Requisitos de hardware

- Peso de los pesos en FP16: aproximadamente 0,84 GB (421,29 M de parámetros); el repositorio ocupa 0,8 GB.
- VRAM/memoria unificada estimada para inferencia: del orden de 1-2 GB incluyendo activaciones y el runtime, dado el contexto máximo de 1024 tokens. Cifra orientativa, no publicada por el autor.
- Plataforma soportada: Apple Silicon exclusivamente, ya que se ejecuta con MLX. Entorno validado en Apple M3 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip de la serie M (la model card no fija un mínimo de memoria unificada).
- GPU NVIDIA o AMD: no soportadas por este checkpoint; el modelo base en PyTorch sería la vía para otros aceleradores.
- Opciones de despliegue: únicamente el runtime `laya_mlx`, instalado con `python -m pip install 'git+https://github.com/mizorewww/laya-mlx.git'`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al tratarse de una arquitectura personalizada con cabezas propias, esos servidores no la soportarían sin código adicional.
- Requisitos de software: macOS 26 o superior y Python 3.11 o superior.
- Latencia y throughput: no disponibles. Solo se enlaza un informe de rendimiento comparativo entre MLX y el runtime original en la misma máquina (`BENCHMARKS.md` del repositorio), sin cifras extraídas en este material.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| aac6fef/laya-typed-decisions-mlx | 421,29 M | 1024 tokens | Safetensors MLX, runtime `laya_mlx` | Ingles | Apache-2.0 | Port FP16 sin cuantizar; sin PyTorch en ejecución |
| convaiinnovations/laya-typed-decisions (original) | No disponible | No disponible | PyTorch | Ingles | No disponible en este material | Checkpoint de origen; mantiene calidad y calibración originales |
| Checkpoint multilingue de Laya (sin identificar) | No disponible | No disponible | No disponible | No ingles | No disponible | El autor lo señala como la opción prevista para texto no inglés |
| ModernBERT-large (backbone) | No disponible en este material | No disponible en este material | Safetensors / Transformers | Mayoritariamente ingles | No disponible en este material | Modelo base sobre el que se construyen las cabezas de decisión |

No hay datos de rendimiento comparativo entre estas alternativas en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no hace tool calling ni razonamiento multi-paso. Solo devuelve decisiones tipadas.
- Formato de pregunta cerrado: solo admite `choice`, `score` ordinal y booleano `noul`. Cualquier otra tarea queda fuera de su alcance.
- Contexto muy corto: 1024 tokens en total, compartidos entre el estado de entrada, las preguntas y las opciones. Entradas largas obligan a recortar o resumir antes de llamar al modelo.
- Idioma: entrenado para inglés. El propio autor remite al checkpoint multilingüe para texto en otros idiomas, por lo que usarlo en castellano produciría resultados no fiables.
- Calidad y calibración heredadas: la conversión solo garantiza fidelidad numérica frente al original; no mejora ni corrige sesgos, errores de calibración ni alucinaciones del checkpoint de origen.
- Riesgo de decisión errónea: al ser un clasificador, un fallo se traduce en una etiqueta o un booleano incorrecto sin señal de incertidumbre explícita más allá de la probabilidad calibrada. Se recomienda umbral y validación humana en flujos sensibles.
- Sesgos: no hay información publicada sobre sesgos demográficos, de dominio o de estilo en la información disponible.
- Dependencia de plataforma: requiere Apple Silicon, macOS 26+ y Python 3.11+. No hay ruta oficial a CUDA o ROCm en este checkpoint.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el 2026-09-19. No hay comunidad que haya reportado problemas de producción.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar `LICENSE`, `NOTICE`, `mlx_config.json` y `manifest.json` del repositorio para la atribución a Convai Innovations y contribuidores.
- El repositorio no incluye implementación de entrenamiento ni datos del dataset original; auditar el modelo completo requiere acudir al checkpoint y al código upstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aac6fef/laya-typed-decisions-mlx
- Checkpoint de origen: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Runtime MLX del port: https://github.com/mizorewww/laya-mlx
- Informe de rendimiento y muestras de tiempos: https://github.com/mizorewww/laya-mlx/blob/main/BENCHMARKS.md
- Codigo upstream de Laya: https://github.com/NandhaKishorM/laya
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados devueltos no guardan relacion con el modelo.
