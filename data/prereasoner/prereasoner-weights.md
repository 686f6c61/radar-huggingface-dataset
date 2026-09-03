# prereasoner/prereasoner-weights

## Resumen

PreReasoner es un sistema interpretable de respuesta a preguntas sobre tablas y hojas de calculo. Este repositorio contiene el paquete de pesos de ejecucion (runtime weights) del sistema, no un modelo generativo de texto autonomo. El sistema combina componentes aprendidos que producen evidencia semantica con un planificador deterministico de AST tipado que se encarga de la construccion de SQL, los joins, la verificacion de calculos, el renderizado y la ejecucion.

El paquete se compone de un adaptador LoRA sobre el modelo base Qwen/Qwen2.5-0.5B, junto con varios componentes adicionales: un encoder de lectura semantica relacional, una cabeza de composicion de primitivas y una cabeza de evidencia de propiedades Schema.org. El sistema utiliza Schema.org 30.0 como sistema de coordenadas semanticas y se apoya en Wikidata y datasets de editores para las observaciones. Su relevancia radica en que cada respuesta es un calculo paso a paso ejecutado sobre los datos reales, trazable y nunca inventado, frente a los sistemas de caja negra.

El repositorio pesa 0,1 GB y esta publicado bajo licencia Apache-2.0. El modelo base Qwen2.5-0.5B se descarga por separado desde su publicador original. El paquete esta disenado para ser inmutable y verificado por hash SHA-256 mediante un manifiesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema hibrido: adaptador LoRA sobre Qwen/Qwen2.5-0.5B + encoder relacional + cabezas de evidencia (primitivas y propiedades Schema.org) + planificador deterministico AST |
| Parametros totales | Aproximadamente 0,5 mil millones (base Qwen2.5-0.5B) mas adaptadores LoRA y componentes auxiliares de tamano reducido |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-0.5B; el paquete no especifica un valor propio) |
| Tipos de cuantizacion | No disponible (el paquete incluye safetensors para el adaptador LoRA y archivos .pt/.npz para el resto) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (para el paquete de pesos; el modelo base y los datasets conservan sus propias licencias) |
| Formato de pesos | safetensors (adaptador LoRA), PyTorch state dict (.pt), NumPy (.npz) |

## Arquitectura y entrenamiento

PreReasoner no es un modelo unico sino un sistema compuesto. Los componentes aprendidos emiten puntuaciones y embeddings para propiedades de columnas, intencion estructural, evidencia de enrutamiento y operandos de calculo. Estas puntuaciones no pueden por si solas anadir una tabla, un join, un calculo, una ruta o una respuesta: un codigo deterministico aplica restricciones tipadas, anclaje explicito a fuentes, reglas de abstencion y comprobaciones de ejecucion. El planificador AST deterministico es el unico responsable de construir el SQL final.

El adaptador LoRA se entrena sobre Qwen/Qwen2.5-0.5B, un modelo transformer de 0,5 mil millones de parametros. Los datos de entrenamiento provienen de Wikidata y datasets de editores, mapeados al sistema de coordenadas semanticas de Schema.org 30.0. La model card advierte que el checkpoint actual del enrutador unificado no dispone de un registro completo y legible por maquina de su hash de corpus fuente, division, semilla aleatoria y reporte de datos retenidos, por lo que su entrenamiento historico no debe considerarse reproducible de forma independiente.

## Capacidades

- Respuesta a preguntas sobre tablas y hojas de calculo con planes inspeccionables.
- Generacion de SQL determinista a partir de evidencia semantica aprendida, con verificacion de calculos y ejecucion controlada.
- Anclaje semantico a Schema.org 30.0 para propiedades de columnas e intencion estructural.
- Reglas de abstencion para coordenadas no soportadas o mal calibradas: el sistema se abstiene en lugar de inventar.
- Evidencia de enrutamiento y composicion de primitivas para operaciones de calculo.
- No es un modelo de generacion de texto autonomo: no genera SQL ni respuestas de forma independiente.

## Casos de uso

