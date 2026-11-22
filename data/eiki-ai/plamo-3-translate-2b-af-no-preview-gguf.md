# Eiki-AI/plamo-3-translate-2b-af-no-preview-GGUF

## Resumen

PLaMo-3-Translate-2B-AF-NO (V5 Preview, GGUF) es una cuantizacion en formato GGUF de un fine-tune experimental sobre `pfnet/plamo-3-translate-2b`, el modelo de traduccion de 2B parametros desarrollado por Preferred Networks. El fine-tune, publicado por el usuario Eiki-AI, anade capacidad de traduccion hacia y desde afrikaans (`af`) y noruego bokmal (`no`) sobre un modelo base orientado originalmente a la traduccion entre ingles y japones. El resultado se distribuye exclusivamente en cuatro cuantizaciones GGUF (Q4_K_M, Q4_0, Q3_K_M y Q2_K) pensadas para inferencia en llama.cpp.

El modelo resuelve un nicho concreto: traduccion automatica de baja latencia y bajo coste en pares de idiomas poco cubiertos por los modelos multilingues generalistas, ejecutable en hardware de consumo. Con 2.878.595.584 parametros y un peso de repositorio de 6,2 GB (repartido entre las cuatro variantes), esta pensado para despliegues en el borde (edge) o entornos con recursos limitados, no para traduccion de alta fidelidad en produccion critica.

