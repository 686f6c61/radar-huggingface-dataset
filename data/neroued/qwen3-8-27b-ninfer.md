# neroued/Qwen3.8-27B-NInfer

## Resumen

Qwen3.8-27B-NInfer es una conversión del modelo multimodal Qwen3.8-27B de Alibaba Qwen al formato propietario `.ninfer` del motor de inferencia NInfer, desarrollado por el usuario neroued. No se trata de un checkpoint nuevo ni de un ajuste fino: es un artefacto de pesos cuantizados y empaquetados específicamente para ejecutarse en GPUs NVIDIA RTX 5090 (arquitectura `sm_120a`) mediante el runtime NInfer compilado desde fuente. El repositorio pesa 79,5 GB, aunque el artefacto principal `qwen3_8_27b.ninfer` ocupa 19,03 GiB (20.437.521.664 bytes).

El modelo base es Qwen3.8-27B, un transformer multimodal de 27.000 millones de parámetros con arquitectura declarada `Qwen3_5ForCausalLM`, capacidades de imagen-texto-a-texto y un modo de razonamiento ("thinking") activado por defecto con esfuerzo `xhigh`. La conversión emplea cuantización mixta: proyecciones en Q4/Q5 para el cuerpo de texto y `q8_g32_fp16` para el embedding de tokens y la cabeza de salida completa. Incluye además los pesos de visión, MTP (multi-token prediction) y el cabezal especulativo DFlash2 procedente de `z-lab/Qwen3.8-27B-DFlash2`.

