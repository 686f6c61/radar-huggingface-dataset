# edithatogo/lfm2.5-1.2b-intel-lora

## Resumen

`edithatogo/lfm2.5-1.2b-intel-lora` no es un modelo desplegable, sino un paquete de artefactos sintéticos de validación (smoke test) para una tubería de optimización LoRA sobre Intel/OpenVINO. Lo publica el usuario edithatogo en el marco del proyecto `models_lang` y su nombre remite a `LiquidAI/lfm2.5-1.2b-instruct`, pero el repositorio no contiene los pesos de ese modelo: solo un adaptador LoRA sintético entrenado durante 5 pasos y las exportaciones derivadas de un modelo de juguete.

El objetivo declarado es demostrar la mecánica completa del flujo: entrenamiento del adaptador, exportación a ONNX, conversión a OpenVINO IR en precisión FP, cuantización INT8 con NNCF y medición de latencia en CPU. El autor documenta que el entorno Windows bloqueaba la ruta respaldada por IPEX, de ahí que se optara por un modelo sintético en lugar del checkpoint real.

Por tanto, su relevancia es la de una referencia reproducible de ingeniería de despliegue (versiones exactas de herramientas, inventario de artefactos y métricas de latencia), no la de una base para inferencia real. Cualquier evaluación de capacidades debe hacerse sobre el modelo de Liquid AI, no sobre este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El artefacto es un modelo sintético diminuto exportado a ONNX y OpenVINO IR; la arquitectura del modelo base LFM2.5 no se describe en la información proporcionada |
| Parámetros totales | No disponible. El nombre del repositorio referencia el tamaño 1.2B del modelo base, pero los pesos de ese modelo no están incluidos |
| Parámetros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP (OpenVINO IR sin cuantizar) e INT8 (cuantización estática con NNCF 2.8.0); adaptador LoRA en checkpoint PyTorch |
| Idiomas soportados | `en` (único idioma declarado en los metadatos del repositorio) |
| Licencia | Apache-2.0 en los metadatos; la nota de mantenimiento del 27 de octubre de 2026 menciona `license: other` para fuentes cuya licencia no esté establecida, lo que introduce ambigüedad |
| Formato de pesos | ONNX (`.onnx`), OpenVINO IR (`.xml` + `.bin`), checkpoint PyTorch del adaptador (`.pt`) y JSON de métricas y metadatos |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un transformer completo. Contiene un adaptador LoRA sintético (`adapter_smoke.pt`) generado en una ejecución de humo de 5 pasos, cuyas métricas se guardan en `smoke_result.json`. Ese adaptador y el modelo de juguete asociado se exportan a ONNX (`model.onnx`, con metadatos en `model.json`), se convierten a OpenVINO IR en FP (`openvino-ir/model.xml`, `model.bin`) y se cuantizan a INT8 con NNCF, dejando rastro de la configuración en `openvino-int8/model_int8_quantization.json`.

El entorno documentado fija `openvino==2024.6.0`, `openvino-dev==2024.6.0`, `nncf==2.8.0`, `onnx==1.21.0` y `onnxscript==0.7.0`. El autor señala que `nncf==3.1.0` resultó incompatible con `openvino==2024.6.0` porque `openvino.Node` no estaba disponible, y que fue la versión 2.8.0 la que produjo el IR INT8 correctamente. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO o alineación: la ejecución de 5 pasos es un smoke test, no un ajuste real. Tampoco se detalla ninguna innovación arquitectónica del modelo base LFM2.5.

## Capacidades

- El paquete valida mecánica de herramientas, no capacidades de modelo: entrenamiento de adaptador LoRA, exportación ONNX, conversión a OpenVINO IR, cuantización INT8 y medición de latencia en CPU.
- Inferencia funcional únicamente sobre un modelo sintético diminuto; las predicciones INT8 se reportan como finitas (`INT8 predictions finite: true`).
- No se incluye generación de texto, razonamiento, código ni matemáticas del modelo LFM2.5-1.2B-Instruct; el autor indica explícitamente que no debe tratarse como un checkpoint afinado real.
- Sin soporte verificado de tool calling ni function calling.
- Sin soporte verificado de agentes ni razonamiento multi-paso.
- Multilingüismo no verificado: el único idioma declarado es `en`.
- Sin visión ni audio en este repositorio. El blog de Liquid AI menciona variantes de visión, audio y japonés dentro de la familia LFM2.5, pero no forman parte de estos artefactos.
- La etiqueta de pipeline es `feature-extraction`, aunque no hay evidencia publicada de calidad de extracción de características.

## Casos de uso

- Validación de pipelines de cuantización en CI/CD: el paquete sirve como fixture reproducible para comprobar que una actualización de NNCF u OpenVINO sigue generando un IR INT8 válido antes de aplicarla a modelos reales.
- Prueba de humo de exportación ONNX a OpenVINO IR en Windows: permite verificar la cadena de conversión en un entorno donde la ruta con IPEX está bloqueada, tal como documenta el autor.
- Línea base de latencia en CPU: `cpu_latency.json` ofrece una referencia de 0,053568 ms de media en FP y 0,061286 ms en INT8 que puede compararse contra futuras ejecuciones para detectar regresiones de rendimiento.
- Diagnóstico de compatibilidad de versiones: el repositorio documenta el fallo de `nncf==3.1.0` frente a `openvino==2024.6.0`, útil como caso de regresión al fijar dependencias en un Dockerfile o un entorno conda.
- Plantilla para equipos que quieran replicar el flujo LoRA → ONNX → IR → INT8: el inventario de artefactos y los JSON de metadatos sirven de esqueleto para montar su propia tubería con un modelo real.
- Verificación de integridad y trazabilidad: el autor recomienda fijar la revisión (`91f6077b131deb59b05845d4db689d60329ec774`) y los hashes de cada objeto, lo que convierte el repo en un ejercicio práctico de reproducibilidad con `hf_hub_download`.
- Formación y divulgación: útil en talleres sobre optimización Intel para mostrar, paso a paso, qué produce cada etapa sin necesidad de descargar pesos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de latencia en CPU sobre el modelo sintético, medidas con 50 iteraciones tras 5 calentamientos:

