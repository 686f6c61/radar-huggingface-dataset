# Lottolabs/LFM2.5-24B-A2B-TT-Mixed-BFP4-BFP8-P150-tt-model

## Resumen

LFM2.5-24B-A2B-TT-Mixed-BFP4-BFP8-P150-tt-model es un paquete de despliegue publicado por Lottolabs que adapta el modelo base LiquidAI/LFM2.5-24B-A2B al hardware Tenstorrent P150. No se trata de un modelo nuevo: es una conversión de pesos y un entorno de servicio que permite ejecutar el modelo original de Liquid AI sobre aceleradores Tenstorrent mediante un runtime propio basado en tt-metal y un plugin de vLLM. El modelo base es un transformer híbrido MoE de 24 mil millones de parámetros totales y aproximadamente 2 mil millones activos, con 40 capas que combinan convoluciones cortas con puerta y atención de consultas agrupadas, y una ventana de contexto de 131.072 tokens.

La conversión aplica cuantización GPTQ a los expertos enrutados en formato BFP4 de Tenstorrent, mientras que los pesos de atención, convoluciones, MLP denso y LM-head se redondean a BFP8, y todos los tensores se reempaquetan en el layout lfmq-1. El resultado ocupa solo 1,2 GB en el repositorio de Hugging Face, aunque el checkpoint original descargado en caché ronda los 14,5 GB. El paquete incluye perfiles de servicio para 1, 2, 4, 8 y 16 usuarios concurrentes, con decodificación especulativa por búsqueda de prefijo para el perfil de un usuario y caché de prefijos exacta.

