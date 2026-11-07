# okdohyuk/gemma-4-E2B-it-litert-lm

## Resumen

gemma-4-E2B-it-litert-lm es la version del modelo Gemma 4 E2B de Google empaquetada en formato LiteRT-LM, un contenedor optimizado para despliegue en dispositivos moviles, escritorio, IoT y web. El modelo base pertenece a la familia Gemma 4, construida por Google a partir de la misma investigacion y tecnologia empleada en los modelos Gemini. El repositorio analizado es un espejo fijado (pinned mirror) del original `litert-community/gemma-4-E2B-it-litert-lm`, publicado por el usuario okdohyuk, con un unico fichero de pesos `gemma-4-E2B-it.litertlm` de aproximadamente 2,6 GB.

La variante E2B esta disenada por Google para escenarios de borde (edge), con el objetivo de ofrecer rendimiento de nivel frontier en un tamano reducido. Segun la documentacion de Google AI Edge, los modelos E2B y E4B son los soportados actualmente por LiteRT-LM, mientras que las variantes mayores (26B A4B y 31B) se orientan a GPUs de consumo y estaciones de trabajo. El modelo esta ajustado para instrucciones (sufijo "it") y se presenta como adecuado para razonamiento, flujos agenticos, generacion de codigo y comprension multimodal.

La relevancia de este repositorio concreto es practica: ofrece los pesos en un formato listo para ejecucion en dispositivos sin necesidad de conversion adicional, verificado byte a byte contra el arbol original. No obstante, la informacion publica disponible sobre arquitectura interna, numero exacto de parametros, contexto y datos de entrenamiento es muy limitada en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, basada en tecnologia Gemini) |
| Parametros totales | no disponible (denominacion E2B, sin cifra oficial en las fuentes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados en formato .litertlm) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (segun la model card del espejo; el campo de licencia del repo figura como "other") |
| Formato de pesos | LiteRT-LM (.litertlm), fichero unico de aproximadamente 2,6 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en las fuentes consultadas. La documentacion de Google indica unicamente que la familia Gemma 4 se construye sobre la misma investigacion y tecnologia que los modelos Gemini, y que las variantes E2B y E4B estan optimizadas para despliegue en dispositivos de borde mediante LiteRT-LM. No se especifica si emplea un transformer denso, una arquitectura MoE u otra variante, ni se detallan el numero de tokens de entrenamiento, la composicion del dataset o las tecnicas de alineacion (RLHF, DPO) aplicadas.

El aspecto tecnico diferencial de este repositorio no es el entrenamiento, sino el empaquetado: LiteRT-LM es un runtime de Google para ejecutar modelos en Android, iOS, escritorio, IoT y web. El fichero `.litertlm` integra los pesos y los metadatos necesarios para la inferencia en estos entornos. El espejo ha sido verificado contra el arbol upstream mediante comprobaciones de sha256 en LFS y sha1 de blobs de git, lo que garantiza integridad byte a byte respecto al original.

## Capacidades

- Generacion de texto y razonamiento: la documentacion de Google posiciona la familia Gemma 4 como apta para razonamiento y comprension.
- Generacion de codigo: incluida explicitamente entre los casos de uso indicados por Google para la familia.
- Flujos agenticos: la documentacion menciona idoneidad para workflows agenticos.
- Comprension multimodal: la familia Gemma 4 se describe como multimodal, aunque no se detalla que modalidades cubre la variante E2B.
- Ajuste a instrucciones: el sufijo "it" indica un modelo afinado para seguir instrucciones.
- Despliegue en borde: ejecucion en Android, iOS, escritorio, IoT y web mediante LiteRT-LM.
- Tool calling / function calling: no disponible en las fuentes consultadas.
- Capacidades multilingues: no disponible en las fuentes consultadas.
- Modo thinking u otras capacidades especiales: no disponible en las fuentes consultadas.

## Casos de uso

