# Jessedbrown/asolaria-asi-os

## Resumen

Asolaria ASI OS no es un modelo de lenguaje ni una red neuronal: es un front-end de sistema operativo escrito integramente en Rust que se compila desde el codigo fuente y se ejecuta en la maquina del usuario. El repositorio de HuggingFace `Jessedbrown/asolaria-asi-os` no contiene pesos, tokenizadores ni artefactos de inferencia, por lo que las categorias habituales de esta ficha (parametros, contexto, cuantizacion) no son aplicables y se marcan como no disponibles.

El proyecto sirve una interfaz de escritorio a pantalla completa en `http://127.0.0.1:4600`, con gestor de ventanas, barra de tareas, menu de inicio y una franja de estado que sondea demonios locales del denominado "fabric" Asolaria (kernel 8-byte-host en el puerto `:5088`, vault recall en `:4796`, bus en `:4947`, dashboard en `:4949`). Incluye aplicaciones como terminal real (cmd, PowerShell, WSL bash) sobre un emulador VT100/xterm propio con soporte ConPTY, monitor de sistema, buscador sobre un vault local y explorador de ficheros en solo lectura.

La relevancia del repositorio, si alguna, es la de servir de superficie de demostracion de un stack mas amplio (federation-1024, Hilbra, behcs-256) que si contiene motores ejecutables, aunque tampoco se trata de modelos de IA en el sentido convencional. La ficha se limita a describir lo que el autor publica, sin extrapolar capacidades de modelo que no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una aplicacion de sistema operativo en Rust) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; el artefacto es codigo fuente Rust) |
| Toolchain declarado | Rust 1.81.0 con clippy y rustfmt, fijado en `rust-toolchain.toml` |
| Dependencias externas | cero crates externos; solo `std` |
| Puerto de servicio | 127.0.0.1:4600 |
| Sistemas operativos | Linux, macOS y Windows (algunas funciones son especificas de Windows) |
| Fecha de creacion en HuggingFace | 2026-10-16 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

No existe entrenamiento. El artefacto es un programa Rust que compila con cargo y se ejecuta como proceso local. La unica "regla de toolchain" que el autor impone explicitamente es Rust 1.81 con clippy, con aritmetica entera y ternaria (trits) y prohibicion de `f32`/`f64` en `src/` y `tests/`, verificada en CI mediante `cargo clippy --all-targets -- -D warnings` y un grep que rompe la build si aparece punto flotante.

La arquitectura del sistema, segun la model card, se compone de una superficie de escritorio (gestor de ventanas, taskbar, tray, apps aisladas por ventana), un emulador de terminal VT100/xterm que renderiza consolas ConPTY reales con scrollback de 5.000 lineas y seleccion con Ctrl+Shift+C/V, y una capa de integracion con demonios locales que el usuario debe levantar por separado. El autor declara un principio de ejecucion pasiva: "E = 0", es decir, la interfaz solo lanza lo que el usuario escribe o pulsa, sin actividad autonoma.

## Capacidades

