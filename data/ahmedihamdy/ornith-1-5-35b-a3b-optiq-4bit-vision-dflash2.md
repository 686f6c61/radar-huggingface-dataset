# ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH2

## Resumen

Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH2 es una distribucion cuantizada a 4 bits en formato MLX del modelo Ornith 1.5 35B-A3B, un transformer de tipo mixture-of-experts (MoE) con capacidades multimodales (texto e imagen) desarrollado por ornith-ai. Este empaquetado concreto lo publica el usuario ahmedihamdy e integra en un unico repositorio tanto los pesos del modelo principal como su modelo borrador (draft model) DFlash2, pensado para decodificacion especulativa sobre Apple Silicon.

El modelo resuelve el problema de ejecutar un LLM de 35.000 millones de parametros en un Mac con memoria unificada limitada: la cuantizacion mixta OptiQ a 4 bits reduce el repositorio a unos 24,6 GB y la decodificacion especulativa con arbol de borradores (draft-tree) acelera la generacion entre 1,24 y 1,3 veces en un Mac con GPU de la familia M5, sin alterar los pesos publicados originales.

Es relevante porque demuestra un flujo de trabajo reproducible (verificacion por SHA-256 de cada fichero) para servir modelos MoE multimodales con contexto largo (hasta 262.144 tokens) de forma local y privada, integrado en la aplicacion de escritorio Astronomical y compatible con APIs locales tipo OpenAI y Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con capacidades de vision; tag de arquitectura `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B (8 de 256 expertos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits con precision mixta (OptiQ); pesos en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX); incluye carpeta `drafter` con el modelo DFlash2 |
| Tamano del repositorio | 24,6 GB (descarga de aproximadamente 23 GB) |
| Modalidad | image-text-to-text (texto e imagen de entrada) |
| Modelo base | `mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit` y `jzinno/Ornith-1.5-35B-A3B-DFlash2` |
| Plataforma objetivo | Apple Silicon (macOS 14 o superior), optimizado para GPU M5 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos: dispone de 256 expertos en total y activa 8 por token, lo que resulta en aproximadamente 3.000 millones de parametros activos sobre un total de 34.660 millones. Esta dispersion permite una latencia de decodificacion propia de un modelo mucho mas pequeno, manteniendo la capacidad de representacion de un modelo de 35B. El tag `qwen3_5_moe` sugiere que la arquitectura deriva de la familia Qwen 3.5 MoE. El modelo incorpora ademas un codificador de vision que le permite procesar imagenes junto con texto.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable de este empaquetado es la decodificacion especulativa con arbol de borradores: el modelo DFlash2 propone 3 tokens por ronda, profundizando donde tiene confianza y ramificando alternativas donde no la tiene; el modelo principal verifica las 4 filas en un solo paso y conserva cada token con el que esta de acuerdo, mas uno propio, produciendo hasta 4 tokens por ronda. Ademas, a partir de 2.048 tokens de conversacion se activa un kernel de atencion especifico para la GPU M5 que lee la conversacion una sola vez para las cuatro filas (15,1 ms a 64k tokens frente a 27,9 ms de la ruta general). Los pesos no fueron recuantizados ni reentrenados: son los ficheros originales de sus dos revisiones fuente, con verificacion SHA-256 registrada en `astronomical-build.json`.

## Capacidades

- Generacion de texto y razonamiento: el modelo razona antes de responder (modo thinking, desactivable).
- Procesamiento de imagen: entrada image-text-to-text, responde preguntas sobre imagenes.
- Llamada a herramientas (tool calling / function calling).
- Soporte de agentes y razonamiento multi-paso; el README menciona el lanzamiento de agentes de codificacion (`claude`, `codex`, `opencode`) sobre el modelo.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.
- Decodificacion especulativa integrada con el borrador DFlash2 para acelerar la generacion.
- Compatibilidad con APIs locales tipo OpenAI y Anthropic.
- Capacidad multilingue limitada: solo se declara ingles.

## Casos de uso

- Asistente conversacional local y privado: al ejecutarse integramente en el Mac del usuario, ninguna conversacion sale del dispositivo; el contexto de 262.144 tokens permite mantener historiales muy largos sin truncar.
- Analisis de imagenes y documentos visuales: el pipeline image-text-to-text permite enviar capturas, diagramas o fotos y obtener descripciones o extracciones de datos, util para catalogacion o accesibilidad.
- Agente de codificacion en local: mediante `astronomical launch claude` o `codex` se puede levantar un agente que opera sobre el repositorio del desarrollador sin enviar codigo a la nube; el soporte de tool calling permite ejecutar comandos y editar ficheros.
- Automatizacion de tareas con function calling: integrable en scripts y pipelines que hablen la API de OpenAI o Anthropic apuntando al servidor local, por ejemplo para clasificar tickets o extraer campos estructurados.
- Prototipado e investigacion en Apple Silicon: sirve como banco de pruebas para estudiar decodificacion especulativa con arbol de borradores y cuantizacion mixta sobre hardware de consumo.
- Razonamiento sobre documentacion tecnica extensa: con 262k de contexto puede ingerir manuales o bases de conocimiento completas y responder preguntas con razonamiento previo.
- Uso educativo y experimentacion offline: al ser Apache 2.0 y ejecutarse sin conexion, encaja en entornos con requisitos de privacidad o sin acceso a red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona mediciones de velocidad de decodificacion (sin incluir el tiempo de lectura del prompt y con thinking desactivado) en un Mac con M5 Pro:

| Metrica | Valor |
|---|---|
| Aceleracion de decodificacion (M5) | 1,24 a 1,3 veces frente a decodificacion simple |
| Tokens propuestos por ronda del borrador | 3 |
| Tokens generados por ronda (maximo) | 4 (3 verificados mas 1 propio) |
| Latencia de atencion del arbol a 64k tokens (kernel M5) | 15,1 ms |
| Latencia de atencion del arbol a 64k tokens (ruta general) | 27,9 ms |

## Requisitos de hardware

- Memoria: aproximadamente 24 GB de memoria de modelo para velocidad completa; configurable como "Maximum model RAM" en Astronomical.
- Disco: aproximadamente 23 GB de descarga (24,6 GB de repositorio).
- GPU: optimizado para Macs con GPU de la familia M5 (los kernels de borrado usan las unidades matriciales del M5). En Macs sin GPU M5 el modelo funciona, pero decodifica un token a la vez, como la version OptiQ simple.
- Memoria insuficiente: Astronomical mantiene parte de los expertos en el SSD y los lee bajo demanda, lo que permite ejecutarlo en Macs con mucha menos memoria a costa de velocidad.
- Despliegue: aplicacion Astronomical (macOS 14 o superior, Apple Silicon), comando `astronomical` en terminal y API local compatible con clientes OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible (el formato es MLX, orientado a Apple Silicon).
- Throughput y latencia: solo se publica la aceleracion relativa (1,24-1,3x) y las latencias de atencion indicadas arriba; no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH2 (este) | 34,7B | ~3B | 262.144 | Apache 2.0 | Hugging Face, MLX, app Astronomical |
| Ornith-1.5-35B-A3B (original) | 35B | ~3B | 262.144 | no disponible en la informacion | Hugging Face (`ornith-ai`) |
| Ornith-1.5-35B-A3B-OptiQ-4bit (sin borrador) | 34,7B | ~3B | 262.144 | no disponible en la informacion | Hugging Face (`mlx-community`) |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada; la unica diferencia cuantificada es la aceleracion de decodificacion de 1,24-1,3x del empaquetado con DFlash2 frente al OptiQ simple en M5.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los LLM; el modo de razonamiento previo no elimina este riesgo.
- La aceleracion por decodificacion especulativa depende de la GPU M5; en otros Mac el rendimiento cae a decodificacion token a token.
- La salida greedy puede diferir ligeramente de la decodificacion simple porque algunos kernels matriciales redondean de forma distinta al procesar varias filas a la vez.
- Arboles de borradores mayores generan mas tokens por ronda pero cuestan mas de lo que ahorran en este modelo, segun el autor.
- Con memoria insuficiente, la descarga parcial de expertos desde SSD degrada la latencia de forma significativa.
- El repositorio es una distribucion de terceros: la calidad y el mantenimiento dependen del publicador (ahmedihamdy) y de las revisiones fuente; la verificacion por SHA-256 mitiga pero no elimina riesgos de cadena de suministro.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base originales antes de un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH2
- Modelo base OptiQ: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit
- Modelo borrador DFlash2: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Modelo original Ornith 1.5 35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Aplicacion Astronomical: https://getastronomical.com/
- Descargas de Astronomical: https://github.com/aosama/astronomical/releases/latest
- Documentacion de la API local: https://getastronomical.com/local-api.html
