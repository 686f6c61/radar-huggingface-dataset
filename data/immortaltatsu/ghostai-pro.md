# immortaltatsu/ghostai-pro

## Resumen

GhostAI Pro es un ajuste fino supervisado (SFT) del modelo open source MiniCPM5-2B de OpenBMB, desarrollado por el usuario immortaltatsu para la aplicación de monedero de criptomonedas GhostWallet sobre la red Solana. Su propósito no es la generación de texto generalista, sino la emisión de llamadas a herramientas (tool calling) en formato Hermes contra un catálogo cerrado de 175 herramientas específicas de la aplicación, seguido de una respuesta de una sola línea fundamentada en el resultado devuelto por la herramienta.

El modelo resuelve un problema muy concreto: ejecutar en el dispositivo (on-device) la capa de selección y construcción de llamadas a herramientas de un asistente financiero, sin depender de un servicio en la nube. Con 2.516.756.480 parámetros totales, se distribuye en cuantizaciones de 4 bits de entre 1,42 GB y 1,56 GB, lo que lo hace desplegable en hardware móvil mediante llama.rn o llama.cpp.

Su relevancia reciente radica en que demuestra un patrón de especialización extrema: un modelo pequeño de 2B parámetros ajustado sobre un contrato de aplicación real, con métricas de selección de herramienta del 96,1% en un conjunto de evaluación retenido de 889 trazas. La licencia Apache-2.0, heredada del modelo base, facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MiniCPM5-2B); detalles internos de capas y atención no disponibles |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuración de servicio recomendada (`-c 8192`); máximo nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (4,95 BPW, imatrix) e IQ4_XS (4,51 BPW, imatrix); pesos completos en bf16 |
| Idiomas soportados | No disponible (la model card no declara idiomas; el corpus de entrenamiento es específico de la aplicación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M e IQ4_XS) |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5-2B, un transformer decoder-only de 2.516.756.480 parámetros. El ajuste se realizó mediante SFT con TRL `SFTTrainer`, DeepSpeed ZeRO-3, precisión bf16 sobre 2 GPU A100-40GB, tasa de aprendizaje 1e-5, batch efectivo de 32 y longitud máxima de secuencia de 2048 tokens. Se aplicó pérdida únicamente sobre los tokens del asistente (assistant-only loss).

El corpus de entrenamiento consta de 5.270 trazas reconstruidas a partir de 5.520 especificaciones (250 descartadas por no corresponder al catálogo), divididas en 4.381 de entrenamiento y 889 de evaluación retenida. Se ejecutaron 3 épocas y se publicó la época 2, seleccionada por pérdida de evaluación (0,1826 → 0,1804 → 0,2098). Un detalle técnico relevante: MiniCPM5 no incluye marcadores `{% generation %}` en su plantilla de chat, por lo que el entrenamiento usó una copia de la plantilla con la rama del asistente envuelta en dichos marcadores, mientras que la plantilla de inferencia publicada es la original.

La innovación principal no es arquitectónica sino de contrato: el modelo emite una única llamada en formato Hermes (`<tool_call>{"name":...,"arguments":{...}}</tool_call>`) y después una respuesta de una línea fundamentada en el resultado. La versión v5 reconstruye la superficie de herramientas de la aplicación: añade 5 herramientas (`list_accounts`, `privacycash_register`, `privacycash_deposit`, `privacycash_send`, `privacycash_withdraw`), elimina 4 (`get_nft`, `list_nfts`, `magicblock_swap`, `magicblock_swap_quote`), añade el parámetro `routeSource` a `execute_swap` y `get_swap_quote`, el parámetro `query` a `web_fetch` y el valor `privacy-cash` a los enums de `get_privacy_status`, `balance` y `activity`.

## Capacidades

- Emisión de llamadas a herramientas en formato Hermes con nombre y argumentos JSON, limitada al catálogo de 175 herramientas de la aplicación GhostWallet.
- Selección de herramienta entre el catálogo recuperado: 96,1% de acierto en el conjunto retenido.
- Generación de argumentos válidos para la herramienta seleccionada: 97,8% de validez.
- Respuesta fundamentada de una línea a partir del resultado de la herramienta, sin llamadas espurias en el bucket de respuesta.
- Rechazo controlado en conversación general (bucket de chat) sin emitir llamadas espurias.
- Soporte de function calling y tool calling como capacidad central, no accesoria.
- Modo de razonamiento desactivado por defecto en la configuración de servicio recomendada (`enable_thinking: false`).
- Capacidad multilingüe: no disponible; el modelo está especializado en el contrato de una aplicación concreta.
- No se declaran capacidades de visión, audio ni agentes multi-paso autónomos.

## Casos de uso

