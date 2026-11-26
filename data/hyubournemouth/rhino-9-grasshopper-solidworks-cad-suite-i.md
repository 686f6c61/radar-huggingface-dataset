# hyubournemouth/rhino-9-grasshopper-solidworks-cad-suite-i

## Resumen

`hyubournemouth/rhino-9-grasshopper-solidworks-cad-suite-i` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete de software de CAD (diseño asistido por ordenador) para Windows x64, empaquetado como archivo `.zip` portable, que incluye presuntamente Rhino 9, Grasshopper y SolidWorks 2026. El autor lo publica bajo licencia MIT y lo etiqueta con `pipeline_tag: other` y `library_name: generic`, lo que confirma que no es un modelo entrenado con pesos, tokenizador ni arquitectura neuronal.

El repositorio no incluye pesos en formato safetensors ni GGUF, no declara parametros, contexto ni datos de entrenamiento, y su model card es en realidad una pagina de descarga con enlaces a un repositorio de GitHub de terceros y a un archivo alojado en `github.com/Bianchi61/dlssg-to-xefg-universal-wrapper/releases`. El contenido de la model card presenta caracteristicas tipicas de las paginas de distribucion de software empaquetado de procedencia dudosa: enlaces de descarga con contrasena de extraccion, afirmaciones de "benchmarks" en milisegundos que no corresponden a ningun modelo de lenguaje y una estructura de marketing agresiva.

Desde el punto de vista de un desarrollador o investigador que busca un modelo de IA open source, este repositorio **no es utilizable como modelo**. Se documenta aqui unicamente para dejar constancia de su naturaleza y de los riesgos asociados a su descarga y ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete de software CAD para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (segun metadatos del repo; aplica a la documentacion del paquete, no a capacidades linguisticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de Windows, no pesos de modelo) |

## Arquitectura y entrenamiento

No aplica. El repositorio no describe ninguna arquitectura de red neuronal (transformer, MoE, SSM ni hibrida), no declara numero de tokens de entrenamiento, composicion de dataset ni tecnicas de alineacion como RLHF o DPO. La model card describe en su lugar un "runtime" para Windows 10/11 x64 con supuestas optimizaciones AVX2, DirectX 12 y Vulkan, y una configuracion JSON en `config/settings.json`, lo que corresponde a un ejecutable de aplicacion de escritorio, no a un modelo de lenguaje.

El artefacto distribuido es un archivo `dlssg-to-xefg-universal-wrapper-v3.2.2-win64.zip` alojado en un repositorio de GitHub de un tercero (`Bianchi61/dlssg-to-xefg-universal-wrapper`), con contrasena de extraccion `2026`. No hay informacion verificable sobre el contenido real del archivo, su cadena de compilacion ni su procedencia.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe codigo ni procesa lenguaje natural.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo de lenguaje; los idiomas listados son metadatos de localizacion de la pagina de distribucion.
- El paquete afirma incluir herramientas de CAD (Rhino, Grasshopper, SolidWorks), pero no se aporta ninguna verificacion independiente de que el contenido del `.zip` corresponda a esas aplicaciones ni de que sean versiones legitimas.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA, porque no lo es. A continuacion se enumeran escenarios en los que **no deberia usarse** y por que:

