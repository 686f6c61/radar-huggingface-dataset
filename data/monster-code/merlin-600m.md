# Monster-Code/Merlin-600M

## Resumen

Merlin-600M es la denominacion del repositorio publicado por Monster-Code bajo el identificador `Monster-Code/Merlin-600M`, un checkpoint de generacion de texto en ingles etiquetado como `small-model` y `pretraining`. La model card incluida en el repositorio describe en realidad un modelo denominado Merlin-9M, un decoder-only de 8.854.146 parametros entrenado desde cero sobre el corpus Stew-10B (Wikipedia, Ultra-FineWeb y DCLM). Existe por tanto una discrepancia entre el nombre del repositorio (600M) y las especificaciones tecnicas documentadas (8,85M de parametros); esta ficha recoge los datos tal como aparecen en la model card y senala la inconsistencia en la seccion de limitaciones.

El modelo se presenta como un ejercicio de preentrenamiento a pequena escala con decisiones arquitectonicas poco habituales en ese rango de tamano: nucleo recurrente en profundidad, prediccion multi-token (MTP-2), optimizador Muon para pesos 2D y AdamW para embeddings, y un vocabulario restringido a los primeros 8.192 merges del BPE de GPT-2. El checkpoint corresponde al paso 12.502 de entrenamiento, tras haber visto aproximadamente 811 millones de tokens.

