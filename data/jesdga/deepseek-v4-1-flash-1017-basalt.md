# jesdga/DeepSeek-V4.1-Flash-1017-Basalt

## Resumen

DeepSeek-V4.1-Flash-1017-Basalt es un paquete de pesos cuantizados del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, empaquetado por el desarrollador jesdga para su uso con Basalt, un motor de inferencia local orientado a GPUs NVIDIA Blackwell (sm_120) con API compatible con OpenAI y Anthropic. Cada fichero del repositorio es autocontenido: incluye los pesos, la tabla Engram, el proyector de visión, el tokenizador y el drafter DSpark. El modelo subyacente es una arquitectura Mixture-of-Experts (MoE) de la familia DeepSeek V4.1.

El repositorio ofrece tres variantes: dos cuantizaciones dinámicas de Unsloth (UD-IQ1_M y UD-IQ2_XXS, formato Dynamic V3.1) y un pack NVFP4 construido a partir del checkpoint de NVIDIA. El contexto máximo soportado es de 1.048.576 tokens, y el motor incorpora decodificación especulativa mediante un drafter DSpark que trabaja en ventanas de 3 tokens conservando los 32 expertos más enrutados por etapa.

Su relevancia actual radica en que permite ejecutar un modelo de escala frontera con visión y contexto de un millón de tokens en hardware de consumo (una RTX 5090 más una RTX 5060 Ti como peer, con desbordamiento de expertos a RAM del sistema), manteniendo licencia MIT tanto en el modelo original como en la cuantización y en el motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer; modelo base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (`--max-context`) |
| Tipos de cuantizacion | UD-IQ1_M (Unsloth Dynamic V3.1), UD-IQ2_XXS (Unsloth Dynamic V3.1), NVFP4 (checkpoint de NVIDIA); proyector de visión en BF16, drafter DSpark en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo, cuantización Unsloth y motor Basalt) |
| Formato de pesos | `.basalt` (fichero autocontenido: pesos, tabla Engram, proyector de visión, tokenizador y drafter) |
| Tamano del repositorio | 1232,1 GB |
| Tamano por pack | UD-IQ1_M: 260 GB; UD-IQ2_XXS: 285 GB; NVFP4: 428 GB |
| Requisito de motor | Basalt 0.3.0+ (packs Unsloth); Basalt 0.3.3+ (NVFP4) |
| Hardware objetivo | NVIDIA Blackwell (sm_120) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V4.1-Flash-1017, una arquitectura Mixture-of-Experts de DeepSeek. El paquete Basalt no reentrena ni modifica los pesos: cada tensor se almacena tal y como lo publica el GGUF de origen, sin recuantizar. Las cuantizaciones UD-IQ1_M y UD-IQ2_XXS provienen de la release de Unsloth (Dynamic V3.1); la tabla Engram, el proyector de visión (BF16) y el drafter DSpark (Q8_0) proceden de esa misma release. El pack NVFP4 se construye a partir del checkpoint de NVIDIA, con los expertos enrutados en NVFP4 tal cual se publican, las proyecciones FP8 convertidas a Q8_0 de sus valores exactos, la tabla Engram en MXFP4 y el tokenizador, proyector de visión y drafter tomados del pack UD-IQ1_M.

La innovación técnica destacable en el empaquetado es el drafter DSpark: decodificación especulativa en ventanas de 3 tokens que conserva los 32 expertos más enrutados de cada etapa (2,4 GB de VRAM). Los tokens redactados se verifican, por lo que la salida es la del propio modelo; se puede desactivar con `--spec 0`. El motor Basalt gestiona además el enrutado de expertos entre VRAM, una segunda GPU como peer y RAM del sistema. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto, razonamiento y código (el modelo base es de propósito general; la model card menciona sesiones agénticas de programación).
- Visión: procesamiento de imágenes con `--vision dynamic`, codificadas dentro del motor mediante el proyector incluido en el fichero.
- Contexto largo de hasta 1.048.576 tokens, adecuado para documentos extensos y sesiones multi-turno prolongadas.
- Tool calling y formato de tool-call: el motor lee la sintaxis de llamada a herramientas directamente del fichero del modelo.
- Modo de pensamiento (thinking switch): el motor extrae el conmutador de razonamiento del propio fichero.
- Compatibilidad de API con OpenAI y Anthropic, lo que facilita la integración en clientes existentes.
- Decodificación especulativa con el drafter DSpark para acelerar la generación.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación agéntica en local: el modelo mantiene sesiones largas de código con tool calling y un contexto de hasta un millón de tokens; la model card reporta unas 85 tok/s de media en sesiones agénticas largas con drafting activo.
- Análisis de repositorios completos: con 1.048.576 tokens de contexto se puede cargar un codebase extenso o documentación técnica completa en una sola pasada sin troceado.
- Procesamiento de documentos con imágenes: la visión integrada permite extraer información de capturas, diagramas y páginas escaneadas junto al texto en la misma ventana de contexto.
- Despliegue de API compatible con OpenAI/Anthropic en hardware propio: Basalt expone una API compatible, de modo que herramientas y SDK existentes pueden apuntar al servidor local sin cambios de código.
- Inferencia local con privacidad de datos: al ejecutarse íntegramente en hardware propio (GPU Blackwell más RAM del sistema), los datos no salen de la máquina, adecuado para entornos con requisitos de confidencialidad.
- Prototipado de agentes multi-paso: el soporte de tool calling y el contexto largo permiten cadenas de razonamiento y llamadas a herramientas en tareas de automatización.
- Evaluación de cuantizaciones: los tres packs permiten comparar calidad (PPL, KLD) y velocidad sobre el mismo modelo para elegir el equilibrio adecuado en producción.

