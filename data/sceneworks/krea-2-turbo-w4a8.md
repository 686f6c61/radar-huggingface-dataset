# SceneWorks/krea-2-turbo-w4a8

## Resumen

Krea 2 Turbo W4A8 es una repack cuantizada del transformer de difusion (DiT) de Krea 2 Turbo, el checkpoint de generacion texto-a-imagen de pocos pasos desarrollado por Krea.ai, Inc. No se trata del modelo original, sino de una derivada numerica preparada por el proyecto SceneWorks para su runtime de inferencia basado en candle, orientado a GPUs CUDA. El repositorio contiene unicamente el transformer, empaquetado en un unico fichero `.safetensors` con claves nativas; el codificador de texto, el VAE, el tokenizer y el scheduler se toman del snapshot bf16 de `SceneWorks/krea-2-turbo-mlx`.

La relevancia de esta version es la reduccion de huella de memoria: frente a los 39,4 GB de VRAM pico del transformer bf16, la variante W4A8 residente baja a 34,4 GB y la modalidad escalonada (codificador de texto primero, transformer despues) a 26,6 GB, con una calidad medida de 31,29 dB de PSNR respecto al bf16. El modelo base Krea 2 Turbo fue publicado el 22 de junio de 2026 y deriva a su vez de `krea/Krea-2-Raw`.

Conviene subrayar que no es un checkpoint diffusers: no carga en PyTorch/diffusers estandar ni en ComfyUI, y exige GPUs con compute capability 8.0 (Ampere, `sm_80`) o superior por el uso de instrucciones tensor-core int8 `mma.sync`. Es, por tanto, una pieza de infraestructura para despliegues controlados, no un modelo de proposito general para experimentation rapida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT); pesos W4A8 con rotacion de bloques ConvRot (bloque 256) |
| Parametros totales | 6,80B en las 138 proyecciones cuantizadas del tronco; 126 proyecciones adicionales en bf16; total del transformer no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | int4 asimetrico empaquetado con escalas por canal en pesos; activaciones int8 por fila; politica mixta con 126 proyecciones en bf16 |
| Idiomas soportados | en |
| Licencia | krea-2-community-license (Krea 2 Community License Agreement + Krea Acceptable Use Policy) |
| Formato de pesos | safetensors (claves nativas, un unico fichero de 16.511.305.902 B) |

## Arquitectura y entrenamiento

El modelo subyacente es un Diffusion Transformer (DiT) de Krea.ai concebido para generacion texto-a-imagen en pocos pasos y sin classifier-free guidance (CFG-free), pensado para ejecutarse en torno a 8 pasos con guidance 0 y sin prompt negativo. Esta derivada no introduce cambios arquitectonicos: se limita a una reordenacion en disco y a una cuantizacion numerica del transformer bf16 original, sin reentrenamiento ni ajuste fino.

