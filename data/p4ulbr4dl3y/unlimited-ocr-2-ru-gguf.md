# p4ulbr4dl3y/unlimited-ocr-2-ru-gguf

## Resumen

Unlimited-OCR-2 es un modelo de OCR y parseo de documentos desarrollado por Baidu, publicado bajo licencia MIT. Se trata de un transformer de arquitectura MoE (mezcla de expertos) con 2.938.670.848 parámetros totales (aproximadamente 3,3B según la model card), diseñado específicamente para la transcripción de documentos con preservación de estructura: bloques, tablas y cajas delimitadoras. Este repositorio concreto (`p4ulbr4dl3y/unlimited-ocr-2-ru-gguf`) ofrece cuantizaciones GGUF del modelo original, con la particularidad de que la variante Q4_K_M está calibrada mediante una imatrix sobre 92 páginas de documentos rusos reales.

La relevancia de esta ficha radica en dos factores. Primero, el autor ha tenido que escribir un parche de arquitectura para llama.cpp, ya que el soporte mainline solo cubre la versión 1 del modelo (DeepSeek-OCR), y convertir el modelo como si fuera v1 produce una estructura de documento silenciosamente incorrecta. Segundo, el modelo requiere un sampler `no_repeat_ngram` que mainline llama.cpp no implementa, y el autor proporciona un segundo parche que lo añade como sampler de primera clase con API pública, flag de CLI y campo HTTP.

