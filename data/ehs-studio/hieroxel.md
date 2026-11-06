# EHS-Studio/hieroxel

## Resumen

Hieroxel es un videojuego de mundo voxel infinito desarrollado en Rust sobre el motor Bevy 0.20, publicado por el usuario EHS-Studio en Hugging Face bajo licencia MIT. No se trata de un modelo de inteligencia artificial ni de una red neuronal: es un repositorio que contiene el codigo fuente y los recursos de un juego de exploracion y construccion por bloques, con generacion procedural de terreno y simulacion de un ecosistema "vivo" que evoluciona de forma autonoma.

El proyecto resuelve el problema de crear un mundo abierto persistente y cambiante sin intervencion del jugador: el terreno se genera de forma infinita alrededor del jugador mediante mapas de ruido, y un sistema de reglas de "random-tick" hace que la vegetacion crezca, se propague y muera, que la arena y la grava caigan, y que el musgo colonice las cuevas. Esto lo diferencia de otros clones de voxel mas estaticos, donde el mundo solo cambia por accion del jugador.

Es relevante en el contexto de la IA open source unicamente como referencia tecnica de ingenieria de sistemas procedurales y de renderizado eficiente: el mesher voraz con oclusion ambiental por vertice, el streaming de chunks en hilos de trabajo y el shader unico para todos los bloques son ejemplos de diseno que pueden inspirar herramientas de generacion de entornos sinteticos. No obstante, no contiene pesos, no es un modelo entrenado y no debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un videojuego en Rust con Bevy 0.20) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz de controles en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (codigo fuente en Rust, recursos procedurales) |

## Arquitectura y entrenamiento

No aplica en el sentido de modelos de lenguaje. La "arquitectura" del proyecto es un motor de juego estructurado en modulos: `world/terrain.rs` genera mapas de altura mediante ruido (continentes y montanas con crestas), define biomas, tuneles, cavernas, arboles, obeliscos del desierto, musgo de cueva y cristales de lumen; `world/mesher.rs` implementa un mesher voraz con oclusion ambiental por vertice y luz del cielo, con 8 bytes por vertice; `world/mod.rs` gestiona columnas de chunks, generacion y mallado en hilos de trabajo, ediciones y guardado; `world/living.rs` contiene las reglas de tick aleatorio que mantienen el mundo vivo; `render/voxel.wesl` es un unico shader economico para todos los bloques con array de texturas, oclusion ambiental, luz del cielo, niebla, olas de agua y plantas que se mecen; y `render/textures.rs` pinta proceduralmente cada textura de bloque al arrancar.

No hay datos de entrenamiento, tokens, RLHF ni DPO porque no existe entrenamiento alguno. La innovacion tecnica destacable es el sistema de mundo vivo basado en reglas estocasticas y el streaming de terreno infinito con generacion y mallado en segundo plano sobre hilos de trabajo, ademas de la pintura procedural de texturas que evita distribuir assets binarios.

## Capacidades

- Generacion procedural de terreno infinito con continentes, montanas con crestas, biomas (oceano, playa, llanura, bosque, desierto, tundra, picos), tuneles y cavernas.
- Simulacion de ecosistema vivo: propagacion de hierba, siembra de flores, crecimiento de plantones a arboles, enredaderas que descienden desde las copas, musgo que avanza por las cuevas, hojas que se marchitan cuando su tronco desaparece, y caida de arena y grava.
- Renderizado de voxels con mesher voraz, oclusion ambiental por vertice y luz del cielo.
- Shader unico con array de texturas, niebla, olas de agua y plantas que se mecen.
- Control de jugador en primera persona: movimiento, salto, sprint, vuelo, romper, colocar y recoger bloques, hotbar de 9 ranuras.
- Control del tiempo y del mundo vivo: acelerar el dia y la simulacion (tecla T), pausar o reanudar la simulacion (tecla G).
- Culling de cuevas conmutable para comparacion de rendimiento, distancia de vision ajustable, vsync y pantalla completa.
- Guardado persistente de mundos en `~/.local/share/hieroxel/worlds/` al salir y cada minuto.
- Herramientas de desarrollo: benchmark de tiempos de frame (`--bench SECONDS`), capturas de pantalla (`--screenshot FILE`), overlay de depuracion y ayuda de controles.
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modo thinking, al no ser un modelo de IA.

