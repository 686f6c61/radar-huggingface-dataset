# AZAS123/soc-qwen3-4b-fr-lora

## Resumen

SOC-Qwen-FR es un adaptador LoRA en francés para el triaje de alertas de un centro de operaciones de seguridad (SOC). Se construye sobre el modelo base `unsloth/Qwen3-4B-Instruct-2507` y se entrena con QLoRA (r=16) mediante la librería Unsloth sobre 6002 ejemplos. El modelo recibe un evento de Windows (Sysmon, Security, PowerShell, entre otros) y devuelve un JSON estructurado con veredicto, técnica MITRE ATT&CK, táctica, severidad, explicación y recomendaciones. Lo desarrolla el usuario AZAS123 y se publica con licencia Apache 2.0.

La relevancia del modelo reside en su enfoque acotado: en lugar de un asistente generalista, se especializa en la clasificación de eventos de seguridad y en la generación de salida estructurada consumible por herramientas de automatización. Los datos de entrenamiento se construyen a partir de las reglas SigmaHQ (licencia DRL 1.1) y de MITRE ATT&CK, combinando eventos sintéticos generados desde la lógica de detección con eventos reales del conjunto `regression_data` de SigmaHQ.

El modelo es un adaptador PEFT de aproximadamente 0,1 GB, no un modelo completo, por lo que requiere cargar el modelo base Qwen3-4B-Instruct-2507 para su uso. La evaluación se realizó sobre 200 ejemplos de test con reglas Sigma nunca vistas durante el entrenamiento, y muestra mejoras sustanciales en validez del JSON y en la determinación del veredicto, aunque la identificación exacta de la técnica ATT&CK sigue siendo limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3-4B-Instruct-2507 |
| Parámetros totales | no disponible (adaptador LoRA con r=16; el modelo base es de 4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantización | QLoRA durante el entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 entrenado con QLoRA y la librería Unsloth sobre el modelo base `unsloth/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parámetros de la familia Qwen3. El adaptador se distribuye en formato PEFT/safetensors y debe combinarse con el modelo base en tiempo de inferencia. No se especifican en la información disponible detalles sobre la composición exacta del dataset más allá de su origen: reglas SigmaHQ (licencia DRL 1.1) y MITRE ATT&CK, con eventos sintéticos generados desde la lógica de detección y eventos reales del conjunto `regression_data` de SigmaHQ.

El entrenamiento se realizó sobre 6002 ejemplos y la evaluación sobre 200 ejemplos de test construidos con reglas Sigma que no se vieron durante el entrenamiento, lo que permite medir la generalización a detecciones no vistas. No se detalla en la información proporcionada si hubo fases de RLHF o DPO, ni el número total de tokens de entrenamiento. La innovación principal es la especialización en salida JSON estructurada para triaje SOC y el uso de reglas Sigma como fuente de supervisión.

## Capacidades

- Triaje de alertas SOC: recibe un evento de Windows (Sysmon, Security, PowerShell, entre otros) y devuelve un JSON con veredicto, técnica MITRE ATT&CK, táctica, severidad, explicación y recomendaciones.
- Generación de salida estructurada en JSON, con una tasa de validez del 96,5 % en el conjunto de test reportado por el autor.
- Clasificación de técnicas MITRE ATT&CK y su táctica asociada, con rendimiento limitado en la identificación exacta (ver benchmarks).
- Determinación de severidad y veredicto de la alerta.
- Generación de explicaciones y recomendaciones a partir de gabaritos (plantillas), según indica el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: únicamente francés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Triaje automatizado de alertas en un SOC: el modelo recibe el evento de Windows en bruto y devuelve un JSON con veredicto, técnica ATT&CK, táctica y severidad, lo que permite enrutar alertas a analistas o a colas de escalado según la severidad estimada.
- Enriquecimiento de alertas con MITRE ATT&CK: a partir de un evento, el modelo propone la técnica y táctica asociadas, que pueden incorporarse a la plataforma SIEM o SOAR para correlación y generación de informes.
- Generación de recomendaciones de respuesta: el campo de recomendaciones del JSON puede alimentar playbooks de respuesta o guiar al analista en los primeros pasos de contención.
- Filtrado y priorización de falsos positivos: el veredicto del modelo (100 % de acierto reportado en el conjunto de test) puede usarse como primera capa de descarte antes de la revisión humana.
- Asistencia a analistas junior en francés: dado que el modelo está especializado en francés, sirve como apoyo en equipos francófonos para interpretar eventos y explicar la lógica de detección asociada a una regla Sigma.
- Integración en pipelines de automatización con salida JSON: la alta tasa de JSON válido (96,5 %) permite consumir la salida directamente en scripts o sistemas downstream sin parseo tolerante a errores.
- Evaluación y pruebas de reglas Sigma: al haber sido entrenado sobre reglas SigmaHQ, puede emplearse para generar eventos sintéticos o comprobar la coherencia entre un evento y la técnica que una regla pretende detectar.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 200 ejemplos de test con reglas Sigma no vistas durante el entrenamiento:

| Modelo | JSON válido | Veredicto | Técnica exacta | Técnica (parent) | Táctica |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct (base) | 34,5 % | 83,0 % | 14,5 % | 17,1 % | 0,0 % |
| SOC-Qwen-FR (fine-tuneado) | 96,5 % | 100,0 % | 20,2 % | 28,0 % | 32,1 % |
| Base — eventos reales | 33,3 % | 86,2 % | 17,9 % | 21,1 % | 0,0 % |
| Fine-tuneado — eventos reales | 94,3 % | 100,0 % | 24,4 % | 33,3 % | 35,8 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 4B, los requisitos son los del modelo base más el adaptador (aproximadamente 0,1 GB adicionales en el repositorio).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantización elegida para el modelo base de 4B.
- Opciones de despliegue: no disponible en la información proporcionada (el adaptador es PEFT y requiere cargar el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOC-Qwen-FR (este modelo) | Adaptador LoRA sobre base de 4B | no disponible | Triaje SOC en francés con salida JSON | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la información proporcionada | Asistente generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en triaje SOC | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (triaje SOC en francés) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Uso exclusivamente defensivo, según indica el autor.
- Las explicaciones se generan a partir de gabaritos, por lo que pueden resultar genéricas o poco ajustadas al evento concreto.
- La identificación exacta de la técnica MITRE ATT&CK es baja (20,2 % en test sintético y 24,4 % en eventos reales), lo que limita su uso como clasificador autónomo de técnicas.
- La identificación de la táctica también es limitada (32,1 % y 35,8 % según el conjunto).
- El modelo puede equivocarse en técnicas sobre comportamientos poco frecuentes; debe usarse como herramienta de apoyo al analista, no como sistema de decisión autónomo.
- Solo está entrenado y declarado para francés; no se garantiza su comportamiento en otros idiomas.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos más allá de los errores de clasificación indicados.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento derivan de reglas SigmaHQ bajo licencia DRL 1.1, lo que conviene verificar antes de un uso comercial del modelo.
- Al ser un adaptador PEFT, requiere el modelo base `unsloth/Qwen3-4B-Instruct-2507`; no es desplegable de forma autónoma.
- No se especifican requisitos de hardware, latencia ni opciones de despliegue, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AZAS123/soc-qwen3-4b-fr-lora
- Repositorio de código: https://github.com/azddine123/soc-qwen-fr
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- SigmaHQ (reglas Sigma): no disponible en la información proporcionada
- MITRE ATT&CK: no disponible en la información proporcionada
