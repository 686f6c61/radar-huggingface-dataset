# moosemandada/fom-b-dup-ok2

## Resumen

El repositorio `moosemandada/fom-b-dup-ok2` es un modelo publicado en HuggingFace con la etiqueta de pipeline `text-generation` y licencia MIT, creado el 15 de septiembre de 2026 por el usuario `moosemandada`. A fecha de esta ficha acumula 0 descargas y 0 likes, no declara idiomas soportados y no incluye ningún dato verificable sobre arquitectura, número de parámetros, longitud de contexto, tokenizador o dataset de entrenamiento. No se ha publicado ningún paper, blog tecnico ni repositorio asociado.

La model card del autor no contiene informacion tecnica: consiste en un bloque de CSS que oculta todo el contenido real de la pagina e inyecta un `div` superpuesto que simula un dialogo de "Authentication Required" de Hugging Face, con un boton que apunta a `rce[.]lc/css/phish-click`. Se trata, por tanto, de una carga de tipo phishing/XSS orientada a capturar credenciales o a redirigir a un dominio externo no relacionado con el proyecto, y no de una ficha de modelo. Los resultados de busqueda web devueltos para este identificador corresponden a PRONOTE, un software frances de gestion de vida escolar de Index Education, y no guardan ninguna relacion con el modelo.

Por todo lo anterior, esta ficha no puede certificar ninguna caracteristica tecnica del modelo. Cualquier equipo que considere su uso deberia tratar el repositorio como no fiable, no ejecutar ni cargar los pesos sin un analisis previo en un entorno aislado y verificar la integridad de los ficheros antes de cualquier integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La unica etiqueta tecnica declarada es `pipeline_tag: text-generation`, que en HuggingFace indica de forma generica que el modelo esta pensado para generar texto, pero no implica ninguna arquitectura concreta (transformer denso, Mixture of Experts, SSM o hibrida son todas compatibles con esa etiqueta). No hay datos sobre el tokenizador, el vocabulario, la estrategia de atencion ni el tipo de posicional encoding.

Tampoco hay informacion sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF, DPO u otras tecnicas de alineamiento. La model card no documenta ninguna innovacion tecnica y no se ha publicado ningun informe o paper asociado al repositorio.

## Capacidades

- No es posible confirmar ninguna capacidad concreta del modelo a partir de la informacion disponible.
- Generacion de texto: unica capacidad implicita por la etiqueta de pipeline declarada, sin datos que la respalden.
- Razonamiento, generacion de codigo, matematicas, vision, audio o modalidades mixtas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Modos especiales (thinking mode, decodificacion especulativa, cadena de pensamiento explicita): no disponible.

## Casos de uso

- Evaluacion de seguridad de repositorios: el caso de uso mas documentado de este repositorio es precisamente el analisis de su model card como ejemplo de carga maliciosa en HuggingFace. Un equipo de seguridad puede utilizarlo como muestra de referencia en formacion sobre ingenieria social y contenido oculto mediante CSS.
- Analisis forense de artefactos sospechosos: se puede estudiar el patron de ocultacion (`display: none` sobre elementos legitimos mas un `div` superpuesto con `z-index` alto) para mejorar detectores automaticos de model cards fraudulentas en registries publicos.
- Pruebas de pipelines de escaneo: sirve como caso de prueba negativo en herramientas que validan metadatos de modelos antes de permitir su descarga o despliegue.
- No se recomienda su uso como modelo de generacion de texto en produccion, atencion al cliente, generacion de codigo, analisis de datos, RAG, agentes ni ninguna otra aplicacion, dado que no hay evidencia de capacidades reales ni de procedencia de los pesos.
- Auditoria de cadena de suministro de modelos: util para ilustrar la necesidad de verificar autor, historial de publicaciones, coherencia entre metadatos y contenido, y presencia de enlaces externos en el README.
- Docencia en seguridad de IA open source: permite mostrar en un aula o taller como un README puede renderizarse como HTML y suplantar la interfaz de la plataforma de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al desconocerse el numero de parametros, no es posible calcular requisitos de memoria ni para cuantizacion de 4 bits ni para precision completa.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no evaluable con los datos actuales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, Transformers): no disponible. Ademas, dado el contenido de la model card, se desaconseja cargar los pesos sin auditoria previa en un entorno sin red y sin credenciales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede identificar una categoria de comparacion porque se desconocen tamano, arquitectura, contexto y rendimiento del modelo. Los resultados de busqueda web asociados al identificador no corresponden a modelos de lenguaje, por lo que no aportan alternativas comparables.

## Limitaciones y advertencias

- Contenido malicioso en la model card: el README incluye CSS que oculta todo el contenido legitimo e inyecta un dialogo falso de autenticacion con un boton que enlaza a `rce[.]lc/css/phish-click`. Se trata de una tecnica de phishing y de intento de ejecucion remota de comandos por nombre de dominio, no de una ficha de modelo.
- Riesgo de robo de credenciales: el dialogo simula la interfaz de inicio de sesion de Hugging Face. Un usuario que introduzca sus credenciales en un flujo derivado de ese enlace podria exponerlas a un tercero.
- Procedencia no verificable: 0 descargas, 0 likes, sin historial, sin paper y sin repositorio asociado. No hay forma de auditar el origen de los pesos.
- Riesgo de supply chain: al no conocerse el formato de pesos ni el contenido de los ficheros, existe riesgo de artefactos con codigo de deserializacion peligroso (por ejemplo, pickles). No cargar con `trust_remote_code=True` bajo ninguna circunstancia.
- Alucinacion y sesgos: no evaluables, ya que no se dispone de informacion sobre entrenamiento, datos ni evaluaciones.
- Limitaciones de contexto e idioma: no disponible.
- Licencia: MIT declarada en los metadatos. Aunque la licencia es permisiva y permite uso comercial, esto no exime al usuario de responsabilidad sobre el contenido malicioso del repositorio ni garantiza la legalidad de los pesos.
- Recomendacion operativa: no desplegar en produccion, no integrar en pipelines de CI/CD y, si se analiza, hacerlo en una maquina virtual sin acceso a credenciales ni a red corporativa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/moosemandada/fom-b-dup-ok2
- Dominio referenciado en la model card (potencialmente malicioso, no visitar): rce[.]lc
- Resultados de busqueda web devueltos para este identificador, sin relacion con el modelo:
  - https://play.google.com/store/apps/details?id=com.IndexEducation.Pronote&hl=fr
  - https://www.index-education.com/fr/telecharger-pronote.php
  - https://play.google.com/store/apps/details?id=com.IndexEducation.Pronote&hl=fr-CA
  - https://doc.index-education.com/fr/pronote/pronote/PRONOTE/A/Application_mobile.htm
  - https://www.clubic.com/telecharger-fiche439242-pronote.html
- Papers, blogs, repositorios o demos del modelo: no disponible.
