# dlwj/mandelworld-15m

## Resumen
MandelWorld-15M es un modelo de generación condicional de texto a 3D desarrollado por el usuario dlwj. Se trata de un transformer de flujo rectificado (rectified flow) de 13,88 millones de parámetros que transforma un prompt en lenguaje natural (inglés o chino) en un "genoma fractal 3D" de 48 dimensiones. Ese genoma codifica familia fractal, geometría, cámara, materiales y atmósfera, y se renderiza en tiempo real mediante raymarching de campos de distancia con signo (SDF) en WebGL2 dentro del navegador, a 4K y 60 fps.

El modelo resuelve un problema muy concreto: generar mundos fractales 3D navegables sin servidor GPU, con zoom matemático infinito y vuelo orbital WASD. La relevancia actual radica en su enfoque de despliegue en el cliente: pesos ONNX INT8 de 14,35 MB, paridad verificada con PyTorch y un pipeline cerrado de evaluación prompt-render-retrieval con SigLIP-2.

Arquitectónicamente es un DiT (Diffusion Transformer) de flujo condicionado por embeddings de texto SigLIP-2 de 768 dimensiones, con seis bloques AdaLN-Zero + SwiGLU + RMSNorm (d_model=384, 6 cabezas, FFN=1024). El contexto de texto no es una ventana de tokens tradicional, sino un embedding semántico fijo; no se especifica longitud de contexto en tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conditional Rectified Flow Transformer (DiT) con 6 bloques AdaLN-Zero + SwiGLU + RMSNorm, condicionado por SigLIP-2 |
| Parametros totales | 13.882.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por embedding SigLIP-2 de 768 dims, no por ventana de tokens) |
| Tipos de cuantizacion | INT8 weight-only per-channel (ONNX), FP16 (ONNX), FP32 (PyTorch) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors no indicado; ONNX (INT8 y FP16), PyTorch .pt, JSON (spec y embeddings) |

## Arquitectura y entrenamiento
El modelo proyecta las 48 coordenadas del genoma en seis tokens semánticos (family, geom_a, geom_b, camera, material, atmosphere) que se procesan mediante seis bloques transformer con AdaLN-Zero, SwiGLU y RMSNorm. La condición de tiempo se codifica con embeddings de Fourier y la de texto con embeddings SigLIP-2 normalizados en L2. La generación se realiza por muestreo ODE (Euler de 12 pasos o Heun de 8 pasos) con classifier-free guidance.

El entrenamiento utiliza el dataset dlwj/mandelworld-dataset: 160.000 fractales escénicos balanceados (32.000 por familia) más 16.000 conceptos visuales EN+ZH. Se realizaron 40.000 pasos con batch de 512. Una innovación destacable es el puente de modalidad Ridge: una matriz W_img2txt de 768×768 que proyecta embeddings de imagen SigLIP-2 al espacio de texto bilingüe (coseno medio de 0,177 a 0,987). La mezcla de entrenamiento combina 35% de conceptos EN top-8, 35% de conceptos ZH top-8, 20% de embeddings de imagen puenteados y 10% de dropout nulo para CFG. No se menciona RLHF ni DPO.

## Capacidades
- Generación de texto a 3D: convierte prompts en inglés o chino en un genoma fractal 3D de 48 dimensiones.
- Renderizado en navegador: salida compatible con WebGL2 a 4K y 60 fps, sin servidor GPU.
- Cinco familias fractales: Mandelbulb, Mandelbox, KIFS Cathedral, Kleinian Cavern y Hybrid Reef.
- Control de cámara y atmósfera: el genoma incluye encuadre de cámara seguro, paleta IQ cosine orbit-trap, iluminación solar y niebla volumétrica.
- Bilingüe EN+ZH con mezcla de conceptos y puente imagen-texto.
- Exportación de imágenes PNG en 4K (3840×2160) y URLs compartibles con hash #g=...
- Morfing latente en tiempo real y navegación con WASD y ratón.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso
- Estudio creativo en navegador: artistas y diseñadores introducen prompts en inglés o chino y obtienen mundos fractales navegables al instante, con exportación PNG 4K para moodboards.
- Visualización educativa de fractales: el zoom matemático infinito y las cinco familias permiten explorar geometría fractal SDF en el aula sin infraestructura GPU.
- Prototipado de entornos 3D: el genoma de 48 dimensiones sirve como contrato estructurado para generar escenarios de fondo en demos web o juegos ligeros.
- Aplicaciones web sin backend: al pesar 14,35 MB en INT8, el modelo se integra en páginas estáticas con ONNX Runtime Web y WebGL2, reduciendo costes de servidor.
- Generación de arte procedural reproducible: las URLs con hash #g=... permiten compartir y reproducir exactamente un mundo generado, útil para galerías o concursos.
- Investigación en flow matching multimodal: el puente Ridge y la mezcla bilingüe ofrecen un caso de estudio reproducible para cerrar la brecha visión-lenguaje en modelos pequeños.

