# AIPRIVATEGROUP/ul-t3-plant

## Resumen

El repositorio `AIPRIVATEGROUP/ul-t3-plant` no contiene un modelo de inteligencia artificial, sino un paquete de despliegue orientado a la mineria de criptomonedas. Se trata de un bundle autocontenido que automatiza la instalacion y persistencia de mineros de Pearl (algoritmo `pearlhash`) en un host con GPU, incluyendo binarios de terceros como PeakMiner 2.20.8 y SRBMiner-MULTI 3.8.8, scripts de instalacion, verificacion de stratum y capas de persistencia via systemd, cron y hooks de shell.

El autor lo describe como un kit que lleva un host GPU desde el acceso inicial hasta un minero operativo con cuatro capas independientes de persistencia, con idempotencia garantizada mediante un registro (`plant_registry.json`) y un fichero argv canonico que evita la deriva entre los distintos mecanismos de arranque. El tamano del repositorio es de 0,1 GB, coherente con la inclusion de binarios x86_64 y scripts, no con pesos de modelo.

No se dispone de informacion sobre arquitectura de red neuronal, parametros, contexto, licencia, idiomas ni benchmarks. Cualquier dato de esa naturaleza debe considerarse no disponible. La ficha se limita a documentar lo que el repositorio declara y a senalar las advertencias relevantes para su evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un bundle de despliegue de mineros) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene binarios x86_64 y scripts shell/Python) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Su estructura interna es un conjunto de scripts de orquestacion (`deploy.sh`, `verify_stratum.py`, `lib/*.sh`, `lib/*.py`) que coordinan la instalacion de dos mineros (`bin/peakminer` y `bin/SRBMiner-MULTI`) y su persistencia mediante cuatro capas: unidad systemd con `Restart=always` y `RestartSec=30`, lineas cron (`@reboot` y keepalive cada 5 minutos), hooks en `bashrc`/`profile`/`zshrc` y un respawn desde la linea de comandos viva gestionado por `keep.sh` con `flock`.

El diseno declara idempotencia mediante un registro (`plant_registry.json`) indexado por host y worker, con estados `planted`/`deploying` y una ventana de 24 horas para evitar reinstalaciones. El estado `planted` solo se escribe cuando el pool reporta la fila del worker con `valid >= 1`. Tambien incluye un limitador de recursos (`lib/cap.sh`) que fija el consumo entre el 60 y el 75 por ciento (potencia de GPU al 70 por ciento, objetivo de ventilador a 74 C, parada/arranque termico a 80/70 C, presupuesto de hilos de CPU al 65 por ciento de `nproc`) y un guardia (`miner_guard.sh`) que pausa y reanuda el minero con SIGSTOP/SIGCONT segun carga y temperatura.

## Capacidades

- Instalacion desatendida de mineros Pearl en hosts GPU x86_64 mediante `deploy.sh`.
- Verificacion de handshake stratum en vivo (`verify_stratum.py`) con escritura de evidencias.
- Inventario de GPU (`lib/gpu_detect.py`) que reporta dispositivo, modelo, VRAM, tier y orquestacion en JSON.
- Seleccion de binario entre PeakMiner y SRBMiner-MULTI, con failover TLS/TCP en una escalera de pools (sg, eu, us, hk, ae en `:8048` TLS y `:7048` plano).
- Persistencia en cuatro capas independientes (systemd, cron, hooks de shell y keepalive con `flock`).
- Limitacion de recursos y proteccion termica/de carga con pausa y reanudacion automaticas.
- Modo `--dry-run` para calcular argv y reclamar registro sin instalar, y `--self-test` con inventario sintetico de 8 GPU.
- Etiquetado de worker con el formato `ul-t<LANE>-<ip-dash>-g<N>`.

## Casos de uso

