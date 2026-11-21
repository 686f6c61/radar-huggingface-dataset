# MRA75/shirtlift

## Resumen

`MRA75/shirtlift` es un adaptador LoRA para modelos de difusion, alojado en Hugging Face por el usuario MRA75 y publicado bajo la libreria `diffusers`. Se trata de un LoRA de tipo text-to-image entrenado sobre el modelo base `Wan-AI/Wan2.2-I2V-A14B`, un modelo de generacion de video imagen-a-video de la familia Wan 2.2. El adaptador utiliza la palabra de activacion `shirtlift` y esta disenado para inducir una accion concreta en la generacion de imagenes.

El repositorio es de muy reciente creacion (noviembre de 2026 segun los metadatos) y, en el momento de redactar esta ficha, no registra descargas ni likes. El tamano del repositorio es de aproximadamente 0,8 GB, coherente con un adaptador LoRA de rango bajo mas que con un modelo completo. La model card es extremadamente escueta: unicamente define la palabra de activacion y un ejemplo de prompt, sin documentar hiperparametros de entrenamiento, dataset ni procedimiento de uso detallado.

La relevancia de este modelo es limitada desde el punto de vista tecnico: se trata de un LoRA de nicho, sin licencia declarada, sin idiomas declarados y sin benchmarks. Su interes principal radica en que ejemplifica el ecosistema de adaptadores comunitarios sobre modelos de difusion de gran tamano, y en que su modelo base pertenece a la familia Wan 2.2, de la que conviene conocer las caracteristicas para evaluar el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion `Wan-AI/Wan2.2-I2V-A14B` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 14B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,8 GB en `diffusers`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es `Wan-AI/Wan2.2-I2V-A14B`, un modelo de la familia Wan 2.2 orientado a la generacion de video a partir de imagen (image-to-video) con aproximadamente 14 mil millones de parametros. El pipeline declarado en los metadatos es `text-to-image`, lo que sugiere que el adaptador se utiliza en el contexto de generacion de imagenes, aunque el modelo base sea de video.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas como regularizacion o captions automaticos. La model card solo especifica la palabra de activacion `shirtlift` y un prompt de ejemplo. Tampoco se documenta si el adaptador se entreno con tecnicas de RLHF, DPO o similares, algo por otra parte inusual en adaptadores de difusion. No hay innovaciones tecnicas destacables documentadas.

## Capacidades

- Generacion de imagenes condicionada por texto mediante el pipeline `text-to-image` de `diffusers`.
- Induccion de una accion concreta mediante la palabra de activacion `shirtlift`.
- Compatibilidad con el modelo base `Wan-AI/Wan2.2-I2V-A14B`, lo que en principio permite combinar el adaptador con las capacidades del modelo base (generacion de video imagen-a-video), aunque no se documenta el procedimiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de efectos visuales en postproduccion: el adaptador puede emplearse para generar variaciones de una accion concreta en fotogramas o clips, integrandose en un pipeline de `diffusers` sobre el modelo base Wan 2.2.
- Generacion de material de referencia para ilustracion: artistas pueden usar la palabra de activacion para obtener poses o composiciones de referencia que luego retocan manualmente.
- Experimentacion con LoRA comunitarios: investigadores pueden estudiar como un adaptador de bajo rango modifica el comportamiento de un modelo de difusion de 14B y medir el desplazamiento de la distribucion generada.
- Pruebas de concepto en generacion de contenido para moda o publicidad: el adaptador permite explorar variaciones de una accion vestimentaria concreta en bocetos o storyboards.
- Evaluacion de sesgos y seguridad en modelos de difusion: el adaptador es un caso de estudio util para medir como los LoRA comunitarios pueden introducir contenido sensible y que filtros de seguridad son necesarios.
- Docencia sobre adaptadores LoRA: sirve como ejemplo minimo de estructura de repositorio `diffusers` con `base_model`, `instance_prompt` y `trigger words` para explicar el formato a estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Wan 2.2 I2V A14B, con 14B parametros, requiere tipicamente entre 24 y 80 GB de VRAM en funcion de la precision y de si se aplican tecnicas de offloading.
- GPU recomendadas: no disponibles de forma especifica para este adaptador; para el modelo base se recomiendan GPU de clase profesional (A100, H100, L40S) o consumer de gama alta con suficiente VRAM (RTX 4090 con 24 GB, en configuraciones con cuantizacion u offloading).
- Cabe en GPU consumer: no confirmado para el modelo base completo; el adaptador en si ocupa aproximadamente 0,8 GB y puede cargarse en cualquier GPU, pero la inferencia depende del modelo base.
- Opciones de despliegue: `diffusers` (libreria declarada en los metadatos). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MRA75/shirtlift` | LoRA sobre Wan 2.2 I2V A14B | no disponible (base 14B) | no disponible | no disponible | Hugging Face, 0 descargas |
| `Wan-AI/Wan2.2-I2V-A14B` | Modelo base de video imagen-a-video | ~14B | no disponible | no disponible en esta ficha | Hugging Face |
| LoRA comunitarios genericos sobre Wan 2.2 | Adaptadores de bajo rango | variable | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparacion se limita a aspectos estructurales.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al tratarse de un adaptador de nicho entrenado sobre un modelo de difusion, es probable que herede los sesgos del modelo base y del dataset utilizado, pero no hay datos para cuantificarlo.
- Riesgo de alucinacion: en modelos de difusion el equivalente es la generacion de contenido incoherente o no solicitado; no se documenta evaluacion alguna.
- Limitaciones de contexto o idioma: no disponibles; la unica palabra de activacion documentada es en ingles (`shirtlift`).
- Restricciones de licencia para uso comercial: la licencia no esta declarada, por lo que no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier uso productivo.
- El contenido del prompt de ejemplo sugiere material sensible (desnudez), lo que implica riesgos de seguridad y de cumplimiento en plataformas con politicas de contenido estrictas.
- El repositorio no tiene descargas ni likes y fue creado y actualizado en un intervalo de menos de un minuto, lo que sugiere un artefacto sin validacion comunitaria.
- No se documenta el procedimiento de carga con `diffusers` ni la version de la libreria compatible.
- El pipeline declarado (`text-to-image`) no coincide con la naturaleza del modelo base (`image-to-video`), lo que puede generar confusion en la integracion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MRA75/shirtlift
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Descarga de archivos: https://huggingface.co/MRA75/shirtlift/tree/main
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
