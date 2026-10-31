# LocalMuseAI/mlx-moss-image-realism-stable-yogi-4bit

## Resumen

MOSS-Image Realism by Stable Yogi — MLX INT4 es una conversión de formato, no un modelo nuevo: el equipo LocalMuseAI ha cuantizado a INT4 (affine, grupo 64) el checkpoint de difusión "Realism By Stable Yogi Moss V1.0" de Stable_Yogi, un fine-tune de realismo basado en MOSS-Image-SFT del OpenMOSS Team. El objetivo es permitir su ejecución local en Apple Silicon, concretamente en la app iOS LocalMuse (perfil `mossImage5B4Bit`), sin entrenamiento adicional ni merges: los pesos del DiT son del autor original, mientras que el codificador de texto (Qwen3.5), el decodificador VAE pequeño de FLUX.2 y el tokenizador se conservan sin cambios respecto a la versión oficial de MOSS-Image-SFT.

El problema que resuelve es doble: por un lado, llevar un generador de imágenes fotorrealistas de calidad a hardware de consumo de Apple con una huella de memoria reducida (7,6 GB en disco y unos 3,57 GB de pico en MLX durante la inferencia); por otro, mantener la destilación de pocos pasos del checkpoint original, de modo que genera imágenes limpias en 8 pasos sin necesidad de adaptadores turbo. Es relevante porque demuestra un pipeline completo de conversión (dequantización FP8 a BF16, fusión y división de bloques QKV, cuantización INT4) validado con mediciones reales en un M1 Pro de 16 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de difusion text-to-image (MOSS-Image), con codificador de texto Qwen3.5 y decodificador VAE pequeño de FLUX.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | presupuesto validado de 4096 tokens (limita resolucion maxima a 1024x1024 o 896x1152) |
| Tipos de cuantizacion | INT4 affine (grupo 64) en transformer y codificador de texto; BF16 en embedders, time embedding, modulacion, normas y proyeccion de salida; FP32 en VAE |
| Idiomas soportados | no disponibles |
| Licencia | stable-yogi-model-terms (otra, con atribucion obligatoria; componentes base Apache 2.0) |
| Formato de pesos | safetensors (formato MLX, int4) |

## Arquitectura y entrenamiento

El modelo se compone de tres bloques: un DiT (diffusion transformer) cuantizado, un codificador de texto basado en Qwen3.5 (Alibaba Cloud / Qwen Team) y un decodificador VAE pequeño de FLUX.2 (Black Forest Labs). En la conversión se dequantizaron las proyecciones de bloques float8_e4m3fn del checkpoint original a BF16 usando sus escalas por tensor, se dividió el bloque QKV fusionado en matrices q, k y v separadas, y después se aplicó cuantización affine INT4 con grupo 64 sobre las capas de atención y FFN. El VAE se mantiene en FP32 junto con las estadísticas BatchNorm del espacio latente.

No hay entrenamiento propio en este repositorio: el checkpoint original de Stable_Yogi es un fine-tune de MOSS-Image-SFT (OpenMOSS Team, Apache 2.0) orientado a realismo fotográfico, y la destilación de pocos pasos ya está embebida en los propios pesos (`embeddedDistillation: true`), por lo que el paquete no incluye adaptador turbo. El muestreo se realiza con Euler sobre las sigmas beta de ComfyUI (alpha = beta = 0.6) en la rejilla de flujo shift-5; el sampler ER SDE estocástico del autor no se reproduce en esta conversión.

## Capacidades

- Generacion de imagenes text-to-image con enfoque en realismo fotografico (fine-tune de realismo sobre MOSS-Image-SFT)
- Generacion en 8 pasos gracias a la destilacion de pocos pasos embebida en los pesos (CFG 1, sin negative prompt)
- Resoluciones validadas de 896x1152 (por defecto) y 1024x1024
- Ejecucion nativa en Apple Silicon mediante Swift MLX, integrada en la app LocalMuse para iOS
- Soporte de Hires Fix y Face Detail como postproceso segun la configuracion del autor
- Comparativa de schedules incluida (Euler vs Beta) para reproducibilidad con las mismas semillas

No hay evidencia de capacidades de edicion image-to-image, inpainting, tool calling ni razonamiento: es un modelo de difusion especializado en text-to-image.

## Casos de uso

