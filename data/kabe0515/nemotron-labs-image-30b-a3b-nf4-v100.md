# kabe0515/Nemotron-Labs-Image-30B-A3B-NF4-V100

## Resumen

Nemotron-Labs-Image-30B-A3B-NF4-V100 es una cuantizacion NF4 del modelo text-to-image Nemotron-Labs-Image-30B-A3B de NVIDIA, publicada por el usuario kabe0515. El objetivo del repositorio no es entrenar un modelo nuevo, sino hacer posible la inferencia del modelo original en una unica GPU Tesla V100 de 32 GB (arquitectura Volta, sm_70), un hardware que queda fuera del soporte oficial del modelo base (que requiere cuatro H100 de 80 GB, vLLM 0.21 y CUDA 13).

El checkpoint original pesa 121,6 GiB repartidos en 32 shards; tras la cuantizacion NF4 de todos los tensores de expertos MoE, el repositorio ocupa 25,2 GiB en disco (27,1 GB segun el Hub). El modelo base es un transformer MoE con 18.184.163.136 parametros totales segun safetensors (la nomenclatura "30B-A3B" del nombre sugiere aproximadamente 30.000 millones de parametros con unos 3.000 millones activos, aunque el conteo real de safetensors es de 18,18 mil millones; se desconoce si el nombre comercial incluye componentes adicionales como el tokenizador visual).

