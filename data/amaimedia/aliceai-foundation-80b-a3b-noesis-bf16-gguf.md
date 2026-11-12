# AMAImedia/AliceAI-Foundation-80B-A3B-NOESIS-BF16-GGUF

## Resumen

AliceAI-Foundation-80B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 80 000 millones de parámetros totales y aproximadamente 3000 millones activos por token, desarrollado originalmente por Yandex. La versión aquí documentada es un repack en BF16 safetensors y una colección de cuantizaciones GGUF publicada por AMAImedia bajo la marca NOESIS, con licencia Apache-2.0 y pesos derivados del checkpoint base oficial `yandex/AliceAI-Foundation-80B-A3B-Base`.

La arquitectura es híbrida: combina capas de Kimi Delta Attention (KDA), atención con compuerta (gated attention), capas MoE con 512 expertos y residuales de atención, además de una cabeza Multi-Token Prediction (MTP) publicada por separado. Con un contexto de 262 144 tokens y un vocabulario SentencePiece de 129 024 entradas, está orientado a generación de texto conversacional en ruso e inglés.

Su relevancia actual radica en que ofrece una relación parámetros-activos muy agresiva (3B activos sobre 80B totales) para despliegues con presupuesto de cómputo limitado, y en que AMAImedia ha publicado cuantizaciones GGUF verificadas tensor a tensor. La advertencia principal es que, a fecha de septiembre de 2026, llama.cpp upstream no dispone de grafo de inferencia para `alice_ai`, por lo que los GGUF requieren un runtime compatible con esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Kimi Delta Attention (KDA) + gated attention + MoE + Attention Residuals |
| Parametros totales | 81 286 433 408 (≈80B) |
| Parametros activos | ≈3B por token (MoE top-10 + 1 shared) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M, Q2_K (GGUF); BF16 en safetensors |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 4 shards ≤50 GB) y GGUF |

Datos adicionales de arquitectura: hidden size 2048, 48 capas organizadas como 12 bloques de la forma 3 × (KDA → MoE) seguidos de 1 × (Gated Attention → MoE). KDA usa 32 cabezas Q y 32 cabezas KV con dimensión de cabeza 128 y kernel de convolución 4; la gated attention usa 16 cabezas Q y 2 KV con dimensión 256. El MoE tiene 512 expertos con FFN de tamaño 512. La cabeza MTP consta de 1 capa publicada aparte (`mtp.safetensors`, 20 tensores, 3,3 GB).

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que sustituye parte de la atención estándar por Kimi Delta Attention, un mecanismo de atención lineal con estado recurrente, combinado con capas de gated attention convencional y bloques MoE intercalados. Los residuales de atención (Attention Residuals) conectan las salidas de atención a través de los bloques. El resultado es un modelo con huella de memoria de 80B pero coste de cómputo por token comparable a un modelo denso de 3B, lo que reduce drásticamente los requisitos de FLOPs en inferencia.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card del checkpoint original de Yandex, que no se incluye en la información proporcionada. La innovación técnica destacable es la cabeza MTP (Multi-Token Prediction), que permite decodificación especulativa interna y se distribuye como archivo independiente, tanto en safetensors como en GGUF (`GGUF/AliceAI-Foundation-80B-A3B-MTP-F16.gguf`, 21 tensores, 3,30 GB).

