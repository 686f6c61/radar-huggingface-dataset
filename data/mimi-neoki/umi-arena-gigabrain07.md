# mimi-neoki/umi-arena-gigabrain07

## Resumen

UMI Arena — GigaBrain-0.7 (step 10.000) es un checkpoint de ajuste fino del modelo base `open-gigaai/GigaBrain-0.7-3.5B-Base`, un modelo vision-language-action (VLA) de 3.529.100.784 parámetros orientado a manipulación robótica bimanual. Lo publica el usuario `mimi-neoki` como participación en la competición UMI Arena, empaquetado con la librería LeRobot y una implementación de política personalizada que adapta el modelo a la interfaz de evaluación de la competición. El checkpoint corresponde al paso de optimización 10.000 y no requiere ejecutar GigaWorld ni descargar el backbone en tiempo de inferencia.

El modelo resuelve el problema de generar acciones motoras de robot a partir de observaciones multimodales: dos imágenes RGB (mano izquierda y derecha) a resolución 480x640, la pose relativa entre manos en cuaterniones xyzw, dos ángulos de pinza y un prompt de texto. La salida es un chunk de acciones de forma `(50,16)` a 10 Hz, donde cada fila contiene incrementos de pose en el marco del cuerpo (xyz + cuaternión xyzw) para ambas manos seguidas de ángulos absolutos de pinza. Internamente emplea codificación rotation-6D y el marco de la mano izquierda actual para ambas poses futuras.

Su relevancia es acotada pero clara: es un artefacto de competición reproducible, con validación documentada (pérdida de flow-matching de 0,07065616 sobre 32.468 frames), checker oficial superado y latencias medidas en H100 80 GB (p50 286,1 ms, p95 301,8 ms). No es un modelo de propósito general: su licencia y su ámbito de uso están restringidos a los términos de la competición y del dataset de acceso limitado subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de GigaBrain-0.7; política LeRobot con flow matching y horizonte de acción 50 |
| Parametros totales | 3.529.100.784 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos exportados en BF16; buffers de geometría, normalización y rotary-position en FP32. No se documentan otras cuantizaciones (GGUF, INT8, etc.) |
| Idiomas soportados | en |
| Licencia | `umi-arena-competition-and-upstream-terms` (términos de competición y del upstream; upstream GigaBrain declara Apache-2.0, con términos Gemma/PaliGemma retenidos) |
| Formato de pesos | safetensors (BF16), con tokenizer offline incluido y estadísticas de normalización guardadas |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `open-gigaai/GigaBrain-0.7-3.5B-Base` (revisión `2936d6f263279a58d4f9153b2efa597812c194cb`), un VLA de 3.500 millones de parámetros. La política se implementa sobre LeRobot con una cabeza de flow matching: el horizonte de acción es 50 y la inferencia configurada usa 10 pasos. El tokenizer proviene de `google/paligemma2-3b-pt-224` (revisión `96eeb174da13ca1a2b247e4d0867436296c36420`), con el token de propiocepción que emplea GigaBrain. Los parámetros se exportan en BF16 mientras que la geometría, la normalización y los buffers de rotary-position permanecen en FP32; el adaptador y el backend vendorizado incorporan cambios locales para la interfaz de Arena, carga offline y precisión mixta compatible.

El entrenamiento usó un subconjunto curado de `airoa-org/yubi-corl2026-umi-arena`: 5.009 episodios de acción primitiva, 1.409 UUIDs de grabación y 317.101 frames a 10 Hz, lo que equivale a aproximadamente 8,07 pasadas con batch global 256 hasta el paso 10.000. La validación se hizo por separado con 504 episodios, 134 UUIDs y 32.468 frames, sin solapamiento de UUIDs con entrenamiento. No se documenta el uso de RLHF o DPO; el objetivo es flow matching supervisado sobre trayectorias. Las estadísticas de normalización guardadas se usan sin reajuste. El checkpoint original en FP32 se conserva fuera del repositorio, y no se incluyen estado del optimizador, datos de entrenamiento ni grabaciones.

## Capacidades