Es relevante ahora porque demuestra el patron de fine-tuning comunitario sobre modelos de traduccion pequenos y su empaquetado inmediato en GGUF, lo que permite evaluar calidad de traduccion por idioma y por nivel de cuantizacion con metricas objetivas (chrF++) publicadas por el autor. No obstante, se trata de una version "preview" no oficial, sin afiliacion con Preferred Networks, y con una licencia comunitaria que impone condiciones al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `pfnet/plamo-3-translate-2b`; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M, Q4_0, Q3_K_M, Q2_K |
| Idiomas soportados | en, ja, af, no |
| Licencia | PLaMo Community License (`plamo-community-license`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `pfnet/plamo-3-translate-2b` es un modelo de traduccion de 2B parametros de Preferred Networks. La informacion disponible no detalla la arquitectura interna (numero de capas, dimension del modelo, mecanismo de atencion ni vocabulario), por lo que no es posible confirmar mas alla de que se trata de un transformer de traduccion; cualquier detalle adicional debe consultarse en la model card del modelo base.

El fine-tune V5 Preview anade afrikaans y noruego bokmal al modelo base mediante ajuste supervisado sobre el checkpoint `pfnet/plamo-3-translate-2b` (relacion `finetune`). No se especifican en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de RLHF o DPO. El autor indica que las cuantizaciones se generaron a partir del checkpoint BF16 y publica una evaluacion comparativa BF16 frente a cada cuantizacion, lo que constituye la principal innovacion documentada: la verificacion empirica de que Q4_K_M practicamente iguala la precision de BF16 en los pares af/no.

## Capacidades

- Traduccion automatica entre ingles y afrikaans en ambas direcciones.
- Traduccion automatica entre ingles y noruego bokmal en ambas direcciones.
- Traduccion desde ingles hacia japones, neerlandes, aleman y ruso (evaluada en el benchmark del autor con corpus opus-100, con calidad desigual).
- Generacion de texto conversacional en el formato de prompt PFML3 (`<|plamo:...|>`).
- Inferencia compatible con llama.cpp mediante `llama-server` con `--no-jinja`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica EN-AF y EN-NO en local: el modelo puede ejecutarse en una estacion de trabajo con llama.cpp y traducir lotes de textos sin enviar datos a servicios en la nube, gracias a su tamano de 2B parametros y a la cuantizacion Q4_K_M de 1,68 GiB.
- Localizacion de interfaces y cadenas de aplicacion: para cadenas cortas y repetitivas, el Q4_K_M mantiene chrF++ de 59,78 en EN->AF y 58,82 en EN->NO, suficiente para borradores que un revisor humano pule despues.
- Pre-traduccion en flujos de revision humana: el modelo genera una primera version que el traductor edita, reduciendo el coste frente a traducir desde cero, especialmente en noruego bokmal donde la direccion NO->EN alcanza 62,77 chrF++ en Q4_K_M.
- Despliegue en dispositivos con recursos limitados: las variantes Q3_K_M (1,39 GiB) y Q2_K (1,14 GiB) permiten ejecutar traduccion en equipos sin GPU dedicada, aceptando la perdida de calidad documentada (Q2_K pierde aproximadamente 4 puntos chrF++).
- Procesamiento por lotes de corpus paralelos: integrable en scripts que invoquen el endpoint `/completion` de `llama-server` con `temperature=0` y `repeat_penalty=1.05` para obtener traducciones deterministas y reproducibles.
- Prototipado e investigacion en traduccion de bajos recursos: sirve como linea base para experimentos con afrikaans y noruego, y para comparar el impacto de la cuantizacion en la calidad de traduccion gracias a la tabla de benchmarks publicada.

## Benchmarks y rendimiento

Resultados publicados por el autor (chrF++, `temp=0`, `repeat_penalty=1.05`):

| Direccion | BF16 | Q4_K_M | Q4_0 | Q3_K_M | Q2_K |
|---|---:|---:|---:|---:|---:|
| Ingles -> Afrikaans (100 no vistas) | 60,19 | 59,78 | 59,43 | 60,21 | 55,92 |
| Afrikaans -> Ingles (100 no vistas) | 60,77 | 60,36 | 60,08 | 60,18 | 57,02 |
| Ingles -> Noruego (100 no vistas) | 58,41 | 58,82 | 57,73 | 57,86 | 54,06 |
| Noruego -> Ingles (100 no vistas) | 62,46 | 62,77 | 62,87 | 63,06 | 61,62 |
| Ingles -> Japones (50 opus-100) | 15,83 | 16,01 | 15,54 | 16,58 | 15,77 |
| Ingles -> Neerlandes (50 opus-100) | 50,24 | 49,65 | 49,24 | 49,27 | 46,56 |
| Ingles -> Aleman (50 opus-100) | 47,58 | 47,68 | 47,23 | 47,15 | 45,71 |
| Ingles -> Ruso (50 opus-100) | 43,84 | 43,35 | 44,44 | 44,51 | 43,99 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo de traduccion y el autor solo reporta chrF++.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,14 GiB (Q2_K), 1,39 GiB (Q3_K_M), 1,58 GiB (Q4_0) y 1,68 GiB (Q4_K_M) solo para los pesos; hay que sumar el espacio del contexto (KV cache) y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; el modelo es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en todas las variantes cuantizadas, incluidas GPUs de gama baja y sistemas integrados.
- Opciones de despliegue: llama.cpp (`llama-server` con `--no-jinja`, `-ngl 99`), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Eiki-AI/plamo-3-translate-2b-af-no-preview-GGUF | 2,88B | no disponible | en, ja, af, no | PLaMo Community License | GGUF |
| pfnet/plamo-3-translate-2b (base) | 2,88B | no disponible | en, ja (segun model card base) | PLaMo Community License | safetensors (presumiblemente) |
| Modelos de traduccion multilingues generalistas (p. ej. NLLB-200, M2M-100) | variable | no disponible | decenas de idiomas | MIT / CC-BY-NC segun variante | safetensors, GGUF |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el autor solo compara el fine-tune con su propio checkpoint BF16 y con cuantizaciones del mismo modelo. NLLB-200 y M2M-100 se citan como categoria de referencia, pero sin datos de rendimiento comparables en esta ficha.

## Limitaciones y advertencias

- Modelo experimental "preview" no oficial: no esta afiliado ni respaldado por Preferred Networks, por lo que no debe tratarse como un producto estable.
- El par EN->JA presenta una calidad muy baja en el benchmark (chrF++ en torno a 15-16), lo que sugiere un deterioro severo de la capacidad original de traduccion al japones tras el fine-tune.
- La cuantizacion Q2_K muestra una perdida de calidad notable (aproximadamente 4 puntos chrF++ y regresiones gramaticales y de "bleed" entre idiomas); el autor la califica de experimental.
- Q3_K_M presenta derivas lexicas y alucinaciones ocasionales segun la model card.
- Licencia PLaMo Community License: el uso comercial y la redistribucion estan sujetos a condiciones, incluidos umbrales de registro e ingresos para despliegue comercial. Es imprescindible revisar el archivo LICENSE antes de cualquier uso productivo.
- No se documentan sesgos especificos, pero al ser un fine-tune sobre un corpus no descrito, no puede descartarse sesgo de dominio ni de registro linguistico.
- Riesgo de alucinacion en traduccion: el autor reporta derivas lexicas en cuantizaciones bajas; no hay evaluacion de fidelidad semantica mas alla de chrF++.
- Longitud de contexto no documentada; el ejemplo de despliegue usa 2048 tokens, lo que limita la traduccion de documentos largos sin troceado.
- El modelo requiere el formato de prompt PFML3 y `--no-jinja` en llama.cpp; un uso incorrecto del prompt degrada la calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Eiki-AI/plamo-3-translate-2b-af-no-preview-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de Hugging Face
- Preferred Networks: https://www.preferred.jp/
