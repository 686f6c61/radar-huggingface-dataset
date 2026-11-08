# agbalu/Amrouche-2-600M-CT2-int8

## Resumen

Amrouche-2-600M-CT2-int8 es la versión cuantizada a `int8` del modelo de traducción Amrouche-2-600M (615.073.792 parámetros), publicado por el usuario agbalu. Se trata de un fine-tuning de la familia NLLB-200 orientado a la traducción bidireccional entre cabileño (taqbaylit, `kab_Latn`), inglés (`eng_Latn`), francés (`fra_Latn`) y árabe estándar moderno (`arb_Arab`). El modelo base es un transformer encoder-decoder con vocabulario SentencePiece de 256.206 subtokens, y esta release se distribuye en formato CTranslate2 con cuantización `int8_float32`, lo que permite desplegarlo sin PyTorch ni Transformers.

La relevancia del modelo está en su enfoque de eficiencia para lenguas de bajos recursos: reduce el peso en disco de 1,23 GB (BF16) a 622,6 MB (-49,4 %) y acelera la inferencia 4,9× en CPU de 8 núcleos, bajando la latencia de una frase de 631 ms a 155 ms. Frente al NLLB-600M base, mejora el BLEU un 19,4 % de media macro en las seis direcciones evaluadas sobre FLORES+ `devtest`, con ganancias especialmente marcadas en las direcciones hacia cabileño (eng→kab +44,9 %, fra→kab +46,3 %, arb→kab +39,8 %).

El modelo está pensado para despliegue en el borde y en servidores sin GPU: el runtime CTranslate2 en C++ o Python permite integrarlo en aplicaciones de traducción de bajo coste con una huella de memoria inferior a 1 GB. La licencia es Apache 2.0 y los pesos se publican en el Hub de Hugging Face con convenciones OpenNMT/CTranslate2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (fine-tuning de NLLB-200) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`int8_float32`); el modelo base se publica en BF16 |
| Idiomas soportados | cabileño (kab_Latn), inglés (eng_Latn), francés (fra_Latn), árabe estándar moderno (arb_Arab) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo convertido con CTranslate2 4.8.5); modelo base en safetensors/BF16 |
| Vocabulario | 256.206 subtokens SentencePiece |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder derivado de la arquitectura NLLB-200 (familia de traducción multilingüe de Meta), con 615 millones de parámetros y un vocabulario SentencePiece de 256.206 subtokens. Esta release concreta no introduce cambios arquitectónicos: es una conversión del fine-tuning Amrouche-2-600M a formato CTranslate2 con cuantización de pesos `int8_float32`, realizada con CTranslate2 4.8.5. La conversión preserva el vocabulario completo y el tokenizador, de modo que el modelo funciona sin PyTorch ni Transformers.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta que la evaluación se realizó sobre FLORES+ `devtest` con referencias `kab_Latn` corregidas ortográficamente, y sobre particiones de test humanas decontaminadas (`panel_test_384`, `full_test_868`, `panel_dev_384`) particionadas por grupos de contenido transitivo sin solapamiento de documentos ni frases. La innovación técnica destacable es la propia cuantización: la pérdida empírica de cuantización es inferior a 0,15 chrF++ macro (34,73 frente a 34,88 en BF16) sobre las 6.072 frases de FLORES+ `devtest`.

## Capacidades

