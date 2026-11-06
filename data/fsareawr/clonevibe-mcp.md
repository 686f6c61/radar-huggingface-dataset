# fsareawr/clonevibe-mcp

## Resumen

`clonevibe-mcp` no es un modelo de lenguaje, sino un servidor MCP (Model Context Protocol) publicado por el usuario `fsareawr` en HuggingFace bajo el identificador `fsareawr/clonevibe-mcp`. El artefacto original es el paquete npm `@kr-pro-labs/clonevibe-mcp`, desarrollado por KR-PRO-Labs y Julian Vane (`@goooem`), y su función es la de actuar como herramienta auxiliar para asistentes de codigo que hablan MCP (Claude Desktop, Cursor, Windsurf, Antigravity, entre otros).

El problema que resuelve es concreto: durante el desarrollo asistido por IA (lo que el autor denomina "vibe coding"), el ingeniero localiza un algoritmo, parser de tablas, planificador de reintentos o maquina de estados dentro de un repositorio externo de gran tamano (hasta 50.000 lineas), un paquete `npm:`/`pypi:`/`cargo:` o un bundle JavaScript minificado. Clonar el repositorio completo o instalar el arbol de dependencias contamina el proyecto. `clonevibe-mcp` extrae unicamente el cierre AST transitivo minimo de la funcionalidad objetivo, sustituye las dependencias de terceros por micro-shims inline sin dependencias y verifica la equivalencia de comportamiento 1:1 mediante vectores Golden I/O.

La relevancia actual radica en su encaje en el ecosistema MCP (version 1.0.4 declarada) y en el soporte poliglota declarado para TypeScript, JavaScript, Python, Rust y Go. No se trata, por tanto, de un modelo con pesos, contexto ni parametros, sino de una herramienta de ingenieria de software que un agente puede invocar como "tool".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP (Node.js >= 20.0.0) con pipeline de 6 etapas: ingesta, localizacion de entrypoints, slicing AST, perfilado de estilo, sintesis de graft y verificacion de paridad |
| Parametros totales | no disponible (no es un modelo de lenguaje) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | TypeScript, JavaScript, Python, Rust y Go (lenguajes de codigo analizados y generados); documentacion en ingles y coreano |
| Licencia | MIT (segun badge del README y seccion License: "MIT © KR-PRO-Labs & Julian Vane") |
| Formato de pesos | no disponible (paquete npm `@kr-pro-labs/clonevibe-mcp`; no hay pesos) |

## Arquitectura y entrenamiento

No aplica entrenamiento: `clonevibe-mcp` es una herramienta determinista de analisis y transformacion de codigo, no un modelo entrenado. Su arquitectura interna es un pipeline de seis etapas encadenadas que el cliente MCP orquesta mediante llamadas a herramientas:

1. `ingest_reference`: hidrata una URL de GitHub, un directorio local, una especificacion de registro (`npm:`, `pypi:`, `cargo:`), un mapa de ficheros inline o un bundle JS minificado en un `ReferenceSnapshot`, con formateo estructural sensible a tokens para bundles de una sola linea.
2. `locate_feature_entrypoints`: puntua y ordena simbolos del snapshot frente a consultas en lenguaje natural y centralidad de llamadas.
3. `slice_engine_graph`: calcula el cierre transitivo minimo de llamadas y tipos AST desde los entrypoints y empareja shims sin dependencias.
4. `profile_target_vibe`: inspecciona el workspace destino para detectar lenguaje, sistema de modulos (`esm` vs `commonjs`), convencion de mayusculas (`camelCase`, `snake_case`, `PascalCase`), comillas, indentacion y estilo de manejo de errores.
5. `synthesize_chameleon_graft`: genera un modulo adaptado sin dependencias externas (`externalDepCount === 0`) y un "Clean-Room Algorithmic Blueprint" en el lenguaje destino.
6. `verify_engine_parity`: ejecuta vectores Golden (vacios, limites numericos, Unicode/CJK, malformados y semillas deterministas) y emite un fichero de test ejecutable para `vitest`, `pytest`, `cargo test` o `go test`.

La innovacion tecnica declarada es doble: el slicing AST transitivo poliglota, que segun el autor poda entre el 80 % y el 98 % del codigo no relacionado del repositorio, y el catalogo de micro-shims que sustituye imports como `lodash`, `uuid`, `axios`, `node-fetch` o `chalk` por primitivas inline de biblioteca estandar.

## Capacidades

- Ingesta multifuente: repositorios locales, URLs de GitHub, especificaciones de registro (`npm:`, `pypi:`, `cargo:`), mapas de ficheros inline y bundles JS minificados.
- Slicing AST transitivo poliglota sobre TypeScript, JavaScript, Python, Rust y Go, incluyendo funciones, clases, structs, interfaces y aristas de llamada.
- Generacion de shims sin dependencias para reemplazar imports de terceros por primitivas de biblioteca estandar.
- Perfilado de estilo del proyecto destino y asimilacion cross-language (generacion del codigo adaptado al lenguaje y convenciones del host).
- Verificacion de paridad Golden I/O 1:1 con generacion de tests ejecutables (`vitest`, `pytest`, `cargo test`, `go test`).
- Exposicion como herramientas MCP (`ingest_reference`, `locate_feature_entrypoints`, `slice_engine_graph`, `profile_target_vibe`, `synthesize_chameleon_graft`, `verify_engine_parity`) y recursos MCP (`clonevibe://catalog/zero-dep-shims`, `clonevibe://guide/chameleon-workflow`).
- Integracion con clientes MCP: Claude Desktop, Cursor, Windsurf y Antigravity.

