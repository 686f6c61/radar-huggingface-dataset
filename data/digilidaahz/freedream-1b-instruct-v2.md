# Digilidaahz/Freedream-1B-Instruct-V2

## Resumen

Freedream-1B-Instruct-V2 es un modelo de lenguaje de aproximadamente 977 millones de parámetros entrenado desde cero por un desarrollador independiente (Digilidaahz), sin partir de pesos de Llama, Qwen ni ningún otro modelo existente. Se trata de un transformer decoder-only de arquitectura GPT personalizada, con 24 capas, dimensión oculta de 1792 y 16 cabezas de atención, entrenado íntegramente en una única GPU de consumo RTX 5080 de 16 GB. Esta versión Instruct se obtiene por fine-tuning supervisado (SFT) sobre el checkpoint base `Digilidaahz/Freedream_1B_BaseModel`, que ha visto 24,1 mil millones de tokens del dataset FineWeb-Edu.

El modelo resuelve el problema de demostrar que es viable preentrenar y alinear un SLM (small language model) completo con hardware de consumo, empleando técnicas de eficiencia como precisión mixta FP8, AdamW8bit y cross-entropy fragmentada. Su relevancia actual es principalmente experimental y educativa: sirve como referencia reproducible de un pipeline de entrenamiento from-scratch y como banco de pruebas para modificaciones arquitectónicas y de tokenizador (por ejemplo, la corrección del token `{` que se trataba como UNK en versiones previas).

La versión V2 Preview mantiene capacidades generales estables tras un SFT completo de más de 220.000 muestras, sin olvido catastrófico apreciable en las métricas reportadas. El modelo está orientado a generación de texto en inglés, con una ventana de contexto de 4096 tokens y licencia CreativeML OpenRAIL-M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT personalizada) |
| Parametros totales | 977.300.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (entrenamiento en FP8 mixto; no se documentan formatos de cuantización para inferencia) |
| Idiomas soportados | inglés (en) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible (repo de 7,9 GB; no se especifica safetensors/GGUF en la información) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 24 capas, dimensión oculta de 1792 y 16 cabezas de atención. Incorpora SwiGLU en las capas feed-forward, RoPE (rotary positional embeddings) para la codificación posicional y embeddings con pesos atados (weight-tied) entre entrada y salida. El vocabulario es de 32.001 tokens tras la expansión desde 32.000 para añadir el token `{`, que en versiones anteriores se mapeaba a UNK; la operación se realizó heredando los pesos de embedding antiguos y reiniciando los estados del optimizador para evitar explosiones de gradiente.

El preentrenamiento del modelo base consumió exactamente 24,1 mil millones de tokens del dataset FineWeb-Edu. El SFT se realizó sobre 220.000 muestras curadas que combinan SmolTalk (Magpie, Everyday Chats), OpenHermes (código y lógica), Ember (escritura creativa) y un dataset propio de anclaje de identidad. El entrenamiento se ejecutó en una RTX 5080 de 16 GB con 64 GB de DDR5, alcanzando 20.300+ tokens/s durante el SFT mediante FP8 de precisión mixta, cross-entropy fragmentada, AdamW8bit y un DataPrefetcher asíncrono con lecturas aleatorias en bloques de 16 MB y doble buffering para evitar bloqueos de E/S. No se reporta uso de RLHF ni DPO; la alineación se limita al SFT supervisado.

## Capacidades

- Generación de texto en inglés con formato conversacional mediante plantilla de prompt (formato detallado en la model card, truncado en la información disponible).
- Razonamiento básico y respuesta a preguntas de conocimiento general, con rendimiento moderado en benchmarks de sentido común.
- Aritmética elemental, aunque con riesgo documentado de bucles matemáticos en prompts abstractos zero-shot.
- Generación de código a nivel de formato y sintaxis, con lógica subyacente limitada por la ausencia de datos de código en el preentrenamiento.
- Escritura creativa y conversación multi-turno dentro de la ventana de 4096 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación educativa sobre entrenamiento from-scratch: sirve para estudiar el impacto de decisiones de tokenizador, mezclas de datos SFT y optimizadores en un SLM de 1B, dado que todo el pipeline está documentado y es reproducible en hardware de consumo.
- Prototipado de chatbots conversacionales en inglés: el modelo gestiona diálogos multi-turno dentro de 4096 tokens y puede desplegarse en local para pruebas de concepto sin coste de API.
- Generación de texto creativo breve: adecuado para relatos cortos, descripciones y borradores, con la advertencia de que la coherencia en formato largo puede degradarse.
- Banquito de pruebas para técnicas de eficiencia (FP8, AdamW8bit, DataPrefetcher): útil para validar recetas de entrenamiento en una sola GPU antes de escalar.
- Evaluación comparativa de SLMs: como referencia de lo que logra un modelo de 1B con solo 24B tokens frente a modelos entrenados con billones de tokens.
- Formateo y plantillas de código: puede generar estructuras de código sintácticamente correctas para tareas de maquetación o ejemplos didácticos, sin garantía de lógica correcta.
- Fine-tuning posterior por la comunidad: al ser from-scratch y con licencia OpenRAIL-M, permite experimentar con ajustes específicos de dominio sobre una base propia.

