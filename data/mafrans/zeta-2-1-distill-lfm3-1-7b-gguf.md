# Mafrans/Zeta-2.1-Distill-LFM3-1.7B-GGUF

## Resumen

Zeta-2.1-Distill-LFM3-1.7B es un modelo pequeño especializado en predicción de ediciones de código (next-edit-suggestion) para el editor Zed. Lo desarrolla Mafrans, un autor independiente, mediante destilación de secuencia del modelo zed-industries/zeta-2.1 (8B) sobre el modelo base LiquidAI/LFM3-1.7B-Base. El resultado es un modelo de 1.728.801.600 parámetros que mantiene el mismo formato de prompt que Zeta 2.1, por lo que funciona como reemplazo directo en el proveedor de predicciones de edición de Zed basado en Ollama o en cualquier API compatible con OpenAI.

El modelo resuelve un problema concreto: ofrecer sugerencias de edición de código de baja latencia en hardware modesto, sin necesidad de enviar el contexto del editor a un servicio remoto. Frente al profesor de 8B, el estudiante de 1,7B reduce drásticamente los requisitos de memoria y permite inferencia local en GPU de consumo. La distribución se realiza exclusivamente en formato GGUF con cuantizaciones que van de Q4_K_M (1,1 GB) a bf16 (3,5 GB).

