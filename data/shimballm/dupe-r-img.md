# ShimbaLLM/Dupe-R-IMG

## Resumen

Dupe-R-IMG es un empaquetado de pesos para generacion de imagenes texto-a-imagen publicado por ShimbaLLM (Shimba-AI) bajo licencia Apache 2.0. No es un modelo entrenado desde cero ni una mezcla de pesos: es un reempaquetado de tres componentes preexistentes en un unico `model.safetensors`, con todos los tensores copiados sin modificar y renombrados con prefijos de espacio de nombres (`dit.*`, `text_encoder.*`, `vae.*`). Concretamente combina el denoiser SupraDiT de SupraLabs/Supra2-IMG (104.193.168 parametros), el encoder de texto flan-t5-base de Google (109.628.544 parametros) y el VAE sd-vae-ft-mse de Stability AI (83.653.863 parametros).

El modelo resuelve el problema de despliegue de un pipeline de difusion completo en un solo fichero portable, evitando tener que resolver tres repositorios distintos y sus dependencias. La arquitectura es un transformer de difusion (DiT) con 14 bloques, `d_model` 576 y patch de tamano 2, entrenado contra exactamente esos dos encoders, por lo que mezclarlos por media de pesos romperia el modelo. Genera imagenes de 256x256 px a partir de prompts de texto, con un espacio latente de 4x32x32 y un muestreador de flujo rectificado (rectified flow).

