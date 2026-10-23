# elyanlabs/can-it-run-ai

## Resumen

`elyanlabs/can-it-run-ai` no es un modelo de IA: es un repositorio de código publicado en Hugging Face como espejo (snapshot) del proyecto [github.com/Scottcjn/can-it-run-ai](https://github.com/Scottcjn/can-it-run-ai), mantenido por Elyan Labs LLC. Su contenido es una aplicación web estática y un conjunto de datos JSON (`docs/leaderboard.json`) que alimentan un ranking comunitario de ejecuciones reales de inferencia de IA sobre hardware antiguo o exótico. El repositorio no incluye pesos, tokenizador, configuración de modelo ni pipeline de inferencia; la propia model card lo indica de forma explícita: "Code only: nothing here runs on Hugging Face infrastructure".

El problema que aborda es la verificación de afirmaciones sobre inferencia en silicio no convencional. Cada entrada del leaderboard exige pruebas (vídeo sin cortes de arranque a salida, o logs en bruto con sumas sha256 del binario y del fichero del modelo), una sección de limitaciones honestas y el etiquetado claro de ejecuciones emuladas frente a ejecuciones nativas. Los envíos fallidos también se registran, en una sección propia, como resultados negativos.

Es relevante ahora porque documenta de forma trazable qué es posible con presupuestos de cómputo mínimos: desde un transformer de 819K parámetros generando texto en una Nintendo 64 hasta `llama.cpp` sobre Macs PowerPC con Tiger y Leopard. El repositorio mantiene además un "Weird Hardware Hall of Fame" con primicias no reclamadas (Dreamcast, TI-83, PlayStation 1, C64, Transputer). Para un desarrollador o investigador, el interés no está en el modelo —no existe— sino en la metodología de verificación y en el catálogo de configuraciones reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de IA. Repositorio de código (sitio estático + leaderboard JSON) para catalogar inferencia sobre hardware antiguo y exótico |
| Parametros totales | No aplica (no contiene pesos de modelo) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible como artefacto propio; las entradas del leaderboard referencian modelos externos ejecutados con `llama.cpp` (formato GGUF) y transformers pequeños |
| Idiomas soportados | No disponible (el contenido del repositorio está redactado en inglés) |
| Licencia | AGPL-3.0 (Copyright (C) 2026 Elyan Labs LLC) |
| Formato de pesos | No contiene pesos. El repositorio se distribuye como código fuente y JSON de datos |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio, por lo que las secciones habituales de datos de entrenamiento, número de tokens, composición del dataset y ajuste (RLHF/DPO) no aplican. El "artefacto" técnico es una aplicación estática: el sitio publicado en GitHub Pages se genera a partir de `docs/leaderboard.json`, y las entradas verificadas se incorporan simultáneamente a ese JSON y a `LEADERBOARD.md`.

La innovación metodológica está en el protocolo de verificación, no en el código de inferencia. Se exige hardware real o emulación etiquetada honestamente como tal; prueba mediante vídeo sin editar de arranque a salida y/o logs en bruto con sumas sha256 del binario y del modelo; y una sección obligatoria de limitaciones que declare qué no demuestra la demo (modelo diminuto, prompt escogido a dedo, peculiaridades del emulador, throttling térmico). La metodología de verificación se apoya explícitamente en el trabajo de fingerprinting de hardware de RustChain para distinguir silicio vintage real de emulación, basándose en comportamiento temporal, características de caché y autodeclaración del entorno emulado.

## Capacidades

- Publicación de un leaderboard comunitario de inferencia real sobre hardware antiguo, con estados diferenciados de entrada (verificada, pendiente, disputada).
- Registro de resultados negativos: los intentos fallidos se documentan en su propia sección en lugar de descartarse.
- Distinción explícita entre ejecución nativa y ejecución emulada, con retirada de entradas que presenten emulación como hardware real.
- Verificación criptográfica de envíos: sumas sha256 del binario y del fichero del modelo, más logs en bruto.
- Catálogo de configuraciones reproducibles: casos documentados de `llama.cpp` en PowerPC (Mac OS X Tiger y Leopard) y de un transformer de 819K parámetros generando texto en Nintendo 64.
- "Weird Hardware Hall of Fame": lista de primicias no reclamadas (Dreamcast, TI-83, PlayStation 1, C64, Transputer) que actúa como backlog de objetivos.
- Flujo de contribución basado en issues con plantilla (`submission.yml`) que solicita máquina, año, CPU, RAM, qué se ejecutó, velocidad, enlaces de prueba, checksums y limitaciones.
- Proceso de corrección abierto: cualquier entrada puede impugnarse mediante issue y se marca como disputada mientras se resuelve.

## Casos de uso

- **Verificación de afirmaciones en retrocomputación con IA**: un investigador puede contrastar si una demo de inferencia en un Amiga o un PowerPC es real consultando los checksums y los vídeos aportados, en lugar de fiarse de una captura de pantalla.
- **Preservación técnica documentada**: el repositorio conserva combinaciones concretas de binario, modelo y máquina que funcionaron, lo que permite reproducir el experimento años después con las mismas versiones.
- **Docencia y divulgación**: el formato de envío obliga a declarar limitaciones, lo que lo convierte en material útil para enseñar metodología experimental y comunicación honesta de resultados en informática.
- **Benchmarking de inferencia en CPU sobre silicio no soportado**: quien quiera ejecutar modelos pequeños en arquitecturas como PowerPC dispone de casos de referencia con `llama.cpp` como runtime.
- **Investigación sobre fingerprinting de hardware**: la metodología de distinción entre silicio real y emulación (timings, caché) sirve como base para trabajos de atestación en sistemas sin TPM.
- **Planificación de proyectos de hardware límite**: el "Hall of Fame" de primicias no reclamadas permite a un equipo elegir un objetivo concreto (por ejemplo, Dreamcast o TI-83) y saber de antemano que nadie ha publicado una entrada verificada.
- **Comunidad y revisión por pares informal**: el flujo de issues con estados pendiente/disputada/verificada ofrece un modelo de gobernanza ligera replicable en otros proyectos de benchmarks abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no evalúa ningún modelo propio ni reporta métricas agregadas de MMLU, HumanEval o GSM8K. Los únicos datos de rendimiento son los que cada entrada del leaderboard declara para su hardware concreto (velocidad de generación), y no se han proporcionado en la información disponible las cifras numéricas de esas entradas.

## Requisitos de hardware

- **VRAM para inferencia**: no aplica. El repositorio no contiene un modelo que ejecutar; el visor del leaderboard es un sitio estático que se sirve desde GitHub Pages.
- **GPU recomendadas**: no aplica para el repositorio. Las entradas del leaderboard, por definición, se centran en CPU y silicio no convencional (por ejemplo, PowerPC con `llama.cpp`).
- **Hardware consumer**: el código del repositorio se puede clonar y servir en cualquier máquina capaz de ejecutar un servidor de ficheros estáticos; no requiere acelerador.
- **Opciones de despliegue**: publicación como sitio estático (GitHub Pages es el mecanismo usado por el proyecto). Para los modelos referenciados en las entradas, el runtime citado es `llama.cpp` con pesos GGUF.
- **Latencia y throughput**: no disponible. Dependen por completo del hardware de cada entrada y no se han facilitado cifras agregadas.

## Comparativa con modelos similares

| Proyecto | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elyanlabs/can-it-run-ai | Leaderboard comunitario + código de sitio estático | No aplica | No aplica | AGPL-3.0 | Hugging Face, GitHub, GitLab |
| `llama.cpp` (runtime citado en las entradas) | Motor de inferencia en C/C++ | No aplica (ejecuta modelos de terceros) | Depende del modelo cargado | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de información sobre otros leaderboards de inferencia en hardware vintage con los que establecer una comparación cuantitativa; por tanto, la comparativa con alternativas de la misma categoría se considera no disponible.

## Limitaciones y advertencias

- **No es un modelo**: cualquier intento de cargarlo con `transformers`, `vLLM` o `llama.cpp` fallará; no hay pesos, tokenizador ni `config.json` de modelo.
- **Sin pipeline declarado**: el campo `pipeline` de Hugging Face figura como no disponible, coherente con la naturaleza del repositorio.
- **Idioma**: el contenido está redactado en inglés; no se declaran idiomas soportados y no hay funcionalidad multilingüe.
- **Licencia AGPL-3.0**: copyleft fuerte. El uso en red de versiones modificadas obliga a ofrecer el código fuente a los usuarios del servicio; conviene revisarlo antes de integrarlo en productos propietarios o servicios SaaS.
- **Verificación dependiente de mantenedores**: el propio proyecto reconoce que solo se verifica "lo que se puede verificar" (checksums, logs, vídeo). La reproducibilidad de las entradas depende de que los enlaces de prueba sigan vivos.
- **Riesgo de sobreafirmación en las entradas**: mitigado por el requisito de limitaciones honestas y el estado "disputed", pero no eliminado; una demo de un modelo de 819K parámetros no es representativa de la utilidad práctica de la IA en ese hardware.
- **Emulación**: las ejecuciones emuladas son aceptadas si se etiquetan como tales, de modo que parte del catálogo no demuestra rendimiento nativo.
- **Metadatos de Hugging Face inconsistentes**: el repositorio figura con 0 descargas y 0 likes, y con fecha de creación registrada el 2026-10-23, posterior a la fecha habitual de consulta; conviene tratar esos campos con cautela.
- **Sin soporte de la infraestructura de Hugging Face**: la model card advierte que nada del repositorio se ejecuta en la infraestructura de la plataforma; es un espejo de código.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/can-it-run-ai
- Repositorio GitHub: https://github.com/Scottcjn/can-it-run-ai
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/can-it-run-ai
- Leaderboard en vivo: https://scottcjn.github.io/can-it-run-ai/
- Página de museo: https://elyanlabs.ai/can-it-run-ai.html
- Datos del leaderboard: https://github.com/Scottcjn/can-it-run-ai/blob/main/docs/leaderboard.json
- Leaderboard en Markdown: https://github.com/Scottcjn/can-it-run-ai/blob/main/LEADERBOARD.md
- Guía de contribución: https://github.com/Scottcjn/can-it-run-ai/blob/main/CONTRIBUTING.md
- Metodología de fingerprinting de hardware (RustChain): https://rustchain.org/proof-of-antiquity.html
