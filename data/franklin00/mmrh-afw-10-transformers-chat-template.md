# FrankLin00/mmrh-afw-10-transformers-chat-template

## Resumen

`FrankLin00/mmrh-afw-10-transformers-chat-template` no es un modelo de lenguaje entrenado, sino un especimen inerte de investigacion en seguridad. Se trata de un artefacto disenado para preservar y reproducir un hallazgo de vulnerabilidad en el ecosistema de HuggingFace: concretamente, un ataque de tipo path traversal a traves de la clave `chat_template` en el guardado de plantillas de chat de la libreria `transformers` (identificador interno 46191). El autor lo etiqueta explicitamente como `security-research` y `not-for-production`.

El repositorio contiene pesos en formato safetensors con un recuento de parametros de 4, lo que confirma que no hay un modelo funcional detras: es un contenedor de metadatos que transporta la carga util del hallazgo. La model card describe que cualquier sonda activa ejecuta unicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

Su relevancia es exclusivamente para investigadores de seguridad que auditan la cadena de suministro de modelos y las superficies de ataque en el tooling de HuggingFace. No debe descargarse ni desplegarse como modelo de inferencia, y no ofrece ninguna capacidad de generacion de texto, razonamiento ni codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de seguridad, no modelo neuronal) |
| Parametros totales | 4 (segun safetensors; no constituye un modelo funcional) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un especimen de escaner de seguridad cuyo proposito es conservar el vector de ataque asociado a la clave de diccionario `chat_template` (categoria AFW) en el flujo de guardado de plantillas de `transformers`. La model card indica que la carga util literal inerte es `PWNED-INERT` y que, cuando la primitiva vulnerable impone un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto de la coleccion registra esa restriccion de formato en lugar de reclamar control de bytes en crudo.

La sonda activa, si se ejecuta, invoca unicamente `whoami` en forma de argv, sin `shell=True`, y redirige la salida a la variable `HFSCAN_TRANSFORMERS__46191_CHAT_TEMPLATE_SAVE_PATH_TRAVERSAL_AFW` bajo `/tmp` o `$TMPDIR`. No realiza acceso a credenciales ni conexiones de red. Los hashes y la ruta del hallazgo original se documentan en el `MANIFEST.json` de la coleccion.

## Capacidades

- No genera texto, codigo, matematicas ni razonamiento: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.
- Su unica funcion es preservar metadatos de un hallazgo de path traversal en el guardado de `chat_template` de `transformers`.

## Casos de uso

- Reproduccion de hallazgos de seguridad: permite a un investigador recrear el vector de path traversal en el guardado de plantillas de chat de `transformers` para verificar la correccion de un parche.
- Auditoria de la cadena de suministro de modelos: sirve como muestra de referencia para construir detectores que identifiquen artefactos con cargas utiles embebidas en metadatos de model card.
- Desarrollo de reglas de escaneo: util para validar escaneres que inspeccionan claves de diccionario como `chat_template` en repositorios de HuggingFace.
- Formacion en seguridad de ML: material didactico para explicar como se transportan hallazgos en artefactos aparentemente inofensivos.
- Pruebas de sandbox: verifica que un entorno aislado contiene correctamente la ejecucion de `whoami` y la escritura en `/tmp` o `$TMPDIR`.
- Validacion de manifiestos: comprueba que el `MANIFEST.json` de la coleccion registra correctamente hashes y restricciones de formato (`.npy`, `.jinja`, checkpoints).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de inferencia y no produce salidas evaluables con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio ocupa 0.0 GB y no contiene un modelo funcional.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no pueden servirlo como modelo).
- Latencia y throughput: no disponibles; no hay inferencia que medir.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la categoria de modelos de lenguaje, ya que este artefacto es un especimen de investigacion en seguridad y no un modelo entrenado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para generacion, razonamiento ni ninguna tarea de inferencia.
- Etiquetado explicitamente como `not-for-production`; su uso en produccion esta desaconsejado por el propio autor.
- Contiene una sonda que, si se ejecuta, lanza `whoami` y escribe en `/tmp` o `$TMPDIR`; debe manipularse solo en entornos aislados.
- Preserva un vector de ataque (path traversal via `chat_template`); su mera presencia en un pipeline puede activar escaneres o disparar falsos positivos.
- Licencia no disponible: no hay autorizacion explicita documentada para uso comercial.
- Sin idiomas, contexto ni capacidades declaradas; cualquier expectativa de funcionalidad como modelo es erronea.
- Riesgo de confusion en catalogos automaticos que lo indexen como modelo por sus tags y formato safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afw-10-transformers-chat-template
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
