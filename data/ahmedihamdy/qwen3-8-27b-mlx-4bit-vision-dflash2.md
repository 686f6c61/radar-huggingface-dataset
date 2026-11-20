# ahmedihamdy/Qwen3.8-27B-MLX-4bit-vision-DFLASH2

## Resumen

Qwen3.8-27B-MLX-4bit-vision-DFLASH2 es una distribución empaquetada del modelo Qwen 3.8 27B en cuantización 4-bit para MLX (Apple Silicon), que integra en un único repositorio la torre de visión y el modelo borrador DFlash2 para decodificación especulativa. Lo publica el usuario ahmedihamdy sobre dos artefactos previos: la build 4-bit de TensorFold (`TensorFold/Qwen3.8-27B-MLX-4bit`) y el drafter de z-lab (`z-lab/Qwen3.8-27B-DFlash2`). No se reentrena ni recuantiza nada: los pesos son los publicados por las fuentes originales, verificables mediante el manifiesto `astronomical-build.json` con tamaños y SHA-256.

El modelo es denso, con 27.356.728.560 parámetros reales según safetensors, y todos ellos se activan en cada token. Esa característica hace que la decodificación plana sea lenta y explica el interés del empaquetado con un drafter: el modelo pequeño propone bloques de tokens candidatos y el grande los valida en un solo paso. El resultado declarado por el autor es de 16,7 tokens/s en la build 4-bit plana frente a 37,0 y 35,1 tokens/s con drafting, es decir, entre 2,1 y 2,2 veces más rápido en una prueba con un prompt de 10.011 tokens y 500 tokens generados.

La relevancia práctica es que permite ejecutar un modelo multimodal de 27B con razonamiento, tool calling y 262.144 tokens de contexto en un Mac de 36 GB o más, de forma local y privada, mediante la aplicación Astronomical (gratuita y de código abierto) o su CLI. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8), con torre de visión; decodificación especulativa con drafter DFlash2 |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 4-bit (MLX); el repositorio solo distribuye esta cuantización |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con manifiesto `astronomical-build.json` de verificación |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen 3.8 con 27B parámetros y una torre de visión acoplada, lo que habilita la modalidad image-text-to-text. La build distribuida aquí es la cuantización 4-bit de TensorFold para MLX, sin recuantización ni reentrenamiento adicional por parte del publicador: cada archivo de pesos es el archivo sin modificar de su revisión de origen. El modelo razona antes de responder, admite tool calling y sostiene conversaciones de hasta 262.144 tokens.

La innovación técnica principal es el empaquetado del drafter DFlash2 dentro del repositorio, en una carpeta `drafter`. Ese modelo borrador fue entrenado por sus autores específicamente contra Qwen 3.8 27B, lee los estados ocultos de 5 de las 64 capas del modelo objetivo y está construido para exactamente esa anchura y vocabulario. En cada ronda propone un bloque de hasta 7 tokens más allá del actual, con estructura de árbol: profundiza donde tiene confianza y ramifica alternativas donde no la tiene, hasta 15 tokens candidatos en total. El modelo grande valida todos los candidatos en un solo paso mediante un kernel matricial 4-bit escrito para la GPU del M5, de modo que comprobar 16 filas cuesta aproximadamente 1,3 veces un paso plano. Todos los tokens aceptados son elegidos por el modelo objetivo según sus propias probabilidades a la temperatura de la petición. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento previo a la respuesta (modo de pensamiento).
- Comprensión de imágenes y respuesta en modalidad image-text-to-text.
- Tool calling y function calling, con soporte para agentes de múltiples pasos.
- Conversaciones multi-turno con contexto de hasta 262.144 tokens.
- Integración con herramientas que hablan la API de OpenAI o la de Anthropic mediante el servidor local de Astronomical.
- Lanzamiento de agentes de código (`astronomical launch claude`, `codex`, `opencode`) sobre el modelo.
- Decodificación especulativa automática cuando el modelo y el drafter caben en memoria y el hardware es M5.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Asistencia privada en el escritorio: un Mac con 36 GB o más ejecuta el modelo de forma local con Astronomical, sin que nada de lo que se escribe salga de la máquina, adecuado para material confidencial o datos personales.
- Análisis de documentos e imágenes: la torre de visión permite consultas del tipo "¿qué hay en esta imagen?" junto con texto largo, útil para revisar capturas, diagramas o documentos escaneados dentro de un flujo de trabajo local.
- Agente de código en local: mediante `astronomical launch claude` o `codex`, el modelo actúa como backend de un agente de programación, con tool calling y contexto amplio para recorrer repositorios medianos.
- Chat de contexto largo: con 262.144 tokens se pueden cargar transcripciones extensas, expedientes o varios documentos y hacer preguntas cruzadas sin trocear el material.
- Prototipado de aplicaciones con API compatible: cualquier cliente que use la API de OpenAI o Anthropic puede apuntar al servidor local de Astronomical, lo que simplifica migrar prototipos a un modelo local sin cambiar el código de integración.
- Evaluación de decodificación especulativa: el repositorio sirve como caso reproducible para medir el impacto de un drafter acoplado a un modelo denso de 27B en Apple Silicon, con cifras de referencia publicadas (16,7 frente a 37,0 tokens/s).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo proporciona mediciones de velocidad de decodificación:

