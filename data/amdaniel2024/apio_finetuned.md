# amDANIEL2024/apio_finetuned

## Resumen

`apio_finetuned` es un modelo de traducción automática neuronal especializado en el par de idiomas acholí-inglés, desarrollado por Amanyire Daniel (usuario `amDANIEL2024`). Se trata de un transformer encoder-decoder de tipo pre-LN con 6 capas en el codificador y 6 en el decodificador, 89 millones de parámetros y una dimensión de modelo de 640. El modelo traduce en ambas direcciones (acholí a inglés e inglés a acholí) mediante un token de prefijo que indica el idioma destino.

El modelo se construyó en dos fases: un preentrenamiento sobre pares generados por traducción automática (el corpus `tulati`, donde la columna acholí es salida de NLLB-1.3B ajustado por Sunbird) y un ajuste fino posterior sobre el split de entrenamiento de SALT, que contiene traducciones humanas. Esta segunda fase es la que aporta valor real, ya que corrige parcialmente el sesgo de datos sintéticos del preentrenamiento.

Su relevancia radica en cubrir un par de idiomas de bajos recursos (acholí, lengua nilótica hablada en Uganda y Sudán del Sur) con un modelo pequeño, ligero y de licencia MIT, desplegable en hardware muy modesto. No es un modelo de propósito general ni compite con los grandes multilingües, pero ofrece una base reproducible y abierta para una combinación lingüística poco atendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (89M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ach (acholí), en (inglés) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32); tokenizador SentencePiece (`spm.model`); inferencia mediante `apio.py` (PyTorch, no compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar con normalización pre-LN, 6 capas en cada bloque, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 con activación GELU. Los embeddings de entrada, los del decodificador y la proyección de salida están atados (weight tying), lo que explica el recuento compacto de 89M de parámetros. El tokenizador es un SentencePiece compartido de 32.000 piezas, entrenado únicamente sobre texto acholí e inglés.

El entrenamiento se dividió en dos etapas. Primero, preentrenamiento sobre el corpus `tulati`, que contiene 1.534.699 filas originales; tras aplicar los filtros de calidad de tulati se descartaron 61.272 filas, se eliminaron 2.680 pares con lados idénticos y duplicados exactos, y la descontaminación contra SALT dev/test eliminó 1 par, quedando 1.470.746 pares (2.000 reservados para validación). Cabe destacar que la columna acholí de tulati es traducción automática generada por `Sunbird/translate-nllb-1.3b-salt`, no texto humano. Después, ajuste fino sobre el split de entrenamiento de SALT (traducciones humanas) en ambas direcciones, con tasa de aprendizaje 6e-5 y parada temprana sobre la pérdida de SALT dev (paciencia de 5 validaciones); el checkpoint publicado corresponde al paso 2000.

## Capacidades

- Traducción bidireccional acholí a inglés e inglés a acholí con un único modelo, seleccionando la dirección mediante el prefijo `<2eng>` o `<2ach>` en el texto de origen.
- Traducción por lotes: la función `translate` acepta tanto una cadena como una lista de cadenas.
- Decodificación por beam search configurable (beam 4 por defecto).
- Inferencia en GPU si está disponible, con caída automática a CPU.
- Manejo de frases cortas y oraciones de hasta aproximadamente 128 piezas por lado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es estrictamente un modelo de traducción secuencia a secuencia.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales de ONG, salud pública o educación al acholí y viceversa, con revisión humana posterior dado el carácter sensible del contenido.
- Localización de interfaces y aplicaciones: traducción de cadenas cortas de UI (menús, botones, mensajes de error) gracias a su bajo coste computacional y a la posibilidad de ejecutarlo en CPU.
- Preservación lingüística y corpus paralelos: generación de borradores de traducción para ampliar corpus acholí-inglés con revisión de hablantes nativos, ya que el modelo es abierto (MIT) y reproducible.
- Investigación en traducción de bajos recursos: punto de partida para experimentos de ajuste fino, aumento de datos o comparación con modelos multilingües grandes en un par lingüístico poco atendido.
- Traducción de contenido web y redes sociales: procesamiento de frases sueltas o párrafos cortos en pipelines de scraping o moderación, donde la latencia y el coste importan más que la calidad literaria.
- Herramientas educativas: asistencia a estudiantes y docentes bilingües para comprender textos en inglés o acholí, con la advertencia de que requiere revisión en contextos de alta exigencia.
- Prototipado y demos: al ser un modelo de 0,4 GB y 89M de parámetros, se puede desplegar en entornos de desarrollo, portátiles o contenedores pequeños para pruebas de concepto.

## Benchmarks y rendimiento

| Conjunto | Direccion | n | BLEU | chrF | chrF++ | Baseline copia (chrF++) |
|---|---|---|---|---|---|---|
| SALT test | ach→eng | 500 | 24,95 | 48,23 | 46,86 | 11,38 |
| SALT test | eng→ach | 500 | 19,15 | 46,94 | 44,33 | 11,81 |
| SALT dev | ach→eng | 500 | 24,30 | 47,59 | 46,37 | 11,07 |
| SALT dev | eng→ach | 500 | 20,99 | 48,55 | 45,93 | 11,73 |

Las puntuaciones se obtuvieron con beam 4 y penalización de longitud 0,6, evaluadas con sacreBLEU (firmas `bleu: nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.5.1`; `chrf` y `chrf++` con `nc:6`, `nw:0` y `nw:2` respectivamente). El baseline de copia (devolver la frase de origen sin cambios) se incluye para contextualizar cuánto de la puntuación procede de palabras compartidas, nombres y números. Los resultados de dev son ligeramente optimistas porque se usaron para seleccionar el checkpoint; el dato principal es el de test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 89M de parámetros (aproximadamente 0,36 GB de pesos más memoria de activaciones y beam search).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, T4 o incluso iGPU modernas pueden ejecutarlo sin problemas. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el modelo es adecuado para portátiles y entornos sin acelerador.
- Opciones de despliegue: inferencia mediante el script propio `apio.py` incluido en el repositorio (PyTorch + SentencePiece + safetensors). No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo `transformers` estándar y no se publican pesos GGUF.
- Latencia y throughput: no se han publicado mediciones en la información disponible; por el tamaño del modelo se espera latencia de milisegundos por frase en GPU y de decenas a cientos de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| `apio_finetuned` | 89M | 256 posiciones | ach, en | MIT | safetensors + script PyTorch propio |
| `Sunbird/translate-nllb-1.3b-salt` | 1.300M (aprox.) | no disponible en la informacion | multilingue (incluye ach) | no disponible en la informacion | transformers |
| `amDANIEL2024/apio_base` | 89M | 256 posiciones | ach, en | MIT | safetensors (preentrenamiento sin ajuste fino humano) |
| NLLB-200 (variantes pequeñas) | 600M–1.300M | 512 tokens (tipico) | 200 idiomas | CC-BY-NC (uso no comercial) | transformers |

La comparación más directa es con `apio_base`, el mismo modelo antes del ajuste fino sobre SALT, y con el traductor NLLB ajustado por Sunbird que generó los datos sintéticos de preentrenamiento. Frente a los modelos multilingües grandes, `apio_finetuned` sacrifica cobertura lingüística y capacidad general a cambio de un tamaño 10-15 veces menor, licencia permisiva y despliegue trivial.

## Limitaciones y advertencias

- Los pares de preentrenamiento son salida de traducción automática y el ajuste fino se limita a SALT, por lo que el modelo puede degradarse en dominios, dialectos, ortografías o code-switching distintos a los de SALT.
- Puede omitir o alterar el significado, especialmente en números, nombres propios y palabras poco frecuentes; no debe usarse en contenido médico, legal o de alto riesgo sin revisión humana.
- Modelo a nivel de frase: entradas superiores a unas 128 piezas se truncan o degradan, y el contexto máximo es de 256 posiciones.
- Las salidas no han sido revisadas por hablantes nativos de acholí, según reconoce el propio autor.
- No es compatible con la API `AutoModel` de `transformers`; requiere el script `apio.py` y el tokenizador SentencePiece incluidos en el repositorio.
- No se publican pesos cuantizados (GGUF, etc.) ni integración con servidores de inferencia estándar, lo que limita su uso en stacks de producción convencionales.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni sobre los sesgos de los datos de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/apio_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/apio_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor NLLB ajustado por Sunbird: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto: domusdeiug@gmail.com
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
