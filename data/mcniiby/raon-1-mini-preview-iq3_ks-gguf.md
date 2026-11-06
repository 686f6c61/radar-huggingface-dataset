# McNiiby/Raon-1-mini-preview-IQ3_KS-GGUF

## Resumen

Esta ficha cubre una cuantización GGUF en formato IQ3_KS del modelo Raon-1 mini preview de KRAFTON, publicada por el usuario McNiiby en Hugging Face. El modelo base es un MoE (mixture of experts) de 28,8B parámetros totales y 4,3B activos, con licencia Apache-2.0, diseñado principalmente para generación de texto en inglés con modo de razonamiento (thinking). Esta cuantización, de 13,85 GB, está pensada específicamente para ejecutarse en GPUs de consumo de 16 GB manteniendo una ventana de contexto de 128K tokens.

El valor diferencial de esta versión es técnico: no es una cuantización estándar de llama.cpp, sino que requiere un fork concreto (ik_llama.cpp con soporte Raon-1 y parches de velocidad de decodificación) porque utiliza tipos de cuantización propios de ik_llama.cpp (IQ3_KS e IQ4_KS_R16) y una cabeza de salida recortada que necesita un mapeo especial de filas a identificadores de token. Según el autor, alcanza unos 220-230 tok/s de decodificación en una RTX 5070 Ti, lo que la convierte en una opción atractiva para inferencia local de alta velocidad en hardware de consumo.