Es relevante porque demuestra la viabilidad de servir un MoE de 24B con contexto largo en un único acelerador Tenstorrent P150, un caso poco común en el ecosistema open source, que hasta ahora se ha centrado en GPU NVIDIA y AMD. Está publicado bajo la licencia LFM Open License v1.0 y es un paquete comunitario, no una versión oficial de Liquid AI ni de Tenstorrent.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 40 capas con convoluciones cortas con puerta (gated short convolutions) y atención de consultas agrupadas (GQA); MoE de 64 expertos con top-4 desde la capa 2 |
| Parámetros totales | 24 mil millones (24B) |
| Parámetros activos | Aproximadamente 2 mil millones (2B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | BFP4 (expertos enrutados, GPTQ) y BFP8 (atención, convoluciones, MLP denso y LM-head); layout lfmq-1 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | Tensores reempaquetados en layout lfmq-1 para tt-metal; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B emplea una arquitectura híbrida que alterna convoluciones cortas con puerta y capas de atención de consultas agrupadas a lo largo de 40 capas. La capa MoE, activa desde la segunda capa, contiene 64 expertos con enrutamiento top-4, lo que da lugar a aproximadamente 2B parámetros activos por token pese a los 24B totales. Esta combinación busca reducir el coste de atención en contextos largos manteniendo capacidad de modelado mediante el componente convolucional.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Lo que sí se documenta es el proceso de conversión de este paquete: cuantización GPTQ de los expertos enrutados a BFP4, redondeo a BFP8 de los pesos restantes y repaquetado de todos los tensores en el layout lfmq-1. El runtime incorpora decodificación especulativa por búsqueda de prefijo (hasta 7 borradores con n-gramas de 2 a 4) para el perfil de un usuario, muestreo exacto en dispositivo y caché de prefijos exacta.

## Capacidades

- Generación de texto y razonamiento: el modelo siempre razona; el texto previo a `</think>` se devuelve en el campo `reasoning` (o `reasoning_content` en vLLM anterior a 0.11.1) y la respuesta final en `content`.
- Llamada a herramientas: parser `lfm2` habilitado; las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`, con llamadas en formato pythonic entre `<|tool_call_start|>` y `<|tool_call_end|>`.
- Generación de código: incluida en el uso previsto junto con razonamiento, chat y trabajo con contexto largo.
- Contexto largo: ventana de 131.072 tokens por usuario, con pools KV compartidos de hasta 1.048.576 tokens en el perfil batch16.
- Concurrencia: perfiles para 1, 2, 4, 8 y 16 usuarios simultáneos.
- API compatible con OpenAI: chat completions, completions y `/v1/models` en el puerto 20000.
- Muestreo configurable: temperatura, top-k, top-p, min-p, penalizaciones y semilla, con muestreo exacto en dispositivo.
- Solo texto: no se documentan capacidades de visión ni audio.

## Casos de uso

- Chat multi-turno con contexto largo: el perfil `single` permite a un usuario trabajar con hasta 131.072 tokens de historial, adecuado para análisis de documentos extensos o conversaciones con memoria amplia.
- Razonamiento asistido con separación de trazas: el campo `reasoning` permite auditar el proceso de pensamiento por separado de la respuesta final, útil en entornos donde se requiere trazabilidad.
- Agentes con llamada a herramientas: el parser `lfm2` devuelve `tool_calls` estructurados, lo que facilita integrar el modelo en bucles de agente que consultan APIs externas o ejecutan funciones.
- Generación de código en pipelines internos: el uso previsto incluye código; con tool calling puede encadenarse con linters o ejecutores en CI/CD.
- Servicio multiusuario en un único P150: los perfiles `batch4`, `batch8` y `batch16` permiten atender varios usuarios concurrentes con contexto completo por sesión, útil para equipos pequeños o prototipos internos.
- Evaluación de hardware Tenstorrent: el paquete sirve como referencia para medir latencia y throughput de un MoE de 24B en P150 antes de comprometer infraestructura.
- Despliegue con API OpenAI-compatible: permite sustituir un endpoint OpenAI por este servidor local sin reescribir clientes, útil para pruebas de integración o entornos con requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: un acelerador Tenstorrent P150; el paquete no está pensado para GPU NVIDIA, AMD ni CPU.
- Almacenamiento: aproximadamente 14,5 GB en la caché de Hugging Face para el checkpoint, más unos 16 GB para las cachés de kernels y tensores convertidos que se generan en el primer arranque.
- Tiempo de primer arranque: entre 8 y 10 minutos para convertir pesos, compilar kernels y capturar las trazas; los arranques posteriores reutilizan las cachés.
- Software: Tenstorrent CLI (`tt`, instalable con `uv tool install tenstorrent`) y Docker; también es posible usar `tt-model` directamente sin la CLI.
- Despliegue: runtime propio basado en tt-metal con plugin de vLLM; servidor OpenAI-compatible en el puerto 20000 (o el siguiente libre).
- Concurrencia y memoria KV: perfil `single` con 1 usuario y 131.072 tokens; `batch2` con 262.144 tokens de pool KV; `batch4` con 524.288; `batch8` y `batch16` con 1.048.576 tokens compartidos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (paquete Lottolabs TT) | 24B | ~2B | 131.072 | LFM Open License v1.0 | Tenstorrent P150 |
| LiquidAI/LFM2.5-24B-A2B (original) | 24B | ~2B | 131.072 | LFM Open License v1.0 | GPU convencional (no especificado en la información disponible) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible solo permite comparar el paquete con su modelo base. No se dispone de datos sobre modelos alternativos de tamaño o tarea comparable.

## Limitaciones y advertencias

- Dependencia exclusiva del hardware Tenstorrent P150: no es desplegable en GPU NVIDIA, AMD ni CPU con este paquete.
- Paquete comunitario: no es una versión oficial de Liquid AI ni de Tenstorrent; el soporte y las garantías dependen de Lottolabs.
- Solo texto: no hay capacidades de visión ni audio documentadas.
- Idiomas soportados: no disponibles en la información; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación: no cuantificado en la documentación; aplicable como en cualquier modelo generativo.
- Sesgos: no documentados en la información disponible.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de uso comercial; la información proporcionada no detalla restricciones específicas.
- Primer arranque costoso: 8-10 minutos de conversión y compilación; inadecuado para entornos efímeros que no persisten cachés.
- Concurrencia limitada: el perfil `single` atiende un solo usuario; los perfiles batch sacrifican la decodificación especulativa.
- La cuantización BFP4 de los expertos puede degradar la calidad respecto al checkpoint original en BFP16/BF16; no se han publicado mediciones de esta pérdida.
- El identificador de modelo en las peticiones debe ser el de los pesos (`Lottolabs/LFM2.5-24B-A2B-TT-Mixed-BFP4-BFP8-P150`), no el nombre del paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Lottolabs/LFM2.5-24B-A2B-TT-Mixed-BFP4-BFP8-P150-tt-model
- Pesos de la release: https://huggingface.co/Lottolabs/LFM2.5-24B-A2B-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia: https://huggingface.co/Lottolabs/LFM2.5-24B-A2B-TT-Mixed-BFP4-BFP8-P150/blob/58f343ec7a6543c58c82a244f0463967fd0f7317/LICENSE
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- tt-metal (rama lottolabs): https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/lfm2.5-24b-a2b-p150
- vLLM (rama lottolabs): https://github.com/LottoLottoLotto/vllm/tree/lottolabs/lfm2.5-24b-a2b-p150
- tt-model-plugins (rama lottolabs): https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/lfm2.5-24b-a2b-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
