# HandleCoding/Qwen3.8-27B-nvfp4-NInfer

## Resumen

Qwen3.8-27B-nvfp4-NInfer es un artefacto de pesos cuantizados del checkpoint multimodal Qwen/Qwen3.8-27B, empaquetado en el formato nativo `.ninfer` del runtime NInfer. Lo publica el usuario HandleCoding, si bien la propia model card lo identifica como la fuente versionada del repositorio neroued/Qwen3.8-27B-nvfp4-NInfer. No se trata de un modelo entrenado desde cero ni de un checkpoint Transformers: es un perfil de pesos registrado que combina el BF16 oficial con los pesos NVFP4 ya empaquetados de unsloth/Qwen3.8-27B-NVFP4.

El objetivo es ejecutar un modelo de 27 000 millones de parametros, con torre de vision y prediccion multi-token (MTP), en una unica GPU de consumo. Para ello usa cuantizacion mixta: NVFP4 (4 bits, W4A4) en las capas MLP 0–55 y FP8 con escalado por fila en el embedding, las proyecciones de atencion y GDN, la cabeza de salida y las MLP 56–63, manteniendo pesos de control en BF16. El artefacto completo ocupa 23 719 496 192 bytes (22,09 GiB) y contiene 1 184 tensores y 6 recursos.

Su relevancia es doble. Por un lado demuestra que un modelo multimodal de 27B cabe en los 32 GB de una RTX 5090. Por otro, incorpora los pesos companion de DFlash2 (z-lab/Qwen3.8-27B-DFlash2) para decodificacion especulativa con 1 a 15 tokens de borrador. El precio a pagar es la dependencia total de un runtime compilado desde fuente (NInfer, revision `385b30ce` o posterior), Linux de 64 bits, CUDA 13.1+ y arquitectura `sm_120a`, sin soporte para vLLM, llama.cpp ni Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) de la familia Qwen3.8, con proyecciones GDN (Q/K/V/Z y salida) y cabezas MTP; cuantizacion mixta NVFP4/FP8 |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en MLP de capas 0–55; FP8 con escalado por fila en embedding, proyecciones de atencion, GDN, cabeza de salida y MLP de capas 56–63; pesos de control en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor version 2); no es safetensors, GGUF ni checkpoint Transformers |
| Tamano del artefacto | 23 719 496 192 bytes (22,09 GiB), fichero `qwen3_8_27b_nvfp4.ninfer` |
| SHA-256 | `552c374c685dce302603b95fbe940fb04243c0cd44c083efc644ad3d980d462c` |
| Objetos almacenados | 1 190 (1 184 tensores y 6 recursos); 112 tensores NVFP4 y 146 tensores FP8 |
| Decodificacion especulativa | DFlash2 (`--spec dflash2 --draft-tokens 7 --lm-head-draft`, borradores de 1 a 15) |
| Runtime requerido | NInfer revision `385b30ce` o posterior, compilado desde fuente |
| Plataforma | Linux de 64 bits, CUDA Toolkit 13.1+, NVIDIA RTX 5090 (`sm_120a`) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen/Qwen3.8-27B, no se entrena en este repositorio: aqui solo se realiza cuantizacion post-entrenamiento. El proceso combina el checkpoint BF16 oficial con los pesos NVFP4 ya empaquetados de unsloth/Qwen3.8-27B-NVFP4 y los reencapsula en el contenedor `.ninfer`. Los datos de entrenamiento, el numero de tokens, la composicion del dataset y si hubo RLHF o DPO no se documentan en la informacion disponible. La presencia de proyecciones GDN (Q/K/V/Z) apunta a un bloque de atencion lineal tipo Gated DeltaNet dentro de una arquitectura hibrida, y las cabezas MTP indican prediccion multi-token; ninguna de las dos cosas se detalla tecnicamente en la model card.

