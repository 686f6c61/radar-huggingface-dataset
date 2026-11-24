# Hisohkoyage/hummingbot-v2-dex-cex-market-maker

## Resumen

La ficha solicitada corresponde al identificador `Hisohkoyage/hummingbot-v2-dex-cex-market-maker` alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de IA ni de un artefacto de aprendizaje automatico: es un paquete ejecutable para Windows x64 (fichero ZIP de 8,9 MB con contrasena) que se distribuye a traves de un repositorio de GitHub de terceros y que se presenta como una herramienta de market making para exchanges centralizados y descentralizados. El repositorio de Hugging Face no contiene pesos, configuraciones de transformer, tokenizador ni ningun artefacto propio de un modelo de lenguaje.

El contenido de la model card describe modulos de firma local de claves, copia de operaciones de carteras, filtros antirrobo (honeypot), bundling de transacciones con Lookup Tables, motor de bundles Jito/MEV y un entorno de simulacion (paper trading). Todos estos elementos son funcionalidades propias de un bot de trading, no de un modelo de IA. El identificador se ha publicado con etiquetas de idioma y licencia MIT, pero no incluye ningun dato sobre arquitectura de red neuronal, parametros, contexto, cuantizacion ni formato de pesos.

Por tanto, esta ficha documenta el artefacto tal y como aparece publicado y advierte de que no es evaluable como modelo de IA. Cualquier uso en produccion como modelo de lenguaje, agente o sistema de razonamiento no es posible con el contenido disponible. Se recomienda precaucion maxima: la distribucion de ejecutables de trading con contrasena fija y enlaces a repositorios de GitHub ajenos al proyecto original de Hummingbot es un patron habitual en campanas de malware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, sin validacion tecnica) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este identificador. La model card describe un conjunto de modulos de software de trading: almacen de claves AES-256 local, copia de operaciones de carteras, filtro de honeypots previo a la compra, bundler de 20 carteras mediante Lookup Tables, motor de bundles Jito/MEV y sandbox de paper trading. Ninguno de estos componentes implica un modelo entrenado con datos, ni un corpus, ni tecnicas de RLHF o DPO.

No se declara numero de tokens de entrenamiento, composicion del dataset, innovaciones de inferencia (decodificacion especulativa, atencion lineal, MoE) ni ningun otro elemento propio de un modelo fundacional. El paquete se presenta como build `v4.8.7` con identificador interno `8A8642` y un tamano de 8,9 MB, coherente con un instalador o conjunto de scripts, no con pesos de un modelo.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Las etiquetas multilingues (14 idiomas) no van acompanadas de ninguna evaluacion ni de un tokenizador verificable.
- La model card atribuye al paquete funciones de trading: firma local de claves, copia de carteras, filtro de honeypots, bundling multi-cartera, motor de bundles Jito/MEV y simulacion de estrategias.
- No hay modo thinking, ni vision, ni audio, ni ninguna capacidad propia de un modelo de IA.

## Casos de uso

- Evaluacion como modelo de lenguaje: no aplicable. El artefacto no contiene pesos ni tokenizador, por lo que no puede ejecutar inferencia de texto, codigo o razonamiento.
- Integracion en pipelines de IA: no aplicable. No expone API de modelo, ni servidor compatible con OpenAI, ni formato GGUF/safetensors.
- Investigacion en IA open source: no aplicable como modelo; unicamente podria estudiarse como ejemplo de publicacion atipica en Hugging Face.
- Analisis de seguridad: el paquete puede emplearse como caso de estudio de distribucion de ejecutables con contrasena fija y enlaces externos, patron habitual en campanas de malware.
- Auditoria de cadena de suministro: util para revisar como se etiquetan artefactos no-modelo en Hugging Face y que riesgos introduce la confusion de categorias.
- Formacion sobre higiene de repositorios: sirve como ejemplo de por que conviene verificar el origen de un artefacto antes de ejecutarlo en un entorno de produccion.
- No se recomienda ningun caso de uso operativo con el ejecutable distribuido, dado que no procede del proyecto oficial de Hummingbot y no se puede verificar su integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento interno del supuesto software (por ejemplo, tiempos de respuesta inferiores a 10 ms o 6 ms, consistencia del 98,3 % o 99,7 %, uso de menos de 21 MB de RAM), pero no son benchmarks de un modelo de IA ni se pueden verificar con la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, no es un modelo de IA.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles como modelo; la model card declara cifras internas del software de trading sin verificacion independiente.
- Requisitos declarados del artefacto: Windows 10 u 11 de 64 bits, descompresion con 7-Zip o WinRAR usando la contrasena `2026`, y ejecucion como administrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hisohkoyage/hummingbot-v2-dex-cex-market-maker | no disponible | no disponible | Paquete ejecutable Windows (ZIP + EXE) | MIT (declarada) | Hugging Face, 0 descargas |
| Hummingbot oficial (proyecto open source) | no aplicable | no aplicable | Software de market making en Python | Apache 2.0 (proyecto original) | GitHub oficial de Hummingbot |
| Modelo de lenguaje open source de proposito general | variable | variable | Pesos safetensors/GGUF | variable | Hugging Face |

La comparacion con modelos de IA no es posible porque el artefacto no es un modelo. Frente al proyecto oficial de Hummingbot, la diferencia principal es el canal de distribucion: el proyecto original se distribuye como codigo fuente auditable, mientras que este paquete llega como ejecutable precompilado con contrasena fija y enlace a un repositorio de GitHub de terceros.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuracion de arquitectura ni capacidad de inferencia.
- El ejecutable se distribuye como ZIP con contrasena fija (`2026`) y enlace a un repositorio de GitHub de un usuario distinto al proyecto oficial de Hummingbot, lo que impide verificar su procedencia e integridad.
- La model card incluye afirmaciones no verificables (descargas de 597K+, valoracion 4,9/5, porcentajes de consistencia) que no se corresponden con las 0 descargas y 0 likes registrados en Hugging Face.
- No se puede confirmar que el binario realice las funciones que declara; ejecutarlo como administrador en un equipo de produccion implica un riesgo elevado de seguridad.
- La licencia MIT se declara sobre el identificador, pero no cubre necesariamente el binario distribuido desde un repositorio externo.
- Las etiquetas multilingues no implican soporte real de esos idiomas en ninguna capacidad funcional.
- Riesgo de confusion en busquedas: el nombre puede llevar a confundir este artefacto con el proyecto oficial Hummingbot o con un modelo de lenguaje.
- No apto para uso en produccion, atencion al cliente, generacion de codigo ni ninguna tarea de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/hummingbot-v2-dex-cex-market-maker
- Repositorio de GitHub enlazado en la model card (terceros, no oficial): https://github.com/FahuhoSifa70/hummingbot-v2-dex-cex-market-maker
- Descarga directa referenciada en la model card (ZIP con contrasena): https://github.com/FahuhoSifa70/hummingbot-v2-dex-cex-market-maker/releases/latest/download/hummingbot-v2-dex-cex-market-maker-v1.2.0-win64.zip
- Proyecto oficial de Hummingbot (referencia para comparar): https://github.com/hummingbot/hummingbot
- Documentacion oficial de Hummingbot: https://hummingbot.org/
