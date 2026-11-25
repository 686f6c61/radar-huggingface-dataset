# bunnyhop1/i94-model2-xss-c14fd895

## Resumen

El modelo `bunnyhop1/i94-model2-xss-c14fd895` es un artefacto publicado en Hugging Face por el usuario `bunnyhop1` el 25 de noviembre de 2026. La informacion disponible no describe un modelo de lenguaje funcional: la model card se limita a un titulo ("I94 model2 metadata probe") y los metadatos de la ficha (tags, `library_name`, `pipeline_tag`) contienen cargas utiles HTML con manejadores `onerror` (`<img src=x >`, etc.). Todo apunta a una prueba de inyeccion de metadatos o de cross-site scripting (XSS) sobre el renderizado de fichas de Hugging Face, no a un modelo entrenado.

No se dispone de informacion sobre arquitectura, parametros, contexto, datos de entrenamiento ni capacidades. El repositorio registra 0 descargas y 0 likes, y no incluye pesos, configuracion ni tokenizador documentados. Cualquier evaluacion tecnica del modelo es, por tanto, imposible con los datos proporcionados.

La relevancia de esta ficha es fundamentalmente negativa: sirve como ejemplo de artefacto no fiable y de por que los pipelines que consumen metadatos de Hugging Face deben sanear y validar los campos antes de renderizarlos o interpretarlos como instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura (transformer, MoE, SSM o hibrida), numero de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. La model card no contiene seccion tecnica alguna: solo declara un `library_name`, un `pipeline_tag` y una lista de `tags`, todos ellos con contenido HTML inyectado en lugar de valores validos del ecosistema (por ejemplo, `transformers`, `text-generation` o `safetensors`).

El unico dato estructural es el identificador del repositorio, que incluye un sufijo hexadecimal (`c14fd895`) compatible con un identificador generado automaticamente para una prueba. No se ha publicado ningun paper, blog ni repositorio de codigo asociado.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues; el campo de idiomas figura como no disponible.
- No se documentan modos especiales (thinking mode, vision, audio).
- El unico contenido verificable son cadenas HTML con manejadores de eventos en los metadatos, lo que constituye un indicio de prueba de inyeccion, no una capacidad del modelo.

## Casos de uso

- Auditoria de seguridad de metadatos: usar este repositorio como caso de prueba para verificar que un visor de model cards escapa correctamente los campos `tags`, `library_name` y `pipeline_tag` antes de insertarlos en el DOM.
- Test de regresion en pipelines de ingesta: incorporarlo a una bateria de pruebas que confirme que un ETL que lee la API de Hugging Face rechaza o sanea valores que no pertenecen a enumeraciones conocidas.
- Formacion en higiene de datos: emplearlo como ejemplo didactico de por que no deben interpretarse los metadatos de una model card como instrucciones para un agente.
- Validacion de filtros de contenido: comprobar que los sistemas de moderacion marcan como sospechoso un repositorio sin licencia, sin idiomas y con HTML embebido.
- Pruebas de catalogacion: verificar que el sistema de inventario clasifica correctamente como "no evaluable" un artefacto con 0 descargas y sin pesos.
- Deteccion de suplantacion de identidad de modelo: entrenar o ajustar clasificadores que distingan repositorios legitimos de pruebas de inyeccion a partir de senales como el sufijo hexadecimal y la ausencia de campos obligatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos ni arquitectura documentada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables con la informacion disponible; no se documenta ningun formato de pesos compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No existe categoria tecnica asignable al artefacto y no se conocen modelos comparables con las mismas caracteristicas (metadatos inyectados y ausencia de pesos).

## Limitaciones y advertencias

- El contenido de los metadatos contiene HTML con manejadores `onerror`; no debe renderizarse sin escape en ningun visor ni interpretarse como instrucciones.
- Ausencia total de licencia: no se puede determinar si el uso comercial esta permitido; en la practica, no hay artefacto que usar.
- Sin idiomas declarados y sin model card tecnica: no es posible evaluar sesgos, alucinacion ni cobertura linguistica.
- Riesgo de suplantacion: el nombre imita el formato de un identificador de modelo, lo que puede enganar a un pipeline automatizado que no valide campos.
- No debe incluirse en catalogos de produccion ni en procesos de seleccion automatica de modelos.
- Creado y actualizado en un intervalo de once segundos, con 0 descargas y 0 likes: senales coherentes con un artefacto de prueba, no con un modelo distribuido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bunnyhop1/i94-model2-xss-c14fd895
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
