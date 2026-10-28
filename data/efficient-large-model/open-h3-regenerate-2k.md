# Efficient-Large-Model/Open-H3-Regenerate-2K

## Resumen

Open-H3-Regenerate-2K es un paquete de pesos para `diffusers` publicado por Efficient-Large-Model (equipo detrás del proyecto Sana/Sol-Engine de NVlabs) que reproduce en abierto la funcionalidad de la API cerrada H3-Regenerate-2K: un pase de refinado de tres pasos sobre MiniMax-H3 que regenera un borrador en 768P (1344×768, 121 fotogramas) a 2560×1440. No es un modelo de lenguaje ni un generador desde cero, sino un adaptador LoRA fusionado más un upsampler latente y un decodificador VAE rápido, empaquetados junto a una copia sin modificar de los componentes base de MiniMax-H3 (revisión `6818f6c`).

El interés técnico está en dos frentes. Por un lado, la receta de fusión: tres adaptadores (refiner Open-H3 step 5000 EMA, LightX2V FL2VA Turbo v1.2 y LMS Sharp v1.0) se concatenan en el eje de rango y se pliegan en un único LoRA FP32 de rango 576 sobre 312 capas lineales, con un error relativo de 2,2e-8 frente a los adaptadores separados. Por otro, la optimización de inferencia: la ruta `sol_engine_fwd` (atención Sol-Attn, MXFP8 y CUDA graphs) más un VAE decodificador no causal de 24 capas y 1,62 mil millones de parámetros reduce un clip de 5 segundos de 87,26 s a 22,45 s en una sola B200, un 3,89× de aceleración.

Es relevante ahora porque ofrece una alternativa abierta y medible a un servicio propietario de reescalado/refinado de vídeo, con el código y los números por módulo publicados. La contrapartida es que el bundle no está cubierto por una licencia única: el LoRA del refinador, el VAE rápido y `base_model/` siguen la MiniMax H3 Community License, mientras que el upsampler latente y los LoRA de terceros fusionados mantienen sus propias licencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión vídeo a vídeo sobre el transformer de MiniMax-H3, con LoRA fusionado (rango 576 en 312 capas lineales), upsampler latente 3D-conv y VAE decodificador no causal de 24 capas |
| Parámetros totales | No disponible para el transformer base (se incluye sin modificar y la model card no da su recuento). El VAE rápido aporta 1,62 mil millones de parámetros; el LoRA se especifica por rango, no por número de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de vídeo; trabaja con 121 fotogramas por clip) |
| Tipos de cuantización | BF16 (componentes base y upsampler latente), FP32 (LoRA fusionado y ramas AdaLN), MXFP8 en la ruta `sol_engine_fwd`. No se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponibles (el pipeline es de vídeo; el codificador de texto proviene de MiniMax-H3 y no se detalla cobertura lingüística) |
| Licencia | `minimax-h3-community` (MiniMax H3 Community License), con componentes de terceros bajo licencias propias |
| Formato de pesos | `safetensors` (estructura `diffusers`) |
| Resolución de entrada | 1344×768 (768P), 121 fotogramas |
| Resolución de salida | 2560×1440 |
| Pasos de muestreo | 3 pasos Euler sobre sigmas [0,909375; 0,857143; 0,666667; 0], CFG 1 |
| Estado inicial | `(1 - 0,909375) * upscaled + 0,909375 * noise`, tiempo de modelo `1 - sigma` |
| Tamaño del repositorio | 164,9 GB |

## Arquitectura y entrenamiento

El pipeline es una cadena de refinado, no un modelo único. Se parte de un borrador latente de MiniMax-H3 a 768P; un upsampler latente 3D-conv (BF16, de autoría externa) eleva la resolución; el transformer de MiniMax-H3, con el LoRA fusionado aplicado, ejecuta tres pasos Euler con CFG 1; y un VAE decodificador no causal de 24 capas, destilado del VAE original de H3 y procedente de StreamRender-H3, convierte el latente en vídeo 2560×1440.

La fusión del LoRA es el punto técnico central. Los tres adaptadores de referencia son el refiner Open-H3 (step 5000 EMA, rango 384, alpha 384), LightX2V FL2VA Turbo v1.2 (rango 128, alpha 8) y LMS Sharp v1.0 (rango 64). Se concatenan los factores en el eje de rango y se pliegan las intensidades (incluida la relación alpha/rango de Turbo) en la matriz `B`, de modo que `B @ A` equivale exactamente a la suma de los tres deltas escalados; la verificación (`MERGE_VERIFY.json`) reporta un error relativo de 2,2e-8 en las 312 capas lineales. Las 50 ramas AdaLN de la curva Sharp reciben una curva de timestep de 8 dimensiones en lugar de la entrada de capa, por lo que se mantienen como módulos separados (`sharp_curve_branches.safetensors`). También se incluye un `adaln_t_table` de 1025×8 derivado del modelo base y leído por rango de bytes desde `Comfy-Org/MiniMax-H3`.