La cuantizacion aplica rotacion de bloques ConvRot (tamano 256) a 138 proyecciones del tronco (atención `to_q/to_k/to_v/to_gate` y proyecciones feed-forward `gate/up`), que se almacenan como codigos int4 asimetricos empaquetados con escalas por canal. En tiempo de ejecucion las activaciones se rotan y cuantizan por fila a int8, y el producto se ejecuta en los tensor cores int8. Bajo la politica mixta `--policy mixed`, 126 proyecciones consideradas sensibles a la calidad (lecturas de contexto, bloques de borde, proyecciones posteriores a no linealidades, geometria y cabeza) permanecen en bf16, igual que las normas, embeddings y tablas de modulacion. El formato sigue el layout `asym_w4a8_int8` de comfy-kitchen (Apache-2.0). No se dispone de datos sobre volumen de tokens, composicion del dataset ni etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con el pipeline `text-to-image`.
- Inferencia en pocos pasos: el modelo esta disenado para funcionar con aproximadamente 8 pasos de muestreo.
- Operacion CFG-free: no requiere prompt negativo ni duplicacion del lote por guidance.
- Cuantizacion W4A8 con precision mixta para reducir huella de VRAM manteniendo calidad cercana al bf16.
- Ejecucion exclusiva en CUDA con compute capability 8.0 o superior; el runtime rechaza explicitamente CPU, Apple MLX y GPUs anteriores, sin fallback silencioso.
- Integracion con el runtime candle de SceneWorks y con el worker que lo embebe.
- Soporte de modalidad escalonada (staged) para reducir el pico de VRAM.
- Soporte linguistico limitado al ingles (`en`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- No se documentan capacidades de vision de entrada, audio ni modos de pensamiento.

## Casos de uso

- Generacion de imagenes en produccion con VRAM limitada: la modalidad escalonada permite servir el pipeline completo con 26,6 GB de pico en una RTX PRO 6000 Blackwell, lo que facilita el despliegue en nodos con menos memoria que los 39,4 GB exigidos por el transformer bf16.
- Prototipado de pipelines texto-a-imagen dentro del ecosistema SceneWorks: al integrarse en el runtime candle y en el worker de SceneWorks, permite construir flujos de generacion sin depender de diffusers ni de ComfyUI.
- Renderizado por lotes de assets graficos: la naturaleza CFG-free y de pocos pasos (8 pasos) reduce el coste por imagen, adecuado para generar variaciones de ilustraciones, fondos o material de marketing.
- Experimentacion con cuantizacion de DiT: util como referencia para estudiar el impacto de W4A8 con rotacion ConvRot y politica mixta sobre la calidad de salida (31,29 dB de PSNR frente a bf16).
- Despliegue en estaciones de trabajo con GPUs Ampere o superiores: cualquier equipo con `sm_80`+ puede ejecutar esta tier siempre que cumpla los requisitos de memoria, lo que amplia el parque de hardware compatible frente a variantes mas pesadas.
- Evaluacion comparativa de tiers de cuantizacion: permite contrastar el equilibrio calidad/memoria del tier W4A8 frente a bf16 en un mismo seed y configuracion de 1024x1024, como documenta el autor.
- Integracion en servicios con filtrado de contenido obligatorio: la licencia exige mecanismos de filtrado al desplegar, por lo que encaja en arquitecturas de servicio que ya incorporan moderacion de entradas y salidas.

## Benchmarks y rendimiento

El autor publica mediciones de calidad y memoria para Krea 2 Turbo a 1024x1024, 8 pasos, seed fija y GPU RTX PRO 6000 Blackwell (`sm_120`), comparando contra el transformer bf16:

| Tier | PSNR vs bf16 | VRAM pico |
|---|---:|---:|
| bf16 | — | 39,4 GB |
| W4A8 (este repo), residente | 31,29 dB | 34,4 GB |
| W4A8 (este repo), escalonado | 31,29 dB | 26,6 GB |

El pico incluye el codificador de texto bf16 y el VAE del snapshot base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un modelo de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada: 34,4 GB en modo residente y 26,6 GB en modo escalonado, incluyendo codificador de texto bf16 y VAE.
- GPU: exclusivamente CUDA con compute capability 8.0 (`sm_80`, Ampere) o superior; se ha medido en RTX PRO 6000 Blackwell (`sm_120`). El runtime rechaza GPUs anteriores, CPU y Apple MLX sin fallback.
- No cabe en GPUs de consumo con menos de 26,6 GB de VRAM; no se documenta compatibilidad con RTX 4090 (24 GB) ni con modelos inferiores.
- El streaming por bloques del transformer W4A8 no esta soportado; el runtime rechaza una peticion explicita de streaming.
- Opciones de despliegue: runtime candle de SceneWorks (worker de SceneWorks en Windows o Linux); no es compatible con diffusers, PyTorch estandar, ComfyUI, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Turbo W4A8 (este repo) | 6,80B en proyecciones cuantizadas + 126 proyecciones bf16 | no disponible | 31,29 dB PSNR vs bf16; 34,4 GB residente / 26,6 GB escalonado | krea-2-community-license | Hugging Face, runtime SceneWorks |
| Krea 2 Turbo bf16 (`krea/Krea-2-Turbo`) | no disponible | no disponible | referencia de calidad; 39,4 GB pico | krea-2-community-license | Hugging Face, diffusers/SGLang |
| Krea 2 Turbo MLX bf16 (`SceneWorks/krea-2-turbo-mlx`) | no disponible | no disponible | bf16, orientado a Apple MLX | krea-2-community-license | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion con perdida: es una aproximacion del modelo bf16, no un repack sin perdida; la calidad medida es de 31,29 dB de PSNR, no identica al original.
- Compatibilidad restringida: no carga en diffusers, PyTorch estandar, ComfyUI ni en runtimes genericos; solo funciona con el runtime candle de SceneWorks.
- Requiere CUDA `sm_80` o superior; sin soporte de CPU, Apple MLX ni GPUs antiguas, y sin fallback silencioso entre tiers.
- No soporta streaming por bloques del transformer, lo que limita estrategias de ahorro de memoria mas agresivas.
- Idioma limitado al ingles (`en`) en la informacion disponible.
- Obligacion legal de filtrado de contenido: la Krea 2 Community License exige implementar medidas de filtrado o procesos de revision equivalentes al desplegar el modelo; el despliegue sin estas salvaguardas incumple la licencia.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos generativos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Los outputs generados no estan cubiertos por copyright de Krea; la responsabilidad sobre entradas y usos recae en el usuario.
- Uso comercial sujeto a los terminos de la Krea 2 Community License y la Krea Acceptable Use Policy; en caso de conflicto, prevalecen estas ultimas.
- Reporte de contenido danino a safety@krea.ai; el CSAM potencial se escala a NCMEC segun exige la ley.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/krea-2-turbo-w4a8
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Snapshot bf16 de origen (MLX): https://huggingface.co/SceneWorks/krea-2-turbo-mlx/tree/d009674080cc1bccf2b629d834c34bf5eccdb723/bf16
- Licencia (PDF en el repo): https://huggingface.co/SceneWorks/krea-2-turbo-w4a8/blob/main/LICENSE.pdf
- Licencia (original): https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- Runtime de inferencia SceneWorks: https://github.com/SceneWorks/inference
- Commit de inferencia usado: https://github.com/SceneWorks/inference/commit/ab8cf6e4f6cd05052ff2e574ec2e46c951249b16
- Formato de cuantizacion comfy-kitchen (`asym_w4a8_int8`, Apache-2.0): no disponible enlace directo
