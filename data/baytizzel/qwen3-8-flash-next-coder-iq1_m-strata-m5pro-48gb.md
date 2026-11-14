# baytizzel/Qwen3.8-Flash-Next-Coder-IQ1_M-Strata-M5Pro-48gb

## Resumen

Este repositorio no contiene un modelo nuevo en sentido estricto, sino una *receta de despliegue* verificada para servir el modelo Qwen3.8-Flash-Next Coder en un Mac con Apple Silicon y 48 GB de memoria unificada. El autor, baytizzel, empaqueta una capa borrador MTP (multi-token prediction) cuantizada a Q2_0, un *pack* con los pesos densos, el índice de tensores, el tokenizador y la plantilla de chat, junto con scripts para descargar y verificar los pesos originales de ISTA-DASLab y compilar un *fork* sintonizado del motor Strata con soporte Metal.

El modelo base es Qwen/Qwen3.8-Flash-Next, una arquitectura MoE (mixture of experts) con 512 expertos enrutados por capa, de los cuales esta variante Coder conserva 256. Los pesos servidos son la cuantización IQ1_M del Coder publicada por ISTA-DASLab (GSQ-RCO), que no se redistribuye aquí: el script `fetch-upstream.sh` la descarga desde el repositorio original con revisión fijada y verificación sha256. La innovación principal es el *streaming* de expertos desde el SSD interno: el motor mantiene en una arena de RAM cableada los expertos más usados (9.081 de 12.288, con una tasa de acierto de 0,97) y lee el resto directamente del fichero GGUF.

La relevancia práctica es que permite ejecutar un modelo MoE de gran tamaño con ventanas de contexto de hasta 262.144 tokens en hardware de consumo (un MacBook Pro M5 Pro de 48 GB), con un rendimiento medido de 45,8 tok/s de decodificación media y 54,6 tok/s en código, manteniendo un uso de memoria de 27-30 GB. El repositorio en sí ocupa 2,4 GB y declara 2.607.150.848 parámetros en safetensors, un dato que no concuerda con el tamaño del modelo base descrito y que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.8-Flash-Next), con capa MTP nativa para decodificación especulativa |
| Parametros totales | 2.607.150.848 (dato del repositorio en safetensors); el modelo base completo no se especifica en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (probado a 64K, 128K y 262K) |
| Tipos de cuantizacion | IQ1_M (pesos del modelo objetivo, de ISTA-DASLab); Q2_0 (capa borrador MTP); referencia a una receta IQ3_S alternativa |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other"); el fork del motor Strata es MIT |
| Formato de pesos | GGUF (pesos originales descargados aparte, no redistribuidos); pack propietario de Strata con pesos densos, índice de tensores, tokenizador y plantilla de chat |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos enrutados por capa; esta variante Coder conserva 256 de ellos, lo que reduce el conjunto de pesos que el motor debe gestionar. Sobre esa base, el autor añade una capa de predicción multi-token (MTP) nativa del modelo Qwen original, empaquetada de forma independiente y cuantizada a Q2_0 para el motor Metal. El motor Strata implementa decodificación especulativa con ventana de verificación de 4 tokens (`--spec 4`) y un umbral `--spec-min-p 0.5` que cierra la ventana antes cuando la capa borrador no está segura, lo que según el autor aporta un +5,6 % sobre `--spec 4` sin umbral.

El entrenamiento del modelo base no se detalla en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es el proceso de cuantización: los pesos IQ1_M provienen de ISTA-DASLab con un esquema GSQ-RCO y poda de expertos, y se sirven sin modificar. La aportación técnica del repositorio es de infraestructura: lecturas de expertos directas sin caché, liberación de copias de pesos en host (~6,2 GB), arena cableada a medida que se llena, búferes de prompt dentro de la arena y un *keep-warm* de GPU mientras una ventana de decodificación espera al SSD. El *fork* del motor es `betizzel/Strata`, rama `m5pro-coder`, que parte de la rama IQ3_S más un commit con el soporte Metal de 256 expertos de upstream.

## Capacidades

- Generación de texto y código: el modelo está especializado en tareas de programación (variante Coder) y se ha medido con peticiones de código.
- Razonamiento multi-paso y agentes: la ventana de hasta 262.144 tokens permite mantener historiales largos y cadenas de razonamiento extensas.
- Decodificación especulativa nativa: la capa MTP genera hasta cuatro tokens borrador por paso, verificados por el modelo objetivo.
- Tool calling / function calling: no se documenta explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking*: no documentado en la información disponible.
- Visión y audio: no disponibles.
- Servicio con API compatible con OpenAI en `127.0.0.1:8092`, con carga del modelo en la primera petición.

## Casos de uso

