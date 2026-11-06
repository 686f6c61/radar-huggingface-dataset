# FrankLin00/mmrh-afw-11-transformers-bark-voice

## Resumen

`FrankLin00/mmrh-afw-11-transformers-bark-voice` es un artefacto de investigación en seguridad publicado en Hugging Face, no un modelo de lenguaje funcional. Se presenta explícitamente como un "espécimen inerte de escáner" (*inert scanner specimen*) para investigación académica de seguridad, y su propio autor lo etiqueta con `security-research` y `not-for-production`. El repositorio reproduce el hallazgo de una vulnerabilidad de tipo *path traversal* en un preset de voz de Bark, concretamente en una clave de diccionario de preset de hablante (categoría AFW).

El artefacto conserva únicamente el "portador de metadatos" del hallazgo original: la clave del diccionario de preset de hablante. Cualquier sonda activa que se ejecute solo invoca `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`. Según la model card, no realiza acceso a credenciales ni operaciones de red. El payload inerte literal es `PWNED-INERT`.

El repositorio es de tamaño 0.0 GB y contiene un fichero `safetensors` con 4 parámetros totales, lo que confirma que no hay pesos de modelo reales. No dispone de pipeline, licencia, idiomas ni métricas de uso (0 descargas, 0 likes). Su relevancia es exclusivamente como material de referencia para investigadores que estudian vectores de ataque a través de metadatos de modelos en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de seguridad, no es un modelo funcional) |
| Parámetros totales | 4 (según safetensors) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0.0 GB |
| Pipeline | no disponible |
| Etiquetas | safetensors, llama, security-research, not-for-production, region:us |
| Fecha de creación | 2026-11-02 |
| Fecha de actualización | 2026-11-02 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un espécimen de investigación que reproduce un vector de ataque basado en metadatos: una clave de diccionario de preset de hablante en el ecosistema de Bark (modelo de síntesis de voz de Suno). La etiqueta `llama` aparece en los tags del repositorio, pero no se corresponde con un transformer Llama real ni con pesos entrenados.

La model card describe el mecanismo de la sonda: ejecución de `whoami` en forma argv, sin `shell=True`, con salida redirigida a la variable de entorno `HFSCAN_TRANSFORMERS__46237_BARK_VOICE_PRESET_PATH_TRAVERSAL_AFW` en `/tmp` o `$TMPDIR`. El payload inerte literal es `PWNED-INERT`. Cuando la primitiva vulnerable fuerza un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de reclamar control de bytes en crudo. No se documenta ningún proceso de entrenamiento, dataset ni técnica de alineación.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo *thinking*, visión ni audio.
- Su única función es servir como espécimen inerte de un hallazgo de seguridad (*path traversal* en preset de voz de Bark) para reproducir y estudiar el vector de ataque en entornos controlados.

## Casos de uso

- Investigación de seguridad en cadena de suministro de modelos: el artefacto permite reproducir el vector de *path traversal* a través de metadatos de preset de voz y validar si un escáner de Hugging Face detecta la clave maliciosa.
- Desarrollo y prueba de escáneres de modelos: sirve como caso de prueba positivo para herramientas que inspeccionan `safetensors`, model cards y metadatos en busca de patrones de ataque conocidos.
- Formación en seguridad de IA: se puede usar en laboratorios aislados para enseñar cómo un artefacto aparentemente inofensivo puede portar una primitiva vulnerable en sus metadatos.
- Validación de políticas de cuarentena: permite comprobar que los pipelines de ingestión rechazan repositorios etiquetados como `not-for-production` o `security-research`.
- Análisis forense de colecciones de especímenes: junto con el `MANIFEST.json` de la colección, facilita la verificación de hashes y la trazabilidad del hallazgo original.
- Estudio de restricciones de formato en payloads: el registro de restricciones (`.npy`, checkpoint, `.jinja`) permite analizar cómo la primitiva vulnerable condiciona el formato del payload inerte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es un modelo evaluable y no tiene métricas de rendimiento, latencia ni throughput.

## Requisitos de hardware

- No requiere GPU: el artefacto no ejecuta inferencia.
- No es desplegable en vLLM, llama.cpp, Ollama ni TGI, ya que no contiene pesos de un modelo funcional.
- El fichero `safetensors` de 4 parámetros ocupa prácticamente nada y puede inspeccionarse en cualquier máquina.
- Cualquier ejecución de la sonda descrita en la model card debe hacerse en un entorno aislado (contenedor efímero, sandbox sin red y sin credenciales), nunca en producción.
- No aplican estimaciones de VRAM, latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos comparables" para este artefacto, ya que no es un modelo de lenguaje ni de voz funcional. Otros especímenes de la misma colección de investigación (`mmrh-afw-*`) podrían ser los únicos elementos comparables, pero no se dispone de sus fichas en la información proporcionada.

## Limitaciones y advertencias

- No es apto para producción: el autor lo etiqueta explícitamente como `not-for-production`.
- No debe cargarse ni ejecutarse fuera de un entorno de investigación aislado.
- La model card afirma que la sonda solo ejecuta `whoami` y no accede a credenciales ni a la red, pero esta afirmación procede del propio autor y no está verificada de forma independiente; trátese como no confiable hasta su auditoría.
- El repositorio carece de licencia declarada, lo que impide determinar los términos de uso comercial o de redistribución.
- No hay información sobre sesgos, alucinaciones ni limitaciones de contexto o idioma porque no es un modelo generativo.
- La etiqueta `llama` en los tags puede inducir a confusión: no hay pesos Llama reales.
- El tamaño de 0.0 GB y los 4 parámetros confirman que no contiene un modelo entrenado; cualquier uso como modelo de voz o texto fallará.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-11-transformers-bark-voice
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código ni demos.
