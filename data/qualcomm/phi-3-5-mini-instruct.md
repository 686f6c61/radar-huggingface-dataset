# qualcomm/Phi-3.5-mini-instruct

## Resumen

Phi-3.5-mini-instruct es un modelo de lenguaje de 3.800 millones de parametros desarrollado originalmente por Microsoft, basado en datos sinteticos y contenido web publico filtrado, con enfasis en datos densos en razonamiento. Este repositorio concreto, publicado por Qualcomm, contiene los artefactos pre-exportados y optimizados para su despliegue en dispositivos con chipsets Snapdragon mediante el runtime GENIE y el SDK QAIRT. No se trata de una nueva version del modelo, sino de una distribucion empaquetada para inferencia en el borde (edge).

La relevancia de esta ficha radica en que ejemplifica el flujo de trabajo actual para llevar un LLM de 3,8B a un telefono o a un PC con Snapdragon: cuantizacion w4a16 con algunas capas en w8a16, compilacion con QNN y empaquetado en un binario de contexto que soporta longitudes de 512 a 4096 tokens. El modelo original soporta hasta 128K tokens de contexto, pero los artefactos publicados en este repositorio limitan el contexto de inferencia a 4096 tokens.

El modelo es relevante para desarrolladores que necesitan ejecutar generacion de texto y razonamiento en dispositivos sin conexion, con requisitos de latencia y consumo energetico estrictos. La licencia MIT del empaquetado y la disponibilidad de assets descargables para Snapdragon X Elite y X2 Elite lo convierten en una opcion practica para prototipos en hardware ARM de Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3), no disponible el detalle exacto de capas y dimensiones en la informacion proporcionada |
| Parametros totales | 3,8B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 128K tokens en el modelo original; los artefactos de este repositorio soportan 512, 1024, 2048, 3072 y 4096 tokens |
| Tipos de cuantizacion | w4a16 con algunas capas en w8a16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT (empaquetado); la licencia del modelo original se enlaza en el README |
| Formato de pesos | Assets pre-exportados para GENIE (QNN context binary), no safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Phi-3, entrenado por Microsoft sobre una mezcla de datos sinteticos y sitios web publicos filtrados, con foco en datos densos en razonamiento. Segun la model card, el modelo paso por un proceso de ajuste supervisado, optimizacion de politica proximal (PPO) y optimizacion de preferencias directas (DPO) para mejorar la adherencia a instrucciones y las medidas de seguridad. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

La contribucion de este repositorio de Qualcomm no esta en el entrenamiento sino en el despliegue: los pesos se cuantizan a w4a16 (con algunas capas en w8a16), se compilan con QAIRT 2.43 y se empaquetan como binarios de contexto QNN para el runtime GENIE. El prompt processor procesa secuencias de entrada de 128 tokens por iteracion, y el modelo se evalua con prompts cortos, por lo que las metricas de TTFT para contextos largos son aproximaciones basadas en escalado lineal.

## Capacidades

- Generacion de texto y razonamiento de uso general, con enfasis en tareas densas en razonamiento segun la model card del modelo original.
- Adherencia a instrucciones mediante ajuste supervisado, PPO y DPO.
- Soporte de contexto largo en el modelo original (hasta 128K tokens), aunque limitado a 4096 tokens en los artefactos publicados.
- Inferencia en dispositivo (on-device) sin conexion a la nube mediante el runtime GENIE.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada para este empaquetado.
- Capacidades de vision o audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Asistentes de texto sin conexion en telefonos y PCs con Snapdragon: el modelo se ejecuta con GENIE sobre el binario de contexto QNN, sin necesidad de red, adecuado para aplicaciones de productividad que requieren privacidad de datos.
- Generacion de texto en el borde para aplicaciones Android: el tag `android` y los assets para Snapdragon X Elite y X2 Elite permiten integrar el modelo en apps nativas con latencia controlada.
- Prototipado de funcionalidades de razonamiento en hardware ARM: los binarios pre-exportados y la libreria ai-hub-models permiten validar rapidamente casos de uso antes de invertir en infraestructura de servidor.
- Resumen y reescritura de textos cortos en dispositivos de gama alta: con contexto de hasta 4096 tokens y una tasa de respuesta de 34,25 tokens/s en Snapdragon X2 Elite, es viable para tareas interactivas.
- Educacion y demostraciones de IA en el dispositivo: util para talleres y pruebas de concepto donde no se dispone de GPU dedicada.
- Evaluacion comparativa de runtimes de inferencia en el borde: sirve como referencia para medir TTFT y throughput entre distintos chipsets Snapdragon.

