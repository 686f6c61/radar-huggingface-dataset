# jjcoders/suna-v1

## Resumen

Suna AI v1.0 es un sistema abierto de generación de música (voz e instrumental) desarrollado por JJ Coders Group (Johan Jomet) y publicado en Hugging Face bajo el identificador `jjcoders/suna-v1`. Resuelve la tarea de text-to-music y síntesis de canto a partir de descripciones textuales y letras, produciendo audio estéreo a 48 kHz. Su propuesta diferencial frente a pipelines de difusión genéricos es la integración de un backbone de difusión flow-matching con condicionamiento fonético multilingüe y un módulo de selección de candidatos entrenado (un crítico).

La arquitectura combina un backbone `ACE-Step 1.5 XL SFT` de flow-matching (descrito por el autor como 5.000 millones de parámetros), un encoder de texto y fonética `Qwen3-Embedding-0.6B`, 14 expertos LoRA de rango 64 sobre el DiT (uno por género) y una red crítica de 15,8 millones de parámetros (`SunaV1TitanMasterpieceNet`, ResNet dilatada con atención squeeze-excitation). Los pesos publicados en safetensors suman 304.364.288 parámetros, un dato relevante porque contrasta con la cifra de 5.000 millones que aparece en la model card y conviene tener en cuenta al planificar el despliegue.

Es relevante ahora porque ofrece una alternativa con licencia MIT, formatos múltiples (safetensors, GGUF Q4_K_M y adaptadores PyTorch) y soporte declarado de cuatro idiomas (inglés, malabar, francés y español), lo que facilita su integración tanto en entornos de investigación como en herramientas locales de generación musical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching diffusion transformer (backbone ACE-Step 1.5 XL SFT) con 14 LoRA experts de rango 64, encoder Qwen3-Embedding-0.6B y crítico ResNet-SE |
| Parametros totales | 304.364.288 (pesos safetensors publicados); la model card declara 5.000 millones para el backbone, cifra no verificable con los datos disponibles |
| Parametros activos | no disponible (no es MoE; los LoRA experts se describen como seleccionables por género) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (paquetes `JJ_coders_Suna_AI_v1_Q4_K_M.gguf` y `JJ_coders_Suna_AI_v1_3_Q4_K_M.gguf`); safetensors en precisión nativa; adaptadores `.pt` |
| Idiomas soportados | en, ml (malabar), fr, es |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, PyTorch `.pt` |

## Arquitectura y entrenamiento

El modelo se construye sobre un transformer de difusión con flow-matching continuo (`ACE-Step 1.5 XL SFT`) y un VAE estéreo a 48 kHz denominado "Oobleck VAE" en la documentación. El condicionamiento textual y fonético se realiza mediante `Qwen3-Embedding-0.6B`, complementado por un alineador fonético multilingüe (G2P) que marca el ritmo silábico de la letra. Sobre el DiT se aplican 14 expertos LoRA de rango 64, uno por género, y un crítico de 15,8 millones de parámetros (12 bloques ResNet dilatados con squeeze-excitation) que selecciona la mejor candidata entre varias generaciones.

La model card menciona guías melódicas ("Melodic Soul Guides") y perfiles armónicos almacenados en `suna_v1_dna_bank.json` (BPM, tonalidad y matrices armónicas), así como un proceso de mastering mid-side a -14 LUFS. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la innovación de decodificación especulativa ni atención lineal; las mejoras declaradas se centran en el control de tono (rango F0 de 1,8 octavas, coro con belt a +12 semitonos), el bloqueo rítmico desde el segundo 0:00 (99,4 % de "groove lock") y la articulación fonética.

## Capacidades