## Benchmarks y rendimiento

Evaluación con `lm-evaluation-harness` en configuración 0-shot sobre una RTX 5080.

| Benchmark | Métrica | V1 | V1.1 | V2 (Preview) | Llama-3.2-1B (referencia) |
|---|---|---|---|---|---|
| ARC-Challenge | acc_norm | 29,69% | 30,46% | 30,63% | ~59,4% |
| HellaSwag | acc_norm | 45,82% | 45,68% | 45,93% | ~59,0% |
| PIQA | acc | 68,38% | 68,55% | 67,95% | ~74,0% |
| WinoGrande | acc | 52,64% | 53,27% | 53,67% | ~59,0% |
| Wikitext-2 | word_ppl | ~26,45 | 26,31 | 25,94 | ~11,8 |

El autor atribuye la perplexity más alta en Wikitext-2 a dos factores: el vocabulario de 32K frente al de 128K de Llama (menor compresión) y el sesgo de alineación introducido por el SFT conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (977M parámetros), en FP16 requiere aproximadamente 2 GB de pesos más overhead de activaciones y KV cache para 4096 tokens, lo que encaja holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16; el propio autor entrenó en una RTX 5080 de 16 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y equivalentes; no confirmado oficialmente por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una arquitectura personalizada, la compatibilidad con estos motores no está garantizada y requeriría conversión de pesos.
- Latencia y throughput: no disponibles para inferencia; el autor reporta 20.300+ tokens/s durante el SFT en RTX 5080.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| Freedream-1B-Instruct-V2 | 977M | 4096 | CreativeML OpenRAIL-M | From-scratch, 24,1B tokens | Hugging Face |
| Llama-3.2-1B | ~1,2B | 128K | Llama 3.2 Community License | 15T tokens | Hugging Face, amplio ecosistema |
| Qwen2.5-1.5B | ~1,5B | 32K | Apache 2.0 | No disponible en la información | Hugging Face, amplio ecosistema |
| SmolLM2-1.7B | ~1,7B | 8K | Apache 2.0 | No disponible en la información | Hugging Face, amplio ecosistema |

Freedream-1B se sitúa por debajo de Llama-3.2-1B en todos los benchmarks reportados, con la salvedad de que su presupuesto de entrenamiento es aproximadamente 0,1% del de Llama. Los modelos Qwen2.5 y SmolLM2 se incluyen como alternativas de tamaño comparable, pero no hay datos de benchmarks de Freedream frente a ellos en la información disponible.

## Limitaciones y advertencias

- Alucinaciones matemáticas: puede entrar en bucles en prompts aritméticos abstractos zero-shot; no debe usarse como calculadora.
- Generación de código limitada: el preentrenamiento con FineWeb-Edu carece de datos de código, por lo que la lógica generada puede ser incorrecta aunque el formato sea correcto.
- Coherencia en formato largo: como modelo de 1B, los relatos extensos o el cumplimiento estricto de formatos pueden derivar en inconsistencias.
- Sin alineación de seguridad: no ha pasado por RLHF ni por un pipeline de seguridad; puede generar contenido sesgado, alucinado o inapropiado ante prompts maliciosos.
- Idiomas: soporte limitado al inglés; no se documentan capacidades multilingües.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de aplicaciones dañinas o ilegales según los términos de OpenRAIL); conviene revisar las cláusulas de redistribución y atribución antes de producción.
- Arquitectura personalizada: la falta de compatibilidad con motores estándar de inferencia puede requerir trabajo adicional de integración.
- Estado experimental: el autor la describe como versión Preview y solo para investigación y educación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Digilidaahz/Freedream-1B-Instruct-V2
- Modelo base: https://huggingface.co/Digilidaahz/Freedream_1B_BaseModel
- Dataset FineWeb-Edu: no disponible enlace directo en la información proporcionada
- Repositorio de código, paper o demo: no disponibles en la información proporcionada
