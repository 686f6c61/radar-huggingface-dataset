# jjcoders/suna-v1

## Resumen

JJ coders Suna AI v1.0 es un sistema de generación de música y voz cantada en estéreo a 48 kHz, desarrollado por JJ Coders Group (Johan Jomet) y publicado bajo licencia MIT. El modelo se presenta como un sistema completo de texto-a-música que combina un backbone de difusión denominado ACE-Step 1.5 XL SFT con un encoder de texto y fonética basado en Qwen3-Embedding-0.6B, catorce expertos LoRA DiT por género y una red crítica de selección de candidatos. El repositorio incluye pesos en safetensors, GGUF y checkpoints PyTorch para distintos entornos de ejecución.

La propuesta del autor se centra en resolver problemas habituales de los sistemas de difusión musical de código abierto: melodías vocales planas, intros sin ritmo, articulación fonética deficiente y salidas en mono o baja fidelidad. Para ello introduce guías melódicas, un alineador fonético multilingüe (inglés, malabar, francés y español), un crítico de selección de muestras y un VAE de audio que produce estéreo a 48 kHz con mastering a -14 LUFS.

El dato de parámetros declarado en safetensors es de 304.364.288, aunque la model card describe el backbone como un transformer de difusión de 5.000 millones de parámetros. El repositorio ocupa 18,2 GB y acumula 2.825 descargas en Hugging Face. Es relevante ahora por su enfoque modular (backbone, encoder, LoRA por género, crítico) y por ofrecer formatos GGUF para ejecución local, algo poco habitual en modelos de generación musical.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow-matching continuo (ACE-Step 1.5 XL SFT) + encoder Qwen3-Embedding-0.6B + 14 LoRA DiT Rank-64 + crítico ResNet-SE |
| Parámetros totales | 304.364.288 según safetensors; la model card declara un backbone de 5.000 millones de parámetros (dato no verificado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (dos variantes publicadas); safetensors en precisión completa |
| Idiomas soportados | en, ml, fr, es |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF v3, PyTorch (.pt) |

## Arquitectura y entrenamiento

El sistema se compone de varias piezas. El backbone es un transformer de difusión con flow-matching continuo identificado como ACE-Step 1.5 XL SFT, sobre el que se aplican catorce adaptadores LoRA de rango 64 especializados por género. La condición de texto y fonética la proporciona Qwen3-Embedding-0.6B, y la selección de candidatos generados la realiza una red crítica de 15,8 millones de parámetros (SunaV1TitanMasterpieceNet), compuesta por 12 bloques ResNet dilatados con módulos SE. La decodificación de audio corre a cargo de un VAE denominado Oobleck, que produce estéreo a 48 kHz.

El pipeline incorpora un alineador fonético por sílabas con G2P multilingüe para en, ml, fr y es, guías melódicas ("Melodic Soul Guides") para fijar la curva de F0 y el lock rítmico de la intro, y un proceso de mastering mid-side a -14 LUFS. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detalla el esquema de entrenamiento de los LoRA por género ni del crítico.

## Capacidades

- Generación de música instrumental y con voz cantada a partir de texto, en estéreo y 48 kHz.
- Síntesis de voz cantada con control de melodía y rango de F0 (la model card menciona +12 semitonos y 1,8 octavas).
- Condicionamiento fonético multilingüe para inglés, malabar, francés y español.
- Catorce expertos LoRA especializados por género, seleccionables según el estilo solicitado.
- Selección de candidatos mediante red crítica para descartar muestras de baja calidad.
- Mastering integrado a -14 LUFS en mid-side.
- Lock rítmico de intro con sub-bajo y batería desde el segundo 0 (según el autor, 99,4 % de groove lock).
- Ejecución local mediante GGUF Q4_K_M.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Producción musical asistida: generar maquetas vocales e instrumentales en 48 kHz estéreo para revisión rápida antes de la grabación final, aprovechando el mastering integrado a -14 LUFS.
- Publicidad y branding sonoro: crear jingles cortos con letra en inglés, francés o español y una melodía controlada mediante las guías melódicas, reduciendo el tiempo de iteración frente a la composición manual.
- Localización de canciones: adaptar una misma pieza a distintos idiomas aprovechando el alineador fonético multilingüe, manteniendo la curva melódica original.
- Contenido para creadores: generar bandas sonoras y voces para vídeo, pódcast o streaming directamente en local con el GGUF Q4_K_M, sin depender de servicios en la nube.
- Prototipado en estudios de sonido: usar los LoRA por género para explorar variaciones estilísticas sobre una misma letra y comparar candidatos mediante el crítico integrado.
- Investigación en generación de audio: servir como base para experimentos de flow-matching aplicado a música, al ser un sistema modular con backbone, encoder y crítico separables bajo licencia MIT.
- Educación musical: generar ejemplos cantados en varios idiomas para prácticas de pronunciación o análisis melódico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 304 millones de parámetros en safetensors, los pesos en fp32 rondan 1,2 GB; el repositorio completo (18,2 GB) incluye además LoRA, crítico, VAE y checkpoints adicionales.
- GPU recomendadas: no disponible. El autor menciona un Space en A100 para la demo oficial.
- Compatibilidad con GPU de consumo: no confirmada. La existencia de GGUF Q4_K_M sugiere viabilidad en equipos con GPU modesta, pero no se publican requisitos mínimos.
- Opciones de despliegue: diffusers (librería declarada), GGUF para runtimes locales, checkpoints PyTorch para Colab y ZeroGPU Spaces.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida de audio | Licencia | Formatos |
|---|---|---|---|---|---|
| JJ coders Suna AI v1.0 | 304 M (safetensors); 5 B declarados en el backbone | no disponible | 48 kHz estéreo | MIT | safetensors, GGUF, PyTorch |
| ACE-Step (backbone base) | no disponible en la información | no disponible | no disponible | MIT (según la model card) | no disponible |
| Otros sistemas text-to-music open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificables de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card declara un backbone de 5.000 millones de parámetros, pero el recuento real de safetensors es de 304.364.288; existe una discrepancia no aclarada que conviene verificar antes de dimensionar infraestructura.
- No se documentan el dataset de entrenamiento, el número de tokens ni el proceso de alineación, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación fonética: la articulación de letras puede degradarse en idiomas distintos de los cuatro declarados.
- Cobertura limitada a en, ml, fr y es; el resto de idiomas no está soportado oficialmente.
- Las afirmaciones de rendimiento de la model card (99,4 % de groove lock, 1,8 octavas de F0) no van acompañadas de benchmarks reproducibles.
- Aunque la licencia es MIT, el sistema incorpora componentes de terceros (ACE-Step bajo MIT y Qwen3-Embedding bajo Apache 2.0); conviene revisar la atribución en uso comercial.
- No hay información sobre latencia, throughput ni requisitos mínimos de hardware, lo que complica la planificación en producción.
- El modelo se presenta como "Halloween 2026 Flagship", lo que sugiere un ciclo de publicación reciente y posible inestabilidad en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjcoders/suna-v1
- Sitio web oficial: https://suna.jjcoders.com
- Demo en Gradio (A100): https://huggingface.co/spaces/johanjomet/suna-ai-studio
