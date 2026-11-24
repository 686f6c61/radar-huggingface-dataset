# amDANIEL2024/aine_finetuned

## Resumen

`aine_finetuned` es un modelo de traducción automática neuronal especializado en el par de lenguas africanas acholi (ach) y lugbara (lgg), desarrollado por el usuario amDANIEL2024. Se trata de un Transformer encoder-decoder de 89 millones de parámetros que traduce de forma directa entre ambas lenguas, sin pasar por el inglés como lengua pivote. La dirección de traducción se controla mediante un token de prefijo en la secuencia de origen (`<2lgg>` o `<2ach>`).

El modelo parte de `aine_base`, un checkpoint preentrenado exclusivamente con pares generados por traducción automática (procedentes del dataset `tulati`), y se afina posteriormente sobre los pares acholi-lugbara traducidos por humanos del conjunto de entrenamiento SALT. Esta combinación de preentrenamiento sintético a gran escala y ajuste fino con datos humanos es la aportación principal del modelo.

Su relevancia radica en que aborda un par lingüístico de bajos recursos para el que apenas existen sistemas de traducción directa, y lo hace con un modelo compacto (89M de parámetros, 0,4 GB) que puede ejecutarse en hardware modesto. La licencia MIT facilita su reutilización tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (89M); embeddings de entrada, de decoder y proyección de salida atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación sinusoidal); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | acholi (ach), lugbara (lgg) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder estándar con normalización previa (pre-LN), 6 capas en el encoder y 6 en el decoder, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 unidades con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros. El tokenizador es un SentencePiece unigram compartido de 32.000 piezas, entrenado únicamente con texto acholi y lugbara, que preserva mayúsculas y separa los dígitos. La codificación posicional es sinusoidal con un máximo de 256 posiciones.

El entrenamiento se realizó en dos fases. La primera, correspondiente a `aine_base`, consistió en 5 épocas y 23.859 pasos de optimizador sobre los pares acholi-lugbara del dataset `tulati`, en ambas direcciones. En `tulati` todas las columnas no inglesas son traducciones automáticas de una columna inglesa, generadas por `Sunbird/translate-nllb-1.3b-salt`, por lo que ambos lados de cada par de preentrenamiento son salida de máquina. La segunda fase, que da lugar a `aine_finetuned`, ajusta el modelo sobre los pares acholi-lugbara traducidos por humanos del conjunto de entrenamiento SALT. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Traducción directa bidireccional acholi → lugbara y lugbara → acholi, sin inglés como pivote.
- Selección de dirección mediante token de prefijo en el origen (`<2lgg>` para generar lugbara, `<2ach>` para generar acholi).
- Traducción por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por búsqueda de haz (beam search) configurable, con valor por defecto de 4.
- Tokenizador compartido entrenado específicamente con texto acholi y lugbara, con preservación de mayúsculas y separación de dígitos.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Capacidades multilingües limitadas exclusivamente a las dos lenguas del par.

## Casos de uso

- Traducción de documentación comunitaria: el modelo permite convertir materiales escritos en acholi a lugbara (y viceversa) sin depender de una cadena de traducción vía inglés, lo que reduce la acumulación de errores en pares de bajos recursos.
- Preservación lingüística y digitalización: útil para generar versiones bilingües de textos orales transcritos, facilitando el acceso de hablantes de una lengua a contenidos originados en la otra.
- Atención ciudadana en regiones donde coexisten ambas lenguas: integrado en un servicio de mensajería, puede traducir consultas y respuestas entre acholi y lugbara en tiempo real gracias a su reducido tamaño (89M de parámetros).
- Investigación en traducción de bajos recursos: sirve como línea base reproducible (licencia MIT, pesos en safetensors) para comparar estrategias de preentrenamiento sintético frente a ajuste fino con datos humanos.
- Herramientas de aprendizaje de lenguas: puede emplearse para generar pares de ejemplo y ejercicios de traducción entre ambas lenguas en aplicaciones educativas.
- Procesamiento por lotes de corpus: al aceptar listas de entrada y ejecutarse en GPU o CPU con un peso de 0,4 GB, es adecuado para traducir grandes volúmenes de frases en pipelines offline.
- Análisis comparativo de variedades lingüísticas: permite estudiar correspondencias léxicas y sintácticas entre acholi y lugbara alineando traducciones generadas con las referencias humanas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos completos de SALT (500 frases por split), beam 4, sacreBLEU 2.5.1. El split de test es el dato principal; el de dev se usó para detener el entrenamiento y elegir el checkpoint, por lo que sus puntuaciones son ligeramente optimistas.