## Benchmarks y rendimiento

Calidad medida con `basalt-bench --quality`: 100 fragmentos de wikitext-2 de 512 tokens, evaluados contra una referencia BF16 de llama.cpp del modelo original (PPL de referencia 2,731). Hardware: RTX 5090 a 400 W más RTX 5060 Ti a 180 W como peer.

| Pack | PPL | KLD media | Mismo top-1 |
|---|---:|---:|---:|
| UD-IQ1_M | 3,033 | 0,278 | 83,88 % |
| UD-IQ2_XXS | 3,107 | 0,241 | 85,15 % |
| NVFP4 | no evaluado contra BF16 | no disponible | no disponible |

Velocidad en un solo stream (tokens/s), con drafting DSpark activo por defecto:

| Pack | Prosa | Estructurado | Chat | Prefill, prompt de 64K |
|---|---:|---:|---:|---:|
| UD-IQ1_M | 94 | 179 | 86 | 2.782 |
| UD-IQ2_XXS | 45 | 102 | 40 | 1.363 |
| NVFP4 | 2,8 (con expertos en SSD, 121 GiB de RAM) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA Blackwell (sm_120). El ejemplo de la model card usa una RTX 5090 a 400 W como principal y una RTX 5060 Ti a 180 W como peer para una segunda capa de expertos.
- VRAM: el drafter DSpark consume 2,4 GB de VRAM adicionales; el resto de expertos se reparte entre VRAM, la segunda GPU y RAM del sistema.
- RAM del sistema: crítica según el pack. El NVFP4 necesita aproximadamente 320 GB de RAM o más para funcionar bien (con 121 GiB decae a 2,8 tok/s por lectura de expertos desde SSD). UD-IQ1_M es el pack que más expertos mantiene en RAM y el más rápido; UD-IQ2_XXS queda más cerca de BF16 en calidad pero es más lento cuando los expertos desbordan a disco.
- Almacenamiento: los ficheros pesan entre 260 GB y 428 GB.
- Cabe en GPU de consumo: sí, en el ecosistema Blackwell descrito (RTX 5090 + RTX 5060 Ti), con apoyo de RAM del sistema.
- Despliegue: exclusivamente mediante el motor Basalt (`bin/basalt serve <pack> --vision dynamic`, con `--gpu 0,1` para segunda tarjeta y `--max-context N` para contexto extendido). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos ficheros `.basalt`.
- Throughput y latencia: ver tabla de velocidad en la sección de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Basalt (este) | no disponible (MoE) | 1.048.576 | MIT | `.basalt`, motor Basalt (Blackwell) | Tres packs cuantizados, visión y drafter incluidos |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible (MoE) | no disponible | MIT | pesos originales (BF16) | Modelo base sin cuantizar |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible (MoE) | no disponible | MIT | GGUF (UD-IQ1_M, UD-IQ2_XXS) | Origen de las cuantizaciones; ejecutable con llama.cpp |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 | no disponible (MoE) | no disponible | MIT | NVFP4 | Checkpoint de NVIDIA usado para el pack NVFP4 |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: es un empaquetado de pesos cuantizados del modelo de DeepSeek; las capacidades y sesgos son los del modelo base.
- Las cuantizaciones UD-IQ1_M y UD-IQ2_XXS degradan la calidad respecto a BF16: PPL de 3,033 y 3,107 frente a 2,731 de referencia, con coincidencia top-1 del 83,88 % y 85,15 % respectivamente.
- El pack NVFP4 no ha sido evaluado contra BF16, por lo que su degradación de calidad es desconocida.
- Dependencia fuerte del hardware: requiere GPUs NVIDIA Blackwell (sm_120) y el motor Basalt; no es portable a otros motores ni a GPUs de generaciones anteriores según la información disponible.
- El pack NVFP4 necesita aproximadamente 320 GB de RAM para un rendimiento aceptable; por debajo, la decodificación cae a 2,8 tok/s por acceso a SSD.
- El contexto máximo de 1.048.576 tokens requiere configurarlo explícitamente (`--max-context`) y consume recursos adicionales; no se documentan límites de calidad en contextos extremos.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación y sesgos: no documentados específicamente para este empaquetado; aplican los del modelo base DeepSeek-V4.1-Flash-1017.
- Licencia MIT en modelo, cuantización y motor, lo que permite uso comercial; aun así, conviene verificar las condiciones del modelo base y de los pesos de NVIDIA en el checkpoint NVFP4.
- Los números de velocidad "se mueven con cada release" del motor, según la propia model card; no deben tomarse como valores estables de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jesdga/DeepSeek-V4.1-Flash-1017-Basalt
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Motor Basalt (GitHub): https://github.com/jesdga95/basalt
- Documentación de DeepSeek-V4.1 en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/deepseek41.md
- Página de precisión: https://github.com/jesdga95/basalt/blob/main/docs/precision/deepseek41.md
- Configuración de modelos y router: https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md
- Web del proyecto: https://basalt.jgulfo.com
- Fork de origen Strata: https://github.com/Niko1221/Strata