La innovacion relevante esta en el perfil de cuantizacion. Las palabras NVFP4 y FP8 derivadas del origen se preservan sin decodificar ni recuantizar; solo el embedding BF16 oficial se codifica localmente como FP8 con escalado por fila. El identificador `nvfp4` designa el perfil registrado completo, no una unica precision matricial. Ademas se conservan las asignaciones de Vision y MTP, y se incluyen los pesos companion completos de DFlash2 en la revision `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`, lo que habilita decodificacion especulativa con 1 a 15 tokens de borrador sin necesidad de un modelo draft externo.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el artefacto.
- Razonamiento matematico de competicion: 96,67 en AIME 2025 y 96,67 en AIME 2026 (0-shot, rule).
- Razonamiento cientifico de nivel experto: 90,40 en GPQA-Diamond (0-shot, rule).
- Seguimiento de instrucciones complejas: 77,00 en IFBench (prompt-level strict, 0-shot, rule).
- Vision-lenguaje (pipeline image-text-to-text): 66,25 en ERQA y 83,53 en RealWorldQA, con torre de vision y media-processor registrados.
- Decodificacion especulativa con DFlash2 y prediccion multi-token (MTP).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles; el artefacto solo registra texto, vision y MTP.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia local de un modelo de 27B en una unica GPU: el artefacto de 22,09 GiB se carga en una RTX 5090 de 32 GB, lo que permite desplegar un modelo multimodal grande en una estacion de trabajo sin clúster ni servicios en la nube.
- Razonamiento matematico asistido por ordenador: con 96,67 en AIME 2025 y AIME 2026 (0-shot), es adecuado para tutoria de problemas de competicion, verificacion de derivaciones y generacion de ejercicios con solucion.
- Analisis de documentacion tecnica con imagenes: el pipeline image-text-to-text permite extraer datos de diagramas, esquemas y capturas, con 83,53 en RealWorldQA como referencia de comprension de escenas reales.
- Prototipado de agentes con decodificacion especulativa: los pesos DFlash2 integrados permiten activar `--spec dflash2 --draft-tokens 7 --lm-head-draft` para reducir la latencia de generacion en flujos multi-paso.
- Evaluacion comparativa de cuantizacion a 4 bits: al coexistir con los checkpoints BF16 y NVFP4 de origen, sirve para medir la perdida de precision de un perfil W4A4 frente a BF16 en tareas de razonamiento y vision.
- Despliegue con requisitos de privacidad: al ejecutarse en local bajo NInfer y no depender de API externa, encaja en entornos donde los datos no pueden salir de la maquina.
- Reproduccion de evaluaciones con EvalScope: el artefacto esta asociado a la suite NInfer EvalScope 1.9.0, de modo que puede reutilizarse como referencia en comparativas internas de runtimes.
- Investigacion sobre decodificacion especulativa: al incluir el cabezal propuesto optimizado y admitir entre 1 y 15 tokens borrador, permite estudiar el equilibrio entre tasa de aceptacion y throughput.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (campo `verified: false` en la model-index). Fuente: NInfer EvalScope 1.9.0, https://github.com/Neroued/ninfer/tree/master/eval

| Benchmark | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| IFBench | Text generation | Prompt-level strict (0-shot, rule) | 77,00 | No |
| AIME 2025 | Text generation | Accuracy (0-shot, rule) | 96,67 | No |
| AIME 2026 | Text generation | Accuracy (0-shot, rule) | 96,67 | No |
| GPQA-Diamond | Text generation | Accuracy (0-shot, rule) | 90,40 | No |
| ERQA | Image-text-to-text | Accuracy (0-shot, rule) | 66,25 | No |
| RealWorldQA | Image-text-to-text | Accuracy (0-shot, rule) | 83,53 | No |

