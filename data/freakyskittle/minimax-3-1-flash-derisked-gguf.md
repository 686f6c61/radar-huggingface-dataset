# freakyskittle/MiniMax-3.1-Flash-DeRisked-GGUF

## Resumen

MiniMax-3.1-Flash-DeRisked-GGUF es la conversión a formato GGUF del checkpoint MiniMax-3.1-Flash-DeRisked publicado por Blackfrost Research, que a su vez deriva del modelo MiniMax-M3.1-Flash de MiniMaxAI con una modificación de pesos denominada DWM (DeRisked Weight Modification) aplicada a la proyección de salida de atención (`o_proj`). El trabajo de conversión lo firma el usuario freakyskittle y su objetivo es hacer desplegable en llama.cpp un modelo multimodal de gran escala que de otro modo quedaría restringido a infraestructura de datacenter.

Se trata de un transformer con mezcla de expertos de aproximadamente 427.000 millones de parámetros totales, de los cuales unos 413.000 millones residen en los expertos dispersos, distribuidos en 60 capas con dimensión oculta de 6144. Incluye una torre de visión de 32 capas y un proyector multimodal separado, por lo que la pipeline es image-text-to-text: acepta imágenes y texto y genera texto.

Su relevancia actual es doble: por un lado conserva el contexto declarado de más de un millón de tokens del modelo original, basado en Lightning Attention y un indexador de atención dispersa; por otro, el repositorio ofrece un abanico de cuantizaciones que van desde Q8_0 (~430 GB) hasta una variante ternaria TQ1_0 (~105 GB), lo que permite plantear despliegues con offloading parcial en hardware muy alejado de un clúster de GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `minimax_m3_vl` (`MiniMaxM3SparseForConditionalGeneration`), transformer MoE con Lightning Attention y vision tower de 32 capas |
| Parametros totales | ~427B (~426.174.594.816 según safetensors del modelo base) |
| Parametros activos | 128 expertos enrutados + 1 compartido, 4 activos por token; ~413B en expertos dispersos |
| Longitud de contexto | 1M+ tokens (declarado en la model card) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, IQ4_XS, UD-IQ4_XS, MXFP4 MoE, Q3_K_M, Q2_K, IQ2_XXS, IQ1_M, TQ1_0 (ternaria); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (`minimax-community-license`) |
| Formato de pesos | GGUF (split en shards), más un GGUF separado `mmproj` para visión |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 60 capas y dimensión oculta de 6144. Cada bloque MoE contiene 128 expertos enrutados más uno compartido, con 4 expertos activados por token, lo que concentra la mayor parte del cómputo en los expertos y explica que aproximadamente 413.000 millones de los 427.000 millones de parámetros totales estén en esa parte del modelo. La atención combina Lightning Attention con un indexador de atención dispersa, mecanismo que sostiene la ventana declarada de más de un millón de tokens. La modalidad visual la aporta una torre de 32 capas más un proyector multimodal que se distribuye como archivo `mmproj` independiente.

El checkpoint de origen no es un entrenamiento nuevo sino una modificación de pesos: Blackfrost Research aplicó DWM (DeRisked Weight Modification) sobre `o_proj` del MiniMax-M3.1-Flash original. El checkpoint modificado se distribuye con los expertos pre-cuantizados en NVFP4 mediante `compressed-tensors` (`nvfp4-pack-quantized`) y el resto de tensores en MXFP8 (e4m3 con escalas E8M0). La conversión a GGUF reempaqueta los tensores NVFP4 de forma sin pérdida en el layout NVFP4 nativo de GGUF (con compañeros `weight`, `.scale` e `.input_scale` por experto) y de-cuantiza los bloques MXFP8 a BF16 en el maestro F16 antes de aplicar la cuantización final; según el autor, esa de-cuantización es exacta porque e4m3 multiplicado por una potencia de dos es representable en bf16. El repositorio no documenta volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno sobre el pipeline image-text-to-text.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y diálogo sobre una imagen, siempre que se cargue el archivo `mmproj` junto a los pesos del modelo.
- Razonamiento de contexto largo: la ventana declarada supera el millón de tokens, apoyada en Lightning Attention y el indexador disperso.
- Capacidad multilingüe: no disponible (el repositorio no declara lista de idiomas).
- Tool calling y function calling: no disponible (no se documenta en la información proporcionada).
- Soporte explícito de agentes o multi-step reasoning: no disponible (no se documenta).
- Modo «thinking» u otras capacidades especiales: no disponible (no se documenta).
- Inferencia local vía llama.cpp con soporte específico para `minimax_m3_vl` (`tools/mtmd/models/minimax-m3.cpp`), tanto en CLI como en servidor.

## Casos de uso

