# agbalu/Amrouche-2-600M

## Resumen

Amrouche-2-600M es un modelo de traducción automática neuronal bidireccional especializado en cabilio (taqbaylit, `kab_Latn`), con soporte adicional para inglés (`eng_Latn`), francés (`fra_Latn`) y árabe estándar moderno (`arb_Arab`). Lo desarrolla agbalu, la organización AƔBALU dedicada al procesamiento de lenguaje natural en cabilio, y se distribuye como un fine-tuning de `facebook/nllb-200-distilled-600M` sobre 544.965 pares de frases paralelas verificadas del corpus AƔBALU.

El modelo resuelve un problema concreto: las carencias morfológicas y gramaticales de NLLB-600M al generar texto en cabilio, una lengua amazigh de bajos recursos. Según la model card, supera a su modelo base en las seis direcciones de traducción evaluadas sobre FLORES+ `devtest`, con una ganancia macro de +3,91 chrF++ y +20,7 % relativo en BLEU, concentrada especialmente en las direcciones hacia cabilio (inglés→cabilio, francés→cabilio y árabe→cabilio).

Con 615.073.792 parámetros y un peso en BF16 de 1,23 GB, está pensado para despliegues con recursos limitados: la model card declara más del doble de velocidad de generación y menos de la mitad de huella en disco y memoria que su hermano mayor Amrouche-2-1.3B. Conserva el vocabulario SentencePiece completo de 256.206 tokens, lo que evita sustituciones `<unk>` en préstamos y entidades no vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, fine-tuning de facebook/nllb-200-distilled-600M) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); variante CT2 int8 en release separado (Amrouche-2-600M-CT2-int8) |
| Idiomas soportados | kab (cabilio, kab_Latn), en (eng_Latn), fr (fra_Latn), ar (árabe estándar moderno, arb_Arab) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura m2m_100 de NLLB-200 distilled 600M: un transformer encoder-decoder con vocabulario SentencePiece de 256.206 tokens que se mantiene íntegro, sin poda. El fine-tuning se realizó sobre 544.965 pares de frases paralelas verificadas del corpus AƔBALU, restringido a las cuatro lenguas cubiertas y a las seis direcciones de traducción evaluadas (kab↔eng, kab↔fra, kab↔arb).

La model card no detalla hiperparámetros de entrenamiento, número total de tokens vistos, composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Sí se documenta que la evaluación se hizo con `sacrebleu` 2.6.0 (chrF++ con orden de palabras 2 y BLEU con tokenización `13a`) sobre FLORES+ `devtest` y sobre particiones de test humano retenidas y decontaminadas, separadas por grupos de contenido transitivo sin solapamiento de documento ni de frase. La innovación técnica principal es la preservación del vocabulario completo, que evita sustituciones `<unk>` en préstamos y entidades no vistas y mantiene compatibilidad directa con pipelines estándar de Hugging Face, CTranslate2 y ONNX.

## Capacidades

- Traducción automática bidireccional en seis direcciones: cabilio→inglés, cabilio→francés, inglés→cabilio, francés→cabilio, árabe→cabilio y cabilio→árabe.
- Generación de texto condicionada a la traducción (text2text-generation) mediante la librería transformers.
- Manejo de vocabulario completo sin sustituciones `<unk>` en préstamos léxicos y entidades no vistas.
- Compatibilidad con pipelines estándar de Hugging Face, CTranslate2 y ONNX.
- Variante cuantizada int8 (Amrouche-2-600M-CT2-int8) para entornos de CPU y microservicios con recursos restringidos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Traducción de documentación oficial y administrativa al cabilio: el modelo rinde especialmente bien en la dirección inglés→cabilio (33,24 chrF++ / 8,56 BLEU en FLORES+), lo que lo hace adecuado para localizar textos institucionales y materiales educativos hacia una lengua de bajos recursos.
- Localización de interfaces y software: con 1,23 GB en BF16 y compatibilidad con CTranslate2 y ONNX, puede integrarse en pipelines de localización continua que traduzcan cadenas de UI del francés o el inglés al cabilio.
- Subtitulado y traducción de contenido audiovisual: la dirección cabilio→francés (39,95 chrF++ / 17,21 BLEU) permite generar subtítulos en francés a partir de transcripciones en cabilio para medios comunitarios y archivos orales.
- Preservación y difusión del patrimonio oral: traducción de transcripciones de poesía, cuentos y tradición oral cabilia hacia inglés y francés para su publicación en repositorios académicos y archivos digitales.
- Atención al ciudadano multilingüe: despliegue en microservicios de CPU con la variante CT2 int8 (155 ms de latencia por frase, según la model card) para traducir consultas entre árabe, francés y cabilio en servicios públicos de regiones con población cabilófona.
- Investigación en lingüística computacional de lenguas amazighes: modelo base reproducible (licencia Apache 2.0) para experimentos de traducción de bajos recursos, evaluación de morfología y comparación con NLLB-600M.
- Traducción en dispositivos con recursos limitados: gracias a su tamaño y a la variante int8 de 622,6 MB, puede ejecutarse en portátiles y servidores sin GPU para traducción por lotes de corpus pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre FLORES+ `devtest` (1.012 frases por dirección, 6.072 en total), con `sacrebleu` 2.6.0. Formato: chrF++ / BLEU.

