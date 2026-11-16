# SEEDRAAI/Krea-2-LoRA-RealSkin

## Resumen

Krea-2-LoRA-RealSkin es un adaptador LoRA de tipo text-to-image desarrollado por SEEDRAAI para el modelo base Krea-2-Turbo. Su funcion es introducir textura de piel realista en las generaciones: poros visibles, pecas, vello facial fino, tono desigual, rojeces y pequenos brillos, eliminando el aspecto de filtro de belleza que suele producir el modelo base. El adaptador se activa mediante el token disparador `r3alsk1n` y esta pensado para retratos en primer plano, selfies y tomas macro.

El modelo resuelve un problema concreto en el flujo de generacion de retratos fotograficos: los modelos base tienden a producir pieles demasiado lisas y homogeneas. Este LoRA se entreno con 100 fotografias seleccionadas manualmente de piel real sin retocar, cubriendo distintas edades, etnias e iluminaciones. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors para su uso en ComfyUI.

Es relevante para desarrolladores que construyan pipelines de generacion de retratos fotorrealistas donde la autenticidad de la piel sea un criterio de calidad, especialmente en combinacion con otros LoRA de personaje o de estilismo fotografico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea-2-Turbo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors de LoRA) |
| Idiomas soportados | en |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors (`seedra_skin_krea2.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA que se aplica sobre el modelo de difusion Krea-2-Turbo. No se especifica en la informacion disponible el rango, las capas objetivo ni la configuracion exacta del adaptador. El entrenamiento se realizo sobre 100 fotografias seleccionadas manualmente de piel real sin retocar, incluyendo primeros planos, selfies y tomas macro con diversidad de edades, etnias e iluminacion.

La version publicada (v1.0) corresponde al paso 3000 de un entrenamiento de 6000 pasos. Segun el autor, se evaluaron los checkpoints cada 1000 pasos con los mismos prompts y semillas, y los pasos posteriores imprimian el token disparador como texto en la imagen y exageraban las imperfecciones, por lo que se opto por la version intermedia. No se detalla la composicion completa del dataset ni si se aplicaron tecnicas de regularizacion o captions especificos.

## Capacidades

- Generacion de retratos fotorrealistas con textura de piel autentica: poros visibles, pecas, vello facial fino, tono desigual, rojeces y brillos naturales.
- Funciona mejor en primeros planos, selfies y tomas macro; el efecto se reduce en planos amplios y de cuerpo completo.
- Compatible con otras palabras clave: *freckles, visible pores, peach fuzz, slight shine on the nose, uneven skin tone, no makeup, under-eye texture*.
- Se apila con LoRA de personaje; si el rostro cambia demasiado, el autor recomienda bajar el peso a 0,7.
- Integracion en ComfyUI mediante el nodo `LoraLoaderModelOnly` tras el cargador de Krea-2-Turbo.
- Ajustes recomendados: peso 1,0 (0,7-0,8 si las imperfecciones son excesivas), 8 pasos, CFG 1, sampler `euler_ancestral`, scheduler `beta57`, resolucion 3:4 o 9:16 en torno a 2 MP.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Generacion de retratos para redes sociales con aspecto de foto de movil: el LoRA reproduce la textura de una selfie real (poros, brillos, pecas) en prompts con el token `r3alsk1n`, adecuado para contenido que debe evitar el aspecto artificial.
- Creacion de avatares y personajes para ficcion o prototipado: combinado con LoRA de personaje permite mantener la identidad del sujeto con piel creible, util en previsualizacion de casting o storyboards.
- Pruebas de concepto en fotografia de belleza sin maquillaje: la capacidad de generar piel con imperfecciones reales sirve para maquetas de campanas centradas en autenticidad y diversidad.
- Ilustracion de articulos sobre dermatologia o cuidado de la piel: permite generar primeros planos con pecas, rojeces o marcas de acne de forma controlada mediante prompt.
- Integracion en pipelines de ComfyUI para produccion de imagen editorial: el adaptador se encadena con otros LoRA de realismo, ruido de camara y grano en un mismo grafo, segun el flujo de trabajo del autor.
- Generacion de material de entrenamiento o evaluacion de modelos: sirve para producir pares de imagenes con y sin textura de piel y estudiar el efecto de los adaptadores de realismo.
- Prototipado de interfaces de generacion de imagen para aplicaciones de consumo: al ser un LoRA ligero (0,2 GB) se puede cargar junto al modelo base en entornos de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparativas visuales antes/despues con el mismo prompt y semilla, pero no metricas cuantitativas (FID, CLIP score, evaluaciones humanas u otras).

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,2 GB; los requisitos de VRAM vienen determinados por el modelo base Krea-2-Turbo, no por el LoRA.
- No se dispone de cifras oficiales de VRAM para Krea-2-Turbo en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion empleada.
- Despliegue: el autor documenta el uso en ComfyUI con el nodo `LoraLoaderModelOnly`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables en la documentacion proporcionada. La comparacion se limita al modelo base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-LoRA-RealSkin | LoRA sobre Krea-2-Turbo | no disponible | no disponible | krea-2-community-license | Hugging Face, CivitAI |
| Krea-2-Turbo | Modelo base text-to-image | no disponible | no disponible | krea-2-community-license | Hugging Face |

## Limitaciones y advertencias

- El efecto de textura de piel es mas debil en planos amplios y de cuerpo completo; esta optimizado para primeros planos, selfies y macro.
- El token disparador `r3alsk1n` puede aparecer impreso como texto en prendas (camisetas, sudaderas); el autor recomienda anadir *plain clothes, no logos, no text* al prompt.
- Los checkpoints posteriores al paso 3000 exageraban las imperfecciones y filtraban el token como texto; la version publicada es la intermedia.
- Al apilarse con LoRA de personaje puede alterar el rostro; se recomienda reducir el peso a 0,7 en ese caso.
- Riesgo de alucinacion visual y de artefactos propio de los modelos de difusion; no se documentan sesgos especificos, aunque el dataset de 100 fotos es reducido y puede no representar toda la diversidad de tonos y texturas de piel.
- La licencia es la `krea-2-community-license` del modelo base; deben revisarse sus terminos para uso comercial antes de desplegar en produccion.
- Idioma de los prompts: solo ingles.
- El repositorio no incluye el flujo de trabajo completo de ComfyUI utilizado en las previsualizaciones; el autor lo distribuye a traves de su membresia en seedraai.com.

## Enlaces

- Hugging Face: https://huggingface.co/SEEDRAAI/Krea-2-LoRA-RealSkin
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- CivitAI: https://civitai.com/models/3054802
- Workflows y guias del autor: https://seedraai.com/?utm_source=huggingface&utm_campaign=real-skin
- Discord de la comunidad: https://discord.gg/seedraai
