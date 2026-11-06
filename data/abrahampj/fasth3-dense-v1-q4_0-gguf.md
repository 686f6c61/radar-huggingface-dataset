# AbrahamPJ/fasth3-dense-v1-q4_0-gguf

## Resumen

Este repositorio contiene una cuantización en formato GGUF (Q4_0) del denoiser de MiniMax H3, destilado a cuatro pasos de muestreo por el equipo de FastVideo (FastH3 Preview v1, variante Dense, destilación data-free). El autor, AbrahamPJ, lo ha preparado específicamente para ejecutar generación de imagen y vídeo en dispositivos Android mediante el NPU Hexagon, como parte del proyecto Nightmare Mobile, una aplicación de generación on-device.

La relevancia de esta ficha radica en que se trata de una versión modificada y requantizada, no de un lanzamiento oficial: el archivo parte del GGUF Q4_K_M de Gestura y se requantiza a Q4_0 porque los kernels del NPU Hexagon solo admiten esa variante. Con unos 20.100 millones de parámetros en el modelo base y un tamaño de archivo de 11,6 GB, permite llevar un modelo de difusión de vídeo de gama alta a hardware móvil, sustituyendo el codificador de texto original de 32B por Qwen3-VL-4B con una proyección alternativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusión basado en MiniMax H3 (text-to-video, con VAE de vídeo y de audio) |
| Parametros totales | 20.116.279.777 (dato del modelo base en safetensors) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (requantizado desde Q4_K_M; tensores F32 y tabla de curva AdaLN sin modificar) |
| Idiomas soportados | no disponible (los prompts estructurados de H3 usan inglés en las etiquetas `<d>[English] ...</d>`) |
| Licencia | MiniMax H3 Community License (other), Copyright © 2026 MiniMax |
| Formato de pesos | GGUF (archivo único `fasth3_dense_v1_euler4_q4_0.gguf`, 11.583.540.608 bytes) |

## Arquitectura y entrenamiento

El modelo base es MiniMax H3, un sistema generativo de vídeo de MiniMaxAI cuyo denoiser ha sido destilado por FastVideo a cuatro pasos de muestreo (FastH3 4-step Preview v1, variante Dense, con destilación data-free, es decir, sin necesidad de datos adicionales de entrenamiento para la destilación). El muestreo recomendado emplea cuatro pasos de Euler con la tabla `gestura.adaln.timesteps`, shift 12 para vídeo y 3 para audio, y CFG 1, lo que indica que la destilación elimina la necesidad de guidance clásico.

Esta versión concreta no añade entrenamiento nuevo: es una requantización del GGUF Q4_K_M de Gestura a Q4_0, conservando intactos los tensores F32 y la tabla de curva AdaLN. Según el autor, medido en la CPU del teléfono con la misma semilla y prompt, la salida Q4_0 no es más blanda (no pierde calidad apreciable) que la Q4_K_M. En la aplicación Nightmare Mobile, el codificador de texto de 32B de H3 se sustituye por Qwen3-VL-4B junto con la proyección ClipProj de NicoLab28, y el modelo espera el formato de prompt estructurado propio de H3 (definiciones de sujeto, resumen, descripción detallada con habla, paisaje sonoro y música).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el denoiser destilado de MiniMax H3 en cuatro pasos.
- Generación de audio asociado al vídeo, gracias al uso conjunto del VAE de vídeo y del VAE de audio de H3 (paisaje sonoro y música mediante el prompt estructurado).
- Generación de imágenes además de vídeo, según el alcance declarado de la aplicación Nightmare Mobile.
- Comprensión visual del prompt mediante Qwen3-VL-4B como codificador de texto (con proyección ClipProj), en lugar del codificador de 32B original.
- Ejecución on-device en Android vía NPU Hexagon, con kernels Q4_0.
- Soporte de prompts estructurados de H3: definiciones de sujetos, resumen, descripción detallada con habla `<d>[English] ...</d>`, soundscape y música.

No hay indicios de capacidades de tool calling, agentes o razonamiento multi-paso: se trata de un modelo generativo de difusión, no de un LLM.

## Casos de uso