- Generación de acciones robóticas bimanuales: produce chunks de 50 pasos a 10 Hz con incrementos de pose y ángulos de pinza para ambas manos.
- Percepción visual multimodal: consume imágenes RGB izquierda y derecha de 480x640x3 en uint8.
- Condicionamiento por prompt de texto: la política acepta un prompt textual que puede cambiarse en tiempo de ejecución (verificado por el checker).
- Entrada de propiocepción: pose relativa entre manos en cuaterniones xyzw más dos ángulos de pinza.
- Manipulación bimanual: etiquetada explícitamente como `bimanual-manipulation`.
- Carga offline: el paquete funciona con caché de HF vacía y sin descarga del backbone en la imagen de evaluación fija.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación en la competición UMI Arena: el paquete está diseñado para cargarse mediante `Policy(checkpoint_dir)` en la imagen `ghcr.io/airoa-org/umi-arena-torch:1.0.0` y superar el checker oficial, por lo que su uso principal es la submission a dicha competición.
- Investigación en manipulación bimanual: sirve como referencia reproducible de un VLA de 3.500 millones de parámetros ajustado sobre 317.101 frames de acciones primitivas, útil para comparar políticas y estudiar el efecto del número de pasos de entrenamiento.
- Reproducción de baselines VLA: al incluir tokenizer, estadísticas de normalización y adaptador, permite reproducir la inferencia sin reentrenar ni descargar el backbone.
- Pruebas de latencia y despliegue en H100: con p50 de 286,1 ms por llamada en H100 80 GB, es adecuado para medir el coste de un VLA de este tamaño en un pipeline de control a 10 Hz.
- Estudio de flow matching aplicado a robótica: el horizonte de 50 y los 10 pasos de inferencia configurados permiten analizar el compromiso entre calidad de acción y coste computacional.
- Adaptación de políticas a interfaces de competición: el código de adaptador y el backend vendorizado documentado en `lerobot_policy_gigabrain/_vendor/VENDORED.md` sirven como plantilla para portar otros VLA a una interfaz de evaluación fija.
- Validación de carga offline en contenedores: el caso de caché HF vacía y carga sin red es directamente reutilizable para entornos de producción aislados.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación (flow matching) | 0,07065616 | 32.468 frames, seed 20261102, batch 32 |
| Checker oficial | PASS: 10 passed, 0 warnings, 0 failed | Ejecutado el 2026-11-03, revisión `f60d4e6af6a9801a5780ad1603e8433a63f27d93` |
| Latencia p50 | 286,1 ms | H100 80 GB, 20 llamadas al checker |
| Latencia p95 | 301,8 ms | H100 80 GB, 20 llamadas al checker |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni tasas de éxito en robot real) en la información disponible. El autor advierte explícitamente que la pérdida de validación no es una tasa de éxito en tarea real y que las latencias corresponden a H100, no a la RTX 5070 Ti de la competición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.529.100.784 parámetros en BF16, los pesos ocupan aproximadamente 7,1 GB, a lo que hay que sumar buffers FP32 y activaciones.
- GPU recomendadas: H100 80 GB es la única configuración con latencias publicadas (p50 286,1 ms, p95 301,8 ms). La competición emplea RTX 5070 Ti, pero no se han publicado mediciones en esa GPU.
- GPU de consumo: no se documenta si cabe en GPU de consumo; el tamaño de pesos en BF16 (unos 7,1 GB) lo haría teóricamente viable en tarjetas con 12-16 GB o más, pero no hay confirmación del autor.
- Opciones de despliegue: la vía soportada es la imagen `ghcr.io/airoa-org/umi-arena-torch:1.0.0` con `torch` y LeRobot mediante `Policy(checkpoint_dir)`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 286,1 ms y p95 301,8 ms por llamada en H100 80 GB; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umi-arena-gigabrain07 (este) | 3.529.100.784 | no disponible | VLA bimanual (flow matching) | Términos de competición y upstream | Hugging Face, 0 descargas, 0 likes |
| open-gigaai/GigaBrain-0.7-3.5B-Base | 3.500 millones (aprox.) | no disponible | VLA base | Apache-2.0 (según el autor) | Hugging Face (modelo base) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia restringida: el checkpoint se entrenó sobre un dataset de competición de acceso limitado y su uso y disponibilidad están sujetos a los términos de la competición y a permisos del organizador; no es una release de propósito general.
- Términos heredados: se retienen los términos y avisos aplicables de Gemma/PaliGemma para los componentes heredados, además de la licencia Apache-2.0 declarada por el upstream GigaBrain.
- Ámbito de tarea muy estrecho: solo manipulación bimanual en la interfaz UMI Arena; no es un modelo de lenguaje general ni un asistente conversacional.
- Idioma: únicamente inglés (`en`) según la model card.
- Métrica de validación no concluyente: la pérdida de flow matching de 0,07065616 no equivale a tasa de éxito en robot real.
- Latencias no extrapolables: las mediciones son en H100 80 GB, no en la RTX 5070 Ti de la competición, por lo que el rendimiento en el hardware objetivo es desconocido.
- Sin datos de sesgo ni alucinación: no se documentan análisis de sesgo, y el riesgo de alucinación no aplica en el sentido habitual, aunque sí existe riesgo de acciones incorrectas o inseguras en manipulación física.
- Estado del optimizador y datos no incluidos: no se puede reanudar el entrenamiento desde este repositorio; el checkpoint FP32 original se conserva fuera.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo.
- Dependencia de la imagen de evaluación: el funcionamiento verificado asume la imagen fija y el checker en revisiones concretas; cambios en el entorno pueden invalidar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mimi-neoki/umi-arena-gigabrain07
- Modelo base: https://huggingface.co/open-gigaai/GigaBrain-0.7-3.5B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/airoa-org/yubi-corl2026-umi-arena
- Tokenizer: https://huggingface.co/google/paligemma2-3b-pt-224
- Licencia del checkpoint: https://huggingface.co/mimi-neoki/umi-arena-gigabrain07/blob/main/LICENSE
- Imagen de runtime: ghcr.io/airoa-org/umi-arena-torch:1.0.0 (digest `sha256:50791b4660b9c37caef32898e41f12aac3b2705a136fd62d7c837b7a4d856a1e`)
- Revisión del checker oficial: `f60d4e6af6a9801a5780ad1603e8433a63f27d93`
- Revisión del modelo base: `2936d6f263279a58d4f9153b2efa597812c194cb`
- Revisión del tokenizer: `96eeb174da13ca1a2b247e4d0867436296c36420`