Es relevante porque permite ejecutar un modelo razonador de 28,8B (con arquitectura híbrida MoE que incluye capas MLA y recurrentes) en una sola GPU de 16 GB, algo habitualmente reservado para GPUs de gama alta, con una degradación de calidad medida y documentada (KLD de 0,0931 frente a la referencia Q4_K_M).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (expertos enrutados + capas MLA + capas recurrentes/SSM) |
| Parametros totales | 28.645.818.282 (~28,8B) |
| Parametros activos | ~4,3B (MoE, 24 capas con 128 expertos, experto FFN de ancho 1088) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | IQ3_KS (expertos gate/up), IQ4_KS_R16 (expertos down), Q6_K, Q8_0, Q4_K, F16, F32; 3,86 bpw medios |
| Idiomas soportados | Inglés (la cabeza recortada no puede emitir ~54K tokens multi-carácter no latinos: coreano, chino y japonés degradados en salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (requiere ik_llama.cpp fork específico; incompatible con llama.cpp principal, Ollama y LM Studio) |

## Arquitectura y entrenamiento

Raon-1 mini preview es un modelo MoE de 28,8B parámetros totales y ~4,3B activos por token, con 24 capas MoE de 128 expertos cada una (ancho FFN de experto: 1088) más un experto compartido. La arquitectura es híbrida: 7 capas usan atención MLA (multi-head latent attention) y 18 capas usan proyecciones recurrentes/SSM (parámetros `ssm_g`, `ssm_beta`, `ssm_rda`), lo que reduce el coste de la caché KV y facilita contextos largos. El modelo base está diseñado para funcionar con modo de razonamiento (thinking) activado.

Sobre el entrenamiento del modelo base, la información disponible no detalla el número de tokens ni la composición del dataset. Respecto a la cuantización: se partió del GGUF Q8_0 oficial de KRAFTON, usando `llama-quantize --custom-q` de ik_llama.cpp con matriz de importancia (imatrix) calculada desde el Q4_K_M de KRAFTON. La calibración se hizo sobre texto público (web en inglés, Wikipedia, código, Wikipedia en coreano y CJK) más historial de chat privado del autor (no publicado). Una innovación destacable es el recorte de la cabeza de salida: el vocabulario de 259.840 tokens (muy cargado de coreano/CJK) se reduce a 206.168 filas eliminando tokens multi-carácter no latinos/no griegos, manteniendo caracteres individuales, bytes y tokens especiales (cualquier cadena sigue siendo generable, pero más lentamente en CJK). El coste de calidad del recorte es mínimo: +0,0008 KLD. El fork del motor mapea las filas de la cabeza de vuelta a ids de token mediante `raon1.output_token_ids`.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (thinking mode), recomendado por KRAFTON para este modelo.
- Razonamiento matemático de alto nivel: 94,2 en AIME 2026 (30 x 4 muestras) con esta cuantización.
- Conocimiento científico y académico: 71,2 en GPQA Diamond y 78,6 en un subconjunto de 210 ítems de MMLU-Pro.
- Seguimiento de instrucciones: 84,7 en IFBench (prompt, loose).
- Manejo de conversaciones multi-turno desafiantes: 58,9 en MultiChallenge.
- Contexto largo nativo de 128K tokens gracias a las capas recurrentes y MLA.
- Lectura de entrada en cualquier idioma (el tokenizador y los embeddings no se modifican); la limitación afecta a la salida, no a la entrada.
- Soporte de tool calling: el modelo intenta invocar herramientas como `stateful_python_code_exec` en algunos casos, aunque el comportamiento exacto depende del despliegue.
- No hay información disponible sobre capacidades de visión, audio o agentes multi-paso formales.

## Casos de uso

- Razonamiento matemático local: con 94,2 en AIME 2026, es adecuado para resolver problemas de olimpiada matemática en local, generando cadenas de razonamiento largas con thinking mode activado.
- Asistente técnico en inglés en GPU de consumo: cabe en una RTX 5070 Ti de 16 GB con contexto completo de 128K, ideal para desarrolladores que quieren un razonador potente sin alquilar GPUs en la nube.
- Análisis de documentos largos: los 128K de contexto permiten procesar contratos, papers o bases de código completas en una sola sesión, con prefill de ~4.900 tok/s.
- Chatbot de alta velocidad: a 220-230 tok/s de decodificación, la latencia percibida en streaming es muy baja, adecuada para interfaces conversacionales interactivas.
- Generación y comprensión de código: la calibración incluyó código y los benchmarks de seguimiento de instrucciones son sólidos; útil para asistentes de programación en inglés.
- Procesamiento multilingüe de entrada: se puede introducir texto en coreano, chino, japonés o ruso (el tokenizador está intacto), aunque la respuesta se emitirá en inglés o con tokens degradados.
- Experimentación con arquitecturas híbridas MoE/SSM/MLA: al requerir un fork específico, es interesante para investigadores que quieran estudiar estos diseños en local.
- Servidor LLM local con llama-server: el comando de uso documentado permite montar un endpoint OpenAI-compatible con razonamiento en formato deepseek.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantización, ejecutados sobre los mismos pesos con cabeza completa, con thinking activado (temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5, KV cache q8_0):

| Benchmark | Esta cuantización | KRAFTON card (BF16) |
|---|---|---|
| AIME 2026 (30 x 4 muestras) | 94,2 | 93,3 |
| GPQA Diamond (198) | 71,2 | 84,3 |
| MMLU-Pro (subconjunto de 210 ítems) | 78,6 | 76,5 |
| IFBench (prompt, loose) | 84,7 | 84,2 |
| MultiChallenge (266, juez gpt-5.6-luna) | 58,9 | 59,0 |
| AA-Omniscience public (600, juez gpt-5.6-luna) | -3,0 | 3,5 |

Notas del autor: la brecha principal está en GPQA (sobre todo química); ~5% de las respuestas de GPQA terminan en una llamada a una herramienta Python no ofrecida, quedando sin respuesta. GPQA y MMLU-Pro tienen alto riesgo de contaminación, y las ejecuciones únicas son ruidosas.

Velocidad (RTX 5070 Ti 16 GB, CUDA 12.8, fork ik_llama.cpp):

| Medida | Valor |
|---|---|
| Decodificación tg128 (con `-fa 1`, KV q8_0) | ~220-230 tok/s |
| Decodificación a 16K de contexto | ~190 tok/s |
| Prefill pp4096 (`-ub 2048` / `-ub 512`) | ~4.900 / ~3.500 tok/s |

Calidad de la cuantización (KLD frente a Q4_K_M de KRAFTON, 19,7 GB, sobre 40 x 512 tokens):

| Build | Tamaño | KLD medio | Mismo top token | Ratio PPL |
|---|---|---|---|---|
| Este archivo (cabeza recortada) | 13,85 GB | 0,0931 ± 0,0027 | 86,97% | 1,040 |
| Mismos pesos, cabeza completa | 13,96 GB | 0,0923 ± 0,0027 | 86,97% | 1,040 |
| Expertos IQ4_KS, cabeza completa (no publicado) | 16,26 GB | 0,0496 ± 0,0015 | 91,12% | 1,001 |

## Requisitos de hardware

- VRAM para inferencia: cabe completa en una GPU de 16 GB con contexto de 128K y KV cache q8_0 (quedan ~1,2 GB libres con el escritorio corriendo en la misma GPU). El archivo pesa 13,85 GB; los embeddings de tokens (Q4_K, 0,37 GB) residen en memoria del host.
- GPU recomendada: RTX 5070 Ti (verificada). El megakernel MoE más rápido requiere GPU sm_90+ (serie RTX 50 en consumidor). Las RTX 30/40 compilan y caen automáticamente a una variante más lenta, pero no han sido probadas en hardware real.
- Consumer GPU: sí, RTX 5070 Ti 16 GB es el caso de uso objetivo; otras GPUs de 16 GB de la serie 50 deberían funcionar (no verificado).
- Despliegue: únicamente mediante el fork [ik_llama.cpp-raon](https://github.com/Mcniiby/ik_llama.cpp-raon) (ik_llama.cpp con soporte Raon-1 y parches de velocidad). Incompatible con llama.cpp principal, Ollama y LM Studio. Se usa `llama-server` con `-ngl 99 -fa on --ctx-size 131072 -ub 256 -ctk q8_0 -ctv q8_0 --jinja --reasoning-format deepseek --reasoning on`.
- Latencia y throughput: ~220-230 tok/s de decodificación single-stream a contexto corto, ~190 tok/s a 16K, prefill de ~4.900 tok/s con `-ub 2048`.
- Parámetros de muestreo recomendados: temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5 (0 para matemáticas), thinking mode activado.

## Comparativa con modelos similares

| Modelo | Parámetros totales/activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 mini preview (IQ3_KS GGUF) | 28,8B / 4,3B | 128K | Apache-2.0 | GGUF para fork ik_llama.cpp específico |
| Qwen3-30B-A3B | 30,5B / 3,3B | 128K (con YaRN hasta más) | Apache-2.0 | GGUF, safetensors; soporte en llama.cpp principal, Ollama, vLLM |
| GPT-OSS-20B | ~21B / ~3,6B | 128K | Apache-2.0 | GGUF, safetensors; soporte amplio en ecosistema |

Comparación: los tres son MoE pequeños en parámetros activos con licencia Apache-2.0 y contexto de 128K. Raon-1 mini destaca en razonamiento matemático (94,2 en AIME 2026 según la card del autor) y en velocidad de decodificación en GPUs de 16 GB, pero su ecosistema es mucho más restrictivo: requiere un fork concreto de ik_llama.cpp y su cabeza recortada degrada la salida en coreano, chino y japonés. Qwen3-30B-A3B y GPT-OSS-20B ofrecen compatibilidad universal con las herramientas estándar de inferencia. No hay datos de benchmark comparativos directos publicados entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Estado de preview: el modelo base Raon-1 mini preview es una vista previa; aplican todas las limitaciones declaradas por KRAFTON.
- Enfoque en inglés: la cabeza recortada no puede emitir ~54K tokens multi-carácter no latinos; la salida en coreano, chino y japonés cae a tokens más cortos (más lenta y a veces ligeramente diferente). La entrada multilingüe funciona con normalidad.
- Motor obligatorio: solo funciona con el fork ik_llama.cpp-raon; no carga en llama.cpp principal, Ollama ni LM Studio.
- Caída de calidad en GPQA: 71,2 frente a 84,3 del BF16 oficial, principalmente en química; parte de la brecha puede deberse a diferencias en el uso de herramientas durante la evaluación.
- Riesgo de alucinación: como todo LLM, puede generar información falsa; el autor señala además alto riesgo de contaminación en GPQA y MMLU-Pro, lo que puede inflar los resultados.
- Comportamiento de tool calling irregular: en ~5% de casos de GPQA intenta llamar a una herramienta Python no ofrecida, dejando la respuesta vacía; conviene gestionar este caso en producción.
- GPU no verificadas: RTX 30/40 funcionan con un fallback más lento pero no han sido probadas en hardware real.
- Datos de calibración no publicados: la imatrix incluye historial de chat privado del autor, lo que introduce un factor no auditable en la cuantización.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque el estado preview del modelo base aconseja cautela en producción.
- Single runs ruidosos: los benchmarks provienen de ejecuciones únicas (salvo AIME, 30 x 4 muestras) y deben interpretarse con margen de error.

## Enlaces

- Ficha de la cuantización: https://huggingface.co/McNiiby/Raon-1-mini-preview-IQ3_KS-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Fork del motor requerido: https://github.com/Mcniiby/ik_llama.cpp-raon
