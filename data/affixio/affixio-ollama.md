# AffixIO/affixio-ollama

## Resumen

AffixIO/affixio-ollama no es un modelo de lenguaje en el sentido estricto: es un repositorio de integración publicado por AffixIO que permite ejecutar modelos locales servidos por Ollama detrás de una puerta de verificación previa a la llamada al modelo. Su propuesta es que la comprobación de autorización (proof/verification) ocurra antes de invocar al LLM y que las acciones sensibles queden bloqueadas a la espera de aprobación humana. Está pensado para flujos agénticos con tool calling y para despliegues totalmente offline, sin necesidad de clave de AffixIO en el modo de demostración local (`local_demo`).

El repositorio se distribuye con licencia Apache 2.0, metadatos de idioma únicamente en inglés y una etiqueta de pipeline no disponible, coherente con que no contiene pesos. El único modelo concreto citado en la documentación es `qwen2.5:0.5b`, que se descarga aparte mediante `ollama pull` y se usa como ejemplo funcional, no como componente empaquetado. El paquete incluye guía de instalación, guía de hardware, configuraciones probadas, un `Modelfile` fijado, ejemplos de cableado MCP y API, y un conjunto de pruebas del gate.

Su relevancia actual es acotada pero concreta: cubre el hueco de la autorización previa y la trazabilidad en agentes locales, un punto que las librerías de orquestación habituales suelen resolver solo de forma parcial. Como contrapartida, el repositorio acumula cero descargas y cero "likes", no publica benchmarks y la verificación alojada, la auditoría y el Agentic Pay Kit son productos de pago; la demo gratuita genera recibos simulados, no atestaciones verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: capa de integración y verificación sobre modelos servidos por Ollama. No publica pesos ni arquitectura propia. El modelo de ejemplo referenciado es qwen2.5:0.5b (transformer denso decoder-only) |
| Parametros totales | No disponible (depende del modelo Ollama que se seleccione; el ejemplo usa 0,5 B) |
| Longitud de contexto | No disponible (la fija el modelo subyacente servido por Ollama, no el repositorio) |
| Tipos de cuantizacion | No disponible (gestionados por el runtime de Ollama; el repositorio no define cuantizaciones) |
| Idiomas soportados | en (según metadatos y model card). El idioma real de las respuestas depende del modelo Ollama subyacente |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica: no se publican pesos en el repositorio. Los pesos los aporta el modelo descargado vía Ollama |

Otros datos de ficha: autor AffixIO, identificador AffixIO/affixio-ollama, pipeline no disponible, región `us`, 0 descargas, 0 likes, creado el 2026-09-19 y actualizado el 2026-09-19. Etiquetas declaradas: ai-agents, agentic-workflows, ollama, local-ai, mcp, agent-verification, tool-calling.

## Arquitectura y entrenamiento

No hay información de entrenamiento porque no existe entrenamiento: el repositorio no entrena ni destila ningún modelo. Se trata de una capa de orquestación que (1) fija la versión del modelo local mediante un `Modelfile.qwen25` y `models.yaml` con configuraciones probadas, (2) interpone una puerta de verificación antes de la llamada al modelo, y (3) expone puntos de integración mediante MCP (`mcp-example.json`) y mediante API (`api-example.py`). El flujo declarado es: verificación primero, llamada al modelo después, y espera de aprobación humana cuando la acción se clasifica como sensible.

El componente de prueba incluido, `test_gate.py`, sugiere que el gate es el objeto central del diseño y que se puede validar de forma aislada. No se documentan en la información disponible innovaciones de inferencia como decodificación especulativa, atención lineal ni mezclas de expertos, ni detalles sobre el dataset, RLHF o DPO, porque corresponderían al modelo subyacente y no a este repositorio.

## Capacidades

