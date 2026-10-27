# Sensen02/Open-H3-Regenerate-2K

## Resumen

Open-H3-Regenerate-2K es un adaptador LoRA de refinado (video-a-video) para el modelo de generación de vídeo MiniMax-H3, publicado por el usuario Sensen02 y pensado como reemplazo abierto de la API cerrada H3-Regenerate-2K. Su función es concreta: toma un borrador de MiniMax-H3 a 768P (1344×768, 121 fotogramas) y lo regenera a 2560×1440 mediante un paso de sobremuestreo latente y tres pasos de refinado, sin rehacer la generación desde cero. No es un modelo de lenguaje ni un modelo generativo autónomo: es un conjunto de pesos y componentes que se cargan sobre el transformer de MiniMax-H3 dentro de un pipeline `video-to-video` de la librería diffusers.

El paquete incluye tres cosas: el LoRA fusionado (`open_h3_regenerate_2k_lora.safetensors`, FP32, rango 576 sobre 312 capas lineales), las 50 ramas AdaLN de curva "Sharp" en un fichero aparte, y un upscaler latente 3D-conv en BF16 bajo licencia MIT. Además, el repositorio replica sin modificaciones los componentes de MiniMax-H3 (transformer, VAE, VAE de audio, codificador de texto, tokenizer, procesador y schedulers) en la revisión `6818f6c`, de modo que el conjunto es autocontenido aunque pesa 158,4 GB.

Su relevancia ahora es doble. Por un lado, reproduce con pesos abiertos un refinado que hasta hace poco solo existía como API propietaria, con verificación numérica de la fusión de adaptadores (error relativo de 2,2e-8 frente a los tres adaptadores aplicados por separado). Por otro, incorpora el motor Sol-Engine con atención Sol-Attn1, MXFP8 y CUDA graphs, que reduce el tiempo de un clip de 5 s de 73,11 s a 20,46 s en una B200 (aceleración de 3,57×). El principal freno es la licencia: la MiniMax-H3 Community License excluye expresamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) sobre MiniMax-H3, con VAE de vídeo y VAE de audio; refinado video-a-video mediante LoRA fusionado |
| Parámetros totales | no disponible (el autor no publica el recuento del modelo base) |
| Parámetros activos | no aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | no aplica (modelo de difusión). Ventana de vídeo: 121 fotogramas; borrador de entrada 1344×768; salida 2560×1440 |
| Tipos de cuantización | LoRA en FP32; upscaler latente en BF16; modelo base en BF16; inferencia con MXFP8 en el kernel Sol-Attn1; no se distribuyen GGUF ni INT4 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (excluye territorialmente UE, Reino Unido, Corea del Sur y EE. UU.); upscaler latente MIT; fuentes LightX2V Turbo y LMS Sharp declaradas Apache-2.0 |
| Formato de pesos | safetensors (estructura diffusers) |
| Pasos de muestreo | 3 pasos Euler sobre sigmas [0.909375, 0.857143, 0.666667, 0] |
| CFG | 1 (sin escala de guiado) |
| Estado inicial | `(1 - 0.909375) * upscaled + 0.909375 * noise`, tiempo de modelo `1 - sigma` |
| Rango del LoRA | 576 en 312 capas lineales (fusión de 384 + 128 + 64), escala 1 |
| Ramas de curva separadas | 50 ramas AdaLN LMS Sharp en FP32, alimentadas con una curva de timestep de 8 dimensiones |
| Tamaño del repositorio | 158,4 GB |
| Descargas / likes | 0 / 1 |
| Fecha de publicación | 26 de octubre de 2026 |

## Arquitectura y entrenamiento

La pieza central es el transformer de difusión de MiniMax-H3, que se distribuye sin cambios en `base_model/` (revisión `6818f6c`, excluyendo las carpetas nativas `FL2VA/`, `Ref2VA/` y `transformer_ref/`). Sobre él se aplica un refinado en espacio latente: un upscaler 3D-conv de autor eleva el latente del borrador 768P y, a continuación, tres pasos Euler con CFG 1 regeneran el detalle a 2560×1440. El ruido inicial no es puro: se mezcla el latente sobremuestreado con ruido según el primer sigma (0,909375), lo que conserva la estructura del borrador y limita el refinado a la textura y el detalle fino.

