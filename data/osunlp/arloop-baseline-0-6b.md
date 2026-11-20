# osunlp/ARLoop-baseline-0.6B

## Resumen

ARLoop-baseline-0.6B (publicado en la model card como PreNormLoop-0.6B) es un modelo de lenguaje base de tipo transformer con bucles recurrentes, desarrollado por el OSU-NLP Group (Ohio State University). Se trata del checkpoint final de una ejecución de entrenamiento de 0,6 mil millones de parámetros sobre aproximadamente 180 000 millones de tokens, y sirve como línea base del proyecto ARLoop, cuyo objetivo es estudiar transformers con conexiones residuales de atención ("attention residuals") frente a arquitecturas con bucles.

La innovación principal reside en su arquitectura "looped": el modelo contiene solo 18 capas físicas de transformer que se reutilizan en 3 pasadas recurrentes, dando una profundidad efectiva de 54 capas. Las conexiones residuales son PreNorm estándar, sin enrutamiento de atención residual, lo que lo convierte en el contrapunto de referencia frente a las variantes ARLoop con atención residual.

Es un modelo exclusivamente base (pretrained), no ajustado por instrucciones ni alineado, pensado para completado de texto y como punto de partida para mid-training y post-training. Su relevancia actual radica en que el equipo publica pesos, código, paper y checkpoints intermedios de forma completamente abierta bajo licencia Apache 2.0, algo poco habitual en la investigación sobre arquitecturas recurrentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles recurrentes (18 capas físicas compartidas en 3 pasadas), PreNorm, RoPE |
| Parámetros totales | 582.804.096 (0,58 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en FP32; inferencia en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con una peculiaridad estructural: solo 18 capas físicas, que se recorren 3 veces en bucle para alcanzar una profundidad efectiva de 54 capas. La anchura oculta es de 1536 y la capa MLP intermedia de 4608. La atención usa 16 cabezas de consulta y 4 cabezas KV (GQA), con RoPE de base 50000. Los embeddings de valor se comparten entre capas físicas alternas y la cabeza de salida está atada a los embeddings de tokens. El tokenizador es el de SmolLM2 con vocabulario de 49152.

Las conexiones residuales son adiciones PreNorm estándar, sin enrutamiento de atención residual, que es precisamente lo que lo distingue de las variantes ARLoop con attention residuals. El entrenamiento cubrió aproximadamente 179 998 556 160 tokens (unos 180 B) en 171 660 pasos de optimizador; la model card publica checkpoints intermedios en revisiones `step-050000` a `step-170000`. No se especifica en la información disponible la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación; al ser un modelo base, se asume que no las hubo.

## Capacidades

- Generación de texto y completado de texto en inglés, como modelo base.
- Razonamiento y conocimiento general derivados del preentrenamiento, sin ajuste por instrucciones.
- Capacidad de servir como base para mid-training y post-training (SFT, DPO, etc.).
- Soporte de contexto de 4096 tokens, suficiente para documentos cortos y conversaciones de varios turnos.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre arquitecturas recurrentes: permite reproducir y comparar el comportamiento de un transformer "looped" frente a uno estándar de profundidad equivalente, usando los checkpoints intermedios para estudiar la evolución del entrenamiento.
- Mid-training y post-training: al ser un modelo base con licencia Apache 2.0, se puede afinar con SFT o DPO para tareas concretas en inglés sin restricciones comerciales.
- Completado de texto y autocompletado en herramientas de edición: con 4096 tokens de contexto y 0,58 B de parámetros, encaja en entornos con recursos limitados.
- Experimentos de destilación y comparación de eficiencia: su profundidad efectiva de 54 capas con solo 18 capas físicas permite medir el coste computacional real frente a un transformer denso de 54 capas.
- Generación de texto en prototipos y demos de investigación: el tamaño reducido permite desplegarlo en una única GPU consumer para validar pipelines antes de escalar.
- Estudio de sesgos y comportamiento de modelos base: al no estar alineado, es útil para analizar qué distribuciones aprende el preentrenamiento antes de cualquier ajuste.
- Reproducibilidad académica: los checkpoints intermedios publicados permiten trazar curvas de aprendizaje y validar resultados del paper ARLoop.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una figura de resultados del paper ARLoop, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 2-4 GB son suficientes para contextos cortos.
- VRAM estimada en FP32: alrededor de 2,3 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (versión 5.22.0 según la model card) con `trust_remote_code=True`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible, y el uso de `custom_code` puede complicar su integración en estos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARLoop-baseline-0.6B | 0,58 B | 4096 | Transformer looped, 18 capas físicas / 54 efectivas | Apache 2.0 | Hugging Face, pesos y código abiertos |
| SmolLM2-360M | 0,36 B | 8192 | Transformer denso estándar | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,49 B | 32768 | Transformer denso estándar | Apache 2.0 | Hugging Face |
| Pythia-410M | 0,41 B | 2048 | Transformer denso estándar | Apache 2.0 | Hugging Face |

La comparación con estos modelos es orientativa por tamaño, no por resultados medidos: no hay benchmarks publicados en la información disponible para ARLoop-baseline-0.6B. Frente a ellos, destaca por su arquitectura looped y por publicar checkpoints intermedios, pero ofrece un contexto menor (4096) que Qwen2.5-0.5B (32768) y SmolLM2-360M (8192), y solo soporta inglés.

## Limitaciones y advertencias

- Es un modelo base sin alineación: no sigue instrucciones de forma fiable y puede generar contenido inapropiado o incoherente en formato conversacional.
- Riesgo de alucinación inherente al preentrenamiento; no hay mitigaciones documentadas.
- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- Contexto limitado a 4096 tokens, inferior al de alternativas contemporáneas de tamaño similar.
- Requiere `trust_remote_code=True` y una versión específica de transformers (5.22.0), lo que puede generar problemas de compatibilidad en producción.
- No se documentan sesgos concretos, pero al ser un modelo base entrenado con datos no especificados, se deben asumir los sesgos presentes en el corpus.
- Licencia Apache 2.0 permite uso comercial, pero al no haber sido ajustado ni evaluado para tareas de producción, se recomienda validación exhaustiva antes de desplegarlo.
- El repo ocupa 32,6 GB por la inclusión de múltiples checkpoints intermedios; conviene descargar solo la revisión necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/osunlp/ARLoop-baseline-0.6B
- Paper (arXiv): https://arxiv.org/abs/2611.05234
- Código: https://github.com/OSU-NLP-Group/ARLoop
- Checkpoints intermedios: https://huggingface.co/osunlp/PreNormLoop-0.6B/tree/step-050000 (y sucesivos hasta `step-170000`)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
