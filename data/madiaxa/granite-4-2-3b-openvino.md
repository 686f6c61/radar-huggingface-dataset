# madiaxa/granite-4.2-3b-openvino

## Resumen

El modelo `madiaxa/granite-4.2-3b-openvino` es una conversión a OpenVINO del modelo `ibm-granite/granite-4.2-3b`, desarrollado por el usuario `madiaxa` mediante la herramienta `optimum-intel` y el espacio de exportación de HuggingFace. Se trata de una implementación optimizada para entornos de inferencia basados en Intel, manteniendo la arquitectura densa del modelo original de IBM Granite.

El modelo base, Granite 4.2 3B, pertenece a la familia Granite 4.2 de IBM, que incluye versiones de 3B, 8B y 30B. Según la documentación de IBM, estos modelos están diseñados para razonamiento eficiente y generación de texto multilingüe, con capacidades de pensamiento (chain-of-thought), modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta versión en OpenVINO conserva dichas capacidades y las hace accesibles a través de la librería `transformers` con `OVModelForCausalLM`.

La conversión es relevante para equipos que necesitan desplegar un modelo de 3B con soporte de razonamiento y tool calling en infraestructura Intel, ya sea en CPU o GPU, aprovechando las optimizaciones de OpenVINO. La información sobre la longitud de contexto exacta y los datos de entrenamiento no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 3B (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (convertido desde safetensors) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer denso de razonamiento, según la documentación oficial de IBM. Está diseñado para generar texto multilingüe, soportar codigo y asistir en flujos de trabajo de agentes de IA. Incluye capacidades de pensamiento (chain-of-thought), modos de pensamiento flexibles y tool calling aumentado con razonamiento, lo que lo hace apto para tareas que requieren razonamiento multi-paso.

Los datos de entrenamiento, el numero de tokens, la composicion del dataset y si se aplico RLHF o DPO no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable en esta version es la conversion a OpenVINO mediante `optimum-intel`, lo que permite cargar el modelo con `OVModelForCausalLM` y aprovechar las optimizaciones de inferencia de Intel.

## Capacidades

- Generacion de texto en 11 idiomas: ingles, aleman, español, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Razonamiento con cadena de pensamiento (thinking mode), segun la familia Granite 4.2.
- Tool calling / function calling aumentado con razonamiento.
- Soporte para agentes y razonamiento multi-paso.
- Compatible con inferencia a traves de `transformers` y `optimum-intel`.
- No se especifican capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Despliegue de asistentes conversacionales multilingues en entornos corporativos: gracias a la conversion a OpenVINO, el modelo se puede ejecutar eficientemente en CPUs Intel sin necesidad de GPU dedicada, lo que reduce costes de infraestructura.
- Automatizacion de agentes con tool calling: el modelo soporta razonamiento aumentado para llamar funciones, lo que permite integrarlo en flujos de trabajo de agentes que necesitan ejecutar acciones externas o consultar APIs.
- Generacion de codigo y asistencia en programacion: la familia Granite 4.2 esta orientada a tareas de codigo, por lo que este modelo puede integrarse en pipelines de desarrollo, IDEs o herramientas de revision automatica.
- Analisis de documentos multilingue: con soporte para 11 idiomas, puede procesar y resumir textos en español, ingles, frances, aleman, chino, entre otros, en aplicaciones de gestion documental.
- Razonamiento en tareas de analisis y decision: el modo thinking permite generar cadenas de razonamiento antes de responder, lo que resulta util en sistemas de soporte a la decision o analisis de datos textuales.
- Integracion en sistemas de produccion con OpenVINO: mediante `OVModelForCausalLM` se puede cargar el modelo en aplicaciones basadas en `transformers` y desplegar en infraestructura Intel con soporte de endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 3.7 GB, lo que sugiere que los pesos en FP32/FP16 ocupan aproximadamente 3.7 GB.
- VRAM estimada para inferencia: no disponible, depende de la cuantizacion utilizada.
- GPU recomendadas: no disponible.
- Puede ejecutarse en CPU con OpenVINO, pero no se especifican requisitos minimos de hardware.
- Opciones de despliegue: `optimum-intel` con `OVModelForCausalLM`, compatible con `transformers`. Tambien se indica compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Granite 4.2 3B (base) | 3B | safetensors | no disponible | no disponible | Apache 2.0 |
| Granite 4.2 3B (OpenVINO) | 3B | OpenVINO IR | no disponible | no disponible | Apache 2.0 |
| Granite 4.2 8B | 8B | safetensors | no disponible | no disponible | Apache 2.0 |
| Granite 4.2 30B | 30B | safetensors | no disponible | no disponible | Apache 2.0 |

Nota: la comparativa se basa en la informacion disponible sobre la familia Granite 4.2. Los datos de contexto y rendimiento no estan publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones especificas de la version convertida a OpenVINO, por lo que el rendimiento y la fidelidad respecto al modelo original en PyTorch no estan verificados.
- La conversion a OpenVINO puede introducir diferencias de comportamiento en la generacion, especialmente en tareas de razonamiento o tool calling, debido a diferencias en el runtime.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado especificamente en esta version.
- No se proporcionan datos sobre sesgos conocidos ni medidas de mitigacion.
- La longitud de contexto no esta especificada, por lo que se desconoce el limite real de ventana de atencion.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar las condiciones de la licencia original del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/madiaxa/granite-4.2-3b-openvino
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Coleccion Granite 4.2 de IBM: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio optimum-intel: https://github.com/huggingface/optimum-intel
- Espacio de exportacion OpenVINO: https://huggingface.co/spaces/echarlaix/openvino-export