- Ejecución de modelos locales a través de Ollama, con configuración fijada (pin) y configuraciones de referencia en `models.yaml`.
- Puerta de verificación previa a la llamada al modelo: la comprobación de autorización ocurre antes de que el LLM reciba la petición.
- Aprobación humana para acciones sensibles, controlada mediante un parámetro de credencial en la invocación (`--credential approved`).
- Soporte de tool calling, según las etiquetas declaradas del repositorio.
- Soporte de flujos agénticos y de razonamiento en varios pasos, según las etiquetas `ai-agents` y `agentic-workflows`.
- Integración con MCP (Model Context Protocol) mediante el archivo de ejemplo incluido.
- Integración mediante API propia, con un ejemplo de cliente en Python.
- Funcionamiento totalmente offline: el modo de demostración local no requiere clave de AffixIO.
- Arnés de pruebas del gate ejecutable en local (`python test_gate.py`).
- Gestión de entornos y despliegue documentada en `README.md` e `INSTALL.md`, con guía de CPU/GPU en `HARDWARE.md`.
- No dispone de capacidades multimodales, de visión, de audio ni de generación propia: no contiene pesos.

## Casos de uso

- Autorización previa en agentes locales: el gate se ejecuta antes de que el modelo reciba la instrucción, de modo que una petición no autorizada nunca llega al LLM. Es adecuado cuando el coste de una llamada indebida es mayor que el de la propia inferencia.
- Human-in-the-loop para operaciones destructivas: en tareas como borrado de ficheros, escritura en bases de datos o ejecución de comandos, el flujo puede detener la acción hasta recibir la credencial de aprobación explícita.
- Despliegue en entornos air-gapped: al funcionar con Ollama en local y sin clave externa en modo demo, encaja en redes aisladas donde no se permite tráfico hacia servicios de verificación en la nube.
- Integración de agentes vía MCP: el archivo `mcp-example.json` sirve como plantilla para conectar servidores MCP y someter sus llamadas de herramientas a la misma comprobación previa.
- Exposición como servicio interno: `api-example.py` permite levantar una API propia que envuelva el modelo local y aplique el gate de forma centralizada para varios clientes.
- Verificación continua en CI/CD: `test_gate.py` se puede ejecutar como prueba automática para detectar regresiones en la lógica de autorización antes de desplegar cambios.
- Prototipado y demostraciones reproducibles en portátil: con `qwen2.5:0.5b` como modelo de ejemplo, el coste de hardware es mínimo, lo que facilita validar el flujo completo sin GPU dedicada.
- Base para trazabilidad y auditoría interna: el repositorio distingue explícitamente entre recibos simulados de la demo local y atestaciones de la ruta alojada de pago, lo que permite planificar una migración a un registro auditable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y la búsqueda web no devolvió documentación técnica relacionada (los resultados obtenidos corresponden a emisoras de radio en croata y no guardan relación con el modelo).

## Requisitos de hardware

- No se dispone de los datos de `HARDWARE.md`, por lo que no hay cifras oficiales de VRAM ni de CPU publicadas en la información disponible.
- Estimación orientativa basada en el modelo de ejemplo `qwen2.5:0.5b`: al tratarse de un modelo de 0,5 B de parámetros, los pesos cuantizados a 4 bits ocupan del orden de 0,4 GB y el proceso completo suele caber en 1-2 GB de RAM, por lo que es ejecutable en CPU sin GPU dedicada. Esta estimación corresponde al modelo subyacente, no al repositorio.
- GPU recomendadas: no disponibles. Para el ejemplo de 0,5 B, cualquier GPU con 2 GB o más de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090 para la demo.
- Cabe en GPU de consumo: sí, para el modelo de ejemplo. Para modelos mayores servidos por Ollama, el requisito lo determina el modelo elegido, no este repositorio.
- Opciones de despliegue: Ollama como runtime principal, con el `Modelfile.qwen25` incluido; los pesos gestionados por Ollama se apoyan en formatos GGUF. Se incluyen además ejemplos de integración por API y por MCP.
- Latencia y throughput: no disponibles. Dependen por completo del modelo servido por Ollama y del hardware anfitrión.

## Comparativa con modelos similares

