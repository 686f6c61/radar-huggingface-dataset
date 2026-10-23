# ryugyosoft/onwx-music

## Resumen

onwx-music es una aplicación de escritorio de generación musical text-to-audio que ejecuta el modelo ACE-Step 1.5 turbo íntegramente en la NPU XDNA2 de los procesadores AMD Ryzen AI 300 / Max. La desarrolla el usuario ryugyosoft y se distribuye con licencia Apache-2.0 a través de HuggingFace. No es un modelo de pesos en sentido estricto: el repositorio contiene la aplicación, los instaladores y la integración con la NPU, mientras que los pesos (~4.3 GB) se descargan aparte desde la propia interfaz de la aplicación.

El objetivo es generar música local, sin GPU dedicada ni servicios en la nube, en un portátil o mini-PC con Ryzen AI. El pipeline completo —encoder de texto Qwen3-Embedding-0.6B, encoder de letras, DiT de 24 capas con muestreador de 8 pasos y decodificador VAE— se ejecuta en la NPU; la CPU solo realiza tokenización, generación de ruido y escritura de WAV. En un Ryzen AI Max+ 395 se declaran unos 19 segundos para producir 30 segundos de audio.

La relevancia actual está en dos frentes: por un lado, llevar la difusión de audio a un acelerador integrado de bajo consumo, con un pico de memoria de ~4 GB durante la generación y ~2 GB en reposo; por otro, una interfaz tipo panel de sintetizador con modos GEN (una pista), BGM (fondo musical infinito con crossfade), HISTORY, MODELS y SETUP. El proyecto es muy reciente (creado el 22 de octubre de 2026) y no registra descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión: encoder de texto Qwen3-Embedding-0.6B + encoder de letras + DiT de 24 capas (muestreador de 8 pasos en la variante turbo) + decodificador VAE |
| Parametros totales | no disponible (la model card no declara el recuento del modelo base; sí indica que el encoder de texto es Qwen3-Embedding-0.6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no es un modelo de contexto textual; duración de audio generable: 10 a 600 segundos por petición |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ja, en (texto de la interfaz también en zh-Hans; el prompt de estilo está entrenado en inglés) |
| Licencia | Apache-2.0 para el repositorio; licencia de los pesos de ACE-Step 1.5 turbo: no disponible en la información proporcionada |
| Formato de pesos | no disponible; la descarga desde la aplicación ocupa aproximadamente 4.3 GB |
| Plataforma de ejecución | NPU AMD XDNA2 (Ryzen AI 300 / Max), driver NPU, Windows 11; Ubuntu (amdxdna + XRT) implementado pero no probado |
| Memoria en generación | ~4 GB de pico, ~2 GB en reposo (memoria del sistema, no VRAM dedicada) |
| Motores disponibles | `npu` (por defecto), `cpu` (código oficial de ACE-Step 1.5) y `dummy` (sin modelo, para desarrollo) |
| Determinismo | misma semilla y mismos ajustes producen la misma pieza |
| Repositorio | 0.0 GB (los pesos no se alojan en el repositorio) |

## Arquitectura y entrenamiento

onwx-music no entrena un modelo propio: es una implementación de inferencia y una aplicación de escritorio sobre ACE-Step 1.5 turbo. El pipeline de generación encadena cuatro componentes que se ejecutan todos en la NPU: el encoder de texto Qwen3-Embedding-0.6B, un encoder de letras, un transformer de difusión (DiT) de 24 capas con un muestreador de 8 pasos, y un decodificador VAE que produce la forma de onda. La CPU queda relegada a la tokenización del prompt, la generación del ruido inicial y la escritura del fichero WAV.

El autor indica que los pesos se cargan en la NPU solo mientras se usan, lo que explica la diferencia entre los ~4 GB de pico durante la generación y los ~2 GB en reposo. Los tiempos declarados en un Ryzen AI Max+ 395 son de aproximadamente 19 segundos para una pieza de 30 segundos, desglosados en 4 s de codificación, 10 s de difusión y 4.6 s de decodificación; para 120 segundos, la decodificación sola consume unos 17 segundos. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si ACE-Step 1.5 turbo empleó RLHF o DPO; esos detalles corresponden al modelo base y no se documentan aquí.

Sí se documenta una carencia relevante respecto al modelo original: ACE-Step 1.5 utiliza oficialmente un modelo de lenguaje denominado "5Hz LM" que reescribe el prompt antes de la generación, y onwx-music todavía no lo integra. Tampoco están implementadas la referencia de audio para fijar el timbre ni la continuación a partir de la pieza anterior. La aplicación sí añade infraestructura propia: pre-generación de la siguiente pieza mientras suena la actual, crossfade mediante Web Audio con dos búferes y curva de potencia constante (0 a 12 segundos), y un planificador de parada por número de piezas, horas transcurridas o espacio libre en disco.

## Capacidades

- Generación de música a partir de una descripción textual en inglés (género, instrumentos, ambiente, tipo de voz), con duración configurable entre 10 y 600 segundos.
- Control estructurado por parámetros además del prompt libre: tempo (BPM o AUTO), compás, tonalidad (o AUTO), modo mayor/menor, género, mood, instrumento principal, textura, época, producción y groove.
- Generación con voz cantada: selección de idioma de la letra y tipo de voz, con opción NONE para piezas instrumentales. La letra se introduce en un editor aparte, con una tecla que inserta `[Instrumental]`.
- Reproducibilidad por semilla: el modo LOCK fija un número de semilla y el modo RANDOM genera una nueva en cada pieza.
- Modo BGM de fondo infinito: genera y encadena piezas de forma continua, prepara la siguiente mientras suena la actual y las une con crossfade configurable.
- Historial persistente: cada pieza se guarda con sus parámetros en JSON, y se puede reutilizar la configuración, exportar a WAV o FLAC y borrar entradas.
- Gestión de modelos desde la interfaz: descarga, actualización, cancelación, borrado y carga de una carpeta local de modelos con prioridad sobre la descarga.
- Ejecución local sin conexión: no se envían prompts ni audio a servicios externos una vez descargado el modelo.
- Interfaz multilingüe (japonés, inglés y chino simplificado), con icono en la bandeja del sistema, arranque al iniciar sesión y comprobación de actualizaciones.
- Modo LAN para acceder a la aplicación desde otros equipos de la misma red.
- No incluye, según la información disponible: tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada ni modo "thinking". Es un generador de audio, no un modelo de lenguaje.

## Casos de uso

- **Música de fondo continua para streaming o creación de contenido**: el modo BGM genera piezas encadenadas con crossfade de 0 a 12 segundos y permite fijar un límite por número de piezas o por horas, de modo que una sesión larga de emisión no requiere intervención manual.
- **Maquetas musicales rápidas con letra**: un compositor puede fijar tempo, tonalidad, género y voz, escribir la letra en el editor y obtener una maqueta cantada en menos de 20 segundos para una pieza de 30 segundos, con la posibilidad de recuperar la configuración exacta desde el historial.
- **Producción por lotes con resultados reproducibles**: al ser determinista por semilla, un estudio puede archivar la semilla y los parámetros de una pieza aprobada y regenerarla idénticamente para una revisión posterior o para integrarla en un pipeline de exportación a WAV/FLAC.
- **Trabajo en equipos sin GPU dedicada**: portátiles y mini-PC con Ryzen AI 300 / Max pueden generar música con un pico de ~4 GB de memoria, sin depender de una tarjeta gráfica ni de cuotas de API en la nube.
- **Sonorización de vídeo, pódcast y prototipos de juegos**: la duración configurable de 10 a 600 segundos permite ajustar la pieza a la longitud de un clip o de un nivel, y la exportación directa a WAV o FLAC evita pasos intermedios.
- **Instalaciones interactivas y kioscos**: la interfaz está pensada como un panel físico, con ventana sin marco, modos conmutables por teclas y un modo LAN que permite controlar la aplicación desde otra máquina de la misma red.
- **Investigación sobre inferencia en NPU**: el proyecto sirve como referencia de implementación de un pipeline de difusión de audio completo (encoder de texto, encoder de letras, DiT y VAE) sobre XDNA2, con la posibilidad de comparar los motores `npu`, `cpu` y `dummy` en las mismas condiciones.
- **Entornos con requisitos de privacidad**: prompts y letras permanecen en la máquina, lo que encaja en contextos donde no se pueden enviar borradores creativos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo facilita tiempos de inferencia medidos en un equipo concreto (Ryzen AI Max+ 395), que se recogen a continuación como datos de rendimiento y no como comparación de calidad:

| Medición | Valor declarado |
|---|---|
| Pieza de 30 s: tiempo total | ~19 s |
| Pieza de 30 s: codificación | 4 s |
| Pieza de 30 s: difusión | 10 s |
| Pieza de 30 s: decodificación | 4.6 s |
| Pieza de 120 s: decodificación | ~17 s |
| Pieza de 120 s: tiempo total | no disponible |
| Memoria en generación (pico) | ~4 GB |
| Memoria en reposo | ~2 GB |
| Pasos de difusión (turbo) | 8 |

A partir de los datos de 30 segundos se deduce una velocidad de generación de aproximadamente 1.6 veces el tiempo real en ese hardware, aunque el cálculo no está confirmado por el autor para otras duraciones. No hay cifras de latencia para el motor `cpu` ni para Ubuntu.

## Requisitos de hardware

- **NPU**: AMD Ryzen AI 300 o Ryzen AI Max con NPU XDNA2, más el driver de NPU correspondiente. Es el único acelerador soportado de forma documentada.
- **Sistema operativo**: Windows 11 como plataforma de referencia. La variante Ubuntu (amdxdna + XRT) está implementada pero el autor indica que no la ha probado.
- **Memoria**: 16 GB de RAM como mínimo recomendado; el modelo ocupa ~4.3 GB en disco y ~4 GB de memoria en el pico de generación.
- **GPU dedicada**: no se documenta ninguna ruta CUDA ni ROCm. No hay datos sobre si el motor `cpu` aprovecha aceleración por GPU.
- **GPU de consumo**: el diseño no apunta a GPU de consumo; el objetivo es la NPU integrada. Para equipos sin XDNA2 queda el motor `cpu`, cuya velocidad no se cuantifica en la información disponible.
- **Despliegue**:
  - Windows: `irm https://huggingface.co/ryugyosoft/onwx-music/resolve/main/install.ps1 | iex` (instala en `%LOCALAPPDATA%\onwx-music`), o `setup.bat` / `start.bat` en una copia local del repositorio.
  - Ubuntu: `curl -fsSL https://huggingface.co/ryugyosoft/onwx-music/resolve/main/install.sh | bash`, o `./setup.sh` / `./start.sh`.
  - Modo servidor local para desarrollo: `python -m onwx_music serve --engine dummy --open`, con la interfaz en `http://127.0.0.1:8110/`. La variable `ONWX_MUSIC_HOME` permite cambiar la carpeta de configuración.
- **Latencia y throughput**: ~19 s para 30 s de audio y ~17 s de decodificación para 120 s, en Ryzen AI Max+ 395. No hay datos de throughput para otros equipos ni para el motor `cpu`.
- **Almacenamiento**: conviene reservar espacio para el modelo (~4.3 GB) y para el historial; la aplicación puede detenerse automáticamente cuando el espacio libre baja del umbral configurado (2 GB por defecto).

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre esos proyectos y no se han verificado contra sus model cards en esta ficha; conviene contrastarlos antes de tomar una decisión.

| Modelo | Parámetros | Duración de audio | Ejecución | Licencia | Notas |
|---|---|---|---|---|---|
| onwx-music (ACE-Step 1.5 turbo) | no disponible | 10 a 600 s | NPU AMD XDNA2; motor CPU alternativo | Apache-2.0 (repo); pesos: no disponible | Aplicación de escritorio completa con BGM infinito e historial; sin planificador LM |
| ACE-Step 1.5 (oficial) | no disponible | no disponible | GPU (no especificado en esta ficha) | no disponible | Incluye el modelo "5Hz LM" que reescribe el prompt y funciones no implementadas en onwx-music |
| Stable Audio Open | ~1.1 B | hasta ~47 s | GPU | Stability AI Community License | Orientado a samples y bucles cortos; licencia con restricciones comerciales |
| MusicGen (Meta) | 300 M / 1.5 B / 3.3 B | hasta ~30 s | GPU | pesos CC-BY-NC 4.0 | Sin voz cantada; pesos no aptos para uso comercial |

La diferencia principal de onwx-music frente a las alternativas no está en la calidad musical, que no se puede evaluar con los datos disponibles, sino en el soporte de una duración mucho mayor (hasta 600 segundos), la ejecución sobre NPU integrada y el empaquetado como aplicación con modo de fondo continuo.

## Limitaciones y advertencias

- **Prompt en inglés**: el autor advierte que ACE-Step 1.5 se entrenó con descripciones en inglés y que prompts largos en japonés producen resultados alejados de la intención. La recomendación es fijar el estilo con los controles y añadir solo lo que falte en inglés.
- **Cobertura de géneros desigual**: se señalan R&B, pop en inglés, jazz y lo-fi como géneros con buenos resultados, y se reconoce explícitamente que hay estilos en los que el modelo rinde peor. No se detallan cuáles.
- **Funciones ausentes**: no hay planificador de estructura musical (el "think" oficial basado en el modelo "5Hz LM"), ni referencia de audio para fijar el timbre, ni continuación a partir de la pieza anterior. La ausencia del planificador afecta a la coherencia estructural de las piezas largas.
- **Licencia de los pesos**: el repositorio es Apache-2.0, pero los pesos de ACE-Step 1.5 turbo se descargan por separado y su licencia no se indica en la información disponible. Es un punto a verificar antes de un uso comercial, igual que los derechos sobre el audio generado en la jurisdicción correspondiente.
- **Validación comunitaria nula**: 0 descargas y 0 likes en HuggingFace, con el repositorio creado y actualizado el mismo día. No hay evidencia externa de calidad ni de estabilidad en producción.
- **Superficie de seguridad**: la instalación recomendada ejecuta un script remoto directamente (`irm ... | iex` en Windows, `curl ... | bash` en Ubuntu). El modo LAN no tiene autenticación, según advierte el propio autor, y solo debería activarse en redes de confianza.
- **Dependencia de plataforma**: requiere Windows 11 y driver de NPU XDNA2. La ruta Ubuntu está sin probar. En equipos sin Ryzen AI 300 / Max solo queda el motor `cpu`, sin datos de rendimiento publicados.
- **Gestión de disco**: el modo BGM puede llenar el disco si no se ajustan KEEP y MIN FREE; la aplicación se detiene por defecto al bajar de 2 GB libres, pero el umbral es configurable.
- **Calidad y alucinación**: al ser un modelo generativo de audio, no hay garantía de adecuación al prompt; las letras se reproducen tal como se introducen, pero la pronunciación y el ajuste melódico pueden desviarse. No hay métricas objetivas publicadas para cuantificarlo.
- **Duración y determinismo**: el límite es de 600 segundos por pieza; el determinismo declarado (misma semilla y ajustes, misma pieza) está referido a una misma instalación y no se garantiza entre plataformas o versiones del motor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ryugyosoft/onwx-music
- README en inglés: https://huggingface.co/ryugyosoft/onwx-music/blob/main/README_en.md
- Instalador para Windows: https://huggingface.co/ryugyosoft/onwx-music/resolve/main/install.ps1
- Instalador para Ubuntu: https://huggingface.co/ryugyosoft/onwx-music/resolve/main/install.sh
- Documentación de referencia de ACE-Step 1.5: no disponible en la información proporcionada
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo; las consultas devolvieron únicamente páginas de contenido para adultos sin relación con el proyecto.