- Servir un escritorio web local en `http://127.0.0.1:4600` con gestor de ventanas movibles y redimensionables, ajuste a mitades, maximizado y minimizado.
- Lanzar terminales reales (cmd, PowerShell, WSL bash, o shell en Linux bare-metal) una por ventana, con sesion interactiva transmitida por Server-Sent Events y emulacion VT100/xterm.
- Ejecutar dentro de esas terminales cualquier programa de consola, incluidos `claude`, `codex`, `top` o `vim`.
- Sondeo de estado de demonios locales del fabric (host8 en `:5088`, recall en `:4796`, bus en `:4947`, dashboard en `:4949`) y encendido del tile correspondiente cuando responden.
- Busqueda en un vault local invertido mediante un endpoint `/api/recall` en modo solo lectura, con separacion por niveles (nivel 0 declarado libre de PII).
- Exploracion de ficheros en solo lectura via `/fs/list` y `/fs/read`, con rechazo de `..`, rutas absolutas y escapes por enlaces simbolicos, y limite de ficheros de texto de 1 MiB.
- Generacion de identidad local: `scripts/keygen` crea `~/.asolaria/recall.key` y un nombre de asiento local; la clave es secreto HMAC para Hilbra/recall y no sale de la maquina.
- Apertura de un entorno Windows (Windows Sandbox o escritorio anfitrion) embebido como ventana sobre Asolaria en hosts Windows.
- Autostart mediante unidad systemd, entrada `.desktop` y lanzador a pantalla completa en `deploy/`.
- No soporta: generacion de texto, razonamiento, codigo asistido, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Demostracion de un escritorio web local en Rust sin dependencias externas: util para evaluar como se implementa un gestor de ventanas, una taskbar y un sistema de apps aisladas usando unicamente `std`.
- Terminal remota o local autoalojada con multiples shells simultaneos: cada ventana abre su propia sesion ConPTY con emulacion VT100 completa, lo que permite trabajar con `vim`, `top` o TUIs sin cliente nativo.
- Panel de observabilidad de demonios locales: la franja de tiles refleja en tiempo real si el kernel, el vault o el bus estan arriba, sirviendo como sustituto ligero de herramientas de monitorizacion.
- Navegacion controlada de un corpus local: el endpoint `/fs/read` con saneamiento de rutas y limite de tamano funciona como visor seguro para inspeccionar ficheros de texto sin exponer el sistema de ficheros.
- Busqueda sobre vault personal con separacion por niveles de sensibilidad: el nivel 0 se declara libre de PII y el resto exige la clave local, lo que encaja en escenarios de gestion de documentos privados.
- Laboratorio de identidad criptografica local: el flujo keygen + HMAC sirve como ejemplo didactico de como generar y mantener un secreto que nunca circula por la red.
- Entorno de integracion para ejecutar agentes de linea de comandos (Claude, Codex) dentro de una sesion de terminal embebida, con la salvedad de que Asolaria no aporta el modelo subyacente.
- Base para un nodo de fabric experimental en Linux bare-metal con arranque a pantalla completa via systemd y lanzador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas tipo MMLU, HumanEval o GSM8K porque el artefacto no es un modelo de lenguaje. La model card menciona "latencia de framework en microsegundos" para el streaming de terminal, pero no aporta cifras verificables ni metodologia de medicion.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo. El consumo es el de un navegador y el proceso Rust.
- GPU: no requiere GPU dedicada. Funciona sobre cualquier CPU x86-64 o ARM que soporte la toolchain de Rust 1.81.
- Memoria RAM: no disponible en la documentacion; el binario se describe como "diminuto y autocontenido".
- Almacenamiento: no disponible; el limite conocido es el de ficheros de texto de hasta 1 MiB para el visor.
- Cabe en cualquier equipo de consumo: no depende de A100, H100 ni RTX 4090.
- Despliegue: compilacion desde fuente con `cargo`. Instaladores proporcionados: `scripts/install.sh` (Linux/macOS) y `scripts/install.ps1` (Windows). Modo nodo completo con `scripts/install-full-node.sh` / `.ps1`, que clona y compila federation-1024, Hilbra y behcs-256.
- Latencia y throughput: no disponibles como cifras contrastables. La model card afirma microsegundos a nivel de framework, sin detallar hardware ni carga.
- Requisito adicional relevante: la build declara no tocar la red.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque `Jessedbrown/asolaria-asi-os` no es un modelo de IA, sino una aplicacion de escritorio en Rust. Los repositorios con los que guarda relacion (asolaria-federation-1024, Hilbra, asolaria-behcs-256) pertenecen al mismo autor y al mismo stack, pero tampoco son modelos de lenguaje: son motores de kernel, transporte y sustrato de glifos respectivamente. Cualquier comparacion con LLM (Llama, Qwen, Mistral, DeepSeek) seria metodologicamente incorrecta.

## Limitaciones y advertencias

- El repositorio de HuggingFace no contiene pesos, tokenizador ni configuracion de inferencia; quien espere un modelo utilizable no lo encontrara aqui.
- La model card no declara licencia. Sin licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion.
- El autor reconoce explicitamente una "frontera honesta": solo la superficie del sistema operativo es ejecutable y completa. Los demonios recall, host8 y Hilbra son procesos separados que el usuario debe levantar por su cuenta; este repositorio no incluye sus binarios.
- Las ideas cosmologicas mas amplias del proyecto Asolaria se describen como documentadas pero acotadas, sin que se aporten artefactos verificables en este repositorio.
- El beneficio real depende de clonar y compilar repositorios externos del mismo autor, no auditados en esta ficha.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero si existe riesgo de que la descripcion del proyecto (fabric, ASI, soberania, rooms) induzca a expectativas de capacidades que el codigo no implementa.
- Idoneidad para produccion no establecida: sin licencia, sin tests de carga publicos, sin versionado semantico documentado y con 0 descargas y 0 likes en el momento de la consulta.
- El requisito de Rust 1.81 con prohibicion de punto flotante es una restriccion dura del proyecto: cualquier modificacion que introduzca `f32` o `f64` en `src/` o `tests/` rompe la build.
- La funcionalidad "Windows as a window" es no-op fuera de hosts Windows.
- No hay informacion sobre sesgos, idiomas o accesibilidad porque no existe modelo subyacente.

## Enlaces

- HuggingFace: https://huggingface.co/Jessedbrown/asolaria-asi-os
- Repositorio principal (segun la model card): https://github.com/JesseBrown1980/asolaria-asi-os
- asolaria-federation-1024: https://github.com/JesseBrown1980/asolaria-federation-1024
- Hilbra: https://github.com/JesseBrown1980/Hilbra
- asolaria-behcs-256: https://github.com/JesseBrown1980/asolaria-behcs-256
- Toolchain de Rust: https://rustup.rs
- Documentacion de nodo completo: `FABRIC-NODE.md` dentro del repositorio de GitHub
