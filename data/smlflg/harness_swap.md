# smlflg/Harness_swap

## Resumen

Harness Swap es un repositorio publicado en Hugging Face por el usuario `smlflg` que, pese a estar alojado en la plataforma, no contiene un modelo de IA: es una herramienta de migracion "local-first" disenada para trasladar un harness orientado a Claude/OpenClaude a un paquete de exportacion orientado a GPT sin editar la carpeta de origen. La version 0.1 se centra exclusivamente en la exportacion segura: escanea el harness seleccionado, detecta las suposiciones especificas de Claude/OpenClaude, escribe artefactos de perfil GPT y genera diagnosticos estructurados que explican que se ha hecho y por que.

El proyecto se organiza como un monorepo con un unico motor compartido y tres interfaces de usuario: `apps/web` (flujo de arrastrar y soltar en navegador), `apps/desktop` (flujo de escritorio con Tauri y selectores de archivos nativos) y `apps/vscode` (comando y webview de VS Code). El nucleo comun reside en `packages/migrate-core` (descubrimiento, transformacion, diagnosticos, manifiesto, checksums y generacion de archivo ZIP), `packages/schema` (tipos compartidos de ficheros, perfiles, eventos, diagnosticos, manifiestos y resultados), `packages/profile` (perfiles de modelo Claude/OpenClaude y GPT) y `packages/portable-io` (interfaces adaptadoras para navegador, Tauri y VS Code).

Es relevante para equipos que mantienen prompts, configuraciones de herramientas y flujos de agentes acoplados a una familia concreta de modelos y necesitan portarlos a otra sin reescribir el arbol de ficheros original. No hay informacion sobre parametros, contexto, cuantizacion, licencia o idiomas porque no se trata de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una herramienta de migracion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Naturaleza del repositorio | aplicacion de migracion de harness, version 0.1, enfoque "export only" |
| Autor | `smlflg` |
| Identificador | `smlflg/Harness_swap` |
| Fecha de creacion | 2026-09-16T19:21:19.000Z |
| Fecha de actualizacion | 2026-09-16T19:21:20.000Z |
| Descargas | 0 |
| Likes | 0 |
| Etiquetas declaradas | `region:us` |
| Pipeline declarado | no disponible |
| Componentes | `apps/web`, `apps/desktop` (Tauri), `apps/vscode`, `packages/migrate-core`, `packages/schema`, `packages/profile`, `packages/portable-io` |
| Comandos de verificacion | `pnpm test`, `pnpm check`, `pnpm build:web`, `pnpm build:vscode`, `pnpm dev:web` |
| Dependencia externa adicional | `cargo`, requerido para verificar o compilar `apps/desktop/src-tauri` |

## Arquitectura y entrenamiento

No aplica el concepto de arquitectura de red neuronal ni de entrenamiento: el repositorio no contiene pesos, dataset ni proceso de ajuste. Lo que la model card describe es una arquitectura de software en monorepo con separacion estricta entre nucleo y presentacion. Existe un unico backend/motor local compartido, y no tres implementaciones de migracion distintas. El motor se descompone en cuatro paquetes: `migrate-core` (descubrimiento de ficheros, transformacion, diagnosticos, manifiesto, checksums y empaquetado ZIP), `schema` (tipos compartidos para ficheros, perfiles, eventos, diagnosticos, manifiestos y resultados), `profile` (definiciones de perfil de modelo para Claude/OpenClaude y para GPT) y `portable-io` (interfaces adaptadoras que abstraen el anfitrion, ya sea navegador, Tauri o VS Code).

La innovacion tecnica declarada es la portabilidad del motor sobre multiples hosts manteniendo una sola implementacion de la logica de migracion, junto con un enfoque de exportacion conservadora: no se toca el arbol de origen, se generan artefactos de perfil GPT y se emiten diagnosticos que justifican cada decision tomada durante la transformacion. Los tests del nucleo se ejecutan con el stripping de TypeScript nativo de Node, lo que permite validar el pipeline compartido antes de instalar las dependencias de las interfaces. No se documentan datos de entrenamiento, numero de tokens, composicion de dataset ni tecnicas de RLHF/DPO, porque no existen en este proyecto.

## Capacidades

- Deteccion de suposiciones especificas de Claude/OpenClaude dentro de un harness seleccionado.
- Exportacion de un paquete de migracion orientado a GPT a partir de ese harness, sin modificar la carpeta de origen.
- Generacion de un manifiesto y calculo de checksums sobre los artefactos producidos.
- Generacion de archivos ZIP como formato de entrega del paquete de exportacion.
- Emision de diagnosticos estructurados que explican que transformacion se aplico y por que.
- Perfiles de modelo diferenciados para Claude/OpenClaude y para GPT, gestionados desde `packages/profile`.
- Ejecucion local como caracteristica de diseno ("local-first"), sin dependencia declarada de servicios remotos.
- Tres superficies de uso equivalentes sobre el mismo motor: navegador con arrastrar y soltar, escritorio con Tauri y selectores nativos, y VS Code mediante comando y webview.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes, multilingueismo ni modo de pensamiento, por no tratarse de un modelo.

