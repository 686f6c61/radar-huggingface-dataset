# h2sunni/oncurai-gemma4-E2B-litertlm-v3

## Resumen

OnCuri Gemma 4 E2B es un ajuste fino (fine-tuning) mediante LoRA del modelo Google Gemma 4 E2B, desarrollado por Heesun Jung para la aplicación OnCuri. Se trata de un modelo especializado en la función de guía turística con IA que explica de forma contextual obras de arte, museos, monumentos históricos y enclaves culturales. El modelo está diseñado específicamente para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google, y se distribuye en formato `.litertlm`.

El modelo hereda la arquitectura y el tamaño del Gemma 4 E2B base (categoría "E2B", orientada a ejecución en dispositivos de borde), aunque la información proporcionada no detalla el número exacto de parámetros ni la longitud de contexto. Su relevancia radica en el despliegue local sin conexión para aplicaciones de guiado cultural, un caso de uso en el que la latencia, la privacidad y el funcionamiento offline son críticos.

El repositorio ocupa 5,2 GB y no registra descargas ni interacciones en el momento de la consulta. La licencia es la OnCuri Model License, que restringe el uso de los materiales específicos del proyecto más allá de la aplicación oficial autorizada, mientras que los componentes subyacentes de Gemma mantienen su licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Google Gemma 4 E2B); no se detalla la variante exacta |
| Parametros totales | no disponible (denominacion "E2B" del modelo base, sin cifra explicita) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de despliegue `.litertlm` optimizado para LiteRT-LM) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | OnCuri Model License (componentes Gemma subyacentes bajo Apache 2.0) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E2B, un modelo de la familia Gemma 4 orientado a inferencia en dispositivo. Sobre esa base se aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation), una técnica de adaptación eficiente en parámetros que modifica un subconjunto reducido de pesos para especializar el comportamiento del modelo sin reentrenar la totalidad de la red. El resultado se empaqueta en formato `.litertlm` para su ejecución con el runtime LiteRT-LM de Google, pensado para despliegue local en dispositivos de borde.

La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas propias más allá de la adaptación LoRA y el empaquetado para LiteRT-LM.

## Capacidades

- Generación de texto orientada a la explicación contextual de obras de arte, museos, monumentos y enclaves culturales.
- Funcionamiento on-device mediante LiteRT-LM, sin dependencia de conectividad de red.
- Soporte multilingüe limitado a coreano e inglés.
- Especialización en dominio turístico y cultural derivada del ajuste fino LoRA.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Guía turística en museos: el modelo puede ofrecer explicaciones contextuales de las obras expuestas dentro de la aplicación OnCuri, funcionando en el dispositivo del visitante sin conexión a internet.
- Interpretación de monumentos históricos: permite generar descripciones y contexto histórico de enclaves culturales al visitante en el momento de la visita, con baja latencia al ejecutarse localmente.
- Aplicaciones de turismo offline: adecuado para entornos con conectividad limitada (interiores de museos, zonas rurales o monumentos remotos) gracias a su despliegue on-device.
- Asistencia cultural multilingüe: cubre visitantes coreanohablantes y anglohablantes con respuestas en su idioma, según los idiomas soportados.
- Integración en aplicaciones móviles de patrimonio: el formato `.litertlm` y el runtime LiteRT-LM facilitan el empaquetado del modelo dentro de apps de guiado cultural.
- Privacidad de datos del usuario: al ejecutarse en el dispositivo, las consultas del visitante no requieren enviarse a un servidor externo.
- Prototipado de asistentes especializados de dominio: sirve como referencia de adaptación LoRA de un modelo Gemma 4 para una tarea vertical concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para inferencia on-device mediante LiteRT-LM, no para despliegue en GPU de servidor.
- GPU recomendadas: no disponible; el runtime objetivo es LiteRT-LM en dispositivos de borde.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LiteRT-LM (runtime objetivo declarado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Tamaño del repositorio: 5,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| OnCuri Gemma 4 E2B | no disponible (base Gemma 4 E2B) | no disponible | OnCuri Model License (Gemma: Apache 2.0) | `.litertlm` | Hugging Face |
| Google Gemma 4 E2B (base) | no disponible | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Alternativas on-device de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no permite establecer comparaciones cuantitativas con otros modelos de la misma categoría; los datos de rendimiento, contexto y parámetros del modelo base no están disponibles.

## Limitaciones y advertencias

- Restricción de licencia: los materiales específicos de OnCuri requieren permiso escrito previo para cualquier uso más allá de la aplicación oficial autorizada, incluida la redistribución, la integración en otros servicios y la explotación comercial.
- Los componentes subyacentes de Gemma quedan sujetos a su licencia original Apache 2.0, lo que introduce una doble capa de condiciones de uso.
- Idiomas limitados a coreano e inglés; no se documenta soporte de español ni de otras lenguas.
- Especialización de dominio estrecha (guía turística y cultural), lo que puede degradar su comportamiento en tareas generales fuera de ese ámbito.
- Riesgo de alucinación en datos históricos y culturales: al ser un modelo ajustado para generar explicaciones, puede producir información factual incorrecta sobre obras o monumentos.
- No se documentan sesgos conocidos, pero la ausencia de datos sobre el dataset de ajuste fino impide evaluar su cobertura y equilibrio.
- Sin datos de benchmarks ni de rendimiento en producción, lo que dificulta validar su calidad antes del despliegue.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria conocida.
- Formato `.litertlm` específico de LiteRT-LM: la portabilidad a otros runtimes no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/h2sunni/oncurai-gemma4-E2B-litertlm-v3
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Licencia (referencia en el repo): LICENSE
- Avisos de terceros (referencia en el repo): THIRD_PARTY_NOTICES
