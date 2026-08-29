# MergekitCloud/mergekit-72

## Resumen

MergekitCloud/mergekit-72 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión de cuatro modelos base de la familia Llama 3.1 8B utilizando la herramienta mergekit y el método Model Stock (arxiv:2403.19522). El modelo resultante combina las capacidades de roleplay y conversación de los modelos originales, todos ellos orientados a interacción sin censura y generación de texto conversacional. Al ser un merge, no ha sido entrenado con datos adicionales, sino que sus pesos se han calculado como una combinación de los pesos de los modelos base, lo que permite obtener un modelo con características mixtas sin coste de entrenamiento.

Este modelo es relevante para desarrolladores que buscan una alternativa ligera (8B) para tareas de generación de texto conversacional, roleplay o asistentes con un tono menos restrictivo, aprovechando la infraestructura de Llama 3.1. Sin embargo, carece de documentación oficial sobre licencia, idiomas o benchmarks, por lo que su uso en producción requiere una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Llama 3.1 8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, presumiblemente 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge mediante el método Model Stock, implementado con mergekit. Model Stock (arxiv:2403.19522) es un algoritmo de fusión de modelos que calcula una combinación lineal de los pesos de varios modelos base, utilizando el modelo base como referencia. En este caso, el modelo base es vicgalle/Humanish-Roleplay-Llama-3.1-8B, y los modelos fusionados son Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 y Undi95/Llama3-Unholy-8B-OAS. La configuración YAML indica `normalize: false` e `int8_mask: true`, con dtype float16.

No se ha realizado ningún entrenamiento adicional; el modelo es una combinación directa de pesos. Esto implica que las capacidades y limitaciones de los modelos base se heredan, pero no se ha verificado la coherencia interna del modelo fusionado.

## Capacidades

- Generacion de texto conversacional y roleplay, dado que todos los modelos base están orientados a interacción sin censura y diálogo.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación, aunque Llama 3.1 8B base sí lo soporta, no se confirma en este merge).
- Soporte de agentes y multi-step reasoning: no disponible (no hay evidencia en la información proporcionada).
- Capacidades multilingues: no disponible (los modelos base son principalmente en inglés, pero no se especifica).
- Capacidades especiales: al ser un merge de modelos "uncensored", puede generar contenido explícito o sensible, lo que debe tenerse en cuenta.

## Casos de uso

Dado que no hay documentación específica, los siguientes casos son inferencias razonables basadas en los modelos base:

- Chatbots de roleplay: el modelo puede mantener conversaciones con personajes ficticios o escenarios de juego de rol, gracias a la combinación de modelos especializados en roleplay.
- Generacion de historias interactivas: puede usarse para crear narrativas ramificadas donde el usuario decide las acciones, aprovechando su capacidad de generar texto coherente en contextos largos.
- Asistentes conversacionales con tono desinhibido: para aplicaciones donde se requiere un lenguaje más natural y menos formal, como simulaciones de entrevistas o práctica de idiomas.
- Creacion de contenido creativo: puede generar diálogos, guiones o ideas para escritores, aunque sin garantía de calidad consistente.
- Prototipado rapido de agentes conversacionales: al ser un modelo de 8B, puede desplegarse en entornos con recursos limitados para pruebas de concepto.
- Experimentacion con tecnicas de fusion de modelos: sirve como ejemplo de aplicacion del metodo Model Stock para investigadores interesados en merges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en float16 (16 GB), se necesitan aproximadamente 16 GB de VRAM para cargar el modelo completo. Con cuantizacion a 4 bits (no confirmada), se reduciria a unos 4-5 GB.
- GPU recomendadas: para float16, una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantizacion, una GPU con 6-8 GB (RTX 3060, RTX 3070) podria ser suficiente.
- Compatibilidad con consumer GPU: si, con cuantizacion es posible en GPUs de gama media.
- Opciones de despliegue: al ser un modelo transformers estandar, es compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks. No se ha verificado su compatibilidad especifica, pero es probable.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. Como referencia, se puede comparar con el modelo base Llama 3.1 8B, que tiene 8B parametros, contexto de 128k y licencia de Meta (Llama 3.1 Community License). Sin embargo, este merge no tiene licencia declarada, por lo que su uso comercial es incierto. Otros merges similares en HuggingFace podrian existir, pero no se han encontrado datos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge de modelos "uncensored", puede generar contenido ofensivo, explicito o inapropiado. No se ha realizado ninguna alineacion de seguridad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o informacion falsa, especialmente en contextos largos.
- Limitaciones de contexto o idioma: no se ha confirmado la longitud de contexto efectiva ni los idiomas soportados. Se recomienda probar antes de usar en produccion.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si se permite uso comercial. Se debe contactar al autor o evitar su uso en entornos comerciales.
- Caveat para produccion: al ser un merge sin evaluacion, no se garantiza la coherencia ni la estabilidad del modelo. Es recomendable realizar pruebas exhaustivas antes de integrarlo en un sistema.

## Enlaces

- HuggingFace: https://huggingface.co/MergekitCloud/mergekit-72
- Paper de Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
