# lvladikov/MOSS-SFT-Distill-4step-LoRA

## Resumen

MOSS-SFT-Distill-4step-LoRA es un adaptador LoRA de destilación por pasos (step distillation) para el modelo de difusión texto-a-imagen MOSS-Image SFT, desarrollado por OpenMOSS-Team. Lo publica el usuario lvladikov en Hugging Face bajo licencia Apache 2.0. Su función es reducir el coste de inferencia de MOSS-Image: donde el modelo base necesita 50 pasos con CFG 3 (100 llamadas al modelo), este LoRA genera imágenes en 4 pasos con CFG 1 (4 llamadas), lo que se traduce en aproximadamente 14 veces menos tiempo de GPU por imagen. El adaptador se entrena mediante distribución matching contra el profesor de 50 pasos, con un crítico que compara las imágenes generadas con las del profesor y con fotografías reales.

El LoRA tiene rango 64 y afecta a 252 módulos, con 30.000 muestras de entrenamiento en los pesos publicados (checkpoint `chk00030000`, de 20 de noviembre de 2026). Se entrenó en una única NVIDIA B300 durante unas 57 horas. El repositorio ocupa 2,8 GB e incluye dos ficheros: uno exacto para diffusers/Python y otro específico para ComfyUI que compensa el redondeo de precisión que aplica el cargador estándar de ComfyUI.

