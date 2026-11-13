# ai4ug/pearl-chat-85m-it

## Resumen

Pearl-chat-85m-it es un modelo de lenguaje de 85,2 millones de parámetros desarrollado por ai4ug, un proyecto centrado en el desarrollo de IA para idiomas ugandeses. Se trata de un checkpoint con ajuste fino de instrucciones (instruction-tuned) y entrenado para conversación multi-turno en luganda, el idioma bantú hablado principalmente en Uganda. El modelo resuelve el problema de la escasez de modelos de lenguaje nativos para idiomas de bajos recursos, ofreciendo una alternativa ligera y ejecutable en hardware modesto para aplicaciones de chat en luganda.

La arquitectura es un transformer decoder-only implementado íntegramente en JAX/Flax NNX, con 16 capas, dimensión de modelo de 640 y una ventana de contexto máxima de 1024 tokens. Incorpora una innovación destacable: atención híbrida 3:1 de ventana deslizante (W=256) intercalada con atención global GQA cada cuarta capa y en la capa final, lo que reduce el coste computacional manteniendo acceso a contexto global. El tokenizador es un Byte-BPE específico de luganda con vocabulario de 16.384 tokens.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y su reducido tamaño (0,3 GB en el repositorio) lo hace especialmente adecuado para despliegues en dispositivos con recursos limitados o entornos sin GPU dedicada. Es relevante ahora porque demuestra que es posible construir modelos conversacionales funcionales para idiomas africanos de bajos recursos con presupuestos computacionales mínimos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida 3:1 (sliding window + global GQA) |
| Parámetros totales | 85.219.968 (74.734.208 en el cuerpo del transformer) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Luganda (lug) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax (JAX/Flax NNX) |

## Arquitectura y entrenamiento

El modelo sigue la preset `pearl-v5-85m` con geometría `d_model=640`, `n_layers=16`, `n_heads=10`, `n_kv_heads=5` (GQA con ratio 2:1), `d_ff=1792` y `tie_word_embeddings=True`. La innovación principal es el mecanismo de atención híbrido: tres capas de sliding window attention con ventana W=256 y `rope_theta=10000` se intercalan con una capa de atención global GQA cada cuatro capas y en la capa final, que usa `global_rope_theta=50000`. Esto reduce el coste de atención en secuencias largas manteniendo capacidad de modelar dependencias globales.

El entrenamiento se realizó sobre dos datasets propios: `ai4ug/luganda_pretrain_v5` (corpus enciclopédico ugandés verificado, datos de los 136 distritos de UBOS, Wikipedia en luganda, corpus clínico sanitario y proverbios *Engero z'Abaganda*) y `ai4ug/luganda_sft_v5` para el ajuste fino de instrucciones. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El tokenizador es un Byte-BPE de 16.384 tokens específico para luganda.

## Capacidades

- Generación de texto en luganda con calidad conversacional multi-turno.
- Razonamiento factual sobre Uganda: datos de distritos (UBOS), contenido enciclopédico y sanitario.
- Conocimiento de proverbios tradicionales *Engero z'Abaganda*.
- Conversación multi-turno: el checkpoint está específicamente ajustado para mantener coherencia en diálogos de hasta 4 turnos.
- Modelado lingüístico fino: obtiene 1.0 en precisión de pares mínimos BLiMP-Luganda, lo que indica sensibilidad gramatical nativa.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional en luganda para atención al ciudadano: el modelo puede gestionar diálogos multi-turno sobre servicios públicos, datos de distritos y cuestiones administrativas, aprovechando su entrenamiento en corpus UBOS y enciclopédico ugandés.
- Chatbot de salud comunitaria: dado su entrenamiento en corpus clínico sanitario, puede responder consultas básicas de salud en luganda, con la advertencia de que no sustituye consejo médico profesional.
- Preservación y difusión cultural: generación y explicación de proverbios *Engero z'Abaganda*, útil para aplicaciones educativas y de documentación lingüística.
- Tutor de luganda: el modelo puede servir como herramienta de práctica conversacional y corrección gramatical, respaldado por su rendimiento en BLiMP-Luganda.
- Despliegue en dispositivos de bajos recursos: con 85M parámetros y 0,3 GB de pesos, puede ejecutarse en CPU o GPUs integradas para aplicaciones offline en zonas con conectividad limitada.
- Investigación en NLP de bajos recursos: como baseline reproducible en JAX/Flax para experimentos de arquitecturas eficientes en idiomas africanos.
- Generación de contenido local: redacción de textos informativos en luganda sobre temática ugandesa (historia, geografía, salud) para medios o administraciones.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Uganda factual and proverb pass rate | 0,6 |
| Coherencia multi-turno (4 turnos) | 0,5833 |
| Tasa de colapso en saludos multi-turno | 0,0 |
| BLiMP-Luganda (pares mínimos) | 1,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en fp32 (85M parámetros × 4 bytes ≈ 340 MB más overhead); en bf16/fp16 alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en RTX 3060, RTX 4090, A100, H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en GPUs integradas.
- Ejecución en CPU: viable gracias al reducido tamaño; latencia aceptable para uso interactivo en CPU moderna.
- Opciones de despliegue: al estar implementado en JAX/Flax NNX, el despliegue natural es mediante el ecosistema JAX. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ai4ug/pearl-chat-85m-it | 85,2M | 1024 | Luganda | Apache 2.0 | safetensors, Flax |
| Modelos comparables de 85M para idiomas de bajos recursos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Ventana de contexto limitada a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Monolingüe: solo soporta luganda; no se ha documentado capacidad multilingüe.
- Riesgo de alucinación factual, especialmente en datos administrativos o sanitarios, a pesar del entrenamiento en corpus verificados.
- Tasa de coherencia multi-turno de 0,58 y pass rate factual de 0,6 indican margen de mejora significativo en calidad conversacional.
- Sesgos potenciales derivados de los corpus de entrenamiento (enciclopedia ugandesa, UBOS, Wikipedia), no documentados explícitamente.
- Aunque la licencia Apache 2.0 permite uso comercial, no se especifican restricciones adicionales ni cláusulas de responsabilidad sobre el uso en dominios sensibles como salud.
- Implementación en JAX/Flax NNX: requiere familiaridad con el ecosistema JAX; no hay soporte documentado para runtimes de inferencia convencionales (llama.cpp, vLLM).
- Fecha de creación del repositorio (2026-11-13) y ausencia de descargas/likes: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ai4ug/pearl-chat-85m-it
- Dataset de preentrenamiento: https://huggingface.co/datasets/ai4ug/luganda_pretrain_v5
- Dataset de ajuste fino: https://huggingface.co/datasets/ai4ug/luganda_sft_v5
