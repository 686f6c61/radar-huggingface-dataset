# malaiwah/qwen3-5-tiny-random-gguf-q4_0-format

## Resumen

El modelo `malaiwah/qwen3-5-tiny-random-gguf-q4_0-format` es un arnés de prueba (fixture) de almacenamiento y lectura en formato GGUF, creado por el usuario `malaiwah`. No es un modelo de lenguaje entrenado: se construyó a partir de un checkpoint aleatorio diminuto de Qwen3.5, con el fin de poder inspeccionar el empaquetado q4_0, la reconstrucción de tensores, la contabilidad de alcance y las comparaciones de fidelidad de la cabeza de salida. Pertenece a una familia de derivados de cuantización con pesos coincidentes, pensada para depurar herramientas de desarrollo y reproducibilidad sin necesidad de descargar modelos de producción.

El modelo base del que deriva es `malaiwah/qwen3-5-gguf-tiny-random-bf16`, y este artefacto concreto es una cuantización q4_0 de ese checkpoint. La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, pero el archivo GGUF exporta únicamente la vista de lenguaje y la cabeza de salida, sin la torre de visión. El fichero alberga 246.612 parámetros totales según los safetensors, con un vocabulario propio de 272 tokens. No se dispone de longitud de contexto ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (Qwen3_5ForConditionalGeneration), vista texto/cabeza, split-QKV/Z, key heads 2, value heads 6 |
| Parametros totales | 246.612 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4_0 (GGUF, RTN round-to-nearest) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Nota adicional | Los parametros generados antes del empaquetado se declaran como 281.300; el numero de 246.612 corresponde al recuento real de safetensors. El tamano del repositorio es 0.0 GB, y los archivos de pesos locales ocupan 156.544 bytes (0.149 MiB). |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5, configurado según la geometría canónica de conversión GGUF de Qwen35: split-QKV/Z, con 2 cabezas de clave y 6 cabezas de valor. El modelo original incluye pesos de visión pequeños, pero el exportador GGUF solo conserva la vista de lenguaje y la cabeza de salida. No se incorporan las torres de visión, ni tampoco variantes MoE, Qwen4-Exp, layouts fusionados históricos ni MTP.

El entrenamiento no ha ocurrido. El modelo parte de inicialización aleatoria y no se ha ejecutado ningún optimizador, calibración ni proceso de alineación. La cuantización aplicada es round-to-nearest (RTN), es decir, un empaquetado simple de pesos sin optimización de tipo GPTQ, AWQ, AutoRound, ModelOpt o calibración activada. No se ha verificado la calidad de reconstrucción mediante kernels de serving reales ni aritmética de activaciones nativa de llama.cpp. La reconstrucción probada se realiza en CPU con PyTorch nativo en BF16.

## Capacidades

- No ofrece capacidades de generación de texto, razonamiento, codigo, matematicas ni vision como modelo util; los pesos no estan entrenados y el texto generado carece de calidad semantica.
- No soporta tool calling, function calling ni agentes.
- No dispone de interfaz de lenguaje multilingue; el tokenizador es un tokenizador de bytes independiente con un vocabulario de 272 tokens, que no corresponde al vocabulario upstream de Qwen3.5.
- No incluye modo de pensamiento, vision ni audio en el artefacto GGUF; la torre de vision del modelo original no esta exportada.
- Su capacidad real es tecnica: sirve para inspeccionar el empaquetado de tensores GGUF en q4_0, verificar la reconstruccion de pesos, medir la fidelidad de la cabeza de salida propia y reproducir resultados en un alcance estrecho.
- Permite depurar adaptadores de modelo, lectores de almacenamiento, cargas estrictas de tensores y herramientas de reproducibilidad sin descargar un checkpoint de tamano de produccion.

## Casos de uso

