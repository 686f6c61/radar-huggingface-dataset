# makotolabs/SHINJUTSU-H3-Control-LoRA

## Resumen

SHINJUTSU-H3-Control-LoRA es un archivo de residuos SVD truncados de bajo rango (33,34 MiB) que reconstruye el ControlNet Union 2.0 de MiniMax-H3 (12,92 GB) para su uso en ComfyUI dentro del ecosistema SHINJUTSU-UI. Lo desarrolla makotolabs y no es un LoRA convencional ni un checkpoint autónomo de `ModelPatchLoader`: es un archivo factorizado en rango que codifica la diferencia $\Delta W = W_{\text{control}} - W_{\text{base}}$ entre el ControlNet de referencia y el UNet base de MiniMax-H3, y requiere un paso de reconstrucción previo a la inferencia.

El modelo base es MiniMax-H3, un DiT (diffusion transformer) de generación de vídeo condicionado por imagen y texto, con pipeline `image-text-to-video`. Este adaptador aporta control espacial (vídeo a vídeo, mapas de control) sobre ese DiT sin necesidad de cargar el ControlNet completo de 12,92 GB, lo que reduce el coste de almacenamiento un 99,73 % y el de memoria en el momento de la carga. Es relevante para quienes despliegan pipelines de vídeo en GPUs de consumo o entornos con VRAM limitada, ya que el parche reconstruido ocupa 4,12 GiB en INT8 frente a los 12,92 GB del original.

La ficha se basa exclusivamente en la model card del autor; no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), que no aplican a un modelo generativo de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residuos SVD truncados de bajo rango sobre un DiT de difusión (MiniMax-H3); 10 bloques de inyección con proyecciones `before_proj`/`after_proj` |
| Parametros totales | No disponible (archivo de 185 tensores FP16, 34.961.624 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; no aplica ventana de texto) |
| Tipos de cuantizacion | FP16 en el archivo; el parche reconstruido se genera en INT8 o BF16 según el UNet base instalado (int8_tensorwise, w6a8_int8, float8_e4m3fn) |
| Idiomas soportados | No disponibles |
| Licencia | minimax-h3-community-license-agreement (enlazada en el repo base) |
| Formato de pesos | safetensors (FP16, SVD truncado, 185 tensores) |

## Arquitectura y entrenamiento

El archivo no contiene pesos entrenados de un modelo nuevo, sino una descomposición matemática del ControlNet `alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0`. El autor mide la norma de Frobenius relativa $\|\Delta W\|_F / \|W_{\text{control}}\|_F$ entre los pesos del ControlNet y los bloques correspondientes del UNet base de MiniMax-H3 (`blocks.0, 5, 10, 15, 20, 25, 30, 35, 40, 45`) y obtiene una diferencia de solo 2,47 %–3,32 %, lo que justifica representar el residuo con rango bajo.

La factorización conserva los 10 bloques de inyección (`control_blocks.0..9`) y aplica SVD truncado con rango 64 a `before_proj` (bloque 0) y `after_proj` (los 10 bloques), y rango 4 al residuo $\Delta W$ de cada bloque. `control_proj_in` (5376×196) y los vectores LayerNorm y bias se guardan en FP16 exacto. El autor documenta que podar los bloques 2 a 9 introduce un artefacto de rejilla de 32×32 píxeles por residuos no cancelados en los límites de los parches latentes 2×2, de ahí que se mantengan los 10 bloques. No se describe entrenamiento con RLHF/DPO ni composición de dataset, porque no lo hay: es una compresión post-hoc de un ControlNet existente.

## Capacidades

- Control espacial de generación de vídeo: inyección de mapas de control (vídeo a vídeo, imagen-texto a vídeo) sobre el DiT MiniMax-H3.
- Reconstrucción de un parche de ControlNet completo a partir de 33,34 MiB, con compatibilidad con UNets base en int8_tensorwise, w6a8_int8 y float8_e4m3fn.
- Soporte de dos formatos de proyección AdaLN: 2688 dimensiones completas y 8 dimensiones (`adaln_basis`).
- Integración con ComfyUI mediante el nodo `ShinjutsuSVDControlLoRALoader` o la función `ensure_reconstructed_control_patch`.
- Generación de vídeo de hasta 192 fotogramas en las pruebas del autor.
- No soporta tool calling, agentes ni razonamiento multi-turno: es un componente de un pipeline de difusión, no un LLM.

## Casos de uso

