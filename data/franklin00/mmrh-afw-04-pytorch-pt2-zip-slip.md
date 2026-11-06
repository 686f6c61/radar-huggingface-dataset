# FrankLin00/mmrh-afw-04-pytorch-pt2-zip-slip

## Resumen

`FrankLin00/mmrh-afw-04-pytorch-pt2-zip-slip` es un artefacto de investigacion en seguridad publicado en Hugging Face bajo las etiquetas `security-research` y `not-for-production`. No se trata de un modelo de lenguaje entrenado, sino de una "muestra inerte" (inert scanner specimen) disenada para preservar el vector de metadatos de un hallazgo de vulnerabilidad concreto: la manipulacion del nombre de una entrada zip en un fichero `.pt2` de PyTorch (AOTInductor / AOTI). El autor lo describe explicitamente como material para investigacion academica de seguridad, no como un modelo utilizable.

El artefacto no contiene pesos de un modelo neuronal ni una pipeline de inferencia. Su proposito es documentar y reproducir de forma controlada un fallo de tipo zip slip en el formato de empaquetado `.pt2`, donde un nombre de entrada zip manipulado puede provocar escrituras fuera del directorio previsto durante la carga del artefacto. Cualquier sonda activa que se ejecute contra la muestra se limita a invocar `whoami` en forma argv (nunca `shell=True`) y a volcar su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

La relevancia de este repositorio es documental: sirve como referencia reproducible para investigadores que trabajan en la seguridad de la cadena de suministro de modelos y en el analisis de formatos de serializacion de PyTorch. No aporta capacidades de generacion, razonamiento ni procesamiento de lenguaje, y carece de licencia, idiomas y especificaciones de modelo declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un artefacto de investigacion en seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | artefacto `.pt2` de PyTorch (AOTInductor) con entrada zip manipulada; no contiene pesos de modelo |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un transformer, MoE, SSM ni arquitectura hibrida, y no ha sido entrenado con datos textuales. El objeto tecnico es un fichero `.pt2` (formato de paquete de PyTorch 2 / AOTInductor) cuyo nombre de entrada zip actua como portador de metadatos del hallazgo de seguridad. El autor denomina a esta clase de muestra "AFW" y emplea un payload literal inerte `PWNED-INERT`.

Cuando la primitiva vulnerable obliga a un contenedor o sufijo especifico (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la coleccion registra esa restriccion de formato en lugar de afirmar control de bytes en crudo. El manifiesto incluye ademas los hashes y la ruta del hallazgo de origen. No se documenta ningun proceso de entrenamiento, RLHF, DPO ni composicion de dataset.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion documentada es servir como muestra inerte para analisis de seguridad: preservar el vector de metadatos (nombre de entrada zip en `.pt2`) de un hallazgo de tipo zip slip.
- La sonda activa asociada ejecuta unicamente `whoami` en forma argv y escribe la salida en la variable de entorno `HFSCAN_PYTORCH__01_AOTI_PT2_ZIP_SLIP_AFW` bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Investigacion academica en seguridad de formatos de serializacion: el artefacto permite reproducir de forma controlada el comportamiento de un nombre de entrada zip manipulado en un `.pt2`, facilitando el estudio del zip slip en la carga de paquetes de PyTorch 2.
- Desarrollo de escaneres de seguridad para repositorios de modelos: sirve como caso de prueba conocido para validar que un escaner detecta nombres de entrada zip anomalos en ficheros `.pt2` antes de su carga.
- Formacion y concienciacion en cadena de suministro de IA: puede emplearse en entornos aislados para ilustrar como metadatos de empaquetado pueden transportar hallazgos de seguridad sin ejecutar codigo malicioso real.
- Validacion de politicas de carga segura: permite comprobar que un pipeline que aplica `weights_only=True` o sandboxing de directorios de extraccion rechaza o contiene el artefacto segun lo esperado.
- Documentacion de hallazgos con trazabilidad: el `MANIFEST.json` de la coleccion, con hashes y ruta del hallazgo de origen, permite auditar la procedencia de la muestra en informes de vulnerabilidades.
- Pruebas de contencion en entornos de analisis: verificar que un sandbox restringe la escritura a `/tmp` o `$TMPDIR` y que la sonda solo ejecuta `whoami` sin acceso a red ni credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- No requiere GPU: no hay pesos de modelo ni inferencia neuronal.
- No aplica VRAM estimada para inferencia.
- No aplica seleccion de GPU (A100, H100, RTX 4090 u otras).
- No cabe en GPU consumer porque no es un modelo; su manipulacion requiere un entorno de analisis de ficheros, preferiblemente aislado.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El manejo recomendado es en sandbox o contenedor desechable con acceso restringido a red y credenciales.
- Latencia y throughput: no disponibles; no procede medirlos.

## Comparativa con modelos similares

| Artefacto | Tipo | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|
| `FrankLin00/mmrh-afw-04-pytorch-pt2-zip-slip` | Muestra inerte de seguridad (`.pt2`) | Preservar vector de metadatos de zip slip en PyTorch 2 | no disponible | Hugging Face, 0 descargas |
| Otras muestras AFW de la misma coleccion | Muestras inertes de seguridad | Documentar otros hallazgos con el mismo esquema | no disponible | Referenciadas en `MANIFEST.json` de la coleccion |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | Modelos neuronales | Generacion, razonamiento, codigo | Variables (Apache 2.0, Llama, etc.) | Hugging Face |

La comparacion con modelos de lenguaje no es significativa: este repositorio no comparte categoria funcional con ellos. La alternativa natural son otras muestras de la misma coleccion de investigacion, cuyos detalles no se proporcionan en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto, no razona y no procesa lenguaje. Etiquetado explicitamente como `not-for-production`.
- Riesgo de seguridad: reproduce un vector de zip slip en el formato `.pt2`; debe manipularse solo en entornos aislados y con acceso a red y credenciales restringido.
- Licencia no disponible: la ausencia de licencia declarada impide asumir derechos de uso comercial o redistribucion.
- Idiomas no disponibles: no procede, al no existir componente linguistico.
- Sin sesgos de modelo documentados, al no existir modelo; el riesgo relevante es operacional (ejecucion de la sonda y extraccion de ficheros), no cognitivo.
- Riesgo de alucinacion no aplicable.
- La sonda activa documentada se limita a `whoami` en forma argv y a escribir en `/tmp` o `$TMPDIR`; cualquier comportamiento distinto observado al manipular el artefacto debe tratarse como anomalia y reportarse.
- El payload es literalmente `PWNED-INERT`; no debe interpretarse como prueba de explotacion real fuera del contexto de investigacion.
- No se proporcionan hashes ni ruta del hallazgo en esta ficha; deben consultarse en el `MANIFEST.json` de la coleccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-04-pytorch-pt2-zip-slip
- `MANIFEST.json` de la coleccion: no disponible como URL directa en la informacion proporcionada
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
