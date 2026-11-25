# Ksmit79/the-planet-crafter-cheat-trainer

## Resumen

El repositorio `Ksmit79/the-planet-crafter-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de tipo "trainer" (herramienta de trucos o modificación) para el videojuego *The Planet Crafter*, distribuido como archivo ejecutable para Windows 10/11 de 64 bits. La model card describe un binario denominado `solara-executor-v3-keyless-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB, con instrucciones de instalación, una contraseña de descompresión y módulos de funcionalidad orientados a la modificación del juego (overlay externo, radar 2D, filtro de objetos, escáner de offsets y tecla de descarga de pánico).

No existe información sobre arquitectura de red neuronal, parámetros, longitud de contexto, datos de entrenamiento ni proceso de alineación. El repositorio no declara pipeline de Hugging Face, no tiene descargas ni interacciones, y su contenido no se corresponde con la categoría de modelos de lenguaje o multimodal que esta ficha está diseñada para cubrir. Los tags declarados (windows, portable, cheat-trainer) confirman la naturaleza del artefacto.

Desde el punto de vista de un desarrollador o investigador que evalúe modelos, este repositorio debe descartarse como candidato: no es un modelo, no ofrece pesos, no permite inferencia y su contenido apunta a software de terceros distribuido mediante enlaces externos a GitHub. La ficha se completa a continuación con los campos obligatorios, indicando "no disponible" en todos aquellos datos que no aplican o no se han publicado, y con las advertencias de seguridad correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red, datos de entrenamiento, número de tokens, composición del corpus ni técnicas de alineación (RLHF, DPO u otras). El repositorio no contiene pesos de modelo ni código de inferencia. La model card describe únicamente un binario de Windows (`solara-executor-v3-keyless-v1.2.2-win64.exe`, build `v4.7.1` / `A92081`) con módulos de modificación de juego: overlay externo a 144 Hz, perfiles JSON intercambiables en caliente, radar 2D con filtro de objetos por rareza, núcleo en modo usuario sin hooks de DLL, escáner dinámico de offsets con sondeo a 412 Hz y tecla de descarga de pánico (`END`). Ninguno de estos elementos constituye un sistema de aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües en el sentido de procesamiento de lenguaje natural; los idiomas listados en los metadatos son etiquetas del repositorio.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad cognitiva.
- El artefacto descrito en la model card es un ejecutable de terceros para Windows que, según el autor, modifica el comportamiento del juego *The Planet Crafter*.

## Casos de uso

- No aplica: el repositorio no contiene un modelo de IA que pueda integrarse en aplicaciones de procesamiento de lenguaje, visión, código o agentes.
- No aplica: no es posible desplegarlo en servidores de inferencia (vLLM, TGI, llama.cpp, Ollama) porque no hay pesos ni arquitectura de red.
- No aplica: no sirve para generación de código en producción, atención al cliente, análisis documental, resumen, traducción automática ni búsqueda semántica.
- No aplica: no es adecuado para investigación en IA, evaluación de benchmarks ni ajuste fino supervisado.
- No aplica: no puede utilizarse como base para RAG ni para sistemas de pregunta-respuesta.
- Uso potencial declarado por el autor (fuera del ámbito de esta ficha): modificación del videojuego *The Planet Crafter* en Windows 10/11 de 64 bits mediante el ejecutable distribuido externamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque no se trata de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que inferir).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles.
- Requisito declarado por el autor: sistema operativo Windows 10/11 de 64 bits y ejecución del binario como administrador.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Los artefactos de la misma categoría (ejecutables de modificación de juegos para Windows) quedan fuera del alcance de esta ficha técnica de modelos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no debe evaluarse ni citarse como tal en comparativas de modelos.
- Riesgo de seguridad elevado: la model card distribuye un ejecutable de Windows a través de enlaces externos a GitHub, con contraseña de descompresión (`2026`) y solicitud de ejecución como administrador. Este patrón es habitual en campañas de distribución de software no verificado y potencialmente malicioso.
- No hay verificación de integridad, firma de código ni análisis de malware publicado.
- La licencia MIT declarada en los metadatos no garantiza la seguridad ni la legalidad del binario distribuido.
- Uso comercial: no aplica como modelo; el uso del ejecutable puede infringir los términos de servicio del videojuego y la legislación sobre modificación de software.
- Sesgos y alucinaciones: no aplica, al no existir un modelo generativo.
- Idiomas: las etiquetas de idioma del repositorio no implican capacidades de procesamiento lingüístico.
- Se recomienda no descargar ni ejecutar el binario en entornos de producción o personales sin un análisis previo en una máquina aislada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ksmit79/the-planet-crafter-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, externo): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Repositorio citado en la model card (GitHub, externo): https://github.com/ThijsMoreau6699/the-planet-crafter-cheat-trainer/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
