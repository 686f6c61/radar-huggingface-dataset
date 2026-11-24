# Captivea-india123/Captivea_ERP

## Resumen

Captivea_ERP es un repositorio de pesos publicado en Hugging Face bajo el identificador `Captivea-india123/Captivea_ERP`, atribuido al usuario Captivea-india123 y distribuido con licencia Apache 2.0. El repositorio contiene ficheros en formato safetensors y esta etiquetado con la region `us`, pero no incluye model card descriptiva: el README se limita a la declaracion de licencia, sin informacion sobre arquitectura, tamano, datos de entrenamiento ni proposito.

El nombre sugiere una relacion con Captivea, integrador Gold Partner de Odoo con presencia en Francia y Estados Unidos, pero no existe evidencia en la informacion disponible que vincule oficialmente este repositorio con dicha empresa ni que confirme que se trate de un modelo de lenguaje entrenado. La ausencia de pipeline declarado, de idiomas soportados y de cualquier documentacion tecnica impide caracterizarlo como modelo generativo utilizable.

El repositorio registra 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el 24 de noviembre de 2026 con apenas doce minutos de diferencia, y no aparece referenciado en los resultados de busqueda web, que unicamente devuelven paginas corporativas de Captivea sobre servicios Odoo. Por tanto, esta ficha documenta lo que se puede verificar y marca explicitamente como no disponible todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El repositorio contiene pesos en formato safetensors, lo que indica que los tensores se almacenan en un formato binario estandar de Hugging Face, pero no se especifica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante. Tampoco se declara el numero de parametros, la longitud de contexto nativa ni la configuracion de atencion.

Respecto al entrenamiento, la model card no documenta el volumen de tokens, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa y no se incluye en esta ficha.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo o matematicas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales como thinking mode, vision o audio.
- El unico dato funcional verificable es la presencia de pesos en safetensors y la licencia Apache 2.0.

## Casos de uso

- Evaluacion interna de artefactos: el repositorio puede inspeccionarse para determinar que contiene realmente antes de cualquier uso, dado que la model card no lo describe.
- Auditoria de licencia: al estar bajo Apache 2.0, un equipo legal puede revisar las condiciones de redistribucion, aunque la falta de documentacion tecnica limita el analisis.
- Trazabilidad de repositorios: util para estudiar practicas de publicacion en Hugging Face, como repositorios creados sin model card ni pipeline declarado.
- Verificacion de integridad de pesos: comprobar que los ficheros safetensors se cargan correctamente con las herramientas estandar de Hugging Face.
- Analisis de atribucion: contrastar si el repositorio tiene relacion oficial con Captivea, ya que la informacion disponible no lo confirma.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, RAG ni ningun escenario funcional, porque no hay evidencia de que el artefacto sea un modelo de lenguaje operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el numero de parametros y la precision de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria, el tamano y la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre arquitectura, entrenamiento, datos ni evaluacion.
- Imposibilidad de verificar que sea un modelo de lenguaje funcional; el repositorio podria contener pesos de otro tipo o artefactos auxiliares.
- Sin pipeline declarado en Hugging Face, lo que impide conocer la tarea prevista.
- Sin idiomas declarados, por lo que no se puede garantizar cobertura linguistica alguna.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el usuario asume todo el riesgo derivado de la falta de documentacion.
- No se ha identificado vinculo oficial entre el repositorio y la empresa Captivea; el nombre del autor (`Captivea-india123`) no constituye prueba de autoria corporativa.
- Riesgo de sesgos y alucinaciones: no evaluable, al no existir informacion sobre datos de entrenamiento ni evaluaciones.
- Fecha de creacion y actualizacion separadas por doce minutos, lo que sugiere una publicacion sin iteracion posterior documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Captivea-india123/Captivea_ERP
- Sitio corporativo de Captivea (Francia): https://www.captivea.com/fr_FR
- Sitio corporativo de Captivea (internacional): https://www.captivea.com/
- Ficha de Captivea en francenum.gouv.fr: https://www.francenum.gouv.fr/activateurs/captivea
- Ficha de Captivea en Odoo: https://www.odoo.com/fr_FR/customers/captivea-351158
- Registro mercantil de Captivea en Pappers: https://www.pappers.fr/entreprise/captivea-501030811
