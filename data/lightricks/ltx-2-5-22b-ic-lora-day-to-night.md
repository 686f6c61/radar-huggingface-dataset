# Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night

## Resumen

LTX-2.5-22b-IC-LoRA-Day-To-Night es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) desarrollado por Lightricks sobre su modelo base de generacion de video LTX-2.5. Su funcion es transformar material de video existente de una escena diurna en la misma escena ambientada de noche, manteniendo la coherencia temporal y estructural del metraje original. El adaptador se distribuye como un unico fichero de pesos compatible con la libreria `diffusion-single-file` y esta disenado para el pipeline de video-to-video.

El modelo pertenece a la familia LTX-2.5 de Lightricks, cuyo checkpoint base se identifica en el nombre como de 22 mil millones de parametros. El adaptador en si es un LoRA, por lo que el tamano del repositorio es reducido (0,3 GB) frente al modelo completo que debe cargarse por separado. La tecnica IC-LoRA permite condicionar la generacion en contexto, de modo que el modelo aprende la transformacion dia-noche sin necesidad de reentrenar el modelo base.

Es relevante ahora porque el relighting y la conversion dia-noche son tareas costosas en produccion audiovisual (postproduccion, VFX, previsualizacion), y un adaptador ligero que reutilice un modelo base potente reduce drasticamente el coste computacional y de almacenamiento frente a un modelo dedicado. El acceso esta restringido: requiere aceptar la licencia comunitaria LTX-2.x en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre el modelo de difusion de video LTX-2.5 |
| Parametros totales | Modelo base LTX-2.5: 22 mil millones (el adaptador LoRA es un subconjunto; numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de video; la ventana se define en frames/segundos, dato no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | diffusion-single-file (fichero unico de pesos, formato nativo de la libreria) |

## Arquitectura y entrenamiento

El adaptador se apoya en LTX-2.5, el modelo base de generacion de video de Lightricks, que segun la nomenclatura del repositorio cuenta con 22 mil millones de parametros. La tecnica IC-LoRA (In-Context LoRA) entrena un adaptador de bajo rango que modifica el comportamiento del modelo base mediante condicionamiento en contexto: en lugar de aprender la tarea desde cero, el adaptador ensena al modelo a reinterpretar la escena de entrada (video diurno) hacia la salida deseada (escena nocturna), preservando la estructura, el movimiento y la identidad de los elementos de la escena.

No se dispone de informacion publica sobre el numero de tokens o frames de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO. Al tratarse de un adaptador de difusion para video, el entrenamiento se realiza tipicamente sobre pares de videos dia/noche o mediante supervision de relighting; sin embargo, estos detalles no estan confirmados en la informacion proporcionada. La innovacion principal es el uso de IC-LoRA para una tarea de video-to-video con coherencia temporal, empaquetada como un fichero unico de pesos de bajo tamano (0,3 GB) que se combina con el checkpoint base.

## Capacidades

- Conversion dia-noche de video: transforma metraje diurno en la misma escena con iluminacion nocturna.
- Relighting: modifica la iluminacion de una escena manteniendo la geometria y el contenido.
- Video-to-video con coherencia temporal: preserva el movimiento y la estructura del video de entrada.
- Condicionamiento en contexto (IC-LoRA): el adaptador modifica el modelo base sin reentrenarlo.
- Integracion con el ecosistema LTX-2.5: se carga junto al modelo base de 22B.
- Idioma: entrenado y orientado a ingles (segun el tag de idioma del repositorio).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades de audio o vision general: no disponible; la tarea es especifica de video.

## Casos de uso

- Postproduccion audiovisual: convertir tomas rodadas de dia en escenas nocturnas para ajustar la continuidad de una secuencia sin volver a rodar, aprovechando la coherencia temporal del adaptador.
- Previsualizacion (previz) en cine y publicidad: generar rapidamente versiones nocturnas de planos para decidir la ambientacion antes del rodaje o del render final.
- Creacion de contenido para redes sociales: transformar clips diurnos en versiones nocturnas para variaciones de un mismo anuncio o video, con coste reducido al usar un LoRA ligero.
- Videojuegos y entornos interactivos: producir variantes dia/noche de cinemáticas o material de referencia a partir de capturas diurnas.
- Archivo y restauracion: reinterpretar metraje historico diurno en ambientaciones nocturnas para proyectos documentales o artisticos.
- Prototipado de VFX: generar plates nocturnos de referencia para que el equipo de efectos visuales trabaje sobre una base coherente con el movimiento original.
- Investigacion en difusion de video: estudiar tecnicas IC-LoRA aplicadas a relighting y video-to-video, reutilizando un modelo base de 22B con un adaptador de 0,3 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al requerir el modelo base LTX-2.5 de 22B, la inferencia necesita cargar dicho checkpoint, lo que implica requisitos de VRAM elevados (el adaptador LoRA por si solo ocupa 0,3 GB).
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo base, se orienta a GPU de datacenter (A100, H100) o equivalentes.
- Compatibilidad con GPU de consumo: no disponible; el adaptador es ligero, pero el modelo base de 22B condiciona el requisito.
- Opciones de despliegue: libreria `diffusion-single-file` (formato de pesos del repositorio); otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican o no estan indicadas para este modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Day-To-Night | Base 22B + LoRA | IC-LoRA video-to-video (dia-noche) | no disponible | ltx-2.x-community-license | Gated en Hugging Face |
| LTX-2.5 (modelo base) | 22B | Difusion de video | no disponible | ltx-2.x-community-license | Hugging Face |
| Otros adaptadores IC-LoRA de la familia LTX-2.5 | Base 22B + LoRA | LoRA especifico por tarea | no disponible | ltx-2.x-community-license | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia comunitaria LTX-2.x en Hugging Face antes de descargar.
- Licencia `ltx-2.x-community-license`: es una licencia "other"; deben revisarse las condiciones para uso comercial antes de desplegar en produccion.
- Dependencia del modelo base: no funciona de forma autonoma; necesita cargar LTX-2.5 (22B), con el coste de VRAM y computo asociado.
- Idioma: orientado a ingles segun los metadatos; no hay evidencia de soporte multilingue.
- Tarea acotada: solo realiza conversion dia-noche/relighting; no es un modelo generalista.
- Riesgo de artefactos: como todo modelo de difusion de video, puede introducir inconsistencias temporales, parpadeos o cambios no deseados en la escena.
- Sesgos: no disponible informacion sobre sesgos especificos del adaptador.
- Alucinacion visual: puede inventar fuentes de luz o modificar elementos de la escena de forma no fiel al original.
- Datos de entrenamiento, cuantizacion y benchmarks no disponibles; la evaluacion en produccion debe hacerse con pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia comunitaria LTX-2.x: no disponible enlace directo en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
