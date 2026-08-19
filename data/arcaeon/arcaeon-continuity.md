# Arcaeon/arcaeon-continuity

## Resumen

arcaeon-continuity es una biblioteca de Python desarrollada por Arcaeon que proporciona un mecanismo de verificación de continuidad para agentes de IA. Su propósito es resolver el problema de que, cuando un agente sobrevive a un reinicio de contexto, una compactación o una migración de sustrato, no existe ninguna prueba de que la siguiente instancia sea una continuación fiel de la anterior. La herramienta permite al agente escribir un manifiesto explícito de su estado (anclas de identidad, compromisos abiertos), sellarlo criptográficamente antes de la transición, y luego verificar que la instancia siguiente re-deriva correctamente contra esa línea base sellada, devolviendo un veredicto de fidelidad o una lista de divergencias concretas.

No se trata de un modelo de lenguaje ni de un sistema de IA generativa, sino de una capa de composición pensada para integrarse en el ecosistema de agentes de IA. La biblioteca es ligera, no requiere red ni modelos vivos para su autoverificación, y se distribuye bajo licencia MIT. Su relevancia actual radica en que los agentes autónomos con memoria larga y sistemas multi-agente dependen críticamente de que el estado se conserve de forma verificable a través de reinicios, algo que hoy en día se da por sentado sin evidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (biblioteca de software, no un modelo neuronal) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (la interfaz es Python, sin restricciones de idioma) |
| Licencia | MIT |
| Formato de pesos | No aplica (distribuido como paquete Python en PyPI y GitHub) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una biblioteca de software compuesta por tres módulos funcionales: continuidad (manifiesto explícito que el agente controla), credibilidad (hash-chain del snapshot y verificación de la continuación) y honestidad sobre el registro (recibo de eliminación a prueba de manipulaciones). La implementación se apoya en otros paquetes del ecosistema Arcaeon: arcaeon-ledger para encadenar el snapshot, arcaeon-baseline para puntuar la verificación de continuación fiel, y arcaeon-compact para el recibo de descarte. Cada dependencia es opcional y su ausencia se detecta con un error específico que indica el comando pip install necesario.

No hay datos de entrenamiento, tokens, ni procesos de RLHF/DPO, ya que no es un modelo de aprendizaje automático.

## Capacidades

- Generar un snapshot del estado declarado de un agente (manifiesto) con anclas de identidad y compromisos abiertos.
- Sellar criptográficamente el snapshot mediante hash-chain, de modo que cualquier alteración posterior sea detectable.
- Verificar que una instancia continuada re-deriva correctamente contra el snapshot sellado, devolviendo un veredicto binario (fiel o no) y, en caso de divergencia, identificando exactamente qué campos difieren.
- Producir un recibo de eliminación (drop receipt) a prueba de manipulaciones que registra qué elementos se cortaron durante una compactación, impidiendo que el historial se reescriba silenciosamente.
- Integrarse como servidor MCP (Model Context Protocol) para exponer la función `continuity_snapshot` a agentes que hablen ese protocolo.
- Ejecutar un autotest embebido (`python -m arcaeon_continuity selftest`) que verifica la funcionalidad sin necesidad de red ni de un modelo de IA externo.

## Casos de uso

- Auditoría de agentes autónomos en producción: un operador puede exigir que cada agente genere un snapshot antes de un reinicio programado y verificar después que la nueva instancia es fiel al manifiesto, detectando cualquier pérdida de estado.
- Migración de agentes entre infraestructuras (por ejemplo, de un entorno local a la nube): el snapshot sellado sirve como prueba de que el agente migrado conserva sus compromisos y anclas de identidad.
- Compactación de contexto en agentes con memoria larga: antes de resumir o recortar el historial, el agente declara qué va a conservar y qué va a descartar; el recibo de eliminación queda registrado y verificable.
- Cumplimiento normativo y trazabilidad: en sistemas donde se requiere evidencia de que un agente no ha sido alterado entre sesiones (por ejemplo, en servicios financieros o sanitarios), la herramienta proporciona un registro auditable.
- Depuración de fallos de continuidad: cuando un agente se comporta de forma inconsistente tras un reset, el veredicto de divergencia señala exactamente qué campo del manifiesto cambió, acelerando la corrección.
- Desarrollo de frameworks de agentes: los creadores de orquestadores de agentes pueden integrar arcaeon-continuity como capa de verificación estándar para garantizar que las transiciones entre pasos de un agente multi-step no pierdan estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La biblioteca incluye 17 casos de prueba pytest y un autotest que cubren determinismo en round-trips, continuación fiel, divergencia plantada y detectada, invalidación de sondas, recibo de descarte y degradación elegante con dependencias opcionales. No hay datos de latencia ni throughput, ya que no es un modelo de inferencia.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es una biblioteca Python que se ejecuta en CPU.
- Requiere Python 3.x (versión específica no indicada en la información disponible).
- Dependencias opcionales: arcaeon-ledger, arcaeon-baseline, arcaeon-compact (instalables vía pip).
- Para el servidor MCP se necesita un entorno que pueda ejecutar comandos Python (por ejemplo, el runtime de un agente compatible con MCP).
- No hay requisitos de VRAM ni de GPU recomendadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada herramientas equivalentes que ofrezcan verificación de continuidad de agentes con hash-chain, recibo de descarte y servidor MCP. Alternativas genéricas de serialización de estado (como pickle o JSON) no proporcionan verificación criptográfica ni detección de divergencias.

## Limitaciones y advertencias

- El veredicto de fidelidad solo demuestra que el manifiesto declarado se preservó y que la continuación coincide con las sondas declaradas; no prueba que "el mismo yo" respondió, ni mide identidad o cualia.
- El manifiesto solo es tan completo como la declaración del agente; si algo crítico no se escribió en él, su pérdida es invisible para la herramienta por construcción.
- Un veredicto fiel solo cubre las dimensiones selladas; no cubre nada fuera de ellas. Si se necesita más cobertura, hay que declarar más sondas.
- La publicación en PyPI está pendiente; actualmente el código fuente está disponible en GitHub y la instalación directa desde el repositorio es posible.
- No hay garantías de soporte a largo plazo ni de mantenimiento activo, dado el estado temprano del proyecto (creado en agosto de 2026).
- No se ha evaluado su comportamiento en entornos de producción a gran escala; los tests cubren casos unitarios, no integraciones complejas.

## Enlaces

- HuggingFace: https://huggingface.co/Arcaeon/arcaeon-continuity
- GitHub: https://github.com/Arcaeon-io/arcaeon-continuity
- PyPI (pendiente): https://pypi.org/project/arcaeon-continuity/
- Página de verificación: https://arcaeon.io/verify
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Arcaeon/tamper-evidence-demo
- Dependencias relacionadas:
  - arcaeon-ledger: https://pypi.org/project/arcaeon-ledger/
  - arcaeon-baseline: https://pypi.org/project/arcaeon-baseline/
  - arcaeon-compact: https://pypi.org/project/arcaeon-compact/