- Control de movimiento en vídeo generativo: se carga el parche reconstruido junto al UNet base y se alimenta con un vídeo de referencia para transferir la estructura de movimiento a una nueva generación, útil en previsualización de animación.
- Edición de vídeo con máscaras de control: el ControlNet Union permite condicionar por profundidad, pose o bordes; el adaptador reduce el espacio en disco de 12,92 GB a 33,34 MiB, lo que facilita versionar varios adaptadores en un mismo repositorio.
- Despliegue en GPUs de consumo: con el UNet pruned_w6a8 (13,87 GiB) y el parche INT8 de 4,12 GiB, el autor reporta un render de 192 fotogramas en 187,7 s con 19,55 GB de VRAM pico, viable en una RTX 4090 de 24 GB.
- Pipelines de producción en ComfyUI: la reconstrucción tarda 2,4–2,8 s en una RTX PRO 6000 y 23,8 s en una RTX 4060 Ti en BF16, por lo que puede hacerse en el arranque del nodo y cachear el parche resultante.
- Investigación en compresión de modelos: el método (SVD truncado sobre el residuo respecto al base) es reutilizable para otros ControlNets acoplados a DiTs con pesos próximos, y el autor publica las métricas de reconstrucción (PSNR medio de 19,45 dB frente al ControlNet completo).
- Automatización de vídeo publicitario o de stock: generación por lotes con control de composición fija y bajo coste de almacenamiento por variante de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de reconstrucción y render:

| Metrica | Valor |
|---|---|
| Reduccion de tamano frente al ControlNet original | 99,73 % (369,7x) |
| PSNR medio de fotograma vs ControlNet completo (192f) | 19,45 dB |
| Tiempo de reconstruccion (RTX PRO 6000, INT8) | 2,4–2,8 s |
| Tiempo de reconstruccion (RTX 4060 Ti, BF16) | 23,8 s |
| Render 192f con UNet pruned_int8 | 389,9 s, 35,42 GB VRAM pico |
| Render 192f con UNet pruned_w6a8 (8 pasos, turbo) | 187,7 s, 19,55 GB VRAM pico |
| Render 192f con UNet ref2va_int8 | 401,6 s |

## Requisitos de hardware

- VRAM del parche reconstruido: 4,12 GiB en INT8 o 7,81 GiB en BF16, adicionales al UNet base.
- VRAM total estimada: 19,55 GB pico con UNet w6a8 y 35,42 GB pico con UNet pruned_int8 (medidos por el autor).
- GPU recomendadas: RTX PRO 6000 (reconstrucción en 2,4 s), RTX 4090 de 24 GB (suficiente para la configuración w6a8), RTX 4060 Ti (reconstrucción BF16 en 23,8 s; el render completo puede requerir offload).
- Cabe en GPU de consumo con el UNet w6a8; con el UNet int8 completo de 29,52 GiB no cabe en 24 GB sin offload.
- Despliegue: ComfyUI con SHINJUTSU-UI y el nodo `ShinjutsuSVDControlLoRALoader`; no es compatible con `LoraLoader` ni `ModelPatchLoader` estándar.
- Throughput: no disponible más allá de los tiempos de render citados.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHINJUTSU-H3-Control-LoRA | Residuos SVD de ControlNet | 33,34 MiB (parche 4,12 GiB INT8) | 192 fotogramas en pruebas | minimax-h3-community-license-agreement | Hugging Face (0 descargas) |
| MiniMax-H3-Fun-Controlnet-Union-2.0 | ControlNet completo | 12,92 GB | No disponible | MiniMax-H3 community | Hugging Face (alibaba-pai) |
| MiniMax-H3 (base) | DiT image-text-to-video | No disponible | No disponible | MiniMax-H3 community | Hugging Face (MiniMaxAI) |

No se dispone de datos de benchmarks comparativos con otros adaptadores de ControlNet para vídeo en la información proporcionada.

## Limitaciones y advertencias

- No es un LoRA estándar: cargarlo directamente en `LoraLoader` o `ModelPatchLoader` de ComfyUI falla; requiere el paso de reconstrucción de SHINJUTSU.
- Depende del UNet base instalado: el parche reconstruido debe generarse contra el checkpoint concreto (`ref2va_int8`, `pruned_int8`, `pruned_w6a8` o `pruned_fp8_scaled`); un UNet distinto puede romper la carga `strict=True`.
- La ruta `pruned_fp8_scaled` está implementada pero no se ha probado con render, según el autor.
- Fidelidad limitada: 19,45 dB de PSNR medio frente al ControlNet completo implica diferencias visibles respecto al original.
- Licencia comunitaria de MiniMax-H3: revisar restricciones de uso comercial en el enlace de licencia antes de desplegar en producción.
- Sin datos de sesgos, alucinación o cobertura idiomática: al ser un componente de control visual, estas métricas no aplican directamente, pero la calidad del vídeo generado hereda los sesgos del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación externa de la comunidad más allá de las pruebas del autor.
- El autor documenta artefactos de rejilla de 32×32 píxeles si se podan bloques de inyección, por lo que no es seguro reducir el número de bloques sin reentrenar.

## Enlaces

- Hugging Face: https://huggingface.co/makotolabs/SHINJUTSU-H3-Control-LoRA
- Repositorio SHINJUTSU-UI: https://github.com/makotolabs/SHINJUTSU-UI
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- ControlNet Union 2.0 de referencia: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0
- Checkpoints base en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