- Generación de música vocal e instrumental a partir de texto y letras, en estéreo a 48 kHz.
- Síntesis de canto con control melódico (legato, rango F0 de 1,8 octavas) y alineación fonética por sílabas.
- Condicionamiento multilingüe en inglés, malabar, francés y español mediante G2P.
- Selección automática de candidatos mediante el crítico `SunaV1TitanMasterpieceNet`.
- Control de género musical a través de 14 LoRA experts especializados.
- Mastering integrado a -14 LUFS (mid-side).
- Soporte de ejecución local y en edge mediante checkpoints GGUF Q4_K_M.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Producción musical asistida: generar maquetas vocales e instrumentales completas a 48 kHz a partir de una descripción de género y una letra, usando los LoRA experts para fijar el estilo y el crítico para elegir la mejor toma entre varias semillas.
- Localización de canciones: adaptar una misma letra a inglés, francés, español o malabar aprovechando el alineador fonético multilingüe, útil para sellos discográficos que publican en varios mercados.
- Creación de bandas sonoras para vídeo y publicidad: generar pistas instrumentales con bloqueo rítmico desde el inicio (0:00), lo que evita los silencios iniciales típicos de otros pipelines de difusión y simplifica el montaje.
- Herramientas creativas para desarrolladores: integrar el modelo en aplicaciones de escritorio o web mediante los checkpoints GGUF Q4_K_M, reduciendo los requisitos de memoria frente a los pesos safetensors.
- Investigación en síntesis de canto: usar el crítico y los adaptadores `.pt` como banco de pruebas para estudiar selección de candidatos y evaluación automática de calidad musical.
- Generación de contenido para plataformas de audio corto: producir piezas con estribillo y belt controlado (coro a +12 semitonos) para vídeos verticales, con mastering listo para publicación.
- Prototipado rápido en espacios ZeroGPU o Colab: emplear los adaptadores PyTorch unificados (`suna_v1_ultimate_adapter.pt`, `suna_v1_halloween_10b_titan_adapter.pt`, `suna_v2_1_pop_masterpiece_adapter.pt`) para demos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card aporta métricas internas cualitativas (99,4 % de groove lock, rango F0 de 1,8 octavas, -14 LUFS), pero no comparaciones estandarizadas tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo de generación musical. No se dispone de valores de FAD, CLAP score ni MOS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 304 millones de parámetros en safetensors, los pesos en fp16 rondan los 0,6 GB, pero el repo completo ocupa 16,2 GB e incluye el VAE, los LoRA experts y los adaptadores, por lo que el pico real de memoria es mayor.
- GPU recomendadas: el autor publica una demo en A100 (Gradio Studio). Para ejecución local se recomienda al menos una GPU con 16 GB de VRAM; no hay cifras oficiales para H100 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí con los GGUF Q4_K_M en GPUs de 8-12 GB, aunque no se documenta el consumo exacto.
- Opciones de despliegue: `diffusers` (librería declarada), runtime GGUF compatible con llama.cpp/Ollama (formato Q4_K_M), PyTorch con adaptadores `.pt` y Gradio para demos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suna AI v1.0 (`jjcoders/suna-v1`) | 304 M en safetensors (5 B declarados en el backbone) | no disponible | 48 kHz estéreo | MIT | Hugging Face, GGUF, `.pt` |
| ACE-Step 1.5 XL SFT (backbone) | 5 B (según la model card) | no disponible | 48 kHz estéreo (según el autor) | MIT | Hugging Face |
| MusicGen (Meta) | 300 M / 1,5 B / 3,3 B | no disponible | 32 kHz mono | MIT (pesos) | Hugging Face |
| Stable Audio Open | ~1,1 B | no disponible | 44,1 kHz estéreo | Stability AI Community | Hugging Face |

La comparación se limita a datos públicos de cada familia; no se dispone de evaluaciones cruzadas que permitan afirmar superioridad objetiva en calidad musical.

## Limitaciones y advertencias

- Discrepancia entre los 5.000 millones de parámetros declarados para el backbone y los 304 millones de parámetros reales en safetensors: conviene verificar el despliegue antes de dimensionar infraestructura.
- Riesgo de alucinación musical: el modelo puede generar letras ininteligibles, desafinación o estructuras incoherentes, especialmente en idiomas con menos datos (malabar).
- Idiomas limitados a en, ml, fr y es; no hay soporte declarado para otras lenguas.
- Sin datos publicados sobre sesgos de género, estilo o representación cultural en el dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero el backbone ACE-Step y el encoder Qwen3 tienen sus propias licencias (MIT y Apache 2.0) que deben respetarse en la redistribución.
- El pipeline `text-to-audio` de `diffusers` puede requerir adaptaciones específicas para cargar los LoRA experts y el crítico, ya que no es un checkpoint estándar.
- No hay métricas objetivas de calidad (FAD, CLAP, MOS) que permitan validar las afirmaciones de la model card.
- La fecha de creación del repositorio (2026-10-11) y las referencias a "Halloween 2026" deben tratarse con cautela; verificar la vigencia de los enlaces y artefactos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjcoders/suna-v1
- Sitio web oficial: https://suna.jjcoders.com
- Demo Gradio en A100: https://huggingface.co/spaces/johanjomet/suna-ai-studio
- Backbone ACE-Step: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
