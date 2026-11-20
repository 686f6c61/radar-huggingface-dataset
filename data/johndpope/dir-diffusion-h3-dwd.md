# johndpope/dir-diffusion-h3-dwd

## Resumen

DWD for DiR on MiniMax H3 es un checkpoint de investigación que sustituye el decodificador VAE de un generador de vídeo por difusión (DiR sobre MiniMax H3) por un mecanismo de predicción directa de píxeles. Lo publica el usuario johndpope como port independiente del trabajo "Decoding Without a Decoder: Direct Pixel Prediction from Diffusion Transformers" (arXiv 2611.22287) de Chen, Cai, Ackermann, Zirvi, Wetzstein, Yan y Guibas. No es una release oficial de los autores ni está afiliado a MiniMax.

El modelo no genera vídeo por sí mismo: es un decodificador que transforma los tokens latentes producidos por `johndpope/dir-diffusion-h3` (tras su cuarta iteración) en fotogramas RGB, combinando una LoRA de rango 64 sobre los 8 últimos bloques del DiT, una cabeza lineal por clase de fotograma latente y un refinador U-Net de 8,2 millones de parámetros. El objetivo declarado es reducir el coste del decode VAE: en una RTX 5090, un clip de 39 fotogramas a 768×512 pasa de 1,8 s (VAE) a 0,26 s (DWD), con un LPIPS de 0,10–0,11 frente al decode VAE del mismo latente.

Es relevante ahora porque ataca uno de los cuellos de botella del pipeline de difusión para vídeo (el decodificador VAE) y porque demuestra que un DiT puede predecir píxeles directamente con una pérdida de calidad acotada y medible. El repositorio ocupa 1,8 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia (MiniMax H3 Community License) restringe el uso y la redistribución fuera de la UE, Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador híbrido sobre DiT: LoRA rank-64 en los 8 últimos bloques + cabeza lineal por clase de fotograma latente (5 clases, 5472 → 28800) + refinador U-Net (8,2 M parámetros) |
| Parámetros totales | No disponible (el refinador aporta 8,2 M; la LoRA es rank-64 sobre qkv/out/fc1/fc2 de 8 bloques; la cabeza es lineal 5472 → 28800) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre 39 fotogramas latentes por clip en el entrenamiento) |
| Tipos de cuantización | No disponible; pesos en fp16 (cabeza) y fp32 al cargar; LoRA y refinador en formato PyTorch |
| Idiomas soportados | No disponible (modelo de vídeo, sin procesamiento de lenguaje propio) |
| Licencia | MiniMax H3 Community License (uso y redistribución solo fuera de la UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | `.pt` (PyTorch, `torch.load(..., weights_only=True)`): `dwd_lora.pt`, `dwd_head.pt`, `dwd_refiner.pt`, más `config.json` |

## Arquitectura y entrenamiento

El decodificador se apoya en el DiT del generador base: en una segunda pasada (`--mode two_pass`, por defecto) se reactivan los 8 últimos bloques del transformer con una LoRA de rango 64 aplicada a las proyecciones qkv, out, fc1 y fc2 (claves estilo musubi-tuner). La salida de esos bloques pasa por una cabeza lineal específica por clase de fotograma latente (5 clases, de 5472 a 28800 dimensiones) con normalización de entrada y mezcla de halo, y después por un refinador U-Net que lee los píxeles de la cabeza junto con el latente y los fotogramas latentes vecinos, incluyendo una ruta de rejilla latente. La LoRA solo se activa en la iteración final para no alterar la salida del generador.

El entrenamiento se hizo en una única RTX 5090 y en cuatro etapas: (1) recogida de unas 3.000 rollouts de DiR a 512×768 y 39 fotogramas (1.508 escenas isométricas y 1.508 retratos, con 8 de cada retenidos para validación), guardando los tokens de la iteración final y el decode VAE; (2) cabeza ridge sobre tokens congelados, con LPIPS 0,466; (3) LoRA sobre los 8 últimos bloques con pérdida de píxel + LPIPS, seguida de un reajuste de la cabeza sobre sus tokens, bajando a 0,267; (4) refinador sobre la salida de la cabeza más el latente y vecinos, hasta LPIPS 0,114 (paso 40416, 0,1142 en held-out). No se documenta RLHF ni DPO; el modelo no es un LLM y no usa alineación por preferencias.

## Capacidades

- Decodificación de tokens latentes a vídeo RGB sin VAE, para clips de 39 fotogramas.
- Funciona a resoluciones distintas de la de entrenamiento: LPIPS 0,139–0,152 entre 512×512 y 1344×768, 0,165 a 576×1024 y 0,183 a 384×256.
- Integración en el pipeline DiR + DWD de extremo a extremo: unos 4,2 s por clip de 39 fotogramas a 768×512, frente a 5,5 s con VAE.
- Aceleración del decode: 0,26 s frente a 1,8 s del VAE en una RTX 5090 para 39 fotogramas a 768×512.
- Modo de dos pasadas para preservar la salida del generador (la LoRA no debe modificar el resultado del DiT).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un componente de decodificación de vídeo, no un modelo de lenguaje.

## Casos de uso

- Aceleración de pipelines de generación de vídeo: sustituir el decode VAE por DWD reduce el tiempo de decode de 1,8 s a 0,26 s por clip de 39 fotogramas a 768×512, lo que rebaja el coste total del pipeline (4,2 s frente a 5,5 s) y libera tiempo de GPU para el DiT, que pasa a ocupar más del 90 % del cómputo.
- Investigación sobre decodificación sin VAE: el checkpoint permite reproducir y extender los experimentos de arXiv 2611.22287 sobre predicción directa de píxeles desde transformers de difusión, con métricas LPIPS reproducibles y código en el repositorio scrya-com/dir-diffusion.
- Prototipado de generadores de vídeo ligeros: al eliminar el VAE del grafo de inferencia se simplifica el despliegue (menos pesos que cargar y gestionar) y se reducen los requisitos de memoria asociados al decodificador, a costa de necesitar una GPU de 32 GB sin block swap.
- Evaluación comparativa de decodificadores: sirve como referencia para medir la brecha de calidad (LPIPS 0,10–0,11 en held-out) entre un decode neuronal directo y el VAE objetivo en distintos tamaños y contenidos (escenas isométricas y retratos).
- Generación de vídeo a resoluciones variadas en investigación: aunque no se entrenó en ellas, ofrece LPIPS entre 0,139 y 0,183 de 384×256 a 1344×768, útil para estudiar la degradación fuera de distribución.
- Análisis de artefactos en movimiento rápido: al ser más débil en movimiento rápido (manos) y más suave que el VAE, permite estudiar dónde falla la predicción directa de píxeles y diseñar refinadores o pérdidas específicas.

## Benchmarks y rendimiento

| Métrica (RTX 5090, 39 fotogramas, 768×512) | VAE | DWD (LoRA + cabeza + refinador) |
|---|---|---|
| Tiempo de decode | 1,8 s | 0,26 s |
| LPIPS frente al decode VAE del mismo latente | 0 (objetivo) | 0,10–0,11 (clips held-out) |
| Tiempo extremo a extremo DiR + decode | 5,5 s | 4,2 s |

| Resolución (no entrenada) | LPIPS |
|---|---|
| 512×512 a 1344×768 | 0,139–0,152 |
| 576×1024 | 0,165 |
| 384×256 | 0,183 |

| Etapa de entrenamiento | LPIPS |
|---|---|
| Cabeza ridge sobre tokens congelados | 0,466 |
| Tras LoRA + reajuste de cabeza | 0,267 |
| Tras refinador (paso 40416, held-out) | 0,1142 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores son las únicas reportadas por el autor.

## Requisitos de hardware

- VRAM: se necesita una tarjeta de 32 GB sin block swap, porque la cola LoRA reejecuta los 8 últimos bloques con todos los bloques en la GPU.
- GPU recomendadas: RTX 5090 (usada para el entrenamiento y los benchmarks); no se documentan otras GPU compatibles.
- GPU de consumo: cabe en una RTX 5090 de 32 GB; no hay datos para tarjetas de 24 GB o menos, y el requisito de no usar block swap sugiere que no cabría sin recortes.
- Despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no es un LLM); la inferencia se hace con el código del repositorio `scrya-com/dir-diffusion` (rama `feat/accel` hasta su fusión), mediante `lot/accel_h3.py` y `scripts/bench_accel.sh`.
- Latencia y throughput: 0,26 s por decode de 39 fotogramas a 768×512; 4,2 s de extremo a extremo por clip con DiR + DWD, frente a 5,5 s con VAE.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DWD for DiR on MiniMax H3 (este) | Decodificador sin VAE sobre DiT | Refinador 8,2 M + LoRA rank-64 + cabeza lineal | 39 fotogramas por clip (entrenamiento) | MiniMax H3 Community License (excluye UE, RU, Corea del Sur y EE. UU.) | Hugging Face, 0 descargas |
| VAE de MiniMax H3 | Decodificador latente-a-píxel | No disponible | No disponible | MiniMax H3 Community License | Incluido con el generador H3 |
| `johndpope/dir-diffusion-h3` | Generador de vídeo por difusión (DiR) | No disponible | No disponible | No disponible | Hugging Face (modelo base) |

