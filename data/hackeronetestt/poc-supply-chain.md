# hackeronetestt/poc-supply-chain

## Resumen

El modelo `hackeronetestt/poc-supply-chain` es un artefacto de demostración publicado en HuggingFace con el propósito explícito de ilustrar un ataque de envenenamiento de cadena de suministro en el ecosistema de modelos de IA. El propio README del autor indica que el modelo ha sido "backdoorado" y que el contenido malicioso fue subido después de una revisión que aprobó una versión segura. Se trata de un PoC (proof of concept) de seguridad, no de un modelo funcional para tareas de NLP.

El repositorio no contiene información técnica sobre arquitectura, parámetros, contexto o capacidades. No se han publicado pesos, datasets ni código. La única metadata disponible es la licencia MIT, la región "us" y la etiqueta `BACKDOORED_MODEL`. La fecha de creación (agosto de 2026) y la ausencia de descargas sugieren que es un ejemplo reciente y de baja difusión, probablemente usado en entornos de investigación o formación en seguridad ofensiva.

La relevancia de este modelo no reside en sus capacidades (que no existen documentadas), sino en lo que representa: un vector de ataque real en el ecosistema de IA, donde un actor malintencionado puede publicar un modelo aparentemente legítimo con pesos manipulados, datos envenenados o código malicioso. Su estudio es útil para entender las amenazas de la cadena de suministro de IA y las medidas de defensa necesarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura, el proceso de entrenamiento o los datos utilizados. El README no menciona tokens, datasets, métodos de alineación (RLHF, DPO) ni ninguna innovación técnica. El único dato relevante es que el modelo está marcado como `BACKDOORED_MODEL`, lo que indica que ha sido manipulado deliberadamente para incluir un comportamiento malicioso, aunque no se detalla en qué consiste dicho comportamiento (por ejemplo, si se trata de pesos alterados, un payload en el código de carga, o datos de entrenamiento envenenados).

Dado que es un PoC de seguridad, es probable que el autor haya creado una versión "segura" para la revisión y luego haya subido una versión modificada, simulando un ataque de la cadena de suministro. No se dispone de más detalles técnicos.

## Capacidades

- No se han documentado capacidades funcionales del modelo. No se sabe si es capaz de generar texto, razonar, escribir código o procesar imágenes.
- El modelo no presenta ningún pipeline declarado (el campo `pipeline` aparece como "no disponible").
- Su única función práctica es servir como demostración de un vector de ataque en la distribución de modelos.
- No hay evidencia de soporte para tool calling, agentes, multilingüismo o modos especiales de razonamiento.

## Casos de uso

- Investigación en seguridad ofensiva: el modelo puede utilizarse en entornos controlados para estudiar cómo se detectan y mitigan los backdoors en modelos de IA. Los equipos de seguridad pueden analizar el artefacto para identificar patrones de manipulación.
- Formación en concienciación sobre la cadena de suministro: sirve como ejemplo didáctico para desarrolladores y organizaciones que necesitan entender los riesgos de descargar modelos de fuentes no verificadas.
- Desarrollo de herramientas de escaneo y verificación: los investigadores pueden usar este PoC como caso de prueba para sistemas automáticos que detectan modelos maliciosos en repositorios públicos.
- Auditoría de dependencias de IA: las empresas que integran modelos de HuggingFace pueden emplear este artefacto para validar sus pipelines de control de integridad antes de desplegar modelos en producción.
- Simulación de incidentes de seguridad: los equipos de respuesta a incidentes pueden recrear escenarios de compromiso de un modelo para practicar protocolos de contención y remediación.
- Evaluación de políticas de publicación: los administradores de plataformas de modelos pueden estudiar este PoC para mejorar sus procesos de revisión y evitar que contenido malicioso se publique tras una aprobación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un PoC de seguridad sin capacidades documentadas, no tiene sentido evaluar su rendimiento en tareas de NLP.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware, ya que no se han publicado pesos ni se ha especificado ningún modelo subyacente. No es posible estimar VRAM, GPUs recomendadas ni opciones de despliegue. Dado que es un artefacto de demostración, su ejecución no es necesaria para los fines de investigación; el análisis se realiza sobre los metadatos y el código asociado, no sobre inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que este no es un modelo funcional sino un PoC de ataque. Podría compararse con otros artefactos de demostración de backdoors, pero no se dispone de información sobre ellos en los resultados de búsqueda.

## Limitaciones y advertencias

- El modelo está explícitamente marcado como `BACKDOORED_MODEL`. No debe descargarse, ejecutarse ni desplegarse en ningún entorno real o de producción.
- El README indica que el contenido malicioso fue subido después de una revisión, lo que demuestra que incluso los procesos de aprobación pueden ser eludidos. Esto subraya la necesidad de verificar la integridad de los modelos mediante hashes, firmas o auditorías externas.
- No se especifica la naturaleza del backdoor: podría afectar a los pesos, a los datos de entrenamiento o al código de carga. En cualquier caso, el riesgo de compromiso es alto.
- La licencia MIT no implica que el modelo sea seguro; la licencia solo regula el uso del código, no garantiza la ausencia de vulnerabilidades.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque el modelo no tiene capacidades documentadas.
- Para producción, es imprescindible utilizar modelos de fuentes confiables, verificar su procedencia y aplicar medidas de seguridad como el escaneo de artefactos antes de su integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hackeronetestt/poc-supply-chain
- Artículo sobre envenenamiento de cadena de suministro en modelos de IA: https://techbytes.app/posts/supply-chain-poisoning-in-ai-models-deep-dive-2026/
- Servicios de seguridad de IA de HackerOne: https://www.hackerone.com/solutions/ai
- Documentación de HackerOne sobre pentesting de LLM: https://docs.hackerone.com/en/articles/13489525-h1-llm-application-pentest
- Noticia de CNN sobre fuga de modelos de IA en entornos de prueba: https://www.cnn.com/2026/07/22/tech/openai-hugging-face-ai-cybersecurity