- Análisis de documentos técnicos extensos con imágenes: el modelo puede recibir capturas de diagramas, planos o esquemas junto a texto y responder preguntas sobre el conjunto, aprovechando la ventana de más de un millón de tokens para no trocear el material.
- Asistencia sobre bases de código grandes: con contexto tan amplio cabe un repositorio mediano completo, y el modelo puede razonar sobre relaciones entre ficheros que un modelo de 32k o 128k tokens no vería de una sola vez.
- Transcripción y explotación de reuniones o grabaciones con material visual: al aceptar pares imagen-texto, permite procesar diapositivas capturadas junto con la transcripción en una única ventana.
- Despliegue en estaciones de trabajo con offloading: la variante IQ2_XXS (~140 GB) o TQ1_0 (~105 GB) permite, según el autor, aprovechar el `--mmap` parcial porque solo se tocan 4 de 128 expertos por token, lo que abre la puerta a servir el modelo desde una máquina con RAM abundante y GPU modesta.
- Prototipado e investigación sobre cuantización extrema: el repositorio publica diez niveles de cuantización distintos, lo que lo convierte en un banco de pruebas para medir degradación de calidad en un MoE de gran escala.
- Servicio conversacional multimodal interno: con `llama-server` y el `mmproj` cargado se puede exponer una API compatible con clientes tipo OpenAI para pruebas de concepto sin depender de proveedores externos.
- Evaluación de variantes «de-risked»: equipos que quieran comparar el efecto de la modificación DWM sobre `o_proj` frente al MiniMax-M3.1-Flash original pueden usar esta conversión como referencia práctica en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q8_0 ~430 GB, Q4_K_M ~245 GB, IQ4_XS y UD-IQ4_XS ~235 GB, MXFP4 MoE ~200 GB, Q3_K_M ~195 GB, Q2_K ~160 GB, IQ2_XXS ~140 GB, IQ1_M ~115 GB, TQ1_0 ~105 GB. El `mmproj` F16 añade ~1,6 GB.
- El propio autor advierte que los requisitos de RAM se acercan al tamaño total del archivo de la cuantización elegida; no es un modelo que quepa íntegro en GPUs de consumo.
- GPU recomendadas: no disponible de forma explícita; por volumen de pesos, un despliegue sin offloading exige múltiples aceleradores de datacenter (A100/H100 de 80 GB en número elevado) o servidores con gran cantidad de memoria del sistema.
- En GPU de consumo (RTX 4090 u otras) solo es planteable con offloading parcial agresivo y cuantizaciones de 1-2 bits; el autor lo favorece por el patrón de activación 4/128 expertos, pero no aporta cifras de rendimiento.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`) con una build reciente que incluya soporte `minimax_m3_vl`. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-3.1-Flash-DeRisked (GGUF, este repo) | ~427B totales, 4/128 expertos activos | 1M+ tokens | MiniMax Community License | GGUF en Hugging Face, uso con llama.cpp |
| MiniMax-M3.1-Flash (modelo upstream) | no disponible en la información proporcionada | 1M+ tokens (heredado) | no disponible en la información proporcionada | pesos originales vía MiniMaxAI (referenciado en la model card) |
| Blackfrost-Research/MiniMax-3.1-Flash-DeRisked | ~427B totales (safetensors) | 1M+ tokens (heredado) | no disponible en la información proporcionada | checkpoint safetensors MXFP8/NVFP4 en Hugging Face |

No se dispone de datos sobre modelos competidores de la misma categoría (MoE multimodal de ~400B con contexto de un millón de tokens) en la información proporcionada; cualquier comparación numérica adicional sería especulativa.

## Limitaciones y advertencias

- Licencia: la MiniMax Community License permite uso no comercial gratuito, pero el uso comercial requiere notificación o autorización según los términos; además obliga a indicar «Built with MiniMax M3.1-Flash» en copias y derivados. Hay cláusulas de uso prohibido recogidas en el archivo LICENSE.
- Idiomas soportados no declarados: no hay garantía documentada de calidad en castellano ni en otras lenguas distintas de las que el modelo upstream soporte de facto.
- Capacidades de tool calling, agentes y modo de razonamiento no documentadas: no conviene asumirlas en producción sin validación empírica.
- Riesgo de alucinación: no cuantificado en el repositorio; al ser un derivado con modificación de pesos sobre la proyección de salida, el efecto de DWM sobre la fidelidad no está evaluado con benchmarks publicados.
- Trazabilidad del «de-risking»: la modificación DWM la aplica un tercero (Blackfrost Research) y no se documenta metodología ni evaluación; el resultado no es el modelo oficial de MiniMax.
- Cuantizaciones extremas: las variantes IQ1_M (~115 GB) y TQ1_0 ternaria (~105 GB) degradan la calidad de forma previsible; no hay mediciones de esa degradación en el repositorio.
- Requisitos de despliegue: hace falta una build reciente de llama.cpp con soporte `minimax_m3_vl`; versiones anteriores fallarán al cargar el modelo.
- Repositorio partido en shards: es imprescindible descargar todos los ficheros `-0000N-of-0000M` de la cuantización elegida; descargas parciales producen errores de carga.
- Repositorio de gran tamaño (2113,7 GB) y cero likes pese a las más de 5000 descargas: conviene verificar integridad de los archivos descargados antes de desplegar.
- Fecha de creación del repositorio (2026-10-24) posterior a la fecha de referencia habitual de uso; verificar que el modelo base y la build de llama.cpp empleados son coherentes entre sí.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/MiniMax-3.1-Flash-DeRisked-GGUF
- Modelo base de la conversión: https://huggingface.co/Blackfrost-Research/MiniMax-3.1-Flash-DeRisked
- Modelo upstream referenciado (MiniMaxAI MiniMax-M3.1-Flash): no disponible como enlace directo en la información proporcionada
- Script de conversión empleado: `convert_hf_to_gguf.py` del repositorio llama.cpp (https://github.com/ggml-org/llama.cpp)
- Implementación de soporte multimodal: `tools/mtmd/models/minimax-m3.cpp` en llama.cpp (https://github.com/ggml-org/llama.cpp)
- Licencia: archivo `LICENSE` dentro del repositorio de Hugging Face
