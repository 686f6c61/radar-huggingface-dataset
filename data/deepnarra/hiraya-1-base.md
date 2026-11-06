# DeepNarra/Hiraya-1-Base

## Resumen

DeepNarra Hiraya-1-Base es un modelo fundacional (base model) experimental de tamaño muy reducido, desarrollado por la organización DeepNarra y publicado en Hugging Face en octubre de 2026. Con 117.993.216 parámetros serializados (unos 118M, de los cuales 80.545.538 son parámetros únicos con embebidos compartidos), se trata de un modelo de texto de fase 1 de preentrenamiento, no alineado ni ajustado por instrucciones. Su interés principal no está en el rendimiento bruto, sino en la arquitectura: un híbrido tripartito que combina un 75% de capas Mamba-2 State Space Duality (SSD) y un 25% de Differential Attention de Microsoft, junto a proyecciones ternarias estilo BitNet b1.58 y FFN SwiGLU.

El modelo resuelve el problema de explorar memoria recurrente subcuadrática y cuantización extrema en presupuestos de cómputo compactos. Fue preentrenado durante 5.000 pasos con el optimizador Muon (con ortogonalización Newton-Schulz) más AdamW, empleando sumación compensada Kahan de 64 bits, y la pérdida convergió de 33,9651 a 0,63. Incluye un tokenizador BPE propio de 48.760 tokens con tokens especiales nativos para razonamiento y modalidades (`<think>`, `<click>`, `<touch>`, `<audio>`, `<video>`, `<box3d>`).

Es relevante ahora porque forma parte de una línea de entrenamiento acumulativa de cuatro fases que culmina en variantes MoE e instruct de unos 908,6M de parámetros, y porque sirve como banco de pruebas abierto (licencia Apache 2.0) para investigación en razonamiento latente continuo, decodificación especulativa y despliegue en borde con BitNet b1.58 en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Apex-TriHybrid-Mamba2-DiffAttn-BitNet158 (75% Mamba-2 SSD + 25% Differential Attention + BitNet b1.58 + SwiGLU) |
| Parametros totales | 117.993.216 (450,12 MB en model.safetensors) |
| Parametros activos | 80.545.538 parámetros únicos (peso atado entre token_embeddings y lm_head; no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BitNet b1.58 (proyecciones ternarias); el repositorio menciona pesos en safetensors y GGUF |
| Idiomas soportados | Inglés y multilingüe (entrenado con fineweb-edu y aya_collection) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y GGUF según la model card) |

Datos dimensionales adicionales: `d_model = 768`, `intermediate_dim = 1.376`, `num_layers = 8`, `num_heads = 8`, `vocab_size = 48.760`.

## Arquitectura y entrenamiento

La arquitectura, denominada Apex-TriHybrid-Mamba2-DiffAttn-BitNet158, combina tres técnicas en un modelo denso de 8 capas: en primer lugar, el 75% de las capas usan Mamba-2 State Space Duality (SSD), un mecanismo de memoria recurrente subcuadrática que sustituye a la atención estándar y reduce el coste en secuencias largas; el 25% restante emplea Differential Attention de Microsoft, una variante de la atención que calcula diferencias entre mapas de atención para reducir el ruido. Las proyecciones siguen el esquema BitNet b1.58 con pesos ternarios, orientado a despliegue en dispositivos de borde, y la FFN usa activación SwiGLU.

El preentrenamiento duró 5.000 pasos con una combinación del optimizador Muon (que aplica ortogonalización Newton-Schulz a las actualizaciones) y AdamW, con sumación compensada Kahan de 64 bits para la precisión numérica. La pérdida descendió de 33,9651 a 0,63. Los datasets públicos atribuidos incluyen HuggingFaceFW/fineweb-edu (ODC-By 1.0), CohereForAI/aya_collection (Apache 2.0) y m-a-p/CodeFeedback-Filtered-Instruction (Apache 2.0); además se atribuye HuggingFaceH4/no_robots (CC-BY-NC-4.0) para evaluación de seguimiento de instrucciones y un flujo sintético de razonamiento generado y verificado con SymPy (BSD-3-Clause). Al ser un modelo base de fase 1, no ha recibido SFT, RLHF ni DPO; esas etapas corresponden a las fases posteriores de la línea (Hiraya-1-H-MoE, Hiraya-1-Instruct y Hiraya-1-Reasoning).

## Capacidades

- Generación de texto en bruto (modelo base preentrenado, sin ajuste por instrucciones).
- Tokenizador BPE soberano de 48.760 tokens con tokens especiales nativos para razonamiento latente (`<think>`) e interacción multimodal (`<click>`, `<touch>`, `<audio>`, `<video>`, `<box3d>`), aunque el modelo de fase 1 es de solo texto.
- Cobertura multilingüe derivada del entrenamiento con aya_collection, además de inglés.
- Exposición de código para investigación en decodificación especulativa, memoria recurrente subcuadrática y despliegue BitNet b1.58 en GGUF.
- Diseño orientado a agentes en sandbox: las capacidades de ejecución de código y tool calling de la línea están pensadas para ejecutarse dentro del DeepNarra Airlock Sandbox, con verificación AST estática y bloqueo de SSRF (subred 169.254.169.254 y RFC-1918).
- No se han documentado capacidades de visión, audio o tool calling verificables en este modelo base.

## Casos de uso

