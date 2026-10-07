# AutomatosX/AX-Qwen3-VL-4B-Instruct-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Qwen3-VL-4B-Instruct-CUDA-AXQ-NVFP4-W4A4 es una cuantizacion de desarrollo del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicada por AutomatosX bajo licencia Apache-2.0. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de vision-lenguaje con 4.437.815.808 parametros que acepta imagen y texto como entrada y genera texto como salida. Esta version concreta aplica el formato AXQuant NVFP4 W4A4 sobre las proyecciones del bloque de lenguaje.

La relevancia de esta ficha no esta en el modelo base, sino en el pipeline de cuantizacion: se convierte a FP4 (E2M1) tanto los pesos como las activaciones de 252 tensores seleccionados del lenguaje, con escalas de bloque E4M3FN cada 16 valores y escalas globales en FP32. La torre de vision, los fusionadores DeepStack, los embeddings, las normalizaciones y la cabeza LM se conservan en BF16 original, verificados por igualdad. El resultado ocupa aproximadamente 3,65 GB de pesos exportados frente a los cerca de 8,9 GB que requeriria el modelo en BF16.

Se trata de un development preview no certificado: el propio autor indica que no se aporta ninguna garantia de calidad, exactitud MTP ni velocidad. La ejecucion se ha validado en vLLM 0.25.1 sobre RTX 5090 y Jetson Thor, con kernels nativos CutlassNvFp4LinearKernel. Es una pieza interesante para quien quiera evaluar inferencia FP4 W4A4 en hardware Blackwell, no para produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3-VL), con cuantizacion NVFP4 W4A4 aplicada al bloque de lenguaje |
| Parametros totales | 4.437.815.808 (modelo de origen); 3.633.315.840 parametros en NVFP4 |
| Parametros activos | no aplica (modelo denso, sin capas MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4: pesos y activaciones en E2M1 FP4, escalas E4M3FN por bloque de 16 valores, escalas globales FP32; torre de vision, fusionadores DeepStack, embeddings, norms y LM head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (retenida del modelo de origen, fichero LICENSE incluido) |
| Formato de pesos | safetensors con metadatos compressed-tensors; empaquetado para vLLM |
| Tamano del repositorio | 3,7 GB; bytes de pesos exportados: 3.652.924.576 |
| Tensores cuantizados | 252 tensores de lenguaje seleccionados; 461 tensores protegidos en BF16 |
| Revision de origen | Qwen/Qwen3-VL-4B-Instruct en `ebb281ec70b05090aa6165b016eac8ec08e71b17` |
| Commit de conversion | AXQuant, `1605cc05538fba8f12a5c8af051e3999ea06e947` |
| Libreria declarada | vLLM |

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo nuevo: es un proceso de cuantizacion post-entrenamiento (PTQ) sobre los pesos oficiales de Qwen3-VL-4B-Instruct. La conversion usa el encoder de pesos `numpy-reference` de AXQuant con cuantizacion RTN (round-to-nearest), sin AWQ ni otras tecnicas de correccion. La calibracion observa las entradas BF16 originales de cada matriz seleccionada, vincula sumas de verificacion del origen, formas de columna, numero de muestras y la imagen de prueba, y aplica un margen de 1,25 sobre el rango de activacion. Las matrices fusionadas Q/K/V y gate/up comparten escalas globales; las escalas de bloque de entrada se calculan de forma dinamica durante la inferencia.

Los detalles arquitectonicos relevantes son los del modelo base: un transformer Qwen3-VL con torre de vision y fusionadores DeepStack. La cuantizacion toca unicamente las proyecciones lineales del lenguaje, por lo que toda la ruta visual permanece en BF16 y preserva el comportamiento numerico del original en esa parte. No existe cabeza MTP entrenada en el modelo fuente y la cuantizacion no anade ninguna, de modo que no hay decodificacion especulativa multi-token nativa en este checkpoint.

La innovacion tecnica esta en el formato NVFP4: cuantizacion de 4 bits en pesos y activaciones (W4A4) con escalas de bloque E4M3FN de granularidad 16 y escalas globales FP32, apoyada en kernels CUTLASS nativos de FP4. No se dispone de informacion sobre composicion del dataset, numero de tokens de entrenamiento ni fases de RLHF/DPO del modelo original en el material proporcionado.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline declarado `image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y lectura de contenido en pantalla.
- OCR y comprension de documentos: el ejemplo oficial reconoce las tres lineas de una pagina de prueba calibrada.
- Razonamiento visual segun las capacidades heredadas del Qwen3-VL-4B-Instruct base; el autor advierte que no se ha certificado razonamiento visual general, precision en video ni OCR multilingue.
- Conversacion multi-turno: la etiqueta `conversational` y la plantilla de chat del tokenizer se conservan del modelo original.
- Tool calling y function calling: no documentado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Modo thinking explicito: no documentado en la informacion proporcionada.
- Entrada de video: no documentado en la informacion proporcionada.

## Casos de uso

- Validacion de pipelines NVFP4 en produccion: el modelo sirve como banco de pruebas para comprobar que vLLM con kernels `CutlassNvFp4LinearKernel` carga y ejecuta correctamente un checkpoint W4A4 antes de escalar a modelos mayores. El manifiesto y el `runtime_audit.json` permiten auditar la cadena de conversion.
- Digitalizacion de documentos escaneados: al mantener la torre de vision en BF16, la ruta de reconocimiento optico no sufre la cuantizacion; encaja en tareas de extraccion de texto de facturas, formularios o capturas de pantalla en hardware Blackwell.
- Asistencia visual en el borde (edge): el pack ligero de 3,65 GB y la receta probada en Jetson Thor con `--memory-fraction 0.065` permiten desplegar descripcion de imagenes y respuesta a preguntas basicas en dispositivos embebidos con GPU Blackwell.
- Prototipado de asistentes multimodales conversacionales: usando la plantilla de chat heredada, se puede construir un asistente que alterne turnos de texto e imagen en GPUs de consumo como la RTX 5090 con `--memory-fraction 0.30`.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicarse hashes de calibracion, shards de origen y artefactos de runtime, sirve como referencia reproducible frente a otras recetas (AWQ, GPTQ, GGUF) en estudios de degradacion por cuantizacion.
- Verificacion de integridad en CI de modelos: los ficheros `SHA256SUMS.txt`, `axquant_cuda_plan.json` y `axquant_cuda_manifest.json` permiten montar comprobaciones automaticas de que un artefacto desplegado coincide con el publicado.
- Investigacion sobre limites de W4A4 en modelos vision-lenguaje: util para medir si la cuantizacion de activaciones a 4 bits degrada tareas de grounding visual, dado que la ruta de vision queda intacta y aísla la variable del lenguaje.
- Base para destilacion o fine-tuning ligero posterior: al ser un checkpoint denso de 4B con licencia Apache-2.0, puede servir de punto de partida en experimentos que partan de pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe una prueba de humo (`image_text_smoke.py`) sobre una unica pagina en ingles que ademas se uso para calibracion, con verificacion de que las tres lineas de la pagina se reconocen y que no hay lineas repetidas. El propio autor indica explicitamente que esto no constituye una certificacion de calidad sobre datos retenidos y que no establece razonamiento visual general, precision en video, OCR multilingue, comportamiento en contexto largo ni velocidad de inferencia.

## Requisitos de hardware

- Pesos en disco y VRAM minima: 3,65 GB de pesos NVFP4 empaquetados en un repositorio de 3,7 GB. A esto hay que sumar activaciones, cache KV y el grafo de ejecucion; el autor no publica una cifra cerrada de VRAM total.
- GPU compatible obligatoria: se requieren kernels nativos FP4. La ejecucion probada usa RTX 5090 y Jetson Thor. El script de ejemplo rechaza explicitamente Marlin y cualquier emulacion, y verifica los kernels reales del worker antes de aceptar la salida.
- GPU sin soporte NVFP4 nativo: no es un destino viable segun la informacion disponible, al no aceptarse rutas de emulacion.
- Configuracion probada: vLLM 0.25.1, PyTorch 2.11.0+cu130, CUDA 13.0. Cada worker reporta 144 modulos `CutlassNvFp4LinearKernel`; no hay tablas MoE porque el modelo es denso.
- Ajuste de memoria: `--memory-fraction 0.30` en RTX 5090 y `--memory-fraction 0.065` en Jetson Thor con la receta probada. El prefill troceado (chunked prefill) esta activado.
- Opciones de despliegue: vLLM como libreria declarada. No se documentan llama.cpp, Ollama, TGI ni otras rutas en la informacion proporcionada.
- Latencia y throughput: no disponibles. La model card advierte que el arranque en modo eager, el JIT y los mensajes de autotuning pueden afectar a la latencia.
- Requisitos de software adicionales para el ejemplo: PyTorch con CUDA compatible, vLLM y Pillow; el ejemplo no ejecuta codigo remoto del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-VL-4B-Instruct-CUDA-AXQ-NVFP4-W4A4 (este) | 4.437.815.808 en origen; 3.633.315.840 en NVFP4 | NVFP4 W4A4, escalas E4M3FN por bloque de 16, globales FP32 | no disponible | Apache-2.0 | HuggingFace, 21 descargas, development preview |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | 4.437.815.808 | BF16 sin cuantizar | no disponible en la informacion proporcionada | Apache-2.0 | HuggingFace, revision `ebb281ec70b05090aa6165b016eac8ec08e71b17` |
| Otras cuantizaciones del mismo modelo base (AWQ, GPTQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible; no se han aportado datos comparables |

Unicamente se dispone de datos verificables frente al modelo base BF16. Cualquier comparacion con cuantizaciones alternativas requeriria mediciones de calidad y velocidad que no se han publicado para este checkpoint.

## Limitaciones y advertencias

- Estado de desarrollo: etiquetado como `development-preview`. El manifiesto del conversor mantiene `runtime_verified=false` y `quality_certified=false`; la evidencia de ejecucion no se convierte en certificado.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K, MMMU ni similares. No se puede afirmar nada sobre la degradacion real introducida por W4A4.
- Evaluacion no ciega: la unica prueba de calidad usa la misma pagina en ingles que sirvio para calibrar, por lo que no es un conjunto retenido.
- Sin MTP: el modelo fuente no tiene cabeza MTP entrenada y la cuantizacion no anade ninguna; no hay decodificacion especulativa nativa.
- Dependencia de version: los wheels publicados antiguos de AXQuant no contienen la ruta usada en esta conversion, lo que puede complicar la reproduccion exacta.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el comportamiento del modelo base sin medicion especifica.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para esta variante.
- Limitaciones de idioma: no se declaran idiomas soportados; el autor avisa de que no se ha establecido OCR multilingue.
- Contexto largo y video: comportamiento no validado segun la propia model card.
- Compatibilidad de hardware restringida: requiere GPUs con soporte FP4 nativo; se rechaza explicitamente la emulacion y Marlin.
- Uso comercial: la licencia Apache-2.0 del modelo base se conserva en el fichero `LICENSE`, pero conviene verificar las condiciones del modelo Qwen original antes de un despliegue comercial.
- Adopcion muy baja: 21 descargas y 0 likes en el momento de la consulta, con escasa validacion independiente por parte de la comunidad.
- Integridad: el ejemplo no ejecuta codigo remoto del modelo, pero la verificacion de kernels depende de que el entorno de vLLM sea el esperado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-CUDA-AXQ-NVFP4-W4A4
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revision concreta del modelo base usada en la conversion: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17
- Artefactos citados en el repositorio: `runtime_audit.json`, `provenance.json`, `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `activation_calibration.json`, `development_runtime_smoke.json`, `SHA256SUMS.txt`
- La busqueda web no devolvio resultados tecnicos relevantes: unicamente enlaces genericos a YouTube (https://www.youtube.com/), sin relacion con el modelo.