Es relevante porque permite desplegar un modelo de difusión de calidad fotográfica con latencias compatibles con producción interactiva, manteniendo el tono y la textura fina del profesor (1,16 veces más textura fina medida) y una capacidad notable de renderizar texto legible dentro de la imagen, un punto históricamente débil en modelos de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión texto-a-imagen MOSS-Image SFT |
| Parametros totales | no disponible (rango 64, 252 módulos adaptados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; prompts de longitud no especificada) |
| Tipos de cuantizacion | no disponible (se aplica sobre pesos bf16 del modelo base) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos; capacidad multilingüe de texto en imagen demostrada con chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | LoRA para diffusers y fichero compatible con ComfyUI (safetensors presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 que modifica 252 módulos del modelo base MOSS-Image SFT. Se entrena mediante destilación por distribución matching (distribution matching distillation) contra el profesor de 50 pasos con CFG 3, empleando un crítico que compara las salidas del estudiante con las del profesor y con un conjunto de fotografías reales (unas 8.000 recortes fotográficos con caption y 3.600 imágenes del profesor). El objetivo es que el estudiante reproduzca la distribución del profesor en solo 4 pasos y sin classifier-free guidance.

Los datos de entrenamiento incluyen 34.000 prompts provenientes del dataset de Lakonik (t2i-prompts-3m) y 2.877 prompts que deletrean palabras explícitas (carteles, menús, pósters, etiquetas), lo que explica su capacidad para renderizar texto legible. El entrenamiento cubre 12 resoluciones, desde 768×512 y 512×768 hasta 1824×1024 y 1024×1824. Se realizaron 30.000 muestras de entrenamiento en una única NVIDIA B300 durante aproximadamente 57 horas. El sampler y el schedule empleados son los propios de MOSS, con una llamada al modelo por paso en lugar de dos.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas en 4 pasos con CFG 1.
- Renderizado de texto legible dentro de la imagen: acierta todas las cadenas solicitadas en 14 de 15 prompts de prueba de texto a 1024×1024 (el profesor en 15, el LoRA de 4 pasos de akhaliq en 12).
- Soporte de 12 resoluciones de entrenamiento, incluyendo formatos anchos, altos y cuadrados (hasta 1824×1024 y 1024×1824).
- Estilos diversos demostrados: fotografía, acuarela, anime, claymation, splash art de videojuego, render 3D.
- Compatibilidad con flujos de trabajo de ComfyUI: texto a imagen, layout, edición de imagen y PiD 4×, además de un modo experimental con prompt negativo a CFG 2.
- Capacidad multilingüe en texto renderizado, con ejemplo de cartel en chino ("深夜食堂", "OPEN 24H").
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generación de imágenes en producción interactiva: con 4 pasos y CFG 1, el coste por imagen cae a 26,6 s frente a 387,3 s del profesor para 22 imágenes a 1024×1024 en Comfy Cloud, lo que lo hace viable para aplicaciones donde el usuario espera respuesta en segundos.
- Creación de material gráfico con texto integrado: menús, carteles, señales y etiquetas legibles, gracias al entrenamiento específico con 2.877 prompts que deletrean palabras; útil para mockups publicitarios y prototipos de packaging.
- Ilustración editorial y conceptual: los ejemplos de acuarela, anime, claymation y splash art demuestran versatilidad estilística para portadas, ilustraciones de artículos y arte conceptual.
- Generación de imágenes de alta resolución para impresión: las resoluciones de hasta 1824×1024 permiten salidas aptas para web de alta densidad y materiales impresos de pequeño formato.
- Edición y layout de imágenes en pipelines de diseño: los flujos de ComfyUI incluyen edición de imagen y layout, lo que permite integrarlo en herramientas de composición gráfica automatizada.
- Prototipado rápido en estudios de diseño: la reducción de 14× en tiempo de GPU abarata la iteración sobre variaciones de prompt y estilo, permitiendo explorar decenas de variantes en el tiempo que antes costaba una sola imagen.
- Fotorrealismo para e-commerce y catálogo: los ejemplos de retrato, fauna y mercados con luz natural y detalle fino lo hacen adecuado para imágenes de producto y lifestyle generadas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Pasos de inferencia | 4 (CFG 1) frente a 50 (CFG 3) del profesor |
| Llamadas al modelo | 4 frente a 100 del profesor |
| Tiempo de GPU (22 imágenes 1024×1024, Comfy Cloud) | 26,6 s frente a 387,3 s del profesor (~14× menos) |
| Luminosidad media (21 prompts, 1824×1024) | 1,0 L* por debajo del profesor (escala 0–100) |
| Escenas oscuras | dentro de 1 punto del profesor |
| Haze | 0,99× del profesor |
| Color | 1,07× del profesor |
| Textura fina (22 imágenes) | 1,16× del profesor |
| Precisión de texto (14/15 prompts, 1024×1024) | 14 aciertos (profesor 15, akhaliq 4-step LoRA 12) |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente; al ser un LoRA sobre MOSS-Image SFT, los requisitos son los del modelo base más el overhead del adaptador (2,8 GB de repositorio).
- GPU de entrenamiento: una NVIDIA B300 durante aproximadamente 57 horas.
- GPU recomendadas para inferencia: no especificadas; por el coste medido en Comfy Cloud, se beneficia de GPUs de datacenter (A100, H100, B300) para máximo throughput.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende de si el modelo base MOSS-Image SFT cabe en VRAM consumer.
- Opciones de despliegue: diffusers (fichero LoRA exacto) y ComfyUI (fichero `_comfyui` a fuerza 1.0 en el cargador estándar); también Comfy Cloud.
- Latencia: 26,6 s para 22 imágenes a 1024×1024 en Comfy Cloud (aproximadamente 1,2 s por imagen en ese entorno).

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | CFG | Texto en imagen (14/15) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-SFT-Distill-4step-LoRA (este) | LoRA destilado sobre MOSS-Image SFT | 4 | 1 | 14/15 | Apache 2.0 | Hugging Face |
| MOSS-Image SFT (profesor) | Modelo de difusión completo | 50 | 3 | 15/15 | no disponible en la información | Hugging Face |
| akhaliq/MOSS-Image-SFT-4-steps | LoRA destilado a 4 pasos | 4 | no disponible | 12/15 | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El LoRA está diseñado para cargarse sobre MOSS-Image SFT; no es un modelo autónomo y requiere el base para funcionar.
- En ComfyUI debe usarse el fichero `_comfyui` a fuerza 1.0; el fichero exacto pierde aproximadamente un octavo de su efecto por el redondeo de precisión del cargador estándar.
- El modo con prompt negativo a CFG 2 se marca como experimental en la documentación del autor.
- La precisión de texto es alta pero no perfecta: falla en 1 de 15 prompts de prueba frente al profesor.
- No se han publicado datos sobre sesgos, tasas de alucinación visual ni comportamiento en dominios sensibles.
- No hay información sobre idiomas de prompt soportados más allá del inglés y el chino en texto renderizado.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base para uso comercial.
- El repositorio ocupa 2,8 GB; el despliegue requiere gestionar tanto el base como el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/lvladikov/MOSS-SFT-Distill-4step-LoRA
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA alternativo de 4 pasos: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Dataset de prompts: https://huggingface.co/datasets/Lakonik/t2i-prompts-3m
- README detallado (referenciado en la model card): DETAILED-README.md dentro del repositorio
- Paper referenciado en tags: arxiv:2611.17194
