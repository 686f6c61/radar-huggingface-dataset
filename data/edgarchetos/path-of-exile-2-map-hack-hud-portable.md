# EDGARCHETOS/path-of-exile-2-map-hack-hud-portable

## Resumen

El repositorio `EDGARCHETOS/path-of-exile-2-map-hack-hud-portable` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows distribuido como archivo comprimido (`dandys-world-forsaken-script-2026-v1.2.2-win64.zip`, 4,8 MB) que, segun su propia model card, ofrece funcionalidades de tipo "map hack", radar 2D, filtro de loot y suavizado de entrada para el videojuego Path of Exile 2. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes como en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi e id, aunque no se documenta ninguna capacidad linguistica real.

No existe informacion sobre arquitectura de red neuronal, parametros, contexto, pesos o proceso de entrenamiento. El contenido de la model card es material promocional de un ejecutable portatil para Windows 10 y Windows 11, con instrucciones para extraer el ZIP con contrasena "2026" y ejecutarlo como administrador. La publicacion tiene 0 descargas y 0 likes en el momento de la consulta, y fue creada el 24 de noviembre de 2026.

Desde la perspectiva de evaluacion de modelos, esta ficha debe leerse como una advertencia: el artefacto no es un modelo de lenguaje ni un sistema de IA open source, sino un binario de terceros sin trazabilidad tecnica verificable. Cualquier uso en produccion o investigacion queda fuera del alcance de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas del autor; sin evidencia de capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. El artefacto no es un modelo entrenado: la model card describe un programa externo en modo usuario para Windows que, segun el autor, realiza escaneo dinamico de offsets, suavizado de entrada tipo bezier, descarga con tecla de panico (`END`), renderizado mediante Desktop Duplication, perfiles JSON intercambiables en caliente y un radar 2D con filtro de loot.

Las afirmaciones tecnicas de la model card (tiempos de respuesta de menos de 28 ms, 374 Hz de sondeo, 8 hilos de trabajo, 97,9 % de consistencia) no vienen acompanadas de metodologia, codigo fuente ni artefactos reproducibles, por lo que no pueden verificarse. No hay repositorio de codigo, paper ni conjunto de datos asociado.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision propias de un modelo de IA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues reales; las etiquetas de idioma no estan respaldadas por evaluaciones.
- El autor describe funcionalidades de tipo HUD y radar para un videojuego, sin especificar interfaces, APIs ni formatos de integracion.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Evaluacion de riesgos de cadena de suministro: el artefacto puede utilizarse como caso de estudio para analizar como se distribuyen binarios de terceros con contrasenas en archivos ZIP y enlaces a repositorios ajenos.
- Analisis de seguridad defensiva: estudiar los indicadores de compromiso habituales en paquetes que solicitan ejecucion como administrador y desactivacion de alertas de SmartScreen.
- Formacion en higiene de dependencias: ilustrar por que no debe ejecutarse software sin trazabilidad de codigo fuente en entornos corporativos.
- Investigacion sobre contaminacion de plataformas de modelos: documentar la presencia de artefactos no relacionados con IA en Hugging Face y sus implicaciones para la curacion de datasets y registros.
- Auditoria de licencias: revisar como una licencia MIT puede aplicarse a un binario sin codigo fuente visible y que obligaciones genera.
- Docencia sobre ingenieria social: analizar tecnicas de promocion (insignias de descargas y valoraciones no verificables) empleadas en la model card.

No se recomienda su uso para ninguna tarea de desarrollo, atencion al cliente, generacion de codigo, analisis de datos ni despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (menos de 28 ms, 374 Hz, 97,9 % de consistencia, 591K descargas, valoracion 4,9/5) no son benchmarks de modelos ni estan respaldadas por metodologia verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11, arquitectura x64.
- Opciones de despliegue: el autor indica extraer el ZIP y ejecutar el `.exe` como administrador; no se documentan contenedores, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma verificable.
- Espacio en disco: 4,8 MB para el archivo comprimido, segun la model card.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de contraste, se indican a continuacion modelos reales de la misma plataforma con fichas tecnicas completas:

| Criterio | Este artefacto | Modelo de IA tipico en Hugging Face |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos de red neuronal |
| Parametros | no disponible | Documentados (p. ej., 7B, 70B) |
| Contexto | no disponible | Documentado en tokens |
| Pesos | No incluidos | safetensors, GGUF, etc. |
| Evaluacion | Sin benchmarks | Benchmarks publicados |
| Reproducibilidad | Nula (sin codigo fuente) | Alta (pesos y recetas) |

## Limitaciones y advertencias

- El artefacto no es un modelo de IA; tratarlo como tal en pipelines, catalogos o evaluaciones constituye un error de clasificacion.
- No hay codigo fuente, hash verificable ni firma digital del binario; la trazabilidad es nula.
- La model card incluye enlaces a repositorios de terceros (`tscott430`, `pedrolong1343`) que no coinciden con el autor declarado, lo que sugiere posible suplantacion o redistribucion no autorizada.
- Se solicita ejecutar el `.exe` como administrador y se ofrecen instrucciones para eludir alertas de Windows Defender y SmartScreen, practica de alto riesgo.
- El uso de software de este tipo en videojuegos puede violar los terminos de servicio del juego y acarrear suspensiones de cuenta; ademas, puede infringir derechos de terceros.
- La licencia MIT se declara sobre un binario sin codigo fuente, lo que limita su aplicabilidad juridica y no garantiza ausencia de componentes maliciosos.
- Riesgo elevado de alucinacion en el sentido documental: las cifras de descargas, valoracion y rendimiento no son verificables.
- No debe desplegarse en entornos corporativos, de investigacion ni de produccion bajo ninguna circunstancia.

## Enlaces

- Hugging Face: https://huggingface.co/EDGARCHETOS/path-of-exile-2-map-hack-hud-portable
- Repositorio citado en la model card (tercero, no verificado): https://github.com/tscott430/path-of-exile-2-map-hack-hud-portable
- Repositorio de descarga citado en la model card (tercero, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- Paper: no disponible
- Blog o demo: no disponible