- Investigación en arquitecturas híbridas SSM-atención: el modelo es un punto de partida pequeño (80,5M de parámetros únicos) para estudiar la mezcla 75/25 de Mamba-2 SSD y Differential Attention sin coste de cómputo elevado.
- Experimentación con BitNet b1.58 y cuantización ternaria: permite validar el comportamiento de pesos ternarios en inferencia y preparar despliegues GGUF en dispositivos de borde.
- Decodificación especulativa: por su tamaño reducido, puede actuar como draft model para acelerar la inferencia de los modelos mayores de la misma línea (Hiraya-1-Instruct o Hiraya-1-Reasoning).
- Estudio del optimizador Muon: reproduce y verifica el entrenamiento con ortogonalización Newton-Schulz y sumación Kahan en un presupuesto de cómputo accesible.
- Razonamiento latente continuo: el token `<think>` nativo del vocabulario facilita investigación en razonamiento en espacio latente, uso declarado en la model card.
- Base para fine-tuning experimental: al ser un modelo base Apache 2.0 de 450 MB, es adecuado para pruebas de SFT y DPO de bajo coste antes de escalar a las variantes de 908,6M de la serie.
- Educación y prototipado: su tamaño permite cargarlo y auditarlo íntegramente en hardware de consumo, útil para docencia y análisis de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara expresamente una política de "Zero Fake Scores" (solo hechos de ingeniería verificables) y aporta como único dato cuantitativo de entrenamiento la convergencia de la pérdida de 33,9651 a 0,63 en 5.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450,12 MB de pesos en safetensors, el modelo completo cabe con holgura en menos de 1-2 GB de VRAM incluso en FP32; no se publica una cifra oficial (no disponible).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU de consumo (por ejemplo una RTX 3060 o superior) es más que suficiente. También es viable ejecutarlo en CPU.
- Consumer GPU: cabe íntegramente en prácticamente cualquier GPU moderna, incluidas las de gama de entrada; el tamaño del repositorio completo es de 0,5 GB.
- Opciones de despliegue: integración nativa con la librería `transformers` de Hugging Face (carga manual mediante `safetensors` y `AutoTokenizer`, según el ejemplo de la model card). La model card menciona GGUF, lo que sugiere compatibilidad con el ecosistema llama.cpp/Ollama, aunque no se confirma soporte oficial (no disponible). No se menciona soporte para vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| DeepNarra Hiraya-1-Base | 118M (80,5M únicos) | Tri-híbrido Mamba-2 SSD + DiffAttn + BitNet b1.58 | Apache 2.0 | Modelo base experimental, fase 1 de una línea de 4 fases |
| Qwen2.5-0.5B (referencia de tamaño similar) | 494M | Transformer denso | Apache 2.0 (salvo la variante 3B) | Transformer convencional, ecosistema maduro; benchmarks publicados |
| SmolLM2-135M (Hugging Face) | 135M | Transformer denso | Apache 2.0 | Modelo base de tamaño comparable orientado a investigación en modelos pequeños |

Comparación cualitativa: frente a alternativas transformer de tamaño similar como SmolLM2-135M o Qwen2.5-0.5B, Hiraya-1-Base se distingue por su arquitectura híbrida SSM-atención y sus pesos ternarios BitNet, orientados a eficiencia en borde. A cambio, carece de benchmarks públicos, de ecosistema de despliegue consolidado y de ajuste por instrucciones, por lo que su valor es principalmente investigador.

## Limitaciones y advertencias

- Es un modelo base sin alinear: no sigue instrucciones y puede generar texto incoherente o ofensivo; no debe usarse directamente en producción para asistentes.
- Riesgo de alucinación elevado: la propia model card advierte que, al tratarse de una arquitectura experimental entrenada con presupuesto de cómputo compacto, las salidas deben verificarse de forma independiente en contextos médicos, legales, financieros o de seguridad crítica.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgos.
- Longitud de contexto: no disponible; no está documentada la ventana de contexto efectiva del híbrido Mamba-2/DiffAttn.
- Cobertura multilingüe declarada pero sin evaluación cuantitativa publicada; el rendimiento en lenguas distintas del inglés es desconocido.
- Las capacidades de ejecución de código y tool calling de la línea están diseñadas para operar exclusivamente dentro del DeepNarra Airlock Sandbox (verificación AST estática y bloqueo de SSRF sobre 169.254.169.254 y subredes privadas RFC-1918); ejecutarlas fuera de ese entorno supone un riesgo de seguridad.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se ofrece "AS IS" sin garantías (sección 7 de la licencia). Parte de los datasets de evaluación asociados (no_robots) son CC-BY-NC-4.0, lo que restringe el uso comercial de esos datos concretos, no de los pesos.
- El modelo es muy pequeño (80,5M de parámetros únicos) y su capacidad de razonamiento y conocimiento es limitada por diseño; está pensado como plataforma de investigación, no como producto final.

## Enlaces

- Modelo: https://huggingface.co/DeepNarra/Hiraya-1-Base
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Fase 2 (MoE): https://huggingface.co/DeepNarra/Hiraya-1-H-MoE
- Fase 3 (Instruct): https://huggingface.co/DeepNarra/Hiraya-1-Instruct
- Fase 4 (Reasoning): https://huggingface.co/DeepNarra/Hiraya-1-Reasoning
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/CohereForAI/aya_collection, https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
