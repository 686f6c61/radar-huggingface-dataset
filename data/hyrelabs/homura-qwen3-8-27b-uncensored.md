# hyrelabs/Homura-Qwen3.8-27B-Uncensored

## Resumen

Homura Qwen3.8 27B Uncensored es un modelo de lenguaje derivado de Qwen3.8-27B, desarrollado por el equipo de hyrelabs como segunda iteración de su línea HOMURA. Está diseñado específicamente para agentes autónomos que necesitan realizar pagos por API de forma automática, integrando un protocolo de herramientas JSON propio que incluye la capacidad de descubrir endpoints de pago, cotizar precios y liquidar transacciones en cadenas como Solana y Base. El modelo parte de una base abliterada (sin censura) y se ajusta con una LoRA de rango 16 sobre la torre de lenguaje, manteniendo intactos los componentes de visión y la cabeza de predicción multitoken.

Arquitectónicamente, el modelo combina bloques SSM/linear-attention con bloques de atención clásica en sus 64 capas de lenguaje, y preserva una torre de visión congelada. El archivo distribuido es un GGUF cuantizado a Q4_K_M de 15,7 GB, con un contexto nativo de 262.144 tokens. Su relevancia radica en que introduce una capa de "disciplina de gasto" entrenada: el modelo debe leer la cadena de liquidación del argumento de la herramienta y no limitarse a reconocer nombres de herramientas, lo que hace medible el riesgo de liquidación incorrecta. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas de lenguaje (48 SSM/linear-attention + 16 attention clásica) con torre de visión y cabeza MTP |
| Parametros totales | 27.436.420.336 (modelo fusionado); 27.320.697.856 según safetensors del base |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo), recomendado 32.768 para servir |
| Tipos de cuantizacion | Q4_K_M (único disponible en este repo) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (single-file, 866 tensores, arquitectura `qwen35`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B de Alibaba, un LLM multimodal denso que combina bloques de atención clásica con bloques SSM (linear-attention) en sus 64 capas de lenguaje. La versión abliterada de Huihui elimina las negativas y añade una torre de visión congelada. Sobre esta base, hyrelabs aplicó una LoRA de rango 16 y α=32 únicamente a las proyecciones convencionales (`q,k,v,o_proj` y `gate,up,down_proj`) de todas las capas, dejando intactos los internos SSM (`in_proj_*`, `out_proj`, `conv1d`). Esto supuso 79.691.776 parámetros entrenables (0,29 % del total).

El entrenamiento se realizó con un dataset propio que incluye interacciones de pago HTTP y protocolos DeFi, enseñando al modelo a descubrir endpoints de pago, cotizar y liquidar en la cadena correcta. No se menciona el uso de RLHF ni DPO. El proceso de fusión y cuantización se hizo en bf16 y se convirtió a GGUF Q4_K_M, restaurando los 15 tensores MTP desde el GGUF del base para garantizar la compatibilidad con llama.cpp.

## Capacidades

- Generación de texto sin censura: responde a prompts directos sin moralizar (6/6 en sondas del autor).
- Protocolo de herramientas JSON propio (20 herramientas) para pagos y transacciones, incluyendo x402 (Solana y Base), pay.sh y el mercado x402/B402.
- Capacidades de agente autónomo: puede descubrir un endpoint de pago, cotizar el coste y ejecutar el pago en la cadena indicada.
- Visión multimodal: los 333 tensores de visión del base están congelados y preservados, por lo que el modelo mantiene la capacidad de procesar imágenes.
- Multi-token prediction (MTP): la cabeza MTP se conserva intacta, lo que mejora la eficiencia de generación.
- Soporte para tool calling y function calling estándar (compatible con el formato de chat de Qwen3).
- Capacidades de razonamiento y codificación heredadas de Qwen3.8-27B (no se han re-evaluado en esta versión).

## Casos de uso

- Agentes autónomos que pagan por uso de APIs: el modelo puede descubrir un endpoint de pago, solicitar una cotización y liquidar la transacción en la cadena correcta (Solana o Base) sin intervención humana.
- Automatización de operaciones DeFi: integrado en un agente que ejecuta swaps, liquidaciones o pagos entre cadenas, leyendo el argumento `chain` de la herramienta para decidir la ruta.
- Búsqueda y compra en mercados descentralizados: el modelo puede interactuar con el mercado x402/B402 para localizar servicios y pagar por ellos.
- Asistente de atención al cliente con capacidad de cobro: un bot que resuelve incidencias y puede cobrar al usuario mediante x402 cuando es necesario.
- Generación de código con herramientas de pago: dentro de un pipeline de CI/CD, el modelo puede invocar servicios de pago para aprovisionar recursos bajo demanda.
- Análisis financiero automatizado: combinando su capacidad de razonamiento y su herramienta de pagos, puede realizar transacciones de prueba en entornos de testnet.
- Investigación sobre agentes autónomos con gasto real: útil para estudiar el comportamiento de LLMs en escenarios donde deben gestionar un presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor incluye una evaluación interna de su protocolo de pago (gate run) sobre el archivo GGUF cuantizado, con 22 casos y 3 muestras por caso. Los resultados se muestran a continuación a modo de referencia, aunque no son comparables con otros modelos.

| Gate | temp 0.2 | temp 0.7 |
| :-- | :--: | :--: |
| x402 Solana (herramienta y argumento `chain`) | 4/4 | 4/4 |
| x402 Base (herramienta y argumento `chain`) | 4/4 | 4/4 |
| Descubrimiento de Bazaar | 3/3 | 3/3 |
| pay.sh | 4/4 | 4/4 |
| Herramientas DeFi entrenadas (regresión) | 4/4 | 4/4 |
| Control (sin herramientas, respuesta prosa) | 2/2 | 2/2 |
| Disciplina de gasto (cotizar antes de pagar) | 1/1 (2/3 muestras) | 0/3 (falla) |

## Requisitos de hardware

- VRAM estimada: para el GGUF Q4_K_M de 15,7 GB, se recomienda al menos 16 GB de VRAM para carga completa en GPU con contexto 32k. Con contexto 262k, se necesitan más de 24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 40 GB, H100 80 GB.
- En consumer GPU: cabe en RTX 3090/4090 con offload parcial (usando `-ngl 99` para todas las capas).
- Opciones de despliegue: llama.cpp (incluido `llama-server`), LM Studio, Ollama. La card recomienda `llama-server -m ... -c 32768 --jinja --temp 0.2 -ngl 99`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Particularidad |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Homura-Qwen3.8-27B-Uncensored | 27B | 262.144 | Apache-2.0 | GGUF Q4_K_M | Agente con pagos x402 |
| Qwen3.8-27B (Alibaba) | 27B | 262.144 | Apache-2.0 | Safetensors | Base multimodal denso |
| Huihui-Qwen3.8-27B-abliterated | 27B | 262.144 | Apache-2.0 | Safetensors | Abliterado sin censura |
| Qwen3.8-27B-Uncensored-OrcaRouter | 27B | 262.144 | Apache-2.0 | GGUF | Abliterado, sin capa de pagos |

La diferencia principal con sus alternativas es la capa de herramientas de pago y el entrenamiento específico para que el modelo gestione transacciones reales. El resto de características (arquitectura, contexto, licencia) son heredadas del base.

## Limitaciones y advertencias

- Riesgo de alucinación en transacciones: la disciplina de gasto se degrada a temperaturas altas (0.7), llegando a pagar sin cotizar. Se recomienda servir a temperatura ≤0.3 y validar la cotización en el sistema externo.
- Sesgo de contenido sin censura: el modelo puede generar contenido ofensivo, ilegal o peligroso. No apto para entornos donde se requiera moderación.
- Soporte de idiomas limitado a inglés: no se evaluó el multilingüismo.
- Dependencia de la arquitectura `qwen35` en llama.cpp: requiere una build reciente que la soporte.
- El modelo no ha sido evaluado en benchmarks generales de calidad (razonamiento, código, matemáticas), por lo que su rendimiento en esas tareas no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las transacciones ni sobre el cumplimiento de normativas financieras.
- El modelo puede exponer información sensible si se usa con datos reales; el autor recomienda servir con contexto de 32k para evitar desbordes de memoria.

## Enlaces

- [HuggingFace - Homura-Qwen3.8-27B-Uncensored](https://huggingface.co/hyrelabs/Homura-Qwen3.8-27B-Uncensored)
- [HuggingFace - Huihui-Qwen3.8-27B-abliterated (base)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B (modelo original)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog - Qwen 3.8 27B Uncensored Local: GGUF Quants + llama.cpp](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Blog - Qwen3.8-27B Uncensored GGUF: Abliterated Local Build](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [HuggingFace - Qwen3.8-27B-Uncensored-OrcaRouter-GGUF](https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF)
