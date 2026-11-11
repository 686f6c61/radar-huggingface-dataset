# HrishiBuilds/UTLT-Qwen3-0.6B-ONNX

## Resumen

UTLT-Qwen3-0.6B-ONNX es un ajuste fino (fine-tune) del modelo Qwen3-0.6B de Alibaba Qwen, exportado a formato ONNX en cuantizacion de 4 bits y orientado a su ejecucion en el navegador mediante transformers.js. Lo desarrolla el usuario HrishiBuilds como parte del proyecto UTLT.ai, un asistente opcional para telefono centrado en el seguimiento del consumo de agua domestico. El modelo parte de la arquitectura Qwen3 de 0,6 mil millones de parametros y se especializa mediante un adaptador LoRA de rango 8 en conversaciones sobre registros de agua de siete dias.

El problema que aborda es acotado: interpretar y comentar registros simulados de consumo hidrico por hogar, proponer objetivos diarios y ofrecer recomendaciones de ahorro poco disruptivas. No es un modelo de proposito general ni un asistente de agua listo para produccion; es una pieza de demostracion tecnica dentro de un proyecto mayor. Su relevancia actual reside en el formato: un export ONNX 4-bit pensado para inferencia local en WebGPU, lo que lo convierte en un ejemplo de como llevar modelos pequenos a dispositivos sin backend.

La informacion publica es limitada. No se declaran idiomas soportados, no hay benchmarks estandar y el propio autor advierte que las metricas reportadas proceden de datos sinteticos y no miden el rendimiento sobre datos reales. El repositorio ocupa 0,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a ONNX |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (export ONNX cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compatible con transformers.js) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre el se aplico un adaptador LoRA de rango 8 entrenado con 200 registros simulados de consumo de agua de siete dias por hogar. Los datos se dividieron por hogar en 160 viviendas de entrenamiento, 20 de validacion y 20 de prueba, generando 800, 100 y 100 ejemplos de chat respectivamente. Los ejemplos cubren promedios de siete dias, objetivos diarios, descripciones cautelosas de eventos de caudal inciertos y consejos de ahorro de bajo impacto.

La perdida de prueba sobre el conjunto sintetico retenido fue de 0,135 (perplejidad 1,144), una cifra que el autor advierte explicitamente que no mide el rendimiento sobre datos reales de agua. El resultado del entrenamiento se exporto a ONNX en 4 bits para su uso con transformers.js. El autor senala que el export ONNX mostro diferencias de precision respecto a la referencia en PyTorch con una tolerancia estricta de 1e-5; la inferencia cuantizada local funciono, pero el rendimiento y la precision en WebGPU sobre telefono quedan pendientes de prueba. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional sobre registros de consumo de agua de siete dias.
- Calculo y comentario de promedios de consumo, aunque el autor advierte errores aritmeticos y recomienda delegar los calculos al codigo de la aplicacion.
- Comparacion con objetivos diarios de agua, con la misma advertencia sobre calculos.
- Descripcion cautelosa de eventos de caudal inciertos, sin atribuir actividades no verificadas.
- Recomendaciones de ahorro de agua de bajo impacto.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente domestico de seguimiento hidrico: el modelo puede conversar sobre los registros de siete dias de un hogar y resumir tendencias, siempre que los litros y promedios se calculen en el codigo de la aplicacion y el modelo solo redacte la respuesta.
- Comparacion con objetivos diarios: dado un objetivo y un consumo ya calculado por la app, el modelo genera un mensaje explicativo para el usuario sobre si se cumple o no la meta.
- Educacion sobre ahorro de agua: produce recomendaciones de bajo impacto adaptadas al contexto conversacional, utiles en una seccion de consejos dentro de la app.
- Interpretacion asistida de eventos de caudal: ayuda a redactar descripciones prudentes de picos de consumo sin afirmar que actividad los causo, pidiendo confirmacion al usuario.
- Demostracion de inferencia local en navegador: sirve como ejemplo tecnico de un modelo ONNX 4-bit ejecutado con transformers.js y WebGPU en un telefono, sin backend.
- Prototipado de asistentes de dominio acotado: su pipeline de fine-tune con LoRA y export ONNX es replicable para otros dominios de sensores domesticos.
- Pruebas de integracion en aplicaciones moviles: permite validar el flujo completo de un asistente conversacional embebido antes de invertir en modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de prueba (sintetica) | 0,135 | Sobre 100 ejemplos de chat de 20 hogares retenidos |
| Perplejidad de prueba (sintetica) | 1,144 | Derivada de la perdida anterior |
| MMLU, HumanEval, GSM8K u otros | no disponible | No se han publicado resultados de benchmarks en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,6 GB, coherente con un modelo de 0,6B en 4 bits.
- GPU recomendadas: no disponibles; el destino declarado es WebGPU en telefono, no GPU de servidor.
- Compatibilidad con GPU de consumo: previsiblemente si por tamano, pero no se documenta ninguna GPU concreta probada.
- Opciones de despliegue: transformers.js en navegador con WebGPU; el formato ONNX tambien permite otros runtimes ONNX, aunque no se detallan.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento en WebGPU sobre telefono aun requiere pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| UTLT-Qwen3-0.6B-ONNX | 0,6B | no disponible | ONNX 4-bit | Apache 2.0 | Fine-tune de dominio acotado, sin benchmarks publicos |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la informacion proporcionada | safetensors | Apache 2.0 | Modelo base de proposito general |
| Otros modelos de ~0,5B para navegador | no disponible | no disponible | ONNX/GGUF | variable | No se dispone de datos comparativos en la informacion proporcionada |

La unica comparacion con datos disponibles es con su modelo base, Qwen3-0.6B, del que hereda arquitectura y licencia. No se dispone de informacion sobre alternativas comparables en la misma categoria de asistente hidrico ni de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo cometio un error aritmetico en una pregunta independiente sobre promedios de siete dias; todos los litros, promedios y comparaciones con objetivos deben calcularse en el codigo de la aplicacion.
- Un unico sensor de caudal de toda la vivienda no puede identificar la actividad que provoca un evento de caudal; cualquier sugerencia de actividad debe tratarse como no verificada y pedir confirmacion al usuario.
- Las metricas de perdida y perplejidad proceden de datos sinteticos y no miden el rendimiento sobre datos reales de agua.
- El export ONNX mostro diferencias de precision respecto a la referencia en PyTorch con tolerancia de 1e-5; el rendimiento y la precision en WebGPU sobre telefono no se han probado.
- No se declaran idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Riesgo de alucinacion en calculos y en la interpretacion de eventos de caudal, dado el tamano reducido del modelo y la naturaleza sintetica del entrenamiento.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo esta disenado como componente opcional de una app concreta y no como servicio general.
- No apto para produccion sin validacion sobre datos reales y sin pruebas de precision en el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HrishiBuilds/UTLT-Qwen3-0.6B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Scripts de entrenamiento y adaptador: https://github.com/unleashedcubing/HridhAI-Project-UTLT.ai/tree/codex/esp32-water-bridge/training
