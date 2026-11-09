# pisar/firefox-translations-models

## Resumen

Firefox Translations models es un espejo sin modificaciones de los modelos de traducción automática neuronal que Mozilla distribuye con Firefox para traducción local en el dispositivo. Los desarrolla Mozilla junto con el proyecto Bergamot, un consorcio de investigación europeo centrado en traducción de calidad en el navegador sin enviar texto a servidores externos. El repositorio lo mantiene el usuario `pisar` (Pozdnekov Labs) como copia de trabajo para su producto, no como proyecto original.

El modelo resuelve un problema concreto: traducción bidireccional entre inglés y 25 idiomas europeos (más pares entre lenguas no inglesas que se enrutan a través del inglés) con un consumo de recursos mínimo, apto para ejecutarse en el propio navegador o en dispositivos de gama baja. Frente a los modelos neuronales de traducción de gran tamaño, aquí prima la eficiencia: los pares individuales pesan entre 21 y 38 MB en formato int8, lo que permite descargarlos bajo demanda y ejecutarlos en CPU.

La relevancia actual está en la privacidad y el despliegue en el borde: traducción sin conexión, sin cuota de API y sin fuga de datos. La arquitectura es Marian (transformer encoder-decoder) comprimida y cuantizada con intgemm, empaquetada por par de idiomas con vocabulario SentencePiece y lista léxica. El repositorio ocupa 1,5 GB e incluye todos los pares publicados en el registro de Mozilla a fecha de generación (`db/models.json`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), variantes `tiny` y `base-memory` |
| Parámetros totales | no disponible (no se publica el recuento; el tamaño en disco por par va de 21 a 38 MB en int8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (intgemm, `gemm-precision: int8shiftAlphaAll`) |
| Idiomas soportados | 25 lenguas europeas en pares con inglés (bg, cs, da, de, el, es, et, fi, fr, hr, hu, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, uk, entre otras); pares sin inglés se traducen vía inglés |
| Licencia | MPL-2.0 |
| Formato de pesos | `.intgemm.alphas.bin` (modelo), `.s2t.bin` (lista léxica), `.spm` (vocabulario SentencePiece) |

## Arquitectura y entrenamiento

Cada par de idiomas es un modelo Marian independiente, un transformer encoder-decoder pensado para traducción supervisada. Mozilla publica dos configuraciones: `tiny` (unos 21-23 MB por dirección) y `base-memory` (35-38 MB), con distinto equilibrio entre calidad y huella. Los pesos se cuantizan a int8 mediante intgemm para ejecución en CPU con instrucciones SIMD, lo que explica el tamaño reducido y la viabilidad de correr en el navegador.

El repositorio no documenta el corpus de entrenamiento, el número de tokens ni si hubo ajuste fino con RLHF o DPO; esa información reside en el proyecto Bergamot y en los repositorios de Mozilla, no en esta copia. La innovación técnica relevante es el pipeline de compresión y el uso de una lista léxica (`lex.*.s2t.bin`) que restringe el vocabulario candidato durante la decodificación, reduciendo latencia y memoria. Los pares sin inglés directo se traducen en dos saltos a través del inglés, lo que introduce una penalización de calidad acumulada.

## Capacidades

- Traducción automática bidireccional entre inglés y 25 lenguas europeas, con calidad medida por COMET-22 sobre FLORES-200+.
- Traducción entre lenguas no inglesas mediante pivote por inglés (por ejemplo, de-es a través de en).
- Ejecución totalmente local en CPU, sin GPU ni conexión a internet una vez descargados los modelos.
- Cuantización int8 con `intgemm` para inferencia de baja latencia en hardware modesto.
- Vocabulario SentencePiece y lista léxica para decodificación restringida.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un traductor puro.
- No incluye modo thinking ni instrucciones en lenguaje natural; la entrada es texto a traducir.

## Casos de uso

- Traducción en el navegador: integrar los pares en una extensión o en Firefox para traducir páginas web sin enviar contenido a servidores, usando `bergamot-translator` con `int8shiftAlphaAll`; el tamaño de 21-38 MB por par permite descarga bajo demanda.
- Traducción offline en dispositivos de gama baja: desplegar en portátiles, Raspberry Pi o móviles donde no cabe un modelo de miles de millones de parámetros; la inferencia en CPU con int8 mantiene la latencia baja.
- Procesamiento por lotes de documentos confidenciales: traducir contratos, informes médicos o comunicaciones internas en local para cumplir requisitos de privacidad y RGPD, sin cuota de API.
- Traducción de subtítulos y textos cortos en tiempo casi real: el par en-es o es-en con 37 MB y decodificación restringida encaja en pipelines de streaming de texto.
- Preprocesado multilingüe para pipelines de NLP: normalizar corpus europeos al inglés antes de pasarlos a un modelo mayor de análisis, aprovechando los pares en-XX con COMET-22 entre 0,85 y 0,91.
- Aplicaciones de escritorio y CLI: empaquetar los binarios con `bergamot-translator` en herramientas de línea de comandos o apps Electron para traducción local sin dependencias de red.
- Traducción de contenido generado por usuarios en foros o chats: pares tiny (22 MB) para respuestas rápidas donde prima la latencia sobre la calidad máxima.

## Benchmarks y rendimiento

La model card publica COMET-22 sobre FLORES-200+ por par. Se recogen los valores representativos; el resto figuran en la tabla original del autor.

| Par | Arquitectura | Tamaño (MB) | COMET-22 (FLORES-200+) |
|---|---|---|---|
| en-fi | base-memory | 36 | 0,9079 |
| en-et | base-memory | 36 | 0,9040 |
| en-bg | base-memory | 36 | 0,8985 |
| en-hr | base-memory | 36 | 0,8957 |
| en-sv | tiny | 22 | 0,8918 |
| da-en | tiny | 22 | 0,8915 |
| en-cs | base-memory | 36 | 0,8908 |
| en-da | tiny | 22 | 0,8908 |
| en-pt | base-memory | 36 | 0,8889 |
| fi-en | base-memory | 38 | 0,8864 |
| en-sk | base-memory | 36 | 0,8864 |
| fr-en | base-memory | 37 | 0,8860 |
| en-hu | base-memory | 36 | 0,8857 |
| en-ro | tiny | 22 | 0,8846 |
| en-lt | base-memory | 36 | 0,8830 |
| bg-en | base-memory | 37 | 0,8719 |
| en-de | base-memory | 37 | 0,8670 |
| en-fr | base-memory | 37 | 0,8653 |
| en-nl | base-memory | 36 | 0,8650 |
| en-es | base-memory | 37 | 0,8540 |
| es-en | base-memory | 37 | 0,8572 |
| en-ru | base-memory | 35 | 0,8745 |
| ru-en | base-memory | 37 | 0,8497 |
| pl-en | base-memory | 37 | 0,8469 |
| lt-en | tiny | 23 | 0,8365 |

No se han publicado otros benchmarks (BLEU, MMLU, HumanEval) en la información disponible; COMET-22 es la única métrica reportada.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU con intgemm int8.
- RAM: cada par ocupa entre 21 y 38 MB en disco; en memoria, el modelo más la lista léxica y el vocabulario caben holgadamente en menos de 200 MB por proceso.
- GPU recomendadas: no aplica; el motor `bergamot-translator` está optimizado para CPU. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa.
- Cabe en cualquier dispositivo consumer: móviles, Raspberry Pi, portátiles de gama baja y navegadores.
- Despliegue: `bergamot-translator` (referencia oficial de Mozilla) con `gemm-precision: int8shiftAlphaAll`; también se puede integrar en Firefox o en extensiones.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño int8 y la lista léxica apuntan a decenas de milisegundos por frase corta, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firefox Translations (este repo) | no disponible (21-38 MB por par) | no disponible | Marian int8, local, por par | MPL-2.0 | Hugging Face, registro de Mozilla |
| NLLB-200 (Meta) | 600M-54B | 512 tokens | Transformer multilingüe único, 200 idiomas | CC-BY-NC (no comercial en la mayoría de variantes) | Hugging Face |
| M2M-100 (Meta) | 418M-12B | 1024 tokens | Transformer multilingüe, 100 idiomas | MIT | Hugging Face |
| MarianMT (Helsinki-NLP) | 70M-300M por par | 512 tokens | Marian por par, formato OPUS | CC-BY-4.0 (mayoría) | Hugging Face |

La diferencia clave es el despliegue: Firefox Translations prioriza tamaño mínimo y ejecución en CPU/navegador, mientras NLLB y M2M-100 ofrecen cobertura lingüística mucho mayor a costa de modelos de cientos de millones de parámetros. MarianMT de Helsinki-NLP es el competidor más cercano en filosofía (un modelo por par), pero con pesos más pesados y sin la compresión int8 específica para navegador.

## Limitaciones y advertencias

- Solo cubre lenguas europeas en pares con inglés; los pares sin inglés pasan por pivote y acumulan error.
- No hay información sobre sesgos; al ser modelos de traducción supervisada, pueden reproducir sesgos de género y culturales del corpus de entrenamiento.
- Riesgo de alucinación y de traducciones inventadas en frases ambiguas, jerga o dominios especializados (legal, médico, técnico).
- El contexto es corto (no documentado); no apto para documentos largos sin segmentación previa.
- La licencia MPL-2.0 permite uso comercial, pero obliga a publicar modificaciones de los archivos cubiertos y a mantener los avisos; conviene revisar los términos antes de redistribuir.
- Es un espejo no oficial: la autoría y el mantenimiento corresponden a Mozilla y Bergamot; el repositorio de `pisar` puede quedar desactualizado respecto al registro original.
- Los pares marcados como "not released by Mozilla" (por ejemplo hr-en) no cuentan con el mismo respaldo de publicación oficial.
- No soporta instrucciones, tool calling ni razonamiento; cualquier uso conversacional requiere un modelo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/pisar/firefox-translations-models
- Repositorio de Mozilla Translations: https://github.com/mozilla/translations
- Motor de inferencia bergamot-translator: https://github.com/mozilla/translations/tree/main/inference
- Proyecto Bergamot: https://browser.mt/
- Licencia MPL-2.0: https://www.mozilla.org/MPL/2.0/
