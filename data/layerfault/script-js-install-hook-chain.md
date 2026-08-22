# LayerFault/script-js-install-hook-chain

## Resumen
El repositorio `LayerFault/script-js-install-hook-chain` es un artefacto sintético de prueba de seguridad, no un modelo de inteligencia artificial utilizable. Forma parte del corpus Layerfault, diseñado para ejercitar reglas de detección en escáneres de seguridad de modelos y artefactos de IA. Su contenido incluye características adversarias deliberadas, como opcodes de pickle sospechosos, contenedores de formatos ejecutables y cadenas de inyección de prompts, con el fin de validar sistemas de control de admisión en entornos locales.

El repositorio se presenta como un "control" para pruebas de detección, con severidad clasificada como media y dificultad alta. No contiene pesos de modelo, arquitectura ni datos de entrenamiento. Su único propósito es servir como entrada de prueba en entornos aislados de análisis estático y seguridad. No debe cargarse ni ejecutarse fuera de un sandbox de pruebas.

Aunque la licencia declarada es Apache-2.0, el acceso está restringido mediante un sistema de gating que requiere aceptar explícitamente que se trata de un fixture de seguridad y no un modelo de producción. La descripción del repositorio indica que es un "control/comparación" para reglas de detección candidatas, sin reglas directas esperadas.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento
No se trata de un modelo de aprendizaje automático, por lo que no existe arquitectura ni entrenamiento. El repositorio contiene un artefacto sintético diseñado para simular características adversarias (como opcodes de pickle sospechosos, contenedores de ejecutables y cadenas de inyección de prompts). Su contenido se genera con fines de prueba de escáneres de seguridad, y no hay información sobre datos de entrenamiento, tokens o procesos de optimización. La model card indica que se trata de un "corpus de seguridad sintético" con "secretos falsos, destinos de red loopback/.invalid, salidas de marcadores inofensivas y comportamiento de modelo sintético".

## Capacidades
- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión ni ninguna funcionalidad de modelo de IA.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es multilingüe.
- Su única función es servir como entrada de prueba para validar reglas de detección de seguridad en escáneres de artefactos de IA.
- Contiene características adversarias intencionales: opcodes de pickle sospechosos, contenedores de ejecutables y cadenas de inyección de prompts, diseñados para ejercitar reglas de detección específicas.

## Casos de uso
- Pruebas de escáneres de seguridad: se utiliza como entrada de control en entornos aislados para validar que las reglas de detección (p. ej., `LF-DEP-NPM-INSTALL-HOOK`, `LF-JS-SEMANTIC-PROCESS`) se activan correctamente ante artefactos adversarios.
- Evaluación de sistemas de admisión de modelos: permite comprobar que un sistema de control de admisión (como LayerFault) bloquea o clasifica correctamente artefactos sospechosos antes de su uso en inferencia.
- Entrenamiento de reglas de detección: sirve como ejemplo positivo para desarrollar o ajustar reglas de seguridad que identifiquen patrones de ataque en la cadena de suministro de scripts de instalación.
- Comparación de escáneres: puede utilizarse como referencia en pruebas comparativas entre diferentes herramientas de análisis de seguridad de modelos.
- Auditoría de repositorios: ayuda a evaluar si un sistema de revisión manual o automática es capaz de detectar artefactos maliciosos disfrazados de modelos legítimos.
- Investigación en seguridad de IA: proporciona un caso de estudio controlado para analizar técnicas de ocultación de payloads en repositorios de modelos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene un modelo de IA, por lo que no existen métricas de rendimiento, precisión o latencia.

## Requisitos de hardware
No aplica. Este repositorio no contiene un modelo de IA que requiera hardware para inferencia. Su ejecución se limita a entornos de análisis estático o sandbox de seguridad, que no demandan recursos de GPU ni memoria específicos. No se recomienda su ejecución en ningún sistema productivo.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo de IA, por lo que no se puede comparar con otros modelos de generación de texto, código o razonamiento. Su naturaleza es exclusivamente de artefacto de prueba de seguridad, sin equivalente en el ámbito de modelos de lenguaje.

## Limitaciones y advertencias
- No es un modelo de IA y no debe usarse como tal. No genera texto, código ni ninguna salida útil.
- Contiene características adversarias deliberadas: opcodes de pickle sospechosos, contenedores de ejecutables y cadenas de inyección de prompts, que pueden activar alertas de seguridad o ser maliciosos si se ejecutan en un entorno no aislado.
- La model card advierte explícitamente que "no es un modelo utilizable y nunca debe cargarse o ejecutarse fuera de un entorno aislado de pruebas de escáneres".
- El acceso está restringido mediante un gating automático que requiere aceptación de que se trata de un fixture de prueba; esto no garantiza la seguridad del contenido.
- La licencia Apache-2.0 no otorga permiso para usos distintos a pruebas de seguridad; el uso comercial o productivo no está contemplado.
- No se proporcionan datos sobre idiomas, formatos de pesos ni especificaciones técnicas, ya que no es un modelo.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/LayerFault/script-js-install-hook-chain
- Repositorio GitHub de LayerFault (proyecto de validación de modelos): https://github.com/izm1chael/layerfault/tree/main
- Artículo sobre ataques a la cadena de suministro de npm vía Hugging Face: https://www.archyde.com/north-korea-linked-attack-exploits-npm-supply-chain-via-hugging-face-malware/
- Documentación de integración de modelos en LangChain.js (referencia general, no específica del repositorio): https://deepwiki.com/langchain-ai/langchainjs/1.3-installation-and-setup
- Lista de integraciones de LangChain.js: https://docs.langchain.com/oss/javascript/integrations/providers/all_providers