El LoRA no se entrenó como un adaptador único, sino que es la fusión exacta de tres adaptadores con sus intensidades plegadas en la matriz `B`: el refinador Open-H3 (checkpoint 5000 EMA, rango 384, alpha 384, fuerza 0,7), LightX2V FL2VA Turbo v1.2 (rango 128, alpha 8, fuerza 1,0) y LMS Sharp v1.0 (rango 64, fuerza 1,0). La concatenación de factores a lo largo del eje de rango hace que `B @ A` sea igual a la suma de los tres deltas escalados, con un error relativo de 2,2e-8 sobre las 312 capas lineales, según `MERGE_VERIFY.json`. Las ramas de curva de Sharp se mantienen como módulos separados porque no consumen la entrada de la capa, sino una curva de timestep de 8 dimensiones.

La innovación de despliegue es Sol-Engine: sustituye la atención densa en BF16 por Sol-Attn1 con precisión MXFP8 y captura con CUDA graphs. En una B200, un clip de 5 s (latente 768P a 2560×1440) pasa de 73,11 s a 20,46 s en medición en caliente y mediana de 3 ejecuciones. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Refinado y sobremuestreo de vídeo generado: convierte un borrador MiniMax-H3 de 1344×768 y 121 fotogramas en una salida de 2560×1440 en tres pasos.
- Conservación de la composición original: al inicializar con una mezcla del latente sobremuestreado y ruido, mantiene el encuadre y el movimiento del borrador en lugar de regenerar la escena.
- Refinado de detalle y textura: el adaptador Open-H3 aporta el modelado fino; la componente Sharp actúa sobre la curva de timestep para controlar nitidez.
- Aceleración por destilación: la inclusión de LightX2V FL2VA Turbo v1.2 permite resolver el refinado en 3 pasos con CFG 1.
- Procesamiento de audio en el pipeline: el repositorio incluye un VAE de audio entre los componentes del modelo base, aunque la model card no detalla su uso en este flujo de refinado.
- Ejecución optimizada con Sol-Engine: atención Sol-Attn1, MXFP8 y CUDA graphs para reducir latencia en hardware Blackwell.
- Compatibilidad con diffusers: pipeline declarado `video-to-video`, con tokenizer y procesador incluidos.
- No documentado en la información disponible: tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, soporte multilingüe explícito o control por prompt negativo (el CFG es 1).

## Casos de uso

- Acabado de vídeo generado por IA en producción: el flujo natural es generar un borrador rápido a 768P con MiniMax-H3 y pasarlo por este LoRA para entregar 2560×1440, con un coste de 20,46 s por clip de 5 s en una B200. El ahorro viene de no generar directamente a resolución final.
- Remasterización de un catálogo existente de clips 768P: cualquier lote de vídeos ya producidos a 1344×768 puede reprocesarse por lotes sin volver a muestrear desde texto, lo que preserva la identidad visual de cada pieza.
- Previsualización rápida en publicidad: iterar el concepto a 768P con el modelo base y aplicar el refinado solo a las versiones aprobadas, manteniendo el pipeline de aprobación con un único paso adicional.
- Vídeo de producto para comercio electrónico: clips cortos de 5 s a 1440p con encuadre fijo, donde la conservación de la estructura del borrador evita que el refinado altere el producto.
- Investigación sobre atención eficiente: el par `standard_fwd` / `sol_engine_fwd` sirve como banco de pruebas reproducible para medir Sol-Attn1 y MXFP8 frente a atención densa en BF16 sobre el mismo modelo.
- Integración en herramientas de nodos: el ecosistema ComfyUI ya publica tensores derivados de MiniMax-H3 (`Comfy-Org/MiniMax-H3`), y el script `download.py` del proyecto recupera el `adaln_t_table` de 1025×8 necesario para las ramas Sharp.
- Postproducción de VFX y previz: refinado de previzualizaciones a resolución de entrega sin rehacer el render, útil cuando el plano ya está validado en bloque.

## Benchmarks y rendimiento

El autor solo publica mediciones de latencia en una NVIDIA B200, con un clip de 5 s (latente 768P a 2560×1440), ejecución en caliente y mediana de 3 ejecuciones:

| Forward | Tiempo total | Aceleración |
|---|---:|---:|
| `standard_fwd` (atención densa, BF16) | 73,11 s | 1,00× |
| `sol_engine_fwd` (Sol-Attn1, MXFP8, CUDA graphs) | 20,46 s | 3,57× |

| Métrica de calidad de la fusión | Valor |
|---|---|
| Error relativo del LoRA fusionado frente a los tres adaptadores separados | 2,2e-8 |
| Capas lineales verificadas | 312 |