## Casos de uso

- Extraccion de un algoritmo concreto de un repositorio grande: el agente invoca `ingest_reference` sobre la URL de GitHub, `locate_feature_entrypoints` con una descripcion en lenguaje natural ("parser de tablas Markdown con soporte de alineacion") y `slice_engine_graph` para obtener solo el cierre AST necesario, evitando clonar las 50.000 lineas del proyecto original.
- Portar una rutina de un lenguaje a otro: tras el slicing, `profile_target_vibe` detecta que el proyecto destino es Python con `snake_case` e indentacion de 4 espacios, y `synthesize_chameleon_graft` genera el modulo equivalente sin dependencias, listo para integrar.
- Eliminar dependencias en un proyecto legacy: se localiza la funcionalidad de un paquete (`npm:lodash` o similar), se sustituye por shims inline y se valida con `verify_engine_parity` que el comportamiento sigue siendo identico antes de retirar la dependencia del `package.json`.
- Auditoria de bundles minificados: ingesta de un bundle JS de una sola linea con formateo estructural sensible a tokens, localizacion de una maquina de estados o planificador de reintentos y extraccion limpia para revision de seguridad.
- Generacion de tests de regresion: `verify_engine_parity` produce directamente un fichero `vitest`/`pytest`/`cargo test`/`go test` con vectores Golden (vacios, limites numericos, Unicode/CJK, malformados) que puede incorporarse al pipeline de CI del proyecto.
- Prototipado rapido en "vibe coding": el asistente integrado en Cursor o Claude Desktop usa el servidor MCP para incorporar funcionalidad de referencia sin arrastrar arboles de dependencias, manteniendo el proyecto limpio durante la fase de exploracion.
- Estandarizacion de estilo en equipos: `profile_target_vibe` permite que el codigo generado respete las convenciones del repositorio (comillas, indentacion, manejo de errores) sin revision manual adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo declarado por el autor es la poda del 80 % al 98 % de codigo no relacionado del repositorio durante el slicing, sin metodologia ni conjunto de evaluacion publicados.

## Requisitos de hardware

- No requiere GPU: es un servidor Node.js (`>= 20.0.0`) que ejecuta analisis AST y transformacion de codigo en CPU.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo capaz de ejecutar Node.js 20 o superior; el consumo dependera del tamano del repositorio o bundle ingerido.
- Opciones de despliegue: paquete npm invocable via `npx -y @kr-pro-labs/clonevibe-mcp`, configurado en `mcp_config.json` de clientes MCP; tambien compilable desde fuente con `npm install && npm run build`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Lenguajes | Licencia | Enfoque |
|---|---|---|---|---|
| `clonevibe-mcp` | Servidor MCP de slicing AST y grafting | TS, JS, Python, Rust, Go | MIT | Extraccion de funcionalidad con paridad Golden I/O |
| Repomix | Empaquetador de repositorios para LLM | Multiples (solo empaqueta) | MIT | Volcado completo del repo en un fichero para el contexto del modelo |
| tree-sitter | Parser incremental | Multiples | MIT | Analisis sintactico; no realiza slicing ni sintesis |
| jscodeshift / codemod | Herramientas de transformacion | JS/TS | MIT | Transformaciones programaticas; no extraen cierres transitivos ni verifican paridad |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio de HuggingFace (`fsareawr/clonevibe-mcp`) no declara licencia, idiomas ni pipeline; la unica referencia a licencia MIT proviene del README del paquete original `@kr-pro-labs/clonevibe-mcp`. Conviene verificar la procedencia y el estado del artefacto antes de usarlo en produccion.
- El repositorio de HuggingFace registra 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de mantenimiento ni de adopcion.
- La paridad 1:1 se limita a los vectores Golden generados; comportamientos no cubiertos por esos vectores (condiciones de carrera, efectos secundarios de E/S, dependencias de entorno) pueden divergir sin ser detectados.
- El slicing AST no resuelve casos de reflexion, evaluacion dinamica, generacion de codigo en tiempo de ejecucion ni dependencias cargadas dinamicamente; en esos escenarios el cierre transitivo puede ser incompleto.
- La sustitucion de dependencias por shims inline puede alterar el comportamiento en casos limite no contemplados por el catalogo (`clonevibe://catalog/zero-dep-shims`).
- El autor declara soporte para cinco lenguajes; no se especifica cobertura por lenguaje ni limitaciones por version.
- No hay informacion sobre sesgos (no aplica a un modelo de lenguaje) ni sobre riesgos de alucinacion del propio servidor; el riesgo recae en el modelo que invoca las herramientas.
- No se han publicado benchmarks ni evaluaciones independientes del rendimiento de la herramienta.

## Enlaces

- HuggingFace: https://huggingface.co/fsareawr/clonevibe-mcp
- Repositorio GitHub: https://github.com/KR-PRO-Labs/clonevibe-mcp
- CI: https://github.com/KR-PRO-Labs/clonevibe-mcp/actions/workflows/ci.yml
- Paquete npm: `@kr-pro-labs/clonevibe-mcp` (https://www.npmjs.com/package/@kr-pro-labs/clonevibe-mcp)
- Especificacion MCP: https://modelcontextprotocol.io/
- Perfil del autor original: https://github.com/goooem
- Organizacion: https://github.com/KR-PRO-Labs
