# cfahlgren1/Idol-Turbo-MLX-8bit

## Resumen

Idol-Turbo-MLX-8bit es una conversión a MLX de 8 bits del denoiser del modelo Idol, un sistema de reconstrucción 3D a partir de una sola imagen (image-to-3D) que genera Gaussian splats. Lo publica cfahlgren1, que fusiona el experto de alto ruido ("slow") del adaptador Idol Turbo de Speri Labs dentro del denoiser de Idol en precisión completa y lo cuantiza para su uso con mlx-serve en Apple Silicon. No es un modelo de lenguaje: es un componente de un pipeline de visión 3D.

El modelo base, Idol, es de Speri Labs y emplea una arquitectura de difusión con denoiser transformer y adaptadores LoRA de dos expertos (alto y bajo ruido). La versión Turbo documenta una ruta "simple" que usa únicamente el experto de alto ruido durante los 5 pasos de muestreo, reduciendo el coste de inferencia de 50 pasos a 5: aproximadamente 15 segundos en un M3 Max frente a unos 3 minutos del modelo base.

Su relevancia es práctica: permite ejecutar reconstrucción image-to-3D en hardware de consumo Apple (Mac con chip M-series) sin GPU dedicada, con un fichero de solo 447 MB. La ficha corresponde únicamente al denoiser; el resto de componentes (decoders, eliminador de fondo, encoders de imagen) provienen de ddalcu/Idol-MLX-Serve-8bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusion (transformer) con adaptadores LoRA de dos expertos; fusionado a un unico experto de alto ruido |
| Parametros totales | no disponible (fichero del denoiser: 447 MB en 8 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | 8 bits afín (affine), group size 64, solo en capas Linear en bloque |
| Idiomas soportados | no disponible (modelo de imagen a 3D, sin interfaz de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (denoiser.safetensors) + idol-mlx.json con revisiones y SHA-256 |
| Pipeline | image-to-3d |
| Libreria | mlx |
| Tamano del repo | 0.4 GB |
| Hardware objetivo | Apple Silicon (mlx-serve) |

## Arquitectura y entrenamiento

El modelo es un denoiser de difusión que opera sobre representaciones de Gaussian splatting (3DGS). Idol emplea dos expertos LoRA, uno de alto ruido y otro de bajo ruido; Idol Turbo documenta una ruta simplificada que usa solo el experto de alto ruido en los 5 pasos de muestreo. Esta conversión implementa esa ruta: fusiona el experto "slow" de Idol Turbo en el denoiser de Idol en precisión completa mediante la fórmula `W' = W + (128 / 32) · B · A` en cada una de las 112 capas adaptadas, y después cuantiza las capas Linear en bloque a 8 bits afín con group size 64, replicando exactamente el pack de 8 bits publicado.

El proceso de construcción es determinista: los tests de idol-mlx verifican que el cuantizador reproduce el pack de 8 bits publicado y que reconstruir el fichero desde las revisiones registradas en `idol-mlx.json` produce tensores idénticos (los bytes pueden diferir entre versiones de mlx por el layout de los tensores). No se dispone de datos sobre el conjunto de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que la información proporcionada no los incluye.

## Capacidades

- Reconstrucción image-to-3D: convierte una única fotografía en un Gaussian splat 3D.
- Generación de 3DGS en 5 pasos de difusión (frente a los 50 del modelo base), con un tiempo aproximado de 15 s en un M3 Max.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-serve.
- Integración con el CLI idol-mlx (`uvx idol-mlx photo.jpg --view`), que descarga automáticamente este fichero.
- Sustitución directa del denoiser en el pack ddalcu/Idol-MLX-Serve-8bit, completando el pipeline con decoders, eliminador de fondo y encoders de imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Prototipado rápido de assets 3D en Mac: un desarrollador con un MacBook M-series puede generar un splat desde una foto en unos 15 s, sin GPU dedicada, para iterar sobre diseños de personajes u objetos.
- Previsualización en pipelines de e-commerce: generar vistas 3D aproximadas de productos a partir de fotos de catálogo para visores web basados en Gaussian splatting.
- Herramientas creativas locales: integrar idol-mlx en aplicaciones de escritorio para macOS que conviertan fotos en modelos 3D sin enviar datos a la nube, aprovechando la licencia Apache-2.0.
- Investigación en 3DGS: usar el denoiser cuantizado como referencia reproducible (construcción determinista verificada por SHA-256) para comparar recetas de muestreo de 5 pasos frente a 50.
- Automatización por lotes en estaciones de trabajo Apple: procesar colecciones de imágenes en un pipeline por CLI, dado el bajo coste por inferencia (~15 s) y el tamaño reducido del fichero (447 MB).
- Educación y demos: desplegar un servicio local con mlx-serve para mostrar reconstrucción 3D en talleres o clases, sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta datos de latencia: aproximadamente 15 s en un M3 Max con 5 pasos, frente a unos 3 minutos del modelo base de 50 pasos.

## Requisitos de hardware

- VRAM/memoria unificada: el fichero del denoiser ocupa 447 MB en 8 bits; el pipeline completo requiere además los componentes de ddalcu/Idol-MLX-Serve-8bit, cuyo tamaño conjunto no se detalla en la información disponible.
- Hardware objetivo: Apple Silicon (probado en M3 Max). No se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en hardware de consumo Apple (Mac con chip M-series); no se especifican modelos mínimos.
- Despliegue: MLX y mlx-serve; también mediante el CLI idol-mlx. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: ~15 s por imagen en M3 Max con 5 pasos. No se publica throughput para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol-Turbo-MLX-8bit | no disponible (denoiser 447 MB) | no aplica | ~15 s en M3 Max, 5 pasos | Apache-2.0 | Hugging Face, MLX |
| speridlabs/idol (base) | no disponible | no aplica | ~3 min, 50 pasos | Apache-2.0 | Hugging Face |
| speridlabs/idol-turbo | no disponible | no aplica | 5 pasos (ruta Turbo) | Apache-2.0 | Hugging Face |
| ddalcu/Idol-MLX-Serve-8bit | no disponible | no aplica | 8 bits para mlx-serve | no disponible en la informacion | Hugging Face |

La comparativa se limita a variantes del mismo linaje Idol; no se dispone de datos de otros modelos image-to-3D en la información proporcionada.

## Limitaciones y advertencias

- Solo contiene el denoiser: no es un pipeline autónomo; requiere los decoders, el eliminador de fondo y los encoders de imagen de ddalcu/Idol-MLX-Serve-8bit.
- La ruta de 5 pasos con solo el experto de alto ruido produce colores algo más oscuros que la receta completa de dos expertos o que el modelo base de 50 pasos.
- Al ser tratado como Idol plano por mlx-serve, ejecuta Turbo sin soporte de adaptadores.
- Cuantización a 8 bits: puede introducir degradación frente a la precisión completa, aunque la construcción replica el pack publicado.
- Exclusivo de Apple Silicon (MLX); no hay soporte documentado para CUDA ni ROCm.
- No es oficial: no está afiliado a Speri Labs.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al no ser un modelo de lenguaje, estos riesgos no aplican del mismo modo, pero la calidad de reconstrucción 3D depende de la foto de entrada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los componentes del pipeline completo.

## Enlaces

- Hugging Face: https://huggingface.co/cfahlgren1/Idol-Turbo-MLX-8bit
- Modelo base Idol: https://huggingface.co/speridlabs/idol
- Adaptador Idol Turbo: https://huggingface.co/speridlabs/idol-turbo
- Pack MLX completo: https://huggingface.co/ddalcu/Idol-MLX-Serve-8bit
- Repositorio idol-mlx: https://github.com/cfahlgren1/idol-mlx
- mlx-serve: https://github.com/ddalcu/mlx-serve