## Casos de uso

- Migracion de un harness de agentes entre familias de modelos: un equipo que tiene su configuracion, prompts y definiciones de herramientas acopladas a Claude/OpenClaude puede generar un paquete orientado a GPT y revisar el manifiesto y los diagnosticos antes de adoptarlo.
- Auditoria previa a una migracion: los diagnosticos estructurados permiten localizar exactamente que suposiciones dependientes del proveedor existen en el harness y cuales se han transformado.
- Estandarizacion interna multi-proveedor: al mantener un unico motor en `migrate-core`, la organizacion evita que cada interfaz (web, escritorio, IDE) implemente su propia logica de conversion y diverjan los resultados.
- Integracion en el flujo de trabajo diario del IDE: la extension de VS Code permite lanzar la exportacion desde el propio editor, sin salir del entorno donde vive el harness, y revisar la salida en una webview.
- Portabilidad de entornos con restricciones de red: el caracter local-first y el uso de herramientas locales (Node con stripping nativo de TypeScript, `cargo` para la parte Tauri) encajan en equipos que no pueden enviar su configuracion a servicios externos.
- Versionado y distribucion de configuraciones de agentes: el ZIP resultante, con manifiesto y checksums, sirve como artefacto verificable para almacenar en un repositorio o distribuir entre equipos.
- Verificacion automatizada en CI: los comandos `pnpm test`, `pnpm check` y los builds de web y VS Code permiten validar el pipeline compartido en integracion continua antes de instalar dependencias de UI.
- Generacion de paquetes de referencia para formacion interna: los diagnosticos explican las diferencias entre perfiles de modelo, lo que resulta util para documentar convenciones al cambiar de proveedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica. No hay inferencia de modelo, por lo que no se requiere GPU ni memoria de video.
- GPU recomendadas: ninguna. La herramienta es de proposito general y se ejecuta en CPU.
- Hardware minimo inferido de la pila tecnica: un equipo capaz de ejecutar Node.js y `pnpm` para el nucleo, las pruebas y la interfaz web; para el flujo de escritorio se requiere ademas la cadena de Rust y `cargo` para compilar `apps/desktop/src-tauri`.
- Espacio en disco: no disponible; depende del tamano del harness de origen y del paquete ZIP generado.
- Opciones de despliegue: ejecucion local mediante `pnpm` (`dev:web`, `build:web`, `build:vscode`); no se declaran contenedores, servicios gestionados ni despliegue en servidor.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de migracion, tamano de harness soportado ni rendimiento del empaquetado.
- Compatibilidad con GPU de consumo: no aplica, al no existir carga de inferencia.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje, de modo que la comparacion por parametros, longitud de contexto, rendimiento en benchmarks, licencia y disponibilidad no es aplicable, y la informacion proporcionada no incluye ninguna herramienta equivalente con la que contrastarlo.

## Limitaciones y advertencias

- La version 0.1 se limita a exportacion segura; no se declara soporte de importacion ni de ida y vuelta entre perfiles.
- No se especifica licencia en la informacion disponible, por lo que no puede confirmarse la viabilidad de uso comercial ni la redistribucion del codigo.
- No se declaran idiomas soportados, ni siquiera para la interfaz o la documentacion.
- Los resultados de busqueda web asociados no contienen ningun enlace relacionado con el proyecto: los enlaces devueltos corresponden a sitios de redes sociales sin vinculacion con Harness Swap, por lo que no aportan verificacion externa.
- El repositorio presenta 0 descargas y 0 likes, sin fecha de publicacion estable (creado y actualizado con un segundo de diferencia), lo que sugiere ausencia de validacion por parte de terceros.
- No hay informacion sobre cobertura de tests, versiones de Node o de Rust soportadas, ni sobre el formato exacto de los artefactos de perfil GPT generados.
- Al ser una herramienta de transformacion de configuraciones, existe riesgo de conversiones incompletas o incorrectas en harnesses con suposiciones no contempladas; el propio diseno mitiga esto con diagnosticos estructurados y checksums, pero no garantiza equivalencia funcional entre el harness original y el exportado.
- No se documenta ninguna politica de seguridad sobre los ficheros escaneados, mas alla de la afirmacion de ejecucion local.
- No hay informacion sobre sesgos, alucinacion o limites de contexto, por no existir componente de generacion de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/smlflg/Harness_swap
- Repositorio de codigo, paper, blog o demo: no disponible en la informacion proporcionada.
- Enlaces relevantes de la busqueda web: no disponible; los resultados obtenidos no guardan relacion con el repositorio.