El resultado es un paquete de despliegue completo: pesos GGUF, codificador de visión en F16, matriz de calibración, parches de llama.cpp y binarios CUDA precompilados (sm_75). El modelo soporta ruso e inglés y está pensado para servir mediante `llama-server` con el parche aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención DASH/SR-SWA y RoPE 2D de página (parche propio para llama.cpp) |
| Parametros totales | 2.938.670.848 (~3,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens en la configuración de ejemplo (`-c 4096`); contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (2,0 GB), Q8_0 (3,0 GB); codificador de visión en F16 (788 MB) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es `baidu/Unlimited-OCR-2`, un transformer MoE de aproximadamente 3,3B parámetros. La model card del repositorio GGUF detalla dos diferencias arquitectónicas respecto a Unlimited-OCR v1 (DeepSeek-OCR) que impiden una conversión directa: (1) RoPE 2D de página, donde la posición es `(offset dentro de la página, paridad de página)` en lugar del índice de secuencia, con 63 pares de frecuencias para el eje de tokens y 1 par para el eje de página; y (2) atención DASH/SR-SWA, en la que cada token atiende a una ventana local a nivel de token (128) más hasta `top_k` = 12 bloques remotos de 32 tokens, seleccionados por capa mediante un router (`head_cls` con resúmenes de bloque, prior entmax-1.5 y sesgo logarítmico aditivo). Convertido como v1 (atención completa y RoPE 1D), el modelo carga y ejecuta pero produce estructura de documento incorrecta de forma silenciosa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación destacable de este repositorio es la calibración de cuantización: la Q4_K_M se calibró con una imatrix generada sobre 92 páginas de documentos rusos reales, frente a las cuantizaciones upstream calibradas en benchmarks de documentos chinos e ingleses. El autor también mantiene los tensores del router en F32 y proporciona la matriz de calibración (`uocr2-ru.imatrix.gguf`, 20 MB) para recuantizar.

## Capacidades

- OCR de documentos con salida estructurada: bloques delimitados y cajas `[x1,y1,x2,y2]` normalizadas a `[BOX]` en la verificación del autor.
- Parseo multipágina: el prompt repite el par `<PAGE><image>` por página en orden, con la etiqueta `<PAGE>` siempre antes de la imagen.
- Parseo de tablas, incluida la verificación sobre una página de tabla densa que provocaba bucles de tokens sin el sampler de guarda.
- Procesamiento de documentos legales y regulatorios (verificado sobre páginas de un reglamento).
- Soporte bilingüe ruso-inglés, con la cuantización Q4_K_M optimizada específicamente para documentos en ruso.
- Integración con llama.cpp mediante `llama-server`, con API HTTP compatible con endpoints.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión general, audio: no disponible; el pipeline es image-text-to-text orientado a OCR.

## Casos de uso

- Digitalización de expedientes regulatorios: el modelo transcribe páginas completas conservando la secuencia de bloques y las coordenadas de cada caja, lo que permite reconstruir el layout del documento original. Verificado por el autor con un 100,00% de similitud carácter a carácter frente a BF16 en páginas de un reglamento no incluidas en el conjunto de calibración.
- Extracción de tablas densas en documentos históricos: con el sampler `no_repeat_ngram` a `n=24` y `window=1024`, la página de tabla que sin guarda se truncaba a 3187 tokens termina en 1326 tokens con `finish=stop`, evitando respuestas truncadas que aparentan estar completas.
- Procesamiento de corpus documentales en ruso: la imatrix de calibración se generó sobre 92 páginas reales en ruso, por lo que la Q4_K_M es la variante recomendada para este idioma; el autor verifica 11 de 12 páginas byte-idénticas frente a la salida sin guarda.
- Despliegue en GPU de gama media para OCR por lotes: el autor reporta tiempos de 5 s y 4 s por página con Q4_K_M en una T4 (frente a 7 s y 5 s con BF16), lo que permite estimar el throughput de un pipeline de digitalización.
- Servicio HTTP de OCR integrado en aplicaciones: `llama-server` con `--mmproj mmproj-uocr2-f16.gguf -ngl 99 -c 4096 -np 1 --temp 0` expone el modelo como endpoint compatible, y el parche añade el campo por petición `{"no_repeat_ngram_size": 24, "no_repeat_ngram_window": 1024}`.
- Recuantización con calibración propia: el repositorio incluye `uocr2-ru.imatrix.gguf` y el comando `llama-quantize --imatrix` documentado, de modo que un equipo puede generar su propia matriz sobre su dominio documental.
- Entornos con restricciones de compilación: el tarball `binaries/uocr2-llama-cpp-cuda75.tar.gz` evita unos 80 minutos de compilación en Colab, con la advertencia de que es solo sm_75 y de que se construyó antes del parche del sampler.

## Benchmarks y rendimiento

El autor publica verificaciones de fidelidad y tiempos, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación los datos disponibles:

| Prueba | Resultado |
|---|---|
| BF16 GGUF vs referencia del vendedor (`UnlimitedOCRForCausalLM.infer()`, misma página, greedy) | 99,94% de similitud de caracteres, secuencia de bloques idéntica, coordenadas con desviación de ±1 (redondeo bf16/f32) |
| Página de reglamento 1, BF16 vs Q4_K_M (holdout) | 100,00% de similitud; 878 caracteres; 7 s vs 5 s en T4 |
| Página de reglamento 2, BF16 vs Q4_K_M (holdout) | 100,00% de similitud; 482 caracteres; 5 s vs 4 s en T4 |
| Guarda `n=8` (12 páginas reales, Q4_K_M, Metal, greedy) | 3/12 idénticas a sin guarda, hasta 11% de deriva de texto; tabla arreglada con 1073 tokens |
| Guarda `n=24`, `window=1024` | 11/12 byte-idénticas; tabla arreglada: de 3187 tokens truncados a 1326 tokens con `finish=stop` |
| Guarda `n=35`, `window=1024` | 11/12 idénticas; tabla arreglada con 927 tokens, repeticiones cortas residuales |
| Guarda `n=35`, `window=128` | 11/12 idénticas; tabla no arreglada, descontrol |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 2,0 GB de pesos más 788 MB del codificador de visión en F16; Q8_0 ocupa 3,0 GB más el mismo codificador.
- GPU verificada por el autor: NVIDIA T4 (tiempos de 4-7 s por página según cuantización) y ejecución en Metal (Apple Silicon) para las pruebas del sampler.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU con al menos 4-5 GB de VRAM libre debería alojar Q4_K_M con el codificador de visión.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos; el autor no enumera modelos concretos de consumo.
- Opciones de despliegue: llama.cpp con los parches aplicados (`llama-server`, `llama-cli`, `llama-imatrix`, `llama-quantize`), fijado a la versión `b11913` (commit `7aca0d2ea8`). Binarios CUDA precompilados para sm_75 incluidos.
- Latencia y throughput: 4-5 s por página con Q4_K_M en T4 y 5-7 s con BF16, en decodificación greedy sobre páginas de un reglamento.
- Compilación: `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=75`, con los objetivos `llama-server`, `llama-imatrix` y `llama-quantize`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR-2 (este GGUF) | ~3,3B (2.938.670.848) | 4096 en config de ejemplo | MIT | GGUF | Requiere parche de arquitectura y sampler `no_repeat_ngram` en llama.cpp; calibración rusa |
| Unlimited-OCR v1 (DeepSeek-OCR) | no disponible | no disponible | no disponible | no disponible | Soportado por mainline llama.cpp; atención completa y RoPE 1D, sin atención DASH/SR-SWA |
| baidu/Unlimited-OCR-2 (original) | ~3,3B | no disponible | MIT | safetensors | Referencia del vendedor, servido con SGLang y sampler `no_repeat_ngram` nativo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no funciona correctamente en llama.cpp mainline: sin el parche `unlimited-ocr2.patch` carga y ejecuta pero produce estructura de documento incorrecta de forma silenciosa.
- Sin el sampler `no_repeat_ngram`, el modelo puede entrar en bucles de tokens en tablas históricas densas y no emitir `</BLOCK>`; la respuesta truncada aparenta estar completa. Las penalizaciones de repetición y DRY no son sustituto: el autor indica que DRY empeora la salida.
- El valor recomendado es `n=24`, `window=1024`; `window=256` también corrigió la página problemática, pero `n=35` con `window=128` no la corrige. Los prompts multipágina requieren `window=4096`.
- El formato del prompt es estricto: `<PAGE>` debe ir antes de la imagen; la imagen primero produce basura.
- Los binarios precompilados son solo para sm_75 y se construyeron antes del parche del sampler, por lo que no incluyen `--no-repeat-ngram-size`.
- La calibración de la Q4_K_M está orientada a documentos rusos; el comportamiento en otros dominios no está verificado en la información disponible.
- Idiomas soportados limitados a ruso e inglés; no hay datos sobre otros idiomas.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: MIT, sin restricciones comerciales indicadas en la información disponible.
- El contexto de ejemplo es de 4096 tokens; no se especifica el máximo del modelo base ni el comportamiento con páginas muy largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/p4ulbr4dl3y/unlimited-ocr-2-ru-gguf
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- llama.cpp (versión fijada b11913, commit `7aca0d2ea8`): https://github.com/ggml-org/llama.cpp