| Split | Direccion | Sistema | n | BLEU | chrF | chrF++ |
|---|---|---|---|---|---|---|
| test | ach→lgg | modelo | 500 | 14,89 | 42,99 | 40,88 |
| test | ach→lgg | baseline copia (origen sin cambios) | 500 | 0,47 | 13,09 | 10,54 |
| test | lgg→ach | modelo | 500 | 15,01 | 40,96 | 38,61 |
| test | lgg→ach | baseline copia (origen sin cambios) | 500 | 0,46 | 14,40 | 11,61 |
| dev | ach→lgg | modelo | 500 | 16,24 | 43,78 | 41,69 |
| dev | ach→lgg | baseline copia (origen sin cambios) | 500 | 0,29 | 12,56 | 10,07 |
| dev | lgg→ach | modelo | 500 | 15,02 | 40,69 | 38,31 |
| dev | lgg→ach | baseline copia (origen sin cambios) | 500 | 0,29 | 14,01 | 11,25 |

Firmas de las métricas: BLEU `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.5.1`; chrF `nrefs:1|case:mixed|eff:yes|nc:6|nw:0|space:no|version:2.5.1`; chrF++ `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`. El baseline copia devuelve la frase de origen sin modificar. No se ejecutó un baseline con pivote por inglés. La model card advierte que diferencias de 1 a 2 BLEU sobre unos cientos de frases están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 89M de parámetros en float32 (unos 0,36 GB de pesos), la inferencia cabe holgadamente en menos de 1 GB de VRAM; con beam search de 4 la memoria adicional por hipótesis es mínima.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: el modelo es PyTorch personalizado y no se carga con `AutoModel` de `transformers`; requiere el código propio `aine.py` incluido en el repositorio, junto con `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| aine_finetuned | 89M | 256 | ach, lgg | MIT | Traducción directa acholi-lugbara, preentrenamiento sintético + ajuste fino humano |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (aproximado) | no disponible | Incluye ach y lgg (vía inglés) | no disponible | Traducción NLLB ajustada; se usó para generar el corpus sintético de preentrenamiento |
| aine_base | 89M | 256 | ach, lgg | no disponible | Checkpoint previo del mismo autor, solo preentrenado con pares de traducción automática |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Calidad moderada: BLEU en torno a 15 en test indica traducciones útiles pero con errores frecuentes; los ejemplos publicados muestran omisiones y reformulaciones respecto a la referencia humana.
- Riesgo de alucinación y de deriva semántica: al haberse preentrenado con pares generados por máquina, el modelo puede reproducir patrones artificiosos del corpus sintético.
- Contexto limitado a 256 posiciones y pares de entrenamiento de hasta 128 piezas por lado; las frases largas pueden truncarse o degradar la calidad.
- Cobertura lingüística restringida a acholi y lugbara; no traduce desde ni hacia el inglés ni otras lenguas.
- Sesgos desconocidos: no se documenta análisis de sesgos; el corpus sintético procede de una única columna inglesa, lo que puede introducir sesgos de dominio y de estilo.
- El split de dev se usó para selección de checkpoint, por lo que sus métricas están infladas; deben tomarse como referencia las de test.
- No es compatible con la API estándar de `transformers`; la integración requiere el código personalizado del repositorio, lo que añade coste de mantenimiento en producción.
- Aunque la licencia es MIT, conviene verificar las condiciones de los datos de origen (SALT y `tulati`) antes de un uso comercial a gran escala.
- El repositorio registra muy pocas descargas y ningún "like", por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/aine_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/aine_base
- Dataset de preentrenamiento: https://huggingface.co/datasets/amDANIEL2024/tulati
- Modelo usado para generar el corpus sintético: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