El repack de AMAImedia fusiona los 49 shards originales de Yandex en un flujo único y los redivide en 4 shards de menos de 50 GB. La verificación se hizo tensor a tensor: 1307 tensores con SHA256 individual, 0 discrepancias. Las cuantizaciones GGUF se generaron con el pipeline documentado en el repositorio (`code/`), que incluye descarga, fusión por streaming, conversión y comparación.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Razonamiento y respuesta a instrucciones en contextos de hasta 262 144 tokens.
- Predicción multi-token mediante la cabeza MTP, utilizable para decodificación especulativa.
- Capacidad de operar con un coste de cómputo por token propio de un modelo de 3B activos, lo que facilita el throughput en hardware modesto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de texto en ruso a gran escala: el modelo está entrenado para ruso e inglés y su ventana de 262 144 tokens permite procesar documentos completos, informes o expedientes sin truncamiento, manteniendo coherencia a lo largo de decenas de miles de tokens.
- Asistentes conversacionales multi-turno: con 3B parámetros activos por token, el coste por respuesta es bajo, lo que permite desplegar un chatbot de calidad 80B en infraestructura con pocas GPU y sostener sesiones largas sin degradación de latencia.
- Resumen y análisis de documentación técnica extensa: la combinación de contexto largo y bajo cómputo activo lo hace adecuado para pipelines de resumen por chunks grandes, por ejemplo documentación legal o manuales de ingeniería en ruso.
- Procesamiento por lotes de corpus: al requerir menos FLOPs por token que un denso de 80B, el modelo es viable para tareas de etiquetado, clasificación y reescritura sobre millones de documentos en entornos con presupuesto de GPU acotado.
- Decodificación especulativa en producción: la cabeza MTP publicada por separado permite integrar un esquema de predicción multi-token en un runtime compatible, reduciendo el número de pasos de decodificación y aumentando el throughput efectivo.
- Investigación sobre arquitecturas híbridas de atención lineal: la combinación KDA + gated attention + MoE constituye un objeto de estudio útil para medir el comportamiento de atención lineal frente a atención cuadrática en contextos largos.
- Doblaje y automatización multilingüe: el autor enmarca la publicación dentro de una plataforma de doblaje multilingüe (NOESIS), por lo que el modelo puede emplearse como motor de generación de guiones y adaptación de texto en flujos de localización ruso-inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el checkpoint completo ocupa aproximadamente 162 GB en BF16 (81,29B parámetros × 2 bytes), por lo que requiere al menos 2 GPU de 80 GB o 4 GPU de 48 GB con paralelismo de tensor.
- Cuantización Q8_0: aproximadamente 86 GB, viable en 2 × A100 80 GB o 2 × H100 80 GB.
- Cuantización Q6_K: aproximadamente 66 GB, viable en una H100 80 GB o en 2 × RTX 4090 24 GB con offload parcial.
- Cuantización Q4_K_M: aproximadamente 46 GB, cabe en una A100 40 GB o en 2 × RTX 4090 24 GB; es la opción recomendada por el autor para uso general.
- Cuantización Q2_K: aproximadamente 26 GB, experimental, cabe en una RTX 4090 24 GB con margen ajustado o en 2 × RTX 3090 24 GB.
- GPU recomendadas: H100 80 GB y A100 80 GB para BF16 y Q8_0; A100 40 GB, RTX 4090 y RTX 3090 para Q4_K_M; el hardware de referencia del autor (RTX 3060 Laptop 6 GB, 64 GB DDR5) solo sirve para cuantizaciones de la clase 0,6–35B en RAM, no para este modelo.
- Opciones de despliegue: Transformers 5.16.1 con `flash-linear-attention==0.5.0`, o una imagen vLLM compatible con AliceAI. Los GGUF requieren un runtime con soporte de `alice_ai`; llama.cpp upstream no dispone de grafo de inferencia para esta arquitectura a fecha de septiembre de 2026.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste activo de 3B parámetros por token sugiere un throughput notablemente superior al de un denso de 80B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B (esta ficha) | 80B / ≈3B | 262 144 | Apache-2.0 | safetensors BF16 + GGUF |
| Modelos MoE de clase 80B-A3B de otros proveedores | no disponible | no disponible | no disponible | no disponible |
| Modelos densos de clase 70–80B | ≈70–80B / 70–80B | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa fiable. La comparación cualitativa relevante es de clase: frente a un modelo denso de 70–80B, este modelo reduce el cómputo por token en más de un orden de magnitud (3B activos frente a 70–80B), a costa de un mayor consumo de memoria total y de la necesidad de un runtime específico para la arquitectura `alice_ai`.

## Limitaciones y advertencias

- Compatibilidad de runtime: los GGUF de este repositorio no funcionan con `llama-cli` estándar; requieren un runtime con soporte de `alice_ai`. Esto limita las opciones de despliegue y complica la integración en stacks existentes.
- Idiomas: el modelo declara únicamente ruso e inglés; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Sesgos: no se documentan en la información disponible; al estar entrenado principalmente con corpus en ruso e inglés, es previsible que reproduzca sesgos presentes en esas fuentes.
- Alucinación: no se aportan evaluaciones de fidelidad ni tasas de alucinación; como modelo base sin fase de alineamiento documentada, el riesgo de generar contenido plausible pero incorrecto debe considerarse alto en producción.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo es un derivado del checkpoint de Yandex; conviene verificar los términos del modelo base original antes de un despliegue comercial.
- Tamaño del repositorio: 555,8 GB, lo que exige espacio en disco considerable y descargas por partes; el uso de las cuantizaciones GGUF reduce sustancialmente este requisito.
- Cabeza MTP: se distribuye como archivo aparte; omitirla no impide la inferencia, pero desactiva la decodificación especulativa.
- Cuantización Q2_K: marcada como experimental por el autor; la degradación de calidad en ese nivel no está cuantificada.
- Fecha de publicación: la model card indica 2026-09-18 como fecha de lanzamiento y el repositorio se actualizó en noviembre de 2026; el ecosistema de runtimes puede haber cambiado desde entonces.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/AMAImedia/AliceAI-Foundation-80B-A3B-NOESIS-BF16-GGUF
- Modelo base original: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Código del pipeline de repack y cuantización: https://huggingface.co/AMAImedia/AliceAI-Foundation-80B-A3B-BF16-GGUF/tree/main/code
- Sitio del autor: https://www.amaimedia.com
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
- Donaciones (Boosty): https://boosty.to/amaimediacom
- Donaciones (DonationAlerts): https://www.donationalerts.com/r/djbionicl
