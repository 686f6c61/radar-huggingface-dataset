# Egom4rono/sd-class-butterflies-32

## Resumen

`Egom4rono/sd-class-butterflies-32` es un modelo de difusion incondicional de imagenes, entrenado para generar mariposas ("cute butterflies") a resolucion 32x32. Lo publica el usuario Egom4rono en Hugging Face como artefacto del curso Diffusion Models Class de Hugging Face, dentro de la unidad 1, y sigue el flujo de trabajo clasico de `diffusers` con un pipeline `DDPMPipeline`. No es un modelo de lenguaje: es un modelo generativo de imagenes pequeno, de proposito didactico.

El modelo tiene 18.536.323 parametros y un repositorio de aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos ligeros que se pueden entrenar y ejecutar en hardware de consumo. Su interes practico es limitado fuera del ambito educativo: sirve como referencia para entender el ciclo completo de entrenamiento de un UNet de difusion con scheduler DDPM, y como base para experimentar con tecnicas de muestreo, condicionamiento y evaluacion de modelos generativos.

No hay informacion sobre el dataset exacto de entrenamiento mas alla de la referencia implicita al dataset de mariposas usado en el curso, ni sobre numero de pasos de entrenamiento, composicion del dataset o evaluaciones cuantitativas. La model card es minima y no incluye benchmarks ni detalles tecnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (DDPM) para generacion incondicional de imagenes |
| Parametros totales | 18.536.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusion denoising probabilistico (DDPM) clasico, el mismo tipo de arquitectura que se usa en la unidad 1 del curso Diffusion Models Class de Hugging Face. Genera imagenes de 32x32 pixeles de forma incondicional, es decir, sin prompt de texto ni etiqueta de clase: el muestreo parte de ruido gaussiano y el UNet aprende a invertir el proceso de difusion paso a paso. El pipeline asociado es `DDPMPipeline`, que encapsula el scheduler y el UNet en una interfaz de una sola llamada.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset (mas alla de que son mariposas), ni sobre el uso de tecnicas como EMA de pesos, augmentacion o recorte de pasos de difusion. Tampoco hay datos sobre si se aplico alguna forma de guiado o condicionamiento. El nombre `sd-class-butterflies-32` sugiere que sigue la convencion de los modelos de ejemplo del curso (`sd-class-*`), con resolucion 32.

## Capacidades

- Generacion incondicional de imagenes de mariposas a 32x32 pixeles.
- Muestreo con scheduler DDPM a traves de `DDPMPipeline`.
- Entrenamiento reproducible con el flujo estandar de `diffusers` (util para fines didacticos).
- No soporta prompts de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No procesa audio, video ni secuencias; su unica salida son tensores de imagen.
- No incluye modo "thinking" ni ninguna capacidad de instruccion.

## Casos de uso

- Docencia y aprendizaje: usar el modelo como ejemplo minimo y funcional de un pipeline de difusion en `diffusers`, ejecutable en portatil, para explicar el proceso de denoising paso a paso.
- Prototipado de pipelines generativos: servir de base para experimentar con schedulers alternativos (DDIM, Euler, DPM-Solver) y comparar la calidad y velocidad de muestreo en un caso controlado.
- Pruebas de infraestructura de inferencia: al ser tan pequeno (18,5 M de parametros), es util para validar despliegues de `diffusers` en entornos con recursos limitados o en CI.
- Investigacion en evaluacion de modelos generativos: calcular metricas como FID o IS sobre un modelo de referencia de baja resolucion para calibrar metodologias antes de escalar a modelos mayores.
- Generacion de datasets sinteticos de baja resolucion: producir imagenes de mariposas 32x32 para tareas de clasificacion o aumento de datos en experimentos academicos.
- Experimentos de fine-tuning: partir de estos pesos para reentrenar sobre un dataset propio de imagenes pequenas, aprovechando que el coste computacional es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo completo ocupa unos 74 MB en pesos (18,5 M de parametros x 4 bytes), mas el overhead del pipeline y de las activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna, e incluso en CPU con tiempos de muestreo aceptables para 32x32.
- Opciones de despliegue: `diffusers` con PyTorch (via `DDPMPipeline`), integracion en scripts de Python; no hay variantes GGUF ni soporte nativo en llama.cpp u Ollama (no aplica a modelos de imagen).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un muestreo de decenas de pasos en menos de un segundo en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Egom4rono/sd-class-butterflies-32 | 18,5 M | 32x32 | Difusion incondicional | MIT | Hugging Face |
| google/ddpm-cifar10-32 | no disponible en la informacion | 32x32 | Difusion incondicional (CIFAR-10) | no disponible | Hugging Face |
| hf-internal-testing/ddpm-celebahq-256 | no disponible en la informacion | 256x256 | Difusion incondicional (caras) | no disponible | Hugging Face |
| CompVis/ldm-celebahq-256 | no disponible en la informacion | 256x256 | Difusion latente condicionada | no disponible | Hugging Face |

La comparativa se limita a modelos de difusion incondicional de referencia del ecosistema `diffusers`; no se dispone de datos de rendimiento cuantitativo para establecer comparaciones numericas.

## Limitaciones y advertencias

- Modelo de proposito didactico: no esta pensado para produccion ni para generar imagenes de calidad util mas alla de demostraciones.
- Resolucion muy baja (32x32): las imagenes resultantes son muy pequenas y no aptas para uso comercial directo.
- Sesgos: el dataset de mariposas del curso puede contener sesgos de clase, color o especie; no se ha documentado ningun analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero el modelo puede generar imagenes irreconocibles o artefactos propios de un entrenamiento corto.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Sin informacion sobre el dataset exacto ni sobre el proceso de entrenamiento, lo que dificulta evaluar su reproducibilidad.
- No hay variantes cuantizadas ni formatos alternativos publicados; el despliegue esta ligado a `diffusers` y PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/Egom4rono/sd-class-butterflies-32
- Curso Diffusion Models Class (GitHub): https://github.com/huggingface/diffusion-models-class
- Documentacion de `DDPMPipeline` en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
