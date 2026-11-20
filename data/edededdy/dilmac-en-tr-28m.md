# edededdy/dilmac-en-tr-28m

## Resumen

Dilmaç 28M es un modelo de traducción automática unidireccional inglés→turco desarrollado por el usuario edededdy. Con 28,1 millones de parámetros totales (18,9 millones excluyendo embeddings), se posiciona como una alternativa extremadamente ligera para traducción de frases, capaz de ejecutarse íntegramente en CPU de portátil y en GPUs integradas. El nombre proviene del término turco antiguo *dilmaç*, que designaba al intérprete.

El modelo emplea una arquitectura encoder-decoder Transformer propia, con 8 capas de encoder y solo 2 de decoder, un vocabulario BPE compartido de 24.000 tokens y una longitud máxima de 128 tokens de entrada. No utiliza la interfaz estándar `generate()` de Transformers, sino un método `translate()` específico implementado en código personalizado (`trust_remote_code=True`), lo que condiciona su integración en pipelines convencionales.

Su relevancia radica en la relación calidad/tamaño: alcanza 54,83 chrF++ en FLORES-200 devtest con apenas 112 MB en fp32 (56 MB en bf16), lo que lo hace viable para traducción offline, entornos con recursos limitados y despliegues en dispositivos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (8 capas encoder + 2 capas decoder) |
| Parametros totales | 28.099.584 (18,9M excluyendo embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de entrada (nivel de frase) |
| Tipos de cuantizacion | fp32 (112 MB), bf16 (56 MB); no se documentan otras |
| Idiomas soportados | inglés (en), turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder con una configuración asimétrica: 8 capas en el encoder y únicamente 2 en el decoder. Emplea un vocabulario BPE de 24.000 tokens compartido entre inglés y turco, y está diseñado para traducción a nivel de frase con un límite de 128 tokens de entrada. La implementación es PyTorch plano de aproximadamente 300 líneas, distribuida en `modeling_dilmac.py` y `configuration_dilmac.py`, y requiere `trust_remote_code=True` para cargarse. No utiliza `generate()` ni `pipeline()` de Transformers.

La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La decodificación por defecto emplea búsqueda por haz con `num_beams=4`, `no_repeat_ngram_size=4`, `max_length_ratio=1.5` y `length_penalty=1.0`; según el autor, estas son las mejores opciones encontradas (una beam de 5 con length penalty 0,6 no mejoró los resultados).

## Capacidades

- Traducción automática unidireccional inglés→turco a nivel de frase.
- Procesamiento por lotes con ordenación interna por longitud (`batch_size` configurable, por defecto 32).
- Decodificación configurable: greedy (`num_beams=1`, unas 3× más rápida, ~1,5 chrF++ peor) o búsqueda por haz.
- Prevención de bucles mediante `no_repeat_ngram_size=4`.
- Inferencia en fp32 y bf16, con calidad equivalente entre ambas precisiones según el autor.
- Ejecución en CPU, GPU integrada y GPU dedicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas exclusivamente al par en→tr.

## Casos de uso

- Traducción offline en aplicaciones de escritorio: el modelo cabe en 56 MB en bf16 y funciona en CPU de portátil a ~30 frases/s, lo que permite integrarlo en herramientas de traducción local sin conexión ni dependencias de API.
- Traducción por lotes de documentación técnica: con `batch_size=32` y procesamiento ordenado por longitud, puede traducir corpus de frases cortas (interfaces, mensajes de error, cadenas de localización) de forma masiva y económica.
- Preprocesamiento en pipelines de NLP: traducción de consultas o titulares en→tr antes de tareas posteriores (clasificación, búsqueda, análisis de sentimiento) en sistemas donde el turco es el idioma de destino.
- Localización de aplicaciones móviles: el reducido tamaño (112 MB fp32) permite empaquetar el modelo en apps Android o iOS para traducción de cadenas de UI sin backend.
- Prototipado rápido en investigación: su licencia Apache-2.0 y su tamaño permiten experimentar con arquitecturas encoder-decoder asimétricas y evaluar estrategias de decodificación sin infraestructura pesada.
- Traducción en entornos con GPU integrada: en una AMD Radeon 890M alcanza ~70 frases/s con beam 4 en bf16, suficiente para traducción interactiva en portátiles sin GPU dedicada.
- Filtrado y enriquecimiento de datos: traducción de titulares o descripciones en inglés a turco para construir datasets bilingües o índices de búsqueda cross-lingüe.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), calculados con sacrebleu sobre los conjuntos de test completos. chrF++ con `word_order=2`; BLEU con tokenización 13a.