- Traducción bidireccional entre cabileño y inglés, francés y árabe estándar moderno (seis direcciones: kab→eng, kab→fra, eng→kab, fra→kab, arb→kab, kab→arb).
- Traducción de frases y documentos completos con tokenizador SentencePiece de 256.206 subtokens.
- Inferencia sin PyTorch ni Transformers mediante el runtime CTranslate2 (Python y C++ nativo).
- Ejecución en CPU con latencia interactiva de 155 ms por frase (batch=1) y throughput de 17,05 frases/s (batch=8) en un Intel Xeon Gold 6548N de 8 hilos.
- Soporte de despliegue en el borde con huella de disco de 622,6 MB.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de cabileño a inglés y francés en publicaciones y documentación: el modelo obtiene 42,36 y 39,67 chrF++ respectivamente en FLORES+ `devtest`, por lo que es adecuado para traducir textos administrativos, literarios o periodísticos desde taqbaylit a lenguas de mayor difusión.
- Traducción hacia cabileño en interfaces de usuario y aplicaciones móviles: las direcciones eng→kab, fra→kab y arb→kab mejoran el BLEU del NLLB-600M base entre un 39,8 % y un 46,3 %, lo que lo hace útil para localizar aplicaciones y contenidos al cabileño.
- Despliegue en el borde sin GPU: con 622,6 MB en disco y 155 ms de latencia por frase en CPU de 8 hilos, puede ejecutarse en servidores modestos, dispositivos de gama alta o entornos sin acelerador.
- Servicios de traducción de bajo coste en producción: el runtime CTranslate2 en C++ permite integrar el modelo en microservicios con throughput de 17,05 frases/s por instancia de 8 hilos, suficiente para volúmenes moderados de tráfico.
- Preservación y digitalización de patrimonio lingüístico amazigh: el modelo facilita transcribir y traducir corpus orales o escritos en cabileño a inglés, francés o árabe para su catalogación y estudio.
- Traducción de documentación técnica y jurídica entre árabe estándar y cabileño: la dirección arb→kab obtiene 30,99 chrF++ y 6,53 BLEU, útil para materiales bilingües en contextos administrativos argelinos.
- Investigación en traducción automática de bajos recursos: sirve como línea base reproducible en formato CTranslate2 para comparar técnicas de cuantización y fine-tuning sobre FLORES+.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre FLORES+ `devtest` (1.012 frases por dirección, 6.072 en total), evaluados con `sacrebleu` 2.6.0 (chrF++ con orden de palabras 2, BLEU con tokenización `13a`). Formato: chrF++ / BLEU.

| Direccion | NLLB-600M base (BF16) | Amrouche-2-600M (BF16) | Amrouche-2-600M-CT2-int8 | Delta cuantizacion | BLEU relativo vs. base |
|---|---|---|---|---|---|
| kab → eng | 39,53 / 17,82 | 42,53 / 20,35 | 42,36 / 20,05 | -0,17 chrF++ | +12,5 % |
| kab → fra | 37,38 / 15,20 | 39,95 / 17,21 | 39,67 / 17,10 | -0,28 chrF++ | +12,5 % |
| eng → kab | 27,51 / 5,90 | 33,24 / 8,56 | 33,21 / 8,55 | -0,03 chrF++ | +44,9 % |
| fra → kab | 26,18 / 4,51 | 31,67 / 6,67 | 31,54 / 6,60 | -0,13 chrF++ | +46,3 % |
| arb → kab | 25,74 / 4,67 | 31,06 / 6,51 | 30,99 / 6,53 | -0,07 chrF++ | +39,8 % |
| kab → arb | 29,49 / 7,05 | 30,83 / 7,22 | 30,60 / 6,99 | -0,23 chrF++ | -0,9 % |
| Macro 6 direcciones | 30,97 / 9,19 | 34,88 / 11,09 | 34,73 / 10,97 | -0,15 chrF++ | +19,4 % |

Particiones de test humanas decontaminadas:

| Particion | Soporte | Amrouche-2-600M (BF16) | Amrouche-2-600M-CT2-int8 | Delta cuantizacion |
|---|---|---|---|---|
| `panel_test_384` | 384 frases (64/dir) | 50,73 chrF++ / 30,75 BLEU | 49,89 chrF++ / 29,58 BLEU | -0,84 chrF++ |
| `full_test_868` | 868 frases | 48,58 chrF++ / 27,98 BLEU | 48,19 chrF++ / 27,38 BLEU | -0,39 chrF++ |
| `panel_dev_384` | 384 frases (64/dir) | 51,01 chrF++ / 28,91 BLEU | 50,97 chrF++ / 29,21 BLEU | -0,04 chrF++ |

