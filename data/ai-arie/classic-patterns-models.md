# ai-arie/classic-patterns-models

## Resumen

`ai-arie/classic-patterns-models` es un conjunto de modelos de series temporales especializados en la deteccion de patrones graficos clasicos en datos financieros. Se construye mediante fine-tuning de `autogluon/chronos-2-small`, un modelo base de pronostico de series temporales desarrollado por AutoGluon, y se distribuye en formato ONNX junto con componentes basados en LightGBM. El autor es el usuario `ai-arie` y el repositorio tiene un tamano de 0,1 GB.

El modelo aborda un problema concreto: identificar formaciones tecnicas clasicas (chart patterns) en series de precios financieros de forma automatizada. En lugar de entrenar desde cero, aprovecha el conocimiento temporal aprendido por Chronos-2-small y lo adapta a la tarea de clasificacion de patrones, lo que reduce el coste de entrenamiento y el volumen de datos necesario.

Es relevante para equipos de analisis cuantitativo y trading algoritmico que necesitan un componente ligero y desplegable en produccion (ONNX) para senalizar patrones tecnicos. No obstante, la informacion publica disponible es muy escasa: el repositorio no tiene descargas ni likes, no declara pipeline ni idiomas, y el acceso esta restringido (gated), por lo que muchos detalles tecnicos no pueden confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de un modelo de series temporales (base: `autogluon/chronos-2-small`) con componentes LightGBM; exportado a ONNX |
| Parametros totales | no disponible (el repo pesa 0,1 GB, pero no se desglosa el numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de entrada de Chronos-2-small, no especificada) |
| Tipos de cuantizacion | no disponible (formato ONNX; posibles optimizaciones ONNX Runtime no documentadas) |
| Idiomas soportados | no disponible (modelo numerico sobre series temporales, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (junto con artefactos LightGBM) |

## Arquitectura y entrenamiento

El modelo parte de `autogluon/chronos-2-small`, un modelo de pronostico de series temporales de la familia Chronos desarrollada por AutoGluon. Sobre esa base se aplica un fine-tuning orientado a la clasificacion o deteccion de patrones graficos clasicos en series financieras. El repositorio incluye tambien componentes basados en LightGBM, lo que sugiere un pipeline hibrido: representaciones temporales del modelo neuronal combinadas con un clasificador de arboles potenciados para la tarea final de deteccion de patrones.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset financiero, la ventana temporal utilizada ni si se aplicaron tecnicas de regularizacion o validacion temporal especificas. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), algo esperable en un modelo de este tipo. La exportacion a ONNX indica que el objetivo es el despliegue en inferencia optimizada, probablemente en entornos de baja latencia.

## Capacidades

- Deteccion y clasificacion de patrones graficos clasicos en series temporales financieras (formaciones tecnicas de precio).
- Modelado de dependencias temporales gracias a la base Chronos-2-small.
- Clasificacion tabular/estructurada mediante componentes LightGBM.
- Inferencia optimizada mediante ONNX (compatible con ONNX Runtime).
- Procesamiento de series numericas, no de texto: no es un modelo linguistico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (modelo sobre datos numericos).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Senalizacion de patrones tecnicos en trading algoritmico: el modelo puede integrarse en un pipeline que recibe ventanas de precios (OHLCV) y emite la presencia de formaciones clasicas como soportes, resistencias o figuras de continuacion, alimentando reglas de ejecucion.
- Analisis cuantitativo retrospectivo (backtesting): al estar exportado a ONNX, permite procesar grandes volumenes historicos de series con inferencia rapida y reproducible para validar estrategias basadas en patrones.
- Filtro previo en sistemas de alertas: usar el modelo como primera etapa que descarta series sin patrones relevantes, reduciendo el coste computacional de etapas posteriores mas pesadas.
- Investigacion academica sobre deteccion de patrones: sirve como baseline afinado sobre Chronos-2-small para comparar enfoques de clasificacion de formaciones tecnicas.
- Integracion en plataformas de analisis financiero: el formato ONNX y el tamano reducido (0,1 GB) facilitan el despliegue en servicios backend o incluso en entornos con recursos limitados.
- Prototipado rapido de estrategias: al ser un modelo ligero y con licencia Apache 2.0, permite iterar sobre hipotesis de trading sin depender de infraestructura pesada.
- Analisis de multiples activos en paralelo: el bajo coste de inferencia ONNX permite aplicar el modelo a carteras amplias de instrumentos financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; dado el tamano del repositorio (0,1 GB) y el uso de ONNX, es probable que quepa en GPUs consumer e incluso en CPU, pero no se confirma.
- GPU recomendadas: no disponible; por el perfil del modelo, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente en la mayoria de escenarios, aunque no esta documentado.
- Compatibilidad con GPU consumer: probablemente si, dado el reducido tamano, pero no confirmado.
- Opciones de despliegue: ONNX Runtime (formato principal); posible integracion con servicios de inferencia que soporten ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| `ai-arie/classic-patterns-models` | Fine-tuning de series temporales + LightGBM (ONNX) | no disponible | no disponible | Apache 2.0 | Restringido (gated) |
| `autogluon/chronos-2-small` | Modelo base de pronostico de series temporales | no disponible | no disponible | no disponible en esta ficha | Publico (base) |
| Otros modelos de deteccion de patrones financieros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Documentacion muy escasa: no se publican parametros, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad objetivamente.
- Riesgo de sobreajuste a los patrones y activos del dataset de entrenamiento; sin informacion sobre la composicion de datos no puede descartarse.
- Sesgo potencial hacia los mercados o periodos historicos incluidos en el entrenamiento, con posible degradacion en regimenes de mercado no vistos.
- Deteccion de patrones financieros no implica capacidad predictiva: no debe interpretarse como una senal de inversion fiable sin validacion independiente.
- No es un modelo linguistico: no soporta generacion de texto, tool calling ni razonamiento conversacional.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso gated y de la licencia del modelo base (`autogluon/chronos-2-small`).
- Sin descargas ni likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- No se documentan limitaciones de contexto o idioma porque el modelo opera sobre datos numericos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ai-arie/classic-patterns-models
- Modelo base Chronos-2-small: https://huggingface.co/autogluon/chronos-2-small
- AutoGluon (organizacion): https://huggingface.co/autogluon
- Documentacion de ONNX Runtime: https://onnxruntime.ai/
- LightGBM: https://lightgbm.readthedocs.io/