- Asistencia de código en local sobre Mac: un desarrollador puede levantar el servidor en un MacBook Pro M5 Pro y consultar el modelo con la API compatible con OpenAI, sin enviar código a servicios externos. Los 54,6 tok/s medidos en código lo hacen viable para autocompletado y generación de funciones.
- Análisis de repositorios completos: con 262.144 tokens de contexto se puede volcar un conjunto amplio de ficheros fuente y documentación en un único prompt; el autor reporta una lectura de prompt de 244K tokens a ~670 tok/s.
- Refactorización y revisión de código en pipelines: el servidor local puede integrarse en scripts de CI o *pre-commit hooks* que envíen diffs y reciban sugerencias, siempre que el equipo trabaje sobre Apple Silicon.
- Prototipado de agentes de código: la ventana larga y la decodificación especulativa permiten iteraciones multi-paso (leer, editar, verificar) sin recargar contexto entre pasos.
- Evaluación de cuantizaciones extremas: investigadores pueden comparar IQ1_M frente a IQ3_S sobre el mismo modelo base usando las dos recetas publicadas por el mismo autor, con el mismo motor y hardware.
- Docencia y experimentación con MoE y *streaming* de expertos: el repositorio incluye el perfil de expertos, la configuración de arena y los resultados, lo que permite reproducir y modificar el esquema de caché en un entorno controlado.
- Despliegue *offline* en entornos con requisitos de privacidad: al no requerir conexión tras la descarga inicial, encaja en escenarios donde los datos no pueden salir de la máquina.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Decodificación media | 45,8 tok/s | MacBook Pro M5 Pro, 48 GB, suite del autor |
| Decodificación en código | 54,6 tok/s | misma máquina, petición de código |
| llama.cpp, misma petición de código | 44,9 tok/s | con el modelo completo residente, presión de memoria crítica |
| Lectura de prompt de 244K tokens | ~670 tok/s | ventana completa |
| Ventana de decodificación de 4 tokens | ~62 ms | con aciertos de arena de 0,97 |
| Memoria en uso | 27-30 GB | presión de memoria normal |
| Mejora de `--spec-min-p 0.5` | +5,6 % | frente a `--spec 4` sin umbral |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Apple Silicon obligatorio; probado en MacBook Pro M5 Pro con 48 GB de memoria unificada. Con menos memoria, la arena de expertos es menor y la decodificación más lenta.
- Espacio en SSD interno: ~61 GB libres (58,4 GB de pesos del modelo más 2,4 GB del repositorio). No se genera *sidecar* de expertos.
- Arena de expertos configurable con `STRATA_METAL_ARENA_MAX_GB=20`, que cubre 9.081 de 12.288 expertos.
- Perfil de expertos obligatorio: `STRATA_METAL_EXPERT_PROFILE=<engine>/data/expert-profile-coder.bin`; el perfil por defecto (512 expertos) se rechaza para este modelo.
- Dependencias de compilación: Xcode Command Line Tools, `cmake`, `ninja` y el CLI `hf`.
- Despliegue: motor Strata (app o instalación de Terminal 0.1.54) o el paquete `serve/` del *fork*; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta receta (llama.cpp solo aparece como referencia comparativa).
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; el motor es exclusivo de Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Coder IQ1_M (esta receta) | 2.607.150.848 según repo; base no especificado | 262.144 | IQ1_M + MTP Q2_0 | qwen-community-license-1.0 | GGUF vía descarga desde ISTA-DASLab |
| Qwen3.8-Flash-Next IQ3_S (receta del mismo autor) | no disponible | hasta 262.144 (probado) | IQ3_S | qwen-community-license-1.0 | GGUF, misma máquina objetivo |
| Qwen/Qwen3.8-Flash-Next (base sin cuantizar) | no disponible | 262.144 | safetensors/BF16 presumiblemente | qwen-community-license-1.0 | Hugging Face |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización IQ1_M extremadamente agresiva: la pérdida de calidad frente al modelo base no se cuantifica en la información disponible; conviene validar en la tarea concreta antes de usar en producción.
- El repositorio no redistribuye los pesos: la receta depende de que ISTA-DASLab mantenga disponible la revisión fijada; si desaparece, el *script* de descarga falla.
- Dependencia de un *fork* no oficial del motor Strata (rama `m5pro-coder`), con soporte de 256 expertos en Metal que upstream no había probado de extremo a extremo.
- Exclusivo de Apple Silicon y macOS: no hay ruta documentada para GPU NVIDIA, AMD ni CPU x86.
- El uso de 27-30 GB sobre 48 GB deja margen limitado; otras aplicaciones pueden provocar presión de memoria crítica, como ocurrió con llama.cpp en las pruebas del autor.
- El rendimiento medido (45,8 tok/s) corresponde a una única máquina y suite; no hay datos de latencia en otros modelos de Mac.
- Sesgos, riesgo de alucinación y cobertura idiomática: no documentados en la información disponible.
- Licencia qwen-community-license-1.0: revisar las condiciones de uso comercial del modelo base antes de desplegarlo en producto; el *fork* del motor es MIT, pero eso no cubre los pesos.
- El dato de 2.607.150.848 parámetros del repositorio no es coherente con un MoE de 512 expertos y debe tratarse como referencia del artefacto empaquetado, no del modelo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baytizzel/Qwen3.8-Flash-Next-Coder-IQ1_M-Strata-M5Pro-48gb
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta IQ3_S del mismo autor: https://huggingface.co/baytizzel/Qwen3.8-Flash-Next-IQ3_S-Strata-M5Pro-48gb
- Motor Strata (upstream): https://github.com/Niko1221/Strata
- Fork del motor: https://github.com/betizzel/Strata (rama `m5pro-coder`)
- Resultados de la receta: `results/RESULTS.md` dentro del repositorio
