# lvladikov/Krea2-Turbo-Distill-3step-LoRA

## Resumen

Krea2-Turbo-Distill-3step-LoRA es un adaptador LoRA de destilación de pasos para el modelo de texto a imagen Krea 2 Turbo, desarrollado por el usuario lvladikov. Su función es reducir el número de pasos de denoising necesarios para generar una imagen: lleva al modelo base de 8 pasos a 3, manteniendo —y según el autor, superando— el nivel de detalle fino del modelo profesor. Se trata de un adaptador, no de un modelo autónomo, y requiere cargar Krea 2 Turbo como base.

El adaptador emplea una estrategia de *distribution matching* (coincidencia de distribuciones) en lugar de imitación directa de trayectorias, con ocho críticos entrenados sobre características internas del modelo base congelado. Está entrenado sobre aproximadamente 30.000 trayectorias grabadas del profesor y 66.000 muestras de entrenamiento, partiendo de los pesos del LoRA de 4 pasos del mismo autor. El resultado es un LoRA de rango 64 sobre 228 módulos, compatible con diffusers, ComfyUI y MLX sin nodos ni samplers personalizados.

Es relevante ahora porque la reducción del coste de inferencia en modelos de difusión es un cuello de botella práctico en producción: pasar de 8 a 3 pasos supone un ahorro de tiempo de denoising de 2,6× (de 65,4 s a 24,9 s a 1024×1024 en float16), lo que abarata sustancialmente el despliegue de generación de imágenes de alta resolución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea 2 Turbo |
| Parámetros totales | no disponible (rango 64 sobre 228 módulos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantización | no disponible (pesos en safetensors; el modelo base se usa en float16/bfloat16) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; idiomas no declarados) |
| Licencia | krea-2-community-license (Other) |
| Formato de pesos | safetensors (dos variantes: claves diffusers y claves ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre 228 módulos del modelo base Krea 2 Turbo, con la misma forma que los adaptadores de 4 y 2 pasos del mismo autor. No introduce arquitectura nueva: se acopla al transformer de difusión existente y se usa con el sampler Euler estándar y CFG 1 (sin guía, `guidance_scale=0.0` en diffusers), sobre las sigmas propias de 3 pasos de Turbo: `[1.0, 0.8633, 0.6123]`.

El entrenamiento se basa en *distribution matching*: en lugar de imitar la trayectoria exacta del profesor, el estudiante aprende a producir lo que el profesor generaría plausiblemente, lo que evita el promediado que causa desenfoque y bordes duplicados. Se emplean ocho críticos (artefactos, fotografías reales, disposición de la primera llamada, contenido, acuerdo con el prompt, rotulación, caras grandes y el rollout completo de tres llamadas), cada uno como una pequeña cabeza sobre características de la red intermedia del modelo base congelado. Se usaron unas 30.000 trayectorias grabadas del profesor (8 pasos, 11 resoluciones, tres muestras por paso, ~90.000 en total) y 66.000 muestras de entrenamiento, partiendo de los pesos del LoRA de 4 pasos. El entrenamiento se realizó en una sola GPU H100/H200 durante aproximadamente 161 horas, con un proceso de asentamiento de pesos (últimas 600 muestras con learning rate a cero) para publicar los pesos en reposo. Se cubren 11 resoluciones de entrenamiento, de 512×768 a 1440×1440 y 1824×1024.

## Capacidades

- Generación de imágenes texto a imagen con el modelo base Krea 2 Turbo, reduciendo el denoising de 8 a 3 pasos.
- Mayor detalle fino que el profesor en las 22 prompts de prueba: textura fina 1,26×, bandas de 16 y 8 píxeles 1,27× y 1,23×; color al nivel del profesor.
- Funcionamiento *drop-in*: LoRA estándar con sampler Euler estándar, sin nodos ni samplers personalizados.
- Compatibilidad con diffusers, ComfyUI y MLX (Apple Silicon, mediante el nodo personalizado LVNodes del autor).
- Soporte de 11 resoluciones de entrenamiento, incluyendo 1824×1024.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking (no aplica a un modelo de difusión).

## Casos de uso

- Generación de imágenes en producción a alta resolución: con 3 pasos en lugar de 8, el coste de denoising cae a 24,9 s frente a 65,4 s a 1024×1024, lo que permite servir más peticiones por GPU en pipelines de generación por lotes.
- Previsualización rápida en herramientas creativas: útil para iterar sobre prompts y composiciones con latencia baja antes de un render final de mayor calidad.
- Integración en ComfyUI para flujos de trabajo de estudio: el repositorio incluye un workflow listo con nodos estándar (`krea2_turbo_3step_lora_t2i.json`), adecuado para artistas técnicos que ya trabajan en ComfyUI.
- Despliegue en Apple Silicon: el workflow MLX con LVNodes permite ejecutar el adaptador en equipos Mac, ampliando el acceso a equipos sin GPU NVIDIA.
- Generación de material gráfico con detalle fino: la mejora en textura y bandas de alta frecuencia lo hace adecuado para imágenes donde el detalle (telas, superficies, rostros grandes) es crítico.
- Prototipado de investigación en destilación de pasos: sirve como referencia reproducible de *distribution matching* con críticos múltiples para estudiar reducción de pasos en modelos de difusión.

## Benchmarks y rendimiento

Datos aportados por el autor en la model card (22 prompts de prueba):

| Métrica | Este LoRA (3 pasos) | LoRA 4 pasos | Turbo stock (3 pasos) |
|---|---|---|---|
| Pasos de denoising | 3 | 4 | 3 |
| Tiempo de denoising a 1024×1024 (float16) | 24,9 s | no disponible | 65,4 s (8 pasos) |
| Textura fina (relativo al profesor) | 1,26× | 1,04× | 0,58× |
| Banda de 16 píxeles | 1,27× | no disponible | no disponible |
| Banda de 8 píxeles | 1,23× | no disponible | no disponible |
| Color | al nivel del profesor | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- El adaptador en sí ocupa 6,3 GB en el repositorio (incluye pesos en dos formatos, workflows y documentación); los pesos LoRA son ligeros frente al modelo base.
- Requiere cargar el modelo base Krea 2 Turbo, cuyo peso completo no se detalla en la información disponible; la VRAM total depende del modelo base y de la resolución.
- Entrenado en una sola GPU H100/H200 durante unas 161 horas; la inferencia es viable en GPUs de consumo con suficiente VRAM para el modelo base, aunque no se especifica el mínimo exacto.
- Despliegue soportado: diffusers (con `Krea2Pipeline`), ComfyUI (nodos estándar) y MLX en Apple Silicon mediante LVNodes.
- Latencia de denoising medida: 24,9 s a 1024×1024 en float16, excluyendo codificación de texto y decodificación VAE; el coste del adaptador por llamada está dentro del ~1%.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Detalle fino (vs. profesor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2-Turbo-Distill-3step-LoRA (este) | LoRA destilación | 3 | 1,26× | krea-2-community-license | Hugging Face |
| Krea2-Turbo-Distill-4step-LoRA | LoRA destilación | 4 | 1,04× | krea-2-community-license | Hugging Face |
| Krea2-Turbo-Distill-2step-LoRA | LoRA destilación | 2 | no disponible (calidad inferior al de 4 pasos según el autor) | krea-2-community-license | Hugging Face |
| Krea 2 Turbo (base) | Modelo de difusión | 8 | 1,0× (referencia) | krea-2-community-license | Hugging Face |

## Limitaciones y advertencias

- Proyecto en entrenamiento activo: el autor indica que el checkpoint se publica porque ya es usable, pero seguirá actualizándose; pueden aparecer nuevas versiones y LoRAs.
- La imagen generada se aleja algo más de la del profesor que la del LoRA de 4 pasos, según reconoce el autor; el compromiso es velocidad frente a fidelidad exacta.
- No es un modelo autónomo: requiere el modelo base Krea 2 Turbo y no funciona de forma independiente.
- Licencia krea-2-community-license: es necesario revisar el PDF de licencia y la NOTICE de atribución antes de cualquier uso comercial; no es una licencia permisiva estándar.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de imagen, los riesgos se refieren a contenido generado (estereotipos visuales, fidelidad al prompt), no evaluados en la model card.
- Idiomas soportados no declarados: el comportamiento multilingüe de los prompts no está especificado.
- Los datos de rendimiento provienen del propio autor y de 22 prompts de prueba, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-3step-LoRA
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- LoRA de 4 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- LoRA de 2 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-2step-LoRA
- Nodos y workflows ComfyUI (LVNodes): https://huggingface.co/lvladikov/ComfyUI-Nodes-and-Workflows/blob/main/LVNodes/README.md
- Licencia: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-3step-LoRA/blob/main/LICENSE.pdf
