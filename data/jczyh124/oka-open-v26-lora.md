# jczyh124/oka-open-v26-lora

## Resumen

El modelo `jczyh124/oka-open-v26-lora` es un LoRA de estilo experimental diseñado para el flujo de trabajo de imágenes "OH-card" sobre el modelo base `Tongyi-MAI/Z-Image`. Desarrollado por el usuario jczyh124, su objetivo es modificar únicamente el comportamiento de renderizado visible, produciendo una estética de acuarela y gouache mate rugosa, con formas de pigmento irregulares, bordes suaves rotos y detalle selectivo. No incorpora significado psicológico, proyección ni contradicción en el entrenamiento; estos deben venir de la escena y la selección humana.

Este LoRA es relevante para creadores que buscan un componente de estilo congelado y reproducible, sin depender de ajustes de prompt complejos. El checkpoint seleccionado (paso 200, rank 16, alpha 16) fue validado con una configuración de inferencia concreta (fuerza 0.25, 28 pasos, CFG 4.0, tamaño 768x1024, shift 3.0), lo que permite integrarlo en ComfyUI u otros pipelines de difusión de forma controlada. El tamaño del repositorio es de 0.1 GB y la licencia es "other", sin permiso implícito para redistribución o uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Tongyi-MAI/Z-Image |
| Parametros totales | no disponible (repo de 0.1 GB, sin desglose de parametros) |
| Parametros activos | no aplica (LoRA no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes, no texto) |
| Tipos de cuantizacion | no disponible (el repo contiene un archivo .safetensors sin cuantizacion declarada) |
| Idiomas soportados | no disponibles |
| Licencia | other (sin licencia implicita para redistribucion o uso comercial) |
| Formato de pesos | safetensors (archivo `zimage_xyqp_v26_style20_lr3e5_000000200.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica al modelo base `Tongyi-MAI/Z-Image`, un modelo de generacion de imagenes de la familia Z-Image desarrollado por Tongyi-MAI. No se dispone de detalles publicos sobre la arquitectura interna de Z-Image (si es un transformer de difusion, un modelo de flujo, etc.), por lo que esta seccion se limita a lo declarado en la model card del autor.

El entrenamiento del LoRA se realizo con un learning rate de `3e-5`, rank y alpha de 16, y se selecciono el checkpoint en el paso 200. El autor indica que este checkpoint fue elegido porque el propietario del proyecto acepto la direccion de estilo en muestras creativas concretas (muestras 2, 5 y 7) y en una tanda exploratoria de 100 imagenes, aunque la calidad de contenido de esa tanda no se considero apta para produccion. El LoRA se concibe como un componente de estilo "congelado" mientras la estructura del prompt se calibra por separado. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion; el entrenamiento es puramente de adaptacion de estilo sobre el modelo base.

## Capacidades

- Transferencia de estilo artistico: aplica una estetica de acuarela y gouache mate rugosa, con formas de pigmento irregulares, bordes suaves rotos y detalle selectivo.
- Control de renderizado: modifica la apariencia visual sin anadir contenido semantico; el significado de la escena debe venir del prompt.
- Compatibilidad con ComfyUI: el tag `comfyui` indica que esta disenado para integrarse en flujos de trabajo de ComfyUI.
- Trigger especifico: el token `xyqp` activa el estilo al anadirlo al prompt.
- Configuracion de inferencia validada: el autor proporciona parametros de referencia (fuerza 0.25, pasos 28, CFG 4.0, tamano 768x1024, shift 3.0) para reproducir los resultados aceptados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto: es exclusivamente un adaptador de estilo para generacion de imagenes.

## Casos de uso

- Ilustracion editorial con estetica de acuarela: el LoRA permite generar ilustraciones con textura de gouache mate y bordes rotos, adecuadas para portadas de libros o revistas donde se busca un acabado artesanal. Se usaria con el trigger `xyqp` y el material tail recomendado en el prompt.
- Creacion de tarjetas (OH-card): el flujo de trabajo "OH-card" se beneficia de este estilo para producir tarjetas con aspecto de pintura sobre papel sin textura impresa, manteniendo un detalle selectivo en las figuras.
- Exploracion de estilo en concept art: los artistas pueden usar el LoRA como base para explorar variaciones de acuarela en entornos o personajes, ajustando la fuerza del LoRA (0.25 recomendada) para controlar la intensidad del efecto.
- Prototipado rapido de moodboards: al integrarse en ComfyUI, se puede generar un lote de imagenes con el estilo deseado para evaluar direcciones artisticas sin necesidad de pintar manualmente.
- Generacion de fondos o texturas para videojuegos: la textura mate y las formas de pigmento irregulares pueden servir para crear assets de fondo con un look no fotorrealista, coherente con una direccion de arte especifica.
- Estudio de variaciones de prompt: dado que el LoRA no entrena significado, se puede usar para aislar el efecto del estilo y calibrar prompts de escena por separado, util para investigadores de generacion de imagenes que estudian la interaccion entre estilo y contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de rendimiento, calidad o comparaciones con otros LoRAs. La unica referencia de calidad es la aceptacion subjetiva de muestras por parte del propietario del proyecto.

## Requisitos de hardware

- VRAM estimada: el LoRA en si ocupa 0.1 GB, pero requiere cargar el modelo base `Tongyi-MAI/Z-Image`, cuyos requisitos de memoria no estan disponibles en la informacion proporcionada. Como referencia, modelos de difusion de tamano medio (2-3B parametros) suelen necesitar entre 6 y 12 GB de VRAM en FP16.
- GPU recomendadas: no se especifican. Para Z-Image, probablemente se necesite una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti) para inferencia a 768x1024, aunque sin datos oficiales no se puede confirmar.
- Compatibilidad con consumer GPU: es probable que quepa en GPUs de consumo recientes (RTX 30/40 series con 8-12 GB), pero depende del modelo base.
- Opciones de despliegue: ComfyUI es la opcion principal indicada por el tag. Tambien podria usarse en entornos que soporten LoRAs para Z-Image, como scripts de difusion personalizados, aunque no se mencionan otros frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de estilo para Z-Image con los que comparar directamente. La busqueda web muestra LoRAs de estilo para Stable Diffusion (por ejemplo, "Aiue Oka Style" para SD 1.5), pero no son comparables por usar un modelo base distinto. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia restrictiva: la model card indica que no se otorga licencia implicita para redistribucion o uso comercial. Cualquier uso fuera del ambito personal o experimental requiere autorizacion explicita del autor.
- Alcance limitado: el LoRA solo afecta al estilo visual; no anade ni controla contenido semantico. El significado de la imagen debe venir del prompt y de la seleccion humana.
- Calidad de contenido no validada: el autor advierte que la calidad de contenido de la tanda exploratoria no fue aceptada como lista para produccion. El LoRA debe tratarse como un componente de estilo experimental.
- Configuracion de inferencia especifica: los parametros validados (fuerza 0.25, pasos 28, CFG 4.0, tamano 768x1024, shift 3.0) son necesarios para reproducir los resultados aceptados; desviarse de ellos puede producir resultados inconsistentes.
- Riesgo de sobre-ajuste: al ser un checkpoint en el paso 200 con un estilo muy definido, puede no generalizar bien a prompts fuera del dominio de las muestras de entrenamiento.
- Sin soporte de texto ni otras modalidades: no es un modelo de lenguaje ni admite tool calling, agentes o razonamiento textual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jczyh124/oka-open-v26-lora
- Modelo base (referencia): https://huggingface.co/Tongyi-MAI/Z-Image (no verificado en la busqueda)
- Variante anterior (v1): https://huggingface.co/jczyh124/oka-open-v1-lora
- Referencia en Civitai (posible version alternativa): https://civitai.com/models/1562556/oka