No se han publicado resultados de benchmarks de calidad de vídeo (FVD, VBench, CLIP score u otros) en la información disponible. Tampoco hay comparación numérica con la API cerrada H3-Regenerate-2K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica consumo de memoria; el repositorio completo ocupa 158,4 GB e incluye el modelo base en BF16, el LoRA en FP32 y el upscaler en BF16.
- GPU validada: NVIDIA B200, única hardware sobre la que se publican tiempos (73,11 s en BF16 denso, 20,46 s con Sol-Engine).
- GPU consumer: estimación a partir del tamaño del repositorio, el pipeline completo en BF16 no cabe en tarjetas de 24 GB (RTX 4090) ni de 32 GB; se requeriría cuantización adicional o descarga selectiva de componentes, no documentada por el autor.
- Opciones de despliegue: diffusers (pipeline `video-to-video`), el código de Sol-Engine en el repositorio `NVlabs/Sana` (rama `sol-engine`), y ecosistema ComfyUI para los tensores derivados. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia: 20,46 s por clip de 5 s en B200 con Sol-Engine, equivalente a aproximadamente 0,05 clips por segundo en ese hardware.
- Throughput agregado, uso de memoria por componente y comportamiento en A100/H100: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Resolución de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-H3-Regenerate-2K | LoRA de refinado sobre MiniMax-H3 | 3 | 2560×1440 (121 fotogramas) | MiniMax-H3 Community (excluye UE, UK, Corea del Sur y EE. UU.) | Pesos abiertos en HuggingFace, 158,4 GB |
| H3-Regenerate-2K (API cerrada) | Servicio propietario de refinado | no disponible | 2560×1440 según la referencia del autor | no disponible | Solo API |
| MiniMax-H3 (modelo base) | Modelo generativo de vídeo | no disponible | borrador 768P (1344×768) en el flujo descrito | MiniMax-H3 Community License | Pesos abiertos, revisión `6818f6c` |
| HyperFlow 8-step adapter | Adaptador opcional del ecosistema | 8 | no disponible | no disponible | Descargable mediante `download.py` |

Frente a la API cerrada, la ventaja es la reproducibilidad y la ausencia de dependencia de servicio; la desventaja, un requisito de hardware explícito (B200 para las cifras publicadas) y un repositorio de 158,4 GB. Frente a HyperFlow de 8 pasos, este LoRA apuesta por 3 pasos con CFG 1, es decir, menos pasos pero también menos control fino del resultado.

## Limitaciones y advertencias

- Restricción territorial grave: la MiniMax-H3 Community License Agreement excluye la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos. Un desarrollador o empresa establecido en España queda fuera del ámbito许可, por lo que no puede usar estos pesos en producción sin revisión legal previa.
- Licencia del modelo base, no del adaptador: el LoRA se distribuye como "Model Derivative" de MiniMax-H3 y hereda sus términos y su Política de Uso Aceptable, aunque las fuentes LightX2V Turbo y LMS Sharp declaren Apache-2.0 y el upscaler sea MIT.
- Validación comunitaria prácticamente nula: 0 descargas y 1 like en el momento de la consulta, con publicación y actualización el mismo día. No hay evidencia de uso independiente.
- Sin datos de calidad: no hay FVD, VBench ni comparaciones subjetivas publicadas; el único dato objetivo es la latencia y la verificación numérica de la fusión.
- Rigidez del muestreo: 3 pasos Euler con sigmas fijas y CFG 1 implican que no hay guiado negativo ni ajuste de adherencia al prompt; el margen de control creativo es mínimo y cualquier cambio requiere alterar el schedule.
- Riesgo de artefactos en el sobremuestreo: el refinado latente de 768P a 2560×1440 puede introducir texturas sintéticas, flicker temporal o pérdida de detalle fino en caras y texto pequeño. Es un riesgo propio de la técnica, no documentado por el autor.
- Repositorio de 158,4 GB: el despliegue exige descarga selectiva o almacenamiento dedicado; el propio autor separa `base_model/` del LoRA, pero no ofrece instrucciones de carga parcial más allá de `download.py`.
- Idiomas y prompts: no se documenta qué idiomas admite el codificador de texto ni si el refinado responde a instrucciones textuales, lo que impide planificar su uso en flujos multilingües.
- Dependencia de hardware Blackwell para las cifras publicadas: sin B200, el rendimiento de Sol-Attn1 y MXFP8 no está cuantificado, y la ruta BF16 densa triplica el tiempo por clip.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sensen02/Open-H3-Regenerate-2K
- Página del proyecto: https://nvlabs.github.io/Sana/Open-H3-Regenerate-2K/
- Código (Sol-Engine): https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/Open-H3-Regenerate-2K
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Revisión concreta del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/6818f6c32d12b210915e44ad56a4228c2608f160
- Licencia MiniMax-H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Tensores derivados para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
