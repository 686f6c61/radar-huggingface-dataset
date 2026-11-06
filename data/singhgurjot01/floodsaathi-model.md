# SinghGurjot01/floodsaathi-model

## Resumen

FloodSaathi es un modelo de lenguaje pequeno (SLM) especializado en seguridad y alerta temprana de inundaciones, desarrollado por SinghGurjot01 mediante fine-tuning de Qwen/Qwen2.5-0.5B-Instruct con adaptadores LoRA. Esta disenado para funcionar en modo offline-first en dispositivos moviles, equipos de borde de baja potencia o portatiles sin conexion, con el objetivo de ofrecer protocolos de seguridad concisos y verificados en escenarios de emergencia por inundaciones. Su piloto se centra en la India, concretamente en el estado de Punjab.

El modelo resuelve un problema concreto: la necesidad de asistencia fiable en materia de seguridad durante emergencias cuando la conectividad es limitada o inexistente. Cubre tematicas como purificacion de agua potable, riesgos electricos, cruces de carreteras inundadas, primeros auxilios ante mordeduras de serpiente, preparacion para evacuaciones y seguridad del ganado, en ingles, hindi y punjabi.

Con solo 494M parametros base mas 18,4M de parametros entrenables en adaptadores LoRA (aproximadamente 35 MB en safetensors), FloodSaathi se posiciona como una herramienta ligera y desplegable en entornos con recursos muy limitados. Su relevancia radica en la combinacion de un modelo base consolidado (Qwen2.5) con un dominio de aplicacion critico y un enfoque de despliegue offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptadores LoRA (rango 16, alpha 32) |
| Parametros totales | 494M base + 18,4M parametros entrenables (adaptadores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), hindi (hi), punjabi (pa) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA, ~35 MB) |

## Arquitectura y entrenamiento

FloodSaathi se construye sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494M parametros. Sobre esta base se aplican adaptadores LoRA con rango 16 y alpha 32, lo que anade 18,4M parametros entrenables. El resultado se distribuye como un conjunto de pesos safetensors de aproximadamente 35 MB, lo que facilita su transporte y despliegue en entornos con ancho de banda limitado.

El entrenamiento se orienta a un dominio especifico: protocolos de seguridad ante inundaciones fundamentados en fuentes verificadas como NDMA (National Disaster Management Authority), Punjab SDMA y CWC (Central Water Commission). La model card declara invariantes de seguridad explicitas: citacion de lineas de emergencia (112, 1078, 1070, 1077) con "cero alucinacion", prohibicion de garantias falsas de seguridad y provision de orientacion empirica honesta. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional orientada a protocolos de seguridad ante inundaciones.
- Respuesta en tres idiomas: ingles, hindi y punjabi.
- Cobertura de dominios especificos: purificacion de agua potable, riesgos de cables electricos, cruces de carreteras inundadas, primeros auxilios ante mordeduras de serpiente, preparacion de evacuaciones y seguridad del ganado.
- Citacion de lineas de emergencia verificadas (112, 1078, 1070, 1077) segun la model card.
- Operacion offline en dispositivos moviles, equipos de borde de baja potencia y portatiles sin conexion.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- **Asistencia en emergencias por inundaciones sin conectividad**: el modelo puede desplegarse en un movil o dispositivo de borde para responder consultas sobre que hacer durante una inundacion, sin depender de red, gracias a su tamano reducido (~35 MB de adaptadores).
- **Purificacion de agua potable en campo**: un operador de ayuda humanitaria puede consultar al modelo los protocolos verificados de potabilizacion de agua en hindi o punjabi, adecuados para comunidades locales.
- **Prevencion de riesgos electricos**: durante una inundacion, el modelo puede orientar sobre el peligro de cables electricos sumergidos o caidos, ofreciendo pautas de seguridad concretas.
- **Primeros auxilios ante mordeduras de serpiente**: en zonas rurales de Punjab afectadas por inundaciones, el modelo puede proporcionar instrucciones iniciales de primeros auxilios mientras se espera asistencia medica.
- **Preparacion de evacuaciones**: el modelo puede guiar a familias sobre que llevar, como asegurar el ganado y que rutas evitar, con respuestas concisas adaptadas a contextos de baja alfabetizacion tecnica.
- **Seguridad del ganado**: los ganaderos pueden consultar protocolos para proteger al ganado durante crecidas, un aspecto critico en economias rurales dependientes de la agricultura y la ganaderia.
- **Formacion comunitaria**: organizaciones locales pueden usar el modelo offline para capacitar a voluntarios en protocolos de respuesta ante inundaciones en los tres idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 494M parametros base y adaptadores de 18,4M, el modelo es apto para ejecucion en CPU y GPU de gama baja. En cuantizacion de 4 bits, el peso del modelo base rondaria los 250-300 MB, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no se especifican; el modelo esta disenado para moviles, dispositivos de borde de baja potencia y portatiles offline, por lo que no requiere GPUs de datacenter.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna, aunque no se detallan modelos concretos.
- Opciones de despliegue: no se especifican en la informacion disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| FloodSaathi | 494M + 18,4M LoRA | No disponible | en, hi, pa | Apache 2.0 | Seguridad ante inundaciones, offline-first |
| Qwen2.5-0.5B-Instruct | 494M | No disponible en la informacion | Multilingue | Apache 2.0 | Proposito general, conversacional |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en la informacion | Multilingue | Apache 2.0 | Proposito general, mayor capacidad |

La comparativa se limita al modelo base y su variante superior, ya que no se dispone de informacion sobre otros modelos especializados en respuesta a desastres con caracteristicas equiparables.

## Limitaciones y advertencias

- El modelo esta especializado en un dominio muy concreto (seguridad ante inundaciones en India, piloto en Punjab); su utilidad fuera de ese ambito es limitada.
- La model card afirma "cero alucinacion" en la citacion de lineas de emergencia, pero no se aportan benchmarks ni evaluaciones independientes que respalden esta afirmacion; debe verificarse en produccion.
- No se dispone de informacion sobre sesgos conocidos, evaluaciones de robustez ni pruebas de seguridad independientes.
- El contexto maximo no esta documentado, lo que limita la planificacion de conversaciones multi-turno largas.
- Solo cubre tres idiomas (en, hi, pa); no se garantiza calidad en otros.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo no debe sustituir la evaluacion de profesionales de emergencias ni los servicios oficiales.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se detallan los datos de entrenamiento ni el proceso de alineacion, lo que dificulta evaluar la fiabilidad de las respuestas en escenarios criticos.

## Enlaces

- Hugging Face: https://huggingface.co/SinghGurjot01/floodsaathi-model
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
