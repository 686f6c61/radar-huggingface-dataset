# geekaholic/qwen3-4b-coreai

## Resumen

`geekaholic/qwen3-4b-coreai` es un artefacto de distribucion, no un modelo entrenado desde cero: consiste en una exportacion del modelo `Qwen/Qwen3-4B` al formato propietario Apple Core AI (`.aimodel`), empaquetada para inferencia en local. El autor (geekaholic) lo publica como release de la aplicacion Omni Chat, que lo descarga y verifica contra un manifiesto de checksums incrustado en la propia app. El modelo base es de Alibaba (Qwen) y mantiene su licencia Apache-2.0.

La relevancia de este repositorio es practica: permite ejecutar un modelo de ~4.000 millones de parametros directamente en Apple Silicon (macOS 27 e iPadOS 27) sin depender de la nube ni de acceso a Hugging Face durante la inferencia, ya que el archivo incluye su propio tokenizer. Frente al modelo original, sin embargo, se recortan capacidades: la ventana de contexto se limita a 8.192 tokens y la salida maxima a 2.048 tokens, y no existe ruta de vision ni de audio.

El modelo resuelve el caso de uso de asistentes conversacionales privados y offline en dispositivos Apple, con soporte de modo "thinking" y de llamadas a herramientas. Se trata de un export comunitario con cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que su adopcion y validacion externa son todavia inexistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B); export empaquetado en formato Apple Core AI (`.aimodel`). Detalle de capas y atencion: no disponible |
| Parametros totales | ~4.000 millones (derivado del nombre del modelo base); cifra exacta no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Salida maxima | 2.048 tokens |
| Tipos de cuantizacion | Cuantizacion dinamica de 4 bits (receta Mac de Apple) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Core AI (`.aimodel`), distribuido como `qwen3-4b-macos.tar.gz` (~1.980.006.225 bytes); no safetensors ni GGUF |
| Modelo base | `Qwen/Qwen3-4B`, revision `1cfa9a7208912126459214e8b04321603b3df60c` |
| Receta de export | `apple/coreai-models`, revision `3f109efd54273391f9fd9f5f5b3d8c6e99836d55` |
| SHA-256 del archivo | `e603a73bb715c91d2dec10460ba87f50500683fa06dc2aad17f2760f3796d050` |
| Tamano del repositorio | 2,0 GB |
| Requisitos de plataforma | macOS 27 o iPadOS 27 sobre Apple Silicon, minimo 8 GB de memoria |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo subyacente; solo aloja el artefacto de release resultante de aplicar una receta de conversion sobre `Qwen/Qwen3-4B`. La receta de exportacion procede de `apple/coreai-models` y aplica una cuantizacion dinamica de 4 bits, la receta denominada "Mac" de Apple. Segun la model card, la exportacion es determinista a partir de las dos revisiones fijadas (modelo fuente y receta), lo que permite reproducir el artefacto bit a bit.

El paquete incluye su propio tokenizer, de modo que la inferencia no necesita acceso a Hugging Face, junto con los ficheros `PROVENANCE.json`, `LICENSE` (Apache-2.0 del modelo fuente) y `COREAI-LICENSE`. La integridad se gestiona mediante un manifiesto de checksums embebido en la aplicacion (`core/internal/localmodel/artifacts.json`): cada fichero del archivo se hashea de forma individual, la extraccion esta acotada y la instalacion es atomica. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en local, sin conexion a la nube.
- Modo "thinking" (razonamiento explicito por pasos) heredado de la familia Qwen3.
- Soporte de llamadas a herramientas (tool calling / function calling).
- Capacidades multilingues: no se especifican idiomas concretos en la informacion disponible (el modelo base Qwen3 es multilingue, pero este export no lo detalla).
- Ausencia total de vision y de audio: la model card indica explicitamente que no hay ruta de imagen ni de sonido en esta exportacion.
- Ejecucion on-device mediante el runtime Core AI de Apple, no mediante runtimes de servidor habituales.

## Casos de uso