No se documentan en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO; el único dato de entrenamiento es que el refiner corresponde al checkpoint step 5000 con EMA. La innovación declarada es de inferencia: atención Sol-Attn, precisión MXFP8 y CUDA graphs en `sol_engine_fwd`, más el VAE rápido que decodifica el clip 2560×1440 en 1,6 s frente a los 15 s del VAE publicado.

## Capacidades

- Refinado vídeo a vídeo: convierte un borrador MiniMax-H3 de 1344×768 y 121 fotogramas en un clip de 2560×1440.
- Re escalado latente: el upsampler 3D-conv opera en el espacio latente antes del refinado, no sobre píxeles.
- Refinado en tres pasos con CFG 1, lo que reduce el coste frente a muestreos largos con guiado por clasificador.
- Decodificación rápida opcional mediante un VAE no causal de 24 capas destilado del VAE de H3 (1,6 s por clip 2560×1440 en B200).
- Ejecución acelerada con Sol-Attn, MXFP8 y CUDA graphs en la ruta `sol_engine_fwd` (2,33× solo en el forward; 3,89× con el VAE rápido).
- Compatibilidad con el ecosistema `diffusers` y con componentes del ecosistema ComfyUI (upsampler latente, LoRA Turbo y Sharp, tabla AdaLN).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi paso.
- No ofrece capacidades multilingües de chat ni generación de texto.
- No incorpora modo thinking, audio ni entrada de imagen adicional más allá del vídeo de partida.

## Casos de uso

- Re masterización de borradores generados: generar clips baratos a 768P con MiniMax-H3 y aplicar este pase de tres pasos solo a las tomas aprobadas, reduciendo el cómputo de generación frente a producir directamente en 1440p.
- Sustitución interna de la API cerrada H3-Regenerate-2K: el bundle replica la misma operación (borrador 1344×768 de 121 fotogramas a 2560×1440) y puede desplegarse en infraestructura propia con el código de Sol-Engine.
- Postproducción en flujos ComfyUI: el upsampler latente, los LoRA Turbo y Sharp y la tabla AdaLN provienen de nodos y repositorios de ese ecosistema, de modo que el refinado se puede insertar como etapa final de un grafo existente.
- Previz y VFX de clips cortos: con 5 segundos y 121 fotogramas por pasada, encaja en la generación de planos de prueba que luego se revisan a resolución final.
- Servicio de re escalado por lotes: al usar 3 pasos Euler y CFG 1, el coste por clip es acotado y predecible; con el VAE rápido el total medido en B200 es de 22,45 s por clip de 5 s.
- Investigación en inferencia eficiente: la separación entre `standard_fwd` y `sol_engine_fwd`, con números por módulo en el README del código, permite reproducir y comparar técnicas de atención y precisión reducida sobre un caso real de vídeo.
- Evaluación de recetas de fusión de LoRA: el bundle incluye configuración, hashes, rangos por módulo y verificación de fusión, lo que sirve como referencia para estudiar la concatenación en el eje de rango de adaptadores con escalas distintas.

## Benchmarks y rendimiento

La model card solo publica medidas de latencia, no métricas de calidad (FVD, PSNR, SSIM u otras). Mediciones sobre un clip de 5 s, latente 768P a vídeo 2560×1440, en caliente, mediana de 3 ejecuciones, una NVIDIA B200:

| Forward | Decodificador VAE | Total | Aceleración |
|---|---|---:|---:|
| `standard_fwd` (atención densa, BF16) | VAE de H3 publicado | 87,26 s | 1,00× |
| `sol_engine_fwd` (Sol-Attn, MXFP8, CUDA graphs) | VAE de H3 publicado | 37,39 s | 2,33× |
| `sol_engine_fwd` (Sol-Attn, MXFP8, CUDA graphs) | VAE rápido de H3 | 22,45 s | 3,89× |

