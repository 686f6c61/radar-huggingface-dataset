# iamonyx/kit-licence-apparition

## Resumen

`iamonyx/kit-licence-apparition` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que contiene documentación legal y comercial: un kit de licencia para el uso del personaje virtual "Onyx", una peluche naranja ficticia creada por un atelier de Montreal. El repositorio publica el marco contractual bajo el cual estudios de videojuegos podrían solicitar una "licencia de aparición" del personaje en sus productos, sin transferir en ningún caso el fichero maestro del personaje.

El contenido principal es el documento `KIT-LICENCE-APPARITION-JEU-V1.md`, que define el perímetro de la licencia, las condiciones tipo, nueve componentes a tarifar (sin precios concretos) y un proceso de cinco etapas con puntos de aprobación escrita. El repositorio no incluye pesos, tokenizador, configuración de arquitectura ni código de inferencia. La etiqueta `fr` indica que el contenido está redactado en francés.

Su relevancia es documental, no técnica: sirve como ejemplo público de gobernanza de propiedad intelectual sobre personajes virtuales en el contexto de la industria del videojuego. Cualquier evaluación como modelo de lenguaje, visión o multimodal carece de sentido con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un repositorio documental) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (contenido del repositorio) |
| Licencia | other (documento informativo; el kit y el personaje Onyx siguen siendo propiedad del atelier; no se concede licencia de aparición por el repositorio) |
| Formato de pesos | no disponible (no contiene pesos; el contenido es Markdown) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). El artefacto principal es un documento Markdown con estructura contractual: perímetro de la licencia, condiciones tipo, nueve componentes a tarifar presentados como grilla "a calibrar" y un proceso en cinco etapas.

La model card menciona repositorios relacionados del mismo atelier (`charte-graphique`, `porte-fidelite`, `gabarits-porte-3d`, `documentation-atelier`), que describen la cadena de producción del personaje (socle 3D neutro de motor, prioridad Unreal 5, live diario en Unity/VRM), pero no se proporciona información técnica sobre esos repositorios en la documentación disponible.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni procesa imágenes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del contenido redactado en francés.
- Su función es informativa y contractual: publicar las reglas de licencia de aparición del personaje Onyx.
- Define una lista cerrada de elementos nunca incluidos en la licencia: fichero maestro del personaje, referencias canónicas, derecho de modificar la apariencia y derecho de sublicenciar.
- Establece un proceso de cinco etapas con aprobación escrita por etapa y control de calidad mediante la "porte de fidélité" del atelier.

## Casos de uso

- Consulta legal previa por parte de un estudio: un equipo de videojuegos lee el kit antes de contactar con el atelier para conocer qué usos son posibles y cuáles quedan excluidos de antemano.
- Plantilla de gobernanza de IP: un despacho o un estudio puede usar la estructura (perímetro, condiciones tipo, componentes a tarifar, proceso por etapas) como referencia para redactar sus propias licencias de personajes virtuales.
- Documentación de cadena de producción: el kit enlaza con los repositorios de charte gráfica, control de fidelidad y gabarits 3D, sirviendo como punto de entrada a la documentación completa del atelier.
- Filtro de solicitudes entrantes: al publicar las reglas, el atelier reduce consultas inviables y canaliza las solicitudes serias por su correo público.
- Material docente sobre licencias de personajes: útil en cursos de derecho de propiedad intelectual aplicado a la industria del videojuego, como ejemplo de licencia de aparición sin cesión de fichero maestro.
- Referencia para acuerdos de integración en motores: el proceso en cinco etapas y el paquete de aparición derivado (nunca el maestro) describen cómo se entregaría el material a un estudio que integre el personaje en Unreal 5 o Unity/VRM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia que ejecutar.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI.
- No aplica latencia ni throughput.
- El único requisito es un visor de Markdown o un cliente Git para clonar el repositorio.

## Comparativa con modelos similares

No disponible. No se conocen repositorios comparables en la información proporcionada; la categoría (kit de licencia documental para un personaje virtual) no es la de un modelo de IA, por lo que la comparación con modelos de lenguaje, visión o multimodal no procede.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- El repositorio no concede ninguna licencia de aparición; es un documento informativo y el kit y el personaje Onyx siguen siendo propiedad del atelier.
- La licencia `other` implica restricciones no estandarizadas: cualquier uso comercial requiere contacto directo con el atelier por su correo público.
- El contenido está únicamente en francés, lo que limita su accesibilidad para equipos no francófonos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni validación externa.
- No se proporcionan precios: los nueve componentes aparecen como grilla "a calibrar", por lo que no puede derivarse un coste estimado.
- Las fechas de creación y actualización (2026-11-23) figuran en el futuro respecto a la información habitual de Hugging Face; conviene verificarlas antes de citar el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/kit-licence-apparition
- Documento principal citado en la model card: `KIT-LICENCE-APPARITION-JEU-V1.md` (dentro del repositorio)
- Repositorios del atelier mencionados en la model card: `charte-graphique`, `porte-fidelite`, `gabarits-porte-3d`, `documentation-atelier` (sin URL proporcionada)
- No se han encontrado papers, blogs, demos ni repositorios de código adicionales en la información disponible.