No se dispone de datos de otros decodificadores sin VAE comparables en la información proporcionada.

## Limitaciones y advertencias

- Pesos de investigación atados a un único generador: solo decodifican los tokens de `johndpope/dir-diffusion-h3` tras su cuarta iteración; con H3 base, Turbo, otro checkpoint DiR u otro número de iteraciones la salida es ruido.
- Licencia restrictiva: derivado de MiniMax H3 bajo la MiniMax H3 Community License; el uso y la redistribución solo se permiten fuera de la Unión Europea, el Reino Unido, Corea del Sur y los Estados Unidos.
- Techo de calidad: el objetivo es el decode VAE, por lo que en el mejor caso lo iguala y no puede superarlo.
- Debilidad en movimiento rápido: en manos y movimiento veloz es más suave que el VAE.
- Generalización limitada fuera de entrenamiento: aunque funciona a otras resoluciones, el LPIPS sube hasta 0,183 a 384×256 y 0,165 a 576×1024.
- Requisito de hardware estricto: 32 GB de VRAM sin block swap; no hay datos de funcionamiento en GPU de consumo de gama alta con menos memoria.
- Madurez: código en rama `feat/accel` no fusionada, 0 descargas y 0 likes, sin pipeline declarado en Hugging Face; no es una release oficial de los autores del paper ni de MiniMax.
- Riesgo de alucinación y sesgos: no se documentan sesgos ni evaluación de alucinación; al ser un decodificador de vídeo, el riesgo se traslada a artefactos visuales y pérdida de detalle, no a texto.
- Idiomas: no disponible; el modelo no procesa lenguaje, solo tokens latentes de vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johndpope/dir-diffusion-h3-dwd
- Modelo base: https://huggingface.co/johndpope/dir-diffusion-h3
- Repositorio de código: https://github.com/scrya-com/dir-diffusion
- Documentación DWD: https://github.com/scrya-com/dir-diffusion/blob/main/docs/DWD.md
- Resultados (issue #6): https://github.com/scrya-com/dir-diffusion/issues/6
- Explicador: https://scrya.com/dwd_diffusion
- Paper: https://arxiv.org/abs/2611.22287
