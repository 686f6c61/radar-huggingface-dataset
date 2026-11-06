# michelmf/sd-class-butterflies-64

## Resumen

`michelmf/sd-class-butterflies-64` es un modelo de difusion de imagenes sin condicionamiento (unconditional image generation) entrenado para generar imagenes de mariposas de estilo "cute". Lo publica el usuario `michelmf` en Hugging Face como parte de la Unidad 1 del curso Diffusion Models Class de Hugging Face, por lo que se trata de un modelo educativo y de demostracion, no de un modelo de produccion.

Arquitectura basada en el pipeline `DDPMPipeline` de la libreria `diffusers` (DDPM, Denoising Diffusion Probabilistic Models), con pesos en formato `safetensors` y un total de 113.673.219 parametros. El repositorio ocupa aproximadamente 0,5 GB y la resolucion de trabajo es de 64x64 pixeles, segun indica el nombre del modelo.

Su relevancia es acotada: sirve como ejemplo minimo reproducible de entrenamiento de un modelo de difusion desde cero sobre un dataset pequeno y monodominio (mariposas), util para aprender el flujo de trabajo de `diffusers` y para experimentar con generacion incondicional a baja resolucion. No dispone de descargas ni interacciones registradas y no se ha publicado informacion sobre benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (Denoising Diffusion Probabilistic Model), pipeline `DDPMPipeline` de diffusers |
| Parametros totales | 113.673.219 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en `safetensors` de precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo incondicional, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers, backend PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue el esquema DDPM clasico: un proceso directo de difusion que anade ruido gaussiano a las imagenes durante un numero fijo de pasos y una red neuronal que aprende a revertir ese proceso paso a paso. La inferencia se realiza con `DDPMPipeline`, que aplica el sampler de denoising correspondiente configurado en el repositorio. La resolucion de generacion es de 64x64 pixeles, coherente con el sufijo `-64` del nombre.

El entrenamiento se enmarca en la Unidad 1 del curso Diffusion Models Class de Hugging Face, orientado a entrenar un modelo de difusion incondicional sobre un dataset de mariposas. La model card no detalla el numero de tokens, la composicion exacta del dataset, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de refinamiento (RLHF, DPO u otras). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de imagenes incondicionales de mariposas a 64x64 pixeles.
- No acepta prompts de texto ni imagenes de entrada: la generacion es puramente aleatoria a partir de ruido.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo "thinking", vision, audio ni otras capacidades especiales.
- Integracion directa con la libreria `diffusers` mediante `DDPMPipeline.from_pretrained`.

## Casos de uso

- Aprendizaje del flujo de entrenamiento de difusion: sirve como referencia reproducible para entender como se entrena un DDPM desde cero con `diffusers`, incluyendo la configuracion del `UNet2DModel` y del scheduler.
- Experimentacion con samplers: al ser un modelo pequeno (113 M de parametros) y de baja resolucion, permite comparar schedulers (DDPM, DDIM, PNDM, etc.) y numero de pasos de inferencia con bajo coste computacional.
- Pruebas de pipelines de generacion en CI: su tamano reducido (0,5 GB de repo) lo hace adecuado para tests de integracion que verifiquen que `DDPMPipeline` carga y genera correctamente en un entorno concreto.
- Docencia y talleres: ejemplo minimo para explicar el proceso de difusion directa e inversa sin la complejidad de un modelo texto-a-imagen.
- Generacion de assets decorativos de mariposas a baja resolucion: util para prototipos o demos donde se necesiten imagenes pequenas de mariposas sin requisitos de calidad fotografica.
- Base para fine-tuning en dominios acotados: punto de partida para experimentar con ajuste fino sobre otros datasets de imagenes de 64x64 con una sola clase o dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 para 113 M de parametros (los pesos ocupan aproximadamente 0,45 GB); en fp16 o bf16 se reduce a unos 0,23 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en GTX 1060, RTX 2060, RTX 3060, RTX 4090 o superiores.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 1-2 GB de VRAM; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: `diffusers` con PyTorch (via `DDPMPipeline`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagenes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `michelmf/sd-class-butterflies-64` | 113,7 M | 64x64 | Ninguno (incondicional) | MIT | Hugging Face |
| `google/ddpm-cifar10-32` | no disponible en la informacion | 32x32 | Ninguno (incondicional) | no disponible en la informacion | Hugging Face |
| `huggingface/diffusers-models` (ejemplos del curso) | no disponible en la informacion | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a la categoria (modelos de difusion incondicional de baja resolucion para fines educativos).

## Limitaciones y advertencias

- Modelo educativo: entrenado en el contexto de un curso, sin garantias de calidad, diversidad ni estabilidad en la generacion.
- Dominio muy restringido: solo genera mariposas de estilo "cute" a 64x64; no generaliza a otras categorias de imagen.
- Sin condicionamiento: no se puede controlar la salida mediante texto, clase ni imagen de referencia.
- Posibles sesgos del dataset de entrenamiento: al no documentarse la composicion del dataset, se desconocen sesgos de representacion (especies, colores, estilos).
- Riesgo de artefactos y baja fidelidad: la resolucion de 64x64 y el tamano reducido implican imagenes con detalle limitado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia del dataset de entrenamiento antes de un uso comercial.
- Sin mantenimiento documentado: el repositorio no registra descargas ni interacciones, y la model card es minima; no hay informacion sobre versiones, evaluaciones ni actualizaciones.
- No apto para produccion: no se han publicado metricas (FID, IS u otras) que permitan evaluar su calidad objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michelmf/sd-class-butterflies-64
- Curso Diffusion Models Class (Unidad 1): https://github.com/huggingface/diffusion-models-class
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
