# ryugyosoft/Ternary-Bonsai-2-4B-onwx

## Resumen

Ternary-Bonsai-2-4B-onwx es una conversión del modelo Ternary-Bonsai-2-4B de Prism ML (a su vez un reentrenamiento con pesos ternarios de Qwen3.5-4B de Alibaba Cloud) preparada por el usuario ryugyosoft para ejecutarse íntegramente en la NPU XDNA2 de los procesadores AMD Ryzen AI. El modelo conserva los pesos ternarios (-1, 0, +1) en un formato de 2 bits (aproximadamente 2,1 bits por peso) y ejecuta toda la inferencia —producto matriz-vector, DeltaNet, atención y LM head— en los 32 motores de IA de la NPU; únicamente el codificador de imagen (ViT) se ejecuta en CPU.

Con 4B de parámetros y una ventana de contexto de hasta 262144 tokens, es un modelo multimodal (image-text-to-text) que soporta modo de razonamiento y llamada a herramientas. Está diseñado específicamente para desplegarse en portátiles y equipos de sobremesa con Ryzen AI 300 (Strix Point) y Ryzen AI Max (Strix Halo), sin necesidad de GPU dedicada.

Su relevancia radica en que permite ejecutar un modelo multimodal de 4B cuantizado a 2 bits en hardware de consumo con NPU, con una descarga de solo 2,3 GB, un consumo de memoria de aproximadamente 3,3 GB y unos 29 tokens por segundo de generación, manteniendo una divergencia KL inferior a 0,0013 frente a la referencia calculada en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B con capas Gated DeltaNet y atención (modelo híbrido, según los tags del repositorio) |
| Parametros totales | 4B (según el nombre del modelo; no se detalla el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262144 tokens (máximo del modelo) |
| Tipos de cuantizacion | Pesos ternarios a 2 bits (aprox. 2,1 bits/peso); escalas cada 128 pesos en bf16; caché KV en int8; codificador de visión en bf16 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | Formato propietario para NPU: `blobs/L*.wgt`, `blobs/L*.st`, `blobs/head.wgt`, `embed.npz`, `vision.npz`; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B, que combina capas Gated DeltaNet (atención lineal recurrente) con capas de atención convencional. Los pesos son ternarios (-1, 0, +1) y provienen del modelo Ternary-Bonsai-2-4B de Prism ML, entrenado con pesos de tres valores sobre la base de Qwen3.5-4B. En esta conversión los pesos se mantienen en el mismo formato MLX de 2 bits (signo ternario a 2 bits más una escala bf16 cada 128 pesos), pero se reordenan para que cada motor de IA de la NPU los lea en el orden adecuado. La entrada se rota con matrices de Hadamard en bloques de 512 elementos y un signo aleatorio, el mismo tratamiento que aplica la representación original, y la NPU realiza esa rotación antes del producto.

Durante la generación, 16 motores de IA calculan el producto matriz-vector mientras leen los pesos, 8 se encargan de las capas DeltaNet y 4 de la atención, y la divergencia KL respecto a la referencia en CPU es inferior a 0,0013 (los tokens elegidos por decodificación greedy coinciden). La lectura de prompts procesa bloques de 1024 o 2048 tokens con los 32 motores, con divergencia KL entre 0,0007 y 0,0042. La caché de claves y valores se rota con Hadamard por cabeza y se guarda en int8. La visión utiliza el ViT de Qwen3.5 (24 capas) ejecutado en CPU con numpy, con parches de 2x2 píxeles por token y posiciones MRoPE, reduciendo la imagen a un máximo de 512x512 píxeles (256 tokens). No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Modo de razonamiento (thinking mode) según la model card.
- Soporte de llamada a herramientas (tool calling).
- Capacidades de visión: lectura de imágenes mediante el ViT de 24 capas de Qwen3.5, con un máximo de 512x512 píxeles (256 tokens) y preservación del formato.
- Integración mediante API compatible con OpenAI (base URL `http://127.0.0.1:8100/v1`), incluyendo imágenes enviadas como data URL en el campo `image_url`.
- Ejecución íntegra en la NPU XDNA2 (matriz-vector, DeltaNet, atención y LM head), con el ViT en CPU.
- No soporta vídeo.

## Casos de uso

- Asistente conversacional local en portátiles Ryzen AI: el modelo se ejecuta en la NPU con un consumo de memoria de unos 3,3 GB, lo que permite mantener un asistente siempre disponible sin ocupar la GPU ni agotar la memoria del sistema.
- Descripción y análisis de imágenes en local: al integrar un ViT de 24 capas, puede recibir imágenes de hasta 512x512 píxeles y generar descripciones o responder preguntas sobre ellas sin enviar datos a servidores externos.
- Procesamiento de documentos con privacidad: en entornos donde los datos no pueden salir del equipo (sanidad, legal, administración), el modelo permite extraer y resumir información de documentos e imágenes manteniendo todo el procesamiento en local.
- Integración en aplicaciones existentes mediante API compatible con OpenAI: cualquier cliente que hable el protocolo de OpenAI puede apuntar a `http://127.0.0.1:8100/v1` y usar el modelo como backend sin modificar el código de la aplicación.
- Prototipado multimodal sin GPU dedicada: investigadores y desarrolladores pueden probar flujos image-text-to-text en un portátil con Ryzen AI, evitando el coste y el consumo de una GPU de escritorio.
- Tareas de razonamiento por pasos con tool calling: el modo de razonamiento y la llamada a herramientas permiten construir agentes sencillos que consulten APIs o bases de datos locales y encadenen varios pasos.
- Escenarios de baja latencia en el borde: con una lectura de prompt de 1,8 s para 1000 tokens y 29 tok/s de generación, es adecuado para asistentes interactivos en el propio dispositivo.
- Sustitución de servicios en la nube en contextos sin conectividad: al ejecutarse de forma local, funciona en equipos aislados o con red restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se proporcionan métricas de rendimiento medidas por el autor en un Ryzen AI Max+ 395 con Windows, en modo de rendimiento de la NPU:

| Metrica | Valor |
|---|---|
| Lectura de prompt (1000 tokens) | ~1,8 s |
| Lectura de prompt (4000 tokens) | ~5,8 s |
| Lectura de prompt (20000 tokens) | ~34 s |
| Generación de texto | ~29 tok/s |
| Codificación de imagen (384x288, CPU) | ~2 s (primera vez ~1,8 s de carga) |
| Divergencia KL (generación frente a CPU) | ≤0,0013 |
| Divergencia KL (lectura de prompt) | 0,0007–0,0042 |

## Requisitos de hardware

- Requiere una NPU XDNA2 de AMD Ryzen AI: no se ejecuta en GPU NVIDIA, GPU AMD ni CPU genérica.
- Procesadores compatibles: Ryzen AI 300 (Strix Point, por ejemplo Ryzen AI 9 HX 370) y Ryzen AI Max (Strix Halo, por ejemplo Ryzen AI Max+ 395).
- Sistema operativo: Windows 11 con el controlador de NPU de AMD (versión 32.0.203 o superior verificada). Ubuntu es compatible de forma experimental y requiere el controlador `amdxdna` y XRT.
- Memoria RAM: 16 GB o más.
- Uso de memoria del modelo: aproximadamente 3,3 GB, más unos 13 MB por cada 1000 tokens de contexto (unos 1,3 GB adicionales si se usan imágenes).
- El procesamiento en CPU requiere AVX-512; los Ryzen AI 300 y Max son compatibles.
- GPU recomendadas: no aplica, el modelo no está pensado para GPU.
- Opciones de despliegue: aplicación onwx (Windows y Ubuntu) y API compatible con OpenAI en `http://127.0.0.1:8100/v1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 29 tok/s de generación y lectura de prompt de 1,8 s por 1000 tokens en Ryzen AI Max+ 395. En modo de energía estándar de la NPU el rendimiento baja aproximadamente un 20 %; el modo de rendimiento se activa con `xrt-smi.exe configure --pmode performance`.
- El uso simultáneo de funciones de IA de Copilot+ sobre la NPU puede reducir el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Plataforma objetivo | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B-onwx | 4B | 262144 tokens | NPU AMD Ryzen AI (XDNA2) | Ternaria 2 bits | apache-2.0 |
| prism-ml/Ternary-Bonsai-2-4B-mlx-2bit | 4B | no disponible | Apple Silicon (MLX) | Ternaria 2 bits | apache-2.0 |
| Qwen/Qwen3.5-4B | 4B | no disponible | GPU y CPU de propósito general | Original (sin cuantizar) | apache-2.0 |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especificidad de hardware: solo funciona en la NPU XDNA2 de Ryzen AI; no se puede ejecutar en GPU dedicada, en CPU genérica ni en otras NPU.
- Idiomas limitados a japonés e inglés; no se declara soporte de español ni de otros idiomas.
- No procesa vídeo.
- Los prompts que incluyen imágenes se leen actualmente token a token, lo que resulta más lento que la lectura por bloques.
- El rendimiento se degrada con contextos largos: el propio autor advierte de que cuanto más largo es el contexto, más lento es el modelo.
- El formato de pesos es propietario para NPU (`blobs/*.wgt`, `plans/`), por lo que no es portable a otros entornos de inferencia.
- El procesamiento en CPU requiere AVX-512; en equipos sin esta extensión las operaciones auxiliares no funcionarán correctamente.
- El rendimiento depende del modo de energía de la NPU y puede verse reducido por el uso concurrente de funciones de IA de Copilot+.
- El soporte de Ubuntu es experimental y requiere controladores adicionales.
- No se documentan sesgos específicos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada; como cualquier modelo generativo, existe riesgo de alucinación inherente.
- La licencia es Apache-2.0, lo que permite uso comercial, pero los pesos derivan de Prism ML y de Qwen3.5-4B, por lo que conviene conservar los avisos (`LICENSE`, `NOTICE.txt`) que acompañan al modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2-4B-onwx
- Modelo base (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-mlx-2bit
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicación onwx: https://huggingface.co/ryugyosoft/onwx
- README en inglés del modelo: README_en.md (dentro del repositorio del modelo)
