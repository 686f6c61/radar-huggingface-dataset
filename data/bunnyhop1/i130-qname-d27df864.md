# bunnyhop1/i130-qname-d27df864

## Resumen

El modelo `i130-qname-d27df864`, publicado por el usuario `bunnyhop1` en Hugging Face, es un artefacto de prueba con formato GGUF y licencia Apache 2.0. Segun la propia model card, se trata de un "repo de prueba desechable propiedad de un escaneo" (scan-owned disposable test repo) con el marcador `d27df864`, cuyo proposito declarado es comprobar la representacion de metadatos de un modelo en la interfaz de Hugging Face. No se describe ninguna arquitectura, tamano ni proceso de entrenamiento.

Los tags asociados (`i130marker`, `i130-xss-test`) sugieren que el repositorio se genero dentro de una bateria de pruebas de seguridad, concretamente para evaluar el renderizado de nombres y metadatos frente a posibles inyecciones de tipo XSS. No hay evidencia de que contenga pesos funcionales, datos de entrenamiento ni documentacion tecnica mas alla del marcador citado.

Por tanto, esta ficha documenta un artefacto de prueba y no un modelo de lenguaje utilizable en produccion. Cualquier evaluacion de capacidades, rendimiento o despliegue carece de sentido con la informacion disponible, y asi se indica en cada seccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, nivel de cuantizacion no especificado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria declarada: llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona tipo de transformer, mecanismo de atencion, numero de capas ni configuracion de mezcla de expertos. Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del corpus ni procesos de alineacion como RLHF o DPO.

El unico dato tecnico verificable es el formato de publicacion: pesos en GGUF y compatibilidad declarada con llama.cpp, ademas del tag `endpoints_compatible`. No hay innovaciones tecnicas descritas ni referencias a papers o repositorios de codigo.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo o matematicas.
- No hay evidencia de soporte de tool calling ni function calling.
- No se describe soporte para agentes o razonamiento multi-paso.
- No se declaran capacidades multilingues; el campo de idiomas esta vacio.
- No se mencionan modos especiales (thinking mode, vision, audio).
- El tag `conversational` aparece en los metadatos, pero sin model card que lo respalde con detalles funcionales.

## Casos de uso

- Validacion de pipelines de escaneo de seguridad: el repositorio puede servir como fixture para comprobar que un escaner detecta y clasifica correctamente artefactos de prueba con marcadores inyectados en metadatos.
- Pruebas de renderizado en la interfaz de Hugging Face: util para verificar como se muestran nombres de repositorio y tags potencialmente maliciosos (XSS) en la web.
- Verificacion de integracion con llama.cpp: permite comprobar que una herramienta de descarga e indexacion maneja repositorios GGUF sin pesos reales sin romperse.
- Pruebas de catalogacion y deduplicacion: sirve para validar heuristicas que filtran repositorios desechables o de test en un indice de modelos.
- Test de politicas de licencia: al declarar Apache 2.0 sobre un artefacto vacio, permite comprobar que los validadores de licencia no asumen contenido real.
- Formacion interna: ejemplo didactico de como se estructura un repositorio GGUF minimo en Hugging Face.
- En ningun caso es adecuado para inferencia real, atencion al cliente, generacion de codigo ni ninguna tarea de NLP en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; no se especifica tamano de parametros ni cuantizacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin datos de tamano.
- Opciones de despliegue: llama.cpp es la unica via declarada por el tag de libreria; no se confirma que el repositorio contenga pesos cargables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria funcional comparable, ya que el artefacto no se presenta como modelo de lenguaje sino como repositorio de prueba de metadatos. Cualquier comparacion con modelos GGUF reales (por ejemplo, familias Llama, Mistral o Qwen en formato GGUF) seria enganosa.

## Limitaciones y advertencias

- El repositorio se autodeclara "desechable" y orientado a pruebas; no debe usarse como dependencia en produccion.
- No hay garantia de que contenga pesos validos ni de que cargue en llama.cpp mas alla de la etiqueta declarada.
- Los tags `i130-xss-test` e `i130marker` indican contenido disenado para probar inyeccion o renderizado; tratalo como entrada no confiable en cualquier pipeline que lo procese.
- La licencia Apache 2.0 se declara sobre un artefacto sin contenido tecnico documentado; su aplicabilidad practica es irrelevante al no haber modelo subyacente descrito.
- Ausencia total de informacion sobre sesgos, alucinacion, cobertura idiomatica o contexto: no evaluable.
- Riesgo de que herramientas automaticas lo confundan con un modelo real al indexar por tags; conviene filtrarlo por autor o por nombre de marcador.
- Fecha de creacion y actualizacion (25 de noviembre de 2026) con apenas un minuto de diferencia entre ambas, coherente con un artefacto generado automaticamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bunnyhop1/i130-qname-d27df864
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