- Generacion fotografica local en iPhone/iPad: la app LocalMuse ejecuta el modelo de forma nativa con Swift MLX, permitiendo crear imagenes realistas sin servidor ni envio de datos a la nube.
- Prototipado en MacBook: en un M1 Pro de 16 GiB genera una imagen 1024x1024 en unos 209 segundos, suficiente para iterar prompts sin GPU dedicada.
- Ilustracion de personajes y retratos realistas: el fine-tune de Stable_Yogi esta orientado a fotorrealismo, util para concept art de personajes con iluminacion natural.
- Generacion con presupuesto de memoria ajustado: con ~3,57 GB de pico en MLX, cabe en equipos con 16 GiB de memoria unificada compartiendo memoria con otras aplicaciones.
- Integracion en pipelines ComfyUI compatibles: las sigmas beta y la rejilla shift-5 siguen convenciones de ComfyUI, facilitando reproducir los ajustes del autor (8 pasos, CFG 1).
- Verificacion de conversiones de cuantizacion: el repo incluye manifest con SHA-256 del archivo fuente y scripts de conversion, util como referencia para convertir otros checkpoints a MLX INT4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible. Los unicos datos de rendimiento son mediciones propias del autor de la conversion en Apple M1 Pro / 16 GiB (build de debug, no timings de iPhone):

| Configuracion | Tiempo | Pico de memoria MLX |
|---|---|---|
| 1024x1024, 8 pasos, Beta | 209 s | 3.570.991.124 bytes (~3,57 GB) |
| 896x1152, 8 pasos, Beta | 204 s | no disponible |

## Requisitos de hardware

- Memoria unificada: validado en Apple M1 Pro con 16 GiB; pico de ~3,57 GB en MLX, por lo que teoricamente cabe en equipos con 8 GiB, aunque no hay mediciones que lo confirmen
- GPU recomendada: cualquier Apple Silicon con soporte MLX (M1 o superior); no requiere GPU NVIDIA
- Consumer hardware: disenado precisamente para consumer Apple (MacBook, y via LocalMuse, iPhone, aunque sin timings publicados de iOS)
- Despliegue: ejecucion nativa Swift MLX (app LocalMuse); el formato MLX no es directamente compatible con vLLM, llama.cpp, Ollama o TGI; para ComfyUI habria que usar el checkpoint original en FP8
- Latencia: ~209 s por imagen a 1024x1024 con 8 pasos en M1 Pro (build debug); el rendimiento en builds optimizadas o chips mas recientes no esta documentado

## Comparativa con modelos similares

| Modelo | Base | Cuantizacion | Destilacion pocos pasos | Licencia | Plataforma |
|---|---|---|---|---|---|
| LocalMuseAI/mlx-moss-image-realism-stable-yogi-4bit | MOSS-Image-SFT (fine-tune Stable_Yogi) | INT4 affine (grupo 64) | Embebida (8 pasos) | stable-yogi-model-terms (atribucion obligatoria) | Apple Silicon (MLX) |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base oficial | FP8 (checkpoint original) | Si (embebida) | Apache 2.0 | ComfyUI / CUDA / CPU |
| FLUX.2 (componente VAE/decoder del paquete) | Black Forest Labs | no disponible | no disponible | Apache 2.0 (componente) | Multiplataforma |

La alternativa directa para entornos no-Apple es el checkpoint original de Civitai en FP8 (archivo 3315401, ~3,3 GB de referencia SHA-256 en el README), que ofrece el mismo modelo sin perdida por cuantizacion INT4 pero sin soporte MLX nativo.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos del DiT pertenecen a Stable_Yogi y requieren atribucion; no se permiten merges compartidos. LocalMuse no otorga licencia sustitutoria y el paquete no se ofrece bajo Apache 2.0 incondicional. Lee la licencia del autor en Civitai antes de cualquier uso comercial.
- Presupuesto de tokens: la resolucion 1024x1536 del autor excede el presupuesto validado de 4096 tokens; limitarse a 896x1152 o 1024x1024.
- Sampler no reproducido: el sampler ER SDE estocastico del autor no esta implementado; se usa Euler con schedule Beta, lo que puede producir resultados ligeramente distintos.
- Mediciones en build de debug: los tiempos de 204-209 s corresponden a un build de debug en M1 Pro; no hay timings de iPhone ni de builds optimizados.
- Sin negative prompt y CFG 1: la destilacion embebida funciona sin negative prompt, lo que reduce el control sobre atributos indeseados.
- Alucinaciones y sesgos: al ser un modelo de difusion generativo, puede producir artefactos de manos, texto ilegible en imagenes y sesgos demograficos heredados del dataset de MOSS-Image-SFT y del fine-tune; no se documentan evaluaciones de sesgo.
- Descargas: 0 en el momento de la ficha, por lo que no hay historial de adopcion ni reportes comunitarios de problemas.

## Enlaces

- Ficha del modelo: https://huggingface.co/LocalMuseAI/mlx-moss-image-realism-stable-yogi-4bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Version original en Civitai: https://civitai.com/models/3014108?modelVersionId=3421295
- Licencia del autor: https://civitai.com/models/license/3421295
- Autor original en Civitai: https://civitai.com/user/Stable_Yogi
