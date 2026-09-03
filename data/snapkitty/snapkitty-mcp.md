# Snapkitty/snapkitty-mcp

## Resumen

Snapkitty/snapkitty-mcp no es un modelo de lenguaje, sino un servidor MCP (Model Context Protocol) desarrollado por SnapKitty Collective, un colectivo que se autodenomina "soberano". El repositorio expone las capacidades principales de SnapKitty como herramientas MCP invocables desde clientes compatibles como Claude Desktop, Claude Code o directamente mediante `npx`. Se presenta como una infraestructura para sellado de datos en una cadena WORM (Write Once Read Many) basada en SHA-256, generación de manifiestos de agentes, contratos de gobernanza y especificaciones de inyección para modelos SSM (State Space Models).

El proyecto integra conceptos de verificación formal con Lean 4, contratos en sintaxis Ada y arquitecturas de modelos SSM tipo Mamba, proponiendo un mecanismo para inyectar pruebas simbólicas directamente en el estado oculto del modelo, evitando la ventana de contexto. Requiere Node.js 20+ y, opcionalmente, Ollama para la herramienta `twin_chat`. El repositorio tiene 0 descargas y 0 likes, y fue creado el 3 de septiembre de 2026, lo que sugiere que es un proyecto reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (servidor MCP, no modelo de lenguaje) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No aplica (paquete npm: @snapkitty/mcp-server) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un servidor MCP que orquesta herramientas. La arquitectura descrita en la documentación se denomina BOB/METATRON y propone un flujo donde un teorema formalizado en Lean 4 y un contrato en sintaxis Ada se combinan para generar un vector de inyección de 2048 dimensiones que se incorpora al estado oculto de un modelo SSM (State Space Model) tipo Mamba. La ecuación de estado propuesta es `h(t) = ā·h(t-1) + b̄·x(t) + W·v_inject`, donde `v_inject` es el vector de inyección. La idea central es que las pruebas simbólicas estructuradas se incrustan directamente en el estado oculto, evitando la ventana de contexto, y que una "puerta de prueba" se activa antes de que el estado avance, bloqueando transiciones de estado si las pruebas no son válidas.

No se proporciona información sobre datos de entrenamiento, número de tokens, ni procesos de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Sellado de cualquier carga útil en una cadena WORM (Write Once Read Many) basada en SHA-256 mediante la herramienta `worm_seal`.
- Lectura y verificación de la cadena WORM con `worm_read`.
- Creación de manifiestos de agentes "soberanos" con roles predefinidos (SENTINEL, ORACLE, BUILDER, ARCHIVIST, BERSERKER) mediante `agent_build`.
- Generación de contratos de gobernanza en sintaxis Ada, sellados con WORM, a través de `ada_contract_generate`.
- Chat con modelos locales de Ollama, con la respuesta sellada en la cadena WORM, mediante `twin_chat`.
- Generación de especificaciones de inyección para modelos SSM a partir de teoremas Lean 4 y contratos Ada, con `sovereign_inject`.
- Funcionamiento offline para todas las herramientas excepto `twin_chat`, que requiere Ollama en ejecución local.

## Casos de uso

- Auditoría de integridad de datos: `worm_seal` y `worm_read` permiten sellar y verificar cualquier carga útil en una cadena inmutable SHA-256, útil para registrar evidencias, logs o artefactos de build con garantía de no alteración.
- Gobernanza automatizada: `ada_contract_generate` genera contratos en sintaxis Ada sellados en WORM, lo que permite formalizar acuerdos o políticas de forma verificable y auditable.
- Orquestación de agentes: `agent_build` crea manifiestos con roles específicos (SENTINEL, ORACLE, etc.), lo que facilita la definición de agentes autónomos con responsabilidades claras en un sistema multiagente.
- Verificación formal aplicada a IA: `sovereign_inject` combina teoremas Lean 4 con contratos Ada para generar vectores de inyección en modelos SSM, orientado a investigación en IA simbólica y modelos híbridos.
- Chat local con sellado de respuestas: `twin_chat` permite conversar con un modelo Ollama local y sellar cada respuesta en la cadena WORM, útil para mantener un registro inmutable de interacciones.
- Integración con asistentes MCP: el servidor puede conectarse a Claude Desktop o Claude Code, ampliando las capacidades de estos asistentes con las herramientas de SnapKitty.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un servidor MCP y no un modelo de lenguaje, no aplican métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Node.js 20+ como requisito de software.
- Ollama en ejecución local para la herramienta `twin_chat` (opcional, el resto de herramientas funcionan offline).
- No se especifican requisitos de VRAM, GPU o latencia, ya que la carga computacional depende del modelo Ollama que se utilice en `twin_chat`.
- Despliegue mediante instalación global con npm (`npm install -g @snapkitty/mcp-server`) o invocación directa con `npx`.

## Comparativa con modelos similares

No disponible. No se han identificado servidores MCP directamente comparables en la información proporcionada. La mayoría de los servidores MCP existentes se centran en integraciones con APIs externas o bases de datos, mientras que SnapKitty se orienta a gobernanza, verificación formal y sellado WORM, lo que lo hace difícil de comparar con alternativas convencionales.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción nula o muy temprana; no hay evidencia de uso en producción.
- No se especifica la licencia, lo que genera incertidumbre legal para uso comercial o redistribución.
- La arquitectura BOB/METATRON y el mecanismo de inyección en SSM no están validados por la comunidad científica; se basan en documentación propia del autor.
- La herramienta `twin_chat` depende de Ollama, lo que introduce un requisito externo y posibles problemas de compatibilidad con modelos locales.
- No se proporciona información sobre seguridad, manejo de datos sensibles o cumplimiento normativo, a pesar de la denominación "sovereign-grade".
- La fecha de creación (septiembre de 2026) es posterior a la fecha actual del conocimiento del modelo, lo que sugiere que el proyecto es muy reciente o que la fecha es incorrecta.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/snapkitty-mcp
- Sitio del colectivo: https://collectivekitty.com