Desglose adicional aportado: el upsampler latente más el refinado pasan de 73,11 s a 20,46 s (3,57×), y el VAE rápido decodifica el clip 2560×1440 en 1,6 s frente a 15 s del VAE publicado. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. La model card no publica consumo de memoria para ninguna configuración.
- GPU recomendadas: la única referencia medida es una NVIDIA B200, en la que se obtienen los 22,45 s por clip. No hay datos para A100, H100, L40S ni RTX 4090.
- GPU de consumo: no se puede confirmar que quepa en tarjetas de consumo; el pipeline mantiene latentes de 121 fotogramas a 2560×1440 y el repositorio ocupa 164,9 GB en disco, pero no se documenta el pico de VRAM.
- Opciones de despliegue: `diffusers` con los componentes de `base_model/`; código de referencia en el repositorio `NVlabs/Sana` (rama `sol-engine`, carpeta `models/Open-H3-Regenerate-2K`); integración con nodos de ComfyUI para el upsampler latente y los LoRA de origen. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: 22,45 s por clip de 5 s en B200 con la ruta acelerada y VAE rápido; 87,26 s con forward estándar y VAE publicado. El throughput agregado no se documenta.
- Descarga: `download.py` del repositorio de código obtiene todos los archivos, además del adaptador opcional HyperFlow de 8 pasos y la tabla `adaln_t_table` de Sharp.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-H3-Regenerate-2K | Refinado vídeo a vídeo 768P → 2560×1440, 3 pasos | No disponible el transformer base; VAE rápido de 1,62 mil millones | No aplica (121 fotogramas) | MiniMax H3 Community + licencias de terceros | Pesos abiertos en HuggingFace, 0 descargas y 22 likes en el momento de la consulta |
| H3-Regenerate-2K (API cerrada) | Misma tarea, servicio propietario | No disponible | No disponible | Propietaria | Solo vía API; sin pesos |
| MiniMax-H3 (modelo base) | Generación vídeo/audio desde texto y referencia | No disponible en la información proporcionada | No disponible | MiniMax H3 Community | Pesos abiertos, revisión `6818f6c` |
| StreamRender-H3 | VAE decodificador rápido no causal de 24 capas | 1,62 mil millones (el decodificador) | No aplica | MiniMax H3 Community | Componente liberado dentro del proyecto Sol-Engine |

La comparación cuantitativa de calidad frente a la API cerrada o frente a generar directamente en alta resolución no está disponible: no se publican métricas de fidelidad ni comparaciones perceptuales.

## Limitaciones y advertencias

- Licencia no unificada: el LoRA del refinador, el VAE rápido y `base_model/` siguen la MiniMax H3 Community License, con sus términos de territorio, uso y redistribución; el upsampler latente, LightX2V FL2VA Turbo y LMS Sharp mantienen licencias propias. El bundle no está cubierto por una licencia global y la licencia del código de ejecución no sustituye a las de los modelos.
- Restricciones territoriales y de uso comercial derivadas de la MiniMax H3 Community License: hay que revisar el texto enlazado antes de cualquier despliegue en producción.
- Configuración de muestreo fija: 3 pasos Euler, sigmas concretas y CFG 1 dejan poco margen de ajuste; no se documenta comportamiento con otros valores.
- Resolución y duración fijas en la práctica: el pipeline está descrito para 1344×768 de entrada, 121 fotogramas y 2560×1440 de salida, sin datos sobre otras combinaciones.
- Ausencia de métricas de calidad: no se publican FVD, PSNR ni SSIM, por lo que el riesgo de artefactos o de deriva respecto al borrador original no está cuantificado.
- Dependencia de tensores derivados: el `adaln_t_table` se lee por rango de bytes desde `Comfy-Org/MiniMax-H3`, lo que introduce un paso frágil para la reproducibilidad si ese repositorio cambia.
- Riesgo de alucinación y sesgos: no hay información disponible sobre sesgos del modelo base ni sobre cómo el refinado afecta al contenido semántico del clip.
- Validación comunitaria escasa: 0 descargas y 22 likes en el momento de la consulta, con un repositorio de 164,9 GB, lo que limita la evidencia independiente sobre su comportamiento.
- Requisitos de infraestructura altos: las únicas medidas publicadas son sobre B200; no hay guía de VRAM para GPUs más modestas.
- No es un modelo de lenguaje: no admite tool calling, agentes, chat multilingüe ni razonamiento textual, pese a que el nombre del autor pueda sugerir un modelo de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K
- Página del proyecto: https://nvlabs.github.io/Sana/Open-H3-Regenerate-2K/
- Código (Sol-Engine, carpeta del modelo): https://github.com/NVlabs/Sana/tree/sol-engine/models/Open-H3-Regenerate-2K
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Revisión exacta del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/6818f6c32d12b210915e44ad56a4228c2608f160
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/6818f6c32d12b210915e44ad56a4228c2608f160/LICENSE
- VAE rápido StreamRender-H3: https://nvlabs.github.io/Sana/Sol-Engine/StreamRender-H3/
- Upsampler latente (comunidad): https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- LightX2V FL2VA Turbo v1.2: https://huggingface.co/lightx2v/Minimax-h3-Turbo/tree/3ec17a324ced54151364f24f8b5fb6bf7e26414f
- LMS Sharp v1.0: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/blob/main/loras/minimax_h3_lms_v1.0_r64.safetensors
- Repositorio Comfy-Org MiniMax-H3 (origen de `adaln_t_table`): https://huggingface.co/Comfy-Org/MiniMax-H3
- Nota sobre la búsqueda web: los resultados devueltos fueron definiciones del término francés «efficient» y no aportaron información técnica sobre el modelo.