## Benchmarks y rendimiento

Los datos disponibles corresponden a metricas de despliegue en hardware Qualcomm, no a benchmarks academicos (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la informacion disponible.

| Modelo | Runtime | Precision | Chipset | Contexto | Tokens/s | TTFT (s) |
|---|---|---|---|---|---|---|
| Phi-3.5-Mini-Instruct | QNN_CONTEXT_BINARY | w4a16 | Snapdragon X2 Elite | 4096 | 34,25 | 0,08362 - 2,67584 |
| Phi-3.5-Mini-Instruct | QNN_CONTEXT_BINARY | w4a16 | Snapdragon X Elite | 4096 | 10,2 | 0,10691 - 5,946656 |
| Phi-3.5-Mini-Instruct | QNN_CONTEXT_BINARY | w4a16 | Qualcomm Dragonwing IQ-X7181 | 4096 | 10,2 | 0,10691 - 5,946656 |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para inferencia en el dispositivo (CPU/NPU de Snapdragon), no para GPU dedicada.
- GPU recomendadas: no aplica para este empaquetado; los assets estan compilados para chipsets Snapdragon X2 Elite, X Elite y Dragonwing IQ-X7181.
- Cabe en GPU de consumo: no disponible para este empaquetado; el modelo original de 3,8B podria ejecutarse en GPUs de consumo con cuantizacion adecuada, pero no se proporcionan datos al respecto.
- Opciones de despliegue: runtime GENIE con QAIRT SDK minimo 2.43.1; la libreria ai-hub-models permite exportar con configuraciones personalizadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: 34,25 tokens/s y TTFT de 0,084 a 2,676 s en Snapdragon X2 Elite; 10,2 tokens/s y TTFT de 0,107 a 5,947 s en Snapdragon X Elite y Dragonwing IQ-X7181, con contexto de 4096 tokens.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoria (LLM de ~3-4B para el borde) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos en formato estandar (safetensors, GGUF); solo assets compilados para el runtime GENIE de Qualcomm, lo que limita su uso fuera de ese ecosistema.
- El contexto efectivo en los artefactos publicados es de 4096 tokens, muy inferior a los 128K tokens del modelo original.
- Las metricas de TTFT para contextos largos son aproximaciones basadas en escalado lineal, no mediciones directas.
- La model card del modelo original prohibe usos como acceso a servicios esenciales, administracion de justicia, reconocimiento biometrico, puntuacion social, aplicaciones policiales, control de fronteras, recomendadores de redes sociales, scraping de imagenes faciales y manipulacion subliminal.
- Riesgo de alucinacion inherente a los LLM de este tamano; no se proporcionan datos especificos de evaluacion de sesgos o toxicidad en la informacion disponible.
- Idiomas soportados no especificados; no se garantiza un rendimiento adecuado en castellano.
- La licencia MIT se aplica al empaquetado; para uso comercial debe revisarse la licencia del modelo original de Microsoft enlazada en el README.
- El modelo fue creado en febrero de 2025 y actualizado en noviembre de 2026; verificar la vigencia de los assets y del SDK QAIRT antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qualcomm/Phi-3.5-mini-instruct
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Licencia del modelo original: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/blob/main/LICENSE
- Informe tecnico Phi-3 (arXiv): https://arxiv.org/abs/2404.14219
- Libreria Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/phi_3_5_mini_instruct
- Tutorial de despliegue LLM on-device: https://github.com/quic/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/phi_3_5_mini_instruct
- Workbench de Qualcomm AI Hub: https://workbench.aihub.qualcomm.com
- Comunidad Slack de AI Hub: https://aihub.qualcomm.com/community/slack
- Contacto de soporte: mailto:ai-hub-support@qti.qualcomm.com