- Asistente conversacional privado en Mac y iPad: la app Omni Chat descarga el artefacto verificado por checksum y ejecuta las conversaciones en local, de modo que ningun texto del usuario sale del dispositivo.
- Procesamiento de documentos sensibles sin nube: con 8.192 tokens de contexto se pueden resumir y consultar contratos, informes o notas internas manteniendo la confidencialidad, a cambio de trocear entradas largas.
- Agente local con tool calling: el soporte de llamadas a herramientas permite encadenar acciones sobre apps o servicios locales (por ejemplo, crear notas, consultar ficheros o lanzar comandos) en un flujo multi-paso controlado por la aplicacion.
- Razonamiento asistido en movilidad: el modo "thinking" es util para tareas de analisis paso a paso en un iPad sin cobertura ni conexion estable.
- Generacion y asistencia de codigo offline: para autocompletado, explicacion de fragmentos o revision de parches en entornos de desarrollo aislados o sin acceso a internet.
- Educacion y estudio sin coste de API: explicacion de conceptos, generacion de ejercicios y resumen de apuntes con latencia local y sin cuotas por token.
- Prototipado de funciones de IA en apps Apple: desarrolladores que quieran validar una integracion Core AI antes de adoptar un modelo mayor pueden usar este export como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni tampoco comparaciones cuantitativas con el modelo base sin cuantizar.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 27 o iPadOS 27. No hay soporte para CUDA, ROCm ni GPU de escritorio.
- Memoria minima declarada: 8 GB de memoria del dispositivo. Con pesos cuantizados a 4 bits el modelo ocupa aproximadamente 2-2,5 GB, mas la cache KV y el resto del sistema.
- Tamano del artefacto: el archivo `qwen3-4b-macos.tar.gz` ocupa 1.980.006.225 bytes (unos 1,84 GiB), y el repositorio completo 2,0 GB.
- GPU recomendadas: no aplica en el sentido habitual; el runtime objetivo son los SoC Apple M-series (M1 y posteriores) y los chips de iPad compatibles con iPadOS 27.
- Cabe en hardware de consumo: si, en Macs y iPads con al menos 8 GB de memoria y las versiones de sistema indicadas.
- Opciones de despliegue: exclusivamente el runtime Apple Core AI a traves de Omni Chat. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geekaholic/qwen3-4b-coreai (este) | ~4.000 M | 8.192 tokens | Core AI (`.aimodel`) | Apache-2.0 | Solo Apple Silicon con macOS/iPadOS 27; 0 descargas |
| Qwen/Qwen3-4B (original) | ~4.000 M | no disponible en la informacion proporcionada (superior a 8.192, dado el recorte del export) | safetensors | Apache-2.0 | Hugging Face; ejecutable en multiples runtimes |
| Variantes GGUF cuantizadas de Qwen3-4B | ~4.000 M | no disponible en la informacion proporcionada | GGUF | Apache-2.0 (heredada) | Multiples repositorios; compatibles con llama.cpp, Ollama y LM Studio |

La diferencia clave de este export frente a las alternativas no es el rendimiento, del que no hay datos, sino el encaje en plataforma: gana en integracion y verificacion sobre Apple (checksums, instalacion atomica, tokenizer incluido) y pierde en portabilidad, contexto y ecosistema de despliegue.

## Limitaciones y advertencias

- Alcance reducido: no hay vision ni audio, y el contexto baja a 8.192 tokens frente a las ventanas mayores del modelo base sin exportar.
- Dependencia de plataforma: exige macOS 27 o iPadOS 27, versiones que restringen drasticamente el parque de dispositivos capaces de ejecutarlo.
- Ausencia de validacion externa: cero descargas y cero valoraciones; no hay informes independientes de calidad ni de fidelidad respecto al modelo original.
- Riesgo de degradacion por cuantizacion: la conversion a 4 bits puede reducir la precision respecto al modelo Qwen3-4B sin cuantizar, y no se aportan metricas que lo cuantifiquen.
- Alucinacion: como cualquier modelo generativo, puede producir contenido plausible pero falso; no se documentan medidas de mitigacion.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad para este export ni para su receta de conversion.
- Idiomas: la model card no especifica idiomas soportados, por lo que no se puede garantizar un comportamiento correcto fuera del ingles o el chino sin pruebas propias.
- Licencia: Apache-2.0 permite uso comercial, pero hay que respetar tambien la `COREAI-LICENSE` incluida en el paquete, cuyos terminos no se detallan en la informacion disponible.
- Integridad y cadena de suministro: la verificacion depende del manifiesto embebido en Omni Chat; fuera de esa aplicacion no hay mecanismo de comprobacion automatico documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/geekaholic/qwen3-4b-coreai
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B (revision `1cfa9a7208912126459214e8b04321603b3df60c`)
- Receta de exportacion Apple: https://github.com/apple/coreai-models (revision `3f109efd54273391f9fd9f5f5b3d8c6e99836d55`)
- Aplicacion Omni Chat: https://gitlab.com/geekaholic/omni-chat
- Documentacion de reproduccion del export: https://gitlab.com/geekaholic/omni-chat/-/blob/main/docs/coreai.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados no relacionados (soporte de WPS en Windows, fondos de pantalla y temas de Windows 11).
