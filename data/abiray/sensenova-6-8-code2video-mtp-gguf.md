# Abiray/SenseNova-6.8-Code2Video-MTP-GGUF

## Resumen

SenseNova-6.8-Code2Video es un modelo multimodal (imagen-texto a texto) desarrollado por SenseNova, del cual Abiray ha publicado una colección de cuantizaciones GGUF en Hugging Face. Se trata de un modelo de 27.320.697.856 parámetros (27B) basado en una arquitectura híbrida etiquetada como `qwen35`, que combina mecanismos de atención con capas Gated DeltaNet (tipo SSM). Su especialidad es la generación de código para producción de vídeo programático ("code2video"): scripts en Python para síntesis de audio, código Remotion/React para tipografía cinética, animaciones Manim de geometría diferencial y shaders GLSL personalizados para Three.js.

La relevancia de esta versión GGUF radica en tres aportes del cuantizador: un cabezal Multi-Token Prediction (MTP) incrustado en `blk.64` para decodificación especulativa, protegido a Q8_0; la protección explícita de los tensores híbridos Gated DeltaNet (`ssm_*`) y de las puertas de atención (`attn_gate`) frente a la degradación por cuantización; y una calibración imatrix con datos mult dominio bilingües (inglés/chino) 100% únicos. Incluye además un proyector de visión en F16 (`mmproj-F16.gguf`) que habilita el análisis de fotogramas renderizados, útil para flujos de trabajo agénticos como Claude Code.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida `qwen35` (atención + Gated DeltaNet tipo SSM), multimodal con proyector de visión |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible (arquitectura híbrida, no confirmado como MoE) |
| Longitud de contexto | no disponible (los ejemplos del repo usan 32768 y 65536 tokens) |
| Tipos de cuantizacion | IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con imatrix salvo Q8_0); mmproj en F16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `qwen35` en una configuración híbrida que alterna capas de atención estándar con capas Gated DeltaNet (`ssm_*`), una variante de atención lineal tipo SSM que reduce el coste de memoria del KV-cache en contextos largos. El repositorio GGUF incorpora además un cabezal Multi-Token Prediction de una capa (etiquetado como `blk.64` / NextN) que permite decodificación especulativa nativa en llama.cpp, aumentando el throughput de generación sin pérdida de calidad.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se han publicado detalles en la información disponible. En cuanto al proceso de cuantización, el autor utilizó matrices de importancia (imatrix) calibradas sobre 20 fragmentos de contexto 512 con datos mult dominio no repetidos: trayectorias de tool-calling de agentes Claude Code bilingües, código Remotion/React TypeScript, síntesis de audio procedural en Python (FM, Karplus-Strong, reverberación Schroeder, filtergraphs de FFmpeg) y geometría diferencial 3D en Manim junto a shaders GLSL. Los tensores sensibles (152 en Q8_0, 50 en Q6_K y 360 en F32 por archivo) se mantienen en precisiones altas para proteger las puertas DeltaNet y de atención.

## Capacidades

- Generación de código orientada a vídeo programático: Remotion/React TypeScript para tipografía cinética y visualización de datos, Manim para animaciones matemáticas 3D, y shaders GLSL personalizados para Three.js.
- Síntesis de audio procedural en Python con numpy/scipy (síntesis FM, cuerdas Karplus-Strong, reverberación estéreo Schroeder) y filtergraphs de FFmpeg.
- Comprensión multimodal imagen-texto: análisis de fotogramas renderizados para detectar solapamientos tipográficos, problemas de contraste o recortes de maquetación, con propuestas de corrección concretas (CSS/Canvas), mediante el archivo `mmproj-F16.gguf`.
- Decodificación especulativa mediante el cabezal MTP incrustado, compatible con llama.cpp.
- Soporte de tool calling: el imatrix se calibró específicamente con trayectorias de agentes (Claude Code), y el modelo puede servirse vía `llama-server` con plantilla Jinja para integrarse en harnesses agénticos compatibles con la API de OpenAI.
- Capacidades bilingües en inglés y chino.
- Generación de texto conversacional general (pipeline `image-text-to-text`, etiqueta `conversational`).

## Casos de uso

- Generación de animaciones técnicas con Manim: el modelo escribe scripts Manim completos para visualizar geometría diferencial 3D, adecuado para creadores de contenido educativo de matemáticas y física que automatizan la producción de vídeos.
- Producción de tipografía cinética en Remotion: genera componentes React TypeScript multi-escena para vídeos de datos y motion graphics, integrable en pipelines de renderizado headless de Remotion.
- Síntesis de bandas sonoras procedurales: produce scripts Python con numpy/scipy que generan acordes Karplus-Strong, campanas FM o reverberación estéreo, y los exportan a WAV mediante FFmpeg, útil para audio generativo en vídeos.
- Crítica automatizada de fotogramas (keyframe critique): con el proyector de visión, analiza fotogramas renderizados para detectar solapamientos de texto, problemas de contraste o recortes, y propone el fix exacto en CSS/Canvas; encaja en bucles agénticos de render-crítica-corrección.
- Agentes de código bilingües (Claude Code y similares): servido con `llama-server --jinja` en el puerto 8080 como endpoint compatible con OpenAI, puede actuar como motor local de un agente de programación con tool calling, en inglés y chino.
- Shaders GLSL personalizados para Three.js: generación y depuración de shaders para escenas web 3D interactivas.
- Desarrollo local privado: al ejecutarse íntegramente en GPU de consumo (16-24 GB VRAM), permite flujos de code2video sin enviar código propietario a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica perplejidad verificada a 4 chunks (contexto 512) de las cuantizaciones:

