# fallentree/Gemma4-31B-Uncensored-GP100-GGUF

## Resumen

El modelo `fallentree/Gemma4-31B-Uncensored-GP100-GGUF` es un paquete GGUF optimizado para GPUs NVIDIA de arquitectura Pascal (sm_60), concretamente Tesla P100. Parte del modelo base `google/gemma-4-31B-it`, que ha sido sometido a un proceso de "uncensoring" y cuantización por el autor `HauhauCS`, y posteriormente requantizado por `fallentree` al formato `Q4_1_G64`. Se trata de un modelo denso de 31B parámetros (30.697.345.596), con arquitectura Gemma 4, 60 capas, dimensión de modelo 5376 y un vocabulario de 262.144 tokens. Su longitud de contexto es de 262.144 tokens, con ventana deslizante de 1024.

La relevancia de este modelo radica en que permite ejecutar un LLM de 31B en GPUs antiguas de 16 GB (2× P100) mediante una cuantización específica para sm_60, aprovechando la decodificación especulativa con MTP (multi-token prediction). El paquete incluye un modelo draft separado para MTP, lo que acelera la generación un 59% respecto a la cuantización Q4_K_M original en el mismo hardware. Está pensado para investigación y uso local, no para despliegue de producción con requisitos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer denso) |
| Parametros totales | 30.697.345.596 (≈30.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (ventana deslizante 1024) |
| Tipos de cuantizacion | Q4_1_G64 (4.52 bpw), token_embd Q4_1, tensores F32 |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Gemma 4, con 60 capas, d_model 5376, vocabulario de 262.144 tokens y embeddings atados (sin `output.weight` separado). La ventana de contexto máxima es de 262.144 tokens, con una ventana deslizante de 1024. El modelo base original es `google/gemma-4-31B-it`, que posteriormente fue sometido a un proceso de "uncensoring" y cuantización QAT (quantization-aware training) por `HauhauCS`, dando lugar al modelo `HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP`. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO.

La innovación técnica principal es la cuantización `Q4_1_G64`, un tipo de cuantización de segunda generación diseñada para aprovechar las instrucciones rápidas A16/HFMA2 de las GPUs Pascal (sm_60). Este formato requiere que los tensores tengan `ne[2]==1`, condición que cumplen los 410 tensores del cuerpo del modelo denso. Además, el paquete incluye un modelo draft oficial de Gemma 4 31B (`mtp-gemma-4-31B-it.gguf`) con 4 capas, embd 1024, out 5376 y `nextn_predict_layers=4`, que se utiliza para decodificación especulativa con MTP.

## Capacidades

- Generación de texto instructivo en inglés, basada en el modelo `google/gemma-4-31B-it`.
- Decodificación especulativa multi-token (MTP) mediante un modelo draft separado, que acelera la generación en GPUs Pascal.
- Contexto largo de hasta 262.144 tokens (aunque con MTP se recomienda limitar a 131.072 tokens por consumo de VRAM).
- Capacidad de ejecución en GPUs con arquitectura sm_60 (Tesla P100) gracias a la cuantización G64.
- Modelo "uncensored": no ha sido ajustado para rechazar contenido no seguro, por lo que responde sin filtros de seguridad.
- Soporte de llama.cpp y llama-server, con opciones de cuantización de caché KV (Q8_0) y flash attention.
- No soporta visión: el mmproj (proyector multimodal) no se incluye en este paquete y provoca OOM en 2×16 GB.

## Casos de uso

- Inferencia local en GPUs legacy: el modelo está optimizado específicamente para 2× Tesla P100 (16 GB), permitiendo ejecutar un LLM de 31B en hardware de 2016. Es adecuado para laboratorios o instituciones con este tipo de GPUs.
- Decodificación especulativa en producción: gracias al modelo draft MTP incluido, se puede acelerar la generación un 59% respecto a la cuantización Q4_K_M en el mismo hardware. Útil para aplicaciones de chat o generación de texto donde el throughput es crítico.
- Análisis de documentos largos: con una ventana de contexto de 262.144 tokens (recomendado 131.072 con MTP), el modelo puede procesar manuales técnicos, logs o informes extensos en una sola pasada.
- Investigación en alineación y seguridad: al ser un modelo "uncensored", permite estudiar comportamientos sin filtros de seguridad, comparando con el modelo base con safety-tuning. No apto para despliegue comercial sin supervisión.
- Asistente conversacional en inglés: el modelo puede mantener conversaciones multi-turno con contexto largo, aprovechando la arquitectura Gemma 4 y la aceleración MTP para respuesta fluida.
- Prototipado y desarrollo con llama.cpp: el paquete se integra en el fork `thefallentree/llama.cpp-gp100`, permitiendo experimentar con cuantizaciones G64, MTP y configuraciones de tensor-split en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se proporcionan datos de velocidad de inferencia en 2× Tesla P100 (16 GB), con el mismo prompt canónico, 256 tokens generados, temperatura 0, caché KV Q8_0, contexto 131.072 y tensor-split 1,1:

| Configuracion | Tok/s (novedad / 2a pasada) | Tasa de aceptacion draft | VRAM |
|---|---|---|---|
| Este modelo G64 + MTP | 38.26 / 40.10 | 0.668 | 14.789 MiB |
| Hauhau Q4_K_M + mismo MTP | 23.99 / 24.57 | 0.604 | 15.545 MiB |

La cuantización G64 ofrece un +59% de velocidad respecto al Q4_K_M del modelo padre en el mismo hardware, manteniendo una tasa de aceptación similar. Como referencia, el modelo MoE 26B-A4B (misma familia) alcanza 56.78 / 58.12 tok/s con el mismo MTP, pero no utiliza G64.

## Requisitos de hardware

- VRAM estimada: 14.789 MiB para el modelo principal + MTP con contexto 131.072 y caché KV Q8_0 en 2× P100. El archivo GGUF principal ocupa 16.186 GiB y el draft MTP 0.261 GiB.
- GPU recomendadas: 2× Tesla P100 (16 GB, sm_60). No funciona en P40 ni GTX 10-series (sm_61), ya que la ruta HFMA2 está desactivada en esas arquitecturas.
- Consumo en una sola GPU: no es viable con MTP y contexto largo; el modelo principal por sí solo supera los 16 GB, por lo que se requieren al menos 2× 16 GB con tensor-split.
- Opciones de despliegue: requiere el fork `thefallentree/llama.cpp-gp100` con el commit `19d05ddb7` (o `39c902bd1` en la rama `cursor/gemma4-mtp-host-6006`). No funciona con llama.cpp estándar ni con el pin de producción para Qwen (`a8c9f3a7b`).
- Latencia y throughput: 38-40 tok/s con MTP en 2× P100. Sin MTP, la velocidad sería menor (no se proporciona cifra exacta en la información).
- Configuración necesaria: `--split-mode tensor --tensor-split 1,1`, `--flash-attn on`, caché KV Q8_0, y `--spec-type draft-mtp` con `--spec-draft-n-max 2`.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantizacion | Velocidad (2× P100, con MTP) | Licencia |
|---|---|---|---|---|---|
| Este modelo (G64) | 30.7B denso | 262.144 | Q4_1_G64 | 38.26 tok/s | Gemma |
| HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP (Q4_K_M) | 30.7B denso | 262.144 | Q4_K_M | 23.99 tok/s | Gemma |
| 26B-A4B MoE (misma familia, Q4_K_M) | 26B total / 4B activos | no disponible | Q4_K_M | 56.78 tok/s | Gemma |

La comparación muestra que la cuantización G64 mejora el rendimiento del mismo modelo denso en GPUs Pascal, pero el modelo MoE 26B-A4B sigue siendo más rápido en términos absolutos debido a que solo activa ~4B parámetros. La diferencia clave es que el modelo denso 31B puede aprovechar la ruta G64, mientras que el MoE no puede (sus tensores de expertos tienen `ne[2]=128`).

## Limitaciones y advertencias

- Modelo "uncensored": no ha sido ajustado para rechazar contenido dañino o no seguro. No debe desplegarse en producción sin un sistema de moderación externo.
- Solo soporta inglés (idioma declarado: en). No hay evidencia de capacidades multilingües.
- Requiere un fork específico de llama.cpp (`thefallentree/llama.cpp-gp100`) y un commit concreto. No funciona con llama.cpp estándar ni con el pin de Qwen.
- Limitado a GPUs sm_60 (Tesla P100). No es compatible con P40, GTX 10-series (sm_61) ni GPUs más modernas.
- No incluye soporte de visión: el mmproj no está incluido y provoca OOM en 2×16 GB. Es un modelo solo texto.
- Riesgo de alucinación inherente a los LLM, especialmente en modelos sin safety-tuning. No se han publicado evaluaciones de calidad.
- Licencia Gemma: restricciones de uso comercial según los términos de Google. Se permite uso local e investigación, pero hay que revisar los términos antes de desplegar en producción.
- La velocidad reportada incluye MTP; no debe citarse como velocidad "bare" sin el modelo draft.
- El modelo principal por sí solo supera los 16 GB, por lo que no es viable en una sola GPU de 16 GB sin MTP y con contexto reducido.

## Enlaces

- HuggingFace: https://huggingface.co/fallentree/Gemma4-31B-Uncensored-GP100-GGUF
- Repositorio del fork de llama.cpp: https://github.com/thefallentree/llama.cpp-gp100
- Modelo base (QAT uncensored + MTP): https://huggingface.co/HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Modelo base original: https://huggingface.co/google/gemma-4-31B-it
- Documentación de diseño G64: https://huggingface.co/fallentree/Qwen3.8-27B-Uncensored-GP100-GGUF/blob/main/DESIGN.md
- Guía de conversión G64: https://huggingface.co/fallentree/Qwen3.8-27B-Uncensored-GP100-GGUF/blob/main/CONVERT.md
