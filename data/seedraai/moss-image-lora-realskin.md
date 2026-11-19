# SEEDRAAI/MOSS-Image-LoRA-RealSkin

## Resumen

MOSS-Image-LoRA-RealSkin es un adaptador LoRA de bajo rango para generación de imagen texto-a-imagen, desarrollado por SEEDRAAI y publicado bajo licencia Apache 2.0. Se monta sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT y su función es concreta: sustituir el aspecto de piel suavizada por filtros de belleza por una textura realista, con pecas, poros visibles, tono desigual, rojeces y pequeñas marcas, tal como aparece en una fotografía tomada con un teléfono móvil. El repositorio ocupa 0,2 GB, lo que corresponde a un adaptador de pesos ligeros, no a un modelo completo.

El adaptador se entrenó con 100 fotografías seleccionadas manualmente de piel real sin retocar, incluyendo primeros planos, selfies y macrofotografías de hombros y brazos con pecas, abarcando distintas edades, etnias e iluminaciones. La versión publicada, v1.0, corresponde al paso 3000 de un entrenamiento de 4000 pasos; según el autor, el paso 4000 empezaba a alterar los rasgos faciales. El disparador textual es `r3alsk1n` y el adaptador está pensado para usarse dentro de ComfyUI con el nodo LoraLoaderModelOnly.

