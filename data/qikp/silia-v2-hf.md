# qikp/silia-v2-hf

## Resumen

Silia v2 (`qikp/silia-v2-hf`) es un port nativo a Hugging Face del modelo `Srijan-Srivastava/Silia-v2`, un transformer de lenguaje de 524 672 parámetros que implementa la arquitectura "Silu in Attention" (Silia). El port lo publica el usuario qikp y reproduce de forma bit-exacta los pesos, el tokenizador y el forward pass del checkpoint de referencia: no se ha reentrenado ni alterado ningún peso. El trabajo original es de Srijan Srivastava, distribuido bajo licencia MIT.

El interés del modelo no es su calidad generativa, sino su arquitectura: Silia fusiona atención y feed-forward SwiGLU en una única unidad "Hydra Latent Attention", donde la mitad de las cabezas aplica atención causal clásica (XLA) y la otra mitad aplica la Attention Free Transformer (AFT) de Apple (arXiv:2105.14103), una recurrencia de coste O(1) por paso de decodificación. Esto lo convierte en un banco de pruebas didáctico para investigar atención lineal, cachés híbridas y alternativas a la atención cuadrática a escala muy reducida.

Con 3 bloques, `n_embd` y `head_dim` de 64, `d_ff` de 256, contexto de 1024 tokens y un vocabulario de solo 512 piezas, el modelo es un artefacto de investigación y verificación, no un modelo listo para producción. Su valor práctico reside en la fidelidad de la implementación y en que se ejecuta íntegramente en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Hydra Latent Attention (cabezas XLA de atención causal + cabezas AFT de atención libre) |
| Parámetros totales | 524 672 (únicos; `lm_head` atado a `wte`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (el checkpoint se publica en fp32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 31 tensores; `lm_head` omitido por atado) |

Datos adicionales de configuración: `model_type: "silia"`, `architectures: ["SiliaForCausalLM"]`, carga mediante `auto_map` y `trust_remote_code=True`. El tokenizador es WordPiece con pre-tokenizador de patrón GPT-4 y vocabulario de 512 tokens. La `generation_config.json` fija `do_sample: true`, `temperature: 0.8`, `top_k: 50` y `eos_token_id: 510`. Tamaño del repositorio: 0,0 GB. Descargas acumuladas: 0; likes: 0.

## Arquitectura y entrenamiento

Cada bloque de Silia no sigue el esquema pre-norm + atención + FFN con doble residual. En su lugar hay un único residual y ninguna pre-layer-norm: `u, v = a1(x).chunk(2, dim=-1)`, `y = u * silu(v)`, `x + a2(y)`, donde `a1` proyecta de `n_embd` a `2 * d_ff` y `a2` de `2 * d_ff` a `n_embd`. Cada una de esas proyecciones reparte sus `n_head` cabezas en dos mitades con roles opuestos. Las cabezas pares implementan XLA: atención causal ordinaria sobre caché KV, con RoPE de partición mitad y mitad estilo NeoX aplicado solo a Q y K, y una proyección de salida "estilo GLA" hacia la dirección de valor normal. Las cabezas impares implementan AFT: `y_t = (Σ_{i≤t} exp(k_i) v_i) / (Σ_{i≤t} exp(k_i) + 1e-6)`, con puerta `sigmoid(q)`.

La recurrencia AFT es una suma acumulada pura, por lo que la decodificación cuesta O(1) por paso. Ambas mitades se cachean mediante una capa de caché `hybrid` que mantiene el estado KV de atención completa y dos estados recurrentes (`Σexp(k)` y `Σexp(k)·v`). El modelo tiene 3 bloques, 2 cabezas (1 XLA + 1 AFT), `n_embd` y `head_dim` de 64, `d_ff` de 256 y 32 tensores en el checkpoint original, 31 tras aplicar el atado.

No se documenta en la información disponible ningún proceso de entrenamiento propio del port: los pesos provienen del checkpoint original, que fue entrenado sobre el dataset `codelion/fineweb-edu-100M` según los metadatos. No se especifica en esta ficha el número de tokens, la composición del dataset ni si hubo RLHF o DPO; tampoco se menciona ninguna fase de alineación. La innovación técnica destacable es la implementación de la caché híbrida y la portabilidad bit-exacta del grafo, verificada con una suite de 25 tests y 2069 sub-tests: logits idénticos (`max |referencia − port| = 0.000e+00`) con `attn_implementation="sdpa"` en longitudes 1, 7, 64 y 256, tanto en ruta cacheada como no cacheada, y con diferencia de ~2.7e-4 usando `"eager"` (ruido de kernel fp32 amplificado por `exp(k)`).

## Capacidades

- Generación de texto en inglés: continuación de secuencias a partir de un prompt, con decodificación greedy o por muestreo (`temperature` 0.8, `top_k` 50 por defecto).
- Razonamiento: no disponible. El modelo no ha sido entrenado para tareas de razonamiento explícito.
- Código: no disponible. No hay indicios de entrenamiento específico en código.
- Matemáticas: no disponible.
- Visión: no soportada.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no. Solo inglés declarado en los metadatos de idioma.
- Modo "thinking": no disponible.
- Audio: no soportado.
- Capacidad especial: decodificación incremental con coste constante por paso en la mitad AFT de las cabezas, gracias a los estados recurrentes acumulados.
- Modo base: es un modelo de lenguaje base, sin ajuste por instrucciones; no sigue instrucciones ni mantiene formato conversacional, salvo que el prompt use el token especial `<|actor|>` documentado por el autor.

## Casos de uso

- Material didáctico para estudiar atención híbrida: al ocupar menos de 1 MB en fp32 y ejecutarse en CPU, permite trazar paso a paso qué hacen las cabezas XLA y AFT dentro de un mismo bloque sin necesidad de GPU ni de infraestructura de serving.
- Verificación de ports y reimplementaciones: sirve como referencia bit-exacta para validar que una nueva implementación del grafo Silia produce los mismos logits, comparando con tolerancias como `rtol=1e-2, atol=1e-3` frente a la ruta `eager`.
- Test de regresión en CI sin GPU: el repositorio es autocontenido, no requiere `requirements.txt` ni `o512.bin` en tiempo de ejecución, de modo que puede integrarse en un pipeline de integración continua que compruebe que la tokenización y la decodificación greedy siguen coincidiendo token a token.
- Investigación en atención lineal: la mitad AFT permite medir empíricamente el compromiso entre coste O(1) por paso y calidad de contexto, comparando su contribución frente a la mitad XLA con atención cuadrática en un mismo modelo.
- Experimentación con tokenizadores: el uso de WordPiece con pre-tokenizador de patrón GPT-4 y un vocabulario de 512 piezas hace de este modelo un caso de estudio útil para analizar segmentación con vocabularios extremadamente pequeños.
- Prototipado en dispositivos embebidos o entornos restringidos: con ~0,52 M de parámetros en fp32, la inferencia cabe en cualquier CPU moderna, lo que permite validar flujos de generación en hardware sin acelerador.
- Evaluación de cachés híbridas: la capa de caché `hybrid` que combina estado KV completo con dos estados recurrentes permite estudiar el consumo de memoria y la corrección de la decodificación incremental en arquitecturas mixtas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este port. La model card indica que las métricas downstream del checkpoint original (HellaSwag, PIQA y LAMBADA) están en la model card de `Srijan-Srivastava/Silia-v2` y corresponden a mediciones del autor original, no reevaluadas en este port. No se reproducen aquí sus valores para no presentar cifras no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 MB en fp32 (524 672 parámetros × 4 bytes). La cifra es orientativa y no está publicada por el autor.
- GPU recomendadas: no aplica. El modelo está pensado para ejecutarse en CPU y no se beneficia de GPU dedicada de forma significativa.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo, e incluso en CPU sin acelerador. No se requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` mediante `trust_remote_code=True`; el repositorio incluye además un CLI `inference.py` con modos `--show-ids` y `--compare`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación se hace por escala y familia arquitectónica; no implica resultados de benchmark, ya que no se dispone de métricas de este modelo.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qikp/silia-v2-hf | 524 672 | 1024 | Inglés | MIT | Hugging Face (transformers, `trust_remote_code`) |
| GPT-2 small | 124 M | 1024 | Inglés | MIT modificada | Hugging Face / OpenAI |
| SmolLM2-135M | 135 M | 2048 | Principalmente inglés | Apache-2.0 | Hugging Face |
| Srijan-Srivastava/Silia-v2 | 524 672 | 1024 | Inglés | MIT | Hugging Face (implementación original) |

Frente a GPT-2 small y SmolLM2-135M, este modelo es dos órdenes de magnitud menor en parámetros y su vocabulario es dos órdenes de magnitud menor (512 frente a 50 257 en GPT-2). La diferencia relevante no es de rendimiento, sino de propósito: los dos modelos de referencia son modelos de lenguaje utilizables, mientras que Silia v2 es una implementación de investigación sobre atención híbrida.

## Limitaciones y advertencias

- Alucinación: con 524 672 parámetros y 3 bloques, la coherencia es muy limitada y las continuaciones pueden ser gramaticales pero factualmente vacías o incorrectas. No debe usarse para generar información que se vaya a consumir sin revisión.
- Sesgos conocidos: no disponible. No se ha publicado ningún análisis de sesgo sobre este checkpoint ni sobre el original.
- Limitación de idioma: solo inglés declarado. No hay soporte multilingüe ni garantía de comportamiento en castellano.
- Limitación de contexto: 1024 tokens, muy por debajo de los estándares actuales; no admite documentos largos ni conversaciones multi-turno extensas.
- Limitación de vocabulario: 512 piezas de WordPiece implican una tokenización muy fragmentada, lo que reduce la eficiencia y puede degradar la generación.
- Sin ajuste por instrucciones: el modelo no sigue instrucciones, no responde a formatos de chat y no soporta tool calling ni uso como agente.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright. El port no introduce restricciones adicionales, pero debe mantenerse la atribución al trabajo original de Srijan Srivastava.
- Ejecución de código remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar `modular_silia.py` desde el repositorio. Conviene auditar el archivo antes de usarlo en entornos de producción, dado que el modelo tiene 0 descargas y 0 likes y no cuenta con validación de la comunidad.
- Precisión numérica: para reproducir exactamente los logits de referencia hay que usar `attn_implementation="sdpa"`; con `"eager"` aparecen diferencias del orden de 2.7e-4 por ruido de kernel fp32 amplificado por `exp(k)`.
- Cuantizaciones: no se publican versiones GGUF, AWQ, GPTQ ni similares, por lo que no hay una ruta de despliegue optimizada documentada.
- Artefactos ausentes: la suite de paridad de 25 tests y 2069 sub-tests no se distribuye en este repositorio, así que la verificación de fidelidad no es reproducible a partir de los ficheros publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qikp/silia-v2-hf
- Modelo base / checkpoint original: https://huggingface.co/Srijan-Srivastava/Silia-v2
- Repositorio original (GitHub): https://github.com/SrijanSriv211/Silia
- Documento técnico original, "Tiny Scale Is All I Can Spare To Play With Transformer.": https://github.com/SrijanSriv211/Silia/blob/cd8bfe748bb1cac562644736b56b55cee2b6cf5f/Silia%3A%20Tiny%20Scale%20Is%20All%20I%20Can%20Spare%20To%20Play%20With%20Transformer.pdf
- Paper de Attention Free Transformer (Apple): https://arxiv.org/abs/2105.14103
- Dataset de entrenamiento: https://huggingface.co/datasets/codelion/fineweb-edu-100M