- Pruebas de regresion para lectores GGUF: el fixture permite detectar cambios en la logica de empaquetado o deserializacion sin necesitar un modelo de produccion. Un desarrollador puede cargar el archivo en un pipeline de CI y afirmar que los tensores se reconstruyen con el patron esperado.
- Depuracion de adaptadores de modelo: al ser un checkpoint diminuto, sirve para probar la compatibilidad de adaptadores que esperan una arquitectura Qwen3.5, verificando que la carga estricta de tensores no falle por desajustes de nombres o formatos.
- Desarrollo de decodificadores de almacenamiento: el artefacto permite estudiar la contabilidad de elementos empaquetados frente al recuento real de parametros, un punto util para quien este implementando un lector GGUF desde cero.
- Verificacion de reproducibilidad: al tener un hash de identidad del checkpoint fuente, se puede comprobar que un proceso de cuantizacion o exportacion reproduce los mismos bytes de salida entre entornos.
- Validacion de arquitecturas de la familia Qwen3.5: el modelo sirve como control para comprobar que las herramientas de conversion generan la vista de lenguaje correcta (sin vision, sin MoE, sin MTP) a partir de un checkpoint fuente.
- Pruebas de ajuste en entornos sin GPU: al ser un archivo de 0.149 MiB y ejecutarse en CPU, es adecuado para test de humo en entornos de integracion continua con recursos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos valores registrados pertenecen a una medicion interna de la cabeza de salida propia del modelo, cuya tabla se interrumpe en la documentacion. Este artefacto no esta disenado para evaluar calidad de lenguaje ni rendimiento de inferencia, y cualquier comparacion con modelos entrenados en MMLU, HumanEval o GSM8K seria engañosa.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; la inferencia del artefacto se ejecuta en CPU.
- Espacio en disco: 156.544 bytes para los archivos de pesos locales (0.149 MiB).
- GPU recomendadas: no aplica; ninguna GPU es necesaria.
- Puede ejecutarse en cualquier CPU moderna. El entorno registrado usa Python 3.12, Torch 2.11.0+cpu, Transformers 5.16.1 y dos hilos de procesamiento.
- Opciones de despliegue: puede cargarse con Transformers (clase nativa Qwen3_5ForConditionalGeneration) o mediante herramientas que soporten GGUF, aunque no se ha validado con kernels de serving como vLLM o llama.cpp.
- Latencia y throughput: no disponibles. No se ha medido rendimiento de serving en este fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Relacion | Licencia |
|---|---|---|---|---|
| malaiwah/qwen3-5-gguf-tiny-random-bf16 | 281.300 (antes de empaquetado) | BF16 | Modelo base nativo de este artefacto, cuantizado para producir el hijo q4_0 | MIT |
| malaiwah/qwen3-5-tiny-random-gguf-q4_0-format | 246.612 | GGUF q4_0 | Derivado cuantizado del modelo base | MIT |

No se dispone de una tabla comparativa autonoma con tres alternativas externas, los datos disponibles solo permiten comparar el artefacto con su modelo base y con el resto de derivados de la familia Matched-Weight Quantization Families, cuyos nombres individuales no se detallan en esta informacion.

## Limitaciones y advertencias

- Los pesos no estan entrenados: el modelo es una inicializacion aleatoria, no un asistente de lenguaje, y no debe utilizarse para inferencia real.
- No existe calidad de lenguaje ni de instrucciones: cualquier texto generado carece de sentido semantico.
- La cuantizacion RTN es un empaquetado round-to-nearest, no una optimizacion; no se ha ejecutado GPTQ, AWQ, AutoRound ni calibrado ModelOpt/CT/QAT.
- No se ha validado la paridad con hardware GPU, NPU ni kernels de serving; tampoco se ha comprobado la determinismo entre plataformas.
- El contexto largo no ha sido evaluado fuera del panel registrado; no se pueden inferir comportamientos holgados de ventana.
- El artefacto no incluye la torre de vision del modelo original; el archivo GGUF solo contiene la vista de lenguaje y la cabeza de salida.
- El vocabulario de 272 tokens es independiente y no reproducira el comportamiento de un tokenizador Qwen3.5 real.
- No debe registrarse ni representarse como el modelo base de la familia; los enlaces de linaje distinguen este artefacto como control/hijo.
- No es valido para medir calidad de cuantizadores: los ficheros se exportan sin optimizacion y sin verificacion por kernels nativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malaiwah/qwen3-5-tiny-random-gguf-q4_0-format
- Modelo base (checkpoint fuente): https://huggingface.co/malaiwah/qwen3-5-gguf-tiny-random-bf16/tree/490767e58441a55c5a9f6375ea0e31e2cdc9da76
- Dataset raiz de fidelidad: https://huggingface.co/datasets/malaiwah/qwen3-5-gguf-tiny-fidelity-root-v1
- Paquete de evidencia de almacenamiento: https://huggingface.co/datasets/malaiwah/qfs-qwen-gguf-tiny-cpu-format-v1
- Coleccion de familias de cuantizacion con pesos coincidentes: https://huggingface.co/collections/malaiwah/qfs-matched-weight-quantization-families-6a9f071d93dbd3dbf0a1e844