Su relevancia práctica radica en que permite ejecutar un modelo multimodal de 27B en una única GPU de consumo (RTX 5090) con decodificación especulativa y contexto de hasta 240.000 tokens en servidor, algo que con checkpoints en precisión completa requeriría hardware de centro de datos. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque el formato y el runtime limitan la portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Qwen3_5ForCausalLM`), con torre de visión, MTP y cabezal especulativo DFlash2 |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | hasta 240.000 tokens en servidor (`--max-context 240000`); 32.768 en el ejemplo de CLI |
| Tipos de cuantizacion | Q4/Q5 en proyecciones del cuerpo de texto; `q8_g32_fp16` en embedding y cabeza de salida; KV cache en `fp8` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor versión 3, 1.190 objetos: 1.184 tensores y 6 recursos); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La ficha no documenta el entrenamiento del modelo base; los datos disponibles describen únicamente el proceso de conversión y empaquetado. El artefacto conserva la arquitectura del Qwen3.8-27B original: un transformer causal con torre de visión para entrada imagen-texto, más componentes auxiliares empaquetados en el mismo contenedor. El archivo incluye pesos de visión, MTP, DFlash2, el cabezal de propuesta optimizado y recursos de frontend; los pesos de visión y especulativos solo se cargan si se seleccionan al arrancar, lo que reduce el consumo de memoria en modo texto.

La innovación técnica principal es el uso de decodificación especulativa con DFlash2 (pesos complementarios de `z-lab/Qwen3.8-27B-DFlash2`, revisión `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`), configurable con `--spec dflash2 --draft-tokens 7 --proposal-head optimized`, con recuentos de borrador de 1 a 15. También se admite MTP con `--spec mtp --draft-tokens 3`. La plantilla de chat `qwen3_8.jinja` activa el razonamiento por defecto con esfuerzo `xhigh` y retiene el razonamiento de turnos cerrados. El runtime exige compilación desde fuente en Linux de 64 bits y no distribuye binarios empaquetados.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen3.8 y modo thinking activado por defecto.
- Razonamiento matemático de competición: los resultados declarados en AIME 2025 y AIME 2026 son del 96,67 % en ambos casos.
- Razonamiento científico de nivel experto: 87,37 % en GPQA-Diamond.
- Seguimiento de instrucciones: 77,67 % en IFBench (prompt-level strict, 0-shot).
- Comprensión multimodal de imagen y texto: pipeline `image-text-to-text`, con 66,25 % en ERQA y 82,22 % en RealWorldQA.
- Soporte de vídeo y de historial de chat estructurado a través de la CLI de NInfer.
- Decodificación especulativa integrada (MTP y DFlash2) para acelerar la generación.
- Gestión de contexto largo con KV cache en `fp8` y capacidad de contexto automática en servidor.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistencia matemática y resolución de problemas de competición: con un 96,67 % declarado en AIME 2025 y AIME 2026, el modelo es adecuado para tutores automáticos, verificación de demostraciones y generación de problemas resueltos paso a paso con el modo thinking activado.
- Análisis de documentación científica y técnica: el 87,37 % en GPQA-Diamond y el contexto de hasta 240.000 tokens permiten procesar artículos completos, informes o patentes en una sola pasada y responder preguntas de nivel experto.
- Procesamiento de documentos escaneados y capturas: la torre de visión y el 82,22 % en RealWorldQA lo hacen útil para extraer información de imágenes del mundo real, como fotos de pizarras, etiquetas o interfaces.
- Asistentes conversacionales de largo recorrido: el servidor NInfer admite `--max-concurrency 2` con contexto de 240.000 tokens por petición, lo que encaja en chatbots con historial extenso y memoria de conversación.
- Automatización de tareas de instrucción estricta: el 77,67 % en IFBench sugiere un uso razonable en pipelines donde la salida debe respetar formatos, restricciones y plantillas concretas.
- Inferencia local en estación de trabajo con una sola GPU: al caber en una RTX 5090 con cuantización Q4/Q5, permite desplegar un asistente multimodal privado sin depender de la nube, útil para entornos con requisitos de confidencialidad.
- Evaluación y prototipado de decodificación especulativa: los desarrolladores del runtime pueden comparar MTP y DFlash2 con distintos recuentos de borrador (1 a 15) sobre el mismo artefacto.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (NInfer EvalScope 1.9.0, 0-shot, corrección por reglas, no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| AIME 2025 | Text generation | Accuracy (0-shot, rule) | 96,67 |
| AIME 2026 | Text generation | Accuracy (0-shot, rule) | 96,67 |
| GPQA-Diamond | Text generation | Accuracy (0-shot, rule) | 87,37 |
| IFBench | Text generation | Prompt-level strict (0-shot, rule) | 77,67 |
| ERQA | Image-text-to-text | Accuracy (0-shot, rule) | 66,25 |
| RealWorldQA | Image-text-to-text | Accuracy (0-shot, rule) | 82,22 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- GPU: NVIDIA GeForce RTX 5090 obligatoria (arquitectura `sm_120a`); el runtime no soporta otras GPU según la documentación disponible.
- Sistema operativo: Linux de 64 bits.
- Almacenamiento: el artefacto principal ocupa 19,03 GiB; el repositorio completo, 79,5 GB.
- VRAM: no se declara una cifra explícita; el tamaño del artefacto (19,03 GiB) más la KV cache en `fp8` y el contexto configurable determinan el consumo. Con `--max-context 240000` y concurrencia 2, la KV cache crece de forma significativa.
- Cabe en GPU de consumo: sí, en RTX 5090, que es el único hardware soportado.
- Despliegue: binario `ninfer` para CLI y `ninfer-serve` para servidor HTTP local (por defecto en `127.0.0.1:8080`), ambos compilados desde fuente. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario.
- Aceleración: decodificación especulativa con MTP (`--draft-tokens 3`) o DFlash2 (`--draft-tokens 7`, rango 1 a 15) y cabezal de propuesta optimizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Rendimiento declarado |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-NInfer | 27B | hasta 240.000 tokens | `.ninfer` | Apache 2.0 | RTX 5090 exclusivamente | AIME 2025: 96,67; GPQA-Diamond: 87,37; RealWorldQA: 82,22 |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors (presumible) | Apache 2.0 | GPU de centro de datos o múltiples GPU de consumo | no disponible |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (pesos especulativos) | no aplica | no disponible | no disponible | no disponible | no aplica (componente auxiliar) |

La comparación con alternativas de otros fabricantes del mismo tamaño no está disponible en la información proporcionada. La diferencia clave frente al modelo base es el formato y el hardware objetivo: NInfer sacrifica portabilidad (solo RTX 5090, solo Linux, solo runtime propio) a cambio de cuantización agresiva y decodificación especulativa integrada.

## Limitaciones y advertencias

- Dependencia total del runtime NInfer: el artefacto no es un checkpoint de Transformers, ni safetensors, ni GGUF, por lo que no puede cargarse con vLLM, llama.cpp, Ollama, TGI ni la librería `transformers`.
- Hardware restringido a una única GPU (RTX 5090, `sm_120a`) y a Linux de 64 bits; no hay binarios empaquetados ni objetivo de instalación, solo compilación desde fuente.
- Los benchmarks son declarados por el autor, marcados como no verificados y generados con su propia herramienta (NInfer EvalScope 1.9.0); deben tomarse con cautela.
- La cuantización Q4/Q5 en las proyecciones del cuerpo de texto puede degradar la precisión frente al modelo base en precisión completa, especialmente en tareas de razonamiento fino.
- El modo thinking está activado por defecto con esfuerzo `xhigh`, lo que incrementa los tokens generados, la latencia y el coste computacional si no se ajusta.
- Idiomas soportados no documentados; no hay garantía explícita de calidad multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene verificar las condiciones del runtime NInfer y de los pesos DFlash2 de `z-lab`, cuya licencia no se detalla.
- El contexto de 240.000 tokens con concurrencia 2 exige una KV cache considerable en `fp8`; debe validarse el consumo real de VRAM antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del runtime NInfer: https://github.com/Neroued/ninfer
- Guía de compilación: https://github.com/Neroued/ninfer#build
- Guía de CLI: https://github.com/Neroued/ninfer/blob/master/docs/cli.md
- Conversión de pesos: https://github.com/Neroued/ninfer/blob/master/docs/weight-conversion.md
- Herramientas de evaluación: https://github.com/Neroued/ninfer/tree/master/eval
- Plantilla de chat Qwen3.8: https://github.com/Neroued/ninfer/blob/98dada0e03cb073fd07f905400b5904bc6e82759/tools/chat_templates/qwen3_8.jinja
- Pesos DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