- Evaluacion como modelo de lenguaje: no hay pesos, tokenizador ni API; no es posible ejecutar inferencia.
- Integracion en pipelines de generacion de codigo: no existe endpoint ni runtime de modelo; el artefacto es un `.zip` de Windows.
- Despliegue en vLLM, llama.cpp, Ollama o TGI: ninguna de estas herramientas puede cargar el repositorio, al no contener un modelo.
- Fine-tuning o cuantizacion: no hay pesos base sobre los que operar.
- Uso como referencia de arquitectura: la model card no aporta informacion tecnica de ningun modelo.
- Descarga y ejecucion en entornos corporativos: el artefacto se distribuye con contrasena y desde un repositorio de terceros no verificado; su ejecucion supone un riesgo de seguridad que no se puede evaluar sin analisis previo en sandbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de IA en la informacion disponible. La model card incluye una tabla de "Runtime Telemetry" con latencias en milisegundos (por ejemplo, `1.42 ms` p99 en una RTX 4070) y consumo de RAM de aproximadamente `42-45 MB`, pero esas cifras corresponden a metricas de un supuesto runtime grafico, no a benchmarks de modelos (MMLU, HumanEval, GSM8K u otros). No se deben interpretar como rendimiento de un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica en el sentido de inferencia de IA. La model card menciona perfiles de hardware de escritorio (RTX 4070, RTX 3060, RX 7800 XT, Arc A770) para su supuesto runtime grafico, sin verificacion independiente.
- Compatibilidad con GPU de consumo: no aplica como modelo; como software de escritorio, la model card afirma soporte para Windows 10 (22H2+) y Windows 11 (23H2/24H2) x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son compatibles con este repositorio).
- Latencia y throughput: no disponible como modelo de IA; las cifras de milisegundos de la model card no son verificables ni corresponden a inferencia neuronal.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" con la que comparar este repositorio, ya que no es un modelo. Si se compara como paquete de software CAD, tampoco se dispone de informacion verificable sobre su contenido, versiones o licencias de las aplicaciones que afirma incluir, por lo que cualquier comparacion con distribuciones oficiales de Rhino o SolidWorks carece de base.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura ni datos de entrenamiento; no puede usarse para inferencia, fine-tuning ni evaluacion.
- Procedencia no verificada: el artefacto se distribuye desde un repositorio de GitHub de un tercero (`Bianchi61/dlssg-to-xefg-universal-wrapper`) y no desde el repositorio del autor en Hugging Face.
- Distribucion con contrasena de extraccion (`2026`): practica habitual en la distribucion de software empaquetado de origen dudoso; impide la inspeccion previa del contenido sin extraerlo.
- Posible infraccion de licencias de terceros: la model card afirma incluir Rhino 9, Grasshopper y SolidWorks 2026, aplicaciones comerciales cuyas licencias no constan; la licencia MIT del repositorio no puede cubrir software de terceros que no sea del autor.
- Riesgo de seguridad: ejecutar un binario de Windows de procedencia no verificada en un equipo de produccion expone a malware, mineros, stealers o backdoors; cualquier analisis debe hacerse en una maquina virtual aislada y sin credenciales.
- Cero descargas y cero likes en el momento de la consulta: sin senales de uso ni validacion por parte de la comunidad.
- La model card mezcla terminologia de modelos (tags de Hugging Face, "benchmarks") con contenido de pagina de descarga de software, lo que puede inducir a confusion sobre la naturaleza del repositorio.
- No usar como sustituto de una distribucion oficial de Rhino, Grasshopper o SolidWorks; para uso profesional, acudir a los canales oficiales de McNeel y Dassault Systemes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hyubournemouth/rhino-9-grasshopper-solidworks-cad-suite-i
- Repositorio GitHub citado en la model card: https://github.com/roman6320/rhino-9-grasshopper-solidworks-cad-suite-id
- Gateway `github.io` citado en la model card: https://roman6320.github.io/rhino-9-grasshopper-solidworks-cad-suite-id/
- Documentacion Go citada: https://pkg.go.dev/github.com/roman6320/rhino-9-grasshopper-solidworks-cad-suite-id
- Notebook citado: https://nbviewer.org/github/roman6320/rhino-9-grasshopper-solidworks-cad-suite-id/blob/main/notebooks/quickstart.ipynb
- Archivo `.zip` citado (repositorio de terceros): https://github.com/Bianchi61/dlssg-to-xefg-universal-wrapper/releases/download/v3.2.2/dlssg-to-xefg-universal-wrapper-v3.2.2-win64.zip
- Paper, blog oficial o demo del modelo: no disponible