La relevancia del repositorio es practica: demuestra que un modelo de generacion de imagen de gran escala puede ejecutarse en hardware Volta mediante cuantizacion offline de expertos, un cargador personalizado que mantiene los pesos empaquetados en GPU y decodificacion restringida para forzar la rejilla visual declarada. Incluye mediciones reales de latencia, VRAM y validacion de correctitud frente al cargador no optimizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) para generacion de imagen |
| Parametros totales | 18.184.163.136 (segun safetensors) |
| Parametros activos | no disponible (el nombre indica "A3B", pero no se detalla en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (block size 64, escalas absmax por bloque en fp16, sin doble cuantizacion) solo en tensores de expertos; pesos no-expertos en dtypes originales |
| Idiomas soportados | no disponible |
| Licencia | nvidia-license (licencia "other" con nombre nvidia-license) |
| Formato de pesos | safetensors (32 shards, layout identico al original) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE: cada capa MoE contiene 128 expertos enrutados y 46 expertos compartidos, con seleccion top-6 de 128 expertos por token. Los tensores de expertos fusionados en el modelo original tienen forma `[128, 1856, 2688]`. El checkpoint cuantizado almacena los expertos como tensores 2D por experto bajo el prefijo `backbone.`, y el cargador incluido se encarga de remapear nombres, mantener los expertos enrutados empaquetados en NF4 y desquantizar solo los expertos que cada token selecciona, reproduciendo exactamente el forward MoE original.

El proceso de cuantizacion se realizo offline en CPU: se cuantizaron los 5.934 tensores de expertos (5.888 enrutados + 46 compartidos) con un codebook NF4 propio, ya que cuantizar durante `from_pretrained` no cabe en 32 GB porque el cargador materializa primero los pesos en precision completa. La optimizacion de velocidad identifico que la desquantizacion en vuelo suponia el 89% del tiempo de decodificacion, y de ese tiempo el 57% del tiempo CUDA correspondia a copias host-to-device de pesos y escalas empaquetados en cada token. El cargador rapido mantiene pesos y escalas empaquetados residentes en GPU, agrupa la desquantizacion por expertos seleccionados, anade una cache LRU de expertos desquantizados en fp16 y usa una ruta dedicada de decodificacion de un solo token. Ademas, se incorpora un `LogitsProcessor` que lee el tamano declarado en la cabecera de imagen (`height=… width=…`) y fuerza exactamente esa rejilla: no permite `<|img_end|>` hasta completar las filas declaradas, restringe los tokens visuales al interior de una fila y fuerza el separador de fila al ancho declarado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni otras innovaciones del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones como 1024x1024.
- Generacion de codigos visuales estructurados en una rejilla declarada en la cabecera de imagen (por ejemplo, 64x64 para 1024x1024).
- Decodificacion de imagenes mediante el tokenizador visual L24SQ incluido.
- Inferencia en una unica GPU V100 de 32 GB mediante cuantizacion NF4 de expertos.
- Decodificacion restringida para garantizar la integridad de la rejilla visual (sin filas incompletas ni terminacion prematura).
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes en infraestructura Volta existente: el modelo permite reutilizar servidores con Tesla V100 de 32 GB para text-to-image de gran escala, evitando migrar a H100. El cargador rapido alcanza 0,062 s/token en micro-benchmark y 0,112 s/token en generacion completa con muestreo.
- Prototipado de pipelines text-to-image en investigacion academica: al caber en una sola GPU de 32 GB, investigadores sin acceso a clusters H100 pueden experimentar con un MoE de imagen de gran escala y validar prompts antes de escalar a produccion.
- Generacion de imagenes por lotes con control de rejilla: el decodificador restringido garantiza que cada imagen tenga la rejilla declarada completa (por ejemplo, 64x64 codigos visuales para 1024x1024), lo que evita fallos de validacion en pipelines automatizados que exigen integridad de la secuencia.
- Evaluacion de cuantizacion NF4 en modelos MoE de imagen: el repositorio incluye comprobaciones de correctitud (secuencias greedy identicas al cargador sin optimizar, desquantizacion por lotes bit a bit identica) que sirven como referencia para estudiar el impacto de NF4 en calidad visual.
- Despliegue de bajo coste para demostraciones interactivas: con 23,54 GiB de VRAM pico durante generacion (cache de 64 expertos) y 25,66 GiB en total, una V100 de 32 GB puede servir generaciones de 1024x1024 en aproximadamente 465,6 s por imagen, adecuado para demos no interactivas o generacion asincrona.
- Reproduccion de investigacion sobre decodificacion restringida: el `LogitsProcessor` de `stage5_constrained.py` es un ejemplo concreto de como forzar estructuras de salida en modelos generativos de imagen, reutilizable como referencia para otros modelos con rejillas visuales.

## Benchmarks y rendimiento

Mediciones reales publicadas por el autor en V100 32 GB con este checkpoint y cargador:

| Metrica | Valor |
|---|---|
| Tamano del checkpoint en disco | 25,2 GiB (original: 121,6 GiB en 32 shards) |
| Velocidad de decodificacion, primer cargador funcional | ~61 s/token (sin cache, recomputo completo) |
| Velocidad de decodificacion, cache + desquantizacion en GPU | 0,45 s/token |
| Velocidad de decodificacion, `stage4_fast.py` | 0,062 s/token (micro-benchmark: prompt real, greedy, 64 tokens, cache de 256 expertos) |
| Prefill (prompt de 75 tokens) | 1,16 s |
| VRAM pico, cargador rapido (cache 256) | 29,25 GiB (de 32 GiB) |
| Generacion 1024x1024 extremo a extremo, `stage5_constrained.py` | 465,6 s medidos (4.175 tokens, muestreo oficial temp 0,9 / seed 42, cache de 64 expertos → 0,112 s/token extremo a extremo) |
| VRAM pico, ejecucion restringida (cache 64) | 23,54 GiB durante generacion, 25,66 GiB en total |
| Tokenizador L24SQ (round-trip en V100) | PSNR 21,39 dB (256 tokens, 256x256) y 24,60 dB (1.024 tokens, 512x512) en una imagen de prueba |

Comprobaciones de correctitud: las secuencias greedy del cargador rapido son identicas a las del cargador sin optimizar para prompt dummy y prompt de imagen real (64 tokens cada uno); la desquantizacion por lotes en GPU es bit a bit identica a la referencia; una ejecucion completa restringida de 1024x1024 paso la validacion estricta oficial `extract_codes` (tamano declarado 1024x1024, rejilla 64x64 completa, 4.096 codigos visuales, fotograma completo sin filas faltantes).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 23,54 GiB durante generacion y 25,66 GiB en total con cache de 64 expertos; 29,25 GiB con cache de 256 expertos. Minimo practico: 32 GB.
- GPU recomendadas: Tesla V100 32 GB (Volta, sm_70), unica configuracion validada. El modelo base oficial requiere cuatro H100 80 GB.
- Cabe en GPU consumer: no disponible; el modelo cuantizado ocupa 25,2 GiB en disco y el pico de VRAM medido es de 25,66-29,25 GiB, por encima de GPUs consumer tipicas de 24 GB. No se ha validado en RTX 4090 ni similares.
- Opciones de despliegue: PyTorch/Transformers con CUDA 12.6 y los scripts incluidos (`stage4_fast.py`, `stage5_constrained.py`). vLLM 0.21 y CUDA 13 no son compatibles con Volta (vLLM ha eliminado sm_70 y las toolchains CUDA 13 ya no lo soportan). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,062 s/token en micro-benchmark greedy con cache 256; 0,112 s/token extremo a extremo con muestreo y cache 64; 465,6 s por imagen 1024x1024; prefill de 1,16 s para 75 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware oficial | Notas |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B-NF4-V100 (este) | 18,18 mil millones (safetensors) | no disponible | nvidia-license | 1x V100 32 GB | Cuantizacion NF4 de expertos, cargador personalizado, decodificacion restringida |
| nvidia/Nemotron-Labs-Image-30B-A3B (base) | 30B-A3B (segun nombre) | no disponible | nvidia-license | 4x H100 80 GB, vLLM 0.21, CUDA 13 | Modelo original sin cuantizar, 121,6 GiB en 32 shards |
| Otros modelos text-to-image de gran escala | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre benchmarks comparativos con otros modelos text-to-image en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NF4 se aplica unicamente a los tensores de expertos; los pesos no-expertos conservan sus dtypes originales, por lo que el ahorro de memoria es parcial y el pico de VRAM sigue siendo elevado (25,66-29,25 GiB).
- La generacion libre puede producir secuencias invalidas: el autor observo 62 de 64 filas completas y una fila de 65 tokens en lugar de 64, lo que la validacion estricta oficial `extract_codes` rechaza. Es necesario usar el decodificador restringido para garantizar integridad.
- La calidad visual tras NF4 no se ha evaluado de forma sistematica: solo se dispone de una comprobacion cualitativa (imagen de zorro en bosque nevado) y de mediciones PSNR del tokenizador en una unica imagen de prueba, no comparables con la cifra oficial de 29,57 dB (promedio sobre ~178K imagenes).
- El rendimiento medido es especifico de una V100 32 GB con CUDA 12.6 y PyTorch/Transformers; no se ha validado en otras GPU ni con otras pilas de software.
- vLLM y CUDA 13 no son compatibles con Volta, lo que limita las opciones de despliegue a PyTorch/Transformers y descarta aceleraciones propias de vLLM.
- La licencia nvidia-license ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de cualquier despliegue en produccion.
- No se dispone de informacion sobre sesgos, idiomas soportados, riesgo de alucinacion ni limitaciones de contexto del modelo base en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-26; se trata de una publicacion reciente y sin validacion comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabe0515/Nemotron-Labs-Image-30B-A3B-NF4-V100
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