Rendimiento en CPU (Intel Xeon Gold 6548N, 8 hilos):

| Metrica | PyTorch (FP32) | CTranslate2 (int8) | Mejora |
|---|---|---|---|
| Tamano en disco | 1.230 MB (BF16) | 623 MB (int8) | -49,4 % |
| Latencia por frase (batch=1) | 631,2 ms | 155,0 ms | 4,07× menor |
| Throughput (batch=8) | 3,46 frases/s (50,5 tok/s) | 17,05 frases/s (233,6 tok/s) | 4,92× mayor |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el runtime CTranslate2 int8; el modelo ocupa 622,6 MB en disco y se ejecuta en CPU. En GPU, la huella sería del orden de 1 GB, aunque no se documentan cifras oficiales.
- GPU recomendadas: no se documentan; el modelo está optimizado para CPU. Cualquier GPU con más de 1 GB de memoria podría alojarlo, pero no hay benchmarks publicados en GPU.
- Cabe en CPU de consumo: el benchmark oficial usa un Intel Xeon Gold 6548N con 8 hilos; el tamaño de 622,6 MB permite ejecutarlo en portátiles y mini-PC convencionales.
- Opciones de despliegue: CTranslate2 4.8.5 o superior con runtime Python o C++ nativo; no requiere PyTorch ni Transformers.
- Latencia y throughput: 155 ms por frase en modo interactivo (batch=1) y 17,05 frases/s con batch=8 en CPU de 8 hilos; el autor menciona además un throughput de servidor con 16 hilos, cuyo valor completo no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (FLORES+ devtest, macro) | Licencia | Formato |
|---|---|---|---|---|---|
| Amrouche-2-600M-CT2-int8 | 615 M | no disponible | 34,73 chrF++ / 10,97 BLEU | Apache 2.0 | CTranslate2 int8 |
| Amrouche-2-600M (BF16) | 615 M | no disponible | 34,88 chrF++ / 11,09 BLEU | Apache 2.0 | BF16 |
| Amrouche-2-1.3B-CT2-int8 | 1,3 B (aprox.) | no disponible | 38,08 chrF++ macro | Apache 2.0 | CTranslate2 int8 |
| facebook/nllb-200-distilled-600M | 600 M | no disponible | 30,97 chrF++ / 9,19 BLEU (macro en este benchmark) | CC-BY-NC 4.0 | safetensors |
| JustFrederik/nllb-200-distilled-600M-ct2-int8 | 600 M | no disponible | no disponible | CC-BY-NC 4.0 (derivada) | CTranslate2 int8 |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; al ser un fine-tuning sobre NLLB-200, puede heredar sesgos del corpus original de Meta.
- Riesgo de alucinación: en traducción automática, el riesgo se manifiesta como omisiones, adiciones o traducciones libres, especialmente en las direcciones hacia cabileño (BLEU de 6,53 a 8,55), donde la métrica indica menor fidelidad léxica.
- Limitaciones de idioma: solo cubre cabileño, inglés, francés y árabe estándar moderno; no soporta otras variedades amaziges ni dialectos del árabe.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada; el modelo está pensado para frases y párrafos, no para documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base NLLB-200 (CC-BY-NC 4.0), que puede imponer restricciones adicionales sobre los pesos derivados.
- Caveat de producción: los benchmarks son declarados por el autor y no están verificados (`verified: false`); las cifras deben tomarse como orientativas hasta una validación independiente.
- La cuantización int8 introduce una pérdida de hasta 0,84 chrF++ en la partición `panel_test_384`, aceptable para la mayoría de usos pero relevante en traducción editorial de alta fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Amrouche-2-600M-CT2-int8
- Modelo base: https://huggingface.co/agbalu/Amrouche-2-600M
- Modelo hermano de mayor capacidad: https://huggingface.co/agbalu/Amrouche-2-1.3B-CT2-int8
- NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Conversión CTranslate2 de NLLB-200: https://huggingface.co/JustFrederik/nllb-200-distilled-600M-ct2-int8