Su relevancia es fundamentalmente experimental: sirve como referencia reproducible para estudiar tecnicas de eficiencia (recurrencia en profundidad, MTP) en modelos por debajo de los 10 millones de parametros, y para validar pipelines de preentrenamiento sobre corpus abiertos sin contaminacion de benchmarks. No esta pensado como modelo de produccion ni compite en capacidad con modelos de su supuesta categoria de 600M, ya que su tamano real documentado es dos ordenes de magnitud inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con nucleo recurrente en profundidad (12 capas unicas, capas 3-8 aplicadas dos veces = 18 capas efectivas), RoPE, RMSNorm + QK-norm, SwiGLU, logits softcap 15 |
| Parametros totales | 8.854.146 (segun model card; el nombre del repo indica 600M, dato no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en `.pt`; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | other (licencias upstream mixtas: CC BY-SA 3.0, GFDL; sin restricciones adicionales impuestas por el repositorio) |
| Formato de pesos | PyTorch `.pt` (diccionario con `model`, `cfg`, `step`); no se publican safetensors ni GGUF |

Otros parametros documentados: `d_model` 256, 8 cabezas de atencion (`head_dim` 32), FFN SwiGLU(384), vocabulario de 8.192 tokens (primeros merges del BPE de GPT-2), optimizador Muon (pesos 2D) + AdamW (embeddings).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas unicas con `d_model` 256 y 8 cabezas de atencion. La innovacion principal es el nucleo recurrente en profundidad: las capas 3 a 8 se aplican dos veces, de modo que se obtienen 18 capas efectivas sin incrementar el numero de parametros. La primera pasada utiliza una escala residual aprendida y la segunda una escala menor (`scale_loop`). Incorpora RoPE para el sesgo posicional, RMSNorm con QK-norm para estabilizar la atencion, activacion SwiGLU en la FFN y un softcap de logits de 15 para limitar la magnitud de la salida.

El entrenamiento utiliza el objetivo de prediccion multi-token MTP-2, que anade una cabeza auxiliar que predice el token dos posiciones por delante, atada a la misma matriz de embeddings. Esta cabeza solo interviene durante el entrenamiento; en inferencia el modelo se usa como un LM causal estandar. El optimizador combina Muon para los pesos 2D y AdamW para los embeddings, una eleccion poco frecuente en modelos de este tamano. El corpus de entrenamiento es Stew-10B (10.000 millones de tokens): 25% Wikipedia (`20231101.en`, 2,5B), 50% Ultra-FineWeb en ingles (5,0B) y 25% DCLM-baseline 1.0 (2,5B). El checkpoint publicado corresponde al paso 12.502, con aproximadamente 811 millones de tokens vistos, es decir, menos del 10% de una epoca completa sobre el corpus. No se menciona RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo causal estandar.
- Razonamiento basico y completado de texto a corto plazo, limitado por sus 8,85M de parametros y 1.024 tokens de contexto.
- Tokenizacion BPE de GPT-2 restringida a los primeros 8.192 IDs; los IDs fuera de ese rango se recortan (`clamp`) durante la inferencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No dispone de modo thinking, vision ni audio.
- El modulo `merlin9m.py` del repositorio incluye un helper `load_model()` y una funcion `generate()` autocontenidos para inferencia.

## Casos de uso

- Investigacion sobre recurrencia en profundidad: el modelo permite reproducir y medir el efecto de aplicar las capas 3-8 dos veces con escalas residuales distintas, comparando 12 capas unicas frente a 18 efectivas con el mismo presupuesto de parametros.
- Estudio de prediccion multi-token (MTP-2): util como banco de pruebas para evaluar si una cabeza auxiliar a dos posiciones mejora la calidad del LM base en regimenes de pocos datos (menos de 1B de tokens vistos).
- Validacion de pipelines de preentrenamiento limpios: al no incluir datos de ARC, HellaSwag, PIQA ni WinoGrande, sirve para medir contaminacion de benchmarks en corpus como Ultra-FineWeb o DCLM sin interferencia de datos de evaluacion.
- Experimentos con el optimizador Muon: el checkpoint y la configuracion permiten analizar el comportamiento de Muon en pesos 2D frente a AdamW en embeddings a escala de millones de parametros.
- Prototipado educativo: su tamano (repo de 0,2 GB) y su modulo de inferencia autocontenido lo hacen adecuado para demostraciones docentes de entrenamiento e inferencia de un LM desde cero en hardware modesto.
- Pruebas de tokenizacion restringida: util para estudiar el impacto de limitar el vocabulario a los 8.192 merges mas frecuentes del BPE de GPT-2 y del recorte de IDs fuera de rango en la calidad de generacion.
- Baseline en ablaciones de corpus: al entrenar sobre una mezcla documentada (25/50/25) de Wikipedia, Ultra-FineWeb y DCLM, sirve como referencia para comparar variaciones de mezcla a igualdad de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se uso dato de benchmark alguno (ARC, HellaSwag, PIQA, WinoGrande u otros) en el entrenamiento, pero no reporta metricas de evaluacion del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 8,85M de parametros (unos 35 MB de pesos) mas el coste del contexto de 1.024 tokens; el repo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM, y probablemente en CPU.
- Opciones de despliegue: el repositorio solo proporciona un modulo de inferencia en PyTorch (`merlin9m.py` con `load_model()` y `generate()`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de comparaciones publicadas por el autor, por lo que la comparativa se limita a caracteristicas estructurales. Los modelos de la misma categoria (decoder-only de menos de 10M de parametros entrenados desde cero sobre corpus abiertos) rara vez publican checkpoints con arquitecturas tan especificas; se incluyen alternativas de rango cercano a titulo ilustrativo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Merlin-600M (Merlin-9M) | 8,85M (segun card) | 1.024 | other (upstream CC BY-SA 3.0 / GFDL) | Hugging Face, pesos `.pt` | Recurrencia en profundidad, MTP-2, Muon |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face, safetensors/GGUF | Referencia clasica; 14x mas parametros |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | Hugging Face, multiples formatos | 124x mas parametros; otro orden de magnitud |
| Modelos <10M de la familia Pythia/TinyStories | variable | variable | variable | Hugging Face | No disponible comparativa directa con este checkpoint |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de nombre: el repositorio se llama `Merlin-600M` pero la model card describe Merlin-9M con 8.854.146 parametros. Verificar el contenido real del checkpoint antes de cualquier uso.
- Entrenamiento incompleto: solo 811M de tokens vistos de un corpus de 10B (menos del 10% de una epoca), por lo que la calidad del LM es limitada y probablemente inferior a la de un modelo del mismo tamano entrenado con el corpus completo.
- Contexto muy corto (1.024 tokens) e idioma unico (ingles): no apto para conversaciones multi-turno largas ni para otros idiomas.
- Tokenizador restringido: los IDs fuera de `[0, 8191]` se recortan en inferencia, lo que puede degradar la generacion con texto que requiera merges poco frecuentes.
- Riesgo elevado de alucinacion y de incoherencia a partir de pocas decenas de tokens, dado el tamano y el estado de entrenamiento.
- Sesgos: el corpus incluye Wikipedia, Ultra-FineWeb y DCLM, con los sesgos demograficos y de dominio habituales en web filtrada; no se documenta ninguna mitigacion.
- Licencia: marcada como `other` con licencias upstream mixtas (CC BY-SA 3.0, GFDL). El autor declara no imponer restricciones adicionales, pero el uso comercial requiere revisar las obligaciones de atribucion y compartir-igual de las licencias upstream.
- No se publican safetensors, GGUF ni cuantizaciones, ni integracion con frameworks de despliegue estandar; el uso en produccion exigiria trabajo adicional de empaquetado.
- No hay datos de benchmarks, evaluaciones de seguridad ni informes de red-teaming.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Monster-Code/Merlin-600M
- Dataset de entrenamiento: https://huggingface.co/datasets/Monster-Code/Stew-10B-tokenized
- Modulo de inferencia: `merlin9m.py` incluido en el repositorio
- Paper, blog o demo: no disponibles en la informacion proporcionada
