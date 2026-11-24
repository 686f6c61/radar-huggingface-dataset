# Linerist/arc-raiders-cheat-esp-radar-v2

## Resumen

`Linerist/arc-raiders-cheat-esp-radar-v2` no es un modelo de inteligencia artificial ni un artefacto de aprendizaje automatico. Es un repositorio alojado en Hugging Face que, segun su propia model card, distribuye un supuesto paquete ejecutable para Windows x64 etiquetado como "cheat ESP radar" para el videojuego Arc Raiders. El contenido descrito incluye un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe`, un archivo ZIP protegido con contrasena y una capa de overlay grafico (cajas 2D/3D, esqueletos de huesos, radar y filtrado de botin) presentada como herramienta externa en modo usuario.

El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los metadatos de Hugging Face no declaran `pipeline_tag`, el numero de descargas y likes es cero, y no existe documentacion tecnica sobre entrenamiento, datos o evaluacion. La model card mezcla enlaces a repositorios de GitHub de terceros, referencias a un "macro de pesca" ajeno (`fisch-script-auto-catch-macro`) y contadores de descargas y valoraciones no verificables, lo que apunta a una plantilla de distribucion de software, no a un modelo.

Su relevancia para desarrolladores e investigadores es nula en el plano de la IA. Resulta relevante unicamente como caso de estudio de riesgo: un artefacto alojado en una plataforma de modelos que distribuye ejecutables de dudosa procedencia, con instrucciones para desactivar advertencias de seguridad de Windows y ejecutar como administrador. No debe tratarse como modelo ni ejecutarse en entornos de produccion o investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como overlay externo en modo usuario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos, no capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un componente ejecutable externo ("user-mode external core") que renderizaria mediante Desktop Duplication sin inyectar DLLs, con un overlay a 144 Hz o mas, radar 2D, filtrado de botin por rareza, suavizado de entrada tipo Bezier y perfiles JSON intercambiables en caliente. Son afirmaciones de marketing sin especificacion tecnica, sin codigo fuente verificable y sin trazabilidad de compilacion; el binario se distribuye empaquetado y protegido con contrasena.

No hay datos sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de inferencia. Cualquier afirmacion sobre rendimiento (tiempos de respuesta en milisegundos, uso de RAM por debajo de 30 MB o 62 MB, numero de hilos) proviene exclusivamente del texto promocional del autor y no es verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de procesamiento de lenguaje natural.
- El artefacto descrito afirma ofrecer overlay grafico (cajas 2D/3D, esqueletos, distancia), radar 2D, filtrado de botin y suavizado de punteria sobre el juego Arc Raiders.
- No se ha publicado ninguna evaluacion independiente de dichas capacidades.

## Casos de uso

- Ninguno legitimo en el ambito de IA, desarrollo de software o investigacion.
- Auditoria de seguridad: analizar el repositorio como ejemplo de distribucion de ejecutables no verificados en plataformas de modelos, revisando el patron de enlaces externos, contrasenas en la model card y peticiones de ejecucion como administrador.
- Formacion en higiene de cadena de suministro: usar la ficha como caso practico de por que no se deben ejecutar binarios descargados de repositorios sin reputacion ni firmas.
- Monitorizacion de plataformas: emplear el caso para justificar politicas de moderacion que detecten artefactos que no son modelos (cheats, cracks, malware) en hubs de modelos.
- Documentacion de riesgos: citar el ejemplo en guias internas sobre verificacion de procedencia de artefactos antes de integrarlos en pipelines.
- No se recomienda su uso para jugar, automatizar tareas ni integrarlo en ningun sistema, por riesgo de seguridad y por incumplimiento de los terminos de servicio del videojuego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ningun otro tipo, porque el artefacto no es un modelo evaluable. Las cifras de la model card (descargas, valoracion, tamano, tiempos) son declaraciones del autor sin verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

| Criterio | `Linerist/arc-raiders-cheat-esp-radar-v2` | Modelo de IA tipico en Hugging Face | Herramienta legitima de accesibilidad o captura |
|---|---|---|---|
| Naturaleza | Ejecutable empaquetado para Windows | Pesos y configuracion de red neuronal | Software con codigo o binarios firmados |
| Parametros | no disponible | Declarados en la model card | no aplica |
| Contexto | no disponible | Declarado | no aplica |
| Rendimiento medible | no disponible | Benchmarks publicados | no aplica |
| Licencia | MIT (declarada) | Variable | Variable |
| Disponibilidad | Repositorio con 0 descargas y 0 likes | Amplia | Amplia |
| Verificabilidad | Nula (binario con contrasena, enlaces a terceros) | Alta si hay paper y repo | Alta si hay firma y auditoria |

No se identifican modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y evaluacion; tratarlo como tal es un error categorico.
- Riesgo de seguridad alto: la model card pide ejecutar un `.exe` como administrador, desactivar advertencias de SmartScreen y Defender, y extraer un ZIP protegido con contrasena; es un patron habitual de distribucion de malware.
- Enlaces a repositorios de GitHub de terceros no relacionados con el autor declarado, lo que sugiere suplantacion o reutilizacion de plantillas.
- Cero descargas y cero likes en el momento de la consulta: sin senales de reputacion ni comunidad.
- Uso contra los terminos de servicio de Arc Raiders y potencialmente contra la legislacion de proteccion de consumidores o de ciberseguridad segun jurisdiccion.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su legalidad; la licencia se aplica a los metadatos del repositorio, no a un software auditado.
- No debe integrarse en pipelines de produccion, entornos corporativos ni maquinas con datos sensibles.
- Cualquier afirmacion de rendimiento del autor (menos de 10 ms, menos de 30 MB de RAM, 144 Hz) es no verificada y no debe citarse como dato tecnico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Linerist/arc-raiders-cheat-esp-radar-v2
- Enlace de descarga citado en la model card: https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub citado: https://github.com/riccardot78/arc-raiders-cheat-esp-radar-v2
- Repositorio de GitHub citado: https://github.com/ekaterina96522/fisch-script-auto-catch-macro
