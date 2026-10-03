# Jabs2/goanime-auditor-ja

## Resumen
goanime-auditor-ja es un modelo seq2seq de corrección de texto en japonés desarrollado por Jabs2. No es un LLM conversacional ni un traductor: es un ajuste fino de google/byt5-small especializado en limpiar transcripciones crudas de reconocimiento automático de voz (ASR) antes de pasarlas a un sistema de traducción. Su propósito es corregir errores sistemáticos que produce el STT sobre contenido de anime y galgame, como duplicaciones y bucles de decodificación, confusiones entre kanji y kana derivadas de la lectura (por ejemplo, 何 escrito cuando corresponde なん), partículas ausentes o erróneas y espacios espurios.

El modelo se distribuye exclusivamente en formato ONNX y está pensado para ejecutarse en CPU mediante ONNX Runtime, sin necesidad de GPU. El repositorio ocupa aproximadamente 0,6 GB y contiene dos ficheros: un encoder cuantizado a int8 (unos 220 MB) y un decoder en fp32 (unos 330 MB). Esta combinación mixta se eligió porque cuantizar el decoder a int8 degrada gravemente la calidad (CER superior al 100 %), mientras que el encoder int8 es seguro; aun así, la variante mixta rinde peor que el modelo en fp32 puro (≈16,5 % de CER frente a ≈13,9 %).

Es relevante dentro de un pipeline concreto: el auditor se integra en la aplicación goanime-tv a través del módulo `goanime/seq2seq_audit`. Su valor no está en capacidades generales de lenguaje, sino en resolver de forma determinista y ligera un paso muy específico de postprocesado de subtítulos en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq encoder-decoder byte-level (ByT5) |
| Parametros totales | Aproximadamente 300 M (arquitectura base google/byt5-small; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (byt5-small soporta 512 tokens de forma nativa) |
| Tipos de cuantizacion | Encoder int8 (per-channel, MatMul); decoder fp32 |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.onnx y decoder.onnx) |

## Arquitectura y entrenamiento
El modelo se basa en google/byt5-small, una variante de T5 que opera directamente sobre bytes UTF-8 en lugar de sobre tokens de un vocabulario de subpalabras. La entrada se construye como bytes UTF-8 desplazados en +3, con EOS(1); la salida se obtiene restando 3 a los identificadores para recuperar los bytes. No requiere tokenizer externo, lo que lo hace robusto ante texto ruidoso o malformado, algo habitual en salidas de ASR. La arquitectura es un transformer seq2seq clásico con encoder y decoder.

Según la model card, el entrenamiento se realizó a partir de pares (transcripción STT, referencia humana) de anime y galgame, mediante destilado o ajuste fino sobre la base google/byt5-small. El pipeline de entrenamiento se encuentra en el repositorio github.com/JabsDev/goanime-tv, dentro de `work/audit_train`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá del uso de la tokenización a nivel de byte.

## Capacidades
- Corrección de transcripciones ASR en japonés: elimina duplicaciones y bucles de decodificación típicos del STT.
- Normalización kanji/kana según la lectura: por ejemplo, sustituye 何 por なん cuando corresponde la lectura en kana.
- Reparación de partículas faltantes o erróneas y eliminación de espacios espurios.
- Funcionamiento byte-level sin tokenizer externo, tolerante a entradas ruidosas o con codificación imperfecta.
- Salida seq2seq de texto a texto: recibe la transcripción cruda y devuelve la versión corregida.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al japonés.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso
- Postprocesado de subtítulos de anime: se sitúa entre la salida del STT y el traductor, limpiando las transcripciones para reducir errores arrastrados a la traducción final.
- Limpieza de transcripciones de galgame: corrige diálogos generados por ASR en videojuegos con texto japonés coloquial y lecturas variables.
- Generación automática de subtítulos para plataformas de vídeo: integrado en un pipeline donde el STT produce texto bruto y el auditor lo normaliza antes de publicar.
- Creación de corpus paralelos limpios: mejora la calidad de transcripciones usadas como datos de entrenamiento para otros modelos.
- Pipelines de doblaje o fansub asistido: normaliza el texto japonés antes de pasarlo a traducción automática o revisión humana.
- Preprocesado en aplicaciones de accesibilidad: subtitulado en directo de contenido japonés donde el ruido del ASR degrada la legibilidad.
- Integración en herramientas de escritorio locales: al ejecutarse en CPU vía ONNX Runtime, encaja en aplicaciones sin GPU que requieran corrección en tiempo real.

## Benchmarks y rendimiento
Los únicos datos publicados en la información disponible son métricas de tasa de error de caracteres (CER) sobre el conjunto de evaluación del propio autor, no sobre benchmarks estándar como MMLU, HumanEval o GSM8K.

| Configuracion | CER |
|---|---|
| Encoder int8 + decoder fp32 | Aproximadamente 16,5 % |
| Modelo en fp32 puro | Aproximadamente 13,9 % |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware
- VRAM: no requiere GPU; está diseñado para inferencia en CPU con ONNX Runtime.
- Memoria aproximada en disco/RAM: unos 220 MB para encoder.onnx (int8) y unos 330 MB para decoder.onnx (fp32), es decir, en torno a 550 MB más overhead de runtime.
- GPU recomendadas: no aplica; el despliegue objetivo es CPU.
- Compatibilidad con GPU de consumo: el modelo es lo bastante pequeño para caber en cualquier GPU, pero no está optimizado para CUDA en esta distribución.
- Opciones de despliegue: ONNX Runtime (CPU), según la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goanime-auditor-ja | ≈300 M (byt5-small) | No disponible (512 nativo de byt5-small) | Corrección ASR japonés (anime/galgame) | Apache 2.0 | ONNX en HuggingFace |
| google/byt5-small | ≈300 M | 512 | Modelo base byte-level multilingüe | Apache 2.0 | PyTorch en HuggingFace |
| google/byt5-base | ≈580 M | 512 | Modelo base byte-level multilingüe | Apache 2.0 | PyTorch en HuggingFace |

No se dispone de información sobre otros modelos de corrección de ASR específicos para japonés que permitan una comparación directa en la información proporcionada.

## Limitaciones y advertencias
- Modelo especializado y de dominio estrecho: no es un LLM ni un traductor, y no debe usarse fuera de la corrección de transcripciones en japonés.
- Sesgo de dominio: entrenado con datos de anime y galgame, por lo que su comportamiento fuera de ese registro puede degradarse.
- Dependencia del idioma: solo soporta japonés.
- Riesgo de alucinación: como cualquier modelo seq2seq, puede introducir correcciones incorrectas sobre textos ya correctos.
- Pérdida de calidad por cuantización: la variante mixta (encoder int8 + decoder fp32) rinde peor que el modelo fp32 puro (≈16,5 % frente a ≈13,9 % de CER).
- El decoder int8 no es viable: la propia model card indica que rompe el modelo (CER superior al 100 %).
- Longitud de contexto no documentada: no se especifica en la model card, lo que dificulta predecir el comportamiento con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución correspondientes.
- Datos de entrenamiento y proceso no detallados: no se documentan composición del dataset, número de tokens ni técnicas de alineación, lo que limita la reproducibilidad y la evaluación de sesgos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Jabs2/goanime-auditor-ja
- Repositorio del pipeline de entrenamiento: https://github.com/JabsDev/goanime-tv
- Modelo base: https://huggingface.co/google/byt5-small
