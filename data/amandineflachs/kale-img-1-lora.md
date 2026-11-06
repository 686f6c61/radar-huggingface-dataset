# AmandineFlachs/kale-img-1-lora

## Resumen

kale-img-1 (kxv) es un adaptador de estilo LoRA/LyCORIS para el modelo de generación de imágenes MOSS-Image (un DiT de 5B parámetros publicado por OpenMOSS bajo licencia Apache-2.0). Fue desarrollado por AmandineFlachs y su propósito es dotar al modelo base de un estilo concreto de ilustración infantil en 3D suave: un único sujeto por imagen, paleta cálida y fondo blanco liso.

El entrenamiento se realizó con la herramienta KohakuMossTrainer sobre un conjunto de 199 imágenes durante 4000 pasos, un tamaño de dataset pequeño pero suficiente para capturar un estilo visual muy definido. El resultado es un adaptador ligero (el repo completo ocupa unos 0,3 GB) que se activa mediante el token disparador `kxv` al inicio del prompt.

Es relevante como ejemplo de especialización eficiente de modelos de difusión abiertos: en lugar de reentrenar un modelo de 5B parámetros, un LoRA de unos cientos de megabytes permite obtener un estilo consistente para ilustración infantil, con muestras de calidad que incluyen dinosaurios de dibujo animado, personajes leyendo y objetos como mochilas o globos aerostáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/LyCORIS sobre un DiT (Diffusion Transformer) de 5B parámetros (MOSS-Image-Base) |
| Parametros totales | no disponible (solo se sabe que el repo del adaptador ocupa 0,3 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (dos variantes: ComfyUI y LyCORIS/diffusers) |

## Arquitectura y entrenamiento

El adaptador se apoya en MOSS-Image-Base, un modelo text-to-image basado en una arquitectura Diffusion Transformer (DiT) de 5B parámetros con entrenamiento por flow matching. La model card recomienda muestreo con flow-matching Euler, unos 50 pasos, CFG 3 y shift 5, lo que confirma el enfoque de flujo del modelo base.

El entrenamiento del adaptador se realizó con KohakuMossTrainer sobre 199 imágenes durante 4000 pasos. El dataset consistía en ilustraciones infantiles de estilo 3D suave con un único sujeto sobre fondo blanco, y la model card incluye comparaciones visuales entre las salidas generadas a partir de las primeras y últimas 5 descripciones del dataset y las referencias originales, lo que permite evaluar la fidelidad del estilo aprendido. No se ha publicado información sobre el uso de datos adicionales, técnicas de regularización específicas ni rangos de LoRA empleados.

## Capacidades

- Generación text-to-image en el estilo aprendido: ilustración infantil 3D suave, paleta cálida, fondo blanco liso.
- Activación mediante token disparador: anteponer `kxv` al prompt invoca el estilo; sin él se obtiene el modelo base sin modificar.
- Representación de un único sujeto con alta consistencia (animales de dibujo animado, personas, objetos).
- Escenas multi-sujeto posibles, especialmente con niños de dibujo animado, aunque con menor fiabilidad.
- Compatibilidad con dos formatos de carga: ComfyUI (loader LyCORIS) y LyCORIS/diffusers.
- El modelo base MOSS-Image hereda las capacidades generales de text-to-image del DiT de 5B de OpenMOSS (no detalladas en la model card del adaptador).

## Casos de uso

- Ilustración de libros infantiles: el estilo de sujeto único sobre fondo blanco es ideal para páginas ilustradas donde cada escena muestra un elemento protagonista; el token `kxv` garantiza coherencia visual entre páginas.
- Activos gráficos para aplicaciones educativas: las muestras incluyen bloques de alfabeto y mochilas escolares, útiles para generar ilustraciones de vocabulario, tarjetas didácticas o material de aula con estilo uniforme.
- Stickers y pegatinas ilustradas: el fondo blanco liso facilita el recorte posterior del sujeto para producir packs de stickers sin trabajo de segmentación manual.
- Prototipado de personajes: generar variantes de un mismo personaje (dinosaurios, niños con distintas ropas) manteniendo el mismo estilo 3D suave, útil en preproducción de animación.
- Generación de imágenes para apps infantiles: la estética amable y la paleta cálida encajan con interfaces dirigidas a público infantil, produciendo ilustraciones bajo demanda con un pipeline ComfyUI automatizado.
- Ilustración de catálogos o juguetes estilizados: representar objetos concretos (globos, mochilas) en tres cuartos o vista lateral con estilo consistente para mockups y presentaciones.
- Demostración y docencia de fine-tuning de LoRA: el repo incluye código y notas de entrenamiento en GitHub, lo que lo hace útil como caso de estudio reproducible de entrenamiento de adaptadores de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un adaptador de estilo, la evaluación se basa en las muestras visuales incluidas en la model card (generaciones con 50 pasos y CFG 3 sobre prompts no vistos durante el entrenamiento, más comparaciones generación vs. dataset).

## Requisitos de hardware

- VRAM para el adaptador: mínima, ya que el repo ocupa 0,3 GB; el requisito real viene determinado por el modelo base MOSS-Image de 5B parámetros (estimable en torno a 10-12 GB en FP16 para el modelo base, más margen para el sampler; no hay cifras oficiales publicadas).
- GPU recomendadas: no disponible de forma explícita; para un DiT de 5B, una RTX 4090 (24 GB) o superior es razonable, y GPUs de datacenter como A100/H100 para mayor throughput.
- Consumer GPU: plausible en GPUs de gama alta de consumo (24 GB); no hay confirmación oficial para GPUs de 8-12 GB.
- Despliegue: ComfyUI (mediante el loader LyCORIS con `kale-img-1-comfy.safetensors`) o bibliotecas diffusers/LyCORIS (con `kale-img-1-lycoris.safetensors`).
- Latencia y throughput: no disponible; con la configuración recomendada (50 pasos, flow-matching Euler) la latencia dependerá de la GPU y del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| kale-img-1 (kxv) | LoRA/LyCORIS de estilo | MOSS-Image-Base (DiT 5B) | 0,3 GB | Apache-2.0 | Ilustración infantil 3D suave, token `kxv` |
| Adaptadores LoRA típicos para SDXL/FLUX | LoRA de estilo | SDXL o FLUX.1 | 0,05-0,7 GB | Variable según autor | Ecosistema mucho mayor, pero bases con licencias más restrictivas en el caso de FLUX |
| MOSS-Image-Base | Modelo base text-to-image | — | 5B (DiT) | Apache-2.0 | Sin estilo especializado; base sobre la que se aplica este adaptador |

La principal ventaja diferencial frente a LoRAs sobre bases como FLUX es la licencia Apache-2.0 tanto del adaptador como del modelo base, lo que permite uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- El estilo se aprendió para sujetos únicos sobre fondo blanco: las composiciones con muchos elementos son menos fiables según la propia model card.
- Sin el token `kxv`, el adaptador no se activa y se obtiene el modelo base; es fácil olvidarlo y obtener resultados inesperados.
- Dataset de entrenamiento muy pequeño (199 imágenes), lo que puede limitar la diversidad de sujetos y provocar menor fidelidad fuera del dominio de entrenamiento.
- No hay datos de sesgos, tasas de alucinación ni evaluación cuantitativa publicados.
- Como modelo generativo de imágenes, hereda los riesgos habituales del modelo base MOSS-Image (representación de personas, estereotipos, etc.), no documentados en la model card.
- Licencia Apache-2.0: sin restricciones de uso comercial, pero sin garantías; el usuario es responsable del contenido generado.
- Repositorio con 0 descargas registradas: comunidad y soporte prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmandineFlachs/kale-img-1-lora
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Código y notas de entrenamiento: https://github.com/AmandineFlachs/kale-img