Es relevante ahora por su tamano reducido: 297 millones de parametros y unos 567 MB en `safetensors`, con una variante `.himg` de 417 MB que se carga por `mmap` con `PROT_READ` y cero copia, lo que permite ejecutarlo sin coste de RAM residente. El repositorio no tiene descargas ni likes en el momento de la consulta y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) + encoder de texto T5 + VAE; muestreo por rectified flow |
| Parametros totales | 297.377.143 (safetensors real); la model card declara 297.475.575 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (flan-t5-base) |
| Tipos de cuantizacion | No disponible. Pesos almacenados en float16, computo en float32 (upcast al cargar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (bundle). Componentes: DiT apache-2.0 (SupraLabs), T5 encoder apache-2.0 (Google), VAE mit (Stability AI) |
| Formato de pesos | safetensors (`model.safetensors`, ~567 MB), `.himg` (~417 MB, mmap), `model_final_ema.pt` (bf16, ~416 MB) |

| Especificacion adicional | Valor |
|---|---|
| Resolucion | 256x256 |
| Latente | 4 x 32 x 32 |
| Muestreador | rectified flow, Euler (Heun soportado) |
| Pasos por defecto / CFG | 50 / 3.0 |
| Escala latente | 0.18215 |
| Bloques DiT | 14, `d_model` 576, patch 2 |
| Tamano del repo | 1,4 GB |
| Creado / actualizado | 2026-10-11 |

## Arquitectura y entrenamiento

Dupe-R-IMG no se ha entrenado: es un reempaquetado de pesos. El denoiser es SupraDiT, un transformer de difusion de 14 bloques con `d_model` 576 y patch de tamano 2, procedente de SupraLabs/Supra2-IMG. El encoder de texto es el stack encoder de flan-t5-base, que incluye el embedding compartido `shared.weight`. El decodificador es un `AutoencoderKL` completo de sd-vae-ft-mse. El total declarado de parametros se reparte asi: 104.193.168 (DiT), 109.628.544 (encoder T5) y 83.653.863 (VAE).

Un detalle tecnico importante es que el DiT se entreno contra exactamente estos dos encoders, por lo que el autor advierte explicitamente de que promediar pesos con otras variantes lo romperia. No se incluyen en el bundle el stack `decoder.*` de T5 (113M) ni `lm_head.weight` (24,7M), porque el flujo texto-a-imagen nunca ejecuta la mitad seq2seq. Todos los tensores se copian sin modificar y se renombran con prefijos. En cuanto a precision, los pesos se almacenan en float16 pero el computo se hace en float32 mediante upcast al cargar; segun el autor, una comparacion del nucleo en C contra una referencia de PyTorch desde este mismo fichero sigue coincidiendo a 1e-6, mientras que la paridad frente al checkpoint original se mueve en torno a 1e-3. Para paridad de bits exacta en float32 existe la variante `.himg`. No hay informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF o DPO, ya que el modelo solo redistribuye componentes ya entrenados por terceros.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) a 256x256 px.
- Muestreo con flujo rectificado: muestreador Euler por defecto, con soporte de Heun.
- Control de la generacion mediante `CFG` (guidance scale), con valor por defecto 3.0, y numero de pasos configurable (50 por defecto).
- Codificacion y decodificacion latente mediante el VAE `sd-vae-ft-mse` a escala 0.18215.
- Carga en un solo fichero, con extraccion modular por prefijo (`dit.`, `text_encoder.`, `vae.`).
- Carga por `mmap` con cero copia a traves del formato `.himg` para entornos con memoria ajustada.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de soporte declarado de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas soportados.
- No se declaran capacidades de vision de entrada, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Generacion de iconos y avatares de baja resolucion: con salida de 256x256 y 297M de parametros, es adecuado para producir assets pequenos (favicons, avatares, sprites) en lotes grandes, incluso en CPU o GPUs integradas.
- Prototipado rapido de pipelines de difusion: al empaquetar DiT, encoder y VAE en un unico `safetensors` con espacios de nombres claros, sirve para validar arquitecturas DiT y flujos rectificados sin resolver tres repositorios distintos.
- Pruebas de integracion y CI: la carga modular por prefijo y la paridad float32 permiten montar tests de regresion numerica comparando la salida contra una referencia de PyTorch a 1e-6.
- Despliegue en entornos con memoria muy limitada: la variante `.himg` con `mmap` y carga sin copia permite incorporar el modelo en dispositivos con RAM restringida sin coste de memoria residente.
- Pruebas de investigacion sobre muestreo: el soporte de Euler y Heun con parametros de pasos y CFG configurables facilita experimentos comparativos sobre calidad frente a coste computacional en 256x256.
- Generacion de datasets sinteticos de imagenes pequenas: la ausencia de coste elevado de computo permite producir grandes volumenes de imagenes etiquetadas para tareas de aumento de datos o preentrenamiento.
- Educacion y demostraciones: su tamano reducido (unos 567 MB) permite montarlo en cuadernos y demos interactivas sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan unos 567 MB en `safetensors` (float16 en disco); al hacer upcast a float32 para el computo, el peso efectivo ronda 1,19 GB, mas activaciones y el coste del VAE a 256x256.
- Variante `.himg`: 417 MB con carga por `mmap` y cero copia, sin RAM residente adicional para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente dado el tamano; se puede ejecutar tambien en CPU. No aplican requisitos de A100 ni H100 para un modelo de 297M.
- Cabe holgadamente en GPUs consumer (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas o CPU con memoria suficiente.
- Opciones de despliegue: `transformers` con definiciones de modulo propias (el SupraDiT no es una clase estandar) y `diffusers` para el `AutoencoderKL`; el pipeline completo requiere el notebook que produjo la release, ya que no se incluyen las definiciones de SupraDiT en el repositorio mas alla de `config.json`. No es compatible directamente con vLLM, Ollama, llama.cpp ni TGI, que estan orientados a modelos de lenguaje o a pipelines estandar de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales frente a otros modelos abiertos de texto-a-imagen ampliamente conocidos; los valores de modelos de terceros son de conocimiento general y pueden variar segun la fuente.

| Modelo | Parametros (denoiser aprox.) | Resolucion | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dupe-R-IMG | 104M (DiT) + 193M (encoder+VAE) | 256x256 | 128 tokens | Apache 2.0 (bundle) | HuggingFace (0 descargas) |
| SD 1.5 | ~860M (UNet) | 512x512 | 77 tokens | CreativeML OpenRAIL-M | Amplia |
| SDXL | ~2.600M (UNet) | 1024x1024 | 77 tokens | CreativeML OpenRAIL++-M | Amplia |
| Flux.1-schnell | ~12.000M | 1024x1024 | no disponible | Apache 2.0 | Amplia |

Datos de benchmarks comparativos: no disponibles.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo nuevo: su calidad queda acotada por la del DiT Supra2-IMG original, sobre el que no se aportan metricas en el repositorio.
- La resolucion de salida es de solo 256x256 px, muy inferior a los 512 o 1024 px de los modelos abiertos actuales, lo que limita su uso en produccion para contenido de calidad.
- La ventana de contexto de texto es de 128 tokens, inferior a los 77 tokens de SD 1.5 en la practica y muy corta para prompts largos; los prompts extensos se truncaran.
- No se declaran idiomas soportados; el encoder es flan-t5-base, orientado a ingles, por lo que se espera un rendimiento degradado en castellano u otros idiomas.
- Riesgo de alucinacion y de fallo en la composicion: al ser un modelo pequeno y de baja resolucion, es probable que genere estructuras incoherentes, texto ilegible y desviaciones respecto al prompt. No se han publicado evaluaciones que lo cuantifiquen.
- Sesgos: no se documentan sesgos conocidos ni el dataset de entrenamiento, lo que impide evaluar sesgos de generacion.
- Restricciones de licencia: el bundle se distribuye como Apache 2.0, pero cada componente conserva su propia licencia (DiT apache-2.0, T5 apache-2.0, VAE MIT). Todas permiten redistribucion, tambien combinada, segun el autor. Conviene verificar la procedencia de Supra2-IMG para uso comercial.
- Integracion: no hay una clase de pipeline estandar publicada; se requiere reconstruir los modulos SupraDiT a partir de `config.json` y del notebook de la release, lo que anade friccion y riesgo de error en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte evidentes.
- Fechas de creacion y actualizacion anotadas como 2026-10-11, lo que dificulta situar la version del modelo en el tiempo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ShimbaLLM/Dupe-R-IMG
- Perfil de la organizacion ShimbaLLM (Shimba-AI): https://huggingface.co/ShimbaLLM
- Space Shifu Smart Demo: https://huggingface.co/spaces/ShimbaLLM/shifu-smart-demo
- Denoiser de origen Supra2-IMG: https://huggingface.co/SupraLabs/Supra2-IMG
- Encoder de texto de origen flan-t5-base: https://huggingface.co/google/flan-t5-base
- VAE de origen sd-vae-ft-mse: https://huggingface.co/stabilityai/sd-vae-ft-mse