- Asistente de monedero Solana en el dispositivo: el modelo recibe el system prompt de la aplicación y un fragmento recuperado del catálogo de 175 herramientas, y emite una llamada única que el parser, validador y ejecutor de la app procesan; su tamaño de 1,56 GB en Q4_K_M permite ejecutarlo en un teléfono mediante llama.rn.
- Consulta de saldos y actividad: herramientas como `get_wallet_balance` o `get_activity` se invocan con argumentos vacíos o mínimos y el modelo devuelve una línea fundamentada con el resultado, adecuado para respuestas rápidas en interfaz conversacional.
- Operaciones con pasarela de confirmación: `send_sol` y las cuatro herramientas `privacycash_*` quedan retenidas por la puerta de confirmación de la aplicación; el modelo solo construye la llamada y el harness verifica que no se produzcan bypass de dicha puerta.
- Privacidad de transacciones: las herramientas `privacycash_register`, `privacycash_deposit`, `privacycash_send` y `privacycash_withdraw` cubren el riel de privacidad añadido en v5, con el enum `privacy-cash` disponible en las consultas de estado.
- Intercambios con enrutamiento: `execute_swap` y `get_swap_quote` aceptan el parámetro `routeSource`, lo que permite al modelo especificar la fuente de enrutamiento dentro de la llamada.
- Obtención de datos externos: `web_fetch` con el parámetro `query` permite al modelo formular consultas de recuperación acotadas antes de responder.
- Integración en pipelines de CI/CD de la aplicación: el harness `src/sdk/chat/ghostai-app.test.ts` con 21 pruebas valida parser, validador, puertas de seguridad y ejecutor con salidas enlatadas del modelo, lo que permite regresionar el contrato ante cambios en el catálogo de herramientas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el corpus retenido de contrato de aplicación (889 filas, decodificación greedy):

| Bucket | n | Llamada emitida | Herramienta correcta | Argumentos válidos | Llamada exacta |
|---|---|---|---|---|---|
| tool_call | 464 | 100% | 96,1% | 97,8% | 49,8% |
| answer | — | — | — | — | Respuesta de una línea fundamentada, sin llamada espuria |
| chat | — | — | — | — | Rechazo, sin llamada espuria |

La selección de herramienta mejoró del 94,6% (superficie v4) al 96,1% en v5, pese a incorporar el riel privacy-cash. En el harness de pipeline de la aplicación se declaran dos invariantes absolutos: 0 bypass de la puerta de confirmación y 0 cadenas de inyección plantadas que alcancen un argumento de herramienta. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M (1,56 GB de pesos) e IQ4_XS (1,42 GB), más overhead de contexto; unos 6-7 GB para los pesos bf16 de 5,0 GB más caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para las cuantizaciones de 4 bits; A100-40GB o H100 no son necesarias para inferencia, solo se usaron 2×A100-40GB para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, así como en hardware móvil mediante llama.rn.
- Opciones de despliegue: llama.cpp y llama-server (producción declarada), llama.rn en dispositivo, y compatibilidad con text-generation-inference y endpoints según los tags del repositorio; también transformers con los pesos safetensors.
- Configuración de servicio crítica: usar `--special` para preservar los tokens especiales `<tool_call>` y `</tool_call>`, `--reasoning-format none` y `--chat-template-kwargs '{"enable_thinking": false}'`, ya que llama.cpp elimina los tokens especiales por defecto y rompería el parser de la aplicación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GhostAI Pro | 2,52B | 8192 en servicio recomendado | Tool calling especializado en 175 herramientas de GhostWallet | Apache-2.0 | Hugging Face, GGUF y safetensors |
| openbmb/MiniCPM5-2B (base) | 2,52B | No disponible | Modelo generalista de generación de texto | Apache-2.0 | Hugging Face |
| Alternativas generalistas de ~2B para tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con otros modelos de la misma categoría (asistentes de tool calling de 2B parámetros) no está disponible en la información proporcionada. La diferencia medible frente al modelo base es la especialización: GhostAI Pro sustituye la generación libre por un contrato de llamada única con métricas declaradas de selección y validez de argumentos.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo conoce el catálogo de 175 herramientas de GhostWallet; fuera de ese contrato su utilidad es marginal y no debe emplearse como asistente generalista.
- Tasa de llamada exacta del 49,8%: aunque la herramienta y los argumentos son correctos en la mayoría de casos, la coincidencia exacta de la llamada completa es baja, lo que exige un validador robusto en producción.
- Dependencia de la plantilla de chat: el entrenamiento usó una plantilla modificada con marcadores `{% generation %}` y la inferencia usa la original; cualquier cambio en la plantilla o en el manejo de tokens especiales puede degradar el formato de salida.
- Riesgo de alucinación en los argumentos: nombres de herramientas o parámetros fuera del catálogo recuperado pueden aparecer si el fragmento de catálogo inyectado es incompleto o incorrecto.
- Sesgos conocidos: no disponibles; no se documenta evaluación de sesgos.
- Idiomas: no declarados; el corpus es específico de la aplicación y probablemente en inglés, sin garantías de comportamiento en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte; la responsabilidad sobre operaciones financieras recae en el integrador.
- Caveat de producción: la seguridad depende de las puertas de confirmación y validación de la aplicación, no del modelo; los invariantes de 0 bypass se verifican en el harness con salidas enlatadas, no con el modelo en vivo.
- Fecha de creación futura (2026-09-15) en los metadatos de Hugging Face, lo que conviene verificar antes de citar el modelo en documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immortaltatsu/ghostai-pro
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (binding móvil de llama.cpp): https://github.com/mybigday/llama.rn
- TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
- DeepSpeed ZeRO-3: https://www.deepspeed.ai/tutorials/zero/
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