## Benchmarks y rendimiento
Evaluación cerrada sobre 32 prompts no vistos (16 EN + 16 ZH) con recuperación prompt-render a 16 vías mediante SigLIP-2:

| Punto de operación | EN Top-1 | EN Top-5 | ZH Top-1 | ZH Top-5 | Scenic Pass |
|---|---:|---:|---:|---:|---:|
| Euler 12 pasos, CFG 3.5 (por defecto) | 100,0% | 100,0% | 75,0% | 100,0% | 81,25% |
| Heun 8 pasos, CFG 3.5 | 87,5% | 100,0% | 81,25% | 100,0% | 81,25% |
| Heun 8 pasos, CFG 4.0 | 100,0% | 100,0% | 68,75% | 100,0% | 81,25% |
| Euler 12 pasos, CFG 4.0 | 87,5% | 100,0% | 68,75% | 100,0% | 84,38% |
| Baseline escénico aleatorio | 6,25% | 31,25% | 6,25% | 31,25% | no disponible |

Paridad de exportación: INT8 ONNX alcanza coseno de peor fila 0,999939 frente a FP32; FP16 ONNX alcanza 0,999999. El raymarcher CUDA fusionado iguala PyTorch con error RGB máximo de 5,96e-8 (1 ULP de FP32) a ~205 kept/s en una NVIDIA L4; el shader WebGL2 presenta error absoluto máximo de 2,19e-5.

## Requisitos de hardware
- Inferencia en navegador: sin VRAM dedicada; depende de WebGL2 y ONNX Runtime Web con pesos INT8 de 14,35 MB.
- Servidor GPU opcional: el raymarcher CUDA fusionado se validó en una NVIDIA L4 a ~205 kept/s.
- GPU de consumo: no se especifican requisitos mínimos; el modelo está pensado para ejecutarse en el cliente.
- Despliegue: ONNX Runtime Web (navegador), PyTorch (referencia) y CUDA fusionado; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 60 fps a 4K en WebGL2 según el autor; no se detallan cifras de latencia por prompt.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables de texto a 3D fractal con despliegue en navegador en la documentación proporcionada. La comparativa con alternativas como TRELLIS, Shap-E o DreamFusion no está disponible en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MandelWorld-15M | 13,88 M | no disponible | apache-2.0 | Hugging Face + Space |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- El modelo solo genera genomas fractales de cinco familias predefinidas; no produce mallas 3D arbitrarias ni escenas realistas.
- El rendimiento en chino es inferior al inglés en Top-1 (75% frente a 100% en la configuración por defecto).
- La evaluación se limita a 32 prompts y a la recuperación con SigLIP-2; puede no reflejar la calidad percibida por usuarios humanos.
- Riesgo de alucinación semántica: prompts fuera del banco de 16.000 conceptos pueden producir genomas escénicamente válidos pero poco fieles.
- Dependencia de SigLIP-2 y del vocabulario bilingüe podado para texto libre; prompts muy largos o fuera de dominio no están cubiertos.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan garantías ni limitaciones adicionales del autor.
- El renderizado en navegador depende de WebGL2 y del soporte del dispositivo; no se documenta comportamiento en GPU integradas antiguas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dlwj/mandelworld-15m
- Space en vivo: https://huggingface.co/spaces/dlwj/mandelworld
- Dataset: https://huggingface.co/datasets/dlwj/mandelworld-dataset
- Codificador de texto bilingüe SigLIP-2: https://huggingface.co/dlwj/pixel32-bilingual/tree/main/onnx/siglip2_enzh
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
