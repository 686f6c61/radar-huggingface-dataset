# orlecampos/realistic-face-krea2

## Resumen

Realistic Face — Krea 2 (v1.0) es un adaptador LoRA de tipo *face* para el modelo base Krea 2, orientado a la generación de retratos fotorrealistas. Lo publica el usuario orlecampos en un repositorio de Hugging Face marcado como privado, pero cuyo contenido proviene de un LoRA de pago de terceros desarrollado por UltraMuse y distribuido a través de Civitai. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un peso adicional de 1,6 GB en precisión bf16 que se carga sobre el UNet de Krea 2 para sesgar la generación hacia caras realistas.

El adaptador está pensado para el ecosistema ComfyUI y se ha validado con el checkpoint turbo de Krea 2 en fp8. Las muestras del autor emplean un régimen de 8 pasos con CFG 1.0 y sin prompt negativo, lo que sitúa el flujo de trabajo en la franja de difusión rápida (turbo/distilada) más que en la generación clásica de 20-50 pasos. La resolución de referencia es 1440x1920, formato vertical adecuado para retrato.

La relevancia de esta ficha es limitada pero ilustrativa: documenta un caso de LoRA privado con licencia no declarada, trigger word propio (`re4lf4ce`) y dependencia estricta de un base propietario (Krea 2). Para un desarrollador o investigador, el interés está en entender el patrón de adaptadores de identidad/rostro sobre modelos de difusión modernos y en las restricciones legales que arrastra su distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de difusion del base Krea 2 |
| Parametros totales | no disponible (peso de 1.562.410.408 bytes en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de texto) |
| Tipos de cuantizacion | bf16 en el archivo original; el base se usa en fp8 scaled (krea2_turbo_fp8_scaled) |
| Idiomas soportados | no disponible (los prompts de referencia estan en ingles) |
| Licencia | other (licencia comercial no declarada por el autor original) |
| Formato de pesos | safetensors (Realistic-Face-Krea-2-V1.safetensors) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un par de matrices de bajo rango inyectadas en las capas del UNet de Krea 2. No se especifica en la información disponible sobre qué capas se aplica el adaptador, ni el rango, ni el alpha, ni la tasa de aprendizaje o el número de pasos de entrenamiento. El autor original (UltraMuse) no publica la composición del dataset; solo se indica que el objetivo es el realismo facial y que el adaptador se activa mediante la trigger word `re4lf4ce`.

El flujo de referencia documentado en la model card usa el UNet `krea2_turbo_fp8_scaled.safetensors`, el text encoder `t5xxl_fp8_e4m3fn_scaled.safetensors` con tipo `krea2` y el VAE `ae.safetensors`. El sampler es `euler` con `sgm_uniform`, 8 pasos, CFG 1.0 y denoise 1.0. La fuerza del LoRA sugerida es 0.85, aunque el propio autor aclara que es un punto de partida y no un valor validado por UltraMuse. Con CFG 1.0 el prompt negativo pierde efecto, de modo que todo el control semántico recae en el prompt positivo, descrito como prosa forense en inglés de 450-600 palabras.

## Capacidades

- Generación de retratos fotorrealistas sobre el base Krea 2, con sesgo específico hacia rasgos faciales.
- Activación mediante trigger word `re4lf4ce`, que debe encabezar el prompt.
- Compatible con el régimen turbo del base: 8 pasos, CFG 1.0, sin prompt negativo.
- Resolución de trabajo documentada de 1440x1920 (vertical).
- Integración en ComfyUI mediante `LoraLoaderModelOnly`, con fuerza ajustable (0.85 como valor de partida).
- Control semántico exclusivamente por prompt positivo en inglés, en formato de prosa descriptiva larga.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto: es un adaptador de imagen.
- Capacidades multilingües: no disponibles; las muestras del autor usan inglés.

## Casos de uso

