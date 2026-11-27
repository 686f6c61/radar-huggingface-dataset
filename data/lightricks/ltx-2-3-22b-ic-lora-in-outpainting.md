# Lightricks/LTX-2.3-22b-IC-LoRA-In-Outpainting

## Resumen

LTX-2.3-22b-IC-LoRA-In-Outpainting es un adaptador LoRA de tipo IC (in-context) publicado por Lightricks para su modelo base de generacion de video LTX-2.3, de 22.000 millones de parametros. El adaptador esta especializado en tareas de inpainting y outpainting sobre video: dado un clip de entrada y una mascara o region a modificar o extender, el modelo genera el contenido coherente en esa zona manteniendo la consistencia temporal y el estilo del material original. Se distribuye como un unico fichero de difusion (formato diffusion-single-file) que se aplica sobre el modelo base.

El modelo base LTX-2.3 es un modelo de difusion para generacion de video de la familia LTX de Lightricks, y este LoRA actua como adaptador de bajo rango que anade la capacidad especifica de edicion espacial (rellenar huecos, extender el encuadre) sin necesidad de reentrenar el modelo completo. Es relevante para flujos de postproduccion y edicion de video asistida por IA, donde reemplazar objetos, eliminar elementos no deseados o ampliar el campo de vision de un plano son tareas habituales y costosas manualmente.

El adaptador tiene 15.071 descargas y 87 likes en Hugging Face, esta bajo la licencia comunitaria ltx-2-community-license, solo soporta ingles en los prompts y requiere acceso restringido (gated): es necesario aceptar las condiciones en la pagina del modelo antes de descargarlo. El repositorio ocupa 1,3 GB, coherente con un adaptador LoRA sobre un modelo de 22B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion de video LTX-2.3 |
| Parametros totales | 22.000 millones (modelo base LTX-2.3); el adaptador LoRA no disponible en detalle |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2-community-license |
| Formato de pesos | diffusion-single-file (fichero unico de difusion, 1,3 GB) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LTX-2.3, el modelo de difusion de video de Lightricks de 22.000 millones de parametros. La tecnica IC-LoRA (in-context LoRA) introduce la informacion de condicionamiento (el video de entrada y la mascara de la region a editar) directamente en el contexto del modelo mediante adaptadores de bajo rango, de forma que el modelo base aprende a respetar la estructura temporal y espacial del clip original al rellenar o extender regiones. Al ser un LoRA, solo se entrenan y distribuyen los pesos del adaptador, no el modelo completo, lo que reduce el tamano del artefacto a 1,3 GB.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La informacion publica se limita a la ficha de Hugging Face, que no incluye una model card detallada con estos datos.

## Capacidades

- Inpainting de video: rellena regiones enmascaradas de un clip con contenido coherente con el resto de la escena y con continuidad temporal.
- Outpainting de video: extiende el encuadre de un plano mas alla de sus bordes originales, generando contenido nuevo que encaja con el estilo y la perspectiva.
- Video-to-video: pipeline declarado en Hugging Face, con condicionamiento sobre el video de entrada.
- Consistencia temporal: al operar sobre el modelo base de video, mantiene la coherencia entre fotogramas en la region editada.
- Soporte de prompts en ingles: el condicionamiento textual esta limitado al idioma ingles.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni thinking mode, al tratarse de un modelo de difusion de video y no de un LLM.

## Casos de uso

- Eliminacion de objetos en postproduccion: se enmascara el elemento no deseado (un microfono, un cable, una senal) y el adaptador rellena la region con el fondo coherente, ahorrando el trabajo de rotoscopia manual.
- Extension de encuadre para formatos alternativos: a partir de un plano rodado en 16:9 se genera el contenido lateral necesario para reencuadrar a 9:16 u otros formatos sociales sin recortar la accion.
- Restauracion de material con huecos: rellenar zonas danadas, logotipos censurados o marcas de agua en clips archivisticos manteniendo la continuidad temporal.
- Correccion de continuidad en VFX: sustituir elementos de una toma que no casan con el plano contiguo (atrezzo, vestuario, fondos) generando el relleno en lugar de regrabar.
- Prototipado rapido de storyboards animados: extender o modificar planos generados previamente con LTX-2.3 para explorar variantes de encuadre antes de la produccion final.
- Limpieza de material de vigilancia o documental: eliminar personas u objetos sensibles de un clip antes de su publicacion, con relleno coherente del fondo.
- Edicion asistida en pipelines de video: integrar el adaptador en herramientas de edicion que aplican mascaras por fotograma y delegan el relleno en el modelo, reduciendo el coste de artistas de rotoscopia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB, pero requiere cargar el modelo base LTX-2.3 de 22B para funcionar; la VRAM necesaria la determina el modelo base, no el adaptador.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; por el tamano (22B) se situa previsiblemente en el rango de GPUs de datacenter, aunque no se confirma.
- GPU recomendadas: no disponible; no se especifican modelos concretos en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es diffusion-single-file; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia de categoria, este adaptador se situa en el ambito de la edicion de video por difusion (inpainting/outpainting), donde existen otros trabajos del ecosistema de video generativo, pero no se aportan cifras comparables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.3-22b-IC-LoRA-In-Outpainting | 22B (base) + LoRA | no disponible | ltx-2-community-license | gated en Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar las condiciones en Hugging Face antes de la descarga.
- Licencia ltx-2-community-license: es una licencia "other" con terminos comunitarios; es imprescindible revisar las restricciones de uso comercial antes de integrarlo en produccion.
- Idioma: los prompts solo estan soportados en ingles.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere LTX-2.3, con el coste de VRAM y computo asociado.
- Riesgo de artefactos: como todo modelo de difusion, puede generar contenido incoherente o parpadeos en la region editada, especialmente en movimientos rapidos o escenas complejas; se recomienda revision humana.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, pero el modelo base puede reflejar los sesgos de sus datos de entrenamiento.
- Alucinacion visual: el relleno generado puede no corresponder a la realidad de la escena (objetos plausibles pero inexistentes), lo que es critico en contextos documentales o forenses.
- Ausencia de model card detallada: no hay informacion publica sobre datos de entrenamiento, evaluacion ni limitaciones documentadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-In-Outpainting
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- No se han encontrado en la busqueda web otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
