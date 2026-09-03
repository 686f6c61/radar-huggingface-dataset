# Snapkitty/holy-agents

## Resumen

Holy Agents es un sistema de agentes de software presentado por Snapkitty como parte de su ecosistema SnapKitty OS. No se trata de un modelo de lenguaje o de un sistema de IA generativa, sino de un "runtime" de agentes gobernados por reglas religiosas, concretamente una constitución bíblica. El proyecto define un pipeline de cinco agentes (SCRIBE, JUDGE, PROPHET, SENTINEL y LEDGE) que deben validar cualquier acción antes de ejecutarla, siguiendo tres puertas: la puerta de la Escritura, la puerta de la Lógica y la puerta del Testigo.

El sistema incorpora verificación formal mediante Lean 4, un asistente de pruebas interactivo, para comprobar que las acciones no violan reglas declaradas (RTRUST). Incluye una API REST con endpoints para consultar estado, enviar consultas y verificar la integridad de una cadena WORM (write-once, read-many). El proyecto se distribuye bajo licencia MIT, aunque los metadatos de HuggingFace no especifican licencia. La fecha de creación es septiembre de 2026 y no registra descargas ni valoraciones.

La relevancia de este proyecto radica en su enfoque inusual: aplicar gobernanza ética y verificación formal a agentes autónomos, aunque su base teológica limita su aplicabilidad general. No hay información sobre arquitectura de red neuronal, parámetros, entrenamiento o capacidades de procesamiento de lenguaje, por lo que no puede evaluarse como un modelo de IA convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de agentes (no es un modelo de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (según model card); no disponible en metadatos de HuggingFace |
| Formato de pesos | no disponible (no hay pesos; es un runtime de agentes) |

## Arquitectura y entrenamiento

Holy Agents no es un modelo entrenado con datos. Es un sistema de software compuesto por cinco agentes que operan en pipeline: SCRIBE (recuperación teológica), JUDGE (validación lógica formal), PROPHET (detección de riesgos morales), SENTINEL (seguridad) y LEDGE (sellado WORM). El flujo de arranque comienza con la intención del usuario, pasa por cada agente y termina con la ejecución o el "arrepentimiento" (repent). La verificación formal se implementa en Lean 4, en el archivo `lean/TheologyValidator.lean`, que comprueba si las acciones violan reglas RTRUST declaradas.

No se proporciona información sobre datos de entrenamiento, número de tokens, técnicas de RLHF o DPO, ni innovaciones en atención o decodificación. El sistema se construye con npm (JavaScript/TypeScript) y expone una API REST. La documentación menciona comandos como `npm run doctor`, `npm test` y `npm run verify`, lo que sugiere un desarrollo convencional de software, no un pipeline de IA.

## Capacidades

- Ejecución de un pipeline de agentes con gobernanza basada en reglas bíblicas (constitución).
- Verificación formal de acciones mediante Lean 4, comprobando consistencia lógica contra reglas RTRUST.
- Recuperación de información teológica (SCRIBE) desde escrituras, comentarios, diccionarios y Wikipedia.
- Validación de razonamiento (JUDGE) convirtiendo afirmaciones en lógica comprobable.
- Detección de riesgos morales (PROPHET): contradicción, orgullo, explotación, engaño.
- Control de seguridad (SENTINEL) que bloquea salidas inseguras, engañosas o sin citas.
- Sellado de decisiones en un registro de solo escritura (WORM) mediante LEDGE, con verificación de integridad de la cadena.
- API REST con endpoints para salud, consulta, estado, cadena WORM, verificación y acciones de agentes.

## Casos de uso

- Auditoría de decisiones automatizadas: el pipeline de agentes puede registrar cada decisión en una cadena WORM, lo que permite auditar posteriormente qué reglas se aplicaron y por qué se tomó una acción. Útil en entornos donde se requiere trazabilidad completa.
- Verificación formal de políticas: el módulo Lean 4 permite comprobar formalmente que una acción no viola un conjunto de reglas declaradas, lo que puede aplicarse a sistemas de control de acceso o cumplimiento normativo.
- Gobernanza de agentes autónomos: si se integra en un sistema multiagente, Holy Agents puede servir como capa de control que impide acciones no autorizadas por la constitución definida.
- Sistema de alerta temprana: el agente PROPHET detecta patrones de contradicción, orgullo o engaño en las entradas, lo que podría usarse para filtrar contenido o detectar intentos de manipulación.
- Registro inmutable de eventos: el sellado WORM de LEDGE proporciona un registro de solo escritura, útil para sistemas de logging donde la integridad es crítica (por ejemplo, registros de cumplimiento).
- Entorno educativo sobre agentes con ética: el proyecto puede servir como ejemplo de cómo implementar una capa de gobernanza ética en agentes, aunque su base religiosa limita su uso general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, latencia, throughput ni comparaciones con otros sistemas. El proyecto no presenta métricas de rendimiento en la model card.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- Al ser un runtime de agentes (no un modelo de IA), no requiere GPU ni VRAM para inferencia.
- El sistema se ejecuta con Node.js (npm), por lo que puede desplegarse en cualquier servidor con Node.js instalado.
- La verificación Lean 4 requiere el compilador de Lean 4, que es una herramienta de CPU.
- No hay información sobre latencia o throughput; dependerá de la implementación y de los recursos del servidor.

## Comparativa con modelos similares

No disponible. Holy Agents no es un modelo de lenguaje ni un sistema de IA comparable con LLMs como Llama, Mistral o Qwen. Su naturaleza es la de un framework de agentes con verificación formal, sin parámetros ni capacidades de generación de texto. No se han encontrado proyectos similares en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no puede generar texto, código ni razonar sobre dominios generales. Su función se limita a la validación de acciones según reglas teológicas.
- Base religiosa explícita: el sistema está diseñado en torno a una constitución bíblica, lo que lo hace inadecuado para entornos seculares o donde se requiera neutralidad ética.
- Dependencia de Lean 4: la verificación formal requiere conocimientos de Lean 4 para modificar o ampliar las reglas RTRUST.
- Sin documentación sobre seguridad: no se detallan medidas de seguridad del runtime, autenticación de la API o protección contra ataques.
- Licencia MIT: permite uso comercial, pero la ausencia de metadatos de licencia en HuggingFace puede generar incertidumbre legal.
- Sin mantenimiento aparente: el proyecto tiene cero descargas y cero likes, lo que sugiere que es un experimento sin comunidad activa.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo, pero el agente SCRIBE podría recuperar información teológica errónea si las fuentes no están curadas.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/holy-agents
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