- Generación de retratos para prototipado de producto: el LoRA sesga el base Krea 2 hacia caras realistas en 8 pasos, lo que permite iterar bocetos de personaje a 1440x1920 en pocos segundos por imagen en GPU de gama alta.
- Pruebas de concepto de identidad visual en estudios pequeños: con la trigger word `re4lf4ce` y una fuerza de 0.85 se obtiene un estilo facial consistente entre imágenes, útil para *moodboards* internos.
- Evaluación comparativa de adaptadores de rostro: sirve como referencia para medir cómo un LoRA de terceros modifica el comportamiento del base Krea 2 frente a otros adaptadores de la misma categoría.
- Investigación sobre prompts largos en difusión: el régimen CFG 1.0 con prosa forense de 450-600 palabras es un caso interesante para estudiar la influencia del prompt positivo cuando el negativo es irrelevante.
- Integración en pipelines ComfyUI de uso interno: el grafo documentado (UNETLoader, LoraLoaderModelOnly, CLIPLoader, VAELoader, KSampler) se puede reproducir tal cual para automatizar lotes de retratos.
- Docencia y formación técnica: útil para explicar la diferencia entre checkpoint, LoRA y trigger word, y el impacto de la fuerza del adaptador en la salida.
- No es adecuado para uso comercial sin autorización expresa, dado que la licencia comercial no está declarada por el autor original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud facial) ni comparaciones cuantitativas con otros LoRA de rostro.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El LoRA en sí ocupa 1,6 GB, pero la inferencia requiere cargar el UNet de Krea 2 en fp8, el text encoder T5-XXL en fp8 y el VAE, por lo que el consumo real depende del base y no solo del adaptador.
- GPU recomendadas: no disponibles en la información proporcionada. El base Krea 2 en fp8 y el T5-XXL en fp8 sugieren GPU con 24 GB o más para trabajar con holgura a 1440x1920.
- Cabeza en GPU de consumo: no confirmado. Un adaptador de 1,6 GB es pequeño, pero el conjunto UNet + T5-XXL + VAE en fp8 probablemente excede los 16 GB, por lo que una RTX 4090 (24 GB) es el mínimo razonable dentro de consumo.
- Opciones de despliegue: ComfyUI es el entorno documentado por el autor (grafo de referencia con `UNETLoader`, `LoraLoaderModelOnly`, `CLIPLoader`, `VAELoader`, `KSampler`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. Con 8 pasos y CFG 1.0 el régimen es turbo, pero no se publican tiempos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Realistic Face — Krea 2 (v1.0) | LoRA de rostro | Krea 2 | no disponible (1,6 GB bf16) | no aplica | other (comercial no declarada) | repo privado en HF, original de pago en Civitai |
| Otros LoRA de rostro para Krea 2 | LoRA de rostro | Krea 2 | no disponible | no aplica | variable | no disponible |
| LoRA de rostro para Flux.1 | LoRA de rostro | Flux.1 | no disponible | no aplica | variable | ecosistema abierto en Civitai/HF |
| LoRA de rostro para SDXL | LoRA de rostro | SDXL | no disponible | no aplica | variable | amplia disponibilidad en Civitai/HF |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas. La comparación relevante es estructural: este adaptador depende de un base propietario (Krea 2), su licencia comercial no está declarada y su distribución está restringida por el autor original, a diferencia de muchos LoRA de rostro para SDXL o Flux.1 con licencias más explícitas.

## Limitaciones y advertencias

- Licencia comercial no declarada por el autor original (UltraMuse): no debe usarse en piezas comerciales sin consultarle expresamente.
- El repositorio es privado por decisión del publicador; el archivo pertenece al autor original y la compra otorga derecho de uso, no de redistribución.
- Riesgo de alucinación y artefactos faciales: como todo LoRA de identidad, puede producir rasgos inconsistentes entre imágenes, especialmente con fuerza distinta de la sugerida (0.85).
- Dependencia estricta del base Krea 2 y de su variante turbo en fp8; no es portable a otros modelos de difusión.
- El prompt de referencia está en inglés y en formato de prosa forense larga; no hay evidencia de soporte multilingüe.
- Con CFG 1.0 el prompt negativo es irrelevante, lo que limita el control fino sobre lo que se quiere evitar en la imagen.
- No hay benchmarks públicos ni validación independiente del adaptador.
- El tamaño del repo (1,6 GB) corresponde solo al LoRA; el coste real de inferencia incluye el base, el text encoder y el VAE.
- Fecha de creación y actualización del repositorio (2026-11-10) posterior a la fecha de esta ficha; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/orlecampos/realistic-face-krea2
- Página original del autor en Civitai: https://civitai.com/models/2999484/realistic-face