Su relevancia es acotada pero clara para flujos de generación fotorrealista de retrato: resuelve un problema muy específico (la piel artificial de los modelos afinados) sin modificar la identidad del rostro, y lo hace sobre un modelo base distinto del habitual en la comunidad (MOSS Image SFT). La información disponible no detalla la arquitectura ni el tamaño del modelo base, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen; arquitectura del base no disponible |
| Parametros totales | no disponible (repositorio de 0,2 GB, compatible con un adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (sigue la licencia del modelo base) |
| Formato de pesos | safetensors (`seedra_skin_moss.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base MOSS-Image-SFT para modificar su comportamiento sin reentrenar los pesos completos. El autor no documenta en la model card la arquitectura interna del base (tipo de transformer de difusion, número de parámetros, mecanismo de atención ni tokenizador de texto), por lo que no es posible detallar esos aspectos. El adaptador se activa mediante el token `r3alsk1n` en el prompt.

El entrenamiento se realizó sobre 100 fotografías reales de piel sin retocar, elegidas a mano: primeros planos faciales, selfies, macrofotografías y tomas de hombros y brazos con pecas, con variedad de edades, etnias e iluminación. El autor indica que evaluó checkpoints cada 1000 pasos con los mismos prompts y semillas, y que seleccionó el paso 3000 porque el 4000 comenzaba a modificar los rasgos faciales. No se especifican hiperparámetros de entrenamiento (learning rate, rango del LoRA, resolución de entrenamiento, número de repeticiones) ni si se aplicaron técnicas como regularización o captions automáticos.

## Capacidades

- Modificación de textura de piel en imágenes generadas: introduce pecas, poros visibles, tono desigual, rojeces ligeras y pequeñas marcas, eliminando el aspecto de filtro de belleza.
- Preservación de la identidad: según el autor, el efecto no cambia el rostro del personaje generado.
- Funciona en primeros planos faciales, planos medios y tomas de cintura para arriba; el efecto se reduce de forma natural en escenas oscuras.
- Compatible con generación texto-a-imagen en ComfyUI mediante el nodo LoraLoaderModelOnly.
- Control de intensidad mediante el peso del LoRA (1.0 por defecto, 0.7-0.8 para un aspecto más discreto).
- Idioma de prompt: inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento; es un adaptador exclusivamente de generación de imagen.

## Casos de uso

- Retrato fotorrealista para fotografía de producto y moda: el adaptador permite generar imágenes de piel con textura creíble en planos de cintura para arriba, útil para catálogos de ropa o accesorios donde la piel artificial delata la imagen generada.
- Simulación de fotografía amateur con móvil: combinado con prompts que incluyen "amateur phone photo", produce imágenes con aspecto de foto casual, adecuado para contenido de redes sociales o pruebas de concepto de campañas.
- Generación de personajes consistentes en narrativa visual: al no alterar el rostro, se puede mantener un personaje entre escenas y variar solo la iluminación y el encuadre, con la textura de piel como capa de realismo.
- Pruebas de iluminación y maquillaje virtual: la textura de piel con rojeces y tono desigual sirve para evaluar cómo responde un rostro sintético a distintas condiciones de luz antes de una sesión real.
- Prototipado rápido en ComfyUI: al ser un LoRA de 0,2 GB, se integra en flujos existentes con el nodo LoraLoaderModelOnly sin reentrenar el modelo base, lo que acelera la iteración de conceptos visuales.
- Investigación sobre sesgos de representación: el entrenamiento con distintas edades, etnias e iluminaciones permite estudiar cómo los modelos de difusión representan la diversidad de la piel real frente a la piel idealizada.
- Contenido editorial y educativo sobre fotografía: útil para ilustrar artículos sobre retoque, textura de piel o diferencias entre fotografía real y generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende enteramente del modelo base MOSS-Image-SFT, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles. El autor no indica requisitos mínimos ni GPUs objetivo.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio de 0,2 GB sugiere que el adaptador en sí es ligero, pero el consumo real lo determina el modelo base.
- Opciones de despliegue: ComfyUI es el flujo documentado (colocación del archivo en `ComfyUI/models/loras/` y uso del nodo LoraLoaderModelOnly). El autor ofrece una plantilla de ComfyUI lista para Vast.ai y RunPod a través de SeedraAI Studio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de este tipo.
- Latencia y throughput: no disponibles.
- Configuración de inferencia recomendada: resolución 1024x1536 (proporción 2:3), 35 pasos, CFG 3, sampler euler con sgm_uniform.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEEDRAAI/MOSS-Image-LoRA-RealSkin | LoRA de textura de piel | OpenMOSS-Team/MOSS-Image-SFT | 1024x1536 recomendado | Apache 2.0 | Hugging Face, CivitAI |
| SEEDRAAI/Krea-2-LoRA-RealSkin | LoRA de textura de piel | Krea 2 | no disponible | no disponible | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base texto-a-imagen | no aplica | no disponible | no disponible | Hugging Face |

La información disponible no permite comparar rendimiento numérico con alternativas, ya que no se publican benchmarks ni métricas objetivas para ninguno de los modelos listados. La comparación se limita a tipo de artefacto, base y licencia.

## Limitaciones y advertencias

- El adaptador solo funciona correctamente sobre MOSS Image SFT; el autor advierte que sobre la variante Base suaviza y lava la imagen.
- El efecto se reduce de forma natural en escenas oscuras, por lo que no garantiza textura de piel consistente en todas las condiciones de iluminación.
- El prompt no debe incluir "motion blur", ya que compite con el detalle de piel según el autor.
- El entrenamiento se realizó con solo 100 imágenes, lo que limita la variedad de tonos, edades y etnias cubiertas y puede producir un sesgo hacia los tipos de piel representados en ese conjunto.
- Riesgo de alucinación y de artefactos en la piel: no se documentan evaluaciones cuantitativas de fidelidad anatómica ni de coherencia en planos corporales amplios.
- Idioma de prompt limitado al inglés; no se garantiza comportamiento con prompts en castellano u otros idiomas.
- La licencia Apache 2.0 se hereda del modelo base, pero el autor no detalla restricciones adicionales de uso comercial más allá de las del propio base; conviene verificar la licencia de OpenMOSS-Team/MOSS-Image-SFT antes de un despliegue en producción.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- No hay información sobre sesgos demográficos medidos, tasas de error ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/SEEDRAAI/MOSS-Image-LoRA-RealSkin
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- CivitAI: https://civitai.com/models/3058565
- Variante para Krea 2: https://huggingface.co/SEEDRAAI/Krea-2-LoRA-RealSkin
- Sitio del autor: https://seedraai.com/
- SeedraAI Studio (plantilla ComfyUI para Vast y RunPod): https://seedraai.com/studio/
- Discord de la comunidad: https://discord.gg/seedraai