Es relevante para desarrolladores que quieran integrar asistencia de edición en local con privacidad total y latencia subsegundo, y como caso de estudio de destilación de secuencia entre tokenizadores distintos. Se trata de un proyecto experimental de aficionado, sin afiliación con Zed Industries ni con Liquid AI, y con licencia LFM 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia LiquidAI, arquitectura reconocida por llama.cpp como `lfm3`) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (configurado en Ollama y llama-server) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponibles (entrenado sobre 11 lenguajes de programación y configuración) |
| Licencia | LFM 1.0 (identificador `lfm1.0`, licencia `other`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer de la familia LFM3 de Liquid AI. Sobre esa base se aplicó un ajuste fino con LoRA (r=32, alpha=64, sobre todas las capas lineales), durante 2 épocas, calculando la pérdida únicamente sobre la respuesta y con longitud máxima de 2048 tokens. El adaptador se fusionó y se convirtió a GGUF con llama.cpp. La inferencia requiere una versión de llama.cpp lo bastante reciente como para reconocer la arquitectura `lfm3`.

El entrenamiento es una destilación a nivel de secuencia: se generaron 33.000 prompts en formato Zeta 2.1 a partir del historial de commits de bigcode/commitpackft y bigcode/commitpack, cubriendo 11 lenguajes (Go, JavaScript, JSON, JSX, Markdown, Python, Rust, shell, TOML, TypeScript y YAML) y dos modos: justo después de que el usuario termine una edición (modo A) y mientras escribe (modo B). Las etiquetas son las propias respuestas de Zeta 2.1 a esos prompts, con los ejemplos sin edición submuestreados, dejando 22.600 filas de entrenamiento. No se pudo aplicar destilación de logits porque profesor y estudiante usan tokenizadores distintos.

## Capacidades

- Predicción de la siguiente edición de código (next-edit-suggestion) en formato de prompt Zeta 2.1.
- Decisión binaria editar/no editar sobre una región editable del documento.
- Generación de reescrituras de regiones de código con marcadores de cierre.
- Cobertura de 11 lenguajes: Go, JavaScript, JSON, JSX, Markdown, Python, Rust, shell, TOML, TypeScript y YAML.
- Dos modos de operación: tras una edición completada (modo A) y durante la escritura (modo B).
- Integración como proveedor de predicciones de edición en Zed vía Ollama o API compatible con OpenAI.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional según los tags del repositorio.
- No dispone de tool calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Autocompletado de ediciones en Zed con Ollama: el modelo se configura como proveedor `ollama` con `prompt_format: "zeta2_1"` y se ejecuta en local; su ventana de 4096 tokens cubre el contexto típico de una región editable.
- Autocompletado de ediciones en Zed con llama-server: se apunta el proveedor `open_ai_compatible_api` a `http://localhost:8080/v1/completions` con `max_output_tokens: 768`, lo que evita el recorte de reescrituras largas que provoca el `num_predict` bajo de algunas versiones de Zed.
- Asistencia de código con privacidad estricta: al ejecutarse en una GPU de consumo sin llamadas externas, es adecuado para entornos donde el código no puede salir de la máquina.
- Edición de archivos de configuración y documentación: el entrenamiento incluye JSON, TOML, YAML y Markdown, por lo que puede sugerir cambios en ficheros de infraestructura y documentación además de código fuente.
- Prototipado de features de edición en editores propios: al mantener el formato de prompt de Zeta 2.1, sirve como sustituto ligero durante el desarrollo de integraciones antes de pasar a un modelo mayor.
- Evaluación de pipelines de destilación: es un ejemplo reproducible de destilación de secuencia entre tokenizadores distintos con métricas de acuerdo publicadas sobre 3.300 prompts retenidos.
- Despliegue en estaciones de trabajo modestas: con Q4_K_M (1,1 GB) o Q5_K_M (1,3 GB) cabe en GPU de gama media y mantiene decisiones editar/no editar por encima del 97 % respecto al profesor.

## Benchmarks y rendimiento

Evaluación sobre 3.300 prompts retenidos (300 por lenguaje), Q8_0 vía Ollama y decodificación greedy. El "profesor" son las respuestas de Zeta 2.1 a los mismos prompts.

| Metrica | Estudiante | Profesor | Siempre no-editar |
|---|---|---|---|
| Misma decisión editar/no editar que el profesor | 86,1 % | — | 43,2 % |
| Mismo fichero resultante que el profesor | 56,7 % | — | 43,2 % |
| Mismo fichero resultante que la edición real del siguiente commit | 8,8 % | 11,1 % | 0,2 % |
| Respuestas malformadas | 0,5 % | 2,8 % | 0 % |

Desglose por modo: en modo A (tras una edición) el estudiante coincide con la decisión del profesor el 81,4 % de las veces; en modo B (mientras se escribe), el 93,4 %. Como referencia, al reejecutar Zeta 2.1 (Q5_K_M, greedy) sobre 257 de esos prompts reprodujo la decisión editar/no editar de sus etiquetas el 97,6 % de las veces y el fichero exacto el 88,5 %.

Acuerdo de las cuantizaciones con la salida bf16, medido sobre 200 prompts retenidos:

| Fichero | Tamano | Misma salida que bf16 | Misma decision editar/no editar |
|---|---|---|---|
| bf16 | 3,5 GB | — | — |
| Q8_0 | 1,8 GB | 98,5 % | 100 % |
| Q6_K | 1,4 GB | 94 % | 99 % |
| Q5_K_M | 1,3 GB | 87,5 % | 98,5 % |
| Q4_K_M | 1,1 GB | 82,5 % | 97 % |

Latencia medida en una RX 7900 GRE (backend Vulkan, Q8_0): mediana de 0,46 s con llama-server frente a 0,54 s con Ollama.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB con Q4_K_M, 1,3 GB con Q5_K_M, 1,4 GB con Q6_K, 1,8 GB con Q8_0 y 3,5 GB con bf16, más el overhead del runtime.
- Cabe en cualquier GPU de consumo con al menos 2-4 GB de VRAM libre; el autor lo describe como pensado para "una GPU modesta".
- GPU verificada por el autor: AMD RX 7900 GRE con backend Vulkan. No se documentan pruebas con A100, H100 ni RTX 4090.
- Opciones de despliegue: Ollama (`ollama pull hf.co/Mafrans/Zeta-2.1-Distill-LFM3-1.7B-GGUF:Q8_0`) y llama.cpp (`llama-server -hf Mafrans/Zeta-2.1-Distill-LFM3-1.7B-GGUF:Q8_0 -ngl 99 -c 4096 --temp 0 --port 8080`).
- Configuración recomendada: temperatura 0, `repeat_penalty` 1.0 (el valor por defecto 1.1 degrada la calidad porque la mayor parte de la respuesta copia la región editable) y `num_ctx` 4096.
- Latencia: mediana de 0,46 s por respuesta en RX 7900 GRE con llama-server y Q8_0. El autor indica que las cuantizaciones menores apenas ganan velocidad porque el modelo no está limitado por ancho de banda de memoria.
- Advertencia de rendimiento: la decodificación especulativa n-gram de llama.cpp (`--spec-type ngram-*`) acelera cerca de un tercio pero cuelga llama-server tras unos cientos de peticiones; el autor recomienda evitarla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Zeta-2.1-Distill-LFM3-1.7B | 1,73B | 4096 | GGUF | LFM 1.0 | Destilado de Zeta 2.1; 86,1 % de acuerdo en decisión editar/no editar con el profesor |
| zed-industries/zeta-2.1 (profesor) | 8B | no disponible | no disponible | no disponible | Modelo original de predicción de ediciones para Zed; mayor calidad (88,5 % de fichero exacto al reejecutarse) pero más recursos |
| LiquidAI/LFM3-1.7B-Base | 1,73B | no disponible | no disponible | LFM 1.0 | Modelo base sin ajuste para edición; no ofrece el formato de prompt Zeta 2.1 |

## Limitaciones y advertencias

- Proyecto experimental de aficionado, sin afiliación con Zed Industries ni con Liquid AI; no hay garantía de mantenimiento ni soporte.
- Solo se distribuye en GGUF y requiere una versión reciente de llama.cpp que reconozca la arquitectura `lfm3`.
- Algunas versiones de Zed envían `num_predict` de 64, lo que trunca reescrituras largas antes del marcador de cierre y hace que no se muestre predicción; conviene usar el proveedor compatible con OpenAI con `max_output_tokens` mayor.
- El `repeat_penalty` por defecto de Ollama (1.1) perjudica al modelo; debe fijarse en 1.0.
- La decodificación especulativa n-gram de llama.cpp provoca cuelgues tras unos cientos de peticiones; no usarla.
- Calidad limitada frente al profesor: mismo fichero resultante solo en el 56,7 % de los casos y coincidencia con la edición real del siguiente commit del 8,8 % (frente al 11,1 % del profesor).
- El modo A (tras una edición) es claramente más débil que el modo B (81,4 % frente a 93,4 % de acuerdo en la decisión).
- La destilación es a nivel de secuencia y aprende de las respuestas del profesor, no de los commits reales; los errores del profesor se heredan.
- Cobertura limitada a 11 lenguajes de programación y configuración; no se documentan capacidades multilingües en lenguaje natural.
- Licencia LFM 1.0: conviene revisar sus términos antes de un uso comercial.
- Riesgo de respuestas malformadas bajo (0,5 % en la evaluación), pero no nulo.
- No se han documentado sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mafrans/Zeta-2.1-Distill-LFM3-1.7B-GGUF
- Modelo profesor: https://huggingface.co/zed-industries/zeta-2.1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Dataset commitpackft: https://huggingface.co/datasets/bigcode/commitpackft
- Dataset commitpack: https://huggingface.co/datasets/bigcode/commitpack
- Editor Zed: https://zed.dev
- Licencia LFM 1.0: fichero LICENSE del repositorio en Hugging Face