| Configuración | Decodificación |
|---|---|
| Build 4-bit plana | 16,7 tokens/s |
| Esta build con drafting (ejecución 1) | 37,0 tokens/s |
| Esta build con drafting (ejecución 2) | 35,1 tokens/s |

Medición realizada con Astronomical en un Mac de la familia M5, con un prompt de 10.011 tokens procedente de *Romeo and Juliet* y 500 tokens generados a temperatura 1,0. La mejora declarada es de aproximadamente 2,1 a 2,2 veces. El autor indica que en chats cortos y código la ventaja es mayor, aunque la información disponible se corta en ese punto y no aporta la cifra concreta.

## Requisitos de hardware

- Disco: aproximadamente 18,6 GB para la descarga; el repositorio ocupa 19,9 GB.
- Memoria: unos 19,6 GB de memoria de modelo configurados como "Maximum model RAM" en Astronomical, lo que en la práctica requiere un Mac con 36 GB o más para velocidad completa.
- GPU: Apple Silicon. El drafting rápido requiere un Mac de la familia M5, cuyas unidades matriciales usan los kernels de drafting; en Mac sin GPU M5 el modelo funciona pero decodifica un token a la vez.
- Consumer GPU: no aplica en el sentido habitual; está pensado para Apple Silicon, no para GPU NVIDIA. No se dispone de datos de VRAM para CUDA.
- Despliegue: aplicación Astronomical (macOS 14 o posterior), su CLI `astronomical` y su servidor local compatible con las API de OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Limitación operativa: el drafting solo se activa cuando el modelo completo y su drafter están en memoria; los mensajes con imagen decodifican token a token y el drafting se reanuda en el siguiente mensaje solo de texto.
- Throughput: 37,0 y 35,1 tokens/s con drafting frente a 16,7 tokens/s sin él, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MLX-4bit-vision-DFLASH2 | 27,36B densos | 262.144 | Texto + imagen | Apache 2.0 | MLX, vía Astronomical |
| TensorFold/Qwen3.8-27B-MLX-4bit | 27B (4-bit) | no disponible en la información | Texto (build base sin visión empaquetada) | Apache 2.0 | MLX |
| z-lab/Qwen3.8-27B-DFlash2 | Modelo borrador | no aplica | Texto (drafting) | no disponible en la información | MLX |

La comparación relevante es interna al ecosistema: frente a la build 4-bit de TensorFold, esta añade la torre de visión y el drafter en un solo paquete, con la mejora de velocidad descrita. No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El único idioma declarado es el inglés; el rendimiento en castellano u otras lenguas no está documentado.
- El drafting rápido está ligado a la GPU de la familia M5; en otros Mac Apple Silicon se pierde la ventaja y se decodifica token a token.
- Las respuestas a mensajes con imagen no usan drafting, por lo que son más lentas.
- El modelo es denso: los 27B parámetros se activan en cada token, lo que encarece cada paso y exige memoria abundante (unos 19,6 GB solo para el modelo).
- No hay benchmarks de calidad publicados en la información disponible; las cifras del autor se limitan a velocidad y en un único escenario.
- Riesgo de alucinación y sesgos: no documentados en la model card; deben asumirse los del modelo base Qwen 3.8 27B, no evaluados aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el publicador no es el autor original del modelo ni del drafter; conviene verificar la integridad con `astronomical-build.json`.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia de los artefactos de origen (TensorFold y z-lab), cuya licencia no se detalla en la información disponible.
- Dependencia de la aplicación Astronomical y de macOS 14 o posterior para el flujo documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ahmedihamdy/Qwen3.8-27B-MLX-4bit-vision-DFLASH2
- Modelo base 4-bit de TensorFold: https://huggingface.co/TensorFold/Qwen3.8-27B-MLX-4bit
- Modelo borrador DFlash2 de z-lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Astronomical (web): https://getastronomical.com/
- Descargas de Astronomical para Mac: https://github.com/aosama/astronomical/releases/latest
- Documentación de la API local de Astronomical: https://getastronomical.com/local-api.html