- Aprovisionamiento de hosts GPU para mineria Pearl: `deploy.sh` instala el minero, configura la escalera de pools y deja el sistema persistente sin intervencion manual, adecuado para flotas homogeneas.
- Verificacion de conectividad antes de produccion: `verify_stratum.py` comprueba transporte y dialecto de autenticacion contra la escalera de pools y deja transcripciones en `evidence/`.
- Gestion termica en entornos con refrigeracion limitada: `miner_guard.sh` pausa el minero cuando la carga supera 0,85 y lo reanuda por debajo de 0,65, y aplica la ventana termica 80/70 C.
- Despliegue en hosts sin privilegios de root: las unidades systemd se instalan como unidades de usuario cuando no hay root, y los hooks de shell se colocan en los ficheros de perfil del usuario.
- Auditoria de idempotencia: `plant_registry.json` permite saber que hosts estan en estado `planted`, `deploying` o `SKIP` en una ventana de 24 horas.
- Inventario de hardware para planificacion de capacidad: `lib/gpu_detect.py` genera JSON con modelo, VRAM y tier de cada GPU, util para decidir cuantas instancias desplegar por host.
- Pruebas en seco en CI o laboratorio: `--dry-run` y `--self-test` permiten validar argv y flujo sin instalar binarios ni contactar con pools reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de hash rate, latencia ni throughput, y al no ser un modelo de IA no aplican MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- Host x86_64 con una o varias GPU; los binarios incluidos son `x86_64` (PeakMiner 2.20.8 y SRBMiner-MULTI 3.8.8).
- VRAM estimada: no disponible. Depende del algoritmo `pearlhash` y del minero, no documentado en la informacion proporcionada.
- GPU recomendadas: no disponible. El kit incluye deteccion de dispositivo, modelo y VRAM, pero no publica una lista de GPU soportadas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: systemd (unidad de usuario o de sistema), cron, hooks de shell y keepalive propio. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponible.
- Presupuesto de recursos declarado: potencia de GPU al 70 por ciento, intensidad SRBMiner 22, hilos de CPU al 65 por ciento de `nproc`, ventana termica 80/70 C y objetivo de ventilador 74 C.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos de IA ni bundles comparables de la misma categoria. El repositorio no es un modelo y no admite comparacion en parametros, contexto, rendimiento ni licencia con modelos de lenguaje.

## Limitaciones y advertencias

- El repositorio no es un modelo de IA: no debe evaluarse como tal ni incluirse en catalogos de modelos.
- No se declara licencia. El uso, redistribucion o modificacion del bundle y de los binarios de terceros (PeakMiner, SRBMiner-MULTI) queda sin marco legal explicito en la informacion disponible; verificar las licencias de cada binario antes de cualquier uso.
- Los binarios incluidos son de terceros y se distribuyen sin hashes publicados en la model card; el kit genera hashes en `evidence/`, pero no se aportan valores de referencia para verificarlos.
- La mineria de criptomonedas puede incumplir los terminos de servicio de proveedores cloud y las politicas de uso aceptable de muchas plataformas; el despliegue en hosts ajenos sin autorizacion puede tener consecuencias legales.
- El diseno de persistencia en cuatro capas (systemd, cron, hooks de shell, keepalive) esta pensado para resistir reinicios y terminaciones, lo que dificulta la desinstalacion accidental o deliberada; revisar `plant_registry.json` y los marcadores de cada capa antes de desplegar.
- El estado `planted` solo se marca con `valid >= 1` en el pool, pero un proceso activo sin shares aceptadas permanece en `deploying`; no hay garantia de rentabilidad ni de que el pool acepte el worker.
- El failover a `pool.pearlhash.xyz:9000` solo se activa con `--allow-secondary` tras tres fallos consecutivos de la escalera Kryptex; el comportamiento ante pools no listados no esta documentado.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de contexto o idioma porque no aplican a este artefacto.
- La fecha de creacion del repositorio (2026-11-15) y el numero de descargas y likes (0) indican ausencia de validacion por parte de la comunidad; tratar como material no auditado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AIPRIVATEGROUP/ul-t3-plant
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este artefacto.