| Direccion | NLLB-600M base | Amrouche-2-600M | Ganancia relativa BLEU |
|---|---|---|---|
| kab → eng | 39,53 / 17,82 | 42,53 / 20,35 | +14,2 % |
| kab → fra | 37,38 / 15,20 | 39,95 / 17,21 | +13,2 % |
| eng → kab | 27,51 / 5,90 | 33,24 / 8,56 | +45,1 % |
| fra → kab | 26,18 / 4,51 | 31,67 / 6,67 | +47,9 % |
| arb → kab | 25,74 / 4,67 | 31,06 / 6,51 | +39,4 % |
| kab → arb | 29,49 / 7,05 | 30,83 / 7,22 | +2,4 % |
| Macro 6 direcciones | 30,97 / 9,19 | 34,88 / 11,09 | +20,7 % |

Particiones de test humano retenidas (`test.arrow`), decontaminadas:

| Particion | Soporte | chrF++ | chrF++ normalizado | BLEU |
|---|---|---|---|---|
| Panel de test retenido (`panel_test_384`) | 384 frases (64/dirección) | 50,73 | 51,33 | 30,75 |
| Test dorado completo (`full_test_868`) | 868 frases | 48,58 | 49,29 | 27,98 |
| Panel de desarrollo (`panel_dev_384`) | 384 frases (64/dirección) | 51,01 | 51,58 | 28,91 |

La model card indica que las ganancias se concentran en la generación hacia cabilio: +5,73 chrF++ en eng→kab, +5,49 en fra→kab y +5,32 en arb→kab respecto al modelo base. No se han publicado resultados de benchmarks en la información disponible para tareas distintas de la traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: 1.690 MiB de pico en BF16 según la model card (aproximadamente 1,7 GB).
- Huella en disco: 1,23 GB en BF16; 622,6 MB en la variante CT2 int8.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente para BF16; para despliegues de mayor throughput se pueden usar A100, H100 o RTX 4090, aunque el modelo no las requiere.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (con `custom_code`), CTranslate2 (variante CT2 int8), ONNX, y pipelines estándar de Hugging Face.
- Latencia y throughput: 155 ms por frase única en CPU con la variante CT2 int8, con una ganancia de velocidad de 4,9× frente a la versión no cuantizada y un delta de cuantización inferior a 0,15 chrF++; más del doble de velocidad de generación que Amrouche-2-1.3B según el autor. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | FLORES+ macro chrF++ / BLEU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amrouche-2-600M | 615 M | kab, en, fr, ar | no disponible | 34,88 / 11,09 | Apache 2.0 | Hugging Face |
| NLLB-200-distilled-600M (base) | 615 M | 200 lenguas (incl. kab) | no disponible | 30,97 / 9,19 | CC-BY-NC 4.0 (según el modelo original de Meta) | Hugging Face |
| Amrouche-2-1.3B | 1.300 M (aprox.) | kab, en, fr, ar | no disponible | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Amrouche-2-600M-CT2-int8 | 615 M (int8) | kab, en, fr, ar | no disponible | delta < 0,15 chrF++ respecto a BF16 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Cobertura lingüística restringida a cuatro lenguas y seis direcciones; no es un modelo multilingüe general.
- Los resultados de benchmarks están declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación y de traducciones fluentes pero incorrectas en dominios alejados del corpus de entrenamiento (544.965 pares del corpus AƔBALU), especialmente en terminología técnica y nombres propios.
- Sesgos potenciales derivados de la composición del corpus paralelo, no documentada en detalle; no se han publicado análisis de sesgo.
- La model card no especifica la longitud máxima de contexto soportada, lo que limita la planificación de despliegues con documentos largos.
- La variante int8 introduce una degradación pequeña pero no nula (menos de 0,15 chrF++ según el autor).
- Aunque la licencia del modelo es Apache 2.0, conviene revisar las condiciones del modelo base NLLB-200-distilled-600M de Meta, cuya licencia original es CC-BY-NC 4.0, antes de un uso comercial.
- Modelo con cero descargas y cero likes en el momento de la ficha: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Amrouche-2-600M
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Variante cuantizada: https://huggingface.co/agbalu/Amrouche-2-600M-CT2-int8
- Modelo hermano mayor: https://huggingface.co/agbalu/Amrouche-2-1.3B
- README de Amrouche-1.3B: https://huggingface.co/agbalu/Amrouche-1.3B/blob/main/README.md
- Perfil de la organizacion AƔBALU: https://huggingface.co/agbalu/models