| Conjunto de test | Frases | Greedy chrF++ / BLEU | Beam 4 chrF++ / BLEU | Beam 4 (bf16) chrF++ / BLEU |
|---|---|---|---|---|
| FLORES-200 devtest | 1.012 | 53,29 / 24,38 | **54,83 / 26,32** | 54,75 / 26,10 |
| WMT17 newstest2017 | 3.006 | 47,86 / 18,59 | **49,37 / 20,17** | 49,36 / 20,16 |
| NTREX-128 | 1.997 | 44,05 / 15,58 | **45,48 / 17,12** | 45,60 / 17,10 |

Velocidad medida en portátil con lotes de 64 frases en→tr:

| Dispositivo | Greedy | Beam 4 |
|---|---|---|
| AMD Radeon 890M (GPU integrada), fp32 | ~145 frases/s | ~46 frases/s |
| AMD Radeon 890M (GPU integrada), bf16 | no disponible | ~70 frases/s |
| CPU de portátil, bf16 | no disponible | ~30 frases/s |

## Requisitos de hardware

- VRAM estimada: ~112 MB en fp32 y ~56 MB en bf16 para los pesos; el consumo adicional depende del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con soporte bf16; el autor reporta mediciones en AMD Radeon 890M integrada. No se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en cualquier GPU consumer, incluida la GPU integrada de un portátil, y funciona íntegramente en CPU.
- Opciones de despliegue: únicamente mediante `transformers` con `trust_remote_code=True` y el método `model.translate()`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no usa `generate()` ni `pipeline()`.
- Latencia y throughput: ~30 frases/s en CPU bf16 con beam 4; ~70 frases/s en Radeon 890M bf16 con beam 4; ~145 frases/s en Radeon 890M fp32 en modo greedy.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualitativamente, el modelo se sitúa en la categoría de traducción neuronal de muy pequeño tamaño (menos de 30M de parámetros) y unidireccional, un nicho poco poblado frente a modelos multilingües de mayor tamaño. Cualquier comparación con alternativas requeriría evaluar dichos modelos en los mismos conjuntos (FLORES-200, WMT17, NTREX-128) con la misma configuración de decodificación, dato no disponible.

## Limitaciones y advertencias

- Traducción unidireccional: no soporta turco→inglés ni ningún otro par de idiomas.
- Límite de 128 tokens de entrada y diseño a nivel de frase; no está pensado para documentos largos ni para mantener coherencia entre frases.
- El autor documenta omisiones en las salidas: por ejemplo, pierde "in the stairwell" y "Or anything else!" en los ejemplos de la model card.
- No utiliza `generate()` ni `pipeline()`, lo que rompe la compatibilidad con herramientas estándar del ecosistema (vLLM, TGI, llama.cpp, Ollama) y complica el despliegue en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_dilmac.py` y `configuration_dilmac.py` antes de usarlo en entornos sensibles.
- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni evaluación de robustez; el riesgo de alucinación o de traducciones incorrectas en dominios especializados (legal, médico, técnico) no está cuantificado.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edededdy/dilmac-en-tr-28m
- sacrebleu (herramienta de evaluación citada): https://github.com/mjpost/sacrebleu
- FLORES-200 (dataset de evaluación): https://huggingface.co/datasets/facebook/flores
- NTREX-128 (dataset de evaluación): https://github.com/MicrosoftTranslator/NTREX
- WMT17 newstest2017 (dataset de evaluación): https://huggingface.co/datasets/wmt/wmt17