| Métrica | FP (OpenVINO IR) | INT8 (NNCF) |
|---|---|---|
| Latencia media (ms) | 0,053568 | 0,061286 |
| Latencia p95 (ms) | 0,065855 | 0,087240 |
| Diferencia absoluta máxima FP frente a INT8 | 0,64642227 | 0,64642227 |
| Predicciones INT8 finitas | No aplica | true |

Estos valores no son extrapolables al modelo LFM2.5-1.2B-Instruct ni a ninguna carga de trabajo real: describen un modelo de juguete.

## Requisitos de hardware

- VRAM: no aplica; la validación se ejecuta en CPU. No se publican requisitos de memoria del modelo real.
- GPU: ninguna requerida ni utilizada. El paquete está orientado a CPU x86 con OpenVINO.
- GPU de consumo: irrelevante para estos artefactos; no hay datos de despliegue en RTX 4090, A100 o H100.
- Software: `openvino==2024.6.0`, `openvino-dev==2024.6.0`, `nncf==2.8.0`, `onnx==1.21.0`, `onnxscript==0.7.0`. NNCF 3.1.0 no funciona en este entorno.
- Despliegue: runtime de OpenVINO y, para la etapa intermedia, ONNX Runtime. vLLM, TGI, llama.cpp u Ollama no aplican a este paquete.
- Latencia: 0,053568 ms de media en FP y 0,061286 ms en INT8 sobre el modelo sintético. Throughput no medido; no disponible.
- Almacenamiento: el repositorio ocupa 38,2 kB, según el árbol de ficheros indexado.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para establecer una comparación real. La tabla recoge únicamente lo que consta en la información proporcionada:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad aquí |
|---|---|---|---|---|
| `edithatogo/lfm2.5-1.2b-intel-lora` (este repo) | No disponible (solo artefactos sintéticos) | No disponible | Apache-2.0, con nota de `license: other` para fuentes no aclaradas | Público, 38,2 kB, 0 descargas y 0 likes |
| `LiquidAI/LFM2.5-1.2B-Instruct` | 1.2B según el nombre del modelo; no confirmado en la información | No disponible | No disponible | Referenciado como modelo base; no incluido |
| `LiquidAI/LFM2.5-1.2B-Base` | 1.2B según el nombre del modelo; no confirmado en la información | No disponible | No disponible | No incluido |

No hay datos de benchmarks del modelo base en la información suministrada, por lo que no es posible comparar calidad, contexto efectivo ni licencia frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor declara explícitamente que el repositorio no contiene los pesos de `LiquidAI/lfm2.5-1.2b-instruct` y que no debe tratarse como un checkpoint afinado real.
- El adaptador LoRA proviene de una ejecución de 5 pasos sobre datos sintéticos; no hay evidencia de aprendizaje útil ni de generalización.
- La divergencia entre FP e INT8 alcanza 0,64642227 en valor absoluto, un error de cuantización considerable que refleja el carácter de juguete del modelo y no debe tomarse como referencia de calidad de NNCF en producción.
- Riesgo de alucinación: no evaluable, porque no hay modelo generativo funcional en el paquete.
- Cobertura de idioma limitada a `en` en los metadatos; sin evaluación multilingüe.
- Ambigüedad de licencia: los metadatos declaran Apache-2.0, pero la nota de mantenimiento del 27 de octubre de 2026 remite a `license: other` cuando no se ha establecido la licencia de la fuente. Las licencias de código no sustituyen los derechos del modelo base ni de terceros, de modo que el uso comercial requiere revisión jurídica previa.
- Trazabilidad obligatoria: el autor exige fijar la revisión concreta y verificar checksums; los recuentos y estados de los recibos solo aplican a esas ediciones.
- Los artefactos son snapshots y fixtures de metadatos; no deben presentarse como datasets completos ni como productos validados operacionalmente.
- Fechas del repositorio (creación 2026-05-31, actualización 2026-10-26) posteriores a la fecha habitual de consulta; conviene comprobar la vigencia antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edithatogo/lfm2.5-1.2b-intel-lora
- Árbol de ficheros (rama `main`): https://huggingface.co/edithatogo/lfm2.5-1.2b-intel-lora/tree/main
- Métricas de latencia en CPU: https://huggingface.co/edithatogo/lfm2.5-1.2b-intel-lora/blob/91f6077b131deb59b05845d4db689d60329ec774/cpu_latency.json
- Metadatos de exportación ONNX: https://huggingface.co/edithatogo/lfm2.5-1.2b-intel-lora/blob/91f6077b131deb59b05845d4db689d60329ec774/model.json
- Metadatos de cuantización INT8: https://huggingface.co/edithatogo/lfm2.5-1.2b-intel-lora/blob/91f6077b131deb59b05845d4db689d60329ec774/openvino-int8/model_int8_quantization.json
- Proyecto de código del autor: https://github.com/edithatogo/models_lang
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Artículo de MarkTechPost sobre LFM2.5: https://www.marktechpost.com/2026/01/06/liquid-ai-releases-lfm2-5-a-compact-ai-model-family-for-real-on-device-agents/