- Generación de vídeo on-device en Android: el caso de uso principal; el formato Q4_0 permite ejecutar el denoiser en el NPU Hexagon de teléfonos Qualcomm sin depender de la nube, útil para privacidad y funcionamiento sin conexión.
- Prototipado de apps de generación multimedia móvil: los desarrolladores pueden integrar este GGUF en aplicaciones Android propias siguiendo el enfoque de Nightmare Mobile, con inferencia en cuatro pasos que reduce drásticamente el tiempo de generación frente a los decenas de pasos habituales.
- Creación de clips de vídeo con audio sincronizado: al usar los VAE de vídeo y audio de H3, se pueden generar escenas con paisaje sonoro y música descritos en el prompt estructurado.
- Pruebas de degradación por cuantización: al existir la versión Q4_K_M de Gestura y esta Q4_0 con la misma semilla, es un banco de pruebas útil para evaluar el impacto real de cuantizaciones agresivas en difusión.
- Generación de contenido con habla sintetizada en vídeo: el prompt estructurado admite descripciones de diálogo (`<d>[English] ...</d>`), lo que permite clips con personajes que hablan.
- Experimentación con codificadores de texto ligeros: la sustitución del codificador de 32B por Qwen3-VL-4B con ClipProj sirve como referencia para reducir requisitos de memoria en pipelines de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento cualitativo es la comparación del autor entre Q4_0 y Q4_K_M a igualdad de semilla y prompt en la CPU del teléfono, sin métricas numéricas publicadas.

## Requisitos de hardware

- El archivo GGUF pesa 11,6 GB (11.583.540.608 bytes); se necesita al menos esa memoria disponible para alojar el denoiser, además del VAE de vídeo, el VAE de audio y el codificador de texto Qwen3-VL-4B con su proyección.
- Destino principal: móviles Android con NPU Hexagon (Qualcomm), que ejecuta kernels Q4_0; el autor reporta mediciones también en la CPU del teléfono.
- En escritorio, un GGUF de ~11,6 GB cabe en GPUs de consumo con 12-16 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090), aunque el formato y el pipeline están orientados al despliegue móvil y no se documenta compatibilidad con stacks de escritorio concretos.
- Despliegue: mediante la aplicación Nightmare Mobile (https://github.com/AbrahamPaulJ/nightmare-mobile). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería asociada en Hugging Face es `minimax-h3`.
- Latencia y throughput: no disponible; solo se indica que la inferencia requiere cuatro pasos de Euler, lo que implica un número de evaluaciones del denoiser muy reducido frente a muestreos convencionales.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbrahamPJ/fasth3-dense-v1-q4_0-gguf (esta ficha) | ~20,1B (base) | GGUF Q4_0 | 4 (Euler, CFG 1) | MiniMax H3 Community | Público en Hugging Face |
| ZawShiShawn/Gestura-FastH3-GGUF | ~20,1B (base) | GGUF Q4_K_M | 4 | MiniMax H3 Community | Público en Hugging Face |
| FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree | ~20,1B | safetensors (sin cuantizar) | 4 | MiniMax H3 Community | Público en Hugging Face |

Las tres variantes comparten el mismo denoiser destilado de MiniMax H3; la diferencia está en el formato (safetensors frente a GGUF), el nivel de cuantización y la orientación al despliegue (NPU móvil en el caso de esta ficha).

## Limitaciones y advertencias

- Es un archivo modificado por un tercero, no un lanzamiento oficial de MiniMax, FastVideo o Gestura; los tres desautorizan cualquier respaldo según la model card.
- La licencia MiniMax H3 Community está limitada a su "Applicable Territory" (territorio aplicable): es obligatorio leer el acuerdo LICENSE y NOTICE antes de cualquier uso, especialmente comercial. No se detallan en la ficha las condiciones concretas de uso comercial.
- La cuantización Q4_0 es agresiva; aunque el autor no observa pérdida de calidad frente a Q4_K_M en sus pruebas, la evaluación es anecdótica (una semilla, un prompt, CPU del teléfono) y no sustituye una validación propia.
- El modelo depende del prompt estructurado de H3 (sujeto, resumen, descripción con habla, soundscape, música); prompts en formato libre pueden degradar los resultados.
- El codificador de texto original de 32B se sustituye por Qwen3-VL-4B con proyección ClipProj, lo que puede alterar la fidelidad de seguimiento del prompt respecto al pipeline completo de MiniMax.
- Los idiomas soportados no están documentados; las etiquetas de habla del prompt estructurado usan inglés.
- No hay benchmarks publicados ni métricas de latencia, por lo que el rendimiento en dispositivos concretos debe medirse caso por caso.
- Riesgo de alucinación y sesgos: no disponible; al tratarse de un modelo generativo de vídeo, aplican los riesgos habituales de contenido sintético (deepfakes, desinformación), sin que la ficha detalle mitigaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AbrahamPJ/fasth3-dense-v1-q4_0-gguf
- Modelo base (destilación de FastVideo): https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree
- Modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GGUF Q4_K_M de origen (Gestura): https://huggingface.co/ZawShiShawn/Gestura-FastH3-GGUF
- Proyección ClipProj para el codificador de texto: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Aplicación Nightmare Mobile (despliegue en Android): https://github.com/AbrahamPaulJ/nightmare-mobile