No se han publicado resultados de latencia, throughput ni consumo energetico en la informacion disponible. Tampoco se publica comparacion con el checkpoint BF16 de origen, por lo que el coste en precision de la cuantizacion NVFP4/FP8 no puede cuantificarse con estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 22,09 GiB solo para el artefacto, mas el espacio de trabajo del runtime (KV cache, buffers de vision y de decodificacion especulativa).
- GPU soportada: NVIDIA RTX 5090 (`sm_120a`) es la unica tarjeta explicitamente requerida. El artefacto necesita mas de 22 GiB, por lo que las GPU Blackwell de consumo con 16 GB o menos no son viables.
- GPU recomendadas: RTX 5090 (32 GB) es la configuracion objetivo. Otras GPU (A100, H100, B200) no se mencionan y, al exigirse `sm_120a`, no estan cubiertas por el binario tal y como se documenta.
- Cabe en GPU de consumo: si, en RTX 5090. No en RTX 5080, 5070 Ti, 5070 ni equivalentes con menos VRAM.
- Sistema operativo: Linux de 64 bits. No se documenta soporte para Windows ni macOS.
- Toolkit: CUDA Toolkit 13.1 o superior.
- Opciones de despliegue: exclusivamente NInfer compilado desde fuente, revision `385b30ce` o posterior. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers; la model card marca `inference: false` y no ofrece binarios ni target de instalacion.
- Latencia y throughput: no disponibles. Unicamente se documenta la existencia de decodificacion especulativa DFlash2 como mecanismo de aceleracion, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen3.8-27B-nvfp4-NInfer (este) | 27B | no disponible | `.ninfer` (NVFP4/FP8 mixto) | Apache 2.0 | IFBench 77,00; AIME 2025 96,67; GPQA-Diamond 90,40; RealWorldQA 83,53 |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors (BF16) | no disponible | no disponible |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | no disponible | safetensors (NVFP4) | no disponible | no disponible |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (modelo borrador) | no disponible | no disponible | no disponible | no disponible |

La diferencia practica entre las tres primeras filas no esta en la arquitectura ni en el numero de parametros, sino en el empaquetado y el runtime: la version BF16 y la de unsloth se distribuyen como safetensors y pueden cargarse con herramientas estandar, mientras que este artefacto solo funciona con NInfer sobre `sm_120a`. No hay datos publicos en la informacion disponible que permitan comparar la calidad de salida entre las tres variantes.

## Limitaciones y advertencias

- Benchmarks no verificados: los seis resultados estan marcados con `verified: false` y proceden de una unica fuente, la suite NInfer EvalScope 1.9.0 del propio proyecto de runtime.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay validacion independiente de la comunidad.
- Dependencia fuerte del runtime: requiere NInfer compilado desde fuente en la revision `385b30ce` o posterior, sin instalador ni binario empaquetado.
- Compatibilidad muy restringida: solo Linux de 64 bits, CUDA 13.1+ y GPU `sm_120a` (RTX 5090). Queda excluido cualquier despliegue en A100, H100 o aceleradores no NVIDIA.
- Ecosistema cerrado: no es un checkpoint Transformers, ni safetensors, ni GGUF; no se puede cargar con vLLM, llama.cpp, Ollama ni TGI.
- Riesgo de alucinacion: no se documentan tasas de error factual ni mecanismos de mitigacion; el modelo hereda el comportamiento del checkpoint base sin ajuste adicional.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o equidad.
- Perdida de precision por cuantizacion: el perfil usa NVFP4 W4A4 en parte de las matrices y no se ofrece comparacion contra el BF16 de origen, por lo que el impacto en tareas sensibles a la precision es desconocido.
- Idiomas y contexto sin documentar: no hay lista de idiomas soportados ni longitud de contexto declarada, lo que dificulta planificar despliegues multilingues o con ventanas largas.
- Ambiguedad de publicacion: el artefacto aparece bajo HandleCoding, pero la model card se declara fuente versionada de neroued/Qwen3.8-27B-nvfp4-NInfer; conviene verificar cual es el repositorio canonico y su revision.
- Tamano del repositorio frente al artefacto: el repo ocupa 47,4 GB mientras que el fichero declarado son 22,09 GiB; hay que comprobar el SHA-256 tras la descarga para asegurarse de obtener el archivo correcto.
- Licencia: la model card declara Apache 2.0, permisiva para uso comercial, pero no especifica la licencia del checkpoint base Qwen/Qwen3.8-27B ni de los pesos de unsloth, que conviene revisar antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace (HandleCoding): https://huggingface.co/HandleCoding/Qwen3.8-27B-nvfp4-NInfer
- Repositorio de referencia citado en la model card (neroued): https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos NVFP4 de origen: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Pesos companion de decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Runtime NInfer: https://github.com/Neroued/ninfer
- Instrucciones de compilacion desde fuente: https://github.com/Neroued/ninfer#quick-start
- Revision minima del runtime: https://github.com/Neroued/ninfer/commit/385b30ce1757bafe5a82680e9b5aeb940b14eec1
- Suite de evaluacion NInfer EvalScope 1.9.0: https://github.com/Neroued/ninfer/tree/master/eval