| Cuantizacion | PPL (c=512) | Desviacion respecto a Q8_0 |
|---|---|---|
| Q8_0 (referencia) | 4.2491 ± 0.300 | baseline |
| IQ4_XS | 4.2311 ± 0.298 | iguala Q8_0 |
| Q4_K_M | 4.2709 ± 0.302 | +0.51% |
| IQ3_M | 4.3738 ± 0.305 | +2.93% |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + contexto + mmproj de 928 MB):
  - IQ3_M (15,1 GB): cabe en 16 GB de VRAM junto al mmproj.
  - Q3_K_M (15,8 GB): 16 GB de VRAM.
  - IQ4_XS (17,2 GB): 16-20 GB de VRAM (con offload parcial en 16 GB).
  - Q4_K_S (17,5 GB) y Q4_K_M (18,5 GB): 20-24 GB de VRAM.
  - Q5_K_M (20,6 GB) y Q6_K (22,9 GB): 24-32 GB de VRAM.
  - Q8_0 (29,0 GB): 32 GB o más de VRAM/RAM unificada.
- GPU recomendadas: RTX 4080, 4070 Ti Super o 5070 Ti (16 GB) para IQ3_M/IQ4_XS; RTX 3090, 4090 o 5090 (24 GB) para Q4_K_M/Q5_K_M con offload completo y contexto largo; estaciones de trabajo con 32 GB+ de memoria unificada para Q6_K/Q8_0.
- Sí cabe en GPU de consumo: el punto dulce es Q4_K_M en una RTX 3090/4090 con offload completo (`-ngl 99`); en 16 GB es viable IQ3_M con visión.
- Opciones de despliegue: llama.cpp (obligatorio estar actualizado para soportar la arquitectura `qwen35`), con `llama-cli` (texto/código), `llama-mtmd-cli` (visión multimodal) y `llama-server` (API compatible con OpenAI con `--jinja`). La compatibilidad con Ollama, vLLM o TGI no está documentada en la información disponible.
- Latencia y throughput: no disponible; el cabezal MTP sugiere aceleración por decodificación especulativa, pero no se publican cifras de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| SenseNova-6.8-Code2Video (este repo) | 27B | Hibrida qwen35 (atencion + DeltaNet), multimodal, MTP | no disponible (ejemplos hasta 65536) | Apache 2.0 | Si (oficial de terceros, con mmproj) |
| Qwen2.5-Coder-32B-Instruct | 32B | Transformer denso | 131072 | Apache 2.0 | Si (amplia variedad) |
| QwQ-32B | 32B | Transformer denso, razonamiento | 131072 | Apache 2.0 | Si |
| GLM-4.5V / similares multimodales de ~30B | no disponible | Transformer + vision | no disponible | varia | varia |

Frente a Qwen2.5-Coder-32B, SenseNova-6.8-Code2Video es más pequeño (27B), ofrece visión nativa y un cabezal MTP para decodificación especulativa, y su arquitectura híbrida DeltaNet reduce el coste de memoria en contextos largos; a cambio, su ecosistema de despliegue es más limitado (requiere llama.cpp actualizado) y no publica benchmarks estándar. Frente a QwQ-32B, está orientado a generación de código para vídeo y crítica multimodal en lugar de razonamiento general.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se han documentado evaluaciones de sesgo para este modelo.
- Riesgo de alucinación: al tratarse de un LLM generador de código, puede producir scripts con APIs inexistentes o parámetros incorrectos (por ejemplo en FFmpeg o GLSL); el código generado debe verificarse siempre antes de ejecutarse en producción.
- Limitaciones de contexto: la longitud máxima de contexto no está publicada; los ejemplos del repo usan 32768 y 65536 tokens, pero conviene verificar el límite real con la versión de llama.cpp empleada.
- Limitaciones de idioma: soporte documentado solo para inglés y chino; otros idiomas no están garantizados.
- Restricciones de licencia: Apache 2.0, sin restricciones relevantes para uso comercial.
- Caveats técnicos: requiere una build reciente de llama.cpp con soporte de la arquitectura `qwen35` y `llama-mtmd-cli`; la cuantización es de un tercero (Abiray), no oficial de SenseNova, por lo que la calidad depende del proceso de imatrix del cuantizador; las cuantizaciones de 3 bits (IQ3_M, Q3_K_M) muestran degradación medible de perplejidad (+2,93% en IQ3_M); el visionado requiere cargar siempre el archivo `mmproj-F16.gguf` adicional (928 MB).

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/Abiray/SenseNova-6.8-Code2Video-MTP-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Paper, blog oficial, demo y repositorio de código del modelo base: no disponible (no se han encontrado enlaces adicionales en la información proporcionada)
