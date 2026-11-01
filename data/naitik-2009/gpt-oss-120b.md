# naitik-2009/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, disenado para tareas de razonamiento, uso agentico y aplicaciones generales de alta exigencia. Se trata de un transformer con arquitectura Mixture of Experts (MoE) de 117.000 millones de parametros totales, de los cuales solo 5.100 millones estan activos por token, lo que permite ejecutarlo en una unica GPU de 80 GB como una NVIDIA H100 o una AMD MI300X. El repositorio analizado (`naitik-2009/gpt-oss-120b`) es un espejo comunitario del modelo original de OpenAI, con pesos en formato safetensors y cuantizacion MXFP4.

El modelo destaca por su licencia Apache 2.0, que permite uso comercial sin restricciones de copyleft, y por su formato de respuesta propietario denominado *harmony*, que estructura el razonamiento interno, las llamadas a herramientas y las salidas finales. Incluye un modo de razonamiento configurable (bajo, medio, alto) y expone la cadena de pensamiento completa, lo que facilita la depuracion y la auditoria de las respuestas.

Es relevante en el contexto actual porque ofrece capacidades cercanas a modelos propietarios de gran escala en un paquete que cabe en hardware de un solo nodo, con pesos abiertos y fine-tuning permitido. Esto lo convierte en una opcion atractiva para despliegues en produccion con requisitos de privacidad, personalizacion o control de costes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 116.829.156.672 (~117B) |
| Parametros activos | 5.100 millones (5.1B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 (cuantizacion post-entrenamiento de los pesos MoE); tag 8-bit en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura de transformer con capas Mixture of Experts, en la que cada token activa unicamente una fraccion de los parametros totales (5.1B de 117B). Esta aproximacion reduce drasticamente el coste computacional por token en inferencia y permite que el modelo quepa en una sola GPU de 80 GB. Los pesos de las capas MoE fueron cuantizados a MXFP4 durante la fase de post-entrenamiento, y todas las evaluaciones publicadas por OpenAI se realizaron con esa misma cuantizacion, lo que garantiza coherencia entre los numeros reportados y el comportamiento real del modelo desplegado.

El modelo fue entrenado sobre el formato de respuesta *harmony*, un esquema estructurado que separa el razonamiento interno (cadena de pensamiento), las llamadas a herramientas y la respuesta final al usuario. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles especificos de las fases de RLHF o DPO aplicadas. El modelo es completamente fine-tuneable, lo que permite adaptarlo a dominios concretos mediante ajuste de parametros.

## Capacidades

- Generacion de texto general y conversacional de alta calidad.
- Razonamiento complejo con modo de esfuerzo configurable (bajo, medio, alto) para ajustar latencia y profundidad.
- Cadena de pensamiento completa y accesible, pensada para depuracion y auditoria (no para mostrarse al usuario final).
- Capacidades agenticas nativas: function calling, navegacion web y ejecucion de codigo Python.
- Soporte de salidas estructuradas (Structured Outputs).
- Integracion con el formato harmony para gestionar roles, herramientas y razonamiento.
- Capacidades multilingues: no especificadas en la informacion disponible.
- No se mencionan capacidades de vision ni audio en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento configurable, ajustando el esfuerzo segun la complejidad de cada consulta para equilibrar latencia y calidad.
- Generacion de codigo en produccion: gracias a su soporte nativo de function calling y ejecucion de Python, puede integrarse en pipelines de CI/CD para generar, validar y probar fragmentos de codigo de forma automatizada.
- Agentes autonomos multi-paso: la combinacion de razonamiento explicito, navegacion web y llamadas a herramientas permite construir agentes que resuelven tareas complejas descomponiendolas en subtareas.
- Asistentes de investigacion: la cadena de pensamiento completa facilita la verificacion de conclusiones y la trazabilidad del razonamiento en tareas de sintesis y analisis documental.
- Despliegue en entornos con requisitos de privacidad: al caber en una unica GPU H100 o MI300X y tener licencia Apache 2.0, puede ejecutarse on-premise sin enviar datos a servicios externos.
- Fine-tuning para dominios especializados: la licencia permisiva y la disponibilidad de pesos completos permiten adaptar el modelo a sectores como legal, sanitario o financiero con datos propios.
- Automatizacion de extraccion de datos estructurados: mediante Structured Outputs puede convertir texto libre en JSON u otros formatos validables, util en pipelines ETL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 80 GB para el modelo completo en MXFP4, segun la model card.
- GPU recomendadas: NVIDIA H100 (80 GB) o AMD MI300X para produccion; el modelo esta disenado para caber en una sola GPU de 80 GB.
- GPU de consumo: no se indica compatibilidad directa con GPUs consumer en la informacion proporcionada; el modelo de 120B no cabe en GPUs de 24 GB sin cuantizaciones adicionales no documentadas.
- Opciones de despliegue: Transformers, vLLM (version 0.10.1+gptoss o superior), Ollama (`gpt-oss:120b`), LM Studio, PyTorch/Triton con implementaciones de referencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b | ~117B | 5.1B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| gpt-oss-20b | ~21B | 3.6B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo hermano gpt-oss-20b, orientado a menor latencia y despliegue local (cabe en 16 GB de memoria). No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato harmony; usarlo con otros formatos de prompt puede degradar el rendimiento.
- La cadena de pensamiento completa no debe mostrarse al usuario final, segun indica la model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas especificas en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no especificados, lo que limita la evaluacion de su cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide valorar su idoneidad para tareas de contexto largo.
- Aunque la licencia Apache 2.0 permite uso comercial, el repositorio analizado es un espejo comunitario (`naitik-2009/gpt-oss-120b`) con solo 156 descargas; para produccion se recomienda usar el repositorio oficial `openai/gpt-oss-120b`.
- El tag "8-bit" del repo y la cuantizacion MXFP4 deben verificarse contra los pesos oficiales antes de desplegar en produccion.

## Enlaces

- Repositorio analizado: https://huggingface.co/naitik-2009/gpt-oss-120b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-120b
- Modelo hermano: https://huggingface.co/openai/gpt-oss-20b
- Sitio del proyecto: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Paper / model card: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Coleccion en HF: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