- Asistentes integrados en aplicaciones moviles: el formato LiteRT-LM permite ejecutar el modelo en Android e iOS sin conexion a servidores, lo que resulta adecuado para asistentes de texto que deben funcionar offline y preservar la privacidad del usuario.
- Procesamiento en el dispositivo de notas y documentos: con un fichero de 2,6 GB, el modelo puede residir en el almacenamiento de un dispositivo moderno y realizar tareas de resumen o extraccion de informacion localmente.
- Funciones de accesibilidad en tiempo real: la inferencia local evita la latencia de red, lo que es util para descripcion de contenido, reescritura o simplificacion de texto en aplicaciones de accesibilidad.
- Automatizacion en IoT y dispositivos empotrados: LiteRT-LM esta orientado a estos entornos, de modo que el modelo puede ejecutar clasificacion o generacion de texto en dispositivos con recursos limitados.
- Prototipado rapido de aplicaciones de IA generativa en escritorio: el runtime de LiteRT-LM permite probar el modelo en Windows, macOS o Linux sin infraestructura de servidores GPU.
- Aplicaciones web con inferencia en el cliente: la documentacion de Google menciona soporte web, lo que habilita demos y herramientas que ejecutan el modelo en el navegador del usuario.
- Evaluacion comparativa de modelos de borde: al ser un espejo verificado, sirve como referencia reproducible para medir rendimiento de Gemma 4 E2B frente a otras alternativas en el mismo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 2,6 GB, por lo que el almacenamiento necesario para los pesos es de al menos esa cifra, mas el espacio de trabajo del runtime.
- VRAM estimada para inferencia: no disponible. Al estar orientado a moviles y dispositivos de borde, el modelo esta pensado para ejecutarse en memoria unificada o RAM del dispositivo, no exclusivamente en VRAM de GPU.
- GPU recomendadas: no disponible. La documentacion de Google no detalla requisitos de GPU para la variante E2B en LiteRT-LM.
- Compatibilidad con GPU de consumo: no disponible en las fuentes consultadas.
- Opciones de despliegue: LiteRT-LM (runtime oficial de Google AI Edge) en Android, iOS, escritorio, IoT y web. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| gemma-4-E2B-it-litert-lm | no disponible | no disponible | Apache-2.0 | LiteRT-LM (.litertlm) |
| gemma-4-E4B (variante mayor de la misma familia) | no disponible | no disponible | no disponible | LiteRT-LM |
| gemma-4-26B A4B | no disponible | no disponible | no disponible | no soportado aun en LiteRT-LM segun Google |
| gemma-4-31B | no disponible | no disponible | no disponible | no soportado aun en LiteRT-LM segun Google |

No se dispone de datos de rendimiento, contexto ni parametros exactos que permitan una comparacion cuantitativa con modelos de terceros de la misma categoria. La unica comparacion posible con la informacion consultada es interna a la familia Gemma 4.

## Limitaciones y advertencias

- La informacion publica sobre arquitectura, parametros, contexto e idiomas es practicamente inexistente en las fuentes consultadas, lo que dificulta evaluar su idoneidad para produccion.
- El repositorio es un espejo no oficial (publicado por un tercero, okdohyuk) del original de litert-community; aunque se declara verificado byte a byte, conviene usar el upstream como referencia canonica.
- El campo de licencia del repositorio figura como "other", mientras que la model card indica Apache-2.0. Esta discrepancia debe resolverse antes de un uso comercial, consultando la licencia original de Gemma 4.
- Riesgo de alucinacion: no cuantificado en las fuentes; aplicable el riesgo generico de los modelos de lenguaje.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto o idioma: no disponibles.
- El formato `.litertlm` esta ligado al runtime LiteRT-LM; no se confirma compatibilidad con ecosistemas como llama.cpp, vLLM u Ollama, lo que limita las opciones de despliegue en servidor.
- LiteRT-LM solo soporta actualmente las variantes E2B y E4B, segun Google; las variantes mayores quedan fuera de este runtime por ahora.

## Enlaces

- Repositorio analizado: https://huggingface.co/okdohyuk/gemma-4-E2B-it-litert-lm
- Repositorio original (upstream): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Documentacion de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
