# Snapkitty/sovereign-ide-extensions

## Resumen

El repositorio `Snapkitty/sovereign-ide-extensions` no contiene un modelo de inteligencia artificial, sino un conjunto de extensiones para Visual Studio Code desarrolladas por SnapKitty Collective. Estas extensiones integran el protocolo de gobernanza MAGMA y el estado en vivo de la cadena WORM (LEDGE) directamente en el editor, permitiendo sellar código, anclar decisiones y enrutar instrucciones de agentes sin salir de VS Code.

El proyecto se compone de dos extensiones principales: `magma-protocol`, que actúa como bus de comandos para sellar y anclar contenido a la cadena, y `sovereign-status`, que muestra el estado de la cadena en la barra de estado. Requiere una instancia de SnapKitty OS ejecutándose en `http://localhost:3000`. No se trata de un modelo de lenguaje, por lo que las especificaciones técnicas habituales de un LLM no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz en ingles) |
| Licencia | MIT (segun el README) |
| Formato de pesos | no disponible (codigo fuente TypeScript/JavaScript) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado. Se trata de extensiones de VS Code escritas en TypeScript que se comunican con una API REST local de SnapKitty OS. La arquitectura del proyecto se describe en el README: las extensiones envían peticiones a endpoints como `/api/labs/ledge/seal` y `/api/merkle/root` para sellar hashes SHA-256 de archivos o selecciones, y para consultar el estado de la cadena WORM. No hay datos de entrenamiento, pesos ni proceso de aprendizaje.

## Capacidades

- Sellado criptografico de selecciones de codigo o archivos completos mediante SHA-256, registrando el hash en la cadena WORM.
- Anclaje de decisiones y comandos de agentes a traves del protocolo MAGMA, con prefijos de nivel (SEAL, ANCHOR, FLUX, SENTINEL, VAULT, ORACLE, FORGE, NOVA, LOC).
- Autocompletado en el editor para comandos `§` y `$` con sugerencias de nivel y abreviaturas.
- Sellado automatico opcional al guardar archivos (`magma.sealOnSave`) y sellado de hashes de commits de git al hacer commit (`magma.sealOnCommit`).
- Visualizacion en la barra de estado del estado de la cadena (hash de cabeza, numero de bloque, agentes activos) con polling cada 30 segundos.
- Integracion con el runtime de agentes de SnapKitty OS (hasta 24 agentes) para enrutar instrucciones.

## Casos de uso

- Auditoria de codigo fuente: sellar cada version de un archivo en la cadena WORM permite verificar la integridad y trazabilidad de los cambios a lo largo del tiempo.
- Gobernanza de decisiones tecnicas: anclar decisiones de diseno o arquitectura mediante el comando `$anchor` para que queden registradas de forma inmutable.
- Automatizacion de despliegues: usar el nivel FORGE para enviar acciones de build o deploy desde el editor, integrando el flujo de trabajo en la cadena.
- Seguimiento de agentes de IA: monitorizar en la barra de estado el numero de agentes activos y el estado de la cadena, util para equipos que dependen de agentes autonomos.
- Registro de commits: sellar automaticamente cada hash de commit en LEDGE, creando un historial verificable de la actividad de desarrollo.
- Cumplimiento normativo: mantener un registro inmutable de que archivos fueron modificados, cuando y por quien, para auditorias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este proyecto no es un modelo de IA y no tiene metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: son extensiones de VS Code que se ejecutan en el proceso del editor.
- Requiere una instancia de SnapKitty OS accesible en `http://localhost:3000` (configurable via `magma.osUrl`).
- Necesita Node.js y npm para compilar las extensiones desde el codigo fuente.
- El consumo de recursos es minimo: polling de estado cada 30 segundos y envio de peticiones HTTP locales.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no contiene un modelo. Podria compararse con otras extensiones de VS Code para blockchain o gobernanza, pero no se dispone de datos de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza razonamiento. Cualquier expectativa de capacidades de LLM es incorrecta.
- Depende de una infraestructura externa: requiere SnapKitty OS ejecutandose localmente; sin el, las extensiones no funcionan.
- La cadena WORM y el protocolo MAGMA son proyectos de un colectivo especifico (SnapKitty Collective) y pueden no tener soporte amplio o estabilidad garantizada.
- El sellado automatico en cada commit puede generar una gran cantidad de transacciones en la cadena, lo que podria saturar el almacenamiento local.
- La licencia MIT permite uso comercial, pero el software depende de servicios y protocolos propietarios del colectivo.
- No hay informacion sobre seguridad de los endpoints locales ni sobre proteccion de datos sellados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-ide-extensions
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/sovereign-ide-extensions
- Repositorio sovereign-ide (kit completo): https://github.com/SNAPKITTYWEST/sovereign-ide
- LEDGE (cadena WORM): https://github.com/snapkittywest/ledge
- SnapKitty OS: https://collectivekitty.com
- Explorador de cadena: https://collectivekitty.com/labs/ledge
- Feed de honeypot: https://collectivekitty.com/labs/sentinel