## Casos de uso

- Estudio de tecnicas de generacion procedural: el codigo de `world/terrain.rs` sirve como referencia para implementar mapas de altura con ruido, biomas y cavernas en otros proyectos de mundos abiertos.
- Referencia de mallado eficiente de voxels: el mesher voraz con oclusion ambiental por vertice y 8 bytes por vertice es un ejemplo practico para optimizar el consumo de memoria y el numero de triangulos en motores de bloques.
- Base para prototipos de simulacion de ecosistemas: las reglas de `world/living.rs` pueden adaptarse para experimentar con propagacion de vegetacion, sucesion ecologica o autómatas celulares sobre rejillas 3D.
- Generacion de entornos sinteticos para investigacion: el terreno infinito y los biomas pueden emplearse como escenarios de prueba para algoritmos de navegacion, perception o planificacion en agentes simulados.
- Aprendizaje del motor Bevy: el proyecto demuestra el uso de Bevy 0.20 con hilos de trabajo, shaders WESL y pintura procedural de texturas, util para desarrolladores que quieran aprender el ecosistema.
- Benchmarking de renderizado: la opcion `--bench SECONDS` y el culling de cuevas conmutable permiten medir el impacto de tecnicas de oclusion en el rendimiento de un motor voxel.
- Distribucion como aplicacion de escritorio en Linux: el script `install.sh` integra el juego en el menu de aplicaciones, lo que sirve de ejemplo de empaquetado de proyectos Rust con Bevy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una opcion de linea de comandos `--bench SECONDS` para medir tiempos de frame mientras se gira la camara, pero no se aportan cifras concretas de rendimiento en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no disponible; el proyecto usa Bevy 0.20 y un shader WESL, por lo que requiere una GPU compatible con Vulkan, Metal o DirectX 12 segun la plataforma de Bevy, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; no se indica si funciona en iGPU o en tarjetas de gama baja.
- Opciones de despliegue: compilacion nativa con `cargo run --release` o instalacion con `./install.sh` en Linux; no se mencionan contenedores, servicios en la nube ni otros formatos.
- Latencia y throughput estimados: no disponible; solo se indica que la primera compilacion tarda varios minutos porque compila todo Bevy.

## Comparativa con modelos similares

No disponible. Hieroxel no es un modelo de IA y no se han proporcionado alternativas comparables de juegos voxel en Rust con Bevy en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no tiene pesos, no se entrena, no genera texto ni codigo, y no debe evaluarse con metricas de modelos de lenguaje.
- Requisitos de plataforma: la compilacion esta pensada para Linux, con Rust, las librerias de sistema de Bevy y `clang` + `mold` para enlazado rapido; sin `mold` hay que borrar `.cargo/config.toml`.
- La primera compilacion es lenta (varios minutos) porque compila todo el motor Bevy.
- El repositorio tiene un tamano de 0.0 GB y cero descargas y likes, lo que sugiere un proyecto recien publicado o de muy baja difusion; no hay evidencia de mantenimiento continuo.
- La model card no documenta sesgos, alucinaciones ni limitaciones de contexto o idioma porque no aplican; la interfaz de controles esta en ingles.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no se ofrece garantia alguna sobre el software.
- El guardado de mundos se realiza al salir y cada minuto; una terminacion abrupta del proceso puede perder hasta un minuto de cambios.
- No se documentan requisitos minimos de hardware ni rendimiento esperado, lo que dificulta planificar su despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EHS-Studio/hieroxel
- Rust: https://rustup.rs
- Bevy (dependencias de sistema en `docs/linux_dependencies.md`): https://github.com/bevyengine/bevy
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