- Analisis de hojas de calculo locales: el sistema responde preguntas sobre datos tabulares con un plan paso a paso ejecutado sobre los datos reales, adecuado para usuarios que necesitan trazabilidad completa del resultado.
- Investigacion sobre planificacion SQL determinista: permite estudiar como dimensiones semanticas aprendidas informan la construccion de consultas SQL tipadas sin depender de generacion autoregresiva.
- Verificacion de calculos en tablas: la cabeza de composicion de primitivas y la verificacion de ejecucion permiten validar operaciones aritmeticas sobre columnas con evidencia explicita.
- Enriquecimiento semantico de datos tabulares: el encoder relacional y la cabeza de propiedades Schema.org pueden clasificar propiedades de columnas en un sistema de coordenadas estandarizado.
- Auditoria de respuestas basadas en datos: al ser deterministico el planificador, cada respuesta puede auditarse paso a paso, lo que lo hace util en entornos donde la explicabilidad es un requisito.
- Prototipado de sistemas de QA sobre tablas: el paquete sirve como base para experimentos con componentes aprendidos de evidencia semantica combinados con logica determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia resultados de Spider en el repositorio fuente (https://github.com/ManiDoraisamy/prereasoner-data/blob/main/spider/results/RESULTS.md), pero no se incluyen cifras concretas en la documentacion proporcionada. El autor advierte explicitamente que no deben combinarse metricas de diferentes cabezas ni inferirse soporte para todas las clases representables de Schema.org.

## Requisitos de hardware

- El modelo base Qwen2.5-0.5B tiene 0,5 mil millones de parametros, por lo que la inferencia es viable en GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU con cuantizacion.
- El repositorio de pesos pesa 0,1 GB, lo que incluye el adaptador LoRA y los componentes auxiliares; el modelo base se descarga aparte.
- VRAM estimada: inferior a 2 GB para el modelo base en precision completa; con cuantizacion puede ejecutarse en entornos muy limitados.
- Opciones de despliegue: el sistema se instala mediante el script `engine.fetch_weights` del repositorio fuente, que verifica el manifiesto y los hashes SHA-256 antes de instalar. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (sistemas hibridos de QA sobre tablas con planificacion SQL determinista y evidencia semantica aprendida). Los sistemas convencionales de text-to-SQL como los basados en LLMs generativos no son directamente comparables, ya que PreReasoner no genera SQL de forma autoregresiva sino que lo construye mediante un planificador deterministico.

## Limitaciones y advertencias

- No es un modelo autonomo de generacion de SQL o respuestas: los componentes aprendidos solo emiten puntuaciones y embeddings; sin el codigo deterministico del sistema no producen resultados utilizables.
- El checkpoint del enrutador unificado carece de un registro completo de su corpus fuente, division, semilla aleatoria y datos retenidos; su entrenamiento historico no es reproducible de forma independiente.
- No debe utilizarse para clasificacion autoritativa de identidades o entidades.
- No es adecuado para decisiones de alto riesgo en ambitos medicos, legales, fiscales, financieros o de seguridad sin una revision especifica de la fuente.
- Las coordenadas no soportadas o mal calibradas provocan abstencion; no debe asumirse soporte para todas las clases de Schema.org.
- Los archivos del paquete solo deben usarse con la revision correspondiente del repositorio fuente; usarlos con una revision incompatible o no verificada puede producir resultados incorrectos.
- Los hechos mutables de las fuentes no deben memorizarse como respuestas; el sistema esta disenado para anclar la evidencia a observaciones, no para almacenar respuestas.
- No deben combinarse metricas de diferentes cabezas del sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prereasoner/prereasoner-weights
- Repositorio fuente (datos y codigo): https://github.com/ManiDoraisamy/prereasoner-data
- Sitio web del proyecto: https://prereasoner.com/
- Model card del repositorio fuente: https://github.com/ManiDoraisamy/prereasoner-data/blob/main/docs/MODEL_CARD.md
- Data card del repositorio fuente: https://github.com/ManiDoraisamy/prereasoner-data/blob/main/docs/DATA_CARD.md
- Resultados de Spider: https://github.com/ManiDoraisamy/prereasoner-data/blob/main/spider/results/RESULTS.md
- Licencias de terceros: https://github.com/ManiDoraisamy/prereasoner-data/blob/main/THIRD_PARTY.md
