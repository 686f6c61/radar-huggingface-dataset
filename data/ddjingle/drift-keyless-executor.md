# ddjingle/drift-keyless-executor

## Resumen

El repositorio `ddjingle/drift-keyless-executor` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado para Windows (un ejecutable `.exe` dentro de un `.zip` protegido con contrasena) que la model card describe como un "keyless executor" con funciones de inyeccion de scripts, sincronizacion de offsets y compatibilidad con APIs de tipo Drawing/hook. Los tags (`windows`, `windows-11`, `x64`, `portable`) confirman que el contenido es software de escritorio, no pesos de red neuronal.

La model card, ademas, esta redactada como pagina de descarga promocional: incluye insignias de descargas y rating no verificables, un enlace a un repositorio de GitHub de terceros (`RishabhJansen/drift-keyless-executor`) y una contrasena de descompresion fija. No se declara autoridad, dataset, arquitectura ni parametros. Por tanto, no existe informacion tecnica que permita evaluarlo como modelo.

Desde la perspectiva de un desarrollador o investigador, este repositorio debe tratarse como no evaluable y potencialmente riesgoso: un binario sin pipeline declarado, sin pesos, sin trazabilidad de entrenamiento y distribuido con instrucciones de ejecucion como administrador. La ficha siguiente refleja la ausencia de datos tecnicos y documenta los riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en `.zip` con `drift-keyless-executor-v1.2.0-win64.exe`) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura de red neuronal, dataset de entrenamiento, numero de tokens, proceso de RLHF/DPO ni innovacion tecnica de modelado. La model card describe componentes de software de escritorio: un "multi-instance attach", un "integrated script hub", "post-patch offset sync", "98%+ sUNC compatibility" (hookmetamethod, getgc, Drawing API), un "keyless execution flow" y un editor Monaco. Todos estos terminos pertenecen al ecosistema de ejecutores de scripts, no al entrenamiento de modelos.

No hay informacion sobre procedencia del binario, cadena de compilacion, firmas de codigo ni analisis de seguridad. El unico identificador tecnico mencionado es el build `v2.1.7` con firma `BEC848FF04`.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo o matematicas: no es un modelo de lenguaje.
- No dispone de tool calling ni function calling en el sentido de los LLM.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- Los metadatos declaran 14 idiomas, pero no hay evidencia de funcionalidad multilingue asociada a un modelo.
- La model card atribuye al binario funciones de inyeccion de scripts, polling a 219 Hz y 465 Hz, respuesta inferior a 30 ms en el editor Monaco y "98%+ sUNC compatibility"; estas afirmaciones no estan verificadas por terceros.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, porque no lo es.
- Auditoria de seguridad: analizar el binario en un entorno aislado para determinar comportamiento, llamadas de red y permisos solicitados antes de cualquier uso.
- Analisis de cadena de suministro: verificar la relacion entre el repositorio de Hugging Face `ddjingle/drift-keyless-executor` y el repositorio de GitHub `RishabhJansen/drift-keyless-executor` citado en la model card.
- Investigacion de campanas de distribucion: documentar patrones de model cards que promocionan ejecutables con contrasenas fijas y enlaces externos.
- Formacion en higiene de seguridad: usar el caso como ejemplo de repositorio que no debe ejecutarse en estaciones de trabajo de produccion.
- Denuncia o reporte a la plataforma: notificar a Hugging Face si el contenido incumple las politicas de alojamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (`96.3%`, `97.5%`, `219 Hz`, `465 Hz`, `< 30 ms`, `4.8/5`, `509K+`) son afirmaciones promocionales del autor sin metodologia, dataset ni verificacion independiente, y no constituyen benchmarks de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10/11 de 64 bits, con instrucciones de ejecucion como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: las cifras citadas por el autor no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Cualquier comparacion con LLM open source seria categoricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede integrarse en pipelines de inferencia.
- Riesgo de seguridad alto: distribucion de un `.exe` protegido por contrasena, con instrucciones para ejecutarlo como administrador y con enlaces de descarga alojados fuera de Hugging Face.
- Inconsistencia de metadatos: el nombre del archivo indica `v1.2.0` mientras el build declarado es `v2.1.7`; la contrasena del zip es fija (`2026`), lo que reduce la integridad del paquete.
- Ausencia de trazabilidad: no se declara autoridad, historial de commits, firmas de codigo ni analisis de malware.
- Posible infraccion de politicas de plataforma: las model cards de Hugging Face estan pensadas para modelos y datasets, no para promocionar ejecutables de terceros.
- Licencia MIT declarada, pero sin archivo LICENSE verificable en el repositorio y sin garantias implicitas.
- Afirmaciones no verificadas sobre compatibilidad y rendimiento que no deben citarse como evidencia tecnica.
- No usar en produccion, en entornos corporativos ni en maquinas con credenciales hasta completar una auditoria independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ddjingle/drift-keyless-executor
- Repositorio de GitHub citado en la model card: https://github.com/RishabhJansen/drift-keyless-executor
- Pagina de releases citada: https://github.com/RishabhJansen/drift-keyless-executor/releases/latest
- Enlace de descarga directa citado (no recomendado ejecutar): https://github.com/RishabhJansen/drift-keyless-executor/releases/latest/download/drift-keyless-executor-v1.2.0-win64.zip
- Paper, blog o demo: no disponible.