La comparación se establece con herramientas de la misma categoría funcional (control y validación de agentes), no con modelos de lenguaje. Los datos de las alternativas proceden de su documentación pública y conviene verificarlos antes de tomar una decisión.

| Herramienta | Tipo de componente | Licencia | Verificación antes de la llamada al LLM | Enfoque principal |
|---|---|---|---|---|
| AffixIO/affixio-ollama | Integración y gate sobre Ollama | Apache 2.0 | Sí, según la model card | Autorización previa, aprobación humana y recibos; verificación alojada de pago |
| LangGraph (LangChain) | Framework de orquestación de agentes | MIT | No de forma nativa; requiere implementación propia del punto de interrupción | Grafos de estado con interrupciones para intervención humana |
| NeMo Guardrails (NVIDIA) | Capa de guardarraíles conversacionales | Apache 2.0 | Parcial: los guardarraíles se aplican al flujo de entrada/salida | Control de diálogo mediante Colang y políticas |
| Guardrails AI | Validación de entradas y salidas | Apache 2.0 | Parcial: validación de la salida y de los argumentos de herramientas | Validadores declarativos y reejecución ante fallo |

Frente a las alternativas, la diferencia declarada de AffixIO es el orden de la comprobación (antes de invocar al modelo) y su integración directa con Ollama y MCP, además de un modo local sin clave. Como contrapartida, carece de benchmarks publicados, de comunidad (0 descargas, 0 likes) y de verificación externa, mientras que las alternativas cuentan con ecosistemas y documentación mucho más amplios.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, no genera texto por sí mismo y sus capacidades reales dependen íntegramente del modelo que se sirva a través de Ollama.
- El modo gratuito `local_demo` genera recibos simulados, no atestaciones. La verificación alojada, la auditoría y el Agentic Pay Kit son productos de pago, de modo que cualquier uso en producción con garantías de trazabilidad implica coste.
- Ausencia total de validación independiente: 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks ni métricas de latencia o throughput.
- El gate verifica autorización, no veracidad: no mitiga alucinaciones, sesgos ni errores factuales del modelo subyacente. Un contenido incorrecto pero autorizado pasa el filtro.
- Dependencia operativa de dos elementos externos: Ollama instalado y funcionando, y la etiqueta `qwen2.5:0.5b` descargada mediante `ollama pull`. La disponibilidad y la licencia del modelo subyacente son responsabilidad del usuario.
- Idiomas: los metadatos declaran únicamente inglés. El multilingüismo efectivo lo determina el modelo de Ollama elegido, no esta integración.
- Restricciones de licencia: el repositorio es Apache 2.0, pero conviene revisar por separado los términos del modelo subyacente y de los servicios alojados de AffixIO antes de un uso comercial.
- Fechas de creación y actualización declaradas (2026-09-19) resultan anómalas y conviene verificarlas; el proyecto parece encontrarse en su versión inicial v1.0.0.
- La búsqueda web no aportó documentación técnica independiente: los resultados obtenidos no guardan relación con el repositorio, por lo que toda la información procede de la propia model card del autor.
- Riesgo de dependencia de proveedor: la ruta de producción se apoya en el SDK de AffixIO, su API alojada y su Agentic Pay Kit, lo que puede dificultar la migración a otra solución de verificación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AffixIO/affixio-ollama
- Producto: https://www.affix-io.com
- SDK en npm: https://www.npmjs.com/package/affixio
- Documentación de la API: https://www.affix-io.com/docs/
- Agentic Pay Kit: https://www.affix-io.com/agent-trust/
- Archivos incluidos en el repositorio: `README.md` (guía completa), `INSTALL.md`, `HARDWARE.md` (CPU/GPU), `models.yaml` (configuraciones probadas), `Modelfile.qwen25` (build fijado), `mcp-example.json` y `api-example.py` (cableado MCP/API), `test_gate.py` (pruebas), `.env.example`
- Modelo de ejemplo referenciado en el quickstart: `qwen2.5:0.5b` (descarga vía `ollama pull`, alojado en la biblioteca de Ollama)
- Papers, blogs o demos adicionales: no disponibles
