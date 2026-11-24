# Linerist/maxon-zbrush-2026-cinema4d-redshift

## Resumen

El repositorio `Linerist/maxon-zbrush-2026-cinema4d-redshift` no contiene un modelo de inteligencia artificial. Es un paquete alojado en Hugging Face cuyo contenido, segun los metadatos y la model card, es un archivo ejecutable para Windows (`maxon-zbrush-2026-cinema4d-redshift-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) que se presenta como una supuesta version "portable" y "gratuita" de ZBrush 2026, Cinema 4D y Redshift, productos comerciales de Maxon. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline asociado: el campo `pipeline` aparece como no disponible y las descargas y likes son cero.

La model card no describe ninguna capacidad de generacion, razonamiento o procesamiento de lenguaje. Se limita a instrucciones de descarga y ejecucion: obtener un ZIP desde un repositorio de GitHub de terceros (`Marek8118/...`), extraerlo con la contrasena `2026` y ejecutar el binario como administrador. Este patron —binario de pocos megabytes, contrasena en el archivo, instrucciones de ejecucion con privilegios elevados, insignias de descargas infladas y lenguaje de "sin marcas de agua" o "licencia offline"— es caracteristico de campanas de distribucion de software no verificado, potencialmente malicioso o, como minimo, de una infraccion de marca y licencia.

Por tanto, esta ficha no puede documentar especificaciones tecnicas de un modelo porque no existen. El valor para el lector es el contrario: identificar el artefacto como lo que es, advertir de los riesgos de seguridad y de licencia, y recomendar encarecidamente no ejecutarlo. Cualquier evaluacion de capacidades, benchmarks o requisitos de hardware carece de sentido en este caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como modelo; la model card declara metadatos en 14 idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) |
| Licencia | MIT (declarada en los metadatos; incompatible con el software comercial de Maxon que dice empaquetar) |
| Formato de pesos | no disponible; el artefacto es un ZIP de 8,9 MB con un `.exe` en su interior |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito es un ejecutable de Windows (`v2.2.9`, build `957FC6609E`) empaquetado en `maxon-zbrush-2026-cinema4d-redshift-v1.2.0-win64.zip`. La model card menciona de forma generica "CUDA, TensorRT, DirectML y OpenCL", "14 worker threads" y "menos de 55 MB de RAM", cifras incompatibles con el tamano real de las aplicaciones que dice incluir (ZBrush, Cinema 4D y Redshift ocupan varios gigabytes cada una). No hay dataset, tokens de entrenamiento, RLHF ni innovacion tecnica alguna que documentar.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo; los idiomas listados son solo etiquetas de metadatos.
- No dispone de modo thinking, vision, audio ni ninguna modalidad.
- Lo unico que hace el artefacto, segun su propia descripcion, es ejecutarse en Windows 10/11 de 64 bits con privilegios de administrador.

## Casos de uso

- Ninguno legitimo como modelo de IA. No se debe desplegar en produccion, pipelines de datos ni entornos de investigacion.
- Auditoria de seguridad: el artefacto puede usarse como muestra de estudio en un sandbox aislado para analizar tecnicas de ingenieria social (contrasena en el ZIP, insignias de descargas falsas, instrucciones de "ejecutar como administrador").
- Formacion en higiene de cadena de suministro: sirve como ejemplo didactico de por que no se deben ejecutar binarios de repositorios no oficiales.
- Verificacion de politicas de plataforma: util para revisar como los repositorios de Hugging Face pueden alojar contenido ajeno a modelos y que controles existen.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de documentos, traduccion, resumen ni ninguna tarea de NLP.
- No es adecuado para sustitucion de herramientas de modelado 3D o render: la via legitima es la licencia oficial de Maxon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ningun otro tipo, porque no hay modelo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Unico requisito declarado del artefacto: Windows 10/11 de 64 bits y ejecucion como administrador, lo que en si mismo es una senal de alarma.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA. Frente a herramientas reales de escultura y render 3D (ZBrush, Blender, Cinema 4D), la comparacion relevante es que este paquete no es una distribucion oficial de Maxon y carece de soporte, actualizaciones y garantia legal.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, codigo o razonamiento es infundada.
- Riesgo de seguridad alto: ejecutar un binario desconocido como administrador desde un ZIP con contrasena es un vector clasico de malware, ransomware o mineros de criptomonedas.
- La licencia MIT declarada es incompatible con el software propietario de Maxon que el paquete afirma contener; se trata de una infraccion de derechos de autor y de marca.
- Indicadores de manipulacion: insignias de "809K+ descargas" y "99% verificado" no verificables, contrasena fija en el archivo, repositorio de GitHub de terceros ajeno al autor del modelo en Hugging Face.
- Cero descargas y cero likes en Hugging Face, lo que contradice las cifras de la model card.
- No hay garantia de integridad ni firma digital del ejecutable; no hay forma de auditar su contenido sin analisis forense.
- Recomendacion: no descargar ni ejecutar. Para ZBrush, Cinema 4D o Redshift, acudir exclusivamente a los canales oficiales de Maxon.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Linerist/maxon-zbrush-2026-cinema4d-redshift
- Repositorio de GitHub referenciado en la model card (no oficial, no verificado): https://github.com/Marek8118/maxon-zbrush-2026-cinema4d-redshift
- Sitio oficial de Maxon (via legitima para ZBrush, Cinema 4D y Redshift): https://www.maxon.net
